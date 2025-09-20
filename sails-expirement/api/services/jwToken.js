/**
 * Service to generate JWT
 */
const jwt = require("jsonwebtoken");
const { SignJWT, jwtVerify } = require("jose");
const bs58 =  require("bs58");
const { createPrivateKey, createPublicKey } = require("crypto");
const publicBase58 = "A77GCUCZ7FAuXVMKtwwXyFhMa158XsaoGKHYNnJ1q3pv";
		const privateKeyBase58 = "BE1VM7rTRJReLsTLLG4JMNX5ozcp7qpmMuRht9zB1UjU";
	  
		let publicKey = bs58.decode(publicBase58);
		let privateKey = bs58.decode(privateKeyBase58);
		
		publicKey = createPublicKey({
			key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), publicKey]),
			format: "der",
			type: "spki",
		  });

		  privateKey = createPrivateKey({
			key: Buffer.concat([
			  Buffer.from("302e020100300506032b657004220420", "hex"),
			  privateKey,
			]),
			format: "der",
			type: "pkcs8",
		  });

module.exports = {
	sign: async function (payload) {
		return jwt.sign(
			{
				data: payload
			},
			sails.config.secret,
			{expiresIn: "1h"}
		);
	},
	verify: async function (token) {
		await jwtVerify(token, publicKey);
	},
	privateKey : function (){
		  return privateKey;
	},
	publicKey : function(){
		  return publicKey;
	}
};
