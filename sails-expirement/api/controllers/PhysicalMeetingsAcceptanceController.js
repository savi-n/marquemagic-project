/**
 * PhysicalMeetingsAcceptance
 *
 * @description :: Server-side logic for managing PhysicalMeetingsAcceptance
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	index: function (req, res, next) {
		PhysicalMeetingsAcceptanceRd.find().exec((err, list) => {
			if (err) {
				return Error("Error");
			}
			return res.view({
				result: list
			});
		});
	},

	show: function (req, res, next) {
		PhysicalMeetingsAcceptanceRd.findOneById(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	edit: function (req, res, next) {
		PhysicalMeetingsAcceptanceRd.findOne(req.param("id"), function Founded(err, value) {
			if (err) {
				return next(err);
			}
			res.view({
				element: value
			});
		});
	},

	update: function (req, res, next) {
		PhysicalMeetingsAcceptance.update(req.param("id"), req.body, function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("physicalMeetingsAcceptance/show/" + req.param("id"));
		});
	},

	delete: function (req, res, next) {
		PhysicalMeetingsAcceptance.destroy(req.param("id"), function Update(err, value) {
			if (err) {
				return next(err);
			}
			return res.redirect("/physicalMeetingsAcceptance");
		});
	},

	/**
   `  * @description :: Borrower meetings schedule
	  * @api {post} /meetingSchedule/ Meeting schedule
	  * @apiName Borrower meeting schedule
	  * @apiGroup Meeting Schedule
	  * @apiExample Example usage:
	  * curl -i localhost:1337/meetingSchedule
	  * @apiDescription <b>Note :- meeting_timeslot is an array of string as shown here
			"meeting_timeslot": [
							"2019-08-29 10:10:45",
							"2019-08-28 2:15:56",
							"2019-08-30 3:00:00"
						]</b>
	  * @apiParam {Number} loan_bank_mapping_id loan bank mapping id.
	  * @apiParam {Number} loan_id loan id.
	  * @apiParam {String[]} meeting_timeslot meeting time slots.
	  * @apiParam {String} meeting_location meeting location.
	  *
	  * @apiSuccess {String} status ok.
	  * @apiSuccess {String} message Created successfully.
	  * @apiSuccess {Object[]} data
	  * @apiSuccess {Number} data.id meetings acceptance id.
	  * @apiSuccess {Number} data.loan_id loan id.
	  * @apiSuccess {Number} data.borrower_user_id borrower user id.
	  * @apiSuccess {Number} data.bank_id bank id.
	  * @apiSuccess {Number} data.bank_emp_id bank employee id.
	  * @apiSuccess {Number} data.meeting_type_id meeting type id.
	  * @apiSuccess {String} data.remarks remarks.
	  * @apiSuccess {String} data.meeting_timeslot meeting time slots.
	  * @apiSuccess {Number} data.slot_id slot id.
	  * @apiSuccess {String} data.meeting_location meeting location.
	  * @apiSuccess {String} data.ints created date and time.
	  * @apiSuccess {String} data.upts updated date and time.
	  * @apiSuccess {String} data.status meeting status [status : initiated].
	  * @apiSuccess {Object} data.loan_bank_mapping loan bank mapping details.

	  *
	**/
	meetingSchedule: async function (req, res) {
		const meeting_timeslot = req.body.meeting_timeslot,
			meeting_location = req.body.meeting_location,
			loan_bank_mapping_id = req.body.loan_bank_mapping_id,
			loan_id = req.body.loan_id,
			array = [];
		let meetingschedule_create = "";
		const datetime = await sails.helpers.dateTime();
		if (loan_bank_mapping_id && loan_id) {
			const loanBankMappingDetails = await LoanBankMappingRd.findOne({
				id: loan_bank_mapping_id,
				loan_id: loan_id
			});

			if (
				loanBankMappingDetails &&
				loanBankMappingDetails.loan_bank_status == 12 &&
				loanBankMappingDetails.loan_borrower_status == 10
			) {
				data = {
					loan_id: loan_id,
					bank_id: loanBankMappingDetails.bank_id,
					bank_emp_id: loanBankMappingDetails.bank_emp_id,
					meeting_location: meeting_location,
					ints: datetime,
					upts: datetime,
					status: "initiated"
				};
				if (meeting_timeslot && meeting_location) {
					const meetingSchedule_details_1 = await PhysicalMeetingsAcceptanceRd.find({
						loan_bank_mapping: loan_bank_mapping_id,
						loan_id: loan_id
					});
					let meetingFlag, meetingTypeId;
					if (
						meetingSchedule_details_1 == undefined ||
						meetingSchedule_details_1 == null ||
						meetingSchedule_details_1 == ""
					) {
						meetingFlag = 1;
						meetingTypeId = 1;
						borrower_user_id = req.user["id"];
					} else {
						meetingFlag = 2;
						meetingTypeId = 2;
						borrower_user_id = meetingSchedule_details_1[0].borrower_user_id;
					}
					data.borrower_user_id = borrower_user_id;
					data.meeting_type_id = meetingTypeId;

					let slot = 0;
					//let meetingScheduleArray = [];
					for (let i = 0; i < meeting_timeslot.length; i++) {
						slot = slot + 1;
						data["slot_id"] = slot;
						data["meeting_timeslot"] = meeting_timeslot[i];
						data["loan_bank_mapping"] = loan_bank_mapping_id;
						meetingschedule_create = await PhysicalMeetingsAcceptance.create(data).fetch();
						//meetingScheduleArray.push(data);
					}
					//meetingschedule_create = await PhysicalMeetingsAcceptance.createEach(data).fetch();
					const loanbankmapping = await LoanBankMapping.update({
						id: loan_bank_mapping_id,
						loan_id: loan_id
					}).set({meeting_flag: meetingFlag, notification_status: "yes"}),
						meetingSchedule_details = await PhysicalMeetingsAcceptanceRd.find({
							loan_bank_mapping: loan_bank_mapping_id,
							loan_id: loan_id,
							meeting_type_id: meetingTypeId
						}).populate("loan_bank_mapping"),
						logService = await sails.helpers.logtrackservice(
							req,
							"meetingSchedule",
							meetingschedule_create.id,
							"physical_meetings_acceptance"
						);
					return res.ok({
						status: "ok",
						message: sails.config.msgConstants.meetingScheduled,
						data: meetingSchedule_details
					});
				} else {
					return res.badRequest({
						status: "nok",
						exception: sails.config.msgConstants.invalidParameters,
						message: sails.config.msgConstants.mandatoryFieldsMissing
					});
				}
			} else {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.loanIdLoanBankMappingMismatch
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				message: sails.config.msgConstants.mandatoryFieldsMissing
			});
		}
	},

	/**
   `  * @description :: Lender accept meetings schedule
	  * @api {post} /acceptMeeting/ Accept meeting schedule
	  * @apiName Accept meeting schedule
	  * @apiGroup Meeting Schedule
	  * @apiExample Example usage:
	  * curl -i localhost:1337/acceptMeeting
	  *
	  * * @apiDescription <b>Note :- lender_accept is string as shown here
			"lender_accept": "ACCEPT"</b>
	  * @apiParam {Number} meeting_id meeting id.
	  * @apiParam {Number} loan_bank_mapping_id loan bank mapping id.
	  * @apiParam {Number} loan_id loan id.
	  * @apiParam {String} lender_accept status.
	  *
	  * @apiSuccess {String} status ok.
	  * @apiSuccess {String} message Meeting schedule accepted.
	  * @apiSuccess {Object[]} data
	  * @apiSuccess {Number} data.id meetings acceptance id.
	  * @apiSuccess {Number} data.loan_id loan id.
	  * @apiSuccess {Number} data.borrower_user_id borrower user id.
	  * @apiSuccess {Number} data.bank_id bank id.
	  * @apiSuccess {Number} data.bank_emp_id bank employee id.
	  * @apiSuccess {Number} data.meeting_type_id meeting type id.
	  * @apiSuccess {String} data.remarks remarks.
	  * @apiSuccess {String} data.meeting_timeslot meeting time slots.
	  * @apiSuccess {Number} data.slot_id slot id.
	  * @apiSuccess {String} data.meeting_location meeting location.
	  * @apiSuccess {String} data.ints created date and time.
	  * @apiSuccess {String} data.upts updated date and time.
	  * @apiSuccess {String} data.status meeting status [status : initiated, accepted, declained].
	  * @apiSuccess {Object} data.loan_bank_mapping loan bank mapping details.
	  *
 **/
	acceptMeeting: async function (req, res) {
		const meeting_id = req.body.meeting_id,
			loan_bank_mapping_id = req.body.loan_bank_mapping_id,
			loan_id = req.body.loan_id,
			lender_accept = req.body.lender_accept;
		if (meeting_id && loan_bank_mapping_id && loan_id) {
			const meetings_details = await PhysicalMeetingsAcceptanceRd.findOne({
				id: meeting_id,
				loan_bank_mapping: loan_bank_mapping_id,
				loan_id: loan_id
			});
			if (meetings_details) {
				const meetings_update_1 = await PhysicalMeetingsAcceptance.update({
					loan_bank_mapping: loan_bank_mapping_id,
					loan_id: loan_id
				}).set({status: "declined"});

				if (lender_accept == "ACCEPT") {
					var meetings_update = await PhysicalMeetingsAcceptance.update({
						id: meeting_id
					})
						.set({status: "accepted"})
						.fetch();
				} else {
					return res.badRequest({
						status: "nok",
						message: sails.config.msgConstants.wrongStatus
					});
				}
				if (meetings_update) {
					var meetingsAccept_details = await PhysicalMeetingsAcceptanceRd.find({
						loan_bank_mapping: loan_bank_mapping_id,
						loan_id: loan_id,
						meeting_type_id: meetings_details.meeting_type_id
					}).populate("loan_bank_mapping");
				}
				const logService = await sails.helpers.logtrackservice(
					req,
					"acceptMeeting",
					meetings_update[0].id,
					"physical_meetings_acceptance"
				);
				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.meetingScheduleAccepted,
					data: meetingsAccept_details
				});
			} else {
				return res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.loanIdLoanBankMappingMismatch
				});
			}
		} else {
			return res.badRequest({
				status: "nok",
				exception: sails.config.msgConstants.invalidParameters,
				message: sails.config.msgConstants.mandatoryFieldsMissing
			});
		}
	}
};
