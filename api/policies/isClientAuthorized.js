module.exports = async function (req, res, next) {
    let token;
    // Check if authorization header is present
    if (req.headers && req.headers.authorization) { // authorization header is present
        token = req.headers.authorization;
    } else { // authorization header is not present
        return res.status(401).json({statusCode: "NC500", message: 'No Authorization header was found'});
    }

    const data = await sails.helpers.jwtToken('verify', token);
    if (data == 'error') {
        return res.status(401).json({statusCode: "NC500", message: 'Invalid Authorization header'});
    }

    const result = await Clients.findOne({client_id: data.client_id, is_active: 'active'});
    if (! result || result.length == 0) {
        return res.status(401).json({statusCode: "NC500", message: 'Invalid Authorization header'});
    }

    req.client_id = data.client_id;
    req.client_data = result;
    next();

};
