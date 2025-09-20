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

// const isParsable = (data) => {
//   let parsedData;
//   try {
//     parsedData = JSON.parse(data);
//     return parsedData;
//   } catch (err) {
//     return false;
//   }
// }

module.exports = {


  friendlyName: 'Sanction validation',


  description: '',


  inputs: {
    loanId: {
      type: "number",
      required: true
    },
    loanProductId: {
      type: "number",
      requred: true
    }
  },



  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const {loanId, loanProductId} = inputs;

    let is_sanction_doc_pending, udyam_validation_error, directorData, loanData;

    /* Put sanction doc upload validation */
    let loanProductsRecord = await LoanProductsRd.findOne({id: loanProductId}).select([
      "additional_conditions"
    ]);

    let mandatoryDocTypeIds = [], mandatoryCheck, message = "validation completed successfully", status = "ok";

    if (loanProductsRecord &&
      loanProductsRecord.additional_conditions &&
      loanProductsRecord.additional_conditions.data.lender_document &&
      (mandatoryCheck = loanProductsRecord.additional_conditions.data.lender_document.mandatory_check)) {
      console.log(mandatoryCheck)
      mandatoryCheck.forEach(curElm => {
        if (curElm.mandatory) mandatoryDocTypeIds.push(curElm.doc_type_id);
      })
      console.log(mandatoryDocTypeIds);
    }

    // const udyamVerificationCondition = loanProductsRecord?.additional_conditions?.data?.udyam_verification?.mandatory || false
    // const udyamNumberPresentCondition = loanProductsRecord?.additional_conditions?.data?.udyam_number_present?.mandatory || false

    // const ucicVerificationCondition = loanProductsRecord?.additional_conditions?.data?.ucic_verification?.mandatory || false
    // const ucicMandateDate = loanProductsRecord?.additional_conditions?.data?.ucic_verification?.date || false

    // if (loanProductsRecord &&
    //   loanProductsRecord.dynamic_forms &&
    //   loanProductsRecord.dynamic_forms.onsite_verification) {
    //   /* get all the mandatory doc_type_ids. */

    //   loanProductsRecord.dynamic_forms.onsite_verification.sub_sections.forEach(curElm => {
    //     if (curElm.id.includes("onsite_verification")) {
    //       const fieldsArr = curElm.fields;
    //       fieldsArr.forEach(curObj => {
    //         /* As of now doc_type_ids need to be taken for only bbms */
    //         if (curObj.name === "onsite_verification_bbm" &&
    //           curObj.rules.required) mandatoryDocTypeIds.push(curObj.doc_type_id);
    //       });
    //     }
    //   });

    if (mandatoryDocTypeIds.length) {
      /* If the mandatory doctype is uploaded in lenderdocument table then we should allow to progress */
      const lenderDocs = await LenderDocumentRd.find({loan: loanId, doc_type: mandatoryDocTypeIds, status: "active"}).select("doc_type");

      const allDocsUploaded = validateDocUpload(mandatoryDocTypeIds, lenderDocs);

      if (!allDocsUploaded) {
        is_sanction_doc_pending = true;
        status = "nok";
        message = loanProductsRecord.additional_conditions.data.lender_document.error_message;
      }
      else is_on_site_verification_pending = false;
    }

    if (!is_sanction_doc_pending) {
      loanData = await LoanrequestRd.findOne({id: loanId}).select(["business_id", "RequestDate"]);
      directorData = await Director.find({business: loanData.business_id, status: "active"});
      // ucicDateCondition = JSON.stringify(new Date(loanData.RequestDate)).slice(1, 11) > ucicMandateDate;
    }

    // if (!is_sanction_doc_pending && ucicVerificationCondition && ucicDateCondition) {
    //   let ucicCompleted = directorData.every(obj => obj.additional_cust_id !== null && obj.additional_cust_id !== '')
    //   if (!ucicCompleted) {
    //     status = "nok";
    //     message = loanProductsRecord.additional_conditions.data.ucic_verification.error_message;
    //     ucic_validation_error = true
    //   }
    // }

    // if (!is_sanction_doc_pending && udyamVerificationCondition) {
    //   if (udyamNumberPresentCondition) {
    //     let udyamNumberPresent = directorData.every(obj => {
    //       if (obj.income_type !== "business") return true;
    //       if (obj.income_type == "business" &&
    //         obj.udyam_number) return true;
    //       else return false
    //     });
    //     if (!udyamNumberPresent) {
    //       status = "nok";
    //       message = loanProductsRecord.additional_conditions.data.udyam_number_present.error_message;
    //       udyam_validation_error = true
    //     }
    //   } else {
    //     let udyamCompleted = directorData.every(obj => {
    //       if (obj.income_type !== "business") return true;
    //       if (obj.income_type == "business" &&
    //         obj.udyam_response &&
    //         obj.udyam_number &&
    //         JSON.parse(obj.udyam_response)?.data &&
    //         isParsable(JSON.parse(obj.udyam_response)?.data)?.udyamNumber) return true;
    //       else return false
    //     });
    //     if (!udyamCompleted) {
    //       status = "nok";
    //       message = loanProductsRecord.additional_conditions.data.udyam_verification.error_message;
    //       udyam_validation_error = true
    //     }
    //   }
    // }

    return exits.success({status, message, is_sanction_doc_pending, udyam_validation_error});
  }

}
