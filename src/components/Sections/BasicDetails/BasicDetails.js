import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';
import ProfileUpload from './ProfileUpload';
import PanUpload from './PanUpload';
import Hint from 'components/Hint';
import ConfirmModal from 'components/modals/ConfirmModal';

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
	// addCacheDocument,
} from 'store/applicantCoApplicantsSlice';
import {
	addOrUpdateCacheDocument,
	addCacheDocuments,
	setLoanIds,
} from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getEditLoanLoanDocuments,
} from 'utils/formatData';
import { useToasts } from 'components/Toast/ToastProvider';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as API from '_config/app.config';
import * as UI from './ui';
import * as CONST from './const';

const BasicDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
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
	const { cacheDocuments, borrowerUserId } = application;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [
		isIncomeTypeConfirmModalOpen,
		setIsIncomeTypeConfirmModalOpen,
	] = useState(false);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
		setErrorFormStateField,
	} = useForm();
	const profileUploadedFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME
		)?.[0] ||
		cacheDocuments?.filter(
			doc =>
				doc?.field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME &&
				`${doc?.directorId}` === `${directorId}`
		)?.[0] ||
		null;
	const panUploadedFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.PAN_UPLOAD_FIELD_NAME
		)?.[0] ||
		cacheDocuments?.filter(
			doc =>
				doc?.classification_type === CONST_SECTIONS.CLASSIFICATION_TYPE_PAN &&
				(doc?.classification_sub_type ===
					CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_F && `${doc?.directorId}`) ===
					`${directorId}`
		)?.[0] ||
		null;
	let prefilledProfileUploadValue = '';
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const onProceed = async () => {
		try {
			setLoading(true);
			// console.log('nextSectionId-', {
			// 	nextSectionId,
			// 	selectedApplicantCoApplicantId,
			// 	newDirectorId,
			// });

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
				// console.log('onProceed-loginCreateUserReqRes-', {
				// 	loginCreateUserReqBody,
				// 	newLoginCreateUserRes,
				// });
				// return;
			} else {
				axios.defaults.headers.Authorization = `Bearer ${userToken}`;
			}

			const selectedIncomeType =
				formState?.values?.[CONST.INCOME_TYPE_FIELD_NAME];

			// loan product is is only applicable for applicant
			// it should not be overritten when coapplicant is income type is different then applicant
			let selectedLoanProductId = '';
			if (isApplicant) {
				selectedLoanProductId =
					selectedProduct?.product_id?.[selectedIncomeType];
			}

			const profileField = selectedSection?.sub_sections?.[0]?.fields?.filter(
				field => field?.name === CONST.PROFILE_UPLOAD_FIELD_NAME
			)?.[0];
			const isNewProfileUploaded = !!profileUploadedFile?.file;
			const profileFieldValue = isNewProfileUploaded
				? {
						...profileUploadedFile?.file,
						doc_type_id: profileField?.doc_type?.[selectedIncomeType],
				  }
				: profileUploadedFile?.presignedUrl;
			const basicDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
					[CONST.PROFILE_UPLOAD_FIELD_NAME]: profileFieldValue,
				},
				app,
				applicantCoApplicants,
				application,
				selectedLoanProductId,
			});

			// pass this id in only create mode
			if (!isEditOrViewLoan && !borrowerUserId) {
				basicDetailsReqBody.borrower_user_id = newBorrowerUserId;
			}

			// console.log('onProceed-basicDetailsReq-', {
			// 	basicDetailsReqBody,
			// 	profileKey: CONST.PROFILE_UPLOAD_FIELD_DB_KEY,
			// 	profileUploadedFile,
			// });
			// return;

			const basicDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				basicDetailsReqBody
			);
			const newLoanRefId = basicDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = basicDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId = basicDetailsRes?.data?.data?.business_data?.id;
			const newDirectorId = basicDetailsRes?.data?.data?.director_details?.id;
			const newBusinessUserId =
				basicDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				basicDetailsRes?.data?.data?.loan_data?.createdUserId;

			if (isNewProfileUploaded) {
				const uploadedProfileRes =
					basicDetailsRes?.data?.data?.loan_document_data || null;
				const newProfileData = {
					...(uploadedProfileRes || {}),
					...profileUploadedFile,
					...(typeof profileFieldValue !== 'string' ? profileFieldValue : {}),
					directorId: newDirectorId,
					preview: null,
					file: null,
					isDocRemoveAllowed: false,
					category: CONST_SECTIONS.DOC_CATEGORY_KYC,
				};
				if (uploadedProfileRes?.id) {
					newProfileData.document_id = uploadedProfileRes?.id;
				}
				newProfileData.name =
					newProfileData?.filename ||
					newProfileData?.uploaded_doc_name ||
					newProfileData?.original_doc_name;
				// console.log('onProceed-basicDetailsResBody-', {
				// 	basicDetailsRes,
				// 	newProfileData,
				// 	newDirectorId,
				// });
				// return;
				dispatch(
					addOrUpdateCacheDocument({
						file: newProfileData,
					})
				);
			}
			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						if (!doc?.requestId) return null;
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc?.requestId,
							doc_type_id: doc?.field?.doc_type?.[selectedIncomeType],
							is_delete_not_allowed: true,
							director_id: newDirectorId,
							directorId: newDirectorId,
							preview: null,
							classification_type: CONST_SECTIONS.CLASSIFICATION_TYPE_PAN,
							classification_sub_type: CONST_SECTIONS.CLASSIFICATION_SUB_TYPE_F,
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
						// console.log('uploadCacheDocumentsTempReqBody-', {
						// 	uploadCacheDocumentsTempReqBody,
						// });
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
			const newBasicDetails = {
				sectionId: selectedSectionId,
				sectionValues: {
					...formState.values,
					[CONST.PROFILE_UPLOAD_FIELD_DB_KEY]:
						profileUploadedFile?.presignedUrl,
				},
			};
			// console.log('onProceed-', {
			// 	newBasicDetails,
			// });
			// TODO: varun update cin properly peding discussion with savita
			newBasicDetails.directorId = newDirectorId;
			newBasicDetails.cin = applicantCoApplicants?.companyRocData?.CIN || '';
			if (isApplicant) {
				dispatch(updateApplicantSection(newBasicDetails));
			} else {
				dispatch(updateCoApplicantSection(newBasicDetails));
				dispatch(setSelectedApplicantCoApplicantId(newDirectorId));
			}
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
			// dispatch(setPanExtractionRes(panExtractionResTemp));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-BasicDetails-onProceed-', {
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

	const addCacheDocumentTemp = file => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		newCacheDocumentTemp.push(file);
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};

	const removeCacheDocumentTemp = fieldName => {
		// console.log('removeCacheDocumentTemp-', { fieldName, cacheDocumentsTemp });
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		if (
			cacheDocumentsTemp.filter(doc => doc?.field?.name === fieldName)?.length >
			0
		) {
			setCacheDocumentsTemp(
				newCacheDocumentTemp.filter(doc => doc?.field?.name !== fieldName)
			);
		} else {
			dispatch(removeCacheDocument({ fieldName }));
		}
	};

	const prefilledEditOrViewLoanValues = field => {
		// console.log('applicant-', { selectedApplicant });
		if (field.type === 'file' && field.name === CONST.PAN_UPLOAD_FIELD_NAME) {
			const panFile = getEditLoanLoanDocuments({
				documents: editLoanData?.loan_document,
				directorId: selectedApplicant?.directorId,
				docTypeId: field?.doc_type?.[selectedApplicant?.income_type],
			});
			// console.log('all-pan-files-', panFile);
			return panFile[0];
		}
		const preData = {
			existing_customer: selectedApplicant?.existing_customer,
			pan_number: selectedApplicant?.dpancard,
			income_type: `${selectedApplicant?.income_type}`,
			first_name: selectedApplicant?.dfirstname,
			last_name: selectedApplicant?.dlastname,
			dob: selectedApplicant?.ddob,
			gender: selectedApplicant?.gender,
			email: selectedApplicant?.demail,
			mobile_no: selectedApplicant?.dcontact,
			marital_status: selectedApplicant?.marital_status,
			spouse_name: selectedApplicant?.spouse_name,
			residence_status: selectedApplicant?.residence_status,
			country_residence: selectedApplicant?.country_residence,
			father_name: selectedApplicant?.father_name,
			mother_name: selectedApplicant?.mother_name,
			upi_id: selectedApplicant?.upi_id,
			profile_upload: selectedApplicant?.customer_picture,
			relationship_with_applicant: selectedApplicant?.applicant_relationship,
		};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		try {
			// [Priority - 0]
			// view loan
			// in view loan user cannot edit any information
			// hence this is the first priority
			// so always prepopulate value from <editLoanData>
			if (isViewLoan) {
				return prefilledEditOrViewLoanValues(field) || '';
			}

			// [Priority - 1]
			// update value from form state
			// whenever user decides to type or enter value
			// form state should be the first value to prepopulate
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			// [Priority - Special]
			// special case when co-applicant is filling basic details for first time
			// when director id is not created we prepopulate value from formstate only
			// and last priority is to set default value <field.value> comming from JSON
			if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
				return formState?.values?.[field.name] || field.value || '';
			}

			// [Priority - 2]
			// fetch data from redux slice
			// this is to prefill value when user navigates backs
			// once user press proceed and submit api success
			// value is stored to redux and the same we can use to prepopulate
			if (selectedApplicant?.[selectedSectionId]?.[field?.name]) {
				return selectedApplicant?.[selectedSectionId]?.[field?.name];
			}

			// [Priority - 3]
			// fetch value from edit loan
			// this is to prefill value only once per section
			// ex: if user visits this section for first time we prepopulate value from <editLoanData>
			// and then when he moves to next section redux store will be ready with new updated values
			let editViewLoanValue = '';

			if (isEditLoan) {
				editViewLoanValue = prefilledEditOrViewLoanValues(field);
			}

			if (editViewLoanValue) return editViewLoanValue;

			// [Priority - 4]
			// finally last priority is for JSON value
			// this value will be always overwritten by other all priority
			// this scenario will only come in loan creation first time entering form
			// also we'll have fall back <''> empty value in case above all priority fails to prepopulate
			return field?.value || '';
		} catch (error) {
			return {};
		}
	};

	// console.log('BasicDetails-', {
	// 	formState,
	// 	cacheDocuments,
	// 	panUploadedFile,
	// 	profileUploadedFile,
	// });

	const isPanNumberExist = !!formState.values.pan_number;
	const isProfileMandatory = !!selectedSection?.sub_sections?.[0]?.fields?.filter(
		field => field.name === CONST.PROFILE_UPLOAD_FIELD_NAME
	)?.[0]?.rules?.required;
	const isPanUploadMandatory = !!selectedSection?.sub_sections?.[0]?.fields?.filter(
		field => field.name === CONST.PAN_UPLOAD_FIELD_NAME
	)?.[0]?.rules?.required;

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
			<ConfirmModal
				type='Income'
				show={isIncomeTypeConfirmModalOpen}
				onClose={setIsIncomeTypeConfirmModalOpen}
				ButtonProceed={ButtonProceed}
			/>
			{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<UI_SECTIONS.SubSectionHeader>
								{sub_section.name}
							</UI_SECTIONS.SubSectionHeader>
						) : null}
						<Hint
							hint='Please upload the document with KYC image in Portrait Mode'
							hintIconName='Portrait Mode'
						/>
						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								// disable fields based on config starts
								if (field?.hasOwnProperty('is_applicant')) {
									if (field.is_applicant === false && isApplicant) {
										return null;
									}
								}
								if (field?.hasOwnProperty('is_co_applicant')) {
									if (field.is_co_applicant === false && !isApplicant) {
										return null;
									}
								}
								// disable fields based on config ends
								if (
									field.type === 'file' &&
									field.name === CONST.PROFILE_UPLOAD_FIELD_NAME
								) {
									prefilledProfileUploadValue = prefilledValues(field);
									return (
										<UI_SECTIONS.FieldWrapGrid
											style={{ gridRow: 'span 3', height: '100%' }}
											key={`field-${fieldIndex}-${field.name}`}
										>
											<UI.ProfilePicWrapper>
												<ProfileUpload
													field={field}
													value={prefilledProfileUploadValue}
													isPanNumberExist={isPanNumberExist}
													isPanMandatory={isPanUploadMandatory}
													isFormSubmited={formState?.submit?.isSubmited}
													isProfileMandatory={isProfileMandatory}
													uploadedFile={profileUploadedFile}
													cacheDocumentsTemp={cacheDocumentsTemp}
													addCacheDocumentTemp={addCacheDocumentTemp}
													removeCacheDocumentTemp={removeCacheDocumentTemp}
													onChangeFormStateField={onChangeFormStateField}
													isDisabled={isViewLoan}
												/>
											</UI.ProfilePicWrapper>
										</UI_SECTIONS.FieldWrapGrid>
									);
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
									return (
										<UI_SECTIONS.FieldWrapGrid
											key={`field-${fieldIndex}-${field.name}`}
										>
											<UI.ProfilePicWrapper>
												<PanUpload
													field={field}
													value={prefilledValues(field)}
													formState={formState}
													uploadedFile={panUploadedFile}
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
								const customFieldProps = {};
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
									selectedApplicant?.directorId &&
									field.name === CONST.INCOME_TYPE_FIELD_NAME
								)
									customFieldProps.disabled = true;
								if (isViewLoan) {
									customFieldProps.disabled = true;
								}
								return (
									<UI_SECTIONS.FieldWrapGrid
										key={`field-${fieldIndex}-${field.name}`}
									>
										{register({
											...field,
											value: newValue,
											visibility: 'visible',
											...customFieldProps,
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name] && (
												<UI_SECTIONS.ErrorMessage>
													{formState?.error?.[field.name]}
												</UI_SECTIONS.ErrorMessage>
											)}
									</UI_SECTIONS.FieldWrapGrid>
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
						name='Proceed'
						isLoader={loading}
						disabled={loading || !isPanNumberExist}
						onClick={handleSubmit(() => {
							// console.log({
							// 	isProfileMandatory,
							// });
							let isProfileError = false;
							if (isProfileMandatory && profileUploadedFile === null) {
								isProfileError = true;
							}
							if (
								isEditOrViewLoan &&
								prefilledProfileUploadValue &&
								typeof prefilledProfileUploadValue === 'string'
							) {
								isProfileError = false;
							}
							if (isProfileError) {
								// console.log('profile-error-', {
								// 	isProfileError,
								// 	profileUploadedFile,
								// 	isEditOrViewLoan,
								// 	value: formState?.values?.[CONST.PAN_UPLOAD_FIELD_NAME],
								// });
								addToast({
									message: 'Profile is mandatory',
									type: 'error',
								});
								return;
							}
							// director id will be present in case of aplicant / coapplicant if they move out of basic details page
							// so avoid opening income type popup at below condition
							if (isEditOrViewLoan || !!selectedApplicant?.directorId) {
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
				{isLocalhost && !isViewLoan && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default BasicDetails;
