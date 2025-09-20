/**
 * CoApplicantBusinessMappingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const reqParams = require("../helpers/req-params");
module.exports = {
	coApplicantBusinessMapping: async function (req, res) {
		try {
			const params = req.allParams(),
			 {parent_business_id, co_applicant_business_id} = params,
			 fields = ["parent_business_id", "co_applicant_business_id"],
			 missing = await reqParams.fn(params, fields);

			if (!parent_business_id || !co_applicant_business_id) {
				sails.config.res.missingFields.mandatoryFields = missing;
				return res.badRequest(sails.config.res.missingFields);
			}
			const white_label_id = req.user.loggedInWhiteLabelID,
				// Check if the record already exists
			 existingRecord = await CoapplicantBusinessMappingRd.findOne({
					parent_business_id,
					id : params.id
				});

			if (existingRecord) {
				// Update the existing record
				const updatedRecord = await CoapplicantBusinessMappingRd.updateOne({
					parent_business_id,
					id : params.id
				}).set({
					co_applicant_business_id,
					updated_at: await sails.helpers.dateTime() // Set updated time
				});
				return res.ok({status : "ok",message: 'Details updated successfully', data: updatedRecord});
			} else {
				// Insert a new record
				const newRecord = await CoapplicantBusinessMappingRd.create({
					parent_business_id,
					co_applicant_business_id,
					white_label_id,
					created_at: await sails.helpers.dateTime(), // Set created time
					updated_at: await sails.helpers.dateTime() // Set updated time
				}).fetch();

				return res.send({status : "ok", message: 'Details inserted successfully', data: newRecord});
			}
		} catch (error) {
			return res.badRequest({status: "nok", message: 'An error occurred while processing the request', error});
		}
	}
};
