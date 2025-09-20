/**
 * LenderDocument.js.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "lender_document",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "loanbankdoc_id",
			isInteger: true
		},
		ref_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		loan_bank_mapping: {
			columnName: "loan_bank_mapping_id",
			model: "loanbankmapping"
		},
		loan: {
			model: "loanrequest",
			columnName: "loan_id"
		},
		user_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		doc_type: {
			model: "doctype",
			columnName: "doc_type_id"
		},
		doc_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			required: true
		},
		uploaded_doc_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			required: true
		},
		original_doc_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["active", "inactive", "deleted"],
			required: true
		},
		ints: {
			type: "ref",
			columnType: "datetime",
			required: true
		},
		on_upd: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		size_of_file: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		uploaded_by: {
			type: "number",
			columnType: "int",
			defaultsTo: 0,
			allowNull: true
		},
		directorId: {
			type: "integer",
			columnType: "int",
			columnName: "director_id"
		},
		uploaded_doc_ref_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		upload_method_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			defaultsTo: "web"
		}
	}
};
