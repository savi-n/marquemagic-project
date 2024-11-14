const AWS = require('aws-sdk');
AWS.config.update(sails.config.aws.cred);
const s3 = new AWS.S3();
module.exports = {
    friendlyName: 'S3 Document Upload Helper',
    inputs: {
        bucket: {
            type: 'string',
            description: 'S3 bucket name',
            required: true
        },
        key: {
            type: 'string',
            description: 'S3 region',
            required: true
        },
        body: {
            type: 'ref',
            description: 'document content',
            required: true
        }
    },
    exits: {
        success: {
            outputFriendlyName: 'File successfully upload to s3 bucket',
            outputDescription: 'Uploaded file description'
        },

        uploadError: {
            description: 'There is an error in uploading the file to s3'
        }
    },

    fn: async function (inputs, exits) {
        const params = {
            Bucket: inputs.bucket,
            Key: inputs.key,
            Body: inputs.body
        };
        s3.upload(params, function (err, data) {
            if (err) {
                return exits.uploadError(err);
            }
            return exits.success(data);
        });

    }
}
