const reqParams = require("../helpers/req-params");
module.exports = {
	optin_deepLink: async function (req, res) {
		const URL = require("url");
		const phoneNo = req.body.phoneNo;

		params = phoneNo;
		fields = ["phoneNo"];
		missing = await reqParams.fn(params, fields);

		if (!phoneNo) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		phoneNoValidation = /^\d{10}$/;
		if (phoneNoValidation.test(phoneNo) === false) {
			return res.badRequest({
				status: "nok",
				message: "Invalid Phone Number"
			});
		}
		phoneNoData = await UsersRd.findOne({email: req.user.email});
		if (phoneNo != phoneNoData.contact) {
			return res.send({
				status: "nok",
				message: "Please update Phone number in your profile"
			});
		}
		body = {
			enterpriseId: sails.config.whatsAppIntegration.enterpriseId,
			msisdnList: [phoneNo],
			token: sails.config.whatsAppIntegration.token
		};
		auth = {
			"content-Type": "application/json"
		};
		const aclResponse = await sails.helpers.sailstrigger(
			sails.config.whatsAppIntegration.url,
			JSON.stringify(body),
			auth,
			"POST"
		);
		// deprecated functions
		text = escape("Hi! I'm interested in receiving updates on whatsapp");
		deep_link = URL.resolve("https://wa.me/", "/917829766577?text=" + text);
		return res.send({
			status: "ok",
			message: "success",
			aclResponse: aclResponse,
			deep_link: deep_link
		});
	}
};
