/**
 * Activity.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "activitys",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		data_id: {
			type: "number",
			columnType: "float"
		},
		status: {
			type: "number",
			columnType: "int"
		},
		channel_status: {
			type: "string",
			columnType: "enum",
			isIn: ["0", "1"],
			defaultsTo: "0"
		}
	}
};
