module.exports = {
	friendlyName: "log service ",

	description: "Return a api details ",

	inputs: {
		params: {
			type: "ref",
			description: "The current incoming request (req)",
			required: true
		},
		action: {
			type: "string",
			required: true
		},
		result_id: {
			type: "string",
			columnType: "varchar"
		},
		reference_table: {
			type: "string",
			required: true
		}
	},

	fn: async function (inputs, exits) {
		//current date time
		function dateToString(date) {
			const month = date.getMonth() + 1,
				day = date.getDate();
			let dateOfString = date.getFullYear() + "-";
			dateOfString += (("" + month).length < 2 ? "0" : "") + month + "-";
			dateOfString += (("" + day).length < 2 ? "0" : "") + day;
			return dateOfString;
		}

		const currentdate = new Date();
		let datetime = "";
		datetime += dateToString(currentdate);
		datetime += " ";
		datetime +=
			(currentdate.getHours() < 10 ? "0" + currentdate.getHours() : currentdate.getHours()) +
			":" +
			(currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) +
			":" +
			(currentdate.getSeconds() < 10 ? "0" + currentdate.getSeconds() : currentdate.getSeconds());

		//----------------------
		const action = inputs.action,
			params = inputs.params,
			result_id = inputs.result_id,
			table_name = inputs.reference_table,
			routeTrackDetails = await RouteTrackRd.findOne({route_name: action, mode: 2});
		if (routeTrackDetails && typeof routeTrackDetails !== "undefined") {
			const method = params.method;
			let actionMethod = "";
			switch (method) {
				case "POST":
					if (action === "login") {
						actionMethod = "Read";
					} else {
						actionMethod = "Save";
					}
					break;
				case "PUT":
					actionMethod = "Update";
					break;
				case "GET":
					actionMethod = "Read";
					break;
				default:
					actionMethod = "Read";
			}

			let ip_address = params.ip;
			if (ip_address.substr(0, 7) === "::ffff:") {
				ip_address = ip_address.substr(7);
			}
			let userid;
			if (action === "login") {
				userid = result_id;
			} else {
				userid = params.user["id"];
			}
			data = {
				route_id: routeTrackDetails.id,
				url: params.baseUrl + params.url,
				action: actionMethod,
				action_result_id: result_id,
				action_reference: table_name,
				ip_address: ip_address,
				request_time: datetime,
				user_id: userid
			};

			console.log("ipaddress" + ip_address);
			const createdRecord = await AuditLogTable.create(data).fetch();
		}
		return exits.success(inputs.req);
	}
};
