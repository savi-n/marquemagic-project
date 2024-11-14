/**
 * CompanyMasterData.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: 'mysql_nc_document_app',
    tableName: 'OTP',
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true,
            columnType: 'int',
            isInteger: true
        },
        mobileNo: {
            type: 'string',
            columnType: 'varchar',
            maxLength : 15
        },
        otp: {
            type: 'string',
            columnType: 'varchar',
            maxLength : 10
        },
        status :{
            type : 'string',
            columnType : 'enum',
            isIn: ['active', 'inactive'],
			defaultsTo: 'active'
        },
        created_at :{
            type: 'ref',
            columnType: 'datetime'
        },
        updated_at : {
            type: 'ref',
            columnType: 'datetime'
            
        }
    }
};
