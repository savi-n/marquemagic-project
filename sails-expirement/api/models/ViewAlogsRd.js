/**
 * ViewAlogsRd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models   /merge this file

 */


module.exports = {
  datastore: "mysql_namastecredit_write",
  tableName: "view_loanwithALogs",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "bigint",
      columnName: "loanId"
    },
    doc_count: {
      type: "number",
      columnType: "bigint",
      isInteger: true
    },
    loan_ref_id: {
      type: "string",
      columnType: "varchar",
      maxLength: 15,
      allowNull: true
    },
    user_id: {
      type: "number",
      columnType: "int"
    },
    white_label_id: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      defaultsTo: "1"
    },
    region_id: {
      type: "number",
      columnType: "bigint",
      isInteger: true,
      allowNull: true
    },
    city: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    users: {
      columnName: "userid",
      model: "usersrd"
    },
    business: {
      columnName: "businessid",
      model: "businessrd"
    },
    businessname: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      required: true
    },
    business_email: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      required: true
    },
    doc_upload_status: {
      type: "string",
      columnType: "enum",
      columnName: "document_upload",
      isIn: ["Done", "Pending"],
      defaultsTo: "Pending"
    },
    businessname: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      required: true
    },
    business_email: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      required: true
    },
    doc_upload_status: {
      type: "string",
      columnType: "enum",
      columnName: "document_upload",
      isIn: ["Done", "Pending"],
      defaultsTo: "Pending"
    },
    createdUserId: {
      type: "string",
      columnType: "varchar"
    },
    loan_usage_type: {
      columnName: "loan_usage_type_id",
      model: "loanusagetyperd"
    },
    loan_type: {
      columnName: "loan_type_id",
      model: "loantyperd"
    },
    loan_status_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      defaultsTo: 1,
      allowNull: true
    },
    loan_sub_status_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    modified_on: {
      type: "ref",
      columnType: "timestamp"
    },
    upts: {
      type: "ref",
      columnType: "timestamp",
      defaultsTo: "0000-00-00 00:00:00"
    },
    loan_bank_mapping: {
      columnName: "loan_bank_mapping_id",
      model: "loanbankmappingrd"
    },
    loan_products: {
      columnName: "loan_product_id",
      model: "LoanProductsrd"
    },
    loan_usage_type: {
      columnName: "loan_usage_type_id",
      model: "loanusagetyperd"
    },
    loan_asset_type: {
      model: "Loanassettyperd",
      columnName: "loan_asset_type_id"
    },
    lender_status: {
      columnName: "lender_status_id",
      model: "loanstatuswithlenderrd"
    },
    loan: {
      model: "loanrequestrd",
      columnName: "loan_id"
    },
    sales_id: {
      columnName: "sales_id",
      model: "usersrd"
    },
    loan_bank_status: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    bank_emp_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    loan_borrower_status: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    assigned_extended_ids: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    meeting_flag: {
      type: "string",
      columnType: "enum",
      isIn: ["0", "1", "2"],
      defaultsTo: "0"
    },
    state: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    branch_id: {
      type: "number",
      columnType: "int",
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
    zone_id : {
			type: "string",
			columnType: "varchar",
			maxLength: 10,
			allowNull: true
		}
  }
};
