const myDBStore = sails.getDatastore("mysql_namastecredit_read");
module.exports = {
	createApprovalLog: async (req, res) => {
		try {
			let validatedCreateSanctionApprovalRequestResponse = validateCreateSanctionApprovalRequest(req);
			if (isDataExist(validatedCreateSanctionApprovalRequestResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedCreateSanctionApprovalRequestResponse
				});
			}

			const requestData = req.body;
			const userApprovalIds = requestData.requestApprovalFrom;

			for (const user of userApprovalIds) {
				const isApprovalLogExistForRequested = await ApprovalLogsRd.find({
					reference_id: requestData.loanId,
					type: sails.config.msgConstants.SANCTION_LIMIT,
					user_id: user
				});

				if (isApprovalLogExistForRequested.length != 0 && !requestData.stage) {
					return res.send({
						status: sails.config.msgConstants.NOT_OK_STATUS,
						message: sails.config.msgConstants.APPROVAL_LOGS_ALREADY_EXIST
					});
				}
			}

			if (userApprovalIds.length == 1 && userApprovalIds[0] == req.user.id) {
				await saveApprovalLogsAndUpdateApprovalStatus(requestData, userApprovalIds[0], req);
			} else {
				for (const userId of userApprovalIds) {
					await saveApprovalLogsAndUpdateApprovalStatus(requestData, userId, req);
				}
			}
			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.SANCTION_APPROVAL_LOG_CREATED,
				post: this.create
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.SANCTION_APPROVAL_LOG_CREATED_SERVER_ERROR + error);
		}
	},

	updateApprovalLogStatus: async (req, res) => {
		try {
			const approvalLogId = req.param(sails.config.msgConstants.REQUEST_PARAM_APPROVAL_LOG_ID);
			const loanId = req.body.loanId;
			let status = req.body.status;
			const comments = req.body.comment;
			// const higherApproval = req.body.higherApproval;

			let validatedUpdateSanctionApprovalRequest = validateUpdateSanctionApprovalRequest(req);
			if (isDataExist(validatedUpdateSanctionApprovalRequest)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedUpdateSanctionApprovalRequest
				});
			}

			const approvalLog = await ApprovalLogsRd.findOne({
				id: approvalLogId,
				type: sails.config.msgConstants.SANCTION_LIMIT,
				user_id: req.user.id
			});

			let validatedApprovalLogResponse = validateApprovalLog(approvalLog, approvalLogId);
			if (isDataExist(validatedApprovalLogResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedApprovalLogResponse
				});
			}

			let validatedApprovalLogStatusResponse = validateApprovalLogStatus(approvalLog);

			if (isDataExist(validatedApprovalLogStatusResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedApprovalLogStatusResponse
				});
			}

			// NEWLY ADDED
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

			if (!loanProduct.sanction_limit) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.SANCTION_LIMIT_NOT_FOUND + loanProductId
				});
			}

			const sanctionLimitJson = loanProduct.sanction_limit;
			let minSanctionValue, maxSanctionValue, range, user_level;

			const hierarchy_type = sanctionLimitJson.user_based ? sanctionLimitJson.user_based : null
			const commitee_based = sanctionLimitJson.commitee_based || null
			const no_of_stages = sanctionLimitJson.no_of_stages || null
			const list_all_level_users = sanctionLimitJson.list_all_level_users || null
			const consider_exposure = sanctionLimitJson.consider_exposure || null

			const userType = req.user.usertype;
			const userSubType = req.user.user_sub_type;
			let filteredData;

			let isEligible = false;

			const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);

			let offerAmount, offerAmountUm;
			if (loanBankMapping.length == 1) {
				offerAmount = loanBankMapping[0].offer_amnt;
				offerAmountUm = loanBankMapping[0].offer_amnt_um;
			}

			let calculatedOfferAmount;
			if (offerAmountUm == sails.config.msgConstants.MILLIONS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_MILLION;
			} else if (offerAmountUm == sails.config.msgConstants.CRORES) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_CRORE;
			} else if (offerAmountUm == sails.config.msgConstants.LAKHS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_LAKH;
			} else if (offerAmountUm == sails.config.msgConstants.THOUSANDS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_THOUSAND;
			}

			if (JSON.parse(hierarchy_type) || JSON.parse(list_all_level_users)) {
				const userData = await UsersRd.findOne({id: req.user.id})
				const userlimit = userData.user_limit ? JSON.parse(userData.user_limit) : null
				if (userlimit && Array.isArray(userlimit) && userlimit.length > 0) {
					user_level = userlimit[0].level;
					range = userlimit.find(user => user.product_id && Array.isArray(user.product_id) && user.product_id.includes(loanRequest.loan_product_id))
				}
				if (range) {
					minSanctionValue = range.min_val
					maxSanctionValue = range.max_val
				}
			}

			else if (JSON.parse(commitee_based)) {
				if (consider_exposure) {
					let filtered_approval_status;
					const approval_status = JSON.parse(loanBankMapping[0].approval_status);
					if (approval_status) filtered_approval_status = approval_status.find((as) => as.type == sails.config.msgConstants.SANCTION_LIMIT);
					if (!filtered_approval_status?.sanctionType) return res.ok({status: "nok", message: "Approval not Allowed"})
					const [natureOfFacility, natureOfLimit, sanctionAmount] = filtered_approval_status.sanctionType.split(" ");
					filteredData = [findMatchingSanctionLimit(sanctionLimitJson.sanction_limit_exposure[natureOfFacility][natureOfLimit], sanctionAmount, userType, userSubType)]
				}
				else {
					filteredData = sanctionLimitJson.sanction_limit.filter(
						(sanction_limit) =>
							calculatedOfferAmount >= sanction_limit.min_val &&
							calculatedOfferAmount <= sanction_limit.max_val &&
							sanction_limit.user_type == userType &&
							sanction_limit.user_sub_type.includes(userSubType)
					);
				}
			}
			else {
				const userLevel = await sails.helpers.userHierarchy(req.user);
				filteredData = sanctionLimitJson.sanction_limit.filter(
					(sanction_limit) =>
						sanction_limit.user_type == userType &&
						sanction_limit.user_sub_type.includes(userSubType) &&
						sanction_limit.user_level == userLevel.hierarchyName
				);
			}
			if (filteredData && filteredData.length != 0) {
				minSanctionValue = filteredData[0].min_val;
				maxSanctionValue = filteredData[0].max_val;
			}

			//Conclude the eligibility based on the below condition.
			if (
				offerAmount != null &&
				calculatedOfferAmount >= Number(minSanctionValue) &&
				calculatedOfferAmount <= Number(maxSanctionValue)
			) {
				isEligible = true;
			}

			if (((JSON.parse(hierarchy_type) && no_of_stages == "multi") || JSON.parse(list_all_level_users)) && offerAmount != null) isEligible = true;

			if (!isEligible) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.USER_NOT_ELIGIBLE_TO_APPROVE
				});
			} else {
				const dateTime = await sails.helpers.indianDateTime();
				const existingApprovalLogComment = JSON.parse(approvalLog.comments);
				let comment = JSON.stringify(existingApprovalLogComment[0]);
				let jsonObject = JSON.parse(comment);
				jsonObject.assigneeComments = comments;
				jsonObject.updated_at = dateTime;
				existingApprovalLogComment[0] = jsonObject;

				if ((JSON.parse(hierarchy_type) && no_of_stages == "multi") || JSON.parse(list_all_level_users)) {
					let filtered_approval_status, approval_status;
					// if (!higherApproval) return res.ok({status: "nok", message: "Choice for Higher Approval is mandatory"})
					// if (higherApproval == "no") {
					if (loanBankMapping[0].approval_status != null && loanBankMapping[0].approval_status != undefined) {
						approval_status = JSON.parse(loanBankMapping[0].approval_status);
						filtered_approval_status = approval_status.filter(
							(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
						);
						// const isEligible = user_level?.split("_")?.[1] === filtered_approval_status?.[0]?.status?.split("_")[1]
						if (filtered_approval_status && filtered_approval_status.length > 0) {
							if (status === "approved" && !(calculatedOfferAmount >= Number(minSanctionValue) &&
								calculatedOfferAmount <= Number(maxSanctionValue))) return res.ok({status: "nok", message: "Approval not Allowed for this User"})
							const updatedApprovalLog = await ApprovalLogs.updateOne({
								id: approvalLogId
							}).set({
								comments: JSON.stringify(existingApprovalLogComment),
								status: status
							});
							status = status === "approved" ? "approved" : `${user_level}_${status}`
							approval_status.forEach((as) => {
								if (as.type == sails.config.msgConstants.SANCTION_LIMIT) {
									as.status = status;
								}
							});
							// final_approval_status = filtered_approval_status;
							await LoanBankMapping.updateOne({
								id: loanBankMapping[0].id,
								loan_id: loanBankMapping[0].loan_id
							}).set({
								approval_status: JSON.stringify(approval_status)
							});
							return res.ok({status: "ok", message: "Approval updated successfully"})
						}
					}
					return res.ok({status: "nok", message: "Approval not Allowed"})
					// }
					// else {
					// 	return res.ok({status: "ok", message: "Approval Log Updated successfully"})
					// }
				}
				else if (JSON.parse(commitee_based)) {
					let stage, approval_status;
					const user = await UsersRd.findOne({id: req.user.id}).select("user_limit");
					if (user && user.user_limit) {
						const userlimit = JSON.parse(user.user_limit)
						if (Array.isArray(userlimit) && userlimit.length > 0 && userlimit[0].level) {
							approval_status = JSON.parse(loanBankMapping[0].approval_status);
							let filtered_approval_status = approval_status.filter(
								(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
							);
							if (filtered_approval_status.length != 0) {
								let currentKey;
								const loanCurrentStatus = filtered_approval_status[0].status.split(" ");

								if (loanCurrentStatus.length > 1) currentKey = loanCurrentStatus[0]
								if (currentKey && filteredData[0][currentKey].includes(userlimit[0].level) && loanCurrentStatus[1] && loanCurrentStatus[1] == "pending") {
									// const currentStage = sanctionLimitJson.sanction_limit.find(user => calculatedOfferAmount >= user.min_val && calculatedOfferAmount <= user.max_val)
									// if (currentStage && currentStage.stage_1.includes(userlimit[0].level)) stage = status == "approved" ? "stage_2_pending" : status
									// else if (currentStage && currentStage.stage_2.includes(userlimit[0].level)) stage = status
									// else return res.ok({status: "nok", message: "Final Approval Failed"})
									const loanCurrentStage = loanCurrentStatus[0].split("_")
									stage = loanCurrentStage[0] == "approver" && loanCurrentStage[1] == no_of_stages ? status : `${loanCurrentStatus[0]} ${status}`

									if (loanBankMapping[0].approval_status != null && loanBankMapping[0].approval_status != undefined) {
										const updatedApprovalLog = await ApprovalLogs.updateOne({
											id: approvalLogId
										}).set({
											comments: JSON.stringify(existingApprovalLogComment),
											status: status
										});
										approval_status = JSON.parse(loanBankMapping[0].approval_status);
										filtered_approval_status = approval_status.filter(
											(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
										);


										if (filtered_approval_status && filtered_approval_status.length > 0) {
											approval_status.forEach((as) => {
												if (as.type == sails.config.msgConstants.SANCTION_LIMIT) {
													as.status = stage;
												}
											});
											// final_approval_status = filtered_approval_status;
											await LoanBankMapping.updateOne({
												id: loanBankMapping[0].id,
												loan_id: loanBankMapping[0].loan_id
											}).set({
												approval_status: JSON.stringify(approval_status)
											});
											return res.ok({status: "ok", message: "Approval updated successfully"})
										}
									}
								}
								else {
									return res.ok({status: "nok", message: `You're not allowed to perform Final Loan Approval action`})
								}
							}
						}
					}
					return res.ok({status: "nok", message: "Approval not Allowed"})
				}

				else {
					updatedApprovalLog.comments = await sails.helpers.escapeBackSlash(updatedApprovalLog.comments);

					const approvalLogStatus = await updateApprovalStatusInLoanBankMapping(
						loanId,
						req,
						sails.config.msgConstants.UPDATE_OPERATION
					);

					await updateApprovalStatus(approvalLogStatus, loanId);

					return res.send({
						status: sails.config.msgConstants.OK_STATUS,
						message: sails.config.msgConstants.SANCTION_APPROVAL_LOG_UPDATED,
						data: updatedApprovalLog
					});
				}
			}
		} catch (error) {
			return res.serverError(sails.config.msgConstants.SANCTION_APPROVAL_LOG_UPDATED_SERVER_ERROR + error);
		}
	},

	getByLoanProduct: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);

			let validatedRequestedLoanResponse = validateRequestedLoan(loanId);
			if (isDataExist(validatedRequestedLoanResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanResponse
				});
			}

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

			if (!loanProduct.sanction_limit) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.SANCTION_LIMIT_NOT_FOUND + loanProductId
				});
			}

			const sanctionLimitJson = loanProduct.sanction_limit;
			const userType = req.user.usertype;
			const userSubType = req.user.user_sub_type;
			const userLevel = await sails.helpers.userHierarchy(req.user);

			let minSanctionValue, maxSanctionValue, range, filteredData, matchedData, currentLevel, filtered_approval_status, sanction_flow, additionalInfo;

			const {user_based: hierarchy_type = null, commitee_based: commiteeBased = null, no_of_stages = null, list_all_level_users = null, consider_exposure = null} = sanctionLimitJson || {}

			let isEligible = false;

			const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);

			let offerAmount, offerAmountUm;
			if (loanBankMapping.length == 1) {
				offerAmount = loanBankMapping[0].offer_amnt;
				offerAmountUm = loanBankMapping[0].offer_amnt_um;
			}

			if (loanBankMapping[0].approval_status) {
				filtered_approval_status = JSON.parse(loanBankMapping[0].approval_status).filter(
					(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
				);
			}
			// const loanApprovalStatus = loanBankMapping?.[0]?.approval_status?.

			let calculatedOfferAmount;
			if (offerAmountUm == sails.config.msgConstants.MILLIONS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.MILLIONS;
			} else if (offerAmountUm == sails.config.msgConstants.CRORES) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_CRORE;
			} else if (offerAmountUm == sails.config.msgConstants.LAKHS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_LAKH;
			} else if (offerAmountUm == sails.config.msgConstants.THOUSANDS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_THOUSAND;
			}

			if (JSON.parse(hierarchy_type) || JSON.parse(list_all_level_users)) {
				// if (!no_of_stages || no_of_stages != "multi") {
				const userData = await UsersRd.findOne({id: req.user.id})
				const userlimit = userData.user_limit ? JSON.parse(userData.user_limit) : null
				if (userlimit && Array.isArray(userlimit) && userlimit.length > 0)
					range = userlimit.find(user => user.product_id && Array.isArray(user.product_id) && user.product_id.includes(loanRequest.loan_product_id))
				if (range) {
					minSanctionValue = range.min_val
					maxSanctionValue = range.max_val
				}
				sanction_flow = "level"
				// }
			}
			else if (commiteeBased) {
				const user = await UsersRd.findOne({id: req.user.id}).select("user_limit");
				if (!user || user.user_limit == null) return res.ok({status: "nok", message: "Sanction Limit is not Configured for User"})

				sanction_flow = "stage"

				const userlimit = JSON.parse(user.user_limit)
				if (Array.isArray(userlimit) && userlimit.length > 0 && userlimit[0].level) currentLevel = userlimit[0].level

				if (currentLevel) {
					if (consider_exposure) {
						if (filtered_approval_status && filtered_approval_status[0] && filtered_approval_status[0].sanctionType) {
							const [natureOfFacility, natureOfLimit, sanctionAmount] = filtered_approval_status[0].sanctionType.split(" ");
							matchedData = findMatchingSanctionLimit(sanctionLimitJson.sanction_limit_exposure[natureOfFacility][natureOfLimit], sanctionAmount, userType, userSubType)
							additionalInfo = filtered_approval_status[0].additionalInfo
						}
						else {
							const sanctionAdditionalData = JSON.parse(loanBankMapping[0]?.sanction_additional_data)?.assets
							if (!sanctionAdditionalData || !sanctionAdditionalData.length) return res.ok({status: "nok", message: "Please add a facility to proceed"})
							const sanctionJson = await getSanctionLimitForLoan(loanId, loanRequest.business_id, sanctionAdditionalData, sanctionLimitJson.sanction_limit_exposure, userType, userSubType)
							matchedData = sanctionJson?.sanctionLimit
							additionalInfo = sanctionJson?.additionalInfo
						}
						if (!matchedData) return res.ok({status: "nok", message: "Approval Limit not found for this Loan"})
					}
					else {
						matchedData = sanctionLimitJson.sanction_limit.find(
							(sanction_limit) =>
								calculatedOfferAmount >= sanction_limit.min_val &&
								calculatedOfferAmount <= sanction_limit.max_val &&
								sanction_limit.user_type == userType &&
								sanction_limit.user_sub_type.includes(userSubType)
						);
					}

					// if (filteredData.length == 0) {
					// 	filteredData = sanctionLimitJson.sanction_limit.filter(
					// 		(sanction_limit) =>
					// 			sanction_limit.user_type == userType &&
					// 			sanction_limit.user_sub_type.includes(userSubType)
					// 	);
					// }
				}
			}
			else {
				filteredData = sanctionLimitJson.sanction_limit.filter(
					(sanction_limit) =>
						sanction_limit.user_type == userType &&
						sanction_limit.user_sub_type.includes(userSubType) &&
						sanction_limit.user_level == userLevel.hierarchyName
				);
			}

			if (filteredData && filteredData.length != 0) {
				minSanctionValue = filteredData[0].min_val;
				maxSanctionValue = filteredData[0].max_val;
			}

			//Conclude the eligibility based on the below condition.
			if (
				offerAmount != null &&
				calculatedOfferAmount >= minSanctionValue &&
				calculatedOfferAmount <= maxSanctionValue
			) {
				isEligible = true;
			}
			if (matchedData && filtered_approval_status && filtered_approval_status[0] && filtered_approval_status[0].status === `approver_${Number(no_of_stages)} pending` && matchedData[`approver_${Number(no_of_stages)}`].includes(currentLevel)) isEligible = true

			const {id, name, usertype, user_sub_type, designation} = req.user;

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.SANCTION_LIMIT_BY_LOAN_PRODUCT_FETCHED,
				data: {
					id,
					name,
					usertype,
					user_sub_type,
					designation,
					loanProductId,
					minSanctionValue,
					maxSanctionValue,
					isEligible,
					sanction_flow,
					additionalInfo
				}
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.SANCTION_LIMIT_BY_LOAN_PRODUCT_SERVER_ERROR + error);
		}
	},

	getApprovalLogStatus: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);

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
			} // Validation Ends.

			const approvalLogsWithUsers = await ApprovalLogsRd.find({
				reference_id: loanId,
				//Type can be parameterized, will revisit.
				type: sails.config.msgConstants.SANCTION_LIMIT
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
					const recommended_by = await UsersRd.findOne({id: JSON.parse(approvalLog.comments)[0].assignedBy}).select(["name", "designation"]);

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
						comments: await sails.helpers.escapeBackSlash(approvalLog.comments),
						recommended_by
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

	getApprovalUserHierarchy: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);
			const regionId = req.param(sails.config.msgConstants.REQUEST_PARAM_REGION_ID);
			const declined = req.param("declined")

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

			const loanReqData = await LoanrequestRd.findOne({id: loanId}).select(["loan_product_id", "branch_id", "business_id"]);
			const productData = await LoanProductsRd.findOne({id: loanReqData.loan_product_id}).select("sanction_limit");
			const sanctionLimit = productData && productData.sanction_limit && productData.sanction_limit.sanction_limit ? productData.sanction_limit.sanction_limit : [];

			const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);

			if (loanBankMapping.length == 0) return res.ok({status: "nok", message: sails.config.msgConstants.LOAN_BANK_MAPPING_NOT_FOUND_FOR_REQUESTED_LOAN})
			let offerAmount, offerAmountUm, filtered_approval_status;
			if (loanBankMapping.length == 1) {
				offerAmount = loanBankMapping[0].offer_amnt;
				offerAmountUm = loanBankMapping[0].offer_amnt_um;
			}

			const approval_status = loanBankMapping[0].approval_status;
			if (approval_status != null && approval_status != undefined) {
				filtered_approval_status = JSON.parse(approval_status).filter(
					(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
				);
			}

			let calculatedOfferAmount;
			if (offerAmountUm == sails.config.msgConstants.MILLIONS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_MILLION;
			} else if (offerAmountUm == sails.config.msgConstants.CRORES) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_CRORE;
			} else if (offerAmountUm == sails.config.msgConstants.LAKHS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_LAKH;
			} else if (offerAmountUm == sails.config.msgConstants.THOUSANDS) {
				calculatedOfferAmount = offerAmount * sails.config.msgConstants.INTEGER_THOUSAND;
			}

			const {sanction_limit} = productData || {};
			const {user_based: hierarchy_type = null, no_of_stages = null, commitee_based = null, no_of_skips = null, list_all_level_users = null, max_user_level = null, consider_exposure = null} = sanction_limit || {};
			let matchedCommiteeLimit = sanctionLimit.find(({min_val, max_val}) =>
				calculatedOfferAmount >= min_val && calculatedOfferAmount <= max_val);
			let sanctionType, additionalInfo;
			let {approval_list: {user_type, user_sub_type} = {}, min_val, max_val} = matchedCommiteeLimit || {};
			if (!user_type) {
				user_type = req.user.usertype
				user_sub_type = req.user.user_sub_type
			}
			if (consider_exposure) {
				if (filtered_approval_status && filtered_approval_status[0] && filtered_approval_status[0].sanctionType) {
					const [natureOfFacility, natureOfLimit, sanctionAmount] = filtered_approval_status[0].sanctionType.split(" ");
					matchedCommiteeLimit = findMatchingSanctionLimit(sanction_limit.sanction_limit_exposure[natureOfFacility][natureOfLimit], sanctionAmount, user_type, user_sub_type)
				}
				else {
					const sanctionAdditionalData = JSON.parse(loanBankMapping[0]?.sanction_additional_data)?.assets
					if (!sanctionAdditionalData || !sanctionAdditionalData.length) return res.ok({status: "nok", message: "Please add a facility to proceed"})
					const sanctionJson = await getSanctionLimitForLoan(loanId, loanReqData.business_id, sanctionAdditionalData, sanction_limit.sanction_limit_exposure, user_type, user_sub_type)
					matchedCommiteeLimit = sanctionJson?.sanctionLimit;
					sanctionType = sanctionJson?.sanctionType
					additionalInfo = sanctionJson?.additionalInfo
				}
				if (!matchedCommiteeLimit) return res.ok({status: "nok", message: "Approval Limit not found for this Loan"})
			}

			if (JSON.parse(hierarchy_type) && no_of_stages == "multi") {
				const user = await UsersRd.findOne({id: req.user.id}).select("user_limit");
				if (user && user.user_limit) {
					const userlimit = JSON.parse(user.user_limit)
					if (Array.isArray(userlimit) && userlimit.length > 0 && userlimit[0].level) {
						const currentUserLevel = userlimit[0].level.split("_")[1]
						let upperLevel = `level_${Number(currentUserLevel) + 1}`

						let allowedUpperLevelUsers = await queryUpperLevelUsers(req.user.loggedInWhiteLabelID, user_type, user_sub_type, upperLevel, regionId,
							req.user.state, req.user.city, loanReqData.branch_id, loanReqData.loan_product_id, 1, no_of_skips)

						// let allowedUpperLevelUsers = await queryNextLevelUser(user_type, user_sub_type, upperLevel, loanReqData.loan_product_id,
						// 	calculatedOfferAmount, req.user.loggedInWhiteLabelID, req.user.city, req.user.state, declined)

						// if (allowedUpperLevelUsers.length > 0) {
						// 	const userIds = allowedUpperLevelUsers.map(record => record.id);
						// 	const lenderRegionMappingData = await LenderRegionMappingRd.find({user_id: {in: userIds}, region_id: regionId});
						// 	const filteredUserIDs = lenderRegionMappingData.map((record) => record.user_id);
						// 	allowedUpperLevelUsers = allowedUpperLevelUsers.filter((record) =>
						// 		filteredUserIDs.includes(record.id)
						// 	);
						// }
						return res.ok({status: "ok", message: "Users List fetched successfully", data: allowedUpperLevelUsers})
					}
				}
				return res.ok({status: "nok", message: "User List is not configured"})
			}

			if (JSON.parse(commitee_based)) {
				if (matchedCommiteeLimit) {
					let stage, nextStage, upperLevelUsers;
					const user = await UsersRd.findOne({id: req.user.id}).select("user_limit");
					if (!user || user.user_limit == null) {
						return res.ok({status: "nok", message: "User List is not configured"})
					}

					const userlimit = JSON.parse(user.user_limit)
					if (Array.isArray(userlimit) && userlimit.length > 0 && userlimit[0].level) {
						if (approval_status == null || !filtered_approval_status || filtered_approval_status.length == 0) {
							let keys = [];
							for (key in matchedCommiteeLimit) {
								if (key.includes("recommender") || key.includes("approver")) keys.push(key)
							}
							let i = 0;
							while (i < keys.length) {
								if (matchedCommiteeLimit[keys[i]].includes(userlimit[0].level)) {
									break;
								}
								i++;
							}
							stage = keys[i + 1]
							nextStage = matchedCommiteeLimit[keys[i + 1]]
						}
						else {
							const loanStatus = filtered_approval_status[0].status.split(" ");
							if ((loanStatus[1] && (loanStatus[1] == "pending" || loanStatus[1] == "declined")) || (loanStatus[0] == "approved" || loanStatus[0] == "rejected" || loanStatus[0] == "declined")) {
								return res.ok({status: "ok", message: "Approval cannot be requested for the Loan"})
							}
							if (loanStatus[1] && loanStatus[1] == "recommend") {
								let keys = Object.keys(matchedCommiteeLimit);
								let index = keys.indexOf(loanStatus[0])
								if (index < keys.length) {
									stage = keys[index + 1];
									nextStage = matchedCommiteeLimit[stage];
								}
							}
						}
						if (!nextStage) return res.ok({status: "ok", message: "Approval cannot be requested for the Loan"})
						let query = `SELECT userid,name,usertype,user_sub_type,designation,user_limit FROM users WHERE (${nextStage.map(stage => `user_limit LIKE '%"${stage}"%'`).join(' OR ')}) AND white_label_id = ${req.user.loggedInWhiteLabelID}`;

						try {
							upperLevelUsers = await myDBStore.sendNativeQuery(query);
						} catch (err) {
							return res.ok({status: "nok", message: "Error in fetching Users List"});
						}
						let allowedUpperLevelUsers = upperLevelUsers.rows.filter(user => {
							const userLimit = JSON.parse(user.user_limit);
							return userLimit.some(limit => {
								return (
									limit.product_id.includes(loanReqData.loan_product_id)
								);
							});
						});
						if (allowedUpperLevelUsers.length > 0) {
							allowedUpperLevelUsers.forEach(user => {
								user.id = user.userid,
									user.stage = stage
								user.minSanctionValue = min_val
								user.maxSanctionValue = max_val,
									user.sanctionType = sanctionType,
									user.additionalInfo = additionalInfo
							})

							const userIds = allowedUpperLevelUsers.map(record => record.id);
							const lenderRegionMappingData = await LenderRegionMappingRd.find({user_id: {in: userIds}, region_id: regionId});
							const filteredUserIDs = lenderRegionMappingData.map((record) => record.user_id);
							allowedUpperLevelUsers = allowedUpperLevelUsers.filter((record) =>
								filteredUserIDs.includes(record.id)
							);
						}
						return res.ok({status: "ok", message: "Users List fetched successfully", data: allowedUpperLevelUsers})
					}
					return res.ok({status: "nok", message: "User Level not found"})
				}
				return res.ok({
					status: "nok",
					message: "Offer Amount not valid for Approval"
				})
			}

			else if (JSON.parse(list_all_level_users)) {
				if (!max_user_level) return res.ok({status: "nok", message: "Maximum level not configured"})
				const user = await UsersRd.findOne({id: req.user.id}).select("user_limit");
				if (user && user.user_limit) {
					const userlimit = JSON.parse(user.user_limit)
					if (Array.isArray(userlimit) && userlimit.length > 0 && userlimit[0].level) {
						let upperLevel = [];
						const currentUserLevel = userlimit[0].level.split("_")[1]
						for (i = Number(currentUserLevel) + 1; i <= max_user_level; i++) {
							upperLevel.push(`level_${i}`)
						}

						let allowedUpperLevelUsers = await queryUpperLevelUsers(req.user.loggedInWhiteLabelID, user_type, user_sub_type, upperLevel, regionId,
							req.user.state, req.user.city, loanReqData.branch_id, loanReqData.loan_product_id)

						return res.ok({status: "ok", message: "Users List fetched successfully", data: allowedUpperLevelUsers})
					}
				}
				return res.ok({status: "nok", message: "User List is not configured"})
			}

			// 	let filtered_approval_status, level, query, upperLevelUsers;
			// 	// const approval_status = loanBankMapping[0].approval_status;
			// 	if (approval_status != null && approval_status != undefined) {
			// 		filtered_approval_status = JSON.parse(approval_status).filter(
			// 			(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
			// 		);
			// 	}

			// 	if (approval_status == null || !filtered_approval_status || filtered_approval_status.length == 0 || (filtered_approval_status.length > 0 && filtered_approval_status[0].status == "stage_1_pending")) {
			// 		query = `SELECT userid,name,usertype,user_sub_type,designation,user_limit FROM users WHERE ${stage_1.map(stage => `user_limit LIKE '%"${stage}"%'`).join(' OR ')}`;
			// 		level = "stage 1"
			// 	}
			// 	else if (approval_status && filtered_approval_status.length > 0 && filtered_approval_status[0].status == "stage_2_pending") {
			// 		query = `SELECT userid,name,usertype,user_sub_type,designation,user_limit FROM users WHERE ${stage_2.map(stage => `user_limit LIKE '%"${stage}"%'`).join(' OR ')}`;
			// 		level = "stage 2"
			// 	}
			// 	if (!query) return res.ok({status: "nok", message: "No Users found found for the Loan"})

			// 	try {
			// 		upperLevelUsers = await myDBStore.sendNativeQuery(query);
			// 	} catch (err) {
			// 		return res.ok({status: "nok", message: "Error in fetching Users List"});
			// 	}
			// 	let allowedUpperLevelUsers = upperLevelUsers.rows.filter(user => {
			// 		const userLimit = JSON.parse(user.user_limit);
			// 		return userLimit.some(limit => {
			// 			return (
			// 				limit.product_id.includes(loanReqData.loan_product_id)
			// 			);
			// 		});
			// 	});
			// 	if (allowedUpperLevelUsers.length > 0) {
			// 		allowedUpperLevelUsers.forEach(user => {
			// 			user.id = user.userid,
			// 				user.stage = level
			// 			user.minSanctionValue = min_val
			// 			user.maxSanctionValue = max_val
			// 		})

			// 		const userIds = allowedUpperLevelUsers.map(record => record.id);
			// 		const lenderRegionMappingData = await LenderRegionMappingRd.find({user_id: {in: userIds}, region_id: regionId});
			// 		const filteredUserIDs = lenderRegionMappingData.map((record) => record.user_id);
			// 		allowedUpperLevelUsers = allowedUpperLevelUsers.filter((record) =>
			// 			filteredUserIDs.includes(record.id)
			// 		);
			// 	}
			// 	return res.ok({status: "ok", message: "Users List fetched successfully", data: allowedUpperLevelUsers})
			// }
			// 	else return res.ok({
			// 		status: "nok",
			// 		message: "Offer Amount not valid for Approval"
			// 	})
			// }

			const userType = req.user.usertype;
			const userSubType = req.user.user_sub_type;
			const whiteLabelId = req.user.loggedInWhiteLabelID;
			const approvalUserHierarchyList = [];

			// Criteria 1: Get the regional level users.
			let userList = await UsersRd.find(
				await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.REGIONAL, req.user)
			);
			console.log("111------------------userList---------------------------------", userList);
			if (userList.length > 0) {
				const regionResult = await UsersRd.getDatastore().sendNativeQuery(
					"SELECT * FROM users WHERE userid IN ($1) AND FIND_IN_SET($2, white_label_id)",
					[userList.map((user) => user.id), whiteLabelId]
				);
				userList = regionResult.rows;
			}
console.log("2222222222222222222222222222222======userList===================================", userList);
			const lenderRegionMapping = await LenderRegionMapping.find({
				region_id: regionId,
				user_id: userList.map((user) => user.userid)
			}).populate("user_id");
			for (const lrm of lenderRegionMapping) {
				saveToApprovalUserHierarchyList(
					approvalUserHierarchyList,
					lrm.user_id,
					sails.config.msgConstants.REGIONAL,
					sanctionLimit,
					hierarchy_type,
					loanReqData.loan_product_id
				);
			}

			// Criteria 2: Get the state level users.
			let stateLevelUserList = await UsersRd.find(
				await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.STATE, req.user)
			);

console.log("stateLevelUserList-------------------11111111111111111--------------------", stateLevelUserList);
			if (stateLevelUserList.length > 0) {
				const stateResult = await UsersRd.getDatastore().sendNativeQuery(
					"SELECT * FROM users WHERE userid IN ($1) AND FIND_IN_SET($2, white_label_id)",
					[stateLevelUserList.map((user) => user.id), whiteLabelId]
				);
				stateLevelUserList = stateResult.rows;
			}
console.log("stateLevelUserList------------------22222-------------------------", stateLevelUserList);
			for (const user of stateLevelUserList) {
				saveToApprovalUserHierarchyList(approvalUserHierarchyList, user, sails.config.msgConstants.STATE, sanctionLimit, hierarchy_type, loanReqData.loan_product_id);
			}

			//Criteria 3: Get the City level users.
			let cityLevelUserList = await UsersRd.find(
				await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.CITY, req.user)
			);
console.log("cityLevelUserList---------------------1111111111111------------------------", cityLevelUserList);
			if (cityLevelUserList.length > 0) {
				const cityResult = await UsersRd.getDatastore().sendNativeQuery(
					"SELECT * FROM users WHERE userid IN ($1) AND FIND_IN_SET($2, white_label_id)",
					[cityLevelUserList.map((user) => user.id), whiteLabelId]
				);
				cityLevelUserList = cityResult.rows;
			}
console.log("cityLevelUserList--------------------------222222222222222-------------------------", cityLevelUserList);
			for (const user of cityLevelUserList) {
				saveToApprovalUserHierarchyList(approvalUserHierarchyList, user, sails.config.msgConstants.CITY, sanctionLimit, hierarchy_type, loanReqData.loan_product_id);
			}

			// Criteria 4: Get the Branch level users.
			let branchLevelUserList = await UsersRd.find(
				await getCriteria(userType, userSubType, whiteLabelId, sails.config.msgConstants.BRANCH, req.user)
			);
console.log("branchLevelUserList----------------------------1111111111111111----------------------------", branchLevelUserList);
			if (branchLevelUserList.length > 0) {
				const branchResult = await UsersRd.getDatastore().sendNativeQuery(
					"SELECT * FROM users WHERE userid IN ($1) AND FIND_IN_SET($2, white_label_id)",
					[branchLevelUserList.map((user) => user.id), whiteLabelId]
				);
				branchLevelUserList = branchResult.rows;
			}
console.log("branchLevelUserList----------------22222222222222-------------------------------", branchLevelUserList);
			for (const user of branchLevelUserList) {
				saveToApprovalUserHierarchyList(approvalUserHierarchyList, user, sails.config.msgConstants.BRANCH, sanctionLimit, hierarchy_type, loanReqData.loan_product_id);
			}

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.APPROVAL_USER_HIERARCHY_FETCHED,
				data: approvalUserHierarchyList.reverse()
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.APPROVAL_USER_HIERARCHY_SERVER_ERROR + error);
		}
	},

	getLoanApprovalStatus: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);

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
			} //VALIDATION ENDS.

			const loanData = await LoanrequestRd.findOne({id: loanId})
			if (!loanData) {return res.ok({status: "nok", message: "No Loan found for given loan Id"})}
			const product_data = await LoanProductsRd.findOne({id: loanData.loan_product_id})

			if (product_data.sanction_limit == null || product_data.sanction_limit == "") {
				return res.ok({
					status: sails.config.msgConstants.OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_STATUS_FETCHED,
					data: {
						loan_id: loanId,
						approval_status: "approved"
					}
				})
			}

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
					.filter((approval_detail) => approval_detail.type == sails.config.msgConstants.SANCTION_LIMIT)
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

	getApprovalConditionByLoanProduct: async (req, res) => {
		try {
			const loanProductId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_PRODUCT_ID);

			let validatedRequestedLoanProductResponse = validateRequestedLoanProductId(loanProductId);
			if (
				validatedRequestedLoanProductResponse !== null &&
				validatedRequestedLoanProductResponse !== undefined &&
				validatedRequestedLoanProductResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanProductResponse
				});
			}

			const loanProduct = await LoanProductsRd.findOne({
				id: loanProductId
			});

			if (!loanProduct) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.LOAN_PRODUCT_NOT_FOUND + loanProductId
				});
			}
			const conditions = loanProduct.conditions;

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.LOAN_APPROVAL_CONDITION_BY_LOAN_PRODUCT_FETCHED,
				data: JSON.parse(conditions)
			});
		} catch (error) {
			return res.serverError(
				sails.config.msgConstants.LOAN_APPROVAL_CONDITION_BY_LOAN_PRODUCT_SERVER_ERROR + error
			);
		}
	},

	reassignApprovalUserForRequestedLoan: async (req, res) => {
		try {
			let validatedReassignSanctionApprovalResponse = validateReassignSanctionApprovalRequest(req);
			if (
				validatedReassignSanctionApprovalResponse !== null &&
				validatedReassignSanctionApprovalResponse !== undefined &&
				validatedReassignSanctionApprovalResponse.trim() !== ""
			) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedReassignSanctionApprovalResponse
				});
			}

			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);
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
			} //VALIDATION ENDS.

			const requestData = req.body;

			if (!requestData.userId || !requestData.toUserId || !requestData.remarks) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.SANCTION_APPROVAL_LOG_REASSIGN_MANDATORY_FIELDS
				});
			}

			requestData.loanId = loanId;

			const approvalLog = await ApprovalLogsRd.find({
				reference_id: loanId,
				user_id: requestData.userId,
				type: sails.config.msgConstants.SANCTION_LIMIT
			})
				.sort("id DESC")
				.limit(1);

			if (approvalLog.length == 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_LOG_NOT_FOUND_FOR_APPROVAL_LOG_ID
				});
			}

			const checkRequestedUserAlreadyAssigned = await ApprovalLogsRd.find({
				reference_id: loanId,
				user_id: requestData.toUserId,
				type: sails.config.msgConstants.SANCTION_LIMIT,
				status: {
					in: [
						sails.config.msgConstants.APPROVED,
						sails.config.msgConstants.PENDING,
						sails.config.msgConstants.REJECTED,
						sails.config.msgConstants.REASSIGNED
					]
				}
			});

			if (checkRequestedUserAlreadyAssigned.length != 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.REQUESTED_USER_ALREADY_ASSIGNED
				});
			}

			const existingApprovalLogComment = JSON.parse(approvalLog[0].comments);
			let comment = JSON.stringify(existingApprovalLogComment[0]);
			let jsonObject = JSON.parse(comment);
			jsonObject.assigneeComments = requestData.remarks;
			existingApprovalLogComment[0] = jsonObject;

			await ApprovalLogs.updateOne({
				id: approvalLog[0].id
			}).set({
				comments: JSON.stringify(existingApprovalLogComment),
				status: sails.config.msgConstants.REASSIGNED
			});

			const createdApprovalLog = await saveApprovalLogs(requestData, requestData.toUserId, req);

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
	updateDeviationStatus: async function (req, res) {
		const {loanId, method, status} = req.allParams();
		if (!loanId || !method || (method === "update" && !status)) {return res.badRequest(sails.config.res.missingFields);}
		if (isNaN(loanId)) {
			return res.badRequest({status: "nok", message: "Invalid Loan Id"})
		}
		const misActivityData = await MisActivityRd.findOne({loan_id: loanId}).select(["loan_id", "deviation_status"]);
		if (!misActivityData) {return res.ok({status: "nok", message: "No record found for the given loan Id"})}

		if (method == "get") {
			return res.ok({status: "ok", data: misActivityData})
		} else {
			let deviation_status = method == "update" ? status : method == "delete" ? null : null;
			await MisActivity.updateOne({loan_id: loanId}).set({deviation_status: deviation_status});
			return res.ok({
				status: "ok",
				message: "Deviation Status updated successfully"
			})
		}
	},
	updateFinalApprovalStatus: async function (req, res) {
		let {loanId, status, approvalLogId} = req.allParams();
		if (!loanId || !status || !approvalLogId) return res.badRequest(sails.config.res.missingFields);
		let approval_status, user_level;
		const approvalLog = await ApprovalLogsRd.findOne({id: approvalLogId})
		if (!approvalLog) return res.ok({status: "nok", message: "Approval Log not found"})
		const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);
		if (loanBankMapping.length > 0 && loanBankMapping[0].approval_status) {
			approval_status = JSON.parse(loanBankMapping[0].approval_status);
			let filtered_approval_status = approval_status.filter(
				(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
			);
			if (filtered_approval_status && filtered_approval_status.length > 0) {
				const userData = await UsersRd.findOne({id: req.user.id})
				const userlimit = userData.user_limit ? JSON.parse(userData.user_limit) : null
				if (userlimit && Array.isArray(userlimit) && userlimit.length > 0) user_level = userlimit[0].level;
				if (!user_level) return res.ok({status: "nok", message: "Level not configured for user"})
				const loanStatus = filtered_approval_status[0].status.split("_")
				const updatedApprovalLog = await ApprovalLogs.updateOne({
					id: approvalLogId
				}).set({
					status: status
				});
				if (loanStatus[0].includes("recommender") || loanStatus[0].includes("approver")) status = status === "approved" ? "approved" : `${loanStatus[0]}_${loanStatus[1].split(" ")[0]} ${status}`
				else status = status === "approved" ? "approved" : `${user_level}_${status}`
				approval_status.forEach((as) => {
					if (as.type == sails.config.msgConstants.SANCTION_LIMIT) {
						as.status = status;
					}
				})
				await LoanBankMapping.updateOne({
					id: loanBankMapping[0].id,
					loan_id: loanBankMapping[0].loan_id
				}).set({
					approval_status: JSON.stringify(approval_status)
				});
				return res.ok({status: "ok", message: "Final Approval updated successfully"})
			}
		}
		return res.ok({status: "nok", message: "Final Approval failed"})
	}
};

/**
 * NOTE:
 * The following functions are the helpers.
 */

async function saveApprovalLogsAndUpdateApprovalStatus(requestData, userApprovalId, req) {
	const createdApprovalLog = await saveApprovalLogs(requestData, userApprovalId, req);
	await updateApprovalStatusInLoanBankMapping(requestData.loanId, req, sails.config.msgConstants.POST_OPERATION, requestData.level, requestData.stage, createdApprovalLog, requestData.sanctionType, requestData.additionalInfo);
}

async function saveApprovalLogs(requestData, userId, req) {
	const dateTime = await sails.helpers.indianDateTime();
	const commentString = [
		{
			assignedBy: req.user.id,
			assigneeComments: "",
			assignedByComments: requestData.remarks,
			created_at: dateTime,
			updated_at: dateTime
		}
	];

	const createdApprovalLog = await ApprovalLogs.create({
		reference_id: requestData.loanId,
		reference_type: sails.config.msgConstants.LOAN,
		status: req.user.id == userId && !requestData.stage ? sails.config.msgConstants.APPROVED : sails.config.msgConstants.PENDING,
		user_id: userId,
		comments: JSON.stringify(commentString),
		//Type can be parameterized, will revisit.
		type: sails.config.msgConstants.SANCTION_LIMIT
	}).fetch();
	return createdApprovalLog
}

async function updateApprovalStatusInLoanBankMapping(loanId, req, operation, level, stage, approvalLog, sanctionType, additionalInfo) {
	if (
		operation == sails.config.msgConstants.POST_OPERATION ||
		operation == sails.config.msgConstants.REASSIGN_UPDATE_OPERATION
	) {
		// for (const approvalLog of approvalLogList) {
		await updateApprovalStatus(approvalLog.status, loanId, level, stage, req.user.id, approvalLog.user_id, sanctionType, additionalInfo);
		// }
	} else if (operation == sails.config.msgConstants.UPDATE_OPERATION) {
		let userApprovalHierarchyList = [
			{key: sails.config.msgConstants.REGIONAL, value: []},
			{key: sails.config.msgConstants.STATE, value: []},
			{key: sails.config.msgConstants.CITY, value: []},
			{key: sails.config.msgConstants.BRANCH, value: []}
		];

		const approvalLogList = await ApprovalLogsRd.find({
			reference_id: loanId,
			type: sails.config.msgConstants.SANCTION_LIMIT
		}).populate("user_id");

		for (const approvalLog of approvalLogList) {
			const {hierarchyName} = await getApprovalUserHierarchy(approvalLog);
			pushToApprovalUserHierarchyList(userApprovalHierarchyList, approvalLog, hierarchyName);
		}
		const {hierarchy} = await sails.helpers.userHierarchy(req.user);
		if (hierarchy == 1) {
			return getApprovalStatus(userApprovalHierarchyList, sails.config.msgConstants.REGIONAL);
		} else if (hierarchy == 2) {
			let regionalStatus = getApprovalStatus(userApprovalHierarchyList, sails.config.msgConstants.REGIONAL);
			return regionalStatus != sails.config.msgConstants.UNDEFINED
				? regionalStatus
				: getApprovalStatus(userApprovalHierarchyList, sails.config.msgConstants.STATE);
		} else if (hierarchy == 3) {
			return filterAndGetTheApprovalStatus(userApprovalHierarchyList, hierarchy);
		} else if (hierarchy == 4) {
			return filterAndGetTheApprovalStatus(userApprovalHierarchyList, hierarchy);
		}
	}
}

async function getApprovalUserHierarchy(approvalLogObj) {
	const updatedApprovalLogJson = await sails.helpers.escapeBackSlash(JSON.stringify(approvalLogObj));
	const parseApprovalLogJson = JSON.parse(JSON.stringify(updatedApprovalLogJson));
	const user = parseApprovalLogJson.user_id;
	if (user != null) {
		return await sails.helpers.userHierarchy(user);
	} else {
		return 0;
	}
}

function pushToApprovalUserHierarchyList(userApprovalHierarchyList, approvalLog, type) {
	let keyValuePair = userApprovalHierarchyList.find((item) => item.key == type);
	if (keyValuePair && Array.isArray(keyValuePair.value)) {
		keyValuePair.value.push(approvalLog.status);
	}
	return keyValuePair;
}

function getApprovalStatus(userApprovalHierarchyList, type) {
	const keyValuePair = userApprovalHierarchyList.find((item) => item.key == type);
	if (keyValuePair && Array.isArray(keyValuePair.value)) {
		if (keyValuePair.value.includes(sails.config.msgConstants.APPROVED)) {
			return sails.config.msgConstants.APPROVED;
		} else if (keyValuePair.value.includes(sails.config.msgConstants.REJECTED)) {
			return sails.config.msgConstants.REJECTED;
		}
	}
}

async function getCriteria(userType, userSubType, whiteLabelId, type, loggedInUser) {
	let baseCriteria = {
		usertype: userType,
		user_sub_type: userSubType,
		status: sails.config.msgConstants.ACTIVE
	};
	return await sails.helpers.userCriteria(baseCriteria, loggedInUser, type);
}

function saveToApprovalUserHierarchyList(sanctionApprovalUserHierarchyList, user, hierarcyLevel, sanctionLimit, hierarchy_type, productId) {
	const {name, usertype, user_sub_type, designation} = user;
	let minSanctionValue, maxSanctionValue, range;
	if (JSON.parse(hierarchy_type)) {
		const userlimit = user.user_limit ? JSON.parse(user.user_limit) : null
		if (userlimit && Array.isArray(userlimit) && userlimit.length > 0) {
			range = userlimit.find(user => user.product_id && Array.isArray(user.product_id) && user.product_id.includes(productId))
		}
	}
	if (range) {
		minSanctionValue = range.min_val
		maxSanctionValue = range.max_val
	}
	else if (sanctionLimit.length > 0) {
		const filteredData = sanctionLimit.filter((sanction_limit) =>
			sanction_limit.user_type == usertype &&
			sanction_limit.user_sub_type.includes(user_sub_type) &&
			sanction_limit.user_level == hierarcyLevel)

		if (filteredData.length != 0) {
			minSanctionValue = filteredData[0].min_val;
			maxSanctionValue = filteredData[0].max_val;
		}
	}

	return sanctionApprovalUserHierarchyList.push({
		id: user.id || user.userid,
		name,
		usertype,
		user_sub_type,
		designation,
		hierarcyLevel: hierarcyLevel,
		minSanctionValue,
		maxSanctionValue
	});
}

async function updateApprovalStatus(approvalLogStatus, loanId, level, stage, loggedInUserId, assignedUserId, sanctionType, additionalInfo) {
	if (approvalLogStatus != null) {
		const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);
		let final_approval_status;
		if (loanBankMapping.length == 1) {
			let approval_status = JSON.parse(loanBankMapping[0].approval_status);
			if (approval_status != null && approval_status != undefined) {
				let filtered_approval_status = approval_status.filter(
					(as) => as.type == sails.config.msgConstants.SANCTION_LIMIT
				);
				if (filtered_approval_status.length != 0) {
					if (filtered_approval_status[0].status != approvalLogStatus) {
						approval_status.forEach((as) => {
							if (as.type == sails.config.msgConstants.SANCTION_LIMIT) {
								as.status = approvalLogStatus;
							}
						});
					}
					if ((loggedInUserId && assignedUserId && (loggedInUserId != assignedUserId)) || stage) {
						if (level && level != "") {
							approval_status.forEach((as) => {
								if (as.type == sails.config.msgConstants.SANCTION_LIMIT) {
									as.status = `level_${Number(level)}_pending`;
								}
							})
						}
						else if (stage && stage != "") {
							approval_status.forEach((as) => {
								if (as.type == sails.config.msgConstants.SANCTION_LIMIT) {
									as.status = `${stage} pending`
								}
							})
						}
					}
					final_approval_status = JSON.stringify(approval_status);
				} else {
					let obj = {
						type: sails.config.msgConstants.SANCTION_LIMIT,
						status: approvalLogStatus
					};
					if ((loggedInUserId && assignedUserId && (loggedInUserId != assignedUserId)) || stage) {
						if (level && level != "") {
							obj.status = `level_${Number(level)}_pending`
						}
						else if (stage && stage != "") {
							obj.status = `${stage} pending`
							if (sanctionType) obj.sanctionType = sanctionType
							if (additionalInfo) obj.additionalInfo = additionalInfo
						}
					}
					approval_status.push(obj);
					final_approval_status = JSON.stringify(approval_status);
				}
			} else {
				let obj = [{
					type: sails.config.msgConstants.SANCTION_LIMIT,
					status: approvalLogStatus
				}];
				if ((loggedInUserId && assignedUserId && (loggedInUserId != assignedUserId)) || stage) {
					if (level && level != "") {
						obj[0].status = `level_${Number(level)}_pending`
					}
					else if (stage && stage != "") {
						obj[0].status = `${stage} pending`
						if (sanctionType) obj[0].sanctionType = sanctionType
						if (additionalInfo) obj[0].additionalInfo = additionalInfo
					}
				}
				final_approval_status = JSON.stringify(obj);
			}

			await LoanBankMapping.updateOne({
				id: loanBankMapping[0].id,
				loan_id: loanBankMapping[0].loan_id
			}).set({
				approval_status: final_approval_status
			});
		}
	}
}

function filterAndGetTheApprovalStatus(userApprovalHierarchyList, hierarchy) {
	let regionalStatus, stateStatus, cityStatus, branchStatus;
	regionalStatus = getApprovalStatus(userApprovalHierarchyList, sails.config.msgConstants.REGIONAL);
	if (regionalStatus != sails.config.msgConstants.UNDEFINED) {
		return regionalStatus;
	} else if (regionalStatus == sails.config.msgConstants.UNDEFINED) {
		stateStatus = getApprovalStatus(userApprovalHierarchyList, sails.config.msgConstants.STATE);
		if (stateStatus != undefined) return stateStatus;
	} else if (stateStatus == sails.config.msgConstants.UNDEFINED) {
		cityStatus = getApprovalStatus(userApprovalHierarchyList, sails.config.msgConstants.CITY);
		if (cityStatus != undefined) return cityStatus;
	}
	if (hierarchy == 4) {
		if (cityStatus == sails.config.msgConstants.UNDEFINED) {
			branchStatus = getApprovalStatus(userApprovalHierarchyList, sails.config.msgConstants.BRANCH);
			if (branchStatus != undefined) return branchStatus;
		}
	}
}

/**
 * NOTE:
 * The following functions are related to validations.
 */

function validateCreateSanctionApprovalRequest(req) {
	const {loanId, requestApprovalFrom} = req.body;

	if (!loanId || !requestApprovalFrom || requestApprovalFrom.length == 0) {
		return sails.config.msgConstants.SANCTION_APPROVAL_LOG_CREATE_MANDATORY_FIELDS;
	}

	let validateRequestedLoanResponse = validateRequestedLoan(loanId);
	if (
		validateRequestedLoanResponse !== null &&
		validateRequestedLoanResponse !== undefined &&
		validateRequestedLoanResponse.trim() !== ""
	) {
		return validateRequestedLoanResponse;
	}
}

function validateUpdateSanctionApprovalRequest(req) {
	const {loanId} = req.body;
	const approvalLogId = req.param(sails.config.msgConstants.REQUEST_PARAM_APPROVAL_LOG_ID);
	if (!loanId || !approvalLogId) {
		return sails.config.msgConstants.SANCTION_APPROVAL_LOG_UPDATE_MANDATORY_FIELDS;
	}

	let validateRequestedLoanResponse = validateRequestedLoan(loanId);
	if (
		validateRequestedLoanResponse !== null &&
		validateRequestedLoanResponse !== undefined &&
		validateRequestedLoanResponse.trim() !== ""
	) {
		return validateRequestedLoanResponse;
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

function validateRequestedLoanProductId(loanProductId) {
	if (!loanProductId) {
		return sails.config.msgConstants.LOAN_PRODUCT_ID_MANDATORY;
	}

	if (!sails.config.msgConstants.NUMBER_REGEX_PATTERN.test(loanProductId)) {
		return sails.config.msgConstants.PRODUCT_ID_TYPE_VALIDATION;
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

function validateLoanProductIdForLoanRequest(loanId, loanProductId) {
	if (!loanProductId) {
		return sails.config.msgConstants.LOAN_PRODUCT_ID_NOT_FOUND + loanId;
	}
}

function validateApprovalLog(approvalLog, approvalLogId) {
	if (!approvalLog) {
		return sails.config.msgConstants.APPROVAL_LOG_NOT_FOUND_FOR_APPROVAL_LOG_ID + approvalLogId;
	}
}

function validateApprovalLogStatus(approvalLog) {
	if (
		approvalLog.status == sails.config.msgConstants.APPROVED ||
		approvalLog.status == sails.config.msgConstants.REJECTED ||
		approvalLog.status == sails.config.msgConstants.DECLINED
	) {
		return sails.config.msgConstants.APPROVAL_LOG_INCORRECT_STATUS_UPDATE;
	}
}

function validateReassignSanctionApprovalRequest(req) {
	const requestData = req.body;
	const userId = requestData.userId;
	const toUserId = requestData.toUserId;
	const remarks = requestData.remarks;
	if (!userId || !toUserId || !remarks) {
		return sails.config.msgConstants.SANCTION_APPROVAL_LOG_REASSIGN_MANDATORY_FIELDS;
	}
}

function isDataExist(response) {
	return response !== null && response !== undefined && response.trim() !== "";
}

const isUniqueOption = (option, index, self) =>
	index ===
	self.findIndex(
		t => t?.id === option?.id
	);

// async function queryNextLevelUser(user_type, user_sub_type, upperLevel, productId, offerAmount, white_label_id, city, state, declined_loan) {
// 	const upperLevelUsers = await Users.find({
// 		white_label_id: white_label_id, usertype: user_type, city: city, state: state,
// 		user_sub_type: user_sub_type, status: "active", user_limit: {contains: upperLevel}
// 	}).select(["name", "usertype", "user_sub_type", "designation", "user_limit"]);
// 	let allowedUpperLevelUsers = upperLevelUsers.filter(user => {
// 		const userLimit = JSON.parse(user.user_limit);
// 		let matchingLimits;

// 		if (declined_loan) {
// 			matchingLimits = userLimit.filter(limit => {
// 				return (
// 					limit.product_id.includes(productId) &&
// 					offerAmount >= limit.min_val &&
// 					offerAmount <= limit.max_val
// 				);
// 			});
// 		}
// 		else {
// 			matchingLimits = userLimit.filter(limit => {
// 				return (
// 					limit.product_id.includes(productId)
// 				);
// 			});
// 		}
// 		if (matchingLimits.length > 0) {
// 			// upperLevel = `Level ${Number(upperLevel.split("_")[1])}`
// 			user.minSanctionValue = matchingLimits[0].min_val;
// 			user.maxSanctionValue = matchingLimits[0].max_val;
// 			user.level = upperLevel
// 			return user
// 		}
// 	});
// 	if (declined_loan) {
// 		if (allowedUpperLevelUsers.length > 0 || upperLevel == "level_15") return allowedUpperLevelUsers
// 		else {
// 			upperLevel = `level_${Number(upperLevel.split("_")[1]) + 1}`
// 			allowedUpperLevelUsers = await queryNextLevelUser(user_type, user_sub_type, upperLevel, productId, offerAmount, white_label_id, city, state, true)
// 			return allowedUpperLevelUsers
// 		}
// 	}
// 	else return allowedUpperLevelUsers
// }

async function queryUpperLevelUsers(white_label_id, user_type, user_sub_type, upperLevel, regionId, state, city, branch_id, loan_product_id, count, no_of_skips) {
	let upperLevelUsers = [], allowedUpperLevelUsers = [];
	let regionalUsers, stateUsers;
	if (Array.isArray(upperLevel)) {
		regionalUsers = await Users.find({
			white_label_id: white_label_id, usertype: user_type, is_lender_admin: 1,
			user_sub_type: user_sub_type, status: "active", or: upperLevel.map(value => {
				return {
					user_limit: {contains: value}
				};
			})
		}).select(["name", "usertype", "user_sub_type", "designation", "user_limit"]);
	}
	else {
		regionalUsers = await Users.find({
			white_label_id: white_label_id, usertype: user_type, is_lender_admin: 1,
			user_sub_type: user_sub_type, status: "active", user_limit: {contains: upperLevel}
		}).select(["name", "usertype", "user_sub_type", "designation", "user_limit"]);
	}

	if (regionalUsers.length > 0) {
		const userIds = regionalUsers.map(record => record.id);
		const lenderRegionMappingData = await LenderRegionMappingRd.find({user_id: {in: userIds}, region_id: regionId});
		const filteredUserIDs = lenderRegionMappingData.map((record) => record.user_id);
		regionalUsers = regionalUsers.filter((record) =>
			filteredUserIDs.includes(record.id)
		);
	}

	if (Array.isArray(upperLevel)) {
		stateUsers = await UsersRd.find({
			white_label_id: white_label_id, usertype: user_type, state: state,
			user_sub_type: user_sub_type, status: "active", or: upperLevel.map(value => {
				return {
					user_limit: {contains: value}
				};
			})
		}).select(["name", "usertype", "city", "branch_id", "user_sub_type", "designation", "user_limit", "is_branch_manager", "is_lender_manager", "is_state_access"]);
	}
	else {
		stateUsers = await UsersRd.find({
			white_label_id: white_label_id, usertype: user_type, state: state,
			user_sub_type: user_sub_type, status: "active", user_limit: {contains: upperLevel}
		}).select(["name", "usertype", "city", "branch_id", "user_sub_type", "designation", "user_limit", "is_branch_manager", "is_lender_manager", "is_state_access"]);
	}
	if (stateUsers.length) {
		stateUsers.forEach(obj => {
			if (obj.is_state_access === 1) upperLevelUsers.push(obj)
			else if (obj.is_lender_manager === 1 && obj.city === city) upperLevelUsers.push(obj)
			else if (obj.is_branch_manager === 1 && obj.branch_id === branch_id) upperLevelUsers.push(obj)
		})
	}

	upperLevelUsers = upperLevelUsers.concat(regionalUsers)

	if (upperLevelUsers.length > 0) {
		// Filter unique options
		upperLevelUsers = upperLevelUsers?.filter(
			isUniqueOption
		);

		allowedUpperLevelUsers = upperLevelUsers.filter(user => {
			const userLimit = JSON.parse(user.user_limit);
			let matchingLimits = userLimit.filter(limit => limit.product_id.includes(loan_product_id));
			if (matchingLimits.length > 0) {
				user.minSanctionValue = matchingLimits[0].min_val;
				user.maxSanctionValue = matchingLimits[0].max_val;
				user.level = userLimit?.[0]?.level || upperLevel;
				return user
			}
		});
	}
	if (allowedUpperLevelUsers.length > 0 || !no_of_skips || count == no_of_skips) return allowedUpperLevelUsers
	else {
		upperLevel = `level_${Number(upperLevel.split("_")[1]) + 1}`
		count = Number(count) + 1;
		allowedUpperLevelUsers = await queryUpperLevelUsers(white_label_id, user_type, user_sub_type, upperLevel, regionId, state, city, branch_id, loan_product_id, count, no_of_skips)
		return allowedUpperLevelUsers
	}
}

async function getSanctionLimitForLoan(loanId, businessId, sanctionAdditionalData, sanctionLimitExposure, userType, userSubType) {
	const directorData = await DirectorRd.find({business: businessId, applicant_relationship: "Co-Applicant Guarantor"}).select("business")
	const directorIds = directorData.map(item => item.id)
	directorIds.push(0);
	const loanFinancialsData = await LoanFinancialsRd.find({business_id: businessId, loan_id: loanId, source: "federal", fin_type: ["Outstanding Loans", "Others"], director_id: directorIds}).select("emi_details")

	let natureOfFacility, natureOfLimit, sanctionAmount, totalSum, sanctionLimit;
	if (loanFinancialsData.length == 0) natureOfLimit = "no_exposure"
	else if (loanFinancialsData.length == 1) natureOfLimit = "single_exposure"
	else natureOfLimit = "multiple_exposure"

	const additionalInfo = {type_of_exposure: natureOfLimit, total_exposure: 0};

	const {termLoanSum, workCapitalSum} = sanctionAdditionalData.reduce((acc, item) => {
		if (item.nature_of_limit === "Term Loan") {
			acc.termLoanSum += parseFloat(item.sanctioned_amount);
		} else {
			acc.workCapitalSum += parseFloat(item.sanctioned_amount);
		}
		return acc;
	}, {termLoanSum: 0, workCapitalSum: 0});
	if (loanFinancialsData.length) {
		const emiLoanSum = loanFinancialsData.reduce((sum, item) => {
			if (item.emi_details) {
				try {
					const emiDetails = JSON.parse(item.emi_details);
					const loanAmount = parseFloat(emiDetails?.LOAN_AMT);
					if (!isNaN(loanAmount)) {
						return sum + loanAmount;
					}
				} catch (error) { }
			}
			return sum;
		}, 0);
		totalSum = Number(emiLoanSum) + Number(termLoanSum) + Number(workCapitalSum)
		if (emiLoanSum) additionalInfo.total_exposure = emiLoanSum
	}
	if (termLoanSum > workCapitalSum) {
		natureOfFacility = "term_loan"
		sanctionAmount = termLoanSum
	}
	else if (termLoanSum < workCapitalSum) {
		natureOfFacility = "working_capital"
		sanctionAmount = workCapitalSum
	}
	if (totalSum) sanctionAmount = totalSum
	if (natureOfFacility && sanctionAmount) {
		sanctionLimit = findMatchingSanctionLimit(sanctionLimitExposure[natureOfFacility][natureOfLimit], sanctionAmount, userType, userSubType)
	}
	else {
		sanctionAmount = totalSum || termLoanSum || workCapitalSum
		const termLoanLimit = findMatchingSanctionLimit(sanctionLimitExposure["term_loan"][natureOfLimit], sanctionAmount, userType, userSubType)
		const workingCapitalLimit = findMatchingSanctionLimit(sanctionLimitExposure["working_capital"][natureOfLimit], sanctionAmount, userType, userSubType)
		if (termLoanLimit && workingCapitalLimit) {
			const termLoanLimitKeys = countRecommenderApproverKeys(termLoanLimit)
			const workingCapitalLimitKeys = countRecommenderApproverKeys(workingCapitalLimit)
			if (termLoanLimitKeys > workingCapitalLimitKeys) {
				sanctionLimit = termLoanLimit
				natureOfFacility = "term_loan"
			}
			else {
				sanctionLimit = workingCapitalLimit
				natureOfFacility = "working_capital"
			}
		}
	}
	additionalInfo.term_loan_amount = termLoanSum
	additionalInfo.working_capital_amount = workCapitalSum
	additionalInfo.sanction_amount = sanctionAmount
	additionalInfo.type_of_facility = natureOfFacility
	const sanctionType = `${natureOfFacility} ${natureOfLimit} ${sanctionAmount}`
	return {sanctionLimit, sanctionType, additionalInfo}
}

function findMatchingSanctionLimit(array, sanctionAmount, userType, userSubType) {
	return sanctionLimit = array.find((sanction_limit) =>
		sanctionAmount >= sanction_limit.min_val &&
		sanctionAmount <= sanction_limit.max_val &&
		sanction_limit.user_type == userType &&
		sanction_limit.user_sub_type.includes(userSubType))
}

function countRecommenderApproverKeys(obj) {
	return Object.keys(obj).filter(key => key.includes("recommender") || key.includes("approver")).length;
}
