/**
 * BankIntegration
 *
 * @description :: Server-side logic for managing BankIntegration
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /BankIntegration/ Bank Integration
 * @apiName bank integration
 * @apiGroup Bank
 * @apiExample Example usage:
 * curl -i localhost:1337/BankIntegration/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {String} type
 * @apiSuccess {String} url url.
 * @apiSuccess {String} data_format data format.
 * @apiSuccess {String} data_format_mapping data format mapping.
 * @apiSuccess {String} table_for_prepare_data
 * @apiSuccess {String} table_for_prepare_data_join
 * @apiSuccess {String} output_validation output validation.
 * @apiSuccess {Number} exec_order
 * @apiSuccess {Number} lender_user_id lender user id.
 * @apiSuccess {Number} bank_id bank id.
 * @apiSuccess {Number} white_label_id white label id.
 * @apiSuccess {Number} loan_product_id loan product id.
 * @apiSuccess {Number} loan_status_id loan status id.
 * @apiSuccess {Number} loan_sub_status_id loan sub status id.
 * @apiSuccess {Number} loan_bank_staus loan bank status.
 * @apiSuccess {Number} loan_borrower_status loan borrower status.
 * @apiSuccess {String} sales_required_in_city yes/no
 * @apiSuccess {String} exclude_digital_cities cities name.
 * @apiSuccess {String} status
 * @apiSuccess {String} created_date created date.
 * @apiSuccess {String} updated_date updated date.
 */
module.exports = {
	index: function (req, res, next) {
		BankIntegrationRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		BankIntegrationRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		BankIntegrationRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		BankIntegration.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("bankIntegration/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		BankIntegration.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/bankIntegration");
		});
	}
};
