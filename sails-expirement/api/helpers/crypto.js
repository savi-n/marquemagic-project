const crypto = require("crypto"),
	fs = require("fs"),
	path = require("path");

const publicICICIKeyPath = sails.config.publicKey.icici_client_public_key,
	privateKeyPath = sails.config.privateKey.ncPrivateKey,
	secretKey = sails.config.icici_url.secret16key,
	// Encrypt the data using public Key
	pathToCert = path.join(__dirname, "../../config", "certificate"),
	cryptoPublicEncrypt = (data) => {
		const publicKey = crypto.createPublicKey(fs.readFileSync(pathToCert + "/nc.crt")),
			encryptedData = crypto.publicEncrypt(
				{key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING},
				Buffer.from(JSON.stringify(data))
				// Buffer.from(data)
			);
		return encryptedData.toString("base64");
	},
	// Decrypt the data using private Key
	cryptoPrivateDecrypt = (encryptedData) => {
		const privateKey = crypto.createPrivateKey(fs.readFileSync(pathToCert + "/nc.key")),
			decryptedData = crypto.privateDecrypt(
				{key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING},
				Buffer.from(encryptedData, "base64")
			);
		return JSON.parse(decryptedData.toString("utf8"));
	},
	encryptWithPKSC5Key = function (toEncrypt, pathToPublicKey) {
		const absolutePath = path.resolve(pathToPublicKey),
			publicKey = fs.readFileSync(absolutePath, "utf8"),
			buffer = Buffer.from(secretKey, "utf8"),
			encryptedKey = crypto.publicEncrypt({key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING}, buffer),
			b64EncryptedKey = encryptedKey.toString("base64"),
			ivBase64 = "AcynMwikMkW4c7+mHtwtfw==",
			iv = Buffer.from(ivBase64, "base64"),
			cipher = crypto.createCipheriv("aes-128-cbc", secretKey, iv),
			myJSON = JSON.stringify(toEncrypt);
		let encrypted = cipher.update(myJSON, "utf8", "base64");
		encrypted += cipher.final("base64");
		return {cipher: encrypted, iv: ivBase64, secretKey: secretKey, encryptedkey: b64EncryptedKey};
	},
	decryptWithPKSC5Key = function (toDecrypt, pathToPrivateKey) {
		const absolutePath = path.resolve(pathToPrivateKey),
			privateKey = fs.readFileSync(absolutePath, "utf8"),
			triggerApiResult = toDecrypt,
			encryptionKey = triggerApiResult.encryptedKey,
			buffer = Buffer.from(encryptionKey, "base64"),
			sessionKey = crypto.privateDecrypt({key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING}, buffer),
			triggerApiResultEncryptedData = triggerApiResult.encryptedData,
			decodebase64 = Buffer.from(triggerApiResultEncryptedData, "base64"),
			IV = decodebase64.slice(0, 16),
			encryptData = decodebase64.slice(16),
			decipher = crypto.createDecipheriv("aes-128-cbc", sessionKey, IV),
			decryptedInput = decipher.update(encryptData, "base64", "utf8") + decipher.final("utf8");
		return decryptedInput.toString();
	},
	// Encrypt the data using Key AES/CBC/PKCS5Padding 128-bit
	cryptoAesCbcEncrypt = (data, key, iv) => {
		const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
		let encrypted = cipher.update(data, "utf8", "base64");
		encrypted += cipher.final("base64");
		return encrypted;
	},
	// Decrypt the data using Key AES/CBC/PKCS5Padding 256-bit
	cryptoAesCbcDecrypt = (encryptedData, key, iv) => {
		const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv),
			decrypted = decipher.update(encryptedData, "base64", "utf8");
		return decrypted + decipher.final("utf8");
	},
	cryptoAes256CbcEncrypt = (data) => {
		const encryptionKey = "namastecredit",
			key = crypto.scryptSync(encryptionKey, "salt", 32),
			iv = Buffer.alloc(16, 0),
			cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
		let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
		encrypted += cipher.final("base64");
		return encrypted;
	},
	// Decrypt the data using Key AES/CBC/PKCS5Padding 256-bit
	cryptoAes256CbcDecrypt = (encryptedData) => {
		const encryptionKey = "namastecredit",
			key = crypto.scryptSync(encryptionKey, "salt", 32),
			iv = Buffer.alloc(16, 0),
			 decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
		decrypted = decipher.update(encryptedData, "base64", "utf8");
		return JSON.parse(decrypted + decipher.final("utf8"));
	};

module.exports = {
	friendlyName: "rsa",
	description: "encrypt/decrypt long messages using rsa",

	inputs: {
		action: {
			type: "string",
			required: true
		},
		data: {
			type: "ref"
		},
		key: {
			type: "ref"
		},
		iv: {
			type: "ref"
		}
	},

	fn: async (inputs, exits) => {
		const action = inputs.action;
		if (action === "cryptoPublicEncrypt") {
			return exits.success(cryptoPublicEncrypt(inputs.data));
		} else if (action === "cryptoPrivateDecrypt") {
			return exits.success(cryptoPrivateDecrypt(inputs.data));
		} else if (action === "aesCbcEncrypt") {
			return exits.success(cryptoAesCbcEncrypt(inputs.data, inputs.key, inputs.iv));
		} else if (action === "aesCbcDecrypt") {
			return exits.success(cryptoAesCbcDecrypt(inputs.data, inputs.key, inputs.iv));
		} else if (action === "iciciEncrypt") {
			return exits.success(encryptWithPKSC5Key(inputs.data, publicICICIKeyPath));
		} else if (action === "iciciDecrypt") {
			return exits.success(decryptWithPKSC5Key(inputs.data, privateKeyPath));
		}  else if (action === "aesCbc256Encrypt") {
			return exits.success(cryptoAes256CbcEncrypt(inputs.data));
		} else if (action === "aesCbc256Decrypt") {
			return exits.success(cryptoAes256CbcDecrypt(inputs.data));
		}
	}
};
