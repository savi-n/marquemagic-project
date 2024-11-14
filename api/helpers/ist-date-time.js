const moment = require('moment-timezone');
module.exports = {


  friendlyName: 'Ist date time',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const date = new Date();
    const formattedDate = moment(date)
      .tz("Asia/Kolkata")
      .format('YYYY-MM-DD HH:mm:ss')
      .toString();
    return exits.success(formattedDate);
  }


};

