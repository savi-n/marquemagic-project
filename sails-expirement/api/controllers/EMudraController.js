/**
 * EMudraController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require('axios');

const DEFAULT_DOCUMENT_SIZE_LIMIT = 8 * 1024 * 1024; // 8 MB to bytes
const headers = {
    'UserName': 'admin@muthoot.com'
}

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const statusMapping = {
    'InActive': 'Withdrawn',
    'Pending': 'Initiated',
    'Completed': 'Complete',
    'Recalled': 'Withdrawn'
};

async function uploadJsonToS3(bucketName, key, jsonContent) {
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: JSON.stringify(jsonContent),
        ContentType: "application/json"
    };

    try {
        await s3.putObject(params).promise();
        return true;
    } catch (error) {

        return error.message;
    }
}

async function uploadToS3(req, res, path) {

    const s3 = new AWS.S3();

    const bucketName = 'namastecredit';
    const uploadFileKey = `muthoot/emudra/reqres/${path}`;

    const fileContent = JSON.stringify({
        req,
        res
    });

    const uploadDataBuffer = Buffer.from(fileContent, 'utf-8');

    const params = {
        Bucket: bucketName,
        Key: uploadFileKey,
        Body: uploadDataBuffer,
    };

    await s3.upload(params).promise();

}
const params = {
    Bucket: 'namastecredit',
    Key: 'muthoot/emudra/branch_code_to_hsm_user_mapping/data.json'
};

const checkObjectSize = async (bucket, key, size = DEFAULT_DOCUMENT_SIZE_LIMIT) => {
    try {
        const headObject = await s3.headObject({Bucket: bucket, Key: key}).promise();
        return Number(size) > headObject.ContentLength;
    } catch (error) {
        console.error('Error getting object size:', error);
        return false;
    }
};

const getSigningUrl = async (temp, emudraConfig) => {
    if (temp.emudra_ref_id && temp.emudra_status === "Co-Applicant Pending") {

        const url = emudraConfig.url.signingURl,
            method = 'POST',
            headers = {},
            body = {
                reference_no: temp.emudra_ref_id
            },
            options = {
                url,
                method,
                headers,
                data: body
            };

        try {
            const linkApiRes = await axios(options);
            if (linkApiRes?.data?.data?.url) {
                temp.url = linkApiRes?.data?.data?.url;
            }
        } catch (error) {
            console.error(error);
        }

    }

}

const formatDate = (dateStr) => {
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}


// get the latest file from s3 and update in the config
s3.getObject(params, (err, data) => {
    if (err) {
        console.log('Error reading file from S3', params.Key);
        return;
    }

    try {

        const jsonContent = JSON.parse(data.Body.toString());

        if (sails?.config?.branchcodeToHsmUserMapping) {
            sails.config.branchcodeToHsmUserMapping = jsonContent;
        }

    } catch (error) {

        console.log(error?.message);

    }

});

// signedUnsignedDoctypeMapping

module.exports = {

    eSignDetails: async function (req, res) {

        try {

            const {loan_id: loanId} = req.query;

            if (!loanId) throw new Error("Mandatory params missing");

            const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["white_label_id"]);

            const whiteLabelId = loanRequestData?.white_label_id;
            const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

            const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

            if (!emudraConfig) throw new Error("Missing configuration for EMudra");

            const doctypeMapping = emudraConfig?.unsignedSignedDocumentMapping;
            if (!doctypeMapping) throw new Error("missing doc type mapping");

            //update the config

            const loanDocumentForms = await LoanDocumentRd.find({
                loan: loanId,
                doctype: emudraConfig.docTypeId.loanDocuments,
                status: "active"
            }).sort("id desc");

            const loanDocumentMapping = {};
            for (const item of loanDocumentForms) {

                // ensuring to include only the latest document details in the mapping
                if (!loanDocumentMapping[item.doctype] || item.id > loanDocumentMapping[item.doctype].id) {
                    loanDocumentMapping[item.doctype] = item;
                }

            }

            const lenderDocumentForms = await LenderDocumentRd.find({
                loan: loanId,
                doc_type: emudraConfig.docTypeId.lenderDocuments,
                status: "active"
            }).sort("id desc");

            const lenderDocumentMapping = {};

            for (const item of lenderDocumentForms) {

                if (!lenderDocumentMapping[item.doc_type] || item.id > lenderDocumentMapping[item.doc_type].id) {
                    lenderDocumentMapping[item.doc_type] = item;
                }

            }

            //check if the document mapping contains all the 3 lender documents, if not then remove the merged document from here

            const lenderDocuments = emudraConfig.docTypeId.lenderDocuments;
            if (Object.keys(lenderDocumentMapping).length != lenderDocuments.length) {

                if (Object.keys(lenderDocumentMapping).includes(String(emudraConfig.docTypeId.mergedDocument))) {

                    delete lenderDocumentMapping[emudraConfig.docTypeId.mergedDocument];

                }

            }

            const responseArray = [];
            let allowMergedDocument = true;

            for (const item of Object.keys(loanDocumentMapping)) {

                const temp = {};

                const document = loanDocumentMapping[item];
                const documentDetails = await LoanDocumentDetailsRd.find({
                    loan_id: loanId,
                    doc_id: document.id
                }).select(["emudra_ref_id", "emudra_status", "upts"]).sort("id desc");

                if (!documentDetails || !documentDetails[0] || (item == emudraConfig.docTypeId.mergedDocument && allowMergedDocument == false)) {
                    allowMergedDocument = false;
                    continue;
                }

                // system generated
                const findCondition = {
                    loan: loanId,
                    doc_type: doctypeMapping[item],
                    status: 'active',
                    uploaded_by: emudraConfig.uploaded_by
                };

                // uploaded by user in the document upload section
                if (documentDetails[0].emudra_status == 'Offline') {
                    findCondition.uploaded_by = {'!=': emudraConfig.uploaded_by};
                }

                let signedDocument;
                if (documentDetails[0].emudra_status != null && documentDetails[0].emudra_status != 'Pending' && documentDetails[0].emudra_status != 'Withdrawn') {
                    signedDocument = await LenderDocumentRd.find(findCondition).select(["doc_name", "uploaded_doc_name", "user_id"]).sort("id desc").limit(1);
                }

                let uploadedDocName, uploadedUserId, docName;
                if (signedDocument && signedDocument[0]) {
                    uploadedDocName = signedDocument[0].uploaded_doc_name;
                    uploadedUserId = signedDocument[0].user_id;
                    docName = signedDocument[0].doc_name;
                }

                if (!documentDetails || !documentDetails[0]) {
                    loanDocumentMapping[item].emudra_ref_id = null;
                    loanDocumentMapping[item].emudra_status = "Waiting for document";
                } else {
                    temp.id = loanDocumentMapping[item].id;
                    temp.doc_id = loanDocumentMapping[item].id;
                    temp.doc_type_id = item;
                    temp.emudra_status = documentDetails[0].emudra_status || 'Pending';
                    temp.emudra_ref_id = documentDetails[0].emudra_ref_id;
                    temp.doc_tag = emudraConfig.documentTags[item];
                    temp.doc_type = 'loan';
                    temp.doc_name = docName || loanDocumentMapping[item].doc_name;
                    temp.uploaded_doc_name = uploadedDocName || loanDocumentMapping[item].uploaded_doc_name;
                    temp.user_id = uploadedUserId || loanDocumentMapping[item].user_id;
                    temp.loan_id = loanDocumentMapping[item].loan;
                    temp.primary_id = documentDetails[0].id
                    //1 hour timer
                    if (!["Pending", "Complete", "Offline", null].includes(documentDetails[0].emudra_status)) {
                        const current_time = new Date(await sails.helpers.dateTime());
                        const doc_upts = documentDetails[0].upts;
                        let doc_upts_plus1hr = doc_upts;
                        doc_upts_plus1hr.setHours(doc_upts.getHours() + 1);
                        const difference = Math.round((doc_upts_plus1hr - current_time) / (1000 * 60));
                        temp.remaining_minute = difference >= 0 ? difference : 0;
                    }
                    const date = new Date(loanDocumentMapping[item].on_upd);

                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                    temp.date_time = formattedDate;

                }

                if (emudraConfig?.feature_flags?.get_signing_url) {
                    await getSigningUrl(temp, emudraConfig);
                }

                responseArray.push(temp);

            }

            for (const item of Object.keys(lenderDocumentMapping)) {

                const temp = {};
                const document = lenderDocumentMapping[item];
                const documentDetails = await LoanDocumentDetailsRd.find({
                    loan_id: loanId,
                    doc_id: document.id
                }).select(["emudra_ref_id", "emudra_status", "upts"]).sort("id DESC");

                if (!documentDetails || !documentDetails[0] || (item == emudraConfig.docTypeId.mergedDocument && allowMergedDocument == false)) {
                    allowMergedDocument = false;
                    continue;
                }

                const findCondition = {
                    loan: loanId,
                    doc_type: doctypeMapping[item],
                    status: 'active',
                    uploaded_by: emudraConfig.uploaded_by
                };

                if (documentDetails[0].emudra_status == 'Offline') {
                    findCondition.uploaded_by = {'!=': emudraConfig.uploaded_by};
                }

                let signedDocument;
                if (documentDetails[0].emudra_status != null && documentDetails[0].emudra_status != 'Pending' && documentDetails[0].emudra_status != 'Withdrawn') {
                    signedDocument = await LenderDocumentRd.find(findCondition).select(["doc_name", "uploaded_doc_name", "user_id"]).sort("id desc").limit(1);
                }


                let uploadedDocName, uploadedUserId, docName;
                if (signedDocument && signedDocument[0]) {
                    uploadedDocName = signedDocument[0].uploaded_doc_name;
                    uploadedUserId = signedDocument[0].user_id;
                    docName = signedDocument[0].doc_name;
                }


                if (!documentDetails || !documentDetails[0]) {
                    lenderDocumentMapping[item].emudra_ref_id = null;
                    lenderDocumentMapping[item].emudra_status = "Waiting for document";
                } else {
                    temp.id = lenderDocumentMapping[item].id;
                    temp.doc_id = lenderDocumentMapping[item].id;
                    temp.doc_type_id = item;
                    temp.emudra_status = documentDetails[0].emudra_status || 'Pending';
                    temp.emudra_ref_id = documentDetails[0].emudra_ref_id;
                    temp.doc_tag = emudraConfig.documentTags[item];
                    temp.doc_type = 'lender';
                    temp.doc_name = docName || lenderDocumentMapping[item].doc_name;
                    temp.uploaded_doc_name = uploadedDocName || lenderDocumentMapping[item].uploaded_doc_name;
                    temp.user_id = uploadedUserId || lenderDocumentMapping[item].user_id;
                    temp.loan_id = lenderDocumentMapping[item].loan;
                    temp.primary_id = documentDetails[0].id
                    //1 hour timer
                    if (!["Pending", "Complete", "Offline", null].includes(documentDetails[0].emudra_status)) {
                        const current_time = new Date(await sails.helpers.dateTime());
                        const doc_upts = documentDetails[0].upts;
                        let doc_upts_plus1hr = doc_upts;
                        doc_upts_plus1hr.setHours(doc_upts.getHours() + 1);
                        const difference = Math.round((doc_upts_plus1hr - current_time) / (1000 * 60));
                        temp.remaining_minute = difference >= 0 ? difference : 0;
                    }
                    const date = new Date(lenderDocumentMapping[item].on_upd);

                    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                    temp.date_time = formattedDate;

                }

                if (emudraConfig?.feature_flags?.get_signing_url) {
                    await getSigningUrl(temp, emudraConfig);
                }
                responseArray.push(temp);

            }

            return res.send({
                status: "ok",
                message: "Data Fetched successfully",
                data: {
                    responseArray
                }
            })


        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            })
        }

    },

    initiate: async function (req, res) {

        try {

            const {document_id: documentId, doc_type: docType, loan_id: loanId, doc_type_id: docTypeId} = req.body;

            if (!documentId || !docType || !loanId || !docTypeId) throw new Error("Mandatory fields missing");

            if (docType != "loan" && docType != "lender") throw new Error("Invalid docType");

            const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["white_label_id", "loan_ref_id"]);

            const whiteLabelId = loanRequestData?.white_label_id;
            const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

            const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

            if (!emudraConfig) throw new Error("Missing configuration for EMudra");

            const configCheck = await sails.helpers.validateEmudraConfig(req?.user?.id, loanId, emudraConfig);
            if (!configCheck?.status) throw new Error(configCheck?.message || "Validation Failed");

            const doctypeMapping = emudraConfig.unsignedSignedDocumentMapping;
            if (!doctypeMapping) throw new Error("missing doc type mapping");

            const loanDocumentDetails = await LoanDocumentDetails.find({
                doc_id: documentId,
                doc_request_type: docType,
            }).sort("id desc");

            if (!loanDocumentDetails || !loanDocumentDetails[0]) throw new Error("No document found");
            if (emudraConfig.multiple_record_check && loanDocumentDetails.length > 1) throw new Error("More than one record found for the given type of document");

            if (loanDocumentDetails[0].emudra_status != null && loanDocumentDetails[0].emudra_status != 'Pending' && loanDocumentDetails[0].emudra_status != 'Withdrawn' && loanDocumentDetails[0].emudra_status != 'Offline') throw new Error("ESignature has already been initiated for this document");

            let documentDetails;

            if (docType == "loan") {
                documentDetails = await LoanDocumentRd.findOne({
                    id: documentId,
                    status: "active"
                });
                if (!emudraConfig.docTypeId.loanDocuments.includes(documentDetails.doctype)) throw new Error("This document type is not allowed");

            }
            else {
                documentDetails = await LenderDocumentRd.findOne({
                    id: documentId,
                    status: "active"
                });
                if (!emudraConfig.docTypeId.lenderDocuments.includes(documentDetails.doc_type)) throw new Error("This document type is not allowed");
                const currentDate = new Date();
                const updatedDate = new Date(documentDetails.on_upd);

                if (
                    emudraConfig.check_date_validation &&
                    (documentDetails.doc_type == emudraConfig.docTypeId.loanAgreementLetter ||
                        documentDetails.doc_type == emudraConfig.docTypeId.mergedDocument) &&
                    updatedDate < currentDate
                ) {
                    throw new Error("The document was last updated on an older date. Please regenerate the document and try again.");
                }

            }

            if (!documentDetails) throw new Error("No active document found");
            if (documentDetails.loan != loanId) throw new Error("Provided loan does does not match with the document loan id");


            const loanDetails = await LoanrequestRd.findOne({id: loanId}).select(["business_id", "white_label_id", "branch_id", "loan_amount", "loan_amount_um"]);

            if (!loanDetails) throw new Error("No loan found with the given loan id");
            if (!loanDetails?.business_id) throw new Error("No business id for the given loan");
            if (!loanDetails?.loan_amount) throw new Error("Invalid loan amount");

            const director_details = await DirectorRd.find({business: loanDetails.business_id, status: 'active'});

            if (!director_details) throw new Error("No director found for this loan");

            const applicantId = director_details[0].id;

            const emailAddressMapping = {};

            const director_email_details = director_details.map((item) => {
                const email = String(item.demail).toLocaleLowerCase().trim();
                if (!email) throw new Error(`Email missing from applicant ${item.dfirstname}`);

                if (emailAddressMapping[email]) throw new Error(`Duplicate Email address`);
                emailAddressMapping[email] = true;

                return email;
            });

            if (emudraConfig.docTypeId.hsmDocuments.includes(docTypeId)) {

                if (emudraConfig?.hsmSigner) {

                    const branch_id = loanDetails?.branch_id;
                    if (!branch_id) throw new Error("Missing branch id");

                    const branch = await BanktblRd.findOne({id: branch_id}).select("ifsc");

                    if (!branch || !branch?.ifsc) throw new Error("missing data in bank table");
                    let bcmEmail = sails.config.branchcodeToHsmUserMapping[branch.ifsc];

                    if (!bcmEmail) {
                        bcmEmail = emudraConfig?.bcm_email;
                    }
                    if (!bcmEmail) throw new Error("This Branch is mapped with the BCM email address");

                    director_email_details.push(bcmEmail);

                    const director_data = {
                        dfirstname: 'Muthoot Fincorp Limited',
                        dcontact: emudraConfig.muthootPhoneNumber,
                        dpancard: emudraConfig.muthootPanCard
                    };
                    director_details.push(director_data);

                }

            }
            //uuid generate unique Id

            let fileName = Date.now().toString() + Math.floor(Math.random() * (999 - 100 + 1) + 100);
            if (emudraConfig?.new_name_format) {
                fileName = `${loanRequestData.loan_ref_id}_${Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)}`
            }

            //get base64 document from s3

            const white_label_id = loanDetails?.white_label_id;

            if (!white_label_id) throw new Error("white_label_id missing");

            // const whiteLabelSolution = await WhiteLabelSolution.findOne({id: white_label_id}).select(["s3_name", "s3_region"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region) throw new Error("Missing white_label_solution data");

            const {s3_name, s3_region} = whiteLabelSolution;
            const s3 = new AWS.S3();
            AWS.config.update({
                region: s3_region
            });

            const userId = documentDetails?.user_id;
            if (!userId) throw new Error("user_id missing");

            const awsFileName = `users_${userId}/${documentDetails.doc_name}`;

            const params = {
                Bucket: s3_name,
                Key: awsFileName,
            };

            let eSignFlag = false;


            let numberOfDirectors = director_email_details.length;
            if (emudraConfig.docTypeId.hsmDocuments.includes(docTypeId) && emudraConfig?.hsmSigner) {
                numberOfDirectors = numberOfDirectors - 1;
            }
            let template;

            if (docTypeId == emudraConfig?.docTypeId?.loanApplicationForm || docTypeId == emudraConfig?.docTypeId?.mergedDocument) {

                const noOfPages = loanDocumentDetails[0].coordinates_for_signatures;
                if (!Number(noOfPages) || typeof (Number(noOfPages)) != 'number') throw new Error("Invalid number of pages");

                template = emudraConfig.templates[docTypeId][numberOfDirectors][noOfPages];

            }
            else {
                template = emudraConfig.templates[docTypeId][numberOfDirectors];
            }
            if (!template) throw new Error("No template found");

            const eSignPayload = {
                "Name": emudraConfig.credentials.name,
                "EmailId": emudraConfig.credentials.email,
                "ReferenceNo": fileName,
                "SignatoryEmailIds": director_email_details,
                "SignatureSettings": [],
                "lstDocumentDetails": [
                    {
                        "DocumentName": "sign.pdf",
                        "FileData": null,
                        // "ControlDetails": controlDetails
                        "TemplateId": template
                    }
                ]

            };

            for (const item of director_details) {

                if (item.dfirstname != 'Muthoot Fincorp Limited') {
                    eSignPayload.SignatureSettings.push({
                        "Name": item.dfirstname || "",
                        "MobileNo": item.dcontact || "",
                        "CountryCode": "+91" || "",
                        "CaptureSelfie": emudraConfig.capture_selfie
                    });
                }
                else {
                    eSignPayload.SignatureSettings.push({
                        "Name": "",
                        "MobileNo": "",
                        "CountryCode": "",
                    });
                }
            }

            const awsFileParams = params;

            if (emudraConfig.docTypeId.eStampDocuments.includes(Number(docTypeId))) {

                eSignFlag = true;

                //collateral details

                const assetsAdditionalRow = await AssetsAdditionalRd.find({
                    loan_id: loanId
                }).select(["initial_collateral", "modified_collateral"]).limit(1);

                if (!assetsAdditionalRow || !assetsAdditionalRow[0] || !assetsAdditionalRow[0].initial_collateral) throw new Error("Missing collateral details");

                const collateralState = assetsAdditionalRow[0]?.modified_collateral?.property_address_details?.state || assetsAdditionalRow[0]?.initial_collateral?.property_address_details?.state;
                const collateralPincode = assetsAdditionalRow[0]?.modified_collateral?.property_address_details?.pincode || assetsAdditionalRow[0]?.initial_collateral?.property_address_details?.pincode;
                const loanSanctionData = await LoanSanctionRd.findOne({
                    loan_id: loanId
                }).select(["san_amount", "amount_um", "san_emi", "san_date"]);

                if (!loanSanctionData || !loanSanctionData.san_amount) throw new Error("missing loan sanction details");

                const considerationPrice = await sails.helpers.amtInInr(loanSanctionData.san_amount, loanSanctionData.amount_um);

                const stateCode = emudraConfig?.stateMapping?.[collateralState];
                if (!stateCode) throw new Error("Missing state code");

                const articleCode = emudraConfig?.articleCodeMapping?.[collateralState];
                if (!articleCode) throw new Error("Missing article code");

                let stampDutyAmount = 200;
                const stampDuty = emudraConfig?.stamp_duty_amount?.[stateCode];

                if (stampDuty?.amount) {
                    stampDutyAmount = stampDuty.amount;
                } else if (stampDuty?.percent) {
                    stampDutyAmount = Math.ceil(stampDuty.percent * considerationPrice);
                } else {
                    stampDutyAmount = 200;
                }
                eSignPayload.eStampPayload = {
                    "loan": {
                        "regType": "4",
                        "state": stateCode,
                        "estampdtls": [
                            {

                                "firstparty": director_details[0].dfirstname,
                                "secondparty": director_details[director_details.length - 1].dfirstname,
                                "stampDutyAmount": stampDutyAmount,
                                "considerationPrice": considerationPrice,
                                "descriptionofDocument": "Loan Agreement documents",
                                "stampdutyPaidby": director_details[director_details.length - 1].dfirstname,
                                "articleCode": articleCode,
                                "firstPartyOVDType": "panno",
                                "firstPartyOVDValue": director_details[0].dpancard,
                                "secondPartyOVDType": "panno",
                                "secondPartyOVDValue": director_details[director_details.length - 1].dpancard,
                                "firstPartyPin": collateralPincode,
                                "secondPartyPin": emudraConfig.muthootPincode
                            }
                        ],
                        "prtcptentty": [
                        ]

                    }
                }

                if (emudraConfig?.feature_flags?.check_sanction_date_verification) {
                    const sanctionLastUpdatedDateTime = new Date(loanSanctionData.updated_at);
                    const documentGeneratedDateTime = new Date(documentDetails.on_upd);

                    if (documentGeneratedDateTime < sanctionLastUpdatedDateTime) throw new Error("Please regenerate the document and initiate again");
                }

                const prtcptenttyTemplate = [];
                let ovdCount = 0;
                for (let i = 1; i <= director_details.length; i++) {
                    const prtcptTemplate = {
                        "prtcptenttyId": i,
                        "fulnm": director_details[i - 1].dfirstname,
                        "cntrprtycntnm": director_details[i - 1].dfirstname,
                        "reltocntrct": ((i == 1 ? "Debtor" : (i == director_details.length ? "Creditor" : "Co-Obligant"))),
                        "emlid": director_email_details[i - 1],
                        "cntrprtycntmobno": director_details[i - 1].dcontact,
                        "panno": director_details[i - 1].dpancard || "",
                        "doi": "2005-12-28",
                        "lglcnstn": "Public Ltd",
                        "partytyp": "Indian Entity"
                    }

                    if (!director_details[i - 1].dpancard && emudraConfig?.ovd_type_flag) {
                        prtcptTemplate["ovdtype"] = emudraConfig?.ovdtype;
                        prtcptTemplate["ovdid"] = ovdCount ? `${emudraConfig?.ovdid}${ovdCount}` : emudraConfig.ovdid;
                        ovdCount++;
                    }

                    prtcptenttyTemplate.push(prtcptTemplate);

                };

                eSignPayload.eStampPayload.loan['prtcptentty'] = prtcptenttyTemplate;

                eSignPayload.InitiateNESLFlow = true;
                eSignPayload.eStampType = "online";

            }

            if (emudraConfig?.feature_flags?.limit_document_size) {
                const isSizeValid = await checkObjectSize(awsFileParams.Bucket, awsFileParams.Key, emudraConfig?.feature_flags?.size_limit_in_bytes);
                if (!isSizeValid) throw new Error("Size limit exceeded");
            }

            //make api call
            const url = emudraConfig.url.initiateSignIn,
                method = 'POST',

                options = {
                    url,
                    data: {eSignPayload, awsFileParams},
                    method,
                    headers
                };
            let apiRes, createdRow;

            try {

                if (emudraConfig?.feature_flags?.logs_before_initiate) {
                    const dateTime = await sails.helpers.dateTime();

                    if (emudraConfig?.feature_flags?.allow_cooldown) {

                        const lastUpdatedTime = new Date(loanDocumentDetails[0].upts);
                        const currentTime = new Date(dateTime);

                        const cooldownPeriod = emudraConfig?.feature_flags?.cooldown_period || 120000;
                        const timeDifference = currentTime - lastUpdatedTime;
                        if (timeDifference < cooldownPeriod) {
                            throw new Error(`Too many requests, please try again after ${Math.ceil((cooldownPeriod) / (1000 * 60))} minutes`);
                        }

                    }

                    await LoanDocumentDetails.updateOne({
                        id: loanDocumentDetails[0].id
                    }).set({
                        emudra_response: {
                            initiated: "online",
                            upts: dateTime
                        },
                    });

                    await uploadToS3(eSignPayload, {}, `${loanId}/INITIATE_LOGS/${fileName}.json`);

                }
                apiRes = await axios(options);
                const dateTime = await sails.helpers.dateTime();
                await uploadToS3(eSignPayload, apiRes.data, `${loanId}/RESPONSE_LOGS/${fileName}.json`);
                if (apiRes?.data?.IsSuccess == true) {
                    createdRow = await LoanDocumentDetails.updateOne({
                        id: loanDocumentDetails[0].id
                    }).set({
                        upts: dateTime,
                        emudra_status: 'Initiated',
                        emudra_response: apiRes?.data,
                        emudra_ref_id: fileName
                    });

                }
                else {

                    createdRow = await LoanDocumentDetails.updateOne({
                        id: loanDocumentDetails[0].id
                    }).set({
                        upts: dateTime,
                        emudra_response: apiRes?.data
                    });

                    throw new Error(apiRes?.data?.Messages[0] || "Failed to Initiate document");

                }

            } catch (error) {

                await uploadToS3(eSignPayload, error?.response?.data || {}, `${loanId}/ERROR_LOGS/${fileName}.json`);
                return res.send({
                    status: "nok",
                    message: error?.response?.data || error?.message
                });

            }

            return res.send({
                status: "ok",
                message: "Document Initiated Successfully!",
                esign_flag: eSignFlag,
                data: apiRes?.data
            });


        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }

    },

    recall: async function (req, res) {

        try {

            const {document_id: documentId, loan_id: loanId, emudra_ref_id: emudraRefId} = req.body;
            if (!documentId || !loanId || !emudraRefId) throw new Error(sails.config.msgConstants.mandatoryFieldsMissing);

            const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["white_label_id"]);

            const whiteLabelId = loanRequestData?.white_label_id;
            const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

            const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

            if (!emudraConfig) throw new Error("Missing configuration for EMudra");

            const configCheck = await sails.helpers.validateEmudraConfig(req?.user?.id, loanId, emudraConfig);
            if (!configCheck?.status) throw new Error(configCheck?.message || "Validation Failed");

            let loanDocumentDetails = await LoanDocumentDetailsRd.findOne({
                doc_id: documentId,
                emudra_ref_id: emudraRefId,
                emudra_status: {"!=": null}
            }).select(["emudra_ref_id", "emudra_status", "emudra_track", "doc_request_type", "old_doc_type_id"]);

            if (!loanDocumentDetails || !loanDocumentDetails?.emudra_ref_id) throw new Error("Document Details missing");
            if (loanDocumentDetails?.emudra_status == "Withdrawn") throw new Error("The given document has already been withdrawn");

            //check the latest status of the document

            let url = emudraConfig.url.workFlowInfo,
                body = {
                    reference_no: loanDocumentDetails?.emudra_ref_id
                },
                method = 'POST',
                options = {
                    url,
                    data: body,
                    headers,
                    method
                };
            let updateObj = {}, emudraTrackData = null;
            let apiRes;

            try {

                apiRes = await axios(options);
                let emudra_status;

                if (apiRes?.data?.IsSuccess == true) {


                    if (!apiRes?.data?.Response?.WorkflowStatus) {
                        emudra_status = "Failed";
                    }

                    if (apiRes?.data?.Response?.WorkflowStatus == "Pending") {

                        const signatories = apiRes?.data?.Response?.Signatories;
                        if (signatories && signatories.length) {

                            if (signatories.length == 1) {
                                emudra_status = statusMapping[signatories[0].Status]
                            }
                            else {

                                if (signatories[0].Status == 'Pending') emudra_status = statusMapping[signatories[0].Status];
                                else emudra_status = 'Co-Applicant Pending';

                            }

                        }
                        else {
                            emudra_status = 'signatories_missing';
                        }

                    }
                    else {
                        emudra_status = statusMapping[apiRes?.data?.Response?.WorkflowStatus] || "not_found";
                    }

                }
                else {
                    emudra_status = "api_error";
                }


                updateObj = {
                    emudra_response: apiRes?.data
                }

            } catch (error) {

                return res.status(error?.response?.status || 400).send({
                    status: "ok",
                    message: error?.response?.data || error?.message
                });

            }


            url = emudraConfig.url.recall,
                body = {
                    reference_no: loanDocumentDetails.emudra_ref_id,
                    remarks: "Cancelled on User Request"
                },
                method = 'POST',
                options = {
                    url,
                    data: body,
                    headers,
                    method
                };

            try {
                apiRes = await axios(options);
                if (apiRes?.data?.IsSuccess == true) {

                    const dateTime = await sails.helpers.dateTime();
                    updateObj.emudra_status = "Withdrawn";
                    updateObj.upts = dateTime;

                    await LoanDocumentDetails.updateOne({
                        id: loanDocumentDetails?.id
                    }).set(updateObj);

                }
                else {

                    return res.send({
                        status: "nok",
                        message: "Failed to Recall document",
                        data: apiRes?.data
                    });

                }

                return res.send({
                    status: "ok",
                    message: "Document Withdrawn successfully",
                });

            } catch (error) {

                return res.status(error?.response?.status || 400).send(error?.response?.data || error?.message);

            }

        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            });
        }

    },

    setOfflineMode: async function (req, res) {

        try {

            const {id: docId, loan_id: loanId} = req.body;
            if (!docId || !loanId) throw new Error("Mandatory fields missing");

            const loanDocumentDetails = await LoanDocumentDetailsRd.find({
                loan_id: loanId,
                doc_id: docId
            }).select("emudra_status").sort("id desc");

            if (!loanDocumentDetails[0]) throw new Error("No records found for this document");

            if (loanDocumentDetails[0].emudra_status != 'Offline' && loanDocumentDetails[0].emudra_status != "Pending" && loanDocumentDetails[0].emudra_status != "Withdrawn" && !loanDocumentDetails[0]) throw new Error("Please withdraw the document to select offline mode");

            const updateCond = {emudra_status: 'Offline'};

            if (loanDocumentDetails[0].emudra_status == 'Offline') updateCond.emudra_status = 'Pending';

            await LoanDocumentDetails.updateOne({
                id: loanDocumentDetails[0].id
            }).set(updateCond);

            // go through all the documents and check whether they are offline, if they're offline set the stamp duty amount to 0

            const lapAgreement = await LenderDocumentRd.find({
                loan: loanId,
                doc_type: sails.config.EMudra.docTypeId.loanAgreementLetter,
                status: 'active'
            }).sort("id DESC").limit(1);
            const mergedDocument = await LenderDocumentRd.find({
                loan: loanId,
                doc_type: sails.config.EMudra.docTypeId.mergedDocument,
                status: 'active'
            }).sort("id DESC").limit(1);

            const documentDetails = await LoanDocumentDetailsRd.find({
                doc_id: [lapAgreement[0].id, mergedDocument[0].id],
                emudra_status: 'Offline'
            });
            if (documentDetails && documentDetails.length == 2) {
                await LoanSanction.updateOne({
                    loan_id: loanId
                }).set({
                    charge1: 0
                });
            }


            return res.send({
                status: "ok",
                message: `Status set to ${updateCond.emudra_status}`
            });

        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            })
        }

    },

    getVersions: async function (req, res) {

        try {

            const {doc_type_id: docTypeId, loan_id: loanId, doc_type: docType} = req.query;

            if (!docTypeId || !loanId || !docType) throw new Error("Missing mandatory fields");

            if (docType != 'loan' && docType != 'lender') throw new Error("doc type is not valid");

            const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["white_label_id"]);

            const whiteLabelId = loanRequestData?.white_label_id;
            const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

            const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

            if (!emudraConfig) throw new Error("Missing configuration for EMudra");

            const doctypeMapping = emudraConfig.unsignedSignedDocumentMapping;
            if (!doctypeMapping) throw new Error("missing doc type mapping");

            if (!doctypeMapping[docTypeId]) throw new Error("This doc type is not allowed");


            let documentVersions;
            if (docType == 'loan') {

                let loanDocuments = await LoanDocumentRd.find({
                    loan: loanId,
                    doctype: docTypeId
                }).select("id");

                loanDocuments = loanDocuments.map((item) => item.id)

                documentVersions = await LoanDocumentDetailsRd.find({
                    loan_id: loanId,
                    doc_id: loanDocuments,
                    doc_request_type: 'loan',
                    emudra_track: {'!=': null}
                }).select("emudra_track");

            } else {

                let lenderDocuments = await LenderDocumentRd.find({
                    loan: loanId,
                    doc_type: docTypeId
                }).select("id");

                lenderDocuments = lenderDocuments.map((item) => item.id)

                documentVersions = await LoanDocumentDetailsRd.find({
                    loan_id: loanId,
                    doc_id: lenderDocuments,
                    doc_request_type: 'lender',
                    emudra_track: {'!=': null}
                }).select("emudra_track");

            }

            return res.send({
                status: "ok",
                message: "Data fetched successfully",
                data: documentVersions
            });


        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }


    },

    validateEmudraDisbursement: async function (req, res) {

        try {

            const {loan_id: loanId} = req.query;

            if (!loanId) throw new Error(sails.config.msgConstants.mandatoryFieldsMissing);

            const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["white_label_id"]);

            const whiteLabelId = loanRequestData?.white_label_id;
            const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

            const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

            if (!emudraConfig) throw new Error("Missing configuration for EMudra");

            const doctypeMapping = emudraConfig.unsignedSignedDocumentMapping;
            if (!doctypeMapping) throw new Error("missing doc type mapping");

            let mergedDocumentDetails = await LenderDocumentRd.find({
                loan: loanId,
                doc_type: emudraConfig.docTypeId.mergedDocument,
                status: 'active',
            }).select("id").sort("id desc").limit(1);

            if (mergedDocumentDetails && mergedDocumentDetails[0]) {

                const documentDetailsMerged = await LoanDocumentDetailsRd.find({
                    loan_id: loanId,
                    doc_id: mergedDocumentDetails[0].id,
                    doc_request_type: 'lender'
                }).sort("id desc").limit(1);

                if (!documentDetailsMerged || !documentDetailsMerged[0]) throw new Error("Missing Merged document in document details")
                if (documentDetailsMerged[0].emudra_status != 'Offline') {
                    if (documentDetailsMerged[0].emudra_status == 'Complete') {
                        return res.send({
                            status: "ok",
                            message: "Merged document signed"
                        });
                    }
                    else {
                        throw new Error("Please sign the Merged document")
                    }
                }

            }

            mergedDocumentDetails = await LenderDocumentRd.find({
                loan: loanId,
                doc_type: doctypeMapping[emudraConfig.docTypeId.mergedDocument],
                status: 'active',
                uploaded_by: {"!=": emudraConfig.uploaded_by}
            }).select("id").limit(1);

            if (mergedDocumentDetails && mergedDocumentDetails[0]) return res.send({
                status: "ok",
                message: "Merged Document present"
            });

            const missingDocuments = [];
            const loanDocumentForms = await LoanDocumentRd.find({
                loan: loanId,
                doctype: emudraConfig.docTypeId.loanDocuments
            }).sort("id desc");

            const loanDocumentMapping = {};
            for (const item of loanDocumentForms) {

                // ensuring to include only the latest document details in the mapping
                if (!loanDocumentMapping[item.doctype] || item.id > loanDocumentMapping[item.doctype].id) {
                    loanDocumentMapping[item.doctype] = item;
                }

            }

            // find the missing documents
            for (const item of emudraConfig.docTypeId.loanDocuments) {
                if (!loanDocumentMapping[item]) {

                    if (doctypeMapping[item]) missingDocuments.push(item);

                }
            }

            const lenderDocumentForms = await LenderDocumentRd.find({
                loan: loanId,
                doc_type: emudraConfig.docTypeId.lenderDocuments
            }).sort("id desc");

            const lenderDocumentMapping = {};

            for (const item of lenderDocumentForms) {

                if (item.doc_type != emudraConfig.docTypeId.mergedDocument && (!lenderDocumentMapping[item.doc_type] || item.id > lenderDocumentMapping[item.doc_type].id)) {
                    lenderDocumentMapping[item.doc_type] = item;
                }

            }

            for (const item of emudraConfig.docTypeId.lenderDocuments) {
                if (!lenderDocumentMapping[item]) {

                    if (doctypeMapping[item] && item != emudraConfig.docTypeId.mergedDocument) missingDocuments.push(item);

                }
            }

            for (const item of Object.keys(loanDocumentMapping)) {

                const document = loanDocumentMapping[item];
                const documentDetails = await LoanDocumentDetailsRd.find({
                    loan_id: loanId,
                    doc_id: document.id
                }).select(["emudra_status"]).sort("id desc");

                if (!documentDetails || documentDetails[0].emudra_status == 'Offline') {

                    const lenderDocumentDetails = await LenderDocumentRd.find({
                        loan: loanId,
                        doc_type: doctypeMapping[item],
                        status: 'active',
                        uploaded_by: {"!=": emudraConfig.uploaded_by}
                    }).select("id").limit(1);

                    if (!lenderDocumentDetails[0]) throw new Error(`Please Upload the ${emudraConfig.documentTags[item]}(signed) in document upload`)

                }

                if (documentDetails[0].emudra_status != 'Complete' && documentDetails[0].emudra_status != 'Offline') {
                    throw new Error(`Please sign the merged document or Please Sign the ${emudraConfig.documentTags[item]}`);
                }

            }

            for (const item of Object.keys(lenderDocumentMapping)) {

                const document = lenderDocumentMapping[item];
                const documentDetails = await LoanDocumentDetailsRd.find({
                    loan_id: loanId,
                    doc_id: document.id
                }).select(["emudra_status"]).sort("id desc");

                if (!documentDetails || documentDetails[0].emudra_status == 'Offline') {

                    const lenderDocumentDetails = await LenderDocumentRd.find({
                        loan: loanId,
                        doc_type: doctypeMapping[item],
                        status: 'active',
                        uploaded_by: {"!=": emudraConfig.uploaded_by}
                    }).select("id").limit(1)

                    if (!lenderDocumentDetails[0]) throw new Error(`Please Upload the ${emudraConfig.documentTags[item]}(signed) in document upload`)

                }

                if (documentDetails[0].emudra_status != 'Complete' && documentDetails[0].emudra_status != 'Offline') {
                    throw new Error(`Please sign the merged document or Please Sign the ${emudraConfig.documentTags[item]}`);
                }

            }

            for (const item of missingDocuments) {

                const lenderDocumentDetails = await LenderDocumentRd.find({
                    loan: loanId,
                    doc_type: doctypeMapping[item],
                    status: 'active',
                    uploaded_by: {"!=": emudraConfig.uploaded_by}
                }).select("id").limit(1)

                if (!lenderDocumentDetails[0]) throw new Error(`Please Upload the ${emudraConfig.documentTags[item]} in document upload`);

            }

            return res.send({
                status: "ok",
                message: "All documents signed successfully"
            });

        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }

    },

    updateHsmEmails: async function (req, res) {
        try {

            const {req_type: reqType, branch, email} = req.body;
            if (!reqType || !branch || !email) throw new Error("Missing mandatory fields");

            const data = await s3.getObject(params).promise();
            let jsonContent = JSON.parse(data.Body.toString());

            if (!jsonContent) throw new Error("Missing json data in S3");

            if (reqType == 'add' && jsonContent[branch]) {
                throw new Error("The given branch already exists");
            }

            if (reqType !== 'add' && reqType !== 'update') throw new Error('Invalid req_type');
            jsonContent[branch] = email;
            const uploadResult = await uploadJsonToS3(params.Bucket, params.Key, jsonContent);
            if (uploadResult !== true) throw new Error(uploadResult);

            if (!sails?.config?.branchcodeToHsmUserMapping) throw new Error("Missing config for branchcodeToHsmUserMapping");
            sails.config.branchcodeToHsmUserMapping = jsonContent;

            return res.send({
                status: "ok",
                message: "Updated Successfully"
            });

        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }
    },

    stampDutyAmount: async function (req, res) {

        try {

            const {loan_id: loanId} = req.query;

            if (!loanId) throw new Error("Missing mandatory fields")
            const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["white_label_id"]);

            const whiteLabelId = loanRequestData?.white_label_id;
            const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

            const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

            if (!emudraConfig) throw new Error("Missing configuration for EMudra");

            const assetsAdditionalRow = await AssetsAdditionalRd.find({
                loan_id: loanId
            }).select(["initial_collateral", "modified_collateral"]).limit(1);

            if (!assetsAdditionalRow || !assetsAdditionalRow[0] || !assetsAdditionalRow[0].initial_collateral) throw new Error("Missing collateral details");

            const collateralState = assetsAdditionalRow[0]?.modified_collateral?.property_address_details?.state || assetsAdditionalRow[0]?.initial_collateral?.property_address_details?.state;
            const stateCode = emudraConfig?.stateMapping?.[collateralState];

            let stampDutyAmount = 200;
            const stampDuty = emudraConfig?.stamp_duty_amount?.[stateCode];

            if (stampDuty?.amount) {
                stampDutyAmount = stampDuty.amount;
            } else {
                stampDutyAmount = 200;
            }

            return res.send({
                status: "ok",
                message: "Stamp Duty fetched successfully",
                data: {
                    stamp_duty_amount: stampDutyAmount,
                    percent: stampDuty?.percent
                }
            })


        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            });

        }

    },

    estampFee: async function (req, res) {
        try {

            const {loan_id: loanId} = req.query;

            if (!loanId) throw new Error(sails.config.msgConstants.mandatoryFieldsMissing);

            const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["white_label_id"]);

            const whiteLabelId = loanRequestData?.white_label_id;
            const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

            if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

            const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

            if (!emudraConfig || !emudraConfig?.docTypeId?.loanDocuments || !emudraConfig?.docTypeId?.lenderDocuments) throw new Error("Missing configuration for EMudra");

            let emudraOnlineFlag = false;
            for (let docTypeId of emudraConfig?.docTypeId?.loanDocuments) {

                const loanDocument = await LoanDocumentRd.find({
                    loan: loanId,
                    doctype: docTypeId,
                    status: "active"
                }).sort("id DESC").limit(1);

                if (!loanDocument || !loanDocument[0]) throw new Error("Missing Loan Document");

                const documentDetails = await LoanDocumentDetailsRd.find({
                    doc_id: loanDocument[0].id,
                    loan_id: loanId,
                    doc_request_type: 'loan'
                }).sort("id desc").limit(1);

                if (documentDetails[0].emudra_status === 'Complete') {
                    emudraOnlineFlag = true;
                }

            }

            for (let docTypeId of emudraConfig?.docTypeId?.lenderDocuments) {

                const lenderDocument = await LenderDocumentRd.find({
                    loan: loanId,
                    doc_type: docTypeId,
                    status: "active"
                }).sort("id DESC").limit(1);

                if (!lenderDocument || !lenderDocument[0]) throw new Error(`Missing Document ${emudraConfig?.documentTags[docTypeId]}`);

                const documentDetails = await LoanDocumentDetailsRd.find({
                    doc_id: lenderDocument[0].id,
                    loan_id: loanId,
                    doc_request_type: 'lender'
                }).sort("id desc").limit(1);

                if (documentDetails[0].emudra_status === 'Complete') {
                    emudraOnlineFlag = true;
                }

            }

            return res.send({
                status: "ok",
                message: "Emudra mode found",
                mode: emudraOnlineFlag ? "Online" : "Offline"
            });

        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            })
        }
    }

};
