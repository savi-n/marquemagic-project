/**
 * Loanassettype
 *
 * @description :: Server-side logic for managing Loanassettype
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * @api {get} /Loanassettype/ loan asset type
 * @apiName asset type
 * @apiGroup Loans
 *  @apiExample Example usage:
 * curl -i localhost:1337/Loanassettype/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {String} typename name type.
 * @apiSuccess {String} status status.
 */
module.exports = {
	index: function (req, res, next) {
		LoanassettypeRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		LoanassettypeRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		LoanassettypeRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		Loanassettype.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loanassettype/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Loanassettype.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loanassettype");
		});
	}
};
