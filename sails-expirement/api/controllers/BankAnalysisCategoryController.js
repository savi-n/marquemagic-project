/**
 * BankAnalysisCategory
 *
 * @description :: Server-side logic for managing BankAnalysisCategory
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /BankAnalysisCategory/ Bank Analysis
 * @apiName bank analysis
 * @apiGroup Bank
 * @apiExample Example usage:
 * curl -i localhost:1337/BankAnalysisCategory/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {Number} loan_document_id loan document id.
 * @apiSuccess {String} filename filename.
 * @apiSuccess {Number} status status.
 */
module.exports = {
	index: function (req, res, next) {
		BankAnalysisCategoryRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		BankAnalysisCategoryRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		BankAnalysisCategoryRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		BankAnalysisCategory.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("bankAnalysisCategory/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		BankAnalysisCategory.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/bankAnalysisCategory");
		});
	}
};
