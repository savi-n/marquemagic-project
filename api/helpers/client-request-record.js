let request = require("request");
//release
module.exports = {
    friendlyName: "CreateClientRequestRecord",

    description: "Create record in client_request Table",

    inputs: {
        operation: {
            type: "string",
            required: true,
        },
        request_id: {
            type: "number",
            required: true,
        },
        client_id: {
            type: "number",
        },
        req_status: {
            type: "string",
            required: true,
        },
        req_type: {
            type: "string",
        },
        sub_type: {
            type: "string",
        },
    },

    fn: async function (inputs, exits) {
        const datetime = await sails.helpers.dateTime();
        switch (inputs.operation) {
            case 'create':
                if (!inputs.client_id || !inputs.req_status || !inputs.req_type) {
                    return exits.success({
                        status: "nok",
                        result: "clientId or request type missing"
                    });
                }
                try {
                    let createRecord = await ClientRequest.create({
                        request_id: inputs.request_id,
                        req_datetime: datetime,
                        client_id: inputs.client_id,
                        req_status: inputs.req_status,
                        is_active: "active",
                        req_type: inputs.req_type,
                        created_at: datetime,
                        updated_at: datetime,
                        sub_type: inputs.sub_type
                    }).fetch();

                    return exits.success({
                        status: "ok",
                        result: JSON.parse(JSON.stringify(createRecord))
                    });
                } catch (err) {
                    return exits.success({ status: "nok", result: "Creation of record failed" });
                }

            case 'update':
                try {
                    let updateRecord = await ClientRequest.update({
                        request_id: inputs.request_id,
                    }).set({ req_status: inputs.req_status }).fetch();

                    return exits.success({
                        status: "ok",
                        result: JSON.parse(JSON.stringify(updateRecord))
                    });
                } catch (error) {
                    return exits.success({ status: "nok", result: "Updation of record failed" });
                }

            default:
                return exits.success({
                    status: "nok",
                    result: "Operation should be either create or update"
                });
        }

    },
};
