module.exports = {
	friendlyName: "Filesize",

	description: "Filesize something.",

	inputs: {
		bytes: {
			type: "number",
			description: "filesize digits with units",
			required: true
		},
		decimals: {
			type: "number",
			default: 2,
			description: "filesize digits with two digits"
		}
	},

	exits: {
		success: {
			description: "All done."
		}
	},

	fn: async function (inputs, exits) {
		if (inputs.bytes === 0) {
			return exits.success("0 Bytes");
		}
		const k = 1024,
			dm = inputs.decimals < 0 ? 0 : inputs.decimals;
		sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

		const i = Math.floor(Math.log(inputs.bytes) / Math.log(k));
		size = parseFloat((inputs.bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];

		return exits.success(size);
	}
};
