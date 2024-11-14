const {transports, createLogger, format} = require("winston");
const S3StreamLogger = require("s3-streamlogger").S3StreamLogger;

const date = new Date();
const moment = require("moment");
const day = moment(date).format("DD_MM_YYYY");
const dateFormat = moment(date).format("DD-MM-YYYY_HH:mm:ss");

let s3_stream = new S3StreamLogger({
	bucket: "neobankdevlop",
	access_key_id: "AKIA5TQLVQP6FIEKSEDP",
	secret_access_key: "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",
  	region: "ap-south-1",
	folder: `SailsPlaid/${day}`,
});

let transport = new transports.Stream({
	stream: s3_stream
});

transport.on('error', function (err) {
	console.log('Error', err);
});

const winstonLogger = createLogger({
	format: format.combine(
		format.timestamp(),
		format.json()
	),
	transports: [transport,
		new transports.Console({
			format: format.simple()
		})
	]
}),
	logger = {
		info: function () {
			winstonLogger.info(...arguments);
		},
		debug: function () {
			winstonLogger.debug(...arguments);
		},
		error: function () {
			winstonLogger.error(...arguments);
		},
		warn: function () {
			winstonLogger.warn(...arguments);
		},
		log: function () {
			winstonLogger.log(...arguments);
		}
	};

module.exports.log = {
	custom: logger,
	level: "silly",
	inspect: false
	/***************************************************************************
	 *                                                                          *
	 * Valid `level` configs: i.e. the minimum log level to capture with        *
	 * sails.log.*()                                                            *
	 *                                                                          *
	 * The order of precedence for log levels from lowest to highest is:        *
	 * silly, verbose, info, debug, warn, error                                 *
	 *                                                                          *
	 * You may also set the level to "silent" to suppress all logs.             *
	 *                                                                          *
	 ***************************************************************************/

	// level: 'info'
};
