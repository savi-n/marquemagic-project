module.exports = {
  friendlyName: "RocConvert",

  description: "Convert Roc Variable names to NC standards",

  inputs: {
    rocQuicko: {
      type: "string",
      required: true,
    },
    cin: {
      type: "string",
      required: true,
    }
  },

  exits: {
    success: {
      description: "All done.",
    },
  },

  fn: async function (inputs, exits) {
    let rocQuicko = inputs.rocQuicko;
    let cin = inputs.cin;

    let converted = {
      "cin": cin,
      "data": {
        "llp": {
          "CIN ": cin,
          "Company Name": rocQuicko.company_master_data.company_name,
          "ROC Code": rocQuicko.company_master_data.roc_code,
          "Registration Number": rocQuicko.company_master_data.registration_number,
          "Company Category": rocQuicko.company_master_data.company_category,
          "Company SubCategory": rocQuicko.company_master_data.company_subcategory,
          "Class of Company": rocQuicko.company_master_data.class_of_company,
          "Authorised Capital(Rs)": rocQuicko.company_master_data["authorised_capital(rs)"],
          "Paid up Capital(Rs)": rocQuicko.company_master_data["paid_up_capital(rs)"],
          "Number of Members(Applicable in case of company without Share Capital)": rocQuicko.company_master_data["number_of_members(applicable_in_case_of_company_without_share_capital)"],
          "Date of Incorporation": rocQuicko.company_master_data.date_of_incorporation,
          "Registered Address": rocQuicko.company_master_data.registered_address,
          "Address other than R/o where all or any books of account and papers are maintained": rocQuicko.company_master_data["address_other_than_r/o_where_all_or_any_books_of_account_and_papers_are_maintained"],
          "Email Id": rocQuicko.company_master_data.email_id,
          "Whether Listed or not": rocQuicko.company_master_data.email_id,
          "ACTIVE compliance": rocQuicko.company_master_data.active_compliance,
          "Suspended at stock exchange": rocQuicko.company_master_data.suspended_at_stock_exchange,
          "Date of last AGM": rocQuicko.company_master_data.date_of_last_agm,
          "Date of Balance Sheet": rocQuicko.company_master_data.date_of_balance_sheet,
          "Company Status(for efiling)": rocQuicko.company_master_data["company_status(for_efiling)"]
        }
      }
    }

    let rocCharges = [];
    for (let j in rocQuicko["charges"]) {
      rocCharges.push({
        "SNo": j,
        // "SRN": "G74969114",
        // "Charge Id": "100149904",
        "Charge Holder Name": rocQuicko["charges"][j].assets_under_charge,
        "Date of Creation": rocQuicko["charges"][j].date_of_creation,
        "Date of Modification": rocQuicko["charges"][j].date_of_modification,
        // "Date of Satisfaction": "-",
        "Amount": rocQuicko["charges"][j].charge_amount,
        "Status": rocQuicko["charges"][j].status
        // "Address": "BARAKHAMBA ROAD BRANCH,SOODHA AND BIRLA TOWERS,4TH FLOOR, EAST TOWER AND LGF WEST TOWER,New DelhiDL110001IN"
      })
    }
    converted.data.rocCharges = rocCharges;

    let directorDetails = [];
    for (let j in rocQuicko["directors/signatory_details"]) {
      let associated_companies = [];
      for (let k in rocQuicko["directors/signatory_details"][j].assosiate_company_details.company_data) {
        associated_companies.push({
          "CIN/FCRN": rocQuicko["directors/signatory_details"][j].assosiate_company_details.company_data[k]["cin/fcrn"],
          "Company Name": rocQuicko["directors/signatory_details"][j].assosiate_company_details.company_data[k].company_name,
          "Begin Date": rocQuicko["directors/signatory_details"][j].assosiate_company_details.company_data[k].begin_date,
          "End Date": rocQuicko["directors/signatory_details"][j].assosiate_company_details.company_data[k].end_date,
          "ACTIVE compliance": rocQuicko["directors/signatory_details"][j].assosiate_company_details.company_data[k].active_compliance
        })
      }

      let director = {
        "associated_companies": associated_companies,
        "Name": rocQuicko["directors/signatory_details"][j].name,
        "end_date": rocQuicko["directors/signatory_details"][j].end_date,
        "start_date": rocQuicko["directors/signatory_details"][j].begin_date,
        "surrendered_din": rocQuicko["directors/signatory_details"][j].surrendered_din
      }

      let resultNan = Number(rocQuicko["directors/signatory_details"][j]["din/pan"], 10);
      if (!isNaN(resultNan)) {
        director.ddin_no = rocQuicko["directors/signatory_details"][j]["din/pan"];
        director.dpancard = '-';
      }
      else {
        director.dpancard = rocQuicko["directors/signatory_details"][j]["din/pan"];
        director.ddin_no = '-';
      }
      directorDetails.push(director)
    }
    converted.data.director = directorDetails;
    return exits.success(converted);
  },
};
