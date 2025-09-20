const momentIndia = require("moment-timezone");
module.exports = {


  friendlyName: 'Tata gemi payment',


  description: '',


  inputs: {
    insuredApplicant: {
      type: "ref",
      required: true
    }, loanId: {
      type: "number"
    },
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    // const insAppRef = inputs.insAppRef;
    const loanId = inputs.loanId;
    const insuredApplicant = inputs.insuredApplicant
    const payment_id = await InsuranceProposal.findOne({
      ins_app_ref: insuredApplicant.id
    }).select("status_message")
    const applicant = await Director.findOne({id: insuredApplicant.applicant_did});
    const date = new Date(),
      policyStartDate = momentIndia(date)
        .tz("Asia/Kolkata")
        .subtract(12, "minute")
        .format("YYYY-MM-DD")
        .toString();
    const randomValue = await generateRandomValue();
    const payload =
    {
      "payment_id": `${payment_id.status_message}`,
      "producer_code": "2356454652",
      "office_location_code": "lcode",
      "office_location_name": "lname",
      "policy_start_date": `${policyStartDate}`,
      "payment_amount": `${insuredApplicant.ins_charge}`,
      "pan_no": `${applicant.dpancard}`,
      "payer_type": "customer",
      "payer_id": "atest1233",
      "payer_name": "test",
      "payer_relationship": "",
      "consumerAppTransId": "ct12345Ashit1",
      "transactionStatus": "Success",
      "gateway_txn_id": `${randomValue}`,
      "txn_start_time": "2024-06-21 07:09:00"
    }

    const response = await sails.helpers.axiosApiCall(
      sails.config.insurance.tatagemi.urls.payment,
      {
        payload,
        loan_id: loanId
      },
      {"content-type": "application/json"},
      "post"
    );

    const apiRes = response?.data?.message;

    console.log(apiRes)
    await InsuranceProposal.updateOne({
      ins_app_ref: insuredApplicant?.id
    }).set({
      status: apiRes?.payment_stage
    })

    exits.success({data: response?.data})
  }


};
async function generateRandomValue(length = 12) {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
