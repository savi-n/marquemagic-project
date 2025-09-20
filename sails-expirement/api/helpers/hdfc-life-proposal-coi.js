module.exports = {


  friendlyName: 'Hdfc life proposal coi',


  description: '',


  inputs: {
    pnr: {
      type: "string",
      required: true
    },
    insAppRef: {
      type: "string",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const pnr = inputs.pnr;
    const insAppRef = inputs.insAppRef;

    const response = await sails.helpers.axiosApiCall(
      sails.config.insurance.hdfc.urls.proposalCoi,
      {pnr},
      {"content-type": "application/json"},
      "post"
    );

    const apiRes = response.data;

    const status = apiRes?.data?.tma?.tma_body?.currentstep;

    await InsuranceProposal.updateOne({
      ins_app_ref: insAppRef
    }).set({
      status_message: status
    });

    let data = response.data;
    data = data?.data?.coiLink;

    exits.success(data)
  }


};
