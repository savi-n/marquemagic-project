const crypto = require('crypto');

module.exports = {
  inputs: {
    data: {
      type: 'string',
      required: true
    },
    encryptionKey: {
      type: 'string',
      description: 'Encryption key',
      required: true
    }
  },

  fn: async function (inputs, exits) {
    let buffer = Buffer.from(inputs.data);
    let encrypted = crypto.privateEncrypt(inputs.encryptionKey, buffer);
    return exits.success(encrypted.toString("base64"));
  }
};
