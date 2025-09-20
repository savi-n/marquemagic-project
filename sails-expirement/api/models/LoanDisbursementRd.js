/**
 * LoanDisbursement.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "loan_disbursement",
	attributes: {
		//  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
		//  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
		//  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
		id: {
			columnName: "disbursementId",
			type: "number",
			columnType: "int",
			autoIncrement: true,
			isInteger: true
		},
		loan_bank_mapping_id: {
			model: "loanbankmappingrd"
		},
		disbursement_amt: {
			type: "number",
			columnType: "float"
		},
		disbursement_amt_um: {
			type: "string",
			columnType: "enum",
			isIn: ["Lakhs", "Crores", "NA"],
			defaultsTo: "Lakhs"
		},
		disbursement_date: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		repayment_doc: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		channel_invoice: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		lender_confirmation: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		disbursement_amount_edit_history: {
			type: "string",
			columnType: "longtext"
		},
		created_at: {
			columnName: "ints",
			type: "ref",
			columnType: "datetime",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		updated_at: {
			columnName: "upts",
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		notification_status: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			defaultsTo: "Yes"
		},
		uploadStatus: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			defaultsTo: "Yes"
		},
		llc_status: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			defaultsTo: "Yes"
		},
		//  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
		//  ║╣ ║║║╠╩╗║╣  ║║╚═╗
		//  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
		//  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		//  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
		//  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
		loan_sanction_id: {
			model: "loansanctionrd"
		},
		channel_payout_percentage: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		lender_payout_percentage: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		LLC_updDateTime: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
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
			maxLength: 45,
			allowNull: true
		},
		payment_amt: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		bank_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		disbursement_status: {
			type: "string",
			columnType: "enum",
			isIn: ["draft", "initiated for review", "Disbursed", "sent back by ops", "Rejected", "deleted", "sent back by bpo", "initiated to bpo"],
			allowNull: true
		},
		assigned_extended_id: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		disbursement_remarks: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		disbursal_charge_fee_1: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		disbursal_charge_fee_2: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		disbursal_charge_fee_3: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		disbursal_charge_fee_4: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		type_of_disbursement: {
			type: "string",
			columnType: "enum",
			isIn: ["Single", "Multiple", "NULL"],
			allowNull: true
		},
		processing_fee: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		disbursal_charge_fee_5: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		bpi_applicable: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"]
		},
		bpi_amount: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		insurance_company1: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		insurance_company2: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		insurance_company3: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		insurance_company4: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		disbursal_charge_fee_6: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		disbursal_charge_fee_7: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		insurance_company5: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		insurance_company6: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		charge1: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		charge2: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		payment_comments: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		loan_sanction_additional_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		sanction_additional_data: {
			type: "string",
			columnType: "longtext"
		},
		insurance_company7: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		disbursal_charge_fee_8: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		insurance_company8: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		disbursal_charge_fee_9: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		}
	}
};
