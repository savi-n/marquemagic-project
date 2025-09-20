module.exports = {
	friendlyName: "Decrypt",

	description: "Decrypt the encrypted data",

	inputs: {
		data: {
			type: "string",
			description: "Encryption Algorithm used",
			required: true
		},
		algorithm: {
			type: "string",
			description: "Encryption Algorithm used",
			required: true
		},
		key: {type: "string", description: "Key used while encrypting", required: true},
		iv: {type: "string", description: "Key used while decrypting", required: true}
	},

	exits: {
		success: {
			description: "All done."
		}
	},

	fn: async function (inputs, exits) {
		const crypto = require("crypto");
		const iv = Buffer.from(inputs.iv, "hex"),
			key = Buffer.from(inputs.key, "hex"),
			encryptedText = Buffer.from(inputs.data, "hex");
		let decrypted = "";
		try {
			const decipher = crypto.createDecipheriv(inputs.algorithm, Buffer.from(key), iv);
			decrypted = decipher.update(encryptedText);
			decrypted = Buffer.concat([decrypted, decipher.final()]);
		} catch (err) {
			decrypted = "error";
			console.log(err);
		}
		return exits.success(decrypted.toString());
	}
};
