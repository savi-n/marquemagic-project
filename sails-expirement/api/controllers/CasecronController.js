/**
 * CasecronController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { SignJWT, jwtVerify } = require("jose");
private_key = jwToken.privateKey();
public_key = jwToken.publicKey();
module.exports = {
	/**
	 * CasecronController
	 *
	 * @description :: Server-side actions for handling incoming requests.
	 * @help        :: See https://sailsjs.com/docs/concepts/actions
	 */

	case_create_to_dynamodb: async function (req, res) {
		const white_label_id = sails.config.white_label_id.kvb_whitelabel,
			minutes = new Date();
		minutes.setMinutes(minutes.getMinutes() - 15);
		const loan_details = await LoanrequestRd.find({
			white_label_id: white_label_id,
			or: [{RequestDate: {">=": minutes}}, {modified_on: {">=": minutes}}]
		});
		if (loan_details.length > 0) {
			Promise.all(
				loan_details.map(async (element) => {
					const status_name = await caseStatus(element.createdUserId, element.loan_ref_id);
					if (status_name && status_name != sails.config.nc_status.status_name) {
						const getparams = {
							TableName: "status_manage_changes",
							FilterExpression:
								"loanId = :id and  loan_status_id = :loanstatusid and loan_sub_status_id = :loansubstatus ",
							ExpressionAttributeValues: {
								":id": {N: element.id.toString()},
								":loanstatusid": {N: element.loan_status_id.toString()},
								":loansubstatus": {
									N: element.loan_sub_status_id ? element.loan_sub_status_id.toString() : "0"
								}
							}
						};
						element.get_dynamodata = await sails.helpers.dynamodb(getparams, "SCAN_READ_ITEM", "");
						if (element.get_dynamodata.Items.length == 0) {
							const params = {
									Item: {
										loan_unique_id: {S: element.id + "-" + element.modified_on},
										loanId: {N: "" + element.id + ""},
										business_id: {N: "" + element.business_id + ""},
										loan_ref_id: {S: element.loan_ref_id},
										loan_status_id: {N: "" + element.loan_status_id + ""},
										loan_sub_status_id: {
											N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
										},
										status_changed_date: {
											S: element.modified_on ? element.modified_on : element.RequestDate
										},
										white_label_id: {S: element.white_label_id},
										status_name: {S: status_name},
										created_On: {S: await sails.helpers.dateTime()},
										status_history: {S: " "}
									},
									TableName: "status_manage_changes"
								},
								dynamodata = await sails.helpers.dynamodb(params, "INSERT_ITEM", "");
							if (dynamodata) {
								let callbackurl;
								if (users_details.email == sails.config.kvb_email.kvb_test_email) {
									callbackurl = sails.config.case_api.call_back_url;
								}
								if (users_details.email == sails.config.kvb_email.kvb_prod_email) {
									callbackurl = sails.config.case_api.call_back_url_prod;
								}

								const callbackjsondata = {
										case_id: element.loan_ref_id,
										processing_status: status_name,
										reportType: "BankStatement",
										error_message: casestatusobject.remarks ? casestatusobject.remarks : "",
										analysis: []
									},
									loandocument = await LoanDocumentRd.find({
										loan: element.id,
										business_id: element.business_id
									}).populate("doctype"),
									remarks_data = {
										case_remarks: casestatusobject.remarks
									},
									docType = [];
								if (loandocument.length > 0) {
									loandocument.forEach((document) => {
										docType.push(document.doctype.id);
									});
									if (
										(docType.indexOf(sails.config.doc_type.financial_doc_type1) !== -1 ||
											docType.indexOf(sails.config.doc_type.financial_doc_type2) !== -1) &&
										docType.indexOf(sails.config.doc_type.itr_doc_type) !== -1
									) {
										return res.badRequest({
											status: "nok",
											message: sails.config.msgConstants.caseHasDocuments
										});
									}
									if (
										docType.indexOf(sails.config.doc_type.financial_doc_type1) !== -1 ||
										docType.indexOf(sails.config.doc_type.financial_doc_type2) !== -1
									) {
										callbackjsondata.reportType = "BankStatement";
										callbackjsondata.error_message = JSON.stringify(remarks_data);
									}
									if (docType.indexOf(sails.config.doc_type.itr_doc_type) !== -1) {
										callbackjsondata.reportType = "ITR";
										callbackjsondata.error_message = JSON.stringify(remarks_data);
									}
								}
								const callbackbody = JSON.stringify(callbackjsondata),
									callbackmethod = "POST",
									callbackheaders = {
										"Content-Type": "application/json"
									};
								element.callbackResult = await sails.helpers.sailstrigger(
									callbackurl,
									callbackbody,
									callbackheaders,
									callbackmethod
								);
								const parseData = JSON.parse(element.callbackResult);
								if (parseData.errorCode && parseData.errorMessage) {
									callbackurl = sails.config.case_api.call_back_url_uat;
									element.callbackResult = await sails.helpers.sailstrigger(
										callbackurl,
										callbackbody,
										callbackheaders,
										callbackmethod
									);
								}
							}
						}
					}
				})
			).then(async () => {
				const callback_response = [];
				for (let i = 0; i < loan_details.length; i++) {
					if (loan_details[i].callbackResult) {
						const update_params = {
								TableName: "status_manage_changes",
								Key: {
									loan_unique_id: {
										S: "" + loan_details[i].id + "-" + loan_details[i].modified_on + ""
									}
								},
								UpdateExpression: "set status_history = :r",
								ExpressionAttributeValues: {
									":r": {S: "" + loan_details[i].callbackResult + ""}
								},
								ReturnValues: "UPDATED_NEW"
							},
							update_dynamodata = await sails.helpers.dynamodb(update_params, "UPDATE_ITEM", "");
						callback_response.push(JSON.parse(loan_details[i].callbackResult));
					}
				}
				return res.ok(callback_response);
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.noCaseToInsert
			});
		}
	},

	/**
   `  * @description :: FedFina Case Cron
	  * @api {get} /fedFinaCaseCron  FedFina Case Cron
	  * @apiName fedFinaCaseCron
	  * @apiGroup CasecronController
	  * @apiExample Example usage:
	  * curl -i localhost:1337/fedFinaCaseCron
	  *
	  * @apiSuccess {String} status
	  * @apiSuccess {String} message
	  * @apiSuccess {Object} data

		**/

	fedFinaCaseCron: async function (req, res) {
		const white_label_id = sails.config.white_label_id.fed_fina,
			minutes = new Date();
		minutes.setMinutes(minutes.getMinutes() - 5);
		const loan_details = await LoanrequestRd.find({
			white_label_id: white_label_id,
			or: [{RequestDate: {">=": minutes}}, {modified_on: {">=": minutes}}]
		});
		if (loan_details.length > 0) {
			Promise.all(
				loan_details.map(async (element) => {
					const status_name = await caseStatus(element.createdUserId, element.loan_ref_id);
					if (status_name && status_name != sails.config.nc_status.status_name) {
						const getparams = {
							TableName: "status_manage_changes",
							FilterExpression:
								"loanId = :id and  loan_status_id = :loanstatusid and loan_sub_status_id = :loansubstatus ",
							ExpressionAttributeValues: {
								":id": {
									N: "" + element.id + ""
								},
								":loanstatusid": {
									N: "" + element.loan_status_id + ""
								},
								":loansubstatus": {
									N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
								}
							}
						};

						element.get_dynamodata = await sails.helpers.dynamodb(getparams, "SCAN_READ_ITEM", "");

						if (element.get_dynamodata.Items.length == 0) {
							const params = {
									Item: {
										loan_unique_id: {S: element.id + "-" + element.modified_on},
										loanId: {N: "" + element.id + ""},
										business_id: {N: "" + element.business_id + ""},
										loan_ref_id: {S: element.loan_ref_id},
										loan_status_id: {N: "" + element.loan_status_id + ""},
										loan_sub_status_id: {
											N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
										},
										status_changed_date: {
											S: element.modified_on ? element.modified_on : element.RequestDate
										},
										white_label_id: {S: element.white_label_id},
										status_name: {S: status_name},
										created_On: {S: await sails.helpers.dateTime()},
										status_history: {S: " "}
									},
									TableName: "status_manage_changes"
								},
								dynamodata = await sails.helpers.dynamodb(params, "INSERT_ITEM", "");
							if (dynamodata) {
								const callbackurl = sails.config.fedFina_url.url;
								let callbackjsondata =
									"\"case_id\":\"" +
									element.loan_ref_id +
									"\",\"processing_status\":\"" +
									status_name +
									"\",\"analysis\":\"" +
									[] +
									"\"";
								const loandocument = await LoanDocumentRd.find({
										loan: element.id,
										business_id: element.business_id
									}).populate("doctype"),
									remarks_data = {
										case_remarks: casestatusobject.remarks
									},
									docType = [],
									docName = [];
								if (loandocument.length > 0) {
									loandocument.forEach((document) => {
										docType.push(document.doctype.id);
										if (document.status == sails.config.doc_type.doc_status) {
											docName.push(document.uploaded_doc_name);
										}
									});

									if (casestatusobject.document_status.length > 0) {
										remarks_data.document_remarks =
											casestatusobject.document_status[0].document_comments;
									}
									if (
										(docType.indexOf(sails.config.doc_type.financial_doc_type1) !== -1 ||
											docType.indexOf(sails.config.doc_type.financial_doc_type2) !== -1) &&
										docType.indexOf(sails.config.doc_type.itr_doc_type) !== -1
									) {
										return res.badRequest({
											status: "nok",
											message: sails.config.msgConstants.caseHasDocuments
										});
									}
									if (
										docType.indexOf(sails.config.doc_type.financial_doc_type1) !== -1 ||
										docType.indexOf(sails.config.doc_type.financial_doc_type2) !== -1
									) {
										if (casestatusobject.bank_status.length > 0) {
											remarks_data.bank_remarks = casestatusobject.bank_status[0].uw_remarks_id;
										}
										callbackjsondata = `{${callbackjsondata} , "reportType" : "BankStatement" , "doc_name" : ${JSON.stringify(
											docName
										)}, "error_message" : ${JSON.stringify(remarks_data)}}`;
									}
									if (docType.indexOf(sails.config.doc_type.itr_doc_type) !== -1) {
										if (casestatusobject.itr_status.length > 0) {
											remarks_data.itr_remarks = casestatusobject.itr_status[0].uw_remarks_id;
										}
										callbackjsondata = `{${callbackjsondata} , "reportType" : "ITR" , "doc_name" : ${JSON.stringify(
											docName
										)}, "error_message" : ${JSON.stringify(remarks_data)}}`;
									}
								} else {
									callbackjsondata = `{${callbackjsondata} , "reportType" : "BankStatement" , "doc_name" : ${JSON.stringify(
										docName
									)},  "error_message" : ${JSON.stringify(remarks_data)}}`;
								}
								const callbackbody = callbackjsondata,
									callbackmethod = "POST",
									callbackheaders = {
										"Content-Type": "application/json"
									};
								element.callbackResult = await sails.helpers.sailstrigger(
									callbackurl,
									callbackbody,
									callbackheaders,
									callbackmethod
								);
							}
						}
					}
				})
			).then(async () => {
				const callback_response = [];
				for (let i = 0; i < loan_details.length; i++) {
					if (loan_details[i].callbackResult) {
						const update_params = {
								TableName: "status_manage_changes",
								Key: {
									loan_unique_id: {
										S: "" + loan_details[i].id + "-" + loan_details[i].modified_on + ""
									}
								},
								UpdateExpression: "set status_history = :r",
								ExpressionAttributeValues: {
									":r": {S: "" + loan_details[i].callbackResult + ""}
								},
								ReturnValues: "UPDATED_NEW"
							},
							update_dynamodata = await sails.helpers.dynamodb(update_params, "UPDATE_ITEM", "");
						callback_response.push(JSON.parse(loan_details[i].callbackResult));
					}
				}
				return res.ok(callback_response);
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.noCaseToInsert
			});
		}
	},
	tricolorCaseCron: async function (req, res) {
		const white_label_id = sails.config.white_label_id.tricolor,
			minutes = new Date();
		minutes.setMinutes(minutes.getMinutes() - 15);
		const loan_details = await LoanrequestRd.find({
			white_label_id: white_label_id,
			or: [{RequestDate: {">=": minutes}}, {modified_on: {">=": minutes}}]
		});
		if (loan_details.length > 0) {
			Promise.all(
				loan_details.map(async (element) => {
					const status_name = await caseStatus(element.createdUserId, element.loan_ref_id);
					if (status_name && status_name != sails.config.nc_status.status_name) {
						const getparams = {
							TableName: "status_manage_changes",
							FilterExpression:
								"loanId = :id and  loan_status_id = :loanstatusid and loan_sub_status_id = :loansubstatus ",
							ExpressionAttributeValues: {
								":id": {
									N: "" + element.id + ""
								},
								":loanstatusid": {
									N: "" + element.loan_status_id + ""
								},
								":loansubstatus": {
									N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
								}
							}
						};

						element.get_dynamodata = await sails.helpers.dynamodb(getparams, "SCAN_READ_ITEM", "");

						if (element.get_dynamodata.Items.length == 0) {
							const params = {
									Item: {
										loan_unique_id: {S: element.id + "-" + element.modified_on},
										loanId: {N: "" + element.id + ""},
										business_id: {N: "" + element.business_id + ""},
										loan_ref_id: {S: element.loan_ref_id},
										loan_status_id: {N: "" + element.loan_status_id + ""},
										loan_sub_status_id: {
											N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
										},
										status_changed_date: {
											S: element.modified_on ? element.modified_on : element.RequestDate
										},
										white_label_id: {S: element.white_label_id},
										status_name: {S: status_name},
										created_On: {S: await sails.helpers.dateTime()},
										status_history: {S: " "}
									},
									TableName: "status_manage_changes"
								},
								dynamodata = await sails.helpers.dynamodb(params, "INSERT_ITEM", "");
							if (dynamodata) {
								let callbackurl, callbackheaders;
								if (users_details.email == sails.config.tricolorEmail.uatEmail) {
									callbackurl = sails.config.tricolor_url.uat_url;
									callbackheaders = sails.config.tricolorUatData;
								}
								if (users_details.email == sails.config.tricolorEmail.prodEmail) {
									callbackurl = sails.config.tricolor_url.prod_url;
									callbackheaders = sails.config.tricolorProdData;
								}
								const callbackjsondata = {
										case_id: element.loan_ref_id,
										processing_status: status_name,
										reportType: "BankStatement",
										doc_name: "",
										error_message: casestatusobject.remarks ? casestatusobject.remarks : ""
									},
									loandocument = await LoanDocumentRd.find({
										loan: element.id,
										business_id: element.business_id
									}).populate("doctype"),
									docType = [],
									docName = [],
									remarks_data = {
										case_remarks: casestatusobject.remarks
									};
								if (loandocument.length > 0) {
									loandocument.forEach((document) => {
										docType.push(document.doctype.id);
										if (document.status == sails.config.doc_type.doc_status) {
											docName.push(document.uploaded_doc_name);
										}
									});

									if (casestatusobject.document_status.length > 0) {
										remarks_data.document_remarks =
											casestatusobject.document_status[0].document_comments;
									}
									if (
										(docType.indexOf(sails.config.doc_type.financial_doc_type1) !== -1 ||
											docType.indexOf(sails.config.doc_type.financial_doc_type2) !== -1) &&
										docType.indexOf(sails.config.doc_type.itr_doc_type) !== -1
									) {
										return res.badRequest({
											status: "nok",
											message: sails.config.msgConstants.caseHasDocuments
										});
									}
									if (
										docType.indexOf(sails.config.doc_type.financial_doc_type1) !== -1 ||
										docType.indexOf(sails.config.doc_type.financial_doc_type2) !== -1
									) {
										if (casestatusobject.bank_status.length > 0) {
											remarks_data.bank_remarks = casestatusobject.bank_status[0].uw_remarks_id;
										}
										callbackjsondata.reportType = "BankStatement";
										callbackjsondata.doc_name = docName;
										callbackjsondata.error_message = JSON.stringify(remarks_data);
									}
									if (docType.indexOf(sails.config.doc_type.itr_doc_type) !== -1) {
										if (casestatusobject.itr_status.length > 0) {
											remarks_data.itr_remarks = casestatusobject.itr_status[0].uw_remarks_id;
										}
										callbackjsondata.reportType = "ITR";
										callbackjsondata.doc_name = docName;
										callbackjsondata.error_message = JSON.stringify(remarks_data);
									}
								}
								const callbackbody = JSON.stringify(callbackjsondata),
									callbackmethod = "POST";
								element.callbackResult = await sails.helpers.sailstrigger(
									callbackurl,
									callbackbody,
									callbackheaders,
									callbackmethod
								);
							}
						}
					}
				})
			).then(async () => {
				const callback_response = [];
				for (let i = 0; i < loan_details.length; i++) {
					if (loan_details[i].callbackResult) {
						const update_params = {
								TableName: "status_manage_changes",
								Key: {
									loan_unique_id: {
										S: "" + loan_details[i].id + "-" + loan_details[i].modified_on + ""
									}
								},
								UpdateExpression: "set status_history = :r",
								ExpressionAttributeValues: {
									":r": {S: "" + loan_details[i].callbackResult + ""}
								},
								ReturnValues: "UPDATED_NEW"
							},
							update_dynamodata = await sails.helpers.dynamodb(update_params, "UPDATE_ITEM", "");
						callback_response.push(JSON.parse(loan_details[i].callbackResult));
					}
				}
				return res.ok(callback_response);
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.noCaseToInsert
			});
		}
	},
	dbCaseCron: async function (req, res) {
		const white_label_id = sails.config.white_label_id.db_bank,
		loan_ref_id = req.param("loan_ref_id");
		where_condition = {
			white_label_id: white_label_id,
			loan_status_id : 8,
	         loan_sub_status_id : 12
		};
		if (loan_ref_id){
			where_condition.loan_ref_id = loan_ref_id;
		} else {
			minutes = new Date();
			minutes.setMinutes(minutes.getMinutes() - 17);
			where_condition.modified_on = {">=": minutes};
		}
		const loan_details = await LoanrequestRd.find(where_condition);
		if (loan_details.length > 0) {
			Promise.all(
				loan_details.map(async (element) => {
					if (element.loan_status_id == 8 && element.loan_sub_status_id == 12){
						const {status_name, remarks} = await caseStatus(element.createdUserId, element.loan_ref_id);
						if (status_name && status_name != sails.config.nc_status.status_name) {
							const getparams = {
								TableName: "status_manage_changes",
								FilterExpression:
								"loanId = :id and  loan_status_id = :loanstatusid and loan_sub_status_id = :loansubstatus ",
								ExpressionAttributeValues: {
									":id": {
										N: "" + element.id + ""
									},
									":loanstatusid": {
										N: "" + element.loan_status_id + ""
									},
									":loansubstatus": {
										N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
									}
								}
							};

							element.get_dynamodata = await sails.helpers.dynamodb(getparams, "SCAN_READ_ITEM", "");
							if (element.get_dynamodata.Items.length == 0) {
								const params = {
										Item: {
											loan_unique_id: {S: element.id + "-" + element.modified_on},
											loanId: {N: "" + element.id + ""},
											business_id: {N: "" + element.business_id + ""},
											loan_ref_id: {S: element.loan_ref_id},
											loan_status_id: {N: "" + element.loan_status_id + ""},
											loan_sub_status_id: {
												N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
											},
											status_changed_date: {
												S: element.modified_on ? element.modified_on : element.RequestDate
											},
											white_label_id: {S: element.white_label_id},
											status_name: {S: status_name},
											created_On: {S: await sails.helpers.dateTime()},
											status_history: {S: " "}
										},
										TableName: "status_manage_changes"
									},
									dynamodata = await sails.helpers.dynamodb(params, "INSERT_ITEM", "");
								if (dynamodata) {
									let callbackurl;
									if (Number(element.white_label_id) === sails.config.db_url.uat_wl){
										 callbackurl = sails.config.db_url.uat_callback_url;
									} else {
										callbackurl = sails.config.db_url.callback_url;
									}
										const callbackjsondata = {
											request: {
												header: {
													msgID: new Date(element.RequestDate).getTime(),
													reqSystem: "DBAG",
													reqType: "NC",
													userId: white_label_id
												},
												data: {
													caseId: element.loan_ref_id,
													reportType: "D",
													processingStatus: status_name,
													errorMessage: remarks,
													docName: ""
												}
											}
										},
										docName = [],
										loandocument = await LoanDocumentRd.find({
											loan: element.id,
											business_id: element.business_id
										});
									if (loandocument.length > 0) {
										loandocument.forEach((document) => {
											if (document.status == sails.config.doc_type.doc_status) {
												docName.push({
													doctypeId: document.doc_type_id,
													docName: document.uploaded_doc_name
												});
											}
										});
										callbackjsondata.data.docTypeId = docName;
									}
									const token = await authentication(element.white_label_id);
								 callbackbody = JSON.stringify(callbackjsondata),
									callbackmethod = "POST",
									callbackheaders = {Authorization : "Bearer " + token};
									console.log("++++++++++++++++++++++++++++++++++++++++++", callbackurl,
										callbackbody,
										callbackheaders,
										callbackmethod);
									element.callbackResult = await sails.helpers.sailstrigger(
										callbackurl,
										callbackbody,
										callbackheaders,
										callbackmethod
									);
								}
							}
						}
					}
				})
			).then(async () => {
				const callback_response = [];
				for (let i = 0; i < loan_details.length; i++) {
					if (loan_details[i].callbackResult) {
						const update_params = {
								TableName: "status_manage_changes",
								Key: {
									loan_unique_id: {
										S: "" + loan_details[i].id + "-" + loan_details[i].modified_on + ""
									}
								},
								UpdateExpression: "set status_history = :r",
								ExpressionAttributeValues: {
									":r": {S: "" + loan_details[i].callbackResult + ""}
								},
								ReturnValues: "UPDATED_NEW"
							},
							update_dynamodata = await sails.helpers.dynamodb(update_params, "UPDATE_ITEM", "");
						callback_response.push(JSON.parse(loan_details[i].callbackResult));
					}
				}
				return res.ok(callback_response);
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.noCaseToInsert
			});
		}
	},

	iciciCaseCron: async function (req, res) {
		const white_label_id = sails.config.white_label_id.icici,
			minutes = new Date();
		minutes.setMinutes(minutes.getMinutes() - 15);
		const loan_details = await LoanrequestRd.find({
			white_label_id: white_label_id,
			or: [{RequestDate: {">=": minutes}}, {modified_on: {">=": minutes}}]
		});
		if (loan_details.length > 0) {
			Promise.all(
				loan_details.map(async (element) => {
					if (element.loan_status_id === 8 && element.loan_sub_status_id === 12 && element.remarks_val != 5) {
						const status_name = await caseStatus(element.createdUserId, element.loan_ref_id);
						if (status_name && status_name != sails.config.nc_status.status_name) {
							const getparams = {
								TableName: "status_manage_changes",
								FilterExpression:
									"loanId = :id and loan_status_id = :loanstatusid and loan_sub_status_id = :loansubstatus ",
								ExpressionAttributeValues: {
									":id": {N: element.id.toString()},
									":loanstatusid": {N: element.loan_status_id.toString()},
									":loansubstatus": {
										N: element.loan_sub_status_id ? element.loan_sub_status_id.toString() : "0"
									}
								}
							};
							element.get_dynamodata = await sails.helpers.dynamodb(getparams, "SCAN_READ_ITEM", "");
							if (element.get_dynamodata.Items.length == 0) {
								const params = {
										Item: {
											loan_unique_id: {S: element.id + "-" + element.modified_on},
											loanId: {N: "" + element.id + ""},
											business_id: {N: "" + element.business_id + ""},
											loan_ref_id: {S: element.loan_ref_id},
											loan_status_id: {N: "" + element.loan_status_id + ""},
											loan_sub_status_id: {
												N: element.loan_sub_status_id ? "" + element.loan_sub_status_id + "" : "0"
											},
											status_changed_date: {
												S: element.modified_on ? element.modified_on : element.RequestDate
											},
											white_label_id: {S: element.white_label_id},
											status_name: {S: status_name},
											created_On: {S: await sails.helpers.dateTime()},
											status_history: {S: " "}
										},
										TableName: "status_manage_changes"
									},
									dynamodata = await sails.helpers.dynamodb(params, "INSERT_ITEM", "");
								if (dynamodata) {
									const callbackurl = sails.config.icici_url.url,
										callbackjsondata = {
											case_id: element.loan_ref_id,
											processing_status: status_name,
											reportType: "BankStatement",
											error_message: casestatusobject.remarks ? casestatusobject.remarks : "",
											doc_name: [],
											analysis: []
										},
										docName = [],
										loandocument = await LoanDocumentRd.find({
											loan: element.id,
											business_id: element.business_id
										});
									if (loandocument.length > 0) {
										loandocument.forEach((document) => {
											if (document.status == sails.config.doc_type.doc_status) {
												docName.push(document.uploaded_doc_name);
											}
										});
										callbackjsondata.doc_name = docName;
									}
									const encryptDataResult = await sails.helpers.crypto.with({
											action: "iciciEncrypt",
											data: callbackjsondata
										}),
										encryptedBody = {
											requestId: "",
											service: "",
											encryptedKey: encryptDataResult.encryptedkey,
											oaepHashingAlgorithm: "NONE",
											iv: encryptDataResult.iv,
											encryptedData: encryptDataResult.cipher,
											clientInfo: "",
											optionalParam: ""
										},
										callbackmethod = "POST",
										callbackheaders = {
											"Content-Type": "application/json",
											apikey: sails.config.icici_url.apikey
										};
									element.callbackResult = await sails.helpers.sailstrigger(
										callbackurl,
										JSON.stringify(encryptedBody),
										callbackheaders,
										callbackmethod
									);
								}
							}
						}
					}
				})
			).then(async () => {
				const callback_response = [];
				for (let i = 0; i < loan_details.length; i++) {
					if (loan_details[i].callbackResult) {
						const decryptDataResult = await sails.helpers.crypto.with({
								action: "iciciDecrypt",
								data: JSON.parse(loan_details[i].callbackResult)
							}),
							update_params = {
								TableName: "status_manage_changes",
								Key: {
									loan_unique_id: {
										S: "" + loan_details[i].id + "-" + loan_details[i].modified_on + ""
									}
								},
								UpdateExpression: "set status_history = :r",
								ExpressionAttributeValues: {
									":r": {S: "" + decryptDataResult + ""}
								},
								ReturnValues: "UPDATED_NEW"
							},
							update_dynamodata = await sails.helpers.dynamodb(update_params, "UPDATE_ITEM", "");
						callback_response.push(JSON.parse(loan_details[i].callbackResult));
					}
				}
				return res.ok(callback_response);
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.noCaseToInsert
			});
		}
	}
};

async function authentication(white_label_id){
	let token = "", url;
	if (Number(white_label_id) === sails.config.db_url.uat_wl){
		url =  sails.config.db_url.uat_auth_url;
   } else {
		url =  sails.config.db_url.auth_url;
   }
	const body = {
			"passkey": "l0s%@pI$",
			"username": "vdE77L5lYiZ24aGWdg426A==",
			"password": "PH4yEH9aRonyW2G4GKgWqaz0bWTGuGhu"
		};
		 authData = await sails.helpers.sailstrigger(
			url,
			JSON.stringify(body),
			{},
			"POST"
		);
	if (authData.status != "nok"){
		token = (JSON.parse(authData)).accesstoken;
	}
	return token;
}

async function caseStatus (userid, loan_ref_id){
	let status_name = "", remarks = "";
	const users_details = await UsersRd.findOne({
			id: userid
		}),
		 token = await new SignJWT({subject: "uuid", user:users_details})
			.setProtectedHeader({ alg: "EdDSA" })
			.setExpirationTime("1d")
			.sign(private_key);
	casestatusurl = sails.config.case_api.case_status_url,
	casestatusjsondata = {case_id: loan_ref_id},
	casestatusbody = JSON.stringify(casestatusjsondata),
	casestatusmethod = "POST",
	casestatusheaders = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`
	},
	caseStatusResult = await sails.helpers.sailstrigger(
		casestatusurl,
		casestatusbody,
		casestatusheaders,
		casestatusmethod
	);
	if (caseStatusResult.status != "nok") {
		status_name = (JSON.parse(caseStatusResult)).nc_status.name;
		remarks = (JSON.parse(caseStatusResult)).remarks;
	}
	return {status_name, remarks};
}