/**
 * Profession.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "profession",
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
			maxLength: 100,
			required: true
		},
		details: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			required: true
		}
	}
};
