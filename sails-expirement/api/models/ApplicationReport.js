/**
 * ApplicationReport.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "application_report",
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
		ApplicationCount: {
			type: "number",
			columnType: "bigint",
			columnName: "ApplicatioCount"
		},
		last_Week_ApplicationCount: {
			type: "number",
			columnType: "double"
		},
		AvgPerDay: {
			type: "number",
			columnType: "double",
			columnName: "Avg"
		}
	}
};
