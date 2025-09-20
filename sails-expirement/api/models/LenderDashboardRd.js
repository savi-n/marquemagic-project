/**
 * LenderDashboard.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "lender_dashboard",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "bank_id",
			isInteger: true
		},
		white_label_id: {
			type: "string",
			columnType: "varchar"
		},
		category: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		loan_month: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			columnName: "loanMonth",
			allowNull: true
		},
		loan_year: {
			type: "number",
			columnType: "BIGINT",
			columnName: "loanYear",
			allowNull: true
		},
		count: {
			type: "number",
			columnType: "BIGINT"
		},
		amount: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		average_value: {
			type: "number",
			columnType: "float",
			columnName: "avg_value",
			allowNull: true
		}
	}
};
