import { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import Button from '../../../components/Button';
import OtpModal from '../../../components/otpModal/OtpModal.js';
// import ModalRenders from "../../../components/ModalRenders";
import { GENERATE_OTP_URL, NC_STATUS_CODE } from '../../../_config/app.config';
import { StoreContext } from '../../../utils/StoreProvider';
import { UserContext } from '../../../reducer/userReducer';
import useForm from '../../../hooks/useForm';
import useFetch from '../../../hooks/useFetch';

const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
	background: ${({ theme }) => theme.themeColor1};
`;

const Colom2 = styled.div`
	width: 30%;
	background: ${({ theme }) => theme.themeColor1};
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
		color: blue;
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

// const link = "https://media-public.canva.com/uClYs/MAED4-uClYs/1/s.svg";

export default function IdentityVerification({ productDetails, nextFlow }) {
	const {
		state: { whiteLabelId }
	} = useContext(StoreContext);

	const {
		state: { userId },
		actions: { setUserId, setUserDetails }
	} = useContext(UserContext);

	const { newRequest } = useFetch();
	const { register, handleSubmit, formState } = useForm();

	const history = useHistory();

	const [toggleModal, setToggleModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [accountAvailable, setAccountAvailable] = useState(false);

	const [errorMessage, setErrorMessage] = useState('');

	const onSubmit = async ({ customerId, mobileNo }) => {
		setToggleModal(true);
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
					white_label_id: whiteLabelId
				}
			});

			const response = otpReq.data;

			if (response.statusCode === NC_STATUS_CODE.serverError) {
				setErrorMessage(response.message);
				setAccountAvailable(false);
			}

			if (response.statusCode === NC_STATUS_CODE.success) {
				setAccountAvailable(true);
				setUserId(response.userId);
			}
		} catch (error) {
			console.error(error);
			setErrorMessage('Invalid Data Given');
		}

		setLoading(false);
	};

	const onClose = () => {
		setToggleModal(false);
	};

	const onProceed = () => {
		history.push(nextFlow);
	};

	return (
		productDetails && (
			<>
				<Colom1>
					<H>
						Help us with your <span>Identity Verification</span>
					</H>
					<form onSubmit={handleSubmit(onSubmit)}>
						<FieldWrapper>
							{register({
								name: 'mobileNo',
								placeholder: 'Enter Mobile Number',
								mask: {
									NumberOnly: true,
									CharacterLimit: 10
								}
							})}
						</FieldWrapper>
						<H2>or</H2>
						<FieldWrapper>
							{register({
								name: 'customerId',
								placeholder: 'Use Customer ID to Login'
							})}
						</FieldWrapper>
						<Button
							type='submit'
							name='Login'
							fill='blue'
							disabled={
								!(formState.values?.customerId || formState.values?.mobileNo) ||
								(formState.values?.customerId && formState.values?.mobileNo)
							}
						/>
					</form>
				</Colom1>
				<Colom2>
					<Img src={productDetails.imageUrl} alt='Loan Caption' />
				</Colom2>
				{toggleModal && <div>toggle</div>}
				{toggleModal && (
					<OtpModal
						loading={loading}
						accountAvailable={accountAvailable}
						resend={onSubmit}
						toggle={onClose}
						onProceed={onProceed}
						mobileNo={formState.values?.mobileNo}
						customerId={formState.values?.customerId}
						show={toggleModal}
						userId={userId}
						setUserDetails={setUserDetails}
					/>
				)}
				{/* {(!bankStatus || bankStatus === "NC500") && (
          <ModalRenders
            show={toggleModal}
            toggle={onClose}
            link={link}
            message={errorMessage}
          />
        )} */}
			</>
		)
	);
}
