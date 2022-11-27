import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import { updateApplicantSection } from 'store/applicantCoApplicantsSlice';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
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
	} = app;
	const {
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants[selectedApplicantCoApplicantId];
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();

	const submitEmploymentDetails = async () => {
		try {
			setLoading(true);
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

			console.log('-employmentDetailsReq-', {
				employmentDetailsReqBody,
				app,
				applicantCoApplicants,
				application,
			});
			const employmentDetailsRes = await axios.post(
				`${API_END_POINT}/employmentData`,
				employmentDetailsReqBody
			);
			console.log('-employmentDetailsRes-', {
				employmentDetailsRes,
			});
			const newEmploymentDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
				employmentId: employmentDetailsRes?.data?.data?.employment_id,
				incomeDataId: employmentDetailsRes?.data?.data?.income_data_id,
			};
			if (isApplicant) {
				dispatch(updateApplicantSection(newEmploymentDetails));
			} else {
				dispatch(updateCoApplicantSection(newEmploymentDetails));
			}
			return true;
		} catch (error) {
			console.error('error-submitEmploymentDetails-', error);
			// TODO: Handle error toast and error code
			return false;
		} finally {
			setLoading(false);
		}
	};

	const onProceed = async () => {
		try {
			const isEmploymentDetailsSubmited = await submitEmploymentDetails();
			if (!isEmploymentDetailsSubmited) return;
			dispatch(setSelectedSectionId(nextSectionId));
			dispatch(setSelectedApplicantCoApplicantId(CONST_SECTIONS.APPLICANT));
		} catch (error) {
			console.error('error-EmploymentDetails-onProceed-', error);
		}
	};

	const onAddCoApplicant = async () => {
		const isEmploymentDetailsSubmited = await submitEmploymentDetails();
		if (!isEmploymentDetailsSubmited) return;
		dispatch(setSelectedSectionId(firstSectionId));
		dispatch(setSelectedApplicantCoApplicantId(CONST_SECTIONS.CO_APPLICANT));
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
			{selectedProduct?.product_details?.sections
				?.filter(section => section.id === selectedSectionId)?.[0]
				?.sub_sections?.map((sub_section, sectionIndex) => {
					return (
						<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
							{sub_section?.name ? (
								<UI_SECTIONS.SubSectionHeader>
									{sub_section.name}
								</UI_SECTIONS.SubSectionHeader>
							) : null}
							<UI_SECTIONS.FormWrapGrid>
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
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default EmploymentDetails;
