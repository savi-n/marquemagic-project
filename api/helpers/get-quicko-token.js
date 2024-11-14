const moment = require('moment');

module.exports = {
    friendlyName: "GetQuickoToken",

    description: "Login api call to get quicko access api key start.",

    inputs: {
        name: {
            type: "string",
            required: true,
        }
    },

    exits: {
        success: {
            description: "All done.",
        },
    },

    fn: async function (inputs, exits) {
        const now = await sails.helpers.istDateTime();
        let details = await AuthToken.findOne({
            name: inputs.name,
            is_active: "active",
        });
        // diabling it.. Because we are using same key for Dev and prod... if we update key in dev.. prod access key will be expired
        if (details && details.name) {
            let date = moment(details.vaild_till);
            const diff = moment(now, 'YYYY-MM-DD HH:mm:ss').diff(date, 'seconds');
            //Disabling below if block as not able to figure token issue yet
            if (diff < 0) {
                return exits.success({
                    status: "ok",
                    access_token: details.token
                });
            }
        }
        const url = sails.config.quicko.api.authAPI;
        const method = "POST";
        const header = {
            "x-api-key": sails.config.quicko.apiKey,
            "x-api-secret": sails.config.quicko.apiSecret,
            "x-api-version": sails.config.quicko.apiVersion
        }
        let quickoLogin = await sails.helpers.apiTrigger(url, "", header, method);
        if (!quickoLogin || quickoLogin.status == "nok")
            return exits.success(quickoLogin);

        const dateTomo = moment(now, 'YYYY-MM-DD HH:mm:ss').add(3, 'hours').format('YYYY-MM-DD HH:mm:ss');
        let parseLogin = JSON.parse(quickoLogin);
        if (details && details.name) {
            await AuthToken.update({
                id: details.id,
            }).set({
                token: parseLogin.access_token,
                vaild_till: dateTomo
            })
        } else {
            await AuthToken.create({
                name: inputs.name,
                is_active: 'active',
                token: parseLogin.access_token,
                vaild_till: dateTomo
            }).fetch()
        }
        return exits.success({
            status: "ok",
            access_token: parseLogin.access_token
        });

    },
};
