/**
 * Worktype.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "work_type",
	attributes: {
		id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		}
	}
};
