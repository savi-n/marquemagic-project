// async function waitForFewSeconds(seconds) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('Waited for 30 seconds');
//     }, seconds * 1000); // 30 seconds in milliseconds
//   });
// }

// const InsuranceProposalRd = require("../models/InsuranceProposalRd");

// let insMaster, insMasterMap = new Map();

// (async function () {
//   await waitForFewSeconds(1);
//   insMaster = await InsuranceMasterRd.find();
//   for (elm of insMaster) {
//     insMasterMap.set(elm.ins_id, {
//       vendor_available: elm.vendor_available,
//       vendor_integrated: elm.vendor_integrated,
//       ins_name: elm.ins_name,
//       ins_type: elm.ins_category
//     })
//   }
//   //console.log(insMasterMap)
// })();

module.exports = {


  friendlyName: 'Initiate proposal',


  description: '',


  inputs: {
    insAppRef: {
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
    const insAppRef = inputs.insAppRef;
    const insuredApplicantRec = await InsuredApplicantsRd.findOne({
      id: insAppRef
    })
    //.select(["ins_ref_number"]);

    const insuranceRec = await InsuranceRd.findOne({
      id: insuredApplicantRec?.ins_ref_number
    }).select(["ins_id", "loan_id"]);

    let response;

    if (!sails.config.insurance.insMasterMap) await sails.helpers.setInsMasterMap();
    let insMasterMap = sails.config.insurance.insMasterMap;

    const count = await InsuranceProposalRd.count({
      ins_app_ref: insAppRef
    });

    if (!count) await InsuranceProposal.create({
      ins_app_ref: insAppRef
    })

    switch (insMasterMap.get(insuranceRec?.ins_id)?.ins_name) {
      case 'PNB Metlife':
        response = await sails.helpers.pnbMetLifeProposal(
          insuredApplicantRec,
          insuranceRec.loan_id,
          inputs.authorization
        );
        break;
      case 'HDFC Life Insurance':
        response = await sails.helpers.hdfcLifeProposal(
          insuredApplicantRec,
          insuranceRec.loan_id,
          inputs.authorization
        );
        break;
      case 'ICICI Prudential Life Insurance':
        response = await sails.helpers.iciciPrudentialProposal(
          insuredApplicantRec,
          insuranceRec.loan_id,
          inputs.authorization
        )
        break;
      case 'TATA AIG - GEMI':
        response = await sails.helpers.tataGemiProposal(
          insuredApplicantRec,
          insuranceRec.loan_id,
          inputs.authorization
        )
        break;

    }

    exits.success(response);
  }
};
