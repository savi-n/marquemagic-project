module.exports = {
    datastore: "mysql_namastecredit_read",
    tableName: "task_master",
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            isInteger: true,
            columnName: "task_id"
        },
        task_cat_id: {
            type: "number",
            columnType: "int",
            required: true
        },
        taskname: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            required: true
        },
        task_details: {
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
        usertype: {
            type: "string",
            columnType: "varchar",
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
