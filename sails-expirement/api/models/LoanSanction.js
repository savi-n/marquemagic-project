/**
 * LoanSanction.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "loan_sanction",
	attributes: {
		id: {
			type: "number",
			columnType: "int",
			autoIncrement: true,
			isInteger: true
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		loan_bank_mapping: {
			columnName: "loan_bank_map_id",
			model: "loanbankmapping",
		},
		san_amount: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		san_interest: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		san_date: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		userid: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		upload_path: {
			type: "string",
			columnType: "text"
		},
		loan_repay: {
			type: "string",
			columnType: "text"
		},
		channel_invoice: {
			type: "string",
			columnType: "text"
		},
		amount_um: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		sanction_process_fee: {
			type: "string",
			columnType: "varchar",
			maxLength: 12
		},
		created_at: {
			type: "ref",
			columnName: "ints",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		updated_at: {
			type: "ref",
			columnName: "update_time",
			columnType: "datetime",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		status: {
			type: "number",
			columnType: "int",
			isInteger: true
		},

		//  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		//  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
		//  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
		disbursement_loan: {
			collection: "loandisbursement",
			via: "loan_sanction_id"
		},
		sanction_status: {
			type: "string",
			columnType: "enum",
			isIn: ["Final Sanction", "Provisional Sanction", "In-Principle Sanction", "Reports Generated", "Rejected"],
			defaultsTo: "Final Sanction"
		},
		fee1: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		fee2: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		fee3: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		fee4: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
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
		fee5: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		fee6: {
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
		insurance_company7: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		fee7: {
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
		fee8: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
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
		san_emi: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		san_term: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		validity: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		expected_time_to_disburse: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		sanction_condition: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		fee_deductible: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		total_fees: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		processing_fee_percent: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		sanction_additional_data: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		}
	}
};
