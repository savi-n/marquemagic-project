const reqParams = require("../helpers/req-params");
module.exports = {
	/**
   * @description :: loan criteria list -generic
	* @api {GET} /listLoanCriteria/
	* @apiName listLoanCriteria
	* @apiGroup LoanAcceptance
	* @apiExample Example usage:
	* curl -i localhost:1337/listLoanCriteria
	* @apiHeader authorization
	* @apiSuccess {String} status 'ok'.
	* @apiSuccess {String} message 'Loan Criteria List'.
	* @apiSuccess {Object} data
	* @apiSuccess {Object[]} attribute_list data.attribute_list
	* @apiSuccess {Object[]} product_list data.product_list
	* @apiSuccess {Object[]} operator_list data.operator_list

	*
**/
	listLoanCriteria: async function (req, res) {
		// From Auth Token
		const userId = req.user.id;
		whiteLabelId = req.user.white_label_id;

		const params = {userId, whiteLabelId};
		const fields = ["userId", "whiteLabelId"];
		const missing = await reqParams.fn(params, fields);

		if (!whiteLabelId || !userId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		try {
			// only primary users can create a loan criteria.
			const userEligibility = await UserCorporateMappingRd.find({userid: userId, user_type: "Primary"});
			if (userEligibility.length === 0 || userEligibility[0].userid === null) {
				return res.send({
					status: "nok",
					message: "You are not authorized to create a criteria."
				});
			}
			let productList = [];
			// List of products for a whiteLabelId
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: whiteLabelId});
			if (whitelabelsolution[0].loan_product_type === null || whitelabelsolution[0].loan_product_type === "") {
				return res.send({
					status: "nok",
					message: "Loan product is not setup for this white label"
				});
			}
			const id = whitelabelsolution[0].loan_product_type.split(",");
			await LoanProductsRd.find({
				where: {id: id},
				select: ["product", "id"]
			}).exec((err, list) => {
				if (err) {
					return Error("Error");
				}
				if (list == undefined) {
					return res.badRequest({
						exception: "Invalid Loan Product Type updated"
					});
				}
				productList = JSON.parse(JSON.stringify(list));
			});
			// List of operators
			const operatorsList = await PreferanceOperationRd.find({select: ["id", "label"]});
			// List of attributes, 0 for default can also filter with whiteLableId in future
			const attributeList = await LoanAttributesRd.find({
				where: {white_label_id: 0},
				select: ["id", "attribute_name"]
			});
			const response = {
				product_list: productList,
				attribute_list: attributeList,
				operator_list: operatorsList
			};
			return res.send({
				status: "ok",
				message: "Loan Criteria List",
				data: response
			});
		} catch (e) {
			return res.serverError(e);
		}
	},
	/**
	* @description :: view loans added for a particular user/whitelabel -generic
	* @api {GET} /viewCriteriaAdded/
	* @apiName viewCriteriaAdded
	* @apiGroup LoanAcceptance
	* @apiExample Example usage:
	* curl -i localhost:1337/viewCriteriaAdded
	* @apiHeader   authorization
	* @apiSuccess {String} status 'ok'.
	* @apiSuccess {String} message ''.
	* @apiSuccess {Object[]} data
	* @apiSuccess {String} attribute data.attribute
	* @apiSuccess {Array}  product data.product
	* @apiSuccess {String} operator data.operator
	* @apiSuccess {Array} criteria_id data.criteria_id

	*
**/
	viewCriteriaAdded: async function (req, res) {
		// From Auth Token
		const userId = req.user.id;
		const whiteLabelId = req.user.white_label_id;

		const params = {userId, whiteLabelId};
		const fields = ["userId", "whiteLabelId"];
		const missing = await reqParams.fn(params, fields);

		if (!whiteLabelId || !userId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			query = `SELECT JSON_ARRAYAGG(clc.criteria_id) criteria_id ,la.attribute_name attribute , po.label operator , JSON_ARRAYAGG(lp.product) product , clc.value value from corporate_loan_criteria clc join preference_operation po on (po.p_op_id = clc.operatorid) join loan_attributes la on (la.attribute_id = clc.attributeid) join loan_products lp on (lp.id = clc.productid) where clc.userid =  $1 and clc.white_label_id =$2 and clc.is_deleted = 0 group by clc.value, po.label ,la.attribute_name ;`;
		try {
			const allAddedCriteria = await myDBStore.sendNativeQuery(query, [userId, whiteLabelId]);

			if (allAddedCriteria.rows.length === 0) {
				return res.send({
					status: "ok",
					message: "",
					data: []
				});
			}
			allAddedCriteria.rows.forEach((element) => {
				element.product = JSON.parse(element.product);
				element.criteria_id = JSON.parse(element.criteria_id);
			});
			return res.send({
				status: "ok",
				message: "",
				data: allAddedCriteria.rows
			});
		} catch (e) {
			return res.serverError(e);
		}
	},
	/**
	 * @description :: view loans added for a particular user/whitelabel -generic
	 * @api {POST} /addCriteria/
	 * @apiName addCriteria
	 * @apiGroup LoanAcceptance
	 * @apiExample Example usage:
	 * curl -i localhost:1337/addCriteria
	 * @apiHeader  authorization
	 * @apiParam {Int} attribute_id (request body)
	 * @apiParam {Array} product_id (Int, request body)
	 * @apiParam {Int} operator_id (request body)
	 * @apiParam {String} value (request body)
	 * @apiSuccess {String} status 'ok'.
	 * @apiSuccess {String} message 'successfully added criteria'.

	*
	**/

	addCriteria: async function (req, res) {
		const userId = req.user.id;
		const whiteLabelId = req.user.white_label_id;
		const productId = req.body.product_id;
		const attributeId = req.body.attribute_id;
		const operatorId = req.body.operator_id;
		const value = req.body.value;

		const params = {userId, whiteLabelId, productId, attributeId, operatorId, value};
		const fields = ["userId", "whiteLabelId", "productId", "attributeId", "operatorId", "value"];
		const missing = await reqParams.fn(params, fields);

		if (!whiteLabelId || !userId || !productId || !operatorId || !attributeId || !value) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		// Validation that only primary member can add a criteria
		try {
			const userEligibility = await UserCorporateMappingRd.find({userid: userId, user_type: "Primary"});
			if (userEligibility.length === 0 || userEligibility[0].userid === null) {
				return res.send({
					status: "nok",
					message: "You are not authorized to create a criteria."
				});
			}
			let insertValue = [];
			for (let i = 0; i < productId.length; i++) {
				let insertObject = {};
				insertObject["attributeid"] = attributeId;
				insertObject["operatorid"] = operatorId;
				insertObject["productid"] = productId[i];
				insertObject["white_label_id"] = whiteLabelId;
				insertObject["userid"] = userId;
				insertObject["value"] = value;
				// To check if the productId with same attribute and same whitelabelId and same userId and same operatorId exist - EXEMPT - Pincodes
				// search if the attribute is unique
				let isUnique = await LoanAttributesRd.find({id: attributeId}).limit(1);
				let findObject = {};
				if (isUnique[0].is_unique === 1) {
					findObject = {
						attributeid: attributeId,
						operatorid: operatorId,
						productid: productId[i],
						white_label_id: whiteLabelId,
						userid: userId,
						is_deleted: 0
					};
				} else {
					findObject = {
						attributeid: attributeId,
						operatorid: operatorId,
						productid: productId[i],
						white_label_id: whiteLabelId,
						userid: userId,
						is_deleted: 0,
						value: value
					};
				}
				let findResult = await CorporateLoanCriteriaRd.find(findObject).limit(1);
				if (findResult[0] === undefined) {
					insertValue.push(insertObject);
				} else {
					continue;
				}
			}
			if (insertValue.length === 0) {
				return res.send({
					status: "nok",
					message: "you have already added this criteria for this product."
				});
			}
			let addedCriteria = await CorporateLoanCriteria.createEach(insertValue).fetch();
			console.log(addedCriteria);
			if (addedCriteria) {
				return res.send({
					status: "ok",
					message: "successfully added criteria"
				});
			}
		} catch (e) {
			if (e.code === "E_UNIQUE") {
				return res.send({
					status: "ok",
					message: "Record(s) already exist"
				});
			}
			return res.serverError(e);
		}
	},
	/**
	* @description :: view loans added for a particular user/whitelabel -generic
	* @api {POST} /deleteCriteria/
	* @apiName deleteCriteria
	* @apiGroup LoanAcceptance
	* @apiExample Example usage:
	* curl -i localhost:1337/deleteCriteria
	* @apiHeader authorization
	* @apiParam {Array} criteria_id (request body)
	* @apiSuccess {String} status 'ok'.
	* @apiSuccess {String} message 'successfully deleted the record'.

	*
	**/
	deleteCriteria: async function (req, res) {
		const userId = req.user.id;
		const whiteLabelId = req.user.white_label_id;
		const criteriaId = req.body.criteria_id;

		const params = {userId, whiteLabelId, criteriaId};
		const fields = ["userId", "whiteLabelId", "criteriaId"];
		const missing = await reqParams.fn(params, fields);

		if (!whiteLabelId || !userId || !criteriaId) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		// Validation that only primary member can delete a criteria
		try {
			const userEligibility = await UserCorporateMappingRd.find({userid: userId, user_type: "Primary"});
			if (userEligibility.length === 0 || userEligibility[0].userid === null) {
				return res.send({
					status: "nok",
					message: "You are not authorized to delete a criteria."
				});
			}
			// set is_deleted to 1
			let updateResult = await CorporateLoanCriteria.update({id: criteriaId}, {is_deleted: 1}).exec(
				(err, updateResult) => {
					if (err) {
						return res.send({
							status: "nok",
							message: "records not deleted."
						});
					} else {
						return res.send({
							status: "ok",
							message: "successfully deleted records."
						});
					}
				}
			);
		} catch (e) {
			return res.serverError(e);
		}
	}
};
