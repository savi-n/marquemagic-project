module.exports = {
    datastore: 'mysql_nc_document_app',
    tableName: 'request_document',
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true,
            columnType: 'int',
            isInteger: true
        },
        client_id: {
            type: 'number',
            columnType: 'bigint'
        },
        request_id: {
            type: 'number',
            columnType: 'bigint'
        },
        response: {
            type: 'string',
            columnType: 'longtext'
        },
        req_path: {
            type: 'string',
            columnType: 'varchar',
            allowNull: true
        },
        req_filename: {
            type: 'string',
            columnType: 'varchar',
            allowNull: true
        },
        request_type: {
            type: 'string',
            columnType: 'enum',
            isIn: ['GST', 'PAN', 'CIN', 'BANK', 'GST3B', 'ITR', 'ESIC', 'EPFO', 'BANK_CUB', 'ROC', 'EQFAX', 'KYC', 'FORENSIC', 'ALL', 'UDYAM', 'PAN-AADHAAR-LINKAGE', 'LEI', 'UDYOG', 'CKYC', 'DOC_QUALITY']
        },
        is_active: {
            type: 'string',
            columnType: 'enum',
            isIn: ['active', 'inactive'],
            defaultsTo: 'active'
        },
        CIN_GST_PAN_number: {
            type: 'string',
            columnType: 'varchar',
        },
        created_at: {
            type: 'ref',
            columnType: 'datetime',
            autoCreatedAt: true
        },
        updated_at: {
            type: 'ref',
            columnType: 'datetime',
            autoCreatedAt: true
        },
        s3_name: {
            type: 'string',
            columnType: 'tinytext',
            allowNull: true
        },
        s3_region: {
            type: 'string',
            columnType: 'tinytext',
            allowNull: true
        },
        cloud: {
            type: 'string',
            columnType: 'tinytext',
            allowNull: true
        },
        s3_filepath: {
            type: 'string',
            columnType: 'text',
            allowNull: true
        },
        case_no: {
            type: 'string',
            columnType: 'varchar',
            allowNull: true
        },
        no_of_pages: {
            type: 'number',
            columnType: 'int',
            allowNull: true
        },
        file_processing: {
            type: 'string',
            columnType: 'enum',
            isIn: ['inprogress', 'completed', 'failed', 'expired', 'notApplicable'],
            allowNull: true
        }
    }
};