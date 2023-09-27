import React, { Fragment, useState, useLayoutEffect } from 'react';
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
//import { decryptViewDocumentUrl } from 'utils/encrypt';
import {
	formatGetSectionReqBody,
	formatSectionReqBody,
	getApiErrorMessage,
} from 'utils/formatData';
// import { scrollToTopRootElement } from 'utils/helper';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
// import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as CONST from './const';
// import * as CONST_SECTIONS from 'components/Sections/const';
const PrioritySector = () => {
	const { app, application } = useSelector(state => state);
	// const { directors, selectedDirectorOptions } = useSelector(
	// 	state => state.directors
	// );
	// const selectedDirector = directors?.[selectedDirectorId] || {};
	const {
		isViewLoan,
		selectedSectionId,
		selectedSection,
		nextSectionId,
		isTestMode,
		// isEditOrViewLoan,
		// selectedProduct,
	} = app;
	// const { loanId, cacheDocuments, businessId } = application;

	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState([]);

	const { handleSubmit, register, formState } = useForm();

	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			// try {
			// 	const validateLoanAmountRes = await axios.get(
			// 		`${API.API_END_POINT}/loan_amount_validate`,
			// 		{
			// 			params: {
			// 				business_id: businessId,
			// 				loan_amount: formState?.values?.['loan_amount'],
			// 				isSelectedProductTypeSalaried:
			// 					selectedProduct?.isSelectedProductTypeSalaried,
			// 				isSelectedProductTypeBusiness:
			// 					selectedProduct?.isSelectedProductTypeBusiness,
			// 			},
			// 		}
			// 	);
			// 	if (
			// 		validateLoanAmountRes?.data?.status === 'ok' &&
			// 		validateLoanAmountRes?.data?.approval_status === false
			// 	) {
			// 		addToast({
			// 			message:
			// 				validateLoanAmountRes?.data?.message ||
			// 				'Loan amount should match the Industry type selected.',
			// 			type: 'error',
			// 		});
			// 		return;
			// 	}
			// 	// console.log({ validateLoanAmountRes });
			// } catch (err) {
			// 	console.error(err.message);
			// }

			const prioritySectorReqBody = formatSectionReqBody({
				app,
				application,
				values: formState.values,
			});

			await axios.post(
				`${API.API_END_POINT}/priority_sector`,
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
			// console.log('fetchRes-', fetchRes)
			setSectionData(fetchRes?.data?.data || {});
		} catch (error) {
			console.error('error-fetchSectionDetails-', error);
			setSectionData({});
		} finally {
			setFetchingSectionData(false);
		}
	};

	useLayoutEffect(() => {
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

export default PrioritySector;
