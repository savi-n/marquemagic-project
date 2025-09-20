/**
 * Loanrequest
 *
 * @description :: Server-side logic for managing Loanrequest
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {GET} /Loanrequest/ Loan Request
 * @apiName loan Request
 * @apiGroup Loans
 * @apiExample Example usage:
 * curl -i localhost:1337/Loanrequest/
 * @apiSuccess {Object[]} loan_document
 * @apiSuccess {Number} loan_document.id id.
 * @apiSuccess {Number} loan_document.business_id business id.
 * @apiSuccess {Number} loan_document.user_id user id.
 * @apiSuccess {Number} loan_document.doc_type_id document type id.
 * @apiSuccess {String} loan_document.doc_name document name.
 * @apiSuccess {String} loan_document.uploaded_doc_name uploaded document name.
 * @apiSuccess {String} loan_document.original_doc_name original document name
 * @apiSuccess {String} loan_document.status
 * @apiSuccess {String} loan_document.osv_doc yes/no.
 * @apiSuccess {String} loan_document.ints
 * @apiSuccess {String} loan_document.on_upd
 * @apiSuccess {String} loan_document.no_of_pages number of pages.
 * @apiSuccess {String} loan_document.json_extraction json extraction.
 * @apiSuccess {String} loan_document.size size.
 * @apiSuccess {String} loan_document.document_comments document comments.
 * @apiSuccess {String} loan_document.image_quality_json_file
 * @apiSuccess {Number} loan_document.mis_group_id
 * @apiSuccess {String} loan_document.upload_method_type upload method type.
 * @apiSuccess {Number} loan_document.loan
 * @apiSuccess {Number} id id.
 * @apiSuccess {Number} loan_request_type loan request type.
 * @apiSuccess {String} loan_ref_id loan reference id.
 * @apiSuccess {Number} loan_amount loan amount.
 * @apiSuccess {String} loan_amount_um crores/lakhs.
 * @apiSuccess {Number} applied_tenure
 * @apiSuccess {Number} assets_value assets value.
 * @apiSuccess {String} assets_value_um crores/lakhs.
 * @apiSuccess {Number} annual_revenue
 * @apiSuccess {String} revenue_um crores/lakhs.
 * @apiSuccess {Number} annual_op_expense
 * @apiSuccess {String} op_expense_um crores/lakhs.
 * @apiSuccess {String} cur_monthly_emi monthly emi.
 * @apiSuccess {Number} loan_asset_type_id loan asset type id.
 * @apiSuccess {Number} loan_usage_type_id loan usage type id.
 * @apiSuccess {String} loan_type_id loan type id.
 * @apiSuccess {Number} loan_rating_id loan rating id.
 * @apiSuccess {Number} loan_status_id loan status id.
 * @apiSuccess {Number} loan_sub_status_id
 * @apiSuccess {String} remarks remarks.
 * @apiSuccess {Number} assigned_uw
 * @apiSuccess {String} assigned_date assigned date.
 * @apiSuccess {String} osv_doc
 * @apiSuccess {String} modified_on modified date.
 * @apiSuccess {String} RequestDate Request Date.
 * @apiSuccess {String} loan_summary loan summary.
 * @apiSuccess {Number} loan_product_id loan product id.
 * @apiSuccess {Number} notification notification.
 * @apiSuccess {String} white_label_id white label id.
 * @apiSuccess {Number} sales_id sales id.
 * @apiSuccess {String} loan_originator
 * @apiSuccess {String} doc_collector
 * @apiSuccess {String} unsecured_type
 * @apiSuccess {String} remark_history remark history.
 * @apiSuccess {String} application_ref
 * @apiSuccess {String} document_upload Done/Pending.
 * @apiSuccess {Number} business_id business id.
 * @apiSuccess {String} createdUserId created UserId
 * @apiSuccess {Object} loan_orginitaor
 * @apiSuccess {Number} loan_orginitaor.id user ID.
 * @apiSuccess {String} loan_orginitaor.name name of the user.
 * @apiSuccess {String} loan_orginitaor.email user email address.
 * @apiSuccess {String} loan_orginitaor.contact contact number of the user.
 * @apiSuccess {String} loan_orginitaor.cacompname company name.
 * @apiSuccess {String} loan_orginitaor.capancard PAN CARD number.
 * @apiSuccess {String} loan_orginitaor.address1 address 1.
 * @apiSuccess {String} loan_orginitaor.address2 address 2 (by default it is null).
 * @apiSuccess {String} loan_orginitaor.pincode pincode.
 * @apiSuccess {String} loan_orginitaor.locality area/location.
 * @apiSuccess {String} loan_orginitaor.city city.
 * @apiSuccess {String} loan_orginitaor.state state.
 * @apiSuccess {String} loan_orginitaor.usertype
 * @apiSuccess {Number} loan_orginitaor.lender_id lender ID.
 * @apiSuccess {Number} loan_orginitaor.parent_id parent ID.
 * @apiSuccess {Number} loan_orginitaor.user_group_id user group ID.
 * @apiSuccess {Number} loan_orginitaor.assigned_sales_user sales user ID.
 * @apiSuccess {Number} loan_orginitaor.originator
 * @apiSuccess {Number} loan_orginitaor.is_lender_admin
 * @apiSuccess {String} loan_orginitaor.status
 * @apiSuccess {String} loan_orginitaor.osv_name
 * @apiSuccess {String} loan_orginitaor.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
 * @apiSuccess {String} loan_orginitaor.createdon user created date and time.
 * @apiSuccess {String} loan_orginitaor.update_time user updated date and time.
 * @apiSuccess {Number} loan_orginitaor.is_lender_manager
 * @apiSuccess {String} loan_orginitaor.origin shows who created the user.
 * @apiSuccess {String} loan_orginitaor.white_label_id white label id of the user.
 * @apiSuccess {String} loan_orginitaor.deactivate_reassign
 * @apiSuccess {Number} loan_orginitaor.notification_purpose
 * @apiSuccess {String} loan_orginitaor.user_sub_type sub type of the user (by default it is null)
 * @apiSuccess {String} loan_orginitaor.notification_flag
 * @apiSuccess {Number} loan_orginitaor.createdbyUser ID of the created user.
 * @apiSuccess {String} loan_orginitaor.source user company name.
 * @apiSuccess {String} loan_orginitaor.channel_type
 * @apiSuccess {String} loan_orginitaor.otp user otp number
 * @apiSuccess {String} loan_orginitaor.work_type
 * @apiSuccess {String} loan_orginitaor.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
 * @apiSuccess {String} loan_orginitaor.pic user profile picture.
 */

const reqParams = require("../helpers/req-params");
module.exports = {
	// index: async function(req, res, next) {
	// let users = await UsersRd.find({ select: ['id'], where: { parent_id: req.user['id'] } });
	// let userid = [];
	// _.each(users, function(value) {
	//     userid.push(value.id);
	// });
	// const query =
	//     'SELECT * FROM loanrequest l LEFT JOIN business b ON b.businessid=l.business_id LEFT JOIN loan_bank_mapping lbm ON lbm.loan_id=l.loanId where b.userid IN (' +
	//     userid.join(',') +
	//     ');';
	// try {
	//     var myDBStore = sails.getDatastore('mysql_namastecredit_read');
	//     nativeResult = await myDBStore.sendNativeQuery(query);
	//     return res.send(nativeResult.rows);
	// } catch (err) {
	//     return res.badRequest(err);
	// }
	// },
	index: async function (req, res, next) {
		const loan_id = req.param("id");
		let doctypeIds, excludeUserObj;
		const loanRequest = await LoanrequestRd.findOne({id: loan_id, white_label_id: req.user.loggedInWhiteLabelID});
		if (!loanRequest) {
			return res.status(403).json({error: "You are not authorized to access this loan"});
		}
		let ncStatusCondition = {
			status1: loanRequest.loan_status_id,
			status2: loanRequest.loan_sub_status_id,
			white_label_id: loanRequest.white_label_id
		};

		if (loanRequest.loan_status_id == 2 && loanRequest.loan_sub_status_id == 9) {
			const loanBankMapping = await LoanBankMappingRd.find({loan_id: loan_id}).sort("updated_at DESC");
			if (loanBankMapping.length > 0) {
				ncStatusCondition.status3 = loanBankMapping[0].loan_bank_status;
				ncStatusCondition.status4 = loanBankMapping[0].loan_borrower_status;
				_.each(loanBankMapping, async (value) => {
					if (
						loanRequest &&
						loanRequest.loan_status_id == 2 &&
						loanRequest.loan_sub_status_id == 9 &&
						value &&
						value.loan_bank_status == 9 &&
						value.loan_borrower_status == 2
					) {
						doctypeIds = [0];
					} else {
						doctypeIds = await DoctypeRd.find({
							select: ["id"],
							where: {
								priority: 0
							}
						});
					}
				});
			}
		}
		// loanRequest &&
		// loanRequest.loan_status_id == 2 &&
		// loanRequest.loan_sub_status_id == 9 &&
		// loanBankMapping &&
		// loanBankMapping.loan_bank_status == 9 &&
		// loanBankMapping.loan_borrower_status == 2
		// ? (doctypeIds = [ 0 ])
		// : (doctypeIds = await DoctypeRd.find({
		// select: [ 'id' ],
		// where: {
		// priority: 0
		// }
		// }));

		const nc_status_data = await NcStatusManageRd.find(ncStatusCondition);
		if (nc_status_data.length > 0 && nc_status_data[0].exclude_user_ncdoc) {
			const excludeUserParseData = JSON.parse(nc_status_data[0].exclude_user_ncdoc);
			_.each(excludeUserParseData.user_types_toexclude, (value) => {
				if (value.name == req.user.usertype) {
					priority = value.priority.split(",");
					excludeUserObj = priority
						.toString()
						.replace(/[^0-9,]/g, "")
						.split(",");
				}
			});
		}

		if (excludeUserObj) {
			doctypeIds = await DoctypeRd.find({
				select: ["id"],
				where: {
					priority: {in: excludeUserObj}
				}
			});
		}

		const whereCondition = {
			id: loan_id
		},
			docIds = [];
		_.each(doctypeIds, (value) => {
			docIds.push(value.id);
		});
		req.user = {
			usertype: "Bank"
		};
		if (req.user.usertype === "Bank") {
			docIds.push(0);
			docIdVal = docIds;
		} else if (excludeUserObj.length > 0) {
			docIdVal = docIds;
		} else {
			docIdVal = [0];
		}
		const viewLoanList = await LoanrequestRd.find(whereCondition)
			.populate("loan_document", {
				where: {
					status: "active",
					doctype: {
						"!=": docIdVal
					}
				}
			})
			.populate("lender_document", {
				where: {
					status: "active",
					upload_method_type: {'!=': 'ucic'}
				}
			})
			.populate("loan_orginitaor")
			.populate("loan_asset_type")
			.populate("createdUserId")
			.populate("unsecured_type")
			.populate("loan_usage_type");
		Promise.all(
			viewLoanList.map(async (viewLoanListElement) => {
				viewLoanListElement.loan_document.map(async (doc_element) => {
					// null check for filesize
					if (doc_element.size != null && !isNaN(doc_element.size)) {
						doc_element.size = await sails.helpers.filesize(parseInt(doc_element.size));
					}
					const docTypeReport = DoctypeRd.findOne({id: doc_element.doctype}).then((docTyperesult) => {
						if (docTyperesult) {
							doc_element.docTypeDetails = docTyperesult;
						} else {
							doc_element.docTypeDetails = null;
						}
					});
				});
				viewLoanListElement.lender_document.map(async (doc_element) => {
					// null check for filesize
					if (doc_element.size_of_file &&
						doc_element.size_of_file !== null && !isNaN(doc_element.size_of_file)) {
						doc_element.size_of_file = await sails.helpers.filesize(parseInt(doc_element.size_of_file));
						doc_element.size = doc_element.size_of_file;
					}
					const docTypeReport = DoctypeRd.findOne({id: doc_element.doc_type}).then((docTyperesult) => {
						if (docTyperesult) {
							doc_element.docTypeDetails = docTyperesult;
						} else {
							doc_element.docTypeDetails = null;
						}
					});
				});
				const loantype = viewLoanListElement.loan_type_id.split(","),
					// get loan type
					loanTypeDetails = await LoantypeRd.find({id: loantype}).then((result) => {
						if (result) {
							viewLoanListElement.loan_type = result;
						}
					});
				// Loan financial details
				const financialsData = await LoanFinancialsRd.find({
					loan_id: viewLoanListElement.id,
					business_id: viewLoanListElement.business_id
				})
				if (financialsData.length > 0) {
					for (item of financialsData) {
						item.bank_details = item.bank_id ? await BanktblRd.findOne({id: item.bank_id}).select(["bank", "ifsc", "branch"]) : ""
					}
					viewLoanListElement.loanFinancialDetails = financialsData;
				} else {
					viewLoanListElement.loanFinancialDetails = [];
				}

				const roi_data = await LoanBankMappingRd.find({loan_id: loan_id}).select("interest_rate");
				viewLoanListElement.loan_bank_mapping_id = roi_data.length > 0 ? roi_data[0].id : null;
				viewLoanListElement.roi = roi_data.length > 0 ? roi_data[0].interest_rate : ""

				//disbursement details
				viewLoanListElement.disbursement_data = roi_data.length > 0 ? await LoanDisbursementRd.find({loan_bank_mapping_id: roi_data[0].id, disbursement_status: {"!=": "deleted"}}) : [];

				// director details
				const directorDetails = await DirectorRd.find({business: viewLoanListElement.business_id})
					.populate("profession")
					.then((result) => {
						if (result) {
							viewLoanListElement.directors = result;
						} else {
							viewLoanListElement.directors = null;
						}
					}),
					// business details
					businessDetails = await BusinessRd.findOne({id: viewLoanListElement.business_id})
						.populate("business_address")
						.populate("businesstype")
						.populate("businessindustry")
						.then((result) => {
							if (result) {
								viewLoanListElement.business_id = result;
							} else {
								viewLoanListElement.business_id = null;
							}
						});
				//branch details
				const branchData = await BanktblRd.find({id: viewLoanListElement.branch_id}).select(["bank", "branch", "city", "state"]);
				viewLoanListElement.branch_data = branchData.length ? branchData[0] : ""

				const loanAdditionalData = await LoanAdditionalDataRd.find({loan_id: loan_id}).select("source_codes");
				viewLoanListElement.source_data = loanAdditionalData.length ? JSON.parse(loanAdditionalData?.[0]?.source_codes) : ""

				if (viewLoanListElement.loan_origin.split("_")[0] == "onboarding") {
					// product_details
					await LoanProductDetailsRd.find({
						product_id: {contains: viewLoanListElement.loan_product_id},
						white_label_id: viewLoanListElement.white_label_id,
						isActive: "true"
					})
						.select(["product_id", "loan_request_type", "basic_details"])
						.then((result) => {
							if (result.length > 0) {
								result[0].product_name = result[0].basic_details ? JSON.parse(result[0].basic_details).name : ""
								delete result[0].basic_details
								viewLoanListElement.product_details = result[0];
							} else {
								viewLoanListElement.product_details = [];
							}
						});
				}
				viewLoanListElement.loan_price =
					viewLoanListElement.loan_amount + " " + viewLoanListElement.loan_amount_um;
				viewLoanListElement.assets_data =
					viewLoanListElement.assets_value + " " + viewLoanListElement.assets_value_um;
				if (viewLoanListElement.annual_revenue && viewLoanListElement.revenue_um) {
					viewLoanListElement.annual_turn_over =
						viewLoanListElement.revenue_um == "Lakhs"
							? Math.round(viewLoanListElement.annual_revenue * 100000)
							: viewLoanListElement.revenue_um == "Crores"
								? Math.round(viewLoanListElement.annual_revenue * 10000000)
								: viewLoanListElement.annual_revenue;
				} else {
					viewLoanListElement.annual_turn_over = null;
				}
				if (viewLoanListElement.annual_op_expense && viewLoanListElement.op_expense_um) {
					viewLoanListElement.annual_op =
						viewLoanListElement.op_expense_um == "Lakhs"
							? Math.round(viewLoanListElement.annual_op_expense * 100000)
							: viewLoanListElement.op_expense_um == "Crores"
								? Math.round(viewLoanListElement.annual_op_expense * 10000000)
								: viewLoanListElement.annual_op_expense;
				} else {
					viewLoanListElement.annual_op = null;
				}

				return directorDetails;
			})
		).then(() => {
			return res.ok(viewLoanList[0]);
		});
	},

	/**
 * @api {POST} /borrowerdoc-upload Loan borrower Upload
 * @apiName Loan borrower Upload
 * @apiGroup Loans
 * @apiExample Example usage:
 * curl -i localhost:1337/borrowerdoc-upload
 * @apiParam upload_document
 * @apiDescription upload_document
 * [
	{
		"loan_id": 1,
		"doc_type_id": "1",
		"upload_doc_name":"testa",
		"document_key":"test1",
		"directorId":12
	},
	{
		"loan_id": 1,
		"doc_type_id": "1",
		"upload_doc_name":"testb",
		"document_key":"test2",
		"directorId":221
	}
]
 * @apiSuccess {String} status ok.
 * @apiSuccess {String} message Uploaded Successfully.
 **/
	uploaddocument: async function (req, res, next) {
		const datetime = await sails.helpers.dateTime();
		let business_user_id = "";
		const post_data = req.allParams(),
			url = [];
		let getBusinessDetails;
		// let upload_document = post_data.upload_document;
		// var docFormatJSON = JSON.parse(upload_document);
		const docFormatJSON = (upload_document = post_data.upload_document || post_data.data.document_upload);
		const qMessages = [];
		resdata = [];
		await Promise.all(
			docFormatJSON.map(async (arrayItem) => {
				if (
					!arrayItem.loan_id ||
					!arrayItem.doc_type_id ||
					!arrayItem.upload_doc_name ||
					!arrayItem.document_key
				) {
					return res.badRequest({status: "nok", message: sails.config.msgConstants.mandatoryFieldsMissing});
				}
				const loan_id = arrayItem.loan_id,
					doc_type_id = arrayItem.doc_type_id,
					upload_doc_name = arrayItem.upload_doc_name,
					original_doc_name = arrayItem.original_doc_name,
					document_key = arrayItem.document_key,
					size = arrayItem.size;
				getBusinessDetails = await LoanrequestRd.findOne({
					where: {
						id: loan_id
					},
					select: ["business_id", "white_label_id", "loan_ref_id", "loan_product_id", "loan_status_id", "loan_type_id"]
				});
				const uploadAllowed_status1 = [1, 8, 15];
				if (getBusinessDetails.white_label_id == sails.config.federal_api.whitelabel_id && !(uploadAllowed_status1.includes(getBusinessDetails.loan_status_id)) &&
					getBusinessDetails.loan_type_id != sails.config.vendor_loan_type &&
					sails.config.federal_api.federal_product_id.includes(getBusinessDetails.loan_product_id) === false) {
					return res.badRequest({status: "nok", message: "Case already initiated, Documents are Not allowed to upload"})
				}
				if (post_data && post_data.section_id) {
					trackData = await sails.helpers.onboardingDataTrack(
						getBusinessDetails.id,
						getBusinessDetails.business_id,
						"",
						req.user.id,
						post_data.section_id, ""
					);
				}
				const whitelabelsolution = await WhiteLabelSolutionRd.findOne({
					id: getBusinessDetails.white_label_id
				}).select(["s3_name", "s3_region"]);
				if (getBusinessDetails.business_id) {
					const getUserDetails = await BusinessRd.findOne({
						where: {
							id: getBusinessDetails.business_id
						},
						select: ["userid"]
					});
					business_user_id = getUserDetails.userid ? getUserDetails.userid : "";
					if (business_user_id && loan_id) {
						if (post_data.origin === "cub") {
							copyObject = await sails.helpers.s3CopyObject(
								post_data.userId,
								whitelabelsolution.s3_name,
								whitelabelsolution.s3_region,
								business_user_id,
								document_key
							);

							loanDocData = await LoanDocumentRd.find({
								user_id: business_user_id,
								business_id: getBusinessDetails.business_id,
								loan: loan_id,
								doctype: sails.config.docUpload.equifaxDocId
							});
							if (loanDocData.length > 0) {
								loanDocData.forEach(async (value) => {
									updateData = {
										image_quality_json_file: null
									};
									if (value.doc_name.split(".").pop() == "xlsx") {
										updateData.status = sails.config.doc_type.doc_status1;
									}
									updateDoc = await LoanDocument.update({id: value.id}).set(updateData).fetch();
								});
							}
						}
						data = {
							user_id: business_user_id,
							business_id: getBusinessDetails.business_id,
							loan: loan_id,
							doctype: doc_type_id,
							doc_name: document_key,
							uploaded_doc_name: upload_doc_name,
							original_doc_name: original_doc_name || upload_doc_name,
							status: "active",
							size: size,
							ints: datetime,
							on_upd: datetime,
							uploaded_by: arrayItem.uploaded_by ? arrayItem.uploaded_by : req.user.id,
							is_delete_not_allowed: arrayItem.is_delete_not_allowed
								? arrayItem.is_delete_not_allowed
								: "false"
						};
						if (arrayItem.directorId) {
							data.directorId = arrayItem.directorId;
						}
						if (arrayItem.bankId) {
							data.bank_id = arrayItem.bankId;
						}
						if (arrayItem.accountNo) {
							data.account_no = arrayItem.accountNo;
						}
						if (arrayItem.password) {
							data.document_password = arrayItem.password;
						}
						const createdLoanDocRecord = await LoanDocument.create(data).fetch();
						if (createdLoanDocRecord) {
							await LoanDocumentDetails.create({
								doc_id: createdLoanDocRecord.id,
								aid: arrayItem.aid,
								classification_type: arrayItem.classification_type,
								classification_sub_type: arrayItem.classification_sub_type,
								ints: datetime,
								loan_id,
								other_doc_ref_id: arrayItem.doc_ref_id,
								did: arrayItem.directorId || 0
							});
							const message = {
								loan_id,
								business_id: getBusinessDetails.business_id,
								director_id: arrayItem.directorId || 0,
								doc_id: createdLoanDocRecord.id,
								parent_doc_id: "",
								doc_type: doc_type_id,
								user_id: business_user_id,
								doc_name: document_key,
								uploaded_doc_name: upload_doc_name,
								original_doc_name: upload_doc_name,
								s3bucket: whitelabelsolution.s3_name,
								region: whitelabelsolution.s3_region,
								cloud: "aws",
								white_label_id: getBusinessDetails.white_label_id,
								isLoanDocument: true
							};
							qMessages.push(message);
						}
						resdata.push(createdLoanDocRecord);
						loanreqUpdate = await Loanrequest.update({id: loan_id}).set({modified_on: datetime}).fetch();
						let bucket = whitelabelsolution.s3_name;
						// if (!sails.config.azure.isActive) {
						bucket = whitelabelsolution.s3_name + "/users_" + business_user_id;
						// }
						const s3_url = await sails.helpers.s3ViewDocument(
							document_key,
							bucket,
							whitelabelsolution.s3_region
						);
						url.push({URL: s3_url});
						const logService = await sails.helpers.logtrackservice(
							req,
							"borrowerdoc-upload",
							createdLoanDocRecord.id,
							"loan_document"
						);
					}
				}
			})
		);

		await sails.helpers.insertIntoQ(sails.config.qNames.GENERIC_Q, qMessages);

		return res.ok({
			status: "ok",
			message: "Uploaded Successfully",
			loan_ref_id: getBusinessDetails.loan_ref_id,
			data: resdata,
			url: url
		});
	},
	/**
	 * * Lender document type
	 * @description :: lender document type
	 * @api {get} /lender/doctype/ Lender Document type
	 * @apiName lender document
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/lender/doctype/
	 *
	 * @apiSuccess {Object[]} .
	 */
	lenderDocumentTypes: async function (req, res, next) {
		let excluded_doc_type_ids = req.param("excluded_doc_type_ids");
		const logService = await sails.helpers.logtrackservice(req, "lender/doctype", req.user.id, "doctype");
		const loanProductId = req.param("product_id");
		let nativeResult;
		if (sails.config.otherUsersTypes.find((element) => element == req.user.usertype) && req.user.usertype != 'BPO') {
			(query = `select dt.doc_type_id,dt.doc_type,dt.excel_sheet_name,dt.name,dt.priority,dt.doc_detail, dt.mandatory as isMandatory from doctype dt where dt.priority = "3" and dt.white_label_id IN (0, ${req.user.loggedInWhiteLabelID}) order by dt.doc_type, dt.name asc`),
				(myDBStore = sails.getDatastore("mysql_namastecredit_read"));
			nativeResult = await myDBStore.sendNativeQuery(query);
		} else {
			query = `select dt.doc_type_id,dt.doc_type,dt.excel_sheet_name,dt.name,dt.priority,dt.doc_detail, dt.mandatory as isMandatory from doctype dt where dt.priority IN ("300","3","4") and dt.white_label_id IN (0, ${req.user.loggedInWhiteLabelID})`;
			if (excluded_doc_type_ids) {
				query += ` and dt.doc_type_id NOT IN(${excluded_doc_type_ids}) order by dt.doc_type,dt.name asc`;
			} else {
				query += ` order by dt.doc_type,dt.name asc`;
			}
			myDBStore = sails.getDatastore("mysql_namastecredit_read");
			nativeResult = await myDBStore.sendNativeQuery(query);
		}
		nativeResult.rows.find((o, i) => {
			if (o.isMandatory == "1") {
				nativeResult.rows[i] = {...nativeResult.rows[i], isMandatory: true};
			} else {
				nativeResult.rows[i] = {...nativeResult.rows[i], isMandatory: false};
			}
		});
		/* if loanProductId is passed, pass if doc upload is mandatory or not for each doctypes */
		if (loanProductId) {
			const {additional_conditions: additionalConditions} = await LoanProductsRd.findOne({
				id: loanProductId
			}).select("additional_conditions");

			if (
				additionalConditions &&
				additionalConditions.data &&
				additionalConditions.data.lender_document &&
				(mandatoryCheck = additionalConditions.data.lender_document.mandatory_check)
			) {
				const auxMap = new Map();

				nativeResult.rows.forEach((curElm, indx) => {
					auxMap.set(curElm.doc_type_id, indx);
				});

				mandatoryCheck.forEach((curElm) => {
					if (curElm.mandatory && (indx = auxMap.get(curElm.doc_type_id))) {
						nativeResult.rows[indx] = {...nativeResult.rows[indx], mandatory: true};
					}
				});
			}
		}

		//return res.send({loanProductId, additionalConditions, res: nativeResult.rows});
		// var doctype = await DoctypeRd.find({
		// where: { priority: '300' },
		// select: ['id', 'doc_type', 'name', 'priority', 'doc_detail']
		// });
		res.send(nativeResult.rows);
	},
	/**
	 * * document type
	 * @description :: document type
	 * @api {post} /loan/documentTypes/ Document type
	 * @apiName loan document
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/loan/documentTypes/
	 *
	 * @apiParam {Number} loan_product loan product id.
	 * @apiParam {String} business_type business type id.
	 * @apiSuccess {Object[]} kyc_doc kyc document.
	 * @apiSuccess {Object[]} finance_doc finance document.
	 * @apiSuccess {Object[]} other_doc other document.
	 */

	documentTypes: async function (req, res, next) {
		const loanproduct = req.param("loan_product"),
			businesstype = req.param("business_type"),
			nc_document = req.param("nc_documents"),
			loan_id = req.param("loan_id"),
			lender_document = req.param("lender_doc_types");
		if (loanproduct && businesstype) {
			const result = {
				kyc_doc: [],
				finance_doc: [],
				other_doc: []
			};
			let doc_id = [];
			if (nc_document) {
				const ncDoc = await DoctypeRd.find({
					priority: "0",
					status: "active"
				}).select(["doc_type", "name", "priority", "doc_detail"]);
				result.nc_doc = ncDoc;
			}
			if (lender_document == true) {
				const lender_doc = await DoctypeRd.find({
					priority: ["300", "3", "4"],
					status: "active"
				}).select(["doc_type", "name", "priority", "doc_detail"]);
				result.lender_doc = lender_doc;
			}
			if (loan_id) {
				doc_id = await statutory_obligation_docIds(loan_id);
			}
			LoanProductDocumentMappingRd.find({loan_product_id: loanproduct}).then(async (product_mapping) => {
				if (product_mapping.length === 0) {
					return res.send({status: "nok", message: sails.config.msgConstants.documentsNotMapped});
				}
				if (isNaN(Number(businesstype))) {
					return res.send({status: "nok", message: sails.config.msgConstants.wrongBusinessType});
				}
				whiteLabelData = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID}).select(
					"document_mapping"
				);
				parseData = whiteLabelData.document_mapping ? JSON.parse(whiteLabelData.document_mapping) : {};
				for (const product of product_mapping) {
					const businesstype_id = product.businesstype_id.split(",").map(Number);
					if (businesstype_id.includes(Number(businesstype))) {
						const doc_type_list = await DoctypeRd.findOne({
							id: product.doctype_id,
							status: "active"
						}).select(["doc_type", "name", "priority", "doc_detail"]);
						if (doc_type_list) {
							if (parseData && parseData.doc_data && parseData.doc_data.length > 0) {
								parseData.doc_data.forEach((element) => {
									if (doc_type_list.id == element.doctype_id) {
										doc_type_list.name = element.name;
									}
								});
							}
							doc_type_list.doc_type_id = doc_type_list.id;
							if ((product.document_condition === 1) || (doc_id.length > 0 && doc_id.includes(doc_type_list.id))) {
								doc_type_list.isMandatory = true;
							} else {
								doc_type_list.isMandatory = false;
							}

							if (doc_type_list.priority === "100") {
								result.kyc_doc.push(doc_type_list);
							}
							if (doc_type_list.priority === "1") {
								result.finance_doc.push(doc_type_list);
							}
							if (doc_type_list.priority === "200") {
								result.other_doc.push(doc_type_list);
							}
						}
					}
				}
				return res.send(result);
			});
		} else {
			return res.send({status: "nok", message: sails.config.msgConstants.mandatoryFieldsMissing});
		}
	},

	/**
	 * * create loan
		* @description :: create loanrequest
		* @api {post} /loan/createloan/ createloan
		* @apiName Createloan
		* @apiGroup Loans
		* @apiExample Example usage:
		* curl -i localhost:1337/loan/createloan/
		*
		* @apiParam {Object[]} Business_details
		* @apiParam {String} Business_details.business_name (mandatory)
		* @apiParam {Number} userid
		* @apiParam {Number} Business_details.business_industry_type (mandatory)
		* @apiParam {String} Business_details.business_started (mandatory)
		* @apiParam {Number} Business_details.business_type (mandatory)
		* @apiParam {String} Business_details.gstin
		* @apiParam {String} Business_details.contact
		* @apiParam {String} Business_details.business_email (mandatory)
		* @apiParam {String} Business_details.first_name
		* @apiParam {String} Business_details.last_name
		* @apiParam {String} Business_details.crime_check

		* @apiParam {Object[]} loan_details
		* @apiParam {Number} loan_details.loan_request_type (mandatory)
		* @apiParam {Number} loan_details.loan_amount (mandatory)
		* @apiParam {String} loan_details.loan_amount_um (mandatory)
		* @apiParam {Number} loan_details.loan_tenure (mandatory)
		* @apiParam {String} loan_details.loan_tenure_um (mandatory)
		* @apiParam {String} loan_details.loan_type_id (mandatory)
		* @apiParam {Number} loan_details.loan_usage_type_id (mandatory)
		* @apiParam {String} loan_details.application_ref
		* @apiParam {String} loan_details.loan_product_id (mandatory)
		* @apiParam {Number} loan_details.cur_monthly_emi (non mandatory)
		* @apiParam {String} loan_details.origin
		* @apiParam {String} loan_details.loanReject_count (non mandatory)
		* @apiParam {String} loan_details.emiBounce_count (non mandatory)
		* @apiParam {String} loan_details.unsecuredLoan_count (non mandatory)
		* @apiParam {String} loan_details.GST_check (non mandatory)
		* @apiParam {String} loan_details.CIBIL_check (non mandatory)
		* @apiParam {String} loan_details.emails
		*
		* @apiParam {Object[]} financials
		* @apiParam {Number} financials.annual_op_expense (mandatory)
		* @apiParam {String} financials.op_expense_um (mandatory)
		* @apiParam {Number} financials.annual_revenue (mandatory)
		* @apiParam {String} financials.revenue_um (mandatory)
		*
		* @apiParam {Object[]} Collaterals
		* @apiParam {Number} Collaterals.property_type loan_asset_type_id (mandatory)
		* @apiParam {Number} Collaterals.assets_value (mandatory)
		* @apiParam {Number} Collaterals.assets_value_um (mandatory)
		* @apiParam {Number} Collaterals.unsecured_type
		*
		*
		* @apiParam {Object[]} businessaddress
		* @apiParam {String} businessaddress.line1 line1(mandatory).
		* @apiParam {String} businessaddress.line2 line2.
		* @apiParam {String} businessaddress.locality (mandatory)
		* @apiParam {String} businessaddress.city (mandatory)
		* @apiParam {String} businessaddress.state (mandatory)
		* @apiParam {String} businessaddress.pincode (mandatory)
		* @apiParam {String} businessaddress.office_type
		* @apiParam {string} businessaddress.residential_type
		*
		* @apiParam {Object[]} director_details
		* @apiParam {Object[]} director_details.director_0
		* @apiParam {String} director_details.director_0.dfirstname0
		* @apiParam {String} director_details.director_0.dlastname0
		* @apiParam {String} director_details.director_0.demail0
		* @apiParam {Number} director_details.director_0.dcontact0
		* @apiParam {String} director_details.director_0.ddob0
		* @apiParam {String} director_details.director_0.dpancard0
		* @apiParam {String} director_details.director_0.dcibil_remarks0
		* @apiParam {String} director_details.director_0.crime_check
		*
		* @apiParam {Object} documents
		* @apiParam {Object[]} documents.KYC
		* @apiParam {String} documents.KYC.fd
		* @apiParam {Number} documents.KYC.size
		* @apiParam {String} documents.KYC.type
		* @apiParam {String} documents.KYC.filename
		* @apiParam {String} documents.KYC.status
		* @apiParam {String} documents.KYC.field
		* @apiParam {Number} documents.KYC.value
		* @apiParam {Object[]} documents.others
		* @apiParam {String} documents.others.fd
		* @apiParam {Number} documents.others.size
		* @apiParam {String} documents.others.type
		* @apiParam {String} documents.others.filename
		* @apiParam {String} documents.others.status
		* @apiParam {String} documents.others.field
		* @apiParam {Number} documents.others.value
		* @apiParam {Object[]} documents.financials
		* @apiParam {String} documents.financials.fd
		* @apiParam {Number} documents.financials.size
		* @apiParam {String} documents.financials.type
		* @apiParam {String} documents.financials.filename
		* @apiParam {String} documents.financials.status
		* @apiParam {String} documents.financials.field
		* @apiParam {Number} documents.financials.value
		*
		* @apiSuccess {String} status ok.
		* @apiSuccess {String} message Loan Created.
		* @apiSuccess {Object} data
		* @apiSuccess {Number} data.id id.
		* @apiSuccess {Number} data.loan_request_type loan request type.
		* @apiSuccess {String} data.loan_ref_id loan reference id.
		* @apiSuccess {Number} data.loan_amount  loan amount.
		* @apiSuccess {String} data.loan_amount_um Lakhs/Crore.
		* @apiSuccess {Number} data.applied_tenure
		* @apiSuccess {String} data.assets_value assets value.
		* @apiSuccess {String} data.assets_value_um Lakhs/Crore.
		* @apiSuccess {Number} data.annual_revenue annual revenue.
		* @apiSuccess {String} data.revenue_um Lakhs/Crore.
		* @apiSuccess {Number} data.annual_op_expense
		* @apiSuccess {String} data.op_expense_um
		* @apiSuccess {String} data.cur_monthly_emi current monthly emi.
		* @apiSuccess {String} data.loan_type_id loan type id.
		* @apiSuccess {String} data.loan_rating_id loan rating id.
		* @apiSuccess {Number} data.loan_status_id loan status id.
		* @apiSuccess {String} data.loan_sub_status_id loan sub status id.
		* @apiSuccess {String} data.remarks remarks.
		* @apiSuccess {String} data.assigned_uw
		* @apiSuccess {String} data.assigned_date assigned date.
		* @apiSuccess {String} data.osv_doc
		* @apiSuccess {String} data.modified_on modification date and time.
		* @apiSuccess {String} data.RequestDate Request Date.
		* @apiSuccess {String} data.loan_summary loan summary.
		* @apiSuccess {Number} data.loan_product_id loan product id.
		* @apiSuccess {String} data.notification notification.
		* @apiSuccess {String} data.white_label_id white label id.
		* @apiSuccess {Number} data.sales_id sales id.
		* @apiSuccess {String} data.loan_originator loan originator.
		* @apiSuccess {String} data.doc_collector document collector.
		* @apiSuccess {String} data.remark_history remark history.
		* @apiSuccess {String} data.application_ref application reference.
		* @apiSuccess {String} data.document_upload document upload.
		* @apiSuccess {Number} data.business_id business id.
		* @apiSuccess {Number} data.loan_asset_type loan asset type id.
		* @apiSuccess {Number} data.loan_usage_type loan usage type id.
		* @apiSuccess {String} data.createdUserId  created user id.
		* @apiSuccess {Number} data.loan_orginitaor
		* @apiSuccess {String} data.unsecured_type
		* @apiSuccess {Object} business business details.
		* @apiSuccess {Object} businessaddress business address details.
		* @apiSuccess {Object[]} director director details.

		*
		*/

	createloanrequest: async function (req, res) {
		const flaverr = require("flaverr"),
			md5 = require("md5"),
			moment = require("moment");
		const curDate = new Date(); // current date
		let createDirectorData,
			create_business_data,
			create_business_address_data,
			businesspancardnumber,
			createCorpData, loanId;
		const users_whitelabel = req.user.loggedInWhiteLabelID, // Whitelabel of logged in user
			post_data = req.allParams(), // Input data
			loggedin_user = req.user.id, // logged in userid
			user = req.user, // logged in user details
			businessDetails = post_data.Business_details, // Business input details
			loan_details = post_data.loan_details, // loan input details
			businessaddress = post_data.businessaddress, // Business address input details
			financials = post_data.financials, // Financial input details
			Collaterals = post_data.Collaterals, // Collateral input details
			director_details = post_data.director_details; // Director input details
		let crimeCheck = businessDetails.crime_check,
			primaryCorporateId,
			secondaryCorporateId,
			userdata;
		const document = post_data.documents,
			first_name =
				businessDetails.first_name == undefined || businessDetails.first_name == ""
					? ""
					: businessDetails.first_name,
			last_name =
				businessDetails.last_name == undefined || businessDetails.last_name == ""
					? ""
					: businessDetails.last_name,
			email = businessDetails.business_email,
			contact =
				businessDetails.contact == undefined || businessDetails.contact == "" ? "" : businessDetails.contact;
		if (email != user.email) {
			userexists = await UsersRd.findOne({email: email});
			if (
				user.usertype == "CA" &&
				userexists &&
				userexists.parent_id != loggedin_user &&
				user.loggedInWhiteLabelID == userexists.white_label_id.split(",")[0]
			) {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.borrowerTaggedWithOtherCA
				});
			}
			if (!userexists) {
				userdata = {};
			} else {
				// if user already exists with inputed email id and for that same user parent id is logged in CA' users' id
				// if user already exists with inputed email and for the user whitelabel id is same as inputed whitelabel and logged user is sales
				if (
					(user.usertype == "CA" && userexists.parent_id == loggedin_user) ||
					(user.usertype == "Sales" && userexists.white_label_id == post_data.loan_details.white_label_id)
				) {
					userdata = userexists;
				} else if (user.usertype == "CA" && userexists.parent_id != loggedin_user && userexists) {
					whitelabelUpdate = await sails.helpers.whiteLabel(email, post_data.loan_details.white_label_id);
					userdata = userexists;
				} else {
					userdata = req.user;
				}
			}
			!first_name || first_name == undefined
				? (name = businessDetails.business_name)
				: (name = first_name + last_name);
			if (!userdata || Object.keys(userdata).length == 0) {
				insert_user_data = {
					email: email,
					contact: contact,
					name: name,
					password: md5(contact.toString()),
					user_reference_pwd: businessDetails.contact,
					usertype: "Borrower",
					parent_id: req.user.id,
					assigned_sales_user: req.user.usertype == "Sales" ? req.user.id : req.user.assigned_sales_user,
					white_label_id: post_data.loan_details.white_label_id,
					createdbyUser: req.user.id,
					originator: req.user.id,
					status: "active",
					origin: "CA",
					osv_name: "",
					notification_flag: "yes",
					notification_purpose: 4,
					is_corporate: businessDetails.is_corporate || null
				};
				const createUserData = await Users.create(insert_user_data).fetch();
				userid = createUserData.id;
				originator = createUserData.originator;
				assigned_sales_user = createUserData.assigned_sales_user;
				usertype = createUserData.usertype;

				if (createUserData && createUserData.is_corporate && createUserData.is_corporate == 1) {
					const userType = req.user.is_corporate == 1 ? "Secondary" : "Primary";
					createdBy = createUserData.is_corporate == 1 ? req.user.id : createUserData.id;
					createCorpData = await UserCorporateMapping.create({
						userid: createUserData.id,
						user_type: userType,
						created_by: createdBy,
						created_on: await sails.helpers.dateTime()
					}).fetch();
					primaryCorporateId = createCorpData.created_by;
					secondaryCorporateId = createCorpData.userid;
				}
			} else if (userdata && (userdata.usertype == "Borrower" || userdata.usertype == "CA")) {
				userid = userdata.id;
				originator = userdata.originator;
				assigned_sales_user = userdata.assigned_sales_user;
				usertype = userdata.usertype;
				if (req.user.is_corporate == 1 && businessDetails.corporateId) {
					createCorpData = await UserCorporateMappingRd.findOne({userid: businessDetails.corporateId});
					primaryCorporateId = createCorpData.created_by;
					secondaryCorporateId = createCorpData.userid;
				}
			} else {
				userid = loggedin_user;
				originator = req.user.originator;
				assigned_sales_user = req.user.assigned_sales_user;
				usertype = req.user.usertype;
			}
		} else {
			userid = loggedin_user;
			originator = req.user.originator;
			assigned_sales_user = req.user.assigned_sales_user;
			usertype = req.user.usertype;
			if (req.user.is_corporate == 1 && businessDetails.corporateId) {
				createCorpData = await UserCorporateMappingRd.findOne({userid: businessDetails.corporateId});
				primaryCorporateId = createCorpData.created_by;
				secondaryCorporateId = createCorpData.userid;
			}
		}

		const whiteLabelData = await WhiteLabelSolutionRd.findOne({
			select: ["country"],
			where: {
				id: users_whitelabel
			}
		});
		whiteLabelData.country === "US"
			? (businesspancardnumber =
				businessDetails.businesspancardnumber == undefined ||
					businessDetails.businesspancardnumber == "" ||
					businessDetails.businesspancardnumber == null
					? "ENTERTAXID"
					: businessDetails.businesspancardnumber)
			: (businesspancardnumber =
				businessDetails.businesspancardnumber == undefined ||
					businessDetails.businesspancardnumber == "" ||
					businessDetails.businesspancardnumber == null
					? "NAMAS9948K"
					: businessDetails.businesspancardnumber);
		const business_started = businessDetails.business_started,
			gstin = businessDetails.gstin == undefined ? "" : businessDetails.gstin,
			white_label_id = loan_details.white_label_id,
			emp_count = businessDetails.empcount == undefined ? 1 : businessDetails.empcount;
		businessstartdate = business_started;
		const address1 = businessaddress.line1 == undefined ? null : businessaddress.line1,
			address2 = businessaddress.line2 == undefined ? null : businessaddress.line2,
			residentialType = businessaddress.residential_type == undefined ? "" : businessaddress.residential_type,
			officeType = businessaddress.office_type == undefined ? "" : businessaddress.office_type,
			application_ref = loan_details.application_ref == undefined ? null : loan_details.application_ref,
			unsecured_type = Collaterals.unsecured_type == undefined ? null : Collaterals.unsecured_type,
			loan_product_group = Collaterals.property_type == 1 ? "Unsecured" : "Secured",
			loan_product = await LoanProductsRd.findOne({id: loan_details.loan_product_id}),
			loan_usage_type = await LoanUsageTypeRd.find({
				id: loan_details.loan_usage_type_id
					? loan_details.loan_usage_type_id
					: loan_product.loan_usage_type_id.split(",")[0]
			}),
			loan_summary =
				loan_product_group +
				" - loan amount requested for " +
				loan_details.loan_amount +
				" " +
				loan_details.loan_amount_um +
				" towards " +
				loan_usage_type[0]["typeLname"],
			loan_ref_id = await sails.helpers.commonHelper(),
			formatted_date = moment(curDate).format("YYYY-MM-DD HH:mm:ss"),
			loanstatus = await sails
				.getDatastore("mysql_namastecredit_write")
				.transaction(async (db, proceed) => {
					const whitelabelsolution = await WhiteLabelSolutionRd.find({id: white_label_id}),
						bucket = whitelabelsolution[0]["s3_name"],
						s3_region = whitelabelsolution[0]["s3_region"];
					crimeCheck ? crimeCheck : (crimeCheck = "No");
					create_business_data = await Business.create({
						businessname: businessDetails.business_name,
						userid: primaryCorporateId || userid,
						first_name: first_name,
						last_name: last_name,
						business_email: email,
						contactno: contact,
						businesstype: businessDetails.business_type,
						businessindustry: businessDetails.business_industry_type,
						businessstartdate: businessstartdate,
						businesspancardnumber: businesspancardnumber,
						white_label_id: white_label_id,
						gstin: gstin,
						empcount: emp_count,
						crime_check: crimeCheck,
						ints: moment(curDate).format("YYYY-MM-DD HH:mm:ss"),
						corporateid: businessDetails.corporateid ? businessDetails.corporateid : ""
					})
						.usingConnection(db)
						.fetch();
					if (!create_business_data) {
						throw flaverr(
							"E_INVALID_NEW_RECORD",
							new Error("Some of the required parameters in Business are missing")
						);
					}
					create_business_address_data = await Businessaddress.create({
						bid: create_business_data.id,
						aid: 1,
						line1: address1,
						line2: address2,
						locality: businessaddress.locality,
						city: businessaddress.city,
						state: businessaddress.state,
						pincode: businessaddress.pincode.toString(),
						address_status: officeType,
						residential_type: residentialType,
						ints: await sails.helpers.dateTime()
					})
						.usingConnection(db)
						.fetch();
					loan_orginitaor = usertype == "Sales" ? userid : originator;
					const report_tat = {
						assignedUserId: req.user.id,
						assignedBy: req.user.name,
						dateTime: formatted_date,
						previous_status: "",
						current_status: "Application",
						message: "",
						count: 1
					};
					insert_loan_data = {
						loan_request_type: loan_details.loan_request_type,
						business_id: create_business_data.id,
						loan_ref_id: loan_ref_id,
						loan_amount: loan_details.loan_amount,
						loan_amount_um: loan_details.loan_amount_um,
						applied_tenure: loan_details.loan_tenure,
						assets_value: Collaterals.assets_value,
						assets_value_um: Collaterals.assets_value_um,
						annual_revenue: financials.annual_revenue,
						revenue_um: financials.revenue_um,
						annual_op_expense: financials.annual_op_expense,
						op_expense_um: financials.op_expense_um,
						loan_asset_type: Collaterals.property_type,
						loan_usage_type: loan_usage_type[0].id,
						loan_type_id: loan_details.loan_type_id,
						loan_status_id: 1,
						loan_sub_status_id: null,
						loan_product_id: loan_details.loan_product_id,
						white_label_id: white_label_id,
						createdUserId: secondaryCorporateId || (req.user.usertype = "Sales" ? req.user.id : userid),
						application_ref: application_ref,
						RequestDate: formatted_date,
						modified_on: formatted_date,
						unsecured_type: unsecured_type,
						loan_orginitaor: loan_orginitaor,
						// sales_id: assigned_sales_user,
						cur_monthly_emi: loan_details.cur_monthly_emi,
						loan_summary: loan_summary,
						notification: 1,
						reportTat: JSON.stringify({data: [report_tat]})
					};
					if (post_data.loan_details.origin) {
						insert_loan_data.loan_origin = post_data.loan_details.origin;
					}

					if (
						assigned_sales_user !== "" &&
						assigned_sales_user !== null &&
						assigned_sales_user !== undefined &&
						assigned_sales_user !== 0
					) {
						insert_loan_data.sales_id = assigned_sales_user;
					}
					const create_loan_data = await Loanrequest.create(insert_loan_data).usingConnection(db).fetch();
					loanId = create_loan_data.id
					insert_loan_process = {
						user_id: req.user.id,
						loan: create_loan_data.id,
						bid: create_business_data.id,
						loanReject_count: loan_details.loanReject_count,
						emiBounce_count: loan_details.emiBounce_count,
						unsecuredLoan_count: loan_details.unsecuredLoan_count,
						GST_check: loan_details.GST_check,
						CIBIL_check: loan_details.CIBIL_check,
						createdUserId: req.user.id,
						created_on: formatted_date
						// modified_on: formatted_date,
					};
					if (insert_loan_process.user_id && insert_loan_process.loan && insert_loan_process.bid) {
						const create_loan_process_data = await LoanProcess.create(insert_loan_process).fetch();
					}

					if (!create_loan_data) {
						throw flaverr(
							"E_INVALID_NEW_RECORD",
							new Error("Some of the required parameters in loan are missing")
						);
					}
					if (
						Object.keys(businessaddress).length > 0 &&
						(businessDetails.business_type == 1 || businessDetails.business_type == 7)
					) {
						createDirectorData = await Director.create({
							business: create_business_data.id,
							demail: email,
							dfirstname: first_name || businessDetails.business_name,
							dlastname: last_name,
							dcontact: contact,
							ddob: businessDetails.ddob ? businessDetails.ddob.split("T")[0] : null,
							ints: formatted_date,
							dpancard: businesspancardnumber,
							crime_check: "No",
							address1: address1,
							address2: address2,
							locality: businessaddress.locality,
							city: businessaddress.city,
							state: businessaddress.state,
							pincode: businessaddress.pincode.toString(),
							type_name: "Applicant",
							isApplicant: 1
						}).fetch();
					}
					const director_data_len = Object.keys(director_details).length,
						dir_details = Object.values(director_details),
						dir_details_array = [];
					if (director_data_len > 0) {
						i = 0;
						dir_details.forEach((dir_element) => {
							dir_email_key = "demail" + i;
							dir_firstname_key = "dfirstname" + i;
							dir_last_name_key = "dlastname" + i;
							dir_phone_key = "dcontact" + i;
							dir_dob_key = "ddob" + i;
							dir_cibil_remarks = "dcibil_remarks" + i;
							dir_pan = "dpancard" + i;
							dir_crime_check = "crime_check" + i;
							dir_type_name = "type_name" + i;
							if (
								dir_element[dir_email_key] ||
								dir_element[dir_firstname_key] ||
								dir_element[dir_last_name_key] ||
								dir_element[dir_phone_key] ||
								dir_element[dir_dob_key] ||
								dir_element[dir_cibil_remarks] ||
								dir_element[dir_pan] ||
								dir_element[dir_crime_check]
							) {
								insert_dir_data = {
									business: create_business_data.id,
									demail: dir_element[dir_email_key],
									dfirstname: dir_element[dir_firstname_key],
									dlastname: dir_element[dir_last_name_key],
									dcontact: dir_element[dir_phone_key],
									ddob: dir_element[dir_dob_key],
									cibil_remarks: dir_element[dir_cibil_remarks],
									ints: formatted_date,
									dpancard: dir_element[dir_pan],
									crime_check: dir_element[dir_crime_check],
									type_name: dir_element[dir_type_name]
								};
								dir_details_array.push(insert_dir_data);
							}
							i++;
						});
						createDirectorData = await Director.createEach(dir_details_array).fetch();
					}
					let kyc_doc_len = Object.keys(document.KYC).length,
						finance_doc_len = Object.keys(document.financials).length,
						other_doc_len = Object.keys(document.others).length;
					function copys3file(srcuserid, destuserid, file, bucket, s3_region) {
						const AWS = require("aws-sdk");
						const s3 = new AWS.S3({
							accessKeyId: sails.config.aws.key,
							secretAccessKey: sails.config.aws.secret,
							region: s3_region
						}),
							params = {
								CopySource: bucket + "/users_" + srcuserid + "/" + file,
								Bucket: bucket,
								Key: "users_" + destuserid + "/" + file,
								MetadataDirective: "REPLACE"
							};
						s3.copyObject(params, (err, data) => { });
					}
					if (kyc_doc_len > 0) {
						for (j = 0; j > kyc_doc_len; j++) {
							if (loggedin_user != userid) {
								copys3file(loggedin_user, userid, Object.values(document.KYC)[j].fd, bucket, s3_region);
							}
							var createKycDocData = await LoanDocument.create({
								loan: create_loan_data.id,
								business_id: create_business_data.id,
								user_id: userid,
								doctype: Object.values(document.KYC)[j].value,
								doc_name: Object.values(document.KYC)[j].fd,
								uploaded_doc_name: Object.values(document.KYC)[j].filename,
								original_doc_name: Object.values(document.KYC)[j].filename,
								size: Object.values(document.KYC)[j].size,
								ints: formatted_date,
								on_upd: formatted_date,
								upload_method_type: "newui",
								document_password: Object.values(document.KYC)[j].password
							}).usingConnection(db);
						}
					}

					if (finance_doc_len > 0) {
						for (a = 0; a < finance_doc_len; a++) {
							if (loggedin_user != userid) {
								copys3file(
									loggedin_user,
									userid,
									Object.values(document.financials)[a].fd,
									bucket,
									s3_region
								);
							}
							var createKycDocData = await LoanDocument.create({
								loan: create_loan_data.id,
								business_id: create_business_data.id,
								user_id: userid,
								doctype: Object.values(document.financials)[a].value,
								doc_name: Object.values(document.financials)[a].fd,
								uploaded_doc_name: Object.values(document.financials)[a].filename,
								original_doc_name: Object.values(document.financials)[a].filename,
								size: Object.values(document.financials)[a].size,
								ints: formatted_date,
								on_upd: formatted_date,
								upload_method_type: "newui",
								document_password: Object.values(document.financials)[a].password
							}).usingConnection(db);
						}
					}

					if (other_doc_len > 0) {
						for (b = 0; b < other_doc_len; b++) {
							if (loggedin_user != userid) {
								copys3file(
									loggedin_user,
									userid,
									Object.values(document.others)[b].fd,
									bucket,
									s3_region
								);
							}
							var createKycDocData = await LoanDocument.create({
								loan: create_loan_data.id,
								business_id: create_business_data.id,
								user_id: userid,
								doctype: Object.values(document.others)[b].value,
								doc_name: Object.values(document.others)[b].fd,
								uploaded_doc_name: Object.values(document.others)[b].filename,
								original_doc_name: Object.values(document.others)[b].filename,
								size: Object.values(document.others)[b].size,
								ints: formatted_date,
								on_upd: formatted_date,
								upload_method_type: "newui",
								document_password: Object.values(document.others)[b].password
							}).usingConnection(db);
						}
					}
					const logService = await sails.helpers.logtrackservice(
						req,
						"loan/createloan",
						create_loan_data.id,
						"loanrequest"
					);
					return proceed(null, create_loan_data);
				})
				.intercept("E_INVALID_NEW_RECORD", () => "badRequest Some of the required params are missing"),
			smsUserDetails = await UsersRd.findOne({
				where: {
					id: create_business_data.userid
				},
				select: ["name", "contact"]
			});
		if (post_data.loan_details.origin === "NC_Biz_Web") {
			const data = {},
				playstoreurl = sails.config.playstoreurl;
			sms = `Hi ${smsUserDetails.name}, you have successfully created your loan application with Namaste Biz. Download our app to check your application status. ${playstoreurl}`;
			const triggersms = await sails.helpers.smsTrigger(sms, smsUserDetails.contact, data);
		}

		if (loanstatus) {
			res.json({
				status: "ok",
				message: "Loan Created",
				data: loanstatus,
				business: create_business_data,
				businessaddress: create_business_address_data,
				director: createDirectorData
			});
		}
		await sails.helpers.greenChannelCondition(loanId, req.user.loggedInWhiteLabelID)
	},

	/**
	 * * edit loan
		* @description :: edit loan
		* @api {post} /loan/edit/ editLoan
		* @apiName Editloan
		* @apiGroup Loans
		* @apiExample Example usage:
		* curl -i localhost:1337/loan/edit/
		*
		* @apiParam {Object} Business_details
		* @apiParam {String} Business_details.first_name
		* @apiParam {String} Business_details.last_name
		* @apiParam {Number} Business_details.business_type
		* @apiParam {Number} Business_details.business_industry_type
		* @apiParam {String} Business_details.business_name
		* @apiParam {String} Business_details.business_started
		* @apiParam {String} Business_details.gstin
		* @apiParam {String} Business_details.business_email
		* @apiParam {String} Business_details.contact
		* @apiParam {String} Business_details.bd_upload
		* @apiParam {String} Business_details.businessid

		* @apiParam {Object} businessaddress
		* @apiParam {Object} businessaddress.address_0
		* @apiParam {Number} businessaddress.address_0.address1
		* @apiParam {String} businessaddress.address_0.address2
		* @apiParam {String} businessaddress.address_0.city
		* @apiParam {String} businessaddress.address_0.state
		* @apiParam {String} businessaddress.address_0.line1
		* @apiParam {String} businessaddress.address_0.line2
		* @apiParam {Number} businessaddress.address_0.id
		* @apiParam {Number} businessaddress.address_0.aid
		* @apiParam {Object} businessaddress.address_0.loan_details
		* @apiParam {String} businessaddress.address_0.loan_details.application_ref
		* @apiParam {String} businessaddress.address_0.loan_details.loan_amount_um
		* @apiParam {Number} businessaddress.address_0.loan_details.loan_amount
		* @apiParam {Number} businessaddress.address_0.loan_details.loan_type_id
		* @apiParam {Number} businessaddress.address_0.loan_details.loan_usage_type_id
		* @apiParam {Number} businessaddress.address_0.loan_details.loanId
		* @apiParam {String} businessaddress.address_0.loan_details.loan_product_id
		* @apiParam {String} businessaddress.address_0.loan_details.loan_request_type
		* @apiParam {Number} businessaddress.address_0.loan_details.white_label_id
		* @apiParam {String} businessaddress.address_0.loan_details.loanReject_count (non mandatory)
		* @apiParam {String} businessaddress.address_0.loan_details.emiBounce_count (non mandatory)
		* @apiParam {String} businessaddress.address_0.loan_details.unsecuredLoan_count (non mandatory)
		* @apiParam {String} businessaddress.address_0.loan_details.GST_check (non mandatory)
		* @apiParam {String} businessaddress.address_0.loan_details.CIBIL_check (non mandatory)
		*
		* @apiParam {Object} financials
		* @apiParam {Number} financials.annual_op_expense
		* @apiParam {String} financials.op_expense_um
		* @apiParam {Number} financials.annual_revenue
		* @apiParam {String} financials.revenue_um
		* @apiParam {String} financials.fs_upload
		*
		* @apiParam {Object} Collaterals
		* @apiParam {Number} Collaterals.property_type
		* @apiParam {Number} Collaterals.assets_value
		* @apiParam {String} Collaterals.unsecured_type
		* @apiParam {String} Collaterals.assets_value_um
		* @apiParam {String} financials.cl_upload
		*
		* @apiParam {Object} director_details
		* @apiParam {Object} director_details.director_0
		* @apiParam {String} director_details.director_0.dfirstname
		* @apiParam {String} director_details.director_0.dlastname
		* @apiParam {String} director_details.director_0.demail
		* @apiParam {String} director_details.director_0.dcontact
		* @apiParam {Number} director_details.director_0.id
		*
		* @apiParam {Object} documents
		* @apiParam {Object[]} documents.KYC
		* @apiParam {Object[]} documents.others
		* @apiParam {Object[]} documents.financials

		* @apiSuccess {String} status ok.
		* @apiSuccess {String} message Loan Updated for (LoanID).
		* @apiSuccess {Object} data
		* @apiSuccess {Number} data.id id.
		* @apiSuccess {Number} data.loan_request_type loan request type.
		* @apiSuccess {String} data.loan_ref_id loan reference id.
		* @apiSuccess {Number} data.loan_amount  loan amount.
		* @apiSuccess {String} data.loan_amount_um Lakhs/Crore.
		* @apiSuccess {Number} data.applied_tenure
		* @apiSuccess {String} data.assets_value assets value.
		* @apiSuccess {String} data.assets_value_um Lakhs/Crore.
		* @apiSuccess {Number} data.annual_revenue annual revenue.
		* @apiSuccess {String} data.revenue_um Lakhs/Crore.
		* @apiSuccess {Number} data.annual_op_expense
		* @apiSuccess {String} data.op_expense_um
		* @apiSuccess {String} data.cur_monthly_emi current monthly emi.
		* @apiSuccess {String} data.loan_type_id loan type id.
		* @apiSuccess {String} data.loan_rating_id loan rating id.
		* @apiSuccess {Number} data.loan_status_id loan status id.
		* @apiSuccess {String} data.loan_sub_status_id loan sub status id.
		* @apiSuccess {String} data.remarks remarks.
		* @apiSuccess {String} data.assigned_uw
		* @apiSuccess {String} data.assigned_date assigned date.
		* @apiSuccess {String} data.osv_doc
		* @apiSuccess {String} data.modified_on modification date and time.
		* @apiSuccess {String} data.RequestDate Request Date.
		* @apiSuccess {String} data.loan_summary loan summary.
		* @apiSuccess {Number} data.loan_product_id loan product id.
		* @apiSuccess {String} data.notification notification.
		* @apiSuccess {String} data.white_label_id white label id.
		* @apiSuccess {Number} data.sales_id sales id.
		* @apiSuccess {String} data.loan_originator loan originator.
		* @apiSuccess {String} data.doc_collector document collector.
		* @apiSuccess {String} data.remark_history remark history.
		* @apiSuccess {String} data.application_ref application reference.
		* @apiSuccess {String} data.document_upload document upload.
		* @apiSuccess {Number} data.business_id business id.
		* @apiSuccess {Number} data.loan_asset_type loan asset type id.
		* @apiSuccess {Number} data.loan_usage_type loan usage type id.
		* @apiSuccess {String} data.createdUserId  created user id.
		* @apiSuccess {Number} data.loan_orginitaor
		* @apiSuccess {String} data.unsecured_type .
		* @apiSuccess {Object} business business details.
		* @apiSuccess {Object} businessaddress business address details.
		* @apiSuccess {Object[]} director director details.
	*/

	editLoan: async function (req, res) {
		const flaverr = require("flaverr");

		const post_data = req.allParams(),
			userid = req.user.id;
		let businessDetails = post_data.Business_details,
			loan_details = post_data.loan_details,
			businessaddress = post_data.businessaddress,
			financials = post_data.financials,
			Collaterals = post_data.Collaterals,
			director_details = post_data.director_details,
			document = post_data.documents,
			businessid = businessDetails.businessid,
			loanId = loan_details.loanId;

		if (!businessid || businessid == 0 || !loanId || loanId == 0) {
			return res.badRequest({exception: "Invalid parameters!!"});
		}

		const business_name = businessDetails.business_name,
			first_name =
				businessDetails.first_name == undefined ||
					businessDetails.first_name == "" ||
					businessDetails.first_name == null
					? ""
					: businessDetails.first_name,
			last_name =
				businessDetails.last_name == undefined ||
					businessDetails.last_name == "" ||
					businessDetails.last_name == null
					? ""
					: businessDetails.last_name,
			email = businessDetails.business_email,
			contact =
				businessDetails.contact == undefined || businessDetails.contact == "" || businessDetails.contact == null
					? ""
					: businessDetails.contact,
			business_type = businessDetails.business_type,
			business_industry_type = businessDetails.business_industry_type,
			business_started = businessDetails.business_started,
			businesspancardnumber =
				businessDetails.businesspancardnumber == undefined ||
					businessDetails.businesspancardnumber == "" ||
					businessDetails.businesspancardnumber == null
					? "NAMAS9948K"
					: businessDetails.businesspancardnumber,
			gstin = businessDetails.gstin == undefined ? "" : businessDetails.gstin,
			about_business =
				businessDetails.about_business == undefined || businessDetails.about_business == ""
					? ""
					: businessDetails.about_business,
			emp_count = businessDetails.empcount == undefined ? 1 : businessDetails.empcount;

		businessstartdate = business_started;

		edit_business_details = {
			businessname: business_name,
			first_name: first_name,
			last_name: last_name,
			business_email: email,
			contactno: contact,
			businesstype: business_type,
			businessindustry: business_industry_type,
			businessstartdate: businessstartdate,
			businesspancardnumber: businesspancardnumber,
			gstin: gstin,
			about_business: about_business,
			emp_count: emp_count
		};

		const application_ref =
			loan_details.application_ref == undefined || loan_details.application_ref == null
				? null
				: loan_details.application_ref,
			loan_amount = loan_details.loan_amount,
			loan_amount_um = loan_details.loan_amount_um,
			loan_tenure = loan_details.loan_tenure || loan_details.applied_tenure,
			loan_type_id = loan_details.loan_type_id,
			loan_usage_type_id = loan_details.loan_usage_type_id,
			loan_product_id = loan_details.loan_product_id,
			property_type = Collaterals.property_type,
			assets_value = Collaterals.assets_value,
			assets_value_um = Collaterals.assets_value_um,
			unsecured_type = Collaterals.unsecured_type == undefined ? null : Collaterals.unsecured_type,
			annual_op_expense = financials.annual_op_expense || loan_details.annual_op_expense,
			op_expense_um = financials.op_expense_um || loan_details.op_expense_um,
			gross_revenue = financials.annual_revenue || loan_details.annual_turn_over,
			gross_revenue_um = financials.revenue_um || loan_details.revenue_um;

		edit_loan_details = {
			loan_amount: loan_amount,
			loan_amount_um: loan_amount_um,
			applied_tenure: loan_tenure,
			assets_value: assets_value,
			assets_value_um: assets_value_um,
			annual_revenue: gross_revenue,
			revenue_um: gross_revenue_um,
			annual_op_expense: annual_op_expense,
			op_expense_um: op_expense_um,
			loan_asset_type: property_type,
			loan_usage_type: loan_usage_type_id,
			loan_type_id: loan_type_id,
			loan_product_id: loan_product_id,
			application_ref: application_ref,
			unsecured_type: unsecured_type
		};

		edit_loan_process = {
			loanReject_count: loan_details.loanReject_count,
			emiBounce_count: loan_details.emiBounce_count,
			unsecuredLoan_count: loan_details.unsecuredLoan_count,
			GST_check: loan_details.GST_check,
			CIBIL_check: loan_details.CIBIL_check,
			modifiedUserId: req.user.id,
			modified_on: await sails.helpers.dateTime()
		};
		const updateLoanStatus = await sails
			.getDatastore("mysql_namastecredit_write")
			.transaction(async (db, proceed) => {
				const update_business_data = await Business.update({id: businessid})
					.set(edit_business_details)
					.usingConnection(db)
					.fetch();
				if (!update_business_data) {
					throw flaverr(
						"E_INVALID_NEW_RECORD",
						new Error("Some of the required parameters in business are missing")
					);
				}
				let applicantData = await DirectorRd.findOne({business: businessid, isApplicant: 1, status: "active"});
				if (applicantData) {
					let dirObj = ({marital_status, residence_status, country_residence, aadhaar, equifaxscore} =
						businessDetails);
					dirObj.id = applicantData.id;
					director_details.director_0 = dirObj;
				}
				const businessaddress_len = Object.keys(businessaddress).length,
					businessAddressDetails = Object.values(businessaddress);

				if (businessaddress_len > 0) {
					businessAddressDetails.forEach(async (businessAdd_element) => {
						// let aid = businessAdd_element.aid;
						const address1 = businessAdd_element.line1 == undefined ? null : businessAdd_element.line1,
							address2 = businessAdd_element.line2 == undefined ? null : businessAdd_element.line2,
							locality = businessAdd_element.locality,
							city = businessAdd_element.city,
							state = businessAdd_element.state,
							pincode = businessAdd_element.pincode;

						if (!businessAdd_element.id || businessAdd_element.id == 0) {
							insert_businessaddress_data = {
								bid: businessid,
								aid: businessAdd_element.aid,
								line1: address1,
								line2: address2,
								locality: locality,
								city: city,
								state: state,
								pincode: pincode.toString()
							};
							const create_businessaddress_data = await Businessaddress.create(
								insert_businessaddress_data
							)
								.usingConnection(db)
								.fetch();
						} else {
							edit_businessaddress_data = {
								aid: businessAdd_element.aid,
								line1: address1,
								line2: address2,
								locality: locality,
								city: city,
								state: state,
								pincode: pincode.toString()
							};
							const update_businessaddress_data = await Businessaddress.update({
								id: businessAdd_element.id,
								bid: businessid
							})
								.set(edit_businessaddress_data)
								.usingConnection(db);
						}
					});
				}

				const update_loan_data = await Loanrequest.update({id: loanId})
					.set(edit_loan_details)
					.usingConnection(db)
					.fetch();

				if (!update_loan_data) {
					throw flaverr(
						"E_INVALID_NEW_RECORD",
						new Error("Some of the required parameters in loan are missing")
					);
				}
				if (loan_details.asset_id) {
					fetchAssetData = await LoanAssetsRd.findOne({
						id: loan_details.asset_id,
						business_id: businessid,
						loan_id: loanId
					});
					if (fetchAssetData) {
						const result = loan_details.collateral.map(({asset_id, ...rest}) => ({...rest}));
						loan_json = Collaterals.loan_json
							? Collaterals.loan_json
							: loan_details.collateral
								? result
								: fetchAssetData.loan_json;
						assetData = await LoanAssets.update({
							id: fetchAssetData.id,
							business_id: businessid,
							loan_id: loanId
						})
							.set({loan_json: loan_json})
							.fetch();
					}
				}
				const update_loan_process = await LoanProcess.update({loan: loanId, bid: businessid})
					.set(edit_loan_process)
					.fetch(),
					director_data_len = Object.keys(director_details).length,
					dir_details = Object.values(director_details);
				console.log(director_data_len);
				if (director_data_len > 0) {
					dir_details.forEach(async (dir_element) => {
						if (!dir_element.id || dir_element.id == 0) {
							if (
								!(!dir_element.demail || dir_element.demail == "" || dir_element.demail == null) &&
								!(
									!dir_element.dfirstname ||
									dir_element.dfirstname == "" ||
									dir_element.dfirstname == null
								) &&
								!(
									!dir_element.dlastname ||
									dir_element.dlastname == "" ||
									dir_element.dlastname == null
								) &&
								!(!dir_element.dcontact || dir_element.dcontact == "" || dir_element.dcontact == null)
							) {
								insert_dir_data = {
									business: businessid,
									demail: dir_element.demail,
									dfirstname: dir_element.dfirstname,
									dlastname: dir_element.dlastname,
									dcontact: dir_element.dcontact,
									ddob: dir_element.ddob || dir_element.dob,
									dpancard: dir_element.dpancard,
									address1: dir_element.address1,
									address2: dir_element.address2,
									locality: dir_element.locality,
									city: dir_element.city,
									state: dir_element.statel,
									pincode: dir_element.pincode,
									dcibil_score: dir_element.equifaxscore || 0,
									daadhaar: dir_element.aadhaar,
									residence_status: dir_element.residence_status,
									country_residence: dir_element.country_residence,
									marital_status: dir_element.marital_status
								};
								const createDirectorData = await Director.create(insert_dir_data).usingConnection(db);
								if ((dir_element.grossIncome || dir_element.netMonthlyIncome) && createDirectorData) {
									const income_data = await IncomeData.create({
										business_id: createDirectorData.business,
										director_id: createDirectorData.id,
										gross_income: dir_element.grossIncome,
										net_monthly_income: dir_element.netMonthlyIncome
									}).fetch();
								}
							}
						} else {
							edit_director_data = {
								demail: dir_element.demail,
								dfirstname: dir_element.dfirstname,
								dlastname: dir_element.dlastname,
								dcontact: dir_element.dcontact,
								ddob: dir_element.ddob || dir_element.dob,
								dpancard: dir_element.dpancard,
								address1: dir_element.address1,
								address2: dir_element.address2,
								locality: dir_element.locality,
								city: dir_element.city,
								state: dir_element.statel,
								pincode: dir_element.pincode,
								dcibil_score: dir_element.equifaxscore || 0,
								daadhaar: dir_element.aadhaar,
								residence_status: dir_element.residence_status,
								country_residence: dir_element.country_residence,
								marital_status: dir_element.marital_status
							};
							const update_Director_data = await Director.update({id: dir_element.id})
								.set(edit_director_data)
								.usingConnection(db);
							const update_income_data = await IncomeData.update({id: dir_element.income_id})
								.set({
									gross_income: dir_element.grossIncome,
									net_monthly_income: dir_element.netMonthlyIncome
								})
								.fetch();
						}
					});
				}

				function document_update(documents, loan_id, business_id, user_id) {
					const dateTime = require("node-datetime");
					const dt = dateTime.create(),
						formatted_date = dt.format("Y-m-d H:M:S").toString();

					documents.forEach(async (docElement) => {
						doc_data = {
							loan: loan_id,
							business_id: business_id,
							user_id: user_id,
							doctype: docElement.value,
							doc_name: docElement.fd,
							uploaded_doc_name: docElement.filename,
							original_doc_name: docElement.filename,
							size: docElement.size,
							on_upd: formatted_date,
							upload_method_type: "newui",
							uploaded_by: docElement.uploaded_by ? docElement.uploaded_by : req.user.id,
							directorId: docElement.director_id || 0
						};
						if (docElement.password) {
							doc_data.document_password = docElement.password;
						}
						if (!docElement.id || docElement.id == null || docElement.id == 0) {
							doc_data.ints = formatted_date;
							const createDocData = await LoanDocument.create(doc_data).fetch();
						} else {
							const editDocData = await LoanDocument.update({id: docElement.id}).set(doc_data).fetch();
						}
					});
				}

				const kyc_doc_len = Object.keys(document.KYC).length,
					finance_doc_len = Object.keys(document.financials).length,
					other_doc_len = Object.keys(document.others).length;

				if (kyc_doc_len > 0) {
					document_update(document.KYC, loanId, businessid, update_business_data[0].userid);
				}
				if (finance_doc_len > 0) {
					document_update(document.financials, loanId, businessid, update_business_data[0].userid);
				}
				if (other_doc_len > 0) {
					document_update(document.others, loanId, businessid, update_business_data[0].userid);
				}
				// var logService = await sails.helpers.logtrackservice(req, 'loan/edit', update_loan_data.id, 'loanrequest');
				return proceed(null, update_loan_data);
			})
			.intercept("E_INVALID_NEW_RECORD", () => "badRequest Some of the required params are missing");

		await sails.helpers.greenChannelCondition(loanId, req.user.loggedInWhiteLabelID)
		if (updateLoanStatus) {
			const logService = await sails.helpers.logtrackservice(
				req,
				"loan/edit",
				updateLoanStatus[0].id,
				"loanrequest"
			);
			return res.json({
				status: "ok",
				message: "Loan Updated for " + updateLoanStatus[0].loan_ref_id,
				data: updateLoanStatus
			});
		}
	},

	show: function (req, res, next) {
		LoanrequestRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	edit: function (req, res, next) {
		LoanrequestRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	update: function (req, res, next) {
		Loanrequest.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loanrequest/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Loanrequest.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loanrequest");
		});
	},
	sendSms: async function (req, res, next) {
		const {loan_ref_id} = req.allParams();

		let white_label_id = null;
		const loanRequest = await LoanrequestRd.findOne({loan_ref_id}).select(["white_label_id"]);
		if (loanRequest) {
			white_label_id = loanRequest.white_label_id
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.LOAN_NOT_FOUND
			});
		}
		const method = 'POST',
			headers = {
				"Content-Type": "application/json"
			};
		const body = {
			email: req.user.email,
			loan_ref_id,
			wlid: white_label_id
		}
		const sendEmailResponse = await sails.helpers.sailstrigger(sails.config.federal_integration_url + '/sendFedMessage', JSON.stringify(body), headers, method);

		if (sendEmailResponse && JSON.parse(sendEmailResponse).status == "nok") {
			return res.badRequest({
				status: "nok",
				data: JSON.parse(sendEmailResponse).message
			});
		} else {
			jsonParsedData = JSON.parse(sendEmailResponse);
			return res.ok({
				status: "ok",
				data: jsonParsedData.data
			});
		}
	},
	sendEmail: async function (req, res, next) {
		const {loan_ref_id} = req.allParams();
		let white_label_id = null;
		const loanRequest = await LoanrequestRd.findOne({loan_ref_id}).select(["white_label_id"]);
		if (loanRequest) {
			white_label_id = loanRequest.white_label_id
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.LOAN_NOT_FOUND
			});
		}
		const method = 'POST',
			headers = {
				"Content-Type": "application/json"
			};
		const body = {
			email: req.user.email,
			loan_ref_id,
			wlid: white_label_id
		}
		const sendEmailResponse = await sails.helpers.sailstrigger(sails.config.federal_integration_url + '/sendFedMail', JSON.stringify(body), headers, method);

		if (sendEmailResponse && JSON.parse(sendEmailResponse).status == "nok") {
			return res.badRequest({
				status: "nok",
				data: JSON.parse(sendEmailResponse).message
			});
		} else {
			jsonParsedData = JSON.parse(sendEmailResponse);
			return res.ok({
				status: "ok",
				data: jsonParsedData.data
			});
		}
	},
	/**
	 * @description :: case creation
	 * @api {post} /casecreation create case
	 * @apiName create case
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/casecreation
	 *
	 * @apiParam {Object} Business_details
	 * @apiParam {String} Business_details.business_name business name.
	 * @apiParam {Number} Business_details.business_type business type.
	 * @apiParam {String} Business_details.business_email business email(non mandatory).
	 * @apiParam {Number} Business_details.contact contact(non mandatory).
	 * @apiParam {String} Business_details.crime_check.
	 * @apiParam {Object} loan_details
	 * @apiParam {Number} loan_details.loan_asset_type_id loan asset type id.
	 * @apiParam {String} loan_details.loan_product_id loan product id.
	 * @apiParam {String} loan_details.loan_request_type loan request type.
	 * @apiParam {Number} loan_details.loan_type_id loan type id.
	 * @apiParam {Number} loan_details.loan_usage_type_id loan usage type id.
	 * @apiParam {String} loan_details.white_label_id white label id(encrypted white_label_id).
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message "case created successfuly.
	 * @apiSuccess {Object} case_id created case reference id and loan id.
	 *
	 */
	case_creation: async function (req, res) {
		const {loan_details, Business_details} = req.body.allParams;

		let {
			first_name,
			last_name,
			contact,
			business_email,
			empcount,
			business_type: business,
			business_name: businessname
		} = Business_details;

		params = Business_details;
		fields = ["businessname", "business"];
		missing = await reqParams.fn(params, fields);

		const userid = req.user.id,
			condition = {};
		if (!businessname || !business) {
			sails.config.res.missingFieldsBusinessDetails.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFieldsBusinessDetails);
		}

		let {
			loan_product_id,
			white_label_id,
			case_priority,
			remarks,
			application_no
		} = loan_details;

		params = loan_details;
		fields = ["loan_product_id", "white_label_id"];
		missing = await reqParams.fn(params, fields);

		if (!loan_product_id || !white_label_id) {
			sails.config.res.missingFieldsBusinessDetails.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFieldsLoanDetails);
		}
		console.log(white_label_id.length);
		if (white_label_id.length === 32) {
			white_label_id = await sails.helpers.whitelabelDecryption(white_label_id);

			if (!white_label_id || white_label_id === "error") {
				return res.badRequest(sails.config.res.invalidWhiteLabel);
			}
		}
		const datetime = await sails.helpers.dateTime(),
			loanProducts = await LoanProductsRd.findOne({
				id: loan_product_id,
				business_type_id: {
					contains: business
				}
			});
		if (!loanProducts) {
			return res.badRequest(sails.config.res.productMapping);
		}

		const loan_request_type = loanProducts.loan_request_type,
			loan_asset_type = loanProducts.loan_asset_type_id.split(",")[0],
			loan_usage_type = loanProducts.loan_usage_type_id.split(",")[0],
			loan_type_id = loanProducts.loan_type_id.split(",")[0],
			loan_summary = `${loanProducts.product} - requested to create case for business ${businessname} for ${req.user.usertype}`;

		if (application_no) {
			condition.application_ref = application_no;
		} else {
			const businessDetails = await BusinessRd.find({
				white_label_id,
				businessname,
				businesstype: business
			}).limit(1);
			if (businessDetails && businessDetails.length > 0) {
				condition.business_id = businessDetails[0].id;
			}
		}

		if (Object.keys(condition).length > 0 && Object.values(condition).length > 0) {
			const loanRequestDetails = await LoanrequestRd.find(condition).limit(1);
			if (loanRequestDetails && loanRequestDetails.length > 0) {
				sails.config.res.valueExist.business = condition;
				sails.config.res.valueExist.case_id = loanRequestDetails[0].loan_ref_id;
				return res.badRequest(sails.config.res.valueExist);
			}
		}

		businesspancardnumber = Business_details.businesspancardnumber || "NAMAS9948K";
		first_name = first_name || "";
		last_name = last_name || "";
		empcount = empcount || 1;
		contact = contact || req.user.contact;
		business_email = business_email || req.user.email;
		let crimeCheck = Business_details.crime_check;
		crimeCheck ? crimeCheck : (crimeCheck = "No");

		const business_data = {
			businessname,
			userid,
			first_name,
			last_name,
			businessstartdate: datetime,
			business_email,
			contactno: contact,
			businesstype: business,
			businesspancardnumber,
			white_label_id,
			empcount,
			businessindustry: "20",
			ints: datetime,
			crime_check: crimeCheck
		};

		const businessInfo = await Business.create(business_data).fetch();
		console.log("--------------------------------------------------", businessInfo);
		if (!businessInfo) {
			return res.badRequest({
				status: "nok",
				message: "case not created"
			})
		}
		const report_tat = {
			assignedUserId: req.user.id,
			assignedBy: req.user.name,
			dateTime: datetime,
			previous_status: "",
			current_status: "Application",
			message: "",
			count: 1
		};
		const loan_data = {
			loan_request_type,
			business_id: businessInfo.id,
			loan_ref_id: await sails.helpers.commonHelper(),
			loan_asset_type,
			loan_usage_type,
			loan_type_id,
			loan_product_id,
			white_label_id,
			createdUserId: userid,
			RequestDate: datetime,
			loan_summary,
			loan_origin: sails.config.loanOrigin.loan_origin,
			modified_on: datetime,
			notification: 1,
			application_ref: application_no,
			reportTat: JSON.stringify({data: [report_tat]})
		};
		loan_data.default_emails = {
			email: loan_details.emails
		};
		if (case_priority) {
			loan_data.case_priority = case_priority;
		}
		if (remarks) {
			history = {};
			ncStatus_history = {
				loan_status_id: 1,
				loan_sub_status_id: null,
				createdUserId: req.user.id,
				case_remarks: remarks
			};
			const datetime = await sails.helpers.dateTime();
			history[datetime] = ncStatus_history;
			loan_data.nc_status_history = loan_data.remarks = JSON.stringify(history);
		}
		console.log("lkxosahdchdihcihcius--------------------------------------", loan_data);
		const newLoanRequest = await Loanrequest.create(loan_data).fetch();
		console.log("🚀 ~ newLoanRequest:---------------------------------------------------", newLoanRequest)
		console.log("+++++++++++++++++++++++++++++++++++++", newLoanRequest);
		if (newLoanRequest) {
			const {id, business_id, loan_ref_id, application_ref} = newLoanRequest;

			if ((id && !business_id) || (id && business_id == 0)) {
				Loanrequest.update({id}).set({business_id: businessInfo.id});
			}
			dataRes = {
				status: "ok",
				message: "case created successfuly",
				DES_CODE: "NC08",
				case_id: loan_ref_id
			};
			if (application_ref) {
				dataRes.application_no = application_ref;
			}
			if (white_label_id == sails.config.fedfina_whitelabel_id) {
				const encryptData = await sails.helpers.crypto.with({
					action: "aesCbc256Encrypt",
					data: dataRes
				});
				res.ok({ecryptesResponse: encryptData});
			} else return res.ok(dataRes);
		} else {
			return res.badRequest({status: "nok", message: "error"})
		}
	},

	/**
	 * @description :: case creation for ui/ux
	 * @api {post} /casecreation_uiux create case for ui/ux
	 * @apiName create case for uiux
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/casecreation_uiux
	 *
	 * @apiParam {Object} Business_details
	 * @apiParam {String} Business_details.business_name business name.
	 * @apiParam {Number} Business_details.business_type business type.
	 * @apiParam {String} Business_details.business_email business email(non mandatory).
	 * @apiParam {Number} Business_details.contact contact(non mandatory).
	 * @apiParam {Object} loan_details
	 * @apiParam {String} loan_details.loan_product_id loan product id.
	 * @apiParam {String} loan_details.white_label_id white label id(encrypted white_label_id).
	 * @apiParam {Number} loan_details.branchId non-mandatory.
	 * @apiParam {Object[]} document
	 * @apiParam {Object[]} document.KYC
	 * @apiParam {String} document.KYC.fd
	 * @apiParam {Number} document.KYC.size
	 * @apiParam {String} document.KYC.type
	 * @apiParam {String} document.KYC.filename
	 * @apiParam {String} document.KYC.status
	 * @apiParam {String} document.KYC.field
	 * @apiParam {String} document.KYC.value

	 * @apiParam {Object[]} document.others
	 * @apiParam {String} document.others.fd
	 * @apiParam {Number} document.others.size
	 * @apiParam {String} document.others.type
	 * @apiParam {String} document.others.filename
	 * @apiParam {String} document.others.status
	 * @apiParam {String} document.others.field
	 * @apiParam {String} document.others.value
	 *
	 * @apiParam {Object[]} document.financials
	 * @apiParam {String} document.financials.fd
	 * @apiParam {Number} document.financials.size
	 * @apiParam {String} document.financials.type
	 * @apiParam {String} document.financials.filename
	 * @apiParam {String} document.financials.status
	 * @apiParam {String} document.financials.field
	 * @apiParam {String} document.financials.value

	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message case created successfuly.
	 * @apiSuccess {String} DES_CODE
	 * @apiSuccess {Object} data
	 * @apiSuccess {Object} data.loan_details created case details.
	 * @apiSuccess {Object} data.loan_document loan document details.
	 *
	 */
	case_creation_uiux: async function (req, res) {
		const {loan_details, Business_details, businessaddress, documents, director_details, user_id, auth_details} =
			req.allParams();

		let {
			business_id,
			businesspancardnumber,
			first_name,
			last_name,
			contact,
			business_email,
			empcount,
			business_type: business,
			business_name: businessname,
			crime_check,
			corporateid,
			gstin,
			businessstartdate,
			corporateId,
			equifaxscore,
			aadhaar,
			dob,
			ddob,
			dl,
			voter,
			passport,
			residence_status,
			country_residence,
			marital_status,
			father_name
		} = Business_details;

		const userid = user_id || req.user.id;
		userData = await UsersRd.findOne({id: userid}).select(["parent_id", "branch_id"]);
		let corporateData;
		if (corporateId) {
			corporateData = await UserCorporateMappingRd.findOne({userid: corporateId});
		}

		params = Business_details;
		fields = ["businessname", "business"];
		missing = await reqParams.fn(params, fields);

		if (!businessname || !business) {
			sails.config.res.missingFieldsBusinessDetails.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFieldsBusinessDetails);
		}

		let {
			loan_request_type,
			loan_asset_type_id,
			loan_usage_type_id,
			loan_type_id,
			loan_product_id,
			white_label_id,
			origin,
			case_priority,
			application_ref,
			branchId,
			loan_amount,
			applied_tenure,
			annual_turn_over,
			annual_op_expense, // pat
			loan_amount_um,
			revenue_um,
			op_expense_um,
			salesValue,
			constructionValue,
			constructionArchitectValue,
			landValue,
			outstanding,
			loanType,
			collateral,
			marketValue,
			village_name,
			survey_no,
			property_type,
			sq_feet,
			email,
			bank,
			bankName
		} = loan_details;

		params = loan_details;
		fields = ["loan_product_id", "white_label_id"];
		missing = await reqParams.fn(params, fields);

		if (!loan_product_id || !white_label_id) {
			sails.config.res.missingFieldsLoanDetails.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFieldsLoanDetails);
		}

		white_label_id = await sails.helpers.whitelabelDecryption(white_label_id);

		if (!white_label_id || white_label_id === "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}

		const whiteLabel = await WhiteLabelSolution.findOne({id: white_label_id}),
			datetime = await sails.helpers.dateTime(),
			timeNow = await sails.helpers.indianDateTime();

		let loan_summary, address1, address2, city, state, locality, pincode;
		const data = {};
		let documentArray = [],
			director = [];
		let directorData;

		LoanProductsRd.find({
			id: loan_product_id,
			business_type_id: {
				contains: business
			}
		})
			.limit(1)
			.then((loanProducts) => {
				if (loanProducts.length === 0) {
					throw new Error("productMapping");
				}

				loan_request_type = loan_request_type || loanProducts[0].loan_request_type;
				loan_asset_type_id = loan_asset_type_id || loanProducts[0].loan_asset_type_id.split(",")[0];
				loan_usage_type_id = loan_usage_type_id || loanProducts[0].loan_usage_type_id.split(",")[0];
				loan_type_id = loan_type_id || loanProducts[0].loan_type_id.split(",")[0];
				loan_summary = `${loanProducts[0].product} - requested to create case for business ${businessname} for ${req.user.usertype}`;
				if (business_id) {
					businessaddress[0] = businessaddress[1] ? {} : businessaddress[0];
					return Business.findOne({id: business_id});
				} else {
					businesspancardnumber = businesspancardnumber || "NAMAS9948K";
					first_name = first_name || "";
					last_name = last_name || "";
					empcount = empcount || 1;
					contact = contact || req.user.contact;
					business_email = business_email || req.user.email;

					const business_data = {
						businessname,
						userid: corporateId && corporateData ? corporateData.created_by : req.user.id,
						first_name,
						last_name,
						businessstartdate: businessstartdate ? businessstartdate : datetime,
						business_email,
						contactno: contact,
						businesstype: business,
						businesspancardnumber,
						gstin: gstin || "",
						white_label_id,
						empcount,
						businessindustry: "20",
						ints: datetime,
						crime_check: crime_check ? crime_check : "No",
						corporateid: corporateid ? corporateid : ""
					};

					return Business.create(business_data).fetch();
				}
			})
			.then(async (businessInfo) => {
				// update ekyc_response_table for given kyc key.
				let whereCondition = [];
				if (dl) whereCondition.push(dl);
				if (voter) whereCondition.push(voter);
				if (passport) whereCondition.push(passport);
				if (aadhaar) whereCondition.push(aadhaar);

				let updateKyc = await EkycResponse.update({
					kyc_key: whereCondition,
					ref_id: null,
					verification_response: {"!=": null}
				}).set({
					ref_id: businessInfo.id
				});
				if (Object.prototype.toString.call(businessaddress) === "[object Object]") {
					if (
						businessaddress &&
						Object.keys(businessaddress).length > 0 &&
						Object.values(businessaddress).length > 0
					) {
						if (
							!businessaddress.locality ||
							!businessaddress.city ||
							!businessaddress.state ||
							!businessaddress.pincode
						) {
							return res.badRequest(sails.config.res.missingFieldsBusinessAddress);
						}
						address1 = businessaddress.line1 ? businessaddress.line1 : null;
						address2 = businessaddress.line2 ? businessaddress.line2 : null;
						locality = businessaddress.locality ? businessaddress.locality : "";
						city = businessaddress.city ? businessaddress.city : "";
						state = businessaddress.state ? businessaddress.state : "";
						pincode = businessaddress.pincode ? businessaddress.pincode.toString() : "";
						create_business_address_data = await Businessaddress.create({
							bid: businessInfo.id,
							aid: businessaddress.aid ? businessaddress.aid : 1, // present = 1, parmanent = 2
							line1: businessaddress.line1 ? businessaddress.line1 : null,
							line2: businessaddress.line2 ? businessaddress.line2 : null,
							locality: businessaddress.locality ? businessaddress.locality : "",
							city: businessaddress.city ? businessaddress.city : "",
							state: businessaddress.state ? businessaddress.state : "",
							pincode: businessaddress.pincode ? businessaddress.pincode.toString() : "",
							address_status: businessaddress.officeType ? businessaddress.officeType : "",
							residential_type: businessaddress.residentialType ? businessaddress.residentialType : "",
							ints: await sails.helpers.dateTime()
						}).fetch();
					}
				} else {
					if (Object.prototype.toString.call(businessaddress) === "[object Array]") {
						if (businessaddress[0] && businessaddress[0].line1) {
							const businessaddress0 = businessaddress[0],
								create_business_address_data1 = await Businessaddress.create({
									bid: businessInfo.id,
									aid: businessaddress0.aid ? businessaddress0.aid : 1, // present = 1, parmanent = 2
									line1: businessaddress0.line1 ? businessaddress0.line1 : null,
									line2: businessaddress0.line2 ? businessaddress0.line2 : null,
									locality: businessaddress0.locality ? businessaddress0.locality : "",
									city: businessaddress0.city ? businessaddress0.city : "",
									state: businessaddress0.state ? businessaddress0.state : "",
									pincode: businessaddress0.pincode ? businessaddress0.pincode.toString() : "",
									address_status: businessaddress0.officeType ? businessaddress0.officeType : "",
									residential_type: businessaddress0.residentialType
										? businessaddress0.residentialType
										: "",
									ints: await sails.helpers.dateTime()
								}).fetch();
							address1 = businessaddress0.line1 ? businessaddress0.line1 : null;
							address2 = businessaddress0.line2 ? businessaddress0.line2 : null;
							locality = businessaddress0.locality ? businessaddress0.locality : "";
							city = businessaddress0.city ? businessaddress0.city : "";
							state = businessaddress0.state ? businessaddress0.state : "";
							pincode = businessaddress0.pincode ? businessaddress0.pincode.toString() : "";
						}
						if (businessaddress[1] && businessaddress[1].line1) {
							const businessaddress1 = businessaddress[1],
								create_business_address_data2 = await Businessaddress.create({
									bid: businessInfo.id,
									aid: businessaddress1.aid ? businessaddress1.aid : 1, // present = 1, parmanent = 2
									line1: businessaddress1.line1 ? businessaddress1.line1 : null,
									line2: businessaddress1.line2 ? businessaddress1.line2 : null,
									locality: businessaddress1.locality ? businessaddress1.locality : "",
									city: businessaddress1.city ? businessaddress1.city : "",
									state: businessaddress1.state ? businessaddress1.state : "",
									pincode: businessaddress1.pincode ? businessaddress1.pincode.toString() : "",
									address_status: businessaddress1.officeType ? businessaddress1.officeType : "",
									residential_type: businessaddress1.residentialType
										? businessaddress1.residentialType
										: "",
									ints: await sails.helpers.dateTime()
								}).fetch();
						}
					}
				}
				const report_tat = {
					assignedUserId: req.user.id,
					assignedBy: req.user.name,
					dateTime: datetime,
					previous_status: "",
					current_status: "Application",
					message: "",
					count: 1
				};
				const loan_data = {
					loan_request_type: loan_request_type || 1,
					business_id: businessInfo.id,
					loan_amount,
					loan_amount_um,
					applied_tenure,
					annual_revenue: +annual_turn_over || null, // gross income
					annual_op_expense: +annual_op_expense || null, // net income
					revenue_um,
					op_expense_um,
					loan_ref_id: await sails.helpers.commonHelper(),
					loan_asset_type: loan_asset_type_id || 1,
					loan_usage_type: loan_usage_type_id || 1,
					loan_type_id: loan_type_id || 1,
					loan_product_id,
					white_label_id,
					createdUserId: corporateId && corporateData ? corporateData.userid : userid,
					RequestDate: datetime,
					loan_summary,
					loan_origin: origin ? origin : sails.config.loanOrigin.loan_origin,
					modified_on: datetime,
					notification: 1,
					application_ref: application_ref
						? application_ref
						: await sails.helpers.applicationRef(white_label_id),
					branch_id: branchId || userData.branch_id || null,
					sales_id: userData && userData.parent_id !== 0 && userData.parent_id ? userData.parent_id : userid,
					reportTat: JSON.stringify({data: [report_tat]})
				};
				if (case_priority) {
					loan_data.case_priority = case_priority;
				}
				if (auth_details && Object.keys(auth_details).length > 0) {
					loan_data.authentication_data = JSON.stringify({auth_data: auth_details});
				}
				if (email && white_label_id == 48) {
					emailList = ["icici.hfcl@Datamatics.com"];
					emailList.push(email);
					loan_data.default_emails = {
						email: emailList
					};
				}

				return Loanrequest.create(loan_data).fetch();
			})
			.then(async (newLoanRequest) => {
				await sails.helpers.greenChannelCondition(newLoanRequest.id, req.user.loggedInWhiteLabelID)
				const {id, business_id} = newLoanRequest,
					businessUpdate = await Business.update({id: business_id})
						.set({notification_v: 1, notification_purpose_v: 1})
						.fetch();
				// insert into loanAssets
				if (
					((loanType || (collateral && collateral.length > 0)) &&
						(businessaddress || businessaddress.length > 0)) ||
					(property_type && village_name && survey_no && sq_feet)
				) {
					loan_json = {};
					if (constructionValue) {
						loan_json["constructionValue"] = constructionValue;
						loan_json["landValue"] = landValue;
					}
					if (outstanding) {
						loan_json["outstanding"] = outstanding;
					}
					if (bankName || bank) {
						loan_json["bank"] = bank;
						loan_json["bankName"] = bankName ? bankName : bank;
						loan_json["outstanding"] = outstanding;
					}
					if (constructionArchitectValue) {
						loan_json["constructionArchitectValue"] = constructionArchitectValue;
					}
					if (salesValue) {
						loan_json["salesValue"] = salesValue;
					}
					addressData = loan_details.address || {};
					pincode = businessaddress.pincode
						? businessaddress.pincode
						: businessaddress[0].pincode
							? businessaddress[0].pincode
							: businessaddress[1].pincode;
					loanAssetsData = {
						business_id: business_id,
						loan_id: id,
						property_type: property_type || "Owned",
						loan_asset_type_id: loan_asset_type_id || 2,
						owned_type: "Paid_Off",
						ints: datetime,
						loan_type: loanType ? loanType : "Collateral",
						loan_json: loanType ? loan_json : collateral,
						pincode: addressData.pincode || pincode,
						village_name: village_name,
						survey_no: survey_no,
						sq_feet: sq_feet,
						address1: addressData.address1,
						address2: addressData.address2,
						flat_no: addressData.address3,
						city: addressData.city,
						state: addressData.state
					};
					if (marketValue) {
						loanAssetsData["value"] = marketValue;
						loanAssetsData["value_Vehicle"] = marketValue;
					}
					try {
						assetData = await LoanAssets.create(loanAssetsData).fetch();
					} catch (e) {
						return res.serverError(e);
					}
				}

				if ((id && !business_id) || (id && business_id == 0)) {
					Loanrequest.update({id}).set({business_id: businessInfo.id});
				}
				if (sails.config.businessTypesForDirector.find((element) => element == business)) {
					dirData = {
						business: business_id,
						demail: business_email || null,
						dfirstname: first_name || businessname,
						dlastname: last_name || null,
						dcontact: contact || null,
						ddob: dob ? dob : ddob ? ddob.split("T")[0] : null,
						dpancard: businesspancardnumber || null,
						crime_check: crime_check || "No",
						ints: datetime,
						address1: address1,
						address2: address2,
						locality: locality,
						city: city,
						state: state,
						pincode: pincode,
						type_name: "Applicant",
						isApplicant: 1,
						dcibil_score: equifaxscore || null,
						daadhaar: aadhaar || null,
						dpassport: passport || null,
						dvoterid: voter || null,
						ddlNumber: dl || null,
						income_type: loan_request_type == 1 ? "business" : "salaried",
						residence_status: residence_status || "NULL",
						country_residence: country_residence || null,
						marital_status: marital_status || "NULL",
						father_name: father_name || "NULL"
					};
					director.push(dirData);
				}
				data.loan_details = newLoanRequest;
				const director_data_len = Object.keys(director_details).length,
					dir_details = Object.values(director_details);
				if (director_data_len > 0 && dir_details.length > 0) {
					i = 0;
					for await (let element of dir_details) {
						if (
							element["demail"] ||
							element["dfirstname"] ||
							element["dlastname"] ||
							element["dcontact"] ||
							element["ddob"] ||
							element["dpancard"] ||
							element["ddin_no"] ||
							element["father_name"] ||
							element["demail" + i] ||
							element["dfirstname" + i] ||
							element["dlastname" + i] ||
							element["dcontact" + i] ||
							element["ddob" + i] ||
							element["dpancard" + i] ||
							element["dtype_name" + i] ||
							element["daadhaar" + i] ||
							element["father_name" + i]
						) {
							let income_data = element["income_type"] || element["income_type" + i];
							insert_dir_data = {
								business: business_id,
								demail: element["demail"] || element["demail" + i],
								dfirstname: element["dfirstname"] || element["dfirstname" + i],
								dlastname: element["dlastname"] || element["dlastname" + i],
								dcontact: element["dcontact"] || element["dcontact" + i],
								ddob: element["ddob"]
									? element["ddob"].split("T")[0]
									: element["ddob" + i]
										? element["ddob" + i].split("T")[0]
										: null,
								cibil_remarks: element["dcibil_remarks"] || element["dcibil_remarks" + i],
								dpancard: element["dpancard"] || element["dpancard" + i],
								crime_check: element["crime_check"] || element["crime_check" + i] || "No",
								ints: datetime,
								address1: element["address1"] || element["address1" + i] || null,
								address2: element["address2"] || element["address2" + i] || null,
								locality: element["locality"] || element["locality" + i] || null,
								city: element["city"] || element["city" + i] || null,
								state: element["state"] || element["state" + i] || null,
								pincode: element["pincode"] || element["pincode" + i] || null,
								type_name: element["type_name"] || element["type_name" + i],
								ddin_no: element["ddin_no"] || element["ddin_no" + i] || null,
								professionId: element["professionId"] || element["professionId" + i] || null,
								daadhaar: element["daadhaar"] || element["daadhaar" + i] || null,
								income_type: income_data == "7" ? "salaried" : income_data == "1" ? "business" : "NULL",
								residence_status:
									element["residence_status"] || element["residence_status" + i] || "NULL",
								country_residence:
									element["country_residence"] || element["country_residence" + i] || null,
								marital_status: element["marital_status"] || element["marital_status" + i] || "NULL",
								father_name: element["father_name"] || element["father_name" + i]
							};
							if (
								(!equifaxscore &&
									element["dfirstname"] &&
									element["dlastname"] &&
									element["address1"] &&
									element["city"] &&
									element["ddob"] &&
									element["dpancard"] &&
									element["state"] &&
									element["father_name"] &&
									element["pincode"]) ||
								(element["dfirstname" + i] &&
									element["dlastname" + i] &&
									element["address1" + i] &&
									element["city" + i] &&
									element["ddob" + i] &&
									element["dpancard" + i] &&
									element["state" + i] &&
									element["pincode" + i] &&
									element["father_name" + i])
							) {
								const body = {
									requestFrom: "nc",
									firstName: element["dfirstname"] || element["dfirstname" + i],
									lastName: element["dlastname"] || element["dlastname" + i],
									inquiryAddresses: {
										addressLine:
											element["address1"] ||
											element["address1" + i] + " " + element["address2"] ||
											element["address2" + i],
										city: element["city"] || element["city" + i],
										state: element["state"] || element["state" + i],
										postal: element["pincode"] || element["pincode" + i]
									},
									dob: element["ddob"],
									panNumber: element["dpancard"]
								},
									userId = req.user.id,
									bucket = whiteLabel.s3_name;
								try {
									equifax = await sails.helpers.equifax(body, userId, bucket);
									insert_dir_data.dcibil_score = equifax.cibilScore;

									const createEquifaxDocData = await LoanDocument.create({
										loan: id,
										business_id: business_id,
										user_id: userId,
										doctype: 236,
										doc_name: equifax.uploadDoc.key,
										uploaded_doc_name: equifax.uploadDoc.key,
										ints: datetime,
										on_upd: datetime
									}).fetch();
									documentArray.push(createEquifaxDocData);
								} catch (err) { }
							}
							director.push(insert_dir_data);
						}

						i++;
					}
				}
				directorData = await Director.createEach(director).fetch();

				if (documents) {
					const kyc_doc_len = documents.KYC,
						finance_doc_len = documents.financials,
						other_doc_len = documents.others;
					const loanDocRecords = [];
					if (kyc_doc_len.length > 0) {
						for (i = 0; i < kyc_doc_len.length; i++) {
							//const createKycDocData = await LoanDocument.create({
							loanDocRecords.push({
								loan: id,
								business_id: business_id,
								user_id: req.user.id,
								doctype: kyc_doc_len[i].value,
								doc_name: kyc_doc_len[i].fd,
								uploaded_doc_name: kyc_doc_len[i].filename,
								original_doc_name: kyc_doc_len[i].filename,
								size: kyc_doc_len[i].size,
								document_password: kyc_doc_len[i].password ? kyc_doc_len[i].password : null,
								ints: datetime,
								upload_method_type: "newui",
								on_upd: datetime,
								uploaded_by: kyc_doc_len[i].uploaded_by ? kyc_doc_len[i].uploaded_by : req.user.id,
								directorId: kyc_doc_len[i].director_id ? kyc_doc_len[i].director_id : 0
							});
							//documentArray.push(createKycDocData);
						}
					}

					if (finance_doc_len.length > 0) {
						for (j = 0; j < finance_doc_len.length; j++) {
							//const createFinancialDocData = await LoanDocument.create({
							loanDocRecords.push({
								loan: id,
								business_id: business_id,
								user_id: req.user.id,
								doctype: finance_doc_len[j].value,
								doc_name: finance_doc_len[j].fd,
								uploaded_doc_name: finance_doc_len[j].filename,
								original_doc_name: finance_doc_len[j].filename,
								size: finance_doc_len[j].size,
								document_password: finance_doc_len[j].password ? finance_doc_len[j].password : null,
								ints: datetime,
								upload_method_type: "newui",
								on_upd: datetime,
								uploaded_by: finance_doc_len[j].uploaded_by
									? finance_doc_len[j].uploaded_by
									: req.user.id,
								directorId: finance_doc_len[j].director_id ? finance_doc_len[j].director_id : 0
							});
							//documentArray.push(createFinancialDocData);
						}
					}

					if (other_doc_len.length > 0) {
						for (k = 0; k < other_doc_len.length; k++) {
							//const createOtherDocData = await LoanDocument.create({
							loanDocRecords.push({
								loan: id,
								business_id: business_id,
								user_id: req.user.id,
								doctype: other_doc_len[k].value,
								doc_name: other_doc_len[k].fd,
								uploaded_doc_name: other_doc_len[k].filename,
								original_doc_name: other_doc_len[k].filename,
								size: other_doc_len[k].size,
								document_password: other_doc_len[k].password ? other_doc_len[k].password : null,
								ints: datetime,
								upload_method_type: "newui",
								on_upd: datetime,
								uploaded_by: other_doc_len[k].uploaded_by ? other_doc_len[k].uploaded_by : req.user.id,
								directorId: other_doc_len[k].director_id ? other_doc_len[k].director_id : 0
							});
							//.fetch();
							//documentArray.push(createOtherDocData);
						}
					}

					let createdLoanDocRecords = await LoanDocument.createEach(loanDocRecords).fetch();
					documentArray = [...documentArray, ...createdLoanDocRecords];
					return documentArray;
				}
			})
			.then(async (result) => {
				data.loan_document = documentArray;
				data.directorData = directorData;
				sails.config.successRes.createdData.data = data;
				res.ok(sails.config.successRes.createdData);
				const qMessages = [];
				result.forEach((elm) => {
					const message = {
						loan_id: elm.loan,
						business_id: elm.business_id,
						director_id: elm.directorId,
						doc_id: elm.id,
						parent_doc_id: "",
						doc_type: elm.doctype,
						user_id: elm.user_id,
						doc_name: elm.doc_name,
						uploaded_doc_name: elm.uploaded_doc_name,
						original_doc_name: elm.original_doc_name,
						s3bucket: whiteLabel.s3_name,
						region: whiteLabel.s3_region,
						cloud: "aws",
						white_label_id,
						isLoanDocument: true
					};
					qMessages.push(message);
				});

				await sails.helpers.insertIntoQ(sails.config.qNames.GENERIC_Q, qMessages);
			})
			.catch((err) => {
				switch (err.message) {
					case "productMapping":
						return res.badRequest(sails.config.res.productMapping);
					default:
						throw err;
				}
			});
	},
	/**
	 * @api {post} legalReportList/
	 * @apiName legalReportList
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/legalReportList
	 * curl -i localhost:1337/legalReportList
	 *
	 * @apiParam {Number} loan_id loan id
	 * @apiSuccess {String} status
	 * @apiSuccess {String} message
	 * @apiSuccess {Object[]} legalList
	 * @apiSuccess {Object[]} extractList
	 */

	legalReportList: async (req, res) => {
		const loanId = req.param("loan_id");

		if (loanId) {
			const legalReportList = await LoanDocumentRd.find({
				loan: loanId,
				doctype: sails.config.docUpload.uploadId,
				status: sails.config.doc_type.status
			}),
				extractReportList = await LoanDocumentRd.find({
					loan: loanId,
					doctype: sails.config.docUpload.downloadId,
					status: sails.config.doc_type.status
				});
			return res.ok({
				status: "ok",
				message: "Legal reports list",
				legalList: legalReportList,
				extractList: extractReportList
			});
		} else {
			return res.send({status: "nok", message: "Required param missing"});
		}
	},

	caseCreationWithDirectoryAndSubsidiaryDetails: async function (req, res) {
		const {loan_details, Business_details, entity_type, subsidiary_details, director_details} = req.body.allParams;
		let {
			businesspancardnumber,
			first_name,
			last_name,
			contact,
			business_email,
			empcount,
			business_type: business,
			business_name: businessname,
			crime_check
		} = Business_details;

		const userid = req.user.id,
			condition = {};

		params = Business_details;
		fields = ["businessname", "business"];
		missing = await reqParams.fn(params, fields);

		if (!businessname || !business) {
			sails.config.res.missingFieldsBusinessDetails.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFieldsBusinessDetails);
		}

		let {loan_processing_type, loan_product_id, white_label_id, origin, case_priority, application_no} =
			loan_details;

		params = loan_details;
		fields = ["loan_product_id", "white_label_id"];
		missing = await reqParams.fn(params, fields);

		if (!loan_product_id || !white_label_id) {
			sails.config.res.missingFieldsBusinessDetails.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFieldsLoanDetails);
		}

		if (entity_type && entity_type !== "Individual" && entity_type !== "Business") {
			sails.config.res.missingFields.message = "You entered the wrong entity type";
			return res.badRequest(sails.config.res.missingFields);
		}
		white_label_id = await sails.helpers.whitelabelDecryption(white_label_id);

		if (!white_label_id || white_label_id === "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}

		let directorData, subsidiaryData;

		let datetime = await sails.helpers.dateTime();

		let loan_summary, loan_type_id, loan_request_type, loan_asset_type_id, loan_usage_type_id;
		const director = [];

		LoanProductsRd.find({
			id: loan_product_id,
			business_type_id: {
				contains: business
			}
		})
			.limit(1)
			.then(async (loanProducts) => {
				if (loanProducts.length === 0) {
					throw new Error("productMapping");
				}

				loan_request_type = loan_details.loan_request_type || loanProducts[0].loan_request_type;
				loan_asset_type_id =
					loan_details.loan_asset_type_id || loanProducts[0].loan_asset_type_id.split(",")[0];
				loan_usage_type_id =
					loan_details.loan_usage_type_id || loanProducts[0].loan_usage_type_id.split(",")[0];
				loanTypeId = loanProducts[0].loan_type_id.split(",");
				const loanTypeData = await LoantypeRd.find({
					id: loanTypeId,
					loanType: {
						endsWith: loan_processing_type
					}
				});
				if (loanTypeData && loanTypeData.length > 1) {
					loanTypeData.forEach((element) => {
						const loanTypeDataSplit = element.loanType.split(" ");
						_.each(loanTypeDataSplit, (value) => {
							const loanTypeDataArray = loanProducts[0].payment_structure.includes(value);
							if (loanTypeDataArray == true) {
								loan_type_id = element.id;
							}
						});
					});
				} else if (loanTypeData && loanTypeData.length > 0) {
					loan_type_id = loanTypeData[0].id;
				} else {
					loan_type_id = loanTypeId[0];
				}
				loan_summary = `${loanProducts[0].product} - requested to create case for business ${businessname} for ${req.user.usertype}`;
				if (application_no) {
					condition.application_ref = application_no;
				} else {
					return BusinessRd.find({white_label_id, businessname, business_email, businesstype: business})
						.sort("ints DESC")
						.limit(1);
				}
			})
			.then((businessDetails) => {
				if (businessDetails && businessDetails.length > 0) {
					condition.business_id = businessDetails[0].id;
				}
				if (Object.keys(condition).length > 0 && Object.values(condition).length > 0) {
					return LoanrequestRd.find(condition).limit(1);
				}
			})
			.then((loanRequestDetails) => {
				if (loanRequestDetails && loanRequestDetails.length > 0) {
					sails.config.res.valueExist.case_id = loanRequestDetails[0].loan_ref_id;
					throw new Error("valueExist");
				}
				businesspancardnumber = businesspancardnumber || "NAMAS9948K";
				first_name = first_name || "";
				last_name = last_name || "";
				empcount = empcount || 1;
				contact = contact || req.user.contact;
				business_email = business_email || req.user.email;

				const business_data = {
					businessname,
					userid,
					first_name,
					last_name,
					businessstartdate: datetime,
					business_email,
					contactno: contact,
					businesstype: business,
					businesspancardnumber,
					white_label_id,
					empcount,
					businessindustry: "20",
					ints: datetime,
					crime_check: crime_check ? crime_check : "No"
				};

				return Business.create(business_data).fetch();
			})
			.then(async (businessInfo) => {
				const loan_data = {
					loan_request_type: loan_request_type,
					business_id: businessInfo.id,
					loan_ref_id: await sails.helpers.commonHelper(),
					loan_asset_type: loan_asset_type_id,
					loan_usage_type: loan_usage_type_id,
					loan_type_id: loan_type_id,
					loan_product_id,
					white_label_id,
					createdUserId: userid,
					RequestDate: datetime,
					loan_summary,
					loan_origin: origin ? origin : sails.config.loanOrigin.loan_origin,
					modified_on: datetime,
					notification: 1,
					application_ref: application_no
				};
				if (case_priority) {
					loan_data.case_priority = case_priority;
				}

				return Loanrequest.create(loan_data).fetch();
			})
			.then(async (newLoanRequest) => {
				const {id, business_id, loan_ref_id, application_ref} = newLoanRequest;
				if ((id && !business_id) || (id && business_id == 0)) {
					Loanrequest.update({id}).set({business_id: businessInfo.id});
				}
				if (entity_type == "Individual" && director_details) {
					const director_data_len = Object.keys(director_details).length,
						dir_details = Object.values(director_details);
					if (director_data_len > 0 && dir_details.length > 0) {
						i = 0;
						dir_details.forEach((element) => {
							if (
								element["demail" + i] ||
								element["dfirstname" + i] ||
								element["dlastname" + i] ||
								element["dcontact" + i] ||
								element["ddob" + i] ||
								element["dpancard" + i] ||
								element["dtype_name" + i]
							) {
								insert_dir_data = {
									business: business_id,
									demail: element["demail" + i],
									dfirstname: element["dfirstname" + i],
									dlastname: element["dlastname" + i],
									dcontact: element["dcontact" + i],
									ddob: element["ddob" + i],
									cibil_remarks: element["dcibil_remarks" + i],
									dpancard: element["dpancard" + i],
									crime_check: element["crime_check" + i] ? element["crime_check" + i] : "No",
									type_name: element["dtype_name" + i],
									ints: datetime
								};
								director.push(insert_dir_data);
							}
							i++;
						});
					}
					directorData = await Director.createEach(director).fetch();
				} else if (entity_type == "Business" && subsidiary_details) {
					if (
						!subsidiary_details.subsidiary_name ||
						!subsidiary_details.relative ||
						!subsidiary_details.pan_number
					) {
						return res.badRequest(sails.config.res.missingSubsidiaryData);
					}

					data = {
						parent_id: business_id,
						business_name: subsidiary_details.subsidiary_name,
						relation: subsidiary_details.relative,
						pan_number: subsidiary_details.pan_number
					};
					subsidiaryData = await BusinessMapping.create(data).fetch();
				}
				// if (!subsidiaryData && !directorData) {
				// 	return res.ok({
				// 		status: "nok",
				// 		message: "Case creation is failed due to inavlid subsidiary data or director data"
				// 	});
				// }

				sails.config.successRes.createdData.case_id = loan_ref_id;
				if (application_ref) {
					sails.config.successRes.createdData.application_no = application_ref;
				}
				return res.ok(sails.config.successRes.createdData);
			})
			.catch((err) => {
				switch (err.message) {
					case "productMapping":
						return res.badRequest(sails.config.res.productMapping);
					case "valueExist":
						return res.badRequest(sails.config.res.valueExist);
					default:
						throw err;
				}
			});
	},

	restore_previous_case: async function (req, res) {
		const {loan_id, comments} = req.allParams();
		const params = req.allParams();

		fields = ["loan_id", "comments"];
		missing = await reqParams.fn(params, fields);

		if (!loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loan_req_data = await LoanrequestRd.findOne({id: loan_id});
		if (!loan_req_data) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}

		const bankMappingDetails = await LoanBankMappingRd.find({loan_id}).sort("create_at DESC").limit(1);

		let obj = {
			white_label_id: loan_req_data.white_label_id
		};
		if (loan_req_data.loan_status_id) {
			obj.status1 = loan_req_data.loan_status_id;
		}

		loan_req_data.loan_sub_status_id ? (obj.status2 = loan_req_data.loan_sub_status_id) : null;

		if (bankMappingDetails[0]) {
			bankMappingDetails[0].loan_bank_status ? (obj.status3 = bankMappingDetails[0].loan_bank_status) : null;
			bankMappingDetails[0].loan_borrower_status
				? (obj.status4 = bankMappingDetails[0].loan_borrower_status)
				: null;
		}

		const nc_status_manage_data = await NcStatusManageRd.find(obj).select("name");
		parseData = JSON.parse(loan_req_data.nc_status_history);
		const Data = Object.values(parseData);
		const nc_status_history_data = Data[Data.length - 1];

		let reportObj = {
			white_label_id: loan_req_data.white_label_id
		};
		if (nc_status_history_data) {
			nc_status_history_data.loan_status_id ? (reportObj.status1 = nc_status_history_data.loan_status_id) : null;
			nc_status_history_data.loan_sub_status_id
				? (reportObj.status2 = nc_status_history_data.loan_sub_status_id)
				: null;
			nc_status_history_data.loan_bank_status
				? (reportObj.status3 = nc_status_history_data.loan_bank_status)
				: null;
			nc_status_history_data.loan_borrower_status
				? (reportObj.status4 = nc_status_history_data.loan_borrower_status)
				: null;
			if (nc_status_history_data.loan_status_id == 8 && nc_status_history_data.loan_sub_status_id == 12) {
				nc_status_history_data.remarks_val
					? (reportObj.uw_doc_status = nc_status_history_data.remarks_val)
					: null;
			}
		}
		const nc_status_manage_report_data = await NcStatusManageRd.find(reportObj).select("name");

		let datetime = await sails.helpers.dateTime();
		report_tat = await sails.helpers.reportTat(
			req.user.id,
			req.user.name,
			loan_id,
			nc_status_manage_report_data[0].name,
			nc_status_manage_data[0].name,
			comments
		);
		let update_loan_bank_mapping_data_status, update_loan_req_data_status, remarks;

		if (
			nc_status_history_data.loan_bank_status &&
			nc_status_history_data.loan_borrower_status &&
			bankMappingDetails[0]
		) {
			update_loan_bank_mapping_data_status = await LoanBankMapping.update({
				id: bankMappingDetails[0].id
			})
				.set({
					loan_bank_status: nc_status_history_data.loan_bank_status,
					loan_borrower_status: nc_status_history_data.loan_borrower_status,
					notification_status: "yes"
				})
				.fetch();
			if (update_loan_bank_mapping_data_status.length > 0) {
				const loanStatusWithLenderData = await LoanStatusWithLenderRd.find({
					select: ["id", "status"],
					where: {
						status: ["Comments"]
					}
				});
			}
		}

		let remarksObj = {
			userid: req.user.id,
			type: "comments",
			message: comments,
			restoredBy: req.user.name, //after disbursement release this key will be removed
			restored_by: req.user.name
		};
		datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
		if (loan_req_data.remarks) {
			parseData = JSON.parse(loan_req_data.remarks);
			parseData[datetime] = remarksObj;
			remarks = JSON.stringify(parseData);
		} else {
			history = {};
			history[datetime] = remarksObj;
			remarks = JSON.stringify(history);
		}

		if (
			(nc_status_history_data.loan_status_id && nc_status_history_data.loan_sub_status_id) ||
			nc_status_history_data.loan_status_id
		) {
			update_loan_req_data_status = await Loanrequest.update({id: loan_id})
				.set({
					loan_status_id: nc_status_history_data.loan_status_id,
					loan_sub_status_id: nc_status_history_data.loan_sub_status_id,
					remarks
				})
				.fetch();
		}

		if (update_loan_req_data_status.length > 0 || update_loan_bank_mapping_data_status.length > 0) {
			return res.ok({
				status: "ok",
				message: "loan moved to previous status"
			});
		}
	}
};
async function statutory_obligation_docIds(loan_id) {
	const doc_id = [], config_docId = sails.config.statutory_obligation_details,
		loanData = await LoanrequestRd.findOne({id: loan_id}).select("business_id"),
		businessData = await BusinessRd.findOne({id: loanData.business_id}).select("additional_info");
	if (businessData && businessData.additional_info) {
		const parseData = JSON.parse(businessData.additional_info);
		if (parseData && Object.keys(parseData).length > 0) {
			if (parseData.registration_under_shops_establishment_act == "Yes") doc_id.push(config_docId.registration_under_shops_establishment_act);
			if (parseData.drug_license == "Yes") doc_id.push(config_docId.drug_license);
			if (parseData.sales_tax_filed == "Yes") doc_id.push(config_docId.sales_tax_filed);
			if (parseData.income_tax_filed == "Yes") doc_id.push(config_docId.income_tax_filed);
			if (parseData.other_statutory_dues_outstanding == "yes") doc_id.push(config_docId.other_statutory_dues_outstanding);
		}
	}
	return doc_id;
}
