/**
 * LoanDocumentDetails.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
	datastore: "mysql_namastecredit",
	tableName: "document_details",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		doc_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		aid: {
			type: "string",
			columnType: "enum",
			isIn: ["1", "2"],
			defaultsTo: "1"
		},
		classification_type: {
			type: "string",
			columnType: "enum",
			isIn: ["aadhaar", "voter", "passport", "dl", "pan"],
			allowNull: true
		},
		classification_sub_type: {
			type: "string",
			columnType: "enum",
			isIn: ["F", "B", "F&B"],
			allowNull: true
		},
		did: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		ints: {
			type: "ref",
			columnType: "datetime",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		upts: {
			type: "ref",
			columnType: "datetime",
			defaultsTo: "ON UPDATE CURRENT_TIMESTAMP"
		},
		old_doc_type_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		verification_status: {
			type: "string",
			columnType: "enum",
			isIn: ["re-tagged", "not-tagged", "tagged"]
		},
		ml_classification_track: {
			type: "ref",
			columnType: "json"
		},
		doc_request_type: {
			type: "string",
			columnType: "enum",
			isIn: ["loan", "lender"],
			defaultsTo: "loan"
		}
	}
};
