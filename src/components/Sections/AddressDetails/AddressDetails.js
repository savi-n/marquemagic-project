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
	// setIsSameAsAboveAddressChecked,
	updateApplicantSection,
	updateCoApplicantSection,
	addCacheDocuments,
} from 'store/applicantCoApplicantsSlice';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
// import { getKYCData, getKYCDataId } from 'utils/request';
import {
	formatAddressProofDocTypeList,
	formatSectionReqBody,
	getApiErrorMessage,
	getCompletedSections,
} from 'utils/formatData';
// import { verifyKycDataUiUx } from 'utils/request';
import { isInvalidAadhaar } from 'utils/validation';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';

const AddressDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const { loanProductId, loanId, createdByUserId } = application;
	const {
		isViewLoan,
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		isTestMode,
		clientToken,
		selectedSection,
		isLocalhost,
		isEditLoan,
		isEditOrViewLoan,
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
	const {
		directorId,
		cacheDocuments,
		businessAddressIdAid1,
		businessAddressIdAid2,
	} = selectedApplicant;
	const selectedIncomeType =
		selectedApplicant?.basic_details?.[
			CONST_BASIC_DETAILS.INCOME_TYPE_FIELD_NAME
		];
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
					// console.log(verifyOtpResponse, '555777', verifyOtpResponse.status);
					setIsVerifyWithOtpDisabled(true);
					// if (isApplicant) {
					// 	if (applicant?.api?.verifyOtp?.res?.status === 'ok') {
					// 		setIsVerifyWithOtpDisabled(true);
					// 		console.log('if block , applicant');
					// 	}
					// } else {
					// 	if (
					// 		coApplicants[selectedDirectorId]?.api.verifyOtp.res.status ===
					// 		'ok'
					// 	) {
					// 		setIsVerifyWithOtpDisabled(true);
					// 		console.log('else block coapplicant');
					// 	}
					// }
					// if (verifyOtpResponse.status === 'ok') {
					// }
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
	// useEffect(() => {
	// 	setIsVerifyWithOtpDisabled(true);
	// }, []);
	const onProceed = async () => {
		try {
			if (isApplicant) {
				if (applicant?.api?.verifyOtp?.res?.status !== 'ok') {
					addToast({
						message:
							'Aadhaar otp authentication is mandatory. Please verify Aadhaar number with otp',
						type: 'error',
					});
					return;
				}
			} else {
				if (
					coApplicants?.[selectedApplicantCoApplicantId]?.api?.verifyOtp?.res
						?.status !== 'ok'
				) {
					addToast({
						message:
							'Aadhaar otp authentication is mandatory. Please verify Aadhaar number with otp',
						type: 'error',
					});
					return;
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
					city: formState?.values?.permanent_city || '',
					state: formState?.values?.permanent_state || '',
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
				businessAddressIdAid1: addressDetailsRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 1
				)?.[0]?.id,
				businessAddressIdAid2: addressDetailsRes?.data?.data?.business_address_data?.filter(
					address => address.aid === 2
				)?.[0]?.id,
				directorId,
			};
			if (isApplicant) {
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

	const prefilledEditOrViewLoanValues = field => {
		const preData = {
			permanent_aadhaar: '', // TODO: shreyas
			permanent_address_proof_id: '', // TODO: shreyas
			permanent_address_proof_id_passport: '', // TODO: shreyas
			permanent_address_proof_id_dl: '', // TODO: shreyas
			permanent_address_proof_id_voter: '', // TODO: shreyas
			permanent_address1: selectedApplicant?.permanent_address1,
			permanent_address2: selectedApplicant?.permanent_address2,
			permanent_address3: selectedApplicant?.permanent_locality,
			permanent_pin_code: selectedApplicant?.permanent_pincode,
			permanent_city: selectedApplicant?.permanent_city,
			permanent_state: selectedApplicant?.permanent_state,
			permanent_property_type: '', // TOOD: shreyas
			permanent_property_tenure: '', // TODO: shreyas

			present_aadhaar: selectedApplicant?.daadhaar, // TODO: shreyas
			present_address_proof_id: '', // TODO: shreyas
			present_address_proof_id_passport: selectedApplicant?.dpassport, // TODO: shreyas
			present_address_proof_id_dl: selectedApplicant?.ddlNumber, // TODO: shreyas
			present_address_proof_id_voter: selectedApplicant?.dvoterid, // TODO: shreyas
			present_address1: selectedApplicant?.address1,
			present_address2: selectedApplicant?.address2,
			present_address3: selectedApplicant?.locality,
			present_pin_code: selectedApplicant?.pincode,
			present_city: selectedApplicant?.city,
			present_state: selectedApplicant?.state,
			present_property_type: '', // TOOD: shreyas
			present_property_tenure: '', // TODO: shreyas
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

			if (selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT) {
				return formState?.values?.[field.name] || field.value || '';
			}

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

	// let isProceedDisabledAddressProof = true;

	// if (loading) {
	// 	isProceedDisabledAddressProof = true;
	// }

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
					isAadhaarOtpModalOpen={isAadhaarOtpModalOpen}
					setIsAadhaarOtpModalOpen={setIsAadhaarOtpModalOpen}
					aadhaarGenOtpResponse={aadharOtpResponse?.res}
					setIsVerifyWithOtpDisabled={isVerifyWithOtpDisabled}
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

				if (isEditOrViewLoan) {
					isInActiveAddressProofUpload = true;
				}
				// selectedDocTypeId &&
				// 	console.log(
				// 		'%c sub_sections_selectedDocumentTypes-',
				// 		'color: green',
				// 		{
				// 			sub_section,
				// 			isPermanent,
				// 			selectedAddressProofId,
				// 			selectedDocumentTypes,
				// 			selectedAddressProofTypeOption,
				// 		}
				// 	);
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
												onChange={() => {
													setIsSameAsAboveAddressChecked(
														!isSameAsAboveAddressChecked
													);
													// dispatch(
													// 	setIsSameAsAboveAddressChecked(
													// 		!isSameAsAboveAddressChecked
													// 	)
													// );
												}}
											/>
											<label htmlFor={CONST.CHECKBOX_SAME_AS_ID}>
												Same as Present Address
											</label>
										</>
									)}
								</h4>
							</UI.SubSectionCustomHeader>
						)}
						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								if (!field.visibility || !field.name || !field.type)
									return null;
								const newValue = prefilledValues(field);
								const customFieldProps = {};
								const customStyle = {};

								if (
									isSameAsAboveAddressChecked &&
									field.name.includes(CONST.PREFIX_PRESENT)
								) {
									customFieldProps.disabled = true;
								}
								const isVerifyWithOtpField = field.name.includes(
									CONST.AADHAAR_FIELD_NAME
								);
								const isIdProofUploadField =
									field.type === 'file' &&
									field.name.includes(CONST.ID_PROOF_UPLOAD_FIELD_NAME);
								if (isVerifyWithOtpField) return null;
								if (field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)) {
									customStyle.gridColumn = 'span 2';
								}
								if (
									sub_section.aid === CONST.AID_PRESENT &&
									isSameAsAboveAddressChecked
								) {
									if (CONST.HIDE_PRESENT_ADDRESS_FIELDS.includes(field.name))
										return null;
								}

								if (isIdProofUploadField) {
									return (
										<UI_SECTIONS.FieldWrapGrid style={{ gridColumn: 'span 2' }}>
											<AddressProofUpload
												prefix={prefix}
												isPermanent={isPermanent}
												disabled = {!selectedAddressProofId}
												field={field}
												register={register}
												formState={formState}
												isInActive={isInActiveAddressProofUpload}
												isSectionCompleted={isSectionCompleted}
												// startingTaggedDocs={cacheDocumentsTemp}
												// section={CONST.ADDRESSPROOF}
												prefilledDocs={cacheDocuments}
												selectedAddressProofId={selectedAddressProofId}
												selectedAddressProofFieldName={
													selectedAddressProofFieldName
												}
												docTypeOptions={selectedDocumentTypes}
												// onDrop={files =>
												// 	handleFileUploadAddressProof(files, isPermanent)
												// }
												// onRemoveFile={docId =>
												// 	handleFileRemoveAddressProof(docId, isPermanent)
												// }
												// docs={cacheDocumentsTemp}
												// setDocs={addCacheDocumentsTemp}
												// setDocs={newDocs => {
												// 	const newAddressProofDocs = [];
												// 	presentAddressProofDocsRef?.current?.map(d =>
												// 		newAddressProofDocs.push(d)
												// 	);
												// 	newDocs.map(d =>
												// 		newAddressProofDocs.push({
												// 			...d,
												// 			aid: CONST.AID_PRESENT,
												// 		})
												// 	);
												// 	setPresentAddressProofDocs(newAddressProofDocs);
												// 	presentAddressProofDocsRef.current = newAddressProofDocs;
												// }}
												// documentTypeChangeCallback={
												// 	handleDocumentTypeChangeAddressProof
												// }
												addressProofUploadSection={sub_section}
												selectedApplicant={selectedApplicant}
												// onClickFetchAddress={onClickFetchAddress}
												// fetchingAddress={fetchingAddress}
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
								if (field?.for_type_name) {
									if (
										!field?.for_type.includes(
											formState?.values?.[field?.for_type_name]
										)
									)
										return null;
								}

								// Disable field if prrof_type is not selected
								if(!formState?.values?.[CONST.PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME] && field.name !=='permanent_address_proof_type' && !field.name.includes('proof_id')){
									customFieldProps.disabled = true;
								}
								if(field.name === 'present_address_proof_type' && !formState?.values?.['permanent_address1']){
									customFieldProps.disabled = true;
								}
								// TODO: varun fix this by json change
								if (field.name === 'permanent_pin_code') {
									customFieldProps.type = 'pincode';
								}
								if (field.name === 'present_pin_code') {
									customFieldProps.type = 'pincode';
								}
								if (
									isSectionCompleted &&
									field.name.includes(CONST.ADDRESS_PROOF_TYPE_FIELD_NAME)
								) {
									customFieldProps.disabled = true;
								}
								return (
									<UI_SECTIONS.FieldWrapGrid
										id={field.name}
										key={`field-${fieldIndex}-${field.name}`}
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
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed)}
				/>
				{!!selectedSection?.is_skip || !!isTestMode ? (
					<Button name='Skip' disabled={loading} onClick={onSkip} />
				) : null}
				{isLocalhost && (
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

export default AddressDetails;
