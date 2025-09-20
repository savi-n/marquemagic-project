module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "loan_references",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		loan_id: {
			type: "number",
			columnType: "int"
		},
		ref_name: {
			type: "string",
			columnType: "varchar"
		},
		ref_email: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		ref_contact: {
			type: "string",
			columnType: "varchar"
		},
		ref_state: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		ref_city: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		ref_pincode: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		ref_locality: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		reference_truecaller_info: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		ints: {
			type: "ref",
			columnType: "timestamp"
		},
		ref_type: {
			type: "string",
			columnType: "enum",
			isIn: ["Business", "Relative", "Friend"],
			defaultsTo: "Friend"
		},
		address1: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		address2: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		landmark: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		}
	}
};
