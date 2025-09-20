


module.exports = {


  friendlyName: 'Track proposal',


  description: '',


  inputs: {
    insAppRef: {
      type: "number",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const insAppRef = inputs.insAppRef;

    const insuredApplicantRec = await InsuredApplicantsRd.findOne({
      id: insAppRef
    });

    const insuranceRec = await InsuranceRd.findOne({
      id: insuredApplicantRec?.ins_ref_number
    }).select(["ins_id", "loan_id"]);

    if (!sails.config.insurance.insMasterMap) await sails.helpers.setInsMasterMap();
    let insMasterMap = sails.config.insurance.insMasterMap;

    const proposalRecord = await InsuranceProposalRd.findOne({
      ins_app_ref: insAppRef
    }).select(["proposal_ref_num"]);

    const propRefNum = proposalRecord.proposal_ref_num;
    let data;

    switch (insMasterMap.get(insuranceRec?.ins_id)?.ins_name) {
      case 'PNB Metlife':
        data = await sails.helpers.pnbMetLifeProposalStatus(propRefNum, insAppRef, insuranceRec.loan_id);
        break;
      case 'HDFC Life Insurance':
        data = await sails.helpers.hdfcLifeProposalStatus(propRefNum, insAppRef, insuranceRec.loan_id);
        break;
    }


    exits.success({data})

  }


};
