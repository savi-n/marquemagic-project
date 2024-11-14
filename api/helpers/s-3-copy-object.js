const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: sails.config.aws.cred.accessKeyId,
    secretAccessKey: sails.config.aws.cred.secretAccessKey
});

module.exports = {

  friendlyName: 'S 3 copy object',
  description: 'Copies one document from One AWS Bucket to another',

  inputs: {

    srcBucket:{
      type: "string",
      required: true,
    },
    srcKey: {
      type: "string",
      required: true
    },
    destBucket: {
      type: "string",
      required: true
    },
    destKey: {
      type: "string",
      required: true
    },


  },


  exits: {

    success: {
      description: 'All done.',
    },
    uploadFailure: {
      description: 'Some Error Occured while uploading to S3'
    }

  },


  fn: async function (inputs, exits) {

    const {srcBucket, srcKey, destBucket, destKey} = inputs;

    const sourcePath = `${srcBucket}/${srcKey}`;

    const params = {
      CopySource: sourcePath,
      Bucket: destBucket,
      Key: destKey,
      MetadataDirective: "REPLACE"
      };

    s3.copyObject(params, (err, data) => {
      if (err) {
        return exits.uploadError(err);
      } else {
        return exits.success(data);
      }
    });

  }


};

