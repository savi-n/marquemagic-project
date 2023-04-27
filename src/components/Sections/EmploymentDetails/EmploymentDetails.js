import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import Button from 'components/Button';
import NavigateCTA from 'components/Sections/NavigateCTA';

import * as UI_SECTIONS from 'components/Sections/ui';
// import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
import { setSelectedSectionId } from 'store/appSlice';
import {
	setAddNewDirectorKey,
	setCompletedDirectorSection,
	setSelectedDirectorId,
} from 'store/directorsSlice';
import {
	formatSectionReqBody,
	// getApplicantNavigationDetails,
	getApiErrorMessage,
	// validateEmploymentDetails,
} from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';

const EmploymentDetails = () => {
	const { app, application } = useSelector(state => state);
	const {
		directors,
		applicantDirectorId,
		isApplicant,
		selectedDirectorId,
	} = useSelector(state => state.directors);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		firstSectionId,
		isTestMode,
		selectedSection,
		isEditLoan,
		isDraftLoan,
	} = app;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();

	// const {
	// 	nextApplicantDirectorId,
	// 	lastDirectorId,
	// 	isLastApplicantIsSelected,
	// } = getApplicantNavigationDetails({
	// 	applicant,
	// 	coApplicants,
	// 	selectedDirector,
	// });

	const validateNavigation = () => {
		// TODO: shreyas update logic
		// const isValid = validateEmploymentDetails({
		// 	coApplicants,
		// 	isApplicant,
		// });
		// if (
		// 	isValid === false &&
		// 	selectedDirector?.directorId !== +Object.keys(coApplicants).pop()
		// ) {
		// 	addToast({
		// 		message:
		// 			'Please fill all the details in Co-Applicant-' +
		// 			Object.keys(coApplicants)?.length,
		// 		type: 'error',
		// 	});
		// 	return false;
		// }
		return true;
	};

	const submitEmploymentDetails = async () => {
		try {
			setLoading(true);
			// console.log('submitEmploymentDetails-', { formState });
			const employmentDetailsReqBody = formatSectionReqBody({
				app,
				selectedDirector,
				application,
				values: formState.values,
			});

			if (selectedDirector?.employmentId) {
				employmentDetailsReqBody.employment_id = selectedDirector?.employmentId;
			}
			if (selectedDirector?.incomeDataId) {
				employmentDetailsReqBody.income_data_id =
					selectedDirector?.incomeDataId;
			}

			// console.log('-employmentDetailsReq-', {
			// 	employmentDetailsReqBody,
			// 	app,
			// 	selectedDirector,
			// 	application,
			// });
			// const employmentDetailsRes =
			await axios.post(
				`${API_END_POINT}/employmentData`,
				employmentDetailsReqBody
			);
			// console.log('-employmentDetailsRes-', {
			// 	employmentDetailsRes,
			// });
			dispatch(setCompletedDirectorSection(selectedSectionId));
			return true;
		} catch (error) {
			console.error('error-submitEmploymentDetails-onSaveAndProceed-', {
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

	const onAddDirector = async () => {
		if (!isDraftLoan && !validateNavigation()) {
			return;
		}

		const isEmploymentDetailsSubmited = await submitEmploymentDetails();
		if (!isEmploymentDetailsSubmited) return;
		dispatch(setSelectedDirectorId(''));
		dispatch(setSelectedSectionId(firstSectionId));
	};

	const onSaveAndProceed = async () => {
		try {
			if (!isDraftLoan && !validateNavigation()) {
				return;
			}

			const isEmploymentDetailsSubmited = await submitEmploymentDetails();
			if (!isEmploymentDetailsSubmited) return;

			// TODO: udpate draft logics
			// draft stage next applicant exist
			// if (isDraftLoan && !isLastApplicantIsSelected) {
			// 	dispatch(setSelectedDirectorId(nextApplicantDirectorId));
			// 	dispatch(setSelectedSectionId(firstSectionId));
			// 	return;
			// }

			// draft stage last applicant
			// if (isDraftLoan && isLastApplicantIsSelected) {
			// 	dispatch(setselectedDirectorCoApplicantId(CONST_SECTIONS.APPLICANT));
			// 	dispatch(setSelectedSectionId(nextSectionId));
			// 	return;
			// }

			dispatch(setSelectedDirectorId(applicantDirectorId));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-EmploymentDetails-onSaveAndProceed-', error);
		}
	};

	const prefilledEditOrViewLoanValues = field => {
		const selectedEmploymentData = selectedDirector?.employment_data?.[0] || {};
		const selectedEmploymentIncomeData = selectedDirector?.incomeData || {};
		const preData = {
			...selectedEmploymentData,
			years_in_company: selectedEmploymentData?.year_in_company,
			pin_code: selectedEmploymentData?.pincode,
			organization_type: selectedEmploymentData?.organization_type,
			organization_type_salaried_self_employed:
				selectedEmploymentData?.organization_type,
			organization_type_salaried: selectedEmploymentData?.organization_type,
			organization_type_business: selectedEmploymentData?.organization_type,
			organization_type_professional: selectedEmploymentData?.organization_type,
			organization_type_others: selectedEmploymentData?.organization_type,
			company_name: selectedEmploymentData?.company_name,
			employee_number: selectedDirector?.employee_number,
			retirement_age: selectedDirector?.retirement_age,
			deductions: selectedDirector?.deductions,
			income_loan_repayment: selectedDirector?.income_loan_repayment,
			...selectedEmploymentIncomeData,
		};
		return preData?.[field?.name];
	};
	// const selectedEmploymentData = selectedDirector?.employment_data?.[0] || {};
	// console.log(selectedEmploymentData);
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

			if (Object.keys(selectedDirector?.[selectedSectionId] || {}).length > 0) {
				return selectedDirector?.[selectedSectionId]?.[field?.name];
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
	let displayAddCoApplicantCTA = true;

	// TODO: varun validate CTA based on coapplicant count
	// if (
	// 	isViewLoan ||
	// 	(selectedProduct?.product_details?.is_coapplicant_mandatory &&
	// 		Object.keys(coApplicants || {})?.length <= 0)
	// ) {
	// 	displayProceedCTA = false;
	// }

	if (selectedSection?.add_co_applicant_visibility === false || isViewLoan) {
		displayAddCoApplicantCTA = false;
	}

	// TODO: update draft validation logic
	// if (isDraftLoan && !isLastApplicantIsSelected) {
	// 	displayAddCoApplicantCTA = false;
	// }

	console.log('employment-details-', { app });

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
												? {
														gridColumn: 'span 2',
												  }
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
				{displayProceedCTA && (
					<Button
						fill
						name='Save and Proceed'
						isLoader={loading}
						disabled={loading}
						onClick={handleSubmit(onSaveAndProceed)}
					/>
				)}
				{/* visibility of add co-applicant based on the config */}
				{displayAddCoApplicantCTA && (
					<Button
						fill
						name='Add Co-Applicant'
						isLoader={loading}
						disabled={loading}
						onClick={handleSubmit(() => {
							dispatch(setAddNewDirectorKey('Co-applicant'));
							onAddDirector();
						})}
					/>
				)}
				{selectedSection?.footer?.fields?.map((field, fieldIndex) => {
					return (
						<Button
							key={`field${fieldIndex}`}
							fill
							name={field?.name}
							isLoader={loading}
							disabled={loading}
							onClick={handleSubmit(() => {
								dispatch(setAddNewDirectorKey(field.key));
								onAddDirector();
							})}
						/>
					);
				})}
				<NavigateCTA />
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default EmploymentDetails;
