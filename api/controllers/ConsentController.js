/**
 * ConsentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { log } = require('winston');
const apiTrigger = require('../helpers/api-trigger');
const { encrypRes } = require('../services/encrypt');
const ITR_DOCTYPE = sails.config.docTypeId.itr;



const getDistinctGSTRecords = (gst_numbers) => {
    const recordsMap = new Map()
    gst_numbers.forEach(element => {
        recordsMap.set(element.gst_no, element)
    });

    const filteredGST = [];

    recordsMap.forEach((val, key) => {
        filteredGST.push(val)
    })
    return filteredGST;
}

module.exports = {

    getConsent: async function (req, res) {

        try {
            const { choice, loan_id } = req.allParams();

            //Authorization and many other checks need to happen here
            //so that we can pass the control to the next screen
    
            if (choice === "GST") {
    
                const sendOTPurl = `${sails.config.hostName}/gst/gstConsentSendOTP`;
                const verifyOTPurl = `${sails.config.hostName}/gst/gstConsentVerifyOTP`;
                let { gstin, username } = req.query;
                res.view('pages/gst', { gstin, username, sendOTPurl, verifyOTPurl, loan_id });
            }
            else if (choice === "ITR") {
    
                let { pan, loan_id, director_id } = req.query;
                const itrUrl = sails.config.hostName + '/consentMiddleware';
                res.view('pages/itr', { pan, loan_id, director_id, itrUrl });
            }
            else if (choice === "bureau") {
    
                const { pan ,loan_id, business_id, director_id} = req.query;

                const loan_record = await Loanrequest.findOne({ id: loan_id })
    
                let { mandatory_field } = await WhiteLabelSolutionRd.findOne({
                                id: loan_record.white_label_id
                            });
                
                mandatory_field = await JSON.parse(mandatory_field);

                let {dfirstname, dlastname, dcontact: phone, demail, ddob, city, state, pincode} = await Director.findOne({id: director_id}).select(["dfirstname", "dlastname", "dcontact", "demail", "ddob", "city", "state", "pincode"])
                const name = dfirstname + " " + dlastname;

                let is_equifax_otp_required = false;
                if(mandatory_field && mandatory_field.consent_verification && mandatory_field.consent_verification.is_equifax_otp_required){
                    is_equifax_otp_required = mandatory_field.consent_verification.is_equifax_otp_required;
                }
                const pincodeApiUrl = sails.config.hostName + '/pincode'
                const consentMiddlewareUrl =  sails.config.hostName + '/consentMiddleware';

                if(!state){
                    state = 'select';
                }
                return res.view('pages/equifaxnew', { director_id, business_id, loan_id, name, pan, phone, demail, ddob, city, state, pincode, pincodeApiUrl, is_equifax_otp_required, consentMiddlewareUrl });
                
            }
            else if (choice === "udyam") {
                const { udyamNum, business_id, loan_id } = req.query;
                const udyamUrl = sails.config.hostName + '/consentMiddleware';
                //res.view('pages/udyam',{udyamNum , business_id ,udyamUrl});
    
                if (!udyamNum || !business_id) {
                    return res.send({
                        status: 'nok',
                        message: "Missing params"
                    })
                }
    
                body = {
                    request_type: "udyam", business_id, request_id: udyamNum, loan_id
                }
                auth = {
                    "content-Type": "application/json"
                };
    
                
    
                let consentMiddlewareResponse = await sails.helpers.apiTrigger(
                    udyamUrl,
                    JSON.stringify(body),
                    auth,
                    "POST"
                );
    
                consentMiddlewareResponse = await JSON.parse(consentMiddlewareResponse);
    
                return res.send({
                    status: consentMiddlewareResponse.status,
                    message: consentMiddlewareResponse.message
                });
            }
            else if (choice === "ROC") {
    
                const { cin } = req.query;
                const Authorization = req.headers.authorization;
                console.log("🚀 ~ file: ConsentController.js:49 ~ req.headers:", req.headers)
    
                if (!cin) return res.send({
                    status: 400,
                    message: "cin number not provided"
                });
    
                res.send({
                    status: 200,
                    message: "response has been recorded"
                });
    
                //login to sails plaid first
                const data = {
                    cin_number: cin
                }
                const rocUrl = sails.config.hostName + "/ROCData",
                    body = JSON.stringify(data),
                    headers = { "Content-Type": "application/json", Authorization: Authorization },
                    method = "POST";
    
                let rocResponse = await sails.helpers.apiTrigger(rocUrl, body, headers, method);
                console.log(rocResponse);
                rocResponse = await JSON.parse(rocResponse);
                return rocResponse;
    
                // return console.log(rocResponse);
    
            }
            else if (choice === "aadhaar") {
                const { aadhaarNo } = req.query;
                let verifyOtpUrl = sails.config.hostName + '/aadhaar/verifyOTP';
                let resendOtpUrl = sails.config.hostName + '/aadhaar/resendOTP';
                console.log(resendOtpUrl);
                body = {
                    aadhaarNo: aadhaarNo
                }
                auth = {
                    "content-Type": "application/json",
                    "Authorization": req.headers.authorization
                };
    
                const authorization = auth.Authorization;
                console.log(body);
                const aadhaarGenerateOTPResponse = await sails.helpers.apiTrigger(
                    sails.config.hostName + '/aadhaar/generateOTP',
                    JSON.stringify(body),
                    auth,
                    "POST"
                );
    
                const aadhaarGenerateotp_parse_data = await JSON.parse(aadhaarGenerateOTPResponse);
                console.log(aadhaarGenerateotp_parse_data);
                if (!(aadhaarGenerateotp_parse_data.data && aadhaarGenerateotp_parse_data.data.transactionId)) return res.send("otp generation failed!");
                // const aadhaarGenerateotp_parse_data= JSON.parse(aadhaarGenerateOTPResponse); 
                res.view('pages/aadhar', {
                    aadhaarNo,
                    verifyOtpUrl,
                    resendOtpUrl,
                    transactionId: aadhaarGenerateotp_parse_data.data.transactionId,
                    fwdp: aadhaarGenerateotp_parse_data.data.fwdp,
                    codeVerifier: aadhaarGenerateotp_parse_data.data.codeVerifier,
                    authorization
                });
    
            }
            else if (choice === "crime_check") {
                const { crime_check, business_id, director_id, is_applicant, isSelectedProductTypeBusiness} = req.allParams();
                let updateBusinessData, updateDirectorData;
                if (!business_id || !crime_check) {
                    return res.send({
                        status: "nok",
                        message: "Mandatory fields are missing"
                    })
                }
                if ((business_id && is_applicant == 1) || (business_id && isSelectedProductTypeBusiness == "true")){
                    updateBusinessData = await Business.update({ id: business_id }).set({
                        crime_check
                    }).fetch();
                }
                if (director_id && director_id!=undefined) {
                    updateDirectorData = await Director.update({ id: director_id }).set({
                        crime_check
                    }).fetch();
                }
    
                return res.send({
                    status: "ok",
                    message: "successfully updated",
                    // data: {
                    //     business_details: updateBusinessData,
                    //     director_details: updateDirectorData
                    // }
                })
            }
            else if (choice === "ckyc") {
                let { pan, director_id } = req.query
    
                if(!pan || !director_id) return res.send({
                    status: "nok",
                    message: "mandatory params missing"
                });
    
                let ckyc_url = sails.config.crawler_urls.crawl_ckyc;
                let body = {
                    pan: pan
                }
                auth = {
                    "content-Type": "application/json"
                }
                let ckycResponse = await sails.helpers.apiTrigger(
                    ckyc_url,
                    JSON.stringify(body),
                    auth,
                    "POST"
                );
                ckycResponse = await JSON.parse(ckycResponse);
                // let ckyc_no = ckycResponse_parse && ckycResponse_parse.data ? ckycResponse_parse.data.ckyc_id : "";
                
                if(ckycResponse && ckycResponse.resCode == 'SUCCESS' && ckycResponse.data){
                
                    const datetime = await sails.helpers.dateTime();
                    const panNoResponse = await PannoResponse.findOne({
                        kyc_key: pan,
                      }).select('verification_response');
             
                    // find the verfication_response data object in the database
                    let data;

                    //check if the object is not null
                    if (panNoResponse) {

                        // If a record exists, update it with the new data and datetime
                        if(panNoResponse.verification_response){
                        
                            data = panNoResponse.verification_response;
                            data = JSON.parse(data);
                            data.ckycResponse=ckycResponse? ckycResponse.data:null;

                        }
                        else{
                            data = { ckycResponse: ckycResponse? ckycResponse.data:null};
                        }
                        
                        await PannoResponse.updateOne(
                          { id: panNoResponse.id },
                          {
                            verification_response: JSON.stringify(data),
                            ints: datetime,
                          }
                        );
                      } else {
                        // If no record exists, create a new record with the kyc_key, new data, and datetime
                        await PannoResponse.create({
                          kyc_key: pan,
                          verification_response: JSON.stringify(data),
                          dt_created: datetime,
                          ints: datetime
                        });
                      }
                      

                    return res.send({
                        status: "ok",
                        data: ckycResponse,
                        message: ckycResponse.message
                    });
                }

                return res.send({
                    status: "nok",
                    message: "Failed to fetch ckyc data!"
                });


            }
            else {
                return res.badRequest({
                    status: "nok",
                    message: "Wrong Input"
                });
            }
    
        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })
            
        }

    },

    consentMiddleware: async function (req, res) {
        let { consent, loan_id, director_id, business_id, request_id } = req.allParams();
        if (!consent) consent = req.param('request_type');


        if (!loan_id) {
            return res.send({
                status: "nok",
                message: "Mandatory fields are missing"
            });
        }
        if (consent === "itr") {
            let { username, password, loanid, director_id, isBusiness } = req.allParams();
            if (!director_id) director_id = undefined;
            console.log(username, password, loanid, director_id, isBusiness);
            if (!username || !password || !loanid || (!isBusiness && isBusiness !== false))
                return res.send({
                    status: 400,
                    "message": "missing params"
                });

            //getting white_label_id using loanid
            const { white_label_id, business_id } = await Loanrequest.findOne({
                id: loanid
            }).select(["white_label_id", "business_id"]);

            const { userid } = await Business.findOne({
                id: business_id
            }).select("userid");

            const statusHistory = await LoanDocument.find({
                loan: loanid,
                business_id: business_id,
                user_id: userid,
                doctype: ITR_DOCTYPE,
                directorId: director_id,
            });

            let datetime = await sails.helpers.dateTime();

            if (statusHistory && statusHistory[0]) {
                if (statusHistory[0].document_status == "Fetched") {
                    return res.send({
                        status: 200,
                        message: "Data has already been fetched!"
                    });
                }
                else {
                    await LoanDocument
                        .update({
                            loan: loanid,
                            business_id: business_id,
                            user_id: userid,
                            doctype: ITR_DOCTYPE,
                            directorId: director_id,
                            or: [
                                { document_status: "In Progress" },
                                { document_status: "Failed" },
                                { document_status: null }
                            ]

                        })
                        .set({
                            ints: datetime,
                            on_upd: datetime,
                            document_status: "In Progress"
                        });

                }
            }
            else {

                await LoanDocument.create({
                    loan: loanid,
                    business_id: business_id,
                    doctype: ITR_DOCTYPE,
                    doc_name: `${datetime}`,
                    user_id: userid,
                    ints: datetime,
                    on_upd: datetime,
                    directorId: director_id,
                    document_status: "In Progress"
                });

            }

            res.send({
                status: 200,
                message: "Your Response has been recorded"
            });

            console.log("here");
            //calling our crawler for ITR
            const itrResponse = await sails.helpers.itrConsent(username, password, isBusiness);
            console.log(itrResponse);

            if (!itrResponse || !itrResponse.response || itrResponse.response.status != "ok") {

                datetime = await sails.helpers.dateTime();

                await LoanDocument
                    .update({
                        loan: loanid,
                        business_id: business_id,
                        user_id: userid,
                        doctype:ITR_DOCTYPE,
                        directorId: director_id,
                        or: [
                            { document_status: "In Progress" },
                            { document_status: "Failed" },
                            { document_status: null }
                        ]

                    })
                    .set({
                        ints: datetime,
                        on_upd: datetime,
                        document_status: "Failed"
                    });
                return console.log("Failed!")

            }

            //getting s3 location with the help of white_lable_id
            const { s3_name } = await WhiteLabelSolutionRd.findOne({
                id: white_label_id
            }).select("s3_name");

            //preparing data to call our helper function to copy data from src Bucket to dest Bucket
            const response = itrResponse.response;
            if (!response.bucket) return res.send("failed!");
            const srcBucket = response.bucket.split("/")[0];
            const srcKey = response.bucket.split("/")[1] + "/" + response.key;
            const destBucket = s3_name;
            const destKey = "users_" + userid + "/" + response.key;

            //copy our file to correct S3 bucket
            await sails.helpers.s3CopyObject(srcBucket, srcKey, destBucket, destKey);

            datetime = await sails.helpers.dateTime();

            //updating the data to the database
            await LoanDocument
                .update({
                    loan: loanid,
                    business_id: business_id,
                    user_id: userid,
                    doctype: ITR_DOCTYPE,
                    directorId: director_id,
                    or: [
                        { document_status: "In Progress" },
                        { document_status: "Failed" },
                        { document_status: null }
                    ]

                })
                .set({
                    doc_name: response.key,
                    uploaded_doc_name: response.key,
                    ints: datetime,
                    on_upd: datetime,
                    document_status: "Fetched"
                });

            return console.log(itrResponse);
        }
        else if (consent === "bureau") {

            try {

                const { request, mobile , otp, pan, name, city, state, dob, pincode} = req.allParams();
                const os = "windows",
                device_id = "abcde",
                fcm_id = 'temp',
                flag = true;

                if (request == "sendOTP") {

                    if (!pan || !business_id || !director_id) return res.send({
                        status: "nok",
                        message: "Mandatory Params Missing."
                    });
                    //send OTP to the user's registered mobile no.
                    let otpResponse = await sails.helpers.generateOtp(mobile, os, device_id, flag);
                    otpResponse = await JSON.parse(otpResponse);
                    console.log(otpResponse);

                    if(otpResponse && otpResponse.status == "nok" && otpResponse.message){
                        return res.send({
                            status: "nok",
                            message: otpResponse.message
                        });
                    }

                    if (otpResponse && otpResponse.message) {
                        return res.send({
                            status: "ok",
                            message: "OTP sent successfully!"
                        });
                    }

                    return res.send({
                        status: "nok",
                        message: "Could not generate OTP, Please try again later!",
                        data : otpResponse
                    });


                }
                else if (request == "verifyOTP" || request == "equifax") {
                    //verify OTP and if OTP verification successfull 
                if (request == "verifyOTP"){

                    if(!mobile || !otp) return res.send({
                        status: "ok",
                        message: "mandatory params missing"
                    });

                    let verifyOTPResponse = await sails.helpers.verifyOtp(mobile, os, device_id, fcm_id, otp);
                    verifyOTPResponse = await JSON.parse(verifyOTPResponse);
                    //if the OTP verification fails then don't proceed further
                    if (!verifyOTPResponse || verifyOTPResponse.status=="nok" || verifyOTPResponse.message != "OTP verified") {
                        return res.send({
                            status: "nok",
                            message: verifyOTPResponse.message || "OTP verification failed!"
                        });
                    }
                }
                    //if the OTP is verified successfully move ahead
                 //then proceed further with extraction of cibil score

                    const director = await Director.findOne({
                        id: director_id
                    }).select(["dfirstname", "dlastname", "ddob", "address1", "address2", "address3", "address4", "city", "state", "pincode", "dcontact"])

                    if(!director){
                        return res.send({
                            status: "nok",
                            message: "Director does not exist"
                        });
                    }

                    let data = {
                        director_id: director_id,
                        business_id: business_id,
                        data:{
                        firstName: director.dfirstname,
                        lastName: director.dlastname,
                        inquiryAddresses: {
                            addressLine: director.address1 || city,
                            city: director.city || city,
                            state: director.state || state,
                            postal: director.pincode || pincode
                        },
                        inquiryPhones: [
                            {
                                number: director.dcontact || mobile,
                                phoneType: "M"
                            }
                        ],
                        dob : director.ddob,
                        panNumber : pan,
                        
                        }
                    };

                    const url = sails.config.hostName+"/equifax/fetchData",
                        body = JSON.stringify(data),
                        headers = {
                             "Content-Type": "application/json" 
                            },
                        method = "POST"

                    // return res.send({
                    //     status: "ok",
                    //     message: "Data Fetched Successfully!"
                    // })

                    let equifaxResponse = await sails.helpers.apiTrigger(url, body, headers, method);
                    equifaxResponse = await JSON.parse(equifaxResponse);

                    if (equifaxResponse && (equifaxResponse.statusCode == "NC500" || equifaxResponse.status=="nok")) {
                        return res.send({
                            status: "nok",
                            message: equifaxResponse.message
                        });
                    };
                    const updateDirectorData = {};

                    if(!director.address1) updateDirectorData.address1 = city;
                    if(!director.city) updateDirectorData.city = city;
                    if(!director.state) updateDirectorData.state = state;
                    if(!director.pincode) updateDirectorData.pincode = pincode;
                    if(!director.dcontact) updateDirectorData.dcontact = mobile;

                    if(director && Object.keys(updateDirectorData).length>0){
                        await Director.updateOne({id: director.id})
                                        .set(updateDirectorData);
                    }

                    const cibil = equifaxResponse.cibilScore;
                    if (!cibil) {
                        return res.send(400,{
                            status: "nok",
                            message: "Cibil score not found."
                        });
                    }

                    return res.send({
                        status: "ok",
                        message: "Data Fetched Successfully"
                    });

                }
                else {
                    return res.send({
                        status: "nok",
                        message: "Invalid request Paramter"
                    });
                }
            } catch (error) {
                console.log(error);
                return res.send({
                    status: "nok",
                    message: error.message
                });
            }
        }
        else if (consent === "udyam") {
            body = {
                udyamRegNo: request_id
            }
            auth = {
                "content-Type": "application/json"
            };

            let crawlUdyamResponse = await sails.helpers.apiTrigger(
                sails.config.crawler_urls.crawl_udyamData,
                JSON.stringify(body),
                auth,
                "POST"
            )
            let udyamResponse = crawlUdyamResponse;

            if (typeof crawlUdyamResponse !== "string") udyamResponse = JSON.stringify(crawlUdyamResponse);
            else crawlUdyamResponse = await JSON.parse(crawlUdyamResponse);
            
            const businessData = await Business.update({ id: business_id }).set({ udyam_response: udyamResponse }).fetch();

            if( crawlUdyamResponse && crawlUdyamResponse.resCode == "SUCCESS" && crawlUdyamResponse.data ){
                
                return res.send({
                    status: "ok",
                    message: crawlUdyamResponse.message || "successfull updation",
                });

            }

            return res.send({
                status: "nok",
                message: crawlUdyamResponse.message || "Failed to fetch and update udyam data"
            });

            
        }
        else if (consent === "gst") {

            try {

                const { request } = req.allParams();

                if (request === "sendOTP") {
                    const { gstin, username } = req.allParams();
                    const data = {
                        gstin,
                        username
                    }

                    const url = sails.config.hostName + '/gst/gstConsentSendOTP',
                        body = JSON.stringify(data),
                        headers = { "Content-Type": "application/json" },
                        method = "POST"

                    const gstSendOTPResult = await sails.helpers.apiTrigger(url, body, headers, method);

                    if (!gstSendOTPResult || !gstSendOTPResult.status === "ok")
                        return res.send({
                            status: 400,
                            message: "Some Error Occurred"
                        });

                    return res.send({
                        status: 200,
                        message: "OTP sent successfully"
                    });

                }
                else if (request === "verifyOTP") {

                    const { gstin, username, otp, loan_id } = req.allParams();
                    const data = {
                        gstin,
                        username,
                        otp,
                        loan_id
                    }

                    const url = sails.config.hostName + '/gst/gstConsentVerifyOTP',
                        body = JSON.stringify(data),
                        headers = { "Content-Type": "application/json" },
                        method = "POST"

                    const gstSendVerifyResult = await sails.helpers.apiTrigger(url, body, headers, method);

                    if (!gstSendVerifyResult || !gstSendVerifyResult.status === "ok")
                        return res.send({
                            status: 400,
                            message: "Some Error Occurred"
                        });

                    return res.send({
                        status: 200,
                        message: "Your Details have been recorded"
                    });


                }
                else {
                    return res.send({
                        status: 400,
                        message: "Invalid params"
                    });
                }


            } catch (error) {

            }


        }
        else {
            return res.send({
                status: 404,
                message: "Invalid request"
            });
        }

    },

    consentDetails: async function (req, res) {
        try {
            const { business_id, loan_ref_id, loan_id, isSelectedProductTypeBusiness, isSelectedProductTypeSalaried } = req.allParams();

            if (!business_id || !loan_ref_id || !loan_id || 
                isSelectedProductTypeBusiness==null || isSelectedProductTypeBusiness== undefined || 
                isSelectedProductTypeSalaried==null || isSelectedProductTypeSalaried== undefined) 
                return res.badRequest({
                    message: "missing params"
             });

            let isBusiness;
            const loan_record = await Loanrequest.findOne({ id: loan_id }).select(["loan_request_type", "loan_ref_id", "white_label_id"]);
            if (loan_record) {
                if (loan_record.loan_request_type == 1)
                    isBusiness = true
                else isBusiness = false
            }
            else {
                return res.badRequest({
                    status: 'nok',
                    message: 'No records found for the given loan id'
                })
            }

            let { mandatory_field } = await WhiteLabelSolutionRd.findOne({
                    id: loan_record.white_label_id
            });

            mandatory_field = await JSON.parse(mandatory_field);
            const consent_config = {};

            if(mandatory_field && mandatory_field.consent_details){
                
                mandatory_field.consent_details.forEach((item)=>{

                    consent_config[item] = true;
    
                });
    
            }
            else{
                return res.badRequest({
                    message: "consent details are not configured!"
                });
            }
            //getting director details
            const directors = await Director.find({
                business: business_id
            }).select(["dfirstname", "dlastname", "dpancard", "daadhaar", "dcibil_score", "crime_check", "isApplicant", "ckyc_no"]);

            //getting business details
            const business = await Business.findOne({
                id: business_id
            }).select(["businessname", "crime_check", "businesspancardnumber", "udyam_response", "udyam_number", "corporateid", "gstin", "userid"]);

            if (!business)
                return res.badRequest({
                    status: 'nok',
                    message: 'No record for given business id'
                });

            let consent_details = [], companyMasterData = {}, aadhar_directors = [], pan_directors = [], pan_directors_business = {}, company_details = [], itr_directors = [], udyam_details = {}, udyam_parse_data, udyam_record = [], crime_check = [], director = [], ckyc_data = [], crime_check_business = {}, ckyc_data_business = {}, gst_details = [], aadhar_response, itr_response, pan_details = {}, gst1b_details = {}, itr = {}, temp = {};

            if (isBusiness && business && isSelectedProductTypeBusiness) {         //only for business loans
                
                //udyam
          
                udyam_parse_data = await JSON.parse(business.udyam_response);
                
                if(consent_config['UDYAM']){

                udyam_details = {

                    business_id : business.id || "",
                    udyamNum : business.udyam_number || "",
                    name : business.businessname || "",
                    status : udyam_parse_data && udyam_parse_data.resCode == "SUCCESS" && udyam_parse_data.data ? "Fetched" : "Not fetched"

                }

                }
                //roc data
                if (business.corporateid) {

                    if(consent_config['ROC']){

                        response = await CompanyMasterData.findOne({ cin: business.corporateid }).select("OUTPUT_JSON");
                        const status_response = response?.OUTPUT_JSON ? await JSON.parse(response.OUTPUT_JSON).data : null;
    
                        companyMasterData = {
                            name: business.businessname || "",
                            cin: business.corporateid || "",
                            status: status_response ? "Fetched" : "Not Fetched"
                        }
                    }
                    
                }

                // itr data
                if(consent_config['ITR'])
                company_details = await getCompanyITRData(business, business_id, loan_id);
  
                //gst details
                if(consent_config['GST'])
                gst_details = await getGSTDetails(business.businesspancardnumber, business, loan_record);

                //crime check
                if(consent_config['CRIME CHECK'])
                crime_check_business = {
                    name: business.businessname || "",
                    pan: business.businesspancardnumber || "",
                    status: business.crime_check || "",
                    is_applicant: directors[0].isApplicant,
                    disclaimer: "If you do not want Crime Check, please change to No"
                };

            }

            if (isSelectedProductTypeSalaried && directors) {                   //only for individual loans
                
                //aadhaar_data
                if(consent_config['AADHAAR'])
                aadhar_directors = await getAadhaarData(directors); 
                
            }

            if (business || director) {          //individual loan records for the case of business loans        
                
                //crime check
                if(consent_config['CRIME CHECK'])
                crime_check = getCrimeCheck(directors);
               
                //cibil data
                if(consent_config['BUREAU'])
                pan_directors = await getCibilData(directors, business_id, loan_id, loan_record.loan_ref_id, business.userid);

                //ckyc data
                if(consent_config['c-KYC'])
                ckyc_data = await getCkycData(directors);

                // itr data
                if(consent_config['ITR'])
                itr_directors = await getITRDirectors(directors, business_id, loan_id);

            }

            //creating data to push into consent_details
            let udyam_data = {
                id: "udyam",
                name: "UDYAM",
                fields: [
                    {
                        headers: ['Company Name', 'Udyam Number', 'Status'],
                        data: Object.keys(udyam_details).length == 0 ? [] : [udyam_details]
                    }
                ]
            }
            consent_details.push(udyam_data);

            let roc_data = {
                id: "roc",
                name: "ROC",
                fields: [
                    {
                        headers: ['Company Name', 'CIN Number', 'Status'],
                        data: Object.keys(companyMasterData).length == 0 ? [] : [companyMasterData]
                    }
                ]
            }
            consent_details.push(roc_data);

            let gst_data = {
                id: "gst",
                name: "GST",
                fields: [
                    {
                        headers: ['Company Name', 'GST Number', 'Status'],
                        data: gst_details

                    }
                ]
            };
            consent_details.push(gst_data);

            let aadhaar_data = {
                id: "aadhaar",
                name: "AADHAAR",
                fields: [
                    {
                        headers: ['Applicant Name', 'Aadhaar Number', 'Status'],
                        data: aadhar_directors
                    }
                ]
            }
            consent_details.push(aadhaar_data);

            let cibil_data = {
                id: "bureau",
                name: "BUREAU",
                fields: [
                    {
                        headers: ['Applicant Name', 'PAN Number', 'Status'],
                        data: pan_directors
                    },
                    {
                        headers: ['Company Name', 'PAN Number', 'Status'],
                        data: [] //Object.keys(pan_directors_business).length == 0 ? [] : [pan_directors_business]
                    }
                ]
            }
            consent_details.push(cibil_data);

            let crime_check_data = {
                id: "crime_check",
                name: "CRIME CHECK",
                fields: [
                    {
                        headers: ['Applicant Name', 'PAN Number', 'Status'],
                        data: crime_check
                    },
                    {
                        headers: ['Company Name', 'PAN Number', 'Status'],
                        data: Object.keys(crime_check_business).length == 0 ? [] : [crime_check_business]
                    }
                ]
            }
            consent_details.push(crime_check_data);

            let itr_data = {
                id: "itr",
                name: "ITR",
                fields: [
                    {
                        headers: ['Applicant Name', 'PAN Number', 'Status'],
                        data: itr_directors
                    },
                    {
                        headers: ['Company Name', 'PAN Number', 'Status'],
                        data: company_details
                    }
                ]
            }
            consent_details.push(itr_data);

            let ckyc_details = {
                id: "ckyc_data",
                name: "c-KYC",
                fields: [
                    {
                        headers: ['Applicant Name', 'PAN Number', 'Status'],
                        data: ckyc_data
                    },
                    // {
                    //     headers: ['Company Name', 'PAN Number', 'Status'],
                    //     data: [] //Object.keys(ckyc_data_business).length == 0 ? [] : [ckyc_data_business]
                    // }
                ]
            }
            consent_details.push(ckyc_details)
            return res.ok({
                response: consent_details
            });
        }
        catch (error) {
            return res.badRequest({
                status: "nok",
                message: error.message
            });
        }
    } 
};


async function getITRDirectors(directors, business_id, loan_id){

    const itr_directors = [];
    for (let i = 0; i < directors.length; i++) {
        let item = directors[i];
        const itr = {
            name: (item.dfirstname || "") + (item.dfirstname && item.dlastname ? " " : "") + (item.dlastname || ""),
            pan: item.dpancard || "",
            director_id: item.id || ""
        }
        if (item.id && business_id && loan_id) {
            itr_response = await LoanDocument.find({ doctype: ITR_DOCTYPE, directorId: item.id, business_id: business_id, loan: loan_id }).limit(1);
        }
        //calculating itr status
        let itr_status = "Not Fetched";
        if (itr_response && itr_response[0])
            itr_status = itr_response[0].document_status;
        itr.status = itr_status || "";
        itr_directors.push(itr);
    }
    return itr_directors;

}

async function getAadhaarData(directors){

    const aadhar_directors = [];

    for (let i = 0; i < directors.length; i++) {
        let item = directors[i];
        let aadhaar = {
            name: (item.dfirstname || "") + (item.dfirstname && item.dlastname ? " " : "") + (item.dlastname || ""),
            aadhaar: item.daadhaar || ""
        }
        const EkycRes = await EKycResponse.find({
            kyc_key: item.daadhaar,
            or: [
                {response: {'!=': null}},
                {response: {'!=': ''}}
            ]
        })
            .select("response")
            .sort("updated DESC");

        //check if response is okay or not
        //make flag variable
        let check_200_response_flag = false;

        //iterate through all the rows to check if any of them has the status as 200
        for (let i = 0; i < EkycRes.length; i++) {
            
            if (EkycRes[i] && EkycRes[i].response){
                const json_parsed_response = await JSON.parse(EkycRes[i].response);
                if(json_parsed_response.code && json_parsed_response.code==200){
                    check_200_response_flag = true; //update the status if status code is 200
                    break;
                }
            }  
        }
        aadhaar.status = check_200_response_flag? "Fetched" : "Not Fetched";
        aadhar_directors.push(aadhaar);
    }      

    return aadhar_directors;

}

async function getCompanyITRData(business, business_id, loan_id){

    const company_details = [];

    const temp = {}
    temp.name = business.businessname || "";
    temp.pan = business.businesspancardnumber || "";

    let itr_response = undefined;
    if (business_id && loan_id) {
        itr_response = await LoanDocument

            .find({ doctype: ITR_DOCTYPE, loan: loan_id })
            .limit(1);
    }

    temp.status = itr_response.length > 0 ? "Fetched" : "Not Fetched";
    company_details.push(temp);

    return company_details;

}

async function getCibilData(directors, business_id, loan_id, loan_ref_id, userid){
    const pan_directors = []
    for (let i = 0; i < directors.length; i++) {
        let item = directors[i];

        const fileName = `${loan_ref_id}_${item.id}.xml`;

        const equifaxDocument = await LoanDocument.find({
            loan: loan_id,
            business_id: business_id,
            user_id: userid,
            doctype: sails.config.equifax.docTypeId,
            doc_name: fileName,
            directorId: item.id
          });

        pan_details = {
            name: (item.dfirstname || "") + (item.dfirstname && item.dlastname ? " " : "") + (item.dlastname || ""),
            status: equifaxDocument && equifaxDocument[0] ? "Fetched" : "Not Fetched",
            pan: item.dpancard || "",
            director_id: item.id
        }
        pan_directors.push(pan_details);
    }
    return pan_directors;
}

async function getCkycData(directors){

    const ckyc_data = []
    if (directors.length > 0) {
        for(let i=0;i<directors.length;i++) {

            const director = directors[i];
            const pan = director.dpancard;
            // ckyc_status = director.ckyc_no
            const sixMonthsAgoTimestamp = new Date();
            sixMonthsAgoTimestamp.setMonth(sixMonthsAgoTimestamp.getMonth() - 6);
          
            let panNoResponse = await PannoResponse.find({
                kyc_key: pan,
                dt_created: { '>=': sixMonthsAgoTimestamp }
            }).sort("ints desc").select("verification_response").limit(1);

            let status = "Not Fetched";
            
            panNoResponse = panNoResponse[0];

            if(panNoResponse){
                const verification_response = JSON.parse(panNoResponse.verification_response);
                status = verification_response.ckycResponse? "Fetched": "Not Fetched";
            }

            const ckyc = {
                name: (director.dfirstname || "") + (director.dfirstname && director.dlastname ? " " : "") + (director.dlastname || ""),
                director_id: director.id || "",
                pan: director.dpancard || "",
                status: status
            };
            ckyc_data.push(ckyc);
        };
    }
    return ckyc_data;
}

function getCrimeCheck(directors){

    const crime_check = [];

    if (directors.length > 0) {
        directors.forEach(director => {
            const newObj = {
                name: (director.dfirstname || "") + (director.dfirstname && director.dlastname ? " " : "") + (director.dlastname || ""),
                director_id: director.id || "",
                pan: director.dpancard || "",
                is_applicant: director.isApplicant,
                status: director.crime_check,
                disclaimer: "If you do not want Crime Check, please change to No"
            };
            crime_check.push(newObj);
        });
    }

    return crime_check;

}

async function getGSTDetails(pan, business, loan_record){

    //get gst details from PanToGst
    const gstDetails = await sails.helpers.panToGst(pan);

    let gst = {};
    const gstConsentData = [];

    //if there are gstDetails coming back from PanToGst
    if(gstDetails && gstDetails.length>0){

        for(let i=0;i<gstDetails.length;i++){

            gst.name = business.businessname;
            gst.gstn = gstDetails[i].gstin;
            const gst_document_name = `${loan_record.loan_ref_id}_${gstDetails[i].gstin}.csv`

            //checking the status from the loanDocument table
            const gst_loan_document = await LoanDocument.find({
                loan: loan_record.id,
                business_id: business.business_id,
                user_id: business.userid,
                doc_name: gst_document_name
            });

            gst.status = gst_loan_document && gst_loan_document[0]?"Fetched": "Not Fetched";
            gstConsentData.push(gst);
            gst = {};

        }

    return gstConsentData;

    }
    
    //else return an empty array
    return [];

};
