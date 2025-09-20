/**
 * AssetsAdditional.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "assets_additional",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true,
			unique: true
		},
		loan_id: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: true
		},
		user_id: {
			type: "number",
			columnType: "bigint",
			isInteger: true,
			required: true
		},
		account_number: {
			type: "ref",
			columnType: "bigint",
			isInteger: true
		},
		collateral_number: {
			type: "ref",
			columnType: "bigint",
			isInteger: true
		},
		initial_collateral: {
			type: "json",
			columnType: "json",
			required: true
		},
		saved_collateral: {
			type: "json",
			columnType: "json"
		},
		modified_collateral: {
			type: "json",
			columnType: "json"
		},
		created_at: {
			type: "ref",
			columnType: "datetime",
			autoCreatedAt: true
		},
		updated_at: {
			type: "ref",
			columnType: "datetime",
			autoUpdatedAt: true
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["active", "delete"],
			defaultsTo: "active"
		},
		source : {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			allowNull: true
		}
	}
};
