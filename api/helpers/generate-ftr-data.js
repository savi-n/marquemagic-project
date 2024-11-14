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
  //console.log("incomeTypes=> ", incomeTypes);
  const apiRes = await sails.helpers.apiTrigger(
    sails.config.ftr.coApplicantDocList_api_url + incomeTypes,
    "",
    {
      Authorization: `Bearer ${token}`,
    },
    "GET"
  );
  //console.log(apiRes);

  return typeof apiRes === "string" ? JSON.parse(apiRes).data : apiRes;
};
const getAllNotUploadedDocIds = async (
  mergedApplicantLevelDocList,
  mergedCoApplicantLevelDocList,
  loanId,
  uploadedDocTypeIdsSet
) => {
  const allDocList = [
    ...mergedApplicantLevelDocList,
    ...mergedCoApplicantLevelDocList,
  ];

  const mandatoryDocIds = [],
    allDocIds = [],
    notUploadedDocIds = [];
  const mandatoryMap = new Map();

  allDocList.forEach((item) => {
    if (item.isMandatory) mandatoryDocIds.push(item.doc_type_id);
    allDocIds.push(item.doc_type_id);
    mandatoryMap.set(item.doc_type_id, item.isMandatory || false);
  });

  let isAllMandatoryDocsUploaded = false;

  for (docTypeId of mandatoryDocIds) {
    isAllMandatoryDocsUploaded = true;
    if (!uploadedDocTypeIdsSet.has(docTypeId)) {
      isAllMandatoryDocsUploaded = false;
      break;
    }
  }

  // console.log("allDocIds", allDocIds);
  // console.log("mandatoryDocIds", mandatoryDocIds);
  // console.log("uploaded", uploadedDocTypeIdsSet);

  for (docTypeId of allDocIds) {
    if (!uploadedDocTypeIdsSet.has(docTypeId))
      notUploadedDocIds.push(docTypeId);
  }

  //console.log("mandatoryMap", mandatoryMap);

  return {
    isAllMandatoryDocsUploaded,
    notUploadedDocIds,
    mandatoryMap,
  };
};

module.exports = {
  friendlyName: "Generate ftr data",

  description: "",

  inputs: {
    loanId: {
      type: "number",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    const loanId = inputs.loanId;

    let ftrData, loan_document_data;
    //const doctypes = [1, 100];
    //fetching data from doctypes table with priority 1('Financial Documents') and 100('KYC Documents')
    const docTypeRecords = await Doctype.find({
      priority: { in: sails.config.ftr.doctypes },
    }).select("id");
    //console.log("docTypeRecords-------->", docTypeRecords);
    if (docTypeRecords.length > 0) {
      //accessing id from each record
      const extractedDocTypes = docTypeRecords.map((record) => record.id);
      //fetching data from loan_document table
      loan_document_data = await LoanDocument.find({
        doctype: extractedDocTypes,
        loan: loanId,
      }).select(["id"]);
      //console.log("loan_document_data------>", loan_document_data);
    }
    const loan_document_docIds = loan_document_data.map((record) => record.id);
    //checking the docs which are retagged
    const retaggedDocs = await LoanDocumentDetails.find({
      loan_id: loanId,
      verification_status: "re-tagged",
    }).select("doc_id");

    const retaggedSet = new Set();

    retaggedDocs.forEach((record) => {
      retaggedSet.add(record.doc_id);
    });

    // console.log(retaggedSet);
    // console.log(loan_document_docIds);

    let requiredDocsRetagged = false;

    for (elm of loan_document_docIds) {
      requiredDocsRetagged = true;
      if (!retaggedSet.has(elm)) {
        requiredDocsRetagged = false;
        break;
      }
    }

    //console.log(requiredDocsRetagged)

    if (requiredDocsRetagged) {
      const loanrequestRecord = await Loanrequest.findOne({ id: loanId })
        .populate("business_id")
        .select([
          "loan_product_id",
          "business_id",
          "white_label_id",
          "loan_ref_id",
        ]);

      const directorRecords = await Director.find({
        business: loanrequestRecord.business_id.id,
        isApplicant: 0,
      }).select("income_type");

      let incomeTypes = directorRecords.map((record) => {
        if (record.income_type === "salaried") return 7;
        else if (record.incomeType === "business") return 1;
        else return 0;
      });

      incomeTypes = incomeTypes.join(",");

      const sailsExpToken = await getSailsExpToken();
      const [applicantLevelDocList, coApplicantLevelDocList] =
        await Promise.all([
          getApplicantLevelDocList(
            loanrequestRecord.loan_product_id,
            loanrequestRecord.business_id.businesstype,
            sailsExpToken
          ),
          getCoApplicantLevelDocList(incomeTypes, sailsExpToken),
        ]);

      const mergedApplicantLevelDocList = [
        ...applicantLevelDocList.kyc_doc,
        ...applicantLevelDocList.finance_doc,
        ...applicantLevelDocList.other_doc,
      ];

      let mergedCoApplicantLevelDocList = [];

      if (coApplicantLevelDocList) {
        coApplicantLevelDocList.forEach((elm) => {
          mergedCoApplicantLevelDocList = [
            ...mergedCoApplicantLevelDocList,
            ...elm.kyc_doc,
            ...elm.finance_doc,
            ...elm.other_doc,
          ];
        });
      }
      //get the data of all docs having old_doc_type_id
      const documentDetailsRecords = await LoanDocumentDetails.find({
        loan_id: loanId,
      }).select(["old_doc_type_id", "ml_classification_track", "doc_id"]);

      const docLevelDataMap = new Map();
      const uploadedDocTypeIdsSet = new Set();

      const docIds = [];

      documentDetailsRecords.forEach((record) => {
        if (record.old_doc_type_id) {
          docIds.push(record.doc_id);
          //console.log("record=>", record);

          let ml_classification_track;
          try {
            ml_classification_track = JSON.parse(
              record.ml_classification_track
            );
          } catch (err) { }

          let image_quality, extraction, forensic, bank_details;

          if ((data = ml_classification_track.kycProcessData)) {
            image_quality = (data.kycRes && data.kycRes.document_quality) || "";
          } else if ((data = ml_classification_track.split)) {
            image_quality = data.image_quality;
            extraction = data.extraction;
            forensic = data.forensic;
            bank_details = ml_classification_track.bank_details;
          } else if (
            (data =
              ml_classification_track.classifiedData &&
              ml_classification_track.classifiedData.existing)
          ) {
            image_quality = (data[0] && data[0].image_quality) || "";
            extraction = data[0] && data[0].extraction;
            forensic = data[0] && data[0].forensic;
            bank_details = ml_classification_track.classifiedData.bank_details;
          }

          docLevelDataMap.set(record.doc_id, {
            image_quality: image_quality || "",
            extraction: extraction || "",
            forensic: forensic || "",
            bank_details: bank_details || "",
            old_doc_type_id: record.old_doc_type_id || "",
            retagged: true,
          });
        }
      });

      const LoanDocumentRecords = await LoanDocument.find({
        id: docIds,
      }).select([
        "doctype",
        "uploaded_by",
        "doc_name",
        "uploaded_doc_name",
        "original_doc_name",
      ]);

      LoanDocumentRecords.forEach((record) => {
        uploadedDocTypeIdsSet.add(record.doctype);
        const existingData = docLevelDataMap.get(record.id);
        docLevelDataMap.set(record.id, {
          doc_type_id: record.doctype || "",
          doc_name: record.doc_name || "",
          uploaded_doc_name: record.uploaded_doc_name || "",
          uploaded_by: record.uploaded_by || "",
          ...existingData,
        });
      });

      //get all docIds not uploaded
      const { isAllMandatoryDocsUploaded, notUploadedDocIds, mandatoryMap } =
        await getAllNotUploadedDocIds(
          mergedApplicantLevelDocList,
          mergedCoApplicantLevelDocList,
          loanId,
          uploadedDocTypeIdsSet
        );

      //make the structure. put the data in loanrequest
      ftrData = {
        loanId,
        loanRefId: loanrequestRecord.loan_ref_id || "",
        allMandatoryDocsUploaded: isAllMandatoryDocsUploaded,
      };

      const document_list = [];

      docLevelDataMap.forEach((val, key) => {
        document_list.push({
          doc_id: key,
          ...val,
          mandatory: mandatoryMap.get(val.doc_type_id) || false,
        });
      });

      notUploadedDocIds.forEach((id) => {
        document_list.push({
          doc_id: "",
          doc_type_id: id,
          mandatory: mandatoryMap.get(id) || false,
        });
      });

      ftrData.document_list = document_list;

      await Loanrequest.update({ id: loanId }).set({
        ftr_check: JSON.stringify(ftrData),
      });

      const payload = { loanid: loanId };

      /*let triggerReportGen = await sails.helpers.apiTrigger(
        sails.config.ftr.python_frt_report,
        JSON.stringify(payload),
        {
          "content-type": "application/json",
        },
        "POST"
      );*/

      //console.log("triggerReportGen", triggerReportGen);
    }

    return exits.success(ftrData);
  },
};