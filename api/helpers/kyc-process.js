const { fuzzy } = require("fast-fuzzy");

const MAX_TRANSACTION_ATTEMPTS = 5;

const REQ_TYPES_MAP = {
  AADHAR: "aadhar",
  DL: "license",
  PASSPORT: "passport",
  VOTER: "voter",
  PAN: "pan"
}

const restructureExtractedData = async (extraction, reqType) => {
  let extractionData, kyc_key;

  switch (reqType) {
    case 'pan':
      extractionData = {
        "Pan_number": (extraction.Pan_number || '').trim(),
        "Name": (extraction.Name || extraction.Company_Name || '').trim(),
        "DOB": (extraction.DOB || '').trim().replace(/[-.]/g, "/"),
        "father_name": (extraction.Fathers_Name || '').trim(),
        "image": (extraction.Document_quality || '').trim()
      };
      kyc_key = extractionData.Pan_number;
      break;
    case 'aadhar':
      extractionData = {
        "Aadhar_number": (extraction.Aadhaar_number || '').trim(),
        "Name": (extraction.Name || '').trim(),
        "Father_name": (extraction.Father_name || '').trim(),
        "Gender": (extraction.Gender || '').trim(),
        "DOB": (extraction.DOB || '').trim().replace(/[-.]/g, "/"),
        "Address": (extraction.Address || '').trim(),
        "pincode": (extraction.Pincode || '').trim(),
        "image": (extraction.Document_quality || '').trim()
      };
      kyc_key = extractionData.Aadhar_number;
      break;
    case 'voter':
      extractionData = {
        "name": (extraction.Name || '').trim(),
        "gender": (extraction.Gender || '').trim(),
        "father_name": (extraction.Father_Name || '').trim(),
        "vid": (extraction.Voter_ID || '').trim(),
        "dob": (extraction.DOB || '').trim().replace(/[-.]/g, "/"),
        "address": (extraction.Address || '').trim(),
        "pincode": (extraction.Pincode || '').trim(),
        "state": '',
        "image": (extraction.Document_quality || '').trim()
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
        console.log(error);
      }
      kyc_key = extractionData.vid;
      break;
    case 'passport':
      extractionData = {
        "name": (extraction.Name || '').trim(),
        "passport_no": (extraction.Passport_number || '').trim(),
        "file_number": (extraction.File_number || '').trim(),
        "mrz_code": (extraction.MRZ_code || '').trim(),
        "gender": (extraction.Gender || '').trim(),
        "dob": (extraction.DOB || '').trim().replace(/[-.]/g, "/"),
        "country_code": (extraction.Country_code || '').trim(),
        "issue_place": (extraction.Issue_place || '').trim(),
        "issue_date": (extraction.Issue_date || '').trim().replace(/[-.]/g, "/"),
        "exp_date": (extraction['Expiry Date'] || '').trim().replace(/[-.]/g, "/"),
        "Address": (extraction.Address || '').trim(),
        "pincode": (extraction.Pincode || '').trim(),
        "image": (extraction.Document_quality || '').trim()
      };
      kyc_key = extractionData.passport_no;
      break;
    case 'license':
      extractionData = {
        "dl_no": (extraction.Licence_number || '').trim(),
        "name": (extraction.Name || '').trim(),
        "dob": (extraction.DOB || '').trim().replace(/[-.]/g, "/"),
        "address": (extraction.Address || '').trim(),
        "pincode": (extraction.Pincode || '').trim(),
        "issue_date": (extraction.Issue_date || '').trim().replace(/[-.]/g, "/"),
        "validity": (extraction.Validity || '').trim().replace(/[-.]/g, "/"),
        "image": (extraction.Document_quality || '').trim()
      };
      kyc_key = extractionData.dl_no;
      break;
  }

  return { extractionData, kyc_key };
}

const getFullName = (firstName, middleName, lastName) => {
  let fullname = firstName || "";
  if (middleName) fullname = fullname + " " + middleName;
  if (lastName) fullname = fullname + " " + lastName;
  return fullname;
}

const getNameStrings = (fullname) => {
  let names = fullname.split(" ");
  let firstName = "",
    middleName = "",
    lastName = "";

  if (names.length > 2) {
    middleName = names[names.length - 2];
    lastName = names[names.length - 1];
    for (let i = 0; i < names.length - 2; i++) {
      firstName += names[i];
      if (i < names.length - 3) firstName += " ";
    }
  } else {
    firstName = names[0];
    lastName = names[1] || "";
  }

  return { firstName, middleName, lastName };
};

const createDirectorRecord = async (whereCondition, fullname, doc_id) => {
  let loan_document_records;
  // Below check is on the kyc key
  // If kycKey check fail we'll do 60% name match
  // If both fails we'll create director record 
  let fetchDirectorRecords = await Director
    .find(whereCondition)
    .select("id")
    .limit(1)

  fetchDirectorRecords = fetchDirectorRecords[0];

  let directorId;

  if (!fetchDirectorRecords) {
    // kycKey check has failed. So, below we do name match
    if (fullname.trim() !== "") {
      let directorNames = await Director
        .find({ business: whereCondition.business })
        .select([
          "dfirstname",
          "middle_name",
          "dlastname",
          "dpancard",
          "daadhaar",
          "dpassport",
          "dvoterid",
          "ddlNumber"
        ])

      let similarityFlag = false, mathchedDirector, similarityPercentage = 0, maxSimilarity = 0;

      for (const elm of directorNames) {
        let directorTableName = getFullName(elm.dfirstname, elm.middle_name, elm.dlastname);
        const smallerName = (fullname.length <= directorTableName.length) ? fullname : directorTableName;
        const biggerName = (fullname.length <= directorTableName.length) ? directorTableName : fullname;
        if (fullname && directorTableName) similarityPercentage = fuzzy(smallerName, biggerName);
        console.log(elm.id, smallerName, similarityPercentage, biggerName);
        if (similarityPercentage >= 0.50) {
          if (maxSimilarity < similarityPercentage) {
            directorId = elm.id;
            similarityFlag = true;
            mathchedDirector = elm;
            maxSimilarity = similarityPercentage;
          }
        }
      }
      console.log(directorId);

      if (similarityFlag) {
        // check if the kyc key exists. if it doesn't exist then update the kycKey
        let dbUpdationFlag = false;
        if (whereCondition.dpancard) {
          if (!mathchedDirector.dpancard) dbUpdationFlag = true;
        } else if (whereCondition.daadhaar) {
          if (!mathchedDirector.daadhaar) dbUpdationFlag = true;
        } else if (whereCondition.dpassport) {
          if (!mathchedDirector.dpassport) dbUpdationFlag = true;
        } else if (whereCondition.ddlNumber) {
          if (!mathchedDirector.ddlNumber) dbUpdationFlag = true;
        } else if (whereCondition.dvoterid) {
          if (!mathchedDirector.dvoterid) dbUpdationFlag = true;
        }

        if (dbUpdationFlag && directorId) await Director
          .update({ id: directorId })
          .set(whereCondition)

      } else {
        // as both kycKey and name match failed we create new director here
        const applicantCount = await Director.count({
          business: whereCondition.business,
          isApplicant: 1,
        })

        //if applicant exists then create new coapplicant
        //if applicant doesn't exist then create a new applicant
        let isApplicant = 1;
        if (applicantCount) isApplicant = 0;

        const { firstName, middleName, lastName } = getNameStrings(fullname);

        const newRec = {
          business: whereCondition.business,
          dpancard: whereCondition.dpancard,
          daadhaar: whereCondition.daadhaar,
          dpassport: whereCondition.dpassport,
          ddlNumber: whereCondition.ddlNumber,
          dvoterid: whereCondition.dvoterid,
          isApplicant,
          dfirstname: firstName,
          middle_name: middleName,
          dlastname: lastName,
          ints: await sails.helpers.systemDateTime()
        };

        const directorDetails = await Director.create(newRec).fetch();
        directorId = directorDetails.id;
      }
    }
  } else {
    directorId = fetchDirectorRecords.id;
  }

  /*if data exist in director table , then check for director id in
  loandocument is 0 or not and update the directorId respectively
  considering the director table director id.*/
  console.log(directorId);
  loan_document_records = await LoanDocument
    .findOne({ id: doc_id })
    .select(["directorId", "loan"]);

  if (!loan_document_records.directorId) {
    await LoanDocument.update({
      id: doc_id,
    }).set({ directorId: directorId });
    await LoanDocumentDetails.update({
      doc_id: doc_id,
      doc_request_type: "loan"
    }).set({ did: directorId });
  }

  // if (whereCondition.business) {
  //   await Director
  //     .update({ business: whereCondition.business, isApplicant: 0 })
  //     .set({ type_name: "Co-applicant" })
  // }


  const payload = { loanid: loan_document_records.loan };

  /*let triggerReportGen = await sails.helpers.apiTrigger(
    sails.config.ftr.python_frt_report,
    JSON.stringify(payload),
    {
      "content-type": "application/json",
    },
    "POST"
  );*/
}


const updateClassficationData = async (docId, trackingData) => {
  await LoanDocumentDetails.update({
    doc_id: docId,
    doc_request_type: "loan"
  }).set({
    ml_classification_track: JSON.stringify(trackingData),
  });
};

const updatedLoanDocumentRows = async (data, docId) => {
  //fetch ml_classification_track from database
  const documentDetailsRec = await LoanDocumentDetails.findOne({
    doc_id: docId,
  }).select("ml_classification_track");

  let trackingData = documentDetailsRec.ml_classification_track;

  try {
    trackingData = JSON.parse(trackingData);
    trackingData.kycProcessData = data;
  } catch (err) { }

  if (docId) await updateClassficationData(docId, trackingData);
};

module.exports = {
  friendlyName: "Kyc process",

  description: "",

  inputs: {
    message: {
      type: "ref",
      required: true,
    },
    extraction: {
      type: "ref"
    },
    forensic: {
      type: "ref"
    },
    imageQuality: {
      type: "ref"
    }
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    //let docNameSplit = inputs.message.doc_name.split("."); // most probably not needed
    const { extraction, forensic, imageQuality } = inputs;
    let reqType;

    // inputs.message.req_type = inputs.message.doc_type; // not needed
    // inputs.message.file_type =
    //   docNameSplit[docNameSplit.length - 1].toLowerCase() === "pdf"
    //     ? "pdf"
    //     : "image";

    if (inputs.message.doc_type) reqType = REQ_TYPES_MAP[inputs.message.doc_type];
    if (!reqType) return exits.success("not required");

    const requestId = await sails.helpers.getUniqueId();

    // below payload for extraction and forensic api calls
    // const reqPayload = {
    //   user_id: inputs.message.user_id,
    //   doc_name: inputs.message.doc_name,
    //   white_label_id: inputs.message.white_label_id,
    //   s3bucket: inputs.message.s3bucket,
    //   region: inputs.message.region,
    //   cloud: inputs.message.cloud,
    //   req_type: inputs.message.req_type,
    //   file_type: inputs.message.file_type,
    //   system: "api",
    //   doc_id: inputs.message.doc_id,
    // };

    if (reqType) { // thsi should get executed always
      let kycRes, forensicRes, kycKey;

      for (let i = 0; i < extraction.length && i < forensic.length; i++) {
        let {
          extractionData: kycRes,
          kyc_key: kycKey
        } = await restructureExtractedData(
          extraction[i],
          reqType
        );

        let verificationPayload = {
          req_type: reqType,
        };

        forensicRes = forensic;

        if (kycKey) {
          // if kycKey exists then only run below logic
          kycKey = kycKey.replace(/\s/g, "");
          let whereCondition = {
            business: inputs.message.business_id,
          };

          let fullname,
            doc_id = inputs.message.doc_id;

          switch (reqType) {
            case "pan":
              fullname = kycRes.Name;
              //for a pan do gst insertions
              //check if pan number is there in the database for this loan
              //if it exists then the get all gst numbers and update gst_master table
              verificationPayload.number = (kycRes && kycRes.Pan_number) || "";
              verificationPayload.name = (kycRes && kycRes.Name) || "";
              verificationPayload.fuzzy = "true";

              const panToGstData = await sails.helpers.panToGst(
                verificationPayload.number
              );
              if (Array.isArray(panToGstData)) {
                const newGstRecords = panToGstData.map((elm) => {
                  return {
                    gst_no: elm.gstin,
                    business_id: inputs.message.business_id,
                  };
                });

                await GstMaster.createEach(newGstRecords);
              }

              // if kyckey doesn't exist, we don't do director table insertion
              // That's why we are making the whereCodition undefined and not calling directorCreation function
              if (verificationPayload.number) whereCondition.dpancard = verificationPayload.number;
              else whereCondition = undefined;
              break;
            case "passport":
              fullname = kycRes.name;
              verificationPayload.name = kycRes.name;
              verificationPayload.fileNumber = kycRes.file_number;
              verificationPayload.dob = kycRes.dob;
              verificationPayload.fuzzy = "true";

              // if kyckey doesn't exist, we don't do director table insertion
              // That's why we are making the whereCodition undefined and not calling directorCreation function
              if (kycRes.passport_no) whereCondition.dpassport = kycRes.passport_no;
              else whereCondition = undefined;

              break;
            case "aadhar":
              //aadhar has no signzy verificatoin
              fullname = kycRes.Name;
              // if kyckey doesn't exist, we don't do director table insertion
              // That's why we are making the whereCodition undefined and not calling directorCreation function
              if (kycRes.Aadhar_number) whereCondition.daadhaar = kycRes.Aadhar_number;
              else whereCondition = undefined;
              break;
            case "license":
              fullname = kycRes.name;
              verificationPayload.req_type = "license";
              verificationPayload.number = kycRes.dl_no;
              verificationPayload.dob = kycRes.dob;

              // if kyckey doesn't exist, we don't do director table insertion
              // That's why we are making the whereCodition undefined and not calling directorCreation function
              if (verificationPayload.number) whereCondition.ddlNumber = verificationPayload.number;
              else whereCondition = undefined;
              break;
            case "voter":
              fullname = kycRes.name;
              verificationPayload.number = kycRes.vid;
              verificationPayload.name = kycRes.name;
              verificationPayload.state = "";
              try {
                let locationData = await sails.helpers.apiTrigger(
                  sails.config.pincodeApi.url + kycRes.pincode,
                  "",
                  {},
                  "GET"
                );
                verificationPayload.state =
                  JSON.parse(locationData).state[0] || "";
              } catch (err) { }

              // if kyckey doesn't exist, we don't do director table insertion
              // That's why we are making the whereCodition undefined and not calling directorCreation function
              if (verificationPayload.number) whereCondition.dvoterid = verificationPayload.number;
              else whereCondition = undefined;

              break;
          }

          if (whereCondition) {
            await createDirectorRecord(whereCondition, fullname || "", doc_id);
          }

          const dataToBeStored = {
            extractionData: kycRes,
            forensicData: forensicRes,
          };

          let [statusCode, data] = await sails.helpers.kycVerification(
            verificationPayload.req_type,
            verificationPayload
          );

          dataToBeStored.verificationData = data;

          await sails.helpers.storeKycData(
            inputs.message.business_id,
            kycKey,
            reqType,
            dataToBeStored
          );
        }

        // await updatedLoanDocumentRows(
        //   { kycRes, forensicRes },
        //   inputs.message.doc_id
        // );
      }

      // try {
      //   [kycRes, forensicRes] = await Promise.all([
      //     sails.helpers.kycExtraction(
      //       requestId,
      //       inputs.message.req_type,
      //       reqPayload
      //     ),
      //     sails.helpers.kycFraudCheck(
      //       reqPayload,
      //       inputs.message.doc_name,
      //       requestId
      //     ),
      //   ]);
      // } catch (err) { }

      // verification payload is used to call signzy api for verification


      //await sails.helpers.triggerPhotoMatch(inputs.message.loan_id);
      //await sails.helpers.generateFtrData(inputs.message.loan_id);
    }

    return exits.success(inputs.message);
  },
};