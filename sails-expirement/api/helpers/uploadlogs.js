const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const util = require('util');

module.exports = {

    friendlyName: 'Upload logs to s3',


    description: 'Helper to create a JSON file and upload it to an S3 bucket.',


    inputs: {
        bucket: {
            type: "string",
            required: true,
            description: "S3 bucket name",
        },
        apiName: {
            type: "string",
            required: true,
            description: 'APi name',
        },
        filePath: {
            type: "string",
            required: true,
            description: 'The path that used when uploading the file to S3.',
            //Example :- 'folder1/folder2'
            // you can mention your own file path and file name
        },
        jsonData: {
            type: "ref",
            required: true,
            description: 'The JSON data in stringified form to be saved and uploaded.',
        },
        loanId: {
            type: "number"
        }
    },
    exits: {
        success: {
            description: 'The JSON file was successfully uploaded to S3.',
        },
        error: {
            description: 'An error occurred while uploading the file.',
        },
    },

    fn: async function (inputs, exits) {
        const {bucket, apiName, filePath, jsonData, loanId} = inputs;
        try {
            // Configure AWS S3
            const s3 = new AWS.S3({
                accessKeyId: sails.config.aws.key,
                secretAccessKey: sails.config.aws.secret,
                region: sails.config.aws.region,
            });
            const now = new Date().toISOString();;

            const uploadParams = {
                Bucket: bucket,
                Key: loanId ? `thirdPartyLogs/${apiName}/${loanId}/${filePath}/${now}/data.json` : `thirdPartyLogs/${apiName}/${filePath}/${now}/data.json`,
                Body: JSON.stringify(jsonData),
                ContentType: 'application/json',
            };


            // Upload to S3
            console.log(uploadParams)
            await s3.upload(uploadParams).promise();

            // Return success
            return exits.success({message: 'File uploaded successfully.'});
        } catch (err) {
            sails.log.error('Error uploading JSON to S3:', err);
            return exits.error(err);
        }
    }

}
