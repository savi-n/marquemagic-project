/**
 * VechileController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    vehicleRC: async function (req, res) {
        try {
            let { vehicleNo, isBlackListRequired, loanAssetId } = req.query;
            isBlackListRequired = isBlackListRequired ? isBlackListRequired : false;

            if (!vehicleNo) throw [400, "MISSING_PARAMS"];

            // const token = await sails.helpers.getSignzyToken();

            //checking if the loan_json exists
            if (!loanAssetId || loanAssetId == "") {
                const rc_data = await rcData(vehicleNo, isBlackListRequired);
                const status = rc_data.status;

                return res.ok({
                    status,
                    data: rc_data.data
                })
            }
            else {
                const loan_assets = await LoanAssets.findOne({ id: loanAssetId }).select(["loan_asset_type_id", "loan_json"]);

                if (!loan_assets || !loan_assets.loan_asset_type_id || !loan_assets.loan_json) throw [200, "INVALID_LOAN_ASSET_ID"];

                const { loan_asset_type_id, loan_json } = loan_assets;

                if (loan_asset_type_id != 75 && loan_asset_type_id != 76) throw [200, "INVALID_ASSET_TYPE"];

                const rc_data = await rcData(vehicleNo, isBlackListRequired);

                // save in DB
                if(rc_data.status == "nok") throw [200, "Failed to load response from signzy!"];
                loan_json['rc_verification'] = rc_data.data;

                if (loan_json && loanAssetId) {
                    await LoanAssets.updateOne(
                        { id: loanAssetId },
                        { loan_json }
                    );
                }
            
                return res.send({
                    status: "ok",
                    message: "Data fetched successfully!",
                    data: rc_data.data
                });
        }
        }
        catch (error) {
            const statusCode = error[0] || 400,
            message = error[1] || error.message;
            return res
                .status(statusCode)
                .send({
                    status: "nok",
                    message
                });
        }
    }
};

async function rcData(vehicleNo, isBlackListRequired) {
    let data;
    try {
        const body = {
            "task": "detailedSearch",
            "essentials": {
                "vehicleNumber": vehicleNo,
                "blacklistCheck": isBlackListRequired == "true" ? "true" : "false"
            }
        },
            url = sails.config.signzy.vehicle.url,
            method = 'POST',
            header = {
                'Authorization': sails.config.signzy.vehicle.token,
                'Content-Type': 'application/json'
            };

        data = await sails.helpers.apiTrigger(
            url,
            JSON.stringify(body),
            header,
            method
        );

        data = JSON.parse(data);

        // error handling for signzy response
        if (data.error || !data.result || !data.id || !data.patronId) {

            let status = 400, message = "Failed to load response from signzy!";
            if (data.error) {

                if (data.error.status) status = data.error.status;
                if (data.error.statusCode) status = data.error.statusCode;
                if (data.error.message) message = data.error.message;
            }
            throw [status, message];
        }
    }
    catch (error) {
            message = error[1] || error.message;

        return {status: "nok",data: message};
    }
    return {status: "ok",data};
}
