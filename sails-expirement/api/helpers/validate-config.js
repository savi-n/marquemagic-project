module.exports = {


  friendlyName: 'Validates whether the configuration for this request matches with the configuration for specified Penny Drop loan',


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
      const {userId, loanId, securityNach} = inputs;

      const userData = await UsersRd.findOne({id: userId}).select(["usertype", "user_sub_type"]),
        userType = userData?.usertype;
        let userSubType = userData?.user_sub_type;

      if (!userType) throw new Error("User does not exist");

      if(!userSubType) userSubType = null;
      const allowedUsers = sails.config.enach.muthoot.allowedUsers;

      if (!allowedUsers.includes(`${userType}:${userSubType}`)) throw new Error("This type of User is not allowed for this loan");

      // validation for stage of the loan, product_type and white_lable_id

      const loanRequestData = await LoanrequestRd.findOne({id: loanId}).select(["loan_status_id", "loan_sub_status_id", "white_label_id", "loan_product_id"]);
      let {loan_status_id: status1, loan_sub_status_id: status2, white_label_id: whiteLabelId} = loanRequestData
      if (!whiteLabelId || !sails.config.enach.muthoot.allowedWhiteLabelIds.includes(parseInt(whiteLabelId))) {

        throw new Error("White Label Id Not Allowed");

      }

      if (!loanRequestData?.loan_product_id || !sails.config.enach.muthoot.allowedProducts.includes(loanRequestData?.loan_product_id)) {
        throw new Error("This product_id is not allowed");
      }
      if (status1 == undefined) status1 = null;
      if (status2 == undefined) status2 = null;

      const loanBankMappingData = (await LoanBankMappingRd.find({loan_id: loanId}).select(["loan_bank_status", "loan_borrower_status"]).sort("id desc").limit(1))[0];

      let status3 = null, status4 = null;
      if (loanBankMappingData) {

        const {loan_bank_status, loan_borrower_status} = loanBankMappingData;
        status3 = loan_bank_status;
        status4 = loan_borrower_status;
        if (!status3) status3 = null;
        if (!status4) status4 = null;

      }

      // firstly check whether the stages are correct or not
      if (!sails.config.enach.muthoot.allowedStages.includes(`${status1} ${status2} ${status3} ${status4}`))

        throw new Error("The current stage is not allowed for Enach");

      //later check the sub-statuses of the Sanction/Disbursed Stage if it is "In-Principle Sanction" or not

      if (sails.config.enach.muthoot.sanctionDisbursedStage == `${status1} ${status2} ${status3} ${status4}`) {

        const loanSanctionData = await LoanSanctionRd.findOne({loan_id: loanId}).select("sanction_status");
        const {sanction_status: sanctionStatus} = loanSanctionData;
        if (sanctionStatus != undefined && sanctionStatus != 'In-Principle Sanction') {

          throw new Error("The loan is not in In-Principle Sanction stage");

        }

      }

      const enachStatus = await LoanAdditionalDataRd.findOne({loan_id: loanId}).select(["enach_mode"]),
        dateTime = await sails.helpers.dateTime();
      if (!enachStatus) {
        await LoanAdditionalData.create({
          white_label_id: whiteLabelId,
          loan_id: loanId,
          ints: dateTime,
          upts: dateTime
        });
      }

      if (enachStatus && enachStatus.enach_mode && !securityNach) throw new Error("Enach has already been done for this loan_id");

      // if (enachStatus && !enachStatus.enach_mode) {

      //   const loanFinancialsData = await LoanFinancialsRd.find({
      //     loan_id: loanId,
      //     and: [
      //       {enach_status: {'!=': null}},
      //       {enach_status: {'!=': ''}}
      //     ]
      //   }).select("loan_id");

      //   if (loanFinancialsData && loanFinancialsData.length > 0 && loanFinancialsData[0].enach_status != 'failed') throw new Error("Enach has already been done for this loan_id");
      // }

      return exits.success({
        status: true,
        message: "success"
      });

    } catch (error) {
      return exits.success({
        status: false,
        message: error.message
      });


    }

  }

}
