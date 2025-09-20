/**
 * Addresstype
 *
 * @description :: Server-side logic for managing Addresstype
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
    * @api {get} /Addresstype/ address type
    * @apiName address type
    * @apiGroup Address
    *  @apiExample Example usage:
    * curl -i localhost:1337/Addresstype/
    *
    * @apiSuccess {Number} id id.
    * @apiSuccess {String} addtType address type.
    * @apiSuccess {String} display
    * @apiSuccess {String} withcheckbox
    * @apiSuccess {String} createdon created date and time.

 */

module.exports = {
	index: function (req, res, next) {
		AddresstypeRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AddresstypeRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AddresstypeRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		Addresstype.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("addresstype/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Addresstype.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/addresstype");
		});
	}
};
