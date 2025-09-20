/**
 * LoanDocumentExt.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  datastore: "mysql_namastecredit_read",
    tableName: "loan_document_ext",
  
    attributes: {
      id: {
        type: "number",
        autoIncrement: true,
        columnType: "int",
        isInteger: true
      },
      loan_id: {
        model: "loandocument",
        columnName: "loan_id"
      },
      loan_document_id: {
        type: "number",
        columnType: "int",
        isInteger: true
      },
      doc_ref_id: {
        type: "number",
        columnType: "int",
        isInteger: true
      },
      csv_ref_id: {
        type: "number",
        columnType: "int"
      }

    },

};

