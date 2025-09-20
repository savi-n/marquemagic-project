module.exports = {
	friendlyName: "dynamic_forms helper",
	exits: {
		success: {
			description: "success"
		}
	},
	fn: async function () {
		data = {
			offer_details: {
				name: "Give Offers",
				fields: [
					{
						name: "offer_approval",
						placeholder: "Please select your Option :",
						rules: {
							required: true
						},
						type: "select",
						visibility: true,
						option: [
							{
								value: "Approve",
								name: "Approve"
							},
							{
								value: "Reject",
								name: "Reject"
							}
						],
						db_key: "offer_approval"
					},
					{
						name: "offer_amount",
						placeholder: "Please enter offer amount in INR:",
						rules: {
							required: true
						},
						sub_fields: [
							{
								name: "units",
								db_key: "loan_amount_um",
								type: "radio",
								option: [
									{
										name: "Lakhs",
										value: "Lakhs"
									},
									{
										name: "Crores",
										value: "Crores"
									}
								]
							}
						],
						visibility: true,
						db_key: "offer_amnt"
					},
					{
						name: "rate_of_interest",
						placeholder: "Enter Rate of Interest (% value):",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "interest_rate"
					},
					{
						name: "offer_tenure",
						placeholder: "Enter Tenure of offer (in months):",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "term"
					},
					{
						name: "emi",
						placeholder: "Enter EMI (in decimal numbers):",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "emi"
					},
					{
						name: "processing_fee",
						placeholder: "Enter Processing Fee (%value/actual amount):",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						db_key: "processing_fee",
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						}
					},
					{
						name: "disbursement_time",
						placeholder: "Enter expected time to disburse (in days):",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						db_key: "expected_time_to_disburse",
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						}
					},
					{
						name: "offer_validity",
						placeholder: "Enter offer validity (in no days):",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "offer_validity"
					},
					{
						name: "sanction_condition",
						placeholder: "Sanction Condition:",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							alpha_number_only: true
						},
						db_key: "remarks"
					},
					{
						name: "file_upload",
						placeholder: "Click or drag file to this area to upload",
						rules: {},
						type: "upload",
						visibility: true,
						option: [],
						db_key: "upload_doc"
					}
				]
			},
			add_sanction: {
				name: "Add Sanction",
				fields: [
					{
						name: "add_sanction",
						placeholder: "Sanction Type:",
						rules: {
							required: true
						},
						type: "select",
						visibility: true,
						option: [
							{
								name: "Sanctioned",
								value: "Sanctioned"
							}
						],
						db_key: "add_sanction"
					},
					{
						name: "sanction_date",
						placeholder: "Sanction Date:",
						rules: {
							required: true
						},
						type: "date",
						visibility: true,
						option: [],
						db_key: "san_date "
					},
					{
						name: "sanction_amount",
						placeholder: "Sanctioned Amount:",
						rules: {
							required: true
						},
						visibility: true,
						sub_fields: [
							{
								name: "units",
								db_key: "san_amount_um",
								type: "radio",
								option: [
									{
										name: "Lakhs",
										value: "Lakhs"
									},
									{
										name: "Crores",
										value: "Crores"
									}
								]
							}
						],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "san_amount"
					},
					{
						name: "sanction_interest",
						placeholder: "Sanctioned Interest:",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "san_interest"
					},
					{
						name: "sanction_fee",
						placeholder: "Sanctioned Fee:",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "sanction_process_fee"
					},
					{
						name: "lender_loan_id",
						placeholder: "Lender Loan Id:",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "lender_ref_id"
					},
					{
						name: "sanction_file",
						placeholder: "Upload Sanction file",
						rules: {},
						type: "upload",
						visibility: true,
						option: [],
						db_key: "upload_path"
					},
					{
						name: "loan_repayment_file",
						placeholder: "Upload Loan Repayment Schedule Documents",
						rules: {},
						type: "upload",
						visibility: true,
						option: [],
						db_key: "loan_repay"
					},
					{
						name: "channel_invoice_file",
						placeholder: "Upload Channel Partner Invoices",
						rules: {},
						type: "upload",
						visibility: true,
						option: [],
						db_key: "channel_invoice"
					}
				]
			}
		};
		return exits.success(data);
	}
};
