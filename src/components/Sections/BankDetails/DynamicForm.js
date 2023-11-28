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
import {
	API_END_POINT,
	TRIGGER_PENNY_DROP,
	PENNY_DROP_STATUS_FETCH,
} from '_config/app.config';
import { useEffect } from 'react';
import PennyDropStatusModal from './PennyDropStatusModal';
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
	const {
		directors,
		selectedDirectorId,
		selectedDirectorOptions,
	} = useSelector(state => state.directors);
	const { ifscList } = useSelector(state => state.app);
	const { loanId } = application;

	const selectedDirector = directors?.[selectedDirectorId] || {};
	selectedDirectorOptions?.map(item => {
		return {
			name: `${item.name}`,
			value: item.value,
		};
	});
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
		forceUpdate,
		onChangeFormStateField,
	} = useForm();
	const { addToast } = useToasts();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [pennyDropStatusModalOpen, setPennyDropStatusModalOpen] = useState(
		false
	);
	const [pennyDropStatus, setPennyDropStatus] = useState({
		message: '',
		data: {},
	});
	const [pennyDropApiLoading, setPennyDropApiLoading] = useState(false);
	const showPennyDropButtons =
		selectedProduct?.product_details?.show_penny_drop_button;

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
		if (
			!!formState?.values?.ifsc_code &&
			`${
				ifscList.filter(value => value.name === formState?.values?.ifsc_code)
					.length
			}` === '0'
		) {
			onChangeFormStateField({
				name: 'ifsc_code',
				value: '',
			});
		}
		//eslint-disable-next-line
	}, [ifscList]);
	// 	fields,
	// 	app,
	// 	selectedSection,
	// 	prefillData,
	// });

	// payload for penny_drop
	// {loan_id: loanId, acc_number: accNumber, ifsc, fin_type: finType, fin_id: finId}
	const triggerPennyDrop = async () => {
		try {
			setPennyDropApiLoading(true);
			const pennyDropReqBody = {
				loan_id: loanId || '',
				acc_number:
					prefillData?.account_number ||
					formState?.values?.[CONST.FIELD_NAME_ACCOUNT_NUMBER] ||
					'',
				ifsc:
					prefillData?.IFSC ||
					formState?.values?.[CONST.FIELD_NAME_IFSC_CODE] ||
					'',
				fin_type: CONST.FIN_TYPE_BANK_ACCOUNT || '',
				fin_id: prefillData?.id || '',
			};
			const fetchRes = await axios.post(TRIGGER_PENNY_DROP, pennyDropReqBody);
			if (fetchRes?.data?.status === 'ok') {
				addToast({
					message: fetchRes?.data?.message,
					type: 'success',
				});
			} else {
				addToast({
					message: fetchRes?.data?.message,
					type: 'error',
				});
			}
		} catch (error) {
			addToast({
				message: error?.response?.data?.message || error?.message,
				type: 'success',
			});
			console.error('Error in Triggering Penny Drop: ', error);
		} finally {
			setPennyDropApiLoading(false);
		}
	};

	const checkPennyDropStatus = async () => {
		try {
			setPennyDropApiLoading(true);
			const pennyDropStatusReqBody = {
				fin_id: prefillData?.id,
			};

			const pennyDropStatusRes = await axios.get(PENNY_DROP_STATUS_FETCH, {
				params: { ...pennyDropStatusReqBody },
			});
			if (pennyDropStatusRes?.data?.status === 'ok') {
				setPennyDropStatus({
					message: pennyDropStatusRes?.data?.message,
					data: pennyDropStatusRes?.data?.data,
				});
			}

			if (pennyDropStatusRes?.data?.status === 'nok') {
				setPennyDropStatus({
					message: pennyDropStatusRes?.data?.message,
					data: pennyDropStatusRes?.data?.data || {},
				});
			}
		} catch (error) {
			console.error('Error In Fetching Penny Drop Status:', error);
		} finally {
			setPennyDropApiLoading(false);
		}
	};

	const closePennyDropStatusModal = () => {
		setPennyDropStatusModalOpen(false);
	};

	const openPennyDropStatusModal = () => {
		checkPennyDropStatus();
		setPennyDropStatusModalOpen(true);
	};

	return (
		<React.Fragment>
			{pennyDropStatusModalOpen && (
				<PennyDropStatusModal
					loading={pennyDropApiLoading}
					onYes={closePennyDropStatusModal}
					data={pennyDropStatus}
				/>
			)}

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
					if (field.name === CONST.APPLICANT_FIELD_NAME) {
						customFieldProps.options = selectedDirectorOptions;
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
			{!!showPennyDropButtons &&
				!editSectionId &&
				prefillData?.id &&
				!isViewLoanApp && (
					<>
						<Button
							name='Trigger Penny Drop'
							customStyle={{ maxWidth: '300px' }}
							onClick={triggerPennyDrop}
							isLoader={pennyDropApiLoading}
							disabled={pennyDropApiLoading}
							fill
						/>

						<Button
							name='Penny Drop Status'
							customStyle={{ maxWidth: '300px', marginLeft: 20 }}
							onClick={openPennyDropStatusModal}
							isLoader={pennyDropApiLoading}
							disabled={pennyDropApiLoading}
							fill
						/>
					</>
				)}
		</React.Fragment>
	);
};

export default DynamicForm;
