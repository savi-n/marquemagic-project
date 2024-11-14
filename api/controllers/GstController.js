/**
 * GstController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require("moment");

module.exports = {

    getCaptcha: async function (req, res, next) {
        const gstIn = req.param('gstIn');
        if (!gstIn) return res.ok(sails.config.errRes.missingFields);

        const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
        const datetime = await sails.helpers.dateTime();
        const request_id = uniqueRandomId;

        await ClientRequest.create({
            request_id: uniqueRandomId,
            req_datetime: datetime,
            client_id: req.client_id,
            req_status: "initiate",
            is_active: "active",
            req_type: "GST",
            created_at: datetime,
            updated_at: datetime,
        }).fetch();

        let i = 0, response;
        const getResponse = new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (response) {
                    clearInterval(interval);
                    resolve(response);
                } else if (i === 110) {
                    clearInterval(interval);
                    reject({
                        statusCode: "NC504",
                        message: "Request timed out!"
                    });
                }
                i++;
            }, 500);
        });


        const client = await sails.helpers.grpcConnection();

        const data = {
            gstIn,
            businessId: '1'
        }

        client.gstGetCaptcha(data, async (error, result) => {
            if (!error) {
                await ClientRequest.update({
                    request_id,
                }).set({ req_status: "inprogress" });
                response = {
                    statusCode: result.statusCode,
                    message: result.message,
                    gstIn: result.gstIn,
                    imageUrl: result.imageUrl,
                    requestId: request_id
                };
            } else {
                await ClientRequest.update({
                    request_id,
                }).set({ req_status: "failed" });
                response = {
                    statusCode: 'NC500',
                    message: 'Error',
                };
            }
        })

        try {
            let value = await getResponse;
            return res.send(value);
        } catch (err) {
            return res.send(err);
        }
    },


    submitCaptcha: async function (req, res, next) {
        const request_id = req.param("requestId");
        const gstIn = req.param("gstIn");
        const captcha = req.param("captcha");
        if (!request_id || !captcha || !gstIn) return res.ok(sails.config.errRes.missingFields);

        let i = 0, response;
        const getResponse = new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (response) {
                    clearInterval(interval);
                    resolve(response);
                } else if (i === 110) {
                    clearInterval(interval);
                    reject({
                        statusCode: "NC504",
                        message: "Request timed out!"
                    });
                }
                i++;
            }, 500);
        });

        const client = await sails.helpers.grpcConnection();
        const data = {
            gstIn,
            captcha,
            businessId: '1'
        }
        client.gstSubmitCaptcha(data, async (error, result) => {
            if (!error) {
                if (result.statusCode == "NC200" || result.statusCode == "NC201") {
                    await ClientRequest.update({
                        request_id,
                    }).set({ req_status: "completed" }).fetch();
                } else {
                    await ClientRequest.update({
                        request_id,
                    }).set({ req_status: "failed" });
                }
                response = {
                    statusCode: result.statusCode,
                    message: result.message,
                    gstIn: result.gstIn,
                    result: result.result
                };
            } else {
                await ClientRequest.update({
                    request_id,
                }).set({ req_status: "failed" });
                response = {
                    statusCode: 'NC500',
                    message: 'Error',
                };
            }
        })

        try {
            let value = await getResponse;
            return res.send(value);
        } catch (err) {
            return res.send(err);
        }
    },

    gstGetCaptcha: async function (req, res, next) {
        const request_id = req.request_id;
        if (!requestId) return res.ok(sails.config.errRes.missingFields);

        const client = await sails.helpers.grpcConnection();
        const data = {
            "businessId": request_id
        }
        client.gstCredGetCaptcha(data, async (error, result) => {
            if (!error) {
                await ClientRequest.update({
                    request_id: requestId,
                }).set({ req_status: "inprogress" });
                return res.send(result);
            } else {
                await ClientRequest.update({
                    request_id: requestId,
                }).set({ req_status: "failed" });
                return res.send({
                    statusCode: 'NC500',
                    message: 'Error',
                });
            }
        })
    },

    gstSubmitCaptcha: async function (req, res, next) {
        const request_id = req.request_id;
        const userName = req.param("userName");
        const captcha = req.param("captcha");
        const password = req.param("password");
        if (!requestId || !captcha || !password || !userName) return res.ok(sails.config.errRes.missingFields);

        const client = await sails.helpers.grpcConnection();
        const data = {
            userName: userName,
            password: password,
            captcha: captcha,
            businessId: request_id
        }
        client.gstCredSubmitCaptcha(data, async (error, result) => {
            if (!error) {
                if (result.statusCode == "NC200") {
                    let clientReq = await ClientRequest.update({
                        request_id: requestId,
                    }).set({ req_status: "completed" }).fetch();

                    await RequestDocument.create({
                        client_id: clientReq[0].client_id,
                        request_id: requestId,
                        response: result.result,
                        request_type: 'GST3B',
                        CIN_GST_PAN_number: result.businessId,
                    });
                } else if (result.statusCode != "NC302") {
                    await ClientRequest.update({
                        request_id: requestId,
                    }).set({ req_status: "failed" });
                }
                return res.send({
                    statusCode: result.statusCode,
                    message: result.message,
                    imageUrl: result.imageUrl,
                });
            } else {
                await ClientRequest.update({
                    request_id: requestId,
                }).set({ req_status: "failed" });
                return res.send({
                    statusCode: 'NC500',
                    message: 'Error',
                });
            }
        })
    },


    /**
     * @api {POST} /gst/generateLink GST-1
     * @apiDescription GST Genrate link
     * @apiName generateLink
     * @apiGroup GST- Consent based
     * @apiExample Example usage:
     * curl -i http://localhost:1337/gst/generateLink
     * @apiHeader {String} authorization
     * @apiParam {String} type  contains gst3b
     * @apiParam {String} gstin
     * @apiSuccess {String} status
     * @apiSuccess {String} statusCode
     * @apiSuccess {String} link
     * @apiError {String} status
     */
    generateLink: async (req, res) => {
        const type = req.param("type");
        const gstNo = req.param("gstin");

        const mandatoryParms = sails.config.mandatoryParams.Gst.generateLink;
        let missingParams = await sails.helpers.getMissingParams(req.allParams(), mandatoryParms);

        if (!type) {
            return res.ok(sails.config.missingParamsResponse(missingParams));
        }

        let link = null;

        const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
        const datetime = await sails.helpers.dateTime();

        if (type == "gst3b") {
            if (!gstNo) return res.ok(sails.config.missingParamsResponse(missingParams));
            link = sails.config.links.gst3b + "?requestId=" + uniqueRandomId + "&gstNo=" + gstNo;
        } else {
            return res.ok({
                status: "nok",
                statusCode: "NC500"
            });
        }
        const expiryDatetime =  (datetime, 'YYYY-MM-DD HH:mm:ss').add(1, 'days').format('YYYY-MM-DD HH:mm:ss').toString();

        await ClientRequest.create({
            request_id: uniqueRandomId,
            req_datetime: datetime,
            // generated_key: req.headers.authorization,
            client_id: req.client_id,
            req_status: "initiate",
            is_active: "active",
            req_type: type.toUpperCase(),
            req_url: link,
            req_url_expiry: expiryDatetime,
            created_at: datetime,
            updated_at: datetime,
        }).fetch();

        return res.ok({
            status: "ok",
            statusCode: "NC200",
            link: link
        });

    },
    /**
     * @api {POST} /gst/generateTaxpayerOtp GST-2
     * @apiDescription GST Genrate Otp
     * @apiName generateTaxpayerOtp
     * @apiGroup GST- Consent based
     * @apiExample Example usage:
     * curl -i http://localhost:1337/gst/generateTaxpayerOtp
     * @apiParam {String} gstin
     * @apiParam {String} username
     * @apiParam {String} requestId
     * @apiSuccess {String} status
     * @apiSuccess {String} statusCode
     * @apiError {String} status
     */
    generateTaxpayerOtp: async (req, res) => {
        const gstin = req.param("gstin");
        const username = req.param("username");
        const requestId = req.param("requestId");
        if (!gstin || !username || !requestId) return res.ok(sails.config.errRes.missingFields);

        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        const url = `${sails.config.quicko.api.gstTaxPayerApi.genrateOtp}/${gstin}/otp?username=${username}`;
        const method = "POST";
        const header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };
        let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);
        if (gstDetails.status != 'nok')
            gstDetails = JSON.parse(gstDetails);

        if ((gstDetails && gstDetails.status == 'nok') || gstDetails.code != 200) {
            await ClientRequest.update({
                request_id: requestId
            }).set({ req_status: "failed" });
            return res.badRequest(gstDetails);
        } else {
            return res.ok({
                status: "ok",
                statusCode: "NC200",
                message: gstDetails.data.message
            });
        }
    },

    /**
      * @api {POST} /gst/verifyTaxpayerOtp GST-3
      * @apiDescription GST Verify Otp
      * @apiName verifyTaxpayerOtp
      * @apiGroup GST- Consent based
      * @apiExample Example usage:
      * curl -i http://localhost:1337/gst/verifyTaxpayerOtp
      * @apiParam {String} gstin
      * @apiParam {String} username
      * @apiParam {String} otp
      * @apiParam {String} requestId
      * @apiSuccess {String} status
      * @apiSuccess {String} statusCode
      * @apiError {String} status
      */
    verifyTaxpayerOtp: async (req, res) => {
        const gstin = req.param("gstin");
        const username = req.param("username");
        const otp = req.param("otp");
        const requestId = req.param("requestId");
        if (!gstin || !otp || !username || !requestId) return res.ok(sails.config.errRes.missingFields);

        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        const url = `${sails.config.quicko.api.gstTaxPayerApi.verifyOtp}/${gstin}/otp/verify?username=${username}&otp=${otp}`;
        const method = "POST";
        const header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };
        let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);
        if (gstDetails.status != "nok")
            gstDetails = JSON.parse(gstDetails);

        if ((gstDetails && gstDetails.status == "nok") || gstDetails.code != 200) {
            await ClientRequest.update({
                request_id: requestId,
            }).set({ req_status: "failed" });
            return res.badRequest(gstDetails);
        }


        if (gstDetails.data["error_code"]) {
            await ClientRequest.update({
                request_id: requestId,
            }).set({ req_status: "failed" });
            return res.badRequest({ status: "nok", messasge: "Invalid OTP or OTP expired" });
        }

        res.ok({
            status: "ok",
            statusCode: "NC200"
        });

        const date = await sails.helpers.dateTime();
        let month = moment(date, 'YYYY-MM-DD HH:mm:ss').month() + 1;
        let year = moment(date, 'YYYY-MM-DD HH:mm:ss').year();

        const jsonConvertedData = [];

        for (let j = 0; j < 2; j++) {
            for (let i = 0; i < 12; i++) {
                if (month == 0) {
                    month = 12;
                    year = year - 1;
                }
                if (month == 3 && i != 0)
                    break

                const url = `${sails.config.quicko.api.gstTaxPayerApi.returns.gst3BSummary}/${gstin}/gstrs/gstr-3b/${year}/${month}`;
                const method = "GET";
                const header = {
                    "Authorization": quickoLogin.access_token,
                    "x-api-key": sails.config.quicko.apiKey,
                    "x-api-version": sails.config.quicko.apiVersion
                };
                let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);
                if (gstDetails.status != "nok")
                    gstDetails = JSON.parse(gstDetails);
                if ((gstDetails && gstDetails.status == "nok") || gstDetails.code != 200) {
                } else {
                    jsonConvertedData.push({
                        data: gstDetails.data,
                        month: month,
                        gstin: gstin,
                        year: year
                    })
                }
                --month;
            }
        }

        if (jsonConvertedData.length == 0) {
            await ClientRequest.update({
                request_id: requestId,
            }).set({ req_status: "failed" });
        } else {
            let clientReq = await ClientRequest.update({
                request_id: requestId,
            }).set({ req_status: "completed" }).fetch();

            await RequestDocument.create({
                client_id: clientReq[0].client_id,
                request_id: requestId,
                response: JSON.stringify(jsonConvertedData),
                request_type: 'GST3B',
                CIN_GST_PAN_number: gstin,
            });
        }
    },

    getGstData: async (req, res) => {
        const type = req.param("type");
        const client_id = req.client_id;
        if (!type) return res.ok(sails.config.errRes.missingFields);

        let result;
        if (type == "gst3b") {
            result = await ClientRequest.find({
                where: {
                    client_id: client_id,
                    req_type: "GST3B",
                    is_active: "active"
                },
                select: ['request_id', 'req_datetime', 'req_url', 'req_url_expiry', 'req_status', 'req_type']
            }).sort('req_datetime DESC')
        } else {
            return res.ok({
                status: "nok",
                statusCode: "NC500"
            });
        }
        return res.ok({
            status: "ok",
            statusCode: "NC200",
            result: JSON.stringify(result)
        });
    },

    getResponceBasedOnRequestId: async (req, res) => {
        const requestId = req.param("requestId");
        const client_id = req.client_id;
        if (!requestId) return res.ok(sails.config.errRes.missingFields);

        let result = await ClientRequest.findOne({
            client_id: client_id,
            request_id: requestId,
            req_type: "GST3B",
            is_active: "active"
        })

        if (result.req_status == "completed") {
            result.gst = await RequestDocument.findOne({
                where: {
                    client_id: client_id,
                    request_id: result.request_id
                },
                select: ['response']
            })
        }


        return res.ok({
            status: "ok",
            statusCode: "NC200",
            result: JSON.stringify(result)
        });
    },

//making this API to bypass the send link step 
//with this the user can directly give the username and the GST number and an OTP will be sent to them
//and the verification of the OTP can take place with the existing API only.
    gstConsentSendOTP:  async(req, res) => {

        const gstNo = req.param("gstin");
        const username = req.param("username");

        if(!gstNo || !username) return res.ok({
            status:"nok",
            statusCode: "400"
        });

        // return res.send({
        //     status: "ok",
        //     message: "OTP Sent"
        // })


        // const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
        // const uniqTimeStamp = Math.round(new Date().getTime());
        // const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);

        // const requestId = uniqueRandomId;
        const gstin = gstNo;

        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        const url = `${sails.config.quicko.api.gstTaxPayerApi.genrateOtp}/${gstin}/otp?username=${username}`;
        const method = "POST";
        const header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };
        let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);
        if (gstDetails.status != 'nok')
            gstDetails = JSON.parse(gstDetails);
        if ((gstDetails.data && gstDetails.data.error) || (gstDetails && gstDetails.status == 'nok') || gstDetails.code != 200) {

            return res.send({
                status: "nok",
                message: "Failed to send OTP! Please check username or try again later!"
            });
        } else {
            return res.send({
                status: "ok",
                statusCode: "NC200",
                message: gstDetails.data.message
            });
        }


    },

    gstConsentVerifyOTP: async(req, res) => {

        try {
            const {gstin, username, otp, loan_id} = req.allParams();
            if (!gstin || !otp || !username) return res.ok(sails.config.errRes.missingFields);
    
            console.log("verify")
    
            let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
            if (!quickoLogin || quickoLogin.status == "nok")
                return res.badRequest(quickoLogin);
            if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);
    
            const url = `${sails.config.quicko.api.gstTaxPayerApi.verifyOtp}/${gstin}/otp/verify?username=${username}&otp=${otp}`;
            const method = "POST";
            const header = {
                "Authorization": quickoLogin.access_token,
                "x-api-key": sails.config.quicko.apiKey,
                "x-api-version": sails.config.quicko.apiVersion
            };
            let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);
            // gstDetails = JSON.parse(gstDetails);
            if (gstDetails && gstDetails.status != "nok")
                gstDetails = JSON.parse(gstDetails);
    
            if ((gstDetails && gstDetails.status == "nok") || gstDetails.code != 200) {
                return res.badRequest(gstDetails);
            }
    
    
            if (!gstDetails || !gstDetails.data || !gstDetails.data.access_token) {
                return res.send({ status: "nok", message: "Invalid OTP or OTP expired" });
            }
    
            // res.ok({
            //     status: "ok",
            //     statusCode: "NC200"
            // });
    
            const date = await sails.helpers.dateTime();
            let month = moment(date, 'YYYY-MM-DD HH:mm:ss').month() + 1;
            let year = moment(date, 'YYYY-MM-DD HH:mm:ss').year();
            year = parseInt(year);
    
            //get the monthly data from the gst json converted data
            const jsonConvertedData = await sails.helpers.getGstJsonConvertedData(gstin, month, year, quickoLogin);
            
            // const jsonConvertedData = jsonData();

            console.log("jsonConvertedData", jsonConvertedData);
    
            if (jsonConvertedData.length == 0) {
                return res.send({
                    status: "nok",
                    message: "Details could not be fetched!"
                });
            }
    
            //else if the data is jsonConvertedData is not empty then we can create a new entry in the database
            
            //getting white_label_id, business_id using loan_id from loanrequest table
            const response = await Loanrequest.findOne({
                id: loan_id
            }).select(["white_label_id", "business_id", "loan_ref_id"]);
            const white_label_id = response['white_label_id'];
            const business_id = response['business_id'];
            const loan_ref_id = response['loan_ref_id'];

 
            //create new entry in database
            await GstMaster.create({
                gst_no: gstin,
                gst_output: JSON.stringify(jsonConvertedData),
                business_id: business_id
            });
        
    
            //convert the data to csv
            const csvData = await sails.helpers.jsonToCsv(jsonConvertedData);
            if(!csvData){
                return console.log("Some Error Occured!");
            }

            //getting userid using business_id from business table
            const {userid} = await Business.findOne({
                id: business_id
            })
    
            //getting s3 location with the help of white_lable_id
            const {s3_name} = await WhiteLabelSolutionRd.findOne({
                id: white_label_id
            });
    
            //generating a unique id for naming our csv file
            let filename = `${loan_ref_id}_${gstin}.csv`;
    
            //s3 upload the document
            let bucket, key, body;
            bucket = s3_name;
            key = `users_${userid}/${filename}`;
            body = csvData;
    
            let s3UploadDoc = await sails.helpers.s3Upload(bucket, key, body);
    
            if (!s3UploadDoc.Location && !s3UploadDoc.s3Upload && !s3UploadDoc.ETag) {
                return res.send({ statusCode: "NC500", message: "Error uploading  statement. Please try again." })
            }
            
            const datetime = await sails.helpers.dateTime();
            
            //save to database loan_document table
            await LoanDocument.create({
                loan: loan_id,
                business_id: business_id,
                user_id: userid,
                doc_name: filename,
                uploaded_doc_name: filename,
                original_doc_name: filename,
                ints: datetime,
                doctype: sails.config.docTypeId.gst3breturns
            });
            return res.send({
                status: "ok",
                message: "Data Uploaded Successfully"
            })
    
    
        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            });
        }

    },
    gstOutputUpdate: async(req, res) => {

        try {
            const {gstin,businessId} = req.allParams();
            const MAX_ATTEMPTS=2;
            if (!gstin || !businessId) return res.ok(sails.config.errRes.missingFields);
            url=sails.config.gstinurl,
            body={
                 gstIn:gstin,
            }
            header={}
            let attempts = 0;
            let apires;
            do{
                attempts++;
                apires = await sails.helpers.axiosApiCall(url, body, header, "POST");
            }
            while(apires.data.resCode !== "SUCCESS" && attempts < MAX_ATTEMPTS)

            console.log("apires:",apires)
           
            updateGSTmasterData = await GstMaster.update({ 
                gst_no:gstin,
                business_id:businessId 
            }).set({
                gst_output:JSON.stringify(apires.data.data)
            }).fetch();
            console.log("updateGSTmasterData",updateGSTmasterData)
            return res.status(apires.status).send({
                status: 'ok',
                resCode: apires.data.resCode,
                message: apires.data.message,
                data:apires.data.data
            })
        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            }); 
        }

    }
}
