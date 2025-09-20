/**
 * RiskMapping.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "risk_mapping",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "riskId",
			isInteger: true
		},
		entityName: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		entityType: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		GSTIN: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		phone: {
			type: "string",
			columnType: "varchar",
			maxLength: 15
		},
		PAN: {
			type: "string",
			columnType: "varchar",
			maxLength: 20
		},
		userId: {
			type: "number",
			columnType: "int"
		},
		adhar: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		white_label_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			defaultsTo: "1"
		}
	}
};
