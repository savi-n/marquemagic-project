module.exports = async function (req, res, next) {

	if (req.req_type != "GST") {
		return res.send({
			statusCode: 'NC500',
			message: 'Invaid request type.',
		});
	}
	next();
};