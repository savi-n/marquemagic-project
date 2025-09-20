module.exports = {
    datastore: "mysql_namastecredit_read",
    tableName: "task_category",
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            isInteger: true,
            columnName: "category_id"
        },
        category_name: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            required: true
        },
        category_type: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            required: true
        },
        created_by: {
            type: "number",
            columnType: "int",
            required: true
        },
        modified_by: {
            type: "number",
            columnType: "int",
            required: true
        },
        category_desc: {
            type: "string",
            columnType: "text",
            required: true
        },
        created_time: {
            type: "ref",
            columnType: "timestamp",
            defaultsTo: "CURRENT_TIMESTAMP"
        },
        updated_time: {
            type: "ref",
            columnType: "timestamp",
            defaultsTo: "CURRENT_TIMESTAMP"
        },
        white_label_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        }
    }
};
