module.exports = {


  friendlyName: 'Get gst json converted data',


  description: 'This Helper function will return the GST data of the organisation for all the twelve months with the help of third party API',


  inputs: {
    gstin: {
      type: "string",
      required: true
    },
    month: {
      type: "number",
      required: true
    },
    year: {
      type: "number",
      required: true
    },
    quickoLogin: {
      type: "ref"
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Gst json converted data',
    },

  },


  fn: async function (inputs, exits) {

    let {month, year, gstin, quickoLogin} = inputs;

    const jsonConvertedData = [];

    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 12; i++) {
            if (month == 0) {
                month = 12;
                year = year - 1;
            }
            if (month == 3 && i != 0)
                break

            const url = `${sails.config.quicko.api.gstTaxPayerApi.returns.gst3BSummary}/${gstin}/gstrs/gstr-3b/${year}/${month}`;
            const method = "GET";
            const header = {
                "Authorization": quickoLogin.access_token,
                "x-api-key": sails.config.quicko.apiKey,
                "x-api-version": sails.config.quicko.apiVersion
            };
            let gstDetails = await sails.helpers.apiTrigger(url, "", header, method);
            if (gstDetails.status != "nok")
                gstDetails = JSON.parse(gstDetails);
            if ((gstDetails && gstDetails.status == "nok") || gstDetails.code != 200) {
            } else {
                jsonConvertedData.push({
                    data: gstDetails.data,
                    month: month,
                    gstin: gstin,
                    year: year
                })
            }
            --month;
        }
    }

    return exits.success(jsonConvertedData);

  }


};

