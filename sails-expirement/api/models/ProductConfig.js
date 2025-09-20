module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "product_config",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "product_config_id",
			isInteger: true
		},
		applicant_type: {
			type: "string",
			columnType: "enum",
			isIn: ["Business", "Salaried", "Both"]
		},
		product_id: {
			type: "number",
			columnType: "smallint",
			isInteger: true,
			allowNull: true
		},
		min_interest_value: {
			type: "number",
			columnType: "decimal(5,2)",
			allowNull: true
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		}
	}
};
