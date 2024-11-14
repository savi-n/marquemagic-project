/**
 * GstMaster.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

 module.exports = {
    datastore: 'mysql_namastecredit',
    tableName: 'business_entity_financial',
    attributes: {
  
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            isInteger: true
        },

        pan_number: { 
            type: "string", 
            columnType: "text" 
        },

        loan_id: { 
            type: "number",
            columnType: "int",
            allowNull: true,
        },

        e_verification_status: { 
            type: "string",
            columnType: "text",
            allowNull: true, 
        },

        created_On: { 
            type: 'ref',
            columnType: 'datetime',
            autoCreatedAt: true,
        },
        remarks : {
            type: "string",
            columnType: "json",
            allowNull: true
          },
    },
};
