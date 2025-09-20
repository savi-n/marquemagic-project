/*
   key: sails.config.aws.key,
        secret: sails.config.aws.secret,
        bucket: inputs.bucket,
        region: inputs.region
*/

module.exports = {
	friendlyName: "S3 Pdf Document Upload Helper",
	inputs: {
		document: {
			type: "ref",
			description: "File to be uploaded to s3",
			required: true
		},
		bucket: {
			type: "string",
			description: "S3 bucket name",
			required: true
		},
		filepaths: {
			type: "ref",
			description: "filepath",
			required: true
		},
		region : {
			type: "string",
			description: "S3 region name"
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
		const fs = require("fs");
		fs.readFile(inputs.filepaths, (error, fileContent) => {
			const AWS = require("aws-sdk");
			const s3 = new AWS.S3({
				accessKeyId: sails.config.aws.key,
				secretAccessKey: sails.config.aws.secret,
				region: inputs.region
			});
			// if unable to read file contents, throw exception
			if (error) {
				throw error;
			}
			// upload file to S3
			s3.putObject(
				{
					Bucket: inputs.bucket,
					Key: inputs.document,
					Body: fileContent
				},
				(res) => {}
			);
		});
		return exits.success(inputs.filepaths);
	}
};
