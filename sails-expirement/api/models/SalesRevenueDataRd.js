/**
 * SalesRevenueData.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "sales_dashboard_revenue",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "bigint",
			columnName: "disbursementId",
			isInteger: true
		},
		userid: {
			type: "number",
			columnType: "bigint",
			isInteger: true
		},
		NCID: {
			type: "string",
			columnType: "varchar",
			maxLength: 36,
			allowNull: true
		},
		LenderPayoutPercentage: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			allowNull: true
		},
		// Lender_NetPayout: {
		//   type: "string",
		//   columnType: "varchar",
		//   maxLength: 255,
		//   allowNull: true
		// },
		LenderPayout_Tax: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			allowNull: true
		},
		LenderPayout_tds: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		LenderPayout: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			allowNull: true
		},
		channel_payout_percentage: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			allowNull: true
		},
		NC_Revenue: {
			type: "number",
			columnType: "double",
			allowNull: true
		}
	}
};
