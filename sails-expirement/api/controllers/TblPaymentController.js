/**
 * TblPayment
 *
 * @description :: Server-side logic for managing TblPayment
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
* @api {get} /TblPayment/ table payment
* @apiName table payment
* @apiGroup Table
* @apiExample Example usage:
* curl -i localhost:1337/TblPayment/

* @apiSuccess {Object[]} payment_paid
* @apiSuccess {Number} id ID.
* @apiSuccess {String} disbursement_id disbursement id.
* @apiSuccess {String} disbursement_amt disbursement amount.
* @apiSuccess {Number} payment_status payment status.
* @apiSuccess {String} channel_payout_percentage channel payout percentage.
* @apiSuccess {String} payable_amount payable amount.
* @apiSuccess {Number} subvention
* @apiSuccess {Number} net_amount net amount.
* @apiSuccess {String} payable_tax payable tax.
* @apiSuccess {String} payable_gst payable gst.
* @apiSuccess {String} net_payable net payable.
* @apiSuccess {String} payout_percentage payout percentage
* @apiSuccess {String} payout_after
* @apiSuccess {String} initiated_details initiated details.
* @apiSuccess {String} status status.
* @apiSuccess {Number} notification
* @apiSuccess {String} payment_created_by
* @apiSuccess {String} approved_by
* @apiSuccess {String} created_on payment created date and time.
* @apiSuccess {String} approved_date payment approved date.
* @apiSuccess {String} updated_on payment updated date and time.

* @apiSuccess {object[]} loan_bank_mapping_id

* @apiSuccess {Number} loan_bank_mapping_id.id loan banking and mapping id.
* @apiSuccess {Number} loan_bank_mapping_id.loan_id Loan ID.
* @apiSuccess {Number} loan_bank_mapping_id.business_id loan Business ID.
* @apiSuccess {Number} loan_bank_mapping_id.bank_emp_id bank employee ID.
* @apiSuccess {Number} loan_bank_mapping_id.loan_bank_status loan bank status.
* @apiSuccess {Number} loan_bank_mapping_id.loan_borrower_status loan borrower status.
* @apiSuccess {Number} loan_bank_mapping_id.offer_amnt offer amount.
* @apiSuccess {String} loan_bank_mapping_id.offer_amnt_um lakhs/cores.
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
* @apiSuccess {String} loan_bank_mapping_id.meeting_flag
* @apiSuccess {String} loan_bank_mapping_id.notification_status notification status.
* @apiSuccess {String} loan_bank_mapping_id.upload_doc upload document.
* @apiSuccess {String} loan_bank_mapping_id.lender_ref_id lender reference id.
* @apiSuccess {String} loan_bank_mapping_id.create_at created date and time.
* @apiSuccess {String} loan_bank_mapping_id.updated_at updated date and time.
* @apiSuccess {String} loan_bank_mapping_id.source source.
* @apiSuccess {String} loan_bank_mapping_id.status_history status history.
* @apiSuccess {Number} loan_bank_mapping_id.bank_id bank id.
* @apiSuccess {Number} loan_bank_mapping_id.lender_status lender status.
* @apiSuccess {String} payment_status payment status.
* @apiSuccess {String} user_bank_id user bank id.
 */

module.exports = {
	index: function (req, res, next) {
		Tbl_PaymentRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		TblPaymentRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		TblPaymentRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		TblPayment.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("tblPayment/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		TblPayment.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/tblPayment");
		});
	}
};
