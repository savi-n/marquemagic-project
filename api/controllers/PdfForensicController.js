module.exports = {
    pdfForensic: async function (req, res) {
        let uniqueId;
        try {
            const document = req.file('document');
            let reqType = req.param('req_type'),
                processType = req.param('process_type'),
                caseNo = req.param('ref_no');

            /* Generate the uniqueId for the request */
            uniqueId = await sails.helpers.getUniqueId();

            /* check if caseNo already is closed */
            if (caseNo) {
                let caseNoMasterRow = await CaseNoMaster.findOne({ case_no: caseNo });
                if (caseNoMasterRow) throw [400, 'CASE_EXISTS'];
            }

            /* Create initial record for the request */
            let curDate = await sails.helpers.istDateTime();
            await Promise.all([
                ClientRequest.create({
                    request_id: uniqueId,
                    req_datetime: curDate,
                    req_status: 'initiate',
                    created_at: curDate,
                    updated_at: curDate,
                    client_id: req.client_id,
                    req_type: processType ? processType.toUpperCase() : 'FORENSIC'
                }),
                RequestDocument.create({
                    client_id: req.client_id,
                    request_id: uniqueId,
                    is_active: 'active',
                    created_at: curDate,
                    updated_at: curDate,
                    request_type: processType ? processType.toUpperCase() : 'FORENSIC',
                    case_no: caseNo
                })
            ]);

            /* Validate that the reqPayload is correct */
            if (!document || !reqType || !processType) throw [400, 'MISSING_PARAMS']; //Required parameters missing
            if (reqType !== 'bank') throw [400, 'INVALID_REQTYPE']; //Invalid req_type. Please enter a valid req_type.
            if (processType !== 'forensic' && processType !== 'all') throw [400, 'INVALID_PROCESSTYPE']; //Invalid process_type. Please enter a valid process_type.

            curDate = await sails.helpers.istDateTime();
            await ClientRequest.update({ request_id: uniqueId }).set({
                req_status: 'inprogress',
                updated_at: curDate,
                sub_type: reqType.toUpperCase()
            })

            /* Get contentType and uploaded document name */
            let contentType, originalDocName;
            try {
                contentType = document._files[0].stream.headers['content-type'];
                originalDocName = document._files[0].stream.filename;
            } catch (err) { }

            /* Make sure it's a pdf file */
            if (contentType && contentType !== 'application/pdf') throw [400, 'NOT_PDF'];//Uploaded file format is not supported. Please upload a PDF file.


            const url = sails.config.forensic.url_pdf,
                cliData = req.client_data;
            const { white_label_id: whiteLabelId, id: userId } = cliData;

            const {
                s3_name: s3Name,
                s3_region: s3Region,
                cloud_provider: cloudProvider
            } = await WhiteLabelSolutionRd.findOne({
                select: ['s3_name', 's3_region', 'cloud_provider'],
                where: { id: whiteLabelId }
            });

            let uploadFile;
            const cloud = cloudProvider && cloudProvider.upload;/* Get the cloud name(aws/azure) */
            if (!s3Name || !s3Region || !cloud) throw [404, 'NO_BUCKET'];//No bucket found for the user.

            const filePath = `${s3Name}/users_${userId}`;
            try {
                if (cloud === 'azure') uploadFile = await sails.helpers.fileUpload(document, filePath, s3Region);
                else uploadFile = await sails.helpers.s3FileUpload(document, filePath, s3Region);
            } catch (err) {
                uploadFile = 'UPLOAD_FAILED';
            }

            if (uploadFile === 'UPLOAD_FAILED') throw [500, 'UPLOAD_FAILED'];//File upload failed. Please try again.

            if (!uploadFile || uploadFile.length == 0) {
                if (document && document.fieldName !== 'document') throw [400, 'NO_FILE_UPLOAD'];//No file was uploaded. Please upload a file.
                throw [500, 'UPLOAD_FAILED'];//File upload failed. Please try again.
            }

            let docName = uploadFile[0].fd;
            let reqPayload = {
                unique_id: uniqueId,
                user_id: userId,
                doc_name: docName,
                white_label_id: whiteLabelId,
                s3bucket: s3Name,
                region: s3Region,
                cloud,
                req_type: "bank",
                callback_urls: {
                    updateData: `${sails.config.hostName}/${sails.config.forensic.callback.updateData}`,
                    updateImageLoc: `${sails.config.hostName}/${sails.config.forensic.callback.updateImageLoc}`
                }
            };

            console.log("pdfForensic reqPayload=> ", reqPayload);

            let response = {
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: `Successfully fetched data.`,
                forensicData: undefined
            }

            let [forensicApiRes, extractionApiRes] = await Promise.all([
                sails.helpers.apiTrigger(
                    url,
                    JSON.stringify(reqPayload),
                    { 'content-type': 'application/json' },
                    'POST'
                ),
                sails.helpers.commonExtractor(
                    sails.config.kycExtraction.urls.bank,
                    reqPayload
                ),
            ])
            let forensicData, extractionData;
            try {
                forensicData = JSON.parse(forensicApiRes);
            } catch (err) {
                console.log(err);
                forensicData = 'BAD_GATEWAY';
            }
            if (forensicData === 'BAD_GATEWAY') throw [502, 'BAD_GATEWAY']; //`Server error. Bad gateway`

            forensicData = {
                Status: forensicData.Status,
                unique_id: uniqueId,
                doc_name: originalDocName,
                ref_no: caseNo,
                Result: forensicData.Result
            }

            extractionData = extractionApiRes[1];

            /* The froensicData Result key comes as a string from ML on failure cases. Hnadling it making it an object for failure cases too */
            if (forensicData.Status !== 'success') forensicData.Result = { message: forensicData.Result };

            /* Generate download link */
            // let isAws = (reqPayload.cloud === 'aws') ? 1 : 0,
            //     linkValidFor = (60 * 60 * 24 * 6.5);/* Link valid for 6.5 days */
            // let downloadLink = await sails.helpers.getS3ImageUrl(docName, `${s3Name}/users_${userId}`, s3Region, isAws, linkValidFor);

            /* Store the response */
            // response.downloadLinkMain = downloadLink;

            response.forensicData = forensicData;
            response.extractionData = extractionData;
            curDate = await sails.helpers.istDateTime();
            await Promise.all([
                ClientRequest.update({ request_id: uniqueId }).set({
                    req_status: 'completed',
                    updated_at: curDate,
                    sub_type: reqType.toUpperCase()
                }),
                RequestDocument.update({ request_id: uniqueId }).set({
                    updated_at: curDate,
                    response: JSON.stringify(response),
                    s3_name: JSON.stringify({ main: s3Name }),
                    s3_region: JSON.stringify({ main: s3Region }),
                    cloud: JSON.stringify({ main: cloud }),
                    s3_filepath: JSON.stringify({ main: `${filePath}/${docName}` }),
                    file_processing: 'notApplicable'
                })
            ]);

            /* remove the downloadLink from response */
            //if (response.downloadLinkMain) delete response.downloadLinkMain;

            return res.send(response);

        } catch (err) {
            console.log(err);
            let message, statusCode = err[0] || 500, resCode = err[1];
            if (resCode === 'MISSING_PARAMS') message = 'Required parameters missing';
            else if (resCode === 'INVALID_REQTYPE') message = 'Invalid req_type. Please enter a valid req_type.';
            else if (resCode === 'INVALID_PROCESSTYPE') message = 'Invalid process_type. Please enter a valid process_type.';
            else if (resCode === 'NOT_PDF') message = 'Uploaded file format is not supported. Please upload a PDF file.';
            else if (resCode === 'NO_BUCKET') message = 'No bucket found for the user.';
            else if (resCode === 'UPLOAD_FAILED') message = 'File upload failed. Please try again.';
            else if (resCode === 'NO_FILE_UPLOAD') message = 'No file was uploaded. Please upload a file.';
            else if (resCode === 'CASE_EXISTS') message = 'Report generation request already placed for this ref_no/case_no. New upload not allowed for this ref_no/case_no.'
            else if (resCode === 'BAD_GATEWAY') message = 'Server error. Bad gateway';

            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            /* update database and send response back */
            if (uniqueId) {
                let curDate = await sails.helpers.istDateTime();
                await Promise.all([
                    ClientRequest.update({ request_id: uniqueId }).set({
                        req_status: 'failed',
                        updated_at: curDate
                    }),
                    RequestDocument.update({ request_id: uniqueId }).set({
                        updated_at: curDate,
                        response: JSON.stringify(response)
                    })
                ])
            }


            return res.status(statusCode).send(response);

        }

    }
};

