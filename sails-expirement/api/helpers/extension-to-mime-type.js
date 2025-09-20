module.exports = {


  friendlyName: 'Extension to mime type',


  description: '',


  inputs: {
    extension: {
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

    const extension = inputs.extension.toLowerCase();

    const fileExtensionsToMimeTypes = {
      '.doc': 'application/msword',
      '.csv': 'text/csv',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.tif': 'image/tiff',
      '.tiff': 'image/tiff',
      '.txt': 'text/plain',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.json' : 'application/json',
      '.html': 'text/html',
      '.zip' : 'application/zip',
      '.xml' : 'text/xml'
    };
    
    const result = fileExtensionsToMimeTypes[extension];

    if(result && typeof(result)!=undefined) return exits.success(result);
    return exits.success("error");

  }


};

