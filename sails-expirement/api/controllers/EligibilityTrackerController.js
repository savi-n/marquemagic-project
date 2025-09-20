/**
 * EligibilityTrackerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	/**
   * @api {post} /saveAnswer/ Eligibility Save Answer
   * @apiName Eligibility Save Answer
   * @apiGroup Eligibility
   * @apiExample Example usage:
   * curl -i localhost:1337/saveAnswer
   * @apiSuccess {string} status The value can be ok/nok.
   * @apiSuccess {string} message
   * @apiDescription
   * <b>Note :- Answers is an array of object as shown here
   * "answers": [
   *  {
		"question_id": 2,
		"answer": "sadas"
	  },
	  {
		"question_id": 3,
		"answer": "sasdsaad"
	  }
	]</b>
   * @apiParam {object[]} answers Array of object of answers
   * @apiParam {Number} loan_product_id Loan product id which the user has selected
   *
   */
	index: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			white_label_id = user_whitelabel;
		let eligibility_id;
		let eligibilityTrackerArray = [];
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			query = "SELECT count(DISTINCT eligibility_id) as id FROM `eligibility_tracker` group by eligibility_id",
			nativeResult = await myDBStore.sendNativeQuery(query),
			result = nativeResult.rows;
		eligibility_id = result == null ? 1 : result.length + 1;

		const postData = req.allParams(),
			answers = postData.answers,
			product_id = postData.loan_product_id;
		datetime = await sails.helpers.dateTime();
		if (answers != null && product_id != null && product_id != "" && product_id != undefined) {
			answers.forEach((answer) => {
				let eligibilityTrackerObject = {
					question_id: answer.question_id,
					eligibility_id: eligibility_id,
					product_id: product_id,
					answer: answer.answer,
					user_id: req.user["id"],
					white_label_id: white_label_id,
					inserted_at: datetime,
					updated_at: datetime
				};
				eligibilityTrackerArray.push(eligibilityTrackerObject);
			});
			await EligibilityTracker.createEach(eligibilityTrackerArray).fetch();
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
		const eligibility = await sails.helpers.encrypt(eligibility_id, "aes-256-cbc");
		eligibility.loan_product_id = product_id;
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.successfulInsertion,
			eligibility: eligibility
		});
	},

	/**
	 * @api {post} /eligibility/ Eligibility Calculator
	 * @apiName Eligibility Calculator
	 * @apiGroup Eligibility
	 * @apiExample Example usage:
	 * curl -i localhost:1337/eligibility
	 *
	 * @apiParam {object[]} eligibility Array of object this is the output of save answer api
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {Object} data
	 * @apiSuccess {Object[]} lender lender details.
	 * @apiSuccess {Object[]} analyticsData analytics data calculation
	 * @apiSuccess {Number} lender.id lender id.
	 * @apiSuccess {String} lender.bankname Bank Name.
	 * @apiSuccess {String} lender.white_label_id white label id.
	 * @apiSuccess {String} lender.logo_url logo url.
	 * @apiSuccess {Number} lender.min_loan_amt minimum loan amount.
	 * @apiSuccess {Number} lender.max_loan_amt maximum loan amount.
	 * @apiSuccess {Number} financial_amount financial amount.
	 * @apiSuccess {String} message Eligibility calculated.
	 */
	calculator: async function (req, res, next) {
		const white_label_id = req.user.loggedInWhiteLabelID;
		if (req.param("eligibility")) {
			const postData = req.param("eligibility"),
				eligibility_id = await sails.helpers.decrypt(
					postData.encryptedData,
					"aes-256-cbc",
					postData.key,
					postData.iv
				);
			if (eligibility_id != "error") {
				const answers = await EligibilityTrackerRd.find({
					eligibility_id: parseInt(eligibility_id)
				}),
					eligibility_input_rules = await EligibilityRulesRd.find({
						product_id: postData.loan_product_id,
						rule_type: "input",
						status: "active"
					}),
					inputCalculation = await sails.helpers.eligibilityCalculator(eligibility_input_rules, answers, "input"),
					eligibility_output_rules = await EligibilityRulesRd.find({
						product_id: postData.loan_product_id,
						rule_type: "output",
						status: "active"
					}),
					outputCalculation = await sails.helpers.eligibilityCalculator(
						eligibility_output_rules,
						inputCalculation,
						"output"
					);
				if (outputCalculation.length > 0) {
					outputCalculation.sort((a, b) => (a.rule > b.rule ? 1 : b.rule > a.rule ? -1 : 0));
					const length = outputCalculation.length - 1,
						lenderValues = [];
					for (let i = 0; i < outputCalculation.length; i++) {
						const lender = await BankMasterRd.findOne({id: outputCalculation[i].lender_id});
						lender.financial_amount = outputCalculation[i].rule;
						lenderValues.push(lender);
					}

					const loanproduct = await LoanProductsRd.findOne({
						where: {id: postData.loan_product_id},
						select: ["product"]
					}),
						result = {
							lender: lenderValues,
							financial_amount: outputCalculation[length].rule || 0,
							loan_product: loanproduct
						},
						analyticsData = {
							product_id: loanproduct.id,
							financial_amt: outputCalculation[length].rule || 0,
							userId: req.user["id"],
							status: "No"
						},
						analyticsCreateData = await EligiblityAnalytics.create(analyticsData).fetch();
					return res.ok({
						status: "ok",
						data: result,
						analyticsData: analyticsCreateData,
						message: sails.config.msgConstants.eligibilityCalculated
					});
				} else {
					return res.ok({
						status: "nok",
						data: null,
						message: sails.config.msgConstants.eligibilityCalculationFailed
					});
				}

			}
		}
		const postData = req.allParams(),
			answers = postData.answers,
			lead_id = postData.lead_id,
			product_id = postData.loan_product_id;

		const params = req.allParams();
		const fields = ["answers", "lead_id", "loan_product_id"];
		const missing = await reqParams.fn(params, fields);

		if (!answers || !lead_id || !product_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let eligibility_id;
		let eligibilityTrackerArray = [];
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			query = "SELECT count(DISTINCT eligibility_id) as id FROM `eligibility_tracker` group by eligibility_id",
			nativeResult = await myDBStore.sendNativeQuery(query),
			result = nativeResult.rows;
		eligibility_id = result == null ? 1 : result.length + 1;

		datetime = await sails.helpers.dateTime();
		const timestamp = new Date(datetime).getTime() % 10000000000;

		// Store all the answers to EligibilityTracker table if any undefined answer throw then the error
		if (answers != null && product_id != null && product_id != "" && product_id != undefined) {
			for (const answer of answers) {
				if (answer.answer != null && answer.answer != "") {
					let eligibilityTrackerObject = {
						question_id: answer.question_id,
						eligibility_id: eligibility_id,
						product_id: product_id,
						answer: answer.answer,
						user_id: req.user["id"],
						white_label_id: white_label_id,
						inserted_at: datetime,
						updated_at: datetime
					};
					eligibilityTrackerArray.push(eligibilityTrackerObject);
				} else {
					const question = await PreferenceQuestionnaireRd.findOne({id: answer.question_id}).select(["text"])
					return res.badRequest({
						status: 'nok',
						message: question.text + " is missing which require to calculate eligibility"
					})
				}
			};
			await EligibilityTracker.createEach(eligibilityTrackerArray).fetch();
		}

		// Get the s3 name and region from white_lable_solution table to get json files from bucket
		const white_label_solution = await WhiteLabelSolutionRd.findOne({id: white_label_id}).select(["s3_name", "s3_region"])
		bucket = white_label_solution.s3_name;
		region = white_label_solution.s3_region;

		// All the json file name are configured in the development.js under eligibility_calculation key
		// questionDetails will have all the question ids required for the trailing calculation
		questionDetails = await getS3JSON(sails.config.eligibility_calculation.Question_Details, bucket, region);

		// answersForRequiredQuestions will have all the answers required for the trailing calculation
		let answersForRequiredQuestions;
		if (questionDetails) {
			answers.push({question_id: questionDetails.Loan_Product, answer: product_id})
			answersForRequiredQuestions = await getAnswersByDetails(answers, questionDetails);
		}

		// getS3JSON function helpes to fetch json files from s3 bucket for eligibility calculation
		// filenames are configured in the development.js file
		const tenure = await getS3JSON(sails.config.eligibility_calculation.Tenure, bucket, region),
			Max_Loan_Ammount = await getS3JSON(sails.config.eligibility_calculation.Max_Loan_Ammount, bucket, region),
			Eligibility_Data = await getS3JSON(sails.config.eligibility_calculation.Eligibility_Data, bucket, region),
			Cost_Of_Funding = await getS3JSON(sails.config.eligibility_calculation.Cost_Of_Funding, bucket, region),
			Effect_on_LTV = await getS3JSON(sails.config.eligibility_calculation.Effect_on_LTV, bucket, region),
			ROI_Grid = await getS3JSON(sails.config.eligibility_calculation.ROI_Grid, bucket, region);
		const product_name = answersForRequiredQuestions.Loan_Product.split(' ')[0];
		let finalTenure = 0, tenure_wise = 'NO GO';

		// if tenure json is present, with the help of age and the product and sub-product tenure is calculated
		if (tenure) {
			const tenureDataObject = tenure[product_name]
			let calculatedTenure;
			if (product_name == 'HL') {
				calculatedTenure = await getTenureHL(answersForRequiredQuestions.HL_Sub_Product, answersForRequiredQuestions.Appraisal_Type, tenureDataObject);
			} else if (product_name == 'LAP') {
				calculatedTenure = await getTenureLAP(answersForRequiredQuestions.LAP_Sub_Product, answersForRequiredQuestions.Loan_Amount, answersForRequiredQuestions.Appraisal_Type, tenureDataObject);
			}
			let maxAllowedAge = 60;
			let age = answersForRequiredQuestions.Age;

			if (age > maxAllowedAge) {
				finalTenure = 0;
			}
			else if (calculatedTenure == 0) {
				finalTenure = maxAllowedAge - age
			}
			else if (age + calculatedTenure < maxAllowedAge) {
				tenure_wise = "GO";
				finalTenure = calculatedTenure
			}
			else if (age + calculatedTenure > maxAllowedAge) {
				tenure_wise = "GO";
				finalTenure = maxAllowedAge - age;
			} else {
				tenure_wise = "GO";
				finalTenure = calculatedTenure
			}
		}

		// to calculate the financial_amount using the input and output rules EligibilityRulesRd table is used
		const eligibility_input_rules = await EligibilityRulesRd.find({
			product_id: product_id,
			rule_type: "input",
			status: "active"
		}),
			inputCalculation = await sails.helpers.eligibilityCalculator(eligibility_input_rules, answers, "input"),
			eligibility_output_rules = await EligibilityRulesRd.find({
				product_id: product_id,
				rule_type: "output",
				status: "active"
			}),
			outputCalculation = await sails.helpers.eligibilityCalculator(
				eligibility_output_rules,
				inputCalculation,
				"output"
			);
		if (outputCalculation.length > 0) {
			outputCalculation.sort((a, b) => (a.rule > b.rule ? 1 : b.rule > a.rule ? -1 : 0));
			const length = outputCalculation.length - 1,
				lenderValues = [];

			// All the calcution is based on the number of lenders for the given product and thee output rule
			for (let i = 0; i < outputCalculation.length; i++) {
				const lender = await BankMasterRd.findOne({id: outputCalculation[i].lender_id});
				lender.id = lender.bank_acc_expression

				lender.financial_amount = outputCalculation[i].rule;
				lender.tenure_eligibility = finalTenure + ' years';
				lender.tenure_wise = tenure_wise;

				// if Max_Loan_Ammount json is present, max_loan_amount will be calculated
				if (Max_Loan_Ammount) {
					max_loan_ammount = await getMaxLoanAmount(product_name, answersForRequiredQuestions.Appraisal_Type, lender.bankname, Max_Loan_Ammount);
					lender.max_loan_amt = max_loan_ammount;
				}

				// if Eligibility_Data json is present, processing_fee, imd and bureau_criteria will be calculated
				if (Eligibility_Data) {
					eligibility_data = await getEligibilityData(lender.bankname, product_name, answersForRequiredQuestions.Equifax_Score, Eligibility_Data);
					lender.processing_fee = eligibility_data.processingFee;
					lender.imd = eligibility_data.imd;
					lender.bureau_criteria = eligibility_data.bureauCriteria;
				}

				// if Effect_on_LTV json is present, ltc and property_wise will be calculated
				if (Effect_on_LTV) {
					effectOnLTV = await getPropertyDetails(answersForRequiredQuestions.Product_Type, product_name, lender.bankname, answersForRequiredQuestions.Property_Value, Effect_on_LTV);
					lender.ltv = effectOnLTV.ltv;
					lender.property_wise = effectOnLTV.propertyStatus;
				}

				// If Cost_Of_Funding json is present, rate_of_interest will be calculated
				// In addition if ROI_Grid is present, rate_of_interest is calculated based on the costOfFunding and roi_grid
				if (Cost_Of_Funding) {
					let roi_grid;
					costOfFunding = await getCostOfFundingValue(product_name, lender.bankname, answersForRequiredQuestions.HL_Sub_Product ? answersForRequiredQuestions.HL_Sub_Product : answersForRequiredQuestions.LAP_Sub_Product, Cost_Of_Funding);
					if (costOfFunding == 0) {
						lender.rate_of_interest = "0.00%";
					} else if (ROI_Grid) {
						roi_grid = await getROIGirdAdjustment(product_name, answersForRequiredQuestions.Equifax_Score, answersForRequiredQuestions.Appraisal_Type, ROI_Grid);
						lender.rate_of_interest = parseFloat((costOfFunding + roi_grid)).toFixed(2) + "%";
					} else {
						lender.rate_of_interest = parseFloat(costOfFunding).toFixed(2) + "%";
					}
				}
				lenderValues.push(lender);
			}
			const analyticsData = {
				product_id: product_id,
				financial_amt: outputCalculation[length].rule || 0,
				userId: req.user["id"],
				status: "No"
			},
				analyticsCreateData = await EligiblityAnalytics.create(analyticsData).fetch(),
				result = {
					lender: lenderValues,
					financial_amount: outputCalculation[length].rule || 0,
					loan_product: {
						id: product_id,
						product: product_name
					},
					lead_id: lead_id,
					analyticsData: analyticsCreateData
				}

			// After the successfull calculation the output is stored in the leads table with the lead_id as unnique identification
			const obj = {
				phone: timestamp,
				lead_category: 'Eligibility-Calutator',
				created_time: datetime,
				updated_time: datetime,
				white_label_id: white_label_id,
				origin: 'Basic-Home-Loan',
				userid: req.user["id"],
				originator: req.user["id"],
				product_name: JSON.stringify({loan_product_id: product_id, product_name: product_name}),
				other_data: JSON.stringify(result),
				search_text: lead_id
			}
			leadData = await Leads.create(obj).fetch();
			return res.ok({
				status: "ok",
				data: result,
				message: sails.config.msgConstants.eligibilityCalculated
			});
		} else {
			return res.ok({
				status: "nok",
				data: null,
				message: sails.config.msgConstants.eligibilityCalculationFailed
			});
		}
	},
	/**
	 * @api {post} /loanCreationUpdate/ loan creation status update
	 * @apiName Eligibility Update Status
	 * @apiGroup Eligibility
	 * @apiExample Example usage:
	 * curl -i localhost:1337/loanCreationUpdate
	 *
	 * @apiParam {Number} analytics_id unique analytics id
	 * @apiParam {Number} loanId loan created id
	 *
	 * @apiSuccess {String} status ok.
	 */
	loanCreationUpdate: async (req, res) => {
		const uniqueId = req.param("analytics_id"),
			loanId = req.param("loanId");
		if (uniqueId && loanId) {
			const updatedAnalytics = await EligiblityAnalytics.updateOne({
				id: uniqueId
			}).set({
				status: "Yes",
				loanId: loanId
			});
			return res.send({
				status: "ok",
				message: sails.config.msgConstants.successfulUpdation
			});
		} else {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	},

	/**
	 * @api {post} /eligibilityCalculatorNew/ Eligibility Calculator New
	 * @apiName Eligibility Calculator New
	 * @apiGroup Eligibility
	 * @apiExample Example usage:
	 * curl -i localhost:1337/eligibilityCalculatorNew
	 *
	 * @apiParam {String} monthly_income Monthly Income
	 * @apiParam {String} current_emi
	 * @apiParam {String} tenure Loan Tenure
	 * @apiParam {String} loan_amount
	 * @apiParam {String} loan_product
	 * @apiParam {String} equifax_score
	 * @apiParam {String} White_label_id
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {Object} data
	 * @apiSuccess {String} message Eligibility calculated.
	 */

	eligibilityCalculatorNew: async function (req, res) {
		const fmt = require("indian-number-format");
		let {monthly_income, current_emi, tenure, loan_amount, loan_product, equifax_score, white_label_id, origin} =
			req.allParams();

		const params = req.allParams();
		const fields = ["monthly_income", "tenure", "loan_amount", "loan_product"];
		const missing = await reqParams.fn(params, fields);

		if (!monthly_income || !tenure || !loan_amount || !loan_product) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let prodConfigData, corporateLoanData;
		prodConfigData = await ProductConfigRd.find({product_id: loan_product});
		if (prodConfigData.length > 0) {
			prodConfigData = prodConfigData[0].min_interest_value;
		} else {
			prodConfigData = 12;
		}
		if (equifax_score && white_label_id) {
			corporateLoanData = await CorporateLoanCriteriaRd.find({
				productid: loan_product,
				white_label_id: white_label_id
			});
			if (equifax_score && corporateLoanData.length > 0) {
				const value = corporateLoanData[0].value.split("-");
				if (equifax_score >= value[0] && equifax_score <= value[1]) {
					corporateLoanData = corporateLoanData[0].delta_value || 0;
					prodConfigData = prodConfigData + prodConfigData * corporateLoanData;
				}
			}
		}
		current_emi = current_emi ? current_emi : 0;
		let DBR, loanAmount, EPL, EMI;
		datetime = await sails.helpers.dateTime();
		requestManageData = {
			loan_id: 0,
			white_label_id: white_label_id,
			request_start_time: datetime,
			request_end_time: datetime,
			requested_by: 0, //ToDo: Php to send phone number in order to fetch leadId
			status: "Success",
			request_type: "credit_eligibility",
			reference_id: 0,
			referenc_name: "eligibilityCalculatorNew",
			json_value: JSON.stringify(req.allParams()),
			error_msg: "",
			request_origin: "PHP_portal"
		};
		if (current_emi >= monthly_income) {
			// insert into Request Manager for error
			requestManageData.error_msg = "current emi is greater than monthly income";
			requestManageCreate = await RequestManager.create(requestManageData).fetch();
			return res.ok({
				status: "nok",
				message: "current emi is greater than monthly income",
				EPL: 0,
				loanAmount: 0
			});
		} else {
			// these values should go in defaults table or defaults-year table
			if (loan_product === 7) {
				DBR = monthly_income * 0.65 - current_emi;
			} else {
				DBR = monthly_income * 0.75 - current_emi;
			}
			MIR = prodConfigData / 12;
			const p = loan_amount,
				r = (MIR / 100).toFixed(3);
			n = tenure;
			EPL = ((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2);
			loanAmount = Math.round((monthly_income * DBR - current_emi) / EPL);

			EMI = ((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2);
			if (loanAmount < 0) {
				EPL = 0;
				loanAmount = 0;
			}
		}
		requestManageCreate = await RequestManager.create(requestManageData).fetch();
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.eligibilityCalculated,
			loanAmount: fmt.format(loanAmount),
			EMI: fmt.format(parseFloat(EMI))
		});
	},
	giveOfferEligibility: async function (req, res) {
		const fmt = require("indian-number-format");
		let {tenure, loan_amount, loan_product, white_label_id, loan_id, interest_rate} = req.allParams();

		const params = req.allParams();
		fields = ["tenure", "loan_amount", "loan_product", "loan_id"];
		missing = await reqParams.fn(params, fields);
		if (!tenure || !loan_amount || !loan_product || !loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (interest_rate > 99.9999) {
			return res.badRequest({status: "nok", message: "Maximum allowed Rate of Interest is 99.9999%"});
		}
		if (tenure > 360) {
			return res.badRequest({
				status: "nok",
				message: "Maximum allowed tenure is 360 months"
			});
		}
		let prodConfigData;
		prodConfigData = await ProductConfigRd.find({product_id: loan_product, white_label_id: white_label_id});
		if (prodConfigData.length > 0) {
			prodConfigData = prodConfigData[0].min_interest_value;
		} else {
			prodConfigData = 12;
		}
		datetime = await sails.helpers.dateTime();
		requestManageData = {
			loan_id: loan_id,
			white_label_id: white_label_id,
			request_start_time: datetime,
			request_end_time: datetime,
			requested_by: req.user.id,
			status: "Success",
			request_type: "credit_eligibility",
			reference_id: 0,
			referenc_name: "giveOfferEligibility",
			json_value: JSON.stringify(req.allParams()),
			error_msg: "",
			request_origin: "nc-onboarding"
		};
		const RateOFInterest = interest_rate || prodConfigData;
		MIR = RateOFInterest / 12;
		const p = loan_amount,
			r = (MIR / 100);
		n = tenure;
		let EMI = Math.round(((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(2));
		requestManageCreate = await RequestManager.create(requestManageData).fetch();
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.eligibilityCalculated,
			EMI: EMI
		});
	}
};

async function fetchMasterData(questionId) {
	const questionMaster = await PreferenceQuestionnaireRd.findOne({id: questionId}).select(["master_data"])
	return JSON.parse(questionMaster.master_data);
}

async function calculateAge(dateString) {
	const [day, month, year] = dateString.split('-').map(part => parseInt(part, 10));
	const birthDate = new Date(year, month - 1, day);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	const dayDiff = today.getDate() - birthDate.getDate();
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--;
	}
	return age;
}

async function getAnswersByDetails(answersArray, questionDetails) {
	const answersMap = {};
	for (const item of answersArray) {
		answersMap[item.question_id] = item.answer;
	}
	const result = {};

	for (const [key, questionId] of Object.entries(questionDetails)) {
		if (answersMap.hasOwnProperty(questionId)) {
			let answer = answersMap[questionId];
			if (['Appraisal_Type', 'Product_Type', 'HL_Sub_Product', 'LAP_Sub_Product', 'Loan_Product'].includes(key)) {
				const masterData = await fetchMasterData(questionId);
				if (masterData) answer = masterData[answer];
				else answer = answer
			} else if (key === 'Age') {
				answer = await calculateAge(answer);
			}
			result[key] = answer;
		}
	}
	return result;
}

async function getTenureHL(product, appraisalType, tenureDataObject) {
	const eligibilityArray = tenureDataObject.eligibility;

	for (let i = 0; i < eligibilityArray.length; i++) {
		const eligibility = eligibilityArray[i];

		if (eligibility.product === product && eligibility.Appraisal_Type.includes(appraisalType)) {
			return eligibility.tenure;
		}
	}
	return 0;
}

async function getTenureLAP(product, amount, appraisalType, tenureDataObject) {
	const eligibilityArray = tenureDataObject.eligibility;

	for (let i = 0; i < eligibilityArray.length; i++) {
		const eligibility = eligibilityArray[i];

		if (product.includes('Residential') && eligibility.product === 'LAP Residential' && eligibility.Appraisal_Type.includes(appraisalType)) {
			return eligibility.tenure;
		}
		if (product.includes('Commercial purchase') && eligibility.product === 'LAP - Commercial purchase' && eligibility.Appraisal_Type.includes(appraisalType)) {
			return eligibility.tenure;
		}
		if (product === 'LAP Residential' && amount < 500000 && eligibility.product === 'LAP<5 Lakhs' && eligibility.Appraisal_Type.includes(appraisalType)) {
			return eligibility.tenure;
		}
		if (product === 'LAP Residential' && amount > 500000 && amount < 800000 && eligibility.product === 'LAP >5 & < 8 Lakhs' && eligibility.Appraisal_Type.includes(appraisalType)) {
			return eligibility.tenure;
		}
		if (product === 'LAP Residential' && amount > 800000 && amount < 2000000 && eligibility.product === 'LAP >8 & < 20 Lakhs' && eligibility.Appraisal_Type.includes(appraisalType)) {
			return eligibility.tenure;
		}
		if (product === 'LAP Residential' && amount > 2000000 && eligibility.product === 'LAP >20 Lakhs' && eligibility.Appraisal_Type.includes(appraisalType)) {
			return eligibility.tenure;
		}
	}
	return 0;
}

async function getMaxLoanAmount(product, appraisalType, lender, maxLoanData) {
	for (let item of maxLoanData) {
		if (item.Product === product && item.Appraisal_Type === appraisalType) {
			return item[lender];
		}
	}
	return 0;
}

async function getEligibilityData(lender, product, equifaxScore, eligibilityData) {

	const lenderData = eligibilityData[lender];
	const minBureauCriteria = lenderData['Min bureau Criteria'];
	let bureauCriteria = 'Equifax score is above the minimum bureau criteria'
	if (equifaxScore < minBureauCriteria) {
		bureauCriteria = 'Equifax score is below the minimum bureau criteria';
	}
	const processingFee = lenderData['Processing Fee'][product];
	const imd = lenderData['IMD'];

	return {processingFee, imd, bureauCriteria};
}

async function getPropertyDetails(propertyName, productName, lender, amount, propertyData) {

	const propertyDetails = propertyData[propertyName];
	if (!propertyDetails[lender]) {
		return {ltv: null, propertyStatus: 'NO GO'};
	}

	const lenderDetails = propertyDetails[lender];
	const status = lenderDetails.Status;
	if (status === 'Not Accepted'){
		return {ltv: null, propertyStatus: 'NO GO'};
	}
	const baseLTV = lenderDetails.Base_LTV;
	const effectOnLTV = lenderDetails.Effect_on_LTV ? lenderDetails.Effect_on_LTV[productName] : 0;

	const baseLTVAmount = amount * (baseLTV / 100);
	const ltv = baseLTVAmount - (baseLTVAmount * (effectOnLTV / 100));
	const propertyStatus = (status === 'Not Accepted') ? 'NO GO' : 'GO';

	return {ltv, propertyStatus};
}

async function getCostOfFundingValue(productName, lender, subType, costOfFundingArray) {
	for (let i = 0; i < costOfFundingArray.length; i++) {
		const item = costOfFundingArray[i];
		if (item.Product === productName && item["Sub Products"] === subType) {
			if (item[lender] != 'NA') {
				return item[lender];
			} else {
				return 0.00;
			}
		}
	}
	return 0;
}

async function getScoreRange(equifaxScore) {
	if (equifaxScore >= 750) {
		return "750+";
	} else if (equifaxScore >= 650 && equifaxScore < 750) {
		return "650-750";
	} else {
		return "Below 650";
	}
}

async function getROIGirdAdjustment(productName, equifaxScore, appraisalType, ROI_Grid) {
	const scoreRange = await getScoreRange(equifaxScore);
	const productROI = ROI_Grid[productName];
	const appraisalROI = productROI[appraisalType];
	const adjustment = appraisalROI[scoreRange];
	return adjustment;
}

async function getS3JSON(filename, bucket, region) {

	params = {
		Bucket: bucket,
		Key: "Eligibility-Calculation/" + filename
	}
	try {
		jsonData = await sails.helpers.s3ViewDocument(filename, bucket, region, JSON.stringify(params));
		return JSON.parse(jsonData.Body.toString('utf-8'))
	} catch (error) {
		return null;
	}
}
