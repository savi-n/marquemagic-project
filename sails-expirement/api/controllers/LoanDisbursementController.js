const reqParams = require("../helpers/req-params"),
	moment = require("moment"),
	momentTimezone = require("moment-timezone");
const myDBStore = sails.getDatastore("mysql_namastecredit_read");


/**
 * LoanDisbursement
 *
 * @description :: Server-side logic for managing LoanDisbursement
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
* @api {get} /LoanDisbursement/ Loan Disbursement
* @apiName Loan Disbursement
* @apiGroup Loans
* @apiExample Example usage:
* curl -i localhost:1337/LoanDisbursement/

* @apiSuccess {Number} id ID of the disbursement loan.
* @apiSuccess {Number} disbursement_amt disbursement amount.
* @apiSuccess {String} disbursement_amt_um lakhs/crores.
* @apiSuccess {String} disbursement_date disbursement loan date.
* @apiSuccess {String} repayment_doc repayment document (by default it is set to null).
* @apiSuccess {String} channel_invoice
* @apiSuccess {String} lender_confirmation lender confirmation (by default it is null).
* @apiSuccess {String} disbursement_amount_edit_history edit history of the disbursement amount(by default it is null).
* @apiSuccess {String} created_at loan created date and time.
* @apiSuccess {String} updated_at loan updated date and time.
* @apiSuccess {String} notification_status notification status.
* @apiSuccess {String} uploadStatus Upload Status.

* @apiSuccess {Object} loan_bank_mapping_id
* @apiSuccess {Number} loan_bank_mapping_id.id loan bank mapping id.
* @apiSuccess {Number} loan_bank_mapping_id.loan_id loan id.
* @apiSuccess {Number} loan_bank_mapping_id.bank_emp_id bank employee id.
* @apiSuccess {Number} loan_bank_mapping_id.loan_bank_status loan bank status.
* @apiSuccess {Number} loan_bank_mapping_id.loan_borrower_status loan borrower status.
* @apiSuccess {Number} loan_bank_mapping_id.offer_amnt offer amount.
* @apiSuccess {String} loan_bank_mapping_id.offer_amnt_um Lakhs/Crore.
* @apiSuccess {Number} loan_bank_mapping_id.interest_rate interest rate.
* @apiSuccess {Number} loan_bank_mapping_id.term term.
* @apiSuccess {Number} loan_bank_mapping_id.emi emi.
* @apiSuccess {Number} loan_bank_mapping_id.processing_fee processing fee.
* @apiSuccess {Number} loan_bank_mapping_id.expected_time_to_disburse expected time to disburse.
* @apiSuccess {Number} loan_bank_mapping_id.offer_validity offer validity.
* @apiSuccess {String} loan_bank_mapping_id.remarks remarks.
* @apiSuccess {String} loan_bank_mapping_id.bank_assign_date bank assign date.
* @apiSuccess {String} loan_bank_mapping_id.lender_offer_date lender offer date.
* @apiSuccess {String} loan_bank_mapping_id.borrower_acceptence_date borrower acceptence date.
* @apiSuccess {String} loan_bank_mapping_id.meeting_flag meeting flag.
* @apiSuccess {String} loan_bank_mapping_id.notification_status notification status.
* @apiSuccess {String} loan_bank_mapping_id.upload_doc upload document.
* @apiSuccess {String} loan_bank_mapping_id.lender_ref_id lender reference id.
* @apiSuccess {String} loan_bank_mapping_id.create_at created date and time.
* @apiSuccess {String} loan_bank_mapping_id.updated_at updated date and time.
* @apiSuccess {String} loan_bank_mapping_id.source source
* @apiSuccess {String} loan_bank_mapping_id.status_history status history.
* @apiSuccess {Number} loan_bank_mapping_id.business business id.
* @apiSuccess {Number} loan_bank_mapping_id.bank_id bank id.
* @apiSuccess {Number} loan_bank_mapping_id.lender_status lender status id.

* @apiSuccess {object[]} loan_sanction_id disbursement loan sanction ID.

* @apiSuccess {Number} loan_sanction_id.id loan banking and mapping id.
* @apiSuccess {String} loan_sanction_id.loan_id Loan ID.
* @apiSuccess {String} loan_sanction_id.san_amount loan sanction amount.
* @apiSuccess {String} loan_sanction_id.san_interest loan sanction interest
* @apiSuccess {String} loan_sanction_id.san_date loan sanction date.
* @apiSuccess {Number} loan_sanction_id.userid user ID.
* @apiSuccess {String} loan_sanction_id.upload_path
* @apiSuccess {String} loan_sanction_id.loan_repay
* @apiSuccess {String} loan_sanction_id.channel_invoice
* @apiSuccess {String} loan_sanction_id.amount_um lakhs/crores.
* @apiSuccess {String} loan_sanction_id.sanction_process_fee fee for the loan sanction process.
* @apiSuccess {String} loan_sanction_id.created_at loan sanction created date and time.
* @apiSuccess {String} loan_sanction_id.updated_at loan sanction updated date and time.
* @apiSuccess {Number} loan_sanction_id.status status of the sanction loan.
* @apiSuccess {String} loan_sanction_id.loan_bank_mapping mapping with other banks loan.
 */
module.exports = {
	index: function (req, res, next) {
		LoanDisbursementRd.find().exec((err, list) => {
			if (err) {
				return Error("Error");
			}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		LoanDisbursementRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},
	/**
	 * EDIT DISBURSEMENT
	 * @api {post} /loandisbursement/update Loan Disbursement
	 * @apiName Loan Disbursement Update
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/loandisbursement/update
	 * @apiParam {Number} disbursement_id disbursement_id
	 * @apiParam {Number} sanctionId sanction Id.
	 * @apiParam {Number} loan_bank_mapping_id loan bank mapping Id.
	 * @apiParam {Number} disbursement_amt disbursement_amt
	 * @apiParam {String} disbursement_amt_um disbursement_amt_um
	 * @apiParam {Date} disbursement_date disbursement_date
	 * @apiParam {String} repayment_doc repayment_doc
	 * @apiParam {String} channel_invoice channel_invoice
	 * @apiParam {String} lender_confirmation lender_confirmation
	 * @apiParam {String} notification_status notification_status
	 * @apiParam {String} upload_status upload_status
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Successfully Updated.
	 * @apiSuccess {Object} data
	 * @apiSuccess {String} llc_status Yes/No (by default it will set as No).
	 * @apiSuccess {Number} id disbursement Id.
	 * @apiSuccess {Number} disbursement_amt disbursement amount.
	 * @apiSuccess {String} disbursement_amt_um Lakhs/Crores.
	 * @apiSuccess {String} disbursement_date disbursement date.
	 * @apiSuccess {String} repayment_doc repayment document.
	 * @apiSuccess {String} lender_confirmation lender confirmation document.
	 * @apiSuccess {Object} disbursement_amount_edit_history disbursement amount edit history.
	 * @apiSuccess {String} created_at created date and time.
	 * @apiSuccess {String} updated_at updated date and time.
	 * @apiSuccess {String} notification_status notification status (by default it will set as Yes).
	 * @apiSuccess {String} uploadStatus upload Status.
	 * @apiSuccess {Number} loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} loan_sanction_id loan sanction id.
	 */

	/**
	 * ADD DISBURSEMENT
	 * @api {post} /add_Disbursement Add Disbursement
	 * @apiName ADD Disbursement
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/add_Disbursement
	 *  @apiParam {Number} sanctionId sanction Id.
	 * @apiParam {Number} loan_bank_mapping_id loan bank mapping Id.
	 * @apiParam {Number} disbursement_amt disbursement_amt
	 * @apiParam {String} disbursement_amt_um disbursement_amt_um
	 * @apiParam {Date} disbursement_date disbursement_date
	 * @apiParam {String} repayment_doc repayment_doc
	 * @apiParam {String} channel_invoice channel_invoice
	 * @apiParam {String} lender_confirmation lender_confirmation
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Loan disbursed successfully.
	 * @apiSuccess {Object} data
	 * @apiSuccess {String} llc_status Yes/No (by default it will set as No).
	 * @apiSuccess {Number} id disbursement Id.
	 * @apiSuccess {Number} disbursement_amt disbursement amount.
	 * @apiSuccess {String} disbursement_amt_um Lakhs/Crores.
	 * @apiSuccess {String} disbursement_date disbursement date.
	 * @apiSuccess {String} repayment_doc repayment document.
	 * @apiSuccess {String} lender_confirmation lender confirmation document.
	 * @apiSuccess {String} disbursement_amount_edit_history disbursement amount edit history.
	 * @apiSuccess {String} created_at created date and time.
	 * @apiSuccess {String} updated_at updated date and time.
	 * @apiSuccess {String} notification_status notification status (by default it will set as Yes).
	 * @apiSuccess {String} uploadStatus upload Status.
	 * @apiSuccess {Number} loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} loan_sanction_id loan sanction id.
	 */
	edit: async function (req, res) {
		let curr_disbursement_amt = 0,
			sanctionAmt = 0,
			reqDisbursementAmt = 0,
			lenderUpdatedata,
			editDisbursmentHistory = "",
			log = {};
		const sanctionId = req.body.sanctionId,
			loanBankMappingId = req.body.loan_bank_mapping_id,
			disbursmentId = req.body.disbursement_id;
		inputData = [sanctionId];
		const datetime = await sails.helpers.dateTime();
		//-------- check sanction details-------------------
		if (
			sanctionId !== "" &&
			sanctionId !== undefined &&
			loanBankMappingId !== "" &&
			loanBankMappingId !== undefined
		) {
			const sanctionDetails = await LoanSanctionRd.findOne({
				id: sanctionId,
				loan_bank_mapping: loanBankMappingId
			});
			if (sanctionDetails) {
				sanctionAmt =
					sanctionDetails.amount_um == "Crores"
						? sanctionDetails.san_amount * 100
						: sanctionDetails.san_amount;
				reqDisbursementAmt =
					req.body.disbursement_amt_um == "Crores"
						? req.body.disbursement_amt * 100
						: req.body.disbursement_amt;
				const currDisbursmentAmtQry =
					"select sum(IF(disbursement_amt_um='Crores', disbursement_amt*100, disbursement_amt))  as curr_disbursement_amt from loan_disbursement where loan_sanction_id=$1";
				await LoanDisbursementRd.query(currDisbursmentAmtQry, inputData, async function (err, rawResult) {
					if (err) return res.badRequest({status: "nok", error: err});
					if (rawResult) {
						currDisbursmentAmtRows = rawResult.rows;
						curr_disbursement_amt =
							currDisbursmentAmtRows["0"].curr_disbursement_amt != null
								? currDisbursmentAmtRows["0"].curr_disbursement_amt
								: 0;
					}
					data = {
						disbursement_amt: req.body.disbursement_amt,
						lender_confirmation: req.body.lender_confirmation,
						disbursement_amt_um: req.body.disbursement_amt_um,
						notification_status: req.body.notification_status,
						disbursement_date: req.body.disbursement_date,
						updated_at: datetime,
						disbursement_status: "draft"
					};
					if (typeof req.body.lender_confirmation !== "undefined") {
						data.lender_confirmation = req.body.lender_confirmation;
					}
					if (typeof req.body.channel_invoice !== "undefined") {
						data.channel_invoice = req.body.channel_invoice;
					}
					if (typeof req.body.repayment_doc !== "undefined") {
						data.repayment_doc = req.body.repayment_doc;
					}
					//-------------------check disbursement details---------------------
					if (disbursmentId !== "" && disbursmentId !== undefined) {
						var existDisbursmentDetails = await LoanDisbursementRd.findOne({
							id: disbursmentId,
							loan_sanction_id: sanctionId,
							loan_bank_mapping_id: loanBankMappingId
						});
					} else {
						if (
							req.body.disbursement_amt !== "" &&
							req.body.disbursement_amt !== undefined &&
							req.body.disbursement_amt_um !== "" &&
							req.body.disbursement_amt_um !== undefined &&
							req.body.disbursement_date !== "" &&
							req.body.disbursement_date !== undefined
						) {
							data.loan_sanction_id = sanctionId;
							data.loan_bank_mapping_id = loanBankMappingId;
							data.created_at = datetime;
						} else {
							return res.badRequest({
								status: "nok",
								exception: sails.config.msgConstants.invalidParameters,
								message: sails.config.msgConstants.mandatoryFieldsMissing
							});
						}
					}
					//------------ update lender status-----------------
					if (req.body.disbursement_amt) {
						if (existDisbursmentDetails) {
							curr_disbursement_amt = curr_disbursement_amt - existDisbursmentDetails.disbursement_amt;
						}
						if (
							parseFloat(Number(sanctionAmt) - Number(curr_disbursement_amt)).toFixed(2) <
							Number(reqDisbursementAmt)
						) {
							return res.ok({
								status: "nok",
								message: sails.config.msgConstants.disbursementAmountGreater
							});
						}
						if (
							parseFloat(Number(sanctionAmt) - Number(curr_disbursement_amt)).toFixed(2) ==
							Number(req.body.disbursement_amt)
						) {
							lenderUpdatedata = {
								lender_status: 16,
								notification_status: "yes"
							};
						} else {
							lenderUpdatedata = {
								lender_status: 17,
								notification_status: "yes"
							};
						}
						const LoanBankMappingDetails = await LoanBankMapping.update({id: loanBankMappingId})
							.set(lenderUpdatedata)
							.fetch();
					}
					//------------------ update disbursement details-------------------
					if (existDisbursmentDetails) {
						if (
							existDisbursmentDetails.disbursement_amount_edit_history !== "" &&
							existDisbursmentDetails.disbursement_amount_edit_history !== undefined &&
							existDisbursmentDetails.disbursement_amount_edit_history !== null
						) {
							const edit_history = existDisbursmentDetails.disbursement_amount_edit_history;
							log = JSON.parse(edit_history);
						}
						editDisbursmentHistory = {
							disbursement_amt: req.body.disbursement_amt,
							disbursement_amt_um: req.body.disbursement_amt_um,
							old_disbursement_amt: existDisbursmentDetails.disbursement_amt,
							old_disbursement_amt_um: existDisbursmentDetails.disbursement_amt_um,
							updated_by: req.user["id"],
							update_area: "edit_disbursement_area"
						};
						log[datetime] = editDisbursmentHistory;
						data.disbursement_amount_edit_history = JSON.stringify(log);

						const LoanDisbursementDetails = await LoanDisbursement.update({id: disbursmentId})
							.set(data)
							.fetch();
						var logService = await sails.helpers.logtrackservice(
							req,
							"loandisbursement/update",
							LoanDisbursementDetails[0].id,
							"loan_disbursement"
						);
						return res.ok({
							status: "ok",
							message: sails.config.msgConstants.successfulUpdation,
							data: LoanDisbursementDetails
						});
					}
					//------------------------ insert new record-----------------------------
					else {
						const createLoanDisbursement = await LoanDisbursement.create(data).fetch();
						var logService = await sails.helpers.logtrackservice(
							req,
							"add_Disbursement",
							createLoanDisbursement.id,
							"loan_disbursement"
						);
						return res.ok({
							status: "ok",
							message: sails.config.msgConstants.loanDisbursed,
							data: createLoanDisbursement
						});
					}
				});
			} else {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.sanctionIdMismatch
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				exception: sails.config.msgConstants.invalidParameters,
				message: sails.config.msgConstants.mandatoryFieldsMissing
			});
		}
	},
	update: function (req, res, next) {
		LoanDisbursement.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loanDisbursement/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		LoanDisbursement.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loanDisbursement");
		});
	},
	user_list: async function (req, res) {
		const loanBankMappingId = req.param('loan_bank_mapping_id');
		let userList,
			userType;
		const data = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID}).select("assignment_type");
		if (data && data.assignment_type && data.assignment_type.stage_1_2_assignement && req.user.usertype != 'BPO' && req.user.usertype != 'Checker') {
			const query = {
				usertype: "BPO",
				status: "active",
				is_corporate: 1,
				is_other: 1,
				is_user_admin: "Yes",
				white_label_id: {contains: req.user.loggedInWhiteLabelID}
			},
				loanBankMappingData = await LoanBankMappingRd.findOne({id: loanBankMappingId}).select("loan_id"),
				loanreqData = await LoanrequestRd.findOne({id: loanBankMappingData.loan_id}).select(["branch_id", "business_id"]),
				businessAddressData = await BusinessaddressRd.find({bid: loanreqData.business_id, aid: 1}).select(["state", "city"]),
				stage_1_2_assignement = data.assignment_type.stage_1_2_assignement[0].data;

			userType = "bpo";
			if (stage_1_2_assignement.branch) {
				query.branch_id = loanreqData.branch_id;
			}
			if (stage_1_2_assignement.state) {
				query.state = businessAddressData[0].state;
			}
			// if (stage_1_2_assignement.section) {
			// 	section = loanreqData.branch_id
			// }
			if (stage_1_2_assignement.city) {
				query.city = businessAddressData[0].city;
			}
			userList = await UsersRd.find(query).select(["name"]);
		} else {
			userType = "checker";
			userList = await UsersRd.find({
				usertype: ["Checker", "Maker"],
				status: "active",
				white_label_id:{contains : req.user.loggedInWhiteLabelID}
			}).select(["name"]);
		}
		if (userList.length > 0) {
			return res.ok({
				status: "ok",
				message: "User's list",
				data: userList,
				userType
			});
		} else {
			return res.ok({
				status: "ok",
				message: "No data found",
				data: []
			});
		}
	},
	update_ops_user: async function (req, res) {
		const {assigned_userid, disbursement_id, disbursement_status, loan_bank_mapping_id, comments} = req.allParams();
		params = req.allParams();
		fields = ["assigned_userid", "disbursement_id", "loan_bank_mapping_id"];
		missing = await reqParams.fn(params, fields);
		if (!assigned_userid || !disbursement_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const datetime = await sails.helpers.dateTime(),
			loanBankMappingData = await LoanBankMappingRd.findOne({id: loan_bank_mapping_id}),
			loanreqData = await LoanrequestRd.findOne({id: loanBankMappingData.loan_id});
		if (!loanBankMappingData) {
			return res.badRequest({status: "nok", message: "Invalid loan bank mapping id"});
		}
		const disbursementData = await LoanDisbursementRd.findOne({id: disbursement_id});
		if (!disbursementData) {
			return res.badRequest({status: "nok", message: "Invalid Disbursemet id"});
		}
		let pos_user_id = assigned_userid.toString(),
			revenueData, approval_data;
		if (loanBankMappingData.assigned_extended_ids) {
			arrayData = loanBankMappingData.assigned_extended_ids.split(",");
			if (arrayData.includes(pos_user_id)) {
				pos_user_id = loanBankMappingData.assigned_extended_ids;
			} else {
				pos_user_id = loanBankMappingData.assigned_extended_ids + "," + assigned_userid.toString();
			}
		}

		data = {
			assigned_extended_id: assigned_userid,
			notification_status: "Yes",
			updated_at: datetime
		};

		if (disbursement_status) {
			data.disbursement_status = disbursement_status;
		}
		let message, status_caption;
		if (disbursement_status == "initiated for review") {
			message = "Disbursal initiated successfully";
			status_caption = "Disbursement Initiate";
		} else if (disbursement_status && disbursement_status != "initiated for review" && disbursement_status != 'initiated to bpo') {
			status_caption = "Disbursement Sent back OPS";
			message = "Ops user updated successfuly";
		}

		if (disbursement_status === 'initiated to bpo') {

			message = "Disbursal initiated to BPO successfully";
			status_caption = "Initiated To BPO";

			const alreadyPresent = await TaskUserMappingRd.findOne({
				taskid: 13,
				loan_id: loanreqData.id,
				disbursement_id: disbursement_id
			});

			if (alreadyPresent) {
				await TaskUserMapping.updateOne({id: alreadyPresent.id}).set({creator_id: req.user.id, status: 'reopen', updated_time: datetime}).fetch();
			} else {
				const evaluatorsObject = {};
				evaluatorsObject["taskid"] = 13;
				evaluatorsObject["reference_id"] = loanBankMappingData.loan_id;
				evaluatorsObject["details"] = comments || "NA";
				evaluatorsObject["creator_id"] = req.user.id;
				evaluatorsObject["assign_userid"] = assigned_userid;
				evaluatorsObject["status"] = "pending";
				evaluatorsObject["priority"] = "High";
				evaluatorsObject["due_date"] = datetime;
				evaluatorsObject["loan_id"] = loanBankMappingData.loan_id;
				evaluatorsObject["loan_ref_id"] = loanreqData.loan_ref_id;
				evaluatorsObject["created_time"] = datetime;
				evaluatorsObject["notification"] = 1;
				evaluatorsObject["reassigned_userid"] = assigned_userid;
				evaluatorsObject["disbursement_id"] = disbursement_id;

				const addedEvaluators = await TaskUserMapping.create(evaluatorsObject).fetch();
			}
			const approval_log = await ApprovalLogsRd.findOne({
				reference_id: loanBankMappingData.loan_id,
				status: "pending",
				type: "Disbursement Approval"
			});

			if (approval_log) {
				await ApprovalLogs.updateOne({id: approval_log.id}).set({status: "reassigned", updated_at: datetime});
			}
			const commentString = [{
				assignedBy: req.user.id,
				assigneeComments: "",
				assignedByComments: comments || "NA",
				created_at: datetime,
				updated_at: datetime
			}];
			approval_data = await ApprovalLogs.create({
				reference_id: loanBankMappingData.loan_id,
				reference_type: sails.config.msgConstants.LOAN,
				status: "pending",
				user_id: assigned_userid,
				comments: JSON.stringify(commentString),
				type: "Disbursement Approval"
			});
		}

		if (disbursement_status == "initiated for review") {
			const taskUserData = await TaskUserMappingRd.findOne({
				taskid: 13,
				loan_id: loanreqData.id,
				disbursement_id: disbursement_id,
				status: {'in': ['reopen', 'open']}
			});
			if (taskUserData) {
				let approver_id = assigned_userid.toString()
				if (taskUserData.approver_id) {
					arrayData = taskUserData.approver_id.split(",");
					if (arrayData.includes(approver_id)) {
						approver_id = taskUserData.approver_id;
					} else {
						approver_id = taskUserData.approver_id + "," + assigned_userid.toString();
					}
				}
				await TaskUserMapping.updateOne({id: taskUserData.id}).set({status: 'close', completed_time: datetime, approver_id: approver_id});
			}

			const approval_log = await ApprovalLogsRd.findOne({
				reference_id: loanBankMappingData.loan_id,
				status: "pending",
				type: "Disbursement Approval"
			});

			if (approval_log) {
				await ApprovalLogs.updateOne({id: approval_log.id}).set({status: "reassigned", updated_at: datetime});
				if (disbursementData.disbursement_status == 'sent back by ops') {
					const commentString = [{
						assignedBy: req.user.id,
						assigneeComments: "",
						assignedByComments: comments || "NA",
						created_at: datetime,
						updated_at: datetime
					}];
					approval_data = await ApprovalLogs.create({
						reference_id: loanBankMappingData.loan_id,
						reference_type: sails.config.msgConstants.LOAN,
						status: "pending",
						user_id: assigned_userid,
						comments: JSON.stringify(commentString),
						type: "Disbursement Approval"
					});

				}
			}
		}

		loanBankMappingUpdate = await LoanBankMapping.update({id: loan_bank_mapping_id})
			.set({assigned_extended_ids: pos_user_id, notification_status: "yes"})
			.fetch();
		console.log(loanBankMappingUpdate, loan_bank_mapping_id);
		updateDisbursement = await LoanDisbursement.update({id: disbursement_id}).set(data).fetch();
		if (comments) {
			const revenue_status_data = await RevenueStatusRd.find({status_caption: status_caption});
			revenueData = await RevenueStatusComments.create({
				loan_bank_mapping_id,
				comments,
				comment_id: revenue_status_data[0].id,
				type: "Disbursement",
				created_on: datetime,
				created_by: req.user.id,
				disbursement_id
			}).fetch();
		} else {
			const approval_log = await ApprovalLogsRd.findOne({
				reference_id: loanBankMappingData.loan_id,
				status: "pending",
				type: "Disbursement Approval"
			}),
				dateTime = await sails.helpers.indianDateTime();
			await ApprovalLogs.updateOne({id: approval_log.id}).set({status: "reassigned", updated_at: dateTime});
			comment_message = JSON.parse(approval_log.comments);
			const commentString = [{
				assignedBy: req.user.id,
				assigneeComments: "",
				assignedByComments: comment_message[0].assignedByComments,
				created_at: dateTime,
				updated_at: dateTime
			}];
			approval_data = await ApprovalLogs.create({
				reference_id: loanBankMappingData.loan_id,
				reference_type: sails.config.msgConstants.LOAN,
				status: "pending",
				user_id: assigned_userid,
				comments: JSON.stringify(commentString),
				type: "Disbursement Approval"
			});
		}

		if (revenueData && disbursement_status !== 'initiated to bpo') {
			const url = sails.config.approvalLogs.approval_insert,
				method = "POST",
				header = {authorization: req.headers.authorization},
				body = {
					loan_id: loanBankMappingData.loan_id,
					approval_users_ids: [assigned_userid],
					comments,
					type: "Disbursement Approval"
				}
			approval_data = await sails.helpers.sailstrigger(url, JSON.stringify(body), header, method);
		}
		return res.ok({
			status: "ok",
			message,
			data: updateDisbursement,
			approval_data
		});
	},
	disbursement_details: async function (req, res) {
		let {
			loan_bank_mapping_id,
			loan_sanction_id,
			disbursementId,
			disbursement_id,
			notification_status,
			disbursement_amt,
			disbursement_amt_um,
			disbursement_date,
			payment_advice,
			loan_downsize,
			e_stamp_charge
		} = req.allParams();
		let loan_comment = null;
		if (loan_downsize && loan_downsize == true && disbursement_amt == 0) {
			loan_comment = {
				loan_downsize: loan_downsize
			}
		} else {
			loan_downsize = false
		}

		disbursementId = disbursementId || disbursement_id;
		let curr_disbursement_amt = 0,
			sanctionAmt = 0,
			//reqDisbursementAmt = 0,
			lenderUpdatedata = {},
			editDisbursmentHistory = "",
			existDisbursmentDetails = "",
			log = {};
		const datetime = await sails.helpers.dateTime();
		if (!loan_sanction_id || !loan_bank_mapping_id) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.mandatoryFieldsMissing
			});
		}
		//-------- check sanction details-------------------
		const sanctionDetails = await LoanSanctionRd.findOne({
			id: loan_sanction_id,
			loan_bank_mapping: loan_bank_mapping_id
		}).select(["loan_id", "san_amount", "amount_um"]);
		if (!sanctionDetails) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.sanctionIdMismatch
			});
		}
		if (payment_advice.length > 0 && disbursement_amt) {
			const totalPaymentAmount = payment_advice.reduce(
				(total, payment) => Number(total) + Number(payment.payment_amt),
				0
			);
			if (totalPaymentAmount > disbursement_amt) {
				return res.badRequest({
					status: "nok",
					message: "Total Payment amount should not be greater than disbursement amount."
				});
			}
		}
		const totalDisbursementAmountQuery = "select sum(disbursement_amt)  as curr_disbursement_amt from loan_disbursement where disbursement_status IN ('draft', 'initiated for review', 'Disbursed', 'sent back by ops') and loan_sanction_id=$1";
		let totalDisbursementAmount = await myDBStore.sendNativeQuery(totalDisbursementAmountQuery, [loan_sanction_id]);
		totalDisbursementAmount = totalDisbursementAmount.rows[0].curr_disbursement_amt || 0;
		const currDisbursmentAmtQry =
			"select sum(disbursement_amt)  as curr_disbursement_amt from loan_disbursement where disbursement_status IN ('Disbursed') and loan_sanction_id=$1";
		await LoanDisbursementRd.query(currDisbursmentAmtQry, [loan_sanction_id], async (err, rawResult) => {
			if (err) {return res.badRequest({status: "nok", error: err});}
			if (rawResult) {
				currDisbursmentAmtRows = rawResult.rows;
				curr_disbursement_amt =
					currDisbursmentAmtRows[0].curr_disbursement_amt != null
						? currDisbursmentAmtRows[0].curr_disbursement_amt
						: 0;
			}
			data = {
				...req.allParams(),
				loan_sanction_id,
				loan_bank_mapping_id,
				disbursement_amt: disbursement_amt,
				disbursement_amt_um: disbursement_amt_um || "NA",
				notification_status: notification_status,
				disbursement_date: moment(disbursement_date).format("MM/DD/YYYY"),
				payment_comments: JSON.stringify(loan_comment)
			};
			if (e_stamp_charge) data.sanction_additional_data = JSON.stringify({e_stamp_charge})

			// when bpi_applicable is no frontend not passing bpi_amount so we have to make it null here
			if (data.bpi_applicable == "No") data.bpi_amount = null;

			//-------------------check disbursement details---------------------
			if (disbursementId) {
				existDisbursmentDetails = await LoanDisbursementRd.findOne({
					id: disbursementId,
					loan_sanction_id,
					loan_bank_mapping_id
				});
				totalDisbursementAmount = Number(totalDisbursementAmount) - Number(existDisbursmentDetails.disbursement_amt);
			} else {
				if ((!disbursement_amt && loan_downsize == false) || !disbursement_date) {
					return res.badRequest({
						status: "nok",
						message: sails.config.msgConstants.mandatoryFieldsMissing
					});
				}
			}
			//------------ update lender status-----------------

			if (disbursement_amt) {
				const san_amount_data = await sails.helpers.unitConverter(
					sanctionDetails.san_amount,
					sanctionDetails.amount_um
				);
				sanctionAmt = san_amount_data.value;
				await loanTypeIdUpdate(sanctionDetails.loan_id, sanctionAmt);
				if (
					parseFloat(Number(sanctionAmt) - Number(totalDisbursementAmount)) <
					Number(disbursement_amt)
				) {
					return res.ok({
						status: "nok",
						message: sails.config.msgConstants.disbursementAmountGreater
					});
				}
				if (
					parseFloat(Number(sanctionAmt) - Number(curr_disbursement_amt)) ==
					Number(disbursement_amt)
				) {
					lenderUpdatedata = {
						lender_status: 16,
						notification_status: "yes"
					};
				} else if (curr_disbursement_amt > 0) {
					lenderUpdatedata = {
						lender_status: 17,
						notification_status: "yes"
					};
				}
				if (Object.keys(lenderUpdatedata).length > 0) {
					await LoanBankMapping.update({id: loan_bank_mapping_id})
						.set(lenderUpdatedata);
				}

			}
			//------------------ update disbursement details-------------------
			if (existDisbursmentDetails) {
				if (existDisbursmentDetails.disbursement_amount_edit_history) {
					const edit_history = existDisbursmentDetails.disbursement_amount_edit_history;
					log = JSON.parse(edit_history);
				}
				editDisbursmentHistory = {
					disbursement_amt: disbursement_amt,
					disbursement_amt_um: disbursement_amt_um,
					old_disbursement_amt: existDisbursmentDetails.disbursement_amt,
					old_disbursement_amt_um: existDisbursmentDetails.disbursement_amt_um,
					updated_by: req.user["id"],
					update_area: "edit_disbursement_area"
				};
				log[datetime] = editDisbursmentHistory;
				data.disbursement_amount_edit_history = JSON.stringify(log);
				data.updated_at = datetime;
				const LoanDisbursementDetails = await LoanDisbursement.update({id: disbursementId}).set(data).fetch();
				if (LoanDisbursementDetails[0]?.sanction_additional_data) LoanDisbursementDetails[0].e_stamp_charge = JSON.parse(LoanDisbursementDetails[0].sanction_additional_data).e_stamp_charge
				if (payment_advice.length > 0) {
					LoanDisbursementDetails[0].LoanDisbursementPayment = await disbursementPayment(
						payment_advice,
						disbursementId);
				} else {
					LoanDisbursementDetails[0].LoanDisbursementPayment = [];
				}
				var logService = await sails.helpers.logtrackservice(
					req,
					"loandisbursement/update",
					LoanDisbursementDetails[0].id,
					"loan_disbursement"
				);

				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.successfulUpdation,
					data: LoanDisbursementDetails
				});
			}
			//------------------------ insert new record-----------------------------
			else {
				data.created_at = datetime;
				data.disbursement_status = "draft";
				const createLoanDisbursement = await LoanDisbursement.create(data).fetch();
				if (createLoanDisbursement?.sanction_additional_data) createLoanDisbursement.e_stamp_charge = JSON.parse(createLoanDisbursement.sanction_additional_data).e_stamp_charge
				if (payment_advice.length > 0) {
					createLoanDisbursement.LoanDisbursementPayment = await disbursementPayment(
						payment_advice,
						createLoanDisbursement.id);
				} else {
					createLoanDisbursement.LoanDisbursementPayment = [];
				}
				// const loan_sanction_update = await LoanSanction.update({
				// 	id: loan_sanction_id,
				// 	loan_bank_mapping: loan_bank_mapping_id
				// }).set({
				// 	sanction_status: "Final Sanction"
				// });
				var logService = await sails.helpers.logtrackservice(
					req,
					"add_Disbursement",
					createLoanDisbursement.id,
					"loan_disbursement"
				);
				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.loanDisbursed,
					data: createLoanDisbursement
				});
			}
		});
	},
	fetchDisbursement_details: async function (req, res) {
		const loan_id = req.body.loan_id,
			verifiedBanksRequired = req.body.banks_verified;
		params = req.allParams();
		fields = ["loan_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		loan_details = await LoanrequestRd.findOne({id: loan_id});
		loanProductData = await LoanProductsRd.findOne({id: loan_details.loan_product_id});
		currency = loanProductData && loanProductData.dynamic_forms ? loanProductData.dynamic_forms.currency : "";
		const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loan_id});

		if (loanBankMappingData.length == 0) {
			return res.badRequest({
				status: "nok",
				message: "invalid loan id OR No data found for this loan id"
			});
		}

		const inputData = [loanBankMappingData[0].id];

		let loansanctionData = await LoanSanctionRd.find({
			loan_id,
			loan_bank_mapping: loanBankMappingData[0].id
		});

		if (loansanctionData.length == 0) {
			return res.ok({
				status: "nok",
				message: "No Sanction data found for the loan Id"
			})
		}
		loansanctionData[0].sanction_asset_data =
			await LoanSanctionAdditionalRd.find({loan_id, loan_bank_mapping_id: loanBankMappingData[0].id, status: "active"}) || [];
		if (loansanctionData[0].sanction_asset_data.length > 0) {
			for (const assetsData of loansanctionData[0].sanction_asset_data) {
				assetsData.assets_name = await LoanAssetsRd.findOne({id: assetsData.sanctioned_asset_number});
			}
		}

		//for muthoot fetch the loan_sanction_additional data as well
		if (sails.config.muthoot_white_label_id.includes(Number(req.user.loggedInWhiteLabelID))) {

			const loanSanctionAdditional = await LoanSanctionAdditionalRd.find({
				loan_id: loan_id,
				loan_bank_mapping_id: loanBankMappingData[0].id,
				sanction_option: null
			}).select("additional_data");

			if (loanSanctionAdditional && loanSanctionAdditional.length == 1 && loanSanctionAdditional[0].additional_data) {

				const additionalData = JSON.parse(loanSanctionAdditional[0].additional_data);
				if (additionalData && additionalData?.loan_sanction_data) {
					loansanctionData[0] = {
						...loansanctionData[0],
						sanction_additional_data: additionalData
					}
				}

			}

		}

		const DisbursmentDataQuery =
			"select *, disbursementId AS id from loan_disbursement where disbursement_status <> 'deleted' and loan_bank_mapping_id=$1";
		await LoanDisbursementRd.query(DisbursmentDataQuery, inputData, async function (err, rawResult) {
			if (err) return res.badRequest({status: "nok", error: err});
			loanDisbursementData = rawResult.rows;
		});
		// const loanDisbursementData = await LoanDisbursementRd.find({loan_bank_mapping_id: loanBankMappingData[0].id, disbursement_status : {"!=" : "deleted"}});
		let san_amount = 0,
			amount_um = "",
			sanction_id = "";
		if (loansanctionData.length > 0) {
			sanction_id = loansanctionData[0].id;
			if (currency) {
				const san_amount_data = await sails.helpers.unitConverter(
					loansanctionData[0].san_amount,
					loansanctionData[0].amount_um
				);
				san_amount = san_amount_data.value;
				amount_um = san_amount_data.value_um;
			} else {
				san_amount = loansanctionData[0].san_amount;
				amount_um = loansanctionData[0].amount_um;
			}
		}

		const loanFinancialsFetchCond = {loan_id, fin_type: "Bank Account", status: "active"};
		if (verifiedBanksRequired) loanFinancialsFetchCond.bank_verification_flag = ["verified", "not-available", "bad-gateway"];

		accountDetails = await LoanFinancialsRd.find(loanFinancialsFetchCond).select([
			"bank_id",
			"fin_type",
			"account_type",
			"account_number",
			"account_holder_name",
			"IFSC",
			"enach_status",
			"bank_verification_flag"
		]);

		if (accountDetails.length > 0) {
			for (const bankData of accountDetails) {
				if (bankData.bank_id != 0) {
					bankData.bank_id = await BankMasterRd.findOne({id: bankData.bank_id}).select(["bankname"]);
				} else {
					bankData.bank_id = {};
				}
			}
		}
		imdDetails =
			(await IMDDetailsRd.findOne({loan_id, imd_collected: "Yes"}).select(["amount_paid", "payment_mode"])) || {};
		if (loanDisbursementData.length > 0) {
			for (const disburseData of loanDisbursementData) {
				if (currency && disburseData.disbursement_amt_um !== "NA") {
					const dis_amount_data = await sails.helpers.unitConverter(
						disburseData.disbursement_amt,
						disburseData.disbursement_amt_um
					);
					disburseData.disbursement_amt = dis_amount_data.value;
					disburseData.disbursement_amt_um = dis_amount_data.value_um;
				}
				const taskUserData = await TaskUserMappingRd.findOne({taskid: 13, disbursement_id: disburseData.id});
				if (taskUserData && taskUserData.status === 'close') {
					disburseData.assigned_extended_usertype = 'checker'
				} else {
					disburseData.assigned_extended_usertype = 'bpo'
				}
				if (taskUserData) {
					bpoData = await UsersRd.findOne({id: taskUserData.assign_userid}).select("name");
					assigned_extended_bpo_name = {
						id: bpoData.id,
						name: bpoData.name
					}
					disburseData.assigned_extended_bpo_name = assigned_extended_bpo_name
				}
				disburseData.LoanDisbursementPayment = await LoanDisbursementPaymentRd.find({disbursement_id: disburseData.id, status: "active"});
				if (disburseData.assigned_extended_id && disburseData.assigned_extended_id != 0) {
					userdata = await UsersRd.findOne({id: disburseData.assigned_extended_id}).select("name");
					disburseData.assigned_extended_name = userdata.name;
				} else {
					disburseData.assigned_extended_name = null;
				}
			}
		}
		return res.ok({
			status: "ok",
			message: "Disbursement details fetched Successfully",
			data: {
				loan_disbursement_data: loanDisbursementData,
				loanBankMappingData: loanBankMappingData,
				loan_sanction_id: sanction_id,
				san_amount: san_amount,
				amount_um: amount_um,
				application_ref: loan_details.application_ref,
				accountDetails,
				imdDetails,
				sanction_details: loansanctionData
			}
		});
	},

	deleteDraft_disbursementLoan: async function (req, res) {
		const disbursement_id = req.body.disbursement_id;
		params = req.allParams();
		fields = ["disbursement_id"];
		missing = await reqParams.fn(params, fields);
		if (!disbursement_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanDisbursementData = await LoanDisbursementRd.find({id: disbursement_id});
		if (loanDisbursementData.length > 0) {
			if (loanDisbursementData[0].disbursement_status === "draft") {
				const updateLoanDisbursementData = await LoanDisbursement.update({id: disbursement_id}).set({
					disbursement_status: "deleted"
				});
				return res.ok({
					status: "ok",
					message: "Draft Disbursement loan deleted successfully"
				});
			} else {
				return res.badRequest({
					status: "nok",
					message: "The loan is not in draft stage to delete"
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: "no records found"
			});
		}
	},
	disbursement_comment_list: async function (req, res) {
		disbursement_id = req.param("disbursement_id");
		if (!disbursement_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanBankMappingId = await LoanDisbursementRd.findOne({id: disbursement_id}).select('loan_bank_mapping_id');
		const disbursementDetails = await LoanDisbursementRd.find({
			loan_bank_mapping_id: loanBankMappingId.loan_bank_mapping_id,
			disbursement_status: {'!=': 'deleted'}
		});
		let whereCondition = {}
		if (disbursementDetails.length == 1) {
			whereCondition.loan_bank_mapping_id = loanBankMappingId.loan_bank_mapping_id;
		} else if (disbursementDetails.length >= 2 && disbursementDetails[0].id == disbursement_id) {
			whereCondition = {
				loan_bank_mapping_id: loanBankMappingId.loan_bank_mapping_id,
				or: [
					{disbursement_id: {'<': disbursement_id}},
					{disbursement_id: disbursement_id}
				]
			}
		} else {
			whereCondition.disbursement_id = disbursement_id;
		}
		comments = await RevenueStatusCommentsRd.find(whereCondition).sort("id DESC");
		for (const commentList of comments) {
			commentList.created_on = moment(commentList.created_on)
				.add({h: 5, m: 42})
				.format("YYYY-MM-DD HH:mm:ss")
				.toString();
			username = await UsersRd.findOne({id: commentList.created_by}).select("name");
			commentList.created_by = username.name;

			commentId = await RevenueStatusRd.findOne({id: commentList.comment_id}).select("status_caption");
			commentList.comment_id = commentId.status_caption;
		}
		if (comments.length) {
			return res.ok({
				status: "ok",
				message: "comment list",
				data: comments
			});
		} else {
			return res.ok({
				status: "nok",
				message: "no comments added for this disbursement id",
				data: []
			});
		}
	},
	statusUpdateFor_disbursementloan: async function (req, res) {
		let {disbursement_id, disbursement_status, comments, auto_assign_to_maker} = req.allParams();
		params = req.allParams();
		fields = ["disbursement_id", "disbursement_status"];
		missing = await reqParams.fn(params, fields);
		const datetime = await sails.helpers.dateTime()
		if (!disbursement_id || !disbursement_status) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_disbursement_data = await LoanDisbursementRd.findOne({id: disbursement_id});
		if (!loan_disbursement_data) {
			return res.badRequest({
				status: "nok",
				message: "invalid disbursement id"
			});
		}
		const loanbankmappingid = loan_disbursement_data.loan_bank_mapping_id;
		let loan_downsize = false
		if (loan_disbursement_data?.payment_comments) {
			try {
				const paymentCommentsObj = JSON.parse(loan_disbursement_data.payment_comments);
				loan_downsize = paymentCommentsObj?.loan_downsize || false;
			} catch (error) {
				console.error("Error parsing payment_comments:", error);
				loan_downsize = false;
			}
		}
		// loan_downsize = Object.keys(loan_disbursement_data?.payment_comments || {}).length > 0 ? JSON.parse(loan_disbursement_data?.payment_comments)?.loan_downsize : false;
		if (loan_downsize == true) {
			await LoanBankMapping.updateOne({id: loanbankmappingid}).set({lender_status: 16, upts: datetime});
		}
		inputData = [loan_disbursement_data.loan_sanction_id];
		let sanctionData = await LoanSanctionRd.findOne({id: loan_disbursement_data.loan_sanction_id}).select([
			"san_amount",
			"amount_um",
			"loan_id"
		]);

		loanData = await LoanrequestRd.findOne({id: sanctionData.loan_id}),
			loanBankMappingData = await LoanBankMappingRd.findOne({loan_id: sanctionData.loan_id}),
			data = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID});
		let updateLoanDisbursementData, revenueStatusCommentsData;
		let coUserId, white_label_id = req.user.loggedInWhiteLabelID;
		const whiteLabelData = await WhiteLabelSolutionRd.findOne({id: white_label_id});
		if (whiteLabelData && whiteLabelData.assignment_type.additional_assignment_stage1 && whiteLabelData.assignment_type.additional_assignment_stage1.assignment) {
			const coUserIdData = await UsersRd.find({
				branch_id: loanData.branch_id,
				usertype: whiteLabelData.assignment_type.additional_assignment_stage1.assignment[0].usertype,
				user_sub_type: whiteLabelData.assignment_type.additional_assignment_stage1.assignment[0].user_subtype,
				or: [
					{white_label_id: `${white_label_id}`},
					{white_label_id: {'like': `%,${white_label_id}`}},
					{white_label_id: {'like': `${white_label_id},%`}},
					{white_label_id: {'like': `%,${white_label_id},%`}}
				]
			}).limit(1);
			if (coUserIdData.length > 0) {
				coUserId = coUserIdData[0].id;
			}
		}
		coUserId = coUserId ? coUserId : req.user.id;
		if (disbursement_status !== "draft") {
			if (disbursement_status === 'sent back by ops' || auto_assign_to_maker) {
				let taskUserData;
				taskUserData = await TaskUserMappingRd.findOne({taskid: 13, reference_id: sanctionData.loan_id, disbursement_id: disbursement_id});
				const businessAddressData = await BusinessaddressRd.find({bid: loanData.business_id, aid: 1});
				if (data && data.assignment_type && data.assignment_type.stage_1_2_assignement[0].usertype === 'BPO') {
					if (taskUserData) {
						await TaskUserMapping.updateOne({id: taskUserData.id}).set({status: 'reopen', updated_time: datetime});
					} else {
						const stage_1_2_assignement = data.assignment_type.stage_1_2_assignement[0].data;
						let branch, state, section, city;
						if (stage_1_2_assignement.branch) {
							branch = loanData.branch_id
						}
						if (stage_1_2_assignement.state) {
							state = businessAddressData[0].state
						}
						if (stage_1_2_assignement.section) {
							section = loanData.branch_id
						}
						if (stage_1_2_assignement.city) {
							city = businessAddressData[0].city
						}
						const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
							query = `select name, userid as id,usertype  from users  where status = "active" and is_corporate = 1 and is_other = 1 and is_user_admin = "Yes" ${branch ? `AND branch_id = ${branch}` : ''} ${state ? `AND state = '${state}'` : ''} ${city ? `AND city = '${city}'` : ''} and usertype in (select usertype from task_master where task_cat_id = $1) and userid not in (select reassigned_userid from task_user_mapping where loan_id = ${loanBankMappingData.loan_id} and status = 'pending') and white_label_id in (${req.user.loggedInWhiteLabelID})`;
						assignees = await myDBStore.sendNativeQuery(query, [13]);
						responseData = assignees.rows;
						const evaluatorsObject = {};
						evaluatorsObject["taskid"] = 13;
						evaluatorsObject["reference_id"] = loanBankMappingData.loan_id;
						evaluatorsObject["details"] = comments || "NA";
						evaluatorsObject["creator_id"] = coUserId;
						evaluatorsObject["assign_userid"] = assignees.rows[0].id;
						evaluatorsObject["status"] = "reopen";
						evaluatorsObject["priority"] = "High";
						evaluatorsObject["due_date"] = datetime;
						evaluatorsObject["loan_id"] = loanBankMappingData.loan_id;
						evaluatorsObject["loan_ref_id"] = loanData.loan_ref_id;
						evaluatorsObject["created_time"] = datetime;
						evaluatorsObject["notification"] = 1;
						evaluatorsObject["reassigned_userid"] = assignees.rows[0].id;
						evaluatorsObject["disbursement_id"] = disbursement_id;

						taskUserData = await TaskUserMapping.create(evaluatorsObject).fetch();
					}
				}
				const approval_log = await ApprovalLogsRd.findOne({
					reference_id: sanctionData.loan_id,
					status: "pending",
					type: "Disbursement Approval"
				});

				if (approval_log) {
					await ApprovalLogs.updateOne({id: approval_log.id}).set({status: "action taken", updated_at: datetime});
				}
				const commentString = [{
					assignedBy: req.user.id,
					assigneeComments: "",
					assignedByComments: comments || "NA",
					created_at: datetime,
					updated_at: datetime
				}];
				approval_data = await ApprovalLogs.create({
					reference_id: sanctionData.loan_id,
					reference_type: sails.config.msgConstants.LOAN,
					status: "pending",
					user_id: taskUserData.assign_userid,
					comments: JSON.stringify(commentString),
					type: "Disbursement Approval"
				});
				await LoanDisbursement.updateOne({id: loan_disbursement_data.id}).set({assigned_extended_id: taskUserData.assign_userid});
			}
			if (disbursement_status === "sent back by bpo" || auto_assign_to_maker) {
				const updateTask = await TaskUserMapping.update({taskid: 13, reference_id: sanctionData.loan_id, disbursement_id: disbursement_id})
					.set({
						status: 'sent back',
						updated_time: datetime
					}).fetch();
				if (comments) {
					const status_caption = 'Sent Back By BPO',
						revenue_status_data = await RevenueStatusRd.find({status_caption: status_caption}),
						revenueStatusCommentsDetails = {
							loan_bank_mapping_id: loan_disbursement_data.loan_bank_mapping_id,
							comments: comments,
							comment_id: revenue_status_data[0].id,
							type: "Disbursement",
							created_on: datetime,
							created_by: req.user.id,
							disbursement_id: disbursement_id
						};
					revenueStatusCommentsData = await RevenueStatusComments.create(revenueStatusCommentsDetails).fetch();
				}
				const approval_log = await ApprovalLogsRd.findOne({
					reference_id: sanctionData.loan_id,
					status: "pending",
					type: "Disbursement Approval"
				});

				if (approval_log) {
					await ApprovalLogs.updateOne({id: approval_log.id}).set({status: "action taken", updated_at: datetime});
				}
				const commentString = [{
					assignedBy: req.user.id,
					assigneeComments: "",
					assignedByComments: comments || "NA",
					created_at: datetime,
					updated_at: datetime
				}];
				if (!auto_assign_to_maker) {
					approval_data = await ApprovalLogs.create({
						reference_id: sanctionData.loan_id,
						reference_type: sails.config.msgConstants.LOAN,
						status: "pending",
						user_id: loanData.assignment_additional,
						comments: JSON.stringify(commentString),
						type: "Disbursement Approval"
					});
				}
				const taskCreatorData = await TaskUserMappingRd.findOne({taskid: 13, reference_id: sanctionData.loan_id, disbursement_id: disbursement_id});
				let pos_user_id = taskCreatorData.creator_id.toString();
				if (loanBankMappingData.assigned_extended_ids) {
					arrayData = loanBankMappingData.assigned_extended_ids.split(",");
					if (arrayData.includes(pos_user_id)) {
						pos_user_id = loanBankMappingData.assigned_extended_ids;
					} else {
						pos_user_id = loanBankMappingData.assigned_extended_ids + "," + taskCreatorData.creator_id.toString();
					}
				}
				await LoanBankMapping.updateOne({id: loanBankMappingData.id}).set({assigned_extended_ids: pos_user_id, notification_status: "yes"});
				await LoanDisbursement.updateOne({id: loan_disbursement_data.id}).set({assigned_extended_id: taskCreatorData.creator_id});
			}
			if (auto_assign_to_maker) disbursement_status = "sent back by bpo"

			updateLoanDisbursementData = await LoanDisbursement.update({id: disbursement_id})
				.set({disbursement_status: disbursement_status, updated_at: datetime})
				.fetch();
		} else {
			return res.badRequest({
				status: "nok",
				message: "invalid status"
			});
		}

		if (comments && disbursement_status != "sent back by bpo") {
			let status_caption;
			if (disbursement_status === "initiated for review") {
				status_caption = "Disbursement Initiate";
			} else if (disbursement_status === "sent back by ops" || auto_assign_to_maker) {
				status_caption = "Disbursement Sent back OPS";
			} else if (disbursement_status === "Rejected") {
				status_caption = "Disbursement Reject";
			} else {
				status_caption = "Disbursed";
			}
			const revenue_status_data = await RevenueStatusRd.find({status_caption: status_caption}),
				revenueStatusCommentsDetails = {
					loan_bank_mapping_id: loan_disbursement_data.loan_bank_mapping_id,
					comments: comments,
					comment_id: revenue_status_data[0].id,
					type: "Disbursement",
					created_on: datetime,
					created_by: req.user.id,
					disbursement_id: disbursement_id
				};
			revenueStatusCommentsData = await RevenueStatusComments.create(revenueStatusCommentsDetails).fetch();
		}

		if (revenueStatusCommentsData && disbursement_status != "sent back by bpo" && data.assignment_type && data.assignment_type.stage_1_2_assignement[0].usertype != 'BPO') {
			if (disbursement_status !== "draft") {
				const url = sails.config.approvalLogs.approval_update,
					method = "PUT",
					header = {authorization: req.headers.authorization},
					body = {
						loan_id: sanctionData.loan_id,
						status: disbursement_status == "Disbursed" ? "approved" : "rejected",
						comments,
						type: "Disbursement Approval"
					}
				approval_data = await sails.helpers.sailstrigger(url, JSON.stringify(body), header, method);
			}
		}
		if (disbursement_status == "Disbursed" && req.user.loggedInWhiteLabelID == sails.config.muthoot_wl) {
			const loan_sanction_update = await LoanSanction.updateOne({
				id: loan_disbursement_data.loan_sanction_id
			}).set({
				sanction_status: "Final Sanction"
			});
		}
		res.ok({
			status: "ok",
			message: "Disbursement status updated successfully"
		});
		if (
			sails.config.finnone.qInsertionFlag &&
			updateLoanDisbursementData &&
			updateLoanDisbursementData[0] &&
			updateLoanDisbursementData[0].disbursement_status === "Disbursed"
		) {
			await sails.helpers.insertIntoQ(
				sails.config.finnone.qNames.disbursed,
				{disbursement_id: updateLoanDisbursementData[0].id},
				sails.config.finnone.qUrl
			)
		}
		if (sails.config.insurance.triggerInsProposals) await sails.helpers.triggerInsuranceProposals(sanctionData.loan_id, req.headers.authorization);
	},

	getBpi: async function (req, res) {
		let response, statusCode = 200;
		try {
			//BPI=Broken Period Interest
			const disbursalAmnt = req.param('disbursement_amt'),
				annualRateOfInterest = req.param('san_interest');
			let date = req.param('disbursement_date');

			// if date in not passed in the payload, take the system date
			if (!date) date = momentTimezone(new Date()).tz("Asia/Kolkata").format("YYYY-MM-DD");

			const dateArr = date.split("-"),
				[year, month, day] = dateArr;
			let bpi = null;

			//bpi to be calulated for all the dates of a month
			//totalDays=noOfDays in the month
			//effectiveDays=noOfDays to considered for bpi calculation
			const effectiveDays = calculateDays(day, month, year);
			bpi = Math.round(calculateBpi(disbursalAmnt, annualRateOfInterest, effectiveDays));

			response = {
				status: "ok",
				statusCode: "NC200",
				bpi
			};
		} catch (err) {
			response = {
				status: "nok",
				statusCode: "NC500",
				errorMsg: err.message
			};
			statusCode = 500;
		}

		return res.status(statusCode).send(response);
	},
	delete_payment_details: async function (req, res) {
		const {disbursement_id, payment_id, status} = req.allParams();
		if (!disbursement_id || !payment_id || !status) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const paymentDetails = await LoanDisbursementPaymentRd.findOne({
			id: payment_id,
			disbursement_id,
			status: "active"
		});

		if (!paymentDetails) {
			return res.badRequest({
				status: "nok",
				message: "invalid data or invalid id."
			});
		}

		const updatePaymentDetails = await LoanDisbursementPayment.update({
			id: payment_id
		}).set({
			status
		}).fetch();

		return res.send({
			status: "ok",
			message: "Payment details deleted successfully.",
			data: updatePaymentDetails[0]
		});
	},
	emi: async function (req, res) {
		try {

			const {loan_bank_mapping_id: loanBankMappingId} = req.query;

			if (!loanBankMappingId) throw new Error("Missing loan_bank_mapping_id");

			const loanSanctionData = await LoanSanctionRd.findOne({loan_bank_mapping: loanBankMappingId}).select("san_emi");

			if (!loanSanctionData) throw new Error("No Data found for the provided loan_bank_mapping_id");

			return res.send({
				status: "ok",
				message: "Data fetched successfully!",
				data: {
					emi: loanSanctionData.san_emi
				}
			});

		} catch (error) {
			return res.send({
				status: "nok",
				message: error.message
			});
		}
	},
	retrigger_disbursal_memo: async function (req, res) {
		const disbursement_id = req.param("disbursement_id");
		if (!disbursement_id) return res.badRequest(sails.config.res.missingFields);
		const url = sails.config.disbursalMemo + disbursement_id;
		const apiRes = await sails.helpers.sailstrigger(url, "", "", "GET");
		if (!apiRes.status) {
			const data = JSON.parse(apiRes)
			if (data?.status === "ok") {
				const {s3_name, doc_name, s3_region} = data?.filePath || {};
				let presignedUrl = "Failed to fetch presigned URL";
				if (s3_name && doc_name && s3_region) presignedUrl = await sails.helpers.s3ViewDocument(doc_name, s3_name, s3_region);
				return res.ok({status: "ok", message: "Disbursal Memo retriggered successfully. Please check the document in Document status table in a while!", presignedUrl})
			}
		}
		return res.ok({status: "nok", message: "Disbursal Memo retrigger failed!"})
	},

	updateCharges: async function (req, res) {
		const {loan_ref_id, amount, type} = req.allParams();
		params = req.allParams();
		fields = ["loan_ref_id", "amount", "type"];
		missing = await reqParams.fn(params, fields);
		if (!loan_ref_id || (!amount && amount != 0) || !type) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({loan_ref_id});
		const loanBankMapping = await LoanBankMappingRd.findOne({loan_id: loanData.id});
		if (!loanData || !loanBankMapping) return res.badRequest({status: "nok", message: "Invalid Loan!"});
		if (amount < 0) return res.badRequest({status: "nok", message: "Invalid amount, please input valid amount"});

		const loan_disbursement_cond = {
			disbursement_status: {'!=': ["Disbursed", "deleted"]},
			loan_bank_mapping_id: loanBankMapping.id
		}
		try {
			switch (type) {
				case "cersai":
					await Promise.all([
						LoanBankMapping.updateOne({loan_id: loanData.id}).set({charge2: amount}),
						LoanSanction.updateOne({loan_id: loanData.id}).set({charge2: amount}),
						LoanDisbursement.update(loan_disbursement_cond).set({charge2: amount})
					]);
					return res.ok({status: "ok", message: "Cersai amount updated successfully"})

				case "stamp_duty":
					await Promise.all([
						LoanBankMapping.updateOne({loan_id: loanData.id}).set({charge1: amount}),
						LoanSanction.updateOne({loan_id: loanData.id}).set({charge1: amount}),
						LoanDisbursement.update(loan_disbursement_cond).set({charge1: amount})
					]);
					return res.ok({status: "ok", message: "Stamp duty amount updated successfully"});

				case "e_stamp":
					const loanDisbursementData = await LoanDisbursement.find(loan_disbursement_cond).select("sanction_additional_data");
					for (const record of loanDisbursementData) {
						if (record.sanction_additional_data) {
							let parsedData = JSON.parse(record.sanction_additional_data);
							parsedData.e_stamp_charge = amount;
							record.sanction_additional_data = JSON.stringify(parsedData);
						} else record.sanction_additional_data = JSON.stringify({e_stamp_charge: amount});
						await LoanDisbursement.updateOne({id: record.id}).set({sanction_additional_data: record.sanction_additional_data});
					};
					return res.ok({status: "ok", message: "E-stamp amount updated successfully"});

				default:
					return res.badRequest({status: "nok", message: "Invalid type!"});
			}
		} catch (error) {
			return res.serverError({
				status: "nok",
				message: "Something went wrong while updating",
				error: error
			})
		}
	}
};

function calculateBpi(disbursalAmnt, annualRateOfInterest, effectiveDays) {
	const DAYS_IN_A_YEAR = 365,
		PERCENT = 100,

		bpi = disbursalAmnt * (annualRateOfInterest / PERCENT) * effectiveDays / DAYS_IN_A_YEAR;

	return bpi;
}

function getLeapYearFlag(year) {
	let isLeapYear = false;
	if (year % 4 === 0) {
		if (year % 100 === 0) {
			if (year % 400 === 0) {
				isLeapYear = true;
			}
		} else {
			isLeapYear = true;
		}
	}

	return isLeapYear;
}

function calculateDays(day, month, year) {
	/* no of days should be returned cosidering 30 days in a month */
	let noOfDaysInMonth = 30;
	if (month == 2) {
		const isLeapYear = getLeapYearFlag(year);
		if (isLeapYear) noOfDaysInMonth = 29;
		else noOfDaysInMonth = 28;
	} else if (month == 4 ||
		month == 6 ||
		month == 9 ||
		month == 11) {
		noOfDaysInMonth = 30;
	} else noOfDaysInMonth = 31;


	if (day >= 1 && day <= 4) return (5 - day);

	return (noOfDaysInMonth - day + 5);
}
async function disbursementPayment(payment_advice, disbursement_id) {
	const datetime = await sails.helpers.dateTime(),
		data = [];
	const paymentData = await LoanDisbursementPaymentRd.find({disbursement_id: disbursement_id}).select("disbursement_id");
	if (paymentData.length > 0) {
		const deletedPaymentIds = paymentData.map(obj => obj.id).filter(id => id !== undefined && !Object.values(payment_advice).map(obj => obj.id).includes(id));
		if (deletedPaymentIds.length > 0) {
			await LoanDisbursementPayment.update({
				id: deletedPaymentIds
			}).set({status: "deleted"}).fetch();
		}
	}
	for (const payment_details of payment_advice) {
		payment_details.status = "active";
		let updateOrCreatePayment;
		if (payment_details.id) {
			const paymentFetch = await LoanDisbursementPaymentRd.findOne({id: payment_details.id});
			if (paymentFetch) {
				payment_details.upts = datetime;
				delete payment_details.id;
				updateOrCreatePayment = await LoanDisbursementPayment.update({id: paymentFetch.id})
					.set(payment_details).fetch();
			}

		} else {
			payment_details.ints = datetime;
			payment_details.disbursement_id = disbursement_id;
			updateOrCreatePayment = await LoanDisbursementPayment.create(payment_details).fetch();
		}
		data.push(updateOrCreatePayment);
	}
	return data;
}
async function loanTypeIdUpdate(loan_id, san_amount) {
	const loanReqData = await LoanrequestRd.findOne({id: loan_id}).select(["white_label_id", "loan_product_id"]),
		whitelabeSolutionData = await WhiteLabelSolutionRd.findOne({id: loanReqData.white_label_id}).select("assignment_type"),
		parseData = whitelabeSolutionData.assignment_type;
	if (parseData.change_loantypeid_in_disbursement &&
		parseData.change_loantypeid_in_disbursement.loan_products.includes(loanReqData.loan_product_id) &&
		Number(san_amount) > 2500000
	) {
		await Loanrequest.updateOne({id: loan_id}).set({loan_type_id: parseData.change_loantypeid_in_disbursement.loan_type_id});
	}

}
