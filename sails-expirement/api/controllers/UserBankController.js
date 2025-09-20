/**
 * UserBank
 *
 * @description :: Server-side logic for managing UserBank
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const reqParams = require("../helpers/req-params");
const ACCOUNT_NUMBER_REGEX = /^\d{8,18}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Za-z0-9]{6}$/;

module.exports = {
	_config: {
		actions: false,
		shortcuts: false
		// rest: false
	},

	/**
	 * * UserBank index
	 * @description :: UserBank index
	 * @api {get} /userbank/ User Bank index
	 * @apiName UserBank index
	 * @apiGroup UserBank
	 * @apiExample Example usage:
	 * curl -i localhost:1337/userbank/
	 *
	 * @apiSuccess {Number} id user bank id.
	 * @apiSuccess {Number} userid user id.
	 * @apiSuccess {Number} bank_ref_id bank reference id.
	 * @apiSuccess {String} bank_name bank name.
	 * @apiSuccess {String} acc_holder_name account holde name.
	 * @apiSuccess {Number} bank_balance bank balance.
	 * @apiSuccess {String} balance_updated_date_time balance updated date and time.
	 * @apiSuccess {String} acc_no account number.
	 * @apiSuccess {String} ifsc Bank IFSC code.
	 * @apiSuccess {String} acc_type account type.
	 * @apiSuccess {String} yodlee_id
	 * @apiSuccess {Number} status
	 * @apiSuccess {Number} bank_limit_npci npci bank limit.
	 * @apiSuccess {Number} bank_balance_minum minimum bank balance.
	 * @apiSuccess {String} npci_status npci status.
	 * @apiSuccess {String} npci_code npci code.
	 * @apiSuccess {String} npci_date npci date.
	 * @apiSuccess {String} npci_request_date npci request date.
	 * @apiSuccess {String} created_date account created date and time.
	 * @apiSuccess {String} updated_date account updated date (default null).
	 * @apiSuccess {Number} preference
	 * @apiSuccess {String} row_id_ref reference row id.
	 * @apiSuccess {String} madate_status
	 * @apiSuccess {Number} mandate_received_form
	 * @apiSuccess {String} signed_mandate
	 * @apiSuccess {String} mandate_ref
	 * @apiSuccess {String} ocr_file_path ocr file path.
	 * @apiSuccess {String} mandate_file_name
	 * @apiSuccess {String} providerAccountId provider account id.
	 * @apiSuccess {String} mandate_sent_status
	 * @apiSuccess {Number} is_ca_account
	 * @apiSuccess {String} document_url document url.
	 */

	index: async function (req, res, next) {
		UserBankRd.find({userid: req.user["id"]}).exec((err, list) => {
			if (err) {
				return Error("Error");
			}

			return res.send(list);
		});
	},

	show: function (req, res, next) {
		UserBankRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	edit: function (req, res, next) {
		UserBankRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	update: function (req, res, next) {
		UserBank.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("userBank/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		UserBank.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/userBank");
		});
	},

	/**
		  * UserBank
		  * @description :: UserBank Create
		  * @api {post} /userbank/ User Bank
		  * @apiName UserBank-Create
		  * @apiGroup UserBank
		  * @apiExample Example usage:
		  * curl -i localhost:1337/userbank/
		  * @apiParam {Number} bank_id bank_id.
		  * @apiParam {String} bank_name bank_name.
		  * @apiParam {String} acc_no acc_no.
		  * @apiParam {String} acc_holder_name acc_holder_name.
		  * @apiParam {String} ifsc ifsc.
		  * @apiParam {String} acc_type ("Current","Savings")
		  * @apiParam {File} bank_document (upload document)
		  * @apiSuccess {String} message   Successfully Created.
		  * @apiSuccess {Object[]} data list of data.
		  * @apiSuccess {Object} data.encrypted_data Encrypted Data.
		  *   @apiSuccess {String} data.sent_email
		  *  @apiSuccess {String} data.user_refrence_no user reference number.
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
	create: async function (req, res) {
		let data;
		user_whitelabel = req.user.loggedInWhiteLabelID;
		whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel});
		let bucket = whitelabelsolution[0]["s3_name"];
		const region = whitelabelsolution[0]["s3_region"];
		bucket = bucket + "/users_" + req.user["id"];
		let document, uploadFile, updatedUsers;
		// Desc: check leaf is same as bank_document
		document = req.file("bank_document");
		if (document.fieldName != "NOOP_bank_document") {
			uploadFile = await sails.helpers.s3Upload(document, bucket, region);
		}

		const datetime = await sails.helpers.dateTime();

		if (req.body.acc_no && req.body.acc_holder_name && req.body.ifsc && req.body.acc_type && req.body.bank_id) {
			data = {
				userid: req.user["id"],
				bank_ref_id: req.body.bank_id,
				acc_type: req.body.acc_type,
				acc_no: req.body.acc_no,
				acc_holder_name: req.body.acc_holder_name,
				ifsc: req.body.ifsc,
				created_date: datetime,
				updated_date: datetime,
				is_ca_account: 1
			};

			// get bank details,bank_name: req.body.bank_name,
			const bankmaster = await BankMasterRd.findOne({id: req.body.bank_id});
			data.bank_name = bankmaster.bankname;
			const createdRecord = await UserBank.create(data).fetch(),
				logService = await sails.helpers.logtrackservice(req, "userbank", createdRecord.id, "user_bank");
			if (createdRecord) {
				if (req.user.is_corporate == 1) {
					const businessData = await BusinessRd.find({userid: req.user.id})
						.sort("ints DESC")
						.limit(1)
						.populate("business_address");

					if (
						businessData.length > 0 &&
						businessData[0].businessname &&
						businessData[0].business_email &&
						businessData[0].contactno &&
						businessData[0].businesstype &&
						businessData[0].businessstartdate &&
						businessData[0].businesspancardnumber &&
						businessData[0].gstin
					) {
						const businessAddressData = await BusinessaddressRd.find({bid: businessData[0].id});
						console.log(businessAddressData);
						if (businessAddressData.length > 0) {
							updatedUsers = await Users.update({id: req.user["id"]})
								.set({profile_completion: 3})
								.fetch();
						}
					}
				} else {
					updatedUsers = await Users.update({id: req.user["id"]}).set({profile_completion: 3}).fetch();
				}
				if (typeof uploadFile !== "undefined" && uploadFile.length > 0) {
					const updatedUserBankDocument = await UserBank.update({id: createdRecord.id})
						.set({document_url: uploadFile[0].fd})
						.fetch();
				}

				const UserbankDetails = await UserBankRd.find({id: createdRecord.id});
				UserbankDetails[0].profile_completion = updatedUsers[0].profile_completion;
				return res.json({status: "ok", message: "Successfully Created", data: UserbankDetails});
			} else {
				return res.badRequest({exception: "Invalid parameters"});
			}
		} else {
			return res.badRequest({exception: "Invalid parameters"});
		}
	},

	deleteBankAccount: async function (req, res) {
		try {
			const {user_id, user_bank_id} = req.allParams();
			if (!user_id || !user_bank_id)
				return res.send({
					status: "nok",
					statusCode: "NC400",
					message: "Required parameters missing!"
				});
			// validate user exits
			let usersDetails = await UsersRd.findOne({
				where: {id: user_id}
			});
			if (!usersDetails)
				return res.send({
					status: "nok",
					statusCode: "NC400",
					message: "No user with that user_id exists!"
				});

			// update delete status in user_bank table ? need to get a flag

			// check if user is is_corporate or not
			if (!usersDetails.is_corporate)
				return res.send({
					status: "nok",
					statusCode: "NC400",
					message: "Not a corporate user!"
				});

			// check no of active bank rows in userbank table
			let userbankDetails = await UserBankRd.find({
				where: {userid: user_id}
			});

			if (userbankDetails.length === 0) {
				let res = await UsersRd.update({id: user_id})
					.set({
						profile_completion: 0
					})
					.fetch();
			}

			return res.send({
				status: "ok",
				statusCode: "NC200",
				message: "Row deleted succesfully!"
			});
		} catch (err) {
			return res.send({
				status: "nok",
				statusCode: "NC500",
				message: err.message
			});
		}
	},

	/**
	 `  * @description :: UserBank Update
		* @api {post} /userbank/update/ UserBank-Update
		* @apiName UserBank-Update
		* @apiGroup UserBank
		* @apiExample Example usage:
		* curl -i localhost:1337/userbank/update/
		* @apiParam {Number} userbankid id.
		* @apiParam {Number} bank_id bank_id
		* @apiParam {String} bank_name bank_name.
		* @apiParam {String} acc_type ("Current","Savings").
		* @apiParam {String} acc_no acc_no.
		* @apiParam {String} acc_holder_name acc_holder_name.
		* @apiParam {String} ifsc ifsc.
		* @apiParam {File} bank_document (upload document).
		*
		* @apiSuccess {String} message   Successfully Created.
		* @apiSuccess {Object[]} data list of data.
		* @apiSuccess {Number} data.id user bank id.
		* @apiSuccess {Number} data.userid user id.
		* @apiSuccess {Number} data.bank_ref_id bank reference id.
		* @apiSuccess {String} data.bank_name bank name.
		* @apiSuccess {String} data.acc_holder_name account holder name.
		* @apiSuccess {Number} data.bank_balance bank balance.
		* @apiSuccess {String} data.balance_updated_date_time balance updated date time.
		* @apiSuccess {String} data.acc_no account number.
		* @apiSuccess {String} data.ifsc ifsc.
		* @apiSuccess {String} data.acc_type ("Current","Savings").
		* @apiSuccess {String} data.yodlee_id
		* @apiSuccess {Number} data.status status.
		* @apiSuccess {Number} data.bank_limit_npci
		* @apiSuccess {Number} data.bank_balance_minum minimum bank balance.
		* @apiSuccess {String} data.npci_status npci status.
		* @apiSuccess {String} data.npci_code npci code.
		* @apiSuccess {String} data.npci_date npci date.
		* @apiSuccess {String} data.npci_request_date
		* @apiSuccess {String} data.created_date created date.
		* @apiSuccess {String} data.updated_date updated date.
		* @apiSuccess {Number} data.preference
		* @apiSuccess {String} data.row_id_ref
		* @apiSuccess {String} data.madate_status
		* @apiSuccess {Number} data.mandate_received_form
		* @apiSuccess {String} data.signed_mandate
		* @apiSuccess {String} data.mandate_ref
		* @apiSuccess {String} data.ocr_file_path
		* @apiSuccess {String} data.mandate_file_name
		* @apiSuccess {String} data.providerAccountId
		* @apiSuccess {String} data.mandate_sent_status
		* @apiSuccess {Number} data.is_ca_account
		* @apiSuccess {String} data.document_url document url.

	 */

	update: async function (req, res) {
		let data;
		user_whitelabel = req.user.loggedInWhiteLabelID;
		whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel});
		let bucket = whitelabelsolution[0]["s3_name"];
		const region = whitelabelsolution[0]["s3_region"];
		bucket = bucket + "/users_" + req.user["id"];
		let uploadFile;
		const document = req.file("bank_document");
		if (document.fieldName != "NOOP_bank_document") {
			uploadFile = await sails.helpers.s3Upload(document, bucket, region);
		}

		const datetime = await sails.helpers.dateTime();
		bank_name = req.body.bank_name;
		acc_type = req.body.acc_type;
		acc_no = req.body.acc_no;
		acc_holder_name = req.body.acc_holder_name;
		ifsc = req.body.ifsc;
		bank_id = req.body.bank_id;

		// if (
		// req.body.acc_no != '' &&
		// req.body.acc_holder_name != '' &&
		// req.body.ifsc != '' &&
		// bank_id != '' &&
		// req.body.bank_name != '' &&
		// req.body.acc_type != ''
		// ) {
		if (req.body.userbankid && typeof req.body.userbankid !== "undefined") {
			data = {};
			// get bank details,bank_name: req.body.bank_name,
			data.is_ca_account = 1;
			if (acc_type) {
				data.acc_type = acc_type;
			}
			if (acc_no) {
				data.acc_no = acc_no;
			}
			if (acc_holder_name) {
				data.acc_holder_name = acc_holder_name;
			}
			if (ifsc) {
				data.ifsc = ifsc;
			}
			if (bank_id) {
				data.bank_ref_id = bank_id;
				const bankmaster = await BankMasterRd.findOne({id: bank_id});
				data.bank_name = bankmaster.bankname;
			}
			if (uploadFile && uploadFile.length > 0) {
				data.document_url = uploadFile[0].fd;
			}
			if (data != "") {
				const updatedUserBankDocument = await UserBank.update({id: req.body.userbankid}).set(data).fetch(),
					logService = await sails.helpers.logtrackservice(
						req,
						"userbank",
						updatedUserBankDocument[0].id,
						"user_bank"
					),
					updatedUserBankDetails = await UserBankRd.findOne({id: req.body.userbankid});
				return res.json({status: "ok", message: "Successfully updated", data: updatedUserBankDetails});
			}
		} else {
			return res.badRequest({exception: "Invalid parameters"});
		}
		// } else {
		// return res.badRequest({
		//     exception: 'Invalid parameters'
		// });
		// }
	},

	/**
	 `  * @description :: add bank details
		* @api {post} /case-addBankDetails/ add bank details
		* @apiName add bank details
		* @apiGroup Case
		* @apiExample Example usage:
		* curl -i localhost:1337/case-addBankDetails
		*
		* @apiParam {Number} case_id case reference id.
		* @apiParam {String} account_number account number.
		* @apiParam {String} account_type account_type("Current","Savings", "CC/OD").
		* @apiParam {Number} bank_name bank name id.
		* @apiParam {String} account_holder_name account_holder_name.
		* @apiParam {String} cc_limit account limit.
		*
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Successfully Added Bank.

		*
	**/

	add_bank_details: async function (req, res) {
		const {
			account_number,
			account_type,
			cc_limit,
			bank_name,
			account_holder_name,
			start_date,
			end_date,
			ifsc,
			case_id: loan_ref_id
		} = req.body.allParams;

		params = req.allParams();
		fields = ["loan_ref_id", "account_number", "account_type", "bank_name", "account_holder_name"];
		missing = await reqParams.fn(params, fields);

		if (!loan_ref_id || !account_number || !account_type || !bank_name || !account_holder_name) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		LoanrequestRd.findOne({loan_ref_id})
			.then(async (loan_details) => {
				if (!loan_details) {
					throw new Error("invalidCaseOrData");
				}

				const {id, business_id} = loan_details;

				if (!id || id == 0 || !business_id || business_id == 0) {
					throw new Error("couldNotProcessData");
				}

				const datetime = await sails.helpers.dateTime();

				let data1 = {
					loan_id: id,
					business_id,
					fin_type: "Bank Account",
					bank_id: bank_name || 0,
					account_type,
					account_number,
					account_holder_name,
					outstanding_start_date: start_date,
					outstanding_end_date: end_date,
					ints: datetime,
					IFSC: ifsc,
					sanction_drawing_limit: {}
				};

				if (account_type === "CC/OD") {
					data1.account_type = "OD";
					if (cc_limit) {
						data1.account_limit = cc_limit;
					} else {
						throw new Error("missingFields");
					}
				}

				return LoanFinancialsRd.find({
					loan_id: id,
					business_id,
					account_number,
					bank_id: bank_name,
					account_holder_name
				}).then((acc_no) => {
					let bank_data = {};

					if (acc_no.length > 0) {
						bank_data = _.pick(
							acc_no[0],
							"bank_id",
							"account_type",
							"account_number",
							"account_limit",
							"account_holder_name",
							"outstanding_start_date",
							"outstanding_end_date",
							"IFSC"
						);

						sails.config.res.accountExists.data = bank_data;
						throw new Error("accountExists");
					}
					return LoanFinancials.create(data1)
						.fetch()
						.then(async (add_bank) => {
							bank_data = _.pick(
								add_bank,
								"bank_id",
								"account_type",
								"account_number",
								"account_limit",
								"account_holder_name",
								"outstanding_start_date",
								"outstanding_end_date",
								"IFSC"
							);
							data1 = "";
							sails.config.successRes.bankAdded.data = bank_data;
							if (loan_details.white_label_id == sails.config.fedfina_whitelabel_id) {
								return res.ok({
									ecryptesResponse: await sails.helpers.crypto.with({
										action: "aesCbc256Encrypt",
										data: sails.config.successRes.bankAdded
									})
								});
							}
							else return res.ok(sails.config.successRes.bankAdded);
						});
				});
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);
					case "couldNotProcessData":
						return res.badRequest(sails.config.res.couldNotProcessData);
					case "missingFields":
						return res.badRequest(sails.config.res.missingFields);
					case "accountExists":
						return res.badRequest(sails.config.res.accountExists);
					default:
						throw err;
				}
			});
	},

	update_bank_details: async function (req, res) {

		try {
			const {
				section_id,
				account_number,
				account_type,
				cc_limit,
				bank_name,
				account_holder_name,
				start_date,
				end_date,
				ifsc,
			} = req.body;

			if (!section_id) throw new Error("Section_id is mandatory!")

			const loanFinancialsData = await LoanFinancialsRd.findOne({id: section_id});

			if (!loanFinancialsData) throw new Error("The provided section_id doesn't exists!");

			if (loanFinancialsData.enach_status && loanFinancialsData.enach_status != 'failed' && loanFinancialsData.enach_status != 'cancelled')
				throw new Error("Enach has been Initiated for this bank, therefore it cannot be updated!");

			if (account_number && !ACCOUNT_NUMBER_REGEX.test(account_number)) throw new Error("Invalid Account Number!");

			if (ifsc && !IFSC_REGEX.test(ifsc)) throw new Error("Invalid IFSC format!");

			const updateCondition = {};

			//condition only for muthoot enach
			if (sails.config.enach.muthoot.allowedWhiteLabelIds.includes(parseInt(req.user.loggedInWhiteLabelID))) {

				if (loanFinancialsData.IFSC != ifsc || loanFinancialsData.account_number != account_number ||
					loanFinancialsData.account_holder_name != account_holder_name ||
					loanFinancialsData.account_type != account_type || loanFinancialsData.bank_id != bank_name) {
					let bankTrackData = loanFinancialsData.bank_track_data;
					if (!bankTrackData || !bankTrackData.trackData) {
						bankTrackData = {
							trackData: []
						};
					}

					bankTrackData.trackData.push(loanFinancialsData);

					updateCondition.bank_track_data = bankTrackData;
					updateCondition.bank_verification_flag = 'unverified';
					updateCondition.bank_verification_status = null;
				}

			}

			if (bank_name) updateCondition.bank_id = bank_name;
			if (account_type) updateCondition.account_type = account_type;
			if (account_number) updateCondition.account_number = account_number;
			if (account_holder_name) updateCondition.account_holder_name = account_holder_name;
			if (start_date) updateCondition.outstanding_start_date = start_date;
			if (end_date) updateCondition.outstanding_end_date = end_date;
			if (ifsc) updateCondition.IFSC = ifsc;


			if (account_type === "CC/OD") {
				updateCondition.account_type = "OD";
				if (cc_limit) {
					updateCondition.account_limit = cc_limit;
				} else {
					throw new Error("missingFields");
				}
			}

			await LoanFinancials.updateOne({id: section_id}).set(updateCondition);

			return res.send({
				status: "ok",
				message: "Updated successfully!"
			});

		} catch (error) {

			return res.badRequest({
				status: "nok",
				message: error.message
			})

		}

	},

	/**
	 `  * @description :: add bank details for UIUX
		* @api {post} /addBankDetailsUiux/ add bank details uiux
		* @apiName add bank details uiux
		* @apiGroup UserBank
		* @apiExample Example usage:
		* curl -i localhost:1337/addBankDetailsUiux
		*
		* @apiParam {Number} case_id case reference id.
		* @apiParam {String} account_number account number.
		* @apiParam {String} account_type account_type("Current","Savings", "CC/OD").
		* @apiParam {Number} bank_name bank name id.
		* @apiParam {String} account_holder_name account_holder_name.
	  * @apiParam {String} start_date
	  * @apiParam {String} end_date
	  * @apiParam {String} limit_type ['Fixed', 'Variable']
	  * @apiParam {String[]} sanction_limit
	  * @apiParam {String[]} drawing_limit
	  * @apiParam {String} IFSC
	  *
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Successfully Added Bank.
	  * @apiSuccess {Object} data created data list
		*
	**/

	add_bank_details_uiux: async function (req, res) {
		const moment = require("moment");
		const monthArray = [],
			sanction_val = [];
		let sanctionLimit,
			drawingLimit,
			{
				account_number,
				account_type,
				bank_name,
				account_holder_name,
				start_date,
				end_date,
				limit_type,
				sanction_limit,
				drawing_limit,
				case_id: loan_ref_id,
				IFSC
			} = req.allParams();
		params = req.allParams();
		fields = ["loan_ref_id", "account_number", "account_type", "bank_name", "account_holder_name"];
		missing = await reqParams.fn(params, fields);

		if (!loan_ref_id || !account_number || !account_type || !bank_name || !account_holder_name) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		LoanrequestRd.findOne({loan_ref_id})
			.then(async (loan_details) => {
				const datetime = await sails.helpers.dateTime();
				if (!loan_details) {
					throw new Error("invalidCaseOrData");
				}
				if (req.user.loggedInWhiteLabelID !== loan_details.white_label_id ||
					(wt_data.loans && !wt_data.loans.add_bank)) {
					return res.badRequest({
						status: "nok",
						message: "You are now allowed to perform this action."
					});
				}

				const {id, business_id} = loan_details;
				if (!id || id == 0 || !business_id || business_id == 0) {
					throw new Error("couldNotProcessData");
				}

				let data1 = {
					loan_id: id,
					business_id,
					fin_type: "Bank Account",
					bank_id: bank_name || 0,
					account_type,
					account_number,
					account_holder_name,
					outstanding_start_date: start_date,
					outstanding_end_date: end_date,
					ints: datetime,
					IFSC
				};
				data1.account_limit = 0;
				data1.sanction_drawing_limit = [];
				if (account_type === "CC" || account_type === "OD") {
					if (start_date && end_date) {
						start_date = moment(start_date, "MMM-YY");
						end_date = moment(end_date, "MMM-YY");
						for (let i = start_date; i.isSameOrBefore(end_date); i.add(1, "month")) {
							const month = moment(i, "MM-DD-YYYY").format("MMM-YY");
							if (monthArray.indexOf(month) == -1) {
								monthArray.push(month);
							}
						}
					}
					if (sanction_limit) {
						sanctionLimit = sanction_limit.slice(0, monthArray.length);
					}
					if (drawing_limit) {
						drawingLimit = drawing_limit.slice(0, monthArray.length);
					}
					if (sanction_limit && sanction_limit.length > 0 && limit_type) {
						if (account_type === "OD" && limit_type === "Fixed") {
							data1.account_limit = sanction_limit[0];
							data1.limit_type = limit_type;
							data1.sanction_drawing_limit = [];
						} else if (account_type === "OD" && limit_type === "Variable") {
							data1.account_limit = 0;
							data1.limit_type = limit_type;
							_.each(sanctionLimit, (value) => {
								sanction_val.push({sanction: value});
							});
							data1.sanction_drawing_limit = {
								account_limit_details: sanction_val
							};
						} else if (account_type === "CC" && limit_type === "Fixed") {
							data1.account_limit = sanction_limit[0];
							data1.limit_type = limit_type;
							_.each(drawingLimit, (value) => {
								sanction_val.push({sanction: null, drawing_power: value});
							});
							sanction_val[0].sanction = sanction_limit[0];
							data1.sanction_drawing_limit = {
								account_limit_details: sanction_val
							};
						} else if (account_type === "CC" && limit_type === "Variable") {
							data1.account_limit = 0;
							data1.limit_type = limit_type;

							for (let i = 0; i < sanctionLimit.length; i++) {
								sanction_val.push({sanction: sanctionLimit[i], drawing_power: drawingLimit[i]});
							}

							data1.sanction_drawing_limit = {
								account_limit_details: sanction_val
							};
						}
					}
				}
				return LoanFinancialsRd.find({
					loan_id: id,
					business_id,
					account_number,
					bank_id: bank_name,
					account_holder_name
				}).then((acc_no) => {
					let bank_data = {};
					if (acc_no.length > 0) {
						bank_data = _.pick(
							acc_no[0],
							"bank_id",
							"account_type",
							"account_number",
							"account_limit",
							"account_holder_name",
							"outstanding_start_date",
							"outstanding_end_date"
						);
						sails.config.res.accountExists.data = bank_data;
						throw new Error("accountExists");
					}
					return LoanFinancials.create(data1)
						.fetch()
						.then((add_bank) => {
							data1 = "";
							sails.config.successRes.bankAdded.data = add_bank;
							return res.ok(sails.config.successRes.bankAdded);
						});
				});
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);
					case "couldNotProcessData":
						return res.badRequest(sails.config.res.couldNotProcessData);
					case "missingFields":
						return res.badRequest(sails.config.res.missingFields);
					case "accountExists":
						return res.badRequest(sails.config.res.accountExists);
					default:
						throw err;
				}
			});
	},

	/**
	 `  * @description :: get bank details
		* @api {get} /getBankDetails/ get bank details
		* @apiName get bank details
		* @apiGroup UserBank
		* @apiExample Example usage:
		* curl -i localhost:1337/getBankDetails
		*
		*
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Successfully listed.
		* @apiSuccess {Object[]} data

		*
	**/
	getBankDetails: async function (req, res) {
		const loan_details = await LoanrequestRd.find({createdUserId: req.user.id}),
			data = [];
		if (loan_details.length > 0) {
			await Promise.all(
				loan_details.map(async (element) => {
					const {id, business_id} = element;
					if (!id || id == 0 || !business_id || business_id == 0) {
						return res.badRequest(sails.config.res.couldNotProcessData);
					}

					const bankData = await LoanFinancialsRd.find({loan_id: id, business_id});
					if (bankData.length > 0) {
						data.push(bankData);
					}
				})
			);
			if (data) {
				sails.config.successRes.listedSuccess.data = data;
				return res.ok(sails.config.successRes.listedSuccess);
			} else {
				sails.config.res.noDataAvailableId.message = "No data available";
				sails.config.res.noDataAvailableId.data = [];
				return res.ok(sails.config.res.noDataAvailableId);
			}
		}
	},

	add_bank_details_ncbiz: async function (req, res) {
		const {
			account_number,
			account_type,
			bank_name,
			account_holder_name,
			case_id: loan_ref_id,
			IFSC
		} = req.allParams();

		params = req.allParams();
		fields = ["loan_ref_id", "account_number", "IFSC", "bank_name", "account_holder_name"];
		missing = await reqParams.fn(params, fields);

		if (!loan_ref_id || !account_number || !IFSC || !bank_name || !account_holder_name) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		LoanrequestRd.findOne({loan_ref_id})
			.then(async (loan_details) => {
				const datetime = await sails.helpers.dateTime();
				if (!loan_details) {
					throw new Error("invalidCaseOrData");
				}

				const {id, business_id} = loan_details;
				if (!id || id == 0 || !business_id || business_id == 0) {
					throw new Error("couldNotProcessData");
				}

				let data1 = {
					loan_id: id,
					business_id,
					fin_type: "Bank Account",
					bank_id: bank_name,
					account_type,
					account_number,
					account_holder_name,
					ints: datetime,
					sanction_drawing_limit: {},
					IFSC
				};

				return LoanFinancialsRd.find({
					loan_id: id,
					business_id,
					account_number,
					bank_id: bank_name,
					account_holder_name
				}).then((acc_no) => {
					let bank_data = {};
					if (acc_no.length > 0) {
						bank_data = _.pick(
							acc_no[0],
							"bank_id",
							"account_type",
							"account_number",
							"account_limit",
							"account_holder_name",
							"outstanding_start_date",
							"outstanding_end_date"
						);
						sails.config.res.accountExists.data = bank_data;
						throw new Error("accountExists");
					}
					return LoanFinancials.create(data1)
						.fetch()
						.then((add_bank) => {
							data1 = "";
							sails.config.successRes.bankAdded.data = add_bank;
							return res.ok(sails.config.successRes.bankAdded);
						});
				});
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);
					case "couldNotProcessData":
						return res.badRequest(sails.config.res.couldNotProcessData);
					case "accountExists":
						return res.ok(sails.config.res.accountExists);
					default:
						throw err;
				}
			});
	},
	/**
	 `  * @description :: add bank details NEW
		* @api {post} /addBankDetailsNew/ add bank details new
		* @apiName add bank details new
		* @apiGroup UserBank
		* @apiExample Example usage:
		* curl -i localhost:1337/addBankDetailsNew
		*
		* @apiParam {Number} case_id case reference id.
		* @apiParam {String} account_number account number.
		* @apiParam {String} account_type account_type("Current","Savings", "CC","OD").
		* @apiParam {Number} bank_name bank name id.
		* @apiParam {String} account_holder_name account_holder_name.
	  * @apiParam {String} start_date
	  * @apiParam {String} end_date
	  * @apiParam {Object[]} emiDetails
	  *
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Successfully Added Bank.
	  * @apiSuccess {Object} data created data list
		*
	**/
	add_bank_details_demo: async function (req, res) {
		let reqData = req.allParams();
		let {
			account_number,
			account_type,
			bank_name,
			account_holder_name,
			case_id: loan_ref_id,
			start_date,
			end_date,
			emiDetails,
			ifsccode,
			fin_id,
			IFSC,
			business_id,
			outstanding_start_date,
			outstanding_end_date,
			loan_id
		} = reqData.data && reqData.data.bank_details ? reqData.data.bank_details : reqData;
		emiDetails = reqData.data ? reqData.data.emi_details : emiDetails;
		fin_id = reqData.data ? reqData.data.fin_id : fin_id;
		loan_ref_id = reqData.loan_ref_id || loan_ref_id;
		bank_name = reqData.data && reqData.data.bank_details ? reqData.data.bank_details.bank_id : bank_name;
		params = req.allParams();
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);

		if (!loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		LoanrequestRd.findOne({loan_ref_id})
			.then(async (loan_details) => {
				if (req.user.loggedInWhiteLabelID !== loan_details.white_label_id ||
					(wt_data.loans && !wt_data.loans.add_bank)) {
					return res.badRequest({
						status: "nok",
						message: "You are now allowed to perform this action."
					});
				}
				const datetime = await sails.helpers.dateTime();
				if (!loan_details) {
					throw new Error("invalidCaseOrData");
				}

				const {id, business_id} = loan_details;
				if (!id || id == 0 || !business_id || business_id == 0) {
					throw new Error("couldNotProcessData");
				}

				let data1 = {
					loan_id: id,
					business_id,
					fin_type: "Bank Account",
					bank_id: bank_name || 0,
					account_type,
					account_number,
					account_holder_name,
					outstanding_start_date: start_date || outstanding_start_date,
					outstanding_end_date: end_date || outstanding_end_date,
					ints: datetime,
					sanction_drawing_limit: {},
					IFSC: ifsccode || IFSC
				};
				if (emiDetails && emiDetails.length > 0) {
					data1.fin_type = "Outstanding Loans";
					data1.emi_details = JSON.stringify(emiDetails);
					if (fin_id) {
						const financialData = await LoanFinancialsRd.findOne({id: fin_id, business_id, loan_id});
						if (financialData) {
							//updating data in db
							const updateFinancialData = await LoanFinancials.update({id: fin_id, business_id, loan_id})
								.set(data1)
								.fetch();
							sails.config.successRes.dataUpdated.data = updateFinancialData;
							return res.ok(sails.config.successRes.dataUpdated);
						} else {
							return res.badRequest(sails.config.res.noDataAvailableId);
						}
					} else {
						trackData = await sails.helpers.onboardingDataTrack(id, business_id, "", req.user.id, reqData.section_id, "");
						//insertion of data into db
						return LoanFinancials.create(data1)
							.fetch()
							.then((add_bank) => {
								data1 = "";
								sails.config.successRes.bankAdded.data = add_bank;
								return res.ok(sails.config.successRes.bankAdded);
							});
					}
				} else {
					if (fin_id) {
						const financialData = await LoanFinancialsRd.findOne({id: fin_id, business_id, loan_id});
						if (financialData) {
							//updating data in db
							const updateFinancialData = await LoanFinancials.update({id: fin_id, business_id, loan_id})
								.set(data1)
								.fetch();
							return res.send({
								status: "ok",
								message: "Data Updated successfully",
								data: updateFinancialData
							});
						} else {
							return res.send({
								status: "nok",
								message: "Invalid id"
							});
						}
					} else {
						if (!account_number || !bank_name || !account_holder_name) {
							return res.badRequest(sails.config.res.missingFields);
						}
						trackData = await sails.helpers.onboardingDataTrack(id, business_id, "", req.user.id, reqData.section_id, "");
						return LoanFinancialsRd.find({
							loan_id: id,
							business_id,
							account_number,
							bank_id: bank_name,
							account_holder_name,
							IFSC: ifsccode
						}).then((acc_no) => {
							let bank_data = {};
							if (acc_no.length > 0) {
								bank_data = _.pick(
									acc_no[0],
									"bank_id",
									"account_type",
									"account_number",
									"account_limit",
									"account_holder_name",
									"outstanding_start_date",
									"outstanding_end_date",
									"IFSC"
								);
								sails.config.res.accountExists.data = bank_data;
								throw new Error("accountExists");
							}
							return LoanFinancials.create(data1)
								.fetch()
								.then((add_bank) => {
									data1 = "";
									sails.config.successRes.bankAdded.data = add_bank;
									return res.ok(sails.config.successRes.bankAdded);
								});
						});
					}
				}
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);
					case "couldNotProcessData":
						return res.badRequest(sails.config.res.couldNotProcessData);
					case "accountExists":
						return res.ok(sails.config.res.accountExists);
					default:
						throw err;
				}
			});
	},

	add_bank_details_demo_fetch: async function (req, res) {
		let {loan_ref_id, business_id, director_id} = req.allParams();

		params = {loan_ref_id, business_id};
		fields = ["loan_ref_id", "business_id"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loan_details = await LoanrequestRd.findOne({loan_ref_id});

		if (!loan_details) {
			return res.badRequest({
				status: "nok",
				message: "no record found"
			});
		}

		const financialData = await LoanFinancialsRd.find({business_id, loan_id: loan_details.loan_id});

		if (!financialData) {
			return res.badRequest({
				status: "nok",
				message: "no record found"
			});
		}

		let bankDetails = [],
			emiDetails = [];
		for (i in financialData) {
			if (financialData[i].fin_type === "Bank Account") {
				bankDetails.push(financialData[i]);
			} else emiDetails.push(financialData[i]);
		}

		if (emiDetails.length > 0 || bankDetails.length > 0) {
			return res.ok({
				status: "ok",
				message: "Data fetched successfully",
				data: {
					emiDetails,
					bankDetails
				}
			});
		} else {
			return res.ok({
				status: "ok",
				data: {
					emiDetails,
					bankDetails
				}
			});
		}
	},
	bank_details: async function (req, res) {
		let reqData = req.allParams();
		let bankDetails = [];
		let message;
		if (reqData.data.bank_details && reqData.data.bank_details.length > 0) {
			for (obj of reqData.data.bank_details) {
				data = {
					bank_id: obj.bank_id || 0,
					account_number: obj.account_number,
					IFSC: obj.IFSC,
					director_id: obj.director_id,
					account_type: obj.account_type,
					account_holder_name: obj.account_holder_name,
					outstanding_start_date: obj.outstanding_start_date,
					outstanding_end_date: obj.outstanding_end_date,
					loan_id: reqData.loan_id,
					remaining_loan_tenure: obj.remaining_loan_tenure || null,
					business_id: reqData.business_id,
					sanction_drawing_limit: {},
					fin_type: "Bank Account",
					customer_id: obj.customer_id || null,
					open_bank_account: obj.open_bank_account == 'true' ? 'Yes' : 'No',
					opened_in: obj.opened_in || null,
					branch: obj.branch || null,
					updated_by: req.user.id,
					ints: await sails.helpers.dateTime()
				};
				if (obj.id) {

					//condition only for muthoot enach
					if (sails.config.enach.muthoot.allowedWhiteLabelIds.includes(parseInt(req.user.loggedInWhiteLabelID))) {

						const loanFinancialsData = await LoanFinancialsRd.findOne({id: obj.id});
						if (loanFinancialsData) {

							if (loanFinancialsData.enach_status && loanFinancialsData.enach_status != 'failed' && loanFinancialsData.enach_status != 'cancelled')
								return res.send({
									status: "nok",
									message: "Enach has been Initiated for this bank, therefore it cannot be updated!"
								});

							if (loanFinancialsData.bank_id != obj.bank_id || loanFinancialsData.account_holder_name != obj.account_holder_name ||
								loanFinancialsData.IFSC != obj.IFSC || loanFinancialsData.account_number != obj.account_number ||
								loanFinancialsData.account_type != obj.account_type) {
								let bankTrackData = loanFinancialsData.bank_track_data;
								if (!bankTrackData || !bankTrackData.trackData) {
									bankTrackData = {
										trackData: []
									};
								}

								bankTrackData.trackData.push(loanFinancialsData);

								// await LoanFinancials.updateOne({id: obj.id}).set({
								// 	bank_track_data: bankTrackData,
								// 	bank_verification_flag: 'unverified'
								// });

								data.bank_track_data = bankTrackData;
								data.bank_verification_flag = 'unverified';
								data.bank_verification_status = null;

							}
						}


					}

					//For Audit Trail
					try {
						const existing_data = await LoanFinancialsRd.findOne({id: obj.id});
						let old_bank_details = {};
						let new_bank_details = {};
						let audit_trail = {};
						if (existing_data.director_id) {
							let director = await DirectorRd.findOne({id: existing_data.director_id}).select(["dfirstname", "middle_name", "dlastname"]);
							if (director.middle_name) director.fullName = director.dfirstname + " " + director.middle_name + " " + director.dlastname;
							else director.fullName = director.dfirstname + " " + director.dlastname;
							old_bank_details.director = director.fullName;
						}
						if (data.director_id) {
							let director = await DirectorRd.findOne({id: data.director_id}).select(["dfirstname", "middle_name", "dlastname"]);
							if (director.middle_name) director.fullName = director.dfirstname + " " + director.middle_name + " " + director.dlastname;
							else director.fullName = director.dfirstname + " " + director.dlastname;
							new_bank_details.director = director.fullName;
						}
						if (existing_data.bank_id) {
							const {bank} = await BanktblRd.findOne({id: existing_data.bank_id}).select("bank");
							old_bank_details.bank = bank;
						}
						if (data.bank_id) {
							const {bank} = await BanktblRd.findOne({id: data.bank_id}).select("bank");
							new_bank_details.bank = bank;
						}
						if (existing_data.branch) old_bank_details.branch = existing_data.branch;
						if (existing_data.IFSC) old_bank_details.IFSC = existing_data.IFSC;
						if (existing_data.account_type) old_bank_details.account_type = existing_data.account_type;
						if (existing_data.account_number) old_bank_details.account_number = existing_data.account_number;
						if (existing_data.account_holder_name) old_bank_details.account_holder_name = existing_data.account_holder_name;
						if (existing_data.updated_by) {
							updated_by_user = await UsersRd.findOne({id: existing_data.updated_by});
							old_bank_details.created_userID = updated_by_user.id;
							old_bank_details.created_employeeID = updated_by_user.user_reference_no;
						}
						new_bank_details.created_at = existing_data.ints;
						if (obj.branch) new_bank_details.branch = obj.branch;
						if (obj.IFSC) new_bank_details.IFSC = obj.IFSC;
						if (obj.account_type) new_bank_details.account_type = obj.account_type;
						if (obj.account_number) new_bank_details.account_number = obj.account_number;
						if (obj.account_holder_name) new_bank_details.account_holder_name = obj.account_holder_name;
						if (data.updated_by) {
							updated_by_user = await UsersRd.findOne({id: data.updated_by});
							new_bank_details.created_userID = updated_by_user.id;
							new_bank_details.created_employeeID = updated_by_user.user_reference_no;
						}
						new_bank_details.created_at = data.ints;
						const current_timestamp = await sails.helpers.dateTime();
						const audit_trail_obj = {
							new_bank_details,
							old_bank_details,
							last_edited_userID: req.user.id,
							last_edited_employeeID: req.user.user_reference_no,
							last_edited_at: current_timestamp
						}
						if (existing_data.audit_trail) {
							audit_trail = JSON.parse(existing_data.audit_trail);
						}
						audit_trail[current_timestamp] = audit_trail_obj;
						data.audit_trail = JSON.stringify(audit_trail);
					}
					catch (error) {
						return res.serverError({
							status: "nok",
							message: "Something went wrong in Audit Trail!",
							error: error
						})
					}
					//Audit Trail Ends here
					data.data_update_flag = 1
					updatedRecord = await LoanFinancials.update({id: obj.id}).set(data).fetch();
					bankDetails.push(updatedRecord);
					message = sails.config.successRes.dataUpdated;
				} else {
					trackData = await sails.helpers.onboardingDataTrack(reqData.loan_id, reqData.business_id, "", req.user.id, reqData.section_id, "");
					createdRecord = await LoanFinancials.create(data).fetch();
					bankDetails.push(createdRecord);
					message = sails.config.successRes.bankAdded;
				}
			}
			message.data = bankDetails;
			return res.ok(message);
		} else {
			return res.badRequest({status: "nok", message: sails.config.msgConstants.bankDetailsMissing});
		}
	},
	bank_details_fetch: async function (req, res) {
		let {business_id} = req.allParams();
		params = {business_id};
		fields = ["business_id"];
		missing = await reqParams.fn(params, fields);
		if (!business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let bankDetails = await LoanFinancialsRd.find({business_id, fin_type: ["Bank Account"], status: "active"});
		if (bankDetails.length > 0) {

			//setting the open_bank_account field to true or false based on whether it is Yes or No in DB
			if (bankDetails[0].open_bank_account) {

				bankDetails[0].open_bank_account = bankDetails[0].open_bank_account == 'Yes' ? 'true' : 'false';

			}
			message = sails.config.successRes.bankListDisplayed;
			message.data = bankDetails;
			return res.ok(message);
		} else {
			message = sails.config.res.noBankDetails;
			message.data = [];
			return res.badRequest(message);
		}
	}
};
