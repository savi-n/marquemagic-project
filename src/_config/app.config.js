/* Constants used (config details) throughtout the project are defined in this section */

import taggedTemplate from '../utils/taggedTemplate';

const API_END_POINT =
	process.env.REACT_APP_API_URL || 'http://3.108.54.252:1337';
const ENDPOINT_BANK =
	process.env.REACT_APP_BANK_API || 'http://40.80.80.135:1337';
const OTP_API_END_POINT =
	process.env.REACT_APP_OTP_URL || 'http://18.136.14.70';
// "https://apiv3.namastecredit.com/apiservices";

const APP_DOMAIN = process.env.REACT_APP_DOMAIN || '';

const CLIENT_VERIFY_URL = `${ENDPOINT_BANK}/sails-exp/ClientVerify`;

const BANK_TOKEN_API = `${ENDPOINT_BANK}/generateLink`;
const CUB_ACCOUNT_MINI_STATEMENT = `${ENDPOINT_BANK}/cub/accountMiniStatement`;

const UPLOAD_CUB_STATEMENT = `${ENDPOINT_BANK}/uploadToSailsExp`;
const BANK_LIST_API = `${ENDPOINT_BANK}/bank_list`;
const FETCH_CIBIL_SCORE = `${ENDPOINT_BANK}/equifax/fetchData`;

const WHITE_LABEL_URL = taggedTemplate`${API_END_POINT}/wot/whitelabelsolution?name=${'name'}`;
const PRODUCT_LIST_URL = taggedTemplate`${API_END_POINT}/productDetails?white_label_id=${'whiteLabelId'}`;
const PRODUCT_DETAILS_URL = taggedTemplate`${API_END_POINT}/productDetails?white_label_id=${'whiteLabelId'}&product_id=${'productId'}`;
const DOCS_UPLOAD_URL = taggedTemplate`${API_END_POINT}/loanDocumentUpload?userId=${'userId'}`;
const DOCS_UPLOAD_URL_LOAN = taggedTemplate`${API_END_POINT}/loanDocumentUpload?userid=${'userId'}`;

const BORROWER_UPLOAD_URL = `${API_END_POINT}/borrowerdoc-upload`;
const TO_APPLICATION_STAGE_URL = `${API_END_POINT}/toApplicationStage`;

const GENERATE_OTP_URL = `${API_END_POINT}/cub/generateOtp`;

const VERIFY_OTP_URL = `${API_END_POINT}/cub/verifyOtp`;

const CREATE_CASE = `${API_END_POINT}/cub/createCase`;

const CREATE_CASE_OTHER_USER = `${API_END_POINT}/addDirector`;

const SEARCH_BANK_BRANCH_LIST = taggedTemplate`${API_END_POINT}/getBranchList?bankId=${'bankId'}
`;

const SEARCH_LOAN_ASSET = `${API_END_POINT}/searchByBrandname`;

const UPDATE_LOAN_ASSETS = `${API_END_POINT}/insertLoanAssets/`;

const SECRET = 'htde6458dgej2164';
const PINCODE_ADRRESS_FETCH = taggedTemplate`${API_END_POINT}/pincode?code=${'pinCode'}`;

const ROC_DATA_FETCH = `${ENDPOINT_BANK}/ROCData`;

const BUSSINESS_LOAN_CASE_CREATION = `${API_END_POINT}/casecreation_uiux`;
const BUSSINESS_LOAN_CASE_CREATION_EDIT = `${API_END_POINT}/loan/edit/`;

const LOGIN_CREATEUSER = `${API_END_POINT}/login/createUser`;

const BUSSINESS_PROFILE_UPDATE = `${API_END_POINT}/profile/`;

const COAPPLICANT_DETAILS = `${API_END_POINT}/addCo-Applicant`;

const WHITELABEL_ENCRYPTION_API = `${API_END_POINT}/case-whitelabelEncrypt`;

const SEARCH_COMPANY_NAME = `${API_END_POINT}/companySearch`;

const ADD_SUBSIDIARY_DETAILS = `${API_END_POINT}/addSubsidiaryDetails`;
const ADD_BANK_DETAILS = `${API_END_POINT}/addBankDetailsNew`; // addBankDetailsUiux

const ADD_SHAREHOLDER_DETAILS = `${API_END_POINT}/businessShareholder/create`;
const ADD_REFENCE_DETAILS = `${API_END_POINT}/LoanReferences/create`;

const BANK_LIST_FETCH = `${API_END_POINT}/BankMaster`;
const IFSC_LIST_FETCH = `${API_END_POINT}/IFSC_list`;

const DOCTYPES_FETCH = `${API_END_POINT}/loan/documentTypes/`;
const CO_APPLICANTS_DOCTYPES_FETCH = `${API_END_POINT}/coApplicantDocList`;

const CIN_UPDATE = `${API_END_POINT}/cin-update`;

const UPLOAD_CACHE_DOCS = `${ENDPOINT_BANK}/uploadCacheDocuments`;
const AADHAAR_GENERATE_OTP = `${ENDPOINT_BANK}/aadhaar/generateOTP`;
const AADHAAR_VERIFY_OTP = `${ENDPOINT_BANK}/aadhaar/verifyOTP`;
const AADHAAR_RESEND_OTP = `${ENDPOINT_BANK}/aadhaar/resendOTP`;
const AUTHENTICATION_GENERATE_OTP = `${API_END_POINT}/users/sendOTP`;
const AUTHENTICATION_VERIFY_OTP = `${API_END_POINT}/users/verifyOTP`;
const DELETE_DOCUMENT = `${API_END_POINT}/documentDelete`;
const VIEW_DOCUMENT = `${API_END_POINT}/viewDocument`;
const FETCH_EVAL_DETAILS = `${API_END_POINT}/fetchEvaluationDetails`;

const UPLOAD_PROFILE_IMAGE = `${API_END_POINT}/profilePicUpload`;
const GE_LOAN_DETAILS_WITH_LOAN_REF_ID = `${API_END_POINT}/getDetailsWithLoanRefId`;
const ADD_COMMENTS_FOR_OFFICE_USE = `${API_END_POINT}/addComments`;

const HOSTNAME = window.location.hostname;
const APP_CLIENT = HOSTNAME === 'localhost' ? 'clix.loan2pal.com' : HOSTNAME;
const CLIENT_EMAIL_ID = 'clix@nc.com';
const REDIRECT_CREATE =
	HOSTNAME === 'localhost' ? '/' : '/onboarding/applyloan';

const KYC_URL = `http://40.80.80.135:1337/getKycData`;

const NC_STATUS_CODE = {
	OK: 'ok',
	NC200: 'NC200',
	NC202: 'NC202',
	NC302: 'NC302',
	NC303: 'NC303',
	NC305: 'NC305',
	NC306: 'NC306 ',
	NC308: 'NC308 ',
	NC500: 'NC500',
};

const USER_ROLES = {
	User: 'user',
	'Co-applicant': 'Co-applicant',
	Guarantor: 'Guarantor',
};

const RESEND_OTP_TIMER = 90;

const LOGIN_CREATEUSER_REQ_BODY = 'login-create-user-reqbody';
const BUSINESS_PROFILE_REQ_BODY = 'business-profile-reqbody';
const BANK_LIST_FETCH_RESPONSE = 'bank-list-fetch-response';
const APP_DOCTYPE_LIST_REQ_BODY = 'app-doctype-list-reqbody';
const APP_DOCTYPE_LIST_RESPONSE = 'app-doctype-list-response';
const CO_APP_DOCTYPE_LIST_REQ_BODY = 'co_app-doctype-list-reqbody';
const CO_APP_DOCTYPE_LIST_RESPONSE = 'co_app-doctype-list-response';
const CO_APP_DETAILS = 'co-applicant-details';
const CO_APP_CREATE_REQ_BODY = 'co_app-create-reqbody';
const CO_APP_CREATE_RESPONSE = 'co_app-create-response';
const PINCODE_RESPONSE = 'pincode-response';

const ORIGIN = 'nconboarding';
const TEST_DOMAINS = ['localhost', 'clix.loan2pal.com'];

export {
	API_END_POINT,
	OTP_API_END_POINT,
	ENDPOINT_BANK,
	CLIENT_EMAIL_ID,
	CLIENT_VERIFY_URL,
	BANK_TOKEN_API,
	BANK_LIST_API,
	NC_STATUS_CODE,
	WHITE_LABEL_URL,
	PRODUCT_LIST_URL,
	PRODUCT_DETAILS_URL,
	DOCS_UPLOAD_URL,
	BORROWER_UPLOAD_URL,
	GENERATE_OTP_URL,
	VERIFY_OTP_URL,
	CREATE_CASE,
	CREATE_CASE_OTHER_USER,
	USER_ROLES,
	SEARCH_BANK_BRANCH_LIST,
	SEARCH_LOAN_ASSET,
	CUB_ACCOUNT_MINI_STATEMENT,
	UPLOAD_CUB_STATEMENT,
	UPDATE_LOAN_ASSETS,
	FETCH_CIBIL_SCORE,
	PINCODE_ADRRESS_FETCH,
	APP_DOMAIN,
	ROC_DATA_FETCH,
	BUSSINESS_LOAN_CASE_CREATION,
	BUSSINESS_LOAN_CASE_CREATION_EDIT,
	WHITELABEL_ENCRYPTION_API,
	LOGIN_CREATEUSER,
	SEARCH_COMPANY_NAME,
	ADD_SUBSIDIARY_DETAILS,
	ADD_BANK_DETAILS,
	ADD_SHAREHOLDER_DETAILS,
	ADD_REFENCE_DETAILS,
	BANK_LIST_FETCH,
	IFSC_LIST_FETCH,
	DOCTYPES_FETCH,
	APP_CLIENT,
	SECRET,
	DOCS_UPLOAD_URL_LOAN,
	REDIRECT_CREATE,
	KYC_URL,
	CIN_UPDATE,
	UPLOAD_CACHE_DOCS,
	AADHAAR_GENERATE_OTP,
	AADHAAR_VERIFY_OTP,
	AADHAAR_RESEND_OTP,
	AUTHENTICATION_GENERATE_OTP,
	AUTHENTICATION_VERIFY_OTP,
	BUSSINESS_PROFILE_UPDATE,
	COAPPLICANT_DETAILS,
	RESEND_OTP_TIMER,
	DELETE_DOCUMENT,
	VIEW_DOCUMENT,
	CO_APPLICANTS_DOCTYPES_FETCH,
	HOSTNAME,
	LOGIN_CREATEUSER_REQ_BODY,
	BUSINESS_PROFILE_REQ_BODY,
	BANK_LIST_FETCH_RESPONSE,
	APP_DOCTYPE_LIST_REQ_BODY,
	APP_DOCTYPE_LIST_RESPONSE,
	CO_APP_DOCTYPE_LIST_REQ_BODY,
	CO_APP_DOCTYPE_LIST_RESPONSE,
	CO_APP_DETAILS,
	CO_APP_CREATE_REQ_BODY,
	CO_APP_CREATE_RESPONSE,
	PINCODE_RESPONSE,
	FETCH_EVAL_DETAILS,
	ORIGIN,
	GE_LOAN_DETAILS_WITH_LOAN_REF_ID,
	UPLOAD_PROFILE_IMAGE,
	ADD_COMMENTS_FOR_OFFICE_USE,
	TEST_DOMAINS,
	TO_APPLICATION_STAGE_URL,
};
