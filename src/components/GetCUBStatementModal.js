import { useState, useEffect, useContext, useRef } from 'react';
import styled from 'styled-components';

import cubLogo from '../assets/bankLogos/cub.png';

import Loading from '../components/Loading';
import {
	CUB_ACCOUNT_MINI_STATEMENT,
	NC_STATUS_CODE,
	GENERATE_OTP_URL,
	//USER_ROLES,
	BANK_TOKEN_API,
} from '../_config/app.config';
import { AppContext } from '../reducer/appReducer';
import { UserContext } from '../reducer/userReducer';
import useFetch from '../hooks/useFetch';
import useForm from '../hooks/useForm';
import { useToasts } from '../components/Toast/ToastProvider';
import Modal from './Modal';
import Button from './Button';
import OtpModal from '../components/OtpModal/OtpModal';

const FieldWrapper = styled.div`
	padding: 20px 0;
`;

const H2 = styled.h2`
	text-align: center;
	font-weight: 500;
`;

const BankLogo = styled.img`
	width: 50px;
	height: 50px;
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 20px 0;
`;

export default function GetCUBStatementModal({
	onClose,
	userType,
	setOtherUserTypeDetails,
}) {
	const [loading, setLoading] = useState(true);
	const [toggleModal, setToggleModal] = useState(false);
	const [toggleOtpModal, setToggleOtpModal] = useState(false);
	const bankTokenRef = useRef();
	const [userId, setUserId] = useState('');

	const [accountAvailable, setAccountAvailable] = useState(false);

	const [error, setError] = useState(null);

	const { register, handleSubmit, formState } = useForm();

	const {
		state: { whiteLabelId, clientToken },
	} = useContext(AppContext);

	const { addToast } = useToasts();

	const { response, newRequest } = useFetch({
		url: BANK_TOKEN_API,
		options: {
			method: 'POST',
			data: {
				type: 'BANK',
				linkRequired: false,
				isEncryption: false,
			},
		},
		headers: {
			Authorization: clientToken,
		},
	});

	const {
		state: { userAccountToken },
	} = useContext(UserContext);

	useEffect(() => {
		async function getBankToken() {
			if (response.statusCode === NC_STATUS_CODE.NC200) {
				bankTokenRef.current = {
					bankToken: response.generated_key,
					requestId: response.request_id,
				};
				if (!userType) {
					await fetchData(userAccountToken);
					setOtherUserTypeDetails(bankTokenRef.current);
					onClose(true);
				} else {
					setToggleModal(true);
				}
				setLoading(false);
				return;
			}
		}

		if (response) getBankToken();
		return () => {};
		// eslint-disable-next-line
	}, [response]);

	async function fetchData(token) {
		try {
			const req = await newRequest(
				CUB_ACCOUNT_MINI_STATEMENT,
				{ method: 'POST', data: { accToken: token } },
				{ Authorization: bankTokenRef.current.bankToken }
			);

			const res = req.data;
			if (res.statusCode === NC_STATUS_CODE.NC200) {
				addToast({
					message: 'CUB Bank Statement Fetch Successfull',
					type: 'success',
				});
				// console.log("Success Message");
			} else {
				setError(res.message);
			}
		} catch (error) {
			console.error('Something Went Wrong Try Again Later');
		}
	}

	const onSubmit = async ({ customerId, mobileNo }) => {
		setToggleModal(false);
		setLoading(true);

		if (!customerId && !mobileNo) {
			return;
		}

		if (customerId && mobileNo) {
			return;
		}

		try {
			const otpReq = await newRequest(GENERATE_OTP_URL, {
				method: 'POST',
				data: {
					mobileNo,
					customerId,
					white_label_id: whiteLabelId,
				},
			});

			const response = otpReq.data;

			if (response.statusCode === NC_STATUS_CODE.NC500) {
				setError(response.message);
				setAccountAvailable(false);
			}

			if (response.statusCode === NC_STATUS_CODE.NC200) {
				setAccountAvailable(true);
				setUserId(response);
				setToggleOtpModal(true);
			}
		} catch (error) {
			console.error(error);
			setError('Invalid Data Given');
		}

		setLoading(false);
	};

	const onProceed = async userTypeDetails => {
		setLoading(true);
		setToggleOtpModal(false);
		setToggleModal(false);

		await fetchData(userTypeDetails.userAccountToken);

		setOtherUserTypeDetails({
			// ...userTypeDetails,
			...bankTokenRef.current,
		});

		setLoading(false);
		onClose(true);
	};

	return (
		<>
			<Modal show={!toggleModal} onClose={onClose} width='50%'>
				<Loading />
			</Modal>
			<Modal show={toggleModal} onClose={onClose} width='50%'>
				{loading ? (
					<Loading />
				) : (
					<Wrapper>
						<BankLogo src={cubLogo} alt={'cub_bank_logo'} loading='lazy' />
						<form onSubmit={handleSubmit(onSubmit)}>
							<FieldWrapper>
								{register({
									name: 'mobileNo',
									placeholder: 'Enter Mobile Number',
									mask: {
										NumberOnly: true,
										CharacterLimit: 10,
									},
									value: formState?.values?.mobileNo,
								})}
							</FieldWrapper>
							<H2>or</H2>
							<FieldWrapper>
								{register({
									name: 'customerId',
									placeholder: 'Use Customer ID to Login',
									value: formState?.values?.customerId,
								})}
							</FieldWrapper>
							<Button
								type='submit'
								name='LOGIN'
								fill
								disabled={
									!(
										formState.values?.customerId || formState.values?.mobileNo
									) ||
									(formState.values?.customerId && formState.values?.mobileNo)
								}
							/>
						</form>
					</Wrapper>
				)}
			</Modal>
			{toggleOtpModal && (
				<OtpModal
					loading={loading}
					setLoading={setLoading}
					accountAvailable={accountAvailable}
					setAccountAvailable={setAccountAvailable}
					resend={onSubmit}
					toggle={onClose}
					onProceed={onProceed}
					show={toggleOtpModal}
					userId={userId}
					errorMessage={error}
				/>
			)}
		</>
	);
}
