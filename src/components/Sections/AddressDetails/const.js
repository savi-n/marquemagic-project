export const initialFormState = {
	permanent_aadhaar: '323232323232',
	permanent_address_proof_id: '242424',
	permanent_address_proof_id_passport: '242424',
	permanent_address_proof_id_dl: '242424',
	permanent_address_proof_id_voter: '242424',
	permanent_address1: 'Add Line 1',
	permanent_address2: 'Add Line 2',
	permanent_address3: 'Add Line 3',
	permanent_pin_code: '560078',
	permanent_city: 'Bangalore',
	permanent_state: 'Karnataka',
	permanent_property_type: 'Owned',
	permanent_property_tenure: '2022-12',
	as_per_document_address1: 'hello 123',
	as_per_document_address2: 'hello 123',
	as_per_document_address3: 'hello 123',
	as_per_document_pin_code: '560075',
	as_per_document_city: 'hello 123',
	as_per_document_state: 'Karnataka',
};

export const AS_PER_DOCUMENT_FIELDS_TO_DISABLE = [
	'as_per_document_address1',
	'as_per_document_address2',
	'as_per_document_address3',
	'as_per_document_pin_code',
	'as_per_document_city',
	'as_per_document_state',
	'as_per_document_property_type',
	'as_per_document_address_proof_id_voter',
	'as_per_document_address_proof_id_dl',
	'as_per_document_address_proof_id_passport',
];

export const resetAllFields = {
	aadhaar: '',
	address_proof_id: '',
	address_proof_id_passport: '',
	address_proof_id_dl: '',
	address_proof_id_voter: '',
	address1: '',
	address2: '',
	address3: '',
	pin_code: '',
	city: '',
	state: '',
	property_type: '',
	property_tenure: '',
};

export const resetFieldsForDoc = {
	aadhaar: '',
	address_proof_id: '',
	address_proof_id_passport: '',
	address_proof_id_dl: '',
	address_proof_id_voter: '',
};

export const PREFIX_PRESENT = 'present_';
export const PREFIX_PERMANENT = 'permanent_';
export const PREFIX_AS_PER_DOCUMENT = 'as_per_document_';

export const AID_PRESENT = '1';
export const AID_PERMANENT = '2';
export const AID_AS_PER_DOCUMENT = '3';
export const CHECKBOX_SAME_AS_ID = 'checkboxsameas';
export const CHECKBOX_SAME_AS_DOCUMENT_FOR_PERMANENT =
	'checksameasdocforpermanent';
export const CHECKBOX_SAME_AS_DOCUMENT_FOR_PRESENT = 'checksameasdocforpresent';
export const ADDRESSPROOF = 'addressproof';
export const SUB_SECTION_ID_PRESENT_ADDRESS_PROOF_UPLOAD =
	'present_address_proof_upload';

export const PERMANENT_ADDRESS_DETAILS_SECTION_ID = 'permanent_address_details';
export const PRESENT_ADDRESS_DETAILS_SECTION_ID = 'present_address_details';
export const ADDRESS_PROOF_UPLOAD_SECTION_ID = 'address_proof_upload';
export const ID_PROOF_UPLOAD_FIELD_NAME = 'id_upload';
export const AADHAAR_FIELD_NAME = 'aadhaar';
export const AADHAAR_FIELD_NAME_FOR_OTP_PERMANENT = 'permanent_aadhaar';
export const AADHAAR_FIELD_NAME_FOR_OTP_AS_PER_DOCUMENT =
	'as_per_document_aadhaar';
export const ADDRESS_PROOF_TYPE_FIELD_NAME = 'address_proof_type';
export const PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME =
	'permanent_address_proof_type';
export const PERMANENT_ADDRESS_PROOF_TYPE_FIELD_VALUE_AADHAAR =
	'permanent_aadhar';
export const PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME =
	'present_address_proof_type';
export const AS_PER_DOCUMENT_ADDRESS_PROOF_TYPE_FIELD_NAME =
	'as_per_document_address_proof_type';
export const PRESENT_ID_PROOF_UPLOAD_FIELD_NAME = 'present_id_upload';
export const PERMANENT_ID_PROOF_UPLOAD_FIELD_NAME = 'permanent_id_upload';
export const REGISTERED_FIELD_NAME = 'registered_address';
export const OTHERS_DOC_NAME_FIELD_NAME = 'address_proof_id_others';
export const PERMANENT_ADDRESS1_FIELD_NAME = 'permanent_address1';
export const AS_PER_DOC_ADDRESS1_FIELD_NAME = 'as_per_document_address1';
export const HIDE_PRESENT_ADDRESS_FIELDS = [
	PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME,
	PRESENT_ID_PROOF_UPLOAD_FIELD_NAME,
];

export const HIDE_PERMANENT_ADDRESS_FIELDS = [
	PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME,
	PERMANENT_ID_PROOF_UPLOAD_FIELD_NAME,
];

export const PRESENT_OTHERS_RADIO = 'present_others';
export const PERMANENT_OTHERS_RADIO = 'permanent_others';
