/**
 * PreferenceQuestionnaire.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "preference_questionnaire",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			columnName: "q_id",
			isInteger: true
		},
		text: {
			type: "string",
			columnType: "text",
			columnName: "question"
		},
		operation: {
			type: "number",
			columnType: "int",
			columnName: "operation_id"
		},
		usertype: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		control_type: {
			type: "string",
			columnType: "text"
		},
		flag: {
			type: "string",
			columnType: "enum",
			isIn: ["Specific", "Generic"]
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["active", "inactive", "delete"]
		},
		white_label_id: {
			type: "number",
			columnType: "int"
		},
		eligibility_flag: {
			type: "string",
			columnType: "enum",
			isIn: ["yes", "no"],
			defaultsTo: "no"
		},
		product_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		group_id: {
			type: "number",
			columnType: "int"
		},
		rule_flag: {
			type: "string",
			columnType: "enum",
			isIn: ["input_rule", "output_rule", "no_rule"]
		},
		master_data: {
			type: "string",
			columnType: "json",
			allowNull: true
		}
		//  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
		//  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
		//  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝
		//  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
		//  ║╣ ║║║╠╩╗║╣  ║║╚═╗
		//  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝
		//  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		//  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
		//  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
	}
};
