module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "user_corporate_mapping",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			isInteger: true
		},
		userid: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: true
		},
		user_type: {
			type: "string",
			isIn: ["Primary", "Secondary"],
			defaultsTo: "Secondary"
		},
		created_by: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: true
		},
		created_on: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		}
	}
};
