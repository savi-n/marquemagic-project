/**
 * CompanyMasterData.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
    datastore: 'mysql_namastecredit',
    tableName: 'company_master_data',
    attributes: {
        id: {
            type: 'number',
            autoIncrement: true,
            columnType: 'int',
            isInteger: true,
            columnName: 'ID'
        },
        cin: {
            type: 'string',
            columnName: 'CORPORATE_IDENTIFICATION_NUMBER',
            columnType: 'varchar'
        },
        COMPANY_NAME: {
            type: 'string',
            columnType: 'varchar'
        },
        COMPANY_STATUS: {
            type: 'string',
            columnType: 'varchar'
        },
        COMPANY_CLASS: {
            type: 'string',
            columnType: 'varchar'
        },
        COMPANY_CATEGORY: {
            type: 'string',
            columnType: 'varchar'
        },
        AUTHORIZED_CAPITAL: {
            type: 'string',
            columnType: 'varchar'
        },
        PAIDUP_CAPITAL: {
            type: 'string',
            columnType: 'varchar'
        },
        DATE_OF_REGISTRATION: {
            type: 'string',
            columnType: 'varchar'
        },
        REGISTERED_STATE: {
            type: 'string',
            columnType: 'varchar'
        },
        REGISTRAR_OF_COMPANIES: {
            type: 'string',
            columnType: 'varchar'
        },
        PRINCIPAL_BUSINESS_ACTIVITY: {
            type: 'string',
            columnType: 'varchar'
        },
        REGISTERED_OFFICE_ADDRESS: {
            type: 'string',
            columnType: 'varchar'
        },
        SUB_CATEGORY: {
            type: 'string',
            columnType: 'varchar'
        },
        BUSINESS_ID: {
            type: 'string',
            columnType: 'varchar',
            allowNull: true
        },
        updateRequire: {
            type: 'number',
            columnType: 'int'
        },
        ROC_CHARGES: {
            type: 'string',
            columnType: 'LONGTEXT',
            allowNull: true
        },
        EMAIL_ID: {
            type: 'string',
            columnType: 'varchar'
        },
        DATE_OF_LAST_AGM: {
            type: 'string',
            columnType: 'varchar'
        },
        DATE_OF_LAST_BALANCE_SHEET: {
            type: 'string',
            columnType: 'varchar'
        },
        LAST_UPDATED: {
            type: 'ref',
            columnType: 'datetime'
        },
        signatory_details_json: {
            type: 'string',
            columnType: 'text'
        },
        signatory_datetime: {
            type: 'ref',
            columnType: 'datetime'
        },
        OUTPUT_JSON: {
            type: 'string',
            columnType: 'LONGTEXT'
        }
    }
};
