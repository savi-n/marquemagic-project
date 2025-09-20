const axios = require("axios");
const moment = require("moment");

module.exports = {


  friendlyName: 'Hdfc life proposal',


  description: '',


  inputs: {
    insuredApplicant: {
      type: "ref",
      required: true
    },
    loanId: {
      type: "number"
    },
    authorization: {
      type: "string"
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const loanId = inputs.loanId;
    const insuredApplicant = inputs.insuredApplicant;
    const authorization = inputs.authorization;
    const payload = await getPayload(loanId, insuredApplicant, authorization);
    const response = await sails.helpers.axiosApiCall(
      sails.config.insurance.hdfc.urls.proposal,
      {payload, loan_id: loanId},
      {"content-type": "application/json"},
      "post"
    );

    const apiRes = response.data;

    const prn = apiRes?.data?.metaData?.prn;
    const status = apiRes?.data?.metaData?.status;
    await InsuranceProposal.updateOne({
      ins_app_ref: inputs?.insuredApplicant?.id
    }).set({
      proposal_ref_num: prn,
      status
    })

    exits.success(response.data);
  }


};


async function getPayload(loanId, insuredApplicant, authorization) {
  const loanrequest = await LoanrequestRd.findOne({
    id: loanId
  }).populate([
    "business_id",
  ]).select(["loan_ref_id", "business_id"]);

  const loanRefId = loanrequest?.loan_ref_id;
  const userId = loanrequest?.business_id?.userid;


  const s3Url = `${sails.config.insurance.urls.s3Data}?user_id=${userId}&loan_ref_id=${loanRefId}&form_name=detail.json`
  // const s3Url = "https://muthootuat.namastecredit.com/insurance-finalization/api/s3-file-handler?user_id=126093&loan_ref_id=JHUR71609648&form_name=detail.json";

  let s3Data = await axios({
    method: 'get',
    url: s3Url,
    headers: {
      "content-type": "application/json",
      "Authorization": authorization
    }
  });

  let tragetObj = [];
  let temp = insuredApplicant?.applicant_did;
  let tempRefId = insuredApplicant.id;

  // insuredApplicant.applicant_did = 397210;
  // insuredApplicant.id = 477;
  s3Data = s3Data.data.data;

  for (data of s3Data) {
    if (data.directorId === insuredApplicant?.applicant_did) {
      tragetObj = data?.insurances;
      break;
    }
  }

  let additionalData;
  for (obj of tragetObj) {
    //if (additionalData) break;
    for (applicant of obj?.insuredApplicants) {
      if (applicant?.id == insuredApplicant?.id) {
        additionalData = obj;
        break;
      }
    }
  }

  insuredApplicant.applicant_did = temp;
  insuredApplicant.id = tempRefId;

  const additionalInfo = additionalData.additional_information;
  const nominees = additionalData.nominee;
  const nomineeDetails = [];

  for (nominee of nominees) {
    const nomineeGender = nominee.nominee_gender;
    const apointeeGender = nominee.apointee_gender;

    nomineeDetails.push({
      "title": (nomineeGender == "Male") ? "Mr" : "Mrs",
      "gender": nomineeGender,
      "firstName": nominee.nominee_name,
      "lastName": nominee.nominee_last_name,
      "dob": formatDate(nominee.nominee_dob, 'timestamp'),
      "mobile": nominee.mobile,
      "relationshipToCustomer": nominee.nominee_relation,
      "percentageAllocation": nominee.nominee_contribution,
      "address": {
        "area": nominee.nominee_area,
        "city": nominee.nominee_city,
        "houseOrFlat": nominee.nominee_house_or_flat,
        "pinCode": nominee.nominee_pincode,
        "state": nominee.nominee_states,
        "street": nominee.nominee_street
      },
      "appointeeDetails": nominee.apointee_first_name ?
        {
          "title": (apointeeGender == "Male") ? "Mr" : "Mrs",
          "gender": apointeeGender,
          "firstName": (nominee.apointee_first_name || "").trim(),
          "lastName": (nominee.apointee_last_name || "").trim(),
          "dob": formatDate(nominee.apointee_dob, 'timestamp'),
          "mobile": nominee.apointee_mobile,
          "relationshipToNominee": nominee.apointee_relation,
          "address": {
            "area": nominee.apointee_area,
            "city": nominee.apointee_city,
            "houseOrFlat": nominee.apointee_house_or_flat,
            "pinCode": nominee.apointee_pincode,
            "state": nominee.apointee_state,
            "street": nominee.apointee_streets
          }
        } :
        undefined
    })
  }

  const haveDmat = additionalInfo?.have_demat;
  const haveEia = additionalInfo?.have_eia;
  const isNewEiaRequired = additionalInfo?.is_new_eia_required;
  const eia = additionalInfo?.eia;
  const isNri = additionalInfo?.is_applicant_nri;
  const education = additionalInfo?.applicant_education;
  const occupation = additionalInfo?.applicant_occupation;


  const sanction = await LoanSanction.findOne({
    loan_id: loanId
  }).select([
    "san_interest",
    "san_date",
    "san_amount",
    "amount_um"
  ]);

  const director = await DirectorRd.findOne({
    id: insuredApplicant?.applicant_did
  }).select([
    "ddob",
    "gender",
    "dfirstname",
    "middle_name",
    "dlastname",
    "dcontact",
    "demail",
    "marital_status",
    "address1",
    "address2",
    "address3",
    "address4",
    "locality",
    "city",
    "state",
    "pincode"
  ]);

  const incomeData = await IncomeDataRd.findOne({
    director_id: insuredApplicant?.applicant_did
  }).select([
    "gross_income"
  ])

  const formattedDob = formatDate(director?.ddob, 'yyyy-mm-dd');
  const formattedSancDate = formatDate(sanction?.san_date, 'mm/dd/yyyy');

  const interestRate = sanction?.san_interest;
  let sanAmount = await sails.helpers.unitConverter(sanction?.san_amount, sanction?.amount_um);
  sanAmount = sanAmount.value;
  const basicPremium = Number((insuredApplicant?.ins_charge).toFixed(2));
  const policyTerm = insuredApplicant?.policy_term;
  const totalPremium = Number((insuredApplicant?.ins_charge + insuredApplicant?.gst_charge).toFixed(2)); //basicPremium;
  const gender = director?.gender;
  const firstName = (director?.dfirstname + " " + director?.middle_name).trim();
  const lastName = director?.dlastname;
  const mobile = director?.dcontact;
  const email = director?.demail;

  const grossYearlyIncome = additionalInfo?.gross_yearly_income || incomeData?.gross_income;
  let maritalStatus = director?.marital_status;

  const houseOrFlat = director?.locality;
  const city = director?.city;
  const pinCode = director?.pincode;
  const state = director?.state;
  const area =
    (director?.address1 +
      "," +
      director?.address2 +
      "," +
      director?.address3 +
      "," +
      director?.address4).trim();

  switch (maritalStatus) {
    case "Single":
      maritalStatus = "S";
      break;
    case "Married":
      maritalStatus = "M";
      break;
    case "Widowed":
      maritalStatus = "W";
      break;
    case "Divorced":
      maritalStatus = "D";
      break;
    case "Separated":
    case "Others":
      maritalStatus = "U";

  }

  const sumAssured = insuredApplicant.sum_assured;

  const payload = {
    "metaData": {
      "partnerId": null, // will be replaced in finnone-integration project
      "prn": Date.now() + `-${generateRandomAlphanumericString()}`, // look into it later
      "action": "issue",
      "encryptedAuthSalt": null, // will be replaced in finnone-integration project
      "channel": "GOP",
      "ipAddress": "",
      "domain": "",
      "martId": "Mart Id",
      "plan": `${sails.config.insurance.hdfc.productId}_${sails.config.insurance.hdfc.planId}`, // look into this later
      "customerCommunication": {
        "sendMIFToEmail": "Yes",
        "sendMIFToSms": "Yes",
        "sendCOIToEmail": "Yes",
        "sendCOIUrlToSms": "Yes",
        "sendCOIToSms": "Yes"
      },
      "partnerData": {
        "sumAssuredType": "Decreasing",
        "interestRate": 25, //interestRate,
        "fundingOption": "non-funded"
      },
      "timeZoneOffset": "+05:30"
    },
    "customerDetails": {
      "consentTime": moment().format('MM/DD/YYYY HH:mm:ss'), // need to replace this
      "planId": `${sails.config.insurance.hdfc.productId}_${sails.config.insurance.hdfc.planId}`, // look into this later
      "partnerId": null, // will be replaced in finnone
      "sumAssured": sumAssured,
      "rider": "",
      "dob": formattedDob,
      "lineOfBusiness": "BUL/SAL/CARF/PROL/RL",
      "memberType": "SL",
      //"loanType": "Personal Loan", // always hardcoded, non-mandatory, so omitting
      "loanDisbursement_date": formattedSancDate,
      "loanAmount": sanAmount,
      "basicPremium": basicPremium,
      "policyTerm": policyTerm,
      "premiumPayable": totalPremium,
      //"primaryApplicant": "Yes", // non-mandatory, so omitting
      "personalDetails": {
        "title": (gender == "male") ? "Mr" : "Mrs",
        "gender": (gender == "male") ? "Male" : "Female",
        "firstName": firstName,
        "lastName": lastName,
        "dob": formattedDob,
        "mobile": mobile,
        "email": email,
        //"height": "", // non-mandatory, so omitting
        //"weight": "", // non-mandatory, so omitting
        "countryOfResidence": "IND",
        "grossYearlyIncome": grossYearlyIncome,
        "pan": "",
        "nationality": "Indian",
        "applicantType": "PRA",
        "residentStatus": "Resident Indian",
        //"maritalStatus": maritalStatus, //non-mandatory, so omitting
        //"haveDmat": "No", //haveDmat, //non-mandatory, so omitting
        //"haveEia": "No", //haveEia, // non-mandatory, so omitting
        //"isNewEiaRequired": "No", isNewEiaRequired,
        //"eia": "", //eia, // it is optional // non-mandatory, so omitting
        //"nri": isNri, // Need to get from s3 // non-mandatory, so omitting
        "education": education, // Need to get from s3
        "occupation": occupation, // Need to get from s3
        //"industryType": "", // non-mandatory, so omitting
        "idProofType": "",
        "idProofNumber": "",
        "address": {
          "area": area,
          "city": city,
          "houseOrFlat": houseOrFlat, // see if it works without this
          "pinCode": pinCode,
          "state": state,
          "street": "" // see if it works without this
        },
        "nomineeDetails": nomineeDetails
      },
      "medicalQuestionnaire": {
        "questionnaireId": 30,
        "response": {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
          "6": 0,
          "7": 0,
          "8": 0,
          "9": 0,
          "10": 0,
          "11": 0
        },
        "additionalQuestionnaire": [
          {
            "questionnaireId": 29,
            "response": {
              "C1": 0,
              "C2": 0,
              "C3": 0
            }
          }
        ]
      }
    },
    "loanDetails": [
      {
        "title": (gender == "male") ? "Mr" : "Mrs",
        "applicantType": "pb",
        "firstName": firstName,
        "lastName": lastName
      }
    ]
  }
  return payload;
}

function formatDate(dob, inputFormate) {
  let moodifiedDob;
  switch (inputFormate) {
    case 'yyyy-mm-dd': {
      const dobSplit = dob.split("-");
      moodifiedDob = `${dobSplit[1]}/${dobSplit[2]}/${dobSplit[0]}`;
    }
      break;
    case 'mm/dd/yyyy': {
      const dobSplit = dob.split("/");
      moodifiedDob = `${dobSplit[0]}/${dobSplit[1]}/${dobSplit[2]}`;
    }
      break;
    case 'timestamp': {
      const inputDate = moment(dob);
      return inputDate.format('MM/DD/YYYY');

    }

  }
  return moodifiedDob;
}

function generateRandomAlphanumericString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
