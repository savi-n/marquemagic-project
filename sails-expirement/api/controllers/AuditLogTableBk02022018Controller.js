/**
 * AuditLogTableBk02022018
 *
 * @description :: Server-side logic for managing AuditLogTableBk02022018
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	index: function (req, res, next) {
		AuditLogTableBk02022018Rd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AuditLogTableBk02022018Rd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AuditLogTableBk02022018Rd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AuditLogTableBk02022018.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("auditLogTableBk02022018/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AuditLogTableBk02022018.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/auditLogTableBk02022018");
		});
	}
};
