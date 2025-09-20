/**
 * GeoLocationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require("moment-timezone");
const reqParams = require("../helpers/req-params");

module.exports = {
	getLocation: async function (req, res) {
		const {lat, long} = req.allParams();

		if (!lat || !long) return res.badRequest(sails.config.res.missingFields);

		let [location, timestamp] = await Promise.all([
			sails.helpers.fetchLocation(lat, long),
			sails.helpers.indianDateTime()
		]);

		timestamp = moment(timestamp).format("DD/MM/YYYY - hh:mm:ss");

		return res.send({
			status: "ok",
			statusCode: "NC200",
			data: {
				address: location,
				lat: lat,
				long: long,
				timestamp
			}
		});
	},

	geo_upload_img: async function (req, res) {
		let = {loan_ref_id, loan_id, lat, long, director_id,
			user_id, doc_type_id, white_label_id, get_single_document}= req.allParams();
		const document = req.file("document"),
		 params = req.allParams(),
		 fields = [
				"loan_ref_id",
				"director_id",
				"user_id",
				"doc_type_id",
				"white_label_id",
				"loan_id"
			],
		 missing = await reqParams.fn(params, fields);
		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (!document || document.isNoop === true || document._files.length === 0) {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.selectDocument
			});
		}
		try {
			let timestamp = await sails.helpers.indianDateTime();
			timestamp = moment(timestamp).format("DD/MM/YYYY - hh:mm:ss");
			let {s3_name, s3_region, geo_tagging} =
				(await WhiteLabelSolutionRd.findOne({id: white_label_id})) || {};
			const bucket = s3_name;
			s3_name = `${s3_name}/users_${user_id}`;
			uploadFile = await sails.helpers.s3Upload(document, s3_name, s3_region);
			let docName = uploadFile[0].fd,
			 presignedUrl = await sails.helpers.s3ViewDocument(docName, s3_name, s3_region);
			const uploaded_data = {
				s3_name,
				s3_region,
				filename: uploadFile[0].filename,
				lat: lat,
				long: long,
				timestamp: timestamp,
				director_id,
				white_label_id
			};
			let thump_file_path = presignedUrl;
			geo_tagging = geo_tagging ?  JSON.parse(geo_tagging) : {};
			if (geo_tagging && geo_tagging.geo_tagging == true && lat && long) {
				const latLong_data = await sails.helpers.fetchLocation(lat, long);
				uploaded_data.address = latLong_data;
				uploaded_data.timestamp = timestamp;
				uploaded_data.destFolder = `users_${user_id}`;
				body = {
					user_id: uploaded_data.destFolder,
					doc_name: docName,
					white_label_id: white_label_id,
					s3bucket: bucket,
					region: s3_region,
					cloud: "aws",
					time_stamp: timestamp,
					lat_long: lat + " " + long,
					address: uploaded_data.address
				};
				console.log("payload=>", body);
				auth = {
					"content-Type": "application/json"
				};
				if (geo_tagging.water_mark == true){
					let geoLocation = await sails.helpers.sailstrigger(
						sails.config.geoLocation.geoLocation_api_url,
						JSON.stringify(body),
						auth,
						"POST"
					);
					geo_data = JSON.parse(geoLocation);
					if (geo_data.labeled_file_path) {
						presignedUrl = await sails.helpers.s3ViewDocument(geo_data.labeled_file_path, s3_name, s3_region);
						docName = geo_data.labeled_file_path;
					}
					if (geo_data.thump_file_path) {
						thump_file_path = await sails.helpers.s3ViewDocument(geo_data.thump_file_path, s3_name, s3_region);
					}
				}
			}
			const ints = on_upd =  await sails.helpers.dateTime(),
				loanBankMappingData = await LoanBankMappingRd.find({loan_id}).select("id").limit(1),
			 	loanBankMappingId = loanBankMappingData[0] ? loanBankMappingData[0].id : 1,
			 lenderDocumentData = {
					loan: loan_id,
					loan_bank_mapping: loanBankMappingId,
					//business_id: loan_details.business_id,//?
					user_id,
					doc_type: doc_type_id,
					doc_name: docName,
					directorId: director_id, //?
					uploaded_by: req.user.id,
					uploaded_doc_name: uploadFile[0].filename,
					//upload_method_type: sails.config.loanOrigin.loan_origin,//?
					status: "active",
					ints,
					on_upd
				};
			if (get_single_document === true){
				const fetchLenderDocData = await LenderDocumentRd.find({
					loan: loan_id,
					loan_bank_mapping: loanBankMappingId,
					doc_type: doc_type_id,
					directorId: director_id});
				if (fetchLenderDocData.length > 0){
					UpdateLenderData = await LenderDocument.update({id : fetchLenderDocData[0].id}).set({status: "inactive"});
				}
			}
			const lenderDocumentRecords = await LenderDocument.create(lenderDocumentData).fetch(),
			 documentDetailsData = {
					loan_id: loan_id,
					doc_id: lenderDocumentRecords.id,
					lat: lat,
					long: long,
					did: director_id,
					lat_long_timestamp: timestamp,
					request_type: "selfie_document",
					ints,
					doc_request_type: "lender"
				},
				document_details_records = await LoanDocumentDetails.create(documentDetailsData).fetch();
			return res.ok({
				status: "ok",
				message: "successfully uploaded",
				presignedUrl,
				preview: thump_file_path,
				uploaded_data: uploaded_data,
				lender_document_data : lenderDocumentRecords,
				document_details_data : document_details_records
			});
		} catch(err){
			return res.serverError({
				status : "nok",
				message : err
			});
		}
	}
};
