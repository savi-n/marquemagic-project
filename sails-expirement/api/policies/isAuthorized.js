const {jwtVerify} = require("jose");
const moment = require('moment-timezone');
module.exports = async function (req, res, next) {
	let token;
	//Check if authorization header is present
	if (req.headers && req.headers.authorization) {
		//authorization header is present
		const parts = req.headers.authorization.split(" ");
		if (parts.length === 2) {
			const scheme = parts[0],
				credentials = parts[1];
			if (/^Bearer$/i.test(scheme)) {
				token = credentials;
			}
		} else {
			return res.status(401).json({status: "nok", message: "Format is Authorization: Bearer [token]"});
		}
	} else {
		//authorization header is not present
		return res.status(401).json({status: "nok", message: "No Authorization header was found"});
	}
	try {
		public_key = jwToken.publicKey();
		decoded = await jwtVerify(token, public_key);
		// jwToken.verify(token, async (err, decoded) => {

		req.user = decoded.payload.user || decoded.payload.data.user;
		const UserDetails = await UsersRd.findOne({
			where: {id: req.user.id},
			select: ["login_status", "white_label_id", "usertype", "user_sub_type"]
		});
		// enable below if you want to diable mutiple login with same cred
		// if (UserDetails.login_status != req.user.login_status)
		// 	return res.status(401).json({ status: 'nok', message: 'Invalid token' });
		if (!UserDetails || UserDetails.login_status === "logged_out") {
			return res.status(401).json({status: "nok", message: "Invalid token"});
		}
		// if (decoded.userid !== req.session.user.id) {
		// 	return res.send(401, 'unauthorized');
		// }

		const whiteLabelData = await WhiteLabelSolution.findOne({id: req.user.loggedInWhiteLabelID}).select("product_line");
		const userSessionExpiry = (JSON.parse(whiteLabelData.product_line))?.user_session_expiry
		if (userSessionExpiry && userSessionExpiry[0]) {
			const sessionRange = userSessionExpiry.find(obj => obj.usertype == req.user.usertype && (!obj.user_sub_type || obj.user_sub_type.includes(req.user.user_sub_type)))
			if (sessionRange) {
				const {startDay, endDay, startTime, endTime} = sessionRange || {}
				const date = moment(new Date()).tz("Asia/Kolkata")
				const currentDay = date.date();
				const isDayInRange = currentDay >= startDay && currentDay <= endDay;
				if (isDayInRange) {
					const currentTime = date.format('HH:mm:ss');
					const isTimeInRange = currentTime >= startTime && currentTime <= endTime;
					if (!isTimeInRange) return res.status(401).json({status: "nok", message: `Access Denied ! This user type is restricted to logging in only between ${startTime} and ${endTime}. Please try again during this time.`});
				}
			}
		}

		next();
	} catch (err) {
		return res.status(401).json({status: "nok", message: "Invalid token"});
	}

};
