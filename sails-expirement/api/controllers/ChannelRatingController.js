/**
 * ChannelRatingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
/**
 * @description :: channel rating
 * @api {post} /channel-rating channel Rating
 * @apiName Channel Rating
 * @apiGroup Channel Type
 * @apiExample Example usage:
 * curl -i localhost:1337/channel-rating
 *
 * @apiSuccess {String} status ok.
 * @apiSuccess {String} message data inserted successfully.
 * @apiSuccess {Object[]} insertedData craeted data list
 * @apiSuccess {Object[]} updatedData updated data list
 */

module.exports = {
	channel_rating: async function (req, res) {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			datetime = await sails.helpers.dateTime(),
			updatedData = [],
			resultArray = [],
			usersQuery =
				"select distinct u.userid from users u join business b on u.userid=b.userid join loanrequest l on  b.businessid=l.business_id join loan_bank_mapping lbm on l.loanid=lbm.loan_id  join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id where u.usertype='CA' and lbm.loan_bank_status=12 and lbm.loan_borrower_status=12 and lbm.lender_status_id in (16,17) and RequestDate >='20200101'";
		console.log("nativeResult--------", nativeResult);
		nativeResult = await myDBStore.sendNativeQuery(usersQuery);
		const users = nativeResult.rows;
		Promise.all(
			users.map(async (usersList) => {
				usersList.channel_id = usersList.userid;
				usersList.application_count = 0;
				usersList.lender_assign_count = 0;
				usersList.disbursed_count = 0;
				usersList.disbursed_amount = 0;
				// const count_query_1 =
				// 	"select a.userid,count(distinct a.loan_ref_id) as Application_Count from (select u.userid,u.name,u.usertype,date(RequestDate) as request_date,loanid, loan_ref_id,loan_status_id,loan_sub_status_id,lbm.loan_bank_status,lbm.loan_borrower_status,lbm.bank_id,lbm.lender_status_id,loan_product_id,ld.disbursementId,round(( case when ld.disbursement_amt_um='Crores' then (ld.disbursement_amt*100) else ld.disbursement_amt end),3) as amt,ld.disbursement_date from users u join business b on u.userid=b.userid join loanrequest l on  b.businessid=l.business_id left join loan_bank_mapping lbm on l.loanid=lbm.loan_id left join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id where u.usertype='CA' and l.createdUserId = " +
				// 	usersList.userid +
				// 	" and RequestDate BETWEEN (NOW() - INTERVAL 90 DAY) AND NOW()  and l.loanId in (select distinct loan_id from loan_document ld join doctype dt where ld.doc_type_id=dt.doc_type_id and (dt.priority='100' or ld.doc_type_id in (6,37) )  and ints BETWEEN (NOW() - INTERVAL 90 DAY) AND NOW())) as a group by 1";
				const count_query_1 =
					"select a.userid,a.loanId, count(case when a.loan_bank_status=9 and a.loan_borrower_status=2 then a.loan_ref_id end) as LenderAssigned, count(case when a.loan_bank_status=12 and a.loan_borrower_status=12 and a.lender_status_id in (16,17) then a.disbursementId end) as Disbursement_Count, sum(case when a.loan_bank_status=12 and a.loan_borrower_status=12 and a.lender_status_id in (16,17) then a.amt end) as Disbursement_Amount from (select u.userid,u.name,u.usertype,date(RequestDate) as request_date,loanid, loan_ref_id,loan_status_id,loan_sub_status_id,lbm.loan_bank_status,lbm.loan_borrower_status,lbm.bank_id,lbm.lender_status_id,loan_product_id,ld.disbursementId, round(( case when ld.disbursement_amt_um='Crores' then (ld.disbursement_amt*100) else ld.disbursement_amt end),3) as amt,ld.disbursement_date from users u join business b on u.userid=b.userid join loanrequest l on  b.businessid=l.business_id left join loan_bank_mapping lbm on l.loanid=lbm.loan_id left join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id where u.usertype='CA'and l.createdUserId = " +
					usersList.userid +
					"and RequestDate BETWEEN (NOW() - INTERVAL 180 DAY) AND NOW() ) as a group by 1";
				console.log("count_query_1---------", count_query_1);
				nativeResult = await myDBStore.sendNativeQuery(count_query_1);
				const count_data_1 = nativeResult.rows;
				console.log("count_data_1---------", count_data_1);
				console.log("#################", count_data_1.length > 0);
				if (count_data_1.length > 0) {
					usersList.application_count = count_data_1[0].Application_Count;
				}
				const count_query_2 =
					"select a.userid,a.loanId, count(case when a.loan_bank_status=9 and a.loan_borrower_status=2 then a.loan_ref_id end) as LenderAssigned, count(case when a.loan_bank_status=12 and a.loan_borrower_status=12 and a.lender_status_id in (16,17) then a.disbursementId end) as Disbursement_Count, sum(case when a.loan_bank_status=12 and a.loan_borrower_status=12 and a.lender_status_id in (16,17) then a.amt end) as Disbursement_Amount from (select u.userid,u.name,u.usertype,date(RequestDate) as request_date,loanid, loan_ref_id,loan_status_id,loan_sub_status_id,lbm.loan_bank_status,lbm.loan_borrower_status,lbm.bank_id,lbm.lender_status_id,loan_product_id,ld.disbursementId, round(( case when ld.disbursement_amt_um='Crores' then (ld.disbursement_amt*100) else ld.disbursement_amt end),3) as amt,ld.disbursement_date from users u join business b on u.userid=b.userid join loanrequest l on  b.businessid=l.business_id left join loan_bank_mapping lbm on l.loanid=lbm.loan_id left join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id where u.usertype='CA'and l.createdUserId = " +
					usersList.userid +
					"and RequestDate BETWEEN (NOW() - INTERVAL 180 DAY) AND NOW() ) as a group by 1";
				console.log("count_query_2-----", count_query_2);
				nativeResult = await myDBStore.sendNativeQuery(count_query_2);
				console.log("nativeResult@@@@@", nativeResult);
				const count_data_2 = nativeResult.rows;
				console.log("count_data_2+++++++", count_data_2);
				console.log("count_data_2.length > 0**********", count_data_2.length > 0);
				if (count_data_2.length > 0) {
					usersList.lender_assign_count = count_data_2[0].LenderAssigned + count_data_2[0].Disbursement_Count;
					usersList.disbursed_count = count_data_2[0].Disbursement_Count;
					usersList.disbursed_amount = count_data_2[0].Disbursement_Amount;
				}
				usersList.application_points = 0;
				usersList.lender_assign_points = 0;
				usersList.disbursed_points = 0;
				usersList.disbursed_volume_points = 0;
				console.log("usersList.application_count=======", usersList.application_count);
				if (usersList.application_count) {
					usersList.application_points = await sails.helpers.channelratingPoints(
						sails.config.channel_status.appliction,
						usersList.application_count
					);
				}
				console.log(
					"usersList.lender_assign_count && usersList.lender_assign_count != 0",
					usersList.lender_assign_count && usersList.lender_assign_count != 0,
					"usersList.lender_assign_count------",
					usersList.lender_assign_count != 0,
					"usersList.lender_assign_count != 0",
					usersList.lender_assign_count != 0
				);
				if (usersList.lender_assign_count && usersList.lender_assign_count != 0) {
					usersList.lender_assign_points = await sails.helpers.channelratingPoints(
						sails.config.channel_status.lenderAssign,
						usersList.lender_assign_count
					);
				}
				console.log(
					"usersList.disbursed_count && usersList.disbursed_count != 0",
					usersList.disbursed_count && usersList.disbursed_count != 0,
					"usersList.disbursed_count------",
					usersList.disbursed_count,
					"usersList.disbursed_count != 0",
					usersList.disbursed_count != 0
				);
				if (usersList.disbursed_count && usersList.disbursed_count != 0) {
					usersList.disbursed_points = await sails.helpers.channelratingPoints(
						sails.config.channel_status.disburseCount,
						usersList.disbursed_count
					);
				}
				console.log("usersList.disbursed_amount-------", usersList.disbursed_amount);
				if (usersList.disbursed_amount) {
					usersList.disbursed_volume_points = await sails.helpers.channelratingPoints(
						sails.config.channel_status.disburseVolume,
						usersList.disbursed_amount
					);
				}
				usersList.channel_rating =
					usersList.application_points +
					usersList.lender_assign_points +
					usersList.disbursed_points +
					usersList.disbursed_volume_points;
				const channel_points = await ChannelRatingReferenceRd.findOne({
					min_value: {"<=": usersList.channel_rating},
					max_value: {">=": usersList.channel_rating}
				});
				usersList.rating_type = channel_points.id;
				console.log("channel_points", channel_points);
				console.log("usersList.rating_type", usersList.rating_type);
			})
		)
			.then(async () => {
				let channelRatingArray = [];
				for (let i = 0; i < users.length; i++) {
					const data = {
							application_count: users[i].application_count,
							lender_assign_count: users[i].lender_assign_count,
							disbursed_count: users[i].disbursed_count,
							application_disbursed_amount: users[i].disbursed_amount,
							application_points: users[i].application_points,
							lender_assign_points: users[i].lender_assign_points,
							disbursed_points: users[i].disbursed_points,
							disbursed_volume_points: users[i].disbursed_volume_points
						},
						fetchChannelData = await ChannelRatingRd.find({
							channel_id: users[i].userid,
							rating_type: users[i].rating_type
						})
							.sort([({created_On: "DESC"}, {updated_On: "DESC"})])
							.limit(1);
					console.log("data------", data);
					console.log("fetchChannelData------", fetchChannelData);
					if (fetchChannelData.length > 0) {
						if (
							data.application_count !== fetchChannelData[0].application_count ||
							data.lender_assign_count !== fetchChannelData[0].lender_assign_count ||
							data.disbursed_count !== fetchChannelData[0].disbursed_count ||
							data.application_disbursed_amount !== fetchChannelData[0].application_disbursed_amount
						) {
							data.updated_On = datetime;
							await ChannelRating.update({
								id: fetchChannelData[0].id,
								channel_id: users[i].userid,
								rating_type: users[i].rating_type
							})
								.set(data)
								.fetch()
								.then((updateData) => {
									updatedData.push(updateData);
								});
						}
					} else {
						data.channel_id = users[i].userid;
						data.channel_rating = users[i].channel_rating;
						data.rating_type = users[i].rating_type;
						data.created_On = datetime;
						channelRatingArray.push(data);
					}
				}
				await ChannelRating.createEach(channelRatingArray)
					.fetch()
					.then((result) => {
						resultArray.push(result); // should be resultArray = result. To Check*
					});

				return res.ok({
					status: "ok",
					message: sails.config.msgConstants.successfulInsertion,
					insertedData: resultArray,
					updatedData: updatedData
				});
			})
			.catch((err) => {
				return res.badRequest({
					status: "nok",
					message: "error" + err
				});
			});
	},
	/**
	 * @description :: channel rating data
	 * @api {get} /channel_data channel Rating data
	 * @apiName Channel Rating data
	 * @apiGroup Channel Type
	 * @apiExample Example usage:
	 * curl -i localhost:1337/channel_data
	 *
	 * @apiSuccess {String} status ok.
	 * @apiSuccess {String} userName
	 * @apiSuccess {Object[]} data
	 * @apiSuccess {Number} data.id
	 * @apiSuccess {Number} data.channel_id
	 * @apiSuccess {String} data.channel_rating
	 * @apiSuccess {Number} data.application_count
	 * @apiSuccess {Number} data.lender_assign_count
	 * @apiSuccess {Number} data.disbursed_count
	 * @apiSuccess {Number} data.application_points
	 * @apiSuccess {Number} data.lender_assign_points
	 * @apiSuccess {Number} data.disbursed_points
	 * @apiSuccess {Number} data.application_amount
	 * @apiSuccess {Number} data.lender_assign_amount
	 * @apiSuccess {Number} data.application_disbursed_amount
	 * @apiSuccess {Number} data.total_llc_confirmed
	 * @apiSuccess {String} data.created_On
	 * @apiSuccess {String} data.updated_On
	 * @apiSuccess {Object} data.rating_type
	 * @apiSuccess {Number} data.rating_type.id
	 * @apiSuccess {Number} data.rating_type.min_value
	 * @apiSuccess {Number} data.rating_type.max_value
	 * @apiSuccess {String} data.rating_type.rating_type
	 * @apiSuccess {String} data.current_rating_type
	 * @apiSuccess {Object} data.nextlevel
	 * @apiSuccess {Number} data.nextlevel.application_count
	 * @apiSuccess {Number} data.nextlevel.lender_assign_count
	 * @apiSuccess {Number} data.nextlevel.disbursed_count
	 * @apiSuccess {String} data.nextlevel.rating_type
	 * @apiSuccess {Number} data.nextlevel.points

	 */
	channel_data: async function (req, res) {
		const userid = req.user.id,
			date = new Date();
		date.setMonth(date.getMonth() - 3);
		const res_data = {};
		if (req.user.usertype == sails.config.usersdata.CA_user) {
			const userdata = await UsersRd.findOne({id: userid});
			res_data.userName = userdata.name;
			const channel_rating_data = await ChannelRatingRd.find({
				channel_id: userid,
				created_On: {">=": date}
			})
				.sort("created_On DESC")
				.populate("rating_type");
			if (channel_rating_data.length > 0) {
				const item = [];
				channel_rating_data.forEach((Element) => {
					const i = itemRd.findIndex((x) => x.created_On.getMonth() + 1 == Element.created_On.getMonth() + 1);
					if (i <= -1) {
						item.push(Element);
					}
				});
				res_data.channelData = item;
				data = {
					application_count: channel_rating_data[0].application_count,
					lender_assign_count: channel_rating_data[0].lender_assign_count,
					disbursed_count: channel_rating_data[0].disbursed_count,
					rating_type: channel_rating_data[0].rating_type.rating_type
				};

				if (channel_rating_data[0].rating_type.id !== 4) {
					while (channel_rating_data[0].rating_type.rating_type == data.rating_type) {
						data.application_count = data.application_count + 1;
						data.lender_assign_count = data.lender_assign_count + 1;
						data.disbursed_count = data.disbursed_count + 1;

						const application_points = await sails.helpers.channelratingPoints(
								sails.config.channel_status.appliction,
								data.application_count
							),
							lender_points = await sails.helpers.channelratingPoints(
								sails.config.channel_status.lenderAssign,
								data.lender_assign_count
							),
							disburse_points = await sails.helpers.channelratingPoints(
								sails.config.channel_status.disburseCount,
								data.disbursed_count
							);
						data.points =
							application_points +
							lender_points +
							disburse_points +
							channel_rating_data[0].disbursed_volume_points;

						const channel_points = await ChannelRatingReferenceRd.findOne({
							min_value: {"<=": data.points},
							max_value: {">=": data.points}
						});
						data.rating_type = channel_points.rating_type;
					}
					data.application_count = data.application_count - channel_rating_data[0].application_count;
					data.lender_assign_count = data.lender_assign_count - channel_rating_data[0].lender_assign_count;
					data.disbursed_count = data.disbursed_count - channel_rating_data[0].disbursed_count;
					res_data.current_rating_type = channel_rating_data[0].rating_type.rating_type;
					res_data.nextlevel = data;
				}
				return res.ok({
					status: "Ok",
					data: res_data
				});
			} else {
				res.badRequest({
					status: "nok",
					message: sails.config.msgConstants.noChannelDataForUser
				});
			}
		} else {
			res.badRequest({
				status: "nok",
				message: sail.config.msgConstants.channelDataOnlyForCA
			});
		}
	},

	fetch_channel_data: async function (req, res) {
		myDBStore = sails.getDatastore("mysql_namastecredit_read");
		const userid = req.user.id;
		let total_payout = 0;
		const payout_query =
			"select concat(a.loan_ref_id,'-',a.disbursementId) as NCID,a.*,b.payout_percentage,b.payout_value,b.tax,b.tds,b.date_of_invoice,b.invoice_no,b.net_payout from (select u.userid,u.name,l.requestDate as LoanCreationTime,l.loan_ref_id,u.usertype,ld.llc_status, lbm.loan_bank_mapping_id,ld.disbursementId,STR_TO_DATE(ld.disbursement_date, '%m/%d/%Y') as disbursement_date,ld.disbursement_amt, ld.disbursement_amt_um from users u join business b on u.userid=b.userid join loanrequest l on b.businessid=l.business_id join loan_bank_mapping lbm on l.loanid=lbm.loan_id join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id join loan_products lp on lp.id=l.loan_product_id join bank_master bm on lbm.bank_id=bm.bankid where u.usertype='CA' and l.createdUserId = " +
			userid +
			" and lbm.loan_bank_status=12 and lbm.loan_borrower_status=12 and lbm.lender_status_id in (16,17) and l.requestdate>=current_date()-90) as a left join (select disbursement_id,loan_bank_mapping_id,lender_id,payout_percentage,payout_value,tax,tds,date_of_invoice,invoice_no,net_payout from tbl_invoice_details) as b on a.disbursementId=b.disbursement_id and a.loan_bank_mapping_id=b.loan_bank_mapping_id ";

		nativeResult = await myDBStore.sendNativeQuery(payout_query);
		const payout_data = nativeResult.rows;
		payout_data.forEach((item) => {
			if (item.payout_value) {
				total_payout = Number(total_payout) + Number(item.payout_value);
			}
		});
		channel_rating = await ChannelRatingRd.find({channel_id: userid}).sort("created_On DESC");
		channel_rating[0].earned_payout = total_payout;
		channel_rating[0].userid = userid;
		channel_rating[0].userName = req.user.name;
		return res.ok({
			status: "ok",
			data: channel_rating[0]
		});

		// 	data = {},
		// 	myDBStore = sails.getDatastore("mysql_namastecredit_read");
		// let total_payout = 0;
		// const payout_query =
		// 	"select concat(a.loan_ref_id,'-',a.disbursementId) as NCID,a.*,b.payout_percentage,b.payout_value,b.tax,b.tds,b.date_of_invoice,b.invoice_no,b.net_payout from (select u.userid,u.name,l.requestDate as LoanCreationTime,l.loan_ref_id,u.usertype,ld.llc_status, lbm.loan_bank_mapping_id,ld.disbursementId,STR_TO_DATE(ld.disbursement_date, '%m/%d/%Y') as disbursement_date,ld.disbursement_amt, ld.disbursement_amt_um from users u join business b on u.userid=b.userid join loanrequest l on b.businessid=l.business_id join loan_bank_mapping lbm on l.loanid=lbm.loan_id join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id join loan_products lp on lp.id=l.loan_product_id join bank_master bm on lbm.bank_id=bm.bankid where u.usertype='CA' and l.createdUserId = " +
		// 	userid +
		// 	" and lbm.loan_bank_status=12 and lbm.loan_borrower_status=12 and lbm.lender_status_id in (16,17) and l.requestdate>=current_date()-180) as a left join (select disbursement_id,loan_bank_mapping_id,lender_id,payout_percentage,payout_value,tax,tds,date_of_invoice,invoice_no,net_payout from tbl_invoice_details) as b on a.disbursementId=b.disbursement_id and a.loan_bank_mapping_id=b.loan_bank_mapping_id ";

		// nativeResult = await myDBStore.sendNativeQuery(payout_query);
		// const payout_data = nativeResult.rows;
		// data.userid = userid;
		// data.userName = req.user.name;
		// payout_data.forEach((item) => {
		// 	if (item.payout_value) {
		// 		total_payout = Number(total_payout) + Number(item.payout_value);
		// 	}
		// });
		// data.earned_payout = total_payout;
		// data.rating_rewards = 0;
		// data.total_earnings = 0;
		// data.application_count = 0;
		// data.lender_assign_count = 0;
		// data.disbursed_count = 0;
		// data.disbursed_amount = 0;
		// // const count_query_1 =
		// // 	"select a.userid,count(distinct a.loan_ref_id) as Application_Count from (select u.userid,u.name,u.usertype,date(RequestDate) as request_date,loanid, loan_ref_id,loan_status_id,loan_sub_status_id,lbm.loan_bank_status,lbm.loan_borrower_status,lbm.bank_id,lbm.lender_status_id,loan_product_id,ld.disbursementId,round(( case when ld.disbursement_amt_um='Crores' then (ld.disbursement_amt*100) else ld.disbursement_amt end),3) as amt,ld.disbursement_date from users u join business b on u.userid=b.userid join loanrequest l on  b.businessid=l.business_id left join loan_bank_mapping lbm on l.loanid=lbm.loan_id left join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id where u.usertype='CA' and l.createdUserId = " +
		// // 	userid +
		// // 	" and RequestDate BETWEEN (NOW() - INTERVAL 180 DAY) AND NOW()  and l.loanId in (select distinct loan_id from loan_document ld join doctype dt where ld.doc_type_id=dt.doc_type_id and (dt.priority='100' or ld.doc_type_id in (6,37) )  and ints BETWEEN (NOW() - INTERVAL 90 DAY) AND NOW())) as a group by 1";
		// // nativeResult = await myDBStore.sendNativeQuery(count_query_1);
		// // const count_data_1 = nativeResult.rows;
		// // if (count_data_1.length > 0) {
		// // 	data.application_count = count_data_1[0].Application_Count;
		// // }
		// const count_query_2 =
		// 	"select a.userid,a.loanId, count(case when a.loan_bank_status=9 and a.loan_borrower_status=2 then a.loan_ref_id end) as LenderAssigned, count(case when a.loan_bank_status=12 and a.loan_borrower_status=12 and a.lender_status_id in (16,17) then a.disbursementId end) as Disbursement_Count, sum(case when a.loan_bank_status=12 and a.loan_borrower_status=12 and a.lender_status_id in (16,17) then a.amt end) as Disbursement_Amount from (select u.userid,u.name,u.usertype,date(RequestDate) as request_date,loanid, loan_ref_id,loan_status_id,loan_sub_status_id,lbm.loan_bank_status,lbm.loan_borrower_status,lbm.bank_id,lbm.lender_status_id,loan_product_id,ld.disbursementId, round(( case when ld.disbursement_amt_um='Crores' then (ld.disbursement_amt*100) else ld.disbursement_amt end),3) as amt,ld.disbursement_date from users u join business b on u.userid=b.userid join loanrequest l on  b.businessid=l.business_id left join loan_bank_mapping lbm on l.loanid=lbm.loan_id left join loan_disbursement ld on lbm.loan_bank_mapping_id=ld.loan_bank_mapping_id where u.usertype='CA' and l.createdUserId = " +
		// 	userid +
		// 	" and RequestDate BETWEEN (NOW() - INTERVAL 180 DAY) AND NOW() ) as a group by 1";
		// nativeResult = await myDBStore.sendNativeQuery(count_query_2);
		// const count_data_2 = nativeResult.rows;

		// if (count_data_2.length > 0) {
		// 	data.lender_assign_count = count_data_2[0].LenderAssigned + count_data_2[0].Disbursement_Count;
		// 	data.disbursed_count = count_data_2[0].Disbursement_Count;
		// 	data.disbursed_amount = count_data_2[0].Disbursement_Amount;
		// }
		// data.application_points = 0;
		// data.lender_points = 0;
		// data.disburse_points = 0;
		// data.disburse_volume_points = 0;
		// if (data.application_count) {
		// 	data.application_points = await sails.helpers.channelratingPoints(
		// 		sails.config.channel_status.appliction,
		// 		data.application_count
		// 	);
		// }
		// if (data.lender_assign_count && data.lender_assign_count != 0) {
		// 	data.lender_points = await sails.helpers.channelratingPoints(
		// 		sails.config.channel_status.lenderAssign,
		// 		data.lender_assign_count
		// 	);
		// }
		// if (data.disbursed_count && data.disbursed_count != 0) {
		// 	data.disburse_points = await sails.helpers.channelratingPoints(
		// 		sails.config.channel_status.disburseCount,
		// 		data.disbursed_count
		// 	);
		// }
		// if (data.disbursed_amount) {
		// 	data.disburse_volume_points = await sails.helpers.channelratingPoints(
		// 		sails.config.channel_status.disburseVolume,
		// 		data.disbursed_amount
		// 	);
		// }
		// data.total_rating_points =
		// 	data.daily       data.disburse_points + data.disburse_volume_points;
		// console.log("data.total_rating_points---------------------", data.total_rating_points);
		// const channel_points = await ChannelRatingReferenceRd.findOne({
		// 	min_value: {"<=": data.total_rating_points},
		// 	max_value: {">=": data.total_rating_points}
		// });
		// console.log("channel_points---------", channel_points);
		// data.rating_type = channel_points.rating_type;

		// function percentage(num, per) {
		// 	return (num / 100) * per;
		// }
		// const earning_potential = {};
		// earning_potential.Platinum = percentage(total_payout, 10);
		// earning_potential.Gold = percentage(total_payout, 5);
		// data.earning_potential = earning_potential;
		// if (data.rating_type == sails.config.ratingType.platinum) {
		// 	data.rating_rewards = earning_potential.Platinum;
		// }
		// if (data.rating_type == sails.config.ratingType.gold) {
		// 	data.rating_rewards = earning_potential.Gold;
		// }
		// data.total_earnings = data.earned_payout + data.rating_rewards;
		// data.rating_slab = await ChannelRatingReferenceRd.find();
		// const updateData = {
		// 		rating_type: data.rating_type
		// 	},
		// 	fetchChannelData = await ChannelRatingRd.find({
		// 		channel_id: data.userid,
		// 		rating_type: channel_points.id
		// 	})
		// 		.sort([({created_On: "DESC"}, {updated_On: "DESC"})])
		// 		.limit(1);

		// if (fetchChannelData.length > 0) {
		// 	if (
		// 		data.application_points !== fetchChannelData[0].application_points ||
		// 		data.lender_points !== fetchChannelData[0].lender_assign_points ||
		// 		data.disburse_points !== fetchChannelData[0].disbursed_points ||
		// 		data.disburse_volume_points !== fetchChannelData[0].disbursed_volume_points
		// 	) {
		// 		await ChannelRating.update({
		// 			id: fetchChannelData[0].id,
		// 			channel_id: data.userid,
		// 			rating_type: channel_points.id
		// 		})
		// 			.set({
		// 				application_count: data.application_count,
		// 				lender_assign_count: data.lender_assign_count,
		// 				disbursed_count: data.disbursed_count,
		// 				application_points: data.application_points,
		// 				lender_assign_points: data.lender_points,
		// 				disbursed_points: data.disburse_points,
		// 				application_disbursed_amount: data.disbursed_amount,
		// 				disbursed_volume_points: data.disburse_volume_points,
		// 				updated_On: await sails.helpers.dateTime()
		// 			})
		// 			.fetch();
		// 	}
		// } else {
		// 	await ChannelRating.create({
		// 		channel_id: userid,
		// 		channel_rating: data.total_rating_points,
		// 		application_count: data.application_count,
		// 		lender_assign_count: data.lender_assign_count,
		// 		disbursed_count: data.disbursed_count,
		// 		application_points: data.application_points,
		// 		lender_assign_points: data.lender_points,
		// 		disbursed_points: data.disburse_points,
		// 		application_disbursed_amount: data.disbursed_amount,
		// 		disbursed_volume_points: data.disburse_volume_points,
		// 		rating_type: channel_points.id,
		// 		created_On: await sails.helpers.dateTime()
		// 	});
		// }

		// nextData = {
		// 	application_count: data.application_count,
		// 	lender_assign_count: data.lender_assign_count,
		// 	disbursed_count: data.disbursed_count
		// };
		// if (channel_points.id != 4) {
		// 	while (data.rating_type == updateData.rating_type) {
		// 		nextData.application_count = nextData.application_count + 1;
		// 		nextData.lender_assign_count = nextData.lender_assign_count + 1;
		// 		nextData.disbursed_count = nextData.disbursed_count + 1;

		// 		const application_points = await sails.helpers.channelratingPoints(
		// 				sails.config.channel_status.appliction,
		// 				nextData.application_count
		// 			),
		// 			lender_points = await sails.helpers.channelratingPoints(
		// 				sails.config.channel_status.lenderAssign,
		// 				nextData.lender_assign_count
		// 			),
		// 			disburse_points = await sails.helpers.channelratingPoints(
		// 				sails.config.channel_status.disburseCount,
		// 				nextData.disbursed_count
		// 			);
		// 		nextData.points = application_points + lender_points + disburse_points + data.disburse_volume_points;

		// 		const channel_pointsval = await ChannelRatingReferenceRd.findOne({
		// 			min_value: {"<=": nextData.points},
		// 			max_value: {">=": nextData.points}
		// 		});
		// 		nextData.rating_type = channel_pointsval.rating_type;
		// 		updateData.rating_type = channel_pointsval.rating_type;
		// 	}
		// 	res_data = {
		// 		application_count: nextData.application_count - data.application_count,
		// 		lender_assign_count: nextData.lender_assign_count - data.lender_assign_count,
		// 		disbursed_count: nextData.disbursed_count - data.disbursed_count,
		// 		points: nextData.points,
		// 		rating_type: nextData.rating_type
		// 	};
		// 	data.nextlevel = res_data;
		// }
		// return res.ok({
		// 	status: "ok",
		// 	data: data
		// });
	}
};
