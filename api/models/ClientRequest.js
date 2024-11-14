/**
 * ClientRequest.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: 'mysql_nc_document_app',
  tableName: "client_request",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "int",
      isInteger: true,
    },
    request_id: {
      type: "number",
      columnType: "bigint",
    },
    client_id: {
      type: "number",
      columnType: "bigint",
    },
    req_datetime: {
      type: "ref",
      columnType: "datetime",
    },
    generated_key: {
      type: "string",
      columnType: "varchar",
    },
    req_url: {
      type: "string",
      columnType: "varchar",
      allowNull: true,
    },
    req_url_expiry: {
      type: "ref",
      columnType: "datetime",
    },
    req_status: {
      type: "string",
      columnType: "enum",
      isIn: ["initiate", "inprogress", "completed", "expired", "failed"],
      defaultsTo: "initiate",
    },
    req_type: {
      type: "string",
      columnType: "enum",
      isIn: ['GST', 'PAN', 'CIN', 'BANK', 'GST3B', 'ITR', 'ESIC', 'EPFO', 'BANK_CUB', 'EQFAX', 'ROC', 'KYC', 'FORENSIC', 'ALL', 'UDYAM', 'PAN-AADHAAR-LINKAGE', 'LEI', 'UDYOG', 'CKYC', 'DOC_QUALITY'],
    },
    is_active: {
      type: "string",
      columnType: "enum",
      isIn: ["active", "inactive"],
      defaultsTo: "active",
    },
    flag: {
      type: "string",
      columnType: "enum",
      isIn: ["0", "1"],
      defaultsTo: "0",
    },
    flag_expiry: {
      type: "ref",
      columnType: "datetime",
    },
    private_key: {
      type: "string",
      columnType: "varchar",
      allowNull: true,
    },
    public_key: {
      type: "string",
      columnType: "varchar",
      allowNull: true,
    },
    created_at: {
      type: "ref",
      columnType: "datetime",
      autoCreatedAt: true,
    },
    updated_at: {
      type: "ref",
      columnType: "datetime",
      autoUpdatedAt: true,
    },
    sub_type: {
      type: "string",
      columnType: "text",
      allowNull: true,
    },
    remarks: {
      type: "string",
      columnType: "longtext",
      allowNull: true
    }
  },
};
