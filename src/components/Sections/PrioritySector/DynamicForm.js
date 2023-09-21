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
// import selectedSection from './sample.json';

const DynamicForm = props => {
	const {
		fields,
		onSaveOrUpdateSuccessCallback = () => {},
		onCancelCallback = () => {},
		prefillData = {},
		submitCTAName = 'Update',
		hideCancelCTA = true,
		// isEditLoan=false,
		editSectionId = '',
	} = props;
	const isViewLoan = false;
	// const isViewLoan = !isEditLoan;
	const { app, application } = useSelector(state => state);
	const {
		directors,
		selectedDirectorId,
		// selectedDirectorOptions,
	} = useSelector(state => state.directors);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const {
		isTestMode,
		selectedSection,
		// selectedProduct,
		isViewLoan: isViewLoanApp,
	} = app;
	// const { businessName } = application;
	const { register, formState, handleSubmit } = useForm();
	const { addToast } = useToasts();
	const [isSubmitting, setIsSubmitting] = useState(false);
	// console.log(fields, 'fields');
	const prefilledEditOrViewLoanValues = field => {
		const preData = {
			...prefillData,
			priority_sector_loan:!!prefillData?.priority_sector_loan,
			direct_agri:prefillData?.direct_agri,
			land_acres:prefillData?.land_acres,
			specify_acres:prefillData?.specify_acres,
			location:prefillData?.location,
			pincode:prefillData?.pincode,
			indirect_agri:prefillData?.indirect_agri,
			manufacturing_enterprises:prefillData?.manufacturing_enterprises,
			value_investment:prefillData?.value_investment,
			cc_limit:prefillData?.cc_limit
		};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
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
			// console.log('onProceed-Date-DynamicForm-', data);
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
				reqBody.data.assets_details.id = editSectionId;
			}
			// if (
			// 	typeof reqBody?.data?.assets_details?.financial_institution?.value ===
			// 	'string'
			// ) {
			// 	reqBody.data.assets_details.financial_institution = +reqBody?.data
			// 		?.assets_details?.financial_institution?.value;
			// }
			// reqBody.data.assets_details = [reqBody.data.assets_details];
			const submitRes = await axios.post(
				`${API_END_POINT}/priority_sector_details`,
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
					// const business = {
					// 	name: businessName || 'Company/Business',
					// 	value: '0',
					// };
					// if (newField.name === CONST.FIELD_NAME_ASSETS_FOR) {
					// 	// newField.options = selectedDirectorOptions;
					// 	newField.options = selectedProduct?.isSelectedProductTypeBusiness
					// 		? [business, ...selectedDirectorOptions]
					// 		: selectedDirectorOptions;
					// 	// newField.options.push(entity);
					// }

					if (isViewLoan || isViewLoanApp) {
						customFieldProps.disabled = true;
					}
					if (
						formState?.values?.priority_sector_loan !== 'true' &&
						newField.name !== CONST.PRIORITY_SECTOR_LOAN_CHECKBOX
					) {
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
