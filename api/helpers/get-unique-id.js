module.exports = {


  friendlyName: 'Get an unique id',


  description: 'Creates and unique id with the combination of timestamp and randomly generated number.',


  inputs: {

  },


  exits: {

    success: {
      outputFriendlyName: 'Unique id',
    },

  },


  fn: async function (inputs, exits) {

    const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
    const uniqTimeStamp = Math.round(new Date().getTime());
    const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);

    return exits.success(uniqueRandomId);

  }


};

