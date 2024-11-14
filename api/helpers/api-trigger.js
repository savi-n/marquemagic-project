let request = require("request");
//release
module.exports = {
    friendlyName: "Sailstrigger",

    description: "Sailstrigger something.",

    inputs: {
        url: {
            type: "string",
            required: true,
        },
        body: {
            type: "string",
            //   required: true,
        },
        headers: {
            type: "json",
            // required: true,
        },
        method: {
            type: "string",
            required: true,
        },
    },

    exits: {
        success: {
            description: "All done.",
        },
    },

    fn: async function (inputs, exits) {
        // sails.log(`Outbound Request => ${inputs.url} ${inputs.body}`)
        request(
            {
                url: inputs.url,
                body: inputs.body,
                headers: inputs.headers,
                method: inputs.method,
            },
            async function (error, response, body) {
                let result = body;
                // sails.log(`Inbound Response => ${body}`)
                if ((body && response.statusCode == 200) || body) {
                    return exits.success(result);
                } else if (response === undefined) {
                    return exits.success({
                        status: "nok",
                    });
                } else if (body && response.statusCode != 200) {
                    return exits.success({ status: "nok", result: result });
                } else {
                    return exits.success(error);
                }
            }
        );
    },
};
