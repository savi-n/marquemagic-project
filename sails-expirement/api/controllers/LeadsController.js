/**
 * LeadController
 *
 * @description :: Server-side logic for managing LeadController
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


/**
 * @api {get} /Lead/Controller/ Lead Controller
 * @apiName lead Controller
 * @apiGroup Leads
 * @apiExample Example usage:
 * curl -i localhost:1337/Lead/Controller/
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {String} name name.
 * @apiSuccess {String} address address.
 * @apiSuccess {String} phone phone.
 * @apiSuccess {String} city city.
 * @apiSuccess {String} search_text search_text.
 * @apiSuccess {Number} type type.
 * @apiSuccess {Number} lead_status_id.
 * @apiSuccess {String} lead_category.
 * @apiSuccess {Number} originator.
 * @apiSuccess {String} assignee.
 * @apiSuccess {String} created_time.
 * @apiSuccess {String} updated_time.
 * @apiSuccess {Number} update_user.
 * @apiSuccess {Number} true_caller_verified.
 * @apiSuccess {String} true_caller_name.
 * @apiSuccess {String} email.
 * @apiSuccess {String} true_caller_location.
 * @apiSuccess {Number} white_label_id.
 * @apiSuccess {String} source.
 * @apiSuccess {String} channel_type.
 * @apiSuccess {Number} notification_purpose.
 * @apiSuccess {String} notification_flag.
 * @apiSuccess {String} note.
 * @apiSuccess {String} origin.
 * @apiSuccess {Number} channel_user.
 * @apiSuccess {Number} userid
 *
 */
const AWS = require("aws-sdk");
s3 = new AWS.S3({accessKeyId: sails.config.aws.key, secretAccessKey: sails.config.aws.secret});
fs = require("fs");
path = require("path");
const md5 = require("md5");

module.exports = {
	leadsCreate: async function (req, res) {
		datetime = await sails.helpers.dateTime();
		const mobileNo = req.body.mobileNo;
		customerNo = req.body.customerNo;
		if (!mobileNo && !customerNo) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
		condition = {
			white_label_id: req.body.white_label_id
		};
		if (mobileNo) {
			condition.phone = mobileNo;
		}
		if (customerNo) {
			condition.customer_id = customerNo;
		}
		if (req.body.panNo) {
			condition.panNo = req.body.panNo;
		}
		leadCheckData = await Leads.find(condition).sort("id DESC");
		leadCheckData = leadCheckData[0];
		if (leadCheckData) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.mobileNoExists,
				data: leadCheckData
			});
		}
		const createObj = {
			phone: req.body.mobileNo,
			panNo: req.body.panNo ? req.body.panNo : "",
			equifax_score: req.body.equifax_score ? req.body.equifax_score : 0,
			branchId: req.body.branch_id ? req.body.branch_id : "",
			white_label_id: req.body.white_label_id ? req.body.white_label_id : 0,
			userid: req.body.userId ? req.body.userId : 0,
			equifax_json: req.body.equifax_json ? JSON.stringify(req.body.equifax_json) : null,
			created_time: datetime,
			updated_time: datetime,
			onboarding_count: 1,
			branch_id: req.body.branch_id ? req.body.branch_id: "",
			email: req.body.email ? req.body.email : "",
			customer_id: customerNo || "",
			origin: req.body.origin || "PHP_portal"
		};
		leadData = await Leads.create(createObj).fetch();
		if (!leadData) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.invalidData
			});
		}
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.leadDataCreated,
			data: leadData
		});
	},

	leadsFetch: async function (req, res) {
		const moment = require("moment");
		const updated_time = moment()
			.subtract(parseInt(req.query.noOfDays), "days")
			.startOf("day")
			.format("YYYY-MM-DD HH:mm:ss");
		console.log(req.query, updated_time);
		await LeadsRd.find({
			white_label_id: req.query.white_label_id,
			branch_id: req.query.branch_id,
			updated_time: {">=": updated_time}
		})
			.limit(100)
			.exec((err, list) => {
				if (err) {
					return res.ok({
						status: "nok",
						message: sails.config.msgConstants.leadsFetchFailed,
						data: err
					});
				}
				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.leadsFetchSuccessful,
					data: list
				});
			});
	},

	leadsUpdate: async function (req, res) {
		datetime = await sails.helpers.dateTime();
		const {
			leadId,
			name,
			address,
			phone,
			city,
			email,
			panNo,
			equifax_json,
			white_label_id,
			equifax_score,
			branch_id,
			origin
		} = req.allParams();
		if (!leadId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const leadFetch = await Leads.findOne({id: leadId});
		if (!leadFetch) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.invalidId
			});
		}
		data = {};
		if (name || address || phone || city || email || panNo || equifax_json || equifax_score || branch_id) {
			data.name = name || leadFetch.name;
			data.address = address || leadFetch.address;
			data.phone = phone || leadFetch.phone;
			data.city = city || leadFetch.city;
			data.email = email || leadFetch.email;
			data.panNo = panNo || leadFetch.panNo;
			data.updated_time = datetime;
			data.onboarding_count = leadFetch.onboarding_count + 1;
			data.equifax_json = JSON.stringify(equifax_json) || leadFetch.equifax_json;
			data.white_label_id = white_label_id || leadFetch.white_label_id;
			data.equifax_score = equifax_score || leadFetch.equifax_score;
			data.branch_id = branch_id || leadFetch.branch_id;
		}
		if (origin == "CUB_portal") {
			data.lead_status_id = 2;
		}

		const updatedLead = await Leads.update({id: leadId}).set(data).fetch();
		if (updatedLead && updatedLead.length > 0) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.successfulUpdation,
				data: updatedLead
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.updateFailedTryLater
			});
		}
	},

	equifaxFetch: async function (req, res) {
		const {firstName, lastName, inquiryAddresses, dob, panNumber, mobileNo, origin, requested_by} = req.allParams();
		if (!firstName || !lastName || !inquiryAddresses || !dob || !panNumber || !mobileNo) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const generatedURL = null;
		const moment = require("moment");
		date = moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss");
		datetime = await sails.helpers.dateTime();
		const leadsData = await LeadsRd.find({phone: mobileNo, panNo: panNumber}).sort("updated_time DESC").limit(1);
		if (leadsData.length === 0){
			return res.badRequest({
				status : "nok",
				message : "Lead record is not created, please crete and pull equifax."
			});
		}
		requestManageData = {
			loan_id: 0,
			white_label_id: leadsData[0].white_label_id,
			request_start_time: datetime,
			request_end_time: datetime,
			requested_by: requested_by || 0,
			status: "Requested",
			request_type: "Equifax",
			reference_id: leadsData[0].id,
			json_value: JSON.stringify(req.allParams()),
			error_msg: "",
			request_origin: origin || "PHP_portal"
		};
		const s3Region = await WhiteLabelSolutionRd.find({id: leadsData[0].white_label_id});
		const bucket = s3Region[0].s3_name;
		key = `equifax/${leadsData[0].id}.html`;
		keyxml = `equifax/${leadsData[0].id}.xml`;

		let requestManageCreate;
		if (
			leadsData.length > 0 &&
			leadsData[0].equifax_json &&
			leadsData[0].equifax_score && leadsData[0].equifax_score != 0 &&
			leadsData[0].s3_doc_name != null &&
			moment(leadsData[0].updated_time).format("YYYY-MM-DD HH:mm:ss") >= date
		) {
			fileUrl = await s3.getSignedUrl("getObject", {
				Bucket: bucket,
				Key: leadsData[0].s3_doc_name
			});
			requestManageData.reference_name = "cashing";
			requestManageCreate = await RequestManager.create(requestManageData).fetch();
			return res.ok({
				statusCode: "NC200",
				message: "Equifax Data",
				equifaxData: leadsData[0].equifax_json,
				cibilScore: leadsData[0].equifax_score,
				url: fileUrl
			});
		} else {
			InputData = {
				firstName,
				lastName,
				inquiryAddresses,
				dob,
				panNumber,
				inquiryPhones: mobileNo
			};
			const equifaxData = await sails.helpers.equifax(InputData);

			const params = {
				Bucket: bucket,
				Key: key,
				Body: equifaxData.htmlContent
			};
			const paramsxml = {
				Bucket: bucket,
				Key: keyxml,
				Body: equifaxData.equifaxData
			}
			// To upload HTML and XML files to s3.
			xmlfileUrl = await upload_and_fetch(paramsxml);
			fileUrl = await upload_and_fetch(params);
			equifaxData.url = fileUrl;

			const updatedLead = await Leads.update({id: leadsData[0].id})
				.set({
					equifax_json: keyxml,
					equifax_score: equifaxData.cibilScore,
					s3_doc_name: key
				}).fetch();
			requestManageData.reference_name = "equifax API";
			requestManageData.error_msg = equifaxData.ErrorMessage || equifaxData.message || "";
			requestManageCreate = await RequestManager.create(requestManageData).fetch();
			equifaxData.equifaxData = keyxml;
			equifaxData.url = fileUrl;
			return res.ok(equifaxData);
		}
	},

	equifaxUpload: async function (req, res) {
		const fs = require("fs"),
			xml2js = require("xml2js"),
			path = require("path"),
			xmlParser = require("xml2json"),
			AWS = require("aws-sdk");
		s3 = new AWS.S3({
			accessKeyId: sails.config.aws.key,
			secretAccessKey: sails.config.aws.secret,
			region: sails.config.aws.region
		});
		const {userId, bucket, email, phoneNo, panNumber, loan_id, businessId, white_label_id} = req.allParams();
		if (!userId || !bucket || !email || !phoneNo || !panNumber || !loan_id || !businessId) {
			return res.badRequest(sails.config.res.missingFields);
		}
		leadsFetch = await Leads.findOne({
			email: email,
			phone: phoneNo,
			panNo: panNumber,
			white_label_id: white_label_id
		});
		if (leadsFetch) {
			leadsUpdate = await Leads.update({
				id: leadsFetch.id
			})
				.set({lead_status_id: 2, userid: userId})
				.fetch();
			if (leadsFetch.equifax_json) {
				const clientRes = JSON.parse(leadsFetch.equifax_json);

				builder = new xml2js.Builder();
				xml = builder.buildObject(clientRes);
				logPath = path.join(__dirname, `../../equifaxfiles/${userId}.xml`);
				bodyData = (logPath, {headers: "key"});

				fs.writeFile(logPath, xml, async (err) => {
					if (err) {
						console.log("err------------", err);
					} else {
						const params = {
							Bucket: bucket,
							Key: `equifax/${userId}.xml`,
							Body: fs.createReadStream(logPath)
						};

						s3.upload(params, async (err, data) => {
							if (err) {
								return res.badRequest(err);
							}
							loanDocCreate = await LoanDocument.create({
								loan: loan_id,
								business_id: businessId,
								user_id: userId,
								doctype: sails.config.docUpload.equifaxDocId,
								doc_name: data.key,
								uploaded_doc_name: data.key,
								original_doc_name: data.key,
								ints: await sails.helpers.dateTime(),
								upload_method_type: "Equifax_API",
								on_upd: await sails.helpers.dateTime()
							}).fetch();
							return res.ok({
								statusCode: "NC200",
								message: sails.config.msgConstants.successfulUpdation,
								uploadDoc: loanDocCreate,
								updatedData: leadsUpdate
							});
						});

						fs.unlink(logPath, (err) => {
							if (err) {
								console.log("Eqfax --", err);
							}
						});
					}
				});
			}
		}
	},

	sendOTP: async function (req, res) {
		const mobile = req.body.mobile;
		if (!mobile) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const randomTwoUnique = Math.floor(Math.random() * (+99 - +10)) + +10;
		uniqTimeStamp = Math.round(new Date().getTime() / 1000);
		uniqueRandomId = "" + uniqTimeStamp + randomTwoUnique;
		generateOtp = Math.floor(100000 + Math.random() * 900000);

		//verify mobile number exist or not
		// eslint-disable-next-line max-len
		const verifyMobileExist = await Leads.find({phone: mobile}).sort("id DESC"); //desc

		if (Object.keys(verifyMobileExist).length === 0) {
			return res.badRequest(sails.config.res.noDataAvailableId);
		} else {
			const date = moment(Date.now()).subtract(1, "h").format("YYYY-MM-DD HH:mm:ss");
			datetime = await sails.helpers.dateTime();
			logoutTime = moment(datetime).add(90, 'seconds').format("YYYY-MM-DD HH:mm:ss");
			const fetchUserOtp = await OTPUserRd.find({userid: verifyMobileExist.id, created_time: {">=": date}}).sort("id DESC");
			if(fetchUserOtp.length > 0){
				logout = moment(fetchUserOtp[0].logout_time).format("YYYY-MM-DD HH:mm:ss");
				if(datetime <  logout){
					return res.badRequest({
						status : "nok",
						message : "Otp already sent, please try after 90 seconds"
					})
				}
			}
			if (fetchUserOtp && fetchUserOtp.length < 3) {
				const updateOtp = await OTPUser.update({userid: verifyMobileExist.userid, isActive: "true"}).set({isActive: "false"});
				const userOtpData = {
						userid: verifyMobileExist.id,
						login_time: datetime,
						otp: md5(generateOtp),
						white_label_id: verifyMobileExist.white_label_id,
						created_time: datetime,
						otp_received_time: datetime,
						logout_time : logoutTime,
						isActive: "true"
					},
					createdRecord = await OTPUserRd.create(userOtpData).fetch();
				if (createdRecord) {
					const sms =
						generateOtp +
						" is your one time password to proceed on NCBIZ. Do not share your OTP with anyone.",
						data = {},
						triggerSMSResult = await sails.helpers.smsTrigger(
							sms,
							mobile,
							data
						);

					return res.send({
						status: "ok",
						message: "successfully send OTP",
						otp: generateOtp,
						smsresult: triggerSMSResult
					});
				} else {
					return res.send({status: "nok", message: "Something Went Wrong!!"});
				}
			} else {
				return res.send({status: "nok", message: "You have exceeded the maximum number of OTP requests, please try after 1 hour"});
			}

		}
	},

	verifyOTP: async function (req, res) {
		const {mobile, otp} = req.allParams();

		if (!mobile || !otp) {
			return res.badRequest(sails.config.res.missingFields);
		}
		// eslint-disable-next-line max-len

		const verifyMobileExist = await Leads.find({phone: mobile}).sort("id DESC");

		if (Object.keys(verifyMobileExist).length === 0) {
			return res.badRequest({status: "nok", message: "Invalid mobile number OR no data found for this user."});
		}
		datetime = await sails.helpers.dateTime();
		const verifyOtpExist = await OTPUserRd.find({userid: verifyMobileExist[0].id, otp: md5(otp)}).sort("id DESC");

		if (verifyOtpExist.length === 0) {
			return res.badRequest({status: "nok", message: "Invalid OTP"});
		}

		const updateOtp = await OTPUser.update({userid: verifyMobileExist[0].id, otp: md5(otp)}).set({isActive: "false"});
		return res.send({
			status: "ok",
			message: "OTP verified",
			data: verifyMobileExist[0]
		});

	},
	leadsCreateNew: async function (req, res) {
		const {white_label_id, equifax_json, product_id, parent_id, id} = req.allParams(),
		 datetime = await sails.helpers.dateTime();
		if (!white_label_id) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
		const createObj = {
			... req.allParams(),
			product_name : JSON.stringify({product_id, parent_id}),
			other_data : JSON.stringify(req.allParams()),
			equifax_json:equifax_json ? JSON.stringify(equifax_json) : null,
			onboarding_count: 1,
			userid : req.user.id,
			assignee: req.user.parent_id ?
				req.user.parent_id : req.user.assigned_sales_id ? req.user.assigned_sales_id : req.user.id,
			origin: req.body.origin || "PHP_portal"
		};
		let  leadData;
		if (id){
			createObj.updated_time = datetime;
			leadData = await Leads.update({id}).set(createObj).fetch();
			leadData = leadData[0];
		} else {
			createObj.originator = req.user.id;
			createObj.updated_time = datetime;
			createObj.created_time = datetime;
			leadData = await Leads.create(createObj).fetch();
		}
		if (!leadData) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.invalidData
			});
		}
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.leadDataCreated,
			data: leadData
		});
	},

	leadsFetchNew: async function (req, res) {
		const {id, white_label_id, loan_id} = req.allParams();
		if ((!id || !white_label_id) && (!loan_id || !white_label_id)){
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
		const condition = {
			white_label_id
		};
		if (id) {condition.id = id;}
		if (loan_id) {condition.loan_id = loan_id;}
		await LeadsRd.findOne(condition)
			.exec((err, list) => {
				if (err) {
					return res.ok({
						status: "nok",
						message: sails.config.msgConstants.leadsFetchFailed,
						data: err
					});
				}
				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.leadsFetchSuccessful,
					data: list || []
				});
			});
	},
	leadlist : async function (req, res){
		const page_count = req.param("skip") ? req.param("skip") : 0,
			limit_count = req.param("limit") ? req.param("limit") : 10,
		 user_data = req.user,
		 {id : userid, usertype, loggedInWhiteLabelID} =  req.user,
		 whereCondition = {
				white_label_id : loggedInWhiteLabelID
			},
			sectionId = [],
			sectionData = await UsersSectionRd.find({
			   select: ["section_ref"],
			   where: {
				   user_id: userid,
				   classification_type : "zone"
			   }
		   });
		   if (sectionData.length > 0){
			   for (const i in sectionData) {
				   sectionId.push(sectionData[i].section_ref);
			   }
			   whereCondition.zone_id = sectionId;
		   }
		// if (usertype == "Bank"){
		// 	if (user_data.is_branch_manager === 1 ){
		// 		whereCondition.or = [
		// 			{assignee: userid},
		// 			{userid : userid},
		// 			{updated_user : userid},
		// 			{branch_id : user_data.branch_id}
		// 		];
		// 	} else if (user_data.is_state_access === 1){
		// 		whereCondition.or = [
		// 			{assignee: userid},
		// 			{userid : userid},
		// 			{updated_user : userid},
		// 			{true_caller_name: user_data.state}
		// 		];
		// 	} else {
		// 		whereCondition.or = [
		// 			{assignee: userid},
		// 			{userid : userid},
		// 			{updated_user : userid},
		// 			{city: user_data.city}
		// 		];
		// 	}
		// } else if (usertype == "CA"){
		// 	whereCondition.or = [
		// 		{assignee: userid},
		// 		{updated_user : userid},
		// 		{userid : userid},
		// 		{channel_user : userid}
		// 	];
		// } else {
		// 	whereCondition.or = [
		// 		{assignee: userid},
		// 		{updated_user : userid},
		// 		{userid : userid}
		// 	];
		// }
		const leadsList = await Leads.find(whereCondition)
			.sort("updated_time DESC")
			.paginate({page: page_count, limit: limit_count});
		if (leadsList.length > 0){
			Promise.all(
				leadsList.map(async (element) => {
					if (element.product_name){
						const productData = JSON.parse(element.product_name);
						element.product_name = productData.product_id ?
							await LoanProductDetailsRd.findOne({id : productData.product_id})
								.select(["product_id", "basic_details"]) : {};
						element.parent_product = productData.parent_id ?
							await LoanProductDetailsRd.findOne({id : productData.parent_id})
								.select(["product_id", "basic_details"]) : {};
					} else {
						element.product_name = {};
						element.parent_product = {};
					}
				})
			).then(() => {
				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.leadsFetchSuccessful,
					data: leadsList
				});
			});
		} else {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.leadsFetchSuccessful,
				data: []
			});
		}
	},
	lead_cta_and_comments : async function (req, res){
		const {lead_id, icon_name, comments, loan_id, notify_user_id} =  req.allParams();
		if (!lead_id) {
			return res.badRequest({
				status : "nok",
				message : "Lead id is missing."
			});
		}
		let datetime = await sails.helpers.dateTime(),
		 message;
		 const leadsFetch = await LeadsRd.findOne({id : lead_id});
		 if (!leadsFetch){
			return res.badRequest({
				status : "nok",
				message : "Invalid lead id"
			});
		 }
		 const data = {};
		if (icon_name && icon_name === "Draft" && loan_id){
			data.loan_id = loan_id;
			message = "Loan moved to Draft stage";
		}
		let notifyUserName = "";
		if (comments){
			if (notify_user_id){
				notifyUserNameData = await UsersRd.findOne({id: notify_user_id}).select("name");
				notifyUserName = notifyUserNameData.name;
			}
			datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
			const commentsObj = {
				userid: req.user.id,
				type: "comments",
				message: comments,
				commented_at : datetime,
				commented_by: req.user.name,
				assigneeId: notify_user_id,
				assignedTo: notifyUserName
			};
			if (icon_name && icon_name === "Draft") {
				commentsObj.icon_name = "Draft";
			}
			if (leadsFetch.comment) {
				parseData = JSON.parse(leadsFetch.comment);
				parseData[datetime] = commentsObj;
				data.comment = JSON.stringify(parseData);
			} else {
				history = {};
				history[datetime] = commentsObj;
				data.comment = JSON.stringify(history);
			}
			message = "comments added successfuly.";
		}
		if (Object.keys(data).length > 0){
			data.updated_time = datetime;
			const leadsUpdate = await Leads.update({id : lead_id}).set(data).fetch();
			return res.ok({
				status : "ok",
				message,
				data : leadsUpdate
			});
		} else {
			return res.badRequest({
				status : "nok",
				message : "No data to update."
			});
		}
	},
	lead_comments_fetch : async function (req, res){
		const lead_id = req.param("lead_id");
		if (!lead_id){
			return res.badRequest({
				status : "nok",
				message : "Lead id is mandatory."
			});
		}
		const leadsData = await LeadsRd.findOne({id : lead_id}).select("comment");
		if (!leadsData){
			return res.badRequest({
				status : "nok",
				message :"Invalid lead id."
			});
		}
		let comments = leadsData.comment ? JSON.parse(leadsData.comment) : {};
		comments = comments ? Object.values(comments) : [];
		if (comments.length == 0) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.recordNotFound
			});
		}

		const dataLen = comments.length;
		for (let i = 0; i < dataLen; i++) {
			for (let j = 0; j < dataLen; j++) {
				if (comments[i].commented_at < comments[j].commented_at && i < j) {
					const temp = comments[i];
					comments[i] = comments[j];
					comments[j] = temp;
				}
			}
		}

		return res.ok({
			status : "ok",
			message : "comments List",
			data : comments
		});
	},
	DSA_list : async function (req, res){
		const zone_id = [], user_id = [];
		sectionData = await UsersSectionRd.find({user_id: req.user.id, classification_type : "zone"}).select("section_ref");
		if (sectionData.length > 0){
			for (const i in sectionData) {
				zone_id.push(sectionData[i].section_ref);
			}
		}
		if (zone_id.length > 0){
			const sectionDatafetch = await UsersSectionRd.find({section_ref: zone_id, classification_type : "zone"}).select("user_id");
			for (const j in sectionDatafetch) {
				user_id.push(sectionDatafetch[j].user_id);
			}
			const userList = user_id.length > 0 ? (await UsersRd.find({id : user_id, white_label_id : {contains : req.user.loggedInWhiteLabelID}}).select("name")): [];
			return res.ok({
				status : "ok",
				message : "DSA List",
				data : userList
			});
		} else{
			return res.badRequest({status : "nok", message : "DSA users are not configured."});
		}
	}

};


async function upload_and_fetch(params) {
	upload = await s3.upload(params).promise();
	fileUrl = await s3.getSignedUrl("getObject", {
		Bucket: params.Bucket,
		Key: upload.Key
	});
	return fileUrl;
}
