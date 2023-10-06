import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import LoadingIcon from 'components/Loading/LoadingIcon';
import CircularLoading from 'components/Loaders/Circular';
import Modal from 'components/Modal';
import CompanySelectModal from 'components/CompanySelectModal';
import InputField from 'components/inputs/InputField';
import Button from 'components/Button';

import { getKYCData } from 'utils/request';
import { useToasts } from 'components/Toast/ToastProvider';
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
import { UDYAM_REGEX } from '_config/app.config';
import * as UI from './ui';
import moment from 'moment';
import { maxUploadSize, validateFileUpload } from 'utils/helperFunctions';
import TooltipImage from 'components/Global/Tooltip';
import infoIcon from 'assets/icons/info-icon.png';

const PanUpload = props => {
	const {
		field,
		formState,
		setErrorFormStateField,
		panErrorColorCode,
		panErrorMessage,
		onChangeFormStateField,
		clearErrorFormState,
		setUdyogAadhar,
		udyogAadhar,
		setGstin,
		uploadedFile,
		addCacheDocumentTemp,
		removeCacheDocumentTemp,
		isDisabled,
		setCompanyRocData,
		completedSections,
		// setdisableUdyamNumberInput,
	} = props;
	const { app, application } = useSelector(state => state);
	const { selectedProduct, clientToken, selectedSectionId, isViewLoan } = app;
	const { loanId, businessUserId } = application;
	const [isPanConfirmModalOpen, setIsPanConfirmModalOpen] = useState(false);
	const [isCompanyListModalOpen, setIsCompanyListModalOpen] = useState(false);
	const [isUdyogModalOpen, setIsUdyogModalOpen] = useState(false);
	const [companyList, setCompanyList] = useState([]);
	const [confirmPanNumber, setConfirmPanNumber] = useState('');
	const [loading, setLoading] = useState(false);
	const [loadingFile, setLoadingFile] = useState(false);
	const { addToast } = useToasts();
	const panExtractionData = uploadedFile?.panExtractionData || {};
	const [udyamErrorMessage, setUdyamErrorMessage] = useState('');

	// called for roc starts
	const { getRootProps, getInputProps } = useDropzone({
		accept: '',
		onDrop: async acceptedFiles => {
			try {
				setLoading(true);
				const validatedResp = validateFileUpload(acceptedFiles);
				const finalFilesToUpload = validatedResp
					?.filter(item => item.status !== 'fail')
					.map(fileItem => fileItem.file);

				if (finalFilesToUpload && finalFilesToUpload.length > 0) {
					await handleExtractionPan(acceptedFiles[0]);
				} else {
					setErrorFormStateField(field.name, validatedResp[0].error);
				}
			} catch (error) {
				console.error('error-ProfileFileUpload-onDrop-', error);
			} finally {
				setLoading(false);
			}
		},
	});
	const handleExtractionPan = async file => {
		// console.log('handleExtractionPan-called-0th');
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
	const onProceedPanConfirm = async () => {
		try {
			// console.log('onProceedPanConfirm-called-1st');
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
			if (!gstinData) {
				setUdyamErrorMessage('');
				setUdyogAadhar('');
				setIsUdyogModalOpen(true);
			}
			setGstin(gstinData);
			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME,
				value: confirmPanNumber || panExtractionData?.panNumber,
			});

			/* split the name into first and last name */
			let name = panExtractionData?.Name,
				first_name = '';
			if (name) {
				let nameSplit = name.split(' ');
				if (nameSplit.length > 1) {
					nameSplit.pop();
				}
				first_name = nameSplit.join(' ');
			}
			if (first_name) {
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.BUSINESS_NAME_FIELD_NAME,
					value: first_name || '',
				});
			}
			if (!panExtractionData?.isBusinessPan) {
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.BUSINESS_TYPE_FIELD_NAME,
					value: '1',
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

			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.BUSINESS_TYPE_FIELD_NAME,
				value: '1' || '',
			});
			// if (!!companyRocData) {
			// 	// console.log({ companyRocData });
			// 	onChangeFormStateField({
			// 		name: 'business_name',
			// 		value: companyRocData?.BusinessName || '',
			// 	});
			// 	onChangeFormStateField({
			// 		name: 'business_vintage',
			// 		value:
			// 			moment(companyRocData?.BusinessVintage).format('YYYY-MM-DD') || '',
			// 	});
			// 	onChangeFormStateField({
			// 		name: 'business_email',
			// 		value: companyRocData?.Email,
			// 	});
			// 	onChangeFormStateField({
			// 		name: 'business_type',
			// 		value: companyRocData?.BusinessType || 0,
			// 	});
			// }

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
	const verifyKycPan = async () => {
		// console.log('verifykyc-called-2nd');
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
	const gstinFetch = async confirmPanNumber => {
		try {
			// console.log('gstin-fetch-called-3rd');
			setLoading(true);
			const gstinReqBody = {
				pan: confirmPanNumber,
			};
			const gstinResponse = await axios.post(API.PAN_TO_GST, gstinReqBody, {
				headers: {
					authorization: clientToken,
				},
			});
			// const gstinData = gstinResponse?.data?.data;

			return gstinResponse;
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
	const companyNameSearch = async companyName => {
		try {
			// console.log('companyNameSearch-called-4th');
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
	const onCompanySelect = async cinNumber => {
		// console.log('onCompanySelect-called-5th');

		setIsCompanyListModalOpen(false);
		setLoading(true);
		await cinNumberFetch(cinNumber);
	};

	const cinNumberFetch = async cinNumber => {
		try {
			// console.log('cinNumberFetch-setCompanyRocData-called-6th');

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
			setCompanyRocData(formattedCompanyData);
			// prepopulation starts
			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME,
				value:
					formattedCompanyData?.panNumber || panExtractionData?.panNumber || '',
			});
			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.BUSINESS_NAME_FIELD_NAME,
				value:
					formattedCompanyData?.BusinessName || panExtractionData?.Name || '',
			});
			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.BUSINESS_TYPE_FIELD_NAME,
				value: `${formattedCompanyData?.BusinessType}` || '0' || '',
			});

			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.BUSINESS_EMAIL_FIELD,
				value: formattedCompanyData?.Email || '',
			});

			const businessVintageValue =
				moment(formattedCompanyData?.BusinessVintage).format('YYYY-MM-DD') ||
				moment(panExtractionData?.DOB).format('YYYY-MM-DD') ||
				'';

			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.BUSINESS_VINTAGE_FIELD_NAME,
				value: businessVintageValue,
			});
			onChangeFormStateField({
				name: CONST_BUSINESS_DETAILS.BUSINESS_START_DATE,
				value:
					moment(formattedCompanyData?.DateOfIncorporation).format(
						'YYYY-MM-DD'
					) || '',
			});
			// prepopulation ends
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
	// called for roc ends
	const onProceedUdyogAadhar = async udyogAadharNumber => {
		try {
			// console.log('onproceedudyogAadhar-3-called-4th-n-last');
			// console.log({
			// 	udyogAadharNumber,
			// });
			setLoading(true);
			setUdyogAadhar(udyogAadharNumber);
			// onChangeFormStateField({
			// 	name: CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME,
			// 	value: panExtractionData?.panNumber,
			// });
			const verifyUdyogRes = await axios.get(
				`${API.ENDPOINT_BANK}/get/udyam?udyamRegNo=${udyogAadharNumber}`,
				{
					headers: {
						Authorization: clientToken,
					},
				}
			);
			// console.log({ verifyUdyogRes });
			// prepopulation using udyam
			if (verifyUdyogRes?.data?.status === 'ok') {
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.BUSINESS_NAME_FIELD_NAME,
					value: verifyUdyogRes?.data?.data?.nameOfEnterprise || '',
				});
				onChangeFormStateField({
					name: CONST_BUSINESS_DETAILS.BUSINESS_VINTAGE_FIELD_NAME,
					value:
						moment(verifyUdyogRes?.data?.data?.dateOfIncorporation).format(
							'YYYY-MM-DD'
						) || '',
				});
				// if(verifyUdyogRes?.data?.resCode ==="SUCCESS")
				// setdisableUdyamNumberInput(true);
			}

			return verifyUdyogRes;
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
			setIsUdyogModalOpen(false);
		}
	};

	// Pancard extraction function
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
			<Modal
				show={isUdyogModalOpen}
				onClose={() => {
					setIsUdyogModalOpen(false);
				}}
				customStyle={{ minHeight: '40%' }}
			>
				<section className='p-4 flex-row gap-y-4'>
					<UI.ImgClose
						onClick={() => {
							setIsUdyogModalOpen(false);
						}}
						src={imgClose}
						alt='close'
					/>
					<UI.Title>Udyam Number</UI.Title>
					<UI.Field>
						<InputField
							name='Udyam Number'
							value={udyogAadhar?.toUpperCase().trim()}
							onChange={e => {
								setUdyogAadhar(e.target.value);
							}}
						/>
					</UI.Field>
					<UI_SECTIONS.ErrorMessage borderColorCode={panErrorColorCode}>
						{udyamErrorMessage}
					</UI_SECTIONS.ErrorMessage>
					<UI.ButtonWrapper>
						<Button
							name='Proceed'
							fill
							isLoader={loading}
							onClick={() => {
								if (udyogAadhar?.trim().match(UDYAM_REGEX)) {
									onChangeFormStateField({
										name: 'udyam_number',
										value: udyogAadhar?.trim(),
									});
									onProceedUdyogAadhar(udyogAadhar);
								} else {
									setUdyamErrorMessage('Please Enter a Valid Udyam Number');
								}
							}}
							disabled={loading}
							customStyle={{
								// alignText: 'center',
								margin: '10px',
							}}
						/>
						<Button
							name='Skip'
							fill
							onClick={() => {
								onChangeFormStateField({
									name: 'udyam_number',
									value: '',
								});
								setUdyogAadhar('');
								setIsUdyogModalOpen(false);
							}}
							disabled={loading}
							customStyle={{
								// alignText: 'center',
								margin: '10px',
							}}
						/>
					</UI.ButtonWrapper>
				</section>
			</Modal>
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
								name={CONST_BUSINESS_DETAILS.PAN_NUMBER_CONFIRM_FIELD_NAME}
								value={confirmPanNumber}
								onChange={e => {
									// console.log({ e });
									setConfirmPanNumber(e?.target?.value);
									onChangeFormStateField({
										name: CONST_BUSINESS_DETAILS.PAN_NUMBER_FIELD_NAME,
										value: e?.target?.value || confirmPanNumber,
									});
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
							{uploadedFile?.name || uploadedFile?.uploaded_doc_name}
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
								{!uploadedFile?.document_id &&
									!isViewLoan &&
									!completedSections?.includes(selectedSectionId) && (
										<UI.IconDelete
											src={iconDelete}
											alt='delete'
											onClick={e => {
												e.preventDefault();
												e.stopPropagation();
												removeCacheDocumentTemp(field.name);
												setGstin([]);
												setCompanyRocData({});
												onChangeFormStateField({
													name: 'gstin',
													value: '',
												});
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
						<>
							{maxUploadSize && (
								<TooltipImage
									src={infoIcon}
									alt='Image Alt Text'
									title={`Maximum upload size for every image is ${maxUploadSize}MB`}
								/>
							)}
							<UI.UploadIconWrapper
								{...getRootProps({
									className: 'dropzone',
								})}
							>
								<input {...getInputProps()} />
								<UI.IconUpload src={iconUploadBlue} alt='camera' />
							</UI.UploadIconWrapper>
						</>
					)}
				</UI.Container>
			)}
		</>
	);
};

export default PanUpload;
