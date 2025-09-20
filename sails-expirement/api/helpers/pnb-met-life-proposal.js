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

module.exports = {

  friendlyName: 'Pnbmetlife proposal',


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
      sails.config.insurance.pnb.urls.proposal,
      {payload, loan_id: loanId},
      {"content-type": "application/json"},
      "post"
    );

    const apiRes = response.data;

    const uniquekey = apiRes?.data?.tma?.tma_header?.uniquekey;
    const status = apiRes?.data?.tma?.tma_body?.issuccess;
    await InsuranceProposal.updateOne({
      ins_app_ref: inputs?.insuredApplicant?.id
    }).set({
      proposal_ref_num: uniquekey,
      status
    });

    if (uniquekey) {
      await InsuranceKeyMapping.updateOne({
        unique_key: uniquekey
      }).set({
        key_status: "used",
        loan_id: loanId,
        director_id: insuredApplicant?.applicant_did
      })
    }

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
  let uniquekey;

  const keyMapping = await InsuranceKeyMappingRd.find({
    ins_id: 1007, // 1007 is pnb insurance-id
    key_status: "unused"
  })
    .select("unique_key")
    .limit(1);

  uniquekey = keyMapping?.[0]?.unique_key;

  // authorization = "Bearer eyJhbGciOiJFZERTQSJ9.eyJzdWJqZWN0IjoidXVpZCIsInVzZXIiOnsiaWQiOjEzMDA1NTMsIm5hbWUiOiJCcmFuY2ggY20gTGV2ZWwgMSIsImVtYWlsIjoiQkNNQG10LmNvbSIsImNvbnRhY3QiOiIxMjM0NTY3ODkwIiwiY2Fjb21wbmFtZSI6IiIsImNhcGFuY2FyZCI6bnVsbCwiYWRkcmVzczEiOm51bGwsImFkZHJlc3MyIjpudWxsLCJwaW5jb2RlIjpudWxsLCJsb2NhbGl0eSI6bnVsbCwiY2l0eSI6IkNoZW5uYWkiLCJzdGF0ZSI6IlRBTUlMIE5BRFUiLCJ1c2VydHlwZSI6IkJhbmsiLCJsZW5kZXJfaWQiOjEyNTE5LCJwYXJlbnRfaWQiOjEzMDA1NTUsInVzZXJfZ3JvdXBfaWQiOm51bGwsImFzc2lnbmVkX3NhbGVzX3VzZXIiOm51bGwsIm9yaWdpbmF0b3IiOjI4NDAsImlzX2xlbmRlcl9hZG1pbiI6MSwic3RhdHVzIjoiYWN0aXZlIiwib3N2X25hbWUiOm51bGwsImZpcnN0bG9naW4iOiIwIiwiY3JlYXRlZG9uIjoiMjAyMy0wNy0yN1QxMTozMjozNy4wMDBaIiwidXBkYXRlX3RpbWUiOiIyMDI0LTA1LTA4VDA1OjA3OjM1LjAwMFoiLCJpc19sZW5kZXJfbWFuYWdlciI6MCwib3JpZ2luIjoiU3VwZXIgQWRtaW5pc3RyYXRvciBBZGQiLCJ3aGl0ZV9sYWJlbF9pZCI6IjMiLCJkZWFjdGl2YXRlX3JlYXNzaWduIjoiTm8iLCJub3RpZmljYXRpb25fcHVycG9zZSI6NCwidXNlcl9zdWJfdHlwZSI6IkNyZWRpdCIsIm5vdGlmaWNhdGlvbl9mbGFnIjoibm8iLCJjcmVhdGVkYnlVc2VyIjoyODQwLCJzb3VyY2UiOiJUZXN0QWxsIiwiY2hhbm5lbF90eXBlIjoiMCIsIm90cCI6bnVsbCwid29ya190eXBlIjpudWxsLCJwcm9maWxlX2NvbXBsZXRpb24iOjAsInBpYyI6IiIsImxvZ2luX3N0YXR1cyI6MTcxNTE0NDg3MjM2MTY5NDAsImJyYW5jaF9pZCI6MTc0MDk1LCJpc19jb3Jwb3JhdGUiOm51bGwsInByb2R1Y3RzX3R5cGUiOm51bGwsImlzX290aGVyIjowLCJpc19zdGF0ZV9hY2Nlc3MiOjAsInVzZXJfcmVmZXJlbmNlX25vIjoiTVVBVDEzMDA1NTMiLCJpc19icmFuY2hfbWFuYWdlciI6MCwiZGVzaWduYXRpb24iOiIiLCJpc191c2VyX2FkbWluIjoiTm8iLCJ1c2VyX2xpbWl0IjoiW1xuICAgIHtcbiAgICAgICAgXCJwcm9kdWN0X2lkXCI6IFtcbiAgICAgICAgICAgMjg2LDI4NywyODgsMjg5LDI5MCwyOTEsMjkyLDI5MywyOTQsMjk1XG4gICAgICAgIF0sXG4gICAgICAgIFwibWluX3ZhbFwiOiAwLFxuICAgICAgICBcIm1heF92YWxcIjogNzUwMDAwLFxuXCJsZXZlbFwiOlwibGV2ZWxfMVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwicHJvZHVjdF9pZFwiOiBbXG4gICAgICAgICAgIDI5NiwyOTcsMjk4LDI5OSwzMDAsMzAxLDMwMiwzMDMsMjYwXG4gICAgICAgIF0sXG4gICAgICAgIFwibWluX3ZhbFwiOiAwLFxuICAgICAgICBcIm1heF92YWxcIjogNTAwMDAwLFxuXCJsZXZlbFwiOlwibGV2ZWxfMVwiXG4gICAgfVxuXSIsImxvZ2dlZEluV2hpdGVMYWJlbElEIjoiMyJ9LCJleHAiOjE3MTUyMzEyNzJ9.ilsb0uwewzSuNVN2mS39qy-YUPa2L5diVa4EBe6GU5dxjdkrAfoFMGL0QFYmSo-RZiRsQNETP92qKPrT9pTyBg";

  const additionalData = await sails.helpers.getAdditionalInsData(
    userId || 126093,
    loanRefId || "JHUR71609648",
    authorization,
    insuredApplicant.applicant_did || 397210,
    insuredApplicant.id || 492
  );

  const additionalInfo = additionalData.additional_information;
  const nominees = additionalData.nominee;

  const applicantEducation = additionalInfo.applicant_education;
  const incomesource = additionalInfo.income_source;
  const annualIncome = additionalInfo.annual_income;
  const accountnumber = additionalInfo.account_number;
  const designation = additionalInfo.designation;
  const natureOfDuties = additionalInfo.nature_of_duties;
  const nameandaddressoforganisation = additionalInfo.nameandaddressoforganisation;

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
    "father_name",
    "address1",
    "address2",
    "address3",
    "address4",
    "pincode",
    "dcontact",
    "dcontact2"
  ]);

  let gender = director.gender;
  gender = (gender === "Male") ? "M" : "F";
  const title = (gender === "M") ? "Mr." : "Mrs.";
  const firstName = (director.dfirstname + " " + director.middle_name).trim();
  const lastName = director.dlastname;
  const fatherName = director.father_name;
  const [fatherFirstName, fatherLastName] = dissectFatherName(fatherName);
  const dob = director.ddob;
  const formattedDob = formatDob(dob, 'yyyy-mm-dd');
  let maritalStatus = director.marital_status;
  maritalStatus = (maritalStatus == "Married") ? "M" : "S";
  let address1 = director?.address1 || "";
  let address2 = director?.address2 || "";
  let address3 = director?.address3 || "";
  let address4 = director?.address4 || "";
  if (address3 && address4) address3 = address3 + ", " + address4;
  const pincode = director?.pincode;
  const phone = director?.dcontact;
  const mobphonenum1 = director?.dcontact2;
  const calculatedpremium = insuredApplicant?.ins_charge + insuredApplicant?.gst_charge;

  const newAddresses = redistributeAddresses(address1, address2, address3);
  address1 = newAddresses.address1;
  address2 = newAddresses.address2;
  address3 = newAddresses.address3;


  const sanction = await LoanSanction.findOne({
    loan_id: loanId
  }).select([
    "san_interest",
    "san_date",
    "san_amount",
    "amount_um",
    "san_term"
  ]);

  let sanAmount = await sails.helpers.unitConverter(sanction?.san_amount, sanction?.amount_um);
  sanAmount = sanAmount.value;
  const interestRate = (sanction?.san_interest) * 100;
  const loanTerm = Math.ceil(sanction?.san_term / 12);
  const sancDate = sanction.san_date;
  const formattedSancDate = formatDate(sancDate, 'mm/dd/yyyy');


  const payload = {
    "tma": {
      "tma_header": {
        "sourcecountry": "India",
        "sourcecompany": "MLIN",
        "sourcesystem": "METWS",
        "transaction": "GroupAppSubmit"
      },
      "tma_body": {
        "groupAPIUploadDetail": {
          "typeofpolicy": "SINGLE",
          "uniquekey": uniquekey,
          "title": title,
          "firstname": firstName,
          "lastname": lastName,
          "fathersalutation": "Mr.",// resume from here
          "fatherfirstname": fatherFirstName, //db
          "fatherlastname": fatherLastName, //db
          "dob": formattedDob,//db
          "gender": gender,//db
          "nationality": "RIN",//db
          "applicanteducation": applicantEducation,//s3
          "pan": "Y", //s3
          "form60": "N", //s3
          "whetherbankcollecteddobproof": "Y",//s3
          "maritalstatus": maritalStatus,//db
          "relationshipwithjointlife": "",
          "mailaddresstype": "R",
          "mailaddressline1": address1,//db
          "mailaddressline2": address2,//db
          "mailaddressline3": address3,//db
          "mailaddresspin": pincode,//db
          "mailaddresscountry": "IND",
          "residencecountry": "IND",
          "phone": phone,//db
          "mobphonenum1": mobphonenum1,//db
          "emailadd": "",
          "incomesource": incomesource,//? let it be hardcoded for now. data given in master is not working
          "designation": designation, //"EXEC",//? let it be like this now. Seem sto be free text
          "natureofduties": natureOfDuties,//s3
          "annualincome": annualIncome,//s3
          "nameandaddressoforganisation": nameandaddressoforganisation,//s3
          "dobproof": "NSAAAD",//s3
          "isapplicantalreadycovered": (additionalInfo.is_applicant_already_covered == "Yes") ? "Y" : "N",//s3
          "previouspolicynumber": "",
          "groupid": sails.config.insurance.pnb.groupId,
          "benefitoption": "1",
          "faceamount": insuredApplicant.sum_assured,// db -> sum_assured
          "premiumpayterm": "0",
          "premiumpayingoption": "SP",
          "policyterm": insuredApplicant.policy_term,
          "premiumpayfreq": "00",
          "calculatedpremium": calculatedpremium,
          "instrumentamount": calculatedpremium,
          "loantype": "B",
          "totalloan": sanAmount,
          "loanaccountnumber": loanRefId, // database
          "loanterm": loanTerm, // database
          "rateofinterest": interestRate, // database
          "accountnumber": accountnumber, //sails.config.insurance.pnb.accountnumber, // config
          "paymentmode": "J",
          "renewalpaymode": "",
          "noofnominee": nominees.length,
          /*"nomineetitle1": "Mrs.",
          "nomineefirstname1": "DHARAM SHEEL",
          "nomineelastname1": "DHARAM SHEEL",
          "nomineedob1": "01/Jan/1986",
          "nomineegender1": "MO",
          "nomineerelwithpi1": "SP",
          "nomineeaddressline11": "HOUSE ON VILLAGE SALARPUR SHIV MANDIR BALI GALI DADRI LandMark SHIV MANDIR NOIDA DADRI UTTAR PRADESH",
          "nomineeaddresscountry1": "IND",
          "nomineeaddresspin1": "201304",
          "nomineephone1": "8750407789",
          "nomineepercentallocated1": "100",
          "appointeetitle1": "",
          "appointeefirstname1": "",
          "appointeelastname1": "",
          "appointeedob1": "",
          "appointeegender1": "",
          "appointeerelwithnominee1": "",
          // "appointeeaddressline11": "",
          // "appointeeaddresscountry1": "",
          // "appointeeaddresspin1": "",
          // "appointeephone1": "",
          "nomineetitle2": "",
          "nomineefirstname2": "",
          "nomineelastname2": "",
          "nomineedob2": "",
          "nomineegender2": "",
          "nomineerelwithpi2": "",
          "nomineeaddressline12": "",
          "nomineeaddresscountry2": "",
          "nomineeaddresspin2": "",
          "nomineephone2": "",
          "nomineepercentallocated2": "",
          "appointeetitle2": "",
          "appointeefirstname2": "",
          "appointeelastname2": "",
          "appointeedob2": "",
          "appointeegender2": "",
          "appointeerelwithnominee2": "",
          "appointeeaddressline12": "",
          "appointeeaddresscountry2": "",
          "appointeeaddresspin2": "",
          "appointeephone2": "",*/
          "heightincm": additionalInfo.height,
          "weightinkg": additionalInfo.weight,
          "healthquestion1": (additionalInfo.health_question_one == "Yes") ? "Y" : "N",
          "healthquestion2": (additionalInfo.health_question_two == "Yes") ? "Y" : "N",
          "healthquestion3": (additionalInfo.health_question_three == "Yes") ? "Y" : "N",
          "healthquestion4": (additionalInfo.health_question_four == "Yes") ? "Y" : "N",
          "femalecsection": (additionalInfo.female_c_section == "Yes") ? "Y" : "N",
          "consumedtobacco": (additionalInfo.consumed_tobacco == "Yes") ? "Y" : "N",
          "tobacco": (additionalInfo.tobacco == "Yes") ? "Y" : "N",
          "alcohol": (additionalInfo.alcohol == "Yes") ? "Y" : "N",
          "narcotics": (additionalInfo.narcotics == "Yes") ? "Y" : "N",
          "narcoticsdrug": (additionalInfo.narcotic_drug == "Yes") ? "Y" : "N",
          "iscriminal": (additionalInfo.is_criminal == "Yes") ? "Y" : "N",
          "spcode": "",
          "facode": sails.config.insurance.pnb.facode, // hardcoded from env
          "jointsubapplicationnumber": "",
          "jointtitle": "",
          "jointfirstname": "",
          "jointlastname": "",
          "jointfatherfirstname": "",
          "jointfatherlastname": "",
          "jointdob": "",
          "jointgender": "",
          "jointmailaddresstype": "",
          "jointmailaddressline1": "",
          "jointmailaddresspin": "",
          "jointmailaddresscountry": "",
          "jointmobphonenum1": "",
          "jointincomesource": "",
          "jointdesignation": "",
          "jointannualincome": "",
          "jointdobproof": "",
          "jointidproof": "",
          "jointfaceamount": "",
          "jointpremiumpayfreq": "",
          "jointrenewalpaymode": "",
          "jointcalculatedpremium": "",
          "jointtotalloan": "",
          "jointheightincm": "",
          "jointweightinkg": "",
          "jointhealthquestion1": "",
          "jointhealthquestion2": "",
          "jointhealthquestion3": "",
          "jointhealthquestion4": "",
          "jointconsumedtobacco": "",
          "jointtobacco": "",
          "jointalcohol": "",
          "jointnarcotics": "",
          "jointnarcoticsdrug": "",
          "jointiscriminal": "",
          "dateof1stloandisbursement": formattedSancDate,
          "loansanctiondate": "",
          "relationshipwithfinancialinstitutionsinmnths": additionalInfo.relationship_with_financial_institutions_months,
          "loaninterestrate": "",
          "piborrowergurantor": "", //additionalInfo.pi_borrower_gurantor, //"BO",
          "typeoffirm": "PRL",
          "allpartnersappliedforcover": "",
          "nameofpartner1": "",
          "nameofpartner2": "",
          "nameofpartner3": "",
          "nameofpartner4": "",
          "percentageshareholdingofpartner1": "",
          "percentageshareholdingofaccountnumberpartner2": "",
          "percentageshareholdingofpartner3": "",
          "percentageshareholdingofpartner4": "",
          "reasonforallpartnernotapply": "",
          "nocfromnonapplyingpartner": "",
          "moratoriumperiodinmonths": "",
          "Poname": "Muthoot Fincorp",
          "Isgroupfinancepremium": "N",
          "OTPMobileNumber": director.dcontact,
          "OTPEmailID": director.demail,
          "OTPConsentDate": formattedSancDate
        }
      },
      "tma_fault": {
        "applicationfault": "",
        "systemfault": ""
      }
    }
  }

  for (let i = 0; i < nominees.length; i++) {
    let apointeeTitle = "";
    if (nominees[i].apointee_gender == "Male") apointeeTitle = "Mr.";
    else if (nominees[i].apointee_gender == "Female") apointeeTitle = "Mrs.";

    payload.tma.tma_body.groupAPIUploadDetail[`nomineetitle${i + 1}`] = (nominees[i].nominee_gender == "M") ? "Mr." : "Mrs.";
    payload.tma.tma_body.groupAPIUploadDetail[`nomineefirstname${i + 1}`] = nominees[i].nominee_name;
    payload.tma.tma_body.groupAPIUploadDetail[`nomineelastname${i + 1}`] = nominees[i].nominee_last_name;
    payload.tma.tma_body.groupAPIUploadDetail[`nomineedob${i + 1}`] = formatDate(nominees[i].nominee_dob, "timestamp");
    payload.tma.tma_body.groupAPIUploadDetail[`nomineegender${i + 1}`] = nominees[i].nominee_gender;
    payload.tma.tma_body.groupAPIUploadDetail[`nomineerelwithpi${i + 1}`] = nominees[i].nominee_relation;
    payload.tma.tma_body.groupAPIUploadDetail[`nomineeaddressline1${i + 1}`] = nominees[i].nominee_address;
    payload.tma.tma_body.groupAPIUploadDetail[`nomineeaddresscountry${i + 1}`] = "IND";
    payload.tma.tma_body.groupAPIUploadDetail[`nomineeaddresspin${i + 1}`] = nominees[i].nominee_pincode;
    payload.tma.tma_body.groupAPIUploadDetail[`nomineephone${i + 1}`] = nominees[i].mobile;
    payload.tma.tma_body.groupAPIUploadDetail[`nomineepercentallocated${i + 1}`] = nominees[i].nominee_contribution;
    payload.tma.tma_body.groupAPIUploadDetail[`appointeetitle${i + 1}`] = apointeeTitle;
    payload.tma.tma_body.groupAPIUploadDetail[`appointeefirstname${i + 1}`] = nominees[i].apointee_first_name;
    payload.tma.tma_body.groupAPIUploadDetail[`appointeelastname${i + 1}`] = nominees[i].apointee_last_name;
  }

  return payload;
}

function dissectFatherName(fatherName) {
  let firstName = "", lastName = "";
  if (!fatherName) return [firstName, lastName]
  const nameSplits = fatherName.split(" ");
  console.log(nameSplits);
  if (nameSplits.length != 1) {
    for (let i = 0; i < nameSplits.length - 1; i++) {
      firstName += (nameSplits[i] + " ");
    }

    firstName = firstName.trim();
    if (nameSplits.length > 1) lastName = nameSplits[nameSplits.length - 1];
  }
  else {
    if (nameSplits.length == 1) {
      firstName = nameSplits[0]
    }
  }
  return [firstName, lastName];
}


function formatDob(dob, inputFormat) {
  let moodifiedDob = dob;
  if (inputFormat == 'dd/mm/yyyy') {
    const dobSplit = dob.split("/");
    moodifiedDob = `${dobSplit[0]}/${monthMap[dobSplit[1]]}/${dobSplit[2]}`;
  } else if (inputFormat == 'yyyy-mm-dd') {
    const dobSplit = dob.split("-");
    moodifiedDob = `${dobSplit[2]}/${monthMap[dobSplit[1]]}/${dobSplit[0]}`;
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
      return inputDate.format('DD/MMM/YYYY');

    }

  }
  return moodifiedDob;
}

function redistributeAddresses(address1, address2, address3) {
  const maxLength = 30;

  // Function to split addresses without breaking words
  function splitAddress(address, maxLength) {
    if (address.length <= maxLength) {
      return [address, ""];
    }

    let splitIndex = maxLength;
    while (splitIndex > 0 && address[splitIndex] !== ' ') {
      splitIndex--;
    }

    if (splitIndex === 0) {
      // If there is no space found, split at maxLength
      splitIndex = maxLength;
    }

    return [address.slice(0, splitIndex), address.slice(splitIndex).trim()];
  }

  // Process address1
  let [newAddress1, overflow1] = splitAddress(address1, maxLength);

  // Process address2 with overflow from address1
  address2 = overflow1 + ' ' + address2;
  let [newAddress2, overflow2] = splitAddress(address2.trim(), maxLength);

  // Process address3 with overflow from address2
  address3 = overflow2 + ' ' + address3;
  let newAddress3 = address3.trim().slice(0, maxLength);

  return {
    address1: newAddress1,
    address2: newAddress2,
    address3: newAddress3
  };
}

// // Example usage
// let address1 = "12345 Long Street Name That Exceeds Thirty Characters";
// let address2 = "Apartment 1234";
// let address3 = "City, State, ZIP Code";

// const result = redistributeAddresses(address1, address2, address3);
// console.log(result);
