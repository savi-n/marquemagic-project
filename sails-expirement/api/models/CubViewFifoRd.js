module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "CUB_View_FIFO",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			columnName: "loanId",
			isInteger: true
		},
		loan_request_type: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		business_id: {
			model: "business",
			required: true
		},
		loan_ref_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 15
			// unique: true,
			// allowNull: true,
			// required: true
		},
		loan_amount: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		loan_amount_um: {
			type: "string",
			columnType: "enum",
			isIn: ["Lakhs", "Crores", "Thousand", "Millions"],
			allowNull: true
		},
		applied_tenure: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		assets_value: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		assets_value_um: {
			type: "string",
			columnType: "enum",
			isIn: ["Lakhs", "Crores", "Thousand", "Millions"],
			allowNull: true
		},
		annual_revenue: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		revenue_um: {
			type: "string",
			columnType: "enum",
			isIn: ["Lakhs", "Crores", "Thousand", "Millions"],
			allowNull: true
		},
		annual_op_expense: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		op_expense_um: {
			type: "string",
			columnType: "enum",
			isIn: ["Lakhs", "Crores", "Thousand", "Millions"],
			allowNull: true
		},
		cur_monthly_emi: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		loan_asset_type_id: {
			type: "number",
			columnType: "int"
		},
		loan_usage_type_id: {
			type: "number",
			columnType: "int"
		},
		loan_type_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 50
		},
		loan_rating_id: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		loan_status_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 1
		},
		loan_sub_status_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		remarks: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		remarks_val: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		assigned_uw: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		assigned_date: {
			type: "string",
			columnType: "varchar",
			maxLength: 11,
			allowNull: true
		},
		osv_doc: {
			type: "string",
			columnType: "enum",
			isIn: ["yes", "no"],
			defaultsTo: "yes"
		},
		modified_on: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		RequestDate: {
			type: "ref",
			columnType: "datetime",
			required: true
		},
		loan_summary: {
			type: "string",
			columnType: "text",
			required: true
		},
		loan_product_id: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		notification: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 0
		},
		createdUserId: {
			model: "users"
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			defaultsTo: "1"
		},
		sales_id: {
			model: "users"
		},
		loan_originator: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		loan_orginitaor: {
			model: "users"
		},
		doc_collector: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		unsecured_type: {
			model: "UnsecuredLoanAssetType"
		},
		remark_history: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		application_ref: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		document_upload: {
			type: "string",
			columnType: "enum",
			isIn: ["Done", "Pending"],
			allowNull: true
		},
		nc_status_history: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		loan_origin: {
			type: "string",
			columnType: "varchar",
			defaultsTo: "namaste_portal"
		},
		request_for_extract: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 0
		},
		notification_preapproved: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 0
		},
		notification_nc_biz_sales: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 0
		},
		b_city: {
			type: "string",
			columnType: "varchar"
		},
		// profile_request: {
		//     type: 'string',
		//     columnType: 'varchar'
		// }
		branch_id: {
			type: "number",
			columnType: "int"
		},
		case_priority: {
			type: "string",
			columnType: "varchar"
		},
		// loanrequestcol: {
		//     type: 'string',
		//     columnType: 'varchar'
		// },
		loan_bank_mapping_id: {
			type: "number",
			columnType: "bigint"
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		bank_id: {
			model: "bankmaster"
		},
		bank_emp_id: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		loan_bank_status: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		loan_borrower_status: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		offer_amnt: {
			type: "number",
			columnType: "float"
		},
		offer_amnt_um: {
			type: "string",
			columnType: "enum",
			isIn: ["Lakhs", "Crores"]
		},
		interest_rate: {
			type: "number",
			columnType: "float"
		},
		term: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		emi: {
			type: "number",
			columnType: "float"
		},
		processing_fee: {
			type: "number",
			columnType: "float"
		},
		expected_time_to_disburse: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		offer_validity: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		Remarkss: {
			type: "string",
			columnType: "tinytext"
		},
		bank_assign_date: {
			type: "ref",
			columnType: "datetime"
		},
		lender_offer_date: {
			type: "ref",
			columnType: "datetime"
		},
		borrower_acceptence_date: {
			type: "ref",
			columnType: "datetime"
		},
		meeting_flag: {
			type: "string",
			columnType: "enum",
			isIn: ["0", "1", "2"],
			defaultsTo: "0"
		},
		notification_status: {
			type: "string",
			columnType: "enum",
			isIn: ["yes", "no"],
			defaultsTo: "Yes"
		},
		lender_status: {
			columnName: "lender_status_id",
			model: "loanstatuswithlender",
			required: true
		},
		upload_doc: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		lender_ref_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			required: true
		},
		reassign_nc_comments: {
			type: "string",
			columnType: "text"
		},
		dcibil_score: {
			type: "number",
			columnType: "int"
		},
		dscr: {
			type: "number",
			columnType: "double"
		},
		pre_eligiblity: {
			type: "json",
			columnType: "string"
		},
		gross_income: {
			type: "number",
			columnType: "double"
		},
		net_monthly_income: {
			type: "number",
			columnType: "double"
		},
		product: {
			type: "string",
			columnType: "varchar"
		},
		businessname: {
			type: "string",
			columnType: "varchar"
		},
		Section_Ref: {
			type: "string",
			columnType: "varchar"
		},
		Business_Type: {
			type: "string",
			columnType: "varchar"
		},
		if_Co_Applicant: {
			type: "number",
			columnType: "int"
		},
		dscr2: {
			type: "string",
			columnType: "varchar"
		},
		income: {
			type: "string",
			columnType: "varchar"
		},
		obligations: {
			type: "string",
			columnType: "varchar"
		},
		loan_data: {
			type: "json",
			columnType: "text"
		},
		branch_name: {
			type: "string",
			columnType: "varchar"
		},
		sanctioned_amt: {
			type: "string",
			columnType: "varchar"
		},
		sanctioned_int: {
			type: "string",
			columnType: "varchar"
		},
		sanctioned_date: {
			type: "string",
			columnType: "varchar"
		},
		saved_collateral: {
			type: "string",
			columnType: "varchar"
		},
		sanctioned_amt_um: {
			type: "string",
			columnType: "varchar",
			columnName: "amount_um"
		},
		ls_updt_time: {
			type: "string",
			columnType: "timestamp",
			allowNull: true
		},
		ls_ints: {
			type: "string",
			columnType: "datetime",
			allowNull: true
		},
		ColNo: {
			type: "string",
			columnType: "varchar"
		}
	}
};
