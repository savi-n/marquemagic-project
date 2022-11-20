import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import { updateApplicantSection } from 'store/applicantCoApplicantsSlice';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import * as SectionUI from 'components/Sections/ui';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import * as CONST from './const';
import { sleep } from 'utils/helper';
import { setSelectedSectionId } from 'store/appSlice';
import {
	setSelectedApplicantCoApplicantId,
	updateCoApplicantSection,
} from 'store/applicantCoApplicantsSlice';
import { formatSectionReqBody } from 'utils/formatData';
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
		firstSectionId,
		isTestMode,
		selectedSection,
	} = app;
	const {
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();

	const submitEmploymentDetails = async () => {
		try {
			// console.log('submitEmploymentDetails-', { formState });
			const employmentDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: formState.values,
				app,
				applicantCoApplicants,
				application,
			});

			let editEmploymentId = '';
			let editIncomeDataId = '';
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				editEmploymentId = applicant?.employmentId;
				editIncomeDataId = applicant?.incomeDataId;
			} else {
				editEmploymentId =
					coApplicants?.[selectedApplicantCoApplicantId]?.employmentId;
				editIncomeDataId =
					coApplicants?.[selectedApplicantCoApplicantId]?.incomeDataId;
			}
			if (editEmploymentId) {
				employmentDetailsReqBody.employment_id = editEmploymentId;
			}
			if (editIncomeDataId) {
				employmentDetailsReqBody.income_data_id = editIncomeDataId;
			}

			const employmentDetailsRes = await axios.post(
				`${API_END_POINT}/employmentData`,
				employmentDetailsReqBody
			);
			// console.log('-employmentDetailsRes-', {
			// 	employmentDetailsReqBody,
			// 	employmentDetailsRes,
			// });
			const newEmploymentDetails = {
				id: selectedSectionId,
				values: formState.values,
				employmentId: employmentDetailsRes?.data?.data?.employment_id,
				incomeDataId: employmentDetailsRes?.data?.data?.income_data_id,
			};
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				dispatch(updateApplicantSection(newEmploymentDetails));
			} else {
				newEmploymentDetails.directorId = selectedApplicantCoApplicantId;
				dispatch(updateCoApplicantSection(newEmploymentDetails));
			}
		} catch (error) {
			console.error('error-submitEmploymentDetails-', error);
		}
	};

	const onProceed = async () => {
		try {
			if (Object.keys(formState.values).length === 0) return onSkip();
			setLoading(true);
			await sleep(100);
			await submitEmploymentDetails();
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-EmploymentDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	const onSkip = () => {
		dispatch(
			updateApplicantSection({
				id: selectedSectionId,
				values: { isSkip: true },
			})
		);
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const onAddCoApplicant = async () => {
		setLoading(true);
		await submitEmploymentDetails();
		dispatch(setSelectedSectionId(firstSectionId));
		dispatch(
			setSelectedApplicantCoApplicantId(CONST_APP_CO_APP_HEADER.CO_APPLICANT)
		);
		setLoading(false);
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

			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				return (
					applicant?.[selectedSectionId]?.[field?.name] || field.value || ''
				);
			}
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.CO_APPLICANT
			) {
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

	let displayProceedCTA = true;
	if (
		selectedProduct?.product_details?.is_coapplicant_mandatory &&
		Object.keys(coApplicants || {})?.length <= 0
	) {
		displayProceedCTA = false;
	}

	// console.log('employment-details-', { coApplicants, app });

	return (
		<SectionUI.Wrapper>
			{selectedProduct?.product_details?.sections
				?.filter(section => section.id === selectedSectionId)?.[0]
				?.sub_sections?.map((sub_section, sectionIndex) => {
					return (
						<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
							{sub_section?.name ? (
								<SectionUI.SubSectionHeader>
									{sub_section.name}
								</SectionUI.SubSectionHeader>
							) : null}
							<SectionUI.FormWrapGrid>
								{sub_section?.fields?.map((field, fieldIndex) => {
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
									return (
										<SectionUI.FieldWrapGrid
											key={`field-${fieldIndex}-${field.name}`}
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
													<SectionUI.ErrorMessageSubFields>
														{formState?.error?.[field.name]}
													</SectionUI.ErrorMessageSubFields>
												) : (
													<SectionUI.ErrorMessage>
														{formState?.error?.[field.name]}
													</SectionUI.ErrorMessage>
												))}
										</SectionUI.FieldWrapGrid>
									);
								})}
							</SectionUI.FormWrapGrid>
						</Fragment>
					);
				})}
			<SectionUI.Footer>
				{displayProceedCTA && (
					<Button
						fill
						name={`${isViewLoan ? 'Next' : 'Proceed'}`}
						isLoader={loading}
						disabled={loading}
						onClick={handleSubmit(onProceed)}
						// onClick={onProceed}
					/>
				)}
				<Button
					fill
					name='Add Co-Applicant'
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onAddCoApplicant)}
					// onClick={onAddCoApplicant}
				/>
			</SectionUI.Footer>
		</SectionUI.Wrapper>
	);
};

export default EmploymentDetails;
