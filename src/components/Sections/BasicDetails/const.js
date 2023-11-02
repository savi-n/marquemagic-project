export const initialFormState = {
	existing_customer: 'Yes',
	pan_number: 'ABCDE2222F',
	// pan_number: '',
	income_type: '7',
	first_name: 'TensaF',
	last_name: 'TensaL',
	dob: '1994-11-05',
	gender: 'Male',
	email: 'varunbhai.miyani@namastecredit.com',
	mobile_no: '8892538145',
	marital_status: 'Married',
	spouse_name: 'Tensa',
	residence_status: 'Resident',
	country_residence: 'India',
	father_name: 'Father Name',
	mother_name: 'Mother Name',
	upi_id: '1111111',
	relationship_with_applicant: 'Father',
	father_last_name: 'Zangetsu',
	mother_middle_name: 'MotherM',
	mother_last_name: 'MotherL',
	father_middle_name: 'FatherM',
	middle_name: 'TensaM',
	no_of_dependents: 10,
	no_of_working_members: 2,
	mother_title: 'Mrs',
	father_title: 'Mr',
	spouse_title: 'Mrs',
	title: 'Mr',
	religion: 'Hindu',
	category: 'General',
};

export const PAN_UPLOAD_FIELD_NAME = 'pan_upload';
export const PAN_NUMBER_FIELD_NAME = 'pan_number';
export const MOBILE_NUMBER_FIELD_NAME = 'mobile_no';
export const FIRST_NAME_FIELD_NAME = 'first_name';
export const LAST_NAME_FIELD_NAME = 'last_name';
export const FATHER_NAME_FIELD_NAME = 'father_name';
export const PAN_NUMBER_CONFIRM_FIELD_NAME = 'pan_number_confirm';
export const PROFILE_UPLOAD_FIELD_NAME = 'profile_upload';
export const PROFILE_UPLOAD_FIELD_DB_KEY = 'customer_picture';
export const EXISTING_CUSTOMER_FIELD_NAME = 'existing_customer';
export const INCOME_TYPE_FIELD_NAME = 'income_type';
export const DOB_FIELD_NAME = 'dob';
export const EMAIL_ID_FIELD_NAME = 'email';
export const BASIC_DETAILS_SECTION_ID = 'basic_details';

export const CUSTOMER_ID_FIELD_NAME = 'customer_id';

export const PROFILE_PIC_GEO_ERROR_HINT = `Please Allow Location Access From Browser's Setting And Re-Upload The Profile Image`;
export const APPLICATION_GEO_ERROR_HINT = `Please Allow Location Access From Browser's Setting`;

export const NO_INCOME_TYPE_SELECTED_HINT =
	'Select the income type to fetch the data from Customer ID.';
export const ENTER_DIFFERENT_UCIC_HINT =
	'Please Enter Different UCIC Number To Fetch Data Again';
