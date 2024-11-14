const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const xml2js = require('xml2js');
const path = require('path');
let xmlParser = require('xml2json');

function format(html) {
  var tab = '\t';
  var result = '';
  var indent= '';

  html.split(/>\s*</).forEach(function(element) {
    if (element.match( /^\/\w/ )) {
      indent = indent.substring(tab.length);
    }

    result += indent + '<' + element + '>\r\n';

    if (element.match( /^<?\w[^>]*[^\/]$/ ) && !element.startsWith("input")  ) { 
      indent += tab;              
    }
  });

  return result.substring(1, result.length-3);
}
async function insertLoanDocument (object) {
  const {Loan_id, business_id, userid, docTypeId, fileName, director_id} = object;
  const dateTime = await sails.helpers.dateTime();
  for (const files of fileName){
    const equifaxDocument = await LoanDocument.find({
      loan: Loan_id,
      business_id,
      user_id: userid,
      doctype: docTypeId,
      doc_name: files,
      directorId: director_id
    });
    //if the document already exists, then update
    if(equifaxDocument.length > 0){
      await LoanDocument.update({id: equifaxDocument[0].id})
                        .set({
                          status : "inactive"
                        });
    }
    await LoanDocument.create({
      loan: Loan_id,
      business_id,
      user_id: userid,
      directorId: director_id,
      doctype: docTypeId,
      doc_name: files,
      uploaded_doc_name: files,
      original_doc_name: files,
      ints: dateTime,
      on_upd: dateTime
    });
  }
}

module.exports = {


  friendlyName: 'Upload equifax document',


  description: '',


  inputs: {

    xml: {
      type: 'string',
      required: true
    },
    business_id: {
      type: 'string',
      required: true
    },
    director_id: {
      type: 'string',
      required: true
    },
    white_label_id: {
      type: 'number',
      required: true
    },
    userid: {
      type: 'number',
      required: true
    },
    loanRequestResult: {
      type: 'ref',
      required: true
    },

    isUrlRequired: {
      type: 'boolean'
    }

  },

  exits: {

    success: {
      description: 'All done.',
    },
    failure: {
      description: 'Failed'
    }
  },


  fn: async function (inputs, exits) {
    // TODO

    try{

      let { xml, business_id, director_id, isUrlRequired, white_label_id, userid, loanRequestResult } = inputs;

      // const { white_label_id, userid } = await Business.findOne({id: business_id})
      //                                                  .select(["white_label_id", "userid"]);

      // const loanRequestResult = await Loanrequest.find({business_id: business_id})
      //                              .select(["id", "loan_ref_id"]);

      const { s3_name, s3_region } = await WhiteLabelSolutionRd
                                          .findOne({id: white_label_id})
                                          .select(["s3_name", "s3_region"])
      const parsedJson = JSON.parse(xmlParser.toJson(xml));
      // const scoreObj = parsedJson['soapenv:Envelope']['soapenv:Body']['sch:InquiryResponse']["sch:ReportData"]["sch:Score"];
      // const cibilScore = scoreObj["sch:Value"];
      let errorData, scoreObj, htmlObj, cibilScore;

      try {
        if (parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:ReportData"]["sch:Error"]) {
          errorData = parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:ReportData"]["sch:Error"]["sch:ErrorMsg"];
          return exits.success({
            status: "nok",
            message: errorData
          });

        } else {
          scoreObj = parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:ReportData"]["sch:Score"];
          htmlObj = parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:HtmlReportResponse"]["sch:Content"];
          cibilScore = scoreObj["sch:Value"];

        }
      } catch (error) {
        return exits.success({
          status: "nok",
          message: error.message
        })
      }

      const filePath = `users_${userid}`,
        fileContent = xml;

      let fileName = `${loanRequestResult[0].loan_ref_id}_${director_id}.xml`;
      const htmlFileName = `${loanRequestResult[0].loan_ref_id}_${director_id}.html`;
      let s3UploadDocHtml;
      const s3UploadDoc = await sails.helpers.s3UploadDirectFileContent(s3_name, s3_region, filePath, fileName, fileContent);
      if (htmlObj){
        htmlObj = format(htmlObj);
        s3UploadDocHtml = await sails.helpers.s3UploadDirectFileContent(s3_name, s3_region, filePath, htmlFileName, htmlObj);
      }
      if (s3UploadDoc.status === "nok" || s3UploadDocHtml === "nok") {
        return exits.success({ status: "nok", message: "Error uploading Equifax Document. Please try again." });
      }
      await insertLoanDocument({
        Loan_id : loanRequestResult[0].id,
        business_id,
        userid,
        docTypeId : sails.config.equifax.docTypeId,
        fileName : [fileName, htmlFileName],
        director_id
      });
      let url;

      if(isUrlRequired){
      // const key = s3_name;
        const path = `users_${userid}/${fileName}`;
        url = await sails.helpers.s3View(s3_name, path);
      }

      return exits.success({
        status: 'ok',
        message: 'Updated successfuly',
        cibilScore: cibilScore,
        url
      });
  
      
    } catch (error) {

      return exits.success({
        status: "nok",
        message: error.message
      });
      
    }

  }

};
