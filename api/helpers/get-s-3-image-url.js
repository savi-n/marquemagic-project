module.exports = {
	friendlyName: "S3 Image Url Helper",
	inputs: {
		filename: {
			type: "string",
			description: "S3 Filename to generate the signed url",
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
		},
		isAws: {
			type: "number",
			description: "Indicates whether the cloud is aws or not"
		},
		expire: {
			type: "number",
			description: "Expiration time for the signed url in seconds. If it's -1 then that means it has no expiration"
		}
	},
	exits: {
		success: {
			outputFriendlyName: "File View",
			outputDescription: "S3 Signed url generated Successfully"
		},

		fileError: {
			description: "There is an error in generating signed url for the file"
		}
	},

	fn: async function (inputs, exits) {
		if (!inputs.isAws && sails.config.azure.isActive) {
			const azure = require("azure-storage");
			const hostName = sails.config.azure.is_dev_env
				? sails.config.azure.dev_env.storage.host
				: sails.config.azure.prod_env.storage.host,
				BlobService = azure.createBlobService(
					sails.config.azure.is_dev_env
						? sails.config.azure.dev_env.storage.storageAccountName
						: sails.config.azure.prod_env.storage.storageAccountName,
					sails.config.azure.is_dev_env
						? sails.config.azure.dev_env.storage.secret
						: sails.config.azure.prod_env.storage.secret
				),
				inputs_bucket_url = inputs.bucket.split("/"),
				containerName = inputs_bucket_url ? inputs_bucket_url[0] : inputs.bucket,
				file_pathArr = inputs_bucket_url.slice(1);
				file_path = file_pathArr.join('/');
				imgUrl = BlobService.getUrl(containerName, `${file_path}/${inputs.filename}`, null, hostName);
			return exits.success(imgUrl);
		} else {
			const AWS = require("aws-sdk");
			const s3 = new AWS.S3({
				accessKeyId: sails.config.aws.cred.key,
				secretAccessKey: sails.config.aws.cred.secret,
				region: inputs.region
			});
			let signedUrlExpireSeconds = 60 * 60;
			let params = {
				Bucket: inputs.bucket,
				Key: inputs.filename
			}
			if (inputs.expire && inputs.expire !== -1) {
				params.Expires = inputs.expire;
			} else {
				params.Expires = signedUrlExpireSeconds;
			}
			s3.getSignedUrl(
				"getObject",
				params,
				(err, data) => {
					if (err) {
						exits.fileError(err);
					}
					return exits.success(data);
				}
			);
		}
	}
};
