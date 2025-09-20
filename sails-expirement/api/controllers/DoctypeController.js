/**
 * Doctype
 *
 * @description :: Server-side logic for managing Doctype
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
	* @api {get} /Doctype/ Document type
	* @apiName document type
	* @apiGroup Document Type
	*  @apiExample Example usage:
	* curl -i localhost:1337/Doctype/
	*
	* @apiSuccess {Object[]} loan_product_document_mapping
	* @apiSuccess {Number} loan_product_document_mapping.id loan product document mapping id.
	* @apiSuccess {Number} loan_product_document_mapping.loan_product_id loan product id.
	* @apiSuccess {String} loan_product_document_mapping.businesstype_id business type id.
	* @apiSuccess {Number} loan_product_document_mapping.document_condition
	* @apiSuccess {Number} loan_product_document_mapping.doctype_id document type id.
	* @apiSuccess {Number} id id.
	* @apiSuccess {String} doc_type document type.
	* @apiSuccess {String} name name
	* @apiSuccess {String} priority priority.
	* @apiSuccess {String} status status.
	* @apiSuccess {String} mandatory
	* @apiSuccess {String} loan_type loan type.
	* @apiSuccess {String} doc_detail document detatils.
	* @apiSuccess {Number} white_label_id white label id.
	* @apiSuccess {String} excel_sheet_name excel sheet name.
	* @apiSuccess {Number} order

 */
const reqParams = require("../helpers/req-params");
module.exports = {
	index: function (req, res, next) {
		DoctypeRd.find().exec((err, list) => {
			if (err) {
				return Error("Error");
			}

			return res.view({result: list});
		});
	},

	show: function (req, res, next) {
		DoctypeRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	edit: function (req, res, next) {
		DoctypeRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	update: function (req, res, next) {
		Doctype.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("doctype/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Doctype.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/doctype");
		});
	},

	/**
	* @api {post} /case-docList Case Document List
	* @apiName case document list
	* @apiGroup Case
	*  @apiExample Example usage:
	* curl -i localhost:1337/case-docList
	*
	* @apiParam {Number} case_id case id.
	* @apiParam {String} white_label_id white label id.
	* @apiParam {Number} loan_product_id loan product id.
	* @apiParam {Number} loan_request_type loan request type.

	* @apiSuccess {String} status ok.
	* @apiSuccess {String} message Document listed successfully.
	* @apiSuccess {Object} documentList
	* @apiSuccess {Object[]} documentList.KYC_doc KYC document.
	* @apiSuccess {Object[]} documentList.Financial_doc Financial document.
	* @apiSuccess {Object[]} documentList.Other_doc Other document.

 */
	case_document_list: async function (req, res) {
		let {case_id, white_label_id, loan_product_id, loan_request_type} = req.body.allParams;

		const params = req.allParams(),
		 fields = ["case_id", "white_label_id", "loan_product_id", "loan_request_type"],
		 missing = await reqParams.fn(params, fields);

		if (!case_id || !white_label_id || !loan_product_id || !loan_request_type) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		white_label_id = await sails.helpers.whitelabelDecryption(white_label_id);

		if (!white_label_id || white_label_id === "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}

		LoanrequestRd.findOne({loan_ref_id: case_id, white_label_id, loan_product_id, loan_request_type})
			.populate("business_id")
			.then((loan_details) => {
				if (!loan_details) {
					throw new Error("invalidCaseOrData");
				}

				return LoanProductDocumentMappingRd.find({loan_product_id})
					.populate("doctype_id")
					.then(async (loan_product_document) => {
						if (loan_product_document.length === 0) {
							throw new Error("errorFetchingData");
						}

						const KYC_doc = [],
							Financial_doc = [],
							Other_doc = [],
							businesstypeid = loan_details.business_id.businesstype;

						for (const document of loan_product_document) {
							const businesstype = document.businesstype_id.split(",").map(Number);
							if (businesstype.includes(businesstypeid)) {
								const doctype_id = document.doctype_id;
								doc = {
									doc_type_id: doctype_id.id,
									doc_type: doctype_id.doc_type,
									name: doctype_id.name,
									doc_detail: doctype_id.doc_detail
								};
								const doctypeIdPriority = doctype_id.priority;
								if (doctypeIdPriority == 1) {
									Financial_doc.push(doc);
								} else if (doctypeIdPriority == 100) {
									KYC_doc.push(doc);
								} else if (doctypeIdPriority == 200) {
									Other_doc.push(doc);
								}
							}
						}

						const documentList = {
							KYC_doc,
							Financial_doc,
							Other_doc
						};

						sails.config.successRes.documentListed.documentList = documentList;
						if (loan_details.white_label_id == sails.config.fedfina_whitelabel_id){
							return res.ok({ecryptesResponse : await sails.helpers.crypto.with({
								action: "aesCbc256Encrypt",
								data: sails.config.successRes.documentListed
							})});
						} else return res.ok(sails.config.successRes.documentListed);
					});
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.status(401).send(sails.config.res.invalidCaseOrData);
					case "errorFetchingData":
						return res.status(401).send(sails.config.res.errorFetchingData);
					default:
						throw err;
				}
			});
	},

	/**
	* @api {get} /doctype_list Case Document type name List
	* @apiName case document type name list
	* @apiGroup Case
	*  @apiExample Example usage:
	* curl -i localhost:1337/doctype_list
	* curl -i localhost:1337/doctype_list?case_id=ELUW00017126
	*
	* @apiParam {String} case_id case id.

	* @apiSuccess {String} status ok.
	* @apiSuccess {String} message Document names are listed successfully.
	* @apiSuccess {Object[]} data
	* @apiSuccess {Number} id.
	* @apiSuccess {String} name.


 */
	doctype_list: async function (req, res) {
		const {case_id} = req.allParamsData,

		 params = req.allParams(),
		 fields = ["case_id"],
		 missing = await reqParams.fn(params, fields);

		if (!case_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		LoanrequestRd.findOne({loan_ref_id: case_id})
			.populate("business_id")
			.then((loan_details) => {
				if (!loan_details) {
					throw new Error("invalidCaseOrData");
				}

				return LoanProductDocumentMappingRd.find({loan_product_id: loan_details.loan_product_id}).then(
					async (product_mapping) => {
						if (product_mapping.length === 0) {
							throw new Error("documentNotMapped");
						}

						const doctyptList = [];

						for (const product of product_mapping) {
							let docMandatory;
							if (product.document_condition == 1) {
								docMandatory = "yes";
							} else {
								docMandatory = "no";
							}
							const businesstype_id = product.businesstype_id.split(",").map(Number);
							if (businesstype_id.includes(loan_details.business_id.businesstype)) {
								const doc_type_list = await DoctypeRd.findOne({id: product.doctype_id}).select("name");
								doctyptList.push({doc_type_list, mandatory: docMandatory});
							}
						}

						sails.config.successRes.documentNamesListed.data = doctyptList;

						return res.ok(sails.config.successRes.documentNamesListed);
					}
				);
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.status(401).send(sails.config.res.invalidCaseOrData);
					case "documentNotMapped":
						return res.badRequest(sails.config.res.documentNotMapped);
					default:
						throw err;
				}
			});
	},

	/**
	* @api {get} /uploaded_doc_list uploaded doc list
	* @apiName uploaded doc list
	* @apiGroup Case
	*  @apiExample Example usage:
	* http://localhost:1337/uploaded_doc_list?case_id=RAXW00017122&white_label_id=2548e38e6ee3e0126f1d18c50daaab6f
	*
	* @apiParam {String} case_id case id.
	* @apiParam {String} white_label_id encrypted whitelabel id

	* @apiSuccess {String} status ok.
	* @apiSuccess {String} message Uploaded documents are displayed successfully.
	* @apiSuccess {Object[]} data
	* @apiSuccess {String} document_name  uploaded document name.
	* @apiSuccess {String} document_fd_key uploaded document fd key.
	* @apiSuccess {String} document_type document type.
	* @apiSuccess {String} document_type_name document type name.
	* @apiSuccess {String} uploadedBy uploaded user id.
	* @apiSuccess {String} on_uploaded uploaded time.
 */
	uploaded_doc_list: async function (req, res) {
		const {case_id, white_label_id} = req.allParamsData,

		 params = req.allParams(),
		 fields = ["case_id", "white_label_id"],
		 missing = await reqParams.fn(params, fields);

		if (!case_id || !white_label_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const document = [],
			decrypted_whitelabel = await sails.helpers.whitelabelDecryption(white_label_id);

		if (!decrypted_whitelabel || decrypted_whitelabel === "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}

		await LoanrequestRd.findOne({loan_ref_id: case_id, white_label_id: decrypted_whitelabel})
			.populate("loan_document")
			.then(async (loan_details) => {
				if (!loan_details) {
					return res.badRequest(sails.config.res.invalidCaseOrData);
				}

				if (loan_details.loan_document.length == 0) {
					return res.badRequest(sails.config.res.documentNotUpload);
				}

				for (const loanDoc of loan_details.loan_document) {
					if (loanDoc.status == "active" && loanDoc.doctype !== 0) {
						await UsersRd.findOne({
							id: loanDoc.user_id,
							or: [
								{
									usertype: sails.config.usersdata.analyzer
								},
								{
									usertype: sails.config.usersdata.sales
								},
								{
									usertype: sails.config.usersdata.bank
								}
							]
						})
							.then(async (user_details) => {
								await DoctypeRd.findOne({id: loanDoc.doctype})
									.then((doctype) => {
										doc_data = {
											document_name: loanDoc.uploaded_doc_name,
											document_fd_key: loanDoc.doc_name,
											document_type: doctype.doc_type,
											document_type_name: doctype.name,
											uploadedBy: loanDoc.user_id,
											on_uploaded: loanDoc.ints,
											directorId: loanDoc.directorId ? loanDoc.directorId : null
										};
										document.push(doc_data);
									})
									.catch((err) => {
										throw err;
									});
							})
							.catch((err) => {
								throw err;
							});
					}
				}
				if (document.length == 0) {
					return res.badRequest(sails.config.res.noClientsDocumentUpload);
				}

				sails.config.successRes.uploadedDocList.data = document;
				return res.ok(sails.config.successRes.uploadedDocList);
			})
			.catch((error) => {
				throw error;
			});
	},

	/**
	* @api {get} /uploaded_doc_list_uiux uploaded doc list
	* @apiName uploaded doc list uiux
	* @apiGroup Case
	*  @apiExample Example usage:
	* http://localhost:1337/uploaded_doc_list_uiux
	*
	* @apiParam {String} loanId Loan Id

	* @apiSuccess {String} status ok.
	* @apiSuccess {String} message Uploaded documents are displayed successfully.
	* @apiSuccess {Object[]} data
 */

	Uploaded_doc_list_uiux: async function (req, res) {
		const id = req.param("loanId");
		loan_ref_id = req.param("loan_ref_id");

		const fields = ["loanId", "loan_ref_id"],
		 missing = await reqParams.fn({loanId: id, loan_ref_id: loan_ref_id}, fields);

		if (!id && !loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (loan_ref_id) condition = {loan_ref_id};
		else condition = {id};
		const  KYC_doc = [],
			Financial_doc = [],
			Other_doc = [],
		 loan_document = [],
		 lender_document = [];
		const loan_details = await LoanrequestRd.findOne(condition);
		if (!loan_details) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		let loanCondition = lenderCondition = {
			loan : loan_details.id, status : "active"
		};
		lenderCondition = {...lenderCondition, upload_method_type: {"!=": "ucic"}};
		const doctype_array = await doc_type_permission_check(loan_details.white_label_id, loan_details.loan_product_id, req.user.usertype, req.user.user_sub_type);
		
		if (doctype_array.length > 0){
			loanCondition.doctype = lenderCondition.doc_type = {'!=': doctype_array};
		}
		 loan_document_data = await LoanDocumentRd.find(loanCondition).populate("doctype");
		if (!loan_ref_id && loan_document_data.length === 0) {
			return res.badRequest(sails.config.res.documentNotUpload);
		}
		if (loan_ref_id) {
			const lender_document_fetch = await LenderDocumentRd.find(lenderCondition).populate(
				"doc_type"
			);
			
			for (lenderDoc of lender_document_fetch) {
				permission_changes = await document_priority_check(loan_details.white_label_id, loan_details.id, loan_details.loan_status_id, loan_details.loan_sub_status_id, lenderDoc.doc_type.priority, req.user.usertype);
					if (!permission_changes || Object.keys(permission_changes).length === 0){
					lenderDoc.loan_document_details = await document_details(lenderDoc.id, "lender");
					lender_document.push(lenderDoc);
				}
			}

			is_aadhaar_verified_with_otp = false;
			dirData = await DirectorRd.findOne({business: loan_details.business_id, isApplicant: 1}).select(
				"daadhaar"
			);
			if (dirData && dirData.daadhaar) {
				EkycRes = await EkycResponse.find({kyc_key: dirData.daadhaar})
					.select("response")
					.sort("updated DESC");
				if (EkycRes.length > 0 && EkycRes[0].response) {
					resData = JSON.parse(EkycRes[0].response);
					is_aadhaar_verified_with_otp = resData.code == 200 ? true : false;
				}
			}
			if (loan_document_data.length === 0) {
				sails.config.successRes.documentListed.documentList = {
					loan_document,
					lender_document,
					is_aadhaar_verified_with_otp
				};
				return res.ok(sails.config.successRes.documentListed);
			}
		}
		for (let loanDoc of loan_document_data) {
			permission_changes = await document_priority_check(loan_details.white_label_id, loan_details.id, loan_details.loan_status_id, loan_details.loan_sub_status_id, loanDoc.doctype.priority, req.user.usertype);
				if (!permission_changes || Object.keys(permission_changes).length === 0){
				loanDoc.loan_document_details = await document_details(loanDoc.id, "loan");
				uploadedUserId = loanDoc.uploaded_by ? loanDoc.uploaded_by : loanDoc.user_id;
				loanDoc.user_name = await username(uploadedUserId);
				if (
					loanDoc.loan_document_details[0] &&
						loanDoc.loan_document_details[0].classification_type == "others"
				)
					loanDoc = {...loanDoc, ...loanDoc.loan_document_details[0]};
				loan_document.push(loanDoc);
				const doctype = loanDoc.doctype;
				loanDoc.category = doctype.doc_type;
				loanDoc.priority = doctype.priority;
			
				if(!loan_ref_id){
					if (doctype) {
						if (doctype.priority === "1") {
							Financial_doc.push(loanDoc);
						}
						if (doctype.priority === "100") {
							KYC_doc.push(loanDoc);
						}
						if (doctype.priority === "200") {
							Other_doc.push(loanDoc);
						}
					} else {
						return res.status(500).send({
							message: `Found invalid doc_type_id: ${loanDoc.doctype}. Please alert backend team.`
						});
					}
				}
				loanDoc.doctype = doctype.id;
			}
		}
		let documentList;
		if (loan_ref_id) {
			documentList = {loan_document, lender_document, is_aadhaar_verified_with_otp};
		}
		else {
			documentList = {
				KYC_doc ,
				Financial_doc,
				Other_doc
			};
		}

		sails.config.successRes.documentListed.documentList = documentList;
		return res.ok(sails.config.successRes.documentListed);
	},

	documentStatus: async function (req, res) {
		let {doc_id, status, loan_id, did, doc_request_type} = req.allParams(),
		 userid = req.user.id;

		const fields = ["doc_id", "status", "did", "loan_id", "doc_request_type"],
		 params = req.allParams(),
		 missing = await reqParams.fn(params, fields);

		if (missing.length) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		try {
			let LoandocdetailsData = await LoanDocumentDetailsRd.findOne({doc_id}),
			 responseData = [];
			if (!LoandocdetailsData) {
				const datetime = await sails.helpers.dateTime();
				let newDoc = {
					loan_id,
					doc_id,
					did,
					ints: datetime,
					upts: "0000-00-00 00:00:00",
					lat: 0,
					long: 0,
					action_by: userid,
					document_upload_status: status,
					doc_request_type
				};
				createData = await LoanDocumentDetails.create(newDoc).fetch();
				responseData.push(createData);
			} else {
				responseData = await LoanDocumentDetails.update({doc_id})
					.set({document_upload_status: status, action_by: userid, doc_request_type})
					.fetch();
			}

			let userData = await UsersRd.findOne({id: userid});
			if (responseData[0] && userData) {
				responseData[0]["userData"] = userData;
			}
			if (responseData) {
				return res.send({
					status: "ok",
					message: "Document status changed!",
					data: responseData
				});
			} else {
				return res.send({
					status: "nok",
					message: "Unable to change document status!"
				});
			}
		} catch (err) {
			return res.serverError(err);
		}
	}
};

async function document_details(doc_id, request_type){

	let loan_document_details = await LoanDocumentDetailsRd.find({
		doc_id: doc_id,
		doc_request_type: request_type
	});
	if (loan_document_details.length > 0 &&  loan_document_details[0] && loan_document_details[0].action_by) {
		const userData = await UsersRd.findOne({id: loan_document_details[0].action_by});
		if (userData) {
			loan_document_details[0]["userData"] = userData;
		}
	}
	loan_document_details = loan_document_details.length > 0 ? loan_document_details : [];

	return loan_document_details;
}
async function username(uploadedUserId){
	const userDetails = await UsersRd.findOne({
			where: {id: uploadedUserId},
			select: ["name"]
		}),
		user_name = userDetails.name;
	return user_name;
}
async function document_priority_check(white_label_id, loan_id, loan_status_id, loan_sub_status_id, priority, usertype) {
	const nc_condition = {
			status1 : loan_status_id,
			status2 : loan_sub_status_id,
			white_label_id
		},
	 loan_bank_mapping_data = await LoanBankMappingRd.find({loan_id}).sort("updated_at DESC").select(["loan_bank_status", "loan_borrower_status", "meeting_flag"]);
	 let data = {};
	if (loan_bank_mapping_data.length > 0){
		 nc_condition.status3 = loan_bank_mapping_data[0].loan_bank_status;
		 nc_condition.status4 = loan_bank_mapping_data[0].loan_borrower_status;
		 nc_condition.status6 = loan_bank_mapping_data[0].meeting_flag == "0" ? null : loan_bank_mapping_data[0].meeting_flag;
	}
	const nc_status_data = await NcStatusManageRd.find(nc_condition).select("exclude_user_ncdoc");

	if (nc_status_data.length > 0 && nc_status_data[0].exclude_user_ncdoc) {
		const  excludeUserParseData = JSON.parse(nc_status_data[0].exclude_user_ncdoc);
		data = excludeUserParseData.user_types_toexclude.find(o => o.name === usertype && o.priority.indexOf(priority) > -1);
	}
	return data;
}
async function doc_type_permission_check(white_label_id, loan_product_id, usertype, user_sub_type){
	let doctype = [],
	 whiteLabelData = await WhiteLabelSolutionRd.findOne({id : white_label_id}).select("document_mapping");
	whiteLabelData = whiteLabelData ? JSON.parse(whiteLabelData.document_mapping) : {};
	if (whiteLabelData && whiteLabelData.exclude_documents && whiteLabelData.exclude_documents.length > 0){
		for (const doc_data of whiteLabelData.exclude_documents){
			if (doc_data.user_type === usertype &&
				((doc_data.product_id && doc_data.product_id.includes(loan_product_id)) || !doc_data.product_id)
				&& ((doc_data.user_sub_type && doc_data.user_sub_type === user_sub_type) || !doc_data.user_sub_type)){
				doctype = doc_data.doctype;
			}
		}
	}
	doctype.push(0);
	return doctype;
}
