/**
 * AnalysisFile
 *
 * @description :: Server-side logic for managing AnalysisFile
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 *
 *  @api {get} /AnalysisFile/  file analysis
 * @apiName analysis file
 * @apiGroup Analysis
 *  @apiExample Example usage:
 * curl -i localhost:1337/AnalysisFile/
 * @apiSuccess {Number} id id.
 * @apiSuccess {Number} analysis_id analysis id.
 * @apiSuccess {String} filename filename.
 * @apiSuccess {String} created_date created date.
 */
module.exports = {
	index: function (req, res, next) {
		AnalysisFileRd.find().exec((err, list) => {
			if (err) {return Error("Error");}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		AnalysisFileRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		AnalysisFileRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		AnalysisFile.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("analysisFile/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		AnalysisFile.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/analysisFile");
		});
	},
	/**
	 *
	 *  @api {post} /case-analysisReport/  case-analysis Report
	 * @apiName case-analysis Report
	 * @apiGroup Case
	 *  @apiExample Example usage:
	 * curl -i localhost:1337/case-analysisReport/
	 *
	 * @apiParam {String} case_id case reference id.
	 * @apiParam {Number} document_id document id.
	 * @apiParam {String} case_name case name.
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} message Successfully displayed analysis data.
	 * @apiSuccess {String} DES_CODE nc description code.
	 * @apiSuccess {Object} analysis_report analysis report data.
	 */
	case_analysis_report: async function (req, res, next) {
		const {case_id, document_id, case_name} = req.body.allParams;

		if (case_id && document_id && case_name) {
			const loanrequest = await LoanrequestRd.findOne({loan_ref_id: case_id}).populate("business_id");
			if (loanrequest && case_name == loanrequest.business_id.businessname) {
				status = {
					status1: loanrequest.loan_status_id,
					status2: loanrequest.loan_sub_status_id,
					white_label_id: loanrequest.white_label_id
				};
				const loanbankmapping = await LoanBankMappingRd.findOne({
					loan_id: loanrequest.id,
					business: loanrequest.business_id.id,
					loan_bank_status: 9,
					loan_borrower_status: 2
				});
				if (loanbankmapping) {
					status.status3 = loanbankmapping.loan_bank_status;
					status.status4 = loanbankmapping.loan_borrower_status;
				}
				const white_label = await WhiteLabelSolutionRd.findOne({
					where: {id: loanrequest.white_label_id},
					select: ["s3_name", "s3_region"]
				});
				let bucket = white_label.s3_name;
				const region = white_label.s3_region,
				 userid = loanrequest.createdUserId,
				 nc_status = await NcStatusManageRd.findOne(status);
				if (nc_status) {
					const loan_document = await LoanDocumentRd.findOne({id: document_id, loan: loanrequest.id, doctype : {"!=" : 0} });
					if (loan_document && loan_document.json_extraction) {
						const data = {},
						 list = {};
						bucket = bucket + "/users_" + userid;
						const json_str = JSON.parse(loan_document.json_extraction),
						 key_list = Object.keys(json_str);

						for (let i = 0; i < key_list.length; i++) {
							const value = json_str[key_list[i]];
							list[key_list[i]] = await sails.helpers.s3ViewDocument(value, bucket, region);
						}
						data[loan_document.doc_name + "-" + loan_document.id] = list;
						return res.ok({
							status: "ok",
							message: "Successfully displayed analysis data",
							DES_CODE: "NC08",
							analysis_report: data
						});
					} else {
						return res.badRequest({
							status: "nok",
							exception: "Inavlid parameters",
							message: "Error in fetching analisys report",
							DES_CODE: "NC00"
						});
					}
				} else {
					return res.badRequest({
						status: "nok",
						message: "Analysis report can be only downloaded after the case is in completed status",
						DES_CODE: "NC10"
					});
				}
			} else {
				return res.badRequest({
					status: "nok",
					message: "Invalid case id or case name please enter correct one",
					DES_CODE: "NC06"
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: "Some of the mandatory fields are missing ",
				DES_CODE: "NC00"
			});
		}
	}
};
