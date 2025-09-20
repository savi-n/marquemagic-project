
module.exports = {


  friendlyName: 'Pan nsdl pdf generate',


  description: '',


  inputs: {
    loan_id: {
      type: "number",
      required: true
    },
    business_id: {
      type: "number",
      required: true
    },
    director_id: {
      type: "number",
      required: true
    },
    dpancard: {
      type: "string",
      required: true
    },
    white_label_id: {
      type: "number",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    try {
      const businessId = inputs.business_id
      const directorId = inputs.director_id
      const id = inputs.dpancard
      const whiteLabelId = inputs.white_label_id
      let rowData = await PannoResponse.find({panno: id}).sort("id DESC").limit(1),
        parsedData = {};
      rowData = rowData[0];
      if (rowData?.verification_response) {
        parsedData = JSON.parse(rowData.verification_response);
        if (parsedData?.nsdlPanData?.data) {
          data = parsedData.nsdlPanData;
        } else {
          throw [400, 'NSDL data not found!'];
        }
      } else {
        throw [400, "No pan response found in the DB!"];
      }
      const businessData = await Business.findOne({
        id: businessId,
      }).select("userid");
      const doc_type = await DirectorRd.findOne({
        id: directorId
      }).select("income_type");
      const doc_type_id = sails.config.panNsdl.pan_doc_type[doc_type.income_type] ||
        sails.config.panNsdl.pan_doc_type.salaried

      const loanNo = await Loanrequest.findOne({
        business_id: businessId
      }).select(["loan_ref_id", "createdUserId", "id"]);

      const emp = await Users.findOne({
        id: loanNo?.createdUserId
      }).select("user_reference_no");

      const whiteLabelSol = await WhiteLabelSolutionRd.findOne({
        id: whiteLabelId
      }).select("s3_name");

      let empid = emp?.user_reference_no
      loan_ref_number = loanNo?.loan_ref_id
      url = sails.config.panNsdl.url;

      const fileName = `pan-${Date.now()}.pdf`,
        key = `users_${businessData.userid}/${fileName}`,
        bucket = whiteLabelSol?.s3_name,
        header = {};
      let body = {
        bucket,
        key,
        loan_ref_number,
        empid,
        data
      }
      console.log("new body", body)
      const datetime = await sails.helpers.dateTime();
      const pdfGeneration = await sails.helpers.axiosApiCall(url, body, header, "POST");
      if (pdfGeneration?.data?.status == 'ok') {
        await LoanDocument.create({
          loan: loanNo?.id,
          user_id: businessData?.userid,
          business_id: businessId,
          doctype: doc_type_id,
          doc_name: fileName,
          uploaded_doc_name: fileName,
          original_doc_name: fileName,
          status: "active",
          ints: datetime,
          on_upd: datetime,
          directorId: directorId
        });
      }

      return exits.success(pdfGeneration.message);
    } catch (err) {
      return exits.error(err.message);
    }

  }


};
