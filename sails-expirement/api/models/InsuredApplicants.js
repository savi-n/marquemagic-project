/**
 * InsuredApplicants.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit_write",
  tableName: "insured_applicants",
  attributes: {
    id: {
      type: "number",
      columnType: "bigint",
      autoIncrement: true,
      isInteger: true
    },
    ins_ref_number: {
      type: "number",
      columnType: "bigint",
      isInteger: true
    },
    applicant_did: {
      type: "number",
      columnType: "bigint",
      isInteger: true
    },
    // applicant: {
    //   type: "string",
    //   columnType: "varchar",
    //   maxLength: 45
    // },
    applicant_type: {
      type: "string",
      columnType: "enum",
      isIn: ["applicant", "co-applicant"]
    },
    record_status: {
      type: "string",
      columnType: "enum",
      isIn: ["active", "inactive"],
      defaultsTo: "active"
    },
    ins_charge: {
      type: "number",
      columnType: "double"
    },
    gst_charge: {
      type: "number",
      columnType: "double"
    },
    sum_assured: {
      type: "number",
      columnType: "double"
    },
    policy_term: {
      type: "number",
      columnType: "float"
    },
    pre_quote_data: {
      type: "json",
      columnType: "json"
    }
  },

};
