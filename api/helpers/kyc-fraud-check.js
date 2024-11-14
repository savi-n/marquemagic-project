module.exports = {


  friendlyName: 'Kyc fraud check',


  description: 'This is to check forgery in the uploaded document',


  inputs: {
    reqPayload: {
      type: 'ref',
      required: true
    },

    originalDocName: {
      type: 'string',
      required: true
    },

    requestId: {
      type: 'string',
      required: true
    },

    caseNo: {
      type: 'string'
    }

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {

    let { reqPayload, originalDocName, requestId } = inputs;
    /* Add uniqueId and callback url to the request payload for ML api */
    reqPayload.unique_id = requestId;
    console.log(requestId);
    //let { req_type: inputReqType } = reqPayload;
    reqPayload.callback_urls = {
      updateData: `${sails.config.hostName}/${sails.config.forensic.callback.updateData}`,
      updateImageLoc: `${sails.config.hostName}/${sails.config.forensic.callback.updateImageLoc}`
    };

    reqPayload.originalDocName = originalDocName;

    const { doc_name, s3bucket, user_id, region, cloud } = reqPayload;
    const filePath = `${s3bucket}/users_${user_id}`;

    let curDate = await sails.helpers.dateTime();
    await RequestDocument.update({ request_id: requestId }).set({
      updated_at: curDate,
      response: JSON.stringify({ forensicData: { doc_name: originalDocName } }),
      s3_name: JSON.stringify({ main: s3bucket }),
      s3_region: JSON.stringify({ main: region }),
      cloud: JSON.stringify({ main: cloud }),
      s3_filepath: JSON.stringify({ main: `${filePath}/${doc_name}` })
    });

    let iniTime = Date.now();

    console.log("forensicPaylod=> ", reqPayload);

    let forensicApiRes = await sails.helpers.apiTrigger(
      sails.config.forensic.url_image,
      JSON.stringify(reqPayload),
      { "content-type": "application/json" },
      'POST'
    );

    let endTime = Date.now();
    console.log('forensicTime=>', (endTime - iniTime) / 1000);
    console.log('forensicApiRes=>', forensicApiRes);

    let forensicData;
    try {
      forensicData = JSON.parse(forensicApiRes);
      /* Create promise. 
      Once success status is stored in db by ML team it'll get resolved.
      If it doesn't resolve inside 50 seconds reject it. */
      if (forensicData.Status === 'success') {

        // return exits.success([200, {
        //   status: 'ok',
        //   statusCode: 'NC200',
        //   resCode: 'SUCCESS',
        //   message: `SUCCESS`,
        //   forensicData
        // }]);

        // let getForensicData = new Promise((resolve, reject) => {
        //   let i = 0, noOfPages, processStatus;

        //   const interval = setInterval(async () => {
        //     /* Get data from database */
        //     let storedRecord = await RequestDocument.findOne({
        //       select: ['response', 's3_filepath'],
        //       where: { request_id: requestId }
        //     });

        //     let storedData = JSON.parse(storedRecord.response);
        //     if (processStatus !== 'inprogress') {
        //       s3_filepath = JSON.parse(storedRecord.s3_filepath);
        //       if (s3_filepath) noOfPages = s3_filepath.noOfPages;
        //     }
        //     if (noOfPages && noOfPages > 2) {
        //       clearInterval(interval);
        //       reject([400, 'MORETHAN2PAGES']);
        //     } else if (processStatus !== 'inprogress' && noOfPages && noOfPages <= 2) {
        //       /* set the request status as in progress */
        //       processStatus = 'inprogress';
        //     }


        //     /* Check if status is success and result exists */
        //     if (storedData.forensicData && storedData.forensicData.Status) {
        //       if (storedData.forensicData.Status === 'success' && processStatus === 'inprogress') {
        //         clearInterval(interval);
        //         resolve(storedData.forensicData);
        //       } else if (storedData.forensicData.Status === 'failed') {
        //         clearInterval(interval);
        //         if (storedData.forensicData.res_code === 'MORETHAN2PAGES') reject([400, 'MORETHAN2PAGES']);
        //         reject([502, 'PROCESSFAILED']);
        //       }
        //     }
        //     if (i >= 15) {
        //       clearInterval(interval);
        //       if (processStatus === 'inprogress') reject([200, 'TIMEEXCEED']);
        //       else reject([502, 'PROCESSFAILED']);
        //     }
        //     i++;
        //   }, 2000);
        // });

        // forensicData = await getForensicData;

        /* check whether request type matches or not */
        // let Document_type = (forensicData.Result[0] && forensicData.Result[0].Document_type) ? forensicData.Result[0].Document_type : undefined;
        // if (Document_type && Document_type !== 'Others' && inputReqType !== 'others') {
        //   if (inputReqType === 'license') inputReqType = 'DL';
        //   if (inputReqType === 'voter') inputReqType = 'VoterID';

        //   if (inputReqType.toUpperCase() !== Document_type.toUpperCase()) {
        //     if (inputReqType === 'pan') inputReqType = 'PAN';
        //     else if (inputReqType === 'aadhar') inputReqType = 'Aadhaar';
        //     else if (inputReqType === 'VoterID') inputReqType = 'Voter ID';
        //     else if (inputReqType === 'passport') inputReqType = 'Passport';
        //     else if (inputReqType === 'license') inputReqType = 'DL';
        //     return exits.success([400, {
        //       status: 'nok',
        //       statusCode: 'NC400',
        //       resCode: 'REQ_TYPE_MISMATCH',
        //       message: `Uploaded document is not ${inputReqType}. Please upload correct document.`
        //     }])
        //   }
        // }

      } else {
        if (forensicData.res_code === "MORETHAN2PAGES") throw [400, 'MORETHAN2PAGES'];
      }

      console.log(forensicData);

      /* Restructure forensicData */
      forensicData = {
        Status: forensicData.Status,
        unique_id: requestId,
        doc_name: originalDocName,
        ref_no: inputs.caseNo,
        forge_score: forensicData.forge_score,
        confidence: forensicData.confidence,
        forge_result: forensicData.forged_result,
        no_of_pages: forensicData.no_of_pages,
        Result: Array.isArray(forensicData.Result) ? forensicData.Result : [forensicData.Result],
        image_processing: forensicData.image_processing
      }

      /* The froensicData Result key comes as a string from ML on failure cases. Handling it making it an object for failure cases too */
      if (forensicData.Status !== 'success') forensicData.Result = { message: forensicData.Result };

      /* Generate download link */

      // const linkValidFor = 60 * 60 * 24 * 6.5; //Link is valid for 6 and a half days
      // const downloadLinkMain = await sails.helpers.getS3ImageUrl(doc_name, filePath, region, isAws, linkValidFor);

      /* Store the response */

      await RequestDocument.update({ request_id: requestId }).set({
        response: JSON.stringify({ forensicData }),
        file_processing: 'inprogress'
      })

      let response = {
        status: 'ok',
        statusCode: 'NC200',
        resCode: 'SUCCESS',
        message: 'Successfully fetched data',
        forensicData
      }

      await ClientRequest.update({ request_id: requestId }).set({
        req_status: "completed"
      })

      return exits.success([200, response]);
    } catch (err) {
      console.log(err);
      let statusCode, resCode;
      if (err[0] && err[1]) { statusCode = `NC${err[0]}`, resCode = err[1]; }
      if (resCode === 'TIMEEXCEED') {
        return exits.success([err[0], {
          status: 'ok',
          statusCode,
          resCode,
          message: `Forensic process taking longer than expected. Data should be visible in history shortly.`
        }]);
      } else if (resCode === 'MORETHAN2PAGES') {
        return exits.success([err[0], {
          status: 'nok',
          statusCode,
          resCode,
          message: `File with more than 2 pages is not accepted.`
        }]);
      } else if (resCode === 'PROCESSFAILED') {
        return exits.success([err[0], {
          status: 'nok',
          statusCode,
          resCode,
          message: `Process failed. Please try again.`
        }]);
      } else {
        return exits.success([502, {
          status: 'nok',
          statusCode: 'NC502',
          resCode: 'BAD_GATEWAY',
          message: `Server error. Bad gateway`
        }]);
      }
    }
  }


};

