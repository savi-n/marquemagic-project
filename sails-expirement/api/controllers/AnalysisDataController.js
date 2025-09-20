/**
 * AnalysisData
 *
 * @description :: Server-side logic for managing AnalysisData
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 *  @api {get} /AnalysisData/  data analysis
 * @apiName analysis data
 * @apiGroup Analysis
 *  @apiExample Example usage:
 * curl -i localhost:1337/AnalysisData/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {Number} doc_id document id.
 * @apiSuccess {Number} userid user id.
 * @apiSuccess {String} doc_name document name.
 * @apiSuccess {Number} loan_id loan id.
 * @apiSuccess {String} created_time_request request created time.
 * @apiSuccess {Number} type_read
 *  @apiSuccess {String} type
 *  @apiSuccess {String} first_conversion
 *  @apiSuccess {String} compained_file
 *  @apiSuccess {String} output_file  output file.
 *  @apiSuccess {String} created_date created date.
 *  @apiSuccess {String} total_errors total errors.
 *  @apiSuccess {String} toal_rows
 *  @apiSuccess {String} date_error date error.
 *  @apiSuccess {String} total_dates total dates.
 *  @apiSuccess {String} notification notification.
 *  @apiSuccess {String} bank_summary bank summary.
 *  @apiSuccess {String} account_credit account credit.
 *  @apiSuccess {String} account_debit account debit.
 *  @apiSuccess {String} analysis_credit analysis credit.
 *  @apiSuccess {String} analysis_debit analysis debit.
 *  @apiSuccess {String} excel_file
 *  @apiSuccess {String} status_type_id status type id.
 *  @apiSuccess {String} daily_balance daily balance.
 *  @apiSuccess {String} analysis_abstract_credit
 *  @apiSuccess {String} analysis_abstract_debit
 *  @apiSuccess {String} more_analysis_file
 *  @apiSuccess {String} bank_snapshot_file
 *  @apiSuccess {String} updated_timestap update time.
 *  @apiSuccess {String} noPage
 *  @apiSuccess {String} reference_tab
 *  @apiSuccess {String} extract_type
 *
 *
 */
module.exports = {
	index: function (req, res, next) {
		AnalysisDataRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AnalysisDataRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AnalysisDataRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AnalysisData.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("analysisData/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AnalysisData.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/analysisData");
		});
	}
};
