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

import { setLoginCreateUserRes } from 'store/appSlice';
import { setLoanIds } from 'store/applicationSlice';
import {
	updateApplicantSection,
	updateCoApplicantSection,
	addCacheDocuments,
	removeCacheDocument,
} from 'store/applicantCoApplicantsSlice';
import { setSelectedSectionId } from 'store/appSlice';
import { formatSectionReqBody } from 'utils/formatData';
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
	} = app;
	const {
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants[selectedApplicantCoApplicantId] || {};
	const { cacheDocuments } = selectedApplicant;
	const { isViewLoan } = application;
	const dispatch = useDispatch();
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
	const profileImageResTemp =
		cacheDocumentsTemp.filter(
			doc => doc.field.name === CONST.PROFILE_UPLOAD_FIELD_NAME
		)?.[0] ||
		cacheDocuments.filter(
			doc => doc.field.name === CONST.PROFILE_UPLOAD_FIELD_NAME
		)?.[0] ||
		null;

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
			if (!userToken) {
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
				axios.defaults.headers.Authorization = `Bearer ${
					newLoginCreateUserRes?.data?.token
				}`;
			} else {
				axios.defaults.headers.Authorization = `Bearer ${userToken}`;
			}

			// console.log('onProceed-loginCreateUserReqRes-', {
			// 	loginCreateUserReqBody,
			// 	loginCreateUserRes,
			// });
			// return;
			const selectedIncomeType =
				formState?.values?.[CONST.INCOME_TYPE_FIELD_NAME];
			const selectedLoanProductId =
				selectedProduct?.product_id[selectedIncomeType];
			const basicDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
					[CONST.PROFILE_UPLOAD_FIELD_DB_KEY]: profileImageResTemp?.file,
				},
				app,
				applicantCoApplicants,
				application,
				selectedLoanProductId,
			});

			// TEST MODE
			// return dispatch(setSelectedSectionId(nextSectionId));
			// -- TEST MODE

			// console.log('onProceed-basicDetailsReq-', {
			// 	basicDetailsReqBody,
			// });
			const basicDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				basicDetailsReqBody
			);
			// console.log('onProceed-basicDetailsResBody-', {
			// 	basicDetailsRes,
			// });
			const newLoanRefId = basicDetailsRes?.data?.data?.loan_data?.loan_ref_id;
			const newLoanId = basicDetailsRes?.data?.data?.loan_data?.id;
			const newBusinessId = basicDetailsRes?.data?.data?.business_data?.id;
			const newDirectorId = basicDetailsRes?.data?.data?.director_details?.id;
			const newBusinessUserId =
				basicDetailsRes?.data?.data?.business_data?.userid;
			const newCreatedByUserId =
				basicDetailsRes?.data?.data?.loan_data?.createdUserId;
			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc.requestId,
							doc_type_id: doc?.field?.doc_type?.[selectedIncomeType], // pending
							is_delete_not_allowed: true,
							director_id: newDirectorId,
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
								directorId: newDirectorId,
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
						profileImageResTemp?.presignedUrl,
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
				// dispatch(setSelectedApplicantCoApplicantId(newDirectorId));
			}
			dispatch(
				setLoanIds({
					loanRefId: newLoanRefId,
					loanId: newLoanId,
					businessId: newBusinessId,
					businessUserId: newBusinessUserId,
					loanProductId: selectedLoanProductId,
					createdByUserId: newCreatedByUserId,
				})
			);
			// dispatch(setPanExtractionRes(panExtractionResTemp));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-BasicDetails-onProceed-', error);
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
			cacheDocumentsTemp.filter(doc => doc.field.name === fieldName).length > 0
		) {
			setCacheDocumentsTemp(
				newCacheDocumentTemp.filter(doc => doc.field.name !== fieldName)
			);
		} else {
			dispatch(removeCacheDocument({ fieldName }));
		}
	};

	const prefilledValues = field => {
		try {
			if (formState?.values?.[field.name] !== undefined) {
				return formState?.values?.[field.name];
			}
			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			if (isApplicant) {
				return (
					applicant?.[selectedSectionId]?.[field?.name] || field.value || ''
				);
			}
			if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
				return formState?.values?.[field.name] || field.value || '';
			}
			if (selectedApplicantCoApplicantId) {
				return (
					coApplicants?.[selectedApplicantCoApplicantId]?.[selectedSectionId]?.[
						field?.name
					] ||
					field.value ||
					''
				);
			}
			return '';
		} catch (error) {
			return {};
		}
	};

	// console.log('BasicDetails-', {
	// 	formState,
	// });

	const isPanNumberExist = !!formState.values.pan_number;
	let isProfileMandatory = false;

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
							hint='Please uplaod the document with KYC image in Portrait Mode'
							hintIconName='Portrait Mode'
						/>
						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								if (
									field.type === 'file' &&
									field.name === CONST.PROFILE_UPLOAD_FIELD_NAME
								) {
									isProfileMandatory = !!field?.rules?.required;
									return (
										<UI_SECTIONS.FieldWrapGrid
											style={{ gridRow: 'span 3', height: '100%' }}
											key={`field-${fieldIndex}-${field.name}`}
										>
											<UI.ProfilePicWrapper>
												<ProfileUpload
													field={field}
													isPanNumberExist={isPanNumberExist}
													isFormSubmited={formState?.submit?.isSubmited}
													isProfileMandatory={isProfileMandatory}
													cacheDocumentsTemp={cacheDocumentsTemp}
													addCacheDocumentTemp={addCacheDocumentTemp}
													removeCacheDocumentTemp={removeCacheDocumentTemp}
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
													formState={formState}
													cacheDocumentsTemp={cacheDocumentsTemp}
													addCacheDocumentTemp={addCacheDocumentTemp}
													removeCacheDocumentTemp={removeCacheDocumentTemp}
													// panExtractionResTemp={panExtractionResTemp}
													// setPanExtractionResTemp={setPanExtractionResTemp}
													isPanNumberExist={isPanNumberExist}
													field={field}
													// setIsPanConfirmModalOpen={setIsPanConfirmModalOpen}
													panErrorMessage={panErrorMessage}
													panErrorColorCode={panErrorColorCode}
													setErrorFormStateField={setErrorFormStateField}
													onChangeFormStateField={onChangeFormStateField}
													clearErrorFormState={clearErrorFormState}
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
									!isPanNumberExist &&
									field.name !== CONST.EXISTING_CUSTOMER_FIELD_NAME
								)
									customFieldProps.disabled = true;
								if (
									isPanNumberExist &&
									field.name === CONST.PAN_NUMBER_FIELD_NAME
								)
									customFieldProps.disabled = true;
								if (
									selectedApplicant?.directorId &&
									field.name === CONST.INCOME_TYPE_FIELD_NAME
								)
									customFieldProps.disabled = true;
								// customFieldProps.disabled = false;
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
				{selectedApplicant?.directorId ? (
					ButtonProceed
				) : (
					<Button
						fill
						name={`${isViewLoan ? 'Next' : 'Proceed'}`}
						isLoader={loading}
						disabled={loading || !isPanNumberExist}
						onClick={handleSubmit(() => {
							// console.log({
							// 	isProfileMandatory,
							// 	selectedProfileImageUrl,
							// 	profileImageResTemp,
							// });
							if (isProfileMandatory && profileImageResTemp === null) return;
							setIsIncomeTypeConfirmModalOpen(true);
						})}
						// onClick={onProceed}
					/>
				)}
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default BasicDetails;
