
const usersDataFetch = async function(userid) {
	return (await UsersRd.findOne({id : userid}).select(["name", "email", "lender_id", "usertype", "parent_id", "user_sub_type"]));
};
const directorDetails = async function(businessid){
	const directorDetails = [];
	directorDetailsData = await DirectorRd.find({
		business: businessid,
		status: "active"
	}).select(["dpancard", "isApplicant", "daadhaar", "dpassport", "dvoterid", "ddlNumber", "income_type", "type_name"]);
	for (const dirElement of directorDetailsData) {
		if (dirElement.income_type == "business") {
			dirElement.income_type = 1;
		} else if (dirElement.income_type == "salaried") {
			dirElement.income_type = 7;
		} else {
			dirElement.income_type = 0;
		}
		directorDetails.push(dirElement);
	}
	return directorDetails;
};
const dbDocDetails = async function (loanId){
	let dbBankDocTypeCheck, dbBankDownloadDoc;

	const docCheck = await LoanDocumentRd.find({
		loan: loanId,
		doctype: sails.config.docUpload.uploadId,
		status: "active"
	});
	docCheck.length > 0 ? (dbBankDocTypeCheck = "Uploaded") : (dbBankDocTypeCheck = "Pending");

	const docDownloadCheck = await LoanDocumentRd.find({
		loan: loanId,
		doctype: sails.config.docUpload.downloadId,
		status : "active"
	});
	docDownloadCheck.length > 0 ? (dbBankDownloadDoc = "Downloaded") : (dbBankDownloadDoc = "Pending");
	return {dbBankDocTypeCheck, dbBankDownloadDoc};
}


module.exports ={
	inputs : {
		reqData : {
			type : "json",
			required : true
		}
	},
	exits: {
		success: {
			description: "All done."
		},
		error :{
			description :  "Error while processing."
		}
	},
	fn : async function (inputs, exits){
		try {
		const {loan, business, users, sales_id,lender_status, loan_bank_mapping, branch_id, otherUsers,
				other_users_status, loggedInUserId,white_label_id, createdUserId,
				loan_asset_type,loan_usage_type, loan_type, loan_products} = inputs.reqData;
				console.log("++++++++++++++++++++++++", inputs);

		 usersData = await usersDataFetch(users) || [],
			salesData = await usersDataFetch(sales_id) || [],
			createdUserData = await usersDataFetch(createdUserId) || [],
			loanData = await LoanrequestRd.findOne({id :loan}).select(["loan_request_type",
				"business_id", "loan_ref_id", "loan_amount", "loan_amount_um", "remarks_val", "modified_on", "RequestDate", "application_ref", "loan_origin", "connector_user_id",
				"applied_tenure", "annual_revenue" , "revenue_um", "annual_op_expense", "op_expense_um", "cur_monthly_emi", "loan_status_id", "loan_sub_status_id", "parent_product_id", "createdUserId"]),
			businessData = await BusinessRd.findOne({id : business}).select(["businessname", "userid", "first_name", "last_name", "businesstype", "customer_id"]),
			loanAssetTypeData = await LoanAssetTypeRd.findOne({id : loan_asset_type}),
			loanUsageTypeData = await LoanUsageTypeRd.findOne({id : loan_usage_type}),
			loanTypeData = await LoantypeRd.findOne({id: loan_type}).select("loanType"),
			loanProductData = await LoanProductsRd.findOne({id : loan_products}).select(["product","payment_structure","security","loan_request_type","loan_type_id",
				"loan_asset_type_id","loan_usage_type_id","parent_flag","parent_id","created","business_type_id","dynamic_forms"]);
		if (!loanProductData.dynamic_forms) {
			loanProductData.dynamic_forms = await sails.helpers.dynamicForms();
		}
		const dbdocData = await dbDocDetails(loan);

		loanData.createdUserId = createdUserData;
		const dataObj = {
			users : usersData,
			business : businessData,
			loan_products : loanProductData,
			loan_usage_type : loanUsageTypeData,
			loan_asset_type : loanAssetTypeData,
			loan : loanData,
			sales_id : salesData,
			assigned_credit_user : salesData,
			loan_type : loanTypeData,
			created_user : createdUserData,
			assigned_institute_user : createdUserData,
			is_assigned : false,
			loan_document : [],
			lender_document : [],
			director_details : await directorDetails(business) || [],
			assigned_extended_ids : [],
			bank_emp_data : {},
			bank_user : {},
			loan_bank_mapping : {},
			sanctionData : {},
			disbursementData : [],
			dbDocCheck : dbdocData.dbBankDocTypeCheck,
			dbDownloadCheck : dbdocData.dbBankDownloadDoc
		};
		if (loan_bank_mapping){
			dataObj.loan_bank_mapping = await LoanBankMappingRd.findOne({id : loan_bank_mapping}).select(["bank_id", "bank_emp_id", "loan_bank_status", "loan_borrower_status", "meeting_flag", "assigned_extended_ids", "lender_status"]);
			dataObj.lender_status = dataObj.loan_bank_mapping.lender_status = await LoanStatusWithLenderRd.findOne({id : lender_status}).select("status");
			dataObj.bank_user = dataObj.bank_emp_data = dataObj.loan_bank_mapping.bank_emp_id ?
				await usersDataFetch(dataObj.loan_bank_mapping.bank_emp_id) : null;
			if (dataObj.loan_bank_mapping.assigned_extended_ids) {
				const userId_arrData = dataObj.loan_bank_mapping.assigned_extended_ids.split(",");
				dataObj.assigned_extended_ids = await UsersRd.find({id: userId_arrData.map(Number)}).select("name");
			}
			dataObj.sanctionData = await LoanSanctionRd.find({loan_id: loan}).select(["sanction_status", "san_date"]);
			dataObj.disbursementData = lender_status == 16 && dataObj.sanctionData.length > 0 ?
					await LoanDisbursementRd.find({loan_sanction_id : dataObj.sanctionData[0].id}).sort("updated_at DESC").select("disbursement_date").limit(1) : [];
		}
		if (otherUsers) {
			const findTaskId = await TaskUserMappingRd.find({
				loan_id: loan,
				assign_userid: loggedInUserId,
				status: other_users_status
			}).sort([{id: "DESC"}]);
			dataObj["evaluationId"] = findTaskId[0].id;
			dataObj["evaluation_status"] =
				findTaskId[0].status == "open" ? "Assigned" : "Evaluation Completed";
			dataObj["assigned_at"] =
				findTaskId[0].status == "open" ? findTaskId[0].created_time : findTaskId[0].completed_time;
		}
		const findTaskCount = await TaskUserMappingRd.count({
			loan_id: loan
		});
		// This is to display if the task is already being assigned to external evaluator
		if (findTaskCount > 0) {
			dataObj.is_assigned = true;
		}
		
		let loanProductDetailsData = await LoanProductDetailsRd.find({
			white_label_id: white_label_id,
			isActive: "true",
			product_id: {contains: loan_products}
		}).select(["product_id", "parent_id", "loan_request_type"]);
		if (loanProductDetailsData.length > 0) {
			loanProductDetailsData = loanProductDetailsData.find(
				(o) =>
					Object.keys(o.product_id).includes(businessData.businesstype.toString()) &&
					Object.values(o.product_id).includes(loan_products)
			);
		}
		dataObj.loan_product_details = loanProductDetailsData ? [loanProductDetailsData] : [];
		if (loanData.parent_product_id) {
			parentProductData = await LoanProductDetailsRd.findOne({id: loanData.parent_product_id}).select(["product_id", "basic_details"]);
			parentProductData = {...JSON.parse(parentProductData.basic_details), ...parentProductData};
			delete parentProductData.basic_details;
			dataObj.parent_product = parentProductData;
		} else {
			dataObj.parent_product = {};
		}
		dataObj.loan_document = await LoanDocumentRd.find({
			loan,
			status: "active"
		}).select(["user_id", "doctype", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size", "directorId" ])
			.populate("doctype")
			.limit(200);
		dataObj.lender_document = await LenderDocumentRd.find({
			loan,
			status: "active"
		}).select(["user_id","doc_type","doc_name", "uploaded_doc_name","original_doc_name", "status", "size_of_file", "directorId"])
			.populate("doc_type")
			.limit(200);

		return exits.success(dataObj);
	} catch (err){
		return exits.error(err);
	}
	}
};