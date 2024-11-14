const amqp = require('amqplib');

module.exports = {


  friendlyName: 'Insert into q',


  description: '',


  inputs: {
    qName: {
      type: "string",
      required: true
    },
    message: {
      type: "ref",
      require: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {

    let message;

    try {
      const connection = await amqp.connect(sails.config.ftr.queueUrl);

      const channel = await connection.createChannel();

      const msg = JSON.stringify(inputs.message);

      const result = await channel.sendToQueue(`${sails.config.ftr.client}-${inputs.qName}`, Buffer.from(msg));
      
      message = result;
    } catch (error) {
      console.log(error);
      message = error.message;
    }

    exits.success(message);
  }

};

