module.exports = {
	friendlyName: "Eligibility calculator",

	description: "Function for eligibility calculator",

	inputs: {
		dataCal: {
			type: "ref",
			description: "Calculation data containing rules",
			required: true
		},
		dataComparsion: {
			type: "ref",
			description: "Calculation data used for replacing expression",
			required: true
		},
		rule: {
			type: "string",
			description: "Rule type it can be input or ouput",
			required: true
		}
	},

	exits: {
		success: {
			description: "All done."
		}
	},

	fn: async function (inputs, exits) {
		const realData = inputs.dataComparsion,
			data = inputs.dataCal;
		data.forEach((eligibility_rule) => {
			let map_questions = eligibility_rule.map_questions;
			map_questions = map_questions.split(",");
			map_questions.forEach((question) => {
				const q_id = question.split("Q");
				if (inputs.rule === "input") {
					var index = _.findIndex(realData, (o) => {
						return o.question_id == q_id[1];
					});
					if (index != -1) {
						eligibility_rule.rule = eligibility_rule.rule.replace(question, realData[index].answer);
					} else {
						eligibility_rule.rule = eligibility_rule.rule.replace(question);
					}
				} else {
					var index = _.findIndex(realData, (o) => {
						return o.question_id == q_id[1] && o.lender_id == eligibility_rule.lender_id;
					});
					if (index != -1) {
						eligibility_rule.rule = eligibility_rule.rule.replace(question, realData[index].rule);
					}
				}
			});
			if (eval(eligibility_rule.rule) == true || eval(eligibility_rule.rule) == false) {
				const str =
					eligibility_rule.rule.indexOf("<") != -1
						? eligibility_rule.rule.split("<")
						: eligibility_rule.rule.split(">");
				str.sort((a, b) => (a > b ? a - b : b > a ? b - a : 0));
				eligibility_rule.rule = Number(str[0]);
			} else {
				eligibility_rule.rule = eval(eligibility_rule.rule);
			}
		});
		return exits.success(data);
	}
};
