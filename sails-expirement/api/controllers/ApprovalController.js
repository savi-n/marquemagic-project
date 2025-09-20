/**
 * ApprovalController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	index: async function (req, res) {
		try {
			const status = req.param("status") ? req.param("status") : sails.config.msgConstants.APPROVED,
			 page_count = req.param("skip") ? req.param("skip") : 0,
				limit_count = req.param("limit") ? req.param("limit") : 50,

			 reqData = {
					loan_status_id: req.param("status1"),
					loan_sub_status_id: req.param("status2"),
					loan_bank_status_id: req.param("status3"),
					loan_borrower_status_id: req.param("status4"),
					meeting_flag: req.param("status6"),
					search: req.param("search"),
					page_count: req.param("skip") ? req.param("skip") : 0,
					limit_count: req.param("limit") ? req.param("limit") : 50
				},

			 {whereCondition} = await sails.helpers.viewloanCondition(req.user, reqData),
				// let user_id, regionId;
				// if (["Checker", "Maker"].includes(req.user.usertype)) {
				// 	user_id = req.user.id;
				// 	regionId = undefined;
				// } else {
				// 	user_id = whereCondition["or"][1]["users"];
				// 	regionId = whereCondition["or"][0]["region_id"];
				// }
			 approvalLogs = await ApprovalLogsRd.find({
					status: status,
					user_id: req.user.id
				}),

				//Fetch Distinct Loan Ids based on statuses and user ids list from ApprovalLogs table
			 uniqueReferenceIds = [...new Set(approvalLogs.map((log) => log.reference_id))];
			 let viewAlogsFilterCondition = whereCondition;
			// Fetch required from existing where condition
			//const regionId = whereCondition["or"][0]["region_id"];
			// const whiteLabelId = whereCondition["white_label_id"];
			if (req.user.is_lender_admin !== 1 && uniqueReferenceIds.length > 0){
				viewAlogsFilterCondition = {
					... whereCondition,
					id: uniqueReferenceIds
				}
			}

			 view_loan_data = await ViewAlogsRd.find(viewAlogsFilterCondition)
				.populate("users")
				.populate("business")
				.populate("loan_bank_mapping")
				.populate("loan_products")
				.populate("loan_usage_type")
				.populate("loan_asset_type")
				.populate("lender_status")
				.populate("loan")
				.populate("sales_id")
				.sort("created_at ASC")
				.paginate({page: page_count, limit: limit_count});

			if (view_loan_data.length == 0) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message: sails.config.msgConstants.LOAN_LISTING_NOT_PRESENT
				});
			}

			for (const loan of view_loan_data) {
				if (loan.loan_bank_mapping && loan.loan_bank_mapping.bank_emp_id){
					const bankUserData = await UsersRd.findOne({
						id: loan.loan_bank_mapping.bank_emp_id
					}).select(["id", "name"]);
					if (bankUserData != null) {
						loan.loan_bank_mapping.bank_emp_name = bankUserData.name;
						loan.bank_emp_data = {
							id: bankUserData.id,
							name: bankUserData.name
						};
					}
				}
			}

			let loan,
			 view_loan_data_entries_array,
			 view_loan_data_values_array,
			 approvalLogsArray = [],
			 consolidated_loan_details = [];

			for (const [index, loanEntry] of view_loan_data.entries()) {
				loan = loanEntry;
				const approvalLogs = await ApprovalLogsRd.find({
					reference_id: loan.id,
					status: status,
					user_id: req.user.is_lender_admin !== 1 ? req.user.id : undefined
				}).populate("user_id");

				for (const approvalLog of approvalLogs) {
					approvalLogsArray.push({
						loanId: loan.id,
						type: approvalLog.type,
						userid: approvalLog.user_id,
						status: approvalLog.status
					});
				}
			}
			view_loan_data_entries_array = Array.from(view_loan_data.entries());
			view_loan_data_values_array = view_loan_data_entries_array.map(([key, value]) => value);

			for (const approvalLog of approvalLogsArray) {
				let viewLoan = view_loan_data_values_array.filter((val) => val.id == approvalLog.loanId);
				viewLoan.forEach((loan) => {
					consolidated_loan_details.push({...loan, approvalLogs: approvalLog});
				});
			}

			return res.ok({
				status: sails.config.msgConstants.OK_STATUS,
				loan_details: consolidated_loan_details
			});
		} catch (err) {
			return res.serverError(sails.config.msgConstants.LOAN_LISTING_SERVER_ERROR + err);
		}
	},

	getStatusAndActions: async function (req, res) {
		try {
			const approval_statuses = await ApprovalStatusRd.find({white_label_id: req.user.loggedInWhiteLabelID});
			if (approval_statuses.length === sails.config.msgConstants.INTEGER_ZERO) {
				return res.send({
					status: sails.config.msgConstants.NOT_OK_STATUS,
					message:
						sails.config.msgConstants.APPROVAL_STATUS_AND_ACTIONS_NOT_PRESENT_FOR_LOGGED_IN_WHITE_LABEL_USER
				});
			}

			const statusAndActionResponse = [];
			approval_statuses.map((approval_status) => {
				statusAndActionResponse.push({
					id: approval_status.id,
					status_name: approval_status.status_name,
					status: approval_status.status,
					actions: JSON.parse(approval_status.actions)
				});
			});

			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.STATUS_AND_ACTIONS_FETCHED,
				data: statusAndActionResponse
			});
		} catch (error) {
			return res.serverError(sails.config.msgConstants.STATUS_AND_ACTIONS_SERVER_ERROR + error);
		}
	}
};
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
function saveToApprovalUserHierarchyList(sanctionApprovalUserHierarchyList, user, hierarcyLevel) {
	const {id, name, usertype, user_sub_type, designation} = user;
	return sanctionApprovalUserHierarchyList.push({
		id,
		name,
		usertype,
		user_sub_type,
		designation,
		hierarcyLevel: hierarcyLevel
	});
}
function validateRequestedLoan(loanId, res) {
	if (!loanId) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.LOAN_ID_MANDATORY
		});
	}

	if (!sails.config.msgConstants.NUMBER_REGEX_PATTERN.test(loanId)) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.LOAN_ID_TYPE_VALIDATION
		});
	}
}
function validateRequestedRegion(regionId, res) {
	if (!regionId) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.REGION_ID_MANDATORY
		});
	}

	if (!sails.config.msgConstants.NUMBER_REGEX_PATTERN.test(regionId)) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.REGION_ID_TYPE_VALIDATION
		});
	}
}
