const logger = require('../../config/log').log.custom;

module.exports = function (req, res, next) {

    // Log the request
    logger.info('Request', {
        type: "Request",
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers,
    });

    // Override the res.send method to capture the response body
    // this is the only way I found out through which we can intecept request in between a middleware
    let originalSend = res.send;

    let responseLogged = false; // Flag to track if response has been logged
    //otherwise it might me logged twice because it may be called multiple times
    //because we are overridding the res.send method ourselves and also the user is calling the res.send method
    //to respond back to the API, thus to stop the API from being called twice we are using this flag to track the status


    // Log the response
    res.send = function (body) {
        if (!responseLogged) {
            logger.info('Response', {
                type: "Response",
                statusCode: res.statusCode,
                body: res.body,
            });
            responseLogged = true; // Set the flag to true after logging the response
        }

        // Call the original send method
        originalSend.call(this, body);
    };

    next();
}
