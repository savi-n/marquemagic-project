const md5 = require("md5");
moment = require("moment");
const reqParams = require("../helpers/req-params");
module.exports = {
	sendOTP: async function (req, res) {
		const {mobile, business_id, product_id} = req.allParams();
		const date = moment(Date.now()).subtract(1, "h").format("YYYY-MM-DD HH:mm:ss");

		params = req.allParams();
		fields = ["mobile", "product_id"];
		missing = await reqParams.fn(params, fields);

		if (!mobile || !product_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		//verify mobile number exist or not
		const verifyMobileExist = await Business.findOne({
				id: business_id,
				contactno: {contains : mobile}
			});
		 let timer = 90;
		 console.log("-------------------------------", verifyMobileExist);
		if (!verifyMobileExist) {
			return res.badRequest(sails.config.res.noDataAvailableId);
		} else {
			reqData = {
				userid: verifyMobileExist.userid,
				product_id,
				mobile: mobile,
				created_time: {">=": date}
			};
			const loan_product_data = await LoanProductDetailsRd.findOne({id: product_id}).select([
				"product_id",
				"otp_configuration"
			]);
			// loanData = await LoanrequestRd.find({business_id : bid}).sort("id DESC");
			if (!loan_product_data) {
				return res.badRequest({
					status: "nok",
					message: "Invalid product id"
				});
			}
			const {no_of_attempts, time_limit_in_minutes, otp_duration_in_seconds} =
				loan_product_data.otp_configuration;
			datetime = await sails.helpers.dateTime();
			logoutTime = moment(datetime).add(otp_duration_in_seconds, "seconds").format("YYYY-MM-DD HH:mm:ss");

			const fetchUserOtp = await OTPUser.find(reqData).sort("id DESC");

			if (fetchUserOtp.length > 0) {
				logout = moment(fetchUserOtp[0].logout_time).format("YYYY-MM-DD HH:mm:ss");
				if (datetime < logout) {
					const ts = moment(logout).diff(moment(datetime), "seconds");
					timer = ts;
					return res.badRequest({
						status: "nok",
						message: `Otp already sent, please try after ${ts} seconds`,
						timer: timer
					});
				}
				reqData.verifed_status = "False";
				let latestDate;
				_.each(fetchUserOtp, (values) => {
					if (values.verifed_status == "True") {
						latestDate = moment(values.created_time).format("YYYY-MM-DD HH:mm:ss");
						reqData.created_time = {">=": latestDate};
					}
				});
				const otpCount = await OTPUser.find(reqData);

				if (
					(fetchUserOtp.length > 0 && fetchUserOtp[0].count_wrong_hits >= no_of_attempts) ||
					otpCount.length >= no_of_attempts
				) {
					time = moment(fetchUserOtp[0].otp_received_time)
						.add(time_limit_in_minutes, "m")
						.format("YYYY-MM-DD HH:mm:ss");
					const hour = moment(time).diff(moment(datetime), "minutes");
					return res.badRequest({
						status: "nok",
						message: `You have exceeded the maximum number of OTP requests, please try after ${hour} minutes`
					});
				}
			}
			function generateRandomNumber() {
				const minm = 100000,
				 maxm = 999999;
				return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
			}
			const generateOtp = generateRandomNumber();
			// generateOtp = Math.floor(100000 + Math.random() * 900000);
			  await OTPUser.update({
				userid: verifyMobileExist.userid,
				mobile: mobile,
				isActive: "true"
			}).set({isActive: "false"});
			const userOtpData = {
				userid: verifyMobileExist.userid,
				login_time: datetime,
				otp: md5(generateOtp),
				white_label_id: req.user.loggedInWhiteLabelID,
				created_time: datetime,
				otp_received_time: datetime,
				logout_time: logoutTime,
				isActive: "true",
				product_id,
				mobile: mobile
			};
			white_label_id = verifyMobileExist.white_label_id;
			let sms;
			if (white_label_id === sails.config.smsKey.white_label_id) {
				sms =
					"Dear Customer, " +
					generateOtp +
					" is your OTP, valid till next 1 Minutes. Please DO NOT disclose it to anyone. Muthoot Fincorp Ltd";
			} else {
				sms =
					generateOtp + " is your one time password to proceed on NCBIZ. Do not share your OTP with anyone.";
			}
			let data = {}, triggerSMSResult;
			if (Number(white_label_id) === sails.config.federal_api.whitelabel_id){
				triggerSMSResult = await federalOTP(business_id, req.user.loggedInWhiteLabelID, mobile, req.user.email, generateOtp)
			}else {
				triggerSMSResult = await sails.helpers.smsTrigger(sms, mobile, data, white_label_id);
			}
			
			if (triggerSMSResult !== "Invalid Mobile Numbers" || triggerSMSResult.statusCode !== 200) {
				const createdRecord = await OTPUser.create(userOtpData).fetch();
				if (createdRecord) {
					return res.send({
						status: "ok",
						message: "successfully send OTP",
						smsresult: triggerSMSResult,
						timer: timer
					});
				} else {
					return res.badRequest({status: "nok", message: "Something Went Wrong!!"});
				}
			} else {
				return res.badRequest({
					status: "nok",
					message: triggerSMSResult
				});
			}
		}
	},
	verifyOTP: async function (req, res) {
		const {mobile, otp, business_id, loan_id} = req.allParams();
		datetime = await sails.helpers.dateTime();
		const verifyMobileExist = await Business.findOne({
			id: business_id,
			contactno: {contains : mobile}
		});

		if (!verifyMobileExist) {
			return res.badRequest({status: "nok", message: "Invalid mobile number OR no data found for this user."});
		}

		const verifyOtpExist = await OTPUser.findOne({
			userid: verifyMobileExist.userid,
			otp: md5(otp),
			mobile: mobile,
			isActive: "true"
		});
		if (!verifyOtpExist) {
			const data_check = await OTPUser.findOne({
				userid: verifyMobileExist.userid,
				mobile: mobile,
				isActive: "true"
			});
			if (data_check) {
				count = data_check.count_wrong_hits + 1;
				const updateOtp = await OTPUser.update({id: data_check.id}).set({count_wrong_hits: count});
			}
			return res.badRequest({status: "nok", message: "Invalid OTP"});
		}
		let name;
		if ((verifyMobileExist.first_name && verifyMobileExist.last_name) || verifyMobileExist.first_name) {
			name = verifyMobileExist.first_name + " " + verifyMobileExist.last_name;
		} else {
			name = verifyMobileExist.businessname;
		}
		data = {
			authenticated_by: name,
			otp_received_on: moment(verifyOtpExist.otp_received_time)
				.add(5, "h")
				.add(42, "m")
				.format("DD-MM-YYYY HH:mm:ss A")
				.toString(),
			authenticated_on: moment(datetime).add(5, "h").add(42, "m").format("DD-MM-YYYY HH:mm:ss A").toString(),
			mobile_no: mobile,
			userid: verifyOtpExist.userid
		};
		if (loan_id) {
			loanUpdate = await Loanrequest.update({id: loan_id}).set({authentication_data: JSON.stringify({auth_data: data})});
		}
		const updateOtp = await OTPUser.update({userid: verifyMobileExist.userid, mobile: mobile, otp: md5(otp)}).set({
			isActive: "false",
			count_wrong_hits: 0,
			verifed_status: "True"
		});
		return res.send({
			status: "ok",
			message: "OTP verified",
			data: data
		});
	},

	otp_inactive: async function (req, res) {
		datetime = await sails.helpers.dateTime();
		datetimeSub = moment(datetime).subtract(5, "m").format("YYYY-MM-DD HH:mm:ss");
		fetchData = await OTPUserRd.find({created_time: {">=": datetimeSub}});
		if (fetchData.length > 0) {
			Promise.all(
				fetchData.map(async (element) => {
					logout = moment(element.logout_time).format("YYYY-MM-DD HH:mm:ss");
					if (datetime >= logout) {
						updateData = await OTPUser.update({id: element.id}).set({isActive: "false"});
						return res.ok({status: "ok", message: "Updated successfully"});
					}
				})
			);
		} else {
			return res.badRequest({status: "nok", message: "No data found"});
		}
	}
};
async function federalOTP(business_id, white_label_id, mobile_no, email, otp){
	const loanrequestData = await LoanrequestRd.findOne({business_id : business_id}).select("loan_ref_id");
	const url = sails.config.federal_api.sms_url,
		method = "POST",
		body = {
			loan_ref_id : loanrequestData.loan_ref_id,
			email,
			mobile_no,
			wlid : white_label_id,
			otp
		},
		header = {
			"Content-Type": "application/json"
		};
	 let sendEmailResponse = await sails.helpers.sailstrigger(url, JSON.stringify(body), header, method);
	 if (sendEmailResponse.statusCode === 200){
		sendEmailResponse = JSON.parse(sendEmailResponse);
	 }
	 return sendEmailResponse;

}
