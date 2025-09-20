const AWS = require("aws-sdk");

const sns = new AWS.SNS({
  region: "ap-south-1"
});
module.exports = {
    friendlyName: "SNS mailer",
    description: "Send email, when the pincode is not exist in the database",

	inputs: {
		pincode: {
			type: "string",
			required: true
		},
    response : {
      type: "string",
			required: true
    },
    loan_ref_id: {
      type: "string"
    }
	},
    fn: async (inputs, exits) => {
        let {pincode, response, loan_ref_id} = inputs;
        let message;
        if (loan_ref_id){
          message = `For the Pincode - ${pincode}, The data does not exist in NC database. \n I have given the CUB details below, Please update the pincode, city and state for the loan_ref_id : ${loan_ref_id}. \n \n Response : \n ${response} `;
        } else {
          message = `For the Pincode - ${pincode}, The data does not exist in NC database, Please update. \n \n Response : \n ${response}`;
        }
        const params = {
          Subject: "Pincode Update",
          Message: message,
          TopicArn: "arn:aws:sns:ap-south-1:935253607420:nodejs-application-issues"
        };

const publishToSNS = async () => {
  try {
    const { MessageId } = await sns.publish(params).promise()
    console.log(`Your message with id ${ MessageId } has been delivered.`);
  } catch (e) {
    console.log(e);
  }
}
publishToSNS();
    }
}