/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	encrypt: async (req, res) => {
		const encryptData = await sails.helpers.rsa.with({
			action: "publicEncrypt",
			data: req.allParams()
		});

		return res.send({encryptedData: encryptData});
	},
	encryptWithCrypto: async (req, res) => {
		const encryptData = await sails.helpers.crypto.with({
			action: "cryptoPublicEncrypt",
			data: req.allParams()
		});

		return res.send({encryptedData: encryptData});
	},
	encryptWithAESCbc : async (req, res) => {
		console.log("-----------------------",req.allParams());
		const encryptData = await sails.helpers.crypto("aesCbc256Encrypt", req.allParams());
		return res.send({EncryptedRequestPayload: encryptData});
	},
	decryptWithAESCbc : async (req, res) => {
		const encryptedData = req.body.encryptedData,
		 decryptData = await sails.helpers.crypto("aesCbc256Decrypt", encryptedData);
		return res.send(decryptData);
	}
};
