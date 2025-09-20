module.exports = {
    datastore: "mysql_namastecredit_write",
    tableName: "task_user_mapping",
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            isInteger: true
        },
        taskid: {
            type: "number",
            columnType: "int",
            required: true
        },
        reference_id: {
            type: "number",
            columnType: "int",
            required: true
        },
        details: {
            type: "string",
            columnType: "text",
            required: true
        },
        creator_id: {
            type: "number",
            columnType: "int",
            required: true
        },
        assign_userid: {
            type: "number",
            columnType: "int",
            required: true
        },
        status: {
            type: "string",
            columnType: "enum",
            isIn: ["open", "close", "reopen", "cancel", "sent back", "pending"],
            required: true
        },
        priority: {
            type: "string",
            columnType: "enum",
            isIn: ["High", "Medium", "Low"],
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
        completed_time: {
            type: "ref",
            columnType: "timestamp",
            defaultsTo: "CURRENT_TIMESTAMP"
        },
        loan_ref_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        loan_id: {
            type: "number",
            columnType: "int",
            allowNull: true
        },
        assigned_document_list : {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        notification :{
            type: "number",
            columnType: "int",
            defaultsTo : 0
        },
        reassigned_userid: {
            type: "number",
            columnType: "int",
            allowNull: true
        },
        disbursement_id: {
			type: "number",
			columnType: "int",
			allowNull: true
		},
        parent_task_id: {
            type: "number",
            columnType: "int",
            allowNull: true
        },
        approver_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        }
    }
};
