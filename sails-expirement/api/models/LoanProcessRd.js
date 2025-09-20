module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "loan_process",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			isInteger: true
		},
		user_id: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: true
		},
		loan: {
			columnName: "loan_id",
			model: "Loanrequestrd"
		},
		bid: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: true
		},
		loanReject_count: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		emiBounce_count: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		unsecuredLoan_count: {
			type: "number",
			columnType: "bigint",
			isInteger: true
		},
		GST_check: {
			type: "string",
			columnType: "enum",
			isIn: ["1", "0"],
			defaultsTo: "0"
		},
		CIBIL_check: {
			type: "string",
			columnType: "enum",
			isIn: ["1", "0"],
			defaultsTo: "0"
		},
		createdUserId: {
			type: "number",
			columnType: "bigint",
			isInteger: true
		},
		created_on: {
			type: "ref",
			columnType: "datetime"
		},
		modifiedUserId: {
			type: "number",
			columnType: "bigint",
			isInteger: true
		},
		modified_on: {
			type: "ref",
			columnType: "datetime"
		}
	}
};
