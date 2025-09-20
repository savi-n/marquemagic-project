module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "request_manager",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			isInteger: true
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		white_label_id: {
			type: "number",
			columnType: "int",
			required: true
		},
		request_start_time: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		request_end_time: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		requested_by: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["Requested", "Success", "Failed"]
		},
		request_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		reference_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		reference_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		json_value: {
			type: "string",
			columnType: "text"
		},
		error_msg: {
			type: "string",
			columnType: "text"
		},
        request_origin : {
           type: "string",
			columnType: "varchar",
			maxLength: 255
        }

	}
};
