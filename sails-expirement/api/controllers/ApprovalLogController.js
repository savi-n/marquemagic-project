/**
 * ApprovalLogController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	createApprovalLog: async (req, res) => {
		try {
			// VALIDATION BEGINS for the mandatory fields coming in the request.
			let validatedResponse = validateCreateApprovalRequest(req);

			if (validatedResponse !== null && validatedResponse !== undefined && validatedResponse.trim() !== "") {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedResponse
				});
			}
			const {loan_id, approval_users_ids, type, cad_flow} = req.body;

			if (!cad_flow) {
				for (const user of approval_users_ids) {
					const isApprovalLogExistForRequested = await ApprovalLogsRd.find({
						reference_id: loan_id,
						type: type,
						user_id: user
					});

					if (isApprovalLogExistForRequested.length != 0) {
						return res.send({
							status: sails.config.msgConstants.NOT_OK_STATUS,
							message: sails.config.msgConstants.APPROVAL_LOGS_ALREADY_EXIST
						});
					}
				}
			}
			// VALIDATION ENDS
			let createdRecord;

			for (const user_id of req.body.approval_users_ids) {
				createdRecord = await saveApprovalLog(req, user_id, sails.config.msgConstants.POST_OPERATION);
			}

			await updateApprovalStatusAfterApprovalLogCreation(req, createdRecord);

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.APPROVAL_LOG_CREATED,
				post: this.create
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.APPROVAL_LOG_CREATED_SERVER_ERROR + error);
		}
	},

	getApprovalLogs: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);
			const type = req.param(sails.config.msgConstants.REQUEST_PARAM_TYPE);

			// VALIDATION BEGINS on request params => loan id and type
			let validatedRequestedLoanResponse = validateRequestedLoan(loanId);
			if (
				validatedRequestedLoanResponse !== null &&
				validatedRequestedLoanResponse !== undefined &&
				validatedRequestedLoanResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanResponse
				});
			}

			let validatedRequestedTypeResponse = validateRequestedType(type);
			if (
				validatedRequestedTypeResponse !== null &&
				validatedRequestedTypeResponse !== undefined &&
				validatedRequestedTypeResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedTypeResponse
				});
			} // Validation Ends.

			const approvalLogsWithUsers = await ApprovalLogsRd.find({
				reference_id: loanId,
				type: type
			}).populate("user_id");

			if (approvalLogsWithUsers.length == 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_LOG_NOT_FOUND_FOR_REQUESTED_LOAN + loanId
				});
			}

			const approvalLogStatus = [];

			for (const approvalLog of approvalLogsWithUsers) {
				if (approvalLog.user_id != null) {
					const {id, user_reference_no, name, usertype, user_sub_type, designation, branch_id} =
						approvalLog.user_id;
					let branch;
					if (branch_id != null) {
						branch = (await BanktblRd.findOne({id: branch_id})).branch;
					}

					const {hierarchyName} = await sails.helpers.userHierarchy(approvalLog.user_id);
					approvalLogStatus.push({
						id,
						user_reference_no,
						name,
						usertype,
						user_sub_type,
						designation,
						hierarchy: hierarchyName,
						branch: branch,
						loanId: approvalLog.reference_id,
						approvalLogId: approvalLog.id,
						approvalLogStatus: approvalLog.status,
						type: approvalLog.type,
						comments: await sails.helpers.escapeBackSlash(approvalLog.comments)
					});
				}
			}
			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.APPROVAL_LOGS_FETCHED,
				data: approvalLogStatus
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.APPROVAL_LOGS_SERVER_ERROR + error);
		}
	},

	updateApprovalLog: async (req, res) => {
		try {
			// VALIDATION BEGINS for the mandatory fields coming in the request.
			let validatedResponse = validateUpdateApprovalRequest(req);

			if (validatedResponse !== null && validatedResponse !== undefined && validatedResponse.trim() !== "") {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedResponse
				});
			} // VALIDATION ENDS

			const {loan_id, status, comments, type} = req.body;

			const approvalLogRecord = await ApprovalLogsRd.find({
				reference_id: loan_id,
				type: type,
				user_id: req.user.id
			})
				.sort("id DESC")
				.limit(1);

			const approvalLog = approvalLogRecord[0];

			if (!approvalLog) {
				return res.send({
					status: sails.config.msgConstants.OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_LOG_NOT_FOUND
				});
			}
			let validatedApprovalLogStatusResponse = validateApprovalLogStatus(approvalLog);
			if (
				validatedApprovalLogStatusResponse !== null &&
				validatedApprovalLogStatusResponse !== undefined &&
				validatedApprovalLogStatusResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedApprovalLogStatusResponse
				});
			}
			const existingComments = JSON.parse(approvalLog.comments);
			let existingComment = JSON.stringify(existingComments[0]);
			let jsonObject = JSON.parse(existingComment);
			jsonObject.assigneeComments = comments;
			existingComments[0] = jsonObject;

			const updatedApprovalLog = await ApprovalLogs.updateOne({
				id: approvalLog.id
			}).set({
				comments: JSON.stringify(existingComments),
				status: status
			});

			updatedApprovalLog.comments = await sails.helpers.escapeBackSlash(updatedApprovalLog.comments);

			// const approvalLogStatus = await getApprovalStatus(req, type, loan_id);
			await updateApprovalStatusAfterApprovalLogUpdation(type, status, loan_id);

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.APPROVAL_LOG_UPDATED,
				data: updatedApprovalLog
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.APPROVAL_LOG_UPDATED_SERVER_ERROR + error);
		}
	},

	getApprovalUserHierarchy: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);
			const regionId = req.param(sails.config.msgConstants.REQUEST_PARAM_REGION_ID);

			// VALIDATION BEGINS on request params: loan id and type
			let validatedRequestedLoanResponse = validateRequestedLoan(loanId);
			if (
				validatedRequestedLoanResponse !== null &&
				validatedRequestedLoanResponse !== undefined &&
				validatedRequestedLoanResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanResponse
				});
			}

			let validatedRequestedRegionResponse = validateRequestedRegion(regionId);
			if (
				validatedRequestedRegionResponse !== null &&
				validatedRequestedRegionResponse !== undefined &&
				validatedRequestedRegionResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedRegionResponse
				});
			}

			// validation on loan request for the requested loan id.
			const loanRequest = await LoanrequestRd.findOne({id: loanId});
			let validatedLoanRequestResponse = validateLoanRequest(loanId, loanRequest);

			if (isDataExist(validatedLoanRequestResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedLoanRequestResponse
				});
			}

			const loanProductId = loanRequest.loan_product_id;
			let validatedLoanProductIdForLoanRequestResponse = validateLoanProductIdForLoanRequest(
				loanId,
				loanProductId
			);

			if (isDataExist(validatedLoanProductIdForLoanRequestResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedLoanProductIdForLoanRequestResponse
				});
			}

			const loanProduct = await LoanProductsRd.findOne({
				id: loanProductId
			});

			let validatedLoanProductResponse = validateLoanProduct(loanProduct, loanProductId);

			if (isDataExist(validatedLoanProductResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedLoanProductResponse
				});
			}

			let validatedTermsAndConditionsResponse = validateTermsAndConditionsResponse(
				loanProduct.terms_conditions,
				loanProductId
			);

			if (isDataExist(validatedTermsAndConditionsResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedTermsAndConditionsResponse
				});
			}
			if (loanProduct.terms_conditions == null) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.TERMS_AND_CONDITIONS_NOT_FOUND
				});
			}

			let parsed_terms_conditions = JSON.parse(loanProduct.terms_conditions);
			let sanction_condition = parsed_terms_conditions.sanction_condition;

			let approval_category = sanction_condition[0]?.approval_category;
			let exposureLimit = sanction_condition[0]?.exposure_limit?.[0]?.value;

			if (!exposureLimit) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.EXPOSURE_LIMIT_NOT_FOUND
				});
			} // VALIDATION ENDS

			let cad_status = null;
			const loanPreFetch = await LoanPreFetchRd.find({
				loan_id: loanId,
				request_type: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS
			})
				.sort("id DESC")
				.select("initial_json")
				.limit(1);
			if (loanPreFetch.length > 0 && loanPreFetch[0].initial_json) {
				const parseData = JSON.parse(loanPreFetch[0].initial_json);
				cad_status = parseData.cad_status;
			}

			const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);

			let offerAmount, offerAmountUm;
			if (loanBankMapping.length == 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.LOAN_BANK_MAPPING_NOT_FOUND_FOR_REQUESTED_LOAN + loanId
				});
			}

			if (!loanBankMapping[0].offer_amnt || !loanBankMapping[0].offer_amnt_um) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.OFFER_AMOUNT_NOT_SET_FOR_REQUESTED_LOAN + loanId
				});
			}
			offerAmount = loanBankMapping[0].offer_amnt;
			offerAmountUm = loanBankMapping[0].offer_amnt_um;
			let calculatedOfferAmount = calculateOfferAmount(offerAmount, offerAmountUm);



			const approvalUserHierarchyList = [];
			// if (cad_status && cad_status == "NON_CAD") {
			// if (calculatedOfferAmount <= exposureLimit)
			if (cad_status == "CAD") {
				const whiteLabelId = req.user.loggedInWhiteLabelID;
				// if (approval_category == sails.config.msgConstants.APPROVAL_CATEGORY_CENTRAL) {
				// const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);
				// if (!loanBankMapping.length) return res.ok({status: "nok", message: "No record found in Loan Bank Mapping"})

				// let whereCondition = {usertype: sails.config.msgConstants.USER_TYPE_BANK, white_label_id: whiteLabelId}
				// if (!loanBankMapping[0].approval_status) whereCondition.user_sub_type = "Compliance Maker"
				// else {
				// 	const approval_status = JSON.parse(loanBankMapping[0].approval_status).find(obj => obj.type == sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS)
				// 	if (!approval_status) whereCondition.user_sub_type = "Compliance Maker"
				// 	else if (approval_status && approval_status.status === "Maker recommend") whereCondition.user_sub_type = "Compliance Checker"
				// 	else return res.ok({status: "ok", message: "Approval cannot be requested for this loan"})
				// }

				let user_sub_type;
				if (!loanBankMapping[0].approval_status) user_sub_type = "Compliance Maker"
				else {
					const approval_status = JSON.parse(loanBankMapping[0].approval_status).find(obj => obj.type == sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS)
					if (!approval_status) user_sub_type = "Compliance Maker"
					else if (approval_status && approval_status.status === "Maker recommend") user_sub_type = "Compliance Checker"
					else return res.ok({status: "ok", message: "Approval cannot be requested for this loan"})
				}

				const complianceUsers = await queryForComplianceUsers(whiteLabelId, sails.config.msgConstants.USER_TYPE_BANK, user_sub_type, regionId, req.user.state, req.user.city, loanRequest.branch_id, loanId, req.user.id);
				console.log("-------------------complianceUsers------------------", complianceUsers);
				return res.ok({
					status: sails.config.msgConstants.OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_USER_HIERARCHY_FETCHED,
					data: complianceUsers
				});
			}
			else {
				let whereCondition = {
					white_label_id: {contains: req.user.loggedInWhiteLabelID},
					lender_id: req.user.lender_id,
					usertype: "Bank",
					user_sub_type: "Sales",
					is_branch_manager: 1,
					branch_id: loanRequest.branch_id,
					status: "active"
				};

console.log("--------------------------", whereCondition);
				let usersList = await UsersRd.find(whereCondition).select(["name", "designation", "branch_id", "email", "usertype", "user_sub_type"]);
				return res.ok({
					status: sails.config.msgConstants.OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_USER_HIERARCHY_FETCHED,
					data: usersList
				});
			}
			// {
			// 	const userType = req.user.usertype;
			// 	const userSubType = req.user.user_sub_type;

			// 	// Criteria 1: Get the regional level users.
			// 	const userList = await UsersRd.find(
			// 		await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.REGIONAL, req.user)
			// 	);
			// 	const lenderRegionMapping = await LenderRegionMapping.find({
			// 		region_id: regionId,
			// 		user_id: userList.map((user) => user.id)
			// 	}).populate("user_id");
			// 	for (const lrm of lenderRegionMapping) {
			// 		saveToApprovalUserHierarchyList(
			// 			approvalUserHierarchyList,
			// 			lrm.user_id,
			// 			sails.config.msgConstants.REGIONAL
			// 		);
			// 	}

			// 	// Criteria 2: Get the state level users.
			// 	const stateLevelUserList = await UsersRd.find(
			// 		await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.STATE, req.user)
			// 	);
			// 	for (const user of stateLevelUserList) {
			// 		saveToApprovalUserHierarchyList(approvalUserHierarchyList, user, sails.config.msgConstants.STATE);
			// 	}

			// 	// Criteria 3: Get the City level users.
			// 	const cityLevelUserList = await UsersRd.find(
			// 		await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.CITY, req.user)
			// 	);
			// 	for (const user of cityLevelUserList) {
			// 		saveToApprovalUserHierarchyList(approvalUserHierarchyList, user, sails.config.msgConstants.CITY);
			// 	}

			// 	// Criteria 4: Get the Branch level users.
			// 	const branchLevelUserList = await UsersRd.find(
			// 		await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.BRANCH, req.user)
			// 	);
			// 	for (const user of branchLevelUserList) {
			// 		saveToApprovalUserHierarchyList(approvalUserHierarchyList, user, sails.config.msgConstants.BRANCH);
			// 	}
			// }

			// return res.send({
			// 	status: sails.config.msgConstants.OK_STATUS,
			// 	message: sails.config.msgConstants.APPROVAL_USER_HIERARCHY_FETCHED,
			// 	data: approvalUserHierarchyList.reverse()
			// });
		} catch (error) {
			return res.serverError(sails.config.msgConstants.APPROVAL_USER_HIERARCHY_SERVER_ERROR + error);
		}
	},

	getLoanApprovalStatus: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);
			const type = req.param(sails.config.msgConstants.REQUEST_PARAM_TYPE);

			//VALIDATION BEGINS on request params => loan id and type
			let validatedRequestedLoanResponse = validateRequestedLoan(loanId);
			if (
				validatedRequestedLoanResponse !== null &&
				validatedRequestedLoanResponse !== undefined &&
				validatedRequestedLoanResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanResponse
				});
			}

			let validatedRequestedTypeResponse = validateRequestedType(type);
			if (
				validatedRequestedTypeResponse !== null &&
				validatedRequestedTypeResponse !== undefined &&
				validatedRequestedTypeResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedTypeResponse
				});
			} //VALIDATION ENDS.

			const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);

			if (loanBankMapping.length == 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.LOAN_BANK_MAPPING_NOT_FOUND_FOR_REQUESTED_LOAN + loanId
				});
			}

			const {id, loan_id, approval_status} = loanBankMapping[0];
			let filtered_approval_status;
			if (
				approval_status != null &&
				approval_status != undefined &&
				approval_status.trim() !== "" &&
				approval_status.length != 0
			) {
				let approval_details = JSON.parse(approval_status);
				filtered_approval_status = approval_details
					.filter((approval_detail) => approval_detail.type == type)
					.map((approval_detail) => approval_detail.status)[0];
			}
			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.APPROVAL_STATUS_FETCHED,
				data: {
					id,
					loan_id,
					approval_status: filtered_approval_status
				}
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.APPROVAL_STATUS_SERVER_ERROR + error);
		}
	},

	reassignAndCreateApprovalUser: async (req, res) => {
		try {
			// VALIDATION BEGINS for the mandatory fields coming in the request.
			let validatedResponse = validateReassignAndCreateApprovalUserRequest(req);

			if (validatedResponse !== null && validatedResponse !== undefined && validatedResponse.trim() !== "") {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedResponse
				});
			}

			const {loan_id, userId, toUserId, comments, type} = req.body;

			const approvalLog = await ApprovalLogsRd.find({
				reference_id: loan_id,
				user_id: userId,
				type: type
			})
				.sort("id DESC")
				.limit(1);

			if (approvalLog.length == 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_LOG_NOT_FOUND_FOR_APPROVAL_LOG_ID
				});
			}

			if (
				approvalLog[0].status == sails.config.msgConstants.APPROVED ||
				approvalLog[0].status == sails.config.msgConstants.REJECTED
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_LOG_INCORRECT_STATUS_UPDATE
				});
			}

			const checkRequestedUserAlreadyAssigned = await ApprovalLogsRd.find({
				reference_id: loan_id,
				user_id: toUserId,
				type: type,
				status: {
					in: [
						sails.config.msgConstants.APPROVED,
						sails.config.msgConstants.PENDING,
						sails.config.msgConstants.REJECTED,
						sails.config.msgConstants.REASSIGNED
					]
				}
			}).sort("id DESC").limit(1);

			if (checkRequestedUserAlreadyAssigned.length > 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.REQUESTED_USER_ALREADY_ASSIGNED
				});
			}

			const existingApprovalLogComments = JSON.parse(approvalLog[0].comments);
			let existingApprovalLogComment = JSON.stringify(existingApprovalLogComments[0]);
			let jsonObject = JSON.parse(existingApprovalLogComment);
			jsonObject.assigneeComments = comments;
			existingApprovalLogComments[0] = jsonObject;

			await ApprovalLogs.updateOne({
				id: approvalLog[0].id
			}).set({
				comments: JSON.stringify(existingApprovalLogComments),
				status: sails.config.msgConstants.REASSIGNED
			});

			let createdApprovalRecord = await saveApprovalLog(req, toUserId, sails.config.msgConstants.REASSIGN_OPERATION);
			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.REASSIGNED_APPROVAL_USER_FOR_REQUESTED_LOAN
			});
		} catch (error) {
			return res.serverError(
				sails.config.msgConstants.REASSIGNED_APPROVAL_USER_FOR_REQUESTED_LOAN_SERVER_ERROR + error
			);
		}
	},

	getDeviationApproverList: async function (req, res) {
		let {user_type, user_sub_type, approval_level, region_id, user_level, loan_id} = req.allParams();
		if (!user_type || !user_sub_type || (!user_level && !approval_level)) return res.badRequest(sails.config.res.missingFields)

		let usersData;
		if (user_level) {
			if (!loan_id) return res.badRequest(sails.config.res.missingFields)
			usersData = await Users.find({white_label_id: {contains: req.user.loggedInWhiteLabelID}, user_limit: {contains: user_level}}).select(["name", "designation", "branch_id", "email", "usertype", "user_sub_type"]);
			if (usersData.length) {
				const userIds = usersData.map(record => record.id);
				const zoneData = await LoanAdditionalDataRd.find({loan_id: loan_id}).select("zone_id");
				if (zoneData.length == 0 || (zoneData.length && !zoneData[0].zone_id)) return res.ok({status: "nok", message: "Zone not found for this Loan"})
				const zoneUsers = await UsersSectionRd.find({user_id: {in: userIds}, section_ref: zoneData[0].zone_id, classification_type: "zone"})
				const filteredUserIDs = zoneUsers.map((record) => record.user_id);
				usersData = usersData.filter((record) =>
					filteredUserIDs.includes(record.id))
			}
		}
		else {
			let whereCondition = {
				white_label_id: {contains: req.user.loggedInWhiteLabelID},
				lender_id: req.user.lender_id,
				usertype: "Bank",
				user_sub_type: {in: user_sub_type.split(',')},
				status: "active"
			}

			if (approval_level == "Bank") {
				whereCondition.is_branch_manager = 1
				whereCondition.branch_id = req.user.branch_id
			}
			else if (approval_level == "City") {
				whereCondition.is_lender_manager = 1
				whereCondition.city = req.user["city"]
			}
			else if (approval_level == "State") {
				whereCondition.is_state_access = 1
				whereCondition.state = req.user["state"]
			}
			else if (approval_level == "Region") {whereCondition.is_lender_admin = 1}

			usersData = await UsersRd.find(whereCondition).select(["name", "designation", "branch_id", "email"]);

			if (usersData.length > 0) {
				if (approval_level == "Region") {
					if (!region_id) return res.badRequest({status: "nok", message: "Region ID is required"})
					const userIds = usersData.map(record => record.id);
					const lenderRegionMappingData = await LenderRegionMappingRd.find({user_id: {in: userIds}, region_id: region_id});
					const filteredUserIDs = lenderRegionMappingData.map((record) => record.user_id);
					usersData = usersData.filter((record) =>
						filteredUserIDs.includes(record.id)
					);
				}

				usersData = await Promise.all(usersData.map(async (obj) => {
					const branchData = await BanktblRd.findOne({id: obj.branch_id});
					return {...obj, branch: branchData ? branchData.branch : ""};
				}));
			}
		}

		return res.ok({
			status: "ok",
			data: usersData || []
		})
	},

	isLogged: async function (req, res) {
		const {loanId, userId, type} = req.allParams();
		if (!loanId || !userId || !type) return res.badRequest(sails.config.res.missingFields)
		const approvalLogData = await ApprovalLogsRd.find({reference_id: loanId, user_id: userId, type: type});
		return res.ok({
			status: "ok",
			data: {isLogged: approvalLogData.length > 0 ? true : false}
		})
	},
	getCadUsersList: async function (req, res) {
		const {loanId, regionId} = req.allParams();
		if (!loanId || !regionId) return res.badRequest(sails.config.res.missingFields);
		const loanRequest = await LoanrequestRd.findOne({id: loanId}).select("branch_id");
		if (!loanRequest) return res.ok({status: "nok", message: "Invalid Loan ID"})
		const complianceUsers = await queryForComplianceUsers(req.user.loggedInWhiteLabelID, sails.config.msgConstants.USER_TYPE_BANK, req.user.user_sub_type, regionId, req.user.state, req.user.city, loanRequest.branch_id, loanId, req.user.id);
		return res.ok({status: "ok", message: "CAD Users List fetched successfully", data: complianceUsers})
	},
	reInitiateTCApprovalFlow: async function (req, res) {
		const loanId = req.param("loanId");
		if (!loanId) return res.badRequest(sails.config.res.missingFields);
		const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);
		if (!loanBankMapping.length || !loanBankMapping[0].approval_status) return res.ok({status: "nok", message: "Invalid re initiate request"})
		let approval_status = JSON.parse(loanBankMapping[0].approval_status);
		let updateValue;
		updateValue = approval_status.filter(obj => obj.type != sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS)
		const updatedLoanBankMappingRecord = await LoanBankMapping.updateOne({id: loanBankMapping[0].id}).set({approval_status: JSON.stringify(updateValue)});
		return res.ok({status: "ok", message: "Re initiated successfully!"})
	}
};

async function saveApprovalLog(req, user_id, operation) {
	/**
	 * Below scenario is for Sanction Limit, where the request comes for without approval for the logged-in user.
	 * In such case, status should be set to approved.
	 * Other cases, status should be set to pending.
	 */
	// let status;
	// if (
	// 	req.body.type == sails.config.msgConstants.SANCTION_LIMIT &&
	// 	operation == sails.config.msgConstants.POST_OPERATION
	// ) {
	// 	if (req.body.approval_users_ids.length == 1 && req.body.approval_users_ids[0] == req.user.id) {
	// 		status = sails.config.msgConstants.APPROVED;
	// 	} else {
	// 		status = sails.config.msgConstants.PENDING;
	// 	}
	// }
	// else if (operation == sails.config.msgConstants.REASSIGN_OPERATION) status = sails.config.msgConstants.PENDING

	const dateTime = await sails.helpers.indianDateTime();
	const commentString = [
		{
			assignedBy: req.user.id,
			assigneeComments: "",
			assignedByComments: req.body.comments,
			created_at: dateTime,
			updated_at: dateTime
		}
	];

	let createdApprovalRecord = await ApprovalLogs.create({
		reference_id: req.body.loan_id,
		reference_type: sails.config.msgConstants.LOAN,
		status: "pending",
		user_id: user_id,
		comments: JSON.stringify(commentString),
		type: req.body.type
	}).fetch();
	return createdApprovalRecord
}

async function updateApprovalStatusAfterApprovalLogCreation(req, approvalLog) {
	const loan_id = req.body.loan_id;
	const type = req.body.type;

	// const approvalLogList = await ApprovalLogsRd.find({
	// 	reference_id: loan_id,
	// 	type: type
	// }).sort("id DESC").limit(1).populate("user_id");
	const userData = await Users.findOne({id: approvalLog.user_id}).select(["usertype", "user_sub_type"])
	// for (const approvalLog of approvalLogList) {
	let approvalLogStatus;
	if (userData.usertype == "Bank" && userData.user_sub_type == "Compliance Maker") approvalLogStatus = "Maker pending"
	else if (userData.usertype == "Bank" && userData.user_sub_type == "Compliance Checker") approvalLogStatus = "Checker pending"
	else approvalLogStatus = approvalLog.status;
	if (approvalLogStatus && req.body.type != sails.config.msgConstants.DEVIATION_FLOW) {
		const loanBankMapping = await LoanBankMappingRd.find({loan_id: loan_id}).sort("id DESC").limit(1);
		let final_approval_status;
		if (loanBankMapping.length == 1) {
			if (loanBankMapping[0].approval_status) {
				console.log("update approval status")
				let approval_status = JSON.parse(loanBankMapping[0].approval_status);
				let filtered_approval_status = approval_status.filter((as) => as.type == type);
				if (filtered_approval_status.length != 0) {
					if (filtered_approval_status[0].status != approvalLogStatus) {
						filtered_approval_status[0].status = approvalLogStatus;
						final_approval_status = JSON.stringify(filtered_approval_status);
					}
				} else {
					approval_status[approval_status.length] = {
						type: type,
						status: approvalLogStatus
					};
					final_approval_status = JSON.stringify(approval_status);
				}
			} else {
				console.log("create approval status")
				final_approval_status = JSON.stringify([
					{
						type: type,
						status: approvalLogStatus
					}
				]);
			}

			const updatedLoanBankMappingRecord = await LoanBankMapping.updateOne({
				id: loanBankMapping[0].id
			}).set({
				approval_status: final_approval_status
			}).fetch();
			console.log("updated LoanBankMapping Record", loanBankMapping[0].id, final_approval_status, updatedLoanBankMappingRecord)
		}
	}
	// }
}

async function getCriteria(userType, userSubType, whiteLabelId, type, loggedInUser) {
	let baseCriteria = {
		usertype: userType,
		user_sub_type: userSubType,
		status: sails.config.msgConstants.ACTIVE,
		white_label_id: {
			like: `%${whiteLabelId}%`
		}
	};
	return await sails.helpers.userCriteria(baseCriteria, loggedInUser, type);
}

function saveToApprovalUserHierarchyList(approvalUserHierarchyList, user, hierarcyLevel) {
	const {id, name, usertype, user_sub_type, designation} = user;
	return approvalUserHierarchyList.push({
		id,
		name,
		usertype,
		user_sub_type,
		designation,
		hierarcyLevel: hierarcyLevel
	});
}

async function getApprovalStatus(req, type, loan_id) {
	const approvalLogs = await ApprovalLogsRd.find({
		reference_id: loan_id,
		type: type
	}).populate("user_id");

	let approvalUserHierarchyList = [
		{key: sails.config.msgConstants.REGIONAL, value: []},
		{key: sails.config.msgConstants.STATE, value: []},
		{key: sails.config.msgConstants.CITY, value: []},
		{key: sails.config.msgConstants.BRANCH, value: []}
	];

	for (const approvalLog of approvalLogs) {
		const {hierarchyName} = await getApprovalUserHierarchy(approvalLog);
		pushToApprovalUserHierarchyList(approvalUserHierarchyList, approvalLog, hierarchyName);
	}

	const {hierarchy} = await sails.helpers.userHierarchy(req.user);

	return filterAndGetApprovalStatus(hierarchy, approvalUserHierarchyList);
}

async function getApprovalUserHierarchy(approvalLogObj) {
	const updatedApprovalLogJson = await sails.helpers.escapeBackSlash(JSON.stringify(approvalLogObj));
	const parseApprovalLogJson = JSON.parse(JSON.stringify(updatedApprovalLogJson));
	const user = parseApprovalLogJson.user_id;
	if (user != null) {
		return await sails.helpers.userHierarchy(user);
	} else return 0;
}

function pushToApprovalUserHierarchyList(approvalUserHierarchyList, approvalLog, type) {
	let keyValuePair = approvalUserHierarchyList.find((item) => item.key == type);
	if (keyValuePair && Array.isArray(keyValuePair.value)) {
		keyValuePair.value.push(approvalLog.status);
	}
	return keyValuePair;
}

function getStatusFromApprovalUserHierarchyList(approvalUserHierarchyList, type) {
	const keyValuePair = approvalUserHierarchyList.find((item) => item.key == type);
	if (keyValuePair && Array.isArray(keyValuePair.value)) {
		if (keyValuePair.value.includes(sails.config.msgConstants.APPROVED)) {
			return sails.config.msgConstants.APPROVED;
		} else if (keyValuePair.value.includes(sails.config.msgConstants.REJECTED)) {
			return sails.config.msgConstants.REJECTED;
		}
	}
}

function filterAndGetApprovalStatus(hierarchy, approvalUserHierarchyList) {
	let regionalStatus, stateStatus, cityStatus, branchStatus;

	regionalStatus = getStatusFromApprovalUserHierarchyList(
		approvalUserHierarchyList,
		sails.config.msgConstants.REGIONAL
	);

	if (hierarchy == 1) {
		return regionalStatus;
	} else if (hierarchy == 2) {
		return regionalStatus != sails.config.msgConstants.UNDEFINED
			? regionalStatus
			: getStatusFromApprovalUserHierarchyList(approvalUserHierarchyList, sails.config.msgConstants.STATE);
	} else if (hierarchy == 3 || hierarchy == 4) {
		if (regionalStatus != sails.config.msgConstants.UNDEFINED) {
			return regionalStatus;
		} else if (regionalStatus == sails.config.msgConstants.UNDEFINED) {
			stateStatus = getStatusFromApprovalUserHierarchyList(
				approvalUserHierarchyList,
				sails.config.msgConstants.STATE
			);
			return stateStatus;
		} else if (stateStatus == sails.config.msgConstants.UNDEFINED) {
			cityStatus = getStatusFromApprovalUserHierarchyList(
				approvalUserHierarchyList,
				sails.config.msgConstants.CITY
			);
			return cityStatus;
		} else if (cityStatus == sails.config.msgConstants.UNDEFINED) {
			branchStatus = getStatusFromApprovalUserHierarchyList(
				approvalUserHierarchyList,
				sails.config.msgConstants.BRANCH
			);
			return branchStatus;
		}
	}
}

async function updateApprovalStatusAfterApprovalLogUpdation(type, status, loan_id) {
	if (status != null) {
		const loanBankMapping = await LoanBankMappingRd.find({loan_id: loan_id}).sort("id DESC").limit(1);
		let final_approval_status;
		if (loanBankMapping.length == 1) {
			let approval_status = JSON.parse(loanBankMapping[0].approval_status);
			if (approval_status) {
				let filtered_approval_status = approval_status.filter((as) => as.type == type);
				if (filtered_approval_status.length != 0) {
					console.log("update record")
					let loanStatus = filtered_approval_status[0].status.split(" ")[0]
					status = loanStatus == "Maker" ? `Maker ${status}` : loanStatus == "Checker" ? status : status
					approval_status.forEach((as) => {
						if (as.type == type) {
							as.status = status;
						}
					});
					final_approval_status = JSON.stringify(approval_status);

					const updatedRecord = await LoanBankMapping.updateOne({
						id: loanBankMapping[0].id
					}).set({
						approval_status: final_approval_status
					}).fetch();
					console.log("updated record", final_approval_status, updatedRecord)
				}
			}
		}
	}
}

/**
 * NOTE:
 * Below should contain only the code related to validations.
 * Others should be added above.
 */

function validateCreateApprovalRequest(req) {
	const {loan_id, approval_users_ids, type} = req.body;

	if (!loan_id || !approval_users_ids || approval_users_ids.length == 0 || !type) {
		return sails.config.msgConstants.APPROVAL_LOG_CREATE_MANDATORY_FIELDS;
	}

	let validateRequestedLoanResponse = validateRequestedLoan(loan_id);
	if (
		validateRequestedLoanResponse !== null &&
		validateRequestedLoanResponse !== undefined &&
		validateRequestedLoanResponse.trim() !== ""
	) {
		return validateRequestedLoanResponse;
	}

	let validateRequestedTypeResponse = validateRequestedType(type);
	if (
		validateRequestedTypeResponse !== null &&
		validateRequestedTypeResponse !== undefined &&
		validateRequestedTypeResponse.trim() !== ""
	) {
		return validateRequestedTypeResponse;
	}
}

function validateUpdateApprovalRequest(req) {
	const {loan_id, type, status} = req.body;

	if (!loan_id || !type || !status) {
		return sails.config.msgConstants.APPROVAL_LOG_UPDATE_MANDATORY_FIELDS;
	}

	let validateRequestedLoanResponse = validateRequestedLoan(loan_id);
	if (
		validateRequestedLoanResponse !== null &&
		validateRequestedLoanResponse !== undefined &&
		validateRequestedLoanResponse.trim() !== ""
	) {
		return validateRequestedLoanResponse;
	}

	let validateRequestedTypeResponse = validateRequestedType(type);
	if (
		validateRequestedTypeResponse !== null &&
		validateRequestedTypeResponse !== undefined &&
		validateRequestedTypeResponse.trim() !== ""
	) {
		return validateRequestedTypeResponse;
	}
}

function validateReassignAndCreateApprovalUserRequest(req) {
	const {loan_id, userId, toUserId, comments, type} = req.body;

	if (!loan_id || !userId || !toUserId || !type || !comments) {
		return sails.config.msgConstants.APPROVAL_LOG_REASSIGN_MANDATORY_FIELDS;
	}

	let validateRequestedLoanResponse = validateRequestedLoan(loan_id);
	if (
		validateRequestedLoanResponse !== null &&
		validateRequestedLoanResponse !== undefined &&
		validateRequestedLoanResponse.trim() !== ""
	) {
		return validateRequestedLoanResponse;
	}

	let validateRequestedTypeResponse = validateRequestedType(type);
	if (
		validateRequestedTypeResponse !== null &&
		validateRequestedTypeResponse !== undefined &&
		validateRequestedTypeResponse.trim() !== ""
	) {
		return validateRequestedTypeResponse;
	}
}

function validateRequestedLoan(loanId) {
	if (!loanId) {
		return sails.config.msgConstants.LOAN_ID_MANDATORY;
	}

	if (!sails.config.msgConstants.NUMBER_REGEX_PATTERN.test(loanId)) {
		return sails.config.msgConstants.LOAN_ID_TYPE_VALIDATION;
	}
}

function validateLoanRequest(loanId, loanRequest) {
	if (!loanRequest) {
		return sails.config.msgConstants.LOAN_REQUEST_NOT_FOUND + loanId;
	}
}

function validateLoanProduct(loanProduct, loanProductId) {
	if (!loanProduct) {
		return sails.config.msgConstants.LOAN_PRODUCT_NOT_FOUND + loanProductId;
	}
}

function validateRequestedRegion(regionId) {
	if (!regionId) {
		return sails.config.msgConstants.REGION_ID_MANDATORY;
	}

	if (!sails.config.msgConstants.NUMBER_REGEX_PATTERN.test(regionId)) {
		return sails.config.msgConstants.REGION_ID_TYPE_VALIDATION;
	}
}

function validateRequestedType(type) {
	if (!type) return sails.config.msgConstants.TYPE_MANDATORY;

	if (
		![
			"Sanction Limit",
			"Sanction Terms and Conditions",
			"Deviation Flow",
			"Crisil Report Approval",
			"Document Approval",
			"Disbursement Approval"
		].includes(type)
	)
		return sails.config.msgConstants.TYPE_VALIDATION;
}

function validateApprovalLogStatus(approvalLog) {
	if (
		approvalLog.status == sails.config.msgConstants.APPROVED ||
		approvalLog.status == sails.config.msgConstants.REJECTED
	)
		return sails.config.msgConstants.APPROVAL_LOG_INCORRECT_STATUS_UPDATE;
}

function validateTermsAndConditionsResponse(terms_conditions, loanProductId) {
	if (!terms_conditions) {
		return sails.config.msgConstants.TERMS_AND_CONDITIONS_NOT_FOUND + loanProductId;
	}
}

function validateLoanProductIdForLoanRequest(loanId, loanProductId) {
	if (!loanProductId) {
		return sails.config.msgConstants.LOAN_PRODUCT_ID_NOT_FOUND + loanId;
	}
}

function isDataExist(response) {
	return response !== null && response !== undefined && response.trim() !== "";
}

function calculateOfferAmount(offerAmount, offerAmountUm) {
	if (offerAmountUm == sails.config.msgConstants.MILLIONS) {
		return offerAmount * sails.config.msgConstants.INTEGER_MILLION;
	} else if (offerAmountUm == sails.config.msgConstants.CRORES) {
		return offerAmount * sails.config.msgConstants.INTEGER_CRORE;
	} else if (offerAmountUm == sails.config.msgConstants.LAKHS) {
		return offerAmount * sails.config.msgConstants.INTEGER_LAKH;
	} else if (offerAmountUm == sails.config.msgConstants.THOUSANDS) {
		return offerAmount * sails.config.msgConstants.INTEGER_THOUSAND;
	}
}

const isUniqueOption = (option, index, self) =>
	index ===
	self.findIndex(
		t => t?.id === option?.id
	);

async function queryForComplianceUsers(white_label_id, user_type, user_sub_type, regionId, state, city, branch_id, loanId, userId) {
console.log("0----------------------------------------------", white_label_id, user_type, user_sub_type, regionId, state, city, branch_id, loanId, userId);
	let complianceUsersList = [];

	const usersList = await UsersRd.find({usertype: user_type, white_label_id:{ contains : white_label_id}, user_sub_type: user_sub_type, status: "active"}).select(["name", "usertype", "state", "city", "branch_id", "user_sub_type", "designation", "is_branch_manager", "is_lender_manager", "is_state_access", "is_lender_admin"]);
console.log("usersList----------------------------------", usersList);
	if (usersList.length) {
		const userIds = usersList.map(record => record.id);
		const zoneData = await LoanAdditionalDataRd.find({loan_id: loanId}).select("zone_id");
		if (zoneData?.[0]?.zone_id) {
			const zoneMapping = await UsersSectionRd.find({user_id: {in: userIds}, section_ref: zoneData[0].zone_id, classification_type: "zone"})
			const filteredUserIDs = zoneMapping.map((record) => record.user_id);
			complianceUsersList = usersList.filter((record) =>
				filteredUserIDs.includes(record.id)
			);
		}
	}

	let regionalUsers = usersList.filter(obj => obj.is_lender_admin == 1);

	if (regionalUsers.length) {
		const userIds = regionalUsers.map(record => record.id);
		const lenderRegionMappingData = await LenderRegionMappingRd.find({user_id: {in: userIds}, region_id: regionId});
		const filteredUserIDs = lenderRegionMappingData.map((record) => record.user_id);
		regionalUsers = regionalUsers.filter((record) =>
			filteredUserIDs.includes(record.id)
		);
	}

	let stateUsers = usersList.filter(obj => obj.state === state);

	if (stateUsers.length) {
		stateUsers.forEach(obj => {
			if (obj.is_state_access === 1) complianceUsersList.push(obj)
			else if (obj.is_lender_manager === 1 && obj.city === city) complianceUsersList.push(obj)
			else if (obj.is_branch_manager === 1 && obj.branch_id === branch_id) complianceUsersList.push(obj)
		})
	}

	complianceUsersList = complianceUsersList.concat(regionalUsers)

	if (complianceUsersList.length) {
		// Filter unique options
		complianceUsersList = complianceUsersList?.filter(
			isUniqueOption
		);
		complianceUsersList = complianceUsersList.filter(item => item.id !== userId)
	}
	return complianceUsersList
}
