const fs = require("fs"),
	xml2js = require("xml2js"),
	path = require("path"),
	{XMLParser} = require("fast-xml-parser"),
	AWS = require("aws-sdk");
AWS.config.update({key: sails.config.aws.key, secret: sails.config.aws.secret});

const s3 = new AWS.S3(),
	stateCodes = [
		{
			id: 1,
			name: "ANDAMAN & NICOBAR ISLANDS",
			code: "AN"
		},
		{
			id: 2,
			name: "ANDHRA PRADESH",
			code: "AP"
		},
		{
			id: 3,
			name: "ARUNACHAL PRADESH",
			code: "AR"
		},
		{
			id: 4,
			name: "ASSAM",
			code: "AS"
		},
		{
			id: 5,
			name: "BIHAR",
			code: "BR"
		},
		{
			id: 6,
			name: "CHANDIGARH",
			code: "CH"
		},
		{
			id: 7,
			name: "CHATTISGARH",
			code: "CG"
		},
		{
			id: 8,
			name: "DADRA & NAGAR HAVELI",
			code: "DN"
		},
		{
			id: 9,
			name: "DAMAN & DIU",
			code: "DD"
		},
		{
			id: 10,
			name: "DELHI",
			code: "DL"
		},
		{
			id: 11,
			name: "GOA",
			code: "GA"
		},
		{
			id: 12,
			name: "GUJARAT",
			code: "GJ"
		},
		{
			id: 13,
			name: "HARYANA",
			code: "HR"
		},
		{
			id: 14,
			name: "HIMACHAL PRADESH",
			code: "HP"
		},
		{
			id: 15,
			name: "JAMMU & KASHMIR",
			code: "JK"
		},
		{
			id: 16,
			name: "JHARKHAND",
			code: "JH"
		},
		{
			id: 17,
			name: "KARNATAKA",
			code: "KA"
		},
		{
			id: 18,
			name: "KERALA",
			code: "KL"
		},
		{
			id: 19,
			name: "LAKSHADWEEP",
			code: "LD"
		},
		{
			id: 20,
			name: "MADHYA PRADESH",
			code: "MP"
		},
		{
			id: 21,
			name: "MAHARASHTRA",
			code: "MH"
		},
		{
			id: 22,
			name: "MANIPUR",
			code: "MN"
		},
		{
			id: 23,
			name: "MEGHALAYA",
			code: "ML"
		},
		{
			id: 24,
			name: "MIZORAM",
			code: "MZ"
		},
		{
			id: 25,
			name: "NAGALAND",
			code: "NL"
		},
		{
			id: 26,
			name: "ODISHA",
			code: "OR"
		},
		{
			id: 27,
			name: "PONDICHERRY",
			code: "PY"
		},
		{
			id: 28,
			name: "PUNJAB",
			code: "PB"
		},
		{
			id: 29,
			name: "RAJASTHAN",
			code: "RJ"
		},
		{
			id: 30,
			name: "SIKKIM",
			code: "SK"
		},
		{
			id: 31,
			name: "TAMIL NADU",
			code: "TN"
		},
		{
			id: 32,
			name: "TELANGANA",
			code: "AP"
		},
		{
			id: 33,
			name: "TRIPURA",
			code: "TR"
		},
		{
			id: 34,
			name: "UTTAR PRADESH",
			code: "UP"
		},
		{
			id: 35,
			name: "UTTARAKHAND",
			code: "UL"
		},
		{
			id: 36,
			name: "WEST BENGAL",
			code: "WB"
		}
	];
module.exports = {
	friendlyName: "Equifax",

	description: "Equifax data.",

	inputs: {
		InputData: {
			type: "json",
			required: true
		},
		user_id: {
			type: "number"
			//required: true
		},
		bucket: {
			type: "string"
			//required: true
		}
	},

	exits: {
		success: {
			outputFriendlyName: "File successfully upload to s3 bucket",
			outputDescription: "Uploaded file description"
		},

		error: {
			description: "There is an error in uploading the file to s3"
		}
	},

	fn: async function (reqInput, exits) {
		const inputs = reqInput.InputData;

		let cibilScore = 0, errorData = "";
		 htmlObj = "";
		if (!inputs.firstName || !inputs.lastName || !inputs.inquiryAddresses || !inputs.dob || !inputs.panNumber) {
			return exits.error({statusCode: "NC500", message: "Mandatory fields are missing."});
		}

		const state = inputs.inquiryAddresses.state ? stateCodes.find((stateCode) => stateCode.name == inputs.inquiryAddresses.state.toUpperCase()) : '';
		userId = reqInput.user_id;

		let cotactXML = "";
		for (const i in inputs.inquiryPhones) {
			cotactXML =
				cotactXML +
				`<ns:InquiryPhone seq="${i}">
					<ns:Number>${inputs.inquiryPhones[i].number}</ns:Number>
					<ns:PhoneType>${inputs.inquiryPhones[i].phoneType}</ns:PhoneType>
				</ns:InquiryPhone>`;
		}

		const equfaxCred = {};
		if (inputs.requestFrom == "CUB") {
			equfaxCred.CustomerId = sails.config.equifax.cub.CustomerId;
			equfaxCred.userId = sails.config.equifax.cub.userId;
			equfaxCred.password = sails.config.equifax.cub.password;
			equfaxCred.memberNumber = sails.config.equifax.cub.memberNumber;
			equfaxCred.securityCode = sails.config.equifax.cub.securityCode;
			equfaxCred.productCode = sails.config.equifax.cub.productCode;
			equfaxCred.custRefField = sails.config.equifax.cub.custRefField;

			inputs.inquiryAddresses.state = stateCodes.find(
				(stateCode) => stateCode.name === inputs.inquiryAddresses.state
			);
		} else {
			equfaxCred.CustomerId = sails.config.equifax.nc.CustomerId;
			equfaxCred.userId = sails.config.equifax.nc.userId;
			equfaxCred.password = sails.config.equifax.nc.password;
			equfaxCred.memberNumber = sails.config.equifax.nc.memberNumber;
			equfaxCred.securityCode = sails.config.equifax.nc.securityCode;
			equfaxCred.productCode = sails.config.equifax.nc.productCode; // IDCR
			equfaxCred.custRefField = sails.config.equifax.nc.custRefField;
		}

		const hcData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://services.equifax.com/eport/ws/schemas/1.0">
						<soapenv:Header/>
						<soapenv:Body>
							<ns:InquiryRequest>
								<ns:RequestHeader>
									<ns:CustomerId>${equfaxCred.CustomerId}</ns:CustomerId>
									<ns:UserId>${equfaxCred.userId}</ns:UserId>
									<ns:Password>${equfaxCred.password}</ns:Password>
									<ns:MemberNumber>${equfaxCred.memberNumber}</ns:MemberNumber>
									<ns:SecurityCode>${equfaxCred.securityCode}</ns:SecurityCode>
									<ns:ProductVersion>1.0</ns:ProductVersion>
									<ns:ReportFormat>XML</ns:ReportFormat>
									<ns:ProductCode>${equfaxCred.productCode}</ns:ProductCode>
									<ns:CustRefField>${equfaxCred.custRefField}</ns:CustRefField>
								</ns:RequestHeader>
								  <ns:RequestBody>
								  <ns:InquiryPurpose>00</ns:InquiryPurpose>
								  <ns:TransactionAmount>${inputs.transactionAmount}</ns:TransactionAmount>
								  <ns:FullName>${inputs.firstName} ${inputs.lastName}</ns:FullName>
								  <ns:FirstName>${inputs.firstName} </ns:FirstName>
								  <ns:LastName>${inputs.lastName}</ns:LastName>
								  <ns:InquiryAddresses>
									  <ns:InquiryAddress seq="?">
										  <ns:AddressLine>${inputs.inquiryAddresses.addressLine ? inputs.inquiryAddresses.addressLine : ""}</ns:AddressLine>
										  <ns:City>${inputs.inquiryAddresses.city ? inputs.inquiryAddresses.city : ""}</ns:City>
										  <ns:State>${inputs.inquiryAddresses.state ? state.code : ""}</ns:State>
										  <ns:Postal>${inputs.inquiryAddresses.postal ? inputs.inquiryAddresses.postal : ""}</ns:Postal>
									  </ns:InquiryAddress>
								  </ns:InquiryAddresses>
								  <ns:MobilePhone>${inputs.inquiryPhones ? inputs.inquiryPhones : cotactXML}</ns:MobilePhone>
								  <ns:DOB>${inputs.dob ? inputs.dob : ""}</ns:DOB>
								  <ns:Gender>${inputs.gender ? inputs.gender : ""}</ns:Gender>
								  <ns:NationalIdCard>${inputs.nationalIdCard ? inputs.nationalIdCard : ""}</ns:NationalIdCard>
								  <ns:PANId>${inputs.panNumber ? inputs.panNumber : ""}</ns:PANId>
								  <ns:PassportId>${inputs.passportId ? inputs.passportId : ""}</ns:PassportId>
								  <ns:VoterId>${inputs.voterId ? inputs.voterId : ""}</ns:VoterId>
								  <ns:DriverLicense>${inputs.driverLicense ? inputs.driverLicense : ""}</ns:DriverLicense>
								  <ns:InquiryFieldsDsv/>
							  </ns:RequestBody>
								</ns:InquiryRequest>
						</soapenv:Body>
					</soapenv:Envelope>`,
			url = sails.config.equifax.url,
			method = "POST",
			header = {
				"Content-Type": "text/plain"
			};

		 clientRes = await sails.helpers.sailstrigger(url, hcData, header, method);
console.log("----------------", clientRes);
		if (clientRes.status == "nok") {
			return exits.error({statusCode: "NC500", message: "APi call failed. Please try after sometime."});
		}


		try {
			const parser = new XMLParser();
			const parsedJson = parser.parse(clientRes);
			if (parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:ReportData"]["sch:Error"]) {
				errorData = parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:ReportData"]["sch:Error"]["sch:ErrorMsg"];
			} else {
				scoreObj =
					parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:ReportData"]["sch:Score"];
				htmlObj = parsedJson["soapenv:Envelope"]["soapenv:Body"]["sch:InquiryResponse"]["sch:HtmlReportResponse"]["sch:Content"];
				cibilScore = scoreObj["sch:Value"];


			}
		} catch (error) {
			console.log(error.message);
		}
		if (!reqInput.user_id && !reqInput.bucket) {
			return exits.success({
				statusCode: "NC200",
				message: "Equifax Data",
				equifaxData: clientRes,
				cibilScore: cibilScore,
				ErrorMessage: errorData,
				htmlContent: htmlObj
			});
		} else {
			const builder = new xml2js.Builder(),
				xml = builder.buildObject(clientRes),
				logPath = path.join(__dirname, `../../equifaxfiles/${userId}.xml`),
				bodyData = (logPath, {headers: "key"});

			fs.writeFile(logPath, xml, async (err) => {
				if (err) {
					console.log("err");
					return exits.error(err)
				} else {
					const params = {
						Bucket: reqInput.bucket,
						Key: `equifax/${userId}.xml`,
						Body: fs.createReadStream(logPath)
					};

					await s3.upload(params, async (err, data) => {
						if (err) {
							return exits.error(err);
						}
						return exits.success({
							statusCode: "NC200",
							message: "Updated successfully",
							uploadDoc: data,
							cibilScore: cibilScore,
							htmlContent: htmlObj
						});
					});
					fs.unlink(logPath, (err) => {
						if (err) {
							console.log("Eqfax --", err);
						}
					});
				}
			});
		}
	}
};
