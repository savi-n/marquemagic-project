const axios = require("axios");

module.exports = {


  friendlyName: 'Get additional ins data',


  description: '',


  inputs: {
    userId: {
      type: "number",
      required: true
    },
    loanRefId: {
      type: "string",
      required: true
    },
    authorization: {
      type: "string",
      required: true
    },
    directorId: {
      type: "number",
      required: true
    },
    insAppRef: {
      type: "number",
      required: true
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Additional ins data',
    },

  },


  fn: async function (inputs, exits) {
    const {userId, loanRefId, authorization, directorId, insAppRef} = inputs;

    const s3Url = `${sails.config.insurance.urls.s3Data}?user_id=${userId}&loan_ref_id=${loanRefId}&form_name=detail.json`

    let s3Data = await axios({
      method: 'get',
      url: s3Url,
      headers: {
        "content-type": "application/json",
        "Authorization": authorization
      }
    });

    let tragetObj = [];

    s3Data = s3Data.data.data;

    for (data of s3Data) {
      if (data.directorId === directorId) {
        tragetObj = data?.insurances;
        break;
      }
    }

    let additionalData;
    for (obj of tragetObj) {
      //if (additionalData) break;
      for (applicant of obj?.insuredApplicants) {
        if (applicant?.id == insAppRef) {
          additionalData = obj;
          break;
        }
      }
    }


    exits.success(additionalData);

  }
};
