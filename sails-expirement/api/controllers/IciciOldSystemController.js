/**
 * @description :: ICICI old system case creation
 * @api {post} /iciciOldSystemCaseCreation create case
 * @apiName ICICI create case
 * @apiGroup ICICI Case
 * @apiExample Example usage:
 * curl -i localhost:1337/iciciOldSystemCaseCreation
 *
 * @apiParam {Object} Business_details
 * @apiParam {String} Business_details.business_name business name.
 * @apiParam {Number} Business_details.business_type business type(non mandatory).
 * @apiParam {String} Business_details.business_email business email(non mandatory).
 * @apiParam {Number} Business_details.contact contact(non mandatory).
 * @apiParam {Object} loan_details
 * @apiParam {String} loan_details.occupation_type occupation_type ("Self Employed","Salaried").
 * @apiParam {Number} loan_details.loan_product loan product.
 * @apiParam {String} loan_details.application_no application no
 * @apiParam {String} loan_details.case_priority case priority("Normal","Urgent")(non mandatory).
 * @apiParam {String} loan_details.city city(non mandatory).
 * @apiParam {String} loan_details.region region(non mandatory).
 * @apiParam {String[]} loan_details.email email(non mandatory).
 * @apiParam {String} loan_details.loan_description loan_description(non mandatory).
 * @apiParam {String} loan_details.entry_date (non mandatory)
 *
 * @apiSuccess {String} status ok.
 * @apiSuccess {String} message "case created successfuly.
 * @apiSuccess {Object} case_id created case reference id and loan id.
 *
 */
const moment = require("moment");
const reqParams = require("../helpers/req-params");
module.exports = {
	iciciCaseCreation: async function (req, res) {
		const {loan_details, Business_details} = req.allParams();
		let {
			businesspancardnumber,
			first_name,
			last_name,
			contact,
			business_email,
			empcount,
			business_type: business,
			business_name: businessname
		} = Business_details;
		const userData = await UsersRd.findOne(sails.config.ICICI),
			userid = userData.id,
			white_label_id = userData.white_label_id;

		if (!businessname) {return res.badRequest(sails.config.res.missingFieldsBusinessDetails);}

		const {
			loan_product,
			occupation_type,
			case_priority,
			application_no,
			remarks,
			city,
			region,
			email,
			loan_description,
			entry_date
		} = loan_details;
		let businesstype,
			loan_request_type,
			loan_asset_type_id,
			loan_usage_type_id,
			loan_type_id,
			loan_summary,
			loan_product_id;

		const params = req.allParams();
		const fields = ["loan_product", "occupation_type", "application_no"];
		const missing = await reqParams.fn(params, fields);

		if (!loan_product || !occupation_type || !application_no) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFieldsLoanDetails);
		}
		const datetime = await sails.helpers.dateTime(),
			productData = sails.config.loan_Product;
		if (occupation_type == productData.product_1) {
			loan_product_id = productData.product_id_1;
		} else if (occupation_type == productData.product_2 && userData.email == productData.icici_email) {
			loan_product_id = productData.product_id_2;
		} else if (occupation_type == productData.product_2) {
			loan_product_id = productData.product_id_3;
		} else {
			return res.badRequest(sails.config.res.notExist);
		}

		LoanProductsRd.find({
			id: loan_product_id
		})
			.limit(1)
			.then((loanProducts) => {
				if (loanProducts.length === 0) {throw new Error("productMapping");}
				loan_request_type = loanProducts[0].loan_request_type;
				loan_asset_type_id = loanProducts[0].loan_asset_type_id.split(",")[0];
				loan_usage_type_id = loanProducts[0].loan_usage_type_id.split(",")[0];
				loan_type_id = loanProducts[0].loan_type_id.split(",")[0];
				businesstype = loanProducts[0].business_type_id.split(",")[0];
				const loanSummary = `${loanProducts[0].product} - requested to create case for business ${businessname} for ${userData.usertype}`;
				loan_summary = loan_description || loanSummary;
				return LoanrequestRd.find({application_ref: application_no}).limit(1);
			})
			.then((loanRequestDetails) => {

				if (loanRequestDetails && loanRequestDetails.length > 0) {
					const data = _.pick(loanRequestDetails[0], "id", "business_id", "loan_ref_id", "application_ref");
					sails.config.res.valueExist.data = data;
					throw new Error("valueExist");
				}

				businesspancardnumber = businesspancardnumber || "NAMAS9948K";
				first_name = first_name || "";
				last_name = last_name || "";
				empcount = empcount || 1;
				contact = contact || userData.contact;
				business_email = business_email || userData.email;

				const business_data = {
					businessname,
					userid,
					first_name,
					last_name,
					businessstartdate: datetime,
					business_email,
					contactno: contact,
					businesstype,
					businesspancardnumber,
					white_label_id,
					empcount,
					businessindustry: "20",
					ints: datetime
				};
				return Business.create(business_data).fetch();
			})
			.then(async (businessInfo) => {
				const loan_data = {
					loan_request_type: loan_request_type || 1,
					business_id: businessInfo.id,
					loan_ref_id: await sails.helpers.commonHelper(),
					loan_asset_type: loan_asset_type_id || 1,
					loan_usage_type: loan_usage_type_id || 1,
					loan_type_id: loan_type_id || 1,
					loan_product_id,
					white_label_id,
					createdUserId: userid,
					RequestDate: datetime,
					loan_summary,
					loan_origin: sails.config.loanOrigin.loan_origin1,
					modified_on: datetime,
					notification: 1,
					case_priority,
					b_city: city,
					default_emails: {email: email},
					default_zone: region,
					application_ref: application_no
				};
				if (remarks) {
					history = {};
					ncStatus_history = {
						loan_status_id: 1,
						loan_sub_status_id: null,
						createdUserId: req.user.id,
						case_remarks: remarks
					};
					const datetime = await sails.helpers.dateTime();
					history[datetime] = ncStatus_history;
					loan_data.nc_status_history = JSON.stringify(history);
				}

				return Loanrequest.create(loan_data).fetch();
			})
			.then(async (newLoanRequest) => {
				const {id, business_id, loan_ref_id} = newLoanRequest;

				if ((id && !business_id) || (id && business_id == 0)) {
					Loanrequest.update({id}).set({
						business_id: businessInfo.id
					});
				}
				if (entry_date) {
					await MisActivity.create({
						loan_id: id,
						business_id: business_id,
						inserted_time_stamp: datetime,
						bde_started: moment(entry_date, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
					}).fetch();
				}
				sails.config.successRes.createdData.case_id = loan_ref_id;
				return res.ok(sails.config.successRes.createdData);
			})
			.catch((err) => {
				switch (err.message) {
					case "productMapping":
						return res.badRequest(sails.config.res.notExist);
					case "valueExist":
						return res.badRequest(sails.config.res.valueExist);
					default:
						throw err;
				}
			});
	},
	/**
 * @description :: ICICI old system mis activity data
 * @api {post} /misActivityUpdate mis-Activity Update
 * @apiName ICICI mis-Activity Update
 * @apiGroup ICICI Case
 * @apiExample Example usage:
 * curl -i localhost:1337/misActivityUpdate
 *
 * @apiParam {String} case_id case id(mandatory).
 * @apiParam {String} application_no application no(mandatory)
 * @apiParam {String} bde_start_date (non-mandatory)
 * @apiParam {String} bde_end_date (non-mandatory)

 * @apiSuccess {String} status ok.
 * @apiSuccess {String} message "Data updated successfully.
 * @apiSuccess {Object} data data.
 *
 */
	misActivityUpdate: async function (req, res) {
		const {application_no: application_ref, case_id: loan_ref_id, bde_start_date, bde_end_date} = req.allParams(),
			datetime = await sails.helpers.dateTime();

		const params = req.allParams();
		const fields = ["application_ref", "loan_ref_id"];
		const missing = await reqParams.fn(params, fields);

		if (!application_ref || !loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({loan_ref_id, application_ref});
		if (!loanData) {
			sails.config.res.invalidCaseOrData.message = "Invalid case Id or invalid application no";
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		if (bde_start_date || bde_end_date) {
			const condition = {};
			if (bde_start_date) {
				condition.bde_started = moment(bde_start_date, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
			}
			if (bde_end_date) {
				condition.bde_end = moment(bde_end_date, "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
			}
			const mis_activity = await MisActivityRd.find({
				loan_id: loanData.id,
				business_id: loanData.business_id
			}).limit(1);
			if (mis_activity && mis_activity.length > 0) {
				condition.updated_time_stamp = datetime;
				const mis_activity_update = await MisActivity.update({
					loan_id: mis_activity[0].loan_id,
					business_id: mis_activity[0].business_id
				})
					.set(condition)
					.fetch();
				sails.config.successRes.dataUpdated.data = mis_activity_update;
				return res.ok(sails.config.successRes.dataUpdated);
			} else {
				condition.loan_id = loanData.id;
				condition.business_id = loanData.business_id;
				condition.inserted_time_stamp = datetime;
				const mis_activity_create = await MisActivity.create(condition).fetch();
				sails.config.successRes.dataInserted.data = mis_activity_create;
				return res.ok(sails.config.successRes.dataInserted);
			}
		} else {
			sails.config.res.notAllowedToMovedCase.message = "there is no data to update";
			return res.badRequest(sails.config.res.notAllowedToMovedCase);
		}
	},

	/**
 * @description :: ICICI old system Loan Creation
 * @api {post} /loanCreation_php
 * @apiName ICICI old system Loan Creation
 * @apiGroup ICICI Case
 * @apiExample Example usage:
 * curl -i localhost:1337/loanCreation_php
 *
 * @apiParam {String} users (mandatory)
 * @apiParam {String} loan_details (mandatory)
 * @apiParam {String} director_details (mandatory)

* @apiSuccess {String} status ok
* @apiSuccess {String} message
* @apiSuccess {Object} created data
*
*/

	loanCreation_php: async function (req, res) {
		const {users, loan_details, director_details} = req.allParams();

		const params = req.allParams();
		const fields = ["users", "loan_details", "director_details"];
		const missing = await reqParams.fn(params, fields);

		if (!users || !loan_details || !director_details) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let {name, phoneNo, email, business_type, sales_id, panNumber} = users;
		let {loan_product_id, white_label_id, application_ref, loan_amount, tenure, monthly_income, monthly_emi, current_emi} = loan_details;
		let {dob, gender, creditScore, isApplicant, dpan} = director_details;
		const datetime = await sails.helpers.dateTime();
		if (!name || !phoneNo || !email || !business_type || !sales_id) {
			sails.config.res.missingFieldsBusinessDetails.message = "Some mandatory fields are missing in users details";
			return res.badRequest(sails.config.res.missingFieldsBusinessDetails);
		}

		if (!loan_product_id || !white_label_id || !loan_amount || !current_emi || !tenure || !monthly_income || !monthly_emi) {
			return res.badRequest(sails.config.res.missingFieldsLoanDetails);
		}

		userData = {
			name, email, contact: phoneNo
		};

		condition = {
			loan_product_id,
			white_label_id,
			sales_id
		};
		let userId, loan_summary;
		fetchData = await UsersRd.find(userData);
		if (fetchData.length > 0) {
			userId = fetchData[0].id;
		} else {
			userData.origin = sails.config.loanOrigin.loan_origin2;
			userData.createdbyUser = "1";
			userData.status = "active";
			const createData = await Users.create(userData).fetch();
			userId = createData.id;
		}
		LoanProductsRd.find({
			id: loan_product_id,
			business_type_id: {
				contains: business_type
			}
		})
			.limit(1)
			.then((loanProducts) => {
				if (loanProducts.length === 0) {
					throw new Error("productMapping");
				}

				loan_request_type = loanProducts[0].loan_request_type;
				loan_asset_type_id = loanProducts[0].loan_asset_type_id.split(",")[0];
				loan_usage_type_id = loanProducts[0].loan_usage_type_id.split(",")[0];
				loan_type_id = loanProducts[0].loan_type_id.split(",")[0];
				loan_summary = `${loanProducts[0].product} - requested to create case for business ${name} for ${userId}`;
				businesspancardnumber = panNumber || "NAMAS9948K";
				first_name = "";
				last_name = "";

				return BusinessRd.find({
					white_label_id,
					businessname: name,
					business_email: email,
					businesstype: business_type,
					businesspancardnumber
				}).limit(1);
			}).then((businessDetails) => {
				if (businessDetails && businessDetails.length > 0) {
					condition.business_id = businessDetails[0].id;
					if (Object.keys(condition).length > 0 && Object.values(condition).length > 0) {
						return LoanrequestRd.find(condition).limit(1);
					}
				}
			})
			.then((loanRequestDetails) => {
				if (loanRequestDetails && loanRequestDetails.length > 0) {
					sails.config.res.valueExist.case_id = loanRequestDetails[0].loan_ref_id;
					throw new Error("valueExist");
				}


				const business_data = {
					businessname: name,
					userid: userId,
					first_name,
					last_name,
					businessstartdate: datetime,
					business_email: email,
					contactno: phoneNo,
					businesstype: business_type,
					businesspancardnumber,
					white_label_id,
					empcount: 1,
					businessindustry: "20",
					ints: datetime
				};

				return Business.create(business_data).fetch();
			})
			.then(async (businessInfo) => {
				const loan_data = {
					loan_request_type: loan_request_type || 1,
					business_id: businessInfo.id,
					loan_ref_id: await sails.helpers.commonHelper(),
					loan_asset_type: loan_asset_type_id || 1,
					loan_usage_type: loan_usage_type_id || 1,
					loan_type_id: loan_type_id || 1,
					loan_product_id,
					white_label_id,
					createdUserId: sales_id,
					sales_id,
					RequestDate: datetime,
					loan_amount,
					applied_tenure: tenure,
					loan_summary,
					loan_origin: sails.config.loanOrigin.loan_origin2,
					modified_on: datetime,
					notification: 1,
					application_ref: application_ref || null,
					cur_monthly_emi: current_emi,
					annual_op_expense: monthly_income * 12

				};

				return Loanrequest.create(loan_data).fetch();
			})
			.then(async (newLoanRequest) => {
				EligibilityCreate = await EligiblityAnalytics.create({
					product_id: loan_product_id,
					financial_amt: monthly_emi,
					userId: userId,
					loanId: newLoanRequest.id,
					type: "Leads"

				});

				const whiteLabelData = await WhiteLabelSolutionRd.findOne({id: white_label_id});

				url = sails.config.equifaxUrl.url;
				body = {
					userId,
					bucket: whiteLabelData.s3_name,
					email,
					phoneNo,
					panNumber,
					loan_id: newLoanRequest.id,
					businessId: newLoanRequest.business_id,
					white_label_id
				};
				uploadEquifaxDoc = await sails.helpers.sailstrigger(url, JSON.stringify(body), "", "POST");

				directorData = await Director.create({
					business: newLoanRequest.business_id,
					demail: email,
					dfirstname: first_name,
					dlastname: last_name,
					dcontact: phoneNo,
					ddob: dob,
					ints: datetime,
					dcibil_score: creditScore,
					isApplicant: isApplicant || 0,
					dpancard: dpan || null,
					gender: gender
				});
				sails.config.successRes.createdData.case_id = newLoanRequest.loan_ref_id;

				return res.ok(sails.config.successRes.createdData);
			})
			.catch((err) => {
				switch (err.message) {
					case "productMapping":
						return res.badRequest(sails.config.res.productMapping);
					case "valueExist":
						return res.badRequest(sails.config.res.valueExist);
					default:
						throw err;
				}
			});
	}
};
