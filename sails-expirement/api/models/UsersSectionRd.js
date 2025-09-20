/**
 * ApprovalLogs.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "users_section",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		user_id: {
			type: "number",
			columnType: "bigint"
		},
		section_ref: {
			type: "string",
			columnType: "varchar"
		},
		created_at: {
			type: "ref",
			columnType: "datetime",
			autoCreatedAt: true
		},
		classification_type : {
			type: "string",
			columnType: "enum",
			isIn : ["branch","zone"],
			defaultsTo : "branch"
		}
	}
};
