const moment = require('moment');

module.exports = async function (req, res, next) {

	const requestId = req.param("requestId");
	const clientId = req.client_id;
	if (!requestId) return res.ok(sails.config.errRes.missingFields);

	let result = await ClientRequest.findOne({
		request_id: requestId,
		is_active: "active"
	});

	if (result && (result.req_status == "initiate" || result.req_status == "inprogress")) {
		let date = moment(result.req_datetime, 'YYYY-MM-DD HH:mm:ss');
		const now = await sails.helpers.dateTime();
		const dateTomo = moment(date, 'YYYY-MM-DD HH:mm:ss').add(24, 'hours').format('YYYY-MM-DD HH:mm:ss');
		const diff = moment(now, 'YYYY-MM-DD HH:mm:ss').diff(dateTomo, 'seconds');
		try {
			if (diff < 0) {
				if (clientId) {
					if (result.client_id == clientId)
						next();
					else
						return res.ok(sails.config.errRes.invalidParameter);
				}
				else
					next();
			}
			else {
				await ClientRequest.updateOne({
					request_id: requestId
				}).set({
					req_status: 'expired'
				});
				return res.ok(sails.config.errRes.invalidParameter);
			}
		} catch (err) {
			console.log(err);
		}
	} else {
		return res.ok(sails.config.errRes.invalidParameter);
	}
};