import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
	updateApplicantSection,
	updateCoApplicantSection,
	setSelectedApplicantCoApplicantId,
} from 'store/applicantCoApplicantsSlice';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import * as SectionUI from '../ui';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import { getRandomNumber, sleep } from 'utils/helper';
import { setSelectedSectionId } from 'store/appSlice';

const BasicDetails = props => {
	const app = useSelector(state => state.app);
	const { isViewLoan, selectedSectionId, selectedProduct, nextSectionId } = app;
	const {
		selectedApplicantCoApplicantId,
		applicant,
		coApplicants,
	} = useSelector(state => state.applicantCoApplicants);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();

	const onProceed = async () => {
		try {
			setLoading(true);
			const newDirectorId = `${getRandomNumber()}`;
			// console.log('nextSectionId-', {
			// 	nextSectionId,
			// 	selectedApplicantCoApplicantId,
			// 	newDirectorId,
			// });
			await sleep(100);
			const newBasicDetails = {
				id: selectedSectionId,
				values: formState.values,
			};
			// console.log('onProceed-', {
			// 	newBasicDetails,
			// });
			if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				dispatch(updateApplicantSection(newBasicDetails));
			} else if (
				selectedApplicantCoApplicantId === CONST_APP_CO_APP_HEADER.CO_APPLICANT
			) {
				newBasicDetails.directorId = newDirectorId;
				dispatch(updateCoApplicantSection(newBasicDetails));
				dispatch(setSelectedApplicantCoApplicantId(newDirectorId));
			} else {
				newBasicDetails.directorId = selectedApplicantCoApplicantId;
				dispatch(updateCoApplicantSection(newBasicDetails));
			}
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-BasicDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	const prefilledValues = field => {
		try {
			if (formState?.values?.[field.name] !== undefined) {
				return formState?.values?.[field.name];
			}
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

	return (
		<SectionUI.Wrapper>
			<form>
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
								<SectionUI.FormWrap>
									{sub_section?.fields?.map((field, fieldIndex) => {
										if (!field.visibility) return null;
										const newValue = prefilledValues(field);
										const customFields = {};
										return (
											<SectionUI.FieldWrap
												key={`field-${fieldIndex}-${field.name}`}
											>
												{register({
													...field,
													value: newValue,
													...customFields,
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
											</SectionUI.FieldWrap>
										);
									})}
								</SectionUI.FormWrap>
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
			</form>
		</SectionUI.Wrapper>
	);
};

export default BasicDetails;
