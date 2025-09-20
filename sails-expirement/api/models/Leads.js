module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "leads",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
			// required: true
		},
		name: {
			type: "string",
			columnType: "varchar",
			maxLength: 200
		},
		address: {
			type: "string",
			columnType: "text"
		},
		phone: {
			type: "string",
			columnType: "varchar",
			maxLength: 18
		},
		city: {
			type: "string",
			columnType: "varchar",
			maxLength: 200
		},
		search_text: {
			type: "string",
			columnType: "varchar",
			maxLength: 200
		},
		type: {
			type: "number",
			columnType: "int",
			defaultsTo: 1
		},
		lead_status_id: {
			type: "number",
			columnType: "int",
			defaultsTo: 1
		},
		lead_category: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		originator: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		assignee: {
			type: "number",
			columnType: "int"
		},
		created_time: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		updated_time: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMPCURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
		},
		updated_user: {
			type: "number",
			columnType: "int"
		},
		true_caller_verified: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		true_caller_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		email: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		true_caller_location: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		white_label_id: {
			type: "number",
			columnType: "int",
			required: true
		},

		source: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		channel_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		notification_purpose: {
			type: "number",
			columnType: "int"
		},
		notification_flag: {
			type: "string",
			columnType: "enum",
			isIn: ["yes", "no"],
			defaultsTo: "no"
		},
		note: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		origin: {
			type: "string",
			columnType: "text"
		},
		channel_user: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		userid: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		panNo: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		equifax_json: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		onboarding_count: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		equifax_score: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		branch_id: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		customer_id: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		s3_doc_name: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		aadhaar : {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		loan_id : {
			type: "number",
			columnType: "bigint",
			defaultsTo : 0
		},
		other_data : {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		product_name : {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		loan_amount : {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		comment : {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		zone_id : {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		}
	}
};

