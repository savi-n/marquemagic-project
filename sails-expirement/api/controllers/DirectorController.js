const {decryptReq, encryptRes} = require("../services/encrypt");

/**
   * @description :: Add Co Applican Data
   * @api {post} /addCo-Applicant Add Co Applican Data
   * @apiName Add Co Applican Data
   * @apiGroup Case
   * @apiExample Example usage:
   * curl -i http://localhost:1337/addCo-Applicant

   *@apiParam {String} case_id case reference id.
   *@apiParam {Object[]} co_applicant_director_partner_data
   *@apiParam {String} co_applicant_director_partner_data.firstname
   *@apiParam {String} co_applicant_director_partner_data.lastname
   *@apiParam {String} co_applicant_director_partner_data.email
   *@apiParam {Number} co_applicant_director_partner_data.contact
   *@apiParam {String} co_applicant_director_partner_data.address
   *@apiParam {Number} co_applicant_director_partner_data.is_applicant (value : 0 or 1)
   *@apiParam {String} co_applicant_director_partner_data.crime_check ["No", "Yes"]

   *@apiSuccess {String} status ok.
   *@apiSuccess {String} message Co-applicant Details added successfully.
   *@apiSuccess {String} DES_CODE NC08
   */
const reqParams = require("../helpers/req-params");
module.exports = {
	addCoApplicantData: async function (req, res) {
		const {co_applicant_director_partner_data, origin} = req.body.allParams;

		fields = ["co_applicant_director_partner_data"];
		missing = await reqParams.fn(req.body.allParams, fields);

		if (!co_applicant_director_partner_data || co_applicant_director_partner_data.length === 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		(message = ""), (dir_data_array = []);
		for (const element of co_applicant_director_partner_data) {
			params = co_applicant_director_partner_data[element];
			fields = [
				"business_id",
				"dfirstname",
				"ddob",
				"dcontact",
				"income_type",
				"dpancard",
				"daadhaar",
				"address1",
				"city",
				"state",
				"pincode",
				"applicant_relationship"
			];
			if (
				//mandatory fields
				(!element.business_id ||
					!element.dfirstname ||
					!element.ddob ||
					!element.dcontact ||
					!element.income_type ||
					!element.dpancard ||
					!element.daadhaar ||
					!element.address1 ||
					!element.city ||
					!element.state ||
					!element.pincode ||
					!element.applicant_relationship) &&
				!element.id
			) {
				sails.config.res.missingFields.mandatoryFields = missing;
				return res.badRequest(sails.config.res.missingFields);
			}
			const business_data = await BusinessRd.findOne({id: element.business_id});
			if (!business_data) {
				return res.badRequest({
					status: "nok",
					message: "Invalid bussiness_id"
				});
			}
			// let incomeType = element.income_type;
			// if (origin== "nconboarding"){
			let incomeType =
				element.income_type == 1
					? "business"
					: element.income_type == 7
						? "salaried"
						: element.income_type == 0
							? "noIncome"
							: null;
			// }
			dir_data = {
				business: element.business_id,
				dfirstname: element.dfirstname,
				dlastname: element.dlastname,
				demail: element.demail,
				dcontact: element.dcontact,
				isApplicant: element.isApplicant,
				address1: element.address1,
				address2: element.address2,
				address3: element.address3,
				address4: element.address4,
				crime_check: element.crime_check,
				ddob: element.ddob,
				income_type: incomeType,
				dpancard: element.dpancard,
				daadhaar: element.daadhaar,
				locality: element.locality,
				city: element.city,
				ints: await sails.helpers.dateTime(),
				state: element.state,
				pincode: element.pincode,
				type_name: element.type_name,
				applicant_relationship: element.applicant_relationship,
				residence_status: element.residence_status ? element.residence_status : null,
				country_residence: element.country_residence ? element.country_residence : null,
				marital_status: element.marital_status ? element.marital_status : null
			};
			let updateOrInsertDirectorData;
			if (element.id) {
				updateOrInsertDirectorData = await Director.update({id: element.id}).set(dir_data).fetch();
				updateOrInsertDirectorData = updateOrInsertDirectorData[0];
				if (origin == "onboarding") {
					updateOrInsertDirectorData.income_type = element.income_type;
				}
				dir_data_array.push(updateOrInsertDirectorData);
				message = "Co-applicant Details updated successfully";
			} else {
				updateOrInsertDirectorData = await Director.create(dir_data).fetch();
				if (origin == "onboarding") {
					updateOrInsertDirectorData.income_type = element.income_type;
				}
				dir_data_array.push(updateOrInsertDirectorData);
				message = "Co-applicant Details added successfully";
			}
			if ((element.grossIncome || element.netMonthlyIncome) && updateOrInsertDirectorData) {
				fetchIncomeData = await IncomeDataRd.findOne({
					business_id: element.business_id,
					director_id: updateOrInsertDirectorData.id
				});
				if (fetchIncomeData) {
					const update_income_data = await IncomeData.update({id: fetchIncomeData.id})
						.set({
							gross_income: element.grossIncome,
							net_monthly_income: element.netMonthlyIncome
						})
						.fetch();
				} else {
					//Insert gross and net income to IncomeData table
					const income_data = await IncomeData.create({
						business_id: element.business_id,
						director_id: updateOrInsertDirectorData.id,
						gross_income: element.grossIncome,
						net_monthly_income: element.netMonthlyIncome
					}).fetch();
				}
			}
		}
		if (dir_data_array.length > 0) {
			return res.ok({
				status: "ok",
				message,
				data: dir_data_array
			});
		}
	},

	/**
	 * @description :: Add Co Applican Data
	 * @api {post} /addDirector Add Co Applican Data and Guarantor
	 * @apiName Add Co Applican Data and Gaurantor
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/addDirector
	 * {
		"loan_ref_id": "OMXX00000001",
		"applicantData": {
			"firstName": "Anand",
			"lastName": "an",
			"panNumber": "bfbsgshj67",
			"dob": "05-06-1995", // check date format with madhuri
			"email": "anand.biradar@nc.co",
			"mobileNo": "55665665",
			"isApplicant": "0", // can be 1 or 0... 0 for co-applicant. check for garantor with madhuri
			"address": [{
				"addressType": "permanent",
				"address1": "",
				"address2": "",
				"address3": "",
				"address4": "",
				"city": "",
				"state": "",
				"pinCode": ""
			}, {
				"addressType": "present",
				"address1": "",
				"address2": "",
				"address3": "",
				"address4": "",
				"city": "",
				"state": "",
				"pinCode": ""
			}],
			"aadhaar": "",
			"typeName": "", //["Applicant", "Co-applicant", "Director", "Partner", "Guarantor"]
			"incomeType": "", //['NULL', 'salaried', 'business']
			"residenceStatus": "", //['NULL', 'Resident', 'Resident and Ordinarily Resident', 'Resident but Not Ordinarily Resident', 'Non-Resident']
			"countryResidence": "",
			"maritalStatus": "", //['NULL', 'Single', 'Married', 'Widowed', 'Divorced']
			"isEligibility": "true", // if co-applicant is eligiblity for calculation
			"grossIncome": "", // required only if isEligibility is true
			"netMonthlyIncome": "", // required only if isEligibility is true
			"emiDetails":""
		}
	}
	 * @apiParam {String} loan_ref_id case reference id.
	 * @apiParam {Object} applicantData
	 *
	 * @apiParam {String} applicantData.firstNam
	 * @apiParam {String} applicantData.lastName
	 * @apiParam {String} applicantData.panNumber
	 * @apiParam {String} applicantData.dob  check date format with madhuri
	 * @apiParam {String} applicantData.email
	 * @apiParam {String} applicantData.mobileNo
	 * @apiParam {String} applicantData.isApplicant  can be 1 or 0... 0 for co-applicant. check for garantor with madhuri
	 * @apiParam {Object[]} applicantData.address
	 * @apiParam {String} applicantData.address.addressType [permanent,present]
	 * @apiParam {String} applicantData.address.address1
	 * @apiParam {String} applicantData.address.address2
	 * @apiParam {String} applicantData.address.address3
	 * @apiParam {String} applicantData.address.address4
	 * @apiParam {String} applicantData.address.city
	 * @apiParam {String} applicantData.address.state
	 * @apiParam {String} applicantData.address.pinCode
	 * @apiParam {String} applicantData.cibilScore
	 * @apiParam {String} applicantData.aadhaar
	 * @apiParam {String} applicantData.typeName ["Applicant", "Co-applicant", "Director", "Partner", "Guarantor"]
	 * @apiParam {String} applicantData.incomeType ['NULL', 'salaried', 'business']
	 * @apiParam {String} applicantData.residenceStatus ['NULL', 'Resident', 'Resident and Ordinarily Resident', 'Resident but Not Ordinarily Resident', 'Non-Resident']
	 * @apiParam {String} applicantData.countryResidence
	 * @apiParam {String} applicantData.maritalStatus ['NULL', 'Single', 'Married', 'Widowed', 'Divorced']
	 * @apiParam {String} applicantData.isEligibility if co-applicant is eligiblity for calculation
	 * @apiParam {String} applicantData.grossIncome required only if isEligibility is true
	 * @apiParam {String} applicantData.netMonthlyIncome required only if isEligibility is true
	 * @apiParam {String} applicantData.emiDetails
	 *
	 * @apiSuccess {String} statusCode NC200
	 * @apiSuccess {String} directorId director id
	 *
	 */

	addDirector: async function (req, res) {
		const reqBody = decryptReq(req.param("data"));

		let directorId;
		// changes here
		const loan_ref_id = reqBody.loan_ref_id,
			applicantData = reqBody.applicantData,
			cibilScore = reqBody.cibilScore ? reqBody.cibilScore : null;

		const fields = ["loan_ref_id", "applicantData"];
		const missing = await reqParams.fn(reqBody, fields);
		if (
			!loan_ref_id ||
			!applicantData ||
			!applicantData.firstName ||
			!applicantData.lastName ||
			!applicantData.email ||
			!applicantData.mobileNo ||
			!applicantData.panNumber ||
			!applicantData.typeName ||
			applicantData.address.length == 0
		) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loan_details = await LoanrequestRd.findOne({loan_ref_id: loan_ref_id});
		if (!loan_details) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}

		for (const i in applicantData.address) {
			let direcorDetails;
			if (applicantData.address[i].addressType == "permanent") {
				direcorDetails = await Director.create({
					business: loan_details.business_id,
					dfirstname: applicantData.firstName,
					dlastname: applicantData.lastName,
					dpancard: applicantData.panNumber,
					ddob: applicantData.dob,
					demail: applicantData.email,
					dcontact: applicantData.mobileNo,
					isApplicant: applicantData.isApplicant ? applicantData.isApplicant : "0",
					address1: applicantData.address[i].address1 ? applicantData.address[i].address1 : "",
					address2: applicantData.address[i].address2 ? applicantData.address[i].address2 : "",
					address3: applicantData.address[i].address3 ? applicantData.address[i].address3 : "",
					address4: applicantData.address[i].address4 ? applicantData.address[i].address4 : "",
					city: applicantData.address[i].city,
					state: applicantData.address[i].state,
					pincode: applicantData.address[i].pinCode,
					daadhaar: applicantData.aadhaar ? applicantData.aadhaar : "",
					type_name: applicantData.typeName,
					income_type: applicantData.incomeType,
					residence_status: applicantData.residenceStatus ? applicantData.residenceStatus : null,
					country_residence: applicantData.countryResidence ? applicantData.countryResidence : null,
					marital_status: applicantData.maritalStatus ? applicantData.maritalStatus : null,
					dcibil_score: cibilScore, // not the right way.. read from sails-plaid project directly
					ints: await sails.helpers.dateTime()
				}).fetch();
				directorId = direcorDetails.id;
				if (applicantData.panNumber) {
					await PannoResponseRd.findOne({panno: applicantData.panNumber}).then(async (result) => {
						if (result) {
							await PannoResponse.update({id: result.id}).set({panno: applicantData.panNumber}).fetch();
						} else {
							await PannoResponse.create({
								panno: applicantData.panNumber,
								pan_data_type: "Both",
								ints: await sails.helpers.dateTime()
							}).fetch();
						}
					});
					if (applicantData.isEligibility == true) {
						await IncomeData.create({
							business_id: loan_details.business_id,
							director_id: directorId,
							gross_income: applicantData.grossIncome ? applicantData.grossIncome : "0",
							net_monthly_income: applicantData.netMonthlyIncome ? applicantData.netMonthlyIncome : "0"
						});

						if (applicantData.emiDetails) {
							const financialsData = await LoanFinancials.find({
								business_id: loan_details.business_id,
								loan_id: loan_details.id
							}).limit(1);

							await LoanFinancials.create({
								business_id: loan_details.business_id,
								loan_id: loan_details.id,
								fin_type: "Bank Account",
								bank_id: financialsData[0].bank_id ? financialsData[0].bank_id : 0,
								director_id: directorId,
								sanction_drawing_limit: "{}",
								emi_details: JSON.stringify(applicantData.emiDetails)
							});
						}
					}
				}
			}

			res.send({
				statusCode: "NC200",
				data: encryptRes({
					directorId: directorId
				})
			});
			await sails.helpers.greenChannelCondition(loan_details.id, req.user.loggedInWhiteLabelID)
		}
	},
	addMultipleDirector: async function (req, res) {
		const {data: reqData, business_id, loan_id, section_id} = req.allParams();
		params = {business_id};
		fields = ["business_id"];
		missing = missing = await reqParams.fn(params, fields);

		if (!business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const dateTime = await sails.helpers.dateTime();
		let dirArray = [],
			dirObj;
		const panNumber = /([A-Z]){5}([0-9]){4}([A-Z]){1}$/;
		let dpancard, ddin_no;
		for (element of reqData) {
			if (panNumber.test(element["din/pan"])) {
				dpancard = element["din/pan"];
			} else {
				ddin_no = element["din/pan"];
			}
			dirObj = {
				dpancard: dpancard,
				business: business_id,
				ints: dateTime,
				ddin_no: ddin_no,
				dfirstname: element.name,
				income_type: element.income_type,
				crime_check: element.crime_check
			};
			dirArray.push(dirObj);
		}
		trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
		const direcorDetails = await Director.createEach(dirArray).fetch();
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.successfulInsertion,
			data: direcorDetails
		});
	},
	/**
	 * @description :: Add Co Applicant Docs List
	 * @api {post} /coApplicantDocList Add Co Applicant Docs List
	 * @apiName Add coApplicantDocList
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/coApplicantDocList
	 *
	}
	 * @apiParam {String} income_type Income Type
	 * @apiParam {Object} applicantData
	 *
	 * @apiSuccess {String} statusCode NC200
	 * @apiSuccess {String} directorId director id
	 *
	 */

	coApplicantDocList: async function (req, res) {
		let income_type = req.param("income_type");
		const loan_ref_id = req.param("loan_ref_id");
		const params = req.allParams();
		const fields = ["income_type"];
		const missing = await reqParams.fn(params, fields);

		if (!income_type) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const business_co_applicant_doc_list = loan_ref_id ? await co_app_doc_list_for_sme(loan_ref_id) : [];
		income_type = income_type.split(",");
		coApplicantFetchData = await CoapplicantDocumentMappingRd.find({
			income_type_id: income_type,
			white_label_id: req.user.loggedInWhiteLabelID
		});
		if (coApplicantFetchData.length === 0) {
			return res.ok({
				status: "ok",
				message: "No data available for this income type id.",
				business_co_applicant_doc_list,
				data: []
			});
			// return res.badRequest(sails.config.res.noDataAvailableId);
		}
		const document = [];
		whiteLabelData = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID}).select(
			"document_mapping"
		);
		wt_parseData = whiteLabelData.document_mapping ? JSON.parse(whiteLabelData.document_mapping) : {};
		for (const coApplicantData of coApplicantFetchData) {
			const result = {
				kyc_doc: [],
				finance_doc: [],
				other_doc: []
			};
			parseData = coApplicantData.doc_id_mandatory ? JSON.parse(coApplicantData.doc_id_mandatory) : {};
			if (parseData.doc_type) {
				for (const doctype of parseData.doc_type) {
					const doc_type_list = await DoctypeRd.findOne({
						id: doctype.id,
						status: "active"
					}).select(["doc_type", "name", "priority", "doc_detail"]);
					if (doc_type_list) {
						if (doctype.mandatory === 1) {
							doc_type_list.isMandatory = true;
						} else {
							doc_type_list.isMandatory = false;
						}
						if (doctype.doc_name) {
							doc_type_list.name = doctype.doc_name;
						} else if (wt_parseData && wt_parseData.doc_data && wt_parseData.doc_data.length > 0) {
							wt_parseData.doc_data.forEach((element) => {
								if (doc_type_list.id == element.doctype_id) {
									doc_type_list.name = element.name;
								}
							});
						}
						doc_type_list.doc_type_id = doc_type_list.id;
						if (doc_type_list.priority === "100") {
							result.kyc_doc.push(doc_type_list);
						}
						if (doc_type_list.priority === "1") {
							result.finance_doc.push(doc_type_list);
						}
						if (doc_type_list.priority === "200") {
							result.other_doc.push(doc_type_list);
						}
					}
				}
			}
			document.push(result);
		}
		return res.ok({
			status: "ok",
			message: "Document listed successfully",
			data: document,
			business_co_applicant_doc_list
		});
	},
	director_details: async function (req, res) {
		const loan_ref_id = req.param("loan_ref_id");
		params = {loan_ref_id};
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({loan_ref_id}).select(["loan_request_type", "business_id", "white_label_id"]);
		let trackData = await MisActivityRd.find({loan_id: loanData.id}).select("onboarding_track"),
			director_details;
		let business_id = [loanData.business_id]
		const businessCoapplicant = await CoapplicantBusinessMappingRd.find({parent_business_id: loanData.business_id}).select("co_applicant_business_id")
		if (businessCoapplicant.length > 0) businessCoapplicant.forEach(b => business_id.push(+b.co_applicant_business_id))

		directorDetails = await DirectorRd.find({business: business_id, status: "active"})
		if (directorDetails.length > 0) {
			for (const directorData of directorDetails) {
				if (directorData.isApplicant == 0) {
					incomeTypaData = await CoapplicantDocumentMappingRd.findOne({
						income_type_name: directorData.income_type,
						white_label_id: loanData.white_label_id
					}).select(["income_type_name", "income_type_id"]);
					if (incomeTypaData) {
						directorData.income_type = incomeTypaData.income_type_id;
					}
				} else {
					directorData.income_type = loanData && loanData.loan_request_type == 1 ? 1 : 7;
				}
				if (directorData.type_name === "Business") directorData.type_name = "business"
			}
			message = sails.config.successRes.fetchDirectorData;
			message.data = {directors: directorDetails, trackData: trackData};
			// message.data.push({trackData : trackData});
			return res.ok(message);
		} else {
			message = sails.config.res.noDirectorData;
			message.data = [];
			return res.badRequest(message);
		}
	},
	delete_director: async function (req, res) {
		const director_id = req.param("director_id");
		const business_id = req.param("business_id");

		if (director_id && business_id) {

			const loanData = await Loanrequest.findOne({business_id: business_id});
			const director = await DirectorRd.find({id: director_id, business: business_id});
			if (director.length === 0 || director[0] === null) {
				return res.send({
					status: "nok",
					message: "Invalid director_id or business id does not exist."
				});
			}
			const deleteDoc = await Director.updateOne({id: director_id, business: business_id}).set({
				status: "deleted"
			});
			const misActivityData = await MisActivityRd.findOne({business_id: business_id}).select("onboarding_track");
			if (misActivityData && misActivityData.onboarding_track) {
				const director_mis_track = JSON.parse(misActivityData.onboarding_track)
				if (director_mis_track && director_mis_track.director_details && director_mis_track.director_details.hasOwnProperty(director_id)) {
					delete director_mis_track.director_details[director_id];
					await MisActivity.updateOne({business_id: business_id}).set({onboarding_track: JSON.stringify(director_mis_track)})
				}
			}
			const LoanDocumentRecords = await LoanDocument.find({business_id: business_id, directorId: director_id});
			const LenderDocumentRecords = await LenderDocument.find({loan: loanData.id, directorId: director_id});
			if (LoanDocumentRecords.length > 0) {const deleteLoanDoc = await LoanDocument.update({business_id: business_id, directorId: director_id}).set({status: "inactive"});}
			if (LenderDocumentRecords.length > 0) {const deleteLenderDoc = await LenderDocument.update({loan: loanData.id, directorId: director_id}).set({status: "inactive"});}
			return res.send({
				status: "ok",
				message: "Document deleted",
				data: deleteDoc
			});
		} else {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	},
	get_director_status: async function (req, res) {
		const loan_id = req.param("loan_id");
		const loan_ref_id = req.param("loan_ref_id");

		params = {loan_id};
		fields = ["loan_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		try {
			let misData, directorData, flag, dynamicFormJson, validate_directors, skip_validate_directors;
			const loanReqData = await LoanrequestRd.findOne({id: loan_id});
			if (!loanReqData) {throw new Error("No Loan found")};

			const productDetails = await LoanProductsRd.findOne({id: loanReqData.loan_product_id}).select("dynamic_forms");
			dynamicFormJson = productDetails?.dynamic_forms?.add_disbursement?.skip_validate_directors;

			if (dynamicFormJson) {
				const coApplicantData = await DirectorRd.find({business: loanReqData.business_id, type_name: ["Co-applicant", "Guarantor"], status: "active"});
				validate_directors = coApplicantData.map(item => item.id)
				skip_validate_directors = true
			}
			else directorData = await DirectorRd.find({business: loanReqData.business_id, status: "active"});

			if (directorData && directorData.length == 0) throw new Error("No Director Data found for the Loan Id");

			misData = await MisActivityRd.findOne({
				business_id: loanReqData.business_id
			});
			if (!misData) throw new Error("No track found in MisActivity");

			let directorTrack = JSON.parse(misData.onboarding_track);
			if (directorTrack == null || !directorTrack.director_details || Object.keys(directorTrack.director_details).length == 0 || (directorData && Object.keys(directorTrack.director_details).length < directorData.length))
				flag = false;
			else {
				flag = true;
				Object.keys(directorTrack.director_details).forEach(item => {
					if (dynamicFormJson && !validate_directors.includes(+item)) {
						return;
					}
					let value = directorTrack.director_details[item]
					if (value.length < 3 ||
						!value.includes("loan_address_details") ||
						!value.includes("basic_details") ||
						!value.includes("employment_details")) {
						flag = false;
						return;
					}
				});
			}
			return res.ok({
				status: "ok",
				flag,
				skip_validate_directors
			})
		}
		catch (err) {
			return res.ok({
				status: "nok",
				message: err.message
			})
		}
	},
	validate_ucic: async function (req, res) {
		const {loanId, loanProductId} = req.allParams();
		let flag = true, status = "ok", message;
		const loanProductsRecord = await LoanProductsRd.findOne({id: loanProductId}).select([
			"additional_conditions"
		]);

		const ucicVerificationCondition = loanProductsRecord?.additional_conditions?.data?.ucic_verification?.mandatory || false
		const ucicMandateDate = loanProductsRecord?.additional_conditions?.data?.ucic_verification?.date || false

		const loanData = await LoanrequestRd.findOne({id: loanId}).select(["business_id", "RequestDate"]);
		const directorData = await Director.find({business: loanData.business_id, status: "active"});
		const ucicDateCondition = JSON.stringify(new Date(loanData.RequestDate)).slice(1, 11) > ucicMandateDate;

		if (ucicVerificationCondition && ucicDateCondition) {
			const ucicCompleted = directorData.every(obj => obj.additional_cust_id !== null && obj.additional_cust_id !== '')
			if (!ucicCompleted) {
				status = "nok";
				message = loanProductsRecord.additional_conditions.data.ucic_verification.error_message;
				flag = false
			}
		}
		return res.ok({status, message, flag})
	},
	validate_udyam: async function (req, res) {
		const {business_id, loan_product_id} = req.allParams();
		if (!business_id || !loan_product_id) return res.badRequest(sails.config.res.missingFields);
		const directorData = await Director.find({business: business_id, status: "active"});
		const loanProductsRecord = await LoanProductsRd.findOne({id: loan_product_id}).select("additional_conditions");
		const udyamVerificationCondition = loanProductsRecord?.additional_conditions?.data?.udyam_verification?.mandatory || false
		const udyamNumberPresentCondition = loanProductsRecord?.additional_conditions?.data?.udyam_number_present?.mandatory || false
		let message = "validation completed successfully", status = "ok", udyam_validation_error = false;
		if (udyamNumberPresentCondition) {
			let udyamNumberPresent = directorData.every(obj => {
				if (obj.income_type !== "business") return true;
				if (obj.income_type == "business" &&
					obj.udyam_number) return true;
				else return false
			});
			if (!udyamNumberPresent) {
				status = "nok";
				message = loanProductsRecord.additional_conditions.data.udyam_number_present.error_message;
				udyam_validation_error = true
			}
		} else {
			let udyamCompleted = directorData.every(obj => {
				if (obj.income_type !== "business") return true;
				if (obj.income_type == "business" &&
					obj.udyam_response &&
					obj.udyam_number &&
					JSON.parse(obj.udyam_response)?.data &&
					isParsable(JSON.parse(obj.udyam_response)?.data)?.udyamNumber) return true;
				else return false
			});
			if (!udyamCompleted) {
				status = "nok";
				message = loanProductsRecord.additional_conditions.data.udyam_verification.error_message;
				udyam_validation_error = true
			}
		}
		return res.ok({status, message, udyam_validation_error})
	}
};
async function co_app_doc_list_for_sme(loan_ref_id) {
	const loanrequestData = await LoanrequestRd.findOne({loan_ref_id}).select(["business_id", "loan_product_id", "white_label_id"]),
		co_app_bid = [], business_type = [], result = {
			kyc_doc: [],
			finance_doc: [],
			other_doc: []
		},
		co_app_business_id = await CoapplicantBusinessMappingRd.find({parent_business_id: loanrequestData.business_id}).select("co_applicant_business_id");
	if (co_app_business_id.length > 0) {
		for (const co_bid of co_app_business_id) {
			co_app_bid.push(co_bid.co_applicant_business_id);
		}
		const business_data = await BusinessRd.find({id: co_app_bid}).select("businesstype");
		for (const bid of business_data) {
			business_type.push(Number(bid.businesstype));
		}
		LoanProductDocumentMappingRd.find({loan_product_id: loanrequestData.loan_product_id}).then(async (product_mapping) => {
			if (product_mapping.length > 0) {
				whiteLabelData = await WhiteLabelSolutionRd.findOne({id: loanrequestData.white_label_id}).select(
					"document_mapping"
				);
				parseData = whiteLabelData.document_mapping ? JSON.parse(whiteLabelData.document_mapping) : {};
				for (const product of product_mapping) {
					const businesstype_id = product.businesstype_id.split(",").map(Number);
					if (business_type.filter(element => businesstype_id.includes(element)).length > 0) {
						const doc_type_list = await DoctypeRd.findOne({
							id: product.doctype_id,
							status: "active"
						}).select(["doc_type", "name", "priority", "doc_detail"]);
						if (doc_type_list) {
							if (parseData && parseData.doc_data && parseData.doc_data.length > 0) {
								parseData.doc_data.forEach((element) => {
									if (doc_type_list.id == element.doctype_id) {
										doc_type_list.name = element.name;
									}
								});
							}
							doc_type_list.doc_type_id = doc_type_list.id;
							if (product.document_condition === 1) {
								doc_type_list.isMandatory = true;
							} else {
								doc_type_list.isMandatory = false;
							}
							if (doc_type_list.priority === "100") {
								result.kyc_doc.push(doc_type_list);
							}
							if (doc_type_list.priority === "1") {
								result.finance_doc.push(doc_type_list);
							}
							if (doc_type_list.priority === "200") {
								result.other_doc.push(doc_type_list);
							}
						}
					}
				}
			}
		});
	}
	return result;
}

const isParsable = (data) => {
	let parsedData;
	try {
		parsedData = JSON.parse(data);
		return parsedData;
	} catch (err) {
		return false;
	}
}
