const {SsoCredentials} = require("aws-sdk");

module.exports = {
	friendlyName: "Report TAT helper",
	inputs: {
		assignedUserId: {
			type: "string",
			description: "assigned user id",
			required: true
		},
		assignedBy: {
			type: "string",
			description: "assigned By name",
			required: true
		},
		loan_id: {
			type: "number",
			description: "Loan Id",
			required: true
		},
		current_status: {
			type: "string",
			description: "current status",
			required: true
		},
		previous_status: {
			type: "string",
			description: "previous status",
			required: false
		},
		comments: {
			type: "string",
			description: "comments",
			required: false
		}
	},
	exits: {
		success: {
			description: "success"
		},

		error: {
			description: "error"
		}
	},
	fn: async function (inputs, exits) {
		const datetime = await sails.helpers.dateTime();
		let ReportTat = {
			assignedUserId: inputs.assignedUserId,
			assignedBy: inputs.assignedBy,
			dateTime: datetime,
			previous_status: inputs.previous_status,
			current_status: inputs.current_status,
			type: "Comments",
			count: 1,
			message: inputs.comments || ""
		};
		let report_tat_data;
		const loanData = await LoanrequestRd.findOne({id: inputs.loan_id});
		if (loanData) {
			if (loanData.reportTat) {
				let parseData = JSON.parse(loanData.reportTat);
				let data1 = parseData.data ? parseData.data : parseData;
				data1.map((element) => {
					if (element.current_status == inputs.current_status) {
						ReportTat.count = element.count + 1;
					}
				});
				if (!ReportTat.previous_status) {
					lasteData = data1[data1.length - 1];
					ReportTat.previous_status = lasteData.current_status;
				}
				data1.push(ReportTat);
				report_tat_data = JSON.stringify(parseData);

			} else {
				report_tat_data = JSON.stringify({data: [ReportTat]});
			}
			updateLoamData = await Loanrequest.update({id: inputs.loan_id}).set({reportTat: report_tat_data}).fetch();
			return exits.success({statusCode: "NC200", message: "Data updated successfuly", data: updateLoamData});
		} else {
			return exits.error({statusCode: "NC400", message: "No Data available."})
		}
	}
};
