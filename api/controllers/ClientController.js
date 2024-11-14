/**
 * ClientController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require("moment");
let crypto = require("crypto");
const { request } = require("http");

module.exports = {
    createClient: async function (req, res, next) {

        const datetime = await sails.helpers.dateTime();
        const randomTwoUnique = Math.floor(Math.random() * (+ 9999 - + 1000)) + + 1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);

        const body = req.body;
        const data = {
            "client_name": body.client_name,
            "client_id": uniqueRandomId
        }
        const token = await sails.helpers.jwtToken('sign', data);

        data.client_logo = body.client_logo;
        data.created_at = datetime;
        data.update_at = datetime;
        data.secret_key = token;
        data.password = body.password;
        data.email = body.email;
        data.white_label_id = body.white_label_id;

        const result = await Clients.create(data).fetch();
        return res.send({ "statusCode": "NC200", "client_id": result.client_id, "secret_key": result.secret_key });
    },

    generateLink: async function (req, res, next) {

        let reqType = req.param("type");
        let linkRequired = req.param("linkRequired");
        let isEncryption = req.param("isEncryption");

        if (!reqType) {
            const mandatoryParms = sails.config.mandatoryParams.client.generateLink;
            let missingParams = await sails.helpers.getMissingParams(req.allParams(), mandatoryParms);
            return res.ok(sails.config.missingParamsResponse(missingParams));
        };

        reqType = reqType.toUpperCase().toString().trim();
        let link = null;

        const datetime = await sails.helpers.dateTime();
        const randomTwoUnique = Math.floor(Math.random() * (+ 9999 - + 1000)) + + 1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
        const expiryDatetime = moment(datetime, 'YYYY-MM-DD HH:mm:ss').add(1, 'days').format('YYYY-MM-DD HH:mm:ss').toString();

        const data = {
            request_id: uniqueRandomId,
            req_datetime: datetime,
            client_id: req.client_id,
            req_status: 'initiate',
            is_active: 'active',
            req_type: reqType,
            flag: '0',
            req_url_expiry: expiryDatetime,
            created_at: datetime,
            updated_at: datetime
        }

        if (isEncryption == 'true') {
            // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 1024,
            //     publicKeyEncoding: {
            //         type: 'spki',
            //         format: 'pem'
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs8',
            //         format: 'pem'
            //     }
            // });
            // const url = sails.config.grpcUrl.bankUrl + "/" + reqType + "?id=" + token;
            // data.req_url = url;
            // data.public_key = publicKey;sy;
        }

        const sighData = {
            "request_id": uniqueRandomId,
            "req_url_expiry": expiryDatetime,
            "req_type": reqType
        }
        const token = await sails.helpers.jwtToken('sign', sighData);
        data.generated_key = token;

        if (linkRequired == 'true') {
            if (reqType == "GST3B") {
                if (!gstNo) return res.ok(sails.config.errRes.missingFields);
                link = sails.config.links.gst3b + "?requestId=" + uniqueRandomId + "&gstNo=" + gstNo;
            } else {
                return res.ok({
                    status: "nok",
                    statusCode: "NC500"
                });
            }
            data.req_url = link;
        }

        await ClientRequest.create(data);
        return res.send({
            "statusCode": "NC200",
            "generated_key": token,
            "request_id": uniqueRandomId,
            "req_url": data.req_url,
            "req_url_expiry": data.req_url_expiry,
            "req_status": data.req_status
        });
    },

    getDocuments: async function (req, res, next) {
        if (!req.headers && !req.headers.generated_key) {
            return res.status(401).json({ statusCode: "NC500", message: 'Invalid header' });
        }
        const data = await sails.helpers.jwtToken('verify', req.headers.generated_key);
        if (data == 'error') {
            return res.status(401).json({ statusCode: "NC500", message: 'Invalid Authorization header' });
        }

        const request_id = data.request_id;
        const clientReq = await ClientRequest.find({ request_id: request_id, is_active: 'active' });
        if (clientReq.length == 0) {
            return res.status(401).json({ statusCode: "NC500", message: 'Invalid Request Id' });
        }

        if (clientReq[0].req_status == 'initiate' || clientReq[0].req_status == 'inprogress' || clientReq[0].req_status == 'expired') {

            let status = clientReq[0].req_status;
            const date = moment().diff(clientReq[0].req_url_expiry, 'minutes');

            if (date > 0 && clientReq[0].req_status != 'expired') {
                status = 'expired';
                await ClientRequest.updateOne({ request_id: request_id }).set({ req_status: 'expired' });
            }

            return res.send({
                "statusCode": "NC300",
                // "request_id": clientReq[0].request_id,
                "generated_key": clientReq[0].generated_key,
                "req_url": clientReq[0].req_url,
                "req_url_expiry": clientReq[0].req_url_expiry,
                "req_status": status
            });
        }

        const clientDocument = await RequestDocument.find({ request_id: request_id, is_active: 'active' });

        // clientDocument[0].req_path.toString("base64")
        // let encryptedUrl = await sails.helpers.payloadEncryption(clientDocument[0].req_path.toString("base64"), clientReq[0].private_key);

        return res.send({ "statusCode": "NC200", "req_path": clientDocument[0].req_path, "req_filename": clientDocument[0].req_filename, "req_type": clientDocument[0].req_type })
    },

    sailsClientVerify: async function (req, res) {
        let { email, white_label_id } = req.allParams();
        if (!email || !white_label_id) {
            const mandatoryParms = sails.config.mandatoryParams.client.sailsClientVerify;
            let missingParams = await sails.helpers.getMissingParams(req.allParams(), mandatoryParms);
            return res.ok(sails.config.missingParamsResponse(missingParams));
        }
        let data, url, method, header, body, parseData;
        let clientData = await Clients.find({
            email,
            white_label_id,
            is_active: "active",
        });
        if (!clientData || clientData.length == 0) {
            let clientName = email.split("@")[0];
            url = sails.config.api.createClient;
            method = "POST";
            header = { "Content-Type": "application/json" };
            body = { client_name: clientName, password: `${clientName}@123`, email, white_label_id };
            let clientCreate = await sails.helpers.apiTrigger(url, JSON.stringify(body), header, method);
            if (clientCreate) {
                parseData = JSON.parse(clientCreate);
                data = parseData.secret_key;
            } else {
                data = clientCreate;
            }
        } else {
            url = sails.config.api.clientLogin;
            method = "POST";
            header = { "Content-Type": "application/json" };
            body = { client_id: clientData[0].client_id, password: clientData[0].password };
            let clientLogin = await sails.helpers.apiTrigger(url, JSON.stringify(body), header, method);
            if (clientLogin) {
                parseData = JSON.parse(clientLogin);
                data = parseData.accessToken;
            } else {
                data = clientLogin;
            }
        }
        if (data) {
            sails.config.successRes.verify.token = data;
            return res.ok(sails.config.successRes.verify);
        }
    },
}
