module.exports = {


  friendlyName: 'Trigger insurance proposals',


  description: '',


  inputs: {
    loanId: {
      type: "number",
      required: true
    },
    authorization: {
      type: "string"
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const loanId = inputs.loanId;

    // find all online insurances
    const onlineInsurances = await InsuranceRd.find({
      loan_id: loanId,
      record_status: "active",
      ins_mode: "online"
    }).select(["id"]);

    const insIds = [];
    for (insurance of onlineInsurances) insIds.push(insurance?.id);

    const insuredApplicants = await InsuredApplicantsRd.find({
      ins_ref_number: insIds,
      record_status: "active"
    }).select(["id"]);

    const insAppRefs = [];

    for (const appliant of insuredApplicants) insAppRefs.push(appliant.id);

    const proposals = await InsuranceProposalRd.find({
      ins_app_ref: insAppRefs
    });

    const proposalMap = new Map();
    for (const proposal of proposals) proposalMap.set(proposal.ins_app_ref, proposal);

    const unInitiatedAppRefs = [];

    for (const appRef of insAppRefs) {
      if (!proposalMap.get(appRef)?.status &&
        !proposalMap.get(appRef)?.status_message) unInitiatedAppRefs.push(appRef)
    }


    for (const insAppRef of unInitiatedAppRefs) await sails.helpers.initiateProposal(insAppRef, inputs.authorization);

    exits.success(unInitiatedAppRefs);
  }


};
