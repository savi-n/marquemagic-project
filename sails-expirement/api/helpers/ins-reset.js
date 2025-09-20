const defaultInsData = {
  insurance_company1: null,
  insurance_company2: null,
  insurance_company3: null,
  insurance_company4: null,
  insurance_company5: null,
  insurance_company6: null,
  insurance_company7: null,
  insurance_company8: null,
  fee1: null,
  fee2: null,
  fee3: null,
  fee4: null,
  fee5: null,
  fee6: null,
  fee7: null,
  fee8: null
}

module.exports = {


  friendlyName: 'Insurance Reset',
  description: 'Reset the insurance and insurance deviation records for a given loan_id.',


  inputs: {
    loanId: {
      type: 'number',
      required: true,
      description: 'The ID of the loan to reset insurance records for.'
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    try {
      const loanId = inputs.loanId;

      const insData = await Insurance.count({loan_id: loanId, record_status: 'active'});
      const insDevData = await InsuranceDeviation.count({
        loan_id: loanId,
        record_status: 'active',
        status: 'not-required'
      });

      if (insData === 0 && insDevData === 0) {
        throw new Error(`LoanId: ${loanId} not found`);
      }

      if (insDevData > 0) {
        await InsuranceDeviation.update({
          loan_id: loanId,
          record_status: 'active',
          status: 'not-required'
        }).set({record_status: 'inactive'});
      }
      if (insData > 0 && insDevData > 0) {
        await Insurance.update({loan_id: loanId, record_status: 'active'}).set({record_status: 'inactive'});

        await LoanBankMapping
          .update({loan_id: loanId})
          .set({...defaultInsData});

        await LoanSanction
          .update({loan_id: loanId})
          .set({...defaultInsData});
      }

      return exits.success(`Loan_id: ${loanId} set to inactive successfully`);
    } catch (error) {
      return exits.error(error);
    }
  }


};
