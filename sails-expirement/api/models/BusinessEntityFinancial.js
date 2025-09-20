/**
 * BusinessEntityFinancial.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "business_entity_financial",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		pan_number: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		entity_id: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		entity_type: {
			type: "string",
			columnType: "enum",
			isIn: ["Business", "Individual"],
			required: true
		},
		annual_pat: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		annual_turnover: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		financial_year: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		filling_date: {
			type: "string",
			columnType: "date"
		},
		original_revised: {
			type: "string",
			columnType: "enum",
			isIn: ["original", "revised"],
			defaultsTo: "original"
		},
		created_On: {
			type: "ref",
			columnType: "datetime",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		json: {
			type: "string",
			columnType: "text"
		},
		flag: {
			type: "number",
			columnType: "int"
		},
		uw_verification_status: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			defaultsTo: "Yes"
		},
		e_verification_status: {
			type: "number",
			columnType: "int"
		},
		remarks: {
			type: "string",
			columnType: "json",
			allowNull: true
		}
	}
};
