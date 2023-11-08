/* FIle upload details section. This section handles drag, drop
of file, upload and deletion */

import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Popover } from 'react-tiny-popover';

import CircularLoading from 'components/Loaders/Circular';

import useFetch from 'hooks/useFetch';
import generateUID from 'utils/uid';
import FilePasswordInput from './FilePasswordInput';
import uploadCircleIcon from 'assets/icons/upload-icon-with-circle.png';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import imgArrowDownCircle from 'assets/icons/drop_down_green-05.svg';
import imgGreyCheck from 'assets/icons/grey_tick_icon.png';
import imgGreenCheck from 'assets/icons/green_tick_icon.png';
import lockGrey from 'assets/icons/Lock_icon_grey-05-05.svg';
import lockGreen from 'assets/icons/Lock_icon_green-05.svg';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import {
	removeCacheDocument,
	updateCacheDocumentTypeId,
	updateCacheDocumentPassword,
	updateCacheDocumentProgress,
	updateCacheDocumentsFdKey,
	addOrUpdateCacheDocuments,
} from 'store/applicationSlice';

import * as CONST_SECTION from 'components/Sections/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';
import { maxUploadSize, validateFileUpload } from 'utils/helperFunctions';
import { useToasts } from 'components/Toast/ToastProvider';
import TooltipImage from 'components/Global/Tooltip';
import infoIcon from 'assets/icons/info-icon.png';

let refCounter = 0;

const CategoryFileUpload = props => {
	const {
		disabled = false,
		documentTypes = [],
		documents,
		category,
		directorId,
	} = props;
	const { app, application } = useSelector(state => state);
	const { isViewLoan, isLocalhost, selectedProduct } = app;
	const { businessId, businessUserId, loanId, userId } = application;
	const ref = useRef(uuidv4());
	const refPopup = useRef(null);
	const { newRequest } = useFetch();
	const dispatch = useDispatch();
	const { addToast } = useToasts();

	const id = uuidv4();

	// const [loading, setLoading] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [passwordForFileId, setPasswordForFileId] = useState(null);
	const [isPopoverOpen, setIsPopoverOpen] = useState(-1);
	const [viewMore, setViewMore] = useState([]);
	const [passwordList, setPasswordList] = useState([]);
	const [docTypeNameToolTip, setDocTypeNameToolTip] = useState(-1);
	const [openingRemovingDocument, setOpeningRemovingDocument] = useState(false);
	const [unUploadedFile, setUnUploadedFile] = useState([]);

	const isFileFromDeviceStorageAllowed =
		selectedProduct?.product_details?.is_file_from_storage_allowed;

	let isCameraCapture = '';
	if (
		isFileFromDeviceStorageAllowed !== undefined &&
		!isFileFromDeviceStorageAllowed
	) {
		isCameraCapture = 'camera';
	}

	const openDocument = async file => {
		try {
			setOpeningRemovingDocument(file?.document_key || file?.doc_type_id);
			// console.log('open-doc-', { file, loanId, businessUserId });
			const reqBody = {
				filename: file?.doc_name || file?.document_key || file?.fd || '',
			};
			reqBody.loan_id = loanId;
			reqBody.userid = businessUserId;
			// console.log('openDocument-reqBody-', { reqBody, file });
			const docRes = await axios.post(API.VIEW_DOCUMENT, reqBody);
			// console.log('openDocument-res-', docRes);
			window.open(decryptViewDocumentUrl(docRes?.data?.signedurl), '_blank');
		} catch (error) {
			console.error('Unable to open file, try after sometime', error);
		} finally {
			setOpeningRemovingDocument(false);
		}
	};

	const deleteDocument = async file => {
		try {
			if (!file?.document_id)
				return dispatch(removeCacheDocument({ fileId: file.id }));
			setOpeningRemovingDocument(file.document_key || file.doc_type_id);
			const reqBody = {
				loan_doc_id: file?.document_id || '',
				business_id: businessId,
				loan_id: loanId,
				userid: userId,
			};
			// console.log('reqBody-', reqBody);
			// return;
			await axios.post(API.DELETE_DOCUMENT, reqBody);
			dispatch(removeCacheDocument({ fileId: file.id }));
			// TODO: only if user navigate back and deletes
		} catch (error) {
			console.error('error-deleteDocument-', error);
		} finally {
			setOpeningRemovingDocument(false);
		}
	};

	const onProgress = (event, file) => {
		documents?.map(uFile => {
			if (uFile.id === file.id) {
				const progress = ((event.loaded / event.total) * 100).toFixed();
				dispatch(updateCacheDocumentProgress({ fileId: file.id, progress }));
				return null;
				// status:
				//     Number(percentageCompleted) === 100 ? "completed" : "progress",
			}
			return null;
		});
	};

	// FUTURE
	// const onCancel = (file, status) => {
	// 	const newUploadingFiles = [];
	// 	uploadingFiles.map(uFile => {
	// 		if (uFile.id === file.id) {
	// 			return {
	// 				..._.cloneDeep(uFile),
	// 				status,
	// 			};
	// 		}
	// 		newUploadingFiles.push(uFile);
	// 		return null;
	// 	});
	// 	setUploadingFiles(newUploadingFiles);
	// };

	const handleUpload = async files => {
		const filesToUpload = [];
		for (let i = 0; i < files.length; i++) {
			const source = axios.CancelToken.source();

			const id = generateUID();
			const newFile = {
				id,
				name: files[i]?.name,
				file: files[i],
				progress: 0,
				status: 'progress',
				category,
				directorId,
				cancelToken: source,
				preview: URL.createObjectURL(files[i]),
			};
			filesToUpload.push(newFile);
		}
		// TODO: varun remove file and cancel token object before storing to redux do this for entier project
		dispatch(addOrUpdateCacheDocuments({ files: filesToUpload }));
		setUploading(true);
		return await Promise.all(
			filesToUpload.map(file => {
				const formData = new FormData();
				formData.append('document', file.file);

				return newRequest(
					API.DOCS_UPLOAD_URL({
						userId: businessUserId,
					}),
					{
						method: 'POST',
						data: formData,
						onUploadProgress: event => onProgress(event, file, documents),
						cancelToken: file.cancelToken.token,
						// timeout: CONST_SECTIONS.timeoutForDocumentUpload,
					}
				)
					.then(res => {
						if (res.data.status === API.NC_STATUS_CODE.OK) {
							const resFile = res.data.files[0];
							const uploadfile = {
								...file,
								id: file?.id,
								upload_doc_name: resFile?.filename,
								name: resFile?.filename,
								document_key: resFile.fd,
								size: resFile.size,
								category,
								directorId,
								file: null,
							};
							return uploadfile;
						}
						// return res.data.files[0];
						return { ...file, status: 'error' };
					})
					.catch(err => {
						console.error(err);
						// TODO: aditi we need to hanle this scenario
						// for some reason document upload failed then we need to
						// remove these documents from redux cache memory so that
						// we do not push them in to database
						if (err.message === CONST.USER_CANCELED) {
							// onCancel(file, 'cancelled');
						} else {
							// onCancel(file, 'error');
						}
						return { ...file, status: 'error', error: err };
					});
			})
		).then(postUploadFiles => {
			// console.log('postUploadFiles-', {
			// 	postUploadFiles,
			// });
			dispatch(updateCacheDocumentsFdKey({ files: postUploadFiles }));
			setUploading(false);
			// return [filesToUpload[0]];

			// const newUploadCompletedFiles = [];
			// // const newUploadingFiles = _.cloneDeep(uploadingFiles);
			// documents.map(file => {
			// 	newUploadCompletedFiles.push({
			// 		...file,
			// 		status: 'completed',
			// 		document_key:
			// 			postUploadFiles?.filter(f => f.id === file.id)?.[0]?.document_key ||
			// 			'',
			// 	});
			// 	return null;
			// });
			// console.log('file-upload-promise-resolved-', newUploadCompletedFiles);
			// setUploadingFiles(newUploadCompletedFiles);
			return postUploadFiles.filter(file => file.status !== 'error');
		});
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
		setUnUploadedFile([]);
		if (disabled) return false;
		let files = [...event.dataTransfer.files];
		const validatedResp = validateFileUpload(files);
		const finalFilesToUpload = validatedResp
			?.filter(item => item.status !== 'fail')
			.map(fileItem => fileItem.file);

		const erroredFiles = validatedResp?.filter(item => item.status === 'fail');
		setUnUploadedFile(erroredFiles);
		// FUTURE
		// if (accept) {
		// 	files = files.filter(file => accept.includes(file.type.split('/')[1]));
		// }

		if (finalFilesToUpload && finalFilesToUpload.length > 0) {
			// console.log('before-handleUpload-', {
			// 	files,
			// });
			// files =
			await handleUpload(finalFilesToUpload);
			// console.log('after-handleUpload-', {
			// 	files,
			// });
			// console.log('before current-files-', {
			// 	current: selectedFiles.current,
			// 	files,
			// });
			event.dataTransfer.clearData();
			refCounter = 0;
		}
		if (erroredFiles && erroredFiles.length > 0) {
			// setErrorFormStateField(field.name, validatedResp[0].error);
			addToast({
				message: erroredFiles.length + ' ' + erroredFiles[0].error,
				type: 'error',
			});
		}
	};

	const onChange = async event => {
		let files = [...event.target.files];
		// console.log('onChange-beforeupload-', files);
		// files =
		setUnUploadedFile([]);
		const validatedResp = validateFileUpload(files);
		const finalFilesToUpload = validatedResp
			?.filter(item => item.status !== 'fail')
			.map(fileItem => fileItem.file);

		const erroredFiles = validatedResp?.filter(item => item.status === 'fail');
		setUnUploadedFile(erroredFiles);

		if (finalFilesToUpload && finalFilesToUpload.length > 0) {
			await handleUpload(finalFilesToUpload);
		}
		if (erroredFiles && erroredFiles.length > 0) {
			// setErrorFormStateField(field.name, validatedResp[0].error);
			addToast({
				message: erroredFiles.length + ' ' + erroredFiles[0].error,
				type: 'error',
			});
		}
		// console.log('onChange-after-', files);
	};

	const onPasswordClick = fileId => {
		setPasswordForFileId(fileId);
	};

	const onClosePasswordEnterArea = () => {
		setPasswordForFileId(null);
	};

	const onDocTypePassword = (fileId, value, uniqPassId, docType) => {
		dispatch(
			updateCacheDocumentPassword({
				fileId,
				password: value,
			})
		);
		passwordList.push(uniqPassId);
		onClosePasswordEnterArea();
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
	}, [disabled, category]);

	useEffect(() => {
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => {
			documents?.map(doc => {
				if (doc?.preview) URL.revokeObjectURL(doc.preview);
				return null;
			});
		};
		// eslint-disable-next-line
	}, []);

	let taggedDocumentCount = 0;
	let displayTagMessage = 0;

	documents?.map(doc => {
		if (!!doc?.doc_type_id) {
			taggedDocumentCount += 1;
		}
		return null;
	});
	displayTagMessage = documents?.length !== taggedDocumentCount;

	// console.log(unUploadedFile, 'unup');

	// console.log(`FileUpload-${category}-allstates-`, {
	// 	props,
	// });

	return (
		<>
			{!disabled && !isViewLoan && (
				<UI.Dropzone
					isInActive={isViewLoan}
					ref={ref}
					dragging={dragging}
					// bg={bg}
					disabled={disabled}
					uploading={uploading}
				>
					{dragging && !disabled && <UI.Droping>Drop here :)</UI.Droping>}
					<UI.Caption>
						{`Drag and drop or`}{' '}
						{/* {accept && <UI.AcceptFilesTypes>{accept}</UI.AcceptFilesTypes>} */}
					</UI.Caption>
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
						onChange={onChange}
						accept=''
						capture={isCameraCapture}
						onClick={e => {
							e.target.value = '';
						}}
						// accept={accept}
						disabled={disabled}
						multiple={true}
					/>
					<UI.Label htmlFor={id}>Browse</UI.Label>
					{/* {pan && <LabelFormat>only jpeg, png, jpg</LabelFormat>} */}
					<UI.UploadCircle
						htmlFor={id}
						style={{ marginLeft: 'auto', padding: 10 }}
					>
						<img
							src={uploadCircleIcon}
							width={40}
							style={{
								maxWidth: 'none',
								filter: isViewLoan ? 'grayscale(200%)' : 'none',
							}}
							alt='upload'
						/>
					</UI.UploadCircle>
				</UI.Dropzone>
			)}

			{unUploadedFile && unUploadedFile.length > 0 && (
				<div className='mt-4'>
					<p className='font-bold'>
						{unUploadedFile.length} Files could not be uploaded.
					</p>
					<ol className='list-disc list-inside mt-2 space-y-2'>
						{unUploadedFile.map(item => (
							<li>
								{item.file.name} -{' '}
								<span className='text-red-400 '>
									Size: {(item.file.size / 1024 / 1024).toFixed(2)}MB
								</span>
							</li>
						))}
					</ol>
				</div>
			)}
			{displayTagMessage ? (
				<UI.WarningMessage>
					{' '}
					Click on <UI.FileTypeSmallIcon src={imgArrowDownCircle} alt='arrow' />
					and tag your uploaded documents to their respective document tags
				</UI.WarningMessage>
			) : null}
			<UI.UnTaggedFileListWrap>
				{documents?.map((file, upidx) => {
					// console.log('uplodaing-file-UnTaggedFileListWrap-file', {
					// 	uploadingFiles,
					// 	file,
					// 	docTypeFileMap,
					// });
					const isMapped = !!file?.doc_type_id;
					if (isMapped) return null;
					// const isFileUploaded = file.progress >= 100 || file.progress <= 0;
					// TODO: fix above logic
					const isFileUploaded = true;
					const fileName = file?.name || file?.upload_doc_name || '';
					return (
						<UI.File
							key={`${file.id}-${upidx}-${file.doc_type_id}`}
							progress={file.progress}
							status={file.status}
							tooltip={fileName}
							// style={
							// 	docTypeOptions.length > 0 && isFileUploaded
							// 		? { borderRight: 0 }
							// 		: {}
							// }
						>
							<UI.FileName>
								{fileName.length > 20
									? fileName.slice(0, 20) + '...'
									: fileName}
							</UI.FileName>
							{isFileUploaded && !uploading ? (
								<UI.ImgClose
									style={{ marginRight: 60 }}
									src={imgClose}
									onClick={e => {
										e.preventDefault();
										e.stopPropagation();
										deleteDocument(file);
									}}
									alt='close'
								/>
							) : null}
							{documentTypes?.length > 0 && isFileUploaded && !uploading && (
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
										return (
											<UI.FileTypeBox
											// style={isOutside ? { marginLeft: '-400px' } : {}}
											>
												<UI.FileTypeUL>
													{documentTypes.map((docType, docoptidx) => {
														// console.log('poup-', {
														// 	docTypeOptions,
														// 	docs,
														// 	docType,
														// 	file,
														// });
														return (
															<UI.FileTypeList
																key={`${docType.value}-${docoptidx}-${
																	docType.doc_type_id
																}`}
																value={docType.name}
																onClick={() => {
																	dispatch(
																		updateCacheDocumentTypeId({
																			fileId: file.id,
																			docType,
																		})
																	);
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
											setIsPopoverOpen(isPopoverOpen === file.id ? -1 : file.id)
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
			</UI.UnTaggedFileListWrap>
			<UI.DocumentUploadListWrapper>
				{documentTypes.map((docType, doctypeidx) => {
					const mappedDocFiles = documents?.filter(
						doc => doc?.doc_type_id === docType?.doc_type_id
					);
					// console.log('categoryfileupload-mappedDocFiles-', { mappedDocFiles });
					return (
						<UI.DocumentUploadList
							key={`${docType.id}-${doctypeidx}-${docType.doc_type_id}`}
						>
							<UI.DocumentUploadListRow1>
								<UI.DocumentUploadCheck
									src={mappedDocFiles?.length ? imgGreenCheck : imgGreyCheck}
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
									{isLocalhost && (
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
									// let isViewDocAllowed = true;
									if ('isDocRemoveAllowed' in doc) {
										isDocRemoveAllowed = doc?.isDocRemoveAllowed || false;
										// isViewDocAllowed = false;
									}
									if (doc?.is_delete_not_allowed === 'true') {
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
												cursor: 'pointer',
												// cursor: isViewDocAllowed ? 'pointer' : 'not-allowed',
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
														if (!doc?.document_id && doc?.preview) {
															window.open(doc?.preview, '_blank');
															return;
														}
														openDocument(doc);
													}
												}}
											>
												{isViewMore
													? `View ${mappedDocFiles.length - 2} more`
													: doc?.name?.length > 20
													? doc?.name?.slice(0, 20) + '...'
													: doc?.name}
											</UI.FileName>
											{isViewMore
												? null
												: category === CONST_SECTION.DOC_CATEGORY_FINANCIAL && (
														<UI.PasswordWrapper>
															{isViewLoan && !doc?.document_password ? null : (
																<UI.RoundButton
																	showTooltip={passwordForFileId !== uniqPassId}
																	isViewLoan={isViewLoan}
																	password={doc?.document_password}
																	onClick={() => onPasswordClick(uniqPassId)}
																>
																	<UI.ImgClose
																		style={{ height: 20 }}
																		src={
																			passwordList.includes(uniqPassId) ||
																			isViewLoan
																				? lockGreen
																				: lockGrey
																		}
																		alt='lock'
																	/>
																	{/* <FontAwesomeIcon icon={faUserLock} size='1x' /> */}
																</UI.RoundButton>
															)}
															{passwordForFileId === uniqPassId && (
																<FilePasswordInput
																	fileId={doc.id}
																	uniqPassId={uniqPassId}
																	docType={docType}
																	onClickCallback={onDocTypePassword}
																	onClose={onClosePasswordEnterArea}
																/>
															)}
														</UI.PasswordWrapper>
												  )}
											{openingRemovingDocument === doc?.document_key ||
											openingRemovingDocument === doc?.doc_type_id ? (
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
															deleteDocument(doc);
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
		</>
	);
};

export default CategoryFileUpload;
