/**
 * RouteTrack.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "route_track",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "id_route",
			isInteger: true,
			required: true
		},
		route_name: {
			type: "string",
			columnType: "text",
			required: true
		},
		mode: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 0
		}
	}
};
