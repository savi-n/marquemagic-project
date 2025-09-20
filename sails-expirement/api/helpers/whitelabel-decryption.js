module.exports = {
	inputs: {
		data: {
			type: "string",
			description: "Encryption Algorithm used",
			required: true
		}
	},

	fn: async function (inputs, exits) {
		const crypto = require("crypto"),
			abc = "namastecredit",
			key = crypto.scryptSync(abc, "salt", 32),
			iv = Buffer.alloc(16, 0),
			encryptedText = Buffer.from(inputs.data, "hex");
		let decrypted = "";
		try {
			const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
			decrypted = decipher.update(encryptedText);
			decrypted = Buffer.concat([decrypted, decipher.final()]);
		} catch (err) {
			decrypted = "error";
			console.error(err);
		}
		return exits.success(decrypted.toString());
	}
};
