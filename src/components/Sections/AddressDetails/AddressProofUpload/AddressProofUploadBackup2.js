/* FIle upload details section. This section handles drag, drop
of file, upload and deletion */

import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Popover } from 'react-tiny-popover';
import CircularLoading from 'components/Loaders/Circular';
import Button from 'components/Button';
import Modal from 'components/Modal';

import generateUID from 'utils/uid';
import { useToasts } from 'components/Toast/ToastProvider';
import { VIEW_DOCUMENT } from '_config/app.config';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import { getKYCData, getKYCDataId } from 'utils/request';
import uploadCircleIcon from 'assets/icons/upload_icon_blue.png';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import imgArrowDownCircle from 'assets/icons/drop_down_green-05.svg';
import imgGreyCheck from 'assets/icons/grey_tick_icon.png';
import imgGreenCheck from 'assets/icons/green_tick_icon.png';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_ADDRESS_DETAILS from '../const';

const AddressProofUpload = props => {
	const {
		field,
		formState,
		prefix,
		onDrop = () => {},
		disabled = false,
		docTypeOptions = [],
		docs,
		setDocs,
		section = '',
		selectedAddressProofFieldName = '',
		selectedAddressProofId = '',
		startingTaggedDocs = [],
		startingUnTaggedDocs = [],
		isInActive = false,
		prefilledDocs = [],
		addressProofUploadSection,
		register,
		prefilledValues,
		setAddressProofError,
		onClickVerifyWithOtp,
		verifyingWithOtp,
		cacheDocumentsTemp,
		setCacheDocumentsTemp,
		selectedDocTypeId,
		onChangeFormStateField,
	} = props;
	let { addressProofError } = props;
	const { app, applicantCoApplicants } = useSelector(state => state);
	const { selectedProduct, clientToken, isEditLoan, isViewLoan } = app;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
		isApplicant,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants[selectedApplicantCoApplicantId] || {};
	const ref = useRef(uuidv4());
	const prevSelectedAddressProofId = useRef(null);
	const refPopup = useRef(null);
	const { addToast } = useToasts();

	const id = uuidv4();

	const [loading, setLoading] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [uploadingFiles, setUploadingFiles] = useState([]);
	const [docTypeFileMap, setDocTypeFileMap] = useState({});
	const [mappedFiles, setMappedFiles] = useState({});
	const [isPopoverOpen, setIsPopoverOpen] = useState(-1);
	const [viewMore, setViewMore] = useState([]);
	const [passwordList, setPasswordList] = useState([]);
	const [isDocumentTaggingOpen, setIsDocumentTaggingOpen] = useState(false);
	const [fetchingAddress, setFetchingAddress] = useState(false);
	const [isDocTypeChangeModalOpen, setIsDocTypeChangeModalOpen] = useState(
		false
	);
	const selectedFiles = useRef([]);
	//const [docSelected, setDocSelected] = useState('');
	const [openingRemovingDocument, setOpeningRemovingDocument] = useState(false);

	let refCounter = 0;

	const aadhaarProofOTPField = addressProofUploadSection?.fields?.[2] || {};

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
			name: `${prefix}aadhaar`,
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
			name: `${prefix}address1`,
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

			// console.log('onClickFetchAddress-selectedAddressProofFiles-', {
			// 	selectedAddressProofFiles,
			// });
			// Front + Back Extract
			if (selectedAddressProofFiles.length > 1) {
				const frontFormData = new FormData();
				frontFormData.append('product_id', selectedProduct.id);
				frontFormData.append('req_type', SELECTED_REQ_TYPE);
				frontFormData.append('process_type', 'extraction');
				frontFormData.append('document', selectedAddressProofFiles?.[0]?.file);

				const frontExtractionRes = await getKYCData(frontFormData, clientToken);
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
				if (frontForensicFlag === 'warning') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontForensicFlagMsg}`
					);
					// CONTINUE EXECUTION
				}

				const frontFile = {
					extractionData: _.cloneDeep(
						frontExtractionRes?.data?.extractionData || {}
					),
					document_key: frontExtractionRes?.data?.s3?.fd,
					id: selectedAddressProofFiles[0].id,
					mainType: 'KYC',
					size: frontExtractionRes?.data?.s3?.size,
					type: 'other',
					req_type: SELECTED_REQ_TYPE, // requires for mapping with JSON
					requestId: frontExtractionRes?.data?.request_id,
					upload_doc_name: frontExtractionRes?.data?.s3?.filename,
					category: CONST_SECTIONS.DOC_CATEGORY_KYC,
					directorId: selectedApplicant.directorId,
					doc_type_id: selectedDocTypeId,
				};

				const backFormData = new FormData();
				backFormData.append('product_id', selectedProduct.id);
				backFormData.append('req_type', SELECTED_REQ_TYPE);
				backFormData.append(
					'ref_id',
					frontExtractionRes?.data?.extractionData?.id
				);
				backFormData.append('doc_ref_id', frontExtractionRes?.data?.doc_ref_id);
				backFormData.append('process_type', 'extraction');
				backFormData.append('document', selectedAddressProofFiles?.[1]?.file);

				const backExtractionRes = await getKYCDataId(backFormData, clientToken);
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
				if (backForensicFlag === 'warning') {
					setAddressProofError(
						`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${backForensicFlagMsg}`
					);
					// CONTINUE EXECUTION
				}

				const backFile = {
					extractionData: _.cloneDeep(
						backExtractionRes?.data?.extractionData || {}
					),
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
					directorId: selectedApplicant.directorId,
					selectedDocTypeId,
				};

				// console.log('%c front and back', 'color: red', {
				// 	frontFile,
				// 	backFile,
				// });
				// const newAddressProofExtractionData = {
				// 	...backExtractionRes?.data?.extractionData,
				// 	doc_ref_id: frontExtractionRes?.data?.doc_ref_id,
				// 	requestId: backExtractionRes?.data.request_id,
				// };
				// TODO BELOW TASK
				// prepopulateAadhaarAndAddressState(newAddressProofExtractionData);
				// await verifyKycAddressProof(SELECTED_REQ_TYPE, newAddressProofExtractionData);
				return;
			}

			// Front Only Extract
			const frontOnlyFormData = new FormData();
			frontOnlyFormData.append('product_id', selectedProduct.id);
			frontOnlyFormData.append('req_type', SELECTED_REQ_TYPE);
			frontOnlyFormData.append('process_type', 'extraction');
			frontOnlyFormData.append(
				'document',
				selectedAddressProofFiles?.[0]?.file
			);

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
				setAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyExtractionMsg}`
				);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'error') {
				setAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${frontOnlyForensicFlagMsg}`
				);
				return; // STOP FURTHER EXECUTION
			}
			if (frontOnlyForensicFlag === 'warning') {
				setAddressProofError(
					`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${frontOnlyForensicFlagMsg}`
				);
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
				directorId: selectedApplicant.directorId,
				selectedDocTypeId,
			};

			const newCacheDocumentTemp = [];
			cacheDocumentsTemp.map(doc => {
				if (doc.id === frontOnlyFile.id) {
					newCacheDocumentTemp.push(_.cloneDeep(frontOnlyFile));
				} else {
					newCacheDocumentTemp.push(_.cloneDeep(doc));
				}
				return null;
			});
			setCacheDocumentsTemp(newCacheDocumentTemp);

			// console.log('%c front only file', 'color: red', { frontOnlyFile });

			// const newAddressProofExtractionData = {
			// 	...(frontOnlyExtractionRes?.data?.extractionData || {}),
			// 	doc_ref_id: frontOnlyExtractionRes?.data?.doc_ref_id,
			// 	requestId: frontOnlyExtractionRes?.data?.request_id,
			// };
			prepopulateAadhaarAndAddressState(
				frontOnlyFile?.extractionRes?.extractionData || {}
			);
			// await verifyKycAddressProof(REQ_TYPE, newAddressProofExtractionData);
		} catch (error) {
			console.error('error-pan-verification-onClickFetchAddress-', error);
		} finally {
			setFetchingAddress(false);
		}
	};

	const onFileRemove = async (file, docType = false) => {
		try {
			setOpeningRemovingDocument(file.document_key || file.doc_type_id);
			const newUploadingFiles = [];
			selectedFiles.current.map(uFile => {
				if (uFile.id !== file.id) newUploadingFiles.push(uFile);
				return null;
			});
			if (docType) {
				const newMappedFile = _.cloneDeep(mappedFiles);
				const newObj = [];
				newMappedFile[docType.doc_type_id]?.map(uFile => {
					if (uFile.id !== file.id) newObj.push(uFile);
					return null;
				});
				newMappedFile[docType.doc_type_id] = newObj;
				setMappedFiles(newMappedFile);
			}

			const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp).filter(
				doc => doc.id !== file.id
			);
			// removeCacheDocument(newCacheDocumentTemp);
			setCacheDocumentsTemp(newCacheDocumentTemp);
			// onRemoveFile(file.id, file);
			selectedFiles.current = newUploadingFiles;
			setUploadingFiles(newUploadingFiles);
			setOpeningRemovingDocument(false);
			setAddressProofError('');
		} catch (error) {
			console.error('error-onFileRemove-', error);
			setOpeningRemovingDocument(false);
		}
	};

	const handleUpload = async files => {
		const filesToUpload = [];
		for (let i = 0; i < files.length; i++) {
			const source = axios.CancelToken.source();

			const id = generateUID();

			filesToUpload.push({
				id,
				name: files[i].name,
				file: files[i],
				progress: 100,
				status: 'progress',
				cancelToken: source,
				selectedAddressProofId,
			});
		}
		const newUploadingFiles = _.cloneDeep(selectedFiles.current);
		// const newUploadingFiles = [];
		filesToUpload.map(f => newUploadingFiles.push(f));
		// uploadingProgressFiles.current = [
		// 	..._.cloneDeep(uploadingFiles),
		// 	..._.cloneDeep(uploadingProgressFiles.current),
		// 	...filesToUpload,
		// ];
		// console.log('file-upload-before-promise-', newUploadingFiles);
		selectedFiles.current = newUploadingFiles;
		setUploadingFiles(newUploadingFiles);
		setDocs([...docs, filesToUpload[0]]);
		setIsDocumentTaggingOpen(true);
		return [filesToUpload[0]];
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
		// console.log('after-', {
		// 	pan,
		// 	upload,
		// 	files,
		// 	event,
		// 	eventFiles: event.dataTransfer.files,
		// });
		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			// console.log('before-handleUpload-', {
			// 	files,
			// });
			files = await handleUpload(files);
			// console.log('after-handleUpload-', {
			// 	files,
			// });
			onDrop(files);
			// console.log('before current-files-', {
			// 	current: selectedFiles.current,
			// 	files,
			// });
			// console.log('FileUpload-handleDrop-', {
			// 	pan,
			// 	disabled,
			// 	upload,
			// 	files,
			// 	uploadingFiles,
			// 	selectedFiles: selectedFiles.current,
			// });
			event.dataTransfer.clearData();
			refCounter = 0;
		}
	};

	const onChange = async event => {
		let files = [...event.target.files];
		files = await handleUpload(files);
		onDrop(files);
		// console.log('FileUpload-onChange-', {
		// 	pan,
		// 	disabled,
		// 	upload,
		// 	files,
		// 	uploadingFiles,
		// 	selectedFiles: selectedFiles.current,
		// });
	};

	// const onDocTypeChange = (fileId, value, file) => {
	const onDocTypeChange = (file, docType) => {
		const selectedDocType = docTypeOptions.find(d => d.value === docType.value);
		// console.log('onDocTypeChange-selected-doctype-', {
		// 	file,
		// 	docType,
		// 	selectedDocType,
		// });
		const newMappedFile = _.cloneDeep(mappedFiles);
		const newObj = newMappedFile[docType.value] || [];
		newObj.push(file);
		newMappedFile[docType.value] = newObj;
		setMappedFiles(newMappedFile);
		const newDocTypeFileMap = {
			..._.cloneDeep(docTypeFileMap),
			[file.id]: selectedDocType, // value
		};
		// documentTypeChangeCallback(file.id, selectedDocType);
		const newCacheDocumentTemp = [];
		cacheDocumentsTemp.map(doc => {
			const newDoc = _.cloneDeep(doc);
			if (doc.id === file.id) {
				newDoc.isTagged = selectedDocType;
				newDoc.doc_type_id = selectedDocType.doc_type_id;
			}
			newCacheDocumentTemp.push(newDoc);
			return null;
		});
		setCacheDocumentsTemp(newCacheDocumentTemp);
		setDocTypeFileMap(newDocTypeFileMap);
		// console.log('onDocTypeChange-eod-', { newMappedFile, newDocTypeFileMap });
	};

	const openDocument = async file => {
		try {
			// console.log('open-doc-', file);
			setOpeningRemovingDocument(file.document_key || file.doc_type_id);
			const reqBody = {
				filename: file?.doc_name || file?.document_key || file?.fd || '',
			};
			if (file.loan) {
				reqBody.loan_id = file.loan;
				reqBody.userid = file.user_id;
			} else {
				reqBody.isProfile = true;
			}
			// console.log('openDocument-reqBody-', { reqBody, file });
			const docRes = await axios.post(VIEW_DOCUMENT, reqBody);
			// console.log('openDocument-res-', docRes);
			window.open(decryptViewDocumentUrl(docRes?.data?.signedurl), '_blank');
			setOpeningRemovingDocument(false);
		} catch (error) {
			setOpeningRemovingDocument(false);
			console.error('Unable to open file, try after sometime');
		}
	};

	const initializeComponent = async () => {
		try {
			setLoading(true);
			// in case of edit_loan
			// console.log('FileUpload-initializeComponent-', { mappedFiles, props });
			if (prefilledDocs && prefilledDocs.length > 0) {
				setDocTypeFileMap(_.cloneDeep(prefilledDocs));
				const newMappedFile = _.cloneDeep(mappedFiles);
				const newDocTypeFileMap = {
					..._.cloneDeep(docTypeFileMap),
				};
				prefilledDocs.map(doc => {
					const tempFile = _.cloneDeep(doc);
					// const tempDocType = { value: doc.id };
					const selectedDocType = docTypeOptions.find(
						d => d.value === tempFile.id
					);
					const newObj = newMappedFile[tempFile.id] || [];
					newObj.push(tempFile);
					newMappedFile[tempFile.id] = newObj;
					newDocTypeFileMap[tempFile.id] = selectedDocType;
					// documentTypeChangeCallback(tempFile.id, selectedDocType);
					return null;
				});
				setDocTypeFileMap(newDocTypeFileMap);
				setMappedFiles(newMappedFile);
			}
			// doc upload section navigation history
			// + pan adhar dl voter
			if (startingTaggedDocs && startingTaggedDocs.length > 0) {
				const newMappedFiles = _.cloneDeep(mappedFiles);
				startingTaggedDocs.map(doc => {
					const newObj = newMappedFiles[+doc.typeId] || [];
					newObj.push(doc);
					newMappedFiles[+doc.typeId] = newObj;
					return null;
				});
				setMappedFiles(newMappedFiles);
			}
			// doc upload section navigation history
			if (startingUnTaggedDocs && startingUnTaggedDocs.length > 0) {
				selectedFiles.current = startingUnTaggedDocs;
				setUploadingFiles(startingUnTaggedDocs);
			}
			// console.log('FileUpload-initializeComponent-EOD-', {
			// 	prefilledDocs,
			// 	startingTaggedDocs,
			// 	startingUnTaggedDocs,
			// });
			setLoading(false);
		} catch (error) {
			console.error('error-FileUpload-initializeComponent-', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		initializeComponent();
		// eslint-disable-next-line
	}, [selectedAddressProofId]);

	const resetAllStates = () => {
		selectedFiles.current = [];
		setIsDocumentTaggingOpen(false);
		setUploadingFiles([]);
		setDocTypeFileMap({});
		setMappedFiles({});
		setAddressProofError('');
		const newCacheDocumentTemp = _.cloneDeep(
			cacheDocumentsTemp.filter(doc => {
				if (!doc?.doc_type_id) return false;
				return !doc?.doc_type_id?.includes(prefix);
			})
		);
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};

	useEffect(() => {
		if (isViewLoan) return;
		let div = ref?.current;
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
			setIsDocTypeChangeModalOpen(true);
		}
	}, [selectedAddressProofId]);

	let taggedDocumentCount = 0;
	let displayTagMessage = 0;

	selectedFiles.current.map(file => {
		for (const key in docTypeFileMap) {
			if (file.id === key) {
				taggedDocumentCount += 1;
			}
		}
		return null;
	});
	displayTagMessage = selectedFiles.current.length !== taggedDocumentCount;
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

	// console.log(`AddressProofUpload-allstates-`, {
	// 	props,
	// 	addressProofErrorColorCode,
	// 	addressProofError,
	// });

	return loading ? (
		<>
			<h1>Loading...</h1>
		</>
	) : (
		<UI.Wrapper>
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
							By changing it, all the existing tagged and untagged document will
							be lost.
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
				{!disabled && !isViewLoan && (
					<UI.Dropzone
						isInActive={isInActive}
						ref={ref}
						dragging={dragging}
						// bg={bg}
						disabled={disabled}
						uploading={fetchingAddress}
					>
						{/* {dragging && !disabled && <UI.Droping>Drop here :)</UI.Droping>} */}
						<UI.Caption>Upload Address Proof</UI.Caption>
						{/* {pan && <LabelFormat>only jpeg, png, jpg</LabelFormat>} */}
						<UI.UploadButton
							type='file'
							id={id}
							onChange={onChange}
							onClick={e => {
								if (isInActive) {
									e.preventDefault();
									e.stopPropagation();
								}
								e.target.value = '';
							}}
							disabled={disabled}
							multiple={section === 'document-upload' ? true : false}
						/>
						<UI.IconWrapper>
							<UI.IconUpload htmlFor={id}>
								<img
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
								isDocumentTaggingOpen={isDocumentTaggingOpen}
								src={imgArrowDownCircle}
								width={30}
								style={{
									maxWidth: 'none',
									filter: isInActive ? 'grayscale(200%)' : 'none',
								}}
								alt='upload'
								onClick={() => setIsDocumentTaggingOpen(!isDocumentTaggingOpen)}
							/>
						</UI.IconWrapper>
					</UI.Dropzone>
				)}
				{field.name.includes(CONST_ADDRESS_DETAILS.PREFIX_PRESENT) ? null : (
					<>
						<UI.OR>or</UI.OR>
						<UI.AadhaarNumberOtpFieldWrapper>
							{register({
								...aadhaarProofOTPField,
								value: prefilledValues(aadhaarProofOTPField),
								visibility: 'visible',
							})}
							<Button
								name='Verify with OTP'
								isLoader={verifyingWithOtp}
								disabled={
									!formState.values[aadhaarProofOTPField.name] ||
									verifyingWithOtp ||
									isEditLoan
								}
								type='submit'
								customStyle={{
									whiteSpace: 'nowrap',
									width: '150px',
									minWidth: '150px',
									height: '45px',
								}}
								onClick={onClickVerifyWithOtp}
							/>
							{(formState?.submit?.isSubmited ||
								formState?.touched?.[aadhaarProofOTPField.name]) &&
								formState?.error?.[aadhaarProofOTPField.name] && (
									<UI_SECTIONS.ErrorMessageSubFields>
										{formState?.error?.[aadhaarProofOTPField.name]}
									</UI_SECTIONS.ErrorMessageSubFields>
								)}
						</UI.AadhaarNumberOtpFieldWrapper>
					</>
				)}
			</UI.DropZoneOtpFieldWrapper>
			<UI.DocumentTaggingSectionWrapper
				isDocumentTaggingOpen={isDocumentTaggingOpen}
				style={addressProofError ? { height: '300px' } : {}}
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
				<UI.FileListWrap>
					{uploadingFiles.map((file, upidx) => {
						// console.log('uplodaing-file-FileListWrap-file', {
						// 	uploadingFiles,
						// 	file,
						// 	docTypeFileMap,
						// });
						let isMapped = false;
						for (const key in docTypeFileMap) {
							if (file.id === key) {
								isMapped = true;
								break;
							}
						}
						if (isMapped) return null;
						// const isFileUploaded = file.progress >= 100 || file.progress <= 0;
						file.name = file.name || file.upload_doc_name || '';
						return (
							<UI.File
								addressProofErrorColorCode={addressProofErrorColorCode}
								key={`${file.id}-${upidx}-${file.doc_type_id}`}
								progress={file.progress}
								status={file.status}
								tooltip={file.name}
								// style={
								// 	docTypeOptions.length > 0 && isFileUploaded
								// 		? { borderRight: 0 }
								// 		: {}
								// }
							>
								<UI.FileName>
									{file?.name?.length > 20
										? file?.name?.slice(0, 20) + '...'
										: file?.name}
								</UI.FileName>
								{!fetchingAddress ? (
									<UI.ImgClose
										src={imgClose}
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											onFileRemove(file);
										}}
										alt='close'
									/>
								) : null}
								{docTypeOptions?.length > 0 && !fetchingAddress && (
									<Popover
										isOpen={isPopoverOpen === file.id}
										align='start'
										positions={['left', 'bottom', 'top', 'right']} // preferred positions by priority
										padding={-50} // adjust padding here!
										reposition={false} // prevents automatic readjustment of content position that keeps your popover content within its parent's bounds
										onClickOutside={() => setIsPopoverOpen(-1)} // handle click events outside of the popover/target here!
										ref={refPopup}
										content={popupProps => {
											// const {
											// 	position,
											// 	nudgedLeft,
											// 	nudgedTop,
											// 	childRect,
											// 	popoverRect,
											// } = popupProps;
											// you can also provide a render function that injects some useful stuff!
											// console.log('popupProps-', { popupProps });
											// const isOutside = nudgedLeft < -10;
											let isFrontTagged = false;
											let isBackTagged = false;
											let isFrontBackTagged = false;
											if (section === 'addressproof') {
												const fontDocTypeId = `${docTypeOptions[0]?.id}`;
												const backDocTypeId = `${docTypeOptions[1]?.id}`;
												const frontBackDocTypeId = `${docTypeOptions[2]?.id}`;
												isFrontTagged =
													fontDocTypeId in mappedFiles &&
													mappedFiles[fontDocTypeId]?.length > 0;
												isBackTagged =
													backDocTypeId in mappedFiles &&
													mappedFiles[backDocTypeId]?.length > 0;
												isFrontBackTagged =
													frontBackDocTypeId in mappedFiles &&
													mappedFiles[frontBackDocTypeId]?.length > 0;
											}
											return (
												<UI.FileTypeBox
												// style={isOutside ? { marginLeft: '-400px' } : {}}
												>
													<UI.FileTypeUL>
														{docTypeOptions.map((docType, docoptidx) => {
															// console.log('poup-', {
															// 	docTypeOptions,
															// 	mappedFiles,
															// 	docs,
															// 	docType,
															// 	file,
															// 	isFrontTagged,
															// 	isBackTagged,
															// 	isFrontBackTagged,
															// });
															if (section === 'addressproof') {
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
															}
															return (
																<UI.FileTypeList
																	key={`${docType.value}-${docoptidx}-${
																		docType.doc_type_id
																	}`}
																	value={docType.name}
																	onClick={() => {
																		onDocTypeChange(file, docType);
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
														src={imgArrowDownCircle}
														alt='arrow'
														onClick={() => {
															setIsPopoverOpen(
																isPopoverOpen === file.id ? -1 : file.id
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
													isPopoverOpen === file.id ? -1 : file.id
												)
											}
										>
											<UI.FileTypeIconOutsidePopover
												src={imgArrowDownCircle}
												alt='arrow'
											/>
										</UI.FileType>
									</Popover>
								)}
							</UI.File>
						);
					})}
				</UI.FileListWrap>
				<UI.DocumentUploadListWrapper>
					{docTypeOptions.map((docType, doctypeidx) => {
						// const mappedDocFiles = mappedFiles[docType.value] || [];
						const mappedDocFiles = startingTaggedDocs.filter(
							d => d?.doc_type_id === docType?.doc_type_id
						);

						// // const mappedFiles = [];
						// console.log('upload-list-', {
						// 	startingTaggedDocs,
						// 	uploadingFiles,
						// 	mappedFiles,
						// 	docTypeOptions,
						// 	docTypeFileMap,
						// 	docType,
						// 	mappedDocFiles,
						// });
						// for (const key in docTypeFileMap) {
						// 	if (docType.value === docTypeFileMap[key].value) {
						// 		const newMappedFile = {
						// 			..._.cloneDeep(docTypeFileMap[key]),
						// 			docTypeKey: key,
						// 		};
						// 		// console.log('new-mapped-file-', newMappedFile);
						// 		mappedFiles.push(newMappedFile);
						// 	}
						// }
						return (
							<UI.DocumentUploadList
								key={`${docType.id}-${doctypeidx}-${docType.doc_type_id}`}
							>
								<UI.DocumentUploadListRow1>
									<UI.DocumentUploadCheck
										src={mappedDocFiles.length ? imgGreenCheck : imgGreyCheck}
										alt='check'
									/>
									<UI.DocumentUploadName isSelected={mappedDocFiles.length}>
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
										{/* {docType.name && docType.isMandatory
											? docType.name + '*'
										: docType.name} */}
										{/* {isDocTypeMandatory(docType.name)} */}
									</UI.DocumentUploadName>
								</UI.DocumentUploadListRow1>
								<UI.DocumentUploadListRow2>
									{mappedDocFiles.map((doc, index) => {
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
											isViewDocAllowed = false;
										}
										if (isEditLoan && doc?.is_delete_not_allowed === 'true') {
											isDocRemoveAllowed = false;
										}
										return (
											<UI.File
												addressProofErrorColorCode={addressProofErrorColorCode}
												key={`file-${uniqPassId}-${doc.doc_type_id}`}
												style={{
													width: '220px',
													margin: '0 0 0 45px',
													height: '35px',
													lineHeight: '35px',
													background: isViewMore ? '#e6ffef' : '',
													cursor: isViewDocAllowed ? 'pointer' : 'not-allowed',
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
															isViewDocAllowed && openDocument(doc);
														}
													}}
												>
													{isViewMore
														? `View ${mappedDocFiles.length - 2} more`
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
													!isViewLoan && (
														<UI.ImgClose
															style={{ height: '20px' }}
															src={isViewMore ? imgArrowDownCircle : imgClose}
															onClick={e => {
																e.preventDefault();
																e.stopPropagation();
																// console.log('before-remove-', {
																// 	passwordList,
																// 	docTypeFileMap,
																// 	doc,
																// });
																if (isViewMore) return;
																const newPasswordList = passwordList.filter(
																	p => p !== uniqPassId
																);
																const newDocTypeFileMap = _.cloneDeep(
																	docTypeFileMap
																);
																delete newDocTypeFileMap[doc.docTypeKey];
																delete newDocTypeFileMap[doc.id];
																// console.log('after-remove-', {
																// 	newPasswordList,
																// 	newDocTypeFileMap,
																// 	doc,
																// });
																onFileRemove(doc, docType);
																setDocTypeFileMap(newDocTypeFileMap);
																setPasswordList(newPasswordList);
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
					<Button
						fill
						name='Fetch Address'
						isLoader={fetchingAddress}
						disabled={fetchingAddress || docs.length <= 0 || addressProofError}
						onClick={onClickFetchAddress}
					/>
				</UI.CTAWrapper>
			</UI.DocumentTaggingSectionWrapper>
		</UI.Wrapper>
	);
};

export default AddressProofUpload;
