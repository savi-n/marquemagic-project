const {secret} = require("../../config/env/development");

module.exports = {
	friendlyName: "S3 Document Upload Helper",
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
		region: {
			type: "string",
			description: "S3 region",
			required: true
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
		function filesUploaded(err, filesUploaded) {
			if (err) {
				return exits.uploadError(err);
			}
			if (sails.config.azure.isActive) {
				filesUploaded.map((i) => {
					i["fd"] = i.fd.split("/").pop();
				});
			}
			return exits.success(filesUploaded);
		}
		if (sails.config.azure.isActive) {
			const inputs_bucket_url = inputs.bucket.split("/"),
				container = inputs_bucket_url ? inputs_bucket_url[0] : inputs.bucket,
				container_path = inputs_bucket_url ? inputs_bucket_url[1] : "";

			inputs.document.upload(
				{
					adapter: require("skipper-azure"),
					dirname: container_path,
					key: sails.config.azure.is_dev_env
						? sails.config.azure.dev_env.storage.storageAccountName
						: sails.config.azure.prod_env.storage.storageAccountName,
					secret: sails.config.azure.is_dev_env
						? sails.config.azure.dev_env.storage.secret
						: sails.config.azure.prod_env.storage.secret,
					container: container
				},
				filesUploaded
			);
		} else {
			inputs.document.upload(
				{
					adapter: require("skipper-s3"),
					key: sails.config.aws.key,
					secret: sails.config.aws.secret,
					bucket: inputs.bucket,
					region: inputs.region
				},
				filesUploaded
			);
		}
	}
};
