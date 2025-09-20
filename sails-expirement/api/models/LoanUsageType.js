/**
 * LoanUsageType.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "loanusagetype",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "typeLid",
			isInteger: true,
			required: true
		},
		typeLname: {
			type: "string",
			columnType: "varchar",
			maxLength: 250,
			required: true
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["active", "inactive", "deleted"],
			defaultsTo: "active"
		}
	}
};
