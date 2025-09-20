module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "task_comments",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		comment: {
			type: "string",
			columnType: "text",
			required: true
		},
		task_id: {
			type: "number",
			columnType: "int",
			required: true
		},
		commenter_id: {
			type: "number",
			columnType: "int",
			required: true
		},
		created_time: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		notification: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		errors: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: null
		}
	}
};
