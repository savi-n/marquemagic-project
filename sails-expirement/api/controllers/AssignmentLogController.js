/**
 * AssignmentLog
 *
 * @description :: Server-side logic for managing AssignmentLog
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /AssignmentLog/ assignment log
 * @apiName assignment log
 * @apiGroup Assignment
 *  @apiExample Example usage:
 * curl -i localhost:1337/AssignmentLog/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {String} action_event action event.
 * @apiSuccess {Number} action_ref_id action reference id.
 * @apiSuccess {String} notification notification.
 * @apiSuccess {Number} event_ref_id event reference id.
 * @apiSuccess {Number} created_by
 * @apiSuccess {String} ints
 * @apiSuccess {String} upts
 *
 */
module.exports = {
	index: function (req, res, next) {
		AssignmentLogRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AssignmentLogRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AssignmentLogRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AssignmentLog.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("assignmentLog/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AssignmentLog.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/assignmentLog");
		});
	}
};
