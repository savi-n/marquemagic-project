export const initialFormState = {
	aadhaar: '323232323232',
	address_proof_id: '242424',
	address_proof_id_passport: '242424',
	address_proof_id_dl: '242424',
	address_proof_id_voter: '242424',
	address1: 'Add Line 1',
	address2: 'Add Line 2',
	address3: 'Add Line 3',
	pin_code: '560078',
	city: 'Bangalore',
	state: 'Karnataka',
	property_type: 'Owned',
	property_tenure: 'abcde',
};

export const PREFIX_PRESENT = 'present_';
export const PREFIX_PERMANENT = 'permanent_';
export const AID_PRESENT = '1';
export const AID_PERMANENT = '2';
export const CHECKBOX_SAME_AS_ID = 'checkboxsameas';
export const ADDRESSPROOF = 'addressproof';

export const ADDRESS_PROOF_UPLOAD_SECTION_ID = 'address_proof_upload';
export const ID_PROOF_UPLOAD_FIELD_NAME = 'id_upload';
export const AADHAAR_FIELD_NAME = 'aadhaar';
export const AADHAAR_FIELD_NAME_FOR_OTP = 'permanent_aadhaar';
export const ADDRESS_PROOF_TYPE_FIELD_NAME = 'address_proof_type';
export const PERMANENT_ADDRESS_PROOF_TYPE_FIELD_NAME =
	'permanent_address_proof_type';
export const PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME =
	'present_address_proof_type';
export const PRESENT_ID_PROOF_UPLOAD_FIELD_NAME = 'present_id_upload';

export const HIDE_PRESENT_ADDRESS_FIELDS = [
	PRESENT_ADDRESS_PROOF_TYPE_FIELD_NAME,
	PRESENT_ID_PROOF_UPLOAD_FIELD_NAME,
];
