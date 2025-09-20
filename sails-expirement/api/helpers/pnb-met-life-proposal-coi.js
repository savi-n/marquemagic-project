module.exports = {


  friendlyName: 'Pnb met life proposal coi',


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
    const loanData = await LoanrequestRd.findOne({
      id: loanId
    }).select('white_label_id');

    const did_data = await InsuredApplicantsRd.findOne({
      id: insAppRef
    }).select("applicant_did");

    if (!did_data) {
      throw new Error("Missing director id")
    }
    const data = await DirectorRd.findOne({
      id: did_data.applicant_did
    }).select(["ddob", "dcontact"]);

    body = {
      "applicationNumber": pnr,
      "birthDate": data.ddob,
      "mobileNumber": data.dcontact
    }
    console.log("body:", body)

    const whiteLabelSolData = await WhiteLabelSolutionRd.findOne({
      id: loanData.white_label_id
    }).select(["s3_name"]);

    const response = await sails.helpers.axiosApiCall(
      sails.config.insurance.pnb.urls.proposalCoi,
      {
        body,
        s3_name: whiteLabelSolData.s3_name
      },
      {"content-type": "application/json"},
      "post"
    );
    console.log("response:", response)
    const apiRes = response.data;
    const coiLink = apiRes?.data;
    exits.success(coiLink);
  }


};
