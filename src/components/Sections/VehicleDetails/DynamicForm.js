import React, { useState, Fragment } from 'react';
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
	getAllCompletedSections,
} from 'utils/formatData';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST from './const';
import { API_END_POINT, VEHICLE_RC } from '_config/app.config';
import moment from 'moment';
// import selectedSection from './sample.json';

const DynamicForm = props => {
	const {
		subSections,
		// fields,
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
		clientToken,
		selectedSectionId,
	} = app;
	const { businessName } = application;
	const {
		register,
		formState,
		handleSubmit,
		onChangeFormStateField,
	} = useForm();
	const { addToast } = useToasts();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [fetchingVehicleData, setFetchingVehicleData] = useState(false);
	const completedSections = getAllCompletedSections({
		selectedProduct,
		application,
		selectedSectionId,
	});
	// console.log({ prefillData });
	const prefilledEditOrViewLoanValues = field => {
		// const preData = {
		// 	asset_type: '75',
		// 	type_of_funding: 'New',
		// 	total_amount: 500,
		// 	finance_requirement: 'RandomText123',
		// 	dealer_name: 'RandomDealer',
		// 	manufacturer_name: 'RandomManufacturer',
		// 	dealer_address: 'RandomAddress',
		// 	dealer_gst: 'RandomGST123',
		// 	supply_place: 'New York',
		// 	invoice_number: 'INV12345',
		// 	hirer: 'ABC Leasing',
		// 	make: 'Toyota',
		// 	full_model_code: 'Camry XLE',
		// 	tonnage_category: '5000 lbs',
		// 	chassis_number: 'CHS123456',
		// 	engine_number: 'ENG789012',
		// 	invoice_cost: '$25,000',
		// 	gst_invoice_cost: '$3,000',
		// 	total_gst_invoice_cost: '$28,000',
		// 	tcs: '$500',
		// 	vehicle_category: 'Sedan',
		// 	color: 'Silver',
		// 	manufacture_year: '2022',
		// 	fuel_type: 'Petrol',
		// 	transmission_type: 'Automatic',
		// 	seating_capacity: 5,
		// 	max_speed: '130 mph',
		// };
		const preData = {
			...prefillData,
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

	const callVehicleRcApi = data => {
		try {
			axios.get(VEHICLE_RC, {
				params: { ...data },
				headers: {
					Authorization: clientToken,
				},
			});
		} catch (error) {
			console.error('error', error);
		}
	};
	const fetchVehicleData = async data => {
		try {
			setFetchingVehicleData(true);
			const reqBody = {
				vehicleNo: formState?.values?.[CONST.FIELD_NAME_VEHICLE_NUMBER],
			};

			const fetchRes = await axios.get(VEHICLE_RC, {
				params: reqBody,
				headers: {
					Authorization: clientToken,
				},
			});
			// console.log({ fetchRes, values: formState.values });

			// Data prepopulation from the api
			if (fetchRes?.data?.status === 'ok') {
				const vehicleData = fetchRes?.data?.data?.result;
				const prefillMapper = {
					[CONST.FIELD_NAME_FUEL_TYPE]: vehicleData.type,
					[CONST.FIELD_NAME_VEHICLE_CATEGORY]: vehicleData.vehicleCategory,
					[CONST.FIELD_NAME_VEHICLE_MODEL]: vehicleData.model,
					[CONST.FIELD_NAME_ENGINE_NUMBER]: vehicleData.engine,
					[CONST.FIELD_NAME_CHASSIS_NUMBER]: vehicleData.chassis,
					[CONST.FIELD_NAME_REG_DATE]:
						(vehicleData.regDate &&
							moment(vehicleData.regDate).format('YYYY-MM-DD')) ||
						'',
					[CONST.FIELD_NAME_BODY_TYPE]: vehicleData.bodyType,
					[CONST.FIELD_NAME_NORMS_TYPE]: vehicleData.normsType,
					[CONST.FIELD_NAME_REGISTERED_PLACE]: vehicleData.regAuthority,
					[CONST.FIELD_NAME_TAX_UPTO]:
						(vehicleData.vehicleTaxUpto &&
							moment(vehicleData.vehicleTaxUpto).format('YYYY-MM-DD')) ||
						'',
					[CONST.FIELD_NAME_SEATING_CAPACITY]: vehicleData.vehicleSeatCapacity,

					[CONST.FIELD_NAME_INSURANCE_COMPANY_NAME]:
						vehicleData.vehicleInsuranceCompanyName,
					[CONST.FIELD_NAME_INSURANCE_POLICY_NUMBER]:
						vehicleData.vehicleInsurancePolicyNumber,

					[CONST.FIELD_NAME_MANUFACTURER_NAME]:
						vehicleData.vehicleManufacturerName,
				};

				CONST.PREFILL_FIELD_NAMES_ON_FETCH.map(fieldName => {
					if (formState?.values?.hasOwnProperty(fieldName)) {
						setTimeout(() => {
							onChangeFormStateField(
								{
									name: fieldName,
									value: prefillMapper?.[fieldName],
								},
								200
							);
						});
					}
					return null;
				});
			}
			if (fetchRes?.data?.status === 'nok') {
				addToast({
					message: "Couldn't fetch the data. Please continue filling the form.",
					type: 'error',
				});
			}
		} catch (error) {
			console.error(error.message);
			addToast({
				message: "Couldn't fetch the data. Please continue filling the form.",
				type: 'error',
			});
		} finally {
			setFetchingVehicleData(false);
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
			// console.log(
			// 	'🚀 ~ file: DynamicForm.js:165 ~ onSaveOrUpdate ~ reqBody:',
			// 	reqBody
			// );
			const tempData = [];
			tempData.push(reqBody.data);

			reqBody.data = tempData;

			if (editSectionId) {
				reqBody.data[0].id = editSectionId;
			}

			// if (
			// 	typeof reqBody?.data?.assets_details?.financial_institution?.value ===
			// 	'string'
			// ) {
			// 	reqBody.data.assets_details.financial_institution = +reqBody?.data
			// 		?.assets_details?.financial_institution?.value;
			// }

			// reqBody.data.vehicle_details = [reqBody.data.vehicle_details];

			const submitRes = await axios.post(
				`${API_END_POINT}/vehicle_details`,
				reqBody
			);
			if (submitRes?.data?.status === 'ok') {
				const vehicleRcPayload = {
					vehicleNo: formState?.values[CONST.FIELD_NAME_VEHICLE_NUMBER],
					loanAssetId: submitRes?.data?.data?.[0]?.id || editSectionId || '',
					// isBlackListRequired: '',
				};
				callVehicleRcApi(vehicleRcPayload);
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
								const customFieldPropsSubFields = {};

								const newField = _.cloneDeep(field);
								const business = {
									name: businessName || 'Company/Business',
									value: '0',
								};
								if (newField.name === CONST.FIELD_NAME_VEHICLE_FOR) {
									// newField.options = selectedDirectorOptions;
									newField.options = selectedProduct?.isSelectedProductTypeBusiness
										? [business, ...selectedDirectorOptions]
										: selectedDirectorOptions;
									// newField.options.push(entity);
								}

								if (isViewLoan || isViewLoanApp) {
									customFieldProps.disabled = true;
								}

								if (field?.name === CONST.FIELD_NAME_VEHICLE_NUMBER) {
									customFieldPropsSubFields.loading = fetchingVehicleData;
									customFieldProps.disabled =
										fetchingVehicleData ||
										!!completedSections?.includes(selectedSectionId);
									customFieldPropsSubFields.disabled =
										fetchingVehicleData ||
										!!completedSections?.includes(selectedSectionId);
									customFieldPropsSubFields.onClick = () => {
										fetchVehicleData();
									};
								}

								let newValueSelectField;
								if (!!field.sub_fields) {
									newValueSelectField = prefilledValues(field?.sub_fields[0]);
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
										<div
											style={{
												display: 'flex',
												gap: '10px',
												alignItems: 'center',
											}}
										>
											{field?.sub_fields &&
												field?.sub_fields[0].is_prefix &&
												register({
													...field.sub_fields[0],
													value: newValueSelectField,
													visibility: 'visible',
													...customFieldProps,
													...customFieldPropsSubFields,
												})}
											<div
												style={{
													width: '100%',
												}}
											>
												{register({
													...newField,
													value: prefilledValues(newField),
													...customFieldProps,
													visibility: 'visible',
												})}
											</div>
											{field?.sub_fields &&
												!field?.sub_fields[0].is_prefix &&
												register({
													...field.sub_fields[0],
													value: newValueSelectField,
													visibility: 'visible',
													...customFieldProps,
													...customFieldPropsSubFields,
												})}
										</div>
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
