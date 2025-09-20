/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const jwt_token = require("jsonwebtoken");
const {SignJWT, jwtVerify} = require("jose");
md5 = require("md5");
private_key = jwToken.privateKey();
public_key = jwToken.publicKey();
const moment = require('moment-timezone');
module.exports = {
	attributes: {
		email: {
			type: "string"
		},
		password: {
			type: "string"
		},
		device_id: {
			type: "string",
			required: true
		}
		// lastName: { type: 'string' },
		// verified: { type: 'boolean' },
	},
	/**
	 * @api {post} /login/ Login
	 * @apiName GetJWTToken
	 * @apiGroup Authentication
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/login/
	 * @apiParam {String} email Users Email.
	 * @apiParam {String} password Users Password.
	 *
	 * @apiSuccess {String} status Status of the api response.
	 * @apiSuccess {String} message Logged in message.
	 * @apiSuccess {Object} user information of the login user.
	 * @apiSuccess {Number} user.id user ID.
	 * @apiSuccess {String} user.name name of the user.
	 * @apiSuccess {String} user.email user email address.
	 * @apiSuccess {String} user.contact contact number of the user.
	 * @apiSuccess {String} user.cacompname company name.
	 * @apiSuccess {String} user.capancard user PAN CARD number.
	 * @apiSuccess {String} user.address1 user address 1.
	 * @apiSuccess {String} user.address2 user address 2 (by default it is null).
	 * @apiSuccess {String} user.pincode user pincode.
	 * @apiSuccess {String} user.locality area/location of the user.
	 * @apiSuccess {String} user.city city of the user.
	 * @apiSuccess {String} user.state state of the user.
	 * @apiSuccess {String} user.usertype
	 * @apiSuccess {Number} user.lender_id user lender ID.
	 * @apiSuccess {Number} user.parent_id user parent ID.
	 * @apiSuccess {Number} user.user_group_id user group ID.
	 * @apiSuccess {Number} user.assigned_sales_user sales user ID.
	 * @apiSuccess {Number} user.originator
	 * @apiSuccess {Number} user.is_lender_admin
	 * @apiSuccess {String} user.status status of the user.
	 * @apiSuccess {String} user.osv_name
	 * @apiSuccess {String} user.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
	 * @apiSuccess {String} user.createdon user created date and time.
	 * @apiSuccess {String} user.update_time user updated date and time.
	 * @apiSuccess {Number} user.is_lender_manager
	 * @apiSuccess {String} user.origin shows who created the user.
	 * @apiSuccess {String} user.white_label_id white label id of the user.
	 * @apiSuccess {String} user.deactivate_reassign
	 * @apiSuccess {Number} user.notification_purpose
	 * @apiSuccess {String} user.user_sub_type sub type of the user (by default it is null)
	 * @apiSuccess {String} user.notification_flag
	 * @apiSuccess {Number} user.createdbyUser ID of the created user.
	 * @apiSuccess {String} user.source user company name.
	 * @apiSuccess {String} user.channel_type
	 * @apiSuccess {String} user.otp user otp number
	 * @apiSuccess {String} user.work_type
	 * @apiSuccess {String} user.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
	 * @apiSuccess {String} user.pic user profile picture.
	 * @apiSuccess {String} token token of the user.
	 */
	login: async function (req, res, next) {
		const email = req.param("email");
		const md5 = require("md5");
		let UserDetails;
		const device_tkn = req.param("device_token"),
			app_type = req.param("app_type"),
			password = req.param("password"),
			encrypt = req.param("encrypt"),
			portal = req.param("portal");
		let white_label_id = req.param("white_label_id");
		if (!white_label_id && portal) {
			whitelabelSolutionData = await WhiteLabelSolutionRd.find({site_url: portal}).select("id").limit(1);
			white_label_id = whitelabelSolutionData[0].id;
		}
		let token = null;
		const listIp = sails.config.list_ip,
			reqIp = req.ip;
		let ip_address;
		if (reqIp.substr(0, 7) == "::ffff:") {
			ip_address = reqIp.substr(7);
		}
		const reqHostname = req.hostname,
			contact = req.param("contact"),
			whereCondition = {
				email: email,
				status: "active"
			};
		if (contact) {
			whereCondition.contact = contact;
		}
		UserDetails = await UsersRd.findOne(whereCondition);
		if (UserDetails && UserDetails.is_corporate == 1) {
			const userCorpData = await UserCorporateMappingRd.findOne({userid: UserDetails.id});
			if (userCorpData) {
				const corporateCretData = await CorporateCriteriaRd.findOne({userid: userCorpData.created_by});
				if (corporateCretData) {
					UserDetails.corporateCriteriaData = corporateCretData;
				}
				UserDetails.corporateData = userCorpData;
			}
		}
		if (password && UserDetails) {
			let md5password;
			if (encrypt == 1) {
				md5password = password;
			} else {
				if (UserDetails.password.length == 32) {
					md5password = md5(password);
					if (UserDetails.password !== md5password) {
						sails.config.res.invalidPassword.status = 401;
						return res.ok(sails.config.res.invalidPassword);
					}
				} else {
					md5password = await sails.helpers.hashEncryptionDecryption(
						"is_valid_password_with_salt",
						password,
						"",
						UserDetails.password
					);
					if (md5password !== true) {
						sails.config.res.invalidPassword.status = 401;
						return res.ok(sails.config.res.invalidCredentials);
					}
				}
			}
		} else if (
			listIp &&
			listIp != "undefined" &&
			(listIp.includes(ip_address) === "true" ||
				listIp.includes(ip_address) === true ||
				listIp.includes(reqHostname) === "true" ||
				listIp.includes(reqHostname) === true)
		) {
			UserDetails = await UsersRd.findOne(whereCondition);
		}

		if (UserDetails && typeof UserDetails !== "undefined") {
			const whiteLabelId = UserDetails.white_label_id.split(",");
			UserDetails.loggedInWhiteLabelID = white_label_id ? white_label_id : whiteLabelId[0];
			whiteLabelHelper = await sails.helpers.whiteLabel(email, UserDetails.loggedInWhiteLabelID);
			whiteLabelSolution = await WhiteLabelSolutionRd.findOne({
				select: ["solution_type", "country", "product_line"],
				where: {
					id: UserDetails.loggedInWhiteLabelID
				}
			});

			logService = await sails.helpers.logtrackservice(req, "login", UserDetails.id, "users");
			if (app_type === "1") {
				const new_date = Date.now(),
					converted_date = Math.floor(new_date / 1000);
				token = md5(converted_date + "_" + UserDetails.id);
				const check_dt = await TbldeviceInfoRd.find({
					device_token: device_tkn
				});
				if (check_dt && typeof check_dt.length > 0) {
					const updatedUser = await TbldeviceInfo.update({
						device_token: device_tkn
					}).set({
						login_token: token
					});
				} else {
					const check = await TbldeviceInfo.create({
						userid: UserDetails.id,
						device_token: device_tkn,
						login_token: token,
						app_type: app_type
					});
				}
			}

			const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000,
				uniqTimeStamp = Math.round(new Date().getTime()),
				uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
			await Users.updateOne({
				email: email
			}).set({
				login_status: uniqueRandomId
			});
			UserDetails.login_status = uniqueRandomId;
			UserDetails.pic = "";
			const jwtToken = await new SignJWT({subject: "uuid", user: UserDetails})
				.setProtectedHeader({alg: "EdDSA"})
				.setExpirationTime("1d")
				.sign(private_key);
			res.send({
				status: "ok",
				message: "User logged in",
				user: UserDetails,
				whiteLabel: whiteLabelSolution,
				auth_token: token,
				token: jwtToken
			});
		} else {
			res.send(sails.config.res.invalidCredentials);
		}
	},

	/**
	 * @api {get} /logout Logout
	 * @apiName logout
	 * @apiGroup Authentication
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/logout
	 * @apiHeader {String} authorization
	 */
	logout: async function (req, res) {
		const email = req.user.email;
		await Users.updateOne({
			email: email
		}).set({
			login_status: "logged_out"
		});

		return res.send(sails.config.successRes.logoutSuccess);
	},

	/**
	 * @api {get} /check/ Check
	 * @apiName check
	 * @apiGroup Authentication
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/check/
	 *
	 *
	 * @apiSuccess {Number} id user ID.
	 * @apiSuccess {String} name name of the user.
	 * @apiSuccess {String} email user email address.
	 * @apiSuccess {String} contact contact number of the user.
	 * @apiSuccess {String} cacompname company name.
	 * @apiSuccess {String} capancard user PAN CARD number.
	 * @apiSuccess {String} address1 user address 1.
	 * @apiSuccess {String} address2 user address 2 (by default it is null).
	 * @apiSuccess {String} pincode user pincode.
	 * @apiSuccess {String} locality area/location of the user.
	 * @apiSuccess {String} city city of the user.
	 * @apiSuccess {String} state state of the user.
	 * @apiSuccess {String} usertype
	 * @apiSuccess {Number} lender_id user lender ID.
	 * @apiSuccess {Number} parent_id user parent ID.
	 * @apiSuccess {Number} user_group_id user group ID.
	 * @apiSuccess {Number} assigned_sales_user sales user ID.
	 * @apiSuccess {Number} originator
	 * @apiSuccess {Number} is_lender_admin
	 * @apiSuccess {String} status status of the user.
	 * @apiSuccess {String} osv_name
	 * @apiSuccess {String} firstlogin user login (if it is first login it's represent by 0 otherwise 1).
	 * @apiSuccess {String} createdon user created date and time.
	 * @apiSuccess {String} update_time user updated date and time.
	 * @apiSuccess {Number} is_lender_manager
	 * @apiSuccess {String} origin shows who created the user.
	 * @apiSuccess {String} white_label_id white label id of the user.
	 * @apiSuccess {String} deactivate_reassign
	 * @apiSuccess {Number} notification_purpose
	 * @apiSuccess {String} user_sub_type sub type of the user (by default it is null)
	 * @apiSuccess {String} notification_flag
	 * @apiSuccess {Number} createdbyUser ID of the created user.
	 * @apiSuccess {String} source user company name.
	 * @apiSuccess {String} channel_type
	 * @apiSuccess {String} otp user otp number
	 * @apiSuccess {String} work_type
	 * @apiSuccess {String} profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
	 * @apiSuccess {String} pic user profile picture.
	 */
	//release
	check: async function (req, res) {
		if (req.headers && req.headers.authorization) {
			const parts = req.headers.authorization.split(" ");
			let token = "",
				decoded = "";
			const logService = await sails.helpers.logtrackservice(req, "check", req.user.id, "users");
			if (parts.length == 2) {
				const scheme = parts[0],
					credentials = parts[1];

				if (/^Bearer$/i.test(scheme)) {
					token = credentials;
				}
			}
			try {
				decoded = await jwtVerify(token, public_key);
				decoded = decoded.payload;
				req.user = decoded.user;
				const whiteLabelId = decoded.user.loggedInWhiteLabelID || decoded.user["white_label_id"].split(",")[0],
					whiteLabelSolution = await WhiteLabelSolutionRd.findOne({
						select: ["solution_type", "country"],
						where: {
							id: whiteLabelId
						}
					});
				decoded.user["whiteLabel"] = whiteLabelSolution;
				return res.send(decoded.user);
			} catch (e) {
				return res.status(401).send("unauthorized");
			}
		}
		return res.json(req.session.user);
	},

	/**
	 * @api {post} /email_list/ Email list for hand-book
	 * @apiName email list
	 * @apiGroup hand-book
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/email_check/
	 * @apiParam {String} mobile Users mobile number.
	 *
	 * @apiSuccess {String} status Status of the api response.
	 * @apiSuccess {String} message Email exist message.
	 * @apiSuccess {Object[]} emails .
	 * @apiSuccess {Number} emails.id userid.
	 * @apiSuccess {String} emails.email user email.
	 * @apiSuccess {String} emails.usertype usertype.
	 */

	email_list: async function (req, res, next) {
		let userid;
		const mobileNo = req.param("mobile"),
			UserDetails = await UsersRd.find({
				where: {
					contact: mobileNo
				},
				select: ["email", "usertype"]
			}),
			listIp = sails.config.list_ip,
			reqIp = req.ip;
		let ip_address;
		if (reqIp.substr(0, 7) == "::ffff:") {
			ip_address = reqIp.substr(7);
		}
		const reqHostname = req.hostname;
		if (
			listIp.includes(ip_address) === "true" ||
			listIp.includes(ip_address) === true ||
			listIp.includes(reqHostname) === "true" ||
			listIp.includes(reqHostname) === true
		) {
			if (UserDetails.length > 0) {
				res.send({
					status: "ok",
					message: sails.config.msgConstants.emailExists,
					emails: UserDetails
				});
			} else {
				res.send(200, {
					status: "nok",
					message: sails.config.msgConstants.noSuchEmail,
					emails: []
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.invalidRequest
			});
		}
	},
	/**
	 * @api {post} /user_creation/ User creation if not exist for hand-book
	 * @apiName user creation
	 * @apiGroup hand-book
	 * @apiExample Example usage:
	 * curl -i localhost:1337/user_creation/
	 * @apiParam {String} email Users email
	 * @apiParam {String} mobile Users mobile number
	 * @apiParam {String} usertype usertype
	 * @apiParam {String} city Users city
	 * @apiParam {String} state Users state
	 * @apiParam {Number} pincode Users pincode
	 * @apiParam {String} locality Users locality
	 * @apiParam {String} request request(ncbiz_web)
	 * @apiParam {String} user_origin users origin
	 * @apiParam {String} user_source users source
	 *
	 * @apiSuccess {String} status Status of the api response
	 * @apiSuccess {String} message Email exist message
	 */
	user_creation: async function (req, res, next) {
		const email = req.param("email"),
			name = email.split("@")[0],
			mobile = req.param("mobile"),
			usertype = req.param("usertype"),
			city = req.param("city"),
			state = req.param("state"),
			pincode = req.param("pincode"),
			locality = req.param("locality");
		const md5 = require("md5");
		const request = req.param("request"),
			md5password = md5(mobile),
			listIp = sails.config.list_ip,
			reqIp = req.ip,
			user_origin = req.param("user_origin"),
			user_source = req.param("user_source"),
			datetime = await sails.helpers.dateTime();
		let ip_address;
		if (reqIp.substr(0, 7) == "::ffff:") {
			ip_address = reqIp.substr(7);
		}
		const reqHostname = req.hostname,
			UserDetails = await UsersRd.find({
				or: [{email: email}, {contact: mobile}]
			}),
			new_ui_url = sails.config.new_ui,
			output = {
				status: "ok",
				message: "User logged in"
			};
		if (
			listIp.includes(ip_address) === "true" ||
			listIp.includes(ip_address) === true ||
			listIp.includes(reqHostname) === "true" ||
			listIp.includes(reqHostname) === true
		) {
			if (UserDetails.length != 0) {
				let userss;
				for (const i in UserDetails) {
					if (UserDetails[i].email == email) {
						userss = UserDetails[i];
					}
				}

				return res.send({
					status: "nok",
					message: sails.config.msgConstants.userExists,
					UserDetails: userss
				});
			} else {
				const UserInsert = await Users.create({
					email: email,
					name: name,
					contact: mobile,
					origin: user_origin ? user_origin : "NC_BIZ",
					source: user_source ? user_source : "NC_BIZ",
					createdbyUser: "1",
					status: "active",
					usertype: usertype,
					city: city,
					state: state,
					pincode: pincode,
					locality: locality,
					password: md5password,
					createdon: datetime,
					notification_flag: "yes",
					notification_purpose: 5,
					user_reference_pwd: mobile
				}).fetch(),
					updatedUser = await Users.updateOne({
						email: email
					}).set({
						createdbyUser: UserInsert.id
					});
				if (request === "ncbiz_web") {
					const url = sails.config.user_create_biz.URL,
						jsondata =
							'{"email_id":"' +
							email +
							'","mobile":"' +
							mobile +
							'","namaste_id":"' +
							UserInsert.id +
							'"}',
						body = jsondata,
						method = "POST",
						headers = {
							"Content-Type": "application/json"
						},
						triggerApiResult = await sails.helpers.sailstrigger(url, body, headers, method),
						jsonParsedData = JSON.parse(triggerApiResult);
				}

				res.send({
					status: "ok",
					message: sails.config.msgConstants.userCreated,
					data: UserInsert
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.res.invalidRequest
			});
		}
	},

	/**
	 * @api {post} /loginwithwhitelabel/ Login with whitelabel
	 * @apiName login with whitelabel
	 * @apiGroup Case
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/loginwithwhitelabel/
	 * @apiParam {String} email Users Email.
	 * @apiParam {String} password Users Password.
	 * @apiParam {String} white_label_id white label id (encrypted white label id).
	 *
	 * @apiSuccess {String} status Status of the api response.
	 * @apiSuccess {String} message Logged in message.
	 * @apiSuccess {Object} user information of the login user.
	 * @apiSuccess {Number} user.id user ID.
	 * @apiSuccess {String} user.name name of the user.
	 * @apiSuccess {String} user.email user email address.
	 * @apiSuccess {String} user.contact contact number of the user.
	 * @apiSuccess {String} user.cacompname company name.
	 * @apiSuccess {String} user.capancard user PAN CARD number.
	 * @apiSuccess {String} user.address1 user address 1.
	 * @apiSuccess {String} user.address2 user address 2 (by default it is null).
	 * @apiSuccess {String} user.pincode user pincode.
	 * @apiSuccess {String} user.locality area/location of the user.
	 * @apiSuccess {String} user.city city of the user.
	 * @apiSuccess {String} user.state state of the user.
	 * @apiSuccess {String} user.usertype
	 * @apiSuccess {Number} user.lender_id user lender ID.
	 * @apiSuccess {Number} user.parent_id user parent ID.
	 * @apiSuccess {Number} user.user_group_id user group ID.
	 * @apiSuccess {Number} user.assigned_sales_user sales user ID.
	 * @apiSuccess {Number} user.originator
	 * @apiSuccess {Number} user.is_lender_admin
	 * @apiSuccess {String} user.status status of the user.
	 * @apiSuccess {String} user.osv_name
	 * @apiSuccess {String} user.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
	 * @apiSuccess {String} user.createdon user created date and time.
	 * @apiSuccess {String} user.update_time user updated date and time.
	 * @apiSuccess {Number} user.is_lender_manager
	 * @apiSuccess {String} user.origin shows who created the user.
	 * @apiSuccess {String} user.white_label_id white label id of the user.
	 * @apiSuccess {String} user.deactivate_reassign
	 * @apiSuccess {Number} user.notification_purpose
	 * @apiSuccess {String} user.user_sub_type sub type of the user (by default it is null)
	 * @apiSuccess {String} user.notification_flag
	 * @apiSuccess {Number} user.createdbyUser ID of the created user.
	 * @apiSuccess {String} user.source user company name.
	 * @apiSuccess {String} user.channel_type
	 * @apiSuccess {String} user.otp user otp number
	 * @apiSuccess {String} user.work_type
	 * @apiSuccess {String} user.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
	 * @apiSuccess {String} user.pic user profile picture.
	 * @apiSuccess {String} token token of the user.
	 * @apiSuccess {String[]} encrypted_whitelabel encrypted whitelabel id.
	 */
	white_label_login: async function (req, res) {
		let {email, password, white_label_id} = req.body.allParams;
		if (!email || !password || !white_label_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		if ((email.length == 64 || email.length >= 64) && (password.length == 32 || password.length >= 32)) {
			const decryptEmail = await sails.helpers.whitelabelDecryption(email);
			decryptPassword = await sails.helpers.whitelabelDecryption(password);
			if (decryptEmail == "error" || decryptPassword == "error") {
				return res.badRequest({status: "nok", message: sails.config.msgConstants.invalidEncryptedCreds});
			} else {
				email = decryptEmail;
				password = decryptPassword;
			}
		} else {
			email;
			password;
		}

		const decryptWhiteLabelId = await sails.helpers.whitelabelDecryption(white_label_id);

		if (!decryptWhiteLabelId || decryptWhiteLabelId == "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}
		UsersRd.find({
			email,
			white_label_id: decryptWhiteLabelId,
			status: "active"
		})
			.limit(1)
			.then(async (userDetails) => {
				if (userDetails.length === 0) {
					throw new Error("notAuth");
				}
				if (userDetails[0].password.length == 32) {
					password = md5(password);
					if (userDetails[0].password !== password) {
						return res.badRequest(sails.config.res.invalidPassword);
					}
				} else {
					password = await sails.helpers.hashEncryptionDecryption(
						"is_valid_password_with_salt",
						password,
						"",
						userDetails[0].password
					);
					if (password !== true) {
						return res.badRequest(sails.config.res.invalidPassword);
					}
				}
				const encrypt_data = [],
					userWhiteLabelIds = userDetails[0].white_label_id.split(",");

				for (const id of userWhiteLabelIds) {
					encrypt_data.push((await sails.helpers.whitelabelEncryption(id)).encryptedData);
				}

				if (userWhiteLabelIds.indexOf(decryptWhiteLabelId) === -1) {
					return res.badRequest(sails.config.res.whiteLabelMismatch);
				}

				await sails.helpers.logtrackservice(req, "login", userDetails[0].id, "users");
				const randomTwoUnique = Math.floor(Math.random() * (+9999 - +1000)) + +1000,
					uniqTimeStamp = Math.round(new Date().getTime()),
					uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);
				await Users.updateOne({
					email: email
				}).set({
					login_status: uniqueRandomId
				});
				userDetails[0].pic = "";
				userDetails[0].loggedInWhiteLabelID = decryptWhiteLabelId;
				const jwtToken = await new SignJWT({subject: "uuid", user: userDetails[0]})
					.setProtectedHeader({alg: "EdDSA"})
					.setExpirationTime("1d")
					.sign(private_key);
				sails.config.successRes.loginSuccess.encrypted_whitelabel = encrypt_data;
				sails.config.successRes.loginSuccess.token = jwtToken;

				if (decryptWhiteLabelId == sails.config.fedfina_whitelabel_id) {
					const encryptData = await sails.helpers.crypto.with({
						action: "aesCbc256Encrypt",
						data: sails.config.successRes.loginSuccess
					});
					res.ok({ecryptesResponse: encryptData});
				}
				res.ok(sails.config.successRes.loginSuccess);
			})
			.catch((err) => {
				switch (err.message) {
					case "notAuth":
						return res.status(401).send(sails.config.res.notAuth);
					default:
						throw err;
				}
			});
	},

	/**
	 * @api {post} /sendOtp/ Send Otp
	 * @apiName Send Otp
	 * @apiGroup hand-book
	 * @apiExample Example usage:
	 * curl -i localhost:1337/sendOtp/
	 * @apiParam {String} os User os
	 * @apiParam {Number} mobile User mobile number
	 * @apiParam {String} device_id User device_id
	 *
	 * @apiSuccess {String} status Status of the api response
	 * @apiSuccess {String} message
	 */

	SendOtp: async function (req, res) {
		const mobile = req.param("mobile"),
			os = req.param("os"),
			device_id = req.param("device_id"),
			listIp = sails.config.list_ip,
			reqIp = req.ip;
		let ip_address;
		if (reqIp.substr(0, 7) == "::ffff:") {
			ip_address = reqIp.substr(7);
		}
		const reqHostname = req.hostname;

		if (
			listIp.includes(ip_address) === "true" ||
			listIp.includes(ip_address) === true ||
			listIp.includes(reqHostname) === "true" ||
			listIp.includes(reqHostname) === true
		) {
			const url = sails.config.user_create_biz.sendOtp,
				jsondata = '{"mobile":"' + mobile + '","os":"' + os + '","device_id":"' + device_id + '"}',
				body = jsondata,
				method = "POST",
				headers = {
					"Content-Type": "application/json"
				},
				triggerApiResult = await sails.helpers.sailstrigger(url, body, headers, method),
				jsonParsedData = JSON.parse(triggerApiResult);
			return res.send(jsonParsedData);
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.res.invalidRequest
			});
		}
	},

	/**
	 * @api {post} /verifyOtp/ Verify Otp
	 * @apiName Verify Otp
	 * @apiGroup hand-book
	 * @apiExample Example usage:
	 * curl -i localhost:1337/verifyOtp/
	 * @apiParam {String} os User os
	 * @apiParam {Number} mobile User mobile number
	 * @apiParam {Number} otp User otp number
	 * @apiParam {String} device_id User device_id
	 * @apiParam {String} fcm_id
	 *
	 * @apiSuccess {String} status Status of the api response
	 * @apiSuccess {String} message
	 */

	verifyOTP: async function (req, res) {
		const mobile = req.param("mobile"),
			os = req.param("os"),
			device_id = req.param("device_id"),
			fcm_id = req.param("fcm_id"),
			otp = req.param("otp"),
			listIp = sails.config.list_ip,
			reqIp = req.ip;
		let ip_address;
		if (reqIp.substr(0, 7) == "::ffff:") {
			ip_address = reqIp.substr(7);
		}
		const reqHostname = req.hostname;

		if (
			listIp.includes(ip_address) === "true" ||
			listIp.includes(ip_address) === true ||
			listIp.includes(reqHostname) === "true" ||
			listIp.includes(reqHostname) === true
		) {
			const url = sails.config.user_create_biz.verifyOtp,
				jsondata =
					'{"mobile":"' +
					mobile +
					'","os":"' +
					os +
					'","device_id":"' +
					device_id +
					'","otp":"' +
					otp +
					'","fcm_id":"' +
					fcm_id +
					'"}',
				body = jsondata,
				method = "POST",
				headers = {
					"Content-Type": "application/json"
				},
				triggerApiResult = await sails.helpers.sailstrigger(url, body, headers, method),
				jsonParsedData = JSON.parse(triggerApiResult);
			return res.send(jsonParsedData);
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.res.invalidRequest
			});
		}
	}
};
