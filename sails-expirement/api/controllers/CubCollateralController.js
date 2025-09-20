/**
 * CUB Collateral APIs
 */
const moment = require("moment");

module.exports = {
	/**
	 * @api {post} /cubCollateral/getCollateralDetails Get collateral details
	 * @apiDescription Get collateral details based on customer account number and loan ID
	 * @apiName getCollateralDetails
	 * @apiGroup CUB Collateral
	 * @apiDeprecated Use cub-services endpoint
	 * @apiDescription Refer http://loan2pal.com/tools/om/dashboard#details/2e69e7291e9a00c9650de60257afa03a
	 */
	/**
	 * @api {post} /cubCollateral/addCollateralDetails Add collateral details
	 * @apiDescription Add collateral details based on loan ID
	 * @apiName addCollateralDetails
	 * @apiGroup CUB Collateral
	 * @apiParam {Number} loanID Loan ID for which collateral details should be added
	 * @apiParam {json} collateralDetails Collateral Details to add
	 * @apiExample {curl} Example usage:
	 * curl -X POST localhost:1337/cubCollateral/addCollateralDetails?loanID=1234567&collateralDetails={}
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
{
	"data": {
		"id": 123, // row ID in database
		"user_id": 123456,
		"loan_id": 123456,
		"account_number": null,
		"status": created,
		"created_at": "", // timestamp
		"updated_at": "", // timestamp
		"initial_collateral": [
			{} // data that was just added
		],
		"saved_collateral": {}, // data that was just added
		"modified_collateral": null,
		"remarks": null,
	}
}
	 */
	addCollateralDetails: async function (req, res) {
		if (!req.param("loanID")) {
			return res.badRequest(sails.config.res.missingFields);
		}
		if (!req.param("collateralDetails")) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanID = Number(req.param("loanID")),
			collateralDetails = JSON.parse(req.param("collateralDetails"));
		AssetsAdditional.create({
			user_id: req.user.id,
			loan_id: loanID,
			initial_collateral: [collateralDetails],
			saved_collateral: collateralDetails
		})
			.fetch()
			.then((savedData) => {
				return res.send({data: savedData});
			})
			.catch((error) => {
				console.error(error);
				if (error.code === "E_UNIQUE") {
					return res.status(400).send({
						message: `Data with loanID ${loanID} already exists.`
					});
				} else {
					return res.status(500).send({
						message: sails.config.msgConstants.recordNotCreated
					});
				}
			});
	},
	/**
	 * @api {post} /cubCollateral/saveCollateralDetails Save collateral details
	 * @apiDescription Save collateral details based on collateral number and loan ID
	 * @apiName saveCollateralDetails
	 * @apiGroup CUB Collateral
	 * @apiDeprecated Use cub-services endpoint
	 * @apiDescription Refer http://loan2pal.com/tools/om/dashboard#details/2e69e7291e9a00c9650de60257afa03a
	 */
	/**
	 * @api {post} /cubCollateral/updateCollateralDetails Update collateral details
	 * @apiDescription Update collateral details based on row ID and loan ID
	 * @apiName updateCollateralDetails
	 * @apiGroup CUB Collateral
	 * @apiParam {Number} id row ID in database
	 * @apiParam {Number} loanID Loan ID for verification
	 * @apiParam {json} updatedCollateralDetails Updated collateral details to save in database
	 * @apiExample {curl} Example usage:
	 * curl -X POST localhost:1337/cubCollateral/updateCollateralDetails?id=1234567&loanID=1234567&updatedCollateralDetails={}
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
{
	"data": {
		"id": 123, // row ID in database
		"user_id": 1, // 1 is system fetched and any other number if user created
		"loan_id": 123456,
		"account_number": 123456, // will be null if user created
		"status": "", // created or approved
		"created_at": "", // timestamp
		"updated_at": "", // timestamp
		"initial_collateral": [
			{}, {}, {} // each object is one collateral
		],
		"saved_collateral": {},
		"modified_collateral": {}, // updated collateral details
		"remarks": {}, // or null if data is not saved
	}
}
	 */
	updateCollateralDetails: async function (req, res) {
		if (!req.param("id")) {
			return res.badRequest(sails.config.res.missingFields);
		}
		if (!req.param("loanID")) {
			return res.badRequest(sails.config.res.missingFields);
		}
		if (!req.param("updatedCollateralDetails")) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const id = Number(req.param("id"));
		if (!id) {
			return res.badRequest({message: sails.config.msgConstants.invalidId});
		}
		const loanID = Number(req.param("loanID")),
			updatedCollateralDetails = JSON.parse(req.param("updatedCollateralDetails"));
		AssetsAdditionalRd.findOne({id})
			.then(async (collateralDetailsFromDB) => {
				if (collateralDetailsFromDB && collateralDetailsFromDB.loan_id === loanID) {
					AssetsAdditional.update({id})
						.set({modified_collateral: updatedCollateralDetails})
						.fetch()
						.then((savedData) => {
							return res.send({data: savedData});
						})
						.catch((error) => {
							console.error(error);
							return res.status(500).send({
								message: sails.config.msgConstants.collateralUpdateFailed
							});
						});
				} else {
					return res.status(403).send({message: sails.config.msgConstants.dataMismatch});
				}
			})
			.catch((error) => {
				console.error(error);
				return res.status(500).send({
					message: sails.config.msgConstants.isePleaseTryAgain
				});
			});
	},
	/**
	 * @api {post} /cubCollateral/createCollateralInCub Create collaterals in CUB
	 * @apiDescription Send collaterals from database to CUB
	 * @apiName createCollateralInCub
	 * @apiGroup CUB Collateral
	 * @apiDeprecated Use cub-services endpoint
	 * @apiDescription Refer http://loan2pal.com/tools/om/dashboard#details/2e69e7291e9a00c9650de60257afa03a
	 */

	/**
	 * @api {post} /cubCollateral/deleteCollateral Delete collateral
	 * @apiDescription Delete collateral based on loan ID
	 * @apiName deleteCollateral
	 * @apiGroup CUB Collateral
	 * @apiParam {Number} id row ID in database
	 * @apiParam {Number} loanID Loan ID for which collateral details should be deleted
	 * @apiExample {curl} Example usage:
	 * curl -X POST localhost:1337/cubCollateral/deleteCollateral?id=1234567&loanID=1234567
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
{
	"data": {
		"id": 123, // row ID in database
		"user_id": 123456,
		"loan_id": 123456,
		"account_number": null,
		"status": created,
		"created_at": "", // timestamp
		"updated_at": "", // timestamp
		"initial_collateral": [
			{}
		],
		"saved_collateral": {},
		"modified_collateral": null,
		"remarks": null,
		"status": delete
	}
}
	 */
	deleteCollateral: async function (req, res) {
		if (!req.param("id")) {
			return res.badRequest(sails.config.res.missingFields);
		}
		if (!req.param("loanID")) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const id = Number(req.param("id"));
		const assets_id = req.param("assets_id");
		const insert_loan_assets_data = req.param("insert_loan_assets_data");

		if (!id) {
			return res.badRequest({message: sails.config.invalidId});
		}
		const loanID = Number(req.param("loanID"));

		if (insert_loan_assets_data == true && assets_id && assets_id != "") {
			const deleteAssets = await LoanAssets.updateOne({id: assets_id}).set({status: "delete"});
		}

		AssetsAdditionalRd.findOne({id})
			.then(async (collateralDetailsFromDB) => {
				if (collateralDetailsFromDB && collateralDetailsFromDB.loan_id === loanID) {
					AssetsAdditional.update({id})
						.set({status: "delete"})
						.fetch()
						.then((savedData) => {
							return res.status(200).send({message: sails.config.msgConstants.collateralDeleted, data: savedData});
						})
						.catch((error) => {
							console.error(error);
							return res.status(500).send({
								message: sails.config.msgConstants.collateralDeletionFailed
							});
						});
				} else {
					return res.status(403).send({message: sails.config.msgConstants.dataMismatch});
				}
			})
			.catch((error) => {
				console.error(error);
				return res.status(500).send({
					message: sails.config.msgConstants.isePleaseTryAgain
				});
			});
	},

	/**
	 * @api {post} /createAppraisalNote/ Create createAppraisalNote
	 * @apiDescription Create AppraisalNote
	 * @apiName createAppraisalNote
	 * @apiGroup CUB Collateral
	 */

	/**
	 * @api {post} /cubCollateral/deleteCollateral Delete collateral
	 * @apiDescription Delete collateral based on loan ID
	 * @apiName deleteCollateral
	 * @apiGroup CUB Collateral
	 * @apiParam {Number} id row ID in database
	 * @apiParam {Number} loanID Loan ID for which collateral details should be deleted
	 * @apiExample {curl} Example usage:
	 * curl -X POST localhost:1337/cubCollateral/deleteCollateral?id=1234567&loanID=1234567
	 * @apiSuccessExample {json} Success-Response:
	 * */

	createAppraisalNote: async function (req, res) {
		const {loan_id,
			loan_bank_mapping_id,
			borrower_info,
			profession,
			request,
			credit_score_applicant,
			credit_score_coapplicant,
			credit_score_coapplicant_2,
			repayment_capacity,
			security_value_coverage,
			justification,
			recommendation
		} = req.allParams();

		// checking mandatory fields
		if (!loan_id || !loan_bank_mapping_id || !recommendation || !justification) {
			return res.badRequest(sails.config.res.missingFields);
		}
		//checking loan bank mapping data based on laon_id and loan_bank_mapping_id
		const loanBankMappingData = await LoanBankMappingRd.findOne({id: loan_bank_mapping_id, loan_id});
		if (!loanBankMappingData) {
			return res.badRequest(sails.config.res.noLoanBankDataFound);
		}
		let appraisalData = {};
		if (loanBankMappingData.appraisal_inputs) {
			// parse appraisal data
			appraisalData = JSON.parse(loanBankMappingData.appraisal_inputs);
		}
		//create appraisal data object
		data = {
			borrower_info: borrower_info || null,
			profession: profession || null,
			request: request || null,
			credit_score_applicant: credit_score_applicant || null,
			credit_score_coapplicant: credit_score_coapplicant || null,
			repayment_capacity: repayment_capacity || null,
			security_value_coverage: security_value_coverage || null,
			justification: justification,
			recommendation: recommendation,
			user_id: req.user.id,
			userName: req.user.name
		};
		if (credit_score_coapplicant_2) {
			data.credit_score_coapplicant_2 = credit_score_coapplicant_2;
		}
		formattedDate = moment().add(5, "h").add(30, "m").format("YYYY-MM-DD HH:mm:ss").toString();
		appraisalData[formattedDate] = data;
		//updating appraisal data to the loanbankmapping table
		const updateLoanBankData = await LoanBankMapping.update({id: loanBankMappingData.id})
			.set({appraisal_inputs: JSON.stringify(appraisalData)}).fetch();

		if (updateLoanBankData.length === 0) {
			return res.badRequest(sails.config.res.updateError);
		}
		sails.config.successRes.dataUpdated.data = updateLoanBankData;
		return res.ok(sails.config.successRes.dataUpdated);
	},

	appraisalCommentList: async function (req, res) {
		const loan_id = req.param("loan_id");
		loan_bank_mapping_id = req.param("loan_bank_mapping_id");
		if (!loan_id || !loan_bank_mapping_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanBankMappingData = await LoanBankMappingRd.findOne({id: loan_bank_mapping_id, loan_id});
		if (!loanBankMappingData) {
			return res.badRequest(sails.config.res.noLoanBankDataFound);
		}
		let data;
		if (loanBankMappingData.appraisal_inputs) {
			data = JSON.parse(loanBankMappingData.appraisal_inputs);
			sails.config.successRes.listedSuccess.data = data;
			return res.ok(sails.config.successRes.listedSuccess);
		} else {
			sails.config.res.commentsNotFound.data = [];
			return res.ok(sails.config.res.commentsNotFound);
		}
	},

	appraisalDownload: async function (req, res) {
		const {loan_id, loan_bank_mapping_id} = req.allParams();

		if (!loan_id || !loan_bank_mapping_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({id: loan_id}).populate("business_id");
		if (!loanData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		whiteLabelData = await WhiteLabelSolutionRd.findOne({id: loanData.white_label_id});
		const {s3_name, s3_region} = whiteLabelData;
		loanBankMappingData = await LoanBankMappingRd.findOne({id: loan_bank_mapping_id, loan_id});
		if (!loanBankMappingData) {
			return res.badRequest(sails.config.res.noLoanBankDataFound);
		}

		url = sails.config.pdfUrl.appraisalUrl;
		body = {
			loan_id, loan_bank_mapping_id
		};

		pdfData = await sails.helpers.sailstrigger(url, JSON.stringify(body), {}, "POST");
		console.log("---------------------------------------", pdfData);
		if (pdfData.status == "nok") {
			return res.badRequest({status: "nok", data: pdfData});
		} else {
			parsePdfData = JSON.parse(pdfData);
			console.log(parsePdfData, parsePdfData.doc_name);
			lenderDocData = await LenderDocumentRd.find({
				loan: loan_id,
				loan_bank_mapping: loan_bank_mapping_id,
				doc_type: sails.config.docUpload.appraisalDoc,
				uploaded_doc_name: parsePdfData.doc_name,
				status: "active"
			}).sort("on_upd DESC");
			if (lenderDocData.length > 0 || parsePdfData.doc_name) {
				// bucket = s3_name + "/users_" + lenderDocData[0].user_id;
				bucket = s3_name + "/users_" + loanData.business_id.userid;
				url = await sails.helpers.s3ViewDocument(parsePdfData.doc_name, bucket, s3_region);
				return res.send({
					status: "ok",
					url: url
				});
			} else {
				return res.badRequest(sails.config.res.appraisalDataNotFound);
			}
		}
	}
};
