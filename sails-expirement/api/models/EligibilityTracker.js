/**
 * EligibilityTracker.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "eligibility_tracker",
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
			columnName: "question_id"
		},
		eligibility_id: {
			type: "number",
			columnType: "int",
			columnName: "eligibility_id"
		},
		product_id: {
			type: "number",
			columnType: "int",
			columnName: "product_id"
		},
		// template_id: {
		//   type: 'number',
		//   columnType: 'int',
		//   columnName: 'template_id'
		// },
		answer: {
			type: "string",
			columnType: "text"
		},
		user_id: {
			type: "number",
			columnType: "int"
		},
		white_label_id: {
			type: "number",
			columnType: "int"
		},
		inserted_at: {
			type: "ref",
			columnType: "timestamp"
		},
		updated_at: {
			type: "ref",
			columnType: "timestamp"
		}
	}
};
