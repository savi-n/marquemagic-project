module.exports = {


  friendlyName: 'Kyc forensic tracker',


  description: '',


  inputs: {
    recipients: {
      type: "ref",
      requried: true
    },
    requestType: {
      type: "string"
    },
    reqPayload: {
      type: "ref"
    },
    response: {
      type: "ref"
    },
    endpoint: {
      type: "string"
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let reqBody = {
      "bounce_address": "bounce@bounce.namastecredit.com",
      "from": {
        "address": "loans@namastecredit.com"
      }
    }

    const to = inputs.recipients.map(recipient => {
      return {
        email_address: {
          address: recipient
        }
      }
    });

    const subject = `TYPE: ${inputs.requestType} | ENV: ${sails.config.env.toUpperCase()} | WHITE-LABLE-ID: ${inputs.reqPayload?.white_label_id}`

    const htmlbody = `
    <div>ENDPOINT: ${inputs.endpoint}</div>
    <br><br>
    <div>RESPONSE: ${JSON.stringify(parsedData(inputs.response))}</div>
    <br><br>
    <div>REQUEST PAYLOAD: ${JSON.stringify(inputs.reqPayload)}</div>
    `;

    reqBody.to = to;
    reqBody.subject = subject;
    reqBody.htmlbody = htmlbody;

    let mailRes = await sails.helpers.apiTrigger(
      "https://api.zeptomail.in/v1.1/email",
      JSON.stringify(reqBody),
      {
        "content-type": "appliction/json",
        Authorization: sails.config.zohoCreds.mailingToken
      },
      "POST"
    );

    if (typeof mailRes === "string") mailRes = JSON.parse(mailRes);
    return exits.success(mailRes);

  }


};

function parsedData(data) {
  try {
    data = JSON.parse(data);
  } catch (err) {
  }
  return data;
}

