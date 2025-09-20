module.exports = async (req, res, next) => {
	const allParams = req.allParams();
	let white_label_id, parsedData;

	if (req.method === "GET" && Object.keys(req.query).length === 0) {
		req.allParamsData = allParams;
		return next();
	}
	
		if (allParams.EncryptedRequestPayload && req.method === "POST"){
		// if (allParams.EncryptedRequestPayload ){
			parsedData = await sails.helpers.crypto.with({
				action: "aesCbc256Decrypt",
				data: allParams.EncryptedRequestPayload
			});
			// if (req.method === "POST") {parsedData = JSON.parse(parsedData)}
		} else if (allParams.encryptedData) {
			if (req.method === "GET") {
				allParams.encryptedData = allParams.encryptedData.replace(/[' ']/g, "+");
			}
			parsedData = await sails.helpers.crypto.with({
				action: "cryptoPrivateDecrypt",
				data: allParams.encryptedData
			});
		} else{
			parsedData = allParams;
		}
		
		if (Object.keys(parsedData).length === 0) {
			return res.badRequest({status: "nok", message: "Invalid encrypted data!!!"});
		}
		//}
	// }
	console.log("++++++++++++++++++++++", parsedData , typeof parsedData);
	if (req.user) {
		white_label_id = req.user.white_label_id.split(",")[0];
	} else {
		white_label_id = parsedData ? parsedData.white_label_id : req.body.white_label_id;
		const decryptWhitelabel = white_label_id && (await sails.helpers.whitelabelDecryption(white_label_id));
		if (!decryptWhitelabel || decryptWhitelabel == "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}

		white_label_id = decryptWhitelabel;
	}
	const result = await WhiteLabelSolutionRd.find({encryption_flag: "yes", id: white_label_id});
	if (req.url == "/case-casecreation") {
		if (!result || result.length == 0) {
			req.body.allParams = allParams;
		} else {
			const parseBusinessData = await sails.helpers.crypto.with({
				action: "cryptoPrivateDecrypt",
				data: allParams.Business_details
			});
			allParams.Business_details = parseBusinessData;
			const parseLoanData = await sails.helpers.crypto.with({
				action: "cryptoPrivateDecrypt",
				data: allParams.loan_details
			});
			allParams.loan_details = parseLoanData;
			if (allParams.entity_type == "Individual" && allParams.director_details) {
				const director_data_len = Object.keys(allParams.director_details),
					dir_details = Object.values(allParams.director_details);
				if (director_data_len.length > 0 && dir_details.length > 0) {
					for (let i = 0; i < director_data_len.length; i++) {
						if (Object.keys(allParams.director_details[director_data_len[i]]).length > 0) {
							const dir1 = await sails.helpers.crypto.with({
								action: "cryptoPrivateDecrypt",
								data: allParams.director_details[director_data_len[i]]
							});
							allParams.director_details[director_data_len[i]] = dir1;
						}
					}
				}
			}
			if (allParams.entity_type == "Business" && allParams.subsidiary_details) {
				const parseSubData = await sails.helpers.crypto.with({
					action: "cryptoPrivateDecrypt",
					data: allParams.subsidiary_details
				});
				allParams.subsidiary_details = parseSubData;
			}

			if (Object.keys(parseBusinessData).length === 0 || Object.keys(parseLoanData).length === 0) {
				return res.badRequest({status: "nok", message: "Invalid encrypted data!!!"});
			}
			req.body.allParams = allParams;
		}
	}
	if (result && result.length > 0 && (allParams.encryptedData || allParams.EncryptedRequestPayload)) {
		if (req.method === "GET") {
			req.allParamsData = parsedData;
		} else {
			req.body.allParams = parsedData;
		}
	} else {
		if (req.method === "GET") {
			req.allParamsData = allParams;
		} else {
			req.body.allParams = allParams;
		}
	}

	next();
};
