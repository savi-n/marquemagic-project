/**
 * EsicEpfoController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require("axios");


module.exports = {
  getEpfoCaptcha: async (req, res) => {
    let epfoName = req.param('epfoName');
    if (!epfoName) return res.ok(sails.config.errRes.missingFields);
    epfoName = epfoName.toUpperCase();
    epfoName = epfoName.replace('PRIVATE', '');
    epfoName = epfoName.replace('LIMITED', '');
    epfoName = epfoName.replace('PVT', '');
    epfoName = epfoName.replace('LTD', '');
    epfoName = epfoName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    epfoName = epfoName.trim();

    const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
    const uniqTimeStamp = Math.round(new Date().getTime());
    const uniqueRandomId = Number('' + uniqTimeStamp + randomTwoUnique);
    const datetime = await sails.helpers.dateTime();

    await ClientRequest.create({
      request_id: uniqueRandomId,
      req_datetime: datetime,
      client_id: req.client_id,
      req_status: 'initiate',
      is_active: 'active',
      req_type: 'EPFO',
      created_at: datetime,
      updated_at: datetime,
    }).fetch();

    const data = {
      gstIn: epfoName,
      businessId: uniqueRandomId,
    };

    let i = 0, response;
    const getResponse = new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (response) {
          clearInterval(interval);
          resolve(response);
        } else if (i === 110) {
          clearInterval(interval);
          reject({
            statusCode: 'NC504',
            message: 'Request timed out!'
          });
        }
        i++;
      }, 500);
    });

    const client = await sails.helpers.grpcConnection();
    client.epfoGetCaptcha(data, async (error, result) => {
      if (!error) {
        if (result.statusCode == 'NC500') {
          await ClientRequest.update({ request_id: uniqueRandomId }).set({
            req_status: 'failed',
          });
        }
        response = {
          statusCode: result.statusCode,
          message: result.message,
          imageUrl: result.imageUrl,
          requestId: uniqueRandomId,
        };
      } else {
        await ClientRequest.update({ request_id: uniqueRandomId }).set({
          req_status: 'failed',
        });
        response = { statusCode: 'NC500', message: 'Error' };
      }
    });

    try {
      let value = await getResponse;
      return res.send(value);
    } catch (err) {
      return res.send(err);
    }
  },

  epfoSubmitCaptcha: async (req, res) => {
    let epfoName = req.param('epfoName');
    const captcha = req.param('captcha');
    const requestId = req.param('requestId');
    if (!epfoName || !requestId || !captcha)
      return res.ok(sails.config.errRes.missingFields);
    epfoName = epfoName.toUpperCase();
    epfoName = epfoName.replace('PRIVATE', '');
    epfoName = epfoName.replace('LIMITED', '');
    epfoName = epfoName.replace('PVT', '');
    epfoName = epfoName.replace('LTD', '');
    epfoName = epfoName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    epfoName = epfoName.trim();

    const data = {
      gstIn: epfoName,
      captcha: captcha,
      businessId: requestId,
    };

    let i = 0, response;
    const getResponse = new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (response) {
          clearInterval(interval);
          resolve(response);
        } else if (i === 110) {
          clearInterval(interval);
          reject({
            statusCode: 'NC504',
            message: 'Request timed out!'
          });
        }
        i++;
      }, 500);
    });

    const client = await sails.helpers.grpcConnection();
    client.epfoSubmitCaptcha(data, async (error, result) => {
      if (!error) {
        if (result.statusCode == 'NC200' || result.statusCode == 'NC201') {
          let clientReq = await ClientRequest.update({ request_id: requestId })
            .set({ req_status: 'completed' })
            .fetch();

          await RequestDocument.create({
            client_id: clientReq[0].client_id,
            request_id: requestId,
            response: result.result,
            request_type: 'EPFO',
            CIN_GST_PAN_number: epfoName,
          });
        } else if (result.statusCode == 'NC500') {
          await ClientRequest.update({ request_id: requestId }).set({
            req_status: 'failed',
          });
        }
        response = {
          statusCode: result.statusCode,
          message: result.message,
          imageUrl: result.imageUrl,
          companies: result.result,
        };
      } else {
        await ClientRequest.update({ request_id: requestId }).set({
          req_status: 'failed',
        });
        response = { statusCode: 'NC500', message: 'Error' };
      }
    });

    try {
      let value = await getResponse;
      return res.send(value);
    } catch (err) {
      return res.send(err);
    }
  },

  epfoSubmitCompany: async (req, res) => {
    let epfoName = req.param('epfoName');
    const estblishmentId = req.param('estblishmentId');
    const requestId = req.param('requestId');
    epfoName = epfoName.toUpperCase();
    epfoName = epfoName.replace('PRIVATE', '');
    epfoName = epfoName.replace('LIMITED', '');
    epfoName = epfoName.replace('PVT', '');
    epfoName = epfoName.replace('LTD', '');
    epfoName = epfoName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    epfoName = epfoName.trim();
    if (!epfoName || !requestId || !estblishmentId)
      return res.ok(sails.config.errRes.missingFields);

    const data = {
      gstIn: epfoName,
      captcha: estblishmentId,
      businessId: requestId,
    };
    const client = await sails.helpers.grpcConnection();
    client.epfoSubmitCompany(data, async (error, result) => {
      if (!error) {
        if (result.statusCode == 'NC200') {
          let clientReq = await ClientRequest.update({ request_id: requestId })
            .set({ req_status: 'completed' })
            .fetch();

          await RequestDocument.create({
            client_id: clientReq[0].client_id,
            request_id: requestId,
            response: result.result,
            request_type: 'EPFO',
            CIN_GST_PAN_number: epfoName,
          });
        } else {
          await ClientRequest.update({ request_id: requestId }).set({
            req_status: 'failed',
          });
        }
        return res.send({
          statusCode: result.statusCode,
          message: result.message,
        });
      } else {
        await ClientRequest.update({ request_id: requestId }).set({
          req_status: 'failed',
        });
        return res.send({ statusCode: 'NC500', message: 'Error' });
      }
    });
  },

  // ESic

  esicGetCaptcha: async (req, res) => {
    let esicName = req.param('esicName');
    if (!esicName) return res.ok(sails.config.errRes.missingFields);
    esicName = esicName.toUpperCase();
    esicName = esicName.replace('PRIVATE', '');
    esicName = esicName.replace('LIMITED', '');
    esicName = esicName.replace('PVT', '');
    esicName = esicName.replace('LTD', '');
    esicName = esicName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    esicName = esicName.trim();

    const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
    const uniqTimeStamp = Math.round(new Date().getTime());
    const uniqueRandomId = Number('' + uniqTimeStamp + randomTwoUnique);
    const datetime = await sails.helpers.dateTime();

    await ClientRequest.create({
      request_id: uniqueRandomId,
      req_datetime: datetime,
      client_id: req.client_id,
      req_status: 'initiate',
      is_active: 'active',
      req_type: 'ESIC',
      created_at: datetime,
      updated_at: datetime,
    }).fetch();

    const data = {
      gstIn: esicName,
      businessId: uniqueRandomId,
    };

    let i = 0, response;
    const getResponse = new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (response) {
          clearInterval(interval);
          resolve(response);
        } else if (i === 110) {
          clearInterval(interval);
          reject({
            statusCode: 'NC504',
            message: 'Request timed out!'
          });
        }
        i++;
      }, 500);
    });

    const client = await sails.helpers.grpcConnection();
    client.esicGetCaptcha(data, async (error, result) => {
      if (!error) {
        if (result.statusCode == 'NC500') {
          await ClientRequest.update({ request_id: uniqueRandomId }).set({
            req_status: 'failed',
          });
        }
        response = {
          statusCode: result.statusCode,
          message: result.message,
          imageUrl: result.imageUrl,
          requestId: uniqueRandomId,
          state: result.result,
        };
      } else {
        await ClientRequest.update({ request_id: uniqueRandomId }).set({
          req_status: 'failed',
        });
        response = { statusCode: 'NC500', message: 'Error' };
      }
    });

    try {
      let value = await getResponse;
      return res.send(value);
    } catch (err) {
      return res.send(err);
    }
  },

  esicGetDistrict: async (req, res) => {
    let esicName = req.param('esicName');
    const requestId = req.param('requestId');
    const state = req.param('state');
    if (!esicName || !requestId || !state)
      return res.ok(sails.config.errRes.missingFields);
    esicName = esicName.toUpperCase();
    esicName = esicName.replace('PRIVATE', '');
    esicName = esicName.replace('LIMITED', '');
    esicName = esicName.replace('PVT', '');
    esicName = esicName.replace('LTD', '');
    esicName = esicName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    esicName = esicName.trim();

    const data = {
      esicName: esicName,
      state: state,
      businessId: requestId,
    };

    let i = 0, response;
    const getResponse = new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (response) {
          clearInterval(interval);
          resolve(response);
        } else if (i === 110) {
          clearInterval(interval);
          reject({
            statusCode: 'NC504',
            message: 'Request timed out!'
          });
        }
        i++;
      }, 500);
    });

    const client = await sails.helpers.grpcConnection();
    client.esicGetDistrict(data, async (error, result) => {
      if (!error) {
        if (result.statusCode == 'NC500') {
          await ClientRequest.update({ request_id: requestId }).set({
            req_status: 'failed',
          });
        }
        response = {
          statusCode: result.statusCode,
          message: result.message,
          imageUrl: result.imageUrl,
          district: result.result,
        };
      } else {
        await ClientRequest.update({ request_id: requestId }).set({
          req_status: 'failed',
        });
        response = { statusCode: 'NC500', message: 'Error' };
      }
    });

    try {
      let value = await getResponse;
      return res.send(value);
    } catch (err) {
      return res.send(err);
    }
  },

  esicSubmitCaptcha: async (req, res) => {
    let esicName = req.param('esicName');
    const requestId = req.param('requestId');
    const state = req.param('state');
    const captcha = req.param('captcha');
    const district = req.param('district');
    if (!esicName || !requestId || !state)
      return res.ok(sails.config.errRes.missingFields);
    esicName = esicName.toUpperCase();
    esicName = esicName.replace('PRIVATE', '');
    esicName = esicName.replace('LIMITED', '');
    esicName = esicName.replace('PVT', '');
    esicName = esicName.replace('LTD', '');
    esicName = esicName.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    esicName = esicName.trim();

    const data = {
      esicName: esicName,
      captcha: captcha,
      state: state,
      district: district,
      businessId: requestId,
    };

    let i = 0, response;
    const getResponse = new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (response) {
          clearInterval(interval);
          resolve(response);
        } else if (i === 110) {
          clearInterval(interval);
          reject({
            statusCode: 'NC504',
            message: 'Request timed out!'
          });
        }
        i++;
      }, 500);
    });

    const client = await sails.helpers.grpcConnection();
    client.esicSubmitCaptcha(data, async (error, result) => {
      if (!error) {
        if (result.statusCode == 'NC200' || result.statusCode == 'NC201') {
          let clientReq = await ClientRequest.update({ request_id: requestId })
            .set({ req_status: 'completed' })
            .fetch();

          await RequestDocument.create({
            client_id: clientReq[0].client_id,
            request_id: requestId,
            response: result.result,
            request_type: 'ESIC',
            CIN_GST_PAN_number: esicName,
          });
        } else {
          await ClientRequest.update({ request_id: requestId }).set({
            req_status: 'failed',
          });
        }

        response = {
          statusCode: result.statusCode,
          message: result.message,
          imageUrl: result.imageUrl,
        };
      } else {
        await ClientRequest.update({ request_id: requestId }).set({
          req_status: 'failed',
        });
        response = { statusCode: 'NC500', message: 'Error' };
      }
    });

    try {
      let value = await getResponse;
      return res.send(value);
    } catch (err) {
      return res.send(err);
    }
  },

  verificationData: async function (req, res) {
    let verificationDataArray = [];
    let bid = req.param('businessId');
    let loanRefId = req.param('loan_ref_id');
    if (!bid || !loanRefId) return res.ok(sails.config.errRes.missingFields);

    let businessData = await Business.findOne({ id: bid });

    if (!businessData)
      return res.ok({
        status: 'nok',
        message: 'No data found for the business id OR wrong business id',
      });
    let KYCArray = [];
    let GSTArray = [];
    let ITRArray = [];
    let ESICArray = [];
    let EPFOArray = [];
    let ROCArray = [];
    let CKYCArray = [];
    let emailVerificationArray = [];
    let KYCForensicArray = [];
    let googleArray = [];
    let creditArray = [];
    let legalArray = [];
    let crimeArray = [];
    let equifaxArray = [];
    let commercialArray = [];
    let vehicleArray = [];
    let panArray = [];
    let sme_data = [];
    let loanPreFetch = [];
    let udyamData = [];
    let nsdlData = [];
    let authenticationArray = []; //1379 addition
    let isForensic = false;
    let request_id = 0;
    let remarkCount = 0;
    let kycRemarkCount = 0;
    let commercialResponse;
    let {
      legal_entity_data,
      esic_data,
      epfo_data,
      google_search_data,
      credit_ratings,
      business_email,
      email_verification,
      businesspancardnumber,
      businessname,
      contactno
    } = businessData;
    if (businessData.remarks) {
      let m = JSON.parse(businessData.remarks);
      remarkCount = m;
    }
    if (businessData.cibil_remarks) {
      commercialResponse = JSON.parse(businessData.cibil_remarks);
    }

    let googleString, creditString, legalString;

    /* Handle the exception if the data is not in correct json format in database */
    try {
      googleString = JSON.parse(unescape(google_search_data));
    } catch (err) { }

    try {
      creditString = JSON.parse(unescape(credit_ratings));
    } catch (err) { }

    try {
      legalString = JSON.parse(unescape(legal_entity_data));
    } catch (err) { }

    let emailVerification = null, emailVerified = null;
    try {
      emailVerification = JSON.parse(email_verification);
      if (emailVerification.status === 'verified') emailVerified = 'Success';
      else emailVerified = 'Error';
    } catch (err) { }


    // form new table format for the data

    googleArray.push(formJSONTableResponse('Google Searches', null, null, null, remarkCount['google'] ? remarkCount['google'].length : 0, businessData.id, googleString, 'google'));
    creditArray.push(formJSONTableResponse('Credit Ratings', null, null, null, remarkCount['credit'] ? remarkCount['credit'].length : 0, businessData.id, creditString, 'credit'));
    legalArray.push(formJSONTableResponse('Legal Reports', null, null, null, remarkCount['legal'] ? remarkCount['legal'].length : 0, businessData.id, legalString, 'legal'));
    ESICArray.push(formJSONTableResponse('ESIC Verification', null, null, null, remarkCount['esic'] ? remarkCount['esic'].length : 0, businessData.id, typeof esic_data === 'string' && esic_data != '' ? JSON.parse(unescape(esic_data)) : esic_data, 'esic'));
    EPFOArray.push(formJSONTableResponse('EPFO Verification', null, null, null, remarkCount['epfo'] ? remarkCount['epfo'].length : 0, businessData.id, typeof epfo_data == 'string' && epfo_data != '' && isJsonString(epfo_data) ? JSON.parse(epfo_data) : epfo_data, 'epfo'));
    emailVerificationArray.push(formJSONTableResponse('Email Verification', null, emailVerified, null, remarkCount['email'] ? remarkCount['email'].length : 0, businessData.id, emailVerification, 'email'))

    formJSONTableResponseFinal(googleArray, 'Google Search Data', verificationDataArray);
    formJSONTableResponseFinal(creditArray, 'Credit Ratings', verificationDataArray);
    formJSONTableResponseFinal(legalArray, 'Legal Report Verification Data', verificationDataArray);
    formJSONTableResponseFinal(ESICArray, 'ESIC Verification Data', verificationDataArray);
    formJSONTableResponseFinal(EPFOArray, 'EPFO Verification Data', verificationDataArray);
    formJSONTableResponseFinal(emailVerificationArray, 'Email Verification Data', verificationDataArray);

    data = verificationDataArray;

    // find if the whitelabel has opted for forensic.
    let forensicData = await WhiteLabelSolutionRd.findOne({ id: businessData.white_label_id })
    if (forensicData.forensic_check != null) {
      isForensic = true;
    }
    // some business ids have multiple loans and so the findOne didn't work. 
    let loanData = await Loanrequest.find({ loan_ref_id: loanRefId });
    if (!loanData[0]) {
      return res.ok({ status: 'ok', message: 'Verification Data', data });
    }
    else {
      if (!loanRefId) loanRefId = loanData[0].loan_ref_id;
      // Find authentication data as part of new dos1379 bug fix, which is really not a bug.
      if (loanData[0].authentication_data) {
        let authJson = JSON.parse(loanData[0].authentication_data);
        let authData = authJson['auth_data'];
        if (authData && authData.userid) delete authData.userid;
        let authRemarks = authJson['remarks'];
        let flag = null;
        if (authData) {
          authData['verified'] = true; //this will enable green tick in Ui/Ux.
          flag = 'Success';
        }

        authenticationArray.push(formJSONTableResponse('Authenticated', null, flag, null, authRemarks ? authRemarks.length : 0, loanData[0].id, authData ? authData : null, 'authentication'));
      }
      formJSONTableResponseFinal(authenticationArray, 'Application Form Authentication', verificationDataArray);

      const loanAdditionalData = await LoanAdditionalData.findOne({ loan_id: loanData[0].id }).select('sme_data');
      sme_data.push(formJSONTableResponse(
        'SME Data',
        null,
        null,
        null,
        0, loanData[0].id, loanAdditionalData, 'SME'
      ));
      formJSONTableResponseFinal(sme_data, 'SME Data', verificationDataArray);

      const loanAssetsData = await LoanAssets.find({ loan_id: loanData[0].id, loan_security: "Yes" }).select(['loan_json', 'inspection_data', 'inspection_status']);
      const rc_verification_data = loanAssetsData.filter(obj => obj.loan_json !== null && obj.loan_json.hasOwnProperty('rc_verification'));
      const rc_data = rc_verification_data.map(obj => {
        return {
          rc_verification: obj.loan_json.rc_verification || null,
          auto_inspect: obj.loan_json.auto_inspect || null,
          inspection_data: obj.inspection_status == "Initiated" ? "In Progress" : obj.inspection_status == "Completed" ? obj.inspection_data : null
        };
      });

      vehicleArray.push(formJSONTableResponse(
        'Vehicle RC Data',
        null,
        null,
        null,
        0, loanData[0].id, rc_data, 'vehicle_rc'
      ));
      formJSONTableResponseFinal(vehicleArray, 'Vehicle RC Data', verificationDataArray);

      // Ends here
      let whereCondition = [], equifax = [], preFetchData = [],directorUdyamData = [];
      const ekycResponseRecords = await EKycResponse.find({ ref_id: bid }).select(['kyc_key', 'verification_response', 'type']);
      let directorData = await Director.find({ business: bid, status: "active" }).select([
        'daadhaar',
        'dpassport',
        'dvoterid',
        'ddlNumber',
        'dcontact',
        'isApplicant',
        'dfirstname',
        'dlastname',
        'dcibil_score',
        'type_name',
        'ckyc_no',
        'customer_id',
        'additional_cust_id',
        "udyam_number",
        "udyam_registered",
        "udyam_response",
        "income_type",
        "demail",
        "dpancard",
        "ddob",
        "others_info"
      ]);
      let applicantMap = {}, applicantName = '', typeName = '';
      const updateApplicantMap = (kyc_key, isApplicant) => {
        whereCondition.push(kyc_key);
        applicantMap[kyc_key] = {
          isApplicant: isApplicant,
          name: applicantName,
          user_type: typeName
        }
      }


      // directorData.forEach((curRecord) => {
      for (let curRecord of directorData) {
        let udyam_data;
        let { id, daadhaar, dvoterid, ddlNumber, dcontact, dpassport, dfirstname, dlastname, type_name, isApplicant } = curRecord;
        applicantName = (dfirstname || "") + (dfirstname && dlastname ? " " : "") + (dlastname || "");
        typeName = type_name;
        let loan_pre_fetch_data = await LoanPreFetch.find({ director_id: curRecord.id }).sort('id DESC').limit(1);

        if (loan_pre_fetch_data.length > 0) loan_pre_fetch_data = loan_pre_fetch_data[0];
        else loan_pre_fetch_data = {
          loan_id: loanData[0].id,
          director_id: curRecord.id,
          request_type: 'Create Pending',
          refrence_no: null,
          updated_json: null,
          status: null
        };
        preFetchData.push({ ...loan_pre_fetch_data, customer_name: applicantName, typeName: type_name });
        let udyam_response = curRecord.udyam_response ? JSON.parse(curRecord.udyam_response) : null
        udyam_response = udyam_response && udyam_response.data ? JSON.parse(udyam_response.data) : null
        if(udyam_response){
        let {udyamRegistrationNumber,nameOfEnterprise,dateOfIncorporation,dateOfUdyamRegistration,organisationType} = udyam_response?.result?.generalInfo || {}
        udyam_data = {
          udyamRegistrationNumber,nameOfEnterprise,dateOfIncorporation,dateOfUdyamRegistration,organisationType,officialAddressOfEnterprise: udyam_response?.result?.officialAddressOfEnterprise || ""
        }
      }
      directorUdyamData.push({ director_id: curRecord.id, income_type: curRecord.income_type, udyam_number: curRecord.udyam_number,udyam_registered: curRecord.udyam_registered, udyam_response: udyam_data});

        if (daadhaar) updateApplicantMap(daadhaar, isApplicant);
        if (dvoterid) updateApplicantMap(dvoterid, isApplicant);
        if (ddlNumber) updateApplicantMap(ddlNumber, isApplicant);
        if (dpassport) updateApplicantMap(dpassport, isApplicant);
        let loanDocData = await LoanDocument.find({ business_id: bid, loan: loanData[0].id, doctype: [sails.config.muthootCibilApi.docTypeId, sails.config.muthootCibilApi.IDV_docTypeId], 
          status: 'active', directorId: id, or: [{ doc_name: { contains: '.pdf' } }, { doc_name: { contains: '.html' } }, { doc_name: { contains: '.json' } }] }).select(['doc_name', 'doctype']).sort('id DESC'),
        url = null, idv_url = null;

        if (loanDocData.length > 0) {
          key = `${forensicData.s3_name}/users_${businessData.userid}`;
          const cibilDoc = loanDocData.find(doc => doc.doctype === sails.config.muthootCibilApi.docTypeId),
            idvDoc = loanDocData.find(idv_doc => idv_doc.doctype === sails.config.muthootCibilApi.IDV_docTypeId);
          url = cibilDoc ? await sails.helpers.s3View(key, cibilDoc.doc_name, forensicData.s3_region) : null;
          idv_url = idvDoc ?  await sails.helpers.s3View(key, idvDoc.doc_name, forensicData.s3_region) : null;
        }
        //fix for where the dlastname was going as null to the frontend
        let name = dfirstname;
        if (dlastname && dlastname != undefined) {
          name = `${dfirstname}_${dlastname}`;
        }
        equifax.push({ director_id: curRecord.id, director_name: name, mobile: dcontact, cibil_score: curRecord.dcibil_score, [name]: curRecord.dcibil_score, url, idv_url });
        // });
        let isApplicantCoApplicant = '(' + (curRecord.type_name) + '-' + String(curRecord.dfirstname + ' ' + curRecord.dlastname).trim() + ')';

        if(curRecord.ckyc_no) {

          const others_info = JSON.parse(curRecord.others_info) || {};
          if(others_info?.ckyc_data?.A99ResponseData?.CKYCSearchResult?.CKYCPIdDetails?.['CKYCPID']?.['CKYCID']) {

            const ckycpid = others_info?.ckyc_data?.A99ResponseData?.CKYCSearchResult?.CKYCPIdDetails?.['CKYCPID'];
            const table_data = {
              "ckyc_number": ckycpid?.['CKYCID'], 
              "name": ckycpid?.['CKYCName'],  
              "fathers_name": ckycpid?.['CKYCFatherName'], 
              "age": ckycpid?.['CKYCAge'],  
              "kyc_date": ckycpid?.['CKYCGenDate'],  
              "updated_date": ckycpid?.['CKYCUpdatedDate'],  
              "remarks": ckycpid?.['CKYCRemarks']
            }

            CKYCArray.push(formJSONTableResponse(
              `CKYC Data ${isApplicantCoApplicant}`,
              null,
              "success",
              null,
              null,
              curRecord.dpancard,
              table_data,
              'ckyc_data'
            ));
  
          }

        }
        else {

          const others_info = JSON.parse(curRecord.others_info) || {};
          if(others_info?.ckyc_data?.A99ResponseData) {
            CKYCArray.push(formJSONTableResponse(
              `CKYC Data ${isApplicantCoApplicant}`,
              "CKYC ID Not Available",
              "error",
              "CKYC ID Not Available",
              null,
              curRecord.dpancard,
              {
                "Pan No": curRecord.dpancard
              },
              'ckyc_data'
            ));

          }
          else {
            
            CKYCArray.push(formJSONTableResponse(
              `CKYC Data ${isApplicantCoApplicant}`,
              "CKYC not verified",
              "warning",
              "CKYC not verified",
              null,
              curRecord.dpancard,
              {
                "Pan No": curRecord.dpancard
              },
              'ckyc_data'
            ));

          }
        }

      }

      formJSONTableResponseFinal(CKYCArray, 'CKYC Data', verificationDataArray);
      loanPreFetch.push(formJSONTableResponse(
        'UCIC Details',
        null,
        null,
        null,
        0, businessData.id, preFetchData, 'ucic'
      ));
      formJSONTableResponseFinal(loanPreFetch, 'UCIC Details', verificationDataArray);

      udyamData.push(formJSONTableResponse(
        'Udyam Details',
        null,
        null,
        null,
        0, businessData.id, directorUdyamData, 'udyam'
      ));
      formJSONTableResponseFinal(udyamData, 'Udyam Details', verificationDataArray);

      equifaxArray.push(formJSONTableResponse(
        'Bureau Score',
        null,
        null,
        null,
        remarkCount['equifax'] ? remarkCount['equifax'].length : 0, businessData.id, equifax, 'equifax'
      ));
      // formJSONTableResponseFinal(equifaxArray, 'Bureau Score', verificationDataArray);

      const white_label_id_data = await WhiteLabelSolutionRd.findOne({ id: businessData.white_label_id });
      let document_mapping = JSON.parse(white_label_id_data.document_mapping)
			if (document_mapping && document_mapping.commercial_api && document_mapping.commercial_api[0].product_id.includes(loanData[0].loan_product_id)) {
        let loanDocData = await LoanDocument.find({ business_id: bid, loan: loanData[0].id, doctype: sails.config.muthootCibilApi.commercial_cibil_docTypeId, status: 'active', or: [{ doc_name: { contains: '.pdf' } }, { doc_name: { contains: '.json' } }, { doc_name: { contains: '.html' } }] }).select('doc_name').sort('ints DESC');
        report = null;
        if (loanDocData.length > 0) {
          key = `${forensicData.s3_name}/users_${businessData.userid}`;
          report = await sails.helpers.s3View(key, loanDocData[0].doc_name, forensicData.s3_region);
        }
        let commercialDetails = {
          business_name: businessname,
          business_pan: businesspancardnumber,
          business_mobile: contactno,
          commercial_rank: commercialResponse && commercialResponse.base && commercialResponse.base.responseReport && commercialResponse.base.responseReport.productSec && commercialResponse.base.responseReport.productSec.rankSec && commercialResponse.base.responseReport.productSec.rankSec.rankVec.length > 0 && commercialResponse.base.responseReport.productSec.rankSec.rankVec[0].rankValue || '',
          rank_reason: commercialResponse && commercialResponse.base && commercialResponse.base.responseReport && commercialResponse.base.responseReport.productSec && commercialResponse.base.responseReport.productSec.rankSec && commercialResponse.base.responseReport.productSec.rankSec.rankVec.length > 0 && commercialResponse.base.responseReport.productSec.rankSec.rankVec[0].exclusionReason || '',
          commercial_report: report
        }
        commercialArray.push(formJSONTableResponse(
          'Commercial Rank',
          null,
          null,
          null,
          remarkCount['commercial'] ? remarkCount['commercial'].length : 0, businessData.id, commercialDetails, 'commercial'
        ));
        equifaxArray.push(commercialArray[0])
      }
      formJSONTableResponseFinal(equifaxArray, 'Bureau Score', verificationDataArray);
      // ekyc response will contain aadhar, pan, voter and license and business id
      let kycData_fetch = await EKycResponse.find({
        kyc_key: whereCondition
      }).sort('id DESC');
      let kycData = [];
      for (const element of kycData_fetch) {
        let data = kycData.find(o => o.kyc_key == element.kyc_key);
        if (!data) {
          kycData.push(element);
        }
      }
      let tempKycData = [];
      kycData.forEach(curElm => {
        curElm.isApplicant = false;
        if (applicantMap[curElm.kyc_key] && applicantMap[curElm.kyc_key].isApplicant) {
          curElm.isApplicant = true;
          tempKycData.unshift(curElm);
        } else {
          tempKycData.push(curElm);
        }
        if (applicantMap[curElm.kyc_key]) curElm.name = applicantMap[curElm.kyc_key].name;
        if (applicantMap[curElm.kyc_key]) curElm.user_type = applicantMap[curElm.kyc_key].user_type;
      });

      kycData = tempKycData;

      if (kycData.length > 0) {
        kycData.forEach((element) => {
          let isApplicantCoApplicant = '';
          isApplicantCoApplicant = '(' + (element.user_type) + `-${element.name})`
          if (element.remarks) {
            let m = JSON.parse(element.remarks);
            kycRemarkCount = m;
          }
          else {
            kycRemarkCount = 0;
          }
          let arrayResponse = {};
          if (element.verification_response) {
            if (typeof element.verification_response == 'string' && element.verification_response != '') {
              arrayResponse = JSON.parse(unescape(element.verification_response))
            }
            else {
              arrayResponse = element.verification_response;
            }

            // eval(element.type + "Array")[0] = arrayResponse['verificationData']
            // eval(element.type + "Forensic")[0] = arrayResponse['forensicData']
            // if (arrayResponse['forensicData']) {
            //   eval(element.type + "Forensic")[1] = arrayResponse['forensicData']['flag']
            //   eval(element.type + "Forensic")[2] = arrayResponse['forensicData']['flag_message']
            // }

            // eval(element.type + "Forensic")[3] = element.id;
            // eval(element.type + "Forensic")[4] = kycRemarkCount['verificationRemarks'] ? kycRemarkCount['verificationRemarks'].length : 0
            // eval(element.type + "Forensic")[5] = kycRemarkCount['forensicRemarks'] ? kycRemarkCount['forensicRemarks'].length : 0;
            // eval(element.type + "Forensic")[6] = isApplicantCoApplicant;

            let verificationData = arrayResponse['verificationData'];
            let forensicData = arrayResponse['forensicData'];
            let forensicFlag = '', forensicMessage = '';
            if (arrayResponse['forensicData']) {
              forensicFlag = arrayResponse['forensicData']['flag'] || '';
              forensicMessage = arrayResponse['forensicData']['flag_message'] || '';
            }

            let ekycResponseId = element.id;
            let verificationRemarksCount = kycRemarkCount['verificationRemarks'] ? kycRemarkCount['verificationRemarks'].length : 0
            let forensicRemarksCount = kycRemarkCount['forensicRemarks'] ? kycRemarkCount['forensicRemarks'].length : 0;

            let verifiedflag = null;
            if (verificationData) {
              verifiedflag = (
                verificationData.message &&
                (verificationData.message.verified || verificationData.message.verification)) ? 'Success' : 'Error';
            }

            KYCArray.push(formJSONTableResponse(
              sails.config.verificationDataConstants[element.type] + isApplicantCoApplicant,
              null,
              verifiedflag,
              null,
              verificationRemarksCount,
              ekycResponseId,
              [verificationData],
              `${element.type}_verification`
            ));

            // Put condition that if the whitelabel has forensic enabled only that will display
            if (isForensic)
              KYCForensicArray.push(formJSONTableResponse(
                sails.config.forensicDataConstants[element.type] + isApplicantCoApplicant,
                null,
                forensicFlag,
                forensicMessage,
                forensicRemarksCount,
                ekycResponseId,
                forensicData,
                `${element.type}_forensic`
              ))

          }
          // if (element.type == "aadhar" && element.response) {

          //   arrayResponse = JSON.parse(unescape(element.response))

          //   aadharArray[0] = arrayResponse
          //   eval(element.type + "Forensic")[3] = element.id;
          //   eval(element.type + "Forensic")[4] = kycRemarkCount['verificationRemarks'] ? kycRemarkCount['verificationRemarks'].length : 0
          // }



        });
        // for (let i = 0; i < sails.config.kycArray.length; i++) {
        //   let verificationData = eval(sails.config.kycArray[i] + "Array")[0], verifiedflag = null;
        //   if (verificationData) {
        //     verifiedflag = (verificationData.message && (verificationData.message.verified || verificationData.message.verification)) ? "Success" : "Error";
        //   }

        //   KYCArray.push(formJSONTableResponse(
        //     sails.config.verificationDataConstants[sails.config.kycArray[i]] + eval(sails.config.kycArray[i] + "Forensic")[6],
        //     null,
        //     verifiedflag,
        //     null,
        //     eval(sails.config.kycArray[i] + "Forensic")[4],
        //     eval(sails.config.kycArray[i] + "Forensic")[3],
        //     eval(sails.config.kycArray[i] + "Array"),
        //     `${sails.config.kycArray[i]}_verification`
        //   ));

        //   // Put condition that if the whitelabel has forensic enabled only that will display
        //   if (isForensic)
        //     KYCForensicArray.push(formJSONTableResponse(
        //       sails.config.forensicDataConstants[sails.config.kycArray[i]] + eval(sails.config.kycArray[i] + "Forensic")[6],
        //       null,
        //       eval(sails.config.kycArray[i] + "Forensic")[1],
        //       eval(sails.config.kycArray[i] + "Forensic")[2],
        //       eval(sails.config.kycArray[i] + "Forensic")[5],
        //       eval(sails.config.kycArray[i] + "Forensic")[3],
        //       eval(sails.config.kycArray[i] + "Forensic")[0],
        //       `${sails.config.kycArray[i]}_forensic`
        //     ))
        // }
      }
      // find pan card details from panno_response and add kyc_key and the extracted pannumber data in the description. Refer PRD design statement
      let applicantCoApplicants = await Director.find({ business: bid, status: "active" }).select([
        'dpancard',
        'isApplicant',
        'dfirstname',
        'dlastname',
        'type_name'
      ]);
      isApplicantMapping = {};
      let panNumbers = applicantCoApplicants.map(applicantCoApplicant => {
        isApplicantMapping[applicantCoApplicant.dpancard] = { ...applicantCoApplicant };
        if (applicantCoApplicant.isApplicant) return applicantCoApplicant.dpancard || businesspancardnumber || undefined;
        return applicantCoApplicant.dpancard || undefined;
      });

      //if the businesspancardnumber is already present in panNumbers array make it null
      panNumbers.forEach((item) => {
        if (item == businesspancardnumber)
          businesspancardnumber = null;
      })

      if (businesspancardnumber) panNumbers.push(businesspancardnumber);

      let panKYCArray;
      panKYCArray = panArray = await PannoResponse.find({ kyc_key: panNumbers });
      /* Sort Pan Array(First applicant and then coApplicants) */
      let tempPanArray = [];
      panArray.forEach((curElm) => {
        curElm.isApplicant = false;
        if (isApplicantMapping[curElm.kyc_key] && isApplicantMapping[curElm.kyc_key].isApplicant) {
          curElm.isApplicant = true;
          tempPanArray.unshift(curElm);
        } else {
          tempPanArray.push(curElm);
        }
        if (isApplicantMapping[curElm.kyc_key]) curElm.name = isApplicantMapping[curElm.kyc_key].dfirstname + ' ' + isApplicantMapping[curElm.kyc_key].dlastname;
        if (isApplicantMapping[curElm.kyc_key]) curElm.user_type = isApplicantMapping[curElm.kyc_key].type_name;
        if (businesspancardnumber && curElm.kyc_key == businesspancardnumber) {
          curElm.name = businessname;
          curElm.user_type = 'Entity'
        }
      });

      panArray = tempPanArray;

      let panKycData = {};
      panKYCArray.forEach(item=> {const response = JSON.parse(item.verification_response)?.nsdlPanData?.data;
      if(response)panKycData[item.kyc_key]={pan_no: response.pan_number,full_name: response.full_name,first_name: response.full_name_split?.[0],last_name: response.full_name_split?.[1],aadhar_number: response.masked_aadhaar,email: response.email,contact_no: response.phone_number,date_of_birth: response.dob}})
      let nsdl_verified_data = [];
    if(Object.keys(panKycData).length){
      nsdl_verified_data = [{}]
      directorData.forEach(dir => {
        nsdl_verified_data[0][dir.id]={loan_data: {pan_no: dir.dpancard,full_name: dir.dfirstname+" "+dir.dlastname ,first_name: dir.dfirstname,last_name: dir.dlastname,aadhar_number: dir.daadhaar,email: dir.demail,contact_no: dir.dcontact,date_of_birth: dir.ddob},nsdl_data: panKycData[dir.dpancard],type_name: dir.type_name}
      })
      if (businesspancardnumber)nsdl_verified_data[0][bid] = {loan_data: {pan_no: businessData.businesspancardnumber,full_name:businessData.businessname,first_name: businessData.businessname,last_name: null, aadhar_number: null,email: businessData.business_email,contact_no: businessData.contactno,date_of_incorporation: businessData.businessstartdate},
                nsdl_data: panKycData[businessData.businesspancardnumber],type_name: "business"}

                nsdlData.push(formJSONTableResponse(
                  'NSDL PAN Details',
                  null,
                  null,
                  null,
                  0, businessData.id, nsdl_verified_data, 'nsdl'
                ));
    }
      formJSONTableResponseFinal(nsdlData, 'NSDL PAN Details', verificationDataArray);


      for (let i = 0; i < panArray.length; i++) {
        let panResponse = JSON.parse(panArray[i]['verification_response'])
        let flagVerified;
        let isApplicantCoApplicant = '';
        if (panArray.length > 1) {
          isApplicantCoApplicant += '(' + (panArray[i].user_type) + '-' + panArray[i].name + ')';
        }
        request_id = panArray[i].id;
        if (panResponse) {
          let flag = panResponse['forensicData'] ? panResponse['forensicData']['flag'] : null;
          let flagMessage = panResponse['forensicData'] ? panResponse['forensicData']['flag_message'] : null;
          let description = `OCR Output ${panResponse['extractionData'] ? panResponse['extractionData']['Pan_number'] : 'NA'} : Confirmed Pan ${panResponse['verificationData'] ? panResponse['verificationData']['kyc_key'] : 'NA'}`
          flagVerified = panResponse?.verificationData?.message?.verified || null;
          if (flagVerified === true) { flagVerified = 'Success' } else flagVerified = 'Error'
          if (panArray[i]['remarks']) {
            let m = JSON.parse(panArray[i]['remarks']);
            kycRemarkCount = m;
          } else kycRemarkCount = 0
          // Rename kyc_key to pan number - Bug fix
          if (panResponse['verificationData'] && panResponse['verificationData']['kyc_key']) {
            panResponse['verificationData']['pan_number'] = panResponse['verificationData']['kyc_key'];
            delete panResponse['verificationData']['kyc_key'];
          }
          let panVerificationRemarkCount = 0;
          let panForensicRemarkCount = 0;
          // Changes now made in pan number remark counts on the basis of loan_ref_id.
          if (kycRemarkCount['verificationRemarks'] && kycRemarkCount['verificationRemarks'].hasOwnProperty(loanRefId)) {
            panVerificationRemarkCount = kycRemarkCount['verificationRemarks'][loanRefId].length;
          }
          if (kycRemarkCount['forensicRemarks'] && kycRemarkCount['forensicRemarks'].hasOwnProperty(loanRefId)) {
            panForensicRemarkCount = kycRemarkCount['forensicRemarks'][loanRefId].length;
          }

          KYCArray.push(formJSONTableResponse(
            `Pan Verification Data ${isApplicantCoApplicant}`,
            description,
            flagVerified,
            null,
            panVerificationRemarkCount,
            request_id,
            panResponse['verificationData'],
            'pan_verification'
          ));
          // Put condition that if the whitelabel has forensic enabled only that will display
          if (isForensic)
            KYCForensicArray.push(formJSONTableResponse(
              `Pan Forensic Check ${isApplicantCoApplicant}`,
              null,
              flag,
              flagMessage,
              panForensicRemarkCount,
              request_id,
              panResponse['forensicData'],
              'pan_forensic'
            ));
        }
      }

      formJSONTableResponseFinal(KYCArray, 'KYC Verification Data', verificationDataArray)
      // Put condition that if the whitelabel has forensic enabled only that will display
      if (isForensic)
        formJSONTableResponseFinal(KYCForensicArray, 'Forensic', verificationDataArray);
      // crime check table has crime check for business id
      // let crimeCheckData = await business.findOne({ bid: bid });
      if (businessData.crime_check) {
        let crimeStatus = {
          crime_check: businessData.crime_check
        }
        crimeArray[0] = formJSONTableResponse('Crime Check', null, null, null, remarkCount['crime'] ? remarkCount['crime'].length : 0, businessData.id, crimeStatus, 'crime')
      }
      formJSONTableResponseFinal(crimeArray, 'Crime Check', verificationDataArray)

      // find GST data from gst_master
      if (businessData.gstin) {
        let gstData_fetch = await GstMaster.find({ gst_no: businessData.gstin });
        let gstData = [];
        for (const element of gstData_fetch) {
          let data = gstData.find(o => o.gst_no == element.gst_no);
          if (!data) {
            gstData.push(element);
          }
        }
        let gstRemarkCount = 0;

        if (gstData.length > 0) {
          gstData.forEach((element) => {
            if (element.remarks) {
              gstRemarkCount = JSON.parse(element.remarks).length;
            } else gstRemarkCount = 0;
            let gstOutput = element.gst_output ? element.gst_output.replace(/[\r]?[\n]/g, '\\n') : '';
            if (isJsonString(gstOutput)) {
              //parse
              gstOutput = JSON.parse(gstOutput);
              gstOutput.table_description = null,
                gstOutput.flag = null,
                gstOutput.flag_message = null,
                gstOutput.remarks_count = gstRemarkCount,
                gstOutput.request_id = element.id,
                gstOutput.section_key = 'gst'
              //stringify
              gstOutput = JSON.stringify(gstOutput)
            }
            GSTArray.push(formJSONTableResponse('GST Data', null, null, null, gstRemarkCount, element.id, typeof gstOutput == 'string' && gstOutput != '' && isJsonString(gstOutput) ? JSON.parse(unescape(gstOutput)) : element.gst_output, 'gst'));
          })
        }
      }

      // find ROC data from company_master_data
      if (businessData.corporateid) {
        let rocRemarkCount = 0;
        let rocData = await CompanyMasterData.find({ cin: businessData.corporateid });
        if (rocData.length > 0) {
          rocData.forEach((element) => {
            if (element.remarks) {
              rocRemarkCount = JSON.parse(element.remarks).length;
            }
            else {
              rocRemarkCount = 0;
            }
            ROCArray.push(formJSONTableResponse('ROC Data', null, null, null, rocRemarkCount, element.id, typeof element.OUTPUT_JSON == 'string' && element.OUTPUT_JSON != '' ? JSON.parse(unescape(element.OUTPUT_JSON)) : element.OUTPUT_JSON, 'roc'));
          })
        }
      }

      // find ITR data from business_entity_financial

      let itrData = await BusinessEntityFinancial.find({ pan_number: businessData.businesspancardnumber, e_verification_status: { '!=': '' } }).sort('id DESC').limit(1);
      let itrRemarks = 0;
      if (itrData.length > 0) {
        itrData.forEach((element) => {
          if (element.remarks) {
            itrRemarks = JSON.parse(element.remarks).length
          } else { itrRemarks = 0 }
          let object = {
            status: element.e_verification_status
          }
          if (element.e_verification_status)
            ITRArray.push(formJSONTableResponse('ITR Data', null, null, null, itrRemarks, element.id, object, 'itr'));
        })
      }


      formJSONTableResponseFinal(GSTArray, 'GST Verification Data', verificationDataArray);
      formJSONTableResponseFinal(ITRArray, 'ITR', verificationDataArray);
      formJSONTableResponseFinal(ROCArray, 'ROC', verificationDataArray);
      data = verificationDataArray;

      return res.ok({ status: 'ok', message: 'Verification Data', data });
    }
  },


  verificationDataCub: async function (req, res) {
    let bid = req.param('businessId');
    if (!bid) return res.ok(sails.config.errRes.missingFields);

    let businessData = await Business.findOne({ id: bid });
    if (!businessData)
      return res.ok({
        status: 'nok',
        message: 'No data found for the business id OR wrong business id',
      });

    let {
      legal_entity_data,
      esic_data,
      epfo_data,
      google_search_data,
      credit_ratings,
      business_email,
    } = businessData;
    let clientData = await Clients.find({ email: businessData.business_email });

    let googleString = JSON.parse(unescape(google_search_data));
    let creditString = JSON.parse(unescape(credit_ratings));
    let data = {
      legalReport_verificationData: legal_entity_data,
      google_search_data: googleString,
      credit_ratings: creditString,
    };

    let panNo = [];

    let loanData = await Loanrequest.findOne({ business_id: bid });
    if (loanData) {
      (whereCondition = []), (equifax = []);
      let directorData = await Director.find({ business: bid });
      if (loanData.loan_request_type == 2) {
        directorData.forEach((dirData) => {
          if (dirData.daadhaar) {
            whereCondition.push(dirData.daadhaar);
          }
          if (dirData.dpassport) {
            whereCondition.push(dirData.dpassport);
          }
          if (dirData.dvoterid) {
            whereCondition.push(dirData.dvoterid);
          }
          if (dirData.ddlNumber) {
            whereCondition.push(dirData.ddlNumber);
          }
          if (dirData.dpancard) {
            panNo.push(dirData.dpancard);
          }
          equifax.push({ [`${dirData.dfirstname}_${dirData.dlastname}`]: dirData.dcibil_score });
        });
        data.Equifax_score = equifax;
        let kycData = await EKycResponse.find({ kyc_key: whereCondition });
        if (kycData.length > 0) {
          kycData.forEach((element) => {
            if (element.type == 'aadhar') {
              data.Adhar_verificationData = element.response;
            }
            if (element.type == 'voter') {
              data.VoterId_verificationData = element.response;
            }
            if (element.type == 'license') {
              data.dl_verificationData = element.response;
            }
            if (element.type == 'passport') {
              data.Passport_verificationData = element.response;
            }
          });
        }
        let gstFetchData = await RequestDocument.find({
          client_id: clientData.client_id,
          request_type: 'ITR',
        });
        if (gstFetchData) {
          let itrData = [];
          gstFetchData.forEach((element) => {
            itrData.push(element.response);
          });
          data.ITR_data = itrData;
        }
      } else if (loanData.loan_request_type == 1) {
        panNo.push(businessData.businesspancardnumber);
        let req_type = ['GST', 'ITR', 'ESIC', 'EPFO', 'ROC', 'UDYOG_ADHAR'];
        let gstData = await RequestDocument.find({
          client_id: clientData.client_id,
          request_type: req_type,
        });
        if (gstData.length > 0) {
          let GST = [],
            ITR = [],
            ROC = [],
            UDYOG_ADHAR = [];
          gstData.forEach((gData) => {
            if (gData.request_type == 'GST') {
              GST.push(gData.response);
            }
            if (gData.request_type == 'ITR') {
              ITR.push(gData.response);
            }
            if (gData.request_type == 'ESIC') {
              data.ESIC_verificationData = gData.response;
            }
            if (gData.request_type == 'EPFO') {
              data.EPFO_verificationData = gData.response;
            }
            if (gData.request_type == 'ROC') {
              ROC.push(gData.response);
            }
            if (gData.request_type == 'UDYOG_ADHAR') {
              data.UDYOG_ADHAR_verificationData = gData.response;
            }
          });
          data.ESIC_verificationData = esic_data;
          data.EPFO_verificationData = epfo_data;
          data.GST_verificationData = GST;
          data.ITR_data = ITR;
          data.ROC_verificationData = ROC;
        }
        let crimeCheckData = await CrimeCheck.findOne({ bid: bid });
        if (crimeCheckData) {
          data.Crime_Check_Data = crimeCheckData.report_json;
        }
        directorData.forEach((dirData) => {
          // equifax.push(dirData.dcibil_score);
          equifax.push({ [`${dirData.dfirstname}_${dirData.dlastname}`]: dirData.dcibil_score });
        });
        data.Equifax_score = equifax;
      }
      let panData = await PannoResponse.find({ kyc_key: panNo });
      if (panData.length > 0) {
        let pData = [], response;
        panData.forEach((pan) => {
          try {
            const parseData = JSON.parse(pan.response);
            response = pan.response;
          } catch (e) {
            response = null;
          }
          pData.push({ response: response, verified_on: pan.dt_created });
        });
        data.Pan_verificationData = pData;
      }
    }

    return res.ok({ status: 'ok', message: 'Verification Data', data });
  },

  verificationApisData: async function (req, res) {
    let request_type = req.param('request_type');
    const request_id = req.param('request_id');
    if (!request_type || !request_id)
      return res.ok(sails.config.errRes.missingFields);

    let gstFetchData = await RequestDocument.find({ request_id, request_type });
    if (gstFetchData.length > 0) {
      if (gstFetchData[0].response) {
        let data = gstFetchData[0].response;
        return res.ok({ status: 'ok', message: 'Verification Data', data });
      } else {
        return res.ok({ status: 'nok', message: 'Data not found', data: null });
      }
    } else {
      return res.ok({
        status: 'nok',
        message: 'No record found for request_id',
      });
    }
  },
  getUdyamData: async function (req, res) {
    const {business_id,uploadFileToS3} = req.allParams();
    if (!business_id) return res.ok(sails.config.errRes.missingFields);
    const loanData = await Loanrequest.findOne({business_id: business_id}).populate("business_id");
    if(!loanData)return res.ok({status: "ok",message: "Invalid Business ID"});
    const {s3_name} = await WhiteLabelSolutionRd.findOne({id: loanData.white_label_id}).select("s3_name");
    const bucket = s3_name + "/users_" + loanData.business_id.userid;
    const directorData = await Director.find({ business: business_id });
    let data = [], loanDoc;
    if (directorData.length > 0) {
      for (director of directorData) {
        let document;
        let udyamResponse = JSON.parse(director.udyam_response),error_message;
        if (director.udyam_number && udyamResponse && udyamResponse.transanction_id && !udyamResponse.data && !udyamResponse.error_message) {
         let udyamData = await RequestDocument.findOne({ request_id: udyamResponse.transanction_id, request_type: "UDYAM" }).select("response");
          if (udyamData) {
            udyamResponse.data = udyamData.response;
            if(!udyamData.response || udyamData.response=="")error_message = "The source is unable to do the verification! It got timed out!"
            else {
              let response = JSON.parse(udyamData.response);
              if(response?.result?.pdfUrl &&uploadFileToS3) loanDoc = await saveUdyamFileToS3AndLoanDoc(response.result.pdfUrl,bucket,loanData,director.udyam_number,director.id);
              else{
                if(response?.error?.status=="404")error_message="The udyam number is not found!"
                else if (response?.error?.status=="409")error_message="The source is down! Unable to do the verification!"
                else if (response?.message == "The upstream server is timing out")error_message="The source is unable to do the verification! It got timed out!"
              }
            }
            udyamResponse.error_message = error_message
            await Director.updateOne({ id: director.id }).set({ udyam_response: JSON.stringify(udyamResponse) })
          }
        }
        if(director.udyam_number && uploadFileToS3){
          const loan_doc_data = await LoanDocument.find({doctype: sails.config.udyamReportDocTypeId,directorId: director.id, business_id,status: "active" }).sort("id desc");
          if(loan_doc_data.length)document = await sails.helpers.s3View(bucket, loan_doc_data[0].doc_name);
        }
          data.push({ director_id: director.id, udyam_data: udyamResponse && udyamResponse.data ? JSON.parse(udyamResponse.data) : null,error_message: udyamResponse?.error_message,document})
      }
    }
    return res.ok({
      status: "ok",
      message: "Udyam Data fetched successfully",
      data
    })
  },
  getUdyamDataToBusiness : async function (req,res){
    const business_id = req.param("business_id");
    if (!business_id) return res.ok(sails.config.errRes.missingFields);
    let businessData = await Business.findOne({id: business_id}).select(["udyam_response","udyam_number","additional_info"]);
    if(!businessData)return res.ok({status: "nok",message: "No Business Record found"})
    let udyamResponse = JSON.parse(businessData.udyam_response),error_message,additional_info;
        if (businessData.udyam_number && udyamResponse && udyamResponse.transanction_id && !udyamResponse.data && !udyamResponse.error_message) {
         let udyamData = await RequestDocument.findOne({ request_id: udyamResponse.transanction_id, request_type: "UDYAM" }).select("response");
          if (udyamData) {
            udyamResponse.data = udyamData.response;
            if(!udyamData.response || udyamData.response=="")error_message = " The source is unable to do the verification! It got timed out!"
            else {
              let response = JSON.parse(udyamData.response);
              const {majorActivity,socialCategory} = response?.result?.generalInfo || {}
              if(majorActivity||socialCategory){additional_info= JSON.parse(businessData.additional_info) || {};
              additional_info.sector = majorActivity
              additional_info.category=socialCategory}
              if(response?.error?.status=="404")error_message="The udyam number is not found!"
              else if (response?.error?.status=="409")error_message="The source is down! Unable to do the verification!"
              else if (response?.message == "The upstream server is timing out")error_message="The source is unable to do the verification! It got timed out!"
            }
            udyamResponse.error_message = error_message
            await Business.updateOne({ id: business_id}).set({ udyam_response: JSON.stringify(udyamResponse),additional_info: JSON.stringify(additional_info) })
          }
        }
        return res.ok({
          status: "ok",
          message: "Udyam Data fetched successfully",
          data : {
            udyam_number: businessData.udyam_number,
            udyam_response: udyamResponse,
            error_message : udyamResponse?.error_message
          }
        })
  },
  // This code is now shifted to sails-experiment project. This can be removed from here.
  addVerificationRemarks: async function (req, res) {
    // The remarks now will be added on basis of sections. Every section is a table, and that when received from FE will check which table to insert remarks in.
    const request_id = req.body.request_id;
    const remarks = req.body.remark;
    const section = req.body.section_key; // This will be an additional parameter in FE
    const loan_ref_id = req.body.loan_ref_id;
    const business_id = req.body.business_id;


    if (!request_id || !remarks || !section || !business_id)
      return res.ok(sails.config.errRes.missingFields);
    // request_id in the request payload is the respective primary key of the tables from which the data had been fetched. It will be used again primary key of all the tables according to section
    try {
      let previousRemarks;
      let remarkUpdate;
      let remarkObject = [];
      let newRemarkObject = {
        commentor_name: req.client_data.client_name,
        created_at: await sails.helpers.dateTime(),
        remark: remarks
      }
      switch (section) {
        case 'pan':
          // update panno_response table against the kyc_key found in director table against the primary id
          previousRemarks = await PannoResponse.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
              remarkObject.push(newRemarkObject);
            }
            else {
              remarkObject.push(newRemarkObject);
            }
            remarkUpdate = await PannoResponse.update({
              id: request_id
            }).set({
              remarks: JSON.stringify(remarkObject)
            })
          }
          else throw ('Invalid request Id')
          break;
        case 'aadhar':
        case 'voter':
        case 'passport':
        case 'license':
          // update ekyc_response_table against primary key
          previousRemarks = await EKycResponse.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
              remarkObject.push(newRemarkObject);
            }
            else {
              remarkObject.push(newRemarkObject);
            }
            remarkUpdate = await EKycResponse.update({
              id: request_id
            }).set({
              remarks: JSON.stringify(remarkObject)
            })
          }
          else throw ('Invalid Request Id')
          break;
        case 'legal':
        case 'esic':
        case 'epfo':
        case 'google':
        case 'equifax':
        case 'crime':
        case 'credit':
        case 'roc':
        case 'email':
          // update business table against primary key
          previousRemarks = await Business.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
              if (remarkObject[section]) {
                remarkObject[section].push(newRemarkObject);
              }
              else {
                remarkObject[section] = [];
                remarkObject[section].push(newRemarkObject);
              }

            }
            else {
              remarkObject = {
                [section]: []
              };
              remarkObject[section].push(newRemarkObject);
            }
            remarkUpdate = await Business.update({
              id: request_id
            }).set({
              remarks: JSON.stringify(remarkObject)
            })
          }
          else throw ('Invalid Request Id')

          break;
        case 'gst':
          // update gst_master table against primary key
          previousRemarks = await GstMaster.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
              remarkObject.push(newRemarkObject);
            }
            else {
              remarkObject.push(newRemarkObject);
            }
            remarkUpdate = await GstMaster.update({
              id: request_id
            }).set({
              remarks: JSON.stringify(remarkObject)
            })
          }
          else throw ('Invalid request Id')
          break;
        case 'itr':
          // update business_entity_financial against primary key
          previousRemarks = await BusinessEntityFinancial.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
              remarkObject.push(newRemarkObject);
            }
            else {
              remarkObject.push(newRemarkObject);
            }
            remarkUpdate = await BusinessEntityFinancial.update({
              id: request_id
            }).set({
              remarks: JSON.stringify(remarkObject)
            })
          }
          else throw ('Invalid request Id')
          break;
        default:
          return res.send({
            status: 'nok',
            message: 'Invalid section key.'
          })

      }

      return res.send({
        status: 'ok',
        message: 'Added remarks successfully.'
      })
    }
    catch (e) {
      return res.send({
        status: 'nok',
        message: e
      })
    }


  },
  // This code is now shifted to sails-experiment project. This can be removed from here.
  getVerificationRemarks: async function (req, res) {
    // The verification remarks now will need to send for which section they are required including loan_ref_id
    const section_key = req.param('section_key');
    const business_id = req.param('business_id');
    const loan_ref_id = req.param('loan_ref_id');
    const request_id = req.param('request_id');
    if (!loan_ref_id || !section_key || !business_id || !request_id)
      return res.ok(sails.config.errRes.missingFields);
    try {
      let remarkObject;
      switch (section_key) {
        case 'pan':
          // update panno_response table against the kyc_key found in director table against the primary id
          previousRemarks = await PannoResponse.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
            }
          }
          else throw ('Invalid request Id')
          break;
        case 'aadhar':
        case 'voter':
        case 'passport':
        case 'license':
          // update ekyc_response_table against primary key
          previousRemarks = await EKycResponse.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks)[section_key];
            }
          }
          else throw ('Invalid Request Id')
          break;
        case 'legal':
        case 'esic':
        case 'epfo':
        case 'google':
        case 'equifax':
        case 'crime':
        case 'credit':
        case 'roc':
        case 'email':
          // update business table against primary key
          previousRemarks = await Business.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks)[section_key];
            }
          }
          else throw ('Invalid Request Id')

          break;
        case 'gst':
          // update gst_master table against primary key
          previousRemarks = await GstMaster.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
            }
          }
          else throw ('Invalid request Id')
          break;
        case 'itr':
          // update business_entity_financial against primary key
          previousRemarks = await BusinessEntityFinancial.findOne({ id: request_id });
          if (previousRemarks) {
            if (previousRemarks.remarks) {
              remarkObject = JSON.parse(previousRemarks.remarks);
            }
          }
          else throw ('Invalid request Id')
          break;
        default:
          return res.send({
            status: 'nok',
            message: 'Invalid section key.'
          })

      }
      return res.send({
        status: 'ok',
        message: '',
        data: remarkObject
      })
    }
    catch (e) {
      return res.send({
        status: 'nok',
        message: 'something went wrong'
      })
    }

  },
  //This should be removed too, this is no more required.
  updateVerificationCheck: async function (req, res) {
    // This API is no more required since verification failed or was a success can be figured out from panno_response table or ekyc table depending on the doctype
    const business_id = req.param('business_id');
    if (!business_id)
      return res.ok(sails.config.errRes.missingFields);

    let businessData = await Business.findOne({ id: business_id });
    if (!businessData)
      return res.ok({
        status: 'nok',
        message: 'No data found for the business id OR wrong business id',
      });

    let clientData = await Clients.find({ email: businessData.business_email });
    if (clientData) {
      let clientRequest = await ClientRequest.count({ client_id: clientData.client_id, req_status: 'failed' });
      if (clientRequest > 0) {
        // update to business table
        // let updatedData = await Business.updateOne({bid: business_id}).set({
        //   verification_check: 1
        // });
        return res.ok({
          status: 'ok',
          message: 'Sucessfully updated'
        });
      }
      else {
        return res.ok({
          status: 'ok',
          message: 'No Data'
        });
      }
    }


  }
};
// This function should also consider one more parameter "key" to tell
function formJSONTableResponse(heading, description, flag, flag_message, remarks_count, request_id, table_data, section_name) {


  let table_object = {
    table_caption: heading,
    table_description: description,
    table_data: table_data,
    flag: flag,
    flag_message: flag_message,
    remarks_count: remarks_count,
    request_id: request_id,
    section_key: section_name
  }
  return table_object;


}

function formJSONTableResponseFinal(array, section_name, verificationDataArray) {
  let table_object = {
    section_name: section_name,
    data: array
  }
  verificationDataArray.push(table_object);
}
function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

async function saveUdyamFileToS3AndLoanDoc(url,bucket,loanData,udyamNo,directorId) {
  const document = await axios.get(url, {responseType: 'arraybuffer'});
  if(!document)return {status: "nok"};
  const businessData = loanData.business_id;
  const key= `UdyamReport_${udyamNo}_${directorId||businessData.id}.pdf`
  const s3Upload = await sails.helpers.s3Upload(bucket,key,document.data);
  if(!s3Upload.Location)return {status: "nok"};
  const datetime = await sails.helpers.dateTime();
  if(businessData.id && loanData.id && sails.config.udyamReportDocTypeId){
    await LoanDocument.update({loan: loanData.id,business_id:businessData.id,directorId: directorId||0,user_id: businessData.userid,doctype:sails.config.udyamReportDocTypeId,
      status: "active"}).set({status: "inactive"})
  }
  const loanDocument = await LoanDocument.create({loan: loanData.id,business_id:businessData.id,directorId: directorId||0,user_id: businessData.userid,doctype:sails.config.udyamReportDocTypeId,doc_name: key,
  uploaded_doc_name:key, original_doc_name:key,status: "active",ints:datetime,uploaded_by: businessData.userid}).fetch();
  return loanDocument;
}
