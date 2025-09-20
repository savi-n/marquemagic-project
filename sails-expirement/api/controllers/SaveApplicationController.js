const reqParams = require("../helpers/req-params");
module.exports = {
	viewLoanApplication: async function (req, res) {
		const userId = req.user.id;
		useridArray = [];
		users = await UsersRd.find({
			// Get the list of things this user can see
			select: ["id"],
			where: {
				or: [
					{
						parent_id: userId
					},
					{
						id: userId
					}
				]
			}
		});
		_.each(users, (value) => {
			useridArray.push(value.id);
		});
		businessData = await Business.find({userid: useridArray});
		const businessId = [];
		_.each(businessData, (values) => {
			businessId.push(values.businessId);
		});

		const loanRequestData = await LoanrequestRd.find({
			or: [
				{
					createdUserId: useridArray
				},
				{
					business_id: businessId
				}
			]
		}).populate("loan_document");
		if (loanRequestData.length === 0) {
			return res.badRequest(sails.config.res.noDataAvailableId);
		}
		return res.ok({
			status: "ok",
			message: "success",
			data: loanRequestData
		});
	},

	updateCaseCreation: async function (req, res) {
		const {loan_details, Business_details, businessaddress, documents, director_details} = req.allParams();
		let {
			businessid,
			businessname,
			business_address,
			first_name,
			last_name,
			business_email,
			contactno,
			businesstype,
			businessindustry,
			businessstartdate,
			businesspancardnumber,
			percentag_business_supplier,
			percentage_business,
			empcount,
			noofdirectors,
			about_business,
			current_company,
			previous_company,
			status,
			ints,
			business_truecaller_info,
			google_search_data,
			gstin,
			gstin_extract,
			is_ca_business,
			encrypted_data,
			pancard_url,
			ITR_name,
			filling_date,
			crime_check
		} = Business_details;
		let {
			loanId,
			loan_request_type,
			loan_amount,
			loan_amount_um,
			applied_tenure,
			assets_value,
			assets_value_um,
			annual_revenue,
			revenue_um,
			annual_op_expense,
			op_expense_um,
			cur_monthly_emi,
			loan_asset_type,
			loan_usage_type,
			loan_type_id,
			loan_rating_id,
			loan_status_id,
			loan_sub_status_id,
			white_label_id,
			remarks,
			remarks_val,
			assigned_uw,
			assigned_date,
			osv_doc,
			modified_on,
			RequestDate,
			loan_summary,
			loan_product_id,
			notification,
			createdUserId,
			sales_id,
			loan_originator,
			loan_orginitaor,
			doc_collector,
			unsecured_type,
			remark_history,
			application_ref,
			document_upload,
			nc_status_history,
			loan_origin,
			loan_document,
			lender_document,
			request_for_extract,
			notification_preapproved,
			notification_nc_biz_sales,
			b_city,
			case_priority,
			default_emails,
			default_zone,
			branch_id,
			loan_data
		} = loan_details;

		params = loan_details;
		fields = ["businessid", "loanId"];
		missing = await reqParams.fn(params, fields);

		if (!businessid || businessid === 0 || !loanId || loanId === 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let business_Data;
		const businessData = {
			businessname,
			business_address,
			first_name,
			last_name,
			business_email,
			contactno,
			businesstype,
			businessindustry,
			businessstartdate,
			businesspancardnumber,
			percentag_business_supplier,
			percentage_business,
			empcount,
			noofdirectors,
			about_business,
			current_company,
			previous_company,
			status,
			ints,
			business_truecaller_info,
			google_search_data,
			gstin,
			gstin_extract,
			is_ca_business,
			encrypted_data,
			pancard_url,
			ITR_name,
			filling_date,
			crime_check
		};
		loanFetchData = await LoanrequestRd.findOne({
			id: loan_details.loanId,
			business_id: Business_details.businessid
		}).populate("business_id");

		if (loanFetchData.business_id) {
			business_Data = await Business.update({id: businessid}).set(businessData).fetch();
		}
		let businessAddressDetails;
		if (businessaddress && Object.keys(businessaddress).length > 0) {
			business_address_data = {
				address1: businessaddress.line1,
				address2: businessaddress.line2 || null,
				address3: businessaddress.line3 || null,
				address4: businessaddress.line4 || null,
				locality: businessaddress.locality,
				city: businessaddress.city,
				state: businessaddress.state,
				pincode: businessaddress.pincode.toString()
			};

			if (businessaddress.id) {
				businessAddressData = await BusinessaddressRd.findOne({id: businessaddress.id});

				if (businessAddressData) {
					businessAddressDetails = await Businessaddress.update({id: businessaddress.id})
						.set(business_address_data)
						.fetch();
				}
			} else {
				if (
					!businessaddress.address1 ||
					!businessaddress.locality ||
					!businessaddress.city ||
					!businessaddress.state ||
					!businessaddress.pincode
				) {
					businessAddressDetails = await Businessaddress.create(business_address_data).fetch();
				}
			}
		}

		let loanReqData;
		const loanData = {
			loan_request_type,
			loan_amount,
			loan_amount_um,
			applied_tenure,
			assets_value,
			assets_value_um,
			annual_revenue,
			revenue_um,
			annual_op_expense,
			op_expense_um,
			cur_monthly_emi,
			loan_asset_type,
			loan_usage_type,
			loan_type_id,
			loan_rating_id,
			loan_status_id,
			loan_sub_status_id,
			remarks,
			remarks_val,
			assigned_uw,
			assigned_date,
			osv_doc,
			modified_on,
			RequestDate,
			loan_summary,
			loan_product_id,
			notification,
			createdUserId,
			white_label_id,
			sales_id,
			loan_originator,
			loan_orginitaor,
			doc_collector,
			unsecured_type,
			remark_history,
			application_ref,
			document_upload,
			nc_status_history,
			loan_origin,
			loan_document,
			lender_document,
			request_for_extract,
			notification_preapproved,
			notification_nc_biz_sales,
			b_city,
			case_priority,
			default_emails,
			default_zone,
			branch_id,
			loan_data
		};
		if (loanFetchData) {
			loanReqData = await Loanrequest.update({id: loanId, business_id: businessid}).set(loanData).fetch();
		}
		let directorData;
		if (director_details) {
			let = {
				did,
				demail,
				dfirstname,
				dlastname,
				dcontact,
				ddob,
				dpancard,
				crime_check,
				ints,
				address1,
				address2,
				locality,
				city,
				state,
				pincode,
				type_name,
				isApplicant,
				dcibil_score,
				daadhaar
			} = director_details;
			if (did) {
				directorDetails = await DirectorRd.findOne({id: did});
				if (directorDetails) {
					directorData = await Director.update({id: did})
						.set({
							demail: demail || directorDetails.demail,
							dfirstname: dfirstname || directorDetails.dfirstname,
							dlastname: dlastname || directorDetails.dlastname,
							dcontact: dcontact || directorDetails.dcontact,
							ddob: ddob || directorDetails.ddob,
							dpancard: dpancard || directorDetails.dpancard,
							crime_check: crime_check || directorDetails.crime_check,
							ints: ints || directorDetails.ints,
							address1: address1 || directorDetails.address1,
							address2: address2 || directorDetails.address2,
							locality: locality || directorDetails.locality,
							city: city || directorDetails.city,
							state: state || directorDetails.state,
							pincode: pincode || directorDetails.pincode,
							type_name: type_name || directorDetails.type_name,
							isApplicant: isApplicant || directorDetails.isApplicant,
							dcibil_score: dcibil_score || directorDetails.dcibil_score,
							daadhaar: daadhaar || directorDetails.daadhaar
						})
						.fetch();
				}
			} else {
				if (dfirstname && demail && address1) {
					directorData = await Director.create({
						demail,
						dfirstname,
						dlastname,
						dcontact,
						ddob,
						dpancard,
						crime_check,
						ints,
						address1,
						address2,
						locality,
						city,
						state,
						pincode,
						type_name,
						isApplicant,
						dcibil_score,
						daadhaar
					}).fetch();
				}
			}
		}
		await sails.helpers.greenChannelCondition(loanId, req.user.loggedInWhiteLabelID)
		const documentArray = [];
		if (documents) {
			const kyc_doc_len = documents.KYC,
				finance_doc_len = documents.financials,
				other_doc_len = documents.others;
			if (kyc_doc_len.length > 0) {
				for (i = 0; i < kyc_doc_len.length; i++) {
					const createKycDocData = await LoanDocument.create({
						loan: id,
						business_id: business_id,
						user_id: req.user.id,
						doctype: kyc_doc_len[i].value,
						doc_name: kyc_doc_len[i].fd,
						uploaded_doc_name: kyc_doc_len[i].filename,
						original_doc_name: kyc_doc_len[i].filename,
						size: kyc_doc_len[i].size,
						document_password: kyc_doc_len[i].password ? kyc_doc_len[i].password : null,
						ints: datetime,
						upload_method_type: "newui",
						on_upd: datetime,
						uploaded_by: kyc_doc_len[i].uploaded_by ? kyc_doc_len[i].uploaded_by : req.user.id
					}).fetch();
					documentArray.push(createKycDocData);
				}
			}

			if (finance_doc_len.length > 0) {
				for (j = 0; j < finance_doc_len.length; j++) {
					const createFinancialDocData = await LoanDocument.create({
						loan: id,
						business_id: business_id,
						user_id: req.user.id,
						doctype: finance_doc_len[j].value,
						doc_name: finance_doc_len[j].fd,
						uploaded_doc_name: finance_doc_len[j].filename,
						original_doc_name: finance_doc_len[j].filename,
						size: finance_doc_len[j].size,
						document_password: finance_doc_len[j].password ? finance_doc_len[j].password : null,
						ints: datetime,
						upload_method_type: "newui",
						on_upd: datetime,
						uploaded_by: finance_doc_len[j].uploaded_by ? finance_doc_len[j].uploaded_by : req.user.id
					}).fetch();
					documentArray.push(createFinancialDocData);
				}
			}

			if (other_doc_len.length > 0) {
				for (k = 0; k < other_doc_len.length; k++) {
					const createOtherDocData = await LoanDocument.create({
						loan: id,
						business_id: business_id,
						user_id: req.user.id,
						doctype: other_doc_len[k].value,
						doc_name: other_doc_len[k].fd,
						uploaded_doc_name: other_doc_len[k].filename,
						original_doc_name: other_doc_len[k].filename,
						size: other_doc_len[k].size,
						document_password: other_doc_len[k].password ? other_doc_len[k].password : null,
						ints: datetime,
						upload_method_type: "newui",
						on_upd: datetime,
						uploaded_by: other_doc_len[k].uploaded_by ? other_doc_len[k].uploaded_by : req.user.id
					}).fetch();
					documentArray.push(createOtherDocData);
				}
			}
		}
		return res.send({
			status: "ok",
			message: "success",
			data: {
				loanData: loanReqData,
				businessData: business_Data,
				business_Address_Data: businessAddressDetails,
				directorData: directorData,
				loan_document: documentArray
			}
		});
	}
};
