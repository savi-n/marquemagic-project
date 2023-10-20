//is_in_section_delete_not_allowed can be sent from json-configuration(field) and can be set if the document is allowed to delete or not
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import LoadingIcon from 'components/Loading/LoadingIcon';

import { useToasts } from 'components/Toast/ToastProvider';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import { removeCacheDocument } from 'store/applicationSlice';
import iconUploadBlue from 'assets/icons/upload_icon_blue.png';
import iconDelete from 'assets/icons/close_icon_grey-06.svg';
import * as API from '_config/app.config';
import * as UI from './ui';
import { maxUploadSize, validateFileUpload } from 'utils/helperFunctions';
import TooltipImage from '../Global/Tooltip';
import infoIcon from 'assets/icons/info-icon.png';
import * as CONST_SECTIONS from 'components/Sections/const';

const InputFieldSingleFileUpload = props => {
	const {
		field,
		selectedDocTypeId,
		clearErrorFormState,
		uploadedFile,
		addCacheDocumentTemp,
		removeCacheDocumentTemp,
		errorColorCode,
		isFormSubmited,
		category,
	} = props;
	const { app, application } = useSelector(state => state);
	// const { directors, selectedDirectorId } = useSelector(
	// 	state => state.directors
	// );
	// const selectedDirector = directors?.[selectedDirectorId] || {};
	const { isViewLoan } = app;
	const { loanId, businessUserId, businessId, userId } = application;
	const [loading, setLoading] = useState(false);
	const { addToast } = useToasts();
	const dispatch = useDispatch();
	const isMandatory = !!field?.rules?.required;

	const openDocument = async file => {
		try {
			setLoading(true);
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
			setLoading(false);
		}
	};

	const deleteDocument = async file => {
		try {
			if (!file?.document_id) return removeCacheDocumentTemp(field.name);
			setLoading(true);
			const reqBody = {
				loan_doc_id: file?.document_id || '',
				business_id: businessId,
				loan_id: loanId,
				userid: userId,
			};
			// console.log('reqBody-', reqBody);
			// return;
			await axios.post(API.DELETE_DOCUMENT, reqBody);
			removeCacheDocumentTemp(field.name);
			dispatch(removeCacheDocument(file));
		} catch (error) {
			console.error('error-deleteDocument-', error);
		} finally {
			setLoading(false);
		}
	};

	const handleFileUpload = async file => {
		const validatedResp = validateFileUpload(file);
		const finalFilesToUpload = validatedResp
			?.filter(item => item.status !== 'fail')
			.map(fileItem => fileItem.file);

		const erroredFiles = validatedResp?.filter(item => item.status === 'fail');

		if (finalFilesToUpload && finalFilesToUpload.length > 0) {
			const previewFileData = {
				field,
				name: finalFilesToUpload[0].name,
				preview: URL.createObjectURL(finalFilesToUpload[0]),
			};
			let newFileData = {};
			try {
				setLoading(true);
				// const source = axios.CancelToken.source();
				const filesToUpload = {
					id: selectedDocTypeId,
					name: finalFilesToUpload[0].name,
					file: finalFilesToUpload[0],
					progress: 0,
					status: 'progress',
					// cancelToken: source,
				};
				const formData = new FormData();
				formData.append('document', filesToUpload.file);
				const fileUploadRes = await axios.post(
					`${API.API_END_POINT}/loanDocumentUpload?userId=${businessUserId}`,
					formData
					// {
					// 	timeout: CONST_SECTIONS.timeoutForDocumentUpload,
					// }
				);
				if (fileUploadRes.data.status !== API.NC_STATUS_CODE.OK) {
					return { ...finalFilesToUpload[0], status: 'error' };
				}
				const resFile = fileUploadRes.data.files[0];
				newFileData = {
					document_id: finalFilesToUpload[0].id,
					upload_doc_name: resFile.filename,
					document_key: resFile.fd,
					size: resFile.size,
					loan_id: loanId,
					doc_type_id: selectedDocTypeId,
					category,
					// directorId: selectedDirector?.directorId,
				};
			} catch (error) {
				console.error('error-inputfieldsinglefileupload-', error);
				addToast({
					message: error.message,
					type: 'error',
				});
			} finally {
				addCacheDocumentTemp({ ...previewFileData, ...newFileData });
				setLoading(false);
			}
		}
		if (erroredFiles && erroredFiles.length > 0) {
			// setErrorFormStateField(field.name, validatedResp[0].error);
			addToast({
				message: erroredFiles.length + ' ' + erroredFiles[0].error,
				type: 'error',
			});
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'*': [],
		},
		onDrop: async acceptedFiles => {
			try {
				setLoading(true);
				await handleFileUpload(acceptedFiles);
			} catch (error) {
				console.error('error-ProfileFileUpload-onDrop-', error);
			} finally {
				setLoading(false);
			}
		},
	});

	useEffect(() => {
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () =>
			uploadedFile?.preview && URL.revokeObjectURL(uploadedFile.preview);
		// eslint-disable-next-line
	}, []);

	// Disable click and keydown behavior on the <Dropzone>

	const isPreview = !!uploadedFile;

	// console.log('InputFieldSingleFileUpload-', {
	// 	props,
	// 	businessUserId,
	// 	isPreview,
	// 	uploadedFile,
	// 	cacheDocuments,
	// });

	return (
		<>
			{isPreview ? (
				<UI.FieldWrapper>
					<UI.PreviewUploadIconWrapper>
						<UI.IconUpload src={iconUploadBlue} alt='camera' />
					</UI.PreviewUploadIconWrapper>
					<UI.ContainerPreview errorColorCode={errorColorCode}>
						<UI.UploadedFileName
							// link={'https://www.google.com'}
							onClick={e => {
								e.preventDefault();
								e.stopPropagation();
								if (!uploadedFile?.document_id && uploadedFile?.preview) {
									window.open(uploadedFile?.preview, '_blank');
									return;
								}
								openDocument(uploadedFile);
								// window.open('https://www.google.com', '_blank');
							}}
						>
							{uploadedFile?.name}
						</UI.UploadedFileName>
						{loading ? (
							<UI.UploadIconWrapper>
								<LoadingIcon />
							</UI.UploadIconWrapper>
						) : (
							<UI.UploadIconWrapper
								{...getRootProps({ className: 'dropzone' })}
							>
								{/*  is_in_section_delete_not_allowed can be sent from json-configuration(field) and can be set if the document is allowed to delete or not*/}
								{!isViewLoan &&
									field?.is_in_section_delete_not_allowed !== true && (
										<UI.IconDelete
											src={iconDelete}
											alt='delete'
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
												deleteDocument(uploadedFile);
												clearErrorFormState();
											}}
										/>
									)}
							</UI.UploadIconWrapper>
						)}
					</UI.ContainerPreview>
				</UI.FieldWrapper>
			) : (
				<UI.Container
					loading={loading}
					isDisabled={isViewLoan}
					errorColorCode={errorColorCode}
					isError={isMandatory && isFormSubmited && !isPreview}
				>
					<label>
						{field?.label
							? loading
								? 'Uploading...'
								: field?.label
							: `Upload${loading ? 'ing...' : null} File`}
					</label>
					{!loading && maxUploadSize && (
						<TooltipImage
							src={infoIcon}
							alt='Info'
							title={`Maximum upload size for every image is ${maxUploadSize}MB`}
						/>
					)}
					{loading ? (
						<UI.UploadIconWrapper>
							<LoadingIcon />
						</UI.UploadIconWrapper>
					) : (
						<UI.UploadIconWrapper {...getRootProps({ className: 'dropzone' })}>
							<input {...getInputProps()} />

							<UI.IconUpload src={iconUploadBlue} alt='camera' />
						</UI.UploadIconWrapper>
					)}
				</UI.Container>
			)}
		</>
	);
};

export default InputFieldSingleFileUpload;
