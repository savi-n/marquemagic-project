const AWS = require("aws-sdk");
const reqParams = require("../helpers/req-params");
const crisilsqs = require("../helpers/crisil-sqs");

module.exports = {
	sendDataToQueue: async function (req, res) {
		const input = req.allParams();
		fields = ["token_id"];
		missing = await reqParams.fn(input, fields);
		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const userRecord = await UserDocumentRd.find({id: input.token_id}).limit(1);
		if (!userRecord.length) {
			return res.badRequest({status: "nok", message: "token data not found"});
		}

		try {
			const user_whitelabel = userRecord[0].white_label_id;
			whitelabelsolution = await WhiteLabelSolutionRd.find({id: user_whitelabel});
			let bucket = whitelabelsolution[0]["s3_name"];
			const region = whitelabelsolution[0]["s3_region"];

			let inputs = {
				MessageBody: JSON.stringify({
					filename: userRecord[0].doc_name,
					bucket,
					region,
					userid: userRecord[0].user_id,
					white_label_id: userRecord[0].white_label_id,
					token: userRecord[0].id,
					connector_id: input.connector_id || null,
					url: sails.config.callback_endpoint + "case_creation_bulk_upload"
				}),
				QueueUrl: sails.config.crisilQueueUrl
			};
			const SQSresponse = await crisilsqs.fn(inputs);

			res.send({
				success: true,
				message: "data sent to queue",
				messageId: SQSresponse
			});
		} catch (err) {
			console.log(err);
			res.send(err);
		}
	},
	getStatus: async function (req, res) {
		let {token_id} = req.allParams();

		let inputParams = req.allParams();
		fields = ["token_id"];
		missing = await reqParams.fn(inputParams, fields);

		if (missing.length > 0) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}

		let loanRecords = await LoanrequestRd.find({loan_origin: {contains: `bulk upload_${token_id}`}}).populate("business_id");
		if (loanRecords.length) loanRecords = loanRecords.map(item => {
			return {
				loan_ref_id: item.loan_ref_id, cin: item.business_id?.corporateid, gst: item.business_id?.gstin,
				product: item.loan_summary?.split("-")[0]?.trim(), entity_name: item.business_id?.businessname
			}
		})

		AWS.config.update(sails.config.aws);

		const dynamodb = new AWS.DynamoDB.DocumentClient();

		const params = {
			TableName: sails.config.dynamodb.aws_table_name,
			FilterExpression: "#token = :token",
			ExpressionAttributeNames: {
				"#token": "token"
			},
			ExpressionAttributeValues: {
				":token": token_id
			}
		};

		dynamodb.scan(params, function (err, data) {
			if (err) {
				console.log(err);
				res.send({
					success: false,
					message: err
				});
			} else {
				let {Items} = data;
				let responseObj = {loanRecords};
				let status = "pending";
				if (Items.length === 0) {
					responseObj.status = status;
				} else {
					let success_count = 0,
						failure_count = 0,
						total_count = Number(Items[0].total_cases_on_excel);
					status = "inprogress";

					for (let i = 0; i < Items.length; i++) {
						if (Items[i].loan_ref_id === "fail") {
							failure_count++;
						} else success_count++;
					}

					if (success_count + failure_count === total_count) {
						status = "completed";
					}

					Object.assign(responseObj, {
						status,
						success_count,
						failure_count,
						total_count
					});
				}
				res.send({
					success: true,
					data: responseObj
				});
			}
		});
	}
};
