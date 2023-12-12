export const initialFormState = {
	asset_type: '75',
	type_of_funding: 'New',
	total_amount: 500,
	finance_requirement: 'RandomText123',
	dealer_name: 'RandomDealer',
	manufacturer_name: 'RandomManufacturer',
	dealer_address: 'RandomAddress',
	dealer_gst: 'RandomGST123',
	supply_place: 'New York',
	invoice_number: 'INV12345',
	hirer: 'ABC Leasing',
	make: 'Toyota',
	full_model_code: 'Camry XLE',
	tonnage_category: '5000 lbs',
	chassis_number: 'CHS123456',
	engine_number: 'ENG789012',
	invoice_cost: '25000',
	gst_invoice_cost: '3000',
	total_gst_invoice_cost: '28000',
	tcs: '500',
	vehicle_category: 'Sedan',
	color: 'Silver',
	manufacture_year: '2022',
	fuel_type: 'Petrol',
	transmission_type: 'Automatic',
	seating_capacity: 5,
	max_speed: '130 mph',
};

export const FIELD_NAME_VEHICLE_NUMBER = 'registration_number';
export const FIELD_NAME_VEHICLE_FOR = 'vehicle_for';

// Fields for fetching and prefilling the data using the vehicle registration number
export const FIELD_NAME_FUEL_TYPE = 'fuel_type';
export const FIELD_NAME_VEHICLE_CATEGORY = 'vehicle_category';
export const FIELD_NAME_VEHICLE_MODEL = 'vehicle_model';
export const FIELD_NAME_ENGINE_NUMBER = 'engine_number';
export const FIELD_NAME_CHASSIS_NUMBER = 'chassis_numer';
export const FIELD_NAME_REG_DATE = 'registration_date';
export const FIELD_NAME_BODY_TYPE = 'body_type';
export const FIELD_NAME_NORMS_TYPE = 'norms_type';
export const FIELD_NAME_REGISTERED_PLACE = 'registered_place';
export const FIELD_NAME_TAX_UPTO = 'mv_tax_upto';
export const FIELD_NAME_SEATING_CAPACITY = 'seating_capacity';
export const FIELD_NAME_INSURANCE_COMPANY_NAME = 'insurance_company_name';
export const FIELD_NAME_INSURANCE_POLICY_NUMBER = 'insurance_policy_no';
export const FIELD_NAME_MANUFACTURER_NAME = 'manufacturer_name';

export const PREFILL_FIELD_NAMES_ON_FETCH = [
	FIELD_NAME_FUEL_TYPE,
	FIELD_NAME_VEHICLE_CATEGORY,
	FIELD_NAME_VEHICLE_MODEL,
	FIELD_NAME_ENGINE_NUMBER,
	FIELD_NAME_CHASSIS_NUMBER,
	FIELD_NAME_REG_DATE,
	FIELD_NAME_BODY_TYPE,
	FIELD_NAME_NORMS_TYPE,
	FIELD_NAME_REGISTERED_PLACE,
	FIELD_NAME_TAX_UPTO,
	FIELD_NAME_SEATING_CAPACITY,
	FIELD_NAME_INSURANCE_COMPANY_NAME,
	FIELD_NAME_INSURANCE_POLICY_NUMBER,
	FIELD_NAME_MANUFACTURER_NAME,
];
