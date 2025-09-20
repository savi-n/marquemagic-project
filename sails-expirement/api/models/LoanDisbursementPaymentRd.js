/**
 * LoanDisbursementPayment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "loan_disbursement_payment",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		disbursement_id: {
			type: "number",
			columnType: "int",
			required: true
		},
		payment_mode: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		sub_payment_mode: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		payment_amt: {
			type: "number",
			columnType: "decimal(10,2)",
			allowNull: true
		},
		payment_comments: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		ints: {
			columnName: "ints",
			type: "ref",
			columnType: "datetime",
			required : true
		},
		upts: {
			columnName: "upts",
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		bank_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		status : {
			type : "string",
			columnType : "enum",
			isIn : ["active", "deleted"],
			defaultsTo : "active"
		}
	}
};