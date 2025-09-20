/**
 * Loanusagetype
 *
 * @description :: Server-side logic for managing Loanusagetype
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * @api {get} /Loanusagetype/ Loan usage type
   * @apiName loan usage
   * @apiGroup Loans
   * @apiExample Example usage:
   * curl -i localhost:1337/Loanusagetype/
   * @apiSuccess {Number} id id.
   * @apiSuccess {String} typeLname loan Type name.
   * @apiSuccess {String} status status.

 */
module.exports = {
	index: function (req, res, next) {
		LoanusagetypeRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		LoanusagetypeRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		LoanusagetypeRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		Loanusagetype.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loanusagetype/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Loanusagetype.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loanusagetype");
		});
	}
};
