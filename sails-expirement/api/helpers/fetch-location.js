const nodeGeocoder = require("node-geocoder");

const options = {
  provider: "google",
  apiKey: 'AIzaSyBD1n5ajHV8PQdyhCMBOZGf7PKBD-iirlU',
  formatter: null
};

const geoCoder = nodeGeocoder(options);


module.exports = {


  friendlyName: 'Fetch location',


  description: '',


  inputs: {
    lat: {
      type: "string",
      required: true,
    },
    long: {
      type: "string",
      required: true,
    }

  },


  exits: {
    success: {
      description: 'All done.',
    },
    error: {
			description: "There is an error."
		}

  },


  fn: async function (inputs, exits) {
    const {lat, long} = inputs;
    try {
      let result = await geoCoder.reverse({lat: lat, lon: long});
      if (result[0] && result[0].formattedAddress) result = result[0].formattedAddress;
      else result = null;
      return exits.success(result);
    } catch (err) {
      return exits.error(err);
    }
  }
};
