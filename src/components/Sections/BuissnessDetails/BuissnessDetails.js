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
import './styles.css';

import {
	setLoginCreateUserRes,
	toggleTestMode,
	setSelectedSectionId,
} from 'store/appSlice';
import {
	updateApplicantSection,
	updateCoApplicantSection,
	// addCacheDocuments,
	removeCacheDocument,
	setSelectedApplicantCoApplicantId,
} from 'store/applicantCoApplicantsSlice';
import { addCacheDocuments, setLoanIds } from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getEditLoanLoanDocuments,
	getSelectedField,
} from 'utils/formatData';

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
																		const {
																			app,
																			applicantCoApplicants,
																			application,
																		} = useSelector(
																			state =>
																				state
																		);
																		const {
																			selectedProduct,
																			selectedSectionId,
																			nextSectionId,
																			isTestMode,
																			selectedSection,
																			whiteLabelId,
																			clientToken,
																			userToken,
																			isLocalhost,
																			isViewLoan,
																			isEditLoan,
																			isEditOrViewLoan,
																			editLoanData,
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
																			: coApplicants?.[
																					selectedApplicantCoApplicantId
																			  ] ||
																			  {};
																		const {
																			directorId,
																		} = selectedApplicant;
																		const {
																			cacheDocuments,
																			borrowerUserId,
																			businessUserId,
																		} = application;
																		const naviagteToNextSection = () => {
																			dispatch(
																				setSelectedSectionId(
																					nextSectionId
																				)
																			);
																		};

																		const dispatch = useDispatch();
																		// const [sectionData, setSectionData] = useState([]);
																		// const [FetchSectionData, setFetchingSectionData] = useState(false);
																		const {
																			addToast,
																		} = useToasts();
																		const [
																			udyogAadhar,
																			setUdyogAadhar,
																		] = useState(
																			''
																		);
																		const [
																			loading,
																			setLoading,
																		] = useState(
																			false
																		);
																		const [
																			isGstModalOpen,
																			setGstModalOpen,
																		] = useState(
																			false
																		);
																		// const [fetchingAddress, setFetchingAddress] = useState(false);
																		const [
																			isIncomeTypeConfirmModalOpen,
																			setIsIncomeTypeConfirmModalOpen,
																		] = useState(
																			false
																		);
																		const [
																			gstin,
																			setGstin,
																		] = useState(
																			[]
																		);
																		const [
																			isTokenValid,
																			setIsTokenValid,
																		] = useState(
																			true
																		);
																		const [
																			cacheDocumentsTemp,
																			setCacheDocumentsTemp,
																		] = useState(
																			[]
																		);
																		const {
																			handleSubmit,
																			register,
																			formState,
																			onChangeFormStateField,
																			clearErrorFormState,
																			setErrorFormStateField,
																		} = useForm();
																		const selectedIncomeType =
																			formState
																				?.values?.[
																				CONST
																					.INCOME_TYPE_FIELD_NAME
																			];
																		const completedSections = getCompletedSections(
																			{
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
																			}
																		);
																		const selectedPanUploadField = getSelectedField(
																			{
																				fieldName:
																					CONST.PAN_UPLOAD_FIELD_NAME,
																				selectedSection,
																				isApplicant,
																			}
																		);
																		const isPanUploadMandatory = !!selectedPanUploadField
																			?.rules
																			?.required;
																		const panUploadedFile =
																			cacheDocumentsTemp?.filter(
																				doc =>
																					doc
																						?.field
																						?.name ===
																					CONST.PAN_UPLOAD_FIELD_NAME
																			)?.[0] ||
																			cacheDocuments?.filter(
																				doc =>
																					`${
																						doc?.directorId
																					}` ===
																						`${directorId}` &&
																					(doc?.is_delete_not_allowed ===
																						'true' ||
																						doc?.is_delete_not_allowed ===
																							true) &&
																					doc?.doc_type_id ===
																						selectedPanUploadField
																							?.doc_type?.[
																							selectedIncomeType
																						]
																			)?.[0] ||
																			null;
																		const isPanNumberExist = !!formState
																			.values
																			.pan_number;
																		const onProceed = async () => {
																			try {
																				setLoading(
																					true
																				);
																				const isTokenValid = await validateToken();
																				if (
																					isTokenValid ===
																					false
																				)
																					return;
																				// call login api only once
																				// TODO: varun do not call this api when RM is creating loan
																				let newBorrowerUserId =
																					'';
																				if (
																					!isEditOrViewLoan &&
																					!borrowerUserId
																				) {
																					const loginCreateUserReqBody = {
																						email:
																							formState
																								?.values
																								?.email ||
																							'',
																						white_label_id: whiteLabelId,
																						source:
																							API.APP_CLIENT,
																						name:
																							formState
																								?.values
																								?.first_name,
																						mobileNo:
																							formState
																								?.values
																								?.mobile_no,
																						addrr1:
																							'',
																						addrr2:
																							'',
																					};
																					if (
																						!!userDetails?.id
																					) {
																						loginCreateUserReqBody.user_id =
																							userDetails?.id;
																					}
																					const newLoginCreateUserRes = await axios.post(
																						`${
																							API.LOGIN_CREATEUSER
																						}`,
																						loginCreateUserReqBody
																					);
																					dispatch(
																						setLoginCreateUserRes(
																							newLoginCreateUserRes?.data
																						)
																					);
																					newBorrowerUserId =
																						newLoginCreateUserRes
																							?.data
																							?.userId;
																					// first priority is to set existing user token which is comming from ui-ux
																					// create user is for creating users bucket and generating borrower_user_id so that all the document can be stored inside users bucket
																					axios.defaults.headers.Authorization = `Bearer ${userToken ||
																						newLoginCreateUserRes
																							?.data
																							?.token}`;
																				} else {
																					axios.defaults.headers.Authorization = `Bearer ${userToken}`;
																				}

																				// loan product is is only applicable for applicant
																				// it should not be overritten when coapplicant is income type is different then applicant
																				let selectedLoanProductId =
																					'';
																				if (
																					isApplicant
																				) {
																					selectedLoanProductId =
																						selectedProduct
																							?.product_id?.[
																							selectedIncomeType
																						];
																				}
																				const buissnessDetailsReqBody = formatSectionReqBody(
																					{
																						section: selectedSection,
																						values: {
																							...formState.values,
																						},
																						app,
																						applicantCoApplicants,
																						application,
																						selectedLoanProductId,
																					}
																				);
																				buissnessDetailsReqBody.borrower_user_id =
																					newBorrowerUserId ||
																					businessUserId;

																				// const buissnesscDetailsRes = await axios.post(
																				// 	`${API.API_END_POINT}/basic_details`, // need to be changed
																				// 	buissnessDetailsReqBody
																				// );
																				const buissnesscDetailsRes = 0;
																				const newLoanRefId =
																					buissnesscDetailsRes
																						?.data
																						?.data
																						?.loan_data
																						?.loan_ref_id;
																				const newLoanId =
																					buissnesscDetailsRes
																						?.data
																						?.data
																						?.loan_data
																						?.id;
																				const newBusinessId =
																					buissnesscDetailsRes
																						?.data
																						?.data
																						?.business_data
																						?.id;
																				const newDirectorId =
																					buissnesscDetailsRes
																						?.data
																						?.data
																						?.director_details
																						?.id;
																				const newBusinessUserId =
																					buissnesscDetailsRes
																						?.data
																						?.data
																						?.business_data
																						?.userid;
																				const newCreatedByUserId =
																					buissnesscDetailsRes
																						?.data
																						?.data
																						?.loan_data
																						?.createdUserId;
																				if (
																					cacheDocumentsTemp.length >
																					0
																				) {
																					try {
																						const uploadCacheDocumentsTemp = [];
																						cacheDocumentsTemp.map(
																							doc => {
																								if (
																									!doc?.requestId
																								)
																									return null;
																								uploadCacheDocumentsTemp.push(
																									{
																										...doc,
																										request_id:
																											doc?.requestId,
																										doc_type_id:
																											doc
																												?.field
																												?.doc_type?.[
																												selectedIncomeType
																											],
																										is_delete_not_allowed: true,
																										director_id: newDirectorId,
																										directorId: newDirectorId,
																										preview: null,
																										document_id:
																											doc?.requestId, // temp doc id as this doc is non deletable
																									}
																								);
																								return null;
																							}
																						);
																						if (
																							uploadCacheDocumentsTemp.length
																						) {
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
																								addCacheDocuments(
																									{
																										files: uploadCacheDocumentsTemp,
																									}
																								)
																							);
																						}
																					} catch (error) {
																						console.error(
																							'error-',
																							error
																						);
																					}
																				}

																				const newBuissnessDetails = {
																					sectionId: selectedSectionId,
																					sectionValues: {
																						...formState.values,
																					},
																				};
																				newBuissnessDetails.directorId = newDirectorId;
																				newBuissnessDetails.cin =
																					applicantCoApplicants
																						?.companyRocData
																						?.CIN ||
																					'';
																				if (
																					isApplicant
																				) {
																					dispatch(
																						updateApplicantSection(
																							newBuissnessDetails
																						)
																					);
																				} else {
																					dispatch(
																						updateCoApplicantSection(
																							newBuissnessDetails
																						)
																					);
																					dispatch(
																						setSelectedApplicantCoApplicantId(
																							newDirectorId
																						)
																					);
																				}
																				dispatch(
																					setLoanIds(
																						{
																							loanRefId: newLoanRefId,
																							loanId: newLoanId,
																							businessId: newBusinessId,
																							businessUserId: newBusinessUserId,
																							loanProductId: selectedLoanProductId,
																							createdByUserId: newCreatedByUserId,
																							borrowerUserId: newBorrowerUserId,
																						}
																					)
																				);
																				dispatch(
																					setSelectedSectionId(
																						nextSectionId
																					)
																				);
																			} catch (error) {
																				console.error(
																					'error-BuissnessDetails-onProceed-',
																					{
																						error: error,
																						res:
																							error?.response,
																						resres:
																							error
																								?.response
																								?.response,
																						resData:
																							error
																								?.response
																								?.data,
																					}
																				);
																				addToast(
																					{
																						message: getApiErrorMessage(
																							error
																						),
																						type:
																							'error',
																					}
																				);
																			} finally {
																				setLoading(
																					false
																				);
																			}
																		};
																		const handleGstSubmit = () => {
																			setGstModalOpen(
																				true
																			);
																		};
																		const addCacheDocumentTemp = async file => {
																			const newCacheDocumentTemp = _.cloneDeep(
																				cacheDocumentsTemp
																			);
																			newCacheDocumentTemp.push(
																				file
																			);
																			setCacheDocumentsTemp(
																				newCacheDocumentTemp
																			);
																		};
																		const removeCacheDocumentTemp = fieldName => {
																			// console.log('removeCacheDocumentTemp-', { fieldName, cacheDocumentsTemp });
																			const newCacheDocumentTemp = _.cloneDeep(
																				cacheDocumentsTemp
																			);
																			if (
																				cacheDocumentsTemp.filter(
																					doc =>
																						doc
																							?.field
																							?.name ===
																						fieldName
																				)
																					?.length >
																				0
																			) {
																				setCacheDocumentsTemp(
																					newCacheDocumentTemp.filter(
																						doc =>
																							doc
																								?.field
																								?.name !==
																							fieldName
																					)
																				);
																			} else {
																				dispatch(
																					removeCacheDocument(
																						{
																							fieldName,
																						}
																					)
																				);
																			}
																		};
																		const prefilledEditOrViewLoanValues = field => {
																			if (
																				field.type ===
																					'file' &&
																				field.name ===
																					CONST.PAN_UPLOAD_FIELD_NAME
																			) {
																				const panFile = getEditLoanLoanDocuments(
																					{
																						documents:
																							editLoanData?.loan_document,
																						directorId:
																							selectedApplicant?.directorId,
																						docTypeId:
																							field
																								?.doc_type?.[
																								selectedApplicant
																									?.income_type
																							],
																					}
																				);
																				return panFile[0];
																			}
																			const preData = {
																				existing_customer:
																					selectedApplicant?.existing_customer,
																				pan_number:
																					selectedApplicant?.dpancard,
																				customer_id:
																					selectedApplicant?.customer_id,
																				buissness_name:
																					selectedApplicant?.buissness_name,
																				buissness_type:
																					selectedApplicant?.buissness_type,
																				business_vintage:
																					selectedApplicant?.business_vintage,
																				gstin:
																					selectedApplicant?.gstin,
																				annual:
																					selectedApplicant?.annual,
																				buissness_mobile_number:
																					selectedApplicant?.buissness_mobile_number,
																				buissness_email:
																					selectedApplicant?.buissness_email,
																			};
																			return preData?.[
																				field
																					?.name
																			];
																		};
																		const fetchSectinDetails = async () => {};
																		// console.log(selectedApplicant?.existing_customer)
																		const prefilledValues = field => {
																			try {
																				// [Priority - 0]
																				// view loan
																				// in view loan user cannot edit any information
																				// hence this is the first priority
																				// so always prepopulate value from <editLoanData>
																				if (
																					isViewLoan
																				) {
																					return (
																						prefilledEditOrViewLoanValues(
																							field
																						) ||
																						''
																					);
																				}

																				// [Priority - 1]
																				// update value from form state
																				// whenever user decides to type or enter value
																				// form state should be the first value to prepopulate
																				const isFormStateUpdated =
																					formState
																						?.values?.[
																						field
																							.name
																					] !==
																					undefined;
																				if (
																					isFormStateUpdated
																				) {
																					return formState
																						?.values?.[
																						field
																							.name
																					];
																				}

																				// TEST MODE
																				if (
																					isTestMode &&
																					CONST
																						.initialFormState?.[
																						field
																							?.name
																					]
																				) {
																					return CONST
																						.initialFormState?.[
																						field
																							?.name
																					];
																				}
																				// -- TEST MODE

																				// [Priority - Special]
																				// special case when co-applicant is filling basic details for first time
																				// when director id is not created we prepopulate value from formstate only
																				// and last priority is to set default value <field.value> comming from JSON
																				if (
																					selectedApplicantCoApplicantId ===
																					CONST_SECTIONS.CO_APPLICANT
																				) {
																					return (
																						formState
																							?.values?.[
																							field
																								.name
																						] ||
																						field.value ||
																						''
																					);
																				}

																				// [Priority - 2]
																				// fetch data from redux slice
																				// this is to prefill value when user navigates backs
																				// once user press proceed and submit api success
																				// value is stored to redux and the same we can use to prepopulate
																				if (
																					Object.keys(
																						selectedApplicant?.[
																							selectedSectionId
																						] ||
																							{}
																					)
																						.length >
																					0
																				) {
																					return selectedApplicant?.[
																						selectedSectionId
																					]?.[
																						field
																							?.name
																					];
																				}

																				// [Priority - 3]
																				// fetch value from edit loan
																				// this is to prefill value only once per section
																				// ex: if user visits this section for first time we prepopulate value from <editLoanData>
																				// and then when he moves to next section redux store will be ready with new updated values
																				let editViewLoanValue =
																					'';

																				if (
																					isEditLoan
																				) {
																					editViewLoanValue = prefilledEditOrViewLoanValues(
																						field
																					);
																				}

																				if (
																					editViewLoanValue
																				)
																					return editViewLoanValue;

																				// [Priority - 4]
																				// finally last priority is for JSON value
																				// this value will be always overwritten by other all priority
																				// this scenario will only come in loan creation first time entering form
																				// also we'll have fall back <''> empty value in case above all priority fails to prepopulate
																				return (
																					field?.value ||
																					''
																				);
																			} catch (error) {
																				return {};
																			}
																		};
																		const validateToken = async () => {
																			try {
																				const params = queryString.parse(
																					window
																						.location
																						.search
																				);
																				if (
																					params?.token
																				) {
																					const decryptedToken = decryptRes(
																						params?.token?.replaceAll(
																							' ',
																							'+'
																						)
																					);

																					if (
																						decryptedToken?.token
																					) {
																						const isValidToken = await verifyUiUxToken(
																							decryptedToken?.token
																						);
																						if (
																							!isValidToken
																						) {
																							setIsTokenValid(
																								false
																							);
																							return false;
																						}
																					} else {
																						// if token coud not parse from url
																						setIsTokenValid(
																							false
																						);
																						return false;
																					}
																				}
																			} catch (error) {
																				console.error(
																					'error-validatetoken-',
																					error
																				);
																				setIsTokenValid(
																					false
																				);
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
																		//         return CONST.initialFormState?.[field?.name];
																		//       }
																		//     }
																		//   }
																		// });
																		useEffect(() => {
																			validateToken();
																			if (
																				!isEditLoan &&
																				!isViewLoan &&
																				completedSections?.includes(
																					CONST_SECTIONS.DOCUMENT_UPLOAD_SECTION_ID
																				)
																			) {
																				dispatch(
																					setSelectedSectionId(
																						CONST_SECTIONS.APPLICATION_SUBMITTED_SECTION_ID
																					)
																				);
																			}
																			//eslint-disable-next-line
																		}, []);
																		const ButtonProceed = (
																			<Button
																				fill
																				name={`${
																					isViewLoan
																						? 'Next'
																						: 'Proceed'
																				}`}
																				isLoader={
																					loading
																				}
																				disabled={
																					loading
																				}
																				onClick={handleSubmit(
																					() => {
																						setIsIncomeTypeConfirmModalOpen(
																							false
																						);
																						onProceed();
																					}
																				)}
																			/>
																		);

																		return (
																			<UI_SECTIONS.Wrapper>
																				<ConfirmModal
																					type='Income'
																					show={
																						isIncomeTypeConfirmModalOpen
																					}
																					onClose={
																						setIsIncomeTypeConfirmModalOpen
																					}
																					ButtonProceed={
																						ButtonProceed
																					}
																				/>
																				<Modal
																					show={
																						isGstModalOpen
																					}
																					onClose={() => {
																						setGstModalOpen(
																							false
																						);
																					}}
																					// Width='40%'
																					customStyle={{
																						width:
																							'30%',
																						minWidth:
																							'fit-content',
																						minHeight:
																							'auto',
																					}}
																				>
																					<section>
																						<UI.ImgClose
																							onClick={() => {
																								setGstModalOpen(
																									false
																								);
																							}}
																							src={
																								imgClose
																							}
																							alt='close'
																						/>
																						<UI.TableParentDiv>
																							<UI.TableHeader>
																								<UI.TableCollumns>
																									Gstin
																								</UI.TableCollumns>
																								<UI.TableCollumns>
																									State
																								</UI.TableCollumns>
																								<UI.TableCollumns>
																									Status
																								</UI.TableCollumns>
																							</UI.TableHeader>
																							<UI.TableRow>
																								{gstin?.map(
																									(
																										gstItem,
																										idx
																									) => {
																										// console.log(gstItem, '------------->');
																										return (
																											<div
																												className='data-row'
																												key={
																													idx
																												}
																											>
																												<UI.TableCollumns>
																													{
																														gstItem.gstin
																													}
																												</UI.TableCollumns>
																												<UI.TableCollumns>
																													{
																														gstItem.status
																													}
																												</UI.TableCollumns>
																												<UI.TableCollumns>
																													{
																														gstItem.state_name
																													}
																												</UI.TableCollumns>
																											</div>
																										);
																									}
																								)}
																							</UI.TableRow>
																						</UI.TableParentDiv>
																					</section>
																				</Modal>
																				{!isTokenValid && (
																					<SessionExpired
																						show={
																							!isTokenValid
																						}
																					/>
																				)}
																				{selectedSection?.sub_sections?.map(
																					(
																						sub_section,
																						sectionIndex
																					) => {
																						return (
																							<Fragment
																								key={`section-${sectionIndex}-${
																									sub_section?.id
																								}`}
																							>
																								{sub_section?.name ? (
																									<UI_SECTIONS.SubSectionHeader>
																										{
																											sub_section.name
																										}
																									</UI_SECTIONS.SubSectionHeader>
																								) : null}
																								<Hint
																									hint='Please upload the document with KYC image in Portrait Mode'
																									hintIconName='Portrait Mode'
																								/>
																								<UI_SECTIONS.FormWrapGrid>
																									{sub_section?.fields?.map(
																										(
																											field,
																											fieldIndex
																										) => {
																											// disable fields based on config starts
																											if (
																												field?.hasOwnProperty(
																													'is_applicant'
																												)
																											) {
																												if (
																													field.is_applicant ===
																														false &&
																													isApplicant
																												) {
																													return null;
																												}
																											}
																											if (
																												field?.hasOwnProperty(
																													'is_co_applicant'
																												)
																											) {
																												if (
																													field.is_co_applicant ===
																														false &&
																													!isApplicant
																												) {
																													return null;
																												}
																											}
																											if (
																												field.type ===
																													'file' &&
																												field.name ===
																													CONST.PAN_UPLOAD_FIELD_NAME
																											) {
																												let panErrorMessage =
																													((formState
																														?.submit
																														?.isSubmited ||
																														formState
																															?.touched?.[
																															field
																																.name
																														]) &&
																														formState
																															?.error?.[
																															field
																																.name
																														]) ||
																													'';
																												// console.log('pancard-error-msg-', {
																												// 	panErrorMessage,
																												// });
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
																														key={`field-${fieldIndex}-${
																															field.name
																														}`}
																													>
																														<UI.ProfilePicWrapper>
																															<PanUpload
																																field={
																																	field
																																}
																																value={prefilledValues(
																																	field
																																)}
																																setGstin={
																																	setGstin
																																}
																																udyogAadhar={
																																	udyogAadhar
																																}
																																setUdyogAadhar={
																																	setUdyogAadhar
																																}
																																formState={
																																	formState
																																}
																																uploadedFile={
																																	panUploadedFile
																																}
																																addCacheDocumentTemp={
																																	addCacheDocumentTemp
																																}
																																removeCacheDocumentTemp={
																																	removeCacheDocumentTemp
																																}
																																isPanNumberExist={
																																	isPanNumberExist
																																}
																																panErrorMessage={
																																	panErrorMessage
																																}
																																panErrorColorCode={
																																	panErrorColorCode
																																}
																																setErrorFormStateField={
																																	setErrorFormStateField
																																}
																																onChangeFormStateField={
																																	onChangeFormStateField
																																}
																																clearErrorFormState={
																																	clearErrorFormState
																																}
																																isDisabled={
																																	isViewLoan
																																}
																															/>

																															{panErrorMessage && (
																																<UI_SECTIONS.ErrorMessage
																																	borderColorCode={
																																		panErrorColorCode
																																	}
																																>
																																	{
																																		panErrorMessage
																																	}
																																</UI_SECTIONS.ErrorMessage>
																															)}
																														</UI.ProfilePicWrapper>
																													</UI_SECTIONS.FieldWrapGrid>
																												);
																											}
																											if (
																												!field.visibility ||
																												!field.name ||
																												!field.type
																											)
																												return null;
																											const newValue = prefilledValues(
																												field
																											);
																											let newValueSelectFeild;
																											if (
																												!!field.sub_fields
																											) {
																												newValueSelectFeild = prefilledValues(
																													field
																														?.sub_fields[0]
																												);
																											}
																											const customFieldProps = {};
																											if (
																												field?.name ===
																												CONST.MOBILE_NUMBER_FIELD_NAME
																											) {
																												customFieldProps.rules = {
																													...field.rules,
																													is_zero_not_allowed_for_first_digit: true,
																												};
																											}
																											// const gstin = companyRocData?.unformatedData?.gstin;
																											if (
																												field?.name ===
																													'gstin' &&
																												!!gstin
																											) {
																												customFieldProps.type =
																													'disabledtextfieldmodal';
																												customFieldProps.onClick = handleGstSubmit;
																												customFieldProps.value =
																													gstin?.[0]?.gstin;
																												customFieldProps.length =
																													gstin?.length;
																											}
																											if (
																												isPanUploadMandatory &&
																												!isPanNumberExist &&
																												field?.name !==
																													CONST.EXISTING_CUSTOMER_FIELD_NAME
																											)
																												customFieldProps.disabled = true;
																											if (
																												isPanUploadMandatory &&
																												isPanNumberExist &&
																												field.name ===
																													CONST.PAN_NUMBER_FIELD_NAME
																											)
																												customFieldProps.disabled = true;
																											if (
																												selectedApplicant?.directorId &&
																												field.name ===
																													CONST.INCOME_TYPE_FIELD_NAME
																											)
																												customFieldProps.disabled = true;
																											if (
																												isViewLoan
																											) {
																												customFieldProps.disabled = true;
																											}
																											// console.log(isGstModalOpen);
																											return (
																												<UI_SECTIONS.FieldWrapGrid
																													key={`field-${fieldIndex}-${
																														field.name
																													}`}
																													style={{
																														display:
																															'flex',
																													}}
																												>
																													<div>
																														{field?.sub_fields &&
																															field
																																?.sub_fields?.[0]
																																?.is_prefix &&
																															register(
																																{
																																	...field
																																		.sub_fields[0],
																																	value: newValueSelectFeild,
																																	visibility:
																																		'visible',
																																	...customFieldProps,
																																}
																															)}
																													</div>
																													<div
																														style={{
																															width:
																																'100%',
																															marginLeft:
																																'5px',
																															marginRight:
																																'5px',
																														}}
																													>
																														{register(
																															{
																																...field,
																																value: newValue,
																																visibility:
																																	'visible',
																																...customFieldProps,
																															}
																														)}
																													</div>
																													<div>
																														{field?.sub_fields &&
																															!field
																																?.sub_fields[0]
																																.is_prefix &&
																															register(
																																{
																																	...field
																																		.sub_fields[0],
																																	value: newValueSelectFeild,
																																	visibility:
																																		'visible',
																																	...customFieldProps,
																																}
																															)}
																													</div>
																												</UI_SECTIONS.FieldWrapGrid>
																												//end
																											);
																										}
																									)}
																								</UI_SECTIONS.FormWrapGrid>
																							</Fragment>
																						);
																					}
																				)}
																				<UI_SECTIONS.Footer>
																					{!isViewLoan && (
																						<Button
																							fill
																							name={
																								'Save and Proceed'
																							}
																							isLoader={
																								loading
																							}
																							disabled={
																								loading
																							}
																							onClick={handleSubmit(
																								() => {
																									// director id will be present in case of aplicant / coapplicant if they move out of basic details page
																									// so avoid opening income type popup at below condition
																									if (
																										isEditOrViewLoan ||
																										!!selectedApplicant?.directorId
																									) {
																										onProceed();
																										return;
																									}
																									setIsIncomeTypeConfirmModalOpen(
																										true
																									);
																								}
																							)}
																						/>
																					)}
																					{isViewLoan && (
																						<>
																							<Button
																								name='Next'
																								onClick={
																									naviagteToNextSection
																								}
																								fill
																							/>
																						</>
																					)}
																					{isLocalhost &&
																						!isViewLoan && (
																							<Button
																								fill={
																									!!isTestMode
																								}
																								name='Auto Fill'
																								onClick={() =>
																									dispatch(
																										toggleTestMode()
																									)
																								}
																							/>
																						)}
																				</UI_SECTIONS.Footer>
																			</UI_SECTIONS.Wrapper>
																		);
																	};
export default BuissnessDetails;
