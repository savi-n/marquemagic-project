const AWS = require("aws-sdk");
AWS.config.update({region: "ap-southeast-1"});
const sqs = new AWS.SQS({apiVersion: "2012-11-05"});

module.exports = {
	fn: async function (inputs) {
		try {
			const result = await sendMessageToSQS(inputs);
			return result.MessageId;
		} catch (error) {
			return error;
		}
	}
};

async function sendMessageToSQS(inputs) {
	let params = inputs;

	try {
		const sendMessageResult = await sqs.sendMessage(params).promise();
		console.log("SQS insertion successful", sendMessageResult.MessageId);
		return sendMessageResult;
	} catch (error) {
		console.log("Error:", error);
		throw error;
	}
}
