/**
 * DigiLockerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const messages = {
    MISSING_PARAMS: "Required parameters missing!",
    NO_DIRECTOR: "No director found for the given director_id!",
    NO_DIGILOCKER_DATA: "No digilocker data found for this director!",
    NO_TRANSACTION_ID: "No digilocker transaction id found for ths director!",
    AADHAAR_MISMATCH: "The last 4 digits of input aadhaar and digilocker fetched aadhaar didn't match!",
    INVALID_AADHAAR: "Input Aadhaar is NULL or there is issue in the length of the fetched or input aadhaar!",
    NOT_AUTHENTICATED: "Digilocker authentication is not done for this aadhaar!",
    AUTHENTICATED: "Digilocker authentication is done for this applicant/co-applicant. Kindly fetch the deatils if not fetched!",
    SMS_DELIVERY_FAILED: "Digilocker link generated but sms delivery failed to the borrower!",
    NO_SHORT_URL: "No short url found!",
    NO_LOAN_DATA: "No loan data found!",
    NO_CONTACT: "No contact number found!"
}


module.exports = {
    generateLink: async function (req, res) {
        const directorId = req.param('director_id');
        const aadhaar = req.param('aadhaar');

        try {
            if (!directorId || !aadhaar) throw [404, "MISSING_PARAMS"];

            const director = await Director.findOne({
                id: directorId
            }).select(["others_info", "daadhaar", "dcontact", "business", "dfirstname"]);

            if (!director) throw [404, "NO_DIRECTOR"];

            let othersInfo, generateLink = true, digiLockerInfo;

            if (director?.others_info) {
                othersInfo = JSON.parse(director?.others_info);

                if (othersInfo?.digiLockerInfo?.model?.transactionId &&
                    director?.daadhaar == aadhaar) {

                    const digiLockerStatus = await sails.helpers.axiosApiCall(
                        sails.config.digiLocker.urls.fetchDetails,
                        {
                            "transactionId": othersInfo?.digiLockerInfo?.model?.transactionId
                        },
                        {
                            "ent_authorization": sails.config.digiLocker.authorization
                        },
                        'post'
                    );

                    let aadhaarMatched = true;

                    if (digiLockerStatus?.data?.code == 200 &&
                        digiLockerStatus?.data?.model?.status == "s"
                    ) {

                        const maskedAdharNumber = digiLockerStatus?.data?.model?.maskedAdharNumber;

                        if (typeof aadhaar == 'string' &&
                            aadhaar.length == 12 &&
                            maskedAdharNumber.length == 12) {
                            let len = aadhaar.length;
                            for (let i = 0; i < 4; i++) {
                                if (aadhaar[len - i] != maskedAdharNumber[len - i]) {
                                    aadhaarMatched = false;
                                    break;
                                }
                            }
                        }

                        if (aadhaarMatched) throw [200, "AUTHENTICATED"];
                    }

                    digiLockerInfo = othersInfo?.digiLockerInfo;
                    if (aadhaarMatched) generateLink = false;
                }
            }

            if (generateLink) {
                const apiRes = await sails.helpers.axiosApiCall(
                    sails.config.digiLocker.urls.generateLink,
                    {
                        "serviceId": "4",
                        "uid": `${directorId}-${Date.now()}`,
                        "isHideExplanationScreen": false
                    },
                    {
                        "Authorization": sails.config.digiLocker.authorization
                    },
                    'post'
                );

                digiLockerInfo = apiRes.data;

                if (othersInfo) {
                    othersInfo.digiLockerInfo = apiRes.data;
                } else {
                    othersInfo = { digiLockerInfo }
                }
            }


            await Director.updateOne({
                id: directorId
            }).set({
                daadhaar: aadhaar,
                others_info: JSON.stringify(othersInfo)
            });

            const loanData = await Loanrequest.findOne({
                business_id: director?.business
            }).select("loan_ref_id");

            if (!loanData) throw [404, "NO_LOAN_DATA"];
            if (!director?.dcontact) throw [404, "NO_CONTACT"];

            let shortUrl = digiLockerInfo?.model?.url;

            if (!shortUrl) throw [404, "NO_SHORT_URL"];

            shortUrl = "https://" + shortUrl;

            const sendSmsStatus = await sails.helpers.sendSms({
                "userName": sails.config.sms.creds.userName,
                "Pass": sails.config.sms.creds.pass,
                "contact": director?.dcontact,
                "loan_ref_id": loanData?.loan_ref_id,
                "name": director?.dfirstname,
                "link": shortUrl
            });


            if (sendSmsStatus?.status != "ok") throw [500, "SMS_DELIVERY_FAILED"];

            return res.send({
                status: "ok",
                resCode: "SUCCESS",
                message: `Kindly complete the Digilocker verification steps sent to the borrower on ${director?.dcontact}.`,
                data: digiLockerInfo
            });


        } catch (err) {
            await handlerError(err, res);
        }
    },

    fetchDetails: async function (req, res) {
        const directorId = req.param('director_id');
        const whiteLabelId = req?.client_data?.white_label_id;

        try {
            if (!directorId) throw [404, "MISSING_PARAMS"];

            const director = await Director.findOne({
                id: directorId
            }).select(["daadhaar", "others_info", "business"]);

            if (!director) throw [404, "NO_DIRECTOR"];

            const parsedOthersInfo = JSON.parse(director?.others_info || null);

            if (!parsedOthersInfo) throw [404, "NO_DIGILOCKER_DATA"];

            const businessId = director?.business;

            const transactionId = parsedOthersInfo.digiLockerInfo?.model?.transactionId;

            if (!transactionId) throw [404, "NO_TRANSACTION_ID"];

            const apiRes = await sails.helpers.axiosApiCall(
                sails.config.digiLocker.urls.fetchDetails,
                {
                    "transactionId": transactionId
                },
                {
                    "ent_authorization": sails.config.digiLocker.authorization
                },
                'post'
            );

            if (apiRes?.data?.code == "400") throw [400, "NOT_AUTHENTICATED"];

            const dAadhaar = director?.daadhaar;

            const maskedAdharNumber = apiRes?.data?.model?.maskedAdharNumber;

            if (typeof dAadhaar == 'string' &&
                dAadhaar.length == 12 &&
                maskedAdharNumber.length == 12) {
                let len = dAadhaar.length;
                for (let i = 0; i < 4; i++) {
                    if (dAadhaar[len - i] != maskedAdharNumber[len - i]) {
                        throw [400, "AADHAAR_MISMATCH"];
                    }
                }
            } else {
                throw [400, "INVALID_AADHAAR"];
            }

            const recordExits = await EKycResponse.count({
                kyc_key: director?.daadhaar,
                or: [
                    { ref_id: businessId },
                    { ref_id: null }
                ]
            });

            const businessData = await Business.findOne({
                id: businessId,
            }).select("userid");


            if (recordExits && director?.daadhaar) {
                await EKycResponse.update({
                    kyc_key: director?.daadhaar,
                    or: [
                        { ref_id: businessId },
                        { ref_id: null }
                    ]
                }).set({
                    verification_response: JSON.stringify(apiRes.data),
                    uniqueId: transactionId,
                    ref_id: businessId
                });
            } else {
                await EKycResponse.create({
                    kyc_key: director?.daadhaar,
                    uniqueId: transactionId,
                    verification_response: JSON.stringify(apiRes.data),
                    ref_id: businessId
                });
            }

            const whiteLabelSol = await WhiteLabelSolutionRd.findOne({
                id: whiteLabelId
            }).select("s3_name");

            const loanid = await Loanrequest.findOne({
                business_id: businessId
            }).select(["id", "createdUserId"]);

            const emp = await Users.findOne({
                id: loanid?.createdUserId
            }).select("user_reference_no");

            let url = sails.config.digiLocker.urls.generateAadhaar,
                info = apiRes?.data?.model,
                empid = emp?.user_reference_no;

            const fileName = `aadhaar-${Date.now()}.pdf`;

            let key = `users_${businessData.userid}/${fileName}`,
                bucket = whiteLabelSol?.s3_name,
                body = {
                    bucket,
                    key,
                    empid,
                    info
                }

            let header = {};


            const datetime = await sails.helpers.dateTime();

            const pdfGeneration = await sails.helpers.axiosApiCall(url, body, header, "POST");

            if (pdfGeneration?.data?.status == 'ok') {
                await LoanDocument.create({
                    loan: loanid.id,
                    user_id: businessData.userid,
                    business_id: businessId,
                    doctype: sails.config.digiLocker.aadhar_doc_type,
                    doc_name: fileName,
                    uploaded_doc_name: fileName,
                    original_doc_name: fileName,
                    status: "active",
                    ints: datetime,
                    on_upd: datetime,
                    directorId: directorId
                });
            }

            return res.send({
                status: "ok",
                resCode: "SUCCESS",
                message: "Data fetched successfully!",
                data: apiRes.data
            })
        } catch (err) {
            await handlerError(err, res);
        }
    }

};


async function handlerError(err, res) {
    if ((errorCode = err[0]) && (messageCode = err[1])) {
        res
            .status(errorCode)
            .send({
                status: err[0] == 200 ? "ok" : "nok",
                resCode: messageCode,
                message: messages[messageCode] || "Unknown error occurred!"
            })
    }
    else {
        res
            .status(500)
            .send({
                status: "nok",
                resCode: "SERVER_ERROR",
                message: err?.message || "Server error occurred!"
            })
    }
}

