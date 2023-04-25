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

export const ADDRESS_LINE_1_DB_KEY = 'line1';
export const ADDRESS_LINE_2_DB_KEY = 'line2';
export const ADDRESS_LINE_3_DB_KEY = 'locality';
export const PINCODE_DB_KEY = 'pincode';
export const CITY_DB_KEY = 'city';
export const STATE_DB_KEY = 'state';
export const SELECT_GSTIN_FIELD_NAME = 'select_gstin';
