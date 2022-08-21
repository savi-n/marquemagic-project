// active page
/* This file contains document upload section i.e visibility of documents, tags etc*/
import { useContext, useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

import Button from 'components/Button';
import CheckBox from 'shared/components/Checkbox/CheckBox';
import FileUpload from 'shared/components/FileUpload/FileUpload';
import AuthenticationOtpModal from 'shared/components/AuthenticationOTPModal/AuthenticationOtpModal';
import BankStatementModal from 'components/BankStatementModal';
import Loading from 'components/Loading';

import { LoanFormContext } from 'reducer/loanFormDataReducer';
import {
	DOCS_UPLOAD_URL,
	BUSSINESS_LOAN_CASE_CREATION,
	NC_STATUS_CODE,
	ADD_SUBSIDIARY_DETAILS,
	ADD_BANK_DETAILS,
	ADD_SHAREHOLDER_DETAILS,
	ADD_REFENCE_DETAILS,
	DOCTYPES_FETCH,
	WHITELABEL_ENCRYPTION_API,
	CIN_UPDATE,
	BUSSINESS_LOAN_CASE_CREATION_EDIT,
	UPLOAD_CACHE_DOCS,
	AUTHENTICATION_GENERATE_OTP,
	DELETE_DOCUMENT,
	CO_APPLICANTS_DOCTYPES_FETCH,
} from '_config/app.config';
import { DOCUMENTS_TYPE } from '_config/key.config';
import { BussinesContext } from 'reducer/bussinessReducer';
import { FlowContext } from 'reducer/flowReducer';
import { AppContext } from 'reducer/appReducer';
import { CaseContext } from 'reducer/caseReducer';
import { useToasts } from 'components/Toast/ToastProvider';
import useFetch from 'hooks/useFetch';

import * as UI from './ui';
import * as CONST from './const';
import { asyncForEach } from 'utils/helper';
import downArray from 'assets/icons/down_arrow_grey_icon.png';

const DocumentUpload = props => {
	const { productDetails, userType, id, onFlowChange, map, productId } = props;
	const aTag = (
		<a
			href={productDetails?.termsandconditionsurl}
			rel='noreferrer'
			target={'_blank'}
			style={{ color: 'blue' }}>
			Terms and Conditions
		</a>
	);
	const textForCheckbox = {
		grantCibilAcces: 'I here by give consent to pull my CIBIL records',
		declaration: 'I have read the ',
		aTag: aTag,
		declaration2: ' and I agree to the same.',
		defaultDeclaration:
			'I here do declare that what is stated above is true to the best of my knowledge and  belief',
	};

	const {
		state,
		actions: { setLoanDocuments, removeLoanDocument, setLoanDocumentType },
	} = useContext(LoanFormContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const {
		state: { flowMap },
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setLoanRef },
	} = useContext(CaseContext);
	const {
		state: { clientToken },
	} = useContext(AppContext);

	const [cibilCheckbox, setCibilCheckbox] = useState(false);
	//const [message, setMessage] = useState('');
	const [declareCheck, setDeclareCheck] = useState(false);

	const [otherBankStatementModal, setOtherBankStatementModal] = useState(false);
	//const [cibilCheckModal, setCibilCheckModal] = useState(false);
	const idType =
		productDetails.loan_request_type === 1 ? 'business' : 'salaried';

	const [
		isAuthenticationOtpModalOpen,
		setIsAuthenticationOtpModalOpen,
	] = useState(false);
	// const [contactNo, setContactNo] = useState();
	const [, setIsVerifyWithOtpDisabled] = useState(false);
	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const [caseCreationProgress, setCaseCreationProgress] = useState(false);
	//const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
	const onOtherStatementModalToggle = () => {
		setOtherBankStatementModal(!otherBankStatementModal);
	};
	const [openKycdoc, setOpenKycDoc] = useState(true);
	const [openCoKycdoc, setOpenCoKycdoc] = useState(false);
	const [openFinancialdoc, setOpenFinancialDoc] = useState(false);
	const [openCoFinancialdoc, setOpenCoFinancialdoc] = useState(false);
	const [openOtherdoc, setOpenOtherDoc] = useState(false);
	const [openCoOtherdoc, setOpenCoOtherDoc] = useState(false);
	const [KycDocOptions, setKycDocOptions] = useState([]);
	const [FinancialDocOptions, setFinancialDocOptions] = useState([]);
	const [OtherDocOptions, setOtherDocOptions] = useState([]);
	const [CoDocOptions, setCoDocOptions] = useState({});
	const [prefilledKycDocs, setPrefilledKycDocs] = useState([]);
	const [prefilledFinancialDocs, setPrefilledFinancialDocs] = useState([]);
	const [prefilledOtherDocs, setPrefilledOtherDocs] = useState([]);
	const [startingKYCDoc, setStartingKYCDoc] = useState([]);
	const [startingFinDoc, setStartingFinDoc] = useState([]);
	const [startingOtherDoc, setStartingOtherDoc] = useState([]);
	const [startingUnTaggedKYCDocs, setStartingUnTaggedKYCDocs] = useState([]);
	const [startingUnTaggedFinDocs, setStartingUnTaggedFinDocs] = useState([]);
	const [startingUnTaggedOtherDocs, setStartingUnTaggedOtherDocs] = useState(
		[]
	);
	const [loading, setLoading] = useState(false);
	// const url = window.location.hostname;
	//console.log('coApplicantId', coApplicantId);
	const applicationState = JSON.parse(
		sessionStorage.getItem(window.location.hostname)
	);
	const formReducer = applicationState?.formReducer;
	const userReducer = applicationState?.userReducer;
	const applicantData = formReducer?.user?.applicantData;
	const companyData =
		sessionStorage.getItem('companyData') &&
		JSON.parse(sessionStorage.getItem('companyData'));
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	let isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	// const editLoanCoApplicants =
	// 	editLoanData?.director_details?.filter(
	// 		d => d?.type_name?.toLowerCase() === 'co-applicant'
	// 	) || [];
	const API_TOKEN = sessionStorage.getItem('userToken');
	let corporateDetails = sessionStorage.getItem('corporateDetails');
	if (corporateDetails) corporateDetails = JSON.parse(corporateDetails);
	const business_income_type_id =
		applicantData?.incomeType ||
		state['business-details']?.BusinessType ||
		companyData?.BusinessType ||
		editLoanData?.business_id?.businesstype ||
		'';

	// const coApplicants = sessionStorage.getItem('coapplicant_response')
	// 	? JSON.parse(sessionStorage.getItem('coapplicant_response'))
	// 	: editLoanCoApplicants;
	const sessionCoApplicantReqBody =
		formReducer?.user?.['co-applicant-details-reqbody'] || [];

	// console.log('LoanDocumentsUpload-allstates-', {
	// 	state,
	// 	formReducer,
	// 	userReducer,
	// 	business_income_type_id,
	// 	productId,
	// 	loan_product:
	// 		productId[business_income_type_id] ||
	// 		productId[(formReducer?.incomeType)] ||
	// 		productId[idType],
	// 	KycDocOptions,
	// 	FinancialDocOptions,
	// 	OtherDocOptions,
	// 	prefilledKycDocs,
	// 	prefilledFinancialDocs,
	// 	prefilledOtherDocs,
	// 	startingKYCDoc,
	// 	startingFinDoc,
	// 	startingOtherDoc,
	// 	startingUnTaggedKYCDocs,
	// 	startingUnTaggedFinDocs,
	// 	startingUnTaggedOtherDocs,
	// });

	const { response } = useFetch({
		url: DOCTYPES_FETCH,
		options: {
			method: 'POST',
			data: {
				business_type: business_income_type_id,
				loan_product:
					productId[business_income_type_id] ||
					productId[(applicantData?.incomeType)] ||
					productId[idType],
			},
		},
		headers: {
			Authorization: `Bearer ${API_TOKEN}`,
			// Authorization: `Bearer ${JSON.parse(userToken) &&
			// 	JSON.parse(userToken).userReducer &&
			// 	JSON.parse(userToken).userReducer?.userToken}`,
		},
	});

	const getWhiteLabel = async () => {
		const encryptWhiteLabelReq = await newRequest(
			WHITELABEL_ENCRYPTION_API,
			{
				method: 'GET',
			},
			{
				Authorization: `Bearer ${API_TOKEN}`,
				// Authorization: `Bearer ${JSON.parse(userToken) &&
				// 	JSON.parse(userToken).userReducer &&
				// 	JSON.parse(userToken).userReducer?.userToken}`,
			}
		);

		const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

		sessionStorage.setItem(
			'encryptWhiteLabel',
			encryptWhiteLabelRes.encrypted_whitelabel[0]
		);
	};

	const getCoApplicantDocumentTypes = async incomeType => {
		try {
			if (sessionCoApplicantReqBody.length > 0) {
				// http://3.108.54.252:1337/coApplicantDocList?income_type=1
				const coAppDocTypesRes = await axios.get(
					`${CO_APPLICANTS_DOCTYPES_FETCH}?income_type=${incomeType}`,
					{
						headers: {
							Authorization: `Bearer ${API_TOKEN}`,
						},
					}
				);
				// console.log('coAppDocTypesRes-', coAppDocTypesRes);
				// TODO: request doc_type_id from BE
				const newDocTypeList = [];
				coAppDocTypesRes?.data?.data?.map(d =>
					newDocTypeList.push({ ...d, doc_type_id: d.id })
				);
				return newDocTypeList || [];
			}
		} catch (error) {
			console.error('error-getCoApplicantDocumentTypes-', error);
			return [];
		}
	};

	const initializeComponent = async () => {
		try {
			setLoading(true);
			const startingDocs = state?.documents || [];
			// console.log('loan-doc-upload-useEffect-', {
			// 	startingDocs,
			// 	flowMap,
			// 	business_income_type_id,
			// });
			const flowDocTypeMappingList = {};

			const JSON_PAN_SECTION = flowMap?.['pan-verification']?.fields || [];
			for (const key in JSON_PAN_SECTION) {
				JSON_PAN_SECTION[key]?.data?.map(d => {
					if (d.req_type && d.doc_type[`${business_income_type_id}`]) {
						flowDocTypeMappingList[`${d.req_type}`] =
							d.doc_type[`${business_income_type_id}`];
					}
					return null;
				});
			}

			const JSON_HOMELOAN_SECTION =
				flowMap?.['home-loan-details']?.fields || [];
			for (const key in JSON_HOMELOAN_SECTION) {
				JSON_HOMELOAN_SECTION[key]?.data?.map(d => {
					if (d.doc_type && d.doc_type[`${business_income_type_id}`]) {
						flowDocTypeMappingList[`property`] =
							d.doc_type[`${business_income_type_id}`];
					}
					return null;
				});
			}

			const newKycDocs = [];
			const newFinDocs = [];
			const newOtherDocs = [];
			const newKycUnTagDocs = [];
			const newFinUnTagDocs = [];
			const newOtherUnTagDocs = [];
			if (startingDocs.length > 0) {
				/* map typeId here for req_type: pan/aadhar/voter/DL property doc */
				startingDocs.map((doc, docIndex) => {
					const newDoc = {
						...doc,
						name: doc.upload_doc_name,
						progress: '100',
						status: 'completed',
						file: null,
						typeId:
							doc.typeId || flowDocTypeMappingList[`${doc.req_type}`] || '',
					};
					if (newDoc.typeId) startingDocs[docIndex].typeId = newDoc.typeId;
					// console.log('startingDoc-', { doc, newDoc });
					if (newDoc.mainType === 'KYC') newKycDocs.push(newDoc);
					else if (newDoc.mainType === 'Financial') newFinDocs.push(newDoc);
					else if (newDoc.mainType === 'Others') newOtherDocs.push(newDoc);
					else {
						if (newDoc.sectionType === 'kyc') newKycUnTagDocs.push(newDoc);
						else if (newDoc.sectionType === 'financial')
							newFinUnTagDocs.push(newDoc);
						else if (newDoc.sectionType === 'others')
							newOtherUnTagDocs.push(newDoc);
					}
					return null;
				});
			}
			// console.log('loan-doc-upload-useEffect-', {
			// 	flowDocTypeMappingList,
			// 	newKycDocs,
			// 	newFinDocs,
			// 	newOtherDocs,
			// 	newKycUnTagDocs,
			// 	newFinUnTagDocs,
			// 	newOtherUnTagDocs,
			// });
			setStartingKYCDoc(newKycDocs);
			setStartingFinDoc(newFinDocs);
			setStartingOtherDoc(newOtherDocs);
			setStartingUnTaggedKYCDocs(newKycUnTagDocs);
			setStartingUnTaggedFinDocs(newFinUnTagDocs);
			setStartingUnTaggedOtherDocs(newOtherUnTagDocs);
			await getWhiteLabel();

			// TODO: initialize to empty array
			// const allCoApplicantIncomeTypes = [0, 1, 2, 3, 4, 5, 6, 7];
			const allCoApplicantIncomeTypes = [];
			sessionCoApplicantReqBody.map(c => {
				if (!allCoApplicantIncomeTypes.includes(c.income_type))
					allCoApplicantIncomeTypes.push(c.income_type);
				return null;
			});
			const newCoDocOptions = {};
			await asyncForEach(allCoApplicantIncomeTypes, async incomeType => {
				newCoDocOptions[incomeType] = await getCoApplicantDocumentTypes(
					incomeType
				);
			});
			setCoDocOptions(newCoDocOptions);
			setLoading(false);
		} catch (error) {
			console.error('error-initializeComponent-', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		initializeComponent();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		try {
			setLoading(true);
			if (response) {
				let optionArray = [];
				DOCUMENTS_TYPE?.forEach(docType => {
					optionArray = [
						...optionArray,
						...response?.[docType[1]]?.map(dT => ({
							...dT,
							value: dT.doc_type_id,
							name: dT.name,
							main: docType[0],
						})),
					];
				});

				//console.log('option Array', optionArray);
				const kycDocDropdown = [];
				const financialDocDropdown = [];
				// const CokycDocDropdown = [];
				// const CoFinancialDocDropdown = [];
				const otherDocDropdown = [];
				const kycDocIds = [];
				const finDocIds = [];
				// const CokycDocIds = [];
				// const CoFinDocIds = [];
				const othDocIds = [];
				optionArray.map(ele => {
					if (ele.main === 'KYC') {
						kycDocDropdown.push(ele);
						kycDocIds.push(ele.value);
					}
					if (ele.main === 'Financial') {
						financialDocDropdown.push(ele);
						finDocIds.push(ele.value);
					}
					if (ele.main === 'Others') {
						otherDocDropdown.push(ele);
						othDocIds.push(ele.value);
					}
					return null;
				});
				// const coApplicantArray = [...optionArray];
				// coApplicantArray.map(ele => {
				// 	if (ele.main === 'KYC') {
				// 		CokycDocDropdown.push(ele);
				// 		CokycDocIds.push(ele.value);
				// 	}
				// 	if (ele.main === 'Financial') {
				// 		CoFinancialDocDropdown.push(ele);
				// 		CoFinDocIds.push(ele.value);
				// 	}
				// 	return null;
				// });
				setKycDocOptions(kycDocDropdown);
				setFinancialDocOptions(financialDocDropdown);
				setOtherDocOptions(otherDocDropdown);
				// setCoKycDocOptions(CokycDocDropdown);
				// setCoFinancialDocOptions(CoFinancialDocDropdown);

				//setDocumentTypeOptions(optionArray);
				//console.log('coapplicant', coApplicant);
				// console.log('loanducmentupload-response-', { kycDocDropdown, editLoanData });
				if (
					editLoanData &&
					editLoanData?.loan_document &&
					editLoanData?.loan_document?.length > 0
				) {
					const newKyc = [];
					const newFin = [];
					const newOtr = [];
					editLoanData.loan_document.map(doc => {
						if (doc.deleted_by) return null;
						const newDoc = {
							...doc,
							name:
								doc.original_doc_name ||
								doc.uploaded_doc_name ||
								doc.doc_name ||
								'',
							progress: '100',
							status: 'completed',
							file: null,
						};
						if (kycDocIds.includes(newDoc.doctype)) newKyc.push(newDoc);
						else if (finDocIds.includes(newDoc.doctype)) newFin.push(newDoc);
						else newOtr.push(newDoc);
						return null;
					});
					// console.log('newKyc', newKyc);
					setPrefilledKycDocs(newKyc);
					setPrefilledFinancialDocs(newFin);
					setPrefilledOtherDocs(newOtr);
				}
				setLoading(false);
			}
		} catch (error) {
			console.error('error-loandocumentupload-initializedocument-', error);
			setLoading(false);
		}
		// eslint-disable-next-line
	}, [response]);

	const handleFileUpload = async (files, director_id = false) => {
		const newFiles = [];
		if (director_id) {
			files.map(f => newFiles.push({ ...f, director_id }));
		}
		setLoanDocuments(director_id ? newFiles : files);
	};

	const handleFileRemove = async (fileId, file) => {
		// console.log('handleFileRemove-', { fileId, file });
		if (editLoanData && (file?.business_id || file?.loan)) {
			const reqBody = {
				loan_doc_id: file?.id || '',
				business_id: file?.business_id || editLoanData?.business_id?.id || '',
				loan_id: file?.loan || editLoanData?.id || '',
				userid: file?.user_id || '',
			};
			const newEditLoan = _.cloneDeep(editLoanData);
			const editDocIndex = newEditLoan.loan_document.findIndex(
				d => d.id === fileId
			);
			if (editDocIndex !== -1)
				newEditLoan.loan_document[editDocIndex].deleted_by = reqBody.userid;
			sessionStorage.setItem('editLoan', JSON.stringify(newEditLoan));
			// console.log('reqBody-', reqBody);
			// return;
			newRequest(
				DELETE_DOCUMENT,
				{
					method: 'POST',
					data: reqBody,
				},
				{
					Authorization: `Bearer ${API_TOKEN}`,
				}
			).then(res => {
				// console.log('handleFileRemove-Server-res', res);
			});
		}
		removeLoanDocument(fileId);
	};

	const handleDocumentTypeChange = async (fileId, type) => {
		setLoanDocumentType(fileId, type);
	};

	const buttonDisabledStatus = () => {
		return !(cibilCheckbox && declareCheck);
	};

	// step: 1 if applicant submit request createCase
	const createCaseReq = async () => {
		try {
			// in case of edit
			// Business_details - businessid
			// loan_details - loanId
			// director_details - id
			let uploaddedDoc = state?.documents.filter(doc => {
				if (!doc.requestId) return doc;
				return null;
			});
			const reqBody = CONST.caseCreationDataFormat(
				{
					...state,
					productId,
				},
				uploaddedDoc,
				companyDetail,
				productDetails,
				productId,
				editLoanData
			);

			if (sessionStorage.getItem('userDetails')) {
				try {
					reqBody.user_id =
						JSON.parse(sessionStorage.getItem('userDetails'))?.id || null;
				} catch (err) {
					return err;
				}
			}

			// Test area
			// console.log('LoanDocumentsUpload-Create-Edit-ReqBody', reqBody);
			// return;
			// Test area

			const caseReq = await newRequest(
				editLoanData && editLoanData?.loan_ref_id
					? BUSSINESS_LOAN_CASE_CREATION_EDIT
					: BUSSINESS_LOAN_CASE_CREATION,
				{
					method: 'POST',
					data: reqBody,
				},
				{
					Authorization: `Bearer ${API_TOKEN}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				const resLoanRefId =
					editLoanData?.loan_ref_id ||
					caseReq.data.data.loan_details.loan_ref_id;
				//setMessage(resLoanRefId);
				setLoanRef(resLoanRefId);
				const compData =
					sessionStorage.getItem('companyData') &&
					JSON.parse(sessionStorage.getItem('companyData'));

				if (compData && compData.CIN) {
					const reqBody = {
						loan_ref_id: resLoanRefId,
						cin_number: compData.CIN,
					};
					await newRequest(
						CIN_UPDATE,
						{
							method: 'POST',
							data: reqBody,
						},
						{
							Authorization: `Bearer ${API_TOKEN}`,
						}
					);
				}

				//**** uploadCacheDocuments
				//console.log('LoanDocumentsUpload-UPLOAD_CACHE_DOCS-state', state);
				const uploadCacheDocsArr = [];
				state?.documents.map(doc => {
					// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
					if (!doc.typeId) return null;
					if (doc.requestId) {
						const ele = { request_id: doc.requestId, doc_type_id: doc.typeId };
						uploadCacheDocsArr.push(ele);
					}
					return null;
				});

				if (uploadCacheDocsArr.length) {
					const uploadCacheDocBody = {
						loan_id: caseRes.data.loan_details.id,
						request_ids_obj: uploadCacheDocsArr,
						user_id: +caseRes.data.loan_details.createdUserId,
					};
					await newRequest(
						UPLOAD_CACHE_DOCS,
						{
							method: 'POST',
							data: uploadCacheDocBody,
						},
						{
							Authorization: clientToken,
						}
					);
				}

				// ends here

				let newCaseRes = caseRes.data;
				if (editLoanData && editLoanData?.loan_ref_id) {
					newCaseRes = {
						...caseRes.data,
						...editLoanData,
						loanId: editLoanData?.id,
					};
				}
				return newCaseRes;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.error('STEP: 1 => CASE CREATION ERROR', er.message);
			throw new Error(er.message);
		}
	};

	// step: 2 if subsidary details submit request
	const addSubsidiaryReq = async caseId => {
		const reqBody = CONST.subsidiaryDataFormat(caseId, state, editLoanData);
		//console.log('subsidary 23 ', state);
		if (!reqBody) {
			return true;
		}
		try {
			const caseReq = await newRequest(
				ADD_SUBSIDIARY_DETAILS,
				{
					method: 'POST',
					data: reqBody,
				},
				{
					Authorization: `Bearer ${API_TOKEN}`,
				}
			);
			const caseRes = caseReq.data;

			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes.data;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.error('STEP: 2 => CASE CREATION ERRROR', er.message);
			throw new Error(er.message);
		}
	};

	// step: 3 if subsidary details submit request
	const addBankDetailsReq = async caseId => {
		const formData = CONST.bankDetailsDataFormat(caseId, state, editLoanData);
		// console.log('addBankDetailsReq-', { formData, caseId, state });
		// throw Error('bank details');

		if (!formData) {
			return true;
		}
		if (
			formData?.emiDetails?.[0]?.emiAmount ||
			formData?.emiDetails?.[0]?.bank_name ||
			formData?.bank_name ||
			formData?.account_holder_name
		) {
			try {
				const caseReq = await newRequest(
					ADD_BANK_DETAILS,
					{
						method: 'POST',
						data: formData,
					},
					{
						Authorization: `Bearer ${API_TOKEN}`,
					}
				);
				const caseRes = caseReq.data;
				if (
					caseRes.statusCode === NC_STATUS_CODE.NC200 ||
					caseRes.status === NC_STATUS_CODE.OK
				) {
					return caseRes.data;
				}

				// throw new Error(caseRes.message);
			} catch (er) {
				console.error('error ADD BANK DETAILS ERRROR', er.message);
				// throw new Error(er.message);
			}
		}
	};

	// step: 4 if subsidary details submit request
	const addShareHolderDetailsReq = async businessId => {
		const formData = CONST.shareHolderDataFormat(
			businessId,
			state,
			editLoanData
		);
		if (!formData) {
			return true;
		}
		try {
			const caseReq = await newRequest(
				ADD_SHAREHOLDER_DETAILS,
				{
					method: 'POST',
					data: formData,
				},
				{
					Authorization: `Bearer ${API_TOKEN}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes.data;
			}

			// throw new Error(caseRes.message);
		} catch (er) {
			console.error('STEP:3 => ADD SHAREHOLDER DETAILS ERRROR', er.message);
			// throw new Error(er.message);
		}
	};

	// step: 5 if subsidary details submit request
	const addReferenceDetailsReq = async loanId => {
		const formData = CONST.refereneceDataFormat(loanId, state, editLoanData);
		if (formData.loanReferenceData.length === 0) {
			return true;
		}
		try {
			const caseReq = await newRequest(
				ADD_REFENCE_DETAILS,
				{
					method: 'POST',
					data: formData,
				},
				{
					Authorization: `Bearer ${API_TOKEN}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes.data;
			}

			// throw new Error(caseRes.message);
		} catch (er) {
			console.error('STEP:3 => ADD REF DETAILS ERRROR', er.message);
			// throw new Error(er.message);
		}
	};

	const caseCreationSteps = async data => {
		try {
			// step 1: create case
			const caseCreateRes = await createCaseReq();
			const caseId =
				editLoanData?.loan_ref_id || caseCreateRes.loan_details.loan_ref_id;
			const loanId = editLoanData?.id || caseCreateRes.loan_details.id;
			const businessId =
				editLoanData?.business_id?.id || caseCreateRes.loan_details.business_id;

			await addSubsidiaryReq(caseId);
			await addBankDetailsReq(caseId);
			await addShareHolderDetailsReq(businessId);
			await addReferenceDetailsReq(loanId);

			// return;
			// step 2: upload documents reference [loanId from createcase]
			// await updateDocumentList(caseCreateRes.loanId, USER_ROLES.User);

			return caseCreateRes;
		} catch (er) {
			console.error('APPLICANT CASE CREATE STEP ERROR-----> ', er.message);
			addToast({
				message: er.message,
				type: 'error',
			});
		}
	};

	const isFormValid = () => {
		let docError = false;
		let manadatoryError = false;
		state?.documents?.map(ele => {
			// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
			if (ele.req_type) return null;
			if (!ele.typeId) {
				docError = true;
				return false;
			}
			return null;
		});
		const allDocOptions = [
			...KycDocOptions,
			...FinancialDocOptions,
			...OtherDocOptions,
		];
		const allMandatoryDocumentIds = [];
		allDocOptions.map(
			d => d.isMandatory && allMandatoryDocumentIds.push(d.value)
		);
		const uploadedDocumetnIds = [];
		state?.documents?.map(d => uploadedDocumetnIds.push(d.typeId));

		if (productDetails.document_mandatory) {
			allMandatoryDocumentIds.map(docId => {
				if (!uploadedDocumetnIds.includes(docId)) {
					manadatoryError = true;
					setCaseCreationProgress(false);
					return null;
				}
				return null;
			});
		}
		// console.log('LoanDocumentsUpload-isFormValid-', {
		// 	state,
		// 	allDocOptions,
		// 	allMandatoryDocumentIds,
		// 	uploadedDocumetnIds,
		// 	manadatoryError,
		// });

		if (docError) {
			addToast({
				message: 'Please select the document type',
				type: 'error',
			});
			return false;
		}
		if (manadatoryError) {
			addToast({
				message:
					'Please upload all the required documents to submit the application',
				type: 'error',
			});
			return false;
		}
		return true;
	};
	const product_id = sessionStorage.getItem('productId');

	const onSubmitOtpAuthentication = async () => {
		try {
			if (buttonDisabledStatus()) return;
			if (!isFormValid()) return;
			setIsAuthenticationOtpModalOpen(true);
			await newRequest(AUTHENTICATION_GENERATE_OTP, {
				method: 'POST',
				data: {
					mobile: applicantData?.mobileNo || companyData?.mobileNo,
					business_id: sessionStorage.getItem('business_id') || '',
					product_id,
				},
				headers: {
					Authorization: `Bearer ${API_TOKEN}`,
				},
			});
		} catch (error) {
			console.error(error);
			addToast({
				message:
					error?.response?.data?.message || 'Server down, try after sometimes',
				type: 'error',
			});
		}
	};

	const onSubmitCompleteApplication = async () => {
		setCaseCreationProgress(true);
		if (buttonDisabledStatus()) return;
		if (!isFormValid()) return;

		// Before Case Creation Testing Area Do not push this code
		// const refReqBody = refereneceDataFormat('CA01000000', state);
		// console.log('onSubmitCompleteApplication-', { refReqBody });
		// setLoading(false);
		// return;
		// -- Before Case Creation Testing Area Do not push this code

		if (!userType) {
			const loanReq = await caseCreationSteps(state);

			if (!loanReq && !loanReq?.loanId) {
				setCaseCreationProgress(false);
				return;
			}

			if (editLoanData && editLoanData?.loan_ref_id) {
				setTimeout(() => {
					addToast({
						message: 'Your application has been updated',
						type: 'success',
					});
				}, 1000);
			}
			setCompleted(id);
			onFlowChange(!map ? 'application-submitted' : map.main);
		}
		setCaseCreationProgress(false);
	};

	const openCloseCollaps = name => {
		if (name === 'KYC') {
			setOpenKycDoc(!openKycdoc);
		}
		if (name === 'Financial') {
			setOpenFinancialDoc(!openFinancialdoc);
		}
		if (name === 'Others') {
			setOpenOtherDoc(!openOtherdoc);
		}
	};
	const openCloseCollapsCoapplicant = name => {
		if (name === 'KYC') {
			setOpenCoKycdoc(!openCoKycdoc);
		}
		if (name === 'Financial') {
			setOpenCoFinancialdoc(!openCoFinancialdoc);
		}
		if (name === 'Others') {
			setOpenCoOtherDoc(!openCoOtherdoc);
		}
	};

	const initialCoCount = {};
	sessionCoApplicantReqBody?.map(c => {
		initialCoCount[c.id] = 0;
		return null;
	});
	let kyccount = 0;
	let kycCoCount = initialCoCount;
	let financialCount = 0;
	let fincacialCoCount = initialCoCount;
	let otherCount = 0;
	let otherCoCount = initialCoCount;

	// const documentChecklist = state?.documents?.map(docs => docs.typeName) || [];

	state?.documents?.map(docs => {
		if (docs.director_id && docs.mainType === 'KYC')
			return kycCoCount[docs.director_id]++;
		if (docs.director_id && docs.mainType === 'Financial')
			return fincacialCoCount[docs.director_id]++;
		if (docs.director_id && docs.mainType === 'Others')
			return otherCoCount[docs.director_id]++;
		if (docs.mainType === 'KYC') return kyccount++;
		if (docs.mainType === 'Financial') return financialCount++;
		if (docs.mainType === 'Others') return otherCount++;
		return null;
	});

	if (
		editLoanData &&
		editLoanData?.loan_document &&
		editLoanData?.loan_document?.length > 0
	) {
		if (prefilledKycDocs.length) {
			kyccount = kyccount + prefilledKycDocs.length;
		}
		if (prefilledFinancialDocs.length) {
			financialCount = financialCount + prefilledFinancialDocs.length;
		}
		if (prefilledOtherDocs.length) {
			otherCount = otherCount + prefilledOtherDocs.length;
		}
	}

	if (loading) {
		return (
			<UI.LoaderWrapper>
				<Loading />
			</UI.LoaderWrapper>
		);
	}

	return (
		<>
			{isAuthenticationOtpModalOpen && (
				<AuthenticationOtpModal
					isAuthenticationOtpModalOpen={isAuthenticationOtpModalOpen}
					setIsAuthenticationOtpModalOpen={setIsAuthenticationOtpModalOpen}
					setContactNo={applicantData?.mobileNo || companyData?.mobileNo}
					setIsVerifyWithOtpDisabled={setIsVerifyWithOtpDisabled}
					onSubmitCompleteApplication={onSubmitCompleteApplication}
				/>
			)}
			<UI.Colom1>
				<UI.H>
					<span>Applicant Document Upload</span>
				</UI.H>
				{/* don't delete */}
				{/* disable/enable below code when useEffect, useFetch giving errors */}
				{/* {loading ? <></> : null} */}
				{KycDocOptions.length > 0 && (
					<>
						{' '}
						<UI.Section onClick={() => openCloseCollaps('KYC')}>
							<UI.H1>KYC </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									display: 'flex',
								}}>
								Document Submitted :
								<UI.StyledButton width={'auto'} fill>
									{kyccount} of {KycDocOptions.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openKycdoc ? `rotate(180deg)` : `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openKycdoc}>
							<UI.UploadWrapper open={openKycdoc}>
								<FileUpload
									prefilledDocs={prefilledKycDocs}
									startingTaggedDocs={startingKYCDoc}
									startingUnTaggedDocs={startingUnTaggedKYCDocs}
									sectionType='kyc'
									section={'document-upload'}
									onDrop={handleFileUpload}
									onRemoveFile={handleFileRemove}
									docTypeOptions={KycDocOptions}
									documentTypeChangeCallback={handleDocumentTypeChange}
									accept=''
									upload={{
										url: DOCS_UPLOAD_URL({
											userId:
												companyDetail?.userId || userReducer?.userId || '',
										}),
										header: {
											Authorization: `Bearer ${companyDetail?.token ||
												userReducer?.userToken ||
												''}`,
										},
									}}
								/>
							</UI.UploadWrapper>
						</UI.Details>
					</>
				)}
				{FinancialDocOptions.length > 0 && (
					<>
						<UI.Section onClick={() => openCloseCollaps('Financial')}>
							<UI.H1>Financial </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}>
								Document Submitted :
								<UI.StyledButton width={'auto'} fill>
									{financialCount} of {FinancialDocOptions.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openFinancialdoc ? `rotate(180deg)` : `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openFinancialdoc}>
							<UI.UploadWrapper open={openFinancialdoc}>
								<FileUpload
									prefilledDocs={prefilledFinancialDocs}
									startingTaggedDocs={startingFinDoc}
									startingUnTaggedDocs={startingUnTaggedFinDocs}
									sectionType='financial'
									section={'document-upload'}
									onDrop={handleFileUpload}
									onRemoveFile={handleFileRemove}
									docTypeOptions={FinancialDocOptions}
									documentTypeChangeCallback={handleDocumentTypeChange}
									accept=''
									upload={{
										url: DOCS_UPLOAD_URL({
											userId:
												companyDetail?.userId || userReducer?.userId || '',
										}),
										header: {
											Authorization: `Bearer ${companyDetail?.token ||
												userReducer?.userToken ||
												''}`,
										},
									}}
								/>
							</UI.UploadWrapper>
						</UI.Details>
					</>
				)}
				{OtherDocOptions.length > 0 && (
					<>
						<UI.Section onClick={() => openCloseCollaps('Others')}>
							<UI.H1>Others </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}>
								Document Submitted :
								<UI.StyledButton width={'auto'} fill>
									{otherCount} of {OtherDocOptions.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openOtherdoc ? `rotate(180deg)` : `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openOtherdoc}>
							<UI.UploadWrapper open={openOtherdoc}>
								<FileUpload
									prefilledDocs={prefilledOtherDocs}
									startingTaggedDocs={startingOtherDoc}
									startingUnTaggedDocs={startingUnTaggedOtherDocs}
									sectionType='others'
									section={'document-upload'}
									onDrop={handleFileUpload}
									onRemoveFile={handleFileRemove}
									docTypeOptions={OtherDocOptions}
									documentTypeChangeCallback={handleDocumentTypeChange}
									accept=''
									upload={{
										url: DOCS_UPLOAD_URL({
											userId:
												companyDetail?.userId || userReducer?.userId || '',
										}),
										header: {
											Authorization: `Bearer ${companyDetail?.token ||
												userReducer?.userToken ||
												''}`,
										},
									}}
								/>
							</UI.UploadWrapper>
						</UI.Details>
					</>
				)}

				{sessionCoApplicantReqBody.map((coApplicant, index) => {
					const CoKycDocOptions = [];
					const CoFinancialDocOptions = [];
					const CoOtherDocOptions = [];
					// TODO: dynamically add incometype
					// CoDocOptions?.['1']?.map(d => {
					CoDocOptions?.[coApplicant?.income_type]?.map(d => {
						if (d?.doc_type?.toLowerCase()?.includes('kyc'))
							CoKycDocOptions.push(d);
						if (d?.doc_type?.toLowerCase()?.includes('financial'))
							CoFinancialDocOptions.push(d);
						if (d?.doc_type?.toLowerCase()?.includes('other'))
							CoOtherDocOptions.push(d);
						return null;
					});
					if (
						CoKycDocOptions.length === 0 &&
						CoFinancialDocOptions.length === 0 &&
						CoOtherDocOptions.length === 0
					)
						return null;
					return (
						<>
							<div style={{ height: 30 }} />
							<UI.H>
								<span>
									Co-Applicant{' '}
									{sessionCoApplicantReqBody.length > 1 ? ` ${index + 1} ` : ''}
									Document Upload
								</span>
							</UI.H>
							{CoKycDocOptions.length > 0 ? (
								<>
									<UI.Section
										onClick={() => openCloseCollapsCoapplicant('KYC')}>
										<UI.H1>KYC </UI.H1>
										<div
											style={{
												marginLeft: 10,
												alignItems: 'center',
												display: 'flex',
											}}>
											Document Submitted :
											<UI.StyledButton width={'auto'} fill>
												{kycCoCount[coApplicant.id]} of {CoKycDocOptions.length}
											</UI.StyledButton>
										</div>
										<UI.CollapseIcon
											src={downArray}
											style={{
												transform: openCoKycdoc ? `rotate(180deg)` : `none`,
												marginLeft: 'auto',
											}}
											alt='arrow'
										/>
									</UI.Section>
									<UI.Details open={openCoKycdoc}>
										<UI.UploadWrapper open={openCoKycdoc}>
											<FileUpload
												// prefilledDocs={prefilledKycDocs}
												// startingTaggedDocs={startingKYCDoc}
												//startingUnTaggedDocs={startingUnTaggedKYCDocs}
												sectionType='kyc'
												section={'document-upload'}
												onDrop={files =>
													handleFileUpload(files, coApplicant?.id)
												}
												onRemoveFile={handleFileRemove}
												docTypeOptions={CoKycDocOptions}
												documentTypeChangeCallback={handleDocumentTypeChange}
												accept=''
												upload={{
													url: DOCS_UPLOAD_URL({
														userId:
															companyDetail?.userId ||
															userReducer?.userId ||
															'',
													}),
													header: {
														Authorization: `Bearer ${companyDetail?.token ||
															userReducer?.userToken ||
															''}`,
													},
												}}
											/>
										</UI.UploadWrapper>
									</UI.Details>
								</>
							) : null}
							{CoFinancialDocOptions.length > 0 && (
								<>
									<UI.Section
										onClick={() => openCloseCollapsCoapplicant('Financial')}>
										<UI.H1>Financial </UI.H1>
										<div
											style={{
												marginLeft: 10,
												alignItems: 'center',
												/* minWidth: '500px', */
												display: 'flex',
											}}>
											Document Submitted :
											<UI.StyledButton width={'auto'} fill>
												{fincacialCoCount[coApplicant.id]} of{' '}
												{CoFinancialDocOptions.length}
											</UI.StyledButton>
										</div>
										<UI.CollapseIcon
											src={downArray}
											style={{
												transform: openCoFinancialdoc
													? `rotate(180deg)`
													: `none`,
												marginLeft: 'auto',
											}}
											alt='arrow'
										/>
									</UI.Section>
									<UI.Details open={openCoFinancialdoc}>
										<UI.UploadWrapper open={openCoFinancialdoc}>
											<FileUpload
												prefilledDocs={prefilledFinancialDocs}
												startingTaggedDocs={startingFinDoc}
												startingUnTaggedDocs={startingUnTaggedFinDocs}
												sectionType='financial'
												section={'document-upload'}
												onDrop={files =>
													handleFileUpload(files, coApplicant?.id)
												}
												onRemoveFile={handleFileRemove}
												docTypeOptions={CoFinancialDocOptions}
												documentTypeChangeCallback={handleDocumentTypeChange}
												accept=''
												upload={{
													url: DOCS_UPLOAD_URL({
														userId:
															companyDetail?.userId ||
															userReducer?.userId ||
															'',
													}),
													header: {
														Authorization: `Bearer ${companyDetail?.token ||
															userReducer?.userToken ||
															''}`,
													},
												}}
											/>
										</UI.UploadWrapper>
									</UI.Details>
								</>
							)}

							{CoOtherDocOptions.length > 0 ? (
								<>
									<UI.Section
										onClick={() => openCloseCollapsCoapplicant('Others')}>
										<UI.H1>Other </UI.H1>
										<div
											style={{
												marginLeft: 10,
												alignItems: 'center',
												display: 'flex',
											}}>
											Document Submitted :
											<UI.StyledButton width={'auto'} fill>
												{otherCoCount[coApplicant.id]} of{' '}
												{CoOtherDocOptions.length}
											</UI.StyledButton>
										</div>
										<UI.CollapseIcon
											src={downArray}
											style={{
												transform: openCoOtherdoc ? `rotate(180deg)` : `none`,
												marginLeft: 'auto',
											}}
											alt='arrow'
										/>
									</UI.Section>
									<UI.Details open={openCoOtherdoc}>
										<UI.UploadWrapper open={openCoOtherdoc}>
											<FileUpload
												// prefilledDocs={prefilledKycDocs}
												// startingTaggedDocs={startingKYCDoc}
												//startingUnTaggedDocs={startingUnTaggedKYCDocs}
												sectionType='other'
												section={'document-upload'}
												onDrop={files =>
													handleFileUpload(files, coApplicant?.id)
												}
												onRemoveFile={handleFileRemove}
												docTypeOptions={CoOtherDocOptions}
												documentTypeChangeCallback={handleDocumentTypeChange}
												accept=''
												upload={{
													url: DOCS_UPLOAD_URL({
														userId:
															companyDetail?.userId ||
															userReducer?.userId ||
															'',
													}),
													header: {
														Authorization: `Bearer ${companyDetail?.token ||
															userReducer?.userToken ||
															''}`,
													},
												}}
											/>
										</UI.UploadWrapper>
									</UI.Details>
								</>
							) : null}
						</>
					);
				})}
				<br />
				{!isViewLoan && (
					<Button
						name='Get Other Bank Statements'
						onClick={onOtherStatementModalToggle}
					/>
				)}
				<UI.CheckboxWrapper>
					<CheckBox
						name={
							corporateDetails && corporateDetails.id ? (
								<span>
									{textForCheckbox.grantCibilAcces.replace('CIBIL', 'Bureau')}
								</span>
							) : (
								<span>{textForCheckbox.grantCibilAcces}</span>
							)
						}
						checked={cibilCheckbox}
						disabled={cibilCheckbox || isViewLoan}
						onChange={() => {
							setCibilCheckbox(!cibilCheckbox);
							//setCibilCheckModal(true);
						}}
						bg='blue'
					/>
					<CheckBox
						name={
							productDetails.termsandconditionsurl ? (
								<>
									<span>{textForCheckbox.declaration}</span>
									<span>{aTag}</span>
									<span>{textForCheckbox.declaration2}</span>
								</>
							) : (
								<span>{textForCheckbox.defaultDeclaration}</span>
							)
						}
						checked={declareCheck}
						disabled={isViewLoan}
						onChange={() => setDeclareCheck(!declareCheck)}
						bg='blue'
					/>
				</UI.CheckboxWrapper>
				<UI.SubmitWrapper>
					{isViewLoan ? null : productDetails.otp_authentication ? (
						<Button
							name='Submit'
							fill
							style={{
								width: '200px',
								background: 'blue',
							}}
							isLoader={caseCreationProgress}
							disabled={caseCreationProgress || buttonDisabledStatus()}
							onClick={!caseCreationProgress && onSubmitOtpAuthentication}
						/>
					) : (
						<Button
							name='Submit'
							fill
							style={{
								width: '200px',
								background: 'blue',
							}}
							isLoader={caseCreationProgress}
							disabled={caseCreationProgress || buttonDisabledStatus()}
							onClick={!caseCreationProgress && onSubmitCompleteApplication}
						/>
					)}
				</UI.SubmitWrapper>
				{otherBankStatementModal && (
					<BankStatementModal
						showModal={otherBankStatementModal}
						onClose={onOtherStatementModalToggle}
					/>
				)}
			</UI.Colom1>
		</>
	);
};

export default DocumentUpload;
