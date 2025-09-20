/**
 * CUB
 *
 * @description :: Server-side logic for managing AutoSave
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const jwToken = require("jsonwebtoken"),
	moment = require("moment"),
	md5 = require("md5"),
	momentIndia = require("moment-timezone"),
	{decryptReq, encryptRes} = require("../services/encrypt");
const {Console} = require("winston/lib/winston/transports");
const reqParams = require("../helpers/req-params");

module.exports = {
	/**
	 * @api {post} /cub/generateOtp generateOtp
	 * @apiName Generate Otp
	 * @apiGroup CUB
	 * @apiDeprecated Use cub-services endpoint
	 * @apiDescription Refer http://loan2pal.com/tools/om/dashboard#details/2e69e7291e9a00c9650de60257afa03a
	 */
	/**
	 * @api {post} /cub/verifyOtp verifyOtp
	 * @apiName Verify Otp
	 * @apiGroup CUB
	 * @apiDeprecated Use cub-services endpoint
	 * @apiDescription Refer http://loan2pal.com/tools/om/dashboard#details/2e69e7291e9a00c9650de60257afa03a
	 */
	/**
		 * @api {post} /cub/createCase create CUB Case
		 * @apiName create Cub Case
		 * @apiGroup CUB
		 * @apiExample Example usage:
		 * curl -i http://localhost:1337/cub/createCase
		 * {
			"white_label_id": 32,
			"branchId": 32,
			"bankId": 32,
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
				"incomeType": "", //['NULL', 'salaried', 'business']
				"residenceStatus": "", //['NULL', 'Resident', 'Resident and Ordinarily Resident', 'Resident but Not Ordinarily Resident', 'Non-Resident']
				"countryResidence": "",
				"maritalStatus": "", //['NULL', 'Single', 'Married', 'Widowed', 'Divorced']
				"grossIncome": "",
				"netMonthlyIncome": "",
				"emiDetails":"{}"
			},
			"loanData": {
				loanAmount: "",            // applicable for all
				tenure: "",                // applicable for all
				summary: "",               // applicable for all
				address1: "",              // applicable only for lap and home
				address2: "",              // applicable only for lap and home
				address3: "",              // applicable only for lap and home
				address4: "",              // applicable only for lap and home
				city: "",                  // applicable only for lap and home
				state: "",                 // applicable only for lap and home
				pinCode: "",               // applicable only for lap and home
				modelName: "",             // applicable only for 2 wheelar and 4 wheelar
				assetsValue: "",           // applicable for all
				survey_no: "",             // applicable only for lap and home
				type_of_land: "",          // applicable only for lap and home
				village_name: "",          // applicable only for lap and home
				extent_of_land: "",        // applicable only for lap and home
				forced_sale_value: 0,      // applicable only for lap and home
				sq_feet: 0,                // applicable only for lap and home
				priority: "NA",            // applicable only for lap and home ['1st', '2nd', 'Pari-Passu', 'NA']
				ec_applicable: "YES",      // applicable only for lap and home ['YES','NO'
				exShowroomPrice: 0,        // applicable only for 2 wheelar and 4 wheelar
				accessories: 0,            // applicable only for 2 wheelar and 4 wheelar
				insurance: 0,              // applicable only for 2 wheelar and 4 wheelar
				roadTax: 0,                // applicable only for 2 wheelar and 4 wheelar
				automobileType: "",        // applicable only for 2 wheelar and 4 wheelar
			}
		}
		 * @apiParam {String} white_label_id
		 * @apiParam {String} product_id
		 * @apiParam {String} bankId
		 * @apiParam {String} branchId
		 * @apiParam {Object} applicantData
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
		 * @apiParam {String} applicantData.incomeType ['NULL', 'salaried', 'business']
		 * @apiParam {String} applicantData.residenceStatus ['NULL', 'Resident', 'Resident and Ordinarily Resident', 'Resident but Not Ordinarily Resident', 'Non-Resident']
		 * @apiParam {String} applicantData.countryResidence
		 * @apiParam {String} applicantData.maritalStatus ['NULL', 'Single', 'Married', 'Widowed', 'Divorced']
		 * @apiParam {String} applicantData.grossIncome required only if isEligibility is true
		 * @apiParam {String} applicantData.netMonthlyIncome required only if isEligibility is true
		 * @apiParam {String} applicantData.emiDetails required only if isEligibility is true and contain amount, bank,type
		 * @apiParam {Object} loanData
		 * @apiParam {String} loanData.loanAmount
		 * @apiParam {String} loanData.tenure
		 * @apiParam {String} loanData.assetsValue
		 * @apiParam {String} loanData.summary
		 * @apiParam {String} loanData.modelName
		 * @apiParam {String} loanData.automobileType
		 * @apiParam {String} loanData.survey_no
		 * @apiParam {String} loanData.type_of_land
		 * @apiParam {String} loanData.village_name
		 * @apiParam {String} loanData.extent_of_land
		 * @apiParam {String} loanData.forced_sale_value
		 * @apiParam {String} loanData.sq_feet
		 * @apiParam {String} loanData.priority ['1st', '2nd', 'Pari-Passu', 'NA']
		 * @apiParam {String} loanData.ec_applicable ['YES','NO']
		 * @apiParam {String} loanData.exShowroomPrice
		 * @apiParam {String} loanData.accessories
		 * @apiParam {String} loanData.insurance
		 * @apiParam {String} loanData.roadTax
		 * @apiParam {String} loanData.loan_type_id for Cub not required
		 * @apiParam {String} loanData.loan_usage_type_id for Cub not required
		 * @apiParam {String} loanData.loan_asset_type_id for Cub not required
		 * @apiParam {Object} loanData.homeLoan
		 * @apiParam {String} loanData.homeLoan.loanType
		 * @apiParam {Object} loanData.homeLoan.loanAmount
		 *
		 * @apiSuccess {String} statusCode NC200.
		 * @apiSuccess {String} message Success.
		 * @apiSuccess {String} businessId business id
		 * @apiSuccess {String} loan_ref_id loan reference id id
		 * @apiSuccess {String} loanId loan id
		 *
		 */
	createCubCase: async function (req, res) {
		const reqBody = decryptReq(req.param("data"));

		// const applicant = req.param("applicantData"),
		// 	loan = req.param("loanData"),
		// 	white_label_id = req.param("white_label_id"),
		// 	productId = req.param("product_id"),
		// 	bankId = req.param("bankId"),
		// 	branchId = req.param("branchId"),
		// 	cubDetails = req.user.cubDetails;
		let directorId;

		const applicant = reqBody.applicantData,
			loan = reqBody.loanData,
			white_label_id = reqBody.white_label_id,
			productId = reqBody.product_id,
			bankId = reqBody.bankId,
			branchId = reqBody.branchId,
			equifax = reqBody.eqfaxFetch,
			pincode = reqBody.pincodeFetch,
			cubDetails = req.user.cubDetails;

		const fields = ["applicantData", "loan", "white_label_id", "productId", "bankId", "branchId"];

		const missing = await reqParams.fn(reqBody, fields);
		if (
			!applicant ||
			!loan ||
			!white_label_id ||
			!productId ||
			!bankId ||
			!branchId ||
			applicant.address.length == 0
		) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let customerId = "",
			accountType = "",
			accountNumber = "",
			firstName = "";
		if (cubDetails) {
			customerId = cubDetails.customerId;
			if (cubDetails.accType == "SB") {
				accountType = "Saving";
			} else if (cubDetails.accType == "CA") {
				accountType = "Current";
			} else if (cubDetails.accType == "OLCC") {
				accountType = "OD";
			}
			accountNumber = cubDetails.accNum;
			firstName = cubDetails.firstName;
		}
		const loanProductData = await LoanProductsRd.findOne({
			where: {
				id: productId
			},
			select: [
				"loan_asset_type_id",
				"loan_usage_type_id",
				"loan_type_id",
				"product",
				"loan_request_type",
				"business_type_id"
			]
		});
		if (!loanProductData) {
			return res.badRequest(sails.config.res.invalidProductId);
		}
		const dateTime = await sails.helpers.dateTime();
		let userData, userId;
		if (req.user.usertype == "Branch" && applicant.email) {
			userData = await UsersRd.find({
				email: applicant.email,
				status: "active",
				white_label_id: white_label_id,
				contact: applicant.mobileNo
			});
			if (userData.length > 0) {
				userId = userData[0].id;
			} else {
				userData = await Users.create({
					name: applicant.firstName,
					email: applicant.email,
					contact: applicant.mobileNo,
					password: md5(applicant.mobileNo.toString()),
					user_reference_pwd: applicant.mobileNo,
					usertype: "Borrower",
					parent_id: req.user.id,
					white_label_id: white_label_id,
					createdbyUser: req.user.id,
					originator: req.user.id,
					status: "active",
					origin: req.user.usertype + " " + req.user.user_sub_type,
					osv_name: "",
					notification_flag: "yes"
				}).fetch();
				userId = userData.id;
			}
		}

		(businessDetails = await Business.create({
			businessname: applicant.firstName + " " + applicant.lastName,
			userid: userId || req.user.id,
			first_name: applicant.firstName,
			last_name: applicant.lastName,
			business_email: applicant.email,
			contactno: applicant.mobileNo,
			businesstype: loanProductData.business_type_id.split(",")[0],
			businessindustry: "20",
			businessstartdate: "2001-01-31T18:30:00.000Z",
			businesspancardnumber: applicant.panNumber,
			// noofdirectors: "", // check this
			white_label_id: white_label_id,
			empcount: "0"
		}).fetch()),
			(businessId = businessDetails.id);
		let loanOrigin = "CUB_Online";
		if (req.user.usertype != "Borrower") {
			loanOrigin = "CUB_Branch";
		}
		const branchUser = await UsersRd.find({
			select: ["id"],
			where: {
				branch_id: branchId,
				usertype: "Branch",
				user_sub_type: "Manager",
				status: "active"
			}
		});
		let brnachManager = null;
		if (branchUser.length != 0) {
			brnachManager = branchUser[0].id;
		}
		email = [];
		const banktblData = await BanktblRd.findOne({id: branchId});
		if (banktblData && banktblData.email_id) {
			email.push(banktblData.email_id);
		}
		const report_tat = {
			assignedUserId: req.user.id,
			assignedBy: req.user.name,
			dateTime: dateTime,
			previous_status: "",
			current_status: "Pending Applications",
			message: "",
			count: 1
		};
		const loanRefId = await sails.helpers.commonHelper(),
			loanDetails = await Loanrequest.create({
				loan_request_type: loanProductData.loan_request_type,
				business_id: businessId,
				loan_ref_id: loanRefId,
				loan_amount: loan.loanAmount / 1000,
				loan_amount_um: "Thousand",
				applied_tenure: loan.tenure,
				assets_value: loan.assetsValue / 1000,
				assets_value_um: "Thousand",
				// cur_monthly_emi: "",
				loan_asset_type: loan.loan_asset_type_id
					? loan.loan_asset_type_id
					: loanProductData.loan_asset_type_id.split(",")[0],
				loan_usage_type: loan.loan_usage_type_id
					? loan.loan_usage_type_id
					: loanProductData.loan_usage_type_id.split(",")[0],
				loan_type_id: loan.loan_type_id ? loan.loan_type_id : loanProductData.loan_type_id,
				loan_status_id: "1",
				RequestDate: dateTime,
				loan_summary: loan.summary,
				loan_product_id: productId,
				notification: "1",
				createdUserId: req.user.id,
				white_label_id: white_label_id,
				sales_id: brnachManager, // take  user id from branch mager
				loan_origin: loanOrigin,
				branch_id: branchId,
				modified_on: dateTime,
				default_emails: {email: email},
				reportTat: JSON.stringify({data: [report_tat]})
			}).fetch(),
			loanId = loanDetails.id;
		if (pincode === "failed") {
			pincodeHelper = await sails.helpers.mailer(
				cubDetails.pin,
				JSON.stringify(cubDetails),
				loanDetails.loan_ref_id
			);
		}
		/* Pre-Eligiblity Calculation Starts*/
		try {
			let dscr,
				loanUnderDscr,
				roiFinal,
				amounts = [],
				preEligiblity = {},
				loanType;

			if (
				loanProductData.id === sails.config.cubProductId.twoWheeler.salaried ||
				loanProductData.id === sails.config.cubProductId.twoWheeler.business
			) {
				loanType = "two-wheeler";
			} else if (
				loanProductData.id === sails.config.cubProductId.fourWheeler.salaried ||
				loanProductData.id === sails.config.cubProductId.fourWheeler.business
			) {
				loanType = "four-wheeler";
			} else if (
				loanProductData.id === sails.config.cubProductId.housing.salaried.amount_equals_to ||
				loanProductData.id === sails.config.cubProductId.housing.salaried.amount_less_than ||
				loanProductData.id === sails.config.cubProductId.housing.salaried.amount_greater_than ||
				loanProductData.id === sails.config.cubProductId.housing.business.amount_equals_to ||
				loanProductData.id === sails.config.cubProductId.housing.business.amount_less_than ||
				loanProductData.id === sails.config.cubProductId.housing.business.amount_greater_than
			) {
				loanType = "housing";
			} else if (
				loanProductData.id === sails.config.cubProductId.lap.salaried ||
				loanProductData.id === sails.config.cubProductId.lap.business
			) {
				loanType = "lap";
			} else if (
				loanProductData.id === sails.config.cubProductId.consumerLoan.salaried ||
				loanProductData.id === sails.config.cubProductId.consumerLoan.business
			) {
				loanType = "consumerLoan";
			}

			if (applicant.incomeType === "salaried") {
				[dscr, loanUnderDscr] = calculateDscr(Number(applicant.netMonthlyIncome), 1);
			} else if (applicant.incomeType === "business") {
				[dscr, loanUnderDscr] = calculateDscr(Number(applicant.grossIncome), 12);
			} else {
				dscr = 0;
			}

			if (loanType === "two-wheeler") {
				amounts[0] = 150000;
				if (applicant.incomeType === "business") {
					amounts[1] = 0.5 * Number(applicant.grossIncome || 0);
				} else if (applicant.incomeType === "salaried") {
					amounts[1] = 10 * Number(applicant.netMonthlyIncome || 0);
				}
				amounts[2] = Number(loan.loanAmount || 0);
				amounts[3] = 0.9 * Number(loan.assetsValue || 0);
				amounts[4] = Number(loanUnderDscr || 0);
			} else if (loanType === "four-wheeler") {
				amounts[0] = 1000000;
				if (applicant.incomeType === "business") {
					amounts[1] = 3 * Number(applicant.grossIncome || 0); /* 3 times of gross income */
				} else if (applicant.incomeType === "salaried") {
					amounts[1] = 24 * Number(applicant.netMonthlyIncome || 0); /* 24 times of net monthly income*/
				}
				amounts[2] = Number(loan.loanAmount || 0);
				if (loan.loanAmount > 1000000) {
					amounts[0] = 2500000;
					amounts[3] = 0.9 * Number(loan.assetsValue || 0);
				} else {
					amounts[3] =
						0.9 *
						(Number(loan.exShowroomPrice || 0) + Number(loan.accessories || 0) + Number(loan.roadTax || 0));
				}
				amounts[4] = Number(loanUnderDscr || 0);
			} else if (loanType === "housing") {
				let projectCost;
				const loanAmount = loan.homeLoan.loanAmount;
				if (loan.loanType === "Construction of House/Flat") {
					projectCost = Number(loanAmount.constructionValue || loanAmount.contructionArchitectValue || 0);
					projectCost = projectCost * 0.75;
				} else if (loan.loanType === "Purchase of ready built House/Flat") {
					projectCost = Number(loanAmount.salesValue || 0);
					projectCost = projectCost * 0.75;
				} else if (loan.loanType === "Take over of existing loan from Bank") {
					projectCost = Number(loanAmount.outstanding || 0);
				} else if (loan.loanType === "Purchase of house site and construction") {
					projectCost =
						Number(loanAmount.constructionValue || loanAmount.contructionArchitectValue || 0) +
						Number(loanAmount.landValue || 0);
					projectCost = projectCost * 0.75;
				}
				amounts[0] = 10000000;
				if (applicant.incomeType === "business") {
					amounts[1] = 5 * Number(applicant.grossIncome || 0); /* 5 times of gross income */
				} else if (applicant.incomeType === "salaried") {
					amounts[1] = 60 * Number(applicant.netMonthlyIncome || 0); /* 60 times of net monthly income */
				}
				amounts[2] = Number(loan.loanAmount || 0);
				amounts[3] = Number(projectCost || 0); /* project cost???*/
				amounts[4] = Number(loanUnderDscr || 0);
			} else if (loanType === "lap") {
				const branchDetails = await BanktblRd.findOne({
					where: {
						id: branchId
					},
					select: ["Classification_Type"]
				});
				let locationType = branchDetails.Classification_Type;
				amounts[0] = Number(loan.loanAmount || 0); /* borrower requested loan ???*/
				amounts[1] =
					(Number(loan.valueoftheProperty || 0) * 75 * 80) /
					100 /
					100; /* ??? value of property offered as security*/
				if (locationType === "Rural") amounts[2] = 2500000;
				else if (locationType === "Semi Urban") amounts[2] = 3500000;
				else if (locationType === "Urban") amounts[2] = 7500000;
				else if (locationType === "Metro") amounts[2] = 7500000;
				amounts[3] = Number(loanUnderDscr || 0);
			} else if (loanType === "consumerLoan") {
				amounts[0] = 100000;
				if (applicant.incomeType === "business") {
					amounts[1] = 0.5 * Number(applicant.grossIncome || 0); /* 5 times of gross income */
				} else if (applicant.incomeType === "salaried") {
					amounts[1] = 10 * Number(applicant.netMonthlyIncome || 0); /* 10 times of net monthly income*/
				}
				amounts[2] = Number(loan.loanAmount || 0);
				amounts[3] = 0.9 * Number(loan.assetsValue || 0); /*90% of quotation cost*/
				amounts[4] = Number(loanUnderDscr || 0);
			}

			function calculateDscr(income, noOfMonths) {
				let totEmiPayments = 0;
				// emiDetails might not be present in case of skipping the form.
				if (applicant.emiDetails && applicant.emiDetails.length > 0) {
					applicant.emiDetails.forEach((el) => {
						totEmiPayments += Number(el.emiAmount || 0);
					});
				}

				let roi;
				if (loan.tenure <= 36) {
					roi = 12.25 / 12 / 100;
				} else if (loan.tenure <= 48) {
					if (loanType === "four-wheeler") {
						roi = 12.5 / 12 / 100;
					} else {
						roi = 12.75 / 12 / 100;
					}
				} else {
					roi = 12.75 / 12 / 100;
				}
				if (loanType === "lap") {
					roi = 11.75 / 12 / 100;
				} else if (loanType === "housing") {
					if (loan.tenure <= 60) {
						if (loan.loanAmount <= 3000000) {
							roi = 10.25 / 12 / 100;
						} else if (loan.loanAmount <= 7500000) {
							roi = 10.75 / 12 / 100;
						} else {
							roi = 11.25 / 12 / 100;
						}
					} else if (loan.tenure <= 120) {
						if (loan.loanAmount <= 3000000) {
							roi = 10.75 / 12 / 100;
						} else if (loan.loanAmount <= 7500000) {
							roi = 11.25 / 12 / 100;
						} else {
							roi = 11.75 / 12 / 100;
						}
					} else {
						if (loan.loanAmount <= 3000000) {
							roi = 11.25 / 12 / 100;
						} else if (loan.loanAmount <= 7500000) {
							roi = 11.75 / 12 / 100;
						} else {
							roi = 12.25 / 12 / 100;
						}
					}
				}
				roiFinal = roi;
				let loanAmount = Number(loan.loanAmount);
				let tenure = Number(loan.tenure);
				let emi = (loanAmount * roi * (1 + roi) ** tenure) / ((1 + roi) ** tenure - 1);
				let dscr = income / (noOfMonths * (totEmiPayments + emi));
				let emiUnderDscr = income / 1.5 / noOfMonths - totEmiPayments;
				let loanUnderDscr = (emiUnderDscr * ((1 + roi) ** tenure - 1)) / (roi * (1 + roi) ** tenure);

				return [dscr, loanUnderDscr];
			}
			let minimumPre = amounts[0];
			for (const i in amounts) {
				preEligiblity["case" + i] = amounts[i];
				if (minimumPre > amounts[i]) {
					minimumPre = amounts[i];
				}
			}
			preEligiblity.roi = roiFinal;
			preEligiblity.minimumPreEligiblity = minimumPre;
			await EligiblityAnalytics.create({
				product_id: productId,
				financial_amt: loan.loanAmount,
				userId: req.user.id,
				loanId: loanId,
				status: "Yes",
				pre_eligiblity: preEligiblity,
				dscr: dscr
			});
		} catch (err) {
			console.log(err);
		}
		/* Pre-Eligiblity Calculation Ends*/
		for (let i = 0; i < applicant.address.length; i++) {
			await Businessaddress.create({
				bid: businessId,
				aid: applicant.address[i].addressType == "permanent" ? "1" : "2",
				line1: applicant.address[i].address1 ? applicant.address[i].address1 : "",
				line2: applicant.address[i].address2 ? applicant.address[i].address2 : "",
				line3: applicant.address[i].address3 ? applicant.address[i].address3 : "",
				line4: applicant.address[i].address4 ? applicant.address[i].address4 : "",
				city: applicant.address[i].city,
				state: applicant.address[i].state,
				pincode: applicant.address[i].pinCode,
				locality: "-"
			});
			if (applicant.address[i].addressType == "permanent") {
				// const randomTwoUnique = Math.floor(Math.random() * (+ 999 - + 500)) + + 500;
				const direcorDetails = await Director.create({
					business: businessId,
					dfirstname: applicant.firstName,
					dlastname: applicant.lastName,
					dpancard: applicant.panNumber,
					ddob: applicant.dob,
					demail: applicant.email,
					dcontact: applicant.mobileNo,
					isApplicant: applicant.isApplicant ? applicant.isApplicant : "0",
					address1: applicant.address[i].address1 ? applicant.address[i].address1 : "",
					address2: applicant.address[i].address2 ? applicant.address[i].address2 : "",
					address3: applicant.address[i].address3 ? applicant.address[i].address3 : "",
					address4: applicant.address[i].address4 ? applicant.address[i].address4 : "",
					city: applicant.address[i].city,
					state: applicant.address[i].state,
					pincode: applicant.address[i].pinCode,
					daadhaar: applicant.aadhaar ? applicant.aadhaar : "",
					type_name: "Applicant",
					customer_id: customerId,
					income_type: applicant.incomeType,
					residence_status: applicant.residenceStatus ? applicant.residenceStatus : "NULL",
					country_residence: applicant.countryResidence ? applicant.countryResidence : "",
					marital_status: applicant.maritalStatus ? applicant.maritalStatus : "NULL",
					dcibil_score: applicant.cibilScore ? applicant.cibilScore : null, // not the right way.. read from sails-plaid project directly
					ints: await sails.helpers.dateTime()
				}).fetch();
				directorId = direcorDetails.id;
				await IncomeData.create({
					business_id: businessId,
					director_id: directorId,
					gross_income: applicant.grossIncome ? applicant.grossIncome : "0",
					net_monthly_income: applicant.netMonthlyIncome ? applicant.netMonthlyIncome : "0"
				});
				const emiData = applicant.emiDetails ? JSON.stringify(applicant.emiDetails) : "";
				await LoanFinancials.create({
					business_id: businessId,
					loan_id: loanId,
					fin_type: "Bank Account",
					bank_id: bankId,
					account_type: accountType ? accountType : "",
					account_number: accountNumber ? accountNumber : "",
					account_holder_name: firstName ? firstName : "",
					director_id: directorId,
					sanction_drawing_limit: "{}",
					emi_details: emiData
				});
				const homeLoanData = loan.homeLoan;
				let loan_type = "",
					loanJson = "";
				if (homeLoanData && homeLoanData.loanType) {
					loan_type = homeLoanData.loanType;
					loanJson = homeLoanData.loanAmount;
				}
				await LoanAssets.create({
					business_id: businessId,
					loan_id: loanId,
					property_type: "owned",
					loan_asset_type_id: loan.loan_asset_type_id
						? loan.loan_asset_type_id
						: loanProductData.loan_asset_type_id.split(",")[0],
					owned_type: "Paid_Off",
					address1: loan.address1 ? loan.address1 : "",
					address2: loan.address2 ? loan.address2 : "",
					locality: loan.address3 ? loan.address3 : "",
					city: loan.city ? loan.city : "",
					state: loan.state ? loan.state : "",
					pincode: loan.pinCode ? loan.pinCode : applicant.address[i].pinCode,
					name_landmark: loan.address4 ? loan.address4 : "",
					automobile_type: loan.automobileType ? loan.automobileType : "",
					brand_name: loan.modelName ? loan.modelName : "",
					model_name: loan.modelName ? loan.modelName : "",
					value_Vehicle: loan.assetsValue,
					value: loan.assetsValue,
					ints: dateTime,
					survey_no: loan.survey_no ? loan.survey_no : "",
					no_of_assets: 0,
					type_of_land: loan.type_of_land ? loan.type_of_land : "",
					village_name: loan.village_name ? loan.village_name : "",
					extent_of_land: loan.extent_of_land ? loan.extent_of_land : "",
					forced_sale_value: loan.forced_sale_value ? loan.forced_sale_value : 0,
					sq_feet: loan.sq_feet ? loan.sq_feet : 0,
					insurance_required: "YES",
					priority: loan.priority ? loan.priority : "NA",
					ec_applicable: loan.ec_applicable ? loan.ec_applicable : "YES",
					exShowroomPrice: loan.exShowroomPrice ? loan.exShowroomPrice : 0,
					accessories: loan.accessories ? loan.accessories : 0,
					insurance: loan.insurance ? loan.insurance : 0,
					roadTax: loan.roadTax ? loan.roadTax : 0,
					loan_type: loan_type,
					loan_json: loanJson
				});
			}
		}
		return res.send({
			statusCode: "NC200",
			data: encryptRes({
				message: "Success",
				businessId: businessId,
				loan_ref_id: loanRefId,
				loanId: loanId,
				directorId: directorId,
				business_id: businessDetails
			})
		});
	},
	/**
	 * @api {post} /cub/getLoanDeatils get Loan Details
	 * @apiName get Loan Details
	 * @apiGroup CUB
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/cub/getLoanDeatils
	 * @apiParam {String} loanId
	 * @apiSuccess {String} statusCode NC200.
	 * @apiSuccess {String} message Success.
	 *
	 */ getLoanDetails: async function (req, res) {
		const loan_id = req.param("loanId");
		// const whiteLabelId = req.user.white_label_id.split(", ")[0];
		const params = req.allParams();
		const fields = ["loanId"];
		const missing = await reqParams.fn(params, fields);
		if (!loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanRequest = await LoanrequestRd.findOne({
			id: loan_id
		});
		if (!loanRequest.id) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}

		const doctypeIds = await DoctypeRd.find({
			select: ["id"],
			where: {
				priority: 0
			}
		});

		docIds = [];
		_.each(doctypeIds, (value) => {
			docIds.push(value.id);
		});
		if (req.user.usertype === "Bank") {
			docIds.push(0);
			docIdVal = docIds;
		} else {
			docIdVal = [0];
		}
		const viewLoanList = await LoanrequestRd.find({
			id: loan_id
			// white_label_id: whiteLabelId
		})
			.populate("loan_document", {
				where: {
					status: "active",
					doctype: {
						"!=": docIdVal
					}
				}
			})
			.populate("lender_document")
			.populate("loan_orginitaor")
			.populate("loan_asset_type")
			.populate("createdUserId")
			.populate("unsecured_type")
			.populate("loan_usage_type");
		await sails.helpers.logtrackservice(req, "Loanrequest", req.user.id, "loanrequest");
		Promise.all(
			viewLoanList.map(async (viewLoanListElement) => {
				viewLoanListElement.loan_document.map(async (doc_element) => {
					await DoctypeRd.findOne({
						id: doc_element.doctype
					}).then((docTyperesult) => {
						if (docTyperesult) {
							doc_element.docTypeDetails = docTyperesult;
						} else {
							doc_element.docTypeDetails = null;
						}
					});
				});
				const loantype = viewLoanListElement.loan_type_id.split(", ");
				//get loan type
				await LoantypeRd.find({
					id: loantype
				}).then((result) => {
					if (result) {
						viewLoanListElement.loan_type = result;
					}
				});
				//Loan financial details
				await LoanFinancialsRd.find({
					loan_id: viewLoanListElement.id,
					business_id: viewLoanListElement.business_id
				}).then((result) => {
					if (result.length > 0) {
						viewLoanListElement.loanFinancialDetails = result;
					} else {
						viewLoanListElement.loanFinancialDetails = [];
					}
				});
				//director details
				const directorDetails = await DirectorRd.find({
					business: viewLoanListElement.business_id
				})
					.populate("profession")
					.then((result) => {
						if (result) {
							viewLoanListElement.directors = result;
						} else {
							viewLoanListElement.directors = null;
						}
					});
				viewLoanListElement.incomeData = await IncomeDataRd.find({
					business_id: viewLoanListElement.business_id
				});
				viewLoanListElement.loanAssestsDetails = await LoanAssetsRd.find({
					loan_id: viewLoanListElement.id,
					business_id: viewLoanListElement.business_id
				});
				viewLoanListElement.businessShareData = await BusinessShareholderRd.find({
					businessID: viewLoanListElement.business_id
				});
				viewLoanListElement.loanReferenceData = await LoanReferencesRd.find({
					loan_id: viewLoanListElement.id
				});
				viewLoanListElement.eligiblityData = await EligiblityAnalyticsRd.find({
					loanId: viewLoanListElement.id
				});
				viewLoanListElement.businessMappingData = await BusinessMappingRd.find({
					parent_id: viewLoanListElement.business_id
				});
				viewLoanListElement.assignmentLog = await AssignmentLogRd.find({
					action_event: "loan_assignment",
					action_ref_id: viewLoanListElement.id
				});
				viewLoanListElement.collateralData = await AssetsAdditionalRd.find({
					loan_id: viewLoanListElement.id
				});
				viewLoanListElement.loanBankMapping = await LoanBankMappingRd.find({
					loan_id: viewLoanListElement.id
				});
				viewLoanListElement.loanBankMapping.map(async (loanBankData) => {
					if (loanBankData.applicant_coapplicant_summary) {
						const parseData = JSON.parse(loanBankData.applicant_coapplicant_summary);
						viewLoanListElement.camPdf = parseData;
					} else {
						viewLoanListElement.camPdf = {};
					}
				});
				let branchData = await BanktblRd.findOne({
					select: ["branch", "ifsc"],
					where: {
						id: viewLoanListElement.branch_id
					}
				});
				if (branchData) {
					viewLoanListElement.branchName = branchData.branch;
					let ifsc_code = branchData.ifsc.slice(branchData.ifsc.length - 5);
					viewLoanListElement.ifsc = parseInt(ifsc_code);
				}

				//business details
				await BusinessRd.findOne({
					id: viewLoanListElement.business_id
				})
					.populate("business_address")
					.populate("businesstype")
					.populate("businessindustry")
					.then((result) => {
						if (result) {
							viewLoanListElement.business_id = result;
						} else {
							viewLoanListElement.business_id = null;
						}
					});
				viewLoanListElement.loan_price =
					viewLoanListElement.loan_amount + " " + viewLoanListElement.loan_amount_um;
				viewLoanListElement.assets_data =
					viewLoanListElement.assets_value + " " + viewLoanListElement.assets_value_um;
				viewLoanListElement.annual_turn_over =
					viewLoanListElement.annual_revenue + " " + viewLoanListElement.revenue_um;
				viewLoanListElement.annual_op =
					viewLoanListElement.annual_op_expense + " " + viewLoanListElement.op_expense_um;
				return directorDetails;
			})
		).then(() => {
			return res.ok(viewLoanList[0]);
		});
	},
	/**
	 * @api {post} /cub/viewCaseDetails viewCaseDetails
	 * @apiName View Case Details
	 * @apiGroup CUB
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/cub/viewCaseDetails
	 * @apiParam {String} caseData loan_ ref_id or businessname.
	 * @apiParam {String} ncStatus
	 *
	 * @apiSuccess {Array} result caseDetails.
	 * @apiSuccess {String} message "No record found".
	 *
	 */
	viewCaseDetails: async function (req, res) {
		const caseData = req.param("caseData"),
			ncStatus = req.param("ncStatus"),
			userType = req.user.usertype,
			branchId = req.user.branch_id,
			whiteLabelId = req.user.loggedInWhiteLabelID;

		const params = req.allParams();
		const fields = ["caseData"];
		const missing = await reqParams.fn(params, fields);

		if (!caseData) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const whereCondition = {};
		whereCondition.white_label_id = whiteLabelId;
		if (ncStatus) {
			const NcStatus = await NcStatusManageRd.findOne({white_label_id: whiteLabelId, name: ncStatus});
			if (!NcStatus) {
				return res.badRequest(sails.config.res.NCStatusNotSet);
			}

			if (NcStatus.status1 && NcStatus.status1 != "0") {
				whereCondition.loan_status_id = NcStatus.status1;
			}
			if (NcStatus.status2 && NcStatus.status2 != "0") {
				whereCondition.loan_sub_status_id = NcStatus.status2;
			}
			if (NcStatus.status3 && NcStatus.status3 != "0") {
				whereCondition.loan_bank_status = NcStatus.status3;
			}
			if (NcStatus.status4 && NcStatus.status4 != "0") {
				whereCondition.loan_borrower_status = NcStatus.status4;
			}
			// if (NcStatus.status5)
			//     whereCondition.meeting_flag = NcStatus.status5
			if (NcStatus.status6 && NcStatus.status6 != "0") {
				whereCondition.meeting_flag = NcStatus.status6;
			}
		}

		if (userType == "Branch") {
			whereCondition.branch_id = branchId;
		} else {
			const sectionData = await UsersSectionRd.find({
					select: ["section_ref"],
					where: {
						user_id: req.user.id
					}
				}),
				sectionId = [];
			for (const i in sectionData) {
				sectionId.push(sectionData[i].section_ref);
			}
			whereCondition.Section_Ref = sectionId;
		}

		whereCondition.or = [
			{
				loan_ref_id: {
					contains: caseData
				}
			},
			{
				businessname: {
					contains: caseData
				}
			}
		];
		console.log(whereCondition);
		const loanList = await CubViewRd.find(whereCondition),
			loanListWithAssignmentData = [];
		await Promise.all(
			loanList.map(async (loan) => {
				const loanId = loan.id,
					result = {},
					assignmentLog = await AssignmentLogRd.find({
						action_event: "loan_assignment",
						action_ref_id: loanId
					})
						.sort("upts DESC")
						.limit(1);
				if (assignmentLog.length === 1) {
					const userData = await UsersRd.findOne({
						select: ["id", "name", "usertype", "user_sub_type"],
						where: {
							id: assignmentLog[0].event_ref_id
						}
					});
					result.assignmentLog = assignmentLog[0];
					result.assignmentLog.userData = userData;
					try {
						const assignedToJson = JSON.parse(assignmentLog[0].remarks),
							assignedToUserId = assignedToJson.assignedTo,
							assignedToUserData = await UsersRd.findOne({
								select: ["id", "name", "usertype", "user_sub_type"],
								where: {
									id: assignedToUserId
								}
							});
						result.assignmentLog.assignedToUserData = assignedToUserData;
						loan.assignmentLog = result.assignmentLog;
						loan.loanBankMapping = await LoanBankMappingRd.find({
							loan_id: loanId
						});
						if (
							req.user.usertype == "Credit" &&
							loan.loanBankMapping.length > 0 &&
							loan.loanBankMapping[0].bank_assign_date
						) {
							loan.date = loan.loanBankMapping[0].bank_assign_date;
						} else {
							loan.date = null;
						}
						loanListWithAssignmentData.push(loan);
					} catch (err) {
						console.error(err);
					}
				} else {
					loan.assignmentLog = null;
					loan.loanBankMapping = await LoanBankMappingRd.find({
						loan_id: loanId
					});
					if (
						req.user.usertype == "Credit" &&
						loan.loanBankMapping.length > 0 &&
						loan.loanBankMapping[0].bank_assign_date
					) {
						loan.date = loan.loanBankMapping[0].bank_assign_date;
					} else {
						loan.date = null;
					}
					loanListWithAssignmentData.push(loan);
				}
			})
		);
		if (loanListWithAssignmentData == null || loanListWithAssignmentData.length == 0) {
			return res.send({message: sails.config.msgConstants.recordNotFound});
		}
		return res.send({result: loanListWithAssignmentData});
	},

	/**
	 * @api {post} /cub/updateCase update CUB Case
	 * @apiName Update Cub Case
	 * @apiGroup CUB
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/cub/updateCase
	 *
	 * {
	  "applicantData": {
		  "firstName": "savi", "lastName": "n", "panNumber": "bfbsgshj67", "email": "bhjcdhdhj@nc.co", "mobileNo": "55665665", "business_id": 1234569370, "address": {
			  "aid" : 1, "address1": "", "address2": "sx", "address3": "xx", "address4": "scsad", "city": "sa", "state": "sss", "pinCode": "213232"
		  }, "grossIncome": "", "netMonthlyIncome": "", }, "loanData": {
		  "loan_id": 22344, "loanAmount": "100000", "tenure": "200000", "assetsValue": "", "loanTypeId": "7", "summary": "bncbjbjkaghgfhkagggygeyGD", "productId": ""
	  }, "loanAssetData": {
		  "id": 110, "property_type": "leased", "loan_asset_type_id": 2, "owned_type": "paid_off", "address1": "test address1", "address2": "test address2", "flat_no": "112", "locality": "ramnagar", "city": "banglore", "pincode": "570000", "name_landmark": "SI ATM", "automobile_type": "qw", "brand_name": "d", "model_name": "fd", "value_Vehicle": "122", "dealership_name": "sd", "manufacturing_yr": "123", "Value": "test@123", "cersai_rec_path": "", "survey_no": "", "cersai_asset_id": "", "no_of_assets": "", "type_of_land": 5, "forced_sale_value": "", "sq_feet": "", "insurance_required": "", "priority": "", "ec_applicable": "YES"
	  }, "directorData": [
		  {
			  "director_id": 8735, "firstName": "asa", "lastName": "fed", "email": "sggfg@gnail.com", "dob": "05-06-1995", "panNumber": "", "aadhaar": "", "incomeType": "salaried", "residenceStatus": "Resident", "countryResidence": "", "maritalStatus": "Single", "cibilScore": ""
		  }
	  ]
	  }
	* @apiSuccess {String} statusCode NC200.
	* @apiSuccess {String} message Data updated successfully.
	*
	*/

	updateCubCase: async function (req, res) {
		const {loanData, applicantData, loanAssetData, directorData} = req.allParams();

		const params = req.allParams();
		const fields = ["loanData", "applicantData"];
		const missing = await reqParams.fn(params, fields);

		if (!loanData || !applicantData || !loanData.loan_id || !applicantData.business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const dateTime = await sails.helpers.dateTime();
		let businessName;
		const loanReqData = await LoanrequestRd.findOne({
			id: loanData.loan_id,
			business_id: applicantData.business_id
		}).populate("business_id");
		if (!loanReqData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		if (!loanReqData.business_id.id || loanReqData.business_id.id == 0) {
			sails.config.res.noDataAvailableId.message = "Invalid business id, please enter correct id";
			return res.badRequest(sails.config.res.noDataAvailableId);
		}
		if (loanData) {
			const loanUpdateData = {
				applied_tenure: loanData.tenure || loanReqData.applied_tenure,
				loan_asset_type: loanData.loan_asset_type_id || loanReqData.loan_asset_type_id,
				loan_usage_type: loanData.loan_usage_type_id || loanReqData.loan_usage_type_id,
				loan_type_id: loanData.loan_type_id || loanReqData.loan_type_id,
				modified_on: dateTime,
				loan_summary: loanData.summary || loanReqData.summary
			};
			if (loanData.loanAmount && loanData.loanAmount != "") {
				loanUpdateData.loan_amount = loanData.loanAmount / 1000;
				loanUpdateData.loan_amount_um = "Thousand";
			}
			if (loanData.assetsValue && loanData.assetsValue != "") {
				loanUpdateData.assets_value = loanData.assetsValue / 1000;
				loanUpdateData.assets_value_um = "Thousand";
			}
			await Loanrequest.update({id: loanReqData.id}).set(loanUpdateData).fetch();
		}
		if (applicantData) {
			const {
				firstName,
				lastName,
				email,
				mobileNo,
				panNumber,
				address,
				grossIncome,
				netMonthlyIncome,
				incomeType
			} = applicantData;
			if (firstName && lastName) {
				businessName = firstName + " " + lastName;
			}
			const busData = {
				businessname: businessName || loanReqData.business_id.businessname,
				first_name: firstName || loanReqData.business_id.firstName,
				last_name: lastName || loanReqData.business_id.lastName,
				business_email: email || loanReqData.business_id.email,
				contactno: mobileNo || loanReqData.business_id.mobileNo,
				businesspancardnumber: panNumber || loanReqData.business_id.panNumber
			};
			if (address) {
				const businessAddr = {
					line1: address.address1,
					line2: address.address2,
					line3: address.address3,
					line4: address.address4,
					city: address.city,
					state: address.state,
					pincode: address.pinCode
				};
				await Businessaddress.update({
					bid: applicantData.business_id,
					aid: address.aid
				})
					.set(businessAddr)
					.fetch();
			}
			await Business.update({id: applicantData.business_id}).set(busData).fetch();
			if (grossIncome || netMonthlyIncome) {
				directorId = applicantData.director_id || directorData[0].director_id;
				const incomeFetchData = await IncomeDataRd.findOne({
					business_id: applicantData.business_id,
					director_id: directorId
				});
				if (incomeFetchData) {
					incomeData = {
						gross_income: grossIncome,
						net_monthly_income: netMonthlyIncome
					};
					await IncomeData.update({id: incomeFetchData.id}).set(incomeData).fetch();
				}
			}
		}
		if (directorData && directorData.length > 0) {
			directorData.forEach(async (element) => {
				const dirFetchData = await DirectorRd.findOne({
					id: element.director_id,
					business: applicantData.business_id
				});
				if (!dirFetchData) {
					sails.config.res.noDataAvailableId.message = "Invalid director id, please enter correct id";
					return res.badRequest(sails.config.res.noDataAvailableId);
				}
				const dirData = {
					dfirstname: element.firstName || dirFetchData.dfirstname,
					dlastname: element.lastName || dirFetchData.dlastname,
					demail: element.email || dirFetchData.demail,
					dcontact: element.mobileNo || dirFetchData.dcontact,
					dpancard: element.panNumber || dirFetchData.dpancard,
					ddob: element.dob || dirFetchData.ddob,
					daadhaar: element.aadhaar || dirFetchData.daadhaar,
					income_type: element.incomeType || dirFetchData.income_type,
					residence_status: element.residenceStatus || dirFetchData.residence_status,
					country_residence: element.countryResidence || dirFetchData.country_residence,
					marital_status: element.maritalStatus || dirFetchData.marital_status,
					dcibil_score: element.cibilScore || dirFetchData.dcibil_score,
					customer_id: element.customer_id || dirFetchData.customer_id,
					// added columns to update address as part of bug-fix DOS 303
					address1: element.address1 || dirFetchData.address1,
					address2: element.address2 || dirFetchData.address2,
					address3: element.address3 || dirFetchData.address3,
					address4: element.address4 || dirFetchData.address4,
					locality: element.locality || dirFetchData.locality,
					city: element.city || dirFetchData.city,
					state: element.state || dirFetchData.state,
					pincode: element.pincode || dirFetchData.pincode
				};
				await Director.update({id: dirFetchData.id}).set(dirData).fetch();
			});
			// Adding updation in IncomeData as part of bug-fix.
			// directorData.forEach(async (incomeElement) => {
			// 	const incomeData = await IncomeDataRd.findOne({
			// 		business_id: applicantData.business_id,
			// 		director_id: incomeElement.director_id
			// 	});
			// 	 incomeUpdate = {
			// 		gross_income: incomeElement.gross_income || incomeData.gross_income,
			// 		net_monthly_income: incomeElement.net_monthly_income || incomeData.net_monthly_income
			// 	};
			// 	await IncomeData.update({id: incomeData.id}).set(incomeUpdate).fetch();
			// });
		}
		if (loanData.homeLoan) {
			data = {
				loan_type: loanData.homeLoan.loanType,
				loan_json: loanData.homeLoan.loanAmount
			};
			id = loanData.homeLoan.loanAssetId;
			await LoanAssets.update({id: id}).set(data).fetch();
		}
		if (loanAssetData) {
			const loanAssetFetchData = await LoanAssetsRd.findOne({
				id: loanAssetData.id,
				business_id: applicantData.business_id,
				loan_id: loanReqData.id
			});
			if (!loanAssetFetchData) {
				sails.config.res.noDataAvailableId.message = "Invalid loan asset id, please enter correct id";
				return res.badRequest(sails.config.res.noDataAvailableId);
			}
			const assetData = {
				property_type: loanAssetData.property_type || loanAssetFetchData.property_type,
				loan_asset_type_id: loanAssetData.loan_asset_type_id || loanAssetFetchData.loan_asset_type_id,
				owned_type: loanAssetData.owned_type || loanAssetFetchData.owned_type,
				address1: loanAssetData.address1 || loanAssetFetchData.address1,
				address2: loanAssetData.address2 || loanAssetFetchData.address2,
				flat_no: loanAssetData.flat_no || loanAssetFetchData.flat_no,
				locality: loanAssetData.locality || loanAssetFetchData.locality,
				city: loanAssetData.city || loanAssetFetchData.city,
				state: loanAssetData.state || loanAssetFetchData.state,
				pincode: loanAssetData.pincode || loanAssetFetchData.pincode,
				name_landmark: loanAssetData.name_landmark || loanAssetFetchData.name_landmark,
				automobile_type: loanAssetData.automobile_type || loanAssetFetchData.automobile_type,
				brand_name: loanAssetData.brand_name || loanAssetFetchData.brand_name,
				model_name: loanAssetData.model_name || loanAssetFetchData.model_name,
				value_Vehicle: loanAssetData.value_Vehicle || loanAssetFetchData.value_Vehicle,
				dealership_name: loanAssetData.dealership_name || loanAssetFetchData.dealership_name,
				manufacturing_yr: loanAssetData.manufacturing_yr || loanAssetFetchData.manufacturing_yr,
				value: loanAssetData.value || loanAssetFetchData.value,
				cersai_rec_path: loanAssetData.cersai_rec_path || loanAssetFetchData.cersai_rec_path,
				survey_no: loanAssetData.survey_no || loanAssetFetchData.survey_no,
				cersai_asset_id: loanAssetData.cersai_asset_id || loanAssetFetchData.cersai_asset_id,
				no_of_assets: loanAssetData.no_of_assets || loanAssetFetchData.no_of_assets,
				type_of_land: loanAssetData.type_of_land || loanAssetFetchData.type_of_land,
				forced_sale_value: loanAssetData.forced_sale_value || loanAssetFetchData.forced_sale_value,
				sq_feet: loanAssetData.sq_feet || loanAssetFetchData.sq_feet,
				insurance_required: loanAssetData.insurance_required || loanAssetFetchData.insurance_required,
				priority: loanAssetData.priority || loanAssetFetchData.priority,
				ec_applicable: loanAssetData.ec_applicable || loanAssetFetchData.ec_applicable,
				loan_type: loanAssetData.loan_type || loanAssetFetchData.loan_type,
				loan_json: loanAssetData.loanAmount || loanAssetFetchData.loan_json
			};
			await LoanAssets.update({id: loanAssetData.id}).set(assetData).fetch();
		}
		return res.ok({statusCode: 200, message: sails.config.msgConstants.successfulUpdation});
	},
	// delete this endpoint
	branchFlowLOgin: async function (req, res) {
		const email = req.param("email");
		white_label_id = req.param("white_label_id");

		const params = req.allParams();
		const fields = ["email"];
		const missing = await reqParams.fn(params, fields);

		if (!email) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const userDetails = await UsersRd.findOne({email: email});
		userDetails.loggedInWhiteLabelID = white_label_id || userDetails.white_label_id.split(",")[0];
		jwtToken = jwToken.sign(
			{
				user: userDetails
			},
			sails.config.secret,
			{expiresIn: "1d"}
		);
		return res.send({
			userId: userDetails.id,
			token: jwtToken,
			usertype: userDetails.usertype,
			user_sub_type: userDetails.user_sub_type
		});
	},
	latestLoanList: async function (req, res) {
		const {user_id, customer_id} = req.allParams(),
			date = moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss").toString();

		const params = req.allParams();
		const fields = ["customer_id", "user_id"];
		const missing = await reqParams.fn(params, fields);

		if (!customer_id && !user_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let loanDataFetch,
			loanData = [];
		if (user_id) {
			loanDataFetch = await LoanrequestRd.find({
				createdUserId: user_id,
				RequestDate: {
					">=": date
				}
			}).populate("business_id");
			loanDataFetch.forEach((loanElement) => {
				const {id, loan_ref_id, loan_product_id, RequestDate} = loanElement;
				loanData.push({id, loan_ref_id, loan_product_id, RequestDate});
			});
		} else {
			const directorData = await DirectorRd.find({customer_id});
			if (!directorData || directorData.length == 0) {
				return res.badRequest({status: "nok", message: sails.config.msgConstants.recordNotFound});
			}
			await Promise.all(
				directorData.map(async (element) => {
					loanDataFetch = await LoanrequestRd.findOne({
						business_id: element.business,
						RequestDate: {
							">=": date
						}
					}).populate("business_id");
					if (loanDataFetch && loanDataFetch.business_id) {
						const {id, loan_ref_id, loan_product_id, RequestDate} = loanDataFetch;
						loanData.push({id, loan_ref_id, loan_product_id, RequestDate});
					}
				})
			);
		}
		return res.ok({status: "ok", message: sails.config.latestLoanDetails, data: loanData});
	},
	/**
	 * @api {post} /cub/getLoanStatus Get loan status
	 * @apiName Get loan status
	 * @apiGroup CUB
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/getLoanStatus
	 *
	 *
	 * @apiParam {String} loanRefId NC200.
	 *
	 */
	getLoanStatus: async function (req, res) {
		const loanRefId = req.param("loanRefId");

		const params = req.allParams();
		const fields = ["loanRefId"];
		const missing = await reqParams.fn(params, fields);

		if (!loanRefId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const caseDetails = await CubViewRd.findOne({
			loan_ref_id: loanRefId
		});

		if (!caseDetails || !caseDetails.id) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}

		const whereCondition = {
			white_label_id: caseDetails.white_label_id
		};

		if (caseDetails.loan_status_id) {
			whereCondition.status1 = caseDetails.loan_status_id;
		}
		if (caseDetails.loan_sub_status_id) {
			whereCondition.status2 = caseDetails.loan_sub_status_id;
		}
		if (caseDetails.loan_bank_status) {
			whereCondition.status3 = caseDetails.loan_bank_status;
		}
		if (caseDetails.loan_borrower_status) {
			whereCondition.status4 = caseDetails.loan_borrower_status;
		}
		const meeting_flags = ["", null, "0", "1", "2", 0, 1, 2],
			meeting_flags_string = ["1", "2", 1, 2];
		if (meeting_flags.includes(caseDetails.meeting_flag)) {
			if (meeting_flags_string.includes(caseDetails.meeting_flag)) {
				whereCondition.status6 = parseInt(caseDetails.meeting_flag);
			} else {
				whereCondition.status6 = null;
			}
		}
		if (caseDetails.remarks_val) {
			whereCondition.uw_doc_status = caseDetails.remarks_val;
		}
		const NcStatus = await NcStatusManageRd.find(whereCondition);
		if (NcStatus.length === 0) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.ncStatusNotSet,
				whereCondition
			});
		}

		return res.send({statusName: NcStatus[0].name});
	},

	/**
	 * @api {post} /cub/updateProductId UpdateProductId
	 * @apiName Update Product Id
	 * @apiGroup CUB
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/cub/updateProductId
	 * @apiParam {String} loanId
	 * @apiParam {String} tennur
	 * @apiParam {String} roi
	 * @apiParam {String} productId
	 * @apiParam {String} processCharges
	 * @apiParam {String} sanctionAmount
	 * @apiParam {String} condition
	 * @apiParam {String} holidayPeriod
	 * @apiParam {String} comments
	 * @apiParam {String} emi
	 */
	updateProductId: async function (req, res) {
		const loanId = req.param("loanId"),
			tennur = req.param("tennur"), // loanBanking
			roi = req.param("roi"),
			productId = req.param("productId"),
			processCharges = req.param("processCharges"),
			sanctionAmount = req.param("sanctionAmount"),
			condition = req.param("condition"),
			holidayPeriod = req.param("holidayPeriod"),
			emi = req.param("emi"),
			comments = req.param("comments");

		const params = req.allParams();
		const fields = ["loanId", "tennur", "roi", "processCharges", "sanctionAmount", "holidayPeriod"];
		const missing = await reqParams.fn(params, fields);

		if (!loanId || !tennur || !roi || !processCharges || !sanctionAmount || !holidayPeriod) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		// const dateTime = sails.helpers.indianDateTime()
		const date = new Date(),
			dateTime = momentIndia(date)
				.tz("Asia/Kolkata")
				.subtract(12, "minute")
				.format("YYYY-MM-DD HH:mm:ss")
				.toString();

		let loanBankMappingData = await LoanBankMappingRd.find({loan_id: loanId}).sort("create_at DESC").limit(1);

		if (productId) {
			await Loanrequest.update({id: loanId}).set({
				loan_product_id: productId
			});
		}

		if (loanBankMappingData.length == 0) {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.invalidLoanId
			});
		}

		let preSanction = {};
		preSanction[dateTime] = {
			userId: req.user.id,
			tennur: tennur,
			processCharges: processCharges,
			sanctionAmount: sanctionAmount,
			roi: parseFloat(roi).toFixed(2),
			condition: condition,
			holidayPeriod: holidayPeriod,
			emi: emi
		};

		if (loanBankMappingData[0].pre_sanction_json == null && loanBankMappingData[0].pre_sanction_json != "") {
			preSanction = JSON.stringify(preSanction);
		} else {
			const jsonRemarks = JSON.parse(loanBankMappingData[0].pre_sanction_json);
			jsonRemarks[dateTime] = preSanction[dateTime];
			preSanction = JSON.stringify(jsonRemarks);
		}

		await LoanBankMapping.update({loan_id: loanId}).set({
			pre_sanction_json: preSanction
		});

		if (comments) {
			const loanStatusWithLenderData = await LoanStatusWithLenderRd.find({
				select: ["id", "status"],
				where: {
					status: ["Comments"]
				}
			});

			await LoanStatusComments.create({
				loan_bank_id: loanBankMappingData[0].id,
				user_id: req.user.id,
				user_type: req.user.usertype,
				comment_text: comments,
				lender_status_id: loanStatusWithLenderData[0].id,
				created_time: dateTime,
				created_timestamp: dateTime
			});
		}

		return res.send({statusCode: "NC200", message: "success"});
	},

	/**
	 * @api {post} /cub/getProductList getProductList
	 * @apiName get Product List
	 * @apiGroup CUB
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/cub/getProductList
	 * @apiParam {String} loanId
	 *
	 * @apiParam {String} NC200.
	 */
	getProductList: async function (req, res) {
		const loanId = req.param("loanId");

		const params = req.allParams();
		let fields = ["loanId"];
		let missing = await reqParams.fn(params, fields);

		if (!loanId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let loanData = await LoanrequestRd.findOne({id: loanId});

		fields = ["loanData"];
		missing = await reqParams.fn(loanData, fields);

		if (!loanData || !loanData.id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let loanProductDetails = await LoanProductDetailsRd.findOne({
			white_label_id: loanData.white_label_id,
			product_id: {
				contains: loanData.loan_product_id
			}
		});

		let productId = [];

		let salary = loanProductDetails.product_id.salaried;
		let business = loanProductDetails.product_id.business;
		let other = loanProductDetails.product_id.others;

		if (Array.isArray(salary)) {
			for (let i in salary) {
				productId.push(salary[i].product_id);
			}
			for (let i in business) {
				productId.push(business[i].product_id);
			}
			for (let i in other) {
				productId.push(other[i].product_id);
			}
		} else {
			productId.push(salary);
			productId.push(business);
			productId.push(other);
		}

		let loanProducts = await LoanProductsRd.find({
			select: ["product", "id", "payment_structure"],
			where: {
				id: productId
			}
		});

		return res.send({statusCode: "NC200", message: "success", loanProducts: loanProducts});
	},
	// API to convert HTML file to PDF
	html_to_pdf_converter: async function (req, res) {
		const pdf = require("html-pdf"); // npm package
		fileData = [];
		const {loan_id} = req.allParams();

		const params = req.allParams();
		const fields = ["loan_id"];
		const missing = await reqParams.fn(params, fields);

		if (!loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		//fetching data from loan request and loan Document table
		loanData = await LoanrequestRd.findOne({id: loan_id}).populate("loan_document");
		if (!loanData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		if (loanData.loan_document.length === 0) {
			return res.badRequest(sails.config.res.documentNotUpload);
		}
		// fetching data from whitelabel solution table to get region and bucket
		whiteLabelData = await WhiteLabelSolutionRd.findOne({id: req.user.loggedInWhiteLabelID});
		region = whiteLabelData.s3_region;
		const doc = loanData.loan_document;
		for (const i in doc) {
			let bucket = whiteLabelData.s3_name;
			docExtension = doc[i].uploaded_doc_name.split(".");
			// condition to check active html document
			if (docExtension[1] == "html" && doc[i].status == "active") {
				key = "users_" + doc[i].user_id + "/" + doc[i].doc_name; // key generate for s3 upload
				const params = {
					Bucket: bucket,
					Key: key
				};
				data = await s3.getObject(params).promise(); // fetch html data from s3 bucket
				html = data.Body.toString();
				const options = {
					orientation: "portrait",
					format: "Letter",
					height: "15.5in", //height and width allowed units: mm, cm, in, px
					width: "15in"
				};
				filePath = `./equifaxfiles/${docExtension[0]}.pdf`; // file path to store pdf file in local.
				// code to create pdf file and store it to the folder.
				pdf.create(html, options).toFile(filePath, async (err, res) => {
					if (err) {
						console.log(err);
					}
				});
				document = `users_${doc[i].user_id}/${docExtension[0]}.pdf`; //file url to store pdf file in an s3.
				upload = await sails.helpers.s3UploadViaUrl(document, bucket, filePath); // calling helper to upload pdf file
				bucket = bucket + "/users_" + doc[i].user_id;
				viewDoc = await sails.helpers.s3ViewDocument(`${docExtension[0]}.pdf`, bucket, region); // calling helper to get url to download pdf file
				fileData.push({doc_name: `${docExtension[0]}.pdf`, url: viewDoc});
				await fs.unlinkSync(filePath); //delete the file from local folder
			}
		}
		return res.send({status: "ok", message: "Equifax PDF file", data: fileData});
	}
	/**
	 * @api {post} /cub/cubLoanAccountCreation cubLoanAccountCreation
	 * @apiName cubLoanAccountCreation
	 * @apiGroup CUB
	 * @apiDeprecated Use cub-services endpoint
	 * @apiDescription Refer http://loan2pal.com/tools/om/dashboard#details/2e69e7291e9a00c9650de60257afa03a
	 */
};
