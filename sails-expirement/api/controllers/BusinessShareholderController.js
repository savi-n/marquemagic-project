/**
 * BusinessShareholderController.js.js
 *
 * @description :: Server-side logic for managing AssetTypeMappingCersai
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	/**
     * @api {POST} /businessShareholder/create create business share holding
     * @apiName create business share holding
     * @apiGroup businessShareholding
     * @apiExample Example usage:
     * curl -i http://localhost:1337/businessShareholder/create
     * {
            shareholderData :{[
                percentage: "",
                businessID: "",
                name: "",
                relationship: "",
                address: "",
                pincode: "",
            ]}
     }
     * @apiParam {Object[]} shareholderData
     * @apiParam {String} shareholderData.percentage
     * @apiParam {String} shareholderData.businessID
     * @apiParam {String} shareholderData.name
     * @apiParam {String} shareholderData.relationship
     * @apiParam {String} shareholderData.address
     * @apiParam {String} shareholderData.pincode
     *
     * @apiSuccess {String} statusCode NC200.
     * @apiSuccess {String} message Success.
     *
     */
	create: async function (req, res, next) {
		let reqData=req.allParams();
		const shareholderData = req.param("shareholderData")|| reqData.data.shareholder_details;
		if (!shareholderData || shareholderData.length === 0) {
			return res.badRequest(sails.config.res.missingFields);
		}
		for (const i in shareholderData) {
			if (!(shareholderData[i].businessID || reqData.business_id)) {
				return res.badRequest(sails.config.res.missingFields);
			}
			const businessShareHolderObject = {
				percentage: shareholderData[i].percentage ? shareholderData[i].percentage : 0,
				businessID: shareholderData[i].businessID || reqData.business_id,
				name: shareholderData[i].name ? shareholderData[i].name : "",
				relationship: shareholderData[i].relationship ? shareholderData[i].relationship : "",
				address: shareholderData[i].address ? shareholderData[i].address : "",
				pincode: shareholderData[i].pincode ? shareholderData[i].pincode : "",
			};
			if (shareholderData[i].id) {
				const businessShareHolderData = await BusinessShareholderRd.findOne({id: shareholderData[i].id});
				if (businessShareHolderData) {
					const updateddateTime = await sails.helpers.dateTime();
					businessShareHolderObject.updatedTime = updateddateTime
					//updation of data in db
					const updateShareHolderData = await BusinessShareholder.update({id: shareholderData[i].id})
						.set(businessShareHolderObject)
						.fetch();
				} else {
					return res.send({
						status: "nok",
						message: "Invalid id"
					});
				}
			} else {
				const createddateTime = await sails.helpers.dateTime();
				businessShareHolderObject.createdTime = businessShareHolderObject.updatedTime = createddateTime
				//insertion of data into db
				const createShareHolderData = await BusinessShareholder.create(businessShareHolderObject).fetch();
				trackData = await sails.helpers.onboardingDataTrack(reqData.loan_id,reqData.business_id,reqData.director_id, req.user.id, reqData.section_id, "");

			}
		}
		return res.send({
			status:'ok',
			statusCode: "NC200",
			message: "Completed Successfully"
		});
	},
	shareholder_fetch: async function (req,res){
		let {business_id} = req.allParams();
		params = {business_id};
		fields = ["business_id"];
		missing = await reqParams.fn(params, fields);
		if (!business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let businessShareDetails = await BusinessShareholderRd.find({businessID: business_id});
		if (businessShareDetails.length > 0) {
			message = sails.config.successRes.fetchBusinessSharehoderData;
			message.data = businessShareDetails;
			return res.ok(message);
		} else {
			return res.ok({status:'ok',
						   message:"No Business Share Holder data found for this business id",
						   data: []
						});
		}
	}
};
