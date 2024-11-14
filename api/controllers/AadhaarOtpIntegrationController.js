

module.exports = {
	//API to generate aadhaarOTP
	aadhaarGenerateOtp: async function (req, res) {
		const aadhaarNo = req.body.aadhaarNo;
		if (!aadhaarNo) {
			return res.badRequest(sails.config.errRes.missingFields);
		}
		//aadhaar number validation
		aadhaarNoValidation = /^[2-9]{1}[0-9]{11}$/;
		if (aadhaarNoValidation.test(aadhaarNo) === false) {
			return res.badRequest({
				status: "nok",
				message: "Invalid Aadhaar Number"
			});
		}
		//request payload of digitap(intiate_kyc_auto) API
		body = {
			uniqueId: sails.config.aadhaarOtpIntegration.uniqueId,
			uid: aadhaarNo
		};
		//conversion of ClientID and Client_Secret to base64 encoded value
		clientId = sails.config.aadhaarOtpIntegration.ClientID;
		clientSecret = sails.config.aadhaarOtpIntegration.Client_Secret;
		encodedData = Buffer.from(clientId + ":" + clientSecret).toString("base64");
		authorizationHeaderString = encodedData;

		//Headers
		auth = {
			authorization: authorizationHeaderString,
			"Content-Type": "application/json"
		};

		//digitap(intiate_kyc_auto) API call
		const digitapResponse = await sails.helpers.apiTrigger(
			sails.config.aadhaarOtpIntegration.intiate_kyc_auto_url,
			JSON.stringify(body),
			auth,
			"POST"
		);
		if (digitapResponse.status == "nok") {
			return res.badRequest({
				status: "nok",
				data: JSON.parse(digitapResponse.result)
			});
		}
		digitapResponseObject = JSON.parse(digitapResponse);
		return res.send({
			status: "ok",
			message: "success",
			data: digitapResponseObject.model
		});
	},

	// API to verify aadhaarOTP
	aadhaarVerifyOtp: async function (req, res) {
		const {aadhaarNo,transactionId, otp, codeVerifier, fwdp} = req.allParams();
		if (!aadhaarNo || !transactionId || !otp || !codeVerifier || !fwdp) {
			return res.badRequest(sails.config.errRes.missingFields);
		}
		aadhaarNoCheck = await EKycResponse.find({kyc_key : aadhaarNo}).sort("id DESC");
		const currentDate = await sails.helpers.dateTime();
		 data={
			kyc_key: aadhaarNo ,
			created: currentDate,
			updated:currentDate  ,
			type: "aadhar"
		 };
		//request payload of digitap(submit_otp_url) API
		body = {
			shareCode: sails.config.aadhaarOtpIntegration.shareCode,
			otp: otp,
			transactionId: transactionId,
			codeVerifier: codeVerifier,
			fwdp: fwdp
		};
		//conversion of ClientID and Client_Secret to base64 encoded value
		clientId = sails.config.aadhaarOtpIntegration.ClientID;
		clientSecret = sails.config.aadhaarOtpIntegration.Client_Secret;
		encodedData = Buffer.from(clientId + ":" + clientSecret).toString("base64");
		authorizationHeaderString = encodedData;

		//Headers
		auth = {
			authorization: authorizationHeaderString,
			"Content-Type": "application/json"
		};

		//digitap(submit_otp_url) API call
		const digitapResponse = await sails.helpers.apiTrigger(
			sails.config.aadhaarOtpIntegration.submit_otp_url,
			JSON.stringify(body),
			auth,
			"POST"
		);
		parseData = JSON.parse(digitapResponse);
		if (digitapResponse.status == "nok" || parseData.code != 200) {
			data.response=JSON.stringify(digitapResponse);
			//updating data into db
			if(aadhaarNoCheck.length!==0){
			await EKycResponse.update({id: aadhaarNoCheck[0].id}).set({updated :currentDate,response:data.response}).fetch();
			}
			else{
				//inserting data into db
				await EKycResponse.create(data).fetch();
		}
		return res.badRequest({
			status: "nok",
			data: parseData
		});
		}
		else{
		digitapResponseObject = parseData;// JSON.parse(digitapResponse);
		data.response = digitapResponse;
		//updating data into db
		if(aadhaarNoCheck.length!==0){
		await EKycResponse.update({id : aadhaarNoCheck[0].id}).set({updated :currentDate, created:currentDate,response:data.response}).fetch();
		}
		else{
			//inserting data into db
			await EKycResponse.create(data).fetch();
		}
		return res.send({
			status: "ok",
			message: "success",
			data: digitapResponseObject.model
		});
}
	},

	// API to resend aadhaarOTP
	aadhaarResendOtp: async function (req, res) {
		const {aadhaarNo, transactionId, fwdp} = req.allParams();
		if (!aadhaarNo || !transactionId || !fwdp) {
			return res.badRequest(sails.config.errRes.missingFields);
		}

		//aadhaar number validation
		aadhaarNoValidation = /^[2-9]{1}[0-9]{11}$/;
		if (aadhaarNoValidation.test(aadhaarNo) === false) {
			return res.badRequest({
				status: "nok",
				message: "Invalid Aadhaar Number"
			});
		}
		var moment = require('moment');
		const currentDate=await sails.helpers.dateTime();
		let date = moment(Date.now()).subtract(1, 'h').format("YYYY-MM-DD HH:mm:ss");
		  let fetchEkycData = await EKycResponse.find({kyc_key: aadhaarNo, updated : {">=" : date}});
			  if(fetchEkycData.length==0){
				  await EKycResponse.update({kyc_key: aadhaarNo})
				  .set({
						updated:currentDate,
						aadhaar_resend_otp_count:1
					}).fetch();
			  }else{
				if (fetchEkycData[0].aadhaar_resend_otp_count < 3){
			  const count= fetchEkycData[0].aadhaar_resend_otp_count + 1;
			  await EKycResponse.update({id : fetchEkycData[0].id}).set({updated:currentDate, aadhaar_resend_otp_count: count}).fetch();
			}
			else{
			  await EKycResponse.update({id : fetchEkycData[0].id}).set({updated:currentDate, aadhaar_resend_otp_count: 0}).fetch();
			  return res.send(200,{ status: "nok", message: "You have exceeded the maximum number of OTP requests, please try after 1 hour" });
			}
		}
	 //request payload of digitap(resend_otp_url) API
		body = {
			uniqueId: sails.config.aadhaarOtpIntegration.uniqueId,
			uid: aadhaarNo,
			transactionId: transactionId,
			fwdp: fwdp
		};
		//conversion of ClientID and Client_Secret to base64 encoded value
		clientId = sails.config.aadhaarOtpIntegration.ClientID;
		clientSecret = sails.config.aadhaarOtpIntegration.Client_Secret;
		encodedData = Buffer.from(clientId + ":" + clientSecret).toString("base64");
		authorizationHeaderString = encodedData;

		//Headers
		auth = {
			authorization: authorizationHeaderString,
			"Content-Type": "application/json"
		};

		//digitap(resend_otp_url) API call
		const digitapResponse = await sails.helpers.apiTrigger(
			sails.config.aadhaarOtpIntegration.resend_otp_url,
			JSON.stringify(body),
			auth,
			"POST"
		);
		console.log(digitapResponse);
		if (digitapResponse.status == "nok") {
			return res.badRequest({
				status: "nok",
				data: JSON.parse(digitapResponse.result)
			});
		}
		digitapResponseObject = JSON.parse(digitapResponse);
		return res.send({
			status: "ok",
			message: "success",
			data: digitapResponseObject.model
		});
	}
};
