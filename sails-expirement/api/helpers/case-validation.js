function validateDocUpload(mandatoryDocTypeIds, lenderDocs) {
  const docsMap = new Map();

  mandatoryDocTypeIds.forEach(curId => {
    docsMap.set(curId, false);
  });

  lenderDocs.forEach(curDoc => {
    if (!(docsMap.get(curDoc.doc_type) == undefined)) docsMap.set(curDoc.doc_type, true);
  });

  let flag = true;

  for (let i = 0; i < mandatoryDocTypeIds.length; i++) {
    if (!docsMap.get(mandatoryDocTypeIds[i])) {
      flag = false;
      break;
    }
  }

  return flag;

}

const axios = require('axios');

module.exports = {


  friendlyName: 'Case validation',


  description: '',


  inputs: {
    loanId: {
      type: "number",
      required: true
    },
    loanProductId: {
      type: "number",
      requred: true
    },
    validation_type : {
      type : "string",
      required : false
    },
    user_id : {
      type: "number",
      requred: true
    },
    authorization: {
      type: "string",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const {loanId, loanProductId, validation_type, user_id, authorization} = inputs;

    let is_imd_pending, is_on_site_verification_pending, message = "validation completed successfully", status = "ok", is_deviation_pending = false;

    /* Put imd and onsite verificatoin check below */
    let loanProductsRecord = await LoanProductsRd.findOne({id: loanProductId}).select([
      "additional_conditions",
      "dynamic_forms"
    ]);


    if (validation_type === "initiate" && loanProductsRecord &&
      loanProductsRecord.additional_conditions &&
      Object.keys(loanProductsRecord.additional_conditions).length > 0 &&
      loanProductsRecord.additional_conditions.data &&
      loanProductsRecord.additional_conditions.data.imd_data &&
      loanProductsRecord.additional_conditions.data.imd_data.mandatory) {
      const imdRecord = await IMDDetailsRd.findOne({loan_id: loanId});

      const loanRequestData = await LoanrequestRd.findOne({
        id: loanId
      }).select(["loan_ref_id", "white_label_id", "RequestDate"]);

      if(imdRecord.imd_collected == "Deferred"){

        const url = `${sails.config.cashFree.deviation_url}?loan_ref_id=${loanRequestData?.loan_ref_id}`;
        const headers = {
          'Authorization': authorization
        },
        method = 'GET',
        options = {
          url,
          headers,
          method
        };
        try {
          const apiRes = await axios(options);

          if (apiRes?.data?.status == "ok") {

            if(Array.isArray(apiRes?.data?.data)){

              let imdDeviation = false;
              for (item of apiRes?.data?.data){

                if(item.title == 'IMD Deferred'){
                  imdDeviation = true;
                  if (item.overall_status != 'Approved'){

                    is_imd_pending = true;
                    status = "nok";
                    message = "Please approve IMD deviation";
                    is_deviation_pending = true;

                  }
                  else is_imd_pending = false;

                }

              }
              if(!imdDeviation){

                is_imd_pending = true;
                status = "nok";
                message = apiRes?.data?.message || "No deviation found for IMD"

              }

            }
            else{

              is_imd_pending = true;
              status = "nok";
              message = apiRes?.data?.message || "Failed to get deviation Information"

            }

          }
          else {

            is_imd_pending = true;
            status = "nok";
            message = apiRes?.data?.message || "Failed to get Deviation information"

          }

        } catch (error) {
          is_imd_pending = true;
          status = "nok";
          message = error?.response?.data?.message || error.message || "Failed to get deviation information"
        }

      }
      else if (imdRecord.imd_collected !== "Yes") {
        is_imd_pending = true;
        status = "nok";
        message = loanProductsRecord.additional_conditions.data.imd_data.error_message ||
          "IMD Details has not been captured  for this application. Please ensure IMD details are captured before processing the application";
      }
      else if(imdRecord.imd_collected == "Yes" && sails.config.cashFree.allowed_white_label_id.includes(Number(loanRequestData?.white_label_id))){

        if(imdRecord?.payment_mode == 'Online'){

          const payment = await CustomerPaymentRd.findOne({
            reference_no: imdRecord?.transaction_reference
          });

          const loan_document_details =
            imdRecord && Object.keys(imdRecord).length > 0
              ? await LoanDocumentRd.findOne({id: imdRecord.doc_id, status: "active"})
              : null;

          if(payment?.status != "Complete"){
            is_imd_pending = true;
            status = "nok";
            message = "Please complete the payment before proceeding";
          }
          else if(!loan_document_details){
            is_imd_pending = true;
            status = "nok";
            message = "Please upload the IMD document before proceeding";
          }
          else{
            is_imd_pending = false;
          }
        }
        else{
          is_imd_pending = false;
        }

      }
      else is_imd_pending = false;
    }

    if (is_imd_pending) return exits.success({status, message, is_imd_pending, is_on_site_verification_pending, is_deviation_pending});

    const mandatoryDocTypeIds = [];

    if (loanProductsRecord &&
      loanProductsRecord.dynamic_forms &&
      loanProductsRecord.dynamic_forms.onsite_verification) {
      /* get all the mandatory doc_type_ids. */

      loanProductsRecord.dynamic_forms.onsite_verification.sub_sections.forEach(curElm => {
        if (curElm.id.includes("onsite_verification")) {
          const fieldsArr = curElm.fields;
          fieldsArr.forEach(curObj => {
            /* As of now doc_type_ids need to be taken for only bbms */
            if (validation_type === "initiate"){
              if (curObj.name === "onsite_verification_bbm" &&
                curObj.rules.required) mandatoryDocTypeIds.push(curObj.doc_type_id);

                if (curObj.name === "onsite_selfie_applicant_bbm" &&
                curObj.rules.required) mandatoryDocTypeIds.push(curObj.doc_type_id);
            }
            if (validation_type === "give_offer") {
              if (curObj.name === "onsite_selfie_applicant_co_cm" &&
              curObj.rules.required) mandatoryDocTypeIds.push(curObj.doc_type_id);

              if (curObj.name === "onsite_verification_co_cm" &&
                curObj.rules.required) mandatoryDocTypeIds.push(curObj.doc_type_id);
            }
            if (validation_type === "external"){
              if (curObj.name === "onsite_verification_external" &&
                curObj.rules.required) mandatoryDocTypeIds.push(curObj.doc_type_id);
            }
          });
        }
      });

      if (mandatoryDocTypeIds.length) {
        /* If the mandatory doctype is uploaded in lenderdocument table then we should allow to progress */
        const lenderDocs = await LenderDocumentRd.find({loan: loanId, doc_type: mandatoryDocTypeIds, status: "active", uploaded_by : user_id}).select("doc_type");

        const allDocsUploaded = validateDocUpload(mandatoryDocTypeIds, lenderDocs);

        if (!allDocsUploaded) {
          is_on_site_verification_pending = true;
          status = "nok";
          message = loanProductsRecord.dynamic_forms.onsite_verification.error_message || "On-site Verification Not Completed!";
        }
        else is_on_site_verification_pending = false;
      }
    }

    return exits.success({status, message, is_imd_pending, is_on_site_verification_pending});
  }


};
