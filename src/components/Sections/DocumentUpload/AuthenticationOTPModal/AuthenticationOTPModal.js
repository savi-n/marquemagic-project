/* This section contains modal/popup onClick of Verify Authentication button.
  This section also contains resend otp option */

import { useEffect, useState } from 'react';
import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import axios from 'axios';
import Button from 'components/Button';
import AuthenticationOTPInput from './AuthenticationOtpInput';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	AUTHENTICATION_VERIFY_OTP,
	AUTHENTICATION_GENERATE_OTP,
	RESEND_OTP_TIMER,
} from '_config/app.config';
import useFetch from 'hooks/useFetch';
import RedError from 'assets/icons/Red_error_icon.png';
import { useSelector } from 'react-redux';
import * as API from '_config/app.config';
import { APPLICATION_SUBMITTED_SECTION_ID } from '../../const';

const ModalHeader = styled.div`
	position: relative;
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	margin: auto;
	/* background-color: #eeeef7; */
	font-weight: 600;
	color: #525252;
`;

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
	margin-bottom: 78px;
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
	font-size: 14px;
	margin-top: 10px;
	@media (max-width: 700px) {
		padding-bottom: 0px;
	}
`;

const OtpMobileMessage = styled.p`
	font-size: 22px;
	text-align: center;
	@media (max-width: 700px) {
		font-size: 18px;
	}
`;

const ImgStyle = styled.img`
	width: 26px;
	display: inline-block;
	margin-right: 10px;
`;
// const generatedOTP = '123456'; //hardcoded

// As per digitap we can only make one request per 60 second;
// const DEFAULT_TIME_RESEND_OTP = 60;

const AuthenticationOTPModal = props => {
	const {
		isAuthenticationOtpModalOpen,
		setIsAuthenticationOtpModalOpen,
		setContactNo,
		setIsVerifyWithOtpDisabled,
		onSkip,
		generateOtpTimer,
		isDocumentUploadMandatory,
		// toggle,
		// ButtonProceed,
		// type = 'income',
	} = props;
	const { app, application } = useSelector(state => state);
	const { selectedProduct, userToken, editLoanData } = app;
	const { businessId, loanId } = application;
	const { addToast } = useToasts();
	const { newRequest } = useFetch();
	const [inputAuthenticationOTP, setInputAuthenticationOTP] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [resendOtpTimer, setResendOtpTimer] = useState(
		generateOtpTimer ||
			sessionStorage.getItem('otp_duration') ||
			RESEND_OTP_TIMER
	);
	const [verifyingOtp, setVerifyingOtp] = useState(false);
	const [, setIsResentOtp] = useState(false);

	const maskedContactNo = `XXXXX${setContactNo[setContactNo?.length - 5]}${
		setContactNo[setContactNo?.length - 4]
	}${setContactNo[setContactNo?.length - 3]}${
		setContactNo[setContactNo?.length - 2]
	}${setContactNo[setContactNo?.length - 1]}`;

	const verifyOtp = async () => {
		if (!inputAuthenticationOTP) {
			setErrorMsg('Please enter a valid OTP.');
			return;
		}
		if (inputAuthenticationOTP.length < 6) {
			setErrorMsg('Please enter 6 digit OTP Number');
			return;
		}
		try {
			setVerifyingOtp(true);
			// --api-4 Verify otp
			const authenticationVerifyReq = await newRequest(
				AUTHENTICATION_VERIFY_OTP,
				{
					method: 'POST',
					data: {
						mobile: +setContactNo,
						business_id: businessId || '',
						otp: Number(inputAuthenticationOTP),
						product_id: selectedProduct.id,
						loan_id: loanId || '',
					},
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				}
			);
			const authenticationVerifyResponse = authenticationVerifyReq.data;

			if (authenticationVerifyResponse.status === 'ok') {
				setIsAuthenticationOtpModalOpen(false);
				addToast({
					message: 'Authentication Successfully Verified',
					type: 'success',
				});
				sessionStorage.setItem(
					'authentication_otp_res',
					JSON.stringify(authenticationVerifyResponse.data)
				);
				setIsVerifyWithOtpDisabled(true);
				// --api 5 - application stage
				const applicationStageReqBody = {
					loan_id: loanId,
					section_id: APPLICATION_SUBMITTED_SECTION_ID,
				};

				if (isDocumentUploadMandatory) {
					applicationStageReqBody.is_mandatory_documents_uploaded = true;
				}
				await axios.post(
					`${API.TO_APPLICATION_STAGE_URL}`,
					applicationStageReqBody
				);
				if (editLoanData && editLoanData?.loan_ref_id) {
					setTimeout(() => {
						addToast({
							message: 'Your application has been updated',
							type: 'success',
						});
					}, 1000);
				}
				onSkip();
			} else {
				setIsAuthenticationOtpModalOpen(false);
				addToast({
					message:
						' Authentication cannot be validated due to technical failure. Please try again after sometime',
					type: 'error',
				});
			}
			setVerifyingOtp(false);
		} catch (error) {
			console.error(error);
			if (
				(error?.response?.data?.message || error?.response?.data?.data?.msg) ===
				'Invalid OTP'
			) {
				error.response.data.message =
					'The entered OTP seems to be incorrect. Please enter the correct OTP.';
			}
			setErrorMsg(
				error?.response?.data?.message ||
					error?.response?.data?.data?.msg ||
					'Authentication cannot be validated due to technical failure. Please try again after sometime'
			);

			setVerifyingOtp(false);
		}
	};

	const resendOtp = async () => {
		if (!setContactNo) {
			return;
		}
		try {
			setIsResentOtp(true);
			setResendOtpTimer(
				sessionStorage.getItem('otp_duration') || RESEND_OTP_TIMER
			);
			const reqBody = {
				mobile: +setContactNo,
				business_id: businessId || '',
				product_id: selectedProduct.id,
			};
			// console.log('resendOtp-reqBody-', reqBody);
			const authenticationResendOtpRes = await newRequest(
				AUTHENTICATION_GENERATE_OTP,
				{
					method: 'POST',
					data: reqBody,
					headers: {
						Authorization: `Bearer ${userToken}`,
					},
				}
			);
			if (authenticationResendOtpRes.data.status === 'ok') {
				addToast({
					message: 'OTP generated again',
					type: 'success',
				});
			} else {
				addToast({
					message: authenticationResendOtpRes.data.message,
					type: 'error',
				});
			}
		} catch (error) {
			console.error(error);
			setErrorMsg(
				error?.response?.data?.message ||
					' Authentication cannot be validated due to technical failure. Please try again after sometime'
			);
		}
	};

	useEffect(() => {
		setInputAuthenticationOTP('');
		setResendOtpTimer(
			generateOtpTimer ||
				sessionStorage.getItem('otp_duration') ||
				RESEND_OTP_TIMER
		);
		setIsResentOtp(false);
		const timer = setInterval(() => {
			setResendOtpTimer(resendOtpTimer => resendOtpTimer - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [generateOtpTimer]);

	useEffect(() => {
		if (resendOtpTimer <= 0) return;
	}, [resendOtpTimer]);

	const handleModalClose = () => {
		setInputAuthenticationOTP('');
		setIsAuthenticationOtpModalOpen(false);
	};

	return (
		<Modal
			show={isAuthenticationOtpModalOpen}
			// un-comment this if you wants to allow modal to be closed when clicked outside
			// onClose={handleModalClose}
			width='30%'
			customStyle={{ padding: 0 }}
		>
			<ModalHeader>
				{/* Authentication Verification */}
				<img
					src={imgClose}
					style={{
						cursor: 'pointer',
						width: '25px',
						position: 'absolute',
						right: 0,
						marginRight: '20px',
					}}
					onClick={handleModalClose}
					alt='close'
				/>
			</ModalHeader>
			<ModalBody>
				<OtpMobileMessage>
					{/* To{isResentOtp ? 'resent' : 'sent'} to your number
						please verify it below */}
					To authenticate your application please enter the OTP sent to
					{/* XXXXX99999{maskedContactNo} */}
					{' ' + maskedContactNo}
				</OtpMobileMessage>
				<ModalWrapper>
					<AuthenticationOTPInput
						numInputs={6}
						numberOnly
						setInputAuthenticationOTP={setInputAuthenticationOTP}
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
							resendOtpTimer <= 0 && resendOtp();
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
					disabled={verifyingOtp || inputAuthenticationOTP.length < 6}
					isLoader={verifyingOtp}
				/>
				{/* {ButtonProceed} */}
			</ModalFooter>
		</Modal>
	);
};

export default AuthenticationOTPModal;
