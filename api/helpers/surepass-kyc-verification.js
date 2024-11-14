module.exports = {


  friendlyName: 'Surepass kyc verification',


  description: 'Verification of kyc data',


  inputs: {
    type: {
      type: "string"
    },
    kyc_key: {
      type: "string"
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs,exits) {
    let url,reqPayload,auth, name;
    if(inputs.type ==="pan") {
      if(sails.config.uat_env) {name = "surepassuat"; }
      else  {name = "surepass"; }
      url = sails.config.surePass.panComprehensive;
      reqPayload = {id_number: inputs.kyc_key};
      auth = await AuthToken.findOne({name}).select("token");
    }
    let data = await sails.helpers.apiTrigger(
			url,
			JSON.stringify(reqPayload),
			{ "content-type": "application/json","Authorization": `Bearer ${auth.token}` },
			'POST'
		);
    let statusCode = 200, response = {};
    try {
      data = JSON.parse(data);
      response.statusCode = data.status_code;
      response.data = data?.data;
      if (data.status_code  === 401 || data.success === false) {
				response.status = 'nok';
				response.message = data.message;
			}
			else {
				response.status = 'ok';
			}
		} catch (err) {
			console.log(err);
			response.status = 'nok';
			response.message = 'Something went wrong!';
      response.error = err;
		}

		return exits.success([statusCode, response]);
  }
};

