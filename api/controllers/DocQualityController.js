/**
 * DocQualityController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    initiate: async function (req, res) {
        let requestId;
        try {
            const document = req.file('document');

            if (!document || document.isNoop) {
                throw [400, 'NO_FILE_UPLOAD'];
            }

            let contentType = document._files[0].stream.headers['content-type'];

            if (contentType !== 'application/pdf') {
                throw [400, 'NOT_PDF'];
            }

            requestId = await sails.helpers.getUniqueId();

            const { white_label_id: whiteLabelId, id: userId } = req.client_data;

            let curDate = await sails.helpers.dateTime();

            const [clientReqRow, requestDocumentRow, WhiteLabelSolutionRow] = await Promise.all([
                ClientRequest.create({
                    client_id: req.client_id,
                    request_id: requestId,
                    req_datetime: curDate,
                    req_status: 'initiate',
                    created_at: curDate,
                    updated_at: curDate,
                    req_type: sails.config.clientReqTypes.docQuality
                }).fetch(),
                RequestDocument.create({
                    client_id: req.client_id,
                    request_id: requestId,
                    created_at: curDate,
                    updated_at: curDate,
                    request_type: sails.config.clientReqTypes.docQuality
                }).fetch(),
                WhiteLabelSolutionRd.findOne({
                    select: ['s3_name', 's3_region', 'cloud_provider'],
                    where: { id: whiteLabelId }
                })
            ]);

            /*Get the bucket name and region*/
            const { s3_name: s3Name, s3_region: s3Region, cloud_provider: cloudProvider } = WhiteLabelSolutionRow;

            let cloud = cloudProvider && cloudProvider.upload;

            let bucket = `${s3Name}/users_${userId}`,
                region = s3Region,
                uploadFile;

            /* Uploading the file to s3 bucket/azure blob */
            try {
                if (cloud === 'azure') {
                    uploadFile = await sails.helpers.fileUpload(document, bucket, region);
                } else {
                    uploadFile = await sails.helpers.s3FileUpload(document, bucket, region);
                }
            } catch (err) {
                console.log(err);
                if (err.code === 'uploadError') response = { status: 'nok', statusCode: 'NC500', message: 'File upload failed due to network slowdown. Please try again.' };
                else response = { status: 'nok', statusCode: 'NC500', resCode: 'UPLOAD_FAILED', message: 'File upload failed. Please try again.' };
                curDate = await sails.helpers.dateTime();
                return res.status(500).send(response);
            }

            let docName = uploadFile[0].fd;

            let reqPayload = {
                user_id: userId,
                doc_name: docName,
                white_label_id: whiteLabelId,
                s3bucket: s3Name,
                region,
                cloud,
                callback: `${sails.config.hostName}/docQuality/update`,
                uniqueId: requestId
            }

            let url = sails.config.mlApis.docQuality;
            console.log(reqPayload);

            let apiResponse = await sails.helpers.apiTrigger(
                url,
                JSON.stringify(reqPayload),
                { "content-type": "application/json" },
                'POST'
            );

            console.log(apiResponse, requestId);
            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: 'Process initiated. Please check for results in callback api with the uniqueId.',
                uniqueId: requestId
            });

        } catch (err) {
            console.log(err);

            let message, statusCode = err[0] || 500, resCode = err[1];
            message = sails.config.msgConstants[resCode];
            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            };

            let curDate = await sails.helpers.dateTime();
            if (requestId) {
                await ClientRequest.update({ request_id: requestId }).set({
                    req_datetime: curDate,
                    updated_at: curDate,
                    req_status: 'failed',
                    response: JSON.stringify(response)
                });
            }

            return res.status(statusCode).send(response);
        }
    },

    initiateHFC: async function (req, res) {
        let requestId;
        try {
            const document = req.file('document');

            if (!document || document.isNoop) {
                throw [400, 'NO_FILE_UPLOAD'];
            }

            let contentType = document._files[0].stream.headers['content-type'];

            // if (contentType !== 'application/pdf') {
            //     throw [400, 'NOT_PDF'];
            // }

            requestId = await sails.helpers.getUniqueId();

            const { white_label_id: whiteLabelId, id: userId } = req.client_data;

            let curDate = await sails.helpers.dateTime();

            const [clientReqRow, requestDocumentRow, WhiteLabelSolutionRow] = await Promise.all([
                ClientRequest.create({
                    client_id: req.client_id,
                    request_id: requestId,
                    req_datetime: curDate,
                    req_status: 'initiate',
                    created_at: curDate,
                    updated_at: curDate,
                    req_type: sails.config.clientReqTypes.docQuality
                }).fetch(),
                RequestDocument.create({
                    client_id: req.client_id,
                    request_id: requestId,
                    created_at: curDate,
                    updated_at: curDate,
                    request_type: sails.config.clientReqTypes.docQuality
                }).fetch(),
                WhiteLabelSolutionRd.findOne({
                    select: ['s3_name', 's3_region', 'cloud_provider'],
                    where: { id: whiteLabelId }
                })
            ]);

            /*Get the bucket name and region*/
            const { s3_name: s3Name, s3_region: s3Region, cloud_provider: cloudProvider } = WhiteLabelSolutionRow;

            let cloud = cloudProvider && cloudProvider.upload;

            let bucket = `${s3Name}/users_${userId}`,
                region = s3Region,
                uploadFile;

            /* Uploading the file to s3 bucket/azure blob */
            try {
                if (cloud === 'azure') {
                    uploadFile = await sails.helpers.fileUpload(document, bucket, region);
                } else {
                    uploadFile = await sails.helpers.s3FileUpload(document, bucket, region);
                }
            } catch (err) {
                console.log(err);
                if (err.code === 'uploadError') response = { status: 'nok', statusCode: 'NC500', message: 'File upload failed due to network slowdown. Please try again.' };
                else response = { status: 'nok', statusCode: 'NC500', resCode: 'UPLOAD_FAILED', message: 'File upload failed. Please try again.' };
                curDate = await sails.helpers.dateTime();
                return res.status(500).send(response);
            }

            let docName = uploadFile[0].fd;

            let reqPayload = {
                user_id: userId,
                doc_name: docName,
                white_label_id: whiteLabelId,
                s3bucket: s3Name,
                region,
                cloud,
                callback: `${sails.config.hostName}/docQuality/update`,
                uniqueId: requestId
            }

            let url = sails.config.mlApis.docQuality;
            console.log(reqPayload);

            let apiResponse = await sails.helpers.apiTrigger(
                url,
                JSON.stringify(reqPayload),
                { "content-type": "application/json" },
                'POST'
            );

            console.log(apiResponse, requestId);
            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: 'Process initiated. Please check for results in callback api with the uniqueId.',
                uniqueId: requestId
            });

        } catch (err) {
            console.log(err);

            let message, statusCode = err[0] || 500, resCode = err[1];
            message = sails.config.msgConstants[resCode];
            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            };

            let curDate = await sails.helpers.dateTime();
            if (requestId) {
                await ClientRequest.update({ request_id: requestId }).set({
                    req_datetime: curDate,
                    updated_at: curDate,
                    req_status: 'failed',
                    response: JSON.stringify(response)
                });
            }

            return res.status(statusCode).send(response);
        }
    },

    update: async function (req, res) {
        let { uniqueId, data, status } = req.allParams();
        let stringfiedData = JSON.stringify(data);

        try {
            await RequestDocument
                .update({ request_id: uniqueId, request_type: 'DOC_QUALITY' })
                .set({ response: stringfiedData });

            await ClientRequest
                .update({ request_id: uniqueId })
                .set({ req_status: status })

            return res.send('ok');
        } catch (err) {
            console.log(err);
            return res.send('nok');
        }

    },

    status: async function (req, res) {
        try {
            const requestId = req.param('uniqueId');

            if (!requestId) throw [400, 'MISSING_PARAMS'];

            let clientRequestData = await ClientRequest.findOne({
                select: ['req_status'],
                where: { request_id: requestId }
            });

            if (!clientRequestData) throw [400, 'REQ_ID_NOT_FOUND']

            let reqStatus = clientRequestData && clientRequestData.req_status;

            let response = {
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'UNKNOWN',
                message: undefined,
                data: undefined
            };

            switch (reqStatus) {
                case 'initiate':
                    response.resCode = 'INITIATED',
                        response.message = "The process is initiated. It'll be completed soon."
                    break;
                case 'inprogress':
                    response.resCode = 'INPROGRESS',
                        response.message = "The process is in progress. It'll be completed soon."
                    break;
                case 'completed':
                    let requestDocumentData = await RequestDocument.findOne({
                        select: ['response'],
                        where: { request_id: requestId }
                    });

                    let data = JSON.parse(requestDocumentData.response);
                    response.resCode = 'COMPLETED',
                        response.message = "Process completed."
                    response.data = data;
                    break;
                case 'failed':
                    response.resCode = 'FAILED',
                        response.message = "This process has failed."
                    break;
            }

            return res.send(response);

        } catch (err) {
            console.log(err);

            let message, statusCode = err[0] || 500, resCode = err[1];
            message = sails.config.msgConstants[resCode];
            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            };

            return res.status(statusCode).send(response);
        }


    }

};

