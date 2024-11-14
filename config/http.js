/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    order: [
      'http_req',
      // 'cookieParser',
      // 'session',
      'bodyParser',
      // 'compress',
      // 'poweredBy',
      'router',
      'www',
      // 'favicon',
    ],

    // An example of a custom HTTP middleware function:
    http_req: (function () {

      return function (req, res, next) {
        try {
          if (!req.path.includes('/docs')) {
            sails.log("HTTP request: " + req.method + " " + req.path);
            req.on('end', () => {
              try {
                sails.log('Request body received => ' + JSON.stringify(req.body));
              } catch (err) {

              }
            })
            let oldWrite = res.write,
              oldEnd = res.end;
            let chunks = [];
            res.write = function (chunk) {
              chunks.push(chunk);
              oldWrite.apply(res, arguments);
            };
            res.end = function (chunk) {
              try {
                if (chunk) chunks.push(chunk);
                let resbody = Buffer.concat(chunks).toString("utf8");
                //console.log('allParams', req._fileparser.upstreams[0]._files[0].stream.name,req._fileparser.upstreams[0]._files[0].stream.filename, req.body);
                //sails.log(" HTTP request: " + req.method + " " + req.path)
                sails.log("HTTP response: " + " " + req.path + "\n" + resbody + "\n");
              } catch (err) {

              }

              oldEnd.apply(res, arguments);
            };
          }
        } catch (err) {

        }
        return next();
      };
    })(),


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    bodyParser: (function _configureBodyParser() {
      var skipper = require('skipper');
      var middlewareFn = skipper({
        strict: true,
        maxTimeToBuffer: 25000
      });
      return middlewareFn;
    })(),

  },

};
