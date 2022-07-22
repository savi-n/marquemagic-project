/* This section contains modal/popup onClick of Verify Aadhaar button.
  This section also contains resend otp option */

import { useEffect, useState, useContext } from 'react';
import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from 'components/Button';
import AadhaarOTPInput from './AadhaarOTPInput';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { useToasts } from 'components/Toast/ToastProvider';
import { AADHAAR_VERIFY_OTP, AADHAAR_RESEND_OTP } from '_config/app.config';
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
	background-color: #eeeef7;
	font-weight: 600;
	color: #525252;
`;

const ModalBody = styled.div`
	padding: 30px 0;
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
	padding-bottom: 9px;
	font-size: 11px;
`;

const ImgStyle = styled.img`
	width: 26px;
	display: inline-block;
	margin-right: 10px;
`;
// const generatedOTP = '123456'; //hardcoded

// As per digitap we can only make one request per 60 second;
const DEFAULT_TIME_RESEND_OTP = 60;

const AadhaarOTPModal = props => {
	const {
		isAadhaarOtpModalOpen,
		setIsAadhaarOtpModalOpen,
		aadhaarGenOtpResponse,
		setIsVerifyWithOtpDisabled,
		// toggle,
		// ButtonProceed,
		// type = 'income',
	} = props;
	const { addToast } = useToasts();
	const { newRequest } = useFetch();
	const [inputAadhaarOTP, setInputAadhaarOTP] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [resendOtpTimer, setResendOtpTimer] = useState(DEFAULT_TIME_RESEND_OTP);
	const [verifyingOtp, setVerifyingOtp] = useState(false);
	const [isResentOtp, setIsResentOtp] = useState(false);
	const {
		state: { clientToken },
	} = useContext(AppContext);

	const product_id = sessionStorage.getItem('productId');
	const verifyOtp = async () => {
		if (!inputAadhaarOTP) {
			setErrorMsg('Please enter a valid OTP.');
			return;
		}
		if (inputAadhaarOTP.length < 6) {
			setErrorMsg('Please enter 6 digit OTP Number');
			return;
		}
		try {
			setVerifyingOtp(true);
			const aadharVerifyReq = await newRequest(AADHAAR_VERIFY_OTP, {
				method: 'POST',
				data: {
					transactionId: aadhaarGenOtpResponse.data.transactionId,
					otp: inputAadhaarOTP,
					codeVerifier: aadhaarGenOtpResponse.data.codeVerifier,
					fwdp: aadhaarGenOtpResponse.data.fwdp,
					aadhaarNo: aadhaarGenOtpResponse.aadhaarNo,
					product_id,
				},
				headers: {
					Authorization: `${clientToken}`,
				},
			});
			const aadhaarVerifyResponse = aadharVerifyReq.data;

			if (aadhaarVerifyResponse.status === 'ok') {
				setIsAadhaarOtpModalOpen(false);
				addToast({
					message: 'Aadhaar Successfully Verified',
					type: 'success',
				});
				sessionStorage.setItem(
					'aadhaar_otp_res',
					JSON.stringify(aadhaarVerifyResponse)
				);
				setIsVerifyWithOtpDisabled(true);
			} else {
				setIsAadhaarOtpModalOpen(false);
				addToast({
					message:
						' Aadhaar cannot be validated due to technical failure. Please try again after sometime',
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
					'Aadhaar cannot be validated due to technical failure. Please try again after sometime'
			);

			setVerifyingOtp(false);
		}
	};

	const resendOtp = async () => {
		// console.log('resendOtp-', aadhaarGenOtpResponse);
		if (
			!aadhaarGenOtpResponse?.aadhaarNo ||
			!aadhaarGenOtpResponse?.data?.transactionId ||
			!aadhaarGenOtpResponse?.data?.fwdp
		) {
			return;
		}
		try {
			setIsResentOtp(true);
			setResendOtpTimer(DEFAULT_TIME_RESEND_OTP);
			const reqBody = {
				aadhaarNo: aadhaarGenOtpResponse.aadhaarNo,
				transactionId: aadhaarGenOtpResponse.data.transactionId,
				fwdp: aadhaarGenOtpResponse.data.fwdp,
				product_id,
			};
			// console.log('resendOtp-reqBody-', reqBody);
			const aadharResendOtpRes = await newRequest(AADHAAR_RESEND_OTP, {
				method: 'POST',
				data: reqBody,
				headers: {
					Authorization: `${clientToken}`,
				},
			});
			if (aadharResendOtpRes.data.status === 'ok') {
				addToast({
					message: 'OTP generated again',
					type: 'success',
				});
			}
		} catch (error) {
			console.log(error);
			setErrorMsg(
				error?.response?.data?.message ||
					' Aadhaar cannot be validated due to technical failure. Please try again after sometime'
			);
		}
	};

	useEffect(() => {
		setInputAadhaarOTP('');
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
		setInputAadhaarOTP('');
		setIsAadhaarOtpModalOpen(false);
	};

	return (
		<Modal
			show={isAadhaarOtpModalOpen}
			// un-comment this if you wants to allow modal to be closed when clicked outside
			// onClose={handleModalClose}
			width='30%'
			customStyle={{ padding: 0, minWidth: '42% ', maxWidth: '42%' }}>
			<ModalHeader>
				Aadhaar Verification
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
					An OTP has been {isResentOtp ? 'resent' : 'sent'} to your number
					please verify it below
				</p>
				<ModalWrapper>
					<AadhaarOTPInput
						numInputs={6}
						numberOnly
						setInputAadhaarOTP={setInputAadhaarOTP}
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
					disabled={verifyingOtp || inputAadhaarOTP.length < 6}
					loading={verifyingOtp}
				/>
				{/* {ButtonProceed} */}
			</ModalFooter>
		</Modal>
	);
};

export default AadhaarOTPModal;
