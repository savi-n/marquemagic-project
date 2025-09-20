/**
 * EligibilityAnalytics.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "eligiblity_analytics",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true,
			columnName: "analytics_id"
		},
		product_id: {
			type: "number",
			columnType: "int"
		},
		financial_amt: {
			type: "number",
			columnType: "float"
		},
		userId: {
			type: "number",
			columnType: "int"
		},
		loanId: {
			type: "number",
			columnType: "int"
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			defaultsTo: "No"
		},
		pre_eligiblity: {
			type: "json",
			columnType: "string"
		},
		dscr: {
			type: "number",
			columnType: "double"
		},
		type :{
			type: "string",
			columnType: "enum",
			isIn: ["User", "Leads"],
			defaultsTo: "User"
		}
	}
};
