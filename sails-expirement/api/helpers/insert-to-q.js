const amqp = require('amqplib/callback_api');

module.exports = {


  friendlyName: 'Insert into queue',


  description: '',


  inputs: {
    qName: {
      type: "string",
      required: true
    },
    loan_id : {
      type : "number",
      required : true
    },
    white_label_id : {
      type : "number",
      required : true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const {qName, loan_id, white_label_id} = inputs;
    let message;

    try {
      const connection = await amqp.connect(sails.config.q_names.q_url),
         channel = await connection.createChannel();
         //msg = JSON.stringify(inputs.message);
         channel.assertQueue(inputs.qName, {durable: false});
         msg.mailResponse = await sails.helpers.emailTemplate(qName, white_label_id, loan_id);
	const msg = JSON.stringify(inputs.message);
         result = await channel.sendToQueue(inputs.qName, Buffer.from(msg));
         message = result;

    } catch (error) {
      console.log(error);
      message = error.message;
    }

    exits.success(message);
  }


};
