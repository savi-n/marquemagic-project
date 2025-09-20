/**
 * ApprovalStatus.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */


module.exports = {

  datastore: "mysql_namastecredit_read",
  tableName: "approval_status",
  attributes: {
    id: {
      type: 'number', // Assuming 'id' is a numeric identifier
      autoIncrement: true,
      unique: true,
      required: true,
    },
    status_name: {
      type: 'string',
      required: true,
      isIn: ['Pending', 'Reassigned', 'approved', 'rejected', 'action taken'], // Define your enum values here
    },
    status: {
      type: 'string',
      required: true,
      isIn: ['Pending', 'Reassigned', 'approved', 'rejected', 'action taken'], // Define your enum values here
    },
    white_label_id: {
      type: 'number',
    },
    exclude_users: {
      type: 'longtext', // Use 'longtext' for large text or JSON data
    },
    actions: {
      type: 'longtext', // Use 'longtext' for large text or JSON data
    },
  },
};
