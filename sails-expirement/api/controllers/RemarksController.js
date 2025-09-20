module.exports = {
	addVerificationRemarks: async function (req, res) {
		// The remarks now will be added on basis of sections. Every section is a table, and that when received from FE will check which table to insert remarks in.
		const request_id = req.body.request_id;
		const remarks = req.body.remark;
		const section = req.body.section_key; // This will be an additional parameter in FE
		const loan_ref_id = req.body.loan_ref_id;
		const business_id = req.body.business_id;


		if (!request_id || !remarks || !section || !business_id)
			return res.ok(sails.config.res.missingFields);
		// request_id in the request payload is the respective primary key of the tables from which the data had been fetched. It will be used again primary key of all the tables according to section
		try {
			let previousRemarks;
			let remarkUpdate;
			let remarkObject = [];
			let sectionPart = "";
			let count = 0;
			let newRemarkObject = {
				commentor_name: req.user.name,
				created_at: await sails.helpers.dateTime(),
				remark: remarks
			}
			switch (section) {
				case "pan_verification":
				case "pan_forensic":
					if (!loan_ref_id) {
						throw ("Invalid Loan Reference.");
					}
					sectionPart = section.split('_');
					sectionPartRemarks = `${sectionPart[1]}Remarks`
					// update panno_response table against the kyc_key found in director table against the primary id
					previousRemarks = await PannoResponse.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks);
							if (remarkObject[sectionPartRemarks]) {

								if (remarkObject[sectionPartRemarks].hasOwnProperty(loan_ref_id)) {
									remarkObject[sectionPartRemarks][loan_ref_id].unshift(newRemarkObject);
								}
								else {
									remarkObject[sectionPartRemarks][loan_ref_id] = [];
									remarkObject[sectionPartRemarks][loan_ref_id].unshift(newRemarkObject);
								}



							}
							else {
								remarkObject[sectionPartRemarks] = {};
								remarkObject[sectionPartRemarks][loan_ref_id] = [];
								remarkObject[sectionPartRemarks][loan_ref_id].push(newRemarkObject)
							}
						}
						else {

							remarkObject = {
								[sectionPartRemarks]: {}
							};
							remarkObject[sectionPartRemarks][loan_ref_id] = [];
							remarkObject[sectionPartRemarks][loan_ref_id].push(newRemarkObject);

						}
						console.log(remarkObject);
						remarkUpdate = await PannoResponse.update({
							id: request_id
						}).set({
							remarks: JSON.stringify(remarkObject)
						})
					}
					else throw ("Invalid request Id")
					break;
				case "aadhar_verification":
				case "aadhar_forensic":
				case "voter_verification":
				case "voter_forensic":
				case "passport_verification":
				case "passport_forensic":
				case "license_verification":
				case "license_forensic":
					sectionPart = section.split('_');
					sectionPartRemarks = `${sectionPart[1]}Remarks`
					// update ekyc_response_table against primary key
					previousRemarks = await EkycResponse.findOne({id: request_id});
					if (previousRemarks) {

						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks);
							if (remarkObject[sectionPartRemarks]) {
								remarkObject[sectionPartRemarks].unshift(newRemarkObject);
							}
							else {
								remarkObject[sectionPartRemarks] = [];
								remarkObject[sectionPartRemarks].push(newRemarkObject);
							}
						}
						else {

							remarkObject = {
								[sectionPartRemarks]: []
							};
							remarkObject[sectionPartRemarks].push(newRemarkObject);

						}
						console.log(remarkObject);
						console.log(JSON.stringify(remarkObject));
						remarkUpdate = await EkycResponse.update({
							id: request_id
						}).set({
							remarks: JSON.stringify(remarkObject)
						})
						console.log(remarkUpdate);
					}
					else throw ("Invalid Request Id")
					break;
				case "legal":
				case "esic":
				case "epfo":
				case "google":
				case "equifax":
				case "commercial":
				case "crime":
				case "credit":
				case "roc":
				case "email":
					// update business table against primary key
					previousRemarks = await Business.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks);
							if (remarkObject[section]) {
								remarkObject[section].unshift(newRemarkObject);
							}
							else {
								remarkObject[section] = [];
								remarkObject[section].push(newRemarkObject);
							}

						}
						else {
							remarkObject = {
								[section]: []
							};
							remarkObject[section].push(newRemarkObject);
						}
						remarkUpdate = await Business.update({
							id: request_id
						}).set({
							remarks: JSON.stringify(remarkObject)
						})
					}
					else throw ("Invalid Request Id")

					break;
				case "gst":
					// update gst_master table against primary key
					previousRemarks = await GstMaster.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks);
							remarkObject.unshift(newRemarkObject);
						}
						else {
							remarkObject.push(newRemarkObject);
						}
						remarkUpdate = await GstMaster.update({
							id: request_id
						}).set({
							remarks: JSON.stringify(remarkObject)
						})
					}
					else throw ("Invalid request Id")
					break;
				case "itr":
					// update business_entity_financial against primary key
					previousRemarks = await BusinessEntityFinancial.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks);
							remarkObject.unshift(newRemarkObject);
						}
						else {
							remarkObject.push(newRemarkObject);
						}
						remarkUpdate = await BusinessEntityFinancial.update({
							id: request_id
						}).set({
							remarks: JSON.stringify(remarkObject)
						})
					}
					else throw ("Invalid request Id")
					break;
				case "authentication":
					previousRemarks = await LoanrequestRd.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.authentication_data) {
							remarkObject = JSON.parse(previousRemarks.authentication_data);
							if (remarkObject['remarks']) {
								remarkObject['remarks'].unshift(newRemarkObject);
							}
							else {
								remarkObject['remarks'] = [];
								remarkObject['remarks'].push(newRemarkObject);
							}
							remarkUpdate = await Loanrequest.update({
								id: request_id
							}).set({
								authentication_data: JSON.stringify(remarkObject)
							})
						}

					}
					else throw ("Invalid Request Id")
					break;

				default:
					return res.send({
						status: 'nok',
						message: 'Invalid section key.'
					})

			}

			return res.send({
				status: 'ok',
				message: 'Added remarks successfully.'
			})
		}
		catch (e) {
			return res.send({
				status: 'nok',
				message: e
			})
		}


	},
	getVerificationRemarks: async function (req, res) {
		// The verification remarks now will need to send for which section they are required including loan_ref_id
		const section_key = req.param("section_key");
		const business_id = req.param("business_id");
		const loan_ref_id = req.param("loan_ref_id");
		const request_id = req.param("request_id");
		if (!loan_ref_id || !section_key || !business_id || !request_id)
			return res.ok(sails.config.res.missingFields);
		try {
			let remarkObject = [];
			let givenRemark = [];
			switch (section_key) {
				case "pan_verification":
				case "pan_forensic":
					sectionPart = section_key.split('_');
					sectionPartRemarks = `${sectionPart[1]}Remarks`;
					// update panno_response table against the kyc_key found in director table against the primary id
					previousRemarks = await PannoResponse.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks)[sectionPartRemarks];

							if (remarkObject.hasOwnProperty(loan_ref_id)) {
								remarkObject = remarkObject[loan_ref_id];
							}
							else {
								remarkObject = [];
							}
						}
					}
					else throw ("Invalid request Id")
					break;
				case "aadhar_verification":
				case "aadhar_forensic":
				case "voter_verification":
				case "voter_forensic":
				case "passport_verification":
				case "passport_forensic":
				case "license_verification":
				case "license_forensic":
					sectionPart = section_key.split('_');
					sectionPartRemarks = `${sectionPart[1]}Remarks`;
					// update ekyc_response_table against primary key
					previousRemarks = await EkycResponse.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks)[sectionPartRemarks];
						}
					}
					else throw ("Invalid Request Id")
					break;
				case "legal":
				case "esic":
				case "epfo":
				case "google":
				case "equifax":
				case "commercial":
				case "crime":
				case "credit":
				case "roc":
				case "email":
					// update business table against primary key
					previousRemarks = await Business.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks)[section_key];
						}
					}
					else throw ("Invalid Request Id")

					break;
				case "gst":
					// update gst_master table against primary key
					previousRemarks = await GstMaster.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks);
						}
					}
					else throw ("Invalid request Id")
					break;
				case "itr":
					// update business_entity_financial against primary key
					previousRemarks = await BusinessEntityFinancial.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.remarks) {
							remarkObject = JSON.parse(previousRemarks.remarks);
						}
					}
					else throw ("Invalid request Id")
					break;
				case "authentication":
					previousRemarks = await LoanrequestRd.findOne({id: request_id});
					if (previousRemarks) {
						if (previousRemarks.authentication_data) {
							remarkObject = JSON.parse(previousRemarks.authentication_data)['remarks'];
						}
					}
					else throw ("Invalid request Id")
					break;

				default:
					return res.send({
						status: 'nok',
						message: 'Invalid section key.'
					})

			}
			return res.send({
				status: 'ok',
				message: '',
				data: remarkObject
			})
		}
		catch (e) {
			return res.send({
				status: 'nok',
				message: e
			})
		}

	},
	update_declarations: async function (req, res) {
		const {loan_id, data} = req.allParams();
		if (!loan_id || Object.keys(data).length === 0) {
			return res.badRequest({
				status: "nok",
				message: "Missing Mandatory Fields!"
			});
		}
		const loan_additional_data = await LoanAdditionalDataRd.findOne({loan_id});
		if (!loan_additional_data) {
			return res.badRequest({
				status: "nok",
				message: "No data found for this loan!"
			});
		}
		let declarationsData = loan_additional_data.declarations_terms_conditions ?
			JSON.parse(loan_additional_data.declarations_terms_conditions) : {};
		declarationsData = {...declarationsData, declarations: data};

		const updated_declaration = await LoanAdditionalData.updateOne({id: loan_additional_data.id})
			.set({declarations_terms_conditions: JSON.stringify(declarationsData)}).fetch();
		return res.ok({
			status: "ok",
			message: "Declarations updated successfully",
			data: updated_declaration.declarations_terms_conditions
		});
	},

	get_declarations: async function (req, res) {
		const loan_id = req.param("loan_id");
		if (!loan_id) {
			return res.badRequest({
				status: "nok",
				message: "Loan ID is missing!"
			});
		}
		try {
			const loan_additional_data = await LoanAdditionalDataRd.findOne({loan_id}),
				declarationsData = loan_additional_data ? JSON.parse(loan_additional_data.declarations_terms_conditions) : undefined,
				parsed = declarationsData?.declarations;
			return res.ok({
				status: "ok",
				message: "Declaration details fetched successfully",
				data: parsed || {}
			});
		} catch (error) {
			return res.serverError({
				status: "nok",
				message: "Something went wrong!",
				error: error
			});
		}
	}
}
