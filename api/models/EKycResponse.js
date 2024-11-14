/**
 * EKycResponse.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: 'mysql_namastecredit',
    tableName: 'ekyc_response_table',
    attributes: {
        //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
        //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
        //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            isInteger: true,
        },

        kyc_key: {
            type: "string",
            columnType: "text"
        },

        uniqueId: {
            type: "string",
            columnType: "varchar",
            allowNull: true,
        },

        response: {
            type: "string",
            columnType: "longtext",
            allowNull: true,
        },

        created: {
            type: 'ref',
            columnType: 'datetime',
            autoCreatedAt: true,
        },

        updated: {
            type: 'ref',
            columnType: 'datetime',
            autoUpdatedAt: true
        },
        type: {
            type: 'string',
            columnType: 'enum',
            isIn: ['aadhar', 'passport', 'voter', 'license', 'pan']
        },

        aadhaar_resend_otp_count: {
            type: "number",
            columnType: "int",
            defaultsTo: 0
        },
        verification_response: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        remarks: {
            type: "text",
            columnType: "json",
            allowNull: true
        },
        ref_id: {
            type: "number",
            columnType: "int",
            columnName: "ref_id",
            allowNull: true
        },
        kyc_details: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        }
    },
};
