/**
 * LoanSanction
 *
 * @description :: Server-side logic for managing LoanSanction
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/**
* User Loan Sanction
*
* @description :: User Loan Sanction
* @api {get} /loansanction?loan_id=210/ Loan Sanction
* @apiName User Loan Sanction
* @apiGroup Loans
* @apiExample Example usage:
* curl -i localhost:1337/loansanction?loan_id=210&loan_bank_mapping_id=1167
* @apiParam {Number} loan_id loan_id
* @apiParam {Number} loan_bank_mapping_id loan_bank_mapping_id
* @apiSuccess {object[]} disbursement_loan Disbursement loan.
* @apiSuccess {Number} disbursement_loan.id ID of the disbursement loan.
* @apiSuccess {Number} disbursement_loan.disbursement_amt disbursement amount.
* @apiSuccess {String} disbursement_loan.disbursement_amt_um lakhs/crores.
* @apiSuccess {String} disbursement_loan.disbursement_date disbursement loan date.
* @apiSuccess {String} disbursement_loan.repayment_doc repayment document (by default it is set to null).
* @apiSuccess {String} disbursement_loan.channel_invoice
* @apiSuccess {String} disbursement_loan.lender_confirmation lender confirmation (by default it is null).
* @apiSuccess {String} disbursement_loan.disbursement_amount_edit_history edit history of the disbursement amount(by default it is null).
* @apiSuccess {String} disbursement_loan.created_at loan created date and time.
* @apiSuccess {String} disbursement_loan.updated_at loan updated date and time.
* @apiSuccess {String} disbursement_loan.notification_status notification status.
* @apiSuccess {String} disbursement_loan.uploadStatus Upload Status.
* @apiSuccess {Number} disbursement_loan.loan_bank_mapping_id loan bank mapping id.
* @apiSuccess {Number} disbursement_loan.loan_sanction_id disbursement loan sanction ID.
* @apiSuccess {Object[]} disbursement_loan.payment
* @apiSuccess {Number} id loan banking and mapping id.
* @apiSuccess {String} loan_id Loan ID.
* @apiSuccess {String} san_amount loan sanction amount.
* @apiSuccess {String} san_interest loan sanction interest
* @apiSuccess {String} san_date loan sanction date.
* @apiSuccess {Number} userid user ID.
* @apiSuccess {String} upload_path
* @apiSuccess {String} loan_repay
* @apiSuccess {String} channel_invoice
* @apiSuccess {String} amount_um lakhs/crores.
* @apiSuccess {String} sanction_process_fee fee for the loan sanction process.
* @apiSuccess {String} created_at loan sanction created date and time.
* @apiSuccess {String} updated_at loan sanction updated date and time.
* @apiSuccess {Number} status status of the sanction loan.
* @apiSuccess {Object} loan_bank_mapping mapping with other banks loan.

*/

	/**
* Bank mapping
*
* @description :: Bank mappin
* @api {get} /loanbankmapping/ Loan Bank Mapping
* @apiName Loan Bank Mapping
* @apiGroup Loan Bank Mapping
* @apiDescription Get the loan bank mapping , and also can filter by loan_id
* @apiExample Example usage:
* curl -i localhost:1337/loanbankmapping/
* curl -i localhost:1337/loanbankmapping/?loan_id=1

* @apiSuccess {Object[]} loan_disbursement loan disbursement details.
* @apiSuccess {Object[]} lender_document lender document details.
* @apiSuccess {Number} id loan banking and mapping id.
* @apiSuccess {Number} loan_id Loan ID.
* @apiSuccess {Number} business_id business Id.
* @apiSuccess {Number} bank_emp_id bank employee id.
* @apiSuccess {Number} loan_bank_status bank loan status.
* @apiSuccess {Number} loan_borrower_status loan borrower status.

* @apiSuccess {Number} offer_amnt bank offer amount.
* @apiSuccess {String} offer_amnt_um lakhs/crores.
* @apiSuccess {Number} interest_rate bank interest rate
* @apiSuccess {Number} term bank terms.
* @apiSuccess {Number} emi bank emi.
* @apiSuccess {Number} processing_fee fee for the processing.
* @apiSuccess {Number} expected_time_to_disburse expected time for the disburse,
* @apiSuccess {Number} offer_validity bank offer validity.
* @apiSuccess {String} remarks remarks
* @apiSuccess {String} bank_assign_date bank assign date.
* @apiSuccess {Number} lender_offer_date  lender offer date.
* @apiSuccess {String} borrower_acceptence_date borrower acceptence date.
* @apiSuccess {String} meeting_flag
* @apiSuccess {String} notification_status
* @apiSuccess {String} upload_doc document upload.
* @apiSuccess {String} lender_ref_id lender reference id.
* @apiSuccess {String} created_at lender created date and time.
* @apiSuccess {String} updated_at lender updated date and time.
* @apiSuccess {Number} source
* @apiSuccess {String} status_history status history.
* @apiSuccess {Object} business business details.
* @apiSuccess {Object} bank information of the bank.
* @apiSuccess {Number} bank.id bank id.
* @apiSuccess {String} bank.bankname bank name.
* @apiSuccess {String} bank.isLender
* @apiSuccess {String} bank.type bank type.
* @apiSuccess {String} bank.category bank category.
* @apiSuccess {String} bank.status bank status.
* @apiSuccess {String} bank.parent_bank_flag
* @apiSuccess {String} bank.bank_acc_expression
* @apiSuccess {Number} bank.yodlee_site_id
* @apiSuccess {Number} bank.parent_id parent id of the bank.
* @apiSuccess {String} bank.logo_url bank logo url.
* @apiSuccess {String} bank.white_label_id white label id.
* @apiSuccess {Object} lender_status status of the lender.
* @apiSuccess {Number} lender_status.id lender id.
* @apiSuccess {String} lender_status.status lender status
* @apiSuccess {Number} lender_status.display_post_offer
* @apiSuccess {String} lender_status.loan_bank_status_to_show
* @apiSuccess {String} lender_status.loan_bank_status_to_show
* @apiSuccess {Number} lender_status.disbursement_status disbursement status.

*/
	fetchList: async function (req, res) {
		const loan_id = req.param("loan_id"),
			loan_bank_mapping_id = req.param("loan_bank_mapping_id"),
			//get the loan request details
			whereCondition = {loan_id: loan_id, loan_bank_mapping: loan_bank_mapping_id},
			viewSanctionLoanList = await LoanSanctionRd.find(whereCondition).populate("disbursement_loan");
		loan_details = await LoanrequestRd.findOne({id: loan_id});
		loanProductData = await LoanProductsRd.findOne({id: loan_details.loan_product_id});
		currency =
			loanProductData && loanProductData.dynamic_forms ? loanProductData.dynamic_forms.currency == "INR" : null;
		if (Object.keys(viewSanctionLoanList).length > 0) {
			const logService = await sails.helpers.logtrackservice(req, "loansanction", req.user.id, "loan_sanction");
			Promise.all(
				viewSanctionLoanList.map(async (sanctionListElement) => {
					sanctionListElement.disbursement_loan.map(async (disbursmentList) => {
						if (currency) {
							const dis_amount_data = await sails.helpers.unitConverter(
								disbursmentList.disbursement_amt,
								disbursmentList.disbursement_amt_um
							);
							disbursmentList.disbursement_amt = dis_amount_data.value;
							disbursmentList.disbursement_amt_um = dis_amount_data.value_um;
						}
						const paymentStatusReport = await TblPaymentRd.findOne({disbursement_id: disbursmentList.id})
							.populate("payment_status")
							.then((paymentStatusReportresult) => {
								if (paymentStatusReportresult) {
									disbursmentList.payment = paymentStatusReportresult;
								} else {
									disbursmentList.payment = [];
								}
							});
						return paymentStatusReport;
					});

					if (currency) {
						const san_amount_data = await sails.helpers.unitConverter(
							sanctionListElement.san_amount,
							sanctionListElement.amount_um
						);
						sanctionListElement.san_amount = san_amount_data.value;
						sanctionListElement.amount_um = san_amount_data.value_um;
					}
					sanctionListElement.sanction_asset_data =
						await LoanSanctionAdditionalRd.find({loan_id, loan_bank_mapping_id, status: "active"}) || [];
					const loan_bank_mapping_details = await LoanBankMappingRd.findOne({
						id: sanctionListElement.loan_bank_mapping
					})
						.populate("loan_disbursement")
						.populate("bank_id")
						.populate("lender_status"),
						lender_doc_details = await LenderDocumentRd.find({
							loan_bank_mapping: sanctionListElement.loan_bank_mapping,
							status: "active"
						}).populate("doc_type");
					for (const element of lender_doc_details) {
						if (element.size_of_file) {
							const size = await sails.helpers.filesize(element.size_of_file, 2);
							element.size_of_file = size;
						}
					}
					loan_bank_mapping_details.lender_document = lender_doc_details;
					sanctionListElement.loan_bank_mapping = loan_bank_mapping_details;
					return loan_bank_mapping_details;
					//return businessDetails;
				})
			).then(() => {
				return res.ok(viewSanctionLoanList);
			});
		} else {
			const loanbankmapping_details = await LoanBankMappingRd.findOne({
				id: loan_bank_mapping_id,
				loan_id: loan_id,
				loan_bank_status: 12,
				loan_borrower_status: 10
			});
			if (loanbankmapping_details && loanbankmapping_details.meeting_flag != 0) {
				var meetingSchedule_details = await PhysicalMeetingsAcceptanceRd.find({
					loan_bank_mapping: loan_bank_mapping_id,
					loan_id: loan_id,
					meeting_type_id: loanbankmapping_details.meeting_flag
				});
			}
			return res.ok({
				loanBankMapDetails: loanbankmapping_details,
				meetingScheduleDetails: meetingSchedule_details
			});
		}
	},

	/**
	 * User Loan Sanction
	 *
	 * @description :: User Loan Sanction
	 * @api {post} /loansanction/update Loan Sanction Update
	 * @apiName User Loan Sanction Update
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/loansanction/update
	 * @apiParam {Number} san_amount san_amount
	 * @apiParam {Date} san_date san_date
	 * @apiParam {Number} san_interest san_interest
	 * @apiParam {Number} sanction_id sanction_id
	 * @apiParam {String} upload_path upload_path
	 * @apiParam {String} loan_repay loan_repay
	 * @apiParam {String} channel_invoice channel_invoice
	 * @apiParam {String} amount_um amount_um
	 * @apiParam {String} sanction_process_fee sanction_process_fee
	 * @apiParam {String} lender_ref_id lender_ref_id
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Successfully Updated.
	 * @apiSuccess {Object} data
	 * @apiSuccess {Number} data.id sanction id.
	 * @apiSuccess {String} data.loan_id loan id.
	 * @apiSuccess {String} data.san_amount sanction amount.
	 * @apiSuccess {String} data.san_interest sanction interest.
	 * @apiSuccess {String} data.san_date sanction date.
	 * @apiSuccess {Number} data.userid user id.
	 * @apiSuccess {String} data.upload_path upload path.
	 * @apiSuccess {String} data.loan_repay loan repay document.
	 * @apiSuccess {String} data.channel_invoice
	 * @apiSuccess {String} data.amount_um Lakhs/Crore.
	 * @apiSuccess {String} data.sanction_process_fee sanction process fee.
	 * @apiSuccess {String} data.created_at created date and time.
	 * @apiSuccess {String} data.updated_at updated date and time.
	 * @apiSuccess {number} data.status status.
	 * @apiSuccess {String} data.loan_bank_mapping loan bank mapping id.
	 */

	edit: async function (req, res) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let data;
		const today = new Date(),
			user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel}),
			datetime = await sails.helpers.dateTime(),
			lenderRefId = req.body.lender_ref_id,
			san_term = req.param('san_term'),
			san_interest = req.param('san_interest')

		if (req.body.sanction_id != "" && req.body.sanction_id != "undefined") {
			let sanctionData = await LoanSanctionRd.findOne({id: req.body.sanction_id}).select("loan_id");
			let loanrequestData = await LoanrequestRd.findOne({id: sanctionData.loan_id}).select("loan_product_id");
			if (!loanrequestData) return res.ok({status: "nok", message: "No Loan found"});
			let productsData = await LoanProductsRd.findOne({id: loanrequestData.loan_product_id}).select("dynamic_forms");
			const {min, max} = productsData.dynamic_forms.offer_details.fields.find(obj => obj.name === "processing_fee_percent") || {};
			if (min && max) {
				if (Number(req.body.processing_fee_percent) < min) {
					return res.ok({
						status: "nok",
						message: `Entered processing fee percent is less than ${min}`
					})
				}
				else if (Number(req.body.processing_fee_percent) > max) {
					return res.ok({
						status: "nok",
						message: `Entered processing fee percent is greater than ${max}`
					})
				}
			}

			let sanction_amount, amount_um;
			if (!req.body.amount_um) {
				const amount_data = await sails.helpers.unitConverter(req.body.san_amount);
				sanction_amount = amount_data.value;
				amount_um = amount_data.value_um;
			} else {
				sanction_amount = req.body.san_amount;
				amount_um = req.body.amount_um;
			}

			const {
				fee_deductible,
				imd_recieved
			} = req.allParams();


			let total_fees = 0;
			if (fee_deductible != undefined) total_fees += Number(fee_deductible);
			if (imd_recieved != undefined) total_fees += Number(imd_recieved);

			data = {
				...req.allParams(),
				san_amount: sanction_amount,
				san_interest: req.body.san_interest,
				amount_um: amount_um,
				// sanction_process_fee: req.body.sanction_process_fee,
				// status: req.body.status,
				updated_at: datetime,
				total_fees
				// san_date: req.body.san_date,
				// fee1: req.body.fee1,
				// fee2: req.body.fee2,
				// fee3: req.body.fee3
			};

			if (typeof req.body.upload_path !== "undefined") {
				data.upload_path = req.body.upload_path;
			}
			if (typeof req.body.loan_repay !== "undefined") {
				data.loan_repay = req.body.loan_repay;
			}
			if (typeof req.body.channel_invoice !== "undefined") {
				data.channel_invoice = req.body.channel_invoice;
			}
			const sanctionId = Number(req.body.sanction_id),
				san_amount = data.amount_um == "Crores" ? data.san_amount * 100 : data.san_amount,
				currentDisbursmentAmount =
					"select sum(IF(disbursement_amt_um='Crores', disbursement_amt*100, disbursement_amt))  as curr_disbursement_amt from loan_disbursement where loan_sanction_id=" +
					sanctionId +
					"",
				disbursement = await myDBStore.sendNativeQuery(currentDisbursmentAmount),
				disbursementamount = disbursement.rows[0].curr_disbursement_amt;
			//Lender Refer Id update
			if (typeof lenderRefId !== "undefined" && sanctionId) {
				var loanSanctionDetails = await LoanSanctionRd.findOne({id: sanctionId});
				if (loanSanctionDetails && loanSanctionDetails.loan_bank_mapping) {
					loanbankmapping_details = {
						lender_ref_id: lenderRefId,
						notification_status: "yes"
					};
					let {no_of_advance_emi, type_of_disbursement} = req.body;
					if (no_of_advance_emi || type_of_disbursement) {
						const loanbankmap = await LoanBankMappingRd.findOne({id: loanSanctionDetails.loan_bank_mapping}).select("offer_additional_data")
						if (!loanbankmap.offer_additional_data) loanbankmapping_details.offer_additional_data = JSON.stringify({no_of_advance_emi, type_of_disbursement})
						else {
							let offer_additional_data = JSON.parse(loanbankmap.offer_additional_data)
							loanbankmapping_details.offer_additional_data = JSON.stringify({...offer_additional_data, no_of_advance_emi, type_of_disbursement})
						}
					}

					if (disbursementamount && san_amount == disbursementamount) {
						loanbankmapping_details.lender_status = 16;
					} else if (disbursementamount && san_amount > disbursementamount) {
						loanbankmapping_details.lender_status = 17;
					} else if (san_amount && !disbursementamount) {
						loanbankmapping_details.lender_status = 29;
					}
					else {
						res.badRequest({
							status: "nok",
							message: sails.config.msgConstants.sanctionAmountError
						});
					}
					const LenderRefIdUpdate = await LoanBankMapping.update({id: loanSanctionDetails.loan_bank_mapping})
						.set(loanbankmapping_details)
						.fetch();
				}
			}
			//update the loan sanction
			const LoanSanctionUpdate = await LoanSanction.update({id: sanctionId}).set(data).fetch(),
				logService = await sails.helpers.logtrackservice(
					req,
					"loansanction/update",
					loanSanctionDetails.id,
					"loan_sanction"
				);
			if (LoanSanctionUpdate) {
				const loanSanctionUpdateDetails = await LoanSanctionRd.findOne({id: sanctionId}).populate(
					"loan_bank_mapping"
				);
				doctype_condition = [sails.config.sanction_letter_doc_type, sails.config.kfs_doc_type];
				await LenderDocument.update({doc_type: doctype_condition, loan: loanSanctionDetails.loan_id})
					.set({
						status: "inactive"
					})

				res.ok({
					status: "ok",
					message: sails.config.msgConstants.successfulUpdation,
					data: loanSanctionUpdateDetails
				});

				if ((sanction_amount !== sanctionData.san_amount ||
					(amount_um !== sanctionData.amount_um)) ||
					san_term !== sanctionData.san_term ||
					san_interest !== sanctionData.san_interest) {
					const loanId = sanctionData.loan_id
					await sails.helpers.insReset(loanId);
				}

			} else {
				return res.badRequest({
					exception: sails.config.msgConstants.invalidParameters
				});
			}
		} else {
			return res.badRequest({
				exception: sails.config.msgConstants.invalidParameters
			});
		}
	},
	/**
   * @description :: Lender Accept and Reject
   * @api {post} /loanAcceptReject/ Loan Accept and Reject
   * @apiName Loan accept reject
   * @apiGroup Loan Bank Mapping
   * @apiDescription Get the loan bank mapping , and also can filter by loan_id
   * @apiExample Example usage:
   * curl -i localhost:1337/loanAcceptReject/

   * @apiParam {String} status Accept/Reject.
   * @apiParam {Number} loan_bank_mapping_id loan bank mapping id.
   * @apiParam {Number} loan_id loan id.
   *
   * @apiSuccess {String} status ok.
   * @apiSuccess {String} message borrower status update successfully.

   */

	loanAcceptReject: async function (req, res) {
		const status = req.body.status,
			loan_bank_mapping_id = req.body.loan_bank_mapping_id,
			loan_id = req.body.loan_id,
			datetime = await sails.helpers.dateTime(),
			mapping = await LoanBankMappingRd.findOne({
				where: {id: loan_bank_mapping_id, loan_id: loan_id, loan_bank_status: "12", loan_borrower_status: "3"}
			});
		let loanbank, date;
		if (status == "Accept") {
			loanbank = "10";
			date = datetime;
		} else if (status == "Reject") {
			loanbank = "11";
		} else {
			return res.badRequest({
				exception: sails.config.msgConstants.wrongStatus
			});
		}
		if (mapping) {
			const bankmap = await LoanBankMapping.update({id: mapping.id})
				.set({
					loan_borrower_status: loanbank,
					borrower_acceptence_date: date,
					notification_status: "yes"
				})
				.fetch(),
				logService = await sails.helpers.logtrackservice(
					req,
					"loanAcceptReject",
					mapping.id,
					"loan_bank_mapping"
				);

			return res.ok({
				status: "Ok",
				message: sails.config.msgConstants.successfulUpdation,
				data: bankmap
			});
		} else {
			return res.badRequest({
				exception: sails.config.msgConstants.unauthorizedAction
			});
		}
	},
	/**
 *  @description :: Add Sanction
   * @api {post} /addSanction/ Add Sanction
   * @apiName Add Sanction
   * @apiGroup Loans
   * @apiExample Example usage:
   * curl -i localhost:1337/addSanction/

   * @apiParam {Number} loan_id loan ID.
   * @apiParam {Number} loan_bank_map_id loan bank mapping ID.
   * @apiParam {Number} sanction_type Sanction type.
   * @apiParam {String} san_amount Sanction amount.
   * @apiParam {String} amount_um Sanction amount Lakhs/Crores.
   * @apiParam {String} san_interest Sanction Interest rate.
   * @apiParam {String} sanction_process_fee  Sanction process fee.
   * @apiParam {String} san_date sanction date.
   * @apiParam {String} disbursement_amt Disbursement amount.
   * @apiParam {String} disbursement_amt_um Disbursement amount Lakhs/Crores.
   * @apiParam {String} disbursement_date Disbursement date.
   * @apiParam {String} upload_path file upload path.
   * @apiParam {String} loan_repay
   * @apiParam {String} channel_invoice
   * @apiParam {String} lender_ref_id lender reference id.
   *
   *
   * @apiSuccess {String} status ok.
   * @apiSuccess {String} message Sanction added successfully.
   * @apiSuccess {Object} data
   * @apiSuccess {Object[]} data.disbursement_loan disbursement loan details.
   * @apiSuccess {Number} data.disbursement_loan.id disbursement ID.
   * @apiSuccess {Number} data.disbursement_loan.disbursement_amt disbursement amount.
   * @apiSuccess {String} data.disbursement_loan.disbursement_amt_um disbursement amount Lakhs/Crores.
   * @apiSuccess {String} data.disbursement_loan.disbursement_date disbursement date.
   * @apiSuccess {String} data.disbursement_loan.repayment_doc repayment document.
   * @apiSuccess {String} data.disbursement_loan.channel_invoice
   * @apiSuccess {String} data.disbursement_loan.lender_confirmation lender confirmation document
   * @apiSuccess {String} data.disbursement_loan.disbursement_amount_edit_history disbursement amount edit history.
   * @apiSuccess {String} data.disbursement_loan.created_at disbursement created date.
   * @apiSuccess {String} data.disbursement_loan.updated_at disbursement updated date.
   * @apiSuccess {String} data.disbursement_loan.notification_status notification status.
   * @apiSuccess {String} data.disbursement_loan.uploadStatus upload status.
   * @apiSuccess {Number} data.disbursement_loan.loan_bank_mapping_id loan bank mapping ID.
   * @apiSuccess {Number} data.disbursement_loan.loan_sanction_id loan sanction ID.
   * @apiSuccess {Number} data.id sanction ID.
   * @apiSuccess {String} data.loan_id loan ID.
   * @apiSuccess {String} data.san_amount Sanction amount.
   * @apiSuccess {String} data.san_interest Sanction Interest rate.
   * @apiSuccess {String} data.san_date sanction date.
   * @apiSuccess {Number} data.userid user ID.
   * @apiSuccess {String} data.upload_path upload path.
   * @apiSuccess {String} data.loan_repay
   * @apiSuccess {String} data.channel_invoice
   * @apiSuccess {String} data.amount_um Sanction amount Lakhs/Crores.
   * @apiSuccess {String} data.sanction_process_fee Sanction process fee.
   * @apiSuccess {String} data.created_at created date.
   * @apiSuccess {String} data.updated_at updated date.
   * @apiSuccess {String} data.status status.
   * @apiSuccess {Object} data.loan_bank_mapping loan bank mapping ID.

 */

	addSanction: async function (req, res) {
		let {sanction_type: sanctionType,
			loan_id: loanid,
			loan_bank_map_id: loanbankmapid,
			disbursement_amt,
			disbursement_amt_um,
			disbursement_date,
			fee_deductible,
			imd_recieved,
			processing_fee_percent,
			no_of_advance_emi,
			type_of_disbursement
		} = req.allParams(),

			total_fees = 0;

		let loanrequestData = await LoanrequestRd.findOne({id: loanid}).select("loan_product_id");
		if (!loanrequestData) return res.ok({status: "nok", message: "No Loan found"})
		let productsData = await LoanProductsRd.findOne({id: loanrequestData.loan_product_id}).select("dynamic_forms");
		const {min, max} = productsData.dynamic_forms.offer_details.fields.find(obj => obj.name === "processing_fee_percent") || {};
		if (min && max) {
			if (Number(processing_fee_percent) < min) {
				return res.ok({
					status: "nok",
					message: `Entered processing fee percent is less than ${min}`
				})
			}
			else if (Number(processing_fee_percent) > max) {
				return res.ok({
					status: "nok",
					message: `Entered processing fee percent is greater than ${max}`
				})
			}
		}
		if (fee_deductible != undefined) total_fees += Number(fee_deductible);
		if (imd_recieved != undefined) total_fees += Number(imd_recieved);

		user_id = req.user["id"];
		datetime = await sails.helpers.dateTime();
		if (
			loanid &&
			loanbankmapid &&
			sanctionType &&
			req.body.san_amount &&
			req.body.san_interest &&
			req.body.sanction_process_fee &&
			req.body.san_date
		) {
			const sanction = await LoanSanctionRd.findOne({
				loan_bank_mapping: loanbankmapid,
				loan_id: loanid,
				userid: user_id
			});
			if (!sanction) {
				const sanType = await LoanStatusWithLenderRd.findOne({id: sanctionType}),
					loanbankmap = await LoanBankMappingRd.findOne({where: {id: loanbankmapid, loan_id: loanid}});
				if (loanbankmap) {
					if (sanType && (sanType.id === 12 || sanType.id === 16 || sanType.id === 17 || sanType.id === 29)) {
						const sanobj = JSON.parse(sanType.status_to_update);
						loanbankmap_update = {
							loan_borrower_status: sanobj.loan_borrower_status,
							loan_bank_status: sanobj.loan_bank_status,
							lender_status: sanType.id,
							notification_status: "yes",
							lender_ref_id: req.body.lender_ref_id
						};
						if (no_of_advance_emi || type_of_disbursement) {
							if (!loanbankmap.offer_additional_data) loanbankmap_update.offer_additional_data = JSON.stringify({no_of_advance_emi, type_of_disbursement})
							else {
								let offer_additional_data = JSON.parse(loanbankmap.offer_additional_data)
								loanbankmap_update.offer_additional_data = JSON.stringify({...offer_additional_data, no_of_advance_emi, type_of_disbursement})
							}
						}
						let san_amount, amount_um;
						if (!req.body.amount_um) {
							const amount_data = await sails.helpers.unitConverter(req.body.san_amount);
							san_amount = amount_data.value;
							amount_um = amount_data.value_um;
						} else {
							san_amount = req.body.san_amount;
							amount_um = req.body.amount_um;
						}
						const {sanction_type} = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID}).select("sanction_type");
						data = {
							...req.allParams(),
							loan_id: loanbankmap.loan_id,
							loan_bank_mapping: loanbankmap.id,
							san_amount,
							amount_um,
							userid: user_id,
							created_at: datetime,
							updated_at: datetime,
							sanction_status: req.body.sanction_status ? req.body.sanction_status : sanction_type,
							total_fees
						};
						if (loanbankmap?.sanction_additional_data) {
							const assets = JSON.parse(loanbankmap.sanction_additional_data)?.assets
							if (assets) data.sanction_additional_data = JSON.stringify({assets: assets})
						}
						if (req.body.upload_path !== "" && req.body.upload_path !== undefined) {
							data.upload_path = req.body.upload_path;
						}
						if (req.body.loan_repay !== "" && req.body.loan_repay !== undefined) {
							data.loan_repay = req.body.loan_repay;
						}
						if (req.body.channel_invoice !== "" && req.body.channel_invoice !== undefined) {
							data.channel_invoice = req.body.channel_invoice;
						}

						disburse_data = {
							loan_bank_mapping_id: loanbankmap.id,
							disbursement_amt: san_amount,
							disbursement_amt_um: amount_um,
							disbursement_date: req.body.san_date,
							repayment_doc: data.loan_repay,
							channel_invoice: data.channel_invoice,
							created_at: datetime,
							disbursement_status: "draft"
							// updated_at: datetime
						};
						if (loanbankmap.offer_amnt == null || loanbankmap.offer_amnt === 0) {
							loanbankmap_update.offer_amnt = san_amount;
							loanbankmap_update.offer_amnt_um = amount_um;
							loanbankmap_update.interest_rate = req.body.san_interest;
							loanbankmap_update.processing_fee = req.body.sanction_process_fee;
						}
						if (sanType.id === 17) {
							if (!disbursement_amt_um) {
								const dis_amount_data = await sails.helpers.unitConverter(disbursement_amt);
								disbursement_amt = dis_amount_data.value;
								disbursement_amt_um = dis_amount_data.value_um;
							}
							if (disbursement_amt && disbursement_date && disbursement_amt_um) {
								const sanction_amount =
									data.amount_um == "Crores" ? data.san_amount * 100 : data.san_amount,
									disbursement_amount =
										disbursement_amt_um == "Crores" ? disbursement_amt * 100 : disbursement_amt;
								if (Number(sanction_amount) >= Number(disbursement_amount)) {
									disburse_data.disbursement_amt = disbursement_amt;
									disburse_data.disbursement_amt_um = disbursement_amt_um;
									disburse_data.disbursement_date = disbursement_date;
								} else {
									return res.badRequest({
										status: "nok",
										message: sails.config.msgConstants.disbursementAmountGreater
									});
								}
							} else {
								return res.badRequest({
									status: "nok",
									message: sails.config.msgConstants.disbursementFieldsMissing
								});
							}
						}
						const createdSanction = await LoanSanction.create(data).fetch();

						await LoanSanctionAdditional.update({loan_id: loanid, loan_bank_mapping_id: loanbankmap.id})
							.set({
								loan_sanction_id: createdSanction.id
							})
						logService = await sails.helpers.logtrackservice(
							req,
							"addSanction",
							createdSanction.id,
							"loan_sanction"
						),
							updatedloanbankmap = await LoanBankMapping.update({
								id: loanbankmap.id,
								loan_id: loanbankmap.loan_id
							})
								.set(loanbankmap_update)
								.fetch();
						await LenderDocument.update({doc_type: sails.config.sanction_letter_doc_type, loan: loanbankmap.loan_id})
							.set({
								status: "inactive"
							});
						if (sanType.id === 16 || sanType.id === 17) {
							disburse_data.loan_sanction_id = createdSanction.id;
							const createdisburse = await LoanDisbursement.create(disburse_data).fetch();
						}
						const created_Sanction = await LoanSanctionRd.findOne({id: createdSanction.id})
							.populate("loan_bank_mapping")
							.populate("disbursement_loan", {
								where: {
									loan_sanction_id: createdSanction.id,
									loan_bank_mapping_id: loanbankmap.id
								}
							});
						return res.send({
							status: "Ok",
							message: sails.config.msgConstants.sanctionAdded,
							data: created_Sanction
						});
					} else {
						return res.badRequest({
							status: "nok",
							message: sails.config.msgConstants.wrongSanctionType
						});
					}
				} else {
					return res.badRequest({
						status: "nok",
						message: sails.config.msgConstants.loanIdLoanBankMappingMismatch
					});
				}
			} else {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.loanSanctionedAlready
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
	addSanctionAdditionalData: async function (req, res) {
		const {loan_id, loan_bank_mapping_id, loan_sanction_id, data} = req.allParams();
		if (!loan_id || !loan_bank_mapping_id || data.length === 0 || Object.keys(data[0]).length === 0) {
			return res.badRequest({
				status: "nok",
				message: "Loan ID or Loan bank mapping id is missing OR mandatory fields missing."
			});
		}
		const datetime = await sails.helpers.dateTime();
		loanbankmap = await LoanBankMappingRd.findOne({id: loan_bank_mapping_id, loan_id});
		// sanction_amount = await LoanSanctionAdditional.sum("sanctioned_amount").where({loan_id, loan_bank_mapping_id});
		// return res.ok(sanction_amount);
		let message, assetsSanctionData = [];
		for (const as_data of data) {
			const {ltv, roi, tenure, emi_amount} = as_data;
			data1 = {
				loan_id,
				loan_bank_mapping_id,
				...as_data,
				additional_data: JSON.stringify({ltv, roi, tenure, emi: emi_amount}),
				loan_sanction_id,
				status: "active"
			};
			if (as_data.id) {
				data1.updated_at = datetime;
				data1.updated_by = req.user.id;
				const updatedData = await LoanSanctionAdditional.updateOne({id: as_data.id}).set(data1).fetch();
				assetsSanctionData.push(updatedData);
				message = "Data updated successfully.";
			} else {
				data1.created_at = datetime;
				data1.created_by = req.user.id;
				const createdData = await LoanSanctionAdditional.create(data1).fetch();
				assetsSanctionData.push(createdData);
				message = "Data created successfully.";
			}
		}
		return res.ok({
			status: "ok",
			message,
			data: assetsSanctionData
		});
	},
	deleteSanctionAdditionalData: async function (req, res) {
		const {id, loan_id, loan_sanction_id} = req.allParams();
		if (!id || !loan_id || !loan_sanction_id) {
			return res.badRequest({
				status: "nok",
				message: "Mandatory fields are missing."
			});
		}
		const additional_data = await LoanSanctionAdditionalRd.findOne({
			id, loan_id, loan_sanction_id
		});
		if (!additional_data) {
			return res.badRequest({
				status: "nok",
				message: "Invalid data provided."
			});
		}
		const updateStatus = await LoanSanctionAdditional.update({id, loan_id, loan_sanction_id}).set({
			status: "deleted"
		}).fetch();

		return res.ok({
			status: "ok",
			message: "Data deleted successfully."
		});
	},

	// muthoot API for dynamically adding more data
	addSanctionAdditional: async function (req, res) {

		try {

			const {sanction_id: sanctionId, loan_id: loanId, loan_bank_mapping_id: loanBankMapId, sanction_additional_data: sanctionAdditionalData} = req.body;
			if (!sanctionId || !loanId || !loanBankMapId || !sanctionAdditionalData) throw new Error("Missing mandatory params");

			const loanSanction = await LoanSanctionRd.findOne({
				loan_id: loanId
			}).select("id");

			if (!loanSanction || loanSanction.id != sanctionId) throw new Error("Invalid sanction Id");

			const loanSanctionAdditional = await LoanSanctionAdditionalRd.findOne({
				loan_id: loanId
			}).select("id");
			if (loanSanctionAdditional) throw new Error("additional Data already exits");

			const additionalData = {
				loan_sanction_data: sanctionAdditionalData
			}

			if (req.body.san_amount && req.body.san_date) {
				let loanrequestData = await LoanrequestRd.findOne({id: loanId}).select("loan_product_id");
				let productsData = await LoanProductsRd.findOne({id: loanrequestData.loan_product_id}).select("dynamic_forms");
				const preQualifiedTwData = productsData?.dynamic_forms?.add_sanction?.sub_sections.find(obj => obj.api_key == "pre_qualified_tw_loan");
				if (preQualifiedTwData) additionalData.pre_qualified_tw_data = preQualifiedTwLoanUpdate(preQualifiedTwData, req.body.san_amount, req.body.san_date);
			}

			await LoanSanctionAdditional.create({
				loan_id: loanId,
				loan_bank_mapping_id: loanBankMapId,
				loan_sanction_id: sanctionId,
				created_by: req?.user?.id,
				created_at: await sails.helpers.dateTime(),
				additional_data: JSON.stringify(additionalData)
			});

			return res.send({
				status: "ok",
				message: "Sanction Additional Data Saved Successfully"
			})

		} catch (error) {

			return res.send({
				status: "nok",
				message: error.message
			})
		}

	},
	reasonsForNotDisbursement: async function (req, res) {
		const {loan_id, loan_bank_map_id, loan_sanction_id, main_reason, sub_reason, lender_status_id} = req.allParams();
		if (!loan_id || !loan_bank_map_id || !loan_sanction_id || !sub_reason) {
			return res.badRequest(sails.config.res.missingFields);
		}
		try {
			let remarks = {}, datetime = await sails.helpers.dateTime();
			const loanRequestData = await LoanrequestRd.findOne({id: loan_id}).select("remarks"),
				commentsObj = {
					lender_status_id: lender_status_id || 12,
					comments: sub_reason,
					main_reason,
					sub_reason,
					comment_type: "Sanctioned but not Disbursed",
					user_id: req.user.id,
					user_name: req.user.name
				};
			await RevenueStatusComments.create({
				loan_bank_mapping_id: loan_bank_map_id,
				comments: JSON.stringify({main_reason, sub_reason}),
				comment_id: lender_status_id || 12,
				type: "Sanctioned but not Disbursed",
				created_on: datetime,
				created_by: req.user.id
			});
			datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();

			if (loanRequestData.remarks) {
				const parseData = JSON.parse(loanRequestData.remarks);
				parseData[datetime] = commentsObj;
				remarks = JSON.stringify(parseData);
			} else {
				remarks[datetime] = commentsObj;
				remarks = JSON.stringify(remarks);
			}
			await LoanBankMapping.updateOne({
				id: loan_bank_map_id,
				loan_id: loan_id
			}).set({lender_status: lender_status_id || 12});
			await Loanrequest.updateOne({id: loan_id}).set({remarks});

			return res.ok({
				status: "ok",
				message: "Reasons updated successfully."
			})
		} catch (err) {
			return res.serverError({
				status: "nok",
				message: "Internal server error",
				data: err
			});
		}
	}

};

function preQualifiedTwLoanUpdate(preQualifiedTwCondition, sanctionAmount, sanctionDate) {
	const {validity_period, max_percent, max_amount} = preQualifiedTwCondition
	const preQualifiedAmount = Math.min(max_amount, (max_percent * sanctionAmount) / 100)
	const sanDate = new Date(sanctionDate)
	sanDate.setDate(sanDate.getDate() + validity_period)
	const preQualifiedValidityDate = sanDate.toLocaleDateString('en-US');
	return {pre_qualified_loan_amount: preQualifiedAmount, offer_valid_until: preQualifiedValidityDate}
}
