/**
 * ViewLoanListingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
// const LenderDocument = require("../../../nc-federal-bank-api-integration/api/models/LenderDocument");
const {sales_user_list} = require("./UsersController"),
    moment = require("moment"),
    crypto = require('crypto'),

    /**
 * @api {get} /viewloanlisting/ Loan listing
 * @apiName loan listing
 * @apiGroup Loans
 * @apiExample Example usage:
 * curl -i localhost:1337/viewloanlisting
 * curl -i localhost:1337/viewloanlisting?limit=&skip=1
 * curl -i localhost:1337/viewloanlisting?status1=2&status2=9&status3=12&status4=12
 * @apiSuccess {object} loan_details .
 * @apiSuccess {object[]} status_details
 * @apiSuccess {Number} status_details.id id.
 * @apiSuccess {String} status_details.name name.
 * @apiSuccess {Number} status_details.status1 status1.
 * @apiSuccess {Number} status_details.status2 status2.
 * @apiSuccess {Number} status_details.status3 status3.
 * @apiSuccess {Number} status_details.status4 status4.
 * @apiSuccess {Number} status_details.status5 status5.
 * @apiSuccess {Number} status_details.status6 status6.
 * @apiSuccess {String} status_details.white_label_id white label id.
 * @apiSuccess {Number} status_details.parent_flag parent flag.
 * @apiSuccess {Number} status_details.parent_id parent id.
 * @apiSuccess {String} status_details.status
 * @apiSuccess {String} status_details.execulded_users
 * @apiSuccess {Number} status_details.sort_by_id
 * @apiSuccess {String} status_details.exclude_user_ncdoc
 * @apiSuccess {String} status_details.caption
 * @apiDescription
 * pagination skip and limit params
 * To get the Loan status details
 * From LoanDetails object : Consider
 * loan_status_id:status1,
 * loan_sub_status_id:Status2,
 * loan_bank_status:Status3,
 * loan_borrower_status:Status4.
 * Need to Refer status_details object to get actual loan status
 * where status1,status2,status3,status4 matching on each object
 * To filter based on status:
 * @apiParam {Number} status1 status1(loan_status_id)
 * @apiParam {Number} status2 status2(loan_sub_status_id)
 * @apiParam {Number} status3 status3(loan_bank_status_id)
 * @apiParam {Number} status4 status4(loan_borrower_status_id)
 * @apiParam {Number} search search(you are search by loan ref,business name and business email)
 *
 */
    reqParams = require("../helpers/req-params");
const redis = require("ioredis");
// if (sails.config.redis.host == "127.0.0.1") {
const redis_conn = new redis.Redis({
    host: sails.config.redis.host,
    port: 6379
});

// } else {
// const redis_conn = new redis.Cluster([{
// host: sails.config.redis.host,
// port: 6379
// }, {
// host: sails.config.redis.host_sec,
// port: 6379
// }]);
// }

//if (sails.config.redis.host == "127.0.0.1") {
// const redis_conn = new redis.Redis({
// host: sails.config.redis.host,
// port: 6379
// });

//} else {*/
// const redis_conn = new redis.Cluster([{
// host: sails.config.redis.host,
// port: 6379
// }, {
// host: sails.config.redis.host_sec,
// port: 6379
// },
// {
// 	host: sails.config.redis.host_third,
// port: 6379
// }
// ]);


module.exports = {

    index: async (req, res) => {

        const page_count = req.param("skip") ? req.param("skip") : 0,
            limit_count = req.param("limit") ? req.param("limit") : 10;

        const reqData = {
            loan_status_id: req.param("status1"),
            loan_sub_status_id: req.param("status2"),
            loan_bank_status_id: req.param("status3"),
            loan_borrower_status_id: req.param("status4"),
            meeting_flag: req.param("status6"),
            search: req.param("search"),
            page_count: req.param("skip") ? req.param("skip") : 0,
            limit_count: req.param("limit") ? req.param("limit") : 10,
            status: req.param("status")
        };
        const status_5 = req.param("status5");

        /* mapping the status with text */
        const statusKey = [reqData.loan_status_id, reqData.loan_sub_status_id, reqData.loan_bank_status_id, reqData.loan_borrower_status_id, status_5, reqData.meeting_flag].filter(value => value !== undefined);
        const statusKey_result = statusKey.join('_');
        const statusMappings = sails.config.status_data_redis;
        const app_status = statusMappings[statusKey_result] || "";

        let dbBankDocTypeCheck, dbBankDownloadDoc, createdUserData, bankUserData;
        let otherUsers = false;
        if (sails.config.otherUsersTypes.find((element) => element == req.user.usertype)) {
            otherUsers = true;
        }
        const {whereCondition, other_users_status} = await sails.helpers.viewloanCondition(req.user, reqData);
        const viewLoanDetails = await sails.helpers.viewLoanData(reqData, whereCondition);
        // return res.ok(viewLoanDetails)
        for (let i = 0; i < viewLoanDetails.length; i++) {
            viewLoanDetails[i].otherUsers = otherUsers;
            viewLoanDetails[i].other_users_status = other_users_status;
            viewLoanDetails[i].loggedInUserId = req.user.id;
            // try {
            // const {loan, business, users, sales_id,lender_status, loan_bank_mapping, branch_id, loggedInUserId,white_label_id, createdUserId,
            // 		loan_asset_type,loan_usage_type, loan_type, loan_products} = viewLoanDetails[i];
            // 		// console.log("++++++++++++++++++++++++", reqData);

            // 		viewLoanDetails[i].users = await usersDataFetch(users) || [],
            // 		viewLoanDetails[i].sales_id = viewLoanDetails[i].assigned_credit_user = await usersDataFetch(sales_id) || [],
            // 		viewLoanDetails[i].created_user = viewLoanDetails[i].assigned_institute_user = await usersDataFetch(createdUserId) || [],
            // 		viewLoanDetails[i].loan = await LoanrequestRd.findOne({id :loan}).select(["loan_request_type",
            // 		"business_id", "loan_ref_id", "loan_amount", "loan_amount_um", "remarks_val", "modified_on", "RequestDate", "application_ref", "loan_origin", "connector_user_id",
            // 		"applied_tenure", "annual_revenue" , "revenue_um", "annual_op_expense", "op_expense_um", "cur_monthly_emi", "loan_status_id", "loan_sub_status_id", "parent_product_id", "createdUserId"]),
            // 		viewLoanDetails[i].business = await BusinessRd.findOne({id : business}).select(["businessname", "userid", "first_name", "last_name", "businesstype", "customer_id"]),
            // 		viewLoanDetails[i].loan_asset_type = await LoanAssetTypeRd.findOne({id : loan_asset_type}),
            // 		viewLoanDetails[i].loan_usage_type = await LoanUsageTypeRd.findOne({id : loan_usage_type}),
            // 		viewLoanDetails[i].loan_type = await LoantypeRd.findOne({id: loan_type}).select("loanType"),
            // 		viewLoanDetails[i].loan_products = await LoanProductsRd.findOne({id : loan_products}).select(["product","payment_structure","security","loan_request_type","loan_type_id",
            // 		"loan_asset_type_id","loan_usage_type_id","parent_flag","parent_id","created","business_type_id","dynamic_forms"]);
            // if (!viewLoanDetails[i].loan_products.dynamic_forms) {
            // 	viewLoanDetails[i].loan_products.dynamic_forms = await sails.helpers.dynamicForms();
            // }
            // const dbdocData = await dbDocDetails(viewLoanDetails[i].loan.id);
            // viewLoanDetails[i].dbDocCheck = dbdocData.dbBankDocTypeCheck;
            // viewLoanDetails[i].dbDownloadCheck = dbdocData.dbBankDownloadDoc;
            // viewLoanDetails[i].is_assigned = false;
            // viewLoanDetails[i].director_details = await directorDetails(viewLoanDetails[i].business.id) || [];

            // // loanData.createdUserId = createdUserData;
            // // const dataObj = {
            // // 	users : usersData,
            // // 	business : businessData,
            // // 	loan_products : loanProductData,
            // // 	loan_usage_type : loanUsageTypeData,
            // // 	loan_asset_type : loanAssetTypeData,
            // // 	loan : loanData,
            // // 	sales_id : salesData,
            // // 	assigned_credit_user : salesData,
            // // 	loan_type : loanTypeData,
            // // 	created_user : createdUserData,
            // // 	assigned_institute_user : createdUserData,
            // // 	is_assigned : false,
            // // 	loan_document : [],
            // // 	lender_document : [],
            // // 	director_details : await directorDetails(business) || [],
            // // 	assigned_extended_ids : [],
            // // 	bank_emp_data : {},
            // // 	bank_user : {},
            // // 	loan_bank_mapping : {},
            // // 	dbDocCheck : dbdocData.dbBankDocTypeCheck,
            // // 	dbDownloadCheck : dbdocData.dbBankDownloadDoc
            // // };
            // if (loan_bank_mapping){
            // 	viewLoanDetails[i].loan_bank_mapping = dataObj.loan_bank_mapping = await LoanBankMappingRd.findOne({id : loan_bank_mapping}).select(["bank_id", "bank_emp_id", "loan_bank_status", "loan_borrower_status", "meeting_flag", "assigned_extended_ids", "lender_status"]);
            // 	viewLoanDetails[i].lender_status = data.loan_bank_mapping.lender_status = await LoanStatusWithLenderRd.findOne({id : lender_status}).select("status");
            // 	viewLoanDetails[i].bank_user = data.bank_emp_data = data.loan_bank_mapping.bank_emp_id ?
            // 		await usersDataFetch(data.loan_bank_mapping.bank_emp_id) : null;
            // 	if (dataObj.loan_bank_mapping.assigned_extended_ids) {
            // 		const userId_arrData = dataObj.loan_bank_mapping.assigned_extended_ids.split(",");
            // 		viewLoanDetails[i].assigned_extended_ids = await UsersRd.find({id: userId_arrData.map(Number)}).select("name");
            // 	}
            // }
            // if (otherUsers) {
            // 	const findTaskId = await TaskUserMappingRd.find({
            // 		loan_id: loan,
            // 		assign_userid: loggedInUserId,
            // 		status: other_users_status
            // 	}).sort([{id: "DESC"}]);
            // 	viewLoanDetails[i]["evaluationId"] = findTaskId[0].id;
            // 	viewLoanDetails[i]["evaluation_status"] =
            // 		findTaskId[0].status == "open" ? "Assigned" : "Evaluation Completed";
            // 		viewLoanDetails[i]["assigned_at"] =
            // 		findTaskId[0].status == "open" ? findTaskId[0].created_time : findTaskId[0].completed_time;
            // }
            // const findTaskCount = await TaskUserMappingRd.count({
            // 	loan_id: loan
            // });
            // // This is to display if the task is already being assigned to external evaluator
            // if (findTaskCount > 0) {
            // 	viewLoanDetails[i].is_assigned = true;
            // }

            // let loanProductDetailsData = await LoanProductDetailsRd.find({
            // 	white_label_id: white_label_id,
            // 	isActive: "true",
            // 	product_id: {contains: loan_products}
            // }).select(["product_id", "parent_id", "loan_request_type"]);
            // if (loanProductDetailsData.length > 0) {
            // 	loanProductDetailsData = loanProductDetailsData.find(
            // 		(o) =>
            // 			Object.keys(o.product_id).includes(viewLoanDetails[i].business.businesstype.toString()) &&
            // 			Object.values(o.product_id).includes(loan_products)
            // 	);
            // }
            // viewLoanDetails[i].loan_product_details = loanProductDetailsData ? [loanProductDetailsData] : [];
            // if (viewLoanDetails[i].loan.parent_product_id) {
            // 	parentProductData = await LoanProductDetailsRd.findOne({id: viewLoanDetails[i].loan.parent_product_id}).select(["product_id", "basic_details"]);
            // 	parentProductData = {...JSON.parse(parentProductData.basic_details), ...parentProductData};
            // 	delete parentProductData.basic_details;
            // 	viewLoanDetails[i].parent_product = parentProductData;
            // } else {
            // 	viewLoanDetails[i].parent_product = {};
            // }
            // viewLoanDetails[i].loan_document = (await LoanDocumentRd.find({
            // 	loan,
            // 	status: "active"
            // }).select(["user_id", "doctype", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size", "directorId" ])
            // 	.populate("doctype")
            // 	.limit(200)) || [];
            // 	viewLoanDetails[i].lender_document = (await LenderDocumentRd.find({
            // 	loan,
            // 	status: "active"
            // }).select(["user_id","doc_type","doc_name", "uploaded_doc_name","original_doc_name", "status", "size_of_file", "directorId"])
            // 	.populate("doc_type")
            // 	.limit(200)) || [];


            // } catch (err){

            // }
            const loanDetails = await loanDetailsForView(viewLoanDetails[i]);
            // const loanDetails = await sails.helpers.loanDetailsForView(viewLoanDetails[i]);
            viewLoanDetails[i] = {...viewLoanDetails[i], ...loanDetails};
        }
        let sorted = [];

        if (otherUsers) {
            sorted = viewLoanDetails.sort((a, b) => {
                return b.assigned_at - a.assigned_at;
            });
        } else {
            sorted = viewLoanDetails;
        }
        return res.ok({
            status: "ok",
            loan_details: sorted,
            status_details: [] //v_ncStatusManage
        });
        return res.ok(viewLoanDetails);
        const expirationInSeconds = sails.config.redis.common_expire;
        const ncStatusManage_condition = crypto.createHash('md5').update(req.user.loggedInWhiteLabelID.toString()).digest('hex');
        const viewLoanManage_condition = crypto.createHash('md5').update(JSON.stringify(whereCondition) + JSON.stringify({page: page_count, limit: limit_count})).digest('hex');

        let view_loan_key = "view_loan_" + app_status + "_" + req.user.loggedInWhiteLabelID.toString() + "_" + viewLoanManage_condition;
        let nc_status_key = "ncstatus:" + ncStatusManage_condition;

        let result_status_key, result_loan_key;
        try {
            const result_loan_key = await redis_conn.exists(view_loan_key);
            if (result_loan_key === 1) {
                var view_loan_data = await redis_conn.get(view_loan_key);
                view_loan_data = await JSON.parse(view_loan_data).data;
            } else {
                var view_loan_data = await ViewloanRd.find(whereCondition)
                    .populate("users")
                    .populate("business")
                    .populate("loan_bank_mapping")
                    .populate("loan_products")
                    .populate("loan_usage_type")
                    .populate("loan_asset_type")
                    .populate("lender_status")
                    .populate("loan")
                    .populate("sales_id")
                    .sort([{modified_on: "DESC"}, {upts: "DESC"}])
                    .paginate({page: page_count, limit: limit_count});
                console.log(view_loan_data, "non cached");
                if (reqData.search == "") {
                    b = await redis_conn.set(view_loan_key, JSON.stringify({"data": view_loan_data}));
                    c = await redis_conn.expire(view_loan_key, expirationInSeconds);
                }
            }

        } catch (error) {

            var view_loan_data = await ViewloanRd.find(whereCondition)
                .populate("users")
                .populate("business")
                .populate("loan_bank_mapping")
                .populate("loan_products")
                .populate("loan_usage_type")
                .populate("loan_asset_type")
                .populate("lender_status")
                .populate("loan")
                .populate("sales_id")
                .sort([{modified_on: "DESC"}, {upts: "DESC"}])
                .paginate({page: page_count, limit: limit_count});
            console.log(view_loan_data, "non cached");

            if (reqData.search == "") {
                b = await redis_conn.set(view_loan_key, JSON.stringify({"data": view_loan_data}));
                c = await redis_conn.expire(view_loan_key, expirationInSeconds);
            }
        }

        try {
            let result_status_key = await redis_conn.exists(nc_status_key);
            if (result_status_key === 1) {
                v_ncStatusManage = await redis_conn.get(nc_status_key);
                v_ncStatusManage = await JSON.parse(v_ncStatusManage).data;
            } else {
                v_ncStatusManage = await NcStatusManageRd.find({white_label_id: req.user.loggedInWhiteLabelID});
                b = await redis_conn.set(nc_status_key, JSON.stringify({"data": v_ncStatusManage}));
                c = await redis_conn.expire(nc_status_key, expirationInSeconds);
            }
        } catch (error) {
            v_ncStatusManage = await NcStatusManageRd.find({white_label_id: req.user.loggedInWhiteLabelID});
            b = await redis_conn.set(nc_status_key, JSON.stringify({"data": v_ncStatusManage}));
            c = await redis_conn.expire(nc_status_key, expirationInSeconds);

        }
        console.log(result_status_key, result_loan_key, "=====================");
        //let view_loan_data,v_ncStatusManage;
        logService = await sails.helpers.logtrackservice(req, "viewloanlisting", req.user.id, "view_loan");

        Promise.all(
            view_loan_data.map(async (viewLoanListElement) => {
                viewLoanListElement.loan_type = await LoantypeRd.findOne({
                    id: viewLoanListElement.loan_type
                }).select("loanType");
                if (otherUsers) {
                    const findTaskId = await TaskUserMappingRd.find({
                        loan_id: viewLoanListElement.loan.id,
                        assign_userid: req.user.id,
                        status: other_users_status
                    }).sort([{id: "DESC"}]);
                    viewLoanListElement["evaluationId"] = findTaskId[0].id;
                    viewLoanListElement["evaluation_status"] =
                        findTaskId[0].status == "open" ? "Assigned" : "Evaluation Completed";
                    viewLoanListElement["assigned_at"] =
                        findTaskId[0].status == "open" ? findTaskId[0].created_time : findTaskId[0].completed_time;
                }
                // add verified code here
                viewLoanListElement.is_verified = true;
                // check verification in panno_response, ekyc_response_table
                if (viewLoanListElement["business"]) {
                    const panNumber = await Business.findOne({id: viewLoanListElement["business"].id}),
                        directorRecord = await DirectorRd.find({business: viewLoanListElement["business"].id, status: "active"}).select(
                            "dpancard"
                        ),
                        panNumbers = [];
                    if (panNumber.businesspancardnumber) panNumbers.push(panNumber.businesspancardnumber);
                    directorRecord.forEach((curRecord) => {
                        if (curRecord.dpancard) panNumbers.push(curRecord.dpancard);
                    });
                    const countPan = await PannoResponse.find({panno: panNumbers});
                    for await (const record of countPan) {
                        if (record && record.verification_response && viewLoanListElement.is_verified) {
                            m = JSON.parse(record.verification_response);
                            viewLoanListElement.is_verified = m["verificationData"]
                                ? m["verificationData"]["message"]["verified"] || false
                                : true;
                        }
                    }
                    if (viewLoanListElement.is_verified) {
                        const ekycData = await EkycResponse.find({ref_id: viewLoanListElement["business"].id});
                        for await (const elementEkyc of ekycData) {
                            if (elementEkyc.verification_response && viewLoanListElement.is_verified) {
                                m = JSON.parse(elementEkyc.verification_response);
                                viewLoanListElement.is_verified = m["verificationData"]
                                    ? (m["verificationData"]["message"] &&
                                        m["verificationData"]["message"]["verified"]) ||
                                    (m["verificationData"]["message"] &&
                                        m["verificationData"]["message"]["verification"]) ||
                                    false
                                    : true;
                            }
                        }
                    }
                }

                viewLoanListElement.is_assigned = false;
                const findTaskCount = await TaskUserMappingRd.count({
                    loan_id: viewLoanListElement.loan.id
                });
                // This is to display if the task is already being assigned to external evaluator
                if (findTaskCount > 0) {
                    viewLoanListElement.is_assigned = true;
                }

                viewLoanListElement.loan_products = _.pick(
                    viewLoanListElement.loan_products,
                    "id",
                    "product",
                    "payment_structure",
                    "security",
                    "loan_request_type",
                    "loan_type_id",
                    "loan_asset_type_id",
                    "loan_usage_type_id",
                    "parent_flag",
                    "parent_id",
                    "created",
                    "business_type_id",
                    "dynamic_forms"
                );
                if (!viewLoanListElement.loan_products.dynamic_forms) {
                    viewLoanListElement.loan_products.dynamic_forms = await sails.helpers.dynamicForms();
                }
                let loanProductData = await LoanProductDetailsRd.find({
                    white_label_id: viewLoanListElement.white_label_id,
                    isActive: "true",
                    product_id: {contains: viewLoanListElement.loan.loan_product_id}
                }).select(["product_id", "parent_id", "loan_request_type"]);
                if (loanProductData.length > 0) {
                    loanProductData = loanProductData.find(
                        (o) =>
                            Object.keys(o.product_id).includes(viewLoanListElement.business.businesstype.toString()) &&
                            Object.values(o.product_id).includes(viewLoanListElement.loan.loan_product_id)
                    );
                }
                viewLoanListElement.loan_product_details = loanProductData ? [loanProductData] : [];
                if (viewLoanListElement.loan.parent_product_id) {
                    parentProductData = await LoanProductDetailsRd.findOne({id: viewLoanListElement.loan.parent_product_id}).select(["product_id", "basic_details"]);
                    parentProductData = {...JSON.parse(parentProductData.basic_details), ...parentProductData};
                    delete parentProductData.basic_details;
                    viewLoanListElement.parent_product = parentProductData;
                } else {
                    viewLoanListElement.parent_product = {};
                }
                viewLoanListElement.loan &&
                    viewLoanListElement.loan.createdUserId &&
                    viewLoanListElement.loan.createdUserId
                    ? (createdUserData = await UsersRd.findOne({
                        id: viewLoanListElement.loan.createdUserId && viewLoanListElement.loan.createdUserId
                    }).select(["name", "usertype", "user_sub_type"]))
                    : (createdUserData = null);
                viewLoanListElement.loan_bank_mapping &&
                    viewLoanListElement.loan_bank_mapping.bank_emp_id &&
                    viewLoanListElement.loan_bank_mapping.bank_emp_id
                    ? (bankUserData = await UsersRd.findOne({
                        id:
                            viewLoanListElement.loan_bank_mapping.bank_emp_id &&
                            viewLoanListElement.loan_bank_mapping.bank_emp_id
                    }).select(["name", "usertype", "user_sub_type"]))
                    : (bankUserData = null);
                creditAssinedUserData = await UsersRd.findOne({id: viewLoanListElement.loan.sales_id}).select([
                    "id",
                    "name",
                    "usertype",
                    "user_sub_type"
                ]);
                viewLoanListElement.created_user = viewLoanListElement.assigned_institute_user = createdUserData;
                viewLoanListElement.bank_user = bankUserData;
                viewLoanListElement.assigned_credit_user = creditAssinedUserData || null;
                await LoanDocumentRd.find({
                    loan: viewLoanListElement.loan.id,
                    status: "active"
                })
                    .populate("doctype")
                    .limit(200)
                    .then((result) => {
                        const resArray = [];
                        if (result.length > 0) {
                            result.forEach((element) => {
                                if (element.doctype && element.doctype.id !== 0) {
                                    resArray.push(element);
                                }
                            });
                            viewLoanListElement.loan_document = resArray;
                        } else {
                            viewLoanListElement.loan_document = result;
                        }
                    });

                await LenderDocumentRd.find({
                    loan: viewLoanListElement.loan.id,
                    status: "active"
                })
                    .populate("doc_type")
                    .limit(200)
                    .then((result) => {
                        const resArray = [];
                        if (result.length > 0) {
                            result.forEach((element) => {
                                if (element.doc_type && element.doc_type.id !== 0) {
                                    resArray.push(element);
                                }
                            });
                            viewLoanListElement.lender_document = resArray;
                        } else {
                            viewLoanListElement.lender_document = result;
                        }
                    });
                const directorDetails = [];
                if (viewLoanListElement.business.id) {
                    directorDetailsData = await DirectorRd.find({
                        business: viewLoanListElement.business.id,
                        status: "active"
                    });
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
                }
                viewLoanListElement.sanctionData =
                    (await LoanSanctionRd.find({loan_id: viewLoanListElement.id}).select(["sanction_status", "san_date"])) || {};
                viewLoanListElement.disbursementData = viewLoanListElement.loan_bank_mapping && viewLoanListElement.loan_bank_mapping.lender_status == 16 && viewLoanListElement.sanctionData.length > 0 ?
                    (await LoanDisbursementRd.find({loan_sanction_id: viewLoanListElement.sanctionData[0].id}).sort("updated_at DESC").select("disbursement_date").limit(1)) : [];
                viewLoanListElement.director_details = directorDetails;
                let lender_status_record = {};
                if (viewLoanListElement.loan_bank_mapping) {
                    const bankEmpId =
                        viewLoanListElement.loan_bank_mapping.bank_emp_id ||
                        viewLoanListElement.loan_bank_mapping[0].bank_emp_id;
                    viewLoanListElement.bank_emp_data = await UsersRd.findOne({id: bankEmpId});
                    if (viewLoanListElement.loan_bank_mapping.lender_status) {
                        lender_status_record = await LoanStatusWithLenderRd.findOne({
                            id: viewLoanListElement.loan_bank_mapping.lender_status
                        }).then((res_data) => {
                            res_data && res_data
                                ? (viewLoanListElement.loan_bank_mapping.lender_status = res_data)
                                : (viewLoanListElement.loan_bank_mapping.lender_status = lender_status_record);
                        });
                    }
                    loan_status_comments = await LoanStatusCommentsRd.find({
                        loan_bank_id: viewLoanListElement.loan_bank_mapping.id
                    }).sort("id DESC");
                    if (loan_status_comments.length > 0) {
                        viewLoanListElement.loan_bank_mapping.loan_status_comments = loan_status_comments;
                    } else {
                        viewLoanListElement.loan_bank_mapping.loan_status_comments = [];
                    }
                    extended_user_id = viewLoanListElement.loan_bank_mapping.assigned_extended_ids;
                    if (extended_user_id) {
                        const userId_arrData = extended_user_id.split(",");
                        viewLoanListElement.assigned_extended_ids = await UsersRd.find({id: userId_arrData.map(Number)}).select("name");
                    } else {
                        viewLoanListElement.assigned_extended_ids = [];
                    }
                } else {
                    viewLoanListElement.assigned_extended_ids = [];
                    viewLoanListElement.bank_emp_data = {};
                    viewLoanListElement.loan_bank_mapping = lender_status_record;
                }
                const docCheck = await LoanDocumentRd.find({
                    loan: viewLoanListElement.loan.id,
                    doctype: sails.config.docUpload.uploadId,
                    status: sails.config.doc_type.status
                });
                docCheck.length > 0 ? (dbBankDocTypeCheck = "Uploaded") : (dbBankDocTypeCheck = "Pending");
                viewLoanListElement.dbDocCheck = dbBankDocTypeCheck;
                const docDownloadCheck = await LoanDocumentRd.find({
                    loan: viewLoanListElement.loan.id,
                    doctype: sails.config.docUpload.downloadId
                });
                docDownloadCheck.length > 0 ? (dbBankDownloadDoc = "Downloaded") : (dbBankDownloadDoc = "Pending");
                viewLoanListElement.dbDownloadCheck = dbBankDownloadDoc;
                // return loanDocument;
            })
        ).then(() => {
            let sorted = [];

            if (otherUsers) {
                sorted = view_loan_data.sort((a, b) => {
                    return b.assigned_at - a.assigned_at;
                });
            } else {
                sorted = view_loan_data;
            }
            return res.ok({
                status: "ok",
                loan_details: sorted,
                status_details: v_ncStatusManage
            });
        });
    },

    /**
     * @api {get} dashboard/loanlist?limit=3 Dashboard LoanList
     * @apiName Dashboard-loan listing
     * @apiGroup dashboard
     * @apiExample Example usage:
     * curl -i localhost:1337/dashboard/loanlist?limit=3
     * curl -i localhost:1337/dashboard/loanlist?search=JZRI00008226
     * @apiDescription
     * pagination skip and limit params
     * Need to pass limit to get the limited number of loans
     * Loan listing view based requested date descending order
     * search parameter :search the loan listing based on Loan ref id and user name
     *
     * @apiSuccess {object} loan_details .
     * @apiSuccess {object[]} status_details
     */
    getloanlist: async function (req, res, next) {
        let otherUsers = false;
        if (sails.config.otherUsersTypes.find((element) => element == req.user.usertype)) {
            otherUsers = true;
        }
        const myDBStore = sails.getDatastore("mysql_namastecredit_read");
        let forRes;
        const data = [],
            other_users_data = [],
            loanLists = [],
            regionList = [],
            userids = [],
            loanIds = [],
            business_id = [];
        let whereCondition = {};
        const page_count = req.param("skip") ? req.param("skip") : 0,
            limit_count = req.param("limit") ? req.param("limit") : 10,
            search = req.param("search"),
            userType = req.user.usertype,
            userSubType = req.user.user_sub_type,
            user_whitelabel = req.user.loggedInWhiteLabelID,
            ncStatusManage = await NcStatusManageRd.find({
                white_label_id: user_whitelabel
            }),
            whiteLabelData = await WhiteLabelSolutionRd.findOne({
                select: ["assignment_type"],
                where: {
                    id: user_whitelabel
                }
            }),
            arrData =
                whiteLabelData && whiteLabelData.assignment_type && whiteLabelData.assignment_type.user.assignment;
        arrData &&
            arrData.forEach((Element) => {
                forRes = Element.hasOwnProperty(req.user.usertype) && Element[userType] === req.user.user_sub_type;
            });
        const users = await UsersRd.find({
            // Get the list of things this user can see
            select: ["id"],
            where: {
                or: [
                    {
                        parent_id: req.user["id"]
                    },
                    {
                        id: req.user["id"]
                    }
                ]
            }
        });
        _.each(users, (value) => {
            userids.push(value.id);
        });
        if (req.user.usertype === "Bank" || req.user.usertype === "Analyzer" || otherUsers) {
            if (req.user.usertype === "Bank") {
                viewloanCondition = {
                    white_label_id: user_whitelabel
                };
                if (req.user.is_lender_admin == 1) {
                    const regionIds = await LenderRegionMappingRd.find({
                        select: ["region_id"],
                        where: {
                            user_id: req.user.id
                        }
                    });
                    //Admin user should have region wise loan listing
                    _.each(regionIds, (value) => {
                        regionList.push(value.region_id);
                    });

                    viewloanCondition.or = [{region_id: regionList}, {users: userids}];
                } else {
                    if (forRes) {
                        viewloanCondition.or = [{createdUserId: req.user.id},
                        {sales_id: req.user.id},
                        {bank_emp_id: req.user.id},
                        {assigned_extended_ids: {contains: req.user.id}}];
                    } else {
                        viewloanCondition.or = [{createdUserId: req.user.id},
                        {bank_emp_id: req.user.id},
                        {assigned_extended_ids: {contains: req.user.id}}];
                    }
                }
                const viewLoanList = await ViewloanRd.find(viewloanCondition);
                _.each(viewLoanList, (value) => {
                    loanLists.push(value.id);
                });
                whereCondition = {id: loanLists};
            } else if (req.user.usertype === "Analyzer") {
                whereCondition = {
                    or: [{createdUserId: req.user.id}, {sales_id: req.user.id}]
                };
            } else if (otherUsers) {
                // Modify function to return the data for other users. The primary table for other users is task_user_mapping
                const taskUserData = await TaskUserMappingRd.find({
                    assign_userid: req.user.id
                });

                if (taskUserData) {
                    taskUserData.forEach((element) => {
                        data.push(element.loan_id);
                    });
                }
                whereCondition = {
                    id: data
                };
            }
            if (search) {
                const business = await BusinessRd.find({
                    white_label_id: req.user.loggedInWhiteLabelID,
                    or: [
                        {
                            businessname: {contains: search}
                        },
                        {
                            business_email: {contains: search}
                        }
                    ]
                });
                if (business) {
                    _.each(business, async (value) => {
                        business_id.push(value.id);
                    });

                }
                whereCondition = {white_label_id: req.user.loggedInWhiteLabelID, or: [{loan_ref_id: {contains: search}}, {business_id: business_id}]};
            }
            const loans = await LoanrequestRd.find(whereCondition)
                .populate("business_id")
                .populate("loan_asset_type")
                .populate("loan_usage_type")
                .sort("RequestDate DESC")
                .paginate({page: page_count, limit: limit_count});

            if (loans.length > 0) {
                Promise.all(
                    loans.map(async (loan) => {
                        loan.loan_product = await LoanProductsRd.findOne({id: loan.loan_product_id}).select([
                            "product"
                        ]);
                        if (otherUsers) {
                            const findTaskUpdate = await TaskUserMappingRd.find({
                                loan_id: loan.id,
                                assign_userid: req.user.id
                            });
                            if (findTaskUpdate) {
                                otherUsersStatusData = [];
                                otherUsersStatusData.push(
                                    {order: 1, key: "assigned", label: "Assigned", status: true},
                                    {
                                        order: 2,
                                        key: "completed",
                                        label: "Evaluation Completed",
                                        status: findTaskUpdate[0].status === "close" ? true : false
                                    }
                                );
                                other_users_data.push(otherUsersStatusData);
                                loan["other_user_status"] = otherUsersStatusData;
                            }
                        }
                        await LoanBankMappingRd.find({
                            loan_id: loan.id
                            // bank_id: req.user.lender_id,
                            // bank_emp_id: req.user.id //there needs to be a change. To Do
                        })
                            .sort("updated_at DESC")
                            .then((result) => {
                                if (result) {
                                    loan.loan_bank_mapping = result;
                                } else {
                                    loan.loan_bank_mapping = null;
                                }
                            });
                        // return loanBankMappingDetails;
                    })
                ).then(() => {
                    return res.ok({
                        status: "ok",
                        loan_details: loans,
                        status_details: ncStatusManage
                    });
                });
            } else {
                return res.ok({
                    status: "ok",
                    loan_details: [],
                    status_details: ncStatusManage
                });
            }
        } else {
            // White label limiting to first one
            if (search && typeof search !== "undefined") {
                const searchConditionQry =
                    "SELECT l_req.loanid FROM loanrequest  l_req inner join business b on b.businessid=l_req.business_id inner join users u on u.userid=b.userid where (u.parent_id=" +
                    req.user["id"] +
                    " or u.userid= " +
                    req.user["id"] +
                    ") AND  (l_req.loan_ref_id like '%" +
                    search +
                    "%' OR u.name like '%" +
                    search +
                    "%' OR b.businessname like '%" +
                    search +
                    "%')";
                searchQryResult = await myDBStore.sendNativeQuery(searchConditionQry);
                if (searchQryResult) {
                    searchQryResultRows = searchQryResult.rows;
                    _.each(searchQryResultRows, (value) => {
                        loanIds.push(value.loanid);
                    });
                }
            } else {
                // Get the list of things this user can see.
                const getLoanIdBasedUserIdQry = `SELECT loanid FROM loanrequest l_req inner join business b on b.businessid=l_req.business_id inner join users u on u.userid=b.userid where u.userid in (select userid from users where userid = ${req.user.id} or parent_id = ${req.user.id}) and l_req.loan_status_id <>14 and l_req.loan_sub_status_id <>14`;
                loanSearchQryResult = await myDBStore.sendNativeQuery(getLoanIdBasedUserIdQry);
                if (loanSearchQryResult) {
                    getLoanQryResultRows = loanSearchQryResult.rows;
                    _.each(getLoanQryResultRows, (value) => {
                        loanIds.push(value.loanid);
                    });
                }
            }
            const whereCondition = {id: loanIds, white_label_id: user_whitelabel};
            (viewLoanList = await LoanrequestRd.find(whereCondition)
                .populate("loan_usage_type")
                .populate("loan_asset_type")
                .paginate({page: page_count, limit: limit_count})
                .sort("RequestDate DESC")),
                (logService = await sails.helpers.logtrackservice(
                    req,
                    "dashboard/loanlist",
                    req.user.id,
                    "loanrequest"
                ));
            Promise.all(
                viewLoanList.map(async (viewLoanListElement) => {
                    if (
                        (viewLoanListElement.loan_status_id === 1 && viewLoanListElement.loan_sub_status_id === 1) ||
                        (viewLoanListElement.loan_status_id === 14 && viewLoanListElement.loan_sub_status_id === 14)
                    ) {
                        delete viewLoanListElement;
                    }
                    //business details
                    const businessDetails = BusinessRd.findOne({
                        id: viewLoanListElement.business_id
                    })
                        .populate("businesstype")
                        .populate("businessindustry")
                        .populate("userid")
                        .then((result) => {
                            if (result) {
                                viewLoanListElement.business_id = result;
                            } else {
                                viewLoanListElement.business_id = null;
                            }
                        });
                    //loan product details

                    if (viewLoanListElement.loan_product_id) {
                        const ChannelPayoutDetails = ChannelPayoutRd.findOne({
                            loan_product_id: viewLoanListElement.loan_product_id,
                            white_label_id: user_whitelabel
                        }).then((result) => {
                            if (result) {
                                viewLoanListElement.channel_payout_details = result;
                            } else {
                                viewLoanListElement.channel_payout_details = null;
                            }
                        });
                        viewLoanListElement.loan_product = await LoanProductsRd.findOne({
                            id: viewLoanListElement.loan_product_id
                        }).select(["product"]);
                    }
                    const loanBankMappingDetails = LoanBankMappingRd.find({
                        loan_id: viewLoanListElement.id
                    })
                        .populate("bank_id")
                        .sort("updated_at DESC")
                        .then((result) => {
                            if (result) {
                                viewLoanListElement.loan_bank_mapping = result;
                            } else {
                                viewLoanListElement.loan_bank_mapping = null;
                            }
                        });
                    return loanBankMappingDetails;
                })
            ).then(() => {
                return res.ok({
                    status: "ok",
                    loan_details: viewLoanList,
                    status_details: ncStatusManage
                });
            });
        }
    },
    /**
     * @api {get} Biz_loanlist Biz LoanList
     * @apiName Biz LoanList
     * @apiGroup Loans
     * @apiExample Example usage:
     * curl -i localhost:1337/Biz_loanlist
     * @apiParam {Number} limit records to limit
     * @apiParam {Number} page page number
     *
     * @apiSuccess {string} status
     * @apiSuccess {string} message list of loans
     * @apiSuccess {object[]} loans loans list
     */
    Biz_loanlist: async function (req, res, next) {
        const page_count = req.param("page") ? req.param("page") : 0,
            limit_count = req.param("limit") ? req.param("limit") : 10,
            userid = [],
            bId = [],
            users = await UsersRd.find({
                select: ["id"],
                where: {
                    or: [
                        {
                            parent_id: req.user["id"]
                        },
                        {
                            id: req.user["id"]
                        }
                    ]
                }
            });
        _.each(users, (value) => {
            userid.push(value.id);
        });
        const businessData = await BusinessRd.find({userid: userid});
        _.each(businessData, (value) => {
            bId.push(value.id);
        });
        const loandetails = await LoanrequestRd.find({
            or: [{createdUserId: userid}, {business_id: bId}]
        })
            .populate("sales_id")
            .populate("loan_usage_type")
            .populate("loan_asset_type")
            .populate("business_id")
            .sort("id DESC")
            .paginate({page: page_count, limit: limit_count});
        if (loandetails) {
            await Promise.all(
                loandetails.map(async (viewLoanListElement) => {
                    const loantype = viewLoanListElement.loan_type_id.split(","),
                        //get loan type
                        loanTypeDetails = await LoantypeRd.find({
                            id: loantype
                        }).then((result) => {
                            if (result) {
                                viewLoanListElement.loan_type = result;
                            }
                        });
                    //get business industry
                    let businessIndustry;
                    if (viewLoanListElement.business_id) {
                        businessIndustry = await BusinessIndustryRd.find({
                            id: viewLoanListElement.business_id.businessindustry
                        }).catch((err) => { });
                    } else {
                        businessIndustry = [];
                    }
                    viewLoanListElement.bussiness_industry = businessIndustry;
                    //get business address
                    let businessadd;
                    if (viewLoanListElement.business_id) {
                        businessadd = await BusinessaddressRd.find({
                            bid: viewLoanListElement.business_id.id
                        });
                    } else {
                        businessadd = [];
                    }
                    viewLoanListElement.bussiness_address = businessadd;
                    //get director details
                    let directorDetails;
                    if (viewLoanListElement.business_id) {
                        directorDetails = await DirectorRd.find({
                            business: viewLoanListElement.business_id.id
                        });
                    } else {
                        directorDetails = [];
                    }

                    viewLoanListElement.director_details = directorDetails;
                    //loan documents and doctype
                    const loanDocs = await LoanDocumentRd.find({
                        loan: viewLoanListElement.id
                    }).populate("doctype");
                    if (loanDocs) {
                        viewLoanListElement.loan_documents = loanDocs;
                    } else {
                        viewLoanListElement.loan_documents = null;
                    }
                    //loan process details
                    const loanProcess = await LoanProcessRd.findOne({
                        loan: viewLoanListElement.id
                    });
                    if (loanProcess) {
                        viewLoanListElement.loan_process = loanProcess;
                    } else {
                        viewLoanListElement.loan_process = null;
                    }
                    const nc_status = {
                        white_label_id: viewLoanListElement.white_label_id
                    };
                    if (viewLoanListElement.loan_status_id) {
                        nc_status.status1 = viewLoanListElement.loan_status_id;
                    }
                    if (viewLoanListElement.loan_sub_status_id) {
                        nc_status.status2 = viewLoanListElement.loan_sub_status_id;
                    }
                    if (viewLoanListElement.loan_status_id === 8 && viewLoanListElement.loan_sub_status_id === 12) {
                        nc_status.uw_doc_status = viewLoanListElement.remarks_val;
                    }
                    if (viewLoanListElement.loan_status_id === 2 && viewLoanListElement.loan_sub_status_id === 9) {
                        const loanbankmap = await LoanBankMappingRd.find({
                            loan_id: viewLoanListElement.id
                        });

                        await Promise.all(
                            await loanbankmap.map(async (loanbankmapElement) => {
                                const whrcondition = {
                                    white_label_id: viewLoanListElement.white_label_id,
                                    status1: nc_status.status1,
                                    status2: nc_status.status2
                                };
                                if (loanbankmapElement.loan_bank_status) {
                                    nc_status.status3 = loanbankmapElement.loan_bank_status;
                                    whrcondition.status3 = loanbankmapElement.loan_bank_status;
                                }
                                if (loanbankmapElement.loan_borrower_status) {
                                    nc_status.status4 = loanbankmapElement.loan_borrower_status;
                                    whrcondition.status4 = loanbankmapElement.loan_borrower_status;
                                }
                                if (loanbankmapElement.meeting_flag === 1) {
                                    nc_status.status5 = 1;
                                    nc_status.status6 = 1;
                                    whrcondition.status5 = 1;
                                    whrcondition.status6 = 1;
                                }
                                if (loanbankmapElement.meeting_flag === 2) {
                                    nc_status.status5 = 1;
                                    nc_status.status6 = 2;
                                    whrcondition.status5 = 1;
                                    whrcondition.status6 = 2;
                                }
                                if (loanbankmapElement.meeting_flag == 0) {
                                    whrcondition.status5 = null;
                                    whrcondition.status6 = null;
                                }

                                if (viewLoanListElement.white_label_id == 1) {
                                    var ncstatusresult = await NcStatusManageRd.findOne(whrcondition).select(["name"]);
                                    loanbankmapElement.bankmapstatus = ncstatusresult ? ncstatusresult : null;
                                    return ncstatusresult;
                                } else {
                                    var ncstatusresult = null;
                                    loanbankmapElement.bankmapstatus = ncstatusresult;
                                    return ncstatusresult;
                                }
                            })
                        ).then(() => {
                            viewLoanListElement.loanBankMapping = loanbankmap;
                        });
                        const loanBankStatusRes = await NcStatusManageRd.find(nc_status).select(["name"]);
                        viewLoanListElement.newLoan_status = loanBankStatusRes;
                        viewLoanListElement.loan_status = null;
                        return loanbankmap;
                    } else {
                        const ncstatusresultArr = await NcStatusManageRd.find(nc_status).select(["name"]),
                            ncstatusresultObj = await NcStatusManageRd.findOne(nc_status).select(["name"]);
                        viewLoanListElement.loan_status = ncstatusresultObj;
                        viewLoanListElement.newLoan_status = ncstatusresultArr;
                    }
                })
            ).then(() => {
                return res.ok({
                    status: "ok",
                    message: sails.config.msgConstants.detailsListed,
                    loans: loandetails
                });
            });
        } else {
            return res.ok({
                status: "ok",
                message: sails.config.msgConstants.recordNotFound
            });
        }
    },
    /**
     * @api {POST} /loan_update/ loan_update
     * @apiName loan_update
     * @apiGroup Loans
     * @apiExample Example usage:
     * curl -i http://localhost:1337/loan_update
     *
     *
     * @apiParam {Number} loanid loanid(mandatory)
     * @apiParam {Number} business_id businessid(mandatory)
     * @apiParam {Number} business_address_id businessAddresID(if address edited mandatory)
     * @apiParam {Number} director_id director id(if director details edited)
     * @apiParam {Number} emi_obligation EMI Obligations
     * @apiParam {Number} turnover turnover
     * @apiParam {String} business_pan businesspancard
     * @apiParam {Date} business_start_date business_start_date(10-05-2019)
     * @apiParam {Number} business_economic_sector_id business_economic_sector_id(industry type)
     * @apiParam {Number} loan_amt loan amount
     * @apiParam {String} business_name business name
     * @apiParam {String} first_name first name
     * @apiParam {String} last_name last name
     * @apiParam {Number} gstin gstin
     * @apiParam {Number} pincode pincode
     * @apiParam {Number} city city
     * @apiParam {Number} state state
     * @apiParam {Number} address address
     * @apiParam {Number} entity entity
     * @apiParam {Number} locality locality
     * @apiParam {Number} no_reject_loan no of rejected loan
     * @apiParam {Number} no_unsecured_loan no of unsecured loan
     * @apiParam {Number} no_emi_bounce no of emi bounce
     * @apiParam {Number} permission_to_check_GST radio button(0(unchecked),1(checked))
     * @apiParam {Number} permission_to_check_CIBIL radio button(0(unchecked),1(checked))
     * @apiParam {String} demail director email
     * @apiParam {String} dfirstname director firstname
     * @apiParam {String} dlastname director lastname
     * @apiParam {Number} dcontact director contact
     * @apiParam {String} ddob director DOB
     * @apiParam {String} residential_type resident type('owned', 'rented')
     * @apiParam {String} office_type office type('owned', 'rented')
     * @apiParam {String} loan_amount_um loan amount Um(Lakhs,Crores)
     * @apiParam {String} dcibil_remarks cibil remarks
     * @apiParam {Number} annual_op_expense
     *
     * @apiSuccess {String} status ok
     * @apiSuccess {String} message loans update
     * @apiSuccess {Object} loandata loanrequestobject
     * @apiSuccess {Object} businessdata businessobject
     */
    loan_update: async function (req, res, next) {
        const loanId = req.param("loanid"),
            businessId = req.param("business_id"),
            businessAddId = req.param("business_address_id"),
            directorId = req.param("director_id"),
            demail = req.param("demail"),
            dfirstname = req.param("dfirstname"),
            dlastname = req.param("dlastname"),
            dcontact = req.param("dcontact"),
            ddob = req.param("ddob"),
            emi = req.param("emi_obligation"),
            turnover = req.param("turnover"),
            pancard = req.param("business_pan"),
            business_date = req.param("business_start_date"),
            business_industry_id = req.param("business_economic_sector_id"),
            loan_amount = req.param("loan_amt"),
            businessName = req.param("business_name"),
            firstName = req.param("first_name"),
            lastName = req.param("last_name"),
            gstin = req.param("gstin"),
            pincode = req.param("pincode"),
            city = req.param("city"),
            state = req.param("state"),
            address = req.param("address"),
            entity = req.param("entity"),
            locality = req.param("locality"),
            residentialType = req.param("residential_type"),
            officeType = req.param("office_type"),
            rejectLoan = req.param("no_reject_loan"),
            usecuredLoan = req.param("no_unsecured_loan"),
            emibounce = req.param("no_emi_bounce"),
            permissionGst = req.param("permission_to_check_GST"),
            permissionCibil = req.param("permission_to_check_CIBIL"),
            loanAmtUm = req.param("loan_amount_um"),
            dcibil_remarks = req.param("dcibil_remarks"),
            annual_op_expense = req.param("annual_op_expense"),
            datetime = await sails.helpers.dateTime(),
            loanreqobj = {};
        if (emi) {
            loanreqobj.cur_monthly_emi = emi;
        }
        if (turnover) {
            loanreqobj.annual_revenue = turnover;
        }
        if (loan_amount) {
            loanreqobj.loan_amount = loan_amount;
        }
        if (loanAmtUm) {
            loanreqobj.loan_amount_um = loanAmtUm;
        }
        if (annual_op_expense) {
            loanreqobj.annual_op_expense = annual_op_expense;
        }
        const businessobj = {};
        if (pancard) {
            businessobj.businesspancardnumber = pancard;
        }
        if (business_date) {
            businessobj.businessstartdate = business_date;
        }
        if (business_industry_id) {
            businessobj.businessindustry = business_industry_id;
        }
        if (businessName) {
            businessobj.businessname = businessName;
        }
        if (firstName) {
            businessobj.first_name = firstName;
        }
        if (lastName) {
            businessobj.last_name = lastName;
        }
        if (gstin) {
            businessobj.gstin = gstin;
        }
        if (entity) {
            businessobj.businesstype = entity;
        }
        const businessaddresobj = {};
        if (pincode) {
            businessaddresobj.pincode = pincode;
        }
        if (city) {
            businessaddresobj.city = city;
        }
        if (state) {
            businessaddresobj.state = state;
        }
        if (locality) {
            businessaddresobj.locality = locality;
        }
        if (address) {
            businessaddresobj.line1 = address;
        }
        if (residentialType) {
            businessaddresobj.residential_type = residentialType;
        }
        if (officeType) {
            businessaddresobj.address_status = officeType;
        }
        const loanprocessobj = {};
        if (rejectLoan) {
            loanprocessobj.loanReject_count = rejectLoan;
        }
        if (usecuredLoan) {
            loanprocessobj.unsecuredLoan_count = usecuredLoan;
        }
        if (emibounce) {
            loanprocessobj.emiBounce_count = emibounce;
        }
        if (permissionGst) {
            loanprocessobj.GST_check = permissionGst;
        }
        if (permissionCibil) {
            loanprocessobj.CIBIL_check = permissionCibil;
        }
        const directorobj = {};
        if (demail) {
            directorobj.demail = demail;
        }
        if (dfirstname) {
            directorobj.dfirstname = dfirstname;
        }
        if (dlastname) {
            directorobj.dlastname = dlastname;
        }
        if (dcontact) {
            directorobj.dcontact = dcontact;
        }
        if (ddob) {
            directorobj.ddob = ddob;
        }
        if (dcibil_remarks) {
            directorobj.cibil_remarks = dcibil_remarks;
        }
        let loanrequpdate, businessupdate, businessaddressupdate, loanprocessupdate, directorupdate;
        if (Object.entries(loanreqobj).length !== 0) {
            if (loanId) {
                loanrequpdate = await Loanrequest.updateOne({
                    id: loanId
                }).set(loanreqobj);
            } else {
                res.ok({
                    status: "nok",
                    message: sails.config.msgConstants.parameterMissing
                });
            }
        }

        if (Object.entries(businessobj).length !== 0) {
            if (businessId) {
                businessupdate = await Business.updateOne({
                    id: businessId
                }).set(businessobj);
            } else {
                res.ok({
                    status: "nok",
                    message: sails.config.msgConstants.parameterMissing
                });
            }
        }

        if (Object.entries(businessaddresobj).length !== 0) {
            if (businessAddId) {
                businessaddressupdate = await Businessaddress.updateOne({
                    id: businessAddId
                }).set(businessaddresobj);
            } else {
                res.ok({
                    status: "nok",
                    message: sails.config.msgConstants.parameterMissing
                });
            }
        }

        if (Object.entries(loanprocessobj).length !== 0) {
            if (loanId) {
                loanIdExist = await LoanProcessRd.findOne({loan: loanId});
                if (loanIdExist) {
                    loanprocessupdate = await LoanProcess.updateOne({
                        loan: loanId
                    }).set(loanprocessobj);
                } else {
                    if (loanId) {
                        loanprocessobj.loan = loanId;
                    }
                    if (req.user["id"]) {
                        loanprocessobj.user_id = req.user["id"];
                    }
                    if (businessId) {
                        loanprocessobj.bid = businessId;
                    }
                    if (datetime) {
                        loanprocessobj.created_on = datetime;
                    }
                    if (loanId && businessId) {
                        loanprocessupdate = await LoanProcess.create(loanprocessobj).fetch();
                    } else {
                        res.ok({
                            status: "nok",
                            message: sails.config.msgConstants.parameterMissing
                        });
                    }
                }
            } else {
                res.ok({
                    status: "nok",
                    message: sails.config.msgConstants.parameterMissing
                });
            }
        }
        if (Object.entries(directorobj).length !== 0) {
            if (directorId) {
                directorIdExist = await DirectorRd.findOne({id: directorId});
                if (directorIdExist) {
                    directorupdate = await Director.updateOne({
                        id: directorId
                    }).set(directorobj);
                }
            } else {
                if (businessId) {
                    directorobj.business = businessId;
                    directorupdate = await Director.create(directorobj).fetch();
                } else {
                    res.ok({
                        status: "nok",
                        message: sails.config.msgConstants.parameterMissing
                    });
                }
            }
        }

        if (loanrequpdate || businessupdate || businessaddressupdate || directorupdate) {
            res.ok({
                status: "ok",
                message: sails.config.msgConstants.successfulUpdation,
                loandata: loanrequpdate,
                businessdata: businessupdate,
                businessaddress: businessaddressupdate,
                loanprocess: loanprocessupdate,
                director: directorupdate
            });
        } else {
            res.ok({
                status: "nok",
                message: sails.config.msgConstants.updateFailed
            });
        }
        await sails.helpers.greenChannelCondition(loanId, req.user.loggedInWhiteLabelID)
    },
    /**
     * @api {post} creditManagerList creditManagerList
     * @apiName creditManagerList
     * @apiGroup Loans
     * @apiExample Example usage:
     * curl -i localhost:1337/creditManagerList
     * @apiParam {Number} loanId loan id
     *
     * @apiSuccess {string} status
     * @apiSuccess {string} message list of loans
     * @apiSuccess {object[]} data
     */
    getCreditManagerList: async (req, res) => {
        const userid = req.user["id"],
            loanId = req.param("loanId"),
            comments = req.param("comments"),
            comment_ref_id = req.param("comment_ref_id"),
            notifyUserId = req.param("notify_user_id");
        let userArr = [];
        const users_whitelabel = req.user.loggedInWhiteLabelID,
            whiteLabelData = await WhiteLabelSolutionRd.findOne({
                select: ["assignment_type"],
                where: {
                    id: users_whitelabel
                }
            }),
            arrData = whiteLabelData.assignment_type.loans.assignment[0];
        if (loanId) {
            const loanData = await LoanrequestRd.findOne({
                id: loanId
            });
            let notifyUserName = "";
            if (notifyUserId) {
                notifyUserNameData = await UsersRd.findOne({id: notifyUserId});
                notifyUserName = notifyUserNameData.name;
            }

            if (comments && loanData) {
                loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId});
                if (loanBankMappingData.length > 0) {
                    const loanComments = await LoanStatusComments.create({
                        loan_bank_id: loanBankMappingData[0].id,
                        user_id: userid,
                        user_type: req.user.usertype,
                        comment_text: comments,
                        lender_status_id: 0,
                        created_time: await sails.helpers.dateTime(),
                        created_timestamp: await sails.helpers.dateTime(),
                        status: 1,
                        assignee_id: notifyUserId,
                        comment_ref_id
                    }).fetch();
                } else {
                    let remarks = {},
                        datetime = await sails.helpers.dateTime();
                    history = {
                        userId: req.user.id,
                        assignedBy: req.user.name, //after disbursement release this key will be removed
                        type: "Comments",
                        message: comments,
                        assigneeId: notifyUserId,
                        assignedTo: notifyUserName,
                        assigned_by: req.user.name
                    };

                    // find remarks
                    const previousComments = await Loanrequest.findOne({id: loanId});
                    datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
                    if (previousComments.remarks) {
                        remarks = JSON.parse(previousComments.remarks);
                        remarks = {[datetime]: history, ...remarks};
                    } else {
                        remarks[datetime] = history;
                    }
                    updateComments = await Loanrequest.update({id: loanId})
                        .set({remarks: JSON.stringify(remarks)})
                        .fetch();
                }
            }
            cityManagerList = await UsersRd.find({
                select: ["name"],
                where: {
                    city: req.user["city"],
                    is_lender_manager: 0,
                    usertype: Object.keys(arrData)[0],
                    user_sub_type: Object.values(arrData)[0],
                    white_label_id: users_whitelabel,
                    status: "active"
                }
            });
            stateManagerList = await UsersRd.find({
                select: ["name"],
                where: {
                    state: req.user["state"],
                    is_lender_manager: 1,
                    usertype: Object.keys(arrData)[0],
                    user_sub_type: Object.values(arrData)[0],
                    white_label_id: users_whitelabel,
                    status: "active"
                }
            });
            userArr = [...cityManagerList, ...stateManagerList];
            return res.ok({
                status: "ok",
                message: sails.config.msgConstants.detailsListed,
                data: userArr
            });
        } else {
            return res.send({
                status: "nok",
                message: sails.config.msgConstants.parameterMissing
            });
        }
    },
    /**
     * @api {post} updateCreditManager updateCreditManager
     * @apiName updateCreditManager
     * @apiGroup Loans
     * @apiExample Example usage:
     * curl -i localhost:1337/updateCreditManager
     * @apiParam {Number} loanId loan id
     * @apiParam {Number} manager_userid manager id
     * @apiParam {Array} emails eg:["test@gmail.com","abc@yahoo.com"]
     *
     * @apiSuccess {string} status
     * @apiSuccess {string} message Manager updated
     * @apiSuccess {object} data
     */
    updateCreditManager: async (req, res) => {
        const loanId = req.param("loanId"),
            userid = req.param("manager_userid"),
            emailList = req.param("emails"),
            comments = req.param("comments"),
            assignto = req.param("assignto");
        if (loanId) {
            const loanExist = await LoanrequestRd.find({
                id: loanId
            });
            if (loanExist.length > 0) {
                if (assignto == "cm") {
                    const loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId});
                    if (loanBankMappingData.length == 0) {
                        return res.send({
                            status: "nok",
                            message: sails.config.msgConstants.loanDoesNotExist
                        });
                    }
                    updateLoanBankData = await LoanBankMapping.update({id: loanBankMappingData[0].id}).set({
                        bank_emp_id: userid,
                        notification_status: "yes"
                    });
                } else {
                    data = {
                        default_emails: {email: emailList}
                    };
                    if (comments) {
                        remarks = {};
                        let datetime = await sails.helpers.dateTime();
                        datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
                        history = {
                            userId: req.user.id,
                            type: "Comments",
                            message: comments
                        };

                        remarks[datetime] = history;
                        data.remarks = JSON.stringify(remarks);
                    }
                    if (userid) {
                        data.sales_id = userid;
                    }
                    const updateLoan = await Loanrequest.update({
                        where: {id: loanId}
                    })
                        .set(data)
                        .fetch();
                }
                (user_id = userid ? userid : loanExist[0].createdUserId),
                    (managerUser = await UsersRd.findOne({
                        id: user_id
                    }));
                return res.ok({
                    status: "ok",
                    message: sails.config.msgConstants.successfulUpdation,
                    data: managerUser
                });
            } else {
                return res.send({
                    status: "nok",
                    message: sails.config.msgConstants.loanDoesNotExist
                });
            }
        } else {
            return res.send({
                status: "nok",
                message: sails.config.msgConstants.parameterMissing
            });
        }
    },
    /**
     * @api {post} loanReassignToNc loanReassignToNc
     * @apiName loanReassignToNc
     * @apiGroup Loans
     * @apiExample Example usage:
     * curl -i localhost:1337/loanReassignToNc
     * @apiParam {Number} loanId loan id
     * @apiParam {Number} loanBankId loan Bank id
     * @apiParam {String} comments reassign comments
     *
     * @apiSuccess {string} status
     * @apiSuccess {string} message loan updatedwhite_label_id
     * @apiSuccess {object} data
     */
    reassignToNc: async (req, res) => {
        const loanId = req.param("loanId"),
            loanBankId = req.param("loanBankId"),
            comments = req.param("comments"),
            curDate = new Date();
        let oldObj;
        const formatedDate = moment(curDate).format("YYYY-MM-DD HH:mm:ss"),
            history = {};
        if (loanId && loanBankId) {
            const loanData = await LoanrequestRd.findOne({id: loanId});
            await LoanBankMappingRd.findOne({
                where: {id: loanBankId}
            }).then(async (loanBankMap) => {
                ncStatusData = await NcStatusManageRd.find({
                    white_label_id: loanData.white_label_id,
                    status1: loanData.loan_status_id,
                    status2: loanData.loan_sub_status_id,
                    status3: loanBankMap.loan_bank_status,
                    status4: loanBankMap.loan_borrower_status
                }).select("name");
                report_tat = await sails.helpers.reportTat(
                    req.user.id,
                    req.user.name,
                    loanId,
                    "Reassign to NC",
                    ncStatusData[0].name,
                    comments
                );
                await Loanrequest.updateOne({
                    id: loanId
                }).set({
                    loan_status_id: 2,
                    loan_sub_status_id: 9
                });
                if (loanBankMap.reassign_nc_comments) {
                    const previous_history = loanBankMap.reassign_nc_comments;
                    oldObj = JSON.parse(previous_history);
                }
                reassign_nc_comments = {
                    loan_bank_status: loanBankMap.loan_bank_status,
                    loan_borrower_status: loanBankMap.loan_borrower_status,
                    reassigned_user: req.user.id,
                    comments: comments
                };
                history[formatedDate] = reassign_nc_comments;
                const finalObj = {...history, ...(oldObj && {...oldObj})},
                    update_loanbank = await LoanBankMapping.updateOne({
                        id: loanBankId
                    }).set({
                        loan_bank_status: 10,
                        loan_borrower_status: 4,
                        meeting_flag: 0,
                        reassign_nc_comments: JSON.stringify(finalObj)
                    });
                if (update_loanbank) {
                    return res.ok({
                        status: "ok",
                        message: sails.config.msgConstants.successfulUpdation,
                        data: update_loanbank
                    });
                } else {
                    return res.send({
                        status: "nok",
                        message: sails.config.msgConstants.invalidCaseId
                    });
                }
            });
        } else {
            return res.send({
                status: "nok",
                message: sails.config.msgConstants.parameterMissing
            });
        }
    },
    /**
     * @api {get} loanStatusCounts loanStatusCounts
     * @apiName loanStatusCounts
     * @apiGroup Loans
     * @apiExample Example usage:
     * curl -i localhost:1337/loanStatusCounts
     * @apiSuccess {string} status
     * @apiSuccess {string} message loan counts
     * @apiSuccess {object[]} data
     */
    getLoanStatusCounts: async (req, res) => {
        const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
            users_whitelabel = req.user.loggedInWhiteLabelID;
        let sqlPart;
        const users = await UsersRd.find({
            select: ["id"],
            where: {
                or: [
                    {
                        parent_id: req.user["id"]
                    },
                    {
                        id: req.user["id"]
                    }
                ]
            }
        }),
            userid = [];
        _.each(users, (value) => {
            userid.push(value.id);
        });
        const whiteLabelData = await WhiteLabelSolutionRd.findOne({
            select: ["assignment_type"],
            where: {
                id: users_whitelabel
            }
        }),
            arrData = whiteLabelData.assignment_type.loans.assignment,
            userType = req.user.usertype,
            userSubType = req.user.user_sub_type;
        arrData &&
            arrData.forEach((Element) => {
                forRes = Element.hasOwnProperty(req.user.usertype) && Element[userType] === req.user.user_sub_type;
            });
        const ncStatusCondition = {white_label_id: users_whitelabel};
        if (req.user.usertype == "Bank") {
            forRes
                ? (sqlPart = `and bank_id = ${req.user.lender_id} OR createdUserId in (${req.user.id}) OR sales_id in (${req.user.id}) OR bank_emp_id in (${req.user.id}) OR userid in (${userid})`)
                : (sqlPart = `and bank_id = ${req.user.lender_id} OR createdUserId in (${req.user.id}) OR bank_emp_id in (${req.user.id}) OR userid in (${userid})`);
        } else if (req.user.usertype == "Analyzer") {
            sqlPart = `and createdUserId in (${userid}) OR sales_id in (${req.user.id})`;
        } else {
            sqlPart = ` and userid in (${userid})`;
        }
        // if (req.user.is_lender_manager === 1) {
        // 	await UsersRd.find({ city: req.user.city, white_label_id: users_whitelabel[0] })
        // 		.select('id')
        // 		.then((res) => {
        // 			if (res.length > 0) {
        // 				_.each(res, function (values) {
        // 					if (userid.indexOf(values.id) === -1) {
        // 						userid.push(values.id);
        // 					}
        // 				});
        // 			}
        // 		});
        // }
        const countQuery = `select loan_status,count(distinct loanId) as count  from ui_ux_viewloan where  white_label_id=${users_whitelabel} ${sqlPart}  group by 1;`;
        nativeResult = await myDBStore.sendNativeQuery(countQuery);
        const Result = nativeResult.rows;
        if (Result.length > 0) {
            if (Result[0].status === null) {
                Result.shift();
            }
            return res.ok({
                status: "ok",
                message: sails.config.msgConstants.detailsListed,
                data: Result
            });
        } else {
            return res.ok({
                status: "ok",
                message: sails.config.msgConstants.recordNotFound,
                data: []
            });
        }
    },

    creditUserList: async function (req, res) {
        const userType = req.param("userType"),
            white_label_id = req.param("white_label_id") || req.user.loggedInWhiteLabelID,
            userId = req.user.id,
            loanId = req.param("loanId");

        params = req.allParams();
        fields = ["userType"];
        missing = await reqParams.fn(params, fields);

        if (!userType) {
            sails.config.res.missingFields.mandatoryFields = missing;
            return res.badRequest(sails.config.res.missingFields);
        }
        if (loanId) {
            const loanData = await LoanrequestRd.findOne({id: loanId});
            if (!loanData) {
                return res.badRequest(sails.config.res.invalidLoanId);
            }
        }
        whereCondition = {
            status: "active",
            usertype: userType,
            white_label_id: white_label_id,
            state: req.user["state"],
            city: req.user["city"]
        };
        if (!req.param("userId")) {
            whereCondition.user_sub_type = ["Officer", "Manager"];
        }

        let userData = [],
            taskUserMappingRows = [];

        /* change the where condition for external users */
        if (req.user.is_other === 1 && loanId) {
            taskUserMappingRows = await TaskUserMappingRd.find({
                select: ["creator_id"],
                where: {
                    loan_id: loanId,
                    assign_userid: userId
                }
            });
            const creatorIds = taskUserMappingRows.map((row) => row.creator_id);
            whereCondition = {
                id: creatorIds
            };
            const bankUserData = await UsersRd.find({
                select: ["id", "name", "usertype", "user_sub_type", "is_other"],
                where: whereCondition
            });
            userData = bankUserData;
        } else {
            [userData, taskUserMappingRows] = await Promise.all([
                UsersRd.find({
                    select: ["id", "name", "usertype", "user_sub_type", "is_other"],
                    where: whereCondition
                }),
                loanId ? TaskUserMappingRd.find({
                    select: ["assign_userid"],
                    where: {
                        loan_id: loanId
                    }
                }) : []
            ]);
            if (taskUserMappingRows.length > 0) {
                const otherUserIds = taskUserMappingRows.map((elm) => elm.assign_userid);
                whereCondition = {id: otherUserIds};
                const otherUserData = await UsersRd.find({
                    select: ["id", "name", "usertype", "user_sub_type", "is_other"],
                    where: whereCondition
                });
                userData = [...userData, ...otherUserData];
            }
        }

        userArr = userData;
        return res.ok({
            status: "ok",
            message: sails.config.msgConstants.detailsListed,
            data: userArr
        });
    },

    viewComments: async function (req, res) {
        const loanId = req.param("loanId");
        if (!loanId) {
            return res.badRequestI(sails.config.res.missingFields);
        }

        const loanRequestData = await LoanrequestRd.findOne({
            select: ["remarks"],
            where: {id: loanId}
        });

        if (!loanRequestData) {
            return res.badRequest(sails.config.res.invalidLoanId);
        }

        const isOtherUser = req.user.is_other;
        let remarksArr = [],
            loanBankMappingComments = [],
            formatedloanBankMappingComments = [],
            taskComments = [],
            userIds = [],
            data = [],

            remarks = {};
        try {
            remarks = JSON.parse(loanRequestData.remarks);
        } catch (err) {
            console.log(err);
        }

        /* For other users, filter only comments added by himself/herself and by the reporting bank users */
        if (isOtherUser) {
            /* Fetch reporting bank users from the task user mapping table */
            // const taskUserMappingRows = await TaskUserMappingRd.find({
            // 	select: ["creator_id"],
            // 	where: {
            // 		loan_id: loanId,
            // 		assign_userid: req.user.id
            // 	}
            // });

            // userIds = taskUserMappingRows.map(elm => elm.creator_id);
            // userIds.push(req.user.id);
            const userId = req.user.id;

            for (key in remarks) {
                const {userId: commentorId, assigneeId} = remarks[key];
                remarks[key].commented_at = key;
                if (userId == commentorId || userId == assigneeId) {
                    remarksArr.push(remarks[key]);
                }
            }
        } else {
            for (key in remarks) {
                remarks[key].commented_at = key;
                remarksArr.push(remarks[key]);
            }
        }
        const leadsFetch = await LeadsRd.findOne({loan_id: loanId}).select("comment");
        if (leadsFetch && leadsFetch.comment) {
            let comments = JSON.parse(leadsFetch.comment);
            comments = Object.values(comments).find(o => o.icon_name && o.icon_name === "Draft");
            remarksArr.push(comments);
        }

        const loanBankMappingInputs = await LoanBankMappingRd.find({
            select: ["id"],
            where: {loan_id: loanId}
        })
            .sort("create_at DESC")
            .limit(1);

        if (loanBankMappingInputs.length > 0) {
            loanComments = await LoanStatusCommentsRd.find({loan_bank_id: loanBankMappingInputs[0].id});
            if (loanComments.length > 0) {
                for (const element of loanComments) {
                    const [commenterData, assigneeData, lender_doc_details] = await Promise.all([
                        UsersRd.findOne({
                            select: ["name"],
                            where: {id: element.user_id}
                        }),
                        UsersRd.findOne({
                            select: ["name"],
                            where: {id: element.assignee_id}
                        }),
                        element.doc_id ? LenderDocumentRd.find({id: JSON.parse(element.doc_id), status: "active"}) : []
                    ]);

                    element.created_time = moment(element.created_time).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
                    const assigneeName = assigneeData && assigneeData.name;

                    const comments = {
                        userId: element.user_id,
                        assignedBy: commenterData.name || "",
                        type: "Comments",
                        message: element.comment_text,
                        assigneeId: element.assignee_id,
                        assignedTo: assigneeName || "",
                        commented_at: element.created_time,
                        assigned_by: commenterData.name || "",
                        comment_ref_id: element.comment_ref_id,
                        lender_documents: lender_doc_details || [],
                    };
                    if (isOtherUser === 1) {
                        if (req.user.id == element.user_id || req.user.id == element.assignee_id) {
                            loanBankMappingComments.push(comments);
                        }
                    } else {
                        loanBankMappingComments.push(comments);
                    }
                }
            }
            const commentRefIds = [];
            loanBankMappingComments.map(comment => {
                const commentRefId = comment.comment_ref_id;
                if (commentRefIds.includes(commentRefId)) {
                    formatedloanBankMappingComments
                        .filter(formatedComment => formatedComment.comment_ref_id === comment.comment_ref_id)[0]
                        .replied_comments.push(comment);
                } else if (commentRefId) {
                    commentRefIds.push(commentRefId);
                    comment.replied_comments = [];
                    formatedloanBankMappingComments.push(comment);
                } else {
                    comment.replied_comments = [];
                    formatedloanBankMappingComments.push(comment);
                }
            });
        }


        const myDBStore = sails.getDatastore("mysql_namastecredit_read");
        if (isOtherUser) {
            query = `select tum.creator_id,tum.status, tc.created_time ,tc.commenter_id, tum.assign_userid,date(tum.created_time) assigned_at, tm.taskname ,ou.name other_user_name, u.name,  tum.id taskid, tum.details as 'comment', tc.comment as other_user_comment from task_user_mapping tum  left join users u on (u.userid = tum.creator_id) left join users ou on (ou.userid = tum.assign_userid) join task_master tm on (tm.task_cat_id = tum.taskid) left join task_comments tc on (tc.task_id = tum.id) where tum.loan_id  = $1 and tum.assign_userid = ${req.user.id} group by tum.creator_id, tum.details, tum.assign_userid, tc.comment;`;
        } else {
            query = `select tum.creator_id,tum.status, tc.created_time ,tc.commenter_id, tum.assign_userid,date(tum.created_time) assigned_at, tm.taskname ,ou.name other_user_name, u.name,  tum.id taskid, tum.details as 'comment', tc.comment as other_user_comment from task_user_mapping tum  left join users u on (u.userid = tum.creator_id) left join users ou on (ou.userid = tum.assign_userid) join task_master tm on (tm.task_cat_id = tum.taskid) left join task_comments tc on (tc.task_id = tum.id) where tum.loan_id  = $1 group by tum.creator_id, tum.details, tum.assign_userid, tc.comment;`;
        }

        const viewCommentHistory = await myDBStore.sendNativeQuery(query, [loanId]);
        if (viewCommentHistory.rows.length > 0) {
            const viewData = viewCommentHistory.rows;
            viewData.forEach((task_data, index) => {
                date = moment(task_data.created_time).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
                legalObj = {
                    userId: task_data.creator_id,
                    assignedBy: task_data.name,
                    type: "Comments",
                    message: task_data.other_user_comment,
                    assignedTo: task_data.other_user_name,
                    commented_at: date,
                    assigned_by: task_data.name
                };
                if (task_data.commenter_id === task_data.assign_userid) {
                    legalObj.assignedBy = legalObj.assigned_by = task_data.other_user_name;
                    legalObj.assignedTo = task_data.name;
                }
                taskComments.push(legalObj);
            });
        }

        data = [...remarksArr, ...formatedloanBankMappingComments, ...taskComments];

        if (data.length == 0) {
            return res.badRequest({
                status: "nok",
                message: sails.config.msgConstants.recordNotFound
            });
        }

        /* Sort the array by time */
        const dataLen = data.length;
        for (let i = 0; i < dataLen; i++) {
            for (let j = 0; j < dataLen; j++) {
                if (data[i].commented_at < data[j].commented_at && i < j) {
                    const temp = data[i];
                    data[i] = data[j];
                    data[j] = temp;
                }
            }
        }

        return res.ok({status: "ok", message: "Comments list", data: data});
    },
    creditUserListNew: async function (req, res) {
        const {branch_id, city, loggedInWhiteLabelID} = req.user,
            whereCondition = {
                white_label_id: loggedInWhiteLabelID
            },
            whiteLabelData = await WhiteLabelSolutionRd.findOne({id: loggedInWhiteLabelID}).select("assignment_type");
        if (whiteLabelData) {
            arrData = whiteLabelData.assignment_type.credit_assignment;
            if (arrData.assignment) {
                whereCondition.usertype = arrData.assignment[0].usertype;
                whereCondition.user_sub_type = arrData.assignment[0].user_subtype;
            }
            if (arrData.branch) {
                whereCondition.branch_id = branch_id;
            }
            if (arrData.city) {
                whereCondition.city = city;
            }
        }
        let userData = await UsersRd.find(whereCondition).select("name");
        if (userData.length == 0) {
            userData = [];
        }

        return res.ok({status: "ok", message: "Credit Users List", data: userData});
    },
    viewLoanListing_new: async (req, res) => {
        let otherUsers = false;
        if (sails.config.otherUsersTypes.find((element) => element == req.user.usertype)) {
            otherUsers = true;
        }
        let other_users_status = req.param("status");
        if (other_users_status === "Assigned") {
            other_users_status = "open";
        } else if (req.param("search")) {
            other_users_status = undefined;
        } else {
            other_users_status = "close";
        }
        const loan_status_id = req.param("status1"),
            loan_sub_status_id = req.param("status2"),
            loan_bank_status_id = req.param("status3"),
            loan_borrower_status_id = req.param("status4"),
            meeting_flag = req.param("status6"),
            search = req.param("search"),
            page_count = req.param("skip") ? req.param("skip") : 0,
            limit_count = req.param("limit") ? req.param("limit") : 10;
        let createdUserData, bankUserData;
        const userid = [],
            regionList = [],
            users_whitelabel = req.user.loggedInWhiteLabelID, //White label limiting for first
            whereCondition = {white_label_id: users_whitelabel}, //where conditions
            user_whitelabel = req.user.loggedInWhiteLabelID,
            userType = req.user.usertype,
            users = await UsersRd.find({
                // Get the list of things this user can see
                select: ["id"],
                where: {
                    or: [
                        {
                            parent_id: req.user["id"]
                        },
                        {
                            id: req.user["id"]
                        }
                    ]
                }
            });
        _.each(users, (value) => {
            userid.push(value.id);
        });
        if (req.user.is_corporate == 1 && req.user.corporateData && Object.keys(req.user.corporateData).length > 0) {
            userid.push(req.user.corporateData.userid);
            userid.push(req.user.corporateData.created_by);
        }
        const whiteLabelData = await WhiteLabelSolutionRd.findOne({
            //Assignment type for selected whitelabel from solution table
            select: ["assignment_type"],
            where: {
                id: users_whitelabel
            }
        }),
            arrData =
                whiteLabelData && whiteLabelData.assignment_type && whiteLabelData.assignment_type.loans.assignment;
        arrData &&
            arrData.forEach((Element) => {
                forRes = Element.hasOwnProperty(req.user.usertype) && Element[userType] === req.user.user_sub_type;
            });
        if (req.user.usertype == "Bank") {
            product_list = req.user.products_type ? req.user.products_type.split(",") : [];
            //Condition for Lender or Bank Admin user
            if (req.user.is_lender_admin === 1) {
                //Get product id from token and update that to condition
                if (product_list.length > 0) {
                    whereCondition.loan_products = product_list;
                }
                //Get region ids of the loggedin admin user
                const regionIds = await LenderRegionMappingRd.find({
                    select: ["region_id"],
                    where: {
                        user_id: req.user.id
                    }
                });
                //Admi user should have region wise loan listing
                _.each(regionIds, (value) => {
                    regionList.push(value.region_id);
                });
                whereCondition.or = [{region_id: regionList}, {users: userid}, {bank_id: req.user.lender_id}];
            }
            //Condition for Lender or Bank manager user
            if (req.user.is_lender_admin !== 1 && req.user.is_lender_manager === 1) {
                if (req.user.lender_id) {
                    {
                    }
                }
                if (product_list.length > 0) {
                    whereCondition.loan_products = product_list;
                }
                condition = whereCondition.or = [
                    {bank_id: req.user.lender_id},
                    {users: userid},
                    {sales_id: req.user.id},
                    {createdUserId: req.user.id},
                    {bank_emp_id: req.user.id},
                    {city: req.user.city},
                    {assigned_extended_ids: {contains: req.user.id}}
                ];
            } else if (req.user.is_branch_manager === 1) {
                condition = whereCondition.or = [
                    {users: userid},
                    {sales_id: req.user.id},
                    {createdUserId: req.user.id},
                    {bank_emp_id: req.user.id},
                    {branch_id: req.user.branch_id},
                    {assigned_extended_ids: {contains: req.user.id}}
                ];
            } else if (req.user.is_state_access === 1) {
                condition = whereCondition.or = [
                    {users: userid},
                    {sales_id: req.user.id},
                    {createdUserId: req.user.id},
                    {state: req.user.state},
                    {assigned_extended_ids: {contains: req.user.id}}
                ];
            } else {
                condition = whereCondition.or = [
                    {users: userid},
                    {sales_id: req.user.id},
                    {createdUserId: req.user.id},
                    {bank_emp_id: req.user.id},
                    {assigned_extended_ids: {contains: req.user.id}}
                ];
            }
        } else if (req.user.usertype == "Analyzer") {
            whereCondition.or = [{createdUserId: req.user.id}, {sales_id: req.user.id}];
        } else if (otherUsers) {
            // Modify function to return the data for other users. The primary table for other users is task_user_mapping
            let sortValue = "";
            if (other_users_status == "open") {
                sortValue = "created_time";
            } else {
                sortValue = "completed_time";
            }
            let taskUserData = [];
            if (other_users_status) {
                taskUserData = await TaskUserMappingRd.find({
                    assign_userid: req.user.id,
                    status: other_users_status
                }).sort([{[sortValue]: "DESC"}]);
            } else {
                taskUserData = await TaskUserMappingRd.find({
                    assign_userid: req.user.id,
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
        } else if (req.user.usertype == "CA") {
            whereCondition.or = [{users: userid}, {createdUserId: req.user.id}];
        } else if (req.user.usertype == "Checker") {
            whereCondition.assigned_extended_ids = {contains: req.user.id};
        } else {
            whereCondition.users = userid;
        }
        if (loan_status_id) {
            whereCondition.loan_status_id = loan_status_id.split(",");
            if (loan_sub_status_id) {
                whereCondition.loan_sub_status_id = loan_sub_status_id.split(",");
            }
        }
        if (
            loan_bank_status_id &&
            loan_borrower_status_id
        ) {
            const bankStatusID = loan_bank_status_id.split(","),
                borrowerStatusId = loan_borrower_status_id.split(",");

            if (bankStatusID.length > 0 && borrowerStatusId.length > 0) {
                whereCondition.loan_bank_status = bankStatusID;
                whereCondition.loan_borrower_status = borrowerStatusId;
            }

            if (meeting_flag) {
                whereCondition.meeting_flag = meeting_flag.split(",");
            }
        }
        if (search && typeof search !== "undefined") {
            if (
                sails.config.muthoot_white_label_id.find((element) => element == users_whitelabel) &&
                otherUsers == "false" &&
                req.user.is_lender_manager != 1
            ) {
                whereCondition.or = [{sales_id: req.user.id}, {createdUserId: req.user.id}, {bank_emp_id: req.user.id}];

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
        }
        if (loan_status_id == 1 && !loan_sub_status_id) {
            whereCondition.loan_sub_status_id = null;
        }
        const ncStatusManage = await NcStatusManageRd.find({
            white_label_id: user_whitelabel
        }).select(["name", "status1", "status2", "status3", "status4", "status5", "status6", "white_label_id", "parent_id", "parent_flag", "uw_doc_status"]),
            viewLoanList = await ViewloanRd.find(whereCondition)
                .populate("users")
                .populate("business")
                .populate("loan_bank_mapping")
                .populate("loan_products")
                .populate("loan_usage_type")
                .populate("loan_asset_type")
                .populate("lender_status")
                .populate("loan")
                .populate("sales_id")
                .sort([{modified_on: "DESC"}, {upts: "DESC"}])
                .paginate({page: page_count, limit: limit_count}),
            logService = await sails.helpers.logtrackservice(req, "viewloanlisting", req.user.id, "view_loan");
        Promise.all(
            viewLoanList.map(async (viewLoanListElement) => {
                viewLoanList.business = _.pick(viewLoanListElement.loan_products,
                    ["businessname", "first_name", "last_name", "business_email", "contactno", "businessstartdate", "businesspancardnumber", "corporateid", "white_label_id", "status", "ints", "gstin", "email_verification", "title", "udyam_number", "userid", "businesstype"]);
                if (otherUsers) {
                    const findTaskId = await TaskUserMappingRd.find({
                        loan_id: viewLoanListElement.loan.id,
                        assign_userid: req.user.id,
                        status: other_users_status
                    }).sort([{id: "DESC"}]);
                    viewLoanListElement["evaluationId"] = findTaskId[0].id;
                    viewLoanListElement["evaluation_status"] =
                        findTaskId[0].status == "open" ? "Assigned" : "Evaluation Completed";
                    viewLoanListElement["assigned_at"] =
                        findTaskId[0].status == "open" ? findTaskId[0].created_time : findTaskId[0].completed_time;
                }
                // add verified code here
                viewLoanListElement.is_verified = true;
                // check verification in panno_response, ekyc_response_table
                const directorDetails = [];
                if (viewLoanListElement.business) {
                    const panNumbers = [],
                        directorRecord = await DirectorRd.find({business: viewLoanListElement.business.id});
                    if (viewLoanListElement.business.businesspancardnumber) {
                        panNumbers.push(viewLoanListElement.business.businesspancardnumber);
                    }
                    for (const dirElement of directorRecord) {
                        if (dirElement.dpancard) {
                            panNumbers.push(dirElement.dpancard);
                        }
                        if (dirElement.income_type == "business") {
                            dirElement.income_type = 1;
                        } else if (dirElement.income_type == "salaried") {
                            dirElement.income_type = 7;
                        } else {
                            dirElement.income_type = 0;
                        }
                        directorDetails.push(dirElement);
                    }
                    const countPan = await PannoResponse.find({panno: panNumbers});
                    for (const record of countPan) {
                        if (record && record.verification_response && viewLoanListElement.is_verified) {
                            m = JSON.parse(record.verification_response);
                            viewLoanListElement.is_verified = m["verificationData"]
                                ? m["verificationData"]["message"]["verified"] || false
                                : true;
                        }
                    }
                    if (viewLoanListElement.is_verified) {
                        const ekycData = await EkycResponse.find({ref_id: viewLoanListElement["business"].id});
                        for (const elementEkyc of ekycData) {
                            if (elementEkyc.verification_response && viewLoanListElement.is_verified) {
                                m = JSON.parse(elementEkyc.verification_response);
                                viewLoanListElement.is_verified = m["verificationData"]
                                    ? (m["verificationData"]["message"] &&
                                        m["verificationData"]["message"]["verified"]) ||
                                    (m["verificationData"]["message"] &&
                                        m["verificationData"]["message"]["verification"]) ||
                                    false
                                    : true;
                            }
                        }
                    }
                }
                viewLoanListElement.director_details = directorDetails;
                viewLoanListElement.is_assigned = false;
                const findTaskCount = await TaskUserMappingRd.count({
                    loan_id: viewLoanListElement.loan.id
                });
                // This is to display if the task is already being assigned to external evaluator
                if (findTaskCount > 0) {
                    viewLoanListElement.is_assigned = true;
                }

                viewLoanListElement.loan_products = _.pick(
                    viewLoanListElement.loan_products,
                    "id",
                    "product",
                    "loan_request_type",
                    "loan_type_id",
                    "loan_usage_type_id",
                    "parent_id",
                    "created",
                    "business_type_id",
                    "dynamic_forms"
                );
                if (!viewLoanListElement.loan_products.dynamic_forms) {
                    viewLoanListElement.loan_products.dynamic_forms = await sails.helpers.dynamicForms();
                }
                viewLoanListElement.loan_product_details = await LoanProductDetailsRd.find({
                    white_label_id: viewLoanListElement.white_label_id,
                    isActive: "true",
                    product_id: {
                        contains: viewLoanListElement.loan.loan_product_id
                    }
                }).select(["product_id", "parent_id"]);
                if (viewLoanListElement.loan.parent_product_id) {
                    parentProductData = await LoanProductDetailsRd.findOne({id: viewLoanListElement.loan.parent_product_id}).select(["product_id", "basic_details"]);
                    parentProductData = {...JSON.parse(parentProductData.basic_details), ...parentProductData};
                    delete parentProductData.basic_details;
                    viewLoanListElement.parent_product = parentProductData;
                } else {
                    viewLoanListElement.parent_product = {};
                }
                viewLoanListElement.loan &&
                    viewLoanListElement.loan.createdUserId
                    ? (createdUserData = await UsersRd.findOne({
                        id: viewLoanListElement.loan.createdUserId
                    }).select(["name", "pic"]))
                    : (createdUserData = null);
                viewLoanListElement.loan_bank_mapping &&
                    viewLoanListElement.loan_bank_mapping.bank_emp_id
                    ? (bankUserData = await UsersRd.findOne({
                        id:
                            viewLoanListElement.loan_bank_mapping.bank_emp_id
                    }).select(["name", "pic"]))
                    : (bankUserData = {});
                viewLoanListElement.created_user = createdUserData;
                viewLoanListElement.bank_emp_data = bankUserData;
                const loanDocument = await LoanDocumentRd.find({
                    loan: viewLoanListElement.loan.id,
                    status: "active",
                    doctype: {"!=": 0}
                })
                    .select(["loan", "business_id", "user_id", "doctype", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "ints", "on_upd", "size", "document_password", "directorId", "uploaded_by", "is_delete_not_allowed"])
                    .populate("doctype")
                    .limit(200);
                viewLoanListElement.loan_document = loanDocument || [];
                const docCheck = loanDocument.find((doc) => doc.doctype.id === sails.config.docUpload.uploadId);
                viewLoanListElement.dbDocCheck = docCheck ? "Uploaded" : "Pending";
                const docDownloadCheck = loanDocument.find((doc) => doc.doctype.id === sails.config.docUpload.downloadId);
                viewLoanListElement.dbDownloadCheck = docDownloadCheck ? "Downloaded" : "Pending";
                lenderDocument = await LenderDocumentRd.find({
                    loan: viewLoanListElement.loan.id,
                    status: "active",
                    doc_type: {"!=": 0}
                })
                    .populate("doc_type")
                    .limit(100);
                viewLoanListElement.lender_document = lenderDocument || [];
                viewLoanListElement.sanctionData =
                    (await LoanSanctionRd.find({loan_id: viewLoanListElement.id}).select("sanction_status")) || [];
                const lender_status_record = {};
                if (viewLoanListElement.loan_bank_mapping) {
                    if (viewLoanListElement.loan_bank_mapping.lender_status) {
                        await LoanStatusWithLenderRd.findOne({
                            id: viewLoanListElement.loan_bank_mapping.lender_status
                        }).then((res_data) => {
                            if (res_data) {
                                viewLoanListElement.loan_bank_mapping.lender_status = res_data;
                            } else {
                                viewLoanListElement.loan_bank_mapping.lender_status = [];
                            }
                        });
                    }
                    loan_status_comments = await LoanStatusCommentsRd.find({
                        loan_bank_id: viewLoanListElement.loan_bank_mapping.id
                    }).sort("id DESC");
                    if (loan_status_comments.length > 0) {
                        viewLoanListElement.loan_bank_mapping.loan_status_comments = loan_status_comments;
                    } else {
                        viewLoanListElement.loan_bank_mapping.loan_status_comments = [];
                    }
                    extended_user_id = viewLoanListElement.loan_bank_mapping.assigned_extended_ids;
                    if (extended_user_id) {
                        const userId_arrData = extended_user_id.split(",");
                        viewLoanListElement.assigned_extended_ids = await UsersRd.find({id: userId_arrData.map(Number)}).select("name");
                    } else {
                        viewLoanListElement.assigned_extended_ids = [];
                    }
                } else {
                    viewLoanListElement.assigned_extended_ids = [];
                    viewLoanListElement.loan_bank_mapping = lender_status_record;
                }
            })
        ).then(() => {
            let sorted = [];
            if (otherUsers) {
                sorted = viewLoanList.sort((a, b) => {
                    return b.assigned_at - a.assigned_at;
                });
            } else {
                sorted = viewLoanList;
            }
            return res.ok({
                status: "ok",
                loan_details: sorted,
                status_details: ncStatusManage
            });
        });
    }
};

async function loanDetailsForView(reqData) {
    try {
        const {loan, business, users, sales_id, lender_status, loan_bank_mapping, branch_id, otherUsers,
            other_users_status, loggedInUserId, white_label_id, createdUserId,
            loan_asset_type, loan_usage_type, loan_type, loan_products} = reqData,
            usersData = await usersDataFetch(users) || [],
            salesData = await usersDataFetch(sales_id) || [],
            createdUserData = await usersDataFetch(createdUserId) || [],
            loanData = await LoanrequestRd.findOne({id: loan}).select(["loan_request_type",
                "business_id", "loan_ref_id", "loan_amount", "loan_amount_um", "remarks_val", "modified_on", "RequestDate", "application_ref", "loan_origin", "connector_user_id",
                "applied_tenure", "annual_revenue", "revenue_um", "annual_op_expense", "op_expense_um", "cur_monthly_emi", "loan_status_id", "loan_sub_status_id", "parent_product_id", "createdUserId"]),
            businessData = await BusinessRd.findOne({id: business}).select(["businessname", "userid", "first_name", "last_name", "businesstype", "customer_id"]),
            loanAssetTypeData = await LoanAssetTypeRd.findOne({id: loan_asset_type}),
            loanUsageTypeData = await LoanUsageTypeRd.findOne({id: loan_usage_type}),
            loanTypeData = await LoantypeRd.findOne({id: loan_type}).select("loanType");
        loanProductData = await LoanProductsRd.findOne({id: loan_products}).select(["product", "payment_structure", "security", "loan_request_type", "loan_type_id",
            "loan_asset_type_id", "loan_usage_type_id", "parent_flag", "parent_id", "created", "business_type_id", "dynamic_forms"]);
        if (!loanProductData.dynamic_forms) {
            loanProductData.dynamic_forms = await sails.helpers.dynamicForms();
        }
        const dbdocData = await dbDocDetails(loan);

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
            loan_document: [],
            lender_document: [],
            director_details: await directorDetails(business) || [],
            assigned_extended_ids: [],
            bank_emp_data: {},
            bank_user: {},
            loan_bank_mapping: {},
            dbDocCheck: dbdocData.dbBankDocTypeCheck,
            dbDownloadCheck: dbdocData.dbBankDownloadDoc
        };
        if (loan_bank_mapping) {
            console.log("=================================================");
            dataObj.loan_bank_mapping = await LoanBankMappingRd.findOne({id: loan_bank_mapping}).select(["bank_id", "bank_emp_id", "loan_bank_status", "loan_borrower_status", "meeting_flag", "assigned_extended_ids", "lender_status"]);
            dataObj.lender_status = data.loan_bank_mapping.lender_status = await LoanStatusWithLenderRd.findOne({id: lender_status}).select("status");
            dataObj.bank_user = data.bank_emp_data = data.loan_bank_mapping.bank_emp_id ?
                await usersDataFetch(data.loan_bank_mapping.bank_emp_id) : null;
            if (dataObj.loan_bank_mapping.assigned_extended_ids) {
                const userId_arrData = dataObj.loan_bank_mapping.assigned_extended_ids.split(",");
                dataObj.assigned_extended_ids = await UsersRd.find({id: userId_arrData.map(Number)}).select("name");
            }
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
        }).select(["user_id", "doctype", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size", "directorId"])
            .populate("doctype")
            .limit(200);
        dataObj.lender_document = await LenderDocumentRd.find({
            loan,
            status: "active"
        }).select(["user_id", "doc_type", "doc_name", "uploaded_doc_name", "original_doc_name", "status", "size_of_file", "directorId"])
            .populate("doc_type")
            .limit(200);

        return dataObj;
    } catch (err) {
        return err;
    }
}
async function usersDataFetch(userid) {
    return (await UsersRd.findOne({id: userid}).select(["name", "email", "lender_id", "usertype", "parent_id", "user_sub_type"]));
};
async function directorDetails(businessid) {
    const directorDetails = [];
    directorDetailsData = await DirectorRd.find({
        business: businessid,
        status: "active"
    }).select(["dpancard", "isApplicant", "daadhaar", "dpassport", "dvoterid", "ddlNumber", "income_type"]);
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
async function dbDocDetails(loanId) {
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
        status: "active"
    });
    docDownloadCheck.length > 0 ? (dbBankDownloadDoc = "Downloaded") : (dbBankDownloadDoc = "Pending");
    return {dbBankDocTypeCheck, dbBankDownloadDoc};
}
