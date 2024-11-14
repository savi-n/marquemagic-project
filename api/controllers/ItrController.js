/**
 * ItrController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require("moment");

module.exports = {

    itrGetCaptcha: async function (req, res, next) {
        const request_id = req.request_id;
        const client = await sails.helpers.grpcConnection();
        const data = {
            "request_id": request_id
        }
        client.itrGetCaptcha(data, async (error, result) => {
            if (!error) {
                return res.send(result);
            } else {
                console.error(error);
                return res.send({
                    statusCode: 'NC500',
                    message: 'Error',
                });
            }
        })
    },

    itrSubmitCaptcha: async function (req, res, next) {
        const request_id = req.request_id;
        const body = req.body;
        if (!body.userName || !body.ackNumber || !body.captcha) {
            return res.send({
                statusCode: 'NC500',
                message: 'Mandatory fields are missing.'
            });
        }

        let userName = await sails.helpers.payloadDecryption(body.userName.toString("base64"), req.private_key);
        if (userName == "error") {
            return res.status(401).json({ statusCode: "NC500", message: 'Invalid Encryoted data' });
        }
        let password = await sails.helpers.payloadDecryption(body.password.toString("base64"), req.private_key);
        if (password == "error") {
            return res.status(401).json({ statusCode: "NC500", message: 'Invalid Encryoted data' });
        }

        const client = await sails.helpers.grpcConnection();
        const data = {
            "request_id": request_id,
            "userName": userName,
            "password": password,
            "captcha": body.captcha
        }
        client.itrSubmitCaptcha(data, async (error, result) => {
            if (!error) {
                return res.send(result);
            } else {
                console.error(error);
                return res.send({
                    statusCode: 'NC500',
                    message: 'Error',
                });
            }
        })
    },

    itrSubmitFilings: async function (req, res, next) {
        const request_id = req.request_id;
        const body = req.body;
        if (!body.ackNumber || !body.filingDate || !body.form) {
            return res.send({
                statusCode: 'NC500',
                message: 'Mandatory fields are missing.'
            });
        }

        const client = await sails.helpers.grpcConnection();
        const data = {
            "request_id": request_id,
            "ackNumber": body.ackNumber,
            "filingDate": body.filingDate,
            "form": body.form
        }
        client.itrSubmitFilings(data, async (error, result) => {
            if (!error) {
                return res.send(result);
            } else {
                console.error(error);
                return res.send({
                    statusCode: 'NC500',
                    message: 'Error',
                });
            }
        })
    },

    addClient: async function (req, res, next) {
        const requestId = req.request_id;
        const pan = req.param("pan");
        const dob = req.param("dob");
        if (!pan || !dob) return res.ok(sails.config.errRes.missingFields);

        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);

        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        const url = `${sails.config.quicko.api.itr.addClient}?pan=${pan}&dob=${dob}`;
        const method = "GET";
        const header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };

        let clientRes = await sails.helpers.apiTrigger(url, "", header, method);
        if (clientRes && clientRes.status == 'nok') {
            if (clientRes.result) {
                let result = JSON.parse(clientRes.result);
                let data = {
                    status: 'nok',
                    statusCode: "NC400",
                    result: result,
                    message: 'Client already exist.'
                }
                return res.badRequest(data);
            }
            let data = {
                result: JSON.parse(clientRes),
                message: 'Error'
            }
            return res.badRequest(data);
        }

        else {
            await ClientRequest.update({
                request_id: requestId,
            }).set({ req_status: "inprogress" });

            let parseData = JSON.parse(clientRes);
            return res.send({
                status: 'OK',
                statusCode: "NC200",
                transaction_id: parseData.data.transaction_id,
                info: parseData
            });
        }
    },

    verifyOTPandGetItrDetails: async function (req, res, next) {
        const requestId = req.request_id;
        const req_type = req.param("req_type");
        const transaction_id = req.param("transaction_id");
        const email_otp = req.param("email_otp");
        const pan = req.param("pan");
        const mobile_otp = req.param("mobile_otp");
        const pan_exist = req.param("pan_exist");

        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);

        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        if ((pan_exist && pan_exist != 'true') || !pan_exist) {

            if (!transaction_id || !email_otp || !mobile_otp) return res.ok(sails.config.errRes.missingFields);

            const verify_url = `${sails.config.quicko.api.itr.addClient}?pan=${pan}&transaction_id=${transaction_id}&email_otp=${email_otp}&mobile_otp=${mobile_otp}`;
            method = "POST";
            const verify_header = {
                "Authorization": quickoLogin.access_token,
                "x-api-key": sails.config.quicko.apiKey,
                "x-api-version": sails.config.quicko.apiVersion
            };

            let verifyRes = await sails.helpers.apiTrigger(verify_url, "", verify_header, method);
            if (verifyRes && verifyRes.status == 'nok')
                return res.badRequest(verifyRes);

        }

        const date = await sails.helpers.dateTime();
        let assessment_year = moment(date, 'YYYY-MM-DD HH:mm:ss').year();

        const jsonConvertedData = [];
        let url1 = "";
        let url2 = "";

        if (req_type == 'itr') {
            url1 = `${sails.config.quicko.api.itr.itrAPI}${pan}/itrs/${assessment_year}/itr`;
        } else if (req_type == 'itr-v') {
            url1 = `${sails.config.quicko.api.itr.itrAPI}${pan}/itrs/${assessment_year}/itr-v`;
        } else if (req_type == 'form-26as') {
            url1 = `${sails.config.quicko.api.itr.itrAPI}${pan}/itrs/${assessment_year}/form-26as`;
        } else {
            return res.send({ message: 'req_type should be itr, itr-v or form-26as only' });
        }

        for (let i = 0; i < 2; i++) {

            /************************* FetchITR Request ***************************/
            let header1, header2;
            if (!assessment_year || !pan) return res.ok(sails.config.errRes.missingFields);

            method = "POST";
            if (req_type == 'itr' || req_type == 'itr-v') {
                header1 = {
                    "accept": "application/json",  //other options : application/xml, application/pdf
                    "Authorization": quickoLogin.access_token,
                    "x-api-key": sails.config.quicko.apiKey,
                    "x-api-version": sails.config.quicko.apiVersion
                };
            } else {  // req_type = form-26as
                header1 = {
                    "Authorization": quickoLogin.access_token,
                    "x-api-key": sails.config.quicko.apiKey,
                    "x-api-version": sails.config.quicko.apiVersion
                };
            }

            let fetchRes = await sails.helpers.apiTrigger(url1, "", header1, method);
            if (fetchRes && fetchRes.status == 'nok')
                return res.badRequest(fetchRes);

            let parseData = JSON.parse(fetchRes);
            let job_id;
            if (req_type == 'form-26as') {
                job_id = parseData.transaction_id;
            } else {
                job_id = parseData.job.job_id;
            }

            /************************* GetITR Details ***************************/
            if (!job_id) return res.ok(sails.config.errRes.missingFields);

            if (req_type == 'itr') {
                url2 = `${sails.config.quicko.api.itr.itrAPI}${pan}/itrs/${assessment_year}/itr?job_id=${job_id}`;
            } else if (req_type == 'itr-v') {
                url2 = `${sails.config.quicko.api.itr.itrAPI}${pan}/itrs/${assessment_year}/itr-v?job_id=${job_id}`;
            } else {
                url2 = `${sails.config.quicko.api.itr.itrAPI}${pan}/itrs/${assessment_year}/form-26as?transaction_id=${job_id}`;
            }

            method = "GET";
            if (req_type == 'itr' || req_type == 'form-26as') {
                header2 = {
                    "Authorization": quickoLogin.access_token,
                    "x-api-key": sails.config.quicko.apiKey,
                    "x-api-version": sails.config.quicko.apiVersion
                };
            } else {  // req_type = itr-v
                header2 = {
                    "accept": "application/json",  //other options : application/pdf
                    "Authorization": quickoLogin.access_token,
                    "x-api-key": sails.config.quicko.apiKey,
                    "x-api-version": sails.config.quicko.apiVersion
                };
            }

            let itrDetails = await sails.helpers.apiTrigger(url2, "", header2, method);
            if (itrDetails && itrDetails.status == 'nok') {
            } else {
                jsonConvertedData.push({
                    year: assessment_year,
                    job_id: job_id,
                    data: JSON.parse(itrDetails),
                });
            }

            assessment_year = assessment_year - 1;
        }

        if (jsonConvertedData.length == 0) {
            return res.send({
                status: 'OK',
                message: 'No ITR Details found'
            });
        } else {
            let clientReq = await ClientRequest.update({
                request_id: requestId,
            }).set({ req_status: "completed" }).fetch();

            await RequestDocument.create({
                client_id: clientReq[0].client_id,
                request_id: requestId,
                // req_path: url,
                // req_filename: `${requestId}_bank_statement.csv`,
                // request_type: 'BANK_CUB',
                CIN_GST_PAN_number: pan
            });

            return res.send({
                status: 'OK',
                response_data: jsonConvertedData
            });
        }
    },

    readForm16: async function (req, res, next) {
        const requestId = req.request_id;
        const email = req.param("email");
        const password = req.param("password");
        if (!email) return res.ok(sails.config.errRes.missingFields);

        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);

        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        const url = `${sails.config.quicko.api.itr.readForm16Api}?email=${email}&password=${password}`;
        const method = "POST";
        const header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };

        let clientRes = await sails.helpers.apiTrigger(url, "", header, method);
        if (clientRes && clientRes.status == 'nok') {
            let data = {
                result: JSON.parse(clientRes),
                message: 'Error'
            }
            return res.badRequest(data);
        }

        else {
            let clientReq = await ClientRequest.update({
                request_id: requestId,
            }).set({ req_status: "completed" }).fetch();

            await RequestDocument.create({
                client_id: clientReq[0].client_id,
                request_id: requestId,
                // req_path: url,
                // req_filename: `${requestId}_bank_statement.csv`,
                // request_type: 'BANK_CUB',
                CIN_GST_PAN_number: pan
            });

            let parseData = JSON.parse(clientRes);
            return res.send({
                status: 'OK',
                statusCode: "NC200",
                info: parseData
            });
        }
    },

}