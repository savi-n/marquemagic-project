/**
 * GstMaster.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

 module.exports = {
    datastore: 'mysql_namastecredit',
    tableName: 'gst_master',
    attributes: {
  
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            isInteger: true,
            columnName: "idgst_master"
        },

        gst_no: { 
            type: "string", 
            columnType: "text" 
        },

        business_id: { 
            type: "number",
            columnType: "int",
            allowNull: true,
        },

        gst_output: { 
            type: "string",
            columnType: "longtext",
            allowNull: true, 
        },

        created_date: { 
            type: 'ref',
            columnType: 'datetime',
            autoCreatedAt: true,
        },

        updated_date: { 
            type: 'ref',
            columnType: 'datetime',
            autoUpdatedAt: true
        },
        remarks : {
            type: "string",
            columnType: "json",
            allowNull: true
          },
    },
};
