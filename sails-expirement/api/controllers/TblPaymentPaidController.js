/**
 * TblPaymentPaid
 *
 * @description :: Server-side logic for managing TblPaymentPaid
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
* @api {get} /TblPaymentPaid/ table payment paid
* @apiName table payment paid
* @apiGroup Table
* @apiExample Example usage:
* curl -i localhost:1337/TblPaymentPaid/

* @apiSuccess {Number} id ID.
* @apiSuccess {Number} amount_paid amount paid.
* @apiSuccess {string} amount_paid_date amount paid date.
* @apiSuccess {String} txn_ref_id transaction reference id.
* @apiSuccess {String} created_on created date.
* @apiSuccess {Number} created_by

* @apiSuccess {Object} payment
* @apiSuccess {Number} payment.id ID.
* @apiSuccess {String} payment.disbursement_id disbursement id.
* @apiSuccess {String} payment.disbursement_amt disbursement amount.
* @apiSuccess {Number} payment.payment_status payment status.
* @apiSuccess {String} payment.channel_payout_percentage channel payout percentage.
* @apiSuccess {String} payment.payable_amount payable amount.
* @apiSuccess {Number} payment.subvention
* @apiSuccess {Number} payment.net_amount net amount.
* @apiSuccess {String} payment.payable_tax payable tax.
* @apiSuccess {String} payment.payable_gst payable gst.
* @apiSuccess {String} payment.net_payable net payable.
* @apiSuccess {String} payment.payout_percentage payout percentage
* @apiSuccess {String} payment.payout_after
* @apiSuccess {String} payment.initiated_details initiated details.
* @apiSuccess {String} payment.status status.
* @apiSuccess {Number} payment.notification
* @apiSuccess {String} payment.payment_created_by
* @apiSuccess {String} payment.approved_by
* @apiSuccess {String} payment.created_on payment created date and time.
* @apiSuccess {String} payment.approved_date payment approved date.
* @apiSuccess {String} payment.updated_on payment updated date and time.
* @apiSuccess {Number} payment.loan_bank_mapping_id loan bank mapping id.
* @apiSuccess {String} payment.user_bank_id user bank id.
 */
module.exports = {
	index: function (req, res, next) {
		TblPaymentPaidRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		TblPaymentPaidRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		TblPaymentPaidRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		TblPaymentPaid.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("tblPaymentPaid/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		TblPaymentPaid.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/tblPaymentPaid");
		});
	}
};
