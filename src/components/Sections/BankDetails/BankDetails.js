import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';
import useForm from 'hooks/useFormIndividual';
import Button from 'components/Button';

import { sleep } from 'utils/helper';
import { formatSectionReqBody } from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST from './const';

const BankDetails = () => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		nextSectionId,
		selectedSection,
		isTestMode,
		isLocalhost,
		editLoanData,
		isEditLoan,
	} = app;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const { handleSubmit, register, formState } = useForm();
	const { isApplicant } = applicantCoApplicants;
	const submitBankDetails = async () => {
		try {
			// console.log('submitBankDetails-', { formState, '111': '111' });
			const bankDetailsReqBody = formatSectionReqBody({
				section: selectedSection,
				values: formState.values,
				app,
				applicantCoApplicants,
				application,
			});
			bankDetailsReqBody.data.bank_details.bank_id =
				bankDetailsReqBody.data.bank_details.bank_id.value;
			// const bankDetailsRes =
			await axios.post(
				`${API_END_POINT}/addBankDetailsNew`,
				bankDetailsReqBody
			);
			// console.log('-bankDetailsRes-', {
			// 	bankDetailsReqBody,
			// 	bankDetailsRes,
			// });
			const newBankDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
			dispatch(updateApplicationSection(newBankDetails));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-submitBankDetails-', error);
		}
	};

	const onProceed = async () => {
		try {
			if (Object.keys(formState.values).length === 0) return onSkip();
			setLoading(true);
			await sleep(100);
			await submitBankDetails();
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-BankDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	const onSkip = () => {
		const skipSectionData = {
			sectionId: selectedSectionId,
			sectionValues: {
				...(application?.[selectedSectionId] || {}),
				isSkip: true,
			},
		};
		dispatch(updateApplicationSection(skipSectionData));
		dispatch(setSelectedSectionId(nextSectionId));
	};

	const prefilledEditOrViewLoanValues = field => {
		const bankData = editLoanData?.bank_details?.[0] || {};
		const preData = {
			bank_name: bankData?.bank_id,
			account_number: bankData?.account_number,
			ifsc_code: bankData?.IFSC,
			account_type: bankData?.account_type,
			account_holder_name: bankData?.account_holder_name,
			start_date: bankData?.outstanding_start_date,
			end_date: bankData?.outstanding_end_date,
		};
		// console.log('predata-', { bankData });
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

			if (application?.sections?.[selectedSectionId]?.[field?.name]) {
				return application?.sections?.[selectedSectionId]?.[field?.name];
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
	// console.log('employment-details-', { coApplicants, app });

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
				return (
					<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
						{sub_section?.name ? (
							<UI_SECTIONS.SubSectionHeader>
								Help us with your{' '}
								<span
									style={{
										color: '#1414ad',
									}}
								>
									{sub_section.name}
								</span>
							</UI_SECTIONS.SubSectionHeader>
						) : null}

						<UI_SECTIONS.FormWrapGrid>
							{sub_section?.fields?.map((field, fieldIndex) => {
								if (!field.visibility) return null;
								if (field?.for_type_name) {
									if (
										!field?.for_type.includes(
											formState?.values?.[field?.for_type_name]
										)
									)
										return null;
								}

								const newField = _.cloneDeep(field);
								const customFieldProps = {};
								// TODO: varun do following chagnes from config
								// ifsc field is lagging need to fix
								if (field.name === 'ifsc_code') {
									customFieldProps.type = 'ifsclist';
								}
								if (field.name === 'bank_name') {
									customFieldProps.ifsc_required = true;
								}
								return (
									<UI_SECTIONS.FieldWrapGrid
										key={`field-${fieldIndex}-${newField.name}`}
									>
										{register({
											...field,
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
			<UI_SECTIONS.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed)}
				/>
				{!!selectedSection?.is_skip || !!isTestMode ? (
					<Button name='Skip' disabled={loading} onClick={onSkip} />
				) : null}
				{isLocalhost && (
					<Button
						fill={!!isTestMode}
						name='Auto Fill'
						onClick={() => dispatch(toggleTestMode())}
					/>
				)}
			</UI_SECTIONS.Footer>
		</UI_SECTIONS.Wrapper>
	);
};

export default BankDetails;
