/**
 * SanctionDeviationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	getLoanApprovalConditionByLoanProduct: async (req, res) => {
		try {
			const loanProductId = req.param(sails.config.msgConstants.REQUEST_PARAM_LOAN_PRODUCT_ID);

			validateRequestedLoanProductId(loanProductId, res);

			const loanProduct = await validateLoanProduct(loanProductId, res);
			let conditions = loanProduct.conditions;
			conditions = JSON.parse(conditions)?.deviations_approvals
			if (!Array.isArray(conditions)) {
				for (obj of Object.keys(conditions)) {
					conditions[obj] = conditions[obj].filter(item => {
						return item.approval_user_sub_type.includes(req.user.user_sub_type);
					});
				}
			}
			return res.send({
				status: sails.config.msgConstants.OK_STATUS,
				message: sails.config.msgConstants.LOAN_APPROVAL_CONDITION_BY_LOAN_PRODUCT_FETCHED,
				data: conditions
			});
		} catch (error) {
			return res.serverError(
				sails.config.msgConstants.LOAN_APPROVAL_CONDITION_BY_LOAN_PRODUCT_SERVER_ERROR + error
			);
		}
	}
};

/**
 * NOTE:
 * The following functions are related to validations.
 */

function validateRequestedLoanProductId(loanProductId, res) {
	if (!loanProductId) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.LOAN_PRODUCT_ID_MANDATORY
		});
	}

	if (!sails.config.msgConstants.NUMBER_REGEX_PATTERN.test(loanProductId)) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.PRODUCT_ID_TYPE_VALIDATION
		});
	}
}

async function validateLoanProduct(loanProductId, res) {
	const loanProduct = await LoanProductsRd.findOne({
		id: loanProductId
	});

	if (!loanProduct) {
		return res.send({
			status: sails.config.msgConstants.NOT_OK_STATUS,
			message: sails.config.msgConstants.LOAN_PRODUCT_NOT_FOUND + loanProductId
		});
	}
	return loanProduct;
}
