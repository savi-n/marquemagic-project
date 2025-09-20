const reqParams = require("../helpers/req-params");
/**
 * Business
 *
 * @description :: Server-side logic for managing Business
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

/**
 * @api {get} /Business/ business
 * @apiName business
 * @apiGroup Business
 *  @apiExample Example usage:
 * curl -i localhost:1337/Business/
 *
 * @apisuccess {Object[]} business_address
 * @apiSuccess {Number} business_address.id id.
 * @apiSuccess {Number} business_address.aid address id.
 * @apiSuccess {String} business_address.line1 line address1.
 * @apiSuccess {String} business_address.line2 line address2.
 * @apiSuccess {String} business_address.locality locality.
 * @apiSuccess {String} business_address.city city.
 * @apiSuccess {String} business_address.state state.
 * @apiSuccess {String} business_address.pincode pincode.
 * @apiSuccess {String} business_address.address_status address status.
 * @apiSuccess {String} business_address.residential_stability
 * @apiSuccess {String} business_address.ints
 * @apiSuccess {Number} business_address.bid
 *
 * @apiSuccess {Number} id id.
 * @apiSuccess {String} businessname business name.
 * @apiSuccess {String} first_name first name.
 * @apiSuccess {String} last_name last name.
 * @apiSuccess {String} business_email business email.
 * @apiSuccess {String} contactno contact number.
 * @apiSuccess {Number} businesstype business type.
 * @apiSuccess {Number} businessindustry business industry.
 * @apiSuccess {String} businessstartdate business start date.
 * @apiSuccess {String} businesspancardnumber pancard number.
 * @apiSuccess {String} corporateid corporate id.
 * @apiSuccess {Number} percentage_business_supplier
 * @apiSuccess {Number} percentage_business
 * @apiSuccess {Number} empcount employee count.
 * @apiSuccess {Number} noofdirectors
 * @apiSuccess {String} about_business
 * @apiSuccess {String} current_company current company.
 * @apiSuccess {String} previous_company previous company.
 * @apiSuccess {String} status status.
 * @apiSuccess {String} ints
 * @apiSuccess {String} white_label_id white label id.
 * @apiSuccess {String} business_truecaller_info business truecaller information.
 * @apiSuccess {String} google_search_data google search data.
 * @apiSuccess {String} gstin gst interest.
 * @apiSuccess {String} gstin_extract
 * @apiSuccess {Number} is_ca_business
 *
 * @apiSuccess {Object[]} encrypted_data
 * @apiSuccess {String} pancard_url
 * @apiSuccess {Object[]} userid
 * @apiSuccess {Number} userid.id user ID.
 * @apiSuccess {String} userid.name name of the user.
 * @apiSuccess {String} userid.email user email address.
 * @apiSuccess {String} userid.contact contact number of the user.
 * @apiSuccess {String} userid.cacompname company name.
 * @apiSuccess {String} userid.capancard user PAN CARD number.
 * @apiSuccess {String} userid.address1 user address 1.
 * @apiSuccess {String} userid.address2 user address 2 (by default it is null).
 * @apiSuccess {String} userid.pincode user pincode.
 * @apiSuccess {String} userid.locality area/location of the user.
 * @apiSuccess {String} userid.city city of the user.
 * @apiSuccess {String} userid.state state of the user.
 * @apiSuccess {String} userid.usertype
 * @apiSuccess {Number} userid.lender_id user lender ID.
 * @apiSuccess {Number} userid.parent_id user parent ID.
 * @apiSuccess {Number} userid.user_group_id user group ID.
 * @apiSuccess {Number} userid.assigned_sales_user sales user ID.
 * @apiSuccess {Number} userid.originator
 * @apiSuccess {Number} userid.is_lender_admin
 * @apiSuccess {String} userid.status status of the user.
 * @apiSuccess {String} userid.osv_name
 * @apiSuccess {String} userid.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
 * @apiSuccess {String} userid.createdon user created date and time.
 * @apiSuccess {String} userid.update_time user updated date and time.
 * @apiSuccess {Number} userid.is_lender_manager
 * @apiSuccess {String} userid.origin shows who created the user.
 * @apiSuccess {String} userid.white_label_id white label id of the user.
 * @apiSuccess {String} userid.deactivate_reassign
 * @apiSuccess {Number} userid.notification_purpose
 * @apiSuccess {String} userid.user_sub_type sub type of the user (by default it is null)
 * @apiSuccess {String} userid.notification_flag
 * @apiSuccess {Number} userid.createdbyUser ID of the created user.
 * @apiSuccess {String} userid.source user company name.
 * @apiSuccess {String} userid.channel_type
 * @apiSuccess {String} userid.otp user otp number
 * @apiSuccess {String} userid.work_type
 * @apiSuccess {String} userid.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
 * @apiSuccess {String} userid.pic user profile picture.
 * @apiSuccess {Object} businesstype details of business type.
 * @apiSuccess {Object} businessindustry details of business industry.
 *
 */
module.exports = {
	index: function (req, res, next) {
		BusinessRd.find().exec((err, list) => {
			if (err) {
				return Error("Error");
			}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		BusinessRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		BusinessRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		Business.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("business/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		Business.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/business");
		});
	},

	existingBusiness: async function (req, res, next) {
		const users = await UsersRd.find({
			select: ["id"],
			where: {
				or: [
					{
						parent_id: req.user["id"]
					},
					{
						id: req.user["id"]
					}
				]
			}
		}),
			userid = [];
		_.each(users, (value) => {
			userid.push(value.id);
		});
		const business = BusinessRd.find({userid: userid});
	},
	/**
   `  * @description :: business type list
	  * @api {get} /case-businessType/ business types
	  * @apiName business types
	  * @apiGroup Case
	  * @apiExample Example usage:
	  * curl -i localhost:1337/case-businessType
	  *
	  * "NOTE":
	  *         1. if you want to list all the business type, you need to pass id = 'All'
	  *         2. if you want to list particular business type, you need pass id = 1,2,3......
	  * @apiParam {number} id id(mandatory)
	  * @apiSuccess {String} status 'ok'.
	  * @apiSuccess {String} message Successfully listed.
	  * @apiSuccess {Object[]} business_types list all the business types.

  **/
	business_type: async function (req, res) {
		const businesstypeid = req.allParamsData.id;
		let business_wherecondition = {};
		if (!businesstypeid) {
			return res.badRequest(sails.config.res.missingFields);
		}
		if (businesstypeid == "All") {
			business_wherecondition = {};
		} else {
			business_wherecondition = {where: {id: businesstypeid}};
		}
		BusinessTypeRd.find(business_wherecondition)
			.select(["id", "TypeName"])
			.then((business_types) => {
				sails.config.successRes.listedSuccess.business_types = business_types;
				return res.ok(sails.config.successRes.listedSuccess);
			})
			.catch((err) => {
				throw err;
			});
	},
	/**
   `  * @description :: Update CIN number
	  * @api {post} /cin-update/ Update CIN number
	  * @apiName Update CIN number
	  * @apiGroup GST ROC
	  * @apiExample Example usage:
	  * curl -i localhost:1337/cin-update
	  *
	  * @apiParam {String} loan_ref_id loan_ref_id(mandatory)
	* @apiParam {String} cin_number cin_number(mandatory)
	  * @apiSuccess {String} status 'ok'.
	  * @apiSuccess {String} message Data updated successfully.
	  * @apiSuccess {Object[]} data

  **/
	cin_update: async function (req, res) {
		const {loan_ref_id, cin_number} = req.allParams();
		if (!loan_ref_id || !cin_number) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const loanData = await LoanrequestRd.findOne({loan_ref_id}).populate("business_id");
		if (!loanData) {
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		if (!loanData.business_id) {
			sails.config.res.invalidCaseOrData.message = "Business details is not there for this case id";
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
		const businessUpdate = await Business.update({
			id: loanData.business_id.id
		})
			.set({corporateid: cin_number})
			.fetch();
		if (businessUpdate && businessUpdate.length > 0) {
			let data = {};
			data = _.pick(businessUpdate[0], "id", "corporateid");
			data.loan_ref_id = loan_ref_id;
			sails.config.successRes.dataUpdated.data = data;
			return res.ok(sails.config.successRes.dataUpdated);
		} else {
			sails.config.res.invalidCaseOrData.message = "There is an error in updating cin number, please try again";
			return res.badRequest(sails.config.res.invalidCaseOrData);
		}
	},

	/**
   `  * @description :: Loan Status
	  * @api {get} /loan_status?cin_number=U70101MH1989PTC050881/ Loan Status
	  * @apiName Loan Status
	  * @apiGroup GST ROC
	  * @apiExample Example usage:
	  * curl -i localhost:1337/loan_status?cin_number=U70101MH1989PTC050881
	  *
	  * @apiParam {String} cin_number cin_number(mandatory)
	  * @apiSuccess {String} status 'ok'.
	  * @apiSuccess {String} message Case Id for the entered CIN number.
	  * @apiSuccess {Object} data

  **/
	loan_status: async function (req, res) {
		const cin = req.param("cin_number");
		if (!cin) {
			return res.badRequest(sails.config.res.missingFields);
		}
		const businessData = await BusinessRd.find({corporateid: cin, userid: req.user.id}).sort("ints DESC").limit(1);
		let data = {};
		if (!businessData || businessData.length == 0) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.noCaseAvailable,
				data: null
			});
			// sails.config.res.notExist.message =
			//   "there is no case for this CIN number";
			//   sails.config.res.notExist.data = null;
			// return res.ok(sails.config.res.notExist);
		}
		const loanData = await LoanrequestRd.findOne({
			business_id: businessData[0].id,
			createdUserId: req.user.id
		});
		if (loanData) {
			data = _.pick(loanData, "id", "loan_ref_id");
			const where_status = {
				white_label_id: loanData.white_label_id
			};
			if (loanData.loan_status_id) {
				where_status.status1 = loanData.loan_status_id;
			}
			if (loanData.loan_sub_status_id) {
				where_status.status2 = loanData.loan_sub_status_id;
			}
			if (loanData.remarks_val) {
				where_status.uw_doc_status = loanData.remarks_val;
			}
			if (loanData.loan_status_id == 2 && loanData.loan_sub_status_id == 9) {
				const loanbankData = await LoanBankMappingRd.find({
					loan_id: loanData.id,
					business: loanData.business_id
				});
				if (loanbankData) {
					where_status.status3 = loanbankData[0].loan_bank_status;
					where_status.status4 = loanbankData[0].loan_borrower_status;
				}
			}

			const nc_status = await NcStatusManageRd.findOne(where_status).select("name");
			if (nc_status) {
				data.status = nc_status;
			} else {
				data.status = {};
			}
		}
		sails.config.successRes.listedSuccess.message = "Case Id for the entered CIN number";
		sails.config.successRes.listedSuccess.data = data;
		return res.ok(sails.config.successRes.listedSuccess);
	},

	/**
   `  * @description :: Email Verification Update
	  * @api {post} /update_email_verification  Loan Status
	  * @apiName Email Verification Update
	  * @apiGroup GST ROC
	  * @apiExample Example usage:
	  * curl -i localhost:1337/update_email_verification
	  *
	  * @apiParam {String} cin_number cin_number(mandatory)
	  * @apiParam {String} business_id
	  * @apiParam {String} verified_on
	  * @apiParam {String} email
	  * @apiParam {String} status
	  *
	  * @apiSuccess {String} status 'ok'.
	  * @apiSuccess {String} message
	  * @apiSuccess {Object} data

		**/

	email_verification_update: async function (req, res) {
		let {business_id, verified_on, email, status} = req.allParams();
		if (!business_id) {
			return res.badRequest(sails.config.res.missingFields);
		}
		let businessData = await BusinessRd.findOne({id: business_id});
		if (!businessData) {
			return res.badRequest(sails.config.res.noDataAvailableId);
		}
		verified_data = {
			verified_on,
			email,
			status
		};
		businessUpdate = await Business.update({id: business_id})
			.set({email_verification: JSON.stringify(verified_data)})
			.fetch();
		return res.ok(sails.config.successRes.dataUpdated);
	},

	basic_details: async function (req, res) {
		const moment = require("moment");
		let {
			section_id,
			data: reqData,
			loan_product_id,
			white_label_id,
			loan_id,
			business_id,
			director_id,
			origin,
			borrower_user_id,
			is_applicant,
			parent_product_id,
			lead_id
		} = req.allParams();
		let {
			basic_details,
			loan_address_details,
			permanent_address_proof_upload,
			present_address_proof_upload,
			present_address_details,
			permanent_address_details,
			as_per_document_address_proof_upload
		} = reqData;
		let {
			first_name,
			last_name,
			business_email,
			contactno,
			businesstype,
			type_name,
			businesspancardnumber,
			customer_picture,
			app_coordinates,
			passport_no,
			businessindustry,
			kyc_risk_profile,
			udyam_doc_id,
			udyam_trans_id,
			additional_cust_id,
			ucic_updated,
			tvr_call,
			is_user_vendor, user_type
		} = basic_details || {};
		params = {...reqData.basic_details, loan_product_id, white_label_id};
		fields = ["first_name", "businesstype", "loan_product_id", "white_label_id", "contactno"];
		missing = await reqParams.fn(params, fields);
		if (
			missing.length > 0 &&
			(!loan_address_details || loan_address_details.length === 0) &&
			(!loan_id || !business_id)
		) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (!req.user.branch_id && req.user.loggedInWhiteLabelID == sails.config.muthoot_white_label_id[0]) {
			return res.badRequest(sails.config.res.branchIdNotExist);
		}
		if (basic_details && basic_details.dcibil_score) {
			let DCIBIL_SCORE = parseInt(basic_details.dcibil_score);
			if (DCIBIL_SCORE >= 0 && DCIBIL_SCORE <= 900) {
				basic_details.dcibil_score = DCIBIL_SCORE;
			}
		}

		let data = {},
			businessCreateOrUpdate,
			businessAddress,
			dirData,
			loanPreFetch,
			loanrequestData;
		datetime = await sails.helpers.dateTime();
		businessname = first_name + " " + last_name;
		business_email = business_email ? business_email : contactno + "@nc.com";
		businessstartdate = datetime;
		userid = borrower_user_id || req.user.id;
		businessindustry = businessindustry || "20", empcount = 1;
		let profileObj = {},
			loanDocument = {},
			geo_tagging_data = {
				ints: datetime,
				request_type: "Profile"
			},
			message;

		if (
			customer_picture &&
			Object.keys(customer_picture).length > 0 &&
			Object.values(customer_picture).length > 0 &&
			typeof customer_picture !== "string"
		) {
			url = await sails.helpers.s3CopyObject(
				0,
				customer_picture.bucket,
				customer_picture.region,
				userid,
				customer_picture.path,
				"yes"
			);
			if (customer_picture.long && customer_picture.lat) {
				geo_tagging_data = {
					...geo_tagging_data,
					lat: customer_picture.lat,
					long: customer_picture.long,
					lat_long_timestamp: customer_picture.timestamp
				};
			}
			fd_filename = customer_picture.path.split("/")[1];
			profileObj = {
				userid,
				bucket: customer_picture.bucket,
				region: customer_picture.region,
				filename: fd_filename,
				s3_file_path: `/users_${userid}/${fd_filename}`
			};
			loanDocument = {
				user_id: userid,
				// doctype: sails.config.docUpload.profilePic,
				doctype: customer_picture.doc_type_id || sails.config.docUpload.profilePic,
				doc_name: fd_filename,
				uploaded_doc_name: customer_picture.filename,
				original_doc_name: customer_picture.filename,
				ints: datetime,
				on_upd: datetime,
				uploaded_by: userid,
				status: "active",
				is_delete_not_allowed: customer_picture.is_delete_not_allowed || "false"
			};
		}
		let verification_data = {
			verified_on: datetime,
			email: business_email,
			status: "not verified"
		};
		business_obj = {
			...reqData.basic_details,
			businessname,
			business_email,
			white_label_id,
			empcount,
			businessindustry,
			ints: datetime,
			customer_picture: Object.values(profileObj).length > 0 ? JSON.stringify(profileObj) : null,
			businessstartdate,
			is_ca_business: user_type && user_type == "CA" ? 1 : 0,
			email_verification: JSON.stringify(verification_data),
			additional_info: JSON.stringify(reqData.basic_details)
		};
		if (business_id) {
			getbusinessData = await BusinessRd.findOne({id: business_id});
			if (getbusinessData && first_name && contactno && is_applicant === true) {
				if (typeof customer_picture == "string" || !customer_picture) {
					business_obj.customer_picture = getbusinessData.customer_picture;
				}
				business_obj.businesstype = businesstype == 0 ? getbusinessData.businesstype : businesstype;
				businessUpdate = await Business.update({id: business_id}).set(business_obj).fetch();
				businessCreateOrUpdate = businessUpdate[0];
				message = sails.config.msgConstants.successfulUpdation;
			} else if (!getbusinessData) {
				return res.badRequest(sails.config.res.invalidBusinessId);
			} else {
				businessCreateOrUpdate = getbusinessData;
			}
		} else {
			if (is_applicant === true || type_name === "Applicant") {
				business_obj.userid = userid;
				businessCreateOrUpdate = await Business.create(business_obj).fetch();
				message = sails.config.msgConstants.successfulInsertion;
			}
		}
		if (businessCreateOrUpdate) {
			data.business_data = businessCreateOrUpdate;
			director_obj = {
				business: businessCreateOrUpdate.id,
				dfirstname: first_name,
				dlastname: last_name,
				dpancard: businesspancardnumber,

				...reqData.basic_details,
				...reqData.family_details,
				demail: business_email,
				dcontact: contactno,
				isApplicant: is_applicant === true || type_name === "Applicant" ? 1 : 0,
				ints: datetime,
				type_name: type_name ? type_name : is_applicant === true ? "Applicant" : "Co-applicant",
				income_type: businesstype == 1 ? "business" : businesstype == 0 ? "noIncome" : "salaried",
				customer_picture: Object.values(profileObj).length > 0 ? JSON.stringify(profileObj) : null,
				udyam_response: udyam_trans_id ? JSON.stringify({transanction_id: udyam_trans_id}) : null
			};
			if (udyam_trans_id) director_obj.udyam_response = JSON.stringify({transanction_id: udyam_trans_id});
			let business_address = [],
				business_add_array = [],
				dirAddressObj = {};
			if (business_id && director_id && loan_id) {
				trackData = await sails.helpers.onboardingDataTrack(
					loan_id,
					business_id,
					director_id,
					req.user.id,
					section_id, ""
				);
			}

			if (business_id && director_id && loan_address_details && loan_address_details.length > 0) {
				dirAddressObj = {
					...permanent_address_proof_upload,
					...present_address_proof_upload,
					...present_address_details,
					...permanent_address_details,
					daadhaar: as_per_document_address_proof_upload && as_per_document_address_proof_upload.daadhaar || permanent_address_proof_upload.daadhaar || present_address_proof_upload.daadhaar,
					dvoterid: as_per_document_address_proof_upload && as_per_document_address_proof_upload.dvoterid || permanent_address_proof_upload.dvoterid || present_address_proof_upload.dvoterid,
					ddlNumber: as_per_document_address_proof_upload && as_per_document_address_proof_upload.ddlNumber || permanent_address_proof_upload.ddlNumber || present_address_proof_upload.ddlNumber,
					dpassport: as_per_document_address_proof_upload && as_per_document_address_proof_upload.dpassport || permanent_address_proof_upload.dpassport || present_address_proof_upload.dpassport,
					address1: loan_address_details[0].line1,
					address2: loan_address_details[0].line2,
					locality: loan_address_details[0].locality,
					city: loan_address_details[0].city,
					state: loan_address_details[0].state,
					pincode: loan_address_details[0].pincode,
					permanent_district: permanent_address_details.district,
					district: present_address_details.district,
					residential_stability: loan_address_details[0].residential_stability
						? moment(loan_address_details[0].residential_stability).format("MMMM YYYY")
						: "",
					residential_type: loan_address_details[0].residential_type,
					permanent_address1: loan_address_details[1].line1,
					permanent_address2: loan_address_details[1].line2,
					permanent_locality: loan_address_details[1].locality,
					permanent_city: loan_address_details[1].city,
					permanent_state: loan_address_details[1].state,
					permanent_pincode: loan_address_details[1].pincode,
					permanent_residential_stability: loan_address_details[1].residential_stability
						? moment(loan_address_details[1].residential_stability).format("MMMM YYYY")
						: "",
					permanent_residential_type: loan_address_details[1].residential_type,
					permanent_ddocname: permanent_address_proof_upload.ddocname
				};
				if (is_applicant === true) {
					for (let i in loan_address_details) {
						params = loan_address_details[i];
						fields = ["line1", "pincode", "city", "state"];
						missing = await reqParams.fn(params, fields);
						if (missing.length > 0 && !loan_address_details[i].business_address_id) {
							sails.config.res.missingFields.mandatoryFields = missing;
							return res.badRequest(sails.config.res.missingFields);
						}
						businesAddressData = {
							bid: business_id ? business_id : businessCreateOrUpdate.id,
							...loan_address_details[i],
							...permanent_address_proof_upload,
							residential_stability: loan_address_details[i].residential_stability
								? moment(loan_address_details[i].residential_stability).format("MMMM YYYY")
								: "",
							address_status: "owned",
							locality: loan_address_details[i].locality
								? loan_address_details[i].locality
								: "test locality",
							ints: datetime
						};
						if (loan_address_details[i].business_address_id) {
							fetchAddressData = await BusinessaddressRd.findOne({
								id: loan_address_details[i].business_address_id
							});
							if (fetchAddressData) {
								business_add_update = await Businessaddress.update({id: fetchAddressData.id})
									.set(businesAddressData)
									.fetch();
								message = sails.config.msgConstants.successfulUpdation;
								business_add_array.push(business_add_update[0]);
							}
						} else {
							business_address.push(businesAddressData);
						}
					}
					businessAddress = await Businessaddress.createEach(business_address).fetch();
					message = sails.config.msgConstants.successfulInsertion;
				}
				// data.business_address_data = businessAddress.length > 0 ?businessAddress : business_add_array ;
				data.business_address_data = business_add_array.length > 0 ? business_add_array : businessAddress;
			}
			if (section_id === "basic_details" && passport_no) {
				visa_data = {
					passport_no: passport_no,
					kyc_details: {
						passport_expiry_date: basic_details.passport_expiry_date
							? basic_details.passport_expiry_date
							: "null",
						visa_type: basic_details.visa_type,
						visa_validity: basic_details.visa_validity
					}
				};
				await storePermanetAndPresentAddress(visa_data, businessCreateOrUpdate.id);
			}
			const others_info = {...basic_details, kyc_risk: kyc_risk_profile, tele_verification_call: tvr_call};
			if (director_id) {
				fetchDirData = await DirectorRd.findOne({id: director_id});
				if (fetchDirData) {
					/* below function rectifies the kyc_ids for director table and updates ekycResponse table with business_id */
					if ((present_address_proof_upload && present_address_proof_upload.doc_ref_id) ||
						(present_address_proof_upload && present_address_proof_upload.address_proof_id)) {
						const data1 = await storePermanetAndPresentAddress(present_address_proof_upload, businessCreateOrUpdate.id);
						if (data1.passport_no) dirAddressObj.passport_no = data1.passport_no;
					}
					if ((permanent_address_proof_upload && permanent_address_proof_upload.doc_ref_id) ||
						(permanent_address_proof_upload && permanent_address_proof_upload.permanent_address_proof_id)) {
						const data2 = await storePermanetAndPresentAddress(permanent_address_proof_upload, businessCreateOrUpdate.id);
						if (data2.passport_no) dirAddressObj.passport_no = data2.passport_no;
					}
					if (dirAddressObj && Object.values(dirAddressObj).length > 0) {
						update_dir_add = await Director.update({id: director_id}).set(dirAddressObj).fetch();
						dirData = update_dir_add[0];
					}
					if (Object.values(director_obj).length > 0 && Object.values(dirAddressObj).length === 0) {
						if (!customer_picture || typeof customer_picture == "string") {
							director_obj.customer_picture = fetchDirData.customer_picture;
						}
						const directorOthersInfo = JSON.parse(fetchDirData.others_info) || {};
						director_obj.others_info = JSON.stringify({...directorOthersInfo, ...others_info})
						update_dir_data = await Director.update({id: director_id}).set(director_obj).fetch();
						dirData = update_dir_data[0];
					}
					message = sails.config.msgConstants.successfulUpdation;
				}
			} else {
				director_obj.others_info = JSON.stringify(others_info)
				dirData = await Director.create(director_obj).fetch();
				message = sails.config.msgConstants.successfulInsertion;
				if (business_id && loan_id) {
					trackData = await sails.helpers.onboardingDataTrack(
						loan_id,
						business_id,
						dirData.id,
						req.user.id,
						section_id, ""
					);
				}
			}
			data.director_details = dirData || {};
			if (ucic_updated && additional_cust_id) {
				if (director_id) {
					const loanPreFetchRecord = await LoanPreFetchRd.find({director_id}).sort("id DESC").limit(1)
					if (loanPreFetchRecord.length) loanPreFetch = await LoanPreFetch.updateOne({director_id}).set({
						request_type: "UCIC Created", refrence_no: additional_cust_id,
						status: "Approved", third_party_response: "UCIC number Updated", updated_at: await sails.helpers.dateTime(),
					}).fetch();
					else loanPreFetch = await LoanPreFetch.create({
						request_type: "UCIC Created", refrence_no: additional_cust_id,
						status: "Approved", third_party_response: "UCIC number Updated",
						loan_id: loan_id, director_id, created_at: await sails.helpers.dateTime(),
						updated_at: await sails.helpers.dateTime(),
					}).fetch();
				}
				else {
					loanPreFetch = await LoanPreFetch.create({
						request_type: "UCIC Created", refrence_no: additional_cust_id,
						status: "Approved", third_party_response: "UCIC number Updated",
						loan_id, director_id: dirData.id, created_at: await sails.helpers.dateTime(),
						updated_at: await sails.helpers.dateTime(),
					}).fetch();
				}

			}
			if (!loan_id) {
				const loanProductData = await LoanProductsRd.findOne({
					id: loan_product_id,
					business_type_id: {
						contains: businesstype
					}
				});
				if (!loanProductData) {
					return res.badRequest(sails.config.res.invalidProductId);
				}
				const loan_request_type = loanProductData.loan_request_type;
				loan_asset_type_id = loanProductData.loan_asset_type_id.split(",")[0];
				loan_usage_type_id = loanProductData.loan_usage_type_id.split(",")[0];
				loan_type_id = loanProductData.loan_type_id.split(",")[0];
				loan_summary = `${loanProductData.product} - requested to create case for business ${businessname} for ${req.user.usertype}`;
				report_tat = {
					assignedUserId: req.user.id,
					assignedBy: req.user.name,
					dateTime: datetime,
					previous_status: "",
					current_status: "In Complete",
					message: "",
					count: 1
				};
				sales_id =
					req.user.usertype == "CA" && req.user.assigned_sales_id
						? req.user.assigned_sales_id
						: req.user.parent_id !== 0 && req.user.parent_id
							? req.user.parent_id
							: req.user.id;
				origin1 = req.user.usertype == "CA" ? "Connector" : req.user.usertype == "Bank" ? "Branch" : "";
				let coUserId, loan_status_id = 1, loan_sub_status_id = 1, loan_ref_id;
				let whiteLabelData = await WhiteLabelSolutionRd.findOne({id: white_label_id});
				if (whiteLabelData && whiteLabelData.assignment_type.additional_assignment_stage1 && whiteLabelData.assignment_type.additional_assignment_stage1.assignment) {
					let coUserIdData = await UsersRd.find({
						branch_id: req.user.branch_id,
						usertype: whiteLabelData.assignment_type.additional_assignment_stage1.assignment[0].usertype,
						user_sub_type: whiteLabelData.assignment_type.additional_assignment_stage1.assignment[0].user_subtype,
						or: [
							{white_label_id: `${white_label_id}`},
							{white_label_id: {'like': `%,${white_label_id}`}},
							{white_label_id: {'like': `${white_label_id},%`}},
							{white_label_id: {'like': `%,${white_label_id},%`}}
						]
					}).limit(1);
					if (coUserIdData.length > 0) {
						coUserId = coUserIdData[0].id;
					}
				}
				if (is_user_vendor) {
					loan_status_id = 18;
					loan_sub_status_id = 20;
					loan_ref_id = await sails.helpers.commonHelper(white_label_id, is_user_vendor, loan_product_id);
				}
				const loan_data = {
					loan_request_type: loan_request_type,
					business_id: businessCreateOrUpdate.id,
					loan_ref_id: loan_ref_id || await sails.helpers.commonHelper(),
					loan_asset_type: loan_asset_type_id,
					loan_usage_type: loan_usage_type_id,
					loan_type_id: loan_type_id,
					loan_status_id,
					loan_sub_status_id,
					loan_product_id,
					white_label_id,
					createdUserId: req.user.id,
					sales_id,
					RequestDate: datetime,
					modified_on: datetime,
					loan_origin: origin + "_" + origin1,
					connector_user_id: req.user.usertype == "CA" && req.user.user_reference_no ? req.user.user_reference_no : "",
					loan_summary,
					branch_id: req.user.branch_id,
					parent_product_id,
					reportTat: JSON.stringify({data: [report_tat]}),
					assignment_additional: coUserId
				};
				loanrequestData = await Loanrequest.create(loan_data).fetch();
				loan_id = loanrequestData.id;
				trackData = await sails.helpers.onboardingDataTrack(
					loanrequestData.id,
					loanrequestData.business_id,
					dirData.id,
					req.user.id,
					section_id, ""
				);
				data.loan_data = loanrequestData;
			} else {
				if (is_applicant === true) {
					const loanProductData1 = await LoanProductsRd.findOne({
						id: loan_product_id
					});
					loanrequestDataUpdate = await Loanrequest.update({id: loan_id}).set({
						loan_request_type: loanProductData1.loan_request_type,
						loan_product_id,
						parent_product_id
					}).fetch();
					data.loan_data = loanrequestData = loanrequestDataUpdate[0];
				} else {
					loanrequestData = await LoanrequestRd.findOne({id: loan_id});
					data.loan_data = loanrequestData;
				}
			}
			if (lead_id) {
				await Leads.update({id: lead_id})
					.set({loan_id, updated_time: datetime});
			}
			array = [];
			if (udyam_doc_id) {
				didUpdateForudyamdoc = await LoanDocument.update({id: udyam_doc_id}).set({directorId: dirData.id}).fetch();
				data.business_data.udyam_document_data = didUpdateForudyamdoc;
			} else {
				data.business_data.udyam_document_data = {};
			}
			if (loanrequestData && Object.keys(loanDocument).length > 0) {
				loanDocument.loan = loanrequestData.id;
				loanDocument.business_id = businessCreateOrUpdate.id;
				loanDocument.directorId = dirData.id;
				loandocCreate = await LoanDocument.create(loanDocument).fetch();
				doc_id = loandocCreate.id;
				data.loan_document_data = loandocCreate;
				if (Object.values(geo_tagging_data).length > 0) {
					geo_tagging_data.doc_id = doc_id;
					geo_tagging_data.loan_id = loanrequestData.id;
					geo_tagging_data.did = dirData.id;
					array.push(geo_tagging_data);
				}
			} else {
				data.loan_document_data = {};
			}
			if (app_coordinates && Object.values(app_coordinates).length > 0) {
				const app_coOrdinates = {
					...app_coordinates,
					lat_long_timestamp: app_coordinates.timestamp,
					request_type: "Application",
					loan_id: data.loan_data.id,
					did: dirData.id,
					doc_id: 0,
					ints: datetime
				};
				array.push(app_coOrdinates);
			}
			if (array.length > 0) {
				Doc_detials_data = await LoanDocumentDetails.createEach(array).fetch();
			}
		}

		res.ok({status: "ok", message, data: data});
		const businessId = data.business_data.id,
			loanId = data.loan_data.id,
			directorId = data.director_details.id,
			pancard = data.director_details.dpancard

		await sails.helpers.greenChannelCondition(loanrequestData.id, req.user.loggedInWhiteLabelID)

		const whiteLabelIdArr = sails.config.panNsdl.whiteLableId
		if (whiteLabelIdArr.includes(Number(white_label_id))) {
			await sails.helpers.panNsdlPdfGenerate(loanId, businessId, directorId, pancard, white_label_id)
		}
	},
	fetch_basic_details: async function (req, res) {
		const loan_ref_id = req.param("loan_ref_id");
		const dir_id = req.param("director_id");

		params = {loan_ref_id};
		fields = ["loan_ref_id"];
		missing = await reqParams.fn(params, fields);

		if (!loan_ref_id) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		const loan_request_Data = await LoanrequestRd.findOne({loan_ref_id}).populate("loan_document", {where: {directorId: dir_id, status: "active"}}),
			business_data = await BusinessRd.findOne({id: loan_request_Data.business_id});
		const loanProductDetails = await LoanProductDetailsRd.find({white_label_id: loan_request_Data.white_label_id, parent_id: loan_request_Data.parent_product_id, product_id: {contains: loan_request_Data.loan_product_id}}).sort("id DESC").limit(1).select("product_details");
		if (loan_request_Data.branch_id) {
			loan_request_Data.branch_id = await BanktblRd.findOne({
				id: loan_request_Data.branch_id
			}).select(["ref_id", "branch"]);
		}
		let trackData = await MisActivityRd.find({loan_id: loan_request_Data.id}).select("onboarding_track");
		if (business_data.customer_picture) {
			business_data.customer_picture = JSON.parse(business_data.customer_picture);
		}
		let month = new Date();
		month = moment(month).subtract(6, "months").format("YYYY-MM-DD HH:mm:ss").toString();
		const business_address_data = await BusinessaddressRd.find({bid: business_data.id}),
			director_details = await DirectorRd.findOne({id: dir_id}),
			kycData = [], ekyc_respons_data = [], ekyc_response = []; //[director_details.dvoterid, director_details.dpassport, director_details.passport_no, director_details.ddlNumber];
		let whereCondition = {ref_id: business_data.id}
		if (director_details.passport_no)
			kycData.push(director_details.passport_no);

		if (director_details.dvoterid)
			kycData.push(director_details.dvoterid);
		whereCondition.kyc_key = director_details.dvoterid;

		if (director_details.dpassport)
			kycData.push(director_details.dpassport);
		whereCondition.kyc_key = director_details.dpassport;

		if (director_details.ddlNumber)
			kycData.push(director_details.ddlNumber);
		whereCondition.kyc_key = director_details.ddlNumber;

		if (director_details.daadhaar)
			kycData.push(director_details.daadhaar);
		whereCondition.kyc_key = director_details.daadhaar;

		const document_details = await LoanDocumentDetailsRd.find({
			loan_id: loan_request_Data.id, did: dir_id,
			or: [{request_type: ["Profile", "Application"]},
			{classification_type: ["aadhaar", "voter", "passport", "dl", "pan", "others"]}]
		}).select(["loan_id", "doc_id", "aid", "classification_type", "classification_sub_type", "did", "lat", "long", "request_type", "lat_long_timestamp"]),
			{loan_document_details,
				profile_latlong,
				application_latlong, ekyc_data,
				other_kyc_doc_ref_id} = await getKycData(document_details, director_details);
		let check_200_response_flag = false, data12;
		if (other_kyc_doc_ref_id.length > 0) {kycData.push(...other_kyc_doc_ref_id);}
		const ekyc_data_fetch = await EkycResponse.find({kyc_key: kycData, updated: {">=": month}}).sort("id DESC");
		for (let i = 0; i < ekyc_data.length; i++) {
			data12 = ekyc_data_fetch.find(element => element.kyc_key == ekyc_data[i].adress_proof_id ||
				element.kyc_key == ekyc_data[i].doc_ref_id);
			if (data12 && data12.kyc_details) {
				element = {...ekyc_data[i], ...JSON.parse(data12.kyc_details)};
			} else {
				element = ekyc_data[i];
			}
			ekyc_response.push(element);
		}
		data12 = ekyc_data_fetch.find(element => element.kyc_key == director_details.passport_no);
		ekyc_respons_data.push(data12);
		const aadhaar_data = ekyc_data_fetch.find(element => element.kyc_key == director_details.daadhaar);
		check_200_response_flag = aadhaar_data && aadhaar_data.response &&
			JSON.parse(aadhaar_data.response).code == 200 ? true : false;
		director_details.ekyc_data = ekyc_response;
		director_details.is_aadhaar_verified_with_otp = check_200_response_flag;
		if (director_details.customer_picture) {
			director_details.customer_picture = JSON.parse(director_details.customer_picture);
			if (profile_latlong && Object.keys(profile_latlong).length > 0) {
				const {lat, long, lat_long_timestamp} = profile_latlong;
				director_details.customer_picture = {
					...director_details.customer_picture,
					lat,
					long,
					lat_long_timestamp,
					doctype: profile_latlong.doctype,
					doc_id: profile_latlong.doc_id
				};
			}
		}
		if (director_details.isApplicant == 0) {
			incomeTypaData = await CoapplicantDocumentMappingRd.findOne({
				income_type_name: director_details.income_type,
				white_label_id: loan_request_Data.white_label_id
			}).select(["income_type_name", "income_type_id"]);
			if (incomeTypaData) {
				director_details.income_type = incomeTypaData.income_type_id;
			}
		} else {
			director_details.income_type = director_details.income_type == "business" ? 1 : director_details.income_type == "noIncome" ? 0 : 7;
		}

		director_details.nsdl_data = director_details.others_info ? JSON.parse(director_details.others_info).nsdl_verification : {};
		if (loanProductDetails[0] && (JSON.parse(loanProductDetails[0].product_details))?.is_udyam_valid_response && director_details.income_type == 1) {
			const udyamData = JSON.parse(director_details.udyam_response)
			if (!udyamData?.data) director_details.is_udyam_verified = "notVerified"
			else if (udyamData?.error_message == 'The udyam number is not found!') director_details.is_udyam_verified = "notFound"
		}
		// if (director_details.dpancard) {
		// 	let panData = await PannoResponse.find({panno: director_details.dpancard}).select("verification_response").sort("id DESC").limit(1);
		// 	if (panData[0]?.verification_response) {
		// 		const nsdlData = JSON.parse(panData[0].verification_response).nsdlPanData
		// 		if (nsdlData?.data) {
		// 			director_details.nsdl_data = nsdlData.data
		// 			director_details.nsdl_data.verification_timestamp = nsdlData.verification_timestamp,
		// 				director_details.nsdl_data.user_reference_no = nsdlData.user_reference_no
		// 		}
		// 	}
		// }

		if (application_latlong.length > 0) {
			application_latlong.sort((a, b) => {
				return b.id - a.id;
			});
			const {lat, long, lat_long_timestamp} = application_latlong[0];
			director_details.app_coordinates = {lat, long, lat_long_timestamp};
		} else {
			director_details.app_coordinates = {};
		}
		const udyam_document = await LoanDocumentRd.find({
			where: {
				directorId: dir_id,
				business_id: business_data.id,
				doctype: sails.config.docUpload.udyamDocId,
				status: 'active'
			}
		});
		const loan_pre_fetch_data = await LoanPreFetchRd.find({director_id: dir_id, refrence_no: director_details.customer_id, request_type: "Customer Details Fetch"});
		director_details.udyam_document = udyam_document.length > 0 ? udyam_document[0] : {};

		if (director_details && Object.keys(whereCondition).length > 1) {
			let ekycDoc;
			if (director_details.daadhaar) ekycDoc = await EkycResponse.find({ref_id: business_data.id, kyc_key: director_details.daadhaar}).sort("id DESC").limit(1);
			if (ekycDoc && ekycDoc.length > 0) ekycDoc = ekycDoc[0]
			else {
				ekycDoc = await EkycResponse.find(whereCondition).sort("id DESC").limit(1);
				ekycDoc = ekycDoc.length > 0 ? ekycDoc[0] : null;
			}

			if (ekycDoc && ekycDoc.verification_response) {
				let as_per_document = {};
				let verification_response = JSON.parse(ekycDoc.verification_response)
				const extractionData = verification_response?.extractionData
				const digilockerData = verification_response?.model?.address
				if (extractionData) {
					let address = extractionData.Address || extractionData.address
					const addressArray = address ? address.split(/[;,]+/) : [];
					as_per_document = {
						aid: 3,
						classification_type: `as_per_document_${ekycDoc.type}`,
						line1: addressArray.length > 0 ? addressArray[0] : "",
						line2: addressArray.length > 0 ? addressArray[1] : "",
						line3: addressArray.length > 0 ? addressArray[2] : "",
						pincode: extractionData.pincode || "",
						full_address: address || "",
						extraction_type: "OCR"
					}
				}
				else if (digilockerData) {
					const {house, street, landmark, loc, po, dist, state, pc, vtc, subdist} = digilockerData;
					as_per_document = {
						aid: 3,
						classification_type: `as_per_document_${ekycDoc.type}`,
						line1: `${house}, ${street}, ${loc}, ${vtc}, ${subdist}`,
						line2: `${po}`,
						line3: `${landmark}`,
						pincode: pc || "",
						full_address: Object.values(digilockerData).join(", "),
						extraction_type: "Digilocker"
					}
				}
				if (director_details.daadhaar) as_per_document.aadhar_no = director_details.daadhaar
				as_per_document[`kyc_key_${ekycDoc.type}`] = ekycDoc.kyc_key
				director_details.as_per_document = as_per_document
			}
		}
		if (business_address_data.length > 0 || director_details) {
			return res.ok({
				status: "ok",
				message: "Data fetched successfully",
				data: {
					loan_request_Data,
					business_data,
					business_address_data,
					director_details,
					loan_document_details,
					trackData,
					ekyc_respons_data,
					loan_pre_fetch_data
				}
			});
		} else {
			return res.badRequest({
				status: "nok",
				message: "no data found"
			});
		}
	},
	skip_section: async function (req, res) {

		try {

			const {loan_id, business_id, section_id, director_id} = req.allParams();

			if (!loan_id || !business_id || !section_id) return res.send({
				status: "nok",
				message: "mandatory params missing"
			});

			const skip_section_response = await sails.helpers.onboardingDataTrack(
				loan_id,
				business_id,
				director_id,
				req.user.id,
				section_id, ""
			);

			if (skip_section_response) {
				return res.send({
					status: "ok",
					message: "Section Skipped Successfully",
					skip_section_response
				});
			}

			return res.send({
				status: "nok",
				message: "Failed to skip section"
			});

		} catch (error) {

			return res.send({
				status: "nok",
				message: error.message
			})

		}

	}

};
async function storePermanetAndPresentAddress(addressObj, business_id) {
	let kyc_key, type,
		kyc_details = {}, whereCondition = {};
	const dataRes = {};
	if (addressObj.dpassport) {
		dataRes.passport_no = addressObj.dpassport;
	} else {
		dataRes.passport_no = addressObj.passport_no;
	}
	if (addressObj.doc_ref_id) {
		whereCondition = {id: addressObj.doc_ref_id};
		if (addressObj.address_proof_type.includes("voter")) {kyc_key = addressObj.dvoterid;}
		else if (addressObj.address_proof_type.includes("DL")) {kyc_key = addressObj.ddlNumber;}
		else if (addressObj.address_proof_type.includes("aadhar")) {kyc_key = addressObj.daadhaar;}
		else if (addressObj.address_proof_type.includes("passport")) {kyc_key = addressObj.dpassport;}
		else if (addressObj.address_proof_type.includes("permanent_others")) {kyc_key = addressObj.permanent_address_proof_id;}
		else if (addressObj.address_proof_type.includes("present_others")) {kyc_key = addressObj.address_proof_id;}
		kyc_details = {
			issued_on: addressObj.issued_on,
			valid_till: addressObj.valid_till
		};
	} else {
		let valid_till, issued_on;
		if (addressObj.passport_no) {kyc_key = addressObj.passport_no; type = "passport";}
		else if (addressObj.address_proof_type.includes("permanent_others")) {kyc_key = addressObj.permanent_address_proof_id; type = "others"; issued_on = addressObj.issued_on; valid_till = addressObj.valid_till;}
		else if (addressObj.address_proof_type.includes("present_others")) {kyc_key = addressObj.address_proof_id; type = "others"; issued_on = addressObj.issued_on; valid_till = addressObj.valid_till;}
		whereCondition = {kyc_key: kyc_key};
		kyc_details = addressObj.kyc_details ? addressObj.kyc_details : {valid_till, issued_on};
	}
	// let month = new Date();
	// month = moment(month).subtract(6, "months").format("YYYY-MM-DD HH:mm:ss").toString();
	// whereCondition.updated = {">=" : month};
	const ekycData = await EkycResponse.find(whereCondition).sort("id DESC").limit(1);
	if (ekycData.length > 0) {
		if (ekycData[0].kyc_details) {
			parseData = JSON.parse(ekycData[0].kyc_details);
			kyc_details = {...parseData, ...kyc_details};
		}
		const EkycResponseData = await EkycResponse.update({id: ekycData[0].id})
			.set({
				kyc_key,
				ref_id: business_id,
				kyc_details: JSON.stringify(kyc_details)
			})
			.fetch();
	} else {
		const EkycResponseCreate = await EkycResponse.create({
			kyc_key,
			ref_id: business_id,
			type: type,
			kyc_details: JSON.stringify(kyc_details)
		}).fetch();
	}
	return dataRes;
}
async function getKycData(document_details, director_details) {
	const resData = {
		ekyc_data: [],
		profile_latlong: {},
		application_latlong: [],
		loan_document_details: [],
		other_kyc_doc_ref_id: []
	};
	if (document_details.length > 0) {
		for (let value of document_details) {
			let obj = {};
			if (value.aid && value.classification_type == "aadhaar") {
				obj = {
					aid: value.aid,
					adress_proof_id: director_details.daadhaar,
					classification_type: value.classification_type,
					daadhaar: director_details.daadhaar
				};
				resData.ekyc_data.push(obj);
			}
			if (value.aid && value.classification_type == "voter") {
				obj = {
					aid: value.aid,
					adress_proof_id: director_details.dvoterid,
					classification_type: value.classification_type,
					dvoterid: director_details.dvoterid
				};
				resData.ekyc_data.push(obj);
			}
			if (value.aid && value.classification_type == "passport") {
				obj = {
					aid: value.aid,
					adress_proof_id: director_details.dpassport,
					classification_type: value.classification_type,
					dpassport: director_details.dpassport
				};
				resData.ekyc_data.push(obj);
			}
			if (value.aid && value.classification_type == "dl") {
				obj = {
					aid: value.aid,
					adress_proof_id: director_details.ddlNumber,
					classification_type: value.classification_type,
					ddlNumber: director_details.ddlNumber
				};
				resData.ekyc_data.push(obj);
			}
			if (value.aid && value.classification_type == "others") {
				if (value.other_doc_ref_id) resData.other_kyc_doc_ref_id.push(value.other_doc_ref_id);
				obj = {
					aid: value.aid,
					classification_type: value.classification_type,
					doc_ref_id: value.other_doc_ref_id
				};
				resData.ekyc_data.push(obj);
			}
			if (value.request_type === "Profile") {
				let status_check = await LoanDocumentRd.findOne({
					where: {
						id: value.doc_id,
						status: "active"
					}
				});
				if (status_check) {
					resData.profile_latlong = {...value, doc_id: status_check.id, doctype: status_check.doctype};
				}
			}
			if (value.request_type === "Application") {
				resData.application_latlong.push(value);
			}
			if (value.classification_type && value.doc_id != 0) {
				loan_doc_details = await LoanDocumentRd.findOne({id: value.doc_id, status: "active"});
				loan_doc_details.document_details = {...value};
				resData.loan_document_details.push(loan_doc_details);
			}
		}
	} else {
		resData.loan_document_details = [];
	}
	return resData;
	// const kyc_data_fetch = await EkycResponse
}
