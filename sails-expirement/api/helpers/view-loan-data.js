
module.exports = {
	inputs: {
		reqData: {
			type: "json",
			required: true
		},
		where_condition: {
			type: "json",
			required: true
		}
	},
	exits: {
		success: {
			description: "All done."
		}
	},
	fn: async function view_loan_data(inputs, exits) {

		const {loan_status_id,
			loan_sub_status_id,
			loan_bank_status_id,
			loan_borrower_status_id,
			meeting_flag, limit_count, page_count, status,
			search} = inputs.reqData;
		let view_loan_data;
		let sortingCondition;
		let modelRef;

		if (loan_status_id == 1 && !loan_sub_status_id) {
			modelRef = Viewloan_1Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Viewloan_1Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 1 && loan_sub_status_id == 1) {
			modelRef = Viewloan_1_1Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Viewloan_1_1Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 2 && loan_sub_status_id == 8) {
			modelRef = Viewloan_2_8Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Viewloan_2_8Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 8 && loan_sub_status_id == 12) {
			modelRef = Viewloan_8_12Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Viewloan_8_12Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 7 && loan_sub_status_id == 13) {
			modelRef = Viewloan_7_13Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Viewloan_7_13Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 2 && loan_sub_status_id == 7) {
			modelRef = Viewloan_2_7Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Viewloan_2_7Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 16 && loan_sub_status_id == 16) {
			modelRef = Viewloan_16_16Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Viewloan_16_16Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 2 && loan_sub_status_id == 9 && loan_bank_status_id == 9 && loan_borrower_status_id == 2) {
			modelRef = Viewloan_2_9_9_2Rd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await Viewloan_2_9_9_2Rd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 2 && loan_sub_status_id == 9 && loan_bank_status_id == 10 && loan_borrower_status_id == 4) {
			modelRef = Viewloan_2_9_10_4Rd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await Viewloan_2_9_10_4Rd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 2 && loan_sub_status_id == 9 && loan_bank_status_id == 12 && loan_borrower_status_id == 3) {
			modelRef = Viewloan_2_9_12_3Rd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await Viewloan_2_9_12_3Rd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 2 && loan_sub_status_id == 9 && loan_bank_status_id == 12 && loan_borrower_status_id == 10) {
			modelRef = Viewloan_2_9_12_10Rd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await Viewloan_2_9_12_10Rd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		} else if ((loan_status_id == 2 && loan_sub_status_id == 9 && loan_bank_status_id == 12 && loan_borrower_status_id == 10) && (meeting_flag == "1,2" || meeting_flag == 1 || meeting_flag == 2)) {
			modelRef = Viewloan_2_9_12_10_1Rd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await Viewloan_2_9_12_10_1Rd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 2 && loan_sub_status_id == 9 && loan_bank_status_id == 12 && loan_borrower_status_id == 12) {
			modelRef = Viewloan_2_9_12_12Rd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await Viewloan_2_9_12_12Rd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 18 && loan_sub_status_id == 18) {
			modelRef = Onboarding_18_18Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Onboarding_18_18Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 18 && loan_sub_status_id == 20) {
			modelRef = Onboarding_18_20Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Onboarding_18_20Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (loan_status_id == 19 && loan_sub_status_id == 19) {
			modelRef = Onboarding_19_19Rd;
			sortingCondition = "modified_on DESC";
			// view_loan_data = await Onboarding_19_19Rd.find(inputs.where_condition).sort("modified_on DESC")
			// 	.paginate({page: page_count, limit: limit_count});
		} else if (search) {
			modelRef = ViewloanSearchRd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await ViewloanSearchRd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		} else {
			modelRef = ViewloanRd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await ViewloanRd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		}
		if (!view_loan_data || view_loan_data.length === 0) {
			modelRef = ViewloanRd;
			sortingCondition = [{modified_on: "DESC"}, {upts: "DESC"}];
			// view_loan_data = await ViewloanRd.find(inputs.where_condition).sort([{modified_on: "DESC"}, {upts: "DESC"}])
			// 	.paginate({page: page_count, limit: limit_count});
		}

		if (sails.config?.isMuthootServer) {
			const greenChannelLoans = await modelRef.find({...inputs.where_condition, channel_type: "Green"}).sort(sortingCondition)
				.paginate({page: page_count, limit: limit_count});

			const noOfGreenChannelLoans = greenChannelLoans.length || 0;
			let nonGreenLoans = [];

			if (noOfGreenChannelLoans < limit_count) {
				nonGreenLoans = await modelRef.find({...inputs.where_condition, or: [{channel_type: {"!=": "Green"}}, {channel_type: null}]}).sort(sortingCondition)
					.paginate({page: page_count, limit: limit_count - noOfGreenChannelLoans});
			}

			view_loan_data = [...greenChannelLoans, ...nonGreenLoans];

		} else {
			view_loan_data = await modelRef.find(inputs.where_condition).sort(sortingCondition)
				.paginate({page: page_count, limit: limit_count});
		}

		return exits.success(view_loan_data);
	}
};
