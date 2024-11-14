module.exports = {


  friendlyName: 'S 3 upload direct file content',


  description: '',


  inputs: {

    s3_name: {
      type: 'string',
      required: true
    },
    s3_region: {
      type: 'string',
      required: true
    },
    filePath: {
      type: 'string',
      required: true
    },
    fileName: {
      type: 'string',
      required: true
    },
    fileContent: {
      type: 'string',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },

  fn: async function (inputs, exits) {

    try {
      
      const {s3_name, s3_region, filePath, fileName, fileContent} = inputs;
      
      const AWS = require('aws-sdk');
      const fs = require('fs');

      // Configure AWS SDK with your credentials and region
      AWS.config.update({
        region: s3_region
      });

      // Create an S3 instance
      const s3 = new AWS.S3();

      // Specify the S3 bucket and file name
      const bucketName = s3_name;
      const uploadFileKey = `${filePath}/${fileName}`;

      // Convert the upload data to a Buffer
      const uploadDataBuffer = Buffer.from(fileContent, 'utf-8');

      // Define S3 upload parameters
      const params = {
        Bucket: bucketName,
        Key: uploadFileKey,
        Body: uploadDataBuffer,
      };

      // Upload the Buffer data to the specified bucket
      const s3UploadResult = await s3.upload(params).promise();

      return exits.success({
        status: "ok",
        message: s3UploadResult
      })


    } catch (error) {
      
        return exits.success({
          status: "nok",
          message: error.message
        });

    }


  }


};
