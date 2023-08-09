import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	isDirectorApplicant,
	isFieldValid,
	checkAllInputsForm,
} from 'utils/formatData';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST from './const';
import { API_END_POINT } from '_config/app.config';
import { useEffect } from 'react';
// import selectedSection from './sample.json';

const DynamicForm = props => {
	const {
		fields,
		onSaveOrUpdateSuccessCallback = () => {},
		onCancelCallback = () => {},
		prefillData = {},
		submitCTAName = 'Update',
		hideCancelCTA = false,
		isEditLoan,
		editSectionId = '',
	} = props;
	const isViewLoan = !isEditLoan;
	const { app, application } = useSelector(state => state);
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const { isTestMode, selectedSection, isViewLoan: isViewLoanApp } = app;
	const { register, formState, handleSubmit, forceUpdate } = useForm();
	const { addToast } = useToasts();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const prefilledEditOrViewLoanValues = field => {
		return prefillData?.[field?.name];
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

	const handleButtonClick = () => {
		if (checkAllInputsForm(formState?.values || {})) {
			addToast({
				message: 'Please enter at least one input',
				type: 'error',
			});
		} else {
			onSaveOrUpdate();
		}
	};

	const onSaveOrUpdate = async data => {
		try {
			// console.log('onProceed-Date-DynamicForm-', data);
			forceUpdate();
			setIsSubmitting(true);
			const reqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
				},
				app,
				selectedDirector,
				application,
			});
			if (editSectionId) {
				reqBody.data.bank_details.id = editSectionId;
			}
			let newBankId = reqBody.data.bank_details.bank_id;
			// console.log('reqBody-before-', { newBankId });
			if (typeof newBankId !== 'string' && typeof newBankId !== 'number') {
				newBankId = newBankId?.value;
			}
			newBankId = `${newBankId}`;
			reqBody.data.bank_details.bank_id = newBankId;
			reqBody.data.bank_details = [reqBody.data.bank_details];
			const submitRes = await axios.post(
				`${API_END_POINT}/bank_details`,
				reqBody
			);
			if (submitRes?.data?.status === 'ok') {
				onSaveOrUpdateSuccessCallback();
				addToast({
					message: submitRes?.data?.message || 'Success',
					type: 'success',
				});
			}
			// console.log('submitRes-', submitRes);
		} catch (error) {
			console.error('error-onSaveOrUpdate-', error);
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setIsSubmitting(false);
		}
	};
	useEffect(() => {
		addToast({
			message: 'Please enter new IFsc code',
			type: 'error',
		});
		//eslint-disable-next-line
	}, [formState?.values?.bank_name]);
	// 	fields,
	// 	app,
	// 	selectedSection,
	// 	prefillData,
	// });

	return (
		<React.Fragment>
			<UI_SECTIONS.FormWrapGrid>
				{fields?.map((field, fieldIndex) => {
					if (!isFieldValid({ field, formState, isApplicant })) {
						return null;
					}
					const customFieldProps = {};
					const newField = _.cloneDeep(field);
					if (isViewLoan || isViewLoanApp) {
						customFieldProps.disabled = true;
					}
					// console.log('render-field-', {
					// 	field,
					// 	customFieldProps,
					// 	isViewLoan,
					// 	newField,
					// 	formState,
					// });
					return (
						<UI_SECTIONS.FieldWrapGrid key={`field-${fieldIndex}`}>
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
				})}
			</UI_SECTIONS.FormWrapGrid>
			{!isViewLoan && !isViewLoanApp && (
				<>
					<Button
						customStyle={{ maxWidth: 150 }}
						onClick={handleSubmit(handleButtonClick)}
						disabled={isSubmitting}
						isLoader={isSubmitting}
						name={submitCTAName}
					/>
					{hideCancelCTA ? null : (
						<Button
							name='Cancel'
							customStyle={{ maxWidth: 120, marginLeft: 20 }}
							onClick={() => onCancelCallback(editSectionId)}
						/>
					)}
				</>
			)}
		</React.Fragment>
	);
};

export default DynamicForm;
