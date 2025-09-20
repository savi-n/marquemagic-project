module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "business_mapping",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "businessID",
			isInteger: true
		},
		is_parent: {
			type: "string",
			columnType: "enum",
			isIn: ["yes", "no"],
			defaultsTo: "no"
		},
		parent_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		business_name: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		bank_name: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		account_number: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		relation: {
			type: "string",
			columnType: "enum",
			isIn: [
				"Subsidiary Company",
				"Associated",
				"Relative",
				"Holding Company",
				"Promoter/Proprietor",
				"Director/Partner",
				"Other Account",
				"Other Group Company"
			]
		},
		pan_number: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		}
	}
};
