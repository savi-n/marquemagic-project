//aid:1 = present address
//aid:2 = permanent address

import React, { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';
import AadhaarOTPModal from './AadhaarOTPModal';
import AddressProofUpload from './AddressProofUpload';
import Hint from 'components/Hint';

import {
	updateApplicantSection,
	updateCoApplicantSection,
} from 'store/applicantCoApplicantsSlice';
import { addCacheDocuments } from 'store/applicationSlice';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	formatAadhaarOtpResponse,
	formatAddressProofDocTypeList,
	formatSectionReqBody,
	getApiErrorMessage,
	getCompletedSections,
	isFieldValid,
} from 'utils/formatData';
import { isInvalidAadhaar } from 'utils/validation';
import { setLoanIds } from 'store/applicationSlice';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as CONST_ADDRESS_DETAILS from 'components/Sections/AddressDetails/const';

const AddressDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		loanProductId,
		loanId,
		createdByUserId,
		businessAddressIdAid1,
		businessAddressIdAid2,
	} = application;
	const {
		isViewLoan,
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		isTestMode,
		clientToken,
		selectedSection,
		isLocalhost,
		isEditLoan,
		isEditOrViewLoan,
		applicantCoApplicantSectionIds,
		editLoanDirectors,
	} = app;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
		isApplicant,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants?.[selectedApplicantCoApplicantId] || {};
	const { directorId, cacheDocuments } = selectedApplicant;
	const selectedIncomeType =
		selectedApplicant?.basic_details?.[
			CONST_BASIC_DETAILS.INCOME_TYPE_FIELD_NAME
		] || selectedApplicant?.income_type;
	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [loading, setLoading] = useState(false);
	const [verifyingWithOtp, setVerifyingWithOtp] = useState(false);
	const [
		permanentCacheDocumentsTemp,
		setPermanentCacheDocumentsTemp,
	] = useState([]);
	const [presentCacheDocumentsTemp, setPresentCacheDocumentsTemp] = useState(
		[]
	);
	// const [presentAddressProofDocs, setPresentAddressProofDocs] = useState([]);
	const [presentAddressProofError, setPresentAddressProofError] = useState('');
	const [permanentAddressProofError, setPermanentAddressProofError] = useState(
		''
	);
	const [isAadhaarOtpModalOpen, setIsAadhaarOtpModalOpen] = useState(false);
	const [
		isSameAsAboveAddressChecked,
		setIsSameAsAboveAddressChecked,
	] = useState(false);
	const [isVerifyWithOtpDisabled, setIsVerifyWithOtpDisabled] = useState(false);
	// const presentAddressProofDocsRef = useRef([]);
	const { addToast } = useToasts();
	const completedSections = getCompletedSections({
		selectedProduct,
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		application,
		isEditOrViewLoan,
		isEditLoan,
		applicantCoApplicantSectionIds,
		editLoanDirectors,
		selectedApplicant,
	});
	const isSectionCompleted = completedSections.includes(selectedSectionId);
	const [aadharOtpResponse, setAadharOtpResponse] = useState({});
	const onClickVerifyWithOtp = async () => {
		try {
			const aadhaarErrorMessage = isInvalidAadhaar(
				formState.values[CONST.AADHAAR_FIELD_NAME_FOR_OTP]
			);
			if (aadhaarErrorMessage) {
				return addToast({
					message: aadhaarErrorMessage,
					type: 'error',
				});
			}
			setVerifyingWithOtp(true);
			try {
				const aadhaarOtpReqBody = {
					aadhaarNo: formState.values[CONST.AADHAAR_FIELD_NAME_FOR_OTP],
					product_id: loanProductId,
				};
				// console.log(aadhaarOtpReqBody, '555', clientToken);
				// --------------------
				const aadharOtpReq = await axios.post(
					API.AADHAAR_GENERATE_OTP,
					aadhaarOtpReqBody,
					{
						headers: {
							Authorization: `${clientToken}`,
						},
					}
				);
				const aadhaarGenOtpResponse = aadharOtpReq.data;
				if (aadhaarGenOtpResponse.status === 'nok') {
					addToast({
						message:
							aadhaarGenOtpResponse?.data?.msg ||
							'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
						type: 'error',
					});
				}
				if (aadhaarGenOtpResponse.status === 'ok') {
					aadhaarGenOtpResponse.aadhaarNo =
						formState?.values?.[CONST.AADHAAR_FIELD_NAME_FOR_OTP];

					setAadharOtpResponse({
						req: aadhaarOtpReqBody,
						res: aadhaarGenOtpResponse,
					});

					addToast({
						message: 'OTP is sent to aadhaar link mobile number',
						type: 'success',
					});
					setIsAadhaarOtpModalOpen(true);
					setIsVerifyWithOtpDisabled(true);
				}
			} catch (error) {
				console.error('error-generate-aadhaar-otp-', error);
				addToast({
					message:
						error?.response?.data?.message ||
						error?.response?.data?.data?.msg ||
						'Aadhaar cannot be validated due to technical failure. Please try again after sometime',
					type: 'error',
				});
			} finally {
				setVerifyingWithOtp(false);
			}
		} catch (error) {
			console.error('error-onClickVerifyWithOtp-', error);
		} finally {
			setVerifyingWithOtp(false);
		}
	};
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};
	const onProceed = async () => {
		try {
			if (!isEditOrViewLoan) {
				const isPermanentSelectedAddressProofTypeAadhaar = formState?.values?.[
					CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
				]?.includes(CONST_SECTIONS.EXTRACTION_KEY_AADHAAR);
				// console.log('onproceed-', {
				// 	isPermanentSelectedAddressProofTypeAadhaar,
				// 	selectedIncomeType:
				// 		formState?.values?.[CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME],
				// });
				if (!isPermanentSelectedAddressProofTypeAadhaar) {
					if (selectedApplicant?.api?.verifyOtp?.res?.status !== 'ok') {
						addToast({
							message:
								'Aadhaar otp authentication is mandatory. Please verify Aadhaar number with otp',
							type: 'error',
						});
						return;
					}
				}
			}

			setLoading(true);
			const newLoanAddressDetails = [
				{
					business_address_id: businessAddressIdAid1,
					aid: 1,
					line1: formState?.values?.present_address1 || '',
					line2: formState?.values?.present_address2 || '',
					locality: formState?.values?.present_address3 || '',
					pincode: formState?.values?.present_pin_code || '',
					city: formState?.values?.present_city || '',
					state: formState?.values?.present_state || '',
					residential_type: formState?.values?.present_property_type || '',
					residential_stability:
						formState?.values?.present_property_tenure || '',
				},
				{
					business_address_id: businessAddressIdAid2,
					aid: 2,
					line1: formState?.values?.permanent_address1 || '',
					line2: formState?.values?.permanent_address2 || '',
					locality: formState?.values?.permanent_address3 || '',
					pincode: formState?.values?.permanent_pin_code || '',
					city: formState?.values?.permanent_city || '',
					state: formState?.values?.permanent_state || '',
					residential_type: formState?.values?.permanent_property_type || '',
					residential_stability:
						formState?.values?.permanent_property_tenure || '',
				},
			];
			const addressDetailsReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
				values: formState.values,
			});

			addressDetailsReqBody.data.loan_address_details = newLoanAddressDetails;
			// console.log('addressDetailsReqBody-', {
			// 	addressDetailsReqBody,
			// });
			const addressDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				addressDetailsReqBody
			);
			// console.log('addressDetailsRes-', { addressDetailsRes });
			const cacheDocumentsTemp = [
				...permanentCacheDocumentsTemp,
				...presentCacheDocumentsTemp,
			];
			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						if (!doc?.requestId) return null;
						uploadCacheDocumentsTemp.push({
							...doc,
							request_id: doc.requestId,
							doc_type_id: doc.selectedDocTypeId,
							is_delete_not_allowed: true,
							director_id: directorId,
							file: null,
						});
						return null;
					});
					if (uploadCacheDocumentsTemp.length) {
						const uploadCacheDocumentsTempReqBody = {
							loan_id: loanId,
							request_ids_obj: uploadCacheDocumentsTemp,
							user_id: createdByUserId,
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
			const newAddressDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
				directorId,
			};
			if (isApplicant) {
				dispatch(
					setLoanIds({
						businessAddressIdAid1: addressDetailsRes?.data?.data?.business_address_data?.filter(
							address => address.aid === 1
						)?.[0]?.id,
						businessAddressIdAid2: addressDetailsRes?.data?.data?.business_address_data?.filter(
							address => address.aid === 2
						)?.[0]?.id,
					})
				);
				dispatch(updateApplicantSection(newAddressDetails));
			} else {
				dispatch(updateCoApplicantSection(newAddressDetails));
			}
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-AddressDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
			// TODO: below line is used for testing remove this before push
			// dispatch(setSelectedSectionId(nextSectionId));
		} finally {
			setLoading(false);
		}
	};

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(selectedApplicant?.[selectedSectionId] || {}),
				isSkip: true,
			},
			directorId,
		};
		if (isApplicant) {
			dispatch(updateApplicantSection(skipSectionData));
		} else {
			dispatch(updateCoApplicantSection(skipSectionData));
		}
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prePopulateAddressDetailsFromVerifyOtpRes = aadhaarOtpRes => {
		const formatedData = formatAadhaarOtpResponse(aadhaarOtpRes);
		Object.keys(formatedData || {}).map(key => {
			onChangeFormStateField({
				name: `${CONST_ADDRESS_DETAILS.PREFIX_PERMANENT}${key}`,
				value: formatedData?.[key] || '',
			});
			return null;
		});
	};

	const prefilledEditOrViewLoanValues = field => {
		const preData = {
			permanent_aadhaar: selectedApplicant?.daadhaar,
			permanent_address_proof_id: '', // others for future
			permanent_address_proof_id_passport: selectedApplicant?.dpassport,
			permanent_address_proof_id_dl: selectedApplicant?.ddlNumber,
			permanent_address_proof_id_voter: selectedApplicant?.dvoterid,
			permanent_address1: selectedApplicant?.permanent_address1,
			permanent_address2: selectedApplicant?.permanent_address2,
			permanent_address3: selectedApplicant?.permanent_locality,
			permanent_pin_code: selectedApplicant?.permanent_pincode,
			permanent_city: selectedApplicant?.permanent_city,
			permanent_state: selectedApplicant?.permanent_state,
			permanent_property_type: selectedApplicant?.permanent_residential_type,
			permanent_property_tenure:
				selectedApplicant?.permanent_residential_stability,

			present_aadhaar: selectedApplicant?.daadhaar,
			present_address_proof_id: '', // others for future
			present_address_proof_id_passport: selectedApplicant?.dpassport,
			present_address_proof_id_dl: selectedApplicant?.ddlNumber,
			present_address_proof_id_voter: selectedApplicant?.dvoterid,
			present_address1: selectedApplicant?.address1,
			present_address2: selectedApplicant?.address2,
			present_address3: selectedApplicant?.locality,
			present_pin_code: selectedApplicant?.pincode,
			present_city: selectedApplicant?.city,
			present_state: selectedApplicant?.state,
			present_property_type: selectedApplicant?.residential_type,
			present_property_tenure: selectedApplicant?.residential_stability,
		};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		try {
			if (isViewLoan) {
				return prefilledEditOrViewLoanValues(field) || '';
			}

			// custom prefill only for this section
			if (isSameAsAboveAddressChecked) {
				return formState?.values?.[
					field?.name?.replace(CONST.PREFIX_PRESENT, CONST.PREFIX_PERMANENT)
				];
			}

			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			if (selectedApplicant?.[selectedSectionId]?.[field?.name]) {
				return selectedApplicant?.[selectedSectionId]?.[field?.name];
			}

			let editViewLoanValue = '';

			if (isEditLoan) {
				editViewLoanValue = prefilledEditOrViewLoanValues(field);
			}

			if (editViewLoanValue) return editViewLoanValue;

			return field?.value || '';
		} catch (error) {
			return {};
		}
	};

	// console.log('AddressDetails-allProps-', {
	// 	applicant,
	// 	coApplicants,
	// 	selectedApplicant,
	// 	isSameAsAboveAddressChecked,
	// 	formState,
	// });

	return (
		<UI_SECTIONS.Wrapper>
			{isAadhaarOtpModalOpen && (
				<AadhaarOTPModal
					formState={formState}
					isAadhaarOtpModalOpen={isAadhaarOtpModalOpen}
					setIsAadhaarOtpModalOpen={setIsAadhaarOtpModalOpen}
					aadhaarGenOtpResponse={aadharOtpResponse?.res}
					setIsVerifyWithOtpDisabled={isVerifyWithOtpDisabled}
					prePopulateAddressDetailsFromVerifyOtpRes={
						prePopulateAddressDetailsFromVerifyOtpRes
					}
				/>
			)}
			{selectedSection?.sub_sections?.map((sub_section, subSectionIndex) => {
				let isInActiveAddressProofUpload = false;

				const isPermanent = sub_section.aid === CONST.AID_PERMANENT;
				const selectedAddressProofFieldName = isPermanent
					? CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME
					: CONST.PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME;
				const selectedAddressProofId =
					formState.values[selectedAddressProofFieldName];

				const selectedAddressProofTypeOption = sub_section.fields
					.filter(field => field.name === selectedAddressProofFieldName)?.[0]
					?.options?.filter(o => o.value === selectedAddressProofId)?.[0];

				const selectedDocTypeId =
					selectedAddressProofTypeOption?.doc_type?.[selectedIncomeType];
				const prefix = isPermanent
					? CONST.PREFIX_PERMANENT
					: CONST.PREFIX_PRESENT;
				const selectedDocumentTypes = formatAddressProofDocTypeList({
					selectedAddressProofId,
					prefix,
					aid: sub_section.aid,
				});

				if (!selectedAddressProofId) {
					isInActiveAddressProofUpload = true;
				}

				const cacheDocumentsTemp = isPermanent
					? permanentCacheDocumentsTemp
					: presentCacheDocumentsTemp;

				if (selectedAddressProofId) {
					const isFrontTagged =
						cacheDocumentsTemp?.filter(
							f => f?.isTagged?.id === selectedDocumentTypes?.[0]?.id
						).length > 0;
					const isBackTagged =
						cacheDocumentsTemp?.filter(
							f => f?.isTagged?.id === selectedDocumentTypes?.[1]?.id
						).length > 0;
					const isFrontBackTagged =
						cacheDocumentsTemp?.filter(
							f => f?.isTagged?.id === selectedDocumentTypes?.[2]?.id
						).length > 0;
					// if (isFrontTagged && !isBackTagged && !isFrontBackTagged) {
					// 	isProceedDisabledAddressProof = false;
					// }
					// if (!isFrontTagged && isBackTagged && !isFrontBackTagged) {
					// 	isProceedDisabledAddressProof = false;
					// }
					if (isFrontTagged && isBackTagged && !isFrontBackTagged) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = false;
					}
					if (isFrontBackTagged && !isFrontTagged && !isBackTagged) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = false;
					}
					if (presentAddressProofError) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = true;
					}
					if (cacheDocumentsTemp.filter(f => !f?.isTagged?.id).length > 0) {
						isInActiveAddressProofUpload = true;
						// isProceedDisabledAddressProof = true;
					}
				}

				if (isSectionCompleted) {
					isInActiveAddressProofUpload = true;
				}

				if (isViewLoan) {
					isInActiveAddressProofUpload = true;
				}

				return (
					<Fragment key={`section-${subSectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<>
								<UI_SECTIONS.SubSectionHeader>
									{sub_section.name}
								</UI_SECTIONS.SubSectionHeader>
								<Hint
									hint='Please upload the document with KYC image in Portrait Mode'
									hintIconName='Portrait Mode'
								/>
							</>
						) : null}
						{sub_section.id.includes(CONST.ADDRESS_PROOF_UPLOAD_SECTION_ID) && (
							<UI.SubSectionCustomHeader style={{ marginTop: 40 }}>
								<h4>
									Select any one of the documents mentioned below for{' '}
									<strong>
										{sub_section?.name ? 'Permanent' : 'Present'} Address
									</strong>
									<span style={{ color: 'red' }}>*</span>
								</h4>
								<h4>
									{sub_section?.name ? null : (
										<>
											<UI.CheckboxSameAs
												type='checkbox'
												id={CONST.CHECKBOX_SAME_AS_ID}
												checked={!!isSameAsAboveAddressChecked}
												disabled={
													isSectionCompleted ||
													isViewLoan ||
													!formState?.values?.[
														CONST_ADDRESS_DETAILS.PERMANENT_ADDRESS1_FIELD_NAME
													]
												}
												onChange={() => {
													setIsSameAsAboveAddressChecked(
														!isSameAsAboveAddressChecked
													);
												}}
											/>
											<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
												Same as Permanent Address
											</label>
										</>
									)}
								</h4>
							</UI.SubSectionCustomHeader>
						)}
						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								if (!isFieldValid({ field, formState, isApplicant })) {
									return null;
								}

								if (
									sub_section.aid === CONST.AID_PRESENT &&
									isSameAsAboveAddressChecked
								) {
									if (CONST.HIDE_PRESENT_ADDRESS_FIELDS.includes(field.name))
										return null;
								}
								const isVerifyWithOtpField = field.name.includes(
									CONST.AADHAAR_FIELD_NAME
								);
								if (isVerifyWithOtpField) return null;

								const newValue = prefilledValues(field);
								const customFieldProps = {};
								if (isViewLoan) {
									customFieldProps.disabled = true;
								}
								const customStyle = {};

								const isIdProofUploadField =
									field.type === 'file' &&
									field.name.includes(CONST.ID_PROOF_UPLOAD_FIELD_NAME);

								if (field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)) {
									customStyle.gridColumn = 'span 2';
								}

								if (isIdProofUploadField) {
									return (
										<UI_SECTIONS.FieldWrapGrid
											style={{ gridColumn: 'span 2' }}
											key={`field-${fieldIndex}-${field.name}`}
										>
											<AddressProofUpload
												prefix={prefix}
												isPermanent={isPermanent}
												disabled={!selectedAddressProofId}
												field={field}
												register={register}
												formState={formState}
												isInActive={isInActiveAddressProofUpload}
												isSectionCompleted={isSectionCompleted}
												selectedAddressProofId={selectedAddressProofId}
												selectedAddressProofFieldName={
													selectedAddressProofFieldName
												}
												docTypeOptions={selectedDocumentTypes}
												addressProofUploadSection={sub_section}
												selectedApplicant={selectedApplicant}
												onChangeFormStateField={onChangeFormStateField}
												prefilledValues={prefilledValues}
												addressProofError={
													isPermanent
														? permanentAddressProofError
														: presentAddressProofError
												}
												setAddressProofError={
													isPermanent
														? setPermanentAddressProofError
														: setPresentAddressProofError
												}
												onClickVerifyWithOtp={onClickVerifyWithOtp}
												verifyingWithOtp={verifyingWithOtp}
												prefilledDocs={cacheDocuments}
												cacheDocumentsTemp={cacheDocumentsTemp}
												setCacheDocumentsTemp={
													isPermanent
														? setPermanentCacheDocumentsTemp
														: setPresentCacheDocumentsTemp
												}
												selectedDocTypeId={selectedDocTypeId}
											/>
										</UI_SECTIONS.FieldWrapGrid>
									);
								}

								if (
									!!selectedApplicant?.api?.verifyOtp?.res &&
									sub_section?.id === CONST.PERMANENT_ADDRESS_DETAILS_SECTION_ID
								) {
									customFieldProps.disabled = false;
								} else if (
									cacheDocumentsTemp?.filter(doc => !!doc?.extractionRes)
										.length > 0
								) {
									customFieldProps.disabled = false;
								} else {
									if (
										!field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)
									) {
										customFieldProps.disabled = true;
									}
								}

								if (
									isSectionCompleted &&
									field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)
								) {
									customFieldProps.disabled = true;
								}

								if (
									isSameAsAboveAddressChecked &&
									field.name.includes(CONST.PREFIX_PRESENT)
								) {
									customFieldProps.disabled = true;
								}

								// Untill permanent address1 is not filled disable present address proof
								if (
									field.name === CONST.PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME &&
									!formState?.values?.[CONST.PERMANENT_ADDRESS1_FIELD_NAME]
								) {
									customFieldProps.disabled = true;
								}

								// EDIT / VIEW MODE Enable all address fields and disable all doc related fields
								if (isSectionCompleted) {
									if (sub_section?.id?.includes('address_details')) {
										customFieldProps.disabled = false;
									} else {
										customFieldProps.disabled = true;
									}
								}

								// TO overwrite all above condition and disable everything
								if (isViewLoan) {
									customFieldProps.disabled = true;
								}
								return (
									<UI_SECTIONS.FieldWrapGrid
										key={`field-${prefix}-${fieldIndex}-${field.name}`}
										style={customStyle}
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
						disabled={loading}
						onClick={handleSubmit(onProceed)}
					/>
				)}
				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{/* buttons for easy development starts */}
				{!isViewLoan && (!!selectedSection?.is_skip || !!isTestMode) ? (
					<Button name='Skip' disabled={loading} onClick={onSkip} />
				) : null}
				{!isViewLoan && (isLocalhost && !!isTestMode) && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
				{/* buttons for easy development ends */}
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default AddressDetails;
