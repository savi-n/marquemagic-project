export const initialFormState = {
	registered_aadhaar: '323232323232',
	registered_address_proof_id: '242424',
	registered_address_proof_id_passport: '242424',
	registered_address_proof_id_dl: '242424',
	registered_address_proof_id_voter: '242424',
	registered_address1: 'Add Line 1',
	registered_address2: 'Add Line 2',
	registered_address3: 'Add Line 3',
	registered_pin_code: '560078',
	registered_city: 'Bangalore',
	registered_state: 'Karnataka',
	registered_property_type: 'Owned',
	registered_property_tenure: '2022-12',
};

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
export const PREFIX_REGISTERED = 'registered_';
// export const PREFIX_registered = 'registered_';
// export const PREFIX_PRESENT = 'operating_';
export const PREFIX_OPERATING = 'operating_';
export const AID_OPERATING = '1';
export const AID_REGISTERED = '2';
export const CHECKBOX_SAME_AS_ID = 'checkboxsameas';
export const CHECKBOX_PREFFERED_MAILING_ADDRESS_ID_REGISTERED='checkboxregistered'
export const CHECKBOX_PREFFERED_MAILING_ADDRESS_ID_OPERATING='checkboxoperating';
export const ADDRESSPROOF = 'addressproof';
export const SUB_SECTION_ID_OPERATING_ADDRESS_PROOF_UPLOAD =
	'operating_address_proof_upload';


export const REGISTERED_ADDRESS_DETAILS_SECTION_ID = 'REGISTERED_address_details';
export const ADDRESS_PROOF_UPLOAD_SECTION_ID = 'address_proof_upload';
export const ID_PROOF_UPLOAD_FIELD_NAME = 'id_upload';
export const AADHAAR_FIELD_NAME = 'aadhaar';
export const AADHAAR_FIELD_NAME_FOR_OTP = 'REGISTERED_aadhaar';
export const ADDRESS_PROOF_TYPE_FIELD_NAME = 'address_proof_type';
export const REGISTERED_ADDRESS_PROOF_TYPE_FIELD_NAME =
	'REGISTERED_address_proof_type';
export const REGISTERED_ADDRESS_PROOF_TYPE_FIELD_VALUE_AADHAAR =
	'REGISTERED_aadhar';
export const PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME =
	'present_address_proof_type';
export const PRESENT_ID_PROOF_UPLOAD_FIELD_NAME = 'present_id_upload';
export const REGISTERED_ADDRESS1_FIELD_NAME = 'REGISTERED_address1';
export const OTHERS_DOC_NAME_FIELD_NAME = 'address_proof_id_others';
export const REGISTERED_FIELD_NAME='registered_address'
export const HIDE_OPERATING_ADDRESS_FIELDS = [
	PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME,
	PRESENT_ID_PROOF_UPLOAD_FIELD_NAME,
];
