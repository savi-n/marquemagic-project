/**
 * AssetTypeMappingCersai
 *
 * @description :: Server-side logic for managing AssetTypeMappingCersai
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 *  @api {get} /AssetTypeMappingCersai/ asset type mapping
 * @apiName asset type
 * @apiGroup Asset Type
 *  @apiExample Example usage:
 * curl -i localhost:1337/AssetTypeMappingCersai/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {Number} assettype_id assettype id.
 * @apiSuccess {Number} value value.
 * @apiSuccess {String} text text.
 */
module.exports = {
	index: function (req, res, next) {
		AssetTypeMappingCersaiRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AssetTypeMappingCersaiRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AssetTypeMappingCersaiRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AssetTypeMappingCersai.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("assetTypeMappingCersai/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AssetTypeMappingCersai.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/assetTypeMappingCersai");
		});
	}
};
