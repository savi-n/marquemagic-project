/**
 * LoanRating.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "loanrating",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "rating_id",
			isInteger: true,
			required: true
		},
		rating_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			required: true
		}
	}
};
