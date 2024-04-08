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

const DynamicForm = props => {
	const bank_name = props.fields.filter(
		field => field?.db_key === CONST.BANK_NAME_DB_KEY
	);
	const {
		fields,
		onSaveOrUpdateSuccessCallback = () => {},
		onCancelCallback = () => {},
		prefillData = {},
		submitCTAName = 'Update',
		hideCancelCTA = false,
		isEditLoan,
		editSectionId = '',
		loanPreFetchdata,
	} = props;
	const isViewLoan = !isEditLoan;
	const { app, application } = useSelector(state => state);
	const {
		directors,
		selectedDirectorId,
		selectedDirectorOptions,
	} = useSelector(state => state.directors);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const {
		isTestMode,
		selectedSection,
		selectedProduct,
		isViewLoan: isViewLoanApp,
	} = app;
	const { businessName } = application;
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

	const fieldNameArr = [];
	selectedSection?.sub_sections?.map(sub_section => {
		sub_section?.fields?.map(field => {
			fieldNameArr.push(field?.name);
			return null;
		});
		return null;
	});
	// for fed use case when the data is fetched from customer id from fed portal
	const disableFieldIfPrefilledFromThirdPartyData = field => {
		/*
	This function checks if a form field should be disabled based on the configuration for disabling fields
	when prefilled from third-party data. It considers the selected product, completed sections, and specific
	fields to determine if the given field should be disabled.

	@param {Object} field - The form field object being evaluated.

	@returns {boolean} - Returns true if the field should be disabled, false otherwise.
	*/
		// if (field?.db_key === 'first_name') field.db_key = 'dfirstname';
		// 		if (field?.db_key === 'last_name') field.db_key = 'dfirstname';
		// 		if (field?.db_key === 'email') field.db_key = 'demail';
		// 		if (field?.db_key === 'contactno') field.db_key = 'dcontact';

		// Check if the product details specify disabling fields when prefilled and if the current section is not completed
		if (selectedProduct?.product_details?.disable_fields_if_prefilled) {
			// Check if the current field is listed in the predefined fields to disable if prefilled
			// and if the corresponding data is available in the business details of the section
			const currentLoanPrefetchData =
				loanPreFetchdata?.filter(data => data?.id === prefillData?.id)?.[0] ||
				{};
			const initailLib =
				currentLoanPrefetchData?.emi_details &&
				JSON.parse(currentLoanPrefetchData?.emi_details
					);
			const emiDetailsData= initailLib?.liability_details?.[0]||'';

			const libDataLowerCase = Object.entries(initailLib || {}).reduce(
				(acc, [key, value]) => {
					acc[key.toLowerCase()] = value;
					return acc;
				},
				{}
			);
			const emiDetailsLowerCase = Object.entries(emiDetailsData || {}).reduce(
				(acc, [key, value]) => {
					acc[key.toLowerCase()] = value;
					return acc;
				},
				{}
			);

			if (
				(fieldNameArr?.includes(field?.name) &&
					currentLoanPrefetchData?.[field?.db_key]) ||
				libDataLowerCase?.[field?.db_key] ||emiDetailsLowerCase?.[field?.db_key]
			) {
				return true; // Disable the field if conditions are met
			}
			return false;
		}

		return false; // Do not disable the field by default
	};

	const prefilledValues = field => {
		//TODO:  config field mis-matching, Temp Fixed for DOS-3949
		if (field['name'] === 'loan_type' && formState?.values['loan_type'] === '')
			return prefillData?.loan_sub_type;
		//OUTSTANDING AMOUNT CALC
		if (field['name'] === 'outstanding_loan_amount') {
			return (field['value'] =
				+formState?.values?.['emi_amount'] *
				+formState?.values?.['remaining_loan_tenure']);
		}
		try {
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

			editViewLoanValue = prefilledEditOrViewLoanValues(field);

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
			handleSubmit(onSaveOrUpdate());
		}
	};

	const onSaveOrUpdate = async data => {
		try {
			//VALIDATION FOR EMI AMOUNT AND REMAINING LOAN AMOUNT
			if (+data?.emi_amount >= +data?.total_loan_amount) {
				addToast({
					message: '"EMI amount" can not be more than "Total Loan Amount"',
					type: 'error',
				});
				return;
			}
			if (+data?.remaining_loan_tenure > +data?.total_tenure) {
				addToast({
					message:
						'"Remaining Loan Tenure" can not be more than "Total Tenure of Loan"',
					type: 'error',
				});
				return;
			}
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
			reqBody.data.liability_details.bank_name =
				bank_name?.length > 0 &&
				reqBody?.data?.liability_details?.financial_institution?.name;
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

	return (
		<React.Fragment>
			<UI_SECTIONS.FormWrapGrid>
				{fields?.map((field, fieldIndex) => {
					if (
						!isFieldValid({
							field,
							formState,
							isApplicant,
						})
					) {
						return null;
					}
					const customFieldProps = {};
					const newField = _.cloneDeep(field);
					const business = {
						name: businessName || 'Company/Business',
						value: '0',
					}; // get the business name here
					if (newField.name === CONST.FIELD_NAME_LIABILITIES_FOR) {
						newField.options = selectedProduct?.isSelectedProductTypeBusiness
							? [business, ...selectedDirectorOptions]
							: selectedDirectorOptions;
					}

					
					if (selectedProduct?.product_details?.disable_fields_if_prefilled) {
						customFieldProps.disabled = disableFieldIfPrefilledFromThirdPartyData(
							field
						);
					}
					if (isViewLoan || isViewLoanApp) {
						customFieldProps.disabled = true;
					}
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
						onClick={handleSubmit(() => {
							handleButtonClick();
						})}
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
