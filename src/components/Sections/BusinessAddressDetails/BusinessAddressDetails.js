import React, { useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Button from 'components/Button';
import {
	updateApplicantSection,
	updateCoApplicantSection,
} from 'store/applicantCoApplicantsSlice';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getCompletedSections,
	isFieldValid,
	getSelectedField,
	getSelectedSubField,
} from 'utils/formatData';
import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import { setLoanIds } from 'store/applicationSlice';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';

const BusinessAddressDetails = props => {
	const { app, applicantCoApplicants, application } = useSelector(
		state => state
	);
	const {
		loanProductId,
		loanId,
		businessUserId,
		createdByUserId,
		businessAddressIdAid1,
		businessAddressIdAid2,
	} = application;
	const {
		isDraftLoan,
		// isViewLoan,
		// isEditLoan,
		// isEditOrViewLoan,
		// editLoanData,
		selectedProduct,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		isTestMode,
		clientToken,
		selectedSection,
		isLocalhost,
		applicantCoApplicantSectionIds,
		editLoanDirectors,
	} = app;
	let { isViewLoan, isEditLoan, isEditOrViewLoan } = app;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
		isApplicant,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants?.[selectedApplicantCoApplicantId] || {};
	const { directorId } = selectedApplicant;
	if (isDraftLoan && !selectedApplicant?.permanent_address1) {
		isViewLoan = false;
		isEditLoan = false;
		isEditOrViewLoan = false;
	}
	const dispatch = useDispatch();
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const [loading, setLoading] = useState(false);

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

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};
	const onProceed = async () => {
		try {
			if (
				!formState?.values?.present_city ||
				!formState?.values?.present_state ||
				!formState?.values?.permanent_city ||
				!formState?.values?.permanent_state
			) {
				return addToast({
					message: 'Please enter valid pincode to get city and state',
					type: 'error',
				});
			}
			setLoading(true);
			const newLoanAddressDetails = [
				// {
				// 	business_address_id: businessAddressIdAid1,
				// 	aid: 1,
				// 	line1: formState?.values?.present_address1 || '',
				// 	line2: formState?.values?.present_address2 || '',
				// 	locality: formState?.values?.present_address3 || '',
				// 	pincode: formState?.values?.present_pin_code || '',
				// 	city: formState?.values?.present_city || '',
				// 	state: formState?.values?.present_state || '',
				// 	residential_type: formState?.values?.present_property_type || '',
				// 	residential_stability:
				// 		formState?.values?.present_property_tenure || '',
				// },
				{
					business_address_id: businessAddressIdAid2,
					aid: 2,
					line1: formState?.values?.permanent_address1 || '',
					line2: formState?.values?.permanent_address2 || '',
					locality: formState?.values?.permanent_address3 || '',
					pincode: formState?.values?.permanent_pin_code || '',
					city: formState?.values?.permanent_city || '',
					state: formState?.values?.permanent_state || '',
					// residential_type: formState?.values?.permanent_property_type || '',
					// residential_stability:
					// 	formState?.values?.permanent_property_tenure || '',
				},
			];

			const addressDetailsReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
				values: formState.values,
			});

			addressDetailsReqBody.data.loan_address_details = newLoanAddressDetails;

			// // KYC VERIFICATION RELATED CHANGES CR
			// addressDetailsReqBody.data.verify_kyc_data = cacheDocumentsTemp;
			// // permanent_address_proof_upload
			// // present_address_proof_upload
			// addressDetailsReqBody.data.permanent_address_proof_upload.doc_ref_id = permanentCacheDocumentsTemp?.filter(
			// 	doc => !!doc?.doc_ref_id
			// )?.[0]?.doc_ref_id;
			// addressDetailsReqBody.data.present_address_proof_upload.doc_ref_id = presentCacheDocumentsTemp?.filter(
			// 	doc => !!doc?.doc_ref_id
			// )?.[0]?.doc_ref_id;

			const addressDetailsRes = await axios.post(
				`${API.API_END_POINT}/basic_details`,
				addressDetailsReqBody
			);

			const newOtherUploadedDocumentsTemp = [];
			// if (otherdocs.length > 0) {
			// 	const formData = new FormData();
			// 	const otherDocsBorrowerApi = [];
			// 	const callLoanDocUpload = async idx => {
			// 		formData.append('document', idx.file);
			// 		let result = await axios.post(
			// 			`${API.API_END_POINT}/loanDocumentUpload?userId=${businessUserId}`,
			// 			formData
			// 		);
			// 		let leng = result.data.files.length;
			// 		let fd = { ...idx, document_key: result.data.files[leng - 1].fd };
			// 		otherDocsBorrowerApi.push(fd);
			// 	};
			// 	// call loanDocumentUpload to store the document on cloud
			// 	await asyncForEach(otherdocs, callLoanDocUpload);
			// 	const documentUploadReqBody = formatSectionReqBody({
			// 		app,
			// 		applicantCoApplicants,
			// 		application,
			// 	});

			// 	otherDocsBorrowerApi?.map(doc => {
			// 		if (doc?.document_id) return null;
			// 		newOtherUploadedDocumentsTemp.push({
			// 			...doc,
			// 			file: null,
			// 			preview: null,
			// 			id: doc.doc_type_id,
			// 			loan_id: loanId,
			// 			doc_type_id: doc.selectedDocTypeId,
			// 			is_delete_not_allowed: true,
			// 			isDocRemoveAllowed: false,
			// 			classification_type: doc?.isTagged?.classification_type,
			// 			classification_sub_type: doc?.isTagged?.classification_sub_type,
			// 			aid: doc?.isTagged?.id?.includes(
			// 				CONST_ADDRESS_DETAILS.PREFIX_PERMANENT
			// 			)
			// 				? CONST_ADDRESS_DETAILS.AID_PERMANENT
			// 				: CONST_ADDRESS_DETAILS.AID_PRESENT,
			// 			original_doc_name:
			// 				formState?.values?.[
			// 					`${doc?.prefix}${CONST.OTHERS_DOC_NAME_FIELD_NAME}`
			// 				],
			// 			document_id: 'placeholder',
			// 			// document is is required so in document upload page we do not resubmit this documents
			// 			// due to this user won't be able to view document
			// 		});
			// 		return null;
			// 	});
			// 	documentUploadReqBody.data.document_upload = newOtherUploadedDocumentsTemp;
			// 	// console.log('other-documentUploadReqBody-', { documentUploadReqBody });
			// 	// return;
			// 	await axios.post(`${API.BORROWER_UPLOAD_URL}`, documentUploadReqBody);
			// }

			const newAddressDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
				directorId,
			};
			if (isApplicant) {
				dispatch(
					setLoanIds({
						// businessAddressIdAid1: addressDetailsRes?.data?.data?.business_address_data?.filter(
						// 	address => address.aid === 1
						// )?.[0]?.id,
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

	const prefilledEditOrViewLoanValues = field => {
		const preData = {
			permanent_address1: selectedApplicant?.permanent_address1,
			permanent_address2: selectedApplicant?.permanent_address2,
			permanent_address3: selectedApplicant?.permanent_locality,
			permanent_pin_code: selectedApplicant?.permanent_pincode,
			permanent_city: selectedApplicant?.permanent_city,
			permanent_state: selectedApplicant?.permanent_state,
			permanent_property_type: selectedApplicant?.permanent_residential_type,
		};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		try {
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			if (isFormStateUpdated) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE
			let editViewLoanValue = '';

			if (isEditOrViewLoan) {
				editViewLoanValue = prefilledEditOrViewLoanValues(field);
			}

			if (editViewLoanValue) return editViewLoanValue;

			return field?.value || '';
		} catch (error) {
			return {};
		}
	};

	return (
		<UI_SECTIONS.Wrapper>
			{console.log(selectedSection)}
			{selectedSection?.sub_sections?.map((sub_section, subSectionIndex) => {
				// const isPermanent = sub_section.aid === CONST.AID_PERMANENT;
				return (
					<Fragment key={`section-${subSectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<UI.H1>Help us with your {sub_section.name}</UI.H1>
						) : null}

						<UI.FormWrapGrid>
							<UI.Coloum>
								{sub_section?.fields?.map((field, fieldIndex) => {
									if (!isFieldValid({ field, formState, isApplicant })) {
										return null;
									}

									if (sub_section.aid === CONST.AID_PRESENT) {
										if (CONST.HIDE_PRESENT_ADDRESS_FIELDS.includes(field.name))
											return null;
									}

									const newValue = prefilledValues(field);
									const customFieldProps = {};
									if (isViewLoan) {
										customFieldProps.disabled = true;
									}
									const customStyle = {};

									if (isSectionCompleted) {
										customFieldProps.disabled = true;
									}

									// TO overwrite all above condition and disable everything
									if (isViewLoan) {
										customFieldProps.disabled = true;
									}

									// in all the scenario this fields will be always disabled
									if (
										field.name.includes('city') ||
										field.name.includes('state')
									) {
										customFieldProps.disabled = true;
									}

									return (
										<UI.FieldWrapGrid
											field={field}
											key={`field-${'2222'}-${fieldIndex}-${field.name}`}
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
										</UI.FieldWrapGrid>
									);
								})}
							</UI.Coloum>
						</UI.FormWrapGrid>
					</Fragment>
				);
			})}
			<UI_SECTIONS.Footer>
				{!isViewLoan && (
					<Button
						fill
						name='Save and Proceed'
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

export default BusinessAddressDetails;
