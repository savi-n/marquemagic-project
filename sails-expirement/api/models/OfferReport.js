/**
 * OfferReport.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "offer_report",
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
		NoOfOffers: {
			type: "number",
			columnType: "bigint"
		},
		MaxOffer_amt: {
			type: "number",
			columnType: "double"
		},
		Avg_Amt: {
			type: "number",
			columnType: "double",
			columnName: "Avg_Amt"
		},
		Avg: {
			type: "number",
			columnType: "double",
			columnName: "Avg_offer"
		}
	}
};
