var AWS = require('aws-sdk');

AWS.config.update({
  key: sails.config.aws.cred.accessKeyId,
  secret: sails.config.aws.cred.secretAccessKey,
  region: sails.config.aws.cred.region
});

const s3 = new AWS.S3();

module.exports = {


  friendlyName: 'Json to s 3',


  description: '',


  inputs: {
    jsonData: {
      type: "ref",
      required: true
    },
    bucket: {
      type: "string",
      required: true
    },
    key: {
      type: "string",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const { jsonData, bucket, key } = inputs;

    const buffer = Buffer.from(JSON.stringify(jsonData));

    console.log({
      key: sails.config.aws.cred.accessKeyId,
      secret: sails.config.aws.cred.secretAccessKey,
      region: sails.config.aws.cred.region
    })

    let params = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: 'application/json'
    };

    console.log("params", params)

    await s3.upload(params).promise();

    return exits.success({
      bucket,
      key
    });

  }


};
