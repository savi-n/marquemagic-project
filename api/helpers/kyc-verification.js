module.exports = {


	friendlyName: 'Kyc verification',


	description: 'Verification of kyc data',


	inputs: {
		type: {
			type: 'ref'
		},
		essentials: {
			type: 'ref'
		}
	},


	exits: {

		success: {
			description: 'All done.',
		},

	},


	fn: async function (inputs, exits) {
		let url = sails.config.signzy.url;
		let service = sails.config.signzy.service;
		let task = sails.config.signzy.task.verification;
		let itemId, accessToken;

		if (inputs.type === 'pan') {
			itemId = sails.config.signzy.pan.itemId;
			accessToken = sails.config.signzy.pan.accessToken;
		} else if (inputs.type === 'businessPan') {
			itemId = sails.config.signzy.businessPan.itemId;
			accessToken = sails.config.signzy.businessPan.accessToken;
		} else if (inputs.type === 'voter') {
			itemId = sails.config.signzy.voterid.itemId;
			accessToken = sails.config.signzy.voterid.accessToken;
		} else if (inputs.type === 'license') {
			itemId = sails.config.signzy.dl.itemId;
			accessToken = sails.config.signzy.dl.accessToken;
		} else if (inputs.type === 'passport') {
			itemId = sails.config.signzy.passport.itemId;
			accessToken = sails.config.signzy.passport.accessToken;
		} else {
			return exits.success([400, {
				status: 'nok',
				statusCode: 'NC400',
				message: {
					verified: false,
					message: 'Verification failed. Invalid req_type or ref_id.'
				}
			}]);
		}

		let reqPayload = {
			service, itemId, task, accessToken, essentials: inputs.essentials
		};
		let data = await sails.helpers.apiTrigger(
			url,
			JSON.stringify(reqPayload),
			{ "content-type": "application/json" },
			'POST'
		);
		let statusCode = 200, response = {};
		try {
			if (data.status === 'nok') {
				response.status = 'nok';
				response.statusCode = 'NC' + statusCode;
				response.message = JSON.parse(data.result);
				if (response.message && response.message.error && response.message.error.statusCode) {
					statusCode = response.message.error.statusCode;
					response.status = 'nok';
					response.statusCode = 'NC' + statusCode;
					let errorMessage = response.message.error.message;
					response.message = {
						verified: false,
						message: errorMessage
					}
				}
			}
			else {
				response.status = 'ok';
				response.statusCode = 'NC200';
				const parsedData = JSON.parse(data);
				if (parsedData.response) response.message = parsedData.response.result;

				try {
					if (!response.message) {
						if(parsedData.error) parsedResponse = parsedData;
						else parsedResponse = parsedData.response;
						statusCode = parsedResponse.error.statusCode;
						response.status = 'nok';
						response.statusCode = 'NC' + statusCode;
						let errorMessage = parsedResponse.error.message;
						response.message = {
							verified: false,
							message: errorMessage
						}
					}
				} catch (err) { }

			}
		} catch (err) {
			console.log(err);
			statusCode = 500;
			response.status = 'nok';
			response.statusCode = 'NC' + statusCode;
			response.message = 'Something went wrong!'
		}

		return exits.success([statusCode, response]);
	}


};

