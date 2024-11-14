/**
 * EpfoController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const url = "https://craweller.namastecredit.com/api/epfo"

module.exports = {
/**
 * @apiDescription This API returns ckyc data
 ** @api {GET} /epfo/getCaptcha EPFO get captcha
    * @apiName EPFO get captcha
    * @apiGroup EPFO
    *
    *  @apiParam  {String} epfoName
    *
    * @apiExample {js} Sample Request:
    *  {
    *   "epfoName": "JIOSMART PRIVATE LIMITED",
    *  }

    * @apiHeader  {String} authorization Authorization token.

 *
 */
    getCaptcha: async function (req, res) {
        let epfoName = req.param("epfoName");
        let queryStringedUrl = url + `?epfoName=${epfoName}`;
        let apiRes = await sails.helpers.apiTrigger(
            queryStringedUrl,
            "",
            {},
            "GET"
        );
        res.send(JSON.parse(apiRes));
    },

       /**
 * @apiDescription This API returns ckyc data
 ** @api {GET} /epfo/submitCaptcha Epfo submit captcha
    * @apiName Epfo submit captcha
    * @apiGroup EPFO
    *
    *  @apiParam  {String} epfoName
    *  @apiParam  {String} captcha
    * @apiExample {js} Sample Request:
    *  {
    *   "epfoName": "JIOSMART PRIVATE LIMITED",
    *   "captcha": "P2U45"
    *  }

    * @apiHeader  {String} authorization Authorization token.

 *
 */
    submitCaptcha: async function (req, res) {
        let epfoName = req.param("epfoName");
        let captcha = req.param("captcha");
        let queryStringedUrl = url + `/submit?epfoName=${epfoName}&captcha=${captcha}`;
        let apiRes = await sails.helpers.apiTrigger(
            queryStringedUrl,
            "",
            {},
            "GET"
        );
        res.send(JSON.parse(apiRes));
    }

};

