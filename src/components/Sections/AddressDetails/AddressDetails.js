//aid:1 = present address
//aid:2 = permanent address

import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import Button from 'components/Button';
import AadhaarOTPModal from './AadhaarOTPModal';
import AddressProofUpload from './AddressProofUpload';
import { formatSectionReqBody } from 'utils/formatData';
import {
	setIsSameAsAboveAddressChecked,
	updateApplicantSection,
	updateCoApplicantSection,
	removeLoanDocument,
	updateSelectedDocumentTypeId,
	setSelectedPresentAddressProofId,
	setPresentAddressProofExtractionRes,
	setGenerateAadhaarOtpResponse,
} from 'store/applicantCoApplicantsSlice';
import { setSelectedSectionId } from 'store/appSlice';
import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import { getKYCData, getKYCDataId } from 'utils/request';
import { sleep } from 'utils/helper';
import { verifyKycDataUiUx } from 'utils/request';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
import { AADHAAR_GENERATE_OTP, API_END_POINT } from '_config/app.config';
import { isInvalidAadhaar } from 'utils/validation';
import Hint from 'components/Hint';
// import { formatAddressProofDocTypeList } from 'utils/formatData';
// import { formatSectionReqBody } from 'utils/formatData';

const AddressDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const { loanProductId } = application;
	const {
		isViewLoan,
		selectedProduct,
		selectedSectionId,
		selectedSection,
		nextSectionId,
		isTestMode,
		clientToken,
	} = app;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
		isApplicant,
		verifyOtpResponse,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants[selectedApplicantCoApplicantId] || {};
	const {
		isSameAsAboveAddressChecked,
		selectedPresentAddressProofId,
		selectedPresentDocumentTypes,
		presentAddressProofExtractionRes,
	} = selectedApplicant;
	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [loading, setLoading] = useState(false);
	const [fetchingAddress, setFetchingAddress] = useState(false);
	const [verifyingWithOtp, setVerifyingWithOtp] = useState(false);
	const [presentAddressProofDocs, setPresentAddressProofDocs] = useState([]);
	const [presentAddressProofError, setPresentAddressProofError] = useState('');
	const [isAadhaarOtpModalOpen, setIsAadhaarOtpModalOpen] = useState(false);
	const presentAddressProofDocsRef = useRef([]);
	const { addToast } = useToasts();

	const handleFileUploadAddressProof = (files, aid) => {
		let newAddressProofDocs = _.cloneDeep(presentAddressProofDocsRef.current);
		files.map(f => newAddressProofDocs.push(_.cloneDeep({ ...f, aid })));
		newAddressProofDocs = _.uniqBy(newAddressProofDocs, function(e) {
			return e.id;
		});
		// console.log('pan-verification-handleFileUploadAddressProof-', {
		//  files,
		//  newAddressProofDocs,
		//  addressProofDocs,
		//  selectedAddressProof,
		// });
		setPresentAddressProofDocs(newAddressProofDocs);
		presentAddressProofDocsRef.current = newAddressProofDocs;
		// setDisableSubmit(false);
		setPresentAddressProofError('');
	};

	const handleFileRemoveAddressProof = docId => {
		// console.log('handleFileRemoveAddressProof docId-', docId);
		dispatch(removeLoanDocument(docId));
		// const newAddressProofDocs = _.cloneDeep(
		// 	// eslint-disable-next-line
		// 	fileRef.current.filter(f => f.id != docId)
		// );
		// fileRef.current = newAddressProofDocs;
		const newAddressProofDocs = _.cloneDeep(
			presentAddressProofDocsRef.current.filter(f => f.id !== docId)
		);
		setPresentAddressProofDocs(newAddressProofDocs);
		presentAddressProofDocsRef.current = newAddressProofDocs;
	};

	const handleDocumentTypeChangeAddressProof = async (fileId, type) => {
		dispatch(updateSelectedDocumentTypeId({ fileId, docType: type }));
		const newAddressProofDocs = [];
		presentAddressProofDocsRef?.current?.map(f => {
			const newFile = _.cloneDeep(f);
			if (f.id === fileId) {
				newFile.isTagged = type;
				newFile.doc_type_id = type.id;
			}
			newAddressProofDocs.push(newFile);
			return null;
		});

		// console.log('handleDocumentTypeChangeAddressProof-', {
		// 	addressProofDocs,
		// 	newAddressProofDocs,
		// });
		// // fileRef.current = newAddressProofDocs;
		setPresentAddressProofDocs(newAddressProofDocs);
		presentAddressProofDocsRef.current = newAddressProofDocs;
	};

	const prepopulateAadhaarAndAddressState = extractionData => {
		// console.log('prepopulateAadhaarAndAddressState-', extractionData);

		const aadharNum = extractionData?.Aadhar_number?.replaceAll(
			/\s/g,
			''
		).split('');
		const aadhaarUnMasked = aadharNum?.join('') || '';
		// const aadhaarMasked = aadharNum
		// 	? 'XXXXXXXX' + aadharNum?.splice(8, 4).join('')
		// 	: '';
		onChangeFormStateField({
			name: `aadhaar`,
			value: aadhaarUnMasked,
		});
		// const fullName =
		// 	extractionData?.name?.split(' ') || extractionData?.Name?.split(' ');
		// const firstName = fullName[0].join(' ');
		// const lastName = fullName[fullName.length - 1];
		// const dob = extractionData?.DOB || extractionData?.dob;
		// const dlNo = extractionData?.dl_no;
		const fullAddress = extractionData?.address || extractionData?.Address;
		onChangeFormStateField({
			name: `${CONST.PREFIX_PRESENT}address1`,
			value: fullAddress,
		});
		const pinCode = extractionData?.pincode;
		if (fullAddress) {
			let locationArr = fullAddress && fullAddress?.split(' ');
			// eslint-disable-next-line
			let y = locationArr?.map(e => !Number(isNaN(e)) && e);
			// return Number(e) !== NaN && e;
			let pin;
			y.map(e => {
				if (e?.length === 6) pin = e;
				return null;
			});

			const extractedPinCode = pinCode || pin;
			onChangeFormStateField({
				name: `${CONST.PREFIX_PRESENT}pin_code`,
				value: extractedPinCode,
			});
		}
	};

	const verifyKycAddressProof = async (
		selectedAddressProof,
		extractionData
	) => {
		try {
			// console.log('verifyKycAddressProof-', {
			// 	selectedAddressProof,
			// 	isVerifyKycData,
			// 	extractionData,
			// });
			if (
				!selectedProduct?.kyc_verification ||
				selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_AADHAAR
			)
				return {};
			const reqBody = {
				doc_ref_id: extractionData?.doc_ref_id,
				doc_type: selectedAddressProof,
			};
			if (selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_DL) {
				reqBody.number = extractionData?.dl_no || '';
				reqBody.dob = extractionData?.dob || extractionData?.DOB || '';
			}
			if (selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_VOTERID) {
				reqBody.number = extractionData?.vid || '';
				reqBody.state = extractionData?.state || '';
				reqBody.name = extractionData?.Name || extractionData?.name || '';
			}
			if (selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_PASSPORT) {
				// TODO: verify by testing passport extraction data
				reqBody.number = extractionData?.passport_no || '';
				reqBody.dob = extractionData?.dob || extractionData?.DOB || '';
				reqBody.name = extractionData?.Name || extractionData?.name || '';
			}
			const verifiedRes = await verifyKycDataUiUx(reqBody, clientToken);
			return verifiedRes;
		} catch (error) {
			console.error('error-verifyKycDataUiUx-', error);
			addToast({
				message: error.message || 'Something Went Wrong. Try Again!',
				type: 'error',
			});
			return {};
		}
	};

	const onClickVerifyWithOtp = async () => {
		try {
			const aadhaarErrorMessage = isInvalidAadhaar(formState.values.aadhaar);
			if (aadhaarErrorMessage) {
				return addToast({
					message: aadhaarErrorMessage,
					type: 'error',
				});
			}
			setVerifyingWithOtp(true);
			try {
				const aadhaarOtpReqBody = {
					aadhaarNo: formState.values.aadhaar,
					product_id: loanProductId,
				};
				// console.log(aadhaarOtpReqBody, '555', clientToken);
				// --------------------
				const aadharOtpReq = await axios.post(
					AADHAAR_GENERATE_OTP,
					aadhaarOtpReqBody,
					{
						headers: {
							Authorization: `${clientToken}`,
						},
					}
				);
				const aadhaarGenOtpResponse = aadharOtpReq.data;
				// console.log(aadhaarGenOtpResponse, '333');
				if (aadhaarGenOtpResponse.status === 'nok') {
					addToast({
						message:
							aadhaarGenOtpResponse?.data?.msg ||
							'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
						type: 'error',
					});
				}
				if (aadhaarGenOtpResponse.status === 'ok') {
					aadhaarGenOtpResponse.aadhaarNo = formState.values.aadhaar;
					dispatch(setGenerateAadhaarOtpResponse(aadhaarGenOtpResponse));
					addToast({
						message: 'OTP is sent to aadhaar link mobile number',
						type: 'success',
					});
					setIsAadhaarOtpModalOpen(true);
					// console.log(formState.values, '555777');
					if (verifyOtpResponse.data.address) {
						// to be continued
						let address = verifyOtpResponse?.data?.address;
						// population of the data from the aadhaar otp verification is pending here

						// console.log(formState, '111222');
					}
				}
			} catch (error) {
				console.error('error-generate-aadhaar-otp-', error);
				addToast({
					message:
						error?.response?.data?.message ||
						error?.response?.data?.data?.msg ||
						'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
					type: 'error',
				});
			} finally {
				setVerifyingWithOtp(false);
			}
		} catch (error) {
			console.error('error-onClickVerifyWithOtp-', error);
		} finally {
			setVerifyingWithOtp(false);
		}
	};

	const onClickFetchAddress = async () => {
		try {
			setLoading(true);
			setFetchingAddress(true);
			setPresentAddressProofError('');
			// TODO Filter selected address proof docs before extracting
			const selectedAddressProofFiles = presentAddressProofDocsRef?.current?.filter(
				f => f?.sectionType === selectedPresentAddressProofId
			);
			if (selectedAddressProofFiles.length > 2) {
				addToast({
					message: 'Max 2 doucment is allowed',
					type: 'error',
				});
				return;
			}
			// console.log(
			// 	'onClickFetchAddress-selectedAddressProofFiles-',
			// 	selectedAddressProofFiles
			// );

			// Front + Back Extract
			if (selectedAddressProofFiles.length > 1) {
				const frontFormData = new FormData();
				frontFormData.append('product_id', selectedProduct.id);
				frontFormData.append('req_type', selectedPresentAddressProofId);
				frontFormData.append('process_type', 'extraction');
				frontFormData.append('document', selectedAddressProofFiles[0].file);

				const frontExtractionRes = await getKYCData(frontFormData, clientToken);
				const frontExtractionStatus = frontExtractionRes?.data?.status || '';
				const frontExtractionMsg = frontExtractionRes?.data?.message || '';
				const frontForensicRes = frontExtractionRes?.data?.forensicData || {};
				const frontForensicFlag = frontForensicRes?.flag?.toLowerCase() || '';
				const frontForensicFlagMsg = frontForensicRes?.flag_message || '';

				if (frontExtractionStatus === 'nok') {
					setPresentAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontExtractionMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'error') {
					setPresentAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontForensicFlagMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'warning') {
					setPresentAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontForensicFlagMsg}`
					);
					// CONTINUE EXECUTION
				}

				// const frontFile = {
				// 	...(frontExtractionRes?.data?.extractionData || {}),
				// 	document_key: frontExtractionRes?.data?.s3?.fd,
				// 	id: selectedAddressProofFiles[0].id,
				// 	mainType: 'KYC',
				// 	size: frontExtractionRes?.data?.s3?.size,
				// 	type: 'other',
				// 	req_type: selectedPresentAddressProofId, // requires for mapping with JSON
				// 	requestId: frontExtractionRes?.data?.request_id,
				// 	upload_doc_name: frontExtractionRes?.data?.s3?.filename,
				// 	isDocRemoveAllowed: false,
				// 	category: CONST_SECTIONS.DOC_CATEGORY_KYC,
				// 	doc_type_id: `app_${CONST_SECTIONS.DOC_CATEGORY_KYC}`,
				// };

				// TODO: Set doc to Redux
				// setLoanDocuments([frontFile]);
				// this ends here

				const backFormData = new FormData();
				backFormData.append('product_id', selectedProduct.id);
				backFormData.append('req_type', selectedPresentAddressProofId);
				backFormData.append(
					'ref_id',
					frontExtractionRes?.data?.extractionData?.id
				);
				backFormData.append('doc_ref_id', frontExtractionRes?.data?.doc_ref_id);
				backFormData.append('process_type', 'extraction');
				backFormData.append('document', selectedAddressProofFiles[1].file);

				const backExtractionRes = await getKYCDataId(backFormData, clientToken);
				const backExtractionStatus = backExtractionRes?.data?.status || '';
				const backExtractionMsg = backExtractionRes?.data?.message || '';
				const backForensicRes = backExtractionRes?.data?.forensicData || {};
				const backForensicFlag = backForensicRes?.flag?.toLowerCase() || '';
				const backForensicFlagMsg = backForensicRes?.flag_message || '';

				if (backExtractionStatus === 'nok') {
					setPresentAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${backExtractionMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				if (backForensicFlag === 'error') {
					setPresentAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${backForensicFlagMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				if (backForensicFlag === 'warning') {
					setPresentAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${backForensicFlagMsg}`
					);
					// CONTINUE EXECUTION
				}

				// const backFile = {
				// 	...(backExtractionRes?.data?.extractionData || {}),
				// 	document_key: backExtractionRes?.data.s3.fd,
				// 	id: selectedAddressProofFiles[1].id,
				// 	mainType: 'KYC',
				// 	size: backExtractionRes?.data.s3.size,
				// 	type: 'other',
				// 	req_type: selectedPresentAddressProofId,
				// 	requestId: backExtractionRes?.data.request_id,
				// 	upload_doc_name: backExtractionRes?.data.s3.filename,
				// 	isDocRemoveAllowed: false,
				// 	category: CONST_SECTIONS.DOC_CATEGORY_KYC,
				// 	doc_type_id: `app_${CONST_SECTIONS.DOC_CATEGORY_KYC}`,
				// };
				// TODO: Set doc to Redux
				// setLoanDocuments([backFile]);
				// this ends here

				dispatch(
					setPresentAddressProofExtractionRes(backExtractionRes?.data || {})
				);
				const newAddressProofExtractionData = {
					...backExtractionRes?.data?.extractionData,
					doc_ref_id: frontExtractionRes?.data?.doc_ref_id,
					requestId: backExtractionRes?.data.request_id,
				};
				// console.log(newAddressProofExtractionData, '2222');
				prepopulateAadhaarAndAddressState(newAddressProofExtractionData);
				await verifyKycAddressProof(
					selectedPresentAddressProofId,
					newAddressProofExtractionData
				);
				return;
			}

			// Front Only Extract
			const frontOnlyFormData = new FormData();
			frontOnlyFormData.append('product_id', selectedProduct.id);
			frontOnlyFormData.append('req_type', selectedPresentAddressProofId);
			frontOnlyFormData.append('process_type', 'extraction');
			frontOnlyFormData.append('document', selectedAddressProofFiles[0].file);

			const frontOnlyExtractionRes = await getKYCData(
				frontOnlyFormData,
				clientToken
			);
			const frontOnlyExtractionStatus =
				frontOnlyExtractionRes?.data?.status || '';
			const frontOnlyExtractionMsg =
				frontOnlyExtractionRes?.data?.message || '';
			const frontOnlyForensicRes =
				frontOnlyExtractionRes?.data?.forensicData || {};
			const frontOnlyForensicFlag =
				frontOnlyForensicRes?.flag?.toLowerCase() || '';
			const frontOnlyForensicFlagMsg = frontOnlyForensicRes?.flag_message || '';

			if (frontOnlyExtractionStatus === 'nok') {
				setPresentAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyExtractionMsg}`
				);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'error') {
				setPresentAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyForensicFlagMsg}`
				);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'warning') {
				setPresentAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontOnlyForensicFlagMsg}`
				);
				// CONTINUE EXECUTION
			}

			// const frontOnlyFile = {
			// 	...(frontOnlyExtractionRes?.data?.extractionData || {}),
			// 	document_key: frontOnlyExtractionRes?.data?.s3?.fd,
			// 	id: selectedAddressProofFiles[0].id,
			// 	mainType: 'KYC',
			// 	size: frontOnlyExtractionRes?.data?.s3?.size,
			// 	type: 'other',
			// 	req_type: selectedPresentAddressProofId,
			// 	requestId: frontOnlyExtractionRes?.data?.request_id,
			// 	upload_doc_name: frontOnlyExtractionRes?.data?.s3?.filename,
			// 	isDocRemoveAllowed: false,
			// 	category: CONST_SECTIONS.DOC_CATEGORY_KYC,
			// 	doc_type_id: `app_${CONST_SECTIONS.DOC_CATEGORY_KYC}`,
			// };

			// TODO: Set doc to redux
			// setLoanDocuments([frontOnlyFile]);
			// this ends here

			dispatch(
				setPresentAddressProofExtractionRes(frontOnlyExtractionRes?.data || {})
			);
			const newAddressProofExtractionData = {
				...(frontOnlyExtractionRes?.data?.extractionData || {}),
				doc_ref_id: frontOnlyExtractionRes?.data?.doc_ref_id,
				requestId: frontOnlyExtractionRes?.data?.request_id,
			};
			prepopulateAadhaarAndAddressState(newAddressProofExtractionData);
			await verifyKycAddressProof(
				selectedPresentAddressProofId,
				newAddressProofExtractionData
			);
		} catch (error) {
			console.error('error-pan-verification-onClickFetchAddress-', error);
		} finally {
			setLoading(false);
			setFetchingAddress(false);
		}
	};
	const submitAddressDetails = async () => {
		let addressDetailsCustomReqBody = {
			loan_address_details: [
				{
					aid: 1,
					line1: formState.values.present_address1,
					line2: formState.values.present_address2,
					locality: formState.values.present_address3,
					pincode: formState.values.present_pin_code,
					city: formState.values.permanent_city,
					state: formState.values.permanent_state,
					residential_type: formState.values.present_property_type,
					residential_stability: formState.values.present_property_tenure,
				},
				{
					aid: 2,
					line1: formState.values.permanent_address1,
					line2: formState.values.permanent_address2,
					locality: formState.values.permanent_address3,
					pincode: formState.values.permanent_pin_code,
					city: formState.values.permanent_city,
					state: formState.values.permanent_state,
					residential_type: formState.values.permanent_property_type,
					residential_stability: formState.values.permanent_property_tenure,
				},
			],
		};
		const reqBody = formatSectionReqBody({
			section: selectedSection,
			values: formState.values,
			app,
			applicantCoApplicants,
			application,
		});
		reqBody.data = addressDetailsCustomReqBody;
		// console.log(reqBody, '111222333', formState);
		const addressDetailsRes = await axios.post(
			`${API_END_POINT}/basic_details`,
			reqBody
		);
	};
	const onProceed = async () => {
		try {
			// if (Object.keys(formState.values).length === 0) return onSkip();
			setLoading(true);
			await submitAddressDetails();
			// const addressDetailsReqBody = formatSectionReqBody({
			// 	section: selectedSection,
			// 	values: formState.values,
			// 	app,
			// 	applicantCoApplicants,
			// 	application,
			// });
			// const basicDetailsRes = await axios.post(
			// 	`/basic_details`,
			// 	addressDetailsReqBody
			// );
			// console.log('onProceed-addressDetailsReqBody-', {
			// 	addressDetailsReqBody,
			// });
			const newAddressDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
			newAddressDetails.directorId = selectedApplicantCoApplicantId;
			if (isApplicant) {
				dispatch(updateApplicantSection(newAddressDetails));
			} else {
				dispatch(updateCoApplicantSection(newAddressDetails));
			}
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-AddressDetails-onProceed-', error);
			// TODO: below line is used for testing remove this before push
			// dispatch(setSelectedSectionId(nextSectionId));
		} finally {
			setLoading(false);
		}
	};

	const onSkip = () => {
		dispatch(
			updateApplicantSection({
				sectionId: selectedSectionId,
				sectionValues: { isSkip: true },
			})
		);
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prefilledValues = field => {
		try {
			// console.log('prefilledValues-', field);
			if (isSameAsAboveAddressChecked) {
				return formState?.values?.[
					field?.name?.replace(CONST.PREFIX_PERMANENT, CONST.PREFIX_PRESENT)
				];
			}
			if (formState?.values?.[field.name] !== undefined) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			if (isApplicant) {
				return (
					applicant?.[selectedSectionId]?.[field?.name] || field.value || ''
				);
			}
			if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
				return formState?.values?.[field.name] || field.value || '';
			}
			if (selectedApplicantCoApplicantId) {
				return (
					coApplicants?.[selectedApplicantCoApplicantId]?.[selectedSectionId]?.[
						field?.name
					] ||
					field.value ||
					''
				);
			}
			return '';
		} catch (error) {
			return {};
		}
	};

	let isInActiveAddressProofUpload = false;
	let isProceedDisabledAddressProof = true;

	if (!selectedPresentAddressProofId) {
		isInActiveAddressProofUpload = true;
		isProceedDisabledAddressProof = true;
	}

	if (selectedPresentAddressProofId) {
		const isFrontTagged =
			presentAddressProofDocs?.filter(
				f => f?.isTagged?.id === selectedPresentDocumentTypes?.[0]?.id
			).length > 0;
		const isBackTagged =
			presentAddressProofDocs?.filter(
				f => f?.isTagged?.id === selectedPresentDocumentTypes?.[1]?.id
			).length > 0;
		const isFrontBackTagged =
			presentAddressProofDocs?.filter(
				f => f?.isTagged?.id === selectedPresentDocumentTypes?.[2]?.id
			).length > 0;
		if (isFrontTagged && !isBackTagged && !isFrontBackTagged) {
			isProceedDisabledAddressProof = false;
		}
		if (!isFrontTagged && isBackTagged && !isFrontBackTagged) {
			isProceedDisabledAddressProof = false;
		}
		if (isFrontTagged && isBackTagged && !isFrontBackTagged) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = false;
		}
		if (isFrontBackTagged && !isFrontTagged && !isBackTagged) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = false;
		}
		if (presentAddressProofError) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = true;
		}
		if (presentAddressProofDocs.filter(f => !f?.isTagged?.id).length > 0) {
			isInActiveAddressProofUpload = true;
			isProceedDisabledAddressProof = true;
		}
	}

	if (loading) {
		isProceedDisabledAddressProof = true;
	}

	const addressProofUploadSection = selectedSection?.sub_sections?.[0] || {};
	const selectAddressProofRadioField =
		addressProofUploadSection?.fields?.[0] || {};
	const addressFields = selectedSection?.sub_sections?.[1]?.fields || [];
	// const isPresentAddressProofExtracted =
	// 	presentAddressProofDocs.length <= 0 ||
	// 	Object.keys(presentAddressProofExtractionRes || {}).length <= 0;

	const isPresentAddressProofExtracted = presentAddressProofDocs.length <= 0;

	// console.log('AddressDetails-allProps-', {
	// 	applicant,
	// 	coApplicants,
	// 	selectedApplicant,
	// 	selectedPresentAddressProofId,
	// 	presentAddressProofDocs,
	// 	selectedPresentDocumentTypes,
	// 	isSameAsAboveAddressChecked,
	// });

	return (
		<UI_SECTIONS.Wrapper>
			{isAadhaarOtpModalOpen && (
				<AadhaarOTPModal
					isAadhaarOtpModalOpen={isAadhaarOtpModalOpen}
					setIsAadhaarOtpModalOpen={setIsAadhaarOtpModalOpen}
					aadhaarGenOtpResponse={
						applicantCoApplicants.generateAadhaarOtpResponse
					}
					// setIsVerifyWithOtpDisabled={setIsVerifyWithOtpDisabled}
				/>
			)}
			{/*  PREFIX_PRESENT */}
			<UI.HeaderWrapper>
				<UI.HeaderTitle>Help us with Address details</UI.HeaderTitle>
				{/* <UI.Tip> */}
				<Hint
					hint='Please uplaod the document with KYC image in Portrait Mode'
					hintIconName='Portrait Mode'
				/>
				{/* </UI.Tip> */}
			</UI.HeaderWrapper>

			<UI.SubSectionCustomHeader>
				<h4>
					Select any one of the documents mentioned below for{' '}
					<strong>Permanent Address</strong>
					<span className='text-danger'>*</span>
				</h4>
				<span />
			</UI.SubSectionCustomHeader>
			<UI.RadioButtonWrapper>
				{selectAddressProofRadioField?.options?.map((option, optionIndex) => {
					return (
						<UI.CardRadioButton key={`option${optionIndex}${option.value}`}>
							<input
								name={selectAddressProofRadioField?.name}
								id={option.value}
								type='radio'
								// value={option.value}
								onChange={e => {
									// TODO: remove document only belongs to app/coapp
									// if document is tagged alert user for removal of all document
									// removeAllAddressProofDocs()
									dispatch(setSelectedPresentAddressProofId(option.value));
								}}
								checked={selectedPresentAddressProofId === option.value}
								visibility='visible'
							/>
							<label htmlFor={option.value} style={{ marginLeft: '10px' }}>
								{option.label}
							</label>
						</UI.CardRadioButton>
					);
				})}
			</UI.RadioButtonWrapper>
			<Hint
				hint='You can choose to upload document or enter Aadhaar Number to proceed with Address Details'
				showIcon={false}
			/>
			<AddressProofUpload
				isInActive={isInActiveAddressProofUpload}
				startingTaggedDocs={presentAddressProofDocs}
				section={CONST.ADDRESSPROOF}
				sectionType={selectedPresentAddressProofId}
				docTypeOptions={selectedPresentDocumentTypes}
				onDrop={files => handleFileUploadAddressProof(files, CONST.AID_PRESENT)}
				onRemoveFile={handleFileRemoveAddressProof}
				docs={presentAddressProofDocs}
				setDocs={newDocs => {
					const newAddressProofDocs = [];
					presentAddressProofDocsRef?.current?.map(d =>
						newAddressProofDocs.push(d)
					);
					newDocs.map(d =>
						newAddressProofDocs.push({ ...d, aid: CONST.AID_PRESENT })
					);
					setPresentAddressProofDocs(newAddressProofDocs);
					presentAddressProofDocsRef.current = newAddressProofDocs;
				}}
				documentTypeChangeCallback={handleDocumentTypeChangeAddressProof}
				addressProofUploadSection={addressProofUploadSection}
				selectedApplicant={selectedApplicant}
				onClickFetchAddress={onClickFetchAddress}
				fetchingAddress={fetchingAddress}
				register={register}
				formState={formState}
				onChangeFormStateField={onChangeFormStateField}
				prefilledValues={prefilledValues}
				addressProofError={presentAddressProofError}
				setAddressProofError={setPresentAddressProofError}
				onClickVerifyWithOtp={onClickVerifyWithOtp}
				verifyingWithOtp={verifyingWithOtp}
			/>
			<UI_SECTIONS.FormWrapGrid>
				{addressFields?.map((field, fieldIndex) => {
					const customField = _.cloneDeep(field);
					customField.name = `${CONST.PREFIX_PRESENT}${customField.name}`;
					if (!customField.visibility) return null;
					const customFieldProps = {};
					if (field.name === 'property_tenure') {
						customFieldProps.max = moment().format('YYYY-MM');
					}
					if (isPresentAddressProofExtracted) customFieldProps.disabled = true;
					return (
						<UI_SECTIONS.FieldWrapGrid
							key={`field-${fieldIndex}-${customField.name}`}
						>
							{register({
								...customField,
								value: prefilledValues(customField),
								...customFieldProps,
								visibility: 'visible',
							})}
							{(formState?.submit?.isSubmited ||
								formState?.touched?.[customField.name]) &&
								formState?.error?.[customField.name] && (
									<UI_SECTIONS.ErrorMessage>
										{formState?.error?.[customField.name]}
									</UI_SECTIONS.ErrorMessage>
								)}
						</UI_SECTIONS.FieldWrapGrid>
					);
				})}
			</UI_SECTIONS.FormWrapGrid>
			<div style={{ marginTop: 100 }} />
			{/* PREFIX_PERMANENT */}
			<UI.SubSectionCustomHeader>
				<h4>
					{/* TODO: next release */}
					{/* Select any one of the documents mentioned below for{' '}
					<strong>Present Address</strong> */}
				</h4>
				<h4>
					<UI.CheckboxSameAs
						type='checkbox'
						id={CONST.CHECKBOX_SAME_AS_ID}
						checked={!!isSameAsAboveAddressChecked}
						onChange={() => {
							dispatch(
								setIsSameAsAboveAddressChecked(!isSameAsAboveAddressChecked)
							);
						}}
					/>
					<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
						Same as Permanent Address
					</label>
				</h4>
			</UI.SubSectionCustomHeader>
			<UI_SECTIONS.FormWrapGrid>
				{addressFields?.map((field, fieldIndex) => {
					const customField = _.cloneDeep(field);
					customField.name = `${CONST.PREFIX_PERMANENT}${customField.name}`;
					if (!customField.visibility) return null;
					const customFieldProps = {};
					if (isSameAsAboveAddressChecked) customField.disabled = true;
					if (isPresentAddressProofExtracted) customFieldProps.disabled = true;
					return (
						<UI_SECTIONS.FieldWrapGrid
							key={`field-${fieldIndex}-${customField.name}`}
						>
							{register({
								...customField,
								value: prefilledValues(customField),
								...customFieldProps,
								visibility: 'visible',
							})}
							{(formState?.submit?.isSubmited ||
								formState?.touched?.[customField.name]) &&
								formState?.error?.[customField.name] &&
								(customField.sub_fields ? (
									<UI_SECTIONS.ErrorMessageSubFields>
										{formState?.error?.[customField.name]}
									</UI_SECTIONS.ErrorMessageSubFields>
								) : (
									<UI_SECTIONS.ErrorMessage>
										{formState?.error?.[customField.name]}
									</UI_SECTIONS.ErrorMessage>
								))}
						</UI_SECTIONS.FieldWrapGrid>
					);
				})}
			</UI_SECTIONS.FormWrapGrid>
			<UI_SECTIONS.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={isProceedDisabledAddressProof}
					onClick={handleSubmit(onProceed)}
					// onClick={onProceed}
				/>
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default AddressDetails;
