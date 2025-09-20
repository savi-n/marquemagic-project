const accountTypeMap = {
  'Saving': 'Savings',
  'Current': 'Current',
  'CC': 'CC',
  'OD': 'Other'
}

module.exports = {


  friendlyName: 'Enach muthoot',


  description: '',


  inputs: {

    userId: {
      type: 'number',
      required: true
    },
    loanId: {
      type: 'number',
      required: true
    },
    finId: {
      type: 'number',
      required: true
    },
    directorId: {
      type: 'number',
      required: true
    },
    authMode: {
      type: 'string',
      required: true
    },

    firstCollectionDate: {
      type: 'string',
      required: true
    },
    vpa: {
      type: 'string',
      required: true
    },
    emi: {
      type: 'number',
      required: true
    },
    securityNach: {
      type: 'boolean'
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {

    try {
      const {loanId, finId, directorId, firstCollectionDate, authMode, emi, vpa} = inputs;

      const LoanFinancialsData = await LoanFinancialsRd.findOne({id: finId})
        .select(["loan_id", "bank_verification_status", "director_id", "account_number", "account_type", "IFSC", "account_holder_name", "bank_id", "enach_status", "enach_data", "security_enach_status", "security_enach_data"])

      if (!LoanFinancialsData) throw new Error("No data found for the given fin_id");

      if (LoanFinancialsData.loan_id != loanId) throw new Error("loan_id provided doesn't match with the loan_id of the LoanFinancials Table!")


      let enachData = LoanFinancialsData.enach_data;

      if (enachData?.id && LoanFinancialsData?.enach_status != 'cancelled') throw new Error("ENach has already been done for this finId")


      if (!directorId) throw new Error("Invalid Director Id");

      const directorData = await DirectorRd.findOne({id: directorId}).select(["demail", "dcontact"]);

      const url = sails.config.enach.muthoot.upi.createMandateURL,
        body = {
          auth_mode: authMode,
          customer_identifier: directorData.demail,
          mandate_type: 'create',
          vpa: vpa,
          customer_account_number: LoanFinancialsData.account_number,
          customer_account_type: accountTypeMap[LoanFinancialsData.account_type],
          customer_mobile: directorData.dcontact,
          customer_email: directorData.demail,
          customer_name: LoanFinancialsData.account_holder_name,
          customer_ref_number: "003",
          first_collection_date: firstCollectionDate,
          //  frequency: 'Monthly',
          instrument_type: "debit",
          maximum_amount: emi,
          scheme_ref_number: finId
        },
        headers = {

        },
        method = 'POST';

      const apiRes = await sails.helpers.axiosApiCall(url, body, headers, method);

      //save in DB
      enachData = {
        ...apiRes?.data
      }


      await LoanFinancials.updateOne({id: finId}).set({
        enach_data: enachData,
        enach_status: 'initiated'
      });


      if (!apiRes?.data?.id && !apiRes.data?.mandate_id) {

        await LoanFinancials.updateOne({id: finId}).set({
          enach_status: 'failed'
        });

        if (apiRes?.data?.message) throw new Error(apiRes?.data?.message);

        throw new Error("Failed to generate Mandate!");
      }

      await LoanAdditionalData.updateOne({loan_id: loanId}).set({
        enach_mode: 'upi'
      });

      exits.success({
        status: "ok",
        message: "Mandate generated successfully! Mandate Link has been sent to your registered mobile number"
      });

    } catch (error) {

      return exits.success({
        status: "nok",
        message: error.message
      });

    }

  }


};
