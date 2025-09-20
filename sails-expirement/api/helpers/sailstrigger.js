const request = require("request");
//release
module.exports = {
	friendlyName: "Sailstrigger",

	description: "Sailstrigger something.",

	inputs: {
		url: {
			type: "string",
			required: true
		},
		body: {
			type: "string"
			// required: true,
		},
		headers: {
			type: "json"
			// required: true,
		},
		method: {
			type: "string",
			required: true
		}
	},

	exits: {
		success: {
			description: "All done."
		}
	},

	fn: async function (inputs, exits) {
		console.log("----------------------------------", inputs);
		request(
			{
				url: inputs.url,
				body: inputs.body,
				headers: inputs.headers,
				method: inputs.method
			},
			async (error, response, body) => {
				const result = body;
				if (body && response.statusCode == 200) {
					return exits.success(result);
				} else if (response === undefined) {
					return exits.success({
						status: "nok"
					});
				} else if (body && response.statusCode != 200) {
					return exits.success({status: "nok", result: result});
				} else {
					return exits.success(error);
				}
			}
		);
	}
};
