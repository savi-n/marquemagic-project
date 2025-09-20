/**
 * LoanProductTypeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/**
* Loan Product Details
* @description :: Loan Product Details Based on product id

* @api {GET} /loanproducttype/ loan product type
* @apiName Loan Product Details
* @apiGroup Loans
* @apiParam {number} loan_product_id loan product id.

* @apiExample Example usage:
* curl -i loanproducttype?loan_product_id=7
* @apiSuccess {String} status ok.
* @apiSuccess {String} message Successfully Listed Loan Product Details.
* @apiSuccess {Object[]} LoanProductDetails list of data.
* @apiSuccess {Number} LoanProductDetails.id id.
* @apiSuccess {String} LoanProductDetails.product
* @apiSuccess {String} LoanProductDetails.payment_structure payment structure.
* @apiSuccess {String} LoanProductDetails.security security.
* @apiSuccess {Object[]} LoanProductDetails.loan_request_type loan request type.
* @apiSuccess {Object[]} LoanProductDetails.loan_type_id loan type id.
* @apiSuccess {Object[]} LoanProductDetails.loan_asset_type_id loan asset type id.
* @apiSuccess {Object[]} LoanProductDetails.loan_usage_type_id loan usage type id.
* @apiSuccess {Number} LoanProductDetails.parent_flag
* @apiSuccess {Number} LoanProductDetails.parent_id parent id.
* @apiSuccess {String} LoanProductDetails.created created date and time.
* @apiSuccess {Object} LoanProductDetails.create_json json object for loan product.
* @apiSuccess {Object} LoanProductDetails.edit_json json object for loan product.
* @apiSuccess {String} LoanProductDetails.business_type_id business type id.
* @apiSuccess {Object} LoanProductDetails.drop_down_details dropdown details.
* @apiSuccess {Object[]} LoanProductDetails.loan_asset_type loan asset type.
* @apiSuccess {Object[]} LoanProductDetails.unsecured_type
*/
const reqParams = require("../helpers/req-params");
module.exports = {
	index: async function (req, res, next) {
		const loanProductId = req.param("loan_product_id");

		function getQryObjDetails(isQryObj) {
			return isQryObj ? isQryObj.rows : "";
		}
		if (loanProductId && typeof loanProductId !== "undefined") {
			const logService = await sails.helpers.logtrackservice(req, "loanproducttype", req.user.id, "loan_products"),
				loanProductDetails = await LoanProductsRd.findOne({id: loanProductId}),

				loanUsageTypeIds = loanProductDetails.loan_usage_type_id
					? loanProductDetails.loan_usage_type_id.split(",")
					: "",
				loanAssetTypeIds = loanProductDetails.loan_asset_type_id
					? loanProductDetails.loan_asset_type_id.split(",")
					: "",
				loanTypeIds = loanProductDetails.loan_type_id ? loanProductDetails.loan_type_id.split(",") : "",
				bussinessTypeIds = loanProductDetails.business_type_id
					? loanProductDetails.business_type_id.split(",")
					: "";
			let loanUsageTypeDetails,
				loanAssetTypeDetails,
				loanTypeDetails,
				unsecuredLoanAssetTypeDetails,
				loan_request_type,
				business_industry_type,
				dropDownDetails = [];
			const myDBStore = sails.getDatastore("mysql_namastecredit_read");

			if (loanUsageTypeIds && typeof loanUsageTypeIds !== "undefined") {
				const loanUsageTypeQuery =
					"SELECT typeLid as id ,typeLname as value FROM loanusagetype where typeLid in (" +
					loanUsageTypeIds +
					") and status='active'";
				loanUsageTypeDetails = await myDBStore.sendNativeQuery(loanUsageTypeQuery);
			}

			if (loanAssetTypeIds && typeof loanAssetTypeIds !== "undefined") {
				//loanAssetTypeDetails = await LoanAssetTypeRd.find({ id: loanAssetTypeIds,status:'active'});
				const loanAssetTypeQuery =
					"SELECT typeid as id ,typename as value FROM loanassettype where typeid in (" +
					loanAssetTypeIds +
					") and status='active'";
				loanAssetTypeDetails = await myDBStore.sendNativeQuery(loanAssetTypeQuery);
				if (loanAssetTypeIds.length > 1 && loanProductDetails.loan_request_type == 1) {
					if (loanProductDetails.loanAssetTypeIds == "16,17") {
						loan_request_type = [{id: 0, value: 0}];
					} else {
						loan_request_type = [{id: 0, value: 1}];
					}
				} else {
					if (loanAssetTypeIds.includes(1)) {
						loan_request_type = [{id: "loan_asset_type2", value: 1}];
					} else {
						loan_request_type = [{id: "loan_asset_type1", value: 1}];
					}
				}
			}

			if (loanTypeIds && typeof loanTypeIds !== "undefined") {
				const loanTypeQuery =
					"SELECT typeId as id ,loanType as value FROM loantype where typeId in (" + loanTypeIds + ")";
				loanTypeDetails = await myDBStore.sendNativeQuery(loanTypeQuery);
			}

			if (bussinessTypeIds && typeof bussinessTypeIds !== "undefined") {
				const businessTypeQuery =
					"SELECT TypeId as id,TypeName as value, ownership_name FROM businesstype where TypeId in (" +
					bussinessTypeIds +
					")";
				businessTypeDetails = await myDBStore.sendNativeQuery(businessTypeQuery);
			}

			const UnsecuredLoanAssetTypeDetailsQuery =
				"SELECT typeid as id,typename as value FROM unsecured_loanassettype where status ='active'";
			UnsecuredLoanAssetTypeDetails = await myDBStore.sendNativeQuery(UnsecuredLoanAssetTypeDetailsQuery);

			const businessIndustryDetailsQuery = "SELECT IndustryId as id,IndustryName as value FROM businessindustry";
			businessIndustryDetails = await myDBStore.sendNativeQuery(businessIndustryDetailsQuery);

			dropDownDetails = {
				loan_usage_type_id: getQryObjDetails(loanUsageTypeDetails),
				property_type: getQryObjDetails(loanAssetTypeDetails),
				loan_type_id: getQryObjDetails(loanTypeDetails),
				unsecured_type: getQryObjDetails(UnsecuredLoanAssetTypeDetails),
				business_type: getQryObjDetails(businessTypeDetails),
				loan_request_type: loan_request_type,
				business_industry_type: getQryObjDetails(businessIndustryDetails)
			};

			loanProductDetails["drop_down_details"] = dropDownDetails;

			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				LoanProductDetails: loanProductDetails
			});
		} else {
			return res.badRequest({
				status: "nok",
				exception: sails.config.msgConstants.invalidParameter,
				message: sails.config.msgConstants.mandatoryFieldsMissing
			});
		}
	},

	queryRaised: async function (req, res) {
		const {loan_id, status, comments} = req.allParams();

		const params = req.allParams();
		const fields = ["loan_id", "status"];
		const missing = await reqParams.fn(params, fields);

		if (!loan_id || !status) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({id: loan_id});
		if (!loanData) {
			return res.badRequest(sails.config.res.invalidLoanId);
		}
		ncStatus = await NcStatusManageRd.findOne({name: status, white_label_id: loanData.white_label_id});
		if (!ncStatus) {
			return res.badRequest({status: "nok", message: sails.config.msgConstants.recordNotFoundInvalidStatus});
		}
		loan_status_id = ncStatus.status1;
		loan_sub_status_id = ncStatus.status2;
		remarks_val = ncStatus.uw_doc_status;
		let datetime = await sails.helpers.dateTime();
		remarks = {};
		history = {
			userId: req.user.id,
			status: status,
			message: comments
		};
		datetime =  moment(datetime).add({h : 5, m : 42}).format("YYYY-MM-DD HH:mm:ss").toString();
		remarks[datetime] = history;
		remarks = JSON.stringify(remarks);

		updateLoanData = await Loanrequest.update({id: loan_id}).set({
			loan_status_id,
			loan_sub_status_id,
			remarks,
			remarks_val
		}).fetch();
		return res.send({status: "ok", message: sails.config.msgConstants.successfulUpdation});
	}
};
