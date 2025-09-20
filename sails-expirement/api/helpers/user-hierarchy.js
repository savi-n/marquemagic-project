module.exports = {
	friendlyName: "Get user Hierarchy",

	description: "Returns the hierarchy level for the requested user.",

	inputs: {
		user: {
			type: {}
		}
	},

	fn: async function (inputs, exits) {
		const user = inputs.user;
		if (user.is_lender_admin == 1) {
			return exits.success({
				hierarchy: 1,
				hierarchyName: sails.config.msgConstants.REGIONAL
			});
		} else if (user.is_state_access == 1) {
			return exits.success({
				hierarchy: 2,
				hierarchyName: sails.config.msgConstants.STATE
			});
		} else if (user.is_lender_manager == 1) {
			return exits.success({
				hierarchy: 3,
				hierarchyName: sails.config.msgConstants.CITY
			});
		} else if (user.is_branch_manager == 1) {
			return exits.success({
				hierarchy: 4,
				hierarchyName: sails.config.msgConstants.BRANCH
			});
		} else {
			return exits.success({
				hierarchy: 0,
				hierarchyName: ""
			});
		}
	}
};
