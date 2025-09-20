/**
 * ChannelPayout.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "channel_payout",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true,
			required: true
		},
		loan_product_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		white_label_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		payout_percentage: {
			type: "number",
			columnType: "float",
			required: true
		},
		created_at: {
			type: "ref",
			columnType: "datetime",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		created_by: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		}
	}
};
