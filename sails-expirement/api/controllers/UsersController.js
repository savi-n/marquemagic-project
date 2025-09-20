const {type} = require("os");
const {SignJWT, jwtVerify} = require("jose");
md5 = require("md5");
private_key = jwToken.privateKey();
public_key = jwToken.publicKey();
const {passwordStrength} = require("check-password-strength");
const {constants} = require("zlib");
let {decryptReq, encryptRes} = require("../services/encrypt");

/**
 * Users
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	/**
	 * @api {get} /users/ user index
	 * @apiName user index
	 * @apiGroup User
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/users/
	 *
	 * @apiSuccess {String} status status(if it is success ok otherwise nok)
	 * @apiSuccess {Object[]} data list of user data.
	 *  @apiSuccess {String} data.loans
	 * @apiSuccess {Number} data.id user ID.
	 * @apiSuccess {String} data.name name of the user.
	 * @apiSuccess {String} data.email user email address.
	 * @apiSuccess {String} data.contact contact number of the user.
	 * @apiSuccess {String} data.cacompname company name.
	 * @apiSuccess {String} data.capancard user PAN CARD number.
	 * @apiSuccess {String} data.address1 user address 1.
	 * @apiSuccess {String} data.address2 user address 2 (by default it is null).
	 * @apiSuccess {String} data.pincode user pincode.
	 * @apiSuccess {String} data.locality area/location of the user.
	 * @apiSuccess {String} data.city city of the user.
	 * @apiSuccess {String} data.state state of the user.
	 * @apiSuccess {String} data.usertype
	 * @apiSuccess {Number} data.lender_id user lender ID.
	 * @apiSuccess {Number} data.parent_id user parent ID.
	 * @apiSuccess {Number} data.user_group_id user group ID.
	 * @apiSuccess {Number} data.assigned_sales_user sales user ID.
	 * @apiSuccess {Number} data.originator
	 * @apiSuccess {Number} data.is_lender_admin
	 * @apiSuccess {String} data.status status of the user.
	 * @apiSuccess {String} data.osv_name
	 * @apiSuccess {String} data.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
	 * @apiSuccess {String} data.createdon user created date and time.
	 * @apiSuccess {String} data.update_time user updated date and time.
	 * @apiSuccess {Number} data.is_lender_manager
	 * @apiSuccess {String} data.origin shows who created the user.
	 * @apiSuccess {String} data.white_label_id white label id of the user.
	 * @apiSuccess {String} data.deactivate_reassign
	 * @apiSuccess {Number} data.notification_purpose
	 * @apiSuccess {String} data.user_sub_type sub type of the user (by default it is null)
	 * @apiSuccess {String} data.notification_flag
	 * @apiSuccess {Number} data.createdbyUser ID of the created user.
	 * @apiSuccess {String} data.source user company name.
	 * @apiSuccess {String} data.channel_type
	 * @apiSuccess {String} data.otp user otp number
	 * @apiSuccess {String} data.work_type
	 * @apiSuccess {String} data.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
	 * @apiSuccess {String} data.pic user profile picture.
	 */
	index: async function (req, res) {
		user_id = req.param("id") ? decryptReq(req.param("id")) : req.user["id"];
		userid = user_id === 0 || user_id == null ? req.user["id"] : user_id;
		userData = await UsersRd.findOne({id: userid}).select("parent_id");
		if (userData.id !== req.user["id"] && userData.parent_id !== req.user["id"]) {
			return res.badRequest({
				status: "nok",
				message: "Not allowed to access this user data"
			});
		}
		UsersRd.find({status: "active", or: [{parent_id: userid}, {id: userid}]})
			.populate("loans", {sort: "RequestDate DESC"})
			.exec((err, list) => {
				if (err) {
					return Error("Error");
				}
				return res.send({status: "ok", data: list});
			});
	},
	/**
	 * @api {post} /loanDocumentUpload/ Upload Document
	 * @apiName Loan Document Upload
	 * @apiGroup User
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/loanDocumentUpload/
	 * @apiParam {file} document File attachment.
	 * @apiParam {Number} userid user id.(Bussiness user id.)
	 * @apiSuccess {Object[]} files
	 * @apiSuccess {String} files.fd description of the file(this "filename" is used as parameter to display the file in view document).
	 * @apiSuccess {Number} files.size size of the file.
	 * @apiSuccess {String} files.type type of the file.
	 * @apiSuccess {String} files.filename name of the file.
	 * @apiSuccess {String} files.status file status.
	 * @apiSuccess {String} files.field
	 * @apiSuccess {String} textParams text parameters.
	 * @apiDescription  <b>Note:To get the thumbnail of a pdf file: please call view document api : pass parameter of filename as "thumb_fdname.png"</b>
	 * eg:filename : thumb_857fc7f1-57d8-44c4-b5fc-7e7020e2756b.png
	 */
	uploadDocument: async function (req, res, next) {
		try {
			const document = req.file("document");
			if (document.fieldName == "NOOP_document") {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.selectDocument
				});
			}
			const user_whitelabel = req.user.loggedInWhiteLabelID,
				whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel});
			let bucket = whitelabelsolution[0]["s3_name"];
			const region = whitelabelsolution[0]["s3_region"];
			userid = req.param("userid") || req.param("userId") || req.user.id;
			if (!userid) {
				return res.badRequest({status: "nok", message: "User id is missing"});
			}

			// if (!sails.config.azure.isActive) {
			bucket = bucket + "/users_" + userid;
			// }

			const allowedType = [
				"image/png",
				"image/jpeg",
				"application/pdf",
				"text/plain",
				"application/zip",
				"application/x-zip-compressed",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.wordprocessingml",
				"image/tiff",
				"image/tif",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
			],
				allowedExtension = ["png", "jpeg", "blob", "docx", "pdf", "txt", "jpg", "zip", "xlsx", "xls", "PNG", "JPEG", "PDF", "JPG", "TXT", "ZIP", "XLSX", "XLS", "tiff", "TIFF", "TIF", "tif"],
				doctype = document._files[0].stream;
			extension = doctype.filename.split(".").pop();
			if (allowedType.indexOf(doctype.headers["content-type"]) === -1 || allowedExtension.indexOf(extension) === -1) {
				return res.badRequest({
					status: "nok",
					message: `FileType ${doctype.headers["content-type"]} is not allowed to upload`
				});
			}
			const uploadFile = await sails.helpers.s3Upload(document, bucket, region);
			if (!uploadFile || uploadFile.length == 0) {
				return res.send({
					status: "nok",
					message: "Unable to upload file due to network slowdown or network failure. Please try again."
				});
			}
			const logService = await sails.helpers.logtrackservice(
				req,
				"loanDocumentUpload",
				document._files[0].stream.filename,
				"loan_document"
			);
			return res.ok({status: "ok", message: "Successfully uploaded", files: uploadFile, filepath: {bucket, region}});
		} catch (err) {
			return res.badRequest({status: "nok", data: err});
		}
	},
	multiple_uploadDocuments: async function (req, res) {
		let user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel});
		let bucket = whitelabelsolution[0]["s3_name"];
		let region = whitelabelsolution[0]["s3_region"];
		userid = req.param("userid") || req.param("userId") || req.user.id;
		if (!userid) {
			return res.badRequest({status: "nok", message: "User id is missing"});
		}
		bucket = bucket + "/users_" + userid;

		try {
			let documents = req.file("documents");
			allowedType = [
				"image/png",
				"image/jpeg",
				"application/pdf",
				"text/plain",
				"application/zip",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/vnd.ms-excel",
				"image/tiff",
				"image/tif"
			];
			allowedExtension = ["png", "jpeg", "pdf", "txt", "jpg", "zip", "xlsx", "xls", "PNG", "JPEG", "PDF", "JPG", "TXT", "ZIP", "XLSX", "XLS", "tiff", "TIFF", "tif", "TIF"];
			for (document of documents._files) {
				doctype = document.stream;
				extension = doctype.filename.split(".").pop();
				if (
					allowedType.indexOf(doctype.headers["content-type"]) === -1 ||
					allowedExtension.indexOf(extension) === -1
				) {
					return res.badRequest({
						status: "nok",
						message: `FileType ${doctype.headers["content-type"]} is not allowed to upload`
					});
				}
				const logService = await sails.helpers.logtrackservice(
					req,
					"loanDocumentUpload",
					document.stream.filename,
					"loan_document"
				);
			}
			const uploadFile = await sails.helpers.s3Upload(documents, bucket, region);
			if (documents._files.length !== uploadFile.length) {
				return res.send({
					status: "nok",
					message: "Unable to upload all files due to network slowdown or network failure. Please try again."
				});
			}
			else {
				return res.ok({status: "ok", message: "Successfully uploaded", fillepath: {bucket, region}, files: uploadFile});
			}
		} catch (err) {
			return res.serverError(err);
		}
	},

	/**
	 * @api {post} /viewDocument/ View Document
	 * @apiName Document View
	 * @apiGroup User
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/viewDocument/
	 * @apiParam {string} filename name of the file.
	 * @apiParam {string} userid userid of the document.
	 * @apiParam {Number} loan_id loan id.
	 * @apiSuccess {String} status status of the document.
	 * @apiSuccess {String} signedurl signed url.
	 * @apiDescription <b>Note:To get the thumbnail of a pdf file: please call view document api : pass parameter of filename as "thumb_fdname.png"</b>
	 * eg:filename : thumb_857fc7f1-57d8-44c4-b5fc-7e7020e2756b.png
	 *
	 */

	viewDocument: async function (req, res, next) {
		let encodedUrl;
		const loanId = req.param("loan_id"),
			isProfile = req.param("isProfile"),
			filename = req.param("filename");

		params = {
			loan_id: loanId,
			isProfile,
			filename
		};

		fields = ["filename", "loan_id", "isProfile"];
		missing = await reqParams.fn(params, fields);

		if ((!filename || !loanId) && (!filename || !isProfile)) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let userid;
		if (loanId) {
			const loanData = await LoanrequestRd.findOne({id: loanId})
				.populate("loan_document")
				.populate("lender_document")
				.populate("business_id");
			if (!loanData) {
				return res.badRequest(sails.config.res.invalidLoanId);
			}
			userid = loanData.business_id.userid;
			if (
				(!loanData.loan_document || loanData.loan_document.length === 0) &&
				(!loanData.lender_document || loanData.lender_document.length === 0)
			) {
				return res.send({status: "nok", message: "No document has been uploaded for this loan"});
			}
			const docName = [];
			_.each(loanData.loan_document, (values) => {
				docName.push(values.doc_name);
			});
			_.each(loanData.lender_document, (values) => {
				docName.push(values.doc_name);
			});
			if (docName.indexOf(filename) === -1) {
				return res.send({status: "nok", message: "The file with the entered file name is not found"});
			}
		}

		const user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel});
		let bucket = whitelabelsolution[0]["s3_name"];
		const region = whitelabelsolution[0]["s3_region"];
		userid = req.param("userid") || req.param("userId") || req.user.id;
		if (!userid) {
			return res.badRequest({status: "nok", message: "User Id wrong or missing"});
		}

		const logService = await sails.helpers.logtrackservice(req, "viewDocument", filename, "loan_document");
		bucket = bucket + "/users_" + userid;
		const url = await sails.helpers.s3ViewDocument(filename, bucket, region);
		console.log("---------------------------------", url);
		// return res.send({
		// status: "ok",
		// signedurl: url,
		// });
		// Encoding url for security fixes
		if (url) {
			const key = "htde6458dgej2164";
			encodedUrl = await sails.helpers.crypto("aesCbcEncrypt", url, key, key);
		}

		if (!encodedUrl || !url) {
			return res.send({status: "nok", message: "Requested file not available"});
		} else {
			return res.send({status: "ok", signedurl: encodedUrl});
		}
	},

	show: function (req, res, next) {
		UsersRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	edit: function (req, res, next) {
		UsersRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	update: function (req, res, next) {
		Users.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("users/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Users.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/users");
		});
	},

	/**
	 * @api {get} /pincode/ Pincode
	 * @apiName Pincode
	 * @apiGroup User
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/pincode?code=560102
	 * @apiParam {string} code 6 digit pincode.
	 * @apiSuccess {String} locality  locality district state data of the pincode.
	 */
	pincode: async function (req, res, next) {
		const https = require("http");
		const pin = req.param("code"),
			country = req.param("country");

		const white_label_id = req.user.loggedInWhiteLabelID;
		if (country == "US") {
			var options = {
				hostname: "api.zippopotam.us",
				path: "/us/" + pin,
				method: "GET"
			};
			http: https
				.request(options, (response) => {
					let responseData = "",
						jsonresponse = {};
					response.setEncoding("utf8");
					response.on("data", (chunk) => {
						const data = chunk,
							obj = JSON.parse(data);
						if (obj) {
							if (obj.places && obj.places[0].state && obj.places[0]["place name"]) {
								jsonresponse = {
									locality: [obj.places[0]["place name"]],
									district: [obj.places[0]["place name"]],
									state: [obj.places[0].state]
								};
								responseData += JSON.stringify(jsonresponse);
							} else {
								return res.send({
									status: "nok",
									message: "Could not fetch the data for entered pincode"
								});
							}
						} else {
							return res.badRequest({status: "nok", message: "Invalid pincode", chunk});
						}
					});

					response.once("error", (err) => {
						res.serverError(err);
					});
					response.on("end", () => {
						try {
							res.send(responseData);
						} catch (e) {
							sails.log.warn("Could not parse response from options.hostname: " + e);
						}
					});
				})
				.end();
		} else if (country === "UK") {
			const apiKey = sails.config.uk_pincode.apiKey;
			decodeURIComponent(pin);
			const url = `https://api.getAddress.io/find/${pin}?expand=true&api-key=${apiKey}`,
				result = await sails.helpers.sailstrigger(url, "", "", "GET");
			let jsonRes = {};
			const localityArr = [],
				districtArr = [],
				stateArr = [],
				lineArr = [];
			if (result) {
				if (result.status == "nok") {
					return res.send({status: "nok", message: "Invalid pincode"});
				}
				const jsonParsed = JSON.parse(result),
					addressData = jsonParsed.addresses;
				addressData.map((addressItem) => {
					localityArr.push(addressItem.locality);
					districtArr.push(addressItem.district);
					stateArr.push(addressItem.country);
					lineArr.push(addressItem.line_1);
				});
				jsonRes = {
					locality: localityArr,
					district: districtArr,
					state: stateArr,
					line: lineArr
				};
				return res.send(jsonRes);
			} else {
				return res.send({status: "nok", message: "Could not fetch the data for entered pincode"});
			}
		} else {
			var options = {
				hostname: "api.namastecredit.com",
				path: `/Salesreport/getCityStateByPincode?keyword=${pin}`,
				method: "GET"
			};
			if (white_label_id) options.path = `/Salesreport/getCityStateByPincode?keyword=${pin}&wlid=${white_label_id}`;
			// for releasee dec11
			// var logService = await sails.helpers.logtrackservice(req, 'pincode', req.user.id, 'users');
			https
				.request(options, (response) => {
					let responseData = "";
					response.setEncoding("utf8");
					response.on("data", async (chunk) => {
						const data = chunk,
							obj = JSON.parse(data);
						if (obj) {
							if (obj.locality && obj.district && obj.state) {
								responseData += chunk;
							} else if (!obj.locality && !obj.district && !obj.state) {
								pincodeHelper = await sails.helpers.mailer(pin, JSON.stringify(obj));
								return res.status(400).send({
									status: "nok",
									message: "No data found for the entered pincode"
								});
							} else {
								return res.status(500).send({
									status: "nok",
									message: "Could not fetch the data for entered pincode"
								});
							}
						} else {
							pincodeHelper = await sails.helpers.mailer(pin, data);
							return res.badRequest({status: "nok", message: "Invalid pincode"});
						}
					});

					response.once("error", (err) => {
						res.serverError(err);
					});
					response.on("end", () => {
						try {
							if (responseData) {
								res.send(responseData);
							} else {
								return res.status(500).send({
									status: "nok",
									message: "Could not fetch the data for entered pincode"
								});
							}
						} catch (e) {
							sails.log.warn("Could not parse response from options.hostname: " + e);
						}
					});
				})
				.end();
		}
	},

	/**
	 * @api {post} /resetPassword/ Reset Password
	 * @apiName password reset
	 * @apiGroup User
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/resetPassword/
	 * @apiParam {string} currentPassword current password.
	 * @apiParam {string} newPassword new password.
	 * @apiParam {string} confirmPassword confirm password.
	 * @apiSuccess {String} status  ok.
	 * @apiSuccess {String} message password updated successfully.
	 */
	resetPassword: async function (req, res, next) {
		const md5 = require("md5"),
			moment = require("moment");
		const currentPassword = req.body.currentPassword,
			newPassword = req.body.newPassword,
			confirmPassword = req.body.confirmPassword;
		let md5CurrentPassword, md5NewPassword, createPwHistory;
		const checkArr = [],
			Obj = {},
			user_whitelabel = req.user.loggedInWhiteLabelID,
			whiteLabelsolutionData = await WhiteLabelSolutionRd.findOne({
				where: {
					id: user_whitelabel
				},
				select: ["password_history_count", "password_reuse_policy"]
			}),
			data = await PasswordHistoryRd.find({user_id: req.user.id}),
			existPassword = await UsersRd.findOne({
				where: {
					id: req.user["id"]
				}
			});
		pwChange = async (currentPassword, newPassword, confirmPassword, existPassword) => {
			params = {currentPassword, newPassword, confirmPassword, existPassword};
			fields = ["currentPassword", "newPassword", "confirmPassword"];
			missing = await reqParams.fn(params, fields);

			if (!currentPassword || !newPassword || !confirmPassword) {
				sails.config.res.missingFields.mandatoryFields = missing;
				return res.badRequest(sails.config.res.missingFields);
			}

			if (existPassword.password.length == 32) {
				md5CurrentPassword = md5(currentPassword);
				if (md5CurrentPassword !== existPassword.password) {
					return res.badRequest({status: "nok", message: "The current password you entered is not correct"});
				}
			} else {
				md5CurrentPassword = await sails.helpers.hashEncryptionDecryption(
					"is_valid_password_with_salt",
					currentPassword,
					"",
					existPassword.password
				);
				if (md5CurrentPassword !== true) {
					return res.badRequest({status: "nok", message: "The current password you entered is not correct"});
				}
			}
			if (passwordStrength(newPassword).id !== 2 && passwordStrength(newPassword).id !== 3) {
				return res.badRequest({
					status: "nok",
					message: `The new password is ${passwordStrength(newPassword).value
						}, Your password should contain at least 8 characters long, 1 uppercase, 1 lowercase, 1 special character and 1 number`
				});
			}
			if (currentPassword == newPassword) {
				return res.badRequest({
					status: "nok",
					message:
						"You cannot change the password, the entered new password  and the current password are the same."
				});
			}

			const logService = await sails.helpers.logtrackservice(req, "resetPassword", req.user.id, "users"),
				passwordHistoryData = await PasswordHistoryRd.find({user_id: req.user["id"]}).sort([
					{
						created_at: "ASC"
					}
				]);
			if (newPassword == confirmPassword) {
				const salt = `${existPassword.id}-${existPassword.white_label_id}-${Math.floor(
					new Date().getTime() / 1000
				)}`;
				md5NewPassword = await sails.helpers.hashEncryptionDecryption(
					"encrypt_password_with_salt",
					newPassword,
					salt,
					""
				);
				const historyObj = {
					user_id: req.user["id"],
					password: existPassword.password,
					created_at: await sails.helpers.dateTime()
				};
				if (
					whiteLabelsolutionData.password_history_count !== null &&
					passwordHistoryData.length >= whiteLabelsolutionData.password_history_count
				) {
					let updatePwHistory;

					if (passwordHistoryData.length !== 0) {
						updatePwHistory = await PasswordHistory.updateOne({id: passwordHistoryData[0].id}).set({
							created_at: await sails.helpers.dateTime(),
							password: existPassword.password
						});
					}
				} else {
					createPwHistory = await PasswordHistory.create(historyObj).fetch();
				}
				await Users.update({
					where: {
						id: req.user["id"]
					}
				})
					.set({
						password: md5NewPassword,
						firstlogin: 1,
						user_reference_pwd: newPassword,
						login_status: "logged_out"
					})
					.fetch()
					.then((data) => {
						if (data) {
							return res.ok({status: "ok", message: "password updated successfully"});
						}
					});
			} else {
				return res.badRequest({status: "nok", message: "The new passwords are not matching"});
			}
		};
		if (data.length > 0) {
			for (let i = 0; i < data.length; i++) {
				if (data[i].password.length == 32) {
					const md5Pw = md5(newPassword);
					if (data[i].password == md5Pw) {
						Obj["pw"] = md5Pw;
						Obj["date"] = data[i].created_at;
					}
				} else {
					const saltPasswordCheck = await sails.helpers.hashEncryptionDecryption(
						"is_valid_password_with_salt",
						newPassword,
						"",
						data[i].password
					);
					if (saltPasswordCheck == true) {
						const salt = `${existPassword.id}-${existPassword.white_label_id}-${Math.floor(
							new Date().getTime() / 1000
						)}`,
							saltPassword = await sails.helpers.hashEncryptionDecryption(
								"encrypt_password_with_salt",
								newPassword,
								salt,
								""
							);
						Obj["pw"] = saltPassword;
						Obj["date"] = data[i].created_at;
					}
				}
				Object.keys(Obj).length > 0 && checkArr.push(Obj);
				var newArr = [...new Set(checkArr)];
			}
			if (newArr.length > 0) {
				// let monthLimit =
				// (30 * whiteLabelsolutionData &&
				// whiteLabelsolutionData.password_reuse_policy &&
				// whiteLabelsolutionData.password_reuse_policy.password_reuse_in_months &&
				// whiteLabelsolutionData.password_reuse_policy.password_reuse_in_months) ||
				// 30;
				const monthLimit =
					whiteLabelsolutionData &&
						whiteLabelsolutionData.password_reuse_policy &&
						whiteLabelsolutionData.password_reuse_policy.password_reuse_in_months
						? 30 * Number(whiteLabelsolutionData.password_reuse_policy.password_reuse_in_months)
						: 30,
					startDate = moment(newArr[0].date, "DD-MM-YYYY"),
					endDate = moment(new Date(), "DD-MM-YYYY"),
					dateLimit = endDate.diff(startDate, "days");
				if (dateLimit > monthLimit) {
					flag = "yes";
				} else {
					flag = "no";
				}
				if (flag === "no") {
					const numDays = monthLimit - dateLimit;
					return res.badRequest({
						status: "nok",
						message: `Cannot change the password, as you have used the same password previously try after ${numDays} days `
					});
				} else {
					pwChange(currentPassword, newPassword, confirmPassword, existPassword);
				}
			} else {
				pwChange(currentPassword, newPassword, confirmPassword, existPassword);
			}
		} else {
			pwChange(currentPassword, newPassword, confirmPassword, existPassword);
		}
	},

	/**
	 * @api {POST} /user   create user
	 * @apiName create user
	 * @apiGroup User
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/user
	 * @apiParam {String} name Name of User(mandatory).
	 * @apiParam {String} email user email ID(mandatory).
	 * @apiParam {String} contact contact Number(mandatory).
	 * @apiParam {String} usertype type of user(mandatory) ( if lender or sales user you need to pass usertype along with subtype i.e : Bank-Credit, Sales-Farmer) .
	 * @apiParam {Number} lender_id  lender id.
	 * @apiParam {String} password password should be sent in md5(mandatory).
	 * @apiParam {Number} assigned_sales_user sales which is assigned to the user.
	 * @apiParam {Number} is_lender_admin lender admin (1 : yes, 0 : no by default it is 0 )
	 * @apiParam {Number} is_lender_manager lender manager (1 : yes, 0 : no by default it is 0 )
	 * @apiParam {Number} user_group_id user group id (1 : Unsecured, 2 : Secured, 3 : Both(Secured and Unsecured))
	 * @apiParam {Number} region_id region id (1 : North, 2 : South, 3 : East, 4 : West, 5 : Central)
	 * @apiParam {String} confirmPassword confirmPassword should be sent in md5(mandatory)
	 * @apiParam {String} state state
	 * @apiParam {String} city city
	 * @apiParam {Number} bank bank id (for lender user creation instead of lender_id you need to pass bank).
	 *
	 *
	 * @apiSuccess {String} status status(if it is success ok otherwise nok)
	 * @apiSuccess {Object} data list of user data.
	 * @apiSuccess {Number} data.id user ID.
	 * @apiSuccess {String} data.name name of the user.
	 * @apiSuccess {String} data.email user email address.
	 * @apiSuccess {String} data.contact contact number of the user.
	 * @apiSuccess {String} data.cacompname company name.
	 * @apiSuccess {String} data.capancard user PAN CARD number.
	 * @apiSuccess {String} data.address1 user address 1.
	 * @apiSuccess {String} data.address2 user address 2 (by default it is null).
	 * @apiSuccess {String} data.pincode user pincode.
	 * @apiSuccess {String} data.locality area/location of the user.
	 * @apiSuccess {String} data.city city of the user.
	 * @apiSuccess {String} data.state state of the user.
	 * @apiSuccess {String} data.usertype logged in user type.
	 * @apiSuccess {Number} data.lender_id user lender ID.
	 * @apiSuccess {Number} data.parent_id user logged in user parent ID.
	 * @apiSuccess {Number} data.user_group_id user group ID.
	 * @apiSuccess {Number} data.assigned_sales_user sales user ID.
	 * @apiSuccess {Number} data.originator logged in user.
	 * @apiSuccess {Number} data.is_lender_admin
	 * @apiSuccess {String} data.status status of the user (by default it is inactive).
	 * @apiSuccess {String} data.osv_name
	 * @apiSuccess {String} data.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
	 * @apiSuccess {String} data.createdon user created date and time.
	 * @apiSuccess {String} data.update_time user updated date and time.
	 * @apiSuccess {Number} data.is_lender_manager
	 * @apiSuccess {String} data.origin shows user type of the created the user.
	 * @apiSuccess {String} data.white_label_id white label id of the user.
	 * @apiSuccess {String} data.deactivate_reassign
	 * @apiSuccess {Number} data.notification_purpose shows if there is a notification (default it is 3).
	 * @apiSuccess {String} data.user_sub_type sub type of the user (by default it is null)
	 * @apiSuccess {String} data.notification_flag
	 * @apiSuccess {Number} data.createdbyUser ID of the created user.
	 * @apiSuccess {String} data.source shows source of the created user (by default logged in source, example:web).
	 * @apiSuccess {String} data.channel_type channel type of the created user.
	 * @apiSuccess {String} data.otp user otp number
	 * @apiSuccess {String} data.work_type created user work type.
	 * @apiSuccess {String} data.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
	 * @apiSuccess {String} data.pic user profile picture.
	 *
	 * @apiSuccess {Object} LenderRegionMapping
	 * @apiSuccess {Number} LenderRegionMapping.id lender region mapping id.
	 * @apiSuccess {Number} LenderRegionMapping.user_id user id,
	 * @apiSuccess {String} LenderRegionMapping.user_type user type.
	 * @apiSuccess {Number} LenderRegionMapping.region_id region id.
	 * @apiSuccess {String} LenderRegionMapping.createdon created date and time.
	 */

	create: async function (req, res, next) {
		const name = req.body.name,
			email = req.body.email,
			contact = req.body.contact,
			[usertype, user_sub_type] = req.body.usertype.split("-"),
			origin = req.user["usertype"] + " Add",
			createdbyuser = req.user["id"];
		let password = req.body.password;
		const userRefPwd = req.body.password,
			user_whitelabel = req.user.loggedInWhiteLabelID,
			white_label_id = user_whitelabel,
			lender_id = req.body.lender_id,
			parent_id = req.user["id"],
			source = req.user["source"],
			// let user_sub_type = req.body.user_sub_type;
			city = req.body.city,
			state = req.body.state,
			pincode = req.body.pincode,
			address1 = req.body.address1,
			address2 = req.body.address2,
			locality = req.body.locality,
			assigned_sales_user = req.body.assigned_sales_user,
			is_lender_admin = req.body.is_lender_admin,
			is_lender_manager = req.body.is_lender_manager,
			user_group_id = req.body.user_group_id,
			region_id = req.body.region_id,
			is_corporate = req.body.is_corporate,
			confirmPassword = req.body.confirmPassword,
			datetime = await sails.helpers.dateTime();
		let user, region_details;
		const existEmail = await UsersRd.find({
			select: ["email"],
			where: {
				email: email
			}
		});
		if (existEmail.length > 0) {
			return res.ok({status: "nok", message: "The email exist"});
		}
		if (passwordStrength(password).id !== 2 && passwordStrength(password).id !== 3) {
			return res.badRequest({
				status: "nok",
				message: `The new password is ${passwordStrength(password).value
					}, Your password should contain at least 8 characters long, 1 uppercase, 1 lowercase, 1 special character and 1 number`
			});
		}
		if (password != confirmPassword) {
			return res.badRequest({status: "nok", message: "The passwords are not matching"});
		}

		const salt = `${req.user.id}-${req.user.white_label_id}-${Math.floor(new Date().getTime() / 1000)}`;
		password = await sails.helpers.hashEncryptionDecryption("encrypt_password_with_salt", password, salt, "");
		const createobj = {
			name: name,
			email: email,
			contact: contact,
			usertype: usertype,
			origin: origin,
			createdbyUser: createdbyuser,
			password: password,
			status: "active",
			createdon: datetime,
			white_label_id: white_label_id,
			notification_purpose: "3",
			notification_flag: "yes",
			user_reference_pwd: userRefPwd
		};

		if (name && email && contact && usertype && password) {
			if (lender_id) {
				createobj["lender_id"] = lender_id;
			}
			if (parent_id) {
				createobj["parent_id"] = parent_id;
			}
			if (source) {
				createobj["source"] = source;
			}
			if (user_sub_type) {
				createobj["user_sub_type"] = user_sub_type;
			}
			if (city) {
				createobj["city"] = city;
			}
			if (state) {
				createobj["state"] = state;
			}
			if (pincode) {
				createobj["pincode"] = pincode;
			}
			if (address1) {
				createobj["address1"] = address1;
			}
			if (address2) {
				createobj["address2"] = address2;
			}
			if (locality) {
				createobj["locality"] = locality;
			}
			if (assigned_sales_user) {
				createobj["assigned_sales_user"] = assigned_sales_user;
			}
			if (is_lender_admin) {
				createobj["is_lender_admin"] = is_lender_admin;
			}
			if (is_lender_manager) {
				createobj["is_lender_manager"] = is_lender_manager;
			}
			if (user_group_id) {
				createobj["user_group_id"] = user_group_id;
			}
			if (is_corporate) {
				createobj["is_corporate"] = is_corporate;
			}
			if (usertype == "Bank") {
				if (req.user.lender_id == req.body.bank) {
					createobj.lender_id = req.body.bank;
					user = await Users.create(createobj).fetch();
				} else {
					return res.ok({status: "nok", message: "Your not authorized to create user for this bank"});
				}
				if (user && region_id) {
					let lenderRegionMappingArray = [];
					for (let i = 0; i < region_id.length; i++) {
						let lenderRegionMappingObject = {
							region_id: region_id[i],
							user_id: user.id,
							user_type: usertype,
							createdon: datetime
						};
						lenderRegionMappingArray.push(lenderRegionMappingObject);
					}
					const region = await LenderRegionMapping.createEach(lenderRegionMappingArray).fetch();
					region_details = await LenderRegionMappingRd.find({user_id: user.id});
				}
			} else {
				user = await Users.create(createobj).fetch();
				if (user && user.is_corporate && user.is_corporate == 1) {
					const userType = req.user.is_corporate == 1 ? "Secondary" : "Primary";
					createCorpData = await UserCorporateMapping.create({
						userid: user.id,
						user_type: userType,
						created_by: req.user.id,
						created_on: await sails.helpers.dateTime()
					}).fetch();
				}
			}
			const loans_user = await UsersRd.findOne({id: user.id}).populate("loans", {sort: "RequestDate DESC"}),
				logService = await sails.helpers.logtrackservice(req, "user", user.id, "users");
			return res.json({
				status: "ok",
				message: "User created",
				data: loans_user,
				LenderRegionMapping: region_details
			});
		} else {
			return res.badRequest({status: "nok", message: "The mandatory fields are missing"});
		}
	},

	/**
	 * @api {GET} /sales_list   sales list
	 * @apiName sales list
	 * @apiGroup User
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/sales_list
	 * @apiSuccess {String} status status(if it is success ok otherwise nok)
	 * @apiSuccess {Object[]} data list of sales user.
	 * @apiSuccess {Object[]} data.city list according to city.
	 * @apiSuccess {Number} data.city.userid userid of sales.
	 * @apiSuccess {String} data.city.name name of sales.
	 * @apiSuccess {String} data.city.usertype usertype of sales.
	 * @apiSuccess {String} data.city.user_sub_type user_sub_type of sales.
	 */

	sales_user_list: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.findOne({
				where: {
					id: user_whitelabel
				},
				select: ["assignment_type"]
			}),
			assignmentData = whitelabelsolution.assignment_type.user.assignment;
		let userType = assignmentData.map((item) => Object.keys(item).toString());

		const userSubType = assignmentData.map((item) => Object.values(item).toString());

		if (userType != "") {
			userType;
		} else {
			userType = "Sales";
		}

		let sub_query;
		if (userSubType != "") {
			sub_query = "AND user_sub_type in ('" + userSubType.join("','") + "')";
		} else {
			sub_query = "";
		}
		const logService = await sails.helpers.logtrackservice(req, "user", req.user.id, "users"),
			query =
				"SELECT `userid`, `name`, `osv_name`, `city`, `usertype`, `user_sub_type` FROM `users` WHERE usertype IN ('" +
				userType.join("','") +
				"') " +
				sub_query +
				" AND `status` = \"active\" AND find_in_set(" +
				user_whitelabel +
				",white_label_id) != 0 ORDER BY `city` ASC, `name` ASC",
			myDBStore = sails.getDatastore("mysql_namastecredit_read");
		nativeResult = await myDBStore.sendNativeQuery(query);
		const sales_data = nativeResult.rows,
			sales_result_set = {},
			salesParseData = JSON.parse(JSON.stringify(sales_data));
		salesParseData.forEach((value, index) => {
			const city = value.city === null || value.city === "" ? "others" : value.city;
			if (!sales_result_set[city]) {
				sales_result_set[city] = [];
			}
			sales_result_set[city].push({
				userid: value.userid,
				name: value.name,
				usertype: value.usertype,
				user_sub_type: value.user_sub_type
			});
		});
		return res.send({status: "ok", data: sales_result_set});
	},

	/**
	 * @api {get} /usertype/ user type
	 * @apiName user type
	 * @apiGroup User
	 * @apiExample Example usage:
	 * curl -i localhost:1337/usertype/
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {Object[]} data
	 */

	usertype: async function (req, res) {
		const userdetails = await UsersRd.findOne({id: req.user["id"]}),
			white_label_id = req.user.loggedInWhiteLabelID,
			user_type = userdetails.usertype,
			user_sub_type = userdetails.user_sub_type;
		let whiteLabel_permission;
		const whiteLabelSolution = await WhiteLabelSolutionRd.findOne({id: white_label_id});
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
				const whiteLabel_permission_json = whiteLabel_permission.permission.user.user_types_tocreate;
				return res.json({status: "ok", data: whiteLabel_permission_json});
			} else {
				return res.badRequest({status: "nok", message: "User type is not available in this whitelabel"});
			}
		} else {
			return res.badRequest({status: "nok", message: "Available user type field is null or empty"});
		}
	},

	/**
	 * @api {get} /stateCity/ state and city
	 * @apiName state and city
	 * @apiGroup User
	 * @apiExample Example usage:
	 * curl -i localhost:1337/stateCity/
	 * @apiParam {String} state state name.
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} state selected state name.
	 * @apiSuccess {Object[]} data list of selected state cities.
	 */

	state_city: async function (req, res) {
		const states = await CityStateMasterRd.find({sort: "state"}),
			state_data = JSON.parse(JSON.stringify(states)),
			state_city = {};
		state_data.forEach((value) => {
			const state = value.state;
			if (!state_city[state]) {
				state_city[state] = [];
			}
			state_city[state].push(value.city);
		});

		return res.ok({status: "ok", data: state_city});
	},

	/**
	 * @api {POST} /login/createUser createUser
	 * @apiName createUser
	 * @apiGroup users
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/login/createUser
	 * @apiParam {String} email
	 * @apiParam {String} white_label_id
	 * @apiParam {String} source
	 * @apiParam {String} name
	 * @apiParam {String} mobileNo
	 * @apiParam {String} addrr1
	 * @apiParam {String} addrr2
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 */
	createUser: async function (req, res) {
		let email = req.param("email");
		const white_label_id = req.param("white_label_id"),
			source = req.param("source"),
			name = req.param("name"),
			mobileNo = req.param("mobileNo"),
			addrr1 = req.param("addrr1"),
			addrr2 = req.param("addrr2"),
			user_id = req.param("user_id"),
			usertype = req.param("user_type"),
			is_user_vendor = req.param("is_user_vendor"),
			channel_type = req.param("channel_type"),
			pincode = req.param("pincode");

		if (!email) {
			// email = name.replace(/\s+/g, "");
			email = mobileNo + "@nc.com";
		}

		params = req.allParams();
		fields = ["email", "white_label_id", "source", "mobileNo", "name"];
		missing = await reqParams.fn(params, fields);

		if (!email || !white_label_id || !source || !mobileNo || !name) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let userDetails = await UsersRd.find({
			where: {
				email: email
			}
		});
		if (userDetails.length > 0 && is_user_vendor) {
			return res.badRequest({
				status: "nok",
				message: "User already exists."
			});
		}

		const white_label_solution = await WhiteLabelSolutionRd.findOne({
			where: {id: white_label_id},
			select: ["ref_bank_id"]
		});
		const salt = `${white_label_id}-${Math.floor(new Date().getTime() / 1000)}`;
		let password = await sails.helpers.hashEncryptionDecryption("encrypt_password_with_salt", mobileNo, salt, "");
		if (userDetails.length == 0) {
			userDetails = await Users.create({
				email: email,
				name: name,
				contact: mobileNo,
				address1: addrr1 ? addrr1 : "",
				address2: addrr2 ? addrr2 : "",
				pincode: pincode || "560075",
				origin: "portal",
				white_label_id: white_label_id,
				source: source,
				usertype: usertype || "Borrower",
				status: is_user_vendor ? "inactive" : "active",
				login_status: "999999",
				lender_id: white_label_solution.ref_bank_id,
				notification_flag: "yes",
				user_sub_type: "",
				createdbyUser: 1,
				password: password,
				user_reference_pwd: mobileNo,
				parent_id: user_id || null,
				channel_type: channel_type || null,
				createdon: await sails.helpers.dateTime()
			}).fetch();
			userDetails.loggedInWhiteLabelID = white_label_id;
			await Users.updateOne({id: userDetails.id}).set({
				createdbyUser: userDetails.id
			});
		} else {
			userDetails = userDetails[0];
			whiteLabelHelper = await sails.helpers.whiteLabel(email, white_label_id);
			userDetails.loggedInWhiteLabelID = white_label_id;
			await Users.updateOne({id: userDetails.id}).set({
				login_status: "999999"
			});
		}
		userDetails.pic = "";
		const jwtToken = await new SignJWT({subject: "uuid", user: userDetails})
			.setProtectedHeader({alg: "EdDSA"})
			.setExpirationTime("1d")
			.sign(private_key);

		return res.send({
			statusCode: "NC200",
			token: jwtToken,
			userId: userDetails.id,
			email: email,
			bankId: white_label_solution.ref_bank_id,
			branchId: 179423
		});
	},

	usersDetails: async function (req, res) {
		id = req.param("userid");

		params = req.allParams();
		fields = ["userid"];
		missing = await reqParams.fn(params, fields);

		if (!id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		userData = await Users.findOne({id: +id});

		return res.send({status: "ok", message: "Users Details", data: userData});
	},

	profilePicUpload: async function (req, res) {
		const white_label_id = req.param("white_label_id"),
			lat = req.param("lat"),
			long = req.param("long");
		let params = req.allParams();
		let fields = ["white_label_id"];
		let missing = await reqParams.fn(params, fields);

		if (!white_label_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const whitelabelsolution = await WhiteLabelSolutionRd.find({id: white_label_id});
		if (!whitelabelsolution || whitelabelsolution.length <= 0) {
			return res.badRequest(sails.config.res.noDataAvailableId);
		}
		let bucket, region, geo_tagging;
		if (whitelabelsolution) {
			bucket = whitelabelsolution[0]["s3_name"];
			region = whitelabelsolution[0]["s3_region"];
			geo_tagging = JSON.parse(whitelabelsolution[0].geo_tagging);
		}

		folder = bucket + "/profilepic";

		const document = req.file("document");
		if (document.fieldName == "NOOP_document") {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.selectDocument
			});
		}
		AllowedTypes = ["image/jpeg", "image/jpg", "image/png"];
		let type = document._files[0].stream;
		if (_.indexOf(AllowedTypes, type.headers["content-type"]) < 0) {
			return res.badRequest({
				status: "nok",
				message: `FileType ${type.headers["content-type"]} is not allowed to upload`
			});
		}
		const uploadFile = await sails.helpers.s3Upload(document, folder, region);

		if (!uploadFile || uploadFile.length == 0) {
			return res.badRequest(sails.config.res.uploadFailure);
		}
		let timestamp = await sails.helpers.indianDateTime();
		timestamp = moment(timestamp).format("DD/MM/YYYY - hh:mm:ss");
		let lat_long_data;
		let file = uploadFile[0].fd;
		let presignedUrl = await sails.helpers.s3ViewDocument(file, folder, region);
		let fileObj = {
			bucket,
			region,
			filename: uploadFile[0].filename,
			path: `profilepic/${file}`
		};
		if (lat && long) {
			if (geo_tagging && geo_tagging.geo_tagging) {
				lat_long_data = await sails.helpers.fetchLocation(lat, long);
				fileObj = {...fileObj, lat, long, timestamp, address: lat_long_data};
				body = {
					user_id: "profilepic",
					doc_name: file,
					white_label_id: white_label_id,
					s3bucket: bucket,
					region: region,
					cloud: "aws",
					time_stamp: timestamp,
					lat_long: lat + " " + long,
					address: fileObj.address
				};
				auth = {
					"content-Type": "application/json"
				};

				let mlApiRes = await sails.helpers.sailstrigger(
					sails.config.geoLocation.geoLocation_api_url,
					JSON.stringify(body),
					auth,
					"POST"
				);
				let geo_data = JSON.parse(mlApiRes),
					thump_file_path = "";
				if (geo_data.Status == "failed") {
					fileObj.geo_tagging_data = {message: "ML API error", error: geo_data};
				} else {
					// fileObj.geo_tagging_data = [geo_data.thump_file_path];
					if (geo_tagging.water_mark) {
						presignedUrl = await sails.helpers.s3ViewDocument(geo_data.labeled_file_path, folder, region);
						fileObj.path = `profilepic/${geo_data.labeled_file_path}`;
						// fileObj.geo_tagging_data.push(geo_data.labeled_file_path);
					}
					thump_file_path = await sails.helpers.s3ViewDocument(geo_data.thump_file_path, folder, region);
				}
				return res.ok({
					status: "ok",
					message: "Successfully uploaded",
					presignedUrl,
					preview: thump_file_path,
					file: fileObj
				});
			}
		}

		return res.ok({
			status: "ok",
			message: "Successfully uploaded",
			presignedUrl: presignedUrl,
			file: fileObj
		});
	},

	udyamDocUpload: async function (req, res) {
		const {white_label_id, loan_id, business_id, doc_type_id, is_delete_not_allowed} = req.allParams();

		if (!white_label_id || !loan_id || !business_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const whitelabelsolution = await WhiteLabelSolutionRd.findOne({id: white_label_id}).select(["s3_name", "s3_region"]);
		if (!whitelabelsolution) {
			return res.badRequest(sails.config.res.noDataAvailableId);
		}
		const bucket = whitelabelsolution.s3_name,
			region = whitelabelsolution.s3_region;
		const businessData = await BusinessRd.findOne({id: business_id}).select("userid");

		folder = bucket + "/users_" + businessData.userid;

		const document = req.file("document");
		if (document.fieldName == "NOOP_document") {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.selectDocument
			});
		}
		AllowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
		let type = document._files[0].stream;
		if (_.indexOf(AllowedTypes, type.headers["content-type"]) < 0) {
			return res.badRequest({
				status: "nok",
				message: `FileType ${type.headers["content-type"]} is not allowed to upload`
			});
		}
		const uploadFile = await sails.helpers.s3Upload(document, folder, region);

		if (!uploadFile || uploadFile.length == 0) {
			return res.badRequest(sails.config.res.uploadFailure);
		}
		const datetime = await sails.helpers.dateTime(),
			loanDocCreate = await LoanDocument.create({
				user_id: businessData.userid,
				business_id,
				loan: loan_id,
				doctype: doc_type_id || sails.config.docUpload.udyamDocId,
				doc_name: uploadFile[0].fd,
				uploaded_doc_name: uploadFile[0].filename,
				original_doc_name: uploadFile[0].filename,
				status: "active",
				size: uploadFile[0].size,
				ints: datetime,
				on_upd: datetime,
				uploaded_by: req.user.id,
				is_delete_not_allowed: is_delete_not_allowed
					? is_delete_not_allowed
					: "false"
			}).fetch(),
			presignedUrl = await sails.helpers.s3ViewDocument(uploadFile[0].fd, folder, region);
		return res.ok({
			status: "ok",
			message: "Successfully uploaded",
			presignedUrl: presignedUrl,
			file: loanDocCreate
		});
	},

	usersList: async function (req, res) {
		const user_reference_no = req.param("user_reference_no"), connector_id = req.param("connector_id"),
			{branch_id, city, loggedInWhiteLabelID} = req.user;
		let whereCondition = {},
			userListArr = [];
		if (connector_id) {
			const userDetails = await UsersRd.find({
				user_reference_no: connector_id, status: "active", white_label_id: loggedInWhiteLabelID
			}).select(["name", "id", "branch_id", "user_reference_no"]);
			userListArr = userDetails.filter(item => item.user_reference_no !== null && item.user_reference_no !== "");
		}
		else if (branch_id) {
			if (user_reference_no) {whereCondition = {profile_ref_no: user_reference_no};}
			else {
				whereCondition = {
					is_ca_business: 1,
					profile_branch_id: branch_id
				};
			}
			const businessDetails = await BusinessRd.find(whereCondition).select(["id", "businessname", "first_name", "last_name", "profile_branch_id", "profile_ref_no"]);
			for (const i in businessDetails) {
				if (businessDetails[i].profile_ref_no) {
					list = {
						id: businessDetails[i].id,
						name: businessDetails[i].businessname,
						branch_id: businessDetails[i].profile_branch_id,
						user_reference_no: businessDetails[i].profile_ref_no
					};
					userListArr.push(list);
				}
			}
		} else {
			if (user_reference_no) {whereCondition = {user_reference_no, status: "active"};}
			else {
				whereCondition = {
					white_label_id: loggedInWhiteLabelID,
					city,
					usertype: "CA",
					status: "active"
				}
			}
			const userDetails = await UsersRd.find(whereCondition).select(["name", "id", "branch_id", "user_reference_no"]);
			for (const j in userDetails) {
				if (userDetails[j].user_reference_no) {
					userListArr.push(userDetails[j]);
				}
			}
		}
		return res.ok({status: "ok", data: userListArr});
	},
	generate_token_basedOn_loanref_id: async function (req, res) {
		const loan_ref_id = req.param("loan_ref_id");
		if (!loan_ref_id) {
			return res.badRequest({
				status: "nok",
				nessage: "Loan ref id is missing."
			});
		}
		const loanReqData = await LoanrequestRd.findOne({loan_ref_id}).populate("business_id");
		if (!loanReqData) {
			return res.badRequest({
				status: "nok",
				nessage: "Invalid Loan ref id."
			});
		}
		const userData = await UsersRd.findOne({id: loanReqData.business_id.userid});
		userData.loggedInWhiteLabelID = loanReqData.white_label_id;
		userData.pic = "";
		const jwtToken = await new SignJWT({subject: "uuid", user: userData})
			.setProtectedHeader({alg: "EdDSA"})
			.setExpirationTime("1d")
			.sign(private_key);
		return res.send({
			status: "ok",
			userId: userData.id,
			token: jwtToken
		});
	},

	getDetails: async function (req, res) {
		const loan_ref_id = req.param("loan_ref_id"),
			business_id = req.param("business_id"),
			loanDetails = [];
		if (!loan_ref_id || !business_id) {
			return res.badRequest({
				status: "nok",
				nessage: "Loan ref id or Business id is missing."
			});
		}
		const loanData = await LoanrequestRd.findOne({loan_ref_id, business_id}).select(["application_ref", "loanrequestcol"]);
		if (!loanData) {
			return res.badRequest({
				status: "nok",
				nessage: "Invalid Loan ref id."
			});
		}
		const directorData = await Director.find({business: business_id, status: "active"}).select([
			"dfirstname",
			"dlastname",
			"type_name",
			"customer_id",
			"additional_cust_id",
			"dcibil_score", "cibil_remarks"
		]);

		let customerIdStatus = false, customerIdUpdateStatus = false, cbsLoanCreationStatus = false, clapsStatus = false;
		const clapsData = await LosIntegrations.find({loan_id: loanData.id, request_type: ["CLAPS Loan Creation", "CLAPS Customer ID Update"]});
		if (clapsData.length > 0) {
			clapsStatus = clapsData.find(o => o.request_type === "CLAPS Loan Creation" && o.request_status === "success");
			clapsStatus = clapsStatus ? true : false;
		}

		for (const curRecord of directorData) {
			const {dfirstname, dlastname, type_name, customer_id, additional_cust_id, dcibil_score, cibil_remarks} = curRecord,
				applicantName = (dfirstname || "") + (dfirstname && dlastname ? " " : "") + (dlastname || ""),
				typeName = type_name,
				loan_pre_fetch_data = await LoanPreFetch.find({loan_id: loanData.id, director_id: curRecord.id}).select("status").sort("id DESC").limit(1),
				newObject = {
					loan_id: loanData.id,
					director_id: curRecord.id,
					status: null,
					customer_name: applicantName,
					customer_id_status: customerIdStatus,
					customer_id_update_status: customerIdUpdateStatus,
					cbs_loan_creation_status: cbsLoanCreationStatus,
					claps_loan_creation_status: clapsStatus,
					typeName,
					application_ref: loanData.application_ref,
					dcibil_score,
					cibil_remarks: dcibil_score === 0 ? cibil_remarks : null

				};
			if (loan_pre_fetch_data.length > 0) {
				newObject.status = loan_pre_fetch_data[0].status;
			}
			if (customer_id) {
				newObject.customer_id_status = true;
				newObject.customer_id = customer_id;
			}
			if (additional_cust_id && clapsData.length > 0) {
				const custIdUpdate = clapsData.find(o => o.request_type === "CLAPS Customer ID Update" && o.request_id == id);
				newObject.customer_id_update_status = custIdUpdate ? true : false;
				newObject.laps_id = additional_cust_id;
			}
			if (loanData.loanrequestcol) {
				newObject.cbs_loan_creation_status = true;
				newObject.loanrequestcol = loanData.loanrequestcol;
			}
			newObject.losResponse = clapsData;
			loanDetails.push(newObject);
		}
		return res.ok({status: sails.config.msgConstants.OK_STATUS, data: loanDetails});
	}
};
