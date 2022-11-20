import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
// import axios from 'axios';
import _ from 'lodash';

import { setPanExtractionRes } from 'store/applicantCoApplicantsSlice';
import { addLoanDocument } from 'store/applicationSlice';
import { getKYCData } from 'utils/request';
import LoadingIcon from 'components/Loading/LoadingIcon';
import iconUploadBlue from 'assets/icons/upload_icon_blue.png';
// import iconCameraGrey from 'assets/icons/camera_grey.png';
import iconDelete from 'assets/icons/close_icon_grey-06.svg';
// import { API_END_POINT } from '_config/app.config';
import { isBusinessPan } from 'utils/helper';
import { useToasts } from 'components/Toast/ToastProvider';
import * as CONST_ADDRESS_PROOF_UPLOAD from 'components/AddressProofUpload/const';
import * as CONST_DOCUMENT_UPLOAD from 'components/Sections/DocumentUpload/const';
// import * as CONST from './const';

const FieldWrapper = styled.div`
	display: flex;
	gap: 10px;
`;

const ContainerPreview = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	border-radius: 6px;
	border: 2px dashed #4cc97f;
	color: #525252;
	outline: none;
	transition: all 0.3s ease-out;
	width: 100%;
	height: 50px;
	padding: 0 15px;
	${({ loading }) =>
		loading &&
		`border: dashed grey 2px;
      background-color: rgba(255,255,255,.8);`}
	${({ panErrorColorCode }) =>
		panErrorColorCode &&
		`border: dashed ${panErrorColorCode} 2px;
      background-color: rgba(255,255,255,.8);`}
`;

const Container = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	border-radius: 6px;
	background-color: #dce2f7;
	border: 2px dashed #0000ff80;
	color: #525252;
	outline: none;
	transition: all 0.3s ease-out;
	width: 100%;
	height: 50px;
	padding: 0 15px;
	${({ loading }) =>
		loading &&
		`border: dashed grey 2px;
      background-color: rgba(255,255,255,.8);`}
	${({ panErrorColorCode }) =>
		panErrorColorCode &&
		`border: dashed ${panErrorColorCode} 2px;
      background-color: rgba(255,255,255,.8);`}
`;

const IconDelete = styled.img`
	height: 30px;
	width: 30px;
`;

const UploadIconWrapper = styled.div`
	/* border: 1px solid red; */
	position: absolute;
	right: 0;
	margin-right: 15px;
	cursor: pointer;
`;

const IconUpload = styled.img`
	height: 30px;
	width: 30px;
`;
const PreviewUploadIconWrapper = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	text-align: center;
	justify-content: center;
	border-radius: 6px;
	background-color: #dce2f7;
	border: 2px dashed #0000ff80;
	color: #525252;
	min-width: 50px;
	min-height: 50px;
`;

const PanUpload = props => {
	const {
		field,
		setIsPanConfirmModalOpen,
		setErrorFormStateField,
		panErrorColorCode,
	} = props;
	const { app } = useSelector(state => state);
	const { selectedProduct, clientToken } = app;
	// const {  } = application;
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const { addToast } = useToasts();

	// Pancard extraction function
	const handleExtractionPan = async file => {
		try {
			// console.log('handleExtractionPan-', panDoc);
			setLoading(true);
			const formData = new FormData();
			formData.append('product_id', selectedProduct.id);
			formData.append(
				'req_type',
				CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_KEY_PAN
			);
			formData.append('process_type', 'extraction');
			formData.append('document', file);
			const panExtractionRes = await getKYCData(formData, clientToken);
			console.log('handleExtractionPan-', {
				panExtractionRes,
			});
			const panExtractionStatus = panExtractionRes?.data?.status || '';
			const panExtractionMsg = panExtractionRes?.data?.message || '';
			const panForensicRes = panExtractionRes?.data?.forensicData || {};
			const panForensicFlag = panForensicRes?.flag?.toLowerCase() || '';
			const panForensicFlagMsg = panForensicRes?.flag_message || '';
			// console.log('handleExtractionPan-', {
			// 	panExtractionRes,
			// 	panExtractionStatus,
			// 	panExtractionMsg,
			// 	panForensicRes,
			// 	panForensicFlag,
			// 	panForensicFlagMsg,
			// });
			if (panExtractionStatus === 'nok') {
				setErrorFormStateField(
					field.name,
					`${
						CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_FLAG_ERROR
					}${panExtractionMsg}`
				);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (panForensicFlag === 'error') {
				setErrorFormStateField(
					field.name,
					`${
						CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_FLAG_ERROR
					}${panForensicFlagMsg}`
				);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (panForensicFlag === 'warning') {
				setErrorFormStateField(
					field.name,
					`${
						CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_FLAG_WARNING
					}${panForensicFlagMsg}`
				);
				// CONTINUE EXECUTION
			}
			if (panForensicFlag !== 'warning') {
				// Important: Do not set success message we don't need to display success message
				// setErrorFormStateField(
				// 	field.name,
				// 	`${
				// 		CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_FLAG_SUCCESS
				// 	}${panForensicFlagMsg}`
				// );
				setIsPanConfirmModalOpen(true);
			}
			const file1 = {
				...(panExtractionRes?.data?.extractionData || {}),
				document_key: panExtractionRes?.data.s3.fd,
				id: Math.random()
					.toString(36)
					.replace(/[^a-z]+/g, '')
					.substr(0, 6),
				mainType: 'KYC',
				size: panExtractionRes?.data.s3.size,
				type: CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_KEY_PAN,
				req_type: CONST_ADDRESS_PROOF_UPLOAD.EXTRACTION_KEY_PAN, // requires for mapping with JSON
				requestId: panExtractionRes?.data?.request_id,
				upload_doc_name: panExtractionRes?.data.s3.filename,
				isDocRemoveAllowed: false,
				category: CONST_DOCUMENT_UPLOAD.CATEGORY_KYC,
				doc_type_id: `app_${CONST_DOCUMENT_UPLOAD.CATEGORY_KYC}`,
			};
			addLoanDocument(file1);
			const newPanExtractionData = _.cloneDeep(
				panExtractionRes?.data?.extractionData || {}
			);
			newPanExtractionData.doc_ref_id =
				panExtractionRes?.data?.doc_ref_id || '';
			newPanExtractionData.requestId = panExtractionRes?.data?.request_id || '';
			newPanExtractionData.panNumber = newPanExtractionData?.Pan_number || '';
			newPanExtractionData.responseId = newPanExtractionData?.id || '';
			newPanExtractionData.dob = newPanExtractionData?.DOB || '';
			newPanExtractionData.isBusinessPan =
				isBusinessPan(
					newPanExtractionData?.Name || newPanExtractionData?.name
				) || false;
			newPanExtractionData.companyName = newPanExtractionData?.Name || '';
			if (selectedProduct.isSelectedProductTypeBusiness) {
				const name =
					newPanExtractionData?.name?.split(' ') ||
					newPanExtractionData?.Name?.split(' ');
				if (name) {
					newPanExtractionData.firstName = name[0];
					newPanExtractionData.lastName = name[1];
				}
			}

			// TODO: set this response to app / coapps / slice
			// console.log('beforeset-setPanExtractionRes-', { newPanExtractionData });
			dispatch(setPanExtractionRes(newPanExtractionData));
		} catch (error) {
			console.error('error-pan-verification-handleExtractionPan-', error);
			setIsPanConfirmModalOpen(true);
			addToast({
				message: error.message,
				type: 'error',
			});
		} finally {
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
				// TODO: extraction
				// const formData = new FormData();
				// formData.append('white_label_id', whiteLabelId);
				// formData.append('document', acceptedFiles[0]);
				// const profileRes = await axios.post(
				// 	`${API_END_POINT}/profilePicUpload`,
				// 	formData
				// );
				// dispatch(setProfileImageRes(profileRes?.data));
				await handleExtractionPan(acceptedFiles[0]);
				setFiles(
					acceptedFiles.map(file =>
						Object.assign(file, {
							preview: URL.createObjectURL(file),
						})
					)
				);
			} catch (error) {
				console.error('error-ProfileFileUpload-onDrop-', error);
			} finally {
				setLoading(false);
			}
		},
	});

	useEffect(() => {
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => files.forEach(file => URL.revokeObjectURL(file.preview));
		// eslint-disable-next-line
	}, []);

	// Disable click and keydown behavior on the <Dropzone>

	const isPreview = files.length > 0;
	const uploadedFile = files[0];

	// console.log('PanUpload-', {
	// 	panErrorColorCode,
	// });

	if (isPreview) {
		return (
			<FieldWrapper>
				<PreviewUploadIconWrapper>
					<IconUpload src={iconUploadBlue} alt='camera' />
				</PreviewUploadIconWrapper>
				<ContainerPreview panErrorColorCode={panErrorColorCode}>
					<label>{uploadedFile?.name}</label>
					{loading ? (
						<UploadIconWrapper>
							<LoadingIcon />
						</UploadIconWrapper>
					) : (
						<UploadIconWrapper {...getRootProps({ className: 'dropzone' })}>
							<IconDelete
								src={iconDelete}
								alt='delete'
								onClick={e => {
									e.preventDefault();
									e.stopPropagation();
									setFiles([]);
									setErrorFormStateField(field.name, '');
									setLoading(false);
								}}
							/>
						</UploadIconWrapper>
					)}
				</ContainerPreview>
			</FieldWrapper>
		);
	}

	return (
		<Container
			loading={loading}
			panErrorColorCode={panErrorColorCode}
			style={{ border: `2px dashed red;` }}
		>
			<label>Upload{loading ? 'ing...' : null} PAN</label>
			{loading ? (
				<UploadIconWrapper>
					<LoadingIcon />
				</UploadIconWrapper>
			) : (
				<UploadIconWrapper {...getRootProps({ className: 'dropzone' })}>
					<input {...getInputProps()} />
					<IconUpload src={iconUploadBlue} alt='camera' />
				</UploadIconWrapper>
			)}
		</Container>
	);
};

export default PanUpload;
