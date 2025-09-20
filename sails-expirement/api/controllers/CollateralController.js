/**
 * CollateralController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const reqParams = require("../helpers/req-params");

module.exports = {
	collateralDetails: async function (req, res) {
		/*destruct all details*/
		const collateralDetails = req.param("data"),
			loan_assets_id = req.param("loan_assets_id"),
			//	const {data: reqdata, assets_additional_id, business_id, loan_id} = req.allParams();
			assets_additional_id = req.param("assets_additional_id"),
			business_id = req.param("business_id"),
			loan_id = req.param("loan_id"),
			section_id = req.param("section_id"),
			insert_loan_assets_data = req.param("insert_loan_assets_data");

		let message,
			logTrackResultId = 0;

		/*check for mandatory fields */
		let params = {loan_id},
			fields = ["loan_id"];

		const missing = await reqParams.fn(params, fields);
		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const curDate = await sails.helpers.dateTime();
		const arrayRes = [];
		if (collateralDetails.length === 0 || Object.values(collateralDetails).length === 0) {
			return res.badRequest({
				status: "nok",
				message: "Data should not be empty, Please fill the data."
			})
		}
		if (collateralDetails.length > 0) {
			let assetsAdditionaldata;
			for (const element of collateralDetails) {
				const loanAssetsObj = {
					business_id,
					loan_id,
					...element.collateral_details,
					...element.property_address_details,
					...element.technical_evaluation_level_1,
					...element.technical_evaluation_level_2,
					loan_json: {
						Collateraltype: element.collateral_details.loan_type,
						CurrentMarketValue: element.collateral_details.loan_json,
						...element
					},
					status: "active"
				};
				loanAssetsObj.property_type = element.property_address_details.property_type || "Owned";
				if (insert_loan_assets_data === true) {
					if (element.loan_assets_id) {
						const loanAssetRecord = await LoanAssetsRd.find({id: element.loan_assets_id, loan_id}).select("id").limit(1);
						if (loanAssetRecord.length === 0) {
							return res.status(404).send({
								status: "nok",
								message: "record not found in the database for the given loan_id, loan_assets_id"
							});
						}
						const updateAssets = await LoanAssets.update({id: element.loan_assets_id, loan_id}).set(loanAssetsObj).fetch();
						arrayRes.push({loan_assets_details: updateAssets[0]});

					} else {
						loanAssetsObj.ints = curDate;
						loanAssetRecord = await LoanAssets.create(loanAssetsObj).fetch();
						arrayRes.push({loan_assets_details: loanAssetRecord});
					}
				}
				const assetsAdditionalObj = {
					loan_id,
					user_id: req.user.id,
					updated_at: curDate,
					initial_collateral: element,
					status: "active"
				};
				if (element.assets_additional_id) {
					const assetsAdditionalRecord = await AssetsAdditionalRd.findOne({
						id: element.assets_additional_id,
						loan_id
					});
					if (assetsAdditionalRecord) {
						assetsAdditionaldata = await AssetsAdditional.update({
							id: assetsAdditionalRecord.id,
							loan_id
						})
							.set({
								modified_collateral: element
							})
							.fetch();
						arrayRes.push({
							id: assetsAdditionaldata[0].id,
							collateral_data: assetsAdditionaldata[0].modified_collateral
						});
						message = sails.config.msgConstants.successfulUpdation;
					}
				} else {
					trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
					assetsAdditionaldata = await AssetsAdditional.create(assetsAdditionalObj).fetch();
					message = sails.config.msgConstants.successfulInsertion;
					arrayRes.push({
						id: assetsAdditionaldata.id,
						collateral_data: assetsAdditionaldata.initial_collateral
					});
				}
			}
			// }
			res.send({
				status: "ok",
				message,
				data: {
					assetsAdditionaldata: arrayRes,
					business_id,
					loan_id
				}
			});
		} else {
			try {
				let coll_jsonData = ({
					collateral_sub_type,
					total_area,
					construction_area,
					property_amount,
					age,
					property_purpose,
					property_ownership,
					owner_type,
					ownership_status,
					owner_name,
					ownership_from,
					percent_share,
					nature_of_property
				} = collateralDetails.collateral_details);
				// if (Number(coll_jsonData.construction_area) > Number(coll_jsonData.total_area)){
				//     return res.badRequest({
				//         status : "nok",
				//         message : "The construction area cannot be grater than total area."
				//     })
				// }
				// const loanAssetsObj = {
				// 	business_id,
				// 	loan_id,
				// 	...collateralDetails.collateral_details,
				// 	...collateralDetails.property_address_details,
				// 	loan_json: {
				// 		Collateraltype: collateralDetails.collateral_details.loan_type,
				// 		CurrentMarketValue: collateralDetails.collateral_details.loan_json,
				// 		...coll_jsonData
				// 	}
				// };

				/* put default value Owned for property_type in loan_assets as it is mandatory */
				// loanAssetsObj.property_type = collateralDetails.property_address_details.property_type || "Owned";

				const assetsAdditionalObj = {
					loan_id,
					user_id: req.user.id,
					updated_at: curDate,
					initial_collateral: {
						...collateralDetails.collateral_details,
						...collateralDetails.property_address_details,
						...collateralDetails.technical_evaluation_level_1,
						...collateralDetails.technical_evaluation_level_2
					},
					status: "active"
				};

				// let loanAssetRecord, assetsAdditionalRecord, assetsAdditionalData;
				let assetsAdditionalRecord;
				let assetsAdditionalData;

				/* iterate through object and make the empty string values to undefined*/
				// for (key in loanAssetsObj) {
				// 	if (loanAssetsObj[key] === "") loanAssetsObj[key] = undefined;
				// }

				for (key in assetsAdditionalObj) {
					if (assetsAdditionalObj[key] === "") assetsAdditionalObj[key] = undefined;
				}
				if (assets_additional_id) {
					/* update block */
					/* check whether data exists in database or not */
					req.method = "PUT"; /*make this method PUT so that it saves action as update in auditLog table*/


					const assetsAdditionalRecord = await AssetsAdditional.find({id: assets_additional_id, loan_id})
						.select("id")
						.limit(1);

					// if (loanAssetRecord.length === 0 || assetsAdditionalRecord.length === 0){
					if (assetsAdditionalRecord.length === 0) {
						return res.status(404).send({
							status: "nok",
							message: "record not found in the database for the given loan_id, assets_additional_id"
						});
					}
					assetsAdditionalData = await AssetsAdditional.update({id: assets_additional_id, loan_id})
						.set({
							modified_collateral: {
								...collateralDetails.collateral_details,
								...collateralDetails.property_address_details,
								...collateralDetails.technical_evaluation_level_1,
								...collateralDetails.technical_evaluation_level_2
							}
						})
						.fetch();

					message = sails.config.msgConstants.successfulUpdation;
				} else {
					/* insert block */
					// loanAssetsObj.ints = assetsAdditionalObj.created_at = curDate;
					// loanAssetRecord = await LoanAssets.create(loanAssetsObj).fetch();
					assetsAdditionalData = await AssetsAdditional.create(assetsAdditionalObj).fetch();
					trackData = await sails.helpers.onboardingDataTrack(loan_id, business_id, "", req.user.id, section_id, "");
					// loan_assets_id = loanAssetRecord.id;
					assets_additional_id = assetsAdditionalData.id;
					message = sails.config.msgConstants.successfulInsertion;
				}

				res.send({
					status: "ok",
					message,
					data: {
						// loan_assets_id,
						assetsAdditionalData,
						business_id,
						loan_id
					}
				});

				/* logtracking data*/
				//await sails.helpers.logtrackservice(req, "Collateral/collateralDetails", loan_assets_id, "loan_assets");
				await sails.helpers.logtrackservice(
					req,
					"Collateral/collateralDetails",
					assets_additional_id,
					"assets_additional"
				);
			} catch (err) {
				console.log(err);
				let message = "Something went wrong",
					statusCode = 500;
				if (err.code === "E_INVALID_VALUES_TO_SET") {
					(message = "invalid value passed in the payload"), (statusCode = 400);
				}

				res.status(statusCode).send({
					status: "nok",
					message,
					error: err.message
				});

				/* logtracking data*/
				//await sails.helpers.logtrackservice(req, "Collateral/collateralDetails", 0, "loan_assets");
				await sails.helpers.logtrackservice(req, "Collateral/collateralDetails", 0, "assets_additional");
			}
		}
	},

	getCollateralDetails: async function (req, res) {
		let {loan_ref_id, business_id, director_id} = req.allParams();

		params = {loan_ref_id};
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		const loan_details = await LoanrequestRd.findOne({loan_ref_id});

		if (!loan_details) {
			return res.badRequest({
				status: "nok",
				message: "no record found"
			});
		}
		let scheme_section_data;
		loanAssetRecord = await LoanAssetsRd.find({loan_id: loan_details.id});
		assetsAdditionalRecord = await AssetsAdditional.find({loan_id: loan_details.id, status: "active"});
		const loanAdditionalRecord = await LoanAdditionalDataRd.find({loan_id: loan_details.id}).sort("id DESC").limit(1);
		if (loanAdditionalRecord.length) {
			const {loan_amount, applied_tenure} = JSON.parse(loanAdditionalRecord[0].source_codes) || {}
			scheme_section_data = {loan_amount, loan_tenure: applied_tenure}
			if (loanAdditionalRecord[0].scheme_policy) scheme_section_data.scheme_policy = JSON.parse(loanAdditionalRecord[0].scheme_policy)
			scheme_section_data.branch_data = await BanktblRd.findOne({
				id: loan_details.branch_id
			}).select(["branch", "state", "branch_pincode"]);
		}
		const loan_pre_fetch_data = await LoanPreFetchRd.find({loan_id: loan_details.id, director_id, request_type: "Customer Details Fetch"});
		if (loanAssetRecord.length > 0 || assetsAdditionalRecord.length > 0) {
			// if (assetsAdditionalRecord.length > 0) {
			return res.ok({
				status: "ok",
				message: "Data fetched successfully",
				data: {
					loanAssetRecord,
					assetsAdditionalRecord,
					loan_pre_fetch_data,
					scheme_section_data
				}
			});
		} else {
			return res.ok({
				status: "ok",
				data: {
					loanAssetRecord,
					assetsAdditionalRecord,
					loan_pre_fetch_data,
					scheme_section_data
				}
			});
		}
	},
	getCollateralValue: async function (req, res) {
		let {loan_id} = req.allParams();
		loan_id = parseInt(loan_id);
		try {
			if (isNaN(loan_id)) {
				throw new Error("invalidrequest");
			}
			const assetsAdditionalRecord = await AssetsAdditional.find({loan_id: loan_id, status: "active"}).sort("id DESC");
			if (assetsAdditionalRecord.length == 0) {
				throw new Error("invalidloanId");
			}
			let ltv_ratio = 0, property_amount_technical_1 = 0, property_amount_technical_2 = 0, scheme_section_data;
			assetsAdditionalRecord.forEach(obj => {
				const value = obj.modified_collateral ? obj.modified_collateral.collateral_details.value : obj.initial_collateral.collateral_details.value;
				if (!isNaN(value)) {ltv_ratio = parseInt(value)};
				const property_cost_1 = obj.modified_collateral ? obj.modified_collateral.technical_evaluation_level_1?.property_amount_technical_1 : obj.initial_collateral.technical_evaluation_level_1?.property_amount_technical_1;
				if (!isNaN(property_cost_1)) {property_amount_technical_1 = parseInt(property_cost_1)};
				const property_cost_2 = obj.modified_collateral ? obj.modified_collateral.technical_evaluation_level_2?.property_amount_technical_2 : obj.initial_collateral.technical_evaluation_level_2?.property_amount_technical_2;
				if (!isNaN(property_cost_2)) {property_amount_technical_2 = parseInt(property_cost_2)};
			});

			if (property_amount_technical_1 && property_amount_technical_2) {
				ltv_ratio = Math.min(property_amount_technical_1, property_amount_technical_2);
			}

			const [loanAdditionalRecord, loanRequestData] = await Promise.all([
				LoanAdditionalDataRd.findOne({loan_id}).select("scheme_policy"),
				LoanrequestRd.findOne({id: loan_id}).select(["loan_amount", "applied_tenure"])
			]);
			scheme_section_data = {loan_amount, applied_tenure: loan_tenure} = loanRequestData;
			// scheme_section_data = {loan_amount, loan_tenure: applied_tenure}
			if (loanAdditionalRecord?.scheme_policy) scheme_section_data.scheme_policy = JSON.parse(loanAdditionalRecord.scheme_policy)

			return res.ok({
				status: "ok",
				message: "Collateral Value fetched successfully",
				data: {property_cost: ltv_ratio, scheme_section_data}
			})
		}
		catch (err) {
			switch (err.message) {
				case "invalidrequest":
					return res.ok({status: "nok", message: "Please enter a a valid integer loan ID"});
				case "invalidloanId":
					return res.ok({status: "nok", message: "No data found for the loan ID"});
				default:
					throw err;
			}
		}
	},
	getEquipmentType: async function (req, res) {
		let {equipmenttype, registrable} = req.allParams();
		try {
			if (!equipmenttype || !registrable) {
				return res.badRequest({
					status: "nok",
					message: "equipment type or registrable is missing"
				});
			}
			let equipment_type_url = sails.config.equipment_type + "?equipmenttype=" + equipmenttype + "&registrable=" + registrable;
			let equipment_type_res = await sails.helpers.sailstrigger(equipment_type_url, "", "", "GET");
			if (equipment_type_res) {
				equipment_type_res = JSON.parse(equipment_type_res);
				return res.ok({
					status: "ok",
					data: equipment_type_res.data
				});
			}
			return res.ok({
				status: "ok",
				data: []
			})
		}
		catch (err) {
			throw err;
		}
	},
	getVehicleType: async function (req, res) {
		let {assettype, registrable} = req.allParams();
		try {
			let vehicle_type_url = sails.config.vehicle_asset_type + "?assettype=" + assettype;
			if (registrable) {
				vehicle_type_url = vehicle_type_url + "&registrable=" + registrable;
			}
			let vehicle_type_res = await sails.helpers.sailstrigger(vehicle_type_url, "", "", "GET");
			if (vehicle_type_res) {
				vehicle_type_res = JSON.parse(vehicle_type_res);
				return res.ok({
					status: "ok",
					data: vehicle_type_res.data
				});
			}
			return res.ok({
				status: "ok",
				data: []
			})
		}
		catch (err) {
			throw err;
		}
	},
	getSchemePropertyType: async function (req, res) {
		const {loan_id, scheme} = req.allParams();
		if (!loan_id) return res.badRequest(sails.config.res.missingFields);
		const loanReq = await LoanrequestRd.findOne({id: loan_id}).select(["branch_id", "parent_product_id"]);
		if (!loanReq) return res.ok({status: "nok", message: "Invalid Loan ID"})
		if (!loanReq.parent_product_id) return res.ok({status: "nok", message: "Product Mapping not present for this Loan"})
		const branchData = await BanktblRd.findOne({id: loanReq.branch_id}).select("state");
		if (!branchData?.state) return res.ok({status: "nok", message: "State not mapped for this Loan"});
		const productData = await LoanProductDetailsRd.findOne({id: loanReq.parent_product_id}).select("basic_details");
		const productName = productData?.basic_details ? JSON.parse(productData.basic_details).state_wise_collateral_product_name : null
		if (!productName) return res.ok({status: "nok", message: "Product Name not found"})
		let url;
		if (scheme) url = `${sails.config.schemeTypeSearchUrl}?state=${branchData.state}&product=${productName}&scheme=${scheme}`
		else url = `${sails.config.schemeTypeSearchUrl}?state=${branchData.state}&product=${productName}`
		let schemeSearch = await sails.helpers.sailstrigger(url, "", "", "GET");
		if (!schemeSearch.status) {
			schemeSearch = JSON.parse(schemeSearch)?.data
			if (!scheme && Array.isArray(schemeSearch)) schemeSearch = [...new Set(schemeSearch.map(item => item.scheme))]
			return res.ok({status: "ok", message: "Scheme Type retrieved successfully", data: schemeSearch});
		}
		return res.ok({status: "nok", message: "Failed to retrieve Scheme Type"})
	},
	saveSchemePolicyData: async function (req, res) {
		const {loan_id, scheme_data} = req.body;
		if (!loan_id || !scheme_data) return res.badRequest(sails.config.res.missingFields);
		const loanAdditionalRecord = await LoanAdditionalDataRd.find({loan_id}).sort("id DESC").limit(1);
		if (!loanAdditionalRecord.length) return res.ok({status: "nok", message: "Loan Details Record not found for this Loan"})
		const updatedRecord = await LoanAdditionalData.updateOne({loan_id}).set({scheme_policy: JSON.stringify(scheme_data)}).fetch();
		res.ok({status: "ok", message: "Scheme Type saved successfully", data: JSON.parse(updatedRecord.scheme_policy)})
		await sails.helpers.greenChannelCondition(loan_id, req.user.loggedInWhiteLabelID)
	}
};
