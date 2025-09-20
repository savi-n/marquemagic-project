/**
 * LoanStatusWithLender.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "loan_status_with_lender",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		status: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			required: true
		},
		display_post_offer: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 0
		},
		loan_bank_status_to_show: {
			type: "string",
			columnType: "varchar",
			maxLength: 11,
			required: true
		},
		status_to_update: {
			type: "string",
			columnType: "text",
			required: true
		},
		disbursement_status: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		lender_remarks: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
	}
};
