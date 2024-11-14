/**
 * Production environment settings
 * (sails.config.*)
 *
 * What you see below is a quick outline of the built-in settings you need
 * to configure your Sails app for production.  The configuration in this file
 * is only used in your production environment, i.e. when you lift your app using:
 *
 * ```
 * NODE_ENV=production node app
 * ```
 *
 * > If you're using git as a version control solution for your Sails app,
 * > this file WILL BE COMMITTED to your repository by default, unless you add
 * > it to your .gitignore file.  If your repository will be publicly viewable,
 * > don't add private/sensitive data (like API secrets / db passwords) to this file!
 *
 * For more best practices and tips, see:
 * https://sailsjs.com/docs/concepts/deployment
 */

module.exports = {
	/**************************************************************************
	 *                                                                         *
	 * Tell Sails what database(s) it should use in production.                *
	 *                                                                         *
	 * (https://sailsjs.com/config/datastores)                                 *
	 *                                                                         *
	 **************************************************************************/
	datastores: {
		/***************************************************************************
		 *                                                                          *
		 * Configure your default production database.                              *
		 *                                                                          *
		 * 1. Choose an adapter:                                                    *
		 *    https://sailsjs.com/plugins/databases                                 *
		 *                                                                          *
		 * 2. Install it as a dependency of your Sails app.                         *
		 *    (For example:  npm install sails-mysql --save)                        *
		 *                                                                          *
		 * 3. Then set it here (`adapter`), along with a connection URL (`url`)     *
		 *    and any other, adapter-specific customizations.                       *
		 *    (See https://sailsjs.com/config/datastores for help.)                 *
		 *                                                                          *
		 ***************************************************************************/
		default: {
			// adapter: 'sails-mysql',
			// url: 'mysql://user:password@host:port/database',
			//--------------------------------------------------------------------------
			//  /\   To avoid checking it in to version control, you might opt to set
			//  ||   sensitive credentials like `url` using an environment variable.
			//
			//  For example:
			//  ```
			//  sails_datastores__default__url=mysql://admin:myc00lpAssw2D@db.example.com:3306/my_prod_db
			//  ```
			//--------------------------------------------------------------------------
			/****************************************************************************
			 *                                                                           *
			 * More adapter-specific options                                             *
			 *                                                                           *
			 * > For example, for some hosted PostgreSQL providers (like Heroku), the    *
			 * > extra `ssl: true` option is mandatory and must be provided.             *
			 *                                                                           *
			 * More info:                                                                *
			 * https://sailsjs.com/config/datastores                                     *
			 *                                                                           *
			 ****************************************************************************/
			// ssl: true,
		},
	},

	models: {
		/***************************************************************************
		 *                                                                          *
		 * To help avoid accidents, Sails automatically sets the automigration      *
		 * strategy to "safe" when your app lifts in production mode.               *
		 * (This is just here as a reminder.)                                       *
		 *                                                                          *
		 * More info:                                                               *
		 * https://sailsjs.com/docs/concepts/models-and-orm/model-settings#?migrate *
		 *                                                                          *
		 ***************************************************************************/
		migrate: 'safe',

		/***************************************************************************
		 *                                                                          *
		 * If, in production, this app has access to physical-layer CASCADE         *
		 * constraints (e.g. PostgreSQL or MySQL), then set those up in the         *
		 * database and uncomment this to disable Waterline's `cascadeOnDestroy`    *
		 * polyfill.  (Otherwise, if you are using a databse like Mongo, you might  *
		 * choose to keep this enabled.)                                            *
		 *                                                                          *
		 ***************************************************************************/
		// cascadeOnDestroy: false,
	},

	/**************************************************************************
	 *                                                                         *
	 * Always disable "shortcut" blueprint routes.                             *
	 *                                                                         *
	 * > You'll also want to disable any other blueprint routes if you are not *
	 * > actually using them (e.g. "actions" and "rest") -- but you can do     *
	 * > that in `config/blueprints.js`, since you'll want to disable them in  *
	 * > all environments (not just in production.)                            *
	 *                                                                         *
	 ***************************************************************************/
	blueprints: {
		shortcuts: false,
	},

	/***************************************************************************
	 *                                                                          *
	 * Configure your security settings for production.                         *
	 *                                                                          *
	 * IMPORTANT:                                                               *
	 * If web browsers will be communicating with your app, be sure that        *
	 * you have CSRF protection enabled.  To do that, set `csrf: true` over     *
	 * in the `config/security.js` file (not here), so that CSRF app can be     *
	 * tested with CSRF protection turned on in development mode too.           *
	 *                                                                          *
	 ***************************************************************************/
	security: {
		/***************************************************************************
		 *                                                                          *
		 * If this app has CORS enabled (see `config/security.js`) with the         *
		 * `allowCredentials` setting enabled, then you should uncomment the        *
		 * `allowOrigins` whitelist below.  This sets which "origins" are allowed   *
		 * to send cross-domain (CORS) requests to your Sails app.                  *
		 *                                                                          *
		 * > Replace "https://example.com" with the URL of your production server.  *
		 * > Be sure to use the right protocol!  ("http://" vs. "https://")         *
		 *                                                                          *
		 ***************************************************************************/
		cors: {
			// allowOrigins: [
			//   'https://example.com',
			// ]
		},
	},

	/***************************************************************************
	 *                                                                          *
	 * Configure how your app handles sessions in production.                   *
	 *                                                                          *
	 * (https://sailsjs.com/config/session)                                     *
	 *                                                                          *
	 * > If you have disabled the "session" hook, then you can safely remove    *
	 * > this section from your `config/env/production.js` file.                *
	 *                                                                          *
	 ***************************************************************************/
	session: {
		/***************************************************************************
		 *                                                                          *
		 * Production session store configuration.                                  *
		 *                                                                          *
		 * Uncomment the following lines to finish setting up a package called      *
		 * "@sailshq/connect-redis" that will use Redis to handle session data.     *
		 * This makes your app more scalable by allowing you to share sessions      *
		 * across a cluster of multiple Sails/Node.js servers and/or processes.     *
		 * (See http://bit.ly/redis-session-config for more info.)                  *
		 *                                                                          *
		 * > While @sailshq/connect-redis is a popular choice for Sails apps, many  *
		 * > other compatible packages (like "connect-mongo") are available on NPM. *
		 * > (For a full list, see https://sailsjs.com/plugins/sessions)            *
		 *                                                                          *
		 ***************************************************************************/
		// adapter: '@sailshq/connect-redis',
		// url: 'redis://user:password@localhost:6379/databasenumber',
		//--------------------------------------------------------------------------
		// /\   OR, to avoid checking it in to version control, you might opt to
		// ||   set sensitive credentials like this using an environment variable.
		//
		// For example:
		// ```
		// sails_session__url=redis://admin:myc00lpAssw2D@bigsquid.redistogo.com:9562/0
		// ```
		//
		//--------------------------------------------------------------------------

		/***************************************************************************
		 *                                                                          *
		 * Production configuration for the session ID cookie.                      *
		 *                                                                          *
		 * Tell browsers (or other user agents) to ensure that session ID cookies   *
		 * are always transmitted via HTTPS, and that they expire 24 hours after    *
		 * they are set.                                                            *
		 *                                                                          *
		 * Note that with `secure: true` set, session cookies will _not_ be         *
		 * transmitted over unsecured (HTTP) connections. Also, for apps behind     *
		 * proxies (like Heroku), the `trustProxy` setting under `http` must be     *
		 * configured in order for `secure: true` to work.                          *
		 *                                                                          *
		 * > While you might want to increase or decrease the `maxAge` or provide   *
		 * > other options, you should always set `secure: true` in production      *
		 * > if the app is being served over HTTPS.                                 *
		 *                                                                          *
		 * Read more:                                                               *
		 * https://sailsjs.com/config/session#?the-session-id-cookie                *
		 *                                                                          *
		 ***************************************************************************/
		cookie: {
			// secure: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	},

	/**************************************************************************
	 *                                                                          *
	 * Set up Socket.io for your production environment.                        *
	 *                                                                          *
	 * (https://sailsjs.com/config/sockets)                                     *
	 *                                                                          *
	 * > If you have disabled the "sockets" hook, then you can safely remove    *
	 * > this section from your `config/env/production.js` file.                *
	 *                                                                          *
	 ***************************************************************************/
	sockets: {
		/***************************************************************************
		 *                                                                          *
		 * Uncomment the `onlyAllowOrigins` whitelist below to configure which      *
		 * "origins" are allowed to open socket connections to your Sails app.      *
		 *                                                                          *
		 * > Replace "https://example.com" etc. with the URL(s) of your app.        *
		 * > Be sure to use the right protocol!  ("http://" vs. "https://")         *
		 *                                                                          *
		 ***************************************************************************/
		// onlyAllowOrigins: [
		//   'https://example.com',
		//   'https://staging.example.com',
		// ],
		/***************************************************************************
		 *                                                                          *
		 * If you are deploying a cluster of multiple servers and/or processes,     *
		 * then uncomment the following lines.  This tells Socket.io about a Redis  *
		 * server it can use to help it deliver broadcasted socket messages.        *
		 *                                                                          *
		 * > Be sure a compatible version of @sailshq/socket.io-redis is installed! *
		 * > (See https://sailsjs.com/config/sockets for the latest version info)   *
		 *                                                                          *
		 * (https://sailsjs.com/docs/concepts/deployment/scaling)                   *
		 *                                                                          *
		 ***************************************************************************/
		// adapter: '@sailshq/socket.io-redis',
		// url: 'redis://user:password@bigsquid.redistogo.com:9562/databasenumber',
		//--------------------------------------------------------------------------
		// /\   OR, to avoid checking it in to version control, you might opt to
		// ||   set sensitive credentials like this using an environment variable.
		//
		// For example:
		// ```
		// sails_sockets__url=redis://admin:myc00lpAssw2D@bigsquid.redistogo.com:9562/0
		// ```
		//--------------------------------------------------------------------------
	},

	/**************************************************************************
	 *                                                                         *
	 * Set the production log level.                                           *
	 *                                                                         *
	 * (https://sailsjs.com/config/log)                                        *
	 *                                                                         *
	 ***************************************************************************/
	log: {
		level: 'debug',
	},

	http: {
		/***************************************************************************
		 *                                                                          *
		 * The number of milliseconds to cache static assets in production.         *
		 * (the "max-age" to include in the "Cache-Control" response header)        *
		 *                                                                          *
		 ***************************************************************************/
		cache: 365.25 * 24 * 60 * 60 * 1000, // One year

		/***************************************************************************
		 *                                                                          *
		 * Proxy settings                                                           *
		 *                                                                          *
		 * If your app will be deployed behind a proxy/load balancer - for example, *
		 * on a PaaS like Heroku - then uncomment the `trustProxy` setting below.   *
		 * This tells Sails/Express how to interpret X-Forwarded headers.           *
		 *                                                                          *
		 * This setting is especially important if you are using secure cookies     *
		 * (see the `cookies: secure` setting under `session` above) or if your app *
		 * relies on knowing the original IP address that a request came from.      *
		 *                                                                          *
		 * (https://sailsjs.com/config/http)                                        *
		 *                                                                          *
		 ***************************************************************************/
		// trustProxy: true,
	},

	/**************************************************************************
	 *                                                                         *
	 * Lift the server on port 80.                                             *
	 * (if deploying behind a proxy, or to a PaaS like Heroku or Deis, you     *
	 * probably don't need to set a port here, because it is oftentimes        *
	 * handled for you automatically.  If you are not sure if you need to set  *
	 * this, just try deploying without setting it and see if it works.)       *
	 *                                                                         *
	 ***************************************************************************/
	port: 1338,

	/**************************************************************************
	 *                                                                         *
	 * Configure an SSL certificate                                            *
	 *                                                                         *
	 * For the safety of your users' data, you should use SSL in production.   *
	 * ...But in many cases, you may not actually want to set it up _here_.    *
	 *                                                                         *
	 * Normally, this setting is only relevant when running a single-process   *
	 * deployment, with no proxy/load balancer in the mix.  But if, on the     *
	 * other hand, you are using a PaaS like Heroku, you'll want to set up     *
	 * SSL in your load balancer settings (usually somewhere in your hosting   *
	 * provider's dashboard-- not here.)                                       *
	 *                                                                         *
	 * > For more information about configuring SSL in Sails, see:             *
	 * > https://sailsjs.com/config/*#?sailsconfigssl                          *
	 *                                                                         *
	 **************************************************************************/
	// ssl: undefined,

	/**************************************************************************
	 *                                                                         *
	 * Production overrides for any custom settings specific to your app.      *
	 * (for example, production credentials for 3rd party APIs like Stripe)    *
	 *                                                                         *
	 * > See config/custom.js for more info on how to configure these options. *
	 *                                                                         *
	 ***************************************************************************/
	custom: {
		baseUrl: 'https://example.com',
		internalEmailAddress: 'support@example.com',

		// mailgunDomain: 'mg.example.com',
		// mailgunSecret: 'key-prod_fake_bd32301385130a0bafe030c',
		// stripeSecret: 'sk_prod__fake_Nfgh82401348jaDa3lkZ0d9Hm',
		//--------------------------------------------------------------------------
		// /\   OR, to avoid checking them in to version control, you might opt to
		// ||   set sensitive credentials like these using environment variables.
		//
		// For example:
		// ```
		// sails_custom__mailgunDomain=mg.example.com
		// sails_custom__mailgunSecret=key-prod_fake_bd32301385130a0bafe030c
		// sails_custom__stripeSecret=sk_prod__fake_Nfgh82401348jaDa3lkZ0d9Hm
		// ```
		//--------------------------------------------------------------------------
	},
        env: "DEVELOPMENT/QA",
	uat_env : false,
	grpc: {
		url: 'localhost:50051',
		protoPath: '../../config/protoFile/grpcRoc.proto',
	},
	 api: {
       	 	createClient: "http://localhost:1338/createClient",
        	clientLogin: "http://localhost:1338/GST-ROC/Login"
    	},

	quicko: {
		companyName: 'quicko',
		apiKey: "key_live_K0IU4M3fXgSgs58r68WBUYbKof588T8I",
	        apiSecret: "secret_live_zCc8csYqaKy3yd0xB8Mc9WXU5wM7beCX",
		apiVersion: '3.4.0',
		api: {
			authAPI: 'https://api.sandbox.co.in/authenticate',
			gstTaxPayerApi: {
				genrateOtp: 'https://api.sandbox.co.in/gsp/tax-payer',
				verifyOtp: 'https://api.sandbox.co.in/gsp/tax-payer',
				sessionExpiry: 'https://api.sandbox.co.in/gsp/tax-payer/',
				refreshAccess: 'https://api.sandbox.co.in/gsp/tax-payer/',
				logout: 'https://api.sandbox.co.in/gsp/tax-payer/',
				returns: {
					gst3BSummary: 'https://api.sandbox.co.in/gsp/tax-payer',
				},
			},
			pan: {
				verifyPan: 'https://api.quicko.com/pans', // Quicko API not mapped
				//panToGst: "https://api.sandbox.co.in/gst-portal/utilities/gstin-by-pan"
                                panToGst: "https://api.sandbox.co.in/gsp/public/pan"
			},
			gstPanApi: {
				gstAPI: 'https://api.sandbox.co.in/gsp/public/gstin',
				PanAPI: 'https://api.sandbox.co.in/gsp/public/pan',
			},
			rocApi: {
				rocCompanyApi: "https://api.sandbox.co.in/mca/company/master-data/search", //'https://api.sandbox.co.in/mca/companies',
				directorApi: 'https://api.sandbox.co.in/mca/directors',
			},
			itr: {
				addClient: 'https://api.sandbox.co.in/itd/eri/authorize/otp',
				itrAPI: 'https://api.sandbox.co.in/itd/eri/tax-payers/',
			},
		},
	},
	links: {
		gst3b: 'http://localhost:1337/gst3b', // prod http://20.198.7.40/
	},
	crawlUdyam_url: "https://c08kvegozi.execute-api.ap-south-1.amazonaws.com/crawl/udyam",
	cub: {
		encryptionKey: '2JTMW0CZYR',
		encryptReqResKey: 'htde6458dgej2164',
		apiKey: 'sHy8LudskbArALlsRwjGYFhFJKziBplQuZ/7ElQjk7I=',
		initRequest:
			'https://cubonlineaccount.cityunionbank.in/cublending-uat/InitService/Init/1.0.0',
		mobileValidator:
			'https://cubonlineaccount.cityunionbank.in/cublending-uat/User/GetUserDetails/1.0.0',
		inbEnquirySingleReq:
			'https://cubonlineaccount.cityunionbank.in/cublending-uat/Account/GetSingleAccountDetail/1.0.0',
		accountMiniStatement:
			'https://cubonlineaccount.cityunionbank.in/cublending-uat/Account/GetStatementDetails/1.0.0',
		onlineOperativeAccountSummary:
			'https://cubonlineaccount.cityunionbank.in/cublending-uat/Account/GetAllAccDetails/1.0.0',
	},
	aws: {
		cred: {
			accessKeyId: 'AKIA5TQLVQP6D4EGMDWY',
			secretAccessKey: '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',
			region: 'ap-southeast-1',
		},
		bucket: 'testbank-nc',
	},
	uploadToSails: {
		uploadToSailsBucket: 'http://3.108.54.252:1337/loanDocumentUpload/',
		uploadToSailsDB: 'http://3.108.54.252:1337/borrowerdoc-upload',
	},
	azure: {
		isActive: true,
		logUpload: true,
		is_dev_env: true,
		is_prod_env: false,
		dev_env: {
			storage: {
				isActive: true,
				storageAccountName: 'namastestorage',
				host: 'https://namastestorage.blob.core.windows.net',
				secret:
					'HzGnIbJHteCYj0jA2lrHdnoc1E4Qk3+5WWbBsWJUDzj2GnbZHmqerE28lu7F0LfI2GPwcPid3rBKzQYML+zMlw==',
			},
		},
		prod_env: {
			storage: {
				isActive: true,
				storageAccountName: 'namastestorage',
				host: 'https://namastestorage.blob.core.windows.net',
				secret:
					'HzGnIbJHteCYj0jA2lrHdnoc1E4Qk3+5WWbBsWJUDzj2GnbZHmqerE28lu7F0LfI2GPwcPid3rBKzQYML+zMlw==',
				logContainer: 'azure-log-nc-nodejs1',
			},
		},
	},
	equifax: {
		url : "https://ists.equifax.co.in/creditreportws/CreditReportWSInquiry/v1.0?wsdl",
		docTypeId : 258,
		cub: {
			CustomerId: '80', // prod data
			userId: 'STS_TESTCB',
			password: 'W3#QeicsB',
			memberNumber: '033FP04991',
			securityCode: 'S4Q',
			productCode: 'PCS',
			custRefField: 'A123456',
		},
		nc: {
			CustomerId: '7865',
			userId: 'STS_OPIDCR',
			password: 'W3#QeicsB',
			memberNumber: '029FP00072',
			securityCode: '6FU',
			productCode: 'IDCR',
			custRefField: '5000',
	},
		/*nc: {
			CustomerId: '21',
			userId: 'UAT_OPNFIN',
			password: 'V2*Pdhbr',
			memberNumber: '999AA00007',
			securityCode: '54J',
			productCode: 'PCS', //IDCR
			custRefField: '5000',
		},*/
	},
	kycExtraction: {
		apiVersion: '1.0.0',
		urls: {
			pan: 'http://kycapi.loan2pal.com:5000/pan',
			aadhar: 'http://kycapi.loan2pal.com:5000/aadhar', //'http://kycapi.loan2pal.com:5000/aadhar',
			voterid: 'http://kycapi.loan2pal.com:5000/voterid',
			licence: 'http://kycapi.loan2pal.com:5000/licence',
			passport: 'http://kycapi.loan2pal.com:5000/passport',
			aadhar_redact: 'http://kycapi.loan2pal.com:5000/aadhar_redact',
 			bank: "http://34.93.148.166:5000/detect_bank",
                        salary: "http://34.47.153.177:5001/extraction_data",
                        pnl: "http://34.47.153.177:5001/extraction_data",
                        bs: "http://34.47.153.177:5001/extraction_data",
                        gst: "http://34.47.153.177:5001/extraction_data",
                        itr: "http://34.47.153.177:5001/extraction_data",
                        cibil: "http://34.47.153.177:5001/extraction_data",

			//ip_vpn: 'https://pro.ip-api.com/batch?key=ZX7nH6yfRIjkZXL&fields=61439',
			ip_vpn: 'https://pro.ip-api.com/json/',
			mask: 'http://kyc-prod-1630372486.ap-south-1.elb.amazonaws.com/mask',
			sign_match: 'http://18.140.113.115:5001/sign_match',
			photo_match: 'http://18.140.113.115:5001/photo_match',
		},
		bucket: 'testbank-nc',
		region: 'ap-southeast-1',
		cloud: 'azure',
		 bigQuery: {
            		projectId: 'namastecredit-com',
            		dataset: 'QA',
            		table: 'kyc-metrics'
        	}
	},
	mlApis: {
        	docQuality: 'http://13.126.15.94:3000/image_quality'
    	},
	signzy: {
		service: 'Identity',
		loginUrl: 'https://preproduction.signzy.tech/api/v2/patrons/login',
		logoutUrl:
			'https://preproduction.signzy.tech/api/v2/patrons/logout?access_token=',
		identityUrl1: 'https://preproduction.signzy.tech/api/v2/patrons/',
		identityUrl2: '/identities',
		url: 'https://preproduction.signzy.tech/api/v2/snoops',
		username: 'namastecredit_test',
		password: 'gac2yXLhEEtSo4LER6WK',
		email: 'test@dummymail.com',
		callbackUrl: 'https://dummy-domain.com/path',
		authorization:
			'1q7hBRSuEIbiTzGZfkxkSScEwIIJGLaDn9zKv4jULPA2Rq1clLRzQXI1TpFH1HTJ',
		patronId: '60f582f87b1f1a00b8e895fc',
		task: {
			verification: 'verification',
		},
                udyam: {
            		url: 'https://api-preproduction.signzy.app/api/v3/udyam/registration',
            		accessToken: 'EJSy9wBVDVJw7gSmp09fnq90Q8ZP49EA'
        	},
		pan: {
			itemId: '61134d7e36c30da98ed1c739',
			accessToken: 'k6rcuu9hxga14qijdn6l6c90c9cuw79xe',
		},
		businessPan: {
          		  itemId: '62cfe889f97a3dd5630a6e10',
            		 accessToken: '9b3eteq5ze7xdw4omk5ht0n5y17l5ysri'
        	},
		voterid: {
			itemId: '6113600c36c30da98ed1ca01',
			accessToken: 'st1w711rqjpmscetrorwpqn6hu568zl8p',
		},
		dl: {
			itemId: '6113734136c30da98ed1cd8a',
			accessToken: 'qbifc4apn6aikdocyn9miy4tcd1nr41c',
		},
		passport: {
			itemId: '611c99195f309cd9031c56a8',
			accessToken: '3zhrun4eujni0c2xl0uhk58vkc2y8xix',
		},
		 vehicle: {
     		   url: "https://preproduction.signzy.tech/api/v2/patrons/60f582f87b1f1a00b8e895fc/vehicleregistrations",
        		token: "A5IvvdTv7zLgs4THw3fY4zN1H7PhvNqScm6VGLcp3MYFjk0lMj5GWmY3cJrPoqO5"
    		}
	},
	pincodeApi: {
		url: 'http://api.namastecredit.com/Salesreport/getCityStateByPincode?keyword=',
	},
	forensic: {
		url_image: 'http://34.93.148.166:8000/forensic', //'http://13.214.36.217:5000/forensic',
        	url_pdf: 'http://34.93.148.166:8000/pdf_forensic',
        	bank: 'http://34.93.148.166:8000/pdf_forensic',
        	salary: "http://34.93.148.166:8000/forensic",
        	pnl: "http://34.93.148.166:8000/forensic",
        	bs: "http://34.93.148.166:8000/forensic",
        	gst: "http://34.93.148.166:8000/forensic",
        	itr: "http://34.93.148.166:8000/forensic",
		cibil: "http://34.93.148.166:8000/forensic",
        	callback:{
            		updateData: 'updateForensicData',
            		updateImageLoc: 'updateImageLoc'
        	}
    	},
	crisil: {
		urls: {
			placeData: 'http://15.206.190.82:8000/place_data',
			checkDataStatus: 'http://15.206.190.82:8000/check_data_status',
		},
	},
	crawler_urls : {
            crawl_UdyogAadhaar:"https://ue9yz4vcn9.execute-api.ap-southeast-1.amazonaws.com/crawl/udyogAadhaar",
            crawl_lei: "https://ue9yz4vcn9.execute-api.ap-southeast-1.amazonaws.com/crawl/lei",
            crawl_panAadhaarLinkStatus: "https://ue9yz4vcn9.execute-api.ap-southeast-1.amazonaws.com/crawl/status/panAadhaarLink",
            //crawl_udyamData:"https://c08kvegozi.execute-api.ap-south-1.amazonaws.com/crawl/udyam",
	    crawl_ckyc: "https://ue9yz4vcn9.execute-api.ap-southeast-1.amazonaws.com/crawl/ckyc",
            crawl_udyamData: "https://5pfcrt7lb2.execute-api.ap-southeast-1.amazonaws.com/crawl/udyam",
        },

	aadhaarOtpIntegration: {
        ClientID: 74593316,
        Client_Secret: "qphSxgEBjb86Ct6RfdmD7oYnDBi69Dcv",
        shareCode: 1319,
        uniqueId: "NC",
        intiate_kyc_auto_url: "https://svcdemo.digitap.work/ent/v3/kyc/intiate-kyc-auto",
        submit_otp_url: "https://svcdemo.digitap.work/ent/v3/kyc/submit-otp",
        resend_otp_url: "https://svcdemo.digitap.work/ent/v3/kyc/resend-otp"
    },
	muthootCibilApi : {
		white_label_id : 9,
                commercial_cibil_docTypeId : 21,
        	url : "https://transunionapi-uat.muthootapps.com:9443/api/Cbil/GetConsumerData",
        	secretKey : "9612d917d74439f0b7c32f3c4a4753f2fbec574afe2d4f3dea7cc1b4cf8de4c3",
		IDV_url: "https://transunionapi-uat.muthootapps.com/api/Cbil/GetIDVEfficiencyDetails",
		IDV_docTypeId: 773
    },
    docTypeId: {
        itr: 146,
        gst3breturns: 121
    },
    hostName : "https://api3.loan2pal.com/api",
    qaHostName : "https://apiuat.namastecredit.com/api",
    crawlUdyam_url : "https://ue9yz4vcn9.execute-api.ap-southeast-1.amazonaws.com/crawl/udyam",
    ftr: {
	client: "common",
        allowedWhiteLabels: new Set([7,9]),
        allowedProducts: new Set([1, 2, 3, 24]),
        queueUrl: "amqps://admin:admin1231AABBA@b-445fb138-b74c-42a7-94ba-5401703f5845.mq.ap-southeast-1.amazonaws.com/kycqa",
        classificationUrl: "http://34.47.153.177:5000/doc_classifier",
	python_frt_report: "http://pythonqa.loan2pal.com/ftr_report",
        doctypes: [1, 100],
        sails_expirement_login_url: "http://3.108.54.252:1337/Login",
        documentTypes_api_url: "https://api3.loan2pal.com/loan/documentTypes",
        coApplicantDocList_api_url: "https://api3.loan2pal.com/coApplicantDocList?income_type=",
	email: "BCM@ui.com",
        password: "Test@1234",
        white_label_id: 9,
        lenderDoctypes_api_url: "https://api3.loan2pal.com/lender/doctype",
        docsMap: {
            GST: [
                "GST Returns",
                "GST Certificate of Entity"
            ],
            ITR: [
                "ITR AY 2014-2015",
                "ITR AY 2013-2014",
                "ITR AY 2012-2013",
                "ITR AY 2015-2016",
                "ITR AY 2016-2017",
                "ITR AY 2017-2018",
                "ITR Form 7 for trust filling",
                "ITR Previous to Previous Year",
                "ITR Previous Year",
                "ITR Latest Year"
            ],
            SALARY_SLIP: [
                "Payslip / Salaryslip",
                "Embassy/ CRO Cerified Salary Certificate/ latest 3 months salary slip",
                "Latest Salary Certificate/Slip (3 months) supported by 6 months salary Crediting Statement"
            ],
            "BS&PL": [
                "BS-PL 2016",
                "BS-PL 2017",
                "BS-PL 2018",
                "BS-PL 2019",
                "BS-PL 2020",
                "BS-PL 2021",
            ],
            FINANCIAL_DOCUMENTS: {
                "2016": "BS-PL 2016",
                "2017": "BS-PL 2017",
                "2018": "BS-PL 2018",
                "2019": "BS-PL 2019",
                "2020": "BS-PL 2020",
                "2021": "BS-PL 2021",
            },
            CIBIL: [
                "Proprietor/ Partner/ Director(s) CIBIL",
                "Business CIBIL",
                "Applicant / Co-Applicants(s) CIBIL"
            ],
            BANK_STATEMENT: [
                "Bank Statements - Entity and Applicants(s)",
                "Bank Statements - Applicant(s) and Co Applicant(s)",
                "Bank Statements - PERFIOS File in XLS",
                "Bank Statements - Applicants(s)",
                "Bank Statements -  Co Applicant(s)"
            ],
            AADHAR: [
                "Entity Address Proof (Business, Trust, Society etc)",
                "Director(s) Address(s) ( Aadhaar Card, Voter ID, Utility Bills, Rental Agreement)",
                "Applicant and Co-Applicant(s) Address Proof(s) (Aadhaar Card, Voter ID,DL, Utility Bills, Rental Agreement)",
                "Residence Address Proof",
                "Partner(s) Address(s)",
                "Proprietor Address Proof",
                "Co- Applicant(s) Address Proof(s)",
                "Trustees (s) Address(s)",
                "Members (s) Address(s)",
                "Director(s)  Aadhaar Card(s)",
                "Guarantor(s) Address(s)",
                "Promoter(s) Address(s)",
                "Udyog Aadhaar",
                "Aadhaar UID Card"
            ],
            DL: [
                "Applicant and Co-Applicant(s) Address Proof(s) (Aadhaar Card, Voter ID,DL, Utility Bills, Rental Agreement)",
                "KYC Documents(PAN, ADHAR, DL)",
                "Residence Address Proof"
            ],
            PAN: [
                "PANCard of Applicant and all Co-Applicants required",
                "Entity Pancard (Business, Trust, Society etc)",
                "Director(s) Pancard(s)",
                "Applicant and Co-Applicant(s) PANCARD(s)",
                "Partner(s) PAN Card(s)",
                "Proprietor Pan Card",
                "Co- Applicant(s) PAN Card(s)",
                "Business Pancard",
                "Trustees Pancard",
                "Society Members Pancard",
                "Association Members Pancard",
                "KYC Documents(PAN, ADHAR, DL)",
                "Guarantor(s) KYC Document(s)",
                "Promoter(s) KYC Document(s)",
                "PAN of firm"
            ],
            PASSPORT: [
                "DOB Proof",
                "Residence Address Proof",
                "Signature Proof",
                "Age Proof - Passport / Birth Certificate / Driving License/  SSLC or AISSE Certificate",
                "Certified copy of Passport, Visa, Work Permit, ID card/ Permanent Residence Proof"
            ],
            VOTER: [
                "Entity Address Proof (Business, Trust, Society etc)",
                "Director(s) Address(s) ( Aadhaar Card, Voter ID, Utility Bills, Rental Agreement)",
                "Applicant and Co-Applicant(s) Address Proof(s) (Aadhaar Card, Voter ID,DL, Utility Bills, Rental Agreement)",
                "Partner(s) Address(s)",
                "Proprietor Address Proof",
                "Co- Applicant(s) Address Proof(s)",
                "Trustees (s) Address(s)",
                "Members (s) Address(s)",
                "Guarantor(s) Address(s)",
                "Promoter(s) Address(s)",
                "Residence Address Proof"
            ],
            icici_application_form: [
                "Signed Application Form given to Lender"
            ],
            AADHAAR_CONSENT: [
                "Aadhaar Consent Form"
            ],
            FORM_60: [
                "Form 60"
            ],
            SIGNATURE: [
                "Signature Proof"
            ],
            PICTURE: [
                "Picture or Photos of Entities",
                "Customer Image"
            ],
            PHOTO: [
                "Picture or Photos of Entities",
                "Customer Image"
            ],
            PARTNERSHIP_DEED: [
                "Partnership Agreement"
            ],
            INCORPORATION_CERTIFICATE: [
                "Certificate of Incorporation"
            ],
            LLP_AGREEMENT: [
                "LLP Document"
            ],
            UDYAM_REG_CERTIFICATE: [
                "Company Registration (Entity Registration)"
            ],
            OTHERS: [
                "Other Documents"
            ]
        }
    },
    muthoot_cibil_api: "https://api3.loan2pal.com/api/fetchCibil",
    equifax_api : "https://api3.loan2pal.com/api/equifax/fetchDataNPlusOne",
    //muthoot_cibil_wrapper_api : "https://api3.loan2pal.com/api/fetchCibil"
    zohoCreds: {
        mailingToken: "Zoho-enczapikey PHtE6r1fQ7zt2jJ8pkVSs6O+FZOgY44t/+hmeVMS5ogWW/ZSGE1X/tl5xDa2/h95AfhARaaZnN1qsbie4unXd2a4PWxJXGqyqK3sx/VYSPOZsbq6x00etlkddEPcXYLse9Ri3SDWs9vfNA==",
        kycForensics: {
            recipients: [
                "rahit.mondal@namastecredit.com"
            ]
        }
    },
	IDV_docTypeId: 773,
	surePass: {
		panComprehensive: "https://sandbox.surepass.io/api/v1/pan/pan-comprehensive"
	},
	google: {
        	apiKey: 'AIzaSyBD1n5ajHV8PQdyhCMBOZGf7PKBD-iirlU'
        },
	udyamReportDocTypeId: 408,

	adhaarpdf:{
        	url:'https://c85w67kr1g.execute-api.ap-southeast-1.amazonaws.com/finnone/aadhaar/adhaarpdf'
    	},
	digiLocker: {
        	authorization: "NzQ1OTMzMTY6cXBoU3hnRUJqYjg2Q3Q2UmZkbUQ3b1luREJpNjlEY3Y=",
        	urls: {
            		generateLink: "https://apidemo.digitap.work/ent/v1/kyc/generate-url",
            		fetchDetails: "https://apidemo.digitap.work/ent/v1/kyc/get-digilocker-details",
            		generateAadhaar: "https://4dvhxfwmz0.execute-api.ap-south-1.amazonaws.com/aadhaar/adhaarpdf"
        	},
        	aadhar_doc_type: 365,
    	},
    	sms: {
        	url: "http://api.namastecredit.com/EventSms/send_digilocker_msg",
        	creds: {
            		userName: "NC_USER_CREATION",
            		pass: "nc@2024"
        	}
    	}
};