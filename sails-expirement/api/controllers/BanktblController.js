/**
 * Banktbl
 *
 * @description :: Server-side logic for managing Banktbl
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	/**
	 * @api {Get} /getBranchList?bankId=32 getBranchList
	 * @apiName Get List of branch List
	 * @apiGroup BankTbl
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/getBranchList?bankId=32
	 * @apiParam {String} bankId
	 *
	 * @apiSuccess {String} statusCode status Code.
	 * @apiSuccess {String} branchList
	 *
	 */
	index: async function (req, res, next) {
		const bankId = req.param("bankId"),
			zone_id = req.param("zone_id");
		if (!bankId) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const whereCondition = {};
		if (zone_id){
			whereCondition.section_reference_id = {contains : zone_id};
		} else{
			whereCondition.ref_id = bankId;
		}
		const branchList = await BanktblRd.find(whereCondition).select(["ref_id", "branch"]).sort("branch ASC");
		return res.send({
			statusCode: "NC200",
			status: "ok",
			branchList: branchList
		});
	},

	IFSC_list: async function (req, res) {
		const bankId = req.param("bankId");
		const ifsc = req.param("ifsc");

		const white_label_id = req.user.loggedInWhiteLabelID;
		let IFSC_list;
		if (white_label_id == sails.config.muthoot_wl) {
			let url = sails.config.muthoot_IFSC + "ifsc_code=" + (ifsc || "") + "&ref_id=" + (bankId || "");
			let result = await sails.helpers.sailstrigger(url, "", "", "GET");

			if (result.status != "nok") {
				let parseResult = JSON.parse(result).data;
				IFSC_list = parseResult.map(result => ({
					bank: result.bank_name ? result.bank_name : "",
					ifsc: result.ifsc_code ? result.ifsc_code : "",
					bank_code: result.bank_code ? result.bank_code : "",
					branch_code: result.branch_code ? result.branch_code : "",
					branch_name: result.branch_name ? result.branch_name : "",
					micr_code: result.micr_code ? result.micr_code : "",
					ref_id: result.ref_id ? result.ref_id : "",
					banking_location: result.banking_location ? result.banking_location : "",
					code: result.code ? result.code : ""
				}));
			}
			return res.ok({
				status: "ok",
				message: "Success",
				IFSC_list: IFSC_list || []
			})
		}

		if (!bankId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		let whereCondition = {ref_id: bankId};
		if (ifsc && ifsc != "") whereCondition.ifsc = {
			contains: ifsc
		}
		const bankTblData = await BanktblRd.find(whereCondition).select(["bank", "ifsc"]);

		if (bankTblData.length === 0) {
			return res.send({
				status: "nok",
				IFSC_list: []
			});
		} else {
			return res.send({
				status: "ok",
				message: "Success",
				IFSC_list: bankTblData
			});
		}
	},
	fetch_bank_details_from_solId : async function (req, res){
		const solId = req.param("solId"),
		 bankId = req.param("bankId");
		if (!solId || !bankId){
			return res.badRequest(sails.config.res.missingFields);
		}
		const bankDetails = await BanktblRd.find({
			ref_id: bankId,
			ifsc : {contains : solId},
			status: "active"
		}).select(["id", "bank", "ifsc", "branch"]);

		return res.ok({
			status : "ok",
			message : "Bank List",
			data : bankDetails
		})
	}
};
