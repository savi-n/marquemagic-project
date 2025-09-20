/**
 * SalesDashboardController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {sales_user_list} = require("./UsersController");

module.exports = {
	/**
	 * @api {post} /salesDashboard/ sales-Dashboard
	 * @apiName salesdashboard
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/salesDashboard
	 *
	 * @apiParam {Date} start_date startDate(2020-01-02)
	 * @apiParam {Date} end_date endDate(2020-01-02)
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message dashboard data
	 * @apiSuccess {Object} llc
	 * @apiSuccess {Number} llc.caseCount total casecount
	 * @apiSuccess {Number} llc.disbursementAmt total disbursement amount
	 * @apiSuccess {Object[]} caseStatus
	 * @apiSuccess {Object} revenue
	 * @apiSuccess {Number} revenue.lenderPayout lenderpayout%
	 * @apiSuccess {Number} revenue.channelPayout channelPayout%
	 * @apiSuccess {Number} revenue.netRevenue   net-revenue amt
	 */
	salesHomeScreen: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			startDate = req.param("start_date"),
			endDate = req.param("end_date");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const obj = {};
		let llcQuery, sub_sub_children, sub_children, children, revenueQueryPart, revenueRes, llcRes;
		const salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString();
		if (startDate && endDate) {
			llcQuery = `and date between ${startDate} and ${endDate}`;
			revenueQueryPart = `and disbursement_date between ${startDate} and ${endDate}`;
		} else {
			llcQuery = "";
			revenueQueryPart = "";
		}

		getllcData = async (userid, sqlPart) => {
			const llcCaseCount = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where userid in(${userid}) and llc_status="Confirmed" ${sqlPart}`;
			nativeResult = await myDBStore.sendNativeQuery(llcCaseCount);
			const llcResult = nativeResult.rows,
				llcData = {
					caseCount: llcResult[0].caseCount,
					disbursementAmt: llcResult[0].amount === null ? 0 : llcResult[0].amount
				};
			return llcData;
		};

		getRevenueData = async (userid, sqlPart) => {
			const revenueQuery = `select round(sum(case when id is not NULL and ChannelNetPayable is not NULL then LenderPayout end),2) as lenderPercent, round(sum(case when id is not NULL then ChannelNetPayable end),2) as channelPercent,
      round(sum(case when id is not NULL then NC_Revenue end),2) as revenue FROM namastecredit.sales_dashboard_revenue where userid in (${userid}) ${sqlPart}`;
			nativeResult = await myDBStore.sendNativeQuery(revenueQuery);
			const revenueResult = nativeResult.rows,
				revenueData = {
					lenderPayout: revenueResult[0].lenderPercent === null ? 0 : revenueResult[0].lenderPercent,
					channelPayout: revenueResult[0].channelPercent === null ? 0 : revenueResult[0].channelPercent,
					netRevenue: revenueResult[0].revenue === null ? 0 : revenueResult[0].revenue
				};
			return revenueData;
		};

		getLenderToPay = async (userid, sqlPart) => {
			const llcCaseCount = `select round(sum(case when id is not NULL and ChannelNetPayable is  NULL then LenderPayout end),2) as lenderPercent,null as channelPercent,
      round(sum(case when id is not NULL and ChannelNetPayable is  NULL then LenderPayout end),2) as revenue
      FROM namastecredit.sales_dashboard_revenue where userid in (${userid}) ${sqlPart}`;
			nativeResult = await myDBStore.sendNativeQuery(llcCaseCount);
			const lenderResult = nativeResult.rows,
				lenderData = {
					lenderPercent: lenderResult[0].lenderPercent === null ? 0 : lenderResult[0].lenderPercent,
					channelPercent: lenderResult[0].channelPercent === null ? 0 : lenderResult[0].channelPercent,
					revenue: lenderResult[0].revenue === null ? 0 : lenderResult[0].revenue
				};
			return lenderData;
		};

		getChannelPay = async (userid, sqlPart) => {
			const llcCaseCount = `select round(sum(case when id is  NULL then LenderPayout end),2) as lenderPercent, round(sum(case when id is  NULL and AmountPaid_Channel >=0 then ChannelNetPayable end),2) as channelPercent,
      concat('-',round(sum(case when id is  NULL and AmountPaid_Channel >=0 then ChannelNetPayable end),2)) as revenue FROM namastecredit.sales_dashboard_revenue where userid in (${userid}) ${sqlPart}`;
			nativeResult = await myDBStore.sendNativeQuery(llcCaseCount);
			const channelResult = nativeResult.rows,
				channelData = {
					lenderPercent: channelResult[0].lenderPercent === null ? 0 : channelResult[0].lenderPercent,
					channelPercent: channelResult[0].channelPercent === null ? 0 : channelResult[0].channelPercent,
					revenue: channelResult[0].revenue === null ? 0 : channelResult[0].revenue
				};
			return channelData;
		};
		const llcPromise = new Promise((resolve, reject) => {
			getllcData(salesChildIds, llcQuery).then((res) => {
				obj["llc"] = res;
			});
		}),
			revenuePromise = new Promise((resolve, reject) => {
				getRevenueData(salesChildIds, revenueQueryPart).then((res) => {
					obj["revenue"] = res;
				});
			}),
			lenderPromise = new Promise((resolve, reject) => {
				getLenderToPay(salesChildIds, revenueQueryPart).then((res) => {
					obj["lenderToPay"] = res;
				});
			}),
			channelPromise = new Promise((resolve, reject) => {
				getChannelPay(salesChildIds, revenueQueryPart).then((res) => {
					obj["channelPay"] = res;
				});
			});
		obj["caseStatus"] = await SalesLoanDataRd.find({
			userid: {in: salesIdsRes}
		});

		return res.ok({
			status: "ok",
			message: sails.config.msgConstants.detailsListed,
			data: obj
		});
	},
	/**
	 * @api {post} /salesDibursementRawData/ sales-disbursementRaw-data
	 * @apiName salesDisbursement
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/salesDibursementRawData
	 *
	 * @apiParam {Date} start_date startDate(2020-01-02)(YYYY-MM-DD)
	 * @apiParam {Date} end_date endDate(2020-01-02)
	 * @apiParam {String} city sales city
	 * @apiParam {String} product loan product
	 * @apiParam {String} sales_name sales-name
	 * @apiParam {String} lender lender-name
	 * @apiParam {String} channel_email channel_email
	 * @apiParam {String} channel_name  channel_name
	 * @apiParam {String} llc_status  llc_status
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message disbursement data listed
	 * @apiSuccess {Object[]} data disbursement data
	 */
	salesRawData: async (req, res) => {
		const city = req.param("city"),
			product = req.param("product"),
			sales = req.param("sales_name"),
			lender = req.param("lender"),
			channelEmail = req.param("channel_email"),
			channelName = req.param("channel_name"),
			llcStatus = req.param("llc_status"),
			startDate = req.param("start_date"),
			endDate = req.param("end_date");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const salesChildIds = await sails.helpers.salesUser(userid),
			salesObj = {
				userid: {in: salesChildIds}
			};
		city ? (salesObj["sales_city"] = city) : "";
		product ? (salesObj["product"] = product) : "";
		sales ? (salesObj["sales"] = sales) : "";
		lender ? (salesObj["BankName"] = lender) : "";
		channelEmail ? (salesObj["ChannelEMAIL"] = channelEmail) : "";
		startDate && endDate ? (salesObj["date"] = {">=": startDate, "<=": endDate}) : "";
		channelName ? (salesObj["Channel_Name"] = channelName) : "";
		llcStatus ? (salesObj["llc_status"] = llcStatus) : "";

		const caseStatusData = await SalesLoanDataRd.find({
			where: salesObj
		}).sort("requestdate DESC");
		if (caseStatusData.length > 0) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				data: caseStatusData
			});
		} else {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.recordNotFound,
				data: []
			});
		}
	},
	/**
	 * @api {get} /rawDropdownValues/ rawDropdownValues
	 * @apiName rawDropdownValues
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/rawDropdownValues
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message dropdown list
	 * @apiSuccess {Object[]} data
	 * @apiSuccess  {Object[]} data.product product list
	 * @apiSuccess  {Object[]} data.city city list
	 * @apiSuccess  {Object[]} data.sales sales list
	 * @apiSuccess  {Object[]} data.channel channel list
	 * @apiSucces  {Object[]} data.lender lender list
	 */
	getDropdownValues: async (req, res) => {
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const salesIdsRes = await sails.helpers.salesUser(userid),
			city = [],
			salesName = [],
			channelArr = [],
			lenderArr = [],
			citySalesData = await UsersRd.find({
				where: {
					id: salesIdsRes,
					usertype: "Sales"
				},
				select: ["name", "city"]
			}),
			parsedCityData = JSON.parse(JSON.stringify(citySalesData));
		parsedCityData.map((cityElement) => {
			city.push(cityElement.city);
			salesName.push(cityElement.name);
		});
		const loanProduct = await LoanProductsRd.find({
			select: ["product"]
		}),
			channel_lender = await SalesLoanDataRd.find({
				where: {
					userid: salesIdsRes
				},
				select: ["BankName", "Channel_Name"]
			}),
			parsedChannelList = JSON.parse(JSON.stringify(channel_lender));
		parsedChannelList.map((Element) => {
			channelArr.push(Element.Channel_Name);
			lenderArr.push(Element.BankName);
		});
		const deduplicateCity = [...new Set(city)],
			deduplicateSalesName = [...new Set(salesName)],
			deduplicateChannelName = [...new Set(channelArr)],
			deduplicateLender = [...new Set(lenderArr)],
			llcValues = ["Confirmed", "Not Confirmed"];
		return res.ok({
			status: "ok",
			message: "dropdown values",
			data: {
				product: loanProduct,
				city: deduplicateCity,
				sales: deduplicateSalesName,
				channel: deduplicateChannelName,
				lender: deduplicateLender,
				llc_status: llcValues
			}
		});
	},

	/**
	 * @api {post} /salesLLCData/ salesLLCData
	 * @apiName salesLLCData
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/salesLLCData
	 *
	 * @apiParam {Date} start_date startDate(2020-01-02)
	 * @apiParam {Date} end_date endDate(2020-01-02)
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message llc data
	 * @apiSuccess {Object[]} data
	 * @apiSuccess  {Object[]} data.llcConfirm confimedcount and amt
	 * @apiSuccess  {Object[]} data.llcNotConfirm notConfirmed count and amt
	 * @apiSuccess  {Object[]} data.confirmedLenders confirmed bank names and counts
	 * @apiSuccess  {Object[]} data.notConfirmedLenders notConfirmed bank names and counts
	 */
	getSalesLLC: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			startDate = req.param("start_date"),
			endDate = req.param("end_date");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		let llcRes, llc;
		const obj = {},
			salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString();
		if (startDate && endDate) {
			llcQuery = `and date between '${startDate}' and '${endDate}'`;
			// revenueQueryPart = `and disbursement_date between ${startDate} and ${endDate}`;
		} else {
			llcQuery = "";
			// revenueQueryPart = '';
		}
		getllcConfirmedData = async (userid, sqlPart) => {
			const llcCaseCount = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Confirmed' and userid in(${userid})  ${sqlPart}`;
			nativeResult = await myDBStore.sendNativeQuery(llcCaseCount);
			const llcResult = nativeResult.rows;
			llcData = {
				caseCount: llcResult[0].caseCount,
				disbursementAmt: llcResult[0].amount === null ? 0 : llcResult[0].amount
			};
			return llcData;
		};

		getllcNotConfirmedData = async (userid, sqlPart) => {
			const llcCaseCount = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Not Confirmed' and userid in(${userid})  ${sqlPart}`;
			nativeResult = await myDBStore.sendNativeQuery(llcCaseCount);
			const llcResult = nativeResult.rows;
			llcData = {
				caseCount: llcResult[0].caseCount,
				disbursementAmt: llcResult[0].amount === null ? 0 : llcResult[0].amount
			};
			return llcData;
		};

		getBankConfirm = async (userid, sqlPart) => {
			const confimedLenderQuery = `SELECT count(distinct(loan_ref_id)) as caseCount,sum(volume_in_cr) as amount, BankName as lenders FROM namastecredit.sales_dashboard_loandump where  userid in(${userid}) and llc_status='Confirmed' ${sqlPart} group by BankName;`;
			nativeResult = await myDBStore.sendNativeQuery(confimedLenderQuery);
			const confirmLender = nativeResult.rows;
			return confirmLender;
		};
		getBankNotConfirm = async (userid, sqlPart) => {
			const notConfimedLenderQuery = `SELECT count(distinct(loan_ref_id)) as caseCount,sum(volume_in_cr) as amount, BankName as lenders FROM namastecredit.sales_dashboard_loandump where  userid in(${userid}) and llc_status='Not Confirmed' ${sqlPart} group by BankName;`;
			nativeResult = await myDBStore.sendNativeQuery(notConfimedLenderQuery);
			const notConfirmLender = nativeResult.rows;
			return notConfirmLender;
		};

		const confirmPromise = new Promise((resolve, reject) => {
			getllcConfirmedData(salesChildIds, llcQuery).then((res) => {
				res ? (obj["llcConfirm"] = res) : (obj["llcConfirm"] = {caseCount: 0, disbursementAmt: 0});
				resolve(obj);
			});
		}),
			notConfirmPromise = new Promise((resolve, reject) => {
				getllcNotConfirmedData(salesChildIds, llcQuery).then((res) => {
					res ? (obj["llcNotConfirm"] = res) : (obj["llcNotConfirm"] = {caseCount: 0, disbursementAmt: 0});
					resolve(obj);
				});
			}),
			confirmLenderPromise = new Promise((resolve, reject) => {
				getBankConfirm(salesChildIds, llcQuery).then((res) => {
					res.length > 0 ? (obj["confirmedLenders"] = res) : (obj["confirmedLenders"] = []);
					resolve(obj);
				});
			}),
			notConfirmLenderPromise = new Promise((resolve, reject) => {
				getBankNotConfirm(salesChildIds, llcQuery).then((res) => {
					res.length > 0 ? (obj["notConfirmedLenders"] = res) : (obj["notConfirmedLenders"] = []);
					resolve(obj);
				});
			});
		Promise.all([confirmPromise, notConfirmPromise, confirmLenderPromise, notConfirmLenderPromise]).then(
			(resvalues) => {
				return res.ok({
					status: "ok",
					message: "llc data",
					data: obj
				});
			}
		);
	},
	/**
	 * @api {get} /LLCGraphsData/ LLCGraphsData
	 * @apiName LLCGraphsData
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/LLCGraphsData
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message Graph data
	 * @apiSuccess {Object[]} data
	 */
	getLLCGraphsData: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString(),
			obj = {},
			confirmCurrentMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Confirmed' and userid in (${salesChildIds})
    and requestdate>= (select DATE_SUB(DATE(NOW()),INTERVAL (DAY(NOW())-1) DAY))`,
			confirmPreviousMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Confirmed' and userid in (${salesChildIds})
    and requestdate>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 2 MONTH)), INTERVAL 1 DAY) and
     requestdate <= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
			confirmSuperPreviousMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Confirmed' and userid in (${salesChildIds})
     and requestdate>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 3 MONTH)), INTERVAL 1 DAY) and
        requestdate <= DATE_SUB(NOW(), INTERVAL 2 MONTH)`,
			notconfirmCurrentMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Not Confirmed' and userid in (${salesChildIds})
        and requestdate>= (select DATE_SUB(DATE(NOW()),INTERVAL (DAY(NOW())-1) DAY))`,
			notconfirmPreviousMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Not Confirmed' and userid in (${salesChildIds})
      and requestdate>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 2 MONTH)), INTERVAL 1 DAY) and
       requestdate <= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
			notconfirmSuperPreviousMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where llc_status = 'Not Confirmed' and userid in (${salesChildIds})
       and requestdate>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 3 MONTH)), INTERVAL 1 DAY) and
          requestdate <= DATE_SUB(NOW(), INTERVAL 2 MONTH)`;

		getQueryData = async (query) => {
			nativeResult = await myDBStore.sendNativeQuery(query);
			const Result = nativeResult.rows;
			return Result;
		};

		const firstMonthConfirmPrmz = new Promise((resolve, reject) => {
			getQueryData(confirmCurrentMonthQuery).then((res) => {
				obj["confirmFirstMonth"] = {
					caseCount: res[0].caseCount,
					disbursementAmt: res[0].amount === null ? 0 : res[0].amount
				};
				resolve(obj);
			});
		}),
			secondMonthConfirmPrmz = new Promise((resolve, reject) => {
				getQueryData(confirmPreviousMonthQuery).then((res) => {
					obj["confirmSecondMonth"] = {
						caseCount: res[0].caseCount,
						disbursementAmt: res[0].amount === null ? 0 : res[0].amount
					};
					resolve(obj);
				});
			}),
			thirdMonthConfirmPrmz = new Promise((resolve, reject) => {
				getQueryData(confirmSuperPreviousMonthQuery).then((res) => {
					obj["confirmThirdMonth"] = {
						caseCount: res[0].caseCount,
						disbursementAmt: res[0].amount === null ? 0 : res[0].amount
					};
					resolve(obj);
				});
			}),
			firstMonthNotConfirmPrmz = new Promise((resolve, reject) => {
				getQueryData(notconfirmCurrentMonthQuery).then((res) => {
					obj["notConfirmFirstMonth"] = {
						caseCount: res[0].caseCount,
						disbursementAmt: res[0].amount === null ? 0 : res[0].amount
					};
					resolve(obj);
				});
			}),
			secondMonthNotConfirmPrmz = new Promise((resolve, reject) => {
				getQueryData(notconfirmPreviousMonthQuery).then((res) => {
					obj["notConfirmSecondMonth"] = {
						caseCount: res[0].caseCount,
						disbursementAmt: res[0].amount === null ? 0 : res[0].amount
					};
					resolve(obj);
				});
			}),
			thirdMonthNotConfirmPrmz = new Promise((resolve, reject) => {
				getQueryData(notconfirmSuperPreviousMonthQuery).then((res) => {
					obj["notConfirmThirdMonth"] = {
						caseCount: res[0].caseCount,
						disbursementAmt: res[0].amount === null ? 0 : res[0].amount
					};
					resolve(obj);
				});
			});
		Promise.all([
			firstMonthConfirmPrmz,
			secondMonthConfirmPrmz,
			thirdMonthConfirmPrmz,
			firstMonthNotConfirmPrmz,
			secondMonthNotConfirmPrmz,
			thirdMonthNotConfirmPrmz
		]).then((resvalues) => {
			return res.ok({
				status: "ok",
				message: "Graphs data",
				data: obj
			});
		});
	},

	/**
	 * @api {post} /salesChannelDump/ salesChannelDump
	 * @apiName salesChannelDump
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/salesChannelDump
	 *
	 * @apiParam {Date} start_date startDate(MM/DD/YYYY)
	 * @apiParam {Date} end_date endDate(MM/DD/YYYY)
	 * @apiParam {String} state channel state
	 * @apiParam {String} city channel city
	 * @apiParam {String} channel_name channel_name
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message channel list
	 * @apiSuccess {Object[]} data
	 */
	getChannelDump: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const state = req.param("state"),
			city = req.param("city"),
			name = req.param("channel_name"),
			startDate = req.param("start_date"),
			endDate = req.param("end_date"),
			salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString();
		let resData, stateQuery, cityQuery, dateQuery, nameQuery;
		const resObj = {},
			cityArr = [],
			stateArr = [],
			channelName = [];

		state ? (stateQuery = `AND u.state = '${state}'`) : (stateQuery = "");
		city ? (cityQuery = `AND u.city = '${city}'`) : (cityQuery = "");
		startDate && endDate
			? (dateQuery = `AND createdon between '${startDate} 00:00:00' and '${endDate} 12:00:00'`)
			: (dateQuery = "AND (STR_TO_DATE(ld.disbursement_date, '%m/%d/%Y') >= NOW() - INTERVAL 3 MONTH)");
		name ? (nameQuery = `AND u.name = '${name}'`) : (nameQuery = "");

		const channelQuery = `SELECT u.userid,u.name,u.email,u.state,u.city,COUNT(DISTINCT l.loan_ref_id) AS count,
    count(CASE WHEN ld.llc_status ='Yes' THEN ld.disbursementId END) AS llc_count,
    SUM(ROUND(CASE WHEN ld.disbursement_amt_um = 'Lakhs' THEN (ld.disbursement_amt / 100) ELSE ld.disbursement_amt END, 3)) AS disbursement_amount_in_cr
    FROM users u JOIN business b ON u.userid = b.userid JOIN loanrequest l ON b.businessid = l.business_id JOIN loan_bank_mapping lbm ON l.loanid = lbm.loan_id JOIN loan_disbursement ld ON lbm.loan_bank_mapping_id = ld.loan_bank_mapping_id LEFT JOIN
    loan_products lp ON l.loan_product_id = lp.id LEFT JOIN loan_status_with_lender ll ON lbm.lender_status_id = ll.id LEFT JOIN bank_master bm ON lbm.bank_id = bm.bankid
    WHERE lbm.loan_bank_status = 12 AND lbm.loan_borrower_status = 12 AND lbm.lender_status_id IN (16 , 17) AND u.usertype = 'CA' ${dateQuery} ${stateQuery} ${cityQuery} ${nameQuery} and u.userid in (${salesChildIds})
    GROUP BY 1`;
		nativeResult = await myDBStore.sendNativeQuery(channelQuery);
		const channelResult = nativeResult.rows;
		resObj["table_data"] = channelResult;

		const dropChannel = `SELECT u.userid,u.name,u.email,u.state,u.city,
    SUM(ROUND(CASE WHEN ld.disbursement_amt_um = 'Lakhs' THEN (ld.disbursement_amt / 100) ELSE ld.disbursement_amt END, 3)) AS disbursement_amount_in_cr
    FROM users u JOIN business b ON u.userid = b.userid JOIN loanrequest l ON b.businessid = l.business_id JOIN loan_bank_mapping lbm ON l.loanid = lbm.loan_id JOIN loan_disbursement ld ON lbm.loan_bank_mapping_id = ld.loan_bank_mapping_id LEFT JOIN
    loan_products lp ON l.loan_product_id = lp.id LEFT JOIN loan_status_with_lender ll ON lbm.lender_status_id = ll.id LEFT JOIN bank_master bm ON lbm.bank_id = bm.bankid
    WHERE lbm.loan_bank_status = 12 AND lbm.loan_borrower_status = 12 AND lbm.lender_status_id IN (16 , 17) AND u.usertype = 'CA' and u.userid in (${salesChildIds})
    GROUP BY 1`;
		nativeResult = await myDBStore.sendNativeQuery(dropChannel);
		const dropChannelResult = nativeResult.rows;

		_.each(dropChannelResult, (value) => {
			cityArr.push(value.city);
			stateArr.push(value.state);
			channelName.push(value.name);
		});
		resObj["cityDropdown"] = cityArr;
		resObj["stateDropdown"] = stateArr;
		resObj["namesDropdown"] = channelName;

		if (channelResult.length > 0) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				data: resObj
			});
		} else {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.recordNotFound,
				data: []
			});
		}
	},

	/**
	 * @api {get} /homeGraphData/ homeGraphData
	 * @apiName homeGraphData
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/homeGraphData
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message Graph data listed
	 * @apiSuccess {Object[]} caseCounts  case counts data for 3months
	 * @apiSuccess {Object[]} revenueCounts  revenue counts data for 3months
	 */
	getHomeGraphData: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString(),
			obj = {},
			currentRevenueQuery = `select round(sum(case when id is not NULL and ChannelNetPayable is not NULL then LenderPayout end),2) as lenderPercent, round(sum(case when id is not NULL then ChannelNetPayable end),2) as channelPercent,
      round(sum(case when id is not NULL then NC_Revenue end),2) as revenue FROM namastecredit.sales_dashboard_revenue where userid in(${salesChildIds}) and  disbursement_date>= (select DATE_SUB(DATE(NOW()),INTERVAL (DAY(NOW())-1) DAY))`,
			previousRevenueQuery = `select round(sum(case when id is not NULL and ChannelNetPayable is not NULL then LenderPayout end),2) as lenderPercent, round(sum(case when id is not NULL then ChannelNetPayable end),2) as channelPercent,
      round(sum(case when id is not NULL then NC_Revenue end),2) as revenue FROM namastecredit.sales_dashboard_revenue where userid in(${salesChildIds})
      and  disbursement_date>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 2 MONTH)), INTERVAL 1 DAY) and disbursement_date <= (SELECT LAST_DAY(now() - INTERVAL 1 MONTH))`,
			superpreviousRevenueQuery = `select round(sum(case when id is not NULL and ChannelNetPayable is not NULL then LenderPayout end),2) as lenderPercent, round(sum(case when id is not NULL then ChannelNetPayable end),2) as channelPercent,
      round(sum(case when id is not NULL then NC_Revenue end),2) as revenue FROM namastecredit.sales_dashboard_revenue where userid in(${salesChildIds}) and
      disbursement_date>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 3 MONTH)), INTERVAL 1 DAY) and disbursement_date <= (SELECT LAST_DAY(now() - INTERVAL 2 MONTH))`;

		getRevenueQuery = async (sql) => {
			nativeResult = await myDBStore.sendNativeQuery(sql);
			const revenueResult = nativeResult.rows;
			return revenueResult;
		};

		getCaseCurrentMonth = async (userid) => {
			const currentMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where userid in(${userid}) and llc_status="Confirmed" and date>= (select DATE_SUB(DATE(NOW()),INTERVAL (DAY(NOW())-1) DAY))`;
			nativeResult = await myDBStore.sendNativeQuery(currentMonthQuery);
			const Result = nativeResult.rows;
			return Result;
		};

		getCasePreviousMonth = async (userid) => {
			const previousMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where userid in(${userid}) and llc_status="Confirmed"
      and date>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 2 MONTH)), INTERVAL 1 DAY) and
       date <= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
			nativeResult = await myDBStore.sendNativeQuery(previousMonthQuery);
			const Result = nativeResult.rows;
			return Result;
		};

		getCaseSuperPreviousMonth = async (userid) => {
			const superPreviousMonthQuery = `select count(distinct(loan_ref_id)) as caseCount ,sum(volume_in_cr) as amount FROM namastecredit.sales_dashboard_loandump where userid in(${userid}) and llc_status="Confirmed"
      and date>= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 3 MONTH)), INTERVAL 1 DAY) and
         date <= DATE_SUB(NOW(), INTERVAL 2 MONTH)`;
			nativeResult = await myDBStore.sendNativeQuery(superPreviousMonthQuery);
			const Result = nativeResult.rows;
			return Result;
		};

		getCaseMapData = async (userid) => {
			const mapQuery = `SELECT count(distinct(loan_ref_id)) as caseCount , sales_state FROM namastecredit.sales_dashboard_loandump where  userid in (${userid})  group by sales_state;`;
			nativeResult = await myDBStore.sendNativeQuery(mapQuery);
			const revenueResult = nativeResult.rows;
			return revenueResult;
		};

		const firstMonthConfirmPrmz = new Promise((resolve, reject) => {
			getCaseCurrentMonth(salesChildIds).then((res) => {
				obj["confirmFirstMonth"] = {
					caseCount: res[0].caseCount,
					disbursementAmt: res[0].amount === null ? 0 : res[0].amount
				};
				resolve(obj);
			});
		}),
			secondMonthConfirmPrmz = new Promise((resolve, reject) => {
				getCasePreviousMonth(salesChildIds).then((res) => {
					obj["confirmSecondMonth"] = {
						caseCount: res[0].caseCount,
						disbursementAmt: res[0].amount === null ? 0 : res[0].amount
					};
					resolve(obj);
				});
			}),
			thirdMonthConfirmPrmz = new Promise((resolve, reject) => {
				getCaseSuperPreviousMonth(salesChildIds).then((res) => {
					obj["confirmThirdMonth"] = {
						caseCount: res[0].caseCount,
						disbursementAmt: res[0].amount === null ? 0 : res[0].amount
					};
					resolve(obj);
				});
			}),
			firstMonthRevenue = new Promise((resolve, reject) => {
				getRevenueQuery(currentRevenueQuery).then((res) => {
					obj["revenueFirstMonth"] = {
						lenderPayout: res[0].lenderPercent === null ? 0 : res[0].lenderPercent,
						channelPayout: res[0].channelPercent === null ? 0 : res[0].channelPercent,
						netRevenue: res[0].revenue === null ? 0 : res[0].revenue
					};
					resolve(obj);
				});
			}),
			secondMonthRevenue = new Promise((resolve, reject) => {
				getRevenueQuery(previousRevenueQuery).then((res) => {
					obj["revenueSecondMonth"] = {
						lenderPayout: res[0].lenderPercent === null ? 0 : res[0].lenderPercent,
						channelPayout: res[0].channelPercent === null ? 0 : res[0].channelPercent,
						netRevenue: res[0].revenue === null ? 0 : res[0].revenue
					};
					resolve(obj);
				});
			}),
			thirdMonthRevenue = new Promise((resolve, reject) => {
				getRevenueQuery(superpreviousRevenueQuery).then((res) => {
					obj["revenueThirdMonth"] = {
						lenderPayout: res[0].lenderPercent === null ? 0 : res[0].lenderPercent,
						channelPayout: res[0].channelPercent === null ? 0 : res[0].channelPercent,
						netRevenue: res[0].revenue === null ? 0 : res[0].revenue
					};
					resolve(obj);
				});
			}),
			mapData = new Promise((resolve, reject) => {
				getCaseMapData(salesChildIds).then((res) => {
					obj["mapData"] = res;
					resolve(obj);
				});
			});

		Promise.all([
			firstMonthConfirmPrmz,
			secondMonthConfirmPrmz,
			thirdMonthConfirmPrmz,
			firstMonthRevenue,
			secondMonthRevenue,
			thirdMonthRevenue,
			mapData
		])
			.then((resvalues) => {
				return res.ok({
					status: "ok",
					message: "Graph data listed",
					data: obj
				});
			})
			.catch((error) => {
				return res.ok({
					status: "nok",
					message: error
				});
			});
	},
	/**
	 * @api {get} /getRevenueDistribution/ getRevenueDistribution
	 * @apiName getRevenueDistribution
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/getRevenueDistribution
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message channel list
	 * @apiSuccess {Object} data
	 * @apiSuccess {Object[]} data.LenderData
	 * @apiSuccess {Object[]} data.salesData
	 * @apiSuccess {Object[]} data.cityData
	 * @apiSuccess {Object[]} data.RevenueCounts
	 */
	getRevenueDistribution: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString(),
			startDate = req.param("start_date"),
			endDate = req.param("end_date");
		let revenueQueryPart, invoicePart;
		if (startDate && endDate) {
			revenueQueryPart = `and disbursement_date between ${startDate} and ${endDate}`;
			invoicePart = `and InvoiceDate between ${startDate} and ${endDate}`;
		} else {
			revenueQueryPart = "";
			invoicePart = "";
		}
		const lenderQuery = `SELECT  sum(LenderPayout) as lenderPayout, bankname FROM namastecredit.sales_dashboard_revenue where userid in (${salesChildIds}) ${invoicePart} group by bankname;`,
			cityQuery = `select sum(NC_Revenue) as Revenue, sales_city as city from namastecredit.sales_dashboard_revenue where userid in (${salesChildIds}) ${invoicePart} group by sales_city;
      `,
			salesQuery = `select sum(NC_Revenue) as Revenue, sales_name as name from namastecredit.sales_dashboard_revenue where userid in (${salesChildIds}) ${invoicePart} group by sales_name;
      `,
			invoiceWithChannelPaid = `select count(case when id is not null and AmountPaid_Channel is not NULL then id end) as invoiceCount, sum(case when id is not NULL and AmountPaid_Channel is not NULL  then InVoiceAmount end) as invoiceAmount, count(case when id is not null and AmountPaid_Channel is not NULL  then disbursementId end) as channelCount, round(sum(case when  id is not NULL and AmountPaid_Channel is not NULL then AmountPaid_Channel end),2) as channelAmt from namastecredit.sales_dashboard_revenue where userid in (${salesChildIds}) ${invoicePart}`,
			invoiceWithoutChannel = `select count( case when id is not NULL and AmountPaid_Channel is NULL then id end ) as invoiceCount, round(sum(case when id is not NULL  and
      AmountPaid_Channel is NULL then InVoiceAmount end),2) as invoiceAmount, NULL as channelCount, round(sum(case when  id is not NULL and AmountPaid_Channel is NULL then AmountPaid_Channel end),2) as channelAmt from namastecredit.sales_dashboard_revenue where userid in (${salesChildIds}) ${invoicePart}`,
			withoutInvoiceChannel = `select NULL as invoiceCount, NULL as invoiceAmount, count( case when id is  NULL and AmountPaid_Channel  is not NULL then disbursementId end) as channelCount, round(sum(case when  id is  NULL and AmountPaid_Channel is not NULL then AmountPaid_Channel end),2) as channelAmt from namastecredit.sales_dashboard_revenue where userid in (${salesChildIds}) ${invoicePart}`,
			obj = {};
		getQuery = async (Sql) => {
			nativeResult = await myDBStore.sendNativeQuery(Sql);
			const Result = nativeResult.rows;
			return Result;
		};

		const lenderPromise = new Promise((resolve, reject) => {
			getQuery(lenderQuery).then((res) => {
				obj["LenderData"] = res;
				resolve(obj);
			});
		}),
			cityPromise = new Promise((resolve, reject) => {
				getQuery(cityQuery).then((res) => {
					obj["cityData"] = res;
					resolve(obj);
				});
			}),
			salesPromise = new Promise((resolve, reject) => {
				getQuery(salesQuery).then((res) => {
					obj["salesData"] = res;
					resolve(obj);
				});
			}),
			invoiceWithChannelPaidPromise = new Promise((resolve, reject) => {
				getQuery(invoiceWithChannelPaid).then((res) => {
					obj["invoiceWithChannelPaid"] = res[0];
					resolve(obj);
				});
			}),
			invoiceWithoutChannelPromise = new Promise((resolve, reject) => {
				getQuery(invoiceWithoutChannel).then((res) => {
					obj["invoiceWithoutChannel"] = res[0];
					resolve(obj);
				});
			}),
			withoutInvoiceChannelPromise = new Promise((resolve, reject) => {
				getQuery(withoutInvoiceChannel).then((res) => {
					obj["withoutInvoiceChannel"] = res[0];
					resolve(obj);
				});
			});
		Promise.all([
			lenderPromise,
			cityPromise,
			salesPromise,
			invoiceWithChannelPaidPromise,
			invoiceWithoutChannelPromise,
			withoutInvoiceChannelPromise
		])
			.then((resvalues) => {
				return res.ok({
					status: "ok",
					message: "Revenue Distribution Data",
					data: obj
				});
			})
			.catch((error) => {
				return res.ok({
					status: "nok",
					message: error
				});
			});
	},
	/**
	 * @api {get} /revenueDetails/ revenueDetails
	 * @apiName revenueDetails
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/revenueDetails
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message Revenue Table Data
	 * @apiSuccess {Object} data
	 * @apiSuccess {Object[]} data.lenders
	 * @apiSuccess {Object[]} data.city
	 * @apiSuccess {Object[]} data.sales
	 */
	revenueDetails: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let userid;
		const lenderObj = {},
			cityObj = {},
			salesObj = {};
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString(),
			lenderQuery = `SELECT  bankname,sales_name,sales_city,businessname,NCID,disbursement_amt,InVoiceAmount,LenderPayout,AmountPaid_Channel as channelPayout FROM namastecredit.sales_dashboard_revenue where userid in (${salesChildIds}) ;`,
			cityQuery = `select bankname,sales_name,sales_city,businessname,NCID,disbursement_amt,InVoiceAmount,NC_Revenue,AmountPaid_Channel as channelPayout from namastecredit.sales_dashboard_revenue where userid in (${salesChildIds});
      `,
			salesQuery = `select bankname,sales_name,sales_city,businessname,NCID,disbursement_amt,InVoiceAmount,NC_Revenue,AmountPaid_Channel as channelPayout  from namastecredit.sales_dashboard_revenue where userid in (${salesChildIds})
      `;
		getQuery = async (Sql) => {
			nativeResult = await myDBStore.sendNativeQuery(Sql);
			const Result = nativeResult.rows;
			return Result;
		};
		const lenderPromise = new Promise((resolve, reject) => {
			getQuery(lenderQuery).then((res) => {
				res.forEach((item, index) => {
					lenderObj[item.bankname]
						? lenderObj[item.bankname].push(item)
						: (lenderObj[item.bankname] = [item]);
					resolve(lenderObj);
				});
			});
		}),
			cityPromise = new Promise((resolve, reject) => {
				getQuery(cityQuery).then((res) => {
					res.forEach((item, index) => {
						cityObj[item.sales_city]
							? cityObj[item.sales_city].push(item)
							: (cityObj[item.sales_city] = [item]);
						resolve(cityObj);
					});
				});
			}),
			salesPromise = new Promise((resolve, reject) => {
				getQuery(salesQuery).then((res) => {
					res.forEach((item, index) => {
						salesObj[item.sales_name]
							? salesObj[item.sales_name].push(item)
							: (salesObj[item.sales_name] = [item]);
						resolve(salesObj);
					});
				});
			});

		Promise.all([lenderPromise, cityPromise, salesPromise])
			.then((resvalues) => {
				return res.ok({
					status: "ok",
					message: "Revenue Table Data",
					data: {
						lenders: lenderObj,
						city: cityObj,
						sales: salesObj
					}
				});
			})
			.catch((error) => {
				return res.ok({
					status: "nok",
					message: error
				});
			});
	},

	getSalesLLCDetails: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read"),
			startDate = req.param("start_date"),
			endDate = req.param("end_date");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		let llcRes, llc;
		const obj = {},
			salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString();
		if (startDate && endDate) {
			llcQuery = `and date between '${startDate}' and '${endDate}'`;
			revenueQueryPart = `and disbursement_date between ${startDate} and ${endDate}`;
		} else {
			llcQuery = "";
			revenueQueryPart = "";
		}
		const llcCaseConfirm = `select * FROM namastecredit.sales_dashboard_loandump where llc_status = 'Confirmed' and userid in(${salesChildIds})  ${llcQuery}`,
			llcCaseNotConfirm = `select * FROM namastecredit.sales_dashboard_loandump where llc_status = 'Not Confirmed' and userid in(${salesChildIds})  ${llcQuery}`;

		getQuery = async (sql) => {
			nativeResult = await myDBStore.sendNativeQuery(sql);
			const llcResult = nativeResult.rows;
			return llcResult;
		};

		// getBankConfirm = async (userid, sqlPart) => {
		//   let confimedLenderQuery = `SELECT count(distinct(loan_ref_id)) as caseCount,sum(volume_in_cr) as amount, BankName as lenders FROM namastecredit.sales_dashboard_loandump where  userid in(${userid}) and llc_status='Confirmed' ${sqlPart} group by BankName;`;
		//   nativeResult = await myDBStore.sendNativeQuery(confimedLenderQuery);
		//   let confirmLender = nativeResult.rows;
		//   return confirmLender;
		// };
		// getBankNotConfirm = async (userid, sqlPart) => {
		//   let notConfimedLenderQuery = `SELECT count(distinct(loan_ref_id)) as caseCount,sum(volume_in_cr) as amount, BankName as lenders FROM namastecredit.sales_dashboard_loandump where  userid in(${userid}) and llc_status='Not Confirmed' ${sqlPart} group by BankName;`;
		//   nativeResult = await myDBStore.sendNativeQuery(notConfimedLenderQuery);
		//   let notConfirmLender = nativeResult.rows;
		//   return notConfirmLender;
		// };

		const confirmPromise = new Promise((resolve, reject) => {
			getQuery(llcCaseConfirm).then((res) => {
				res ? (obj["llcConfirm"] = res) : (obj["llcConfirm"] = {});
				resolve(obj);
			});
		}),
			notConfirmPromise = new Promise((resolve, reject) => {
				getQuery(llcCaseNotConfirm).then((res) => {
					res ? (obj["llcNotConfirm"] = res) : (obj["llcNotConfirm"] = {});
					resolve(obj);
				});
			});

		// const confirmLenderPromise = new Promise((resolve, reject) => {
		//   getBankConfirm(salesChildIds, llcQuery).then((res) => {
		//     res.length > 0
		//       ? (obj["confirmedLenders"] = res)
		//       : (obj["confirmedLenders"] = []);
		//     resolve(obj);
		//   });
		// });

		// const notConfirmLenderPromise = new Promise((resolve, reject) => {
		//   getBankNotConfirm(salesChildIds, llcQuery).then((res) => {
		//     res.length > 0
		//       ? (obj["notConfirmedLenders"] = res)
		//       : (obj["notConfirmedLenders"] = []);
		//     resolve(obj);
		//   });
		// });
		Promise.all([confirmPromise, notConfirmPromise]).then((resvalues) => {
			return res.ok({
				status: "ok",
				message: "llc data",
				data: obj
			});
		});
	},
	/**
	 * @api {post} /salesChannelDetails/ salesChannelDetails
	 * @apiName salesChannelDetails
	 * @apiGroup salesDashboard
	 * @apiExample Example usage:
	 * curl -i localhost:1337/salesChannelDetails
	 *
	 * @apiParam {Date} start_date startDate(MM/DD/YYYY)
	 * @apiParam {Date} end_date endDate(MM/DD/YYYY)
	 * @apiParam {String} state channel state
	 * @apiParam {String} city channel city
	 * @apiParam {String} channel_name channel_name
	 *
	 * @apiSuccess {string} status ok
	 * @apiSuccess {message} message channel detailed list
	 * @apiSuccess {Object[]} data
	 */
	getChannelDetails: async (req, res) => {
		const myDBStore = sails.getDatastore("mysql_namastecredit_read");
		let userid;
		req.user["usertype"] === "Sales" && req.user["user_sub_type"] === "Admin"
			? (userid = req.user["parent_id"])
			: (userid = req.user["id"]);
		const state = req.param("state"),
			city = req.param("city"),
			name = req.param("channel_name"),
			startDate = req.param("start_date"),
			endDate = req.param("end_date"),
			salesIdsRes = await sails.helpers.salesUser(userid),
			salesChildIds = salesIdsRes.toString();
		let resData, stateQuery, cityQuery, dateQuery, nameQuery, createdQuery;
		const resObj = {},
			cityArr = [],
			stateArr = [],
			channelName = [];

		state ? (stateQuery = `AND u.state = '${state}'`) : (stateQuery = "");
		city ? (cityQuery = `AND u.city = '${city}'`) : (cityQuery = "");
		startDate && endDate
			? (dateQuery = `AND createdon between '${startDate} 00:00:00' and '${endDate} 12:00:00'`)
			: (dateQuery = "AND (STR_TO_DATE(ld.disbursement_date, '%m/%d/%Y') >= NOW() - INTERVAL 3 MONTH)");
		name ? (nameQuery = `AND u.name = '${name}'`) : (nameQuery = "");

		const channelQuery = `SELECT u.userid,u.name,u.email,u.state,u.city,l.loan_ref_id,
		ld.llc_status,
		(ROUND(CASE WHEN ld.disbursement_amt_um = 'Lakhs' THEN (ld.disbursement_amt / 100) ELSE ld.disbursement_amt END, 3)) AS disbursement_amount_in_cr
		FROM users u JOIN business b ON u.userid = b.userid JOIN loanrequest l ON b.businessid = l.business_id JOIN loan_bank_mapping lbm ON l.loanid = lbm.loan_id JOIN loan_disbursement ld ON lbm.loan_bank_mapping_id = ld.loan_bank_mapping_id LEFT JOIN
		loan_products lp ON l.loan_product_id = lp.id LEFT JOIN loan_status_with_lender ll ON lbm.lender_status_id = ll.id LEFT JOIN bank_master bm ON lbm.bank_id = bm.bankid
		WHERE lbm.loan_bank_status = 12 AND lbm.loan_borrower_status = 12 AND lbm.lender_status_id IN (16 , 17) AND u.usertype = 'CA' ${dateQuery} ${stateQuery} ${cityQuery} ${nameQuery} and u.userid in (${salesChildIds})`;
		nativeResult = await myDBStore.sendNativeQuery(channelQuery);
		const channelResult = nativeResult.rows;

		if (channelResult.length > 0) {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.detailsListed,
				data: channelResult
			});
		} else {
			return res.ok({
				status: "ok",
				message: sails.config.msgConstants.recordNotFound,
				data: []
			});
		}
	}
};
