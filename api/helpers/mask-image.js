const AWS = require('aws-sdk');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

module.exports = {


  friendlyName: 'Mask image',


  description: 'This is for masking/redacting the image',


  inputs: {
    reqPayload: {
      type: 'ref',
      required: true
    },
    s3_name: {
      type: 'string',
      required: true
    },
    s3_region: {
      type: 'string',
      required: true
    },
    cloud: {
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

    let url = sails.config.kycExtraction.urls.mask, statusCode = 200, result, buffer;

    let apiResponse = await sails.helpers.apiTrigger(
      url,
      JSON.stringify(inputs.reqPayload),
      { "content-type": "application/json" },
      'POST'
    );

    let extractedData;
    try {
      extractedData = JSON.parse(apiResponse);
    } catch (err) {
      console.log(err);
      statusCode = 502, result = { status: 'nok', statusCode: 'NC502', message: `Server error. Bad gateway` };
      return exits.success([statusCode, result]);
    }

    let maskedImagePath = extractedData.Masked_image_path, isAws = inputs.cloud === 'aws' ? 1 : 0;
    let filePathArr = maskedImagePath.split('/');
    let fileName = filePathArr[filePathArr.length - 1];
    filePathArr = filePathArr.slice(0, -1);
    maskedImagePath = filePathArr.join('/');

    let container = inputs.s3_name;

    if (!isAws) {
      try {
        let account = sails.config.azure.is_dev_env
          ? sails.config.azure.dev_env.storage.storageAccountName
          : sails.config.azure.prod_env.storage.storageAccountName;
        let accountKey = sails.config.azure.is_dev_env
          ? sails.config.azure.dev_env.storage.secret
          : sails.config.azure.prod_env.storage.secret;
        const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
        const blobServiceClient = new BlobServiceClient(
          `https://${account}.blob.core.windows.net`,
          sharedKeyCredential
        );

        const containerClient = blobServiceClient.getContainerClient(`${container}/${maskedImagePath}`);
        const blobClient = containerClient.getBlobClient(fileName);

        const downloadBlockBlobResponse = await blobClient.download();

        buffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)

        async function streamToBuffer(readableStream) {
          return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on("data", (data) => {
              chunks.push(data instanceof Buffer ? data : Buffer.from(data));
            });
            readableStream.on("end", () => {
              resolve(Buffer.concat(chunks));
            });
            readableStream.on("error", reject);
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      AWS.config.update(
        {
          accessKeyId: sails.config.aws.cred.accessKeyId,
          secretAccessKey: sails.config.aws.cred.secretAccessKey,
          region: inputs.s3_region
        }
      );

      let s3 = new AWS.S3();
      let options = {
        Bucket: inputs.s3_name,
        Key: `${maskedImagePath}/${fileName}`
      }

      fileStream = await s3.getObject(options).promise();
      buffer = fileStream.Body;
    }

    let base64String = buffer.toString('base64');

    statusCode = 200, result = { status: 'ok', statusCode: 'NC200', base64String };

    return exits.success([statusCode, result]);

  }

};

