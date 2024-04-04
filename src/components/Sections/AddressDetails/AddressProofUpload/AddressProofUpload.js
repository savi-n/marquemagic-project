/* FIle upload details section. This section handles drag, drop
of file, upload and deletion */
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Popover } from 'react-tiny-popover';
import moment from 'moment';
import _ from 'lodash';

import CircularLoading from 'components/Loaders/Circular';
import Button from 'components/Button';
import Modal from 'components/Modal';
import Hint from 'components/Hint';

import generateUID from 'utils/uid';
import { verifyKycDataUiUx } from 'utils/request';
import { useToasts } from 'components/Toast/ToastProvider';
import { VIEW_DOCUMENT } from '_config/app.config';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import { getKYCData, getKYCDataId } from 'utils/request';
import { isDirectorApplicant, isFieldValid } from 'utils/formatData';
import uploadCircleIcon from 'assets/icons/upload_icon_blue.png';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import imgArrowDownCircle from 'assets/icons/drop_down_green-05.svg';
import imgGreyCheck from 'assets/icons/grey_tick_icon.png';
import imgGreenCheck from 'assets/icons/green_tick_icon.png';
import GreenTick from 'assets/icons/green_tick_icon.png';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_ADDRESS_DETAILS from '../const';
import * as CONST from './const';
import {
	isImageFile,
	maxUploadSize,
	validateFileUpload,
} from 'utils/helperFunctions';
import infoIcon from 'assets/icons/info-icon.png';
import TooltipImage from 'components/Global/Tooltip';
import ImageViewerModal from 'components/Global/ImageViewerModal';

const AddressProofUpload = props => {
	const {
		field,
		formState,
		prefix,
		disabled = false,
		docTypeOptions = [],
		selectedAddressProofFieldName = '',
		selectedAddressProofId = '',
		isInActive = false,
		addressProofUploadSection,
		register,
		prefilledValues,
		setAddressProofError,
		onClickVerifyWithOtp,
		verifyingWithOtp,
		cacheDocumentsTemp,
		setCacheDocumentsTemp,
		setOtherCacheDocumentsTemp,
		selectedDocTypeId,
		isAadhaarVerified,
		onChangeFormStateField,
		isSectionCompleted,
		selectedVerifyOtp,
		// isEditLoan,
		isViewLoan,
		isEditOrViewLoan,
		directorDetails,
		doesAddressDetailsHasMoreThanTwoSubsection,
	} = props;

	// console.log(
	// 	{
	// 		addressProofUploadSection,
	// 		doesAddressDetailsHasMoreThanTwoSubsection,
	// 		prefix,
	// 		cacheDocumentsTemp,
	// 		setCacheDocumentsTemp,
	// 		setOtherCacheDocumentsTemp,
	// 	},
	// 	'address proof upload section'
	// );

	let { addressProofError } = props;
	const { app, application } = useSelector(state => state);
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};

	const isApplicant = isDirectorApplicant(selectedDirector);
	const { selectedProduct, clientToken, selectedSectionId, userDetails } = app;
	const { loanId, businessUserId } = application;
	// const directorDetail = editLoanData?.director_details;
	const ref = useRef(uuidv4());
	const prevSelectedAddressProofId = useRef(null);
	const refPopup = useRef(null);
	const { addToast } = useToasts();
	const id = uuidv4();
	const [dragging, setDragging] = useState(false);
	const [isPopoverOpen, setIsPopoverOpen] = useState(-1);
	const [viewMore, setViewMore] = useState([]);
	const [isDocumentTaggingOpen, setIsDocumentTaggingOpen] = useState(false);
	const [fetchingAddress, setFetchingAddress] = useState(false);
	const [isDocTypeChangeModalOpen, setIsDocTypeChangeModalOpen] = useState(
		false
	);
	const [openingRemovingDocument, setOpeningRemovingDocument] = useState(false);
	const [docTypeNameToolTip, setDocTypeNameToolTip] = useState(-1);
	const [imageSrc, setImageSrc] = useState('');
	const [isImageModalVisible, setIsImageModalVisible] = useState(false);

	let refCounter = 0;

	const aadhaarProofOTPField =
		addressProofUploadSection?.fields?.filter(field =>
			doesAddressDetailsHasMoreThanTwoSubsection
				? field?.name?.includes(
						CONST.AADHAAR_FIELD_NAME_FOR_OTP_AS_PER_DOCUMENT
				  )
				: field?.name?.includes(CONST.AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT)
		) || [];

	const prefillDataOnUpload =
		selectedProduct?.product_details?.prefill_data_on_upload || true;

	const isFileFromDeviceStorageAllowed =
		selectedProduct?.product_details?.is_file_from_storage_allowed;

	let isCameraCapture = '';
	if (
		isFileFromDeviceStorageAllowed !== undefined &&
		!isFileFromDeviceStorageAllowed
	) {
		isCameraCapture = 'camera';
	}

	const verifyKycAddressProof = async data => {
		try {
			const { req_type, extractionRes, doc_ref_id } = data;
			const { extractionData } = extractionRes;
			if (!selectedProduct?.product_details?.kyc_verification) return {};
			const reqBody = {
				business_id: application?.businessId,
				doc_ref_id: doc_ref_id,
				doc_type: req_type,
			};
			if (req_type === CONST_SECTIONS.EXTRACTION_KEY_AADHAAR) {
				reqBody.number = extractionData?.Aadhar_number || '';
			}
			if (req_type === CONST_SECTIONS.EXTRACTION_KEY_DL) {
				reqBody.number = extractionData?.dl_no || '';
				reqBody.dob = extractionData?.dob || extractionData?.DOB || '';
			}
			if (req_type === CONST_SECTIONS.EXTRACTION_KEY_VOTERID) {
				reqBody.number = extractionData?.vid || '';
				reqBody.state = extractionData?.state || '';
				reqBody.name = extractionData?.Name || extractionData?.name || '';
			}
			if (req_type === CONST_SECTIONS.EXTRACTION_KEY_PASSPORT) {
				// TODO: passport file number needs to be pass insted of passport number for verification KYC API
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

	const prepopulateAddressDetails = data => {
		const { extractionData } = data?.extractionRes;

		// AADHAAR NUMBER
		const aadharNum = extractionData?.Aadhar_number?.replaceAll(
			/\s/g,
			''
		).split('');
		const aadhaarUnMasked = aadharNum?.join('') || '';
		// const aadhaarMasked = aadharNum
		// 	? 'XXXXXXXX' + aadharNum?.splice(8, 4).join('')
		// 	: '';
		// if (aadhaarUnMasked)
		// 	onChangeFormStateField({
		// 		name: `${prefix}aadhaar`,
		// 		value: aadhaarUnMasked,
		// 	});
		// -- AADHAAR NUMBER

		// VOTER ID
		const voterId = extractionData?.vid;
		if (voterId)
			onChangeFormStateField({
				name: `${prefix}address_proof_id_voter`,
				value: voterId,
			});
		// -- VOTER ID

		// DL NUMBER
		const dlNo = extractionData?.dl_no;
		if (dlNo)
			onChangeFormStateField({
				name: `${prefix}address_proof_id_dl`,
				value: dlNo,
			});
		// -- DL NUMBER

		// PASSPORT NO
		const passportNo = extractionData?.passport_no;
		if (passportNo)
			onChangeFormStateField({
				name: `${prefix}address_proof_id_passport`,
				value: passportNo,
			});

		// -- PASSPORT NO

		// const fullName =
		// 	extractionData?.name?.split(' ') || extractionData?.Name?.split(' ');
		// const firstName = fullName[0].join(' ');
		// const lastName = fullName[fullName.length - 1];
		// const dob = extractionData?.DOB || extractionData?.dob;

		const fullAddress = extractionData?.address || extractionData?.Address;
		const addressArray = fullAddress?.split(/[;,]+/);
		if (!!addressArray?.[0]) {
			onChangeFormStateField({
				name: `${prefix}address1`,
				value: addressArray?.[0],
			});
		}
		if (!!addressArray?.[0]) {
			onChangeFormStateField({
				name: `${prefix}address2`,
				value: addressArray?.[1],
			});
		}
		if (!!addressArray?.[0]) {
			onChangeFormStateField({
				name: `${prefix}address3`,
				value: addressArray?.[2],
			});
		}
		const pinCode = extractionData?.pincode;
		if (!!pinCode) {
			onChangeFormStateField({
				name: `${prefix}pin_code`,
				value: pinCode,
			});
		}
		const extractedIssuedDate =
			extractionData?.issue_date || extractionData?.issue_date;
		if (!!extractedIssuedDate) {
			onChangeFormStateField({
				name: `${prefix}address_proof_issued_on`,
				value: moment(extractedIssuedDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
			});
		}
		const extractedValidDate =
			extractionData?.validity || extractionData?.exp_date;
		if (!!extractedValidDate) {
			onChangeFormStateField({
				name: `${prefix}address_proof_valid_till`,
				value: moment(extractedValidDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
			});
		}
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
				name: `${prefix}pin_code`,
				value: extractedPinCode,
			});
		}
	};

	const onClickFetchAddress = async () => {
		try {
			setFetchingAddress(true);
			const SELECTED_REQ_TYPE = selectedAddressProofId.replaceAll(prefix, '');
			setAddressProofError('');
			const selectedAddressProofFiles = cacheDocumentsTemp?.filter(
				doc => doc?.selectedAddressProofId === selectedAddressProofId
			);
			if (selectedAddressProofFiles.length > 2) {
				addToast({
					message: 'Max 2 doucment is allowed',
					type: 'error',
				});
				return;
			}

			// Front + Back Extract
			if (selectedAddressProofFiles.length > 1) {
				const frontFormData = new FormData();
				frontFormData.append('product_id', selectedProduct.id);
				frontFormData.append('director_id', selectedDirector?.directorId);
				frontFormData.append('req_type', SELECTED_REQ_TYPE);
				frontFormData.append('process_type', 'extraction');
				frontFormData.append('business_id', application?.businessId);
				if (
					selectedAddressProofId === CONST.PERMANENT_ADDRESS_PROOF_PASSPORT ||
					selectedAddressProofId === CONST.PRESENT_ADDRESS_PROOF_PASSPORT
				) {
					frontFormData.append(
						'passport_no',
						directorDetails?.passport_no || ''
					);
				}
				frontFormData.append('document', selectedAddressProofFiles?.[0]?.file);
				const frontExtractionRes = await getKYCData(frontFormData, clientToken);
				const front_aadhaar_number = frontExtractionRes?.data?.data?.Aadhar_number?.replace(
					/\s/g,
					''
				);

				if (
					selectedAddressProofId === `${prefix}aadhar` &&
					front_aadhaar_number?.length === 12
				) {
					onChangeFormStateField({
						name: `${prefix}aadhaar`,
						value: front_aadhaar_number,
					});
				}

				const frontExtractionStatus = frontExtractionRes?.data?.status || '';
				const frontExtractionMsg = frontExtractionRes?.data?.message || '';
				const frontForensicRes = frontExtractionRes?.data?.forensicData || {};
				const frontForensicFlag = frontForensicRes?.flag?.toLowerCase() || '';
				const frontForensicFlagMsg = frontForensicRes?.flag_message || '';
				if (frontExtractionStatus === 'nok') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontExtractionMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'error') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontForensicFlagMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				// if (frontForensicFlag === 'warning') {
				// 	setAddressProofError(
				// 		`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontForensicFlagMsg}`
				// 	);
				// 	// CONTINUE EXECUTION
				// }

				const frontFile = {
					...selectedAddressProofFiles[0],
					extractionRes: frontExtractionRes?.data || {},
					doc_ref_id: frontExtractionRes?.data?.doc_ref_id,
					document_key: frontExtractionRes?.data?.s3?.fd,
					mainType: 'KYC',
					size: frontExtractionRes?.data?.s3?.size,
					type: 'other',
					req_type: SELECTED_REQ_TYPE, // requires for mapping with JSON
					requestId: frontExtractionRes?.data?.request_id,
					upload_doc_name: frontExtractionRes?.data?.s3?.filename,
					category: CONST_SECTIONS.DOC_CATEGORY_KYC,
					directorId: selectedDirector.directorId,
					selectedDocTypeId,
				};

				const backFormData = new FormData();
				backFormData.append('product_id', selectedProduct.id);
				backFormData.append('director_id', selectedDirector?.directorId);
				backFormData.append('req_type', SELECTED_REQ_TYPE);
				backFormData.append(
					'ref_id',
					frontExtractionRes?.data?.extractionData?.id
				);
				backFormData.append('doc_ref_id', frontExtractionRes?.data?.doc_ref_id);
				backFormData.append('process_type', 'extraction');
				if (
					selectedAddressProofId === CONST.PERMANENT_ADDRESS_PROOF_PASSPORT ||
					selectedAddressProofId === CONST.PRESENT_ADDRESS_PROOF_PASSPORT
				) {
					backFormData.append(
						'passport_no',
						directorDetails?.passport_no || ''
					);
				}
				backFormData.append('business_id', application?.businessId);
				backFormData.append('document', selectedAddressProofFiles?.[1]?.file);
				const backExtractionRes = await getKYCDataId(backFormData, clientToken);
				const back_aadhaar_number = backExtractionRes?.data?.data?.Aadhar_number?.replace(
					/\s/g,
					''
				);

				if (
					selectedAddressProofId === `${prefix}aadhar` &&
					back_aadhaar_number?.length === 12
				) {
					onChangeFormStateField({
						name: `${prefix}aadhaar`,
						value: back_aadhaar_number,
					});
				}

				if (
					selectedAddressProofId === `${prefix}aadhar` &&
					back_aadhaar_number?.length !== 12 &&
					front_aadhaar_number?.length !== 12
				) {
					onChangeFormStateField({
						name: `${prefix}aadhaar`,
						value:
							back_aadhaar_number > front_aadhaar_number
								? back_aadhaar_number
								: front_aadhaar_number,
					});
				}

				const backExtractionStatus = backExtractionRes?.data?.status || '';
				const backExtractionMsg = backExtractionRes?.data?.message || '';
				const backForensicRes = backExtractionRes?.data?.forensicData || {};
				const backForensicFlag = backForensicRes?.flag?.toLowerCase() || '';
				const backForensicFlagMsg = backForensicRes?.flag_message || '';

				if (backExtractionStatus === 'nok') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${backExtractionMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				if (backForensicFlag === 'error') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${backForensicFlagMsg}`
					);
					return; // STOP FURTHER EXECUTION
				}
				if (frontForensicFlag === 'warning') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontForensicFlagMsg}`
					);
					// CONTINUE EXECUTION
				} else if (backForensicFlag === 'warning') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${backForensicFlagMsg}`
					);
					// CONTINUE EXECUTION
				}

				const backFile = {
					...selectedAddressProofFiles[1],
					extractionRes: backExtractionRes?.data || {},
					doc_ref_id: frontExtractionRes?.data?.doc_ref_id,
					document_key: backExtractionRes?.data.s3.fd,
					id: selectedAddressProofFiles[1].id,
					mainType: 'KYC',
					size: backExtractionRes?.data.s3.size,
					type: 'other',
					req_type: SELECTED_REQ_TYPE,
					requestId: backExtractionRes?.data.request_id,
					upload_doc_name: backExtractionRes?.data.s3.filename,
					category: CONST_SECTIONS.DOC_CATEGORY_KYC,
					directorId: selectedDirector.directorId,
					selectedDocTypeId,
				};

				const newCacheDocumentTemp = [];
				cacheDocumentsTemp?.map(doc => {
					if (doc.id === frontFile.id) {
						newCacheDocumentTemp.push(_.cloneDeep(frontFile));
					} else if (doc.id === backFile.id) {
						newCacheDocumentTemp.push(_.cloneDeep(backFile));
					} else {
						newCacheDocumentTemp.push(_.cloneDeep(doc));
					}
					return null;
				});
				setCacheDocumentsTemp(newCacheDocumentTemp);

				if (prefillDataOnUpload === undefined || prefillDataOnUpload) {
					if (
						!(
							doesAddressDetailsHasMoreThanTwoSubsection &&
							CONST.EXCLUDE_SECTION_PREFILL.includes(
								addressProofUploadSection?.id
							)
						)
					)
						prepopulateAddressDetails(backFile);
				}
				await verifyKycAddressProof(backFile);
				// setCacheDocumentsTemp([backFile])
				// const newAddressProofExtractionData = {
				// 	...backExtractionRes?.data?.extractionData,
				// 	doc_ref_id: frontExtractionRes?.data?.doc_ref_id,
				// 	requestId: backExtractionRes?.data.request_id,
				// };
				// TODO BELOW TASK
				// prepopulateAddressDetails(newAddressProofExtractionData);
				return;
			}

			// Front Only Extract
			const frontOnlyFormData = new FormData();
			frontOnlyFormData.append('product_id', selectedProduct.id);
			frontOnlyFormData.append('director_id', selectedDirector?.directorId);
			frontOnlyFormData.append('req_type', SELECTED_REQ_TYPE);
			frontOnlyFormData.append('process_type', 'extraction');
			if (
				selectedAddressProofId === CONST.PERMANENT_ADDRESS_PROOF_PASSPORT ||
				selectedAddressProofId === CONST.PRESENT_ADDRESS_PROOF_PASSPORT
			) {
				frontOnlyFormData.append(
					'passport_no',
					directorDetails?.passport_no || ''
				);
			}
			frontOnlyFormData.append('business_id', application?.businessId);
			frontOnlyFormData.append(
				'document',
				selectedAddressProofFiles?.[0]?.file
			);

			const frontOnlyExtractionRes = await getKYCData(
				frontOnlyFormData,
				clientToken
			);

			const frontOnly_aadhaar_number = frontOnlyExtractionRes?.data?.data?.Aadhar_number?.replace(
				/\s/g,
				''
			);

			if (selectedAddressProofId === `${prefix}aadhar`) {
				onChangeFormStateField({
					name: `${prefix}aadhaar`,
					value: frontOnly_aadhaar_number,
				});
			}

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
				if (
					doesAddressDetailsHasMoreThanTwoSubsection &&
					CONST.EXCLUDE_SECTION_PREFILL.includes(addressProofUploadSection?.id)
				) {
					addToast({
						message:
							'Document Upload Failed! Please reupload the taged documents.',
						type: 'error',
					});
					return;
				}
				setAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyExtractionMsg}`
				);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'error') {
				if (
					doesAddressDetailsHasMoreThanTwoSubsection &&
					CONST.EXCLUDE_SECTION_PREFILL.includes(addressProofUploadSection?.id)
				) {
					addToast({
						message:
							'Document Upload Failed! Please reupload the taged documents.',
						type: 'error',
					});
					return;
				}
				setAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyForensicFlagMsg}`
				);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'warning') {
				if (!doesAddressDetailsHasMoreThanTwoSubsection) {
					setAddressProofError(
						`${
							CONST_SECTIONS.EXTRACTION_FLAG_WARNING
						}${frontOnlyForensicFlagMsg}`
					);
				}
				// CONTINUE EXECUTION
			}
			const frontOnlyFile = {
				...selectedAddressProofFiles[0],
				extractionRes: frontOnlyExtractionRes?.data || {},
				doc_ref_id: frontOnlyExtractionRes?.data?.doc_ref_id,
				document_key: frontOnlyExtractionRes?.data?.s3?.fd,
				mainType: 'KYC',
				size: frontOnlyExtractionRes?.data?.s3?.size,
				type: 'other',
				req_type: SELECTED_REQ_TYPE,
				requestId: frontOnlyExtractionRes?.data?.request_id,
				upload_doc_name: frontOnlyExtractionRes?.data?.s3?.filename,
				name: frontOnlyExtractionRes?.data?.s3?.filename,
				category: CONST_SECTIONS.DOC_CATEGORY_KYC,
				directorId: selectedDirector.directorId,
				selectedDocTypeId,
			};

			const newCacheDocumentTemp = [];
			cacheDocumentsTemp?.map(doc => {
				if (doc.id === frontOnlyFile.id) {
					newCacheDocumentTemp.push(_.cloneDeep(frontOnlyFile));
				} else {
					newCacheDocumentTemp.push(_.cloneDeep(doc));
				}
				return null;
			});
			setCacheDocumentsTemp(newCacheDocumentTemp);

			// const newAddressProofExtractionData = {
			// 	...(frontOnlyExtractionRes?.data?.extractionData || {}),
			// 	doc_ref_id: frontOnlyExtractionRes?.data?.doc_ref_id,
			// 	requestId: frontOnlyExtractionRes?.data?.request_id,
			// };

			if (prefillDataOnUpload === undefined || prefillDataOnUpload) {
				if (
					!(
						doesAddressDetailsHasMoreThanTwoSubsection &&
						CONST.EXCLUDE_SECTION_PREFILL.includes(
							addressProofUploadSection?.id
						)
					)
				)
					prepopulateAddressDetails(frontOnlyFile);
			}
			await verifyKycAddressProof(frontOnlyFile);
			// await verifyKycAddressProof(REQ_TYPE, newAddressProofExtractionData);
		} catch (error) {
			console.error('error-pan-verification-onClickFetchAddress-', error);
		} finally {
			setFetchingAddress(false);
		}
	};

	const deleteDocument = async file => {
		try {
			setOpeningRemovingDocument(file?.document_key || file?.doc_type_id);
			const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp).filter(
				doc => doc.id !== file.id
			);
			setCacheDocumentsTemp(newCacheDocumentTemp);
			setAddressProofError('');
			if (selectedVerifyOtp?.res?.status === 'ok') {
				return null;
			} else {
				Object.keys(CONST_ADDRESS_DETAILS.resetAllFields).map(key => {
					onChangeFormStateField({
						name: `${prefix}${key}`,
						value: '',
					});
					return null;
				});
			}
		} catch (error) {
			console.error('error-deleteDocument-', error);
		} finally {
			setOpeningRemovingDocument(false);
		}
	};

	const handleUpload = async files => {
		const validatedResp = validateFileUpload(files);
		const finalFilesToUpload = validatedResp
			?.filter(item => item.status !== 'fail')
			.map(fileItem => fileItem.file);

		const erroredFiles = validatedResp?.filter(item => item.status === 'fail');

		if (finalFilesToUpload && finalFilesToUpload.length > 0) {
			const filesToUpload = [];
			for (let i = 0; i < finalFilesToUpload.length; i++) {
				// const source = axios.CancelToken.source();

				const id = generateUID();

				filesToUpload.push({
					id,
					name: finalFilesToUpload[i].name,
					file: finalFilesToUpload[i],
					progress: 100,
					status: 'progress',
					// cancelToken: source,
					selectedAddressProofId,
					prefix,
				});
			}
			// const newUploadingFiles = _.cloneDeep(selectedFiles.current);
			// const newUploadingFiles = [];
			// filesToUpload.map(f => newUploadingFiles.push(f));
			// uploadingProgressFiles.current = [
			// 	..._.cloneDeep(uploadingFiles),
			// 	..._.cloneDeep(uploadingProgressFiles.current),
			// 	...filesToUpload,
			// ];
			// selectedFiles.current = newUploadingFiles;
			// setUploadingFiles(newUploadingFiles);
			// setDocs([...docs, filesToUpload[0]]);
			const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
			newCacheDocumentTemp.push(filesToUpload[0]);
			setCacheDocumentsTemp(newCacheDocumentTemp);
			setIsDocumentTaggingOpen(true);
			return [filesToUpload[0]];
		} else {
			addToast({
				message: erroredFiles.length + ' ' + erroredFiles[0].error,
				type: 'error',
			});
			// return [];
		}
	};

	const handleDrag = e => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragIn = e => {
		e.preventDefault();
		e.stopPropagation();
		++refCounter;

		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setDragging(true);
		}
	};

	const handleDragOut = e => {
		e.preventDefault();
		e.stopPropagation();
		--refCounter;

		if (!refCounter) setDragging(false);
	};

	const handleDrop = async event => {
		event.preventDefault();
		event.stopPropagation();
		if (isInActive) return;
		setDragging(false);
		if (disabled) {
			addToast({
				message: `Only one document is allowed for pan card.!`,
				type: 'error',
			});
			return false;
		}
		if (event.dataTransfer.files.length > 1) {
			addToast({
				message: `Only one document is allowed to upload at one time!`,
				type: 'error',
			});
			return false;
		}
		if (disabled) return false;

		let files = [...event.dataTransfer.files];
		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			files = await handleUpload(files);
			if (files) {
				const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
				files.map(f => newCacheDocumentTemp.push(f));
				setCacheDocumentsTemp(newCacheDocumentTemp);
				event.dataTransfer.clearData();
				refCounter = 0;
			}
		}
	};

	const onChange = async event => {
		let files = [...event.target.files];
		const validatedResp = validateFileUpload(files);
		const finalFilesToUpload = validatedResp
			?.filter(item => item.status !== 'fail')
			.map(fileItem => fileItem.file);

		const erroredFiles = validatedResp?.filter(item => item.status === 'fail');

		if (finalFilesToUpload && finalFilesToUpload.length > 0) {
			files = await handleUpload(finalFilesToUpload);
			const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);

			files.map(f => {
				if (selectedAddressProofId?.includes('others')) {
					let file = {
						...f,
						mainType: 'KYC',
						type: 'other',
						upload_doc_name: f.name,
						category: CONST_SECTIONS.DOC_CATEGORY_KYC,
						directorId: selectedDirector.directorId,
						selectedDocTypeId,
					};
					newCacheDocumentTemp.push(file);
				} else {
					newCacheDocumentTemp.push(f);
				}
				return null;
			});
			setCacheDocumentsTemp(newCacheDocumentTemp);
		}
		if (erroredFiles && erroredFiles.length > 0) {
			// setErrorFormStateField(field.name, validatedResp[0].error);
			addToast({
				message: erroredFiles.length + ' ' + erroredFiles[0].error,
				type: 'error',
			});
		}
	};

	const onDocTypeChange = (file, docType) => {
		const selectedDocType = docTypeOptions.find(d => d.value === docType.value);
		const newCacheDocumentTemp = [];
		cacheDocumentsTemp?.map(doc => {
			const newDoc = _.cloneDeep(doc);
			if (doc.id === file.id) {
				newDoc.isTagged = selectedDocType;
				newDoc.doc_type_id = selectedDocType.doc_type_id;
			}
			newCacheDocumentTemp.push(newDoc);
			return null;
		});
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};

	const openDocument = async file => {
		try {
			setOpeningRemovingDocument(file.document_key || file.doc_type_id);
			const reqBody = {
				filename: file?.doc_name || file?.document_key || file?.fd || '',
			};
			reqBody.loan_id = loanId;
			reqBody.userid = businessUserId;
			const docRes = await axios.post(VIEW_DOCUMENT, reqBody);
			const downloadable = true;
			if (
				userDetails?.is_other &&
				isImageFile(file?.doc_name) &&
				!downloadable
			) {
				let imageURL = decryptViewDocumentUrl(docRes?.data?.signedurl);
				setImageSrc(imageURL);
				setIsImageModalVisible(true);
				return;
			}
			window.open(decryptViewDocumentUrl(docRes?.data?.signedurl), '_blank');
			setOpeningRemovingDocument(false);
		} catch (error) {
			setOpeningRemovingDocument(false);
			console.error('Unable to open file, try after sometime');
		}
	};

	const onCloseImageViewerModal = () => {
		setIsImageModalVisible(false);
		setImageSrc('');
	};

	const resetAllStates = () => {
		setIsDocumentTaggingOpen(false);
		setAddressProofError('');
		const newCacheDocumentTemp = _.cloneDeep(
			cacheDocumentsTemp?.filter(doc => {
				const doc_type_id = `${doc?.doc_type_id}`;
				if (!doc?.doc_type_id) return false;
				return !doc_type_id?.includes(prefix);
			})
		);
		Object.keys(CONST_ADDRESS_DETAILS.resetAllFields).map(key => {
			if (key === 'aadhar' && isAadhaarVerified) return null;
			onChangeFormStateField({
				name: `${prefix}${key}`,
				value: '',
			});
			return null;
		});
		setCacheDocumentsTemp(newCacheDocumentTemp);
		setOtherCacheDocumentsTemp(newCacheDocumentTemp);
	};

	useEffect(() => {
		if (isViewLoan) return;
		let div = ref?.current;
		if (!div?.addEventListener) return;
		div?.addEventListener('dragenter', handleDragIn);
		div?.addEventListener('dragleave', handleDragOut);
		div?.addEventListener('dragover', handleDrag);
		div?.addEventListener('drop', handleDrop);
		div?.addEventListener('dragend', handleDrag);

		return () => {
			div?.removeEventListener('dragenter', handleDragIn);
			div?.removeEventListener('dragleave', handleDragOut);
			div?.removeEventListener('dragover', handleDrag);
			div?.removeEventListener('drop', handleDrop);
			div?.removeEventListener('dragend', handleDrag);
		};
		// eslint-disable-next-line
	}, [disabled, selectedAddressProofId]);

	useEffect(() => {
		if (!selectedAddressProofId) return;
		if (!prevSelectedAddressProofId?.current && selectedAddressProofId) {
			return (prevSelectedAddressProofId.current = selectedAddressProofId);
		}
		if (prevSelectedAddressProofId?.current !== selectedAddressProofId) {
			// if (cacheDocumentsTemp?.filter(doc => !!doc.isTagged).length > 0) {
			if (cacheDocumentsTemp?.length > 0) {
				setIsDocTypeChangeModalOpen(true);
			} else {
				prevSelectedAddressProofId.current = selectedAddressProofId;
			}
		}
		// eslint-disable-next-line
	}, [selectedAddressProofId]);

	let doNotHideFetchAddress = true;
	let taggedDocumentCount = 0;
	let displayTagMessage = 0;

	cacheDocumentsTemp?.map(doc => {
		if (!!doc?.isTagged) taggedDocumentCount += 1;
		return null;
	});

	displayTagMessage = cacheDocumentsTemp?.length !== taggedDocumentCount;
	const addressProofErrorColorCode = CONST_SECTIONS.getExtractionFlagColorCode(
		addressProofError
	);
	const addressProofErrorIcon = CONST_SECTIONS.getExtractionFlagIcon(
		addressProofError
	);

	addressProofError = addressProofError.replace(
		CONST_SECTIONS.EXTRACTION_FLAG_ERROR,
		''
	);
	addressProofError = addressProofError.replace(
		CONST_SECTIONS.EXTRACTION_FLAG_WARNING,
		''
	);
	addressProofError = addressProofError.includes(
		CONST_SECTIONS.EXTRACTION_FLAG_SUCCESS
	)
		? ''
		: addressProofError;

	// FOR AADHAAR FIELD
	const customFieldProps = {};
	if (selectedVerifyOtp?.res?.status === 'ok') {
		customFieldProps.disabled = true;
	}
	if (disabled) {
		customFieldProps.disabled = disabled;
	}
	if (isSectionCompleted) {
		customFieldProps.disabled = true;
	}
	if (
		Object.keys(
			cacheDocumentsTemp?.filter(doc =>
				doc?.selectedAddressProofId?.includes(
					CONST_SECTIONS.EXTRACTION_KEY_AADHAAR
				)
			)?.[0]?.extractionRes || {}
		).length > 0
	) {
		customFieldProps.disabled = true;
	}

	return (
		<>
			{isImageModalVisible && (
				<ImageViewerModal
					onClose={onCloseImageViewerModal}
					imageSrc={imageSrc}
					modalVisible={isImageModalVisible}
				/>
			)}

			<UI.Wrapper>
				{selectedAddressProofId === 'permanent_aadhar' && (
					<UI.HintWrapper>
						<Hint
							hint='You can choose to upload document or enter Aadhaar Number to proceed with Address Details'
							showIcon={false}
						/>
					</UI.HintWrapper>
				)}
				<Modal
					show={isDocTypeChangeModalOpen}
					onClose={() => {
						setIsDocTypeChangeModalOpen(false);
					}}
					width='50%'
					customStyle={{ minHeight: 200 }}
				>
					<UI.DocTypeChangeModalBody>
						<UI.DocTypeChangeModalHeader>
							<p className='py-2'>
								<strong>Are you sure want to change document type?</strong>
							</p>
							<p>
								By changing it, all the existing tagged and untagged document
								will be lost.
							</p>
						</UI.DocTypeChangeModalHeader>
						<UI.DocTypeChangeModalFooter>
							<Button
								name='Confirm'
								fill
								onClick={() => {
									resetAllStates();
									prevSelectedAddressProofId.current = selectedAddressProofId;
									setIsDocTypeChangeModalOpen(false);
								}}
							/>
							<Button
								name='Cancel'
								onClick={() => {
									setIsDocTypeChangeModalOpen(false);
									onChangeFormStateField({
										name: selectedAddressProofFieldName,
										value: prevSelectedAddressProofId.current,
									});
								}}
							/>
						</UI.DocTypeChangeModalFooter>
					</UI.DocTypeChangeModalBody>
				</Modal>
				<UI.DropZoneOtpFieldWrapper>
					{/* {!isViewLoan && ( */}
					<UI.Dropzone
						isInActive={isInActive || isSectionCompleted}
						ref={ref}
						dragging={dragging}
						// bg={bg}
						disabled={disabled}
						uploading={fetchingAddress}
					>
						<UI.Caption>Upload Address Proof</UI.Caption>
						{maxUploadSize && (
							<TooltipImage
								src={infoIcon}
								alt='Image Alt Text'
								title={`Maximum upload size for every image is ${maxUploadSize}MB`}
							/>
						)}
						<UI.UploadButton
							type='file'
							id={id}
							accept=''
							{...(isCameraCapture ? { capture: 'camera' } : {})}
							onChange={onChange}
							onClick={e => {
								if (isInActive) {
									e.preventDefault();
									e.stopPropagation();
								}
								e.target.value = '';
							}}
							disabled={disabled}
							multiple={false}
						/>
						<UI.IconWrapper>
							<UI.IconUpload htmlFor={id}>
								<img
									draggable={false}
									src={uploadCircleIcon}
									width={30}
									style={{
										maxWidth: 'none',
										filter: isInActive ? 'grayscale(200%)' : 'none',
									}}
									alt='upload'
								/>
							</UI.IconUpload>
							<UI.IconCollapse
								draggable={false}
								isDocumentTaggingOpen={isDocumentTaggingOpen}
								src={imgArrowDownCircle}
								width={30}
								style={{
									maxWidth: 'none',
									filter: isInActive ? 'grayscale(200%)' : 'none',
								}}
								alt='upload'
								onClick={e => {
									setIsDocumentTaggingOpen(!isDocumentTaggingOpen);
								}}
							/>
						</UI.IconWrapper>
					</UI.Dropzone>
					{/* )} */}
					{field.name.includes(CONST_ADDRESS_DETAILS.PREFIX_PRESENT) ? null : (
						<>
							{(selectedAddressProofId === 'as_per_document_aadhar' ||
								(selectedAddressProofId === 'permanent_aadhar' &&
									!doesAddressDetailsHasMoreThanTwoSubsection)) && (
								<UI.OR>or</UI.OR>
							)}
							{aadhaarProofOTPField.map((aadharField, fieldIndex) => {
								// console.log('aadhar-field', aadharField);
								if (aadharField?.for_type_name) {
									if (
										!aadharField?.for_type?.includes(
											formState?.values?.[aadharField?.for_type_name]
										)
									)
										return null;
								}
								return (
									<UI.AadhaarNumberOtpFieldWrapper
										key={`${aadharField?.name}-${fieldIndex}`}
									>
										{register({
											...aadharField,
											value: prefilledValues(aadharField),
											visibility: 'visible',
											...customFieldProps,
										})}
										{(selectedVerifyOtp?.res?.status === 'ok' ||
											selectedDirector?.is_aadhaar_otp_verified === true) && (
											<UI.GreenTickImage src={GreenTick} alt='green tick' />
										)}

										{aadharField?.sub_fields
											?.filter(f => !f?.is_prefix)
											?.map(subField => {
												if (
													!isFieldValid({
														field: subField,
														isApplicant,
														formState: {},
													})
												) {
													return null;
												}
												if (subField?.type === 'button') {
													return (
														<Button
															name={
																<span>
																	{subField?.placeholder}
																	{!!subField?.rules?.required && (
																		<sup style={{ color: 'red' }}>&nbsp;*</sup>
																	)}
																</span>
															}
															isLoader={verifyingWithOtp}
															disabled={
																// isSectionCompleted ||
																directorDetails?.is_aadhaar_otp_verified ||
																selectedVerifyOtp?.res?.status === 'ok' ||
																!formState.values[aadharField.name] ||
																isViewLoan ||
																verifyingWithOtp
																// (directors?.filter(
																// 	director =>
																// 		`${director?.id}` ===
																// 		`${selectedDirector?.directorId}`
																// ).length > 0 &&
																// 	isEditLoan)
															}
															type='button'
															customStyle={{
																whiteSpace: 'nowrap',
																width: '150px',
																minWidth: '150px',
																height: '45px',
															}}
															onClick={() => {
																onClickVerifyWithOtp(aadharField);
															}}
														/>
													);
												}
												if (subField?.type === 'link') {
													return (
														<Button
															name={subField?.placeholder}
															type='button'
															customStyle={{
																whiteSpace: 'nowrap',
																width: '150px',
																minWidth: '150px',
																height: '45px',
															}}
															onClick={() =>
																window.open(subField?.link, '_blank')
															}
														/>
													);
												}
												return null;
											})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[aadharField.name]) &&
											formState?.error?.[aadharField.name] && (
												<UI_SECTIONS.ErrorMessageSubFields>
													{formState?.error?.[aadharField.name]}
												</UI_SECTIONS.ErrorMessageSubFields>
											)}
									</UI.AadhaarNumberOtpFieldWrapper>
								);
							})}
						</>
					)}
				</UI.DropZoneOtpFieldWrapper>
				<UI.DocumentTaggingSectionWrapper
					isDocumentTaggingOpen={isDocumentTaggingOpen}
					isFetchAddressButton={selectedAddressProofId?.includes('others')}
				>
					{displayTagMessage ? (
						<UI.WarningMessage>
							{' '}
							Click on{' '}
							<UI.FileTypeSmallIcon src={imgArrowDownCircle} alt='arrow' />
							and select the front and back part of the uploaded document
						</UI.WarningMessage>
					) : null}
					{addressProofError && (
						<UI.AddressProofErrorMessage
							addressProofErrorColorCode={addressProofErrorColorCode}
						>
							<UI.ImgErrorIcon src={addressProofErrorIcon} />
							<span>{addressProofError}</span>
						</UI.AddressProofErrorMessage>
					)}
					<UI.UnTaggedFileListWrap>
						{cacheDocumentsTemp?.map((doc, upidx) => {
							if (!!doc?.isTagged) return null;
							doc.name = doc.name || doc.upload_doc_name || '';
							return (
								<UI.File
									addressProofErrorColorCode={addressProofErrorColorCode}
									key={`${doc.id}-${upidx}-${doc.doc_type_id}`}
									progress={doc.progress}
									status={doc.status}
									tooltip={doc.name}
								>
									<UI.FileName>
										{doc?.name?.length > 20
											? doc?.name?.slice(0, 20) + '...'
											: doc?.name}
									</UI.FileName>
									<UI.ImgClose
										style={{ marginRight: '60px' }}
										src={imgClose}
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											deleteDocument(doc);
										}}
										alt='close'
									/>
									{docTypeOptions?.length > 0 && !fetchingAddress && (
										<Popover
											isOpen={isPopoverOpen === doc.id}
											align='start'
											positions={['left', 'bottom', 'top', 'right']} // preferred positions by priority
											padding={-50} // adjust padding here!
											reposition={false} // prevents automatic readjustment of content position that keeps your popover content within its parent's bounds
											onClickOutside={() => setIsPopoverOpen(-1)} // handle click events outside of the popover/target here!
											ref={refPopup}
											content={popupProps => {
												const fontDocTypeId = `${docTypeOptions[0]?.id}`;
												const backDocTypeId = `${docTypeOptions[1]?.id}`;
												const frontBackDocTypeId = `${docTypeOptions[2]?.id}`;
												const isFrontTagged =
													cacheDocumentsTemp?.filter(
														doc => doc.doc_type_id === fontDocTypeId
													).length > 0;
												const isBackTagged =
													cacheDocumentsTemp?.filter(
														doc => doc.doc_type_id === backDocTypeId
													).length > 0;
												const isFrontBackTagged =
													cacheDocumentsTemp?.filter(
														doc => doc.doc_type_id === frontBackDocTypeId
													).length > 0;
												return (
													<UI.FileTypeBox>
														<UI.FileTypeUL>
															{docTypeOptions.map((docType, docoptidx) => {
																if (isFrontTagged && docoptidx === 0)
																	return null;
																if (isBackTagged && docoptidx === 1)
																	return null;
																if (isFrontBackTagged && docoptidx === 2)
																	return null;
																if (
																	(isFrontTagged || isBackTagged) &&
																	docoptidx === 2
																)
																	return null;
																if (
																	isFrontBackTagged &&
																	(docoptidx === 0 || docoptidx === 1)
																)
																	return null;
																return (
																	<UI.FileTypeList
																		key={`${docType.value}-${docoptidx}-${
																			docType.doc_type_id
																		}`}
																		value={docType.name}
																		onClick={() => {
																			onDocTypeChange(doc, docType);
																			setIsPopoverOpen(-1);
																		}}
																	>
																		{docType.name}
																		{docType.isMandatory && (
																			<span
																				style={{
																					color: 'red',
																				}}
																			>
																				&nbsp;*
																			</span>
																		)}
																	</UI.FileTypeList>
																);
															})}
														</UI.FileTypeUL>
														<UI.FileTypeIconInsidePopover
															draggable={false}
															src={imgArrowDownCircle}
															alt='arrow'
															onClick={() => {
																setIsPopoverOpen(
																	isPopoverOpen === doc.id ? -1 : doc.id
																);
															}}
														/>
													</UI.FileTypeBox>
												);
											}}
										>
											<UI.FileType
												onClick={() =>
													setIsPopoverOpen(
														isPopoverOpen === doc.id ? -1 : doc.id
													)
												}
											>
												<UI.FileTypeIconOutsidePopover
													draggable={false}
													src={imgArrowDownCircle}
													alt='arrow'
												/>
											</UI.FileType>
										</Popover>
									)}
								</UI.File>
							);
						})}
					</UI.UnTaggedFileListWrap>
					<UI.DocumentUploadListWrapper>
						{/* {console.log({ docTypeOptions, cacheDocumentsTemp })} */}
						{docTypeOptions.map((docType, doctypeidx) => {
							const mappedDocFiles = cacheDocumentsTemp?.filter(
								doc =>
									doc?.doc_type_id === docType?.doc_type_id ||
									doc?.isTagged?.doc_type_id === docType?.doc_type_id
							);

							// TODO: discuss with PM not possible
							// const uploadedDocuments = prefilledDocs.filter(
							// 	doc => doc?.isTagged?.doc_type_id === docType?.doc_type_id
							// );
							// uploadedDocuments.map(doc => mappedDocFiles?.push(doc));

							return (
								<UI.DocumentUploadList
									key={`${docType.id}-${doctypeidx}-${docType.doc_type_id}`}
								>
									<UI.DocumentUploadListRow1>
										<UI.DocumentUploadCheck
											src={
												mappedDocFiles?.length ? imgGreenCheck : imgGreyCheck
											}
											alt='check'
										/>
										{docTypeNameToolTip === `${docType.id}-${doctypeidx}` && (
											<UI.DocumentUploadNameToolTip>
												{docType.name}
											</UI.DocumentUploadNameToolTip>
										)}
										<UI.DocumentUploadName
											onMouseOver={() =>
												setDocTypeNameToolTip(`${docType.id}-${doctypeidx}`)
											}
											onMouseOut={() => setDocTypeNameToolTip(-1)}
											isSelected={mappedDocFiles?.length}
										>
											{docType.isMandatory && (
												<span
													style={{
														color: 'red',
													}}
												>
													*&nbsp;
												</span>
											)}
											{window?.location?.hostname?.includes('localhost') && (
												<span style={{ color: 'blue' }}>
													{docType?.doc_type_id}{' '}
												</span>
											)}
											{docType.name}
										</UI.DocumentUploadName>
									</UI.DocumentUploadListRow1>
									<UI.DocumentUploadListRow2>
										{mappedDocFiles?.map((doc, index) => {
											if (index > 0) return null;
											const isViewMoreClicked = viewMore.includes(
												docType.doc_type_id
											);
											const isViewMore = !isViewMoreClicked && index === 2;
											if (!isViewMoreClicked && index > 2) return null;
											const uniqPassId = `${doc.id}${index}${doc.doc_type_id}`;
											let isDocRemoveAllowed = true;
											let isViewDocAllowed = true;
											if ('isDocRemoveAllowed' in doc) {
												isDocRemoveAllowed = doc?.isDocRemoveAllowed || false;
											}
											if (doc?.is_delete_not_allowed === true) {
												isDocRemoveAllowed = false;
												doNotHideFetchAddress = false;
											}
											if (
												isEditOrViewLoan &&
												doc?.is_delete_not_allowed === 'true'
											) {
												isDocRemoveAllowed = false;
												doNotHideFetchAddress = false;
											}
											return (
												<UI.File
													addressProofErrorColorCode={
														addressProofErrorColorCode
													}
													key={`file-${uniqPassId}-${doc.doc_type_id}`}
													style={{
														width: '220px',
														margin: '0 0 0 45px',
														height: '35px',
														lineHeight: '35px',
														background: isViewMore ? '#e6ffef' : '',
														cursor: isViewDocAllowed
															? 'pointer'
															: 'not-allowed',
													}}
													onClick={e => {
														e.preventDefault();
														e.stopPropagation();
														if (isViewMore)
															setViewMore([...viewMore, docType.doc_type_id]);
													}}
												>
													<UI.FileName
														link
														style={{
															fontSize: 12,
															width: '100%',
														}}
														onClick={e => {
															if (!isViewMore) {
																e.preventDefault();
																e.stopPropagation();
																openDocument(doc);
															}
														}}
													>
														{isViewMore
															? `View ${mappedDocFiles?.length - 2} more`
															: doc?.name?.length > 20
															? doc?.name?.slice(0, 20) + '...'
															: doc?.name}
													</UI.FileName>
													{openingRemovingDocument === doc.document_key ? (
														<div style={{ marginLeft: 'auto', height: '30px' }}>
															<CircularLoading />
														</div>
													) : (
														isDocRemoveAllowed &&
														!isViewLoan &&
														!selectedDirector?.sections?.includes(
															CONST_SECTIONS.ADDRESS_DETAILS_SECTION_ID
														) && (
															<UI.ImgClose
																style={{ height: '20px' }}
																src={isViewMore ? imgArrowDownCircle : imgClose}
																onClick={e => {
																	e.preventDefault();
																	e.stopPropagation();
																	if (isViewMore) return;
																	deleteDocument(doc);
																}}
																alt='close'
															/>
														)
													)}
												</UI.File>
											);
										})}
									</UI.DocumentUploadListRow2>
								</UI.DocumentUploadList>
							);
						})}
					</UI.DocumentUploadListWrapper>
					<UI.CTAWrapper>
						{!addressProofError &&
							!selectedAddressProofId?.includes('others') &&
							!!taggedDocumentCount &&
							doNotHideFetchAddress &&
							!selectedDirector?.sections?.includes(selectedSectionId) && (
								<Button
									fill
									name={
										doesAddressDetailsHasMoreThanTwoSubsection &&
										CONST.EXCLUDE_SECTION_PREFILL.includes(
											addressProofUploadSection?.id
										)
											? 'Upload Document'
											: 'Fetch Address'
									}
									isLoader={fetchingAddress}
									disabled={
										fetchingAddress ||
										cacheDocumentsTemp?.length <= 0 ||
										addressProofError
									}
									onClick={onClickFetchAddress}
								/>
							)}
					</UI.CTAWrapper>
				</UI.DocumentTaggingSectionWrapper>
			</UI.Wrapper>
		</>
	);
};

export default AddressProofUpload;
