module.exports = {


  friendlyName: 'Set ins master map',


  description: '',


  inputs: {

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    const insMaster = await InsuranceMasterRd.find();
    const insMasterMap = sails.config.insurance.insMasterMap = new Map();
    for (elm of insMaster) {
      insMasterMap.set(elm.ins_id, {
        vendor_available: elm.vendor_available,
        vendor_integrated: elm.vendor_integrated,
        ins_name: elm.ins_name,
        ins_type: elm.ins_category,
        company: elm.company,
        high_level_category: elm.high_level_category
      })
    }

    exits.success(1);
  }


};
