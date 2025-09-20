/**
 * FtrController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
    instertIntoGenericQueue: async function (req, res) {
        try {
            const loanId = req.param('loanId');

            const {white_label_id, business_id} = await LoanrequestRd
                .findOne({id: loanId})
                .select(["white_label_id", "business_id"]);

            const {s3_name, s3_region, cloud_provider} = await WhiteLabelSolutionRd
                .findOne({id: white_label_id})
                .select(["s3_name", "s3_region", "cloud_provider"]);

            const loanDocumentRecord = await LoanDocumentRd
                .find({loan: loanId})
                .select(["doctype", "doc_name", "user_id"]);

            let cloud;

            try {
                cloud_provider = JSON.parse(cloud_provider);
                cloud = cloud_provider.upload;
            } catch (error) {
                cloud = "aws";
            }

            const msg = [];

            loanDocumentRecord.forEach(doc => {
                const curObj = {
                    loan_id: loanId || "",
                    business_id: business_id || "",
                    doc_id: doc.id || "",
                    doc_type: doc.doctype || "",
                    user_id: doc.user_id || "",
                    doc_name: doc.doc_name || "",
                    s3bucket: s3_name || "",
                    region: s3_region || "",
                    cloud: cloud || "aws",
                    white_label_id: white_label_id || ""
                };
                msg.push(curObj);
            });

            const response = await sails.helpers.insertIntoQ(sails.config.qNames.GENERIC_Q, msg);
            res.send({
                status: "ok",
                statusCode: "NC200",
                message: response
            });
        } catch (error) {
            res.status(500).send({
                status: "nok",
                statusCode: "NC500",
                message: error.message
            });
        }
    }

};
