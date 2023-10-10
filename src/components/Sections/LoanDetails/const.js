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
export const DISABLE_BRANCH_FIELD_FOR = ['Branch', 'Connector', 'GL Branch'];
export const LOAN_CREATE_BRANCH_FOR = ['Branch', 'GL Branch'];

export const selectedSection = {
	name: 'Loan Details',
	id: 'loan_details',
	validate_loan_amount: true,
	hide_section_usertype: ['Technical'],
	sub_sections: [
		{
			id: 'loan_details',
			name: 'Loan Details',
			fields: [
				{
					name: 'loan_amount',
					placeholder: 'Required Loan Amount e.g.,10,000',
					db_key: 'loan_amount',
					rules: {
						required: true,
					},
					type: 'number',
					visibility: true,
					inrupees: true,
					mask: {
						number_only: true,
						character_limit: 10,
					},
				},
				{
					name: 'tenure',
					rules: {},
					placeholder: 'Tenure',
					db_key: 'applied_tenure',
					type: 'select',
					mask: {},
					visibility: true,
					specific_options_for: 'loan_amount',
					specific_options: [
						{
							min: 200000,
							max: 20000000,
							options: [
								{
									value: '156',
									name: '156',
								},
								{
									value: '104',
									name: '104',
								},
							],
						},
						{
							min: 0,
							max: 200000,
							options: [
								{
									value: '104',
									name: '104',
								},
							],
						},
					],
					options: [
						{
							value: '104',
							name: '104',
						},
						{
							value: '156',
							name: '156',
						},
					],
					sub_fields: [
						{
							name: 'tenure_um',
							placeholder: 'Tenure',
							type: 'text',
							db_key: 'tenure_um',
							rules: {},
							options: [
								{
									name: 'days',
									value: 'days',
								},
							],
							value: 'days',
							disabled: true,
							isbuttonfilled: false,
						},
					],
				},
				{
					name: 'loan_type_id',
					placeholder: 'Purpose of the loan',
					db_key: 'loan_type_id',
					rules: {
						required: false,
					},
					type: 'select',
					options: [
						{
							name: 'Working Capital',
							value: 10,
						},
						{
							name: 'Business Improvement',
							value: 60,
						},
					],
					visibility: false,
				},
				{
					name: 'loan_usage_type_id',
					placeholder: ' Programs',
					db_key: 'loan_usage_type_id',
					rules: {
						required: false,
					},
					type: 'select',
					options: [
						{
							name: 'Assessment based',
							value: 40,
						},
					],
					value: '40',
					visibility: false,
				},
			],
		},
		{
			id: 'source_details',
			name: 'Help us with Source Details',
			fields: [
				{
					name: 'loan_source',
					db_key: 'loan_origin',
					placeholder: 'Loan Source',
					rules: {},
					options: [
						{
							name: 'Processing Centre',
							value: 'Branch',
						},
						{
							name: 'Connector',
							value: 'Connector',
						},
						{
							name: 'GL Branch',
							value: 'GL Branch',
						},
					],
					type: 'select',
					value: 'Branch',
					visibility: true,
				},
				{
					name: 'branch',
					type: 'select',
					db_key: 'branch_id',
					disable_3_character_search: true,
					placeholder: 'Loan origination Branch',
					visibility: true,
					rules: {},
					disabled: true,
					options: [],
				},
				{
					name: 'connector_name',
					db_key: 'businessname',
					placeholder: 'Connector Name',
					for_type_name: 'loan_source',
					for_type: ['Connector'],
					rules: {},
					options: [{}],
					type: 'search',
					visibility: true,
				},
				{
					name: 'connector_code',
					db_key: 'connector_user_id',
					placeholder: 'Connector Code',
					for_type_name: 'loan_source',
					for_type: ['Connector'],
					rules: {
						required: true,
					},
					type: 'text',
					visibility: true,
				},
				{
					name: 'branch_name',
					db_key: 'branch_name',
					placeholder: 'Branch Name',
					for_type_name: 'loan_source',
					for_type: ['GL Branch'],
					rules: {
						required: true,
					},
					options: [{}],
					type: 'text',
					visibility: true,
				},
				{
					name: 'employee_name',
					db_key: 'employee_name',
					placeholder: 'Ref Employee Name',
					for_type_name: 'loan_source',
					for_type: ['GL Branch'],
					rules: {
						required: true,
					},
					options: [{}],
					type: 'text',
					visibility: true,
				},
				{
					name: 'employee_id',
					db_key: 'employee_id',
					placeholder: 'Ref Employee ID',
					for_type_name: 'loan_source',
					for_type: ['GL Branch'],
					rules: {
						required: true,
					},
					options: [{}],
					type: 'text',
					visibility: true,
				},
				{
					name: 'designation',
					db_key: 'designation',
					placeholder: 'Ref Designation',
					for_type_name: 'loan_source',
					for_type: ['GL Branch'],
					rules: {
						required: true,
					},
					options: [{}],
					type: 'text',
					visibility: true,
				},
				{
					name: 'fdglcode',
					db_key: 'fdglcode',
					placeholder: 'Ref FDGL Code',
					for_type_name: 'loan_source',
					for_type: ['GL Branch'],
					rules: {
						required: true,
					},
					options: [{}],
					type: 'text',
					visibility: true,
				},
			],
		},
		{
			id: 'imd_details',
			name: 'Help us with IMD Details',
			fields: [
				{
					name: 'imd_collected',
					db_key: 'imd_collected',
					placeholder: 'IMD Collected',
					rules: {},
					options: [
						{
							name: 'Yes',
							value: 'Yes',
						},
						{
							name: 'No',
							value: 'No',
						},
					],
					type: 'select',
					value: 'No',
					visibility: true,
				},
				{
					name: 'imd_document_proof',
					db_key: 'loan_document',
					label: 'Upload IMD Document Proof',
					for_type: ['Yes'],
					for_type_name: 'imd_collected',
					type: 'file',
					value: 'imd_doc',
					is_delete_not_allowed: true,
					min: 1,
					max: 1,
					rules: {
						required: true,
						supported_formats: ['*'],
					},
					doc_type: {
						'1': 496,
						'7': 496,
					},
					visibility: true,
				},
				{
					name: 'amount_paid',
					db_key: 'amount_paid',
					placeholder: 'Amount Paid',
					for_type: ['Yes'],
					for_type_name: 'imd_collected',
					type: 'text',
					rules: {
						required: true,
					},
					visibility: true,
					inrupees: true,
				},
				{
					name: 'mode_of_payment',
					db_key: 'payment_mode',
					for_type: ['Yes'],
					for_type_name: 'imd_collected',
					placeholder: 'Mode of Payment',
					rules: {
						required: true,
					},
					options: [
						{
							name: 'Bank Transfer',
							value: 'Bank Transfer',
						},
						{
							name: 'Cheque',
							value: 'Cheque',
						},
						{
							name: 'Cash',
							value: 'Cash',
						},
						{
							name: 'UPI',
							value: 'UPI',
						},
						{
							name: 'DD',
							value: 'DD',
						},
					],
					type: 'select',
					visibility: true,
				},
				{
					name: 'transaction_reference',
					db_key: 'transaction_reference',
					placeholder: 'Transaction Reference',
					for_type: ['Yes'],
					for_type_name: 'imd_collected',
					type: 'text',
					rules: {
						required: true,
					},
					visibility: true,
				},
				{
					name: 'imd_paid_by',
					db_key: 'imd_paid_by',
					for_type: ['Yes'],
					for_type_name: 'imd_collected',
					placeholder: 'IMD Paid By',
					rules: {
						required: true,
					},
					options: [
						{
							name: 'Others',
							value: 'Others',
						},
					],
					type: 'select',
					visibility: true,
				},
				{
					name: 'account_holder_name',
					db_key: 'account_holder_name',
					for_type: ['Others'],
					for_type_name: 'imd_paid_by',
					placeholder: 'Account Holder Name',
					rules: {
						required: true,
					},
					type: 'text',
					visibility: true,
				},
			],
		},
	],
};
