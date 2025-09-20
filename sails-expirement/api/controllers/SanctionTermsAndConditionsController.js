/**
 * SanctionTermsAndConditionsController
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	getExposureLimitByLoanProduct: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);

			// Validation on requested loan id.
			let validatedRequestedLoanResponse = validateRequestedLoan(loanId);
			if (isDataExist(validatedRequestedLoanResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanResponse
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

			let parsed_terms_conditions = JSON.parse(loanProduct.terms_conditions),
				sanction_condition = parsed_terms_conditions.sanction_condition,

				exposureLimit = sanction_condition[0].exposure_limit;

			if (exposureLimit.length == 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.EXPOSURE_LIMIT_NOT_FOUND
				});
			} else {
				exposureLimit = exposureLimit[0].value;
			}

			let isEligible = false;
			let loanStatus;

			const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);
			if (loanBankMapping[0]?.approval_status) {
				let approval_status = JSON.parse(loanBankMapping[0].approval_status);
				let filtered_approval_status = approval_status.find((as) => as.type == sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS);
				loanStatus = filtered_approval_status?.status
			}

			// let offerAmount, offerAmountUm;
			// if (loanBankMapping.length == 0) {
			// 	return res.send({
			// 		status: sails.config.msgConstants.NOT_OK_STATUS,
			// 		message: sails.config.msgConstants.LOAN_BANK_MAPPING_NOT_FOUND_FOR_REQUESTED_LOAN + loanId
			// 	});
			// }

			// if (!loanBankMapping[0].offer_amnt || !loanBankMapping[0].offer_amnt_um) {
			// 	return res.send({
			// 		status: sails.config.msgConstants.NOT_OK_STATUS,
			// 		message: sails.config.msgConstants.OFFER_AMOUNT_NOT_SET_FOR_REQUESTED_LOAN + loanId
			// 	});
			// }
			// offerAmount = loanBankMapping[0].offer_amnt;
			// offerAmountUm = loanBankMapping[0].offer_amnt_um;
			// let calculatedOfferAmount = calculateOfferAmount(offerAmount, offerAmountUm);

			// if (offerAmount != null && calculatedOfferAmount <= exposureLimit) {
			// 	isEligible = true;
			// }

			const {id, name, usertype, user_sub_type, designation} = req.user;
			if ((user_sub_type === "Compliance Checker" && loanStatus === "Checker pending") || (user_sub_type === "Sales" && parsed_terms_conditions?.compliance_flow && loanStatus === "pending") || (user_sub_type === "Sales" && !(parsed_terms_conditions?.compliance_flow))) isEligible = true

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.EXPOSURE_LIMIT_BY_LOAN_PRODUCT_FETCHED,
				data: {
					id,
					name,
					usertype,
					user_sub_type,
					designation,
					loanProductId,
					exposureLimit,
					isEligible,
					cad_status
				}
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.EXPOSURE_LIMIT_BY_LOAN_PRODUCT_SERVER_ERROR + error);
		}
	},

	getByLoan: async (req, res) => {
		try {
			const loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID),
				type = req.param(sails.config.msgConstants.REQUEST_PARAM_TYPE);
			let validatedRequestedLoanResponse = validateRequestedLoan(loanId);
			if (isDataExist(validatedRequestedLoanResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanResponse
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

			let response, sanction_condition_array;

			const loanPreFetch = await LoanPreFetchRd.find({
				loan_id: loanId,
				request_type: type
			})
				.sort("id DESC")
				.limit(1);

			if (loanPreFetch.length == 1) {
				response = await getJsonFromLoanPrefetch(loanPreFetch, loanProductId);
				sanction_condition_array = response.sanction_condition
			} else {
				response = await getJsonFromLoanProduct(loanProductId);
				sanction_condition_array = response.sanction_condition
				/* Get it from Remarks column of Loan Bank Mapping if the data is not updated in updated_json of loan prefetch.
			 */
				const loan_bank_mapping = await LoanBankMappingRd.find({
					loan_id: loanId
				})
					.sort("id DESC")
					.limit(1),

					remarks = loan_bank_mapping[0].remarks;
				if (remarks) {
					let isRemarksAlreadyPresentInUpdatedJson = sanction_condition_array.filter((sc) => sc.description == remarks);

					if (isRemarksAlreadyPresentInUpdatedJson.length == 0) {
						sanction_condition_array.push({
							id: sanction_condition_array.length + 1,
							description: [remarks],
							category: sanction_condition_array[0].category,
							status: sanction_condition_array[0].status,
							exposure_limit: sanction_condition_array[0].exposure_limit,
							target_date: "",
							approval_user_type: sanction_condition_array[0].approval_user_type,
							approval_user_sub_type: sanction_condition_array[0].approval_user_sub_type,
							received_from: sails.config.msgConstants.MANUAL_ENTRY_FROM_LBM_REMARKS,
						});
					}
				}
			}

			for (item of sanction_condition_array) {
				item.document_details = []
				if (item.doc_id && item.doc_id.length > 0)
					item.document_details = await LenderDocumentRd.find({id: item.doc_id, status: "active"}).sort("id DESC");
			}
			response.sanction_condition = sanction_condition_array;

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.TERMS_AND_CONDITIONS_FETCHED,
				data: {
					loanId,
					termsAndCondition: {...response}
				}
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.TERMS_AND_CONDITIONS_SERVER_ERROR + error);
		}
	},

	addSanctionTermsAndCondition: async (req, res) => {
		try {
			let validatedResponse = validateAddSanctionTermsAndCondition(req);

			if (validatedResponse !== null && validatedResponse !== undefined && validatedResponse.trim() !== "") {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedResponse
				});
			}
			const loggedInUser = req.user.id,
				requestData = req.body,
				loanId = requestData.loanId,
				{business_id} = await LoanrequestRd.findOne({id: loanId}).select("business_id").populate("business_id")
			let loanPreFetch = await LoanPreFetchRd.find({
				loan_id: loanId,
				request_type: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS
			})
				.sort("id DESC")
				.limit(1);

			let loanPreFetchUpdatedJson,
				loanPreFetchInitialJson,
				sanction_condition_array, loanPrefetchId;

			if (loanPreFetch.length != 0) {
				loanPrefetchId = loanPreFetch[0].id
				loanPreFetchUpdatedJson = loanPreFetch[0].updated_json;
				loanPreFetchInitialJson = loanPreFetch[0].initial_json;
			}
			if (requestData.document_details && requestData.document_details.length > 0) {
				const documentUpload = await sails.helpers.lenderDocUpload(
					requestData.document_details,
					loanId,
					requestData.document_details[0].loan_bank_mapping,
					business_id.userid,
					req.user.id,
					"", "yes"
				);
				requestData.doc_id = documentUpload.doc_id;
			}
			const dateTime = await sails.helpers.indianDateTime();
			if (requestData.target_date && requestData.updated_status && requestData.id) {
				loanPreFetchUpdatedJson = loanPreFetchUpdatedJson ? JSON.parse(loanPreFetchUpdatedJson).sanction_condition : JSON.parse(loanPreFetchInitialJson).sanction_condition;
				loanPreFetchUpdatedJson.forEach(o => {
					if (o.id == requestData.id) {
						let perviousIds = o.doc_id || [];
						perviousIds = requestData.doc_id ? perviousIds.concat(...requestData.doc_id) : perviousIds;
						o.updated_status = requestData.updated_status;
						o.target_date = requestData.target_date;
						o.updated_by = req.user.id;
						o.updated_at = dateTime;
						o.doc_id = perviousIds;
					}
				});
				loanPreFetchUpdatedJson = {sanction_condition: loanPreFetchUpdatedJson};

			} else {
				let response = await getUpdatedJsonFromLoanPrefetch(
					loggedInUser,
					requestData,
					loanId,
					loanPreFetch,
					loanPreFetchUpdatedJson,
					loanPreFetchInitialJson,
					sanction_condition_array
				);
				loanPreFetchUpdatedJson = response.updatedJson;
				loanPrefetchId = response.loanPreFetchId
			}

			if (loanPreFetch && loanPrefetchId && loanPreFetch.length > 0) {
				await LoanPreFetch.updateOne({id: loanPrefetchId}).set({
					updated_json: JSON.stringify(loanPreFetchUpdatedJson)
				});
			}

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS_ADDED,
				data: loanPreFetchUpdatedJson
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.ADD_SANCTION_TERMS_AND_CONDITIONS_SERVER_ERROR + error);
		}
	},

	updateSanctionTermsAndConditions: async (req, res) => {
		try {
			const requestData = req.body,
				loanId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_ID);
			let validatedRequestedLoanResponse = validateRequestedLoan(loanId);
			if (isDataExist(validatedRequestedLoanResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedLoanResponse
				});
			}

			const type = req.param(sails.config.msgConstants.REQUEST_PARAM_TYPE);
			let validatedRequestedTypeResponse = validateRequestedType(type);
			if (isDataExist(validatedRequestedTypeResponse)) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: validatedRequestedTypeResponse
				});
			}
			const loggedInUser = req.user.id,

				// Validation to check whether the loggedinuser is associated with the approval logs in order to perform an update.
				approvalLog = await ApprovalLogsRd.find({
					reference_id: loanId,
					type: type
				})
					.sort("id DESC")
					.limit(1);

			if (approvalLog.length != 1) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.APPROVAL_LOG_NOT_FOUND
				});
			}
			const loanPreFetch = await LoanPreFetchRd.find({
				loan_id: loanId,
				request_type: type
			})
				.sort("id DESC")
				.limit(1),
				{business_id} = await LoanrequestRd.findOne({id: loanId}).select("business_id").populate("business_id");

			let sanction_condition,
				loanPreFetchUpdatedJson,
				loanPreFetchInitialJson,
				parsed_updated_json;

			if (loanPreFetch.length != 0) {
				loanPreFetchUpdatedJson = loanPreFetch[0].updated_json;
				loanPreFetchInitialJson = loanPreFetch[0].initial_json;
			}
			parsed_updated_json = await getSanctionCondition(
				loanId,
				loanPreFetch,
				loanPreFetchUpdatedJson,
				loanPreFetchInitialJson,
				parsed_updated_json
			);

			sanction_condition = parsed_updated_json.sanction_condition;

			const dateTime = await sails.helpers.indianDateTime();
			for (const data in requestData) {
				let doc_id;
				if (requestData[data].document_details && requestData[data].document_details.length > 0) {
					const documentUpload = await sails.helpers.lenderDocUpload(
						requestData[data].document_details,
						loanId,
						requestData[data].document_details[0].loan_bank_mapping_id,
						business_id.userid,
						req.user.id,
						"", "yes"
					);
					doc_id = documentUpload.doc_id;
				}
				if (sanction_condition[data]) {
					perviousIds = parsed_updated_json.sanction_condition[data].doc_id || [];
					perviousIds = doc_id ? perviousIds.concat(...doc_id) : perviousIds;
					parsed_updated_json.sanction_condition[data] = {
						...sanction_condition[data],
						updated_status: requestData[data].updated_status,
						target_date: requestData[data].target_date,
						created_at: "",
						updated_by: req.user.id,
						updated_at: dateTime,
						doc_id: perviousIds,
					};
				}
			}

			updated_json = parsed_updated_json;
			await LoanPreFetch.updateOne({
				id: loanPreFetch[0].id
			}).set({
				updated_json: JSON.stringify(updated_json)
			});

			// const updatedResponse = await updateApprovalLogAndLoanBankMapping(loanId, type, loggedInUser, updated_json);

			// if (updatedResponse) {
			// 	return res.send({
			// 		status: sails.config.msgConstants.NOT_OK_STATUS,
			// 		message: sails.config.msgConstants.APPROVAL_LOG_AND_LOAN_BANK_MAPPING_NOT_UPDATED
			// 	});
			// }

			// // NOTE: To configure in order to call the below api only for registered client.
			// invokeNCFederalBankApiForComplianceCompletion(req.header.authorization, type, loanId, updated_json);

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS_UPDATED,
				data: updated_json
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.UPDATE_SANCTION_TERMS_AND_CONDITIONS_SERVER_ERROR + error);
		}
	},
	updateApproval: async function (req, res) {
		const {loan_id, type} = req.allParams();
		if (!loan_id || !type) {
			return res.badRequest({
				status: "nok",
				message: "Mandatory fields are missing."
			})
		}
		// const url = sails.config.updateSantionApi,
		// method = "PUT",
		// header = req.headers;
		const loanPreFetch = await LoanPreFetchRd.find({
			loan_id: loan_id,
			request_type: type
		}).select("updated_json")
			.sort("id DESC")
			.limit(1);

		const updatedResponse = await updateApprovalLogAndLoanBankMapping(loan_id, type, req.user.id, JSON.parse(loanPreFetch[0].updated_json));

		if (updatedResponse) {
			return res.send({
				status: sails.config.msgConstants.NOT_OK_STATUS,
				message: sails.config.msgConstants.APPROVAL_LOG_AND_LOAN_BANK_MAPPING_NOT_UPDATED
			});
		} else {
			// NOTE: To configure in order to call the below api only for registered client.
			invokeNCFederalBankApiForComplianceCompletion(loan_id);
			return res.ok({
				status: sails.config.msgConstants.OK_STATUS,
				message: "Sanction Terms and Conditions Approved.",
				data: updated_json
			})
		}
	}
};

/**
 * NOTE:
 * The following functions are the helpers.
 */

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

async function getJsonFromLoanPrefetch(loanPreFetch, loanProductId) {
	if (
		loanPreFetch[0].updated_json !== null &&
		loanPreFetch[0].updated_json !== undefined &&
		loanPreFetch[0].updated_json.trim() !== ""
	) {
		return JSON.parse(loanPreFetch[0].updated_json);
	} else if (
		loanPreFetch[0].initial_json !== null &&
		loanPreFetch[0].initial_json !== undefined &&
		loanPreFetch[0].initial_json.trim() !== ""
	) {
		return JSON.parse(loanPreFetch[0].initial_json);
	} else {
		return getJsonFromLoanProduct(loanProductId);
	}
}

async function getJsonFromLoanProduct(loanProductId) {
	const loanProduct = await LoanProductsRd.findOne({
		id: loanProductId
	}),
		terms_conditions = loanProduct.terms_conditions;
	if (terms_conditions != null) {
		return JSON.parse(terms_conditions);
	} else {
		return sails.config.msgConstants.TERMS_AND_CONDITION_NOT_PRESENT_IN_LOAN_PRODUCT;
	}
}

async function getUpdatedJsonFromLoanPrefetch(
	loggedInUser,
	requestData,
	loanId,
	loanPreFetch,
	loanPreFetchUpdatedJson,
	loanPreFetchInitialJson,
	sanction_condition_array
) {
	const dateTime = await sails.helpers.indianDateTime();
	if (
		loanPreFetchUpdatedJson != null &&
		loanPreFetchUpdatedJson !== undefined &&
		loanPreFetchUpdatedJson.trim() !== ""
	) {
		let parsedLoanPreFetchUpdatedJson = JSON.parse(loanPreFetchUpdatedJson);
		sanction_condition_array = parsedLoanPreFetchUpdatedJson.sanction_condition;
		let matchedSanctionCondition = sanction_condition_array.findIndex(obj => obj?.description?.[0] === requestData?.description?.[0])
		if (matchedSanctionCondition >= 0) {
			sanction_condition_array[matchedSanctionCondition]["updated_status"] = requestData.updated_status
			sanction_condition_array[matchedSanctionCondition]["target_date"] = requestData.target_date
			let perviousIds = sanction_condition_array[matchedSanctionCondition]["doc_id"] || []
			sanction_condition_array[matchedSanctionCondition]["doc_id"] = requestData.doc_id ? perviousIds.concat(...requestData.doc_id) : perviousIds;
		}
		else {
			sanction_condition_array.push({
				id: sanction_condition_array.length + 1,
				description: requestData.description,
				category: requestData.category || sanction_condition_array[0].category,
				status: sanction_condition_array[0].status,
				exposure_limit: sanction_condition_array[0].exposure_limit,
				target_date: requestData.target_date || "",
				approval_user_type: sanction_condition_array[0].approval_user_type,
				approval_user_sub_type: sanction_condition_array[0].approval_user_sub_type,
				received_from: sails.config.msgConstants.MANUAL_ENTRY,
				created_at: dateTime,
				created_by: loggedInUser,
				updated_at: dateTime,
				updated_by: loggedInUser,
				doc_id: requestData.doc_id || [],
				updated_status: requestData.updated_status || ""
			});
		}
		parsedLoanPreFetchUpdatedJson.sanction_condition = sanction_condition_array;
		loanPreFetchUpdatedJson = parsedLoanPreFetchUpdatedJson;
		return {loanPreFetchId: loanPreFetch[0].id, updatedJson: loanPreFetchUpdatedJson};
	} else if (
		loanPreFetchInitialJson != null &&
		loanPreFetchInitialJson !== undefined &&
		loanPreFetchInitialJson.trim() !== ""
	) {
		const parsedLoanPreFetchInitialJson = JSON.parse(loanPreFetchInitialJson);
		// Save the contents of Initial Json to Updated Json.
		updateLoanPreFetch = await LoanPreFetch.updateOne({id: loanPreFetch[0].id}).set({
			updated_json: JSON.stringify(parsedLoanPreFetchInitialJson)
		}).fetch();

		loanPreFetchUpdatedJson = updateLoanPreFetch.updated_json;
		const parsedLoanPreFetchUpdatedJson = JSON.parse(loanPreFetchUpdatedJson);
		sanction_condition_array = parsedLoanPreFetchUpdatedJson.sanction_condition;
		let matchedSanctionCondition = sanction_condition_array.findIndex(obj => obj?.description?.[0] === requestData?.description?.[0])
		if (matchedSanctionCondition >= 0) {
			sanction_condition_array[matchedSanctionCondition]["updated_status"] = requestData.updated_status
			sanction_condition_array[matchedSanctionCondition]["target_date"] = requestData.target_date
			let perviousIds = sanction_condition_array[matchedSanctionCondition]["doc_id"] || []
			sanction_condition_array[matchedSanctionCondition]["doc_id"] = requestData.doc_id ? perviousIds.concat(...requestData.doc_id) : perviousIds;
		}
		else {
			sanction_condition_array.push({
				id: sanction_condition_array.length + 1,
				description: [requestData.description],
				category: requestData.category || sanction_condition_array[0].category,
				status: sanction_condition_array[0].status,
				exposure_limit: sanction_condition_array[0].exposure_limit,
				target_date: requestData.target_date || "",
				approval_user_type: sanction_condition_array[0].approval_user_type,
				approval_user_sub_type: sanction_condition_array[0].approval_user_sub_type,
				received_from: sails.config.msgConstants.MANUAL_ENTRY,
				created_at: dateTime,
				created_by: loggedInUser,
				updated_at: dateTime,
				updated_by: loggedInUser,
				doc_id: requestData.doc_id || [],
				updated_status: requestData.updated_status || ""
			});
		}
		loanPreFetchUpdatedJson = {
			sanction_condition: sanction_condition_array
		};
		return {loanPreFetchId: loanPreFetch[0].id, updatedJson: loanPreFetchUpdatedJson};
	} else {
		return getUpdatedJsonFromLoanProduct(
			loggedInUser,
			requestData,
			loanId,
			loanPreFetch,
			loanPreFetchUpdatedJson,
			sanction_condition_array
		);
	}
}

async function getUpdatedJsonFromLoanProduct(
	loggedInUser,
	requestData,
	loanId,
	loanPreFetch,
	loanPreFetchUpdatedJson,
	sanction_condition_array
) {
	const dateTime = await sails.helpers.indianDateTime(),
		// validation on loan request for the requested loan id.
		loanRequest = await LoanrequestRd.findOne({id: loanId});
	let validatedLoanRequestResponse = validateLoanRequest(loanId, loanRequest);

	if (isDataExist(validatedLoanRequestResponse)) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: validatedLoanRequestResponse
		});
	}

	const loanProductId = loanRequest.loan_product_id;
	let validatedLoanProductIdForLoanRequestResponse = validateLoanProductIdForLoanRequest(loanId, loanProductId);

	if (isDataExist(validatedLoanProductIdForLoanRequestResponse)) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: validatedLoanProductIdForLoanRequestResponse
		});
	}
	const loanProduct = await LoanProductsRd.findOne({
		id: loanProductId
	}),

		terms_conditions = loanProduct.terms_conditions;

	if (loanProduct.terms_conditions != null) {
		let parsedTermsAndConditions = JSON.parse(terms_conditions),
			sanctionCondition = parsedTermsAndConditions.sanction_condition;

		if (sanctionCondition.length) {
			sanctionCondition[+requestData.termsIndex]["target_date"] = requestData.target_date
			sanctionCondition[+requestData.termsIndex]["updated_status"] = requestData.updated_status
			sanctionCondition[+requestData.termsIndex]["doc_id"] = requestData.doc_id || []
		}
		loanPreFetchUpdatedJson = {
			sanction_condition: sanctionCondition
		};
		let updatedLoanPreFetch;

		if (loanPreFetch.length != 0) {
			updatedLoanPreFetch = await LoanPreFetch.updateOne({id: loanPreFetch[0].id}).set({
				updated_json: JSON.stringify(loanPreFetchUpdatedJson)
			}).fetch();
		} else {
			// insert into loan prefetch updated json if there is no entry in loan prefetch for the requested loan.
			const dateTime = await sails.helpers.indianDateTime();
			updatedLoanPreFetch = await LoanPreFetch.create({
				request_type: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS,
				loan_id: loanId,
				updated_json: JSON.stringify(loanPreFetchUpdatedJson),
				director_id: 0,
				created_at: dateTime,
				updated_at: dateTime
			}).fetch();
		}

		if (updatedLoanPreFetch) loanPreFetchUpdatedJson = updatedLoanPreFetch.updated_json;
		let parsedLoanPreFetchUpdatedJson = JSON.parse(loanPreFetchUpdatedJson);
		sanction_condition_array = parsedLoanPreFetchUpdatedJson.sanction_condition;
		let matchedSanctionCondition = sanction_condition_array.findIndex(obj => obj?.description?.[0] === requestData?.description?.[0])
		if (matchedSanctionCondition >= 0) {
			sanction_condition_array[matchedSanctionCondition]["updated_status"] = requestData.updated_status
			sanction_condition_array[matchedSanctionCondition]["target_date"] = requestData.target_date
			let perviousIds = sanction_condition_array[matchedSanctionCondition]["doc_id"] || []
			sanction_condition_array[matchedSanctionCondition]["doc_id"] = requestData.doc_id ? perviousIds.concat(...requestData.doc_id) : perviousIds;
		} else {
			sanction_condition_array.push({
				id: sanction_condition_array.length + 1,
				description: [requestData.description],
				category: requestData.category || sanction_condition_array[0].category,
				status: sanction_condition_array[0].status,
				exposure_limit: sanction_condition_array[0].exposure_limit,
				target_date: requestData.target_date || "",
				approval_user_type: sanction_condition_array[0].approval_user_type,
				approval_user_sub_type: sanction_condition_array[0].approval_user_sub_type,
				received_from: sails.config.msgConstants.MANUAL_ENTRY,
				created_at: dateTime,
				created_by: loggedInUser,
				updated_at: dateTime,
				updated_by: loggedInUser,
				updated_status: requestData.updated_status || "",
				doc_id: requestData.doc_id || []
			});
		}

		loanPreFetchUpdatedJson = {
			sanction_condition: sanction_condition_array
		};
		return {loanPreFetchId: updatedLoanPreFetch?.id, updatedJson: loanPreFetchUpdatedJson};
	} else {
		let sanction_condition_array = [];
		sanction_condition_array.push({
			id: sanction_condition_array.length + 1,
			description: [requestData.description],
			category: requestData.category || sails.config.msgConstants.SANCTIONED,
			status: ["Complied", "Not Complied", "OTC", "PDD", "Waived"],
			exposure_limit: [],
			target_date: requestData.target_date || "",
			approval_user_type: "Bank",
			approval_user_sub_type: "Compliance",
			received_from: sails.config.msgConstants.MANUAL_ENTRY,
			created_at: dateTime,
			created_by: loggedInUser,
			updated_at: dateTime,
			updated_by: loggedInUser,
			updated_status: requestData.updated_status || "",
			doc_id: requestData.doc_id || []
		});

		loanPreFetchUpdatedJson = {
			sanction_condition: sanction_condition_array
		};
		return {loanPreFetchId: loanPreFetch?.[0]?.id, updatedJson: loanPreFetchUpdatedJson};
	}
}

async function getSanctionCondition(
	loanId,
	loanPreFetch,
	loanPreFetchUpdatedJson,
	loanPreFetchInitialJson,
	parsed_updated_json
) {
	if (
		loanPreFetchUpdatedJson != null &&
		loanPreFetchUpdatedJson !== undefined &&
		loanPreFetchUpdatedJson.trim() !== ""
	) {
		parsed_updated_json = JSON.parse(loanPreFetchUpdatedJson);

		// Get it from Remarks column of Loan Bank Mapping if the data is not updated in updated_json of loan prefetch.
		const loan_bank_mapping = await LoanBankMappingRd.find({
			loan_id: loanId
		})
			.sort("id DESC")
			.limit(1),

			remarks = loan_bank_mapping[0].remarks;
		if (remarks !== null && remarks !== undefined && remarks.trim() !== "") {
			let sanction_condition_array = parsed_updated_json.sanction_condition,
				isRemarksAlreadyPresentInUpdatedJson = sanction_condition_array.filter(
					(sc) =>
						sc.description == remarks &&
						sc.received_from == sails.config.msgConstants.MANUAL_ENTRY_FROM_LBM_REMARKS
				);

			if (isRemarksAlreadyPresentInUpdatedJson.length == 0) {
				sanction_condition_array.push({
					id: sanction_condition_array.length + 1,
					description: [remarks],
					category: sanction_condition_array[0].category,
					status: sanction_condition_array[0].status,
					exposure_limit: sanction_condition_array[0].exposure_limit,
					target_date: "",
					approval_user_type: sanction_condition_array[0].approval_user_type,
					approval_user_sub_type: sanction_condition_array[0].approval_user_sub_type,
					received_from: sails.config.msgConstants.MANUAL_ENTRY_FROM_LBM_REMARKS
				});
				parsed_updated_json.sanction_condition = sanction_condition_array;
			}
		} // Remarks inclusion ended.

		return parsed_updated_json;
	} else if (
		loanPreFetchInitialJson != null &&
		loanPreFetchInitialJson !== undefined &&
		loanPreFetchInitialJson.trim() !== ""
	) {
		let parsed_initial_json = JSON.parse(loanPreFetchInitialJson);

		// Get it from Remarks column of Loan Bank Mapping if the data is not updated in updated_json of loan prefetch.
		const loan_bank_mapping = await LoanBankMappingRd.find({
			loan_id: loanId
		})
			.sort("id DESC")
			.limit(1),

			remarks = loan_bank_mapping[0].remarks;
		if (remarks !== null && remarks !== undefined && remarks.trim() !== "") {
			let sanction_condition_array = parsed_initial_json.sanction_condition,
				isRemarksAlreadyPresentInUpdatedJson = sanction_condition_array.filter(
					(sc) =>
						sc.description == remarks &&
						sc.received_from == sails.config.msgConstants.MANUAL_ENTRY_FROM_LBM_REMARKS
				);

			if (isRemarksAlreadyPresentInUpdatedJson.length == 0) {
				sanction_condition_array.push({
					id: sanction_condition_array.length + 1,
					description: [remarks],
					category: sanction_condition_array[0].category,
					status: sanction_condition_array[0].status,
					exposure_limit: sanction_condition_array[0].exposure_limit,
					target_date: "",
					approval_user_type: sanction_condition_array[0].approval_user_type,
					approval_user_sub_type: sanction_condition_array[0].approval_user_sub_type,
					received_from: sails.config.msgConstants.MANUAL_ENTRY_FROM_LBM_REMARKS
				});
				parsed_initial_json.sanction_condition = sanction_condition_array;
			}
		} // Remarks inclusion ended.

		// Save the contents of Initial Json to Updated Json.
		await LoanPreFetch.updateOne({id: loanPreFetch[0].id}).set({
			updated_json: JSON.stringify(parsed_initial_json)
		});

		// Fetch the latest updated.
		const updatedLoanPreFetch = await LoanPreFetchRd.find({
			loan_id: loanId,
			request_type: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS
		})
			.sort("id DESC")
			.limit(1),
			updated_json = updatedLoanPreFetch[0].updated_json;
		parsed_updated_json = JSON.parse(updated_json);
		return parsed_updated_json;
	} else {
		return getSanctionConditionFromLoanProduct(loanId, loanPreFetch, loanPreFetchUpdatedJson, parsed_updated_json);
	}
}

async function getSanctionConditionFromLoanProduct(loanId, loanPreFetch, loanPreFetchUpdatedJson, parsed_updated_json) {
	const loanRequest = await LoanrequestRd.findOne({id: loanId});
	let validatedLoanRequestResponse = validateLoanRequest(loanId, loanRequest);

	if (isDataExist(validatedLoanRequestResponse)) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: validatedLoanRequestResponse
		});
	}

	const loanProductId = loanRequest.loan_product_id;
	let validatedLoanProductIdForLoanRequestResponse = validateLoanProductIdForLoanRequest(loanId, loanProductId);

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

	const terms_conditions = loanProduct.terms_conditions;

	if (loanProduct.terms_conditions != null) {
		let parsedTermsAndConditions = JSON.parse(terms_conditions);

		// Get it from Remarks column of Loan Bank Mapping if the data is not updated in updated_json of loan prefetch.
		const loan_bank_mapping = await LoanBankMappingRd.find({
			loan_id: loanId
		})
			.sort("id DESC")
			.limit(1),

			remarks = loan_bank_mapping[0].remarks;
		if (remarks !== null && remarks !== undefined && remarks.trim() !== "") {
			let sanction_condition_array = parsedTermsAndConditions.sanction_condition,
				isRemarksAlreadyPresentInUpdatedJson = sanction_condition_array.filter(
					(sc) =>
						sc.description == remarks &&
						sc.received_from == sails.config.msgConstants.MANUAL_ENTRY_FROM_LBM_REMARKS
				);

			if (isRemarksAlreadyPresentInUpdatedJson.length == 0) {
				sanction_condition_array.push({
					id: sanction_condition_array.length + 1,
					description: [remarks],
					category: sanction_condition_array[0].category,
					status: sanction_condition_array[0].status,
					exposure_limit: sanction_condition_array[0].exposure_limit,
					target_date: "",
					approval_user_type: sanction_condition_array[0].approval_user_type,
					approval_user_sub_type: sanction_condition_array[0].approval_user_sub_type,
					received_from: sails.config.msgConstants.MANUAL_ENTRY_FROM_LBM_REMARKS
				});
				parsedTermsAndConditions.sanction_condition = sanction_condition_array;
			}
		} // Remarks inclusion ended.

		let sanctionCondition = parsedTermsAndConditions.sanction_condition;
		loanPreFetchUpdatedJson = {
			sanction_condition: sanctionCondition
		};

		// Set to loan prefetch updated json if the record for the requested loan exist in loan prefetch.
		if (loanPreFetch.length != 0) {
			await LoanPreFetch.updateOne({id: loanPreFetch[0].id}).set({
				updated_json: JSON.stringify(loanPreFetchUpdatedJson)
			});
		} else {
			// insert into loan prefetch updated json if there is no entry in loan prefetch for the requested loan.
			const dateTime = await sails.helpers.indianDateTime();
			await LoanPreFetch.create({
				request_type: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS,
				reference_no: undefined,
				loan_id: loanId,
				initial_json: undefined,
				updated_json: undefined,
				status: sails.config.msgConstants.PENDING,
				third_party_response: undefined,
				director_id: 0,
				created_at: dateTime,
				updated_at: dateTime
			});
		}
		// Fetch the latest updated.
		const updatedLoanPreFetch = await LoanPreFetchRd.find({
			loan_id: loanId,
			request_type: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS
		})
			.sort("id DESC")
			.limit(1);

		parsed_updated_json = JSON.parse(updatedLoanPreFetch[0].updated_json);
		return parsed_updated_json;
	} else {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.TERMS_AND_CONDITIONS_NOT_FOUND
		});
	}
}

async function updateApprovalLogAndLoanBankMapping(loanId, type, loggedInUser, updated_json) {
	let totalSanctionConditions = updated_json.sanction_condition.length,
		totalUpdatedStatuses = updated_json.sanction_condition.filter((item) => item.updated_status).length;
	if (totalSanctionConditions == totalUpdatedStatuses) {
		const approvalLogRecord = await ApprovalLogsRd.find({
			reference_id: loanId,
			type: type
		})
			.sort("id DESC")
			.limit(1),

			approvalLog = approvalLogRecord[0];

		if (!approvalLog) {
			return sails.config.msgConstants.APPROVAL_LOG_NOT_FOUND;
		}

		await ApprovalLogs.updateOne({
			id: approvalLog.id
		}).set({
			status: sails.config.msgConstants.APPROVED
		});

		const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanId}).sort("id DESC").limit(1);
		let final_approval_status;
		if (loanBankMapping.length == 1) {
			let approval_status = JSON.parse(loanBankMapping[0].approval_status);

			if (approval_status != null && approval_status != undefined) {
				let filtered_approval_status = approval_status.filter((as) => as.type == type);
				if (filtered_approval_status.length != 0) {
					if (filtered_approval_status[0].status != sails.config.msgConstants.APPROVED) {
						approval_status.forEach((as) => {
							if (as.type == type) {
								as.status = sails.config.msgConstants.APPROVED;
							}
						});
						final_approval_status = JSON.stringify(approval_status);
					}
				}
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

async function invokeNCFederalBankApiForComplianceCompletion(loan_id) {
	try {
		const requestBody = {
			loan_id
		},

			/* NOTE:
		The below calls the intermediate API present in NC federal bank API Integration.
		Actual invocation to third party API and its response are handled there!
	  */

			url = sails.config.compliance_completion,
			header = {"Content-Type": "application/json"};
		await sails.helpers.sailstrigger(url, JSON.stringify(requestBody), header, "POST");
	} catch (error) {
		return res.serverError("Encountered error while calling the compiled completion API" + error);
	}
}

/**
 * NOTE:
 * The following functions are related to validations.
 */

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

function validateAddSanctionTermsAndCondition(req) {
	const {loanId, description} = req.body;

	if (!loanId || !description) {
		return sails.config.msgConstants.ADD_TERMS_AND_CONDITIONS_MANDATORY_FIELDS;
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

function validateRequestedType(type) {
	if (!type) return sails.config.msgConstants.TYPE_MANDATORY;

	if (!sails.config.APPROVAL_LOG_TYPES.includes(type)) return sails.config.msgConstants.TYPE_VALIDATION;
}

function isDataExist(response) {
	return response !== null && response !== undefined && response.trim() !== "";
}
