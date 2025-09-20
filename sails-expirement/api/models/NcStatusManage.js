/**
 * NcStatusManage.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "nc_status_manage",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "nc_status_id",
			isInteger: true,
			required: true
		},
		name: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		status1: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		status2: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		status3: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		status4: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		status5: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		status6: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 45
		},
		parent_flag: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 0
		},
		parent_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		status: {
			type: "string",
			columnType: "varchar",
			maxLength: 45
		},
		execulded_users: {
			type: "string",
			columnType: "varchar",
			maxLength: 200,
			required: true
		},
		sort_by_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		exclude_user_ncdoc: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		caption: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		lender_status: {
			type: "string",
			columnType: "varchar",
			maxLength: 99,
			allowNull: true
		},
		uw_doc_status: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		dashboard_status : {
			type: "string",
			columnType: "longtext",
			allowNull: true
		}
	}
};
