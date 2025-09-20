const {decryptReq, encryptRes} = require("../services/encrypt");
/**
 * WhiteLabelSolution
 *
 * @description :: Server-side logic for managing WhiteLabelSolution
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /WhiteLabelSolution/id WhiteLabel Solution
 * @apiName WhiteLabel Solution
 * @apiGroup WhiteLabel Solution
 * @apiExample Example usage:
 * curl -i localhost:1337/WhiteLabelSolution/id
 * @apiDescription
 * <b> Note :- the url should be like : "localhost:1337/WhiteLabelSolution/1"
 * @apiSuccess {String} status ok.
 * @apiSuccess {String} message White label details listed.
 * @apiSuccess {Object} permission
 * @apiSuccess {String} permission.name_tag
 * @apiSuccess {Number} permission.id
 * @apiSuccess {Object} permission.permission
 * @apiSuccess {Objcet} permission.white_label
 */
const reqParams = require("../helpers/req-params");
const redis = require("ioredis");
const redis_conn =new  redis.Cluster([{
	host: sails.config.redis.host,
	port: 6379
},{ host: sails.config.redis.host_sec,
	port: 6379},
{
	host: sails.config.redis.host_third,
	port: 6379
}
]);
// if (sails.config.redis.host == "127.0.0.1") {
// 	const redis_conn = new redis.Redis({
// 	host: sails.config.redis.host,
// 	port: 6379
// 	});
	
// 	} else {
// 	const redis_conn = new redis.Cluster([{
// 	host: sails.config.redis.host,
// 	port: 6379
// 	}, {
// 	host: sails.config.redis.host_sec,
// 	port: 6379
// 	}]);
// 	}

module.exports = {
	index: async function (req, res, next) {
		const id = req.param("id");
		if (id) {
			const user_type = req.user["usertype"],
				user_sub_type = req.user["user_sub_type"];
			let whiteLabel_permission = null;
			const whiteLabelSolution = await WhiteLabelSolutionRd.findOne({id: id});
			if (whiteLabelSolution && whiteLabelSolution.available_user_type) {
				const available_user_type_json = JSON.parse(whiteLabelSolution.available_user_type),
					user_value = available_user_type_json[user_type];
				if (user_value !== "" && user_value !== undefined) {
					if (user_value.sub_type === 1 && user_sub_type !== "NULL") {
						const user_sub_value = available_user_type_json.sub_type_data[user_type][user_sub_type];
						whiteLabel_permission = await WhiteLabelPermissionRd.findOne({
							id: user_sub_value.permission
						}).populate("white_label");
					} else {
						whiteLabel_permission = await WhiteLabelPermissionRd.findOne({
							id: user_value.permission
						}).populate("white_label");
					}
					const encryptedWL = await sails.helpers.whitelabelEncryption(whiteLabelSolution.id),
						logService = await sails.helpers.logtrackservice(
							req,
							"WhiteLabelSolution?id",
							req.user.id,
							"white_label_permission"
						);
					// added below if block
					if (whiteLabel_permission.white_label.color_theme_react) {
						whiteLabel_permission.white_label.color_theme_react = JSON.parse(
							whiteLabel_permission.white_label.color_theme_react
						);
					}
					return res.json({
						status: "ok",
						message: "White label details listed",
						permission: encryptRes(whiteLabel_permission),
						encrypt_data: encryptedWL.encryptedData
					});
				} else {
					return res.badRequest({
						status: "nok",
						message: "Permission for this user is not defined, contact admin",
						permission: whiteLabel_permission
					});
				}
			} else {
				return res.badRequest({
					status: "nok",
					message: "Whitelabel is not setup correctly, contact admin",
					permission: whiteLabel_permission
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: "Required parameters are missing",
				whiteLabelSolution: null,
				permission: null
			});
		}
	},

	/**
	 * @api {get} /wot/whitelabelsolution WhiteLabel Details Without Token
	 * @apiName WhiteLabel
	 * @apiGroup WhiteLabel Solution
	 * @apiExample Example usage:
	 * curl -i localhost:1337/wot/whitelabelsolution
	 * @apiParam {String} name
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {Object} permission
	 */
	index_without_token: async function (req, res, next) {
		const url = req.param("name");

		params = req.allParams();
		fields = ["url"];
		missing = await reqParams.fn(params, fields);

		if (!url) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const whiteLabel_permission = await WhiteLabelSolutionRd.findOne({
			where: {
				site_url: url
			},
			select: ["logo", "solution_type", "color_theme_react", "country", "geo_tagging", "mandatory_field", "ref_bank_id", "document_mapping"]
		});

		if (!whiteLabel_permission || !whiteLabel_permission.id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		if (whiteLabel_permission.color_theme_react) {
			whiteLabel_permission.color_theme_react = JSON.parse(whiteLabel_permission.color_theme_react);
		}
		if (whiteLabel_permission.geo_tagging) {
			whiteLabel_permission.geo_tagging = JSON.parse(whiteLabel_permission.geo_tagging);
		}
		return res.json({
			status: "ok",
			message: "White label details listed",
			permission: whiteLabel_permission
		});
	},

	show: function (req, res, next) {
		WhiteLabelSolutionRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	edit: function (req, res, next) {
		WhiteLabelSolutionRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	update: function (req, res, next) {
		WhiteLabelSolution.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("whiteLabelSolution/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		WhiteLabelSolution.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/whiteLabelSolution");
		});
	},

	/**
	 * @api {get} /whiteLabelPermission/ WhiteLabel Permission
	 * @apiName WhiteLabel Permission
	 * @apiGroup WhiteLabel Solution
	 * @apiExample Example usage:
	 * curl -i localhost:1337/whiteLabelPermission/
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {Object} data
	 * @apiSuccess {String} data.name_tag name tag.
	 * @apiSuccess {Number} data.id permission id.
	 * @apiSuccess {Object} data.permission permission
	 * @apiSuccess {Number} data.white_label_id white label id.
	 */

	whiteLabelPermission: async function (req, res, next) {
		const user = await UsersRd.findOne({id: req.user["id"]}),
			user_type = user.usertype,
			whitelabelid = req.user.loggedInWhiteLabelID,
			user_sub_type = user.user_sub_type;
		let whiteLabel_permission;
		const whiteLabelSolution = await WhiteLabelSolutionRd.findOne({id: whitelabelid});
		if (whiteLabelSolution.available_user_type !== null && whiteLabelSolution.available_user_type !== "") {
			const availabel_user_type_json = JSON.parse(whiteLabelSolution.available_user_type),
				user_value = availabel_user_type_json[user_type];
			if (user_value !== "" && user_value !== undefined) {
				if (user_value.sub_type === 1 && user_sub_type !== "NULL") {
					const user_sub_value = availabel_user_type_json.sub_type_data[user_type][user_sub_type];
					whiteLabel_permission = await WhiteLabelPermissionRd.findOne({id: user_sub_value.permission});
				} else {
					whiteLabel_permission = await WhiteLabelPermissionRd.findOne({id: user_value.permission});
				}
				const logService = await sails.helpers.logtrackservice(
					req,
					"whiteLabelPermission",
					req.user.id,
					"white_label_permission"
				);
				return res.json({status: "ok", data: whiteLabel_permission});
			} else {
				return res.badRequest({status: "nok", message: "User type is not available in this whitelabel"});
			}
		} else {
			return res.badRequest({status: "nok", message: "Available user type field is null or empty"});
		}
	},

	/**
	  * @api {get} /case-whitelabelEncrypt/ whitelabel Encryption
	  * @apiName whitelabel Encryption
	  * @apiGroup Case
	  * @apiExample Example usage:
	  * curl -i localhost:1337/case-whitelabelEncrypt
	  * @apiSuccess {String} status 'ok'.
	  * @apiSuccess {String} message encrypted whitelabel list.
	  * @apiSuccess {String[]} encrypted_whitelabel whitelabel list.

	  *
  **/
	whitelabel_encryption: async function (req, res, next) {
		const encrypt_data = [],
			whiteLabel = req.user.loggedInWhiteLabelID;
		encrypt_whitelabel_id = await sails.helpers.whitelabelEncryption(whiteLabel);
		encrypt_data.push(encrypt_whitelabel_id.encryptedData);
		res.send({
			status: "ok",
			message: "encrypted whitelabel list",
			DES_CODE: "NC08",
			encrypted_whitelabel: encrypt_data
		});
	},
	ncstatusmanage : async function (req,res){
		const search_key=req.user.loggedInWhiteLabelID;
		console.log(search_key);
		let view_loan_key=req.user.loggedInWhiteLabelID.toString();
		const expirationInSeconds=sails.config.redis.specific_key_day;

		const result_status_key = null; // await redis_conn.exists(search_key);
	let nc_status_data;
		if(result_status_key){
			nc_status_data=await redis_conn.get(search_key);
			nc_status_data=await JSON.parse(nc_status_data).data;
		}else{
			 nc_status_data = await NcStatusManageRd.find({
				white_label_id : req.user.loggedInWhiteLabelID
			});
			//b=await redis_conn.set(search_key, JSON.stringify({"data":nc_status_data}));
			//c=await redis_conn.expire(view_loan_key, expirationInSeconds);
		}
		return res.ok(nc_status_data);
	}
};
