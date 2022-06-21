/* This section contains modal/popup onClick of Verify Authentication button.
  This section also contains resend otp option */

import { useEffect, useState, useContext } from 'react';
import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from 'components/Button';
import AuthenticationOTPInput from './AuthenticationOtpInput';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	AUTHENTICATION_VERIFY_OTP,
	AUTHENTICATION_GENERATE_OTP,
} from '_config/app.config';
import useFetch from 'hooks/useFetch';
import { AppContext } from 'reducer/appReducer';
import RedError from 'assets/icons/Red_error_icon.png';

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
	padding: 52px 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	margin: auto;
	font-size: 20px;
	width: 57%;
	margin-top: 15px;
	text-align: center;
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
	padding-bottom: 9px;
	font-size: 14px;
`;

const ImgStyle = styled.img`
	width: 26px;
	display: inline-block;
	margin-right: 10px;
`;
// const generatedOTP = '123456'; //hardcoded

// As per digitap we can only make one request per 60 second;
const DEFAULT_TIME_RESEND_OTP = 60;

const AuthenticationOTPModal = props => {
	const {
		isAuthenticationOtpModalOpen,
		setIsAuthenticationOtpModalOpen,
		setContactNo,
		setIsVerifyWithOtpDisabled,
		onSubmitCompleteApplication,
		// toggle,
		// ButtonProceed,
		// type = 'income',
	} = props;
	const { addToast } = useToasts();
	const { newRequest } = useFetch();
	const [inputAuthenticationOTP, setInputAuthenticationOTP] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [resendOtpTimer, setResendOtpTimer] = useState(DEFAULT_TIME_RESEND_OTP);
	const [verifyingOtp, setVerifyingOtp] = useState(false);
	const [isResentOtp, setIsResentOtp] = useState(false);
	const {
		state: { clientToken },
	} = useContext(AppContext);

	const API_TOKEN = sessionStorage.getItem('userToken');

	const maskedContactNo = `XXXXX${setContactNo[setContactNo.length - 5]}${
		setContactNo[setContactNo.length - 4]
	}${setContactNo[setContactNo.length - 3]}${
		setContactNo[setContactNo.length - 2]
	}${setContactNo[setContactNo.length - 1]}`;

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
			const authenticationVerifyReq = await newRequest(
				AUTHENTICATION_VERIFY_OTP,
				{
					method: 'POST',
					data: {
						mobile: setContactNo,
						otp: Number(inputAuthenticationOTP),
					},
					headers: {
						Authorization: `Bearer ${API_TOKEN}`,
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
					JSON.stringify(authenticationVerifyResponse)
				);
				setIsVerifyWithOtpDisabled(true);
				onSubmitCompleteApplication();
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
			console.log(error);
			if (
				(error?.response?.data?.message || error?.response?.data?.data?.msg) ===
				'Invalid OTP'
			) {
				error.response.data.message = 'Please enter a valid OTP.';
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
			setResendOtpTimer(DEFAULT_TIME_RESEND_OTP);
			const reqBody = {
				mobile: setContactNo,
			};
			// console.log('resendOtp-reqBody-', reqBody);
			const authenticationResendOtpRes = await newRequest(
				AUTHENTICATION_GENERATE_OTP,
				{
					method: 'POST',
					data: reqBody,
					headers: {
						Authorization: `Bearer ${API_TOKEN}`,
					},
				}
			);
			if (authenticationResendOtpRes.data.status === 'ok') {
				addToast({
					message: 'OTP generated again',
					type: 'success',
				});
			}
		} catch (error) {
			console.log(error);
			setErrorMsg(
				error?.response?.data?.message ||
					' Authentication cannot be validated due to technical failure. Please try again after sometime'
			);
		}
	};

	useEffect(() => {
		setInputAuthenticationOTP('');
		setResendOtpTimer(DEFAULT_TIME_RESEND_OTP);
		setIsResentOtp(false);
		const timer = setInterval(() => {
			setResendOtpTimer(resendOtpTimer => resendOtpTimer - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, []);

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
			customStyle={{ padding: 0, minWidth: '42% ', maxWidth: '42%' }}>
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
				<p>
					{/* To{isResentOtp ? 'resent' : 'sent'} to your number
					please verify it below */}
					To authenticate your application please enter the OTP sent to
					{/* XXXXX99999{maskedContactNo} */}
					{' ' + maskedContactNo}
				</p>
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
						}}>
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
					loading={verifyingOtp}
				/>
				{/* {ButtonProceed} */}
			</ModalFooter>
		</Modal>
	);
};

export default AuthenticationOTPModal;
