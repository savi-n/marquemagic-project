// const jwToken = require("jsonwebtoken");
const {SignJWT} = require("jose");
private_key = jwToken.privateKey();
public_key = jwToken.publicKey();
const AWS = require("aws-sdk");
const s3 = new AWS.S3({accessKeyId: sails.config.aws.key, secretAccessKey: sails.config.aws.secret});
const reqParams = require("../helpers/req-params");
module.exports = {
	jsonExtractionFetch: async function (req, res) {
		const loanId = req.param("loanId"),
			ncStatus = sails.config.nc_status,
			dataArray = [];

		const params = req.allParams();
		const fields = ["loanId"];
		const missing = await reqParams.fn(params, fields);

		if (!loanId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		await LoanrequestRd.findOne({id: loanId})
			.populate("loan_document")
			.then(async (loanData) => {
				if (!loanData) {
					return res.badRequest(sails.config.res.invalidLoanId);
				}

				if (loanData.loan_status_id == ncStatus.status1 && loanData.loan_sub_status_id == ncStatus.status3) {
					await LoanBankMappingRd.find({loan_id: loanData.id}).then((loanBankData) => {
						loanBankData.forEach(async (element) => {
							if (
								element.loan_bank_status == ncStatus.status3 &&
								element.loan_borrower_status == ncStatus.status1
							) {
								const doc = loanData.loan_document;
								for (const i in doc) {
									if (
										doc[i].status == "active" &&
										(doc[i].doctype == 116 || doc[i].doctype == 117 || doc[i].doctype == 118)
									) {
										if (doc[i].json_extraction_update) {
											dataArray.push({
												id: doc[i].id,
												status: doc[i].status,
												doctype: doc[i].doctype,
												jsonData: doc[i].json_extraction_update
											});
										} else {
											if (doc[i].json_extraction) {
												const jsonData = JSON.parse(doc[i].json_extraction);
												s3.region = jsonData.s3_region;
												const getParams = {
													Bucket: jsonData.s3_name,
													Key: jsonData.s3_filepath + jsonData.master_json
												};
												try {
													const file = await s3.getObject(getParams).promise();
													if (file.Body) {
														dataArray.push({
															id: doc[i].id,
															status: doc[i].status,
															doctype: doc[i].doctype,
															jsonData: file.Body.toString()
														});
													}
												} catch (err) {
													return res.badRequest(err);
												}
											}
										}
									}
								}
								return res.ok({status: "Ok", message: "JSON Data", data: dataArray});
							}
						});
					});
				}
			});
	},

	jsonFileDownload: async function (req, res) {
		const loanId = req.param("loanId"),
			ncStatus = sails.config.nc_status,
			jsonUrl = [];

		const params = req.allParams();
		const fields = ["loanId"];
		const missing = await reqParams.fn(params, fields);

		if (!loanId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		await LoanrequestRd.findOne({id: loanId})
			.populate("loan_document")
			.then(async (loanData) => {
				if (!loanData) {
					return res.badRequest(sails.config.res.invalidLoanId);
				}

				if (loanData.loan_status_id == ncStatus.status1 && loanData.loan_sub_status_id == ncStatus.status3) {
					await LoanBankMappingRd.find({loan_id: loanData.id}).then((loanBankData) => {
						loanBankData.forEach(async (element) => {
							if (
								element.loan_bank_status == ncStatus.status3 &&
								element.loan_borrower_status == ncStatus.status1
							) {
								const doc = loanData.loan_document;
								for (const i in doc) {
									if (doc[i].doctype == 116 || doc[i].doctype == 117 || doc[i].doctype == 118) {
										if (doc[i].json_extraction) {
											const jsonData = JSON.parse(doc[i].json_extraction),
												region = jsonData.s3_region;
											let bucket = jsonData.s3_name;
											const jsonfile = {};
											if (doc[i].json_extraction_update) {
												const params = {
													Bucket: bucket,
													Key: `user_${req.user.id}/updatedMasterJson.json`,
													Body: doc[i].json_extraction_update
												},
													upload = await s3.upload(params).promise(),
													fileUrl = await s3.getSignedUrl("getObject", {
														Bucket: bucket,
														Key: upload.Key
													});
												jsonfile.url = fileUrl;
												jsonUrl.push(jsonfile);
											} else {
												bucket = bucket + "/" + jsonData.s3_filepath.split("/")[0];
												const document = jsonData.master_json,
													url = await sails.helpers.s3ViewDocument(document, bucket, region);
												jsonfile.url = url;
												jsonUrl.push(jsonfile);
											}
										}
									}
								}
								return res.ok({status: "ok", signedurl: jsonUrl});
							} else {
								return res.badRequest({
									status: "nok",
									message: sails.config.msgConstants.noJSONForThisLoan
								});
							}
						});
					});
				} else {
					return res.badRequest({status: "nok", message: sails.config.msgConstants.loanNotInCompletedState});
				}
			});
	},
	jsonUpdate: async function (req, res) {
		const allParams = req.allParams(),
			{loanId, docId, jsonData} = allParams;

		const fields = ["loanId", "docId", "jsonData"];
		const missing = await reqParams.fn(allParams, fields);

		if (!loanId || !docId || !jsonData) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		await LoanrequestRd.findOne({id: loanId}).then(async (loanData) => {
			if (!loanData) {
				return res.badRequest(sails.config.res.invalidLoanId);
			}

			const date = await sails.helpers.dateTime();

			await LoanDocumentRd.findOne({id: docId, loan: loanId, status: "active"}).then(async (loanDocData) => {
				if (!loanDocData) {
					sails.config.res.noDataAvailableId.message =
						"Invalid doc id or there is no data for this doc id or doc id and loan id is mismatched";
					return res.badRequest(sails.config.res.noDataAvailableId);
				} else {
					await LoanDocument.update({id: docId, loan: loanId})
						.set({on_upd: date, json_extraction_update: JSON.stringify(jsonData)})
						.fetch()
						.then((updatedData) => {
							if (updatedData.length > 0) {
								sails.config.successRes.dataUpdated.data = updatedData;
							}

							return res.ok(sails.config.successRes.dataUpdated);
						});
				}
			});
		});
	},

	xlsxDownload: async function (req, res) {
		const loanId = req.param("loanId"),
			ncStatus = sails.config.nc_status,
			jsonUrl = [];

		const params = req.allParams();
		const fields = ["loanId"];
		const missing = await reqParams.fn(params, fields);

		if (!loanId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		await LoanrequestRd.findOne({id: loanId})
			.populate("loan_document")
			.then(async (loanData) => {
				if (!loanData) {
					return res.badRequest(sails.config.res.invalidLoanId);
				}

				if (loanData.loan_status_id == ncStatus.status1 && loanData.loan_sub_status_id == ncStatus.status3) {
					await LoanBankMappingRd.find({loan_id: loanData.id}).then((loanBankData) => {
						loanBankData.forEach(async (element) => {
							if (
								element.loan_bank_status == ncStatus.status3 &&
								element.loan_borrower_status == ncStatus.status1
							) {
								const doc = loanData.loan_document;
								for (const i in doc) {
									if (doc[i].doctype == 117) {
										const whiteLabel = await WhiteLabelSolutionRd.findOne({
											id: loanData.white_label_id
										});
										let bucket = whiteLabel["s3_name"];
										const region = whiteLabel["s3_region"];
										let userid = req.user["id"];
										if (req.param("userid") !== undefined && req.param("userid") !== "") {
											userid = req.param("userid");
										}

										bucket = bucket + "/users_" + userid;
										const filename = doc[i].doc_name,
											url = await sails.helpers.s3ViewDocument(filename, bucket, region);

										return res.ok({status: "ok", signedurl: url});
									}
								}
							} else {
								return res.badRequest({
									status: "nok",
									message: sails.config.msgConstants.noJSONForThisLoan
								});
							}
						});
					});
				} else {
					return res.badRequest({status: "nok", message: sails.config.msgConstants.loanNotInCompletedState});
				}
			});
	},

	PDF_XLS_download: async function (req, res) {
		const loanId = req.param("loanId");

		const params = req.allParams();
		const fields = ["loanId"];
		const missing = await reqParams.fn(params, fields);

		if (!loanId) {
			data;
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		await LoanrequestRd.findOne({id: loanId})
			.populate("loan_document")
			.then(async (loanData) => {
				if (!loanData) {
					return res.badRequest(sails.config.res.invalidLoanId);
				}

				let url, reqJsonData;

				const header = {
					authorization: req.headers.authorization
				};
				url = `http://localhost:1337/jsonExtractionFetch?loanId=${loanId}`;

				const jsonData = await sails.helpers.sailstrigger(url, "", header, "GET");
				if (jsonData) {
					const jsonParseData = JSON.parse(jsonData);
					if (jsonParseData.status == "Ok") {
						reqJsonData = jsonParseData.data[0].jsonData;
					} else {
						return res.ok(jsonParseData);
					}
				}
				const doc = loanData.loan_document;
				for (const i in doc) {
					if (doc[i].doctype == 117) {
						const whiteLabel = await WhiteLabelSolutionRd.findOne({id: loanData.white_label_id}),
							bucket = whiteLabel["s3_name"],
							region = whiteLabel["s3_region"],
							body = {
								loanId: loanData.id,
								s3_name: bucket,
								s3_region: region,
								userId: doc[i].user_id,
								jsonData: reqJsonData,
								"uploaded doc name": doc[i].uploaded_doc_name,
								doc_name: doc[i].doc_name
							};

						url = sails.config.pdfUrl.url;

						const xmlUrl = await sails.helpers.sailstrigger(url, JSON.stringify(body), header, "POST");
						parseUrl = JSON.parse(xmlUrl);

						xlsFileUrl = await s3.getSignedUrl("getObject", {
							Bucket: bucket,
							Key: parseUrl.s3_path
						});
						fileUrl = await s3.getSignedUrl("getObject", {
							Bucket: bucket,
							Key: parseUrl.pdf_path
						});

						urlData = {
							xlsxUrl: xlsFileUrl,
							pdfUrl: fileUrl
						};

						return res.ok({status: "ok", url: urlData});
					}
				}
			});
	},
	abfl_sum: async function (req, res) {
		const sumNumber = req.param("number");
		sum = sumNumber.reduce((a, b) => a + b, 0);
		return res.ok({status: "ok", message: "sum of numbers", total: sum});
	},

	json_cron: async function (req, res) {
		minutes = new Date();
		minutes = moment(minutes).subtract(17, "m").format("YYYY-MM-DD HH:mm:ss").toString();
		loanData = await Loanrequest.find({
			// loan_ref_id : "QXAS00256467"
			modified_on: {">=": minutes}
		})
			.populate("business_id")
			.populate("lender_document");

		for (const element of loanData) {
			let applicant_details = {},
				parmanent_address = {},
				present_address = {},
				loan_financial = [],
				loan_assets_data = [],
				business_share_holder_data = [],
				co_applicant_data = [],
				garantor_data = {},
				business_mapping_data = [],
				coApplicantId = [],
				co_app_doc = {},
				doc_list = {},
				applicant_income_data = [],
				co_applicant_income_data = [],
				applicant_emp_details = {},
				poa_details = {},
				loan_json = [];
			connectorData = await BusinessRd.find({profile_ref_no: element.connector_user_id}).select([
				"businessname"
			]).limit(1);
			connectorUserData = await UsersRd.find({user_reference_no: element.connector_user_id}).select([
				"name"
			]).limit(1);
			element.connector_name =
				connectorData.length > 0
					? connectorData[0].businessname
					: connectorUserData.length > 0
						? connectorUserData[0].name
						: "";
			auth_parse_data = element.authentication_data ? JSON.parse(element.authentication_data) : {};
			if (
				element.loan_status_id === 1 &&
				element.loan_sub_status_id !== 1 &&
				auth_parse_data &&
				!auth_parse_data.s3_data
			) {
				element.otp_auth = auth_parse_data.auth_data ? auth_parse_data.auth_data : {};
				whiteLabel_data = await WhiteLabelSolutionRd.findOne({id: element.white_label_id});
				if (whiteLabel_data && whiteLabel_data.isApplicationformenabled === 1) {
					const bucket = whiteLabel_data["s3_name"],
						logo = whiteLabel_data["logo"],
						region = whiteLabel_data["s3_region"];
					loanProductDetailsData = await LoanProductDetailsRd.find({
						white_label_id: element.white_label_id,
						isActive: "true",
						product_id: {
							contains: element.loan_product_id
						}
					}).select(["product_id", "terms_conditions_url"]);

					poa_details = await PoaDetailsRd.find({
						loan_id: element.id,
						white_label_id: element.white_label_id
					});
					const loanAdditionalData = await LoanAdditionalDataRd.findOne({loan_id: element.id}),
						estimated_fund = loanAdditionalData && loanAdditionalData.estimated_fund_requirements ? JSON.parse(loanAdditionalData.estimated_fund_requirements) : {},
						source_fund = loanAdditionalData && loanAdditionalData.source_fund_requirements ? JSON.parse(loanAdditionalData && loanAdditionalData.source_fund_requirements) : {};
					let loanProductDetails = {};
					loanProductDetailsData.forEach((product) => {
						if (
							product.product_id &&
							Object.values(product.product_id).indexOf(element.loan_product_id) > -1
						) {
							loanProductDetails = product;
						}
					});
					product_details = await LoanProductsRd.findOne({id: element.loan_product_id}).select([
						"product",
						"application_json"
					]);
					if (!product_details || !product_details.application_json || Object.keys(product_details.application_json).length == 0) {
						return res.ok({status: "ok", message: "application data is not configured"});
					}
					ro_name = await Users.findOne({id: element.createdUserId}).select(["name"]);
					bbm_name = await Users.findOne({id: element.sales_id}).select(["name"]);
					element.createdUserId = ro_name.name;
					element.sales_id = bbm_name.name;
					element.loan_origin = element.loan_origin ? element.loan_origin.split("_")[1] : "";
					const applicant_doctype_data = await doc_type(element.business_id.userid, element.business_id.businesstype, element.loan_product_id, "", "Applicant_doc_type", element.white_label_id);
					if (applicant_doctype_data.length > 0) doc_list.applicant_doc_type = JSON.parse(applicant_doctype_data);
					else doc_list.applicant_doc_type = [];
					element.loan_product_id = product_details.product;
					const json_data = product_details.application_json.application_details;
					const loanDocument = await LoanDocument.find({
						loan: element.id,
						status: "active"
					}).populate("doctype");
					if (loanDocument.length > 0) {
						element.loan_document = loanDocument;
					} else {
						element.loan_document = [];
					}
					element.RequestDate = moment(element.RequestDate)
						.add(5, "h")
						.add(42, "m")
						.format("DD-MM-YYYY hh:mm:ss A")
						.toString();
					element.annual_op_expense = element.annual_op_expense
						? element.annual_op_expense + " " + element.op_expense_um
						: "";
					element.annual_revenue = element.annual_revenue
						? element.annual_revenue + " " + element.revenue_um
						: "";
					element.loan_amount_um = element.loan_amount_um ? element.loan_amount_um : "";
					element.loan_amount = element.loan_amount ? element.loan_amount + " " + element.loan_amount_um : "";
					businesstype = await BusinessTypeRd.findOne({id: element.business_id.businesstype}).select([
						"TypeName"
					]);
					element.business_id.businesstype = businesstype.TypeName;
					if (element.business_id.customer_picture) {
						element.business_id.customer_picture = JSON.parse(element.business_id.customer_picture);
					}
					businessAddress = await Businessaddress.find({bid: element.business_id.id});
					if (businessAddress.length > 0) {
						businessAddress.forEach((add_data) => {
							if (add_data.aid == 1) {
								present_address = add_data;
							} else {
								parmanent_address = add_data;
							}
						});
					}
					documentDetails = await LoanDocumentDetailsRd.find({
						loan_id: element.id,
						classification_type: "others",
						doc_request_type: "loan"
					});
					docDataArray = [];
					documentDetails.forEach((docData) => {
						const uploadDocData = loanDocument.find(
							(loanDocumentData) => loanDocumentData.id == docData.doc_id
						);
						if (uploadDocData) {
							docDataArray.push({uploaded_doc_name: uploadDocData.uploaded_doc_name, did: docData.did});
						}
					});
					const directorData = await directorDetails(element.business_id.id, element.business_id.userid, element.white_label_id, docDataArray);
					applicant_details = directorData.applicant_details;
					co_applicant_data = directorData.co_applicant_data;
					garantor_data = directorData.garantor_data;
					coApplicantId = directorData.coApplicantId;
					applicant_income_data = directorData.applicant_income_data;
					co_applicant_income_data = directorData.co_applicant_income_data;
					applicant_emp_details = directorData.applicant_emp_details;
					co_applicant_emp_details = directorData.co_applicant_emp_details;

					doc_list.coApplicant_doc_type = directorData.co_app_doc;
					loan_financial = await LoanFinancials.find({
						business_id: element.business_id.id,
						loan_id: element.id
					});
					let emiDetails = [];
					if (loan_financial.length > 0) {
						loan_financial.map(async (bank_data) => {
							const dirName = bank_data.director_id && bank_data.director_id != 0 ?
								await Director.findOne({id: bank_data.director_id}).select(["dfirstname", "middle_name", "dlastname"]) : "";
							bank_data.director_id = dirName ? dirName.dfirstname + " " + dirName.middle_name + " " + dirName.dlastname : "";
							if (bank_data.fin_type == "Outstanding Loans" && bank_data.emi_details) {
								const emiDetailsNew = JSON.parse(bank_data.emi_details);
								if (Object.prototype.toString.call(emiDetailsNew) === "[object Object]") {
									emiDetailsNew.director_id = bank_data.director_id;
									emiDetails.push(emiDetailsNew);
								} else {
									const arrWithDirName = emiDetailsNew.map(object => {
										return {...object, director_id: bank_data.director_id};
									});
									emiDetails = arrWithDirName;

								}
							}
							if (bank_data.bank_id != 0) {
								bankData = await BankMasterRd.findOne({id: bank_data.bank_id}).select([
									"bankname",
									"status"
								]);
								bank_data.bankid = bankData.bankname;
							} else {
								bank_data.bankid = "";
							}
						});
					}
					loan_assets = await LoanAssets.find({
						business_id: element.business_id.id,
						loan_id: element.id
					}).sort("id DESC");
					if (loan_assets.length > 0) {
						loan_assets.forEach(loanAssetsData => {
							if (loanAssetsData.loan_json && Array.isArray(loanAssetsData.loan_json) === true) {
								loan_json = loanAssetsData.loan_json;
							} else {
								loan_json.push(loanAssetsData.loan_json);
							}
						});
						loan_assets_data = loan_assets;
					}
					loan_references = await LoanReferences.find({loan_id: element.id});
					if (loan_references.length > 0) {
						loan_references_data = loan_references;
					}
					business_share_holder = await BusinessShareholder.find({businessID: element.business_id.id});
					if (business_share_holder.length > 0) {
						business_share_holder_data = business_share_holder;
					}
					business_mapping = await BusinessMapping.find({parent_id: element.business_id.id});
					if (business_mapping.length > 0) {
						bankData = await BankMasterRd.findOne({id: business_mapping[0].bank_name}).select([
							"bankname",
							"status"
						]);
						business_mapping[0].bank_name = bankData.bankname;
						business_mapping_data = business_mapping[0];
					}
					if (element.branch_id) {
						banktblData = await BanktblRd.findOne({id: element.branch_id}).select("branch");
						element.branch_id = banktblData ? banktblData.branch : "";
					}
					imd_data = (await IMDDetailsRd.findOne({loan_id: element.id})) || {};
					if (imd_data && imd_data.imd_paid_by && imd_data.imd_paid_by !== "Others") {
						dirName = await Director.findOne({id: imd_data.imd_paid_by}).select([
							"dfirstname",
							"dlastname"
						]);
						imd_data.imd_paid_by = dirName.dfirstname + " " + dirName.dlastname;
					}

					const data_json = [];
					for (const product_data of json_data) {
						let fieldData = {};
						if (
							(product_data.section_name === "Co-Applicant Details" ||
								product_data.section_name === "Co-Applicant Basic Details" ||
								product_data.section_name === "Co-Applicant Address Details") &&
							product_data.isApplicant === 0
						) {
							fieldData = await fieldsMap(product_data.fields, co_applicant_data);

						}
						if (product_data.section_name == "Co-Applicant Address Details") {
							let doc_data = [];
							co_applicant_data.forEach((dirElement) => {
								console.log(dirElement.docDetails);
								doc_data.push(dirElement.docDetails);
								product_data["coApp_address_doc_details"] = doc_data;
							});
						}
						if (
							product_data.section_name === "Co-applicant Employment Details" &&
							product_data.isApplicant === 0
						) {
							fieldData = await fieldsMap(product_data.fields, co_applicant_emp_details);
						}
						if (
							product_data.section_name == "Applicant Employment Details" && product_data.sub_section_name == "Income Details"
						) {
							fieldData = await fieldsMap(product_data.fields, applicant_income_data);
						}
						if (
							product_data.isApplicant === 0 &&
							product_data.sub_section_name == "Income Details"
						) {
							fieldData = await fieldsMap(product_data.fields, co_applicant_income_data);
						}
						if (product_data.sub_section_name === "Details of the Property Offered as Collateral") {
							fieldData = await fieldsMap(product_data.fields, loan_assets_data);
						}
						if (product_data.section_name === "Collateral Details" &&
							product_data.sub_section_name !== "Details of the Property Offered as Collateral") {
							fieldData = await fieldsMap(product_data.fields, loan_json);
						}
						if (product_data.section_name === "Bank Details") {
							fieldData = await fieldsMap(product_data.fields, loan_financial);
						}
						if (product_data.section_name === "Reference Details") {
							fieldData = await fieldsMap(product_data.fields, loan_references);
						}
						// if (busData.table == "business_shareholder") {
						// 	fieldData = await fieldsMap(product_data.fields , business_share_holder_data);
						// }
						if (product_data["section_name"] == "EMI Details" || product_data.section_name == "Current Obligation Details") {
							fieldData = await fieldsMap(product_data.fields, emiDetails);
						}
						if (product_data.section_name === "Power of Attorney Details") {
							fieldData = await fieldsMap(product_data.fields, poa_details);
						}
						product_data.fields.map((busData) => {
							if (busData.table == "business") {
								fieldData[busData.name] = element.business_id[busData.key]
									? element.business_id[busData.key]
									: "";
							}
							if (
								!product_data.isApplicant &&
								product_data.isApplicant !== 0 &&
								busData.table == "director"
							) {
								fieldData[busData.name] = applicant_details[busData.key]
									? applicant_details[busData.key]
									: "";
								if (
									product_data.section_name == "Applicant Address Details" ||
									product_data.sub_section_name == "Present Address"
								) {
									product_data["address_doc_details"] = applicant_details.docDetails || [];
								}
							}
							if (
								product_data.section_name === "Applicant Employment Details" &&
								busData.table == "Employment_details"
							) {
								fieldData[busData.name] =
									applicant_emp_details && applicant_emp_details[busData.key]
										? applicant_emp_details[busData.key]
										: "";
							}
							if (product_data.section_name === "Applicant Employment Details" &&
								product_data.sub_section_name === "Employment Address Details") {
								fieldData[busData.name] =
									applicant_emp_details && applicant_emp_details[busData.key]
										? applicant_emp_details[busData.key]
										: "";
							}
							if (
								product_data.isApplicant === 0 &&
								busData.table == "director" &&
								(product_data.section_name !== "Co-Applicant Details" ||
									product_data.section_name !== "Co-Applicant Basic Details" ||
									product_data.section_name !== "Co-Applicant Address Details")
							) {
								fieldData[busData.name] = garantor_data[busData.key] ? garantor_data[busData.key] : "";
							}
							if (busData.table == "loanrequest") {
								fieldData[busData.name] = element[busData.key] ? element[busData.key] : "";
							}
							if (product_data.id && busData.table == "loanrequest") {
								fieldData[busData.name] = element.otp_auth[busData.key]
									? element.otp_auth[busData.key]
									: "";
							}
							if (product_data.sub_section_name == "Estimated Fund Requirements") {
								fieldData[busData.name] = Object.keys(estimated_fund).length > 0 && estimated_fund[busData.key]
									? estimated_fund[busData.key]
									: "";
							}
							if (product_data.sub_section_name == "Source to Meet Fund Requirements") {
								fieldData[busData.name] = Object.keys(source_fund).length > 0 && source_fund[busData.key]
									? source_fund[busData.key]
									: "";
							}
							if (product_data.section_name == "IMD Details" && busData.table == "IMD_details") {
								fieldData[busData.name] =
									imd_data && imd_data[busData.key] ? imd_data[busData.key] : "";
							}
							if (product_data.aid == 1 && busData.table == "businessaddress") {
								fieldData[busData.name] = present_address[busData.key]
									? present_address[busData.key]
									: "";
							}
							if (product_data.aid == 2 && busData.table == "businessaddress") {
								fieldData[busData.name] = parmanent_address[busData.key]
									? parmanent_address[busData.key]
									: "";
							}
							if (busData.table == "white_label_solution") {
								fieldData[busData.name] = logo ? logo : "";
								product_data.terms_condition = loanProductDetails.terms_conditions_url
									? JSON.parse(loanProductDetails.terms_conditions_url)
									: "";
							}
							if (busData.table == "loan_document") {
								(applicant_document = []), (coApplicantdata = []);
								element.loan_document.forEach((docDetails) => {
									if (coApplicantId.includes(docDetails.directorId)) {
										coApplicantdata.push(docDetails);
									} else {
										applicant_document.push(docDetails);
									}
								});
								doc_group = _.groupBy(coApplicantdata, (co_app_did) => co_app_did.directorId);
								if (busData.name == "Applicant Document Upload") {
									fieldData[busData.name] = applicant_document;
								}
								if (busData.name == "Co-applicant Document Upload") {
									fieldData[busData.name] = doc_group;
								}
								fieldData.document_list = doc_list;
								if (busData.name == "Loan document Details") {
									docObj = {
										"Loan document Details": applicant_document,
										"Co-Applicant Loan document Details": doc_group,
										document_list: doc_list
									};
									fieldData = docObj;
								}
							}
							if (busData.table == "business_mapping") {
								fieldData[busData.name] = business_mapping_data[busData.key]
									? business_mapping_data[busData.key]
									: "";
							}
							product_data.fields = fieldData;
						});
						product_data.fields = fieldData;
						if (data_json.includes(fieldData) === false) {
							data_json.push(product_data);
						}
					}
					// return res.ok(data_json);
					updateData = {
						userid: element.business_id.userid,
						bucket,
						region
					};
					const param = {
						Bucket: bucket,
						Key: `users_${element.business_id.userid}/${element.loan_ref_id}_pdf.json`,
						Body: JSON.stringify(data_json),
						ContentType: "application/json"
					};
					await s3.upload(param, (err, data) => {
						if (err) {
							console.log(err);
						}
						updateData.filePath = data.key;
						data1 = element.authentication_data ? JSON.parse(element.authentication_data) : {};
						data1["s3_data"] = updateData;
						Loanrequest.update({id: element.id})
							.set({authentication_data: JSON.stringify(data1)})
							.fetch()
							.then((res) => {
								console.log(res);
							});
					});
				}
			}
		}
		return res.ok({
			status: "ok",
			loan_details: loanData
		});
	},
	application_json_regeneration: async function (req, res) {
		const {loan_id, loan_ref_id} = req.allParams();
		if (!loan_id && !loan_ref_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		let whereCondition;
		if (loan_id) whereCondition = {id: loan_id};
		if (loan_ref_id) whereCondition = {loan_ref_id};
		const loanRequestDataFetch = await LoanrequestRd.findOne(whereCondition)
			.populate("loan_document", {doctype: sails.config.application_pdf_doc_type, status: "active"});
		if (!loanRequestDataFetch) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		const parseData = loanRequestDataFetch.authentication_data ?
			JSON.parse(loanRequestDataFetch.authentication_data) : {};
		if (!parseData) {
			return res.ok({
				status: "nok",
				message: "Application JSON not found for this loan."
			});
		}
		if (loanRequestDataFetch.loan_document.length === 0) {
			return res.ok({
				status: "nok",
				message: "Application PDF not found for this loan."
			});
		}
		let url, method = "GET";
		if (loanRequestDataFetch.white_label_id == sails.config.white_label_id_muthoot) {
			url = `${sails.config.muthoot_application_json_url}?loan_ref_id=${loan_ref_id}&retrigger=yes`;
		}
		else {
			await LoanDocument.update({id: loanRequestDataFetch.loan_document[0].id})
				.set({
					status: "inactive"
				});
			url = `${sails.config.json_pdf_cron_url}?loan_ref_id=${loan_ref_id}&retrigger=yes`;
		}
		json_cron_apiRes = await sails.helpers.sailstrigger(url, "", {}, method);
		if (json_cron_apiRes) parsedRes = JSON.parse(json_cron_apiRes);
		return res.ok({
			status: "ok",
			message: "Request accepted for Application JSON and PDF regeneration.",
			response: parsedRes
		});
	}
};
async function doc_type(userid, businesstype, loan_product_id, incom_typeId, request_type, white_label_id) {
	const usersData = await Users.findOne({id: userid});
	usersData.loggedInWhiteLabelID = white_label_id;
	token = await new SignJWT({subject: "uuid", user: usersData})
		.setProtectedHeader({alg: "EdDSA"})
		.setExpirationTime("30m")
		.sign(private_key);
	let dataRes;
	header = {
		authorization: `Bearer ${token}`
	};
	if (request_type == "Applicant_doc_type") {
		let applicant_url = sails.config.doctype_url.documentTypes_url;
		method = "POST";
		body = {
			business_type: businesstype,
			loan_product: loan_product_id
		};
		dataRes = await sails.helpers.sailstrigger(
			applicant_url,
			JSON.stringify(body),
			header,
			method
		);
	}
	if (request_type == "Co_aplicant_doc_type") {
		let coApp_url = `${sails.config.doctype_url.coApplicant_doctype}?income_type=${incom_typeId}`;
		method = "GET";
		dataRes = await sails.helpers.sailstrigger(coApp_url, "", header, method);
	}
	return dataRes;
}
async function directorDetails(business_id, userid, white_label_id, docDataArray) {
	const dataRes = {
		applicant_details: {},
		applicant_emp_details: {},
		applicant_income_data: [],
		garantor_data: {},
		coApplicantId: [],
		co_applicant_income_data: [],
		co_applicant_data: [],
		co_app_doc: {},
		co_applicant_emp_details: []
	};
	director = await Director.find({business: business_id});
	if (director.length > 0) {
		for (const dirData of director) {
			dirData.daadhaar = dirData.daadhaar ? dirData.daadhaar.replace(/\d(?=\d{4})/g, "*") : "";
			dirData.docDetails = await LoanDocumentDetailsRd.find({
				did: dirData.id,
				classification_type: ["aadhaar", "voter", "passport", "dl", "pan", "others"],
				doc_request_type: "loan"
			});
			const uploadDocData = docDataArray.find((docDataArray) => docDataArray.did == dirData.id);
			dirData.docDetails.push({uploaded_doc_name: uploadDocData || []});
			if (dirData.isApplicant == 1) {
				dirData.ddob = moment(dirData.ddob).format("DD-MM-YYYY");
				dataRes.applicant_details = dirData;
				dataRes.applicant_emp_details = await EmploymentDetailsRd.findOne({director_id: dirData.id});
				const incomeData = await IncomeData.findOne({business_id: business_id, director_id: dirData.id});
				dataRes.applicant_income_data.push(incomeData);
			} else {
				dataRes.garantor_data = dirData;
				co_applicant_emp_details = await EmploymentDetailsRd.findOne({director_id: dirData.id});
				dataRes.co_applicant_emp_details.push(co_applicant_emp_details);
				dirData.name = dirData.dfirstname + " " + dirData.dlastname;
				dataRes.coApplicantId.push(dirData.id);
				incomeData = await IncomeData.findOne({business_id: business_id, director_id: dirData.id});
				if (dirData.customer_picture) {
					dirData.customer_picture.coapp_profile_data = JSON.parse(dirData.customer_picture);
				}
				dataRes.co_applicant_income_data.push(incomeData);
				if (dirData.income_type == "salaried") {
					dirData.incom_typeId = 7;
					dirData.income_name = "Net Monthly Income";
					dirData.income_value =
						incomeData && incomeData.net_monthly_income ? incomeData.net_monthly_income : "";
				}
				if (dirData.income_type == "business") {
					dirData.incom_typeId = 1;
					dirData.income_name = "Gross Total Income";
					dirData.income_value = incomeData && incomeData.gross_income ? incomeData.gross_income : "";
				}
				if (dirData.income_type == "noIncome") {
					dirData.incom_typeId = 0;
					dirData.income_name = "Net Monthly Income";
					dirData.income_value = "No Income";
				}
				dirData.ddob = moment(dirData.ddob).format("DD-MM-YYYY");
				dataRes.co_applicant_data.push(dirData);
				const coApp_doctype_data = await doc_type(userid, "", "", dirData.incom_typeId, "Co_aplicant_doc_type", white_label_id);
				if (coApp_doctype_data.status !== "nok") {
					parse_coApp_data = JSON.parse(coApp_doctype_data);
					dataRes.co_app_doc[dirData.id] = parse_coApp_data.data[0];
				}
			}
		}
	}
	return dataRes;
}
function fieldsMap(feilds, data) {
	const arrayData = [];
	for (let j = 0; j < data.length; j++) {
		temp = {};
		feilds.forEach((i) => {
			temp[i.name] = data[j] && data[j][i.key] ? data[j][i.key] : "";
		});
		arrayData.push(temp);
	}
	return arrayData;
}
