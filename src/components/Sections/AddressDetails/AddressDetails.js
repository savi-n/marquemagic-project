//aid:1 = present address
//aid:2 = permanent address

import React, { useState, Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
import AadhaarOTPModal from './AadhaarOTPModal';
import AddressProofUpload from './AddressProofUpload';
import Hint from 'components/Hint';

import {
	// setIsSameAsAboveAddressChecked,
	updateApplicantSection,
	updateCoApplicantSection,
	setPresentAddressProofExtractionRes,
	setGenerateAadhaarOtpResponse,
	removeCacheDocument,
	addCacheDocuments,
} from 'store/applicantCoApplicantsSlice';
import { setSelectedSectionId } from 'store/appSlice';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
// import { getKYCData, getKYCDataId } from 'utils/request';
import {
	formatAddressProofDocTypeList,
	formatSectionReqBody,
} from 'utils/formatData';
// import { verifyKycDataUiUx } from 'utils/request';
import { isInvalidAadhaar } from 'utils/validation';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import SUB_SECTIONS_JSON from 'testdata/productjsons/m1.3_address_subsections.json';

const AddressDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const { loanProductId, loanId, createdByUserId } = application;
	const {
		isViewLoan,
		selectedProduct,
		selectedSectionId,
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
	const { directorId } = selectedApplicant;
	const selectedIncomeType =
		selectedApplicant?.basic_details?.[
			CONST_BASIC_DETAILS.INCOME_TYPE_FIELD_NAME
		];
	let { selectedSection } = app;
	selectedSection = _.cloneDeep(selectedSection);
	selectedSection.sub_sections = SUB_SECTIONS_JSON;
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
	const [
		permanentCacheDocumentsTemp,
		setPermanentCacheDocumentsTemp,
	] = useState([]);
	const [presentCacheDocumentsTemp, setPresentCacheDocumentsTemp] = useState(
		[]
	);
	// const [presentAddressProofDocs, setPresentAddressProofDocs] = useState([]);
	const [presentAddressProofError, setPresentAddressProofError] = useState('');
	const [permanentAddressProofError, setPermanentAddressProofError] = useState(
		''
	);
	const [isAadhaarOtpModalOpen, setIsAadhaarOtpModalOpen] = useState(false);
	const [
		isSameAsAboveAddressChecked,
		setIsSameAsAboveAddressChecked,
	] = useState(false);
	// const presentAddressProofDocsRef = useRef([]);
	const { addToast } = useToasts();

	// const addCacheDocumentTemp = file => {
	// 	const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
	// 	newCacheDocumentTemp.push(file);
	// 	setCacheDocumentsTemp(newCacheDocumentTemp);
	// };

	// const addCacheDocumentsTemp = files => {
	// 	const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
	// 	files.map(doc => {
	// 		newCacheDocumentTemp.push({ ...doc });
	// 		return null;
	// 	});
	// 	setCacheDocumentsTemp(newCacheDocumentTemp);
	// };

	// const removeCacheDocumentTemp = fieldName => {
	// 	// console.log('removeCacheDocumentTemp-', { fieldName, cacheDocumentsTemp });
	// 	const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
	// 	if (
	// 		cacheDocumentsTemp.filter(doc => doc.field.name === fieldName).length > 0
	// 	) {
	// 		setCacheDocumentsTemp(
	// 			newCacheDocumentTemp.filter(doc => doc.field.name !== fieldName)
	// 		);
	// 	} else {
	// 		dispatch(removeCacheDocument({ fieldName }));
	// 	}
	// };

	// const handleFileUploadAddressProof = (files, isPermanent) => {
	// 	const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
	// 	files.map(f => newCacheDocumentTemp.push(f));
	// 	setCacheDocumentsTemp(newCacheDocumentTemp);
	// 	// isPermanent
	// 	// ? setPermanentAddressProofError('')
	// 	// : setPresentAddressProofError('');

	// 	// let newAddressProofDocs = _.cloneDeep(presentAddressProofDocsRef.current);
	// 	// files.map(f => newAddressProofDocs.push(_.cloneDeep({ ...f, aid })));
	// 	// newAddressProofDocs = _.uniqBy(newAddressProofDocs, function(e) {
	// 	// 	return e.id;
	// 	// });
	// 	// // console.log('pan-verification-handleFileUploadAddressProof-', {
	// 	// //  files,
	// 	// //  newAddressProofDocs,
	// 	// //  addressProofDocs,
	// 	// //  selectedAddressProof,
	// 	// // });
	// 	// setPresentAddressProofDocs(newAddressProofDocs);
	// 	// presentAddressProofDocsRef.current = newAddressProofDocs;
	// 	// // setDisableSubmit(false);
	// 	// setPresentAddressProofError('');
	// };

	// const handleFileRemoveAddressProof = (docId, isPermanent) => {
	// 	const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp).filter(
	// 		doc => doc.id !== docId
	// 	);
	// 	setCacheDocumentsTemp(newCacheDocumentTemp);
	// 	// isPermanent
	// 	// ? setPermanentAddressProofError('')
	// 	// : setPresentAddressProofError('');
	// 	// console.log('handleFileRemoveAddressProof docId-', docId);
	// 	// dispatch(removeLoanDocument(docId));
	// 	// const newAddressProofDocs = _.cloneDeep(
	// 	// 	// eslint-disable-next-line
	// 	// 	fileRef.current.filter(f => f.id != docId)
	// 	// );
	// 	// fileRef.current = newAddressProofDocs;
	// 	// const newAddressProofDocs = _.cloneDeep(
	// 	// 	presentAddressProofDocsRef.current.filter(f => f.id !== docId)
	// 	// );
	// 	// setPresentAddressProofDocs(newAddressProofDocs);
	// 	// presentAddressProofDocsRef.current = newAddressProofDocs;
	// };

	// const handleDocumentTypeChangeAddressProof = async (fileId, type) => {
	// 	const newCacheDocumentTemp = [];
	// 	cacheDocumentsTemp.map(doc => {
	// 		const newDoc = _.cloneDeep(doc);
	// 		if (doc.id === fileId) {
	// 			newDoc.isTagged = type;
	// 			newDoc.doc_type_id = type.doc_type_id;
	// 		}
	// 		newCacheDocumentTemp.push(newDoc);
	// 		return null;
	// 	});
	// 	setCacheDocumentsTemp(newCacheDocumentTemp);
	// 	// dispatch(updateSelectedDocumentTypeId({ fileId, docType: type }));
	// 	// const newAddressProofDocs = [];
	// 	// presentAddressProofDocsRef?.current?.map(f => {
	// 	// 	const newFile = _.cloneDeep(f);
	// 	// 	if (f.id === fileId) {
	// 	// 		newFile.isTagged = type;
	// 	// 		newFile.doc_type_id = type.id;
	// 	// 	}
	// 	// 	newAddressProofDocs.push(newFile);
	// 	// 	return null;
	// 	// });

	// 	// console.log('handleDocumentTypeChangeAddressProof-', {
	// 	// 	addressProofDocs,
	// 	// 	newAddressProofDocs,
	// 	// });
	// 	// // fileRef.current = newAddressProofDocs;
	// 	// setPresentAddressProofDocs(newAddressProofDocs);
	// 	// presentAddressProofDocsRef.current = newAddressProofDocs;
	// };

	// const prepopulateAadhaarAndAddressState = extractionData => {
	// 	// console.log('prepopulateAadhaarAndAddressState-', extractionData);

	// 	const aadharNum = extractionData?.Aadhar_number?.replaceAll(
	// 		/\s/g,
	// 		''
	// 	).split('');
	// 	const aadhaarUnMasked = aadharNum?.join('') || '';
	// 	// const aadhaarMasked = aadharNum
	// 	// 	? 'XXXXXXXX' + aadharNum?.splice(8, 4).join('')
	// 	// 	: '';
	// 	onChangeFormStateField({
	// 		name: `aadhaar`,
	// 		value: aadhaarUnMasked,
	// 	});
	// 	// const fullName =
	// 	// 	extractionData?.name?.split(' ') || extractionData?.Name?.split(' ');
	// 	// const firstName = fullName[0].join(' ');
	// 	// const lastName = fullName[fullName.length - 1];
	// 	// const dob = extractionData?.DOB || extractionData?.dob;
	// 	// const dlNo = extractionData?.dl_no;
	// 	const fullAddress = extractionData?.address || extractionData?.Address;
	// 	onChangeFormStateField({
	// 		name: `${CONST.PREFIX_PRESENT}address1`,
	// 		value: fullAddress,
	// 	});
	// 	const pinCode = extractionData?.pincode;
	// 	if (fullAddress) {
	// 		let locationArr = fullAddress && fullAddress?.split(' ');
	// 		// eslint-disable-next-line
	// 		let y = locationArr?.map(e => !Number(isNaN(e)) && e);
	// 		// return Number(e) !== NaN && e;
	// 		let pin;
	// 		y.map(e => {
	// 			if (e?.length === 6) pin = e;
	// 			return null;
	// 		});

	// 		const extractedPinCode = pinCode || pin;
	// 		onChangeFormStateField({
	// 			name: `${CONST.PREFIX_PRESENT}pin_code`,
	// 			value: extractedPinCode,
	// 		});
	// 	}
	// };

	// const verifyKycAddressProof = async (
	// 	selectedAddressProof,
	// 	extractionData
	// ) => {
	// 	try {
	// 		// console.log('verifyKycAddressProof-', {
	// 		// 	selectedAddressProof,
	// 		// 	isVerifyKycData,
	// 		// 	extractionData,
	// 		// });
	// 		if (
	// 			!selectedProduct?.kyc_verification ||
	// 			selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_AADHAAR
	// 		)
	// 			return {};
	// 		const reqBody = {
	// 			doc_ref_id: extractionData?.doc_ref_id,
	// 			doc_type: selectedAddressProof,
	// 		};
	// 		if (selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_DL) {
	// 			reqBody.number = extractionData?.dl_no || '';
	// 			reqBody.dob = extractionData?.dob || extractionData?.DOB || '';
	// 		}
	// 		if (selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_VOTERID) {
	// 			reqBody.number = extractionData?.vid || '';
	// 			reqBody.state = extractionData?.state || '';
	// 			reqBody.name = extractionData?.Name || extractionData?.name || '';
	// 		}
	// 		if (selectedAddressProof === CONST_SECTIONS.EXTRACTION_KEY_PASSPORT) {
	// 			// TODO: verify by testing passport extraction data
	// 			reqBody.number = extractionData?.passport_no || '';
	// 			reqBody.dob = extractionData?.dob || extractionData?.DOB || '';
	// 			reqBody.name = extractionData?.Name || extractionData?.name || '';
	// 		}
	// 		const verifiedRes = await verifyKycDataUiUx(reqBody, clientToken);
	// 		return verifiedRes;
	// 	} catch (error) {
	// 		console.error('error-verifyKycDataUiUx-', error);
	// 		addToast({
	// 			message: error.message || 'Something Went Wrong. Try Again!',
	// 			type: 'error',
	// 		});
	// 		return {};
	// 	}
	// };

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
					API.AADHAAR_GENERATE_OTP,
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

	// const onClickFetchAddress = async (selectedAddressProofId, prefix) => {
	// 	try {
	// 		setLoading(true);
	// 		setFetchingAddress(true);
	// 		const REQ_TYPE = selectedAddressProofId.replaceAll(prefix, '');
	// 		setPresentAddressProofError('');
	// 		// TODO Filter selected address proof docs before extracting
	// 		const selectedAddressProofFiles = cacheDocumentsTemp?.filter(
	// 			f => f?.sectionType === selectedAddressProofId
	// 		);
	// 		if (selectedAddressProofFiles.length > 2) {
	// 			addToast({
	// 				message: 'Max 2 doucment is allowed',
	// 				type: 'error',
	// 			});
	// 			return;
	// 		}
	// 		// console.log(
	// 		// 	'onClickFetchAddress-selectedAddressProofFiles-',
	// 		// 	selectedAddressProofFiles
	// 		// );

	// 		// Front + Back Extract
	// 		if (selectedAddressProofFiles.length > 1) {
	// 			const frontFormData = new FormData();
	// 			frontFormData.append('product_id', selectedProduct.id);
	// 			frontFormData.append('req_type', REQ_TYPE);
	// 			frontFormData.append('process_type', 'extraction');
	// 			frontFormData.append('document', selectedAddressProofFiles[0].file);

	// 			const frontExtractionRes = await getKYCData(frontFormData, clientToken);
	// 			const frontExtractionStatus = frontExtractionRes?.data?.status || '';
	// 			const frontExtractionMsg = frontExtractionRes?.data?.message || '';
	// 			const frontForensicRes = frontExtractionRes?.data?.forensicData || {};
	// 			const frontForensicFlag = frontForensicRes?.flag?.toLowerCase() || '';
	// 			const frontForensicFlagMsg = frontForensicRes?.flag_message || '';

	// 			if (frontExtractionStatus === 'nok') {
	// 				setPresentAddressProofError(
	// 					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontExtractionMsg}`
	// 				);
	// 				return; // STOP FURTHER EXECUTION
	// 			}
	// 			if (frontForensicFlag === 'error') {
	// 				setPresentAddressProofError(
	// 					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontForensicFlagMsg}`
	// 				);
	// 				return; // STOP FURTHER EXECUTION
	// 			}
	// 			if (frontForensicFlag === 'warning') {
	// 				setPresentAddressProofError(
	// 					`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontForensicFlagMsg}`
	// 				);
	// 				// CONTINUE EXECUTION
	// 			}

	// 			// const frontFile = {
	// 			// 	...(frontExtractionRes?.data?.extractionData || {}),
	// 			// 	document_key: frontExtractionRes?.data?.s3?.fd,
	// 			// 	id: selectedAddressProofFiles[0].id,
	// 			// 	mainType: 'KYC',
	// 			// 	size: frontExtractionRes?.data?.s3?.size,
	// 			// 	type: 'other',
	// 			// 	req_type: selectedPresentAddressProofId, // requires for mapping with JSON
	// 			// 	requestId: frontExtractionRes?.data?.request_id,
	// 			// 	upload_doc_name: frontExtractionRes?.data?.s3?.filename,
	// 			// 	isDocRemoveAllowed: false,
	// 			// 	category: CONST_SECTIONS.DOC_CATEGORY_KYC,
	// 			// 	doc_type_id: `app_${CONST_SECTIONS.DOC_CATEGORY_KYC}`,
	// 			// };

	// 			// TODO: Set doc to Redux
	// 			// setLoanDocuments([frontFile]);
	// 			// this ends here

	// 			const backFormData = new FormData();
	// 			backFormData.append('product_id', selectedProduct.id);
	// 			backFormData.append('req_type', REQ_TYPE);
	// 			backFormData.append(
	// 				'ref_id',
	// 				frontExtractionRes?.data?.extractionData?.id
	// 			);
	// 			backFormData.append('doc_ref_id', frontExtractionRes?.data?.doc_ref_id);
	// 			backFormData.append('process_type', 'extraction');
	// 			backFormData.append('document', selectedAddressProofFiles[1].file);

	// 			const backExtractionRes = await getKYCDataId(backFormData, clientToken);
	// 			const backExtractionStatus = backExtractionRes?.data?.status || '';
	// 			const backExtractionMsg = backExtractionRes?.data?.message || '';
	// 			const backForensicRes = backExtractionRes?.data?.forensicData || {};
	// 			const backForensicFlag = backForensicRes?.flag?.toLowerCase() || '';
	// 			const backForensicFlagMsg = backForensicRes?.flag_message || '';

	// 			if (backExtractionStatus === 'nok') {
	// 				setPresentAddressProofError(
	// 					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${backExtractionMsg}`
	// 				);
	// 				return; // STOP FURTHER EXECUTION
	// 			}
	// 			if (backForensicFlag === 'error') {
	// 				setPresentAddressProofError(
	// 					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${backForensicFlagMsg}`
	// 				);
	// 				return; // STOP FURTHER EXECUTION
	// 			}
	// 			if (backForensicFlag === 'warning') {
	// 				setPresentAddressProofError(
	// 					`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${backForensicFlagMsg}`
	// 				);
	// 				// CONTINUE EXECUTION
	// 			}

	// 			// const backFile = {
	// 			// 	...(backExtractionRes?.data?.extractionData || {}),
	// 			// 	document_key: backExtractionRes?.data.s3.fd,
	// 			// 	id: selectedAddressProofFiles[1].id,
	// 			// 	mainType: 'KYC',
	// 			// 	size: backExtractionRes?.data.s3.size,
	// 			// 	type: 'other',
	// 			// 	req_type: selectedPresentAddressProofId,
	// 			// 	requestId: backExtractionRes?.data.request_id,
	// 			// 	upload_doc_name: backExtractionRes?.data.s3.filename,
	// 			// 	isDocRemoveAllowed: false,
	// 			// 	category: CONST_SECTIONS.DOC_CATEGORY_KYC,
	// 			// 	doc_type_id: `app_${CONST_SECTIONS.DOC_CATEGORY_KYC}`,
	// 			// };
	// 			// TODO: Set doc to Redux
	// 			// setLoanDocuments([backFile]);
	// 			// this ends here

	// 			dispatch(
	// 				setPresentAddressProofExtractionRes(backExtractionRes?.data || {})
	// 			);
	// 			const newAddressProofExtractionData = {
	// 				...backExtractionRes?.data?.extractionData,
	// 				doc_ref_id: frontExtractionRes?.data?.doc_ref_id,
	// 				requestId: backExtractionRes?.data.request_id,
	// 			};
	// 			// console.log(newAddressProofExtractionData, '2222');
	// 			prepopulateAadhaarAndAddressState(newAddressProofExtractionData);
	// 			await verifyKycAddressProof(REQ_TYPE, newAddressProofExtractionData);
	// 			return;
	// 		}

	// 		// Front Only Extract
	// 		const frontOnlyFormData = new FormData();
	// 		frontOnlyFormData.append('product_id', selectedProduct.id);
	// 		frontOnlyFormData.append('req_type', REQ_TYPE);
	// 		frontOnlyFormData.append('process_type', 'extraction');
	// 		frontOnlyFormData.append('document', selectedAddressProofFiles[0].file);

	// 		const frontOnlyExtractionRes = await getKYCData(
	// 			frontOnlyFormData,
	// 			clientToken
	// 		);
	// 		const frontOnlyExtractionStatus =
	// 			frontOnlyExtractionRes?.data?.status || '';
	// 		const frontOnlyExtractionMsg =
	// 			frontOnlyExtractionRes?.data?.message || '';
	// 		const frontOnlyForensicRes =
	// 			frontOnlyExtractionRes?.data?.forensicData || {};
	// 		const frontOnlyForensicFlag =
	// 			frontOnlyForensicRes?.flag?.toLowerCase() || '';
	// 		const frontOnlyForensicFlagMsg = frontOnlyForensicRes?.flag_message || '';

	// 		if (frontOnlyExtractionStatus === 'nok') {
	// 			setPresentAddressProofError(
	// 				`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyExtractionMsg}`
	// 			);
	// 			return; // STOP FURTHER EXECUTION
	// 		}
	// 		if (frontOnlyForensicFlag === 'error') {
	// 			setPresentAddressProofError(
	// 				`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyForensicFlagMsg}`
	// 			);
	// 			return; // STOP FURTHER EXECUTION
	// 		}
	// 		if (frontOnlyForensicFlag === 'warning') {
	// 			setPresentAddressProofError(
	// 				`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontOnlyForensicFlagMsg}`
	// 			);
	// 			// CONTINUE EXECUTION
	// 		}

	// 		const frontOnlyFile = {
	// 			// field,
	// 			extractionRes: frontOnlyExtractionRes?.data || {},
	// 			document_key: frontOnlyExtractionRes?.data?.s3?.fd,
	// 			id: selectedAddressProofFiles[0].id,
	// 			mainType: 'KYC',
	// 			size: frontOnlyExtractionRes?.data?.s3?.size,
	// 			type: 'other',
	// 			req_type: REQ_TYPE,
	// 			requestId: frontOnlyExtractionRes?.data?.request_id,
	// 			upload_doc_name: frontOnlyExtractionRes?.data?.s3?.filename,
	// 			isDocRemoveAllowed: false,
	// 			category: CONST_SECTIONS.DOC_CATEGORY_KYC,
	// 			doc_type_id: `app_${CONST_SECTIONS.DOC_CATEGORY_KYC}`,
	// 		};
	// 		addCacheDocumentTemp(frontOnlyFile);
	// 		// TODO: Set doc to redux
	// 		// setLoanDocuments([frontOnlyFile]);
	// 		// this ends here

	// 		dispatch(
	// 			setPresentAddressProofExtractionRes(frontOnlyExtractionRes?.data || {})
	// 		);
	// 		const newAddressProofExtractionData = {
	// 			...(frontOnlyExtractionRes?.data?.extractionData || {}),
	// 			doc_ref_id: frontOnlyExtractionRes?.data?.doc_ref_id,
	// 			requestId: frontOnlyExtractionRes?.data?.request_id,
	// 		};
	// 		prepopulateAadhaarAndAddressState(newAddressProofExtractionData);
	// 		await verifyKycAddressProof(REQ_TYPE, newAddressProofExtractionData);
	// 	} catch (error) {
	// 		console.error('error-pan-verification-onClickFetchAddress-', error);
	// 	} finally {
	// 		setLoading(false);
	// 		setFetchingAddress(false);
	// 	}
	// };

	const onProceed = async () => {
		try {
			// if (Object.keys(formState.values).length === 0) return onSkip();
			setLoading(true);
			const newLoanAddressDetails = [
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
			];
			const addressDetailsReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
				values: formState.values,
			});

			addressDetailsReqBody.loan_address_details = newLoanAddressDetails;
			console.log('addressDetailsReqBody-', {
				addressDetailsReqBody,
			});
			// reqBody.data = addressDetailsCustomReqBody;
			const addressDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				addressDetailsReqBody
			);
			console.log('addressDetailsRes-', { addressDetailsRes });
			const cacheDocumentsTemp = [
				...permanentCacheDocumentsTemp,
				...presentCacheDocumentsTemp,
			];
			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc.requestId,
							doc_type_id: doc.selectedDocTypeId,
							is_delete_not_allowed: true,
							director_id: directorId,
							file: null,
						});
						return null;
					});
					if (uploadCacheDocumentsTemp.length) {
						const uploadCacheDocumentsTempReqBody = {
							loan_id: loanId,
							request_ids_obj: uploadCacheDocumentsTemp,
							user_id: createdByUserId,
						};
						// console.log('uploadCacheDocumentsTempReqBody-', {
						// 	uploadCacheDocumentsTempReqBody,
						// });
						await axios.post(
							API.UPLOAD_CACHE_DOCS,
							uploadCacheDocumentsTempReqBody,
							{
								headers: {
									Authorization: clientToken,
								},
							}
						);
						dispatch(
							addCacheDocuments({
								files: uploadCacheDocumentsTemp,
							})
						);
					}
				} catch (error) {
					console.error('error-', error);
				}
			}
			const newAddressDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
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

	const prefilledValues = field => {
		try {
			// console.log('prefilledValues-', field);
			if (isSameAsAboveAddressChecked) {
				return formState?.values?.[
					field?.name?.replace(CONST.PREFIX_PRESENT, CONST.PREFIX_PERMANENT)
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
					selectedApplicant?.[selectedSectionId]?.[field?.name] ||
					field.value ||
					''
				);
			}
			if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
				return formState?.values?.[field.name] || field.value || '';
			}
			if (selectedApplicantCoApplicantId) {
				return (
					selectedApplicant?.[selectedSectionId]?.[field?.name] ||
					field.value ||
					''
				);
			}
			return '';
		} catch (error) {
			return {};
		}
	};

	// let isProceedDisabledAddressProof = true;

	// if (loading) {
	// 	isProceedDisabledAddressProof = true;
	// }

	console.log('AddressDetails-allProps-', {
		applicant,
		coApplicants,
		selectedApplicant,
		isSameAsAboveAddressChecked,
		formState,
	});

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
			{selectedSection?.sub_sections?.map((sub_section, subSectionIndex) => {
				let isInActiveAddressProofUpload = false;

				const isPermanent = sub_section.aid === CONST.AID_PERMANENT;
				const selectedAddressProofFieldName = isPermanent
					? CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
					: CONST.PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME;
				const selectedAddressProofId =
					formState.values[selectedAddressProofFieldName];

				const selectedAddressProofTypeOption = sub_section.fields
					.filter(field => field.name === selectedAddressProofFieldName)?.[0]
					?.options?.filter(o => o.value === selectedAddressProofId)?.[0];

				const selectedDocTypeId =
					selectedAddressProofTypeOption?.doc_type?.[selectedIncomeType];
				const prefix = isPermanent
					? CONST.PREFIX_PERMANENT
					: CONST.PREFIX_PRESENT;
				const selectedDocumentTypes = formatAddressProofDocTypeList({
					selectedAddressProofId,
					prefix,
				});

				if (!selectedAddressProofId) {
					isInActiveAddressProofUpload = true;
				}

				const cacheDocumentsTemp = isPermanent
					? permanentCacheDocumentsTemp
					: presentCacheDocumentsTemp;

				if (selectedAddressProofId) {
					const isFrontTagged =
						cacheDocumentsTemp?.filter(
							f => f?.isTagged?.id === selectedDocumentTypes?.[0]?.id
						).length > 0;
					const isBackTagged =
						cacheDocumentsTemp?.filter(
							f => f?.isTagged?.id === selectedDocumentTypes?.[1]?.id
						).length > 0;
					const isFrontBackTagged =
						cacheDocumentsTemp?.filter(
							f => f?.isTagged?.id === selectedDocumentTypes?.[2]?.id
						).length > 0;
					// if (isFrontTagged && !isBackTagged && !isFrontBackTagged) {
					// 	isProceedDisabledAddressProof = false;
					// }
					// if (!isFrontTagged && isBackTagged && !isFrontBackTagged) {
					// 	isProceedDisabledAddressProof = false;
					// }
					if (isFrontTagged && isBackTagged && !isFrontBackTagged) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = false;
					}
					if (isFrontBackTagged && !isFrontTagged && !isBackTagged) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = false;
					}
					if (presentAddressProofError) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = true;
					}
					if (cacheDocumentsTemp.filter(f => !f?.isTagged?.id).length > 0) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = true;
					}
				}
				selectedDocTypeId &&
					console.log(
						'%c sub_sections_selectedDocumentTypes-',
						'color: green',
						{
							sub_section,
							isPermanent,
							selectedAddressProofId,
							selectedDocumentTypes,
							selectedAddressProofTypeOption,
						}
					);
				return (
					<Fragment key={`section-${subSectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<>
								<UI_SECTIONS.SubSectionHeader>
									{sub_section.name}
								</UI_SECTIONS.SubSectionHeader>
								<Hint
									hint='Please uplaod the document with KYC image in Portrait Mode'
									hintIconName='Portrait Mode'
								/>
							</>
						) : null}
						{sub_section.id.includes(CONST.ADDRESS_PROOF_UPLOAD_SECTION_ID) && (
							<UI.SubSectionCustomHeader style={{ marginTop: 40 }}>
								<h4>
									Select any one of the documents mentioned below for{' '}
									<strong>
										{sub_section?.name ? 'Permanent' : 'Present'} Address
									</strong>
									<span style={{ color: 'red' }}>*</span>
								</h4>
								<h4>
									{sub_section?.name ? null : (
										<>
											<UI.CheckboxSameAs
												type='checkbox'
												id={CONST.CHECKBOX_SAME_AS_ID}
												checked={!!isSameAsAboveAddressChecked}
												onChange={() => {
													setIsSameAsAboveAddressChecked(
														!isSameAsAboveAddressChecked
													);
													// dispatch(
													// 	setIsSameAsAboveAddressChecked(
													// 		!isSameAsAboveAddressChecked
													// 	)
													// );
												}}
											/>
											<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
												Same as Present Address
											</label>
										</>
									)}
								</h4>
							</UI.SubSectionCustomHeader>
						)}
						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								if (!field.visibility || !field.name || !field.type)
									return null;
								const newValue = prefilledValues(field);
								const customFieldProps = {};
								const customStyle = {};

								if (
									isSameAsAboveAddressChecked &&
									field.name.includes(CONST.PREFIX_PRESENT)
								) {
									customFieldProps.disabled = true;
								}
								const isVerifyWithOtpField = field.name.includes(
									CONST.AADHAAR_FIELD_NAME
								);
								const isIdProofUploadField =
									field.type === 'file' &&
									field.name.includes(CONST.ID_PROOF_UPLOAD_FIELD_NAME);
								if (isVerifyWithOtpField) return null;
								if (field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)) {
									customStyle.gridColumn = 'span 2';
								}
								if (
									sub_section.aid === CONST.AID_PRESENT &&
									isSameAsAboveAddressChecked
								) {
									if (CONST.HIDE_PRESENT_ADDRESS_FIELDS.includes(field.name))
										return null;
								}
								if (isIdProofUploadField) {
									return (
										<UI_SECTIONS.FieldWrapGrid style={{ gridColumn: 'span 2' }}>
											<AddressProofUpload
												prefix={prefix}
												isPermanent={isPermanent}
												field={field}
												register={register}
												formState={formState}
												isInActive={isInActiveAddressProofUpload}
												// startingTaggedDocs={cacheDocumentsTemp}
												// section={CONST.ADDRESSPROOF}
												selectedAddressProofId={selectedAddressProofId}
												selectedAddressProofFieldName={
													selectedAddressProofFieldName
												}
												docTypeOptions={selectedDocumentTypes}
												// onDrop={files =>
												// 	handleFileUploadAddressProof(files, isPermanent)
												// }
												// onRemoveFile={docId =>
												// 	handleFileRemoveAddressProof(docId, isPermanent)
												// }
												// docs={cacheDocumentsTemp}
												// setDocs={addCacheDocumentsTemp}
												// setDocs={newDocs => {
												// 	const newAddressProofDocs = [];
												// 	presentAddressProofDocsRef?.current?.map(d =>
												// 		newAddressProofDocs.push(d)
												// 	);
												// 	newDocs.map(d =>
												// 		newAddressProofDocs.push({
												// 			...d,
												// 			aid: CONST.AID_PRESENT,
												// 		})
												// 	);
												// 	setPresentAddressProofDocs(newAddressProofDocs);
												// 	presentAddressProofDocsRef.current = newAddressProofDocs;
												// }}
												// documentTypeChangeCallback={
												// 	handleDocumentTypeChangeAddressProof
												// }
												addressProofUploadSection={sub_section}
												selectedApplicant={selectedApplicant}
												// onClickFetchAddress={onClickFetchAddress}
												fetchingAddress={fetchingAddress}
												onChangeFormStateField={onChangeFormStateField}
												prefilledValues={prefilledValues}
												addressProofError={
													isPermanent
														? permanentAddressProofError
														: presentAddressProofError
												}
												setAddressProofError={
													isPermanent
														? setPermanentAddressProofError
														: setPresentAddressProofError
												}
												onClickVerifyWithOtp={onClickVerifyWithOtp}
												verifyingWithOtp={verifyingWithOtp}
												cacheDocumentsTemp={cacheDocumentsTemp}
												setCacheDocumentsTemp={
													isPermanent
														? setPermanentCacheDocumentsTemp
														: setPresentCacheDocumentsTemp
												}
												// addCacheDocumentTemp={addCacheDocumentTemp}
												// removeCacheDocumentTemp={removeCacheDocumentTemp}
												selectedDocTypeId={selectedDocTypeId}
											/>
										</UI_SECTIONS.FieldWrapGrid>
									);
								}
								if (field?.for_type_name) {
									if (
										!field?.for_type.includes(
											formState?.values?.[field?.for_type_name]
										)
									)
										return null;
								}
								return (
									<UI_SECTIONS.FieldWrapGrid
										key={`field-${fieldIndex}-${field.name}`}
										style={customStyle}
									>
										{register({
											...field,
											value: newValue,
											visibility: 'visible',
											...customFieldProps,
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name] && (
												<UI_SECTIONS.ErrorMessage>
													{formState?.error?.[field.name]}
												</UI_SECTIONS.ErrorMessage>
											)}
									</UI_SECTIONS.FieldWrapGrid>
								);
							})}
						</UI_SECTIONS.FormWrapGrid>
					</Fragment>
				);
			})}
			<UI_SECTIONS.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed)}
				/>
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default AddressDetails;
