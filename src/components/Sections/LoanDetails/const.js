export const initialFormState = {
	loan_amount: '100000',
	tenure: '111',
	loan_product_id: '222',
	scheme_category: '1',
	loan_usage_type_id: '2',
	cusion_period: '33',
	branchId: '179424',
	pre_emi: 'No',
	credit_insurance: 'No',
	repayment_mode: 'NACH',
	land_cost: '444',
	total_purchase_price_construction_cost: '555',
	incidental_cost: '666',
	other_costs: '777',
	reg_cost_service_tax: '888',
	loan_applied_for: '999',
	savings_personal_funds: '1010',
	others: '1111',
	other_source_margin_money: '1212',
	loan_source: 'Branch',

	imd_collected: 'No',
};

export const BRANCH_FIELD_NAME = 'branch';
export const CONNECTOR_NAME_FIELD_NAME = 'connector_name';
export const CONNECTOR_CODE_FIELD_NAME = 'connector_code';
export const IMD_PAID_BY_FIELD_NAME = 'imd_paid_by';
export const IMD_DOCUMENT_UPLOAD_FIELD_NAME = 'imd_document_proof';
export const IMD_COLLECTED_FIELD_NAME = 'imd_collected';
export const FIELD_NAME_TYPE_OF_LOAN = 'type_of_loan';
export const FIELD_NAME_CONNECTOR = 'Connector';
export const FIELD_NAME_NC_CONNECTOR = 'nconboarding_Connector';
export const FIELD_NAME_BRANCH = 'Branch';
export const FIELD_NAME_NC_BRANCH = 'nconboarding_Branch';
export const FIELD_NAME_NC = 'nconboarding';
export const FIELD_NAME_NC2 = 'nconboarding_';
export const FIELD_NAME_PURPOSE_OF_LOAN = 'purpose_of_loan';
export const IS_IN_DRAFT_OR_APPLICATION_STAGE = 1;
export const SOURCE_DETAILS_SUBSECTION_ID = 'source_details';
export const TENURE = 'tenure';
export const LOAN_AMOUNT = 'loan_amount';
export const LOAN_SOURCE = 'loan_source';
export const PSL_CLASSIFICATON = 'psl_classification';
export const DSA_BRANCH_NAME = 'dsa_name';
export const GL_SOURCING_BRANCH = 'gl_branch';
export const LIMIT_APPLIED_FIELD_NAME = 'limit_applied';
export const DISABLE_BRANCH_FIELD_FOR = [
	'Branch',
	'Connector',
	'GL Branch',
	'DSA',
	'',
];
export const LOAN_CREATE_BRANCH_FOR = ['Branch', 'GL Branch'];

export const CREDIT_LIMIT_SUB_SECTION = 'credit_limit_applied';
