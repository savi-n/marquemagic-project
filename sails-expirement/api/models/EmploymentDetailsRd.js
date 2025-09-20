/**
 * EmploymentDetailsRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "Employment_Details",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		employment_category: {
			type: "string",
			columnType: "enum",
			isIn: [
				"Salaried",
				"Business",
				"Professional",
				"Salaried + Self-Employed",
				"Not Employed",
				"Retired",
				"Home Maker",
				"Student",
				"Others",
				"Retired-Pensionable",
				"Retired Non-Pensionable",
				"Service",
				"Government",
				"Self-Employed"
			],
			allowNull: true
		},
		organization_type: {
			type: "string",
			columnType: "enum",
			isIn: [
				"Central/State Government",
				"Public Sector Unit",
				"Public Limited",
				"Private Limited",
				"Proprietorship",
				"Partnership",
				"Others",
				"CA",
				"Doctor",
				"Academicians",
				"Bureaucrat",
				"Car Dealer",
				"Financial Sector",
				"Judiciary",
				"Media",
				"Pawn Broker",
				"Real Estate",
				"Scrap Dealers",
				"Stateman",
				"Stock Brockers",
				"Virtual Currency",
				"Dealers in Art and Antiques",
				"Dealers in Arms and Armaments",
				"Entertainment Industry",
				"Professional Intermediaries",
				"Dealers in Gems",
				"Jewels and Precious Stones",
				"Engineer",
				"Advocate",
				"Individual"
			],
			allowNull: true
		},
		company_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		address1: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		address2: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		landmark: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		pincode: {
			type: "string",
			columnType: "varchar",
			maxLength: 6,
			allowNull: true
		},
		city: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		state: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		office_email: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		office_phone: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		current_designation: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		year_in_company: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		total_experience: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		director_id: {
			type: "number",
			columnType: "int"
		},
		created_at: {
			type: "ref",
			columnType: "timestamp"
		},
		updated_at: {
			type: "ref",
			columnType: "timestamp"
		},
		employee_number: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		retirement_age: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		staff: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			allowNull: true
		},
		staff_pf: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		staff_dir_related: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			allowNull: true
		},
		staff_dir_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		industry_typeid: {
			type: "string",
			columnType: "varchar",
			maxLength: 20,
			allowNull: true
		},
		retirement_date: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		joining_date: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		business_description: {
			type: "string",
			columnType: "varchar",
			maxLength: 500,
			allowNull: true
		},
		self_family_owned: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			allowNull: true
		},
		additional_data: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		}
	}
};
