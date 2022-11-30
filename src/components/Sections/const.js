import iconError from 'assets/icons/Red_error_icon.png';
import iconSuccess from 'assets/icons/success_icon.png';
import iconWarning from 'assets/icons/amber_warning_icon.png';

export const APPLICANT = 'applicant';
export const CO_APPLICANT = 'coapplicant';

export const EXTRACTION_KEY_PAN = 'pan';
export const EXTRACTION_KEY_DL = 'DL';
export const EXTRACTION_KEY_AADHAAR = 'aadhar';
export const EXTRACTION_KEY_VOTERID = 'voter';
export const EXTRACTION_KEY_PASSPORT = 'passport';
// export const EXTRACTION_KEY_OTHERS = 'others';

export const ADDRESS_PROOF_KEYS = [
	EXTRACTION_KEY_AADHAAR,
	EXTRACTION_KEY_DL,
	EXTRACTION_KEY_VOTERID,
	EXTRACTION_KEY_PASSPORT,
	// EXTRACTION_KEY_OTHERS,
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
	// [EXTRACTION_KEY_OTHERS]: [
	// 	{
	// 		typeId: 513,
	// 		value: 513,
	// 		doc_type_id: 513,
	// 		id: 513,
	// 		name: 'Other Front Part',
	// 	},
	// 	{
	// 		typeId: 514,
	// 		value: 514,
	// 		doc_type_id: 514,
	// 		id: 514,
	// 		name: 'Other Back Part',
	// 	},
	// 	{
	// 		typeId: 515,
	// 		value: 515,
	// 		doc_type_id: 515,
	// 		id: 515,
	// 		name: 'Other Front and Back',
	// 	},
	// ],
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

export const ALL_DOC_CATEGORY = [
	DOC_CATEGORY_KYC,
	DOC_CATEGORY_FINANCIAL,
	DOC_CATEGORY_OTHER,
	DOC_CATEGORY_LENDER,
	DOC_CATEGORY_EVAL,
];

export const APPLICATION_SUBMITTED_SECTION_ID = 'application_submitted';
