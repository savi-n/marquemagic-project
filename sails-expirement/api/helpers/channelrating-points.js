module.exports = {
	inputs: {
		object_points: {
			type: "json",
			description: "Object for fetching key-value pairs",
			required: true
		},
		value_points: {
			type: "string",
			description: "values to fetch the points value",
			required: true
		}
	},
	fn: async function (inputs, exits) {
		const channel_points = await ChannelRatingPointsRd.findOne({channel_status: inputs.object_points});
		function getItem(value) {
			let item;
			Object.keys(channel_points.points_value).some((k) => {
				const part = k.split("-");
				if (+value >= part[0] && +value <= (part[1] || part[0])) {
					item = channel_points.points_value[k];
					return true;
				}
				if (part == part[0]) {
					const part_1 = part[0].split("+");
					if (+value >= part_1[0]) {
						item = channel_points.points_value[k];
						return true;
					}
					const part_2 = part[0].split("<");
					if (+value < part_2[1]) {
						item = channel_points.points_value[k];
						return true;
					}
					const part_3 = part[0].split(">");
					if (+value > part_3[1]) {
						item = channel_points.points_value[k];
						return true;
					}
				}
			});
			return item;
		}
		return exits.success(getItem(inputs.value_points));
	}
};
