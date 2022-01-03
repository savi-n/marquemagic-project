import CryptoJS from 'crypto-js';

import { SECRET } from '_config/app.config';

export const encryptReq = reqBody => {
	try {
		return CryptoJS.AES.encrypt(JSON.stringify(reqBody), SECRET).toString();
	} catch (err) {
		// ('error-encryptReq-', err);
		return err;
	}
};

export const decryptRes = reqBody => {
	try {
		const reqBytes = CryptoJS.AES.decrypt(reqBody, SECRET),
			reqStr = reqBytes.toString(CryptoJS.enc.Utf8);
		return JSON.parse(reqStr);
	} catch (err) {
		// ('error-api-decrypt-req-', err);
		return err;
	}
};
