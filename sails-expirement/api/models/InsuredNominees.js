/**
 * InsuredNominees.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_write",
  tableName: "insured_nominees",
  attributes: {
    id: {
      type: "number",
      columnType: "bigint",
      autoIncrement: true,
      isInteger: true
    },
    ins_ref_number: {
      type: "number",
      columnType: "bigint"
    },
    nominee_did: {
      type: "number",
      columnType: "bigint",
      isInteger: true
    },
    nominee: {
      type: "string",
      columnType: "varchar",
      maxLength: 128
    },
    nominee_type: {
      type: "string",
      columnType: "enum",
      isIn: ['applicant', 'co-applicant', 'non-applicant']
    },
    nominee_relation: {
      type: "string",
      columnType: "varchar",
      maxLength: 45
    },
    nominee_dob: {
      type: "ref",
      columnType: "date"
    },
    nominee_contribution: {
      type: "number",
      columnType: "float"
    },
    apointee_name: {
      type: "string",
      columnType: "varchar",
      maxLength: 45
    },
    apointee_relation: {
      type: "string",
      columnType: "varchar",
      maxLength: 45
    },
    record_status: {
      type: "string",
      isIn: ["active", "inactive"],
      defaultsTo: "active"
    }

  },

};
