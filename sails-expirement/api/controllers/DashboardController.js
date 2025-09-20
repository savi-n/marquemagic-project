/**
 * DashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/**
 * @api {get} /dashboard/ Dashboard-Loan Count Report
 * @apiName dashboard
 * @apiGroup dashboard
 * @apiExample Example usage:
 * curl -i localhost:1337/dashboard
 * @apiSuccess {object} yearly_report .
 * @apiSuccess {object[]} yearly_report.application_count
 * @apiSuccess {Number} yearly_report.application_count.id application count id.
 * @apiSuccess {String} yearly_report.application_count.white_label_id application white label id.
 * @apiSuccess {string} yearly_report.application_count.month
 * @apiSuccess {string} yearly_report.application_count.year
 * @apiSuccess {Number} yearly_report.application_count.ApplicationCount
 * @apiSuccess {Number} yearly_report.application_count.AvgPerDay
 * @apiSuccess {Number} yearly_report.application_count.last_Week_ApplicationCount
 * @apiSuccess {object[]} yearly_report.loan_offer_count
 * @apiSuccess {string} yearly_report.loan_offer_count.month
 * @apiSuccess {string} yearly_report.loan_offer_count.year
 * @apiSuccess {string} yearly_report.loan_offer_count.NoOfOffers
 * @apiSuccess {Number} yearly_report.loan_offer_count.MaxOffer_amt
 * @apiSuccess {Number} yearly_report.loan_offer_count.Avg_Amt
 * @apiSuccess {object[]} yearly_report.loan_disbursed_count
 * @apiSuccess {Number} yearly_report.loan_disbursed_count.id
 * @apiSuccess {string} yearly_report.loan_disbursed_count.white_label_id
 * @apiSuccess {string} yearly_report.loan_disbursed_count.month
 * @apiSuccess {Number} yearly_report.loan_disbursed_count.year
 * @apiSuccess {Number} yearly_report.loan_disbursed_count.DisbursementCount
 * @apiSuccess {Number} yearly_report.loan_disbursed_count.Total_DisbursementAmt
 * @apiSuccess {Number} yearly_report.loan_disbursed_count.Avg
 * @apiSuccess {Object} yearly_report.app_usage_points
 * @apiSuccess {Number} yearly_report.app_usage_points.current_month_points
 * @apiSuccess {Number} yearly_report.app_usage_points.total_points
 * @apiSuccess {Number} yearly_report.sum_paid_invoice
 * @apiSuccess {Number} yearly_report.expected_payout
 * @apiSuccess {object} yearly_report.offerAmount
 * @apiSuccess {string} yearly_report.offerAmount.loan_ref_id
 * @apiSuccess {Number} yearly_report.offerAmount.offer_amnt
 * @apiSuccess {string} yearly_report.offerAmount.offer_amnt_um
 * @apiSuccess {string} yearly_report.offerAmount.product
 * @apiSuccess {string} yearly_report.offerAmount.upts updated date and time.
 * @apiSuccess {object} yearly_report.disbursmentAmount
 * @apiSuccess {string} yearly_report.disbursmentAmount.loan_ref_id
 * @apiSuccess {Number} yearly_report.disbursmentAmount.disbursement_amt
 * @apiSuccess {string} yearly_report.disbursmentAmount.disbursement_amt_um
 * @apiSuccess {string} yearly_report.disbursmentAmount.product
 * @apiSuccess {string} yearly_report.disbursmentAmount.upts updated date and time.
 * @apiSuccess {Number} yearly_report.applicationCount
 * @apiSuccess {object} yearly_report.relationshipManagerDetails
 * @apiSuccess {string} yearly_report.relationshipManagerDetails.name
 * @apiSuccess {string} yearly_report.relationshipManagerDetails.email
 * @apiSuccess {string} yearly_report.relationshipManagerDetails.contact
 * @apiSuccess {Object[]} channelRating
 * @apiSuccess {Number} channelRating.id
 * @apiSuccess {String} channelRating.channel_rating
 * @apiSuccess {Object} channelRating.rating_type
 * @apiSuccess {Number} channelRating.rating_type.id
 * @apiSuccess {Number} channelRating.rating_type.min_value
 * @apiSuccess {Number} channelRating.rating_type.max_value
 * @apiSuccess {String} channelRating.rating_type.rating_type
 * @apiSuccess {String} lastLogin
 */
const crypto = require('crypto');
const otherUsers = require("../controllers/OtherUsersController");
const redis = require("ioredis");
// eslint-disable-next-line max-len
const redis_conn =new  redis.Cluster([{host: sails.config.redis.host ,port: 6379},{ host: sails.config.redis.host_sec,port: 6379},{ host: sails.config.redis.host_third,port: 6379}]);
// if (sails.config.redis.host == "127.0.0.1") {
// 	const redis_conn = new redis.Redis({
// 	host: sails.config.redis.host,
// 	port: 6379
// 	});
	
// 	} else {
// 	const redis_conn = new redis.Cluster([{
// 	host: sails.config.redis.host,
// 	port: 6379
// 	}, {
// 	host: sails.config.redis.host_sec,
// 	port: 6379
// 	}]);
// 	}

module.exports = {
	index: async function (req, res, next) {
		if (sails.config.otherUsersTypes.find((element) => element == req.user.usertype)) {
			let data = await otherUsers.dashboard(req);
			return res.ok(data);
		}
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		const moment = require("moment");
		const date = moment(new Date()), // 2009-11-10
			month = moment(date.month() + 1, "M").format("MMMM"),
			user_whitelabel = req.user.loggedInWhiteLabelID;
		let loan_request_type,
			business_industry_type,
			forRes,
			queryPart,
			lastDate,
			sailsObjData,
			channel_data,
			dashboardQryCountDetails = [],
			lenderDetails = [];
		const userid = [],
			reqUserId = req.user["id"];
		//application-points
		docDisbursCount =
			docUploadCount =
			lenderofferCount =
			currMonthContactCount =
			currMonthApplCount =
			currMonthApplPoints =
			totApplPoints =
			currLoanDocPoints =
			totLoanDocPoints =
			totLoanDisbursmentPoints =
			currLoanDisbursmentPoints =
			totLoanOfferPoints =
			totLoanLenderPoints =
			currLoanLenderPoints =
			currLoanOfferPoints =
			currMonthContactPoints =
			points =
			currMonthPoints =
			totPoints =
			currMonthLogPoints =
			totLogPoints =
			totContactPoints =
				0;
		if (req.user.is_corporate == 1) {
			const userCorpData = await UserCorporateMappingRd.findOne({userid: reqUserId});
			if (userCorpData) {
				userid.push(userCorpData.created_by, userCorpData.userid);
			}
		}
		//get the users
		const users = await UsersRd.find({
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
					id: user_whitelabel
				}
			}),
			arrData = whiteLabelData.assignment_type.loans.assignment;
		arrData &&
			arrData.forEach((Element) => {
				forRes =
					Element.hasOwnProperty(req.user.usertype) && Element[req.user.usertype] === req.user.user_sub_type;
			});
		if (req.user.usertype == "Bank") {
			req.user.is_lender_manager == 1
				? (queryPart = `(userid in (${userid}) or createdUserId = ${req.user.id} or sales_id = ${req.user.id} or bank_emp_id = ${req.user.id} or bank_id = ${req.user.id})`)
				: (queryPart = `(userid in (${userid}) or createdUserId = ${req.user.id} or sales_id = ${req.user.id} or bank_emp_id = ${req.user.id})`);
			forRes
				? queryPart
				: (queryPart = `(userid in (${userid}) or createdUserId = ${req.user.id} or bank_emp_id = ${req.user.id} or bank_id = ${req.user.id})`);
		} else if (req.user.usertype == "Analyzer") {
			queryPart = `(createdUserId = ${req.user.id} or sales_id = ${req.user.id})`;
		} else {
			queryPart = `(userid in (${userid}))`;
		}
		const expirationInSeconds=sails.config.redis.specific_key_half_day;
		let applicationCountQueryResults,reassignCount,loanOfferQryResults,loanDisbursmentMonthlyQryResults;
		const reasssignQuery = `select count(loanId) as loan_count from namastecredit.view_loan where ${queryPart} and loan_status_id = 2 and loan_sub_status_id = 9 and loan_bank_status = 10 and loan_borrower_status = 4 and white_label_id = ${user_whitelabel};`;
		const reasssignQuery_md5 =await crypto.createHash('md5').update(reasssignQuery.toString()).digest('hex');
		const reasssignQuery_key = null; // await redis_conn.exists(reasssignQuery_md5);
		if(reasssignQuery_key===1){
			var view_loan_data=await redis_conn.get(reasssignQuery_md5);
			reassignCount=await JSON.parse(view_loan_data).data;
		}else{
			const nativeResult = await myDBStore.sendNativeQuery(reasssignQuery);
			reassignCount = nativeResult.rows;	
			//b=await redis_conn.set(reasssignQuery_md5, JSON.stringify({"data":reassignCount}));
			//c=await redis_conn.expire(reasssignQuery_md5, expirationInSeconds);
		}

		const ApplicationReportRd_md5=crypto.createHash('md5').update("ApplicationReportRd_"+JSON.stringify({id: userid,white_label_id: user_whitelabel})).digest('hex');
		const ApplicationReportRd_key = null; // await redis_conn.exists(ApplicationReportRd_md5);
		if(ApplicationReportRd_key===1){
			var view_loan_data=await redis_conn.get(ApplicationReportRd_md5);
			applicationCountQueryResults=await JSON.parse(view_loan_data).data;
		}else{
			applicationCountQueryResults = await ApplicationReportRd.find({
				id: userid,
				white_label_id: user_whitelabel
			});
			//b=await redis_conn.set(ApplicationReportRd_md5, JSON.stringify({"data":applicationCountQueryResults}));
			//c=await redis_conn.expire(ApplicationReportRd_md5, expirationInSeconds);
		}



		const OfferReportRd_md5= await crypto.createHash('md5').update("OfferReportRd_"+JSON.stringify({id: userid,white_label_id: user_whitelabel})).digest('hex');
		const OfferReportRd_key =null; // await redis_conn.exists(OfferReportRd_md5);
		if(OfferReportRd_key===1){
			var view_loan_data=await redis_conn.get(OfferReportRd_md5);
			loanOfferQryResults=await JSON.parse(view_loan_data).data;
		}else{

			//----------------------------------------------------loan offer query results
			loanOfferQryResults = await OfferReportRd.find({
				id: userid,
				white_label_id: user_whitelabel
			});
			//b=await redis_conn.set(OfferReportRd_md5, JSON.stringify({"data":loanOfferQryResults}));
			//c=await redis_conn.expire(OfferReportRd_md5, expirationInSeconds);
		}





		const DisbursementReportRd_md5= await crypto.createHash('md5').update("DisbursementReportRd_"+JSON.stringify({id: userid,white_label_id: user_whitelabel})).digest('hex');
		const DisbursementReportRd_key = null; //await redis_conn.exists(DisbursementReportRd_md5);
		if(DisbursementReportRd_key===1){
			var view_loan_data=await redis_conn.get(DisbursementReportRd_md5);
			loanDisbursmentMonthlyQryResults=await JSON.parse(view_loan_data).data;

		}else{
			loanDisbursmentMonthlyQryResults = await DisbursementReportRd.find({
				id: userid,
				white_label_id: user_whitelabel
			});
			//b=await redis_conn.set(DisbursementReportRd_md5, JSON.stringify({"data":loanDisbursmentMonthlyQryResults}));
			//c=await redis_conn.expire(DisbursementReportRd_md5, expirationInSeconds);
		}
		


		const PointsReportRd_md5= await crypto.createHash('md5').update("PointsReportRd_"+JSON.stringify({id: reqUserId,white_label_id: user_whitelabel,app_month: month})).digest('hex');
		const PointsReportRd_key = null; // await redis_conn.exists(PointsReportRd_md5);
		let PointsReportQryResults,invoice_data;
		if(PointsReportRd_key===1){
			var view_loan_data=await redis_conn.get(PointsReportRd_md5);
			PointsReportQryResults=await JSON.parse(view_loan_data).data;

		}else{
			PointsReportQryResults = await PointsReportRd.find({
				id: reqUserId,
				white_label_id: user_whitelabel,
				app_month: month
			});

			//b=await redis_conn.set(PointsReportRd_md5, JSON.stringify({"data":PointsReportQryResults}));
			//c=await redis_conn.expire(PointsReportRd_md5, expirationInSeconds);
		}

			


		logService = await sails.helpers.logtrackservice(req, "dashboard", req.user.id, "dashboard_report");

		//---------------------------------------------APPLICATION USAGE POINTS BASED ON USER
	
		if (req.user.usertype == "Bank" && req.user.lender_id != "" && req.user.lender_id != null) {
			LenderDashboardRd_md5= await crypto.createHash('md5').update("LenderDashboardRd_"+JSON.stringify({white_label_id: user_whitelabel,or: [{id: req.user.id}, {id: req.user.lender_id}]})).digest('hex');
			const LenderDashboardRd_key = null; // await redis_conn.exists(LenderDashboardRd_md5);
			if(LenderDashboardRd_key===1){
				var view_loan_data=await redis_conn.get(LenderDashboardRd_md5);
				const lenderDetails=await JSON.parse(view_loan_data).data;

			}else{
				lenderDetails = await LenderDashboardRd.find({
					white_label_id: user_whitelabel,
					or: [{id: req.user.id}, {id: req.user.lender_id}]
				});

				//b=await redis_conn.set(LenderDashboardRd_md5, JSON.stringify({"data":lenderDetails}));
				//c=await redis_conn.expire(LenderDashboardRd_md5, expirationInSeconds);
			}

			
		}
		_.each(PointsReportQryResults, (pointsReport) => {
			if (pointsReport.type == "ApplicationCreation_contacts") {
				currMonthApplCount = pointsReport.app_count;
				currMonthContactCount = pointsReport.contacts;
				currMonthApplPoints = currMonthApplCount * 100;
				currMonthContactPoints = currMonthContactCount * 10;
			}
			if (pointsReport.type == "LenderAssignOffer") {
				lenderofferCount = pointsReport.lenderoffer;
				lenderAssignCount = pointsReport.lenderassign;
				currLoanLenderPoints = lenderAssignCount * 30;
				currLoanOfferPoints = lenderofferCount * 50;
			}
			if (pointsReport.type == "DocumentUpload") {
				docUploadCount = pointsReport.doc_upload;
				currLoanDocPoints = docUploadCount * 20;
			}
			if (pointsReport.type == "DisbursLoan") {
				docDisbursCount = pointsReport.disburs;
				currLoanDisbursmentPoints = docDisbursCount * 200;
			}
			if (pointsReport.type == "Login") {
				loginCount = pointsReport.login_count;
				currMonthLogPoints = loginCount * 20;
			}
		});

		const inv_query =
			"SELECT sum(tbl_payment_paid.amount_paid) AS amt  FROM tbl_payment_paid  left join tbl_payment on tbl_payment.paymentId = tbl_payment_paid.payment_id left join loan_bank_mapping on tbl_payment.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id left join loanrequest on loan_bank_mapping.loan_id = loanrequest.loanId left join business on loanrequest.business_id = business.businessid WHERE business.userid in (" +
			userid +
			") and loanrequest.white_label_id = " +
			user_whitelabel +
			"";
		const inv_query_md5 = crypto.createHash('md5').update(inv_query.toString()).digest('hex');
		const inv_query_key = null; // await redis_conn.exists(inv_query_md5);

		if(inv_query_key===1){
			var view_loan_data=await redis_conn.get(inv_query_md5);
			invoice_data=await JSON.parse(view_loan_data).data;

		}else{
			nativeResult = await myDBStore.sendNativeQuery(inv_query);
			invoice_data = nativeResult.rows;
			//b=await redis_conn.set(inv_query_md5, JSON.stringify({"data":invoice_data}));
			//c=await redis_conn.expire(inv_query_md5, expirationInSeconds);
		}


		
		const potential_query1 =
				"SELECT sum(round((if(ld.disbursement_amt_um='Lakhs',ld.disbursement_amt*100000,ld.disbursement_amt*10000000) *cp.payout_percentage) /100)) potential_payout FROM business b, loanrequest l,loan_bank_mapping lbm,loan_disbursement ld,channel_payout cp WHERE b.businessid = l.business_id AND l.loanId = lbm.loan_id AND lbm.loan_bank_mapping_id = ld.loan_bank_mapping_id and l.loan_product_id=cp.loan_product_id and l.white_label_id=cp.white_label_id and l.loan_status_id=2 and l.loan_sub_status_id=9 and lbm.loan_bank_status=12 and lbm.loan_borrower_status=12 and lbm.lender_status_id in (16,17) AND ( b.userid in (" +
				userid +
				")) and ld.disbursementId not in (select disbursement_id from unique_revenue_status)";
		
		const potential_query1_md5 = await crypto.createHash('md5').update(potential_query1.toString()).digest('hex');
		const potential_query1_key = null; //await redis_conn.exists(potential_query1_md5);
		let potential_data1;
		if(potential_query1_key===1){
			var view_loan_data=await redis_conn.get(potential_query1_md5);
			potential_data1=await JSON.parse(view_loan_data).data;
		}else{
			nativeResult = await myDBStore.sendNativeQuery(potential_query1);
			potential_data1 = nativeResult.rows;
			//b=await redis_conn.set(potential_query1_md5, JSON.stringify({"data":potential_data1}));
			//c=await redis_conn.expire(potential_query1_md5, expirationInSeconds);
		}

		const	potential_query2 =
				"SELECT (sum((tbl_payment.disbursement_amount*tbl_payment.channel_payout_percentage)/100)) as  potential_payout from tbl_payment left join loan_bank_mapping on tbl_payment.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id left join loanrequest on loan_bank_mapping.loan_id = loanrequest.loanId left join business on loanrequest.business_id = business.businessid where business.userid in (" +
				userid +
				") and loanrequest.white_label_id = 1 and tbl_payment.payment_status in (5,6,18)";
		const potential_query2_md5 = await crypto.createHash('md5').update(potential_query2.toString()).digest('hex');
		const potential_query2_key = null; // await redis_conn.exists(potential_query2_md5);
		let potential_data2,offerAmt,disburseAmt,applicationProcessed;
		if(potential_query1_key===1){
			var view_loan_data=await redis_conn.get(potential_query2_md5);
			if (view_loan_data){
				        potential_data2=await JSON.parse(view_loan_data).data;
			} else  {
					     nativeResult = await myDBStore.sendNativeQuery(potential_query2);
				         potential_data2 = nativeResult.rows;
				         //b=await redis_conn.set(potential_query2_md5, JSON.stringify({"data":potential_data2}));
				         //c=await redis_conn.expire(potential_query2_md5, expirationInSeconds);
			}
		}else{
			nativeResult = await myDBStore.sendNativeQuery(potential_query2);
			potential_data2 = nativeResult.rows;
			//b=await redis_conn.set(potential_query2_md5, JSON.stringify({"data":potential_data2}));
			//c=await redis_conn.expire(potential_query2_md5, expirationInSeconds);
		}

		final_potential_amt = potential_data1[0].potential_payout + potential_data2[0].potential_payout;
		const offerAmtQuery ="select l.loan_ref_id,lp.product,lbm.offer_amnt,lbm.offer_amnt_um,lbm.upts from users u join business b on u.userid=b.userid join loanrequest l on l.business_id=b.businessid join loan_bank_mapping lbm on l.loanId=lbm.loan_id join loan_products lp on l.loan_product_id=lp.id where u.status='Active' and u.userid=" +reqUserId +" and u.white_label_id = " +user_whitelabel +" order by 5 desc limit 1";
		const offerAmtQuery_md5 = await crypto.createHash('md5').update(offerAmtQuery.toString()).digest('hex');
		const offerAmtQuery_key = null; // await redis_conn.exists(offerAmtQuery_md5);

		if(offerAmtQuery_key===1){
			var view_loan_data=await redis_conn.get(offerAmtQuery_md5);
			offerAmt=await JSON.parse(view_loan_data).data;
		}else{
			nativeResult = await myDBStore.sendNativeQuery(offerAmtQuery);
			offerAmt = nativeResult.rows[0];
			//b=await redis_conn.set(offerAmtQuery_md5, JSON.stringify({"data":offerAmt}));
			//c=await redis_conn.expire(offerAmtQuery_md5, expirationInSeconds);
		}

		const disbursmentAmtQuery ="select l.loan_ref_id,lp.product,ld.disbursement_amt,ld.disbursement_amt_um,lbm.upts from users u join business b on u.userid=b.userid join loanrequest l on l.business_id=b.businessid join loan_bank_mapping lbm on l.loanId=lbm.loan_id join loan_products lp on l.loan_product_id=lp.id join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id where u.status='Active' and u.userid=" +reqUserId +" and u.white_label_id = " +user_whitelabel +" order by 5 desc limit 1";

		const disbursmentAmtQuery_md5 = await crypto.createHash('md5').update(disbursmentAmtQuery.toString()).digest('hex');
		const disbursmentAmtQuery_key = null; // await redis_conn.exists(disbursmentAmtQuery_md5);
		if(disbursmentAmtQuery_key===1){
			var view_loan_data=await redis_conn.get(disbursmentAmtQuery_md5);
			disburseAmt=await JSON.parse(view_loan_data).data;
		}else{
			nativeResult = await myDBStore.sendNativeQuery(disbursmentAmtQuery);
			disburseAmt = nativeResult.rows[0];
			//b=await redis_conn.set(disbursmentAmtQuery_md5, JSON.stringify({"data":disburseAmt}));
			//c=await redis_conn.expire(disbursmentAmtQuery_md5, expirationInSeconds);
		}

		const applicationProcessedQuery ="select count(loanId) as loan_count from loanrequest left join business on loanrequest.business_id = business.businessid where business.userid in (" +userid +")";
		const applicationProcessedQuery_md5 = await crypto.createHash('md5').update(applicationProcessedQuery.toString()).digest('hex');
		
		const applicationProcessedQuery_key = null; // await redis_conn.exists(applicationProcessedQuery_md5);
		if(applicationProcessedQuery_key===1){
			var view_loan_data=await redis_conn.get(applicationProcessedQuery_md5);
			applicationProcessed=await JSON.parse(view_loan_data).data;
		}else{
			var nativeResult = await myDBStore.sendNativeQuery(applicationProcessedQuery);
			applicationProcessed = nativeResult.rows[0];
			//b=await redis_conn.set(applicationProcessedQuery_md5, JSON.stringify({"data":applicationProcessed}));
			//c=await redis_conn.expire(applicationProcessedQuery_md5, expirationInSeconds);
		}

		/*
		nativeResult = await myDBStore.sendNativeQuery(applicationProcessedQuery);
		const applicationProcessed = nativeResult.rows[0],*/

		let userDetails = await UsersRd.findOne({id: reqUserId}),
			sailsUserData = await UsersRd.findOne({
				id: userDetails.assigned_sales_user
			});
		sailsUserData != undefined
			? (sailsObjData = {
				name: sailsUserData.name,
				email: sailsUserData.email,
				contact: sailsUserData.contact
			  })
			: (sailsObjData = {});
		currMonthPoints =
			currMonthApplPoints +
			currLoanDocPoints +
			currLoanOfferPoints +
			currLoanLenderPoints +
			currMonthContactPoints +
			currLoanDisbursmentPoints +
			currMonthLogPoints;
		points = {
			current_month_points: currMonthPoints != null ? currMonthPoints : 0,
			total_points: totPoints
		};
		dashboardQryCountDetails = {
			application_count: applicationCountQueryResults != "" ? applicationCountQueryResults : [],
			loan_offer_count: loanOfferQryResults != "" ? loanOfferQryResults : [],
			loan_disbursed_count: loanDisbursmentMonthlyQryResults != "" ? loanDisbursmentMonthlyQryResults : [],
			app_usage_points: points,
			sum_paid_invoice: invoice_data[0].amt,
			expected_payout: final_potential_amt,
			offerAmount: offerAmt != "" ? offerAmt : {},
			disbursmentAmount: disburseAmt != "" ? disburseAmt : {},
			applicationCount: applicationProcessed.loan_count,
			relationshipManagerDetails: sailsObjData
		};
		const channel_rating = await ChannelRatingRd.find({
			channel_id: req.user.id
		})
			.sort([{created_On: "DESC"}, {updated_On: "DESC"}])
			.limit(1)
			.select(["channel_rating", "rating_type"]);
		if (channel_rating.length > 0) {
			channel_data = channel_rating[0];
		} else {
			channel_data = null;
		}
		const lastLoginDate = await AuditLogTableRd.find({
			where: {
				user_id: req.user.id,
				action_reference: "users",
				action: "Read"
			},
			select: ["request_time"]
		})
			.sort([{id: "DESC"}])
			.limit(2);
		lastLoginDate.length > 0
			? lastLoginDate.length > 1
				? (lastDate = lastLoginDate[1].request_time)
				: (lastDate = lastLoginDate[0].request_time)
			: (lastDate = "");
		const pwdComplexity = await WhiteLabelSolutionRd.findOne({
			where: {
				id: user_whitelabel
			},
			select: ["password_rule"]
		});
		lenderDetails.push({
			category: "ReassignToNC",
			count: reassignCount[0].loan_count
		});
		return res.ok({
			status: "ok",
			message: "User Report",
			channelRating: channel_data,
			lastLogin: lastDate,
			passwordComplexity: pwdComplexity && pwdComplexity.password_rule,
			payload: {
				lenderDetails: lenderDetails,
				yearly_report: dashboardQryCountDetails,
				reassign: {
					category: "ReassignToNC",
					count: reassignCount[0].loan_count
				}
			},
			azure: sails.config.azure.isActive
		});
	}
};
