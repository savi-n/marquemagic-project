module.exports = {


  friendlyName: 'Pan to gst',


  description: '',


  inputs: {
    pan: {
      type: "string"
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const pan = inputs.pan;
    if (!pan) return exits.success([]);

    // Quicko Login
    let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
    if (!quickoLogin || quickoLogin.status == "nok") return res.badRequest(quickoLogin);
    if (!quickoLogin || !quickoLogin.access_token) return res.ok(quickoLogin);

    // Call the quicko api
    const url = `${sails.config.quicko.api.pan.panToGst}/${pan}`;
    const method = "GET";
    const header = {
      "Authorization": quickoLogin.access_token,
      "x-api-key": sails.config.quicko.apiKey,
      "x-api-version": sails.config.quicko.apiVersion
    };
    let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);

    exits.success(JSON.parse(gstDetails).data);

  }


};

