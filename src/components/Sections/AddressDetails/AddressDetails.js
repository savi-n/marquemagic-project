//aid:1 = present address
//aid:2 = permanent address

import React, { useEffect, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import * as _ from 'lodash';

import Button from 'components/Button';
import AadhaarOTPModal from './AadhaarOTPModal';
import AddressProofUpload from './AddressProofUpload';
import Hint from 'components/Hint';
import NavigateCTA from 'components/Sections/NavigateCTA';
import Loading from 'components/Loading';
import BiometricModal from './BiometricModal';

import { setSelectedSectionId } from 'store/appSlice';
import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	formatAadhaarOtpResponse,
	formatAddressProofDocTypeList,
	formatSectionReqBody,
	getApiErrorMessage,
	isFieldValid,
	getSelectedField,
	getSelectedSubField,
	getAllCompletedSections,
	formatAddressType,
	isDirectorApplicant,
} from 'utils/formatData';
import {
	getDirectors,
	setCompletedDirectorSection,
} from 'store/directorsSlice';
import { isInvalidAadhaar } from 'utils/validation';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import * as CONST_SECTIONS from 'components/Sections/const';
// import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as CONST_ADDRESS_DETAILS from 'components/Sections/AddressDetails/const';
import { asyncForEach, scrollToTopRootElement } from 'utils/helper';
import { API_END_POINT } from '_config/app.config';
import { encryptBase64 } from 'utils/encrypt';

const AddressDetails = props => {
	const { app, application } = useSelector(state => state);
	const { selectedDirectorId, directors } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const {
		loanProductId,
		loanId,
		businessUserId,
		createdByUserId,
		loanRefId,
	} = application;
	const {
		isDraftLoan,
		selectedSectionId,
		nextSectionId,
		isTestMode,
		clientToken,
		selectedSection,
		permission,
		selectedProduct,
		whiteLabelId,
	} = app;
	const { isCountryIndia } = permission;
	let { isViewLoan, isEditLoan, isEditOrViewLoan } = app;
	const { directorId } = selectedDirector;
	if (isDraftLoan && !selectedDirector?.permanent_address1) {
		isViewLoan = false;
		isEditLoan = false;
		isEditOrViewLoan = false;
	}
	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [loading, setLoading] = useState(false);
	const [verifyingWithOtp, setVerifyingWithOtp] = useState(false);
	const [
		asPerDocAddressDocumentsTemp,
		setAsPerDocAddressDocumentsTemp,
	] = useState([]);
	const [
		otherAsPerDocAddressCacheDocTemp,
		setOtherAsPerDocAddressCacheDocTemp,
	] = useState([]);
	const [asPerDocAddressProofError, setAsPerDocAddressProofError] = useState(
		''
	);
	const [
		permanentCacheDocumentsTemp,
		setPermanentCacheDocumentsTemp,
	] = useState([]);
	const [presentCacheDocumentsTemp, setPresentCacheDocumentsTemp] = useState(
		[]
	);
	const [otherPermanentCacheDocTemp, setOtherPermanentCacheDocTemp] = useState(
		[]
	);
	const [otherPresentCacheDocTemp, setOtherPresentCacheDocTemp] = useState([]);
	// const [presentAddressProofDocs, setPresentAddressProofDocs] = useState([]);
	const [presentAddressProofError, setPresentAddressProofError] = useState('');
	const [permanentAddressProofError, setPermanentAddressProofError] = useState(
		''
	);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState({});
	const [editSectionIds, setEditSectionIds] = useState({
		businessAddressIdAid1: '',
		businessAddressIdAid2: '',
	});
	const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
	const [biometricRes, setBiometricRes] = useState(null);

	const selectedIncomeType =
		sectionData?.director_details?.income_type === 0
			? '0'
			: sectionData?.director_details?.income_type ||
			  selectedDirector?.income_type ||
			  '';
	const [isAadhaarOtpModalOpen, setIsAadhaarOtpModalOpen] = useState(false);
	const [
		isSameAsAboveAddressChecked,
		setIsSameAsAboveAddressChecked,
	] = useState(null);
	const [
		isSameAsDocAddrForPermanentChecked,
		setIsSameAsDocAddrForPermanentChecked,
	] = useState(null);
	const [
		isSameAsDocAddrForPresentChecked,
		setIsSameAsDocAddrForPresentChecked,
	] = useState(null);
	const [
		isPermanentAddressIsPresentAddress,
		setIsPermanentAddressIsPresentAddress,
	] = useState(false);
	// const presentAddressProofDocsRef = useRef([]);
	const { addToast } = useToasts();
	const completedSections = getAllCompletedSections({
		application,
		selectedDirector,
		isApplicant,
	});
	const isSectionCompleted = completedSections.includes(selectedSectionId);
	const [aadharOtpResponse, setAadharOtpResponse] = useState({});
	const [verifyOtpResponseTemp, setVerifyOtpResponseTemp] = useState(null);
	const [initialAddress, setInitialAddress] = useState(null);
	let selectedVerifyOtp = verifyOtpResponseTemp || null;
	const disableFieldIfPrefilled =
		selectedProduct?.product_details?.disable_fields_if_prefilled;

	// Garbage piece of code for as per doc listing
	const selectedAsPerDocField = selectedSection?.sub_sections
		?.filter(
			subSection => `${subSection?.aid}` === CONST.AID_AS_PER_DOCUMENT
		)?.[0]
		?.fields?.filter(
			field => field?.name === 'as_per_document_address_proof_type'
		)?.[0]
		?.options?.filter(option => option?.name === 'as_per_document_aadhaar')?.[0]
		?.doc_type;

	const asPerDocAdhaarDocType =
		selectedAsPerDocField && Object.values(selectedAsPerDocField);
	// console.log(
	// 	'🚀 ~ selectedAsPerDocField:',
	// 	selectedAsPerDocField,
	// 	asPerDocAdhaarDocType
	// );

	const doesAddressDetailsHasMoreThanTwoSubsection =
		(
			selectedSection?.sub_sections?.filter(subSection =>
				subSection?.id?.includes('as_per_document_address')
			) || []
		).length > 0;

	if (
		sectionData?.director_details?.is_aadhaar_verified_with_otp &&
		!selectedVerifyOtp
	) {
		selectedVerifyOtp = {
			res: {
				status: 'ok',
			},
		};
	}
	const selectedPermanentAadhaarField = getSelectedField({
		fieldName: CONST.AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT,
		selectedSection,
		isApplicant,
	});

	const selectedAsPerDocAadhaarField = getSelectedField({
		fieldName: CONST.AADHAAR_FIELD_NAME_FOR_OTP_AS_PER_DOCUMENT,
		selectedSection,
		isApplicant,
	});

	const asPerDocVerifyWithOtpSubField = getSelectedSubField({
		fields: selectedAsPerDocAadhaarField?.sub_fields || [],
		isApplicant,
	});

	const permanentVerifyWithOtpSubField = getSelectedSubField({
		fields: selectedPermanentAadhaarField?.sub_fields || [],
		isApplicant,
	});

	const selectedVerifyWithOtpSubField =
		asPerDocVerifyWithOtpSubField || permanentVerifyWithOtpSubField || {};

	const sectionRequired = selectedSection?.is_section_mandatory !== false;
	const onClickVerifyWithOtp = async field => {
		if (field?.redirect_url) {
			handleBankRedirection(field.redirect_url);
			return;
		}
		try {
			const aadhaarErrorMessage = isInvalidAadhaar(
				// formState.values[CONST.AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT] ||
				// 	formState.values[CONST.AADHAAR_FIELD_NAME_FOR_OTP_AS_PER_DOCUMENT]
				formState.values[(field?.name)]
			);
			if (aadhaarErrorMessage) {
				return addToast({
					message: aadhaarErrorMessage,
					type: 'error',
				});
			}

			// Check for federal bank url redirect flag
			if (selectedVerifyWithOtpSubField?.redirect_url) {
				try {
					setVerifyingWithOtp(true);
					// const reqBody = {};
					const apiUrl =
						selectedSection?.aadhaar_redirect_api_url ||
						API.GENERATE_SESSION_ID_AADHAAR_REDIRECT;
					const sessionIdRes = await axios.post(apiUrl);
					const sessionId = await sessionIdRes?.data?.data?.SessionId;
					if (!sessionId || sessionIdRes.status === 'nok') {
						addToast({
							message: 'Error verifying aadhaar, Please try after some time.',
							type: 'error',
						});
						console.error(
							'error-generate session id-',
							sessionIdRes.message || sessionIdRes.data.message
						);
					}
					const reqBody = {
						session_id: sessionId && sessionId,
						redirectUrl: 'https://clix.loan2pal.com',
						option: 'biometric',
					};
					const redirectRes = await axios.post(API.AADHAAR_REDIRECT, reqBody);
					setIsBiometricModalOpen(true);
					setBiometricRes(redirectRes?.data || {});
				} catch (error) {
					console.error('error-addressdetails-aadhaarurlredirect-', error);
				} finally {
					setVerifyingWithOtp(false);
					return;
				}
			}
			// -- Check for federal bank url redirect flag

			setVerifyingWithOtp(true);
			try {
				const aadhaarOtpReqBody = {
					aadhaarNo:
						// formState.values[CONST.AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT],
						formState.values[(field?.name)],
					product_id: loanProductId,
				};
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
				if (aadhaarGenOtpResponse.status === 'nok') {
					addToast({
						message:
							aadhaarGenOtpResponse?.data?.msg ||
							'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
						type: 'error',
					});
				}
				if (aadhaarGenOtpResponse.status === 'ok') {
					aadhaarGenOtpResponse.aadhaarNo = formState?.values?.[field?.name];

					setAadharOtpResponse({
						req: aadhaarOtpReqBody,
						res: aadhaarGenOtpResponse,
					});

					addToast({
						message: 'OTP is sent to aadhaar link mobile number',
						type: 'success',
					});
					setIsAadhaarOtpModalOpen(true);
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

	const handleBankRedirection = async url => {
		try {
			const apiUrl =
				selectedSection?.aadhaar_redirect_api_url ||
				API.GENERATE_SESSION_ID_AADHAAR_REDIRECT;
			const resp = await axios.post(apiUrl);
			const session_id = resp?.data?.data?.SessionId;
			if (session_id) {
				window.open(
					`${url}?session_id=${session_id}&redirect_url=${encryptBase64(
						window.location.href
					)}&option=biometric`,
					'_blank'
				);
			}
		} catch (err) {
			console.error(err);
		}
	};

	const onSaveAndProceed = async () => {
		try {
			const { businessAddressIdAid1, businessAddressIdAid2 } = editSectionIds;
			if (
				sectionRequired &&
				(!formState?.values?.present_city ||
					!formState?.values?.present_state ||
					!formState?.values?.permanent_city ||
					!formState?.values?.permanent_state)
				// !formState?.values?.as_per_document_state ||
				// !formState?.values?.as_per_document_city
			) {
				return addToast({
					message: 'Please enter valid pincode to get city and state',
					type: 'error',
				});
			}

			// FOR OTHER COUNTRY THEN INDIA THESE VALIDATION NOT MANDATORY
			// US CLIENT REQUIREMENT CHANGES
			if (!isSectionCompleted && isCountryIndia) {
				const isPermanentSelectedAddressProofTypeAadhaar = formState?.values?.[
					CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
				]?.includes(CONST_SECTIONS.EXTRACTION_KEY_AADHAAR);

				const isAsPerDocumentSelectedAddressProofTypeAadhaar = formState?.values?.[
					CONST.AS_PER_DOCUMENT_ADDRESS_PROOF_TYPE_FIELD_NAME
				]?.includes(CONST_SECTIONS.EXTRACTION_KEY_AADHAAR);

				// Below code is for Aadhar - Verify with OTP button making it mandatory
				// based on rules passed to it

				const isPermanentVerifyWithOtpRequired = !!getSelectedSubField({
					fields: selectedPermanentAadhaarField?.sub_fields || [],
					isApplicant,
				})?.rules?.required;

				const isAsPerDocVerifyWithOtp = !!getSelectedSubField({
					fields: selectedAsPerDocAadhaarField?.sub_fields || [],
					isApplicant,
				})?.rules?.required;

				const isVerifyWithOtpRequired =
					isAsPerDocVerifyWithOtp || isPermanentVerifyWithOtpRequired;

				if (
					(selectedPermanentAadhaarField &&
						permanentVerifyWithOtpSubField &&
						formState?.values?.[CONST.AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT] ===
							'') ||
					(selectedAsPerDocAadhaarField &&
						asPerDocVerifyWithOtpSubField &&
						formState?.values?.[
							CONST.AADHAAR_FIELD_NAME_FOR_OTP_AS_PER_DOCUMENT
						] === '')
				) {
					// Aadhaar number Validations only if verify with OTP was not mandatory
					if (!isVerifyWithOtpRequired && sectionRequired) {
						const aadhaarErrorMessage = isInvalidAadhaar(
							formState?.values?.[
								CONST.AADHAAR_FIELD_NAME_FOR_OTP_AS_PER_DOCUMENT
							] || formState.values[CONST.AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT]
						);
						if (aadhaarErrorMessage) {
							return addToast({
								message: aadhaarErrorMessage,
								type: 'error',
							});
						}
					}

					// in case of aadhar, either we should upload document or verify with otp
					if (
						(isPermanentSelectedAddressProofTypeAadhaar ||
							isAsPerDocumentSelectedAddressProofTypeAadhaar) &&
						isVerifyWithOtpRequired
					) {
						const otpVerifiedForAadhar =
							selectedVerifyOtp?.res?.status === 'ok';
						let isFetchAddressPressed = false;
						permanentCacheDocumentsTemp.map(doc => {
							if (!!doc?.extractionRes) isFetchAddressPressed = true;
							return null;
						});

						asPerDocAddressDocumentsTemp.map(doc => {
							if (!!doc?.extractionRes) isFetchAddressPressed = true;
							return null;
						});

						if (
							!(otpVerifiedForAadhar || isFetchAddressPressed) &&
							!isTestMode
						) {
							addToast({
								message:
									'Please Upload Aadhar or Verify Aadhar Number With OTP',
								type: 'error',
							});
							return;
						}
					}
				}
				if (
					(!isPermanentSelectedAddressProofTypeAadhaar ||
						!isAsPerDocumentSelectedAddressProofTypeAadhaar) &&
					isVerifyWithOtpRequired
				) {
					if (
						selectedVerifyOtp?.res?.status !== 'ok' &&
						(formState?.values?.[
							CONST.AADHAAR_FIELD_NAME_FOR_OTP_AS_PER_DOCUMENT
						] === '' ||
							formState?.values?.[
								CONST.AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT
							] === '')
					) {
						addToast({
							message:
								'Aadhaar otp authentication is mandatory. Please verify Aadhaar number with otp',
							type: 'error',
						});
						return;
					}

					// removing since for ucic loans, the address details are coming and so businessAddressId
					// if (!businessAddressIdAid1) {
					// if document is (voter-dl-passport), it should be uploaded and extracted
					const isPermanentSelectedAddressProofTypeOthers = formState?.values?.[
						CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
					]?.includes(CONST_SECTIONS.EXTRACTION_KEY_OTHERS);
					if (!isPermanentSelectedAddressProofTypeOthers) {
						let isFetchAddressPressed = false;
						permanentCacheDocumentsTemp.map(doc => {
							if (!!doc?.extractionRes) isFetchAddressPressed = true;
							return null;
						});

						asPerDocAddressDocumentsTemp.map(doc => {
							if (!!doc?.extractionRes) isFetchAddressPressed = true;
							return null;
						});

						if (!isFetchAddressPressed) {
							addToast({
								message: 'Please upload address proof documents',
								type: 'error',
							});
							return;
						}
					}
					// }
				}
			}
			setLoading(true);
			const newLoanAddressDetails = [
				{
					business_address_id: businessAddressIdAid1,
					aid: 1,
					line1: formState?.values?.present_address1 || '',
					line2: formState?.values?.present_address2 || '',
					locality: formState?.values?.present_address3 || '',
					pincode: formState?.values?.present_pin_code || '',
					city: formState?.values?.present_city || '',
					state: formState?.values?.present_state || '',
					residential_type: formState?.values?.present_property_type || '',
					residential_stability:
						formState?.values?.present_property_tenure || '',
				},
				{
					business_address_id: businessAddressIdAid2,
					aid: 2,
					line1: formState?.values?.permanent_address1 || '',
					line2: formState?.values?.permanent_address2 || '',
					locality: formState?.values?.permanent_address3 || '',
					pincode: formState?.values?.permanent_pin_code || '',
					city: formState?.values?.permanent_city || '',
					state: formState?.values?.permanent_state || '',
					residential_type: formState?.values?.permanent_property_type || '',
					residential_stability:
						formState?.values?.permanent_property_tenure || '',
				},
			];
			const cacheDocumentsTemp = [
				...asPerDocAddressDocumentsTemp,
				...permanentCacheDocumentsTemp,
				...presentCacheDocumentsTemp,
				...otherPermanentCacheDocTemp,
				...otherPresentCacheDocTemp,
			];

			const addressDetailsReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
				values: formState.values,
			});

			addressDetailsReqBody.data.loan_address_details = newLoanAddressDetails;

			// KYC VERIFICATION RELATED CHANGES CR
			addressDetailsReqBody.data.verify_kyc_data = cacheDocumentsTemp;
			// permanent_address_proof_upload
			// present_address_proof_upload
			addressDetailsReqBody.data.permanent_address_proof_upload.doc_ref_id = permanentCacheDocumentsTemp?.filter(
				doc => !!doc?.doc_ref_id
			)?.[0]?.doc_ref_id;
			addressDetailsReqBody.data.present_address_proof_upload.doc_ref_id = presentCacheDocumentsTemp?.filter(
				doc => !!doc?.doc_ref_id
			)?.[0]?.doc_ref_id;
			// -- KYC VERIFICATION RELATED CHANGES CR

			const addressDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				addressDetailsReqBody
			);

			const otherdocs = [
				...otherPermanentCacheDocTemp,
				...otherPresentCacheDocTemp,
			];

			const newOtherUploadedDocumentsTemp = [];
			if (otherdocs.length > 0) {
				const formData = new FormData();
				const otherDocsBorrowerApi = [];
				const callLoanDocUpload = async idx => {
					formData.append('document', idx.file);
					let result = await axios.post(
						`${API.API_END_POINT}/loanDocumentUpload?userId=${businessUserId}`,
						formData
					);
					let leng = result.data.files.length;
					let fd = {
						...idx,
						document_key: result.data.files[leng - 1].fd,
					};
					otherDocsBorrowerApi.push(fd);
				};
				// call loanDocumentUpload to store the document on cloud
				await asyncForEach(otherdocs, callLoanDocUpload);
				const documentUploadReqBody = formatSectionReqBody({
					app,
					selectedDirector,
					application,
				});

				otherDocsBorrowerApi?.map(doc => {
					if (doc?.document_id) return null;
					newOtherUploadedDocumentsTemp.push({
						...doc,
						file: null,
						preview: null,
						id: doc.doc_type_id,
						loan_id: loanId,
						doc_type_id: doc.selectedDocTypeId,
						is_delete_not_allowed: true,
						isDocRemoveAllowed: false,
						classification_type: doc?.isTagged?.classification_type,
						classification_sub_type: doc?.isTagged?.classification_sub_type,
						doc_ref_id:
							formState?.values?.[`${doc?.prefix}address_proof_id_others`] ||
							undefined,

						aid: doc?.isTagged?.id?.includes(
							CONST_ADDRESS_DETAILS.PREFIX_PERMANENT
						)
							? CONST_ADDRESS_DETAILS.AID_PERMANENT
							: CONST_ADDRESS_DETAILS.AID_PRESENT,
						original_doc_name:
							formState?.values?.[
								`${doc?.prefix}${CONST.OTHERS_DOC_NAME_FIELD_NAME}`
							],
						document_id: 'placeholder',
						// document is is required so in document upload page we do not resubmit this documents
						// due to this user won't be able to view document
					});
					return null;
				});
				documentUploadReqBody.data.document_upload = newOtherUploadedDocumentsTemp;
				// return;
				await axios.post(`${API.BORROWER_UPLOAD_URL}`, documentUploadReqBody);
			}
			// console.log(cacheDocumentsTemp, 'cache documents');
			const newKycUploadCacheDocumentsTemp = [];
			if (cacheDocumentsTemp?.length > 0) {
				try {
					cacheDocumentsTemp?.map(doc => {
						if (!doc?.requestId) return null;
						newKycUploadCacheDocumentsTemp.push({
							...doc,
							file: null,
							request_id: doc.requestId,
							doc_type_id: doc.selectedDocTypeId,
							is_delete_not_allowed: true,
							director_id: directorId,
							isDocRemoveAllowed: false,
							document_id: 'placeholder',
							classification_type: doc?.isTagged?.classification_type,
							classification_sub_type: doc?.isTagged?.classification_sub_type,
							aid:
								`${doc?.isTagged?.aid}` === CONST.AID_AS_PER_DOCUMENT
									? 1
									: doc?.isTagged?.aid,
							// document is required so in document upload page we do not resubmit this documents
							// due to this user won't be able to view document
						});
						return null;
					});
					if (newKycUploadCacheDocumentsTemp.length) {
						const uploadCacheDocumentsTempReqBody = {
							loan_id: loanId,
							request_ids_obj: newKycUploadCacheDocumentsTemp,
							user_id: createdByUserId,
						};
						await axios.post(
							API.UPLOAD_CACHE_DOCS,
							uploadCacheDocumentsTempReqBody,
							{
								headers: {
									Authorization: clientToken,
								},
							}
						);
					}
				} catch (error) {
					console.error('error-', error);
				}
			}
			setEditSectionIds({
				businessAddressIdAid1: addressDetailsRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 1
				)?.[0]?.id,
				businessAddressIdAid2: addressDetailsRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 2
				)?.[0]?.id,
			});
			dispatch(setCompletedDirectorSection(selectedSectionId));
			dispatch(setSelectedSectionId(nextSectionId));
			dispatch(
				getDirectors({
					loanRefId: loanRefId,
					isSelectedProductTypeBusiness:
						selectedProduct?.isSelectedProductTypeBusiness,
				})
			);
		} catch (error) {
			console.error('error-AddressDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
			// TODO: below line is used for testing remove this before push
			// dispatch(setSelectedSectionId(nextSectionId));
		} finally {
			setLoading(false);
		}
	};

	const prePopulateAddressDetailsFromVerifyOtpRes = aadhaarOtpRes => {
		const formatedData = formatAadhaarOtpResponse(aadhaarOtpRes);
		Object.keys(formatedData || {}).map(key => {
			onChangeFormStateField({
				name: `${CONST_ADDRESS_DETAILS.PREFIX_PERMANENT}${key}`,
				value: formatedData?.[key] || '',
			});
			return null;
		});
	};
	// console.log(formState?.values, '><<<<<<><><><><><><><>');

	const prefilledValues = field => {
		try {
			// custom prefill only for this section
			if (!!isSameAsAboveAddressChecked) {
				return formState?.values?.[
					field?.name?.replace(CONST.PREFIX_PRESENT, CONST.PREFIX_PERMANENT)
				];
			}

			// if (!!isSameAsDocAddrForPermanentChecked) {
			// 	return formState?.values?.[
			// 		field?.name?.replace(
			// 			CONST.PREFIX_PERMANENT,
			// 			CONST.PREFIX_AS_PER_DOCUMENT
			// 		)
			// 	];
			// }

			// if (!!isSameAsDocAddrForPresentChecked) {
			// 	return formState?.values?.[
			// 		field?.name?.replace(
			// 			CONST.PREFIX_PRESENT,
			// 			CONST.PREFIX_AS_PER_DOCUMENT
			// 		)
			// 	];
			// }

			if (field?.name === CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME) {
				const selectedDoc = permanentCacheDocumentsTemp?.filter(doc => {
					return (
						`${doc?.directorId}` === `${selectedDirectorId}` &&
						`${doc?.document_details?.aid}` ===
							CONST_ADDRESS_DETAILS.AID_PERMANENT
					);
				})?.[0];

				if (!!selectedDoc) return formatAddressType(selectedDoc);
			}
			if (field?.name === CONST.PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME) {
				const selectedDoc = presentCacheDocumentsTemp?.filter(doc => {
					return (
						`${doc?.directorId}` === `${selectedDirectorId}` &&
						`${doc?.document_details?.aid}` ===
							CONST_ADDRESS_DETAILS.AID_PRESENT
					);
				})?.[0];

				if (!!selectedDoc) return formatAddressType(selectedDoc);
			}

			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			const ekycArrayPermanentAddress = sectionData?.director_details?.ekyc_data?.filter(
				item => {
					return `${item?.aid}` === '2';
				}
			);
			const ekycArrayPresentAddress = sectionData?.director_details?.ekyc_data?.filter(
				item => {
					return `${item?.aid}` === '1';
				}
			);

			const initData = _.cloneDeep(initialAddress);
			const asPerDocumentAddress =
				sectionData?.business_address_data?.filter(
					addr => `${addr?.aid}` === CONST.AID_AS_PER_DOCUMENT
				)?.[0] || {};

			// -- TEST MODE
			const preData = {
				...initData,
				as_per_document_aadhaar: asPerDocumentAddress?.kyc_key,
				as_per_document_address_proof_id_passport:
					asPerDocumentAddress?.kyc_key,
				as_per_document_address_proof_id_dl: asPerDocumentAddress?.kyc_key,
				as_per_document_address_proof_id_voter: asPerDocumentAddress?.kyc_key,
				as_per_document_address_proof_type:
					asPerDocumentAddress?.classification_type,

				as_per_document_address1: asPerDocumentAddress?.line1,
				as_per_document_address2: asPerDocumentAddress?.line2,
				as_per_document_address3: asPerDocumentAddress?.line3,
				as_per_document_pin_code: asPerDocumentAddress?.pincode,
				// as_per_document_city: asPerDocumentAddress?.city,
				// as_per_document_state: asPerDocumentAddress?.state,

				permanent_address_proof_type:
					process.env.REACT_APP_MUTHOOT_WHITELABEL === `${whiteLabelId}` &&
					sectionData?.director_details?.additional_cust_id &&
					!sectionData?.director_details?.ekyc_data?.classification_type
						? CONST.PERMANENT_OTHERS_RADIO
						: ekycArrayPermanentAddress?.classification_type,

				present_address_proof_type:
					process.env.REACT_APP_MUTHOOT_WHITELABEL === `${whiteLabelId}` &&
					sectionData?.director_details?.additional_cust_id &&
					!sectionData?.director_details?.ekyc_data?.classification_type
						? CONST.PRESENT_OTHERS_RADIO
						: ekycArrayPresentAddress?.classification_type,
				permanent_address_proof_id_others:
					ekycArrayPermanentAddress?.length > 0
						? sectionData?.director_details?.ekyc_data?.filter(item => {
								return `${item?.aid}` === '2';
						  })?.[0]?.doc_ref_id
						: '',

				permanent_property_tenure: sectionData?.director_details
					?.permanent_residential_stability
					? moment(
							sectionData?.director_details?.permanent_residential_stability
					  ).format('YYYY-MM')
					: '',
				permanent_address_proof_valid_till:
					ekycArrayPermanentAddress?.length > 0
						? moment(
								sectionData?.director_details?.ekyc_data?.filter(item => {
									return `${item?.aid}` === '2';
								})?.[0]?.valid_till
						  ).format('YYYY-MM-DD')
						: '',

				permanent_address_proof_issued_on:
					ekycArrayPermanentAddress?.length > 0
						? moment(
								sectionData?.director_details?.ekyc_data?.filter(item => {
									return `${item?.aid}` === '2';
								})?.[0]?.issued_on
						  ).format('YYYY-MM-DD')
						: '',

				present_aadhaar: sectionData?.director_details?.daadhaar,
				present_address_proof_id_others:
					ekycArrayPresentAddress?.length > 0
						? sectionData?.director_details?.ekyc_data?.filter(item => {
								return `${item?.aid}` === '1';
						  })?.[0]?.doc_ref_id
						: '',
				present_property_tenure: sectionData?.director_details
					?.residential_stability
					? moment(sectionData?.director_details?.residential_stability).format(
							'YYYY-MM'
					  )
					: '',
				present_address_proof_issued_on:
					ekycArrayPresentAddress?.length > 0
						? moment(
								sectionData?.director_details?.ekyc_data?.filter(item => {
									return `${item?.aid}` === '1';
								})?.[0]?.issued_on
						  ).format('YYYY-MM-DD')
						: '',
				present_address_proof_valid_till:
					ekycArrayPresentAddress?.length > 0
						? moment(
								sectionData?.director_details?.ekyc_data?.filter(item => {
									return `${item?.aid}` === '1';
								})?.[0]?.valid_till
						  ).format('YYYY-MM-DD')
						: '',
			};
			return preData?.[field?.name] || field?.value || '';
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		}
	};

	useEffect(() => {
		setInitialAddress({
			permanent_address_proof_address_type:
				sectionData?.director_details?.address_type,

			permanent_address_proof_type:
				process.env.REACT_APP_MUTHOOT_WHITELABEL === `${whiteLabelId}` &&
				sectionData?.director_details?.additional_cust_id &&
				!sectionData?.director_details?.ekyc_data?.classification_type
					? CONST.PERMANENT_OTHERS_RADIO
					: '',

			present_address_proof_type:
				process.env.REACT_APP_MUTHOOT_WHITELABEL === `${whiteLabelId}` &&
				sectionData?.director_details?.additional_cust_id &&
				!sectionData?.director_details?.ekyc_data?.classification_type
					? CONST.PRESENT_OTHERS_RADIO
					: '',

			permanent_aadhaar: sectionData?.director_details?.daadhaar,
			permanent_address_proof_id_others: '',
			permanent_address_proof_id_document_name_others:
				sectionData?.director_details?.permanent_ddocname,
			permanent_address_proof_id_passport:
				sectionData?.director_details?.dpassport,
			permanent_address_proof_id_dl: sectionData?.director_details?.ddlNumber,
			permanent_address_proof_id_voter: sectionData?.director_details?.dvoterid,

			permanent_address_type:
				sectionData?.director_details?.permanent_address_type,
			permanent_address1: sectionData?.director_details?.permanent_address1,
			permanent_address2: sectionData?.director_details?.permanent_address2,
			permanent_address3: sectionData?.director_details?.permanent_locality,
			permanent_pin_code: sectionData?.director_details?.permanent_pincode,
			permanent_city: sectionData?.director_details?.permanent_city,
			permanent_state: sectionData?.director_details?.permanent_state,
			permanent_district: sectionData?.director_details?.permanent_district,
			permanent_property_type:
				sectionData?.director_details?.permanent_residential_type,
			permanent_property_tenure: sectionData?.director_details
				?.permanent_residential_stability
				? moment(
						sectionData?.director_details?.permanent_residential_stability
				  ).format('YYYY-MM')
				: '',
			permanent_address_proof_valid_till: '',

			permanent_address_proof_issued_on: '',

			present_aadhaar: sectionData?.director_details?.daadhaar,
			present_address_proof_id_others: '',

			present_address_proof_id_passport:
				sectionData?.director_details?.dpassport,
			present_address_proof_id_dl: sectionData?.director_details?.ddlNumber,
			present_address_proof_id_voter: sectionData?.director_details?.dvoterid,
			present_address_proof_id_document_name_others:
				sectionData?.director_details?.ddocname,
			present_address_type: sectionData?.director_details?.address_type,
			present_address1: sectionData?.director_details?.address1,
			present_address2: sectionData?.director_details?.address2,
			present_address3: sectionData?.director_details?.locality,
			present_pin_code: sectionData?.director_details?.pincode,
			present_city: sectionData?.director_details?.city,
			present_district: sectionData?.director_details?.district,
			present_state: sectionData?.director_details?.state,
			present_property_type: sectionData?.director_details?.residential_type,
			present_property_tenure: sectionData?.director_details
				?.residential_stability
				? moment(sectionData?.director_details?.residential_stability).format(
						'YYYY-MM'
				  )
				: '',
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionData]);

	// fetch section data starts
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);

			const fetchRes = await axios.get(`${API_END_POINT}/basic_details`, {
				params: {
					loan_ref_id: loanRefId,
					director_id: selectedDirectorId,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				fetchRes?.data?.data?.loan_document_details?.map(doc => {
					doc.name = doc?.uploaded_doc_name;
					doc.doc_type_id = doc?.doctype;
					return null;
				});
				setSectionData(fetchRes?.data?.data);
				setEditSectionIds({
					businessAddressIdAid1: fetchRes?.data?.data?.business_address_data?.filter(
						address => address.aid === 1
					)?.[0]?.id,
					businessAddressIdAid2: fetchRes?.data?.data?.business_address_data?.filter(
						address => address.aid === 2
					)?.[0]?.id,
				});
				const permanentCacheDocumentsTempRes = fetchRes?.data?.data?.loan_document_details?.filter(
					doc =>
						`${doc?.document_details?.aid}` === '2' &&
						`${doc?.directorId}` === `${selectedDirectorId}` &&
						doc?.document_details?.classification_type !== 'pan' &&
						!asPerDocAdhaarDocType?.includes(doc?.doctype)
				);
				if (permanentCacheDocumentsTempRes.length === 2)
					setIsPermanentAddressIsPresentAddress(true);
				setPermanentCacheDocumentsTemp(permanentCacheDocumentsTempRes);
				setPresentCacheDocumentsTemp(
					fetchRes?.data?.data?.loan_document_details?.filter(doc => {
						return (
							`${doc?.document_details?.aid}` === '1' &&
							`${doc?.directorId}` === `${selectedDirectorId}` &&
							doc?.document_details?.classification_type !== 'pan' &&
							!asPerDocAdhaarDocType?.includes(doc?.doctype)
						);
					})
				);

				setAsPerDocAddressDocumentsTemp(
					fetchRes?.data?.data?.loan_document_details?.filter(
						doc =>
							// asPerDocAdhaarDocType?.includes(doc?.doctype) &&
							`${doc?.document_details?.aid}` === '1' &&
							`${doc?.directorId}` === `${selectedDirectorId}` &&
							doc?.document_details?.classification_type !== 'pan'
					)
				);
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			setFetchingSectionData(false);
		}
	};
	// fetch section data ends

	console.log({
		asPerDocAddressDocumentsTemp,
		permanentCacheDocumentsTemp,
		presentCacheDocumentsTemp,
	});

	const clearPresentAddressState = () => {
		Object.keys(CONST_ADDRESS_DETAILS.resetAllFields).map(key => {
			if (!!isSameAsAboveAddressChecked || !!isSameAsDocAddrForPresentChecked)
				return null;
			onChangeFormStateField({
				name: `${CONST_ADDRESS_DETAILS.PREFIX_PRESENT}${key}`,
				value: '',
			});
			return null;
		});
	};

	const clearPresentAddressStateFromDoc = () => {
		Object.keys(CONST_ADDRESS_DETAILS.resetFieldsForDoc).map(key => {
			if (!!isSameAsAboveAddressChecked || !!isSameAsDocAddrForPresentChecked)
				return null;
			onChangeFormStateField({
				name: `${CONST_ADDRESS_DETAILS.PREFIX_PRESENT}${key}`,
				value: '',
			});
			return null;
		});
	};

	const clearPermanentAddressState = () => {
		Object.keys(CONST_ADDRESS_DETAILS.resetFieldsForDoc).map(key => {
			if (!!isSameAsDocAddrForPermanentChecked) return null;
			onChangeFormStateField({
				name: `${CONST_ADDRESS_DETAILS.PREFIX_PERMANENT}${key}`,
				value: '',
			});
			return null;
		});
	};

	const handleSameAsDocForPresentCheckBox = () => {
		Object.keys(CONST_ADDRESS_DETAILS.resetAllFields)?.map(key => {
			if (isSameAsDocAddrForPresentChecked) {
				onChangeFormStateField({
					name: `${CONST_ADDRESS_DETAILS.PREFIX_PRESENT}${key}`,
					value:
						formState?.values?.[
							`${CONST_ADDRESS_DETAILS.PREFIX_AS_PER_DOCUMENT}${key}`
						],
				});
			}
		});
	};

	const handleSameAsDocForPermanentCheckBox = () => {
		Object.keys(CONST_ADDRESS_DETAILS.resetAllFields)?.map(key => {
			if (isSameAsDocAddrForPermanentChecked) {
				onChangeFormStateField({
					name: `${CONST_ADDRESS_DETAILS.PREFIX_PERMANENT}${key}`,
					value:
						formState?.values?.[
							`${CONST_ADDRESS_DETAILS.PREFIX_AS_PER_DOCUMENT}${key}`
						],
				});
			}
		});
	};

	useEffect(() => {
		scrollToTopRootElement();
		if (
			!!loanRefId &&
			!!selectedDirectorId
			// selectedDirector?.sections?.includes(selectedSectionId)
		)
			fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (
			(!!isSameAsAboveAddressChecked || !!isSameAsDocAddrForPresentChecked) &&
			presentCacheDocumentsTemp?.length > 0
		) {
			setPresentCacheDocumentsTemp([]);
		}

		if (!isSameAsAboveAddressChecked && isSameAsAboveAddressChecked === false) {
			clearPresentAddressState();
		}
		// eslint-disable-next-line
	}, [isSameAsAboveAddressChecked]);

	useEffect(() => {
		if (
			!!isSameAsDocAddrForPresentChecked &&
			presentCacheDocumentsTemp?.length > 0
		) {
			setPresentCacheDocumentsTemp([]);
		}

		if (
			!isSameAsDocAddrForPresentChecked &&
			isSameAsDocAddrForPresentChecked === false
		) {
			clearPresentAddressStateFromDoc();
		}
		handleSameAsDocForPresentCheckBox();
	}, [isSameAsDocAddrForPresentChecked]);

	useEffect(() => {
		if (
			!!isSameAsDocAddrForPermanentChecked &&
			permanentCacheDocumentsTemp?.length > 0
		) {
			setPermanentCacheDocumentsTemp([]);
		}

		if (
			!isSameAsDocAddrForPermanentChecked &&
			isSameAsDocAddrForPermanentChecked === false
		) {
			clearPermanentAddressState();
		}
		handleSameAsDocForPermanentCheckBox();
		// eslint-disable-next-line
	}, [isSameAsDocAddrForPermanentChecked]);

	if (!selectedDirectorId) return null;

	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{isAadhaarOtpModalOpen && (
						<AadhaarOTPModal
							formState={formState}
							isAadhaarOtpModalOpen={isAadhaarOtpModalOpen}
							setIsAadhaarOtpModalOpen={setIsAadhaarOtpModalOpen}
							aadhaarGenOtpResponse={aadharOtpResponse?.res}
							prePopulateAddressDetailsFromVerifyOtpRes={
								prePopulateAddressDetailsFromVerifyOtpRes
							}
							setVerifyOtpResponseTemp={setVerifyOtpResponseTemp}
						/>
					)}
					{isBiometricModalOpen && (
						<BiometricModal
							show={isBiometricModalOpen}
							onClose={() => {
								setIsBiometricModalOpen(false);
								setBiometricRes(null);
							}}
							biometricRes={biometricRes}
						/>
					)}

					{selectedSection?.sub_sections?.map(
						(sub_section, subSectionIndex) => {
							// {selectedSection?.sub_sections?.map(
							// 	(sub_section, subSectionIndex) => {
							let isInActiveAddressProofUpload = false;

							const isPermanent = sub_section?.aid === CONST.AID_PERMANENT;
							const isPresent = `${sub_section?.aid}` === CONST.AID_PRESENT;
							const isAsPerDocument =
								`${sub_section?.aid}` === CONST.AID_AS_PER_DOCUMENT;
							// console.log({ fromValues: formState?.values });
							const selectedAddressProofFieldName = isPermanent
								? CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
								: isAsPerDocument
								? CONST.AS_PER_DOCUMENT_ADDRESS_PROOF_TYPE_FIELD_NAME
								: CONST.PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME;
							const selectedAddressProofId =
								formState?.values?.[selectedAddressProofFieldName];

							const selectedAddressProofTypeOption = sub_section?.fields
								?.filter(field => {
									return field?.name === selectedAddressProofFieldName;
								})?.[0]
								?.options?.filter(
									o => o?.value === selectedAddressProofId
								)?.[0];

							const selectedDocTypeId =
								selectedAddressProofTypeOption?.doc_type?.[+selectedIncomeType];

							const prefix = isPermanent
								? CONST.PREFIX_PERMANENT
								: isPresent
								? CONST.PREFIX_PRESENT
								: CONST.PREFIX_AS_PER_DOCUMENT;

							const selectedDocumentTypes = formatAddressProofDocTypeList({
								selectedAddressProofId,
								prefix,
								aid: sub_section.aid,
							});
							if (!selectedAddressProofId) {
								isInActiveAddressProofUpload = true;
							}

							const selectedCacheDocumentsTemp = [
								...(isPermanent
									? permanentCacheDocumentsTemp
									: isAsPerDocument
									? asPerDocAddressDocumentsTemp
									: presentCacheDocumentsTemp),
								...(isPermanent
									? otherPermanentCacheDocTemp
									: otherPresentCacheDocTemp),
							];

							// remove after verifying above code
							const cacheDocumentsTemp = [];
							selectedCacheDocumentsTemp?.map(doc => {
								const selectedDocumentType = selectedDocumentTypes?.filter(
									docType =>
										docType?.classification_type ===
											doc?.document_details?.classification_type &&
										docType?.classification_sub_type ===
											doc?.document_details?.classification_sub_type
								);
								const newDoc = { ...doc };
								if (selectedDocumentType?.length > 0) {
									newDoc.isTagged = selectedDocumentType?.[0] || {};
								}
								cacheDocumentsTemp.push(newDoc);
								return null;
							});

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
								// if (presentAddressProofError) {
								// 	isInActiveAddressProofUpload = true;
								// 	// isProceedDisabledAddressProof = true;
								// }
								if (
									cacheDocumentsTemp?.filter(f => !f?.isTagged?.id).length > 0
								) {
									isInActiveAddressProofUpload = true;
									// isProceedDisabledAddressProof = true;
								}
							}

							if (isSectionCompleted) {
								isInActiveAddressProofUpload = true;
							}

							if (isViewLoan) {
								isInActiveAddressProofUpload = true;
							}

							return (
								<Fragment key={`section-${subSectionIndex}-${sub_section?.id}`}>
									{sub_section?.name ? (
										<>
											<UI_SECTIONS.SubSectionHeader>
												{sub_section.name}
											</UI_SECTIONS.SubSectionHeader>
											{isCountryIndia ? (
												<Hint
													hint='Please upload the document with KYC image in Portrait Mode'
													hintIconName='Portrait Mode'
												/>
											) : null}
										</>
									) : null}
									{sub_section.id.includes(
										CONST.ADDRESS_PROOF_UPLOAD_SECTION_ID
									) && (
										<UI.SubSectionCustomHeader style={{ marginTop: 40 }}>
											<h4>
												{isCountryIndia ? (
													<span>
														Select any one of the documents mentioned below for{' '}
													</span>
												) : null}
												<strong>
													{sub_section?.sub
														? sub_section?.sub
														: sub_section?.name
														? 'Permanent'
														: 'Present'}{' '}
													Address
												</strong>
												<span style={{ color: 'red' }}>*</span>
											</h4>
											<h4>
												{/* {sub_section?.name ? null : (
													<>
														<UI.CheckboxSameAs
															type='checkbox'
															id={CONST.CHECKBOX_SAME_AS_ID}
															checked={!!isSameAsAboveAddressChecked}
															disabled={
																isSectionCompleted ||
																isViewLoan ||
																!formState?.values?.[
																	CONST_ADDRESS_DETAILS
																		.PERMANENT_ADDRESS1_FIELD_NAME
																]
															}
															onChange={() => {
																setIsSameAsAboveAddressChecked(
																	!isSameAsAboveAddressChecked
																);
															}}
														/>
														<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
															Same as Permanent Address
														</label>
													</>
											)} */}
												{sub_section?.name ? null : sub_section?.sub?.toLocaleLowerCase() ===
												  'permanent' ? (
													<>
														<UI.CheckboxSameAs
															type='checkbox'
															id={CONST.CHECKBOX_SAME_AS_DOCUMENT_FOR_PERMANENT}
															checked={!!isSameAsDocAddrForPermanentChecked}
															disabled={
																isSectionCompleted ||
																isViewLoan ||
																!formState?.values?.[
																	CONST_ADDRESS_DETAILS
																		.AS_PER_DOC_ADDRESS1_FIELD_NAME
																]
															}
															onChange={() => {
																setIsSameAsDocAddrForPermanentChecked(
																	!isSameAsDocAddrForPermanentChecked
																);
															}}
														/>
														<label
															htmlFor={
																CONST.CHECKBOX_SAME_AS_DOCUMENT_FOR_PERMANENT
															}
														>
															Same as As Per Document Address
														</label>
													</>
												) : (
													<div
														style={{
															display: 'flex',
															flexDirection: 'column',
															gap: '10px',
														}}
													>
														{doesAddressDetailsHasMoreThanTwoSubsection && (
															<div>
																<UI.CheckboxSameAs
																	type='checkbox'
																	id={
																		CONST.CHECKBOX_SAME_AS_DOCUMENT_FOR_PRESENT
																	}
																	checked={!!isSameAsDocAddrForPresentChecked}
																	disabled={
																		isSectionCompleted ||
																		isViewLoan ||
																		!formState?.values?.[
																			CONST_ADDRESS_DETAILS
																				.AS_PER_DOC_ADDRESS1_FIELD_NAME
																		]
																	}
																	onChange={() => {
																		setIsSameAsDocAddrForPresentChecked(
																			!isSameAsDocAddrForPresentChecked
																		);
																		setIsSameAsAboveAddressChecked(false);
																	}}
																/>
																<label
																	htmlFor={
																		CONST.CHECKBOX_SAME_AS_DOCUMENT_FOR_PRESENT
																	}
																>
																	Same as As Per Document Address
																</label>
															</div>
														)}
														<div>
															<UI.CheckboxSameAs
																type='checkbox'
																id={CONST.CHECKBOX_SAME_AS_ID}
																checked={!!isSameAsAboveAddressChecked}
																disabled={
																	isSectionCompleted ||
																	isViewLoan ||
																	!formState?.values?.[
																		CONST_ADDRESS_DETAILS
																			.PERMANENT_ADDRESS1_FIELD_NAME
																	]
																}
																onChange={() => {
																	setIsSameAsAboveAddressChecked(
																		!isSameAsAboveAddressChecked
																	);
																	setIsSameAsDocAddrForPresentChecked(false);
																}}
															/>
															<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
																Same as Permanent Address
															</label>
														</div>
													</div>
												)}
											</h4>
										</UI.SubSectionCustomHeader>
									)}
									<UI_SECTIONS.FormWrapGrid>
										{sub_section?.fields?.map((field, fieldIndex) => {
											if (
												!isFieldValid({
													field,
													formState,
													isApplicant,
												})
											) {
												return null;
											}

											if (
												(sub_section.aid === CONST.AID_PRESENT &&
													!!isSameAsAboveAddressChecked) ||
												isSameAsDocAddrForPresentChecked
											) {
												if (
													CONST.HIDE_PRESENT_ADDRESS_FIELDS.includes(field.name)
												)
													return null;
											}

											if (
												sub_section.aid === CONST.AID_PERMANENT &&
												isSameAsDocAddrForPermanentChecked
											) {
												if (
													CONST.HIDE_PERMANENT_ADDRESS_FIELDS.includes(
														field.name
													)
												)
													return null;
											}
											const isVerifyWithOtpField = field.name.includes(
												CONST.AADHAAR_FIELD_NAME
											);
											if (isVerifyWithOtpField) return null;

											const newValue = prefilledValues(field);
											const customFieldProps = {};
											if (isViewLoan) {
												customFieldProps.disabled = true;
											}
											const customStyle = {};

											if (
												sub_section?.aid === CONST.AID_AS_PER_DOCUMENT &&
												CONST.AS_PER_DOCUMENT_FIELDS_TO_DISABLE.includes(
													field?.name
												)
											) {
												customFieldProps.disabled = true;
											}

											if (field?.type === 'pincode') {
												customFieldProps.avoidFromCache = true;
											}

											const isIdProofUploadField =
												field.type === 'file' &&
												field.name.includes(CONST.ID_PROOF_UPLOAD_FIELD_NAME);

											if (
												field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)
											) {
												customStyle.gridColumn = 'span 2';
											}

											if (isIdProofUploadField) {
												if (
													sub_section.id ===
														CONST_ADDRESS_DETAILS.SUB_SECTION_ID_PRESENT_ADDRESS_PROOF_UPLOAD &&
													!!isPermanentAddressIsPresentAddress
												) {
													return null;
												} else {
													return (
														<UI_SECTIONS.FieldWrapGrid
															style={{
																gridColumn: 'span 2',
															}}
															key={`field-${fieldIndex}-${field.name}`}
														>
															<AddressProofUpload
																field={field}
																register={register}
																formState={formState}
																onChangeFormStateField={onChangeFormStateField}
																prefilledValues={prefilledValues}
																prefix={prefix}
																isPermanent={isPermanent}
																disabled={!selectedAddressProofId}
																isInActive={isInActiveAddressProofUpload}
																isSectionCompleted={isSectionCompleted}
																selectedAddressProofId={selectedAddressProofId}
																selectedAddressProofFieldName={
																	selectedAddressProofFieldName
																}
																docTypeOptions={selectedDocumentTypes}
																addressProofUploadSection={sub_section}
																selectedDirector={selectedDirector}
																isAadhaarVerified={
																	!!sectionData?.director_details
																		?.is_aadhaar_verified_with_otp
																}
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
																		? selectedAddressProofId?.includes('others')
																			? setOtherPermanentCacheDocTemp
																			: setPermanentCacheDocumentsTemp
																		: isAsPerDocument
																		? setAsPerDocAddressDocumentsTemp
																		: selectedAddressProofId?.includes('others')
																		? setOtherPresentCacheDocTemp
																		: setPresentCacheDocumentsTemp
																}
																setOtherCacheDocumentsTemp={
																	isPermanent
																		? selectedAddressProofId?.includes('others')
																			? setPermanentCacheDocumentsTemp
																			: setOtherPermanentCacheDocTemp
																		: isAsPerDocument
																		? setOtherAsPerDocAddressCacheDocTemp
																		: selectedAddressProofId?.includes('others')
																		? setPresentCacheDocumentsTemp
																		: setOtherPresentCacheDocTemp
																}
																selectedDocTypeId={selectedDocTypeId}
																selectedVerifyOtp={selectedVerifyOtp}
																isEditLoan={isEditLoan}
																isViewLoan={isViewLoan}
																isEditOrViewLoan={isEditOrViewLoan}
																directorDetails={sectionData?.director_details}
																doesAddressDetailsHasMoreThanTwoSubsection={
																	doesAddressDetailsHasMoreThanTwoSubsection
																}
															/>
														</UI_SECTIONS.FieldWrapGrid>
													);
												}
											}

											//setOtherPresentCacheDocTemp
											if (
												!!selectedVerifyOtp?.res &&
												sub_section?.id ===
													CONST.PERMANENT_ADDRESS_DETAILS_SECTION_ID
											) {
												customFieldProps.disabled = false;
											} else if (
												cacheDocumentsTemp?.filter(doc => !!doc?.extractionRes)
													.length > 0
											) {
												//Disable if the field is prefilled.
												if (
													sub_section?.id ===
														CONST.PERMANENT_ADDRESS_DETAILS_SECTION_ID ||
													sub_section?.id ===
														CONST.PRESENT_ADDRESS_DETAILS_SECTION_ID
												) {
													if (
														initialAddress?.[field?.name] &&
														disableFieldIfPrefilled
													) {
														customFieldProps.disabled = true;
														// if (
														// 	doesAddressDetailsHasMoreThanTwoSubsection &&
														// 	sub_section?.id ===
														// 		CONST.PERMANENT_ADDRESS_DETAILS_SECTION_ID
														// ) {
														// 	customFieldProps.disabled = false;
														// }
													} else {
														customFieldProps.disabled = false;
													}
												}
											} else if (selectedAddressProofId?.includes('others')) {
												customFieldProps.disabled = false;
											} else {
												if (
													!field.name.includes(
														CONST.ADDRESS_PROOF_TYPE_FIELD_NAME
													)
												) {
													customFieldProps.disabled = true;
												}
											}

											if (
												isSectionCompleted &&
												field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)
											) {
												customFieldProps.disabled = true;
											}

											if (
												!!isSameAsAboveAddressChecked &&
												field.name.includes(CONST.PREFIX_PRESENT)
											) {
												customFieldProps.disabled = true;
											}

											// Untill permanent address1 is not filled disable present address proof
											if (
												field.name ===
													CONST.PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME &&
												!formState?.values?.[
													CONST.PERMANENT_ADDRESS1_FIELD_NAME
												]
											) {
												customFieldProps.disabled = true;
											}

											// EDIT / VIEW MODE Enable all address fields and disable all doc related fields
											if (isSectionCompleted) {
												if (sub_section?.id?.includes('address_details')) {
													customFieldProps.disabled = false;
												} else {
													customFieldProps.disabled = true;
												}
											}

											if (
												sub_section?.id === 'as_per_document_address_details'
											) {
												customFieldProps.disabled = true;
											}

											// <<<<<<<<<<<<<<<<<<<<<<<<< get confirmation >>>>>>>>>>>>>>>>>>>>>>
											if (
												(doesAddressDetailsHasMoreThanTwoSubsection &&
													(sub_section?.id?.includes('permanent') &&
														isSameAsDocAddrForPermanentChecked)) ||
												((sub_section?.id?.includes('present') &&
													isSameAsDocAddrForPresentChecked) ||
													isSameAsAboveAddressChecked)
											) {
												// if (
												// 	field?.name?.includes('tenure') ||
												// 	field?.name?.includes('property')
												// ) {
												customFieldProps.disabled = false;
												// }
											}

											// TO overwrite all above condition and disable everything
											if (isViewLoan) {
												customFieldProps.disabled = true;
											}

											// in all the scenario this fields will be always disabled
											if (
												(field.name.includes('city') &&
													!field.name.includes('current_city')) ||
												field.name.includes('state')
											) {
												customFieldProps.disabled = true;
											}

											if (
												sub_section.id ===
													CONST_ADDRESS_DETAILS.SUB_SECTION_ID_PRESENT_ADDRESS_PROOF_UPLOAD &&
												!!isPermanentAddressIsPresentAddress
											) {
												return null;
											}

											if (!isCountryIndia && !isViewLoan) {
												customFieldProps.disabled = false;
											}

											return (
												<UI_SECTIONS.FieldWrapGrid
													key={`field-${prefix}-${fieldIndex}-${field.name}`}
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
						}
					)}
					<UI_SECTIONS.Footer>
						{!isViewLoan && (
							<Button
								fill
								name='Save and Proceed'
								isLoader={loading}
								disabled={loading}
								onClick={
									sectionRequired
										? handleSubmit(onSaveAndProceed)
										: onSaveAndProceed
								}
							/>
						)}
						<NavigateCTA directorSelected={selectedDirector} />
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default AddressDetails;
