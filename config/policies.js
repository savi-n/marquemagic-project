/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */
module.exports.policies = {


    "*": ["reqResLogger"],

    /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/

    "*": ["reqResLogger"],

    ConsentController: {
        getConsent: true
    },
    EquifaxController: {
        fetchData: true
    },
    GstController: {
        gstConsentVerifyOTP: true,
        gstConsentSendOTP: true
    },

    // "*": true,
    "Client/generateLink": ["reqResLogger", "isClientAuthorized"],
    "Client/getDocuments": ["reqResLogger", "isClientAuthorized"],
    "ClientRequest/request_list": ["reqResLogger", "isClientAuthorized"],
    "ClientRequest/uploadToSailsExp": ["reqResLogger", "isClientAuthorized"],

    "Bank/bankList": ["reqResLogger", "isCustomerAuthorized"],
    "Bank/sbiPersonalGetCaptcha": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/sbiPersonalSubmitCaptcha": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/sbiPersonalSubmitOtp": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/sbiPersonalSelectAccount": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/hdfcSmiSubmitdetails": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/hdfcSmiSubmitOtp": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/hdfcSmiSelectAccount": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/hdfcSmiSubmitCaptcha": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/axisCorporateSubmitDetails": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/axisCorporateSubmitOtp": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/axisCorporateSubmitAccount": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/axisPersonalSubmitDetails": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/axisPersonalSubmitSecurityAnswer": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest",
    ],
    "Bank/axisPersonalSubmitOtp": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/kotakCorporateSubmitDetails": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/kotakCorporateSubmitOtp": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],
    "Bank/iciciSavingsSubmitDetails": ["reqResLogger",
        "isCustomerAuthorized", "isBankRequest"
    ],

    // "gst/gstGetCaptcha": [
    //     "isCustomerAuthorized", "isGstRequest"
    // ],
    // "gst/gstSubmitCaptcha": [
    //     "isCustomerAuthorized", "isGstRequest"
    // ],

    "gst/getCaptcha": ["reqResLogger", "isClientAuthorized"],
    "gst/submitCaptcha": ["reqResLogger", "isClientAuthorized"],

    "itr/itrGetCaptcha": ["reqResLogger",
        "isCustomerAuthorized", "isItrRequest"
    ],
    "itr/itrSubmitCaptcha": ["reqResLogger",
        "isCustomerAuthorized", "isItrRequest"
    ],
    "itr/itrSubmitFilings": [
        "reqResLogger", "isCustomerAuthorized", "isItrRequest"
    ],
    "itr/verifyOTPandGetItrDetails": ["reqResLogger", "isCustomerAuthorized"],
    "itr/addClient": ["reqResLogger", "isCustomerAuthorized"],
    "itr/readForm16": ["reqResLogger", "isCustomerAuthorized"],

    "RocGst/gstDataFetch": ["reqResLogger", "isClientAuthorized"],
    "RocGst/getROCData": ["reqResLogger", "isClientAuthorized"],

    "gst/generateLink": ["reqResLogger", "isClientAuthorized"],
    "gst/getGstData": ["reqResLogger", "isClientAuthorized"],
    "gst/getResponceBasedOnRequestId": ["reqResLogger", "isClientAuthorized"],
    "gst/generateTaxpayerOtp": ["reqResLogger", "validateRequestId"],
    "gst/verifyTaxpayerOtp": ["reqResLogger", "validateRequestId"],
    "gst/gstGetCaptcha": ["reqResLogger", "validateRequestId"],
    "gst/gstSubmitCaptcha": ["reqResLogger", "validateRequestId"],

    // add epfo and esic
    "EsicEpfo/getEpfoCaptcha": ["reqResLogger", "isClientAuthorized"],
    "EsicEpfo/epfoSubmitCaptcha": [
        "reqResLogger", "isClientAuthorized", "validateRequestId"
    ],
    "EsicEpfo/epfoSubmitCompany": [
        "reqResLogger", "isClientAuthorized", "validateRequestId"
    ],
    "EsicEpfo/esicGetCaptcha": ["reqResLogger", "isClientAuthorized"],
    "EsicEpfo/esicGetDistrict": [
        "reqResLogger", "isClientAuthorized", "validateRequestId"
    ],
    "EsicEpfo/esicSubmitCaptcha": [
        "reqResLogger", "isClientAuthorized", "validateRequestId"
    ],
    // "EsicEpfo/verificationData": ["isClientAuthorized"],
    "EsicEpfo/verificationApisData": ["reqResLogger", "isClientAuthorized"],
    "EsicEpfo/addVerificationRemarks": ["reqResLogger", "isClientAuthorized"],
    "EsicEpfo/getVerificationRemarks": ["reqResLogger", "isClientAuthorized"],

    // "Equifax/fetchDataNPlusOne": ["isClientAuthorized"],
    "MuthootCibilFetch": ["isClientAuthorized"],
    "Cub/generateOtp": ["reqResLogger", "isCustomerAuthorized"],
    "Cub/accountMiniStatement": ["reqResLogger", "isCustomerAuthorized"],
    "Kyc/getKycData": ["reqResLogger", "isClientAuthorized"],
    "Kyc/getKycDataUiUx": ["reqResLogger", "isClientAuthorized"],
    "Kyc/verifyKycData": ["reqResLogger", "isClientAuthorized"],
    "Kyc/verifySignature": ["reqResLogger", "isClientAuthorized"],
    "Kyc/photoMatch": ["reqResLogger", "isClientAuthorized"],
    "Kyc/checkForensicDetails": ["reqResLogger", "isClientAuthorized"],
    "Kyc/forensicFeedback": ["reqResLogger", "isClientAuthorized"],
    "Kyc/forensicHistory": ["reqResLogger", "isClientAuthorized"],
    "PdfForensic/pdfForensic": ["reqResLogger", "isClientAuthorized"],
    "Kyc/getForensicLink": ["reqResLogger", "isClientAuthorized"],
    "Kyc/initiateConsolidation": ["reqResLogger", "isClientAuthorized"],
    "Kyc/getConsolidatedForensicReport": ["reqResLogger", "isClientAuthorized"],
    "Kyc/consolidatedForensicReport": ["reqResLogger", "isClientAuthorized"],
    "Kyc/forensicReportStatus": ["reqResLogger", "isClientAuthorized"],
    "Kyc/ipBasedVpnVerification": ["reqResLogger", "isClientAuthorized"],
    "Udyam/udyamGetCaptcha": ["reqResLogger", "isClientAuthorized"],
    "Udyam/udyamSubmitCaptcha": ["reqResLogger", "isClientAuthorized"],
    "UdyogAadhaar/udyogAadhaarGetCaptcha": ["reqResLogger", "isClientAuthorized"],
    "UdyogAadhaar/udyogAadhaarSubmitCaptcha": ["reqResLogger", "isClientAuthorized"],
    "Passport/trackPassportStaus": ["reqResLogger", "isClientAuthorized"],
    "Kyc/location": ["reqResLogger", "isClientAuthorized"],
    "Crisil/placeData": ["reqResLogger", "isClientAuthorized"],
    "Crisil/checkDataStatus": ["reqResLogger", "isClientAuthorized"],
    "Documents/uploadCacheDocuments": ["reqResLogger", "isClientAuthorized"],
    "Crawler/udyogData": ["reqResLogger", "isClientAuthorized"],
    "Crawler/leiData": ["reqResLogger", "isClientAuthorized"],
    "Crawler/pan_aadhaar_link_status": ["reqResLogger", "isClientAuthorized"],
    "Crawler/udyamData": ["reqResLogger", "isClientAuthorized"],
    "Crawler/ckycData": ["reqResLogger", "isClientAuthorized"],
    "AadhaarOtpIntegration/aadhaarGenerateOtp": ["reqResLogger", "isClientAuthorized"],
    "AadhaarOtpIntegration/aadhaarVerifyOtp": ["reqResLogger", "isClientAuthorized"],
    "AadhaarOtpIntegration/aadhaarResendOtp": ["reqResLogger", "isClientAuthorized"],
    "Kyc/getKycDataUiUxNew": ["reqResLogger", "isClientAuthorized"],
    "Kyc/verifyKycDataUiUx": ["reqResLogger", "isClientAuthorized"],
    "DocQuality/initiate": ["reqResLogger", "isClientAuthorized"],
    "DocQuality/status": ["reqResLogger", "isClientAuthorized"],
    "DocQuality/initiateHFC": ["reqResLogger", "isClientAuthorized"],
    "Vehicle/vehicleRC": ["reqResLogger", "isClientAuthorized"],
    "DigiLocker/generateLink": ["reqResLogger", "isClientAuthorized"],
    "DigiLocker/fetchDetails": ["reqResLogger", "isClientAuthorized"],
};
