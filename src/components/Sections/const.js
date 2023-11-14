import iconError from 'assets/icons/Red_error_icon.png';
import iconSuccess from 'assets/icons/success_icon.png';
import iconWarning from 'assets/icons/amber_warning_icon.png';

export const APPLICANT = 'applicant';
export const CO_APPLICANT = 'coapplicant';

export const APPLICANT_TYPE_NAME = 'Applicant';

export const CO_APPLICANT_TYPE_NAME = 'Co-applicant';
export const GUARANTOR_TYPE_NAME = 'Guarantor';

export const EXTRACTION_KEY_PAN = 'pan';
export const EXTRACTION_KEY_DL = 'DL';
export const EXTRACTION_KEY_AADHAAR = 'aadhar';
export const EXTRACTION_KEY_VOTERID = 'voter';
export const EXTRACTION_KEY_PASSPORT = 'passport';
export const EXTRACTION_KEY_OTHERS = 'others';

export const BASIC_DETAILS_SECTION_ID = 'basic_details';
export const ADDRESS_DETAILS_SECTION_ID = 'loan_address_details';
export const EMPLOYMENT_DETAILS_SECTION_ID = 'employment_details';
export const DOCUMENT_UPLOAD_SECTION_ID = 'document_upload';

export const BASIC_DETAILS_SUB_SECTION_ID = 'basic_details';

export const timeoutForDocumentUpload = 60000;

export const ALL_SECTION_IDS = {
	document_upload: 'document_upload',
	consent_details: 'consent_details',
	poa_details: 'poa_details',
	reference_details: 'reference_details',
	subsidiary_details: 'subsidiary_details',
	bank_details: 'bank_details',
	collateral_details: 'collateral_details',
	assets_details: 'assets_details',
	liability_details: 'liability_details',
	loan_details: 'loan_details',
	employment_details: 'employment_details',
	loan_address_details: 'loan_address_details',
	basic_details: 'basic_details',

	business_details: 'business_details',
	business_address_details: 'business_address_details',

	application_submitted: 'application_submitted',
};

//for sme flow
export const BUSINESS_DETAILS_SECTION_ID = 'business_details';
export const BUSINESS_ADDRESS_SECTION_ID = 'business_address_details';
export const BUSINESS_ADDRESS_EDI_SECTION_ID = 'business_address_details_edi';

export const INITIAL_SECTION_IDS = [
	BASIC_DETAILS_SECTION_ID,
	ADDRESS_DETAILS_SECTION_ID,
	EMPLOYMENT_DETAILS_SECTION_ID,
];

export const INITIAL_SECTION_IDS_SME_FLOW = [
	BUSINESS_DETAILS_SECTION_ID,
	BUSINESS_ADDRESS_SECTION_ID,
	BUSINESS_ADDRESS_EDI_SECTION_ID,
	BASIC_DETAILS_SECTION_ID,
	ADDRESS_DETAILS_SECTION_ID,
	EMPLOYMENT_DETAILS_SECTION_ID,
];

export const ADDRESS_PROOF_KEYS = [
	EXTRACTION_KEY_AADHAAR,
	EXTRACTION_KEY_DL,
	EXTRACTION_KEY_VOTERID,
	EXTRACTION_KEY_PASSPORT,
	EXTRACTION_KEY_OTHERS,
];

export const EXTRACTION_KEYS = [
	EXTRACTION_KEY_AADHAAR,
	EXTRACTION_KEY_DL,
	EXTRACTION_KEY_VOTERID,
	EXTRACTION_KEY_PASSPORT,
	EXTRACTION_KEY_PAN,
];

export const SECTION_TYPE_ADDRESSPROOF = 'addressproof';
export const USER_CANCELED = 'user cancelled';

export const businessTypeMaps = [
	[['private', 'pvt'], 4],
	[['public', 'pub'], 5],
	[['llp'], 3],
];

export const ADDRESS_PROOF_DOC_TYPE_LIST = {
	[EXTRACTION_KEY_AADHAAR]: [
		{
			typeId: 501,
			value: 501,
			doc_type_id: 501,
			id: 501,
			name: 'Aadhaar Front Part',
		},
		{
			typeId: 502,
			value: 502,
			doc_type_id: 502,
			id: 502,
			name: 'Aadhaar Back Part',
		},
		{
			typeId: 503,
			value: 503,
			doc_type_id: 503,
			id: 503,
			name: 'Aadhaar Front and Back',
		},
	],
	[EXTRACTION_KEY_VOTERID]: [
		{
			typeId: 504,
			value: 504,
			doc_type_id: 504,
			id: 504,
			name: 'Voter Front Part',
		},
		{
			typeId: 505,
			value: 505,
			doc_type_id: 505,
			id: 505,
			name: 'Voter Back Part',
		},
		{
			typeId: 506,
			value: 506,
			doc_type_id: 506,
			id: 506,
			name: 'Voter Front and Back ',
		},
	],
	[EXTRACTION_KEY_DL]: [
		{
			typeId: 507,
			value: 507,
			doc_type_id: 507,
			id: 507,
			name: 'DL Front Part',
		},
		{
			typeId: 508,
			value: 508,
			doc_type_id: 508,
			id: 508,
			name: 'DL Back Part',
		},
		{
			typeId: 509,
			value: 509,
			doc_type_id: 509,
			id: 509,
			name: 'DL Front and Back',
		},
	],
	[EXTRACTION_KEY_PASSPORT]: [
		{
			typeId: 510,
			value: 510,
			doc_type_id: 510,
			id: 510,
			name: 'Passport Front Part',
		},
		{
			typeId: 511,
			value: 511,
			doc_type_id: 511,
			id: 511,
			name: 'Passport Back Part',
		},
		{
			typeId: 512,
			value: 512,
			doc_type_id: 512,
			id: 512,
			name: 'Passport Front and Back',
		},
	],
	[EXTRACTION_KEY_OTHERS]: [
		{
			typeId: 513,
			value: 513,
			doc_type_id: 513,
			id: 513,
			name: 'Address Proof Document Front',
		},
		{
			typeId: 514,
			value: 514,
			doc_type_id: 514,
			id: 514,
			name: 'Address Proof Document Back',
		},
		{
			typeId: 515,
			value: 515,
			doc_type_id: 515,
			id: 515,
			name: 'Address Proof Document Front and Back',
		},
	],
};

export const EXTRACTION_FLAG_SUCCESS = 'Success:';
export const EXTRACTION_FLAG_ERROR = 'Error:';
export const EXTRACTION_FLAG_WARNING = 'Warning:';

export const getExtractionFlagColorCode = errorMessage => {
	if (errorMessage.includes(EXTRACTION_FLAG_SUCCESS)) return '#4cc97f';
	if (errorMessage.includes(EXTRACTION_FLAG_ERROR)) return '#de524c';
	if (errorMessage.includes(EXTRACTION_FLAG_WARNING)) return '#f7941d';
	return '';
};
export const getExtractionFlagIcon = errorMessage => {
	if (errorMessage.includes(EXTRACTION_FLAG_SUCCESS)) return iconSuccess;
	if (errorMessage.includes(EXTRACTION_FLAG_ERROR)) return iconError;
	if (errorMessage.includes(EXTRACTION_FLAG_WARNING)) return iconWarning;
	return '';
};

export const isBusinessPan = companyName => {
	return (
		companyName?.toLowerCase()?.includes('private limited') ||
		companyName?.toLowerCase()?.includes('public limited') ||
		companyName?.toLowerCase()?.includes('limited') ||
		companyName?.toLowerCase()?.includes('pvt ltd') ||
		companyName?.toLowerCase()?.includes('private')
	);
};

export const DOC_CATEGORY_KYC = 'kyc';
export const DOC_CATEGORY_FINANCIAL = 'financial';
export const DOC_CATEGORY_OTHER = 'other';
export const DOC_CATEGORY_LENDER = 'lender';
export const DOC_CATEGORY_EVAL = 'eval';
export const DOC_CATEGORY_EVAL_NAME = 'EVALUATION';

export const ALL_DOC_CATEGORY = [
	DOC_CATEGORY_KYC,
	DOC_CATEGORY_FINANCIAL,
	DOC_CATEGORY_OTHER,
	DOC_CATEGORY_LENDER,
	DOC_CATEGORY_EVAL,
];

export const APPLICATION_SUBMITTED_SECTION_ID = 'application_submitted';

export const DIRECTOR_TYPE_CO_APPLICANT = 'co-applicant';

export const CLASSIFICATION_TYPES = [
	'pan',
	'aadhaar',
	'voter',
	'passport',
	'dl',
];
export const CLASSIFICATION_SUB_TYPES = ['F', 'B', 'F&B'];

export const CLASSIFICATION_TYPE_PAN = 'pan';
export const CLASSIFICATION_TYPE_AADHAAR = 'aadhaar';
export const CLASSIFICATION_TYPE_VOTER = 'voter';
export const CLASSIFICATION_TYPE_PASSPORT = 'passport';
export const CLASSIFICATION_TYPE_DL = 'dl';
export const CLASSIFICATION_TYPE_OTHERS = 'others';

export const CLASSIFICATION_SUB_TYPE_F = 'F';
export const CLASSIFICATION_SUB_TYPE_B = 'B';
export const CLASSIFICATION_SUB_TYPE_FB = 'F&B';

export const ADDRESS_PROOF_CLASSIFICATION_KEYS = [
	CLASSIFICATION_TYPE_AADHAAR,
	CLASSIFICATION_TYPE_DL,
	CLASSIFICATION_TYPE_VOTER,
	CLASSIFICATION_TYPE_PASSPORT,
	CLASSIFICATION_TYPE_OTHERS,
];

export const GET_ADDRESS_PROOF_KEYS_FROM_CLASSIFICATION_KEYS_MAPPING = {
	[EXTRACTION_KEY_AADHAAR]: CLASSIFICATION_TYPE_AADHAAR,
	[EXTRACTION_KEY_DL]: CLASSIFICATION_TYPE_DL,
	[EXTRACTION_KEY_VOTERID]: CLASSIFICATION_TYPE_VOTER,
	[EXTRACTION_KEY_PASSPORT]: CLASSIFICATION_TYPE_PASSPORT,
	[EXTRACTION_KEY_OTHERS]: CLASSIFICATION_TYPE_OTHERS,
};

export const GET_CLASSIFICATION_KEYS_FROM_ADDRESS_PROOF_KEYS_MAPPING = {
	[CLASSIFICATION_TYPE_AADHAAR]: EXTRACTION_KEY_AADHAAR,
	[CLASSIFICATION_TYPE_DL]: EXTRACTION_KEY_DL,
	[CLASSIFICATION_TYPE_VOTER]: EXTRACTION_KEY_VOTERID,
	[CLASSIFICATION_TYPE_PASSPORT]: EXTRACTION_KEY_PASSPORT,
	[CLASSIFICATION_TYPE_OTHERS]: EXTRACTION_KEY_OTHERS,
};

// export const BUSINESS_TYPE_OPTIONS = {
// 	1: 'Proprietor', // 1: Sole Proprietorship
// 	2: 'Partner', // 2: Partnership
// 	3: 'Partner', // 3: LLP
// 	4: 'Director', // 4: Private Limited
// 	5: 'Director', // 5: Public Limited
// 	6: 'Member', // 6: Others
// 	9: 'Trustee', // 9: Trust
// 	10: 'Member', // 10: Society
// 	11: 'Member', // 11: Associations
// };
