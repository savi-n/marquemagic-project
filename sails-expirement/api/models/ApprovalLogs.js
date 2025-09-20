/**
 * ApprovalLogs.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "approval_logs",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		reference_id: {
			type: "number",
			columnType: "bigint"
		},
		reference_type: {
			type: "string",
			columnType: "varchar"
		},
		user_id: {
			// type: "number",
			// columnType: "bigint"
			model: "usersrd",
			columnName: "user_id"
		},
		created_at: {
			type: "ref",
			columnType: "datetime",
			autoCreatedAt: true
		},
		updated_at: {
			type: "ref",
			columnType: "datetime",
			autoUpdatedAt: true
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["approved", "pending", "rejected", "reassigned", "action taken", "recommend", "declined"],
			defaultsTo: "pending"
		},
		comments: {
			type: "string",
			columnType: "text"
		},
		roi: {
			type: "number",
			columnType: "double"
		},
		nc_status: {
			type: "string",
			columnType: "varchar"
		},
		type: {
			type: "string",
			columnType: "enum",
			isIn: [
				"Sanction Limit",
				"Sanction Terms and Conditions",
				"Deviation Flow",
				"Crisil Report Approval",
				"Document Approval",
				"Disbursement Approval"
			]
		}
	}
};
