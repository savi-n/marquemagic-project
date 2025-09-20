/**
 * EligibilityRules.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "eligibility_rules",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			isInteger: true
		},
		question_id: {
			type: "number",
			columnType: "int",
			columnName: "q_id"
		},
		rule: {
			type: "string",
			columnType: "text"
		},
		lender_id: {
			type: "number",
			columnType: "int"
		},
		product_id: {
			type: "number",
			columnType: "int",
			columnName: "product_id"
		},
		rule_type: {
			type: "string",
			columnType: "enum",
			isIn: ["input", "output"]
		},
		map_questions: {
			type: "string",
			columnType: "text"
		},
		created_at: {
			type: "ref",
			columnType: "timestamp"
		},
		updated_at: {
			type: "ref",
			columnType: "timestamp"
		},
		status : {
			type: "string",
			columnType: "enum",
			isIn: ['active', 'inactive']
		}
	}
};
