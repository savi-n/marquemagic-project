/**
 * PincodeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const url = 'http://api.namastecredit.com/Salesreport/getCityStateByPincode?keyword=';

module.exports = {
/**
 * @apiDescription This API returns ckyc data
 ** @api {GET} /pincode Pincode API
    * @apiName Pincode API
    * @apiGroup Pincode API
    *
    *  @apiParam  {String} pincode
    *
    * @apiExample {js} Sample Request:
    *  {
    *   "pincode": "711405",
    *  }

    * @apiHeader  {String} authorization Authorization token.

 *
 */
    
    pincode: async function (req, res) {
        let pincode = req.param("pincode");
        let queryStringedUrl = url + pincode;

        let apiRes = await sails.helpers.apiTrigger(
            queryStringedUrl,
            "",
            {},
            "GET"
        );
        res.send(JSON.parse(apiRes));
    }

};

