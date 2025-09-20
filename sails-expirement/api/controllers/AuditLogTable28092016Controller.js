/**
 * AuditLogTable28092016
 *
 * @description :: Server-side logic for managing AuditLogTable28092016
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	index: function (req, res, next) {
		AuditLogTable28092016Rd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AuditLogTable28092016Rd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AuditLogTable28092016Rd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AuditLogTable28092016.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("auditLogTable28092016/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AuditLogTable28092016.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/auditLogTable28092016");
		});
	}
};
