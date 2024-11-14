const AWS = require('aws-sdk');
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
            description: 'S3 key',
            required: true
        },
        region: {
            type: 'string',
            description: 'S3 region'
        }
    },
    exits: {
        success: {
            outputFriendlyName: 'File View',
            outputDescription: 'S3 Signed url generated Successfully'
        },

        fileError: {
            description: 'There is an error in generating signed url for the file'
        }
    },

    fn: async function (inputs, exits) {
        const params = {
            Bucket: inputs.bucket,
            Key: inputs.key
        };
        let region = sails.config.aws.cred.region;
        if(inputs.region) region = inputs.region
        AWS.config.update({ accessKeyId: sails.config.aws.cred.accessKeyId, secretAccessKey: sails.config.aws.cred.secretAccessKey, region: region, signatureVersion: 'v4' });
        const s3 = new AWS.S3();
        s3.getSignedUrl('getObject', params, function (err, data) {
            if (err) {
                exits.fileError(err);
            }
            return exits.success(data);
        });

    }
}
