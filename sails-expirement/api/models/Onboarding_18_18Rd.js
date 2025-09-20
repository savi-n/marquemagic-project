/**
 * Onboarding_18_18Rd.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    datastore: "mysql_namastecredit_viewloan",
    tableName: "onboarding_18_18",
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "bigint",
            columnName: "loanId",
            isInteger: true
        },
        loan_ref_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 15,
            allowNull: true
        },
        loan_asset_type: {
            model: "Loanassettype",
            columnName: "loan_asset_type_id"
        },
        loan_usage_type: {
            columnName: "loan_usage_type_id",
            model: "loanusagetype"
        },
        loan_type: {
            columnName: "loan_type_id",
            model: "loantype"
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
        loan_products: {
            columnName: "loan_product_id",
            model: "LoanProducts"
        },
        white_label_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            defaultsTo: "1"
        },
        loan: {
            model: "loanrequest",
            columnName: "loan_id"
        },
        business: {
            columnName: "businessid",
            model: "business"
        },
        businessname: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            required: true
        },
        users: {
            columnName: "userid",
            model: "users"
        },
        business_email: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            required: true
        },
        sales_id: {
            columnName: "sales_id",
            model: "users"
        },
        createdUserId: {
            type: "string",
            columnType: "varchar",
            maxLength: 45,
            required: true
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
        doc_count: {
            type: "number",
            columnType: "bigint",
            allowNull: true
        },
        state: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        assigned_extended_ids: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        bank_id: {
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
        branch_id: {
            type: "number",
            columnType: "int",
            allowNull: true
        },
        zone_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 10,
            allowNull: true
        },
        pincode: {
            type: "string",
            columnType: "varchar",
            maxLength: 10,
            allowNull: true
        },
        meeting_flag: {
            type: "string",
            columnType: "enum",
            isIn: ["0", "1", "2"],
            defaultsTo: "0",
            allowNull: true
        },
        DocUploadStatus: {
            type: "string",
            columnType: "enum",
            isIn: ["Done", "Pending"],
            defaultsTo: "Pending",
            allowNull: true
        },
        RequestDate: {
            type: "ref",
            columnType: "datetime",
            required: true,
        },
        channel_type: {
            type: "string",
            columnType: "enum",
            isIn: ['Normal', 'Green'],
            defaultsTo: 'Normal'
        }
    },
    customToJSON: function () {
        // Return a shallow copy of this record with the password and ssn removed.
        return _.omit(this, [
            "loan_ref_id",
            "businessname",
            "business_email",
            "loan_status_id",
            "loan_sub_status_id"
        ]);
    }
};
