import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import queryString from 'query-string';
import _ from 'lodash';
import PanUpload from './PanUpload';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import imgClose from 'assets/icons/close_icon_grey-06.svg';

import Hint from 'components/Hint';
import ConfirmModal from 'components/modals/ConfirmModal';
import { decryptRes } from 'utils/encrypt';
import { verifyUiUxToken } from 'utils/request';
import { API_END_POINT } from '_config/app.config';

import { setLoginCreateUserRes, setSelectedSectionId } from 'store/appSlice';
import { removeCacheDocument } from 'store/applicantCoApplicantsSlice';
import {
	addCacheDocuments,
	setLoanIds,
	updateApplicationSection,
	setBusinessType,
} from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getSelectedField,
} from 'utils/formatData';
import Loading from 'components/Loading';
import SessionExpired from 'components/modals/SessionExpired';
import { useToasts } from 'components/Toast/ToastProvider';
import { getCompletedSections } from 'utils/formatData';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';
import Modal from 'components/Modal';

const BuissnessDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		whiteLabelId,
		clientToken,
		userToken,
		isViewLoan,
		isEditLoan,
		isEditOrViewLoan,
		isDraftLoan,
		applicantCoApplicantSectionIds,
		editLoanDirectors,
		userDetails,
	} = app;
	const {
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants?.[selectedApplicantCoApplicantId] || {};
	const { directorId } = selectedApplicant;
	const {
		cacheDocuments,
		borrowerUserId,
		businessUserId,
		businessId,
		loanId,
		businessType,
		loanRefId,
		sections,
	} = application;
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const dispatch = useDispatch();
	const [sectionData, setSectionData] = useState({});
	// const [FetchSectionData, setFetchingSectionData] = useState(false);
	const { addToast } = useToasts();
	const [udyogAadhar, setUdyogAadhar] = useState('');
	const [loading, setLoading] = useState(false);
	const [isGstModalOpen, setGstModalOpen] = useState(false);
	// const [fetchingAddress, setFetchingAddress] = useState(false);
	const [
		isIncomeTypeConfirmModalOpen,
		setIsIncomeTypeConfirmModalOpen,
	] = useState(false);
	const [gstin, setGstin] = useState([]);
	const gst = gstin?.data?.data || [];
	// console.log({ gstin, gst });
	const [isTokenValid, setIsTokenValid] = useState(true);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
		setErrorFormStateField,
	} = useForm();
	const selectedIncomeType = 'business';
	const completedSections = getCompletedSections({
		selectedProduct,
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		application,
		isEditOrViewLoan,
		isEditLoan,
		isDraftLoan,
		applicantCoApplicantSectionIds,
		editLoanDirectors,
		selectedApplicant,
	});
	const selectedPanUploadField = getSelectedField({
		fieldName: CONST.PAN_UPLOAD_FIELD_NAME,
		selectedSection,
	});
	const isPanUploadMandatory = !!selectedPanUploadField?.rules?.required;
	const isPanNumberExist = !!formState?.values?.pan_number;
	const panUploadedFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME
		)?.[0] ||
		cacheDocuments?.filter(
			doc =>
				`${doc?.directorId}` === `${directorId}` &&
				(doc?.is_delete_not_allowed === 'true' ||
					doc?.is_delete_not_allowed === true) &&
				doc?.doc_type_id ===
					selectedPanUploadField?.doc_type?.[selectedIncomeType]
		)?.[0] ||
		null;
	const tempPanUploadedFile = !!sectionData?.loan_document
		? sectionData?.loan_document
		: null;

	const onProceed = async () => {
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;
			// call login api only once
			// TODO: varun do not call this api when RM is creating loan
			let newBorrowerUserId = '';
			if (!isEditOrViewLoan && !borrowerUserId) {
				const loginCreateUserReqBody = {
					email: formState?.values?.email || '',
					white_label_id: whiteLabelId,
					source: API.APP_CLIENT,
					name: formState?.values?.first_name,
					mobileNo: formState?.values?.mobile_no,
					addrr1: '',
					addrr2: '',
				};
				if (!!userDetails?.id) {
					loginCreateUserReqBody.user_id = userDetails?.id;
				}
				const newLoginCreateUserRes = await axios.post(
					`${API.LOGIN_CREATEUSER}`,
					loginCreateUserReqBody
				);
				dispatch(setLoginCreateUserRes(newLoginCreateUserRes?.data));
				newBorrowerUserId = newLoginCreateUserRes?.data?.userId;
				// first priority is to set existing user token which is comming from ui-ux
				// create user is for creating users bucket and generating borrower_user_id so that all the document can be stored inside users bucket
				axios.defaults.headers.Authorization = `Bearer ${userToken ||
					newLoginCreateUserRes?.data?.token}`;
			} else {
				axios.defaults.headers.Authorization = `Bearer ${userToken}`;
			}

			// loan product is is only applicable for applicant
			// it should not be overritten when coapplicant is income type is different then applicant
			const selectedLoanProductId =
				selectedProduct?.product_id?.[selectedIncomeType] || '';

			const buissnessDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
				},
				app,
				applicantCoApplicants,
				application,
				selectedLoanProductId,
			});
			buissnessDetailsReqBody.borrower_user_id =
				newBorrowerUserId || businessUserId || borrowerUserId;

			buissnessDetailsReqBody.data.business_details.loan_document = [];

			const buissnessDetailsRes = await axios.post(
				API.BUSINESS_DETIALS,
				buissnessDetailsReqBody
			);
			const newLoanRefId =
				buissnessDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = buissnessDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId =
				buissnessDetailsRes?.data?.data?.business_data?.id ||
				buissnessDetailsRes?.data?.data?.loan_data?.business_id;
			// const newDirectorId =
			// 	buissnessDetailsRes?.data?.data?.director_details?.id;
			const newBusinessUserId =
				buissnessDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				buissnessDetailsRes?.data?.data?.loan_data?.createdUserId;
			const newBusinessType =
				buissnessDetailsRes?.data?.data?.business_data?.businesstype;
			if (!!newBusinessType) dispatch(setBusinessType(newBusinessType));

			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						if (!doc?.requestId) return null;
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc?.requestId,
							doc_type_id:
								doc?.field?.doc_type?.[
									formState?.values?.[CONST.BUSINESS_TYPE_FIELD_NAME]
								],
							is_delete_not_allowed: true,
							// director_id: newDirectorId,
							// directorId: newDirectorId,
							preview: null,
							document_id: doc?.requestId, // temp doc id as this doc is non deletable
						});
						return null;
					});
					if (uploadCacheDocumentsTemp.length) {
						const uploadCacheDocumentsTempReqBody = {
							loan_id: newLoanId,
							request_ids_obj: uploadCacheDocumentsTemp,
							user_id: newCreatedByUserId,
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
						dispatch(
							addCacheDocuments({
								files: uploadCacheDocumentsTemp,
							})
						);
					}
				} catch (error) {
					console.error('error-', error);
				}
			}
			const newBuissnessDetails = {
				sectionId: selectedSectionId,
				sectionValues: {
					...formState.values,
				},
				businessType: formState?.values?.[CONST.BUSINESS_TYPE_FIELD_NAME],
			};
			// newBuissnessDetails.directorId = newDirectorId;
			newBuissnessDetails.cin =
				applicantCoApplicants?.companyRocData?.CIN || '';
			dispatch(updateApplicationSection(newBuissnessDetails));
			dispatch(
				setLoanIds({
					loanRefId: newLoanRefId,
					loanId: newLoanId,
					businessId: newBusinessId,
					businessUserId: newBusinessUserId,
					loanProductId: selectedLoanProductId,
					createdByUserId: newCreatedByUserId,
					borrowerUserId: newBorrowerUserId,
				})
			);
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-BuissnessDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
	};
	const handleGstSubmit = () => {
		setGstModalOpen(true);
	};
	const addCacheDocumentTemp = async file => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		newCacheDocumentTemp.push(file);
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};
	const removeCacheDocumentTemp = fieldName => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		if (
			cacheDocumentsTemp.filter(doc => doc?.field?.name === fieldName)?.length >
			0
		) {
			setCacheDocumentsTemp(
				newCacheDocumentTemp.filter(doc => doc?.field?.name !== fieldName)
			);
		} else {
			dispatch(
				removeCacheDocument({
					fieldName,
				})
			);
		}
	};

	// const prefilledEditOrViewLoanValues = field => {
	// 	if (field.type === 'file' && field.name === CONST.PAN_UPLOAD_FIELD_NAME) {
	// 		const panFile = getEditLoanDocuments({
	// 			documents: editLoanData?.loan_document,
	// 			directorId: selectedApplicant?.directorId,
	// 			docTypeId: field?.doc_type?.[selectedApplicant?.income_type],
	// 		});
	// 		return panFile[0];
	// 	}
	// 	const preData = {
	// 		existing_customer: selectedApplicant?.existing_customer,
	// 		pan_number: selectedApplicant?.dpancard,
	// 		customer_id: selectedApplicant?.customer_id,
	// 		buissness_name: selectedApplicant?.buissness_name,
	// 		buissness_type: selectedApplicant?.buissness_type,
	// 		business_vintage: selectedApplicant?.business_vintage,
	// 		gstin: selectedApplicant?.gstin,
	// 		annual: selectedApplicant?.annual,
	// 		buissness_mobile_number: selectedApplicant?.buissness_mobile_number,
	// 		buissness_email: selectedApplicant?.buissness_email,
	// 	};
	// 	return preData?.[field?.name];
	// };
	// console.log(selectedApplicant?.existing_customer)
	// const prefilledValues = field => {
	// 	try {
	// 		// [Priority - 0]
	// 		// view loan
	// 		// in view loan user cannot edit any information
	// 		// hence this is the first priority
	// 		// so always prepopulate value from <editLoanData>
	// 		if (isViewLoan) {
	// 			return prefilledEditOrViewLoanValues(field) || '';
	// 		}

	// 		// [Priority - 1]
	// 		// update value from form state
	// 		// whenever user decides to type or enter value
	// 		// form state should be the first value to prepopulate
	// 		const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
	// 		if (isFormStateUpdated) {
	// 			return formState?.values?.[field.name];
	// 		}

	// 		// TEST MODE
	// 		if (isTestMode && CONST.initialFormState?.[field?.name]) {
	// 			return CONST.initialFormState?.[field?.name];
	// 		}
	// 		// -- TEST MODE

	// 		// [Priority - Special]
	// 		// when director id is not created we prepopulate value from formstate only
	// 		// and last priority is to set default value <field.value> comming from JSON
	// 		if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
	// 			return formState?.values?.[field.name] || field.value || '';
	// 		}

	// 		// [Priority - 2]
	// 		// fetch data from redux slice
	// 		// this is to prefill value when user navigates backs
	// 		// once user press proceed and submit api success
	// 		// value is stored to redux and the same we can use to prepopulate
	// 		if (
	// 			Object.keys(selectedApplicant?.[selectedSectionId] || {}).length > 0
	// 		) {
	// 			return selectedApplicant?.[selectedSectionId]?.[field?.name];
	// 		}

	// 		// [Priority - 3]
	// 		// fetch value from edit loan
	// 		// this is to prefill value only once per section
	// 		// ex: if user visits this section for first time we prepopulate value from <editLoanData>
	// 		// and then when he moves to next section redux store will be ready with new updated values
	// 		let editViewLoanValue = '';

	// 		if (isEditLoan) {
	// 			editViewLoanValue = prefilledEditOrViewLoanValues(field);
	// 		}

	// 		if (editViewLoanValue) return editViewLoanValue;

	// 		// [Priority - 4]
	// 		// finally last priority is for JSON value
	// 		// this value will be always overwritten by other all priority
	// 		// this scenario will only come in loan creation first time entering form
	// 		// also we'll have fall back <''> empty value in case above all priority fails to prepopulate
	// 		return field?.value || '';
	// 	} catch (error) {
	// 		return {};
	// 	}
	// };

	const prefilledValues = field => {
		try {
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}

			const preData = {
				business_email: sectionData?.user_data?.email,
				email: sectionData?.business_details?.business_email,
				name: sectionData?.business_details?.first_name,
			};

			return (
				preData?.[field?.db_key] ||
				sectionData?.business_details?.[field?.db_key] ||
				sectionData?.loan_data?.[field?.db_key] ||
				sectionData?.user_data?.[field?.db_key]
			);
		} catch (err) {
			console.error('error-BusinessDetials', {
				error: err,
				res: err?.response?.data || '',
			});
		}
	};
	const validateToken = async () => {
		try {
			const params = queryString.parse(window.location.search);
			if (params?.token) {
				const decryptedToken = decryptRes(params?.token?.replaceAll(' ', '+'));

				if (decryptedToken?.token) {
					const isValidToken = await verifyUiUxToken(decryptedToken?.token);
					if (!isValidToken) {
						setIsTokenValid(false);
						return false;
					}
				} else {
					// if token coud not parse from url
					setIsTokenValid(false);
					return false;
				}
			}
		} catch (error) {
			console.error('error-validatetoken-', error);
			setIsTokenValid(false);
			return false;
		}
	};
	//Prepopulation after pan upload
	// console.log(companyRocData);
	// useEffect(() => {
	// 	validateToken();
	//   if(!!companyRocData){
	//     const prefilledValues=field=>{
	//       if (isTestMode && CONST.initialFormState?.[field?.name]) {
	//         return CONST.initialFormSta<te?.[field?.name];
	//       }
	//     }
	//   }
	// });
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			// const fetchRes = await axios.get(
			// 	`${API_END_POINT}/business_details?business_id=${businessId}&loan_id=${loanId}&doc_type_id=${
			// 		selectedPanUploadField?.doc_type?.[4]
			// 	}`
			// );
			// const fetchRes = await axios.get(
			// 	`${API_END_POINT}/business_details?loan_ref_id=${loanRefId}&doc_type_id=${
			// 		selectedPanUploadField?.doc_type?.[businessType]
			// 	}`
			// );
			const fetchRes = await axios.get(`${API_END_POINT}/business_details`, {
				params: {
					loan_ref_id: loanRefId,
					doc_type_id: businessType
						? selectedPanUploadField?.doc_type?.[businessType]
						: null,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				setSectionData(fetchRes?.data?.data);
				if (!businessType)
					dispatch(
						setBusinessType(fetchRes?.data?.business_details?.businesstype)
					);
				const panToGstRes = await axios.post(API.PAN_TO_GST, {
					pan: fetchRes?.data?.data?.business_details?.businesspancardnumber,
				});
				setGstin(panToGstRes);
			} else {
				setSectionData([]);
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			setFetchingSectionData(false);
		}
	};
	useEffect(() => {
		validateToken();
		if (
			!isEditLoan &&
			!isViewLoan &&
			completedSections?.includes(CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID)
		) {
			dispatch(
				setSelectedSectionId(CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID)
			);
		}
		//new get api
		if (!!businessId && !!loanId) fetchSectionDetails();
		//eslint-disable-next-line
	}, []);
	const ButtonProceed = (
		<Button
			fill
			name={`${isViewLoan ? 'Next' : 'Proceed'}`}
			isLoader={loading}
			disabled={loading}
			onClick={handleSubmit(() => {
				setIsIncomeTypeConfirmModalOpen(false);
				onProceed();
			})}
		/>
	);

	return (
		<UI_SECTIONS.Wrapper>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					<ConfirmModal
						type='Income'
						show={isIncomeTypeConfirmModalOpen}
						onClose={setIsIncomeTypeConfirmModalOpen}
						ButtonProceed={ButtonProceed}
					/>
					<Modal
						show={isGstModalOpen}
						onClose={() => {
							setGstModalOpen(false);
						}}
						// Width='40%'
						customStyle={{
							width: '45%',
							minWidth: 'fit-content',
							minHeight: 'auto',
						}}
					>
						<section>
							<UI.ImgClose
								onClick={() => {
									setGstModalOpen(false);
								}}
								src={imgClose}
								alt='close'
							/>
							<UI.TableHeader>
								<UI.TableColumn>Gstin</UI.TableColumn>
								<UI.TableColumn>State</UI.TableColumn>
								<UI.TableColumn>Status</UI.TableColumn>
							</UI.TableHeader>
							<UI.TableParentDiv>
								<UI.TableDataRowWrapper>
									{gst?.map((gstItem, idx) => {
										return (
											<UI.TableRow key={idx}>
												<UI.TableColumn>{gstItem.gstin}</UI.TableColumn>
												<UI.TableColumn>{gstItem.status}</UI.TableColumn>
												<UI.TableColumn>{gstItem.state_name}</UI.TableColumn>
											</UI.TableRow>
										);
									})}
								</UI.TableDataRowWrapper>
							</UI.TableParentDiv>
						</section>
					</Modal>
					{!isTokenValid && <SessionExpired show={!isTokenValid} />}
					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								{sub_section?.id === 'business_details' && (
									<Hint
										hint='Please upload the document with KYC image in Portrait Mode'
										hintIconName='Portrait Mode'
									/>
								)}
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.fields?.map((f, fieldIndex) => {
										const field = _.cloneDeep(f);
										// disable fields based on config starts
										// if (field?.hasOwnProperty('is_applicant')) {
										// 	if (field.is_applicant === false && isApplicant) {
										// 		return null;
										// 	}
										// }
										// if (field?.hasOwnProperty('is_co_applicant')) {
										// 	if (field.is_co_applicant === false && !isApplicant) {
										// 		return null;
										// 	}
										// }
										if (
											field.type === 'file' &&
											field.name === CONST.PAN_UPLOAD_FIELD_NAME
										) {
											let panErrorMessage =
												((formState?.submit?.isSubmited ||
													formState?.touched?.[field.name]) &&
													formState?.error?.[field.name]) ||
												'';
											const panErrorColorCode = CONST_SECTIONS.getExtractionFlagColorCode(
												panErrorMessage
											);
											panErrorMessage = panErrorMessage.replace(
												CONST_SECTIONS.EXTRACTION_FLAG_ERROR,
												''
											);
											panErrorMessage = panErrorMessage.replace(
												CONST_SECTIONS.EXTRACTION_FLAG_WARNING,
												''
											);
											panErrorMessage = panErrorMessage.includes(
												CONST_SECTIONS.EXTRACTION_FLAG_SUCCESS
											)
												? ''
												: panErrorMessage;

											// console.log('pancard-error-msg-', {
											// 	panErrorColorCode,
											// 	panErrorMessage,
											// });
											// console.log(gstin);
											return (
												<UI_SECTIONS.FieldWrapGrid
													key={`field-${fieldIndex}-${field.name}`}
												>
													<UI.ProfilePicWrapper>
														<PanUpload
															field={field}
															value={prefilledValues(field)}
															setGstin={setGstin}
															udyogAadhar={udyogAadhar}
															setUdyogAadhar={setUdyogAadhar}
															formState={formState}
															uploadedFile={
																panUploadedFile || tempPanUploadedFile
															}
															addCacheDocumentTemp={addCacheDocumentTemp}
															removeCacheDocumentTemp={removeCacheDocumentTemp}
															isPanNumberExist={isPanNumberExist}
															panErrorMessage={panErrorMessage}
															panErrorColorCode={panErrorColorCode}
															setErrorFormStateField={setErrorFormStateField}
															onChangeFormStateField={onChangeFormStateField}
															clearErrorFormState={clearErrorFormState}
															isDisabled={isViewLoan}
														/>

														{panErrorMessage && (
															<UI_SECTIONS.ErrorMessage
																borderColorCode={panErrorColorCode}
															>
																{panErrorMessage}
															</UI_SECTIONS.ErrorMessage>
														)}
													</UI.ProfilePicWrapper>
												</UI_SECTIONS.FieldWrapGrid>
											);
										}
										if (!field.visibility || !field.name || !field.type)
											return null;
										const newValue = prefilledValues(field);
										let newValueSelectFeild;
										if (!!field.sub_fields) {
											newValueSelectFeild = prefilledValues(
												field?.sub_fields[0]
											);
										}
										const customFieldProps = {};
										if (field?.name === CONST.MOBILE_NUMBER_FIELD_NAME) {
											customFieldProps.rules = {
												...field.rules,
												is_zero_not_allowed_for_first_digit: true,
											};
										}

										if (
											field?.name === CONST.GSTIN_FIELD_NAME &&
											gstin?.data?.data?.length > 0 &&
											!!gstin?.data?.data
										) {
											customFieldProps.type = 'disabledtextfieldmodal';
											customFieldProps.onClick = handleGstSubmit;
											customFieldProps.value = gst?.[0]?.gstin;
											customFieldProps.length = gst?.length;
										}
										if (
											isPanUploadMandatory &&
											!isPanNumberExist &&
											field?.name !== CONST.EXISTING_CUSTOMER_FIELD_NAME
										)
											customFieldProps.disabled = true;

										if (
											isPanUploadMandatory &&
											isPanNumberExist &&
											field.name === CONST.PAN_NUMBER_FIELD_NAME
										)
											customFieldProps.disabled = true;

										if (
											field?.name === CONST.UDYAM_NUMBER_FIELD_NAME &&
											formState?.values?.[CONST.UDYAM_NUMBER_FIELD_NAME] === ''
										) {
											return null;
										}
										if (
											field?.name === CONST.BUSINESS_TYPE_FIELD_NAME &&
											(isEditOrViewLoan || !!sections?.[selectedSectionId])
										) {
											customFieldProps.disabled = true;
										}
										// }
										// if (
										// 	selectedApplicant?.directorId &&
										// 	field.name === CONST.INCOME_TYPE_FIELD_NAME
										// )
										// 	customFieldProps.disabled = true;
										if (isViewLoan) {
											customFieldProps.disabled = true;
										}

										// if (
										// 	field?.name === 'udhyog_number' &&
										// 	(formState?.values?.['udhyog_number'] === '' ||
										// 		udyogAadhar === '')
										// ) {
										// 	return null;
										// }
										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${field.name}`}
											>
												<div
													style={{
														display: 'flex',
														gap: '10px',
														alignItems: 'center',
													}}
												>
													{field?.sub_fields &&
														field?.sub_fields[0].is_prefix &&
														register({
															...field.sub_fields[0],
															value: newValueSelectFeild,
															visibility: 'visible',
															...customFieldProps,
														})}
													<div
														style={{
															width: '100%',
														}}
													>
														{register({
															...field,
															value: newValue,
															visibility: 'visible',
															...customFieldProps,
														})}
													</div>
													{field?.sub_fields &&
														!field?.sub_fields[0].is_prefix &&
														register({
															...field.sub_fields[0],
															value: newValueSelectFeild,
															visibility: 'visible',
															...customFieldProps,
														})}
												</div>
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field?.name]) &&
													formState?.error?.[field?.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field?.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
												{(formState?.submit?.isSubmited ||
													formState?.touched?.[field?.sub_fields?.[0]?.name]) &&
													formState?.error?.[field?.sub_fields?.[0]?.name] && (
														<UI_SECTIONS.ErrorMessage>
															{formState?.error?.[field?.sub_fields[0]?.name]}
														</UI_SECTIONS.ErrorMessage>
													)}
											</UI_SECTIONS.FieldWrapGrid>
											//end
										);
									})}
								</UI_SECTIONS.FormWrapGrid>
							</Fragment>
						);
					})}
					<UI_SECTIONS.Footer>
						{!isViewLoan && (
							<Button
								fill
								name={'Save and Proceed'}
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									// director id will be present in case of aplicant / coapplicant if they move out of basic details page
									// so avoid opening income type popup at below condition
									if (isEditOrViewLoan) {
										onProceed();
										return;
									}
									setIsIncomeTypeConfirmModalOpen(true);
								})}
							/>
						)}
						{isViewLoan && (
							<>
								<Button name='Next' onClick={naviagteToNextSection} fill />
							</>
						)}
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};
export default BuissnessDetails;
