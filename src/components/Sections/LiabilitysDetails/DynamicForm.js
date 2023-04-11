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
	getApplicantCoApplicantSelectOptions,
	isFieldValid,
} from 'utils/formatData';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST from './const';
import { API_END_POINT } from '_config/app.config';

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
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const { selectedSectionId, isTestMode, selectedSection } = app;
	const { isApplicant } = applicantCoApplicants;
	const { register, formState, handleSubmit } = useForm();
	const { addToast } = useToasts();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const prefilledEditOrViewLoanValues = field => {
		// Sample PrefillData Object;
		// 	{
		// 		"id": 19315,
		// 		"loan_id": 32830,
		// 		"business_id": 1234581634,
		// 		"fin_type": "Others",
		// 		"bank_id": 0,
		// 		"loan_type": 0,
		// 		"outstanding_balance": 0,
		// 		"outstanding_balance_unit": "",
		// 		"outstanding_start_date": "",
		// 		"outstanding_end_date": "",
		// 		"ints": "2023-03-23T06:21:46.000Z",
		// 		"account_type": null,
		// 		"account_number": null,
		// 		"account_limit": null,
		// 		"account_holder_name": null,
		// 		"limit_type": "Fixed",
		// 		"sanction_drawing_limit": {},
		// 		"IFSC": null,
		// 		"director_id": 997290,
		// 		"emi_details": "{\"description\":\"test\",\"liability_amount\":\"111\"}",
		// 		"source": null,
		// 		"subtype": null,
		// 		"remaining_loan_tenure": null,
		// 		"bank_remarks": null
		// }
		const preData = {
			...prefillData,
			liabilities_for: `${prefillData?.director_id || ''}`,
			liabilities_type: prefillData?.fin_type || '',
			loan_start_date: prefillData?.outstanding_start_date,
			outstanding_loan_amount: prefillData?.outstanding_balance,
			loan_type: prefillData?.subtype,
			financial_institution: prefillData?.bank_id,
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
					return application?.sections?.[selectedSectionId]?.[field?.name];
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

	const onSaveOrUpdate = async data => {
		try {
			// console.log('onProceed-Date-DynamicForm-', data);
			setIsSubmitting(true);
			const reqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
				},
				app,
				applicantCoApplicants,
				application,
			});
			if (editSectionId) {
				reqBody.data.liability_details.id = editSectionId;
			}
			if (
				typeof reqBody?.data?.liability_details?.financial_institution
					?.value === 'string'
			) {
				reqBody.data.liability_details.financial_institution = +reqBody?.data
					?.liability_details?.financial_institution?.value;
			}
			reqBody.data.liability_details = [reqBody.data.liability_details];
			const submitRes = await axios.post(
				`${API_END_POINT}/liability_details`,
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

	// console.log('DynamicForms-allstates-', {
	// 	fields,
	// 	app,
	// 	selectedSection,
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
					if (newField.name === CONST.FIELD_NAME_LIABILITIES_FOR) {
						newField.options = getApplicantCoApplicantSelectOptions({
							applicantCoApplicants,
						});
					}

					if (isViewLoan) {
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
			{!isViewLoan && (
				<>
					<Button
						customStyle={{ maxWidth: 150 }}
						onClick={handleSubmit(onSaveOrUpdate)}
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
