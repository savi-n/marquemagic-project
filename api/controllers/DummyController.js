/**
 * DummyController - Delete this file
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const crypto = require("crypto");

module.exports = {

    encryptData: async function (req, res, next) {
        const result = await ClientRequest.find({
            request_id: req.headers.request_id
        });

        let buffer = Buffer.from(req.headers.data);
        let encrypted = crypto.publicEncrypt(result[0].public_key, buffer);
        let data = encrypted.toString("base64");
        return res.send(data);
    },
    decryptData: async function (req, res, next) {
        const result = await ClientRequest.find({
            request_id: req.headers.request_id
        });

        let buffer = Buffer.from(req.body, "base64");
        let decrypted = crypto.publicDecrypt(result[0].public_key, buffer);
        return res.send(JSON.stringify(decrypted.toString("utf8")));
    },

    test : async function(req, res){
        return res.ok("Hello!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    }
}