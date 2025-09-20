/**
 * IMDController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    imdDetails: async function (req, res) {

        const {loan_id} = req.allParams();

        const data = await IMDDetailsRd.findOne({
            loan_id: loan_id
        });

        return res.send({
            status: "ok",
            message: "IMD details fetched successfully",
            data
        })

    }

};
