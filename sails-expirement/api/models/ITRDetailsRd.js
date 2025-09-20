/**
 * ITRDetails.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "itr_remarks",
	attributes: {
		id: {
			type: "number",
			columnType: "int",
			autoIncrement: true,
			isInteger: true
		},
		doc_id: {
			type: "number",
			columnType: "int"
		},
		uw_remarks_id: {
			model: "BankRemarksrd"
		},
		created_By: {
			type: "number",
			columnType: "int"
		},
		created_On: {
			type: "ref",
			columnType: "datetime"
		},
		loan_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		itr_remarks: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		}
	}
};
