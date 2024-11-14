const{ Parser } = require('@json2csv/plainjs');
const fs = require('fs');

module.exports = {


  friendlyName: 'Json to csv',


  description: 'This function is used to convert JSON to CSV format ',


  inputs: {
    jsonData:{
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
    
    const jsonData = inputs.jsonData;

    try {
      const parser = new Parser();
      const csv = await parser.parse(jsonData);
      return exits.success(csv);
    } catch (err) {
      console.error(err);
      return exits.success(false);
    }

    return exits.success(false);
  }


};

