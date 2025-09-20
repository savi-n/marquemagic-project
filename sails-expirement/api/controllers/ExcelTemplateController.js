/**
 * ExcelTemplateController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const Excel = require("exceljs");
const AWS = require("aws-sdk");
const s3 = new AWS.S3({accessKeyId: sails.config.aws.key, secretAccessKey: sails.config.aws.secret});
const {v4: uuidv4} = require("uuid");
const moment = require("moment");
const reqParams = require("../helpers/req-params");
const axios = require("axios");
let FormData = require("form-data");
const fs = require("fs");
const md5 = require('md5');
// const s3 = new AWS.S3();

module.exports = {
	populate: async function (req, res) {
		const {loan_ref_id, doc_type_id, userid, loan_id} = req.allParams();

		const params = req.allParams();
		const fields = ["loan_ref_id", "doc_type_id", "userid"];
		const missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let lenderDocRecord = await LenderDocumentRd.find({loan: loan_id, doc_type: doc_type_id})
			.select(["doc_name"])
			.sort("id desc")
			.limit(1);

		let {aws_bucket_name, region, filepath} = await getAWSBucket(req, userid);

		let fileInfo;
		if (lenderDocRecord.length) {
			fileInfo = await checkFileExists(aws_bucket_name, `${filepath}/${lenderDocRecord[0].doc_name}`);
		}

		if (lenderDocRecord.length && fileInfo) {
			const presignedUrl = await sails.helpers.s3ViewDocument(
				lenderDocRecord[0].doc_name,
				`${aws_bucket_name}/${filepath}`,
				region
			);

			let zohourl = await getUrl(presignedUrl);
			let {document_url, document_id, download_url} = zohourl;

			return res.status(200).send({
				status: "ok",
				statusCode: "NC200",
				resCode: "SUCCESS",
				message: "Template link generted successfully",
				templateLink: presignedUrl,
				document_url,
				document_id,
				download_url
			});
		} else {
			try {
				let dataToPopulate = await fetchDataForExcel(loan_ref_id, doc_type_id);
				if (
					dataToPopulate.message === "LOAN_NOT_FOUND" ||
					dataToPopulate.message === "DOC_TYPE_NOT_FOUND" ||
					dataToPopulate.message === "TEMPLATE_NOT_FOUND"
				) {
					throw [404, dataToPopulate.message];
				}

				let {bucket, filepath, templatename} = dataToPopulate;

				if (!bucket || !filepath) throw [404, "TEMPLATE_NOT_FOUND"];

				let buffer = await sails.helpers.getBufferFromS3(bucket, sails.config.aws.region, "aws", filepath);
				let populatedBuffer;

				if (templatename !== "RCU Verification Report") {
					populatedBuffer = await excelBuffer(buffer, dataToPopulate, req.user, loan_ref_id);
				}

				if (0) {
					const workbook = new Excel.Workbook();
					await workbook.xlsx.load(buffer);

					const worksheet = workbook.getWorksheet("Sheet1");

					/* set constant column widths */
					let col1 = worksheet.getColumn(1);
					col1.width = 26.7;
					let col2 = worksheet.getColumn(2);
					col2.width = 37.5;

					let coapplicantDetails = [],
						directorData;

					directorRow.forEach((curRow) => {
						if (curRow.isApplicant == 0) {
							coapplicantDetails.push(curRow);
						} else if (curRow.isApplicant == 1) {
							directorData = curRow;
						}
					});

					let ddob = directorData && directorData.ddob;
					let formattedDdob = "";
					try {
						formattedDdob = moment(ddob).format("DD/MM/YYYY");
					} catch (err) { }

					if (formattedDdob === "Invalid date") formattedDdob = "";

					let cellValueMapping = {
						B3: loan_ref_id,
						B4: loanType,
						B5: formattedRequestDate,
						B8: applicantName,
						B9: permanentAddress,
						B10: presentAddress,
						B11: formattedDdob,
						B12: mobile,
						B13: email,
						B16: loanAmount,
						B17: appliedTenure,
						B18: branch
					};

					if (
						templatename === "Field Investigation Report" ||
						templatename === "Telephonic Verification Report" ||
						templatename === "Personal Discussion Report"
					) {
						/* The three coapplicant details start at row 21, 29 & 37; That's why below mapping with a row gap of 8 */
						for (let i = 0, startingRow = 21; i < coapplicantDetails.length && i < 3; i++) {
							let curRow = startingRow,
								curData = coapplicantDetails[i];
							let coAppDob = "";
							try {
								coAppDob = moment(curData.ddob).format("DD/MM/YYYY");
							} catch (err) { }

							if (coAppDob === "Invalid date") coAppDob = "";
							cellValueMapping[`B${curRow++}`] = `${curData.dfirstname || ""} ${curData.dlastname || ""}`;
							cellValueMapping[`B${curRow++}`] = `${curData.address1 || ""} ${curData.address2 || ""} ${curData.locality || ""
								} ${curData.city || ""} ${curData.state || ""} ${curData.pincode || ""}`;
							cellValueMapping[`B${curRow++}`] = coAppDob;
							cellValueMapping[`B${curRow++}`] = curData.dcontact;
							cellValueMapping[`B${curRow++}`] = curData.demail;
							cellValueMapping[`B${curRow++}`] = curData.applicant_relationship;
							startingRow += 8;
						}
						cellValueMapping.B45 = name;
						cellValueMapping.B46 = `${usertype || ""} ${userSubType || ""}`;
						cellValueMapping.B47 = userRefNo || "";
					} else {
						cellValueMapping.B21 = name;
						cellValueMapping.B22 = `${usertype || ""} ${userSubType || ""}`;
						cellValueMapping.B23 = userRefNo || "";
					}

					const cellNames = Object.keys(cellValueMapping);
					const cellValues = Object.values(cellValueMapping);

					/* Set the cells values and heights in below loop */
					cellNames.forEach((curCell, index) => {
						const cell = worksheet.getCell(curCell);
						let cellNumber = curCell.slice(1);
						const row = worksheet.getRow(cellNumber);
						const contentLength = cellValues[index] && cellValues[index].length;
						let height = (Math.floor(contentLength / 30) + 1) * 16;
						cell.value = cellValues[index];
						row.height = height;
					});

					populatedBuffer = await workbook.xlsx.writeBuffer();
				}

				const outputBuffer = populatedBuffer ? populatedBuffer : buffer;

				let aws_doc_name = "";
				//get data related to latest file name from predefined function
				let {name: docCategory} = await DoctypeRd.findOne({id: doc_type_id}).select(["name"]);

				//create name for file to upload to S3
				docCategory = docCategory.replace(/ /g, "_");

				aws_doc_name = `${docCategory}_${loan_id}`;
				({aws_bucket_name, filepath} = await getAWSBucket(req, userid));
				let loanBankMapping = await LoanBankMappingRd.find({loan_id}).sort("id desc").limit(1);

				let loan_bank_mapping_id;
				loan_bank_mapping_id = loanBankMapping[0] ? loanBankMapping[0].id : "1";
				let templateLink = await awsS3Upload(
					outputBuffer,
					"xlsx",
					aws_bucket_name,
					`${filepath}/${aws_doc_name}`
				);

				let lenderDocId = "";
				let lenderDoc = await lenderDocUpload(
					lenderDocId,
					loan_bank_mapping_id,
					doc_type_id,
					`${aws_doc_name}.xlsx`,
					0,
					loan_id
				);

				// zoho url generation
				let zohourl = await getUrl(templateLink);
				let {document_url, document_id, download_url} = zohourl;

				return res.status(200).send({
					status: "ok",
					statusCode: "NC200",
					resCode: "SUCCESS",
					message: "Template link generted successfully",
					templateLink,
					document_url,
					document_id,
					download_url
				});
			} catch (err) {
				console.log("Server error =>", err);
				let message,
					statusCode = err[0] || 500,
					resCode = err[1];
				message = sails.config.msgConstants[resCode];

				let response = {
					status: "nok",
					statusCode: `NC${statusCode}`,
					resCode: resCode ? resCode : "SERV_ERR",
					message: message ? message : "Server error occurred!"
				};

				return res.status(statusCode).send(response);
			}
		}
	},

	uploadExcelToBucket: async function (req, res) {
		let {document_url, document_id, download_url, loan_ref_id, doc_type_id, loan_id, userid} = req.allParams();

		let params = {document_url, document_id, download_url, loan_ref_id, doc_type_id, loan_id, userid},
			fields = ["document_url", "document_id", "download_url", "loan_ref_id", "doc_type_id", "loan_id", "userid"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let document_delete_url = `https://api.office-integrator.in/sheet/officeapi/v1/spreadsheet/${document_id}`;

		try {
			let apiparam = new FormData();
			apiparam.append("apikey", sails.config.zoho.apikey);
			apiparam.append("format", "xlsx");

			buffer = await axios({
				method: "post",
				url: download_url,
				responseType: "arraybuffer",
				data: apiparam
			})
				.then((response) => {
					return response.data;
				})
				.catch((error) => {
					console.error(error);
				});

			let aws_doc_name = "";
			let len = await getLatestExcelFileName(loan_id, doc_type_id);
			let {name: docCategory} = await DoctypeRd.findOne({id: doc_type_id}).select(["name"]);

			docCategory = docCategory.replace(/ /g, "_");
			aws_doc_name = `${docCategory}_${loan_id}`;

			({aws_bucket_name, filepath} = await getAWSBucket(req, userid));

			let loanBankMapping = await LoanBankMappingRd.find({loan_id}).sort("id desc").limit(1);

			let loan_bank_mapping_id;
			loan_bank_mapping_id = loanBankMapping[0] ? loanBankMapping[0].id : "1";

			let lenderDocRecord = await LenderDocumentRd.find({loan: loan_id, doc_type: doc_type_id})
				.select(["doc_name"])
				.sort("id desc")
				.limit(1);

			let lenderDocId;
			if (lenderDocRecord.length > 0) {
				lenderDocId = lenderDocRecord[0].id;
			} else lenderDocId = "";

			/*let lenderDoc = await lenderDocUpload(
				lenderDocId,
				loan_bank_mapping_id,
				doc_type_id,
				`${aws_doc_name}.xlsx`,
				0,
				loan_id
			);*/

			let templateLink;

			if (buffer.length > 0) {
				//s3upload
				templateLink = await awsS3Upload(buffer, "xlsx", aws_bucket_name, `${filepath}/${aws_doc_name}`);

				const apiKey = sails.config.zoho.apikey;

				const params = {
					apikey: apiKey
				};
				axios
					.delete(document_delete_url, {params})
					.then((response) => {
						console.log("DELETED from zoho server", response.data);
					})
					.catch((error) => {
						console.log("Error in deleting the document", error);
					});

				return res.ok({
					status: "ok",
					message: "Document uploaded to s3 bucket",
					templateLink
				});
			}

			return res.ok({
				status: "ok",
				message: "Document not available"
			});
		} catch (err) {
			console.log(err);
			res.status(500).send({
				status: "nok",
				message: err.message
			});
		}
	},

	deleteSpreadsheet: async function (req, res) {
		const {document_id} = req.allParams();

		let params = {document_id},
			fields = ["document_id"];
		missing = await reqParams.fn(params, fields);
		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const document_delete_url = `https://api.office-integrator.in/sheet/officeapi/v1/spreadsheet/${document_id}`;

		try {
			const apiKey = sails.config.zoho.apikey;

			const params = {
				apikey: apiKey
			};
			axios
				.delete(document_delete_url, {params})
				.then((response) => {
					if (response.data) {
						return res.ok({
							status: "ok",
							message: "Document deleted!"
						});
					} else {
						return res.ok({
							status: "ok",
							message: "Document not found!"
						});
					}
				})
				.catch((error) => {
					console.log("Error in deleting the document", error);
				});
		} catch (err) {
			res.status(500).send({
				status: "nok",
				message: err.message
			});
		}
	},
	upload_document_ml: async function (req, res) {
		const {loan_id, doc_id, request_type, type, doc_type_id} = req.allParams();
		if ((!loan_id || !doc_id || !request_type) && (!loan_id || !doc_type_id || !request_type)) {
			return res.badRequest(sails.config.res.missingFields);
		}
		let document_details;
		const {white_label_id} = await LoanrequestRd.findOne({id: loan_id}).select("white_label_id");
		let {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({id: white_label_id})
			.select(["s3_name", "s3_region"]);
		if (request_type === "LOAN") {
			document_details = await LoanDocumentRd.findOne({id: doc_id, loan: loan_id});
			if (!document_details) {
				return res.badRequest({
					status: "nok",
					message: "invalid Doc_id."
				});
			}
			updtateLoanDocument = await LoanDocument.update({id: doc_id}).set({
				json_extraction_update: JSON.stringify({
					user_name: req.user.name,
					user_id: req.user.id,
					edit: type == "word" ? "yes" : "no"
				})
			});
		}
		if (request_type == "Lender") {
			if (doc_type_id) {
				const doctypeData = await DoctypeRd.findOne({id: doc_type_id}).select("excel_sheet_name");
				document_details = JSON.parse(doctypeData.excel_sheet_name);
			} else {
				document_details = await LenderDocumentRd.findOne({id: doc_id, loan: loan_id});
			}
			if (!document_details) {
				return res.badRequest({
					status: "nok",
					message: "invalid Doc_id."
				});
			}
		}
		let bucket;
		if (doc_type_id) {
			console.log(document_details)
			s3_name = document_details.bucket;
			filepath = document_details.path;
			document_details.uploaded_doc_name = document_details.doc_name = document_details.path.split("/")[1];
			bucket = `${s3_name}/${document_details.path.split("/")[0]}`;
		} else {
			filepath = "users_" + document_details.user_id + "/" + document_details.doc_name;
			bucket = `${s3_name}/users_${document_details.user_id}`;
		}
		document_url = await sails.helpers.s3ViewDocument(document_details.doc_name, bucket, s3_region);
		s3.region = s3_region;
		options = {
			Bucket: s3_name,
			Key: filepath
		};
		fileStream = await s3.getObject(options).promise();
		return res.ok({
			status: "ok",
			message: "Document content",
			data: {
				url: document_url,
				fileName: document_details.uploaded_doc_name,
				base64_data: fileStream.Body.toString("base64"),
				file_type: fileStream.ContentType
			}
		});
		// 	const tempFilePath = `./${document_details.uploaded_doc_name}`;
		// 	fs.writeFileSync(tempFilePath, fileStream.Body);
		// 	form = new FormData();
		// 	form.append("filename", document_details.uploaded_doc_name);
		// 	form.append("uploadedFile", fs.createReadStream(tempFilePath));
		// 	form.append("Content-Type", "text/csv");
		// 	axios.post(url, form, {
		// 	  headers: {
		// 			"User-Agent": "Insomnia/2023.5.5",
		// 		  ...form.getHeaders()
		// 	  }
		// 	})
		// 		.then(response => {
		// 			if (response.status == 200 &&  response.statusText == 'OK'){
		// 				res.status(response.status).send({
		// 					status : "ok",
		// 					message : "File sent to ML successfully.",
		// 					data : {...response.data, url : document_url}
		// 			  });
		// 			} else {
		// 				res.status(response.status).send({
		// 					status : "nok",
		// 					message : "Error sending a file to ML.",
		// 					data : response.data
		// 			  });
		// 			}
		// 			fs.unlink(tempFilePath, (data, err) => {
		// 				if (data) console.log(data);
		// 				if (err) console.log(err);
		// 			});
		// 		})
		// 		.catch(error => {
		// 			return res.badRequest({
		// 		  		status : "nok",
		// 		  		message : "Error sending a file to ML.",
		// 		  		data : error
		// 			});
		// 		});
	},
	edit_document: async function (req, res) {
		const {loan_id, doc_id, request_type, doc_type_id, mode, user_id} = req.allParams();
		if ((!loan_id || !doc_id || !request_type) && (!loan_id || !(doc_type_id && user_id) || !request_type)) {
			return res.badRequest(sails.config.res.missingFields);
		}
		let document_details, fileName, custom_parm, version;
		const {white_label_id} = await LoanrequestRd.findOne({id: loan_id}).select("white_label_id");
		let {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({id: white_label_id})
			.select(["s3_name", "s3_region"]);
		custom_parm = {
			lid: loan_id,
			wl: white_label_id
		}
		if (request_type === "LOAN") {
			document_details = await LoanDocumentRd.findOne({id: doc_id, loan: loan_id, status: "active"});
			if (!document_details) {
				return res.ok({
					status: "nok",
					message: "invalid doc_id"
				});
			}
			if (/^onlinedoc_\d+$/.test(document_details.upload_method_type)) version = document_details.upload_method_type.split("_")[1];
			else version = 1;
			fileName = document_details.uploaded_doc_name;
			custom_parm.lid = loan_id
			custom_parm.did = doc_id
			custom_parm.type = "loan"
		}
		if (request_type == "Lender") {
			if (doc_type_id) {
				if (!user_id || user_id == "") return res.ok({status: "nok", message: "User ID is missing"})
				const doctypeData = await DoctypeRd.findOne({id: doc_type_id}).select("excel_sheet_name");
				if (doctypeData.excel_sheet_name == null || doctypeData.excel_sheet_name == "") {return res.ok({status: "nok", message: "Invalid doc_type_id"})}
				document_details = JSON.parse(doctypeData.excel_sheet_name);
				version = 1;
				custom_parm.dtid = doc_type_id
				custom_parm.uid = user_id
				custom_parm.type = "lender"
			} else {
				document_details = await LenderDocumentRd.findOne({id: doc_id, loan: loan_id, status: "active"});
				if (!document_details) {
					return res.ok({
						status: "nok",
						message: "invalid doc_id"
					});
				}
				if (/^onlinedoc_\d+$/.test(document_details.upload_method_type)) version = document_details.upload_method_type.split("_")[1];
				else version = 1;
				fileName = document_details.uploaded_doc_name;
				custom_parm.lid = loan_id
				custom_parm.did = doc_id
				custom_parm.type = "lender"
			}
		}
		let bucket;
		if (doc_type_id) {
			s3_name = document_details.bucket;
			filepath = document_details.path;
			fileName = document_details.path.split("/")[1];
			custom_parm.s3_name = s3_name
			// bucket = `${s3_name}/${document_details.path.split("/")[0]}`;
		} else {
			filepath = "users_" + document_details.user_id + "/" + document_details.doc_name;
			// bucket = `${s3_name}/users_${document_details.user_id}`;
		}
		let extension = fileName.split(".")[1];

		const body = {
			fileId: md5(fileName),
			path: filepath,
			region: s3_region,
			bucket: s3_name,
			version: version,
			fileName,
			fileType: fileType(extension),
			mode,
			callbackUrl: sails.config.callback_endpoint + 'updateOnlyDocument',
			user: {
				id: `${req.user.id}`,
				name: req.user.name
			},
			custom_parm: Buffer.from(JSON.stringify(custom_parm), 'utf-8').toString('base64')
		}

		const url = sails.config.onlyOffice_Url;
		try {
			let {data} = await axios.post(url, body);
			return res.ok({status: "ok", data: data.data})
		}
		catch (err) {
			return res.ok({status: "nok", message: "Failed to fetch redirect URL. Validate your inputs"})
		}
	},

	update_document: async function (req, res) {
		let {status, url, fileName, fileUrl, custom_parm} = req.allParams();
		if (status == 2) {
			try {
				let {wl, lid, did, type, dtid, uid} = JSON.parse(Buffer.from(custom_parm, 'base64').toString('utf-8'));
				let documentDetails, bucket;
				let whereCondition = {
					loan: lid,
					status: "active"
				}
				if (dtid) {
					whereCondition.doc_type = dtid
				}
				else if (did) whereCondition.id = did
				if (lid && type && wl) {
					if (type == "lender") {
						documentDetails = await LenderDocumentRd.find(whereCondition).sort("id DESC").limit(1);
					}
					else if (type == "loan") {
						documentDetails = await LoanDocumentRd.find(whereCondition).sort("id DESC").limit(1);
					}
					else {
						return res.ok({status: "nok", message: "Invalid params"})
					}
					if (did && documentDetails.length == 0) {
						return res.ok({
							status: "nok",
							message: "invalid doc_id"
						});
					}

					documentDetails = documentDetails.length > 0 ? documentDetails[0] : null

					let {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({id: wl})
						.select(["s3_name", "s3_region"]);

					if (documentDetails) bucket = s3_name + "/users_" + documentDetails.user_id;
					else if (uid) bucket = s3_name + "/users_" + uid
					else return res.ok({status: "nok", message: "Error uploading file to S3"})

					const s3 = new AWS.S3({
						accessKeyId: sails.config.aws.key,
						secretAccessKey: sails.config.aws.secret,
						region: s3_region,
					});

					const document = await axios.get(url, {responseType: 'arraybuffer'});

					const params = {
						Bucket: bucket,
						Key: fileName,
						Body: document.data,
					};

					s3.upload(params, (err, data) => {
						if (err) {
							console.error('Error uploading file to S3:', err);
							return res.badRequest('Error uploading file to S3.');
						}
					});

					const datetime = await sails.helpers.dateTime()

					if (type == "lender") {
						if (documentDetails) {
							const {user_id, loan, doc_type, loan_bank_mapping, uploaded_by, directorId, size_of_file, upload_method_type} = documentDetails
							const lenderCreate = await LenderDocument.create({
								loan_bank_mapping: loan_bank_mapping,
								user_id: user_id,
								loan: loan,
								doc_type: doc_type,
								doc_name: fileName,
								uploaded_doc_name: fileName,
								original_doc_name: fileName,
								status: "active",
								size_of_file: size_of_file,
								ints: datetime,
								on_upd: datetime,
								uploaded_by: uploaded_by,
								directorId: directorId,
								upload_method_type: /^onlinedoc_\d+$/.test(upload_method_type) ? `onlinedoc_${Number(upload_method_type.split("_")[1]) + 1}` : "onlinedoc_2"
							}).fetch();
							if (lenderCreate) {const lenderUpdate = await LenderDocument.updateOne({id: documentDetails.id}).set({status: "inactive"}).fetch();}
						}
						else if (dtid && uid) {
							const lenderCreate = await LenderDocument.create({
								loan_bank_mapping: 1, user_id: uid, loan: lid, doc_type: dtid, doc_name: fileName, uploaded_doc_name: fileName,
								original_doc_name: fileName, status: "active", size_of_file: 0, ints: datetime, on_upd: datetime, uploaded_by: uid, upload_method_type: "onlinedoc_2"
							}).fetch();
						}
						else return res.ok({status: "nok", message: "Failed to update DB"});
					}
					else if (type == "loan") {
						const {loan, business_id, user_id, doctype, osv_doc, no_of_pages, json_extraction, size, document_comments, image_quality_json_file,
							mis_group_id, upload_method_type, document_password, json_extraction_update, bank_id, account_no, directorId,
							uploaded_by, deleted_by, is_delete_not_allowed, email_notification_trigger, source_parent_ids, document_status,
							extracted_request_time, extract_request_status, on_upd, parent_doc_id} = documentDetails
						const loanCreate = await LoanDocument.create({
							loan: loan,
							business_id: business_id,
							user_id: user_id,
							doctype: doctype,
							doc_name: fileName,
							uploaded_doc_name: fileName,
							original_doc_name: fileName,
							status: "active",
							size: size,
							ints: datetime,
							upload_method_type: /^onlinedoc_\d+$/.test(upload_method_type) ? `onlinedoc_${Number(upload_method_type.split("_")[1]) + 1}` : "onlinedoc_2",
							document_password: document_password,
							directorId: directorId,
							uploaded_by: uploaded_by,
							on_upd: datetime
						}).fetch();
						if (loanCreate) {const loanUpdate = await LoanDocument.updateOne({id: documentDetails.id}).set({status: "inactive"}).fetch()};
					}
					return res.ok({
						status: "ok",
						message: "Data updation Successful"
					})
				}
				else return res.ok({
					status: "nok",
					message: "Missing Parameters"
				})
			}
			catch (err) {
				return res.badRequest({
					status: "nok",
					message: err.message
				})
			}
		}
		else {
			return res.ok({
				status: "nok",
				message: "Invalid Status"
			})
		}
	},
	getCamJson: async function (req, res) {
		const {loan_id, doc_type_id} = req.allParams();
		if (!loan_id || !doc_type_id) return res.badRequest(sails.config.res.missingFields);
		const lenderDoc = await LenderDocumentRd.find({loan: loan_id, doc_type: doc_type_id, status: "active"}).sort("id DESC").limit(1);
		if (lenderDoc.length == 0) return res.ok({status: "nok", message: "No record found for this Loan ID"});
		const {user_id, uploaded_doc_name} = lenderDoc[0];
		const file_path = "users_" + user_id + "/" + uploaded_doc_name;
		const user_whitelabel = req.user.loggedInWhiteLabelID
		const whitelabelsolution = await WhiteLabelSolutionRd.findOne({id: user_whitelabel});
		const {s3_name, s3_region} = whitelabelsolution;
		const params = {
			Bucket: s3_name,
			Key: file_path,
		}
		s3_region.region = s3_region
		s3.getObject(params, (err, data) => {
			if (err) {
				return res.ok({status: "nok", message: "Error in reading JSON"})
			} else {
				const jsonContents = data.Body.toString('utf-8');
				const jsonData = JSON.parse(jsonContents);
				return res.ok({status: "ok", data: jsonData})
			}
		});
	},
	getObligationsJson: async function (req, res) {
		const loan_id = req.param("loan_id");
		if (!loan_id) return res.badRequest(sails.config.res.missingFields);
		let data = [];
		const loanData = await LoanrequestRd.findOne({id: loan_id}).select("white_label_id")
		const loanDoc = await LoanDocumentRd.find({loan: loan_id, doctype: 35, uploaded_doc_name: {contains: "json"}}).select(["uploaded_doc_name", "user_id"])
		if (!loanData || loanDoc.length == 0) return res.ok({status: "nok", message: "No record found", data: []})
		const user_whitelabel = loanData.white_label_id;
		const whitelabelsolution = await WhiteLabelSolutionRd.findOne({id: user_whitelabel});
		const {s3_name, s3_region} = whitelabelsolution;
		for (loan of loanDoc) {
			const {user_id, uploaded_doc_name} = loan;
			const file_path = "users_" + user_id + "/" + uploaded_doc_name;
			const params = {
				Bucket: s3_name,
				Key: file_path,
			}
			s3_region.region = s3_region;

			try {
				const result = await s3.getObject(params).promise();
				const jsonContents = result.Body.toString('utf-8');
				const jsonData = JSON.parse(jsonContents)
				if (jsonData.consumerCreditData && Array.isArray(jsonData.consumerCreditData) && Array.isArray(jsonData.consumerCreditData[0].accounts)) {
					jsonData.consumerCreditData[0].accounts.forEach(item => {
						let obj = {
							applicant_name: "",
							name_of_the_financier: "",
							nature_of_loan: item.accountType,
							loan_amount: item.highCreditAmount,
							loan_starting_date: item.dateOpened,
							mob: "",
							emi: item.emiAmount,
							balance_tenor: "",
							"verified_thru_banking/cibil": "",
							"obligated_yes/no": ""
						}
						data.push(obj)
					})
				}
			} catch (err) {
				console.log(err)
			}
		}
		return res.ok({status: "ok", message: "JSON extracted successfully", data})
	}
};

async function lenderDocUpload(lenderDocId, loan_bank_mapping_id, doc_type_id, doc_name, size_of_file, loanId) {
	let datetime = await sails.helpers.dateTime();
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
	if ((bankMappingDetails && bankMappingDetails.business) || (loanData && loanData.business_id)) {
		business_id = (bankMappingDetails && bankMappingDetails.business) || loanData.business_id;
		const getUserDetails = await BusinessRd.findOne({
			where: {
				id: business_id
			},
			select: ["userid"]
		}),
			business_user_id = getUserDetails.userid ? getUserDetails.userid : "";
		if (business_user_id && loan_id) {
			const data = {
				loan_bank_mapping: loan_bank_mapping_id,
				user_id: business_user_id,
				loan: loan_id,
				doc_type: doc_type_id,
				doc_name: doc_name,
				uploaded_doc_name: doc_name,
				original_doc_name: doc_name,
				status: "active",
				size_of_file: size_of_file,
				ints: datetime,
				on_upd: datetime,
				uploaded_by: 0
			};
			let lenderDocRecord = await LenderDocumentRd.find({loan: loan_id, doc_type: doc_type_id})
				.select(["doc_name"])
				.sort("id desc")
				.limit(1);

			let lenderDoc;
			if (lenderDocRecord.length > 0) {
				lenderDoc = await LenderDocument.update({id: lenderDocRecord[0].id})
					.set({
						doc_name,
						uploaded_doc_name: doc_name,
						user_id: business_user_id,
						on_upd: datetime
					})
					.fetch();
			} else lenderDoc = await LenderDocument.create(data).fetch();
			return lenderDoc;
		}
	}
}

async function getLatestExcelFileName(loan_id, doc_type_id) {
	//select * from namastecredit.lender_document where doc_type_id=73 and loan_id=(select loanId from namastecredit.loanrequest where loan_ref_id="OPDU00248115") order by loanbankdoc_id desc limit 1;
	//this query will give us all the document name from
	const lender_document_record = await LenderDocumentRd.find({loan: loan_id, doc_type: doc_type_id})
		.select(["doc_name"])
		.sort([{id: "DESC"}]);

	return lender_document_record.length;
}

async function getAWSBucket(req, userid) {
	const user_whitelabel = req.user.loggedInWhiteLabelID,
		whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel}).limit(1),
		aws_bucket_name = whitelabelsolution[0]["s3_name"];
	const region = whitelabelsolution[0]["s3_region"];

	let filepath = "users_" + userid;

	return {aws_bucket_name, region, filepath};
}

async function fetchDataForExcel(loanRefId, docTypeId) {
	let [loanRequestRow, docTypeRow] = await Promise.all([
		LoanrequestRd.findOne({loan_ref_id: loanRefId}),
		DoctypeRd.findOne({
			select: ["name", "excel_sheet_name"],
			where: {id: docTypeId}
		})
	]);

	if (!loanRequestRow) return new Error("LOAN_NOT_FOUND");
	else if (!docTypeRow) return new Error("DOC_TYPE_NOT_FOUND");
	else if (!docTypeRow.excel_sheet_name) return new Error("TEMPLATE_NOT_FOUND");

	let sheetLocation, bucket, filepath;

	try {
		sheetLocation = JSON.parse(docTypeRow.excel_sheet_name);
		(bucket = sheetLocation.bucket), (filepath = sheetLocation.path);
	} catch (err) {
		console.log(err);
		return new Error("TEMPLATE_NOT_FOUND");
	}

	const {
		application_ref: applicationRef,
		loan_type_id: loanTypeId,
		RequestDate,
		business_id: businessId,
		loan_amount: loanAmount,
		loan_amount_um: loanAmountUm,
		applied_tenure: appliedTenure,
		branch_id: branchId
	} = loanRequestRow;

	const [loanTypeRow, businessRow, businessAddressRows, directorRow, banktblRow] = await Promise.all([
		LoantypeRd.findOne({
			select: ["loanType"],
			where: {id: loanTypeId}
		}),
		BusinessRd.findOne({
			select: ["businessname", "first_name", "last_name", "business_email", "contactno"],
			where: {id: businessId}
		}),
		BusinessaddressRd.find({
			select: ["aid", "line1", "line2", "line3", "line4", "locality", "city", "state", "pincode"],
			where: {bid: businessId}
		}),
		DirectorRd.find({
			select: [
				"isApplicant",
				"ddob",
				"dfirstname",
				"dlastname",
				"address1",
				"address2",
				"locality",
				"city",
				"state",
				"pincode",
				"dcontact",
				"demail",
				"applicant_relationship"
			],
			where: {business: businessId}
		}),
		BanktblRd.findOne({id: branchId}).select("branch")
	]);

	let permanentAddress = (presentAddress = "");

	businessAddressRows.forEach((curRow) => {
		let {aid, line1, line2, line3, line4, locality, city, state, pincode} = curRow;
		if (aid === 1) {
			presentAddress = `${line1 || ""} ${line2 || ""} ${line3 || ""} ${line4 || ""}, ${locality || ""}, ${city || ""
				}, ${state || ""} ${pincode || ""}`;
		} else if (aid === 2) {
			permanentAddress = `${line1 || ""} ${line2 || ""} ${line3 || ""} ${line4 || ""}, ${locality || ""}, ${city || ""
				}, ${state || ""} ${pincode || ""}`;
		}
	});

	const loanType = loanTypeRow.loanType;
	let applicantName = `${businessRow.first_name || ""} ${businessRow.last_name || ""}`;
	applicantName = applicantName.trim() ? applicantName : `${businessRow.businessname || ""}`;

	return {
		applicationRef: applicationRef || "",
		loanTypeId: loanTypeId || "",
		loanType: loanType || "",
		requestDate: RequestDate || "",
		businessId: businessId || "",
		applicantName: applicantName || "",
		presentAddress: presentAddress || "",
		permanentAddress: permanentAddress || "",
		directorRow,
		email: (businessRow && businessRow.business_email) || "",
		mobile: (businessRow && businessRow.contactno) || "",
		loanAmount: `${loanAmount || ""} ${loanAmountUm || ""}`,
		appliedTenure: appliedTenure || "",
		branch: (banktblRow && banktblRow.branch) || "",
		bucket,
		filepath,
		templatename: docTypeRow.name
	};
}

async function awsS3Upload(buffer, extension, bucket, templatename) {
	try {
		AWS.config.update({
			key: sails.config.aws.key,
			secret: sails.config.aws.secret,
			region: sails.config.aws.region
		});

		const s3 = new AWS.S3();

		fileName = `${templatename}.${extension}`;
		let params = {
			Bucket: bucket,
			Key: fileName,
			Body: buffer,
			ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			ACL: "public-read"
		};

		let uploadRes = await s3.upload(params).promise();
		return uploadRes.Location;
	} catch (err) {
		console.log("aws upload err=> ", err);
		return false;
	}
}

async function getUrl(URL) {
	let data = new FormData();
	data.append("apikey", sails.config.zoho.apikey);
	data.append("url", URL);
	data.append("permissions", '{"document.export":false,"document.print":false,"document.edit":true}');
	let config = {
		method: "post",
		url: sails.config.zoho.editSpreadsheetUrl,
		headers: {
			...data.getHeaders()
		},
		data
	};

	try {
		const response = await axios(config, data);
		return response.data;
	} catch (err) {
		console.log(err);
		return err;
	}
}

async function excelBuffer(buffer, dataToPopulate, user, loan_ref_id) {
	let {
		//applicationRef,//
		//loanTypeId,//
		loanType,
		requestDate,
		//businessId,//
		applicantName,
		presentAddress,
		permanentAddress,
		directorRow,
		email,
		mobile,
		loanAmount,
		appliedTenure,
		branch,
		templatename
	} = dataToPopulate;

	const {name, usertype, user_sub_type: userSubType, user_reference_no: userRefNo} = user;
	const formattedRequestDate = moment(requestDate).format("DD/MM/YYYY");

	const workbook = new Excel.Workbook();
	await workbook.xlsx.load(buffer);

	const worksheet = workbook.getWorksheet("Sheet1");

	/* set constant column widths */
	let col1 = worksheet.getColumn(1);
	col1.width = 26.7;
	let col2 = worksheet.getColumn(2);
	col2.width = 37.5;

	let coapplicantDetails = [],
		directorData;

	directorRow.forEach((curRow) => {
		if (curRow.isApplicant == 0) {
			coapplicantDetails.push(curRow);
		} else if (curRow.isApplicant == 1) {
			directorData = curRow;
		}
	});

	let ddob = directorData && directorData.ddob;
	let formattedDdob = "";
	try {
		formattedDdob = moment(ddob).format("DD/MM/YYYY");
	} catch (err) { }

	if (formattedDdob === "Invalid date") formattedDdob = "";

	let cellValueMapping = {
		B3: loan_ref_id,
		B4: loanType,
		B5: formattedRequestDate,
		B8: applicantName,
		B9: permanentAddress,
		B10: presentAddress,
		B11: formattedDdob,
		B12: mobile,
		B13: email,
		B16: loanAmount,
		B17: appliedTenure,
		B18: branch
	};

	if (
		templatename === "Field Investigation Report" ||
		templatename === "Telephonic Verification Report" ||
		templatename === "Personal Discussion Report"
	) {
		/* The three coapplicant details start at row 21, 29 & 37; That's why below mapping with a row gap of 8 */
		for (let i = 0, startingRow = 21; i < coapplicantDetails.length && i < 3; i++) {
			let curRow = startingRow,
				curData = coapplicantDetails[i];
			let coAppDob = "";
			try {
				coAppDob = moment(curData.ddob).format("DD/MM/YYYY");
			} catch (err) { }

			if (coAppDob === "Invalid date") coAppDob = "";
			cellValueMapping[`B${curRow++}`] = `${curData.dfirstname || ""} ${curData.dlastname || ""}`;
			cellValueMapping[`B${curRow++}`] = `${curData.address1 || ""} ${curData.address2 || ""} ${curData.locality || ""
				} ${curData.city || ""} ${curData.state || ""} ${curData.pincode || ""}`;
			cellValueMapping[`B${curRow++}`] = coAppDob;
			cellValueMapping[`B${curRow++}`] = curData.dcontact;
			cellValueMapping[`B${curRow++}`] = curData.demail;
			cellValueMapping[`B${curRow++}`] = curData.applicant_relationship;
			startingRow += 8;
		}
		cellValueMapping.B45 = name;
		cellValueMapping.B46 = `${usertype || ""} ${userSubType || ""}`;
		cellValueMapping.B47 = userRefNo || "";
	} else {
		cellValueMapping.B21 = name;
		cellValueMapping.B22 = `${usertype || ""} ${userSubType || ""}`;
		cellValueMapping.B23 = userRefNo || "";
	}

	const cellNames = Object.keys(cellValueMapping);
	const cellValues = Object.values(cellValueMapping);

	/* Set the cells values and heights in below loop */
	cellNames.forEach((curCell, index) => {
		const cell = worksheet.getCell(curCell);
		let cellNumber = curCell.slice(1);
		const row = worksheet.getRow(cellNumber);
		const contentLength = cellValues[index] && cellValues[index].length;
		let height = (Math.floor(contentLength / 30) + 1) * 16;
		cell.value = cellValues[index];
		row.height = height;
	});

	populatedBuffer = await workbook.xlsx.writeBuffer();

	return populatedBuffer;
}

async function checkFileExists(bucketName, fileName) {
	try {
		const params = {
			Bucket: bucketName,
			Key: fileName
		};

		await s3.headObject(params).promise();
		return true;
	} catch (error) {
		if (error.code === "NotFound") {
			console.log("File does not exist");
			return false;
		} else {
			console.log("Error occurred:", error.message);
			return false;
		}
	}
}
function generateBoundary() {
	const crypto = require("crypto");
	return `----${crypto.randomBytes(16).toString('hex')}`;
}

function fileType(ext) {
	const word = ["doc", "docx", "html", "odt", "pdf", "txt", "xml", "rtf", "xps", "wps", "wpt"]
	const cell = ["xls", "csv", "xlsx", "ods", "ots", "xlsb", "xlsm", "xltx"]
	const slide = ["ppt", "pptm", "pptx", "sxi", "dps", "dpt", "odp", "otp", "pot", "potx", "potm", "pps", "ppsm", "ppsx"]

	if (word.includes(ext)) {
		return "word";
	} else if (cell.includes(ext)) {
		return "cell";
	} else if (slide.includes(ext)) {
		return "slide";
	} else {
		return "unknown";
	}
}
