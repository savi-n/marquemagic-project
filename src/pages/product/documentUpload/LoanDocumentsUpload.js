// active page
/* This file contains document upload section i.e visibility of documents, tags etc*/
import { useContext, useEffect, Fragment } from 'react';
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
	HOSTNAME,
} from '_config/app.config';
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
	const onOtherStatementModalToggle = () => {
		setOtherBankStatementModal(!otherBankStatementModal);
	};
	const [openSection, setOpenSection] = useState([CONST.CATEGORY_KYC]);
	const [loading, setLoading] = useState(false);
	const [allDocumentTypeList, setAllDocumentTypeList] = useState([]);
	const [allTagUnTagDocList, setAllTagUnTagDocList] = useState([]);
	const applicationState = JSON.parse(sessionStorage.getItem(HOSTNAME));
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
	const product_id = sessionStorage.getItem('productId');
	let corporateDetails = sessionStorage.getItem('corporateDetails');
	if (corporateDetails) corporateDetails = JSON.parse(corporateDetails);
	const business_income_type_id =
		applicantData?.incomeType ||
		documentState['business-details']?.BusinessType ||
		companyData?.BusinessType ||
		editLoanData?.business_id?.businesstype ||
		'';

	// const coApplicants = formReducer?.user?.['co-applicant-details-res']
	// 	? formReducer?.user?.['co-applicant-details-res']
	// 	: editLoanCoApplicants;
	const sessionCoApplicantRes =
		formReducer?.user?.['co-applicant-details-res'] || [];

	const getEncryptWhiteLabel = async () => {
		try {
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
			const applicantDocRes = await axios.post(DOCTYPES_FETCH, reqBody, {
				headers: {
					Authorization: `Bearer ${API_TOKEN}`,
				},
			});
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
				const coAppDocTypesRes = await axios.get(
					`${CO_APPLICANTS_DOCTYPES_FETCH}?income_type=${
						coApplicant?.income_type
					}`,
					{
						headers: {
							Authorization: `Bearer ${API_TOKEN}`,
						},
					}
				);
				// console.log('coAppDocTypesRes-', coAppDocTypesRes);
				// coApplicant
				// const newIncomeTypeDocTypeList = {};
				const newDocTypeList = [];
				for (const key in coAppDocTypesRes?.data?.data) {
					// console.log('coAppDocTypesRes?.data?.data-', { key });
					// newIncomeTypeDocTypeList[key] = [];
					coAppDocTypesRes?.data?.data?.[key]?.map(d => {
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

	const handleFileRemove = async (fileId, file) => {
		// console.log('handleFileRemove-', { allTagUnTagDocList, fileId, file });
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
		removeLoanDocument(fileId, file);
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
			const reqBody = CONST.caseCreationDataFormat(
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
				uploadedDocuments.map(doc => {
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
		const reqBody = CONST.subsidiaryDataFormat(
			caseId,
			documentState,
			editLoanData
		);
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
		let manadatoryError = false;
		uploadedDocuments?.map(ele => {
			// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
			if (ele.req_type) return null;
			if (!ele.typeId) {
				isDocTypeUnTagged = true;
				return false;
			}
			return null;
		});
		// const allDocOptions = [
		// 	...KycDocOptions,
		// 	...FinancialDocOptions,
		// 	...OtherDocOptions,
		// ];
		const allMandatoryDocumentIds = [];
		allDocumentTypeList.map(
			d => d.isMandatory && allMandatoryDocumentIds.push(d.value)
		);
		const uploadedDocumetnIds = [];
		uploadedDocuments?.map(d => uploadedDocumetnIds.push(d.typeId));

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

		if (isDocTypeUnTagged) {
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
		uploadedDocuments?.map((doc, docIndex) => {
			let doc_type_id = doc.doc_type_id;
			if (!doc.typeId) {
				doc_type_id = `app_${business_income_type_id}_${doc.category}_${
					flowDocTypeMappingList?.[`${doc?.req_type}`]
				}`;
			}
			const newDoc = {
				..._.cloneDeep(doc),
				name: doc.upload_doc_name,
				progress: '100',
				status: 'completed',
				file: null,
				typeId: doc.typeId || flowDocTypeMappingList[`${doc.req_type}`] || '',
				doc_type_id,
			};
			// if (newDoc.typeId) state.documents[docIndex].typeId = newDoc.typeId;
			newAllTagUnTagDocList.push(newDoc);
			return null;
		});
		// -- prefill document tagged and un-tagged

		// console.log('initializeComponent-allstates-', {
		// 	flowDocTypeMappingList,
		// 	newAllTagUnTagDocList,
		// 	allDocumentTypeList,
		// });

		setAllTagUnTagDocList(newAllTagUnTagDocList);
	};

	const initializeDocTypeList = async () => {
		try {
			setLoading(true);
			const newAllDocumentTypeList = [];
			await getEncryptWhiteLabel();
			// get applicant document list
			const newAppDocOptions = await getApplicantDocumentTypes();
			// -- get applicant document list

			// get co-applicant document list for all income types
			const newCoDocOptions = [];
			const allCoAppIncomeTypes = [];
			await asyncForEach(sessionCoApplicantRes, async coApplicant => {
				// console.log('coapplicant-', coApplicant);
				if (allCoAppIncomeTypes.includes(coApplicant?.income_type)) return;
				// const { newIncomeTypeDocTypeList, newDocTypeList } = await getCoApplicantDocumentTypes(coApplicant);
				const tempDocTypeList = await getCoApplicantDocumentTypes(coApplicant);
				tempDocTypeList.map(d => newCoDocOptions.push({ ...d }));
				allCoAppIncomeTypes.push(coApplicant?.income_type);
			});
			// -- get co-applicant document list

			newAppDocOptions.map(d => newAllDocumentTypeList.push({ ...d }));
			newCoDocOptions.map(d => newAllDocumentTypeList.push({ ...d }));
			setAllDocumentTypeList(
				newAllDocumentTypeList.sort((a, b) => a.id - b.id)
			);
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
		if (uploadedDocuments?.length > 0) {
			initializeTaggUnTagDocuments();
		}
		// eslint-disable-next-line
	}, [uploadedDocuments]);

	if (loading) {
		return (
			<UI.LoaderWrapper>
				<Loading />
			</UI.LoaderWrapper>
		);
	}

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
	const totalMandatoryUploadedDocumentCount =
		uploadedDocuments?.filter(d => !!d.isMandatory)?.length || 0;

	let applicantFullName = '';
	if (applicantData?.firstName) applicantFullName += applicantData?.firstName;
	if (applicantData?.dlastname)
		applicantFullName += ` ${applicantData?.lastName}`;

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
					{sessionCoApplicantRes.length > 1 && (
						<UI.CoAppName>{applicantFullName}</UI.CoAppName>
					)}
				</UI.H>

				{/* don't delete */}
				{/* disable/enable below code when useEffect, useFetch giving errors */}
				{loading ? <></> : null}

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
									// prefilledDocs={prefilledKycDocs}
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
									// prefilledDocs={prefilledFinancialDocs}
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
									// prefilledDocs={prefilledOtherDocs}
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
								{sessionCoApplicantRes.length > 1 && (
									<UI.CoAppName>{coApplicantFullName}</UI.CoAppName>
								)}
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
												// prefilledDocs={prefilledKycDocs}
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
												// prefilledDocs={prefilledFinancialDocs}
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
												// prefilledDocs={prefilledKycDocs}
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
