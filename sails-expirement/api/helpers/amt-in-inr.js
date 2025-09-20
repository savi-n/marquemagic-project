module.exports = {


  friendlyName: 'Amt in inr',


  description: '',


  inputs: {
    amnt: {
      type: "string",
      required: true
    },
    unit: {
      type: "string"
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    let {amnt, unit} = inputs;

    let multiplier = 1;

    if (unit === "Crores") multiplier = 10000000;
    else if (unit === "Lakhs") multiplier = 100000;

    const considerationPrice = Math.round(amnt * multiplier);
    return exits.success(considerationPrice);


  }


};
