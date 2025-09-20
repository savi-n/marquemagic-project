/**
 * LoanPreFetch.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_write",
  tableName: "loan_pre_fetch",

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    id: {
      type: "number",
      autoIncrement: true,
      columnType: "int",
      isInteger: true
    },
    request_type: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    refrence_no: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    loan_id: {
      type: "number",
      columnType: "bigint",
      allowNull: true
    },
    initial_json: {
      type: "string",
      columnType: "text",
      allowNull: true
    },
    status: {
      type: "string",
      columnType: "enum",
      isIn: ["Fetch", "Updated", "Approved", "Rejected", "Pending"],
      allowNull: true
    },
    created_at: {
      type: "ref",
      columnType: "datetime"
    },
    updated_at: {
      type: "ref",
      columnType: "datetime"
    },
    updated_json: {
      type: "string",
      columnType: "text",
      allowNull: true
    },
    third_party_response: {
      type: "string",
      columnType: "longtext",
      allowNull: true
    },
    director_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    }
  }

};
