const errorResponse = (message = "", statusCode) => {
    return { status: "nok", message, statusCode };
};

const successResponse = (message = "") => {
    return { status: "ok", message, statusCode: 200 };
};
const cubErrorResponse = (message, statusCode) => {
    return { statusCode, message };
};

module.exports = {
    jwtTokens: {
        secret: "8e11b4b0d0472f343c8cf946496e027d"
    },
    grpcUrl: {
        bankUrl: "www.google.com/",
        gstUrl: "www.google.com/"
    },
    grpcPlaid: {
        url: "0.0.0.0:50051",
        protoPath: "../../config/protoFile/grpcPlaid.proto"
    },
    // dev URL
    api: {
        createClient: "http://localhost:1337/createClient",
        clientLogin: "http://localhost:1337/GST-ROC/Login"
    },
    cub: {
        secrateKey: "htde6458dgej2164"
    },
    // prod URL
    // api : {
    // createClient : "http://localhost:3000/createClient",
    // clientLogin : "http://localhost:3000/GST-ROC/Login"
    // },
    errRes: {
        missingFields: errorResponse("Mandatory fields are missing", 400),
        invalidParameter: errorResponse("Invalid Parameters or Invalid password", 401),
        noData: errorResponse("there is no data for this client", 200),
        unableToProcess: cubErrorResponse('We are unable to proceed right now. Please try after sometime.', "NC500"),
        noRelationshipWithBank: cubErrorResponse('You presently do not have any relationship with our bank. Kindly open a relationship and come back again.', 'NC305'),
        multipleAccounts: cubErrorResponse('Multiple accounts found. Please select one.', 'NC302'),
        individualApplication: cubErrorResponse('The application is currently for Individuals Only. Please contact your branch for processing your application.', 'NC306')
    },
    successRes: {
        login: successResponse("logged in successfully"),
        verify: successResponse("Verified successfully"),
        reqList: successResponse("Client request list")
    },
    missingParamsResponse: (missingFields) => {
        return {
            status: "nok",
            statusCode: 400,
            message: "Mandatory fields are missing",
            missingFields
        }
    },
    /*This is for the data recieved from forensic api in image key. If it's not forged it will send success to FE or else either warning or error according to the whitelabel*/
    dbForensicConstants: {
        'Not Tampered': true,
        'Tampered': false
    },
    /** This is the message composed on the basis of Image key in the forensic api, this message will be sent to FE as required by the PRD */
    jsonForensicMessages: {
        'Tampered': 'The uploaded document may potentially be tampered. Please upload an authentic document or proceed with the uploaded document',
        'Not Tampered': 'The image is clean.',
        'Success': 'success',
        'Total Failure': 'total_failure',
        'failed': 'failed',
        'Error': 'The uploaded document may potentially be tampered. Please upload an authentic document',
        'Warning': 'The uploaded document may potentially be tampered. Please upload an authentic document or proceed with the uploaded document'
    },
    /** This is an array of all the types of request that can come from frontend for type of document upload */
    requsetTypeArray: ["mask", "voter", "pan", "aadhar", "passport", "license", "DL", "voterid", "others"],
    /* This is used to convert the types coming from FE to valid request types that are then used in calling ML APIS and storing in DB */
    validRequestTypes: {
        mask: "mask",
        pan: "pan",
        aadhar: "aadhar",
        aadhaar: "aadhar",
        aadhar_redact: "aadhar_redact",
        aadhaar_redact: "aadhar_redact",
        passport: "passport",
        license: "license",
        DL: "license",
        voterid: "voter",
        voter: "voter",
        itr: "itr",
        bank: "bank",
        salary: "salary",
        pnl: "pnl",
        bs: "bs",
        gst: "gst",
        cibil: "cibil"
    },
    /* This is just a capitalized version of requesttypes only to show messages in proper format. */
    jsonType: {
        mask: "Mask",
        voterid: "Voter",
        pan: "Pan",
        aadhar: "Aadhar",
        passport: "Passport",
        license: "License",
        DL: "License",
        voter: "Voter",
        others: "Others"
    },
    /* subtypes are used in client request document, they are whole capitalised version of request types. Since the enum there is all capitalized. */
    subTypes: {
        mask: "MASK",
        voterid: "VOTER",
        pan: "PAN",
        aadhar: "AADHAAR",
        aadhar_redact: "AADHAAR_REDACT",
        passport: "PASSPORT",
        license: "DL",
        DL: "DL",
        voter: "VOTER",
        others: "OTHERS"
    },
    /** The processes that can be asked by FE while uploading document, extraction can be removed from this and only all and forensic can be used. Since now all extraction will also have forensic.  */
    processTypes: ["extraction", "forensic", "all"],
    /** This is created to add processname in the request document, and client request to distinguish the response. But this won't be used anymore since we are not storing it in request document anymore */
    processNames: {
        extraction: "KYC",
        all: "ALL",
        verification: "KYC",
        forensic: "FORENSIC"
    },
    /** These are error strings for different types of error during extraction and forensic */
    msgConstants: {
        MISSING_PARAMS: "Required parameters missing",
        INV_REQ_TYPE: "Invalid req_type. Please enter a valid req_type.",
        INV_PROCESS_TYPE: 'Invalid process_type. Please enter a valid process_type.',
        REF_ID_NOT_FOUND: "ref_id doesn't exist.",
        REQ_ID_NOT_FOUND: "No such request id found.",
        INV_REF_TYPE: "Invalid ref_type!",
        UNSUPPORTED_FORMAT: 'Uploaded file format is not supported. Please upload a png, jpeg or pdf file.',
        NOT_IMAGE: 'Uploaded file format is not supported. Please upload a png or jpeg file.',
        NO_BUCKET: 'No bucket found for the user.',
        UPLOAD_FAILED: 'File upload failed. Please try again.',
        UPLOAD_ERR: 'File upload failed. Please try again.',
        NO_FILE_UPLOAD: 'No file was uploaded. Please upload a file.',
        BAD_GATEWAY: 'Server error. Bad gateway',
        UNKNOWN: "Something went wrong.",
        SERV_ERR: 'Internal Server Error.',
        NOT_PDF: 'Uploaded file format is not supported. Please upload a pdf file.',
        EXTRACTION_FAILED: 'Unable to extract KYC Details from the uploaded document. Please upload a better quality document.',
        CASE_EXISTS: 'Report generation request already placed for this ref_no/case_no. New upload not allowed for this ref_no/case_no.',
        CASE_ALREADY_EXISTS: 'Report generation request already placed for this ref_no/case_no.',
        WRONG_REQ_ID: 'Please pass valids request id(s)'
    },
    verificationDataConstants: {
        GST: "GST Data",
        ESIC: "ESIC Data",
        EPFO: "EPFO Data",
        ITR: "ITR Data",
        ROC: "ROC Data",
        UDYOG_ADHAR: "Udyog Data",
        KYC: "Kyc Verification Data",
        PAN: "Pan Verification Data",
        PASSPORT: "Passport Verification Data",
        AADHAAR: "Aadhaar verification Data",
        VOTER: "Voter ID verification Data",
        DL: "DL Verfication Data",
        license: "DL Verification Data",
        aadhar: "Aadhaar Verification Data",
        passport: "Passport Verification Data",
        voter: "VoterId Verification Data",
        pan: "Pan Verification Data"

    },

    forensicDataConstants: {
        GST: "GST Data",
        ESIC: "ESIC Data",
        EPFO: "EPFO Data",
        ITR: "ITR Data",
        ROC: "ROC Data",
        UDYOG_ADHAR: "Udyog Data",
        KYC: "Kyc Verification Data",
        PAN: "Pan Verification Data",
        PASSPORT: "Passport Verification Data",
        AADHAAR: "Aadhaar verification Data",
        VOTER: "Voter ID verification Data",
        DL: "DL Verfication Data",
        license: "DL Forensic Check",
        aadhar: "Aadhaar Forensic check",
        passport: "Passport Forensic check",
        voter: "VoterId Forensic check",
        pan: "Pan Forensic check"

    },
    /** kyc document array for ekyc response table */
    kycArray: ["aadhar", "license", "voter", "passport"],
    kycMLApis: {
        pan: 'http://18.136.102.207:5000/pan',
        aadhar: 'http://18.136.102.207:5000/aadhar',
        voter: 'http://18.136.102.207:5000/voterid',
        license: 'http://18.136.102.207:5000/licence',
        passport: 'http://18.136.102.207:5000/passport',
    },
    /** These are the names of kyc_key that come from extracted data  */
    kycKeyConstants: {
        pan: "Pan_number",
        dl: "dl_no",
        aadhar: "Aadhar_number",
        voter: "vid",
        license: "dl_no",
        passport: "passport_no"
    },
    clientReqTypes: {
        docQuality: 'DOC_QUALITY'
    },

    mandatoryParams: {
        client: {
            createClient: [],
            generateLink: ["type"],
            sailsClientVerify: ["email", "white_label_id"]
        },
        ClientRequest: {
            request_list: ["req_type", "email"]
        },
        Bank: {
            sbiPersonalSubmitCaptcha: ["userId", "password", "captcha"],
            sbiPersonalSelectAccount: ["selectedAccount"],
            sbiPersonalSubmitOtp: ["otp"]
        },
        RocGst: {
            GSTROCLogin: ["password", "client_id"],
            getROCData: ["cin_number"]
        },
        Gst: {
            generateLink: ["type", "gstin"]
        }
    },

    stateCodes: [
        { state_code: "35", state_name: "Andaman & Nicobar Islands" },
        { state_code: "37", state_name: "Andhra Pradesh" },
        { state_code: "12", state_name: "Arunachal Pradesh" },
        { state_code: "18", state_name: "Assam" },
        { state_code: "10", state_name: "Bihar" },
        { state_code: "04", state_name: "Chandigarh" },
        { state_code: "22", state_name: "Chhattisgarh" },
        { state_code: "26", state_name: "Dadra & Nagar Haveli" },
        { state_code: "25", state_name: "Daman & Diu" },
        { state_code: "07", state_name: "Delhi" },
        { state_code: "30", state_name: "Goa" },
        { state_code: "24", state_name: "Gujarat" },
        { state_code: "06", state_name: "Haryana" },
        { state_code: "02", state_name: "Himachal Pradesh" },
        { state_code: "01", state_name: "Jammu & Kashmir" },
        { state_code: "20", state_name: "Jharkhand" },
        { state_code: "29", state_name: "Karnataka" },
        { state_code: "32", state_name: "Kerala" },
        { state_code: "31", state_name: "Lakshdweep" },
        { state_code: "23", state_name: "Madhya Pradesh" },
        { state_code: "27", state_name: "Maharashtra" },
        { state_code: "14", state_name: "Manipur" },
        { state_code: "17", state_name: "Meghalaya" },
        { state_code: "15", state_name: "Mizoram" },
        { state_code: "13", state_name: "Nagaland" },
        { state_code: "21", state_name: "Odisha" },
        { state_code: "97", state_name: "Other Territory" },
        { state_code: "34", state_name: "Puducherry" },
        { state_code: "03", state_name: "Punjab" },
        { state_code: "08", state_name: "Rajasthan" },
        { state_code: "11", state_name: "Sikkim" },
        { state_code: "33", state_name: "Tamil Nadu" },
        { state_code: "36", state_name: "Telangana" },
        { state_code: "16", state_name: "Tripura" },
        { state_code: "09", state_name: "Uttar Pradesh" },
        { state_code: "05", state_name: "Uttarakhand" },
        { state_code: "19", state_name: "West Bengal" }
    ],

    qNames: {
        GENERIC_Q: "generic-q", //"generic-q",
        KYC_Q: "kyc-q",
        NON_KYC_Q: "non-kyc-q",
        FINANCIAL_Q: "financial-q",
        OTHERS_Q: "others-q",
        LENDER_DOCUMENTS_Q: "lender-document-q",
        ICICI_APPLICATION_Q: "icici-application-q"
    }
};
