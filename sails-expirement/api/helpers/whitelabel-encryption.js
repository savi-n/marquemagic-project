module.exports = {
	inputs: {
		data: {
			type: "string",
			description: "Encryption Algorithm used",
			required: true
		}
	},

	fn: async function (inputs) {
		const crypto = require("crypto");
		const encryptionKey = "namastecredit",
			key = crypto.scryptSync(encryptionKey, "salt", 32),
			iv = Buffer.alloc(16, 0),
			cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
		let encrypted = cipher.update(inputs.data);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return {key: key.toString("hex"), iv: iv.toString("hex"), encryptedData: encrypted.toString("hex")};
	}
};
