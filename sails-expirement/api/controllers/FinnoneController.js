/**
 * FinnoneController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    fetchStatus: async function (req, res) {
        const {loanId, disbursementId} = req.allParams();

        if (!loanId || !disbursementId) return res.status(404).send({
            status: "nok",
            message: `loanId and disbursementId are mandatory parameters`
        });

        const [statusCode, data] = await sails.helpers.getFinnoneStatus(loanId, disbursementId);

        return res.status(statusCode).send(data);
    },

    triggerProcess: async function (req, res) {

        try {

            const {stage, loanId, disbursementId, modifications} = req.allParams();

            if (!loanId || !disbursementId || !stage) return res.status(404).send({
                status: "nok",
                message: `loanId and disbursementId and stage are mandatory parameters`
            });
            // trigger the process
            const url = `${sails.config.finnone.hostName}/finnone/retrigger`,
                body = JSON.stringify({
                    loan_id: loanId,
                    disbursement_id: disbursementId,
                    stage: stage,
                    modifications
                }),
                method = "POST",
                headers = {
                    "Content-Type": "application/json"
                };

            res.status(200).send({
                status: "ok",
                statusCode: 200,
                message: "Your request has been recorded. Please come after sometime to check the status"
            });


            await sails.helpers.sailstrigger(url, body, headers, method);

        } catch (error) {
            return res.send({
                status: "nok",
                message: "internal error occurred!"
            })
        }

    },

    GetCustomerDetails: async function (req, res) {
        const {customer_id, mobile_no, pan_no} = req.allParams();
        if (!customer_id || !mobile_no || !pan_no) {
            return res.badRequest({
                status: "nok",
                message: "Mandatory fields are missing."
            });
        }
        const url = `${sails.config.url_for_data_fetch}?customer_id=${customer_id}&mobile_no=${mobile_no}&pan_no=${pan_no}`;
        method = "GET";
        resData = await sails.helpers.sailstrigger(url, "", {}, method);
        return res.ok(resData);

    }

};
