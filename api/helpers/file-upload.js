module.exports = {
  friendlyName: 'File Upload Helper',
  inputs: {
    document: {
      type: 'ref',
      description: 'File to be uploaded to s3',
      required: true
    },
    bucket: {
      type: 'string',
      description: 'S3 bucket name',
      required: true
    },
    region: {
      type: 'string',
      description: 'S3 region',
      required: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'File successfully upload to s3 bucket',
      outputDescription: 'Uploaded file description'
    },

    uploadError: {
      description: 'There is an error in uploading the file to s3'
    }
  },

  fn: async function(inputs, exits) {
    function filesUploaded(err, filesUploaded) {
      if (err) {
        return exits.uploadError(err);
      }
      
        filesUploaded.map(i => {
          i['fd'] = i.fd.split('/').pop();
        });
      return exits.success(filesUploaded);
    }
   
      var inputs_bucket_url = inputs.bucket.split('/');
      let container = inputs_bucket_url ? inputs_bucket_url[0] : inputs.bucket;
      let container_path = inputs_bucket_url ? inputs_bucket_url[1] : '';

      inputs.document.upload(
        {
          adapter: require('skipper-azure'),
          dirname: container_path,
          key: sails.config.azure.is_dev_env
            ? sails.config.azure.dev_env.storage.storageAccountName
            : sails.config.azure.prod_env.storage.storageAccountName,
          secret: sails.config.azure.is_dev_env
            ? sails.config.azure.dev_env.storage.secret
            : sails.config.azure.prod_env.storage.secret,
          container: container
        },
        filesUploaded
      );
  }
};
