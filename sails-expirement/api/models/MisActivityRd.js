module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "mis_activities",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		loan_id: {
			model: "loanrequestrd"
		},
		business_id: {
			type: "number",
			columnType: "int",
			required: true
		},
		banking_analysis: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		financial_analysis: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		cibil_doc_analysis: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		gst_doc_analysis: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		kyc_doc_analysis: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		gst_verification: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		roc_data_verification: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		ca_data_verification: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		inserted_time_stamp: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		updated_time_stamp: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		inserted_by_user: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		updated_by_user: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		last_document_uploaded: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		case_completion_timestamp: {
			type: "ref",
			columnType: "timestamp"
		},
		tat: {
			type: "string",
			columnType: "varchar",
			maxLength: 11,
			allowNull: true
		},
		case_type: {
			type: "string",
			columnType: "enum",
			isIn: ["Standard", "Non-Standard"],
			allowNull: true
		},
		is_confirmed_case: {
			type: "number",
			columnType: "tinyint",
			defaultsTo: 0
		},
		bde_started: {
			type: "ref",
			columnType: "datetime"
		},
		bde_end: {
			type: "ref",
			columnType: "datetime"
		},
		onboarding_track: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		deviation_status: {
			type: "string",
			columnType: "varchar",
			maxLength: 55,
			allowNull: true
		}
	}
};
