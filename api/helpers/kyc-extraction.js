// const {emirates_id, tenancy_contract, trade_licence} = require("../../sampleJson.json");
const sampleJson = require("../../sampleJson.json");
// module.exports = {


//   friendlyName: 'Kyc extraction',


//   description: 'Extraction of kyc data from uploaded document',


//   inputs: {
//     id: {
//       type: 'string',
//       required: true
//     },
//     reqType: {
//       type: 'string',
//       required: true
//     },
//     reqPayload: {
//       type: 'ref',
//       required: true
//     },
//     refId: {
//       type: 'string'
//     },
//     tempUrl: {
//       type: 'string'//this needs to be removed
//     }
//   },


//   exits: {

//     success: {
//       description: 'All done.',
//     },

//   },


//   fn: async function (inputs, exits) {
//     console.log('entered extraction!');
//     let url, statusCode, result, id = inputs.id, reqType = inputs.reqType, refId, apiResponse;

//     if (
//       reqType === 'pan' ||
//       reqType === 'aadhar' ||
//       reqType === 'passport' ||
//       reqType === 'aadhar_redact') url = sails.config.kycExtraction.urls[reqType];
//     else if (reqType === 'voter') url = sails.config.kycExtraction.urls.voterid;
//     else if (reqType === 'license') url = sails.config.kycExtraction.urls.licence;


//     inputs.reqPayload.req_type = inputs.reqType;
//     if (!inputs.reqPayload.file_type) inputs.reqPayload.file_type = 'image';
//     console.log(inputs.reqPayload, url);
//     const apiTriggerTimeStamp = Date.now();
//     apiResponse = await sails.helpers.apiTrigger(
//       url,
//       JSON.stringify(inputs.reqPayload),
//       { "content-type": "application/json" },
//       'POST'
//     );
//     const apiResponseTimeStamp = Date.now();
//     console.log('got api response');
//     console.log(apiResponse);

//     let extractedData;
//     try {
//       if (typeof apiResponse === "string" && apiResponse != "") extractedData = JSON.parse(apiResponse);
//       else extractedData = apiResponse;
//       if (extractedData?.Cause === 'Extraction_Failed') extractedData.Status = 'success';
//     } catch (err) {
//       statusCode = 502, result = {
//         status: 'nok',
//         statusCode: 'NC502',
//         message: `Unable to extract KYC Details from the uploaded document. Please upload a better quality document in portrait mode.`
//       };
//       exits.success([statusCode, result]);
//       await sails.helpers.kycForensicTracker(
//         sails.config.zohoCreds.kycForensics.recipients,
//         "KYC-EXTRACTION",
//         inputs.reqPayload,
//         apiResponse,
//         url
//       )
//       return;
//     }

//     let extractionData = {};
//     extractionData.document_quality = extractedData.Document_quality;
//     extractionData.status = extractedData.Status;
//     extractionData.cause = extractedData.Cause;
//     extractionData.docTag = extractedData.Doc_Tag;
//     extractionData.classifiedType = extractedData.Document_Type;
//     extractedData.subClassification = extractedData.Sub_classification;
//     extractionData.extractionTime = (apiResponseTimeStamp - apiTriggerTimeStamp) / 1000 + "s";
//     extractionData.subClassification = extractedData.Sub_classification;
//     extractionData.logData = extractedData.Log_Data;

//     if (extractedData?.Status !== 'success') {
//       // added to check the error. TODO

//       if (extractedData?.Cause?.includes('Invalid Document Type') || (extractedData.Info && extractedData.Info.includes('Invalid Document Type'))) {
//         let expectedDoc = '';
//         if (reqType === 'pan') expectedDoc = 'PAN';
//         else if (reqType === 'aadhar' || reqType === 'aadhar_redact') expectedDoc = 'Aadhaar';
//         else if (reqType === 'voter') expectedDoc = 'Voter ID';
//         else if (reqType === 'passport') expectedDoc = 'Passport';
//         else if (reqType === 'license') expectedDoc = 'DL';
//         statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded document is not ${expectedDoc}. Please upload correct document.` };
//       } else if (extractedData?.Cause === 'more_than_two_pages') {
//         statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded file is not correct and has more than 2 pages. Please upload the correct file  with up to 2 pages for the document` };
//       } else if (extractedData?.Cause === 'multiple_docs') {
//         statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded file has multiple KYC documents. Please upload a valid file with a single document type.` };
//       } else if (extractedData?.Cause === 'invalid_doc') {
//         statusCode = 400, result = { status: 'nok', statusCode: 'NC400', message: `Uploaded file is not a valid KYC document. Please upload a valid file with a single document type.` };
//       } else {
//         statusCode = 502, result = { status: 'nok', statusCode: 'NC502', message: 'Unable to extract KYC Details from the uploaded document. Please upload a better quality document.' };
//       }
//       result.extractionData = extractionData;
//       exits.success([statusCode, result]);
//       await sails.helpers.kycForensicTracker(
//         sails.config.zohoCreds.kycForensics.recipients,
//         "KYC-EXTRACTION",
//         inputs.reqPayload,
//         apiResponse,
//         url
//       )
//       return;
//     }

//     let info = extractedData.Info;

//     let kyc_key = '', type = reqType.charAt(0).toUpperCase() + reqType.slice(1);;
//     if (reqType === 'voter') kyc_key = info["Voter_ID"];
//     else if (reqType === 'license') kyc_key = info["Licence_number"];
//     else if (reqType === 'aadhar' || reqType === 'aadhar_redact') kyc_key = info["Aadhaar_number"];
//     else kyc_key = info[`${type}_number`];
//     if (kyc_key) kyc_key = kyc_key.trim().toUpperCase();

//     let storedResponse = {};
//     try {
//       if (reqType !== 'pan' && reqType !== 'licnese' && (refId = inputs.refId)) {
//         let row = await RequestDocument.findOne({ id: refId });
//         if (row && row.request_type === 'KYC') {
//           if (row.response) storedResponse = JSON.parse(row.response).extractionData || {};
//         } else {
//           statusCode = 400, result = {
//             status: 'nok',
//             statusCode: 'NC400',
//             message: 'Invalid ref_id passed.'
//           };
//           exits.success([statusCode, result]);
//           await sails.helpers.kycForensicTracker(
//             sails.config.zohoCreds.kycForensics.recipients,
//             "KYC-EXTRACTION",
//             inputs.reqPayload,
//             apiResponse,
//             url
//           )
//           return;
//         }
//       }
//     } catch (error) {
//       statusCode = 500, result = {
//         status: 'nok', statusCode: 'NC500',
//         message: "Unable to extract KYC Details from the uploaded document. Please upload a better quality document in portrait mode."
//       }
//       exits.success([statusCode, result]);
//       await sails.helpers.kycForensicTracker(
//         sails.config.zohoCreds.kycForensics.recipients,
//         "KYC-EXTRACTION",
//         inputs.reqPayload,
//         apiResponse,
//         url
//       )
//       return;
//     }

//     switch (reqType) {
//       case 'pan':
//         extractionData = {
//           "id": id || '',
//           "Pan_number": (kyc_key || '').trim(),
//           "Name": (info.Name || info.Company_Name).trim(),
//           "DOB": (info.DOB || '').trim().replace(/[-.]/g, "/"),
//           "father_name": (info.Fathers_Name || '').trim(),
//           "image": extractedData.Image_quality || ''
//         };
//         kyc_key = extractionData.Pan_number;
//         break;
//       case 'aadhar':
//       case 'aadhar_redact':
//         extractionData = {
//           "id": id || storedResponse.id || '',
//           "Aadhar_number": (storedResponse.Aadhar_number || kyc_key || '').trim(),
//           "Name": (storedResponse.Name || info.Name || '').trim(),
//           "Father_name": (storedResponse.Father_name || info.Fathers_Name || '').trim(),
//           "Gender": (storedResponse.Gender || info.Gender || '').trim(),
//           "DOB": (storedResponse.DOB || info.DOB || '').trim().replace(/[-.]/g, "/"),
//           "Address": (storedResponse.Address || info.Address || '').trim(),
//           "pincode": (storedResponse.pincode || info.Pincode || '').trim(),
//           "image": extractedData.Image_quality || ''
//         };
//         kyc_key = extractionData.Aadhar_number;
//         break;
//       case 'voter':
//         extractionData = {
//           "id": id || storedResponse.id || '',
//           "name": (storedResponse.name || info.Name || '').trim(),
//           "gender": (storedResponse.gender || info.Gender || '').trim(),
//           "father_name": (storedResponse.father_name || info.Father_Name || '').trim(),
//           "vid": (storedResponse.vid || kyc_key || '').trim(),
//           "dob": (storedResponse.dob || info.DOB || '').trim().replace(/[-.]/g, "/"),
//           "address": (storedResponse.address || info.Address || '').trim(),
//           "pincode": (storedResponse.pincode || info.Pincode || '').trim(),
//           "state": '',
//           "image": extractedData.Image_quality || ''
//         };
//         try {
//           if (extractionData.pincode && !extractionData.state) {
//             let locationData = await sails.helpers.apiTrigger(
//               sails.config.pincodeApi.url + extractionData.pincode,
//               '',
//               {},
//               'GET'
//             );
//             extractionData.state = JSON.parse(locationData).state[0] || "";
//           }
//         } catch (error) {
//         }
//         kyc_key = extractionData.vid;
//         break;
//       case 'passport':
//         extractionData = {
//           "id": id || storedResponse.id || '',
//           "type": 'passport',
//           "name": (storedResponse.name || info.Name || '').trim(),
//           "passport_no": (storedResponse.passport_no || kyc_key || '').trim(),
//           "file_number": (storedResponse.file_number || info.File_number || '').trim(),
//           "mrz_code": (storedResponse.mrz_code || info.MRZ_code || '').trim(),
//           "gender": (storedResponse.gender || info.Gender || '').trim(),
//           "dob": (storedResponse.dob || info.DOB || '').trim().replace(/[-.]/g, "/"),
//           "country_code": (storedResponse.country_code || info.Country_code || '').trim(),
//           "issue_place": (storedResponse.issue_place || info.Issue_place || '').trim(),
//           "issue_date": (storedResponse.issue_date || info.Issue_date || '').trim().replace(/[-.]/g, "/"),
//           "exp_date": (storedResponse.exp_date || info['Expiry Date'] || '').trim().replace(/[-.]/g, "/"),
//           "Address": (storedResponse.Address || info.Address || '').trim(),
//           "pincode": (storedResponse.pincode || info.Pincode || '').trim(),
//           "image": extractedData.Image_quality || ''
//         };
//         kyc_key = extractionData.passport_no;
//         break;
//       case 'license':
//         extractionData = {
//           "id": id || '',
//           "dl_no": (kyc_key || '').trim(),
//           "name": (info.Name || '').trim(),
//           "dob": (info.DOB || '').trim().replace(/[-.]/g, "/"),
//           "address": (info.Address || '').trim(),
//           "pincode": (info.Pincode || '').trim(),
//           "issue_date": (info.Issue_date || '').trim().replace(/[-.]/g, "/"),
//           "validity": (info.Validity || '').trim().replace(/[-.]/g, "/"),
//           "image": extractedData.Image_quality || ''
//         };
//         kyc_key = extractionData.dl_no;
//         break;
//     }
//     console.log('done extraction!');
//     let base64String;

//     if (reqType === 'aadhar_redact') {
//       base64String = await sails.helpers.getBase64StringFromS3(
//         inputs.reqPayload.s3bucket,
//         inputs.reqPayload.region,
//         inputs.reqPayload.cloud,
//         extractedData.Masked_image_path
//       );
//     }

//     extractionData.document_quality = extractedData.Document_quality;
//     extractionData.status = extractedData.Status;
//     extractionData.cause = extractedData.Cause;
//     extractionData.docTag = extractedData.Doc_Tag;
//     extractionData.classifiedType = extractedData.Document_Type;
//     extractedData.subClassification = extractedData.Sub_classification;
//     extractionData.extractionTime = (apiResponseTimeStamp - apiTriggerTimeStamp) / 1000 + "s";
//     extractionData.subClassification = extractedData.Sub_classification;
//     extractionData.logData = extractedData.Log_Data;


//     console.log("extractionRes=> ", [200, extractionData, kyc_key, base64String]);
//     return exits.success([200, extractionData, kyc_key, base64String]);
//   }


// };


function getExpectedDoc(reqType) {
  const mapping = {
    pan: 'PAN',
    aadhar: 'Aadhaar',
    aadhar_redact: 'Aadhaar',
    voter: 'Voter ID',
    passport: 'Passport',
    license: 'DL',
    emirates_id : "emirates_id",
    tenancy_contract : "tenancy_contract",
    trade_licence: "trade_licence"
  };
  return mapping[reqType] || 'Unknown Document';
}

function normalizeDate(date) {
  return (date || '').trim().replace(/[-.]/g, '/');
}

function extractCommonFields(info, storedResponse, kycKey, additionalFields = {}) {
  return {
    id: storedResponse?.id || '',
    name: (storedResponse?.name || info?.Name || '').trim(),
    dob: normalizeDate(storedResponse?.dob || info?.DOB),
    address: (storedResponse?.address || info?.Address || '').trim(),
    pincode: (storedResponse?.pincode || info?.Pincode || '').trim(),
    ...additionalFields,
    image: info?.Image_quality || '',
  };
}

module.exports = {
  friendlyName: 'KYC Extraction',

  description: 'Extraction of KYC data from uploaded document',

  inputs: {
    id: { type: 'string', required: true },
    reqType: { type: 'string', required: true },
    reqPayload: { type: 'ref', required: true },
    refId: { type: 'string' },
    tempUrl: { type: 'string' },
  },

  exits: {
    success: { description: 'All done.' },
  },

  fn: async function (inputs, exits) {
    console.log('Entered extraction!');

    const { id, reqType, reqPayload, refId } = inputs;
    let url = sails.config.kycExtraction.urls[reqType] || sails.config.kycExtraction.urls.default, apiResponse;

    reqPayload.req_type = reqType;
    reqPayload.file_type ||= 'image';

    const apiTriggerTimeStamp = Date.now();
    if (["emirates_id", "tenancy_contract", "trade_licence"].includes(reqType) === false){
         apiResponse = await sails.helpers.apiTrigger(
          url,
          JSON.stringify(reqPayload),
          { 'content-type': 'application/json' },
          'POST'
        );
    } else {
        apiResponse = sampleJson[reqType].data;
    }
    
    const apiResponseTimeStamp = Date.now();

    let extractedData;
    try {
      extractedData = typeof apiResponse === 'string' ? JSON.parse(apiResponse) : apiResponse;
      if (extractedData?.Cause === 'Extraction_Failed') extractedData.Status = 'success';
    } catch (err) {
      const result = {
        status: 'nok',
        statusCode: '502',
        message: 'Unable to extract KYC Details from the uploaded document. Please upload a better quality document in portrait mode.',
      };
      exits.success([502, result]);
      await sails.helpers.kycForensicTracker(
        sails.config.zohoCreds.kycForensics.recipients,
        'KYC-EXTRACTION',
        reqPayload,
        apiResponse,
        url
      );
      return;
    }

    const extractionData = {
      document_quality: extractedData.Document_quality,
      status: extractedData.Status,
      cause: extractedData.Cause,
      docTag: extractedData.Doc_Tag,
      classifiedType: extractedData.Document_Type,
      subClassification: extractedData.Sub_classification,
      extractionTime: `${(apiResponseTimeStamp - apiTriggerTimeStamp) / 1000}s`,
      logData: extractedData.Log_Data,
    };

    if (extractedData?.Status !== 'success') {
      const errorMessages = {
        'Invalid Document Type': `Uploaded document is not ${getExpectedDoc(reqType)}. Please upload the correct document.`,
        'more_than_two_pages': 'Uploaded file is not correct and has more than 2 pages. Please upload the correct file with up to 2 pages.',
        multiple_docs: 'Uploaded file has multiple KYC documents. Please upload a valid file with a single document type.',
        invalid_doc: 'Uploaded file is not a valid KYC document. Please upload a valid file with a single document type.',
      };

      const message = errorMessages[extractedData?.Cause] || 'Unable to extract KYC Details from the uploaded document. Please upload a better quality document.';
      const result = { status: 'nok', statusCode: '400', message, extractionData };
      exits.success([400, result]);
      await sails.helpers.kycForensicTracker(
        sails.config.zohoCreds.kycForensics.recipients,
        'KYC-EXTRACTION',
        reqPayload,
        apiResponse,
        url
      );
      return;
    }

    const info = extractedData.Info;
    let kycKey = '';

    const commonFields = extractCommonFields(info, null, kycKey);
    switch (reqType) {
      case 'pan':
        Object.assign(extractionData, {
          ...commonFields,
          Pan_number: (info.Pan_number || '').trim(),
          father_name: (info.Fathers_Name || '').trim(),
        });
        break;
      case 'aadhar':
      case 'aadhar_redact':
        Object.assign(extractionData, {
          ...commonFields,
          Aadhar_number: (info.Aadhaar_number || '').trim(),
          Father_name: (info.Fathers_Name || '').trim(),
          Gender: (info.Gender || '').trim(),
        });
        break;
      case 'voter':
        Object.assign(extractionData, {
          ...commonFields,
          vid: (info.Voter_ID || '').trim(),
          gender: (info.Gender || '').trim(),
          father_name: (info.Father_Name || '').trim(),
        });
        if (commonFields.pincode) {
          try {
            const locationData = await sails.helpers.apiTrigger(
              `${sails.config.pincodeApi.url}${commonFields.pincode}`,
              '',
              {},
              'GET'
            );
            extractionData.state = JSON.parse(locationData)?.state[0] || '';
          } catch (error) {
            console.error('Error fetching state data:', error);
          }
        }
        break;
      case 'passport':
        Object.assign(extractionData, {
          ...commonFields,
          passport_no: (info.Passport_no || '').trim(),
          file_number: (info.File_number || '').trim(),
          mrz_code: (info.MRZ_code || '').trim(),
          gender: (info.Gender || '').trim(),
          country_code: (info.Country_code || '').trim(),
          issue_place: (info.Issue_place || '').trim(),
          issue_date: normalizeDate(info.Issue_date),
          exp_date: normalizeDate(info.Expiry_Date),
        });
        break;
      case 'license':
        Object.assign(extractionData, {
          ...commonFields,
          dl_no: (info.Licence_number || '').trim(),
          issue_date: normalizeDate(info.Issue_date),
          validity: normalizeDate(info.Validity),
        });
        break;
      case 'emirates_id':
        Object.assign(extractionData, {
          ...commonFields,
          emirates_id : (info.id_number || '').trim()
         });
        break;
      case 'tenancy_contract' :
        Object.assign(extractionData, {
          ...commonFields,
          tenant_id : (info.tenant_id || '').trim()
         });
        break;
      case 'trade_license' :
        Object.assign(extractionData, {
          ...commonFields,
          trade_licence_id : (info.registered_number || '').trim()
         });
          break;
      case 'bank_statement' :
        Object.assign(extractionData, {
          ...commonFields,
          account_number : (info.account_number || '').trim()
          });
          break;
    }

    console.log('extractionRes=>', [200, extractionData, kycKey]);
    exits.success([200, extractionData, kycKey]);
  },
};
