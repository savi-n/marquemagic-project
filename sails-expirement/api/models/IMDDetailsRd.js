/**
 * ITRDetails.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "IMD_Details",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		payment_mode: {
			type: "string",
			columnType: "enum",
			isIn: ["Bank Transfer", "Cheque", "Cash", "UPI", "DD", "Online"],
			allowNull: false
		},
		amount_paid: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: false
		},
		transaction_reference: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: false
		},
		loan_id: {
			type: "number",
			columnType: "int",
			allowNull: false
		},
		created_at: {
			type: "ref",
			columnType: "datetime",
			allowNull: false
		},
		updated_at: {
			type: "ref",
			columnType: "datetime"
		},
		imd_collected: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No", "Deferred"],
			allowNull: false
		},
		imd_paid_by: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: false
		},
		account_holder_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: false
		},
		doc_id: {
			type: "number",
			columnType: "bigint",
			allowNull: false
		},
		receipt_reference: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		receipt_autorization: {
			type: "string",
			columnType: "enum",
			isIn: ["required", "not-required", "authorized"],
			allowNull: true
		},
		additional_data: {
			type: "json",
			columnType: "json"
		}
	}
};
