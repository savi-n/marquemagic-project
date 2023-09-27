import React, { Fragment, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
import Loading from 'components/Loading';
import NavigateCTA from 'components/Sections/NavigateCTA';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import { setSelectedSectionId } from 'store/appSlice';
import { setCompletedApplicationSection } from 'store/applicationSlice';

import {
	formatGetSectionReqBody,
	formatSectionReqBody,
	getApiErrorMessage,
} from 'utils/formatData';

import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';

import * as CONST from './const';
import { useEffect } from 'react';
const PrioritySectorDetails = () => {
	const { app, application } = useSelector(state => state);

	const {
		isViewLoan,
		selectedSectionId,
		selectedSection,
		nextSectionId,
		isTestMode,
	} = app;

	// const { loanId, cacheDocuments, businessId } = application;

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState([]);
	const [formId, setFormId] = useState('');

	const { handleSubmit, register, formState } = useForm();

	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			const prioritySectorReqBody = formatSectionReqBody({
				app,
				application,
				values: formState.values,
			});
			prioritySectorReqBody.data.priority_sector_details.id = formId || '';
			await axios.post(
				`${API.API_END_POINT}/priority_sector_details`,
				prioritySectorReqBody
			);

			dispatch(setCompletedApplicationSection(selectedSectionId));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-LoanDetails-onProceed-', {
				error: error,
				res: error?.response,
				resres: error?.response?.response,
				resData: error?.response?.data,
			});
			addToast({
				message: getApiErrorMessage(error),
				type: 'error',
			});
		} finally {
			setLoading(false);
		}
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

			const preData = {
				...sectionData,
			};
			if (preData?.[field?.db_key]) return preData?.[field?.db_key];

			return field?.value || '';
		} catch (error) {
			return {};
		}
	};

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(
				`${API.API_END_POINT}/priority_sector_details?${formatGetSectionReqBody(
					{
						application,
					}
				)}`
			);
			setFormId(fetchRes?.data?.data?.priority_sector_details?.[0]?.id || '');
			setSectionData(fetchRes?.data?.data?.priority_sector_details?.[0] || {});
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
			setSectionData({});
		} finally {
			setFetchingSectionData(false);
		}
	};

	useEffect(() => {
		fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{selectedSection?.sub_sections?.map((sub_section, sectionIndex) => {
						return (
							<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
								{sub_section?.name ? (
									<UI_SECTIONS.SubSectionHeader>
										{sub_section.name}
									</UI_SECTIONS.SubSectionHeader>
								) : null}
								<UI_SECTIONS.FormWrapGrid>
									{sub_section?.fields?.map((field, fieldIndex) => {
										const newField = _.cloneDeep(field);
										const customFieldProps = {};
										const customFieldPropsSubfields = {};

										if (!newField.visibility) return null;
										if (newField?.for_type_name) {
											if (
												!newField?.for_type.includes(
													formState?.values?.[newField?.for_type_name]
												)
											)
												return null;
										}

										let newPrefilledValue = prefilledValues(newField);
										let newValueSelectField;

										if (
											formState?.values?.priority_sector_loan !== 'true' &&
											newField.name !== CONST.PRIORITY_SECTOR_LOAN_CHECKBOX
										) {
											customFieldProps.disabled = true;
										}
										if (!!field?.sub_fields) {
											newValueSelectField = prefilledValues(
												field?.sub_fields?.[0]
											);
										}
										if (isViewLoan) {
											customFieldProps.disabled = true;
										}

										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${newField.name}`}
											>
												<div>
													{field?.sub_fields &&
														field?.sub_fields[0].is_prefix &&
														register({
															...field.sub_fields[0],
															value: newValueSelectField,
															visibility: 'visible',
															// ...customFieldProps,
															...customFieldPropsSubfields,
														})}
													<div>
														{register({
															...newField,
															value: newPrefilledValue,
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
														{field?.sub_fields &&
															!field?.sub_fields[0].is_prefix &&
															register({
																...field.sub_fields[0],
																value: newValueSelectField,
																visibility: 'visible',
																// ...customFieldProps,
																...customFieldPropsSubfields,
															})}
													</div>
												</div>
											</UI_SECTIONS.FieldWrapGrid>
										);
									})}
								</UI_SECTIONS.FormWrapGrid>
							</Fragment>
						);
					})}
					<UI_SECTIONS.Footer>
						{!isViewLoan && (
							<Button
								fill
								name='Save and Proceed'
								isLoader={loading}
								disabled={loading}
								onClick={handleSubmit(() => {
									onSaveAndProceed();
								})}
							/>
						)}

						<NavigateCTA />
					</UI_SECTIONS.Footer>
				</>
			)}
		</UI_SECTIONS.Wrapper>
	);
};

export default PrioritySectorDetails;
