/**
 * FederalController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const reqParams = require("../helpers/req-params");

const getCVCEJSON = (element) => {

	const loan_jsons = {
		"accessories_cost": element.accessories_cost || "",
		"amount_finance": element.amount_finance || "",
		"body_cost": element.body_cost || "",
		"chassis_numer": element.chassis_numer || "",
		"cost_vehicle_chassis": element.cost_vehicle_chassis || "",
		"dealer_address": element.dealer_address || "",
		"dealer_gst": element.dealer_gst || "",
		"dealer_name": element.dealer_name || "",
		"emi": element.emi || "",
		"engine_number": element.engine_number || "",
		"expiry_date": element.expiry_date || "",
		"finance_requirement": element.finance_requirement || "",
		"full_model_code": element.full_model_code || "",
		"gst_invoice_cost": element.gst_invoice_cost || "",
		"hirer": element.hirer || "",
		"hyp_details": element.hyp_details || "",
		"idv": element.idv || "",
		"insurance_company_name": element.insurance_company_name || "",
		"insurance_premium": element.insurance_premium || "",
		"invoice_cost": element.invoice_cost || "",
		"invoice_number": element.invoice_number || "",
		"make": element.make || "",
		"manufacturer_name": element.manufacturer_name || "",
		"nature_of_relationship_financing_bank": element.nature_of_relationship_financing_bank || "",
		"nature_of_relationship_other_bank": element.nature_of_relationship_other_bank || "",
		"relationship_nature": element.relationship_nature || "",
		"relationship_with_financing_bank": element.relationship_with_financing_bank || "",
		"relationship_with_other_bank": element.relationship_with_other_bank || "",
		"road_tax_registration_cost": element.road_tax_registration_cost || "",
		"roi": element.roi || "",
		"supply_place": element.supply_place || "",
		"tcs": element.tcs || "",
		"tenure": element.tenure || "",
		"tonnage_category": element.tonnage_category || "",
		"total_amount": element.total_amount || "",
		"total_cost": element.total_cost || "",
		"total_gst_invoice_cost": element.total_gst_invoice_cost || "",
		"total_road_cost": element.total_road_cost || "",
		"type_of_funding": element.type_of_funding || "",
		"vehicle_model": element.vehicle_model || ""

	};
	return loan_jsons;

};

module.exports = {
	liability_details: async function (req, res) {
		const {data: reqData, loan_id, business_id, director_id, limit_type, section_id} = req.allParams();
		params = {...reqData.liability_details, ...reqData.emi_details, loan_id, business_id};
		fields = ["liability_details", "loan_id", "emi_details", "business_id"];
		missing = await reqParams.fn(params, fields);
		if ((!reqData.liability_details && !reqData.emi_details) || !loan_id || !business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if ((reqData.emi_details && reqData.emi_details.length === 0) &&
			(reqData.liability_details && reqData.liability_details.length === 0 &&
				Object.keys(reqData.liability_details[0]).length === 0)) {
			return res.badRequest({
				status: "nok",
				message: "Liability details is missing or EMI details are missing"
			});
		}
		let message;
		const loanFinancial_data = [];
		trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
		loanRequestData = await LoanrequestRd.findOne({id: loan_id}).select(["loan_product_id", "parent_product_id"]);
		if (sails.config.muthoot_product_list.includes(loanRequestData.loan_product_id) === true) {
			loan_financial_details = {
				loan_id: loan_id,
				business_id: business_id,
				limit_type: "Fixed",
				sanction_drawing_limit: {},
				director_id: director_id,
				fin_type: "Outstanding Loans",
				bank_id: 0,
				emi_details: JSON.stringify({...reqData.emi_details, ...reqData}),
				ints: await sails.helpers.dateTime()
			};
			if (reqData.id) {
				loan_financial_data = await LoanFinancials.update({id: reqData.id}).set(loan_financial_details).fetch();
				message = "Data updated successfully";
				loanFinancial_data.push(loan_financial_data[0]);
			} else {
				loan_financial_data = await LoanFinancials.create(loan_financial_details).fetch();
				message = "Data inserted successfully";
				loanFinancial_data.push(loan_financial_data);
			}
		} else {
			for (const element of reqData.liability_details) {
				let emi_details_json,
					loan_type,
					financial_institution,
					loan_start_date,
					remaining_loan_tenure,
					outstanding_loan_amount;
				if (element.liabilities_type === "Others") {
					emi_details_json = {
						description: element.description,
						liability_amount: element.liability_amount,
						emi_amount: element.liability_amount,
						bank_name: element.bank_name,
						...reqData
					};
				} else if (element.liabilities_type === "Rental") {
					emi_details_json = {
						description: element.description,
						liability_amount: element.liability_amount,
						...reqData
					};
				} else if (element.liabilities_type === "Credit Card") {
					emi_details_json = {
						description: element.description || "",
						...reqData
					};
				} else {
					emi_details_json = {
						description: element.description,
						total_loan_amount: element.total_loan_amount,
						total_tenure: element.total_tenure,
						emi_amount: element.emi_amount,
						bank_name: element.bank_name,
						...reqData
					};
					loan_type = element.loan_type;
					financial_institution = element.financial_institution;
					loan_start_date = element.loan_start_date;
					remaining_loan_tenure = element.remaining_loan_tenure;
					outstanding_loan_amount = element.outstanding_loan_amount;
				}
				loan_financial_details = {
					loan_id: loan_id,
					business_id: business_id,
					limit_type: limit_type || "Fixed",
					sanction_drawing_limit: {},
					director_id: element.liabilities_for || director_id,
					fin_type: element.liabilities_type || "Outstanding Loans",
					loan_sub_type: loan_type,
					bank_id: financial_institution || 0,
					outstanding_start_date: loan_start_date || "",
					remaining_loan_tenure: remaining_loan_tenure,
					outstanding_balance: outstanding_loan_amount,
					emi_details: JSON.stringify(emi_details_json),
					ints: await sails.helpers.dateTime(),
					loan_acc_no: element.loan_acc_no,
					issuing_bank: element.issuing_bank,
					credit_card_no: element.credit_card_no
				};
				if (element.id) {
					loan_financial_data = await LoanFinancials.update({id: element.id})
						.set(loan_financial_details).fetch();
					message = "Data updated successfully";
					loanFinancial_data.push(loan_financial_data[0]);
				} else {
					loan_financial_data = await LoanFinancials.create(loan_financial_details).fetch();
					message = "Data inserted successfully";
					loanFinancial_data.push(loan_financial_data);
				}
			}
		}
		return res.ok({
			status: "ok",
			message,
			data: loanFinancial_data
		});
	},
	assets_details: async function (req, res) {
		const {data: reqData, business_id, loan_id, section_id, property_type} = req.allParams();
		params = {...reqData.assets_details, loan_id, business_id};
		fields = ["assets_details", "loan_id", "business_id"];
		missing = await reqParams.fn(params, fields);
		if (!reqData.assets_details || reqData.assets_details.length === 0 || !loan_id || !business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (Object.keys(reqData.assets_details[0]).length == 0) {
			return res.badRequest({
				status: "nok",
				message: "Assets details is missing or cannot be empty array"
			});
		}
		let values, loan_jsons, message;
		const assets_data = [];
		for (const element of reqData.assets_details) {
			if (element.asset_type == 74) {
				loan_jsons = {
					description: element.description
				};
				values = element.amount;
			} else if (element.asset_type == 71) {
				values = element.estimated_value;
				loan_jsons = {
					property_description: element.property_description
				};
			} else if (element.asset_type == 75 || element.asset_type == 76) {
				//condition for CV and CE products to update the json

				loan_jsons = getCVCEJSON(element);

			}
			else {
				values = element.amount;
			}
			const business_address_data = await BusinessaddressRd.find({bid: business_id});
			loan_assets_details = {
				loan_id,
				business_id,
				property_type: property_type || "Owned",
				director_id: element.assets_for,
				loan_asset_type_id: element.asset_type,
				value: values,
				survey_no: element.property_survey_umber,
				address1: element.address_line1,
				address2: element.address_line2,
				name_landmark: element.landmark,
				loan_json: {...loan_jsons, ...reqData},
				ints: await sails.helpers.dateTime(),
				pincode: element.pincode,
				city: element.city,
				state: element.state
			};
			if (element.id) {
				loan_assets_data = await LoanAssets.update({id: element.id}).set(loan_assets_details).fetch();
				assets_data.push(loan_assets_data[0]);
				message = "Data updated successfully";
				// return res.ok({
				// 	status: "ok",
				// 	message: "Data updated successfully",
				// 	data: {
				// 		loan_assets_data[0]
				// 	}
				// });
			} else {
				loan_assets_data = await LoanAssets.create(loan_assets_details).fetch();
				trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
				assets_data.push(loan_assets_data);
				message = "Data inserted successfully";
				// return res.ok({
				// 	status: "ok",
				// 	message: "Data inserted successfully",
				// 	data: {
				// 		loan_assets_data
				// 	}
				// });
			}
		}
		return res.ok({
			status: "ok",
			message,
			data: assets_data
		});
	},
	liability_fetch: async function (req, res) {
		const {loan_ref_id, director_id, business_id} = req.allParams();

		params = {loan_ref_id, business_id, director_id};
		fields = ["business_id", "loan_ref_id"];
		missing = await reqParams.fn(params, fields);

		if (!business_id || !loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanrequest_records = await LoanrequestRd.findOne({
			loan_ref_id,
			business_id
		});

		if (loanrequest_records) {
			const loanfinancials_records = await LoanFinancialsRd.find({
				business_id,
				loan_id: loanrequest_records.loan_id,
				fin_type: sails.config.fin_type
			});
			const declaration_details = await LoanAdditionalDataRd.findOne({loan_id: loanrequest_records.id}).select("credit_limit_applied");
			const loan_pre_fetch_data = await LoanPreFetchRd.find({loan_id: loanrequest_records.id, director_id, request_type: "Customer Details Fetch"});
			if (loanfinancials_records.length > 0) {
				return res.ok({
					status: "ok",
					message: "Data fetched successfully",
					data: {
						loanfinancials_records,
						loan_pre_fetch_data,
						declaration_details: JSON.parse(declaration_details.credit_limit_applied)
					}
				});
			} else {
				return res.ok({
					status: "ok",
					message: "No Data found",
					data: {
						loanfinancials_records,
						loan_pre_fetch_data,
						declaration_details: JSON.parse(declaration_details.credit_limit_applied)
					}
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: "Invalid business_id or loan_ref_id"
			});
		}
	},
	assets_fetch: async function (req, res) {
		const {loan_ref_id, director_id, business_id} = req.allParams();

		params = {loan_ref_id, business_id, director_id};
		fields = ["business_id", "loan_ref_id"];
		missing = await reqParams.fn(params, fields);

		if (!business_id || !loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanrequest_records = await LoanrequestRd.findOne({
			loan_ref_id,
			business_id
		});

		if (loanrequest_records) {
			const loan_additional_data = await LoanAdditionalDataRd.findOne({loan_id: loanrequest_records.id}).select("credit_limit_applied"),
				loanassets_records = await LoanAssetsRd.find({
					business_id,
					loan_id: loanrequest_records.id,
					status: "active"
				}),
				vehicle_details = [], loanassets_records_data = [],
				leadsData = await LeadsRd.find({loan_id: loanrequest_records.id}).sort("id DESC").select("other_data").limit(1),
				loan_pre_fetch_data = await LoanPreFetchRd.find({loan_id: loanrequest_records.id, director_id, request_type: "Customer Details Fetch"});
			if (loanassets_records.length > 0) {
				for (const asset_type_id of loanassets_records) {
					asset_type_id.loan_asset_type_id = await LoanAssetTypeRd.findOne({
						id: asset_type_id.loan_asset_type_id
					}).select("typename");
					if (asset_type_id.inspection_data != null && asset_type_id.inspection_data != "") {asset_type_id.inspection_data = {val_price: asset_type_id.inspection_data.val_price};}
					asset_type_id.sanction_asset_data =
						await LoanSanctionAdditionalRd.findOne({sanctioned_asset_number: asset_type_id.id, status: "active"}) || {};
					if (asset_type_id.loan_security == "Yes") {
						vehicle_details.push(asset_type_id);
					} else {
						loanassets_records_data.push(asset_type_id);
					}
				}
				return res.ok({
					status: "ok",
					message: "Data fetched successfully",
					data: {
						loanassets_records: loanassets_records_data,
						director_id,
						vehicle_details,
						loan_pre_fetch_data,
						leads_data: leadsData ? leadsData : {},
						credit_limit_data: loan_additional_data
					}
				});
			} else {
				return res.ok({
					status: "ok",
					message: "No Data found",
					data: {
						loanassets_records,
						director_id,
						loan_pre_fetch_data,
						leads_data: leadsData ? leadsData : {},
						credit_limit_data: loan_additional_data
					}
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: "Invalid business_id or loan_ref_id"
			});
		}
	},
	move_case: async function (req, res) {
		const loan_id = req.body.loan_id,
			icon_name = req.body.icon_name,
			user_id = req.user.id,
			comment = req.body.comment;
		params = {loan_id, icon_name};
		fields = ["loan_id", "icon_name"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id || !icon_name) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loandata = await LoanrequestRd.findOne({id: loan_id}).select(["loan_status_id", "loan_sub_status_id"]),
			loanBankMappingData = await LoanBankMappingRd.find({loan_id}).select(["loan_bank_status", "loan_borrower_status", "meeting_flag"]),
			prev_status = {
				white_label_id: req.user.loggedInWhiteLabelID,
				status1: loandata.loan_status_id,
				status2: loandata.loan_sub_status_id
			};
		if (loanBankMappingData.length > 0) {
			if (loanBankMappingData[0].loan_bank_status) {prev_status.status3 = loanBankMappingData[0].loan_bank_status;}
			if (loanBankMappingData[0].loan_borrower_status) {prev_status.status4 = loanBankMappingData[0].loan_borrower_status;}
			if (loanBankMappingData[0].meeting_flag && loanBankMappingData[0].meeting_flag != "0") {prev_status.status6 = loanBankMappingData[0].meeting_flag;}
			else prev_status.status6 = null;
		}
		const nc_prev_status = await NcStatusManageRd.findOne(prev_status).select("name");
		let loan_request_details, loan_bank_mapping_details, loan_status_comments_data;
		condition = {white_label_id: req.user.loggedInWhiteLabelID};
		if (icon_name == "move_to_credit_review_icon") {
			condition.or = [{name: "Credit Review"}, {name: "Analyst Review"}];
		} else if (icon_name == "raise_query_to_branch_icon") {
			condition.or = [{name: "Branch Review"}, {name: "OPS Review"}];
		} else if (icon_name == "move_to_credit_assigned_icon") {
			condition.or = [{name: "Credit Assigned"}, {name: "TL Review"}];
		}
		const nc_status_manage_data = await NcStatusManageRd.findOne(condition);
		if (nc_status_manage_data) {
			const report_tat = await sails.helpers.reportTat(req.user.id, req.user.name, loan_id, nc_status_manage_data.name, nc_prev_status.name, comment);
			loan_request_details = await Loanrequest.update({id: loan_id})
				.set({loan_status_id: nc_status_manage_data.status1, loan_sub_status_id: nc_status_manage_data.status2})
				.fetch();

			loan_bank_mapping_details = await LoanBankMapping.update({loan_id})
				.set({
					loan_bank_status: nc_status_manage_data.status3,
					loan_borrower_status: nc_status_manage_data.status4,
					meeting_flag: nc_status_manage_data.status6 ? nc_status_manage_data.status6 : 0,
					notification_status: "yes"
				})
				.fetch();
			if (comment) {
				loan_status_comments_data = await LoanStatusComments.create({
					loan_bank_id: loan_bank_mapping_details[0].id,
					user_id: req.user.id,
					comment_text: comment,
					lender_status_id: loan_bank_mapping_details.lender_status
						? loan_bank_mapping_details.lender_status
						: 0,
					created_time: await sails.helpers.dateTime(),
					user_type: req.user.usertype,
					created_timestamp: await sails.helpers.indianDateTime()
				}).fetch();
			}
			return res.ok({
				status: "ok",
				message: "success",
				data: {
					loan_request_details,
					loan_bank_mapping_details,
					loan_status_comments_data
				}
			});
		} else {
			return res.badRequest({
				status: "nok",
				message: "send the correct icon name"
			});
		}
	},

	priority_sector_details_fetch: async function (req, res) {

		try {

			const {loan_id} = req.query;
			if (!loan_id) {return res.badRequest(sails.config.res.missingFields);}

			const priority_sector_details = await PrioritySectorDetailsRd.find({
				loan_id,
				status: "active"
			});

			if (priority_sector_details && priority_sector_details.length > 0) {

				priority_sector_json_array = [];

				//iterate through all the rows where status is "updated" and "active"
				for (let i = 0; i < priority_sector_details.length; i++) {

					if (priority_sector_details[i].updated_json) {

						const updated_json_data = JSON.parse(priority_sector_details[i].updated_json);
						priority_sector_json_array.push(updated_json_data);

					}
					else {

						const initial_json_data = JSON.parse(priority_sector_details[i].initial_json);
						initial_json_data["id"] = priority_sector_details[i].id;
						priority_sector_json_array.push(initial_json_data);

					}

				}

				return res.send({
					status: "ok",
					message: "Data Fetched Successfully!",
					data: {
						priority_sector_details: priority_sector_json_array
					}
				});

			} else {
				// if we find no records for the given loan_id, this means we are calling it for the first time
				// so return an empty array
				return res.badRequest({
					status: "nok",
					message: "No data found for the entered loanid ",
					data: []
				});
			}

		} catch (error) {

			return res.badRequest({
				status: "nok",
				message: error.message
			});

		}

	},

	priority_sector_details: async function (req, res) {

		try {

			const {loan_id, business_id, section_id, data} = req.body;

			if (!loan_id || !business_id || !section_id || !data || !data.priority_sector_details) {return res.badRequest(sails.config.res.missingFields);}

			const priority_sector_details = data.priority_sector_details,

				datetime = await sails.helpers.dateTime();

			//iterate through the priority_sector_details array
			//if the frontend passes id in the payload, it means it already exists and we update for that record
			//else we create a new row in the database

			if (priority_sector_details.id) {

				await PrioritySectorDetails.update({id: priority_sector_details.id}).set({
					updated_at: datetime,
					updated_json: JSON.stringify(priority_sector_details)
				});

			}
			else {

				//create a new row and once created, update it's intial json with the id of the newly created row
				const created_row = await PrioritySectorDetails.create({
					loan_id,
					initial_json: JSON.stringify(priority_sector_details),
					status: "active",
					created_at: datetime,
					updated_at: datetime
				}).fetch();

				priority_sector_details["id"] = created_row.id;

			}



			//update the data track
			await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");

			return res.send({
				status: "ok",
				message: "Data Updated Successfully!",
				data: priority_sector_details
			});


		} catch (error) {

			return res.send({
				status: "nok",
				message: error.message
			});

		}

	},
	vehicle_details: async function (req, res) {
		const {data: reqData, business_id, loan_id, director_id, section_id} = req.allParams();
		params = {...reqData, loan_id, business_id};
		fields = ["vehicle_details", "loan_id", "business_id"];
		missing = await reqParams.fn(params, fields);
		if (!reqData[0] || !reqData[0].vehicle_details || Object.keys(reqData[0].vehicle_details).length === 0 || !loan_id || !business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (Object.keys(reqData[0].vehicle_details).length == 0) {
			return res.badRequest({
				status: "nok",
				message: "Vehicle details is missing or cannot be empty"
			});
		}
		let message,
			assets_data = [],
			loan_assets_data, auto_inspect;
		for (const element of reqData) {
			loan_json = {rc_verification: element.vehicle_details, auto_inspect: element.auto_inspect, ...reqData};
			const loan_assets_details = {
				...element.vehicle_details,
				loan_id,
				business_id,
				property_type: "Owned",
				director_id,
				loan_asset_type_id: element.vehicle_details.asset_type,
				loan_json,
				loan_security: "Yes",
				ints: await sails.helpers.dateTime()
			};
			if (element.id) {
				loan_assets_data = await LoanAssets.updateOne({id: element.id}).set(loan_assets_details).fetch();
				// assets_data.push(loan_assets_data);
				message = "Data updated successfully";
			} else {
				loan_assets_data = await LoanAssets.create(loan_assets_details).fetch();
				trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
				// assets_data.push(loan_assets_data);
				message = "Data inserted successfully";
			}
			if (element.auto_inspect && Object.keys(element.auto_inspect).length > 0) {
				const auto_inspect_data = await autoInspect(element, loan_id, loan_assets_data);
				if (auto_inspect_data.updated_asset_data) {loan_assets_data = auto_inspect_data.updated_asset_data;}
				auto_inspect = auto_inspect_data.auto_inspect;
			}
			assets_data.push({loan_assets_data, auto_inspect});
		}

		return res.ok({
			status: "ok",
			message,
			data: assets_data
		});
	},
	delete_asset: async function (req, res) {
		const {loan_id, id} = req.allParams();
		params = {loan_id, id};
		fields = ["id", "loan_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id || !id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const fetch_asset = await LoanAssetsRd.findOne({id, loan_id});
		if (!fetch_asset) {
			return res.badRequest({
				status: "nok",
				message: "Invalid loan id or id."
			});
		}
		await LoanAssets.updateOne({id}).set({status: "delete"});
		return res.ok({
			status: "ok",
			message: "Asset data deleted successfully."
		});
	},
	liability_checkbox_update: async function (req, res) {
		const {loan_id, data} = req.allParams();
		if (!loan_id || !Object.keys(data).length === 0) {
			return res.badRequest({
				status: "nok",
				message: "Mandatory fields are missing."
			});
		}
		const loan_additional = await LoanAdditionalDataRd.findOne({loan_id: loan_id}),
			parseData = loan_additional.credit_limit_applied ? JSON.parse(loan_additional.credit_limit_applied) : [];
		parseData[0].declaration_details = data;
		if (!loan_additional) {
			return res.badRequest({
				status: "nok",
				message: "No data found for this loan Id."
			});
		}
		const update_loan_additional = await LoanAdditionalData.update({id: loan_additional.id})
			.set({
				credit_limit_applied: JSON.stringify(parseData)
			}).fetch();
		return res.ok({
			status: "ok",
			message: "Check Box updated",
			data: update_loan_additional
		});
	},
	federal_source_user_list: async function (req, res) {
		// Federal Partner - fedfina
		// Branch Data - branch
		// Sales Data - sales
		// ABA ml data - aba id

		let {loan_origin, employee_id, zone_id, aba_id} = req.allParams();
		if (!loan_origin){
			return res.badRequest(sails.config.res.missingFields);
		}
		if (!employee_id) employee_id = "";
		if (!aba_id) aba_id = "";
		if (!zone_id) zone_id = "";
		let url;
		if (loan_origin == "Fedfina"){
			url = `https://ykqb8pjgvb.execute-api.ap-south-1.amazonaws.com/default/federalbranchdata?employeeid=${employee_id}`;
		} else if (loan_origin == "Sales"){
			url = `https://ykqb8pjgvb.execute-api.ap-south-1.amazonaws.com/default/salesEmployeeList?employee_id=${employee_id}`;
		} else if (loan_origin == "Branch") {
			url = `https://z4azielppc.execute-api.ap-south-1.amazonaws.com/default/salesdata?employee_id=${employee_id}`;
		} else if (loan_origin == "ABA") {
			url = `https://ykqb8pjgvb.execute-api.ap-south-1.amazonaws.com/default/aba_ml_data?aba_id=${aba_id}&zone=${zone_id}`;
		} else 	if (loan_origin == "DSA"){
			url = `https://ykqb8pjgvb.execute-api.ap-south-1.amazonaws.com/default/federal_partner_data?dsa_id=${employee_id}`;
		}
		const response = await sails.helpers.sailstrigger(url, "", "", "GET");
		return res.ok({
			status : "ok",
			message : loan_origin + " User List",
			data :  JSON.parse(response)?.data
		});
	}
};


async function autoInspect(reqData, loan_id, assets_data) {
	const {valuation_address: cus_address, valuation_pincode: cus_pincode, asset_type_auto: vehicle_cat} = reqData.auto_inspect,
		{vehicle_model, registration_number} = reqData.vehicle_details;
	let parseData, updated_asset_data;
	try {
		if (!loan_id || !cus_address || !cus_pincode || !vehicle_cat || !vehicle_model || !registration_number) {throw new Error("Missing Mandatory fields for Auto Inspect");}
		let access_token;
		const loan_data = await Loanrequest.findOne({id: loan_id}).populate("business_id");
		if (!loan_data) {throw new Error("No Loan found");}
		if (assets_data.inspection_number != null && assets_data.inspection_number != "") {throw new Error("Lead is already created for this asset");}

		const login_url = sails.config.cecv.lead_access_url,
			login_method = "POST",
			login_body = sails.config.cecv.lead_access_credentials,
			login_data = await sails.helpers.sailstrigger(login_url, JSON.stringify(login_body), "", login_method);
		if (login_data.status && login_data.status == "nok") {
			throw new Error("Auto Inspect Action is Unauthorized");
		} else {
			parseData = JSON.parse(login_data);
			if (parseData.access_token) {
				access_token = parseData.access_token;
			}
			else {
				throw new Error("Auto Inspect Action is Unauthorised");
			}
		}
		const url = sails.config.cecv.create_lead,
			method = "POST",
			body = {
				vehicle_cat: `${vehicle_cat}`,
				vehicle_mmv: vehicle_model,
				prospect_no: loan_data.loan_ref_id,
				executive_mobile: "",
				executive_name: "",
				cus_veh_regno: registration_number,
				cus_name: loan_data.business_id.businessname,
				cus_mobile: loan_data.business_id.contactno,
				cus_pincode: `${cus_pincode}`,
				cus_address,
				cus_email: loan_data.business_id.business_email || "",
				access_token
			},
			apires = await sails.helpers.sailstrigger(url, JSON.stringify(body), "", method);
		if (apires.status && apires.status == "nok") {
			apires.status = "nok";
			apires.message = "Failed to fetch data";
		}
		else {
			parseData = JSON.parse(apires);
			if (parseData.Status.toLowerCase() === "success") {
				const dateTime = await sails.helpers.dateTime();
				updated_asset_data = await LoanAssets.updateOne({id: assets_data.id}).set({ints: dateTime, inspection_status: "Initiated", inspection_number: parseData.RequestNo});
				parseData.message = "Data fetched successfully";
			}
			else {
				parseData.message = "Validate your inputs";
			}
		}
	}
	catch (err) {
		return {auto_inspect: err.message};
	}
	return {updated_asset_data, auto_inspect: parseData};
}
