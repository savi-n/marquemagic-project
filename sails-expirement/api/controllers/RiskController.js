/**
 * RiskController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
	/**
	 * @api {post} createRiskUser  Risk user creation
	 * @apiName createRiskUser
	 * @apiGroup RiskGrp
	 * @apiExample Example usage:
	 * curl -i localhost:1337/createRiskUser/
	 * @apiSuccess {String} status Status of the api response
	 * @apiSuccess {String} message Risk user created
	 * @apiSuccess {Object} data
	 */
	newRequest: async (req, res, next) => {
		const userId = req.user["id"],
			user_whitelabel = req.user.loggedInWhiteLabelID,
			entityName = req.param("entity_name"),
			entityType = req.param("entity_type"),
			adharNo = req.param("adhar"),
			gstin = req.param("gst"),
			contactNo = req.param("contact"),
			createObj = {
				entityName: entityName,
				entityType: entityType,
				phone: contactNo,
				userId: userId,
				white_label_id: user_whitelabel
			};
		if (adharNo) {
			createObj.adhar = adharNo;
		}
		if (gstin) {
			createObj.GSTIN = gstin;
		}
		const checkUser = await RiskMappingRd.find({
			userId: userId,
			phone: contactNo
		});
		if (checkUser.length > 0) {
			return res.ok({
				status: "nok",
				message: "User already exist"
			});
		} else {
			if (contactNo) {
				const createRiskUser = await RiskMapping.create(createObj).fetch();
				return res.ok({
					status: "ok",
					message: "Risk user created",
					data: createRiskUser
				});
			} else {
				return res.send({
					status: "nok",
					message: "Required param missing"
				});
			}
		}
	},

	riskReport: async (req, res) => {
		const userId = req.user["id"],
			riskUsers = await RiskMappingRd.find({
				userId: userId
			}),
			triggerApiResult = await sails.helpers.sailstrigger(
				sails.config.riskUsersBiz.reportCheck, //URL to be called
				JSON.stringify({user_details: riskUsers}), //api input body
				{
					"Content-Type": "application/json" //Header to api
				},
				"POST" //http method
			);
		if (triggerApiResult.status == "nok") {
			return res.send({
				status: "nok",
				message: "Something went wrong!!"
			});
		} else if (triggerApiResult) {
			return res.send(JSON.parse(triggerApiResult));
		}
	},
	/**
	 * @api {post} AllriskReports  All reports of this user
	 * @apiName Allreports
	 * @apiGroup RiskGrp
	 * @apiExample Example usage:
	 * curl -i localhost:1337/allUserReports/
	 * @apiSuccess {String} status Status of the api response
	 * @apiSuccess {String} message all reports
	 * @apiSuccess {Object} data
	 */
	allReports: async (req, res) => {
		const userId = req.user["id"],
			userPhone = req.param("user_phone"),
			triggerApiResult = await sails.helpers.sailstrigger(
				sails.config.riskUsersBiz.allReports, //URL to be called
				JSON.stringify({phoneNo: userPhone}), //api input body
				{
					"Content-Type": "application/json" //Header to api
				},
				"POST" //http method
			);
		if (triggerApiResult.status == "nok") {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.somethingWentWrong
			});
		} else if (triggerApiResult) {
			return res.send(JSON.parse(triggerApiResult));
		}
	},

	searchReport: async (req, res) => {
		const userId = req.user["id"],
			phoneNo = req.param("phone"),
			riskType = req.param("risk_type"),
			triggerApiResult = await sails.helpers.sailstrigger(
				sails.config.riskUsersBiz.reportCheck, //URL to be called
				JSON.stringify({phone: phoneNo, risk_type: riskType}), //api input body
				{
					"Content-Type": "application/json" //Header to api
				},
				"POST" //http method
			);
	},

	serverHealthCheck: async function (req, res, next) {
		const endTime = new Date();
		formattedDateTime = endTime.getSeconds();
		let downtime;
		try {
			// returns the number of seconds the current Node.js process has been running.
			const uptime = process.uptime();
			// Return the health check response
			return res.ok({status: "ok", message: "Server is healthy", uptime: uptime});
		} catch (error) {
			downtime = formattedDateTime - uptime;
			// Handle any errors that occur during the health check
			return res.serverError({status: "nok", message: "500 server error", downtime: downtime});
		}
	}
};
