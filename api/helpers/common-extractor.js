module.exports = {


  friendlyName: 'Common extractor',


  description: '',


  inputs: {
    url: {
      type: "string",
      required: true
    },
    payload: {
      type: "ref",
      required: true
    },
    requestId: {
      type: "string"
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const { url, payload, requestId } = inputs;
    let response;
    console.log("requestId", requestId);
    payload.unique_id = requestId;
    try {
      if (requestId) {
        let data = await RequestDocument.update({ request_id: requestId }).set({
          s3_name: JSON.stringify({ main: payload.s3bucket }),
          s3_region: JSON.stringify({ main: payload.region }),
          cloud: JSON.stringify({ main: payload.cloud }),
          s3_filepath: JSON.stringify({ main: `${payload.s3bucket}/users_${payload.user_id}/${payload.doc_name}` })
        }).fetch();

        if (payload.req_type === "bank" ||
          payload.req_type === "salary" ||
          payload.req_type === "pnl" ||
          payload.req_type === "bs" ||
          payload.req_type === "gst" ||
          payload.req_type === "cibil") return exits.success(null);
      }


      response = await sails.helpers.apiTrigger(
        url,
        JSON.stringify(payload),
        {
          "content-type": "application/json"
        },
        "POST"
      );

      console.log(payload, response);

      if (typeof response === "string") response = JSON.parse(response);
    } catch (err) {
      return exits.success([500, { message: "Process failed" }]);
    }


    console.log(response);

    exits.success([200, response]);
  }


};

