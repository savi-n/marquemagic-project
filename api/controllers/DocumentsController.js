const AWS = require("aws-sdk");
const s3 = new AWS.S3({
	accessKeyId: sails.config.aws.key,
	secretAccessKey: sails.config.aws.secret
});
//const myDBStore = sails.getDatastore("mysql_nc_document_app");
module.exports = {
	uploadCacheDocuments: async function (req, res) {
		const datetime = await sails.helpers.dateTime();
		let business_user_id = "";
		const { loan_id, director_id, request_ids_obj, user_id } = req.allParams(),
			url = [];
		let getBusinessDetails;
		if (
			!loan_id ||
			!request_ids_obj ||
			!user_id
		) {
			return res.badRequest({ status: "nok", message: "Mandatory fields are missing" });
		}
		if (request_ids_obj.length === 0) {
			return res.ok({ status: "nok", message: "No files to upload" });
		}

		getBusinessDetails = await Loanrequest.findOne({
			where: {
				id: loan_id
			},
			select: ["business_id", "white_label_id", "loan_ref_id"]
		});
		const whitelabelsolution = await WhiteLabelSolutionRd.findOne({
			id: getBusinessDetails.white_label_id
		}).select(["s3_name", "s3_region"]);
		if (getBusinessDetails.business_id) {
			const qMessages = [];
			const getUserDetails = await Business.findOne({
				where: {
					id: getBusinessDetails.business_id
				},
				select: ["userid"]
			});
			business_user_id = getUserDetails.userid ? getUserDetails.userid : "";
			if (business_user_id && loan_id) {

				// get array of requestIds separately
				let request_ids = request_ids_obj.map(function (request_ids_obj) {
					return request_ids_obj['request_id'];
				});
				let doc_type_ids = {}
				request_ids_obj.forEach(obj=>doc_type_ids[obj.requestId]= {doc_type_id: obj.doc_type_id,directorId: obj.directorId,is_delete_not_allowed: obj.is_delete_not_allowed,
				aid : obj.aid,classification_type: obj.classification_type,classification_sub_type: obj.classification_sub_type,isTagged: obj.isTagged})
				// fetch all filepaths and name for the given request ids.
				//fetchImageFiles = "select request_id, req_path, req_filename from request_document where request_id in (" + request_ids.toString() + ")";
				imageDataArray = await RequestDocument.find({
					select: ["request_id", "req_path", "req_filename"],
					where: { request_id: request_ids }
				})
				//imageDataArray = await myDBStore.sendNativeQuery(fetchImageFiles);
				console.log("request_ids=> ", request_ids, "-------\n", "fetchedRecords=> ", imageDataArray);
				if (imageDataArray) {
					// copy file data from generic bucket to user bucket
					let loanDocRecords = [];
					for (let i = 0; i < imageDataArray.length; i++) {
						let imageData = imageDataArray[i];
						//let imageData = imageDataArray.rows.find(o => o.request_id === request_ids[i]);
						let description = imageData.req_filename.split('/');
						let fileName = description[0];
						let fileSize = description[1];

						uploadedKey = imageData.req_path.split('/');
						key = uploadedKey[2].split('?');
						let bucket = whitelabelsolution.s3_name;
						bucket = whitelabelsolution.s3_name;
						params = {
							CopySource: imageData.req_path,
							Bucket: bucket,
							Key: "users_" + business_user_id + "/" + key[0]
						};
						const copy_file = await s3.copyObject(params, async (err, data) => {
							if (err) {
								console.log(err);
								return res.ok({
									status: "nok",
									message: "Files are not uploaded"
								});
							}
						});
						data = {
							user_id: business_user_id,
							business_id: getBusinessDetails.business_id,
							loan: loan_id,
							doctype: doc_type_ids[imageData.request_id].doc_type_id,
							doc_name: key[0],
							uploaded_doc_name: fileName,
							original_doc_name: fileName,
							status: "active",
							size: fileSize,
							ints: datetime,
							on_upd: datetime,
							uploaded_by: user_id,
							is_delete_not_allowed: doc_type_ids[imageData.request_id].is_delete_not_allowed || "false",
							directorId: doc_type_ids[imageData.request_id].directorId
						};
						let loanDocData = await LoanDocument.create(data).fetch();
						if (loanDocData && request_ids_obj[i].director_id) {
							let documentUpdateData = await LoanDocumentDetails.create({
								doc_id: loanDocData.id,
								aid: doc_type_ids[imageData.request_id].aid || (doc_type_ids[imageData.request_id].isTagged && doc_type_ids[imageData.request_id].isTagged.aid),
								classification_type: doc_type_ids[imageData.request_id].classification_type || (doc_type_ids[imageData.request_id].isTagged && doc_type_ids[imageData.request_id].isTagged.classification_type),
								classification_sub_type: doc_type_ids[imageData.request_id].classification_sub_type || (doc_type_ids[imageData.request_id].isTagged && doc_type_ids[imageData.request_id].isTagged.classification_sub_type),
								ints: datetime,
								loan_id,
								did: doc_type_ids[imageData.request_id].directorId || 0
							}).fetch();
							// if the file is copied, insert into Loan Document
							//loanDocRecords.push(data);
							//const createdLoanDocRecord = await LoanDocument.create(data).fetch();
							// params2 = {
							// 	Bucket: bucket,
							// 	Key: "users_" + business_user_id + "/" + key[0]
							// }
							// const s3_url = await s3.getSignedUrl('getObject', params2)
							// console.log(s3_url);
						}
						qMessages.push({
							loan_id: loan_id || "",
							business_id: getBusinessDetails.business_id || "",
							director_id: "",
							doc_id: loanDocData.id || "",
							parent_doc_id: "",
							doc_type: loanDocData.doctype || "",
							user_id: loanDocData.user_id || "",
							doc_name: loanDocData.doc_name || "",
							uploaded_doc_name: loanDocData.uploaded_doc_name || "",
							original_doc_name: loanDocData.original_doc_name || "",
							s3bucket: whitelabelsolution.s3_name || "",
							region: whitelabelsolution.s3_region || "",
							cloud: "aws",
							white_label_id: getBusinessDetails.white_label_id || "",
							isLoanDocument: true
						})
						//await LoanDocument.createEach(loanDocRecords);
					}
				}
			}
			res.ok({
				status: "ok",
				statusCode: "NC200",
				message: "Uploaded Successfully"
			});

			await sails.helpers.insertIntoQ(sails.config.qNames.GENERIC_Q, qMessages);
		}
	}
};