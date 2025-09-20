const reqParams = require("../helpers/req-params"),
	Excel = require("exceljs"),
	AWS = require("aws-sdk"),
	crisilsqs = require("../helpers/crisil-sqs");

module.exports = {
	getUsersList: async function (req, res) {
		const userType = req.param("userType"),
			params = req.allParams();
		fields = ["userType"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		whereCondition = {
			status: "active",
			usertype: userType,
			white_label_id: req.user.loggedInWhiteLabelID,
			state: req.user["state"],
			city: req.user["city"],
			user_sub_type: "Credit"
		};

		const userData = await UsersRd.find({
			select: ["id", "name", "usertype", "user_sub_type"],
			where: whereCondition
		});

		if (userData.length > 0) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				data: userData
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.res.noDataAvailable
			});
		}
	},

	getAnalystsList: async function (req, res) {
		const loan_id = req.param("loanId");
		if (!loan_id) {
			return res.badRequest({
				status: "nok",
				message: "Loan ID is missing. Please check"
			});
		}
		const whiteLabelData = await WhiteLabelSolutionRd.findOne({
			select: ["assignment_type"],
			where: {
				id: req.user.loggedInWhiteLabelID
			}
		});
		let condition = {};
		if (whiteLabelData.assignment_type.additional_assignment) {
			arrData = whiteLabelData.assignment_type.additional_assignment.assignment[0];
			condition = {
				usertype: arrData.usertype,
				user_sub_type: arrData.user_subtype[0],
				white_label_id: req.user.loggedInWhiteLabelID,
				status: "active"
			};
			if (arrData.region == "Yes") {
				const region = await ViewloanRd.findOne({id: loan_id}).select("region_id");
				user_ids = await LenderRegionMappingRd.find({region_id: region.region_id}).select("user_id");
				ids = user_ids.map(data => data.user_id);
				condition.id = {in: ids};
			}
			else if (arrData.state == "Yes") {
				condition.state = req.user.state;
			}
			else if (arrData.city == "Yes") {
				condition.city = req.user.city;
			}
			else if (arrData.branch == "Yes") {
				condition.branch_id = req.user.branch_id;
			}
		} else {
			condition = {
				usertype: sails.config.analyst.userType,
				user_sub_type: sails.config.analyst.user_sub_type,
				white_label_id: req.user.loggedInWhiteLabelID,
				status: "active"
			};
		}
		const userData = await UsersRd.find({
			select: ["id", "name"],
			where: condition
		});

		if (userData.length > 0) {
			return res.ok({
				status: "ok",
				message: "Analyst users listed successfully",
				data: userData
			});
		}
		return res.ok({
			status: "nok",
			message: "No analyst users found"
		});
	},

	getInstitutionList: async function (req, res) {
		const condition = {
			status: "active",
			usertype: "CA",
			white_label_id: req.user.loggedInWhiteLabelID,
			is_corporate: 1
		},
			userData = await UsersRd.find({
				select: ["id", "name"],
				where: condition
			});
		if (userData.length > 0) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				data: userData
			});
		}
		return res.ok({
			status: "nok",
			message: sails.config.res.noDataAvailable
		});
	},

	changeStatusTLtoAR: async function (req, res) {
		//235 TL Review
		//237 Analyst Review
		//status change from TL review to Analyst review
		const {loanId, comments, userid, comment_ref_id, change_analyst} = req.allParams();

		params = req.allParams();
		fields = ["loanId", "userid"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanrequestData = await LoanrequestRd.findOne({id: loanId}).select(["remarks"]);
		if (!loanrequestData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		loanbankData = await LoanBankMappingRd.findOne({loan_id: loanId});
		const dateTime = await sails.helpers.dateTime();
		if (loanrequestData && !loanbankData) {
			const commentJson = {
				userId: req.user.id,
				type: "Comments",
				message: comments,
				assigneeId: userid,
				assignedTo: userid,
				assigned_by: req.user.name,
				comment_ref_id
			};
			let remarks = {};
			if (loanrequestData.remarks) {
				const parseData = JSON.parse(loanrequestData.remarks);
				parseData[dateTime] = commentJson;
				remarks = parseData;
			} else {
				remarks[dateTime] = commentJson;
			}
			await Loanrequest.updateOne({id: loanId})
				.set({remarks: JSON.stringify(remarks), assignment_additional: userid});
			return res.ok({
				status: "ok",
				message: sails.config.successRes.dataUpdated
			});
		} else if ((loanbankData && loanbankData.loan_bank_status == 9 && loanbankData.loan_borrower_status == 2) || (change_analyst)) {
			let allUsers = userid.toString();
			if (loanbankData.assigned_extended_ids) {
				arrayData = loanbankData.assigned_extended_ids.split(",");

				if (arrayData.includes(userid.toString())) {
					allUsers = loanbankData.assigned_extended_ids;
				} else {
					allUsers = loanbankData.assigned_extended_ids + "," + userid.toString();
				}
			}
			let updateData = {notification_status: "yes"};
			if (change_analyst){
				updateData.assigned_extended_ids = allUsers;
			} else {
				updateData = {
					... updateData,
					loan_bank_status: 12,
					loan_borrower_status: 10,
					meeting_flag: 0,
					assigned_extended_ids: allUsers
				};
			}
			const loanbankDATA = await LoanBankMapping.updateOne({
				loan_id: loanId
			}).set(updateData);

			if (comments) {
				await LoanStatusComments.create({
					loan_bank_id: loanbankDATA.id,
					user_id: req.user.id,
					user_type: "Lender",
					comment_text: comments,
					lender_status_id: 24,
					created_time: dateTime,
					created_timestamp: dateTime,
					assignee_id: userid,
					comment_ref_id
				});
			}

			return res.ok({
				status: "ok",
				message: sails.config.successRes.dataUpdated
			});
		} else {
			return res.ok({
				status: "nok",
				message: "Only TL Review loans can be moved to Analyst Review"
			});
		}
	},

	changeStatusARtoTL: async function (req, res) {
		//235 TL Review
		//237 Analyst Review
		//status change from Analyst review to TL Review
		const {loanId, comments, comment_ref_id} = req.allParams();

		params = req.allParams();
		fields = ["loanId"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanbankData = await LoanBankMappingRd.findOne({loan_id: loanId});
		if (!loanbankData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}

		const dateTime = await sails.helpers.dateTime();
		if (loanbankData.loan_bank_status == 12 && loanbankData.loan_borrower_status == 10) {
			const loanbankDATA = await LoanBankMapping.updateOne({
				loan_id: loanId
			}).set({
				loan_bank_status: 9,
				loan_borrower_status: 2,
				meeting_flag: 0,
				notification_status: "yes"
			});

			if (comments) {
				await LoanStatusComments.create({
					loan_bank_id: loanbankDATA.id,
					user_id: req.user.id,
					user_type: "Lender",
					comment_text: comments,
					lender_status_id: 24,
					created_time: dateTime,
					created_timestamp: dateTime,
					assignee_id: userid,
					comment_ref_id
				});
			}

			return res.ok({
				status: "ok",
				message: sails.config.successRes.dataUpdated
			});
		} else {
			return res.ok({
				status: "nok",
				message: "Only Analyst Review Loans can be moved to TL Review"
			});
		}
	},

	generateReport: async function (req, res) {
		//Change status from TL Review to Report Generated
		//call python api  to generate report

		const {loanId} = req.allParams();

		params = req.allParams();
		fields = ["loanId"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		// const datetime = await sails.helpers.dateTime(),
		// 	loanrequestData = await LoanrequestRd.findOne({id: loanId})
		// 		.populate("loan_document", {where: {doctype: sails.config.crisil_word_doc_type_id, status: "active"}}),
		let loanbankData = await LoanBankMappingRd.findOne({loan_id: loanId});
		if (!loanbankData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		// let {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({id: loanrequestData.white_label_id}).select(["s3_name", "s3_region"]);
		// if (!loanbankData || !loanrequestData) {
		// 	return res.badRequest(sails.config.res.invalidLoanId);
		// }
		// if (loanrequestData.loan_document.length === 0) {
		// 	return res.badRequest(sails.config.res.documentNotUpload);
		// }
		if (
			(loanbankData.loan_bank_status == 9 && loanbankData.loan_borrower_status == 2) ||
			(loanbankData.loan_bank_status == 12 && loanbankData.loan_borrower_status == 10)
		) {
			// 	const {id, loan, user_id, business_id, doc_name, uploaded_doc_name, directorId} = loanrequestData.loan_document[0],
			// 		url = sails.config.convert_word_to_pdf,
			// 		method = "POST",
			// 		body = {
			// 			loan_id: loan,
			// 			user_id,
			// 			doc_name,
			// 			uploaded_doc_name,
			// 			s3_name,
			// 			s3_region
			// 		},
			// 		python_api_call = await sails.helpers.axiosApiCall(url, body, {}, method);
			// 	if (python_api_call.data.status_code !== "200") {
			// 		return res.badRequest(python_api_call.data);
			// 	}
			// 	const apiResponse = python_api_call.data.response,
			// 		data_split = apiResponse.uploaded_doc_name.split("/");
			//  await LoanDocument.update({id}).set({status : "inactive"});
			//  const insert_loan_document = await LoanDocument.create({
			// 			loan : apiResponse.loan_id,
			// 			business_id,
			// 			user_id,
			// 			uploaded_doc_name : data_split[1],
			// 			doc_name : data_split[1],
			// 			status : "active",
			// 			doctype : sails.config.crisil_pdf_doc_type_id,
			// 			ints : datetime,
			// 			on_upd : datetime,
			// 			directorId : directorId || 0
			//  }).fetch(),
			const loanbankDATA = await LoanBankMapping.updateOne({
				id: loanbankData.id
			})
				.set({
					loan_bank_status: 12,
					loan_borrower_status: 12,
					notification_status: "yes"
				})
				.fetch(),
				loanSanctionCreate = await LoanSanction.create({
					loan_id: loanId,
					loan_bank_mapping: loanbankData.id,
					userid: req.user.id,
					created_at: datetime,
					sanction_status: "Reports Generated"
				}).fetch();
			sails.config.successRes.dataUpdated.data = loanbankDATA;
			return res.ok(sails.config.successRes.dataUpdated);
		} else {
			return res.ok({
				status: "nok",
				message: "Only TL & Analyst Review loans can be moved to Reports Generated"
			});
		}
	},

	approveLoan: async function (req, res) {
		const {loanId} = req.allParams();

		params = req.allParams();
		fields = ["loanId"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanbankData = await LoanBankMappingRd.findOne({loan_id: loanId});
		if (!loanbankData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}

		const dateTime = await sails.helpers.indianDateTime();
		if (
			(loanbankData.loan_bank_status == 9 && loanbankData.loan_borrower_status == 2) ||
			(loanbankData.loan_bank_status == 12 && loanbankData.loan_borrower_status == 10)
		) {
			await LoanBankMapping.updateOne({loan_id: loanId}).set({lender_status: 23, notification_status: "yes"});
			await LoanStatusComments.create({
				loan_bank_id: loanbankData.id,
				user_id: req.user.id,
				user_type: "Lender",
				comment_text: "Approved",
				lender_status_id: 23,
				created_time: dateTime,
				created_timestamp: dateTime
			});

			return res.ok({
				status: "ok",
				message: "Loan Approved"
			});
		} else {
			return res.ok({
				status: "nok",
				message: "Unable to approve loan"
			});
		}
	},

	crisilExcel: async function (req, res) {
		let url = sails.config.bulk_upload_template;

		return res.ok({
			status: "ok",
			url
		});
	},
	uploadCrisilExcel: async function (req, res) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel});
		let {doc_type_id} = req.allParams(),
			userRecord,
			bucket = whitelabelsolution[0]["s3_name"];
		const region = whitelabelsolution[0]["s3_region"];
		userid = req.param("userid") || req.param("userId") || req.user.id;
		if (!userid) {
			return res.badRequest({status: "nok", message: "User id is missing"});
		}
		bucket = bucket + "/users_" + userid;
		const document = req.file("document");
		(allowedType = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]),
			(allowedExtension = ["xlsx", "XLSX"]),
			(doctype = document._files[0].stream);
		extension = doctype.filename.split(".").pop();
		if (allowedType.indexOf(doctype.headers["content-type"]) === -1 || allowedExtension.indexOf(extension) === -1) {
			return res.badRequest({
				status: "nok",
				message: `FileType ${doctype.headers["content-type"]} is not allowed to upload`
			});
		}

		const uploadFile = await sails.helpers.s3Upload(document, bucket, region);
		if (!uploadFile || uploadFile.length == 0) {
			return res.send({
				status: "nok",
				message: "Unable to upload file due to network slowdown or network failure. Please try again."
			});
		}
		if (uploadFile) {
			const data = {
				user_id: userid,
				doc_type_id,
				doc_name: uploadFile[0].fd,
				uploaded_doc_name: uploadFile[0].filename,
				status: "active",
				white_label_id: user_whitelabel,
				created: await sails.helpers.dateTime(),
				origin: "namastecredit"
			};
			userRecord = await UserDocument.create(data).fetch();
		}
		const logService = await sails.helpers.logtrackservice(
			req,
			"loanDocumentUpload",
			document._files[0].stream.filename,
			"loan_document"
		);

		return res.ok({
			status: "ok",
			message: "Successfully uploaded",
			files: uploadFile,
			filepath: {bucket, region},
			userRecord,
			token_id: userRecord.id
		});
	}
};
