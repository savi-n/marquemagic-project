const { fuzzy } = require("fast-fuzzy");

const getFullName = (firstName, middleName, lastName) => {
  let fullname = firstName || "";
  if (middleName) fullname = fullname + " " + middleName;
  if (lastName) fullname = fullname + " " + lastName;
  return fullname;
}

module.exports = {
  friendlyName: "Generate ftr data",

  description: "",

  inputs: {
    doc_type: {
      type: "string",
      required: true,
    },
    extraction_data: {
      type: "ref",
      required: true,
    },
    directors: {
      type: "ref",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    let extraction_data = inputs.extraction_data;
    const doc_category = {
      SALARY_SLIP: "Employee_name",
      ITR: "name",
      BANK_STATEMENT: "Account_Holder",
    };
    // get the extracted name
    let extracted_name,
      directorId;

    for (const obj of extraction_data) {
      extracted_name = obj[doc_category[inputs.doc_type]];
      extracted_name = extracted_name && extracted_name.trim();
      if (extracted_name) break;
    }

    // check the name match
    if (extracted_name) {
      let maxSimilarity = 0;
      for (const element of inputs.directors) {
        let fullname = getFullName(element.dfirstname, element.middle_name, element.dlastname);
        let smallerName, biggerName;
        smallerName = (fullname.length <= extracted_name.length) ? fullname : extracted_name;
        biggerName = (fullname.length <= extracted_name.length) ? extracted_name : fullname;
        if (fullname) similarityPercentage = fuzzy(smallerName, biggerName);
        console.log(smallerName, biggerName, similarityPercentage);
        console.log(element.id);
        if (similarityPercentage >= 0.50) {
          console.log(smallerName, biggerName, similarityPercentage);
          console.log(element.id);
          if (maxSimilarity < similarityPercentage) {
            directorId = element.id;
            maxSimilarity = similarityPercentage;
          }
        }
      }
    }

    return exits.success(directorId);
  },
};
