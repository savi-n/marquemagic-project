const {promises} = require("winston3-azureblob-transport");
const moment = require("moment");

/**
 * OtherUsersController
 *
 * @description :: Server-side logic for managing Loanusagetype
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	/**
	 * @description :: other users - to fetch evaluation types such as legal, technical etc
	 * @api {get} /fetchEvaluationTypes Fetch Evaluation Types
	 * @apiName Evaluation Types
	 * @apiGroup Other Users
	 * @apiHeader  authorization
	 * @apiExample Example usage:
	 * curl -i localhost:1337/fetchEvaluationTypes
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String}  message ''
	 * @apiSuccess {Object[]}  data list
	 */
	fetchEvaluationList: async function (req, res) {
		let evaluationTypes = [];
		try {
			let data = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID}).select('assignment_type');
			let userTypesArray = [];
			if (data.assignment_type.other_user_list) {
				if (data.assignment_type.rcu_to_external_evaluation && req.user.usertype === 'RCU') {
					userTypesArray.push(data.assignment_type.rcu_to_external_evaluation.assignment[0].usertype);
				} else {
					userTypesArray = data.assignment_type.other_user_list.map(user => user.user_type);
					if (data.assignment_type.external_bpo_listing_stage1 && data.assignment_type.external_bpo_listing_stage1.assignment && data.assignment_type.external_bpo_listing_stage1.assignment[0].usertype === req.user.usertype &&
						data.assignment_type.external_bpo_listing_stage1.assignment[0].user_subtype.includes(req.user.user_sub_type)) {
						userTypesArray.push('BPO');
					}
				}
				evaluationTypes = await TaskMasterRd.find({
					where: {usertype: userTypesArray, white_label_id: req.user.loggedInWhiteLabelID},
					select: ["task_cat_id", "taskname"]
				});
			} else {
				evaluationTypes = await TaskMasterRd.find({
					where: {task_cat_id: sails.config.otherUsersId, white_label_id: req.user.loggedInWhiteLabelID},
					select: ["task_cat_id", "taskname"]
				});

			}
			let responseData = evaluationTypes;
			return res.ok({
				data: responseData,
				message: "",
				status: "ok"
			});
		} catch (e) {
			return res.serverError(e);
		}
	},
	/**
	 * @description :: other users - to fetch type of users on basis of evaluation type
	 * @api {get} /fetchAssignee Fetch Assignee
	 * @apiName Evaluation Types
	 * @apiGroup Other Users
	 * @apiHeader  authorization
	 * @apiExample Example usage:
	 * curl -i localhost:1337/fetchAssignee?categoryId = 7
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String}  message ''
	 * @apiSuccess {Object[]}  data list
	 */
	fetchAssignee: async function (req, res, next) {
		let categoryId = req.param("categoryId");
		let loanId = req.param("loanId");

		params = req.allParams();
		fields = ["categoryId", "loanId"];
		missing = await reqParams.fn(params, fields);

		if (!categoryId || !loanId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let assignees = [];
		try {
			let responseData;
			loanreqData = await LoanrequestRd.findOne({id: loanId});
			businessAddressData = await BusinessaddressRd.find({bid: loanreqData.business_id, aid: 1});
			const whitelabelData = await WhiteLabelSolutionRd.findOne({id: loanreqData.white_label_id})
				.select(["ref_bank_id", "assignment_type"]);
			let users_data = [];
			 const whiteLabelId = `%${whitelabelData.id}%`;
			if (categoryId == 13 && whitelabelData && whitelabelData.assignment_type && whitelabelData.assignment_type.stage_1_2_assignement[0].usertype === 'BPO') {
				stage_1_2_assignement = whitelabelData.assignment_type.stage_1_2_assignement[0].data;
				let branch, state, section, city;
				if (stage_1_2_assignement.branch == 'yes') {
					branch = loanreqData.branch_id
				}
				if (stage_1_2_assignement.state == 'yes') {
					state = businessAddressData[0].state
				}
				if (stage_1_2_assignement.section == 'yes') {
					section = loanreqData.branch_id
				}
				if (stage_1_2_assignement.city == 'yes') {
					city = businessAddressData[0].city
				}
				const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
					query = `select name, userid as id,usertype  from users  where status = "active" and is_corporate = 1 and is_other = 1 and is_user_admin = "Yes" ${branch ? `AND branch_id = ${branch}` : ''} ${state ? `AND state = '${state}'` : ''} ${city ? `AND city = '${city}'` : ''} and usertype in (select usertype from task_master where task_cat_id = $1) and userid not in (select reassigned_userid from task_user_mapping where loan_id = ${loanId} and status = 'pending') and white_label_id like $2`;
				assignees = await myDBStore.sendNativeQuery(query, [categoryId, whiteLabelId]);
				users_data = [...assignees.rows];
			} else if (whitelabelData.assignment_type.rcu_to_external_evaluation && req.user.usertype === 'RCU') {
				const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
					query = `select name, userid as id, usertype from users where status = "active" and is_corporate = 1 and is_other = 1 and is_user_admin = "Yes" and usertype in (select usertype from task_master where task_cat_id = $1) and userid not in (select reassigned_userid from task_user_mapping where loan_id = ${loanId} and status in ('pending', 'open') and taskid = $1) and white_label_id like $2`;
				assignees = await myDBStore.sendNativeQuery(query, [categoryId, whiteLabelId]);
				responseData = assignees.rows;
				users_data = [...assignees.rows];
			} else if (whitelabelData && whitelabelData.assignment_type && whitelabelData.assignment_type.other_user_list) {
				const condition = whitelabelData.assignment_type.other_user_list,
					taskMaster = await TaskMasterRd.findOne({task_cat_id: categoryId, white_label_id: whitelabelData.id})
						.select("usertype"),
					userId = [];
				taskUserMappingData = await TaskUserMappingRd.find({
					loan_id: loanId,
					status: "open"
				}).select("assign_userid");
				_.each(taskUserMappingData, values => {
					userId.push(values.assign_userid);
				});
				const whereCondition = {
					usertype: taskMaster.usertype,
					status: "active",
					white_label_id: {contains: whitelabelData.id}
				};
				for (const values1 of condition) {
					if (values1.user_type == taskMaster.usertype) {
						if (values1.sub_type) {
							whereCondition.user_sub_type = values1.sub_type;
						}
						if (values1.data.multi_branch) {
							banktablData = await BanktblRd.find({id: loanreqData.branch_id, ref_id: whitelabelData.ref_bank_id}).select("Additional_email_id");
							const email = [];
							_.each(banktablData, bankValue => {
								if (bankValue.Additional_email_id) {
									email.push(bankValue.Additional_email_id.split(","));
								}
							});
							whereCondition.email = email.flat();
						}
						if (values1.data.branch) {
							whereCondition.branch_id = loanreqData.branch_id;
						}
						if (values1.data.state) {
							whereCondition.state = businessAddressData[0].state;
						}
						if (values1.data.city) {
							whereCondition.city = businessAddressData[0].city;
						}
					}
				}
				if (whitelabelData.assignment_type.rcu_to_external_evaluation && req.user.usertype === 'RCU') {
					whereCondition.is_corporate = 1;
					whereCondition.is_other = 1;
					whereCondition.is_user_admin = 'Yes';
				}
				if (userId.length > 0) {
					whereCondition.id = {"!=": userId};
				}
				usersData = await UsersRd.find(whereCondition).select(["name", "usertype"]);
				for (const users of usersData) {
					const taskUserMappingData = await TaskUserMappingRd.find({
						assign_userid: users.id,
						loan_id: loanId,
						status: "open"
					});
					if (taskUserMappingData.length === 0) {
						users_data.push(users);
					}
				}
			} else {
				//const whiteLabelId = `%${whitelabelData.id}%`;
				const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
					query = `select name, userid as id, usertype from users where status = "active" and  usertype in (select usertype from task_master where task_cat_id = $1) and userid not in (select assign_userid from task_user_mapping where loan_id = ${loanId} and status = 'open') and white_label_id like $2`;
				assignees = await myDBStore.sendNativeQuery(query, [categoryId, whiteLabelId]);
				responseData = assignees.rows;
				users_data = [...assignees.rows];
			}
			return res.ok({message: "", status: "ok", data: users_data});
		} catch (e) {
			return res.serverError(e);
		}
	},
	/**
	 * @description :: other users - to fetch evaluation details for a loanid
	 * @api {get} /fetchEvaluationDetails Fetch Evaluation Details
	 * @apiName Evaluation Types
	 * @apiHeader  authorization
	 * @apiGroup Other Users
	 * @apiExample Example usage:
	 * curl -i localhost:1337/fetchEvaluationDetails?loanId=19303
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String}  message ''
	 * @apiSuccess {Object[]}  data list
	 */
	fetchEvaluationDetails: async function (req, res, next) {
		let loanId = req.param("loanId");

		params = req.allParams();
		fields = ["loanId"];
		missing = await reqParams.fn(params, fields);

		if (!loanId || !req.user.loggedInWhiteLabelID) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const whitelabelData = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID})
			.select("assignment_type");
		const myDBStore = sails.getDatastore("mysql_namastecredit_read")
		let query;
		const isRcuToExternalEvaluation = whitelabelData.assignment_type.rcu_to_external_evaluation && req.user.usertype === 'RCU';
		let additionalCondition = '';
		if (!isRcuToExternalEvaluation) {
			additionalCondition = `tum.parent_task_id IS NULL `;
		}
		query = `SELECT  ld.user_id, (
				SELECT JSON_ARRAYAGG(JSON_OBJECT(
					'filename', ld.uploaded_doc_name,
					'fd', ld.doc_name,
					'doc_type_id', ld.doc_type_id
				))) as file_data , sub_query_tbl.* from (select tum.assign_userid,tum.assigned_document_list,tum.loan_ref_id ,u.name,
				CASE
					WHEN tum.status = 'close' THEN
				${isRcuToExternalEvaluation ? "'Approval Needed'" : "'Completed'"}
					WHEN tum.status = 'sent back' THEN 'Sent Back'
					WHEN tum.status = 'cancel' THEN 'Rejected'
					ELSE
				${isRcuToExternalEvaluation ? "'Assigned to external'" : "'In-Progress'"}
                    END AS status, tum.id AS taskid,
				tum.details AS bank_comment, tc.comment AS other_users_comment, tm.taskname,wls.s3_name, wls.s3_region
				from task_user_mapping as tum
				JOIN users u ON u.userid = tum.assign_userid
				LEFT JOIN task_comments tc ON tc.commenter_id = tum.assign_userid AND tc.task_id = tum.id
				JOIN task_master tm ON tm.task_cat_id = tum.taskid
				JOIN white_label_solution wls ON wls.id = $1
				WHERE tum.loan_id = $2
				AND (${isRcuToExternalEvaluation ? `tm.taskname = 'Document Check'` : ''}
                ${additionalCondition}) group by assign_userid ) as sub_query_tbl
				left join lender_document ld
				on ( sub_query_tbl.taskid = ld.ref_id and ld.uploaded_by = sub_query_tbl.assign_userid)
				GROUP BY taskid ORDER BY taskid DESC`;

		try {
			const fetchHistoryData = await myDBStore.sendNativeQuery(query, [req.user.loggedInWhiteLabelID, loanId]);
			if (fetchHistoryData.rows[0]) {
				let s3Name = "";
				let s3Region = "";

				s3Region = fetchHistoryData.rows[0].s3_region;

				let i = 0;
				for await (let el of fetchHistoryData.rows.map((element) => JSON.parse(element.file_data))) {
					let j = 0;
					s3Name = fetchHistoryData.rows[i].s3_name + "/users_" + fetchHistoryData.rows[i].user_id;
					if (el) {
						for await (const contents of el.map((els) =>
							els.fd ? sails.helpers.s3ViewDocument(els.fd, s3Name, s3Region) : "NA"
						)) {
							if (contents === "NA" && j == 0) {
								fetchHistoryData.rows[i].file_data = [];
							} else {
								el[j]["url"] = contents;
								fetchHistoryData.rows[i].file_data = el;
							}

							j++;
						}
					} else {
						fetchHistoryData.rows[i].file_data = [];
					}
					delete fetchHistoryData.rows[i].s3_name;
					delete fetchHistoryData.rows[i].s3_region;
					i++;
				}

				return res.ok({
					data: fetchHistoryData.rows,
					status: "ok",
					message: ""
				});

				// })
			} else {
				return res.ok({
					message: sails.config.msgConstants.recordNotFound,
					data: [],
					status: "ok"
				});
			}
		} catch (e) {
			return res.serverError(e);
		}
	},
	/**
	 * @description :: other users - to add evaluator(s) for evaluation of a particular loan
	 * @api {post} /addEvaluator Fetch Evaluation Details
	 * @apiName Evaluation Types
	 * @apiHeader  authorization
	 * @apiGroup Other Users
	 * @apiExample Example usage:
	 * curl -i localhost:1337/addEvaluator
	 * @apiParam {Object[]} evaluators evaluatorTypeId, assigneeId, comment
	 * @apiParam {String} loanId
	 * @apiParam {String} loanRefId
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String}  message 'successfully added evaluators'
	 */
	addEvaluator: async function (req, res, next) {
		/* request will be an array of evaluators and type of evaluation and might contain comments as well.*/
		params = req.body;
		fields = ["evaluators", "loanId", "loanRefId"];
		missing = await reqParams.fn(params, fields);

		if (!req.body.evaluators || !req.body.loanId || !req.user.id || !req.body.loanRefId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let evaluatorList = req.body.evaluators;
		// check sanity of the Array of Objects
		let evaluatorsArray = [];
		try {
			let dateTime = await sails.helpers.dateTime();
			if (req.body.status) {
				nc_status_manage = await NcStatusManageRd.findOne({
					name: req.body.status,
					white_label_id: req.user.loggedInWhiteLabelID
				});
				loanreqUpdate = await Loanrequest.update({loan_ref_id: req.body.loanRefId})
					.set({
						loan_status_id: nc_status_manage.status1,
						loan_sub_status_id: nc_status_manage.status2
					})
					.fetch();
				loanBankmappingUpdate = await LoanBankMapping.update({id: req.body.loan_bank_mapping_id})
					.set({
						loan_bank_status: nc_status_manage.status3,
						loan_borrower_status: nc_status_manage.status4,
						meeting_flag: nc_status_manage.status6,
						notification_status: "yes"
					})
					.fetch();
			}
			const loanData = await LoanrequestRd.findOne({id: req.body.loanId});
			const taskMaster = await TaskMasterRd.findOne({task_cat_id: evaluatorList[0].evaluationTypeId, white_label_id: loanData.white_label_id})
				.select("usertype");
			const whitelabelData = await WhiteLabelSolutionRd.findOne({id: loanData.white_label_id})
				.select("assignment_type");
			for (let i = 0; i < evaluatorList.length; i++) {
				let assigned = false;
				if (taskMaster.usertype === "BPO") {
					const countAlreadyAssigned = await TaskUserMappingRd.count({
						taskid: 13,
						loan_id: req.body.loanId,
						status: "pending",
						reassigned_userid: evaluatorList[i].assigneeId
					});
					if (countAlreadyAssigned > 0) {
						assigned = true;
					}
				} else {
					const countAlreadyAssigned = await TaskUserMappingRd.count({
						loan_id: req.body.loanId,
						status: "open",
						assign_userid: evaluatorList[i].assigneeId
					});
					if (countAlreadyAssigned > 0) {
						assigned = true;
					}
				}
				if (evaluatorList[i].assigneeId && evaluatorList[i].evaluationTypeId && !assigned) {
					let evaluatorsObject = {};
					evaluatorsObject["taskid"] = evaluatorList[i].evaluationTypeId;
					evaluatorsObject["reference_id"] = req.body.loanId;
					evaluatorsObject["details"] = evaluatorList[i].comment || "NA";
					evaluatorsObject["creator_id"] = req.user.id;
					evaluatorsObject["assign_userid"] = evaluatorList[i].assigneeId;
					evaluatorsObject["status"] = "open";
					evaluatorsObject["priority"] = "High";
					evaluatorsObject["due_date"] = dateTime;
					evaluatorsObject["loan_id"] = req.body.loanId;
					evaluatorsObject["loan_ref_id"] = req.body.loanRefId;
					evaluatorsObject["created_time"] = dateTime;
					evaluatorsObject["assigned_document_list"] = JSON.stringify(evaluatorList[i].docTypeList);
					evaluatorsObject["notification"] = 1;
					if (taskMaster.usertype === "BPO") {
						evaluatorsObject["status"] = "pending";
						evaluatorsObject["reassigned_userid"] = evaluatorList[i].assigneeId;
					}
					if (whitelabelData.assignment_type.rcu_to_external_evaluation && taskMaster.usertype === 'Document' && req.user.usertype === 'RCU') {
						const taskMaster = await TaskMasterRd.findOne({usertype: req.user.usertype, white_label_id: loanData.white_label_id})
							.select("task_cat_id");
						const taskDataForRCU = await TaskUserMappingRd.findOne({
							taskid: taskMaster.task_cat_id,
							loan_id: req.body.loanId,
							status: "open",
							assign_userid: req.user.id
						});
						if (taskDataForRCU) {
							evaluatorsObject["status"] = "pending";
							evaluatorsObject["reassigned_userid"] = evaluatorList[i].assigneeId;
							evaluatorsObject["parent_task_id"] = taskDataForRCU.id;
						}
					}
					// create insertion Object
					evaluatorsArray.push(evaluatorsObject);
				}
			}
			// insert the data to task_user_mapping table
			// insert into task comments - TODO
			if (evaluatorsArray.length === 0) {
				return res.send({
					status: "ok",
					message: sails.config.msgConstants.evaluatorAddedAlready
				});
			}
			let addedEvaluators = await TaskUserMapping.createEach(evaluatorsArray).fetch();
			if (addedEvaluators && taskMaster.usertype === "BPO") {

				nc_status_manage = await NcStatusManageRd.findOne({
					name: "BPO Initiated",
					white_label_id: req.user.loggedInWhiteLabelID
				});
				loanreqUpdate = await Loanrequest.update({loan_ref_id: req.body.loanRefId})
					.set({
						loan_status_id: nc_status_manage.status1,
						loan_sub_status_id: nc_status_manage.status2,
						assignment_additional: req.user.id
					})
					.fetch();

				let remarks = {};
				let loanreqData = await LoanrequestRd.findOne({id: req.body.loanId});
				let data = {
					userId: addedEvaluators[0].creator_id,
					loan_status_id: loanreqData.loan_status_id,
					loan_sub_status_id: loanreqData.loan_sub_status_id,
					type: "Case Initiated to BPO",
					message: addedEvaluators[0].details || "NA",
					assignedBy: addedEvaluators[0].creator_id,
					assignedTo: addedEvaluators[0].reassigned_userid,
				};
				if (!loanreqData.remarks) {
					remarks[dateTime] = data;
					remarks = JSON.stringify(remarks);
				} else {
					let jsonRemarks = JSON.parse(loanreqData.remarks);
					jsonRemarks[dateTime] = data;
					remarks = JSON.stringify(jsonRemarks);
				}
				await Loanrequest.update({id: req.body.loanId}).set({remarks: remarks});
			}
			// dateTime = moment(dateTime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
			let taskCommentArray = [];
			if (addedEvaluators) {
				addedEvaluators.forEach((element) => {
					let taskCommentObject = {};
					if (element.details != "NA") {
						taskCommentObject["task_id"] = element.id;
						taskCommentObject["commenter_id"] = req.user.id;
						taskCommentObject["comment"] = element.details;
						taskCommentObject["created_time"] = dateTime;
					}
					taskCommentArray.push(taskCommentObject);
				});
				let taskCommentAdded = await TaskComments.createEach(taskCommentArray).fetch();
				return res.send({
					status: "ok",
					message: sails.config.msgConstants.successfulInsertion
				});
			}
		} catch (e) {
			return res.serverError(e);
		}
	},

	fetchSecondaryBpoAssignee: async function (req, res, next) {
		let taskId = req.param("taskId");
		let loanId = req.param("loanId");

		params = req.allParams();
		fields = ["taskId", "loanId"];
		missing = await reqParams.fn(params, fields);

		if (!taskId || !loanId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let assignees = [];
		try {
			let responseData;
			const taskUserMappingData = await TaskUserMappingRd.findOne({id: taskId});
			let categoryId = taskUserMappingData.taskid;

			loanreqData = await LoanrequestRd.findOne({id: loanId});
			const whitelabelData = await WhiteLabelSolutionRd.findOne({id: loanreqData.white_label_id})
				.select(["ref_bank_id", "assignment_type"]);

			let parentUserId;
			if (taskUserMappingData && taskUserMappingData.reassigned_userid) {
				const userData = await UsersRd.findOne({id: taskUserMappingData.reassigned_userid});
				if (userData) {
					parentUserId = {
						name: userData.name,
						id: taskUserMappingData.reassigned_userid,
						usertype: userData.usertype
					};
				}
			}

			const taskMaster = await TaskMasterRd.findOne({task_cat_id: categoryId, white_label_id: whitelabelData.id})
				.select("usertype");
			if ((taskMaster.usertype === "BPO" || taskMaster.usertype === "Document") && taskUserMappingData && taskUserMappingData.reassigned_userid) {
				const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
					query = `select name, userid as id,usertype from users where status = "active" and is_corporate = 1 and is_other = 1 and is_user_admin = "No" and  usertype in (select usertype from task_master where task_cat_id = $1) and userid in (select userid from user_corporate_mapping where user_type = "Secondary" and created_by = ${taskUserMappingData.reassigned_userid} ) and userid not in (select assign_userid from task_user_mapping where loan_id = ${loanId} and status = 'open') and white_label_id in (${whitelabelData.id})`;
				assignees = await myDBStore.sendNativeQuery(query, [categoryId]);
				responseData = assignees.rows;
			}
			return res.ok({
				data: responseData,
				parentUserId: parentUserId,
				message: "",
				status: "ok"
			});
		} catch (e) {
			return res.serverError(e);
		}
	},

	evaluatorReassign: async function (req, res, next) {
		/* request will be an array of evaluators and type of evaluation and might contain comments as well.*/
		params = req.body;
		fields = ["evaluators", "loanId", "loanRefId"];
		missing = await reqParams.fn(params, fields);

		if (!req.body.evaluators || !req.body.loanId || !req.user.id || !req.body.loanRefId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let evaluatorList = req.body.evaluators;
		let evaluatorsArray = [];
		try {
			let dateTime = await sails.helpers.dateTime();
			const loanData = await LoanrequestRd.findOne({id: req.body.loanId});
			const taskUserMappingData = await TaskUserMappingRd.findOne({id: evaluatorList.taskId});
			let categoryId = taskUserMappingData.taskid;

			const taskMaster = await TaskMasterRd.findOne({task_cat_id: categoryId, white_label_id: loanData.white_label_id})
				.select("usertype");

			const userMapping = await UserCorporateMappingRd.findOne({userid: evaluatorList.assigneeId});
			if (evaluatorList.assigneeId != taskUserMappingData.reassigned_userid && !(userMapping && userMapping.user_type == 'Secondary' && userMapping.created_by == taskUserMappingData.reassigned_userid)) {
				return res.send({
					status: "ok",
					message: 'User not allowed to reassign this case'
				});
			}
			let assigned = false;
			if (taskMaster.usertype === "BPO" || taskMaster.usertype === "Document") {
				const countAlreadyAssigned = await TaskUserMappingRd.count({
					id: evaluatorList.taskId,
					taskid: categoryId,
					loan_id: req.body.loanId,
					status: 'open',
					assign_userid: evaluatorList.assigneeId
				});
				if (countAlreadyAssigned > 0) {
					assigned = true;
				}
			}
			if (evaluatorList.assigneeId && categoryId && !assigned) {

				let evaluatorsObject = {};
				evaluatorsObject["assign_userid"] = evaluatorList.assigneeId;
				evaluatorsObject["status"] = "open";
				evaluatorsObject["updated_time"] = dateTime;

				let updatedEvaluators = await TaskUserMapping.updateOne({id: evaluatorList.taskId}).set(evaluatorsObject).fetch();
				evaluatorsArray.push(updatedEvaluators);
			}

			if (evaluatorsArray.length === 0) {
				return res.send({
					status: "ok",
					message: sails.config.msgConstants.evaluatorAddedAlready
				});
			}

			if (evaluatorsArray && taskMaster.usertype === 'BPO') {
				let remarks = {};
				let data = {
					userId: evaluatorsArray[0].reassigned_userid,
					loan_status_id: loanData.loan_status_id,
					loan_sub_status_id: loanData.loan_sub_status_id,
					type: "Case Assigned",
					message: evaluatorList.comment || "NA",
					assignedBy: evaluatorsArray[0].reassigned_userid,
					assignedTo: evaluatorsArray[0].assign_userid,
				};
				if (!loanData.remarks) {
					remarks[dateTime] = data;
					remarks = JSON.stringify(remarks);
				} else {
					let jsonRemarks = JSON.parse(loanData.remarks);
					jsonRemarks[dateTime] = data;
					remarks = JSON.stringify(jsonRemarks);
				}
				await Loanrequest.update({id: req.body.loanId}).set({remarks: remarks});
			}

			const approval_log = await ApprovalLogsRd.findOne({
				reference_id: req.body.loanId,
				status: "pending",
				type: "Disbursement Approval"
			})
			if (approval_log) {
				await ApprovalLogs.updateOne({id: approval_log.id}).set({status: "reassigned", updated_at: dateTime});
				let commentString = [{
					assignedBy: req.user.id,
					assigneeComments: "",
					assignedByComments: evaluatorList.comment || "NA",
					created_at: dateTime,
					updated_at: dateTime
				}];
				approval_data = await ApprovalLogs.create({
					reference_id: req.body.loanId,
					reference_type: sails.config.msgConstants.LOAN,
					status: "pending",
					user_id: evaluatorList.assigneeId,
					comments: JSON.stringify(commentString),
					type: "Disbursement Approval"
				});
				let loanBankMappingData = await LoanBankMappingRd.findOne({loan_id: req.body.loanId});
				let pos_user_id = evaluatorList.assigneeId.toString();
				if (loanBankMappingData.assigned_extended_ids) {
					arrayData = loanBankMappingData.assigned_extended_ids.split(",");
					if (arrayData.includes(pos_user_id)) {
						pos_user_id = loanBankMappingData.assigned_extended_ids;
					} else {
						pos_user_id = loanBankMappingData.assigned_extended_ids + "," + evaluatorList.assigneeId.toString();
					}
				}
				await LoanBankMapping.updateOne({id: loanBankMappingData.id}).set({assigned_extended_ids: pos_user_id, notification_status: "yes"});
				let disbursementData = await LoanDisbursementRd.findOne({loan_bank_mapping_id: loanBankMappingData.id, disbursement_status: 'initiated to bpo'});
				if (disbursementData) {
					await LoanDisbursement.updateOne({id: disbursementData.id}).set({assigned_extended_id: evaluatorList.assigneeId});
					let revenue_status_data = await RevenueStatusRd.find({status_caption: 'Initiated To BPO'});
					revenueData = await RevenueStatusComments.create({
						loan_bank_mapping_id: loanBankMappingData.id,
						comments: evaluatorList.comment || "NA",
						comment_id: revenue_status_data[0].id,
						type: "Disbursement",
						created_on: dateTime,
						created_by: req.user.id,
						disbursement_id: disbursementData.id
					});
				}

				return res.send({
					status: "ok",
					message: "Case reassigned"
				});
			}

			let taskCommentArray = [];
			if (evaluatorsArray) {
				evaluatorsArray.forEach((element) => {
					let taskCommentObject = {};
					if (element.details != "NA") {
						taskCommentObject["task_id"] = element.id;
						taskCommentObject["commenter_id"] = req.user.id;
						taskCommentObject["comment"] = evaluatorList.comment || "NA";
						taskCommentObject["created_time"] = dateTime;
					}
					taskCommentArray.push(taskCommentObject);
				});
				await TaskComments.createEach(taskCommentArray).fetch();
				return res.send({
					status: "ok",
					message: "Case reassigned"
				});
			}
		} catch (e) {
			return res.serverError(e);
		}
	},

	/**
	 * @description :: other users - to submit an evaluation after completing
	 * @api {post} /submitEvaluation Submit Evaluation Details
	 * @apiName Submit Evaluation
	 * @apiHeader  authorization
	 * @apiGroup Other Users
	 * @apiExample Example usage:
	 * curl -i localhost:1337/submitEvaluation
	 * @apiParam {String} comment
	 * @apiParam {String} evaluationId
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String}  message 'successfully updated evaluation'
	 */
	submitEvaluation: async function (req, res, next) {
		const {evaluationId, comment, action} = params = req.body;
		fields = ["evaluationId"];
		missing = await reqParams.fn(params, fields);

		if (!evaluationId || !req.user.id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let dateTime = await sails.helpers.dateTime();
		try {
			const taskPermissionData = await TaskUserMappingRd.findOne({id: evaluationId});
			if (taskPermissionData.assign_userid != req.user.id) {
				return res.ok({
					status: "nok",
					message: "User not allowed to complete evaluation. Task assigned to different user"
				})
			}
			const loanreqData = await LoanrequestRd.findOne({id: taskPermissionData.loan_id}).populate("business_id");

			let taskCommentAdded = await TaskComments.create({
				task_id: evaluationId,
				commenter_id: req.user.id,
				comment: comment || "NA",
				created_time: dateTime
			}).fetch();
			const whitelabelData = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID})
				.select("assignment_type");
			const vendor_loan_type = sails.config.vendor_loan_type;
			if (whitelabelData.assignment_type.rcu_to_external_evaluation && req.user.usertype === 'RCU') {
				if (loanreqData.loan_type_id == vendor_loan_type) {
					if (!action || action === "complete") {
						await Users.update({id: loanreqData.business_id.userid}).set({status: "active"});
						await Loanrequest.updateOne({id: loanreqData.id}).set({loan_status_id: 19, loan_sub_status_id: 19});
					}
					else if (action === "reject") {
						await Loanrequest.updateOne({id: loanreqData.id}).set({loan_status_id: 18, loan_sub_status_id: 18, remarks_val: 6});
					}
				}
				const childTaskData = await TaskUserMappingRd.find({parent_task_id: evaluationId});
				let allTasksClosed = true;
				for (const task of childTaskData) {
					if (task.status !== 'close') {
						allTasksClosed = false;
						break;
					}
				}
				if (!allTasksClosed) {
					return res.ok({
						status: "nok",
						message: "Tasks pending from Document Checker"
					})
				}
			}
			let statusUpdate = "close";
			if (action) {
				if (action === "send_back") statusUpdate = "sent back";
				else if (action === "reject") statusUpdate = "cancel";
			}

			const updateTask = await TaskUserMapping.update({id: evaluationId})
				.set({
					status: statusUpdate,
					completed_time: dateTime
				})
				.fetch();

			const taskMaster = await TaskMasterRd.findOne({task_cat_id: updateTask[0].taskid, white_label_id: loanreqData.white_label_id}).select("usertype");
			if (updateTask && taskMaster && taskMaster.usertype === 'BPO' &&
				sails.config.muthoot_white_label_id.includes(Number(loanreqData.white_label_id))) {

				let remarks = {};
				let nc_status = {};
				let obj = {
					document_upload: 'Done'
				};
				let remarkdData = {
					userId: req.user.id,
					loan_status_id: loanreqData.loan_status_id,
					loan_sub_status_id: loanreqData.loan_sub_status_id,
					type: "Evaluation Completed",
					message: comment || "NA",
					assignedBy: req.user.id
				};
				data = {
					userId: req.user.id,
					loan_status_id: loanreqData.loan_status_id,
					loan_sub_status_id: loanreqData.loan_sub_status_id,
					document_initiate_status: 'Done',
					initiated_by: req.user.name
				};
				if (comment) {
					data.type = "Comments";
					data.message = comment;
				}
				if (!loanreqData.remarks) {
					remarks[dateTime] = remarkdData;
					remarks = JSON.stringify(remarks);
				} else {
					let jsonRemarks = JSON.parse(loanreqData.remarks);
					jsonRemarks[dateTime] = remarkdData;
					remarks = JSON.stringify(jsonRemarks);
				}
				if (!loanreqData.nc_status_history) {
					nc_status[dateTime] = data;
					nc_status = JSON.stringify(nc_status);
				} else {
					let jsonNcStatus = JSON.parse(loanreqData.nc_status_history);
					jsonNcStatus[dateTime] = data;
					nc_status = JSON.stringify(jsonNcStatus);
				}

				obj.remarks = remarks;
				obj.nc_status_history = nc_status;
				const reqData = {
					white_label_id: loanreqData.white_label_id,
					business_id: loanreqData.business_id.id,
					loan_id: loanreqData.id
				};
				method = "POST";
				url = sails.config.docUpload.auto_credit_assign_url;
				let apiTrigger = await sails.helpers.sailstrigger(url, JSON.stringify(reqData), "", method);
				try {
					apiTrigger = JSON.parse(apiTrigger);
				} catch {
					apiTrigger = null;
				}
				if (apiTrigger.status == "nok" || apiTrigger.error == 5) {
					return res.badRequest(apiTrigger);
				} else {
					await Loanrequest.update({id: loanreqData.id})
						.set(obj);
					return res.ok({
						status: "ok",
						statusCode: "NC200",
						message: "Case Initiated to Credit Assign",
						data: {}
					});
				}
			}
			const loanBankMappingData = await LoanBankMappingRd.find({loan_id: updateTask[0].loan_id});
			if (
				loanreqData &&
				loanBankMappingData.length > 0 &&
				loanreqData.loan_status_id == 2 &&
				loanreqData.loan_sub_status_id == 9 &&
				loanBankMappingData[0].loan_bank_status == 12 &&
				loanBankMappingData[0].loan_borrower_status == 10 &&
				(loanBankMappingData[0].meeting_flag == 1 ||
					loanBankMappingData[0].meeting_flag == " " ||
					loanBankMappingData[0].meeting_flag == 0)
			) {
				const loanBankMappingUpdate = await LoanBankMapping.update({id: loanBankMappingData[0].id})
					.set({
						loan_bank_status: 9,
						loan_borrower_status: 2,
						meeting_flag: "0",
						notification_status: "yes"
					})
					.fetch();
			}

			if (updateTask) {
				return res.send({
					status: "ok",
					message: sails.config.msgConstants.successfulUpdation
				});
			}
		} catch (e) {
			return res.serverError(e);
		}
	},
	/**
	 * @description :: other users - to view comments that assigner wrote before assigning
	 * @api {get} /viewEvaluationComments Fetch Evaluation Comments Details
	 * @apiName Evaluation Comments
	 * @apiHeader  authorization
	 * @apiGroup Other Users
	 * @apiExample Example usage:
	 * curl -i localhost:1337/viewEvaluationComments?loanId = 19303
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} creatorId
	 *
	 * @apiSuccess {String}  message 'successfully updated evaluation'
	 */
	viewEvaluationComments: async function (req, res, next) {
		const moment = require("moment");

		params = req.allParams();
		fields = ["loanId"];
		missing = await reqParams.fn(params, fields);

		if (!req.param("loanId")) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		otherUsers = false;
		if (sails.config.otherUsersTypes.find((element) => element == req.user.usertype)) {
			otherUsers = true;
		}
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let query = "";
		// This is to display all comments on a loan for
		if (otherUsers) {
			query = `select tum.creator_id ,date(tum.created_time) assigned_at, tm.taskname ,ou.name other_user_name, u.name,  tum.id taskid, tum.details as 'comment', tc.comment as other_user_comment from task_user_mapping tum  left join users u on (u.userid = tum.creator_id) left join users ou on (ou.userid = tum.assign_userid) join task_master tm on (tm.task_cat_id = tum.taskid) left join task_comments tc on (tc.commenter_id = tum.assign_userid and tc.task_id = tum.id) where tum.loan_id  = $1  and tum.assign_userid = ${req.user.id} group by tum.creator_id, tum.details, tum.assign_userid;`;
		} else {
			query = `select tum.creator_id ,date(tum.created_time) assigned_at, tm.taskname ,ou.name other_user_name, u.name,  tum.id taskid, tum.details as 'comment', tc.comment as other_user_comment from task_user_mapping tum  left join users u on (u.userid = tum.creator_id) left join users ou on (ou.userid = tum.assign_userid) join task_master tm on (tm.task_cat_id = tum.taskid) left join task_comments tc on (tc.commenter_id = tum.assign_userid and tc.task_id = tum.id) where tum.loan_id  = $1 group by tum.creator_id, tum.details, tum.assign_userid;`;
		}
		try {
			let loanId = req.param("loanId");
			const viewCommentHistory = await myDBStore.sendNativeQuery(query, [loanId]);
			const loanRequestData = await LoanrequestRd.findOne({
				select: ["remarks"],
				where: {id: loanId}
			});
			const data = [];
			if (viewCommentHistory) {
				viewCommentHistory.rows.forEach((element) => {
					try {
						element.assigned_at = moment(element.assigned_at).format("YYYY-MM-DD HH:mm:ss");
					} catch (e) {
						element.assigned_at = "Invalid Date";
					}
				});
				data.push(viewCommentHistory.rows[0]);
				data.push(JSON.parse(loanRequestData.remarks));
				return res.ok({
					data,
					status: "ok",
					message: ""
				});
			} else {
				return res.ok({
					message: sails.config.msgConstants.recordNotFound,
					data: [],
					status: "ok"
				});
			}
		} catch (e) {
			return res.serverError(e);
		}
	},
	updateStatus: async function (req, res) {
		params = req.allParams();
		fields = ["loanId"];
		missing = await reqParams.fn(params, fields);

		if (!req.body.loanId || !req.user.id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		try {
			const updateStatus = await Loanrequest.update({id: req.body.loanId})
				.set({
					loan_status_id: 20
				})
				.fetch();
			if (updateStatus) {
				return res.send({
					status: "ok",
					message: sails.config.msgConstants.successfulUpdation
				});
			}
		} catch (e) {
			return res.serverError(e);
		}
	},
	dashboard: async function (req, res, next) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		const moment = require("moment");
		const date = moment(new Date()), // 2009-11-10
			month = moment(date.month() + 1, "M").format("MMMM"),
			user_whitelabel = req.user.loggedInWhiteLabelID;
		let lastDate;
		(dashboardQryCountDetails = []), (lenderDetails = []);
		//application-points
		docDisbursCount =
			docUploadCount =
			lenderofferCount =
			currMonthContactCount =
			currMonthApplCount =
			currMonthApplPoints =
			totApplPoints =
			currLoanDocPoints =
			totLoanDocPoints =
			totLoanDisbursmentPoints =
			currLoanDisbursmentPoints =
			totLoanOfferPoints =
			totLoanLenderPoints =
			currLoanLenderPoints =
			currLoanOfferPoints =
			currMonthContactPoints =
			points =
			currMonthPoints =
			totPoints =
			currMonthLogPoints =
			totLogPoints =
			totContactPoints =
			0;

		try {
			logService = await sails.helpers.logtrackservice(
				req,
				"dashboard",
				req.user.id,
				"dashboard_report_otherusers"
			);
			//---------------------------------------------APPLICATION USAGE POINTS BASED ON USER
			// fetch count of monthly assigned,
			// fetch count of monthly completed
			monthlyAssignedQuery = `select count(distinct(loan_id)) as monthly_assigned_count from task_user_mapping where assign_userid = $1 and month(created_time) = month(now()) and year(created_time) = year(now()) and status in ('open', 'close') `;
			const monthlyAssigned = await myDBStore.sendNativeQuery(monthlyAssignedQuery, [req.user.id]);
			monthlyCompletedQuery = `select count(distinct(loan_id)) as monthly_completed_count from task_user_mapping where assign_userid = $1 and month(completed_time) = month(now()) and year(completed_time) = year(now()) and status = 'close'`;
			const monthlyCompleted = await myDBStore.sendNativeQuery(monthlyCompletedQuery, [req.user.id]);

			currMonthPoints = monthlyAssigned.rows[0]
				? monthlyAssigned.rows[0].monthly_assigned_count
				: 0 + monthlyCompleted.rows[0]
					? monthlyCompleted.rows[0].monthly_completed_count
					: 0;
			points = {
				current_month_points: currMonthPoints != null ? currMonthPoints : 0,
				total_points: totPoints
			};
			dashboardQryCountDetails = {
				application_count: [],
				loan_offer_count: [],
				loan_disbursed_count: [],
				app_usage_points: points,
				sum_paid_invoice: 0,
				expected_payout: 0,
				offerAmount: {},
				disbursmentAmount: {},
				applicationCount: 0,
				relationshipManagerDetails: {}
			};
			//To Do.. fetch from assigner id
			const lastLoginDate = await AuditLogTableRd.find({
				where: {
					user_id: req.user.id,
					action_reference: "users",
					action: "Read"
				},
				select: ["request_time"]
			})
				.sort([{id: "DESC"}])
				.limit(2);
			lastLoginDate.length > 0
				? lastLoginDate.length > 1
					? (lastDate = lastLoginDate[1].request_time)
					: (lastDate = lastLoginDate[0].request_time)
				: (lastDate = "");
			const pwdComplexity = await WhiteLabelSolutionRd.findOne({
				where: {
					id: user_whitelabel
				},
				select: ["password_rule"]
			});
			return {
				status: "ok",
				message: "User Report",
				channelRating: {},
				lastLogin: lastDate,
				passwordComplexity: pwdComplexity && pwdComplexity.password_rule,
				payload: {
					lenderDetails: [],
					yearly_report: dashboardQryCountDetails,
					reassign: {}
				},
				other_user_count: [
					{
						order: 1,
						label: "Assigned",
						key: "assigned",
						count: monthlyAssigned.rows[0] ? monthlyAssigned.rows[0].monthly_assigned_count : 0
					},
					{
						order: 2,
						label: "Evaluation Completed",
						key: "completed",
						count: monthlyCompleted.rows[0] ? monthlyCompleted.rows[0].monthly_completed_count : 0
					}
				],

				azure: sails.config.azure.isActive
			};
		} catch (e) {
			return {
				message: sails.config.msgConstants.somethingWentWrong
			};
		}
	},

	docCheckList: async function (req, res) {
		let {loanRefId, assigneeId, doc_list} = (params = req.allParams());
		fields = ["loanRefId", "assigneeId", "doc_list"];
		missing = await reqParams.fn(params, fields);
		if (!loanRefId || !assigneeId || Object.keys(doc_list).length == 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		assigneeId = assigneeId || req.user.id;
		const taskData = await TaskUserMappingRd.find({loan_ref_id: loanRefId, assign_userid: assigneeId});

		if (taskData.length == 0) {
			return res.badRequest({status: "nok", message: "No data found for this user"});
		}

		const updateTaskData = await TaskUserMapping.update({id: taskData[0].id})
			.set({assigned_document_list: JSON.stringify(doc_list)})
			.fetch();

		if (updateTaskData.length > 0) {
			return res.ok({
				status: "ok",
				message: "Data updated successfully",
				data: updateTaskData
			});
		} else {
			return res.badRequest({
				status: "nok",
				message: "Network Error"
			});
		}
	}
};

// call loanDocumentupload
// lender doc upload - lenderdoc-upload
