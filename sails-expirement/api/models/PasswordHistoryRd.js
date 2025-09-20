/**
 * PasswordReport.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "password_history",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		user_id: {
			type: "number",
			columnType: "int"
		},
		password: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		created_at: {
			type: "ref",
			columnType: "datetime",
			defaultsTo: "CURRENT_TIMESTAMP"
		}
	}
};
