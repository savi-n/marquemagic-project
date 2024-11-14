module.exports = {


  friendlyName: 'Generate otp',


  description: 'Generate OTP helper function',


  inputs: {

      mobile: {
        type: "string",
        required: true
      },
      os: {
        type: "string",
        required: true
      },
      device_id: {
        type: "string",
        required: true
      },
      flag: {
        type: "boolean",
        required: true
      }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    
    const {mobile, os, device_id, flag} = inputs;

    const data = {
        mobile,
        os, 
        device_id,
        '6digitFlag': flag
    };
        
    const url = "http://18.136.14.70/user/sendotp",
    body = JSON.stringify(data),
    headers = {"Content-Type": "application/json"},
    method = "POST"

    const otpResponse = await sails.helpers.apiTrigger(url, body, headers, method);
    console.log(otpResponse);
    return exits.success(otpResponse);

  }


};

