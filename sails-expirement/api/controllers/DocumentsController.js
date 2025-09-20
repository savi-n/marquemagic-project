/**
 * DocumentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const AWS = require('aws-sdk');
const archiver = require('archiver');
const {PassThrough} = require("stream");

module.exports = {
	/**
	 * @api {POST} /getzipdocument
	 * @apiName Get ZIP files link
	 * @apiGroup Document Zip
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/getzipdocument
	 * @apiParam {Number} userid
	 * @apiParam {Object[]} loandocs
	 * @apiParam {String} tag loan_doc
	 */

	getzipfile: async function (req, res, next) {

		const {userid, loan_id, loandocs, tag} = req.body;
		if (!loan_id || !userid || !tag) {
			return res.badRequest({
				status: "nok",
				message: "Mandatory fields are missing!"
			});
		}
		if (loandocs.length == 0) {
			return res.badRquest({
				status: "nok",
				message: "loandocs cannot be empty!"
			})
		}
		if (tag !== "LoanDoc" && tag !== "LenderDoc") {
			return res.badRequest({
				status: "nok",
				message: "Please pass valid tag"
			})
		}
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel}).select(["s3_name", "s3_region"]),
			bucket = whitelabelsolution[0]["s3_name"],
			region = whitelabelsolution[0]["s3_region"];

		const s3 = new AWS.S3({
			accessKeyId: sails.config.aws.key,
			secretAccessKey: sails.config.aws.secret,
			region: region
		});
		const timestamp = Math.floor(new Date() / 1000);
		const filePathArr = [];
		loandocs.map(async (loandocs) => {filePathArr.push(loandocs.doc_name);})
		const s3path = `users_${userid}/${timestamp + "_" + userid + "_" + tag + ".zip"}`;
		//tag = LoanDoc / LenderDoc
		res.ok({status: "ok", message: "Request accepted, the zip will be ready in few minutes!"});
		try {
			console.log('Zipping files............................Entered the function');
			const uploadResult = await zipFilesAndUpload(bucket, filePathArr, userid);
			console.log("S3 UPLOADED ZIP DOC DETAILS", uploadResult);
			const where_condition = {
				loan: loan_id,
				status: "active",
				doc_type: sails.config.zip_document_doctype,
				ref_id: tag
			};

			await LenderDocument.updateOne(where_condition).set({status: "inactive"});

			doc_name = uploadResult.Key.split("/");
			const lender_doc_create = {
				loan: loan_id,
				loan_bank_mapping: 1,
				ref_id: tag,
				doc_name: doc_name[1],
				uploaded_doc_name: doc_name[1],
				original_doc_name: doc_name[1],
				doc_type: sails.config.zip_document_doctype,
				user_id: userid,
				status: "active",
				ints: await sails.helpers.dateTime(),
				on_upd: await sails.helpers.dateTime(),
				size_of_file: uploadResult.fileSize,
				uploaded_by: req.user.id,
			}
			const created_lender_doc = await LenderDocument.create(lender_doc_create).fetch();
			console.log("RECORD CREATED IN LENDER DOCUMENT SUCCESSFULLY", created_lender_doc);
			return;
		} catch (err) {
			console.error('Error zipping or uploading files:', err);
			return;
		}



		async function zipFilesAndUpload(bucket, filePathArr, userid) {
			return new Promise(async (resolve, reject) => {
				try {
					// Create the ZIP archiver
					const archive = archiver('zip', {zlib: {level: 9}});
					const passThrough = new PassThrough();
					let fileSize = 0;
					passThrough.on("data", (chunk) => {
						fileSize += chunk.length;
					});
					// Start the S3 upload process
					const upload = s3
						.upload({
							Bucket: bucket,
							Key: s3path,
							Body: passThrough
						}).promise();

					archive.on('error', (err) => {
						passThrough.destroy(err);
						reject(err);
					});

					// Pipe archive to the output stream
					archive.pipe(passThrough);

					// Add files to the ZIP archive
					for (const fileKey of filePathArr) {
						try {
							const key = `users_${userid}/${fileKey}`;
							const fileStream = s3.getObject({
								Bucket: bucket,
								Key: key
							}).createReadStream();
							archive.append(fileStream, {name: fileKey});
						} catch (error) {
							console.error(`Error fetching file ${fileKey}:`, error.message);
						}
					}
					await archive.finalize();
					console.log("Zipping process complete");

					//resolve promise after successfully uploaded zip to s3
					upload
						.then((result) => {
							result.fileSize = fileSize;
							console.log("Zip upload to S3 successful:", result);
							resolve(result);
						})
						.catch((err) => {
							reject(err);
						});
				} catch (err) {
					reject(err);
				}
			});
		}
	},

	getZipUrl: async function (req, res) {
		const {userid, loan_id, tag} = req.allParams();
		if (!loan_id || !userid || !tag) {
			return res.badRequest({
				status: "nok",
				message: "Mandatory fields are missing!"
			});
		}
		if (tag !== "LoanDoc" && tag !== "LenderDoc") {
			return res.badRequest({
				status: "nok",
				message: "Please pass valid tag"
			})
		}
		const where_condition = {
			loan: loan_id,
			status: "active",
			doc_type: sails.config.zip_document_doctype,
			ref_id: tag
		};
		try {
			const lender_doc = await LenderDocumentRd.findOne(where_condition).select("doc_name");
			if (!lender_doc) {
				return res.ok({
					status: "nok",
					message: "Zip document not found"
				})
			}
			const user_whitelabel = req.user.loggedInWhiteLabelID;
			const whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel}).select(["s3_name", "s3_region"]);
			const bucket = whitelabelsolution[0]["s3_name"];
			const region = whitelabelsolution[0]["s3_region"];
			const s3path = `users_${userid}/${lender_doc.doc_name}`;

			const docurl = await sails.helpers.s3ViewDocument(s3path, bucket, region);
			if (docurl) {
				console.log("Zipped document - s3 url", docurl);
				return res.ok({
					status: "ok",
					message: "The zip document found and url generated successfully",
					url: docurl,
					note: "This URL is valid upto 60 mins from generation"
				});
			}
			else {
				return res.ok({
					status: "nok",
					message: "Zip document not found"
				})
			}
		}
		catch (error) {
			return res.serverError({
				status: "nok",
				message: "Something went wrong!"
			})
		}

	}
};
