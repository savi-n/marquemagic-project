module.exports = {


  friendlyName: 'Green channel condition',


  description: 'Helper to classify a green channel loan',


  inputs: {
    loanId: {
      type: 'number',
      required: true
    },
    whiteLabelId: {
      type: 'number',
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    exits.success()
    try {
      const loanAdditionalData = await LoanAdditionalDataRd.find({loan_id: inputs.loanId}).sort("id DESC").limit(1);
      if (!loanAdditionalData.length) return;

      const whiteLabelData = await WhiteLabelSolutionRd.findOne({id: inputs.whiteLabelId}).select("assignment_type");
      if (whiteLabelData.assignment_type) {
        const green_flag_conditions = whiteLabelData.assignment_type?.green_channel_indicator?.fifo_order
        if (green_flag_conditions) {
          const condition1 = green_flag_conditions[0]
          const condition2 = green_flag_conditions[1]

          const loanRequestData = await LoanrequestRd.findOne({id: inputs.loanId}).select("loan_amount", "business_id").populate("business_id");
          const directorData = await DirectorRd.findOne({business: loanRequestData.business_id.id, isApplicant: 1}).select(["gender", "dcibil_score", "ddob"])

          if (!directorData) return;

          let green_flag = 0
          if (!(loanRequestData.loan_amount >= condition1.equal_greater_loan_amount)) green_flag++
          else {
            if (condition1.businesstype && loanRequestData.business_id.businesstype != condition1.businesstype) green_flag++
            if (condition1.equal_greater_dcibil_score && !(directorData.dcibil_score >= condition1.equal_greater_dcibil_score)) green_flag++
            if (condition1.gender && !(directorData.gender == condition1.gender)) green_flag++
            if (condition1.equal_greater_dob && !(new Date(directorData.ddob) >= new Date(condition1.equal_greater_dob))) green_flag++
          }
          if (green_flag > 0) {
            green_flag = 0
            if (!(loanRequestData.loan_amount < condition2.less_than_loan_amount)) green_flag++
            else {
              if (condition2.businesstype && loanRequestData.business_id.businesstype != condition2.businesstype) green_flag++
              if (condition2.equal_greater_dcibil_score && !(directorData.dcibil_score >= condition2.equal_greater_dcibil_score)) green_flag++
              if (condition2.gender && !(directorData.gender == condition2.gender)) green_flag++
              if (condition2.equal_greater_dob && !(new Date(directorData.ddob) >= new Date(condition2.equal_greater_dob))) green_flag++
            }
          }
          let channel_type = green_flag == 0 ? "Green" : "Normal";
          await LoanAdditionalData.updateOne({id: loanAdditionalData[0].id}).set({channel_type})
          return;
        }
      }
      return;
    }
    catch (err) {
      console.log("Green channel condition error", err.message)
    }
  }
};
