function generateThreeDigitSequence() {
    const randomNum = Math.floor(Math.random() * 1000);
    const sequence = String(randomNum).padStart(3, '0');
    return sequence;
}


module.exports = {
	friendlyName: "common",
	inputs : {
		white_label_id : {
			type : "number"
		},
		is_user_vendor : {
			type : "boolean"
		},
		loan_product_id :{
			type : "string"
		}
	},
	exits: {
		success: {
			description: "All done."
		}
	},
	fn: async function (inputs, exits) {
		let loan_RefId, vendor_flag;
		if (inputs && inputs.white_label_id && inputs.is_user_vendor){
			const wl_data = await WhiteLabelSolutionRd.findOne({id : inputs.white_label_id }).select("assignment_type"),
			sequence_starts = wl_data?.assignment_type?.vendor_loan_ref_id_sequence;
			if (sequence_starts.length > 0){
				for (let i = 0; i < sequence_starts.length; i++){
					if (sequence_starts[i].loan_products.includes(Number(inputs.loan_product_id))){
						vendor_flag = sequence_starts[i].loan_ref_id_sequence_starts;
				}
			}
			}
			const formattedDate = moment(new Date()).format('DDMMYYYY');
				loan_RefId = vendor_flag + formattedDate + generateThreeDigitSequence();
		} else {
			const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
				loanRefQuery = "Select MAX(SUBSTR(loan_ref_id,-8))+1 as maxRefId from loanrequest",
				loanRefId = await myDBStore.sendNativeQuery(loanRefQuery),
				loanRefRowData = loanRefId.rows,
				alphabet = "ABCDEFGHIJKLMNOPQRSTUWXYZ";
			let maxRefId = loanRefRowData[0].maxRefId;
			const pass = [],
				alphaLength = alphabet.length - 1;

			for (let i = 0; i < 4; i++) {
				pass.push(alphabet[Math.floor(Math.random() * alphaLength + 0)]);
			}
			for (let j = maxRefId.toString().length; j < 8; j++) {
				maxRefId = "0" + maxRefId;
			}
			first_alpha = pass.join("");
			loan_RefId = first_alpha + maxRefId;
		}
		return exits.success(loan_RefId);
	}
};
