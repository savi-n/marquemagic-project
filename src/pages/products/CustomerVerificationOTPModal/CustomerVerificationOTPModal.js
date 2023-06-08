/* This section contains modal/popup onClick of proceed with the selected customer.
  This section also contains resend otp option */

import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import Button from 'components/Button';
import CustomerVerificationOTPInput from './CustomerVerificationOTPInput';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	AADHAAR_VERIFY_OTP, /// need to change these apis as per this page
	AADHAAR_RESEND_OTP,
	RESEND_OTP_TIMER,
} from '_config/app.config';
import useFetch from 'hooks/useFetch';
import RedError from 'assets/icons/Red_error_icon.png';
import { useSelector } from 'react-redux';
import { formatSectionReqBody } from 'utils/formatData';
//import { initialFormState } from '../const';
import * as CONST_ADDRESS_DETAILS from 'components/Sections/AddressDetails/const';

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

const CustomerVerificationOTPModal = props => {
	// const dispatch = useDispatch();
	const {
		isCustomerOtpModalOpen,
		setIsCustomerOtpModalOpen,
		aadhaarGenOtpResponse,
		prePopulateAddressDetailsFromVerifyOtpRes,
		formState,
		setVerifyOtpResponseTemp,
	} = props;

	const { application, app } = useSelector(state => state);
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const { loanProductId } = application;
	const { selectedSection, clientToken, selectedProduct } = app;
	const { addToast } = useToasts();
	const { newRequest } = useFetch();
	const [inputCustomerOTP, setInputCustomerOTP] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [resendOtpTimer, setResendOtpTimer] = useState(
		selectedProduct?.otp_configuration?.otp_duration_in_seconds ||
			RESEND_OTP_TIMER
	);
	const [verifyingOtp, setVerifyingOtp] = useState(false);
	const [isResentOtp, setIsResentOtp] = useState(false);
	// const {
	// 	state: { clientToken },
	// } = useContext(AppContext);

	const verifyOtp = async () => {
		if (!inputCustomerOTP) {
			setErrorMsg('Please enter a valid OTP.');
			return;
		}
		if (inputCustomerOTP.length < 6) {
			setErrorMsg('Please enter 6 digit OTP Number');
			return;
		}

		const otpReqBody = formatSectionReqBody({
			section: selectedSection,
			//	values: initialFormState.values,
			app,
			application,
			selectedDirector,
		});

		try {
			setVerifyingOtp(true);
			const customerVerifyReq = await newRequest(AADHAAR_VERIFY_OTP, {
				method: 'POST',
				data: {
					...otpReqBody,
					transactionId: aadhaarGenOtpResponse.data.transactionId,
					otp: inputCustomerOTP,
					codeVerifier: aadhaarGenOtpResponse.data.codeVerifier,
					fwdp: aadhaarGenOtpResponse.data.fwdp,
					aadhaarNo: aadhaarGenOtpResponse.aadhaarNo,
					product_id: loanProductId,
				},
				headers: {
					Authorization: `${clientToken}`,
				},
			});
			const aadhaarVerifyResponse = customerVerifyReq.data;
			setVerifyOtpResponseTemp({
				req: {
					...otpReqBody,
					transactionId: aadhaarGenOtpResponse.data.transactionId,
					otp: inputCustomerOTP,
					codeVerifier: aadhaarGenOtpResponse.data.codeVerifier,
					fwdp: aadhaarGenOtpResponse.data.fwdp,
					aadhaarNo: aadhaarGenOtpResponse.aadhaarNo,
					product_id: loanProductId,
				},
				res: aadhaarVerifyResponse,
			});
			// dispatch(
			// 	setVerifyOtpResponse({
			// 		req: {
			// 			...otpReqBody,
			// 			transactionId: aadhaarGenOtpResponse.data.transactionId,
			// 			otp: inputCustomerOTP,
			// 			codeVerifier: aadhaarGenOtpResponse.data.codeVerifier,
			// 			fwdp: aadhaarGenOtpResponse.data.fwdp,
			// 			aadhaarNo: aadhaarGenOtpResponse.aadhaarNo,
			// 			product_id: loanProductId,
			// 		},
			// 		res: aadhaarVerifyResponse,
			// 	})
			// );
			if (
				formState?.values?.[
					CONST_ADDRESS_DETAILS.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
				] ===
				CONST_ADDRESS_DETAILS.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_VALUE_AADHAAR
			) {
				prePopulateAddressDetailsFromVerifyOtpRes(aadhaarVerifyResponse);
			}

			if (aadhaarVerifyResponse.status === 'ok') {
				setIsCustomerOtpModalOpen(false);
				addToast({
					message: 'Aadhaar Successfully Verified',
					type: 'success',
				});
				sessionStorage.setItem(
					'aadhaar_otp_res',
					JSON.stringify(aadhaarVerifyResponse)
				);
			} else {
				setIsCustomerOtpModalOpen(false);
				addToast({
					message:
						' Aadhaar is not validated due to technical failure. Please try again after sometime',
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
			setResendOtpTimer(
				sessionStorage.getItem('otp_duration') || RESEND_OTP_TIMER
			);
			const reqBody = {
				aadhaarNo: aadhaarGenOtpResponse.aadhaarNo,
				transactionId: aadhaarGenOtpResponse.data.transactionId,
				fwdp: aadhaarGenOtpResponse.data.fwdp,
				product_id: loanProductId,
			};
			// console.log('resendOtp-reqBody-', reqBody);
			const customerResendOtpRes = await newRequest(AADHAAR_RESEND_OTP, {
				method: 'POST',
				data: reqBody,
				headers: {
					Authorization: `${clientToken}`,
				},
			});
			if (customerResendOtpRes.data.status === 'ok') {
				addToast({
					message: 'OTP generated again',
					type: 'success',
				});
			}
		} catch (error) {
			console.error(error);
			setErrorMsg(
				error?.response?.data?.message ||
					' Aadhaar cannot be validated due to technical failure. Please try again after sometime'
			);
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

	useEffect(() => {
		if (resendOtpTimer <= 0) return;
	}, [resendOtpTimer]);

	const handleModalClose = () => {
		setInputCustomerOTP('');
		setIsCustomerOtpModalOpen(false);
	};

	return (
		<Modal
			show={isCustomerOtpModalOpen}
			// un-comment this if you wants to allow modal to be closed when clicked outside
			// onClose={handleModalClose}
			width='30%'
			customStyle={{ padding: 0 }}
		>
			<ModalHeader>
				Dear Customer
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
					An OTP has been {isResentOtp ? 'resent' : 'sent'} to your mobile
					number, please verify it below
				</OtpMobileMessage>
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
					disabled={verifyingOtp || inputCustomerOTP.length < 6}
					isLoader={verifyingOtp}
				/>
				{/* {ButtonProceed} */}
			</ModalFooter>
		</Modal>
	);
};

export default CustomerVerificationOTPModal;
