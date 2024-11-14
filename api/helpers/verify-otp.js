module.exports = {


  friendlyName: 'Verify otp',


  description: '',


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
    fcm_id:{
      type: "string",
      required: true
    },
    otp: {
      type: "number",
      required: true
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    
    const {mobile, os, device_id, fcm_id, otp} = inputs;

    const data = {
        mobile, os, device_id, fcm_id, otp
    };
        
    const url = "http://18.136.14.70/user/verifyotp",
    body = JSON.stringify(data),
    headers = {"Content-Type": "application/json"},
    method = "POST"

    const otpResponse = await sails.helpers.apiTrigger(url, body, headers, method);
    console.log(otpResponse);
    return exits.success(otpResponse);

  }


};

