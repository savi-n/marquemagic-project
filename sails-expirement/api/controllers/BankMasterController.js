/**
 * BankMaster
 *
 * @description :: Server-side logic for managing BankMaster
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /BankMaster/ bank master
 * @apiName bank master
 * @apiGroup Bank
 *  @apiExample Example usage:
 * curl -i localhost:1337/BankMaster/
 *
 * @apiSuccess {Number} id bank master id.
 * @apiSuccess {String} bankname bank name.
 * @apiSuccess {String} white_label_id white label id.
 * @apiSuccess {String} logo_url Logo Url.
 * @apiSuccess {String} min_loan_amt Minimum Loan Amount.
 * @apiSuccess {String} max_loan_amt Maximum Loan Amount.
 */

/**
 * @api {get} /bankList/ Bank List
 * @apiName Lender Bank List
 * @apiGroup Bank
 *  @apiExample Example usage:
 * curl -i localhost:1337/bankList/
 *
 * @apiSuccess {Number} id bank master id.
 * @apiSuccess {String} bankname bank name.
 * @apiSuccess {String} white_label_id white label id.
 * @apiSuccess {String} logo_url Logo Url.
 * @apiSuccess {String} min_loan_amt Minimum Loan Amount.
 * @apiSuccess {String} max_loan_amt Maximum Loan Amount.
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	list: async function (req, res, next) {
		const users_whitelabel = req.user.loggedInWhiteLabelID;
		let banks;
		if (req.user.usertype == "Bank") {
			banks = await BankMasterRd.find({isLender: "Yes", white_label_id: users_whitelabel});
		} else if (req.user.usertype == "CA" || req.user.usertype == "Borrower") {
			banks = await BankMasterRd.find({white_label_id: users_whitelabel});
		} else {
			return res.badRequest({status: "nok", message: sails.config.msgConstants.actionNotPermitted});
		}
		return res.ok({status: "ok", message: sails.config.msgConstants.bankListDisplayed, data: banks});
	},
	index: function (req, res, next) {
		BankMasterRd.find({status: "active"}).exec((err, list) => {
			if (err) {
				return Error("Error");
			}

			return res.view({result: list});
		});
	},

	show: function (req, res, next) {
		BankMasterRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	edit: function (req, res, next) {
		BankMasterRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({element: value});
		});
	},

	update: function (req, res, next) {
		BankMaster.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("bankMaster/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		BankMaster.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/bankMaster");
		});
	},
	/**
		* @api {post} /case-addCompanyDetails/ add company details
		* @apiName add company details
		* @apiGroup Case
		* @apiExample Example usage:
		* curl -i localhost:1337/case-addCompanyDetails
		*
		* @apiParam {Number} case_id case id.
		* @apiParam {String} account_number account number.
		* @apiParam {String} subsidiary_name subsidiary_name.
		* @apiParam {Number} bank_name bank name id.
		* @apiParam {String} relative relative('Subsidiary Company','Relative',
		  'Holding Company',
		  'Promoter/Proprietor',
		  'Director/Partner',
		  'Other Account',
		  'Other Group Company').
		*
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Successfully Added company details.

		*
	**/
	add_company_details: async function (req, res) {
		const {account_number, subsidiary_name, relative, bank_name, case_id: loan_ref_id} = req.body.allParams;

		if (!loan_ref_id || !subsidiary_name || !bank_name) {
			return res.badRequest(sails.config.res.missingFields);
		}

		LoanrequestRd.findOne({loan_ref_id})
			.then((loanDetails) => {
				if (!loanDetails) {
					throw new Error("invalidCaseOrData");
				}

				data = {
					parent_id: loanDetails.business_id,
					business_name: subsidiary_name,
					bank_name,
					relation: relative
				};

				data.account_number = account_number || "1234567890123";

				return BusinessMappingRd.findOne({
					parent_id: loanDetails.business_id,
					business_name: subsidiary_name,
					bank_name
				}).then((businessMapDetails) => {
					let company_data = {};

					if (businessMapDetails) {
						company_data = _.pick(
							businessMapDetails,
							"business_name",
							"bank_name",
							"account_number",
							"relation"
						);

						sails.config.res.companyDetailsExists.data = company_data;
						throw new Error("companyDetailsExists");
					} else {
						BusinessMapping.create(data)
							.fetch()
							.then(async (businessMapping) => {
								company_data = _.pick(
									businessMapping,
									"business_name",
									"bank_name",
									"account_number",
									"relation"
								);

								sails.config.successRes.companyAdded.data = company_data;

								if (loanDetails.white_label_id == sails.config.fedfina_whitelabel_id){
									return res.ok({ecryptesResponse : await sails.helpers.crypto.with({
										action: "aesCbc256Encrypt",
										data: sails.config.successRes.companyAdded
									})});
								}
								else return res.ok(sails.config.successRes.companyAdded);
							});
					}
				});
			})
			.catch((err) => {
				switch (err.message) {
					case "invalidCaseOrData":
						return res.badRequest(sails.config.res.invalidCaseOrData);
					case "companyDetailsExists":
						return res.badRequest(sails.config.res.companyDetailsExists);
					default:
						throw err;
				}
			});
	},

	/**
	 * @api {get} /bank_list/ bank list
	 * @apiName bank list
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/bank_list
	 *
	 * * "NOTE":
	 *         1. if you want to list all the bank names, you need to pass bank_name = 'All'
	 *         2. if you want to list particular bank name, you need pass bank_name = bank name
	 *
	 * @apiParam {String} bank_name bank name(mandatory).
	 *
	 * @apiSuccess {String} status 'ok'.
	 * @apiSuccess {String} message Bank list successfully displayed.
	 * @apiSuccess {Object} bank_list
	 * @apiSuccess {Number} bank_list.id bank id.
	 * @apiSuccess {String} bank_list.bankname bank name.
	 *
	 **/
	bank_list: async function (req, res) {
		const {bank_name} = req.allParamsData;

		if (!bank_name) {
			return res.badRequest(sails.config.res.missingFields);
		}

		if (bank_name == "All") {
			const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
				query =
					"SELECT bankid, bankname FROM bank_master where parent_bank_flag = 'Yes' and (white_label_id ='' or white_label_id =1)  and type = 'Bank' and bankname NOT LIKE '%namast%' and bankname NOT lIKE '%test%'";
			nativeResult = await myDBStore.sendNativeQuery(query);
			sails.config.successRes.bankListDisplayed.bank_list = nativeResult.rows;
			return res.ok(sails.config.successRes.bankListDisplayed);
		} else {
			BankMasterRd.find({
				bankname: {
					contains: bank_name
				}
			})
				.select("bankname")
				.limit(1)
				.then((bank) => {
					if (!bank || bank.length === 0) {
						throw new Error("incorrectBankName");
					}

					sails.config.successRes.bankListDisplayed.bank_list = bank;
					return res.ok(sails.config.successRes.bankListDisplayed);
				})
				.catch((err) => {
					switch (err.message) {
						case "incorrectBankName":
							return res.badRequest(sails.config.res.incorrectBankName);
						default:
							throw err;
					}
				});
		}
	},

	/**
	 `  * @description :: subsidary list
		* @api {get} /getSubsidaryDetails Subsidary list
		* @apiName Subsidary list
		* @apiGroup Case
		* @apiExample Example usage:
		* curl -i localhost:1337/getSubsidaryDetails

		* @apiParam {String} case_id Loan reference id (mandatory).
		*
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Successfully listed.
		* @apiSuccess {String} DES_CODE NC08.
		* @apiSuccess {Object[]} data
		* @apiSuccess {Number} data.id
		* @apiSuccess {String} data.is_parent
		* @apiSuccess {Number} data.parent_id
		* @apiSuccess {String} data.business_name
		* @apiSuccess {String} data.bank_name
		* @apiSuccess {String} data.account_number
		* @apiSuccess {String} data.relation
		*
	**/
	getSubsidiaryDetails: async function (req, res) {
		const case_id = req.param("case_id");
		if (!case_id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		const loanReqData = await LoanrequestRd.findOne({loan_ref_id: case_id}).populate("business_id");
		if (!loanReqData) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}

		const subsidiaryData = await BusinessMappingRd.find({parent_id: loanReqData.business_id.id});
		if (subsidiaryData.length == 0) {
			return res.ok(sails.config.res.noDataAvailable);
		}

		Promise.all(
			subsidiaryData.map(async (subsidiaryElement) => {
				const bankName = await BankMasterRd.findOne({id: subsidiaryElement.bank_name}).select(["bankname"]);
				subsidiaryElement["bank_name"] = bankName;
				subsidiaryElement["businessName"] = loanReqData.business_id.businessname;
			})
		).then(() => {
			sails.config.successRes.listedSuccess.data = subsidiaryData;
			return res.ok(sails.config.successRes.listedSuccess);
		});
	},
	/**
	 * @api {get} /relationValues Relation Values
	 * @apiName Relation Values
	 * @apiGroup Case
	 * @apiExample Example usage:
	 * curl -i localhost:1337/relationValues
	 * @apiSuccess {String} status 'ok'.
	 * @apiSuccess {String} message Relation Data List.
	 * @apiSuccess {String[]} data
	 *
	 **/
	relationValues: async function (req, res) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			query =
				"SELECT COLUMN_TYPE from information_schema.COLUMNS where TABLE_NAME ='business_mapping' and COLUMN_NAME ='relation'";
		nativeResult = await myDBStore.sendNativeQuery(query);
		const values = nativeResult.rows[0].COLUMN_TYPE.substr(5).replace(/['()]/g, "").split(",");
		return res.ok({status: "ok", message: "Relation Data List", data: values});
	},
	/**
	`  * @description :: Update Subsidiary Details
	   * @api {post} /updateSubsidiaryDetails Update Subsidiary   Details
	   * @apiName Update Subsidiary Details
	   * @apiGroup Case
	   * @apiExample Example usage:
	   * curl -i localhost:1337/updateSubsidiaryDetails

		* @apiParam {Number} id subsidiary id(Mandatory).
		* @apiParam {String} account_number account number.
		* @apiParam {String} subsidiary_name subsidiary_name.
		* @apiParam {Number} bank_name bank name id.
		* @apiParam {String} relative relative('Subsidiary Company','Relative',
		  'Holding Company',
		  'Promoter/Proprietor',
		  'Director/Partner',
		  'Other Account',
		  'Other Group Company').
		*
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Data updated successfully.
		* @apiSuccess {Strng} DES_CODE NC08.
		* @apiSuccess {Object[]} data
		* @apiSuccess {String} data.created_time
		* @apiSuccess {String} data.updated_time
		* @apiSuccess {Number} data.id
		* @apiSuccess {String} data.is_parent
		* @apiSuccess {Number} data.parent_id
		* @apiSuccess {String} data.business_name
		* @apiSuccess {String} data.bank_name
		* @apiSuccess {String} data.account_number
		* @apiSuccess {String} data.relation
	   *
   **/
	updateSubsidiaryDetails: async function (req, res) {
		const id = req.body.id,
			account_number = req.body.account_number,
			subsidiary_name = req.body.subsidiary_name,
			relative = req.body.relative,
			bank_name = req.body.bank_name;
		if (!id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		data = {
			business_name: subsidiary_name,
			bank_name,
			account_number,
			relation: relative
		};
		await BusinessMappingRd.findOne({id: id}).then((businessMapDetails) => {
			if (businessMapDetails) {
				BusinessMapping.update({id: id})
					.set(data)
					.fetch()
					.then((updateData) => {
						BankMasterRd.findOne({id: updateData[0].bank_name})
							.select(["bankname"])
							.then((bankName) => {
								updateData[0].bank_name = bankName;
								BusinessRd.findOne({id: updateData[0].parent_id})
									.select(["businessname"])
									.then((businessData) => {
										updateData[0].businessName = businessData.businessname;
										sails.config.successRes.dataUpdated.data = updateData;
										return res.ok(sails.config.successRes.dataUpdated);
									});
							});
					});
			} else {
				return res.badRequest(sails.config.res.noDataAvailableId);
			}
		});
	},

	/**
   `  * @description :: Add Subsidiary Details
	  * @api {post} /addSubsidiaryDetails/ Add Subsidiary Details
	  * @apiName Add Subsidiary Details
	  * @apiGroup Case
	  * @apiExample Example usage:
	  * curl -i localhost:1337/addSubsidiaryDetails
	  *
	  * @apiParam {Number} case_id case id.
	  * @apiParam {String} account_number account number.
	  * @apiParam {String} subsidiary_name subsidiary_name.
	  * @apiParam {Number} bank_name bank name id.
	  * @apiParam {String} relative relative('Subsidiary Company','Relative',
		'Holding Company',
		'Promoter/Proprietor',
		'Director/Partner',
		'Other Account',
		'Other Group Company').
	  *
	  * @apiSuccess {String} status 'ok'.
	  * @apiSuccess {String} message Successfully Added company details.
	  * @apiSuccess {String} DES_CODE NC08
	  * @apiSuccess {Object} data
	  * @apiSuccess {String} data.business_name
	  * @apiSuccess {Object} data.bank_name
	  * @apiSuccess {String} data.account_number
	  * @apiSuccess {String} data.relation
  **/
	addSubsidiaryDetails: async function (req, res) {
		const account_number = req.body.account_number,
			subsidiary_name = req.body.subsidiary_name,
			relative = req.body.relative,
			bank_name = req.body.bank_name,
			case_id = req.body.case_id,
			id = req.body.id;
		if (!case_id || !subsidiary_name || !bank_name) {
			return res.badRequest(sails.config.res.missingFields);
		}
		console.log("--------------------------------------------------", wt_data.loans.add_subsidiary)
		LoanrequestRd.findOne({loan_ref_id: case_id})
			.populate("business_id")
			.then((loanDetails) => {
				if (req.user.loggedInWhiteLabelID !== loanDetails.white_label_id ||
					(wt_data.loans && !wt_data.loans.add_subsidiary)) {
					return res.badRequest({
						status : "nok",
						message : "You are now allowed to perform this action."
					});
				}
				if (!loanDetails) {
					return res.badRequest(sails.config.res.invalidCaseOrData);
				}

				data = {
					parent_id: loanDetails.business_id.id,
					business_name: subsidiary_name,
					bank_name,
					relation: relative
				};
				data.account_number = account_number || "1234567890123";
				BankMasterRd.findOne({id: bank_name})
					.select(["bankname"])
					.then((bankName) => {
						if (bankName) {
							if (id) {
								BusinessMappingRd.findOne({id}).then((businessMapDetails) => {
									if (businessMapDetails) {
										BusinessMapping.update({id})
											.set(data)
											.fetch()
											.then((updateData) => {
												updateData.bank_name = bankName;
												updateData.businessName = loanDetails.business_id.businessname;
												sails.config.successRes.dataUpdated.data = updateData;
												return res.ok(sails.config.successRes.dataUpdated);
											});
									} else {
										return res.badRequest(sails.config.res.noDataAvailableId);
									}
								});
							} else {
								return BusinessMappingRd.findOne({
									parent_id: loanDetails.business_id.id,
									business_name: subsidiary_name,
									bank_name
								}).then((businessMapDetails) => {
									if (businessMapDetails) {
										businessMapDetails.bank_name = bankName;
										businessMapDetails.businessName = loanDetails.business_id.businessname;
										sails.config.res.companyDetailsExists.data = businessMapDetails;
										return res.badRequest(sails.config.res.companyDetailsExists);
									} else {
										BusinessMapping.create(data)
											.fetch()
											.then((businessMapping) => {
												businessMapping.bank_name = bankName;
												businessMapping.businessName = loanDetails.business_id.businessname;
												sails.config.successRes.companyAdded.data = businessMapping;
												return res.ok(sails.config.successRes.companyAdded);
											});
									}
								});
							}
						} else {
							return res.badRequest({
								status: "nok",
								message: sails.config.msgConstants.wrongBankId
							});
						}
					});
			})
			.catch((err) => {
				throw err;
			});
	},
	bank_listNew: async function (req, res) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			query = "SELECT bankid as id, bankname FROM bank_master where parent_bank_flag = 'Yes' and (white_label_id ='' or white_label_id =1)  and type in ('Bank' , 'NBFC') and bankname NOT LIKE '%namast%' and bankname NOT lIKE '%test%'";

		nativeResult = await myDBStore.sendNativeQuery(query);
		return res.ok(nativeResult.rows);
	},
	bankListMaster: async function (req, res) {
		const bankList = await BankMasterRd.find({
			select: ["id", "bankname"],
			where: {
				status: "active"
			}
		});
		return res.send({status: "ok", bankList: bankList});
	},
	subsidiary_details: async function (req, res) {
		let reqData = req.allParams();
		let businessMapDetails = [];
		let message;
		if (reqData.data.subsidiary_details && reqData.data.subsidiary_details.length > 0) {
			for (obj of reqData.data.subsidiary_details) {
				data = {
					parent_id: reqData.business_id,
					business_name: obj.business_name,
					bank_name: obj.bank_name,
					account_number: obj.account_number,
					relation: obj.relation
				};
				if (obj.id) {
					updatedRecord = await BusinessMapping.update({id: obj.id}).set(data).fetch();
					businessMapDetails.push(updatedRecord);
					message = sails.config.successRes.updateSubsidiaryData;
				} else {
					createdRecord = await BusinessMapping.create(data).fetch();
					businessMapDetails.push(createdRecord);
					message = sails.config.successRes.createSubsidiaryData;
					trackData = await sails.helpers.onboardingDataTrack(reqData.loan_id, reqData.business_id, "", req.user.id, reqData.section_id, "");
				}
			}
			message.data = businessMapDetails;
			return res.ok(message);
		} else {
			return res.badRequest(sails.config.res.missingDirORsubsidiaryData);
		}
	},
	get_subsidiary_details: async function (req, res) {
		let {business_id} = req.allParams();
		params = {business_id};
		fields = ["business_id"];
		missing = await reqParams.fn(params, fields);
		if (!business_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let businessDetails = await BusinessMappingRd.find({parent_id: business_id});
		if (businessDetails.length > 0) {
			message = sails.config.successRes.fetchSubsidiaryData;
			message.data = businessDetails;
			return res.ok(message);
		} else {
			return res.ok({
				status: 'ok',
				message: "No subsidiary data found for this business id",
				data: []
			});
		}
	}
};
