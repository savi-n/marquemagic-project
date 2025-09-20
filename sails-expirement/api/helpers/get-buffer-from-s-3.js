const AWS = require('aws-sdk');

module.exports = {


  friendlyName: 'Get buffer from s 3',


  description: '',


  inputs: {
    bucket: {
      type: 'string',
      required: true
    },
    region: {
      type: 'string',
      required: true
    },
    cloud: {
      type: 'string',
      required: true
    },
    filepath: {
      type: 'string',
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Buffer from s 3',
    },

  },


  fn: async function (inputs, exits) {
    let {bucket, region, cloud, filepath} = inputs;

    let filepathArr = filepath.split('/');
    let fileName = filepathArr[filepathArr.length - 1];
    filepathArr = filepathArr.slice(0, -1);
    filepath = filepathArr.join('/');

    AWS.config.update(
      {
        accessKeyId: sails.config.aws.key,
        secretAccessKey: sails.config.aws.secret,
        region: region
      }
    );

    let s3 = new AWS.S3();
    let options = {
      Bucket: bucket,
      Key: `${filepath}/${fileName}`
    }

    fileStream = await s3.getObject(options).promise();
    let buffer = fileStream.Body;

    return exits.success(buffer);

  }


};
