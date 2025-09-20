/**
 * RevenuePaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
/**
 * * payment index initiate list
 *
 * @description :: invoice payment initiate list
 * @api {get} /invoice/initiate-list/ Payment-Initiate-List
 * @apiName Payment-Initiate-List
 * @apiGroup payment
 *  @apiExample Example usage:
 * curl -i localhost:1337/invoice/initiate-list/
 *
 * @apiSuccess {String} status status.
 * @apiSuccess {Object[]} loan_details loan details.
 * @apiSuccess {Number} loan_details.id id.
 * @apiSuccess {String} loan_details.white_label_id white label id.
 * @apiSuccess {String} loan_details.status_caption caption
 * @apiSuccess {String} loan_details.payment_status payment status
 * @apiSuccess {Object} loan_details.user logged in user details.
 * @apiSuccess {Object} loan_details.business business details.
 * @apiSuccess {Object} loan_details.loan loan details.
 * @apiSuccess {Object} loan_details.loan_bank_mapping loan bank mapping details.
 * @apiSuccess {Object} loan_details.bank bank details.
 * @apiSuccess {Object} loan_details.loan_product loan product details.
 * @apiSuccess {Object} loan_details.loan_disbursement loan disbursement details.
 * @apiSuccess {String} loan_details.payment payment.
 * @apiSuccess {Object} loan_details.channel_payout channel payout details.
 * @apiSuccess {Object[]} status_details
 * @apiSuccess {Number} status_details.id id.
 * @apiSuccess {String} status_details.name name.
 * @apiSuccess {String} status_details.status1
 * @apiSuccess {String} status_details.status2
 * @apiSuccess {String} status_details.status3
 * @apiSuccess {String} status_details.status4
 * @apiSuccess {String} status_details.status5
 * @apiSuccess {String} status_details.status6
 * @apiSuccess {String} status_details.white_label_id white label id.
 * @apiSuccess {String} status_details.parent_flag parent flag id.
 * @apiSuccess {String} status_details.parent_id parent id.
 * @apiSuccess {String} status_details.status
 * @apiSuccess {String} status_details.execulded_users
 * @apiSuccess {Number} status_details.sort_by_id
 * @apiSuccess {String} status_details.exclude_user_ncdoc
 * @apiSuccess {String} status_details.caption caption.

 */

module.exports = {
	indexnew: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") * req.param("limit") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel}),
			myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			//invoice query
			userid = req.user["id"],
			inv_query = `select
				s.loan_bank_mapping_id,
				s.loanId,
				s.loan_ref_id,
				s.loan_status_id,
				s.loan_sub_status_id,
				s.loan_request_type,
				s.loan_amount,
				s.loan_amount_um,
				s.loan_product_id,
				s.Channel_payout_percentage,
				s.userid,
				s.name,
				s.email,
				s.contact,
				s.assigned_sales_user,
				s.parent_id,
				s.usertype,
				s.loan_bank_status,
				s.loan_borrower_status,
				s.bank_id,
				s.bank_emp_id,
				s.lender_ref_id,
				s.lender_status_id,
				s.businessid,
				s.businessname,
				s.first_name,
				s.last_name,
				s.business_email,
				s.businesstype,
				s.businesspancardnumber,
				s.san_amount,
				s.amount_um,
				s.san_date,
				s.upload_path,
				s.loan_repay,
				s.channel_invoice,
				s.sanction_process_fee,
				s.san_interest,
				s.upts,
				s.disbursementId,
				s.disbursement_amt,
				s.disbursement_amt_um,
				s.disbursement_channel_invoice,
				s.repayment_doc,
				s.lender_confirmation,
				s.paymentId,
				p.payment_loan_bank_mapping,
				p.Payment_disbursementid,
				p.payment_status_caption,
				p.payment_rev_id,
				p.payment_rev_comment
			FROM   (SELECT ld.llc_upddatetime,
			
			
					lbm.loan_bank_mapping_id,
					l.loanId,
					l.loan_ref_id,
					l.loan_status_id,
					l.loan_sub_status_id,
					l.loan_request_type,
					l.loan_amount,
					l.loan_amount_um,
					l.loan_product_id,
					cp.payout_percentage as Channel_payout_percentage,
					u.userid,
					u.name,
					u.email,
					u.contact,
					u.assigned_sales_user,
					u.parent_id,
					u.usertype,
					lbm.loan_bank_status,
					lbm.loan_borrower_status,
					lbm.bank_id,
					lbm.bank_emp_id,
					lbm.lender_ref_id,
					lbm.lender_status_id,
					b.businessid,
					b.businessname,
					b.first_name,
					b.last_name,
					b.business_email,
					b.businesstype,
					b.businesspancardnumber,
					ls.san_amount,
					ls.amount_um,
					ls.san_date,
					ls.upload_path,
					ls.loan_repay,
					ls.channel_invoice,
					ls.sanction_process_fee,
					ls.san_interest,
					ld.upts,
					ld.disbursementId,
					ld.disbursement_amt,
					ld.disbursement_amt_um,
					ld.channel_invoice AS disbursement_channel_invoice,
					ld.repayment_doc,
					ld.lender_confirmation,
					(
					SELECT
						pay.paymentId
					FROM
						tbl_payment pay
					WHERE
						pay.loan_bank_mapping_id = lbm.loan_bank_mapping_id
						AND pay.disbursement_id = ld.disbursementId
					ORDER BY
						pay.paymentId DESC
					LIMIT
						1
					) AS paymentId
				FROM
					loanrequest l,
					users u,
					business b,
					loan_bank_mapping lbm,
					loan_sanction ls,
					loan_disbursement ld,
					channel_payout cp
				WHERE
					l.business_id = b.businessid
					AND l.loan_product_id = cp.loan_product_id
					and cp.white_label_id = ${user_whitelabel}
					AND u.userid = b.userid
					AND l.white_label_id = ${user_whitelabel}
					AND lbm.loan_id = l.loanid
					AND lbm.loan_bank_mapping_id = ls.loan_bank_map_id
					AND ls.loan_bank_map_id = ld.loan_bank_mapping_id
					AND lbm.loan_bank_status = '12'
					AND lbm.loan_borrower_status = '12'
					AND l.business_id = b.businessid
					AND ld.loan_sanction_id = ls.id
				) s
				left join (
				SELECT
					b.loan_bank_mapping_id as payment_loan_bank_mapping,
					b.disbursement_id as Payment_disbursementid,
					CASE WHEN b.type = 'payment' THEN b.status_caption END AS payment_status_caption,
					CASE WHEN b.type = 'payment' THEN b.rev_id END AS payment_rev_id,
					CASE WHEN b.type = 'payment' THEN b.comments END AS payment_rev_comment
				FROM
					(
					SELECT
						rsc.disbursement_id,
						MAX(rsc.id) AS id
					FROM
						revenue_status rs,
						revenue_status_comments rsc,
						loan_bank_mapping lb,
						loan_disbursement ld
					WHERE
						rsc.comment_id = rs.rev_id
						AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id
						AND rsc.disbursement_id = ld.disbursementId
						AND rsc.type = 'payment'
					GROUP BY
						1
					) AS a
					LEFT OUTER JOIN (
					SELECT
						rsc.loan_bank_mapping_id,
						rsc.disbursement_id,
						rsc.type,
						rev_id,
						status_caption,
						rsc.comments,
						rsc.id AS id
					FROM
						revenue_status rs,
						revenue_status_comments rsc,
						loan_bank_mapping lb,
						loan_disbursement ld
					WHERE
						rsc.type = 'payment'
						and rsc.comment_id = rs.rev_id
						AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id
						AND rsc.disbursement_id = ld.disbursementId
					) AS b ON a.id = b.id
				) as p on s.disbursementId = p.Payment_disbursementid
			where
			s.llc_upddatetime IS NOT NULL and
			
				(
			
				p.payment_rev_id is NULL
				or p.payment_rev_id = 5
				)
				and (
				s.userid = ${userid}
				or s.parent_id =  ${userid}
				)
			limit ${page_count}, ${limit_count}`;
		nativeResult = await myDBStore.sendNativeQuery(inv_query);
		const data = nativeResult.rows,
			dataResult = [],
			logService = await sails.helpers.logtrackservice(req, "invoice/indexnew", req.user.id, "revenue_payment");
		//--channel payout details
		Promise.all(
			data.map(async (invoiceListElement) => {
				invoiceListElement.status_caption = invoiceListElement.payment_status_caption;
				invoiceListElement.payment_status = invoiceListElement.payment_rev_id;
				invoiceListElement.id = invoiceListElement.disbursementId;
				invoiceListElement.white_label_id = user_whitelabel;
				//payment
				if (invoiceListElement.paymentId) {
					invoiceListElement.payment = invoiceListElement.paymentId;
					// var payment = await TblPaymentRd.findOne({
					//   id: invoiceListElement.paymentId
					// }).then(result => {
					//   if (result) {
					//     invoiceListElement.payment = result;
					//   } else {
					//     invoiceListElement.payment = {};
					//   }
					// });
				} else {
					invoiceListElement.payment = null;
				}
				//loan_disbursement
				if (invoiceListElement.disbursementId) {
					const loan_disbursement = await LoanDisbursementRd.findOne({
						id: invoiceListElement.disbursementId
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_disbursement = result;
						} else {
							invoiceListElement.loan_disbursement = {};
						}
					});
				} else {
					invoiceListElement.loan_disbursement = {};
				}
				//loan_product
				if (invoiceListElement.loan_product_id) {
					var loan_bank_mapping = await LoanProductsRd.findOne({
						id: invoiceListElement.loan_product_id
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_product = result;
						} else {
							invoiceListElement.loan_product = {};
						}
					});
				} else {
					invoiceListElement.loan_product = {};
				}
				//loan_bank_mapping
				if (invoiceListElement.loan_bank_mapping_id) {
					var loan_bank_mapping = await LoanBankMappingRd.findOne({
						id: invoiceListElement.loan_bank_mapping_id
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_bank_mapping = result;
						} else {
							invoiceListElement.loan_bank_mapping = {};
						}
					});
				} else {
					invoiceListElement.loan_bank_mapping = {};
				}
				//bank
				if (invoiceListElement.bank_id) {
					const bank = await BankMasterRd.findOne({
						id: invoiceListElement.bank_id
					}).then((result) => {
						if (result) {
							invoiceListElement.bank = result;
						} else {
							invoiceListElement.bank = {};
						}
					});
				} else {
					invoiceListElement.bank = {};
				}
				//loan
				if (invoiceListElement.loanId) {
					const loan = await LoanrequestRd.findOne({
						id: invoiceListElement.loanId
					}).then((result) => {
						if (result) {
							invoiceListElement.loan = result;
						} else {
							invoiceListElement.loan = {};
						}
					});
				} else {
					invoiceListElement.loan = {};
				}
				//business
				if (invoiceListElement.businessid) {
					const business = await BusinessRd.findOne({
						id: invoiceListElement.businessid
					}).then((result) => {
						if (result) {
							invoiceListElement.business = result;
						} else {
							invoiceListElement.business = {};
						}
					});
				} else {
					invoiceListElement.business = {};
				}
				//user details
				if (invoiceListElement.userid) {
					const user = await UsersRd.findOne({
						id: invoiceListElement.userid
					}).then((result) => {
						if (result) {
							invoiceListElement.user = result;
						} else {
							invoiceListElement.user = {};
						}
					});
				} else {
					invoiceListElement.user = {};
				}
				//channel_payout
				if (invoiceListElement.loan_product_id) {
					const channel_payout = await ChannelPayoutRd.findOne({
						loan_product_id: invoiceListElement.loan_product_id,
						white_label_id: user_whitelabel
					}).then((result) => {
						if (result) {
							invoiceListElement.channel_payout = result;
						} else {
							invoiceListElement.channel_payout = {};
						}
					});
					return channel_payout;
				} else {
					invoiceListElement.channel_payout = {};
				}
			})
		).then(() => {
			return res.send({
				status: "ok",
				loan_details: data,
				status_details: ncStatusManage,
				userid: userid
			});
		});
	},
	rev_index: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") * req.param("limit") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel}),
			myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			//invoice query
			userid = req.user["id"],
			inv_query =
				"select s.loan_bank_mapping_id,s.loanId,s.loan_ref_id,s.loan_status_id,s.loan_sub_status_id,s.loan_request_type,s.loan_amount,s.loan_amount_um, s.loan_product_id,s.Channel_payout_percentage,s.userid,s.name,s.email,s.contact,s.assigned_sales_user,s.parent_id,s.usertype,s.loan_bank_status, s.loan_borrower_status,s.bank_id,s.bank_emp_id,s.lender_ref_id,s.lender_status_id,s.businessid,s.businessname,s.first_name,s.last_name,s.business_email, s.businesstype,s.businesspancardnumber,s.san_amount,s.amount_um,s.san_date,s.upload_path,s.loan_repay,s.channel_invoice,s.sanction_process_fee,s.san_interest, s.upts,s.disbursementId,s.disbursement_amt,s.disbursement_amt_um,s.disbursement_channel_invoice,s.repayment_doc,s.lender_confirmation,s.paymentId, p.payment_loan_bank_mapping,p.Payment_disbursementid,p.payment_status_caption,p.payment_rev_id,p.payment_rev_comment from ( SELECT lbm.loan_bank_mapping_id,l.loanId,l.loan_ref_id,l.loan_status_id,l.loan_sub_status_id,l.loan_request_type,l.loan_amount,l.loan_amount_um,l.loan_product_id,         cp.payout_percentage as Channel_payout_percentage,u.userid, u.name,u.email, u.contact, u.assigned_sales_user,u.parent_id,u.usertype,lbm.loan_bank_status,        lbm.loan_borrower_status,lbm.bank_id,lbm.bank_emp_id,lbm.lender_ref_id,lbm.lender_status_id,b.businessid,b.businessname,b.first_name,b.last_name,         b.business_email,b.businesstype,b.businesspancardnumber,ls.san_amount,ls.amount_um,ls.san_date,ls.upload_path,ls.loan_repay,ls.channel_invoice,         ls.sanction_process_fee,ls.san_interest,ld.upts,ld.disbursementId,ld.disbursement_amt,ld.disbursement_amt_um,ld.channel_invoice AS disbursement_channel_invoice,ld.repayment_doc,ld.lender_confirmation, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = lbm.loan_bank_mapping_id AND pay.disbursement_id = ld.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) AS paymentId FROM loanrequest l, users u, business b, loan_bank_mapping lbm, loan_sanction ls, loan_disbursement ld,channel_payout cp WHERE l.business_id = b.businessid AND l.loan_product_id=cp.loan_product_id and cp.white_label_id='" +
				user_whitelabel +
				"'  AND u.userid = b.userid AND l.white_label_id ='" +
				user_whitelabel +
				"' AND lbm.loan_id = l.loanid AND lbm.loan_bank_mapping_id = ls.loan_bank_map_id AND ls.loan_bank_map_id = ld.loan_bank_mapping_id AND lbm.loan_bank_status = '12' AND lbm.loan_borrower_status = '12' AND l.business_id = b.businessid AND ld.loan_sanction_id = ls.id  ) s left join (SELECT b.loan_bank_mapping_id as payment_loan_bank_mapping,b.disbursement_id as Payment_disbursementid, CASE WHEN b.type = 'payment' THEN b.status_caption END AS payment_status_caption,CASE  WHEN b.type = 'payment' THEN b.rev_id END AS payment_rev_id, CASE WHEN b.type = 'payment' THEN b.comments END AS payment_rev_comment FROM (SELECT rsc.disbursement_id,MAX(rsc.id) AS id   FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id  AND rsc.disbursement_id = ld.disbursementId AND rsc.type = 'payment'  GROUP BY 1 ) AS a LEFT OUTER JOIN   (SELECT rsc.loan_bank_mapping_id, rsc.disbursement_id, rsc.type,rev_id, status_caption,rsc.comments,rsc.id AS id FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.type = 'payment' and rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id AND rsc.disbursement_id = ld.disbursementId) AS b ON a.id = b.id) as p on s.disbursementId=p.Payment_disbursementid where (p.payment_rev_id is NULL or p.payment_rev_id=5) and  (s.userid=" +
				userid +
				" or s.parent_id='" +
				userid +
				"')limit " +
				page_count +
				"," +
				limit_count +
				"";
		nativeResult = await myDBStore.sendNativeQuery(inv_query);
		const data = nativeResult.rows,
			dataResult = [],
			logService = await sails.helpers.logtrackservice(req, "invoice/rev-index", req.user.id, "revenue_payment");
		//--channel payout details
		return res.send({
			status: "ok",
			loan_details: data,
			status_details: ncStatusManage
		});
	},
	index: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel}),
			//get the child or parent id
			users = await UsersRd.find({
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
			}),
			userid = [];
		_.each(users, (value) => {
			userid.push(value.id);
		});

		const data = await RevenuePaymentRd.find({
			where: {
				user: userid,
				white_label_id: user_whitelabel,
				or: [{payment_status: null}, {payment_status: 5}]
			}
		})
			.populate("user")
			.populate("business")
			.populate("loan")
			.populate("loan_bank_mapping")
			.populate("bank")
			.populate("loan_product")
			.populate("loan_disbursement")
			.paginate({page: page_count, limit: limit_count}),
			logService = await sails.helpers.logtrackservice(
				req,
				"invoice/initiate-list",
				req.user.id,
				"revenue_payment"
			);
		//--channel payout details
		Promise.all(
			data.map(async (invoiceListElement) => {
				//loan product details
				if (invoiceListElement.loan_product && invoiceListElement.loan_product.id) {
					const channel_payout = await ChannelPayoutRd.findOne({
						loan_product_id: invoiceListElement.loan_product.id,
						white_label_id: user_whitelabel
					}).then((result) => {
						if (result) {
							invoiceListElement.channel_payout = result;
						} else {
							invoiceListElement.channel_payout = {};
						}
					});
					return channel_payout;
				}
			})
		).then(() => {
			return res.send({
				status: "ok",
				loan_details: data,
				status_details: ncStatusManage
			});
		});
	},

	/**
   * * payment index pending list
   *
   * @description :: invoice payment pending list
   * @api {get} /invoice/pending-list/ payment-pending-list
   * @apiName payment-pending-list
   * @apiGroup payment
   *  @apiExample Example usage:
   * curl -i localhost:1337/invoice/pending-list/
   *
 * @apiSuccess {String} status status.
 * @apiSuccess {Object[]} loan_details loan details.
 * @apiSuccess {Number} loan_details.id id.
 * @apiSuccess {String} loan_details.white_label_id white label id.
 * @apiSuccess {String} loan_details.status_caption caption
 * @apiSuccess {String} loan_details.payment_status payment status
 * @apiSuccess {Object} loan_details.user logged in user details.
 * @apiSuccess {Object} loan_details.business business details.
 * @apiSuccess {Object} loan_details.loan loan details.
 * @apiSuccess {Object} loan_details.loan_bank_mapping loan bank mapping details.
 * @apiSuccess {Object} loan_details.bank bank details.
 * @apiSuccess {Object} loan_details.loan_product loan product details.
 * @apiSuccess {Object} loan_details.loan_disbursement loan disbursement details.
 * @apiSuccess {String} loan_details.payment payment.
 * @apiSuccess {Object} loan_details.channel_payout channel payout details.
 * @apiSuccess {Object[]} status_details
 * @apiSuccess {Number} status_details.id id.
 * @apiSuccess {String} status_details.name name.
 * @apiSuccess {String} status_details.status1
 * @apiSuccess {String} status_details.status2
 * @apiSuccess {String} status_details.status3
 * @apiSuccess {String} status_details.status4
 * @apiSuccess {String} status_details.status5
 * @apiSuccess {String} status_details.status6
 * @apiSuccess {String} status_details.white_label_id white label id.
 * @apiSuccess {String} status_details.parent_flag parent flag id.
 * @apiSuccess {String} status_details.parent_id parent id.
 * @apiSuccess {String} status_details.status
 * @apiSuccess {String} status_details.execulded_users
 * @apiSuccess {Number} status_details.sort_by_id
 * @apiSuccess {String} status_details.exclude_user_ncdoc
 * @apiSuccess {String} status_details.caption caption.

   */
	pendingnew: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") * req.param("limit") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel});

		//get the child or parent id
		var logService = await sails.helpers.logtrackservice(
			req,
			"invoice/pending-list",
			req.user.id,
			"revenue_payment"
		);

		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			//invoice query
			userid = req.user["id"],
			inv_query =
				"select s.loan_bank_mapping_id,s.loanId,s.loan_ref_id,s.loan_status_id,s.loan_sub_status_id,s.loan_request_type,s.loan_amount,s.loan_amount_um, s.loan_product_id,s.Channel_payout_percentage,s.userid,s.name,s.email,s.contact,s.assigned_sales_user,s.parent_id,s.usertype,s.loan_bank_status, s.loan_borrower_status,s.bank_id,s.bank_emp_id,s.lender_ref_id,s.lender_status_id,s.businessid,s.businessname,s.first_name,s.last_name,s.business_email, s.businesstype,s.businesspancardnumber,s.san_amount,s.amount_um,s.san_date,s.upload_path,s.loan_repay,s.channel_invoice,s.sanction_process_fee,s.san_interest, s.upts,s.disbursementId,s.disbursement_amt,s.disbursement_amt_um,s.disbursement_channel_invoice,s.repayment_doc,s.lender_confirmation,s.paymentId, p.payment_loan_bank_mapping,p.Payment_disbursementid,p.payment_status_caption,p.payment_rev_id,p.payment_rev_comment from ( SELECT lbm.loan_bank_mapping_id,l.loanId,l.loan_ref_id,l.loan_status_id,l.loan_sub_status_id,l.loan_request_type,l.loan_amount,l.loan_amount_um,l.loan_product_id,         cp.payout_percentage as Channel_payout_percentage,u.userid, u.name,u.email, u.contact, u.assigned_sales_user,u.parent_id,u.usertype,lbm.loan_bank_status,        lbm.loan_borrower_status,lbm.bank_id,lbm.bank_emp_id,lbm.lender_ref_id,lbm.lender_status_id,b.businessid,b.businessname,b.first_name,b.last_name,         b.business_email,b.businesstype,b.businesspancardnumber,ls.san_amount,ls.amount_um,ls.san_date,ls.upload_path,ls.loan_repay,ls.channel_invoice,         ls.sanction_process_fee,ls.san_interest,ld.upts,ld.disbursementId,ld.disbursement_amt,ld.disbursement_amt_um,ld.channel_invoice AS disbursement_channel_invoice,ld.repayment_doc,ld.lender_confirmation, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = lbm.loan_bank_mapping_id AND pay.disbursement_id = ld.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) AS paymentId FROM loanrequest l, users u, business b, loan_bank_mapping lbm, loan_sanction ls, loan_disbursement ld,channel_payout cp WHERE l.business_id = b.businessid AND l.loan_product_id=cp.loan_product_id and cp.white_label_id='" +
				user_whitelabel +
				"'  AND u.userid = b.userid AND l.white_label_id = '" +
				user_whitelabel +
				"'  AND lbm.loan_id = l.loanid AND lbm.loan_bank_mapping_id = ls.loan_bank_map_id AND ls.loan_bank_map_id = ld.loan_bank_mapping_id AND lbm.loan_bank_status = '12' AND lbm.loan_borrower_status = '12' AND l.business_id = b.businessid AND ld.loan_sanction_id = ls.id  ) s left join (SELECT b.loan_bank_mapping_id as payment_loan_bank_mapping,b.disbursement_id as Payment_disbursementid, CASE WHEN b.type = 'payment' THEN b.status_caption END AS payment_status_caption,CASE  WHEN b.type = 'payment' THEN b.rev_id END AS payment_rev_id, CASE WHEN b.type = 'payment' THEN b.comments END AS payment_rev_comment FROM (SELECT rsc.disbursement_id,MAX(rsc.id) AS id   FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id  AND rsc.disbursement_id = ld.disbursementId AND rsc.type = 'payment'  GROUP BY 1 ) AS a LEFT OUTER JOIN   (SELECT rsc.loan_bank_mapping_id, rsc.disbursement_id, rsc.type,rev_id, status_caption,rsc.comments,rsc.id AS id FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.type = 'payment' and rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id AND rsc.disbursement_id = ld.disbursementId) AS b ON a.id = b.id) as p on s.disbursementId=p.Payment_disbursementid where (payment_rev_id =6 or payment_rev_id=15 or payment_rev_id=18) and  (s.userid=" +
				userid +
				" or s.parent_id='" +
				userid +
				"')limit " +
				page_count +
				"," +
				limit_count +
				"";
		nativeResult = await myDBStore.sendNativeQuery(inv_query);
		const data = nativeResult.rows,
			dataResult = [];
		var logService = await sails.helpers.logtrackservice(req, "invoice/pendingnew", req.user.id, "revenue_payment");
		//--channel payout details
		Promise.all(
			data.map(async (invoiceListElement) => {
				invoiceListElement.status_caption = invoiceListElement.payment_status_caption;
				invoiceListElement.payment_status = invoiceListElement.payment_rev_id;
				invoiceListElement.id = invoiceListElement.disbursementId;
				invoiceListElement.white_label_id = user_whitelabel;
				//payment
				if (invoiceListElement.paymentId) {
					invoiceListElement.payment = invoiceListElement.paymentId;
					// var payment = await TblPaymentRd.findOne({
					//   id: invoiceListElement.paymentId
					// }).then(result => {
					//   if (result) {
					//     invoiceListElement.payment = result;
					//   } else {
					//     invoiceListElement.payment = {};
					//   }
					// });
				} else {
					invoiceListElement.payment = null;
				}
				//loan_disbursement
				if (invoiceListElement.disbursementId) {
					const loan_disbursement = await LoanDisbursementRd.findOne({
						id: invoiceListElement.disbursementId
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_disbursement = result;
						} else {
							invoiceListElement.loan_disbursement = {};
						}
					});
				} else {
					invoiceListElement.loan_disbursement = {};
				}
				//loan_product
				if (invoiceListElement.loan_product_id) {
					var loan_bank_mapping = await LoanProductsRd.findOne({
						id: invoiceListElement.loan_product_id
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_product = result;
						} else {
							invoiceListElement.loan_product = {};
						}
					});
				} else {
					invoiceListElement.loan_product = {};
				}
				//loan_bank_mapping
				if (invoiceListElement.loan_bank_mapping_id) {
					var loan_bank_mapping = await LoanBankMappingRd.findOne({
						id: invoiceListElement.loan_bank_mapping_id
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_bank_mapping = result;
						} else {
							invoiceListElement.loan_bank_mapping = {};
						}
					});
				} else {
					invoiceListElement.loan_bank_mapping = {};
				}
				//bank
				if (invoiceListElement.bank_id) {
					const bank = await BankMasterRd.findOne({
						id: invoiceListElement.bank_id
					}).then((result) => {
						if (result) {
							invoiceListElement.bank = result;
						} else {
							invoiceListElement.bank = {};
						}
					});
				} else {
					invoiceListElement.bank = {};
				}
				//loan
				if (invoiceListElement.loanId) {
					const loan = await LoanrequestRd.findOne({
						id: invoiceListElement.loanId
					}).then((result) => {
						if (result) {
							invoiceListElement.loan = result;
						} else {
							invoiceListElement.loan = {};
						}
					});
				} else {
					invoiceListElement.loan = {};
				}
				//business
				if (invoiceListElement.businessid) {
					const business = await BusinessRd.findOne({
						id: invoiceListElement.businessid
					}).then((result) => {
						if (result) {
							invoiceListElement.business = result;
						} else {
							invoiceListElement.business = {};
						}
					});
				} else {
					invoiceListElement.business = {};
				}
				//user details
				if (invoiceListElement.userid) {
					const user = await UsersRd.findOne({
						id: invoiceListElement.userid
					}).then((result) => {
						if (result) {
							invoiceListElement.user = result;
						} else {
							invoiceListElement.user = {};
						}
					});
				} else {
					invoiceListElement.user = {};
				}
				//channel_payout
				if (invoiceListElement.loan_product_id) {
					const channel_payout = await ChannelPayoutRd.findOne({
						loan_product_id: invoiceListElement.loan_product_id,
						white_label_id: user_whitelabel
					}).then((result) => {
						if (result) {
							invoiceListElement.channel_payout = result;
						} else {
							invoiceListElement.channel_payout = {};
						}
					});
					return channel_payout;
				} else {
					invoiceListElement.channel_payout = {};
				}
			})
		).then(() => {
			return res.send({
				status: "ok",
				loan_details: data,
				status_details: ncStatusManage,
				userid: userid
			});
		});
	},
	rev_pending: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") * req.param("limit") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel}),
			myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			//invoice query
			userid = req.user["id"],
			inv_query =
				"select s.loan_bank_mapping_id,s.loanId,s.loan_ref_id,s.loan_status_id,s.loan_sub_status_id,s.loan_request_type,s.loan_amount,s.loan_amount_um, s.loan_product_id,s.Channel_payout_percentage,s.userid,s.name,s.email,s.contact,s.assigned_sales_user,s.parent_id,s.usertype,s.loan_bank_status, s.loan_borrower_status,s.bank_id,s.bank_emp_id,s.lender_ref_id,s.lender_status_id,s.businessid,s.businessname,s.first_name,s.last_name,s.business_email, s.businesstype,s.businesspancardnumber,s.san_amount,s.amount_um,s.san_date,s.upload_path,s.loan_repay,s.channel_invoice,s.sanction_process_fee,s.san_interest, s.upts,s.disbursementId,s.disbursement_amt,s.disbursement_amt_um,s.disbursement_channel_invoice,s.repayment_doc,s.lender_confirmation,s.paymentId, p.payment_loan_bank_mapping,p.Payment_disbursementid,p.payment_status_caption,p.payment_rev_id,p.payment_rev_comment from ( SELECT lbm.loan_bank_mapping_id,l.loanId,l.loan_ref_id,l.loan_status_id,l.loan_sub_status_id,l.loan_request_type,l.loan_amount,l.loan_amount_um,l.loan_product_id,         cp.payout_percentage as Channel_payout_percentage,u.userid, u.name,u.email, u.contact, u.assigned_sales_user,u.parent_id,u.usertype,lbm.loan_bank_status,        lbm.loan_borrower_status,lbm.bank_id,lbm.bank_emp_id,lbm.lender_ref_id,lbm.lender_status_id,b.businessid,b.businessname,b.first_name,b.last_name,         b.business_email,b.businesstype,b.businesspancardnumber,ls.san_amount,ls.amount_um,ls.san_date,ls.upload_path,ls.loan_repay,ls.channel_invoice,         ls.sanction_process_fee,ls.san_interest,ld.upts,ld.disbursementId,ld.disbursement_amt,ld.disbursement_amt_um,ld.channel_invoice AS disbursement_channel_invoice,ld.repayment_doc,ld.lender_confirmation, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = lbm.loan_bank_mapping_id AND pay.disbursement_id = ld.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) AS paymentId FROM loanrequest l, users u, business b, loan_bank_mapping lbm, loan_sanction ls, loan_disbursement ld,channel_payout cp WHERE l.business_id = b.businessid AND l.loan_product_id=cp.loan_product_id and cp.white_label_id='" +
				user_whitelabel +
				"' AND u.userid = b.userid AND l.white_label_id = '" +
				user_whitelabel +
				"' AND lbm.loan_id = l.loanid AND lbm.loan_bank_mapping_id = ls.loan_bank_map_id AND ls.loan_bank_map_id = ld.loan_bank_mapping_id AND lbm.loan_bank_status = '12' AND lbm.loan_borrower_status = '12' AND l.business_id = b.businessid AND ld.loan_sanction_id = ls.id  ) s left join (SELECT b.loan_bank_mapping_id as payment_loan_bank_mapping,b.disbursement_id as Payment_disbursementid, CASE WHEN b.type = 'payment' THEN b.status_caption END AS payment_status_caption,CASE  WHEN b.type = 'payment' THEN b.rev_id END AS payment_rev_id, CASE WHEN b.type = 'payment' THEN b.comments END AS payment_rev_comment FROM (SELECT rsc.disbursement_id,MAX(rsc.id) AS id   FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id  AND rsc.disbursement_id = ld.disbursementId AND rsc.type = 'payment'  GROUP BY 1 ) AS a LEFT OUTER JOIN   (SELECT rsc.loan_bank_mapping_id, rsc.disbursement_id, rsc.type,rev_id, status_caption,rsc.comments,rsc.id AS id FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.type = 'payment' and rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id AND rsc.disbursement_id = ld.disbursementId) AS b ON a.id = b.id) as p on s.disbursementId=p.Payment_disbursementid where (payment_rev_id =6 or payment_rev_id=15 or payment_rev_id=18) and  (s.userid=" +
				userid +
				" or s.parent_id='" +
				userid +
				"')limit " +
				page_count +
				"," +
				limit_count +
				"";
		nativeResult = await myDBStore.sendNativeQuery(inv_query);
		const data = nativeResult.rows,
			dataResult = [],
			logService = await sails.helpers.logtrackservice(
				req,
				"invoice/rev-pending",
				req.user.id,
				"revenue_payment"
			);
		//--channel payout details
		return res.send({
			status: "ok",
			loan_details: data,
			status_details: ncStatusManage
		});
	},
	pending: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel}),
			//get the child or parent id
			users = await UsersRd.find({
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
			}),
			userid = [];
		_.each(users, (value) => {
			userid.push(value.id);
		});
		const logService = await sails.helpers.logtrackservice(
			req,
			"invoice/pending-list",
			req.user.id,
			"revenue_payment"
		),
			data = await RevenuePaymentRd.find({
				where: {
					user: userid,
					white_label_id: user_whitelabel,
					or: [{payment_status: 6}, {payment_status: 15}, {payment_status: 18}]
				}
			})
				.populate("user")
				.populate("business")
				.populate("loan")
				.populate("loan_bank_mapping")
				.populate("bank")
				.populate("loan_product")
				.populate("loan_disbursement")
				.paginate({page: page_count, limit: limit_count});
		// return res.send({
		//   status: 'ok',
		//   data: data
		// });
		//--channel payout details
		Promise.all(
			data.map(async (invoiceListElement) => {
				//loan product details
				if (invoiceListElement.loan_product && invoiceListElement.loan_product.id) {
					const channel_payout = await ChannelPayoutRd.findOne({
						loan_product_id: invoiceListElement.loan_product.id,
						white_label_id: user_whitelabel
					}).then((result) => {
						if (result) {
							invoiceListElement.channel_payout = result;
						} else {
							invoiceListElement.channel_payout = {};
						}
					});
					return channel_payout;
				}
			})
		).then(() => {
			return res.send({
				status: "ok",
				loan_details: data,
				status_details: ncStatusManage
			});
		});
	},

	/**
	 * payment index paid list
	 *
	 * @description :: invoice payment paid list
	 * @api {get} /invoice/paid-list/ payment-paid-list
	 * @apiName paymentpaid-list
	 * @apiGroup payment
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/invoice/paid-list/
	 *
	 * @apiSuccess {String} status status.
	 * @apiSuccess {Object[]} loan_details loan details.
	 * @apiSuccess {Number} loan_details.id id.
	 * @apiSuccess {String} loan_details.white_label_id white label id.
	 * @apiSuccess {String} loan_details.status_caption caption
	 * @apiSuccess {String} loan_details.payment_status payment status
	 * @apiSuccess {Object} loan_details.user logged in user details.
	 * @apiSuccess {Object} loan_details.business business details.
	 * @apiSuccess {Object} loan_details.loan loan details.
	 * @apiSuccess {Object} loan_details.loan_bank_mapping loan bank mapping details.
	 * @apiSuccess {Object} loan_details.bank bank details.
	 * @apiSuccess {Object} loan_details.loan_product loan product details.
	 * @apiSuccess {Object} loan_details.loan_disbursement loan disbursement details.
	 * @apiSuccess {String} loan_details.payment payment.
	 * @apiSuccess {Object} loan_details.channel_payout channel payout details.
	 * @apiSuccess {Object[]} status_details
	 * @apiSuccess {Number} status_details.id id.
	 * @apiSuccess {String} status_details.name name.
	 * @apiSuccess {String} status_details.status1
	 * @apiSuccess {String} status_details.status2
	 * @apiSuccess {String} status_details.status3
	 * @apiSuccess {String} status_details.status4
	 * @apiSuccess {String} status_details.status5
	 * @apiSuccess {String} status_details.status6
	 * @apiSuccess {String} status_details.white_label_id white label id.
	 * @apiSuccess {String} status_details.parent_flag parent flag id.
	 * @apiSuccess {String} status_details.parent_id parent id.
	 * @apiSuccess {String} status_details.status
	 * @apiSuccess {String} status_details.execulded_users
	 * @apiSuccess {Number} status_details.sort_by_id
	 * @apiSuccess {String} status_details.exclude_user_ncdoc
	 * @apiSuccess {String} status_details.caption caption.
	 */
	paidnew: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") * req.param("limit") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel});

		//get the child or parent id
		var logService = await sails.helpers.logtrackservice(
			req,
			"invoice/pending-list",
			req.user.id,
			"revenue_payment"
		);

		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			//invoice query
			userid = req.user["id"],
			inv_query =
				"select s.loan_bank_mapping_id,s.loanId,s.loan_ref_id,s.loan_status_id,s.loan_sub_status_id,s.loan_request_type,s.loan_amount,s.loan_amount_um, s.loan_product_id,s.Channel_payout_percentage,s.userid,s.name,s.email,s.contact,s.assigned_sales_user,s.parent_id,s.usertype,s.loan_bank_status, s.loan_borrower_status,s.bank_id,s.bank_emp_id,s.lender_ref_id,s.lender_status_id,s.businessid,s.businessname,s.first_name,s.last_name,s.business_email, s.businesstype,s.businesspancardnumber,s.san_amount,s.amount_um,s.san_date,s.upload_path,s.loan_repay,s.channel_invoice,s.sanction_process_fee,s.san_interest, s.upts,s.disbursementId,s.disbursement_amt,s.disbursement_amt_um,s.disbursement_channel_invoice,s.repayment_doc,s.lender_confirmation,s.paymentId, p.payment_loan_bank_mapping,p.Payment_disbursementid,p.payment_status_caption,p.payment_rev_id,p.payment_rev_comment from ( SELECT lbm.loan_bank_mapping_id,l.loanId,l.loan_ref_id,l.loan_status_id,l.loan_sub_status_id,l.loan_request_type,l.loan_amount,l.loan_amount_um,l.loan_product_id,         cp.payout_percentage as Channel_payout_percentage,u.userid, u.name,u.email, u.contact, u.assigned_sales_user,u.parent_id,u.usertype,lbm.loan_bank_status,        lbm.loan_borrower_status,lbm.bank_id,lbm.bank_emp_id,lbm.lender_ref_id,lbm.lender_status_id,b.businessid,b.businessname,b.first_name,b.last_name,         b.business_email,b.businesstype,b.businesspancardnumber,ls.san_amount,ls.amount_um,ls.san_date,ls.upload_path,ls.loan_repay,ls.channel_invoice,         ls.sanction_process_fee,ls.san_interest,ld.upts,ld.disbursementId,ld.disbursement_amt,ld.disbursement_amt_um,ld.channel_invoice AS disbursement_channel_invoice,ld.repayment_doc,ld.lender_confirmation, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = lbm.loan_bank_mapping_id AND pay.disbursement_id = ld.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) AS paymentId FROM loanrequest l, users u, business b, loan_bank_mapping lbm, loan_sanction ls, loan_disbursement ld,channel_payout cp WHERE l.business_id = b.businessid AND l.loan_product_id=cp.loan_product_id and cp.white_label_id='" +
				user_whitelabel +
				"'  AND u.userid = b.userid AND l.white_label_id = '" +
				user_whitelabel +
				"'  AND lbm.loan_id = l.loanid AND lbm.loan_bank_mapping_id = ls.loan_bank_map_id AND ls.loan_bank_map_id = ld.loan_bank_mapping_id AND lbm.loan_bank_status = '12' AND lbm.loan_borrower_status = '12' AND l.business_id = b.businessid AND ld.loan_sanction_id = ls.id  ) s left join (SELECT b.loan_bank_mapping_id as payment_loan_bank_mapping,b.disbursement_id as Payment_disbursementid, CASE WHEN b.type = 'payment' THEN b.status_caption END AS payment_status_caption,CASE  WHEN b.type = 'payment' THEN b.rev_id END AS payment_rev_id, CASE WHEN b.type = 'payment' THEN b.comments END AS payment_rev_comment FROM (SELECT rsc.disbursement_id,MAX(rsc.id) AS id   FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id  AND rsc.disbursement_id = ld.disbursementId AND rsc.type = 'payment'  GROUP BY 1 ) AS a LEFT OUTER JOIN   (SELECT rsc.loan_bank_mapping_id, rsc.disbursement_id, rsc.type,rev_id, status_caption,rsc.comments,rsc.id AS id FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.type = 'payment' and rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id AND rsc.disbursement_id = ld.disbursementId) AS b ON a.id = b.id) as p on s.disbursementId=p.Payment_disbursementid where (payment_rev_id =7 or payment_rev_id=19) and  (s.userid=" +
				userid +
				" or s.parent_id='" +
				userid +
				"')limit " +
				page_count +
				"," +
				limit_count +
				"";

		nativeResult = await myDBStore.sendNativeQuery(inv_query);
		const data = nativeResult.rows,
			dataResult = [];
		var logService = await sails.helpers.logtrackservice(
			req,
			"invoice/initiate-paid new",
			req.user.id,
			"revenue_payment"
		);
		//--channel payout details
		Promise.all(
			data.map(async (invoiceListElement) => {
				invoiceListElement.status_caption = invoiceListElement.payment_status_caption;
				invoiceListElement.payment_status = invoiceListElement.payment_rev_id;
				invoiceListElement.id = invoiceListElement.disbursementId;
				invoiceListElement.white_label_id = user_whitelabel;
				//payment
				if (invoiceListElement.paymentId) {
					invoiceListElement.payment = invoiceListElement.paymentId;
					// var payment = await TblPaymentRd.findOne({
					//   id: invoiceListElement.paymentId
					// }).then(result => {
					//   if (result) {
					//     invoiceListElement.payment = result;
					//   } else {
					//     invoiceListElement.payment = {};
					//   }
					// });
				} else {
					invoiceListElement.payment = null;
				}
				//loan_disbursement
				if (invoiceListElement.disbursementId) {
					const loan_disbursement = await LoanDisbursementRd.findOne({
						id: invoiceListElement.disbursementId
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_disbursement = result;
						} else {
							invoiceListElement.loan_disbursement = {};
						}
					});
				} else {
					invoiceListElement.loan_disbursement = {};
				}
				//loan_product
				if (invoiceListElement.loan_product_id) {
					var loan_bank_mapping = await LoanProductsRd.findOne({
						id: invoiceListElement.loan_product_id
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_product = result;
						} else {
							invoiceListElement.loan_product = {};
						}
					});
				} else {
					invoiceListElement.loan_product = {};
				}
				//loan_bank_mapping
				if (invoiceListElement.loan_bank_mapping_id) {
					var loan_bank_mapping = await LoanBankMappingRd.findOne({
						id: invoiceListElement.loan_bank_mapping_id
					}).then((result) => {
						if (result) {
							invoiceListElement.loan_bank_mapping = result;
						} else {
							invoiceListElement.loan_bank_mapping = {};
						}
					});
				} else {
					invoiceListElement.loan_bank_mapping = {};
				}
				//bank
				if (invoiceListElement.bank_id) {
					const bank = await BankMasterRd.findOne({
						id: invoiceListElement.bank_id
					}).then((result) => {
						if (result) {
							invoiceListElement.bank = result;
						} else {
							invoiceListElement.bank = {};
						}
					});
				} else {
					invoiceListElement.bank = {};
				}
				//loan
				if (invoiceListElement.loanId) {
					const loan = await LoanrequestRd.findOne({
						id: invoiceListElement.loanId
					}).then((result) => {
						if (result) {
							invoiceListElement.loan = result;
						} else {
							invoiceListElement.loan = {};
						}
					});
				} else {
					invoiceListElement.loan = {};
				}
				//business
				if (invoiceListElement.businessid) {
					const business = await BusinessRd.findOne({
						id: invoiceListElement.businessid
					}).then((result) => {
						if (result) {
							invoiceListElement.business = result;
						} else {
							invoiceListElement.business = {};
						}
					});
				} else {
					invoiceListElement.business = {};
				}
				//user details
				if (invoiceListElement.userid) {
					const user = await UsersRd.findOne({
						id: invoiceListElement.userid
					}).then((result) => {
						if (result) {
							invoiceListElement.user = result;
						} else {
							invoiceListElement.user = {};
						}
					});
				} else {
					invoiceListElement.user = {};
				}
				//channel_payout
				if (invoiceListElement.loan_product_id) {
					const channel_payout = await ChannelPayoutRd.findOne({
						loan_product_id: invoiceListElement.loan_product_id,
						white_label_id: user_whitelabel
					}).then((result) => {
						if (result) {
							invoiceListElement.channel_payout = result;
						} else {
							invoiceListElement.channel_payout = {};
						}
					});
					return channel_payout;
				} else {
					invoiceListElement.channel_payout = {};
				}
			})
		).then(() => {
			return res.send({
				status: "ok",
				loan_details: data,
				status_details: ncStatusManage,
				userid: userid
			});
		});
	},
	rev_paid: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") * req.param("limit") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel}),
			myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			//invoice query
			userid = req.user["id"],
			inv_query =
				"select s.loan_bank_mapping_id,s.loanId,s.loan_ref_id,s.loan_status_id,s.loan_sub_status_id,s.loan_request_type,s.loan_amount,s.loan_amount_um, s.loan_product_id,s.Channel_payout_percentage,s.userid,s.name,s.email,s.contact,s.assigned_sales_user,s.parent_id,s.usertype,s.loan_bank_status, s.loan_borrower_status,s.bank_id,s.bank_emp_id,s.lender_ref_id,s.lender_status_id,s.businessid,s.businessname,s.first_name,s.last_name,s.business_email, s.businesstype,s.businesspancardnumber,s.san_amount,s.amount_um,s.san_date,s.upload_path,s.loan_repay,s.channel_invoice,s.sanction_process_fee,s.san_interest, s.upts,s.disbursementId,s.disbursement_amt,s.disbursement_amt_um,s.disbursement_channel_invoice,s.repayment_doc,s.lender_confirmation,s.paymentId, p.payment_loan_bank_mapping,p.Payment_disbursementid,p.payment_status_caption,p.payment_rev_id,p.payment_rev_comment from ( SELECT lbm.loan_bank_mapping_id,l.loanId,l.loan_ref_id,l.loan_status_id,l.loan_sub_status_id,l.loan_request_type,l.loan_amount,l.loan_amount_um,l.loan_product_id,         cp.payout_percentage as Channel_payout_percentage,u.userid, u.name,u.email, u.contact, u.assigned_sales_user,u.parent_id,u.usertype,lbm.loan_bank_status,        lbm.loan_borrower_status,lbm.bank_id,lbm.bank_emp_id,lbm.lender_ref_id,lbm.lender_status_id,b.businessid,b.businessname,b.first_name,b.last_name,         b.business_email,b.businesstype,b.businesspancardnumber,ls.san_amount,ls.amount_um,ls.san_date,ls.upload_path,ls.loan_repay,ls.channel_invoice,         ls.sanction_process_fee,ls.san_interest,ld.upts,ld.disbursementId,ld.disbursement_amt,ld.disbursement_amt_um,ld.channel_invoice AS disbursement_channel_invoice,ld.repayment_doc,ld.lender_confirmation, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = lbm.loan_bank_mapping_id AND pay.disbursement_id = ld.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) AS paymentId FROM loanrequest l, users u, business b, loan_bank_mapping lbm, loan_sanction ls, loan_disbursement ld,channel_payout cp WHERE l.business_id = b.businessid AND l.loan_product_id=cp.loan_product_id and cp.white_label_id='" +
				user_whitelabel +
				"'  AND u.userid = b.userid AND l.white_label_id ='" +
				user_whitelabel +
				"'  AND lbm.loan_id = l.loanid AND lbm.loan_bank_mapping_id = ls.loan_bank_map_id AND ls.loan_bank_map_id = ld.loan_bank_mapping_id AND lbm.loan_bank_status = '12' AND lbm.loan_borrower_status = '12' AND l.business_id = b.businessid AND ld.loan_sanction_id = ls.id  ) s left join (SELECT b.loan_bank_mapping_id as payment_loan_bank_mapping,b.disbursement_id as Payment_disbursementid, CASE WHEN b.type = 'payment' THEN b.status_caption END AS payment_status_caption,CASE  WHEN b.type = 'payment' THEN b.rev_id END AS payment_rev_id, CASE WHEN b.type = 'payment' THEN b.comments END AS payment_rev_comment FROM (SELECT rsc.disbursement_id,MAX(rsc.id) AS id   FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id  AND rsc.disbursement_id = ld.disbursementId AND rsc.type = 'payment'  GROUP BY 1 ) AS a LEFT OUTER JOIN   (SELECT rsc.loan_bank_mapping_id, rsc.disbursement_id, rsc.type,rev_id, status_caption,rsc.comments,rsc.id AS id FROM revenue_status rs, revenue_status_comments rsc, loan_bank_mapping lb, loan_disbursement ld WHERE rsc.type = 'payment' and rsc.comment_id = rs.rev_id AND rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id AND rsc.disbursement_id = ld.disbursementId) AS b ON a.id = b.id) as p on s.disbursementId=p.Payment_disbursementid where (payment_rev_id =7 or payment_rev_id=19) and  (s.userid=" +
				userid +
				" or s.parent_id='" +
				userid +
				"')limit " +
				page_count +
				"," +
				limit_count +
				"";

		nativeResult = await myDBStore.sendNativeQuery(inv_query);
		const data = nativeResult.rows,
			dataResult = [],
			logService = await sails.helpers.logtrackservice(req, "invoice/rev-paid", req.user.id, "revenue_payment");
		//--channel payout details
		return res.send({
			status: "ok",
			loan_details: data,
			status_details: ncStatusManage
		});
	},
	paid: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			page_count = req.param("skip") ? req.param("skip") * req.param("limit") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 3,
			ncStatusManage = await NcStatusManageRd.find({white_label_id: user_whitelabel}),
			//get the child or parent id
			users = await UsersRd.find({
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
			}),
			userid = [];
		_.each(users, (value) => {
			userid.push(value.id);
		});
		const logService = await sails.helpers.logtrackservice(
			req,
			"invoice/paid-list",
			req.user.id,
			"revenue_payment"
		),
			data = await RevenuePaymentRd.find({
				where: {
					user: userid,
					white_label_id: user_whitelabel,
					or: [{payment_status: 7}, {payment_status: 19}]
				}
			})
				.populate("user")
				.populate("business")
				.populate("loan")
				.populate("loan_bank_mapping")
				.populate("bank")
				.populate("loan_product")
				.populate("loan_disbursement")
				.paginate({page: page_count, limit: limit_count});
		// return res.send({
		//   status: 'ok',
		//   data: data
		// });
		//--channel payout details
		Promise.all(
			data.map(async (invoiceListElement) => {
				//loan product details
				if (invoiceListElement.loan_product && invoiceListElement.loan_product.id) {
					const channel_payout = await ChannelPayoutRd.findOne({
						loan_product_id: invoiceListElement.loan_product.id,
						white_label_id: user_whitelabel
					}).then((result) => {
						if (result) {
							invoiceListElement.channel_payout = result;
						} else {
							invoiceListElement.channel_payout = {};
						}
					});
					return channel_payout;
				}
			})
		).then(() => {
			return res.send({
				status: "ok",
				loan_details: data,
				status_details: ncStatusManage
			});
		});
	}
};
