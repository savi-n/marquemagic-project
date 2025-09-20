const reqParams = require("../helpers/req-params");
module.exports = {
	editWord: async function (req, res) {
		const {loan_ref_id} = req.allParams(),
		 params = req.allParams(),
		 fields = ["loan_ref_id"],
		 missing = await reqParams.fn(params, fields);
		 

		if (missing.length) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanrequestData = await LoanrequestRd.findOne({loan_ref_id});
		if (!loanrequestData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		const loanDoc = await LoanDocumentRd.find({
			loan: loanrequestData.id,
			status: "active",
			doctype: sails.config.crisil_word_doc_type_id
		})
			.select(["doc_name", "user_id", "doctype"])
			.sort("id desc")
			.limit(1);
		if (loanDoc.length == 0) {
			return res.badRequest({status : "ok", message : "No Documents found for this case"});
		}

		try {
			const {filepath, region} = await getAWSBucket(loanrequestData.white_label_id, loanDoc[0].user_id),
			 wordDocLink = await sails.helpers.s3ViewDocument(loanDoc[0].doc_name, filepath, region),
			 callbackReq = {
					save_format : "docx",
					save_url : sails.config.zoho.callback_url,
					save_url_params : {
						id : loan_ref_id,
						doc_id : loanDoc[0].id,
						document: "$content"
					},
					http_method_type : "post"
				},
			 data = {
					apikey: sails.config.zoho.apikey,
					url: wordDocLink,
					permissions: '{"document.export":false,"document.print":false,"document.edit":true}',
					callback_settings : JSON.stringify(callbackReq)
				},
			 docEditUrl = "https://api.office-integrator.in/writer/officeapi/v1/documents",
			 	response = await sails.helpers.axiosApiCall(
					docEditUrl,
					data,
					{"Content-Type": "multipart/form-data"},
					"POST"
				);
			if (response && response.status == 200){
				return res.send({
					status: "ok",
					statusCode: "NC200",
					resCode: "SUCCESS",
					data: response.data
				});
			} else {
				return res.badRequest({
					status : 'nok',
					message : "Error",
					data : response.response.data
				});
			}
		} catch (err) {
			console.log("Server error =>", err);
			return res.serverError({
				status: "nok",
				message: "Internal server error!",
				ereor : err
			});
		}
	},
	save_url : async function(req, res){
		let  url = req.body.url;
		
		const apikey =  sails.config.zoho.apikey;
		
		url = url+"?apikey="+apikey;
		response = await sails.helpers.axiosApiCall(
			url,
			"",
			{},
			"POST"
		);
		if (response && response.status == 200){
			return res.send({
				status: "ok",
				statusCode: "NC200",
				resCode: "SUCCESS",
				data: response.data
			});
		} else {
			return res.badRequest({
				status : 'nok',
				message : "Error",
				data : response.response.data
			});
		}
	},
	zoho_callback_api : async function (req, res){
		//const loan_ref_id = req.param(),
		const loan_ref_id = req.body.id,
		 doc_id = req.body.doc_id,
		 document = req.file("document");
		 if (loan_ref_id && document) {
			const loanData = await LoanrequestRd.findOne({loan_ref_id}).populate("business_id"),
			 {filepath, region} = await getAWSBucket(loanData.white_label_id, loanData.business_id.userid),
			 s3Upload = await sails.helpers.s3Upload(document, filepath, region);
			if (s3Upload){
				const docDetails = await LoanDocumentRd.findOne({id : doc_id, loan : loanData.id});
				if (docDetails) {
					const updateDocData = await LoanDocument.update({id: doc_id}).set({
						doc_name : s3Upload[0].fd,
						size : s3Upload[0].size,
						uploaded_doc_name :  s3Upload[0].filename,
						on_upd : await sails.helpers.dateTime()
					}).fetch();
					console.log(updateDocData);
					return res.ok("Document uploaded successfully.");
				}
				return res.badRequest("Invalid Doc_id.");
			} else {
				return res.badRequest("Docuement Upload error.");
			}
		 } else {
			return res.badRequest("Mandatory fields are missing.");
		 }
	}
};

async function getAWSBucket(whitelabel_id, userid) {
	whitelabelsolution = await WhiteLabelSolutionRd.findOne({id: whitelabel_id});
	aws_bucket_name = whitelabelsolution["s3_name"];
	const region = whitelabelsolution["s3_region"];

	let filepath = aws_bucket_name + "/users_" + userid;

	return {aws_bucket_name, region, filepath};
}
