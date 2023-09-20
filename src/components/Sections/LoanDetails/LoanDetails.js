import React, {
	Fragment,
	useState,
	useEffect,
	useRef,
	useLayoutEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
import InputFieldSingleFileUpload from 'components/InputFieldSingleFileUpload';
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
	getDocumentNameFromLoanDocuments,
	parseJSON,
} from 'utils/formatData';
// import { scrollToTopRootElement } from 'utils/helper';
import * as API from '_config/app.config';
import * as UI_SECTIONS from 'components/Sections/ui';
// import * as CONST_BASIC_DETAILS from 'components/Sections/BasicDetails/const';
import * as CONST from './const';
import * as CONST_SECTIONS from 'components/Sections/const';
const LoanDetails = () => {
	const { app, application } = useSelector(state => state);
	const {
		directors,
		// selectedDirectorId,
		selectedDirectorOptions,
	} = useSelector(state => state.directors);
	// const selectedDirector = directors?.[selectedDirectorId] || {};
	const {
		isViewLoan,
		selectedSectionId,
		selectedSection,
		nextSectionId,
		isTestMode,
		isEditOrViewLoan,
		selectedProduct,
		permission,
	} = app;
	const { loanId, cacheDocuments, businessType, businessId } = application;

	const applicant =
		Object.values(directors)?.filter(
			dir => dir?.type_name === CONST_SECTIONS.APPLICANT_TYPE_NAME
		)?.[0] || {};
	const selectedIncomeType =
		`${selectedProduct?.loan_request_type}` === '1'
			? businessType
			: applicant?.income_type || '';
	const dispatch = useDispatch();
	const { addToast } = useToasts();
	const [loading, setLoading] = useState(false);
	const [connectorOptions, setConnectorOptions] = useState([]);
	const [branchOptions, setBranchOptions] = useState([]);
	const [cacheDocumentsTemp, setCacheDocumentsTemp] = useState([]);
	const [fetchingSectionData, setFetchingSectionData] = useState(false);
	const [sectionData, setSectionData] = useState([]);
	//const [loadingFile, setLoadingFile] = useState(false);
	const branchField =
		selectedSection?.sub_sections
			?.filter(item => {
				return item.id === CONST.SOURCE_DETAILS_SUBSECTION_ID;
			})?.[0]
			?.fields?.filter(field => {
				return field?.name === CONST.BRANCH_FIELD_NAME;
			})?.[0] || {};
	const {
		handleSubmit,
		register,
		formState,
		onChangeFormStateField,
		clearErrorFormState,
	} = useForm();

	const tempSelected = {
		name: 'Loan Details',
		id: 'loan_details',
		hide_section_usertype: ['Technical'],
		sub_sections: [
			{
				id: 'loan_details',
				name: 'Loan Details',
				fields: [
					{
						name: 'loan_amount',
						placeholder: 'Required Loan Amount e.g.,10,000',
						db_key: 'loan_amount',
						rules: {
							required: true,
						},
						type: 'number',
						visibility: true,
						inrupees: true,
						mask: {
							number_only: true,
							character_limit: 10,
						},
					},
					{
						name: 'tenure',
						rules: {},
						placeholder: 'Tenure',
						db_key: 'applied_tenure',
						type: 'dropdown',
						mask: {},
						visibility: true,
						specific_options_for: 'loan_amount',
						specific_options: [
							{
								min: 25000,
								max: 200000,
								options: [
									{
										value: '104',
										name: '104',
									},
								],
							},
							{
								min: 200000,
								max: 500000,
								options: [
									{
										value: '104',
										name: '104',
									},
									{
										value: '156',
										name: '156',
									},
									{
										value: '190',
										name: '180',
									},
								],
							},
							{
								min: 500000,
								max: 2000000,
								options: [
									{
										value: '104',
										name: '104',
									},
									{
										value: '156',
										name: '156',
									},
									{
										value: '190',
										name: '190',
									},
									{
										value: '250',
										name: '250',
									},
									{
										value: '301',
										name: '301',
									},
									{
										value: '365',
										name: '365',
									},
								],
							},
						],
						options: [
							{
								value: '104',
								name: '104',
							},
							{
								value: '156',
								name: '156',
							},
						],
						sub_fields: [
							{
								name: 'tenure_um',
								placeholder: 'Tenure',
								type: 'text',
								db_key: 'tenure_um',
								rules: {},
								options: [
									{
										name: 'days',
										value: 'days',
									},
								],
								value: 'days',
								disabled: true,
								isbuttonfilled: false,
							},
						],
					},
					{
						name: 'loan_type_id',
						placeholder: 'Purpose of the loan',
						db_key: 'loan_type_id',
						rules: {
							required: false,
						},
						type: 'select',
						options: [
							{
								name: 'Working Capital',
								value: 10,
							},
							{
								name: 'Business Improvement',
								value: 60,
							},
						],
						visibility: false,
					},
					{
						name: 'loan_usage_type_id',
						placeholder: ' Programs',
						db_key: 'loan_usage_type_id',
						rules: {
							required: false,
						},
						type: 'select',
						options: [
							{
								name: 'Assessment based',
								value: 40,
							},
						],
						value: '40',
						visibility: false,
					},
				],
			},
			{
				id: 'source_details',
				name: 'Help us with Source Details',
				fields: [
					{
						name: 'loan_source',
						db_key: 'loan_origin',
						placeholder: 'Loan Source',
						rules: {},
						options: [
							{
								name: 'Branch',
								value: 'Branch',
							},
							{
								name: 'Connector',
								value: 'Connector',
							},
						],
						type: 'select',
						value: 'Branch',
						visibility: true,
					},
					{
						name: 'connector_name',
						db_key: 'businessname',
						placeholder: 'Connector Name',
						for_type_name: 'loan_source',
						for_type: ['Connector'],
						rules: {},
						options: [{}],
						type: 'search',
						visibility: true,
					},
					{
						name: 'connector_code',
						db_key: 'connector_user_id',
						placeholder: 'Connector Code',
						for_type_name: 'loan_source',
						for_type: ['Connector'],
						rules: {},
						type: 'text',
						visibility: true,
					},
				],
			},
			{
				id: 'imd_details',
				name: 'Help us with IMD Details',
				fields: [
					{
						name: 'imd_collected',
						db_key: 'imd_collected',
						placeholder: 'IMD Collected',
						rules: {},
						options: [
							{
								name: 'Yes',
								value: 'Yes',
							},
							{
								name: 'No',
								value: 'No',
							},
						],
						type: 'select',
						value: 'No',
						visibility: true,
					},
					{
						name: 'imd_document_proof',
						db_key: 'loan_document',
						label: 'Upload IMD Document Proof',
						for_type: ['Yes'],
						for_type_name: 'imd_collected',
						type: 'file',
						value: 'imd_doc',
						is_delete_not_allowed: true,
						min: 1,
						max: 1,
						rules: {
							required: true,
							supported_formats: ['*'],
						},
						doc_type: {
							'1': 325,
							'2': 325,
							'3': 325,
							'4': 325,
							'5': 325,
							'6': 325,
							'8': 325,
							'9': 325,
							'10': 325,
							'11': 325,
						},
						visibility: true,
					},
					{
						name: 'amount_paid',
						db_key: 'amount_paid',
						placeholder: 'Amount Paid',
						for_type: ['Yes'],
						for_type_name: 'imd_collected',
						type: 'text',
						rules: {
							required: true,
						},
						visibility: true,
						inrupees: true,
					},
					{
						name: 'mode_of_payment',
						db_key: 'payment_mode',
						for_type: ['Yes'],
						for_type_name: 'imd_collected',
						placeholder: 'Mode of Payment',
						rules: {
							required: true,
						},
						options: [
							{
								name: 'Bank Transfer',
								value: 'Bank Transfer',
							},
							{
								name: 'Cheque',
								value: 'Cheque',
							},
							{
								name: 'Cash',
								value: 'Cash',
							},
							{
								name: 'UPI',
								value: 'UPI',
							},
							{
								name: 'DD',
								value: 'DD',
							},
						],
						type: 'select',
						visibility: true,
					},
					{
						name: 'transaction_reference',
						db_key: 'transaction_reference',
						placeholder: 'Transaction Reference',
						for_type: ['Yes'],
						for_type_name: 'imd_collected',
						type: 'text',
						rules: {
							required: true,
						},
						visibility: true,
					},
					{
						name: 'imd_paid_by',
						db_key: 'imd_paid_by',
						for_type: ['Yes'],
						for_type_name: 'imd_collected',
						placeholder: 'IMD Paid By',
						rules: {
							required: true,
						},
						options: [
							{
								name: 'Others',
								value: 'Others',
							},
						],
						type: 'select',
						visibility: true,
					},
					{
						name: 'account_holder_name',
						db_key: 'account_holder_name',
						for_type: ['Others'],
						for_type_name: 'imd_paid_by',
						placeholder: 'Account Holder Name',
						rules: {
							required: true,
						},
						type: 'text',
						visibility: true,
					},
				],
			},
		],
	};
	const prevSelectedConnectorId = useRef(null);

	const selectedConnectorId =
		formState?.values?.[CONST.CONNECTOR_NAME_FIELD_NAME] || '';
	// const selectedImdDocumentFile =
	// 	{
	// 		cacheDocumentsTemp?.filter(
	// 		doc => doc?.field?.name === CONST.IMD_DOCUMENT_UPLOAD_FIELD_NAME
	// 	)?.[0] ,
	//   name: cacheDocumentsTemp?.filter(
	// 	doc => doc?.field?.name === CONST.IMD_DOCUMENT_UPLOAD_FIELD_NAME
	// )?.[0].name,
	//   } || sectionData?.imd_details?.imd_document
	// 		? {
	// 				...sectionData?.imd_details?.imd_document,
	// 				name: getDocumentNameFromLoanDocuments(
	// 					sectionData?.imd_details?.imd_document
	// 				),
	// 				document_id: sectionData?.imd_details?.doc_id,
	// 		  }
	// 		: null;
	let editLoanUploadedFile = null;

	const ImdDocumentFileOnUpload =
		cacheDocumentsTemp?.filter(
			doc => doc?.field?.name === CONST.IMD_DOCUMENT_UPLOAD_FIELD_NAME
		)?.[0] || {};

	const selectedImdDocument = sectionData?.imd_details?.imd_document
		? {
				...sectionData?.imd_details?.imd_document,
				name: getDocumentNameFromLoanDocuments(
					sectionData?.imd_details?.imd_document
				),
				document_id: sectionData?.imd_details?.doc_id,
		  }
		: null;

	const selectedImdDocumentFile = ImdDocumentFileOnUpload.name
		? ImdDocumentFileOnUpload
		: selectedImdDocument;

	//console.log(selectedImdDocumentFile);

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
		}
		//setLoading(true);
		if (sectionData?.imd_details?.imd_document?.uploaded_doc_name)
			fetchSectionDetails();
		//setLoading(false);
	};
	const getBranchOptions = async () => {
		try {
			if (Object.keys(branchField)?.length > 0) {
				setLoading(true);
				const bankRefId = permission?.ref_bank_id || 0;

				const branchRes = await axios.get(
					`${API.API_END_POINT}/getBranchList?bankId=${bankRefId}`
				);
				// console.log('branchRes-', { branchRes });
				const newBranchOptions = [];
				branchRes?.data?.branchList?.map(branch => {
					newBranchOptions?.push({
						...branch,
						value: `${branch?.id}`,
						name: `${branch?.branch}`,
					});
					return null;
				});
				setBranchOptions(newBranchOptions);
			}
		} catch (error) {
			console.error('error-getConnectors-', error);
		} finally {
			setLoading(false);
		}
	};
	const getConnectors = async () => {
		try {
			setLoading(true);
			const connectorRes = await axios.get(`${API.API_END_POINT}/connectors`);
			// console.log('connectorRes-', { connectorRes });
			const newConnectorOptions = [];
			connectorRes?.data?.data?.map(connector => {
				newConnectorOptions.push({
					...connector,
					value: `${connector?.user_reference_no}`,
				});
				return null;
			});
			setConnectorOptions(newConnectorOptions);
		} catch (error) {
			console.error('error-getConnectors-', error);
		} finally {
			setLoading(false);
		}
	};

	const onSaveAndProceed = async () => {
		try {
			setLoading(true);
			try {
				const validateLoanAmountRes = await axios.get(
					`${API.API_END_POINT}/loan_amount_validate`,
					{
						params: {
							business_id: businessId,
							loan_amount: formState?.values?.['loan_amount'],
							isSelectedProductTypeSalaried:
								selectedProduct?.isSelectedProductTypeSalaried,
							isSelectedProductTypeBusiness:
								selectedProduct?.isSelectedProductTypeBusiness,
						},
					}
				);
				if (
					validateLoanAmountRes?.data?.status === 'ok' &&
					validateLoanAmountRes?.data?.approval_status === false
				) {
					addToast({
						message:
							validateLoanAmountRes?.data?.message ||
							'Loan amount should match the Industry type selected.',
						type: 'error',
					});
					return;
				}
				// console.log({ validateLoanAmountRes });
			} catch (err) {
				console.error(err.message);
			}

			const loanDetailsReqBody = formatSectionReqBody({
				app,
				application,
				values: formState.values,
			});

			// const cloneSelectedValue =
			// 	_.cloneDeep(
			// 		formState?.values?.[CONST.CONNECTOR_NAME_FIELD_NAME]?.value
			// 	) || '';

			// formState.values[CONST.CONNECTOR_NAME_FIELD_NAME] = cloneSelectedValue;

			// formState.values[CONST.CONNECTOR_CODE_FIELD_NAME] = cloneSelectedValue;

			// loanDetailsReqBody.data.source_details.businessname = cloneSelectedValue;

			// loanDetailsReqBody.data.source_details.connector_user_id = +cloneSelectedValue;

			let imd_Details_doc_id = '';
			if (cacheDocumentsTemp.length > 0) {
				try {
					const uploadCacheDocumentsTemp = [];
					const applicant =
						(!!directors &&
							Object.values(directors)?.filter(
								dir => dir?.type_name === CONST_SECTIONS.APPLICANT_TYPE_NAME
							)?.[0]) ||
						{};
					cacheDocumentsTemp?.map(doc => {
						uploadCacheDocumentsTemp.push({
							...doc,
							loan_id: loanId,
							preview: null,
							is_delete_not_allowed:
								doc?.field?.is_delete_not_allowed === true ? true : false,
							directorId:
								`${selectedProduct?.loan_request_type}` === '1'
									? 0
									: +applicant?.directorId,
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
					}
				} catch (error) {
					console.error('error-', error);
				}
			}
			if (imd_Details_doc_id) {
				loanDetailsReqBody.data.imd_details.doc_id = imd_Details_doc_id;
			}
			await axios.post(
				`${API.API_END_POINT}/updateLoanDetails`,
				loanDetailsReqBody
			);
			// console.log('-loanDetailsRes-', {
			// 	loanDetailsReqBody,
			// 	loanDetailsRes,
			// });
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

	const prefilledEditOrViewLoanValues = field => {
		const imdDetails = sectionData?.imd_details || {};
		const loanDetails = sectionData?.loan_details || {};
		let estimatedFundRequirements = {};
		let sourceFundRequirements = {};
		if (sectionData?.loan_additional_data?.estimated_fund_requirements) {
			estimatedFundRequirements = parseJSON(
				sectionData?.loan_additional_data?.estimated_fund_requirements
			);
		}
		if (sectionData?.loan_additional_data?.source_fund_requirements) {
			sourceFundRequirements = parseJSON(
				sectionData?.loan_additional_data?.source_fund_requirements
			);
		}
		const preData = {
			...loanDetails,
			loan_amount: loanDetails?.loan_amount,
			tenure: loanDetails?.applied_tenure,
			// this is specifically for housing loan , where the branch field is coming inside loan details sub section
			branch_id: loanDetails?.branch_id?.id
				? `${loanDetails?.branch_id?.id}`
				: '',
			loan_usage_type_id: ['string', 'number'].includes(
				typeof loanDetails?.loan_usage_type
			)
				? loanDetails?.loan_usage_type
				: loanDetails?.loan_usage_type?.id,
			scheme_category: loanDetails?.scheme_category_code,
			credit_insurance: loanDetails?.credit_linked_insurance,
			// savitha should take accountability if the response is changed later - bad practice
			// this code will only take the option if it is available at last
			loan_source: loanDetails?.loan_origin?.split('_')?.slice(-1)?.[0],
			connector_name: loanDetails?.connector_user_id,
			connector_code: loanDetails?.connector_user_id,
			...imdDetails,
			imd_document_proof: imdDetails?.doc_id, // TODO document mapping
			mode_of_payment: imdDetails?.payment_mode,
			imd_paid_by: imdDetails?.imd_paid_by,
			branch: loanDetails?.branch_id?.id ? `${loanDetails?.branch_id?.id}` : '',
			loan_type: loanDetails?.loan_usage_type
				? `${loanDetails?.loan_usage_type}`
				: '',
			...estimatedFundRequirements,
			...sourceFundRequirements,
		};
		return preData?.[field?.name];
	};

	const prefilledValues = field => {
		try {
			const isFormStateUpdated = formState?.values?.[field.name] !== undefined;
			// if (field?.name === 'loan_source') {
			// 	if (
			// 		formState?.values?.[field.name] === CONST.FIELD_NAME_NC_CONNECTOR ||
			// 		formState?.values?.[field.name] === CONST.FIELD_NAME_CONNECTOR
			// 	)
			// 		return 'Connector';
			// 	else if (
			// 		formState?.values?.[field.name] === CONST.FIELD_NAME_NC_BRANCH ||
			// 		formState?.values?.[field.name] === CONST.FIELD_NAME_BRANCH
			// 	)
			// 		return 'Branch';
			// 	// 	// return '';
			// 	else if (
			// 		formState?.values?.[field.name] === CONST.FIELD_NAME_NC ||
			// 		formState?.values?.[field.name] === CONST.FIELD_NAME_NC2
			// 	)
			// 		return null;
			// }
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

	const fetchSectionDetails = async () => {
		try {
			setFetchingSectionData(true);
			const fetchRes = await axios.get(
				`${API.API_END_POINT}/updateLoanDetails?${formatGetSectionReqBody({
					application,
				})}`
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

	useEffect(() => {
		// scrollToTopRootElement();
		// if (!selectedConnectorId) return;
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
				value: selectedConnector?.user_reference_no,
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
	// 			value: selectedConnector?.user_reference_no,
	// 		});
	// 	}
	// 	// eslint-disable-next-line
	// }, [formState.values, connectorOptions]);

	useLayoutEffect(() => {
		getBranchOptions();
		getConnectors();
		fetchSectionDetails();
		// eslint-disable-next-line
	}, []);

	// console.log('loan-details-allstates-', {
	// 	app,
	// 	application,
	// 	selectedDirector,
	// 	formState,
	// 	selectedSection,
	// });
	//console.log(sectionData?.imd_details?.imd_document?.uploaded_doc_name);

	return (
		<UI_SECTIONS.Wrapper style={{ marginTop: 50 }}>
			{fetchingSectionData ? (
				<Loading />
			) : (
				<>
					{tempSelected?.sub_sections?.map((sub_section, sectionIndex) => {
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
											newField.options = [
												...selectedDirectorOptions,
												...newField.options,
											];
										}
										if (newField.name === CONST.CONNECTOR_NAME_FIELD_NAME) {
											newField.options = connectorOptions;
										}

										if (newField?.name === CONST.BRANCH_FIELD_NAME) {
											newField.options = branchOptions;
										}

										// if (
										// 	newField?.name === CONST.TENURE &&
										// 	`${formState.values[CONST.LOAN_AMOUNT]}` === '200000'
										// ) {
										// 	newField.options = newField?.options.filter(
										// 		option => `${option.value}` !== '156'

										// console.log(`${formState?.values?.[CONST.LOAN_AMOUNT]}`);
										// 	newField.options =
										// 		newField?.specific_options?.[
										// 			`${formState?.values?.[CONST.LOAN_AMOUNT]}`
										// 		] || newField?.options;
										// 	);
										// }

										if (
											newField?.name === CONST.TENURE &&
											`${formState?.values?.[CONST.LOAN_AMOUNT]}`?.length > 0
										) {
											newField?.specific_options?.forEach(item => {
												if (
													Number(
														formState?.values?.[newField?.specific_options_for]
													) >= item.min &&
													Number(
														formState?.values?.[newField?.specific_options_for]
													) <= item.max
												) {
													newField.options = item.options;
													return;
												} else {
													newField.options = newField.options;
												}
											});
										}

										if (
											newField?.name === CONST.TENURE &&
											`${formState?.values?.[CONST.LOAN_AMOUNT]}`?.length > 0
										) {
											newField?.specific_options?.forEach(item => {
												if (
													Number(
														formState?.values?.[newField?.specific_options_for]
													) >= item.min &&
													Number(
														formState?.values?.[newField?.specific_options_for]
													) <= item.max
												) {
													newField.options = item.options;
													return;
												} else {
													newField.options = newField.options;
												}
											});
										}

										if (
											newField?.name === CONST.BRANCH_FIELD_NAME &&
											formState?.values?.['loan_source'] === 'Branch'
										) {
											customFieldProps.disabled = true;
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
														doc =>
															`${doc?.document_id}` === `${imd_document_id}`
													)?.[0] || null;
											}
											return (
												<UI_SECTIONS.FieldWrapGrid
													key={`field-${fieldIndex}-${field.name}`}
												>
													<InputFieldSingleFileUpload
														field={newField}
														uploadedFile={selectedImdDocumentFile}
														selectedDocTypeId={selectedDocTypeId}
														clearErrorFormState={clearErrorFormState}
														addCacheDocumentTemp={addCacheDocumentTemp}
														removeCacheDocumentTemp={removeCacheDocumentTemp}
														errorColorCode={errorMessage ? 'red' : ''}
														isFormSubmited={!!formState?.submit?.isSubmited}
														category='other' // TODO: varun discuss with madhuri how to configure this category from JSON
													/>
													{errorMessage && (
														<UI_SECTIONS.ErrorMessage>
															{errorMessage}
														</UI_SECTIONS.ErrorMessage>
													)}
												</UI_SECTIONS.FieldWrapGrid>
											);
										}

										let newPrefilledValue = prefilledValues(newField);

										if (newField?.sum_of?.length > 0) {
											// console.log('field-sum-of-', { newField });
											let newPrefilledValueSum = 0;
											newField?.sum_of?.forEach(field_name => {
												newPrefilledValueSum += formState?.values?.[field_name]
													? +formState?.values?.[field_name]
													: 0;
											});
											// console.log('field-sum-', { newPrefilledValueSum });
											newPrefilledValue = newPrefilledValueSum;
										}

										if (newField?.name === CONST.FIELD_NAME_PURPOSE_OF_LOAN) {
											newPrefilledValue = selectedProduct?.name || '';
										}

										if (isViewLoan) {
											customFieldProps.disabled = true;
										}

										if (
											!(
												`${sectionData?.loan_details?.loan_status_id}` ===
												`${CONST.IS_IN_DRAFT_OR_APPLICATION_STAGE}`
											) &&
											newField?.name === CONST.IMD_COLLECTED_FIELD_NAME
										) {
											customFieldProps.disabled = true;
										}

										return (
											<UI_SECTIONS.FieldWrapGrid
												key={`field-${fieldIndex}-${newField.name}`}
											>
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
									const isIMDDocumentExist =
										selectedImdDocumentFile || editLoanUploadedFile;
									if (
										formState?.values?.[CONST.IMD_COLLECTED_FIELD_NAME] ===
											'Yes' &&
										!isIMDDocumentExist
									) {
										addToast({
											message: 'IMD document is mandatory',
											type: 'error',
										});
										return;
									}
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

export default LoanDetails;
