import React, { Fragment, useState, useEffect } from 'react';
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
		subSections = [],
		onSaveOrUpdateSuccessCallback = () => {},
		onCancelCallback = () => {},
		prefillData = {},
		submitCTAName = 'Update',
		hideCancelCTA = false,
		isEditLoan,
		editSectionId = '',
		isCreateFormOpen,
		assets,
		loan_assets_id,
		selectCollateralFieldOptions,
	} = props;
	const isViewLoan = !isEditLoan;
	const { app, application } = useSelector(state => state);
	const { businessName } = application;
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const {
		isTestMode,
		selectedSection,
		isViewLoan: isViewLoanApp,
		selectedProduct,
	} = app;
	const {
		register,
		formState,
		handleSubmit,
		onChangeFormStateField,
		resetForm,
	} = useForm();
	const { addToast } = useToasts();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const prefilledEditOrViewLoanValues = field => {
		const preData = {
			...prefillData,
		};
		return preData?.[field?.name] || preData?.[field?.db_key];
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

			// console.log('prefillvalues-', editViewLoanValue);

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
	const validate = values => {
		let allowProceed = true;
		const { construction_area, total_area } = values;

		if (construction_area && total_area && +construction_area > +total_area)
			allowProceed = false;
		return allowProceed;
	};
	const onSaveOrUpdate = async data => {
		try {
			// console.log('onProceed-Date-DynamicForm-', data);
			setIsSubmitting(true);
			if (
				selectedSection?.validate_construction_area === true &&
				!validate(formState.values)
			) {
				addToast({
					message: 'Construction Area should be lesser than Total Area.',
					type: 'error',
				});
				return;
			}

			const reqBody = formatSectionReqBody({
				section: selectedSection,
				values: {
					...formState.values,
				},
				app,
				selectedDirector,
				application,
			});
			reqBody.data = [
				{
					collateral_details: reqBody.data.collateral_details,
					property_address_details: reqBody.data.property_address_details,
				},
			];
			reqBody.insert_loan_assets_data =
				selectedProduct?.product_details?.insert_loan_assets_data;
			if (editSectionId) {
				reqBody.data[0].id = editSectionId;
				reqBody.data[0].assets_additional_id = editSectionId;
				reqBody.data[0].loan_assets_id = loan_assets_id;
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
	// console.log({
	// 	select_collateral_value: formState?.values?.['select_collateral'],
	// });
	useEffect(() => {
		const selectedCollateralValue =
			formState?.values?.['select_collateral'] || '';
		const selectedAsset = assets?.filter(
			item => `${item.id}` === selectedCollateralValue
		)?.[0];
		const addressJson = {
			id: 'id',
			owner_name: 'owner_name',
			loan_id: 'loan_id',
			loan_json: 'loan_json',
			city: 'city',
			state: 'state',
			pin_code: 'pin_code',
			address1: 'address1',
			address2: 'address2',
			address3: 'address3',
			owned_type: 'owned_type',
			current_occupant: 'current_occupant',
		};
		// console.log({
		// 	loan_asset_type_id: `${selectedAsset?.loan_asset_type_id}`,
		// 	selectedAsset,
		// 	formState,
		// });
		if (isCreateFormOpen) {
			if (
				!!selectedAsset &&
				`${selectedAsset?.loan_asset_type_id}` ===
					CONST.LOAN_ASSET_TYPE_ID_LAND_AND_BUILDINGS
			) {
				onChangeFormStateField({
					name: 'existing_collateral',
					value: !!selectedAsset?.id,
				});
				onChangeFormStateField({
					name: 'select_collateral',
					value: `${selectedAsset?.id}`,
				});
				onChangeFormStateField({
					name: 'id',
					value: selectedAsset?.id,
				});
				onChangeFormStateField({
					name: 'owner_name',
					value:
						selectedAsset?.director_id === 0
							? businessName
							: directors?.[selectedAsset?.director_id]?.fullName,
				});
				onChangeFormStateField({
					name: 'loan_id',
					value: selectedAsset?.loan_id,
				});
				onChangeFormStateField({
					name: 'loan_json',
					value: selectedAsset?.value,
				});
				onChangeFormStateField({
					name: 'city',
					value: selectedAsset?.city,
				});
				onChangeFormStateField({
					name: 'state',
					value: selectedAsset?.state,
				});
				onChangeFormStateField({
					name: 'pin_code',
					value: selectedAsset?.pincode,
				});
				onChangeFormStateField({
					name: 'address1',
					value: selectedAsset?.address1,
				});
				onChangeFormStateField({
					name: 'address2',
					value: selectedAsset?.address2,
				});
				onChangeFormStateField({
					name: 'address3',
					value: selectedAsset?.name_landmark,
				});
				onChangeFormStateField({
					name: 'owned_type',
					value: selectedAsset?.owned_type,
				});
				onChangeFormStateField({
					name: 'current_occupant',
					value: selectedAsset?.current_occupant,
				});

				// TODO: Shreyas or Bikash - To be mapped as done below - only one onChangeFormStateField should be present and pass the values to prefill the data
				// Object.keys(addressJson).map(key => {
				// 	console.log({ key, val: selectedAsset?.[key] });
				// 	let clonedKey = _.cloneDeep(key);
				// 	if (key === 'owner_name') {
				// 		clonedKey =
				// 			selectedAsset?.director_id === 0
				// 				? businessName
				// 				: directors?.[selectedAsset?.director_id]?.fullName;
				// 	}
				// 	if (key === 'loan_json') {
				// 		clonedKey = selectedAsset?.value;
				// 	}
				// 	if (key === 'loan_json') {
				// 		clonedKey = selectedAsset?.value;
				// 	}
				// 	setTimeout(() => {
				// 		onChangeFormStateField(
				// 			{
				// 				name: key,
				// 				value: selectedAsset?.[clonedKey],
				// 			},
				// 			500
				// 		);
				// 	});
				// 	return null;
				// });
			} else if (
				(!!selectedAsset &&
					`${selectedAsset?.loan_asset_type_id}` ===
						CONST.LOAN_ASSET_TYPE_ID_PERFORMA_CV) ||
				`${selectedAsset?.loan_asset_type_id}` ===
					CONST.LOAN_ASSET_TYPE_ID_PERFORMA_CEQ
			) {
				const tempObj = selectedAsset?.loan_json || {};
				Object.keys(tempObj).map(key => {
					// console.log({ key });
					setTimeout(() => {
						onChangeFormStateField(
							{
								name: key,
								value: tempObj?.[key],
							},
							400
						);
					});
					return null;
				});

				Object.keys(addressJson).map(key => {
					setTimeout(() => {
						onChangeFormStateField(
							{
								name: key,
								value: '',
							},
							400
						);
					});
					return null;
				});
			} else if (
				isCreateFormOpen &&
				formState?.values?.['select_collateral'] === 'new'
			) {
				const oldExisting_collateralValue =
					formState?.values?.['existing_collateral'];
				resetForm();
				if (oldExisting_collateralValue) {
					onChangeFormStateField({
						name: 'existing_collateral',
						value: oldExisting_collateralValue,
					});
				}
				onChangeFormStateField({
					name: 'select_collateral',
					value: 'new',
				});
			}
		}
		// eslint-disable-next-line
	}, [formState?.values?.['select_collateral']]);

	// const test = () => {
	// 	console.log('test');
	// };

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
								if (isViewLoan || isViewLoanApp) {
									customFieldProps.disabled = true;
								}
								if (!isCreateFormOpen && field.name === 'select_collateral') {
									customFieldProps.disabled = true;
									// customFieldProps.value = '';
								}
								if (newField?.name === CONST.SELECT_COLLATERAL_FIELD_NAME) {
									newField.options = selectCollateralFieldOptions;
								}
								// console.log('render-field-', {
								// 	field,
								// 	customFieldProps,
								// 	isViewLoan,
								// 	newField,
								// 	formState,
								// 	prefillValue: prefilledValues(newField),
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
