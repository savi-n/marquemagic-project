module.exports = {
	friendlyName: "Date time",

	description: "Standard date time generator",

	inputs: {},

	exits: {
		success: {
			description: "All done."
		}
	},

	fn: async function (inputs, exits) {
		const moment = require("moment"),
			date = new Date(),
			formattedDate = moment(date).subtract(12, "minute").format("YYYY-MM-DD HH:mm:ss").toString();
		return exits.success(formattedDate);
	}
};
