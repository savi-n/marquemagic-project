/**
 * LoanReferencesController.js.js
 *
 * @description :: Server-side logic for managing AssetTypeMappingCersai
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	/**
	 * @api {POST} /LoanReferences/create create Loan References record
	 * @apiName create Loan References record
	 * @apiGroup loanReferece
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/LoanReferences/create
	 * {
	 *      loanId : "30581"
			loanReferenceData :{[
				ref_name : "test",
				ref_email :  "test12345@gmail.com",
				ref_contact :  "6787867867",
				ref_state :  "Karnataka",
				ref_city :  "Bangalore",
				ref_pincode :  "560006",
				ref_locality :  "Bangalore",
				ref_type: "Relative",
				address1: "jeevan bhima nagar",
				address2: "near crimson court ",
				reference_truecaller_info : "",
			]}
	 }
	 * @apiParam {String} loanId
	 * @apiParam {Object[]} loanReferenceData
	 * @apiParam {String} loanReferenceData.ref_name
	 * @apiParam {String} loanReferenceData.ref_email
	 * @apiParam {String} loanReferenceData.ref_contact
	 * @apiParam {String} loanReferenceData.ref_city
	 * @apiParam {String} loanReferenceData.ref_pincode
	 * @apiParam {String} loanReferenceData.ref_locality
	 * @apiParam {String} loanReferenceData.reference_truecaller_info can be null
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 *
	 */
	create: async function (req, res, next) {
		const data = req.param("data"),
		section_id = req.param("section_id"),
			loanReferenceData = req.param("loanReferenceData")
				? req.param("loanReferenceData")
				: data.reference_details
				? data.reference_details
				: [];
		loanId = req.param("loanId") || req.param("loan_id");
		let params = {...req.allParams(), loanReferenceData: loanReferenceData};
		let fields = ["loanReferenceData", "loanId"];
		let missing = await reqParams.fn(params, fields);
		if (!loanReferenceData || loanReferenceData.length == 0 || !loanId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let resData = [];
		for (const i in loanReferenceData) {
			params = loanReferenceData[i];
			fields = ["ref_name", "ref_contact"];
			missing = await reqParams.fn(params, fields);

			if (!loanReferenceData[i].ref_name || !loanReferenceData[i].ref_contact) {
				sails.config.res.missingFields.mandatoryFields = missing;
				return res.badRequest(sails.config.res.missingFields);
			}
		}
		const dateTime = await sails.helpers.dateTime();
		loanFetchData = await LoanrequestRd.findOne({id: loanId});
		trackData = await sails.helpers.onboardingDataTrack(loanFetchData.id, loanFetchData.business_id, "", req.user.id, section_id, "");
		for (const i in loanReferenceData) {
			const loanRefObject = {
				loan_id: loanId,
				ref_name: loanReferenceData[i].ref_name,
				ref_email: loanReferenceData[i].ref_email,
				ref_contact: loanReferenceData[i].ref_contact,
				ref_state: loanReferenceData[i].ref_state,
				ref_city: loanReferenceData[i].ref_city,
				ref_pincode: loanReferenceData[i].ref_pincode,
				ref_locality: loanReferenceData[i].ref_locality,
				reference_truecaller_info: loanReferenceData[i].reference_truecaller_info
					? loanReferenceData[i].reference_truecaller_info
					: "",
				ints: dateTime,
				ref_type: loanReferenceData[i].ref_type,
				address1: loanReferenceData[i].address1,
				address2: loanReferenceData[i].address2,
				landmark: loanReferenceData[i].landmark
			};

			if (loanReferenceData[i].id) {
				const loanData = await LoanReferencesRd.findOne({id: loanReferenceData[i].id});
				if (loanData) {
					//updating data in db
					const updateData = await LoanReferences.update({id: loanReferenceData[i].id})
						.set(loanRefObject)
						.fetch();
					resData.push(updateData[0]);
				} else {
					return res.send({
						status: "nok",
						message: "Invalid id"
					});
				}
			} else {
				//inserting data into db
				const createLoanData = await LoanReferences.create(loanRefObject).fetch();
				resData.push(createLoanData);
			}
		}
		return res.send({
			statusCode: "NC200",
			message: "success",
			data: resData
		});
	},

	create_fetch: async function (req, res) {
		let {loan_ref_id} = req.allParams();

		params = {loan_ref_id};
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loan_details = await LoanrequestRd.findOne({loan_ref_id});

		if (!loan_details) {
			return res.badRequest({
				status: "nok",
				message: "no record found"
			});
		}

		const loanData = await LoanReferencesRd.find({loan_id: loan_details.id});

		if (loanData.length > 0) {
			return res.ok({
				status: "ok",
				message: "Data fetched successfully",
				data: {
					loanData
				}
			});
		} else {
			return res.ok({
				status: "ok",
				data: {
					loanData
				}
			});
		}
	}
};
