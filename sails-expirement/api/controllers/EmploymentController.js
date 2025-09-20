/**
 * EmploymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const reqParams = require("../helpers/req-params");
module.exports = {
	employmentDetails: async function (req, res) {
		/* destruct all details */
		const employmentDetails = req.param("data");
		let employment_id = req.param("employment_id"),
			director_id = req.param("director_id"),
			business_id = req.param("business_id"),
			section_id = req.param("section_id"),
			loan_id = req.param("loan_id"),
			income_data_id = 0, /* By default making income_data_id 0 for logTrackingService helper, it'll change later in the code */

			message;

		/* check for mandatory fields */
		const {company_name, employment_category, organization_type, employee_number} = employmentDetails.employment_details,
			{address1, pincode, city, state} = employmentDetails.address_details;

		let params = {director_id, business_id, loan_id},
			fields = ["director_id", "business_id", "loan_id"];
		if (!employment_id) {
			params = {
				company_name,
				employment_category,
				organization_type,
				address1,
				pincode,
				city,
				state,
				director_id
			};
			fields = ["director_id"];
		}

		const missing = await reqParams.fn(params, fields);
		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const {loan_type_id} = await LoanrequestRd.findOne({id: loan_id}).select("loan_type_id");
		if (employee_number && loan_type_id == sails.config.vendor_loan_type) {
			const updateBusiness = await Business.updateOne({id: business_id})
				.set({profile_ref_no: employee_number}).fetch();
			await Users.updateOne({id: updateBusiness.userid}).set({user_reference_no: employee_number});
		}

		const curDate = await sails.helpers.dateTime(),
			additional_data = {
				...employmentDetails.employment_details,
				...employmentDetails.salary_details
			},
			employmentDetailsObj = {
				director_id,
				...employmentDetails.employment_details,
				...employmentDetails.address_details,
				additional_data: JSON.stringify(additional_data),
				updated_at: curDate
			},

			incomeDetailsObj = {
				business_id,
				director_id,
				...employmentDetails.salary_details,
				updated_at: curDate,
				net_monthly_income: employmentDetails.salary_details.net_monthly_income || null,
				gross_income: employmentDetails.salary_details.gross_income || null,
				any_other_income: employmentDetails.salary_details.any_other_income || null,
				income_from_agriculture: employmentDetails.salary_details.income_from_agriculture || null,
				income_from_other_business: employmentDetails.salary_details.income_from_other_business || null,
				income_from_rent: employmentDetails.salary_details.income_from_rent || null,
				deductions: employmentDetails.salary_details.deductions || null,
			};

		let employmentRecord, incomeDataRecord;
		try {
			const trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, director_id, req.user.id, section_id, "");
			if (employment_id && director_id) {
				const employmentRecordFetch = await EmploymentDetailsRd.find({id: employment_id, director_id}).limit(1),
					incomeDataRecordFetch = await IncomeData.find({employment_id, director_id}).limit(1);
				if (employmentRecordFetch.length === 0 || incomeDataRecordFetch.length === 0) {
					return res.status(404).send({
						status: "nok",
						message: "record not found in the database for the given employment_id and director_id"
					});
				}

				await EmploymentDetails.update({
					id: employment_id,
					director_id
				}).set(employmentDetailsObj);

				incomeDataRecord = await IncomeData.update({
					employment_id,
					director_id
				})
					.set(incomeDetailsObj)
					.fetch();

				message = sails.config.msgConstants.successfulUpdation;
			} else {
				/*insert/update block*/

				const employmentDataFetch = await EmploymentDetailsRd.find({director_id}).select("id").limit(1),
					incomeDataFetch = await IncomeDataRd.find({director_id}).select("id").limit(1);
				console.log(incomeDataFetch, employmentDataFetch);
				if (employmentDataFetch && employmentDataFetch.length > 0) {
					/*check whether employmentDetails exists with the provided director_id*/
					employment_id = incomeDetailsObj.employment_id = employmentDataFetch[0].id;
					employmentRecord = await EmploymentDetails.update({id: employment_id, director_id}).set(employmentDetailsObj).fetch();
					message = sails.config.msgConstants.successfulUpdation;
				} else {
					/*this is insertion block*/
					employmentRecord = await EmploymentDetails.create({
						...employmentDetailsObj,
						created_at: curDate
					}).fetch();

					employment_id = incomeDetailsObj.employment_id = Array.isArray(employmentRecord)
						? employmentRecord[0].id
						: employmentRecord.id;

					message = sails.config.msgConstants.successfulInsertion;
				}


				if (incomeDataFetch && incomeDataFetch.length > 0) {
					incomeDataRecord = await IncomeData.update({id: incomeDataFetch[0].id}).set(incomeDetailsObj).fetch();
				} else {
					incomeDataRecord = await IncomeData.create({
						...incomeDetailsObj,
						created_at: curDate
					}).fetch();
				}
				income_data_id = Array.isArray(incomeDataRecord) && incomeDataRecord.length > 0 ? incomeDataRecord[0].id : incomeDataRecord.id;
			}

			res.send({
				status: "ok",
				message,
				data: {
					employment_id,
					income_data_id,
					business_id,
					director_id
				}
			});
		} catch (err) {
			console.log(err);
			let message = "something went wrong",
				statusCode = 500;
			if (err.code === "E_INVALID_VALUES_TO_SET") {
				(message = "invalid value passed in the payload"), (statusCode = 400);
			}

			res.status(statusCode).send({
				status: "nok",
				message,
				error: err.details
			});

			/* logtracking data*/
			await sails.helpers.logtrackservice(req, "Employment/employmentDetails", 0, "Employment_Details");
			await sails.helpers.logtrackservice(req, "Employment/employmentDetails", 0, "income_data");
		}
	},

	fetch_employmentDetails: async function (req, res) {
		const loan_ref_id = req.param("laon_ref_id"),
			business_id = req.param("business_id"),
			director_id = req.param("director_id");

		params = {business_id, director_id};
		fields = ["business_id", "director_id"];
		missing = await reqParams.fn(params, fields);

		if (!business_id || !director_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const director_details = await DirectorRd.find({id: director_id});
		employment_details = await EmploymentDetailsRd.findOne({director_id});
		income_data = await IncomeDataRd.findOne({employment_id: employment_details.id, director_id});
		employment_details.industry_typeid = employment_details.industry_typeid ?
			await BusinessIndustryRd.findOne({id: employment_details.industry_typeid}) : null;

		if (director_details.length > 0 || employment_details || income_data) {
			return res.ok({
				status: "ok",
				message: "Data fetched successfully",
				data: {
					director_details,
					employment_details,
					income_data
				}
			});
		} else {
			return res.badRequest({
				status: "nok",
				message: "no data found"
			});
		}
	}
};
