import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
import InputFieldSingleFileUpload from 'components/InputFieldSingleFileUpload';

import useForm from 'hooks/useFormIndividual';
import { useToasts } from 'components/Toast/ToastProvider';
import { setSelectedSectionId, toggleTestMode } from 'store/appSlice';
import { updateApplicationSection } from 'store/applicationSlice';
import {
	formatSectionReqBody,
	getApiErrorMessage,
	getApplicantCoApplicantSelectOptions,
} from 'utils/formatData';
import { addCacheDocuments, removeCacheDocument } from 'store/applicationSlice';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as CONST from './const';

const LoanDetails = () => {
	const { app, application, applicantCoApplicants } = useSelector(
		state => state
	);
	const {
		isViewLoan,
		selectedSectionId,
		selectedSection,
		nextSectionId,
		prevSectionId,
		isTestMode,
		isLocalhost,
		isEditLoan,
		editLoanData,
		isEditOrViewLoan,
	} = app;
	const { loanId, cacheDocuments } = application;
	const {
		isApplicant,
		applicant,
		coApplicants,
		selectedApplicantCoApplicantId,
	} = applicantCoApplicants;
	const selectedApplicant = isApplicant
		? applicant
		: coApplicants?.[selectedApplicantCoApplicantId] || {};
	const selectedIncomeType =
		selectedApplicant?.basic_details?.[
			CONST_BASIC_DETAILS.INCOME_TYPE_FIELD_NAME
		] || selectedApplicant?.income_type;
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [connectorOptions, setConnectorOptions] = useState([]);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
	} = useForm();
	const prevSelectedConnectorId = useRef(null);
	const selectedConnectorId =
		formState?.values?.[CONST.CONNECTOR_NAME_FIELD_NAME] || '';
	const selectedImdDocumentFile =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.IMD_DOCUMENT_UPLOAD_FIELD_NAME
		)?.[0] ||
		cacheDocuments?.filter(
			doc => doc?.field?.name === CONST.IMD_DOCUMENT_UPLOAD_FIELD_NAME
		)?.[0] ||
		null;
	let editLoanUploadedFile = null;

	const addCacheDocumentTemp = file => {
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		newCacheDocumentTemp.push(file);
		setCacheDocumentsTemp(newCacheDocumentTemp);
	};

	const removeCacheDocumentTemp = fieldName => {
		// console.log('removeCacheDocumentTemp-', { fieldName, cacheDocumentsTemp });
		const newCacheDocumentTemp = _.cloneDeep(cacheDocumentsTemp);
		if (
			cacheDocumentsTemp.filter(doc => doc?.field?.name === fieldName).length >
			0
		) {
			setCacheDocumentsTemp(
				newCacheDocumentTemp.filter(doc => doc?.field?.name !== fieldName)
			);
		} else {
			dispatch(removeCacheDocument({ fieldName }));
		}
	};

	const getConnectors = async () => {
		try {
			setLoading(true);
			const connectorRes = await axios.get(`${API.API_END_POINT}/connectors`);
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

	const naviagteToNextSection = () => {
		dispatch(setSelectedSectionId(nextSectionId));
	};
	const naviagteToPreviousSection = () => {
		dispatch(setSelectedSectionId(prevSectionId));
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

			let imd_Details_doc_id = '';
			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					cacheDocumentsTemp.map(doc => {
						uploadCacheDocumentsTemp.push({
							...doc,
							loan_id: loanId,
							preview: null,
						});
						return null;
					});
					if (uploadCacheDocumentsTemp.length) {
						const borrowerDocUploadRedBody = {
							...loanDetailsReqBody,
							data: {
								document_upload: uploadCacheDocumentsTemp,
							},
						};
						// console.log('borrowerDocUploadRedBody-', {
						// 	borrowerDocUploadRedBody,
						// });
						const borrowerDocUploadRes = await axios.post(
							`${API.BORROWER_UPLOAD_URL}`,
							borrowerDocUploadRedBody
						);
						// console.log('borrowerDocUploadRes-', {
						// 	borrowerDocUploadRes,
						// });
						const updateDocumentIdToCacheDocuments = [];
						uploadCacheDocumentsTemp.map(cacheDoc => {
							const resDoc =
								borrowerDocUploadRes?.data?.data?.filter(
									resDoc => resDoc?.doc_name === cacheDoc?.document_key
								)?.[0] || {};
							const newDoc = {
								...resDoc,
								...cacheDoc,
								directorId: applicant?.directorId,
								isDocRemoveAllowed: false,
								document_id: resDoc?.id,
							};
							imd_Details_doc_id = resDoc?.id;
							updateDocumentIdToCacheDocuments.push(newDoc);
							return null;
						});
						// console.log('updateDocumentIdToCacheDocuments-', {
						// 	updateDocumentIdToCacheDocuments,
						// });
						dispatch(
							addCacheDocuments({
								files: updateDocumentIdToCacheDocuments,
							})
						);
					}
				} catch (error) {
					console.error('error-', error);
				}
			}
			if (imd_Details_doc_id) {
				loanDetailsReqBody.data.imd_details.doc_id = imd_Details_doc_id;
			}
			// const loanDetailsRes =
			await axios.post(
				`${API.API_END_POINT}/updateLoanDetails`,
				loanDetailsReqBody
			);
			// console.log('-loanDetailsRes-', {
			// 	loanDetailsReqBody,
			// 	loanDetailsRes,
			// });
			const newLoanDetails = {
				sectionId: selectedSectionId,
				sectionValues: formState.values,
			};
			dispatch(updateApplicationSection(newLoanDetails));
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
		const imdDetails = editLoanData?.imd_details || {};
		const preData = {
			loan_amount: editLoanData?.loan_amount,
			tenure: editLoanData?.applied_tenure,
			loan_usage_type_id: editLoanData?.loan_usage_type?.id,
			loan_source: editLoanData?.loan_origin,
			connector_name: editLoanData?.connector_user_id,
			connector_code: editLoanData?.connector_user_id,
			...imdDetails,
			imd_document_proof: imdDetails?.doc_id, // TODO document mapping
			mode_of_payment: imdDetails?.payment_mode,
			imd_paid_by: imdDetails?.imd_paid_by,
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

	// console.log('employment-details-', { app, application, formState });

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
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
									const newOptions = getApplicantCoApplicantSelectOptions({
										applicantCoApplicants,
										isEditOrViewLoan,
									});
									newField.options = [...newOptions, ...newField.options];
								}
								if (newField.name === CONST.CONNECTOR_NAME_FIELD_NAME) {
									newField.options = connectorOptions;
								}
								if (newField.name === CONST.CONNECTOR_CODE_FIELD_NAME) {
									customFieldProps.disabled = true;
								}
								if (
									newField.type === 'file' &&
									newField.name === CONST.IMD_DOCUMENT_UPLOAD_FIELD_NAME
								) {
									const selectedDocTypeId =
										field?.doc_type?.[selectedIncomeType];
									const errorMessage =
										(formState?.submit?.isSubmited ||
											formState?.touched?.[field.name]) &&
										formState?.error?.[field.name];
									if (isEditOrViewLoan) {
										const imd_document_id = prefilledEditOrViewLoanValues(
											field
										);
										editLoanUploadedFile =
											cacheDocuments?.filter(
												doc => `${doc?.document_id}` === `${imd_document_id}`
											)?.[0] || null;
									}
									return (
										<UI_SECTIONS.FieldWrapGrid
											key={`field-${fieldIndex}-${field.name}`}
										>
											<InputFieldSingleFileUpload
												field={field}
												uploadedFile={
													selectedImdDocumentFile || editLoanUploadedFile
												}
												selectedDocTypeId={selectedDocTypeId}
												clearErrorFormState={clearErrorFormState}
												addCacheDocumentTemp={addCacheDocumentTemp}
												removeCacheDocumentTemp={removeCacheDocumentTemp}
												errorColorCode={errorMessage ? 'red' : ''}
												isFormSubmited={!!formState?.submit?.isSubmited}
												isDisabled={isViewLoan}
											/>
											{errorMessage && (
												<UI_SECTIONS.ErrorMessage>
													{errorMessage}
												</UI_SECTIONS.ErrorMessage>
											)}
										</UI_SECTIONS.FieldWrapGrid>
									);
								}
								if (isViewLoan) {
									customFieldProps.disabled = true;
								}
								return (
									<UI_SECTIONS.FieldWrapGrid
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
				{!isViewLoan && (
					<Button
						fill
						name='Proceed'
						isLoader={loading}
						disabled={loading}
						onClick={handleSubmit(() => {
							const isIMDDocumentExist =
								selectedImdDocumentFile || editLoanUploadedFile;
							if (
								formState?.values?.[CONST.IMD_COLLECTED_FIELD_NAME] === 'Yes' &&
								!isIMDDocumentExist
							) {
								addToast({
									message: 'IMD document is mandatory',
									type: 'error',
								});
								return;
							}
							onProceed();
						})}
					/>
				)}

				{isViewLoan && (
					<>
						<Button name='Previous' onClick={naviagteToPreviousSection} fill />
						<Button name='Next' onClick={naviagteToNextSection} fill />
					</>
				)}

				{!isViewLoan && (!!selectedSection?.is_skip || !!isTestMode) ? (
					<Button name='Skip' disabled={loading} onClick={onSkip} />
				) : null}
				{isLocalhost && !isViewLoan && !!isTestMode && (
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

export default LoanDetails;
