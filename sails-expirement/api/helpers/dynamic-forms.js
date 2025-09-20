module.exports = {
	friendlyName: "dynamic_forms helper",
	inputs: {},
	exits: {
		success: {
			description: "success"
		}
	},
	fn: async function (inputs, exits) {
		data = {
			offer_details: {
				name: "Give Offers",
				fields: [
					{
						name: "status",
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
						db_key: "status"
					},
					{
						name: "offer_amnt",
						placeholder: "Please enter offer amount in INR:",
						rules: {
							required: true
						},
						type: "text",
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						sub_fields: [
							{
								name: "units",
								for_type: ["Approve"],
								for_type_name: "status",
								db_key: "offer_amnt_um",
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
								],
								value: "Lakhs"
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
						for_type: ["Approve"],
						for_type_name: "status",
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
						for_type: ["Approve"],
						for_type_name: "status",
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
						for_type: ["Approve"],
						for_type_name: "status",
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
						for_type: ["Approve"],
						for_type_name: "status",
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
						name: "property_insurance",
						placeholder: "Property Insurance Charges:",
						rules: {},
						type: "text",
						for_type: ["Approve"],
						for_type_name: "status",
						visibility: true,
						currency: "INR",
						option: [],
						db_key: "fee1",
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						}
					},
					{
						name: "life_insurance",
						placeholder: "Life Insurance Charges:",
						rules: {},
						type: "text",
						visibility: true,
						currency: "INR",
						for_type: ["Approve"],
						for_type_name: "status",
						option: [],
						db_key: "fee2",
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						}
					},
					{
						name: "health_insurance",
						placeholder: "Health Insurance Charges:",
						rules: {},
						type: "text",
						for_type: ["Approve"],
						for_type_name: "status",
						visibility: true,
						currency: "INR",
						option: [],
						db_key: "fee3",
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
						for_type: ["Approve"],
						for_type_name: "status",
						option: [],
						db_key: "disburse_time",
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
						for_type: ["Approve"],
						for_type_name: "status",
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
								name: "Case Sanctioned But Not Disbursed",
								value: 12
							},
							{
								name: "Case Disbused Fully",
								value: 16
							},
							{
								name: "Case Disbursed Partially",
								value: 17
							}
						],
						value: 12,
						db_key: "sanction_type"
					},
					{
						name: "sanction_date",
						placeholder: "Select Sanction Date:",
						rules: {
							required: true
						},
						type: "date",
						visibility: true,
						option: [],
						db_key: "san_date"
					},
					{
						name: "sanction_amount",
						placeholder: "Enter Sanctioned Amount:",
						rules: {
							required: true
						},
						type: "text",
						visibility: true,
						sub_fields: [
							{
								name: "units",
								db_key: "amount_um",
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
								],
								value: "Lakhs"
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
						placeholder: "Enter Sanctioned Interest:",
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
						placeholder: "Enter Sanctioned Fee:",
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
						placeholder: "Enter Lender Loan Id:",
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
						name: "disbursed_amount",
						placeholder: "Enter Disbursed Amount:",
						rules: {
							required: true
						},
						sub_fields: [
							{
								name: "units",
								db_key: "disbursement_amt_um",
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
								],
								value: "Lakhs"
							}
						],
						for_type: [17],
						for_type_name: "sanction_type",
						type: "text",
						visibility: true,
						option: [],
						is_masked: true,
						mask: {
							mask_values: {},
							number_only: true
						},
						db_key: "disbursement_amt"
					},
					{
						name: "disbursed_date",
						placeholder: "Select Disbursed Date:",
						rules: {
							required: true
						},
						for_type: [17],
						for_type_name: "sanction_type",
						type: "date",
						visibility: true,
						option: [],
						db_key: "disbursement_date"
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
			},
			add_disbursement: {
				name: "",
				sub_sections: [
					{
						name: "Add Disbursement",
						fields: [
							{
								name: "disbursement_amt",
								db_key: "disbursement_amt",
								placeholder: "Disbursed Amount",
								type: "text",
								rules: {
									required: true
								},
								mask: {
									mask_values: {},
									number_only: true
								},
								sub_fields: [
									{
										name: "units",
										for_type: ["Approve"],
										for_type_name: "status",
										db_key: "disbursement_amt_um",
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
										],
										value: "Lakhs"
									}
								],
								currency: "INR",
								visibility: true
							},
							{
								name: "disbursement_date",
								db_key: "disbursement_date",
								placeholder: "Disbursed Date",
								type: "date",
								rules: {
									required: true
								},
								visibility: true
							},
							{
								name: "lender_confirmation",
								db_key: "lender_confirmation",
								placeholder: "Upload Lender Confirmation File",
								type: "upload",
								rules: {
									required: true
								},
								visibility: true
							},
							{
								name: "repayment_doc",
								db_key: "repayment_doc",
								placeholder: "Upload Loan Repayment Schedule Documents",
								type: "upload",
								rules: {
									required: true
								},
								visibility: true
							},
							{
								name: "channel_invoice",
								db_key: "channel_invoice",
								placeholder: "Upload Channel Partner Invoices",
								type: "upload",
								rules: {
									required: true
								},
								visibility: true
							}
						]
					}
				]
			}
		};
		return exits.success(data);
	}
};
