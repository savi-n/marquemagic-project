const {default: axios} = require("axios");

module.exports = {


  friendlyName: 'Generate emudra token',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {

    try {

      const url = sails.config.EMudra.url.authorizeApp,
        body = {
          AppName: sails.config.EMudra.token.AppName,
          SecretKey: sails.config.EMudra.token.SecretKey
        },
        method = 'POST',
        headers = {},
        options = {
          url,
          data: body,
          method,
          headers
        };

      const apiRes = await axios(options);

      if (apiRes?.data?.Response?.AuthToken) {

        return exits.success({
          status: true,
          token: apiRes.data.Response.AuthToken
        });

      }

      else throw new Error("API Failed to generate Token");


    } catch (error) {

      exits.success({
        status: false,
        message: error?.response?.data || error?.message || "Failed to generate Token"
      })

    }

  }


};
