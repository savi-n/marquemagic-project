module.exports = {
  friendlyName: "Document Upload Helper",
  inputs: {
    document: {
      type: "ref",
      description: "File to be uploaded to local disk",
      required: true
    },
    dirname: {
      type: "string",
      required: true,
      description: "File storage location"
    }
  },
  exits: {
    success: {
      outputFriendlyName: "File successfully uploaded",
      outputDescription: "Uploaded file description"
    },

    uploadError: {
      description: "There is an error in uploading the file"
    },
  },

  fn: async function (inputs, exits) {
    function filesUploaded(err, filesUploaded) {
      if (err) {
        return exits.uploadError(err);
      }
      return exits.success(filesUploaded);
    }

    inputs.document.upload(
      {
        maxBytes: 50000000,
        dirname: inputs.dirname
      },
      filesUploaded
    );
  },
};
