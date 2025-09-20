const momentIndia = require("moment-timezone");
module.exports = {


  friendlyName: 'Tata gemi qoute',


  description: '',


  inputs: {
    did: {
      type: "number",
      required: true
    },
    loanId: {
      type: "number",
      required: true
    },
    sumAssured: {
      type: "number"
    },
    policyTerm: {
      type: "number"
    },
    insAppRef: {
      type: "number"
    },
    preQuoteData: {
      type: "ref"
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const did = inputs.did
    const loan_id = inputs.loanId
    const sum_assured = inputs.sumAssured
    const policy_term = inputs.policyTerm
    const insAppRef = inputs.insAppRef
    loanAccountNumber = Number(did.toString() + Date.now().toString());
    const sanData = await LoanSanctionRd.findOne({loan_id: loan_id}).select(["san_amount", "amount_um", "san_term", "san_emi"]);
    console.log("anything:", did)
    const date = new Date(),
      policyStartDate = momentIndia(date)
        .tz("Asia/Kolkata")
        .subtract(12, "minute")
        .format("YYYY-MM-DD")
        .toString();

    try {
      console.log("anything:", did)
      const applicant = await Director.findOne({id: did});
      let maritalStatus = applicant.marital_status;
      if (maritalStatus == "Unmarried/Single") maritalStatus = "Single";
      const firstName = `${applicant.dfirstname || ""}`.replace(/\s+/g, '');
      const lastName = `${applicant.dlastname || ""}`.replace(/\s+/g, '');

      const payload = {
        "loan_account_number": loanAccountNumber,
        "producer_code": sails.config.insurance.tatagemi.producer_code,
        "master_policy_number": sails.config.insurance.tatagemi.master_policy_number,
        "gemi_plan_code": sails.config.insurance.tatagemi.gemi_plan_code,
        "gemi_partner_name": sails.config.insurance.tatagemi.gemi_partner_name,
        "plan_type": "Individual",
        "family_composition": "1A",
        "policy_start_date": `${policyStartDate}`,
        "dob": `${applicant.ddob}`,
        "title": (applicant.gender == "Male") ? "Mr" : "Mrs",
        "first_name": firstName,
        "last_name": lastName,
        "occupation": `${inputs?.preQuoteData?.applicant_occupation || ""}`, //"ENGINEER", // ?? need to be fetched from database
        "mobile": Number(applicant.dcontact),
        "email": `${applicant.demail}`,
        "proposer_marital_status": maritalStatus,
        "proposer_gender": `${applicant.gender}`,
        "proposer_nationality": "Indian",
        "is_loan_linked": "No",
        "gemi_loan_type": "Home Loan",
        "gemi_loan_tenure": sanData.san_term,
        "gemi_emi_amount": sanData.san_emi,//calculation required for these terms
        "gemi_no_of_emi": sanData.san_term,//calculation required for these terms
        "certificate_tenure": 1,
        "gemi_loan_amount": await getAmount(sanData?.san_amount, sanData?.amount_um),
        "co_applicant_details": [
          {
            "member_title": (applicant.gender == "Male") ? "Mr" : "Mrs",
            "member_name": firstName + " " + lastName,
            "member_dob": `${applicant.ddob}`,
            "member_occupation": `${inputs?.preQuoteData?.applicant_occupation || ""}`,
            "member_relation": "self",
            "member_gender": `${applicant.gender}`,
            "member_nationality": "Indian",
            "member_unique_id_no": ""
          }
        ]
      }
      console.log("this is the payload for tataGEMIQoute:", payload)
      let apiRes = await sails.helpers.sailstrigger(
        sails.config.insurance.tatagemi.urls.quotation,
        JSON.stringify({
          payload,
          loan_id: loan_id
        }),
        "",
        "POST"
      );
      apiRes = JSON.parse(apiRes);

      console.log("apires:", apiRes)

      if (apiRes?.data?.message === "Success") {
        const proposal_id = apiRes?.data?.data?.proposal_id;
        const count = await InsuranceProposalRd.count({
          ins_app_ref: insAppRef
        });
        if (!count) {
          await InsuranceProposal.create({
            ins_app_ref: insAppRef,
            proposal_ref_num: proposal_id,
          })
        } else {
          await InsuranceProposal.updateOne({
            ins_app_ref: insAppRef
          }).set({
            proposal_ref_num: proposal_id,
          })
        }
        return exits.success({
          insCharge: apiRes?.data?.data?.premium_value,
          gstCharge: apiRes?.data?.data?.gst_value,
        })
      } else {
        return exits.success({error: apiRes?.data?.error});
      }

    } catch (error) {
      console.log(error);
      result = error.message;

    }
  }

};
async function getAmount(amnt, unit) {
  if (unit == "Lakhs") return amnt * 100000;
  else if (unit == "Crores") return amnt * 10000000;
  else return amnt;
}
