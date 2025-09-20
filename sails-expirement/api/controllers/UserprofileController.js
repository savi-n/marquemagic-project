/**
 * UserprofileController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const reqParams = require("../helpers/req-params");
module.exports = {
	/**
	 * @description :: User Profile update details  by given  parameters
	 * @api {get} /userprofile/ user profile index
	 * @apiName User Profile index
	 * @apiGroup User Profile
	 * @apiExample Example usage:
	 * curl -i localhost:1337/userprofile/
	 * @apiSuccess {Object[]} data list of data.
	 * @apiSuccess {Number} data.id user ID.
	 * @apiSuccess {String} data.name name of the user.
	 * @apiSuccess {String} data.email user email address.
	 * @apiSuccess {String} data.contact contact number of the user.
	 * @apiSuccess {String} data.cacompname company name.
	 * @apiSuccess {String} data.capancard user PAN CARD number.
	 * @apiSuccess {String} data.address1 user address 1.
	 * @apiSuccess {String} data.address2 user address 2 (by default it is null).
	 * @apiSuccess {String} data.pincode user pincode.
	 * @apiSuccess {String} data.locality area/location of the user.
	 * @apiSuccess {String} data.city city of the user.
	 * @apiSuccess {String} data.state state of the user.
	 * @apiSuccess {String} data.usertype
	 * @apiSuccess {Number} data.lender_id user lender ID.
	 * @apiSuccess {Number} data.parent_id user parent ID.
	 * @apiSuccess {Number} data.user_group_id user group ID.
	 * @apiSuccess {Number} data.assigned_sales_user sales user ID.
	 * @apiSuccess {Number} data.originator
	 * @apiSuccess {Number} data.is_lender_admin
	 * @apiSuccess {String} data.status status of the user.
	 * @apiSuccess {String} data.osv_name
	 * @apiSuccess {String} data.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
	 * @apiSuccess {String} data.createdon user created date and time.
	 * @apiSuccess {String} data.update_time user updated date and time.
	 * @apiSuccess {Number} data.is_lender_manager
	 * @apiSuccess {String} data.origin shows who created the user.
	 * @apiSuccess {String} data.white_label_id white label id of the user.
	 * @apiSuccess {String} data.deactivate_reassign
	 * @apiSuccess {Number} data.notification_purpose
	 * @apiSuccess {String} data.user_sub_type sub type of the user (by default it is null)
	 * @apiSuccess {String} data.notification_flag
	 * @apiSuccess {Number} data.createdbyUser ID of the created user.
	 * @apiSuccess {String} data.source user company name.
	 * @apiSuccess {String} data.channel_type
	 * @apiSuccess {String} data.otp user otp number
	 * @apiSuccess {String} data.work_type
	 * @apiSuccess {String} data.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
	 * @apiSuccess {String} data.pic user profile picture.
	 */

	index: function (req, res, next) {
		UsersRd.find({id: req.user["id"]}).exec((err, list) => {
			if (err) {
				return Error("Error");
			}
			return res.send({
				status: "200",
				data: list
			});
		});
	},

	/**
* User Profile update for a given parameters
*
* @description :: User Profile update details  by given  parameters
* @api {put} /userprofile/update/ user profile
* @apiName User Profile update
* @apiGroup User Profile

*@apiExample Example usage:
* curl -i localhost:1337/userprofile/update/

* @apiParam {String} name name.
* @apiParam {String} pancard pancard.
* @apiParam {String} work_type work_type.
*
* @apiSuccess {String} message  updated Successfully.
* @apiSuccess {Object[]} data list of data.
* @apiSuccess {Object} data.encrypted_data Encrypted Data.
*  @apiSuccess {String} data.sent_email
*  @apiSuccess {String} data.user_refrence_no user reference number.
* @apiSuccess {Number} data.id user ID.
* @apiSuccess {String} data.name name of the user.
* @apiSuccess {String} data.email user email address.
* @apiSuccess {String} data.contact contact number of the user.
* @apiSuccess {String} data.cacompname company name.
* @apiSuccess {String} data.capancard user PAN CARD number.
* @apiSuccess {String} data.address1 user address 1.
* @apiSuccess {String} data.address2 user address 2 (by default it is null).
* @apiSuccess {String} data.pincode user pincode.
* @apiSuccess {String} data.locality area/location of the user.
* @apiSuccess {String} data.city city of the user.
* @apiSuccess {String} data.state state of the user.
* @apiSuccess {String} data.usertype
* @apiSuccess {Number} data.lender_id user lender ID.
* @apiSuccess {Number} data.parent_id user parent ID.
* @apiSuccess {Number} data.user_group_id user group ID.
* @apiSuccess {Number} data.assigned_sales_user sales user ID.
* @apiSuccess {Number} data.originator
* @apiSuccess {Number} data.is_lender_admin
* @apiSuccess {String} data.status status of the user.
* @apiSuccess {String} data.osv_name
* @apiSuccess {String} data.firstlogin user login (if it is first login it's represent by 0 otherwise 1).
* @apiSuccess {String} data.createdon user created date and time.
* @apiSuccess {String} data.update_time user updated date and time.
* @apiSuccess {Number} data.is_lender_manager
* @apiSuccess {String} data.origin shows who created the user.
* @apiSuccess {String} data.white_label_id white label id of the user.
* @apiSuccess {String} data.deactivate_reassign
* @apiSuccess {Number} data.notification_purpose
* @apiSuccess {String} data.user_sub_type sub type of the user (by default it is null)
* @apiSuccess {String} data.notification_flag
* @apiSuccess {Number} data.createdbyUser ID of the created user.
* @apiSuccess {String} data.source user company name.
* @apiSuccess {String} data.channel_type
* @apiSuccess {String} data.otp user otp number
* @apiSuccess {String} data.work_type
* @apiSuccess {String} data.profile_completion status of the user profile (stage 0,1,2,3 stage 0 is initial stage, stage 1 is 1st stage, stage 2 is 2nd stage, stage 3 is completion stage).
* @apiSuccess {String} data.pic user profile picture.
*/
	edit: async function (req, res) {
		let data;
		const query = {id: req.user["id"]};
		if (req.body.work_type) {
			data = {work_type: req.body.work_type, profile_completion: 1};
		} else {
			data = {
				name: req.body.name,
				capancard: req.body.pancard,
				profile_completion: 2
			};
		}
		const logService = await sails.helpers.logtrackservice(req, "userprofile/update", req.user.id, "users");
		if (data) {
			Users.update(query, data)
				.fetch()
				.exec((err, Users) => {
					if (err) {
						return Error("Error");
					}
					return res.ok({
						status: "ok",
						message: "updated successfully",
						data: Users
					});
				});
		} else {
			return res.badRequest({
				status: "nok",
				exception: "Invalid parameters",
				message: "Fields are mandatory"
			});
		}
	},

	/**
	 * User Profile update for a given parameters
	 * @description :: User Profile upload details  by given  parameters
	 * @api {POST} /userprofile/upload/ upload profile
	 * @apiName Upload User Profile Image
	 * @apiGroup User Profile
	 * @apiParam {file} profile_pic image.
	 * @apiExample Example usage:
	 * curl -i http://localhost:1337/userprofile/upload/
	 * @apiSuccess {Object[]} data list of data.
	 * @apiSuccess {String} message  uploaded Successfully.
	 *
	 */
	uploadprofilepic: async function (req, res, next) {
		const user_whitelabel = req.user.loggedInWhiteLabelID,
			whitelabelsolution = await WhiteLabelSolutionRd.find({
				id: user_whitelabel
			});
		let bucket = whitelabelsolution[0]["s3_name"];
		const region = whitelabelsolution[0]["s3_region"];
		//if (!sails.config.azure.isActive) {
		bucket = bucket + "/users_" + req.user["id"] + "/profile_pic";
		//}
		const upload = await sails.helpers.s3Upload(req.file("profile_pic"), bucket, region);
		
		const getParams = {
			Bucket: whitelabelsolution[0]["s3_name"],
			Key: "users_" + req.user["id"] + "/profile_pic/" + upload[0].fd
		};
			let file = await sails.helpers.s3ViewDocument(upload[0].fd, bucket, region,JSON.stringify(getParams));
			base64String = file.Body.toString('base64');
			let url = "data:image/jpeg;base64,"+base64String;
			
			// url = await sails.helpers.s3ViewDocument(upload[0].fd, bucket, region),
			query = {id: req.user["id"]},
			data = {pic: url};
		updatePic(query, data);
		res.ok({status: "ok", message: "Uploaded Successfully", data: data});
		function updatePic(query, data) {
			if (data) {
				Users.update(query, data)
					.fetch()
					.exec((err, Users) => {
						if (err) {
							return Error("Error");
						}
					});
			}
		}
	},

	/*
upload profile for get method
*/

	/**
	 * user profile for get method
	 *
	 * @api {get} /profile/ View Profile
	 * @apiName view profile
	 * @apiGroup User Profile
	 * @apiExample Example usage:
	 * curl -i localhost:1337/profile/
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {Object[]} data
	 * @apiSuccess {Object[]} data.business_address
	 * @apiSuccess {Number} data.business_address.id business address id.
	 * @apiSuccess {String} data.business_address.line1 address line1.
	 * @apiSuccess {String} data.business_address.line2 address line2.
	 * @apiSuccess {String} data.business_address.locality locality.
	 * @apiSuccess {String} data.business_address.city city.
	 * @apiSuccess {String} data.business_address.state state.
	 * @apiSuccess {String} data.business_address.pincode pincode.
	 * @apiSuccess {Number} data.business_address.bid
	 * @apiSuccess {Number} data.id business id.
	 * @apiSuccess {String} data.businessname Business Name.
	 * @apiSuccess {String} data.business_email Business Email.
	 * @apiSuccess {String} data.contactno Contact Number.
	 * @apiSuccess {Number} data.businesstype Business Type.
	 * @apiSuccess {String} data.businessstartdate Business Start Date.
	 * @apiSuccess {String} data.businesspancardnumber PanCard Number.
	 * @apiSuccess {String} data.gstin
	 *
	 */

	userprofile: async function (req, res, next) {
		const logService = await sails.helpers.logtrackservice(req, "profile", req.user.id, "business");
		userData = await UsersRd.findOne({id: req.user["id"]});
		// userData = {
		// 	name: usersData.name,
		// 	pic: usersData.pic
		// },
		let condition = {
			userid: req.user["id"]
		};
		if (req.user.usertype == "CA") condition.is_ca_business = 1;
		if (req.user.usertype == "Bank"){
			lender_id = req.user.lender_id !== null ? req.user.lender_id : 0;
			parent_id = req.user.parent_id !== null ? req.user.parent_id : 0;
			userData.reporting_manager_data = await sails.helpers.userRole(parent_id, lender_id); 
		} 
		profile = await BusinessRd.find(condition)
			.populate("businesstype")
			.populate("business_address", {
				limit: 1
			})
			.exec(async (err, list) => {
				if (err) {
					return Error("Error");
				} else {
					if (list == "" || list == null) {
						const profileupdate = [
							{
								id: null,
								businessname: req.user["cacompname"],
								businesspancardnumber: req.user["capancard"],
								business_email: req.user["email"],
								contactno: req.user["contact"],
								gstin: null,
								businessstartdate: null,
								businesstype: null,
								business_address: [
									{
										id: null,
										line1: req.user["address1"],
										line2: req.user["address2"],
										locality: req.user["locality"],
										city: req.user["city"],
										state: req.user["state"],
										pincode: req.user["pincode"]
									}
								],
								user: userData
							}
						];
						return res.send({
							status: "ok",
							data: profileupdate
						});
					} else {
						list[0].user = userData;
						return res.send({
							status: "ok",
							data: list
						});
					}
				}
			});
	},
	/**
   * User Profile update for a given parameters
   * @description :: User Profile upload details  by given  parameters
   * @api {POST} /profile/ update or insert profile
   * @apiName Update profile
   * @apiGroup User Profile
   * @apiExample Example usage:
   * curl -i http://localhost:1337/profile/
   *
   * @apiParam {String} businessName Business Name.
   * @apiParam {String} businessPancardNumber PanCard Number.
   * @apiParam {String} businessPancardFdkey  PanCard Key file name(After upload get key value).
   * @apiParam {String} businessEmail Email.
   * @apiParam {String} contactNo Contact number.
   * @apiParam {String} gstin
   * @apiParam {String} businessStartDate Date.
   * @apiParam {String} businesstype Business Type.
   * @apiParam {String} Line1 Address 1.
   * @apiParam {String} Line2 Address 2.
   * @apiParam {String} locality Locality.
   * @apiParam {String} city City.
   * @apiParam {String} state State.
   * @apiParam {String} pincode Pincode.
   * @apiParam {Number} business_id business id.
   * @apiParam {Number} baid business address id.
   *
   * @apiSuccess {String} status ok.
   * @apiSuccess {String} message Updated Successfully.
   * @apiSuccess {String} message  Display message(if update : uploaded Successfully, if Insert: Data Inserted).
   * @apiSuccess {Object[]} data

   */

	profileupdate: async function (req, res) {
		let {
			businessname,
			first_name,
			last_name,
			businessPancardNumber,
			businessPancardFdkey,
			business_email,
			contactno,
			gstin,
			businessstartdate,
			businesstype,
			business_address,
			Line2,
			business_locality,
			business_city,
			business_state,
			business_pincode,
			aid,
			business_id,
			baid: b_add_id,
			origin
		} = req.allParams();
		
		datetime = await sails.helpers.dateTime();
		businessPancardNumber = businessPancardNumber || "NAMAS9948K";
		businessstartdate = businessstartdate || "9999-99-99";
		business_email = business_email || contactno + "@nc.com";
		params = {...req.allParams(), businessPancardNumber, businessstartdate, business_email};
		fields = [
			"businessname",	
			"businessPancardNumber",
			"business_email",
			"contactno",
			"businessstartdate",
			"businesstype",
			"business_address",
			"business_locality",
			"business_city",
			"business_state",
			"business_pincode"
		];
		missing = await reqParams.fn(params, fields);
		if (
			(!business_id || !b_add_id) &&
			(missing.length > 0)
		) {
			sails.config.res.missingFields.mandatoryFields = missing;
			return res.badRequest(sails.config.res.missingFields);
		}
		if (businessPancardNumber && businessPancardNumber !== "NAMAS9948K") {
			const pancard = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
			if (pancard.test(businessPancardNumber) == false) {
				return res.badRequest({
					status: "nok",
					exception: "Please enter valid Pan number"
				});
			} else {
				const pannumber = await PannoResponseRd.find({
					where: {panno: businessPancardNumber}
				});
				if (pannumber.length == 0) {
					await PannoResponse.create({
						panno: businessPancardNumber,
						pan_data_type: "Business",
						dt_created: datetime,
						ints: datetime
					});
				}
			}
		}
		if (business_pincode) {
			// pincode validation needs to come from DB, if it goes into another country then zipcode will fail for countries which don't follow this pattern
			const pin = /^[0-9]{6}$/;
			if (pin.test(business_pincode) == false) {
				return res.badRequest({
					status: "nok",
					exception: "Please enter valid pincode"
				});
			}
		}
		whitelabelid = req.user.loggedInWhiteLabelID;
		let wherecondition = {
			userid: req.user.id,
			is_ca_business: 1
		};
		if (origin && origin == "onboarding") {
			wherecondition = {
				businesstype,
				white_label_id: whitelabelid,
				businessname,
				userid: req.user.id,
				business_email
			};
		}
		userData = await UsersRd.findOne({id : req.user.id});
		if (req.user.usertype == "Bank"){
			lender_id = req.user.lender_id !== null ? req.user.lender_id : 0;
			parent_id = req.user.parent_id !== null ? req.user.parent_id : 0;
			userData.reporting_manager_data = await sails.helpers.userRole(parent_id, lender_id); 
		} 
		profile = await Business.find(wherecondition).populate("business_address").sort("id DESC").limit(1);
		let loanData;
		if (profile && profile.length > 0 && origin && origin == "onboarding") {
			loanData = await Loanrequest.find({business_id: profile[0].business_id}).limit(1);
		}
		let verification_data = {
			verified_on: datetime,
			email: business_email,
			status: "not verified"
		};
		if (!business_id && !b_add_id && (profile.length === 0 || loanData.length > 0)) {
			const insert = await Business.create({
				userid: req.user["id"],
				businessname,
				first_name: first_name || "",
				last_name: last_name || "",
				businesspancardnumber: businessPancardNumber || "NAMAS9948K",
				business_email,
				contactno,
				gstin: gstin || null,
				businessstartdate: businessstartdate || datetime,
				businesstype: businesstype,
				empcount: "0",
				is_ca_business: req.user.usertype == "CA" ? 1 : 0,
				ints: datetime,
				businessindustry: "20",
				pancard_url: businessPancardFdkey || null,
				white_label_id: whitelabelid,
				email_verification: JSON.stringify(verification_data)
			}).fetch();

			if (insert) {
				const insertbaddress = await Businessaddress.create({
					bid: insert.id,
					aid: aid || "1",
					line1: business_address,
					line2: Line2,
					locality: business_locality,
					city: business_city,
					state: business_state,
					pincode: business_pincode,
					ints: datetime,
					address_status: "owned"
				}).fetch();
				let newProfile = await Business.find({id: insert.id})
					.populate("businesstype")
					.populate("business_address", {
						limit: 1
					});

				if (newProfile.length == 0) {
					(b_profile = []), (address = []);
					if (insertbaddress) {
						address.push(insertbaddress);
					}
					insert.business_address = address;
					b_profile.push(insert);
					newProfile = b_profile;
					newProfile.user = userData;
				}
				if (
					newProfile.length > 0 &&
					newProfile[0].businessname &&
					newProfile[0].business_email &&
					newProfile[0].contactno &&
					newProfile[0].businesstype &&
					newProfile[0].businessstartdate &&
					newProfile[0].businesspancardnumber &&
					newProfile[0].gstin &&
					newProfile[0].business_address
				) {
					updatedUsers = await Users.update({id: req.user["id"]}).set({profile_completion: 3}).fetch();
				}
				return res.send({
					status: "ok",
					message: "new data created ",
					data: newProfile
				});
			} else {
				return res.badRequest({
					status: "nok",
					message: "There is some error in profile creation. Please try again!"
				});
			}
		} else {
			let b_id, b_aid;
			if (origin !== "onboarding") {
				b_id = await Business.findOne({id: business_id, userid: req.user["id"]});
				b_aid = await Businessaddress.findOne({id: b_add_id, bid: business_id});
			} else {
				b_id = await Business.findOne({id: business_id});
				b_aid = await Businessaddress.findOne({id: b_add_id, bid: business_id});
			}
			if (!b_id) {
				return res.badRequest({
					status: "nok",
					message: "Wrong business id OR Not allowed to update for this user."
				});
			}
			if (!b_aid) {
				return res.badRequest({
					status: "nok",
					message: "business id and business addres id are not exist."
				});
			}
			const updaterecord = await Business.update({id: b_id.id}).set({
					businessname,
					businesspancardnumber: businessPancardNumber,
					business_email,
					contactno,
					gstin,
					businessstartdate,
					businesstype,
					pancard_url: businessPancardFdkey || null,
					email_verification: JSON.stringify(verification_data)
				}),
				updaterecord1 = await Businessaddress.update({id: b_aid.id}).set({
					line1: business_address,
					line2: Line2,
					locality: business_locality,
					city: business_city,
					state: business_state,
					pincode: business_pincode,
				}),
				updatedProfile = await Business.find({id: b_id.id})
					.populate("businesstype")
					.populate("userid")
					.populate("business_address", {
						where: {id: b_aid.id},
						limit: 1
					});
				updatedProfile[0].user = userData;
			if (
				updatedProfile.length > 0 &&
				updatedProfile[0].businessname &&
				updatedProfile[0].business_email &&
				updatedProfile[0].contactno &&
				updatedProfile[0].businesstype &&
				updatedProfile[0].businessstartdate &&
				updatedProfile[0].businesspancardnumber &&
				updatedProfile[0].gstin &&
				updatedProfile[0].business_address
			) {
				updatedUsers = await Users.update({id: req.user["id"]}).set({profile_completion: 3}).fetch();
			}
			return res.send({
				status: "ok",
				message: "updated successfully",
				data: updatedProfile
			});
		}
	}
};
