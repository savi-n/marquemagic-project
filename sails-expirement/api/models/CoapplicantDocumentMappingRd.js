
 module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "coapplicant_document_mapping",
	attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
		income_type_name: {
			type: "string",
			columnType: "varchar",
			maxLength: 255
		},
		income_type_id: {
			type: "number",
			columnType: "int"
		},
		white_label_id :{
			type: "number",
			columnType: "int"
		},
		doc_id_mandatory: {
			type: "string",
			columnType: "longtext",
			allowNull: true
		}
	}
};
