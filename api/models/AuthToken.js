/**
 * AuthToken.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: 'mysql_nc_document_app',
    tableName: 'auth_tokens',
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true,
            columnType: 'int',
            isInteger: true
        },
        name: {
            type: 'string',
            columnType: 'varchar'
        },
        is_active: {
            type: 'string',
            columnType: 'enum',
            isIn: [
                'active', 'inactive'
            ],
            defaultsTo: 'active'
        },
        token: {
            type: 'string',
            columnType: 'text'
        },
        vaild_till: {
            type: 'ref',
            columnType: 'datetime',
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
        }
    }
};
