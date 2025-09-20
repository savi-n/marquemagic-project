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
      required: true
    },
    qUrl: {
      type: "string"
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
      const connection = await amqp.connect(inputs.qUrl || sails.config.ftr.qUrl);

      const channel = await connection.createChannel();

      const msg = JSON.stringify(inputs.message);

      if (!inputs.qUrl) inputs.qName = sails.config.ftr.client + "-" + inputs.qName; // inputs.qUrl means it's a non-ftr Queue

      const result = await channel.sendToQueue(inputs.qName, Buffer.from(msg));
      message = result;

    } catch (error) {
      console.log(error);
      message = error.message;
    }

    exits.success(message);
  }


};
