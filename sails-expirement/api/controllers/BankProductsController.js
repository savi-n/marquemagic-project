/**
 * BankProducts
 *
 * @description :: Server-side logic for managing BankProducts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /BankProducts/ Bank Products
 * @apiName bank products
 * @apiGroup Bank
 * @apiExample Example usage:
 * curl -i localhost:1337/BankProducts/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {String} product_name product name.
 * @apiSuccess {String} product_pre_save_amount_needed yes/no.
 * @apiSuccess {String} product_pre_save_amount_percentage
 * @apiSuccess {String} push_plan
 * @apiSuccess {String} label_value label value.
 * @apiSuccess {String} label_amount label amount.
 * @apiSuccess {String} label_date label date.
 * @apiSuccess {String} product_status
 * @apiSuccess {String} created_date created date.
 * @apiSuccess {String} modifided_date modifided date.
 * @apiSuccess {String} product_img_src product image src url.
 * @apiSuccess {String} product_cat_img_android
 * @apiSuccess {String} product_desc product_description.
 */
module.exports = {
	index: function (req, res, next) {
		BankProductsRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		BankProductsRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		BankProductsRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		BankProducts.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("bankProducts/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		BankProducts.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/bankProducts");
		});
	}
};
