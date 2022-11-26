import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import * as SectionUI from 'components/Sections/ui';
// import * as CONST_SECTIONS from 'components/Sections/const';
import * as CONST from './const';
import { sleep } from 'utils/helper';
import { setSelectedSectionId } from 'store/appSlice';
import {
	updateApplicantSection,
	// updateCoApplicantSection,
} from 'store/applicantCoApplicantsSlice';
import { updateApplicationSection } from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApplicantCoApplicantSelectOptions,
} from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';

const LoanDetails = () => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		selectedProduct,
		nextSectionId,
		// firstSectionId,
		isTestMode,
		selectedSection,
	} = app;
	const {
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
		isApplicant,
	} = applicantCoApplicants;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();

	const submitLoanDetails = async () => {
		try {
			// console.log('submitLoanDetails-', { formState });
			const loanDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: formState.values,
				app,
				applicantCoApplicants,
				application,
			});

			let editEmploymentId = '';
			let editIncomeDataId = '';
			if (isApplicant) {
				editEmploymentId = applicant?.employmentId;
				editIncomeDataId = applicant?.incomeDataId;
			} else {
				editEmploymentId =
					coApplicants?.[selectedApplicantCoApplicantId]?.employmentId;
				editIncomeDataId =
					coApplicants?.[selectedApplicantCoApplicantId]?.incomeDataId;
			}
			if (editEmploymentId) {
				loanDetailsReqBody.employment_id = editEmploymentId;
			}
			if (editIncomeDataId) {
				loanDetailsReqBody.income_data_id = editIncomeDataId;
			}

			const loanDetailsRes = await axios.post(
				`${API_END_POINT}/updateLoanDetails`,
				loanDetailsReqBody
			);
			// console.log('-loanDetailsRes-', {
			// 	loanDetailsReqBody,
			// 	loanDetailsRes,
			// });
			const newLoanDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
			dispatch(updateApplicationSection(newLoanDetails));
			// if (isApplicant) {
			// 	dispatch(updateApplicantSection(newLoanDetails));
			// } else {
			// 	newLoanDetails.directorId = selectedApplicantCoApplicantId;
			// 	dispatch(updateCoApplicantSection(newLoanDetails));
			// }
		} catch (error) {
			console.error('error-submitLoanDetails-', error);
		}
	};
	// useEffect(() => {
	// 	console.log(coApplicants, '8888');
	// }, []);
	const onProceed = async () => {
		try {
			if (Object.keys(formState.values).length === 0) return onSkip();
			setLoading(true);
			await sleep(100);
			await submitLoanDetails();
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-LoanDetails-onProceed-', error);
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

			return (
				application?.sections?.[selectedSectionId]?.[field?.name] ||
				field.value ||
				''
			);
		} catch (error) {
			return {};
		}
	};

	// console.log('employment-details-', { coApplicants, app });

	return (
		<SectionUI.Wrapper style={{ marginTop: 50 }}>
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
									const newField = _.cloneDeep(field);
									if (!newField.visibility) return null;
									if (newField?.for_type_name) {
										if (
											!newField?.for_type.includes(
												formState?.values?.[newField?.for_type_name]
											)
										)
											return null;
									}
									if (newField.name === 'imd_paid_by') {
										const newOptions = getApplicantCoApplicantSelectOptions(
											applicantCoApplicants
										);
										newField.options = [...newOptions, ...newField.options];
									}
									const customFieldProps = {};
									return (
										<SectionUI.FieldWrapGrid
											key={`field-${fieldIndex}-${newField.name}`}
										>
											{register({
												...newField,
												value: prefilledValues(newField),
												...customFieldProps,
												visibility: 'visible',
											})}
											{(formState?.submit?.isSubmited ||
												formState?.touched?.[newField.name]) &&
												formState?.error?.[newField.name] && (
													<SectionUI.ErrorMessage>
														{formState?.error?.[newField.name]}
													</SectionUI.ErrorMessage>
												)}
										</SectionUI.FieldWrapGrid>
									);
								})}
							</SectionUI.FormWrapGrid>
						</Fragment>
					);
				})}
			<SectionUI.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed)}
					// onClick={onProceed}
				/>
			</SectionUI.Footer>
		</SectionUI.Wrapper>
	);
};

export default LoanDetails;
