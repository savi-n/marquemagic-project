const crypto = require('crypto');

module.exports = {
  inputs: {
    data: {
      type: 'string',
      required: true
    },
    decryptionKey: {
      type: 'string',
      description: 'Decryption key',
      required: true
    }
  },

  fn: async function (inputs, exits) {
    try {
      let buffer = Buffer.from(inputs.data, "base64");
      let decrypted = crypto.privateDecrypt(inputs.decryptionKey, buffer);
      return exits.success(decrypted.toString("utf8"));
    } catch (err) {
      return exits.success("error");
    }
  }
};
