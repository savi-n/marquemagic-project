const reqParams = require("../helpers/req-params"),
	AWS = require("aws-sdk");
const s3 = new AWS.S3({accessKeyId: sails.config.aws.key, secretAccessKey: sails.config.aws.secret});
module.exports = {
	update_customer_id: async function (req, res) {
		const reqData = req.allParams(),
		 {loan_id, director_id, customer_id} = reqData;
		params = {loan_id, director_id, customer_id};
		fields = ["loan_id", "director_id", "customer_id"];
		missing = await reqParams.fn(params, fields);
		if (!loan_id || !director_id || !customer_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_details = await LoanrequestRd.findOne({id: loan_id});
		if(!loan_details){
			return res.badRequest({
				status : "nok",
				message : "Invalid case id."
			});
		}
		director_details = await DirectorRd.findOne({
			id : director_id
		});
		if (director_details && !director_details.customer_id) {
			await Director.update({
				id: director_id
			})
				.set({customer_id : customer_id});
			if (director_details.isApplicant == 1){
				await Business.update({id :loan_details.business_id}).set({
					customer_id
				});
			}
		}
		return res.ok({
			status: "ok",
			message: "Customer id updated successfully"
		});
	},
	statusUpdate: async function (req, res) {
		const reqData = req.allParams(),
		 {case_id, status, documents} = reqData,
			params = req.allParams();
		fields = ["case_id", "status", "sanction_amount", "sanction_interest", "sanction_process_fee", "sanction_date","term", "emi_amount"];
		missing = await reqParams.fn(params, fields);
		if (!case_id || !status || missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (sails.config.nc_status.status_name_federal.includes(status) === false) {
			return res.badRequest({
				status: "nok",
				message: "Invalid status"
			});
		}
		const loan_request_data = await LoanrequestRd.findOne({loan_ref_id: case_id}).populate("business_id");
		if (!loan_request_data.loan_ref_id) {
			return res.badRequest({
				status: "nok",
				message: "Invalid case id"
			});
		}
		 const loan_bankmapping_details = await LoanBankMappingRd.find({loan_id: loan_request_data.id});
		timestamp = await sails.helpers.dateTime();
		if (documents.length > 0){
			let {s3_name, s3_region} =
					(whiteLabelSolution_data = await WhiteLabelSolutionRd.findOne({
						id: loan_request_data.white_label_id
					})) || {};
			const upload_file = await sails.helpers.lenderDocUpload(documents, loan_request_data.id,
				loan_bankmapping_details[0].id,loan_request_data.business_id.userid, req.user.id, "yes", "", s3_name, s3_region);
			console.log(upload_file);
		}
		const sanctionData = await LoanSanctionRd.find({loan_id : loan_request_data.id, loan_bank_mapping : loan_bankmapping_details[0].id});
		if (sanctionData.length > 0){
			await LoanSanction.update({id : sanctionData[0].id }).set({
				sanction_status : status
			});
		} else {
			header = {
				Authorization: req.headers.authorization
			};
			 const give_offer_data = await giveOffer(reqData, loan_request_data.id,  loan_bankmapping_details[0].id, header),
			 sanction_data = await sanctionDetails(reqData, loan_request_data.id,  loan_bankmapping_details[0].id, header);
			 if (give_offer_data.status == "nok" || sanction_data.status == "nok"){
				const error = give_offer_data.status == "nok" ? give_offer_data : sanction_data;
				return res.badRequest({
					status : "nok",
					data : error
				})
			 }
		}
		return res.ok({
			status: "ok",
			message: "Sanction data created successfully",
			data: {
				case_id: case_id,
				status: status
			}
		});
	},
	conditions_and_complainces : async function (req, res){
		const {case_id, conditions, cad_status} = req.allParams();
		if (!case_id || !conditions || conditions.length === 0 ){
			return res.badRequest({
				status : "nok",
				message : "Mandatory fields are missing."
			});
		}
		const datetime = await sails.helpers.dateTime(),
		 condition_complaince = [],
			loanrequestData = await LoanrequestRd.findOne({loan_ref_id : case_id});
		 if (!loanrequestData){
			return res.badRequest({
				status : "nok",
				message :"invalid case id"
			});
		 }
		 const loanProduct = await LoanProductsRd.findOne({
			id: loanrequestData.loan_product_id
		});
		 let terms_conditions = loanProduct.terms_conditions ? JSON.parse(loanProduct.terms_conditions) : {};
		 terms_conditions = terms_conditions ? terms_conditions.sanction_condition[0] : {
			status: ["Complied", "Not Complied", "OTC", "PDD", "Waived"],
			approval_user_type: "Bank",
			exposure_limit: [],
			approval_user_sub_type: "Compliance",
			approval_category : "Central"
		};
		for (let i = 0; i < conditions.length; i++ ){
			condition_complaince.push({
				id : i + 1,
				...conditions[i],
				description: [conditions[i].description],
				category: sails.config.msgConstants.SANCTIONED,
				status: terms_conditions.status,
				exposure_limit: terms_conditions.exposure_limit,
				target_date: "",
				approval_user_type: terms_conditions.approval_user_type,
				approval_user_sub_type: terms_conditions.approval_user_sub_type,
				approval_category : terms_conditions.approval_category,
				received_from: sails.config.msgConstants.MANUAL_ENTRY,
				created_at: datetime,
				created_by: req.user.id,
				updated_at: datetime,
				updated_by: req.user.id,
				cad_status
			});
		}
		const loanPreFetch = await LoanPreFetchRd.find({
			loan_id: loanrequestData.id,
			request_type: sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS
		})
			.sort("id DESC")
			.limit(1);
		if (loanPreFetch.length > 0 && loanPreFetch[0].initial_json){
			await LoanPreFetch.updateOne({id: loanPreFetch[0].id}).set({
				initial_json: JSON.stringify({sanction_condition : condition_complaince, cad_status}),
				updated_at : datetime
			});
		} else {
			await LoanPreFetch.create({
				request_type : sails.config.msgConstants.SANCTION_TERMS_AND_CONDITIONS,
				loan_id : loanrequestData.id,
				initial_json :  JSON.stringify({sanction_condition : condition_complaince, cad_status}),
				status : "Fetch",
				created_at : datetime
			});
		}
		return res.ok({
			status : "ok",
			message : "Conditions inserted successfully.",
			data : {
				case_id, conditions
			}
		});
	},
	loanDetails : async function (req, res){
		const loan_ref_id = req.param("case_id");
		if (!loan_ref_id){
			return res.badRequest({
				status : "nok",
				message : "Case ID is missing."
			});
		}
		try {
			const loanData = await LoanrequestRd.findOne({where : {loan_ref_id}, select : ["business_id","authentication_data"]}).populate("loan_document", {doctype : [116,117], status : "active"});
			if (!loanData){
				return res.badRequest({
					status : "nok",
					message : "Invalid case id"
				});
			}
			const authData = loanData.authentication_data ? JSON.parse(loanData.authentication_data).s3_data : {};
			if (!authData || loanData.loan_document.length === 0) {
				return res.badRequest({
					status : "nok",
					message : "Case is still processing. Please try for some time."
				});
			}
			const param = {
				Bucket :  authData.bucket,
				Key : authData.filePath
			};
		 let jsonFileData = await s3.getObject(param).promise();
		 jsonFileData = jsonFileData.Body.toString();
		 const parseData = JSON.parse(jsonFileData),
		  newData = parseData.filter(item => item.section_name !== "Loan Document Details");
		 for (let i = 0; i < newData.length; i++) {
				delete newData[i].address_doc_details;
				delete newData[i].coApp_address_doc_details;
				delete newData[i].garantor_address_doc_details;
		  }
		 const finalData =  await replaceSpacesWithUnderscores(newData),
		 document_details = await director_doc_data_mapping(loanData.business_id, loanData.id, authData.bucket),
		  financial_CAM = [], banking_CAM = [];
		  finalData.push({section_name : "Document Details", fields :document_details.doc_data});
		 for (const i in loanData.loan_document) {
				if (loanData.loan_document[i].json_extraction) {
					try {
						const jsonData = JSON.parse(loanData.loan_document[i].json_extraction);
						s3.region = jsonData.s3_region;
						const getParams = {
								Bucket: jsonData.s3_name,
								Key: jsonData.s3_filepath
							},
					 file = await s3.getObject(getParams).promise(),
					 fileStringifyJson = file.Body.toString(),
		 			 fileparseData = JSON.parse(fileStringifyJson);
						if (loanData.loan_document[i].doctype === 116){
							banking_CAM.push(fileparseData);
						}
						if(loanData.loan_document[i].doctype === 117){
							financial_CAM.push(fileparseData);
						}
					} catch (error){
						return res.badRequest({
							status : "nok",
							message : "Error in getting the master JSON data from S3 ",
							data : error
						});
					}
				}
		 }
			const resData = {
				application_json : finalData || [],
				cibil_data : {fields :document_details.cibilData},
				credit_assesment_json : {
					financial_CAM : financial_CAM,
					banking_CAM : banking_CAM
				}
			};
			return res.ok({
				status : "ok",
				message : "Loan details",
				data : resData
			});
		} catch (err){
			return res.badRequest({
				status : "nok",
				message : "Internal server error",
				data : err
			});
		}
	},
	LenderDoc_upload : async function (req, res){
		const case_id = req.body.case_id,
			document = req.file("document");
		if (document.fieldName == "NOOP_document"){
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.selectDocument
			});
		}
		const params = {case_id, document};
		fields = ["case_id", "document"];
		missing = await reqParams.fn(params, fields);
		if (!case_id || !document) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_request_data = await LoanrequestRd.findOne({where : {loan_ref_id: case_id}, select : ["white_label_id", "business_id", "loan_ref_id"]}).populate("business_id");
		if (!loan_request_data.loan_ref_id) {
			return res.badRequest({
				status: "nok",
				message: "Invalid case id"
			});
		}
		const dirData = await DirectorRd.find({business: loan_request_data.business_id.id, isApplicant : 1}).select("id"),
		 loan_bankmapping_details = await LoanBankMapping.find({loan_id: loan_request_data.id}).select("id");
		timestamp = await sails.helpers.dateTime();
		let {s3_name, s3_region} =
					(whiteLabelSolution_data = await WhiteLabelSolutionRd.findOne({
						id: loan_request_data.white_label_id
					})) || {};
		s3_name = `${s3_name}/users_${loan_request_data.business_id.userid}`;
		const array_data = [],
			 uploadFile = await sails.helpers.s3Upload(document, s3_name, s3_region);
		lenderDocDetails = {
			loan: loan_request_data.id,
			loan_bank_mapping: loan_bankmapping_details.length > 0 ? loan_bankmapping_details[0].id : 1,
			user_id: loan_request_data.business_id.userid,
			directorId: dirData.length > 0 ? dirData[0].id : 0,
			uploaded_by: req.user.id,
			status: "active",
			ints: timestamp,
			on_upd: timestamp,
			doc_name : uploadFile[0].fd,
			doc_type : sails.config.sanction_letter_doc_type,
			uploaded_doc_name : uploadFile[0].filename,
			original_doc_name : uploadFile[0].filename,
			size_of_file : uploadFile[0].size
		};
		 await LenderDocument.create(lenderDocDetails).fetch();
		return res.ok({
			status: "ok",
			message : "Document uploaded successfully"
		});
	}
};
function replaceSpacesWithUnderscores(obj) {
	if (typeof obj === "object") {
		if (Array.isArray(obj)) {
			return obj.map(item => replaceSpacesWithUnderscores(item));
		} else {
			const newObj = {};
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					const newKey = key.replace(/ /g, "_"); // Replace spaces with underscores
					newObj[newKey] = replaceSpacesWithUnderscores(obj[key]);
				}
			}
			return newObj;
		}
	} else {
		return obj;
	}
}
async function giveOffer(offer_data, loan_id, loan_bank_mapping_id, header){
	const reqPayload = {
			loan_bank_mapping_id,
			status : "Approve",
			loan_id,
			offer_amount : offer_data.sanction_amount,
			interest_rate : offer_data.sanction_interest,
			term : offer_data.term,
			emi : offer_data.emi_amount,
			processing_fee : offer_data.sanction_process_fee,
			remarks :offer_data.samction_comment
		},
		url = sails.config.giveOffer,
		apiRes = await sails.helpers.sailstrigger(url, JSON.stringify(reqPayload), header, "POST");
	return apiRes;
}
async function sanctionDetails(sanction_data, loan_id, loan_bank_mapping_id, header){
	const reqPayload = {
			loan_bank_map_id : loan_bank_mapping_id,
			sanction_type : 12,
			loan_id,
			san_amount : sanction_data.sanction_amount,
			san_interest : sanction_data.sanction_interest,
			term : sanction_data.term,
			emi : sanction_data.emi_amount,
			sanction_process_fee : sanction_data.sanction_process_fee,
			san_date : sanction_data.sanction_date ,
			sanction_status :  sanction_data.status
		},
		url = sails.config.sanctionDetails,
		apiRes = await sails.helpers.sailstrigger(url, JSON.stringify(reqPayload), header, "POST");
	return apiRes;
}
async function fetchDMSId(loan_id, director_id){
	const loanDocument = await LoanDocumentRd.find({loan : loan_id, directorId : director_id, status : "active" }).select(["uploaded_doc_name", "doctype"]),
		lenderDocument = await LenderDocumentRd.find({loan : loan_id, directorId : director_id, status : "active"}).select(["uploaded_doc_name", "uploaded_doc_ref_id", "doc_type"]),
		// const loanDocument = await LoanDocumentRd.find({loan : loan_id}).select("uploaded_doc_name"),
		// 	lenderDocument = await LenderDocumentRd.find({loan : loan_id}).select(["uploaded_doc_name", "uploaded_doc_ref_id"]),
	 docArray = [];
	if(loanDocument.length > 0){
		for (const loanDocId of loanDocument){
			const docExtData = await LoanDocumentExt.findOne({loan_id, loan_document_id : loanDocId.id}).select("doc_ref_id");
			if (docExtData && docExtData.doc_ref_id) {
				const loan_doc_data = {
					doc_id : docExtData.doc_ref_id,
					doc_name : loanDocId.uploaded_doc_name,
					doc_type_id : loanDocId.doctype
				};
				docArray.push(loan_doc_data);
			}
		}
	}
	if(lenderDocument.length > 0){
		for (const lenderDoc of lenderDocument){
			if (lenderDoc.uploaded_doc_ref_id){
				const lender_doc_data = {
					doc_id : lenderDoc.uploaded_doc_ref_id,
					doc_name : lenderDoc.uploaded_doc_name,
					doc_type_id : lenderDoc.doc_type
				};
				docArray.push(lender_doc_data);
			}
		}
	}
	return docArray;

}
async function director_doc_data_mapping(business_id, loan_id, bucket){
	const dataRes = {
			doc_data : [],
			cibilData : []
		},
		dirData = await DirectorRd.find({business : business_id}).select(["dfirstname", "middle_name","dlastname"]);
	if (dirData.length > 0){
		for (const dir_data of dirData){
			let name;
			if (dir_data.middle_name && dir_data.dlastname){
				name = dir_data.dfirstname + " "+ dir_data.middle_name + " " + dir_data.dlastname;
			} else {
				name = dir_data.dfirstname + " " + dir_data.dlastname;
			}
			if(dir_data.isApplicant == 1){
				dir_data.id = [0, dir_data.id];
			}
			const doc_details = await fetchDMSId(loan_id, dir_data.id),
				cibil_details = await cibil_data_fetch(loan_id, dir_data.id, bucket);
			dataRes.doc_data.push({[name] : doc_details});
			dataRes.cibilData.push({[name] : cibil_details});
		}
	}
	return dataRes;
}
async function cibil_data_fetch(loan_id, director_id, bucket){
	let dataRes;
	const loanDocument = await LoanDocumentRd.find({loan : loan_id,doc_name: { contains: '.json' }, directorId : director_id,doctype : 35, status : "active" });
	if (loanDocument.length > 0){
		const param = {
			Bucket :  bucket,
			Key : "users_"+loanDocument[0].user_id +"/" +loanDocument[0].doc_name
		};
		let jsonFileData = await s3.getObject(param).promise();
		 jsonFileData = jsonFileData.Body.toString();
		 dataRes = JSON.parse(jsonFileData);
	} else {
		dataRes = {};
	}
	return dataRes;
}
