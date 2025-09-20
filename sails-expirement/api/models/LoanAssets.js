/**
 * LoanAssets.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "loan_assets",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "assets_id",
			isInteger: true
		},
		business_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		loan_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			required: true
		},
		property_type: {
			type: "string",
			columnType: "enum",
			isIn: ["Owned", "Leased", "owned", "leased"],
			required: true
		},
		loan_asset_type_id: {
			type: "number",
			columnType: "int",
			isInteger: true
		},
		owned_type: {
			type: "string",
			columnType: "enum",
			isIn: ["Paid_Off", "Mortgage", "Leased", "Inherited", "Purchased", "Gifted", "Govt Allotted", "Other"]
		},
		address1: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		address2: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		flat_no: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		locality: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		city: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		state: {
			type: "string",
			columnType: "varchar",
			maxLength: 150
		},
		pincode: {
			type: "string",
			columnType: "varchar",
			maxLength: 6,
			allowNull: true
		},
		name_landmark: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		automobile_type: {
			type: "string",
			columnType: "varchar",
			maxLength: 25
		},
		brand_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			allowNull: true
		},
		model_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			allowNull: true
		},
		value_Vehicle: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			allowNull: true
		},
		dealership_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			allowNull: true
		},
		manufacturing_yr: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		value: {
			type: "string",
			columnType: "varchar",
			maxLength: 150,
			allowNull: true
		},
		ints: {
			type: "string",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		cersai_rec_path: {
			type: "string",
			columnType: "longtext"
		},
		survey_no: {
			type: "string",
			columnType: "varchar",
			maxLength: 30
		},
		cersai_asset_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 145
		},
		no_of_assets: {
			type: "number",
			isInteger: true
		},
		type_of_land: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		village_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		extent_of_land: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		forced_sale_value: {
			type: "number",
			columnType: "double"
		},
		sq_feet: {
			type: "number",
			columnType: "double"
		},
		insurance_required: {
			type: "string",
			columnType: "enum",
			isIn: ["YES", "NO"],
			defaultsTo: "YES"
		},
		priority: {
			type: "string",
			columnType: "enum",
			isIn: ["1st", "2nd", "Pari-Passu", "NA"],
			defaultsTo: "NA"
		},
		ec_applicable: {
			type: "string",
			columnType: "enum",
			isIn: ["YES", "NO"],
			defaultsTo: "YES"
		},
		exShowroomPrice: {
			type: "number",
			columnType: "double"
		},
		accessories: {
			type: "number",
			columnType: "double"
		},
		insurance: {
			type: "number",
			columnType: "double"
		},
		roadTax: {
			type: "number",
			columnType: "double"
		},
		loan_type: {
			type: "string",
			columnType: "text"
		},
		loan_json: {
			type: "json",
			columnType: "text"
		},
		current_occupant: {
			type: "string",
			columnType: "enum",
			isIn: ["Self-Occupied", "Mortgagor", "Other Relatives", "Tenants", "Unoccupied", "Others"]
		},
		director_id: {
			type: "number",
			columnType: "int",
			isInteger: true,
			allowNull: true
		},
		loan_security: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"]
		},
		inspection_status: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			allowNull: true
		},
		inspection_number: {
			type: "string",
			columnType: "varchar",
			maxLength: 100,
			allowNull: true
		},
		inspection_data: {
			type: "json",
			columnType: "json"
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["active", "delete"],
			defaultsTo: "active"
		}
	}
};
