const path = require("path");
var request = require("request");
const { decryptReq, encryptRes } = require("../services/encrypt");

module.exports = {
    request_list: async function (req, res) {
        let email = req.param("email");
        let req_type = req.param("req_type");
        let req_data = [];
        if (!req_type || !email) {
            const mandatoryParms = sails.config.mandatoryParams.ClientRequest.request_list;
            let missingParams = await sails.helpers.getMissingParams(req.allParams(), mandatoryParms);
            return res.ok(sails.config.missingParamsResponse(missingParams));
        }

        let clientData = await Clients.find({ email, is_active: "active" }).limit(1);
        if (!clientData || clientData.length == 0) {
            sails.config.errRes.missingFields.message = "Email does not exist";
            return res.ok(sails.config.errRes.missingFields);
        }
        let clientReq = await ClientRequest.find({ client_id: clientData[0].client_id, req_type: req_type, is_active: "active" });
        if (clientReq.length == 0) {
            sails.config.errRes.noData.data = [];
            return res.ok(sails.config.errRes.noData);
        }
        await Promise.all(clientReq.map(async (element) => {
            let reqObj = {};
            reqObj = _.pick(element, "request_id", "client_id", "req_datetime", "req_status", "req_type", "is_active", "created_at");
            await RequestDocument.find({ client_id: element.client_id, request_id: element.request_id }).then((res) => {
                if (res && res.length > 0) {
                    reqObj.rocGstData = res;
                } else {
                    reqObj.rocGstData = [];
                } req_data.push(reqObj);
            });
        }));
        sails.config.successRes.reqList.data = req_data;
        return res.ok(sails.config.successRes.reqList);
    },

    uploadToSailsExp: async function (req, res, next) {
        //const reqBody = decryptReq(req.param("data"));
        const reqBody = decryptReq(req.param("data")) ? decryptReq(req.param("data")) : req.allParams();

        let access_token = reqBody.access_token;
        let loan_id = reqBody.loan_id;
        let bankId = reqBody.bankId;
        let accountNo = reqBody.accountNo;
        let director_id = reqBody.directorId;
        let req_id = reqBody.request_id;
        let user_id = reqBody.user_id;
        const loanRequestData = await Loanrequest.findOne({ id: loan_id }).populate('business_id');
        businessType = loanRequestData.business_id.businesstype;

        if (!req_id || !access_token || !director_id || !bankId || !accountNo)
            return res.ok(sails.config.errRes.missingFields);
        let responseBody = [];
        for (let i = 0; i < req_id.length; i++) {
            let response = null;
            user_id = user_id || "";
            response = await sails.helpers.sailsExpUpload(access_token, loan_id, req_id[i].toString(), director_id, bankId, accountNo, user_id, businessType);
            let requestId_res = {
                request_id: req_id[i],
                result: response.result
            };
            responseBody.push(requestId_res);
        }
        return res.send({ statusCode: "NC200", data: encryptRes({ response: responseBody }) });
    }
};
