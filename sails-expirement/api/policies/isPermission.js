

module.exports = async function (req, res, next) {
	let whiteLabel_permission;
	try {
		const {loggedInWhiteLabelID, usertype : user_type, user_sub_type} = req.user,
			wt_solution  = await WhiteLabelSolutionRd.findOne({id: loggedInWhiteLabelID}).select("available_user_type");
		if (!wt_solution.available_user_type){
			return res.badRequest({status: "nok", message: "Available user type field is null or empty"});
		}
		const availabel_user_type_json = JSON.parse(wt_solution.available_user_type),
			user_value = availabel_user_type_json[user_type];
		if (!user_value) {
			return res.badRequest({status: "nok", message: "User type is not available in this whitelabel"});
		}
		if (user_value.sub_type === 1 && user_sub_type !== "NULL") {
			const user_sub_value = availabel_user_type_json.sub_type_data[user_type][user_sub_type];
			whiteLabel_permission = await WhiteLabelPermissionRd.findOne({id: user_sub_value.permission}).select("permission");
		} else {
			whiteLabel_permission = await WhiteLabelPermissionRd.findOne({id: user_value.permission}).select("permission");
		}
		wt_data =  whiteLabel_permission.permission;
		next();
	} catch(err) {
		return res.status(401).json({status: "nok", message: "Invalid data", err});
	}
};