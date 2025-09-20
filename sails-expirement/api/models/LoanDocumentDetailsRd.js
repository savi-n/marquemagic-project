/**
 * LoanDocumentDetails.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
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
			columnType: "bigint",
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
			isIn: ["aadhaar", "voter", "passport", "dl", "pan", "others"],
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
		lat: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		long: {
			type: "number",
			columnType: "float",
			defaultsTo: 0
		},
		request_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		lat_long_timestamp: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		doc_request_type: {
			type: "string",
			columnType: "enum",
			isIn: ["loan", "lender"],
			defaultsTo: "loan"
		},
		document_upload_status: {
			type: "string",
			columnType: "enum",
			isIn: ["Pending Approval", "Approved", "Incorrect Tag", "Rejected"],
			allowNull: false
		},
		action_by: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		other_doc_ref_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		old_doc_type_id: {
			type: "number",
			columnType: "int",
			allowNull: false
		},
		emudra_status: {
			type: "string",
			columnType: "enum",
			isIn: ['Pending', 'Initiated', 'Details Updated', 'Co-Applicant Pending', 'Withdrawn', 'Re-Initiated', 'Credit Approved', 'Complete', 'Offline'],
			allowNull: true
		},
		emudra_response: {
			type: "json",
			columnType: "json"
		},
		emudra_track: {
			type: "json",
			columnType: "json"
		},
		emudra_ref_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 20,
			allowNull: true
		},
		coordinates_for_signatures: {
			type: "json",
			columnType: "json"
		}
	}
};
