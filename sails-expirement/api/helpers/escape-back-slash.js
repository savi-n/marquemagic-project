module.exports = {
	friendlyName: "Escape Backslash",

	description: "Removes the backslash present in the requested input.",

	inputs: {
		jsonValue: {
			type: "string"
		}
	},

	fn: async function (inputs, exits) {
		return exits.success(
			JSON.parse(inputs.jsonValue, (key, value) => {
				if (typeof value === "string") {
					return value.replace(/\\n/g, "\n"); // Replace '\n' with a newline character
				}
				return value;
			})
		);
	}
};
