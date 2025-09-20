/**
 * PowerOfAtorneyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	power_of_atorney: async function (req, res) {
		const {data: reqData, loan_id, section_id, business_id, white_label_id} = req.allParams();
		params = {loan_id};
		fields = ["loan_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (reqData.poa_details.length === 0 || Object.values(reqData.poa_details).length === 0){
			return res.badRequest({
				status : "nok",
				message : "Data should not empty, Please fill the data."
			});
		}
		let poa_arr = [],
			poa_data,
			message;
		for (const element of reqData.poa_details) {
			const poa_obj = {
				principal: element.principal,
				principal_name: element.principal_name,
				poa_holder_name: element.poa_holder_name,
				principal_relationship_with_poa: element.principal_relationship_with_poa,
				customer_id: element.customer_id,
				white_label_id: white_label_id,
				loan_id: loan_id
			};
			if (element.id) {
				poa_data = await PoaDetails.update({id: element.id}).set(poa_obj).fetch();
				poa_arr.push(poa_data);
				message = sails.config.msgConstants.successfulUpdation;
			} else {
				trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
				poa_data = await PoaDetails.create(poa_obj).fetch();
				poa_arr.push(poa_data);
				message = sails.config.msgConstants.successfulInsertion;
			}
		}
		return res.send({
			status: "ok",
			message,
			poa_data: poa_arr
		});
	},
	fetch_power_of_atorney: async function (req, res) {
		const loan_ref_id = req.param("loan_ref_id");
		params = {loan_ref_id};
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);

		if (!loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_req_data = await LoanrequestRd.findOne({loan_ref_id});
		let poa_details = await PoaDetailsRd.find({loan_id: loan_req_data.id});
		if (poa_details.length > 0) {
			return res.ok({
				status: "ok",
				message: "Data fetched successfully",
				data: poa_details
			});
		} else {
			return res.ok({
				status: "ok",
				message: "No data found for this loan_id",
				data: poa_details
			});
		}
	}
};
