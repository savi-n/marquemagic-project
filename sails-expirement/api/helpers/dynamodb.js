const AWS = require("aws-sdk");
//dynamo aws connection
AWS.config.update({
	accessKeyId: sails.config.aws.key,
	secretAccessKey: sails.config.aws.secret,
	region: sails.config.aws.region
});
AWS.config.apiVersions = {
	dynamodb: "2012-08-10"
};
//dynamo connection
const dynamodb = new AWS.DynamoDB(),
	//create table
	createDynamoTable = async function (params) {
		const dynamoresult = await dynamodb.createTable(params, (err, res) => {
			if (err) {
				return err.message;
			} else {
				return res;
			}
		});
	},
	insertItemDynamoTable = async function (params) {
		const dynamoresult = await dynamodb.putItem(params, (err, data) => {
			if (err) {
				console.log(err, err.stack);
			} else {
				return data;
			} // successful response
		});
		return dynamoresult;
	};
module.exports = {
	friendlyName: "Dynamo connection",

	description: "",

	inputs: {
		params: {
			type: "json",
			required: true
		},
		action: {
			type: "string",
			required: true
		},
		data: {
			type: "ref"
		}
	},
	fn: async function (inputs, exits) {
		let action = inputs.action,
			params = inputs.params,
			result;
		//if action to encrypt
		if (action == "CREATETABLE") {
			result = createDynamoTable(params);
			console.log(result);
		}
		if (action == "INSERT_ITEM") {
			dynamodb.putItem(params, (err, data) => {
				if (err) {
					console.log(err, err.stack);
				} else {
					console.log(data);
				} // successful response
				return exits.success(data);
			});
		}
		if (action == "READ_ITEM") {
			dynamodb.getItem(params, (err, data) => {
				if (err) {
					console.log(err, err.stack);
				}
				//console.log(data); // successful response
				else {
					return exits.success(data);
				}
			});
		}
		if (action == "SCAN_READ_ITEM") {
			dynamodb.scan(params, (err, data) => {
				if (err) {
					console.log(err, err.stack);
				}
				//console.log(data); // successful response
				else {
					return exits.success(data);
				}
			});
		}
		if (action == "UPDATE_ITEM") {
			dynamodb.updateItem(params, (err, data) => {
				if (err) {
					console.log(err, err.stack);
				}
				//console.log(data); // successful response
				else {
					return exits.success(data);
				}
			});
		}
	}
};
