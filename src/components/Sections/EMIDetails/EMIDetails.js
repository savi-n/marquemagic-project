import React from 'react';
import { Fragment, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';
import { formatSectionReqBody } from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';

const EMIDetails = props => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		isLocalhost,
		isTestMode,
	} = app;
	const { applicant, isApplicant } = applicantCoApplicants;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const selectedEmiDetailsSubSection = selectedSection?.sub_sections?.[0] || {};
	const [count, setCount] = useState(selectedEmiDetailsSubSection?.min || 3);
	const MAX_COUNT = selectedEmiDetailsSubSection?.max || 10;
	const { handleSubmit, register, formState } = useForm();

	const onProceed = async () => {
		try {
			setLoading(true);

			let finalData = [];

			for (const key in formState.values) {
				const i = Number(key.substring(key.length - 1));
				const newKeyName = key.substring(0, key.length - 2);
				finalData[i] = {
					...(finalData[i] || {}),
					[newKeyName]: formState.values[key],
				};
			}
			const emiDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: finalData,
				app,
				applicantCoApplicants,
				application,
			});

			emiDetailsReqBody.data.emi_details = finalData;
			console.log(applicant);

			let editLoanDataId = '';
			if (isApplicant) {
				editLoanDataId = applicant?.loan_id;
			}
			if (editLoanDataId) {
				emiDetailsReqBody.loan_id = editLoanDataId;
			}

			const loanDetailsRes = await axios.post(
				`${API_END_POINT}/addBankDetailsNew`,
				emiDetailsReqBody
			);

			console.log('-loanDetailsRes-', {
				emiDetailsReqBody,
				loanDetailsRes,
			});

			const newLoanDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
			dispatch(updateApplicationSection(newLoanDetails));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-LoanDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prefilledValues = field => {
		try {
			// if (formState?.values?.[field.name] !== undefined) {
			// 	return formState?.values?.[field.name];
			// }

			// // TEST MODE
			// if (isTestMode && CONST.initialFormState?.[field?.name]) {
			// 	return CONST.initialFormState?.[field?.name];
			// }
			// // -- TEST MODE

			return (
				application?.sections?.[selectedSectionId]?.[field?.name] ||
				field.value ||
				''
			);
		} catch (error) {
			return {};
		}
	};

	const onAdd = () => {
		if (isViewLoan) return;
		if (count >= MAX_COUNT) return;
		setCount(count + 1);
	};

	const createForm = subSection => {
		let sections = [];
		for (let x = 0; x < count; x++) {
			sections.push(subSection);
		}
		return sections;
	};
	const renderSubSection = (sub_section, index) =>
		sub_section.fields?.map((field, fieldIndex) => {
			const newField = _.cloneDeep(field);
			if (!newField.visibility) return null;
			if (newField?.for_type_name) {
				if (
					!newField?.for_type.includes(
						index
							? formState?.values?.[newField?.for_type_name]
							: formState?.values?.[newField?.for_type_name]
					)
				)
					return null;
			}
			const customFieldProps = {};
			newField.db_key = newField.db_key + '_' + index;
			newField.name = newField.name + '_' + index;
			return (
				<UI_SECTIONS.FieldWrapGrid
					id={`field-${index}-${fieldIndex}-${newField.name}`}
					key={`field-${index}-${fieldIndex}-${newField.name}`}
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
							<UI_SECTIONS.ErrorMessage>
								{formState?.error?.[newField.name]}
							</UI_SECTIONS.ErrorMessage>
						)}
				</UI_SECTIONS.FieldWrapGrid>
			);
		});

	console.log('EMIDetails-allstates-', {
		selectedSection,
		selectedEmiDetailsSubSection,
	});

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{selectedSection.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<UI_SECTIONS.SubSectionHeader>
								{sub_section.name}
							</UI_SECTIONS.SubSectionHeader>
						) : null}
						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.is_dynamic === true
								? createForm(sub_section, count).map(
										(sub_section_array, index) => {
											return renderSubSection(sub_section_array, index);
										}
								  )
								: renderSubSection(sub_section)}
						</UI_SECTIONS.FormWrapGrid>
					</Fragment>
				);
			})}
			<UI.AddMoreWrapper>
				<UI.RoundButton
					onClick={onAdd}
					disabled={isViewLoan || count >= MAX_COUNT}
				>
					+
				</UI.RoundButton>{' '}
				click to add additional deductions/repayment obligations
			</UI.AddMoreWrapper>
			<UI_SECTIONS.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed)}
					// onClick={onProceed}
				/>
				<Button name='Skip' onClick={onSkip} />
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

export default EMIDetails;
