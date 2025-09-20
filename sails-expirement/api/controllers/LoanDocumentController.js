/**
 * LoanDocument
 *
 * @description :: Server-side logic for managing LoanDocument
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * @api {get} /LoanDocument/ Loan document
 * @apiName loan document
 * @apiGroup Loans
 * @apiExample Example usage:
 * curl -i localhost:1337/LoanDocument/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {Number} business_id business id.
 * @apiSuccess {Number} user_id user id.
 * @apiSuccess {Number} doc_type_id document type id.
 * @apiSuccess {String} doc_name document name.
 * @apiSuccess {String} uploaded_doc_name uploaded document name.
 * @apiSuccess {String} original_doc_name original document name
 * @apiSuccess {String} status
 * @apiSuccess {String} osv_doc yes/no.
 * @apiSuccess {String} ints
 * @apiSuccess {String} on_upd
 * @apiSuccess {String} no_of_pages number of pages.
 * @apiSuccess {String} json_extraction json extraction.
 * @apiSuccess {String} size size.
 * @apiSuccess {String} document_comments document comments.
 * @apiSuccess {String} image_quality_json_file
 * @apiSuccess {Number} mis_group_id
 * @apiSuccess {String} upload_method_type upload method type.
 * @apiSuccess {Object} loan
 * @apiSuccess {Number} loan.id id.
 * @apiSuccess {Number} loan.loan_request_type loan request type.
 * @apiSuccess {String} loan.loan_ref_id loan reference id.
 * @apiSuccess {Number} loan.loan_amount loan amount.
 * @apiSuccess {String} loan.loan_amount_um crores/lakhs.
 * @apiSuccess {Number} loan.applied_tenure
 * @apiSuccess {Number} loan.assets_value assets value.
 * @apiSuccess {String} loan.assets_value_um crores/lakhs.
 * @apiSuccess {Number} loan.annual_revenue
 * @apiSuccess {String} loan.revenue_um crores/lakhs.
 * @apiSuccess {Number} loan.annual_op_expense
 * @apiSuccess {String} loan.op_expense_um crores/lakhs.
 * @apiSuccess {String} loan.cur_monthly_emi monthly emi.
 * @apiSuccess {Number} loan.loan_asset_type_id loan asset type id.
 * @apiSuccess {Number} loan.loan_usage_type_id loan usage type id.
 * @apiSuccess {String} loan.loan_type_id loan type id.
 * @apiSuccess {Number} loan.loan_rating_id loan rating id.
 * @apiSuccess {Number} loan.loan_status_id loan status id.
 * @apiSuccess {Number} loan.loan_sub_status_id
 * @apiSuccess {String} loan.remarks remarks.
 * @apiSuccess {Number} loan.assigned_uw
 * @apiSuccess {String} loan.assigned_date assigned date.
 * @apiSuccess {String} loan.osv_doc
 * @apiSuccess {String} loan.modified_on modified date.
 * @apiSuccess {String} loan.RequestDate Request Date.
 * @apiSuccess {String} loan.loan_summary loan summary.
 * @apiSuccess {Number} loan.loan_product_id loan product id.
 * @apiSuccess {Number} loan.notification notification.
 * @apiSuccess {String} loan.white_label_id white label id.
 * @apiSuccess {Number} loan.sales_id sales id.
 * @apiSuccess {String} loan.loan_originator
 * @apiSuccess {String} loan.doc_collector
 * @apiSuccess {String} loan.unsecured_type
 * @apiSuccess {String} loan.remark_history remark history.
 * @apiSuccess {String} loan.application_ref
 * @apiSuccess {String} loan.document_upload Done/Pending.
 * @apiSuccess {Number} loan.business_id business id.
 * @apiSuccess {String} loan.createdUserId created UserId
 * @apiSuccess {Number} loan.loan_orginitaor
 *
 * @apiSuccess {Object} doctype
 * @apiSuccess {Number} doctype.id doctype id.
 * @apiSuccess {String} doctype.doc_type document type.
 * @apiSuccess {String} doctype.name document name.
 * @apiSuccess {String} doctype.priority document priority.
 * @apiSuccess {String} doctype.status status.
 * @apiSuccess {String} doctype.mandatory mandatory.
 * @apiSuccess {String} doctype.loan_type loan type.
 * @apiSuccess {String} doctype.doc_detail document details.
 * @apiSuccess {String} doctype.white_label_id white label id.
 * @apiSuccess {String} doctype.excel_sheet_name
 * @apiSuccess {String} doctype.order
 */
const reqParams = require("../helpers/req-params");
const axios = require('axios');
const path = require('path');
const AWS = require('aws-sdk');
AWS.config.update(sails.config.aws);
const s3 = new AWS.S3();
module.exports = {
	index: function (req, res, next) {
		LoanDocumentRd.find().exec((err, list) => {
			if (err) {
				return Error("Error");
			}

			return res.view({result: list});
		});
	},

	show: function (req, res, next) {
		LoanDocumentRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	edit: function (req, res, next) {
		LoanDocumentRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	update: function (req, res, next) {
		LoanDocument.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loanDocument/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		LoanDocument.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loanDocument");
		});
	},

	/**
	 * @description :: loan document upload in edit loan
	 * @api {post} /loanDocEdit/ edit loan document
	 * @apiName edit loan document upload
	 * @apiGroup Loans
	 * @apiExample Example Usage:
	 * curl -i localhost:1337/loanDocEdit/
	 *
	 * @apiParam {Number} id id.
	 * @apiParam {Number} loan_id loan_id.
	 * @apiParam {Number} business_id
	 * @apiParam {Number} user_id
	 * @apiParam {String} fd doc_name
	 * @apiParam {Number} size size
	 * @apiParam {String} type
	 * @apiParam {String} filename uploaded_doc_name
	 * @apiParam {String} status
	 * @apiParam {String} field
	 * @apiParam {Number} value doc_type_id
	 *
	 * @apiSuccess {Object[]} loan_documents
	 */
	loanDocumentEdit: async function (req, res, next) {
		const post_data = req.allParams();
		const dateTime = require("node-datetime");
		const dt = dateTime.create(),
			formatted_date = dt.format("Y-m-d H:M:S").toString(),
			documents = Object.values(post_data),
			result = [];
		documents.forEach(async (docElement) => {
			doc_data = {
				loan: docElement.loan_id,
				business_id: docElement.business_id,
				user_id: docElement.user_id,
				doctype: docElement.value,
				doc_name: docElement.fd,
				uploaded_doc_name: docElement.filename,
				size: docElement.size,
				ints: formatted_date,
				upload_method_type: "newui"
			};
			if (!docElement.id || docElement.id == null || docElement.id == 0) {
				const createDocData = await LoanDocument.create(doc_data).fetch();
				var logService = await sails.helpers.logtrackservice(
					req,
					"loanDocCreate",
					createDocData.id,
					"loan_document"
				);
				result.push(createDocData);
			} else {
				const editDocData = await LoanDocument.update({id: docElement.id}).set(doc_data).fetch();
				var logService = await sails.helpers.logtrackservice(
					req,
					"loanDocEdit",
					editDocData.id,
					"loan_document"
				);
				result.push(editDocData);
			}
		});
		// if (result) {
		return res.json({
			status: "ok",
			message: sails.config.msgConstants.uploadSuccess
		});
		// }
	},

	/**
   * @description :: loan document delete
   * @api {get} /documentDelete/ delete document
   * @apiName document delete
   * @apiGroup Loans
   * @apiExample Example usage:
   * curl -i localhost:1337/documentDelete/

   * @apiParam {Number} loan_doc_id document id.
   *@apiParam {Number} business_id business id.
   *@apiParam {Number} loan_id loan id.
   *@apiParam {Number} userid user id.
   * @apiSuccess {String} status ok.
   * @apiSuccess {String} message Document deleted successfully.
   */

	documentDelete: async function (req, res, next) {
		const loan_doc_id = req.body.loan_doc_id,
			business_id = req.body.business_id,
			loanid = req.body.loan_id,
			userid = req.body.userid,
			document = await LoanDocumentRd.findOne({
				id: loan_doc_id,
				business_id: business_id,
				loan: loanid,
				user_id: userid
			});
		if (document) {
			const logService = await sails.helpers.logtrackservice(req, "documentDelete", document.id, "loan_document");
			loanDocumentData = await LoanDocument.update({id: document.id})
				.set({status: "deleted", deleted_by: req.user.id})
				.fetch();
			if (document.doctype === sails.config.docUpload.profilePic) {
				const updateBusinessData = await Business.update({id: business_id})
					.set({customer_picture: null})
					.fetch();
				updateDirData = await Director.update({id: document.directorId}).set({customer_picture: null}).fetch();
			}
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.successfulDocDeletion
			});
		} else {
			return res.badRequest({status: "nok", message: sails.config.msgConstants.invalidDocument});
		}
	},

	/**
   * @description :: upload document for case creation
   * @api {post} /case-docUpload upload case document
   * @apiName document upload for case creation
   * @apiGroup Case
   * @apiExample Example usage:
   * curl -i localhost:1337/case-docUpload

   *@apiParam {Number} case_id case reference id.
   *@apiParam {String} white_label_id white label id(encrypted white label id).
   *@apiParam {Number} doc_type_id doc type id.
   *@apiParam {File} document upload document.
   *@apiSuccess {String} status ok.
   *@apiSuccess {String} message Document uploaded successfully.
   *@apiSuccess {String} uploadedfile uploaded file fd name.
   */

	case_document_upload: async function (req, res) {
		let {white_label_id, password, doc_type_id, case_id: loan_ref_id, document, filename} = req.body.allParams;
		white_label_id = white_label_id ? white_label_id : req.user.loggedInWhiteLabelID ? req.user.loggedInWhiteLabelID : "";
		const params = req.allParams();
		const fields = ["white_label_id", "password", "doc_type_id"];
		const missing = await reqParams.fn(params, fields);

		if (!loan_ref_id || !white_label_id || !doc_type_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (white_label_id.length == 32) {
			white_label_id = await sails.helpers.whitelabelDecryption(white_label_id);

			if (!white_label_id || white_label_id === "error") {
				return res.badRequest(sails.config.res.invalidWhiteLabel);
			}
		}
		let {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({id: white_label_id}).select(["s3_name", "s3_region"]),
			uploadFile,
			loan_details = await LoanrequestRd.findOne({loan_ref_id, white_label_id});
		if (loan_details.white_label_id == sails.config.fedfina_whitelabel_id) {
			if (!document || !filename) {
				sails.config.res.missingFields.mandatoryFields = missing;
				return res.badRequest(sails.config.res.missingFields);
			}
			const fileExtension = path.extname(filename);
			const fileType = await sails.helpers.extensionToMimeType(fileExtension);
			const buffer = Buffer.from(document, 'base64');
			const params = {
				Bucket: s3_name,
				Key: `users_${req.user["id"]}/${encodeURIComponent(filename)}`,
				Body: buffer,
				ContentEncoding: 'base64',
				ContentType: fileType
			};
			const data = await s3.upload(params).promise();
			uploadFile = [{fd: encodeURIComponent(filename), filename}]
		} else {
			s3_name = `${s3_name}/users_${req.user["id"]}`;
			document = req.file("document");
			uploadFile = await sails.helpers.s3Upload(document, s3_name, s3_region);

		}

		if (!loan_details || !uploadFile || uploadFile.length === 0) {
			sails.config.res.caseWhiteLableIdMismatch.exception = "Invalid parameters";
			return res.badRequest(sails.config.res.caseWhiteLableIdMismatch);
		}
		const loanbankmapping = (await LoanBankMappingRd.find({loan_id: loan_details.id}).limit(1))[0] || {},
			nc_status = sails.config.nc_status;

		if (
			loan_details.loan_status_id == nc_status.status9 ||
			(loan_details.loan_status_id == nc_status.status2 &&
				loan_details.loan_sub_status_id == nc_status.status6) ||
			(loanbankmapping &&
				loan_details.loan_status_id == nc_status.status1 &&
				loan_details.loan_sub_status_id == nc_status.status3 &&
				loanbankmapping.loan_bank_status == nc_status.status5 &&
				loanbankmapping.loan_borrower_status == nc_status.status4) ||
			(white_label_id == 15 &&
				loan_details.loan_status_id !== 2 &&
				loan_details.loan_sub_status_id !== 9 &&
				loanbankmapping.loan_bank_status !== 12 &&
				loanbankmapping.loan_borrower_status !== 12)
		) {
			const doc_upload = await LoanDocument.create({
				loan: loan_details.id,
				business_id: loan_details.business_id,
				user_id: req.user.id,
				doctype: doc_type_id,
				doc_name: uploadFile[0].fd,
				uploaded_doc_name: uploadFile[0].filename,
				upload_method_type: sails.config.loanOrigin.loan_origin,
				ints: await sails.helpers.dateTime(),
				on_upd: await sails.helpers.dateTime(),
				document_password: password ? password : null
			}).fetch(),
				uploadedfile = `${doc_upload.doc_name}-${doc_upload.id}`;
			await LoanDocumentDetails.create({
				doc_id: doc_upload.id,
				ints: await sails.helpers.dateTime(),
				loan_id: loan_details.id,
				did: 0
			}).fetch();
			message = {
				loan_id: loan_details.id,
				business_id: loan_details.business_id,
				director_id: "",
				doc_id: doc_upload.id,
				parent_doc_id: "",
				doc_type: doc_type_id,
				user_id: req.user.id,
				doc_name: uploadFile[0].fd,
				uploaded_doc_name: uploadFile[0].filename,
				original_doc_name: uploadFile[0].filename,
				s3bucket: s3_name.split("/")[0],
				region: s3_region,
				cloud: "aws",
				white_label_id: white_label_id,
				isLoanDocument: true
			};
			// await sails.helpers.insertIntoQ("generic-q", message);
			sails.config.successRes.documentUploaded.uploadedfile = uploadedfile;
			if (loan_details.white_label_id == sails.config.fedfina_whitelabel_id) {
				const encryptData = await sails.helpers.crypto.with({
					action: "aesCbc256Encrypt",
					data: sails.config.successRes.documentUploaded
				});
				return res.ok({ecryptesResponse: encryptData});
			} else return res.send(sails.config.successRes.documentUploaded);
		} else {
			return res.badRequest(sails.config.res.caseIncompleteState);
		}

		/* const cp = require("child_process");

		let {white_label_id, doc_type_id, case_id: loan_ref_id} = req.body.allParams;
		console.log('---------------------------',req.body.allParams);

		if (!loan_ref_id || !white_label_id || !doc_type_id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		white_label_id = await sails.helpers.whitelabelDecryption(white_label_id);

		if (!white_label_id || white_label_id === "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}

		const document = req.file("document");
		if (!document || document.fieldName == "NOOP_document") {
			return res.status(404).send({status: "nok", message: "file not found"});
		}

		let filename = document._files[0].stream.filename;
		let extArr = filename.split('.');
		let extension = extArr[extArr.length - 1];

		let docData;
		loan_details = await LoanrequestRd.findOne({loan_ref_id, white_label_id});
		if (!loan_details) {
			sails.config.res.caseWhiteLableIdMismatch.exception = "Invalid parameters";
			return res.badRequest(sails.config.res.caseWhiteLableIdMismatch);
		}
		const loanbankmapping = (await LoanBankMappingRd.find({loan_id: loan_details.id}).limit(1))[0] || {},
		 nc_status = sails.config.nc_status;

		 if (
			loan_details.loan_status_id == nc_status.status9 ||
			(loan_details.loan_status_id == nc_status.status2 &&
				loan_details.loan_sub_status_id == nc_status.status6) ||
			(loanbankmapping &&
				loan_details.loan_status_id == nc_status.status1 &&
				loan_details.loan_sub_status_id == nc_status.status3 &&
				loanbankmapping.loan_bank_status == nc_status.status5 &&
				loanbankmapping.loan_borrower_status == nc_status.status4)
		) {
			docData = {
					loan: loan_details.id,
					business_id: loan_details.business_id,
					user_id: req.user.id,
					doctype: doc_type_id,
					uploaded_doc_name: filename,
					original_doc_name : filename,
					upload_method_type: sails.config.loanOrigin.loan_origin,
					ints: await sails.helpers.dateTime(),
					on_upd: await sails.helpers.dateTime(),
					uploaded_by : req.user.id

				};
		} else {
			return res.badRequest(sails.config.res.caseIncompleteState);
		}

		child = cp.fork(__dirname + "/DocUploadProcessController.js");

		let [fileUploadRes, dbQueryRes] = await Promise.all([
			sails.helpers.localUpload(document, '../../.tmp/downloads'),
			WhiteLabelSolutionRd.findOne({id: white_label_id})
		]);

		let {s3_name, s3_region} = dbQueryRes,
			{fd: filePath, type: ContentType} = fileUploadRes[0];

		let obj = {
			filePath,
			extension,
			ContentType,
			s3_name,
			s3_region,
			azureActive: sails.config.azure.isActive,
			azureCred: {
				account: sails.config.azure.prod_env.storage.storageAccountName,
				accountKey: sails.config.azure.prod_env.storage.secret
			},
			awsCred: {
				key: sails.config.aws.key,
				secret: sails.config.aws.secret
			},
			userId: req.user.id
		}

		child.send(obj);

		child.on('message', async (processRes) => {
			console.log(processRes);
			if (processRes && processRes.data){
				if (docData){
					docData.doc_name = processRes.data;
					const doc_upload = await LoanDocument.create(docData).fetch();
					uploadedfile = `${doc_upload.doc_name}-${doc_upload.id}`;
					sails.config.successRes.documentUploaded.uploadedfile = uploadedfile;
					return res.send(sails.config.successRes.documentUploaded);
				}

			} else {
				return res.badRequest({status : "nok", message: "File upload failed! due to some error."});
			}

		});*/
	},

	/**
   * @description ::  case creation status
   * @api {post} /casecreation-docStatus_initiate case creation status
   * @apiName case creation document status initiate
   * @apiGroup Case
   * @apiExample Example usage:
   * curl -i localhost:1337/casecreation-docStatus_initiate

   *@apiParam {Number} case_id case reference id.
   *@apiParam {String} status status("Done","Pending").

   *@apiSuccess {String} status ok.
   *@apiSuccess {String} message Document Upload for this case is completed.
   *@apiSuccess {String} DES_CODE NC08
   *@apiSuccess {Object} data completed loan deatails.
   *@apiSuccess {String} loan_ref_id case id.
   *@apiSucess {String} document_upload document upload status.
   */

	case_creation_status: async function (req, res) {
		const {case_id, status, comments, product_initiate_type} = req.body.allParams;

		const params = req.allParams();
		const fields = ["case_id"];
		const missing = await reqParams.fn(params, fields);

		if (!case_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanReqData = await LoanrequestRd.findOne({loan_ref_id: case_id});
		const taskUserData = await TaskUserMappingRd.findOne({taskid: 13, reference_id: loanReqData.id, status: 'sent back'});

		if (taskUserData) {
			let dateTime = await sails.helpers.dateTime();
			if (!loanReqData) {
				sails.config.res.invalidCaseOrData.exception = "Please check the case id";
				throw new Error("invalidCaseOrData");
			}

			let taskCommentObject = {};
			taskCommentObject["task_id"] = taskUserData.id;
			taskCommentObject["commenter_id"] = req.user.id;
			taskCommentObject["comment"] = comments || "NA";
			taskCommentObject["created_time"] = dateTime;
			let taskCommentAdded = await TaskComments.create(taskCommentObject).fetch();
			ncStatusData = await NcStatusManageRd.find({
				white_label_id: loanReqData.white_label_id,
				status1: loanReqData.loan_status_id,
				status2: loanReqData.loan_sub_status_id,
			}).select("name");
			report_tat = await sails.helpers.reportTat(
				req.user.id,
				req.user.name,
				loanReqData.id,
				"BPO Initiated",
				ncStatusData[0].name,
				comments
			);
			let remarks = {};
			let nc_status = {};
			let remarkData = {
				userid: taskUserData.creator_id,
				loan_status_id: 16,
				loan_sub_status_id: 16,
				type: "Case initiated to Rework",
				message: comments || "NA",
				assignedBy: taskUserData.creator_id,
				assignedTo: taskUserData.assign_userid,
			};
			data = {
				userid: req.user.id,
				loan_status_id: loanReqData.loan_status_id,
				loan_sub_status_id: loanReqData.loan_sub_status_id,
				document_initiate_status: status,
				initiated_by: req.user.name
			};
			if (comments) {
				data.type = "Comments";
				data.message = comments;
			}
			if (!loanReqData.remarks) {
				remarks[dateTime] = remarkData;
				remarks = JSON.stringify(remarks);
			} else {
				let jsonRemarks = JSON.parse(loanReqData.remarks);
				jsonRemarks[dateTime] = remarkData;
				remarks = JSON.stringify(jsonRemarks);
			}
			if (!loanReqData.nc_status_history) {
				nc_status[dateTime] = data;
				nc_status = JSON.stringify(nc_status);
			} else {
				let jsonNcStatus = JSON.parse(loanReqData.nc_status_history);
				jsonNcStatus[dateTime] = data;
				nc_status = JSON.stringify(jsonNcStatus);
			}
			const updateTask = await TaskUserMapping.update({id: taskUserData.id})
				.set({
					status: "reopen",
					updated_time: dateTime
				}).fetch();
			nc_status_manage = await NcStatusManageRd.findOne({
				name: "BPO Initiated",
				white_label_id: req.user.loggedInWhiteLabelID
			});
			loanreqUpdate = await Loanrequest.update({loan_ref_id: case_id})
				.set({
					loan_status_id: nc_status_manage.status1,
					loan_sub_status_id: nc_status_manage.status2,
					remarks: remarks,
					nc_status_history: nc_status,
				})
				.fetch();
			if (loanreqUpdate) {
				return res.ok({
					status: "ok",
					statusCode: "NC200",
					message: "Case sent for rework",
					data: {}
				});
			}
			return res.send({
				status: "nok",
				message: 'Unable to Initiate'
			});
		}

		if (!status || status != "Done") {
			return res.badRequest(sails.config.res.wrongStatus);
		}

		const ncStatus = sails.config.nc_status;
		let datetime = await sails.helpers.dateTime();
		let status_history = {},
			remarks = {};
		LoanrequestRd.findOne({loan_ref_id: case_id})
			.populate("loan_document")
			.then(async (loanData) => {
				if (!loanData) {
					sails.config.res.invalidCaseOrData.exception = "Please check the case id";
					throw new Error("invalidCaseOrData");
				}
				if (loanData.white_label_id != sails.config.crisil_white_label_id &&
					loanData.loan_document.length === 0) {
					return res.badRequest(sails.config.res.uploadCaseDocumentPending);
				}

				if (loanData.nc_status_history) {
					parseData = JSON.parse(loanData.nc_status_history);
					if (Object.keys(parseData).length > 0) {
						status_history = parseData;
					}
				}
				let obj = {
					document_upload: status,
				};
				data = {
					userid: req.user.id,
					loan_status_id: loanData.loan_status_id,
					loan_sub_status_id: loanData.loan_sub_status_id,
					document_initiate_status: status,
					initiated_by: req.user.name
				};
				if (comments) {
					data.type = "Comments";
					data.message = comments;
				}
				datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
				if (!loanData.remarks) {
					remarks[datetime] = data;
					remarks = JSON.stringify(remarks);
				} else {
					let jsonRemarks = JSON.parse(loanData.remarks);
					jsonRemarks[datetime] = data;
					remarks = JSON.stringify(jsonRemarks);
				}
				obj.loanrequestcol = product_initiate_type ? product_initiate_type : null;
				obj.remarks = remarks;
				if ((loanData.loan_usage_type == sails.config.loan_usage_type_id &&
					sails.config.muthoot_white_label_id.includes(Number(loanData.white_label_id))) || (product_initiate_type && product_initiate_type == "non_cam")) {
					const reqData = {
						white_label_id: loanData.white_label_id,
						business_id: loanData.business_id,
						loan_id: loanData.id
					};
					method = "POST";
					url = sails.config.docUpload.auto_credit_assign_url;
					let apiTrigger = await sails.helpers.sailstrigger(url, JSON.stringify(reqData), "", method);
					try {
						apiTrigger = JSON.parse(apiTrigger);
					} catch {
						apiTrigger = null;
					}
					if (apiTrigger.status == "nok" || apiTrigger.error == 5) {
						return res.badRequest(apiTrigger);
					} else {
						await Loanrequest.update({id: loanData.id})
							.set(obj);
						return res.ok({
							status: "ok",
							statusCode: "NC200",
							message: "Case Initiated for Processing",
							data: {}
						});
					}
				} else {
					if (
						sails.config.muthoot_white_label_id.includes(Number(loanData.white_label_id)) &&
						loanData.loan_status_id == ncStatus.status9 &&
						loanData.loan_sub_status_id == null
					) {
						obj.loan_status_id = ncStatus.status1;
						obj.loan_sub_status_id = ncStatus.status2;
						const nc_status = await NcStatusManage.find({
							status1: ncStatus.status1,
							status2: ncStatus.status2,
							white_label_id: loanData.white_label_id
						}).select("name");
						report_tat = await sails.helpers.reportTat(req.user.id, req.user.name, loanData.id, nc_status[0].name, "Application", comments);
					}
					status_history[datetime] = data;
					obj.nc_status_history = JSON.stringify(status_history);
					let message;
					if (
						loanData.loan_origin == "onboarding" ||
						loanData.loan_origin.split("_")[0] == "onboarding"
					) {
						message = "Case Initiated for Processing";
					} else {
						message = "Document Upload for this case is completed";
					}
					if (
						loanData.loan_status_id == ncStatus.status2 &&
						loanData.loan_sub_status_id == ncStatus.status6 &&
						loanData.remarks_val
					) {
						const url = sails.config.case_api.case_moved_to_previous_status,
							method = "POST",
							body = {
								case_id: loanData.loan_ref_id,
								comment: comments
							},
							header = {
								Authorization: req.headers.authorization
							},
							caseMovedToPrevState = await sails.helpers.sailstrigger(
								url,
								JSON.stringify(body),
								header,
								method
							);
						parseData = caseMovedToPrevState.status != "nok" ? JSON.parse(caseMovedToPrevState) : {};
						if (parseData.status == "ok") {
							await Loanrequest.update({id: loanData.id}).set({
								remarks: remarks,
								document_upload: status
							});
							const data = _.pick(parseData.data[0], "loan_ref_id", "document_upload");
							return res.ok({
								status: "ok",
								DES_CODE: "NC08",
								message: message,
								data: data
							});
						}
					} else {
						return Loanrequest.update({id: loanData.id})
							.set(obj)
							.fetch()
							.then(async (updatedLoan) => {
								if (updatedLoan.length === 0) {
									throw new Error("errorFetchingData");
								}
								const data = _.pick(updatedLoan[0], "loan_ref_id", "document_upload");
								if (loanData.white_label_id == sails.config.fedfina_whitelabel_id) {
									const encryptData = await sails.helpers.crypto.with({
										action: "aesCbc256Encrypt",
										data: {
											status: "ok",
											DES_CODE: "NC08",
											message: message,
											data: data
										}
									});
									return res.ok({ecryptesResponse: encryptData});
								} else
									return res.ok({
										status: "ok",
										DES_CODE: "NC08",
										message: message,
										data: data
									});
							});
					}
				}
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);
					case "errorFetchingData":
						return res.badRequest(sails.config.res.errorFetchingData);
					default:
						throw err;
				}
			});
	},
	/**
	* @description ::  Legal Report upload
	* @api {post} /legalReport Legal Report Upload
	* @apiName Legal Report Upload
	* @apiGroup Case
	* @apiExample Example usage:
	* curl -i http://localhost:1337/legalReport

	*@apiParam {String} case_id case reference id.
	*@apiParam {File}  document

	*@apiSuccess {String} status ok.
	*@apiSuccess {String} message Document uploaded successfully.
	*@apiSuccess {String} DES_CODE NC08
	*@apiSuccess {Object} data
	*@apiSuccess {String} data.loan_ref_id case id.
	*@apiSucess {String} data.uploaded_doc_name document upload status.
	*@apiSucess {String} data.doc_id
	*/

	legalReportUpload: async function (req, res) {
		const {case_id: loan_ref_id} = req.body.allParams;

		const params = req.allParams();
		const fields = ["loan_ref_id"];
		const missing = await reqParams.fn(params, fields);

		if (!loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loan_details = await LoanrequestRd.findOne({loan_ref_id});
		if (!loan_details) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}

		let {s3_name, s3_region} =
			(await WhiteLabelSolutionRd.find({id: loan_details.white_label_id}).limit(1))[0] || {};
		if (!sails.config.azure.isActive) {
			s3_name = `${s3_name}/users_${req.user["id"]}`;
		}
		const document = req.file("document"),
			uploadFile = await sails.helpers.s3Upload(document, s3_name, s3_region);
		if (!document || !uploadFile || uploadFile.length === 0) {
			// comment error. you have not* Comments should consider translation
			sails.config.res.caseWhiteLableIdMismatch.message = "you have not selected the file for upload";
			return res.badRequest(sails.config.res.caseWhiteLableIdMismatch);
		}
		const doc_upload = await LoanDocument.create({
			loan: loan_details.id,
			business_id: loan_details.business_id,
			user_id: req.user.id,
			doctype: sails.config.docUpload.uploadId,
			doc_name: uploadFile[0].fd,
			uploaded_doc_name: uploadFile[0].filename,
			upload_method_type: sails.config.loanOrigin.loan_origin,
			ints: await sails.helpers.dateTime(),
			on_upd: await sails.helpers.dateTime(),
			uploaded_by: req.user.id
		}).fetch(),
			uploadedfile = {
				case_id: loan_ref_id,
				uploaded_doc_name: doc_upload.uploaded_doc_name,
				doc_id: doc_upload.doc_name
			};
		sails.config.successRes.documentUploaded.data = uploadedfile;
		return res.send(sails.config.successRes.documentUploaded);
	},
	/**
		  * @description ::  icici doc upload
		  * @api {post} /iciciDocUpload icici doc upload
		* @apiName icici doc upload
		  * @apiGroup ICICI Case
		  * @apiExample Example usage:
		  * curl -i http://localhost:1337/iciciDocUpload

		  *@apiParam {String} case_id case reference id.
		  * @apiParam upload_document
		  * @apiDescription upload_document
		 * [
		{
			"doc_type_id": "1",
			"upload_doc_name":"testa",
			"document_key":"test1",
			"size": file size(optional)

		},
		{
			"doc_type_id": "1",
			"upload_doc_name":"testb",
			"document_key":"test2",
			"size" : file size(optional)
		}]
	* @apiParam {Number} count
	* @apiParam {String} application_no

	  * @apiSuccess {String} status ok.
	  * @apiSuccess {String} message Uploaded Successfully.
	   */
	icici_IDisburse_upload: async function (req, res) {
		const {case_id, upload_document, count, application_no} = req.allParams(),
			datetime = await sails.helpers.dateTime();

		let params = req.allParams();
		let fields = ["count", "upload_document"];
		let missing = await reqParams.fn(params, fields);

		if (!count || !upload_document || upload_document.length == 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		fields = ["case_id"];
		missing = await reqParams.fn(params, fields);

		whereCondition = {};
		if (case_id) {
			whereCondition.loan_ref_id = case_id;
		} else if (application_no) {
			whereCondition.application_ref = application_no;
		} else {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne(whereCondition);
		if (!loanData) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		const {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({id: loanData.white_label_id});

		loanDoc_array = [];
		await Promise.all(
			upload_document.map(async (arrayItem) => {
				params = arrayItem;
				fields = ["doc_type_id", "upload_doc_name", "document_key"];
				missing = await reqParams.fn(params, fields);

				if (!arrayItem.doc_type_id || !arrayItem.upload_doc_name || !arrayItem.document_key) {
					sails.config.res.missingFields.mandatoryFields = missing;
					return res.badRequest(sails.config.res.missingFields);
				}

				await LoanDocumentRd.find({
					business_id: parseInt(loanData.business_id),
					loan: parseInt(loanData.id),
					doctype: parseInt(arrayItem.doc_type_id),
					uploaded_doc_name: arrayItem.upload_doc_name,
					size: arrayItem.size
				}).then(async (loanDocData) => {
					if (loanDocData.length > 0) {
						const updateLoanDOc = await LoanDocument.update({id: loanDocData[0].id})
							.set({
								doctype: arrayItem.doc_type_id,
								doc_name: arrayItem.document_key,
								uploaded_doc_name: arrayItem.upload_doc_name,
								original_doc_name: arrayItem.upload_doc_name,
								size: arrayItem.size
							})
							.fetch();
						loanDoc_array.push(updateLoanDOc);
					} else {
						data = {
							user_id: loanData.createdUserId,
							business_id: loanData.business_id,
							loan: loanData.id,
							doctype: arrayItem.doc_type_id,
							doc_name: arrayItem.document_key,
							uploaded_doc_name: arrayItem.upload_doc_name,
							original_doc_name: arrayItem.upload_doc_name,
							status: "active",
							upload_method_type: sails.config.loanOrigin.loan_origin1,
							size: arrayItem.size,
							ints: datetime,
							on_upd: datetime,
							uploaded_by: arrayItem.uploaded_by ? arrayItem.uploaded_by : loanData.createdUserId
						};
						const createdLoanDocRecord = await LoanDocument.create(data).fetch();
						await LoanDocumentDetails.create({
							doc_id: createdLoanDocRecord.id,
							ints: datetime,
							loan_id: loanData.id,
							did: arrayItem.directorId || 0
						});
						message = {
							loan_id: loanData.id,
							business_id: loanData.business_id,
							director_id: arrayItem.directorId,
							doc_id: createdLoanDocRecord.id,
							parent_doc_id: "",
							doc_type: arrayItem.doc_type_id,
							user_id: loanData.createdUserId,
							doc_name: arrayItem.document_key,
							uploaded_doc_name: arrayItem.upload_doc_name,
							original_doc_name: arrayItem.upload_doc_name,
							s3bucket: s3_name,
							region: s3_region,
							cloud: "aws",
							white_label_id: loanData.white_label_id,
							isLoanDocument: true
						};
						await sails.helpers.insertIntoQ("generic-q", message);
						loanDoc_array.push(createdLoanDocRecord);
					}
				});
			})
		);
		const docCount = await LoanDocumentRd.find({loan: loanData.id}).select([
			"doctype",
			"doc_name",
			"uploaded_doc_name",
			"size"
		]);
		// if (count == upload_document.length) {
		if (count == docCount.length) {
			const updateLoanData = await Loanrequest.update({loan_ref_id: loanData.loan_ref_id}).set({
				document_upload: "Done"
			});
		}

		sails.config.successRes.documentUploaded.data = {
			upload_document: docCount,
			case_id: loanData.loan_ref_id,
			count
		};

		if (loanDoc_array.length > 0) {
			return res.ok(sails.config.successRes.documentUploaded);
		}
	},

	loanDocUpdate: async function (req, res) {
		const {loanId, doc_id, doc_name, uploaded_doc_name, doctype} = req.allParams();

		const params = req.allParams();
		const fields = ["loanId", "doc_id"];
		const missing = await reqParams.fn(params, fields);

		if (!loanId || !doc_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		await LoanDocument.findOne({id: doc_id, loan: loanId}).then(async (loandoc) => {
			if (!loandoc) {
				return res.badRequest({status: "nok", message: sails.config.msgConstants.uploadFailed});
			}

			if (doc_name || uploaded_doc_name || doctype) {
				UpdateData = {
					doc_name: doc_name || loandoc.doc_name,
					uploaded_doc_name: uploaded_doc_name || loandoc.uploaded_doc_name,
					doctype: doctype || loandoc.doctype
				};
				const updateData = await LoanDocument.update({id: loandoc.id, loan: loanId}).set(UpdateData).fetch();

				return res.ok({status: "ok", message: sails.config.msgConstants.successfulUpdation, data: updateData});
			}
		});
	},

	equifax_cron: async function (req, res) {
		const white_label_id = sails.config.equifax.cub_white_label_id;
		whiteLabel = await WhiteLabelSolution.findOne({id: white_label_id});
		minutes = new Date();
		minutes.setMinutes(minutes.getMinutes() - 30);
		loan_details = await LoanrequestRd.find({
			white_label_id: white_label_id,
			RequestDate: {">=": minutes}
		}).populate("business_id");
		documentArray = [];
		if (loan_details.length > 0) {
			Promise.all(
				loan_details.map(async (element) => {
					const dirData = await DirectorRd.find({business: element.business_id.id});
					if (dirData.length > 0) {
						dirData.map(async (dirElement) => {
							// if(dirElement.dcibil_score && dirElement.dcibil_score != 0){
							if (
								(!dirElement.dcibil_score || dirElement.dcibil_score != 0) &&
								dirElement.dfirstname &&
								dirElement.dlastname &&
								dirElement.address1 &&
								dirElement.city &&
								dirElement.state &&
								dirElement.pincode &&
								dirElement.dpancard &&
								dirElement.ddob &&
								dirElement.dcontact
							) {
								const body = {
									requestFrom: "CUB",
									firstName: dirElement.dfirstname,
									lastName: dirElement.dlastname,
									inquiryAddresses: {
										addressLine: dirElement.address1 + " " + dirElement.address2,
										city: dirElement.city,
										state: dirElement.state,
										postal: dirElement.pincode
									},
									dob: dirElement.ddob,
									panNumber: dirElement.dpancard,
									InquiryPhones: [
										{
											number: dirElement.dcontact,
											phoneType: "M"
										}
									]
								},
									userId = element.business_id.userid,
									bucket = whiteLabel.s3_name;
								datetime = await sails.helpers.dateTime();
								console.log("----------------------", body);
								try {
									equifax = await sails.helpers.equifax(body, userId, bucket);
									console.log(equifax);
									insert_dir_data.dcibil_score = equifax.cibilScore;
									const createEquifaxDocData = await LoanDocument.create({
										loan: id,
										business_id: business_id,
										user_id: userId,
										doctype: 236,
										doc_name: equifax.uploadDoc.key,
										uploaded_doc_name: equifax.uploadDoc.key,
										ints: datetime,
										on_upd: datetime
									}).fetch();
									documentArray.push(createEquifaxDocData);
								} catch (err) { }
							}
							// }
						});
					}
				})
			);
			return res.ok({
				status: "ok",
				message: "data updated successfully",
				data: documentArray
			});
		} else {
			return res.ok({
				status: "nok",
				message: "No data found"
			});
		}
	},

	add_loan_doc_details: async function (req, res) {
		let {loan_id, director_id, data} = req.allParams();

		const params = req.allParams();
		const fields = ["loan_id", "director_id", "data"];
		const missing = await reqParams.fn(params, fields);
		if (!loan_id || !director_id || !data || data.loan_document_details.length === 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const datetime = await sails.helpers.dateTime();
		let resData = [],
			message;
		for (let i in data.loan_document_details) {
			let {doc_id} = data.loan_document_details[i];
			if (!doc_id) {
				return res.badRequest(sails.config.res.missingFields);
			}
			objData = {
				...data.loan_document_details[i],
				loan_id,
				did: director_id
			};
			if (data.loan_document_details[i].id) {
				let documentFetchData = await LoanDocumentDetailsRd.findOne({id: data.loan_document_details[i].id});
				if (documentFetchData) {
					objData.upts = datetime;
					let documentUpdateData = await LoanDocumentDetails.update({id: data.loan_document_details[i].id})
						.set(objData)
						.fetch();
					resData.push(documentUpdateData[0]);
					message = sails.config.successRes.dataUpdated;
				}
			} else {
				objData.ints = datetime;
				let documentCreatedData = await LoanDocumentDetails.create(objData).fetch();
				resData.push(documentCreatedData);
				message = sails.config.successRes.dataInserted;
			}
		}
		return res.ok({
			status: "ok",
			message,
			data: resData
		});
	},
	UploadImageTag: async function (req, res) {
		let params = ({id, directorId} = req.allParams("id", "directorId"));
		let fields = ["id", "directorId"];
		let missing = await reqParams.fn(params, fields);

		if (!id || !directorId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let lenderDocument_data = await LenderDocumentRd.find({id: id});

		if (lenderDocument_data.length > 0) {
			const update_lenderDocument_data = await LenderDocument.update({id}).set({directorId}).fetch();
			return res.send({
				status: "ok",
				data: update_lenderDocument_data
			});
		} else {
			return res.send({
				status: "nok",
				message: " the document id does not exist "
			});
		}
	},

	case_validation: async function (req, res) {
		const loanRefId = req.param("case_id");
		const cta = req.param("cta");

		const fields = ["case_id"];
		const params = req.allParams();
		const missing = await reqParams.fn(params, fields);

		if (!loanRefId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let result;
		switch (cta) {
			case "initiate":
				{
					const {id: loanId, loan_product_id: loanProductId} = await LoanrequestRd.findOne({
						loan_ref_id: loanRefId
					}).select(["loan_product_id"]);

					result = await sails.helpers.caseValidation(loanId, loanProductId, "initiate", req.user.id, req?.headers?.authorization);

					res.send(result);
				}
				break;
			case "add_sanction": {
				const {id: loanId, loan_product_id: loanProductId} = await LoanrequestRd.findOne({
					loan_ref_id: loanRefId
				}).select(["loan_product_id"]);

				result = await sails.helpers.sanctionValidation(loanId, loanProductId);

				res.send(result);
			}
				break;
			case "give_offer": {
				const {id: loanId, loan_product_id: loanProductId} = await LoanrequestRd.findOne({
					loan_ref_id: loanRefId
				}).select(["loan_product_id"]);
				result = await sails.helpers.caseValidation(loanId, loanProductId, "give_offer", req.user.id, req?.headers?.authorization);
				res.send(result);
			}
				break;
			case "external": {
				const {id: loanId, loan_product_id: loanProductId} = await LoanrequestRd.findOne({
					loan_ref_id: loanRefId
				}).select(["loan_product_id"]);
				result = await sails.helpers.caseValidation(loanId, loanProductId, "external", req.user.id, req?.headers?.authorization);
				res.send(result);
			}
				break;
			default:
				res.status(400).send({
					status: "nok",
					message: "invalid cta name"
				});
		}
	},
	sanction_letter_regenerate: async function (req, res) {
		const {loan_id, loan_bank_mapping_id} = req.allParams();
		if (!loan_id || !loan_bank_mapping_id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		let inactivateDocument = true;

		const sanction_letter_doc_type = sails.config.sanction_letter_doc_type,
			lenderDocFetch = await LenderDocumentRd.find({
				loan_bank_mapping: loan_bank_mapping_id,
				loan: loan_id,
				doc_type: [sanction_letter_doc_type, sails.config.kfs_doc_type],
				status: "active"
			});

		const loanReqData = await LoanrequestRd.findOne({id: loan_id}).select("white_label_id");
		sanctionLetter = lenderDocFetch.filter(item => item.doc_type == sanction_letter_doc_type);
		if (sanctionLetter.length === 0) {
			return res.ok({
				status: "nok",
				message: "No sanction letter found for this loan."
			});
		}

		if (sanctionLetter[0]?.id && loanReqData?.white_label_id == sails.config.muthootDetails.whiteLableId) {
			inactivateDocument = false;
			const documentDetailsData = await LoanDocumentDetailsRd.findOne({doc_id: sanctionLetter[0].id}).select("emudra_status");
			if (documentDetailsData?.emudra_status == "Pending" ||
				documentDetailsData?.emudra_status == "Withdrawn" ||
				documentDetailsData?.emudra_status == null) inactivateDocument = true;
		}
		lenderDocIds = lenderDocFetch.map(item => item.id);
		if (inactivateDocument) {
			await LenderDocument.update({id: lenderDocIds})
				.set({
					status: "inactive"
				});
		} else {
			return res.ok({
				status: "ok",
				message: "Document can't be regenrated now as it's initiated for signing. Either withdraw the signature initiation or complete the signing first to regenearte the document."
			});
		}
		return res.ok({
			status: "ok",
			message: "Document is being re-generated. Please check after sometime."
		});
	},


	generic_document_regenerate: async function (req, res) {

		try {
			const {loan_id, doc_type_id, doc_type, doc_details_id} = req.allParams();
			const TIMEOUT_FOR_MERGED_DOC_REGEN = 1000 * 60 * 4;
			const WAIT_TIME_TO_REGENERATE_PDF = 1000 * 3;

			if (!loan_id || !doc_type_id || !doc_type || !doc_details_id) {
				return res.badRequest(sails.config.res.missingFields);
			}

			const loanRequestData = await LoanrequestRd.findOne({
				id: loan_id
			}).select(["loan_ref_id", "white_label_id"]);
			if (!loanRequestData.loan_ref_id) throw new Error("missing loan ref id");

			let docDetails, docDetailsData;

			docDetailsData = await LoanDocumentDetailsRd
				.findOne({id: doc_details_id})
				.select(["emudra_status"]);

			let makeDocumentIanctive = (docDetailsData?.emudra_status == "Pending" ||
				docDetailsData?.emudra_status == "Withdrawn" ||
				docDetailsData?.emudra_status == null) ? true : false;

			const whiteLabelId = loanRequestData?.white_label_id;
			const whiteLabelSolution = await WhiteLabelSolution.findOne({id: whiteLabelId}).select(["s3_name", "s3_region", "mandatory_field"]);

			if (!whiteLabelSolution || !whiteLabelSolution?.s3_name || !whiteLabelSolution?.s3_region || !whiteLabelSolution?.mandatory_field) throw new Error("Missing white_label_solution data");

			const emudraConfig = JSON.parse(whiteLabelSolution?.mandatory_field)?.e_mudra;

			if (!emudraConfig) throw new Error("Missing configuration for EMudra");

			const configCheck = await sails.helpers.validateEmudraConfig(req?.user?.id, loan_id, emudraConfig);
			if (!configCheck?.status) throw new Error(configCheck?.message || "Validation Failed");

			if (makeDocumentIanctive) {
				if (doc_type == "loan") {
					docDetails = await LoanDocumentRd.find({
						loan: loan_id,
						doctype: doc_type_id,
						status: 'active'
					});

					if (docDetails[0]?.id) {
						const signedDocData = await LenderDocumentRd.findOne({
							loan: loan_id,
							doc_type: emudraConfig.unsignedSignedDocumentMapping[doc_type_id],
							status: 'active',
							uploaded_by: 0
						});
						const unsignedDocData = await LoanDocumentRd.find({
							loan: loan_id,
							doctype: doc_type_id,
							status: 'active',
							uploaded_by: 0
						}).sort("id desc").limit(1);

						if (!unsignedDocData || !unsignedDocData[0]) throw new Error("Missing Document");
						if (signedDocData && signedDocData.on_upd > unsignedDocData[0].on_upd) {
							await LoanDocumentDetails.updateOne({id: doc_details_id}).set({emudra_track: signedDocData})
						} else {
							await LoanDocumentDetails.updateOne({id: doc_details_id}).set({emudra_track: unsignedDocData[0]})
						}

						let url = `${emudraConfig.url.applicationPdfJson}?loan_ref_id=${loanRequestData.loan_ref_id}&retrigger=yes`,
							method = 'GET',
							headers = {},
							options = {
								url,
								method,
								headers
							};
						const regenerateJSON = await axios(options);
						if (regenerateJSON?.data?.status != "ok") throw new Error("Failed to regenerate the JSON");

						await new Promise(resolve => setTimeout(resolve, WAIT_TIME_TO_REGENERATE_PDF));

						url = `${emudraConfig.url.applicationPdf}?loan_ref_id=${loanRequestData.loan_ref_id}`;
						options.url = url;
						const regeneratePDF = await axios(options);

						if (!regeneratePDF?.data?.status) throw new Error("Failed to regenerate PDF");

					}

				} else if (doc_type == "lender") {
					docDetails = await LenderDocumentRd.find({
						loan: loan_id,
						doc_type: doc_type_id,
						status: 'active'
					});

					if (docDetails[0]?.id) {
						const signedDocData = await LenderDocumentRd.findOne({
							loan: loan_id,
							doc_type: emudraConfig.unsignedSignedDocumentMapping[doc_type_id],
							status: 'active',
							uploaded_by: 0
						});
						const unsignedDocData = await LenderDocumentRd.find({
							loan: loan_id,
							doc_type: doc_type_id,
							status: 'active',
							uploaded_by: 1
						}).sort("id desc").limit(1);

						if (!unsignedDocData || !unsignedDocData[0]) throw new Error("Missing Document")

						if (signedDocData && signedDocData.on_upd > unsignedDocData[0].on_upd) {
							await LoanDocumentDetails.updateOne({id: doc_details_id}).set({emudra_track: signedDocData})
						} else {
							await LoanDocumentDetails.updateOne({id: doc_details_id}).set({emudra_track: unsignedDocData[0]})
						}
						await LenderDocument.updateOne({id: docDetails[0].id})
							.set({status: "inactive"})
					}
				}
			} else {
				return res.ok({
					status: "ok",
					message: "Document can't be regenrated now as it's initiated for signing. Either withdraw the signature initiation or complete the signing first to regenearte the document."
				});
			}

			if (!docDetails?.[0]?.id) {
				return res.ok({
					status: "nok",
					message: "No such document found for this loan."
				});
			}

			res.ok({
				status: "ok",
				message: "Document is being re-generated. Please check after sometime."
			});


		} catch (error) {

			return res.send({
				status: "nok",
				message: error.message || "Failed to regenerate document"
			})

		}


	}
};

function validateDocUpload(mandatoryDocTypeIds, lenderDocs) {
	const docsMap = new Map();

	mandatoryDocTypeIds.forEach((curId) => {
		docsMap.set(curId, false);
	});

	lenderDocs.forEach((curDoc) => {
		if (!(docsMap.get(curDoc.doc_type) == undefined)) docsMap.set(curDoc.doc_type, true);
	});

	let flag = true;

	for (let i = 0; i < mandatoryDocTypeIds.length; i++) {
		if (!docsMap.get(mandatoryDocTypeIds[i])) {
			flag = false;
			break;
		}
	}

	return flag;
}
