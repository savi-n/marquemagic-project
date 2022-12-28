import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import { updateApplicantSection } from 'store/applicantCoApplicantsSlice';
import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import Button from 'components/Button';

import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import {
	setSelectedApplicantCoApplicantId,
	updateCoApplicantSection,
} from 'store/applicantCoApplicantsSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	validateEmploymentDetails,
} from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';

const EmploymentDetails = () => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		selectedProduct,
		nextSectionId,
		prevSectionId,
		firstSectionId,
		isTestMode,
		isLocalhost,
		selectedSection,
		isEditLoan,
	} = app;
	const {
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants?.[selectedApplicantCoApplicantId] || {};
	const { directorId } = selectedApplicant;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();
	const submitEmploymentDetails = async () => {
		try {
			setLoading(true);
			const isValid = validateEmploymentDetails({
				coApplicants,
				isApplicant,
			});
			if (
				isValid === false &&
				selectedApplicant?.directorId !== +Object.keys(coApplicants).pop()
			) {
				addToast({
					message:
						'Please fill all the details in Co-Applicant-' +
						Object.keys(coApplicants)?.length,
					type: 'error',
				});
				return;
			}
			// console.log('submitEmploymentDetails-', { formState });
			const employmentDetailsReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
				values: formState.values,
			});

			if (selectedApplicant?.employmentId) {
				employmentDetailsReqBody.employment_id =
					selectedApplicant?.employmentId;
			}
			if (selectedApplicant?.incomeDataId) {
				employmentDetailsReqBody.income_data_id =
					selectedApplicant?.incomeDataId;
			}

			// console.log('-employmentDetailsReq-', {
			// 	employmentDetailsReqBody,
			// 	app,
			// 	applicantCoApplicants,
			// 	application,
			// });
			const employmentDetailsRes = await axios.post(
				`${API_END_POINT}/employmentData`,
				employmentDetailsReqBody
			);
			// console.log('-employmentDetailsRes-', {
			// 	employmentDetailsRes,
			// });
			const newEmploymentDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
				employmentId: employmentDetailsRes?.data?.data?.employment_id,
				incomeDataId: employmentDetailsRes?.data?.data?.income_data_id,
				directorId,
			};
			if (isApplicant) {
				dispatch(updateApplicantSection(newEmploymentDetails));
			} else {
				dispatch(updateCoApplicantSection(newEmploymentDetails));
			}
			return true;
		} catch (error) {
			console.error('error-submitEmploymentDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
			// TODO: Handle error toast and error code
			return false;
		} finally {
			setLoading(false);
		}
	};

	const onAddCoApplicant = async () => {
		const isEmploymentDetailsSubmited = await submitEmploymentDetails();
		if (!isEmploymentDetailsSubmited) return;
		dispatch(setSelectedApplicantCoApplicantId(CONST_SECTIONS.CO_APPLICANT));
		dispatch(setSelectedSectionId(firstSectionId));
	};

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};

	const onProceed = async () => {
		try {
			const isEmploymentDetailsSubmited = await submitEmploymentDetails();
			if (!isEmploymentDetailsSubmited) return;
			dispatch(setSelectedApplicantCoApplicantId(CONST_SECTIONS.APPLICANT));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-EmploymentDetails-onProceed-', error);
		}
	};

	const onSkipAddCoApplicant = () => {
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
		dispatch(setSelectedApplicantCoApplicantId(CONST_SECTIONS.CO_APPLICANT));
		dispatch(setSelectedSectionId(firstSectionId));
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
		const selectedEmploymentData =
			selectedApplicant?.employment_data?.[0] || {};
		const selectedEmploymentIncomeData = selectedApplicant?.incomeData || {};
		const preData = {
			...selectedEmploymentData,
			years_in_company: selectedEmploymentData?.year_in_company,
			pin_code: selectedEmploymentData?.pincode,
			organization_type_salaried_self_employed:
				selectedEmploymentData?.organization_type,
			organization_type_salaried: selectedEmploymentData?.organization_type,
			organization_type_business: selectedEmploymentData?.organization_type,
			organization_type_professional: selectedEmploymentData?.organization_type,
			organization_type_others: selectedEmploymentData?.organization_type,
			company_name: selectedEmploymentData?.company_name,
			...selectedEmploymentIncomeData,
		};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		try {
			if (isViewLoan) {
				return prefilledEditOrViewLoanValues(field) || '';
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

			if (
				Object.keys(selectedApplicant?.[selectedSectionId] || {}).length > 0
			) {
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

	let displayProceedCTA = true;
	if (
		selectedProduct?.product_details?.is_coapplicant_mandatory &&
		Object.keys(coApplicants || {})?.length <= 0
	) {
		displayProceedCTA = false;
	}

	// console.log('employment-details-', { coApplicants, app });

	return (
		<UI_SECTIONS.Wrapper>
			{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<UI_SECTIONS.SubSectionHeader>
								{sub_section.name}
							</UI_SECTIONS.SubSectionHeader>
						) : null}
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
								if (!field.visibility) return null;
								if (field?.for_type_name) {
									if (
										!field?.for_type.includes(
											formState?.values?.[field?.for_type_name]
										)
									)
										return null;
								}
								const customFieldProps = {};
								if (isViewLoan) {
									customFieldProps.disabled = true;
								}
								return (
									<UI_SECTIONS.FieldWrapGrid
										key={`field-${fieldIndex}-${field.name}`}
										style={
											field.type === 'address_proof_radio'
												? { gridColumn: 'span 2' }
												: {}
										}
									>
										{register({
											...field,
											value: prefilledValues(field),
											...customFieldProps,
											visibility: 'visible',
										})}
										{(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
											formState?.error?.[field.name] &&
											(field.subFields ? (
												<UI_SECTIONS.ErrorMessageSubFields>
													{formState?.error?.[field.name]}
												</UI_SECTIONS.ErrorMessageSubFields>
											) : (
												<UI_SECTIONS.ErrorMessage>
													{formState?.error?.[field.name]}
												</UI_SECTIONS.ErrorMessage>
											))}
									</UI_SECTIONS.FieldWrapGrid>
								);
							})}
						</UI_SECTIONS.FormWrapGrid>
					</Fragment>
				);
			})}
			<UI_SECTIONS.Footer>
				{displayProceedCTA && !isViewLoan && (
					<Button
						fill
						name='Proceed'
						isLoader={loading}
						disabled={loading}
						onClick={handleSubmit(onProceed)}
					/>
				)}
				{/* visibility of add co-applicant based on the config */}
				{/* {selectedSection?.add_co_applicant_visibility === false ||
				isViewLoan ? null : ( */}
				<Button
					fill
					name='Add Co-Applicant'
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onAddCoApplicant)}
				/>
				{/* )} */}
				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{/* buttons for easy development starts */}
				{!isViewLoan && (!!selectedSection?.is_skip || !!isTestMode) ? (
					<Button
						fill
						name='Skip Add-CoApplicant'
						disabled={loading}
						onClick={onSkipAddCoApplicant}
					/>
				) : null}
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

export default EmploymentDetails;
