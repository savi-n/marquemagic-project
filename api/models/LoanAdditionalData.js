module.exports = {
    datastore: "mysql_namastecredit",
    tableName: "loan_additional_data",
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "bigint",
            isInteger: true
        },
        estimated_fund_requirements: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        loan_id: {
            type: "number",
            columnType: "bigint",
            isInteger: true,
            required: true
        },
        source_fund_requirements: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        white_label_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255
        },
        ints: {
            type: "ref",
            columnType: "datetime",
            required: true
        },
        upts: {
            type: "ref",
            columnType: "timestamp",
            defaultsTo: "CURRENT_TIMESTAMP"
        },
        source_codes: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        sme_data : {
            type: "string",
			columnType: "longtext",
			allowNull: true
        }

    }
}
