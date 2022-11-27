/* FIle upload details section. This section handles drag, drop
of file, upload and deletion */

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Popover } from 'react-tiny-popover';
import { useToasts } from 'components/Toast/ToastProvider';
import generateUID from 'utils/uid';
import { VIEW_DOCUMENT } from '_config/app.config';
import uploadCircleIcon from 'assets/icons/upload_icon_blue.png';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import imgArrowDownCircle from 'assets/icons/drop_down_green-05.svg';
import imgGreyCheck from 'assets/icons/grey_tick_icon.png';
import imgGreenCheck from 'assets/icons/green_tick_icon.png';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import CircularLoading from 'components/Loaders/Circular';
import Button from 'components/Button';

import _ from 'lodash';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';

const AddressProofUpload = props => {
	const {
		formState,
		onDrop = () => {},
		disabled = false,
		onRemoveFile = id => {
			console.info('REMOVED FILE ' + id);
		},
		docTypeOptions = [],
		documentTypeChangeCallback = (id, value) => {
			console.info('DOCUMENT TYPE CHANGED ' + id);
		},
		docs,
		setDocs,
		section = '',
		sectionType = 'others',
		startingTaggedDocs = [],
		startingUnTaggedDocs = [],
		isInActive = false,
		removeAllFileUploads = '',
		prefilledDocs = [],
		addressProofUploadSection,
		// selectedApplicant,
		onClickFetchAddress,
		fetchingAddress,
		// onChangeFormStateField,
		register,
		prefilledValues,
		setAddressProofError,
		onClickVerifyWithOtp,
		verifyingWithOtp,
	} = props;
	let { addressProofError } = props;
	// console.log('fileupload-props', { disabled, pan, docs, setDocs });
	const ref = useRef(uuidv4());
	const refPopup = useRef(null);
	const { addToast } = useToasts();

	const id = uuidv4();

	const [loading, setLoading] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [uploadingFiles, setUploadingFiles] = useState([]);
	const [docTypeFileMap, setDocTypeFileMap] = useState({});
	const [isPopoverOpen, setIsPopoverOpen] = useState(-1);
	const [viewMore, setViewMore] = useState([]);
	const [passwordList, setPasswordList] = useState([]);
	const [mappedFiles, setMappedFiles] = useState({});
	const [isDocumentTaggingOpen, setIsDocumentTaggingOpen] = useState(false);
	const selectedFiles = useRef([]);
	//const [docSelected, setDocSelected] = useState('');
	const [openingRemovingDocument, setOpeningRemovingDocument] = useState(false);

	let refCounter = 0;

	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	const isEditLoan = !editLoanData ? false : editLoanData?.isEditLoan;

	const aadhaarProofOTPField = addressProofUploadSection?.fields?.[2] || {};

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
			onRemoveFile(file.id, file);
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
				sectionType,
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
		documentTypeChangeCallback(file.id, selectedDocType);
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
	}, [sectionType]);

	useEffect(() => {
		// console.log('useEffect-removeAllFileUploads-', removeAllFileUploads);
		if (!removeAllFileUploads) return;
		selectedFiles.current = [];
		setUploadingFiles([]);
		setDocTypeFileMap({});
		setMappedFiles({});
	}, [removeAllFileUploads, sectionType]);

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
	}, [disabled, sectionType]);

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
							{docs.length > 0 && (
								<UI.IconCollapse
									isDocumentTaggingOpen={isDocumentTaggingOpen}
									src={imgArrowDownCircle}
									width={30}
									style={{
										maxWidth: 'none',
										filter: isInActive ? 'grayscale(200%)' : 'none',
									}}
									alt='upload'
									onClick={() =>
										setIsDocumentTaggingOpen(!isDocumentTaggingOpen)
									}
								/>
							)}
						</UI.IconWrapper>
					</UI.Dropzone>
				)}
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
			</UI.DropZoneOtpFieldWrapper>
			<UI.DocumentTaggingSectionWrapper
				isDocumentTaggingOpen={isDocumentTaggingOpen}
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
						disabled={fetchingAddress || docs.length <= 0}
						onClick={onClickFetchAddress}
					/>
				</UI.CTAWrapper>
			</UI.DocumentTaggingSectionWrapper>
		</UI.Wrapper>
	);
};

export default AddressProofUpload;
