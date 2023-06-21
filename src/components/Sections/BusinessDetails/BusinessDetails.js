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
import {
	setIsDraftLoan,
	setLoginCreateUserRes,
	setSelectedSectionId,
} from 'store/appSlice';
import {
	setNewCompletedDirectorSections,
	getDirectors,
	// setSmeType,
} from 'store/directorsSlice';
import {
	setLoanIds,
	setCompletedApplicationSection,
	setBusinessType,
	setNewCompletedSections,
	setBusinessMobile,
	setBusinessName,
} from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getSelectedField,
	getAllCompletedSections,
} from 'utils/formatData';
import Loading from 'components/Loading';
import SessionExpired from 'components/modals/SessionExpired';
import { useToasts } from 'components/Toast/ToastProvider';
import { scrollToTopRootElement } from 'utils/helper';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';
import Modal from 'components/Modal';
import ROCBusinessDetailsModal from 'components/Sections/BusinessDetails/ROCBusinessDetailsModal/ROCBusinessDetailsModal';

const BusinessDetails = props => {
	const { app, application } = useSelector(state => state);
	// const { directors, selectedDirectorId } = useSelector(
	// 	state => state.directors
	// );
	// const selectedDirector = directors?.[selectedDirectorId] || {};
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
		// isDraftLoan,
		// editLoanDirectors,
		userDetails,
		isTestMode,
	} = app;
	const {
		borrowerUserId,
		businessUserId,
		// businessId,
		// loanId,
		businessType,
		loanRefId,
	} = application;
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const dispatch = useDispatch();
	const [sectionData, setSectionData] = useState({});
	const { addToast } = useToasts();
	const [udyogAadhar, setUdyogAadhar] = useState('');

	// eslint-disable-next-line
	const [udyogAadharStatus, setUdyogAadharStatus] = useState('');
	// eslint-disable-next-line
	// const [disableUdyamNumberInput, setdisableUdyamNumberInput] = useState('');

	const [loading, setLoading] = useState(false);
	const [isGstModalOpen, setGstModalOpen] = useState(false);
	const [
		isIncomeTypeConfirmModalOpen,
		setIsIncomeTypeConfirmModalOpen,
	] = useState(false);
	const [gstin, setGstin] = useState([]);
	const gst = gstin?.data?.data || [];
	const [isTokenValid, setIsTokenValid] = useState(true);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
	const [companyRocData, setCompanyRocData] = useState({});
	const [isPrefilEmail, setisPrefilEmail] = useState(true);
	const [isPrefilMobileNumber, setIsPrefilMobileNumber] = useState(true);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
		setErrorFormStateField,
	} = useForm();
	const completedSections = getAllCompletedSections({
		selectedProduct,
		application,
	});
	const selectedPanUploadField = getSelectedField({
		fieldName: CONST.PAN_UPLOAD_FIELD_NAME,
		selectedSection,
	});
	const selectedIncomeType =
		formState?.values?.[CONST.BUSINESS_TYPE_FIELD_NAME] || {};
	const isPanUploadMandatory = !!selectedPanUploadField?.rules?.required;
	const isPanNumberExist = !!formState?.values?.pan_number;
	const panUploadedFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME
		)?.[0] || null;
	const tempPanUploadedFile = !!sectionData?.loan_document
		? sectionData?.loan_document?.[0]
		: null;

	// format object to match the desired key_type in payload
	const formatObject = payloadObj => {
		return payloadObj?.map(obj => ({
			name: obj.Name,
			'din/pan': obj.Din,
			income_type: 'business', // default value to be set as Business for all the added directors in the SME Flow (based on the requirement)
		}));
	};

	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			const isTokenValid = await validateToken();
			if (isTokenValid === false) return;
			// call login craete user api only once while creating the loan
			// TODO: varun do not call this api when RM is creating loan
			let newBorrowerUserId = '';
			if (!isEditOrViewLoan && !borrowerUserId) {
				const loginCreateUserReqBody = {
					email: formState?.values?.email || '',
					white_label_id: whiteLabelId,
					source: API.APP_CLIENT,
					name: formState?.values?.first_name,
					mobileNo: formState?.values?.business_mobile_no,
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
			const selectedLoanProductId =
				selectedProduct?.product_id?.[selectedIncomeType] || '';

			const buissnessDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
				},
				app,
				// selectedDirector,
				application,
				selectedLoanProductId,
			});
			buissnessDetailsReqBody.borrower_user_id =
				newBorrowerUserId || businessUserId || borrowerUserId;

			buissnessDetailsReqBody.data.business_details.loan_document = [];
			if (!!companyRocData && Object.values(companyRocData)?.length > 0)
				buissnessDetailsReqBody.data.business_details.corporateid =
					companyRocData?.CIN;

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

			const newBusinessUserId =
				buissnessDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				buissnessDetailsRes?.data?.data?.loan_data?.createdUserId;
			const newBusinessType =
				buissnessDetailsRes?.data?.data?.business_data?.businesstype;
			const newBusinessMobile =
				buissnessDetailsRes?.data?.data?.business_data?.contactno;
			if (!!newBusinessType) {
				dispatch(setBusinessType(newBusinessType));
				// dispatch(setSmeType(newBusinessType));
			}
			if (!!newBusinessMobile) dispatch(setBusinessMobile(newBusinessMobile));
			const newBusinessName =
				buissnessDetailsRes?.data?.data?.business_data?.businessname;
			if (!!newBusinessName) dispatch(setBusinessName(newBusinessName));

			// add director starts

			if (
				!!companyRocData &&
				Object.values(companyRocData)?.length > 0 &&
				!isEditLoan &&
				!isViewLoan &&
				!completedSections?.includes(selectedSectionId)
			) {
				try {
					const addDirectorsReqBody = formatSectionReqBody({
						section: selectedSection,
						values: {},
						app,
						// selectedDirector,
						application,
						selectedLoanProductId,
					});

					companyRocData?.data?.director?.map(dir => {
						dir.income_type = 'business'; // default value to be set as Business for all the added directors in the SME Flow (based on the requirement)
						return null;
					});
					addDirectorsReqBody.data =
						companyRocData?.data?.director ||
						formatObject(companyRocData?.directorsForShow);
					addDirectorsReqBody.business_id = newBusinessId;
					addDirectorsReqBody.loan_id = newLoanId;
					axios.post(API.ADD_MULTIPLE_DIRECTOR, addDirectorsReqBody);
				} catch (error) {
					console.error(error);
				}
			}
			// add director ends

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
			newBuissnessDetails.cin = companyRocData?.CIN || '';
			dispatch(setCompletedApplicationSection(selectedSectionId));
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
			console.error('error-BusinessDetails-onProceed-', {
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
		}
	};

	const prefilledValues = field => {
		try {
			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.db_key]) {
				return CONST.initialFormState?.[field?.db_key];
			}
			// -- TEST MODE
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field?.name];
			}

			const preData = {
				...sectionData?.business_details,
				...sectionData?.loan_data,
				...sectionData?.user_data,
				business_email: sectionData?.user_data?.email,
				email: sectionData?.business_details?.business_email,
				name: sectionData?.business_details?.first_name,
			};

			return preData?.[field?.db_key];
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
	function handleBlurEmail(e) {
		// console.log("input blurred",e);
		setisPrefilEmail(false);
		// console.log(e);
	}
	function handleBlurMobileNumber(e) {
		setIsPrefilMobileNumber(false);
	}
	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);

			const fetchRes = await axios.get(`${API_END_POINT}/business_details`, {
				params: {
					loan_ref_id: loanRefId,
				},
			});
			if (fetchRes?.data?.status === 'ok') {
				dispatch(
					setBusinessName(fetchRes?.data?.data?.business_details?.businessname)
				);
				setSectionData(fetchRes?.data?.data);
				if (fetchRes?.data?.data?.business_details?.udyam_number) {
					setUdyogAadhar(fetchRes?.data?.data?.business_details?.udyam_number);
				}
				// setUdyogAadhar('UDYAM-MH-19-0002476');
				if (fetchRes?.data?.data?.business_details?.udyam_response) {
					setUdyogAadharStatus(
						fetchRes?.data?.data?.business_details?.udyam_response
					);
				}

				if (
					!!fetchRes?.data?.data?.company_master_data
					// Object.values(fetchRes?.data?.data?.company_master_data)?.length > 0
				)
					setCompanyRocData(
						JSON.parse(fetchRes?.data?.data?.company_master_data?.OUTPUT_JSON)
					);
				if (!businessType)
					{
						dispatch(
						setBusinessType(
							fetchRes?.data?.data?.business_details?.businesstype
						)
					);
					// dispatch(setSmeType(fetchRes?.data?.data?.business_details?.businesstype));
				}
				if (isEditOrViewLoan) {
					dispatch(
						getDirectors({
							loanRefId,
							isSelectedProductTypeBusiness:
								selectedProduct?.isSelectedProductTypeBusiness,
							selectedSectionId,
						})
					);
					const responseData = fetchRes?.data?.data;
					dispatch(
						setLoanIds({
							loanId: responseData?.loan_data?.id,
							businessId:
								responseData?.business_details?.id ||
								responseData?.loan_data?.business_id?.id,
							businessUserId: fetchRes?.data?.data?.business_details?.userid,
							loanProductId: fetchRes?.data?.data?.loan_data?.loan_product_id,
							createdByUserId: fetchRes?.data?.data?.loan_data?.createdUserId,
						})
					);

					// update completed sections
					const tempCompletedSections = JSON.parse(
						fetchRes?.data?.data?.trackData?.[0]?.onboarding_track
					);
					dispatch(
						setNewCompletedSections(tempCompletedSections?.loan_details)
					);
					if (
						!tempCompletedSections?.loan_details?.includes(
							CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID
						)
					) {
						dispatch(setIsDraftLoan(true));
					}
					dispatch(
						setNewCompletedDirectorSections(
							tempCompletedSections?.director_details
						)
					);
					// console.log({ tempCompletedSections });
				}

				const panToGstRes = await axios.post(API.PAN_TO_GST, {
					pan: fetchRes?.data?.data?.business_details?.businesspancardnumber,
				});
				setGstin(panToGstRes);
			} else {
				setSectionData({});
			}
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
		} finally {
			setFetchingSectionData(false);
		}
	};
	useEffect(() => {
		scrollToTopRootElement();
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
		if (loanRefId) fetchSectionDetails();
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
				onSaveAndProceed();
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
						type='Business'
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
												<UI.TableColumn>{gstItem.state_name}</UI.TableColumn>
												<UI.TableColumn>{gstItem.status}</UI.TableColumn>
											</UI.TableRow>
										);
									})}
								</UI.TableDataRowWrapper>
							</UI.TableParentDiv>
						</section>
					</Modal>

					<ROCBusinessDetailsModal
						show={isBusinessModalOpen}
						onClose={() => {
							setIsBusinessModalOpen(false);
						}}
						companyDetails={companyRocData}
						id={{
							udyogAadhar,
							pan: formState?.values?.[CONST.PAN_NUMBER_FIELD_NAME],
						}}
					/>
					{!isTokenValid && <SessionExpired show={!isTokenValid} />}
					{/* {console.log(formState.values.email)}; */}
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
									{sub_section?.fields?.map((field, fieldIndex) => {
										// const field = _.cloneDeep(f);
										if (field?.for_type_name) {
											if (
												!field?.for_type.includes(
													formState?.values?.[field?.for_type_name]
												)
											)
												return false;
										}
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
															isDisabled={
																isEditOrViewLoan ||
																completedSections?.includes(selectedSectionId)
															}
															setCompanyRocData={setCompanyRocData}
															completedSections={completedSections}
															// setdisableUdyamNumberInput={
															// 	setdisableUdyamNumberInput
															// }
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
										if (
											field?.visibility === false ||
											!field?.name ||
											!field?.type
										)
											return null;
										const newValue = prefilledValues(field);
										let newValueSelectField;
										if (!!field.sub_fields) {
											newValueSelectField = prefilledValues(
												field?.sub_fields[0]
											);
										}
										const customFieldProps = {};
										if (
											field?.name === CONST.BUSINESS_MOBILE_NUMBER_FIELD_NAME
										) {
											customFieldProps.rules = {
												...field.rules,
												is_zero_not_allowed_for_first_digit: true,
											};
										}
										if (
											(field?.name === CONST.BUSINESS_EMAIL_FIELD ||
												field?.name ===
													CONST.BUSINESS_MOBILE_NUMBER_FIELD_NAME) &&
											(isEditOrViewLoan ||
												completedSections?.includes(selectedSectionId))
										) {
											customFieldProps.disabled = true;
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
										) {
											customFieldProps.disabled = true;
										}

										if (
											isPanUploadMandatory &&
											isPanNumberExist &&
											field.name === CONST.PAN_NUMBER_FIELD_NAME
										) {
											customFieldProps.disabled = true;
										}

										// TODO: to be fix properly
										// no use of set state inside return statement
										// if (field?.name === CONST.UDYAM_NUMBER_FIELD_NAME) {
										// 	if (
										// 		disableUdyamNumberInput
										// 		// !formState?.values?.[CONST.UDYAM_NUMBER_FIELD_NAME] &&
										// 		//!udyogAadhar &&
										// 		//!udyogAadharStatus
										// 	) {
										// 		customFieldProps.disabled = disableUdyamNumberInput;
										// 		//console.log('udyamstatusnotnull');
										// 		setdisableUdyamNumberInput('');
										// 		return null;
										// 	}

										// 	if (!udyogAadhar && !udyogAadharStatus) {
										// 		customFieldProps.disabled = false;
										// 	} else customFieldProps.disabled = true;
										// }

										if (field?.name === CONST.UDYAM_NUMBER_FIELD_NAME) {
											if (sectionData?.business_details?.udyam_number && sectionData?.business_details?.udyam_response)
												customFieldProps.disabled = true;
										}

										if (
											field?.name === CONST.BUSINESS_TYPE_FIELD_NAME &&
											(isEditOrViewLoan ||
												completedSections?.includes(selectedSectionId))
										) {
											customFieldProps.disabled = true;
										}

										if (isViewLoan) {
											customFieldProps.disabled = true;
										}
										if (field.name === CONST.BUSINESS_EMAIL_FIELD) {
											// console.log("Contact")
											customFieldProps.onblur = handleBlurEmail;
										}
										if (field.name === CONST.CONTACT_EMAIL_FIELD) {
											customFieldProps.onFocus = handleBlurEmail;

											if (
												isPrefilEmail &&
												!isEditOrViewLoan &&
												!completedSections?.includes(selectedSectionId)
											) {
												// console.log(formState?.values?.email);
												customFieldProps.value = formState.values.email;
											}
											// customFieldProps.value=formState.values.email
										}
										if (
											field.name === CONST.BUSINESS_MOBILE_NUMBER_FIELD_NAME
										) {
											customFieldProps.onblur = handleBlurMobileNumber;
										}
										if (field.name === CONST.MOBILE_NUMBER_FIELD_NAME) {
											customFieldProps.onFocus = handleBlurMobileNumber;
											if (
												isPrefilMobileNumber &&
												!isEditOrViewLoan &&
												!completedSections?.includes(selectedSectionId)
											) {
												customFieldProps.value =
													formState.values.business_mobile_no;
											}
										}

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
															value: newValueSelectField,
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
															value: newValueSelectField,
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
						{/* {console.log({
							companyRocData,
							sectionData,
							loanId,
							businessId,
							loanRefId,
						})} */}
						{!!companyRocData && Object.values(companyRocData)?.length > 0 && (
							<Button
								name={'Business Details'}
								onClick={() => {
									setIsBusinessModalOpen(true);
								}}
							/>
						)}
						{!isViewLoan && (
							<Button
								fill
								name={'Save and Proceed'}
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									if (
										isEditOrViewLoan ||
										completedSections?.includes(selectedSectionId)
									) {
										onSaveAndProceed();
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
export default BusinessDetails;
