const jwt = require('jsonwebtoken');
const secretKey = sails.config.jwtTokens.secret;
module.exports = {

    friendlyName: "Encrypt/Decrypt data",
    description: "Encrypt/Decrpt data with jsonWebToken usig secret keys",

    inputs: {
        method: {
            type: 'string',
            required: true
        },
        payload: {
            type: 'json',
            description: 'payload or signed token',
            required: true
        }
    },

    fn: async function (inputs, exits) {
        const method = inputs.method;
        const payload = inputs.payload;
        if (method == 'verify') {
            try {
                const data = jwt.verify(payload, secretKey);
                return exits.success(data);
            } catch (err) {
                return exits.success("error");
            }
        } else if (method == 'sign') {
            const token = jwt.sign(payload, secretKey, {expiresIn: '1d'});
            return exits.success(token);
        }
    }
};
