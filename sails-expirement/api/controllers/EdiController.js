/**
 * EdiController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	loan_amount_validate: async function (req, res) {
		const {loan_amount, business_id, isSelectedProductTypeBusiness, isSelectedProductTypeSalaried} = req.allParams();

		params = {loan_amount, business_id, isSelectedProductTypeBusiness, isSelectedProductTypeSalaried};
		fields = ["loan_amount", "business_id", "isSelectedProductTypeBusiness", "isSelectedProductTypeSalaried"];
		missing = await reqParams.fn(params, fields);
		if (!loan_amount || !business_id || !isSelectedProductTypeBusiness || !isSelectedProductTypeSalaried) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let businessIndustryId, result, condition, approval_status;
		if (isSelectedProductTypeBusiness == "true") {
			const businessData = await BusinessRd.findOne({id: business_id});
			businessIndustryId = businessData.businessindustry;
		}
		else if (isSelectedProductTypeSalaried == "true") {
			const directorData = await DirectorRd.find({business: business_id, isApplicant: 1}).sort("id DESC").limit(1),
				employmentData = await EmploymentDetailsRd.find({director_id: directorData[0].id}).sort("id DESC").limit(1);
			businessIndustryId = employmentData[0].industry_typeid;
		}
		if (businessIndustryId != null && businessIndustryId != "") {
			condition = await BusinessIndustryRd.findOne({id: businessIndustryId}).select("conditions");
		}
		else {
			return res.ok({
				status: "nok",
				message: "Record has no Business Industry Id"
			});
		}
		if (condition && condition.conditions !== null) {
			const {min_loan_amount, max_loan_amount} = JSON.parse(condition.conditions);
			approval_status = (loan_amount && min_loan_amount && max_loan_amount) && (loan_amount >= min_loan_amount && loan_amount <= max_loan_amount) ? true : false;
			if (approval_status == true) {
				result = "Loan Amount Validation Successful";
			}
			else {
				result = `Loan amount requested must be within range of ${min_loan_amount.toLocaleString("en-IN")}-${max_loan_amount.toLocaleString("en-IN")}`;
			}
		}
		else {
			approval_status = (loan_amount >= 25000 && loan_amount <= 300000) ? true : false;
			if (approval_status == true) {
				result = "Loan Amount Validation Successful";
			}
			else {
				result = "Loan amount requested must be within range of 25,000-3,00,000";
			}
		}
		return res.ok({
			status: "ok",
			approval_status,
			message: result
		});
	},
	updated_json: async function (req, res) {
		const {loan_id, director_id, retrigger} = req.allParams();
		if (!loan_id || !director_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_request_data = await Loanrequest.findOne({
			id: loan_id
		});
		if (!loan_request_data) {
			return res.ok({
				status: "nok",
				message: "No loan Found for the given loan Id"
			});
		}
		const business_id = loan_request_data.business_id;
		let loan_prefetchCreateOrUpdate;
		if (loan_request_data.loan_status_id == 1 && loan_request_data.loan_sub_status_id == 1) {
			return res.ok({
				status: "nok",
				message: "Loan is in Draft stage"
			});
		}
		else {
			let updated_json = {},
				business_data, business_address_data, director_data, income_data, loan_financials_data, employment_data, prefetchRecord;
			business_data = await BusinessRd.findOne({id: business_id});
			business_address_data = await BusinessaddressRd.find({bid: business_id});
			director = await DirectorRd.findOne({id: director_id});

			// for (director of director_data) {
			income_data = await IncomeDataRd.find({business_id: business_id, director_id}).sort("id DESC").limit(1);
			loan_financials_data = await LoanFinancialsRd.find({business_id: business_id, director_id, fin_type: ["Bank Account"]});
			employment_data = await EmploymentDetailsRd.findOne({director_id});
			updated_json = {
				loan_data: loan_request_data,
				business_data,
				business_address_data,
				director_data: director,
				income_data,
				employment_data,
				loan_financials_data
			};

			prefetchRecord = await LoanPreFetchRd.findOne({director_id});

			if (prefetchRecord) {
				let updateData = {
					status: "Updated",
					updated_at: await sails.helpers.dateTime(),
					updated_json: JSON.stringify(updated_json)
				}
				if (prefetchRecord.request_type === "Create Pending") updateData.request_type = "Update Pending";
				loan_prefetchCreateOrUpdate = await LoanPreFetch.updateOne({director_id: director_id, loan_id: loan_id}).set(updateData).fetch();
			}
			else {
				loan_prefetchCreateOrUpdate = await LoanPreFetch.create({
					request_type: "Create Pending",
					director_id,
					loan_id: loan_id,
					status: "Fetch",
					created_at: await sails.helpers.dateTime(),
					updated_at: await sails.helpers.dateTime(),
					updated_json: JSON.stringify(updated_json)
				}).fetch();
			}
			// }

			if (retrigger && `${retrigger}` == "true") {
				let ucic_search_response, updateData;
				const headers = {
					"content-type": "application/json",
					Authorization: req.headers.authorization
				}
				ucic_search_response = await sails.helpers.sailstrigger(
					sails.config.ucicSearchFinnoneAPI,
					JSON.stringify({mobile_no: director.dcontact, id_no: director.dpancard}),
					headers,
					"POST"
				);

				if (ucic_search_response.status) return res.ok({
					status: "nok",
					message: "Retrigger failed"
				});

				if (!ucic_search_response.status) {
					const parseData = JSON.parse(ucic_search_response);
					if (parseData?.StatusCode !== false) {
						const {customer_id, dob_flag, is_active} = parseData?.data?.[0] || {}
						if (customer_id && !is_active) updateData = {
							status: "Rejected",
							request_type: "UCIC Rejected",
							third_party_response: `UCIC Deactivated - ${customer_id}`
						}
						else if (customer_id && dob_flag && is_active && dob_flag.split("T")[0] === director.ddob) updateData = {
							status: "Approved",
							request_type: "UCIC Created",
							refrence_no: customer_id
						}
						if (updateData) {
							await Director.updateOne({id: director_id}).set({additional_cust_id: customer_id});
							await LoanPreFetch.updateOne({director_id: director_id, loan_id: loan_id}).set(updateData).fetch();

							return res.ok({
								status: "ok",
								message: "Retriggered successfully"
							});
						}
					}
				}

				const searchRequestBody = {
					mobile_no: director.dcontact
				}
				const aadharRegex = /^\d{12}$/;
				if (!director.daadhaar) {
					if (director.ddlNumber) searchRequestBody.id_no = director.ddlNumber
					else if (director.dpassport) searchRequestBody.id_no = director.dpassport
					else if (director.dvoterid) searchRequestBody.id_no = director.dvoterid
				}
				else if (aadharRegex.test(director.daadhaar)) searchRequestBody.id_no = director.daadhaar

				ucic_search_response = await sails.helpers.sailstrigger(
					sails.config.ucicSearchFinnoneAPI,
					JSON.stringify(searchRequestBody),
					headers,
					"POST"
				);

				if (ucic_search_response.status) return res.ok({
					status: "nok",
					message: "Retrigger failed"
				});

				if (!ucic_search_response.status) {
					const parseData = JSON.parse(ucic_search_response);
					const {customer_id, dob_flag, is_active} = parseData?.data?.[0] || {}
					if (customer_id && !is_active) updateData = {
						status: "Rejected",
						request_type: "UCIC Rejected",
						third_party_response: `UCIC Deactivated - ${customer_id}`
					}
					else if (customer_id && dob_flag && is_active && dob_flag.split("T")[0] === director.ddob) updateData = {
						status: "Approved",
						request_type: "UCIC Created",
						refrence_no: customer_id
					}
					if (updateData) {
						await Director.updateOne({id: director_id}).set({additional_cust_id: customer_id});
						await LoanPreFetch.updateOne({director_id: director_id, loan_id: loan_id}).set(updateData).fetch();

						return res.ok({
							status: "ok",
							message: "Retriggered successfully"
						});
					}
				}

				const reqData = {
					white_label_id: loan_request_data.white_label_id,
					director_id: director_id,
					loan_id: loan_id
				};
				method = "POST";
				url = sails.config.ucic_docs_movement;
				await sails.helpers.sailstrigger(url, JSON.stringify(reqData), "", method);
				const retriggerRecord = await LoanPreFetch.updateOne({director_id: director_id, loan_id: loan_id}).set({
					status: "Approved",
					request_type: "Update Approved"
				}).fetch();

				if (retriggerRecord) {
					const body = {
						director_id: director_id,
						loan_id: loan_id
					};
					const header = {"content-type": "application/json"};
					let createCustomerResponse = await sails.helpers.sailstrigger(
						sails.config.createNewUcicCustomer,
						JSON.stringify(body),
						header,
						"POST"
					);

					if (!(createCustomerResponse.status)) {
						createCustomerResponse = JSON.parse(createCustomerResponse);
					}
					if (createCustomerResponse.status && createCustomerResponse.status == "ok") {
						return res.ok({
							status: "ok",
							message: "Retriggered successfully"
						});
					}
				}

				return res.ok({
					status: "nok",
					message: "Retrigger failed"
				});
			}

			return res.ok({
				status: "ok",
				message: "Data updated",
				loan_pre_fetch_data: loan_prefetchCreateOrUpdate
			});
		}

		// users_data = await UsersRd.findOne({id: business_details.userid});
		// product_details = await LoanProductsRd.findOne({id: loan_data.loan_product_id}).select([
		//     "product"
		// ]);

		// businesstype = await BusinessTypeRd.findOne({id: business_details.businesstype}).select([
		//     "TypeName"
		// ]);
		// gstdata = await GstMaster.find({business_id, gst_no: business_details.gstin});
		// company_master_data = await CompanyMasterDataRd.findOne({
		//     CORPORATE_IDENTIFICATION_NUMBER: business_details.corporateid
		// });
		// ekyc_data = await EkycResponse.find({ref_id: business_id});
		// director_data = await DirectorRd.find({business: business_id});
		// director_data.forEach(async (director) => {
		//     director.income_data = await IncomeDataRd.findOne({director_id: director.id});
		//     director.document_details = await LoanDocumentDetailsRd.find({loan_id: loan_data.id, did: director.id});
		//     director.employment_details = await EmploymentDetailsRd.findOne({director_id: director.id});
		// })
		// loan_document_data = await LoanDocumentRd.find({business_id});
		// loan_additional_data = await LoanAdditionalDataRd.findOne({loan_id: loan_data.id});
		// imd_details = await IMDDetailsRd.findOne({loan_id: loan_data.id});
		// liability_details = await LoanFinancialsRd.find({
		//     business_id,
		//     loan_id: loan_data.id,
		//     fin_type: ["Outstanding Loans", "Others"]
		// });
		// loan_assets_data = await LoanAssetsRd.find({
		//     business_id,
		//     loan_id: loan_data.loan_id
		// });
		// assetsAdditionalRecord = await AssetsAdditional.find({loan_id: loan_data.id});
		// business_mapping_data = await BusinessMappingRd.find({parent_id: business_id});
		// share_holder_data = await BusinessShareholderRd.find({businessID: business_id});
		// bank_details = await LoanFinancialsRd.find({business_id, fin_type: ["Bank Account"]});
		// bank_details.forEach(async (bankdata) => {
		//     bankdata.bank_master_data = await BankMasterRd.findOne({id: bankdata.bank_id}).select([
		//         "bankname",
		//         "status"
		//     ]);
		// });
		// banktblData = await BanktblRd.findOne({id: loan_data.branch_id}).select(["ref_id", "branch"]);
		// loan_reference_Data = await LoanReferencesRd.find({loan_id: loan_data.id});
		// poa_data = await PoaDetailsRd.find({loan_id: loan_data.id});
		// trackData = await MisActivityRd.find({loan_id: loan_data.id}).select("onboarding_track");

		// updated_data = {
		//     loan_data, business_data, users_data, product_details, businesstype, gstdata, business_address_data, company_master_data, director_data, ekyc_data, loan_document_data, loan_additional_data, imd_details, liability_details, loan_assets_data, assetsAdditionalRecord, business_mapping_data, share_holder_data, bank_details, banktblData, loan_reference_Data, poa_data, trackData
		// };
	},

	industry_list: async function (req, res) {
		data = [];
		const industry_data = await BusinessIndustryRd.find().select(["IndustryName", "subindustry"]),
			industry_list = await getDistintIndustryRecords(industry_data);
		status = (industry_list.length > 0) ? "ok" : "nok";
		message = (industry_list.length > 0) ? "Industry List fetched successfully" : "Industry List not fetched";
		return res.ok({
			status,
			message,
			data: industry_list
		});
	},
	sub_industry_list: async function (req, res) {
		let {IndustryName, id} = req.allParams();
		if (!id && !IndustryName) {
			// sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let subindustry, message, status;
		if (id) {
			const industry = await BusinessIndustryRd.findOne({id}).select("IndustryName");
			IndustryName = industry.IndustryName;
		} else {
			IndustryName = IndustryName;
		}
		subindustry = await BusinessIndustryRd.find({IndustryName}).select("subindustry");
		message = (subindustry.length > 0 && subindustry[0].subindustry != null) ? "Sub Industry List fetched successfully" : "Sub Industry List not fetched";
		status = (subindustry.length > 0 && subindustry[0].subindustry != null) ? "ok" : "nok";

		return res.ok({
			status,
			message,
			data: subindustry
		});

	},
	accept_reject: async function (req, res) {
		const {status, loan_ref_id, loanprefetch_id, comments, director_id} = req.allParams();

		params = {status, loan_ref_id, loanprefetch_id};
		fields = ["loan_ref_id", "status", "loanprefetch_id"];
		missing = await reqParams.fn(params, fields);
		if (!status || !loan_ref_id || !loanprefetch_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_request_data = await LoanrequestRd.findOne({loan_ref_id}).select("remarks");
		let updated_remarks, request_type, remarks_data = {};
		const third_party_response = status.toLowerCase() == "accept" ? "Third party API call is pending" : null;
		if (status.toLowerCase() == "reject") request_type = "Update Rejected"; else request_type = "Update Approved"
		const newStatus = status.toLowerCase() == "accept" ? "Approved" : "Rejected";
		let datetime = await sails.helpers.dateTime();
		datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
		if (comments) {
			const remarks = {
				userId: req.user.id,
				type: "Comments",
				message: comments,
				director_id: director_id,
				assigned_from: "accept_or_reject"
			};
			if (loan_request_data.remarks && loan_request_data.remarks != "") {
				remarks_data = JSON.parse(loan_request_data.remarks);
				remarks_data[datetime] = remarks;
			} else {
				remarks_data[datetime] = remarks;
			}
			updated_remarks = await Loanrequest.updateOne({loan_ref_id}).set({remarks: JSON.stringify(remarks_data)});
		}
		const loan_pre_fetch_data = await LoanPreFetch.updateOne({id: loanprefetch_id, director_id}).set({
			status: newStatus,
			request_type,
			third_party_response,
			updated_at: datetime
		});

		if (loan_pre_fetch_data) {
			return res.ok({
				status: "ok",
				ucic_status: loan_pre_fetch_data.status,
				third_party_response: loan_pre_fetch_data.third_party_response,
				remarks: remarks_data || ""
			});
		}
		else {
			return res.ok({
				status: "nok",
				message: "Could not update status"
			});
		}
	},
	edi_fetch: async function (req, res) {
		const {loanprefetch_id, loan_id, director_id} = req.allParams();

		params = {loanprefetch_id, loan_id};
		fields = ["loanprefetch_id", "loan_id"];
		missing = await reqParams.fn(params, fields);
		if (!loanprefetch_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let remarks = [];
		const loan_data = await Loanrequest.findOne({id: loan_id}),
			bank_data = await BanktblRd.findOne({id: loan_data.branch_id}).select(["bank", "ifsc", "branch"]),
			edi_data = await LoanPreFetchRd.findOne({id: loanprefetch_id}),
			document_details = await LenderDocumentRd.find({loan: loan_id, status: "active"}),
			loan_request_data = await LoanrequestRd.findOne({id: loan_id}).select("remarks");
		let parseData = loan_request_data && loan_request_data.remarks ? JSON.parse(loan_request_data.remarks) : "";
		for (const key in parseData) {
			if (typeof parseData[key] === "object") {
				parseData[key].datetime = key;
			}
		}
		parseData = parseData ? Object.values(parseData) : [];
		if (parseData.length > 0) {
			for (let i = 0; i < parseData.length; i++) {
				if (parseData[i] && parseData[i].assigned_from === "accept_or_reject" && parseData[i].director_id == director_id) {
					remarks.push(parseData[i]);
				}
			}
		}
		remarks = remarks.length > 0 ? [remarks[remarks.length - 1]] : [];

		if (edi_data) {
			edi_data.initial_json = JSON.parse(edi_data.initial_json);
			edi_data.updated_json = JSON.parse(edi_data.updated_json);

			return res.ok({
				status: "ok",
				data: {edi_data, document_details, bank_data, remarks}
			});
		}
		else {
			return res.badRequest({
				status: "nok",
				message: "No records found for given id"
			});
		}
	},
	JSON_compare: async function (req, res) {
		const loan_id = req.param("loan_id"),
			director_id = req.param("director_id");

		if (!loan_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_pre_fetch_data = await LoanPreFetch.findOne({loan_id, director_id});
		if (!loan_pre_fetch_data) {
			return res.badRequest({
				status: "nok",
				message: "No Data found for this loan ID."
			});
		}
		const arrayRes = [],
			// for (const loan_data of loan_pre_fetch_data) {
			obj1 = JSON.parse(loan_pre_fetch_data.initial_json) || null,
			obj2 = JSON.parse(loan_pre_fetch_data.updated_json) || null,
			dir_data = {}, incomeData = {}, employmentData = {};
		if (obj1 && obj2) {
			// if (obj1.business_data && obj2.business_data) {
			// 	if (String(obj1.business_data.business_email).trim().toLowerCase() != String(obj2.business_data.business_email).trim().toLowerCase()) {business_data.business_email = [obj1.business_data.business_email, obj2.business_data.business_email];}

			// 	if (String(obj1.business_data.businessname).trim().toLowerCase() != String(obj2.business_data.businessname).trim().toLowerCase()) {business_data.business_name = [obj1.business_data.businessname, obj2.business_data.businessname];}

			// 	if (String(obj1.business_data.contactno).trim().toLowerCase() != String(obj2.business_data.contactno).trim().toLowerCase()) {business_data.contact_no = [obj1.business_data.contactno, obj2.business_data.contactno];}

			// 	if (String(obj1.business_data.title).trim().toLowerCase() != String(obj2.business_data.title).trim().toLowerCase()) {business_data.title = [obj1.business_data.title, obj2.business_data.title];}

			// 	if (String(obj1.business_data.first_name).trim().toLowerCase() != String(obj2.business_data.first_name).trim().toLowerCase()) {business_data.first_name = [obj1.business_data.first_name, obj2.business_data.first_name];}

			// 	if (String(obj1.business_data.last_name).trim().toLowerCase() != String(obj2.business_data.last_name).trim().toLowerCase()) {business_data.last_name = [obj1.business_data.last_name, obj2.business_data.last_name];}
			// }
			// if (obj1.business_address_data && obj2.business_address_data) {

			// 	for (let i = 0; i < obj1.business_address_data.length; i++) {
			// 		const addressObj = {};
			// 		if (String(obj1.business_address_data[i].city).trim().toLowerCase() != String(obj2.business_address_data[i].city).trim().toLowerCase()) {addressObj.city = [obj1.business_address_data[i].city, obj2.business_address_data[i].city];}

			// 		if (String(obj1.business_address_data[i].line1).trim().toLowerCase() != String(obj2.business_address_data[i].line1).trim().toLowerCase()) {addressObj.business_address_line_1 = [obj1.business_address_data[i].line1, obj2.business_address_data[i].line1];}

			// 		if (String(obj1.business_address_data[i].line2).trim().toLowerCase() != String(obj2.business_address_data[i].line2).trim().toLowerCase()) {addressObj.business_address_line_2 = [obj1.business_address_data[i].line2, obj2.business_address_data[i].line2];}

			// 		if (String(obj1.business_address_data[i].locality).trim().toLowerCase() != String(obj2.business_address_data[i].locality).trim().toLowerCase()) {addressObj.locality = [obj1.business_address_data[i].locality, obj2.business_address_data[i].locality];}

			// 		if (String(obj1.business_address_data[i].pincode).trim().toLowerCase() != String(obj2.business_address_data[i].pincode).trim().toLowerCase()) {addressObj.pincode = [obj1.business_address_data[i].pincode, obj2.business_address_data[i].pincode];}

			// 		if (String(obj1.business_address_data[i].state).trim().toLowerCase() != String(obj2.business_address_data[i].state).trim().toLowerCase()) {addressObj.state = [obj1.business_address_data[i].state, obj2.business_address_data[i].state];}

			// 		business_address_data.push(addressObj);
			// 	}
			// }
			if (obj1.director_data && obj2.director_data) {

				Object.keys(obj1.director_data).forEach(data => {
					if (obj1.director_data[data] == null || obj1.director_data[data] == "") obj1.director_data[data] = ""
				});

				Object.keys(obj2.director_data).forEach(data => {
					if (obj2.director_data[data] == null || obj2.director_data[data] == "") obj2.director_data[data] = ""
				});

				if (String(obj1.director_data.address1).trim().toLowerCase() != String(obj2.director_data.address1).trim().toLowerCase()) {dir_data.address_line_1 = [obj1.director_data.address1, obj2.director_data.address1];}

				if (String(obj1.director_data.address2).trim().toLowerCase() != String(obj2.director_data.address2).trim().toLowerCase()) {dir_data.address_line_2 = [obj1.director_data.address2, obj2.director_data.address2];}

				if (String(obj1.director_data.country).trim().toLowerCase() != String(obj2.director_data.country).trim().toLowerCase()) {dir_data.country = [obj1.director_data.country, obj2.director_data.country];}

				// if (String(obj1.director_data.customer_id).trim().toLowerCase() != String(obj2.director_data.customer_id).trim().toLowerCase()) {dir_data.customer_id = [obj1.director_data.customer_id, obj2.director_data.customer_id];}

				if (String(obj1.director_data.daadhaar).trim().toLowerCase() != String(obj2.director_data.daadhaar).trim().toLowerCase()) {dir_data.aadhaar_number = [obj1.director_data.daadhaar, obj2.director_data.daadhaar];}

				if (String(obj1.director_data.ddlNumber).trim().toLowerCase() != String(obj2.director_data.ddlNumber).trim().toLowerCase()) {dir_data.dl_number = [obj1.director_data.ddlNumber, obj2.director_data.ddlNumber];}

				if (String(obj1.director_data.ddob).trim().toLowerCase() != String(obj2.director_data.ddob).trim().toLowerCase()) {dir_data.DOB = [obj1.director_data.ddob, obj2.director_data.ddob];}

				if (String(obj1.director_data.demail).trim().toLowerCase() != String(obj2.director_data.demail).trim().toLowerCase()) {dir_data.email = [obj1.director_data.demail, obj2.director_data.demail];}

				if (String(obj1.director_data.dfirstname).trim().toLowerCase() != String(obj2.director_data.dfirstname).trim().toLowerCase()) {dir_data.first_name = [obj1.director_data.dfirstname, obj2.director_data.dfirstname];}

				if (String(obj1.director_data.dlastname).trim().toLowerCase() != String(obj2.director_data.dlastname).trim().toLowerCase()) {dir_data.last_name = [obj1.director_data.dlastname, obj2.director_data.dlastname];}

				if (String(obj1.director_data.dpancard).trim().toLowerCase() != String(obj2.director_data.dpancard).trim().toLowerCase()) {dir_data.PAN_No = [obj1.director_data.dpancard, obj2.director_data.dpancard];}

				if (String(obj1.director_data.dpassport).trim().toLowerCase() != String(obj2.director_data.dpassport).trim().toLowerCase()) {dir_data.passport = [obj1.director_data.dpassport, obj2.director_data.dpassport];}

				if (String(obj1.director_data.dvoterid).trim().toLowerCase() != String(obj2.director_data.dvoterid).trim().toLowerCase()) {dir_data.voter_id = [obj1.director_data.dvoterid, obj2.director_data.dvoterid];}

				if (String(obj1.director_data.gender).trim().toLowerCase() != String(obj2.director_data.gender).trim().toLowerCase()) {dir_data.gender = [obj1.director_data.gender, obj2.director_data.gender];}

				if (String(obj1.director_data.marital_status).trim().toLowerCase() != String(obj2.director_data.marital_status).trim().toLowerCase()) {dir_data.marital_status = [obj1.director_data.marital_status, obj2.director_data.marital_status];}

				if (String(obj1.director_data.middle_name).trim().toLowerCase() != String(obj2.director_data.middle_name).trim().toLowerCase()) {dir_data.middle_name = [obj1.director_data.middle_name, obj2.director_data.middle_name];}

				if (String(obj1.director_data.mother_name).trim().toLowerCase() != String(obj2.director_data.mother_name).trim().toLowerCase()) {dir_data.mother_name = [obj1.director_data.mother_name, obj2.director_data.mother_name];}

				if (String(obj1.director_data.mother_title).trim().toLowerCase() != String(obj2.director_data.mother_title).trim().toLowerCase()) {dir_data.mother_title = [obj1.director_data.mother_title, obj2.director_data.mother_title];}

				if (String(obj1.director_data.permanent_address1).trim().toLowerCase() != String(obj2.director_data.permanent_address1).trim().toLowerCase()) {dir_data.permanent_address_1 = [obj1.director_data.permanent_address1, obj2.director_data.permanent_address1];}

				if (String(obj1.director_data.permanent_address2).trim().toLowerCase() != String(obj2.director_data.permanent_address2).trim().toLowerCase()) {dir_data.permanent_address_2 = [obj1.director_data.permanent_address2, obj2.director_data.permanent_address2];}

				if (String(obj1.director_data.permanent_city).trim().toLowerCase() != String(obj2.director_data.permanent_city).trim().toLowerCase()) {dir_data.permanent_city = [obj1.director_data.permanent_city, obj2.director_data.permanent_city];}

				if (String(obj1.director_data.permanent_locality).trim().toLowerCase() != String(obj2.director_data.permanent_locality).trim().toLowerCase()) {dir_data.permanent_locality = [obj1.director_data.permanent_locality, obj2.director_data.permanent_locality];}

				if (String(obj1.director_data.permanent_pincode).trim().toLowerCase() != String(obj2.director_data.permanent_pincode).trim().toLowerCase()) {dir_data.permanent_pincode = [obj1.director_data.permanent_pincode, obj2.director_data.permanent_pincode];}

				if (String(obj1.director_data.permanent_state).trim().toLowerCase() != String(obj2.director_data.permanent_state).trim().toLowerCase()) {dir_data.permanent_state = [obj1.director_data.permanent_state, obj2.director_data.permanent_state];}

				if (String(obj1.director_data.permanent_residential_type).trim().toLowerCase() != String(obj2.director_data.permanent_residential_type).trim().toLowerCase()) {dir_data.permanent_residential_type = [obj1.director_data.permanent_residential_type, obj2.director_data.permanent_residential_type];}

				if (String(obj1.director_data.pincode).trim().toLowerCase() != String(obj2.director_data.pincode).trim().toLowerCase()) {dir_data.pincode = [obj1.director_data.pincode, obj2.director_data.pincode];}

				if (String(obj1.director_data.residential_type).trim().toLowerCase() != String(obj2.director_data.residential_type).trim().toLowerCase()) {dir_data.residential_type = [obj1.director_data.residential_type, obj2.director_data.residential_type];}

				if (String(obj1.director_data.spouse_last_name).trim().toLowerCase() != String(obj2.director_data.spouse_last_name).trim().toLowerCase()) {dir_data.spouse_last_name = [obj1.director_data.spouse_last_name, obj2.director_data.spouse_last_name];}

				if (String(obj1.director_data.spouse_name).trim().toLowerCase() != String(obj2.director_data.spouse_name).trim().toLowerCase()) {dir_data.spouse_name = [obj1.director_data.spouse_name, obj2.director_data.spouse_name];}

				if (String(obj1.director_data.state).trim().toLowerCase() != String(obj2.director_data.state).trim().toLowerCase()) {dir_data.state = [obj1.director_data.state, obj2.director_data.state];}

				if (String(obj1.director_data.title).trim().toLowerCase() != String(obj2.director_data.title).trim().toLowerCase()) {dir_data.title = [obj1.director_data.title, obj2.director_data.title];}
			}
			if (obj1.income_data && obj2.income_data) {

				if (obj1.income_data.income_range == null || obj1.income_data.income_range == "") obj1.income_data.income_range = "";
				if (obj2.income_data.income_range == null || obj2.income_data.income_range == "") obj2.income_data.income_range = "";

				if (String(obj1.income_data.income_range).trim().toLowerCase() != String(obj2.income_data.income_range).trim().toLowerCase()) {incomeData.income_range = [obj1.income_data.income_range, obj2.income_data.income_range];}
			}

			if (obj1.employment_data && obj2.employment_data) {

				Object.keys(obj1.employment_data).forEach(data => {
					if (obj1.employment_data[data] == null || obj1.employment_data[data] == "") obj1.employment_data[data] = ""
				});

				Object.keys(obj2.employment_data).forEach(data => {
					if (obj2.employment_data[data] == null || obj2.employment_data[data] == "") obj2.employment_data[data] = ""
				});

				if (String(obj1.employment_data.employment_category).trim().toLowerCase() != String(obj2.employment_data.employment_category).trim().toLowerCase()) {employmentData.employment_category = [obj1.employment_data.employment_category, obj2.employment_data.employment_category];}

				if (String(obj1.employment_data.organization_type).trim().toLowerCase() != String(obj2.employment_data.organization_type).trim().toLowerCase()) {employmentData.organization_type = [obj1.employment_data.organization_type, obj2.employment_data.organization_type];}

				if (String(obj1.employment_data.employee_number).trim().toLowerCase() != String(obj2.employment_data.employee_number).trim().toLowerCase()) {employmentData.employee_number = [obj1.employment_data.employee_number, obj2.employment_data.employee_number];}
			}
			arrayRes.push({dir_data, incomeData, employment_data: employmentData});
		}
		// const obj1Values = Object.values(obj1);
		// const obj2Values = Object.values(obj2)
		// if (Object.keys(obj1).length === Object.keys(obj2).length){
		//     for (let i = 0; i < obj1Values.length; i ++){
		//        if (obj1Values[i])
		//     }
		// }
		// for (let i = 0; i < obj1Keys.length; i ++){
		//     console.log(obj1[obj1Keys[i]] , obj2[obj1Keys[i]]);
		//     if (obj1[obj1Keys[i]] === obj2[obj1Keys[i]]){
		//         console.log(obj1.obj1Keys[i]);
		//     }
		// }
		// }
		return res.ok({
			status: "ok",
			message: "",
			data: arrayRes
		});
		//    console.log(loan_pre_fetch_data[0].initial_json === loan_pre_fetch_data[0].updated_json);
		//console.log(_.isEqual(JSON.parse(loan_pre_fetch_data[0].initial_json), JSON.parse(loan_pre_fetch_data[0].updated_json)));
		//    if (loan_pre_fetch_data.initial_json === loan_pre_fetch_data.updated_json){

		//    }
	},
	dedupe_check: async function (req, res) {
		const {object, isSelectedProductTypeBusiness, isSelectedProductTypeSalaried} = req.allParams();
		if (!object || Object.keys(object).length == 0 || !object.pan_no) {
			return res.badRequest(sails.config.res.missingFields);
		}

		let pan_records, parameterCount, loan_status, obj, product_data, customer_data = [], negative_list, keysToCompare,
			application_data, dedupe_data = [], matchLevel = [];
		const white_label_id = req.user.loggedInWhiteLabelID;

		parameterCount = Number(2);
		// if (white_label_id == sails.config.white_label_id_muthoot || sails.config.white_label_id_muthoot.includes(white_label_id)) parameterCount = Number(2);
		// else parameterCount = Number(2)
		// if (`${isSelectedProductTypeBusiness}` == "true") {
		const business_data = await BusinessRd.find({businesspancardnumber: object.pan_no}).populate("businesstype");
		let business_records = business_data
			.map(obj => {
				const count = [
					object.first_name != "" && String(object.first_name).toLowerCase().trim() == String(obj.businessname).toLowerCase().trim(),
					object.mobile_number != "" && !isNaN(object.mobile_number) && String(object.mobile_number) == String(obj.contactno),
					object.email_id != "" && String(object.email_id).toLowerCase().trim() == String(obj.business_email).toLowerCase().trim(),
					object.date_of_birth != "" && String(object.date_of_birth).replace(/[/\-]/g, "") == String((obj.businessstartdate).split(" ")[0]).replace(/[/\-]/g, ""),
					object.aadhar_number != "" && !isNaN(object.aadhar_number) && String(object.aadhar_number) == String(obj.udyam_number),
				].filter(Boolean).length;
				return count >= parameterCount ? obj : null;
			})
			.filter(obj => obj !== null);

		business_records = business_records.map(pan => {
			const {id, ...rest} = pan;
			return {business: id, ...rest};
		});
		// }
		// else {
		const director_data = await DirectorRd.find({dpancard: object.pan_no});
		let director_records = director_data
			.map(obj => {
				const count = [
					object.first_name != "" && String(object.first_name).toLowerCase().trim() == String(obj.dfirstname).toLowerCase().trim(),
					object.last_name != "" && String(object.last_name).toLowerCase().trim() == String(obj.dlastname).toLowerCase().trim(),
					// object.middle_name != "" && String(object.middle_name).toLowerCase().trim() == String(obj.middle_name).toLowerCase().trim(),
					object.aadhar_number != "" && !isNaN(object.aadhar_number) && String(object.aadhar_number) == String(obj.daadhaar),
					object.mobile_number != "" && !isNaN(object.mobile_number) && String(object.mobile_number) == String(obj.dcontact),
					object.email_id != "" && String(object.email_id).toLowerCase().trim() == String(obj.demail).toLowerCase().trim(),
					object.date_of_birth != "" && String(object.date_of_birth).replace(/[/\-]/g, "") == String(obj.ddob).replace(/[/\-]/g, ""),
					object.ucic != "" && !isNaN(object.ucic) && String(object.ucic) == String(obj.additional_cust_id)
				].filter(Boolean).length;
				return count >= parameterCount ? obj : null;
			})
			.filter(obj => obj !== null);
		// }

		const uniqueBusinessIds = new Set(director_records.map(obj => obj.business));
		const uniqueBusinessRecords = business_records.filter(obj => !uniqueBusinessIds.has(obj.business));
		pan_records = uniqueBusinessRecords.concat(director_records);

		if (pan_records.length == 0) application_data = [];
		else {
			for (element of pan_records) {
				const loan = await LoanrequestRd.findOne({business_id: element.business, white_label_id});
				if (loan && !(loan.loan_status_id == 14 && loan.loan_sub_status_id == 14)) {
					let bank_mapping_data = await LoanBankMappingRd.find({loan_id: loan.id}).sort("id desc").limit(1);
					if (bank_mapping_data.length == 0 || !(bank_mapping_data[0].loan_bank_status == 14 && bank_mapping_data[0].loan_borrower_status == 14)) {
						let loan_status;
						// const bank_data = await BanktblRd.findOne({id: +loan.branch_id}).select(["bank", "ifsc", "branch"]);
						product_data = await LoanProductDetailsRd.find({
							product_id: {contains: loan.loan_product_id},
							white_label_id: loan.white_label_id,
							isActive: "true"
						}).select("basic_details");

						if (loan.loan_status_id == 8 || loan.loan_status_id == 15) loan_status = "Query Raised by NC"
						else {
							loan_status = await NcStatusManageRd.find({
								white_label_id,
								status1: loan.loan_status_id || null,
								status2: loan.loan_sub_status_id || null,
								status3: bank_mapping_data.length > 0 && `${bank_mapping_data[0].loan_bank_status}` !== "0" && bank_mapping_data[0].loan_bank_status !== "" ? bank_mapping_data[0].loan_bank_status : null,
								status4: bank_mapping_data.length > 0 && `${bank_mapping_data[0].loan_borrower_status}` !== "0" && bank_mapping_data[0].loan_borrower_status !== "" ? bank_mapping_data[0].loan_borrower_status : null,
								status6: bank_mapping_data.length > 0 && `${bank_mapping_data[0].meeting_flag}` !== "0" && bank_mapping_data[0].meeting_flag !== "" ? bank_mapping_data[0].meeting_flag : null
							}).select("name");
							loan_status = loan_status.length > 0 ? loan_status[0].name : ""
						}

						let source_data;
						let additional_data = await LoanAdditionalDataRd.find({loan_id: loan.id}).sort("id DESC").limit(1).select("source_codes");
						if (additional_data.length > 0 && additional_data[0].source_codes != null) {
							additional_data = JSON.parse(additional_data[0].source_codes);
							source_data = {
								source: additional_data.loan_origin ? additional_data.loan_origin : "",
								branch: additional_data.branch_id ? additional_data.branch_id : ""
							}
						}

						obj = {
							loan_ref_id: loan.loan_ref_id,
							pan_no: element.dpancard || element.businesspancardnumber || "",
							name: element.businessname || ((element.dfirstname || "") + (element.dfirstname && element.dlastname ? " " : "") + (element.dlastname || "")) || "",
							date_of_birth: element.businessstartdate ? element.businessstartdate.split(" ")[0] : (element.ddob || ""),
							mobile_number: element.dcontact || element.contactno || "",
							email_id: element.demail || element.business_email || "",
							product: product_data.length > 0 && product_data[0].basic_details ? JSON.parse(product_data[0].basic_details).name : "",
							parent_product_id: loan.parent_product_id,
							loan_product_id: product_data.length > 0 ? product_data[0].id : "",
							income_type: (element.businesstype && element.businesstype.TypeName) ? element.businesstype.TypeName : (element.income_type || ""),
							loan_amount: loan.loan_amount,
							source_data: source_data || "",
							// branch: bank_data || "",
							stage: loan_status,
							first_name: element.businessname || element.dfirstname || "",
							// middle_name: element.middle_name || "",
							last_name: element.dlastname || "",
							customer_type: element.dpancard ? (element.isApplicant == 1 ? "Applicant" : "Co Applicant") : "Applicant",
							ucic_no: element.additional_cust_id || ""
						};

						if (element.businesspancardnumber) keysToCompare = ["date_of_birth", "email_id", "mobile_number", "pan_no", "first_name"];
						else keysToCompare = ["date_of_birth", "email_id", "mobile_number", "pan_no", "first_name", "last_name"];

						const result = matchParameters(object, keysToCompare, obj);
						customer_data.push(result);
					}
				}
			}
			application_data = customer_data.map(({customer_type, ucic_no, ...rest}) => rest);
		}

		const body = {
			MobileNumber: object.mobile_number,
			IdNo: object.pan_no
		}
		const header = {
			"content-type": "application/json",
			Authorization: `${sails.config.ucicAuthToken}`,
		}
		let ucic_search_response = await sails.helpers.sailstrigger(
			sails.config.ucic_search_url,
			JSON.stringify(body),
			header,
			"POST"
		);
		ucic_search_response = JSON.parse(ucic_search_response).data;

		if (ucic_search_response && ucic_search_response.UcicNoList) {
			if (Array.isArray(ucic_search_response.UcicNoList)) ucic_search_response.UcicNoList.forEach(data => {
				const obj = {
					name: data.Name,
					date_of_birth: data.DOB.split('T')[0],
					mobile_number: data.MobileNumber,
					pan_no: data.IDNo,
					ucic_no: data.UCIC
				}
				customer_data.push(obj)
			})
			else if (typeof ucic_search_response.UcicNoList === 'object') {
				const data = ucic_search_response.UcicNoList;
				const obj = {
					name: data.Name,
					date_of_birth: data.DOB.split('T')[0],
					mobile_number: data.MobileNumber,
					pan_no: data.IDNo,
					ucic_no: data.UCIC
				}
				customer_data.push(obj)
			}
		}

		let negative_list_url = sails.config.negative_list_url + '?cin=' + object.pan_no + '&company_name=' + object.first_name;
		let negative_list_response = await sails.helpers.sailstrigger(negative_list_url, "", "", "GET");
		negative_list_response = JSON.parse(negative_list_response);
		if (negative_list_response.status != "nok") negative_list = negative_list_response.data;
		else negative_list = [];

		matchLevel.push({
			name: "Customer Match",
			data: customer_data
		});

		matchLevel.push({
			name: "Application Match",
			data: application_data
		});

		matchLevel.push({
			name: "Negative List Match",
			data: negative_list
		});

		formJSONTableResponse("Identification", matchLevel, dedupe_data)

		return res.ok({
			status: "ok",
			data: dedupe_data
		});
	},
	prefetch_status_fetch: async function (req, res) {
		const loan_prefetch_id = req.param("loan_prefetch_id"),
			loan_id = req.param("loan_id");
		let data;
		if (!loan_prefetch_id || !loan_id) {
			return res.badRequest({
				status: "nok",
				message: "loan_prefetch_id or loan_id is missing."
			});
		}
		const loan_prefetchData = await LoanPreFetchRd.findOne({
			id: loan_prefetch_id,
			loan_id: loan_id
		}).select("third_party_response");
		if (loan_prefetchData && loan_prefetchData.third_party_response) {
			const {ucic_response} = JSON.parse(loan_prefetchData.third_party_response);
			data = ucic_response;
		} else {
			data = {};
		}
		return res.ok({
			status: "ok",
			message: "Status fetched successfully",
			data
		});

	}
};

const getDistintIndustryRecords = async function (industry_list) {
	const industry_type = [];
	industry_list.forEach(element => {
		const fetchValueExist = industry_type.some(o => o.IndustryName == element.IndustryName);
		if (fetchValueExist === false) {
			industry_type.push(element);
		}
	});
	const filteredIndustry = industry_type.map((industry) => {
		const subIndustryList = industry_list.filter((j) => {
			return industry.IndustryName === j.IndustryName && j.subindustry;
		});
		return {...industry, subindustry: subIndustryList};
	});
	return filteredIndustry;
};

function matchParameters(object, keysToCompare, item) {
	let newObj = {},
		matchingCount = 0;
	keysToCompare.forEach((key) => {
		// if (object[key] != "" && item[key] != "") {
		if (key === "date_of_birth") {
			newObj[key] = (object[key].replace(/[/\-]/g, "") === item[key].replace(/[/\-]/g, ""));
			if (newObj[key]) {matchingCount++;}
		}
		else {
			newObj[key] = (`${object[key]}`.toLowerCase().replace(/\s/g, "") == `${item[key]}`.toLowerCase().replace(/\s/g, ""));
			if (newObj[key]) {matchingCount++;}
		}
		// }
	});
	item.parameters = newObj;
	if (!keysToCompare.includes("last_name") && item.parameters.hasOwnProperty("first_name") && item.parameters.hasOwnProperty("date_of_birth")) {
		item.parameters.business_name = item.parameters.first_name;
		item.parameters.date_of_incorporation = item.parameters.date_of_birth;
		delete item.parameters.first_name
		delete item.parameters.date_of_birth
	}
	const percentage = (matchingCount / keysToCompare.length) * 100;
	item.match = Math.ceil(percentage) + "%";
	return item;
};

function formJSONTableResponse(header, data, dedupe_array) {
	dedupe_array.push({
		headerName: header,
		id: header,
		matchLevel: data
	})
	return dedupe_array;
};
