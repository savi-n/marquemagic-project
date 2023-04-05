import React, { useEffect } from 'react';
import { Fragment, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { updateApplicationSection, setLoanIds } from 'store/applicationSlice';
import {
	createIndexKeyObjectFromArrayOfObject,
	formatSectionReqBody,
	parseJSON,
} from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as UI from './ui';
import * as CONST from './const';

const EMIDetails = props => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		prevSectionId,
		selectedSection,
		isLocalhost,
		isTestMode,
		editLoanData,
		isEditLoan,
		isEditOrViewLoan,
		bankList,
	} = app;
	const { emiDetailsFinId } = application;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const selectedEmiDetailsSubSection = selectedSection?.sub_sections?.[0] || {};
	const [count, setCount] = useState(selectedEmiDetailsSubSection?.min || 3);
	const MAX_COUNT = selectedEmiDetailsSubSection?.max || 10;
	const { handleSubmit, register, formState } = useForm();
	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
	};
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
			const newValues = [];
			finalData.map(data => {
				if (data.emi_amount && data.bank_name) {
					let selectedBank = data?.bank_name;
					if (typeof selectedBank === 'string') {
						selectedBank = bankList.filter(
							bank => `${bank?.value}` === selectedBank
						)?.[0];
					}
					newValues.push({
						emi_amount: data?.emi_amount,
						bank_name: selectedBank?.name,
						bank_id: selectedBank?.value,
					});
				}
				return null;
			});
			const emiDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: newValues,
				app,
				applicantCoApplicants,
				application,
			});

			emiDetailsReqBody.data.emi_details = newValues;
			if (emiDetailsFinId) emiDetailsReqBody.data.fin_id = emiDetailsFinId;

			// console.log('-emiDetailsRes-', {
			// 	emiDetailsReqBody,
			// });
			// return;
			if (emiDetailsReqBody.data.emi_details?.length > 0) {
				const emiDetailsRes = await axios.post(
					`${API_END_POINT}/addBankDetailsNew`,
					emiDetailsReqBody
				);
				if (!emiDetailsFinId)
					dispatch(
						setLoanIds({ emiDetailsFinId: emiDetailsRes?.data?.data?.id })
					);
			}
			// console.log('-emiDetailsRes-', {
			// 	emiDetailsRes,
			// });
			const newEmiDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
			dispatch(updateApplicationSection(newEmiDetails));
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
				...(application?.sections?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		if (
			isEditLoan &&
			!application?.sections?.hasOwnProperty(selectedSectionId)
		) {
			skipSectionData.sectionValues = { ...formState.values };
		}
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prefilledEditOrViewLoanValues = field => {
		// console.log('emi details', editLoanData);
		const emiDetails = parseJSON(
			editLoanData?.bank_details?.filter(
				bank => `${bank.id}` === `${emiDetailsFinId}`
			)?.[0]?.emi_details || '{}'
		);
		const emiDetailsIndex = createIndexKeyObjectFromArrayOfObject({
			arrayOfObject: emiDetails,
			isEmiDetails: true,
			isEditOrViewLoan,
		});
		const preData = {
			...emiDetailsIndex,
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
				Object.keys(application?.sections?.[selectedSectionId] || {}).length > 0
			) {
				// special scenario for bank name prefetch
				if (application?.sections?.[selectedSectionId]?.[field?.name]?.value) {
					return application?.sections?.[selectedSectionId]?.[field?.name]
						?.value;
				} else {
					// if (
					// 	!application?.sections?.[selectedSectionId]?.hasOwnProperty(
					// 		'isSkip'
					// 	)
					// ) {
					return application?.sections?.[selectedSectionId]?.[field?.name];
					// }
				}
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

	const onAdd = () => {
		if (isViewLoan) return;
		if (count >= MAX_COUNT) return;
		setCount(count + 1);
	};

	const createForm = subSection => {
		let sections = [];
		let filledCount =
			Object.keys(application?.sections?.[selectedSectionId] || {}).length === 0
				? 0
				: Object.keys(application?.sections?.[selectedSectionId] || {}).length /
				  2;
		if (!isNaN(filledCount) && filledCount > count) setCount(filledCount);
		else filledCount = count;
		for (let x = 0; x < filledCount; x++) {
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
			if (isViewLoan) {
				customFieldProps.disabled = true;
			}
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

	useEffect(() => {
		if (isEditOrViewLoan) {
			const emiDetails = parseJSON(
				editLoanData?.bank_details?.filter(
					bank => `${bank?.id}` === `${emiDetailsFinId}`
				)?.[0]?.emi_details || '{}'
			);
			if (emiDetails.length > 3) {
				setCount(emiDetails.length);
			}
		}
		// eslint-disable-next-line
	}, []);

	// console.log('EMIDetails-allstates-', {
	// 	app,
	// 	selectedSection,
	// 	selectedEmiDetailsSubSection,
	// });

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
				{isLocalhost && !isViewLoan && (
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

export default EMIDetails;
