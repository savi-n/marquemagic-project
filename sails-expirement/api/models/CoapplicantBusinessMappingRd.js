/**
 * CoapplicantBusinessMappingRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

	datastore: "mysql_namastecredit_read",
	tableName: "co_applicant_business_mapping",

	attributes: {

		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		parent_business_id: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: true
		},
		co_applicant_business_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			required: true
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		created_at: {
			type: "ref",
			columnType: "timestamp",
			columnName: "ins_time",
			required: true
		},
		updated_at: {
			type: "ref",
			columnType: "timestamp",
			columnName: "upd_time",
			defaultsTo: "CURRENT_TIMESTAMP"
		}
	}
};
