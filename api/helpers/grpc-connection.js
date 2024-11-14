const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const protoPath = path.join(__dirname, sails.config.grpc.protoPath);

let packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
let UserService = grpc.loadPackageDefinition(packageDefinition).UserService;

const client = new UserService(sails.config.grpc.url, grpc.credentials.createInsecure());

module.exports = {

    friendlyName: 'Grpc connection',

    description: 'Creating the grpc stub to access server',

    inputs: {
    },

    exits: {
        success: {
            description: 'All done.',
        },
    },

    fn: async function (inputs, exits) {
        return exits.success(client);
    }
};

