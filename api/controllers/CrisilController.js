/**
 * CrisilController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { v4: uuidv4 } = require('uuid');

module.exports = {
    placeData: async function (req, res, next) {
        let pages = req.param('pages'), resCode;
        const document = req.file('document');

        /* Generate unique ids for the process */
        const uniqueId = uuidv4(), rowIdentifier = uuidv4();

        /* Create requestId and create a record in database */
        const requestId = await sails.helpers.getUniqueId();
        let curDate = await sails.helpers.dateTime();
        const { white_label_id: whiteLabelId, id: userid, client_id: clientId } = req.client_data;
        await ClientRequest.create({
            request_id: requestId,
            client_id: clientId,
            req_datetime: curDate,
            generated_key: uniqueId,
            req_status: 'initiate',
            is_active: 'active',
            created_at: curDate,
            updated_at: curDate,
            sub_type: 'CRISIL'
        });

        try {
            if (document && document.isNoop) throw [400, 'NO_FILE_UPLOAD'];

            if (!pages) throw [400, 'MISSING_PARAMS'];

            /* Get the referencename(filename without extension) */
            let filename = document._files[0].stream.filename;
            let filenameArr = filename.split('.');
            filenameArr = filenameArr.slice(0, -1);
            let referenceName = filenameArr.join('.');

            let pagesArray = pages.split(",");
            console.log(pagesArray);
            pages = pagesArray.map(el => parseInt(el.trim()));
            pages.forEach(element => {
                if (isNaN(element)) throw [400, 'PAGENO_ERR'];
            });

            /* Get the file upload location */
            const { s3_name: s3Name, s3_region: s3Region, cloud_provider: cloudProvider } = await WhiteLabelSolutionRd.findOne({
                select: ['s3_name', 's3_region', 'cloud_provider'],
                where: { id: whiteLabelId }
            });

            const cloud = cloudProvider && cloudProvider.upload;/* Get the cloud name(aws/azure) */
            if (!s3Name || !s3Region || !cloud) throw [404, 'NO_BUCKET'];

            const bucket = `${s3Name}/users_${userid}`;
            let uploadFile, docName;

            try {
                uploadFile = await sails.helpers.s3FileUpload(document, bucket, s3Region);
                docName = uploadFile[0].fd;
                if (!docName.includes('.pdf')) resCode = 'NOT_PDF';
            } catch (err) {
                console.log(err);
                resCode = 'UPLOAD_FAILED';
            }

            if (resCode === 'NOT_PDF') throw [400, resCode];
            else if (resCode === 'UPLOAD_FAILED') throw [500, resCode];

            const payload = {
                unique_id: uniqueId,
                s3Name,
                white_label_id: whiteLabelId,
                userid,
                pdf_file: docName,
                status: 'pending',
                row_identifier: rowIdentifier,
                aws_region: s3Region,
                pages,
                reference_name: referenceName
            }
            const url = sails.config.crisil.urls.placeData;

            try {
                let apiRes = await sails.helpers.apiTrigger(
                    url,
                    JSON.stringify(payload),
                    { "content-type": "application/json" },
                    'POST'
                );
                console.log('apiRes=> ', apiRes);
            } catch (err) {
                console.log(err);
                resCode = 'BAD_GATEWAY';
            }

            if (resCode === 'BAD_GATEWAY') throw [502, resCode];

            console.log('payload=> ', payload);
            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: 'Data placed',
                unique_id: uniqueId
            });

        } catch (err) {
            console.log(err);
            let message, statusCode = err[0] || 500, resCode = err[1];
            if (resCode === 'MISSING_PARAMS') message = 'Required parameters missing.';
            else if (resCode === 'PAGENO_ERR') message = 'Pass the pages as comma separated string.';
            else if (resCode === 'NOT_PDF') message = 'Uploaded file format is not supported. Please upload a PDF file.';
            else if (resCode === 'NO_BUCKET') message = 'No bucket found for the user.';
            else if (resCode === 'UPLOAD_FAILED') message = 'File upload failed. Please try again.';
            else if (resCode === 'NO_FILE_UPLOAD') message = 'No file was uploaded. Please upload a file.';
            else if (resCode === 'BAD_GATEWAY') message = 'Server error. Bad gateway';

            try {
                /*update database and return response*/
                curDate = await sails.helpers.dateTime();
                await ClientRequest.update({ request_id: requestId }).set({
                    updated_at: curDate,
                    is_active: 'inactive',
                    req_status: 'failed'
                })
            } catch (err) {
                console.log(err);
                resCode = 'DB_ERROR', message = 'Database manipulation error!'
            }


            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            return res.status(statusCode).send(response);
        }
    },

    checkDataStatus: async function (req, res, next) {
        let uniqueId = req.param('unique_id'), apiRes, status, reqStatus, link;

        try {
            if (uniqueId == null || uniqueId == '') throw [400, 'MISSING_PARAMS'];
            /* Check whether the unique id is correct or not */
            let storedRecord = await ClientRequest.findOne({ generated_key: uniqueId });
            if (!storedRecord) throw [404, 'WRONG_UNIQUEID'];

            const url = sails.config.crisil.urls.checkDataStatus;
            try {
                apiRes = await sails.helpers.apiTrigger(
                    url,
                    JSON.stringify({ unique_id: uniqueId }),
                    { "content-type": "application/json" },
                    'POST'
                );
                apiRes = JSON.parse(apiRes);

                console.log(apiRes);
                console.log(apiRes.extractedfile, apiRes.s3Name, apiRes.aws_region);
                let fileLocation = `${apiRes.s3Name}/users_${apiRes.userid}`, fileName;
                status = apiRes.status;
                if (status === 'completed') {
                    fileName = apiRes.extractedfile;
                    reqStatus = 'completed';
                }
                else if (status === 'extracted') {
                    fileName = apiRes.extractedfile;
                    reqStatus = 'inprogress';
                }

                if (status) {
                    curDate = await sails.helpers.dateTime();
                    [link] = await Promise.all([
                        sails.helpers.getS3ImageUrl(fileName, fileLocation, apiRes.aws_region, 1),
                        ClientRequest.update({ generated_key: uniqueId }).set({
                            updated_at: curDate,
                            req_status: reqStatus
                        })
                    ])
                }

            } catch (err) {
                console.log(err);
                throw [502, 'BAD_GATEWAY'];
            }

            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: 'Status fetched.',
                data: {
                    status,
                    link,
                    info: apiRes.info || undefined,
                    error: apiRes.error || undefined,
                }
            });
        } catch (err) {
            console.log(err);
            let message, statusCode = err[0] || 500, resCode = err[1];
            if (resCode === 'MISSING_PARAMS') message = 'Required parameters missing.';
            else if (resCode === 'WRONG_UNIQUEID') message = 'Wrong unique_id passed.';
            else if (resCode === 'BAD_GATEWAY') message = 'Server error. Bad gateway.';

            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            return res.status(statusCode).send(response);
        }

    }

};

