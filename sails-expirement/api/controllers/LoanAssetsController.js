/**
 * LoanAssetsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/**
   * Insert Load Assets
   * @description :: Insert Loan Assets
   * @api {post} /insertLoanAssets/ Insert loanAssets
   * @apiName Create Loan Assets
   * @apiGroup Loan Assets
   *  @apiExample Example usage:
   * curl -i localhost:1337/insertLoanAssets/
   *    {
			"loanId": 2,
			"propertyType":"leased",
			"loan_asset_type_id": 2,
			"ownedType":"paid_off",
			"address1": "test address1",
			"address2": "test address2",
			"flat_no": "112",
			"locality": "ramnagar",
			"city": "banglore",
			"pincode": "570000",
			"landmark":"SI ATM",
			"autoMobileType": "qw",
			"brandName":"d",
			"modelName": "fd",
			"vehicalValue": "122",
			"dealershipName":"sd",
			"manufacturingYear":"123",
			"Value": "test@123",
			"ints": "",
			"cpath": "",
			"surveyNo": "",
			"cAssetId":"",
			"noOfAssets": 5
		}
   *
   * @apiParam {Number} id ID.
   * @apiParam {Number} loanId loan id
   * @apiParam {String} propertyType property type ["owned", "leased"]
   * @apiParam {Number} loanAssetTypeId loan assets type id
   * @apiParam {String} ownedType  own type ["paid_off", "mortgage"]
   * @apiParam {String} address1 address line 1
   * @apiParam {String} address2 address line 2
   * @apiParam {String} flat_no flat number
   * @apiParam {String} locality An area
   * @apiParam {String} city
   * @apiParam {String} state
   * @apiParam {String} pincode Area pincode.
   * @apiParam {String} landmark land mark.
   * @apiParam {String} autoMobileType automobile type "2 wheeler" , "4 wheeler"
   * @apiParam {String} brandName brand name
   * @apiParam {String} modelName model name
   * @apiParam {String} vehicalValue market value of the vehical
   * @apiParam {String} dealershipName Dealership name
   * @apiParam {String} manufacturingYear year of manifacturing
   * @apiParam {String} Value
   * @apiParam {string} ints Current time
   * @apiParam {String} cpath cersai_rec_path
   * @apiParam {String} surveyNo survey number
   * @apiParam {String} cAssetId cersai_asset_id
   * @apiParam {String} typeOfLand
   * @apiParam {String} villageName
   * @apiParam {String} extentOfLand
   * @apiParam {String} forcedSaleValue
   * @apiParam {Number} sqFeet number of sq_feet
   * @apiParam {String} insuranceRequired [YES NO]
   * @apiParam {String} priority ['1st', '2nd', 'Pari-Passu', 'NA']
   * @apiParam {String} ecApplicable ['YES', 'NO']
   * @apiParam {String} exShowroomPrice
   * @apiParam {String} accessories
   * @apiParam {String} incurance
   * @apiParam {String} roadTax
   *
   */

module.exports = {
	insertLoanAssets: async function (req, res) {
		const allParams = req.allParams(),
			ints = new Date(),
			createobj = {};
		if (
			!allParams.loanId ||
			!allParams.propertyType ||
			!allParams.pincode ||
			!allParams.autoMobileType ||
			!allParams.brandName ||
			!allParams.modelName ||
			!allParams.vehicalValue ||
			!allParams.dealershipName ||
			!allParams.manufacturingYear
		) {return res.badRequest(sails.config.res.missingFields);}
		if (allParams.propertyType === "owned" || allParams.propertyType === "leased") {
			await LoanrequestRd.findOne({id: allParams.loanId}).then(async (loanData) => {
				if (!loanData) {return res.badRequest(sails.config.res.invalidLoanId);}
				trackData = await sails.helpers.onboardingDataTrack(LoanrequestRd.id, LoanrequestRd.business_id, "", req.user.id, allParams.section_id, "");
				createobj["business_id"] = loanData.business_id;
				createobj["loan_id"] = allParams.loanId;
				createobj["property_type"] = allParams.propertyType;
				createobj["loan_asset_type_id"] = allParams.loanAssetTypeId;
				createobj["owned_type"] = allParams.ownedType;
				createobj["address1"] = allParams.address1;
				createobj["address2"] = allParams.address2;
				createobj["flat_no"] = allParams.flat_no;
				createobj["locality"] = allParams.locality;
				createobj["city"] = allParams.city;
				createobj["state"] = allParams.state;
				createobj["pincode"] = allParams.pincode;
				createobj["name_landmark"] = allParams.landmark;
				createobj["automobile_type"] = allParams.autoMobileType;
				createobj["brand_name"] = allParams.brandName;
				createobj["model_name"] = allParams.modelName;
				createobj["value_Vehicle"] = allParams.vehicalValue;
				createobj["dealership_name"] = allParams.dealershipName;
				createobj["manufacturing_yr"] = allParams.manufacturingYear;
				createobj["value"] = allParams.Value;
				createobj["ints"] = ints;
				createobj["cersai_rec_path"] = allParams.cpath;
				createobj["survey_no"] = allParams.surveyNo;
				createobj["cersai_asset_id"] = allParams.cAssetId;
				createobj["no_of_assets"] = allParams.noOfAssets;
				//new fields
				createobj["type_of_land"] = allParams.typeOfLand;
				createobj["village_name"] = allParams.villageName;
				createobj["extent_of_land"] = allParams.extentOfLand;
				createobj["forced_sale_value"] = allParams.forcedSaleValue;
				createobj["sq_feet"] = allParams.sqFeet;
				createobj["insurance_required"] = allParams.insuranceRequired;
				createobj["priority"] = allParams.priority;
				createobj["ec_applicable"] = allParams.ecApplicable;
				createobj["exShowroomPrice"] = allParams.exShowroomPrice;
				createobj["accessories"] = allParams.accessories;
				createobj["incurance"] = allParams.incurance;
				createobj["roadTax"] = allParams.roadTax;

				const loanAssetsResult = await LoanAssets.create(createobj).fetch();
				if (loanAssetsResult) {
					res.send({
						status: "200",
						message: sails.config.msgConstants.successfulInsertion,
						data: loanAssetsResult
					});
				} else {
					return res.badRequest({
						status: "nok",
						message: sails.config.msgConstants.somethingWentWrong
					});
				}
			});
		} else {
			return res.badRequest(sails.config.res.invalidProperyType);
		}
	},
	/**
	 * Search by brand || module name
	 * @description :: Search by Brand name or ModelName along with automobile type
	 * @api {post} /searchByBrandname/ search based on brand or modelname
	 * @apiName Search
	 * @apiGroup Loan Assets
	 * @apiExample Example usage:
	 * curl -i localhost:1337/searchByBrandname/
	 * @apiParam {String} name
	 * @apiParam {String} type auto mobile type
	 **/
	searchByBrandname: async function (req, res) {
		const name = req.param("name"),
			automobile_type = req.param("type");
		if (!automobile_type) {return res.badRequest(sails.config.res.missingFields);}

		const resultBrand = await LoanAssetsRd.find({
			where: {
				automobile_type: automobile_type,
				brand_name: {
					contains: name
				}
			},
			select: ["brand_name"]
		}),

			resultModal = await LoanAssetsRd.find({
				where: {
					automobile_type: automobile_type,
					model_name: {
						contains: name
					}
				},
				select: ["model_name"]
			}),

			result = [];

		for (const i in resultBrand) {
			result.push(resultBrand[i].brand_name);
		}

		for (const i in resultModal) {
			result.push(resultModal[i].model_name);
		}

		const uSet = new Set(result);
		return res.send({
			message: "Success",
			data: [...uSet]
		});
	},

	/**
  `  * @description :: Get loan asset details by loan Id
	 * @api {get} /loanAssetById loan asset details
	 * @apiName loanAssetById
	 * @apiGroup Loan asset
	 * @apiExample Example usage:
	 * curl -i localhost:1337/loanAssetById

	 * @apiParam {String} loan_id Loan reference id (mandatory).
	 *
	 * @apiSuccess {String} status 'ok'.
	 * @apiSuccess {String} message Successfully listed.
	 *
	 *
 **/
	loanAssetById: async function (req, res) {
		const allParams = req.allParams();
		if (!allParams.loanId) {return res.badRequest(sails.config.res.missingFields);}
		await LoanAssetsRd.find({loan_id: allParams.loanId}).then(async (loanAssetData) => {
			if (loanAssetData) {
				res.send({
					status: "Ok",
					message: sails.config.msgConstants.detailsListed,
					data: loanAssetData
				});
			} else {
				return res.badRequest(sails.config.res.invalidLoanId);
			}
		});
	}
};
