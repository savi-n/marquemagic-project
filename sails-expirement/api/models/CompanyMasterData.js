module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "company_master_data",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		CORPORATE_IDENTIFICATION_NUMBER: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		COMPANY_NAME: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		COMPANY_STATUS: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		COMPANY_CLASS: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		COMPANY_CATEGORY: {
			type: "string",
			columnType: "varchar",
			maxLength: 100
		},
		OUTPUT_JSON: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		signatory_datetime: {
			type: "ref",
			columnType: "datetime"
		},
		signatory_details_json: {
			type: "string",
			columnType: "text"
		},
		LAST_UPDATED: {
			type: "ref",
			columnType: "timestamp"
		},
		DATE_OF_LAST_BALANCE_SHEET: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			allowNull: true
		},
		DATE_OF_LAST_AGM: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			allowNull: true
		},
		EMAIL_ID: {
			type: "string",
			columnType: "varchar",
			maxLength: 50,
			allowNull: true
		},
		ROC_CHARGES: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		},
		updateRequire: {
			type: "number",
			columnType: "int",
			isInteger: true,
			defaultsTo: 1
		},
		BUSINESS_ID: {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		},
		SUB_CATEGORY: {
			type: "string",
			columnType: "varchar",
			maxLength: 60,
			allowNull: true
		},
		REGISTERED_OFFICE_ADDRESS: {
			type: "string",
			columnType: "varchar",
			maxLength: 255,
			allowNull: true
		},
		PRINCIPAL_BUSINESS_ACTIVITY: {
			type: "string",
			columnType: "varchar",
			maxLength: 40,
			allowNull: true
		},
		REGISTRAR_OF_COMPANIES: {
			type: "string",
			columnType: "varchar",
			maxLength: 40,
			allowNull: true
		},
		REGISTERED_STATE: {
			type: "string",
			columnType: "varchar",
			maxLength: 40,
			allowNull: true
		},
		DATE_OF_REGISTRATION: {
			type: "string",
			columnType: "varchar",
			maxLength: 40,
			allowNull: true
		},
		PAIDUP_CAPITAL: {
			type: "string",
			columnType: "varchar",
			maxLength: 40,
			allowNull: true
		},
		AUTHORIZED_CAPITAL: {
			type: "string",
			columnType: "varchar",
			maxLength: 25,
			allowNull: true
		}
	}
};
