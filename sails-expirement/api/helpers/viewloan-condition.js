module.exports = {
	inputs : {
		user_data : {
			type : "json",
			required : true
		},
		payload : {
			type : "json",
			required : true
		}
	},
	exist: {
		success: {
			description: "success"
		}
	},

	fn : async function (inputs, exist){
		const {user_data, payload} = inputs,
		 {loan_status_id,
				loan_sub_status_id,
				loan_bank_status_id,
				loan_borrower_status_id,
				meeting_flag,
				search,
				page_count,
				limit_count,
				status} = payload;
        let otherUsers = false, sectionId = [];
		if (sails.config.otherUsersTypes.find((element) => element == user_data.usertype)) {
			otherUsers = true;
		}
		let other_users_status = status;
		if (other_users_status === sails.config.task_status.open) {
			other_users_status = "open";
		} else if (other_users_status === sails.config.task_status.pending) {
			other_users_status = "pending";
		} else if (other_users_status === sails.config.task_status.reopen) {
			other_users_status = "reopen";
		} else if (other_users_status === sails.config.task_status.sent_back) {
			other_users_status = "sent back";
		} else if (search) {
			other_users_status = undefined;
		} else {
			other_users_status = "close";
		}

		const userid = [],
			regionList = [],
			users_whitelabel = user_data.loggedInWhiteLabelID, //White label limiting for first
			whereCondition = {white_label_id: users_whitelabel}, //where conditions
			ncStatusCondition = {white_label_id: users_whitelabel},
			userType = user_data.usertype,
			users = await UsersRd.find({
				// Get the list of things this user can see
				select: ["id"],
				where: {
					or: [
						{
							parent_id: user_data["id"]
						},
						{
							id: user_data["id"]
						}
					]
				}
			});
		_.each(users, (value) => {
			userid.push(value.id);
		});
		if (user_data.is_corporate == 1 && user_data.corporateData && Object.keys(user_data.corporateData).length > 0) {
			userid.push(user_data.corporateData.userid);
			userid.push(user_data.corporateData.created_by);
		}
		const whiteLabelData = await WhiteLabelSolutionRd.findOne({
				//Assignment type for selected whitelabel from solution table
				select: ["assignment_type"],
				where: {
					id: users_whitelabel
				}
			}),
			arrData =
            whiteLabelData && whiteLabelData.assignment_type && whiteLabelData.assignment_type.loans.assignment,
			userSubType = user_data.user_sub_type;
		arrData &&
        arrData.forEach((Element) => {
        	forRes = Element.hasOwnProperty(user_data.usertype) && Element[userType] === user_data.user_sub_type;
        });
		let product_list = [];
				if(user_data.products_type){
					try {
						const parseData = JSON.parse(user_data.products_type);
					product_list = parseData && parseData.generic_flow_products ? parseData.generic_flow_products : [];
					} catch {
						product_list = user_data.products_type ? user_data.products_type.generic_flow_products.split(",") : [];
					}
				}

		if (search && typeof search !== "undefined") {
			if (
				sails.config.muthoot_wl != Number(users_whitelabel) && otherUsers == false) {
				if (user_data.is_lender_admin === 1) {
					//Get region ids of the loggedin admin user
					const regionIds = await LenderRegionMappingRd.find({
						select: ["region_id"],
						where: {
							user_id: user_data.id
						}
					});
					//Admi user should have region wise loan listing
					_.each(regionIds, (value) => {
						regionList.push(value.region_id);
					});
					whereCondition.or = [{region_id : regionList}, {sales_id: user_data.id}, {createdUserId: user_data.id}, {bank_emp_id: user_data.id}, {assigned_extended_ids : {contains: user_data.id}}];
				} else if (user_data.is_lender_manager === 1) {
					if (product_list.length > 0) {
						whereCondition.loan_products = product_list;
					}
					whereCondition.or =[{city : user_data.city},{sales_id: user_data.id}, {createdUserId: user_data.id}, {bank_emp_id: user_data.id}, {assigned_extended_ids : {contains: user_data.id}}];
					} else if (user_data.is_branch_manager === 1 ){
						whereCondition.or = [{branch_id : user_data.branch_id}, {sales_id: user_data.id}, {createdUserId: user_data.id}, {bank_emp_id: user_data.id}, {assigned_extended_ids : {contains: user_data.id}}];
					}
					else if (user_data.is_state_access === 1){
						whereCondition.or = [{state : user_data.state}, {sales_id: user_data.id}, {createdUserId: user_data.id}, {bank_emp_id: user_data.id}, {assigned_extended_ids : {contains: user_data.id}}];
					} else {
						whereCondition.or = [{sales_id: user_data.id}, {createdUserId: user_data.id}, {bank_emp_id: user_data.id}, {assigned_extended_ids : {contains: user_data.id}}];
					}
				loanReq = /^[A-Za-z]{4}\d{8}$/;
				email =
                /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
				if (loanReq.test(search) === true) {
					whereCondition.loan_ref_id = {contains: search};
				} else if (email.test(search) === true) {
					whereCondition.business_email = {contains: search};
				} else {
					whereCondition.businessname = {contains: search};
				}
			} else {
				whereCondition.or = [
					{loan_ref_id: {contains: search}},
					{business_email: {contains: search}},
					{businessname: {contains: search}}
				];
			}
		} else {
			if (user_data.usertype == "Bank") {
				const sectionData = await UsersSectionRd.find({
					select: ["section_ref"],
					where: {
						user_id: user_data.id,
						classification_type : "zone"
					}
				});
				if (sectionData.length > 0){
					for (const i in sectionData) {
						sectionId.push(sectionData[i].section_ref);
					}
				}
				//Condition for Lender or Bank Admin user
				if (user_data.is_lender_admin === 1) {
					//Get product id from token and update that to condition
					if (product_list.length > 0) {
						whereCondition.loan_products = product_list;
					}
					//Get region ids of the loggedin admin user
					const regionIds = await LenderRegionMappingRd.find({
						select: ["region_id"],
						where: {
							user_id: user_data.id
						}
					});
					//Admi user should have region wise loan listing
					_.each(regionIds, (value) => {
						regionList.push(value.region_id);
					});
					whereCondition.or = [{region_id: regionList}, {users: userid}];
				} else {
					//Condition for Lender or Bank manager user
					// if (user_data.is_lender_admin !== 1) {
					if (user_data.is_lender_manager === 1) {
						if (user_data.lender_id) {
							{
							}
						}
						if (product_list.length > 0) {
							whereCondition.loan_products = product_list;
						}

						condition = whereCondition.or = [
							{users: userid},
							{sales_id: user_data.id},
							{createdUserId: user_data.id},
							{city : user_data.city},
							{bank_emp_id: user_data.id},
							{assigned_extended_ids : {contains: user_data.id}}
						];
					} else if (user_data.is_state_access === 1){
						condition = whereCondition.or = [
							{users: userid},
							{sales_id: user_data.id},
							{createdUserId: user_data.id},
							{state : user_data.state},
							{assigned_extended_ids : {contains: user_data.id}}
						];
					} else if (sectionId.length > 0){
						whereCondition.zone_id = sectionId;
					} else if (user_data.is_branch_manager === 1 ){
						condition = whereCondition.or = [
							{users: userid},
							{sales_id: user_data.id},
							{createdUserId: user_data.id},
							{branch_id : user_data.branch_id},
							{bank_emp_id: user_data.id},
							{assigned_extended_ids : {contains: user_data.id}}
						];
					} else {	
						condition = whereCondition.or = [
							{users: userid},
							{sales_id: user_data.id},
							{createdUserId: user_data.id},
							{bank_emp_id: user_data.id},
							{assigned_extended_ids : {contains: user_data.id}}
						];
					}
				}
			} else if (user_data.usertype == "Analyzer") {
				whereCondition.or = [{createdUserId: user_data.id}, {sales_id: user_data.id}];
			} else if (otherUsers) {
				// Modify function to return the data for other users. The primary table for other users is task_user_mapping
				let sortValue = "";
				if (other_users_status == "open") {
					sortValue = "created_time";
				} else if (other_users_status == "pending" || other_users_status == "reopen" || other_users_status == "sent back"){
					sortValue = "updated_time";
				}else {
					sortValue = "completed_time";
				}
				let taskUserData = [];
				if (other_users_status) {
					taskUserData = await TaskUserMappingRd.find({
						assign_userid: user_data.id,
						status: other_users_status
					}).sort([{[sortValue]: "DESC"}]);
				} else {
					taskUserData = await TaskUserMappingRd.find({
						assign_userid: user_data.id,
						status: other_users_status
					});
				}
				const data = [];
				if (taskUserData) {
					taskUserData.forEach((element) => {
						data.push(element.loan_id);
					});
				}
				whereCondition.id = data;
			} else if (user_data.usertype == "CA") {
				whereCondition.or = [{users: userid}, {createdUserId: user_data.id}];
			} else if (user_data.usertype == "Checker" || user_data.usertype == "Maker") {
				whereCondition.assigned_extended_ids = {contains: user_data.id};
			} else {
				whereCondition.users = userid;
			}
			if (loan_status_id && typeof loan_status_id !== "undefined") {
				whereCondition.loan_status_id = loan_status_id.split(",");
				ncStatusCondition.status1 = loan_status_id.split(",");
				if (loan_sub_status_id && typeof loan_sub_status_id !== "undefined") {
					whereCondition.loan_sub_status_id = loan_sub_status_id.split(",");
					ncStatusCondition.status2 = loan_sub_status_id.split(",");
				}
			}
			if (
				loan_bank_status_id &&
			typeof loan_bank_status_id !== "undefined" &&
			loan_borrower_status_id &&
			typeof loan_borrower_status_id !== "undefined"
			) {
				const bankStatusID = loan_bank_status_id.split(","),
					borrowerStatusId = loan_borrower_status_id.split(",");
				if (bankStatusID.length > 0 && borrowerStatusId.length > 0) {
					whereCondition.loan_bank_status = bankStatusID;
					whereCondition.loan_borrower_status = borrowerStatusId;
					whereCondition.bank_id = user_data.lender_id;
					ncStatusCondition.status3 = bankStatusID;
					ncStatusCondition.status4 = borrowerStatusId;
				}
				if (meeting_flag) {
					whereCondition.meeting_flag = meeting_flag.split(",");
					ncStatusCondition.status6 = meeting_flag.split(",");
				}
			}
			if (loan_status_id == 1 && !loan_sub_status_id) {
				whereCondition.loan_sub_status_id = null;
			}
		}

        return {whereCondition, other_users_status};
	}
}