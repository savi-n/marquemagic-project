/**
 * Channelratingpoints.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "channel_rating_points",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		channel_status: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		points_value: {
			type: "json",
			columnType: "string"
		}
	}
};
