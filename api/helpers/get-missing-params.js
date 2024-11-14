module.exports = {


  friendlyName: 'Get missing params',


  description: '',


  inputs: {
    passedPayload: {
      type: "ref",
      required: true
    },
    mandatoryParams: {
      type: "ref",
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Missing params',
    },

  },


  fn: async function (inputs, exits) {
    const { passedPayload, mandatoryParams } = inputs;

    const missingParams = mandatoryParams.filter(param => !passedPayload[param]);

    return exits.success(missingParams);

  }


};

