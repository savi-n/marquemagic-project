/**
 * LoanStatusWithLender
 *
 * @description :: Server-side logic for managing LoanStatusWithLender
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /LoanStatusWithLender/ Loan status with lender
* @apiName loan status
* @apiGroup Loans
* @apiExample Example usage:
* curl -i localhost:1337/LoanStatusWithLender/
*@apiSuccess {Number} id id.
*@apiSuccess {String} status status.
*@apiSuccess {Number} display_post_offer display post offer.
*@apiSuccess {String} loan_bank_status_to_show loan bank status to show.
*@apiSuccess {String} status_to_update status to update.
*@apiSuccess {Number} disbursement_status disbursement status.

 */

/**
 * Lender status
 *
 * @description :: Server-side logic for managing LoanStatusWithLender
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /lenderStatus/ Lender Status
* @apiName Lender status
* @apiGroup Lender
* @apiExample Example usage:
* curl -i localhost:1337/lenderStatus/
*@apiSuccess {String} status It can be ok/nok.
*@apiSuccess {String} message Status displayed successfully.
*@apiSuccess {Object[]} data Array of objects with id and status.

 */
module.exports = {
	index: async function (req, res, next) {
		const users_whitelabel = req.user.loggedInWhiteLabelID,
			query =
				"select id,status FROM loan_status_with_lender WHERE find_in_set(" +
				users_whitelabel +
				",white_label_id)",
			logService = await sails.helpers.logtrackservice(
				req,
				"lenderStatus",
				req.user.id,
				"loan_status_with_lender"
			),
			myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			result = await myDBStore.sendNativeQuery(query);
		let status = [];
		if (result != null) {
			status = result.rows;
		}
		return res.ok({status: "ok", message: "Status displayed successfully", data: status});
	},

	show: function (req, res, next) {
		LoanStatusWithLenderRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		LoanStatusWithLenderRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		LoanStatusWithLender.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loanStatusWithLender/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		LoanStatusWithLender.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loanStatusWithLender");
		});
	}
};
