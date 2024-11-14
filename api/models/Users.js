/**
 * Users.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: "mysql_namastecredit",
  tableName: "users",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
      columnType: "bigint",
      columnName: "userid",
      isInteger: true
    },
    name: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      required: true
    },
    email: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      unique: true,
      required: true
    },
    contact: {
      type: "string",
      columnType: "varchar",
      maxLength: 15,
      required: true
    },
    cacompname: {
      type: "string",
      columnType: "varchar",
      maxLength: 150,
      allowNull: true
    },
    capancard: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    address1: {
      type: "string",
      columnType: "varchar",
      maxLength: 150,
      allowNull: true
    },
    address2: {
      type: "string",
      columnType: "varchar",
      maxLength: 150,
      allowNull: true
    },
    pincode: {
      type: "string",
      columnType: "varchar",
      maxLength: 6,
      allowNull: true
    },
    locality: {
      type: "string",
      columnType: "varchar",
      maxLength: 150,
      allowNull: true
    },
    city: {
      type: "string",
      columnType: "varchar",
      maxLength: 150,
      allowNull: true
    },
    state: {
      type: "string",
      columnType: "varchar",
      maxLength: 150,
      allowNull: true
    },
    password: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    usertype: {
      type: "string",
      columnType: "varchar",
      maxLength: 300,
      defaultsTo: "Borrower"
    },
    lender_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    parent_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      defaultsTo: 0,
      allowNull: true
    },
    user_group_id: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    assigned_sales_user: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    originator: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    is_lender_admin: {
      type: "number",
      columnType: "int",
      isInteger: true,
      defaultsTo: 0
    },
    status: {
      type: "string",
      columnType: "enum",
      isIn: ["active", "inactive", "deleted"],
      defaultsTo: "inactive"
    },
    osv_name: {
      type: "string",
      columnType: "varchar",
      maxLength: 200,
      allowNull: true
    },
    firstlogin: {
      type: "string",
      columnType: "enum",
      isIn: ["1", "0"],
      defaultsTo: "0"
    },
    createdon: {
      type: "ref",
      columnType: "datetime",
      defaultsTo: "CURRENT_TIMESTAMP"
    },
    update_time: {
      type: "ref",
      columnType: "timestamp",
      defaultsTo: "CURRENT_TIMESTAMP"
    },
    is_lender_manager: {
      type: "number",
      columnType: "int",
      isInteger: true,
      defaultsTo: 0,
      allowNull: true
    },
    origin: {
      type: "string",
      columnType: "text",
      required: true
    },
    white_label_id: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      defaultsTo: "1"
    },
    deactivate_reassign: {
      type: "string",
      columnType: "enum",
      isIn: ["yes", "no"],
      defaultsTo: "No"
    },
    notification_purpose: {
      type: "number",
      columnType: "int",
      isInteger: true,
      allowNull: true
    },
    user_sub_type: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    notification_flag: {
      type: "string",
      columnType: "enum",
      isIn: ["yes", "no"],
      defaultsTo: "no"
    },
    createdbyUser: {
      type: "number",
      columnType: "int",
      isInteger: true,
      required: true
    },
    source: {
      type: "string",
      columnType: "varchar",
      maxLength: 100,
      allowNull: true
    },
    channel_type: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    user_reference_pwd: {
      type: "string",
      columnType: "varchar",
      maxLength: 200,
      allowNull: true
    },
    otp: {
      type: "string",
      columnType: "varchar",
      maxLength: 200,
      allowNull: true
    },
    work_type: {
      type: "string",
      columnType: "varchar",
      maxLength: 45,
      allowNull: true
    },
    profile_completion: {
      type: "number",
      columnType: "int",
      isInteger: true,
      defaultsTo: 0
    },
    pic: {
      type: "string",
      columnType: "longtext",
      allowNull: true
    },
    // loans: {
    //   collection: "loanrequest",
    //   via: "createdUserId"
    // },
    login_status: {
      type: "string",
      columnType: "varchar",
      defaultsTo: "logged_out"
    },
    branch_id: {
      type: "number",
      columnType: "int",
      allowNull: true
    },
    is_corporate: {
      type: "number",
      columnType: "tinyint",
      allowNull: true
    },
    products_type: {
      type: "string",
      columnType: "varchar",
      maxLength: 255,
      allowNull: true
    },
    is_other: {
      type: "number",
      columnType: "int",
      defaultsTo: 0
    },
    is_state_access: {
      type: "number",
      columnType: "int",
      defaultsTo: 0
    },
    user_reference_no: {
      type: "string",
      columnType: "varchar",
      columnName: "user_refrence_no",
      maxLength: 255,
      allowNull: true
    }
  },
  customToJSON: function () {
    // Return a shallow copy of this record with the password and ssn removed.
    return _.omit(this, ["password", "user_reference_pwd"]);
  }
};


