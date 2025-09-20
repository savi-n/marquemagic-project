AWS = require("aws-sdk");
const s3 = new AWS.S3({accessKeyId: sails.config.aws.key, secretAccessKey: sails.config.aws.secret});

module.exports = {


	friendlyName: "Insert data to the lender document",


	description: "",


	inputs: {
		document_details: {
			type: "JSON",
			required: true
		},
		loan_id: {
			type: "number",
			required: true
		},
		loan_bank_mapping: {
			type: "number",
			required: true
		},
		userid :{
			type: "number",
			required: true
		},
		uploaded_by : {
			type: "number",
			required: true
		},
		downloadFile : {
			type : "string"
		},
		uploadFile : {
			type : "string"
		},
		s3_name :  {
			type : "string"
		},
		s3_region : {
			type : "string"
		}
	},


	exits: {

		success: {
			description: "All done."
		}

	},


	fn: async function (inputs, exits) {
		const {document_details, loan_id, loan_bank_mapping, userid, uploaded_by, downloadFile, uploadFile, s3_name} = inputs,

		 dataRes = {
				doc_id : []
			},
			datetime = await sails.helpers.dateTime();

		try {

			for(const docData of document_details){
				let url, reqData;
				if (downloadFile && downloadFile == "yes" && docData.doc_id ){
					docData.document_key = docData.upload_doc_name = docData.doc_name;
					docData.doc_type_id = sails.config.sanction_letter_doc_type;
					docData.uploaded_doc_ref_id = docData.doc_id;

					url = sails.config.downloadDmsDocument;
					reqData = {
						nodeId : docData.doc_id
					};
					const apiRes = await sails.helpers.sailstrigger(url, JSON.stringify(reqData), {}, "POST");
					parseApiRes = JSON.parse(apiRes);
					if (parseApiRes && parseApiRes.status !== "nok"){
						// const parseApiRes = JSON.parse(apiRes);
						if (parseApiRes && parseApiRes.data && parseApiRes.data.data &&  parseApiRes.data.data.content){
							console.log("-------------------", parseApiRes.data.data.content);
							const pdfBuffer = Buffer.from(parseApiRes.data.data.content, 'base64');
							const param = {
								Bucket: s3_name,
								Key: `users_${userid}/${docData.doc_name}`,
								Body: pdfBuffer,
								ContentType: "application/pdf"
							};
							    await s3.upload(param).promise();
						}
					}
				}
				if (docData.document_key){
					const data = {
							loan_bank_mapping,
							user_id: userid,
							loan: loan_id,
							doc_type: docData.doc_type_id,
							doc_name: docData.document_key,
							uploaded_doc_name:docData.upload_doc_name,
							status: "active",
							size_of_file: docData.size,
							ints: datetime,
							on_upd: datetime,
							uploaded_by,
							uploaded_doc_ref_id : docData.uploaded_doc_ref_id
						},
					createdLenderDocRecord = await LenderDocument.create(data).fetch();
					dataRes.doc_id.push(createdLenderDocRecord.id);
				}
			}
			if (uploadFile && uploadFile =="yes"){
				url = sails.config.uploadDmsDocument;
				reqData = {
					loanId : loan_id,
					lender_doc_id : dataRes.doc_id
				};

				const apiRes = await sails.helpers.sailstrigger(url, JSON.stringify(reqData), {}, "POST"),
				 parseApiRes = JSON.parse(apiRes);

				if (parseApiRes && parseApiRes.status !== "nok"){
					if (parseApiRes && parseApiRes.data && parseApiRes.data.lender_document){
						dataRes.node = parseApiRes.data.lender_document;
					}
				}
			}
			exits.success(dataRes);

		} catch (error) {
			console.log(error);
			message = error.message;
			exits.success(message);
		}
	}


};
