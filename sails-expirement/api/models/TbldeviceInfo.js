/*Android team to store device token information */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "tbldevice_info",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		userid: {
			type: "string",
			columnType: "varchar",
			maxLength: 20,
			required: true
		},
		device_token: {
			type: "string",
			columnType: "longtext",
			required: true
		},
		app_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 5
			//required: true
		},
		login_token: {
			type: "string",
			columnType: "longtext",
			required: true
		},
		time_stamp: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		request_time: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		}
	}
};
