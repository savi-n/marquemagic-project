
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: sails.config.aws.key,
    secretAccessKey: sails.config.aws.secret
});
module.exports = {
	friendlyName: "Copy S3 Document Helper",
	inputs: {
		srcuserid: {
			type: "number",
			required: false
		},
		bucket: {
			type: "string",
			required: true
		},
		region: {
			type: "string",
			required: true
		},
        destuserid : {
            type: "number",
			required: true
        },
        filename: {
            type: "string",
			required: true
        },
		profile : {
			type : "string",
			required : false
		},
		file_rename : {
			type : "string",
			required : false
		}
	},
	exits: {
		success: {
			outputFriendlyName: "File successfully upload to s3 bucket",
			outputDescription: "Uploaded file description"
		},

		uploadError: {
			description: "There is an error in uploading the file to s3"
		}
	},

	fn: async function (inputs, exits) {
		let sourcePath, key;
		if (inputs.profile) {
			sourcePath = inputs.bucket + "/" + inputs.filename;
			inputs.filename = inputs.filename.split("/")[1];
		} else {
			sourcePath = inputs.bucket + "/users_" + inputs.srcuserid + "/" + inputs.filename;
		}
		// if (inputs.file_rename){
		// 	key = "users_" + inputs.destuserid + "/" + inputs.file_rename;
		// } else {
		key = "users_" + inputs.destuserid + "/" + inputs.filename;
		// }
		console.log("++++++++++++++++++++++++++++",key);
        params = {
                CopySource: sourcePath,
                Bucket: inputs.bucket,
                Key: "users_" + inputs.destuserid + "/" + inputs.filename,
                MetadataDirective: "REPLACE"
            };
			// console.log(params, s3);
        s3.copyObject(params, (err, data) => {
			console.log(err, data);
            if (err) {
				return exits.uploadError(err);
			} else {
                return exits.success(data);
            }
        });

	}
};