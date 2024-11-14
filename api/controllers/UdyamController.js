/**
 * UdyamController
 *
 * @apiDescription :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    udyamGetCaptcha: async (req, res) => {
        let udyamName = req.param("udyamName");

        if (!udyamName)
            return res.ok(sails.config.errRes.missingFields);



        const randomTwoUnique = Math.floor(Math.random() * (+ 9999 - + 1000)) + + 1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
        const datetime = await sails.helpers.dateTime();

        await sails.helpers.clientRequestRecord('create', uniqueRandomId, req.client_id, 'initiate', "KYC", "UDYAM");

        const data = {
            "gstIn": udyamName
            // "businessId": uniqueRandomId
        }
        const client = await sails.helpers.grpcConnection();
        client.udyamGetCaptcha(data, async (error, result) => {
            if (!error) {
                if (result.statusCode == "NC500") {
                    await ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: "failed" });
                }
                return res.send({
                    statusCode: result.statusCode,
                    message: result.message,
                    imageUrl: result.imageUrl,
                    requestId: uniqueRandomId,
                    businessId: result.businessId
                });
            } else {
                await ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: "failed" });
                return res.send({ statusCode: 'NC500', message: 'Error' });
            }
        });

    },

    udyamSubmitCaptcha: async (req, res) => {
        let udyamName = req.param("udyamName");
        const requestId = req.param("requestId");
        const captcha = req.param("captcha");

        if (!udyamName || !captcha || !requestId)
            return res.ok(sails.config.errRes.missingFields);



        const data = {
            "gstIn": udyamName,
            "captcha": captcha
        }
        const client = await sails.helpers.grpcConnection();
        let resData = null;
        client.udyamSubmitCaptcha(data, async (error, result) => {
            if (!error) {
                if (result.statusCode == "NC200" || result.statusCode == "NC201") {
                    let clientReq = await ClientRequest.update({ request_id: requestId }).set({ req_status: "completed" }).fetch();
                    resData = {
                        "statusCode": result.statusCode,
                        "message": result.message,
                        "result": JSON.parse(result.result)
                    }
                } else if (result.statusCode == "NC302" || result.statusCode == "NC500") {
                    resData = {
                        "statusCode": result.statusCode,
                        "message": result.message,
                        "gstIn": udyamName,
                        "imageUrl": result.imageUrl
                    }

                    await ClientRequest.update({ request_id: requestId }).set({ req_status: "failed" });
                }
                return res.send(resData);
            } else {
                await ClientRequest.update({ request_id: requestId }).set({ req_status: "failed" });
                return res.send({ statusCode: 'NC500', message: 'Error' });
            }
        });
    },

    udyamCallback: async (req, res) => {
        const data = req.param('data');
        const requestId = req.param('request_id');
        try {
            if (requestId && data) await RequestDocument.updateOne({
                request_id: requestId
            }).set({
                response: JSON.stringify(data)
            });

            res.send({
                status: "ok",
                data: "data updated"
            })

        } catch (err) {
            res.send({
                status: "nok",
                message: err.message
            })
        }
    }
};
