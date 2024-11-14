/**
 * Clients.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: 'mysql_nc_document_app',
    tableName: 'clients',
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true,
            columnType: 'int',
            isInteger: true
        },
        client_name: {
            type: 'string',
            columnType: 'varchar'
        },
        client_logo: {
            type: 'string',
            columnType: 'varchar'
        },
        client_id: {
            type: 'number',
            columnType: 'bigint'
        },
        secret_key: {
            type: 'string',
            columnType: 'longtext'
        },
        is_active: {
            type: 'string',
            columnType: 'enum',
            isIn: [
                'active', 'inactive'
            ],
            defaultsTo: 'active'
        },
        created_at: {
            type: 'ref',
            columnType: 'datetime',
            autoCreatedAt: true
        },
        updated_at: {
            type: 'ref',
            columnType: 'datetime',
            autoUpdatedAt: true
        },
        password: {
            type: 'string',
            columnType: 'varchar'
        },
        email: {
            type: 'string',
            columnType: 'varchar'
        },
        white_label_id: {
            type: 'number',
            columnType: 'int'
        }
    }
};
