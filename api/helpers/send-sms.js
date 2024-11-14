module.exports = {


  friendlyName: 'Send sms',


  description: '',


  inputs: {
    body: {
      type: "ref",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const url = sails.config.sms.url;

    const body = inputs.body;

    const header = {
      'content-type': 'application/x-www-form-urlencoded'
    }

    const apiRes = await sails.helpers.axiosApiCall(
      url,
      body,
      header,
      "post"
    )

    exits.success(apiRes?.data);
  }


};

