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
    inputs.document.upload(
      {
        adapter: require("skipper-s3"),
        key: sails.config.aws.cred.accessKeyId,
        secret: sails.config.aws.cred.secretAccessKey,
        bucket: inputs.bucket,
        region: inputs.region
      },
      filesUploaded
    );

  }
};
