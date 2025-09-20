const reqParams = require("../helpers/req-params");

module.exports = {
	business_details: async function (req, res) {
		const {
			data: reqData,
			business_id,
			borrower_user_id,
			loan_product_id,
			loan_id,
			origin,
			parent_product_id,
			section_id,
			lead_id,
			is_applicant,
			co_applicant_business_id
		} = req.allParams();
		params = {...reqData, loan_product_id};
		fields = ["business_details", "loan_product_id"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		business_details = reqData.business_details;
		contact_person_details = reqData.contact_person_details;
		statutory_obligation_details = reqData.statutory_obligation_details || {};
		datetime = await sails.helpers.dateTime();
		business_details.businesspancardnumber = business_details.businesspancardnumber || "NAMAS9948K";
		business_details.businessstartdate = business_details.businessstartdate || "9999-99-99";
		business_details.business_email = contact_person_details.email || contact_person_details.contactno + "@nc.com";
		business_details.businessindustry = business_details.sub_industry_type || business_details.industry_type || 20;
		business_details.empcount = business_details.empcount || "0";
		white_label_id = req.user.loggedInWhiteLabelID;
		let businessDataCreateOrUpdate,
			resData = {},
			message;
		verification_data = {
			verified_on: datetime,
			email: business_details.business_email,
			status: "not verified"
		};
		data = {
			...business_details,
			...contact_person_details,
			first_name: contact_person_details.name,
			additional_info: JSON.stringify({...business_details, ...statutory_obligation_details, ...contact_person_details}),
			userid: borrower_user_id,
			white_label_id,
			ints: datetime,
			email_verification: JSON.stringify(verification_data)
		};
		if (business_details.udyam_trans_id) {data.udyam_response = JSON.stringify({transanction_id: business_details.udyam_trans_id});}
		if (business_details.connector_user_id) {
			data.profile_ref_no = business_details.connector_user_id || "";
		}
		if ((business_id && is_applicant === true) || (co_applicant_business_id && is_applicant === false)) {
			let businessId, co_app_bid = "";
			if (co_applicant_business_id) {
				businessId = co_app_bid = co_applicant_business_id;
				//await addDirector(data, businessId);
			} else {
				businessId = business_id;
			}
			businessData = await Business.findOne({id: businessId});
			if (!businessData) {
				return res.badRequest({
					status: "nok",
					message: "Invalid business_id"
				});
			}
			businessDataCreateOrUpdate = await Business.update({id: businessId}).set(data).fetch();
			trackData = await sails.helpers.onboardingDataTrack(
				loan_id,
				business_id,
				"",
				req.user.id,
				section_id,
				co_app_bid
			);
			resData.business_data = businessDataCreateOrUpdate[0];
			message = sails.config.msgConstants.successfulUpdation;
		} else {
			businessDataCreateOrUpdate = await Business.create(data).fetch();
			resData.business_data = businessDataCreateOrUpdate;
			message = sails.config.msgConstants.successfulInsertion;
			gstmasterUpdate = await GstMaster.update({gst_no: {contains: business_details.businesspancardnumber}}).set({
				business_id: businessDataCreateOrUpdate.id
			});
			if (is_applicant === false && loan_id) {
				const [co_app_data, dir_data] = await Promise.all([
					CoapplicantBusinessMapping.create({
						parent_business_id: business_id,
						co_applicant_business_id: businessDataCreateOrUpdate.id,
						white_label_id,
						created_at: datetime,
						updated_at: datetime
					}).fetch(),
					addDirector(data, businessDataCreateOrUpdate.id),
					sails.helpers.onboardingDataTrack(
						loan_id,
						business_id,
						"",
						req.user.id,
						section_id,
						businessDataCreateOrUpdate.id
					)
				]);
				resData.director_details = dir_data;
			}
		}
		let loanrequestData;
		if (businessDataCreateOrUpdate && !loan_id && (!is_applicant || is_applicant === true)) {
			loanProductData = await LoanProductsRd.findOne({
				id: loan_product_id,
				business_type_id: {
					contains: business_details.businesstype
				}
			});
			if (!loanProductData) {
				return res.badRequest(sails.config.res.invalidProductId);
			}
			loan_request_type = loanProductData.loan_request_type;
			loan_asset_type_id = loanProductData.loan_asset_type_id.split(",")[0];
			loan_usage_type_id = loanProductData.loan_usage_type_id.split(",")[0];
			loan_type_id = loanProductData.loan_type_id.split(",")[0];
			loan_summary = `${loanProductData.product} - requested to create case for business ${business_details.businessname} for ${req.user.usertype}`;
			report_tat = {
				assignedUserId: req.user.id,
				assignedBy: req.user.name,
				dateTime: datetime,
				previous_status: "",
				current_status: "In Complete",
				message: "",
				count: 1
			};
			sales_id =
				req.user.usertype == "CA" && req.user.assigned_sales_id
					? req.user.assigned_sales_id
					: req.user.parent_id !== 0 && req.user.parent_id
						? req.user.parent_id
						: req.user.id;

			let coUserId;
			let whiteLabelData = await WhiteLabelSolutionRd.findOne({id: white_label_id});
			if (whiteLabelData && whiteLabelData.assignment_type.additional_assignment_stage1 && whiteLabelData.assignment_type.additional_assignment_stage1.assignment) {
				let coUserIdData = await UsersRd.find({
					branch_id: req.user.branch_id,
					usertype: whiteLabelData.assignment_type.additional_assignment_stage1.assignment[0].usertype,
					user_sub_type: whiteLabelData.assignment_type.additional_assignment_stage1.assignment[0].user_subtype,
					white_label_id: {contains: white_label_id}
					// or: [
					// 	{white_label_id: `${white_label_id}`},
					// 	{white_label_id: {'like': `%,${white_label_id}`}},
					// 	{white_label_id: {'like': `${white_label_id},%`}},
					// 	{white_label_id: {'like': `%,${white_label_id},%`}}
					// ]
				}).limit(1);
				if (coUserIdData.length > 0) {
					coUserId = coUserIdData[0].id;
				}
			}

			const loan_data = {
				...business_details,
				loan_request_type: loan_request_type,
				business_id: businessDataCreateOrUpdate.id,
				loan_ref_id: await sails.helpers.commonHelper(),
				loan_asset_type: loan_asset_type_id,
				loan_usage_type: loan_usage_type_id,
				loan_type_id: loan_type_id,
				loan_status_id: 1,
				loan_sub_status_id: 1,
				loan_product_id,
				parent_product_id,
				white_label_id,
				createdUserId: req.user.id,
				sales_id,
				RequestDate: datetime,
				modified_on: datetime,
				loan_origin: origin,
				loan_summary,
				branch_id: req.user.branch_id,
				reportTat: JSON.stringify({data: [report_tat]}),
				assignment_additional: coUserId
			};
			loanrequestData = await Loanrequest.create(loan_data).fetch();
			resData.loan_data = loanrequestData;
		} else {
			data = {...business_details};
			loanrequestData = await Loanrequest.update({id: loan_id}).set(data).fetch();
			resData.loan_data = loanrequestData[0];
		}
		await sails.helpers.greenChannelCondition(loanrequestData.id, req.user.loggedInWhiteLabelID)
		if (lead_id) {
			await Leads.update({id: lead_id})
				.set({loan_id: resData.loan_data.id, updated_time: datetime});
		}
		return res.ok({
			status: "ok",
			message,
			data: resData
		});
	},

	business_details_fetch: async function (req, res) {
		const {loan_ref_id} = req.allParams();
		params = {loan_ref_id};
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);
		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let usersData;
		try {
			loan_data = await LoanrequestRd.findOne({loan_ref_id}).populate("business_id");
			if (!loan_data) {
				return res.badRequest({
					status: "nok",
					message: "Invalid loan ref id"
				});
			}
			const co_app_business_id_fetch = await CoapplicantBusinessMappingRd.find({parent_business_id: loan_data.business_id.id}).select("co_applicant_business_id"),
				co_app_business_id = [], cin_no = [];
			if (co_app_business_id_fetch.length > 0) {
				for (i = 0; i < co_app_business_id_fetch.length; i++) {
					co_app_business_id.push(co_app_business_id_fetch[i].co_applicant_business_id);
				}
			}
			const co_app_data = co_app_business_id.length > 0 ? (await BusinessRd.find({id: co_app_business_id}).populate("businessindustry")) : [];
			if (co_app_data.length > 0) {
				for (j = 0; j < co_app_data.length; j++) {
					if (co_app_data[j].corporateid) cin_no.push(co_app_data[j].corporateid);
				}
			}
			loan_data.business_id.corporateid ? cin_no.push(loan_data.business_id.corporateid) : "";
			loan_data.business_id.businessindustry = await BusinessIndustryRd.findOne({id: loan_data.business_id.businessindustry});
			usersData = await UsersRd.findOne({id: loan_data.business_id.userid});
			loan_document = await LoanDocumentRd.find({
				doctype: sails.config.pan_doc_id,
				loan: loan_data.id,
				status: "active"
			});
			trackData = await MisActivityRd.find({loan_id: loan_data.id}).select("onboarding_track");
			company_master_data = await CompanyMasterDataRd.find({
				CORPORATE_IDENTIFICATION_NUMBER: cin_no
			}).select("OUTPUT_JSON");
			co_app_business_id.push(loan_data.business_id.id);
			directorData = await DirectorRd.find({business: co_app_business_id});
			if (company_master_data.length > 0) {
				for (k = 0; k < company_master_data.length; k++) {
					if (company_master_data[k].OUTPUT_JSON) {
						const parsedData = JSON.parse(company_master_data[k].OUTPUT_JSON);
						let directorList;
						if (directorData.length > 0) {
							directorList = directorData.map((element) => {
								return {name: element.dfirstname, "Din": element.ddin_no};
							});
						}
						parsedData.data["director"] = directorList;
						company_master_data[k].OUTPUT_JSON = JSON.stringify(parsedData);
					}

				}

			}
			const loan_pre_fetch_data = await LoanPreFetchRd.find({loan_id: loan_data.id, request_type: "Customer Details Fetch"});
			if (loan_data.business_id.businesspancardnumber) {
				let panData = await PannoResponse.find({panno: loan_data.business_id.businesspancardnumber}).select("verification_response").sort("id DESC").limit(1);
				if (panData[0]?.verification_response) {
					loan_data.business_id.nsdl_data = JSON.parse(panData[0].verification_response).nsdlPanData?.data
				}
			}

			return res.ok({
				status: "ok",
				message: "Data fetched successfully",
				data: {
					business_details: loan_data.business_id,
					loan_data: loan_data,
					user_data: usersData,
					loan_document: loan_document ? loan_document : [],
					company_master_data: company_master_data,
					trackData,
					director_details: directorData,
					loan_pre_fetch_data,
					co_applicant_business_details: co_app_data
				}
			});
		} catch (err) {
			return res.badRequest({
				status: "nok",
				message: "Error in fetching the data",
				err
			});
		}
	},
	CreateBusinessAddress: async function (req, res) {
		const {data: reqData, business_id, loan_id, section_id} = req.allParams();
		businessAddDataArray = [];
		param = {...reqData, business_id};
		fields = ["business_address_details", "business_id"];
		missing = await reqParams.fn(param, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const gstin = reqData.gstin;
		if (section_id) {
			trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
		}
		let message;
		for (const ba_data of reqData.business_address_details) {
			objData = {...ba_data, bid: business_id, gstin};
			if (ba_data.id) {
				businessAddData = await BusinessaddressRd.findOne({id: ba_data.id});
				if (!businessAddData) {
					return res.badRequest(sails.config.res.invalidBusinessId);
				}
				updatedAddress = await Businessaddress.update({id: ba_data.id}).set(objData).fetch();
				businessAddDataArray.push(updatedAddress[0]);
				message = sails.config.msgConstants.successfulUpdation;
			} else {
				const createdData = await Businessaddress.create(objData).fetch();
				message = sails.config.msgConstants.successfulInsertion;
				businessAddDataArray.push(createdData);
			}
		}
		return res.ok({
			status: "ok",
			message,
			data: businessAddDataArray
		});
	},

	FetchBusinessAddress: async function (req, res) {
		const {business_id} = req.allParams();
		param = {business_id};
		fields = ["business_id"];
		missing = await reqParams.fn(param, fields);

		if (!business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		businessData = await Business.findOne({id: business_id});
		// gstmasterData = await GstMaster.find({gst_no : { contains : businessData.businesspancardnumber}});
		address = await BusinessaddressRd.find({bid: business_id}).sort("id DESC");
		const company_master_data = await CompanyMasterDataRd.findOne({
			CORPORATE_IDENTIFICATION_NUMBER: businessData.corporateid
		}).select("REGISTERED_OFFICE_ADDRESS");

		if (address.length > 0 || businessData.businesspancardnumber) {
			sails.config.successRes.dataFetched.data = {
				address,
				pan: businessData.businesspancardnumber,
				gstin: businessData.gstin,
				udyam_number: businessData.udyam_number,
				registered_address: company_master_data?.REGISTERED_OFFICE_ADDRESS || []
			};
			return res.send(sails.config.successRes.dataFetched);
		} else {
			return res.send(sails.config.res.noDataAvailableId);
		}
	}
};

async function addDirector(data, business_id) {
	const datetime = await sails.helpers.dateTime(),
		director_obj = {
			...data,
			business: business_id,
			dfirstname: data.first_name,
			dlastname: data.last_name,
			dpancard: data.businesspancardnumber,
			demail: data.business_email,
			dcontact: data.contact,
			isApplicant: 0,
			ints: datetime,
			type_name: "Business",
			income_type: data.businesstype == 1 ? "business" : data.businesstype == 0 ? "noIncome" : "salaried",
			customer_picture: data.customer_picture ? JSON.stringify(data.customer_picture) : null
		};
	dirData = await Director.create(director_obj).fetch();
	return dirData;
}
