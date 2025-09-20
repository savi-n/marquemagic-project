/**
 * AuditLogTable
 *
 * @description :: Server-side logic for managing AuditLogTable
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * @api {get} /AuditLogTable/ AuditLog Table
 * @apiName auditlog
 * @apiGroup Audit Log
 *  @apiExample Example usage:
 * curl -i localhost:1337/AuditLogTable/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {Number} route_id route id.
 * @apiSuccess {String} url url.
 * @apiSuccess {String} action action.
 * @apiSuccess {String} action_result_id action result id.
 * @apiSuccess {String} action_reference action reference.
 * @apiSuccess {String} ip_address ip address.
 * @apiSuccess {String} request_time request time.
 * @apiSuccess {String} user_id user id.
 */
module.exports = {
	index: function (req, res, next) {
		AuditLogTableRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AuditLogTableRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AuditLogTableRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AuditLogTable.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("auditLogTable/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AuditLogTable.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/auditLogTable");
		});
	}
};
