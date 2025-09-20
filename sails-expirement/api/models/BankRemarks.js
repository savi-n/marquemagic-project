module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "bank_remarks",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		remark_type: {
			type: "string",
			columnType: "varchar",
			required: true
		},
		type: {
			type: "string",
			columnType: "enum",
			isIn: ["Bank", "ITR"],
			defaultsTo: "Bank"
		}
	}
};
