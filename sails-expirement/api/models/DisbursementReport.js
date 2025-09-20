/**
 * DisbursementReport.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "disbursement_report",
	attributes: {
		//  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
		//  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
		//  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

		//  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
		//  ║╣ ║║║╠╩╗║╣  ║║╚═╗
		//  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

		//  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		//  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
		//  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "userid",
			isInteger: true
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			defaultsTo: "1"
		},
		month: {
			type: "string",
			columnType: "varchar"
		},
		year: {
			type: "number",
			columnType: "int"
		},
		DisbursementCount: {
			type: "number",
			columnType: "bigint",
			columnName: "NoOfDisbursement"
		},
		Total_DisbursementAmt: {
			type: "number",
			columnType: "double",
			columnName: "MaxDisbursement_amt"
		},
		Avg: {
			type: "number",
			columnType: "double",
			columnName: "Avg_Amt"
		}
	}
};
