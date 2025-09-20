module.exports = {


  friendlyName: 'Get finnone status',


  description: '',

  inputs: {
    loanId: {
      type: "number",
      required: true
    },
    disbursementId: {
      type: "number",
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Finnone status',
    },

  },


  fn: async function (inputs, exits) {
    const failureStages = {
      customerCreation: {
        name: 'Create Customer',
        modification: sails.config.finnone.modifications.customerCreation
      },
      collateralCreation: {
        name: 'Create Collateral',
        modification: sails.config.finnone.modifications.collateralCreation
      },
      imdCreation: {
        name: 'IMD Receipt Generation',
        modification: sails.config.finnone.modifications.imdCreation
      },
      loanCreation: {
        name: 'Loan Creation',
        modification: sails.config.finnone.modifications.loanCreation
      },
      mandateTransfer: {
        name: 'Mandate Transfer',
        modification: sails.config.finnone.modifications?.mandateTransfer
      },
      documentUpload: {
        name: 'Document Upload and Tagging',
        modification: sails.config.finnone.modifications.documentUpload
      }

    };

    try {

      const {loanId, disbursementId} = inputs;

      const {application_ref, loan_ref_id, business_id} = await LoanrequestRd.findOne({
        id: loanId
      }).select(["application_ref", "loan_ref_id", "business_id"]);

      const {userid} = await BusinessRd.findOne({
        id: business_id
      }).select("userid");

      // getting all the database columns which look like 'disbursalCreation'
      let stagesArray = await LosIntegrationsRd.find({
        loan_id: loanId,
      }).select(['request_type', 'request_status'])
        .sort("id asc");

      //removing duplicate request types with same name and reformatting the structure of the array
      stagesArray = getDistinctRequestTypes(stagesArray, failureStages);

      for (let i = 0; i < stagesArray.length; i++) {

        response = await getStageStatus(loanId, loan_ref_id, stagesArray[i], application_ref, disbursementId, userid, failureStages);
        if (response.failureFlag) return exits.success([200, response])

      }

      return exits.success([200, response]);

    } catch (error) {
      return exits.success([400, {message: error.message || JSON.stringify(error)}]);
    }
  }

}

//finds the status for the particular stage that is passed to it
//tells whether this stage succeded or failed in form of successResponse and failureResponse
const getStageStatus = async (loanId, loan_ref_id, stage, application_ref, disbursementId, userid, failureStages) => {

  // if no response exists or if the request status is failed
  if (!stage.request_status || stage.request_status == "in-progress" || stage.request_status == "failed") {

    let options = {
      showTable: true,
      message: null
    };

    if (!stage.request_status || stage.request_status == "in-progress") {
      options.showTable = false;
      options.message = "The process is running in the background. Please come after some time to check the status!"
    }
    return failureResponse(loanId, loan_ref_id, stage, application_ref, disbursementId, userid, options, failureStages);
  };

  // check if the IMD is authorized or not. This is only for the imdCreation stage.
  if (stage.request_type == "imdCreation") {

    const imdResponse = await isIMDAuthorized(loanId);
    if (!imdResponse.showTable) {

      const options = {
        showTable: false,
        message: imdResponse.message
      };
      return failureResponse(loanId, loan_ref_id, stage, application_ref, disbursementId, userid, imdResponse, failureStages);

    }

  }

  // if the stage was successfull
  return successResponse(loanId, loan_ref_id, stage, application_ref, disbursementId, userid, failureStages);

}

const failureResponse = (loanId, loan_ref_id, stage, application_ref, disbursementId, userid, options, failureStages) => {
  return {
    status: "ok",
    statusCode: 200,
    data: {
      loanRefId: loan_ref_id,
      loanId,
      finnoneAccNum: application_ref,
      disbursementId: disbursementId,
      disbursementCreationStatus: "Pending",
      stage: stage.request_type,
      failureStage: failureStages[stage.request_type].name,
      table: options.showTable ? {
        failureStage: failureStages[stage.request_type].name,
        failureJson: {
          filename: `Finnone_${stage.request_type}_${loan_ref_id}.json`,
          userid: userid,
          loanId: loanId
        },
        modification: failureStages[stage.request_type].modification,
        action: "re-trigger"
      } : null,
      message: options.message
    },
    failureFlag: true
  }
}

const successResponse = (loanId, loan_ref_id, stage, application_ref, disbursementId, userid, failureStages) => {
  return {
    status: "ok",
    statusCode: 200,
    data: {
      loanRefId: loan_ref_id,
      loanId,
      finnoneAccNum: application_ref,
      disbursementId: disbursementId,
      disbursementCreationStatus: "Successfull",
      table: null,
      message: stage.request_type == 'documentUpload'
        ? 'Disbursal 1 pushed to finnone successfully'
        : `Disbursal ${stage.request_type[stage.request_type.length - 1]} pushed to finnone successfully!`
    }

  }
}

//to help figure out if the IMD is authorized or not
const isIMDAuthorized = async (loanId) => {

  const imdData = await IMDDetailsRd.find({
    loan_id: loanId
  }).select(["receipt_autorization", "receipt_reference"]).sort("id desc").limit(1);

  if (imdData[0] && imdData[0].receipt_autorization && imdData[0].receipt_autorization == 'required') {
    return {
      showTable: false,
      message: `Please Authorize this IMD Receipt ${imdData[0].receipt_reference}. If already authorized, come back after sometime to check the status!`
    };
  }

  return {
    showTable: true,
    message: null
  };

}

//gives the distinct request types for the disburalCreation stages
const getDistinctRequestTypes = (stagesArray, failureStages) => {

  const distinctMap = {};
  const distinctArray = [];

  for (const stage of stagesArray) {
    distinctMap[stage.request_type] = stage;
  }

  const failureStageKeys = Object.keys(failureStages);
  const distinctMapKeys = Object.keys(distinctMap);

  for (key of failureStageKeys) {
    if (distinctMap[key]) distinctArray.push(distinctMap[key]);
    else distinctArray.push({
      request_type: key,
      request_status: null
    })
  }

  //these are just the main five stages that will be there for sure


  //disbursal creation stages will be added here

  //move forward only if there are 5 stages added before

  const disbursalCreationStagesArray = distinctMapKeys.filter(item => item.match('disbursalCreation')).sort();
  updateFailureStagesObject(disbursalCreationStagesArray, failureStages);
  for (stage of disbursalCreationStagesArray) {
    if (distinctMap[stage]) {
      distinctArray.push(distinctMap[stage]);
    }
  }

  return distinctArray;

}

//updates the const failureStages object defined in the beginning to add fields like
//disbursalCreation2, disbursalCreation3 because those fields are dynamic and cannot be predefined like the other fields
const updateFailureStagesObject = (disbursalCreationStagesArray, failureStages) => {


  for (disbursalStage of disbursalCreationStagesArray) {
    failureStages[disbursalStage] = {
      name: disbursalStage,
      modification: sails.config.finnone.modifications.disbursalCreation
    }
  }

}
