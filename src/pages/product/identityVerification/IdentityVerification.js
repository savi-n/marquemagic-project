import { useState, useContext } from 'react';
import { func, object, oneOfType, string } from 'prop-types';
import styled from 'styled-components';

import Button from '../../../components/Button';
import OtpModal from '../../../components/OtpModal/OtpModal';
import { GENERATE_OTP_URL, NC_STATUS_CODE } from '../../../_config/app.config';
import { AppContext } from '../../../reducer/appReducer';
import { UserContext } from '../../../reducer/userReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import useForm from '../../../hooks/useForm';
import useFetch from '../../../hooks/useFetch';
import { useToasts } from '../../../components/Toast/ToastProvider';

const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
`;

const Colom2 = styled.div`
	width: 30%;
`;

const Img = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	object-position: center;
`;

const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const FieldWrapper = styled.div`
	padding: 20px 0;
	width: 50%;
`;

const H2 = styled.h2`
	width: 50%;
	text-align: center;
	font-weight: 500;
`;

export default function IdentityVerification({
	productDetails,
	map,
	onFlowChange,
	id,
}) {
	const {
		state: { whiteLabelId },
	} = useContext(AppContext);

	const {
		actions: { setUserDetails },
	} = useContext(UserContext);

	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const { newRequest } = useFetch();
	const { register, handleSubmit, formState } = useForm();

	const { addToast } = useToasts();

	const [toggleModal, setToggleModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [accountAvailable, setAccountAvailable] = useState(false);
	const [userId, setUserId] = useState('');

	const [errorMessage, setErrorMessage] = useState('');

	const onSubmit = async ({ customerId, mobileNo }) => {
		if (!customerId && !mobileNo) {
			return;
		}

		setToggleModal(true);
		setLoading(true);

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

			if (
				[NC_STATUS_CODE.NC500, NC_STATUS_CODE.NC305].includes(
					response.statusCode
				)
			) {
				setErrorMessage(response.message);
				setAccountAvailable(false);
			} else if (response.statusCode === NC_STATUS_CODE.NC200) {
				setAccountAvailable(true);
				setUserId(response);
			} else {
				setToggleModal(false);
				addToast({
					message: response.message,
					type: 'error',
				});
			}
		} catch (error) {
			console.error(error);
			addToast({
				message: 'Something Went Wrong. Try Again!',
				type: 'error',
			});
			setErrorMessage('Invalid Data Given');
		}

		setLoading(false);
	};

	const onClose = () => {
		setToggleModal(false);
	};

	const onProceed = () => {
		setCompleted(id);
		onFlowChange(map.main);
	};

	return (
		productDetails && (
			<>
				<Colom1>
					<H>
						Help us with <span>your Identity Verification</span>
					</H>
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
								!(formState.values?.customerId || formState.values?.mobileNo) ||
								(formState.values?.customerId && formState.values?.mobileNo)
							}
						/>
					</form>
				</Colom1>
				<Colom2>
					{/* <Img src={productDetails.productDetailsImage} alt="Loan Caption" /> */}
				</Colom2>
				{toggleModal && (
					<OtpModal
						loading={loading}
						setLoading={setLoading}
						accountAvailable={accountAvailable}
						setAccountAvailable={setAccountAvailable}
						resend={onSubmit}
						toggle={onClose}
						onProceed={onProceed}
						show={toggleModal}
						userId={userId}
						errorMessage={errorMessage}
						setUserDetails={setUserDetails}
					/>
				)}
			</>
		)
	);
}

IdentityVerification.propTypes = {
	productDetails: object,
	onFlowChange: func.isRequired,
	map: oneOfType([string, object]),
	id: string,
};
