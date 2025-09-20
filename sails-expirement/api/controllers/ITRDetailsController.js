/**
 * ITRDetailsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
/**
   * @description :: case creation
   * @api {post} /itr_details ITR Details
   * @apiName ITR Details
   * @apiGroup Case
   * @apiExample Example usage:
   * curl -i localhost:1337/itr_details
   *

   * @apiParam {String} case_id
   * @apiParam {String} itr_holder_name
   * @apiParam {String} financial_year
   * @apiParam {String} pan_number
   * @apiParam {String} filling_date
   * @apiParam {String} itr_entity_type
   * @apiParam {String} original_revised (Optional)

   * @apiDescription
   * filling date  format should be "2019-12-19"
   * financial_year format should be "2019-2020"
   *
   * @apiSuccess {String} status ok.
   * @apiSuccess {String} message Data inserted successfully.
   * @apiSuccess {Object} data
   * @apiSuccess {Number} data.id
   * @apiSuccess {Number} data.entity_id
   * @apiSuccess {String} data.entity_type
   * @apiSuccess {Number} data.annual_pat
   * @apiSuccess {Number} data.annual_turnover
   * @apiSuccess {String} data.financial_year
   * @apiSuccess {String} data.filling_date
   * @apiSuccess {String} data.original_revised
   * @apiSuccess {String} data.created_On
   *
   */
const reqParams = require("../helpers/req-params");
module.exports = {
	itr_details: async function (req, res) {
		const {
			case_id,
			itr_holder_name,
			financial_year,
			pan_number,
			filling_date,
			original_revised,
			itr_entity_type: entity_type
		} = req.body.allParams;

		const params = req.allParams();
		const fields = ["case_id", "itr_holder_name", "financial_year", "pan_number", "filling_date", "entity_type"];
		const missing = await reqParams.fn(params, fields);

		if (!case_id || !itr_holder_name || !financial_year || !pan_number || !filling_date || !entity_type) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const pancard = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
		if (pancard.test(pan_number) == false) {
			return res.badRequest(sails.config.res.invalidPan);
		}

		new Promise(async (resolve, reject) => {
			const loan_details = (await LoanrequestRd.find({loan_ref_id: case_id}).limit(1))[0];

			if (!loan_details) {
				reject(res.badRequest(sails.config.res.invalidCaseOrData));
			}

			const datetime = await sails.helpers.dateTime(),
				loandoc_details = await LoanDocumentRd.find({
					loan: loan_details.id,
					business_id: loan_details.business_id
				}).populate("doctype");
			let document_status,
				doc_obj = {};
			if (loandoc_details.length > 0) {
				loandoc_details.forEach(async (element) => {
					if (
						element.doctype.status == sails.config.doc_type.status &&
						element.doctype.document_subtype == sails.config.doc_type.doc_sub_type
					) {
						doc_obj = element;
					}
				});

				if (Object.keys(doc_obj).length == 0) {
					document_status = sails.config.msgConstants.itrDocumentNotUploaded;
				}
			} else {
				document_status = sails.config.msgConstants.noDocumentUploaded;
			}
			data = {
				loan_id: loan_details.id,
				pan_number,
				financial_year,
				filling_date,
				original_revised,
				created_On: datetime
			};

			let business_update,
				director_data,
				itr_data = {};
			const itr_details = await BusinessEntityFinancialRd.findOne({
				loan_id: loan_details.id,
				pan_number,
				financial_year,
				entity_type
			});

			if (itr_details) {
				itr_data = _.pick(
					itr_details,
					"pan_number",
					"entity_type",
					"financial_year",
					"filling_date",
					"original_revised"
				);
				reject(res.badRequest(Object.assign(sails.config.res.dataExists, {data: itr_data})));
			} else {
				let update_data_require = 0;
				if (entity_type == sails.config.entity_type.type1) {
					business_update = await Business.update({
						id: loan_details.business_id
					})
						.set({
							first_name: itr_holder_name,
							businesspancardnumber: pan_number
						})
						.fetch();
					data.entity_id = loan_details.business_id;
					data.entity_type = sails.config.entity_type.type1;
					update_data_require = 1;
				}
				if (entity_type == sails.config.entity_type.type2) {
					director_data = await Director.create({
						business: loan_details.business_id,
						dfirstname: itr_holder_name,
						dpancard: pan_number,
						ints: datetime
					}).fetch();
					data.entity_id = director_data.id;
					data.entity_type = sails.config.entity_type.type2;
					update_data_require = 1;
				}

				if (update_data_require != 1 || update_data_require != "1") {
					reject(res.badRequest(sails.config.res.incorrectType));
				}

				const businesentity_data = await BusinessEntityFinancial.create(data).fetch();

				itr_data = _.pick(
					businesentity_data,
					"pan_number",
					"entity_type",
					"financial_year",
					"filling_date",
					"original_revised"
				);

				resolve(
					res.ok(
						Object.assign(sails.config.successRes.dataInserted, {
							document_status,
							data: itr_data
						})
					)
				);
			}
		}).catch((error) => { });
	},
	/**
	 * @description :: nc status
	 * @api {get} /case_nc_status NC status
	 * @apiName NC status
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/case_nc_status
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {Object[]} data
	 * @apiSuccess {String} data.id name of the ITR.
	 * @apiSuccess {String} data.name ITR filling date.
	 * @apiSuccess {String} data.status1
	 * @apiSuccess {String} data.status2
	 * @apiSuccess {String} data.status3
	 * @apiSuccess {String} data.status4
	 * @apiSuccess {String} data.status5
	 * @apiSuccess {String} data.status6
	 * @apiSuccess {String} data.white_label_id
	 * @apiSuccess {String} data.parent_flag
	 * @apiSuccess {String} data.parent_id
	 * @apiSuccess {String} data.status
	 * @apiSuccess {String} data.execulded_users
	 * @apiSuccess {String} data.sort_by_id
	 * @apiSuccess {String} data.exclude_user_ncdoc
	 * @apiSuccess {String} data.caption
	 * @apiSuccess {String} data.lender_status
	 * @apiSuccess {String} data.uw_doc_status
	 *
	 */
	nc_status: async function (req, res) {
		const white_label_id = req.user.loggedInWhiteLabelID;

		NcStatusManageRd.find({white_label_id})
			.then((ncStatus) => {
				if (ncStatus.length === 0) {
					throw new Error("NCStatusNotSet");
				}

				return res.ok({
					status: "ok",
					data: ncStatus
				});
			})
			.catch((err) => {
				switch (err.message) {
					case "NCStatusNotSet":
						return res.badRequest(sails.config.res.NCStatusNotSet);
					default:
						throw err;
				}
			});
	},
	/**
	 * @description :: reassign_to_nc
	 * @api {post} /case_reassign_to_nc Case reassign to nc
	 * @apiName Case reassign to nc
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/case_reassign_to_nc
	 *
	 * @apiParam {String} case_id case id.
	 * @apiParam {String} comments reassign comments.
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Successfully case is reassign to nc
	 * @apiSuccess {Object} data
	 * @apiSuccess {Object[]} data.loan_details loan details.
	 * @apiSuccess {Object[]} data.loanbankmapping_details loan bank mapping details.
	 *
	 */
	reassign_to_nc: async function (req, res) {
		const {case_id, comments} = req.body.allParams;
		let history = {};

		if (!case_id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		LoanrequestRd.findOne({loan_ref_id: case_id})
			.then((loanrequest) => {
				if (!loanrequest) {
					throw new Error("invalidCaseOrData");
				}

				return LoanBankMappingRd.findOne({
					loan_id: loanrequest.id,
					business: loanrequest.business_id
				}).then(async (loanbankmap) => {
					if (
						loanbankmap &&
						loanrequest.loan_status_id === sails.config.nc_status.status1 &&
						loanrequest.loan_sub_status_id === sails.config.nc_status.status3 &&
						loanbankmap.loan_bank_status === sails.config.nc_status.status3 &&
						loanbankmap.loan_borrower_status === sails.config.nc_status.status1
					) {
						if (loanbankmap.reassign_nc_comments) {
							const previous_history = loanbankmap.reassign_nc_comments;
							history = JSON.parse(previous_history);
						}
						reassign_nc_comments = {
							loan_bank_status: loanbankmap.loan_bank_status,
							loan_borrower_status: loanbankmap.loan_borrower_status,
							reassigned_user: req.user.id,
							comments
						};
						const datetime = await sails.helpers.dateTime();
						history[datetime] = reassign_nc_comments;
						const update_loanrequest = await Loanrequest.update({
							loan_ref_id: case_id
						})
							.set({
								loan_status_id: sails.config.nc_status.status1,
								loan_sub_status_id: sails.config.nc_status.status3
							})
							.fetch(),
							update_loanbank = await LoanBankMapping.update({
								loan_id: loanrequest.id,
								business: loanrequest.business_id
							})
								.set({
									loan_bank_status: sails.config.nc_status.status5,
									loan_borrower_status: sails.config.nc_status.status4,
									reassign_nc_comments: JSON.stringify(history),
									notification_status: "yes"
								})
								.fetch();

						if (update_loanbank.length > 0) {
							updated_data = {
								case_ref_id: update_loanrequest[0].loan_ref_id
							};
							sails.config.successRes.caseReassignToNC.data = updated_data;
							if (loanrequest.white_label_id == sails.config.fedfina_whitelabel_id){
								return res.ok ({ecryptesResponse : await sails.helpers.crypto.with({
									action: "aesCbc256Encrypt",
									data : sails.config.successRes.caseReassignToNC
								})});
							}
							else return res.ok(sails.config.successRes.caseReassignToNC);
						}
					} else {
						throw new Error("notAllowedCaseNotAssignToLender");
					}
				});
			})
			.catch((err) => {
				switch (err.message) {
					case "notAllowedCaseNotAssignToLender":
						return res.badRequest(sails.config.res.notAllowedCaseNotAssignToLender);
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);

					default:
						throw err;
				}
			});
	},
	/**
	 * @description :: case moved to previous status
	 * @api {post} /case_move_to_previous_status Case Moved from query raised by nc status to previous status
	 * @apiName Case moved to previous status
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/case_move_to_previous_status
	 *
	 * @apiParam {String} case_id case id (mandatory).
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Successfully Case is moved from query raised by nc status to previous status
	 * @apiSuccess {String} DES_CODE NC08
	 *
	 */
	move_to_previous_state: async function (req, res) {
		const {case_id, comment} = req.body.allParams;

		const params = req.allParams();
		const fields = ["case_id"];
		const missing = await reqParams.fn(params, fields);

		if (!case_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let history = {};
		LoanrequestRd.findOne({
			loan_ref_id: case_id
		})
			.then(async (loanData) => {
				if (!loanData) {
					throw new Error("invalidCaseOrData");
				}
				const nc_status = sails.config.nc_status;
				if (
					loanData.loan_status_id === nc_status.status2 &&
					loanData.loan_sub_status_id === nc_status.status6 &&
					loanData.remarks_val
				) {
					previous_status = await NcStatusManageRd.find({
						status1: loanData.loan_status_id,
						status2: loanData.loan_sub_status_id,
						uw_doc_status: loanData.remarks_val
					}).select("name");
					const history_data = Object.values(JSON.parse(loanData.remark_history)),
						remarksHistoryData = JSON.parse(loanData.remark_history);

					if (loanData.nc_status_history) {
						history = JSON.parse(loanData.nc_status_history);
					}
					status1 = 2;
					status2 = 8;
					ncStatus_history = {
						loan_status_id: status1,
						loan_sub_status_id: status2,
						userid: req.user.id
					};

					remarksHistory = {
						loan_status_id: loanData.loan_status_id,
						loan_sub_status_id: loanData.loan_sub_status_id,
						remarks: loanData.remarks,
						status_changed_by: req.user.id
					};
					const datetime = await sails.helpers.dateTime();
					current_status = await NcStatusManageRd.find({status1: status1, status2: status2}).select("name");
					report_tat = await sails.helpers.reportTat(req.user.id, req.user.name, loanData.id, current_status[0].name, previous_status[0].name, comment);
					history[datetime] = ncStatus_history;
					remarksHistoryData[datetime] = remarksHistory;
					const update_loanrequest = await Loanrequest.update({
						loan_ref_id: case_id
					})
						.set({
							loan_status_id: status1,
							loan_sub_status_id: status2,
							remark_history: JSON.stringify(remarksHistoryData),
							nc_status_history: JSON.stringify(history)
						})
						.fetch();
					sails.config.successRes.caseMovedToPreviousState.data = update_loanrequest;
					return res.ok(sails.config.successRes.caseMovedToPreviousState);
				} else {
					throw new Error("notAllowedToMovedCase");
				}
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);
					case "notAllowedToMovedCase":
						return res.badRequest(sails.config.res.notAllowedToMovedCase);
					default:
						throw err;
				}
			});
	},

	/**
	 * @description :: case status
	 * @api {post} /caseStatus
	 * @apiName Case status
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/caseStatus
	 *
	 * @apiParam {String} case_id case id (mandatory).
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message
	 *
	 */

	caseStatus: async function (req, res) {
		const {case_id} = req.body.allParams;

		const params = req.allParams();
		const fields = ["case_id"];
		const missing = await reqParams.fn(params, fields);

		if (!case_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanRequest = await LoanrequestRd.findOne({loan_ref_id: case_id});
		if (!loanRequest) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		status = {
			white_label_id: loanRequest.white_label_id
		};
		if (loanRequest.loan_status_id) {
			status.status1 = loanRequest.loan_status_id;
		}
		if (loanRequest.loan_sub_status_id) {
			status.status2 = loanRequest.loan_sub_status_id;
		}
		if (loanRequest.loan_status_id === 8 && loanRequest.loan_sub_status_id === 12 && loanRequest.remarks_val) {
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
			}
		}
		const ncstatus = await NcStatusManageRd.findOne(status).select(["name"]);
		if (!ncstatus) {
			return res.badRequest(sails.config.res.errorInStatus);
		}
		sails.config.successRes.dataUpdated.message = "Case status";
		sails.config.successRes.dataUpdated.nc_status = ncstatus;
		return res.ok(sails.config.successRes.dataUpdated);
	},

	/**
	 * @description :: Case Cancellation Api
	 * @api {post} /caseCancellationApi
	 * @apiName Case status
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/caseCancellationApi
	 *
	 * @apiParam {String} case_id
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message caseCancel
	 *
	 */

	caseCancellationApi: async function (req, res) {
		const {case_id} = req.body.allParams,
			ncStatus = await sails.config.nc_status;
		if (!case_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanRequest = await LoanrequestRd.findOne({loan_ref_id: case_id});
		if (!loanRequest) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		if (
			loanRequest.loan_status_id === ncStatus.status9 ||
			(loanRequest.loan_status_id === ncStatus.status1 && loanRequest.loan_sub_status_id === ncStatus.status2)
		) {
			data = {
				loan_status_id: 7,
				loan_sub_status_id: 13
			};

			const updateLoanRequest = await Loanrequest.update({loan_ref_id: case_id}).set(data).fetch();
			if (updateLoanRequest) {
				sails.config.successRes.caseCancel.data = {case_ref_id: updateLoanRequest[0].loan_ref_id};
				return res.ok(sails.config.successRes.caseCancel);
			} else {
				sails.config.res.notAllowedToCaseCancel.message = "Error in cancelling the case";
				return res.badRequest(sails.config.res.notAllowedToCaseCancel);
			}
		} else {
			return res.badRequest(sails.config.res.notAllowedToCaseCancel);
		}
	},

	/**
	 * @description :: Case Cancellation Api
	 * @api {post} /requestCallback
	 * @apiName Request Callback
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/requestCallback
	 *
	 * @apiParam {String} case_id
	 * @apiParam {String} message
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message requestCallback
	 *
	 */

	requestCallback: async function (req, res) {
		const {case_id, message} = req.allParamsData;

		const params = req.allParams();
		const fields = ["case_id"];
		const missing = await reqParams.fn(params, fields);

		if (!case_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanRequest = await LoanrequestRd.findOne({loan_ref_id: case_id});
		if (!loanRequest) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		const requestUrl = sails.config.tricolor_url.callbackRequest_uatUrl,
			method = "POST",
			header = {
				"Content-Type": "application/json"
			};
		bodyData = {
			loan_ref_id: case_id,
			client_id: loanRequest.white_label_id
		};
		const body = JSON.stringify(bodyData),
			requestCallback = await sails.helpers.sailstrigger(requestUrl, body, header, method),
			jsonData = JSON.parse(requestCallback);
		if (jsonData.status == 200) {
			sails.config.successRes.requestCallback.data = {
				case_ref_id: loanRequest.loan_ref_id
			};
			return res.ok(sails.config.successRes.requestCallback);
		} else {
			return res.badRequest(sails.config.res.errorRequestCallback);
		}
	}
};
