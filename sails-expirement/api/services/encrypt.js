const CryptoJS = require("crypto-js");

const SECRET = sails.config.cub.encryptReqResKey;

exports.decryptReq = (reqBody) => {
	try {
		const reqBytes = CryptoJS.AES.decrypt(reqBody, SECRET),
			reqStr = reqBytes.toString(CryptoJS.enc.Utf8);
		return JSON.parse(reqStr);
	} catch (err) {
		console.log("error-api-decrypt-req-", err);
		return null;
	}
};

exports.encryptRes = (resBody) => {
	try {
		return CryptoJS.AES.encrypt(JSON.stringify(resBody), SECRET).toString();
	} catch (err) {
		console.log("error-encryptRes-", err);
		return null;
	}
};
