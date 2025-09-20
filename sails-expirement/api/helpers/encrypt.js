module.exports = {
	friendlyName: "Encrypt",

	description: "Encrypt Data using AES",

	inputs: {
		data: {
			type: "string",
			description: "Encryption Algorithm used",
			required: true
		},
		algorithm: {
			type: "string",
			description: "Encryption Algorithm used",
			defaultValue: "aes-256-cbc",
			required: true
		}
	},

	exits: {
		success: {
			description: "All done."
		}
	},

	fn: async function (inputs, exits) {
		const crypto = require("crypto"),
			key = crypto.randomBytes(32),
			iv = crypto.randomBytes(16),
			cipher = crypto.createCipheriv(inputs.algorithm, Buffer.from(key), iv);
		let encrypted = cipher.update(inputs.data);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return exits.success({
			key: key.toString("hex"),
			iv: iv.toString("hex"),
			encryptedData: encrypted.toString("hex")
		});
	}
};
