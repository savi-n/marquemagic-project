module.exports = {
    datastore: 'mysql_namastecredit',
    tableName: 'crime_check',
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true,
            columnType: 'bigint',
            isInteger: true
        },
        cin_or_din: {
            type: 'string',
            columnType: 'text',
            allowNull: true
        },

        request_type: {
            type: 'string',
            columnType: "enum",
            isIn: [
                'business', 'director'
            ],
            defaultsTo: 'business'

        },
        request_id: {
            type: 'string',
            columnType: 'varchar',
            maxLength: 120,
            allowNull: true
        },
        requested_time: {
            type: 'string',
            columnType: 'Datetime',
            allowNull: true
        },
        report_updated_time: {
            type: 'string',
            columnType: 'Datetime',
            allowNull: true
        },
        report_json: {
            type: 'string',
            columnType: 'loantext',
            allowNull: true
        },
        report_name: {
            type: 'string',
            columnType: 'loantext',
            allowNull: true
        },
        report_link: {
            type: 'string',
            columnType: 'loantext',
            allowNull: true
        },
        report_request_type: {
            type: 'string',
            columnType: 'enum',
            isIn: [
                'full', 'basic'
            ],
            defaultsTo: 'full'
        },
        status: {
            type: 'number',
            columnType: 'float',
            allowNull: true
        },
        createdAt: {
            type: 'ref',
            columnType: 'TIMESTAMP'
        },
        updatedAt: {
            type: 'number',
            columnType: 'TIMESTAMP'
        },
        bid: {
            type: 'string',
            columnType: 'varchar',
            allowNull: true
        },
        early_report: {
            type: 'string',
            columnType: 'varchar',
            allowNull: true
        }
    }
};
