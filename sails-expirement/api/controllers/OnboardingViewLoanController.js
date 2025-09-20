module.exports = {
	loanList : async function (req, res){
		const {status1: loan_status_id, status2 : loan_sub_status_id,
				search, skip : page_count, limit: limit_count, status} = req.allParams(),
			reqData = {
				loan_status_id, loan_sub_status_id, search, page_count, limit_count, status
			};

		if (!loan_status_id && !loan_sub_status_id && !search && !status){
			return res.badRequest(sails.config.res.missingFields);
		}
		let otherUsers = false;
		if (sails.config.otherUsersTypes.find((element) => element == req.user.usertype)) {
			otherUsers = true;
		}
		const {whereCondition, other_users_status} = await sails.helpers.viewloanCondition(req.user, reqData),
			view_loan_data = await sails.helpers.viewLoanData(reqData, whereCondition),
			ncStatusManage = await NcStatusManageRd.find({white_label_id: req.user.loggedInWhiteLabelID}),
		 viewData = [];
		if (view_loan_data.length > 0){
			for (let i = 0; i < view_loan_data.length; i++){
				view_loan_data[i].otherUsers = otherUsers;
				view_loan_data[i].other_users_status = other_users_status;
				view_loan_data[i].loggedInUserId = req.user.id;
				view_loan_data[i].usertype = req.user.usertype;
				const loanDetails = await loanDetailsForView(view_loan_data[i], search);
				if (loanDetails && Object.keys(loanDetails).length > 0) {
					viewData.push({...view_loan_data[i], ...loanDetails});
				}
			}
			return res.ok({
				status: "ok",
				loan_details: viewData,
				status_details: ncStatusManage
			});
		} else {
			return res.ok({
				status: "ok",
				loan_details: [],
				status_details: ncStatusManage
			});
		}
	}
};
async function loanDetailsForView(reqData, search) {
	try {
		const {loan, business, users, sales_id,otherUsers,
				other_users_status, loggedInUserId, white_label_id, createdUserId,
				loan_asset_type, loan_usage_type, loan_type, loan_products, usertype} = reqData,
			[usersData, salesData, createdUserData, loanData, businessData, loanAssetTypeData, loanUsageTypeData,
				loanTypeData, loanProductData, director_details, loan_document, lender_document] =
				await Promise.all([
					usersDataFetch(users), usersDataFetch(sales_id), usersDataFetch(createdUserId),
					LoanrequestRd.findOne({id: loan}).select(["loan_request_type",
						"business_id", "loan_ref_id", "loan_amount", "loan_amount_um", "remarks_val", "remarks", "modified_on", "loan_product_id", "RequestDate", "application_ref", "loan_origin", "connector_user_id", "document_upload",
						"applied_tenure", "annual_revenue", "revenue_um", "annual_op_expense", "op_expense_um", "cur_monthly_emi", "loan_status_id", "loan_sub_status_id", "parent_product_id", "createdUserId", "assignment_additional"]),
					BusinessRd.findOne({id: business}).select(["businessname", "userid", "first_name", "last_name", "businesstype", "customer_id"]),
					LoanAssetTypeRd.findOne({id: loan_asset_type}),
					LoanUsageTypeRd.findOne({id: loan_usage_type}),
					LoantypeRd.findOne({id: loan_type}).select("loanType"),
					LoanProductsRd.findOne({id: loan_products}).select(["product", "payment_structure", "security", "loan_request_type", "loan_type_id",
						"loan_asset_type_id", "loan_usage_type_id", "parent_flag", "parent_id", "created", "business_type_id", "dynamic_forms"]),
					directorDetails(business),
					LoanDocumentRd.find({
						loan,
						status: "active",
						doctype : {"!=" : 0}
					}).select(["user_id", "doctype", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size", "directorId"])
						.populate("doctype")
						.limit(200),
					LenderDocumentRd.find({
						loan,
						status: "active",
						doc_type : {"!=" : 0}
					}).select(["user_id", "doc_type", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size_of_file", "directorId"])
						.populate("doc_type")
						.limit(200)
				]);
		if (loanData && loanData.assignment_additional) {
			loanData.assignment_additional = await usersDataFetch(loanData.assignment_additional);
		}
		if (loanData && loanData.connector_user_id) {
			loanData.connector = await usersDataFetch(loanData.connector_user_id, true);
		}
		if (!loanProductData.dynamic_forms) {
			loanProductData.dynamic_forms = await sails.helpers.dynamicForms();
		}
		const [loan_product_details, parent_product] = await Promise.all([
			loanProductsDetails(loan_products, white_label_id, businessData.businesstype, ""),
			loanProductsDetails("", "", "", loanData.parent_product_id)]);

		loanData.createdUserId = createdUserData;
		const dataObj = {
			users: usersData,
			business: businessData,
			loan_products: loanProductData,
			loan_usage_type: loanUsageTypeData,
			loan_asset_type: loanAssetTypeData,
			loan: loanData,
			sales_id: salesData,
			assigned_credit_user: salesData,
			loan_type: loanTypeData,
			created_user: createdUserData,
			assigned_institute_user: createdUserData,
			is_assigned: false,
			loan_document: loan_document || [],
			lender_document: lender_document || [],
			director_details,
			loan_product_details,
			parent_product
		};
		if (otherUsers) {
			let condition = {};
			if (search && usertype == "BPO") {
				const taskData = await TaskUserMappingRd.find({loan_id: loan, taskid: 13}).sort([{id: "DESC"}]);
				if (taskData.length > 0 && taskData[0].assign_userid == loggedInUserId) {
					condition = {loan_id: loan, taskid: 13, assign_userid: loggedInUserId};
				} else if (taskData.length > 0 && taskData[0].reassigned_userid == loggedInUserId) {
					condition = {loan_id: loan, taskid: 13, reassigned_userid: loggedInUserId};
				} else if (taskData.length > 0) {
					const userMapping = await UserCorporateMappingRd.findOne({userid: loggedInUserId});
					if (userMapping && userMapping.user_type == 'Secondary' && userMapping.created_by == taskData[0].reassigned_userid) {
						condition = {loan_id: loan, taskid: 13};
					}
				}
			}
			else {
				condition = {
					loan_id: loan,
					assign_userid: loggedInUserId,
					status: other_users_status
				};
			}
			if (condition && Object.keys(condition).length <= 0) {
				return {};
			}
			const findTaskId = await TaskUserMappingRd.find(condition).sort([{id: "DESC"}]);
			if (findTaskId.length <= 0) {
				return {};
			}
			dataObj.assigned_other_user = await usersDataFetch(findTaskId[0].assign_userid);
			dataObj["evaluationId"] = findTaskId[0].id;
			if (findTaskId[0].status == "open") {
				dataObj["evaluation_status"] = sails.config.task_status.open;
				dataObj["assigned_at"] = findTaskId[0].created_time;
			} else if (findTaskId[0].status == "pending") {
				dataObj["evaluation_status"] = sails.config.task_status.pending;
				dataObj["assigned_at"] = findTaskId[0].updated_time;
			} else if (findTaskId[0].status == "sent back") {
				dataObj["evaluation_status"] = sails.config.task_status.sent_back;
				dataObj["assigned_at"] = findTaskId[0].updated_time;
			} else if (findTaskId[0].status == "reopen") {
				dataObj["evaluation_status"] = sails.config.task_status.reopen;
				dataObj["assigned_at"] = findTaskId[0].updated_time;
			} else {
				dataObj["evaluation_status"] = "Evaluation Completed";
				dataObj["assigned_at"] = findTaskId[0].completed_time;
			}
		}
		const findTaskCount = await TaskUserMappingRd.count({
			loan_id: loan
		});
		// This is to display if the task is already being assigned to external evaluator
		if (findTaskCount > 0) {
			dataObj.is_assigned = true;
		}
		return dataObj;
	} catch (err) {
		console.log("errororrrrrrrrrrrrrrrrrrrrrrr---------------------------", err);
		return err;
	}
}
async function usersDataFetch(userid, connector) {
	let whereCondition;
	if (connector) whereCondition = {user_reference_no: userid};
	else whereCondition = {id : userid};
	return (await UsersRd.findOne(whereCondition).select(["name", "email", "lender_id", "usertype", "parent_id", "user_sub_type"]));

}
async function loanProductsDetails(loan_product_id, white_label_id, businesstype, parent_product_id) {
	let whereCondition = {}, selectdata = [], resData;
	if (loan_product_id && white_label_id && businesstype) {
		{
			whereCondition = {
				white_label_id: white_label_id,
				isActive: "true",
				product_id: {contains: loan_product_id}
			};
			selectdata = ["product_id", "parent_id", "loan_request_type"];
		}
	} else {
		whereCondition = {
			id: parent_product_id
		};
		selectdata = ["product_id", "basic_details"];
	}
	const loanProductDetailsData = await LoanProductDetailsRd.find(whereCondition).select(selectdata);

	if (loanProductDetailsData.length > 0 && loan_product_id) {
		const product_data = loanProductDetailsData.find(
			(o) =>
				Object.keys(o.product_id).includes(businesstype.toString()) &&
				Object.values(o.product_id).includes(loan_product_id)
		);
		resData = product_data ? [product_data] : [];
	} else if (loanProductDetailsData.length > 0 && parent_product_id) {
		resData = {...JSON.parse(loanProductDetailsData[0].basic_details), ...loanProductDetailsData[0]};
		delete resData.basic_details;
	} else {
		resData = {};
	}
	return resData;
}
async function directorDetails(businessid) {
	const directorDetails = [];
	directorDetailsData = await DirectorRd.find({
		business: businessid,
		status: "active"
	}).select(["dpancard", "isApplicant", "daadhaar", "dpassport", "dvoterid", "dfirstname", "dlastname", "demail", "dcontact", "middle_name", "ddlNumber", "income_type", "type_name"]).limit(20);
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
}