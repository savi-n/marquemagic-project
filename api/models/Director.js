/**
 * Director.js
 *
 * @description :: A model definition represents a database table/colllection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    datastore: 'mysql_namastecredit',
    tableName: 'director',
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "int",
            columnName: "did",
            isInteger: true
        },
        // bid: {
        // type: 'number',
        // columnType: 'int',
        // isInteger: true,
        // required: true
        // },
        business: {
            model: "business",
            columnName: "bid"
        },
        dfirstname: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        middle_name: {
            type: "string",
            columnType: "varchar",
            maxLength: 45,
            allowNull: true
        },
        dlastname: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        dpancard: {
            type: "string",
            columnType: "varchar",
            maxLength: 10,
            allowNull: true
        },
        ddob: {
            type: "string",
            columnType: "varchar",
            maxLength: 10,
            allowNull: true
        },
        gender: {
            type: "string",
            columnType: "enum",
            isIn: [
                "Male", "Female", "Not Specified"
            ],
            allowNull: true
        },
        profession_id: {
            type: 'number',
            columnType: 'int',
            allowNull: true
        },
        // profession: {
        //     model: "profession",
        //     columnName: "profession_id",
        // },
        demail: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        dcontact: {
            type: "string",
            columnType: "varchar",
            maxLength: 10,
            allowNull: true
        },
        isApplicant: {
            type: "number",
            columnType: "int"
        },
        address1: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        address2: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        address3: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        address4: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        locality: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        city: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        state: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        pincode: {
            type: "string",
            columnType: "varchar",
            maxLength: 6,
            allowNull: true
        },
        dno: {
            type: "string",
            columnType: "varchar",
            maxLength: 10,
            allowNull: true
        },
        Ownershippercentage: {
            type: "number",
            columnType: "float",
            allowNull: true
        },
        promoteyear: {
            type: "number",
            columnType: "tinyint",
            allowNull: true
        },
        business_started: {
            type: "number",
            columnType: "int",
            allowNull: true
        },
        edu_director: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        about_promoters: {
            type: "string",
            columnType: "text",
            allowNull: true
        },
        status: {
            type: "string",
            columnType: "enum",
            isIn: [
                "active", "inactive", "deleted"
            ],
            defaultsTo: "active"
        },
        ints: {
            type: "ref",
            columnType: "timestamp",
            defaultsTo: "CURRENT_TIMESTAMP"
        },
        daadhaar: {
            type: "string",
            columnType: "varchar",
            maxLength: 15,
            allowNull: true
        },
        dpassport: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        dvoterid: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        ddlNumber: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        dcibil_score: {
            type: "number",
            columnType: "int",
            allowNull: true
        },
        professionId: {
            type: "number",
            columnType: "int",
            allowNull: true
        },
        ddin_no: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        associated_companies: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        director_truecaller_info: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        google_search_data: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        encrypted_data: {
            type: "string",
            columnType: "blob"
        },
        cibil_remarks: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        type_name: {
            type: "string",
            columnType: "enum",
            isIn: [
                "Applicant",
                "Co-applicant",
                "Director",
                "Partner",
                "Guarantor",
                "Trustee",
                "Member",
                "Proprietor"
            ],
            defaultsTo: "Director"
        },
        crime_check: {
            type: "string",
            columnType: "enum",
            isIn: [
                "Yes", "No"
            ],
            defaultsTo: "No"
        },
        ckyc_no: {
            type: "string",
            columnType: "varchar",
            maxLength: 45,
            allowNull: true
        },
        customer_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        income_type: {
            type: "string",
            columnType: "enum",
            isIn: [
                'NULL', 'salaried', 'business'
            ],
            defaultsTo: "NULL"
        },
        residence_status: {
            type: "string",
            columnType: "enum",
            isIn: [
                'NULL',
                'Resident',
                'Resident and Ordinarily Resident',
                'Resident but Not Ordinarily Resident',
                'Non-Resident'
            ],
            defaultsTo: "NULL"
        },
        country_residence: {
            type: "string",
            columnType: "varchar",
            maxLength: 45,
            allowNull: true
        },
        marital_status: {
            type: "string",
            columnType: "enum",
            isIn: [
                'NULL',
                'Single',
                'Married',
                'Widowed',
                'Divorced'
            ],
            defaultsTo: "NULL"
        },
        permanent_address1: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        permanent_address2: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        permanent_city: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        permanent_state: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        permanent_pincode: {
            type: "string",
            columnType: "varchar",
            maxLength: 6,
            allowNull: true
        },
        permanent_locality: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        additional_cust_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        udyam_number: {
            type: "string",
            columnType: "varchar",
            maxLength: 45,
            allowNull: true
        },
        udyam_registered: {
            type: "string",
            columnType: "enum",
            isIn: ["Yes", "Waiver"],
            allowNull: true
        },
        udyam_response: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        others_info: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        }
    }
};
