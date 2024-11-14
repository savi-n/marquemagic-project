module.exports = {


  friendlyName: 'Kyc extraction',


  description: 'Extraction of kyc data from uploaded document',


  inputs: {
    id: {
      type: 'string',
      required: true
    },
    reqType: {
      type: 'string',
      required: true
    },
    reqPayload: {
      type: 'ref',
      required: true
    },
    refId: {
      type: 'string'
    },
    tempUrl: {
      type: 'string'//this needs to be removed
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    console.log('entered extraction!');
    let url, statusCode, result, id = inputs.id, reqType = inputs.reqType, refId, apiResponse;

    if (
      reqType === 'pan' ||
      reqType === 'aadhar' ||
      reqType === 'passport' ||
      reqType === 'aadhar_redact') url = sails.config.kycExtraction.urls[reqType];
    else if (reqType === 'voter') url = sails.config.kycExtraction.urls.voterid;
    else if (reqType === 'license') url = sails.config.kycExtraction.urls.licence;


    inputs.reqPayload.req_type = inputs.reqType;
    if (!inputs.reqPayload.file_type) inputs.reqPayload.file_type = 'image';
    console.log(inputs.reqPayload, url);
    const apiTriggerTimeStamp = Date.now();
    apiResponse = await sails.helpers.apiTrigger(
      url,
      JSON.stringify(inputs.reqPayload),
      { "content-type": "application/json" },
      'POST'
    );
    const apiResponseTimeStamp = Date.now();
    console.log('got api response');
    console.log(apiResponse);

    let extractedData;
    try {
      if (typeof apiResponse === "string" && apiResponse != "") extractedData = JSON.parse(apiResponse);
      else extractedData = apiResponse;
      if (extractedData?.Cause === 'Extraction_Failed') extractedData.Status = 'success';
    } catch (err) {
      statusCode = 502, result = {
        status: 'nok',
        statusCode: 'NC502',
        message: `Unable to extract KYC Details from the uploaded document. Please upload a better quality document in portrait mode.`
      };
      exits.success([statusCode, result]);
      await sails.helpers.kycForensicTracker(
        sails.config.zohoCreds.kycForensics.recipients,
        "KYC-EXTRACTION",
        inputs.reqPayload,
        apiResponse,
        url
      )
      return;
    }

    let extractionData = {};
    extractionData.document_quality = extractedData.Document_quality;
    extractionData.status = extractedData.Status;
    extractionData.cause = extractedData.Cause;
    extractionData.docTag = extractedData.Doc_Tag;
    extractionData.classifiedType = extractedData.Document_Type;
    extractedData.subClassification = extractedData.Sub_classification;
    extractionData.extractionTime = (apiResponseTimeStamp - apiTriggerTimeStamp) / 1000 + "s";
    extractionData.subClassification = extractedData.Sub_classification;
    extractionData.logData = extractedData.Log_Data;

    if (extractedData?.Status !== 'success') {
      // added to check the error. TODO

      if (extractedData?.Cause?.includes('Invalid Document Type') || (extractedData.Info && extractedData.Info.includes('Invalid Document Type'))) {
        let expectedDoc = '';
        if (reqType === 'pan') expectedDoc = 'PAN';
        else if (reqType === 'aadhar' || reqType === 'aadhar_redact') expectedDoc = 'Aadhaar';
        else if (reqType === 'voter') expectedDoc = 'Voter ID';
        else if (reqType === 'passport') expectedDoc = 'Passport';
        else if (reqType === 'license') expectedDoc = 'DL';
        statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded document is not ${expectedDoc}. Please upload correct document.` };
      } else if (extractedData?.Cause === 'more_than_two_pages') {
        statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded file is not correct and has more than 2 pages. Please upload the correct file  with up to 2 pages for the document` };
      } else if (extractedData?.Cause === 'multiple_docs') {
        statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded file has multiple KYC documents. Please upload a valid file with a single document type.` };
      } else if (extractedData?.Cause === 'invalid_doc') {
        statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded file is not a valid KYC document. Please upload a valid file with a single document type.` };
      } else {
        statusCode = 502, result = { status: 'nok', statusCode: 'NC502', message: 'Unable to extract KYC Details from the uploaded document. Please upload a better quality document.' };
      }
      result.extractionData = extractionData;
      exits.success([statusCode, result]);
      await sails.helpers.kycForensicTracker(
        sails.config.zohoCreds.kycForensics.recipients,
        "KYC-EXTRACTION",
        inputs.reqPayload,
        apiResponse,
        url
      )
      return;
    }

    let info = extractedData.Info;

    let kyc_key = '', type = reqType.charAt(0).toUpperCase() + reqType.slice(1);;
    if (reqType === 'voter') kyc_key = info["Voter_ID"];
    else if (reqType === 'license') kyc_key = info["Licence_number"];
    else if (reqType === 'aadhar' || reqType === 'aadhar_redact') kyc_key = info["Aadhaar_number"];
    else kyc_key = info[`${type}_number`];
    if (kyc_key) kyc_key = kyc_key.trim().toUpperCase();

    let storedResponse = {};
    try {
      if (reqType !== 'pan' && reqType !== 'licnese' && (refId = inputs.refId)) {
        let row = await RequestDocument.findOne({ id: refId });
        if (row && row.request_type === 'KYC') {
          if (row.response) storedResponse = JSON.parse(row.response).extractionData || {};
        } else {
          statusCode = 400, result = {
            status: 'nok',
            statusCode: 'NC400',
            message: 'Invalid ref_id passed.'
          };
          exits.success([statusCode, result]);
          await sails.helpers.kycForensicTracker(
            sails.config.zohoCreds.kycForensics.recipients,
            "KYC-EXTRACTION",
            inputs.reqPayload,
            apiResponse,
            url
          )
          return;
        }
      }
    } catch (error) {
      statusCode = 500, result = {
        status: 'nok', statusCode: 'NC500',
        message: "Unable to extract KYC Details from the uploaded document. Please upload a better quality document in portrait mode."
      }
      exits.success([statusCode, result]);
      await sails.helpers.kycForensicTracker(
        sails.config.zohoCreds.kycForensics.recipients,
        "KYC-EXTRACTION",
        inputs.reqPayload,
        apiResponse,
        url
      )
      return;
    }

    switch (reqType) {
      case 'pan':
        extractionData = {
          "id": id || '',
          "Pan_number": (kyc_key || '').trim(),
          "Name": (info.Name || info.Company_Name).trim(),
          "DOB": (info.DOB || '').trim().replace(/[-.]/g, "/"),
          "father_name": (info.Fathers_Name || '').trim(),
          "image": extractedData.Image_quality || ''
        };
        kyc_key = extractionData.Pan_number;
        break;
      case 'aadhar':
      case 'aadhar_redact':
        extractionData = {
          "id": id || storedResponse.id || '',
          "Aadhar_number": (storedResponse.Aadhar_number || kyc_key || '').trim(),
          "Name": (storedResponse.Name || info.Name || '').trim(),
          "Father_name": (storedResponse.Father_name || info.Fathers_Name || '').trim(),
          "Gender": (storedResponse.Gender || info.Gender || '').trim(),
          "DOB": (storedResponse.DOB || info.DOB || '').trim().replace(/[-.]/g, "/"),
          "Address": (storedResponse.Address || info.Address || '').trim(),
          "pincode": (storedResponse.pincode || info.Pincode || '').trim(),
          "image": extractedData.Image_quality || ''
        };
        kyc_key = extractionData.Aadhar_number;
        break;
      case 'voter':
        extractionData = {
          "id": id || storedResponse.id || '',
          "name": (storedResponse.name || info.Name || '').trim(),
          "gender": (storedResponse.gender || info.Gender || '').trim(),
          "father_name": (storedResponse.father_name || info.Father_Name || '').trim(),
          "vid": (storedResponse.vid || kyc_key || '').trim(),
          "dob": (storedResponse.dob || info.DOB || '').trim().replace(/[-.]/g, "/"),
          "address": (storedResponse.address || info.Address || '').trim(),
          "pincode": (storedResponse.pincode || info.Pincode || '').trim(),
          "state": '',
          "image": extractedData.Image_quality || ''
        };
        try {
          if (extractionData.pincode && !extractionData.state) {
            let locationData = await sails.helpers.apiTrigger(
              sails.config.pincodeApi.url + extractionData.pincode,
              '',
              {},
              'GET'
            );
            extractionData.state = JSON.parse(locationData).state[0] || "";
          }
        } catch (error) {
        }
        kyc_key = extractionData.vid;
        break;
      case 'passport':
        extractionData = {
          "id": id || storedResponse.id || '',
          "type": 'passport',
          "name": (storedResponse.name || info.Name || '').trim(),
          "passport_no": (storedResponse.passport_no || kyc_key || '').trim(),
          "file_number": (storedResponse.file_number || info.File_number || '').trim(),
          "mrz_code": (storedResponse.mrz_code || info.MRZ_code || '').trim(),
          "gender": (storedResponse.gender || info.Gender || '').trim(),
          "dob": (storedResponse.dob || info.DOB || '').trim().replace(/[-.]/g, "/"),
          "country_code": (storedResponse.country_code || info.Country_code || '').trim(),
          "issue_place": (storedResponse.issue_place || info.Issue_place || '').trim(),
          "issue_date": (storedResponse.issue_date || info.Issue_date || '').trim().replace(/[-.]/g, "/"),
          "exp_date": (storedResponse.exp_date || info['Expiry Date'] || '').trim().replace(/[-.]/g, "/"),
          "Address": (storedResponse.Address || info.Address || '').trim(),
          "pincode": (storedResponse.pincode || info.Pincode || '').trim(),
          "image": extractedData.Image_quality || ''
        };
        kyc_key = extractionData.passport_no;
        break;
      case 'license':
        extractionData = {
          "id": id || '',
          "dl_no": (kyc_key || '').trim(),
          "name": (info.Name || '').trim(),
          "dob": (info.DOB || '').trim().replace(/[-.]/g, "/"),
          "address": (info.Address || '').trim(),
          "pincode": (info.Pincode || '').trim(),
          "issue_date": (info.Issue_date || '').trim().replace(/[-.]/g, "/"),
          "validity": (info.Validity || '').trim().replace(/[-.]/g, "/"),
          "image": extractedData.Image_quality || ''
        };
        kyc_key = extractionData.dl_no;
        break;
    }
    console.log('done extraction!');
    let base64String;

    if (reqType === 'aadhar_redact') {
      base64String = await sails.helpers.getBase64StringFromS3(
        inputs.reqPayload.s3bucket,
        inputs.reqPayload.region,
        inputs.reqPayload.cloud,
        extractedData.Masked_image_path
      );
    }

    extractionData.document_quality = extractedData.Document_quality;
    extractionData.status = extractedData.Status;
    extractionData.cause = extractedData.Cause;
    extractionData.docTag = extractedData.Doc_Tag;
    extractionData.classifiedType = extractedData.Document_Type;
    extractedData.subClassification = extractedData.Sub_classification;
    extractionData.extractionTime = (apiResponseTimeStamp - apiTriggerTimeStamp) / 1000 + "s";
    extractionData.subClassification = extractedData.Sub_classification;
    extractionData.logData = extractedData.Log_Data;


    console.log("extractionRes=> ", [200, extractionData, kyc_key, base64String]);
    return exits.success([200, extractionData, kyc_key, base64String]);
  }


};

