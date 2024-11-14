const http = require("https");
const fs = require("fs");
const path = require("path");
var request = require("request");

module.exports = {

    friendlyName: "sails experiment upload",
    description: "move files from sails plaid bucket to sails experiment bucket",

    inputs: {
        access_token: {
            type: 'string',
            required: true
        },
        loan_id: {
            type: 'string',
            required: true
        },
        req_id: {
            type: 'string',
            required: true
        },
        director_id: {
            type: 'string',
            required: true
        },
        bankId: {
            type: 'string',
            required: true
        },
        accountNo: {
            type: 'string',
            required: true
        },
        userId : {
            type: 'string',
            required: false
        },
        businesstype: {
            type:'number',
            required:true
        }
    },

    fn: async function (inputs, exits) {
        let clientReq = await ClientRequest.findOne({ request_id: inputs.req_id });
        if (clientReq.length == 0 || clientReq.req_status != "completed") {
            return exits.success({ result: "No record with complete status present for given Request_Id" });
        }
        let doc_type = clientReq.req_type;
        let doc_type_id;
        if (doc_type == 'GST') {
            doc_type_id = 6;
        } else if (doc_type == 'ITR') {
            doc_type_id = 6;
        } else if (doc_type == 'ROC') {
            doc_type_id = 12;
        } else if (doc_type == 'EQFAX') {
            doc_type_id = sails.config.equifax.docTypeId;
        } else {
            if(inputs.businesstype == 1){
                doc_type_id = 6;
            }
            if(inputs.businesstype == 7){
                doc_type_id =37; 
            }
        }

        let requestDocResponse = await RequestDocument.find({ request_id: inputs.req_id });
        if (requestDocResponse == null || requestDocResponse.length == 0) {
            return exits.success({ result: "Record not present with given Request_Id" });
        }
        let reqPath = requestDocResponse[0].req_path;
        if (reqPath == null) {
            return exits.success({ result: "No file found for the requestId" });
        }
        let fileName = requestDocResponse[0].req_filename;

        let my_path = path.join(__dirname, "..", "..");
        let dir = path.join(my_path, "download_documents");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            var createStream = fs.createWriteStream(`${dir}/.gitkeep`);
            createStream.end();
        }

        let fileDir = path.join(dir, "" + inputs.req_id);
        if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir);

        const requests = await http.get(reqPath, async (output) => {
            const filePath = `${fileDir}/doc_${fileName}`;
            const fileStream = await fs.createWriteStream(filePath);
            output.pipe(fileStream);
            fileStream.on("finish", async function () {
                await fileStream.close();
                let options = {
                    method: "POST",
                    url: `${sails.config.uploadToSails.uploadToSailsBucket}`,
                    headers: {
                        authorization: `Bearer ${inputs.access_token}`,
                        "content-type":
                            "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
                    },
                    // add the key userid here --- To Do [fetch value from upload to sails exp]
                    formData: {
                        userid:inputs.userId,
                        document: {
                            value: await fs.createReadStream(filePath),
                            options: { filename: `doc_${fileName}`, contentType: null },
                        },
                    },
                };
                let getPromise = function (options) {
                    return new Promise(function (resolve, reject) {
                        request(options, function (error, response, body) {
                            if (error) {
                                return reject("Error occured !");
                            } else {
                                return resolve(body);
                            }
                        });
                    });
                };

                getPromise(options)
                    .then(function (data) {
                        let uploadResult = JSON.parse(data);
                        let body = {
                            upload_document: [
                                {
                                    loan_id: inputs.loan_id,
                                    doc_type_id: doc_type_id,
                                    upload_doc_name: uploadResult.files[0].fd,
                                    document_key: uploadResult.files[0].fd,
                                    directorId: inputs.director_id
                                }
                            ]
                        }
                        if (doc_type == 'BANK_CUB') {
                            body.upload_document[0].bankId = inputs.bankId
                            body.upload_document[0].accountNo = inputs.accountNo
                        }
                        var option2 = {
                            method: "POST",
                            url: `${sails.config.uploadToSails.uploadToSailsDB}`,
                            headers: {
                                "content-type": "application/json",
                                authorization: `Bearer ${inputs.access_token}`,
                            },
                            body: body,
                            json: true,
                        };
                        return getPromise(option2);
                    })
                    .then(function (data) {
                        fs.rmdirSync(fileDir, { recursive: true });
                        return exits.success({ result: data });
                    })
                    .catch(function (err) {
                        fs.rmdirSync(fileDir, { recursive: true });
                        let requestId_res = { request_id: err };
                        return exits.success({ result: err });
                    });
            });
        });
    }
};
