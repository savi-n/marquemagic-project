/**
 * CompanyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    companyData: async function (req, res) {
        const cin = req.param('cin');
        let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);

        if (!quickoLogin || quickoLogin.status == "nok") {
            quickoLogin.message = 'Unable to fetch ROC data from source. Please try again.';
            return res.badRequest(quickoLogin);
        }

        if (!quickoLogin || !quickoLogin.access_token) {
            quickoLogin.message = 'Unable to fetch ROC data from source. Please try again.';
            return res.badRequest(quickoLogin);
        }

        let consent = 'Y';
        let reason = 'Loan Processing';
        url = `${sails.config.quicko.api.rocApi.rocCompanyApi}/${cin}?consent=${consent}&reason=${reason}`;
        let header = {
            "Authorization": quickoLogin.access_token,
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-version": sails.config.quicko.apiVersion
        };
        method = 'GET';
        let quickCin = await sails.helpers.apiTrigger(url, '', header, method);

        return res.send({
            status: 'ok',
            message: 'data fetched successfully!',
            data: quickCin
        })
    }

};

