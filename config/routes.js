/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

const EsicEpfoController = require("../api/controllers/EsicEpfoController");

module.exports.routes = {
    /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

    // '/': { view: 'pages/homepage' },
    //public routes
    '/itr': 'RoutesController.itr',
    '/gst': 'RoutesController.gst',
    '/aadhar': 'RoutesController.aadhar',
    '/equifax': 'RoutesController.equifax',

    "POST /createClient": {
        action: "client/createClient"
    },
    "POST /generateLink": {
        action: "client/generateLink"
    },
    "POST /getDocuments": {
        action: "client/getDocuments"
    },
    // Delete below
    "GET /encrypt": {
        action: "dummy/encryptData"
    },
    "GET /decrypt": {
        action: "dummy/decryptData"
    },
  
    "GET /gstdata/verify": {
        action: "gst/gstOutputUpdate"
    },
    "GET /gstdata/verify": {
        action: "gst/gstOutputUpdate"
    },
    "GET /gstGetCaptcha": {
        action: "gst/gstGetCaptcha"
    },
    "POST /gstSubmitCaptcha": {
        action: "gst/gstSubmitCaptcha"
    },
    "POST /gst/getCaptcha": {
        action: "gst/getCaptcha"
    },
    "POST /gst/submitCaptcha": {
        action: "gst/submitCaptcha"
    },

    "POST /gst/gstConsentSendOTP": {
        action: "gst/gstConsentSendOTP"
    },
    "POST /gst/gstConsentVerifyOTP": {
        action: "gst/gstConsentVerifyOTP"
    },
    "GET /itrGetCaptcha": {
        action: "itr/itrGetCaptcha"
    },
    "POST /itrSubmitCaptcha": {
        action: "itr/itrSubmitCaptcha"
    },
    "POST /itrSubmitFilings": {
        action: "itr/itrSubmitFilings"
    },
    "POST /GST-ROC/Login": {
        action: "RocGst/GSTROCLogin"
    },
    "POST /equifax/login": {
        action: "RocGst/GSTROCLogin"
    },
    "POST /GSTData": {
        action: "RocGst/gstDataFetch"
    },
    "POST /ROCData": {
        action: "RocGst/getROCData"
    },
    "POST /sails-exp/ClientVerify": {
        action: "client/sailsClientVerify"
    },
    "GET /test": {
        action: "Dummy/test"
    },
    "GET /requestList ": {
        action: "ClientRequest/request_list"
    },

    "POST /gst/generateLink": {
        action: "gst/generateLink"
    },
    "POST /gst/generateTaxpayerOtp": {
        action: "gst/generateTaxpayerOtp"
    },
    "POST /gst/verifyTaxpayerOtp": {
        action: "gst/verifyTaxpayerOtp"
    },
    "POST /gst/getGstData": {
        action: "gst/getGstData"
    },

    "POST /gst3b/cred/getCaptcha": {
        action: "gst/gstGetCaptcha"
    },
    "POST /gst3b/cred/submitCaptcha": {
        action: "gst/gstSubmitCaptcha"
    },

    "POST /getResponceBasedOnRequestId": {
        action: "gst/getResponceBasedOnRequestId"
    },
    "POST /pan/verifyPan": {
        action: "pan/verifyPan"
    },
    "POST /panToGst": {
        action: "pan/panToGst"
    },

    "POST /epfo/getCaptcha": {
        action: "EsicEpfo/getEpfoCaptcha"
    },
    "POST /epfo/submitCaptcha": {
        action: "EsicEpfo/epfoSubmitCaptcha"
    },
    "POST /epfo/submitCompany": {
        action: "EsicEpfo/epfoSubmitCompany"
    },
    "POST /esic/getCaptcha": {
        action: "EsicEpfo/esicGetCaptcha"
    },
    "POST /esic/getDistrict": {
        action: "EsicEpfo/esicGetDistrict"
    },
    "POST /esic/submitCaptcha": {
        action: "EsicEpfo/esicSubmitCaptcha"
    },
// ITR Sandbox
    "POST /itr/readForm16": {
        action: "itr/readForm16"
    },
    "POST /itr/addClient": {
        action: "itr/addClient"
    },
    "POST /itr/verifyOTPandGetItrDetails": {
        action: "itr/verifyOTPandGetItrDetails"
    },

    "POST /uploadToSailsExp": {
        action: "ClientRequest/uploadToSailsExp"
    },

    "POST /equifax/fetchData": {
        action: "Equifax/fetchData"
    },
    "POST /equifax/fetchDataNPlusOne": {
        action: "Equifax/fetchDataNPlusOne"
    },

    "POST /getKycData": {
        action: "Kyc/getKycData"
    },
    "POST /getKycDataUiUx": {
        action: "Kyc/getKycDataUiUx"
    },
    "POST /verifyKycData": {
        action: "Kyc/verifyKycData"
    },
    "POST /verifySignature": {
        action: "Kyc/verifySignature"
    },
    "POST /photoMatch": {
        action: "Kyc/photoMatch"
    },
    "POST /pdf_forensic": {
        action: "PdfForensic/pdfForensic"
    },
    "POST /updateImageLoc": {
        action: "Kyc/updateImageLoc"
    },
    // "POST /updateForensicData": {
    //     action: "Kyc/updateForensicData"
    // },
    "POST /forensicFeedback": {
        action: "Kyc/forensicFeedback"
    },
    "POST /checkForensicDetails": {
        action: "Kyc/checkForensicDetails"
    },
    "GET /forensicHistory": {
        action: "Kyc/forensicHistory"
    },
    "GET /forensic/getLink": {
        action: "Kyc/getForensicLink"
    },
    "POST /forensic/initiateConsolidation": {/* This callback is lentra team to indicate their file upload is done for a specific case */
        action: "Kyc/initiateConsolidation"
    },
    "POST /forensic/consolidated_report": {/* This is to place consolidation request */
        action: "Kyc/consolidatedForensicReport"
    },
    "POST /forensic/callback_consolidation": {
        action: "Kyc/getConsolidatedForensicReport"
    },
    "POST /forensic/report_status": {
        action: "Kyc/forensicReportStatus"
    },
    "POST /ip-vpn": {
        action: "Kyc/ipBasedVpnVerification"
    },
    "POST /udyamGetCaptcha": {
        action: "Udyam/udyamGetCaptcha"
    },
    "POST /udyamSubmitCaptcha": {
        action: "Udyam/udyamSubmitCaptcha"
    },
    "POST /udyam/callback": {
        action: "Udyam/udyamCallback"
    },
    "POST /udyogAadhaarGetCaptcha": {
        action: "UdyogAadhaar/udyogAadhaarGetCaptcha"
    },
    "POST /udyogAadhaarSubmitCaptcha": {
        action: "UdyogAadhaar/udyogAadhaarSubmitCaptcha"
    },
    "POST /trackPassportStatus": {
        action: "Passport/trackPassportStaus"
    },
    "GET /verificationDataApi_uiux": {
        action: "EsicEpfo/verificationData"
    },
    "GET /verificationDataApi_cub": {
        action: "EsicEpfo/verificationDataCub"
    },
    "GET /verificationDataApi": {
        action: "EsicEpfo/verificationApisData"
    },
    "POST /location": {
        action: "Kyc/location"
    },
    "POST /createEntry": {
        action: "Crisil/placeData"
    },
    "POST /checkStatus": {
        action: "Crisil/checkDataStatus"
    },
    "POST /uploadCacheDocuments": {
        action: "Documents/uploadCacheDocuments"
    },
    "GET /get/udyog": {
        action: "Crawler/udyogData"
    },
    "GET /get/lei": {
        action: "Crawler/leiData"
    },
    "GET /get/status/pan-aadhaar-link": {
        action: "Crawler/pan_aadhaar_link_status"
    },
    "GET /get/udyam": {
        action: "Crawler/udyamData"
    },
    "GET /get/ckyc": {
        action: "Crawler/ckycData"
    },
    "POST /aadhaar/generateOTP": {
        action: "AadhaarOtpIntegration/aadhaarGenerateOtp"
    },
    "POST /aadhaar/verifyOTP": {
        action: "AadhaarOtpIntegration/aadhaarVerifyOtp"
    },
    "POST /aadhaar/resendOTP": {
        action: "AadhaarOtpIntegration/aadhaarResendOtp"
    },
    "GET /getVerificationRemarks": {
        action: "EsicEpfo/getVerificationRemarks"
    },
    "POST /addVerificationRemarks": {
        action: "EsicEpfo/addVerificationRemarks"
    },
    "GET /updateVerificationCheck": {
        action: "EsicEpfo/updateVerificationCheck"
    },
    "POST /verifyKycDataUiUx": {
        action: "Kyc/verifyKycDataUiUx"
    },
    "POST /getKycDataUiUxNew": {
        action: "Kyc/getKycDataUiUxNew"
    },
    "POST /docQuality/initiate": {
        action: "DocQuality/initiate"
    },
    "POST /docQuality/update": {
        action: "DocQuality/update"
    },
    "POST /docQuality/status": {
        action: "DocQuality/status"
    },
    "POST /file-upload": {
        action: "FileUpload/uploadFile"
    },
    "GET /epfo/getCaptcha": {
        action: "Epfo/getCaptcha"
    },
    "GET /epfo/submitCaptcha": {
        action: "Epfo/submitCaptcha"
    },
    "GET /esic/getCaptcha": {
        action: "Esic/getCaptcha"
    },
    "GET /esic/getDistrict": {
        action: "Esic/getDistrict"
    },
    "GET /esic/submitCaptcha": {
        action: "Esic/submitCaptcha"
    },
    "GET /pincode": {
        action: "Pincode/pincode"
    },
    "GET /caVerification": {
        action: "CA/index"
    },
    "POST /serverless-crawler/calllbacks/esic": {
        action: "Callbacks/esicCallback"
    },
    "POST /hfcTesting/docQuality/initiate": {
        action: "DocQuality/initiateHFC"
    },
    "GET /getConsent": {
        action: "Consent/getConsent"
    },
    "POST /dummy": {
        action: "Routes/dummy"
    },
    "POST /consentMiddleware": {
        action: "Consent/consentMiddleware"
    },
    "POST /consentDetails": {
        action: "Consent/consentDetails"
    },
    "POST /consentDetails2": {
        action: "Consent/consentDetails2"
    },
    "POST /sendOTP": {
        action: "OTP/sendOTP"
    },
    "POST /verifyOTP": {
        action: "OTP/verifyOTP"
    },
    "POST /ftr/listenToQs": {
        action: "Ftr/listenToQs"
    },
    "POST /ftr/callback/classification": {
        action: "Ftr/classificationCallback"
    },
    "POST /test": {
        action: "Test/test"
    },
    "GET /server_health_check": {
        action: "ServerHealthCheck/serverHealthCheck"
    },
    "GET /vehicleRC": {
        action: "Vehicle/vehicleRC"
    },
    "POST /getUdyamData": {
        action: "EsicEpfo/getUdyamData"
    },
    "POST /getUdyamDataToBusiness": {
        action: "EsicEpfo/getUdyamDataToBusiness"
    },
    "POST /saveNSDLPanData": {
        action: "Kyc/saveNSDLPanData"
    },
    "POST /digiLocker/generate-link": {
        action: "DigiLocker/generateLink"
    },
    "POST /digiLocker/fetch-details": {
        action: "DigiLocker/fetchDetails"
    },
    "GET /company-details-from-cin": {
        action: "Company/companyData"
    }
}; 
