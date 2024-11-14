const moment = require('moment-timezone');

module.exports = {
	friendlyName: 'Date time',

	description: 'Standard date time generator',

	inputs: {},

	exits: {
		success: {
			description: 'All done.'
		}
	},

	fn: async function (inputs, exits) {
		const date = new Date();
		const formattedDate = moment(date)
			.subtract(12, "minute")
			.format('YYYY-MM-DD HH:mm:ss')
			.toString();
		return exits.success(formattedDate);
	}
};
