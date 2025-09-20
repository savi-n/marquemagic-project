module.exports = {
    friendlyName: "White label id",
	description: "White label id api",

	inputs: {
		email: {
			type: "string",
			description: "email",
			required: true
		},
		white_label_id: {
			type: "string",
			description: "whiteLabel Id",
			required: true
		}
	},
	exits: {
		success: {
			description: "All done."
		}
	},

	fn: async function (inputs, exits) {
		const userData = await UsersRd.findOne({email: inputs.email});
		 whiteLabelId = userData.white_label_id.split(",");
		if (userData && whiteLabelId.includes(inputs.white_label_id) === false) {
			userData.white_label_id += `,${inputs.white_label_id}`;
			const updateUserData = await Users.update({email: inputs.email})
				.set({white_label_id: userData.white_label_id}).fetch();
			return exits.success(inputs.white_label_id);
		} else {
		 	return exits.success(inputs.white_label_id);
		}
	}
};