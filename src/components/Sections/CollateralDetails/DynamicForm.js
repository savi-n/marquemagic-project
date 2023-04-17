import React, { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	isFieldValid,
} from 'utils/formatData';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST from './const';
import { API_END_POINT } from '_config/app.config';
// import selectedSection from './sample.json';

const DynamicForm = props => {
	const {
		subSections = [],
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
		// 	"loanAssetRecord": [
		// 		{
		// 				"id": 108,
		// 				"business_id": 1,
		// 				"loan_id": 1,
		// 				"property_type": "Leased",
		// 				"loan_asset_type_id": 2,
		// 				"owned_type": "Paid_Off",
		// 				"address1": "test address1",
		// 				"address2": "test address2",
		// 				"flat_no": "112",
		// 				"locality": "ramnagar",
		// 				"city": "banglore",
		// 				"state": "",
		// 				"pincode": "570000",
		// 				"name_landmark": "SI ATM",
		// 				"automobile_type": "qw",
		// 				"brand_name": "d",
		// 				"model_name": "fd",
		// 				"value_Vehicle": "122",
		// 				"dealership_name": "sd",
		// 				"manufacturing_yr": "123",
		// 				"value": "test@123",
		// 				"ints": "2021-06-16T02:05:40.000Z",
		// 				"cersai_rec_path": "",
		// 				"survey_no": "",
		// 				"cersai_asset_id": "",
		// 				"no_of_assets": 5,
		// 				"type_of_land": "5",
		// 				"village_name": "",
		// 				"extent_of_land": "",
		// 				"forced_sale_value": 0,
		// 				"sq_feet": 0,
		// 				"insurance_required": "YES",
		// 				"priority": "NA",
		// 				"ec_applicable": "YES",
		// 				"exShowroomPrice": null,
		// 				"accessories": null,
		// 				"insurance": null,
		// 				"roadTax": null,
		// 				"loan_type": "Take over of existing loan from Bank",
		// 				"loan_json": {
		// 						"bank": "other",
		// 						"bankName": "VARUN",
		// 						"outstanding": "333"
		// 				},
		// 				"current_occupant": null
		// 		}
		// ],
		const preData = {
			...prefillData,
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
			reqBody.data = [
				{
					collateral_details: reqBody.data.collateral_details,
					property_address_details: reqBody.data.property_address_details,
				},
			];
			if (editSectionId) {
				reqBody.data[0].id = editSectionId;
			}
			const submitRes = await axios.post(
				`${API_END_POINT}/collateralData`,
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
			{subSections?.map((subSection, subSectionIndex) => {
				return (
					<Fragment key={`subSection-${subSectionIndex}-${subSection?.id}`}>
						{subSection?.name ? (
							<UI_SECTIONS.SubSectionHeader>
								{subSection.name}
							</UI_SECTIONS.SubSectionHeader>
						) : null}
						<UI_SECTIONS.FormWrapGrid>
							{subSection?.fields?.map((field, fieldIndex) => {
								if (!isFieldValid({ field, formState, isApplicant })) {
									return null;
								}
								const customFieldProps = {};
								const newField = _.cloneDeep(field);
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
					</Fragment>
				);
			})}
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
