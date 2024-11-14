module.exports = {


  friendlyName: 'Itr consent',


  description: '',


  inputs: {

    username: {
      type: "string",
      required: true
    },
    password: {
      type: "string",
      required: true
    },
    isBusiness: {
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
    // TODO
    const {username, password, isBusiness} = inputs;

    const data = {
      "username": username,
      "password": password,
      "isBusiness": isBusiness
    }
    const url = "https://ue9yz4vcn9.execute-api.ap-southeast-1.amazonaws.com/crawl/itr",
    body = JSON.stringify(data),
    headers = {"Content-Type": "application/json"},
    method = "POST"

    let itrResponse = await sails.helpers.apiTrigger(url, body, headers, method);
    itrResponse = JSON.parse(itrResponse);
    return exits.success({
      status:200, 
      response: itrResponse
    });


  }


};

