/**
 * CaseNoMaster.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  datastore: 'mysql_nc_document_app',
  tableName: 'case_no_master',

  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnType: 'int',
      isInteger: true
    },
    case_no: {
      type: 'string',
      columnType: 'varchar'
    },
    request_id: {
      type: 'string',
      columnType: 'varchar'
    },
    upload_status: {
      type: 'string',
      columnType: 'enum',
      isIn: ['inprogress', 'completed', 'failed', 'cancelled']
    },
    s3_name: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    s3_region: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    cloud: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    s3_filepath: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    report_generated: {
      type: 'number',
      columnType: 'tinyint'
    },
    request_document_req_ids: {
      type: 'string',
      columnType: 'text'
    }
  }


};

