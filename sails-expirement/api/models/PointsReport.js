/**
 * PointsReport.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "points_report",
	attributes: {
		id: {
			type: "string",
			autoIncrement: true,
			columnType: "varchar",
			columnName: "userid"
			//   required: true
		},
		white_label_id: {
			type: "string",
			unique: true,
			required: true
			// allowNull: true
		},
		app_month: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		login_count: {
			type: "number",
			columnType: "bigint",
			allowNull: true
		},
		contacts: {
			type: "number",
			columnType: "bigint",
			allowNull: true
		},
		app_count: {
			type: "number",
			columnType: "bigint",
			allowNull: true
		},
		lenderassign: {
			type: "number",
			columnType: "bigint",
			allowNull: true
		},
		lenderoffer: {
			type: "number",
			columnType: "bigint",
			allowNull: true
		},
		disburs: {
			type: "number",
			columnType: "bigint",
			allowNull: true
		},
		doc_upload: {
			type: "number",
			columnType: "bigint",
			allowNull: true
		},
		type: {
			type: "string",
			columnType: "varchar"
		}
	}
};
