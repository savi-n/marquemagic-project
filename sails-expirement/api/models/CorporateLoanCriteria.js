module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "corporate_loan_criteria",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			isInteger: true,
			columnName: "criteria_id",
			unique: true
		},
		userid: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: false
		},
		productid: {
			type: "number",
			columnType: "int",
			allowNull: false,
			required: true
		},
		attributeid: {
			type: "number",
			columnType: "int",
			allowNull: false,
			required: true
		},
		operatorid: {
			type: "number",
			columnType: "int",
			allowNull: false,
			required: true
		},
		value: {
			type: "string",
			columnType: "varchar",
			allowNull: false,
			required: true
		},
		delta_value: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		white_label_id: {
			type: "number",
			columnType: "int",
			allowNull: false,
			required: true
		},
		is_deleted: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: false
		}
	}
};
