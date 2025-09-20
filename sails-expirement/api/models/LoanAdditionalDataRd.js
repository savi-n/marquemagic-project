module.exports = {
    datastore: "mysql_namastecredit_read",
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
        enach_mode: {
            type: "string",
            columnType: "enum",
            isIn: ['offline', 'api', 'aadhar-esing', 'phygital', 'upi']
        },
        zone_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 10,
            allowNull: true
        },
        psl_classification: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            defaultsTo: "NULL"
        },
        credit_limit_applied: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        scheme_policy: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        s3_av_data: {
            type: "string",
            columnType: "json",
            allowNull: true
        },
        declarations_terms_conditions: {
            type: "string",
            columnType: "json",
            allowNull: true
        },
      /*  channel_type: {
            type: "string",
            columnType: "enum",
            isIn: ['Normal', 'Green'],
            defaultsTo: 'Normal'
        }*/
    }
}
