module.exports = {


  friendlyName: 'Tata gemi proposal',


  description: '',


  inputs: {
    insuredApplicant: {
      type: "ref",
      required: true
    },
    loanId: {
      type: "number"
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
    const insuredApplicant = inputs.insuredApplicant;
    const authorization = inputs.authorization;
    const proposal_id = await InsuranceProposal.findOne({
      ins_app_ref: insuredApplicant.id
    }).select("proposal_ref_num");

    const loanrequest = await LoanrequestRd.findOne({
      id: loanId
    }).populate([
      "business_id",
    ]).select(["loan_ref_id", "business_id"]);

    const loanRefId = loanrequest?.loan_ref_id;
    const userId = loanrequest?.business_id?.userid;
    const additionalData = await sails.helpers.getAdditionalInsData(
      userId || 126093,
      loanRefId || "JHUR71609648",
      authorization,
      insuredApplicant.applicant_did || 397210,
      insuredApplicant.id || 492
    );
    console.log("additional data is :", additionalData)
    const nominees = additionalData.nominee;
    let payload = {
      "proposal_id": proposal_id.proposal_ref_num,
      "office_location": "chennai",
      "communication_address1": "Lodha Society",
      "communication_address2": "",
      "communication_address3": "",
      "communication_pincode": 110045,
      "sol_id": "",
      "branch": "Mumbai",
      // "tagic_employee_code": 3425467,
      "proposer_pan": "AOYPY8984M",
      "partner_application_number": "",
      "partner_branch_location": "",
      "partner_employee_code": "",
      "partner_employee_name": "",
      "customer_account_number": "",
      "partner_cust_id": "",
      "sol_id_linked_to_rac": "",
      "sp_cert_no": "",
      "additional_detail1": "",
      "additional_detail2": "",
      "partner_ref_id": "",
      "gstin": "",
    }

    let nominee_details = []
    appointee_details = []

    for (const nominee of nominees) {
      nominee_details.push({
        nominee_name: nominee.nominee_name,
        nominee_relation: nominee.nominee_relation,
        nominee_contribution: nominee.nominee_contribution,
        nominee_dob: formatDate(nominee.nominee_dob, "timestamp")
      });

      if (nominee.apointee_name &&
        nominee.apointee_relation
      ) appointee_details.push({
        appointee_name: nominee.apointee_name,
        appointee_relation: nominee.apointee_relation
      });
    }

    payload.nominee_details = nominee_details;
    payload.appointee_details = appointee_details.length ? appointee_details : undefined;
    console.log("payload is :", payload)
    const response = await sails.helpers.axiosApiCall(
      sails.config.insurance.tatagemi.urls.proposal,
      {
        payload,
        loan_id: loanId
      },
      {"content-type": "application/json"},
      "post"
    );

    apiRes = response.data.message;
    console.log("apires data is :", apiRes)

    const prn = apiRes?.proposal_id;
    const payment_id = apiRes?.payment_id;

    await InsuranceProposal.updateOne({
      ins_app_ref: inputs?.insuredApplicant?.id
    }).set({
      proposal_ref_num: prn,
      status_message: payment_id,

    })
    await sails.helpers.tataGemiPayment(insuredApplicant, loanId)
    exits.success(response.data);
  }


};
function formatDate(dob, inputFormate) {
  let moodifiedDob;
  switch (inputFormate) {
    case 'yyyy-mm-dd': {
      const dobSplit = dob.split("-");
      moodifiedDob = `${dobSplit[1]}/${dobSplit[2]}/${dobSplit[0]}`;
    }
      break;
    case 'mm/dd/yyyy': {
      const dobSplit = dob.split("/");
      moodifiedDob = `${dobSplit[1]}/${dobSplit[0]}/${dobSplit[2]}`;
    }
      break;
    case 'timestamp': {
      const inputDate = moment(dob);
      return inputDate.format('YYYY-MM-DD');

    }

  }
  return moodifiedDob;
}
