/**
 * EquiifaxController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
let xmlParser = require('xml2json');
const { decryptReq, encryptRes } = require("../services/encrypt");
const moment = require('moment')

const stateCodes = [
    { id: 1, name: 'ANDAMAN & NICOBAR ISLANDS', code: 'AN' },
    { id: 2, name: 'ANDHRA PRADESH', code: 'AP' },
    { id: 3, name: 'ARUNACHAL PRADESH', code: 'AR' },
    { id: 4, name: 'ASSAM', code: 'AS' },
    { id: 5, name: 'BIHAR', code: 'BR' },
    { id: 6, name: 'CHANDIGARH', code: 'CH' },
    { id: 7, name: 'CHATTISGARH', code: 'CG' },
    { id: 8, name: 'DADRA & NAGAR HAVELI', code: 'DN' },
    { id: 9, name: 'DAMAN & DIU', code: 'DD' },
    { id: 10, name: 'DELHI', code: 'DL' },
    { id: 11, name: 'GOA', code: 'GA' },
    { id: 12, name: 'GUJARAT', code: 'GJ' },
    { id: 13, name: 'HARYANA', code: 'HR' },
    { id: 14, name: 'HIMACHAL PRADESH', code: 'HP' },
    { id: 15, name: 'JAMMU & KASHMIR', code: 'JK' },
    { id: 16, name: 'JHARKHAND', code: 'JH' },
    { id: 17, name: 'KARNATAKA', code: 'KA' },
    { id: 18, name: 'KERALA', code: 'KL' },
    { id: 19, name: 'LAKSHADWEEP', code: 'LD' },
    { id: 20, name: 'MADHYA PRADESH', code: 'MP' },
    { id: 21, name: 'MAHARASHTRA', code: 'MH' },
    { id: 22, name: 'MANIPUR', code: 'MN' },
    { id: 23, name: 'MEGHALAYA', code: 'ML' },
    { id: 24, name: 'MIZORAM', code: 'MZ' },
    { id: 25, name: 'NAGALAND', code: 'NL' },
    { id: 26, name: 'ODISHA', code: 'OR' },
    { id: 27, name: 'PONDICHERRY', code: 'PY' },
    { id: 28, name: 'PUNJAB', code: 'PB' },
    { id: 29, name: 'RAJASTHAN', code: 'RJ' },
    { id: 30, name: 'SIKKIM', code: 'SK' },
    { id: 31, name: 'TAMIL NADU', code: 'TN' },
    { id: 32, name: 'TELANGANA', code: 'AP' },
    { id: 33, name: 'TRIPURA', code: 'TR' },
    { id: 34, name: 'UTTAR PRADESH', code: 'UP' },
    { id: 35, name: 'UTTARAKHAND', code: 'UL' },
    { id: 36, name: 'WEST BENGAL', code: 'WB' }
];

module.exports = {

    fetchData: async function (req, res) {

        try {
                        // // const userData = decryptReq(req.param("data"));
            const userData = req.param("data");
            const business_id = req.param("business_id");
            const director_id = req.param("director_id");
            // const {userData, business_id, director_id} = req.allParams();
            // let userData = req.allParams();
            if (!userData.firstName || !userData.lastName || !userData.inquiryAddresses || !userData.dob || !userData.panNumber) {
                return res.send({
                    statusCode: 'NC500',
                    message: 'Mandatory fields are missing.'
                });
            }

            let white_label_id, userid, loanRequestResult;

            if(business_id && director_id){

                const businessData = await Business.findOne({id: business_id})
                .select(["white_label_id", "userid"]);

                white_label_id = businessData.white_label_id;
                userid = businessData.userid;
                
                const director = await Director.findOne({id: director_id}).select(["dcibil_score"]);

                loanRequestResult = await Loanrequest.find({business_id: business_id})
                .select(["id", "loan_ref_id"]);
    
                const fileName = `${loanRequestResult[0].loan_ref_id}_${director_id}.xml`;
    
                const date = moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss");
    
                const equifaxDocument = await LoanDocument.find({
                    loan: loanRequestResult[0].id,
                    business_id: business_id,
                    user_id: userid,
                    doctype: sails.config.equifax.docTypeId,
                    doc_name: fileName,
                    directorId: director_id
                  }).sort("on_upd DESC").limit(1);
    
                if(
                    equifaxDocument && equifaxDocument[0] && 
                    director.dcibil_score && director.dcibil_score!=0 && 
                    moment(equifaxDocument[0].on_upd).format("YYYY-MM-DD HH:mm:ss") >= date
                ){
    
                    return res.send({
                        status: 'ok',
                        message: 'Fetched successfuly',
                        cibilScore: director.dcibil_score,            
                    });
    
                }
            }

            let cotactXML = '';
            for (let i in userData.inquiryPhones) {
                cotactXML = cotactXML +
                    `<ns:InquiryPhone seq="${i}">
                        <ns:Number>${userData.inquiryPhones[i].number}</ns:Number>
                        <ns:PhoneType>${userData.inquiryPhones[i].phoneType}</ns:PhoneType>
                    </ns:InquiryPhone>`

            }
            let equfaxCred = {};
            const url = sails.config.equifax.url;
            const state =  userData.inquiryAddresses.state ? stateCodes.find((stateCode) => stateCode.name == userData.inquiryAddresses.state.toUpperCase()) : '';
            userData.inquiryAddresses.state = state.code;
            if (userData.requestFrom == "CUB") {
                // url = `https://ists.equifax.co.in/creditreportws/CreditReportWSInquiry/v1.0?wsdl`;
                equfaxCred.CustomerId = sails.config.equifax.cub.CustomerId;
                equfaxCred.userId = sails.config.equifax.cub.userId;
                equfaxCred.password = sails.config.equifax.cub.password;
                equfaxCred.memberNumber = sails.config.equifax.cub.memberNumber;
                equfaxCred.securityCode = sails.config.equifax.cub.securityCode;
                equfaxCred.productCode = sails.config.equifax.cub.productCode;
                equfaxCred.custRefField = sails.config.equifax.cub.custRefField;
            } else {
                // url = `https://eportuat.equifax.co.in/creditreportws/CreditReportWSInquiry/v1.0?wsdl`;
                equfaxCred.CustomerId = sails.config.equifax.nc.CustomerId;
                equfaxCred.userId = sails.config.equifax.nc.userId;
                equfaxCred.password = sails.config.equifax.nc.password;
                equfaxCred.memberNumber = sails.config.equifax.nc.memberNumber;
                equfaxCred.securityCode = sails.config.equifax.nc.securityCode;
                equfaxCred.productCode = sails.config.equifax.nc.productCode; //IDCR
                equfaxCred.custRefField = sails.config.equifax.nc.custRefField;
            }

            let hcData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://services.equifax.com/eport/ws/schemas/1.0">
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
                                    <ns:TransactionAmount>${userData.transactionAmount}</ns:TransactionAmount>
                                    <ns:FullName>${userData.fullName}</ns:FullName>
                                    <ns:FirstName>${userData.firstName} </ns:FirstName>
                                    <ns:LastName>${userData.lastName}</ns:LastName>
                                    <ns:InquiryAddresses>
                                        <ns:InquiryAddress seq="?">
                                            <ns:AddressLine>${userData.inquiryAddresses.addressLine ? userData.inquiryAddresses.addressLine : ""}</ns:AddressLine>
                                            <ns:City>${userData.inquiryAddresses.city ? userData.inquiryAddresses.city : ""}</ns:City>
                                            <ns:State>${userData.inquiryAddresses.state ? userData.inquiryAddresses.state : ""}</ns:State>
                                            <ns:Postal>${userData.inquiryAddresses.postal ? userData.inquiryAddresses.postal : ""}</ns:Postal>
                                        </ns:InquiryAddress>
                                    </ns:InquiryAddresses>
                                    <ns:InquiryPhones>${cotactXML}</ns:InquiryPhones>
                                    <ns:DOB>${userData.dob ? userData.dob : ""}</ns:DOB>
                                    <ns:Gender>${userData.gender ? userData.gender : ""}</ns:Gender>
                                    <ns:NationalIdCard>${userData.nationalIdCard ? userData.nationalIdCard : ""}</ns:NationalIdCard>
                                    <ns:PANId>${userData.panNumber ? userData.panNumber : ""}</ns:PANId>
                                    <ns:PassportId>${userData.passportId ? userData.passportId : ""}</ns:PassportId>
                                    <ns:VoterId>${userData.voterId ? userData.voterId : ""}</ns:VoterId>
                                    <ns:DriverLicense>${userData.driverLicense ? userData.driverLicense : ""}</ns:DriverLicense>
                                    <ns:InquiryFieldsDsv/>
                                </ns:RequestBody> 
                                    </ns:InquiryRequest>
                            </soapenv:Body>
                        </soapenv:Envelope>`;
            // const url = ;
            const method = "POST";
            const header = {
                'Content-Type': 'text/plain'
            };
            let clientRes = await sails.helpers.apiTrigger(url, hcData, header, method);
            if (clientRes.status == "nok") {
                return res.send({ statusCode: 'NC500', message: 'APi call failed. Please try after sometime.' });
            }

            if(!business_id || !director_id)
                return res.send(clientRes);
            
            const uploadEquifaxDocumentResponse = await sails.helpers.uploadEquifaxDocument(clientRes, business_id, director_id, white_label_id, userid, loanRequestResult);
            const cibilScore = uploadEquifaxDocumentResponse.cibilScore? uploadEquifaxDocumentResponse.cibilScore: ""
            
            //update the cibil score in the director table
            if(cibilScore)
            await Director.update({id : director_id }).set({ dcibil_score: cibilScore });

            return res.send({
                status: uploadEquifaxDocumentResponse.status,
                message: uploadEquifaxDocumentResponse.message,
                cibilScore
            });

        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })
            
        }

    },

    fetchDataNPlusOne: async function (req, res){
        try {

            const { director_id } = req.allParams();

            if(!director_id) return res.send({
                status: "nok",
                message: "missing params"
            });

            const director = await Director.findOne({id: director_id}).select(["business", "dfirstname", "dlastname", "address1", "city", "state", "pincode", "dpancard", "ddob", "dcontact", "dcibil_score"]);

            if(!director.business || !director.dfirstname || !director.dlastname || !director.address1 || !director.city || !director.state || !director.pincode || !director.dpancard || !director.ddob){

                return res.send({
                    status: "nok",
                    message: "Director id has missing params"
                });

            }

            const business_id = director.business;

            const { white_label_id, userid } = await Business.findOne({id: business_id})
            .select(["white_label_id", "userid"]);

            const loanRequestResult = await Loanrequest.find({business_id: business_id})
            .select(["id", "loan_ref_id"]);

            const FileName = [`${loanRequestResult[0].loan_ref_id}_${director_id}.xml`, `${loanRequestResult[0].loan_ref_id}_${director_id}.html`];

            const date = moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss");

            const equifaxDocument = await LoanDocument.find({
                loan: loanRequestResult[0].id,
                business_id: business_id,
                user_id: userid,
                doctype: sails.config.equifax.docTypeId,
                doc_name: FileName,
                directorId: director_id
              }).sort("on_upd DESC").limit(1);

            if(
                equifaxDocument && equifaxDocument[0] && 
                director.dcibil_score && director.dcibil_score!=0 &&
                moment(equifaxDocument[0].on_upd).format("YYYY-MM-DD HH:mm:ss") >= date
            ){

                return res.send({
                    status: 'ok',
                    message: 'Fetched successfuly',
                    cibilScore: director.dcibil_score,
                });

            }
          
            const userData = {

                firstName: director.dfirstname,
                lastName: director.dlastname,
                inquiryAddresses: {
                    addressLine: director.address1,
                    city: director.city,
                    state: director.state,
                    postal: director.pincode
                },
                inquiryPhones: [
                    {
                        number: director.dcontact,
                        phoneType: "M"
                    }
                ],
                dob : director.ddob,
                panNumber : director.dpancard,
                
            }

        
            let cotactXML = '';
            for (let i in userData.inquiryPhones) {
                cotactXML = cotactXML +
                    `<ns:InquiryPhone seq="${i}">
                        <ns:Number>${userData.inquiryPhones[i].number}</ns:Number>
                        <ns:PhoneType>${userData.inquiryPhones[i].phoneType}</ns:PhoneType>
                    </ns:InquiryPhone>`

            }
            let equfaxCred = {};
            const url = sails.config.equifax.url;
            const state =  userData.inquiryAddresses.state ? stateCodes.find((stateCode) => stateCode.name == userData.inquiryAddresses.state.toUpperCase()) : '';
            userData.inquiryAddresses.state = state.code;
           
            equfaxCred.CustomerId = sails.config.equifax.nc.CustomerId;
            equfaxCred.userId = sails.config.equifax.nc.userId;
            equfaxCred.password = sails.config.equifax.nc.password;
            equfaxCred.memberNumber = sails.config.equifax.nc.memberNumber;
            equfaxCred.securityCode = sails.config.equifax.nc.securityCode;
            equfaxCred.productCode = sails.config.equifax.nc.productCode; //IDCR
            equfaxCred.custRefField = sails.config.equifax.nc.custRefField;
            

            let hcData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://services.equifax.com/eport/ws/schemas/1.0">
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
                                    <ns:TransactionAmount>${userData.transactionAmount}</ns:TransactionAmount>
                                    <ns:FullName>${userData.fullName}</ns:FullName>
                                    <ns:FirstName>${userData.firstName} </ns:FirstName>
                                    <ns:LastName>${userData.lastName}</ns:LastName>
                                    <ns:InquiryAddresses>
                                        <ns:InquiryAddress seq="?">
                                            <ns:AddressLine>${userData.inquiryAddresses.addressLine ? userData.inquiryAddresses.addressLine : ""}</ns:AddressLine>
                                            <ns:City>${userData.inquiryAddresses.city ? userData.inquiryAddresses.city : ""}</ns:City>
                                            <ns:State>${userData.inquiryAddresses.state ? userData.inquiryAddresses.state : ""}</ns:State>
                                            <ns:Postal>${userData.inquiryAddresses.postal ? userData.inquiryAddresses.postal : ""}</ns:Postal>
                                        </ns:InquiryAddress>
                                    </ns:InquiryAddresses>
                                    <ns:InquiryPhones>${cotactXML}</ns:InquiryPhones>
                                    <ns:DOB>${userData.dob ? userData.dob : ""}</ns:DOB>
                                    <ns:Gender>${userData.gender ? userData.gender : ""}</ns:Gender>
                                    <ns:NationalIdCard>${userData.nationalIdCard ? userData.nationalIdCard : ""}</ns:NationalIdCard>
                                    <ns:PANId>${userData.panNumber ? userData.panNumber : ""}</ns:PANId>
                                    <ns:PassportId>${userData.passportId ? userData.passportId : ""}</ns:PassportId>
                                    <ns:VoterId>${userData.voterId ? userData.voterId : ""}</ns:VoterId>
                                    <ns:DriverLicense>${userData.driverLicense ? userData.driverLicense : ""}</ns:DriverLicense>
                                    <ns:InquiryFieldsDsv/>
                                </ns:RequestBody> 
                                    </ns:InquiryRequest>
                            </soapenv:Body>
                        </soapenv:Envelope>`;
            // const url = ;
            const method = "POST";
            const header = {
                'Content-Type': 'text/plain'
            };
            let clientRes = await sails.helpers.apiTrigger(url, hcData, header, method);
            if (clientRes.status == "nok") {
                return res.send({ statusCode: 'NC500', message: 'APi call failed. Please try after sometime.' });
            }
            const uploadEquifaxDocumentResponse = await sails.helpers.uploadEquifaxDocument(clientRes, business_id, director_id, white_label_id, userid, loanRequestResult);
            const cibilScore = uploadEquifaxDocumentResponse.cibilScore? uploadEquifaxDocumentResponse.cibilScore: ""
            const equifax_url = uploadEquifaxDocumentResponse && uploadEquifaxDocumentResponse.url? uploadEquifaxDocumentResponse.url: "";

            //update the cibil score
            if(cibilScore)
            await Director.updateOne({id : director_id}).set({ dcibil_score: cibilScore });

            return res.send({
                status: uploadEquifaxDocumentResponse.status,
                message: uploadEquifaxDocumentResponse.message,
                cibilScore,
                // url: equifax_url
            });
            
        } catch (error) {
            
            return res.send({
                status: "nok",
                message: error.message
            });

        }

    }


};
