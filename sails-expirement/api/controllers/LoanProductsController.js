/**
 * LoanProducts
 *
 * @description :: Server-side logic for managing LoanProducts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
/**
 * @api {get} /loanproducts/ Loans
 * @apiName GetLoanProducts
 * @apiGroup Loans
 *  @apiExample Example usage:
 * curl -i localhost:1337/loanproducts/
 * @apiSuccess {Number} id ID of the loan product.
 * @apiSuccess {String} product Product.
 * @apiSuccess {String} payment_structure Payment Structure.
 * @apiSuccess {String} security Payment security.
 * @apiSuccess {Number} loan_request_type loan request type.
 * @apiSuccess {String} loan_type_id loan type id.
 * @apiSuccess {String} loan_asset_type_id loan asset id.
 * @apiSuccess {String} loan_usage_type_id loan usage type id.
 * @apiSuccess {Number} parent_flag
 * @apiSuccess {Number} parent_id parent id.
 * @apiSuccess {String} created payment created date and time.
 * @apiSuccess {Object} create_json  Json Object for creating loan.
 * @apiSuccess {Object} edit_json  Json Object for editing loan.
 * @apiSuccess {String} business_type_id  business type id.
 *
 */
const reqParams = require("../helpers/req-params");
const encryptService = require("../services/encrypt");
module.exports = {
	index: async function (req, res) {
		let id, product_type = null;
		const obj_arr = [],
			product1 = [],
			product2 = [],
			product3 = [],
			parentList = [],
			prod_id = [],
			other_child_prod = [];
		try {
			product_type = JSON.parse(req.user.products_type);
		} catch (err) {
			product_type = {};
		}
		if (product_type && Object.keys(product_type).length > 0 && product_type.generic_flow_products) {
			id = product_type.generic_flow_products;
		} else {
			const user_whitelabel = req.user.loggedInWhiteLabelID,
				whitelabelsolution = await WhiteLabelSolutionRd.find({
					id: user_whitelabel
				});
			if (whitelabelsolution[0].loan_product_type === null || whitelabelsolution[0].loan_product_type === "") {
				// this should go in development.js
				id = sails.config.whiteLabelIdArray;
			} else {
				id = whitelabelsolution[0].loan_product_type.split(",");
			}
		}
		const logService = await sails.helpers.logtrackservice(req, "loanproducts", req.user.id, "loan_products");
		await LoanProductsRd.find({id: id}).exec((err, list) => {
			if (err) {
				return Error("Error");
			}
			if (list == undefined) {
				return res.badRequest({
					exception: sails.config.msgConstants.invalidLoanUpdated
				});
			}
			_.each(list, (value) => {
				parentList.push(value.product_group_name);
				if (value.parent_id == 0) {
					product1.push(value);
				} else if (value.parent_flag === 1) {
					product2.push(value);
				} else {
					product3.push(value);
				}
			});
			const newArr = [...new Set(parentList)];
			product1.forEach((prod) => {
				prod_id.push(prod.id);
				const child_product = [];
				product2.forEach((child_prod) => {
					if (prod && prod.id === child_prod.parent_id) {
						child_product.push(child_prod);
						prod.childProduct = child_product;
					}
					if (prod.id !== child_prod.parent_id && child_prod.parent_flag === 1) {
						other_child_prod.push(child_prod);
					}
				});
				if (!prod.childProduct) {
					prod.childProduct = [];
				}

				if (child_product.length > 0) {
					child_product.forEach((sub_child) => {
						const sub_child_product = [];
						product3.forEach((child_prod) => {
							if (sub_child.id === child_prod.parent_id) {
								sub_child_product.push(child_prod);
								sub_child.subChildProduct = sub_child_product;
							}
						});
						if (!sub_child.subChildProduct) {
							sub_child.subChildProduct = [];
						}
					});
				}
				obj_arr.push(prod);
			});
			if (other_child_prod.length > 0) {
				other_child_prod.forEach((child_product) => {
					if (prod_id.indexOf(child_product.parent_id) === -1) {
						const sub_child_product_list = [];
						product3.forEach((sub_child_prod) => {
							if (child_product.id === sub_child_prod.parent_id) {
								sub_child_prod.subChildProduct = [];
								sub_child_product_list.push(sub_child_prod);
								child_product.childProduct = sub_child_product_list;
							}
						});
						if (!child_product.childProduct) {
							child_product.childProduct = [];
						}
						obj_arr.push(child_product);
					}
				});
			}
			const data = [...new Set(obj_arr.map((item) => item))];
			return res.send({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				payload: {
					data: data,
					parentList: newArr
				}
			});
		});
	},

	show: function (req, res, next) {
		LoanProductsRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		LoanProductsRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		LoanProducts.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("loanProducts/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		LoanProducts.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/loanProducts");
		});
	},
	/**
   *
   * @api {post} /productList/ loan product list
   * @apiName loan product list
   * @apiGroup Loans
   *  @apiExample Example usage:
   * curl -i localhost:1337/productList/
   * @apiParam {String} white_label_id white label id.
   *
   * @apiSuccess {Object[]} business list of business loan products.
   * @apiSuccess {Object[]} salaried list of salaried loan products.

   */
	product_list: async function (req, res, next) {
		const whitelabel = req.param("white_label_id"),
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: whitelabel});
		if (whitelabelsolution[0].loan_product_type === null || whitelabelsolution[0].loan_product_type === "") {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.loanNotSetup
			});
		}
		const id = whitelabelsolution[0].loan_product_type.split(",");
		await LoanProductsRd.find({
			where: {id: id},
			select: ["product", "id", "loan_request_type"]
		}).exec((err, list) => {
			if (err) {
				return Error("Error");
			}
			if (list == undefined) {
				return res.badRequest({
					exception: sails.config.msgConstants.invalidLoanUpdated
				});
			}
			const loan_prod_data = JSON.parse(JSON.stringify(list)),
				business = [],
				salaried = [];
			loan_prod_data.forEach((item) => {
				if (item.loan_request_type === 1) {
					business.push(item);
				} else {
					salaried.push(item);
				}
			});

			return res.send({
				business: business,
				salaried: salaried
			});
		});
	},

	/**
	 * @api {GET} /productDetails loan Product Details
	 * @apiName loan product Details
	 * @apiGroup Loans
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/productDetails
	 * @apiParam {String} white_label_id white label id.
	 * @apiParam {String} product_id its loan_product_deatils id
	 *
	 * @apiSuccess {Object} loanDetails object of loan details.
	 */
	product_details: async function (req, res, next) {
		const whitelabelId = req.param("white_label_id"),
			id = req.param("product_id"),
			loan_request_type = req.param("loan_request_type"),
			onboard_vendor = req.param("onboard_vendor");
		if (!whitelabelId) {
			return res.badRequest({
				status: "nok",
				message: "White_label_id is missing."
			});
		}
		const whiteLabelData = await WhiteLabelSolutionRd.findOne({id: whitelabelId}).select("mandatory_field");
		if (!whiteLabelData) {
			return res.badRequest({
				status: "nok",
				message: "Invalid White Label Id."
			})
		}
		const whiteLabel_mandatory_field = JSON.parse(whiteLabelData.mandatory_field);
		let loanDetails = null, product_type = null;
		let whereCondition = {
			isActive: "true",
			white_label_id: whitelabelId
		};
		if (loan_request_type) whereCondition.loan_request_type = loan_request_type;
		try {
			product_type = JSON.parse(req.user.products_type);
		} catch (err) {
			product_type = {};
		}
		if (id) {
			whereCondition.or = [{id: id}, {parent_id: id}];
		}
		else if (product_type && Object.keys(product_type).length > 0 && product_type.onboarding_flow_products) {
			whereCondition.or = [
				{id: product_type.onboarding_flow_products},
				{parent_id: product_type.onboarding_flow_products}
			];
		}
		const vendor_onboarding_products = whiteLabel_mandatory_field?.vendor_onboarding_products,
			products_to_be_hidden = whiteLabel_mandatory_field?.products_to_be_hidden;
		if (!id) {
			if (onboard_vendor === "true" && vendor_onboarding_products) whereCondition.id = vendor_onboarding_products;
			else if ((!onboard_vendor || onboard_vendor === "false") && products_to_be_hidden) whereCondition.id = {"!=": products_to_be_hidden};
		}
		loanDetails = await LoanProductDetailsRd.find({
			where: whereCondition,
			select: [
				"product_details",
				"color_theme_react",
				"basic_details",
				"edit_json",
				"product_id",
				"loan_request_type",
				"otp_configuration",
				"parent_id",
				"sub_products"
			]
		});
		for (const i in loanDetails) {
			loanDetails[i] = {...JSON.parse(loanDetails[i].basic_details), ...loanDetails[i]};
			!loanDetails.length > 0;
			delete loanDetails[i].basic_details;
			if (loanDetails[i].product_details) {
				loanDetails[i].product_details = JSON.parse(loanDetails[i].product_details);
			}
			if (loanDetails[i].color_theme_react) {
				loanDetails[i].color_theme_react = JSON.parse(loanDetails[i].color_theme_react);
			}
		}
		if (loanDetails.length === 1 && id) {
			loanDetails = loanDetails[0];
		} else {
			const prodObj = await linkSubproducts(loanDetails);
			if (id) loanDetails = prodObj[0];
			else loanDetails = prodObj;
		}
		// if (id && whitelabelId) {
		// 	loanDetails = await fetchLoanProducts({white_label_id: whitelabelId, id});
		// 	if (loanDetails.length === 1) {
		// 		loanDetails = loanDetails[0];
		// 	} else {
		// 		const prodObj = await linkSubproducts(loanDetails);
		// 		loanDetails = prodObj[0];
		// 	}
		// } else {
		// 	if (whitelabelId) {
		// 		loanDetails = await fetchLoanProducts({white_label_id: whitelabelId});
		// 	} else {
		// 		loanDetails = await fetchLoanProducts({products_type: products_type.split(",").map(Number)});
		// 	}
		// 	const result = await linkSubproducts(loanDetails);
		// 	loanDetails = result;
		// }
		if (loanDetails) {
			return res.send({
				status: "ok",
				data: loanDetails
			});
		}
		return res.send({
			status: "nok",
			message: sails.config.msgConstants.invalidProductOrWhitelabelId
		});
	},
	/**
	   * @description :: case product list
		* @api {Post} /case-productList/ Product list
		* @apiName Product list
		* @apiGroup Case
		* @apiExample Example usage:
		* curl -i localhost:1337/case-productList
		* @apiParam {String} white_label_id white label id(encrypted white label id)
		* @apiSuccess {String} status 'ok'.
		* @apiSuccess {String} message Product listed successfully.
		* @apiSuccess {Object} data
		* @apiSuccess {Object[]} data.business_products Business product list.
		* @apiSuccess {Object[]} data.salaried_products Salaried product list.

		*
	**/
	case_product_list: async function (req, res) {
		let {white_label_id} = req.body.allParams;

		if (!white_label_id) {
			return res.badRequest(sails.config.res.missingFields);
		}

		white_label_id = await sails.helpers.whitelabelDecryption(white_label_id);

		if (!white_label_id || white_label_id === "error") {
			return res.badRequest(sails.config.res.invalidWhiteLabel);
		}

		WhiteLabelSolutionRd.findOne({
			id: white_label_id
		})
			.then((whitelabel) => {
				if (
					(whitelabel && whitelabel.loan_product_type !== "") ||
					(whitelabel && whitelabel.loan_product_type !== null)
				) {
					const product_id = whitelabel.loan_product_type.split(",").map(Number);

					LoanProductsRd.find({
						where: {id: product_id},
						select: ["id", "product", "loan_request_type"]
					}).then(async (productList) => {
						const business = [],
							salaried = [];

						productList.forEach((element) => {
							if (element.loan_request_type === 1) {
								element.loan_request_type = "Business";
								business.push({id: element.id, product: element.product});
							} else {
								element.loan_request_type = "Salaried";
								salaried.push({id: element.id, product: element.product});
							}
						});
						data = {
							business_products: business,
							salaried_products: salaried
						};
						sails.config.successRes.productListed.data = data;
						return res.ok(sails.config.successRes.productListed);
					});
				} else {
					throw new Error("noLoanProductWhiteLabel");
				}
			})
			.catch((err) => {
				switch (err.message) {
					case "noLoanProductWhiteLabel":
						return res.badRequest(sails.config.res.noLoanProductWhiteLabel);
					default:
						throw err;
				}
			});
	},

	eligiblityProductList: async (req, res) => {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({
				id: user_whitelabel
			});
		let id = [1];
		if (whitelabelsolution[0].loan_product_type === null || whitelabelsolution[0].loan_product_type === "") {
			// should go in development.js
			id = sails.config.whiteLabelIdArray;
		} else {
			id = whitelabelsolution[0].loan_product_type.split(",");
		}
		const logService = await sails.helpers.logtrackservice(req, "loanproducts", req.user.id, "loan_products");
		await LoanProductsRd.find({id: id}).exec((err, list) => {
			if (err) {
				return Error("Error");
			}
			if (list == undefined) {
				return res.badRequest({
					exception: sails.config.msgConstants.invalidLoanUpdated
				});
			}

			return res.send(list);
		});
	},

	createProductLink: async (req, res) => {
		const {user_id, product_id} = req.allParams();
		if (!user_id || !product_id) {
			return res.send({
				status: "nok",
				statusCode: "NC400",
				message: sails.config.msgConstants.invalidParameter
			});
		}

		const white_label_id = req.user.loggedInWhiteLabelID;

		try {
			// query the db and the domain name
			const row_data = await WhiteLabelSolutionRd.findOne({
				where: {id: white_label_id},
				select: ["site_url"]
			});

			const domain_name = row_data.site_url,
				url = sails.config.create_product_link.is_prod_env ? `https://${domain_name}` : `http://${domain_name}`,
				btoa = require("btoa"),
				product_id_BASSE64 = btoa(product_id),
				encryptedData = encryptService.encryptRes(user_id),
				productUrl = url + sails.config.create_product_link.path + product_id_BASSE64 + "?cid=" + encryptedData,
				tinyurl = require("tinyurl");

			tinyurl.shorten(productUrl, (url, err) => {
				if (!err) {
					console.log(url);
					return res.send({
						status: "ok",
						statusCode: "NC200",
						message: "Success",
						url: productUrl,
						shortUrl: url
					});
				} else {
					console.log(err);
					return res.send({
						status: "nok",
						statusCode: "NC500",
						message: sails.config.msgConstants.isePleaseTryAgain,
						error: err
					});
				}
			});
		} catch (err) {
			console.log(err);
			return res.send({
				status: "nok",
				statusCode: "NC500",
				message: sails.config.msgConstants.isePleaseTryAgain,
				error: err
			});
		}
	},

	product_update: async function (req, res) {
		const {loan_id, loan_product_id, comments, parent_product_id} = req.allParams();
		const moment = require("moment");
		params = {loan_id, loan_product_id};
		fields = ["loan_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		let datetime = await sails.helpers.dateTime(),
			prev_product_data, curr_product_data, prev_sub_product_data, curr_sub_product_data;
		loanrequest_records = await Loanrequest.findOne({id: loan_id});
		if ((loan_product_id && loan_product_id == loanrequest_records.loan_product_id) &&
			(parent_product_id && parent_product_id == loanrequest_records.parent_product_id)) {
			return res.badRequest({
				status: "nok",
				message: "Trying to change to same sub product id is not allowed"
			});
		}
		const commentsData = {
			userId: req.user.id,
			type: "Comments",
			message: comments,
			"product/sub_product_modified_by": req.user.name
		};
		let {loan_request_type, loan_asset_type, loan_usage_type, loan_type_id} = loanrequest_records;
		if (loan_product_id) {
			prev_sub_product_data = await LoanProductsRd.findOne({id: loanrequest_records.loan_product_id});
			curr_sub_product_data = await LoanProductsRd.findOne({id: loan_product_id});

			loan_request_type = curr_sub_product_data.loan_request_type;
			loan_asset_type = curr_sub_product_data.loan_asset_type_id.split(",")[0];
			loan_usage_type = curr_sub_product_data.loan_usage_type_id.split(",")[0];
			loan_type_id = curr_sub_product_data.loan_type_id.split(",")[0];

			commentsData.prev_sub_product = prev_sub_product_data ? prev_sub_product_data.product : "";
			commentsData.curr_sub_product = curr_sub_product_data ? curr_sub_product_data.product : "";
		}
		if (parent_product_id) {
			prev_product_data = await LoanProductDetailsRd.findOne({id: loanrequest_records.parent_product_id}).select("basic_details");
			curr_product_data = await LoanProductDetailsRd.findOne({id: parent_product_id}).select("basic_details");

			commentsData.prev_product = prev_product_data ? JSON.parse(prev_product_data.basic_details).name : "";
			commentsData.curr_product = curr_product_data ? JSON.parse(curr_product_data.basic_details).name : "";
		}
		commentsData.history = {
			"Previous Product": commentsData.prev_product,
			"Previous Sub Product": commentsData.prev_sub_product,
			"Current Product": commentsData.curr_product,
			"Current Sub Product": commentsData.curr_sub_product
		}
		let remarks = {};
		datetime = moment(datetime).add({h: 5, m: 42}).format("YYYY-MM-DD HH:mm:ss").toString();
		if (loanrequest_records.remarks) {
			remarks = JSON.parse(loanrequest_records.remarks);
			remarks = {[datetime]: commentsData, ...remarks};
		} else {
			remarks[datetime] = commentsData;
		}
		const loanrequest_data = await Loanrequest.update({id: loan_id})
			.set({
				remarks: JSON.stringify(remarks),
				loan_product_id: loan_product_id || loanrequest_records.loan_product_id,
				parent_product_id: parent_product_id || loanrequest_records.parent_product_id,
				loan_request_type, loan_asset_type, loan_usage_type, loan_type_id
			}).fetch();
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.successfulUpdation,
			data: {
				loan_request_data: loanrequest_data
			}
		});
	},

	loan_type_data: async function (req, res) {
		const loan_product_id = req.param("loan_product_id");
		if (!loan_product_id) {
			return res.ok({
				status: "ok",
				message: "loan_product_id is missing."
			});
		}
		let loan_type_id = [];
		const loan_product_data = await LoanProductsRd.findOne({id: loan_product_id}).select("loan_type_id");
		if (loan_product_data && loan_product_data.loan_type_id) {
			loan_type_id = await Loantype.find({id: loan_product_data.loan_type_id.split(",")}).select("loanType");
		}
		return res.ok({
			status: "ok",
			message: "loan type list",
			data: loan_type_id
		});
	},

	update_loan_type: async function (req, res) {
		const {loan_id, loan_type_id} = req.allParams();
		if (!loan_id || !loan_type_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({id: loan_id});
		if (!loanData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		const datetime = await sails.helpers.dateTime();
		const updateLoanType = await Loanrequest.update({id: loan_id}).set({
			loan_type_id,
			modified_on: datetime
		}).fetch();

		return res.send({
			status: "ok",
			message: "Loan Type Updated Successfully.",
			data: updateLoanType[0]
		});
	},
	dynamic_json: async function (req, res) {
		const product_id = req.param("product_id");
		if (!product_id) {
			return res.badRequest({
				status: "nok",
				message: "Mandatory fields are missing."
			});
		}
		const loanProductData = await LoanProductsRd.findOne({id: product_id})
			.select(["product", "payment_structure", "security", "loan_request_type", "loan_type_id",
				"loan_asset_type_id", "loan_usage_type_id", "parent_flag", "parent_id", "created", "business_type_id", "dynamic_forms"]);
		if (!loanProductData.dynamic_forms) {
			loanProductData.dynamic_forms = await sails.helpers.dynamicForms();
		}
		return res.ok({
			status: "ok",
			loan_products: loanProductData
		});
	}
};

async function linkSubproducts(objects) {
	const parent_product = [], subProduct = [], product_list = [];
	_.each(objects, (value) => {
		if (!value.parent_id || value.parent_id == 0) parent_product.push(value);
		if (value.parent_id && value.parent_id != 0) subProduct.push(value);
	});

	parent_product.forEach((parent_prod) => {
		sub_products = [];
		subProduct.forEach(sub_prod => {
			if (parent_prod.id == sub_prod.parent_id) {
				sub_products.push(sub_prod);
			}
		});
		parent_prod.sub_products = sub_products;
		product_list.push(parent_prod);
	});

	return product_list;
}
async function fetchLoanProducts(objects) {
	const where_condition = {
		isActive: "true"
	};
	if (objects.id) {
		where_condition.white_label_id = objects.white_label_id;
		where_condition.or = [{id: objects.id}, {parent_id: objects.id}];
	} else if (objects.products_type) {
		where_condition.id = objects.products_type;
	} else {
		where_condition.white_label_id = objects.white_label_id;
	}
	const loanDetails = await LoanProductDetailsRd.find({
		where: where_condition,
		select: [
			"product_details",
			"color_theme_react",
			"basic_details",
			"edit_json",
			"product_id",
			"loan_request_type",
			"otp_configuration",
			"parent_id",
			"sub_products"
		]
	});
	for (const i in loanDetails) {
		loanDetails[i] = {...JSON.parse(loanDetails[i].basic_details), ...loanDetails[i]};
		!loanDetails.length > 0;
		delete loanDetails[i].basic_details;

		if (loanDetails[i].product_details) {
			loanDetails[i].product_details = JSON.parse(loanDetails[i].product_details);
		}
		if (loanDetails[i].color_theme_react) {
			loanDetails[i].color_theme_react = JSON.parse(loanDetails[i].color_theme_react);
		}
	}
	return loanDetails;
}
