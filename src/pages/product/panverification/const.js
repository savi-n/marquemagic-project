export const EXTRACTION_KEY_PAN = 'pan';
export const EXTRACTION_KEY_DL = 'DL';
export const EXTRACTION_KEY_AADHAAR = 'aadhar';
export const EXTRACTION_KEY_VOTERID = 'voter';
export const EXTRACTION_KEY_PASSPORT = 'passport';

export const SCREEN_PAN = 'SCREEN_PAN';
export const SCREEN_ADDRESS_PROOF = 'SCREEN_ADDRESS_PROOF';
export const SCREEN_GST_UDHYOG = 'SCREEN_GST_UDHYOG';

export const ADDRESS_PROOF_KEYS = [
	EXTRACTION_KEY_AADHAAR,
	EXTRACTION_KEY_DL,
	EXTRACTION_KEY_VOTERID,
	EXTRACTION_KEY_PASSPORT,
];

export const addressProofRadioButtonList = [
	{ key: EXTRACTION_KEY_AADHAAR, name: 'Aadhaar' },
	{ key: EXTRACTION_KEY_VOTERID, name: 'Voter ID' },
	{ key: EXTRACTION_KEY_DL, name: 'DL' },
	{ key: EXTRACTION_KEY_PASSPORT, name: 'Passport' },
];

export const SECTION_TYPE_ADDRESSPROOF = 'addressproof';

export const getDocumentTypeList = selectedAddressProof => {
	if (selectedAddressProof === EXTRACTION_KEY_AADHAAR) {
		return [
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
				name: 'Aadhaar Front Back Part',
			},
		];
	}
	if (selectedAddressProof === EXTRACTION_KEY_VOTERID) {
		return [
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
				name: 'Voter Front Back Part',
			},
		];
	}
	if (selectedAddressProof === EXTRACTION_KEY_DL) {
		return [
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
				name: 'DL Front Back Part',
			},
		];
	}
	if (selectedAddressProof === EXTRACTION_KEY_PASSPORT) {
		return [
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
				name: 'Passport Front Back Part',
			},
		];
	}
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

// onSubmit={handleSubmit(onSubmit)}
// TODO: Cleanup
// disabled={
// 	!selectedAddressProof
// 		? true
// 		: productType !== 'salaried'
// 		? isBusiness
// 			? !(
// 					formState.values?.companyName ||
// 					formState.values?.panNumber
// 			  ) ||
// 			  (formState.values?.companyName &&
// 					formState.values?.panNumber)
// 			: (!(
// 					formState.values?.udhyogAadhar &&
// 					formState.values?.panNumber
// 			  ) &&
// 					!(
// 						formState.values?.panNumber &&
// 						formState?.values?.gstin
// 					)) ||
// 			  loading ||
// 			  (verificationFailed &&
// 					verificationFailed.length > 0)
// 		: !(
// 				aadhar.length > 0 ||
// 				otherDoc.length > 0 ||
// 				voter.length > 0
// 		  ) ||
// 		  disableButton ||
// 		  loading ||
// 		  voterError.length > 0 ||
// 		  aadharError.length > 0 ||
// 		  dlError.length > 0
// }
