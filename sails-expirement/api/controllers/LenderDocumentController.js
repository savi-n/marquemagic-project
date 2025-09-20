const reqParams = require("../helpers/req-params");
const axios = require("axios");
// const moment = require("moment");

module.exports = {
	/**
* @api {POST} /lenderdoc-upload Lender Document Upload
* @apiName Lender Document Upload
* @apiDescription Request for Lender Document Upload as JSON body
* @apiGroup Bank
* @apiExample {json} JSON sample structure:
{
  "upload_document": [
	{
	  "loan_bank_mapping_id": 1,
	  "doc_type_id": "1",
	  "upload_doc_name": "testa",
	  "document_key": "test1"
	},
	{
	  "loan_bank_mapping_id": 1,
	  "doc_type_id": "1",
	  "upload_doc_name": "testb",
	  "document_key": "test2"
	}
  ]
}
 * @apiSuccess {String} status ok.
 * @apiSuccess {String} message Uploaded Successfully.
 **/
	uploaddocument: async function (req, res) {
		const datetime = await sails.helpers.dateTime(),
			post_data = req.allParams(),
			docFormatJSON = post_data.upload_document,
			validObj = ["doc_type_id", "document_key", "loan_bank_mapping_id", "upload_doc_name"],
			validate = (obj, props) => props.every((prop) => obj.hasOwnProperty(prop));
		const qMessages = [];
		docFormatJSON.map((obj) => {
			if (!validate(obj, validObj) && !obj.Active) {
				return res.badRequest(sails.config.res.missingFields);
			}
		});
		await Promise.all(
			docFormatJSON.map(async (arrayItem) => {
				const loan_bank_mapping_id = arrayItem.loan_bank_mapping_id,
					doc_type_id = arrayItem.doc_type_id,
					upload_doc_name = arrayItem.upload_doc_name,
					document_key = arrayItem.document_key,
					size_of_file = arrayItem.size,
					loanId = arrayItem.loan_id;
				let bankMappingDetails = {};
				if (loan_bank_mapping_id != 1) {
					bankMappingDetails = await LoanBankMappingRd.findOne({
						where: {
							id: loan_bank_mapping_id
						},
						select: ["loan_id", "business"]
					});
				}
				loan_id = bankMappingDetails && bankMappingDetails.loan_id ? bankMappingDetails.loan_id : loanId;
				loanData = await LoanrequestRd.findOne({id: loan_id});
				const whitelabelsolution = await WhiteLabelSolutionRd.findOne({
					id: loanData.white_label_id
				}).select(["s3_name", "s3_region"]);
				if (post_data && post_data.section_id) {
					trackData = await sails.helpers.onboardingDataTrack(
						loan_id,
						loanData.business_id,
						"",
						req.user.id,
						post_data.section_id, ""
					);
				}
				if ((bankMappingDetails && bankMappingDetails.business) || (loanData && loanData.business_id)) {
					business_id = (bankMappingDetails && bankMappingDetails.business) || loanData.business_id;
					const getUserDetails = await BusinessRd.findOne({
						where: {
							id: business_id
						},
						select: ["userid"]
					}),
						business_user_id = getUserDetails.userid ? getUserDetails.userid : "";
					dirData = await DirectorRd.find({business: business_id, isApplicant: 1});
					let dirId = arrayItem.directorId ? arrayItem.directorId : dirData.length > 0 ? dirData[0].id : 0;
					if (business_user_id && loan_id) {
						const data = {
							loan_bank_mapping: loan_bank_mapping_id,
							user_id: business_user_id,
							loan: loan_id,
							doc_type: doc_type_id,
							doc_name: document_key,
							uploaded_doc_name: upload_doc_name,
							original_doc_name: upload_doc_name,
							status: "active",
							size_of_file: size_of_file,
							ints: datetime,
							on_upd: datetime,
							uploaded_by: arrayItem.uploaded_by ? arrayItem.uploaded_by : req.user.id,
							directorId: dirId,
							uploaded_doc_ref_id: arrayItem.uploaded_doc_ref_id
						},
							lenderDocData = await LenderDocumentRd.find({loan: loan_id, directorId: dirId, doc_type: sails.config.additional_verificattion_report}).select("id");
						if (lenderDocData.length > 0) {
							await LenderDocument.update({
								loan: loan_id,
								doc_type: sails.config.additional_verificattion_report
							})
								.set({status: "inactive"});
						}
						const createdLenderDocRecord = await LenderDocument.create(data).fetch();
						if (createdLenderDocRecord) {
							await LoanDocumentDetails.create({
								doc_id: createdLenderDocRecord.id,
								ints: datetime,
								loan_id,
								did: arrayItem.directorId || 0,
								doc_request_type: "lender"
							});
							const message = {
								loan_id,
								business_id: business_id,
								director_id: dirId,
								doc_id: createdLenderDocRecord.id,
								parent_doc_id: "",
								doc_type: doc_type_id,
								user_id: business_user_id,
								doc_name: document_key,
								uploaded_doc_name: upload_doc_name,
								original_doc_name: upload_doc_name,
								s3bucket: whitelabelsolution.s3_name,
								region: whitelabelsolution.s3_region,
								cloud: "aws",
								white_label_id: loanData.white_label_id,
								isLoanDocument: false
							};
							qMessages.push(message);
						}
						//resdata.push(createdLenderDocRecord);
						await sails.helpers.logtrackservice(
							req,
							"lenderdoc-upload",
							createdLenderDocRecord.id,
							"lender_document"
						);
					}
				}
			})
		);
		console.log(qMessages);
		await sails.helpers.insertIntoQ(sails.config.qNames.GENERIC_Q, qMessages);

		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.uploadSuccess
		});
	},

	/**
	 * @api {post} /lenderDocumentDelete/ lender document delete
	 * @apiName lender document delete
	 * @apiDescription lender document delete
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/lenderDocumentDelete/
	 *@apiParam {Number} lender_doc_id document id.
	 *@apiParam {Number} loan_bank_mapping_id business id.
	 *@apiParam {Number} loan_id loan id.
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Document deleted successfully.
	 */

	lenderDocumentDelete: async function (req, res) {
		const {lender_doc_id, loan_bank_mapping_id, loan_id, user_id} = req.allParams();

		const params = req.allParams();
		const fields = ["lender_doc_id", "loan_bank_mapping_id", "loan_id"];
		const missing = await reqParams.fn(params, fields);

		if (!lender_doc_id || !loan_bank_mapping_id || !loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		userId = user_id || req.user.id;
		document = await LenderDocumentRd.findOne({
			id: lender_doc_id,
			loan_bank_mapping: loan_bank_mapping_id,
			loan: loan_id,
			user_id: userId
		});
		if (document) {
			await LenderDocument.update({id: document.id}).set({status: "deleted"}).fetch();
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.successfulDeletion
			});
		} else {
			return res.badRequest({status: "nok", message: sails.config.msgConstants.invalidDocument});
		}
	},

	otherUserDocUpload: async function (req, res) {
		const datetime = await sails.helpers.dateTime(),
			post_data = req.allParams(),
			docFormatJSON = post_data.upload_document,
			validObj = ["doc_type_id", "document_key", "loan_id", "upload_doc_name"],
			validate = (obj, props) => props.every((prop) => obj.hasOwnProperty(prop));
		docFormatJSON.map((obj) => {
			if (!validate(obj, validObj) && !obj.Active) {
				return res.badRequest(sails.config.res.missingFields);
			}
		});
		await Promise.all(
			docFormatJSON.map(async (arrayItem) => {
				const loan_id = arrayItem.loan_id,
					doc_type_id = arrayItem.doc_type_id,
					upload_doc_name = arrayItem.upload_doc_name,
					document_key = arrayItem.document_key,
					size_of_file = arrayItem.size,
					loanDetails = await LoanrequestRd.findOne({id: loan_id});
				if (!loanDetails) {
					return res.badRequest(sails.config.msgConstants.invalidLoanId);
				}
				const getUserDetails = await BusinessRd.findOne({
					where: {
						id: loanDetails.business_id
					},
					select: ["userid"]
				}),
					business_user_id = getUserDetails.userid ? getUserDetails.userid : "";
				if (business_user_id && loan_id) {
					const data = {
						ref_id: arrayItem.evaluationId || null,
						loan_bank_mapping: 1,
						user_id: business_user_id,
						loan: loan_id,
						doc_type: doc_type_id,
						doc_name: document_key,
						uploaded_doc_name: upload_doc_name,
						original_doc_name: upload_doc_name,
						status: "active",
						size_of_file: size_of_file,
						ints: datetime,
						on_upd: datetime,
						uploaded_by: arrayItem.uploaded_by ? arrayItem.uploaded_by : 0
					},
						createdLenderDocRecord = await LenderDocument.create(data).fetch();
				}
			})
		);
		return res.ok({status: "ok", message: sails.config.msgConstants.uploadSuccess});
	},
	editedDocumentSave: async function (req, res) {
		let {request_type, doc_id, loan_id, loan_bank_mapping_id, uploaded_file_details, fileName, userid, doc_type_id} = req.allParams();
		if (!request_type || !loan_id || Object.keys(uploaded_file_details).length == 0) {
			return res.badRequest(sails.config.res.missingFields);
		}
		let dataRes = [];
		const datetime = await sails.helpers.dateTime();
		if (request_type === "LOAN") {
			const loan_document_data = await LoanDocumentRd.findOne({id: doc_id, loan: loan_id});
			if (!loan_document_data) {
				return res.badRequest({
					status: "nok",
					message: "Invalid Loan ID or Doc ID."
				});
			}
			const update_loan_document_data = await LoanDocument.update({id: doc_id, loan: loan_id}).set({status: "inactive"}).fetch();
			if (update_loan_document_data.length > 0) {
				delete loan_document_data.id;
				const create_loan_document = await LoanDocument.create({
					loan: loan_id,
					business_id: loan_document_data.business_id,
					user_id: loan_document_data.user_id,
					doctype: loan_document_data.doctype,
					ints: datetime,
					on_upd: datetime,
					extracted_request_time: datetime,
					extract_request_status: "true",
					status: "active",
					size: uploaded_file_details.files[0].size,
					doc_name: uploaded_file_details.files[0].fd,
					uploaded_doc_name: fileName || loan_document_data.uploaded_doc_name,
					uploaded_by: req.user.id,
					directorId: loan_document_data.directorId || 0
				}).fetch();
				dataRes.push(create_loan_document);
			}
		}
		if (request_type === "Lender") {
			let lender_document_data;
			if (doc_id) {
				lender_document_data = await LenderDocumentRd.findOne({id: doc_id, loan: loan_id});
				loan_bank_mapping_id = lender_document_data.loan_bank_mapping;
				if (!lender_document_data) {
					return res.badRequest({
						status: "nok",
						message: "Invalid Loan ID or Doc ID."
					});
				}
				const update_lender_document_data = await LenderDocument.update({id: doc_id, loan: loan_id}).set({status: "inactive"}).fetch();
			}
			if ((doc_id && update_lender_document_data.length > 0) || !doc_id) {
				const create_lender_document = await LenderDocument.create({
					loan_bank_mapping: loan_bank_mapping_id || 1,
					user_id: userid,
					loan: loan_id,
					doc_type: doc_type_id,
					doc_name: uploaded_file_details.files[0].fd,
					uploaded_doc_name: fileName,
					original_doc_name: fileName,
					status: "active",
					size_of_file: uploaded_file_details.files[0].size,
					ints: datetime,
					on_upd: datetime,
					uploaded_by: req.user.id,
					directorId: 0
				}).fetch();
				dataRes.push(create_lender_document);
			}
		}
		return res.ok({
			status: "ok",
			message: "Document details are updated successfully.",
			data: dataRes
		});
	},
	token_for_file_download: async function (req, res) {
		const {ip, fileName} = req.allParams();
		let rep_fileName = fileName.replace(/ /g, "_");
		rep_fileName = ip + rep_fileName;
		// Specify the bucket name
		const bucketName = "70mzrwe";
		let data_file = [];
		// Fetch the list of objects (files) in the bucket
		await getObjectsWithEditorBin(bucketName, rep_fileName)
			.then(dataRes => {
				data_file = dataRes;
				console.log("Filtered and sorted data:", dataRes);
			})
			.catch(error => {
				console.error("Error fetching data:", error);
			});

		const datetime = await sails.helpers.dateTime();

		data11 = await generatePayload(datetime, data_file[0].file_name, fileName);

		api_url = `http://13.215.160.67/7.4.1-36/downloadas/${data_file[0].file_name}?cmd=${JSON.stringify(data11)}`;
		axios.post(api_url)
			.then(response => {
				if (response.status == 200) {
					return res.ok(response.data);
				} else {
					return res.ok(response.data);
				}
			})
			.catch(error => {
				if (error.response) {
					return res.ok(error.response);
				} else {
					return res.ok(error.message);
				}
			});

	},

	is_cam_generated: async function (req, res) {
		const {loan_id} = req.allParams();
		if (!loan_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const lenderDocData = await LenderDocumentRd.find({
			loan: loan_id,
			doc_type: sails.config.additional_verificattion_report,
			status: "active"
		})
		if (lenderDocData.length > 0) {
			return res.ok({
				status: "ok",
				message: "CAM is generated",
				cam_generated: true
			})
		}
		return res.ok({
			status: "nok",
			message: "CAM is not generated",
			cam_generated: false
		})

	}
};

function getObjectsWithEditorBin(bucketName, rep_fileName) {
	const AWS = require("aws-sdk");
	AWS.config.update({accessKeyId: sails.config.aws.key, secretAccessKey: sails.config.aws.secret, region: 'us-east-1'});
	// s3_name = "70mzrwe";
	path = "files/files";

	// Create an S3 instance
	const s3 = new AWS.S3();
	return new Promise((resolve, reject) => {
		s3.listObjectsV2({Bucket: bucketName}, (err, data) => {
			if (err) {
				reject(err);
			} else {
				const sortedObjects = data.Contents.sort((a, b) => b.LastModified - a.LastModified);
				const data_file = [];

				for (const o of sortedObjects) {
					if (o.Key.includes(rep_fileName) && o.Key.includes("Editor.bin") && o.Size > 0) {
						data_file.push({...o, file_name: o.Key.split("/")[2]});
					}
				}

				resolve(data_file);
			}
		});
	});
}

function generatePayload(datetime, s3_fine_name, original_file_name) {
	const date = moment(datetime);
	const newDate = moment(datetime).add(10, "minutes");
	const session_time = moment(datetime).add(30, "minutes");
	const jwt = require('jsonwebtoken');

	// Replace these with your own secret key and payload data
	const secretKey = 'fvOB73hxwtiSyOG1xcluZPYUX7qtVZ28';
	const payload = {
		"document": {
			"key": s3_fine_name,
			"permissions": {
				"chat": true,
				"comment": true,
				"copy": true,
				"download": true,
				"edit": true,
				"fillForms": true,
				"modifyContentControl": true,
				"modifyFilter": true,
				"print": true,
				"review": true,
				"reviewGroups": null,
				"commentGroups": {},
				"userInfoGroups": null,
				"protect": true
			}
		},
		"editorConfig": {
			"user": {
				"id": "uid-1",
				"name": "John Smith",
				"index": 3
			},
			"ds_view": false,
			"ds_isCloseCoAuthoring": false,
			"ds_sessionTimeConnect": session_time.valueOf()
		},
		"iat": date.valueOf(),
		"exp": newDate.valueOf()
	}


	function generateJwtToken(payload, secretKey) {
		const token1 = jwt.sign(payload, secretKey); // Token expires in 1 hour
		return token1;
	}

	const token = generateJwtToken(payload, secretKey);
	let cmd = {
		"c": "save",
		"id": s3_fine_name,
		"userid": "uid-1",
		"tokenSession": token,
		"outputformat": 65,
		"title": original_file_name,
		"nobase64": true,
		"lcid": 9,
		"savetype": 3,
		"saveindex": 1,
		"userconnectionid": "uid-13"
	};
	return (cmd);
}
