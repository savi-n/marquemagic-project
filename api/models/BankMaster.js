/**
 * BankMaster.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	datastore: 'mysql_nc_document_app',
	tableName: 'dashboard_view',
	attributes: {
		id: {
			type: 'number',
			autoIncrement: true,
			columnType: 'int',
			isInteger: true
		},
		name: {
			type: 'string',
			columnType: 'varchar'
		},
		bank_type: {
			type: 'string',
			columnType: 'varchar'
		},
		type: {
			type: 'string',
			columnType: 'enum',
			isIn: ['BANK', 'GST', 'ITR'],
			defaultsTo: 'BANK'
		},
		logo: {
			type: 'string',
			columnType: 'varchar'
		},
		is_active: {
			type: 'string',
			columnType: 'enum',
			isIn: ['active', 'inactive'],
			defaultsTo: 'active'
		},
		inactive_msg: {
			type: 'string',
			columnType: 'varchar',
			allowNull: true
		},
		created_at: {
			type: 'ref',
			columnType: 'datetime',
			autoCreatedAt: true
		},
		updated_at: {
			type: 'ref',
			columnType: 'datetime',
			autoUpdatedAt: true
		}
	}
};
