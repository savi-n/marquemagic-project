function padLeadingZeros(num, size) {
	var s = num+"";
	while (s.length < size) s = "0" + s;
	return s;
}
module.exports = {
	friendlyName: "Application Ref Number",
    inputs: {
		white_label_id: {
			type: "string",
			description: "white label id",
			required: true
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
		let nameUpper, name, number, regExp;
        const whiteLabelId = await WhiteLabelSolutionRd.findOne({id : inputs.white_label_id}).select("name");
		if (!whiteLabelId){
            return exits.error({statusCode: "NC400", message: "No Data available."});
        }
		 nameUpper = whiteLabelId.name.toUpperCase();
		if (nameUpper.length > 3){
			name = nameUpper.slice(0, 4);
			regExp = /^[A-Z]{4}\_[0-9]{12}?$/;
		} else{
			name = nameUpper.slice(0, 3);
			regExp = /^[A-Z]{3}\_[0-9]{12}?$/
		}
		const loanData = await LoanrequestRd.find({white_label_id : inputs.white_label_id, application_ref: {contains: name}}).sort("id DESC").limit(1);
		if(loanData.length > 0 ){
		if(regExp.test(loanData[0].application_ref)){
			let appData = loanData[0].application_ref.split("_");
				name = appData[0];
				number = padLeadingZeros((Number(appData[1]) + 1), 12);
		} else {
			number = number = padLeadingZeros(1, 12);
		}
		} else {
			number = number = padLeadingZeros(1, 12);
		}

		application_ref = `${name}_${number}`;
		return exits.success(application_ref);
	}
};
