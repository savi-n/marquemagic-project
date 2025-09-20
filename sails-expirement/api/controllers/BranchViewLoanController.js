/**
 * BranchViewLoanController.js
 *
 * @description :: Server-side logic for managing AssetTypeMappingCersai
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require("moment"),
	momentIndia = require("moment-timezone");

module.exports = {
	/**
	 * @api {POST} /branch/viewLoan view Branch loans
	 * @apiName view Branch loans
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/viewLoan
	 * @apiParam {String} ncStatus
	 * @apiParam {String} filterBy ['week','month','year']
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 * @apiSuccess {Object[]} loanList
	 *
	 */
	view: async function (req, res, next) {
		const ncStatus = req.param("ncStatus"),
			filterBy = req.param("filterBy"),
			branchId = req.user.branch_id,
			userType = req.user.usertype,
			whiteLabelId = req.user.loggedInWhiteLabelID,
			whereCondition = {};
		whereCondition.white_label_id = whiteLabelId;

		const dateTime = await sails.helpers.indianDateTime();
		let startdate = moment(dateTime).subtract(30, "days").format("YYYY-MM-DD HH:mm:ss").toString();
		if (filterBy === "week") {
			startdate = moment(dateTime).subtract(7, "days").format("YYYY-MM-DD HH:mm:ss").toString();
		} else if (filterBy === "year") {
			startdate = moment(dateTime).subtract(365, "days").format("YYYY-MM-DD HH:mm:ss").toString();
		}
		whereCondition.RequestDate = {
			">=": startdate
		};

		if (userType === "Branch") {
			whereCondition.branch_id = branchId;
		} else if (userType === "Credit") {
			// if (req.user.user_sub_type === "AGM" || req.user.user_sub_type === "DGM") {
			const sectionData = await UsersSectionRd.find({
				select: ["section_ref"],
				where: {
					user_id: req.user.id
				}
			}),
				sectionId = [];
			for (const i in sectionData) {
				sectionId.push(sectionData[i].section_ref);
			}
			whereCondition.Section_Ref = sectionId;
			// } else {
			// 	const branchDetails = await BanktblRd.findOne({id: branchId});
			// 	whereCondition.Section_Ref = branchDetails.section_reference_id;
			// }
		}

		if (ncStatus) {
			const NcStatus = await NcStatusManageRd.findOne({white_label_id: whiteLabelId, name: ncStatus});
			if (!NcStatus) {
				return res.badRequest(sails.config.res.NCStatusNotSet);
			}

			if (NcStatus.status1 && NcStatus.status1 != "0") {
				whereCondition.loan_status_id = NcStatus.status1;
			}

			if (NcStatus.status2 && NcStatus.status2 != "0") {
				whereCondition.loan_sub_status_id = NcStatus.status2;
			}

			if (NcStatus.status3 && NcStatus.status3 != "0") {
				whereCondition.loan_bank_status = NcStatus.status3;
			}

			if (NcStatus.status4 && NcStatus.status4 != "0") {
				whereCondition.loan_borrower_status = NcStatus.status4;
			}

			// if (NcStatus.status5)
			//     whereCondition.meeting_flag = NcStatus.status5
			if (NcStatus.status6 && NcStatus.status6 != "0") {
				whereCondition.meeting_flag = NcStatus.status6;
			}
			if (NcStatus.uw_doc_status && NcStatus.uw_doc_status != "0") {
				whereCondition.remarks_val = NcStatus.uw_doc_status;
			}
		}
		let loanList;
		if (sails.config.nc_status.name.includes(ncStatus) === true) {
			loanList = await CubViewFifoRd.find(whereCondition);
		} else {
			loanList = await CubViewRd.find(whereCondition).sort("modified_on DESC");
		}
		loanList.forEach((element) => {
			if (element["pre_eligiblity"]) {
				if (element["pre_eligiblity"]["minimumPreEligiblity"] < 0) {
					element["pre_eligiblity"]["minimumPreEligiblity"] = 0;
				}
			}
		});
		const loanListWithAssignmentData = [];
		await Promise.all(
			loanList.map(async (loan) => {
				const loanId = loan.id,
					result = {},
					assignmentLog = await AssignmentLogRd.find({
						action_event: "loan_assignment",
						action_ref_id: loanId
					})
						.sort("upts DESC")
						.limit(1);
				if (assignmentLog.length === 1) {
					const userData = await UsersRd.findOne({
						select: ["id", "name", "usertype", "user_sub_type"],
						where: {
							id: assignmentLog[0].event_ref_id
						}
					});
					result.assignmentLog = assignmentLog[0];
					result.assignmentLog.userData = userData;
					try {
						const assignedToJson = JSON.parse(assignmentLog[0].remarks),
							assignedToUserId = assignedToJson.assignedTo,
							assignedToUserData = await UsersRd.findOne({
								select: ["id", "name", "usertype", "user_sub_type"],
								where: {
									id: assignedToUserId
								}
							});
						result.assignmentLog.assignedToUserData = assignedToUserData;
						loan.assignmentLog = result.assignmentLog;
						loan.loanBankMapping = await LoanBankMappingRd.find({
							loan_id: loanId
						});
						if (
							req.user.usertype == "Credit" &&
							loan.loanBankMapping.length > 0 &&
							loan.loanBankMapping[0].bank_assign_date
						) {
							loan.date = loan.loanBankMapping[0].bank_assign_date;
						} else {
							loan.date = null;
						}

						loanListWithAssignmentData.push(loan);
					} catch (err) {
						console.error(err);
					}
				} else {
					loan.assignmentLog = null;
					loan.loanBankMapping = await LoanBankMappingRd.find({
						loan_id: loanId
					});

					if (
						req.user.usertype == "Credit" &&
						loan.loanBankMapping.length > 0 &&
						loan.loanBankMapping[0].bank_assign_date
					) {
						loan.date = loan.loanBankMapping[0].bank_assign_date;
					} else {
						loan.date = null;
					}
					loanListWithAssignmentData.push(loan);
				}
			})
		);
		let sorted = [];
		if (sails.config.nc_status.name.includes(ncStatus) === true) {
			sorted = loanListWithAssignmentData.sort((a, b) => {
				return a.bank_assign_date - b.bank_assign_date;
			});
		} else {
			sorted = loanListWithAssignmentData;
		}
		if (req.query.page && req.query.limit) {
			const indexOfLast = req.query.page * req.query.limit;
			const indexOfFirst = indexOfLast - req.query.limit;
			return res.send({
				statusCode: "NC200",
				message: "success",
				loanList: sorted.slice(indexOfFirst, indexOfLast)
			});
		}
		return res.send({
			statusCode: "NC200",
			message: "success",
			loanList: sorted
		});
	},

	/**
	 * @api {GET} /getAssignmentData getAssignmentData
	 * @apiName getAssignmentData
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/getAssignmentData
	 * @apiParam {String} loanId
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	getAssignmentData: async function (req, res, next) {
		const loanId = req.param("loanId"),
			result = {};
		if (!loanId) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const assignmentLog = await AssignmentLogRd.find({
			action_event: "loan_assignment",
			action_ref_id: loanId
		})
			.sort("upts DESC")
			.limit(1);
		if (assignmentLog.length === 1) {
			const userData = await UsersRd.findOne({
				select: ["id", "name", "usertype", "user_sub_type"],
				where: {
					id: assignmentLog[0].event_ref_id
				}
			});
			result.assignmentLog = assignmentLog[0];
			result.assignmentLog.userData = userData;
			try {
				const assignedToJson = JSON.parse(assignmentLog[0].remarks),
					assignedToUserId = assignedToJson.assignedTo,
					assignedToUserData = await UsersRd.findOne({
						select: ["id", "name", "usertype", "user_sub_type"],
						where: {
							id: assignedToUserId
						}
					});
				result.assignmentLog.assignedToUserData = assignedToUserData;
			} catch (err) {
				console.error(err);
				return res.status(500).send({message: sails.config.msgConstants.noAssignmentToUSerData});
			}
		}
		return res.send({statusCode: "NC200", message: "success", result: result});
	},

	/**
	 * @api {GET} /branch/getDirectorData getDirectorData
	 * @apiName getDirectorData
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/getDirectorData
	 * @apiParam {String} loanId
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	getDirectorData: async function (req, res, next) {
		const loanId = req.param("loanId");
		if (!loanId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanData = await LoanrequestRd.findOne({
			id: loanId
		});

		if (!loanData || !loanData.id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const directorDetails = await DirectorRd.find({
			business: loanData.business_id
		});

		return res.send({statusCode: "NC200", message: "success", result: directorDetails});
	},

	/**
	 * @api {POST} /branch/reAssigntoPreviousStage reAssigntoPreviousStage
	 * @apiName reAssigntoPreviousStage
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/reAssigntoPreviousStage
	 * @apiParam {String} loanId
	 * @apiParam {String} comment
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	reAssigntoPreviousStage: async function (req, res, next) {
		const loanId = req.param("loanId"),
			comments = req.param("comment"),
			dateTime = await sails.helpers.dateTime();
		if (!loanId) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);
		if (loanBankMappingData.length === 1) {
			if (
				loanBankMappingData[0].reassign_nc_comments != null &&
				loanBankMappingData[0].reassign_nc_comments != ""
			) {
				const ncComments = JSON.parse(loanBankMappingData[0].reassign_nc_comments),
					array = Object.keys(ncComments),
					status = ncComments[array[array.length - 1]],
					loanMappingData = {
						loan_bank_status: status.loan_bank_status ? status.loan_bank_status : "0",
						loan_borrower_status: status.loan_borrower_status ? status.loan_borrower_status : "0",
						// lender_status :  status.lender_status ? status.lender_status: "0",
						meeting_flag: status.meeting_flag ? status.meeting_flag : "0"
					},
					setCondition = {
						loan_status_id: status.loan_status_id ? status.loan_status_id : "0",
						loan_sub_status_id: status.loan_sub_status_id ? status.loan_sub_status_id : "0",
						modified_on: dateTime
					};
				await LoanBankMapping.updateOne({loan_id: loanId}).set(loanMappingData);
				await Loanrequest.updateOne({id: loanId}).set(setCondition);

				if (comments) {
					const loanStatusWithLenderData = await LoanStatusWithLenderRd.find({
						select: ["id", "status"],
						where: {
							status: ["Comments"]
						}
					}),
						dateTime = await sails.helpers.indianDateTime();

					await LoanStatusComments.create({
						loan_bank_id: loanBankMappingData[0].id,
						user_id: req.user.id,
						user_type: req.user.usertype,
						comment_text: comments,
						lender_status_id: loanStatusWithLenderData[0].id,
						created_time: dateTime,
						created_timestamp: dateTime
					});
				}
			}
		} else {
			await Loanrequest.updateOne({id: loanId}).set({
				loan_status_id: "1",
				loan_sub_status_id: null,
				modified_on: dateTime
			});
		}
		return res.send({statusCode: "NC200", message: "success"});
	},

	/**
	 * @api {POST} /branch/reAssignLoans reAssignLoans
	 * @apiName reAssignLoans and add comments
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/reAssignLoans
	 * @apiParam {String} loanId loan id
	 * @apiParam {String} reAssignTo name from nc Status table
	 * @apiParam {String} comments comments
	 * @apiParam {String} assignUserId
	 * @apiParam {String} query query
	 * @apiParam {Object[]} recommendation array of strings
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	reAssignLoans: async function (req, res, next) {
		const loanId = req.param("loanId"),
			reAssignTo = req.param("reAssignTo"),
			assignUserId = req.param("assignUserId"),
			comments = req.param("comments"),
			query = req.param("query"),
			recommendation = req.param("recommendation"),
			userId = req.user.id,
			whiteLabelId = req.user.loggedInWhiteLabelID,
			setCondition = {};
		if (!loanId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const date = new Date(),
			dateTime = momentIndia(date)
				.tz("Asia/Kolkata")
				.subtract(12, "minute")
				.format("YYYY-MM-DD HH:mm:ss")
				.toString();

		let remarks = {},
			reAssignStats = {},
			remark_history = {};

		remarks[dateTime] = {
			userId: userId,
			name: req.user.name
		};
		let message = comments || query || recommendation;

		const caseDetails = await CubViewRd.findOne({
			id: loanId
		});
		if (!caseDetails || !caseDetails.id) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		const previousStatus = {
			loan_status_id: caseDetails.loan_status_id,
			loan_sub_status_id: caseDetails.loan_sub_status_id
		};

		let loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);
		const loanMappingData = {};
		if (loanBankMappingData.length === 1) {
			loanBankMappingData = loanBankMappingData[0];
		}
		let NcStatus;
		if (reAssignTo) {
			NcStatus = await NcStatusManageRd.findOne({white_label_id: whiteLabelId, name: reAssignTo});

			if (!NcStatus) {
				return res.badRequest(sails.config.res.NCStatusNotSet);
			}
			report_tat = await sails.helpers.reportTat(assignUserId, req.user.name, loanId, reAssignTo, "", message);
			remarks[dateTime]["reAssignTo"] = reAssignTo;
			remarks[dateTime]["assignedBy"] = req.user.name;
			remarks[dateTime]["assignedAt"] = dateTime;
			setCondition.loan_status_id = NcStatus.status1;
			setCondition.loan_sub_status_id = NcStatus.status2;

			remark_history = {rejected_by_user: req.user.id, ...previousStatus};

			loanMappingData.loan_bank_status = NcStatus.status3 ? NcStatus.status3 : "0";
			loanMappingData.loan_borrower_status = NcStatus.status4 ? NcStatus.status4 : "0";
			// loanMappingData.lender_status = NcStatus.status5 ? NcStatus.status5 : "0";
			loanMappingData.meeting_flag = NcStatus.status6 ? NcStatus.status6 : "0";
			// let status3, status4,status6;
			if (caseDetails.loan_bank_status && caseDetails.loan_bank_status != 0) {
				previousStatus.loan_bank_status = caseDetails.loan_bank_status;
			}
			if (caseDetails.loan_borrower_status && caseDetails.loan_borrower_status != 0) {
				previousStatus.loan_borrower_status = caseDetails.loan_borrower_status;
			}
			if (caseDetails.meeting_flag && caseDetails.meeting_flag != 0) {
				previousStatus.meeting_flag = caseDetails.meeting_flag;
			}
			if (loanBankMappingData && loanBankMappingData.id) {
				reAssignStats[dateTime] = {
					userId: userId,
					assignUserId: assignUserId,
					comments: comments,
					...previousStatus
				};

				if (
					loanBankMappingData.reassign_nc_comments === null ||
					loanBankMappingData.reassign_nc_comments === ""
				) {
					reAssignStats = JSON.stringify(reAssignStats);
				} else {
					const jsonRemarks = JSON.parse(loanBankMappingData.reassign_nc_comments);
					jsonRemarks[dateTime] = reAssignStats[dateTime];
					reAssignStats = JSON.stringify(jsonRemarks);
				}
				loanMappingData.reassign_nc_comments = reAssignStats;
			}
		}

		if (loanBankMappingData && loanBankMappingData.id) {
			const loanStatusWithLenderData = await LoanStatusWithLenderRd.find({
				select: ["id", "status"],
				where: {
					status: ["Query", "Comments", "Recommendation"]
				}
			});
			let lenderQueryId, lenderCommentId, lenderRecommendationId;
			for (const i in loanStatusWithLenderData) {
				if (loanStatusWithLenderData[i].status === "Recommendation") {
					lenderRecommendationId = loanStatusWithLenderData[i].id;
				} else if (loanStatusWithLenderData[i].status === "Comments") {
					lenderCommentId = loanStatusWithLenderData[i].id;
				} else if (loanStatusWithLenderData[i].status === "Query") {
					lenderQueryId = loanStatusWithLenderData[i].id;
				}
			}

			if (comments) {
				await LoanStatusComments.create({
					loan_bank_id: loanBankMappingData.id,
					user_id: req.user.id,
					user_type: req.user.usertype,
					comment_text: comments,
					lender_status_id: lenderCommentId,
					created_time: dateTime,
					created_timestamp: dateTime
				});
			}

			if (recommendation && recommendation.length !== 0) {
				await LoanStatusComments.create({
					loan_bank_id: loanBankMappingData.id,
					user_id: req.user.id,
					user_type: req.user.usertype,
					comment_text: JSON.stringify(recommendation),
					lender_status_id: lenderRecommendationId,
					created_time: dateTime,
					created_timestamp: dateTime
				});
			}

			if (query) {
				await LoanStatusComments.create({
					loan_bank_id: loanBankMappingData.id,
					user_id: req.user.id,
					user_type: req.user.usertype,
					comment_text: query,
					lender_status_id: lenderQueryId,
					created_time: dateTime,
					created_timestamp: dateTime
				});
			}

			if (loanMappingData.loan_bank_status) {
				loanMappingData.lender_ref_id = lenderQueryId;

				if (assignUserId) {
					const userData = await UsersRd.findOne({
						select: ["id", "usertype", "lender_id"],
						where: {
							id: assignUserId
						}
					});
					if (userData.usertype === "Credit") {
						loanMappingData.bank_emp_id = assignUserId;
						loanMappingData.bank_id = userData.lender_id;
						loanMappingData.bank_assign_date = dateTime;
						loanMappingData.notification_status = "yes"
						await AssignmentLog.create({
							action_event: "loan_assignment",
							action_ref_id: loanId,
							event_ref_id: userId,
							created_by: userId,
							ints: dateTime,
							upts: dateTime,
							remarks: JSON.stringify({assignedTo: assignUserId, comments: ""})
						});
					}
				}

				await LoanBankMapping.updateOne({loan_id: loanId}).set(loanMappingData);

				// if (reAssignTo.includes("Sanction")) {
				// 	const loanSanctionData = await LoanSanctionRd.findOne({loan_id: loanId});

				// 	if (!loanSanctionData || !loanSanctionData.id) {
				// 		await LoanSanction.create({
				// 			loan_id: loanId,
				// 			loan_bank_mapping: loanBankMappingData.id,
				// 			// san_amount: "",
				// 			// san_interest: "",
				// 			// san_date: "",
				// 			userid: userId,
				// 			amount_um: "Thousand",
				// 			// sanction_process_fee: "",
				// 			created_at: dateTime,
				// 			updated_at: dateTime
				// 		});
				// 	}
				// }
			}
		} else {
			const loanData = await LoanrequestRd.findOne({
				select: ["remarks", "white_label_id", "loan_status_id", "loan_sub_status_id"],
				where: {
					id: loanId
				}
			});
			if (Object.keys(remark_history).length > 0) {
				let remarksHistoryData = {};
				if (loanData.remark_history) {
					remarksHistoryData = JSON.parse(loanData.remark_history);
				}
				remarksHistoryData[dateTime] = remark_history;
				setCondition.remark_history = JSON.stringify(remarksHistoryData);
			}
			if (NcStatus && NcStatus.status1 === 2 && NcStatus.status2 === 8) {
				let whitelabelId;
				const userData = await UsersRd.find({usertype: "Underwriter", user_sub_type: "Lead"});
				_.each(userData, (value) => {
					whitelabelId = value.white_label_id.split(",");
					if (whitelabelId.indexOf(loanData.white_label_id) !== -1) {
						setCondition.assigned_uw = value.id;
					}
				});
				setCondition.assigned_date = moment(dateTime).format("DD-MM-YYYY");
			}

			if (comments) {
				remarks[dateTime]["type"] = "Comments";
				remarks[dateTime]["message"] = comments;
			} else if (recommendation && recommendation.length !== 0) {
				remarks[dateTime]["type"] = "Recommendation";
				remarks[dateTime]["message"] = recommendation;
			} else if (query) {
				remarks[dateTime]["type"] = "Query";
				remarks[dateTime]["message"] = query;
			}

			if (loanData.remarks === null && loanData.remarks != "") {
				remarks = JSON.stringify(remarks);
			} else {
				const jsonRemarks = JSON.parse(loanData.remarks);
				jsonRemarks[dateTime] = remarks[dateTime];
				remarks = JSON.stringify(jsonRemarks);
			}
			setCondition.remarks = remarks;
		}
		setCondition.modified_on = dateTime;
		if (setCondition.remarks || setCondition.loan_status_id) {
			await Loanrequest.updateOne({id: loanId}).set(setCondition);
		}

		return res.send({statusCode: "NC200", message: "success"});
	},

	/**
	 * @api {POST} /updateSanction updateSanction
	 * @apiName updateSanction
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/updateSanction
	 * @apiParam {String} loanId
	 * @apiParam {String} lenderStatusId
	 * @apiParam {String} roi
	 * @apiParam {String} sanctionStatus ["Provisional Sanction", "Final Sanction"]
	 * @apiParam {Object} eligibilityAmount
	 * @apiParam {string} eligibilityAmount.term
	 * @apiParam {string} eligibilityAmount.emi
	 * @apiParam {string} eligibilityAmount.sanctionAmount
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	updateSanction: async function (req, res, next) {
		const loanId = req.param("loanId"),
			userId = req.user.id,
			lenderStatusId = req.param("lenderStatusId"),
			eligibilityAmount = req.param("eligibilityAmount"),
			roi = req.param("roi"),
			sanction_status = req.param("sanctionStatus");

		if (!loanId || !lenderStatusId || !sanction_status) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);
		if (loanBankMappingData.length === 0) {
			return res.send({statusCode: "NC500", message: sails.config.msgConstants.invalidLoanId});
		}

		const dateTime = await sails.helpers.indianDateTime(),
			date = new Date(),
			san_date = momentIndia(date).tz("Asia/Kolkata").subtract(12, "minute").format("MM/DD/YYYY").toString(),
			loanSanctionData = await LoanSanctionRd.findOne({loan_id: loanId}),
			approvalData = await ApprovalLogsRd.find({
				reference_id: loanId,
				reference_type: "loan",
				status: "approved"
			})
				.sort("updated_at DESC")
				.limit(1);

		let finalRoi = null;

		if (!roi) {
			if (approvalData.length === 0) {
				if (!loanBankMappingData[0].interest_rate) {
					return res.send({statusCode: "NC500", message: roiDataNotFound});
				}
				finalRoi = loanBankMappingData[0].interest_rate;
			} else {
				finalRoi = approvalData[0].roi;
			}
		} else {
			finalRoi = roi;
		}

		const sanctionData = {
			san_amount: loanBankMappingData[0].offer_amnt,
			san_date: san_date,
			userid: userId,
			amount_um: loanBankMappingData[0].offer_amnt_um,
			sanction_status: sanction_status
		};

		let sanctionAmount = "";
		try {
			const json = JSON.parse(eligibilityAmount);
			sanctionAmount = json.sanctionAmount;
		} catch (err) {
			console.error(err);
			return res.status(500).send({message: eligibilityAmountParseFailed});
		}

		try {
			const json = JSON.parse(loanBankMappingData[0].pre_sanction_json),
				keys = Object.keys(json);
			let object = null;
			for (const i in keys) {
				if (keys[i] != "eligibilityData") {
					if (object === null) {
						object = keys[i];
					}
					if (!moment(keys[i]).isAfter(moment(object))) {
						object = keys[i];
					}
				}
			}
			const sanctionPreJson = json[object];
			sanctionData.san_amount = Number(sanctionPreJson.sanctionAmount) / 1000;
			sanctionData.amount_um = "Thousand";
			if (!roi) {
				finalRoi = sanctionPreJson.roi;
			}
		} catch (err) {
			console.error(err);
			return res.status(500).send({message: loanBankMappingParseFailed});
		}

		if (sanctionAmount && sanctionAmount != "") {
			sanctionData.san_amount = Number(sanctionAmount) / 1000;
			sanctionData.amount_um = "Thousand";
		}

		if (!loanSanctionData || !loanSanctionData.id) {
			if (sanction_status === "Final Sanction") {
				// sanctionData.updated_at = dateTime;
			}
			sanctionData.loan_id = loanId;
			sanctionData.loan_bank_mapping = loanBankMappingData[0].id;
			sanctionData.created_at = dateTime;
			sanctionData.san_interest = finalRoi;
			await LoanSanction.create(sanctionData);
		} else {
			// sanctionData.updated_at = dateTime;
			if (roi) {
				sanctionData.san_interest = roi;
			}
			await LoanSanction.updateOne({
				id: loanSanctionData.id,
				loan_id: loanId,
				loan_bank_mapping: loanBankMappingData[0].id
			}).set(sanctionData);
		}

		const loanBankUpdateData = {
			lender_status: lenderStatusId
		};

		if (eligibilityAmount) {
			let preSanction = {
				eligibilityData: eligibilityAmount
			};
			if (loanBankMappingData[0].pre_sanction_json === null && loanBankMappingData[0].pre_sanction_json != "") {
				preSanction = JSON.stringify(preSanction);
			} else {
				const jsonRemarks = JSON.parse(loanBankMappingData[0].pre_sanction_json);
				jsonRemarks.eligibilityData = preSanction.eligibilityData;
				preSanction = JSON.stringify(jsonRemarks);
			}

			loanBankUpdateData.pre_sanction_json = preSanction;
		}

		await LoanBankMapping.updateOne({id: loanBankMappingData[0].id}).set(loanBankUpdateData);

		return res.send({statusCode: "NC200", message: "success"});
	},

	/**
	 * @api {GET} /branch/commentList commentList
	 * @apiName commentList
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/commentList
	 * @apiParam {String} loanId
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	commentList: async function (req, res, next) {
		const loanId = req.param("loanId");
		if (!loanId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);

		if (!loanBankMappingData[0] || !loanBankMappingData[0].id) {
			return res.send({statusCode: "NC500", message: "No records Found"});
		}
		const loanStatusData = await LoanStatusCommentsRd.find({loan_bank_id: loanBankMappingData[0].id}),
			loanStatusWithLenderData = await LoanStatusWithLenderRd.find({
				select: ["id", "status"],
				where: {
					status: ["Query", "Comments", "Recommendation"]
				}
			});
		for (const j in loanStatusData) {
			for (const i in loanStatusWithLenderData) {
				if (loanStatusData[j].lender_status_id === loanStatusWithLenderData[i].id) {
					loanStatusData[j].type = loanStatusWithLenderData[i].status;
					break;
				}
			}
			const userDetails = await UsersRd.findOne({
				select: ["name", "user_sub_type"],
				where: {
					id: loanStatusData[j].user_id
				}
			});

			loanStatusData[j].userName = userDetails.name;
			loanStatusData[j].user_sub_type = userDetails.user_sub_type;
		}

		return res.send({statusCode: "NC200", message: "success", commentList: loanStatusData});
	},

	/**
	 * @api {GET} /branch/getUserList getUserList
	 * @apiName getUserList
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/getUserList
	 * @apiParam {String} userType ["Branch", "Credit", "Hierarchy","AllCreditUsers"]
	 * @apiParam {Number} loanId
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	getUserList: async function (req, res, next) {
		const userType = req.param("userType"),
			loanId = req.param("loanId"),
			userId = req.user.id;
		if (!userType || !loanId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanData = await CubViewRd.findOne({
			select: ["id", "branch_id", "Section_Ref", "white_label_id"],
			where: {
				id: loanId
			}
		});

		if (!loanData || !loanData.id || !loanData.branch_id) {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.invalidLoanBranchId
			});
		}
		const branchId = loanData.branch_id,
			sectionRefId = loanData.Section_Ref;

		let userData;
		if (userType === "Branch") {
			userData = await UsersRd.find({
				select: ["id", "name", "usertype", "user_sub_type"],
				where: {
					branch_id: branchId,
					usertype: userType,
					status: "active",
					id: {
						"!=": [userId]
					},
					white_label_id: loanData.white_label_id
				}
			});
		} else if (userType === "Credit") {
			const sectionData = await UsersSectionRd.find({
				select: ["user_id"],
				where: {
					section_ref: sectionRefId
				}
			}),
				userList = [];
			for (const i in sectionData) {
				if (sectionData[i].user_id != userId) {
					userList.push(sectionData[i].user_id);
				}
			}

			userData = await UsersRd.find({
				select: ["id", "name", "usertype", "user_sub_type"],
				where: {
					id: userList,
					status: "active",
					user_sub_type: ["Officer", "Manager"],
					white_label_id: loanData.white_label_id
				}
			});
		} else if (userType === "AllCreditUsers") {
			const sectionData = await UsersSectionRd.find({
				select: ["user_id"],
				where: {
					section_ref: {
						contains: sectionRefId
					}
				}
			}),
				userList = [];
			for (const i in sectionData) {
				if (sectionData[i].user_id != userId) {
					userList.push(sectionData[i].user_id);
				}
			}

			userData = await UsersRd.find({
				select: ["id", "name", "usertype", "user_sub_type"],
				where: {
					id: userList,
					status: "active",
					white_label_id: loanData.white_label_id
				}
			});
		} else if (userType === "Hierarchy") {
			const whereCondition = {
				status: "active",
				white_label_id: loanData.white_label_id
			},
				branchList = await BanktblRd.find({
					select: ["id"],
					where: {
						section_reference_id: sectionRefId
					}
				}),
				branchIDs = [];

			for (const i in branchList) {
				branchIDs.push(branchList[i].id);
			}

			if (req.user.usertype === "Branch" && req.user.user_sub_type === "Officer") {
				whereCondition.usertype = "Branch";
				whereCondition.user_sub_type = "Manager";
				whereCondition.branch_id = branchId;
			} else if (req.user.usertype === "Branch" && req.user.user_sub_type === "Manager") {
				whereCondition.usertype = "Credit";
				whereCondition.user_sub_type = "Officer";
				whereCondition.branch_id = branchIDs;
			} else if (req.user.usertype === "Credit" && req.user.user_sub_type === "Officer") {
				whereCondition.usertype = "Credit";
				whereCondition.user_sub_type = "Manager";
				whereCondition.branch_id = branchIDs;
			} else if (req.user.usertype === "Credit" && req.user.user_sub_type === "Manager") {
				whereCondition.usertype = "Credit";
				whereCondition.user_sub_type = "AGM";
				whereCondition.branch_id = branchIDs;
			} else if (req.user.usertype === "Credit" && req.user.user_sub_type === "AGM") {
				whereCondition.usertype = "Credit";
				whereCondition.user_sub_type = "DGM";
				whereCondition.branch_id = branchIDs;
			}

			userData = await UsersRd.find({
				select: ["id", "name", "usertype", "user_sub_type"],
				where: whereCondition
			}).limit(1);
		}

		return res.send({statusCode: "NC200", message: "success", userList: userData});
	},

	/**
	 * @api {POST} /branch/assignUserToLoan assignUserToLoan
	 * @apiName assignUserToLoan
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/assignUserToLoan
	 * @apiParam {String} loanId
	 * @apiParam {String} assignUserId
	 * @apiParam {String} comment
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	assignUserToLoan: async function (req, res, next) {
		const loanId = req.param("loanId"),
			assignUserId = req.param("assignUserId"),
			comments = req.param("comment") ? req.param("comment") : "",
			userId = req.user.id;

		if (!loanId || !assignUserId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const userData = await UsersRd.findOne({
			select: ["id", "usertype"],
			where: {
				id: assignUserId
			}
		});

		if (!userData || !userData.id || !userData.usertype) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const dateTime = await sails.helpers.indianDateTime();

		if (userData.usertype === "Branch") {
			await Loanrequest.updateOne({id: loanId}).set({
				sales_id: assignUserId,
				modified_on: dateTime
			});
		} else if (userData.usertype === "Credit") {
			// add AO, AGM to the list
			// Might need to update bank_id
			const bankMappingData = await LoanBankMapping.update({loan_id: loanId})
				.set({
					bank_emp_id: assignUserId,
					notification_status: "yes"
				})
				.fetch();
			if (bankMappingData.length === 0) {
				return res.badRequest(sails.config.res.invalidLoanId);
			}
		}

		await AssignmentLog.create({
			action_event: "loan_assignment",
			action_ref_id: loanId,
			event_ref_id: userId,
			created_by: userId,
			ints: dateTime,
			upts: dateTime,
			remarks: JSON.stringify({assignedTo: assignUserId, comments: comments})
		});

		return res.send({statusCode: "NC200", message: "success"});
	},

	/**
	 * @api {POST} /branch/getApproverList getApproverList
	 * @apiName getApproverList with status
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/getApproverList
	 * @apiParam {String} loanId
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 * @apiSuccess {Object[]} message approverList.
	 */
	getApproverList: async function (req, res, next) {
		const loanId = req.param("loanId");
		if (!loanId) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);
		if (loanBankMappingData.length === 0) {
			return res.status(400).send({statusCode: "NC400", message: sails.config.msgConstants.invalidLoanId});
		}
		const approverList = await ApprovalLogsRd.find({
			reference_id: loanId,
			reference_type: "loan"
		});

		for (const i in approverList) {
			const userData = await UsersRd.findOne({
				select: ["name", "cacompname", "usertype", "user_sub_type"],
				where: {
					id: approverList[i].user_id
				}
			});
			approverList[i].assignedToUserData = userData;
		}

		return res.send({statusCode: "NC200", message: "success", approverList: approverList});
	},

	/**
	 * @api {POST} /branch/createApproverList createApproverList
	 * @apiName createApproverList
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/createApproverList
	 * @apiParam {String} loanId
	 * @apiParam {String} comments
	 * @apiParam {String} roi
	 * @apiParam {String} ncStatus ['Pending Approvals', 'Provisionally Approved']
	 * @apiParam {String[]} assignedTo array of userId
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 * @apiSuccess {Object[]} message approverList.
	 */
	createApproverList: async function (req, res, next) {
		const loanId = req.param("loanId"),
			roi = req.param("roi"),
			comments = req.param("comments") ? req.param("comments") : "",
			userId = req.user.id,
			assignedTo = JSON.parse(req.param("assignedTo")),
			ncStatus = req.param("ncStatus");

		if (!loanId || assignedTo.length === 0 || !ncStatus) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);
		if (loanBankMappingData.length === 0) {
			return res.send({statusCode: "NC500", message: sails.config.msgConstants.invalidLoanId});
		}

		const dateTime = await sails.helpers.indianDateTime();

		let approveLogsArray = [];
		for (const i in assignedTo) {
			const approvalData = await ApprovalLogsRd.findOne({
				reference_id: loanId,
				reference_type: "loan",
				user_id: assignedTo[i]
			});

			if (!approvalData || !approvalData.reference_id) {
				let approveLogsObject = {
					reference_id: loanId,
					reference_type: "loan",
					roi: roi ? roi : 0,
					user_id: assignedTo[i],
					created_at: dateTime,
					updated_at: dateTime,
					status: "pending",
					comments: JSON.stringify({assignedBy: userId, assigneeComments: "", assignedByComments: comments}),
					nc_status: ncStatus
				};
				approveLogsArray.push(approveLogsObject);
			}
		}
		if (approveLogsArray.length > 0) {
			await ApprovalLogs.createEach(approveLogsArray);
		}

		return res.send({statusCode: "NC200", message: "success"});
	},

	/**
	 * @api {POST} /branch/updateApproverList updateApproverList
	 * @apiName updateApproverList
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/updateApproverList
	 * @apiParam {String} loanId
	 * @apiParam {String} comments
	 * @apiParam {String} roi
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 * @apiSuccess {Object[]} message approverList.
	 */
	updateApproverList: async function (req, res, next) {
		const loanId = req.param("loanId"),
			roi = req.param("roi"),
			comments = req.param("comments") ? req.param("comments") : "",
			userId = req.user.id;

		if (!loanId || !roi) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);
		if (loanBankMappingData.length === 0) {
			return res.send({statusCode: "NC500", message: sails.config.msgConstants.invalidLoanId});
		}

		const dateTime = await sails.helpers.indianDateTime(),
			approvalData = await ApprovalLogsRd.find({reference_id: loanId, reference_type: "loan", user_id: userId});

		if (approvalData.length === 0) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}

		for (const i in approvalData) {
			const comm = JSON.parse(approvalData[i].comments);
			comm.assigneeComments = comments;

			await ApprovalLogs.update({reference_id: loanId, reference_type: "loan", user_id: userId}).set({
				roi: roi,
				updated_at: dateTime,
				status: "approved",
				comments: JSON.stringify(comm)
			});
		}

		// let approvalList = await ApprovalLogsRd.find({
		// reference_id: loanId,
		// reference_type: "loan"
		// });
		// let flag = 0;
		// for (let i in approvalList) {
		// if (approvalList[i].status != 'approved') {
		// flag = 1;
		// }
		// }
		// if (flag === 0 && approvalList.length != 0) {
		// // move case from one stage to other..
		// }

		return res.send({statusCode: "NC200", message: "success"});
	},

	/**
	 * @api {POST} /branch/loanListAlert loanListAlert
	 * @apiName loanListAlert
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/loanListAlert
	 * @apiParam {object[]} ncStatusManageName ["Pending Applications"]
	 *
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	loanListAlert: async function (req, res) {
		const userId = req.user.id,
			ncStatusManageName = JSON.parse(req.param("ncStatusManageName")),
			whiteLabelId = req.user.loggedInWhiteLabelID,
			loanIdSet = new Set();

		if (!ncStatusManageName || ncStatusManageName.length === 0) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const NcStatus = await NcStatusManageRd.find({
			// check this
			white_label_id: whiteLabelId,
			name: ncStatusManageName
		});

		if (!NcStatus) {
			return res.badRequest(sails.config.res.NCStatusNotSet);
		}

		// let loanList = []; //enable this
		for (const i in NcStatus) {
			const whereCondition = {
				white_label_id: whiteLabelId
			};

			if (req.user.usertype === "Branch") {
				whereCondition.sales_id = userId;
			} else {
				// check for other userTpes if required
				whereCondition.bank_emp_id = userId;
			}

			if (NcStatus[i].status1 && NcStatus[i].status1 != "0") {
				whereCondition.loan_status_id = NcStatus[i].status1;
			}

			if (NcStatus[i].status2 && NcStatus[i].status2 != "0") {
				whereCondition.loan_sub_status_id = NcStatus[i].status2;
			}

			if (NcStatus[i].status3 && NcStatus[i].status3 != "0") {
				whereCondition.loan_bank_status = NcStatus[i].status3;
			}

			if (NcStatus[i].status4 && NcStatus[i].status4 != "0") {
				whereCondition.loan_borrower_status = NcStatus[i].status4;
			}
			if (NcStatus[i].uw_doc_status && NcStatus[i].uw_doc_status != "0") {
				whereCondition.remarks_val = NcStatus[i].uw_doc_status;
			}
			// if (NcStatus[i].status5)
			//     whereCondition.meeting_flag = NcStatus[i].status5
			if (NcStatus[i].status6 && NcStatus[i].status6 != "0") {
				whereCondition.meeting_flag = NcStatus[i].status6;
			}

			const loanListData = await CubViewRd.find({
				select: ["id", "sales_id", "loan_ref_id", "bank_emp_id"],
				where: whereCondition
			});

			// remove below
			for (const i in loanListData) {
				loanIdSet.add(loanListData[i].id);
			}
			// remove above
			// loanList = [...loanList, ...loanListData]; // enable this
		}

		// remove below
		// implement this
		const approvalSet = new Set(),
			approvalData = await ApprovalLogsRd.find({
				// it will display old cases where users has not approved the
				reference_type: "loan",
				user_id: userId,
				status: "pending"
			});

		for (const i in approvalData) {
			approvalSet.add(approvalData[i].reference_id);
		}

		const approvalList = await CubViewRd.find({
			id: [...approvalSet]
		});

		for (const i in approvalList) {
			for (const j in NcStatus) {
				if (
					approvalList[i].loan_status_id === NcStatus[j].status1 &&
					approvalList[i].loan_sub_status_id === NcStatus[j].status2 &&
					approvalList[i].loan_bank_status === NcStatus[j].status3 &&
					approvalList[i].loan_borrower_status === NcStatus[j].status4 &&
					approvalList[i].meeting_flag === NcStatus[j].status6
				) {
					loanIdSet.add(approvalData[i].reference_id);
				}
			}
		}

		const loanList = await CubViewRd.find({
			id: [...loanIdSet]
		});
		let loanListWithAssignmentData = [];
		await Promise.all(
			loanList.map(async (loan) => {
				const loanId = loan.id,
					result = {},
					assignmentLog = await AssignmentLogRd.find({
						action_event: "loan_assignment",
						action_ref_id: loanId
					})
						.sort("upts DESC")
						.limit(1);
				if (assignmentLog.length === 1) {
					const userData = await UsersRd.findOne({
						select: ["id", "name", "usertype", "user_sub_type"],
						where: {
							id: assignmentLog[0].event_ref_id
						}
					});
					result.assignmentLog = assignmentLog[0];
					result.assignmentLog.userData = userData;
					try {
						const assignedToJson = JSON.parse(assignmentLog[0].remarks),
							assignedToUserId = assignedToJson.assignedTo,
							assignedToUserData = await UsersRd.findOne({
								select: ["id", "name", "usertype", "user_sub_type"],
								where: {
									id: assignedToUserId
								}
							});
						result.assignmentLog.assignedToUserData = assignedToUserData;
						loan.assignmentLog = result.assignmentLog;
						loanListWithAssignmentData.push(loan);
					} catch (err) {
						console.error(err);
					}
				} else {
					loan.assignmentLog = null;
					loanListWithAssignmentData.push(loan);
				}
			})
		);
		if (loanListWithAssignmentData == null || loanListWithAssignmentData.length == 0) {
			return res.send({message: "No record found"});
		}
		if (req.query.page && req.query.limit) {
			const indexOfLast = req.query.page * req.query.limit;
			const indexOfFirst = indexOfLast - req.query.limit;
			return res.send({
				statusCode: "NC200",
				message: "success",
				loanList: loanListWithAssignmentData.slice(indexOfFirst, indexOfLast)
			});
		}
		return res.send({statusCode: "NC200", message: "success", loanList: loanListWithAssignmentData});
	},

	/**
	 * @api {POST} /branch/docInitiate Document Initiate
	 * @apiName Document Initiate
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/docInitiate
	 * @apiParam {Number} loan_id
	 * @apiParam {String} status ["Done" ,"Pending"] default value "Pending".
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Document Upload for this case is completed.
	 * @apiSuccess {string} statusCode NC200.
		"data": {
			"id": 22193,
			"loan_ref_id": "YNHT00021993",
			"loan_status_id": 2,
			"loan_sub_status_id": 8,
			"document_upload": "Done"
		}
	 */
	doc_initiate: async function (req, res) {
		const {loan_id, status, comment} = req.allParams(),
			dateTime = await sails.helpers.dateTime();

		if (!loan_id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		if (!status || status !== "Done") {
			return res.badRequest(sails.config.res.wrongStatus);
		}

		const ncStatus = sails.config.nc_status;
		LoanrequestRd.findOne({id: loan_id})
			.populate("loan_document")
			.then(async (loanData) => {
				if (!loanData) {
					sails.config.res.invalidCaseOrData.exception = "Please check the case id";
					throw new Error("invalidCaseOrData");
				}
				if (loanData.loan_document.length === 0) {
					return res.badRequest(sails.config.res.uploadCaseDocumentPending);
				}
				let status_history = {},
					remarks = {};
				if (loanData.nc_status_history) {
					parseData = JSON.parse(loanData.nc_status_history);
					if (Object.keys(parseData).length > 0) {
						status_history = parseData;
					}
				}
				data = {
					userid: req.user.id,
					loan_status_id: loanData.loan_status_id,
					loan_sub_status_id: loanData.loan_sub_status_id,
					document_initiate_status: status,
					assignedBy: req.user.name
				};
				if (comment) {
					data.type = "Comments";
					data.message = comment;
				}
				status_history[dateTime] = data;
				if (!loanData.remarks) {
					remarks[dateTime] = data;
					remarks = JSON.stringify(remarks);
				} else {
					let jsonRemarks = JSON.parse(loanData.remarks);
					jsonRemarks[dateTime] = data;
					remarks = JSON.stringify(jsonRemarks);
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
							comment: comment
						},
						header = {
							Authorization: req.headers.authorization
						};
					caseMovedToPrevState = await sails.helpers.sailstrigger(url, JSON.stringify(body), header, method);
					parseData = caseMovedToPrevState.status != "nok" ? JSON.parse(caseMovedToPrevState) : {};
					if (parseData.status == "ok") {
						const data = _.pick(
							parseData.data[0],
							"id",
							"loan_ref_id",
							"loan_status_id",
							"loan_sub_status_id",
							"document_upload"
						);
						return res.ok({
							status: "ok",
							statusCode: "NC200",
							message: "Case Initiated for Processing",
							data: data
						});
					}
				} else {
					return Loanrequest.update({id: loanData.id})
						.set({
							loan_status_id: ncStatus.status1,
							loan_sub_status_id: ncStatus.status2,
							document_upload: status,
							nc_status_history: JSON.stringify(status_history),
							remarks: remarks,
							modified_on: dateTime
						})
						.fetch()
						.then(async (updatedLoan) => {
							if (updatedLoan.length === 0) {
								throw new Error("errorFetchingData");
							}

							// }
							const data = _.pick(
								updatedLoan[0],
								"id",
								"loan_ref_id",
								"loan_status_id",
								"loan_sub_status_id",
								"document_upload"
							);
							return res.ok({
								status: "ok",
								statusCode: "NC200",
								message: "Case Initiated for Processing",
								data: data
							});
						});
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
	 * @api {GET} branch/dashboard Dashboard
	 * @apiName Dashboard
	 * @apiGroup Branch
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/branch/dashboard
	 *
	 * @apiSuccess {string} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 * @apiSuccess {Object} data
	 {
		"totalApplnData": [
			{
				"This_WK_Tot_appl_init": 0,
				"This_MNTH_Tot_appl_init": 1,
				"This_WK_online_init": 0,
				"This_MNTH_online_init": 0,
				"This_WK_branch_init": 0,
				"This_MNTH_branch_init": 0,
				"This_WK_Tot_appl_Sanc": 0,
				"This_MNTH_Tot_appl_Sanc": 0
			}
		],
		"onlineApplnData": [
			{
				"This_WK_online_init": 0,
				"This_WK_Tot_appl_Sanc": 0,
				"This_WK_Tot_appl_InProgress": 0,
				"This_WK_Tot_appl_Rejected": 0,
				"This_MNTH_online_init": 0,
				"This_MNTH_Tot_appl_Sanc": 0,
				"This_MNTH_Tot_appl_InProgress": 0,
				"This_MNTH_Tot_appl_Rejected": 0
			}
		],
		"branchApplnData": [
			{
				"This_WK_Branch_init": 0,
				"This_WK_Branch_pending": 0,
				"This_WK_Tot_appl_Branch_Sanc": 0,
				"This_WK_Tot_appl_Branch_InProgress": 0,
				"This_WK_Tot_appl_Branch_Rejected": 0,
				"This_MNTH_Branch_init": 0,
				"This_MNTH_Branch_pending": 0,
				"This_MNTH_Tot_appl_Branch_Sanc": 0,
				"This_MNTH_Tot_appl_Branch_InProgress": 0,
				"This_MNTH_Tot_appl_Branch_Rejected": 0
			}
		]
	}
	 */
	dashboard: async function (req, res) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			userType = req.user.usertype,
			branchId = req.user.branch_id,
			whiteLabelId = req.user.loggedInWhiteLabelID;
		let query1, query2, query3, queryCount, loginQuery;
		if (userType === "Branch") {
			query1 = `SELECT
				(SELECT count(*) FROM loanrequest where DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_WK_Tot_appl_init,
				(SELECT count(*) FROM loanrequest WHERE DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_MNTH_Tot_appl_init,
				(SELECT count(*) FROM loanrequest WHERE DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_YEAR_Tot_appl_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_WK_online_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_MNTH_online_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_YEAR_online_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_WK_branch_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_MNTH_branch_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_YEAR_branch_init,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Sanc,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Sanc,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Sanc`;

			query2 = `select
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_WK_online_init,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} )) AS This_WK_Tot_appl_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Online' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_WK_Tot_appl_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_MNTH_online_init,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} )) AS This_MNTH_Tot_appl_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Online' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_MNTH_Tot_appl_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_YEAR_online_init,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} )) AS This_YEAR_Tot_appl_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Online' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_YEAR_Tot_appl_Rejected`;

			query3 = `select
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_WK_Branch_init,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) +
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ))) AS This_WK_Branch_pending,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Branch_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} )) AS This_WK_Tot_appl_Branch_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Branch' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Branch_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_MNTH_Branch_init,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) +
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ))) AS This_MNTH_Branch_pending,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Branch_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} )) AS This_MNTH_Tot_appl_Branch_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Branch' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Branch_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) AS This_YEAR_Branch_init,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId}) +
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ))) AS This_YEAR_Branch_pending,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Branch_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id = ${branchId} and white_label_id = ${whiteLabelId} )) AS This_YEAR_Tot_appl_Branch_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Branch' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id = ${branchId} and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Branch_Rejected`;

			queryCount = `select b.*, Recent_Update from (select "Pending Applications" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest left join loan_bank_mapping on loan_bank_mapping.loan_id = loanrequest.loanId left join  banktbl  on  banktbl.id = loanrequest.branch_id
				where  white_label_id = ${whiteLabelId} and branch_id = ${branchId}  )a where loan_status_id = '1'
				union
				select "NC In-Progress" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id from loanrequest lr where white_label_id = ${whiteLabelId} and branch_id = ${branchId})a where loan_status_id = '2' and loan_sub_status_id = '8'
				union
				select "NC Complete" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '9' and loan_borrower_status = '2' and meeting_flag in ('0', null,' ')
				union
				select "Branch Review" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '3' and meeting_flag in ('0', null,' ')
				union
				select "Pending Approvals" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '1'
				union
				select "Provisionally Approved" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '2'
				union
				select "In-Principle Sanction" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag = '1'
				union
				select "Final Sanction" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag = '2'
				union
				select "No Documents" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, remarks_val, loan_sub_status_id from loanrequest where white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '8' and loan_sub_status_id = '12' and remarks_val = 1
				union
				select "Missing Documents" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, remarks_val, loan_sub_status_id from loanrequest where white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '8' and loan_sub_status_id = '12' and remarks_val = 4
				union
				select "Blur Documents" as
				Status, count(*) As Branch_Count from (select loanId, remarks_val, loan_status_id, loan_sub_status_id from loanrequest where  white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '8' and loan_sub_status_id = '12' and remarks_val =2
				union
				select "Duplicate Case" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id from loanrequest where  white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '15' and loan_sub_status_id = '15'
				union
				select "Reassigned" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '10' and loan_borrower_status = '4' and meeting_flag in ('0', null,' ')
				union
				select "Not Qualified" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id from loanrequest where white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '7' and loan_sub_status_id = '13'

				union
				select "Rejected" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '14' and loan_borrower_status = '7'
				union
				select "Expired Loans" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId} )a where loan_status_id = '14' and loan_sub_status_id = '14') b left join


				(select "Pending Applications" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '1'
				union
				select "NC In-Progress" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '8'
				union
				select "NC Complete" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '9' and loan_borrower_status = '2' and meeting_flag in ('0', null,' ')
				union
				select "Branch Review" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '3' and meeting_flag in ('0', null,' ')
				union
				select "Pending Approvals" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '1'
				union
				select "Provisionally Approved" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '2'
				union
				select "In-Principle Sanction" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag = '1'
				union
				select "Final Sanction" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag  = '2'
				union
				select "No Documents" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '8' and loan_sub_status_id = '12'
				union
				select "Missing Documents" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id from loanrequest where white_label_id = ${whiteLabelId} and branch_id = ${branchId} and modified_on > now() - interval 20 hour and loan_status_id = '8' and loan_sub_status_id = '12') a
				union
				select "Blur Documents" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '8' and loan_sub_status_id = '12'
				union
				select "Duplicate Case" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '15' and loan_sub_status_id = '15'
				union
				select "Reassigned" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '10' and loan_borrower_status = '4' and meeting_flag in ('0', null,' ')
				union
				select "Not Qualified" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id from loanrequest where white_label_id = ${whiteLabelId} and branch_id = ${branchId} and modified_on > now() - interval 20 hour and loan_status_id = '7' and loan_sub_status_id = '13')a
				union
				select "Rejected" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '14' and loan_borrower_status = '7'
				union
				select "Expired Loans" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and branch_id = ${branchId}  and modified_on > now() - interval 20 hour)a where loan_status_id = '14' and loan_sub_status_id ='14') c on c.Status = b.Status;`;

			loginQuery = `SELECT login_time, user_id FROM login_session left join users on login_session.user_id=users.userid where users.white_label_id='${whiteLabelId}' ORDER BY login_id DESC limit 1,1;`;
		} else if (userType === "Credit") {
			const branchDetails = await BanktblRd.findOne({id: branchId}),
				sectionRef = branchDetails.section_reference_id,
				whiteLabelSolutionDetails = await WhiteLabelSolutionRd.findOne({id: whiteLabelId}),
				allBranchDetails = await BanktblRd.find({
					section_reference_id: sectionRef,
					ref_id: whiteLabelSolutionDetails.ref_id
				}),
				branchIDs = [];
			_.map(allBranchDetails, (o) => {
				if (o.id) {
					branchIDs.push(o.id);
				}
			});
			query1 = `SELECT
				(SELECT count(*) FROM loanrequest where DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_WK_Tot_appl_init,
				(SELECT count(*) FROM loanrequest WHERE DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_MNTH_Tot_appl_init,
				(SELECT count(*) FROM loanrequest WHERE DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_YEAR_Tot_appl_init,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_WK_online_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_MNTH_online_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_YEAR_online_init,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_WK_branch_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_MNTH_branch_init,
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_YEAR_branch_init,

				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Sanc,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Sanc,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Sanc`;

			query2 = `select
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_WK_online_init,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} )) AS This_WK_Tot_appl_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Online' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_WK_Tot_appl_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_MNTH_online_init,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} )) AS This_MNTH_Tot_appl_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Online' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_MNTH_Tot_appl_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Online' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_YEAR_online_init,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Online' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} )) AS This_YEAR_Tot_appl_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Online' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_YEAR_Tot_appl_Rejected`;

			query3 = `select
				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_WK_Branch_init,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) +
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ))) AS This_WK_Branch_pending,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Branch_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} )) AS This_WK_Tot_appl_Branch_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Branch' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 WEEK and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_WK_Tot_appl_Branch_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_MNTH_Branch_init,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) +
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ))) AS This_MNTH_Branch_pending,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Branch_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} )) AS This_MNTH_Tot_appl_Branch_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Branch' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 MONTH and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_MNTH_Tot_appl_Branch_Rejected,

				(SELECT count(*) FROM loanrequest WHERE loan_origin = 'CUB_Branch' AND DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) AS This_YEAR_Branch_init,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId}) +
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ))) AS This_YEAR_Branch_pending,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Branch_Sanc,
				((SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 8 and loan_status_id <> 2 and loan_sub_status_id <> 9 and  loan_bank_status <> 14 and loan_borrower_status <> 14 and loan_status_id <> 7 and loan_sub_status_id <> 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) - (SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  WHERE loan_origin = 'CUB_Branch' and DATE(ints) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 12 and loan_borrower_status = 12 and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} )) AS This_YEAR_Tot_appl_Branch_InProgress,
				(SELECT count(*) FROM loanrequest lr left join loan_bank_mapping lbm on lbm.loan_id = lr.loanId  where loan_origin = 'CUB_Branch' and DATE(RequestDate) > DATE(NOW()) + INTERVAL - 1 YEAR and loan_status_id = 7 and loan_sub_status_id = 13  and branch_id in (${branchIDs}) and white_label_id = ${whiteLabelId} ) AS This_YEAR_Tot_appl_Branch_Rejected`;

			queryCount = `select b.*, Recent_Update from (select "Pending Applications" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest left join loan_bank_mapping on loan_bank_mapping.loan_id = loanrequest.loanId left join  banktbl  on  banktbl.id = loanrequest.branch_id
				where  white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  )a where loan_status_id = '1'
				union
				select "NC In-Progress" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id from loanrequest lr left join banktbl  on  banktbl.id = lr.branch_id where white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}))a where loan_status_id = '2' and loan_sub_status_id = '8'
				union
				select "NC Complete" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '9' and loan_borrower_status = '2' and meeting_flag  in ('0', ' ', null)
				union
				select "Branch Review" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '3' and meeting_flag  in ('0', ' ', null)
				union
				select "Pending Approvals" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '1'
				union
				select "Provisionally Approved" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '2'
				union
				select "In-Principle Sanction" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag = '1'
				union
				select "Final Sanction" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag = '2'
				union
				select "No Documents" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, remarks_val, loan_sub_status_id from loanrequest left join banktbl  on  banktbl.id = loanrequest.branch_id where white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '8' and loan_sub_status_id = '12' and remarks_val = 1
				union
				select "Missing Documents" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, remarks_val, loan_sub_status_id from loanrequest left join banktbl  on  banktbl.id = loanrequest.branch_id  where white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '8' and loan_sub_status_id = '12' and remarks_val = 4
				union
				select "Blur Documents" as
				Status, count(*) As Branch_Count from (select loanId, remarks_val, loan_status_id, loan_sub_status_id from loanrequest left join banktbl  on  banktbl.id = loanrequest.branch_id  where  white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '8' and loan_sub_status_id = '12' and remarks_val =2
				union
				select "Duplicate Case" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id from loanrequest left join banktbl  on  banktbl.id = loanrequest.branch_id  where  white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '15' and loan_sub_status_id = '15'
				union
				select "Reassigned" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '10' and loan_borrower_status = '4' and meeting_flag  in ('0', ' ', null)
				union
				select "Not Qualified" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id from loanrequest left join banktbl  on  banktbl.id = loanrequest.branch_id  where white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '7' and loan_sub_status_id = '13'

				union
				select "Rejected" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '14' and loan_borrower_status = '7'
				union
				select "Expired Loans" as
				Status, count(*) As Branch_Count from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id}) )a where loan_status_id = '14' and loan_sub_status_id = '14') b left join


				(select "Pending Applications" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '1'
				union
				select "NC In-Progress" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '8'
				union
				select "NC Complete" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '9' and loan_borrower_status = '2' and meeting_flag  in ('0', ' ', null)
				union
				select "Branch Review" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '3' and meeting_flag  in ('0', ' ', null)
				union
				select "Pending Approvals" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '1'
				union
				select "Provisionally Approved" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '10' and meeting_flag = '2'
				union
				select "In-Principle Sanction" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag = '1'
				union
				select "Final Sanction" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '12' and loan_borrower_status = '12' and meeting_flag  = '2'
				union
				select "No Documents" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '8' and loan_sub_status_id = '12'
				union
				select "Missing Documents" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id from loanrequest left join banktbl  on  banktbl.id = loanrequest.branch_id  where white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})and modified_on > now() - interval 20 hour and loan_status_id = '8' and loan_sub_status_id = '12') a
				union
				select "Blur Documents" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '8' and loan_sub_status_id = '12'
				union
				select "Duplicate Case" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '15' and loan_sub_status_id = '15'
				union
				select "Reassigned" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '10' and loan_borrower_status = '4' and meeting_flag  in ('0', ' ', null)
				union
				select "Not Qualified" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id from loanrequest left join banktbl  on  banktbl.id = loanrequest.branch_id  where white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})and modified_on > now() - interval 20 hour and loan_status_id = '7' and loan_sub_status_id = '13')a
				union
				select "Rejected" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '2' and loan_sub_status_id = '9' and loan_bank_status = '14' and loan_borrower_status = '7'
				union
				select "Expired Loans" as
				Status, if( count(*)>0,'Yes','No') As Recent_Update from (select loanId, loan_status_id, loan_sub_status_id, loan_bank_status, loan_borrower_status, meeting_flag, section_reference_id, branch_id from loanrequest, loan_bank_mapping, banktbl where loan_bank_mapping.loan_id = loanrequest.loanId and banktbl.id = loanrequest.branch_id and white_label_id = ${whiteLabelId} and section_reference_id in (select section_ref from users_section where user_id = ${req.user.id})  and modified_on > now() - interval 20 hour)a where loan_status_id = '14' and loan_sub_status_id ='14') c on c.Status = b.Status;`;
			loginQuery = `SELECT login_time, user_id FROM login_session left join users on login_session.user_id=users.userid where users.white_label_id='${whiteLabelId}' ORDER BY login_id DESC limit 1,1;`;
		} else {
			return res.ok({status: "nok", message: sails.config.msgConstants.notACubUser});
		}
		const [query1Data, query2Data, query3Data, queryCountData, lastLoginTime] = await Promise.all([
			myDBStore.sendNativeQuery(query1),
			myDBStore.sendNativeQuery(query2),
			myDBStore.sendNativeQuery(query3),
			myDBStore.sendNativeQuery(queryCount),
			myDBStore.sendNativeQuery(loginQuery)
		]),
			data = {
				totalApplnData: query1Data.rows,
				onlineApplnData: query2Data.rows,
				branchApplnData: query3Data.rows,
				loanCount: queryCountData,
				lastLoginTime: lastLoginTime.rows
			};
		console.log(data);
		return res.ok({statusCode: "NC200", message: "Success", data});
	}
};
/**
 * AssignUser to loan Not rquired as of now
		let remarks = {};
		remarks[dateTime] = {
			userId: userId,
			type: "ReAssign Comments",
			message: comments
		}

		let loanData = await LoanrequestRd.findOne({
			select: ['remarks'],
			where: {
				id: loanId
			}
		})

		if (loanData.remarks === null) {
			remarks = JSON.stringify(remarks)
		} else {
			let jsonRemarks = JSON.parse(loanData.remarks);
			jsonRemarks[dateTime] = remarks[dateTime];
			remarks = JSON.stringify(jsonRemarks);
		}
 */
