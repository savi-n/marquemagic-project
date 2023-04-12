import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
// import _ from 'lodash';
import axios from 'axios';

import LoadingIcon from 'components/Loading/LoadingIcon';
import CircularLoading from 'components/Loaders/Circular';
import Modal from 'components/Modal';
import CompanySelectModal from 'components/CompanySelectModal';
import InputField from 'components/inputs/InputField';
import Button from 'components/Button';

import { setCompanyRocData } from 'store/applicantCoApplicantsSlice';
import { getKYCData } from 'utils/request';
import { useToasts } from 'components/Toast/ToastProvider';
// import { isBusinessPan } from 'utils/helper';
import { decryptViewDocumentUrl } from 'utils/encrypt';
import {
	formatCompanyRocData,
	formatPanExtractionData,
} from 'utils/formatData';
import { verifyKycDataUiUx } from 'utils/request';
import { isInvalidPan } from 'utils/validation';
import iconUploadBlue from 'assets/icons/upload_icon_blue.png';
import iconDelete from 'assets/icons/close_icon_grey-06.svg';
import imgClose from 'assets/icons/close_icon_grey-06.svg';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_BUSINESS_DETAILS from '../const';
import * as API from '_config/app.config';
import * as UI from './ui';
import moment from 'moment';

const PanUpload = props => {
	const {
		field,
		// value,
		formState,
		setErrorFormStateField,
		panErrorColorCode,
		panErrorMessage,
		onChangeFormStateField,
		clearErrorFormState,
		// cacheDocumentsTemp,
		// state,
		setGstin,
		uploadedFile,
		addCacheDocumentTemp,
		removeCacheDocumentTemp,
		isDisabled,
	} = props;
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const { selectedProduct, clientToken } = app;
	const { loanId, businessUserId } = application;
	const { companyRocData } = applicantCoApplicants;

	// const {
	// 	isApplicant,
	// 	applicant,
	// 	coApplicants,
	// 	selectedApplicantCoApplicantId,
	// } = applicantCoApplicants;
	// const selectedApplicant = isApplicant
	//  ? applicant
	// 	: coApplicants?.[selectedApplicantCoApplicantId] || {};
	// const { cacheDocuments } = selectedApplicant;
	// const [files, setFiles] = useState([]);
	// const [panFile, setPanFile] = useState(null);
	const [isPanConfirmModalOpen, setIsPanConfirmModalOpen] = useState(false);
	const [isCompanyListModalOpen, setIsCompanyListModalOpen] = useState(false);
	const [companyList, setCompanyList] = useState([]);
	const [confirmPanNumber, setConfirmPanNumber] = useState('');
	const [loading, setLoading] = useState(false);
	// const [udyogAadhar, setUdyog] = useState('');
	const [loadingFile, setLoadingFile] = useState(false);
	const { addToast } = useToasts();
	const dispatch = useDispatch();
	// const panExtractionResTemp =
	// 	cacheDocumentsTemp.filter(
	// 		doc => doc.field.name === CONST_BUSINESS_DETAILS.PAN_UPLOAD_FIELD_NAME
	// 	)?.[0] || null;
	// const panExtractionFile =
	// 	cacheDocumentsTemp?.filter(doc => doc?.field?.name === field.name)?.[0] ||
	// 	cacheDocuments?.filter(doc => doc?.field?.name === field.name)?.[0] ||
	// 	null;
	const panExtractionData = uploadedFile?.panExtractionData;

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

	const verifyKycPan = async () => {
		try {
			// console.log('verifyKycPan-', {
			// 	selectedAddressProof,
			// 	isVerifyKycData,
			// 	extractionData,
			// });
			if (!selectedProduct?.product_details?.kyc_verification) return {};
			const verifyKycPanReqBody = {
				doc_ref_id: panExtractionData?.doc_ref_id,
				doc_type: CONST_SECTIONS.EXTRACTION_KEY_PAN,
				number: confirmPanNumber,
				name: panExtractionData?.companyName || '',
			};
			const verifiedRes = await verifyKycDataUiUx(
				verifyKycPanReqBody,
				clientToken
			);
			return verifiedRes;
		} catch (error) {
			console.error('error-verifyKycPan-', error);
			addToast({
				message: error.message || 'Something Went Wrong. Try Again!',
				type: 'error',
			});
			return {};
		}
	};

	const companyNameSearch = async companyName => {
		try {
			setLoading(true);
			const companyNameReqBody = {
				search: companyName.trim(),
			};
			const companyNameSearchRes = await axios.post(
				API.SEARCH_COMPANY_NAME,
				companyNameReqBody
			);
			const newCompanyList = companyNameSearchRes?.data?.data || [];
			setCompanyList(newCompanyList);
			return newCompanyList;
		} catch (error) {
			console.error('error-companyNameSearch-', error);
			addToast({
				message: error.message || 'Company search failed, try again',
				type: 'error',
			});
			return [];
		} finally {
			setLoading(false);
		}
	};
	const onProceedUdyodAadhar = async udyogAadharNumber => {
		try {
			// console.log({
			// 	udyogAadharNumber,
			// });
			setLoading(true);
			setUdyogAadhar(udyogAadharNumber);
			const VerifyUdyog = await axios.get(
				`${API.ENDPOINT_BANK}/get/udyog?uan=${udyogAadharNumber}`,
				{
					headers: {
						Authorization: clientToken,
					},
				}
			);
			return VerifyUdyog;
		} catch (e) {
			setLoading(false);
			addToast({
				message:
					'Unable to fetch the data from udyog. Please continue to fill the details.',
				// || error?.message ||
				// 'ROC search failed, try again',
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};
	const gstinFetch = async confirmPanNumber => {
		try {
			setLoading(true);
			const gstinReqBody = {
				pan: confirmPanNumber,
			};
			const gstinResponse = await axios.post(
				`${API.API_END_POINT}/api/panToGst`,
				gstinReqBody,
				{
					headers: {
						authorization: clientToken,
					},
				}
			);
			const gstinData = gstinResponse?.data?.data;

			return gstinData;
			// console.log(gstin);
		} catch (error) {
			setLoading(false);
			// addToast({
			// 	message:
			// 		'Unable to fetch the data from PanToGst. Please continue to fill the details.',
			// 	// || error?.message ||
			// 	// 'ROC search failed, try again',
			// 	type: 'error',
			// });
			console.error('error-gstinFetchError-', error);
		} finally {
			setLoading(false);
		}
	};
	const cinNumberFetch = async cinNumber => {
		try {
			setLoading(true);
			const cinFetchReqBody = {
				cin_number: cinNumber,
			};
			const cinNumberResponse = await axios.post(
				API.ROC_DATA_FETCH,
				cinFetchReqBody,
				{
					headers: {
						Authorization: clientToken,
					},
				}
			);

			const companyData = cinNumberResponse?.data?.data;
			// companyData.gstin = gstinData;
			const formattedCompanyData = formatCompanyRocData(
				companyData,
				confirmPanNumber
			);
			dispatch(setCompanyRocData(formattedCompanyData));
		} catch (error) {
			setLoading(false);
			addToast({
				message:
					'Unable to fetch the data from ROC. Please continue to fill the details.',
				// || error?.message ||
				// 'ROC search failed, try again',
				type: 'error',
			});
			console.error('error-cinnumberfetch-', error);
		} finally {
			setLoading(false);
		}
	};
	const onCompanySelect = async cinNumber => {
		setIsCompanyListModalOpen(false);
		setLoading(true);
		await cinNumberFetch(cinNumber);
	};
	const onProceedPanConfirm = async () => {
		try {
			const panErrorMessage = isInvalidPan(confirmPanNumber);
			if (panErrorMessage) {
				return addToast({
					message: panErrorMessage,
					type: 'error',
				});
			}
			setLoading(true);
			// call verifykyc api
			const verifiedRes = await verifyKycPan();
			// console.log(
			// 	'pan-verification-handlePanConfirm-verifiedRes-',
			// 	verifiedRes
			// );
			// business product + business pan card

			// Pre population from pan
			const gstinData = await gstinFetch(confirmPanNumber);
			console.log(gstinData);
			if (gstinData?.status === 'ok' && !gstinData) {
				setIsUdyogModalOpen(true);
				onChangeFormStateField({
					name: 'udhyog_number',
					value: udyogAadhar,
				});
			}
			setGstin(gstinData);
			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME,
				value: confirmPanNumber,
			});
			/* split the name into first and last name */
			let name = panExtractionData?.Name,
				business_name = '',
				business_type = '';
			if (name) {
				let nameSplit = name.split(' ');
				if (nameSplit.length > 1) {
					business_type = nameSplit[nameSplit.length - 1];
					nameSplit.pop();
				}
				business_name = nameSplit.join(' ');
			}
			if (business_name) {
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.BUSINESS_NAME_FIELD_NAME,
					value: business_name || '',
				});
			}
			if (business_type) {
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.BUSINESS_TYPE_FIELD_NAME,
					value: business_type || '',
				});
			}
			if (panExtractionData?.father_name) {
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.FATHER_NAME_FIELD_NAME,
					value: panExtractionData?.father_name || '',
				});
			}
			if (panExtractionData?.DOB) {
				let DOB = panExtractionData?.DOB;
				DOB = DOB?.split('/')
					?.reverse()
					?.join('-');
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.DOB_FIELD_NAME,
					value: DOB || '',
				});
			}
			if (!!companyRocData) {
				onChangeFormStateField({
					name: 'business_name',
					value: companyRocData?.BusinessName || '',
				});
				onChangeFormStateField({
					name: 'business_vintage',
					value:
						moment(companyRocData?.BusinessVintage).format('YYYY-MM-DD') || '',
				});
				onChangeFormStateField({
					name: 'business_email',
					value: companyRocData?.Email,
				});
				onChangeFormStateField({
					name: 'business_type',
					value: companyRocData?.BusinessType || 0,
				});
			}

			// Company search select is only applicable for business loans
			if (
				!!gstinData &&
				selectedProduct.isSelectedProductTypeBusiness &&
				panExtractionData?.isBusinessPan
			) {
				await companyNameSearch(
					verifiedRes?.data?.message?.upstreamName ||
						panExtractionData?.companyName
				);
				// console.log('company information from pancardfile', newCompanyList);
				// console.log(
				// 	'information related to pancardextraction',
				// 	panExtractionData
				// );
				setIsPanConfirmModalOpen(false);
				setIsCompanyListModalOpen(true);
				return;
			}
			// business product + personal pan card
			if (selectedProduct.isSelectedProductTypeBusiness) {
				setIsPanConfirmModalOpen(false);
			}
			// salaried product + personal pan card
			if (selectedProduct.isSelectedProductTypeSalaried) {
				setIsPanConfirmModalOpen(false);
			}
			setIsPanConfirmModalOpen(false);
		} catch (error) {
			console.error('error-handlePanConfirm-', error);
		} finally {
			setLoading(false);
			clearErrorFormState();
		}
	};

	// Pancard extraction function
	const handleExtractionPan = async file => {
		const previewFileData = {
			name: file.name,
			preview: URL.createObjectURL(file),
			field,
		};
		let newFileData = {};
		try {
			// console.log('handleExtractionPan-', file);
			setLoading(true);
			const formData = new FormData();
			formData.append('product_id', selectedProduct.id);
			formData.append('req_type', CONST_SECTIONS.EXTRACTION_KEY_PAN);
			formData.append('process_type', 'extraction');
			formData.append('document', file);
			const panExtractionApiRes = await getKYCData(formData, clientToken);
			const panExtractionStatus = panExtractionApiRes?.data?.status || '';
			const panExtractionMsg = panExtractionApiRes?.data?.message || '';
			const panForensicRes = panExtractionApiRes?.data?.forensicData || {};
			const panForensicFlag = panForensicRes?.flag?.toLowerCase() || '';
			const panForensicFlagMsg = panForensicRes?.flag_message || '';
			// console.log('handleExtractionPan-', {
			// 	panExtractionApiRes,
			// 	panExtractionStatus,
			// 	panExtractionMsg,
			// 	panForensicRes,
			// 	panForensicFlag,
			// 	panForensicFlagMsg,
			// });
			if (panExtractionStatus === 'nok') {
				setErrorFormStateField(
					field.name,
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${panExtractionMsg}`
				);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (panForensicFlag === 'error') {
				setErrorFormStateField(
					field.name,
					`${CONST_SECTIONS.EXTRACTION_FLAG_ERROR}${panForensicFlagMsg}`
				);
				setLoading(false);
				return; // STOP FURTHER EXECUTION
			}
			if (panForensicFlag === 'warning') {
				setErrorFormStateField(
					field.name,
					`${CONST_SECTIONS.EXTRACTION_FLAG_WARNING}${panForensicFlagMsg}`
				);
				// CONTINUE EXECUTION
			}
			if (panForensicFlag !== 'warning') {
				clearErrorFormState();
				// Important: Do not set success message we don't need to display success message
				// setErrorFormStateField(
				// 	field.name,
				// 	`${
				// 		CONST_SECTIONS.EXTRACTION_FLAG_SUCCESS
				// 	}${panForensicFlagMsg}`
				// );
				// setIsPanConfirmModalOpen(true);
			}
			const panExtractionData = formatPanExtractionData({
				panExtractionApiRes,
				isSelectedProductTypeBusiness:
					selectedProduct.isSelectedProductTypeBusiness,
			});
			newFileData = {
				panExtractionData: panExtractionData,
				panExtractionApiRes: panExtractionApiRes?.data || {},
				...(panExtractionApiRes?.data?.extractionData || {}),
				document_key: panExtractionApiRes?.data.s3.fd,
				id: Math.random()
					.toString(36)
					.replace(/[^a-z]+/g, '')
					.substr(0, 6),
				mainType: 'KYC',
				size: panExtractionApiRes?.data.s3.size,
				type: CONST_SECTIONS.EXTRACTION_KEY_PAN,
				req_type: CONST_SECTIONS.EXTRACTION_KEY_PAN, // requires for mapping with JSON
				requestId: panExtractionApiRes?.data?.request_id,
				upload_doc_name: panExtractionApiRes?.data.s3.filename,
				isDocRemoveAllowed: false,
				category: CONST_SECTIONS.DOC_CATEGORY_KYC,
			};
			// console.log('beforeset-setPanExtractionRes-newfile', { newFileData });
			setConfirmPanNumber(panExtractionData?.panNumber);
			// addCacheDocumentTemp(newFile);
			setIsPanConfirmModalOpen(true);
			// setPanExtractionResTemp(newPanExtractionData);
		} catch (error) {
			console.error('error-pan-verification-handleExtractionPan-', error);
			setIsPanConfirmModalOpen(true);
			addToast({
				message: error?.message,
				type: 'error',
			});
		} finally {
			addCacheDocumentTemp({
				...previewFileData,
				...newFileData,
			});
			setLoading(false);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			'*': [],
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
				// setFiles(
				// 	acceptedFiles.map(file =>
				// 		Object.assign(file, {
				// 			preview: URL.createObjectURL(file),
				// 		})
				// 	)
				// );
				await handleExtractionPan(acceptedFiles[0]);
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
	// const uploadedFile = panExtractionFile;

	// console.log('PanUpload-', {
	// 	props,
	// 	value,
	// 	panExtractionData,
	// 	isPreview,
	// 	uploadedFile,
	// });
	// dispatch(setCompanyRocData(gstin));
	return (
		<>
			<CompanySelectModal
				companyNameSearch={companyNameSearch}
				searchingCompanyName={loading}
				show={isCompanyListModalOpen}
				companyName={formState?.values?.companyName}
				companyList={companyList}
				panExtractionData={panExtractionData}
				onClose={() => {
					setIsCompanyListModalOpen(false);
				}}
				onCompanySelect={onCompanySelect}
				formState={formState}
				proceedToNextSection={() => {
					setIsCompanyListModalOpen(false);
				}}
			/>
			{/* <Modal
				show={isUdyogModalOpen}
				onClose={() => {
					setIsUdyogModalOpen(false);
				}}
				width='20%'
				height='30%'
			>
				<section>
					<UI.ImgClose
						onClick={() => {
							setIsUdyogModalOpen(false);
						}}
						src={imgClose}
						alt='close'
					/>
					<span>Udyog Aadhar</span>
					<InputField
						name='Udyog Aadhar'
						value={udyogAadhar}
						onChange={e => {
							setUdyogAadhar(e.target.value);
							onChangeFormStateField({
								name: 'udhyog_number',
								value: udyogAadhar,
							});
						}}
						// style={{
						// 	textAlign: 'center',
						// }}
					/>
					<Button
						name='Proceed'
						fill
						isLoader={loading}
						onClick={() =>
							// 	console.log({
							// 		udyogAadhar,
							// 	})
							// }
							{
								onProceedUdyodAadhar(udyogAadhar);
								setIsUdyogModalOpen(false);
							}
						}
						disabled={loading}
						style={{
							alignText: 'center',
						}}
					/>
					<Button
						name='Skip'
						fill
						isLoader={loading}
						onClick={() =>
							// 	console.log({
							// 		udyogAadhar,
							// 	})
							// }
							setIsUdyogModalOpen(false)
						}
						disabled={loading}
						style={{
							alignText: 'center',
						}}
					/>
				</section>
			</Modal> */}
			<Modal
				show={isPanConfirmModalOpen}
				onClose={() => {
					setIsPanConfirmModalOpen(false);
				}}
				width='30%'
			>
				<section className='p-4 flex flex-col gap-y-8'>
					<UI.ImgClose
						onClick={() => {
							setIsPanConfirmModalOpen(false);
						}}
						src={imgClose}
						alt='close'
					/>
					<UI.ConfirmPanWrapper>
						<h1
							style={{
								fontSize: '22px',
								fontWeight: '600Px',
							}}
						>
							Confirm PAN Number and Proceed
						</h1>
						<UI.FieldWrapperPanVerify>
							<InputField
								name={CONST_BASIC_DETAILS.PAN_NUMBER_CONFIRM_FIELD_NAME}
								value={confirmPanNumber}
								onChange={e => {
									// console.log({ e });
									setConfirmPanNumber(e?.target?.value);
									// const newPanExtractionData = _.cloneDeep(
									// 	panExtractionResTemp
									// );
									// newPanExtractionData.[CONST.PAN_NUMBER_CONFIRM_FIELD_NAME] = e.target.value;
									// const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
									// newCacheDocumentTemp.map(doc => {
									// 	if (
									// 		doc.field.name ===
									// 		CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME
									// 	) {
									// 		doc[CONST_BUSINESS_DETAILS.PAN_NUMBER_CONFIRM_FIELD_NAME] =
									// 			e.target.value;
									// 	}
									// 	return doc;
									// });
									// setCacheDocumentsTemp(newCacheDocumentTemp);
									// dispatch(panExtractionResTemp(newPanExtractionData));
								}}
								style={{
									textAlign: 'center',
								}}
							/>
							{panErrorMessage && (
								<UI_SECTIONS.ErrorMessage borderColorCode={panErrorColorCode}>
									{panErrorMessage}
								</UI_SECTIONS.ErrorMessage>
							)}
						</UI.FieldWrapperPanVerify>
						<Button
							name='Proceed'
							fill
							isLoader={loading}
							onClick={onProceedPanConfirm}
							// onClick={() => {
							// 	setIsPanConfirmModalOpen(false);
							// 	setIsUdyogModalOpen(true);
							// }}
							disabled={loading}
							style={{
								alignText: 'center',
							}}
						/>
					</UI.ConfirmPanWrapper>
				</section>
			</Modal>
			{isPreview ? (
				<UI.FieldWrapper>
					<UI.PreviewUploadIconWrapper>
						<UI.IconUpload src={iconUploadBlue} alt='camera' />
					</UI.PreviewUploadIconWrapper>
					<UI.ContainerPreview panErrorColorCode={panErrorColorCode}>
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
								{...getRootProps({
									className: 'dropzone',
								})}
							>
								{loadingFile ? (
									<div
										style={{
											marginLeft: 'auto',
											height: '30px',
										}}
									>
										<CircularLoading />
									</div>
								) : null}
								{!uploadedFile?.document_id && (
									<UI.IconDelete
										src={iconDelete}
										alt='delete'
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											removeCacheDocumentTemp(field.name);
											onChangeFormStateField({
												name: CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME,
												value: '',
											});
											onChangeFormStateField({
												name: CONST_BUSINESS_DETAILS.PAN_UPLOAD_FIELD_NAME,
												value: '',
											});
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
					isDisabled={isDisabled}
					panErrorColorCode={panErrorColorCode}
				>
					<label>
						Upload
						{loading ? 'ing...' : null} PAN
					</label>
					{loading ? (
						<UI.UploadIconWrapper>
							<LoadingIcon />
						</UI.UploadIconWrapper>
					) : (
						<UI.UploadIconWrapper
							{...getRootProps({
								className: 'dropzone',
							})}
						>
							<input {...getInputProps()} />
							<UI.IconUpload src={iconUploadBlue} alt='camera' />
						</UI.UploadIconWrapper>
					)}
				</UI.Container>
			)}
		</>
	);
};

export default PanUpload;
