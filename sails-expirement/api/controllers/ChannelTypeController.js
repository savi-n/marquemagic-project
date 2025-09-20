/**
 * ChannelType
 *
 * @description :: Server-side logic for managing ChannelType
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /ChannelType/ channel type
 * @apiName channel type
 * @apiGroup Channel Type
 *  @apiExample Example usage:
 * curl -i localhost:1337/ChannelType/
 * @apiSuccess {Number} id channel type id.
 * @apiSuccess {String} channel_type channel type.
 */
module.exports = {
	index: function (req, res, next) {
		ChannelTypeRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		ChannelTypeRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		ChannelTypeRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		ChannelType.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("channelType/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		ChannelType.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/channelType");
		});
	}
};
