const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const md5 = require('md5');

const TIMEOUT = 52, INTERVAL = 1000;



const insertKycDataToBigQuery = (async (bigQueryData, req, response, reqType) => {
    bigQueryData.ID = md5(req.headers.authorization + req.allParams().req_type) || 0;
    bigQueryData.requested_file_classification = req.allParams().req_type || 0;
    bigQueryData.doc_tag = response.data.docTag || 0;
    bigQueryData.response_message = response.data.status || 0;
    bigQueryData.error_description = response.data.cause || 0;
    bigQueryData.file_output_classification = response.data.classifiedType || 0;
    bigQueryData.file_output_sub_classification = response.data.subClassification || 0;
    bigQueryData.response_time = response.data.extractionTime || 0;
    bigQueryData.kyc_encrypted_id = md5(response.extractionData[sails.config.kycKeyConstants[reqType]] || "") || 0;
    bigQueryData = { ...bigQueryData, ...response.data.logData };



    await sails.helpers.logToBigQuery(
        sails.config.kycExtraction.bigQuery.dataset,
        sails.config.kycExtraction.bigQuery.table,
        bigQueryData
    );
});


module.exports = {
    /* This is client facing KYC extraction API */
    getKycData: async function (req, res) {
        let uniqueRandomId, id, originalDocName;
        try {
            const document = req.file('document');

            let {
                req_type: reqType,
                process_type: processType,
                ref_id: refId,
                application_no: caseNo } = req.allParams(), response;

            uniqueRandomId = await sails.helpers.getUniqueId();

            /* Check if consolidation request already been put for this caseNo */
            if (caseNo) {
                let caseNoMasterRow = await CaseNoMaster.findOne({ case_no: caseNo });
                if (caseNoMasterRow) throw [400, 'CASE_EXISTS'];
            }

            /* Make default processType extraction */
            if (!processType) {
                processType = 'extraction';
            }

            if (!reqType || !document) {
                throw [400, 'MISSING_PARAMS'];
            }

            /* If there is no file upload to the document key in req payload then documnt.isNoop will be true */
            let contentType = (document) && (!document.isNoop) && document._files[0].stream.headers['content-type'];

            if (contentType &&
                contentType !== 'image/jpeg' &&
                contentType !== 'image/png' &&
                contentType !== 'application/pdf'
            ) {
                throw [400, 'UNSUPPORTED_FORMAT'];
            }

            try {
                /* This block is to log the details in log files */
                const { name, filename, byteCount } = document._files[0].stream;
                originalDocName = document._files[0].stream.filename;
                sails.log(`Files => "${name}": "${filename}", "size": ${byteCount / 1024} KB`);
            } catch (err) { }

            // if (reqType === 'DL') reqType = 'license';
            // else if (reqType === 'voterid') reqType = 'voter';
            // let type = reqType.charAt(0).toUpperCase() + reqType.slice(1);

            /* Get the correct reqType value for ML api call */
            reqType = sails.config.validRequestTypes[reqType];

            const {
                white_label_id: whiteLabelId,
                id: userId
            } = req.client_data;

            /* Create the initial records */
            let curDate = await sails.helpers.istDateTime(),
                activityName = sails.config.processNames[processType],
                subType = sails.config.subTypes[reqType],
                type = sails.config.jsonType[reqType];

            let rowToBeCreated = {
                client_id: req.client_id,
                request_id: uniqueRandomId,
                created_at: curDate,
                updated_at: curDate,
                request_type: activityName,
                response: JSON.stringify({}),
                case_no: (processType === 'forensic') ? caseNo : undefined
            };

            // if (reqType === 'license') subType = 'DL';
            // else if (reqType === 'aadhar' || reqType === 'aadhar_redact') subType = 'AADHAAR';
            // else subType = reqType.toUpperCase();

            const [clientReqRow, requestDocumentRow, WhiteLabelSolutionRow] = await Promise.all([
                sails.helpers.clientRequestRecord(
                    'create',
                    uniqueRandomId,
                    req.client_id,
                    'initiate',
                    activityName,
                    subType
                ),
                RequestDocument.create(rowToBeCreated).fetch(),
                WhiteLabelSolutionRd.findOne({
                    select: ['s3_name', 's3_region', 'cloud_provider'],
                    where: { id: whiteLabelId }
                })
            ]);

            id = requestDocumentRow.id;

            /*Get the bucket name and region*/
            const {
                s3_name: s3Name,
                s3_region: s3Region,
                cloud_provider: cloudProvider
            } = WhiteLabelSolutionRow;


            let cloud = (cloudProvider) && (cloudProvider.upload);

            if (!s3Name || !s3Region || !cloud) {
                throw ['404', 'NO_BUCKET'];
            }

            let bucket = `${s3Name}/users_${userId}`,
                region = s3Region,
                uploadFile;

            if (reqType !== 'pan' &&
                reqType !== 'aadhar' &&
                reqType !== 'aadhar_redact' &&
                reqType !== 'passport' &&
                reqType !== 'mask' &&
                reqType !== 'voter' &&
                reqType !== 'license' &&
                reqType !== 'itr' &&
                reqType !== 'bank' &&
                reqType !== 'gst' &&
                reqType !== 'pnl' &&
                reqType !== 'bs' &&
                reqType !== 'salary' &&
                reqType !== 'cibil') {
                throw [400, 'INV_REQ_TYPE'];
            }

            if (reqType !== 'mask' &&
                processType !== 'extraction' &&
                processType !== 'verification' &&
                processType !== 'forensic' &&
                processType !== 'all') {
                throw [400, 'INV_PROCESS_TYPE'];
            }

            // if (reqType === 'itr' && processType !== 'forensic' && processType !== 'all') {
            //     throw [400, 'INV_PROCESS_TYPE'];
            // }

            /* Uploading the file to s3 bucket/azure blob */
            try {
                if (cloud === 'azure') {
                    uploadFile = await sails.helpers.fileUpload(document, bucket, region);
                } else {
                    uploadFile = await sails.helpers.s3FileUpload(document, bucket, region);
                }
            } catch (err) {
                if (err.code === 'uploadError') {
                    throw [500, 'UPLOAD_ERR'];
                }
                throw [500, 'UPLOAD_FAILED'];
            }

            /* If before file upload, the program is returned then the code will break.
             That's why below condition is after fileUpload block. */
            if (document && document.isNoop) {
                throw [400, 'NO_FILE_UPLOAD'];
            }

            if (!uploadFile || uploadFile.length == 0) {
                throw [500, 'UPLOAD_FAILED'];
            }

            sails.log('file uploaded');

            let docName = uploadFile[0].fd;

            response = {
                status: 'ok',
                statusCode: 'NC200',
                message: `${type} Details`,
                type: reqType,
                extractionData: undefined,
                verificationData: undefined,
            }

            let reqPayload = {
                user_id: userId,
                doc_name: docName,
                white_label_id: whiteLabelId,
                s3bucket: s3Name,
                region: s3Region,
                cloud,
                req_type: reqType,
                file_type: (contentType === 'application/pdf') ? 'pdf' : 'image',
                system: 'api'
            },
                statusCode,
                helperRes,
                _statusCode,
                _helperRes;

            if (reqType === 'mask') {
                [statusCode, helperRes] = await sails.helpers.maskImage(reqPayload, s3_name, s3_region, cloud);
                return res.status(statusCode).send(helperRes);
            }

            let base64String = '';

            if (processType === 'forensic') {
                [statusCode, helperRes] = await sails.helpers.kycFraudCheck(reqPayload, originalDocName, uniqueRandomId, caseNo);
                if (statusCode !== 200) {
                    curDate = await sails.helpers.istDateTime();
                    await Promise.all([
                        sails.helpers.clientRequestRecord('update', uniqueRandomId, req.client_id, 'failed'),
                        RequestDocument.update({ id }).set({ response: JSON.stringify(helperRes), updated_at: curDate })
                    ]);
                }
                return res.status(statusCode).send(helperRes);
            } else if (processType === 'all') {
                let extractionApiRes = null, fraudApiRes = null;

                if (reqType === "bank" ||
                    reqType === "salary" ||
                    reqType === "pnl" ||
                    reqType === "bs" ||
                    reqType === "gst" ||
                    reqType === "itr" ||
                    reqType === "cibil") {
                    if (reqType === "itr") {
                        [extractionApiRes, fraudApiRes] = await Promise.all([sails.helpers.commonExtractor(
                            sails.config.kycExtraction.urls[reqType],
                            reqPayload
                        ),
                        sails.helpers.commonExtractor(
                            sails.config.forensic[reqType],
                            {
                                ...reqPayload,
                                callback_urls: {
                                    updateData: `${sails.config.hostName}/${sails.config.forensic.callback.updateData}`,
                                    updateImageLoc: `${sails.config.hostName}/${sails.config.forensic.callback.updateImageLoc}`
                                }
                            },
                            uniqueRandomId
                        )
                        ]);
                    } else {
                        [extractionApiRes, fraudApiRes] = await Promise.all([sails.helpers.commonExtractor(
                            sails.config.kycExtraction.urls[reqType],
                            reqPayload
                        ),
                        sails.helpers.commonExtractor(
                            sails.config.forensic[reqType],
                            {
                                ...reqPayload,
                                callback_urls: {
                                    updateImageLoc: `${sails.config.hostName}/${sails.config.forensic.callback.updateImageLoc}`
                                }
                            },
                            uniqueRandomId
                        )
                        ]);
                    }



                    if (fraudApiRes == null) {
                        fraudApiRes = [200];
                        fraudApiRes[1] = {
                            resCode: "SUCCESS",
                            status: "ok",
                            statusCode: "NC200",
                            doc_name: originalDocName,
                            requestId: uniqueRandomId,
                            forensicData: {
                                Status: "success",
                                doc_name: originalDocName,
                                unique_id: uniqueRandomId,
                                Result: [{
                                    message: `forensic is not available for ${reqType.toUpperCase()} currently`
                                }]
                            }
                        }
                    } else {
                        fraudApiRes[1] = {
                            resCode: "SUCCESS",
                            status: "ok",
                            statusCode: "NC200",
                            doc_name: originalDocName,
                            requestId: uniqueRandomId,
                            forensicData: {
                                Status: "success",
                                ...fraudApiRes[1],
                                doc_name: originalDocName,
                                unique_id: uniqueRandomId
                            }
                        };
                    }
                } else {
                    [extractionApiRes, fraudApiRes] = await Promise.all([
                        sails.helpers.kycExtraction(id, reqType, reqPayload, refId, caseNo),
                        sails.helpers.kycFraudCheck(reqPayload, originalDocName, uniqueRandomId)
                    ]);
                }
                [statusCode, helperRes, kyc_key] = extractionApiRes;
                [_statusCode, _helperRes] = fraudApiRes;
                response = _helperRes || {};
            } else {
                let [apiRes, dbRes] = await Promise.all([
                    sails.helpers.kycExtraction(id, reqType, reqPayload, refId),
                    RequestDocument.update({ request_id: uniqueRandomId }).set({
                        s3_name: s3Name,
                        s3_region: s3Region,
                        cloud,
                        s3_filepath: `users_${userId}/${docName}`
                    })
                ]);
                [statusCode, helperRes, kyc_key, base64String] = apiRes;
            }

            if (statusCode !== 200) {
                curDate = await sails.helpers.istDateTime();
                if (id && uniqueRandomId) {
                    await Promise.all([
                        sails.helpers.clientRequestRecord('update', uniqueRandomId, req.client_id, 'failed'),
                        RequestDocument.update({ id }).set({ response: JSON.stringify(helperRes), updated_at: curDate })
                    ]);
                }
                return res.status(statusCode).send(helperRes);
            } else response.extractionData = helperRes;

            let extractionData = helperRes;

            if (processType === 'verification' || processType === 'all') {
                let essentials;
                if (reqType === 'pan') {
                    essentials = {
                        "number": extractionData.Pan_number,
                        "name": extractionData.Name,
                        "fuzzy": "true"
                    }
                } else if (reqType === 'voter') {
                    essentials = {
                        "epicNumber": extractionData.vid,
                        "name": extractionData.name,
                        "state": extractionData.state,
                    }
                } else if (reqType === 'license') {
                    essentials = {
                        "number": extractionData.dl_no,
                        "dob": extractionData.dob.replace(/[-.]/g, "/"),
                        //"issueDate": extractionData.issue_date.replace(/[-.]/g, "/"),
                    }
                } else if (reqType === 'passport') {
                    essentials = {
                        "fileNumber": extractionData.file_number,
                        "dob": extractionData.dob,
                        "name": extractionData.name,
                        "fuzzy": "true",
                    }
                }

                if (essentials) [statusCode, helperRes] = await sails.helpers.kycVerification(reqType, essentials);
                else helperRes = null;

                response.verificationData = helperRes;
            }

            curDate = await sails.helpers.istDateTime();
            response.requestId = uniqueRandomId;
            let reqDocumentRow = {
                response: JSON.stringify(response),
                updated_at: curDate,
                CIN_GST_PAN_number: kyc_key
            };

            if (id && uniqueRandomId) {
                await Promise.all([
                    ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: 'completed' }),
                    RequestDocument.update({ id }).set(reqDocumentRow)
                ]);
            }

            if (base64String) response.base64String = base64String;

            return res.status(200).send(response);

        } catch (err) {
            console.log('Server error =>', err);
            let message, statusCode = err[0] || 500, resCode = err[1];
            message = sails.config.msgConstants[resCode];

            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            response.requestId = uniqueRandomId;

            if (uniqueRandomId && id) {
                let curDate = await sails.helpers.istDateTime()
                await Promise.all([
                    sails.helpers.clientRequestRecord('update', uniqueRandomId, req.client_id, 'failed'),
                    RequestDocument.update({ id: id }).set({ response: JSON.stringify(response), updated_at: curDate })
                ])
            }

            return res.status(statusCode).send(response);
        }
    },

    /* This is our internal KYC extraction API */
    getKycDataUiUx: async function (req, res) {
        let secondsPassed = 0, result, responseReturned = false;
        const getData = new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (result) {
                    clearInterval(interval);
                    resolve(result);
                }
                else if (secondsPassed > TIMEOUT) {
                    clearInterval(interval);
                    reject([502, {
                        status: 'nok',
                        statusCode: 'NC502',
                        resCode: 'GATEWAY_TIMEOUT',
                        message: 'Extraction of data took longer than expected. Please try again!',
                    }]);
                }
                secondsPassed++;
            }, INTERVAL)
        })


        const main = async () => {
            const bigQueryVals = {
                valid: 1,
                invalid: 0,
                notApplicalbe: 2
            };

            //this query data has mostly nothing to do with our Business logic 
            //mainly it is for logging and ML improvement purposes
            //we'll keep adding and updating data in this object in further steps
            let bigQueryData = {
                'ID': bigQueryVals.valid,
                'doc_tag': bigQueryVals.invalid,
                'requested_file_classification': bigQueryVals.valid,
                'created_at': bigQueryVals.valid,
                'api_version': sails.config.kycExtraction.apiVersion,
                'whitelabel_id': bigQueryVals.valid,
                'response_code': 200,
                'response_message': bigQueryVals.valid,
                'error_description': bigQueryVals.valid,
                'response_time': bigQueryVals.notApplicalbe,
                'file_output_classification': bigQueryVals.valid,
                'file_output_sub_classification': bigQueryVals.invalid,
                'KYCID': bigQueryVals.valid,
                Name: bigQueryVals.notApplicalbe,
                DOB: bigQueryVals.notApplicalbe,
                DOI: bigQueryVals.notApplicalbe,
                Pincode: bigQueryVals.notApplicalbe,
                Expiary_Date: bigQueryVals.notApplicalbe,
                Issue_Place: bigQueryVals.notApplicalbe,
                File_number: bigQueryVals.notApplicalbe,
                Country_code: bigQueryVals.notApplicalbe,
                Address: bigQueryVals.notApplicalbe,
                Gender: bigQueryVals.notApplicalbe,
                Fathers_Name: bigQueryVals.notApplicalbe,
                kyc_encrypted_id: bigQueryVals.notApplicalbe,
                file_name: bigQueryVals.notApplicalbe
            }

            let uniqueRandomId;
            let {
                req_type: reqType,
                process_type: processType,
                ref_id: refId,
                product_id: product_id,
                pan_number: panNumber,
                doc_ref_id,
                director_id,
                business_id,
                passport_no
            } = req.allParams(), response;
            try {
                const document = req.file('document');

                if (!processType) processType = 'extraction'; /* default processType is extraction */

                if (!reqType) throw [400, 'MISSING_PARAMS'];

                /* Make sure req_type is a valid one */
                reqType = sails.config.validRequestTypes[reqType];

                if (!sails.config.requsetTypeArray.find(element => element == reqType)) throw [400, 'INV_REQ_TYPE'];

                /* Make sure processType is a valid one.
                If req_type is others, then process_type can only be fornsic.
                If req_type is mask then there is no need for process_type */
                if ((reqType !== 'mask' && !sails.config.processTypes.find(element => element == processType)) ||
                    (reqType === 'others' && processType !== 'forensic')
                ) throw [400, 'INV_PROCESS_TYPE'];
                /* If no document is uploaded document.isNoop is going to be true(boolean) */
                if (document && document.isNoop) throw [400, 'NO_FILE_UPLOAD'];

                let contentType = document._files[0].stream.headers['content-type'];

                if (contentType !== 'image/jpeg' && contentType !== 'image/png' && contentType != 'application/pdf') throw [400, 'UNSUPPORTED_FORMAT'];
                let originalDocName = document._files[0].stream.filename;

                /* Below try catch block is to log the file name & size. 
                It has nothing to do with the business logic of the code. */
                try {
                    const { name, filename, byteCount } = document._files[0].stream;
                    sails.log(`Files => "${name}": "${filename}", "size": ${byteCount / 1024} KB`);
                } catch (err) { }

                /* type is just reqType capitalised. Needed for showing message */
                let type = sails.config.jsonType[reqType];

                uniqueRandomId = await sails.helpers.getUniqueId();

                const { white_label_id, id: user_id } = req.client_data;
                bigQueryData.whitelabel_id = white_label_id;

                /* processName is going to be the request_type for request_document and client_rquest table */
                let processName = '';
                if (reqType !== 'mask') processName = sails.config.processNames[processType];

                /* Create the initial records. */
                let curDate = await sails.helpers.istDateTime(),
                    rowToBeCreated = {
                        client_id: req.client_id,
                        request_id: uniqueRandomId,
                        created_at: curDate,
                        updated_at: curDate,
                        request_type: processName,
                        response: JSON.stringify({})
                    },
                    subType;
                bigQueryData.created_at = curDate;

                subType = sails.config.subTypes[reqType];

                const [clientReqRow, requestDocumentRow, WhiteLabelSolutionRow] = await Promise.all([
                    sails.helpers.clientRequestRecord('create', uniqueRandomId, req.client_id, 'initiate', processName, subType),
                    RequestDocument.create(rowToBeCreated).fetch(),
                    // adding forensic_check column  to check whether forensic is required or not
                    WhiteLabelSolutionRd.findOne({
                        select: ['s3_name', 's3_region', 'cloud_provider', 'forensic_check'],
                        where: { id: white_label_id }
                    })
                ]);
                let id = requestDocumentRow.id;

                /*Get the bucket name and region*/
                let { s3_name, s3_region, cloud_provider, forensic_check } = WhiteLabelSolutionRow;
                let cloud = cloud_provider && cloud_provider.upload;

                //isForensic is a key which we'll get from the database for every white_label_id
                //some banks allow to get forensic checks while some don't 
                //isForensic tells us whether we require the forensic check for this particular bank or not
                let isForensic = forensic_check // this is an enum string in DB.


                if (!s3_name || !s3_region || !cloud) throw [400, 'NO_BUCKET'];


                let bucket = `${s3_name}/users_${user_id}`,
                    region = s3_region,
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
                    if (err.code === 'uploadError') throw [500, 'UPLOAD_ERR'];
                    else throw [500, 'UPLOAD_FAILED'];
                }
                if (!uploadFile || uploadFile.length == 0) {
                    throw [500, 'UPLOAD_ERR'];
                }

                let doc_name = uploadFile[0].fd;
                /* Once the file is uploaded, request document will be updated with the req_path and filename */
                let url = bucket + "/" + uploadFile[0].fd;
                updateFilePath = await RequestDocument.update({ id }).set({
                    req_path: url,
                    updated_at: curDate,
                    req_filename: uploadFile[0].filename + "/" + uploadFile[0].size
                });

                //preparing our base response for future use.
                response = {
                    status: 'ok',
                    statusCode: 'NC200',
                    message: `${type} Details`,
                    type: reqType,
                    extractionData: undefined,
                    verificationData: undefined,
                    s3: uploadFile[0],
                    request_id: clientReqRow.result.request_id /* Added request_id fetched from client_request table */
                }

                //generate reqPayload to send to kycExtraction and kycFraudCheck ML APIs in the further upcoming steps
                let reqPayload = {
                    user_id,
                    doc_name,
                    white_label_id,
                    s3bucket: s3_name,
                    region: s3_region,
                    cloud,
                    req_type: reqType,
                    file_type: (contentType === 'application/pdf') ? 'pdf' : 'image',
                    system: 'onboarding',
                    generate_log: '1'
                },
                    statusCode,
                    helperRes,
                    _statusCode,
                    _helperRes;

                bigQueryData.file_name = doc_name;

                //if the req is for masking a document then we directly return with the following code
                if (reqType === 'mask') {
                    [statusCode, helperRes] = await sails.helpers.maskImage(reqPayload, s3_name, s3_region);
                    result = [statusCode, helperRes];
                    return;
                    //return res.status(statusCode).send(helperRes);
                }

                //if the req is to check for forensic
                if (processType === 'forensic' && isForensic) {
                    [statusCode, helperRes] = await sails.helpers.kycFraudCheck(reqPayload, originalDocName, uniqueRandomId);
                    result = [statusCode, helperRes];
                    return;
                    //return res.status(statusCode).send(helperRes);
                }
                //else we'll call our helper functions to find Extraction Data and Forensic Data
                else {
                    let [extractionApiRes, fraudApiRes] = await Promise.all([

                        //pass our reqPayload that we generated above in these helpers functions 

                        //kyc data extraction helper function that calls the ML API internally
                        sails.helpers.kycExtraction(id, reqType, reqPayload, refId),
                        //if isForensic is true call the kycFraudCheck helper function which calls another ML API to check fraud
                        isForensic ? sails.helpers.kycFraudCheck(reqPayload, originalDocName, uniqueRandomId) : Promise.resolve()
                    ]);
                    [statusCode, helperRes, kyc_key] = extractionApiRes;
                    // checking if forensic is required and then assigning the one of the enum values (warning, error) for whitelabel in db.
                    if (isForensic) {
                        [_statusCode, _helperRes] = fraudApiRes;
                        response.forensicData = _helperRes.forensicData;

                        //checking if our response from the kyc-fraud-check API contains forensicData object or not
                        if (response.forensicData) {
                            /* iterate through forensicData to see any image is forged or not  */
                            let forgeryStatus, result = response.forensicData.Result;
                            for (let i = 0; i < result.length; i++) {
                                forgeryStatus = result[i].Image;
                                if (forgeryStatus === 'Tampered') break;
                            }

                            // in case it's a success result, the response message is compared to constants json boolean value.
                            if (_statusCode == 200) {

                                response.forensicData['flag'] = sails.config.dbForensicConstants[forgeryStatus] ? 'Success' : isForensic

                                //if document is tampered then set the flag and flag_message accordingly
                                if (forgeryStatus === 'Tampered') response.forensicData['flag_message'] = sails.config.jsonForensicMessages[isForensic];
                                //same if the document is not tampered
                                else response.forensicData['flag_message'] = sails.config.jsonForensicMessages['Success'];

                            }
                            else {
                                response.forensicData['flag'] = 'Failed'
                                response.forensicData['flag_message'] = 'Processing Failed.'
                            }


                        }
                        // if our response from kyc-fraud-check API doesn't contain any forensicData Object
                        else {
                            response.forensicData = _helperRes;
                        }

                    }

                }

                // in case our status in not the one we were expectng
                if (statusCode !== 200) {

                    //return the error response we get back from the kyc-fraud-check API
                    //res.status(statusCode).send(helperRes);
                    try {
                        // log google data here
                        console.log(response);
                        console.log(bigQueryData);
                        response = {};
                        response.data = helperRes.extractionData;
                        response.extractionData = helperRes.extractionData;
                        await insertKycDataToBigQuery(bigQueryData, req, response, reqType);

                    } catch (err) {
                        console.log(err);
                    }
                    result = [statusCode, helperRes];
                    return;
                } else response.extractionData = helperRes;

                if (response.extractionData.cause === 'Extraction_Failed') throw [500, 'EXTRACTION_FAILED'];
                // Insert into ekyc_table_response or panno_response on basis of reqType, if the key already exist then update response else create new record
                let m = {
                    extractionData: response.extractionData,
                    forensicData: response.forensicData
                }

                //updating the response in the RequestDocument table with both forensicData and extractionData

                await RequestDocument.update({ id }).set({
                    response: JSON.stringify(m)
                });

                // find if the pan key is already present and update the verification_response. If not then create a new record. 

                if (!doc_ref_id) {
                    if (reqType === "pan" && response.extractionData[sails.config.kycKeyConstants[reqType]]) {
                        let fullNameArray = response.extractionData['Name'].split(' ');
                        let firstName = fullNameArray[0];
                        let lastName = "";
                        let middleName = "";
                        if (fullNameArray.length === 3) {
                            lastName = fullNameArray[2];
                            middleName = fullNameArray[1];
                        }
                        else {
                            lastName = fullNameArray[1];
                        }
                        // TO DO: in the verification US make sure to remove uniqueId: NA. it needs to remain NULL for crawler to leave it from verifying.
                        let createObject = {
                            kyc_key: response.extractionData[sails.config.kycKeyConstants[reqType]],
                            verification_response: JSON.stringify(m),
                            ints: curDate,
                            panStatus: 'N',
                            first_name: firstName,
                            last_name: lastName,
                            middle_name: middleName,
                            uniqueId: 'NA'
                        };
                        let panKeyAvailable = await PannoResponse.find({
                            select: ['id', 'verification_response'],
                            where: { kyc_key: createObject.kyc_key }
                        });
                        if (panKeyAvailable.length > 0) {

                            //condition to keep ckyc data intact
                            const oldVerificationResponse = JSON.parse(panKeyAvailable[0].verification_response);
                            if (oldVerificationResponse && oldVerificationResponse['ckycResponse']) {

                                const ckyc_response = oldVerificationResponse['ckycResponse'];
                                if (ckyc_response) m.ckycResponse = ckyc_response;

                            }
                            panUpdated = await PannoResponse.update({ kyc_key: createObject.kyc_key }).set({ verification_response: JSON.stringify(m) })
                            response.doc_ref_id = panKeyAvailable[0].id;
                        }
                        else {
                            panCreated = await PannoResponse.create(createObject).fetch();
                            response.doc_ref_id = panCreated.id;
                        }
                    }
                    else {
                        const kyc_key = response.extractionData[sails.config.kycKeyConstants[reqType]].replace(/\s+/g, '');
                        // Always insert the new record and also insert the business_id
                        let createObject = {
                            kyc_key,
                            verification_response: JSON.stringify(m),
                            type: reqType,
                            ref_id: business_id
                        }
                        //if already passport no and business id is exist and upload new passport document, then replace the old passport data with new uploaded document.

                        let kyc_where_condition = {};
                        if (business_id && passport_no) {

                            kyc_where_condition.kyc_key = passport_no;
                            kyc_where_condition.ref_id = business_id;

                        } else {
                            kyc_where_condition.kyc_key = kyc_key;
                        }

                        const ekyc_data_response = await EKycResponse.find(kyc_where_condition).sort("id DESC");

                        if (ekyc_data_response.length > 0) {
                            const ekycUpdated = await EKycResponse
                                .update({ id: ekyc_data_response[0].id })
                                .set(createObject)
                                .fetch();

                            response.doc_ref_id = ekycUpdated[0].id;
                        } else {
                            const ekycCreated = await EKycResponse.create(createObject).fetch();
                            response.doc_ref_id = ekycCreated.id;
                        }
                    }
                }
                //if doc_ref_id is present 
                else {
                    let ekycFound = await EKycResponse.findOne({ id: doc_ref_id });
                    let jsonRes = JSON.parse(ekycFound.verification_response)
                    let newObj = merge(jsonRes['extractionData'], m['extractionData']);
                    Object.assign(response.extractionData, newObj);
                    let finalObject = {};
                    finalObject['extractionData'] = newObj;
                    finalObject['forensicData'] = m['forensicData'];
                    await EKycResponse.update({ id: doc_ref_id }).set({
                        verification_response: JSON.stringify(finalObject),
                        kyc_key: response.extractionData[sails.config.kycKeyConstants[reqType]] ? response.extractionData[sails.config.kycKeyConstants[reqType]].replace(/\s+/g, '') : ekycFound.kyc_key
                    })

                }

                response.data = response.extractionData;
                //res.status(200).send(response);

                /* if dirctor_id is passed then save it to the kyc_key in director table */
                try {
                    await insertKycDataToBigQuery(bigQueryData, req, response, reqType);
                } catch (err) {
                    console.log(err);
                }
                result = [200, response];
            } catch (err) {
                console.log(err);

                let message, statusCode = err[0] || 500, resCode = err[1];
                message = sails.config.msgConstants[resCode];
                let response = {
                    status: 'nok',
                    statusCode: `NC${statusCode}`,
                    resCode: (resCode) ? resCode : 'EXTRACTION_FAILED',
                    message: (message) ? message : "Unable to extract KYC Details from the uploaded document. Please upload a better quality document in portrait mode."
                }

                //res.status(statusCode).send(response);

                try {
                    // log google data here
                    response.data = {};
                    response.extractionData = {};
                    await insertKycDataToBigQuery(bigQueryData, req, response, reqType);

                } catch (err) {
                    console.log(err);
                }
                result = [statusCode, response];
            }
        }

        main();

        try {
            const outPutRes = await getData;
            responseReturned = true;
            return res.status(outPutRes[0]).send(outPutRes[1]);
        } catch (err) {
            responseReturned = true;
            if (err[0] && err[1]) return res.status(err[0]).send(err[1]);
            else return res.status(500).send({
                status: 'nok',
                statusCode: 'NC500',
                resCode: 'SERVERR',
                message: 'Server error occurred. Please try again.',
                error: err.message
            });
        }



    },

    verifyKycData: async function (req, res) {

        // Store data in request document, append it to the response.
        let id = req.param('ref_id'), billType = req.param('billType'), docType = req.param('req_type') || req.param('doc_type');

        /* billType is not being used currently */
        if (billType) {
            let [response, status] = await utilityBills(billType, req);
            return res.status(status).send(response);
        }

        try {
            let kyc_key = req.param('number');
            if (!kyc_key || (!id && !docType)) throw [400, 'MISSING_PARAMS'];

            // check if the whitelabel requires verification or no
            const { white_label_id, id: user_id } = req.client_data;
            //    let isVerification = await WhiteLabelSolutionRd.findOne({
            //         select: ['verification_check'],
            //         where: { id: white_label_id }
            //     })
            let isVerification = 1;
            if (!isVerification) {
                return res.status(200).send({
                    status: 'ok', statusCode: 'NC200', message: 'Verification not required.'
                });
            }
            kyc_key = kyc_key.toUpperCase();

            let type = '', rowData;

            if (!docType) {
                try {
                    rowData = await RequestDocument.findOne({ id });
                    if (!rowData) throw 'no-data';
                    rowData = rowData.response && JSON.parse(rowData.response);
                    if (type === '') type = (rowData.type) || '';
                } catch (err) {
                    if (err === 'no-data' || err.code === 'E_INVALID_CRITERIA') {
                        throw [404, 'REF_ID_NOT_FOUND'];
                    } else {
                        throw [500, 'UNKNOWN']
                    }
                }
            } else {
                type = docType;
            }

            let essentials;
            if (type === 'pan') {
                // FE should send name from extraction Data and this should be edited
                if (!req.param('number') || !req.param('name')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "number": req.param('number'),
                    "name": req.param('name'),
                    "fuzzy": "true"
                };
            } else if (type === 'voter') {
                if (!req.param('number') || !req.param('name') || !req.param('state')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "epicNumber": req.param('number'),
                    "name": req.param('name'),
                    "state": req.param('state')
                };
            } else if (type === 'license' || type === 'DL') {
                type = 'license';
                if (!req.param('number') || !req.param('dob')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "number": req.param('number'),
                    "dob": req.param('dob'),
                    "issueDate": req.param('issue_date')
                };
            } else if (type === 'passport') {
                if (!req.param('number') || !req.param('dob') || !req.param('name')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "fileNumber": req.param('number'),
                    "dob": req.param('dob'),
                    "name": req.param('name'),
                    "fuzzy": "true"
                };
            } else {
                if (docType) throw [400, 'INV_REF_TYPE'];
            }

            let resp = {};
            let [statusCode, data] = await sails.helpers.kycVerification(type, essentials);

            /* Below if block runs if the uploaded pan is a business pan */
            if (data && data.message && data.message.message.includes('not look like a individualPan')) {
                [statusCode, data] = await sails.helpers.kycVerification('businessPan', essentials);
            }

            /* if ref_id(id) is passed then only it'll update the database */
            if (id) {
                let curDate = await sails.helpers.istDateTime();
                rowData = await RequestDocument.findOne({ id });
                if (rowData) {
                    resp = JSON.parse(rowData.response);
                    resp['verificationData'] = data;
                    resp['verificationData']['kyc_key'] = req.param('number');
                    await RequestDocument.update({ request_id: rowData.request_id }).set({
                        verification_status: (data.message && data.message.verified) ? "completed" : "failed",
                        updated_at: curDate,
                        response: JSON.stringify(resp)
                    })
                }
            }

            return res.status(statusCode).send(data);

        } catch (err) {
            console.log(err);

            let message, statusCode = err[0] || 500, resCode = err[1];
            message = sails.config.msgConstants[resCode];
            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            /* update database and send response back */
            if (id) {
                let curDate = await sails.helpers.istDateTime();
                rowData = await RequestDocument.findOne({ id });
                if (rowData) {
                    resp = JSON.parse(rowData.response);
                    resp['verificationData'] = response;
                    resp['verificationData']['kyc_key'] = req.param('number');
                    await RequestDocument.update({ request_id: rowData.request_id }).set({
                        verification_status: "failed",
                        updated_at: curDate,
                        response: JSON.stringify(resp)
                    })
                }
            }

            return res.status(statusCode).send(response);
        }

    },
    // new api for verification - in progress
    verifyKycDataUiUx: async function (req, res) {

        // Store data in request document, append it to the response.
        let id = req.param('ref_id'),
            billType = req.param('billType'),
            docType = req.param('req_type') || req.param('doc_type'),
            doc_ref_id = req.param('doc_ref_id'),
            business_id = req.param('business_id');

        /* billType is not being used currently */
        if (billType) {
            let [response, status] = await utilityBills(billType, req);
            return res.status(status).send(response);
        }

        try {
            let kyc_key = req.param('number');
            if (!kyc_key || !docType || !doc_ref_id) throw [400, 'MISSING_PARAMS'];

            kyc_key = kyc_key.toUpperCase();

            let type = docType;
            let essentials;
            if (type === 'aadhar' && req.param("number")) {
                return res.send({
                    status: "ok",
                    statusCode: "NC200",
                    message: "data updated successfully"
                });
            } else if (type === 'pan') {
                // FE should send name from extraction Data and this should be edited
                if (!req.param('number') || !req.param('name')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "number": req.param('number'),
                    "name": req.param('name'),
                    "fuzzy": "true"
                };
            } else if (type === 'voter') {
                if (!req.param('number') || !req.param('name') || !req.param('state')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "epicNumber": req.param('number'),
                    "name": req.param('name'),
                    "state": req.param('state')
                };
            } else if (type === 'license' || type === 'DL') {
                type = 'license';
                if (!req.param('number') || !req.param('dob')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "number": req.param('number'),
                    "dob": req.param('dob'),
                    "issueDate": req.param('issue_date')
                };
            } else if (type === 'passport') {
                if (!req.param('number') || !req.param('dob') || !req.param('name')) throw [400, 'MISSING_PARAMS'];
                essentials = {
                    "fileNumber": req.param('number'),
                    "dob": req.param('dob'),
                    "name": req.param('name'),
                    "fuzzy": "true"
                };
            } else {
                if (docType) throw [400, 'INV_REF_TYPE'];
            }

            let resp = {};
            let [statusCode, data] = await sails.helpers.kycVerification(type, essentials);

            /* Below if block runs if the uploaded pan is a business pan */
            if (data && data.message && data.message.message.includes('not look like a individualPan')) {
                [statusCode, data] = await sails.helpers.kycVerification('businessPan', essentials);
            }

            // for the given type update the data for the kyc_key given in either panno_resoponse or ekyc_response_table
            if (type === "pan") {
                // update in panno_response
                rowData = await PannoResponse.findOne({ id: doc_ref_id });
                if (rowData) {
                    resp = JSON.parse(rowData.verification_response);
                    resp['verificationData'] = data;
                    resp['verificationData']['kyc_key'] = req.param('number');
                    await PannoResponse.update({ id: doc_ref_id }).set({
                        verification_response: JSON.stringify(resp),
                        panStatus: 'E',
                        uniqueId: null
                    })
                    // bug fix- DOS 1276
                    if (rowData.kyc_key != req.param('number')) {
                        let m;
                        let curDate = await sails.helpers.istDateTime();
                        if (rowData.verification_response) {
                            m = JSON.parse(rowData.verification_response)
                        }
                        m['verificationData'] = data;
                        m['verificationData']['kyc_key'] = req.param('number')
                        // if it already exists in the system then update
                        let oldPan = await PannoResponse.findOne({ kyc_key: req.param('number') });
                        if (oldPan) {
                            const oldVerificationResponse = JSON.parse(oldPan.verification_response);
                            if (oldVerificationResponse && oldVerificationResponse['ckycResponse']) {

                                const ckyc_response = oldVerificationResponse['ckycResponse'];
                                if (ckyc_response) m.ckycResponse = ckyc_response;

                            }
                            await PannoResponse.update({ kyc_key: req.param('number') }).set({
                                verification_response: JSON.stringify(m),
                                panStatus: 'E',
                                uniqueId: null
                            })
                        }
                        else {

                            if (m && m.ckycResponse) {

                                delete m.ckycResponse;

                            }
                            let createObject = {
                                kyc_key: req.param('number'),
                                verification_response: JSON.stringify(m),
                                ints: curDate,
                                panStatus: 'E',
                                first_name: rowData.first_name,
                                last_name: rowData.last_name,
                                middle_name: rowData.middle_name,
                                uniqueId: null
                            }
                            await PannoResponse.create(createObject);
                        }
                    }
                    // bug fix ends 1276
                }
            }
            else {
                // update in ekyc_response_table
                rowData = await EKycResponse.findOne({ id: doc_ref_id });
                if (rowData) {
                    resp = JSON.parse(rowData.verification_response);
                    resp['verificationData'] = data;
                    await EKycResponse.update({ id: doc_ref_id }).set({
                        verification_response: JSON.stringify(resp)
                    })
                }
            }

            return res.status(statusCode).send(data);

        } catch (err) {
            console.log(err);

            let message, statusCode = err[0] || 500, resCode = err[1];
            message = sails.config.msgConstants[resCode];
            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            /* update database and send response back */
            if (docType === "pan") {
                // update in panno_response
                rowData = await PannoResponse.findOne({ id: doc_ref_id });
                if (rowData) {
                    resp = JSON.parse(rowData.verification_response);
                    resp['verificationData'] = response;
                    resp['verificationData']['kyc_key'] = req.param('number');
                    await PannoResponse.update({ id: doc_ref_id }).set({
                        verification_response: JSON.stringify(resp)
                    })
                }
            }
            else {
                // update in ekyc_response_table
                rowData = await EKycResponse.findOne({ id: doc_ref_id });
                if (rowData) {
                    resp = JSON.parse(rowData.verification_response);
                    resp['verificationData'] = response;
                    await EKycResponse.update({ id: doc_ref_id }).set({
                        verification_response: JSON.stringify(resp)
                    })
                }
            }


            return res.status(statusCode).send(response);
        }

    },

    verifySignature: async function (req, res) {
        const document = req.file('document');


        if (!document) return res.status(400).send({
            status: 'nok', statusCode: 'NC400', message: 'Required parameters missing.'
        });
        else if (document.isNoop) return res.status(400).send({
            status: 'nok', statusCode: 'NC400', message: 'No file uploaded.'
        });

        try {
            const { name, filename, byteCount } = document._files[0].stream;
            sails.log(`Files => "${name}": "${filename}"`);
        } catch (err) { }

        try {
            const { name, filename, byteCount } = document._files[1].stream;
            sails.log(`Files => "${name}": "${filename}"`);
        } catch (err) { }

        let { client_id: clientId } = req.client_data;

        const uniqueId = await sails.helpers.getUniqueId();
        let curDate = await sails.helpers.istDateTime();

        console.log(uniqueId);

        /* Create the initial record in database */
        await Promise.all([
            ClientRequest.create({
                request_id: uniqueId,
                req_datetime: curDate,
                req_status: 'initiate',
                is_active: 'active',
                created_at: curDate,
                updated_at: curDate,
                client_id: clientId,
                sub_type: 'SIGNMATCH'
            }),
            RequestDocument.create({
                client_id: clientId,
                request_id: uniqueId,
                is_active: 'active',
                created_at: curDate,
                updated_at: curDate
            })
        ]);

        let [result, statusCode, fileLoaction] = await docMatch('signature', document, req.client_data);

        /* Update database accordingly(whether success or failure) */
        if (statusCode === 200) reqStatus = 'completed';
        else reqStatus = 'failed';
        curDate = await sails.helpers.istDateTime();
        await Promise.all([
            ClientRequest.update({ request_id: uniqueId }).set({
                req_status: reqStatus,
                updated_at: curDate
            }),
            RequestDocument.update({ request_id: uniqueId }).set({
                updated_at: curDate,
                response: JSON.stringify(result),
                s3_name: fileLoaction.s3bucket,
                s3_region: fileLoaction.region,
                cloud: fileLoaction.cloud,
                s3_filepath: fileLoaction.s3Filepath
            })
        ])

        return res.status(statusCode).send(result);
    },

    photoMatch: async function (req, res) {
        const document = req.file('document');

        if (!document) return res.status(400).send({
            status: 'nok', statusCode: 'NC400', message: 'Required parameters missing.'
        });
        else if (document.isNoop) return res.status(400).send({
            status: 'nok', statusCode: 'NC400', message: 'No file uploaded.'
        });


        try {
            const { name, filename, byteCount } = document._files[0].stream;
            sails.log(`Files => "${name}": "${filename}"`);
        } catch (err) { }

        try {
            const { name, filename, byteCount } = document._files[1].stream;
            sails.log(`Files => "${name}": "${filename}"`);
        } catch (err) { }

        let { client_id: clientId } = req.client_data;

        const uniqueId = await sails.helpers.getUniqueId();
        let curDate = await sails.helpers.istDateTime();

        /* Create the initial record in database */
        await Promise.all([
            ClientRequest.create({
                request_id: uniqueId,
                req_datetime: curDate,
                req_status: 'initiate',
                is_active: 'active',
                created_at: curDate,
                updated_at: curDate,
                client_id: clientId,
                sub_type: 'PHOTOMATCH'
            }),
            RequestDocument.create({
                client_id: clientId,
                request_id: uniqueId,
                is_active: 'active',
                created_at: curDate,
                updated_at: curDate
            })
        ]);

        let [result, statusCode] = await docMatch('photo', document, req.client_data);

        /* Update database accordingly(whether success or failure) */
        if (statusCode === 200) reqStatus = 'completed';
        else reqStatus = 'failed';
        curDate = await sails.helpers.istDateTime();
        await Promise.all([
            ClientRequest.update({ request_id: uniqueId }).set({
                req_status: reqStatus,
                updated_at: curDate
            }),
            RequestDocument.update({ request_id: uniqueId }).set({
                updated_at: curDate,
                response: JSON.stringify(result)
            })
        ]);

        return res.status(statusCode).send(result);
    },

    ipBasedVpnVerification: async function (req, res) {
        var request = require("request");
        let ip = req.param("ip");
        if (!ip) return res.ok(sails.config.errRes.missingFields);

        const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);

        ip = ip[0];
        fields =
            "status,message,continent,continentCode,country,countryCode,countryCode3,region,regionName,city,zip,lat,lon,timezone,offset,currentTime,currency,callingCode,isp,org,as,asname,reverse,mobile,proxy,hosting,query";
        key = "tBE4W06DrMByEwN";
        url = `${sails.config.kycExtraction.urls.ip_vpn}${ip}?fields=${fields}&key=${key}`;
        method = "GET";

        let apiResponse = await sails.helpers.apiTrigger(url, "", "", method);
        if (apiResponse.status == "nok") {
            return res.send({
                status: "nok",
                message: "Error occured while fetching IP details",
                request_id: uniqueRandomId,
                data: "Error",
            });
        }
        data = JSON.parse(apiResponse);

        let dbRecord = await sails.helpers.clientRequestRecord(
            "create",
            uniqueRandomId,
            req.client_id,
            "completed",
            "KYC",
            "ip-vpn"
        );
        if (dbRecord.status == "nok")
            return res.send({ status: "nok", message: dbRecord.result });
        return res.send({
            status: "ok",
            message: "IP details",
            request_id: uniqueRandomId,
            data: data,
        });


    },

    location: async function (req, res) {
        let nodeGeocoder = require("node-geocoder");
        let { longitude, latitude } = req.allParams();

        if (!longitude || !latitude)
            return res.badRequest(sails.config.errRes.missingFields);

        let options = {
            provider: "google",
            apiKey: 'AIzaSyBD1n5ajHV8PQdyhCMBOZGf7PKBD-iirlU',
            formatter: null
        };


        let geoCoder = nodeGeocoder(options);
        geoCoder.reverse({ lat: latitude, lon: longitude }).then((dataRes) => {
            if (dataRes && dataRes[0].formattedAddress) {
                data = {
                    status: "ok",
                    message: "Location details",
                    data: {
                        address: dataRes[0].formattedAddress,
                    },
                };
                return res.send(data);
            } else {
                return res.send({
                    status: "nok",
                    Error: err,
                });
            }
        }).catch(err => {
            return res.send({
                status: "nok",
                Error: "Something went wrong. Make sure to enter a valid latitude, longitude combination",
            });
        });
    },

    updateForensicData: async function (req, res) {
        let reqPayload = req.allParams();
        console.log('updateForensicData=> ', req.allParams());
        let { unique_id: uniqueId, Status: status, no_of_pages: noOfPages } = reqPayload;
        let forensicData = reqPayload;
        try {
            /* Check if state & uniqueId is passed in the payload */
            if (!status || !uniqueId) throw [400, 'MISSING_PARAMS'];

            if (status === 'inprogress') {
                /* fetch and update data in s3_filepath column */
                let record = await RequestDocument.findOne({
                    select: ['s3_filepath'],
                    where: { request_id: uniqueId }
                });

                let s3_filepath = JSON.parse(record.s3_filepath);
                s3_filepath.noOfPages = noOfPages;
                await Promise.all([
                    RequestDocument.update({ request_id: uniqueId }).set({ s3_filepath: JSON.stringify(s3_filepath) }),
                    ClientRequest.update({ request_id: uniqueId }).set({ req_status: 'inprogress' })
                ]);
            }

            /* Fetch data from DB and update */
            try {
                let storedRecord = await RequestDocument.findOne({
                    select: ['response'],
                    where: { request_id: uniqueId }
                });
                let storedData = JSON.parse(storedRecord.response);
                if (storedData && storedData.forensicData) {
                    forensicData.doc_name = storedData.forensicData.doc_name;
                    forensicData.image_processing = storedData.forensicData.image_processing;
                }
            } catch (err) {
                console.log(err);
            }

            if (status !== 'inprogress') {
                /* wait for 3 seconds if status is failed or success */
                let waitFor3sec = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve();
                    }, 3000)
                });
                await waitFor3sec;
            }

            let curDate = await sails.helpers.istDateTime();

            if (status === 'success') {
                let record = await ClientRequest.findOne({
                    select: ['req_status'],
                    where: { request_id: uniqueId }
                });
                if (record.req_status === 'inprogress') status = 'completed';
                else status = 'failed';
            };
            await Promise.all([
                RequestDocument.update({ request_id: uniqueId }).set({
                    updated_at: curDate,
                    response: JSON.stringify({ forensicData })
                }),
                ClientRequest.update({ request_id: uniqueId }).set({
                    updated_at: curDate,
                    req_status: status
                })
            ])


            return res.status(200).send({
                status: 'ok',
                statusCode: 'NC200',
                message: 'Data updated successfully'
            });
        } catch (err) {
            console.log(err);
            let message, statusCode = err[0] || 500, resCode = err[1];
            if (resCode === 'MISSING_PARAMS') message = 'Required parameters missing.';
            else if (resCode === 'INVALID_ARG') message = 'Invalid argument passed.';

            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            return res.status(statusCode).send(response);
        }
    },

    updateImageLoc: async function (req, res) {
        let { state, unique_id: uniqueId, file_path: filePath, bucket, region, cloud } = req.allParams();
        console.log("updateImgLoc payload=> ", req.allParams());

        try {
            /* Check if state & uniqueId is passed in the payload */
            if (!state || !uniqueId) throw [400, 'MISSING_PARAMS'];

            /* Make sure state has correct argument ('inprogress', 'failed' or 'completed') */
            if (state !== 'completed' && state !== 'inprogress' && state !== 'failed') throw [400, 'INVALID_ARG'];

            /* Extract the record from database. */
            let storedRecord = await RequestDocument.findOne({
                select: ['response', 's3_name', 's3_region', 'cloud', 's3_filepath'],
                where: { request_id: uniqueId }
            });

            /* Make sure unique_id is correct */
            if (!storedRecord) throw [400, 'INVALID_ARG'];

            let storedResponse = JSON.parse(storedRecord.response);

            /* Update the record and store back in the database */
            if (storedResponse.forensicData) storedResponse.forensicData.image_processing = state;
            else if (storedResponse) storedResponse.forensicData = { image_processing: state };

            /* Run specific block depending on the state */
            let curDate = await sails.helpers.istDateTime();

            if (state === 'completed') {
                /* Check whether all params are passed */
                if (!filePath || !bucket || !region || !cloud) throw [400, 'MISSING_PARAMS'];
                /* Get all storage related data */
                let storedS3Name = JSON.parse(storedRecord.s3_name),
                    storedS3Region = JSON.parse(storedRecord.s3_region),
                    storedCloud = JSON.parse(storedRecord.cloud),
                    storedS3FilePath = JSON.parse(storedRecord.s3_filepath);
                /* Update the values and store in database */
                storedS3Name.processed = bucket,
                    storedS3Region.processed = region,
                    storedCloud.processed = cloud,
                    storedS3FilePath.processed = filePath;

                await RequestDocument.update({ request_id: uniqueId }).set({
                    updated_at: curDate,
                    response: JSON.stringify(storedResponse),
                    s3_name: JSON.stringify(storedS3Name),
                    s3_region: JSON.stringify(storedS3Region),
                    cloud: JSON.stringify(storedCloud),
                    s3_filepath: JSON.stringify(storedS3FilePath),
                    file_processing: 'completed'
                });
            }
            return res.status(200).send({
                status: 'ok',
                statusCode: 'NC200',
                message: 'Data updated successfully'
            });
        } catch (err) {
            let message, statusCode = err[0] || 500, resCode = err[1];
            if (resCode === 'MISSING_PARAMS') message = 'Required parameters missing.';
            else if (resCode === 'INVALID_ARG') message = 'Invalid argument passed.';

            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!'
            }

            return res.status(statusCode).send(response);
        }
    },

    forensicFeedback: async function (req, res) {
        let { unique_id, thumbs_up, comment, description } = req.allParams();
        if (!unique_id || (thumbs_up !== true && thumbs_up !== false)) {
            return res.status(400).send({
                status: 'nok',
                statusCode: 'NC400',
                resCode: 'MISSING_PARAMS',
                message: 'Required paramters missing.'
            })
        }

        /* Store the data in database */
        try {
            /* fetch data from database */
            let storedData = await RequestDocument.findOne({
                select: ['response'],
                where: { request_id: unique_id }
            })
            /* include feedback into the database */
            storedData = JSON.parse(storedData.response);
            if (typeof storedData === 'string') storedData = JSON.parse(storedData);
            storedData.feedbackData = {
                thumbs_up,
                comment,
                description
            };

            let curDate = await sails.helpers.istDateTime();
            await RequestDocument.update({ request_id: unique_id }).set({ updated_at: curDate, response: JSON.stringify(storedData) });
            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: 'Feedback stored successfully.'
            })
        } catch (err) {
            console.log(err);
            return res.send({
                status: 'nok',
                statusCode: 'NC500',
                resCode: 'SERV_ERR',
                message: 'Server error!'
            })
        }
    },

    forensicHistory: async function (req, res) {
        try {
            let client_id = req.client_id;
            let query = `SELECT RD.request_id AS unique_id, CL.email, DATE_FORMAT(RD.created_at, '%Y-%M-%d %H:%i:%s') AS created_on, RD.response from client_request AS CR
            INNER JOIN request_document AS RD
            ON CR.request_id = RD.request_id
            INNER JOIN clients as CL
            ON CR.client_id = CL.client_id
            WHERE CR.req_type IN ('ALL', 'KYC','BANK') AND CR.client_id = ${client_id} AND CR.req_status = 'completed' order by RD.created_at desc`;

            /* Query the database using the above query and fetch history */
            const myDBStore = sails.getDatastore('mysql_nc_document_app');
            history = await myDBStore.sendNativeQuery(query);
            history = history.rows;
            console.log(history);
            history = history.map(el => {
                try {
                    el.response = JSON.parse(el.response);
                } catch (err) {
                }
                return el;
            })
            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: 'Forensic history fetched.',
                history
            })
        } catch (err) {
            console.log(err);
            return res.send({
                status: 'nok',
                statusCode: 'NC500',
                resCode: 'SERV_ERR',
                message: 'Server error!'
            })
        }
    },

    checkForensicDetails: async function (req, res) {
        let uniqueId = req.param('request_id'),
            caseNo = req.param('application_no'), resCode, message, forensicData;
        try {
            if (!uniqueId && !caseNo) throw [400, 'MISSING_PARAMS'];
            let storedRecord;
            /* query the database and get the data */
            if (caseNo) {
                storedRecord = await RequestDocument.find({
                    select: ['response', 's3_name', 's3_region', 'cloud', 's3_filepath'],
                    where: { case_no: caseNo }
                });
            } else {
                storedRecord = await RequestDocument.find({
                    select: ['response', 's3_name', 's3_region', 'cloud', 's3_filepath'],
                    where: { request_id: uniqueId }
                });
            }

            /* Check whether data exists or not */
            if (storedRecord.length === 0) throw [404, 'WRONG_UNIQUEID'];
            let data = [];

            for (let i = 0; i < storedRecord.length; i++) {
                let storedResponse = JSON.parse(storedRecord[i].response), resCode, message;
                forensicData = storedResponse.forensicData;
                const imageProcessingState = forensicData && forensicData.image_processing;

                if (0 && !imageProcessingState) {
                    resCode = 'IMG_PROCESS_PENDING', message = 'Image processing yet to be started.';
                } else if (1 || imageProcessingState === 'completed') {
                    try {
                        let links = [];
                        try {
                            /* Generate downloand link as process in completed */
                            const s3Name = JSON.parse(storedRecord[i].s3_name).processed,
                                s3Region = JSON.parse(storedRecord[i].s3_region).processed,
                                cloud = JSON.parse(storedRecord[i].cloud).processed,
                                s3FilePath = JSON.parse(storedRecord[i].s3_filepath).processed;

                            /* isAws = 1 indicates it's in aws else it's in azure */
                            isAws = (cloud === 'aws') ? 1 : 0;

                            for (let j = 0; j < s3FilePath.length; j++) {
                                /* Segregate s3 filename and filepath */
                                let filePathArr = s3FilePath[j].split('/');
                                let fileName = filePathArr[filePathArr.length - 1];
                                filePathArr = filePathArr.slice(0, -1);
                                filePath = filePathArr.join('/');
                                let downloadLink = await sails.helpers.getS3ImageUrl(fileName, `${s3Name}/${filePath}`, s3Region, isAws);
                                links.push(downloadLink);
                            };
                        } catch (err) {
                            console.log(err);
                        }

                        if (Array.isArray(links) && links.length < 1) links = undefined;

                        forensicData.links = links;
                        resCode = 'IMG_PROCESSED', message = 'Image processing completed.';
                    } catch (err) {
                        resCode = 'IMG_PROCESS_PENDING', message = 'Image processing yet to be started.';
                    }
                } else {
                    if (imageProcessingState === 'inprogress') resCode = 'PROCESSING_IMG', message = 'Image is being processed.';
                }
                data.push(forensicData);
            }

            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                resCode: 'SUCCESS',
                message: 'Data fetched.',
                data
            })
        } catch (err) {
            console.log(err);
            let message, statusCode = err[0] || 500, resCode = err[1];
            if (resCode === 'MISSING_PARAMS') message = 'Required parameters missing.';
            else if (resCode === 'PROCESS_FAILED') message = 'Image processing failed.';
            else if (resCode === 'WRONG_UNIQUEID') message = 'Unique Id not found. Please pass correct unique id.';

            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!',
                forensicData
            }

            return res.status(statusCode).send(response);
        }
    },

    getForensicLink: async function (req, res) {
        /*get uniqueId */
        let uniqueId = req.param('unique_id'), link;

        try {
            if (!uniqueId) throw [400, 'MISSING_PARAMS'];

            /*get storage details from database*/
            const storedRecord = await RequestDocument.findOne({
                select: ['client_id', 's3_region', 'cloud', 's3_filepath'],
                where: { request_id: uniqueId }
            });

            if (!storedRecord) throw [404, 'INVALID_UNIQUEID'];

            /* Cross check if this unique id belongs to the client */
            if (storedRecord.client_id !== req.client_id) throw [403, 'WRONG_USER'];

            let s3Region = JSON.parse(storedRecord.s3_region).main;
            let cloud = JSON.parse(storedRecord.cloud).main;
            let s3FilePath = JSON.parse(storedRecord.s3_filepath).main;

            if (!s3Region || !cloud || !s3FilePath) throw [404, 'NO_STORAGE'];

            /* Segregate filename and filepath */
            let filePathArr = s3FilePath.split('/');
            let fileName = filePathArr[filePathArr.length - 1];
            filePathArr = filePathArr.slice(0, -1);
            s3FilePath = filePathArr.join('/');

            let isAws = (cloud === 'aws') ? 1 : 0;

            /* Generate download link and send back */
            try {
                link = await sails.helpers.getS3ImageUrl(fileName, s3FilePath, s3Region, isAws);
            } catch (err) {
                console.log(err);
                throw [500, 'LINK_GEN_FAIL']
            }

            return res.send({
                status: 'ok',
                statusCode: `NC200`,
                resCode: 'SUCCESS',
                message: 'Download link generated.',
                link
            })
        } catch (err) {
            console.log(err);
            let message, statusCode = err[0] || 500, resCode = err[1];
            if (resCode === 'MISSING_PARAMS') message = 'Required parameters missing.';
            else if (resCode === 'INVALID_UNIQUEID') message = 'Invalid unique_id passed.';
            else if (resCode === 'WRONG_USER') message = 'User is not authorized to access the record against the unique_id.';
            else if (resCode === 'NO_STORAGE') message = 'No storage found.';
            else if (resCode === 'LINK_GEN_FAIL') message = 'Link generation failed.';

            let response = {
                status: 'nok',
                statusCode: `NC${statusCode}`,
                resCode: (resCode) ? resCode : 'SERV_ERR',
                message: (message) ? message : 'Server error occurred!',
            }

            return res.status(statusCode).send(response)
        }


    },

    initiateConsolidation: async function (req, res) {
        /* Get the necessary parameters */
        let {
            application_no: caseNo,
            comment
        } = req.allParams();

        try {
            if (!caseNo || !comment) throw [400, 'MISSING_PARAMS'];

            let caseNoMasterRow = await CaseNoMaster.findOne({ case_no: caseNo });
            if (caseNoMasterRow) throw [400, 'CASE_ALREADY_EXISTS'];

            let requestId = await sails.helpers.getUniqueId();

            /* update database */
            await CaseNoMaster.create({
                case_no: caseNo,
                upload_status: comment,
                request_id: requestId
            });

            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                res_code: 'SUCCESS',
                request_id: requestId,
                message: `Consolidation process initiated.`
            })

        } catch (err) {
            console.log(err);
            let resCode, statusCode;
            if (err[0] && err[1]) statusCode = `NC${err[0]}`, resCode = err[1];

            let response = {
                status: 'nok',
                statusCode: statusCode || 'NC500',
                resCode: resCode || 'SERV_ERR',
                message: sails.config.msgConstants[resCode] || 'Server error occurred.'
            };

            return res.status(err[0] || 500).send(response);

        }
    },

    consolidatedForensicReport: async function (req, res) {
        /* Get the necessary parameters */
        let caseNo = req.param('case_no') || req.param('application_no');
        let requestIds = req.param('request_id');

        try {
            if (!caseNo && !requestIds) throw [400, 'MISSING_PARAMS'];

            if (caseNo) {
                let caseNoMasterRow = await CaseNoMaster.findOne({ case_no: caseNo });
                if (caseNoMasterRow) throw [400, 'CASE_ALREADY_EXISTS'];
            } else {
                let requestDocumentRow = await RequestDocument.find({ request_id: requestIds });
                if (requestDocumentRow.length === 0) throw [404, 'WRONG_REQ_ID'];
            }

            /* Generate requestId for this request */
            let requestId = await sails.helpers.getUniqueId();

            if (!caseNo && requestIds) {
                caseNo = uuidv4();
                await CaseNoMaster.create({
                    case_no: caseNo,
                    upload_status: 'completed',
                    request_id: requestId,
                    request_document_req_ids: JSON.stringify(requestIds)
                });

            } else {
                /* Create row in the database */
                await CaseNoMaster.create({
                    case_no: caseNo,
                    upload_status: 'completed',
                    request_id: requestId
                });
            }

            return res.send({
                status: 'ok',
                statusCode: 'NC200',
                res_code: 'SUCCESS',
                message: 'Request received for report generation.',
                request_id: requestId,
                application_no: caseNo,
                callback: `${sails.config.hostName}/forensic/callback_consolidation`
            })

        } catch (err) {
            console.log(err);
            let resCode, statusCode;
            if (err[0] && err[1]) statusCode = `NC${err[0]}`, resCode = err[1];

            let response = {
                status: 'nok',
                statusCode: statusCode || 'NC500',
                resCode: resCode || 'SERV_ERR',
                message: sails.config.msgConstants[resCode] || 'Server error occurred.'
            };

            return res.status(err[0] || 500).send(response);

        }
    },

    getConsolidatedForensicReport: async function (req, res) {
        let requestId = req.param('request_id');

        try {
            let caseNoMasterRow = await CaseNoMaster.findOne({
                select: ['case_no', 'request_document_req_ids'], where: { request_id: requestId }
            });

            if (!caseNoMasterRow) {
                return res.status(404).send({
                    status: 'ok',
                    statusCode: 'NC400',
                    resCode: 'NOT_FOUND',
                    message: 'No file uploads found for this requestId.',
                    request_id: requestId
                })
            }

            let caseNo = caseNoMasterRow.case_no, reqIds = caseNoMasterRow.request_document_req_ids;

            /* if anything is in progress */
            let dataArr = await RequestDocument.find({
                select: ['response', 's3_name', 's3_region', 's3_filepath', 'cloud'],
                where: { case_no: caseNo, file_processing: ['inprogress'], request_type: 'FORENSIC' }
            });

            if (dataArr.length === 0 && reqIds) {
                dataArr = await RequestDocument.find({
                    select: ['response', 's3_name', 's3_region', 's3_filepath', 'cloud'],
                    where: { request_id: JSON.parse(reqIds), file_processing: ['inprogress'], request_type: 'FORENSIC' }
                })
            }

            if (dataArr.length > 0) {
                return res.send({
                    status: 'ok',
                    statusCode: 'NC200',
                    resCode: 'INPROGRESS',
                    message: 'File processing in progress',
                    request_id: requestId
                });
            }


            dataArr = await RequestDocument.find({
                select: ['response', 's3_name', 's3_region', 's3_filepath', 'cloud'],
                where: { case_no: caseNo, file_processing: ['completed', 'notApplicable'], request_type: 'FORENSIC' }
            });

            if (dataArr.length === 0) {
                try {
                    dataArr = await RequestDocument.find({
                        select: ['response', 's3_name', 's3_region', 's3_filepath', 'cloud'],
                        where: { request_id: JSON.parse(reqIds), file_processing: ['completed', 'notApplicable'], request_type: 'FORENSIC' }
                    })
                } catch { }
            }

            if (dataArr.length === 0) {
                res.status(404).send({
                    status: 'ok',
                    statusCode: 'NC400',
                    resCode: 'NOT_FOUND',
                    message: 'No file uploads found for this requestId.',
                    request_id: requestId
                })
            }

            let resObj = dataArr.map(el => {
                let curRes = JSON.parse(el.response);
                let curS3Name = JSON.parse(el.s3_name);
                let curS3Region = JSON.parse(el.s3_region);
                let curS3Cloud = JSON.parse(el.cloud);
                let curFilePath = JSON.parse(el.s3_filepath)
                let { forensicData } = curRes;
                return {
                    docName: forensicData ? forensicData.doc_name : undefined,
                    data: forensicData ? forensicData.Result : undefined,
                    s3Name: forensicData ? curS3Name.processed : undefined,
                    s3Region: forensicData ? curS3Region.processed : undefined,
                    cloud: forensicData ? curS3Cloud.processed : undefined,
                    filePath: forensicData ? curFilePath.processed : undefined
                }
            });

            const PDFDocument = require('pdfkit-table');
            const fs = require('fs');

            const doc = new PDFDocument({
                autoFirstPage: false
            });

            const fileName = uuidv4() + '.pdf';
            const stream = doc.pipe(fs.createWriteStream('fileName.pdf'));

            for (let i = 0; i < resObj.length; i++) {
                doc.addPage();
                if (i === 0) doc.text(`Case-number: ${caseNo}`);

                for (let j = 0; j < resObj[i].data.length; j++) {
                    let keys = Object.keys(resObj[i].data[j]).map(el => String(el));
                    let values = Object.values(resObj[i].data[j]).map(el => String(el));
                    let headers = ['Attribute', 'Value'];
                    let rows = [], title, subtitle;
                    /* Create rows */
                    for (let i = 0; i < keys.length && i < values.length; i++) rows.push([keys[i], values[i]]);
                    if (j === 0) title = `Filename: ${resObj[i].docName}`;
                    if (resObj[i].data.length > 1) subtitle = `Page-${j + 1}`;

                    let tableX, tableY, imageX, imageY;
                    if (j === 0) tableX = 0, tableY = 140, imageX = 350, imageY = 180;
                    else tableX = 0, tableY = 440, imageX = 350, imageY = 460;

                    let table = {
                        title,
                        subtitle,
                        headers,
                        rows
                    }

                    doc.table(table, {
                        width: 200,
                        x: tableX,
                        y: tableY
                        // prepareHeader: () => doc.font('Helvetica-Bold').fontSize(6),
                        // prepareRow: (row, i) => doc.font('Helvetica').fontSize(7)
                    });

                    if (resObj[i].s3Name && resObj[i].s3Region && resObj[i].filePath) {
                        let fileStream = await sails.helpers.getBase64StringFromS3(
                            resObj[i].s3Name,
                            resObj[i].s3Region,
                            resObj[i].filePath[j]
                        );

                        //doc.image(fileStream, 350, 100, { width: 150, align: 'center', valign: 'center' })

                        doc.image(fileStream, imageX, imageY, { fit: [200, 200] })
                            .rect(imageX, imageY, 200, 200).stroke();
                    } else {
                        doc.text('Image not available', imageX, imageY, { align: 'center', valign: 'center' })
                            .rect(imageX, imageY, 200, 200).stroke();
                    }
                }
            }
            console.log('this ran');

            doc.end();

            stream.on('finish', async function () {
                let _stream = await fs.createReadStream('fileName.pdf');
                let link = await awsS3Upload(_stream, 'pdf');
                await fs.unlinkSync('fileName.pdf');
                res.send({
                    status: 'ok',
                    statusCode: 'NC200',
                    resCode: 'SUCCESS',
                    message: 'Request processed successfully.',
                    request_id: requestId,
                    report_url: link
                });
            })

        } catch (err) {
            console.log(err);
            let response = {
                status: 'nok',
                statusCode: 'NC500',
                resCode: 'SERV_ERR',
                message: 'Server error occurred.'
            };

            return res.status(err[0] || 500).send(response);
        }

    },

    forensicReportStatus: async function (req, res) {
        let requestId = req.param('request_id');

        try {
            if (!requestId) throw [400, 'MISSING_PARAMS'];

            let caseNoMasterRow = await CaseNoMaster.findOne({
                select: ['case_no', 'report_generated', 'request_document_req_ids'],
                where: { request_id: requestId }
            });

            if (!caseNoMasterRow) throw [404, 'REQ_ID_NOT_FOUND'];

            let caseNo = caseNoMasterRow.case_no, reqIds = caseNoMasterRow.request_document_req_ids;
            console.log(reqIds, typeof reqIds);
            let forensicInprogressRows = [], forensicCompletedRows = [];

            if (reqIds) {
                try {
                    reqIds = JSON.parse(reqIds);
                    [forensicInprogressRows, forensicCompletedRows] = await Promise.all([
                        RequestDocument.find({
                            select: ['file_processing'],
                            where: { request_id: reqIds, file_processing: 'inprogress', request_type: 'FORENSIC' }
                        }),
                        RequestDocument.find({
                            select: ['file_processing'],
                            where: { request_id: reqIds, file_processing: ['completed', 'notApplicable'], request_type: 'FORENSIC' }
                        })
                    ])
                } catch (err) { }
            } else if (caseNo) {
                [forensicInprogressRows, forensicCompletedRows] = await Promise.all([
                    RequestDocument.find({
                        select: ['file_processing'],
                        where: { case_no: caseNo, file_processing: 'inprogress', request_type: 'FORENSIC' }
                    }),
                    RequestDocument.find({
                        select: ['file_processing'],
                        where: { case_no: caseNo, file_processing: ['completed', 'notApplicable'], request_type: 'FORENSIC' }
                    })
                ])
            }


            if (forensicInprogressRows.length > 0) {
                return res.send({
                    status: "ok",
                    statusCode: "NC200",
                    request_id: requestId,
                    resCode: "INPROGRESS",
                    message: "Report creation in progress"
                });
            }

            let reportGenrated;
            if (forensicCompletedRows.length > 0) reportGenrated = 1;

            return res.send({
                status: "ok",
                statusCode: "NC200",
                request_id: requestId,
                resCode: reportGenrated ? "CREATED" : "NOT_FOUND",
                message: reportGenrated ? "Report created." : "No upload found against this request id"
            });
        } catch (err) {
            console.log(err);
            let resCode, statusCode;
            if (err[0] && err[1]) statusCode = `NC${err[0]}`, resCode = err[1];

            let response = {
                status: 'nok',
                statusCode: statusCode || 'NC500',
                resCode: resCode || 'SERV_ERR',
                request_id: requestId,
                message: sails.config.msgConstants[resCode] || 'Server error occurred.'
            };

            return res.status(err[0] || 500).send(response);
        }




    },
    saveNSDLPanData: async function (req, res) {
        const moment = require("moment");
        const { id, user_reference_no } = req.allParams();
        if (!id) return res.ok(sails.config.errRes.missingFields);
        let last_2_years = new Date();
        last_2_years = moment(last_2_years).subtract(2, 'years');

        let rowData = await PannoResponse.find({ kyc_key: id, dt_created: { '>=': last_1_month } }).sort("id DESC").limit(1),
            parsedData = {};
        rowData = rowData[0];
        const dateTime = await sails.helpers.istDateTime();
        if (rowData?.verification_response) {
            parsedData = JSON.parse(rowData.verification_response);
            if (parsedData?.nsdlPanData?.data) {
                parsedData.nsdlPanData.verification_timestamp = dateTime
                parsedData.nsdlPanData.user_reference_no = user_reference_no
                await PannoResponse.updateOne({ id: rowData.id }).set({ verification_response: JSON.stringify(parsedData) })
                return res.ok({ status: "ok", data: parsedData.nsdlPanData });
            }
        }

        const [statusCode, data] = await sails.helpers.surepassKycVerification("pan", id);
        if (!data?.data?.pan_number) return res.ok(data)
        data.kyc_key = id;
        data.verification_timestamp = dateTime;
        // update in panno_response
        if (rowData) {
            parsedData.nsdlPanData = data;
            await PannoResponse.update({ kyc_key: id }).set({
                verification_response: JSON.stringify(parsedData),
                panStatus: 'E',
                uniqueId: null
            });
        }
        else {
            let createObject = {
                kyc_key: id,
                verification_response: JSON.stringify({ nsdlPanData: data }),
                ints: dateTime,
                panStatus: 'E',
                first_name: data.data.full_name_split[0],
                last_name: data.data.full_name_split[2],
                middle_name: data.data.full_name_split[1],
                uniqueId: null
            }
            await PannoResponse.create(createObject);
        }

        data.user_reference_no = user_reference_no

        return res.status(statusCode).send({
            status: 'ok',
            data
        });
    }
}

async function utilityBills(billType, req) {//
    let essentials = {}, url, reqPayload;
    if (billType === 'electricity') {
        let consumerNo = req.param('consumerNo');
        let electricityProvider = req.param('electricityProvider');
        let installationNumber = req.param('installationNumber');
        essentials = { consumerNo, electricityProvider, installationNumber };
        reqPayload = { essentials };
        url = sails.config.signzy.identityUrl1 + sails.config.signzy.patronId + '/electricityBills';
    } else if (billType === 'lpg') {
        let lpgId = req.param('lpgId');
        essentials = { lpgId };
        reqPayload = { task: 'lpgidverification', essentials };
        url = sails.config.signzy.identityUrl1 + sails.config.signzy.patronId + '/lpgs';
    }
    let token = await sails.helpers.getSignzyToken();
    let header = {
        'Authorization': token,
        'Content-Type': 'application/json'
    };
    let data = await sails.helpers.apiTrigger(
        url,
        JSON.stringify(reqPayload),
        header,
        'POST'
    );

    let response = {}, status = 200;

    if (data.status === 'nok') {
        response.status = 'nok';
        try {
            data = data.result;
            data = JSON.parse(data);
            status = data.error.status;
            response.statusCode = `NC${status}`;
            response.message = data.error.message;
        } catch (err) {
            console.log(err);
            status = 500;
            response.statusCode = 'NC500';
            response.message = 'Server error';
        }
    }
    else {
        response.status = 'ok';
        response.statusCode = 'NC200';
        response.message = JSON.parse(data).result;
    }

    return [response, status];
}

async function docMatch(type, document, clientData) {//
    let white_label_id = clientData.white_label_id;
    let user_id = clientData.id;

    let { s3_name: s3bucket, s3_region: region, cloud_provider } = await WhiteLabelSolutionRd.findOne({
        select: ['s3_name', 's3_region', 'cloud_provider'],
        where: { id: white_label_id }
    });

    let uploadFile, cloud = (cloud_provider && cloud_provider.upload), fileLoaction = {};
    let bucket = `${s3bucket}/users_${user_id}`;

    try {
        if (cloud === 'azure') {
            /* Azure is not allowing to upload 2 files simultaneously. That's why below approach. */
            let extension, filename = document._files[0].stream.filename;
            let filenameArr = filename.split('.');
            extension = filenameArr[filenameArr.length - 1];
            uploadFile = [];
            uploadFile.push(await azureUpload(document._files[0].stream, extension, s3bucket, user_id));
            if (document._files[1]) {
                filename = document._files[1].stream.filename;
                filenameArr = filename.split('.');
                extension = filenameArr[filenameArr.length - 1];
                uploadFile.push(await azureUpload(document._files[1].stream, extension, s3bucket, user_id));
            }
        } else if (cloud === 'aws') {
            uploadFile = await sails.helpers.s3FileUpload(document, bucket, region);
        }
        /* make sure png or jpeg files are uploaded */
        document._files.forEach((elm) => {
            if (elm.stream.headers['content-type'] !== 'image/jpeg' && elm.stream.headers['content-type'] !== 'image/png') {
                throw [400, 'UNSUPPORTED_FORMAT'];
            }
        });
        /* make sure 2 files are uploaded */
        if (document._files.length !== 2) throw [400, 'NOT2FILES'];
    } catch (err) {
        console.log(err);
        if (err[1] === 'UNSUPPORTED_FORMAT') {
            return [{ status: 'nok', statusCode: 'NC400', message: 'Uploaded file format is not supported. Please upload a JPEG or PNG file.' }, 400];
        } else if (err[1] === 'NOT2FILES') {
            return [{ status: 'nok', statusCode: 'NC400', message: 'Please upload 2 files.' }, 400];
        }
        return [{ status: 'nok', statusCode: 'NC500', message: 'Server error occurred. Please try again.' }, 500];
    }

    if (!uploadFile || uploadFile.length < 2) {
        /* This block is for no file upload*/
        if (document && document.fieldName !== 'document') return [{
            status: 'nok',
            statusCode: 'NC400',
            message: 'Please upload 2 files.'
        }, 400];
        return [{
            status: 'nok',
            statusCode: 'NC502',
            message: 'Unable to upload file. Please try again.',
        }, 502];
    }

    let doc_name1 = uploadFile[0].fd;
    let doc_name2 = uploadFile[1].fd;
    let result = {}, statusCode = 200;


    let url;
    if (type === 'signature') url = sails.config.kycExtraction.urls.sign_match;
    else if (type === 'photo') url = sails.config.kycExtraction.urls.photo_match;
    let payload = { user_id, doc_name1, doc_name2, white_label_id, s3bucket, region, cloud };
    console.log(payload);

    //calling the ML API to match the two uploaded documents
    let apiResponse = await sails.helpers.apiTrigger(
        url,
        JSON.stringify(payload),
        { "content-type": "application/json" },
        'POST'
    );

    let data;

    try {
        data = JSON.parse(apiResponse);
    } catch (err) {
        result = { status: 'nok', statusCode: 'NC502', message: 'Bad gateway or invalid document uploaded' };
        return [result, 502];
    }

    statusCode = 200;
    result = {
        status: 'ok',
        statusCode: 'NC200',
        message: `${type} match result`,
        data
    };

    try {
        fileLoaction = {
            s3bucket,
            region,
            cloud,
            s3Filepath: JSON.stringify({
                img1: `users_${user_id}/${doc_name1}`,
                img2: `users_${user_id}/${doc_name2}`
            })
        }
    } catch (err) {
        console.log(err);
    }

    return [result, statusCode, fileLoaction];
}

async function azureUpload(stream, extension, bucket, userId) {
    const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

    let account = sails.config.azure.is_dev_env
        ? sails.config.azure.dev_env.storage.storageAccountName
        : sails.config.azure.prod_env.storage.storageAccountName;
    let accountKey = sails.config.azure.is_dev_env
        ? sails.config.azure.dev_env.storage.secret
        : sails.config.azure.prod_env.storage.secret;

    let container = bucket;
    try {
        const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
        const blobServiceClient = new BlobServiceClient(
            `https://${account}.blob.core.windows.net`,
            sharedKeyCredential
        );

        const uniqueId = uuidv4();
        const fileName = `${uniqueId}.${extension}`;

        const containerClient = blobServiceClient.getContainerClient(`${container}/users_${userId}`);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        await blockBlobClient.uploadStream(stream);
        return { fd: fileName };
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function awsS3Upload(stream, extension) {

    try {
        AWS.config.update({
            key: sails.config.aws.cred.accessKeyId,
            secret: sails.config.aws.cred.secretAccessKey,
            region: 'ap-southeast-1'
        });

        const s3 = new AWS.S3();

        const uniqueId = uuidv4();
        fileName = `${uniqueId}.${extension}`;
        let params = {
            Bucket: `testbank-nc`,
            Key: fileName,
            Body: stream,
            ContentType: 'application/pdf',
            ACL: 'public-read'
        };

        let uploadRes = await s3.upload(params).promise();
        console.log(`downloadLink=> ${uploadRes.Location}`);
        return uploadRes.Location;
    } catch (err) {
        return false;
    }

}

const merge = (a, b) => Object.fromEntries(Object
    .entries(a)
    .map(([k, v]) => [k, v && typeof v === 'object'
        ? merge(v, b[k])
        : v || b[k]
    ])
)
