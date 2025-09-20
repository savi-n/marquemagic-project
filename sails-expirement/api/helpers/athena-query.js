const AthenaExpress = require("athena-express"),
	AWS = require("aws-sdk");

const awsCredentials = {
	region: sails.config.awsAthena.region,
	accessKeyId: sails.config.awsAthena.key,
	secretAccessKey: sails.config.awsAthena.secret
};
AWS.config.update(awsCredentials);

const athenaExpressConfig = {aws: AWS},
	athenaExpress = new AthenaExpress(athenaExpressConfig);

module.exports = {
	friendlyName: "athena-query",
	description: "query using aws-athena express",

	inputs: {
		sql: {
			type: "string",
			required: true
		},
		db: {
			type: "string",
			required: true
		}
	},

	fn: async (inputs, exits) => {
		const myQuery = {
			sql: inputs.sql,
			db: inputs.db
		};

		athenaExpress
			.query(myQuery)
			.then((results) => {
				return exits.success({
					results: results,
					status: "ok",
					length: results.Items.length
				});
			})
			.catch((error) => {
				return exits.success({
					status: "nok"
				});
			});
	}
};
