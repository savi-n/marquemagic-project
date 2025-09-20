const request = require("request");
const smsTriggerUrl = sails.config.smsKey.smsTriggerUrl,
	smsKey = sails.config.smsKey.smsKey,
	smsSenderId = sails.config.smsKey.smsSenderId,
	smsSenderIdMuthoot = sails.config.smsKey.smsSenderIdMuthoot;
module.exports = {
	friendlyName: "Sms trigger",

	description: "sms trigger api",

	inputs: {
		sms: {
			type: "string",
			description: "SMS TEXT",
			required: true
		},
		mobile: {
			type: "ref",
			description: "mobile in array",
			required: true
		},
		data: {
			type: "json",
			description: "data with key and value optional",
			required: true
		},
		white_label_id: {
			type: "string",
			description: "white_label_id from business table"
		}
	},

	fn: async function (inputs, exits) {
		const sms = inputs.sms,
			mobile = inputs.mobile;
		let paramsdata, method;
		if (inputs.white_label_id === sails.config.smsKey.white_label_id) {
			paramsdata =
				"workingkey=" +
				smsKey +
				"&to=" +
				mobile +
				"&sender=" +
				smsSenderIdMuthoot +
				"&message=" +
				encodeURI(sms);
			method = "GET";
		} else {
			paramsdata =
				"workingkey=" + smsKey + "&to=" + mobile + "&sender=" + smsSenderId + "&message=" + encodeURI(sms);
			method = "GET";
		}
		request(
			{
				url: smsTriggerUrl + "?" + paramsdata,
				method: method
			},
			async (error, response, body) => {
				const result = body;
				if (body && response.statusCode === 200) {
					return exits.success(result);
				}
				return exits.success(error);
			}
		);
	}
};
