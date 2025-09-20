module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "business_shareholder",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		percentage: {
			type: "number",
			columnType: "int"
		},
		businessID: {
			type: "number",
			columnType: "int"
		},
		name: {
			type: "string",
			columnType: "varchar"
		},
		relationship: {
			type: "string",
			columnType: "text"
		},
		address: {
			type: "string",
			columnType: "text"
		},
		pincode: {
			type: "string",
			columnType: "varchar"
		},
		createdTime: {
			type: "ref",
			columnType: "datetime"
		},
		updatedTime: {
			type: "string",
			columnType: "TEXT"
		}
	}
};
