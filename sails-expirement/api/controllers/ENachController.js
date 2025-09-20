/**
 * ENachController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require("axios");

const stateMapping = {

    // ('not-initiated','initiated','completed','cancelled','failed','offline')

    'partial:partial': [`authentication pending at customer's end`, 'initiated'],
    'auth_success:auth_success': [`ack_received(API) rest types bank details appear after UMRN(ack
received)`, 'initiated'],
    'auth_fail:partial': [`Authentication failure`, 'failed'],
    'auth_failed:partial': ['User Cancelled The Transaction', 'cancelled'],
    'revoked:register_success': [`Mandate cancelled`, 'cancelled'],
    'expired:partial': [`Mandate_id expired`, 'expired'],
    'auth_success:awating_res': [`Final registration pending,UMRN generated(ack received)`, 'initiated'],
    'auth_success:nack_received': [`Negative acknowledgement received`, 'failed'],
    'auth_success:reject_spo_bank': [`Rejection from sponsor bank`, 'failed'],
    'auth_success:register_success': [`Mandate registered successfully`, 'completed'],
    'auth_success:register_failed': [`Registration failed`, 'failed'],
    'auth_success:transfer_success': [`shared with sponsor bank`, 'initiated'],
    'auth_success:ack_received': [`Acknowledgement received`, 'initiated'],
    'auth_success:accepted_spo_bank': [`Accepted by sponsor bank`, 'initiated'],
    'cancelled:partial': [`Mandate cancelled before authentication`, 'cancelled']


}
const upistateMapping = {

    // ('not-initiated','initiated','completed','cancelled','failed','offline')

    'partial:partial': [`authentication pending at customer's end`, 'initiated'],
    'auth_failed:auth_failed': [`Transaction declined by customer`, 'failed'],
    'auth_failed:partial': ['User Cancelled The Transaction', 'cancelled'],
    'cancelled:revoked': [`Mandate cancelled`, 'cancelled'],
    'expired:partial': [`Mandate_id expired`, 'expired'],
    'awaiting_ack:awating_res': [`Final registration pending,UMRN generated(ack received)`, 'initiated'],
    'auth_success:nack_received': [`Negative acknowledgement received`, 'failed'],
    'auth_success:register_success': [`Mandate registered successfully`, 'completed'],
    'auth_success:register_failed': [`Registration failed`, 'failed'],
    'auth_success:transfer_success': [`shared with sponsor bank`, 'initiated'],
    ':awaiting_ack': [`Acknowledgement received`, 'initiated']
}

module.exports = {

    createMandate: async function (req, res) {

        try {

            if (sails.config.enach.muthoot.allowedWhiteLabelIds.includes(parseInt(req.user.loggedInWhiteLabelID))) {

                const userId = req?.user?.id;

                const {loan_id: loanId, fin_id: finId, director_id: directorId, auth_mode: authMode, first_collection_date: firstCollectionDate, emi} = req.body;
                if (!sails.config.enach.muthoot.allowedAuthModes.includes(authMode)) throw new Error("Invalid auth mode");
                const config = await sails.helpers.validateConfig(userId, loanId);
                if (!config?.status) throw new Error(config.message);

                if (authMode == 'offline') {
                    await LoanAdditionalData.updateOne({loan_id: loanId}).set({
                        enach_mode: 'offline'
                    });
                    return res.send({
                        status: "ok",
                        message: "Mandate set to offline mode"
                    });
                }

                const enachMuthoot = await sails.helpers.enachMuthoot(userId, loanId, finId, directorId, authMode, firstCollectionDate, emi);

                return res.send({
                    status: enachMuthoot.status,
                    message: enachMuthoot.message
                });

            }

            else {
                throw new Error("Invalid White label id");
            }

        }
        catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }


    },

    createSecurityMandate: async function (req, res) {
        try {

            const userId = req?.user?.id;

            const {loan_id: loanId, fin_id: finId, director_id: directorId, auth_mode: authMode, first_collection_date: firstCollectionDate, emi} = req.body;
            if (!sails.config.enach.muthoot.allowedAuthModes.includes(authMode)) throw new Error("Invalid auth mode");
            const config = await sails.helpers.validateConfig(userId, loanId, true);
            if (!config?.status) throw new Error(config.message);
            const enachMuthoot = await sails.helpers.enachMuthoot(userId, loanId, finId, directorId, authMode, firstCollectionDate, emi, true);

            return res.send({
                status: enachMuthoot.status,
                message: enachMuthoot.message
            });

        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            })
        }
    },

    enachStatus: async function (req, res) {
        try {

            const {loan_id: loanId} = req.query;

            if (!loanId) throw new Error("loan_id is mandatory");
            const loanAdditionalData = await LoanAdditionalDataRd.findOne({loan_id: loanId}).select("enach_mode");
            if (!loanAdditionalData) throw new Error("No records found for this loan_id");

            if (loanAdditionalData.enach_mode == 'offline' || !loanAdditionalData.enach_mode) {
                return res.send({
                    status: "ok",
                    message: "Mode fetched successfully!",
                    data: {
                        mode: loanAdditionalData.enach_mode == 'offline' ? 'offline' : null
                    }
                });
            }

            const loanFinancialsData = await LoanFinancialsRd.find({
                loan_id: loanId,
                enach_status: ['initiated', 'completed', 'offline']
            }).select(["id", "enach_status", "enach_data", "security_enach_status", "security_enach_data"]);

            if (!loanFinancialsData || !loanFinancialsData.length > 0) throw new Error("Data missing in loan financials");

            let enachObject = loanFinancialsData[0]?.enach_data;
            if (!enachObject) enachObject = {};
            let securityEnachObejct = loanFinancialsData[0]?.security_enach_data;
            if (!securityEnachObejct) securityEnachObejct = {};

            return res.send({
                status: "ok",
                message: "Mode fetched successfully!",
                data: {
                    mode: loanAdditionalData.enach_mode,
                    fin_id: loanFinancialsData[0].id,
                    ...enachObject
                },
                security_enach_status: loanFinancialsData[0].security_enach_status,
                security_enach_data: {
                    ...securityEnachObejct
                }
            });

        } catch (error) {
            return res.send({
                status: "nok",
                message: error.message
            })
        }
    },

    getMandateDetails: async function (req, res) {

        try {

            const {fin_id: finId} = req.query;

            if (!finId) throw new Error("fin_id is required!");

            const loanFinancials = await LoanFinancialsRd.findOne({id: finId}).select(["enach_data", "enach_status", "loan_id", "security_enach_status", "security_enach_data"]);

            if (!loanFinancials) throw new Error("Invalid fin_id");
            if (!loanFinancials.loan_id) throw new Error("Loan id missing in Loan Financials");

            let enachData = loanFinancials?.enach_data;
            const mandateId = loanFinancials?.enach_data?.id;
            if (!mandateId) throw new Error("Mandate Id missing");

            const url = `${sails.config.enach.muthoot.getMandateDetailsURL}?mandate_id=${mandateId}`,
                method = 'GET',
                headers = {};

            const apiRes = await sails.helpers.axiosApiCall(url, "", headers, method);

            const state = apiRes?.data?.state;
            const bankDetailsState = apiRes?.data?.bank_details?.state;
            console.log("upi", apiRes.data);
            if (loanFinancials?.enach_data?.auth_type === "upi") {
                if (state === "auth_success") {
                    await LoanFinancials.updateOne({id: finId}).set({
                        enach_status: 'completed',
                        enach_data: {...apiRes.data}
                    });
                    return res.send({
                        status: "ok",
                        message: "Status Fetched Successfully!",
                        state: "auth_success",
                        data: apiRes?.data,
                        security_enach_state: null,
                        security_enach_data: null
                    })
                }
                else if (state === 'partial') {
                    return res.send({
                        status: "ok",
                        state: "Mandate registration pending at customer's end"
                    })
                }
                else {

                    await LoanAdditionalData.update({loan_id: loanFinancials.loan_id}).set({
                        enach_mode: null
                    });

                    return res.send({
                        status: "nok",
                        state: "Mandate has been expired or cancelled"
                    })
                }
            }


            if (!state || !bankDetailsState) throw new Error("missing state or bank details state");

            const stateComibation = `${state}:${bankDetailsState}`;
            const authState = stateMapping[stateComibation];

            if (!authState) throw new Error("Invalid state of the application");

            if (!enachData) enachData = {};
            enachData = {...apiRes?.data};

            if (apiRes?.data?.type != 'CANCEL') {
                await LoanFinancials.updateOne({id: finId}).set({
                    enach_status: authState[1],
                    enach_data: enachData
                });
            }

            if (authState[1] == 'cancelled' || authState[1] == 'failed' || authState[1] == 'expired') {
                await LoanAdditionalData.update({loan_id: loanFinancials.loan_id}).set({
                    enach_mode: null
                });
            }

            let securityEnachAuthState, securityEnachData = {};
            if (loanFinancials?.security_enach_data?.id) {

                securityEnachData = loanFinancials?.security_enach_data;
                const mandateId = loanFinancials?.security_enach_data?.id;

                const url = `${sails.config.enach.muthoot.getMandateDetailsURL}?mandate_id=${mandateId}`,
                    method = 'GET',
                    headers = {};

                const apiRes = await sails.helpers.axiosApiCall(url, "", headers, method);

                const state = apiRes?.data?.state;
                const bankDetailsState = apiRes?.data?.bank_details?.state;

                if (!state || !bankDetailsState) throw new Error("missing state or bank details state");

                const stateComibation = `${state}:${bankDetailsState}`;
                securityEnachAuthState = stateMapping[stateComibation];

                if (!securityEnachAuthState) throw new Error("Invalid state of the application");

                if (!securityEnachData) securityEnachData = {};
                securityEnachData = {...apiRes?.data};

                if (apiRes?.data?.type != 'CANCEL') {
                    await LoanFinancials.updateOne({id: finId}).set({
                        security_enach_status: securityEnachAuthState[1],
                        security_enach_data: securityEnachData
                    });
                }

            }

            return res.send({
                status: "ok",
                message: "Status Fetched Successfully!",
                state: authState[0],
                data: {
                    ...apiRes?.data,
                    mode: 'UPI'
                },
                security_enach_state: securityEnachAuthState?.[0] || null,
                security_enach_data: securityEnachData || null
            });

        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }

    },

    cancelMandate: async function (req, res) {
        try {

            const {fin_id: finId} = req.query;
            if (!finId) throw new Error("finId is required!");

            const loanFinancials = await LoanFinancialsRd.findOne({id: finId});

            if (!loanFinancials) throw new Error("Invalid fin_id");

            if (!loanFinancials.IFSC) throw new Error("IFSC does not exist for the provided fin_id");

            const enachObject = loanFinancials?.enach_data;

            if (!enachObject || !enachObject?.id) throw new Error("Enach has not been done for this fin_id");

            const loanAdditionalData = await LoanAdditionalDataRd.find({loan_id: loanFinancials.loan_id}).select("loan_id").limit(1);

            if (!loanFinancials?.loan_id || !loanAdditionalData[0].loan_id) {

                throw new Error("Missing loan id!")

            }
            const umrn = enachObject?.umrn,
                destIFSC = loanFinancials.IFSC;

            if (!umrn || !loanFinancials?.security_enach_data?.umrn) throw new Error("UMRN has not been generated yet for this fin_id");

            let url = sails.config.enach.muthoot.cancelMandateURL,
                method = 'POST',
                body = {
                    umrn,
                    dest_ifsc: destIFSC
                },
                headers = {},
                options = {
                    url,
                    data: body,
                    headers,
                    method
                }

            const apiRes = await axios(options);

            body = {
                umrn: loanFinancials?.security_enach_data?.umrn,
                dest_ifsc: destIFSC
            };
            options = {
                url,
                data: body,
                headers,
                method
            };

            const apiRes2 = await axios(options);

            //condition to verify that the cancellation of the mandate was successfull
            if (apiRes?.data?.type == 'CANCEL') {

                let bankTrackData = loanFinancials?.bank_track_data;

                if (!bankTrackData || !bankTrackData?.trackData) {
                    bankTrackData = {
                        trackData: []
                    }
                };

                //check and delete the old bank_track_data, so that it does not create a nested object
                if (loanFinancials?.bank_track_data) delete loanFinancials.bank_track_data;
                bankTrackData.trackData.push(loanFinancials);

                await LoanFinancials.updateOne({id: finId}).set({
                    enach_status: "cancelled",
                    bank_track_data: bankTrackData,
                    enach_data: apiRes?.data
                });

                await LoanAdditionalData.update({loan_id: loanFinancials.loan_id}).set({
                    enach_mode: null
                });


            }
            if (apiRes2?.data?.type == 'CANCEL') {

                let bankTrackData = loanFinancials?.bank_track_data;

                if (!bankTrackData || !bankTrackData?.trackData) {
                    bankTrackData = {
                        trackData: []
                    }
                };

                //check and delete the old bank_track_data, so that it does not create a nested object
                if (loanFinancials?.bank_track_data) delete loanFinancials.bank_track_data;
                bankTrackData.trackData.push(loanFinancials);

                await LoanFinancials.updateOne({id: finId}).set({
                    security_enach_status: "cancelled",
                    bank_track_data: bankTrackData,
                    security_enach_data: apiRes2?.data
                });

                await LoanAdditionalData.update({loan_id: loanFinancials.loan_id}).set({
                    enach_mode: null
                });


            }
            if (apiRes?.data?.type != 'CANCEL' || apiRes2?.data?.type != 'CANCEL') {
                return res.send({
                    status: "nok",
                    message: "Failed to cancel Mandate",
                    data: apiRes?.data
                });
            }

            return res.send({
                status: "ok",
                message: "Mandate Cancelled Successfully",
                data: apiRes?.data
            });

        } catch (error) {
            return res.send({
                status: "nok",
                message: error?.message || error?.response?.message,
                data: error?.response?.data
            })
        }
    },

    changeMandateType: async function (req, res) {
        try {

            const {mode, fin_id: finId, loan_id: loanId} = req.body;

            if (!mode || !loanId) throw new Error("Missing mandatory params");

            const loanAdditionalData = await LoanAdditionalDataRd.find({loan_id: loanId}).select(["loan_id", "enach_mode"]).sort("loan_id desc").limit(1);

            if (!loanAdditionalData || !loanAdditionalData.length) throw new Error("Data missing in Loan additional");

            if (loanAdditionalData[0]?.enach_mode != mode) throw new Error("mode doesn't match with the mode in loan_additional");

            if (loanAdditionalData[0]?.enach_mode == "offline") {

                await LoanAdditionalData.update({loan_id: loanId}).set({
                    enach_mode: null
                });

            }
            else if (loanAdditionalData[0]?.enach_mode == "api") {

                if (!finId) throw new Error("Missing fin_id");

                const loanFinancialsData = await LoanFinancialsRd.findOne({id: finId}).select(["loan_id", "enach_data"]);
                if (!loanFinancialsData) throw new Error("Invalid fin_id");

                if (!loanFinancialsData?.loan_id) throw new Error("loan_id is missing");
                if (loanFinancialsData?.loan_id != loanId) throw new Error("Provided loanId doesn't match with the fin_id");


                if (loanFinancialsData?.enach_data) {

                    if (loanFinancialsData?.enach_data?.umrn) {
                        throw new Error("UMRN has been generated. Please Cancel the mandate to change the mandate type!")
                    }
                    else {

                        //call the status API and check whether UMRN number has been generated or not
                        const mandateId = loanFinancialsData?.enach_data?.id;
                        if (!mandateId) throw new Error("Mandate Id is missing");

                        const url = `${sails.config.enach.muthoot.getMandateDetailsURL}?mandate_id=${mandateId}`,
                            method = 'GET',
                            headers = {};

                        const apiRes = await sails.helpers.axiosApiCall(url, "", headers, method);

                        if (apiRes?.data?.umrn) {

                            const state = apiRes?.data?.state;
                            const bankDetailsState = apiRes?.data?.bank_details?.state;

                            if (!state || !bankDetailsState) throw new Error("missing state or bank details state");

                            const stateComibation = `${state}:${bankDetailsState}`;

                            const authState = stateMapping[stateComibation];

                            const enachData = {...apiRes?.data};

                            await LoanFinancials.updateOne({id: finId}).set({
                                enach_status: authState[1],
                                enach_data: enachData
                            });

                            throw new Error("UMRN has been generated. Please Cancel the mandate to change the mandate type!");
                        }

                        await LoanAdditionalData.update({loan_id: loanFinancialsData.loan_id}).set({
                            enach_mode: null
                        });
                        await LoanFinancials.updateOne({id: finId}).set({
                            enach_status: null,
                            enach_data: null
                        });
                    }

                }
                else {

                    throw new Error("Missing enach_data");

                }

            }
            else if (loanAdditionalData[0]?.enach_mode == "upi") {

                if (!finId) throw new Error("Missing fin_id");

                const loanFinancialsData = await LoanFinancialsRd.findOne({id: finId}).select(["loan_id", "enach_data"]);
                if (!loanFinancialsData) throw new Error("Invalid fin_id");

                if (!loanFinancialsData?.loan_id) throw new Error("loan_id is missing");
                if (loanFinancialsData?.loan_id != loanId) throw new Error("Provided loanId doesn't match with the fin_id");


                if (loanFinancialsData?.enach_data) {

                    if (loanFinancialsData?.enach_data?.umrn) {
                        throw new Error("UMRN has been generated. Please Cancel the mandate to change the mandate type!")
                    }
                    else {

                        await LoanAdditionalData.update({loan_id: loanFinancialsData.loan_id}).set({
                            enach_mode: null
                        });
                        await LoanFinancials.updateOne({id: finId}).set({
                            enach_status: null,
                            enach_data: null
                        });

                        return res.send({
                            status: "ok",
                            message: "Status changed successfully"
                        });
                    }
                }

            }
            else if (!loanAdditionalData[0]?.enach_mode) {
                throw new Error("Enach has not been initiated for this bank!");
            }
            else {
                throw new Error("Invalid enach_mode");
            }

            return res.send({
                status: "ok",
                message: "Mandate type changed successfully"
            });


        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            });

        }
    },

    createUpiMandate: async function (req, res) {
        try {

            if (sails.config.enach.muthoot.allowedWhiteLabelIds.includes(parseInt(req.user.loggedInWhiteLabelID))) {

                const userId = req?.user?.id;

                const {loan_id: loanId, fin_id: finId, director_id: directorId, auth_mode: authMode, first_collection_date: firstCollectionDate, vpa, emi} = req.body;

                const config = await sails.helpers.validateConfig(userId, loanId);
                if (!config?.status) throw new Error(config.message);
                if (!sails.config.enach.muthoot.allowedAuthModes.includes(authMode)) throw new Error("Invalid auth mode");


                if (authMode == 'offline') {
                    await LoanAdditionalData.updateOne({loan_id: loanId}).set({
                        enach_mode: 'offline'
                    });
                    return res.send({
                        status: "ok",
                        message: "Mandate set to offline mode"
                    });
                }

                const upiEnachMuthoot = await sails.helpers.upiEnachMuthoot(userId, loanId, finId, directorId, authMode, firstCollectionDate, vpa, emi);

                return res.send({
                    status: upiEnachMuthoot.status,
                    message: upiEnachMuthoot.message
                });

            }

            else {
                throw new Error("Invalid White label id");
            }

        }
        catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }
    },
    getUpiMandateDetails: async function (req, res) {

        try {

            const {fin_id: finId} = req.query;

            if (!finId) throw new Error("fin_id is required!");

            const loanFinancials = await LoanFinancialsRd.findOne({id: finId}).select(["enach_data", "enach_status", "loan_id", "security_enach_status", "security_enach_data"]);

            if (!loanFinancials) throw new Error("Invalid fin_id");
            if (!loanFinancials.loan_id) throw new Error("Loan id missing in Loan Financials");

            let enachData = loanFinancials?.enach_data;
            const mandateId = loanFinancials?.enach_data?.id;
            if (!mandateId) throw new Error("Mandate Id missing");

            const url = `${sails.config.enach.muthoot.getMandateDetailsURL}?mandate_id=${mandateId}`,
                method = 'GET',
                headers = {};

            const apiRes = await sails.helpers.axiosApiCall(url, "", headers, method);
            console.log("this is the apires for the status:", apiRes)
            const state = apiRes?.data?.state;
            const upiDetailsState = apiRes?.data?.status;

            if (!state || !upiDetailsState) throw new Error("missing state or upi details state");

            const stateComibation = `${state}:${upiDetailsState}`;
            const authState = upistateMapping[stateComibation];

            if (!authState) throw new Error("Invalid state of the application");

            if (!enachData) enachData = {};
            enachData = {...apiRes?.data};
            if (apiRes?.data?.type != 'CANCEL') {
                await LoanFinancials.updateOne({id: finId}).set({
                    enach_status: authState[1],
                    enach_data: enachData
                });
            }

            if (authState[1] == 'cancelled' || authState[1] == 'failed' || authState[1] == 'expired') {
                await LoanAdditionalData.update({loan_id: loanFinancials.loan_id}).set({
                    enach_mode: null
                });
            }
            return res.send({
                status: "ok",
                message: "Status Fetched Successfully!",
                state: authState[0],
                data: apiRes?.data,
            });

        } catch (error) {

            return res.send({
                status: "nok",
                message: error.message
            })

        }

    },

    cancelUpiMandate: async function (req, res) {
        try {

            const {fin_id: finId} = req.body;
            if (!finId) throw new Error("finId is required!");

            const loanFinancials = await LoanFinancialsRd.findOne({id: finId});

            if (!loanFinancials) throw new Error("Invalid fin_id");


            const enachObject = loanFinancials?.enach_data;

            if (!enachObject || !enachObject?.id) throw new Error("Enach has not been done for this fin_id");

            const loanAdditionalData = await LoanAdditionalDataRd.find({loan_id: loanFinancials.loan_id}).select("loan_id").limit(1);

            if (!loanFinancials?.loan_id || !loanAdditionalData[0].loan_id) {

                throw new Error("Missing loan id!")

            }
            const mandateId = enachObject?.id

            // if (!mandateId || !loanFinancials?.security_enach_data?.mandateId) throw new Error("MandateID has not been generated yet for this fin_id");

            let url = sails.config.enach.muthoot.upi.cancelMandateURL,
                method = 'POST',
                body = {
                    mandateId
                },
                headers = {},
                options = {
                    url,
                    data: body,
                    headers,
                    method
                }

            const apiRes = await axios(options);
            console.log("digio", apiRes)
            //condition to verify that the cancellation of the mandate was successfull
            if (apiRes?.data?.status == 'revoked') {

                await LoanFinancials.updateOne({id: finId}).set({
                    enach_status: "cancelled",
                    enach_data: apiRes?.data
                });

                await LoanAdditionalData.update({loan_id: loanFinancials.loan_id}).set({
                    enach_mode: null
                });


            }
            if (apiRes?.data?.status != 'revoked') {
                return res.send({
                    status: "nok",
                    message: "Failed to cancel Mandate",
                    data: apiRes?.data
                });
            }

            return res.send({
                status: "ok",
                message: "Mandate Cancelled Successfully",
                data: apiRes?.data
            });

        } catch (error) {
            return res.send({
                status: "nok",
                message: error?.message || error?.response?.message,
                data: error?.response?.data
            })
        }

    }


};
