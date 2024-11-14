/**
 * PanController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {

    verifyPan: async function (req, res, next) {

        const pan = req.param("pan");
        const consent = req.param("consent");
        const reason = req.param("reason");
        if (!pan || !consent || !reason) return res.ok(sails.config.errRes.missingFields);

        if (consent.toUpperCase() != 'Y') {
            return res.ok(sails.config.errRes.missingFields);
        }
        // const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
        // const uniqTimeStamp = Math.round(new Date().getTime());
        // const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
        // const datetime = await sails.helpers.dateTime();

        // await ClientRequest.create({
        //     request_id: uniqueRandomId,
        //     req_datetime: datetime,
        //     // generated_key: req.headers.authorization,
        //     client_id: req.client_id,
        //     req_status: "initiate",
        //     is_active: "active",
        //     req_type: "GST3B",
        //     created_at: datetime,
        //     updated_at: datetime,
        // }).fetch();

        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        const url = `${sails.config.quicko.api.pan.verifyPan}/${pan}/verify?consent=${consent}&reason=${reason}`;
        const method = "GET";
        const header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };
        let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);
        if (gstDetails == null) {
            return res.ok({
                status: "ok",
                statusCode: 200,
                requestId: uniqueRandomId,
                data: JSON.parse(gstDetails),
            });
        } else {
            // await ClientRequest.update({
            //     request_id: uniqueRandomId
            // }).set({ req_status: "failed" });
            return res.badRequest(gstDetails);
        }
    },

    /**
 * @apiDescription This API returns ckyc data
 ** @api {POST} /panToGst Pan to GST
    * @apiName Pan to GST
    * @apiGroup PAN to GST
    *
    *  @apiParam  {String} pan
    *
    * @apiExample {js} Sample Request:
    *  {
    *   "pan": "AAACS8577K",
    *  }

    * @apiHeader  {String} authorization Authorization token.

 *
 */

    panToGst: async function (req, res, next) {
        // Get the pan number
        const pan = req.param('pan');

        // If parameters missing return error message
        if (!pan) return res.status(400).
            send({ status: 'nok', stateCode: 'NC400', resCode: 'MISSING-PARAMS', message: 'Required parameters missing. pan required' });

        const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
        const datetime = await sails.helpers.dateTime();

        await ClientRequest.create({
            request_id: uniqueRandomId,
            req_datetime: datetime,
            client_id: req.client_id,
            req_status: "initiate",
            is_active: "active",
            req_type: "PAN",
            created_at: datetime,
            updated_at: datetime,
        });

        let states = sails.config.stateCodes;

        // Quicko Login
        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
        if (!quickoLogin || quickoLogin.status == "nok")
            return res.badRequest(quickoLogin);
        if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

        let gstDetails = [], apiResonse;

        {
            details = await sails.helpers.apiTrigger(
                "https://5pfcrt7lb2.execute-api.ap-southeast-1.amazonaws.com/crawl/panToGst",
                JSON.stringify({ "pan": pan }),
                { "content-type": "application/json" },
                "POST");


            apiResonse = details;
            console.log(typeof apiResonse);

            details = JSON.parse(details);
            details = details.data;

            if (Array.isArray(details)) {
                for (detail of details) {
                    gstDetails.push({
                        gstin: detail.gstIn,
                        state_name: detail.state,
                        data: {
                            sts: detail.status
                        }
                    })
                }
            }


            //return res.send({ gstDetails })
        }

        // Call the quicko api
        const method = "GET";
        const header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };

        if (0 && !gstDetails.length) {
            for (state of states) {
                const url = `${sails.config.quicko.api.pan.panToGst}/${pan}?state_code=${state.state_code}`;
                let details = await sails.helpers.apiTrigger(url, "", header, method);
                details = JSON.parse(details);
                if (details.data && details.data[0]) {
                    let dataArr = details.data;
                    for (elm of dataArr) {
                        elm.state_code = state.state_code;
                        gstDetails.push(elm);
                    }
                }
            }
        }


        let response = {
            status: 'ok',
            statusCode: 'NC200',
            resCode: 'OK',
            gstData: gstDetails || "",
            apiResonse: apiResonse || ""
        };

        if(!gstDetails.length){
            response.statusCode = 'nok',
            response.statusCode = 'NC500',
            response.message = "unable to fetch gst data. please try again"
        }

        if (gstDetails && gstDetails.status === 'nok') {
            gstDetails = JSON.parse(gstDetails.result);
            response.status = response.resCode = 'nok', response.statusCode = `NC${gstDetails.code}`,
                response.data = gstDetails.data || { message: gstDetails.message }
            if (gstDetails.code === 422) response.resCode = 'INVALID-PATTERN'
            res.status(gstDetails.code || 200).send(response);
            return await ClientRequest.update({
                request_id: uniqueRandomId
            }).set({ req_status: "failed" });
        } else {
            response.data = gstDetails;// ||JSON.parse(gstDetails).data;
            for (i in response.data) {
                gstMasterData = await GstMaster.find({ gst_no: response.data[i].gstin });
                if (1 || gstMasterData.length === 0) {
                    gstMasterDataCreate = await GstMaster.create({ gst_no: response.data[i].gstin, business_id: 0 }).fetch();
                    console.log("----------------------------------", gstMasterDataCreate);
                }

                for (j in states) {
                    if (response.data[i].state_code === states[j].state_code) {
                        response.data[i].state_name = states[j].state_name
                    }
                }
            }
            let status = 200;
            if (response.data.error_code) {
                response.status = 'nok', response.statusCode = 'NC400', response.resCode = 'INVALID-PAN', status = 400
            }
            // await ClientRequest.update({
            //     request_id: uniqueRandomId
            // }).set({ req_status: "failed" });
            if (response.data && response.data.length === 0) {
                response.status = "nok";
                response.resCode = "NOK";
                response.message = "No GSTIN found!"
            }
            res.status(status).send(response);
            return await ClientRequest.update({
                request_id: uniqueRandomId
            }).set({ req_status: status === 200 ? "completed" : "failed" });

        }
    }
}
