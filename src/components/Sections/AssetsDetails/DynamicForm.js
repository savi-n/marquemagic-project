import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	formatSectionReqBody,
	getApplicantCoApplicantSelectOptions,
	isFieldValid,
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
		// Sample PrefillData Object; // TODO: update data
		// accessories: 0;
		// address1: '';
		// address2: '';
		// automobile_type: '';
		// brand_name: '';
		// business_id: 1234581764;
		// cersai_asset_id: '';
		// cersai_rec_path: '';
		// city: '';
		// current_occupant: '';
		// dealership_name: '';
		// ec_applicable: 'YES';
		// exShowroomPrice: 0;
		// extent_of_land: '';
		// flat_no: '';
		// forced_sale_value: 0;
		// id: 4375;
		// insurance: 0;
		// insurance_required: 'YES';
		// ints: '2023-03-27T14:17:20.000Z';
		// loan_asset_type_id: 67;
		// loan_id: 32974;
		// loan_json: null;
		// loan_type: '';
		// locality: '';
		// manufacturing_yr: '';
		// model_name: '';
		// name_landmark: '';
		// no_of_assets: 0;
		// owned_type: '';
		// pincode: '560078';
		// priority: 'NA';
		// property_type: 'Owned';
		// roadTax: 0;
		// sq_feet: 0;
		// state: 'bangalore';
		// survey_no: '';
		// type_of_land: '';
		// value: '111';
		// value_Vehicle: '';
		// village_name: '';
		const preData = {
			...prefillData,
			assets_for: `${prefillData?.director_id || ''}`,
			asset_type: `${prefillData?.loan_asset_type_id}` || '',
			amount: prefillData?.value,
			estimated_value: prefillData?.value,
			property_description: prefillData?.property_description,
			description: prefillData?.property_description,
			property_survey_umber: prefillData?.survey_no,
			address_line1: prefillData?.address1,
			address_line2: prefillData?.address2,
			landmark: prefillData?.name_landmark,
			pincode: prefillData?.pincode,
			city: prefillData?.city,
			state: prefillData?.state,
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
				reqBody.data.assets_details.id = editSectionId;
			}
			if (
				typeof reqBody?.data?.assets_details?.financial_institution?.value ===
				'string'
			) {
				reqBody.data.assets_details.financial_institution = +reqBody?.data
					?.assets_details?.financial_institution?.value;
			}
			reqBody.data.assets_details = [reqBody.data.assets_details];
			const submitRes = await axios.post(
				`${API_END_POINT}/assets_details`,
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
					if (newField.name === CONST.FIELD_NAME_ASSETS_FOR) {
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
