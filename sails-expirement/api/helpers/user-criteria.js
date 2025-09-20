module.exports = {
	friendlyName: "User Criteria",

	description: "Return the criteria to be used while querying the user table.",

	inputs: {
		baseCriteria: {
			type: {}
		},
		loggedInUser: {
			type: {}
		},
		type: {
			type: "string"
		}
	},

	fn: async function (inputs, exits) {
		const baseCriteria = inputs.baseCriteria;
		const loggedInUser = inputs.loggedInUser;
		const type = inputs.type;

		if (loggedInUser.lender_id != null) {
			baseCriteria.lender_id = loggedInUser.lender_id;
		}
		if (type == sails.config.msgConstants.REGIONAL) {
			baseCriteria.is_lender_admin = sails.config.msgConstants.INTEGER_ONE;
		} else if (type == sails.config.msgConstants.STATE) {
			baseCriteria.is_state_access = sails.config.msgConstants.INTEGER_ONE;
			baseCriteria.state = loggedInUser.state;
			baseCriteria.is_lender_admin = sails.config.msgConstants.INTEGER_ZERO;
		} else if (type == sails.config.msgConstants.CITY) {
			baseCriteria.is_lender_manager = sails.config.msgConstants.INTEGER_ONE;
			baseCriteria.city = loggedInUser.city;
			baseCriteria.is_lender_admin = sails.config.msgConstants.INTEGER_ZERO;
			baseCriteria.is_state_access = sails.config.msgConstants.INTEGER_ZERO;
		} else if (type == sails.config.msgConstants.BRANCH) {
			baseCriteria.is_branch_manager = sails.config.msgConstants.INTEGER_ONE;
			baseCriteria.branch_id = loggedInUser.branch_id;
			baseCriteria.is_lender_admin = sails.config.msgConstants.INTEGER_ZERO;
			baseCriteria.is_state_access = sails.config.msgConstants.INTEGER_ZERO;
			baseCriteria.is_lender_manager = sails.config.msgConstants.INTEGER_ZERO;
		}

		return exits.success(baseCriteria);
	}
};
