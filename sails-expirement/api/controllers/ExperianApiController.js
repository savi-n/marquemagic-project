const jsonxml = require("jsontoxml"),
	{XMLParser} = require("fast-xml-parser"),
	AWS = require("aws-sdk");
const s3 = new AWS.S3(sails.config.aws);
const moment = require("moment");
const reqParams = require("../helpers/req-params");
module.exports = {
	experianAPI: async function (req, res) {
		const postData = req.allParams(),
			{loanId, call} = postData,
			latestYear = moment().subtract(1, "y"),
			previousYear = moment().subtract(2, "y");
		let jsonDataObj;

		const params = req.allParams();
		const fields = ["loanId", "call"];
		const missing = await reqParams.fn(params, fields);

		if (!loanId || !call) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		await LoanrequestRd.findOne({id: loanId})
			.populate("loan_document")
			.then(async (loanData) => {
				if (!loanData) {
					return res.badRequest(sails.config.res.invalidLoanId);
				}

				const doc = loanData.loan_document;
				for (const i in doc) {
					if (doc[i].status == "active" && doc[i].doctype == 117) {
						if (doc[i].json_extraction_update) {
							jsonDataObj = doc[i].json_extraction_update;
						} else {
							if (doc[i].json_extraction) {
								const jsonData = JSON.parse(doc[i].json_extraction);
								s3.region = jsonData.s3_region;
								const getParams = {
									Bucket: jsonData.s3_name,
									Key: jsonData.s3_filepath + jsonData.master_json
								};
								try {
									const file = await s3.getObject(getParams).promise();
									if (file.Body) {
										jsonDataObj = file.Body.toString();
									}
								} catch (err) {
									return res.badRequest(err);
								}
							}
						}
					}
				}
				const str = ["NA", "NA ", "", "Criteria Not Applicable", "Criteria Not\nApplicable", "Criteria NotApplicable", "Criteria Not Applicable"];
				parseJsonData = JSON.parse(jsonDataObj);
				if (typeof parseJsonData === "string") {
					parseJsonData = JSON.parse(parseJsonData);
				}
				borrData = parseJsonData["SECTION 1: PROPOSAL SUMMARY"]["BORROWER SUMMARY"];
				termsData = parseJsonData["SECTION 1: PROPOSAL SUMMARY"]["TERMS OF FACILITY"];
				anchorData = parseJsonData["SECTION 2: Anchor Recommendation"];
				salesData = parseJsonData["SECTION 7: VF SALES DATA (VF Only)"];
				call1Data = {};
				const salesPurchase = anchorData["Anchor Projected Sales FY 19-20 (in Rs.)"] ||
					anchorData["Anchor Projected Sales FY 20-21 (in Rs.)"] ||
					anchorData["Anchor Projected Sales FY 21-22 (in Rs.)"] ||
					anchorData["Anchor Projected Sales FY 22-23 (in Rs.)"] ||
					anchorData["Anchor Projected Purchases FY 19-20 (in Rs.)"] ||
					anchorData["Anchor Projected Purchases FY 20-21 (in Rs.)"] ||
					anchorData["Anchor Projected Purchases FY 21-22 (in Rs.)"] ||
					anchorData["Anchor Projected Purchases FY 22-23 (in Rs.)"];
				call2Data = {
					EXISTINGCFLIMITS:
						(str.includes(termsData["Existing Limits ( If any ) (in Rs.)"]) == false
							? termsData["Existing Limits ( If any ) (in Rs.)"]
							: -99) || -99,
					BUSINESSTYPE: postData.businessType || borrData["Business Type "],
					PROGRAMCODEINPUT: postData.programCode == "DEVIATION_GNGP1SC3" ? "PCCF2" : "PCCF1",
					ANCHORRECOMMENDATIONCHANNELCONDUCT: "zz",
					CONSTITUTION: borrData["Legal Constitution "],
					CAPPINGCF: -99,
					PROJECTEDPURCHASES:
						(str.includes(salesPurchase) == false
							? salesPurchase.replace(/\,/g, "") : -99) || -99,
					ROTATIONALCYCLE: -99,
					CASHPROFIT: "zz",
					SALESLAST12MONTHS: -99,
					PROJECTEDSALES:
						(str.includes(salesPurchase) == false
							? salesPurchase.replace(/\,/g, "")
							: -99) || -99,
					CAPPINGVF: -99,
					BILLSPENDINGDISCOUNTING:
						postData.salesAnchor ||
						salesData["Bills pending for discounting with _________________ (in Rs.)"][
						"Sales to Anchor (in Rs.)"
						] ||
						-99
				};
				call3Data = {
					// EXISTINGSANCTIONLIMIT: '',
					// PROPOSEDRENEWALLIMIT: '',
					// CASESTATUS: borrData["Case Type"],
					// LASTYRCIBILSCORE: '',
					// MANAGEMENTCHANGE: '',
					// OVERDUEINSTANCESSTATUS: '',
					// SALESROUTEDSTATUS: '',
					// PURCHASESROUTEDSTATUS: '',
					// CIBILSCOREIMPROVED: '',
					// POSITIVERECOMMENDATIONANCHOR: termsData["Is the customer an existing ABFL SCF customer ?"]
				};
				call4Data = {
					// CUSTOMERNAME: borrData["Name of Borrower"],
					// CUSTOMERTYPE: borrData["Case Type"],
					// LOB: '',
					// TENOR1: termsData["Maximum Tenor Days"],
					// INTERESTRATETYPE1: '',
					// NEWROI1: '',
					// PFAMT1: '',
					// EXISTINGLOANAMT1: '',
					// EXISTINGROI1: '',
					// TENOR2: termsData["Maximum Tenor Days"],
					// INTERESTRATETYPE2: '',
					// NEWROI2: '',
					// PFAMT2: '',
					// EXISTINGLOANAMT2: '',
					// EXISTINGROI2: ''
				};
				let anchorVintageData = borrData["Vintage with Anchor (in months)"].match(/\d+/)
					? borrData["Vintage with Anchor (in months)"].match(/\d+/)[0]
					: -99;

				call1Data.ANCHORVINTAGE = call2Data.ANCHORVINTAGE =
					postData.anchorVintage ||
					(str.includes(anchorVintageData) == false ? anchorVintageData : -99) ||
					-99;
				call1Data.BUSINESSVINTAGE = call2Data.BUSINESSVINTAGE =
					postData.businessVintage ||
					(str.includes(borrData["Business Vintage (in months)"]) == false
						? borrData["Business Vintage (in months)"].match(/\d+/)[0]
						: -99) ||
					-99;
				call1Data.PROPOSEDSANCTIONLIMIT =
					call2Data.PROPOSEDSANCTIONLIMIT =
					call4Data.NEWLOANAMT1 =
					call4Data.NEWLOANAMT2 =
					(postData.proposedSanctionLimit ||
						str.includes(termsData["Proposed Sanction Limit (in Rs.)"]) == false
						? termsData["Proposed Sanction Limit (in Rs.)"].replace(/\,/g, "")
						: -99) || -99;
				call1Data.ANCHORRECOMMENDEDLIMIT = call2Data.ANCHORRECOMMENDEDLIMIT =
					postData.anchorRecommendedLimit ||
					(str.includes(anchorData["Limit Recommended (in Rs.) - Excl Peak Limit"]) == false
						? anchorData["Limit Recommended (in Rs.) - Excl Peak Limit"].replace(/\,/g, "")
						: -99) ||
					-99;
				call1Data.ANCHORNAME =
					call2Data.ANCHORNAME =
					call3Data.ANCHORNAME =
					call4Data.ANCHOR =
					postData.anchorName || borrData["Anchor Name"];
				call1Data.PRODUCT = call3Data.PRODUCT = call4Data.PRODUCT1 = call4Data.PRODUCT2 = borrData["Product"];
				call1Data.SCHEME = call3Data.SCHEME = call4Data.SCHEME1 = call4Data.SCHEME2 = borrData["Scheme"];
				const customerData = parseJsonData["SECTION 6: RELATIONSHIP WITH THE ANCHOR (CF)"],
					salesCust = customerData["Comments on Relationship with the Anchor, if any"];
				_.each(salesCust, (value) => {
					const year = previousYear.format("YY") + "-" + latestYear.format("YY"),
						periodYr = `FY ${year}`;
					if (value.Period == periodYr) {
						call2Data.SALESCUSTOMERLASTAUDITEDFY =
							postData.grossSales || value["Total Sales of Customer (Value Rs.)"] || -99;
					}
				});

				call2Data.PURCHASESLAST12MONTHS =
					customerData["Last 12 months purchase from Anchor ( Rs.)"].replace(/\,/g, "") || -99;
				const soleCfLender = parseJsonData["SECTION 4: CIBIL Score"];
				_.each(soleCfLender, (soleValue) => {
					call1Data.MINCIBILSCORE =
						call2Data.MINCIBILSCORE =
						call3Data.MINCIBILSCORE =
						postData.minCibil || (str.includes(soleValue["Minimum CIBIL Score"]) == false ? soleValue["Minimum CIBIL Score"] : -99) || -99;

					call2Data.MINCURRENTRATIO = soleValue["Minimum Current Ratio"] || -99;
					call2Data.MININTERESTCOVERAGERATIO = soleValue["Minimum Interest Coverage Ratio"] || -99;
					call3Data.OVERDUES = soleValue["Are there any overdues beyond Rs. 25000 ? "];
				});

				const sanctionData =
					parseJsonData["SECTION 8: CF ELIGIBILITY CALCULATOR"] ||
					parseJsonData["SECTION 8: VF ELIGIBILITY CALCULATOR"];
				customerSelectionData =
					sanctionData["CUSTOMER SELECTION CRITERIA(<=5 CRS)"] ||
					sanctionData["CUSTOMER SELECTION CRITERIA(<=20 CRS)"];
				_.each(customerSelectionData, (custVal) => {
					if (
						custVal.Parameter ==
						"No SMA II reporting in the last 12 months. Max one count of SMA - I reporting during last 12 months allowed"
					) {
						call1Data.SMA2STATUS = call3Data.SMASSDOUBTFULREPORTING =
							postData.SMA2Report || custVal.Comments;
					}
					if (
						custVal.Parameter ==
						"Is there any negative news against the Borrower / CoBorrower / Guarantor in Watchoutinvestors ? "
					) {
						call1Data.WATCHOUTSTATUS = call3Data.WATCHOUTSTATUS =
							postData.watchoutStatus || custVal.Comments;
					}
					if (custVal.Parameter == "Has the customer gone under CDR/BIFR ?") {
						call1Data.CDRBIFRSTATUS = call3Data.CDRBIFRSTATUS = postData.cdrBifrStatus || custVal.Comments;
					}
					if (custVal.Parameter == "Does the Customer feature in the RBI Defaulter/Caution List ?") {
						call1Data.RBIDEFAULTERSTATUS = call3Data.RBIDEFAULTERSTATUS =
							postData.RBIDefaultStatus || custVal.Comments;
					}
					if (custVal.Parameter == "Does the Customer reflect in the ABFL Defaulter List ?") {
						call1Data.ABFLDEFAULTERSTATUS = call3Data.ABFLDEFAULTERSTATUS =
							postData.ABFLStatus || custVal.Comments;
					}
					if (custVal.Parameter == "Is the customer a PEP ?") {
						call1Data.PEPSTATUS = postData.pepStatus || custVal.Comments;
					}
					if (custVal.Parameter == "Does the Customer feature in the UNSC List ?") {
						call1Data.UNSCSTATUS = call3Data.UNSCSTATUS = postData.unscStatus || custVal.Comments;
					}

					if (
						custVal.Parameter ==
						"Is Pollution Control Certificate (Only required for Chemical,Leather, Textile & Pharma Industry) available ? "
					) {
						call1Data.PUCSTATUS = postData.pucStatus || (str.includes(custVal.Comments) == false ? custVal.Comments : "zz") || "zz";
					}
					if (custVal.Parameter == "Does the Customer reflect in the ABFL Defaulter List ?") {
						call1Data.SOLECFLENDERSTATUS = postData.soleLenderStatus || custVal.Comments;
					}
					if (
						custVal.Parameter ==
						"Any delay in repayment of Statutory Dues - PF, ESIC, IT (As per tax audit report/ auditor’s report) "
					) {
						call1Data.STATUTORYDUESSTATUS = postData.repaymentStatus || custVal.Comments;
					}
					if (custVal.Parameter == "Borrower firm/directors/promoters family related to ABFL companies") {
						call1Data.RELATEDPARTYSTATUS = postData.relatedPartyStatus || custVal.Comments;
					}
					if (custVal.Parameter == "ATNW for last audited Financial Year ") {
						call1Data.ATNWGONOGO = call3Data.ATNWSTATUS = postData.atnwStatus || custVal.Comments;
					}
					if (custVal.Parameter == "EBITDA to be positive for last Financial year") {
						call1Data.EBITDAGONOGO = call2Data.EBITDA = postData.ebitda || custVal.Comments;
					}
					if (custVal.Parameter == "PAT to be positive for 1 out of last 2 Financial year") {
						call1Data.PATGONOGO = postData.patStatus || custVal.Comments;
					}
				});

				const bankinData = parseJsonData["SECTION 5: BANKING DATA"]["WORKING CAPITAL FACILITY"];
				_.each(bankinData, (bVal) => {
					if (bVal.TOTAL) {
						bankValue = bVal.TOTAL;
						if (bankValue["Facility Amount (Rs.)"] && bankValue["Facility Amount1 (Rs.)"]) {
							call2Data.EXISTINGWORKINGCAPITALLIMITSFBLC = call2Data.ABFLSHAREINTOTALWORKINGCAPITAL =
								parseInt(bankValue["Facility Amount (Rs.)"]) +
								parseInt(bankValue["Facility Amount1 (Rs.)"]);
						}
					} else {
						call2Data.EXISTINGWORKINGCAPITALLIMITSFBLC = call2Data.ABFLSHAREINTOTALWORKINGCAPITAL = -99;
					}
				});

				const approvalData = parseJsonData["SECTION 10: Approval Sheet"]["Case Log"];
				call2Data.ICR = call3Data.ICR = str.includes(approvalData[0].ICR) === false ? approvalData[0].ICR : -99;
				call2Data.OCR = call3Data.OCR = str.includes(approvalData[0].OCR) === false ? approvalData[0].OCR : -99;
				call2Data.MAXTOLBYATNW = str.includes(approvalData[0]["Max TOL / ATNW"]) === false ? approvalData[0]["Max TOL / ATNW"] : -99;
				call1Data.SOLECFLENDERASPERPROGRAM = call2Data.SOLECFLENDERASPERPROGRAM =
					approvalData[0]["Product Program Applicable"] || "zz";
				call2Data.MINDEPENDENCY = str.includes(approvalData[0][" Min. Dependency"]) === false ? approvalData[0][" Min. Dependency"] : -99;
				const defaultData = {
					SIGNATURE: "ABFLSCF",
					DALOGLEVEL: "31",
					EDITION: "22",
					OBJECTIVE: "0",
					EDITIONDATE: "2019-02-05",
					ERRORCODE: "2343",
					ERRORMSG: "STRATEGY ADITYA BIRLA SUPPLY CHAIN",
					APPLICATION_ID: "TEST1"
				};

				let url, body, header, method, reqBodyArray;
				url = sails.config.experian.api.abflLogin.url;
				header = {
					Authorization: `Basic ${sails.config.api.abflLogin.Authorization}`,
					"Content-Type": "application/x-www-form-urlencoded"
				};
				method = "POST";
				const loginData = await sails.helpers.sailstrigger(url, "", header, method);
				if (!loginData || loginData.status == "nok") {
					return res.badRequest(loginData);
				}

				const parseData = JSON.parse(loginData);
				let bodyHeader =
					'<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Header/><soap:Body>';
				const bodyFooter = "</soap:Body></soap:Envelope>";
				if (call == "call1") {
					defaultData.ALIAS = "ABNC1";
					reqBodyArray = call1Data;
				}
				if (call == "call2") {
					defaultData.ALIAS = "ABNC2";
					reqBodyArray = call2Data;
				}
				if (call == "call3") {
					defaultData.ALIAS = "ABRN";
					reqBodyArray = call3Data;
				}
				if (call == "call4") {
					defaultData.ALIAS = "ABPM";
					reqBodyArray = call4Data;
					bodyHeader =
						'<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Header/><soap:Body>';
				}

				const dataObj = {
					DAXMLDocument: {
						OCONTROL: defaultData,
						INPUT: {
							APPLICATIONIN: {
								SCFELIGIBILTYNEW: reqBodyArray
							}
						}
					}
				},
					xml = jsonxml(dataObj);
				body = bodyHeader + xml + bodyFooter;
				url = sails.config.experian.api.abflExperian.url;
				header = {
					Authorization: `Bearer ${parseData.access_token}`
				};
				method = "POST";
				const xmlOutput = await sails.helpers.sailstrigger(url, body, header, method);
				const parser = new XMLParser();
				jsonOutput = parser.parse(xmlOutput);
				whiteLabelId = await WhiteLabelSolutionRd.find({id: req.user.loggedInWhiteLabelID});
				key = `users_${req.user.id}/expOutput/${call}_experianOutput.json`;
				data1 = {
					loan: loanData.id,
					business_id: loanData.business_id,
					user_id: loanData.createdUserId,
					doctype: 236,
					uploaded_doc_name: call + "_experianOutput.json",
					ints: await sails.helpers.dateTime(),
					upload_method_type: "newui"
				};
				s3.putObject(
					{
						Bucket: whiteLabelId[0].s3_name,
						Key: key,
						Body: JSON.stringify(jsonOutput),
						ContentType: "application/json"
					},
					async (err, data) => {
						if (err) {
							console.log(JSON.stringify(err));
						}

						if (data) {
							data1.doc_name = key;
							const loanDocument = await LoanDocument.create(data1).fetch();
						}
					}
				);
				return res.ok({status: "ok", data: jsonOutput});
			});
	}
};
