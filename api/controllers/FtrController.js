/**
 * FtrController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { v4: uuidv4 } = require("uuid");

const FINANCIAL_DOCTYPES_SET = new Set([
  "GST",
  "ITR",
  "SALARY_SLIP",
  "BS&PL",
  "FINANCIAL_DOCUMENTS",
  "CIBIL",
  "BANK_STATEMENT"
]);

const KYC_DOCTYPES_SET = new Set([
  "PAN",
  "AADHAR",
  "DL",
  "PASSPORT",
  "VOTER",
  "FORM_60",
  "SIGNATURE",
  "PHOTO",
  "PARTNERSHIP_DEED",
  "INCORPORATION_CERTIFICATE",
  "LLP_AGREEMENT",
  "UDYAM_REG_CERTIFICATE"
]);

const LENDER_DOCTYPES_SET = new Set([
  "icici_application_form",
  "AADHAAR_CONSENT"
]);

const getSailsExpToken = async () => {
  const tokenRes = await sails.helpers.apiTrigger(
    sails.config.ftr.sails_expirement_login_url,
    JSON.stringify({
      email: sails.config.ftr.email,
      password: sails.config.ftr.password,
      white_label_id: sails.config.ftr.white_label_id,
    }),
    { "content-type": "application/json" },
    "POST"
  );

  const token = JSON.parse(tokenRes).token;
  return token;
};

const getApplicantLevelDocList = async (productId, businessType, token) => {
  let checklistRes = await sails.helpers.apiTrigger(
    sails.config.ftr.documentTypes_api_url,
    JSON.stringify({
      loan_product: productId,
      business_type: businessType,
    }),
    {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    "POST"
  );

  return typeof checklistRes === "string"
    ? JSON.parse(checklistRes)
    : checklistRes;
};

const getCoApplicantLevelDocList = async (incomeTypes, token) => {
  const apiRes = await sails.helpers.apiTrigger(
    sails.config.ftr.coApplicantDocList_api_url + incomeTypes,
    "",
    {
      Authorization: `Bearer ${token}`,
    },
    "GET"
  );

  return typeof apiRes === "string" ? JSON.parse(apiRes).data : null;
};

const getLenderDocList = async (productId, token) => {
  let lenderDoctypeApiRes = await sails.helpers.apiTrigger(
    `${sails.config.ftr.lenderDoctypes_api_url}?product_id=${productId}`,
    "",
    { Authorization: `Bearer ${token}` },
    "GET"
  );

  lenderDoctypeApiRes = (typeof lenderDoctypeApiRes === "string") ? JSON.parse(lenderDoctypeApiRes) : [];

  return lenderDoctypeApiRes;
};

const getDocTypeId = async (keyword, docList, dueDate) => {
  const docIds = docList.map((elm) => elm.doc_type_id);

  let docTypeRecrods = await Doctype
    .find({ id: docIds })
    .select([
      "doc_type",
      "name",
    ])

  const searchTerms = sails.config.ftr.docsMap[keyword];

  let doc_type_id = 12; // 12 is doctype for other documents

  if (keyword == "FINANCIAL_DOCUMENTS") {
    if (sails.config.ftr.docsMap.FINANCIAL_DOCUMENTS
      && sails.config.ftr.docsMap.FINANCIAL_DOCUMENTS[dueDate]) {
      for (elm of docTypeRecrods) {
        if (elm.name === sails.config.ftr.docsMap.FINANCIAL_DOCUMENTS[dueDate]) {
          doc_type_id = elm.id;
          break;
        }
      }
    }
  } else {
    for (elm of docTypeRecrods) {
      if (searchTerms.indexOf(elm.name) !== -1) {
        doc_type_id = elm.id;
        break;
      }
    }
  }

  return doc_type_id;
};

const updateClassificationTrack = async (docId, data) => {
  let documentDetailsRecord = await LoanDocumentDetails
    .findOne({
      doc_id: docId,
    })
    .select(["ml_classification_track"])

  if (docId && documentDetailsRecord.ml_classification_track) {
    //existingData here reffers to data already present in data base.
    const existingData = JSON.parse(
      documentDetailsRecord.ml_classification_track
    );
    if (!existingData) return;
    existingData.responseTimeStamp = await sails.helpers.istDateTime();
    existingData.classifiedData = data || "";
    existingData.classificationTime = await sails.helpers.diffBetweenDateTime(
      existingData.requestTimeStamp,
      existingData.responseTimeStamp
    );
    existingData.classificationStatus = data.status || "";

    await LoanDocumentDetails.update({ doc_id: docId }).set({
      ml_classification_track: JSON.stringify(existingData),
      old_doc_type_id: (existingData && existingData.requestPayload && existingData.requestPayload.doc_type),
      verification_status: "re-tagged",
      upts: await sails.helpers.systemDateTime()
    })
  }
};

module.exports = {
  listenToQs: async function (req, res) {
    const A = await sails.helpers.fetchFromQ(`${sails.config.ftr.client}-${sails.config.qNames.GENERIC_Q}`);
    res.send(`${A}`);
  },

  classificationCallback: async function (req, res) {
    const docDetails = req.body;
    console.log("classifiedDataFromML=>", docDetails);
    let loanId, docId, userId, isLoanDocument;

    /* new and existing  reffers to new[] and existing[] in the request payload. */
    if (docDetails.new && docDetails.new[0]) {
      loanId = docDetails.new[0].loan_id;
      docId = docDetails.new[0].doc_id;
      userId = docDetails.new[0].user_id;
      isLoanDocument = docDetails.new[0].isLoanDocument;
    } else if (docDetails.existing && docDetails.existing[0]) {
      loanId = docDetails.existing[0].loan_id;
      docId = docDetails.existing[0].doc_id;
      userId = docDetails.existing[0].user_id;
      isLoanDocument = docDetails.existing[0].isLoanDocument;
    }

    if (!loanId || !docId) return res.notFound({ status: "nok", message: "no loanId/docId found" });

    await updateClassificationTrack(docId, docDetails);

    let loanrequestRecord, whiteLabelData, directorRecords;

    loanrequestRecord = await Loanrequest.findOne({ id: loanId })
      .populate("business_id")
      .select(["loan_product_id", "business_id", "white_label_id"])

    whiteLabelData = await WhiteLabelSolutionRd.findOne({
      id: loanrequestRecord.white_label_id,
    }).select(["cloud_provider", "s3_name", "s3_region"]);
    //whiteLabelData.s3_name = "nctestmumbai";

    directorRecords = await Director.find({
      business: loanrequestRecord.business_id.id
    }).select(["isApplicant", "income_type", "dfirstname", "middle_name", "dlastname"]);

    if (!loanrequestRecord) return res.notFound({
      status: "nok",
      message: "no loanrequest record found for loan_id: " + loanId,
    });

    let incomeTypes = [];

    directorRecords.forEach((record) => {
      if (!record.isApplicant) {
        if (record.income_type === "salaried") incomeTypes.push(7);
        else if (record.income_type === "business") incomeTypes.push(1);
        else incomeTypes.push(0);
      }
    })

    incomeTypes = incomeTypes.join(",");

    const sailsExpToken = await getSailsExpToken();
    let docList;

    if (isLoanDocument === true) {
      const [applicantLevelDocList, coApplicantLevelDocList] = await Promise.all([
        getApplicantLevelDocList(
          loanrequestRecord.loan_product_id,
          loanrequestRecord.business_id.businesstype,
          sailsExpToken
        ),
        getCoApplicantLevelDocList(incomeTypes, sailsExpToken),
      ]);

      const mergedApplicantLevelDocList = [
        ...(applicantLevelDocList.kyc_doc || []),
        ...(applicantLevelDocList.finance_doc || []),
        ...(applicantLevelDocList.other_doc || []),
      ];

      let mergedCoApplicantLevelDocList = [];

      if (coApplicantLevelDocList) {
        coApplicantLevelDocList.forEach((elm) => {
          mergedCoApplicantLevelDocList = [
            ...(mergedCoApplicantLevelDocList || []),
            ...(elm.kyc_doc || []),
            ...(elm.finance_doc || []),
            ...(elm.other_doc || []),
          ];
        });
      }

      docList = [
        ...mergedApplicantLevelDocList,
        ...mergedCoApplicantLevelDocList,
      ]
    } else if (isLoanDocument === false) {
      docList = await getLenderDocList(
        loanrequestRecord.loan_product_id,
        sailsExpToken
      );
    }

    let qMessages = [];
    let newDocumentRecords = [],
      updatedLoan_or_lender_DocumentRows = [];

    // here if block is for newly created docs and else block is for existing docs
    let directorId;

    if ((newDocs = docDetails.new[0])) {
      const newRecordsToBeCreated = [];
      const parentDocRecord = await LoanDocument.findOne({
        id: newDocs.doc_id,
      })
        .select("uploaded_doc_name")

      let index = 1; // the index is for tracking the split file and to make it's name unique

      // use a map using doc_name key(as it is unique) to track details of each document,
      // so that after creation of new loan_document records we can map back the details
      // to the correct documents while creating records for the document_details table.

      const docDetailsMap = new Map();

      for (split of newDocs.splits) {
        let dueDate;
        if (split.doc_type == "SALARY_SLIP" || split.doc_type == "ITR" || split.doc_type == "BANK_STATEMENT") {
          directorId = await sails.helpers.getDirectorId(split.doc_type, split.extraction, directorRecords)
        }
        for (element of split.extraction) {
          if (element.due_date) {
            dueDate = element.due_date;
            break;
          }
        }

        const docTypeId = await getDocTypeId(split.doc_type, docList, dueDate);

        if (split.doc_name) docDetailsMap.set(split.doc_name, split);

        const newRecord = {
          loan: newDocs.loan_id || "",
          business_id: newDocs.business_id || "",
          user_id: newDocs.user_id || "",
          directorId: Number(newDocs.director_id || 0) || Number(directorId || 0),
          doc_name: split.doc_name || "",
          uploaded_doc_name: `split_${split.doc_type}_${index}_${parentDocRecord.uploaded_doc_name}` || "",
          ints: await sails.helpers.systemDateTime(),
          on_upd: await sails.helpers.systemDateTime(),
          status: "active"
        }

        if (isLoanDocument === true) {
          newRecordsToBeCreated.push({
            ...newRecord,
            doctype: docTypeId || "",
            parent_doc_id: newDocs.doc_id
          });
        } else if (isLoanDocument === false) {
          newRecordsToBeCreated.push({
            ...newRecord,
            doc_type: docTypeId || ""
          });
        }

        index++;
      }

      //create records in loan_document or lender_document table
      if (isLoanDocument === true) {
        newDocumentRecords = await LoanDocument
          .createEach(
            newRecordsToBeCreated
          )
          .fetch()
      } else if (isLoanDocument === false) {
        newDocumentRecords = await LenderDocument
          .createEach(
            newRecordsToBeCreated
          )
          .fetch()
      }

      for (idx in newDocumentRecords) {
        const doc_name = newDocumentRecords[idx].doc_name;
        newDocumentRecords[idx].mldocKey = docDetailsMap.get(doc_name).doc_type; //mlDocKey is classified document category key
        newDocumentRecords[idx].region = newDocs.region;
        newDocumentRecords[idx].s3bucket = newDocs.s3bucket;
        newDocumentRecords[idx].cloud = newDocs.cloud;
        newDocumentRecords[idx].white_label_id = newDocs.white_label_id;
        newDocumentRecords[idx].extraction = docDetailsMap.get(doc_name).extraction;
        newDocumentRecords[idx].forensic = docDetailsMap.get(doc_name).forensic;
        newDocumentRecords[idx].image_quality = docDetailsMap.get(doc_name).image_quality;
      }

      let oldDocTypeId;
      //make parent document inactive
      if (isLoanDocument === true) {
        const loanDocRecord = await LoanDocument.findOne({
          id: newDocs.doc_id
        })
          .select("doctype")

        oldDocTypeId = loanDocRecord.doctype;
        /*await LoanDocument
          .update({ id: newDocs.doc_id })
          .set({
            status: "inactive",
          })*/
      } else if ((isLoanDocument === false)) {
        const lenderDocRecord = await LenderDocument.findOne({
          id: newDocs.doc_id,
        })
          .select("doc_type")

        oldDocTypeId = lenderDocRecord.doc_type;

        /*await LenderDocument
          .update({ id: newDocs.doc_id })
          .set({
            status: "inactive",
          })*/
      }
      //make parent document retagged
      await LoanDocumentDetails
        .update({
          doc_id: newDocs.doc_id,
          doc_request_type: isLoanDocument ? "loan" : "lender"
        })
        .set({
          verification_status: "re-tagged",
          old_doc_type_id: oldDocTypeId,
          upts: await sails.helpers.systemDateTime(),
        })

      //create document_details records
      for (record of newDocumentRecords) {
        await LoanDocumentDetails.create({
          doc_id: record.id || "",
          old_doc_type_id: record.doctype || record.doc_type || "", //loan document column name is doctype and lender docuemnt table column name is doc_type
          verification_status: "re-tagged",
          loan_id: record.loan || "",
          did: Number(record.directorId || 0),
          ml_classification_track: JSON.stringify({
            split: {
              image_quality: record.image_quality,
              extraction: record.extraction,
              forensic: record.forensic,
              bank_details: docDetails.bank_details,
            },
          }),
          ints: await sails.helpers.systemDateTime(),
          upts: await sails.helpers.systemDateTime(),
          doc_request_type: isLoanDocument ? "loan" : "lender",
          did: Number(directorId || 0)
        })
      }
    } else if ((docDetails.existing[0])) {
      let dueDate, existingDoc = docDetails.existing[0];

      for (element of existingDoc.extraction) {
        if (element.due_date) {
          dueDate = element.due_date;
          break;
        }
      }
      if (existingDoc.doc_type == "SALARY_SLIP" || existingDoc.doc_type == "ITR" || existingDoc.doc_type == "BANK_STATEMENT") {
        directorId = await sails.helpers.getDirectorId(existingDoc.doc_type, existingDoc.extraction, directorRecords)
        console.log(directorId);
      }
      const docTypeId = await getDocTypeId(
        existingDoc.doc_type,
        docList,
        dueDate
      );

      let oldDocTypeId, updatedRecord;
      if (isLoanDocument == true) {
        const loanDocRecord = await LoanDocument.findOne({
          id: existingDoc.doc_id
        })
          .select("doctype")

        oldDocTypeId = loanDocRecord.doctype;

        updatedRecord = await LoanDocument.update({ id: existingDoc.doc_id })
          .set({ doctype: docTypeId, directorId: directorId })
          .fetch()

      } else if (isLoanDocument == false) {
        const lenderDocRecord = await LenderDocument.findOne({
          id: existingDoc.doc_id,
        })
          .select("doc_type")

        oldDocTypeId = lenderDocRecord.doc_type;

        updatedRecord = await LenderDocument.update({ id: existingDoc.doc_id })
          .set({ doc_type: docTypeId })
          .fetch()
      }

      updatedRecord[0].mldocKey = existingDoc.doc_type;
      updatedRecord[0].region = existingDoc.region;
      updatedRecord[0].s3bucket = existingDoc.s3bucket;
      updatedRecord[0].cloud = existingDoc.cloud;
      updatedRecord[0].white_label_id = existingDoc.white_label_id;
      updatedRecord[0].image_quality = existingDoc.image_quality;
      updatedRecord[0].extraction = existingDoc.extraction;
      updatedRecord[0].forensic = existingDoc.forensic;

      updatedLoan_or_lender_DocumentRows.push(updatedRecord[0]);

      await LoanDocumentDetails.update({
        doc_id: existingDoc.doc_id,
        doc_request_type: isLoanDocument ? "loan" : "lender"
      }).set({
        old_doc_type_id: oldDocTypeId,
        verification_status: "re-tagged",
        did: directorId,
        upts: await sails.helpers.systemDateTime()
      })
    }

    let qName = null,
      status = 200;

    const allRecords = [];

    for (record of newDocumentRecords) {
      allRecords.push(record);
    }

    for (record of updatedLoan_or_lender_DocumentRows) {
      allRecords.push(record);
    }


    try {
      for (let curDoc of allRecords) {
        const isKycDoc = KYC_DOCTYPES_SET.has(curDoc.mldocKey);
        console.log(isKycDoc, curDoc.mldocKey, curDoc);
        let message = {
          loan_id: curDoc.loan || "",
          business_id: curDoc.business_id || "",
          director_id: directorId || 0,
          parent_doc_id: curDoc.parent_doc_id || "",
          doc_id: curDoc.id || "",
          doc_type_id: curDoc.doctype || curDoc.doc_type || "",
          cloud: "aws",
          doc_name: curDoc.doc_name || "",
          uploaded_doc_name: curDoc.uploaded_doc_name || "",
          original_doc_name: curDoc.original_doc_name || "",
          doc_mime_type: curDoc.doc_mime_type || "",
          size: curDoc.size || "",
          no_of_pages: curDoc.no_of_pages || "",
          image_quality_json: curDoc.image_quality_json || "",
          user_id: curDoc.user_id || "",
          isKycDoc,
          region: curDoc.region,
          s3bucket: curDoc.s3bucket,
          white_label_id: curDoc.white_label_id,
          doc_type: curDoc.mldocKey,
        };

        //qName = sails.config.qNames.KYC_Q;

        if (!isKycDoc) {
          const isFinancialDoc = FINANCIAL_DOCTYPES_SET.has(curDoc.mldocKey);

          // if it's a financial doc then restructure the q-message for python team
          if (isFinancialDoc) {
            qName = sails.config.qNames.NON_KYC_Q;
            message = {
              document_details: {
                database_details: {
                  ...message,
                  cloud_provider: whiteLabelData.cloud_provider,
                },
                doc_type: curDoc.mldocKey,
                mime_type: docDetails.mime_type,
                document_forensic_response: {
                  response: curDoc.forensic,
                },
                document_image_quality_response: {
                  response: curDoc.image_quality,
                },
                document_bank_details_response: {
                  response: docDetails.bank_details,
                },
                document_json_extract_response: {
                  response: curDoc.extraction,
                },
              },
            };
          } else {
            const isLenderDoc = LENDER_DOCTYPES_SET.has(curDoc.mldocKey);
            if (isLenderDoc) {
              //qName = sails.config.qNames.LENDER_DOCUMENTS_Q;

              if (curDoc.mldocKey == "icici_application_form") {
                //create key for s3 upload
                const key = `users_${userId}/${uuidv4()}.json`;
                console.log("key", key);
                console.log("s3", whiteLabelData.s3_name);
                await sails.helpers.jsonToS3(
                  curDoc.extraction,
                  whiteLabelData.s3_name,
                  key
                );
                console.log("done");

                let attempt = 1, maxAttempt = 15;
                let record = await Loanrequest.findOne({
                  id: loanId
                }).select("authentication_data");

                let authData = record.authentication_data;

                while (!authData && attempt <= maxAttempt) {
                  //create the json payload
                  loanrequestData = await Loanrequest.update({ id: loanId }).set({
                    authentication_data: JSON.stringify({
                      s3_data: {
                        userid: userId,
                        bucket: whiteLabelData.s3_name,
                        region: whiteLabelData.s3_region,
                        filepath: key,
                      },
                    }),
                  });

                  record = await Loanrequest.findOne({
                    id: loanId
                  }).select("authentication_data");

                  authData = record.authentication_data;
                  attempt++;
                }


                /*if (curDoc.business_id) {
                  await Director
                    .update({ business: curDoc.business_id, isApplicant: 0 })
                    .set({ type_name: "Co-applicant" })
                }*/

                let untaggedCount = await LoanDocumentDetails.count({
                  loan_id: loanId,
                  or: [
                    { verification_status: { '!=': "re-tagged" } },
                    { verification_status: null },
                  ]
                });

                await sails.helpers.insertIntoQ(sails.config.qNames.ICICI_APPLICATION_Q, { ...curDoc, untagged_docs: untaggedCount });
              }

              const payload = { "loanid": loanId };

              /*await sails.helpers.apiTrigger(
                sails.config.ftr.python_frt_report,
                JSON.stringify(payload),
                {
                  "content-type": "application/json",
                },
                "POST"
              );*/

            }
            // else {
            //   qName = sails.config.qNames.OTHERS_Q;
            // }
          }
        } else {
          console.log("enterKycProcess");
          await sails.helpers.kycProcess(
            message,
            curDoc.extraction,
            curDoc.forensic,
            curDoc.image_quality
          );
        }

        qMessages.push(message);

        if (qName) await sails.helpers.insertIntoQ(qName, message);
      }
    } catch (error) {
      console.log(error);
      status = 500;
      message = error.message;
    }

    //await sails.helpers.generateFtrData(loanId);

    res.status(status).send({
      status: status === 200 ? "ok" : "nok",
      statusCode: `NC${status}`,
      message: qMessages,
    });
  },
};