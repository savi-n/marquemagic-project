/* This section contains modal/popup onClick of proceed with the selected customer.
  This section also contains resend otp option */

import { useEffect, useState } from 'react';
import axios from 'axios';
// import { useDispatch } from 'react-redux';
import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from 'components/Button';
import CustomerVerificationOTPInput from './CustomerVerificationOTPInput';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { RESEND_OTP_TIMER, DDUPE_VERIFY_OTP } from '_config/app.config';
import RedError from 'assets/icons/Red_error_icon.png';
import { useSelector } from 'react-redux';
import * as UI from '../ui';

// const ModalHeader = styled.div`
// 	position: relative;
// 	padding: 20px;
// 	display: flex;
// 	flex-direction: column;
// 	justify-content: space-between;
// 	align-items: center;
// 	margin: auto;
// 	//background-color: #eeeef7;
// 	font-weight: 600;
// 	color: #525252;
// `;

const ModalBody = styled.div`
	padding: 30px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	margin: auto;
	font-size: 13px;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: center;
	gap: 50px;
	margin-bottom: 20px;
`;

const ModalWrapper = styled.div`
	margin-top: 20px;
`;

const ModalErrorMessage = styled.div`
	color: red;
	text-align: center;
	font-size: 12px;
`;
const ModalResentOtp = styled.div`
	text-align: center;
	padding-bottom: 10px;
	font-size: 11px;
	margin-top: 10px;
`;

// const OtpMobileMessage = styled.p`
// 	font-size: 22px;
// 	text-align: center;
// 	@media (max-width: 700px) {
// 		font-size: 18px;
// 	}
// `;

const ImgStyle = styled.img`
	width: 26px;
	display: inline-block;
	margin-right: 10px;
`;

const ModalHeader = styled.span`
	font-weight: 600;
	font-size: 30px;
	line-height: 54px;
	text-align: center;
	display: flex;
	justify-content: center;
	color: #4e4e4e;
	//marginBottom: '30px',
`;

const ModalSubHeader = styled.span`
	//font-weight: 600;
	font-size: 15px;
	//line-height: 54px;
	text-align: center;
	display: flex;
	justify-content: center;
	color: #4e4e4e;
	//margin-bottom: 30px;
`;
// const generatedOTP = '123456'; //hardcoded

// As per digitap we can only make one request per 60 second;
// const DEFAULT_TIME_RESEND_OTP = 60;

const CustomerVerificationOTPModal = props => {
	// const dispatch = useDispatch();
	const {
		show,
		onClose,
		resendOtp,
		selectedCustomer,
		redirectToProductPageInEditMode,
		customerDetailsFormData,
		product,
		sendOtpRes,
	} = props;

	const { app } = useSelector(state => state);
	const { selectedProduct, whiteLabelId } = app;
	const [inputCustomerOTP, setInputCustomerOTP] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [resendOtpTimer, setResendOtpTimer] = useState(
		selectedProduct?.otp_configuration?.otp_duration_in_seconds ||
			RESEND_OTP_TIMER
	);
	const [verifyingOtp, setVerifyingOtp] = useState(false);
	const [isResentOtp, setIsResentOtp] = useState(false);

	const verifyOtp = async () => {
		if (!inputCustomerOTP) {
			setErrorMsg('Please enter a valid OTP.');
			return;
		}
		if (inputCustomerOTP.length < 6) {
			setErrorMsg('Please enter 6 digit OTP Number');
			return;
		}
		try {
			setVerifyingOtp(true);
			setErrorMsg('');
			const reqBody = {
				customer_id: selectedCustomer?.customer_id || '',
				// customer_id: '137453244', // TODO: to be removed after testing
				otp: inputCustomerOTP || '',
				reference_id: sendOtpRes?.Validate_Customer_Resp?.ReferenceId || '',
				businesstype: customerDetailsFormData?.businesstype || '',
				loan_product_id:
					product?.product_id?.[`${customerDetailsFormData?.businesstype}`],
				white_label_id: whiteLabelId,
			};
			const customerVerifyRes = await axios.post(DDUPE_VERIFY_OTP, reqBody);
			// console.log('customerotpres-', customerVerifyRes);
			redirectToProductPageInEditMode(customerVerifyRes?.data || {});
		} catch (error) {
			console.error({ error, res: error?.response });
			if (
				(error?.response?.data?.message || error?.response?.data?.data?.msg) ===
				'Invalid OTP'
			) {
				error.response.data.message = 'Please enter a valid OTP.';
			}
			setErrorMsg(
				error?.response?.data?.Get_CustomerDetails_Resp?.ResponseReason ||
					error?.response?.data?.message ||
					error?.response?.data?.data?.msg ||
					'Something went wrong, try after sometimes'
			);
		} finally {
			setVerifyingOtp(false);
		}
	};

	useEffect(() => {
		setInputCustomerOTP('');
		setResendOtpTimer(
			sessionStorage.getItem('otp_duration') || RESEND_OTP_TIMER
		);
		setIsResentOtp(false);
		const timer = setInterval(() => {
			setResendOtpTimer(resendOtpTimer => resendOtpTimer - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	const handleModalClose = () => {
		setInputCustomerOTP('');
		onClose();
	};

	// console.log('customerverificationotpmodal-allstates-', {
	// 	inputCustomerOTP,
	// 	selectedProduct,
	// 	product,
	// });

	return (
		<Modal
			show={show}
			onClose={onClose}
			// un-comment this if you wants to allow modal to be closed when clicked outside
			// onClose={handleModalClose}
			width='30%'
			customStyle={{ padding: '20px' }}
		>
			<UI.ImgClose onClick={handleModalClose} src={imgClose} alt='close' />
			<ModalHeader>Dear Customer</ModalHeader>

			<ModalBody>
				<ModalSubHeader>
					An OTP has been {isResentOtp ? 'resent' : 'sent'} to your mobile
					number, please verify it below
				</ModalSubHeader>
				<ModalWrapper>
					<CustomerVerificationOTPInput
						numInputs={6}
						numberOnly
						setInputCustomerOTP={setInputCustomerOTP}
					/>
				</ModalWrapper>
				<ModalResentOtp>
					Didn't Receive OTP?{' '}
					<strong
						className={`cursor-pointer ${
							resendOtpTimer <= 0 ? 'text-blue-600' : 'text-gray-600'
						}`}
						type='submit'
						onClick={() => {
							if (resendOtpTimer <= 0) {
								setResendOtpTimer(
									sessionStorage.getItem('otp_duration') || RESEND_OTP_TIMER
								);
								resendOtp();
							}
						}}
					>
						{' '}
						RESEND OTP {resendOtpTimer > 0 ? `IN ${resendOtpTimer}` : null}
					</strong>
				</ModalResentOtp>{' '}
				{errorMsg && (
					<ModalErrorMessage>
						{' '}
						<ImgStyle src={RedError} alt='error' />
						{errorMsg}
					</ModalErrorMessage>
				)}
			</ModalBody>

			<ModalFooter>
				<Button
					name='Verify'
					onClick={verifyOtp}
					disabled={verifyingOtp || inputCustomerOTP.length < 6}
					isLoader={verifyingOtp}
				/>
				{/* {ButtonProceed} */}
			</ModalFooter>
		</Modal>
	);
};

export default CustomerVerificationOTPModal;
