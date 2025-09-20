const axios = require("axios");

module.exports = {
	friendlyName: "Axios api call",

	description: "",

	inputs: {
		url: {
			type: "string",
			required: true
		},
		body: {
			type: "json"
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
		const {method, url, body, headers} = inputs;
		let options = {
			method,
			url,
			data: body,
			headers
		};

		try {
			let response = await axios(options);
			console.log("success: apiCall.js apiCall response => ", response.data);
			return exits.success(response);
		} catch (err) {
			console.log("err: apiCall.js apiCall err => ", err);
			return exits.success(err);
		}
	}
};
