const AWS = require('aws-sdk');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

module.exports = {


  friendlyName: 'Get base 64 string from s 3',


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
      outputFriendlyName: 'Base 64 string from s 3',
    },

  },


  fn: async function (inputs, exits) {

    let { bucket, region, cloud, filepath } = inputs;

    let filepathArr = filepath.split('/');
    let fileName = filepathArr[filepathArr.length - 1];
    filepathArr = filepathArr.slice(0, -1);
    filepath = filepathArr.join('/');

    let buffer;

    if (cloud === 'azure') {
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

        const containerClient = blobServiceClient.getContainerClient(`${bucket}/${filepath}`);
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
          region: region
        }
      );

      let s3 = new AWS.S3();
      let options = {
        Bucket: bucket,
        Key: `${filepath}/${fileName}`
      }

      fileStream = await s3.getObject(options).promise();
      buffer = fileStream.Body;
    }

    let base64String = buffer.toString('base64');

    return exits.success(base64String);
  }

};

