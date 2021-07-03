import taggedTemplate from '../utils/taggedTemplate';

const API_END_POINT = process.env.REACT_APP_API_URL || 'http://3.108.54.252:1337';
const ENDPOINT_BANK = process.env.REACT_APP_BANK_API || 'http://40.80.80.135:1337';

const APP_DOMAIN = process.env.REACT_APP_DOMAIN || '';

const CLIENT_VERIFY_URL = `${ENDPOINT_BANK}/sails-exp/ClientVerify`;

const BANK_TOKEN_API = `${ENDPOINT_BANK}/generateLink`;
const CUB_ACCOUNT_MINI_STATEMENT = `${ENDPOINT_BANK}/cub/accountMiniStatement`;

const UPLOAD_CUB_STATEMENT = `${ENDPOINT_BANK}/uploadToSailsExp`;
const BANK_LIST_API = `${ENDPOINT_BANK}/bank_list`;
const FETCH_CIBIL_SCORE = `${ENDPOINT_BANK}/equifax/fetchData`;

const CLIENT_EMAIL_ID = 'cub@nc.com';

const WHITE_LABEL_URL = taggedTemplate`${API_END_POINT}/wot/whitelabelsolution?name=${'name'}`;
const PRODUCT_LIST_URL = taggedTemplate`${API_END_POINT}/productDetails?white_label_id=${'whiteLabelId'}`;
const PRODUCT_DETAILS_URL = taggedTemplate`${API_END_POINT}/productDetails?white_label_id=${'whiteLabelId'}&product_id=${'productId'}`;
const DOCS_UPLOAD_URL = taggedTemplate`${API_END_POINT}/loanDocumentUpload?userId=${'userId'}`;
const BORROWER_UPLOAD_URL = `${API_END_POINT}/borrowerdoc-upload`;

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

const NC_STATUS_CODE = {
	OK: 'ok',
	NC200: 'NC200',
	NC302: 'NC302',
	NC305: 'NC305',
	NC306: 'NC306 ',
	NC308: 'NC308 ',
	NC500: 'NC500'
};

const USER_ROLES = {
	User: 'user',
	'Co-applicant': 'coapplicant',
	Guarantor: 'guarantor'
};

export {
	API_END_POINT,
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
	SECRET
};
