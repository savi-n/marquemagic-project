/**
 * InsuranceProposal.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_write",
  tableName: "insurance_proposal",
  attributes: {
    id: {
      type: "number",
      columnType: "bigint",
      isInteger: true,
      autoIncrement: true
    },
    ins_app_ref: {
      type: "number",
      columnType: "bigint",
      isInteger: true
    },
    proposal_ref_num: {
      type: "string",
      columnType: "varchar",
      maxLength: 45,
      allowNull: true
    },
    status: {
      type: "string",
      columnType: "varchar",
      maxLength: 45,
      allowNull: true
    },
    status_message: {
      type: "string",
      columnType: "varchar",
      maxLength: 128,
      allowNull: true
    }


  },

};
