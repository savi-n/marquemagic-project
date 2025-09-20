module.exports = {


  friendlyName: 'Hdfc life proposal status',


  description: '',


  inputs: {
    pnr: {
      type: "string",
      required: true
    },
    insAppRef: {
      type: "string",
      required: true
    },
    loanId: {
      type: "string"
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
    const loanId = inputs.loanId;

    const response = await sails.helpers.axiosApiCall(
      sails.config.insurance.hdfc.urls.proposalStatus,
      {pnr, loan_id: loanId},
      {"content-type": "application/json"},
      "post"
    );

    const apiRes = response.data;

    const status = apiRes?.data?.tma?.tma_body?.currentstep;

    await InsuranceProposal.updateOne({
      ins_app_ref: insAppRef
    }).set({
      status_message: status
    })

    exits.success({data: response.data})
  }


};
