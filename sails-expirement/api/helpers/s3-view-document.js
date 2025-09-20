module.exports = {
	friendlyName: "S3 View Document Helper",
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
		key: {
			type: "string",
			description: "Expiration time for the signed url in seconds"
		},
		expire: {
			type: "number",
			description: "Expiration time for the signed url in seconds"
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
		if (sails.config.azure.isActive) {
			const azure = require("azure-storage");
			const hostName = sails.config.azure.is_dev_env
					? sails.config.azure.dev_env.storage.host
					: sails.config.azure.prod_env.storage.host;
			const key = sails.config.azure.is_dev_env
					? sails.config.azure.dev_env.storage.storageAccountName
					: sails.config.azure.prod_env.storage.storageAccountName;
			const secret = sails.config.azure.is_dev_env
						? sails.config.azure.dev_env.storage.secret
						: sails.config.azure.prod_env.storage.secret;
				BlobService = azure.createBlobService(key, secret);
				inputs_bucket_url = inputs.bucket.split("/");
				containerName = inputs_bucket_url ? inputs_bucket_url[0] : inputs.bucket;
				container_path = inputs_bucket_url ? inputs_bucket_url[1] : "";
			const {StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require("@azure/storage-blob");
			 sharedKeyCredential = new StorageSharedKeyCredential(key, secret);
			const permissions = BlobSASPermissions.parse("r");
			const startDate = new Date();
			const expiryDate = new Date(startDate);
			expiryDate.setMinutes(startDate.getMinutes() + 100);
			startDate.setMinutes(startDate.getMinutes() - 100);
			const sasToken = generateBlobSASQueryParameters(
			  {
				containerName: containerName,
				permissions: permissions.toString(),
				startTime: startDate,
				expiresOn: expiryDate
			  },
			  sharedKeyCredential
			).toString();
			let imgUrl = BlobService.getUrl(containerName, container_path + "/" + inputs.filename, sasToken);
			return exits.success(imgUrl);
		} else {
			const AWS = require("aws-sdk");
			const s3 = new AWS.S3({
				accessKeyId: sails.config.aws.key,
				secretAccessKey: sails.config.aws.secret,
				region: inputs.region
			});
			let signedUrlExpireSeconds = 60 * 60;
			if (inputs.expire !== undefined && inputs.expire !== "") {
				signedUrlExpireSeconds = inputs.expire;
			}
			if(inputs.key){
				const file = await s3.getObject(JSON.parse(inputs.key)).promise();
				return exits.success(file);
			}
			else {
			s3.getSignedUrl(
				"getObject",
				{
					Bucket: inputs.bucket,
					Key: inputs.filename,
					Expires: signedUrlExpireSeconds
				},
				(err, data) => {
					if (err) {
						exits.fileError(err);
					}
					return exits.success(data);
				}
			);
		}
	}
	}
};
