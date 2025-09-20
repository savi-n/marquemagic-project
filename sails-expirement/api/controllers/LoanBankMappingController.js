/**
 * LoanBankMappingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {AppSync} = require("aws-sdk");
const reqParams = require("../helpers/req-params");

module.exports = {
	/**
	 * @api {GET} /loanbankmappingdetails/ Loan Mapping details
	 * @api {get} /loanbankmappingdetails?loan_id=4746
	 * @apiName Loan mapping details
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/loanbankmappingdetails?loan_id=4746
	 *
	 * @apiSuccess {Object[]} loan_disbursement
	 * @apiSuccess {Number} loan_disbursement.id disbursement id.
	 * @apiSuccess {Number} loan_disbursement.disbursement_amt disbursement amount.
	 * @apiSuccess {String} loan_disbursement.disbursement_amt_um Lakhs/Crore
	 * @apiSuccess {String} loan_disbursement.disbursement_date disbursement date.
	 * @apiSuccess {String} loan_disbursement.repayment_doc repayment document.
	 * @apiSuccess {String} loan_disbursement.channel_invoice channel invoice document.
	 * @apiSuccess {String} loan_disbursement.lender_confirmation lender confirmation document
	 * @apiSuccess {String} loan_disbursement.disbursement_amount_edit_history disbursement amount edit history.
	 * @apiSuccess {String} loan_disbursement.created_at created date and time.
	 * @apiSuccess {String} loan_disbursement.updated_at updated date and time.
	 * @apiSuccess {String} loan_disbursement.notification_status notification status.
	 * @apiSuccess {String} loan_disbursement.uploadStatus upload status.
	 * @apiSuccess {Number} loan_disbursement.loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} loan_disbursement.loan_sanction_id loan sanction id.
	 * @apiSuccess {Object[]} lender_document
	 * @apiSuccess {Number} lender_document.id lender document id.
	 * @apiSuccess {String} lender_document.ref_id reference id.
	 * @apiSuccess {Number} lender_document.user_id user id.
	 * @apiSuccess {String} lender_document.doc_name document name.
	 * @apiSuccess {String} lender_document.uploaded_doc_name uploaded document name.
	 * @apiSuccess {String} lender_document.original_doc_name original document name.
	 * @apiSuccess {String} lender_document.status
	 * @apiSuccess {String} lender_document.ints created date and time.
	 * @apiSuccess {String} lender_document.on_upd updated date and time.
	 * @apiSuccess {Number} lender_document.loan_bank_mapping loan bank mapping id.
	 * @apiSuccess {Number} lender_document.loan loan id.
	 * @apiSuccess {Number} lender_document.doc_type document type.
	 * @apiSuccess {String} lender_document.docTypeDetails document type details.
	 **/
	index: async function (req, res, next) {
		const loan_id = req.param("loan_id"),
			whereCondition = {loan_id: loan_id};
		if (req.user.usertype == "Bank") {
			whereCondition.bank_id = req.user.lender_id;
		}
		loan_details = await LoanrequestRd.findOne({id: loan_id});
		loanProductData = await LoanProductsRd.findOne({id: loan_details.loan_product_id});
		const loanBankMappingDetails = await LoanBankMappingRd.find(whereCondition)
			.populate("loan_disbursement")
			.populate("lender_document", {
				where: {
					status: "active"
				}
			})
			.populate("bank_id")
			.populate("lender_status"),
			logService = await sails.helpers.logtrackservice(
				req,
				"loanbankmappingdetails",
				req.user.id,
				"loan_bank_mapping"
			);
		Promise.all(
			loanBankMappingDetails.map((viewBankMapElement) => {
				viewBankMapElement.lender_document.map((doc_element) => {
					const lenderUserId = doc_element.uploaded_by ? doc_element.uploaded_by : doc_element.user_id;
					Users.findOne({id: lenderUserId}).then((userdata) => {
						doc_element.user_name = userdata.name;
					});
					const docTypeReport = DoctypeRd.findOne({id: doc_element.doc_type}).then((docTyperesult) => {
						if (docTyperesult) {
							doc_element.docTypeDetails = docTyperesult;
						} else {
							doc_element.docTypeDetails = null;
						}
					});
				});
				if (loanProductData && loanProductData.dynamic_forms) {
					if (loanProductData.dynamic_forms.currency == "INR") {
						sails.helpers
							.unitConverter(viewBankMapElement.offer_amnt, viewBankMapElement.offer_amnt_um)
							.then((offer_amount_data) => {
								viewBankMapElement.offer_amnt = offer_amount_data.value;
								viewBankMapElement.offer_amnt_um = offer_amount_data.value_um;
							});
					}
				}
				//business details
				const businessDetails = BusinessRd.findOne({id: viewBankMapElement.business})
					.populate("businesstype")
					.populate("businessindustry")
					.then((result) => {
						if (result) {
							viewBankMapElement.business = result;
						} else {
							viewBankMapElement.business = null;
						}
					});
				return businessDetails;
			})
		).then(() => {
			return res.ok(loanBankMappingDetails);
		});
	},
	/**
   * @api {PSOT} /giveOffer/ Lender give offer
   * @apiName Lender Give offer
   * @apiGroup Loans
   * @apiExample Example usage:
   * curl -i http://localhost:1337/giveOffer
   *{
	"status": "Approve",
	"loan_bank_mapping_id": 904,
	"loan_id": 434,
	"offer_amount": 4,
	"offer_amount_um": "Lakhs",
	"interest_rate": 1,
	"term": 1,
	"emi": 1,
	"processing_fee": 1,
	"disburse_time": 20,
	"remarks": "Welcome to loans"
}
   * @apiParam {String} status This can be Approve or Reject
   * @apiParam {Number} loan_bank_mapping_id Loan bank mapping ID mandatory
   * @apiParam {Number} loan_id Loan ID mandatory
   * @apiParam {Number} offer_amount Loan offer amount,mandatory field for Approve
   * @apiParam {String} offer_amount_um Loan offer amount um it can be Lakhs/Crores,mandatory field for Approve
   * @apiParam {number} interest_rate Rate of interest,mandatory field for Approve
   * @apiParam {number} term Tenure of the loan,mandatory field for Approve
   * @apiParam {number} emi Emi amount for the loan amount,mandatory field for Approve
   * @apiParam {number} processing_fee Processing fee,mandatory field for Approve
   * @apiParam {number} disburse_time Expected time to disburse the offer amount in days,mandatory field for Approve
   * @apiParam {number} offer_validity Offer validity in days
   * @apiParam {String} remarks Remarks of the offer amount,mandatory field for Reject
   * @apiParam {String} doc Offer document fd name
   *
   **/
	giveOffer: async function (req, res, next) {
		const postData = req.allParams();
		let {loan_bank_mapping_id,
			status,
			loan_id,
			offer_amount,
			offer_amnt,
			offer_amount_um,
			offer_amnt_um,
			interest_rate,
			term,
			emi,
			processing_fee,
			remarks,
			disburse_time,
			sanction_additional_data,
			processing_fee_percent,
			margin_percent,
			base_rate,
			type_of_interest,
			type_of_interest_tiered
		} = postData;

		let loanrequestData = await LoanrequestRd.findOne({id: loan_id});
		if (!loanrequestData) return res.ok({status: "nok", message: "No Loan found"});
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

		offer_amount = offer_amount ? offer_amount : offer_amnt;
		offer_amount_um = offer_amount_um ? offer_amount_um : offer_amnt_um;
		lender_offer_date = await sails.helpers.dateTime();
		predefined_status = ["Approve", "Reject"];
		let update_loan_bank_mapping, status3, status4;
		if (status && predefined_status.includes(status) && loan_bank_mapping_id && loan_id) {
			const loan_bank_mapping = await LoanBankMappingRd.findOne({
				id: loan_bank_mapping_id,
				loan_id: loan_id
			});
			nc_status_data = {
				userid: req.user.id,
				loan_status_id: 2,
				loan_sub_status_id: 9,
				type: "comments",
				message: remarks,
				loan_bank_status: 9,
				loan_borrower_status: 2
			};

			if (
				loan_bank_mapping &&
				(loan_bank_mapping.loan_bank_status == 9 || loan_bank_mapping.loan_bank_status == 12) &&
				(loan_bank_mapping.loan_borrower_status == 2 || loan_bank_mapping.loan_borrower_status == 10)
			) {
				let offer_details = {},
					message;
				if (status == "Approve") {
					if (offer_amount && interest_rate && term && emi && processing_fee) {
						if (!offer_amount_um) {
							const offer_amount_data = await sails.helpers.unitConverter(offer_amount);
							offer_amount = offer_amount_data.value;
							offer_amount_um = offer_amount_data.value_um;
						} else {
							offer_amount = offer_amount;
							offer_amount_um = offer_amount_um;
						}
						offer_details = {
							...postData,
							offer_amnt: offer_amount,
							offer_amnt_um: offer_amount_um,
							expected_time_to_disburse: disburse_time,
							upload_doc: postData.doc,
							sanction_additional_data: JSON.stringify(sanction_additional_data),
							lender_offer_date,
							loan_bank_status: 12,
							loan_borrower_status: 3,
							notification_status: "yes"
						};
						if (margin_percent || base_rate || type_of_interest || type_of_interest_tiered) offer_details.offer_additional_data = JSON.stringify({
							margin_percent, base_rate, type_of_interest, type_of_interest_tiered
						})
						nc_status_data.approved_by = req.user.name;
						status3 = 12;
						status4 = 3;
						if (remarks) {
							offer_details.remarks = remarks;
						}
					} else {
						return res.badRequest({
							status: "nok",
							message: sails.config.msgConstants.mandatoryFieldsMissing
						});
					}
					message = sails.config.msgConstants.offerAdded;
				} else {
					offer_details = {
						remarks: remarks,
						loan_bank_status: 14,
						loan_borrower_status: 7,
						notification_status: "yes"
					};
					nc_status_data.rejected_by = req.user.name;
					status3 = 14;
					status4 = 7;
					message = sails.config.msgConstants.offerRejected;
				}
				prev_status = await NcStatusManageRd.findOne({
					status1: 2,
					status2: 9,
					status3: 9,
					status4: 2,
					white_label_id: req.user.loggedInWhiteLabelID
				}).select("name");
				curr_status = await NcStatusManageRd.findOne({
					status1: 2,
					status2: 9,
					status3,
					status4,
					white_label_id: req.user.loggedInWhiteLabelID
				}).select("name");
				report_tat = await sails.helpers.reportTat(
					req.user.id,
					req.user.name,
					loan_id,
					curr_status.name,
					prev_status.name,
					remarks
				);
				let ncStatus_data, remarksData;

				lender_offer_date = moment(lender_offer_date).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
				if (loanrequestData.nc_status_history) {
					const nc_status_parse_data = JSON.parse(loanrequestData.nc_status_history);
					nc_status_parse_data[lender_offer_date] = nc_status_data;
					ncStatus_data = JSON.stringify(nc_status_parse_data);
				} else {
					history = {};
					history[lender_offer_date] = nc_status_data;
					ncStatus_data = JSON.stringify(history);
				}
				if (loanrequestData.remarks) {
					parseData = JSON.parse(loanrequestData.remarks);
					parseData[lender_offer_date] = nc_status_data;
					remarksData = JSON.stringify(parseData);
				} else {
					data1 = {};
					data1[lender_offer_date] = nc_status_data;
					remarksData = JSON.stringify(data1);
				}
				update_loanRequest = await Loanrequest.update({id: loan_id}).set({
					nc_status_history: ncStatus_data,
					remarks: remarksData
				});
				update_loan_bank_mapping = await LoanBankMapping.update({id: loan_bank_mapping_id})
					.set(offer_details)
					.fetch();
				return res.ok({
					status: "ok",
					message: message,
					data: update_loan_bank_mapping
				});
			} else {
				return res.ok({
					status: "nok",
					message: sails.config.msgConstants.unauthorizedAction
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	},
	/**
	 * @api {POST} /changeLenderStatus/ change lender status
	 * @apiName Loan mapping details
	 * @apiGroup Lender
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/changeLenderStatus
	 *
	 * @apiParam {Number} loan_bank_map_id loan bank mapping id.
	 * @apiParam {Number} loan_id loan id.
	 * @apiParam {Number} sanction_type lender status id.
	 * @apiParam {Number} loan_product_id loan product id.
	 * @apiParam {String} lender_loan_id lender reference id.
	 * @apiParam {String} remark remarks.
	 * @apiParam {String} eligibilityAmount
	 *
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Successfully updated.
	 * @apiSuccess {Object} loanbankmapping details of loan bank mapping.
	 * @apiSuccess {Object} loanrequest details of loan request.
	 * @apiSuccess {Object} loanstatuscomments details of loan status comments
	 */
	changeLenderStatus: async function (req, res) {
		const loan_bank_mapping_id = req.body.loan_bank_map_id,
			loan_id = req.body.loan_id,
			lender_status_id = req.body.sanction_type,
			loan_product_id = req.body.loan_product_id,
			lender_ref_id = req.body.lender_loan_id,
			remark = req.body.remark,
			eligibilityAmount = req.body.eligibilityAmount,
			datetime = await sails.helpers.dateTime();
		if (loan_bank_mapping_id && loan_id) {
			const loan_bank_mapping = await LoanBankMappingRd.findOne({
				id: loan_bank_mapping_id,
				loan_id: loan_id
			});
			if (loan_bank_mapping && lender_status_id && loan_product_id && remark) {
				lenderDataUpdate = {
					lender_status: lender_status_id,
					notification_status: "yes"
				};
				const loanstatuswithlender = await LoanStatusWithLenderRd.findOne({id: lender_status_id});
				if (
					lender_status_id == 12 ||
					lender_status_id == 13 ||
					lender_status_id == 15 ||
					lender_status_id == 16 ||
					lender_status_id == 17 ||
					lender_status_id == 18 ||
					lender_status_id == 30
				) {
					const statusobject = JSON.parse(loanstatuswithlender.status_to_update);
					lenderDataUpdate.loan_borrower_status = statusobject.loan_borrower_status;
					lenderDataUpdate.loan_bank_status = statusobject.loan_bank_status;
				}
				if (lender_ref_id) {
					lenderDataUpdate.lender_ref_id = lender_ref_id;
				}
				if (eligibilityAmount) {
					lenderDataUpdate.pre_sanction_json = eligibilityAmount;
				}
				if (lender_status_id == 18) {
					const {sanction_type} = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID}).select("sanction_type");
					if (
						req.body.san_amount &&
						req.body.amount_um &&
						req.body.san_interest &&
						req.body.sanction_process_fee &&
						req.body.san_date
					) {
						sanction_data = {
							loan_id: loan_id,
							loan_bank_mapping: loan_bank_mapping_id,
							userid: req.user["id"],
							san_amount: req.body.san_amount,
							amount_um: req.body.amount_um,
							san_interest: req.body.san_interest,
							sanction_process_fee: req.body.sanction_process_fee,
							san_date: req.body.san_date,
							created_at: datetime,
							sanction_status: sanction_type
							// updated_at: datetime
						};
						const sanctionData = await LoanSanctionRd.findOne({
							loan_bank_mapping: loan_bank_mapping_id,
							loan_id: loan_id
						});
						if (sanctionData) {
							const updateSanction = await LoanSanction.update({id: sanctionData.id})
								.set(sanction_data)
								.fetch();
						} else {
							const sanction = await LoanSanction.create(sanction_data).fetch();
						}
					} else {
						return res.badRequest({
							status: "nok",
							message: sails.config.msgConstants.mandatorySanctionFields
						});
					}
				}
				const loanbankmappingdetails = await LoanBankMapping.update({
					id: loan_bank_mapping_id,
					loan_id: loan_id
				})
					.set(lenderDataUpdate)
					.fetch(),
					loanrequest = await Loanrequest.update({
						id: loan_id
					})
						.set({
							loan_product_id: loan_product_id
						})
						.fetch(),
					loanstatuscomments = await LoanStatusComments.create({
						loan_bank_id: loan_bank_mapping_id,
						user_id: req.user["id"],
						user_type: "All",
						comment_text: remark,
						lender_status_id: lender_status_id,
						created_time: datetime,
						created_timestamp: datetime
					}).fetch(),
					loanBankMapping_details = await LoanBankMappingRd.findOne({
						id: loan_bank_mapping_id,
						loan_id: loan_id
					}).populate("lender_status");
				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.successfulUpdation,
					loanbankmapping: loanBankMapping_details,
					loanrequest: loanrequest,
					loanstatuscomments: loanstatuscomments
				});
			} else {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.missingLoanIdOrDataMismatch
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

	/**
	 * @api {POST} /case-status/ case status
	 * @apiName case status
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/case-status
	 *
	 *
	 * @apiParam {Number} case_id case reference id.
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Case status.
	 * @apiSuccess {String} DES_CODE NC Descrption code.
	 * @apiSuccess {Object} nc_status
	 * @apiSuccess {Number} nc_status.id status id.
	 * @apiSuccess {String} nc_status.name status name.
	 * @apiSuccess {String} remarks remarks.
	 * @apiSuccess {Object[]} document_status
	 * @apiSuccess {Object[]} bank_status
	 * @apiSuccess {Object[]} itr_status
	 */

	case_status: async function (req, res, next) {
		const {case_id} = req.body.allParams;

		if (case_id) {
			const loanRequest = await LoanrequestRd.findOne({loan_ref_id: case_id});
			if (loanRequest) {
				status = {
					white_label_id: loanRequest.white_label_id
				};
				if (loanRequest.loan_status_id) {
					status.status1 = loanRequest.loan_status_id;
				}
				if (loanRequest.loan_sub_status_id) {
					status.status2 = loanRequest.loan_sub_status_id;
				}
				if (
					loanRequest.loan_status_id === 8 &&
					loanRequest.loan_sub_status_id === 12 &&
					loanRequest.remarks_val
				) {
					status.uw_doc_status = loanRequest.remarks_val;
				}
				if (loanRequest.loan_status_id === 2 && loanRequest.loan_sub_status_id === 9) {
					const loanbankmapping = await LoanBankMappingRd.findOne({
						loan_id: loanRequest.id
					});
					if (loanbankmapping) {
						if (loanbankmapping.loan_bank_status) {
							status.status3 = loanbankmapping.loan_bank_status;
						}
						if (loanbankmapping.loan_borrower_status) {
							status.status4 = loanbankmapping.loan_borrower_status;
						}
					} else {
						return res.badRequest({
							status: "nok",
							message: sails.config.msgConstants.caseNotAssigned,
							DES_CODE: "NC10"
						});
					}
				}
				const ncstatus = await NcStatusManageRd.findOne(status).select(["name"]),
					document_status = await LoanDocumentRd.find({
						where: {
							loan: loanRequest.id,
							or: [{status: "rejected"}, {status: "increased_tat"}]
						},
						select: ["doc_name", "status", "document_comments"]
					}),
					bank_status = await LoanFinancialsRd.find({
						where: {loan_id: loanRequest.id, business_id: loanRequest.business_id},
						select: ["bank_id", "account_type", "account_number", "account_limit", "account_holder_name"]
					}).populate("bank_remarks"),
					itr_details = await ITRDetailsRd.find({loan_id: loanRequest.id})
						.select("doc_id")
						.populate("uw_remarks_id");
				if (ncstatus) {
					return res.ok({
						status: "ok",
						message: sails.config.msgConstants.caseStatus,
						DES_CODE: "NC08",
						nc_status: ncstatus,
						remarks: loanRequest.remarks,
						document_status: document_status,
						bank_status: bank_status,
						itr_status: itr_details
					});
				} else {
					return res.badRequest({
						status: "nok",
						message: sails.config.msgConstants.statusError,
						DES_CODE: "NC00"
					});
				}
			} else {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.invalidCaseId,
					DES_CODE: "NC06"
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.mandatoryFieldsMissing,
				DES_CODE: "NC00"
			});
		}
	},

	/**
	 * @description :: case creation details
	 * @api {post} /casecreation_detail case creation details
	 * @apiName case creation details
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/casecreation_detail
	  *  business_details : {
			"business_name":"KVB_TEST",
			"business_type": "1"
			}
	  * loan_details : {
			"loan_asset_type_id":  1,
			"loan_product_id": "24",
			"loan_request_type": "1",
				"loan_type_id": 1,
			  "loan_usage_type_id": 1,
			"white_label_id": "25a75ca2d04cc267caf1f1bebef52206"
			 }
	 *  bank_details : [
		{
			"account_number":"BG12327327527612",
			"account_type": "CC/OD",
			"bank_name":26,
			"cc_limit":56,
			"account_holder_name":"bhargav",
			"start_date":"2019-02-23",
			"end_date":"2019-12-24"
		},
		{
			"account_number":"CG1245327527612",
			"account_type":"Saving",
			"bank_name":27,
			"account_holder_name":"bhargav",
			"start_date":"2019-02-23",
			"end_date":"2019-12-24"
		}
		]
	 *	itr_details : {
			  "itr_name":"Anjana",
			"filling_date":"2019-12-19"
		}
	 * document_details : {
			"doc_type_id":73
	 }
	 * document:"img.jpeg"
	 * @apiParam {Object} business_details

	 * @apiParam {String} business_details.business_name business name.
	 * @apiParam {Number} business_details.business_type business type.
	 * @apiParam {String} business_details.business_email business email(non mandatory).
	 * @apiParam {Number} business_details.contact contact(non mandatory).
	 * @apiParam {Object} loan_details
	 * @apiParam {Number} loan_details.loan_asset_type_id loan asset type id.
	 * @apiParam {String} loan_details.loan_product_id loan product id.
	 * @apiParam {String} loan_details.loan_request_type loan request type.
	 * @apiParam {Number} loan_details.loan_type_id loan type id.
	 * @apiParam {Number} loan_details.loan_usage_type_id loan usage type id.
	 * @apiParam {String} loan_details.white_label_id white label id(encrypted white_label_id).
	 * @apiParam {Object[]} bank_details
	 * @apiParam {String} bank_details.account_number account number.
	 * @apiParam {String} bank_details.account_type account_type("Current","Savings", "CC/OD").
	 * @apiParam {Number} bank_details.bank_name bank name id.
	 * @apiParam {String} bank_details.account_holder_name account_holder_name.
	 * @apiParam {String} bank_details.cc_limit account limit.
	 * @apiParam {String} bank_details.start_date start date(non mandatory).
	 * @apiParam {String} bank_details.end_date end date(non mandatory).
	 * @apiParam {Object} document_details
	 * @apiParam {Number} document_details.doc_type_id document type id.
	 * @apiParam {File} document document name.
	 * @apiParam {Object} itr_details
	 * @apiParam {String} itr_details.itr_name ITR name.
	 * @apiParam {String} itr_details.filling_date ITR filling date.

	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message "case created successfuly.
	 * @apiSuccess {String} case_id created case reference id and case id.
	 *
	 */

	case_creation_details: async function (req, res) {
		const post_data = req.body.allParams,
			business_details = JSON.parse(post_data.business_details),
			loan_details = JSON.parse(post_data.loan_details),
			bank_details = JSON.parse(post_data.bank_details),
			document_details = JSON.parse(post_data.document_details),
			itr_details = JSON.parse(post_data.itr_details),
			userid = req.user.id,
			datetime = await sails.helpers.dateTime();
		if (loan_details.loan_product_id && loan_details.white_label_id && business_details.business_type) {
			const white_label_id = await sails.helpers.whitelabelDecryption(loan_details.white_label_id);
			if (white_label_id !== "error" && white_label_id) {
				const businesspancardnumber =
					business_details.businesspancardnumber == undefined ||
						business_details.businesspancardnumber == "" ||
						business_details.businesspancardnumber == null
						? "NAMAS9948K"
						: business_details.businesspancardnumber,
					emp_count = business_details.empcount == undefined ? 1 : business_details.empcount,
					first_name =
						business_details.first_name == undefined || business_details.first_name == ""
							? ""
							: business_details.first_name,
					last_name =
						business_details.last_name == undefined || business_details.last_name == ""
							? ""
							: business_details.last_name,
					contact =
						business_details.contact == undefined || business_details.contact == ""
							? ""
							: business_details.contact,
					business_email =
						business_details.business_email == undefined || business_details.business_email == ""
							? req.user.email
							: business_details.business_email,
					business = business_details.business_type;
				let business_creation, loan_creation, loan_create_data;
				business_data = {
					businessname: business_details.business_name,
					userid: userid,
					first_name: first_name,
					last_name: last_name,
					businessstartdate: datetime,
					business_email: business_email,
					contactno: contact,
					businesstype: business,
					businesspancardnumber: businesspancardnumber,
					white_label_id: white_label_id,
					empcount: emp_count,
					businessindustry: "20",
					ints: datetime,
					ITR_name: itr_details.itr_name,
					filling_date: itr_details.filling_date
				};
				const product = await LoanProductsRd.findOne({
					id: loan_details.loan_product_id,
					business_type_id: {contains: business}
				});
				if (product) {
					const businessdetails = await BusinessRd.findOne({
						businessname: business_details.business_name,
						business_email: business_email,
						businesstype: business
					});
					if (businessdetails) {
						const loandetails = await LoanrequestRd.findOne({business_id: businessdetails.id});
						return res.badRequest({
							status: "nok",
							case_id: loandetails.loan_ref_id + "-" + loandetails.id,
							message: sails.config.msgConstants.caseCreatedAlready,
							DES_CODE: "NC00"
						});
					} else {
						if (
							business_details.business_name &&
							userid &&
							white_label_id &&
							loan_details.loan_request_type &&
							loan_details.loan_asset_type_id &&
							loan_details.loan_usage_type_id &&
							loan_details.loan_type_id
						) {
							if (
								itr_details.itr_name &&
								itr_details.filling_date &&
								document_details.doc_type_id &&
								bank_details.length > 0
							) {
								const document = req.file("document");
								if (document.fieldName == "NOOP_document") {
									return res.badRequest({
										status: "nok",
										message: sails.config.msgConstants.selectDocument
									});
								}
								business_creation = await Business.create(business_data).fetch();
								const loan_summary =
									product.product +
									" - requested to create case for business" +
									" " +
									business_details.business_name +
									" for " +
									req.user.usertype;
								loan_data = {
									loan_request_type: loan_details.loan_request_type,
									business_id: business_creation.id,
									loan_ref_id: await sails.helpers.commonHelper(),
									loan_asset_type: loan_details.loan_asset_type_id,
									loan_usage_type: loan_details.loan_usage_type_id,
									loan_type_id: loan_details.loan_type_id,
									loan_product_id: loan_details.loan_product_id,
									white_label_id: white_label_id,
									createdUserId: userid,
									RequestDate: datetime,
									loan_summary: loan_summary,
									modified_on: datetime
								};

								loan_create_data = await Loanrequest.create(loan_data).fetch();
								loan_creation = loan_create_data.loan_ref_id + "-" + loan_create_data.id;

								await sails.helpers.greenChannelCondition(loan_create_data.id, req.user.loggedInWhiteLabelID)

								const bank_details_array = [];
								bank_details.forEach((element) => {
									if (
										element.account_number &&
										element.account_type &&
										element.bank_name &&
										element.account_holder_name
									) {
										bank_data = {
											loan_id: loan_create_data.id,
											business_id: loan_create_data.business_id,
											fin_type: "bank account",
											bank_id: element.bank_name,
											account_type: element.account_type,
											account_number: element.account_number,
											account_holder_name: element.account_holder_name,
											outstanding_start_date: element.start_date,
											outstanding_end_date: element.end_date,
											ints: datetime
										};

										if (element.account_type === "CC/OD") {
											if (element.cc_limit) {
												bank_data.account_limit = element.cc_limit;
											} else {
												return res.badRequest({
													status: "nok",
													message: sails.config.msgConstants.mandatoryFieldsMissing,
													DES_CODE: "NC00"
												});
											}
										}
										bank_details_array.push(bank_data);
									} else {
										return res.badRequest({
											status: "nok",
											message: sails.config.msgConstants.bankDetailsMissing,
											DES_CODE: "NC00"
										});
									}
								});
								const add_bank = await LoanFinancials.createEach(bank_details_array).fetch(),
									whitelabelsolution = await WhiteLabelSolutionRd.find({
										id: white_label_id
									});
								let bucket = whitelabelsolution[0]["s3_name"];
								const s3_region = whitelabelsolution[0]["s3_region"];
								bucket = bucket + "/users_" + userid;
								const uploadFile = await sails.helpers.s3Upload(document, bucket, s3_region),
									doc_upload = await LoanDocument.create({
										loan: loan_create_data.id,
										business_id: loan_create_data.business_id,
										user_id: req.user.id,
										doctype: document_details.doc_type_id,
										doc_name: uploadFile[0].fd,
										uploaded_doc_name: uploadFile[0].filename,
										size: uploadFile[0].size,
										ints: datetime
									}).fetch(),
									doc_details = await DoctypeRd.findOne({
										id: doc_upload.doctype,
										document_subtype: "3"
									});
								if (doc_details && business_creation.ITR_name && business_creation.filling_date) {
									const itr_craeted_data = await ITRDetails.create({
										doc_id: doc_details.id,
										created_By: req.user.id,
										created_On: await sails.helpers.dateTime()
									}).fetch();
								}

								return res.ok({
									status: "ok",
									message: sails.config.msgConstants.caseCreated,
									DES_CODE: "NC08",
									case_id: loan_creation
								});
							} else {
								return res.badRequest({
									status: "nok",
									message: sails.config.msgConstants.documentOrITRDetailsMissing,
									DES_CODE: "NC00"
								});
							}
						} else {
							return res.badRequest({
								status: "nok",
								message: sails.config.msgConstants.businessOrLoanDetailsMissing,
								DES_CODE: "NC00"
							});
						}
					}
				} else {
					return res.badRequest({
						status: "nok",
						message: sails.config.msgConstants.productNotMapped,
						DES_CODE: "NC00"
					});
				}
			} else {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.invalidEncryptedId,
					DES_CODE: "NC09"
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.mandatoryFieldsMissing,
				DES_CODE: "NC00"
			});
		}
	},

	whiteLabel_remarkslist: async function (req, res) {
		let {not_qualified_remarks, rejected_remarks, sanction_but_undisbured, white_label_id} = req.allParams();
		white_label_id = white_label_id || req.user.loggedInWhiteLabelID;
		let response = {};
		if (!not_qualified_remarks && !rejected_remarks && !sanction_but_undisbured) {
			return res.ok({
				status: "nok",
				message: "Invalid input"
			});
		}

		if (not_qualified_remarks) {
			const not_qualified_records = await RemarksConfigRd.find({
				white_label_id: {contains: white_label_id},
				config_type: sails.config.configType
			}).select(["id", "name"]);
			response.not_qualified_remarks = not_qualified_records;
		}

		if (rejected_remarks || sanction_but_undisbured) {
			let condition = {};
			if (sanction_but_undisbured) {condition = {id: 12};}
			else {condition = {id: 13};}
			const rejected_records = await LoanStatusWithLenderRd.findOne(condition).select("lender_remarks"),
				lender_remarks = JSON.parse(rejected_records.lender_remarks);
			response.sanction_undisbured_remarks = sanction_but_undisbured ? lender_remarks : {};
			response.rejected_remarks = rejected_remarks ? lender_remarks.data.reasons_for_rejection : {};
		}

		return res.ok({
			status: "ok",
			message: "success",
			data: response
		});

	},

	reject_notQualify_loan: async function (req, res) {
		let {loan_id, comments, status, loan_bank_mapping_id, reason} = req.allParams();
		params = {loan_id, comments, status};
		fields = ["loan_id", "comments", "status"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id || !comments || !status) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let update_loan_req_data_status, update_loan_bank_mapping_data_status;
		let datetime = await sails.helpers.dateTime();
		loan_req_data = await LoanrequestRd.findOne({id: loan_id});
		if (!loan_req_data) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		const nc_status_manage_data = await NcStatusManageRd.findOne({
			name: status,
			white_label_id: loan_req_data.white_label_id
		});
		if (!nc_status_manage_data) {
			return res.badRequest({
				status: "nok",
				message: "Invalid status"
			});
		}
		let reason_name = [],
			reason_id = [];
		if (reason.length > 0) {
			_.each(reason, (value) => {
				reason_id.push(value.id);
				reason_name.push(value.name);
			});
		}

		history = {};
		obj = {
			userid: req.user.id,
			loan_status_id: loan_req_data.loan_status_id,
			loan_sub_status_id: loan_req_data.loan_sub_status_id,
			// remarks_val : loan_req_data.remarks_val,
			type: "comments",
			message: comments,
			reason: reason_name
		};
		if (loan_req_data.loan_status_id == 8 && loan_req_data.loan_sub_status_id == 12) {
			obj.remarks_val = loan_req_data.remarks_val;
		}
		if (loan_bank_mapping_id && nc_status_manage_data.status3 && nc_status_manage_data.status4) {
			const loan_bank_mapping_data = await LoanBankMappingRd.findOne({
				id: loan_bank_mapping_id,
				loan_id: loan_id
			});
			if (!loan_bank_mapping_data) {
				return res.badRequest({
					status: "ok",
					message: "No data found OR Invalid loan_bank_mapping_id"
				});
			}
			obj.rejected_by = req.user.name;
			obj.loan_bank_status = loan_bank_mapping_data.loan_bank_status;
			obj.loan_borrower_status = loan_bank_mapping_data.loan_borrower_status;

			// if (obj.loan_bank_status && obj.loan_borrower_status) {
			// 	const loanStatusComments_data = await LoanStatusComments.create({
			// 		loan_bank_id: loan_bank_mapping_data.id,
			// 		user_id: req.user.id,
			// 		user_type: "Lender",
			// 		comment_text: comments,
			// 		lender_status_id: 13,
			// 		created_time: await sails.helpers.dateTime(),
			// 		created_timestamp: await sails.helpers.dateTime(),
			// 		lender_sub_status_id: JSON.stringify(reason_id)
			// 	}).fetch();
			// }
			update_loan_bank_mapping_data_status = await LoanBankMapping.update({
				id: loan_bank_mapping_id,
				loan_id: loan_id
			})
				.set({
					loan_bank_status: nc_status_manage_data.status3,
					loan_borrower_status: nc_status_manage_data.status4,
					notification_status: "yes"
				})
				.fetch();
		} else {
			obj.not_qualified_by = req.user.name;
		}
		let nc_status_history_data, remarks_data;
		report_tat = await sails.helpers.reportTat(req.user.id, req.user.name, loan_id, status, "", comments);
		datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
		if (loan_req_data.nc_status_history) {
			parseData = JSON.parse(loan_req_data.nc_status_history);
			parseData[datetime] = obj;
			nc_status_history_data = JSON.stringify(parseData);
		} else {
			history[datetime] = obj;
			nc_status_history_data = JSON.stringify(history);
		}
		if (loan_req_data.remarks) {
			parseData = JSON.parse(loan_req_data.remarks);
			parseData[datetime] = obj;
			remarks_data = JSON.stringify(parseData);
		} else {
			history[datetime] = obj;
			remarks_data = JSON.stringify(history);
		}
		if (nc_status_manage_data.status1 && nc_status_manage_data.status2) {
			update_loan_req_data_status = await Loanrequest.update({id: loan_id})
				.set({
					loan_status_id: nc_status_manage_data.status1,
					loan_sub_status_id: nc_status_manage_data.status2,
					remarks: remarks_data,
					nc_status_history: nc_status_history_data
				})
				.fetch();
		}
		if (
			(update_loan_req_data_status && update_loan_req_data_status.length > 0) ||
			(update_loan_bank_mapping_data_status && update_loan_bank_mapping_data_status.length > 0)
		) {
			return res.ok({
				status: "ok",
				message: `loan is moved to ${status} status`
			});
		}
	}
};
