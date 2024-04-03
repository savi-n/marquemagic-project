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
		totalPercentShare,
		loanPreFetchdata,
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
	const [filteredSubSection,setFilteredSubSection]=useState(subSections);
	// const [collateralDetails, setCollateralDetails] = useState([]);

	const cityField =
	filteredSubSection
			?.filter(
				item => item?.id === CONST.PROPERTY_ADDRESS_DETAILS_SUB_SECTION_ID
			)?.[0]
			?.fields?.filter(field => field?.name === CONST.CITY_FIELD_NAME)?.[0] ||
		{};
	const stateField =
	filteredSubSection
			?.filter(
				item => item?.id === CONST.PROPERTY_ADDRESS_DETAILS_SUB_SECTION_ID
			)?.[0]
			?.fields?.filter(field => field?.name === CONST.STATE_FIELD_NAME)?.[0] ||
		{};

	const prefilledEditOrViewLoanValues = field => {
		const preData = {
			...prefillData,
		};
		return preData?.[field?.name] || preData?.[field?.db_key];
	};
	const fieldNameArr = [];
	selectedSection?.sub_sections?.map(sub_section => {
		sub_section?.fields?.map(field => {
			fieldNameArr.push(field?.name);
			return null;
		});
		return null;
	});
// formState?.values?.[CONST.CITY_FIELD_NAME]
	useEffect(()=>{
		if(formState?.values?.collateral_type===CONST.COLLATERAL_FIELD_GOLD|| formState?.values?.collateral_type===CONST.COLLATERAL_FIELD_NSC){
			
			const propertyAddressSubSection = subSections?.filter(item => item?.id === CONST.COLLATERAL_DETAILS);
			setFilteredSubSection(propertyAddressSubSection);
		}
		else{
			setFilteredSubSection(subSections);
		}

	},[formState.values.collateral_type])
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
			const initailCollateral = currentLoanPrefetchData?.initial_collateral;
			const collateralDataLowerCase = Object.entries(
				initailCollateral || {}
			).reduce((acc, [key, value]) => {
				acc[key.toLowerCase()] = value;
				return acc;
			}, {});

			if (
				(fieldNameArr?.includes(field?.name) &&
					currentLoanPrefetchData?.[field?.db_key]) ||
				collateralDataLowerCase?.[field?.db_key]
			) {
				return true; // Disable the field if conditions are met
			}
			return false;
		}

		return false; // Do not disable the field by default
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
		if (checkAllInputsForm(formState?.values ?? {})) {
			addToast({
				message: 'Please enter at least one input',
				type: 'error',
			});
		} else {
			if (props?.prefillData) {
				if (
					parseInt(formState?.values?.percent_share) +
						(totalPercentShare -
							parseInt(props.prefillData?.percent_share ?? 0)) <=
					100
				) {
					handleSubmit(onSaveOrUpdate());
				} else {
					addToast({
						message: 'Percent Share should be less than 100',
						type: 'error',
					});
				}
			} else {
				if (
					parseInt(formState?.values?.percent_share) + totalPercentShare <=
					100
				) {
					handleSubmit(onSaveOrUpdate());
				} else {
					addToast({
						message: 'Percent Share should be less than 100',
						type: 'error',
					});
				}
			}
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

			if ( (!!cityField &&
				(cityField?.rules?.required === true &&
					!formState?.values?.[CONST.CITY_FIELD_NAME])) ||
				(!!stateField && (stateField?.rules?.required === true &&
					!formState?.values?.[CONST.STATE_FIELD_NAME]))
			) {
				addToast({
					message: 'Please enter City and State',
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

	return (
		<React.Fragment>
			{filteredSubSection?.map((subSection, subSectionIndex) => {


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
								
								if (!isCreateFormOpen && field.name === 'select_collateral') {
									customFieldProps.disabled = true;
									// customFieldProps.value = '';
								}
								if (newField?.name === CONST.SELECT_COLLATERAL_FIELD_NAME) {
									newField.options = selectCollateralFieldOptions;
								}
								if (
									selectedProduct?.product_details?.disable_fields_if_prefilled
								) {
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
