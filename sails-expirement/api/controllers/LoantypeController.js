/**
 * Loantype
 *
 * @description :: Server-side logic for managing Loantype
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * @api {get} /LoanType/ Loan type
   * @apiName loan type
   * @apiGroup Loans
   * @apiExample Example usage:
   * curl -i localhost:1337/LoanType/
   * @apiSuccess {Number} id id.
   * @apiSuccess {String} loanType loan Type.
   * @apiSuccess {String} description description.
   * @apiSuccess {String} display
   * @apiSuccess {String} doc_detail document detail.

 */
module.exports = {
	index: function (req, res, next) {
		LoantypeRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		LoantypeRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		LoantypeRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		Loantype.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loantype/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Loantype.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loantype");
		});
	}
};
