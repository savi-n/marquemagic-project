/**
 * LoanController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {aws} = require("../../config/env/development");
const crypto = require('crypto');

/**
 * @api {get} /viewloanlisting/ Loan listing
 * @apiName loan listing
 * @apiGroup Loans
 * @apiExample Example usage:
 * curl -i localhost:1337/viewloanlisting
 * curl -i localhost:1337/viewloanlisting?limit=&skip=1
 * curl -i localhost:1337/viewloanlisting?status1=2&status2=9&status3=12&status4=12
 * @apiSuccess {object} loan_details .
 * @apiSuccess {object[]} status_details
 * @apiSuccess {Number} status_details.id id.
 * @apiSuccess {String} status_details.name name.
 * @apiSuccess {Number} status_details.status1 status1.
 * @apiSuccess {Number} status_details.status2 status2.
 * @apiSuccess {Number} status_details.status3 status3.
 * @apiSuccess {Number} status_details.status4 status4.
 * @apiSuccess {Number} status_details.status5 status5.
 * @apiSuccess {Number} status_details.status6 status6.
 * @apiSuccess {String} status_details.white_label_id white label id.
 * @apiSuccess {Number} status_details.parent_flag parent flag.
 * @apiSuccess {Number} status_details.parent_id parent id.
 * @apiSuccess {String} status_details.status
 * @apiSuccess {String} status_details.execulded_users
 * @apiSuccess {Number} status_details.sort_by_id
 * @apiSuccess {String} status_details.exclude_user_ncdoc
 * @apiSuccess {String} status_details.caption
 * @apiDescription
 * pagination skip and limit params
 * To get the Loan status details
 * From LoanDetails object : Consider
 * loan_status_id:status1,
 * loan_sub_status_id:Status2,
 * loan_bank_status:Status3,
 * loan_borrower_status:Status4.
 * Need to Refer status_details object to get actual loan status where status1,status2,status3,status4 mathching on each object
 *To filter based on status:
 * @apiParam {Number} status1 status1(loan_status_id)
 * @apiParam {Number} status2 status2(loan_sub_status_id)
 * @apiParam {Number} status3 status3(loan_bank_status_id)
 * @apiParam {Number} status4 status4(loan_borrower_status_id)
 * @apiParam {Number} search search(you are search by loan ref,business name and business email)
 *
 */
const reqParams = require("../helpers/req-params");
const redis = require("ioredis");


const redis_conn = new redis.Cluster([{
	host: sails.config.redis.host,
	port: 6379
}, {
	host: sails.config.redis.host_sec,
	port: 6379
},
{
	host: sails.config.redis.host_third,
	port: 6379
}

]);
// if (sails.config.redis.host == "127.0.0.1") {
// const redis_conn = new redis.Redis({
// 	host: sails.config.redis.host,
// 	port: 6379
// });
// } else {
// 	const redis_conn = new redis.Cluster([
// 		{
// 			host: sails.config.redis.host,
// 			port: 6379
// 		},
// 		{
// 			host: sails.config.redis.host_sec,
// 			port: 6379
// 		}
// 	]);
// }

module.exports = {
	index: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		if (!req.param("status1") && !req.param("status2") && !req.param("status3") && !req.param("status4")) {
			return res.badRequest({
				status: "nok",
				message: "Status are mandatory."
			})
		}
		const reqData = {
			loan_status_id: req.param("status1"),
			loan_sub_status_id: req.param("status2"),
			loan_bank_status_id: req.param("status3"),
			loan_borrower_status_id: req.param("status4"),
			meeting_flag: req.param("status6"),
			page_count: req.param("skip") ? req.param("skip") : 0,
			limit_count: req.param("limit") ? req.param("limit") : 10,
		};
		const status_5 = req.param("status5"),
			page_count = req.param("skip") ? req.param("skip") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 10,
			lender_status_id = req.param("lender_status_id");

		const statusKey = [reqData.loan_status_id, reqData.loan_sub_status_id, reqData.loan_bank_status_id, reqData.loan_borrower_status_id, status_5, reqData.meeting_flag].filter(value => value !== undefined);
		const statusKey_result = statusKey.join('_');
		const statusMappings = sails.config.status_data_redis;
		const app_status = statusMappings[statusKey_result] || "";

		const userid = [],
			users_whitelabel = req.user.loggedInWhiteLabelID, //White label limiting for first
			whereCondition = {white_label_id: users_whitelabel}, //where conditions
			ncStatusCondition = {white_label_id: users_whitelabel},
			user_whitelabel = req.user.loggedInWhiteLabelID,
			userType = req.user.usertype,
			users = await UsersRd.find({
				// Get the list of things this user can see
				select: ["id"],
				where: {
					or: [
						{
							parent_id: req.user["id"]
						},
						{
							id: req.user["id"]
						}
					]
				}
			});
		_.each(users, (value) => {
			userid.push(value.id);
		});
		const whiteLabelData = await WhiteLabelSolutionRd.findOne({
			//Assignment type for selected whitelabel from solution table
			select: ["assignment_type"],
			where: {
				id: users_whitelabel
			}
		});
		if (req.user.usertype == "Bank") {
			if (req.user.is_lender_admin === 1) {
				const regionList = [],
					regionIds = await LenderRegionMappingRd.find({
						select: ["region_id"],
						where: {
							user_id: req.user.id
						}
					});
				//Admi user should have region wise loan listing
				_.each(regionIds, (value) => {
					regionList.push(value.region_id);
				});
				whereCondition.or = [{region_id: regionList}, {users: userid}];
			} else if (req.user.is_lender_manager == 1) {
				condition = whereCondition.or = [
					{users: userid},
					{sales_id: req.user.id},
					{createdUserId: req.user.id},
					{bank_emp_id: req.user.id},
					{city: req.user.city},
					{assigned_extended_ids: {contains: req.user.id}}
				];
			} else if (req.user.is_branch_manager === 1) {
				condition = whereCondition.or = [
					{users: userid},
					{sales_id: req.user.id},
					{createdUserId: req.user.id},
					{bank_emp_id: req.user.id},
					{branch_id: req.user.branch_id},
					{assigned_extended_ids: {contains: req.user.id}}
				];
			} else if (req.user.is_state_access === 1) {
				condition = whereCondition.or = [
					{users: userid},
					{sales_id: req.user.id},
					{createdUserId: req.user.id},
					{state: req.user.state},
					{assigned_extended_ids: {contains: req.user.id}}
				];
			} else {
				condition = whereCondition.or = [
					{users: userid},
					{sales_id: req.user.id},
					{createdUserId: req.user.id},
					{bank_emp_id: req.user.id},
					{assigned_extended_ids: {contains: req.user.id}}
				];
			}
		} else if (req.user.usertype == "Analyzer") {
			whereCondition.or = [{createdUserId: req.user.id}, {sales_id: req.user.id}];
		} else if (req.user.usertype == "Checker") {
			whereCondition.assigned_extended_ids = {contains: req.user.id};
		} else {
			whereCondition.users = userid;
		}

		if (reqData.loan_status_id) {
			whereCondition.loan_status_id = reqData.loan_status_id;
			ncStatusCondition.status1 = reqData.loan_status_id;
			if (reqData.loan_sub_status_id) {
				whereCondition.loan_sub_status_id = reqData.loan_sub_status_id;
				ncStatusCondition.status2 = reqData.loan_sub_status_id;
			}
		}
		if (
			reqData.loan_bank_status_id && reqData.loan_borrower_status_id
		) {
			whereCondition.loan_bank_status = reqData.loan_bank_status_id;
			whereCondition.loan_borrower_status = reqData.loan_borrower_status_id;
			whereCondition.bank_id = req.user.lender_id;
			ncStatusCondition.status3 = reqData.loan_bank_status_id;
			ncStatusCondition.status4 = reqData.loan_borrower_status_id;
			if (reqData.meeting_flag) {
				whereCondition.meeting_flag = reqData.meeting_flag.split(",");
				ncStatusCondition.status6 = reqData.meeting_flag.split(",");
			}
		}
		if (lender_status_id) {
			whereCondition.lender_status = lender_status_id;
		} else {
			whereCondition.lender_status = {"!=": 12};
		}


		const expirationInSeconds = sails.config.redis.common_expire;
		const ncStatusManage_condition = crypto.createHash('md5').update(users_whitelabel.toString()).digest('hex');
		const viewLoanManage_condition = crypto.createHash('md5').update(JSON.stringify(whereCondition) + JSON.stringify({page: page_count, limit: limit_count})).digest('hex');

		let view_loan_key = "view_loan_" + app_status + "_" + users_whitelabel.toString() + "_" + viewLoanManage_condition;
		let nc_status_key = "ncstatus:" + ncStatusManage_condition;

		let view_loan_data, v_ncStatusManage, viewLoanList = [];
		const result_loan_key = null; // await redis_conn.exists(view_loan_key);
		const result_status_key = null; // await redis_conn.exists(nc_status_key);
		if (result_loan_key || result_status_key) {
			try {
				if (result_loan_key === 1) {
					view_loan_data = await redis_conn.get(view_loan_key);
					view_loan_data = await JSON.parse(view_loan_data).data;
				} else {
					view_loan_data = await sails.helpers.viewLoanData(reqData, whereCondition);
					console.log("view_loan_dataview_loan_dataview_loan_dataview_loan_dataview_loan_dataview_loan_data", view_loan_data);
					if (!reqData.search || reqData.search == "") {
						b = await redis_conn.set(view_loan_key, JSON.stringify({"data": view_loan_data}));
						c = await redis_conn.expire(view_loan_key, expirationInSeconds);
					}
				}
				if (result_status_key === 1) {
					v_ncStatusManage = await redis_conn.get(nc_status_key);
					v_ncStatusManage = await JSON.parse(v_ncStatusManage).data;
				} else {
					v_ncStatusManage = await NcStatusManageRd.find({white_label_id: users_whitelabel});
					b = await redis_conn.set(nc_status_key, JSON.stringify({"data": v_ncStatusManage}));
					c = await redis_conn.expire(nc_status_key, expirationInSeconds);
				}
			} catch (error) {
				view_loan_data = await sails.helpers.viewLoanData(reqData, whereCondition);
				if (!reqData.search || reqData.search == "") {
					b = await redis_conn.set(view_loan_key, JSON.stringify({"data": view_loan_data}));
					c = await redis_conn.expire(view_loan_key, expirationInSeconds);
				}
				v_ncStatusManage = await NcStatusManageRd.find({white_label_id: users_whitelabel});
				b = await redis_conn.set(nc_status_key, JSON.stringify({"data": v_ncStatusManage}));
				c = await redis_conn.expire(nc_status_key, expirationInSeconds);
			}
		} else {
			view_loan_data = await sails.helpers.viewLoanData(reqData, whereCondition);
			v_ncStatusManage = await NcStatusManageRd.find({white_label_id: users_whitelabel});
		}


		logService = await sails.helpers.logtrackservice(req, "viewloanlisting", req.user.id, "view_loan");
		if (view_loan_data.length > 0) {
			for (let i = 0; i < view_loan_data.length; i++) {
				view_loan_data[i].loggedInUserId = req.user.id;
				view_loan_data[i].usertype = req.user.usertype;
				const loanDetails = await loanDetailsForView(view_loan_data[i], reqData.search);
				if (loanDetails && Object.keys(loanDetails).length > 0) {
					viewLoanList.push({...view_loan_data[i], ...loanDetails});
				}
			}
			return res.ok({
				status: "ok",
				loan_details: viewLoanList,
				status_details: v_ncStatusManage
			});
		} else {
			return res.ok({
				status: "ok",
				loan_details: [],
				status_details: v_ncStatusManage
			});
		}
	},
	/**
	 * @api {post} /pendingCount/ pending doc count
	 * @apiName pending doc list count
	 * @apiGroup Loans
	 * @apiExample Example usage:
	 * curl -i localhost:1337/pendingCount
	 * @apiParam {Number} product_id product_id (Mandatory)
	 * @apiParam {Number} businessType businessType(Mandatory)
	 * @apiParam {Array} loan_documents loan documents of that loan(Mandatory)
	 * @apiParam {Number} loan_id loan id for particular loan(Mandatory)
	 * @apiSuccess {String} status
	 * @apiSuccess {String} message
	 * @apiSuccess {Object} data
	 * @apiSuccess {Number} data.pendingDoc_count
	 */
	pendingDocCount: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");

		(product_id = req.body.product_id),
			(businessType = req.body.businessType),
			(loan_document = req.body.loan_documents),
			(loanId = req.body.loan_id),
			(loanRef = req.body.loan_ref_id),
			(tempKeys = {});
		if (typeof loan_document === "string") loan_documents = JSON.parse(loan_document);
		else loan_documents = loan_document;
		user_whitelabel = req.user.loggedInWhiteLabelID;
		inputData = [user_whitelabel, product_id, businessType];
		if (product_id && businessType && loan_documents && loanId && loanRef) {
			if (loan_documents.length > 0) {
				const loanDocIdCheck = await LoanDocumentRd.find({
					id: loan_documents[0].id,
					loan: loanId
				});
				if (loanDocIdCheck.length == 0) {
					return res.ok({
						status: "nok",
						message: sails.config.msgConstants.loanIdMismatch,
						data: {}
					});
				}
			}

			const query =
				"select dt.doc_type_id,dt.doc_type,dt.name,dt.priority,dt.doc_detail from doctype dt,loan_product_document_mapping lp where dt.doc_type_id=lp.doctype_id and dt.status='active' and dt.priority in ('100','1','300') and lp.loan_product_id=$2 and find_in_set($3,lp.businesstype_id) and  dt.white_label_id in (0,$1)";
			await myDBStore.sendNativeQuery(query, inputData, function (err, rawResult) {
				if (err) return res.badRequest({status: "nok", error: err});
				const result = rawResult.rows,
					checkList = JSON.parse(JSON.stringify(result));
				if (product_id && product_id !== null && loan_documents.length > 0) {
					const documents = JSON.parse(JSON.stringify(loan_documents));
					documents.forEach((obj) => {
						tempKeys[obj.doctype] = documents[obj.doctype];
					});
					const checkListLength = checkList.length,
						documentsLength = Object.keys(tempKeys).length;
					var pending_doc_count = checkListLength - documentsLength;
				} else {
					pending_doc_count = checkList.length;
				}

				return res.ok({
					status: "ok",
					message: "pending count",
					data: {
						loan_ref_id: loanRef,
						pendingDoc_count: pending_doc_count
					}
				});
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing,
				data: {}
			});
		}
	},

	getLoanDetails: async function (req, res) {
		const id = req.param("id");
		white_label_id = req.param("white_label_id");
		if (!id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const panData = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
		mobileNo = /^\d{10}$/;
		loanReq = /^[A-Za-z]{4}\d{8}$/;
		const bid = [],
			condition = {};
		let ncStatusData;
		if (white_label_id) {
			ncStatusData = await NcStatusManageRd.find({white_label_id});
			condition.white_label_id = white_label_id;
		}
		if (loanReq.test(id) === true) {
			condition.loan_ref_id = id;
		} else if (mobileNo.test(id) === true) {
			const mob_businessData = await BusinessRd.find({contactno: id, white_label_id: white_label_id});
			_.each(mob_businessData, function (value) {
				bid.push(value.id);
			});
			condition.business_id = bid;
		} else if (panData.test(id) === true) {
			const pan_businessData = await BusinessRd.find({businesspancardnumber: id, white_label_id: white_label_id});
			_.each(pan_businessData, function (value) {
				bid.push(value.id);
			});

			condition.business_id = bid;
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.invalidData
			});
		}
		const loanData = await LoanrequestRd.find(condition).populate("business_id");
		loanDataArray = [];
		if (loanData && loanData.length > 0) {
			// Promise.all(
			// loanData.forEach(async element =>{
			// loanData.map(async (element) => {
			for (let element of loanData) {
				ncStatusCondition = {
					white_label_id: element.white_label_id,
					status1: element.loan_status_id,
					status2: element.loan_sub_status_id
				};
				if (element.loan_status_id == 2 && element.loan_sub_status_id == 9) {
					const loanBankMapping = await LoanBankMappingRd.find({loan_id: element.id}).sort("updated_at DESC");
					if (loanBankMapping.length > 0) {
						ncStatusCondition.status3 = loanBankMapping[0].loan_bank_status;
						ncStatusCondition.status4 = loanBankMapping[0].loan_borrower_status;
						if (
							loanBankMapping[0].loan_bank_status == 12 &&
							loanBankMapping[0].loan_borrower_status == 10
						) {
							ncStatusCondition.status6 =
								loanBankMapping[0].meeting_flag == "0" ? null : loanBankMapping[0].meeting_flag;
						}
					}
				}
				if (element.loan_status_id == 8 && element.loan_sub_status_id == 12) {
					ncStatusCondition.uw_doc_status = element.remarks_val;
				}

				element.currentLoanStatus = await NcStatusManageRd.findOne(ncStatusCondition).select([
					"name",
					"sort_by_id"
				]);
				loanDataArray.push(element);
			}
			// })
			// ).then(() => {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				ncStatusManage: ncStatusData,
				data: loanDataArray
			});
			// });
		} else {
			return res.badRequest({status: "nok", message: sails.config.msgConstants.recordNotFound});
		}
	},

	getDetailsWithLoanRefId: async function (req, res) {
		let moment = require("moment");
		const loan_ref_id = req.param("loan_ref_id");

		if (!loan_ref_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({loan_ref_id})
			.populate("business_id")
			.populate("loan_asset_type")
			.populate("loan_usage_type");
		if (!loanData) {
			sails.config.res.caseWhiteLableIdMismatch.exception = "Invalid parameters";
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		let loanOrigin = loanData.loan_origin.split("_");
		loanData.origin = loanOrigin.length > 0 ? loanOrigin[0] : loanData.loan_origin;
		loanData.loan_origin = loanOrigin.length > 0 ? loanOrigin[1] : loanData.loan_origin;
		if (loanData.business_id.customer_picture) {
			app_profile_data = JSON.parse(loanData.business_id.customer_picture);
			let bucket = app_profile_data.bucket + "/users_" + app_profile_data.userid;
			let url = await sails.helpers.s3ViewDocument(app_profile_data.filename, bucket, app_profile_data.region);
			loanData.business_id.customer_picture = url;
		}
		userData = await UsersRd.findOne({id: loanData.createdUserId});
		let doctypeIds, excludeUserObj;
		let ncStatusCondition = {
			status1: loanData.loan_status_id,
			status2: loanData.loan_sub_status_id,
			white_label_id: loanData.white_label_id
		};
		const loanBankMapping = await LoanBankMappingRd.find({loan_id: loanData.id}).sort("updated_at DESC");
		if (loanBankMapping.length > 0) {
			ncStatusCondition.status3 = loanBankMapping[0].loan_bank_status;
			ncStatusCondition.status4 = loanBankMapping[0].loan_borrower_status;
		}
		const nc_status_data = await NcStatusManageRd.find(ncStatusCondition);
		if (nc_status_data.length > 0 && nc_status_data[0].exclude_user_ncdoc) {
			const excludeUserParseData = JSON.parse(nc_status_data[0].exclude_user_ncdoc);
			_.each(excludeUserParseData.user_types_toexclude, (value) => {
				if (value.name == userData.usertype) {
					priority = value.priority.split(",");
					excludeUserObj = priority
						.toString()
						.replace(/[^0-9,]/g, "")
						.split(",");
				}
			});
		}
		docIdVal = [];
		if (excludeUserObj) {
			doctypeIds = await DoctypeRd.find({
				select: ["id"],
				where: {
					priority: {in: excludeUserObj}
				}
			});
		}
		docIds = [];
		_.each(doctypeIds, (value) => {
			docIds.push(value.id);
		});
		if (userData.usertype === "Bank") {
			docIds.push(0);
			docIdVal = docIds;
		} else if (excludeUserObj && excludeUserObj.length > 0) {
			docIdVal = docIds;
		} else {
			docIdVal = [0];
		}
		loanData.loan_document = await LoanDocumentRd.find({
			where: {
				loan: loanData.id,
				status: "active",
				doctype: {
					"!=": docIdVal
				}
			}
		});
		for (let i = 0; i < loanData.loan_document.length; i++) {
			let loanDocDetails = loanData.loan_document[i];
			loanDocDetails.loan_document_details = await LoanDocumentDetailsRd.find({
				doc_id: loanDocDetails.id,
				doc_request_type: "loan"
			});
			if (!loanDocDetails.loan_document_details) loanDocDetails.loan_document_details = [];
			else if (
				loanDocDetails.loan_document_details[0] &&
				loanDocDetails.loan_document_details[0].classification_type == "others"
			)
				loanData.loan_document[i] = {...loanData.loan_document[i], ...loanDocDetails.loan_document_details[0]};
		}

		loanData.lender_document = await LenderDocumentRd.find({loan: loanData.id, status: "active"}).populate(
			"doc_type"
		);
		for (let i = 0; i < loanData.lender_document.length; i++) {
			loanData.lender_document[i].loan_document_details = await LoanDocumentDetailsRd.find({
				doc_id: loanData.lender_document[i].id,
				doc_request_type: "lender"
			});
		}
		connectorData = await BusinessRd.find({profile_ref_no: loanData.connector_user_id}).select(["businessname"]);
		connectorUserData = await UsersRd.find({user_reference_no: loanData.connector_user_id}).select(["name"]);
		loanData.connector_name =
			connectorData.length > 0
				? connectorData[0].businessname
				: connectorUserData.length > 0
					? connectorUserData[0].name
					: "";
		loanData.users = (await UsersRd.find({id: loanData.createdUserId})) || [];
		addressData = (await BusinessaddressRd.find({bid: loanData.business_id.id})) || [];
		if (addressData.length > 0) {
			_.each(addressData, (addData) => {
				addData.residential_stability = addData.residential_stability
					? moment(addData.residential_stability).format("YYYY-MM")
					: "";
			});
		}
		loanData.business_address = addressData || [];
		loanData.imd_details = (await IMDDetailsRd.findOne({loan_id: loanData.id})) || {};
		const loanFinancialsData = await LoanFinancialsRd.find({
			loan_id: loanData.id,
			business_id: loanData.business_id.id
		});
		for (const bankData of loanFinancialsData) {
			if (bankData.bank_id) {
				bankData.bankMasterData = await BankMasterRd.findOne({id: bankData.bank_id}).select(["bankname"]);
			} else {
				bankData.bankMasterData = {};
			}
		}
		loanData.emi_details = loanData.bank_details = loanFinancialsData || [];
		loanData.subsidiary_details = (await BusinessMappingRd.find({parent_id: loanData.business_id.id})) || [];
		loanData.shareholder_details = (await BusinessShareholderRd.find({businessID: loanData.business_id.id})) || [];
		loanData.reference_details = (await LoanReferencesRd.find({loan_id: loanData.id})) || [];
		loanData.product_details = [];
		const productDetails = await LoanProductDetailsRd.find({
			white_label_id: loanData.white_label_id,
			isActive: "true"
		});
		productDetails.forEach((element) => {
			if (Object.values(element.product_id).indexOf(loanData.loan_product_id) > -1) {
				loanData.product_details = element;
			}
		});
		loanData.loan_assets = await LoanAssetsRd.find({business_id: loanData.business_id.id, loan_id: loanData.id});
		dirData = await DirectorRd.find({business: loanData.business_id.id});
		let dirDataArray = [];
		for (const directorData of dirData) {
			directorData.is_aadhaar_otp_verified = false;
			if (directorData.daadhaar) {
				kycData = await EkycResponse.find({kyc_key: directorData.daadhaar});
				if (kycData.length > 0) {
					kycData.forEach((kyc_data) => {
						if (kyc_data.response) {
							parseData = JSON.parse(kyc_data.response);
							if (parseData.code == "200") directorData.is_aadhaar_otp_verified = true;
						}
					});
				}
			}
			if (directorData.customer_picture) {
				profile_data = JSON.parse(directorData.customer_picture);
				let bucket = profile_data.bucket + "/users_" + profile_data.userid;
				let url = await sails.helpers.s3ViewDocument(profile_data.filename, bucket, profile_data.region);
				directorData.customer_picture = url;
			}
			if (directorData.isApplicant == 0) {
				incomeTypaData = await CoapplicantDocumentMappingRd.findOne({
					income_type_name: directorData.income_type,
					white_label_id: loanData.white_label_id
				}).select(["income_type_name", "income_type_id"]);
				if (incomeTypaData) {
					directorData.income_type = incomeTypaData.income_type_id;
				}
			} else {
				directorData.income_type = loanData.loan_request_type == 1 ? 1 : 7;
			}
			incomeData = await IncomeData.findOne({business_id: loanData.business_id.id, director_id: directorData.id});
			directorData.employment_data = (await EmploymentDetailsRd.find({director_id: directorData.id})) || [];
			if (incomeData) {
				directorData.incomeData = incomeData;
			} else {
				directorData.incomeData = {};
			}
			doc_details_data = await LoanDocumentDetailsRd.find({
				loan_id: loanData.id,
				// did: directorData.id,
				doc_request_type: "loan"
			});
			loanData.app_coordinates = {};
			if (doc_details_data.length > 0) {
				doc_details_data.forEach((dodData) => {
					if (dodData.request_type == "Application") {
						dodData.timestamp = dodData.lat_long_timestamp;
						loanData.app_coordinates = dodData;
					} else if (dodData.request_type == "Profile" && dodData.did == directorData.id) {
						directorData.lat = dodData.lat;
						directorData.long = dodData.long;
						directorData.timestamp = dodData.lat_long_timestamp;
					}
				});
			}
			dirDataArray.push(directorData);
		}
		loanData.director_details = dirDataArray;

		let assetsAdditionalRow;
		assetsAdditionalRow = await AssetsAdditionalRd.find({loan_id: loanData.id}).select("id").limit(1);
		if (assetsAdditionalRow.length > 0) loanData.assets_additional_id = assetsAdditionalRow[0].id;

		return res.send({status: "ok", message: sails.config.msgConstants.detailsListed, data: loanData});
	},
	updateLoanDetails: async function (req, res) {
		let {data: reqData, loan_id: loanId, origin, section_id} = req.allParams();
		let {loan_details, imd_details, source_details, estimated_fund_requirements, source_to_meet_fund_requirements, credit_limit_applied} =
			reqData;
		let {loan_amount, loan_usage_type_id, applied_tenure} = loan_details,
			{loan_origin, connector_user_id, branch_id, user_reference_no} = source_details;
		const datetime = await sails.helpers.dateTime();
		params = {...loan_details, ...source_details, ...imd_details, loanId, origin};
		fields = ["loanId", "origin"];
		missing = await reqParams.fn(params, fields);
		if (!loanId || !origin) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		loanFetchData = await LoanrequestRd.findOne({
			id: loanId
		});
		if (!loanFetchData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		trackData = await sails.helpers.onboardingDataTrack(
			loanFetchData.id,
			loanFetchData.business_id,
			"",
			req.user.id,
			section_id, ""
		);
		branch_id = branch_id ? branch_id.id :
			loan_details.branch_id ? loan_details.branch_id : loanFetchData.branch_id;
		if (user_reference_no || (loan_details.branch_id && loanFetchData.loan_type_id == sails.config.vendor_loan_type)) {
			const businessUpdate = await Business.update({id: loanFetchData.business_id}).set({profile_ref_no: user_reference_no, profile_branch_id: branch_id}).fetch();
			await Users.update({id: businessUpdate[0].userid}).set({user_reference_no, branch_id});
		}
		const loanDataUpdate = {
			...loan_details,
			loan_origin: origin + "_" + loan_origin,
			modified_on: datetime,
			loan_usage_type: loan_usage_type_id || loanFetchData.loan_usage_type,
			connector_user_id: connector_user_id || loanFetchData.connector_user_id,
			applied_tenure: applied_tenure ? applied_tenure : 0,
			branch_id
		};
		updateLoanFetchData = await Loanrequest.update({id: loanId}).set(loanDataUpdate).fetch();
		loanAdditionalData = await LoanAdditionalDataRd.findOne({loan_id: loanId});
		let loanAdditionalDetails;
		if (loanAdditionalData) {
			loanAdditionalDetails = await LoanAdditionalData.update({loan_id: loanId})
				.set({
					estimated_fund_requirements: JSON.stringify(estimated_fund_requirements),
					source_fund_requirements: JSON.stringify(source_to_meet_fund_requirements),
					source_codes: JSON.stringify({...loan_details, ...source_details}),
					credit_limit_applied: JSON.stringify(credit_limit_applied) || null,
					zone_id: source_details.zone_id,
					psl_classification: loan_details?.psl_classification,
					upts: datetime
				})
				.fetch();
		} else {
			loanAdditionalDetails = await LoanAdditionalData.create({
				loan_id: loanId,
				white_label_id: loanFetchData.white_label_id,
				estimated_fund_requirements: JSON.stringify(estimated_fund_requirements),
				source_fund_requirements: JSON.stringify(source_to_meet_fund_requirements),
				source_codes: JSON.stringify({...loan_details, ...source_details}),
				credit_limit_applied: JSON.stringify(credit_limit_applied) || null,
				zone_id: source_details.zone_id,
				psl_classification: loan_details?.psl_classification,
				ints: datetime
			}).fetch();
		}

		// check for deffered condition for cashfree deviation flow
		if (sails.config.cashFree.allowed_white_label_id.includes(Number(req?.user?.loggedInWhiteLabelID)) && imd_details?.imd_collected == "Deferred") {

			// save in the DB
			imd_details.additional_data = {
				...imd_details?.additional_data,
				deferred: {
					comments: imd_details?.comments,
					old_application_id: imd_details?.old_application_id,
					existing_utr_number: imd_details?.existing_utr_number
				}
			}
		}

		const IMD_data = await IMDDetailsRd.findOne({loan_id: loanId});
		let IMD_details;
		if (!IMD_data) {
			IMD_details = await IMDDetails.create({...imd_details, loan_id: loanId, created_at: datetime}).fetch();
		} else {
			IMD_details = await IMDDetails.update({loan_id: loanId})
				.set({
					...imd_details,
					updated_at: datetime
				})
				.fetch();
		}
		res.send({
			status: "ok",
			message: "Data updated successfully",
			data: {
				loan_details: updateLoanFetchData,
				imd_details: IMD_details,
				loan_additional_details: loanAdditionalDetails
			}
		});
		await sails.helpers.greenChannelCondition(loanId, req.user.loggedInWhiteLabelID)
	},

	fetch_updateLoanDetails: async function (req, res) {
		const loan_ref_id = req.param("loan_ref_id");
		params = {loan_ref_id};
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let loan_details = await LoanrequestRd.findOne({loan_ref_id});
		if (!loan_details) {
			return res.badRequest({
				status: "nok",
				message: "no record found"
			});
		}
		trackData = await MisActivityRd.find({loan_id: loan_details.id}).select("onboarding_track");
		imd_details = (await IMDDetailsRd.findOne({loan_id: loan_details.id})) || {};
		const leadsData = await LeadsRd.find({loan_id: loan_details.id}).sort("id DESC").select("other_data").limit(1);
		// loan_document_details = (await LoanDocumentRd.findOne({id: imd_details.doc_id, status: "active"})) || null;

		if (sails.config.cashFree.allowed_white_label_id.includes(Number(req?.user?.loggedInWhiteLabelID)) && imd_details && Object.keys(imd_details).length > 0) {

			const paymentData = await CustomerPaymentRd.findOne({
				reference_no: imd_details?.transaction_reference,
				reference_type: 'IMD'
			}).select(["status", "response"]);

			if (paymentData && paymentData?.status) {
				imd_details.payment_status = paymentData?.status;
				imd_details.payment_link = paymentData?.response?.link_url;
				imd_details.utr_no = paymentData?.response?.payment?.bank_reference;
			}

			// devaiation flow for deferred cases
			if (imd_details?.additional_data?.deferred) {

				imd_details.comments = imd_details?.additional_data?.deferred?.comments;
				imd_details.old_application_id = imd_details?.additional_data?.deferred?.old_application_id;
				imd_details.existing_utr_number = imd_details?.additional_data?.deferred?.existing_utr_number;

			}

		}

		loan_document_details =
			imd_details && Object.keys(imd_details).length > 0
				? await LoanDocumentRd.findOne({id: imd_details.doc_id, status: "active"})
				: null;
		imd_details.imd_document = loan_document_details;
		loan_additional_data = (await LoanAdditionalDataRd.findOne({loan_id: loan_details.id})) || {};

		let loanDetailSourceCodes = loan_additional_data.source_codes;
		if (loanDetailSourceCodes) {
			loanDetailSourceCodes = JSON.parse(loanDetailSourceCodes);
			loan_details = {
				...loanDetailSourceCodes,
				...loan_details
			};
		}
		if (loan_details.branch_id) {
			loan_details.branch_id = await BanktblRd.findOne({
				id: loan_details.branch_id
			}).select(["ref_id", "branch"]);
		}
		let userIds = [loan_details.createdUserId];
		if (loan_details.sales_id && loan_details.createdUserId != loan_details.sales_id) userIds.push(loan_details.sales_id);  // sales_id is there but different from createdUserId
		const userDetails = await UsersRd.find({id: userIds}).select(["name", "branch_id", "user_reference_no"]);
		if (!loan_details.sales_id) {  // sales_id is null
			loan_details.created_user_details = userDetails[0];
		}
		else if (loan_details.sales_id && userIds.length === 1) {       //when sales_id is there, but same
			loan_details.created_user_details = loan_details.sales_user_details = userDetails[0];
		}
		else {                                 // sales_id and createrdUserId are different
			for (obj of userDetails) {
				if (obj.id == loan_details.createdUserId) loan_details.created_user_details = obj;
				else loan_details.sales_user_details = obj;
			}
		}
		return res.ok({
			status: "ok",
			message: "Data fetched successfully",
			data: {
				loan_details,
				imd_details,
				trackData,
				loan_additional_data,
				leads_data: leadsData ? leadsData : {}
			}
		});
	},

	edit_credit_limit_applied: async function (req, res) {
		let {credit_limit_applied, loan_id: loanId, credit_id} = req.allParams();
		const datetime = await sails.helpers.dateTime();
		params = {loanId, credit_id};
		fields = ["loanId", "credit_id"];
		missing = await reqParams.fn(params, fields);
		if (!loanId || loanId === 0 || !credit_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		loanFetchData = await LoanrequestRd.findOne({
			id: loanId
		});
		if (!loanFetchData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}

		loanBankMappingData = await LoanBankMappingRd.findOne({loan_id: loanId});
		credit_limit_applied_data = JSON.parse(loanBankMappingData.sanction_additional_data).assets

		const index = credit_limit_applied_data.findIndex(obj => obj.id === credit_id);
		if (credit_id && !credit_limit_applied) {
			credit_limit_applied_data = credit_limit_applied_data.filter(obj => obj.id !== credit_id);
		} else {
			if (index !== -1 && credit_limit_applied) {
				credit_limit_applied_data[index] = credit_limit_applied
			} else {
				credit_limit_applied_data.push(credit_limit_applied);
			}
		}
		updateLoanBankmapping = await LoanBankMapping.updateOne({loan_id: loanId}).set({
			sanction_additional_data: JSON.stringify({assets: credit_limit_applied_data}) || null,
		})
		loanAdditionalDetails = await LoanAdditionalData.updateOne({loan_id: loanId})
			.set({
				credit_limit_applied: JSON.stringify(credit_limit_applied_data) || null,
				upts: datetime
			}).fetch();

		res.send({
			status: "ok",
			message: "Data updated successfully",
			data: loanAdditionalDetails
		});
		await sails.helpers.greenChannelCondition(loanId, req.user.loggedInWhiteLabelID)
	},

	saveAdditionalVerificationData: async function (req, res) {
		let {loan_id, file_name, modified_timestamp, user_id} = req.allParams();
		if (!loan_id) {
			return res.badRequest({
				status: "nok",
				message: "loan_id is missing"
			});
		}
		data = {
			modified_timestamp,
			user_id
		}
		datetime = await sails.helpers.dateTime();
		try {
			loanAdditionalData = await LoanAdditionalDataRd.findOne({loan_id});
			if (loanAdditionalData) {
				let s3_av_data = loanAdditionalData.s3_av_data ? JSON.parse(loanAdditionalData.s3_av_data) : {};
				s3_av_data[file_name] = data;
				loanAdditionalDetails = await LoanAdditionalData.updateOne({loan_id})
					.set({
						s3_av_data: JSON.stringify(s3_av_data) || {},
						upts: datetime
					})
					.fetch();
				await sails.helpers.greenChannelCondition(loanId, req.user.loggedInWhiteLabelID)
				return res.send({
					status: "ok",
					message: "Data updated successfully",
					data: loanAdditionalDetails.s3_av_data
				});
			}
			return res.badRequest({
				status: "nok",
				message: "Loan Additional Data Not Found!!"
			})
		}
		catch (error) {
			return res.badRequest({status: "nok", error: error, message: "Failed to update"});
		}
	},

	addComments: async function (req, res) {
		let moment = require("moment");
		let {comments_for_office_use, loan_id, case_id, comments, doc_id, doc_name, comment_ref_id, lender_status_id} = req.allParams();
		if (
			(!comments_for_office_use || !loan_id) &&
			(!case_id || !comments) &&
			(!case_id || !comment_ref_id) &&
			(!loan_id || !comments)
		) {
			return res.badRequest(sails.config.res.missingFields);
		}
		condition = loan_id ? {id: loan_id} : {loan_ref_id: case_id};
		const loanData = await LoanrequestRd.findOne(condition);
		if (!loanData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		datetime = await sails.helpers.dateTime();
		bank_mapping_data = await LoanBankMappingRd.find({loan_id: loanData.id});
		if (loanData.loan_status_id == 2 && loanData.loan_sub_status_id == 9 && bank_mapping_data.length > 0) {
			let loan_bank_status;
			if (
				(bank_mapping_data[0].loan_bank_status == 9 && bank_mapping_data[0].loan_borrower_status == 2) ||
				(bank_mapping_data[0].loan_bank_status == 10 &&
					bank_mapping_data[0].loan_borrower_status == 4 &&
					lender_status_id == 22)
			) {
				loan_bank_status = {
					loan_bank_status: 12,
					loan_borrower_status: 10,
					updated_at: datetime,
					notification_status: "yes"
				};
			} else if (bank_mapping_data[0].loan_bank_status == 10 && bank_mapping_data[0].loan_borrower_status == 4) {
				loan_bank_status = {
					loan_bank_status: 9,
					loan_borrower_status: 2,
					updated_at: datetime,
					notification_status: "yes"
				};
			}
			if (loan_bank_status && Object.keys(loan_bank_status).length > 0) {
				await LoanBankMapping.update({id: bank_mapping_data[0].id})
					.set(loan_bank_status);
			}
		}

		req_data = {
			loan_id: loanData.id,
			lender_status_id: lender_status_id || 0,
			comments,
			comment_ref_id,
			case_id,
			user_id: req.user.id,
			datetime,
			sales_id: loanData.sales_id
		};
		if (case_id) {
			req_data.loan_bank_mapping_id = bank_mapping_data[0].id;
			if (doc_id && doc_name) {
				const {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({id: loanData.white_label_id}).select(["s3_name", "s3_region"]),
					business_user_id = await BusinessRd.findOne({id: loanData.business_id}).select("userid"),
					documents = [{doc_id, doc_name}],
					upload_file = await sails.helpers.lenderDocUpload(documents, loanData.id,
						bank_mapping_data[0].id, business_user_id.userid, req.user.id, "yes", "", s3_name, s3_region);
				console.log(upload_file);
				req_data.doc_id = JSON.stringify(upload_file.doc_id);
			}
			req_data.lender_status_id = 22;
			dataRes = await addOrFetchComments(req_data);
			return res.ok(dataRes);
		} else {
			let updateComments;
			if (bank_mapping_data.length > 0 && bank_mapping_data[0].id) {
				req_data.loan_bank_mapping_id = bank_mapping_data[0].id;
				dataRes = await addOrFetchComments(req_data);
				updateComments = dataRes.data;
			} else {
				let remarks = {};
				comments = {
					comment_for_office_use_by: req.user.name,
					datetime: datetime,
					comment: comments_for_office_use,
					is_comment_for_office_use: true
				};
				datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
				if (loanData.remarks) {
					remarks = JSON.parse(loanData.remarks);
					const obj = Object.values(remarks).find(
						(o) => o.is_comment_for_office_use == true && o.comment == comments_for_office_use
					);
					if (!obj) {
						remarks = {[datetime]: comments, ...remarks};
					} else {
						remarks = remarks;
					}
				} else {
					remarks[datetime] = comments;
				}
				updateComments = await Loanrequest.update({id: loan_id})
					.set({remarks: JSON.stringify(remarks)})
					.fetch();
			}
			return res.ok({
				status: "ok",
				message: "comments added successfully",
				data: updateComments
			});
		}
	},

	toApplicationStage: async function (req, res) {
		let {loan_id, section_id, doc_section_id, is_mandatory_documents_uploaded, sme_final_api} = req.allParams();
		const statusMappings = sails.config.status_data_redis;
		if (loan_id) {
			let isLoanInComplete;
			let {loan_status_id, loan_sub_status_id, business_id, white_label_id, loan_type_id, loan_ref_id, id} =
				await Loanrequest.findOne({id: loan_id}).select(
					["loan_status_id", "loan_sub_status_id", "business_id", "white_label_id", "loan_ref_id", "loan_type_id"]
				).populate("business_id");
			console.log(loan_status_id, loan_sub_status_id, business_id, white_label_id, id);
			const statusKey = [loan_status_id, loan_sub_status_id].filter(value => value !== undefined);
			const statusKey_result = statusKey.join('_');
			const app_status = statusMappings[statusKey_result] || "";
			let sme_res, sme_get_customer_details_response;
			// if (sme_final_api == true){
			if (sme_final_api == true && business_id.customer_id &&
				business_id.contactno && business_id.businesspancardnumber) {
				const body = {
					loan_id: loan_id,
					customer_id: business_id.customer_id,
					mobile_no: business_id.contactno,
					pan_no: business_id.businesspancardnumber,
					white_label_id
				},

					auth = {
						"content-Type": "application/json"
					};

				const sme_get_customer_details_response = await sails.helpers.sailstrigger(
					sails.config.sme_api_url,
					JSON.stringify(body),
					auth,
					"POST"
				);
				if (sme_get_customer_details_response.status == "nok") {
					sme_res = sme_get_customer_details_response
				} else {
					sme_res = JSON.parse(sme_get_customer_details_response);
				}
			}
			const white_label_id_data = await WhiteLabelSolutionRd.findOne({id: white_label_id});
			let document_mapping = JSON.parse(white_label_id_data.document_mapping)
			if (document_mapping && document_mapping.consumer_api) {
				const body = {
					loan_ref_id: loan_ref_id,
					business_id: business_id.id
				},
					auth = {
						"content-Type": "application/json"
					};

				const consumer_cibil_api_response = await sails.helpers.sailstrigger(
					document_mapping.consumer_api.api,
					JSON.stringify(body),
					auth,
					"POST"
				);
			}
			if ((loan_status_id == 1 && loan_sub_status_id == 1) || (loan_status_id == 18 && loan_sub_status_id == 20)) isLoanInComplete = true;
			if (isLoanInComplete) {
				if (section_id) {
					trackData = await sails.helpers.onboardingDataTrack(id, business_id.id, "", req.user.id, section_id, "");
				}
				if (doc_section_id) {
					trackData = await sails.helpers.onboardingDataTrack(id, business_id.id, "", req.user.id, doc_section_id, "");
				}
				let loan_status_id, loan_sub_status_id;
				if (loan_type_id == sails.config.vendor_loan_type) {
					loan_status_id = 18;
					loan_sub_status_id = 18;
				} else {
					loan_status_id = 1;
					loan_sub_status_id = null;
				}

				await Loanrequest.update({id: loan_id}).set({
					loan_status_id,
					loan_sub_status_id
				});
				await sails.helpers.reportTat(req.user.id, req.user.name, loan_id, "Application", "In Complete", "");
			}
		}

		res.send({
			status: "ok",
			statusCode: "NC200",
			message: "Case moved to Application stage"
		});
	},
	loan_details: async function (req, res) {
		let {
			loan_ref_id,
			not_qualified_remarks,
			rejected_remarks,
			collateral_details,
			loan_documents,
			loan_documents_presigned,
			lender_documents,
			lender_documents_presigned,
			assigned_other_users
		} = req.allParams();

		if (!loan_ref_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		let data = {},
			remarksData;
		loanData = await LoanrequestRd.findOne({loan_ref_id});
		if (loanData.remarks) {
			parseData = JSON.parse(loanData.remarks);
			remarksData = Object.values(parseData);
		}

		if (not_qualified_remarks && (not_qualified_remarks.length > 0 || not_qualified_remarks.length == 0)) {
			let notQualifyRemarks = [];
			if (remarksData.length > 0) {
				remarksData.forEach((remarks) => {
					if (remarks.not_qualified_by) {
						notQualifyRemarks.push(remarks);
					}
				});
				data.not_qualified_remarks = notQualifyRemarks;
			} else {
				data.not_qualified_remarks = notQualifyRemarks;
			}
		}
		if (rejected_remarks && (rejected_remarks.length > 0 || rejected_remarks.length == 0)) {
			let rejectRemarks = [];
			if (remarksData.length > 0) {
				remarksData.forEach((remarks) => {
					if (remarks.not_qualified_by) {
						rejectRemarks.push(remarks);
					}
				});
				data.rejected_remarks = rejectRemarks;
			} else {
				data.rejected_remarks = rejectRemarks;
			}
		}
		if (collateral_details && (collateral_details.length > 0 || collateral_details.length == 0)) {
			data.collateral_details =
				(await LoanAssetsRd.find({business_id: loanData.business_id.id, loan_id: loanData.id, status: "active"})) || [];
		}

		let bucket, region;
		if (loan_documents_presigned || lender_documents_presigned) {
			let {s3_name, s3_region} = await WhiteLabelSolutionRd.findOne({
				id: req.user.loggedInWhiteLabelID
			}).select(["s3_name", "s3_region"]);
			(bucket = s3_name), (region = s3_region);
		}

		if (loan_documents && (loan_documents.length > 0 || loan_documents.length == 0)) {
			let doc_data = {status: "active"};
			doc_data.loan = loanData.id;
			if (loan_documents.length > 0) doc_data.doctype = loan_documents;
			data.loan_document = await LoanDocumentRd.find(doc_data).populate("doctype");

			removeDuplicateProfilePics(data.loan_document);

			if (loan_documents_presigned) await updateDocArrayWithUrls(data.loan_document, bucket, region, "loan");
		}

		if (lender_documents && (lender_documents.length > 0 || lender_documents.length == 0)) {
			let lender_doc_data = {status: "active"};
			lender_doc_data.loan = loanData.id;
			if (lender_documents.length > 0) lender_doc_data.doc_type = lender_documents;
			data.lender_document = await LenderDocumentRd.find(lender_doc_data).populate("doc_type");

			if (lender_documents_presigned)
				await updateDocArrayWithUrls(data.lender_document, bucket, region, "lender");
		}
		if (assigned_other_users) {
			otherUserArray = [];
			otherUsersData = await TaskUserMappingRd.find({loan_ref_id}).select([
				"assign_userid",
				"status",
				"priority",
				"assigned_document_list"
			]);
			for (let oUserData of otherUsersData) {
				let user_data = await UsersRd.findOne({id: oUserData.assign_userid}).select(["name", "usertype"]);
				oUserData = {...user_data, ...oUserData, userid: user_data.id};
				otherUserArray.push(oUserData);
			}
			data.assigned_other_users = otherUserArray;
		}
		return res.ok({status: "ok", message: sails.config.msgConstants.detailsListed, data: data});
	},
	download_document: async function (req, res) {
		const loan_id = req.param('loan_id')
		try {
			if (!loan_id) {
				return res.badRequest(sails.config.res.missingFields);
			}

			whiteLabelData = await WhiteLabelSolutionRd.findOne({
				id: req.user.loggedInWhiteLabelID
			}).select("document_mapping");
			doctypeid = []
			whiteLabelDataDoc = whiteLabelData.document_mapping ? JSON.parse(whiteLabelData.document_mapping) : {};
			let priority = [], doctype_id = [], extension = [];
			if (whiteLabelDataDoc && whiteLabelDataDoc.document_download[0]) {
				priority = whiteLabelDataDoc.document_download[0].priority || [],
					doctype_id = whiteLabelDataDoc.document_download[0].doctype_id || [],
					extension = whiteLabelDataDoc.document_download[0].extension || []
			}

			if (whiteLabelDataDoc && whiteLabelDataDoc.document_download && whiteLabelDataDoc.document_download.length > 0) {
				let loandoc = {loan: loan_id, status: "active"}
				let lenderdoc = {loan: loan_id, status: "active"}
				if (doctype_id && doctype_id.length > 0) {
					doctypeid.push(...doctype_id);
				}
				if (priority && priority.length > 0) {
					doctypeIds = await DoctypeRd.find({
						select: ["id"],
						where: {
							priority: {in: priority},
						}
					});
				}
				_.each(doctypeIds, (value) => {
					doctypeid.push(value.id);
				});

				let regex = new RegExp(`\\.(${extension.join('|')})$`, 'i');

				if (doctypeid.length) {
					lenderdoc.doc_type = doctypeid,
						loandoc.doctype = doctypeid
				}
				lender_document = await LenderDocumentRd.find(lenderdoc).populate("doc_type").select(["id", "user_id", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size_of_file", "directorId", "doc_type"])
				loan_document = await LoanDocumentRd.find(loandoc).populate("doctype").select(["id", "user_id", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size", "directorId", "doctype"])
				filtered_loan_document = loan_document.filter(doc => regex.test(doc.doc_name));
				filtered_lender_document = lender_document.filter(doc => regex.test(doc.doc_name));
				return res.ok({
					status: "ok",
					data: {
						lenderdata: filtered_lender_document,
						loandata: filtered_loan_document
					}
				});

			}
			else {
				return res.badRequest({status: "nok", message: "config data not available"});
			}
		} catch (error) {
			return res.badRequest({status: "nok", message: "Error"});
		}

	},
	case_creation_bulk_upload: async function (req, res) {
		let {
			product_name,
			entity_name,
			telephone_number,
			entity_email_id,
			entity_registered_address,
			pin_code,
			gstin,
			pan_of_the_entity,
			date_of_incorporation,
			segment_sector,
			income_type,
			promoter_first_name,
			promoter_middle_name,
			promoter_last_name,
			dob,
			address,
			mobile_number,
			promoter_email_id,
			promoter_pin_code,
			pan_number,
			comments,
			userid,
			white_label_id,
			cin,
			token,
			connector_id
		} = req.allParams();

		let params = req.allParams();
		let fields = [
			"product_name",
			"entity_name",
			"telephone_number",
			"entity_email_id",
			// "entity_registered_address",
			"pin_code",
			"gstin",
			"pan_of_the_entity",
			"date_of_incorporation",
			"segment_sector",
			// "income_type",
			"promoter_first_name",
			"promoter_last_name",
			// "dob",
			// "mobile_number",
			// "promoter_email_id",
			// "promoter_pin_code",
			"pan_number",
			"userid",
			"white_label_id",
			"token"
		];
		let missing = await reqParams.fn(params, fields);
		if (missing.length) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const datetime = await sails.helpers.dateTime();

		try {
			let duplicateEntry;
			let loanData = await LoanrequestRd.find({loan_origin: {contains: token}});
			if (loanData.length) loanData = loanData.map(item => +item.business_id)
			let businessData = await Business.find({businessname: entity_name, business_email: entity_email_id, businesspancardnumber: pan_of_the_entity})
			if (loanData.length) businessData = businessData.map(item => +item.id)

			if (loanData.length || businessData.length) duplicateEntry = loanData.some(item1 => businessData.includes(item1));

			if (duplicateEntry) return res.ok({status: "nok", message: "Duplicate Entry"})

			let loanProductData, connector_user_ref_no;
			const whitelabelsolution = await WhiteLabelSolutionRd.findOne({id: white_label_id}).select("loan_product_type");
			if (!whitelabelsolution) return res.ok({status: "nok", message: "Invalid request"})
			let productIds = whitelabelsolution.loan_product_type.split(",")
			productIds = productIds.map(item => +item)
			let productData = await LoanProductsRd.find({
				product: product_name, id: {in: productIds}
			}).limit(1);
			if (productData.length > 0) loanProductData = productData[0]
			const businessType = await BusinessTypeRd.findOne({TypeName: segment_sector}).select("id");

			if (!loanProductData || !businessType || !(income_type == "Business" || income_type == "Salaried" || income_type == "No Income")) throw "Failed. Invalid Inputs"

			//splitting loanProductData to fetch ids
			let loan_product_id, loan_request_type, loan_asset_type_id, loan_usage_type_id, loan_type_id;
			if (loanProductData) {
				loan_product_id = loanProductData.id;
				loan_request_type = loanProductData.loan_request_type;
				loan_asset_type_id = loanProductData.loan_asset_type_id.split(",")[0];
				loan_usage_type_id = loanProductData.loan_usage_type_id.split(",")[0];
				loan_type_id = loanProductData.loan_type_id.split(",")[0];
			}

			const login_url = sails.config.generateTokenfromUser;
			let body = sails.config.loginCredentials;
			const login_result = await sails.helpers.sailstrigger(login_url, JSON.stringify(body), "", "POST");
			const login_token = JSON.parse(login_result).token
			//pincode api call: fetching city, state
			const url = `${sails.config.pincode_url}?code=${pin_code}`;
			let method = "GET",
				headers = {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${login_token}`
				};
			let data = await sails.helpers.sailstrigger(url, "", headers, method);
			let pincodeDetails = JSON.parse(data);

			//password encryption
			const salt = `$${white_label_id}-${Math.floor(new Date().getTime() / 1000)}`;
			const md5Password = await sails.helpers.hashEncryptionDecryption(
				"encrypt_password_with_salt",
				telephone_number.toString(),
				salt,
				""
			);

			let userDetails;
			let userData = await UsersRd.find({
				email: entity_email_id
			});

			if (userData.length === 0) {
				let create_new_user = {
					email: entity_email_id,
					contact: telephone_number,
					name: entity_name,
					password: md5Password,
					user_reference_pwd: telephone_number,
					usertype: "Borrower",
					parent_id: userid,
					assigned_sales_user: userid,
					white_label_id,
					createdbyUser: userid,
					originator: userid,
					status: "active",
					origin: "CRISIL",
					capancard: pan_of_the_entity
				};
				userDetails = await Users.create(create_new_user).fetch();
			} else {
				userDetails = userData[0];
			}

			let business_data = {
				businessname: entity_name,
				userid: userDetails.id,
				businessstartdate: date_of_incorporation,
				business_email: entity_email_id,
				contactno: telephone_number,
				businesstype: businessType.id,
				businesspancardnumber: pan_of_the_entity,
				white_label_id: userData.white_label_id,
				empcount: 1,
				businessindustry: 20,
				ints: datetime,
				crime_check: "No",
				status: userData.status,
				gstin,
				corporateid: cin,
				crime_check: "Yes"
			};

			if (connector_id) {
				const userData = await UsersRd.findOne({id: connector_id}).select("user_reference_no")
				if (userData?.user_reference_no) connector_user_ref_no = business_data.profile_ref_no = userData.user_reference_no
			}

			Business.create(business_data)
				.fetch()
				.then(async (business_record) => {
					const report_tat = {
						assignedUserId: userDetails.id,
						assignedBy: userDetails.name,
						dateTime: datetime,
						previous_status: "",
						current_status: "Draft",
						message: "",
						count: 1
					};

					let loan_data = {
						business_id: business_record.id,
						loan_ref_id: await sails.helpers.commonHelper(),
						loan_request_type,
						loan_asset_type: loan_asset_type_id,
						loan_usage_type: loan_usage_type_id,
						loan_type_id,
						white_label_id,
						sales_id: userid,
						createdUserId: userDetails.id,
						RequestDate: datetime,
						loan_product_id,
						loan_summary: `${product_name} - requested to create case for business ${entity_name} for Bank`,
						loan_origin: `onboarding_bulk upload_${token}`,
						modified_on: datetime,
						reportTat: JSON.stringify({data: [report_tat]}),
						connector_user_id: connector_user_ref_no
					};
					if (comments) {
						let dateTime = await sails.helpers.dateTime();
						loan_data.remarks = JSON.stringify({[dateTime]: {comment_for_office_use_by: userid, datetime: dateTime, comment: comments, is_comment_for_office_use: true}})
					}

					Loanrequest.create(loan_data)
						.fetch()
						.then(async (loanreq) => {
							let LOAN_REF_ID = loanreq.loan_ref_id;
							let business_address_data = {
								bid: business_record.id,
								aid: "1",
								line1: entity_registered_address,
								city: pincodeDetails.district[0],
								state: pincodeDetails.state[0],
								pincode: pin_code,
								locality: pincodeDetails.locality[0]
							};

							Businessaddress.create(business_address_data)
								.fetch()
								.then((business_address_resp) => {
									let director_data = {
										income_type: income_type == "Business" ? "business" : income_type == "Salaried" ? "salaried" : income_type == "No Income" ? "noIncome" : null,
										dfirstname: promoter_first_name,
										dlastname: promoter_last_name,
										ddob: dob,
										dcontact: mobile_number,
										demail: promoter_email_id,
										dpancard: pan_number,
										business: business_record.id,
										pincode: promoter_pin_code,
										crime_check: "Yes"
									};
									if (promoter_middle_name) director_data.middle_name = promoter_middle_name
									if (address) director_data.address1 = address
									Director.create(director_data)
										.fetch()
										.then(async () => {
											sails.config.successRes.createdData.loan_ref_id = LOAN_REF_ID;
											res.ok(sails.config.successRes.createdData);

											console.log("loan ref id .........................................", LOAN_REF_ID)
											if (cin || gstin) {
												const loginUrl = `${sails.config.sailsPlaidUrl}sails-exp/ClientVerify`;
												const loginBody = {email: entity_email_id, white_label_id}
												const loginResponse = await sails.helpers.sailstrigger(loginUrl, JSON.stringify(loginBody), "", "POST");

												if (!loginResponse.status) {
													console.log("token generated")
													let loginToken = JSON.parse(loginResponse)?.token
													if (cin) {
														const rocUrl = `${sails.config.sailsPlaidUrl}ROCData`;
														const method = "POST",
															headers = {
																"Content-Type": "application/json",
																"Authorization": loginToken
															};
														const rocBody = {cin_number: cin}
														let rocData = await sails.helpers.sailstrigger(rocUrl, JSON.stringify(rocBody), headers, method);
														console.log("ROC data..................................", rocData)
													}
													if (gstin) {
														const gstUrl = `${sails.config.sailsPlaidUrl}GSTData`;
														let method = "POST",
															headers = {
																"Content-Type": "application/json",
																"Authorization": loginToken
															};
														const gstBody = {gst: gstin}
														let gstData = await sails.helpers.sailstrigger(gstUrl, JSON.stringify(gstBody), headers, method);
														console.log("GST data...................................", gstData)
													}
												}
											}
										});
								});
						});
				});
		} catch (err) {
			return res.badRequest({status: "nok", message: "Case Creation failed", err});
		}
	},
	query_reply: async function (req, res) {
		const {comments, comment_ref_id, loan_id, document_details} = req.allParams();
		if (!comments || !comment_ref_id || !loan_id) {
			return res.badRequest({
				status: "nok",
				message: "Mandatory fields are missing."
			});
		}
		const {loan_ref_id, sales_id, application_ref, business_id} = await LoanrequestRd.findOne({id: loan_id}).select(["loan_ref_id", "business_id", "sales_id", "application_ref"]).populate("business_id");
		bank_mapping_data = await LoanBankMappingRd.find({loan_id});
		bank_mapping_data_id = bank_mapping_data[0]?.id || 1
		// if (bank_mapping_data.length === 0) {
		// 	return res.badRequest({
		// 		status: "nok",
		// 		message: "No loanbank mapping data found for the entered loanid"
		// 	});
		// }
		const datetime = await sails.helpers.dateTime(),
			doc_array = [];
		req_data = {
			loan_id,
			lender_status_id: 0,
			comments,
			comment_ref_id,
			case_id: loan_ref_id,
			user_id: req.user.id,
			datetime,
			sales_id: sales_id,
			loan_bank_mapping_id: bank_mapping_data_id
		};
		if (document_details.length > 0) {
			const doc_data =
				await sails.helpers.lenderDocUpload(document_details, loan_id, bank_mapping_data_id, business_id.userid, req.user.id, "", "yes");
			if (doc_data && doc_data.node) {
				for (const i of doc_data.node) {
					const nodeData = i.api_res.data;
					doc_obj = {
						doc_name: nodeData.node.nodeName,
						doc_id: nodeData.node.nodeId
					};
					doc_array.push(doc_obj);
				}
			}
			req_data.doc_id = JSON.stringify(doc_data.doc_id);
		}
		dataRes = await addOrFetchComments(req_data);
		if (comment_ref_id.includes("TAT")) {
			const url = sails.config.queryUrl,
				method = "POST",
				payload = {
					application_ref,
					loan_ref_id,
					comment_ref_id,
					comments,
					documents: doc_array
				},
				headers = {
					"Content-Type": "application/json"
				};
			// console.log(url, JSON.stringify(payload), headers, method);
			await sails.helpers.sailstrigger(url, JSON.stringify(payload), headers, method);
		}
		return res.ok(dataRes);

	},
	getPincodeZone: async function (req, res) {
		const branch_id = req.param("branch_id");
		if (!branch_id) return res.badRequest(sails.config.res.missingFields);
		const pincodeDetails = await BanktblRd.findOne({id: branch_id}).select("branch_pincode");
		if (!pincodeDetails || !pincodeDetails.branch_pincode) return res.ok({status: "nok", message: "No Bank Branch found"})
		const url = sails.config.pincode_url + `?code=${pincodeDetails.branch_pincode}`;
		const headers = {
			"content-type": "application/json",
			Authorization: req.headers.authorization
		}
		let zoneResponse = await sails.helpers.sailstrigger(url, "", headers, "GET")
		if (!zoneResponse.status) {
			zoneResponse = JSON.parse(zoneResponse)
			return res.ok({status: "ok", message: "Zone captured successfully", zone: zoneResponse.category && zoneResponse.category[0] && zoneResponse.category[0] !== "#N/A" ? zoneResponse.category[0] : "Semi Urban"})
		}
		return res.ok({status: "nok", message: "Failed to capture Zone"})
	},
	getSourcingDetails: async function (req, res) {
		const {branch_id} = req.allParams();
		if (!branch_id) return res.badRequest(sails.config.res.missingFields);
		const bankDetails = await BanktblRd.findOne({id: branch_id}).select("branch");
		if (!bankDetails || !bankDetails.branch) return res.ok({status: "nok", message: "No Branch found"})
		const sulbCode = bankDetails.branch.split("-")[0];
		const branchDetailsUrl = sails.config.sourcingDetails.branchCode + `sulbcode=${sulbCode}`
		let sourcingDetails = await sails.helpers.sailstrigger(branchDetailsUrl, "", "", "GET")
		if (!sourcingDetails.status) {
			const branchDetails = JSON.parse(sourcingDetails)?.data?.[0]
			console.log(branchDetails)
			if (branchDetails) return res.ok({status: "ok", message: "Sourcing Details fetched successfully", data: branchDetails})
			else return res.ok({status: "nok", message: "No Branch details found", data: {}})
		}
		return res.ok({status: "nok", message: "Failed to fetch Sourcing Details"})
	},
	getCodeDetails: async function (req, res) {
		const {fdgl_code, dsa_code} = req.allParams();
		if (!fdgl_code && !dsa_code) return res.badRequest(sails.config.res.missingFields);
		let url;
		if (dsa_code) url = sails.config.sourcingDetails.dsaCode + dsa_code
		else url = sails.config.sourcingDetails.fdglCode + fdgl_code
		let codeDetails = await sails.helpers.sailstrigger(url, "", "", "GET")
		if (!codeDetails.status) {
			codeDetails = JSON.parse(codeDetails)?.data
			console.log(codeDetails)
			if (codeDetails) return res.ok({status: "ok", message: "Code Details fetched successfully", data: codeDetails})
			else return res.ok({status: "nok", message: "No Code details found", data: {}})
		}
		return res.ok({status: "nok", message: "Failed to fetch Code Details"})
	},
	getIncomeProgram: async function (req, res) {
		const url = sails.config.incomeProgram;
		let response = await sails.helpers.sailstrigger(url, "", "", "GET")
		if (!response.status) {
			response = JSON.parse(response)?.data
			if (response) {
				const incomeDetails = response.filter(item => item.rank != "Rank")
				return res.ok({status: "ok", message: "Income Details retrieved successfully", data: incomeDetails})
			}
		}
		return res.ok({status: "nok", message: "Failed to retrieve Income Details"});
	},
	sendBackToCreditAssigned: async function (req, res) {
		const loan_ref_id = req.param("loan_ref_id");
		if (!loan_ref_id) return res.badRequest(sails.config.res.missingFields);
		try {
			const loanData = await LoanrequestRd.findOne({loan_ref_id}).select("id");
			if (!loanData?.id) throw new Error("noLoan");
			const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanData.id}).sort("id DESC").limit(1).select("id");
			if (!loanBankMappingData[0]) throw new Error("noLbm");
			const loanSanctionData = await LoanSanctionRd.find({loan_bank_mapping: loanBankMappingData[0].id});
			if (!loanSanctionData[0]) throw new Error("noLoanSanction");
			const disbursementData = await LoanDisbursementRd.find({loan_bank_mapping_id: loanBankMappingData[0].id, disbursement_status: {'!=': "deleted"}});
			// if (!disbursementData[0]) throw new Error("noDisbursement");
			if (disbursementData[0]) {
				const allowedStatuses = ['sent back by bpo', 'sent back by ops', 'draft'];
				const invalidStatusExists = disbursementData.some(
					obj => !allowedStatuses.includes(obj.disbursement_status)
				);
				const validStatusRecords = disbursementData.filter(
					obj => allowedStatuses.includes(obj.disbursement_status)
				).map(item => item.id);
				if (!validStatusRecords.length || invalidStatusExists) throw new Error("invalidDisbursementStatus")

				const taskUserMapping = await TaskUserMappingRd.find({loan_ref_id: loan_ref_id, taskid: 13, disbursement_id: {"!=": null}})
				// if (!taskUserMapping[0]) throw new Error("noTaskMapping");
				if (taskUserMapping.length) {
					const taskUserMappingIds = taskUserMapping.map(obj => obj.id)
					await TaskUserMapping.update({id: taskUserMappingIds}).set({disbursement_id: 0, loan_id: 0, reference_id: 0})
				}
				await ApprovalLogs.update({reference_id: loanData.id, status: "pending"}).set({status: "action taken"})
				await LoanDisbursement.update({id: validStatusRecords}).set({disbursement_status: "deleted", loan_sanction_id: null, loan_bank_mapping_id: null})
				await LoanDisbursementPayment.update({disbursement_id: validStatusRecords}).set({status: "deleted"})
			}

			await LoanSanction.updateOne({loan_id: loanData.id}).set({loan_id: 0, loan_bank_mapping: null})
			await Loanrequest.updateOne({id: loanData.id}).set({loan_status_id: 2, loan_sub_status_id: 9})
			await LoanBankMapping.updateOne({id: loanBankMappingData[0].id}).set({loan_bank_status: 9, loan_borrower_status: 2, lender_status: 29})

			return res.ok({status: "ok", message: "Loan sent back to Credit Assigned!"})
		}
		catch (err) {
			switch (err.message) {
				case "noLoan":
					return res.ok({status: "nok", message: "Loan not found for this Loan Ref ID"})
				case "noLbm":
					return res.ok({status: "nok", message: "Loan Bank Mapping record not found"})
				case "noLoanSanction":
					return res.ok({status: "nok", message: "Loan Sanction record not found"})
				case "noDisbursement":
					return res.ok({status: "nok", message: "Disbursement record not found"})
				case "invalidDisbursementStatus":
					return res.ok({status: "nok", message: "Invalid Disbursement Status - Case must be in draft/sent back by bpo/sent back by ops stage."})
				case "noTaskMapping":
					return res.ok({status: "nok", message: "Task User Mapping record not found"})
			}
		}
	},
	greenChannelLoanValidate: async function (req, res) {
		const {loanId, whiteLabelId} = req.allParams();
		res.ok({status: "ok", message: "Validation complete!"})
		await sails.helpers.greenChannelCondition(loanId, whiteLabelId)
	},
	directorPhotoMissing: async function (req, res) {
		try {
			const {loan_ref_id: loanRefId} = req.body;
			if (!loanRefId) throw new Error("Loan Reference number is mandatory!");

			const loanReference = await LoanrequestRd.findOne({loan_ref_id: loanRefId}).select(["business_id"]);
			if (!loanReference) throw new Error("The entered Loan Reference number is wrong!");

			const business = await BusinessRd.findOne({
				id: loanReference.business_id
			});

			if (!business) throw new Error("Missing Business Data!");

			// Step 1 - check whether the photo is the photos are uploaded for the applicant and co-applicant or not
			const directors = await DirectorRd.find({
				business: loanReference.business_id,
				status: 'active'
			}).select("customer_picture");
			let ErrorMessagePhotoMissing = "";

			for (let director of directors) {

				if (!director.customer_picture) {
					ErrorMessagePhotoMissing += `Photo missing for ${director.type_name} ${director.dfirstname} ${director.dlastname}.\n`
				}

			}
			if (ErrorMessagePhotoMissing) throw new Error(ErrorMessagePhotoMissing);

			// check if the picture in the business table is same as the director table image
			const photoEqualFlag = await sails.helpers.checkObjectEqual(directors[0].customer_picture, business.customer_picture);
			if (!photoEqualFlag) {
				await Business.updateOne({
					id: business.id
				}).set({
					customer_picture: directors[0].customer_picture
				});

				// trigger the JSON retrigger API
				let url = `${sails.config.EMudra.url.applicationPdfJson}?loan_ref_id=${loanRefId}&retrigger=yes`,
					method = 'GET',
					headers = {},
					options = {
						url,
						method,
						headers
					};
				const regenerateJSON = await axios(options);
				if (regenerateJSON?.data?.status != "ok") throw new Error("Failed to regenerate the JSON!");

				return res.send({
					status: "ok",
					message: "Application PDF JSON retriggered with the correct Data!"
				})
			}

			return res.send({
				status: "ok",
				message: "No issues found with the application form or the application JSON!"
			})

		} catch (error) {
			return res.send({
				status: "nok",
				message: error.message
			})
		}
	}
};

async function updateDocArrayWithUrls(documentsArr, bucket, region, doc_request_type) {
	for (let i = 0; i < documentsArr.length; i++) {
		if (documentsArr[i].doc_name)
			documentsArr[i].presignedUrl = await sails.helpers.s3ViewDocument(
				documentsArr[i].doc_name,
				`${bucket}/users_${documentsArr[i].user_id}`,
				region
			);
		documentsArr[i].loan_document_details = await LoanDocumentDetailsRd.find({
			doc_id: documentsArr[i].id,
			doc_request_type
		});
	}
}

function removeDuplicateProfilePics(documentsArr) {
	let profilePicsToBeRemoved = [],
		indicesToBeRemoved = [];

	for (let i = 0; i < documentsArr.length; i++) {
		let curRecord = documentsArr[i];
		if (curRecord.doc_name && curRecord.doc_name.startsWith("pf_")) {
			let curPic = curRecord.doc_name.slice(3);
			let curPicSplit = curPic.split(".");
			curPicSplit.pop();
			curPic = curPicSplit.join(".");

			profilePicsToBeRemoved.push(curPic);
		}
	}

	for (let j = 0; j < documentsArr.length; j++) {
		for (let i = 0; i < profilePicsToBeRemoved.length; i++) {
			if (
				documentsArr[j].doc_name.includes(profilePicsToBeRemoved[i]) &&
				!documentsArr[j].doc_name.startsWith("pf_")
			)
				indicesToBeRemoved.push(j);
		}
	}

	for (let i = 0; i < indicesToBeRemoved.length; i++) {
		documentsArr.splice(indicesToBeRemoved[i] - i, 1);
	}
}

async function addOrFetchComments(red_data) {
	const {loan_id, loan_bank_mapping_id, comments, datetime, comment_ref_id, user_id, sales_id, case_id, doc_id, lender_status_id} =
		red_data;
	resData = {status: "ok"};
	let loanStatusComments;
	if ((case_id && comments) || (loan_id && comments)) {
		loanStatusComments = await LoanStatusComments.create({
			loan_bank_id: loan_bank_mapping_id,
			user_id,
			user_type: "API",
			comment_text: comments,
			lender_status_id: lender_status_id,
			created_time: datetime,
			created_timestamp: datetime,
			status: 1,
			assignee_id: sales_id,
			comment_ref_id,
			doc_id
		}).fetch();
		resData.message = "comments added successfully";
		// resData.data = loanStatusComments;
	} else if (case_id && comment_ref_id && !comments) {
		loanStatusComments = await LoanStatusCommentsRd.find({
			loan_bank_id: loan_bank_mapping_id,
			or: [{comment_ref_id}, {user_id: sales_id}]
		}).sort("created_time DESC");
		resData.message = "comments response";
		resData.query_response = loanStatusComments[0].comment_text;
	}
	return resData;
}

async function loanDetailsForView(reqData, search) {
	try {
		const {loan, business, users, sales_id, lender_status, loan_bank_mapping,
			white_label_id, createdUserId,
			loan_asset_type, loan_usage_type, loan_type, loan_products, usertype} = reqData,
			[usersData, salesData, createdUserData, loanData, businessData, loanAssetTypeData, loanUsageTypeData,
				loanTypeData, loanProductData, director_details, loan_document] =
				await Promise.all([
					usersDataFetch(users), usersDataFetch(sales_id), usersDataFetch(createdUserId),
					LoanrequestRd.findOne({id: loan}).select(["loan_request_type",
						"business_id", "loan_ref_id", "loan_amount", "loan_amount_um", "remarks_val", "modified_on", "loan_product_id", "RequestDate", "application_ref", "loan_origin", "connector_user_id", "document_upload",
						"applied_tenure", "annual_revenue", "revenue_um", "annual_op_expense", "op_expense_um", "cur_monthly_emi", "loan_status_id", "loan_sub_status_id", "parent_product_id", "createdUserId", "assignment_additional"]),
					BusinessRd.findOne({id: business}).select(["businessname", "userid", "first_name", "last_name", "businesstype", "customer_id"]),
					LoanAssetTypeRd.findOne({id: loan_asset_type}),
					LoanUsageTypeRd.findOne({id: loan_usage_type}),
					LoantypeRd.findOne({id: loan_type}).select("loanType"),
					LoanProductsRd.findOne({id: loan_products}).select(["product", "payment_structure", "security", "loan_request_type", "loan_type_id",
						"loan_asset_type_id", "loan_usage_type_id", "parent_flag", "parent_id", "created", "business_type_id", "dynamic_forms"]),
					directorDetails(business),
					LoanDocumentRd.find({
						loan,
						status: "active",
						doctype: {"!=": 0}
					}).select(["user_id", "doctype", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size", "directorId"])
						.populate("doctype")
						.limit(200)

				]);
		if (loanData && loanData.assignment_additional) {
			loanData.assignment_additional = await usersDataFetch(loanData.assignment_additional);
		}
		if (!loanProductData.dynamic_forms) {
			loanProductData.dynamic_forms = await sails.helpers.dynamicForms();
		}
		const [loan_product_details, parent_product, doc_count] = await Promise.all([
			loanProductsDetails(loan_products, white_label_id, businessData.businesstype, ""),
			loanProductsDetails("", "", "", loanData.parent_product_id),
			dbDocDetails(loan_products, businessData.businesstype, white_label_id, loan_document)]);

		loanData.createdUserId = createdUserData;
		const dataObj = {
			users: usersData,
			business: businessData,
			loan_products: loanProductData,
			loan_usage_type: loanUsageTypeData,
			loan_asset_type: loanAssetTypeData,
			loan: loanData,
			sales_id: salesData,
			assigned_credit_user: salesData,
			loan_type: loanTypeData,
			created_user: createdUserData,
			assigned_institute_user: createdUserData,
			is_assigned: false,
			loan_document: loan_document || [],
			director_details,
			assigned_extended_ids: [],
			bank_emp_data: {},
			bank_user: {},
			loan_bank_mapping: {},
			sanctionData: {},
			disbursementData: [],
			loan_product_details,
			parent_product,
			pending_doc_count: doc_count
		};
		if (loan_bank_mapping) {
			dataObj.loan_bank_mapping = await LoanBankMappingRd.findOne({id: loan_bank_mapping}).select(["bank_id", "bank_emp_id", "loan_bank_status", "loan_borrower_status", "meeting_flag", "assigned_extended_ids", "lender_status"]);
			dataObj.sanction_but_undisbured = dataObj.loan_bank_mapping.lender_status == 12 ? true : false;
			dataObj.lender_status = dataObj.loan_bank_mapping.lender_status = await LoanStatusWithLenderRd.findOne({id: lender_status}).select("status");
			dataObj.bank_user = dataObj.bank_emp_data = dataObj.loan_bank_mapping.bank_emp_id ?
				await usersDataFetch(dataObj.loan_bank_mapping.bank_emp_id) : null;
			if (dataObj.loan_bank_mapping.assigned_extended_ids) {
				const userId_arrData = dataObj.loan_bank_mapping.assigned_extended_ids.split(",");
				dataObj.assigned_extended_ids = await UsersRd.find({id: userId_arrData.map(Number)}).select("name");
			}
			dataObj.sanctionData = await LoanSanctionRd.find({loan_id: loan}).select(["sanction_status", "san_date"]);
			dataObj.disbursementData = lender_status == 16 && dataObj.sanctionData.length > 0 ?
				await LoanDisbursementRd.find({loan_sanction_id: dataObj.sanctionData[0].id}).sort("updated_at DESC").select("disbursement_date").limit(1) : [];
			dataObj.loan_bank_mapping.loan_status_comments = await LoanStatusCommentsRd.find({loan_bank_id: loan_bank_mapping}).sort("id DESC") || [];
		}
		const findTaskCount = await TaskUserMappingRd.count({
			loan_id: loan
		});
		// This is to display if the task is already being assigned to external evaluator
		if (findTaskCount > 0) {
			dataObj.is_assigned = true;
		}
		return dataObj;
	} catch (err) {
		console.log("errororrrrrrrrrrrrrrrrrrrrrrr---------------------------", err);
		return err;
	}
}
async function usersDataFetch(userid) {
	return (await UsersRd.findOne({id: userid}).select(["name", "email", "lender_id", "usertype", "parent_id", "user_sub_type"]));

}

async function loanProductsDetails(loan_product_id, white_label_id, businesstype, parent_product_id) {
	let whereCondition = {}, selectdata = [], resData;
	if (loan_product_id && white_label_id && businesstype) {
		{
			whereCondition = {
				white_label_id: white_label_id,
				isActive: "true",
				product_id: {contains: loan_product_id}
			};
			selectdata = ["product_id", "parent_id", "loan_request_type"];
		}
	} else {
		whereCondition = {
			id: parent_product_id
		};
		selectdata = ["product_id", "basic_details"];
	}
	const loanProductDetailsData = await LoanProductDetailsRd.find(whereCondition).select(selectdata);

	if (loanProductDetailsData.length > 0 && loan_product_id) {
		const product_data = loanProductDetailsData.find(
			(o) =>
				Object.keys(o.product_id).includes(businesstype.toString()) &&
				Object.values(o.product_id).includes(loan_product_id)
		);
		resData = product_data ? [product_data] : [];
	} else if (loanProductDetailsData.length > 0 && parent_product_id) {
		resData = {...JSON.parse(loanProductDetailsData[0].basic_details), ...loanProductDetailsData[0]};
		delete resData.basic_details;
	} else {
		resData = {};
	}
	return resData;
}
async function directorDetails(businessid) {
	const directorDetails = [];
	directorDetailsData = await DirectorRd.find({
		business: businessid,
		status: "active"
	}).select(["dpancard", "isApplicant", "daadhaar", "dpassport", "dvoterid", "dfirstname", "dlastname", "demail", "dcontact", "middle_name", "ddlNumber", "income_type", "type_name"]).limit(20);
	for (const dirElement of directorDetailsData) {
		if (dirElement.income_type == "business") {
			dirElement.income_type = 1;
		} else if (dirElement.income_type == "salaried") {
			dirElement.income_type = 7;
		} else {
			dirElement.income_type = 0;
		}
		directorDetails.push(dirElement);
	}
	return directorDetails;
}
async function dbDocDetails(loan_product_id, businesstype, white_label_id, loan_document) {
	const myDBStore = sails.getDatastore("mysql_namastecredit_read");
	let pending_doc_count = 0, tempKeys = {};
	const query =
		"select dt.doc_type_id,dt.doc_type,dt.name,dt.priority,dt.doc_detail from doctype dt,loan_product_document_mapping lp where dt.doc_type_id=lp.doctype_id and dt.status='active' and dt.priority in ('100','1','300') and lp.loan_product_id='" +
		loan_product_id +
		"' and find_in_set('" +
		businesstype +
		"',lp.businesstype_id) and  dt.white_label_id in (0,'" +
		white_label_id +
		"')";
	nativeResult = await myDBStore.sendNativeQuery(query);
	const result_data = nativeResult.rows,
		checkList = JSON.parse(JSON.stringify(result_data));
	if (loan_document.length > 0) {
		const documents = JSON.parse(JSON.stringify(loan_document));
		documents.forEach((obj) => {
			tempKeys[obj.doctype] = documents[obj.doctype];
		});
		const checkListLength = checkList.length,
			documentsLength = Object.keys(tempKeys).length;
		pending_doc_count = checkListLength - documentsLength;
		pending_doc_count = pending_doc_count;
	} else {
		pending_doc_count = checkList.length;
	}
	return pending_doc_count;
}
// async function uploadDocuments(document_details, loan_id, loan_bank_mapping, userid, uploaded_by){
// 	const dataRes = {
// 			doc_id : [],
// 			node_id : []
// 		},
// 		datetime = await sails.helpers.dateTime();
// 		 for(const docData of document_details){
// 		const data = {
// 				loan_bank_mapping,
// 				user_id: userid,
// 				loan: loan_id,
// 				doc_type: docData.doc_type_id,
// 				doc_name: docData.document_key,
// 				uploaded_doc_name:docData.upload_doc_name,
// 				status: "active",
// 				size_of_file: docData.size,
// 				ints: datetime,
// 				on_upd: datetime,
// 				uploaded_by
// 			},
// 			createdLenderDocRecord = await LenderDocument.create(data).fetch();
// 		dataRes.doc_id.push(createdLenderDocRecord.id);
// 		 }
// 	return dataRes;
// }
