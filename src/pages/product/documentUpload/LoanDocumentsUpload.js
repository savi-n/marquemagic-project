// active page
/* This file contains document upload section i.e visibility of documents, tags etc*/

// IMPORTANT RULES
// applicant id
// app_[business_income_type_id]_[category]_[doc_type_id]
// co_[director_id]_[business_income_type_id]_[category]_[doc_type_id]

import { useContext, useEffect, Fragment } from 'react';
import { useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { EXTRACTION_KEYS } from 'pages/product/panverification/const';
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
	CO_APPLICANTS_DOCTYPES_FETCH,
	HOSTNAME,
	APP_DOCTYPE_LIST_REQ_BODY,
	APP_DOCTYPE_LIST_RESPONSE,
	CO_APP_CREATE_RESPONSE,
	CO_APP_DOCTYPE_LIST_REQ_BODY,
	CO_APP_DOCTYPE_LIST_RESPONSE,
} from '_config/app.config';
import { BussinesContext } from 'reducer/bussinessReducer';
import { FlowContext } from 'reducer/flowReducer';
import { FormContext } from 'reducer/formReducer';
import { AppContext } from 'reducer/appReducer';
import { CaseContext } from 'reducer/caseReducer';
import { useToasts } from 'components/Toast/ToastProvider';
import useFetch from 'hooks/useFetch';

import * as UI from './ui';
import * as CONST from './const';
import { asyncForEach } from 'utils/helper';
import downArray from 'assets/icons/down_arrow_grey_icon.png';
import { getFlowData } from 'utils/localStore';

const DocumentUpload = props => {
	const { productDetails, userType, id, onFlowChange, map, productId } = props;
	//console.log('productDetails from document upload', props);
	const aTag = (
		<a
			href={productDetails?.termsandconditionsurl}
			rel='noreferrer'
			target={'_blank'}
			style={{ color: 'blue' }}
		>
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
		state: documentState,
		actions: { setLoanDocuments, removeLoanDocument, setLoanDocumentType },
	} = useContext(LoanFormContext);
	const uploadedDocuments = documentState?.documents || [];

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const {
		state: { flowMap },
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setFlowData },
	} = useContext(FormContext);

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
	const [, setIsVerifyWithOtpDisabled] = useState(false);
	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const [caseCreationProgress, setCaseCreationProgress] = useState(false);
	const [generateOtpTimer, setGenerateOtpTimer] = useState(0);
	const onOtherStatementModalToggle = () => {
		setOtherBankStatementModal(!otherBankStatementModal);
	};
	const [openSection, setOpenSection] = useState([CONST.CATEGORY_KYC]);
	const [loading, setLoading] = useState(false);
	const [allDocumentTypeList, setAllDocumentTypeList] = useState([]);
	const [allTagUnTagDocList, setAllTagUnTagDocList] = useState([]);
	const [prefilledDocs, setPrefilledDocs] = useState([]);
	const applicationState = JSON.parse(sessionStorage.getItem(HOSTNAME));
	const formReducer = applicationState?.formReducer;
	const userReducer = applicationState?.userReducer;
	const companyData =
		sessionStorage.getItem('companyData') &&
		JSON.parse(sessionStorage.getItem('companyData'));
	const editLoanData = JSON.parse(sessionStorage.getItem('editLoan'));
	const isViewLoan = !editLoanData ? false : !editLoanData?.isEditLoan;
	const isEditLoan = !editLoanData ? false : editLoanData?.isEditLoan;
	const editLoanCoApplicants =
		editLoanData?.director_details?.filter(
			d => d?.type_name?.toLowerCase() === 'co-applicant'
		) || [];
	const API_TOKEN = sessionStorage.getItem('userToken');
	const product_id = sessionStorage.getItem('productId');
	let corporateDetails = sessionStorage.getItem('corporateDetails');
	if (corporateDetails) corporateDetails = JSON.parse(corporateDetails);
	let applicantData = formReducer?.user?.applicantData;
	let business_income_type_id =
		applicantData?.incomeType ||
		documentState['business-details']?.BusinessType ||
		companyData?.BusinessType ||
		editLoanData?.business_id?.businesstype ||
		'';
	if (editLoanData) {
		const editApplicant =
			editLoanData?.director_details?.filter(d => d?.isApplicant)?.[0] || {};
		applicantData = {
			...applicantData,
			incomeType: editApplicant?.income_type || '',
			mobileNo: editApplicant?.dcontact || '',
			firstName: editApplicant?.dfirstname || '',
			lastName: editApplicant?.dlastname || '',
		};
		business_income_type_id = editLoanData?.business_id?.businesstype;
	}

	// const coApplicants = formReducer?.user?.[CO_APP_CREATE_RESPONSE]
	// 	? formReducer?.user?.[CO_APP_CREATE_RESPONSE]
	// 	: editLoanCoApplicants;
	const sessionCoApplicantRes =
		formReducer?.user?.[CO_APP_CREATE_RESPONSE].length > 0
			? formReducer?.user?.[CO_APP_CREATE_RESPONSE]
			: editLoanCoApplicants || [];
	const getEncryptWhiteLabel = async () => {
		try {
			if (!sessionStorage.getItem('encryptWhiteLabel')) {
				const encryptWhiteLabelReq = await newRequest(
					WHITELABEL_ENCRYPTION_API,
					{
						method: 'GET',
					},
					{
						Authorization: `Bearer ${API_TOKEN}`,
					}
				);
				const encryptWhiteLabelRes = encryptWhiteLabelReq.data;
				sessionStorage.setItem(
					'encryptWhiteLabel',
					encryptWhiteLabelRes.encrypted_whitelabel[0]
				);
			}
		} catch (error) {
			console.error('error-getEncryptWhiteLabel', error);
		}
	};

	const getApplicantDocumentTypes = async () => {
		try {
			const reqBody = {
				business_type: business_income_type_id,
				loan_product:
					productId[business_income_type_id] ||
					productId[(applicantData?.incomeType)] ||
					productId[idType],
			};
			const UID_REQ_ID = `${APP_DOCTYPE_LIST_REQ_BODY}-${
				reqBody.business_type
			}-${reqBody.loan_product}`;
			const UID_RES_ID = `${APP_DOCTYPE_LIST_RESPONSE}-${
				reqBody.business_type
			}-${reqBody.loan_product}`;
			const oldReqBody = await getFlowData(UID_REQ_ID);
			let applicantDocRes = {};
			if (!_.isEqual(oldReqBody, reqBody)) {
				applicantDocRes = await axios.post(DOCTYPES_FETCH, reqBody, {
					headers: {
						Authorization: `Bearer ${API_TOKEN}`,
					},
				});
				setFlowData(reqBody, UID_REQ_ID);
				setFlowData(applicantDocRes, UID_RES_ID);
			} else {
				applicantDocRes = await getFlowData(UID_RES_ID);
			}
			// console.log('applicantDocRes-', applicantDocRes);
			const newAppDocOptions = [];
			for (const key in applicantDocRes?.data) {
				applicantDocRes?.data[key].map(d => {
					let category = '';
					if (d?.doc_type?.toLowerCase()?.includes(CONST.CATEGORY_KYC))
						category = CONST.CATEGORY_KYC;
					if (d?.doc_type?.toLowerCase()?.includes(CONST.CATEGORY_FINANCIAL))
						category = CONST.CATEGORY_FINANCIAL;
					if (d?.doc_type?.toLowerCase()?.includes(CONST.CATEGORY_OTHER))
						category = CONST.CATEGORY_OTHER;
					newAppDocOptions.push({
						...d,
						value: d.doc_type_id,
						name: d.name,
						doc_type_id: `app_${business_income_type_id}_${category}_${
							d.doc_type_id
						}`,
						main: category,
						mainType: category,
						category,
					});
					return null;
				});
			}
			return newAppDocOptions;
		} catch (error) {
			console.error('error-getApplicantDocumentTypes-', error);
			return [];
		}
	};

	const getCoApplicantDocumentTypes = async coApplicant => {
		try {
			if (sessionCoApplicantRes.length > 0) {
				// http://3.108.54.252:1337/coApplicantDocList?income_type=1
				const UID_REQ_ID = `${CO_APP_DOCTYPE_LIST_REQ_BODY}-${
					coApplicant?.income_type
				}`;
				const UID_RES_ID = `${CO_APP_DOCTYPE_LIST_RESPONSE}-${
					coApplicant?.income_type
				}`;
				const oldReqBody = await getFlowData(UID_REQ_ID);
				let coAppDocTypesRes = {};
				if (!_.isEqual(oldReqBody, UID_REQ_ID)) {
					coAppDocTypesRes = await axios.get(
						`${CO_APPLICANTS_DOCTYPES_FETCH}?income_type=${
							coApplicant?.income_type
						}`,
						{
							headers: {
								Authorization: `Bearer ${API_TOKEN}`,
							},
						}
					);
					coAppDocTypesRes = coAppDocTypesRes?.data?.data;
					setFlowData(UID_REQ_ID, UID_REQ_ID);
					setFlowData(coAppDocTypesRes, UID_RES_ID);
				} else {
					coAppDocTypesRes = await getFlowData(UID_RES_ID);
				}
				// console.log('coAppDocTypesRes-', coAppDocTypesRes);
				// coApplicant
				// const newIncomeTypeDocTypeList = {};
				const newDocTypeList = [];
				for (const key in coAppDocTypesRes) {
					// console.log('coAppDocTypesRes?.data?.data-', { key });
					// newIncomeTypeDocTypeList[key] = [];
					coAppDocTypesRes[key]?.map(d => {
						let category = '';
						if (d?.doc_type?.toLowerCase()?.includes(CONST.CATEGORY_KYC))
							category = CONST.CATEGORY_KYC;
						if (d?.doc_type?.toLowerCase()?.includes(CONST.CATEGORY_FINANCIAL))
							category = CONST.CATEGORY_FINANCIAL;
						if (d?.doc_type?.toLowerCase()?.includes(CONST.CATEGORY_OTHER))
							category = CONST.CATEGORY_OTHER;
						const newDoc = {
							...d,
							doc_type_id: `co_${coApplicant?.id}_${
								coApplicant?.income_type
							}_${category}_${d?.id}`,
							director_id: coApplicant?.id,
							type_name: coApplicant?.type_name,
							value: d?.id,
							main: category,
							mainType: category,
							category,
						};
						newDocTypeList.push(newDoc);
						// newIncomeTypeDocTypeList[key].push(newDoc);
						return null;
					});
				}
				return newDocTypeList;
				// return { newIncomeTypeDocTypeList, newDocTypeList };
			}
		} catch (error) {
			console.error('error-getCoApplicantDocumentTypes-', error);
			return [];
		}
	};

	const handleFileUpload = async (files, meta = {}) => {
		const newFiles = [];
		files.map(f => newFiles.push({ ...f, ...meta }));
		setLoanDocuments(newFiles);
	};
	const removeFileFromSessionStorage = file => {
		let cloneEditLoan = _.cloneDeep(editLoanData);
		let filteredFileData = editLoanData.loan_document.filter(
			doc => doc.id !== file.doc_id
		);
		cloneEditLoan.loan_document = filteredFileData;
		sessionStorage.removeItem('editLoan');
		sessionStorage.setItem('editLoan', JSON.stringify(cloneEditLoan));
	};
	const handleFileRemove = async (fileId, file) => {
		// console.log('handleFileRemove-', {
		// 	allTagUnTagDocList,
		// 	fileId,
		// 	file: file.doc_id,
		// 	prefilledDocs,
		// });
		removeLoanDocument(fileId, file);
		if (isEditLoan) {
			removeFileFromSessionStorage(file);
		}
	};

	const handleDocumentTypeChange = async (fileId, type) => {
		// console.log('handleDocumentTypeChange-', { fileId, type });
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
			let uploaddedDoc = uploadedDocuments.filter(doc => {
				if (!doc.requestId) return doc;
				return null;
			});
			const reqBody = CONST.generateCaseCreationReqBody(
				{
					...documentState,
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
			// -- Test area

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
				// console.log('LoanDocumentsUpload-UPLOAD_CACHE_DOCS-state', state);
				const uploadCacheDocsArr = [];
				allTagUnTagDocList.map(doc => {
					// filtering pre application journey documents
					if (doc.requestId && doc.typeId) {
						const ele = {
							request_id: doc.requestId,
							doc_type_id: doc.typeId,
							deleteDocument: EXTRACTION_KEYS?.includes(doc.req_type)
								? true
								: false,
						};
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
		const reqBody = CONST.subsidiaryDataFormat(
			caseId,
			documentState,
			editLoanData
		);
		// console.log('subsidary 23 ', state);
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
		const formData = CONST.bankDetailsDataFormat(
			caseId,
			documentState,
			editLoanData
		);
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
			documentState,
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
		const formData = CONST.refereneceDataFormat(
			loanId,
			documentState,
			editLoanData
		);
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
		let isDocTypeUnTagged = false;
		uploadedDocuments?.map(ele => {
			// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
			if (ele.req_type) return null;
			if (!ele.typeId) {
				isDocTypeUnTagged = true;
				return false;
			}
			return null;
		});

		if (isDocTypeUnTagged) {
			addToast({
				message: 'Please select the document type',
				type: 'error',
			});
			return false;
		}
		// const allDocOptions = [
		// 	...KycDocOptions,
		// 	...FinancialDocOptions,
		// 	...OtherDocOptions,
		// ];
		let manadatoryError = false;
		const allMandatoryDocumentIds = [];
		allDocumentTypeList.map(
			d => d.isMandatory && allMandatoryDocumentIds.push(d.doc_type_id)
		);
		const uploadedDocumetnIds = [];
		// [...uploadedDocuments, ...prefilledDocs]?.map(d =>
		[...allTagUnTagDocList, ...prefilledDocs]?.map(d =>
			uploadedDocumetnIds.push(d.doc_type_id)
		);

		if (productDetails.document_mandatory) {
			allMandatoryDocumentIds.map(docId => {
				if (!uploadedDocumetnIds.includes(docId)) {
					manadatoryError = true;
					// console.log('doc-pending-for-upload-', {
					// 	docId,
					// 	allMandatoryDocumentIds,
					// 	uploadedDocuments,
					// 	prefilledDocs,
					// });
					return null;
				}
				return null;
			});
		}
		// console.log('LoanDocumentsUpload-isFormValid-', {
		// 	allMandatoryDocumentIds,
		// 	uploadedDocumetnIds,
		// 	manadatoryError,
		// });
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

	const onSubmitOtpAuthentication = async () => {
		try {
			if (buttonDisabledStatus()) return;
			if (!isFormValid()) return;
			setCaseCreationProgress(true);
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
			setIsAuthenticationOtpModalOpen(true);
			setCaseCreationProgress(false);
		} catch (error) {
			setCaseCreationProgress(false);
			if (error?.response?.data?.timer) {
				setIsAuthenticationOtpModalOpen(true);
				setGenerateOtpTimer(error?.response?.data?.timer || 0);
			}
			console.error(error);
			addToast({
				message:
					error?.response?.data?.message || 'Server down, try after sometimes',
				type: 'error',
			});
		}
	};

	const onSubmitCompleteApplication = async () => {
		if (buttonDisabledStatus()) return;
		if (!isFormValid()) return;
		setCaseCreationProgress(true);
		// Before Case Creation Testing Area Do not push this code
		// const refReqBody = refereneceDataFormat('CA01000000', state);
		// console.log('onSubmitCompleteApplication-', { refReqBody });
		// setLoading(false);
		// return;
		// -- Before Case Creation Testing Area Do not push this code

		if (!userType) {
			const loanReq = await caseCreationSteps(documentState);

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

	const toggleOpenSection = sectionId => {
		// console.log('toggleOpenSection-', sectionId);
		if (openSection.includes(sectionId)) {
			setOpenSection(openSection.filter(s => s !== sectionId));
			return;
		}
		setOpenSection([...openSection, sectionId]);
	};

	const initializeTaggUnTagDocuments = () => {
		// prefill document tagged and un-tagged
		// console.log('initializeTaggUnTagDocuments');

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

		const JSON_HOMELOAN_SECTION = flowMap?.['home-loan-details']?.fields || [];
		for (const key in JSON_HOMELOAN_SECTION) {
			JSON_HOMELOAN_SECTION[key]?.data?.map(d => {
				if (d.doc_type && d.doc_type[`${business_income_type_id}`]) {
					flowDocTypeMappingList[`property`] =
						d.doc_type[`${business_income_type_id}`];
				}
				return null;
			});
		}

		const newAllTagUnTagDocList = [];
		[...uploadedDocuments, ...prefilledDocs]?.map((doc, docIndex) => {
			let doc_type_id = doc.doc_type_id;
			// `app_${business_income_type_id}_${CATEGORY}_${editDoc?.doctype}`
			// if (!doc.typeId) {

			// this solution is not solid for tagging preuploaded document in docupload page
			// work on this when new requirement comes
			let isKYCDocs = false;
			if (doc.requestId || doc.req_type === 'property') {
				doc_type_id = `app_${business_income_type_id}_${doc.category}_${
					flowDocTypeMappingList?.[`${doc?.req_type}`]
				}`;
				isKYCDocs = true;
			}
			const newDoc = {
				..._.cloneDeep(doc),
				name: doc.upload_doc_name || doc.name,
				progress: '100',
				status: 'completed',
				file: null,
				typeId: doc.typeId || flowDocTypeMappingList[`${doc.req_type}`] || '',
				doc_type_id,
			};
			if (doc.isViewEdit) {
				newDoc.typeId = doc.doctype;
			}
			if (isKYCDocs) {
				newDoc.isMandatory = true;
			}
			// newDoc.doc_type_id = 'app_7_kyc_31';
			// if (newDoc.typeId) state.documents[docIndex].typeId = newDoc.typeId;
			newAllTagUnTagDocList.push(newDoc);
			return null;
		});
		// -- prefill document tagged and un-tagged

		// console.log('initializeComponent-allstates-', {
		// 	uploadedDocuments,
		// 	flowDocTypeMappingList,
		// 	newAllTagUnTagDocList,
		// 	allDocumentTypeList,
		// });

		setAllTagUnTagDocList(newAllTagUnTagDocList);
	};
	const initializeDocTypeList = async () => {
		try {
			// console.log('initializeDocTypeList');
			setLoading(true);
			const newAllDocumentTypeList = [];
			await getEncryptWhiteLabel();
			// get applicant document list
			const newAppDocOptions = await getApplicantDocumentTypes();
			// -- get applicant document list

			// get co-applicant document list for all income types
			const newCoDocOptions = [];
			// const allCoAppIncomeTypeDocList = {};
			await asyncForEach(sessionCoApplicantRes, async coApplicant => {
				// console.log('coapplicant-', coApplicant);
				// if (`${coApplicant?.income_type}` in allCoAppIncomeTypeDocList) return;
				// if (allCoAppIncomeTypes.includes(coApplicant?.income_type)) return;
				// const { newIncomeTypeDocTypeList, newDocTypeList } = await getCoApplicantDocumentTypes(coApplicant);
				const tempDocTypeList = await getCoApplicantDocumentTypes(coApplicant);
				// allCoAppIncomeTypeDocList[coApplicant.income_type] = tempDocTypeList;
				// coAppIncomeTypeDocList.push({ ...d });
				// income_type ids to track and avoid duplicate api call
				// allCoAppIncomeTypes.push(coApplicant?.income_type);
				// newCoDocOptions.push()
				tempDocTypeList.map(d => newCoDocOptions.push(d));
			});
			// sessionCoApplicantRes.map(coApplicant => {
			// 	allCoAppIncomeTypeDocList[coApplicant.income_type].map(doc => {
			// 		const co_id_income_type_kyc = `co_${coApplicant?.id}_${
			// 			coApplicant?.income_type
			// 		}_${CONST.CATEGORY_KYC}`;
			// 		newCoDocOptions.push({ ...doc, doc_type_id });
			// 		return null;
			// 	});
			// 	return null;
			// });
			// tempDocTypeList.map(d => newCoDocOptions.push({ ...d }));
			// -- get co-applicant document list

			newAppDocOptions.map(d => newAllDocumentTypeList.push({ ...d }));
			newCoDocOptions.map(d => newAllDocumentTypeList.push({ ...d }));
			setAllDocumentTypeList(
				newAllDocumentTypeList.sort((a, b) => a.id - b.id)
			);

			if (editLoanData && editLoanData?.loan_document?.length > 0) {
				// const editApplicant = editLoanData?.director_details?.filter(
				// 	d => d.isApplicant
				// )?.[0];
				const newPrefilledDos = [];
				editLoanData?.loan_document?.map(editDoc => {
					if (editDoc.status !== 'active') return null;

					const isApplicant = !editDoc.directorId;
					const editCoApplicant = editLoanData?.director_details?.filter(
						d => d?.id === editDoc.directorId
					)?.[0];

					const selectedDocType = isApplicant
						? newAppDocOptions.filter(doc => doc.id === editDoc.doctype)?.[0] ||
						  {}
						: newCoDocOptions.filter(doc => doc.id === editDoc.doctype)?.[0] ||
						  {};
					// console.log('selectedDocType-', selectedDocType);
					let CATEGORY = '';
					if (
						selectedDocType?.doc_type
							?.toLowerCase()
							?.includes(CONST.CATEGORY_KYC)
					)
						CATEGORY = CONST.CATEGORY_KYC;
					if (
						selectedDocType?.doc_type
							?.toLowerCase()
							?.includes(CONST.CATEGORY_FINANCIAL)
					)
						CATEGORY = CONST.CATEGORY_FINANCIAL;
					if (
						selectedDocType?.doc_type
							?.toLowerCase()
							?.includes(CONST.CATEGORY_OTHER)
					)
						CATEGORY = CONST.CATEGORY_OTHER;

					// app_[business_income_type_id]_[category]_[doc_type_id]
					// co_[director_id]_[coapp_income_type]_[category]_[doc_type_id]
					let doc_type_id = isApplicant
						? `app_${business_income_type_id}_${CATEGORY}_${editDoc?.doctype}`
						: `co_${editDoc.directorId}_${
								editCoApplicant?.income_type
						  }_${CATEGORY}_${editDoc?.doctype}`;
					const docId = editDoc?.id;
					newPrefilledDos.push({
						...selectedDocType,
						...editDoc,
						doc_type_id,
						name:
							editDoc?.uploaded_doc_name ||
							editDoc?.original_doc_name ||
							editDoc?.doc_name, // displaying doc name
						isViewEdit: true, // for not passing this in any edit api
						doc_id: docId, // for removing document from be
						id: editDoc?.doctype, // overwritting with doc_id cause id is used many place in creation
						category: CATEGORY, // for prefetching
						document_key: editDoc?.doc_name, // for loading view doc
					});
					return null;
				});
				// console.log('newPrefilledDos-', { newPrefilledDos });
				setPrefilledDocs(newPrefilledDos);
				// reSetLoanDocuments(editLoanList);
			}
			setLoading(false);
		} catch (error) {
			console.error('error-initializeComponent-', error);
			setLoading(false);
		}
	};

	useEffect(() => {
		initializeDocTypeList();
		initializeTaggUnTagDocuments();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (uploadedDocuments?.length > 0 || prefilledDocs?.length > 0) {
			initializeTaggUnTagDocuments();
		}
		// eslint-disable-next-line
	}, [uploadedDocuments, prefilledDocs]);

	// app_[business_income_type_id]_[category]_[doc_type_id]
	// co_[director_id]_[business_income_type_id]_[category]_[doc_type_id]
	const appKycDocList = allDocumentTypeList.filter(
		d => d?.doc_type_id?.includes('app_') && d?.category === CONST.CATEGORY_KYC
	);
	const appFinDocList = allDocumentTypeList.filter(
		d =>
			d?.doc_type_id?.includes('app_') &&
			d?.category === CONST.CATEGORY_FINANCIAL
	);
	const appOtherDocList = allDocumentTypeList.filter(
		d =>
			d?.doc_type_id?.includes('app_') && d?.category === CONST.CATEGORY_OTHER
	);

	const appLenderDocList = [];
	const appEvalDocList = [];
	const preFillLenderDocsTag = [];
	const preFillEvalDocsTag = [];
	if (isViewLoan) {
		editLoanData?.lender_document?.map(lenderDoc => {
			const docListItem = lenderDoc?.doc_type;
			const priority = docListItem?.priority;
			const doctype = docListItem?.id;
			const name =
				lenderDoc?.uploaded_doc_name ||
				lenderDoc?.original_doc_name ||
				lenderDoc?.doc_name;
			const document_key = lenderDoc?.doc_name;
			if (priority === '300') {
				const doc_type_id = `app_${business_income_type_id}_${
					CONST.CATEGORY_LENDER
				}_${doctype}`;
				const category = CONST.CATEGORY_LENDER;
				if (appLenderDocList?.filter(d => d?.id === doctype)?.length <= 0) {
					appLenderDocList.push({
						...docListItem,
						doc_type_id,
						category,
					});
				}
				preFillLenderDocsTag.push({
					...lenderDoc,
					doctype,
					typeId: doctype,
					doc_type_id,
					category,
					name,
					document_key,
				});
				return null;
			}
			if (priority === '3') {
				const doc_type_id = `app_${business_income_type_id}_${
					CONST.CATEGORY_EVAL
				}_${doctype}`;
				const category = CONST.CATEGORY_EVAL;
				if (appEvalDocList?.filter(d => d?.id === doctype)?.length <= 0) {
					appEvalDocList.push({
						...docListItem,
						doc_type_id,
						category,
					});
				}
				preFillEvalDocsTag.push({
					...lenderDoc,
					doctype,
					typeId: doctype,
					doc_type_id,
					category,
					name,
					document_key,
				});
				return null;
			}
			return null;
		});
	}

	// view / edit loan prefilling docs
	// const preFillKycDocsViewEdit = prefilledDocs.filter(d =>
	// 	d?.doc_type_id.includes(
	// 		`app_${business_income_type_id}_${CONST.CATEGORY_KYC}`
	// 	)
	// );
	// const preFillFinDocsViewEdit = prefilledDocs.filter(d =>
	// 	d?.doc_type_id.includes(
	// 		`app_${business_income_type_id}_${CONST.CATEGORY_FINANCIAL}`
	// 	)
	// );
	// const preFillOtherDocsViewEdit = prefilledDocs.filter(d =>
	// 	d?.doc_type_id.includes(
	// 		`app_${business_income_type_id}_${CONST.CATEGORY_OTHER}`
	// 	)
	// );

	const preFillKycDocsTag = allTagUnTagDocList.filter(
		d =>
			d?.doc_type_id?.includes('app_') &&
			d?.category === CONST.CATEGORY_KYC &&
			!!d.typeId
	);

	const preFillKycDocsUnTag = allTagUnTagDocList.filter(
		d =>
			d?.doc_type_id?.includes('app_') &&
			d?.category === CONST.CATEGORY_KYC &&
			!d.typeId
	);

	const preFillFinDocsTag = allTagUnTagDocList.filter(
		d =>
			d?.doc_type_id?.includes('app_') &&
			d?.category === CONST.CATEGORY_FINANCIAL &&
			!!d.typeId
	);
	const preFillFinDocsUnTag = allTagUnTagDocList.filter(
		d =>
			d?.doc_type_id?.includes('app_') &&
			d?.category === CONST.CATEGORY_FINANCIAL &&
			!d.typeId
	);

	const preFillOtherDocsTag = allTagUnTagDocList.filter(
		d =>
			d?.doc_type_id?.includes('app_') &&
			d?.category === CONST.CATEGORY_OTHER &&
			!!d.typeId
	);
	const preFillOtherDocsUnTag = allTagUnTagDocList.filter(
		d =>
			d?.doc_type_id?.includes('app_') &&
			d?.category === CONST.CATEGORY_OTHER &&
			!d.typeId
	);

	const totalMandatoryDocumentCount = allDocumentTypeList.filter(
		d => !!d.isMandatory
	)?.length;

	const mendatoryDocIdTracker = [];
	[...allTagUnTagDocList, ...prefilledDocs]?.map(d => {
		if (mendatoryDocIdTracker.includes(d.doc_type_id)) return null;
		if (!!d.isMandatory) {
			mendatoryDocIdTracker.push(d.doc_type_id);
		}
		return null;
	});
	const totalMandatoryUploadedDocumentCount = mendatoryDocIdTracker.length;

	let applicantFullName = '';
	if (applicantData?.firstName) applicantFullName += applicantData?.firstName;
	if (applicantData?.dlastname)
		applicantFullName += ` ${applicantData?.lastName}`;

	let displayProceedButton = null;
	if (productDetails.otp_authentication && !isEditLoan) {
		displayProceedButton = (
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
		);
	} else {
		displayProceedButton = (
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
		);
	}
	if (isViewLoan) {
		displayProceedButton = null;
	}

	// console.log('loandocupload-allstates-', {
	// 	uploadedDocuments,
	// 	prefilledDocs,
	// 	allTagUnTagDocList,
	// 	preFillKycDocsTag,
	// 	preFillKycDocsUnTag,
	// 	totalMandatoryDocumentCount,
	// 	totalMandatoryUploadedDocumentCount,
	// 	appLenderDocList,
	// 	appEvalDocList,
	// 	preFillLenderDocsTag,
	// 	preFillEvalDocsTag,
	// });

	if (loading) {
		return (
			<UI.LoaderWrapper>
				<Loading />
			</UI.LoaderWrapper>
		);
	}
	// don't delete-unusuall error on useeffect conditional rendering
	if (loading) return <></>;

	return (
		<>
			{isAuthenticationOtpModalOpen && (
				<AuthenticationOtpModal
					isAuthenticationOtpModalOpen={isAuthenticationOtpModalOpen}
					setIsAuthenticationOtpModalOpen={setIsAuthenticationOtpModalOpen}
					setContactNo={applicantData?.mobileNo || companyData?.mobileNo}
					setIsVerifyWithOtpDisabled={setIsVerifyWithOtpDisabled}
					onSubmitCompleteApplication={onSubmitCompleteApplication}
					generateOtpTimer={generateOtpTimer}
				/>
			)}
			<UI.Colom1>
				{totalMandatoryDocumentCount > 0 && (
					<UI.Section
						style={{ marginBottom: 20, borderBottom: '3px solid #eee' }}
					>
						<UI.H1>
							<span style={{ color: 'red' }}>*</span> Mandatory
						</UI.H1>
						<div
							style={{
								marginLeft: 10,
								alignItems: 'center',
								display: 'flex',
							}}
						>
							Document Submitted :
							<UI.StyledButton width={'auto'} fillColor>
								{totalMandatoryUploadedDocumentCount} of{' '}
								{totalMandatoryDocumentCount}
							</UI.StyledButton>
						</div>
					</UI.Section>
				)}
				<UI.H>
					<span>Applicant Document Upload</span>
					<UI.CoAppName>
						{applicantFullName || companyData?.BusinessName || ''}
					</UI.CoAppName>
				</UI.H>

				{/* APPLICANT SECTION */}
				{appKycDocList.length > 0 && (
					<>
						{' '}
						<UI.Section onClick={() => toggleOpenSection(CONST.CATEGORY_KYC)}>
							<UI.H1>KYC </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									display: 'flex',
								}}
							>
								Document Submitted :
								<UI.StyledButton width={'auto'} fillColor>
									{preFillKycDocsTag.length} of {appKycDocList.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openSection.includes(CONST.CATEGORY_KYC)
										? `rotate(180deg)`
										: `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openSection.includes(CONST.CATEGORY_KYC)}>
							<UI.UploadWrapper open={openSection.includes(CONST.CATEGORY_KYC)}>
								<FileUpload
									prefilledDocs={prefilledDocs}
									setPrefilledDocs={setPrefilledDocs}
									startingTaggedDocs={preFillKycDocsTag}
									startingUnTaggedDocs={preFillKycDocsUnTag}
									sectionType='kyc'
									section={'document-upload'}
									onDrop={files =>
										handleFileUpload(files, {
											doc_type_id: 'app_',
											category: CONST.CATEGORY_KYC,
										})
									}
									onRemoveFile={handleFileRemove}
									docTypeOptions={appKycDocList}
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
				{appFinDocList.length > 0 && (
					<>
						<UI.Section
							onClick={() => toggleOpenSection(CONST.CATEGORY_FINANCIAL)}
						>
							<UI.H1>Financial </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}
							>
								Document Submitted :
								<UI.StyledButton width={'auto'} fillColor>
									{preFillFinDocsTag.length} of {appFinDocList.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openSection.includes(CONST.CATEGORY_FINANCIAL)
										? `rotate(180deg)`
										: `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openSection.includes(CONST.CATEGORY_FINANCIAL)}>
							<UI.UploadWrapper
								open={openSection.includes(CONST.CATEGORY_FINANCIAL)}
							>
								<FileUpload
									prefilledDocs={prefilledDocs}
									setPrefilledDocs={setPrefilledDocs}
									startingTaggedDocs={preFillFinDocsTag}
									startingUnTaggedDocs={preFillFinDocsUnTag}
									sectionType='financial'
									section={'document-upload'}
									onDrop={files =>
										handleFileUpload(files, {
											doc_type_id: 'app_',
											category: CONST.CATEGORY_FINANCIAL,
										})
									}
									onRemoveFile={handleFileRemove}
									docTypeOptions={appFinDocList}
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
				{appOtherDocList.length > 0 && (
					<>
						<UI.Section onClick={() => toggleOpenSection(CONST.CATEGORY_OTHER)}>
							<UI.H1>Others </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}
							>
								Document Submitted :
								<UI.StyledButton width={'auto'} fillColor>
									{preFillOtherDocsTag.length} of {appOtherDocList.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openSection.includes(CONST.CATEGORY_OTHER)
										? `rotate(180deg)`
										: `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openSection.includes(CONST.CATEGORY_OTHER)}>
							<UI.UploadWrapper
								open={openSection.includes(CONST.CATEGORY_OTHER)}
							>
								<FileUpload
									prefilledDocs={prefilledDocs}
									setPrefilledDocs={setPrefilledDocs}
									startingTaggedDocs={preFillOtherDocsTag}
									startingUnTaggedDocs={preFillOtherDocsUnTag}
									sectionType='others'
									section={'document-upload'}
									onDrop={files =>
										handleFileUpload(files, {
											doc_type_id: 'app_',
											category: CONST.CATEGORY_OTHER,
										})
									}
									onRemoveFile={handleFileRemove}
									docTypeOptions={appOtherDocList}
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
				{appLenderDocList.length > 0 && (
					<>
						<UI.Section
							onClick={() => toggleOpenSection(CONST.CATEGORY_LENDER)}
						>
							<UI.H1>Lender </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}
							>
								Document Submitted :
								<UI.StyledButton width={'auto'} fillColor>
									{appLenderDocList.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openSection.includes(CONST.CATEGORY_LENDER)
										? `rotate(180deg)`
										: `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openSection.includes(CONST.CATEGORY_LENDER)}>
							<UI.UploadWrapper
								open={openSection.includes(CONST.CATEGORY_LENDER)}
							>
								<FileUpload
									prefilledDocs={prefilledDocs}
									setPrefilledDocs={setPrefilledDocs}
									startingTaggedDocs={preFillLenderDocsTag}
									startingUnTaggedDocs={[]}
									sectionType='lender'
									section={'document-upload'}
									onDrop={files =>
										handleFileUpload(files, {
											doc_type_id: 'app_',
											category: CONST.CATEGORY_LENDER,
										})
									}
									onRemoveFile={handleFileRemove}
									docTypeOptions={appLenderDocList}
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
				{appEvalDocList.length > 0 && (
					<>
						<UI.Section onClick={() => toggleOpenSection(CONST.CATEGORY_EVAL)}>
							<UI.H1>Evaluation </UI.H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}
							>
								Document Submitted :
								<UI.StyledButton width={'auto'} fillColor>
									{appEvalDocList.length}
								</UI.StyledButton>
							</div>
							<UI.CollapseIcon
								src={downArray}
								style={{
									transform: openSection.includes(CONST.CATEGORY_EVAL)
										? `rotate(180deg)`
										: `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</UI.Section>
						<UI.Details open={openSection.includes(CONST.CATEGORY_EVAL)}>
							<UI.UploadWrapper
								open={openSection.includes(CONST.CATEGORY_EVAL)}
							>
								<FileUpload
									prefilledDocs={prefilledDocs}
									setPrefilledDocs={setPrefilledDocs}
									startingTaggedDocs={preFillEvalDocsTag}
									startingUnTaggedDocs={[]}
									sectionType='lender'
									section={'document-upload'}
									onDrop={files =>
										handleFileUpload(files, {
											doc_type_id: 'app_',
											category: CONST.CATEGORY_LENDER,
										})
									}
									onRemoveFile={handleFileRemove}
									docTypeOptions={appEvalDocList}
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
				{/* -- APPLICANT SECTION */}

				{/* CO-APPLICANT SECTION */}
				{sessionCoApplicantRes.map((coApplicant, index) => {
					const co_id_income_type_kyc = `co_${coApplicant?.id}_${
						coApplicant?.income_type
					}_${CONST.CATEGORY_KYC}`;

					const co_id_income_type_financial = `co_${coApplicant?.id}_${
						coApplicant?.income_type
					}_${CONST.CATEGORY_FINANCIAL}`;

					const co_id_income_type_other = `co_${coApplicant?.id}_${
						coApplicant?.income_type
					}_${CONST.CATEGORY_OTHER}`;

					const coAppKycDocList = allDocumentTypeList.filter(d =>
						d.doc_type_id.includes(co_id_income_type_kyc)
					);
					const coAppFinDocList = allDocumentTypeList.filter(d =>
						d.doc_type_id.includes(co_id_income_type_financial)
					);
					const coAppOtherDocList = allDocumentTypeList.filter(d =>
						d.doc_type_id.includes(co_id_income_type_other)
					);

					const coAppPreFillKycDocsTag = allTagUnTagDocList.filter(
						d => d?.doc_type_id?.includes(co_id_income_type_kyc) && !!d.typeId
					);
					const coAppPreFillKycDocsUnTag = allTagUnTagDocList.filter(
						d => d?.doc_type_id?.includes(co_id_income_type_kyc) && !d.typeId
					);
					const coAppPreFillFinDocsTag = allTagUnTagDocList.filter(
						d =>
							d?.doc_type_id?.includes(co_id_income_type_financial) &&
							!!d.typeId
					);
					const coAppPreFillFinDocsUnTag = allTagUnTagDocList.filter(
						d =>
							d?.doc_type_id?.includes(co_id_income_type_financial) && !d.typeId
					);
					const coAppPreFillOtherDocsTag = allTagUnTagDocList.filter(
						d => d?.doc_type_id?.includes(co_id_income_type_other) && !!d.typeId
					);
					const coAppPreFillOtherDocsUnTag = allTagUnTagDocList.filter(
						d => d?.doc_type_id?.includes(co_id_income_type_other) && !d.typeId
					);

					const isDocUploadNotRequired =
						coAppKycDocList.length === 0 &&
						coAppFinDocList.length === 0 &&
						coAppOtherDocList.length === 0;

					let coApplicantFullName = '';
					if (coApplicant?.dfirstname)
						coApplicantFullName += coApplicant?.dfirstname;
					if (coApplicant?.dlastname)
						coApplicantFullName += ` ${coApplicant?.dlastname}`;
					return (
						<Fragment key={`co-${index}-${coApplicant?.id}`}>
							<div style={{ height: 30 }} />
							<UI.H>
								<span>
									Co-Applicant{' '}
									{sessionCoApplicantRes.length > 1 ? ` ${index + 1} ` : ''}{' '}
									Document Upload
								</span>
								<UI.CoAppName>{coApplicantFullName}</UI.CoAppName>
							</UI.H>
							{isDocUploadNotRequired && (
								<UI.DocUploadNotRequiredMessage>
									Not Required
								</UI.DocUploadNotRequiredMessage>
							)}
							{coAppKycDocList.length > 0 ? (
								<>
									<UI.Section
										onClick={() => toggleOpenSection(co_id_income_type_kyc)}
									>
										<UI.H1>KYC </UI.H1>
										<div
											style={{
												marginLeft: 10,
												alignItems: 'center',
												display: 'flex',
											}}
										>
											Document Submitted :
											<UI.StyledButton width={'auto'} fillColor>
												{coAppPreFillKycDocsTag.length} of{' '}
												{coAppKycDocList.length}
											</UI.StyledButton>
										</div>
										<UI.CollapseIcon
											src={downArray}
											style={{
												transform: openSection.includes(co_id_income_type_kyc)
													? `rotate(180deg)`
													: `none`,
												marginLeft: 'auto',
											}}
											alt='arrow'
										/>
									</UI.Section>
									<UI.Details
										open={openSection.includes(co_id_income_type_kyc)}
									>
										<UI.UploadWrapper
											open={openSection.includes(co_id_income_type_kyc)}
										>
											<FileUpload
												prefilledDocs={prefilledDocs}
												setPrefilledDocs={setPrefilledDocs}
												startingTaggedDocs={coAppPreFillKycDocsTag}
												startingUnTaggedDocs={coAppPreFillKycDocsUnTag}
												sectionType='kyc'
												section={'document-upload'}
												onDrop={files =>
													handleFileUpload(files, {
														doc_type_id: co_id_income_type_kyc,
														category: CONST.CATEGORY_KYC,
														director_id: coApplicant?.id,
													})
												}
												onRemoveFile={handleFileRemove}
												docTypeOptions={coAppKycDocList}
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
							{coAppFinDocList.length > 0 && (
								<>
									<UI.Section
										onClick={() =>
											toggleOpenSection(co_id_income_type_financial)
										}
									>
										<UI.H1>Financial </UI.H1>
										<div
											style={{
												marginLeft: 10,
												alignItems: 'center',
												/* minWidth: '500px', */
												display: 'flex',
											}}
										>
											Document Submitted :
											<UI.StyledButton width={'auto'} fillColor>
												{coAppPreFillFinDocsTag.length} of{' '}
												{coAppFinDocList.length}
											</UI.StyledButton>
										</div>
										<UI.CollapseIcon
											src={downArray}
											style={{
												transform: openSection.includes(
													co_id_income_type_financial
												)
													? `rotate(180deg)`
													: `none`,
												marginLeft: 'auto',
											}}
											alt='arrow'
										/>
									</UI.Section>
									<UI.Details
										open={openSection.includes(co_id_income_type_financial)}
									>
										<UI.UploadWrapper
											open={openSection.includes(co_id_income_type_financial)}
										>
											<FileUpload
												prefilledDocs={prefilledDocs}
												setPrefilledDocs={setPrefilledDocs}
												startingTaggedDocs={coAppPreFillFinDocsTag}
												startingUnTaggedDocs={coAppPreFillFinDocsUnTag}
												sectionType='financial'
												section={'document-upload'}
												onDrop={files =>
													handleFileUpload(files, {
														doc_type_id: co_id_income_type_financial,
														category: CONST.CATEGORY_FINANCIAL,
														director_id: coApplicant?.id,
													})
												}
												onRemoveFile={handleFileRemove}
												docTypeOptions={coAppFinDocList}
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

							{coAppOtherDocList.length > 0 ? (
								<>
									<UI.Section
										onClick={() => toggleOpenSection(co_id_income_type_other)}
									>
										<UI.H1>Other </UI.H1>
										<div
											style={{
												marginLeft: 10,
												alignItems: 'center',
												display: 'flex',
											}}
										>
											Document Submitted :
											<UI.StyledButton width={'auto'} fillColor>
												{coAppPreFillOtherDocsTag.length} of{' '}
												{coAppOtherDocList.length}
											</UI.StyledButton>
										</div>
										<UI.CollapseIcon
											src={downArray}
											style={{
												transform: openSection.includes(co_id_income_type_other)
													? `rotate(180deg)`
													: `none`,
												marginLeft: 'auto',
											}}
											alt='arrow'
										/>
									</UI.Section>
									<UI.Details
										open={openSection.includes(co_id_income_type_other)}
									>
										<UI.UploadWrapper
											open={openSection.includes(co_id_income_type_other)}
										>
											<FileUpload
												prefilledDocs={prefilledDocs}
												setPrefilledDocs={setPrefilledDocs}
												startingTaggedDocs={coAppPreFillOtherDocsTag}
												startingUnTaggedDocs={coAppPreFillOtherDocsUnTag}
												sectionType='other'
												section={'document-upload'}
												onDrop={files =>
													handleFileUpload(files, {
														doc_type_id: co_id_income_type_other,
														category: CONST.CATEGORY_OTHER,
														director_id: coApplicant?.id,
													})
												}
												onRemoveFile={handleFileRemove}
												docTypeOptions={coAppOtherDocList}
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
						</Fragment>
					);
				})}
				{/* -- CO-APPLICANT SECTION */}

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
				<UI.SubmitWrapper>{displayProceedButton}</UI.SubmitWrapper>
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
