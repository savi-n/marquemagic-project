const fs = require("fs");
const {v4: uuidv4} = require("uuid");

const {BlobServiceClient, StorageSharedKeyCredential} = require("@azure/storage-blob");
const AWS = require('aws-sdk');
let fileName;
const deployToAzureFromStream = async (stream, extension, account, accountKey, container, userId) => {
    try {
        const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
        const blobServiceClient = new BlobServiceClient(
            `https://${account}.blob.core.windows.net`,
            sharedKeyCredential
        );

        const uniqueId = uuidv4()
        fileName = `${uniqueId}.${extension}`;

        const containerClient = blobServiceClient.getContainerClient(`${container}/users_${userId}`);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        await blockBlobClient.uploadStream(stream);
        console.log(`downloadlink=> https://${account}.blob.core.windows.net/${container}/users_${userId}/${fileName}`);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

const deployToAwsFromStream = async (stream, extension, ContentType, key, secret, bucket, region, userId) => {
    try {
        AWS.config.update({
            key,
            secret,
            region
        });

        const s3 = new AWS.S3();

        const uniqueId = uuidv4();
        fileName = `${uniqueId}.${extension}`;
        let params = {
            Bucket: `${bucket}/users_${userId}`,
            Key: fileName,
            Body: stream,
            ContentType,
            ACL: 'public-read'
        };

        let uploadRes = await s3.upload(params).promise();
        console.log(`downloadLink=> ${uploadRes.Location}`);
        return true;
    } catch (err) {
        return false;
    }

}

process.on('message', async function (req) {
    let {filePath, extension, ContentType, s3_name, s3_region, azureActive, azureCred, awsCred, userId} = req;
    let stream = await fs.createReadStream(filePath);

    await fs.unlinkSync(filePath);
    let fileUploaded;

    if (azureActive) {
        fileUploaded = await deployToAzureFromStream(
            stream,
            extension,
            azureCred.account,
            azureCred.accountKey,
            s3_name,
            userId
        );
    } else {
        fileUploaded = await deployToAwsFromStream(
            stream,
            extension,
            ContentType,
            awsCred.key,
            awsCred.secret,
            s3_name,
            s3_region,
            userId
        );
        console.log(fileUploaded);
    }

    if (fileUploaded) process.send({message: 'Upload', data: fileName});
    else process.send('file uplaod failed');

    process.exit();
});
