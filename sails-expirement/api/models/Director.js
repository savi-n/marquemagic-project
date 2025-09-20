/**
 * Director.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "director",
	attributes: {
		//  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
		//  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
		//  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

		//  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
		//  ║╣ ║║║╠╩╗║╣  ║║╚═╗
		//  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

		//  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		//  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
		//  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "did",
			isInteger: true
		},
		// bid: {
		//   type: 'number',
		//   columnType: 'int',
		//   isInteger: true,
		//   required: true
		// },
		business: {
			model: "business",
			columnName: "bid"
		},
		dfirstname: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		dlastname: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		dpancard: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		ddob: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		gender: {
			type: "string",
			columnType: "enum",
			isIn: ["Male", "Female", "Not Specified", "Third Gender"],
			allowNull: true
		},
		// profession_id: {
		//   type: 'number',
		//   columnType: 'int',
		//   allowNull: true
		// },
		profession: {
			model: "profession",
			columnName: "profession_id"
		},
		demail: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		dcontact: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		isApplicant: {
			type: "number",
			columnType: "int"
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
		address3: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		address4: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		locality: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
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
		pincode: {
			type: "string",
			columnType: "varchar",
			maxLength: 6,
			allowNull: true
		},
		dno: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		Ownershippercentage: {
			type: "number",
			columnType: "float",
			allowNull: true
		},
		promoteyear: {
			type: "number",
			columnType: "tinyint",
			allowNull: true
		},
		business_started: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		edu_director: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		about_promoters: {
			type: "string",
			columnType: "text",
			allowNull: true
		},
		status: {
			type: "string",
			columnType: "enum",
			isIn: ["active", "inactive", "deleted"],
			defaultsTo: "active"
		},
		ints: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		daadhaar: {
			type: "string",
			columnType: "varchar",
			maxLength: 15,
			allowNull: true
		},
		dpassport: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		dvoterid: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		ddlNumber: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		ddocname: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		permanent_ddocname: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		dcibil_score: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		professionId: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
		ddin_no: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		associated_companies: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		director_truecaller_info: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		google_search_data: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		encrypted_data: {
			type: "string",
			columnType: "blob",
			allowNull: true
		},
		cibil_remarks: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		type_name: {
			type: "string",
			columnType: "enum",
			isIn: ["Applicant", "Co-applicant", "Director", "Partner", "Guarantor", "Trustee", "Member", "Proprietor", "Business"],
			defaultsTo: "Director"
		},
		crime_check: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			defaultsTo: "No"
		},
		customer_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		income_type: {
			type: "string",
			columnType: "enum",
			isIn: ["NULL", "salaried", "business", "noIncome"],
			defaultsTo: "NULL"
		},
		residence_status: {
			type: "string",
			columnType: "enum",
			isIn: [
				"NULL",
				"Resident",
				"Resident and Ordinarily Resident",
				"Resident but Not Ordinarily Resident",
				"Non-Resident",
				"PIO",
				"Foreign National"
			],
			defaultsTo: "NULL"
		},
		country_residence: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		marital_status: {
			type: "string",
			columnType: "enum",
			isIn: ["NULL", "Single", "Married", "Widowed", "Divorced", "Separated", "Others", "Widow/Widower", "Unmarried/Single"],
			defaultsTo: "NULL"
		},
		applicant_relationship: {
			type: "string",
			columnType: "enum",
			isIn: ["Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Business Partner", "Mother in Law", "Son in Law", "Applicant", "Co-Applicant", "Shareholder", "Co-Applicant Guarantor", "Co-Obligant", "Proprietor", "Director", "Sister in Law", "Father in Law", "Daughter in Law"],
			allowNull: true
		},
		father_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		mother_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		customer_picture: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		spouse_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		existing_customer: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			defaultsTo: "No"
		},
		permanent_address1: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		permanent_address2: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		permanent_city: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		permanent_state: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		permanent_pincode: {
			type: "string",
			columnType: "varchar",
			maxLength: 6,
			allowNull: true
		},
		permanent_locality: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		upi_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		residential_stability: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		residential_type: {
			type: "string",
			columnType: "enum",
			isIn: ["owned", "rented", "Owned", "Rented", "Family", "Renter", "Employer", "Others", "Leased", "Govt quarters / Company Provided", "Parents Owned", "Spouse Owned", "Co-owned", "Self-owned", "Rental"]
		},
		permanent_residential_stability: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		permanent_residential_type: {
			type: "string",
			columnType: "enum",
			isIn: ["owned", "rented", "Owned", "Rented", "Family", "Renter", "Employer", "Others", "Leased", "Govt quarters / Company Provided", "Parents Owned", "Spouse Owned", "Co-owned", "Self-owned", "Rental"]
		},
		middle_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		dcontact2: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		dcontact3: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		father_title: {
			type: "string",
			columnType: "enum",
			isIn: ["Mr", "Mx"],
			allowNull: true
		},
		father_middle_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		father_last_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		mother_title: {
			type: "string",
			columnType: "enum",
			isIn: ["Miss", "Mrs", "Ms", "Mx", "Mr", "Dr"],
			allowNull: true
		},
		mother_middle_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		mother_last_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		spouse_title: {
			type: "string",
			columnType: "enum",
			isIn: ["Miss", "Mrs", "Ms", "Mr", "Mx"],
			allowNull: true
		},
		spouse_middle_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		spouse_last_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		ckyc_no: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		no_of_dependents: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		no_of_working_members: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		passport_no: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		religion: {
			type: "string",
			columnType: "enum",
			isIn: ["Christian", "Hindu", "Muslim", "Sikh", "Zoroastrian", "Buddhist", "Others"],
			allowNull: true
		},
		religion_others: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		category: {
			type: "string",
			columnType: "enum",
			isIn: ["General", "OBC", "SC", "ST", "Others", "Minority"],
			allowNull: true
		},
		category_others: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		address_proof_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		address_type: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		permanent_address_proof_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		permanent_address_type: {
			type: "string",
			columnType: "varchar",
			allowNull: true
		},
		title: {
			type: "string",
			columnType: "enum",
			isIn: ["Miss", "Mrs", "Ms", "Mr", "Mx", "Dr", "Others"],
			allowNull: true
		},
		job_type: {
			type: "string",
			columnType: "enum",
			isIn: ["Professional", "Others"],
			allowNull: true
		},
		job_title: {
			type: "string",
			columnType: "enum",
			isIn: ["CA", "Doctor", "Engineer", "Architect", "Advocate", "Others"],
			allowNull: true
		},
		others_info: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		illness: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "No"],
			allowNull: true
		},
		tel_r: {
			type: "string",
			columnType: "varchar",
			maxLength: 15,
			allowNull: true
		},
		country: {
			type: "string",
			columnType: "varchar",
			maxLength: 30,
			allowNull: true
		},
		permanent_address_country: {
			type: "string",
			columnType: "varchar",
			maxLength: 30,
			allowNull: true
		},
		years_at_current_city: {
			type: "string",
			columnType: "varchar",
			maxLength: 20,
			allowNull: true
		},
		permanent_address_years_at_current_city: {
			type: "string",
			columnType: "varchar",
			maxLength: 20
		},
		additional_cust_id: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		additional_code: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		individual_risk: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		nationality: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		district: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		permanent_district: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		udyam_number: {
			type: "string",
			columnType: "varchar",
			maxLength: 45,
			allowNull: true
		},
		udyam_registered: {
			type: "string",
			columnType: "enum",
			isIn: ["Yes", "Waiver"],
			allowNull: true
		},
		udyam_response: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		}
	}
};
