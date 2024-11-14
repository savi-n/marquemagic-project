module.exports = {
    datastore: 'mysql_namastecredit',
    tableName: 'business',
    attributes: {
        id: {
            type: "number",
            autoIncrement: true,
            columnType: "bigint",
            columnName: "businessid",
            isInteger: true
        },
        businessname: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            required: true
        },
        // business_address: {
        //     type: 'number',
        //     columnType: "bigint"
        // },
        userid: {
            type: 'number',
            columnType: "bigint",
            isInteger: true
        },
        first_name: {
            type: "string",
            columnType: "varchar",
            maxLength: 100
        },
        last_name: {
            type: "string",
            columnType: "varchar",
            maxLength: 100
        },
        business_email: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            required: true
        },
        contactno: {
            type: "string",
            columnType: "varchar",
            maxLength: 15
        },
        businesstype: {
            type: 'number',
            columnType: "bigint"
        },
        // businessindustry: {
        // type: 'number',
        // columnType: 'int',
        // isInteger: true,
        // defaultsTo: 20
        // },
        businessindustry: {
            type: 'number',
            columnType: "bigint"
        },
        businessstartdate: {
            type: "string",
            columnType: "varchar",
            maxLength: 30,
            required: true
        },
        businesspancardnumber: {
            type: "string",
            columnType: "varchar"
        },
        corporateid: {
            type: "string",
            columnType: "varchar",
            maxLength: 50
        },
        percentage_business_supplier: {
            type: "number",
            columnType: "float"
        },
        percentage_business: {
            type: "number",
            columnType: "float"
        },
        empcount: {
            type: "number",
            columnType: "int",
            isInteger: true,
            required: true
        },
        noofdirectors: {
            type: "number",
            columnType: "int",
            isInteger: true,
            defaultsTo: 1
        },
        about_business: {
            type: "string",
            columnType: "text"
        },
        current_company: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        previous_company: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
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
        white_label_id: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            defaultsTo: "1"
        },
        business_truecaller_info: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        google_search_data: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        gstin: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        gstin_extract: {
            type: "string",
            columnType: "text",
            allowNull: true
        },
        is_ca_business: {
            type: "number",
            columnType: "tinyint",
            isInteger: true,
            defaultsTo: 0
        },
        encrypted_data: {
            type: "string",
            columnType: "blob",
            allowNull: true
        },
        pancard_url: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        ITR_name: {
            type: "string",
            columnType: "varchar",
            maxLength: 255,
            allowNull: true
        },
        filling_date: {
            type: "ref",
            columnType: "datetime"
        },
        crime_check: {
            type: "string",
            columnType: "enum",
            isIn: [
                "Yes", "No"
            ],
            defaultsTo: "No"
        },
        legal_entity_data: {
            type: 'string',
            columnType: 'JSON',
            allowNull: true
        },
        esic_data: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        epfo_data: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        credit_ratings: {
            type: "string",
            columnType: "text",
            allowNull: true
        },
        remarks: {
            type: "string",
            columnType: "json",
            allowNull: true
        },
        email_verification: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        udyam_number: {
            type: "string",
            columnType: "varchar",
            maxLength: 50,
            allowNull: true
        },
        udyam_response: {
            type: "string",
            columnType: "longtext",
            allowNull: true
        },
        cibil_remarks: {
            type: "string",
            columnType: "json",
            allowNull: true
        },
        additional_info: {
            type: "string",
            columnType: "json",
            allowNull: true
        }
    }
}
