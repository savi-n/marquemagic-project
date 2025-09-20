module.exports ={
	datastore: "mysql_namastecredit_read",
	tableName: "loan_sanction_additional",
	attributes: {
		id: {
			type: "number",
			columnType: "int",
			autoIncrement: true,
			isInteger: true
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		loan_bank_mapping_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		loan_sanction_id : {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo : 0
		},
		sanction_option : {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		sanctioned_amount: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		sanctioned_asset_number: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn : ["active","inactive","deleted"],
			defaultsTo : "active"
		},
		created_at: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		updated_at: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		created_by : {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		updated_by: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo : 0
		},
		additional_data : {
			type: "string",
			columnType: "longtext",
			allowNull : true
		}
	}
};
