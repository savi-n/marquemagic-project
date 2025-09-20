const moment = require('moment-timezone');

const monthMap = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec"
}

const stateCodeMap = {
  "JAMMU AND KASHMIR": 1,
  "HIMACHAL PRADESH": 2,
  "PUNJAB": 3,
  "CHANDIGARH": 4,
  "UTTARAKHAND": 5,
  "HARYANA": 6,
  "DELHI": 7,
  "RAJASTHAN": 8,
  "UTTAR PRADESH": 9,
  "BIHAR": 10,
  "SIKKIM": 11,
  "ARUNACHAL PRADESH": 12,
  "NAGALAND": 13,
  "MANIPUR": 14,
  "MIZORAM": 15,
  "TRIPURA": 16,
  "MEGHALAYA": 17,
  "ASSAM": 18,
  "WEST BENGAL": 19,
  "JHARKHAND": 20,
  "ODISHA": 21,
  "CHHATTISGARH": 22,
  "MADHYA PRADESH": 23,
  "GUJARAT": 24,
  "DAMAN AND DIU": 25,
  "DADRA AND NAGAR HAVELI": 26,
  "MAHARASHTRA": 27,
  "KARNATAKA": 29,
  "GOA": 30,
  "LAKSHADWEEP": 31,
  "KERALA": 32,
  "TAMIL NADU": 33,
  "PUDUCHERRY": 34,
  "ANDAMAN AND NICOBAR": 35,
  "TELANGANA": 36,
  "ANDHRA PRADESH": 37
}

module.exports = {


  friendlyName: 'Icici prudential',


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
    console.log("here is the payload:", payload)
    const response = await sails.helpers.axiosApiCall(
      sails.config.insurance.icici.urls.proposal,
      {payload, loan_id: loanId},
      {"content-type": "application/json"},
      "post"
    );
    console.log("resposne of the api is :", response)
    const apiRes = response.data;

    const prn = apiRes?.data?.transID;
    const status = apiRes?.data?.BREAction;
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
  ]).select(["loan_ref_id", "business_id", "RequestDate"]);
  // const income_data = await IncomeDataRd.findOne({
  //   business_id: loanrequest.business_id
  // }).select(["gross_income,monthly_income"]);
  // const director = await Director.findOne({bid: loanrequest.business_id});
  const loanRefId = loanrequest?.loan_ref_id;
  const userId = loanrequest?.business_id?.userid;
  const sanction = await LoanSanction.findOne({
    loan_id: loanId
  }).select([
    "san_interest",
    "san_date",
    "san_amount",
    "san_term",
    "amount_um"
  ]);
  const sumAssured = insuredApplicant.sum_assured;
  const additionalData = await sails.helpers.getAdditionalInsData(
    userId,
    loanRefId,
    authorization,
    insuredApplicant.applicant_did,
    insuredApplicant.id
  );
  const additionalInfo = additionalData.additional_information;
  const nominees = additionalData.nominee[0];
  const applicantEducation = additionalInfo.applicant_education;
  const incomesource = additionalInfo.applicant_occupation;
  const formattedDob = formatDate(nominees.nominee_dob, "timestamp");
  const formattedApnointeeDob = nominees?.apointee_dob ? formatDate(nominees?.apointee_dob, "timestamp") : "";

  let sanAmount = await sails.helpers.unitConverter(sanction?.san_amount, sanction?.amount_um);
  sanAmount = sanAmount.value;
  const calculatedpremium = insuredApplicant?.ins_charge;
  const totalPremium = calculatedpremium + insuredApplicant?.gst_charge;
  const director = await DirectorRd.findOne({
    id: insuredApplicant?.applicant_did
  });

  const ddob = formatDob(director.ddob, 'yyyy-mm-dd');
  let maritalStatus = director?.marital_status
  switch (maritalStatus) {
    case "Single":
      maritalStatus = 697;
      break;
    case "Married":
      maritalStatus = 696;
      break;
    case "Widowed":
      maritalStatus = 694;
      break;
    case "Divorced":
      maritalStatus = 695;
      break;
    case "Separated":
    case "Others":
      maritalStatus = 111;

  }

  const heightInCm = additionalInfo.HQ01; //heightToCm(additionalInfo.HQ01, additionalInfo.HQ02)
  const [heightFeetComponent, heightInchesComponent] = heightInFeetAndInches(heightInCm);

  const payload = {
    "appNo": "",
    "advisorCode": sails.config.icici.advisorCode,
    "source": sails.config.icici.source,
    "sourceKey": sails.config.icici.sourceKey,
    "salesDataReqd": "Y",
    "dependentFlag": "N",
    "jointLifeFlag": "N",
    "sourceTransactionId": "",
    "sourceOfFund": "Salary",
    "uidId": "",
    "buyersPinCode": `${director.pincode}`,
    "sellersPinCode": `${director.pincode}`,
    "mwpaOpted": "No",
    "mwpaBenefit": "",
    "isLAHitReqd": "N",
    "nomineeInfos": {
      "apnteDtls": {
        "dob": `${formattedApnointeeDob}`,
        "frstNm": `${nominees.apointee_first_name}`,
        "gender": `${nominees.apointee_gender}`,
        "lstNm": `${nominees.apointee_last_name}`,
        "relationship": `${nominees.apointee_relation}`
      },
      "dob": `${formattedDob}`,
      "frstNm": `${nominees.nominee_name}`,
      "gender": `${nominees.nominee_gender}`,
      "lstNm": `${nominees.nominee_last_name}`,
      "relationship": `${nominees.nominee_relation}`
    },
    "proposerInfos": {
      "consentOfSplitPayment": "Yes",
      "continueCover": "Yes",
      "aadhaarOptionSelected": "",
      "frstNm": `${director.dfirstname}`,
      "lstNm": `${director.dlastname}`,
      "mrtlSts": maritalStatus,
      "dob": `${ddob}`,
      "gender": `${director.gender}`,
      "isStaff": "0",
      "mobNo": `${director.dcontact}`,
      "relationWithLa": "Self",
      "sharePortfolio": "No",
      "fathersName": "",
      "mothersName": "",
      "spouseName": "",
      "ckycNumber": "",
      "occ": incomesource,
      "myProf": "",
      "occDesc": "",
      "indsType": "",
      "indsTypeDesc": "",
      "nameOfOrg": "",
      "objective": "Both",
      "annIncme": additionalInfo?.annual_income,
      "panNo": `${director.dpancard}`,
      "photoSubmitted": "No",
      "nationality": "Indian",
      "email": `${director.demail}`,
      "pltclyExpsd": "No",
      "fundedBy": `${additionalInfo.funded_by}`,
      "sourcesOfFundsOthers": "Yes",
      "loanStatus": `${additionalInfo.loan_status}`,
      "propertyLocated": `${additionalInfo.property_located}`,
      "lan": loanrequest?.loan_ref_id + director.id, //"LAI0000004",
      "dateOfCommencementOfLoan": moment(loanrequest?.RequestDate)
        .tz("Asia/Kolkata")
        .format('dd/mm/yyyy')
        .toString(),
      "rstSts": "Resident Indian",
      "kycDoc": {
        "idPrf": `${additionalInfo.id_proof}`,
        "addPrf": `${additionalInfo.add_proof}`,
        "agePrf": `${additionalInfo.age_proof}`,
        "itPrf": `${additionalInfo.it_proof}`,
        "incomePrf": `${additionalInfo.income_proof}`,
        "lddIdOthrDesc": "",
        "lddIdNumber": `${director.dpancard}`, //"BCRPA7056G",
        "lddIdExpiryDate": ""
      },
      "comunctnAddress": {
        "pincode": `${director.pincode}`,
        "landmark": "",
        "state": `${stateCodeMap[director.state.toUpperCase()]}`,
        "line1": `${director.address1}`,
        "line3": `${director.address3}`,
        "city": `${director.city}`,
        "country": "India",
        "line2": `${director.address2}`
      },
      "education": applicantEducation,
      "prmntAddress": {
        "pincode": `${director.pincode}`,
        "landmark": "",
        "state": `${stateCodeMap[director.permanent_state.toUpperCase()]}`,
        "line1": `${director.permanent_address1}`,
        "line3": `${director.permanent_address3}`,
        "city": `${director.permanent_city}`,
        "country": "India",
        "line2": `${director.permanent_address2}`
      }
    },
    "healthDetails": [
      {
        "code": "HQ01",
        "answer1": heightFeetComponent,
        "answer2": `${heightFeetComponent} feet ${heightInchesComponent} inches`,
        "answer3": "",
        "answer4": ""
      },
      {
        "code": "HQ02",
        "answer1": heightInchesComponent,
        "answer2": heightInCm,
        "answer3": "",
        "answer4": ""
      },
      {
        "code": "HQ03",
        "answer1": additionalInfo.HQ03,
        "answer2": "",
        "answer3": "",
        "answer4": ""
      },
      {
        "code": "HQ235",
        "answer1": additionalInfo.HQ235,
        "answer3": "No",
        "answer2": "No",
        "answer4": "No",
        "answer5": "No",
        "answer6": "No",
        "answer7": "No",
        "answer8": "No",
        "answer9": "No",
        "answer10": "No",
        "answer11": "No",
        "answer12": "No",
        "answer13": "No",
        "answer14": "No",
        "answer15": "No",
        "answer16": "No",
        "answer17": "No",
        "answer18": "No",
        "answer19": "No",
        "answer20": "No",
        "answer21": "No",
        "answer22": "No",
        "answer23": "No",
        "answer24": "No",
        "answer25": "No"
      },
      {
        "code": "HQ229",
        "answer1": additionalInfo.HQ229,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ219",
        "answer1": additionalInfo.HQ219,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ226",
        "answer1": additionalInfo.HQ226,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ222",
        "answer1": "No",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ168",
        "answer1": additionalInfo.HQ168,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ258",
        "answer1": additionalInfo.HQ258,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ223",
        "answer1": additionalInfo.HQ223,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ125",
        "answer1": "No",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ144",
        "answer1": "No",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ165",
        "answer1": "No",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ166",
        "answer1": "No",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ21",
        "answer1": "",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ24",
        "answer1": "No",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ257",
        "answer1": additionalInfo.HQ257,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ221",
        "answer1": "No",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ181",
        "answer1": additionalInfo.HQ181,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ116",
        "answer1": additionalInfo.HQ116,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ224",
        "answer1": additionalInfo.HQ224,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ228",
        "answer1": additionalInfo.HQ228,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "HQ61",
        "answer1": additionalInfo.HQ61,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "CHQ94",
        "answer1": "",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "CHQ95",
        "answer1": "",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "CHQ96",
        "answer1": "",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "CHQ21",
        "answer1": additionalInfo.CHQ21,
        "answer3": "",
        "answer2": "",
        "answer4": ""
      },
      {
        "code": "CHQ30",
        "answer1": "",
        "answer3": "",
        "answer2": "",
        "answer4": ""
      }
    ],
    "productSelection": {
      "coverageOption": "Reducing cover",
      "BasePremium": `${calculatedpremium}`,
      "CIRPremium": "0",
      "TotalFirstPremium": `${totalPremium}`,
      "TotalFirstPremiumShow": `${totalPremium}`,
      "ADBRPremium": "0",
      "annualpremium": `${calculatedpremium}`,
      "benefitOption": 2, //`${additionalInfo.benefit_options}`,
      "premiumPayingFrequency": "Yearly",
      "policyTerm": insuredApplicant.policy_term * 12,
      "premiumPayingTerm": insuredApplicant.policy_term * 12,
      "sumAssured": `${sumAssured}`,
      "salesChannel": "3",
      "productType": "TRADITIONAL",
      "productName": "ICICI PRU SUPER PROTECT CREDIT",
      "productId": "GP1",
      "premiumpaymentoption": "Single Pay",
      "masterCode": "MF000LAP",
      "loanAmount": sanAmount,
      "loanTenure": sanction?.san_term,
      "customerType": "Primary Borrower",
      "loanShare": "100"
    },
    "eiaDetails": {
      "isEIAOpted": "No",
      "eiaInsuranceRepository": "",
      "EIAAccountNumber": ""
    },
    "advisorSalesDetails": {
      "lanNo": loanrequest?.loan_ref_id + director.id,
      "oppId": "",
      "source": "MFLP",
      "spCode": "",
      "fscCode": "1286361",
      "bankBrnch": "MFLU",
      "cafosCode": "99999999",
      "csrLimCode": "5032212",
      "subChannel": "",
      "channelType": "BR",
      "selectedTab": "",
      "cusBankAccNo": "",
      "needRiskProfile": "",
      "bankName": "MFLA"
    },
    "paymentData": {
      "payModeOfDeposit": "INB",
      "paySIOpted": "N",
      "paySIStatus": "No",
      "payAmount": `${calculatedpremium}`,
      "payBankName": "ICICI",
      "payIfscCode": "ICIC0000320",
      "payAccountHolderName": `${director.dfirstname}`,
      "payFinalPremiumAmnt": `${totalPremium}`,
      "payAccountType": "Saving",
      "payPreimumFreq": "",
      "paymentStatus": "Pending Realisation",
      "payMicrNo": "",
      "payGatewayTransId": "", //"qwerty1234",
      "payAccountNo": "",
      "payCrtDate_str": "", //"07-06-2024 18:54:02"
    }
  }
  return payload;
}
function heightToCm(feet, inches) {
  const totalInches = (feet * 12) + inches;
  const cm = totalInches * 2.54;
  return Math.floor(cm);
}
function formatDob(dob, inputFormat) {
  let moodifiedDob = dob;
  if (inputFormat == 'dd/mm/yyyy') {
    const dobSplit = dob.split("/");
    moodifiedDob = `${dobSplit[0]}/${monthMap[dobSplit[1]]}/${dobSplit[2]}`;
  } else if (inputFormat == 'yyyy-mm-dd') {
    const dobSplit = dob.split("-");
    moodifiedDob = `${dobSplit[2]}-${monthMap[dobSplit[1]]}-${dobSplit[0]}`;
  }
  return moodifiedDob;
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
      moodifiedDob = `${dobSplit[1]}/${dobSplit[0]}/${dobSplit[2]}`;
    }
      break;
    case 'timestamp': {
      const inputDate = moment(dob);
      return inputDate.format('DD-MMM-YYYY');

    }

  }
  return moodifiedDob;
}

function heightInFeetAndInches(heightInCm) {
  const inches = heightInCm / 2.54;

  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);

  return [feet, remainingInches];
}
