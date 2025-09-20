/**
 * InvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	attributes: {
		skip: {type: "integer"},
		limit: {type: "integer"}
		// device_id: { type: 'string', required: true },
		// lastName: { type: 'string' },
		// verified: { type: 'boolean' },
	},
	/**
 * payment index initiate list
 *
 * @description :: invoice payment initiate list
	* @api {get} /invoice/initiate-list/ payment initiate list (deprecated)
	 * @apiName paymentinitiate list
	 * @apiGroup payment
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/invoice/initiate-list/
	 *
	 * @apiSuccess {String} status payment status(if it is success ok otherwise nok).
	 * @apiSuccess {object[]} data payment information.
	 * @apiSuccess {Number} data.userid_san user id.
	 * @apiSuccess {String} data.sanction_process_fee sanction process fee.
	 * @apiSuccess {String} data.san_amount sanction amount.
	 * @apiSuccess {String} data.upload_path upload path(by default it is null).
	 * @apiSuccess {String} data.loan_repay loan replay (by default it is null).
	 * @apiSuccess {String} data.channel_invoice
	 * @apiSuccess {String} data.san_interest sanction interest.
	 * @apiSuccess {String} data.loan_ref_id loan reference id.
	 * @apiSuccess {String} data.businessname business company name.
	 * @apiSuccess {Number} data.loan_amount loan amount.
	 * @apiSuccess {String} data.business_email email id.
	 * @apiSuccess {String} data.businesspancardnumber pancard number.
	 * @apiSuccess {String} data.gstin gst interest(by default it is null).
	 * @apiSuccess {Number} data.businesstype
	 * @apiSuccess {String} data.loan_amount_um lakhs/crores
	 * @apiSuccess {Number} data.loan_request_type
	 * @apiSuccess {Number} data.sales_id sales id.
	 * @apiSuccess {Number} data.loan_orginitaor
	 * @apiSuccess {Number} data.disbursementId disbursement Id.
	 * @apiSuccess {Number} data.disbursement_amt disbursement amount.
	 * @apiSuccess {String} data.disbursement_amt_um disbursement amount(lakhs/crores).
	 * @apiSuccess {String} data.disbursement_channel_invoice
	 * @apiSuccess {String} data.repayment_doc repayment document.
	 * @apiSuccess {String} data.lender_confirmation lender confirmation.
	 * @apiSuccess {String} data.lender_ref_id lender reference id.
	 * @apiSuccess {String} data.product product name.
	 * @apiSuccess {String} data.disbursement_date disbursement date.
	 * @apiSuccess {String} data.name name.
	 * @apiSuccess {String} data.email email.
	 * @apiSuccess {String} data.contact contact number.
	 * @apiSuccess {Number} data.assigned_sales_user sales users.
	 * @apiSuccess {Number} data.parent_id parent id.
	 * @apiSuccess {String} data.usertype user type.
	 * @apiSuccess {Number} data.bank_id bank id.
	 * @apiSuccess {Number} data.bank_emp_id bank employee id.
	 * @apiSuccess {String} data.bankname bank name.
	 * @apiSuccess {String} data.amount_um amount in lakhs/crores.
	 * @apiSuccess {String} data.san_date sancation date.
	 * @apiSuccess {Number} data.loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} data.loan_product_id loan product id.
	 * @apiSuccess {String} data.city city.
	 * @apiSuccess {String} data.state state.
	 * @apiSuccess {String} data.collection_status_caption
	 * @apiSuccess {String} data.collection_rev_id
	 * @apiSuccess {String} data.payment_status_caption payment status caption.
	 * @apiSuccess {String} data.payment_status_comments payment status comments.
	 * @apiSuccess {String} data.net_payable net payable amount.
	 * @apiSuccess {String} data.initiated_details
	 * @apiSuccess {String} data.disbursement_amount disbursement amount.
	 * @apiSuccess {String} data.payable_amount payable amount.
	 * @apiSuccess {Number} data.net_amount net amount.
	 * @apiSuccess {String} data.payable_tax payable tax.
	 * @apiSuccess {Number} data.payment_status payment status.
	 * @apiSuccess {String} data.invoice_id invoice id.
	 * @apiSuccess {String} data.amount_paid amount paid
	 * @apiSuccess {String} data.ca_amount_paid_date amount paid date.
	 * @apiSuccess {Number} data.paymentId payment Id.
	 * @apiSuccess {Number} data.payment_rev_id
	 * @apiSuccess {String} data.payout_percentage payout percentage.
	 * @apiSuccess {Number} data.channel_payout_percentage
	 * @apiSuccess {String} data.lender_name_banking lender name.
	 * @apiSuccess {Number} data.owner_userid owner user id.

*/
	initial: async function (req, res) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let limit,
			skip = "";
		if (req.query.limit == undefined) {
			limit = 3;
		} else {
			limit = req.query.limit;
		}
		if (req.query.skip == undefined) {
			skip = 0;
		} else {
			skip = req.query.skip;
		}
		const query =
			"SELECT SQL_CALC_FOUND_ROWS loan_sanction.userid as userid_san, loanrequest.loan_status_id,loanrequest.loan_sub_status_id,loan_bank_mapping.loan_bank_status,loan_bank_mapping.loan_borrower_status,sanction_process_fee,san_amount,loan_sanction.upload_path,loan_sanction.loan_repay,loan_sanction.channel_invoice as channel_invoice ,san_interest,loan_ref_id,businessname,loan_amount, business_email,businesspancardnumber,gstin,business.businesstype, loan_amount_um,loanrequest.loan_request_type,loanrequest.sales_id,loanrequest.loan_orginitaor, disbursementId,disbursement_amt,disbursement_amt_um,loan_disbursement.channel_invoice as disbursement_channel_invoice,loan_disbursement.repayment_doc,loan_disbursement.lender_confirmation,loan_bank_mapping.lender_ref_id,loan_products.product, loan_disbursement.disbursement_date,users.name,users.email,users.contact,assigned_sales_user, users.parent_id,users.usertype,loan_bank_mapping.bank_id,loan_bank_mapping.bank_emp_id, (select bank from banktbl where banktbl.id=loan_bank_mapping.bank_id) as bankname,loan_sanction.san_amount,loan_sanction.amount_um,loan_sanction.san_date, loan_bank_mapping.loan_bank_mapping_id,loanrequest.loan_product_id,businessaddress.city,businessaddress.state, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_status_caption, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_rev_id, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_caption, (SELECT rsc.comments FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_comments, (SELECT pay.net_payable FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_payable, (SELECT pay.initiated_details FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as initiated_details, (SELECT pay.disbursement_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as disbursement_amount, (SELECT pay.payable_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_amount, (SELECT pay.net_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_amount, (SELECT pay.payable_tax FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_tax, (SELECT pay.payment_status FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payment_status, (select inv_d.id from tbl_invoice_details inv_d where inv_d.disbursement_id = loan_disbursement.disbursementId and inv_d.loan_bank_mapping_id=loan_disbursement.loan_bank_mapping_id LIMIT 1) as invoice_id, (SELECT sum(amount_paid) FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId) as amount_paid, (SELECT amount_paid_date FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId order by pp.created_on desc limit 1) as ca_amount_paid_date, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as paymentId, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_rev_id, loan_disbursement.disbursementId,(select payout_percentage from lender_payout where lender_id=loan_bank_mapping.bank_id and loan_product_id=loanrequest.loan_product_id) as payout_percentage,(select payout_percentage from channel_payout where loan_product_id=loanrequest.loan_product_id AND white_label_id='" +
			user_whitelabel +
			"') as channel_payout_percentage,loan_status_with_lender.status as lender_name_banking, users.userid as owner_userid FROM loanrequest,loan_bank_mapping,loan_disbursement, loan_products,business,users,loan_sanction,loan_status_with_lender,businessaddress where loan_products.id=loan_product_id and loan_disbursement.loan_sanction_id=loan_sanction.id and loan_bank_mapping.lender_status_id=loan_status_with_lender.id and loan_bank_mapping.loan_id=loanrequest.loanId and loan_bank_status='12' and loan_borrower_status='12' and business.businessid=loanrequest.business_id and business.userid=users.userid and loanrequest.white_label_id='" +
			user_whitelabel +
			"' and loan_sanction.loan_bank_map_id=loan_bank_mapping.loan_bank_mapping_id and businessaddress.bid=business.businessid and businessaddress.aid=1 and loan_disbursement.disbursementId!='' and (users.userid=" +
			req.user["id"] +
			" OR users.parent_id=" +
			req.user["id"] +
			") and (select count(paymentId) from tbl_payment WHERE disbursement_id = loan_disbursement.disbursementId AND payment_status = 7) < 1 and lender_status_id in(16,17) HAVING (payment_status IS null OR payment_status = 5) order by loan_disbursement.upts desc limit " +
			skip +
			"," +
			limit;

		try {
			nativeResult = await myDBStore.sendNativeQuery(query);
		} catch (err) {
			return res.send(err);
		}

		return res.send({status: "ok", data: nativeResult.rows});
	},

	/**
	 * Invoice list
	 *
	 * @description :: Invoice list
	 * @api {get} /invoice/list/ invoice list
	 * @apiName invoice list
	 * @apiGroup payment
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/invoice/list/
	 *
	 *  @apiParam {string} type the value can be 'Invoice Paid-list','Invoice Initiate-list','Invoice Pending-list'
	 *
	 *
	 * @apiSuccess {String} status payment status(if it is success ok otherwise nok).
	 * @apiSuccess {object[]} data payment information.
	 * @apiSuccess {Number} data.userid_san user id.
	 * @apiSuccess {String} data.sanction_process_fee sanction process fee.
	 * @apiSuccess {String} data.san_amount sanction amount.
	 * @apiSuccess {String} data.upload_path upload path(by default it is null).
	 * @apiSuccess {String} data.loan_repay loan replay (by default it is null).
	 * @apiSuccess {String} data.channel_invoice
	 * @apiSuccess {String} data.san_interest sanction interest.
	 * @apiSuccess {String} data.loan_ref_id loan reference id.
	 * @apiSuccess {String} data.businessname business company name.
	 * @apiSuccess {Number} data.loan_amount loan amount.
	 * @apiSuccess {String} data.business_email email id.
	 * @apiSuccess {String} data.businesspancardnumber pancard number.
	 * @apiSuccess {String} data.gstin gst interest(by default it is null).
	 * @apiSuccess {Number} data.businesstype
	 * @apiSuccess {String} data.loan_amount_um lakhs/crores
	 * @apiSuccess {Number} data.loan_request_type
	 * @apiSuccess {Number} data.sales_id sales id.
	 * @apiSuccess {Number} data.loan_orginitaor
	 * @apiSuccess {Number} data.disbursementId disbursement Id.
	 * @apiSuccess {Number} data.disbursement_amt disbursement amount.
	 * @apiSuccess {String} data.disbursement_amt_um disbursement amount(lakhs/crores).
	 * @apiSuccess {String} data.disbursement_channel_invoice
	 * @apiSuccess {String} data.repayment_doc repayment document.
	 * @apiSuccess {String} data.lender_confirmation lender confirmation.
	 * @apiSuccess {String} data.lender_ref_id lender reference id.
	 * @apiSuccess {String} data.product product name.
	 * @apiSuccess {String} data.disbursement_date disbursement date.
	 * @apiSuccess {String} data.name name.
	 * @apiSuccess {String} data.email email.
	 * @apiSuccess {String} data.contact contact number.
	 * @apiSuccess {Number} data.assigned_sales_user sales users.
	 * @apiSuccess {Number} data.parent_id parent id.
	 * @apiSuccess {String} data.usertype user type.
	 * @apiSuccess {Number} data.bank_id bank id.
	 * @apiSuccess {Number} data.bank_emp_id bank employee id.
	 * @apiSuccess {String} data.bankname bank name.
	 * @apiSuccess {String} data.amount_um amount in lakhs/crores.
	 * @apiSuccess {String} data.san_date sancation date.
	 * @apiSuccess {Number} data.loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} data.loan_product_id loan product id.
	 * @apiSuccess {String} data.city city.
	 * @apiSuccess {String} data.state state.
	 * @apiSuccess {String} data.collection_status_caption
	 * @apiSuccess {String} data.collection_rev_id
	 * @apiSuccess {String} data.payment_status_caption payment status caption.
	 * @apiSuccess {String} data.payment_status_comments payment status comments.
	 * @apiSuccess {String} data.net_payable net payable amount.
	 * @apiSuccess {String} data.initiated_details
	 * @apiSuccess {String} data.disbursement_amount disbursement amount.
	 * @apiSuccess {String} data.payable_amount payable amount.
	 * @apiSuccess {Number} data.net_amount net amount.
	 * @apiSuccess {String} data.payable_tax payable tax.
	 * @apiSuccess {Number} data.payment_status payment status.
	 * @apiSuccess {String} data.invoice_id invoice id.
	 * @apiSuccess {String} data.amount_paid amount paid
	 * @apiSuccess {String} data.ca_amount_paid_date amount paid date.
	 * @apiSuccess {Number} data.paymentId payment Id.
	 * @apiSuccess {Number} data.payment_rev_id
	 * @apiSuccess {String} data.payout_percentage payout percentage.
	 * @apiSuccess {Number} data.channel_payout_percentage
	 * @apiSuccess {String} data.lender_name_banking lender name.
	 * @apiSuccess {Number} data.owner_userid owner user id.
	 */

	list: async function (req, res) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let limit,
			skip,
			type = "";
		if (req.param("limit") == undefined) {
			limit = 3;
		} else {
			limit = req.param("limit");
		}
		if (req.param("skip") == undefined) {
			skip = 0;
		} else {
			skip = req.param("skip");
		}
		if (req.param("type") == undefined || req.param("type") == "") {
			type = "Invoice Initiate-list";
		} else {
			type = req.param("type");
		}
		const query =
			"select ub.*,rf.* from (select lbm.loan_bank_mapping_id,l.loan_ref_id,l.loan_status_id,l.loan_sub_status_id,l.loan_request_type,l.loan_amount,l.loan_amount_um,u.userid,u.name,u.email,u.contact, u.assigned_sales_user,u.parent_id,u.usertype, lbm.loan_bank_status,lbm.loan_borrower_status,lbm.bank_id,lbm.bank_emp_id, lbm.lender_ref_id,lbm.lender_status_id,b.businessname,b.first_name,b.last_name,b.business_email,b.businesstype,b.businesspancardnumber,ls.san_amount, ls.amount_um,ls.san_date,ls.upload_path,ls.loan_repay,ls.channel_invoice,ls.sanction_process_fee,ls.san_interest,ld.upts,ld.disbursementId, ld.disbursement_amt,ld.disbursement_amt_um,ld.channel_invoice as disbursement_channel_invoice,ld.repayment_doc,ld.lender_confirmation from loanrequest l,users u,business b ,loan_bank_mapping lbm,loan_sanction ls,loan_disbursement ld where l.business_id=b.businessid and u.userid=b.userid and l.white_label_id=1 and lbm.loan_id=l.loanid and lbm.loan_bank_mapping_id=ls.loan_bank_map_id and ls.loan_bank_map_id=ld.loan_bank_mapping_id and lbm.loan_bank_status='12' and lbm.loan_borrower_status='12' and l.business_id=b.businessid and ld.loan_sanction_id=ls.id) as ub left outer join (select rp.*,t.paymentId,t.net_payable,t.disbursement_amount,t.payable_amount,t.net_amount,t.payable_tax,t.payment_status,t.channel_payout_percentage, t.payout_percentage,t.InvoiceId,t.amount_paid,t.amount_paid_date,t.payment_type from (select r.*,p.payment_status_caption,p.payment_rev_id,p.payment_rev_comment from (select b.loan_bank_mapping_id,b.disbursement_id,case when a.type='revenue' then b.status_caption end as collection_status_caption, case when a.type='revenue' then b.rev_id end as collection_rev_id from (select rsc.loan_bank_mapping_id,rsc.disbursement_id ,rsc.type,max(rsc.id) as id FROM revenue_status rs,revenue_status_comments rsc,loan_bank_mapping lb,loan_disbursement ld WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id and rsc.disbursement_id = ld.disbursementId and rsc.type='revenue' group by 1,2,3) as a left outer join (select rsc.loan_bank_mapping_id,rsc.disbursement_id ,rsc.type,rev_id,status_caption,rsc.comments,rsc.id as id FROM revenue_status rs,revenue_status_comments rsc,loan_bank_mapping lb,loan_disbursement ld WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id and rsc.disbursement_id = ld.disbursementId ) as b on a.id=b.id) as r left outer join (select b.loan_bank_mapping_id,b.disbursement_id, case when a.type='payment' then b.status_caption end as payment_status_caption, case when a.type='payment' then b.rev_id end as payment_rev_id, case when a.type='payment' then b.comments end as payment_rev_comment from (select rsc.loan_bank_mapping_id,rsc.disbursement_id ,rsc.type,max(rsc.id) as id FROM revenue_status rs,revenue_status_comments rsc,loan_bank_mapping lb,loan_disbursement ld WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id and rsc.disbursement_id = ld.disbursementId and rsc.type='payment' group by 1,2,3) as a left outer join (select rsc.loan_bank_mapping_id,rsc.disbursement_id ,rsc.type,rev_id,status_caption,rsc.comments,rsc.id as id FROM revenue_status rs,revenue_status_comments rsc,loan_bank_mapping lb,loan_disbursement ld WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = lb.loan_bank_mapping_id and rsc.disbursement_id = ld.disbursementId ) as b on a.id=b.id) as p on r.loan_bank_mapping_id=p.loan_bank_mapping_id group by 1,2,3,4,5,6,7) as rp left outer join (select tp.*,tpi.InvoiceId,tpi.amount_paid,tpi.amount_paid_date,(case when (tp.payment_status IS null OR payment_status = 5) then 'Invoice Initiate-list' when (tp.payment_status = 6 OR payment_status = 15 OR payment_status = 18) then 'Invoice Pending-list' when (payment_status = 7 OR payment_status = 19) then 'Invoice Paid-list' end ) as payment_type from (select tp.disbursement_id,tp.loan_bank_mapping_id,paymentId,net_payable,disbursement_amount,payable_amount,net_amount,payable_tax, payment_status,channel_payout_percentage,tp.payout_percentage from tbl_payment tp) as tp left outer join (select t.loan_bank_mapping_id,t.paymentId,tid.id as InvoiceId,sum(amount_paid) as amount_paid,max(amount_paid_date) as amount_paid_date from tbl_payment_paid tpp, tbl_invoice_details tid,tbl_payment t where t.paymentId=tpp.payment_id and t.loan_bank_mapping_id=tid.loan_bank_mapping_id group by 1,2,3) as tpi on tp.loan_bank_mapping_id=tpi.loan_bank_mapping_id and tpi.paymentId=tp.paymentId) as t on rp.loan_bank_mapping_id=t.loan_bank_mapping_id and rp.disbursement_id=t.disbursement_id group by 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20) as rf on ub.loan_bank_mapping_id=rf.loan_bank_mapping_id and ub.disbursementId=rf.disbursement_id where payment_type = '" +
			type +
			"' AND ( userid = " +
			req.user["id"] +
			" OR parent_id = " +
			req.user["id"] +
			" ) order by upts DESC " +
			" LIMIT " +
			skip +
			"," +
			limit;

		try {
			nativeResult = await myDBStore.sendNativeQuery(query);
		} catch (err) {
			return res.send(err);
		}

		return res.send({status: "ok", data: nativeResult.rows});
	},

	/**
	 * payment index pending list
	 *
	 * @description :: invoice payment pending list
	 * @api {get} /invoice/pending-list/ payment pending list (deprecated)
	 * @apiName paymentpending
	 * @apiGroup payment
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/invoice/pending-list/
	 *
	 *
	 *  @apiSuccess {String} status payment status(if it is success ok otherwise nok).
	 * @apiSuccess {object[]} data payment information.
	 * @apiSuccess {Number} data.userid_san user id.
	 * @apiSuccess {String} data.sanction_process_fee sanction process fee.
	 * @apiSuccess {String} data.san_amount sanction amount.
	 * @apiSuccess {String} data.upload_path upload path(by default it is null).
	 * @apiSuccess {String} data.loan_repay loan replay (by default it is null).
	 * @apiSuccess {String} data.channel_invoice
	 * @apiSuccess {String} data.san_interest sanction interest.
	 * @apiSuccess {String} data.loan_ref_id loan reference id.
	 * @apiSuccess {String} data.businessname business company name.
	 * @apiSuccess {Number} data.loan_amount loan amount.
	 * @apiSuccess {String} data.business_email email id.
	 * @apiSuccess {String} data.businesspancardnumber pancard number.
	 * @apiSuccess {String} data.gstin gst interest(by default it is null).
	 * @apiSuccess {Number} data.businesstype
	 * @apiSuccess {String} data.loan_amount_um lakhs/crores
	 * @apiSuccess {Number} data.loan_request_type
	 * @apiSuccess {Number} data.sales_id sales id.
	 * @apiSuccess {Number} data.loan_orginitaor
	 * @apiSuccess {Number} data.disbursementId disbursement Id.
	 * @apiSuccess {Number} data.disbursement_amt disbursement amount.
	 * @apiSuccess {String} data.disbursement_amt_um disbursement amount(lakhs/crores).
	 * @apiSuccess {String} data.disbursement_channel_invoice
	 * @apiSuccess {String} data.repayment_doc repayment document.
	 * @apiSuccess {String} data.lender_confirmation lender confirmation.
	 * @apiSuccess {String} data.lender_ref_id lender reference id.
	 * @apiSuccess {String} data.product product name.
	 * @apiSuccess {String} data.disbursement_date disbursement date.
	 * @apiSuccess {String} data.name name.
	 * @apiSuccess {String} data.email email.
	 * @apiSuccess {String} data.contact contact number.
	 * @apiSuccess {Number} data.assigned_sales_user sales users.
	 * @apiSuccess {Number} data.parent_id parent id.
	 * @apiSuccess {String} data.usertype user type.
	 * @apiSuccess {Number} data.bank_id bank id.
	 * @apiSuccess {Number} data.bank_emp_id bank employee id.
	 * @apiSuccess {String} data.bankname bank name.
	 * @apiSuccess {String} data.amount_um amount in lakhs/crores.
	 * @apiSuccess {String} data.san_date sancation date.
	 * @apiSuccess {Number} data.loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} data.loan_product_id loan product id.
	 * @apiSuccess {String} data.city city.
	 * @apiSuccess {String} data.state state.
	 * @apiSuccess {String} data.collection_status_caption
	 * @apiSuccess {String} data.collection_rev_id
	 * @apiSuccess {String} data.payment_status_caption payment status caption.
	 * @apiSuccess {String} data.payment_status_comments payment status comments.
	 * @apiSuccess {String} data.net_payable net payable amount.
	 * @apiSuccess {String} data.initiated_details
	 * @apiSuccess {String} data.disbursement_amount disbursement amount.
	 * @apiSuccess {String} data.payable_amount payable amount.
	 * @apiSuccess {Number} data.net_amount net amount.
	 * @apiSuccess {String} data.payable_tax payable tax.
	 * @apiSuccess {Number} data.payment_status payment status.
	 * @apiSuccess {String} data.invoice_id invoice id.
	 * @apiSuccess {String} data.amount_paid amount paid
	 * @apiSuccess {String} data.ca_amount_paid_date amount paid date.
	 * @apiSuccess {Number} data.paymentId payment Id.
	 * @apiSuccess {Number} data.payment_rev_id
	 * @apiSuccess {String} data.payout_percentage payout percentage.
	 * @apiSuccess {Number} data.channel_payout_percentage
	 * @apiSuccess {String} data.lender_name_banking lender name.
	 * @apiSuccess {Number} data.owner_userid owner user id.
	 */

	pending: async function (req, res) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let limit,
			skip = "";
		if (req.query.limit == undefined) {
			limit = 3;
		} else {
			limit = req.query.limit;
		}
		if (req.query.skip == undefined) {
			skip = 0;
		} else {
			skip = req.query.skip;
		}
		const query =
			"SELECT SQL_CALC_FOUND_ROWS loanrequest.loanId as id,loan_sanction.userid as userid_san, loanusagetype.typeLname,sanction_process_fee,san_amount,loan_sanction.upload_path,loan_sanction.loan_repay,loan_sanction.channel_invoice as channel_invoice ,san_interest,loan_ref_id,businessname,loan_amount, business_email,businesspancardnumber,gstin,business.first_name,business.last_name,business.businesstype, loan_amount_um,loanrequest.loan_status_id,loanrequest.loan_sub_status_id,loanrequest.loan_request_type,loanrequest.sales_id,loanrequest.loan_orginitaor, disbursementId,disbursement_amt,disbursement_amt_um,loan_disbursement.channel_invoice as disbursement_channel_invoice,loan_disbursement.repayment_doc,loan_disbursement.lender_confirmation,loan_bank_mapping.loan_bank_status,loan_bank_mapping.loan_borrower_status,loan_bank_mapping.lender_ref_id,loan_products.product, loan_disbursement.disbursement_date,users.name,users.email,users.contact,assigned_sales_user, users.parent_id,users.usertype,loan_bank_mapping.bank_id,loan_bank_mapping.bank_emp_id,  (select bank from banktbl where banktbl.id=loan_bank_mapping.bank_id) as bankname,loan_sanction.san_amount,loan_sanction.amount_um,loan_sanction.san_date, loan_bank_mapping.loan_bank_mapping_id,loanrequest.loan_product_id,businessaddress.city,businessaddress.state, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_status_caption, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_rev_id, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_caption, (SELECT rsc.comments FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_comments, (SELECT pay.net_payable FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_payable, (SELECT pay.initiated_details FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as initiated_details, (SELECT pay.disbursement_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as disbursement_amount, (SELECT pay.payable_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_amount, (SELECT pay.net_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_amount, (SELECT pay.payable_tax FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_tax, (SELECT pay.payment_status FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payment_status, (select inv_d.id from tbl_invoice_details inv_d where inv_d.disbursement_id = loan_disbursement.disbursementId and inv_d.loan_bank_mapping_id=loan_disbursement.loan_bank_mapping_id LIMIT 1) as invoice_id, (SELECT sum(amount_paid) FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId) as amount_paid, (SELECT amount_paid_date FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId order by pp.created_on desc limit 1) as ca_amount_paid_date, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as paymentId, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_rev_id, loan_disbursement.disbursementId,(select payout_percentage from lender_payout where lender_id=loan_bank_mapping.bank_id and loan_product_id=loanrequest.loan_product_id) as payout_percentage,(select payout_percentage from channel_payout where loan_product_id=loanrequest.loan_product_id AND white_label_id='" +
			user_whitelabel +
			"') as channel_payout_percentage,loan_status_with_lender.status as lender_name_banking, users.userid as owner_userid FROM loanrequest,loanusagetype,loan_bank_mapping,loan_disbursement, loan_products,business,users,loan_sanction,loan_status_with_lender,businessaddress where loanrequest.loan_usage_type_id=loanusagetype.typeLid and loan_products.id=loan_product_id and loan_disbursement.loan_sanction_id=loan_sanction.id and loan_bank_mapping.lender_status_id=loan_status_with_lender.id and loan_bank_mapping.loan_id=loanrequest.loanId and loan_bank_status='12' and loan_borrower_status='12' and business.businessid=loanrequest.business_id and business.userid=users.userid and loanrequest.white_label_id='" +
			user_whitelabel +
			"' and  loan_sanction.loan_bank_map_id=loan_bank_mapping.loan_bank_mapping_id and businessaddress.bid=business.businessid and businessaddress.aid=1 and loan_disbursement.disbursementId!='' and (users.parent_id=" +
			req.user["id"] +
			" OR users.userid=" +
			req.user["id"] +
			") and (select count(paymentId) from tbl_payment WHERE disbursement_id = loan_disbursement.disbursementId AND payment_status = 7) < 1 and lender_status_id in(16,17) HAVING (payment_status = 6 OR payment_status = 15 OR payment_status = 18) order by loan_disbursement.upts desc limit " +
			skip +
			"," +
			limit;

		try {
			nativeResult = await myDBStore.sendNativeQuery(query);
		} catch (err) {
			return res.send(err);
		}

		return res.send({status: "ok", data: nativeResult.rows});
	},
	/**
	 * * payment index paid list
	 *
	 * @description :: invoice payment paid list
	 * @api {get} /invoice/paid-list/ payment paid list (deprecated)
	 * @apiName paymentpaidlist
	 * @apiGroup payment
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/invoice/paid-list/
	 *
	 *  @apiSuccess {String} status payment status(if it is success ok otherwise nok).
	 * @apiSuccess {object[]} data payment information.
	 * @apiSuccess {Number} data.userid_san user id.
	 * @apiSuccess {String} data.sanction_process_fee sanction process fee.
	 * @apiSuccess {String} data.san_amount sanction amount.
	 * @apiSuccess {String} data.upload_path upload path(by default it is null).
	 * @apiSuccess {String} data.loan_repay loan replay (by default it is null).
	 * @apiSuccess {String} data.channel_invoice
	 * @apiSuccess {String} data.san_interest sanction interest.
	 * @apiSuccess {String} data.loan_ref_id loan reference id.
	 * @apiSuccess {String} data.businessname business company name.
	 * @apiSuccess {Number} data.loan_amount loan amount.
	 * @apiSuccess {String} data.business_email email id.
	 * @apiSuccess {String} data.businesspancardnumber pancard number.
	 * @apiSuccess {String} data.gstin gst interest(by default it is null).
	 * @apiSuccess {Number} data.businesstype
	 * @apiSuccess {String} data.loan_amount_um lakhs/crores
	 * @apiSuccess {Number} data.loan_request_type
	 * @apiSuccess {Number} data.sales_id sales id.
	 * @apiSuccess {Number} data.loan_orginitaor
	 * @apiSuccess {Number} data.disbursementId disbursement Id.
	 * @apiSuccess {Number} data.disbursement_amt disbursement amount.
	 * @apiSuccess {String} data.disbursement_amt_um disbursement amount(lakhs/crores).
	 * @apiSuccess {String} data.disbursement_channel_invoice
	 * @apiSuccess {String} data.repayment_doc repayment document.
	 * @apiSuccess {String} data.lender_confirmation lender confirmation.
	 * @apiSuccess {String} data.lender_ref_id lender reference id.
	 * @apiSuccess {String} data.product product name.
	 * @apiSuccess {String} data.disbursement_date disbursement date.
	 * @apiSuccess {String} data.name name.
	 * @apiSuccess {String} data.email email.
	 * @apiSuccess {String} data.contact contact number.
	 * @apiSuccess {Number} data.assigned_sales_user sales users.
	 * @apiSuccess {Number} data.parent_id parent id.
	 * @apiSuccess {String} data.usertype user type.
	 * @apiSuccess {Number} data.bank_id bank id.
	 * @apiSuccess {Number} data.bank_emp_id bank employee id.
	 * @apiSuccess {String} data.bankname bank name.
	 * @apiSuccess {String} data.amount_um amount in lakhs/crores.
	 * @apiSuccess {String} data.san_date sancation date.
	 * @apiSuccess {Number} data.loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} data.loan_product_id loan product id.
	 * @apiSuccess {String} data.city city.
	 * @apiSuccess {String} data.state state.
	 * @apiSuccess {String} data.collection_status_caption
	 * @apiSuccess {String} data.collection_rev_id
	 * @apiSuccess {String} data.payment_status_caption payment status caption.
	 * @apiSuccess {String} data.payment_status_comments payment status comments.
	 * @apiSuccess {String} data.net_payable net payable amount.
	 * @apiSuccess {String} data.initiated_details
	 * @apiSuccess {String} data.disbursement_amount disbursement amount.
	 * @apiSuccess {String} data.payable_amount payable amount.
	 * @apiSuccess {Number} data.net_amount net amount.
	 * @apiSuccess {String} data.payable_tax payable tax.
	 * @apiSuccess {Number} data.payment_status payment status.
	 * @apiSuccess {String} data.invoice_id invoice id.
	 * @apiSuccess {String} data.amount_paid amount paid
	 * @apiSuccess {String} data.ca_amount_paid_date amount paid date.
	 * @apiSuccess {Number} data.paymentId payment Id.
	 * @apiSuccess {Number} data.payment_rev_id
	 * @apiSuccess {String} data.payout_percentage payout percentage.
	 * @apiSuccess {Number} data.channel_payout_percentage
	 * @apiSuccess {String} data.lender_name_banking lender name.
	 * @apiSuccess {Number} data.owner_userid owner user id.
	 */

	paid: async function (req, res) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let limit,
			skip = "";
		if (req.query.limit == undefined) {
			limit = 3;
		} else {
			limit = req.query.limit;
		}
		if (req.query.skip == undefined) {
			skip = 0;
		} else {
			skip = req.query.skip;
		}
		const query =
			"SELECT SQL_CALC_FOUND_ROWS loan_sanction.userid as userid_san, sanction_process_fee,san_amount,loanrequest.loan_status_id,loanrequest.loan_sub_status_id,loan_bank_mapping.loan_bank_status,loan_bank_mapping.loan_borrower_status,loan_sanction.upload_path,loan_sanction.loan_repay,loan_sanction.channel_invoice as channel_invoice ,san_interest,loan_ref_id,businessname,loan_amount, business_email,businesspancardnumber,gstin,business.businesstype, loan_amount_um,loanrequest.loan_request_type,loanrequest.sales_id,loanrequest.loan_orginitaor, disbursementId,disbursement_amt,disbursement_amt_um,loan_disbursement.channel_invoice as disbursement_channel_invoice,loan_disbursement.repayment_doc,loan_disbursement.lender_confirmation,loan_bank_mapping.lender_ref_id,loan_products.product, loan_disbursement.disbursement_date,users.name,users.email,users.contact,assigned_sales_user, users.parent_id,users.usertype,loan_bank_mapping.bank_id,loan_bank_mapping.bank_emp_id,  (select bank from banktbl where banktbl.id=loan_bank_mapping.bank_id) as bankname,loan_sanction.san_amount,loan_sanction.amount_um,loan_sanction.san_date, loan_bank_mapping.loan_bank_mapping_id,loanrequest.loan_product_id,businessaddress.city,businessaddress.state, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_status_caption, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_rev_id, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_caption, (SELECT rsc.comments FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_comments, (SELECT pay.net_payable FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_payable, (SELECT pay.initiated_details FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as initiated_details, (SELECT pay.disbursement_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as disbursement_amount, (SELECT pay.payable_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_amount, (SELECT pay.net_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_amount, (SELECT pay.payable_tax FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_tax, (SELECT pay.payment_status FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payment_status, (select inv_d.id from tbl_invoice_details inv_d where inv_d.disbursement_id = loan_disbursement.disbursementId and inv_d.loan_bank_mapping_id=loan_disbursement.loan_bank_mapping_id LIMIT 1) as invoice_id, (SELECT sum(amount_paid) FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId) as amount_paid, (SELECT amount_paid_date FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId order by pp.created_on desc limit 1) as ca_amount_paid_date, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as paymentId, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_rev_id, loan_disbursement.disbursementId,(select payout_percentage from lender_payout where lender_id=loan_bank_mapping.bank_id and loan_product_id=loanrequest.loan_product_id) as payout_percentage,(select payout_percentage from channel_payout where loan_product_id=loanrequest.loan_product_id AND white_label_id='" +
			user_whitelabel +
			"') as channel_payout_percentage,loan_status_with_lender.status as lender_name_banking, users.userid as owner_userid FROM loanrequest,loan_bank_mapping,loan_disbursement, loan_products,business,users,loan_sanction,loan_status_with_lender,businessaddress where loan_products.id=loan_product_id and loan_disbursement.loan_sanction_id=loan_sanction.id and loan_bank_mapping.lender_status_id=loan_status_with_lender.id and loan_bank_mapping.loan_id=loanrequest.loanId and loan_bank_status='12' and loan_borrower_status='12' and business.businessid=loanrequest.business_id and business.userid=users.userid and loanrequest.white_label_id='" +
			user_whitelabel +
			"'  and loan_sanction.loan_bank_map_id=loan_bank_mapping.loan_bank_mapping_id and businessaddress.bid=business.businessid and businessaddress.aid=1 and loan_disbursement.disbursementId!='' and (users.parent_id=" +
			req.user["id"] +
			" OR users.userid=" +
			req.user["id"] +
			") and (select count(paymentId) from tbl_payment WHERE disbursement_id = loan_disbursement.disbursementId AND payment_status = 7) < 1 and lender_status_id in(16,17) HAVING (payment_status = 7 OR payment_status = 19) order by loan_disbursement.upts desc limit " +
			skip +
			"," +
			limit;

		try {
			nativeResult = await myDBStore.sendNativeQuery(query);
		} catch (err) {
			return res.send(err);
		}

		return res.send({status: "ok", data: nativeResult.rows});
	},

	/**
 * payment index for post method
 *
 * @description :: invoice payment index
	* @api {post} /invoice?skip=3&limit=10/ payment index for post method
	 * @apiName paymentindexpost
	 * @apiGroup payment
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/invoice?skip=3&limit=10/
	 * @apiParam {Number} limit limit
	 * @apiParam {Number} skip skip

	 *  @apiSuccess {String} status payment status(if it is success ok otherwise nok).
	 * @apiSuccess {object[]} data payment information.
	 * @apiSuccess {Number} data.userid_san user id.
	 * @apiSuccess {String} data.sanction_process_fee sanction process fee.
	 * @apiSuccess {String} data.san_amount sanction amount.
	 * @apiSuccess {String} data.upload_path upload path(by default it is null).
	 * @apiSuccess {String} data.loan_repay loan replay (by default it is null).
	 * @apiSuccess {String} data.channel_invoice
	 * @apiSuccess {String} data.san_interest sanction interest.
	 * @apiSuccess {String} data.loan_ref_id loan reference id.
	 * @apiSuccess {String} data.businessname business company name.
	 * @apiSuccess {Number} data.loan_amount loan amount.
	 * @apiSuccess {String} data.business_email email id.
	 * @apiSuccess {String} data.businesspancardnumber pancard number.
	 * @apiSuccess {String} data.gstin gst interest(by default it is null).
	 * @apiSuccess {Number} data.businesstype
	 * @apiSuccess {String} data.loan_amount_um lakhs/crores
	 * @apiSuccess {Number} data.loan_request_type
	 * @apiSuccess {Number} data.sales_id sales id.
	 * @apiSuccess {Number} data.loan_orginitaor
	 * @apiSuccess {Number} data.disbursementId disbursement Id.
	 * @apiSuccess {Number} data.disbursement_amt disbursement amount.
	 * @apiSuccess {String} data.disbursement_amt_um disbursement amount(lakhs/crores).
	 * @apiSuccess {String} data.disbursement_channel_invoice
	 * @apiSuccess {String} data.repayment_doc repayment document.
	 * @apiSuccess {String} data.lender_confirmation lender confirmation.
	 * @apiSuccess {String} data.lender_ref_id lender reference id.
	 * @apiSuccess {String} data.product product name.
	 * @apiSuccess {String} data.disbursement_date disbursement date.
	 * @apiSuccess {String} data.name name.
	 * @apiSuccess {String} data.email email.
	 * @apiSuccess {String} data.contact contact number.
	 * @apiSuccess {Number} data.assigned_sales_user sales users.
	 * @apiSuccess {Number} data.parent_id parent id.
	 * @apiSuccess {String} data.usertype user type.
	 * @apiSuccess {Number} data.bank_id bank id.
	 * @apiSuccess {Number} data.bank_emp_id bank employee id.
	 * @apiSuccess {String} data.bankname bank name.
	 * @apiSuccess {String} data.amount_um amount in lakhs/crores.
	 * @apiSuccess {String} data.san_date sancation date.
	 * @apiSuccess {Number} data.loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} data.loan_product_id loan product id.
	 * @apiSuccess {String} data.city city.
	 * @apiSuccess {String} data.state state.
	 * @apiSuccess {String} data.collection_status_caption
	 * @apiSuccess {String} data.collection_rev_id
	 * @apiSuccess {String} data.payment_status_caption payment status caption.
	 * @apiSuccess {String} data.payment_status_comments payment status comments.
	 * @apiSuccess {String} data.net_payable net payable amount.
	 * @apiSuccess {String} data.initiated_details
	 * @apiSuccess {String} data.disbursement_amount disbursement amount.
	 * @apiSuccess {String} data.payable_amount payable amount.
	 * @apiSuccess {Number} data.net_amount net amount.
	 * @apiSuccess {String} data.payable_tax payable tax.
	 * @apiSuccess {Number} data.payment_status payment status.
	 * @apiSuccess {String} data.invoice_id invoice id.
	 * @apiSuccess {String} data.amount_paid amount paid
	 * @apiSuccess {String} data.ca_amount_paid_date amount paid date.
	 * @apiSuccess {Number} data.paymentId payment Id.
	 * @apiSuccess {Number} data.payment_rev_id
	 * @apiSuccess {String} data.payout_percentage payout percentage.
	 * @apiSuccess {Number} data.channel_payout_percentage
	 * @apiSuccess {String} data.lender_name_banking lender name.
	 * @apiSuccess {Number} data.owner_userid owner user id.

  */

	/**
 * payment index for get method
 *
 * @description :: invoice payment index
 *
 * @api {get} /invoice/ payment index for get method
 * @apiName paymentindexedit
 * @apiGroup payment
 *  @apiExample Example usage:
 * curl -i localhost:1337/invoice/

 * @apiSuccess {String} status payment status(if it is success ok otherwise nok).
	 * @apiSuccess {object[]} data payment information.
	 * @apiSuccess {Number} data.userid_san user id.
	 * @apiSuccess {String} data.sanction_process_fee sanction process fee.
	 * @apiSuccess {String} data.san_amount sanction amount.
	 * @apiSuccess {String} data.upload_path upload path(by default it is null).
	 * @apiSuccess {String} data.loan_repay loan replay (by default it is null).
	 * @apiSuccess {String} data.channel_invoice
	 * @apiSuccess {String} data.san_interest sanction interest.
	 * @apiSuccess {String} data.loan_ref_id loan reference id.
	 * @apiSuccess {String} data.businessname business company name.
	 * @apiSuccess {Number} data.loan_amount loan amount.
	 * @apiSuccess {String} data.business_email email id.
	 * @apiSuccess {String} data.businesspancardnumber pancard number.
	 * @apiSuccess {String} data.gstin gst interest(by default it is null).
	 * @apiSuccess {Number} data.businesstype
	 * @apiSuccess {String} data.loan_amount_um lakhs/crores
	 * @apiSuccess {Number} data.loan_request_type
	 * @apiSuccess {Number} data.sales_id sales id.
	 * @apiSuccess {Number} data.loan_orginitaor
	 * @apiSuccess {Number} data.disbursementId disbursement Id.
	 * @apiSuccess {Number} data.disbursement_amt disbursement amount.
	 * @apiSuccess {String} data.disbursement_amt_um disbursement amount(lakhs/crores).
	 * @apiSuccess {String} data.disbursement_channel_invoice
	 * @apiSuccess {String} data.repayment_doc repayment document.
	 * @apiSuccess {String} data.lender_confirmation lender confirmation.
	 * @apiSuccess {String} data.lender_ref_id lender reference id.
	 * @apiSuccess {String} data.product product name.
	 * @apiSuccess {String} data.disbursement_date disbursement date.
	 * @apiSuccess {String} data.name name.
	 * @apiSuccess {String} data.email email.
	 * @apiSuccess {String} data.contact contact number.
	 * @apiSuccess {Number} data.assigned_sales_user sales users.
	 * @apiSuccess {Number} data.parent_id parent id.
	 * @apiSuccess {String} data.usertype user type.
	 * @apiSuccess {Number} data.bank_id bank id.
	 * @apiSuccess {Number} data.bank_emp_id bank employee id.
	 * @apiSuccess {String} data.bankname bank name.
	 * @apiSuccess {String} data.amount_um amount in lakhs/crores.
	 * @apiSuccess {String} data.san_date sancation date.
	 * @apiSuccess {Number} data.loan_bank_mapping_id loan bank mapping id.
	 * @apiSuccess {Number} data.loan_product_id loan product id.
	 * @apiSuccess {String} data.city city.
	 * @apiSuccess {String} data.state state.
	 * @apiSuccess {String} data.collection_status_caption
	 * @apiSuccess {String} data.collection_rev_id
	 * @apiSuccess {String} data.payment_status_caption payment status caption.
	 * @apiSuccess {String} data.payment_status_comments payment status comments.
	 * @apiSuccess {String} data.net_payable net payable amount.
	 * @apiSuccess {String} data.initiated_details
	 * @apiSuccess {String} data.disbursement_amount disbursement amount.
	 * @apiSuccess {String} data.payable_amount payable amount.
	 * @apiSuccess {Number} data.net_amount net amount.
	 * @apiSuccess {String} data.payable_tax payable tax.
	 * @apiSuccess {Number} data.payment_status payment status.
	 * @apiSuccess {String} data.invoice_id invoice id.
	 * @apiSuccess {String} data.amount_paid amount paid
	 * @apiSuccess {String} data.ca_amount_paid_date amount paid date.
	 * @apiSuccess {Number} data.paymentId payment Id.
	 * @apiSuccess {Number} data.payment_rev_id
	 * @apiSuccess {String} data.payout_percentage payout percentage.
	 * @apiSuccess {Number} data.channel_payout_percentage
	 * @apiSuccess {String} data.lender_name_banking lender name.
	 * @apiSuccess {Number} data.owner_userid owner user id.

*/
	index: async function (req, res) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			myDBStore = sails.getDatastore("mysql_namastecredit_read"); //gets the default datastore.
		let limit,
			skip,
			payment_status = "";
		if (req.query.limit == undefined) {
			limit = 3;
		} else {
			limit = req.query.limit;
		}
		if (req.query.skip == undefined) {
			skip = 0;
		} else {
			skip = req.query.skip;
		}
		if (req.query.payment_status == undefined) {
			payment_status = null;
		} else {
			payment_status = req.query.payment_status;
		}
		let query =
			"SELECT SQL_CALC_FOUND_ROWS loan_sanction.userid as userid_san, sanction_process_fee,san_amount,loan_sanction.upload_path,loan_sanction.loan_repay,loan_sanction.channel_invoice as channel_invoice ,san_interest,loan_ref_id,businessname,loan_amount, business_email,businesspancardnumber,gstin,business.businesstype, loan_amount_um,loanrequest.loan_request_type,loanrequest.sales_id,loanrequest.loan_orginitaor, disbursementId,disbursement_amt,disbursement_amt_um,loan_disbursement.channel_invoice as disbursement_channel_invoice,loan_disbursement.repayment_doc,loan_disbursement.lender_confirmation,loan_bank_mapping.lender_ref_id,loan_products.product, loan_disbursement.disbursement_date,users.name,users.email,users.contact,assigned_sales_user, users.parent_id,users.usertype,loan_bank_mapping.bank_id,loan_bank_mapping.bank_emp_id, bank_master.bankname,loan_sanction.san_amount,loan_sanction.amount_um,loan_sanction.san_date, loan_bank_mapping.loan_bank_mapping_id,loanrequest.loan_product_id,businessaddress.city,businessaddress.state, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_status_caption, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_rev_id, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_caption, (SELECT rsc.comments FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_comments, (SELECT pay.net_payable FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_payable, (SELECT pay.initiated_details FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as initiated_details, (SELECT pay.disbursement_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as disbursement_amount, (SELECT pay.payable_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_amount, (SELECT pay.net_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_amount, (SELECT pay.payable_tax FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_tax, (SELECT pay.payment_status FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payment_status, (select inv_d.id from tbl_invoice_details inv_d where inv_d.disbursement_id = loan_disbursement.disbursementId and inv_d.loan_bank_mapping_id=loan_disbursement.loan_bank_mapping_id LIMIT 1) as invoice_id, (SELECT sum(amount_paid) FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId) as amount_paid, (SELECT amount_paid_date FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId order by pp.created_on desc limit 1) as ca_amount_paid_date, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as paymentId, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_rev_id, loan_disbursement.disbursementId,(select payout_percentage from lender_payout where lender_id=loan_bank_mapping.bank_id and loan_product_id=loanrequest.loan_product_id) as payout_percentage,(select payout_percentage from channel_payout where loan_product_id=loanrequest.loan_product_id AND white_label_id='" +
			user_whitelabel +
			"') as channel_payout_percentage,loan_status_with_lender.status as lender_name_banking, users.userid as owner_userid FROM bank_master,loanrequest,loan_bank_mapping,loan_disbursement, loan_products,business,users,loan_sanction,loan_status_with_lender,businessaddress where loan_products.id=loan_product_id and loan_disbursement.loan_sanction_id=loan_sanction.id and loan_bank_mapping.lender_status_id=loan_status_with_lender.id and loan_bank_mapping.loan_id=loanrequest.loanId and loan_bank_status='12' and loan_borrower_status='12' and business.businessid=loanrequest.business_id and business.userid=users.userid and loanrequest.white_label_id='" +
			user_whitelabel +
			"' and bank_master.bankid=loan_bank_mapping.bank_id and loan_sanction.loan_bank_map_id=loan_bank_mapping.loan_bank_mapping_id and businessaddress.bid=business.businessid and businessaddress.aid=1 and loan_disbursement.disbursementId!='' and (users.parent_id=" +
			req.user["id"] +
			" OR users.userid=" +
			req.user["id"] +
			") ";

		if (payment_status !== null) {
			query +=
				" and (select count(paymentId) from tbl_payment WHERE disbursement_id = loan_disbursement.disbursementId AND payment_status = 7) < 1 and lender_status_id in(16,17) HAVING payment_status = " +
				payment_status +
				" order by loan_disbursement.upts desc limit " +
				skip +
				"," +
				limit;
		} else {
			query +=
				" and (select count(paymentId) from tbl_payment WHERE disbursement_id = loan_disbursement.disbursementId AND payment_status = 7) < 1 and lender_status_id in(16,17) order by loan_disbursement.upts desc limit " +
				skip +
				"," +
				limit;
		}

		try {
			nativeResult = await myDBStore.sendNativeQuery(query);
		} catch (err) {
			return res.send(err);
		}

		return res.send({status: "ok", data: nativeResult.rows});
		// var query = "SELECT SQL_CALC_FOUND_ROWS loan_sanction.userid as userid_san, sanction_process_fee,san_amount,loan_sanction.upload_path,loan_sanction.loan_repay,loan_sanction.channel_invoice as channel_invoice ,san_interest,loan_ref_id,businessname,loan_amount, business_email,businesspancardnumber,gstin,business.businesstype, loan_amount_um,loanrequest.sales_id,loanrequest.loan_orginitaor, disbursementId,disbursement_amt,disbursement_amt_um,loan_disbursement.channel_invoice as disbursement_channel_invoice,loan_disbursement.repayment_doc,loan_disbursement.lender_confirmation,loan_bank_mapping.lender_ref_id,loan_products.product, loan_disbursement.disbursement_date,users.name,users.email,users.contact,assigned_sales_user, users.parent_id,users.usertype,loan_bank_mapping.bank_id,loan_bank_mapping.bank_emp_id, bank_master.bankname,loan_sanction.san_amount,loan_sanction.amount_um,loan_sanction.san_date, loan_bank_mapping.loan_bank_mapping_id,loanrequest.loan_product_id,businessaddress.city,businessaddress.state, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_status_caption, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='revenue' ORDER BY rsc.id DESC LIMIT 1) as collection_rev_id, (SELECT rs.status_caption FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_caption, (SELECT rsc.comments FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_status_comments, (SELECT pay.net_payable FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_payable, (SELECT pay.initiated_details FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as initiated_details, (SELECT pay.disbursement_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as disbursement_amount, (SELECT pay.payable_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_amount, (SELECT pay.net_amount FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as net_amount, (SELECT pay.payable_tax FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payable_tax, (SELECT pay.payment_status FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as payment_status, (select inv_d.id from tbl_invoice_details inv_d where inv_d.disbursement_id = loan_disbursement.disbursementId and inv_d.loan_bank_mapping_id=loan_disbursement.loan_bank_mapping_id LIMIT 1) as invoice_id, (SELECT sum(amount_paid) FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId) as amount_paid, (SELECT amount_paid_date FROM tbl_payment_paid pp,tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId and pp.payment_id = pay.paymentId order by pp.created_on desc limit 1) as ca_amount_paid_date, (SELECT pay.paymentId FROM tbl_payment pay WHERE pay.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and pay.disbursement_id = loan_disbursement.disbursementId ORDER BY pay.paymentId DESC LIMIT 1) as paymentId, (SELECT rs.rev_id FROM revenue_status rs,revenue_status_comments rsc WHERE rsc.comment_id = rs.rev_id and rsc.loan_bank_mapping_id = loan_bank_mapping.loan_bank_mapping_id and rsc.disbursement_id = loan_disbursement.disbursementId and rsc.type='payment' ORDER BY rsc.id DESC LIMIT 1) as payment_rev_id, loan_disbursement.disbursementId,(select payout_percentage from lender_payout where lender_id=loan_bank_mapping.bank_id and loan_product_id=loanrequest.loan_product_id) as payout_percentage,(select payout_percentage from channel_payout where loan_product_id=loanrequest.loan_product_id AND white_label_id='1') as channel_payout_percentage,loan_status_with_lender.status as lender_name_banking, users.userid as owner_userid FROM bank_master,loanrequest,loan_bank_mapping,loan_disbursement, loan_products,business,users,loan_sanction,loan_status_with_lender,businessaddress where loan_products.id=loan_product_id and loan_disbursement.loan_sanction_id=loan_sanction.id and loan_bank_mapping.lender_status_id=loan_status_with_lender.id and loan_bank_mapping.loan_id=loanrequest.loanId and loan_bank_status='12' and loan_borrower_status='12' and business.businessid=loanrequest.business_id and business.userid=users.userid and loanrequest.white_label_id='1' and bank_master.bankid=loan_bank_mapping.bank_id and loan_sanction.loan_bank_map_id=loan_bank_mapping.loan_bank_mapping_id and businessaddress.bid=business.businessid and businessaddress.aid=1 and loan_disbursement.disbursementId!='' and (users.parent_id='40' OR users.userid='40') and (select count(paymentId) from tbl_payment WHERE disbursement_id = loan_disbursement.disbursementId AND payment_status = 7) < 1 and lender_status_id in(16,17) order by loan_disbursement.upts desc limit 0,10";
		// var rawResult = await sails.sendNativeQuery(query, []);
		// return res.view({
		//     result: rawResult
		// });
	},
	/**
 * payment status
 *
 * @description :: invoice payment status
 *
 * @api {post} /invoice/status/ payment status
 * @apiName paymentstatus
 * @apiGroup payment
 *  @apiExample Example usage:
 * curl -i localhost:1337/invoice/status/

 *
 *
 * @apiSuccess {Number} id payment id.
 * @apiSuccess {String} status_caption status caption.
 * @apiSuccess {Number} controls
 * @apiSuccess {String} type type.
 * @apiSuccess {String} control_list control list.
 * @apiSuccess {String} pre_condition pre condition.
*/

	paymentStatusControls: async function (req, res) {
		let status;
		const logService = await sails.helpers.logtrackservice(req, "invoice/status", req.user.id, "revenue_status");
		try {
			status = await RevenueStatusRd.find({
				type: "payment"
			});
		} catch (err) {
			switch (err.name) {
				case "UsageError":
					return res.badRequest(err);
				default:
					throw err;
			}
		}

		return res.json(status);
		// var myDBStore = sails.getDatastore('mysql_namastecredit_read'); //gets the default datastore.

		// var query = "SELECT `rev_id`, `status_caption`, `controls`, `type`, `control_list`,pre_condition FROM `revenue_status` where type='payment'";

		// try {
		//     nativeResult = await myDBStore.sendNativeQuery(query);
		//   } catch (err) {
		//     return res.send(err);
		//   }

		//   return res.send({status:"ok",data:nativeResult.rows});
	},

	/**
	* @api {post} /invoice/paymentInitiate/ payment initiate
	 * @apiName paymentinitiate
	 * @apiGroup payment
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/invoice/paymentInitiate/
	 *

	 * @apiParam {Number} loan_bank_mapping_id loan bank mapping id.
	 * @apiParam {String} disbursement_id disbursement id.
	 * @apiParam {String} disbursement_amount disbursement amount.
	 * @apiParam {Number} payment_status payment status.
	 * @apiParam {String} lender_ref_id lender reference id.
	 * @apiParam {Number} notification notification.
	 * @apiParam {String} channel_payout_percentage channel payout percentage.
	 * @apiParam {String} payable_amount payable amount.
	 * @apiParam {Number} subvention subvention.
	 * @apiParam {Number} net_amount net amount.
	 * @apiParam {String} payable_tax payable tax.
	 * @apiParam {Number} gst gst.
	 * @apiParam {String} net_payable net payable.
	 * @apiParam {Number} user_bank_id user bank id.
	 * @apiParam {String} note note.
	 *

	 * @apiSuccess {String} status status (if it is success ok otherwise nok).
	 * @apiSuccess {string} message display message (Thank you!For submitting your Invoice.Our Accounts team and Namaste Credit RM will be in touch).
	 * @apiSuccess {Object} data

 */
	paymentInitiate: async function (req, res) {
		const post_data = req.allParams();
		if (post_data.payment_status == "5") {
			const loan_bank_mapping_id = post_data.loan_bank_mapping_id,
				disbursement_id = post_data.disbursement_id,
				disbursement_amount = post_data.disbursement_amount,
				payment_status = post_data.payment_status,
				lender_ref_id = post_data.lender_ref_id,
				notification = post_data.notification,
				channel_payout_percentage = post_data.channel_payout_percentage,
				payable_amount = post_data.payable_amount,
				subvention = post_data.subvention,
				net_amount = post_data.net_amount,
				payable_tax = post_data.payable_tax,
				payable_gst = post_data.gst,
				net_payable_amount = post_data.net_payable,
				user_bank_id = post_data.user_bank_id,
				comments = post_data.note,
				type = "payment",

				old_payment = await TblPaymentRd.find({
					disbursement_id: disbursement_id,
					loan_bank_mapping_id: loan_bank_mapping_id
				});

			if (old_payment == undefined || old_payment.length < 1) {
				const loan_bank_mapping = await LoanBankMapping.updateOne({id: loan_bank_mapping_id}).set({
					lender_ref_id: lender_ref_id
				}),

					payment_initiated_data = {
						loan_bank_mapping_id: loan_bank_mapping_id,
						disbursement_amount: disbursement_amount,
						channel_payout_percentage: channel_payout_percentage,
						payable_amount: payable_amount,
						subvention: subvention,
						net_amount: net_amount,
						payable_tax: payable_tax,
						payable_gst: payable_gst,
						net_payable: net_payable_amount,
						user_bank_id: user_bank_id,
						notification: notification,
						disbursement_id: disbursement_id,
						payment_status: payment_status,
						payment_created_by: req.user.id
					},

					payment = await TblPayment.create({
						loan_bank_mapping_id: loan_bank_mapping_id,
						disbursement_amount: disbursement_amount,
						channel_payout_percentage: channel_payout_percentage,
						payable_amount: payable_amount,
						subvention: subvention,
						net_amount: net_amount,
						payable_tax: payable_tax,
						payable_gst: payable_gst,
						net_payable: net_payable_amount,
						user_bank_id: user_bank_id,
						notification: notification,
						disbursement_id: disbursement_id,
						payment_status: payment_status,
						payment_created_by: req.user.id,
						created_on: await sails.helpers.dateTime(),
						initiated_details: JSON.stringify(payment_initiated_data)
					}).fetch(),
					logService = await sails.helpers.logtrackservice(
						req,
						"invoice/paymentInitiate",
						payment.id,
						"tbl_payment"
					);

				if (payment) {
					const payment_comments = await RevenueStatusComments.create({
						loan_bank_mapping_id: loan_bank_mapping_id,
						comments: comments,
						comment_id: payment_status,
						type: type,
						created_by: req.user.id,
						disbursement_id: disbursement_id,
						notification: notification,
						created_on: await sails.helpers.dateTime()
					}).fetch();
					if (payment_comments) {
						return res.json({
							status: "ok",
							message:
								"Thank you!For submitting your Invoice.Our Accounts team and Namaste Credit RM will be in touch.",
							data: payment
						});
					} else {
						return res.json({status: "nok", message: "Payment initiate failed"});
					}
				}
			} else {
				return res.json({status: "nok", message: "This payment was already initiated"});
			}
		} else {
			return res.json("Invalid Payment Status");
		}
		return res.json(req.param("loan_banking_id"));
	}
};
