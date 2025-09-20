module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "poa_details",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			isInteger: true
		},
		principal: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		principal_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		poa_holder_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 50
		},
		principal_relationship_with_poa: {
			type: "string",
			columnType: "varchar",
			maxLength: 150,
			allowNull: true
		},
		customer_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			defaultsTo: "1"
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		}
	}
};
