/**
 * BizUpload
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	/**
	 * Document Upload
	 * @description :: Loan Document Upload
	 * @api {post} /V0/biz-docUpload/ Upload Document
	 * @apiName Document Wallet upload
	 * @apiGroup BizUpload
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/V0/biz-docUpload
	 * @apiParam {file} document File attachment
	 * @apiParam {String} userid
	 * @apiSuccess {Object[]} files
	 * @apiSuccess {String} files.fd description of the file(this "filename" is used as parameter to display the file in view document).
	 * @apiSuccess {Number} files.size size of the file.
	 * @apiSuccess {String} files.type type of the file.
	 * @apiSuccess {String} files.filename name of the file.
	 * @apiSuccess {String} files.status file status.
	 * @apiSuccess {String} files.field
	 * @apiSuccess {String} textParams text parameters.
	 * @apiDescription  <b>Note:To get the thumbnail of a pdf file: please call view document api : pass parameter of filename as "thumb_fdname.png"</b>
	 * eg:filename : thumb_857fc7f1-57d8-44c4-b5fc-7e7020e2756b.png
	 */
	bizDocUpload: async (req, res, next) => {
		let userid = req.user.id;
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({
				id: user_whitelabel
			});
		let bucket = whitelabelsolution[0]["s3_name"];
		const region = whitelabelsolution[0]["s3_region"],
			document = req.file("document");
		if (req.param("userid") !== undefined && req.param("userid") !== "") {
			userid = req.param("userid");
		}
		bucket = bucket + "/users_" + userid;
		if (document) {
			const noAllowedTypes = [
				"application/x-msdos-program",
				"application/octet-stream",
				"application/x-msdownload",
				"application/javascript"
			],
				type = document._files[0].stream;
			if (_.indexOf(noAllowedTypes, type.headers["content-type"]) >= 0) {
				return res.badRequest({
					status: "nok",
					message: `FileType ${type.headers["content-type"]} is not allowed to upload`
				});
			}
			const uploadFile = await sails.helpers.s3Upload(document, bucket, region);
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.uploadSuccess,
				files: uploadFile
			});
		} else {
			return res.ok({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	},

	/**
 * @api {POST} /V0/user-docUpload user Upload
 * @apiName User doc upload
 * @apiGroup BizUpload
 * @apiExample Example usage:
 * curl -i localhost:1337/V0/user-docUpload
 * @apiParam upload_document
 * @apiDescription upload_document
 * [
	{
	"doc_type_id": 30,
	"upload_doc_name": "2019-04-17.png",
	"document_key": "74f3313c-5883-4115-b5f0-1d022c481329.png",
	"bankTags":1 //If bank documents,
	"userid" : 21
	},
   {
	"doc_type_id": 30,
	"upload_doc_name": "2019-04-17.png",
	"document_key": "74f3313c-5883-4115-b5f0-1d022c481329.png",
	"userid" : 21
	}
]
 * @apiSuccess {String} status ok.
 * @apiSuccess {String} message Uploaded Successfully.
 **/
	userDocUpload: async (req, res) => {
		const datetime = await sails.helpers.dateTime(),
			post_data = req.allParams(),
			url = [],
			user_whitelabel = req.user.loggedInWhiteLabelID,
			docFormatJSON = (upload_document = post_data.upload_document);
		await Promise.all(
			docFormatJSON.map(async (arrayItem) => {
				if (!arrayItem.doc_type_id || !arrayItem.upload_doc_name || !arrayItem.document_key) {
					return res.badRequest(sails.config.res.missingFields);
				}
				const doc_type_id = arrayItem.doc_type_id,
					upload_doc_name = arrayItem.upload_doc_name,
					document_key = arrayItem.document_key,
					whitelabelsolution = await WhiteLabelSolutionRd.findOne({
						id: user_whitelabel[0]
					}).select(["s3_name", "s3_region"]);
				if (whitelabelsolution && whitelabelsolution.s3_name) {
					data = {
						user_id: arrayItem.userid ? arrayItem.userid : req.user.id,
						doc_type_id: doc_type_id,
						doc_name: document_key,
						uploaded_doc_name: upload_doc_name,
						status: "active",
						white_label_id: user_whitelabel[0],
						origin: "BIZ",
						created: datetime,
						updated_date: datetime
					};
					if (arrayItem.bankTags) {
						data.bank_tags = arrayItem.bankTags;
					}
					const createdLoanDocRecord = await UserDocument.create(data).fetch();
					let bucket = whitelabelsolution.s3_name;
					// wallet changes - added below two lines
					const userId = arrayItem.userid ? arrayItem.userid : req.user.id;
					bucket = whitelabelsolution.s3_name + "/users_" + userId;
					// bucket = whitelabelsolution.s3_name + "/users_" + req.user.id;
					const s3_url = await sails.helpers.s3ViewDocument(document_key, bucket, whitelabelsolution.s3_region);
					url.push({URL: s3_url, docId: createdLoanDocRecord.id});
					const logService = await sails.helpers.logtrackservice(
						req,
						"userdoc-upload",
						createdLoanDocRecord.id,
						"user_document"
					);
				}
			})
		);
		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.uploadSuccess,
			url: url
		});
	},
	/**
	 * @api {GET} /V0/userDoc-list document list
	 * @apiName Document List
	 * @apiGroup BizUpload
	 * @apiExample Example usage:
	 * curl -i localhost:1337/V0/userDoc-list
	 * @apiParam {Number} bizUserId biz user id
	 * @apiParam {String} password file password
	 * @apiParam {String} customerId
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Uploaded Successfully
	 * @apiSuccess {Object[]} data
	 **/
	documentList: async (req, res) => {
		let jsonParsedData;
		getListfn = async (userId, white_label_id) => {
			const docTypes = ["KycDocument", "Financial Document", "Bank Statement", "Other Document"],
				responseArr = docTypes.map((i, index) => {
					return {
						doc_category: i,
						taggable: index === 2 ? true : false,
						docs_list: []
					};
				}),
				docsList = await UserDocumentRd.find({
					user_id: userId,
					origin: "BIZ",
					status: "active"
				}),
				user_whitelabel = req.user.loggedInWhiteLabelID,
				whitelabelsolution = await WhiteLabelSolutionRd.findOne({
					id: user_whitelabel
				}).select(["s3_name", "s3_region"]);
			await Promise.all(
				docsList.map(async (arrayItem) => {
					let bucket = whitelabelsolution.s3_name;
					bucket = whitelabelsolution.s3_name + "/users_" + userId;
					const s3_url = await sails.helpers.s3ViewDocument(
						arrayItem.doc_name,
						bucket,
						whitelabelsolution.s3_region
					),
						Obj = {
							url: s3_url,
							name: arrayItem.uploaded_doc_name,
							id: arrayItem.id,
							document_key: arrayItem.doc_name
						};
					if (arrayItem.doc_type_id == 30) {
						responseArr[0].docs_list.push(Obj);
					} else if (arrayItem.doc_type_id === 6) {
						responseArr[2].docs_list.push({
							...Obj,
							tag: arrayItem.bank_tags
						});
					} else if (arrayItem.doc_type_id === 210) {
						responseArr[1].docs_list.push(Obj);
					} else {
						responseArr[3].docs_list.push(Obj);
					}
				})
			);
			return res.send({
				status: "ok",
				message: sails.config.msgConstants.documentsListed,
				data: responseArr
			});
		};
		const bizUserId = req.param("bizUserId"),
			password = req.param("password"),
			// wallet changes - added below if block
			customerId = req.param("customerId");
		if (customerId) {
			getListfn(customerId, req.user.white_label_id).then();
		} else if (bizUserId) {
			const url = sails.config.user_create_biz.passwordList,
				jsondata = "{\"bizUserId\":\"" + bizUserId + "\"}",
				method = "POST",
				headers = {
					"Content-Type": "application/json"
				},
				triggerApiResult = await sails.helpers.sailstrigger(url, jsondata, headers, method);
			if (triggerApiResult.status == "nok") {
				return res.send({
					status: "nok",
					message: sails.config.msgConstants.somethingWentWrong
				});
			} else {
				jsonParsedData = JSON.parse(triggerApiResult);
			}
			if (jsonParsedData.data) {
				if (password) {
					if (password == jsonParsedData.data.wallet_password) {
						getListfn(req.user.id, req.user.white_label_id).then();
					} else {
						return res.send({
							status: "nok",
							message: "Please enter valid password"
						});
					}
				} else {
					return res.send({
						status: "nok",
						message: "Please enter password"
					});
				}
			} else if (jsonParsedData.data === null) {
				getListfn(req.user.id, req.user.white_label_id).then();
			} else {
				return res.send({
					status: "Ok",
					message: "Please Enter Pin",
					data: null,
					pin_required: true
				});
			}
		} else {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	},
	/**
	 * @api {POST} /V0/deleteDocument deleteDocument
	 * @apiName Document Delete
	 * @apiGroup BizUpload
	 * @apiExample Example usage:
	 * curl -i localhost:1337/V0/deleteDocument
	 * @apiParam {Number} docId document id
	 * @apiParam {String} customerId customer Id
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Docment deleted
	 * @apiSuccess {Object[]} data
	 **/
	deleteUserDoc: async (req, res) => {
		const uniqueId = req.param("docId");
		let userId = req.user.id;
		const customerId = req.param("customerId");
		if (customerId) {
			userId = customerId;
		}
		if (uniqueId) {
			const updateDeleteDoc = await UserDocument.updateOne({
				id: uniqueId,
				user_id: userId
			}).set({
				status: "deleted"
			});
			return res.send({
				status: "ok",
				message: "Docment deleted",
				data: updateDeleteDoc
			});
		} else {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	},

	/**
	 * @api {POST} /V0/updateDocTags updateTag
	 * @apiName Document Tag update
	 * @apiGroup BizUpload
	 * @apiExample Example usage:
	 * curl -i localhost:1337/V0/updateDocTags
	 * @apiParam {Number} docId document id
	 * @apiParam {Number} tag bank to be tagged
	 * @apiParam {String} customerId
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Tag updated
	 * @apiSuccess {Object[]} data
	 **/
	updateDocTags: async (req, res) => {
		const updatedTag = req.param("tag"),
			uniqueId = req.param("docId");
		let userId = req.user.id;
		const customerId = req.param("customerId");
		if (customerId) {
			userId = customerId;
		}
		if (updatedTag) {
			const updateTag = await UserDocument.updateOne({
				id: uniqueId,
				user_id: userId
			}).set({
				bank_tags: updatedTag
			});
			return res.send({
				status: "ok",
				message: "Tag updated",
				data: updateTag
			});
		} else {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	},
	/**
	 * @api {POST} /V0/updateRating updateRating
	 * @apiName Loan Rate update
	 * @apiGroup BizUpload
	 * @apiExample Example usage:
	 * curl -i localhost:1337/V0/updateRating
	 * @apiParam {Number} loan_id loan id
	 * @apiParam {Number} rating rating id
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Tag updated
	 * @apiSuccess {Object[]} data
	 **/
	updateRatingId: async (req, res) => {
		const loanId = req.param("loan_id"),
			ratingId = req.param("rating");
		if (loanId) {
			const updateRating = await Loanrequest.updateOne({
				id: loanId
			}).set({
				loan_rating_id: ratingId
			});
			if (updateRating) {
				return res.send({
					status: "ok",
					message: "Rating updated",
					data: updateRating
				});
			} else {
				return res.send({
					status: "nok",
					message: "Couldn't update "
				});
			}
		} else {
			return res.send({
				status: "nok",
				message: sails.config.msgConstants.parameterMissing
			});
		}
	}
};
