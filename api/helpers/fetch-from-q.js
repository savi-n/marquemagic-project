const amqp = require('amqplib');

const ALLOWED_WHITE_LABELS = sails.config.ftr.allowedWhiteLabels;
const ALLOWED_PRODUCTS = sails.config.ftr.allowedProducts;

const waitFor2Sec = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 2000);
})


const updateClassificationData = async (records, action, ml_classification_track, upts) => {
  switch (action) {
    case "create":
      await LoanDocumentDetails
        .createEach(records)
      break;
    case "update":
      await LoanDocumentDetails
        .update({ doc_id: records })
        .set({ ml_classification_track, upts })
  }

}

const triggerDocumentClassification = async (messages) => {
  const whiteLabelId = Number((messages[0] && messages[0].white_label_id) || 0);

  let loanRecord = await Loanrequest
    .findOne({
      id: messages[0].loan_id
    })
    .select("loan_product_id");

  let productId;

  if (loanRecord && loanRecord.loan_product_id) productId = Number(loanRecord.loan_product_id || 0);

  if (ALLOWED_WHITE_LABELS.has(whiteLabelId) && ALLOWED_PRODUCTS.has(productId)) {
    let existingDocs = []; // this represents existing docs already present in document_details table
    const existingDocsSet = new Set();

    // as the input messages are all of the same loan our loan_id is constant for all messages
    if (messages.length > 0 && messages[0].loan_id) {
      existingDocs = await LoanDocumentDetails
        .find({
          loan_id: messages[0].loan_id
        })
        .select("doc_id")
    }

    for (doc of existingDocs) {
      existingDocsSet.add(doc.doc_id);
    }

    const newRecordsToBeCreated = [];
    const existingRecordsToBeUpdated = [];
    let ml_classification_track;

    for (message of messages) {
      message.director_id = Number(message.director_id);

      ml_classification_track = JSON.stringify({
        classificationStatus: "triggered",
        requestTimeStamp: await sails.helpers.istDateTime(),
        responseTimeStamp: "",
        classificationTime: "",
        requestPayload: message,
        classifiedData: ""
      });

      if (existingDocsSet.has(message.doc_id)) {
        existingRecordsToBeUpdated.push(message.doc_id);
      } else {
        newRecordsToBeCreated.push({
          doc_id: message.doc_id,
          loan_id: message.loan_id,
          did: message.director_id || 0,
          ml_classification_track,
          ints: await sails.helpers.systemDateTime(),
          upts: await sails.helpers.systemDateTime()
        })
      }
    }

    await updateClassificationData(newRecordsToBeCreated, "create");
    await updateClassificationData(
      existingRecordsToBeUpdated,
      "update",
      ml_classification_track,
      await sails.helpers.systemDateTime()
    );


    for (message of messages) {
      message.director_id = Number(message.director_id);

      let userTag = "OTHERS", docsSet = sails.config.ftr.docsSet;

      for (key in docsSet) {
        if (docsSet[key].has(Number(message.doc_type || 0))) {
          userTag = key;
          break;
        }
      }

      message.userTag = userTag;

      const apiRes = await sails.helpers.apiTrigger(
        sails.config.ftr.classificationUrl,
        JSON.stringify(message),
        { "content-type": "application/json" },
        "POST"
      );

      console.log("mlApiRes=>", message, apiRes);

      await waitFor2Sec;
    }
  }
}


module.exports = {


  friendlyName: 'Fetch from q',


  description: '',


  inputs: {
    qName: {
      type: "string",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {

    let channel;

    try {
      const connection = await amqp.connect(sails.config.ftr.queueUrl);

      channel = await connection.createChannel();

      await channel.assertQueue(inputs.qName);

      exits.success("listening to queue: " + inputs.qName);
    } catch (err) {
      return exits.success(err.message);
    }


    channel.consume(inputs.qName, async (msg) => {
      if (msg !== null) {
        let messages = JSON.parse(msg.content.toString());
        channel.ack(msg);

        switch (inputs.qName) {

          case `${sails.config.ftr.client}-${sails.config.qNames.GENERIC_Q}`:
            /* make sure the message is in array of objects format*/
            if (!Array.isArray(messages)) messages = [messages];
            messages.forEach(elm => {
              elm.classification_callback = (sails.config.hostName + "/ftr/callback/classification");
              elm.updateData = (sails.config.hostName + "/updateForensicData");
              elm.updateImageLoc = (sails.config.hostName + "/updateImageLoc");
            });

            await triggerDocumentClassification(messages);
            break;

          case `${sails.config.ftr.client}-${sails.config.qNames.KYC_Q}`:
            await sails.helpers.kycProcess(messages);
            break;
          case `${sails.config.ftr.client}-${sails.config.qNames.ICICI_APPLICATION_Q}`:
            console.log("icici", messages);
            /** We are not listending to non-kyc Q. So, nothing written here
            Our code will be fine without this block of code */
            break;
          default:
            console.log("wrong queue name passed- " + inputs.qName);
        }

      } else {
        console.log('Consumer cancelled by server');
      }
    });
  }


};
