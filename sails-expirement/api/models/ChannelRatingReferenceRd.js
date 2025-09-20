module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "channel_rating_reference",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		min_value: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		max_value: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		rating_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			required: true
		}
	}
};
