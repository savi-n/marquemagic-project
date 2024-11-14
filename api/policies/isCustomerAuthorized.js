const moment = require('moment');

module.exports = async function (req, res, next) {
	let token;

	if (req.headers && req.headers.authorization) {
		// token header is present
		token = req.headers.authorization;
	} else {
		return res.status(401).json({ statusCode: "NC500", message: 'Invalid Request' });
	}

	const verifiedToken = await sails.helpers.jwtToken('verify', token);
	if (verifiedToken == 'error') {
		return res.status(401).json({ statusCode: "NC500", message: 'Invalid Authorization header' });
	}
	const request_id = verifiedToken.request_id;

	const result = await ClientRequest.find({
		request_id: request_id,
		is_active: 'active'
	});

	if (result.length == 0) {
		return res.status(401).json({ statusCode: "NC500", message: 'Invalid Request Id' });
	}

	req.request_id = request_id;
	req.req_type = verifiedToken.req_type;
	const date = moment().diff(result[0].req_url_expiry, 'minutes');

	req.private_key = result[0].private_key;
	req.public_key = result[0].public_key;

	if (result[0].req_status == 'expired') {
		return res.status(401).json({ statusCode: "NC500", message: 'URL has expired' });
	} else if (result[0].req_status == 'completed') {
		return res.status(401).json({ statusCode: "NC500", message: 'Bank Statement has been uploaded' });
	} else if (date > 0 || result[0].flag == '1') {
		// If req_url_expiry has expired and link has been triggred before expiry(In second api call). It will active for 15min.
		// Or if link has been triggered. Then it will be active for 15min. after that it will be expired.
		if (result[0].flag == '1') {
			const date = moment().diff(result[0].flag_expiry, 'minutes');
			if (date < 0) {
				next();
			}
		}
		await ClientRequest.updateOne({ request_id: request_id })
			.set({
				req_status: 'expired'
			});
		return res.status(401).json({ statusCode: "NC500", message: 'URL has expired' });
	}

	next();
};