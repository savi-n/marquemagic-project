/**
 * AnalysisFinance
 *
 * @description :: Server-side logic for managing AnalysisFinance
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * @api {get} /AnalysisFinance/ analysis finance
 * @apiName analysis finance
 * @apiGroup Analysis
 *  @apiExample Example usage:
 * curl -i localhost:1337/AnalysisFinance/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {String} type
 * @apiSuccess {String} document_name document name.
 * @apiSuccess {String} loan_id loan id.
 * @apiSuccess {String} business_id business id.
 * @apiSuccess {String} userid userid.
 * @apiSuccess {String} extracted_name
 * @apiSuccess {String} excel_name
 * @apiSuccess {String} created_time created time.
 */
module.exports = {
	index: function (req, res, next) {
		AnalysisFinanceRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AnalysisFinanceRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AnalysisFinanceRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AnalysisFinance.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("analysisFinance/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AnalysisFinance.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/analysisFinance");
		});
	}
};
