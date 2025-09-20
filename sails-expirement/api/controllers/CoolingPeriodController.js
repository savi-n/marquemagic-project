
const moment = require("moment"),
	{decryptReq, encryptRes} = require("../services/encrypt");

module.exports = {
	/**
	 * @api {post} /coolingPeriod  Cooling Period
	 * @apiDescription Find If Cooling Period is Met
	 * @apiName coolingPeriod
	 * @apiGroup CoolingPeriod Collateral
     *
	 * @apiParam {Number} userId UserId for which Cooling Period is to be found out
	 * @apiParam {Number} whiteLabelId whiteLabelId of the product
	 * @apiParam {Number} productId productId of that product
	 * @apiExample {curl} Example usage:
	 * curl -X POST localhost:1337/coolingPeriod
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 */

	// coolingPeriod: async function (req, res) {

	// 	const reqBody = decryptReq(req.param("data")); // ENCRYPTED
	// 	sails.log("cooling-period-reqbody-", reqBody);
	// 	const createdUserId = reqBody.userId,
	// 		prodId = reqBody.productId,
	// 		whiteLabelId = reqBody.whiteLabelId;


	// 	// const createdUserId = req.param("userId"),
	// 	// 	prodId = req.param("productId"),
	// 	// 	whiteLabelId = req.param("whiteLabelId");

	// 	if (!createdUserId || !prodId || !whiteLabelId) {
	// 		return res.badRequest(sails.config.res.missingFields);
	// 	}

	// 	const loanProductDetails = await LoanProductDetailsRd.findOne({
	// 		where : {
	// 			white_label_id: whiteLabelId,
	// 			id: prodId
	// 		},
	// 		select: ["product_id", "cooling_period"]
	// 	});

	// 	coolingPeriodd = loanProductDetails.cooling_period;

	// 	let productId = [];

	// 	const salary = loanProductDetails.product_id.salaried,
	// 	 business = loanProductDetails.product_id.business,
	// 	 other = loanProductDetails.product_id.others;

	// 	if (Array.isArray(salary)) {
	// 		for (let i in salary) {
	// 			productId.push(salary[i].product_id);
	// 		}
	// 	} else {
	// 		productId.push(salary);
	// 	}

	// 	if (Array.isArray(business)) {
	// 		for (let i in business) {
	// 			productId.push(business[i].product_id);
	// 		}
	// 	} else {
	// 		productId.push(business);
	// 	}

	// 	if (Array.isArray(other)) {
	// 		for (let i in other) {
	// 			productId.push(other[i].product_id);
	// 		}
	// 	} else {
	// 		productId.push(other);
	// 	}

	// 	// console.log("Array is ", productId);
	// 	let loans = await LoanrequestRd.find({
	// 			select: ["id", "loan_ref_id", "RequestDate", "loan_product_id", "loan_status_id", "loan_sub_status_id"],
	// 			where: {
	// 				createdUserId: createdUserId,
	// 				loan_product_id: productId,
	// 				white_label_id: whiteLabelId
	// 			}
	// 		}),
	// 		allowLoan = true;
	// 		// console.log(loans);

	// 	sails.log("All Loans - ", loans);
	// 	loans = loans.filter(loan => {
	// 		const loanReqDate = moment(loan.RequestDate, "YYYY-MM-DD"),
 	// 			today = moment(),
	// 			result = moment.duration(today.diff(loanReqDate)).asDays();
	// 		if (result < coolingPeriodd ){
	// 			if ((loan.loan_status_id == 7 && loan.loan_sub_status_id == 13) ||
	// 			(loan.loan_status_id == 2 && loan.loan_sub_status_id == 9)) {
	// 				loan.dayDiff = Math.trunc(result);
	// 				// console.log(loan.id, loan.loan_status_id, loan.loan_sub_status_id);
	// 				return loan;
	// 			} else {
	// 				// if Loan is in Pending Application (1, null)
	// 				// or NC in progress (2,8)
	// 				// or No doc, Missing Doc, (8, 12)
	// 				// or Duplicate case (15, 15)

	// 				allowLoan = false;
	// 			}
	// 		}
	// 	});
	// 	// console.log("Length is -----",loans.length);

	// 	// If loan is in pending stage... Donot allow to proceed loan for same product id
	// 	if (!allowLoan) {return  res.send({statusCode: "NC200", allowLoan, message : "You have recently created loan. That application has to be processed before you can re-apply!"});}

	// 	let flags;
	// 	const checkLoans = loans.map(async (loan) =>  {
	// 			if (loan.loan_status_id == 7 && loan.loan_sub_status_id == 13) {
	// 				//Not Qualified Stage
	// 				return loan;
	// 			} else {
	// 				flags = await LoanBankMappingRd.find({
	// 					select: ["loan_id", "loan_bank_status", "loan_borrower_status", "meeting_flag"],
	// 					where: {
	// 						loan_id : loan.id
	// 					}
	// 				}).limit(1);

	// 				if (flags.length > 0) {
	// 					loan.bankStatus = flags[0].loan_bank_status;
	// 					loan.borrowerStatus = flags[0].loan_borrower_status;
	// 					loan.meetingFlag = flags[0].meeting_flag;
	// 					if (flags[0].loan_bank_status == 12 && flags[0].loan_borrower_status == 12 &&
	// 						flags[0].meeting_flag == 2) {
	// 						// Final Sanction stage

	// 					}else if (flags[0].loan_bank_status == 14 && flags[0].loan_borrower_status == 7 &&
	// 						(flags[0].meeting_flag == null || flags[0].meeting_flag == 0)) {
	// 						// Rejected stage

	// 					} else {
	// 						// if loan in any other stage dnt allow
	// 						// (NC complete, branch review, expired, Re-assigned, pending approvals, provisionally approved, in-principle sanction)
	// 						allowLoan = false;
	// 					}
	// 					return loan;
	// 				}
	// 			}
	// 		}),

	// 		finalLoans = await Promise.all(checkLoans),
	// 		message = allowLoan ? "Allow Loan ":"You have recently created loan. That application has to be processed before you can re-apply!";

	// 	finalLoans.filter(loan => {if(loan) return loan});
	// 	// console.log(finalLoans.length, "----");
	// 	sails.log("finalLoans - ", finalLoans);
	// 	// return res.send({loans : finalLoans.filter(loan => {if(loan) return loan;}), allowLoan, message });
	// 	return res.send({statusCode: "NC200", allowLoan, message });

	// }

	coolingPeriod: async function (req, res) {

		const reqBody = decryptReq(req.param("data")); // ENCRYPTED
		sails.log("cooling-period-reqbody-", reqBody);
		const createdUserId = reqBody.userId,
			prodId = reqBody.productId,
			whiteLabelId = reqBody.whiteLabelId;

		// const createdUserId = req.param("userId"),
		// 	prodId = req.param("productId"),
		// 	whiteLabelId = req.param("whiteLabelId");

		if (!createdUserId || !prodId || !whiteLabelId) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanProductDetails = await LoanProductDetailsRd.findOne({
			where : {
				white_label_id: whiteLabelId,
				id: prodId
			},
			select: ["product_id", "cooling_period"]
		});

		coolingPeriodd = loanProductDetails.cooling_period;

		let productId = [];

		const salary = loanProductDetails.product_id.salaried,
		 business = loanProductDetails.product_id.business,
		 other = loanProductDetails.product_id.others;

		if (Array.isArray(salary)) {
			for (let i in salary) {
				productId.push(salary[i].product_id);
			}
		} else {
			productId.push(salary);
		}

		if (Array.isArray(business)) {
			for (let i in business) {
				productId.push(business[i].product_id);
			}
		} else {
			productId.push(business);
		}

		if (Array.isArray(other)) {
			for (let i in other) {
				productId.push(other[i].product_id);
			}
		} else {
			productId.push(other);
		}

		// console.log("Array is ", productId);
		let loans = await LoanrequestRd.find({
				select: ["id", "loan_ref_id", "RequestDate", "loan_product_id", "loan_status_id", "loan_sub_status_id"],
				where: {
					createdUserId: createdUserId,
					loan_product_id: productId,
					white_label_id: whiteLabelId
				}
			}),
			allowLoan = true;
			// console.log(loans);

		sails.log("All Loans - ", loans);
		loans = loans.filter(loan => {
			const loanReqDate = moment(loan.RequestDate, "YYYY-MM-DD"),
 				today = moment(),
				result = moment.duration(today.diff(loanReqDate)).asDays();
			if (result < coolingPeriodd ){
				allowLoan = false;
			}
		}
		);
		// console.log("Length is -----",loans.length);
		const message = allowLoan ? "Allow Loan ":"You have recently created loan. That application has to be processed before you can re-apply!";
		return res.send({statusCode: "NC200", allowLoan, message });

	}
};
