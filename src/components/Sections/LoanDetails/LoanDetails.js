import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';

import useForm from 'hooks/useFormIndividual';
import { setSelectedSectionId } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApplicantCoApplicantSelectOptions,
} from 'utils/formatData';
import { API_END_POINT } from '_config/app.config';
import * as SectionUI from 'components/Sections/ui';
import * as CONST from './const';

const LoanDetails = () => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		selectedProduct,
		nextSectionId,
		isTestMode,
	} = app;
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [connectorOptions, setConnectorOptions] = useState([]);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
	} = useForm();
	const prevSelectedConnectorId = useRef(null);
	const selectedConnectorId =
		formState?.values?.[CONST.CONNECTOR_NAME_FIELD_NAME] || '';

	const getConnectors = async () => {
		try {
			setLoading(true);
			const connectorRes = await axios.get(`${API_END_POINT}/connectors`);
			// console.log('connectorRes-', { connectorRes });
			const newConnectorOptions = [];
			connectorRes?.data?.data?.map(connector => {
				newConnectorOptions.push({ ...connector, value: connector.id });
				return null;
			});
			setConnectorOptions(newConnectorOptions);
		} catch (error) {
			console.error('error-getConnectors-', error);
		} finally {
			setLoading(false);
		}
	};

	const onProceed = async () => {
		try {
			setLoading(true);
			const loanDetailsReqBody = formatSectionReqBody({
				app,
				applicantCoApplicants,
				application,
				values: formState.values,
			});

			const loanDetailsRes = await axios.post(
				`${API_END_POINT}/updateLoanDetails`,
				loanDetailsReqBody
			);
			console.log('-loanDetailsRes-', {
				loanDetailsReqBody,
				loanDetailsRes,
			});

			const newLoanDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
			dispatch(updateApplicationSection(newLoanDetails));
			dispatch(setSelectedSectionId(nextSectionId));
		} catch (error) {
			console.error('error-LoanDetails-onProceed-', error);
		} finally {
			setLoading(false);
		}
	};

	const prefilledValues = field => {
		try {
			if (formState?.values?.[field.name] !== undefined) {
				return formState?.values?.[field.name];
			}

			// TEST MODE
			if (isTestMode && CONST.initialFormState?.[field?.name]) {
				return CONST.initialFormState?.[field?.name];
			}
			// -- TEST MODE

			return (
				application?.sections?.[selectedSectionId]?.[field?.name] ||
				field.value ||
				''
			);
		} catch (error) {
			return {};
		}
	};

	useEffect(() => {
		if (!selectedConnectorId) return;
		// console.log('useEffect-', {
		// 	prev: prevSelectedConnectorId?.current,
		// 	current: selectedConnectorId,
		// });
		if (prevSelectedConnectorId?.current !== selectedConnectorId) {
			const selectedConnector = connectorOptions.filter(
				connector => `${connector?.value}` === `${selectedConnectorId}`
			)?.[0];
			// console.log('useEffect-', {
			// 	connectorOptions,
			// 	selectedConnector,
			// 	prev: prevSelectedConnectorId?.current,
			// 	current: selectedConnectorId,
			// });
			onChangeFormStateField({
				name: CONST.CONNECTOR_CODE_FIELD_NAME,
				value: selectedConnector?.id,
			});
			prevSelectedConnectorId.current = selectedConnectorId;
		}
		// eslint-disable-next-line
	}, [selectedConnectorId]);

	// useEffect(() => {
	// 	if (formState?.values?.[CONST.CONNECTOR_NAME_FIELD_NAME]) {
	// 		const selectedConnector = connectorOptions.filter(
	// 			connector =>
	// 				connector?.value ===
	// 				formState?.values?.[CONST.CONNECTOR_NAME_FIELD_NAME]
	// 		)?.[0];
	// 		onChangeFormStateField({
	// 			name: CONST.CONNECTOR_CODE_FIELD_NAME,
	// 			value: selectedConnector?.id,
	// 		});
	// 	}
	// 	// eslint-disable-next-line
	// }, [formState.values, connectorOptions]);

	useEffect(() => {
		getConnectors();
	}, []);

	// console.log('employment-details-', { coApplicants, app });

	return (
		<SectionUI.Wrapper style={{ marginTop: 50 }}>
			{selectedProduct?.product_details?.sections
				?.filter(section => section.id === selectedSectionId)?.[0]
				?.sub_sections?.map((sub_section, sectionIndex) => {
					return (
						<Fragment key={`section-${sectionIndex}-${sub_section?.id}`}>
							{sub_section?.name ? (
								<SectionUI.SubSectionHeader>
									{sub_section.name}
								</SectionUI.SubSectionHeader>
							) : null}
							<SectionUI.FormWrapGrid>
								{sub_section?.fields?.map((field, fieldIndex) => {
									const newField = _.cloneDeep(field);
									const customFieldProps = {};
									if (!newField.visibility) return null;
									if (newField?.for_type_name) {
										if (
											!newField?.for_type.includes(
												formState?.values?.[newField?.for_type_name]
											)
										)
											return null;
									}
									if (newField.name === CONST.IMD_PAID_BY_FIELD_NAME) {
										const newOptions = getApplicantCoApplicantSelectOptions(
											applicantCoApplicants
										);
										newField.options = [...newOptions, ...newField.options];
									}
									if (newField.name === CONST.CONNECTOR_NAME_FIELD_NAME) {
										newField.options = connectorOptions;
									}
									if (newField.name === CONST.CONNECTOR_CODE_FIELD_NAME) {
										customFieldProps.disabled = true;
									}
									return (
										<SectionUI.FieldWrapGrid
											key={`field-${fieldIndex}-${newField.name}`}
										>
											{register({
												...newField,
												value: prefilledValues(newField),
												...customFieldProps,
												visibility: 'visible',
											})}
											{(formState?.submit?.isSubmited ||
												formState?.touched?.[newField.name]) &&
												formState?.error?.[newField.name] && (
													<SectionUI.ErrorMessage>
														{formState?.error?.[newField.name]}
													</SectionUI.ErrorMessage>
												)}
										</SectionUI.FieldWrapGrid>
									);
								})}
							</SectionUI.FormWrapGrid>
						</Fragment>
					);
				})}
			<SectionUI.Footer>
				<Button
					fill
					name={`${isViewLoan ? 'Next' : 'Proceed'}`}
					isLoader={loading}
					disabled={loading}
					onClick={handleSubmit(onProceed)}
					// onClick={onProceed}
				/>
			</SectionUI.Footer>
		</SectionUI.Wrapper>
	);
};

export default LoanDetails;
