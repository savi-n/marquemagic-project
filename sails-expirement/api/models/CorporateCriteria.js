module.exports = {
	datastore: "mysql_namastecredit_write",
	tableName: "corporate_criteria",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			columnName: "corp_id",
			isInteger: true
		},
		payment: {
			type: "string",
			columnType: "enum",
			isIn : ["Yes", "None"]
		},
		product_id: {
		    type: "number",
		    columnType: "smallint"
		},
		userid: {
			type: "number",
		    columnType: "int",
            required: true
		},
		time_stamp: {
			type: "ref",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP"
		},
		min_score: {
			type: "number",
			columnType: "tinyint",
			allowNull: true
		},
		max_score: {
			type: "number",
			columnType: "tinyint",
			allowNull: true
		},
		addition: {
			type: "number",
			columnType: "decimal",
			allowNull: true
		}
    }
}