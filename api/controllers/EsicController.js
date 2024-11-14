/**
 * EsicController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const url = "https://craweller.namastecredit.com/api/esic"
module.exports = {
/**
 * @apiDescription This API returns ckyc data
 ** @api {GET} /esic/getCaptcha ESIC get captcha
    * @apiName ESIC get captcha
    * @apiGroup ESIC
    *
    *  @apiParam  {String} esicName
    *
    * @apiExample {js} Sample Request:
    *  {
    *   "esicName": "Tata Capital Housing Finance Limited",
    *  }

    * @apiHeader  {String} authorization Authorization token.

 *
 */
    
    getCaptcha: async function (req, res) {
        let esicName = req.param("esicName");
        let queryStringedUrl = url + `?esicName=${esicName}`;
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
 ** @api {GET} /esic/getDistrict ESIC get district
    * @apiName ESIC get district
    * @apiGroup ESIC
    *
    *  @apiParam  {String} esicName
    *  @apiParam  {String} stateCode
    *
    * @apiExample {js} Sample Request:
    *  {
    *   "esicName": "Tata Capital Housing Finance Limited",
    *   "stateCode": "21"
    *  }

    * @apiHeader  {String} authorization Authorization token.

 *
 */
 
    getDistrict: async function (req, res) {
        let esicName = req.param("esicName");
        let stateCode = req.param("stateCode");
        let queryStringedUrl = url + `/getDistrict?esicName=${esicName}&state=${stateCode}`;
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
 ** @api {GET} /esic/submitCaptcha ESIC submit captcha
    * @apiName ESIC submitCaptcha
    * @apiGroup ESIC
    *
    *  @apiParam  {String} esicName
    *  @apiParam  {String} captcha
    *  @apiParam  {String} districtCode
    *  @apiParam  {String} stateCode
    *
    * @apiExample {js} Sample Request:
    *  {
    *   "esicName": "Tata Capital Housing Finance Limited",
    *   "captcha": "HOIUY",
    *   "districtCode": "460",
    *   "stateCode": "21"
    *  }

    * @apiHeader  {String} authorization Authorization token.

 *
 */
 
    submitCaptcha: async function (req, res) {
        let esicName = req.param("esicName");
        let stateCode = req.param("stateCode");
        let districtCode = req.param("districtCode");
        let captcha = req.param("captcha");
        let queryStringedUrl = url + `/submitCaptcha?esicName=${esicName}&captcha=${captcha}&district=${districtCode}&state=${stateCode}`;
        let apiRes = await sails.helpers.apiTrigger(
            queryStringedUrl,
            "",
            {},
            "GET"
        );
        res.send(JSON.parse(apiRes));
    }

};

