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
	} = props;
	const isViewLoan = !isEditLoan;
	const { app, application } = useSelector(state => state);
	const { businessName } = application;
	const { directors, selectedDirectorId } = useSelector(
		state => state.directors
	);
	const selectedDirector = directors?.[selectedDirectorId] || {};
	const isApplicant = isDirectorApplicant(selectedDirector);
	const { isTestMode, selectedSection, isViewLoan: isViewLoanApp } = app;
	const {
		register,
		formState,
		handleSubmit,
		onChangeFormStateField,
	} = useForm();
	const { addToast } = useToasts();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const prefilledEditOrViewLoanValues = field => {
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
			reqBody.data = [
				{
					collateral_details: reqBody.data.collateral_details,
					property_address_details: reqBody.data.property_address_details,
				},
			];
			if (editSectionId) {
				reqBody.data[0].id = editSectionId;
				reqBody.data[0].assets_additional_id = editSectionId;
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

	useEffect(() => {
		const filtered = assets?.filter(
			item => `${item.id}` === formState?.values?.['select_collateral']
		);
		if (isCreateFormOpen && formState?.values?.['select_collateral']) {
			onChangeFormStateField({
				name: 'existing_collateral',
				value: !!filtered[0]?.id,
			});
			onChangeFormStateField({
				name: 'select_collateral',
				value: `${filtered[0]?.id}`,
			});

			onChangeFormStateField({
				name: 'id',
				value: filtered[0]?.id,
			});

			onChangeFormStateField({
				name: 'owner_name',
				value:
					filtered[0]?.director_id === 0
						? businessName
						: directors?.[filtered[0]?.director_id]?.fullName,
			});

			onChangeFormStateField({
				name: 'loan_id',
				value: filtered[0]?.loan_id,
			});

			onChangeFormStateField({
				name: 'loan_json',
				value: filtered[0]?.value,
			});

			onChangeFormStateField({
				name: 'city',
				value: filtered[0]?.city,
			});

			onChangeFormStateField({
				name: 'state',
				value: filtered[0]?.state,
			});
			onChangeFormStateField({
				name: 'pin_code',
				value: filtered[0]?.pincode,
			});
			onChangeFormStateField({
				name: 'address1',
				value: filtered[0]?.address1,
			});
			onChangeFormStateField({
				name: 'address2',
				value: filtered[0]?.address2,
			});

			onChangeFormStateField({
				name: 'address3',
				value: filtered[0]?.name_landmark,
			});
			onChangeFormStateField({
				name: 'owned_type',
				value: filtered[0]?.owned_type,
			});
			onChangeFormStateField({
				name: 'current_occupant',
				value: filtered[0]?.current_occupant,
			});
		} else if (isCreateFormOpen) {
			onChangeFormStateField({
				name: 'existing_collateral',
				value: null,
			});
			onChangeFormStateField({
				name: 'select_collateral',
				value: '',
			});

			onChangeFormStateField({
				name: 'id',
				value: null,
			});

			onChangeFormStateField({
				name: 'owner_name',
				value: null,
			});

			onChangeFormStateField({
				name: 'loan_id',
				value: null,
			});

			onChangeFormStateField({
				name: 'loan_json',
				value: null,
			});

			onChangeFormStateField({
				name: 'city',
				value: '',
			});

			onChangeFormStateField({
				name: 'state',
				value: '',
			});
			onChangeFormStateField({
				name: 'pin_code',
				value: null,
			});
			onChangeFormStateField({
				name: 'address1',
				value: null,
			});
			onChangeFormStateField({
				name: 'address2',
				value: null,
			});

			onChangeFormStateField({
				name: 'address3',
				value: null,
			});
			onChangeFormStateField({
				name: 'owned_type',
				value: null,
			});
			onChangeFormStateField({
				name: 'current_occupant',
				value: null,
			});
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
			{!isViewLoan && !isViewLoanApp && (
				<>
					<Button
						customStyle={{ maxWidth: 150 }}
						onClick={handleButtonClick}
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
