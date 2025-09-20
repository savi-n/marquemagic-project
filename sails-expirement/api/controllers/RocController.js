/**
 * RocController
 *
 * @description :: Server-side logic for managing RocController
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	/**
	 * @api {post} /companySearch/ company list with cin numbers
	 * @apiName company list
	 * @apiGroup ROC
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/companySearch/
	 * @apiParam {String} search company name search
	 *
	 * @apiSuccess {String} status Status of the api response
	 * @apiSuccess {String} message Company search result
	 * @apiSuccess {Object[]} data
	 */
	companySearch: async (req, res) => {
		let companyName = req.param("search");
		let companyRes;

		if (!companyName || typeof companyName !== "string") return res.badRequest(sails.config.res.missingFields);

		// trim down companyName to first two terms
		const companyNameSplits = companyName.split(" ");
		let trimmedCompanyName = "";

		for (let i = 0, termsAdded = 0; termsAdded < 2 && i < companyNameSplits.length; i++) {
			if (companyNameSplits[i]) {
				trimmedCompanyName += companyNameSplits[i] + " ";
				termsAdded++;
			}
		}

		trimmedCompanyName = trimmedCompanyName.trim();

		url = "https://www.mca.gov.in/mcafoportal/cinLookup.do?companyname=" + trimmedCompanyName;
		method = "POST";
		body = {}; // {companyname: companyName};
		header = {"content-type": "application/x-www-form-urlencoded"};
		apiRes = await sails.helpers.axiosApiCall(url, body, header, method);

		if (apiRes && apiRes.status == 200 && Array.isArray(apiRes.data.companyList)) {
			companyRes = apiRes.data.companyList.map(({companyID, companyName}) => ({
				CORPORATE_IDENTIFICATION_NUMBER: companyID, COMPANY_NAME: companyName
			}));
		} else {
			companyRes = [];
		}

		if (!companyRes || !companyRes.length) {
			const companyMasterResult = await CompanyMasterDataRd.find({
				select: ["CORPORATE_IDENTIFICATION_NUMBER", "COMPANY_NAME"],
				where: {
					COMPANY_NAME: {
						contains: trimmedCompanyName
					}
				}
			});

			companyRes = companyMasterResult;
		}

		res.send({
			status: "ok",
			message: sails.config.msgConstants.detailsListed,
			data: companyRes
		});
	}
};
