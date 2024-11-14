const getNameStrings = (fullname) => {
  let names = fullname.split(" ");
  let firstName = "", middleName = "", lastName = "";

  if (names.length > 2) {
    middleName = names[names.length - 2];
    lastName = names[names.length - 1];
    for (let i = 0; i < names.length - 2; i++) {
      firstName += names[i];
      if (i < names.length - 3) firstName += " ";
    }
  } else {
    firstName = names[0];
    lastName = names[1] || ""
  }

  return { firstName, middleName, lastName };

}

//const get

module.exports = {


  friendlyName: 'Store kyc data',


  description: '',


  inputs: {
    businessId: {
      type: "number",
      required: true
    },
    kycKey: {
      type: "string",
      required: true
    },
    kycType: {
      type: "string",
      required: true
    },
    data: {
      type: "ref",
      required: true
    }
  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs, exits) {
    if (inputs.kycType === "pan") {

      let panExists = await PannoResponse.count({
        kyc_key: inputs.kycKey
      });

      const { firstName, middleName, lastName } = getNameStrings(inputs.data.extractionData.Name);

      let panRes;

      if (panExists) {
        panRes = await PannoResponse
          .update({ kyc_key: inputs.kycKey })
          .set({ verification_response: JSON.stringify(inputs.data) });
      } else {
        panRes = await PannoResponse.create({
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          kyc_key: inputs.kycKey,
          verification_response: JSON.stringify(inputs.data),
        });
      }

      return exits.success(panRes);


    } else {
      let createObject = {
        kyc_key: inputs.kycKey,
        verification_response: JSON.stringify(inputs.data),
        type: inputs.kycType,
        ref_id: inputs.businessId
      }

      ekycCreated = await EKycResponse.create(createObject);

      return exits.success(ekycCreated);
    }
  }


};
