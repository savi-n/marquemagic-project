/**
 * LoanDocument.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit",
	tableName: "loan_document",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "doc_id",
			isInteger: true
		},
		loan: {
			model: "loanrequest",
			columnName: "loan_id"
		},
		business_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		user_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		doctype: {
			model: "doctype",
			columnName: "doc_type_id"
		},
		doc_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 200,
			required: true
		},
		uploaded_doc_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		original_doc_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["active", "inactive", "deleted", "rejected", "increased_tat"],
			defaultsTo: "active"
		},
		osv_doc: {
			type: "string",
			columnType: "enum",
			isIn: ["yes", "no"],
			defaultsTo: "no"
		},
		ints: {
			type: "ref",
			columnType: "datetime",
			maxLength: 255,
			required: true
		},
		on_upd: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		no_of_pages: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		json_extraction: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		size: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		document_comments: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		image_quality_json_file: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		mis_group_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		upload_method_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			defaultsTo: "web"
		},
		document_password: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		json_extraction_update: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		bank_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		account_no: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		directorId: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		uploaded_by: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		deleted_by: {
			type: "number",
			columnType: "int",
			defaultsTo: 0
		},
		is_delete_not_allowed: {
			type: "string",
			columnType: "enum",
			columnName: "document_delete",
			isIn: ["true", "false"],
			defaultsTo: "false"
		},
		rejected_by: {
			type: "string",
			columnType: "varchar",
			defaultsTo: ""
		},
		document_status: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		parent_doc_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		}

	}
};
