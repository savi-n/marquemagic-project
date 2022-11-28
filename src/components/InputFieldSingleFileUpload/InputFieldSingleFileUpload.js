import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import LoadingIcon from 'components/Loading/LoadingIcon';
import CircularLoading from 'components/Loaders/Circular';

import { useToasts } from 'components/Toast/ToastProvider';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import iconUploadBlue from 'assets/icons/upload_icon_blue.png';
import iconDelete from 'assets/icons/close_icon_grey-06.svg';
import * as API from '_config/app.config';
import * as UI from './ui';

const InputFieldSingleFileUpload = props => {
	const {
		field,
		selectedDocTypeId,
		clearErrorFormState,
		cacheDocumentsTemp,
		addCacheDocumentTemp,
		removeCacheDocumentTemp,
		errorColorCode,
		isFormSubmited,
	} = props;
	const { application } = useSelector(state => state);
	const { loanId, businessUserId, cacheDocuments } = application;
	const [loading, setLoading] = useState(false);
	const [loadingFile, setLoadingFile] = useState(false);
	const { addToast } = useToasts();
	const selectedFile =
		cacheDocumentsTemp?.filter(doc => doc?.field?.name === field.name)?.[0] ||
		cacheDocuments?.filter(doc => doc?.field?.name === field.name)?.[0] ||
		null;
	const isMandatory = !!field?.rules?.required;

	const openDocument = async file => {
		try {
			setLoadingFile(true);
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
			setLoadingFile(false);
		}
	};

	const handleFileUpload = async file => {
		const previewFileData = {
			field,
			name: file.name,
			preview: URL.createObjectURL(file),
		};
		let newFileData = {};
		try {
			setLoading(true);
			const source = axios.CancelToken.source();
			const filesToUpload = {
				id: selectedDocTypeId,
				name: file.name,
				file: file,
				progress: 0,
				status: 'progress',
				cancelToken: source,
			};
			const formData = new FormData();
			formData.append('document', filesToUpload.file);
			const fileUploadRes = await axios.post(
				`${API.API_END_POINT}/loanDocumentUpload?userId=${businessUserId}`,
				formData
			);
			if (fileUploadRes.data.status !== API.NC_STATUS_CODE.OK) {
				return { ...file, status: 'error' };
			}
			const resFile = fileUploadRes.data.files[0];
			newFileData = {
				document_id: file.id,
				upload_doc_name: resFile.filename,
				document_key: resFile.fd,
				size: resFile.size,
				loan_id: loanId,
				doc_type_id: selectedDocTypeId,
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
	};

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'image/*': [],
		},
		onDrop: async acceptedFiles => {
			try {
				setLoading(true);
				await handleFileUpload(acceptedFiles[0]);
			} catch (error) {
				console.error('error-ProfileFileUpload-onDrop-', error);
			} finally {
				setLoading(false);
			}
		},
	});

	// useEffect(() => {
	// 	// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
	// 	return () => files.forEach(file => URL.revokeObjectURL(file.preview));
	// 	// eslint-disable-next-line
	// }, []);

	// Disable click and keydown behavior on the <Dropzone>

	const isPreview = !!selectedFile;
	const uploadedFile = selectedFile;

	console.log('PanUpload-', {
		cacheDocumentsTemp,
		props,
		businessUserId,
		isPreview,
		uploadedFile,
		cacheDocuments,
	});

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
								if (selectedFile?.document_id)
									return openDocument(uploadedFile);
								window.open(uploadedFile.preview, '_blank');
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
								{loadingFile ? (
									<div style={{ marginLeft: 'auto', height: '30px' }}>
										<CircularLoading />
									</div>
								) : null}
								<UI.IconDelete
									src={iconDelete}
									alt='delete'
									onClick={e => {
										e.preventDefault();
										e.stopPropagation();
										removeCacheDocumentTemp(field.name);
										clearErrorFormState();
									}}
								/>
							</UI.UploadIconWrapper>
						)}
					</UI.ContainerPreview>
				</UI.FieldWrapper>
			) : (
				<UI.Container
					loading={loading}
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
