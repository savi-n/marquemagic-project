module.exports = async function (req, res, next) {

	if (req.req_type != "BANK") {
		return res.send({
			statusCode: 'NC500',
			message: 'Invaid request type.',
		});
	}
	next();
};