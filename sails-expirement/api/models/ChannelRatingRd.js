module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "channel_rating",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		channel_id: {
			type: "number",
			columnType: "int"
		},
		channel_rating: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		application_count: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		lender_assign_count: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		disbursed_count: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		application_points: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		lender_assign_points: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		disbursed_points: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		application_amount: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		lender_assign_amount: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		application_disbursed_amount: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		disbursed_volume_points: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		rating_type: {
			model: "channelratingreferencerd"
		},
		total_llc_confirmed: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		created_On: {
			type: "ref",
			columnType: "datetime"
		},
		updated_On: {
			type: "ref",
			columnType: "datetime",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		recency_points: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		recency_count: {
			type: "number",
			columnType: "int",
			allowNull: true
		}
	}
};
