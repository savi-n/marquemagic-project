module.exports = {
	datastore: "mysql_namastecredit_read",
	tableName: "OTP_user",
    attributes: {
		id: {
			type: "number",
			autoIncrement: true,
			columnType: "int",
			isInteger: true
		},
        userid :{
            type: "number",
			columnType: "int",
			isInteger: true,
            required : true
        },
        login_time : {
            type: "string",
			columnType: "datetime",
			allowNull : true
        },
        otp : {
            type: "string",
			columnType: "varchar",
            maxLength : 255,
            required : true
        },
		white_label_id: {
			type: "number",
			columnType: "int",
			required: true
		},
        created_time : {
            type: "string",
			columnType: "timestamp",
			defaultsTo: "CURRENT_TIMESTAMP",
            allowNull : true
        },
        otp_received_time :{
            type: "string",
			columnType: "datetime",
			allowNull: true
        },
        logout_time :{
            type: "string",
			columnType: "datetime",
			allowNull: true
        },
        otp_sent_status:{
            type: "string",
			columnType: "enum",
            isIn: ["1", "0", "2"],
			defaultsTo: "1"
        },
        count_wrong_hits :{
            type: "number",
			columnType: "int",
            defaultsTo : 0
        },
		isActive: {
			type: "string",
			columnType: "enum",
            isIn: ["true", "false"],
			defaultsTo: "true"
		},
        product_id :{
            type: "string",
			columnType: "varchar",
            maxLength : 45,
            required : true
        },
        verifed_status : {
            type: "string",
			columnType: "enum",
            isIn: ["True", "False"],
			defaultsTo: "False"
        },
        mobile : {
            type: "string",
			columnType: "varchar",
            maxLength : 255
        }
    }
}