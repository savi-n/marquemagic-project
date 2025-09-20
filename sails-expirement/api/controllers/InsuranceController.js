/**
 * InsuranceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require('moment');

const defaultInsData = {
    insurance_company1: null,
    insurance_company2: null,
    insurance_company3: null,
    insurance_company4: null,
    insurance_company5: null,
    insurance_company6: null,
    insurance_company7: null,
    insurance_company8: null,
    fee1: null,
    fee2: null,
    fee3: null,
    fee4: null,
    fee5: null,
    fee6: null,
    fee7: null,
    fee8: null
} // this is charges details

async function waitForFewSeconds(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Waited for 30 seconds');
        }, seconds * 1000); // 30 seconds in milliseconds
    });
}

const statuses = {
    ok: "ok",
    nok: "nok"
};

const getInterestRateCode = (intRate) => {
    let intCode;
    if (intRate == 28) intCode = 63;
    else if (intRate == 27.5) intCode = 62;
    else if (intRate == 27) intCode = 61;
    else if (intRate == 26.5) intCode = 60;
    else if (intRate == 26) intCode = 59;
    else if (intRate == 25.5) intCode = 58;
    else if (intRate == 25) intCode = 57;
    else if (intRate == 24.5) intCode = 56;
    else if (intRate == 24) intCode = 55;
    else if (intRate == 23.5) intCode = 54;
    else if (intRate == 23) intCode = 53;
    else if (intRate == 22.5) intCode = 52;
    else if (intRate == 22) intCode = 51;
    else if (intRate == 21.5) intCode = 50;
    else if (intRate == 21) intCode = 49;
    else if (intRate == 20.5) intCode = 48;
    else if (intRate == 20) intCode = 47;
    else if (intRate == 19.5) intCode = 46;
    else if (intRate == 19) intCode = 45;
    else if (intRate == 18.5) intCode = 44;
    else if (intRate == 18) intCode = 43;
    else if (intRate == 17.5) intCode = 42;
    else if (intRate == 17) intCode = 41;
    else if (intRate == 16.5) intCode = 40;
    else if (intRate == 16) intCode = 39;

    if (!intCode) throw [400, "badReqStatus", "loanInterestNotAccepted"];
    return intCode;

}

const statusCodes = {
    sucessStatus: "NC200",
    badReqStatus: "NC400",
    notFoundStatus: "NC404",
    serverErrStatus: "NC500",
    badGatewayStatus: "NC502"
}

const resMessages = {
    dataUpdated: "Data updated successfully! :)",
    dataFetched: "Data fetched successfully! :)",
    missingLoanId: "'loan_id' is missing in the request payload! :(",
    missingData: "'data' is missing in the request payload! :(",
    dataMustBeArray: "'data' has to be an array! :(",
    missingInsDetails: "'ins_details' is missing in the request payload! :(",
    insDetailsMustBeArray: "'ins_details' has to be an array! :(",
    passAllInsuranceDetails: "kindly pass all insurances in 'ins_details'! :(",
    improperInsDetails: "pass 'insDetails' in proper format! :(",
    applicantsInsured: "applicants insured successfully! :)",
    serverErrMsg: "Internal error occurred! :(",
    gatewayErrMsg: "Bad gateway error! :(",
    loanInterestNotAccepted: "Loan intrest rate allowed only between 16 - 28 for pnb metlife insurance! :("
}

const requiredInsurances = [
    "Property Insurance",
    "Life Insurance",
    "Health Insurance",
    "EMI Protect Insurance",
    "Critical Illness Insurance",
    "Personal Accident Insurance"
];

const comapnyNameMapping = new Map([
    [1002, {comp: "insurance_company1", fee: "fee1"}],
    [1003, {comp: "insurance_company1", fee: "fee1"}],
    [1004, {comp: "insurance_company1", fee: "fee1"}],
    [1005, {comp: "insurance_company2", fee: "fee2"}],
    [1006, {comp: "insurance_company2", fee: "fee2"}],
    [1007, {comp: "insurance_company2", fee: "fee2"}],
    [1008, {comp: "insurance_company3", fee: "fee3"}],
    [1009, {comp: "insurance_company3", fee: "fee3"}],
    [1010, {comp: "insurance_company4", fee: "fee4"}],
    [1011, {comp: "insurance_company4", fee: "fee4"}],
    [1012, {comp: "insurance_company5", fee: "fee5"}],
    [1013, {comp: "insurance_company5", fee: "fee5"}],
    [1014, {comp: "insurance_company6", fee: "fee6"}],
    [1015, {comp: "insurance_company7", fee: "fee7"}],
    [1016, {comp: "insurance_company7", fee: "fee7"}],
    [1017, {comp: "insurance_company8", fee: "fee8"}],
    [1018, {comp: "insurance_company8", fee: "fee8"}]
]);

const insCategoryMap = new Map([
    ["Property Insurance", "property_insurance"],
    ["Life Insurance", "life_insurance"],
    ["Health Insurance", "health_insurance"],
    ["EMI Protect Insurance", "emi_protect_insurance"],
    ["Critical Illness Insurance", "critical_illness_insurance"],
    ["Personal Accident Insurance", "personal_accident_insurance"],
    ["Hospital Daily Cash Insurance", "hospital_daily_cash_insurance"],
    ["Opd Wellness Insurance", "opd_wellness_insurance"]
])

// let insMaster, insMasterMap = new Map();

// (async function () {
//     await waitForFewSeconds(1);
//     insMaster = await InsuranceMasterRd.find();
//     for (elm of insMaster) {
//         insMasterMap.set(elm.ins_id, {
//             vendor_available: elm.vendor_available,
//             vendor_integrated: elm.vendor_integrated,
//             ins_name: elm.ins_name,
//             ins_type: elm.ins_category
//         })
//     }
//     console.log(insMasterMap)
// })();

const genericErrorHandler = (res, err) => {
    res.status(err?.[0] || 500).send({
        status: statuses.nok,
        statusCode: statusCodes?.[err?.[1]] || statusCodes.serverErrStatus,
        message: (resMessages?.[err?.[2]] || `${resMessages.serverErrMsg} - ${err.message}`) + " " + (err[3] || "")
    })
}

const getAge = (birthDate) => {
    let currentDate = moment();
    birthDate = moment(birthDate, "YYYY-MM-DD");
    const age = currentDate.diff(birthDate, 'years');
    return age;
}

const getName = (fName, mName, lName) => {
    let name = fName;
    if (mName) name = name + " " + mName;
    if (lName) name = name + " " + lName;
    return name;
}

const getAmount = (amnt, unit) => {
    if (unit == "Lakhs") return amnt * 100000;
    else if (unit == "Crores") return amnt * 10000000;
    else return amnt;
}

const formatDob = (dob) => {
    const dobSplits = dob.split("-");
    const temp = dobSplits[0];
    dobSplits[0] = dobSplits[2];
    dobSplits[2] = temp;
    return dobSplits.join('/');
}

const ddmmTommdd = (dob) => {
    const dobSplits = dob.split("/");
    const temp = dobSplits[0];
    dobSplits[0] = dobSplits[1];
    dobSplits[1] = temp;
    return dobSplits.join('/');
}

const hdfcLifeInsCharges = async (did, loanId, sumAssured, policyTerm) => {
    // return {
    //     insCharge: (Math.random() * 50000).toFixed(2),
    //     gstCharge: (Math.random() * 500).toFixed(2)
    // }

    const applicant = await DirectorRd.findOne({id: did}).select([
        "ddob",
        "gender"
    ]);
    const sanData = await LoanSanctionRd.findOne({loan_id: loanId}).select([
        "san_amount",
        "amount_um",
        "san_term",
        "san_date",
        "san_interest"
    ]);

    const payload = {
        "action": "calculate",
        "clientType": "non-funded",
        "dob": ddmmTommdd(formatDob(applicant?.ddob)), // director
        "loanDisbDate": sanData?.san_date, //"03/06/2024", // use sanction date
        "originalLoanAmount": getAmount(sanData?.san_amount, sanData?.amount_um), // loan amount
        "partnerid": sails.config.insurance.hdfc.parternId,
        "policyTerm": policyTerm,
        "sumAssuredType": "Decreasing",
        "planId": sails.config.insurance.hdfc.planId,
        "gender": (applicant.gender == "Male") ? "Male" : "Female", // director
        "policyId": sails.config.insurance.hdfc.policyId,
        "roundOffResult": "Y",
        "interestRate": 25, //sanData?.san_interest, // check interest rate
        "productDataList": [
            {
                "sumAssured": sumAssured // user input

            }
        ],
        "policyTermUnit": "Year",
        "premiumCalculationMode": "Single"
    }

    console.log(payload)

    let apiRes = await sails.helpers.sailstrigger(
        sails.config.insurance.hdfc.urls.quotation,
        JSON.stringify({
            payload,
            loan_id: loanId
        }),
        "",
        "POST"
    );

    apiRes = JSON.parse(apiRes);

    if (apiRes?.data?.gcppPremiumResult) {
        return {
            insCharge: apiRes?.data?.gcppPremiumResult?.totalPremium - apiRes?.data?.gcppPremiumResult?.gst,
            gstCharge: apiRes?.data?.gcppPremiumResult?.gst
        };
    } else {
        return {error: apiRes?.data?.errors};
    }


}

const pnbMetLifeCharges = async (did, loanId, sumAssured, policyTerm) => {
    // return {
    //     insCharge: (Math.random() * 50000).toFixed(2),
    //     gstCharge: (Math.random() * 500).toFixed(2)
    // }
    // console.log(did, loanId);
    const applicant = await Director.findOne({id: did});
    const sanData = await LoanSanctionRd.findOne({loan_id: loanId}).select(["san_amount", "amount_um", "san_term", "san_interest"]);

    const payload = {
        "APIKey": "9492ACE70F09C1EFE9A96CEC28B2B734E847149E1356F5BEEDA485F40B9C6F75860D7FA8798B105B1B85A7871B992F6924A024447CFCE8A9C043B54EAA6AF02B",
        "formInputs": [
            {
                "key": "@LI_NAME",
                "value": getName(applicant.dfirstname, applicant.middle_name, applicant.dlastname)
            },
            {
                "key": "@LI_ENTRY_AGE",
                "value": getAge(applicant.ddob)
            },
            {
                "key": "@LI_DOB",
                "value": moment(applicant.ddob, "YYYY-MM-DD").format("DD MMM YYYY")//"21 Sep 1981"
            },
            {
                "key": "@LI_GENDER",
                "value": (applicant.gender == "Male") ? "M" : "F"
            },
            {
                "key": "@INPUT_MODE",
                "value": "5"
            },
            {
                "key": "@PR_ID",
                "value": 12088
            },
            {
                "key": "@PR_PT",
                "value": policyTerm
            },
            {
                "key": "@PR_PPT",
                "value": "1"
            },
            {
                "key": "@PR_SA",
                "value": sumAssured
            },
            {
                "key": "@LOAN_AMOUNT",
                "value": getAmount(sanData.san_amount, sanData.amount_um)
            },
            {
                "key": "@LOAN_TERM",
                "value": parseInt(Math.ceil(sanData.san_term / 12))
            }
        ],
        "funds": [],
        "riders": [],
        "inputOptions": [
            {
                "optionLevel": 1,
                "optionId": 1,
                "optionValue": ""
            },
            {
                "optionLevel": 3,
                "optionId": 4,
                "optionValue": ""
            },
            {
                "optionLevel": 4,
                "optionId": 37,
                "optionValue": ""
            },
            {
                "optionLevel": 5,
                "optionId": 38,
                "optionValue": ""
            },
            {
                "optionLevel": 6,
                "optionId": getInterestRateCode(sanData.san_interest),
                "optionValue": ""
            }
        ],
        "inputPartialWithdrawal": []
    }


    let apiRes = await sails.helpers.sailstrigger(
        sails.config.insurance.pnb.urls.quotation,
        JSON.stringify({
            payload,
            loan_id: loanId
        }),
        "",
        "POST"
    );

    apiRes = JSON.parse(apiRes);

    if (apiRes?.data?.MODAL_PREM_TAX && apiRes?.data?.TAX_MP) {
        return {
            insCharge: apiRes?.data?.MODAL_PREM_TAX - apiRes?.data?.TAX_MP,
            gstCharge: apiRes?.data?.TAX_MP
        }
    } else {
        return apiRes;
    }


}


module.exports = {

    fetchInsModes: async function (req, res) {
        try {
            const loanId = req.param('loan_id');

            if (!loanId) throw [400, "badReqStatus", "missingLoanId"];

            const insModes = await Insurance.find({
                loan_id: loanId,
                record_status: "active"
            }).select(["ins_mode", "ins_id", "ins_name"]);

            if (!sails.config.insurance.insMasterMap) await sails.helpers.setInsMasterMap();
            let insMasterMap = sails.config.insurance.insMasterMap;

            for (const ins of insModes) {
                ins.ins_category = insCategoryMap.get(
                    insMasterMap.get(ins.ins_id).ins_type
                );
                ins.company = insMasterMap.get(ins.ins_id).company;
                ins.high_level_category = insMasterMap.get(ins.ins_id).high_level_category;
            }

            res.send({
                status: statuses.ok,
                statusCode: statusCodes.sucessStatus,
                message: resMessages.dataFetched,
                data: insModes
            })

        } catch (err) {
            console.log(err);
            genericErrorHandler(res, err);
        }
    },

    selectInsCompany: async function (req, res) {
        try {
            const {
                loan_id: loanId,
                ins_details: insDetails
            } = req.allParams();

            if (!loanId) throw [400, "badReqStatus", "missingLoanId"];
            if (!insDetails) throw [400, "badReqStatus", "missingInsDetails"];
            if (!Array.isArray(insDetails)) throw [400, "badReqStatus", "insDetailsMustBeArray"];

            const {
                allInsurancesPassed,
                insIdMapping
            } = await isAllInsurancesPassed(insDetails);

            if (!allInsurancesPassed) throw [400, "badReqStatus", "passAllInsuranceDetails"];

            const modesToBeToggled = [];
            const recordsToBeCreated = [];
            const insIdsToBeInactivated = [];

            const insurances = await InsuranceRd.find({
                loan_id: loanId,
                record_status: 'active'
            }).select(["ins_name", "ins_mode", "ins_id"]);

            const existingInsCompanies = insurances.map(insurance => {
                return {
                    ins_name: insurance.ins_name,
                    ins_mode: insurance.ins_mode
                }
            })

            const activeInsModeMap = new Map(),
                inputInsSet = new Set();

            for (const insurance of insurances) activeInsModeMap.set(insurance.ins_name, {
                ins_mode: insurance.ins_mode,
                ins_ref_number: insurance.id
            });

            for (const detail of insDetails) {
                if (!detail.ins_name) throw [400, "badReqStatus", "improperInsDetails"]
                inputInsSet.add(detail.ins_name);

                if (activeInsModeMap.get(detail.ins_name)) {
                    if (activeInsModeMap.get(detail.ins_name)?.ins_mode != detail.ins_mode) {
                        detail.ins_ref_number = activeInsModeMap.get(detail.ins_name)?.ins_ref_number;
                        modesToBeToggled.push(detail);
                    }
                } else {
                    recordsToBeCreated.push(detail);
                }
            }

            for (const insurance of insurances) {
                if (!inputInsSet.has(insurance.ins_name)) insIdsToBeInactivated.push(insurance.ins_id);
            }

            await Insurance.update({
                loan_id: loanId,
                ins_id: insIdsToBeInactivated
            }).set({"record_status": "inactive"});

            await toggelInsMode(modesToBeToggled);
            await createInsRecords(recordsToBeCreated, insIdMapping, loanId);

            const companySelectionChanged = isCompanySelectionChanged(existingInsCompanies, insDetails);
            if (companySelectionChanged) await inactivateInsDeviation(loanId);

            res.send({
                status: statuses.ok,
                statusCode: statusCodes.sucessStatus,
                message: resMessages.dataUpdated,
            });
        } catch (err) {
            genericErrorHandler(res, err);
        }

    },

    fetchInsSections: async function (req, res) {
        try {
            const loanId = req.param("loan_id");

            if (!loanId) throw [
                400,
                "badReqStatus",
                "missingLoanId"
            ];

            const activeInsurances = await InsuranceRd.find({
                loan_id: loanId,
                record_status: "active"
            }).select([
                "ins_id",
                "ins_name",
                "ins_mode"
            ]);

            const activeInsRefs = [],
                insRefNumbersMap = new Map();

            if (!sails.config.insurance.insMasterMap) await sails.helpers.setInsMasterMap();
            let insMasterMap = sails.config.insurance.insMasterMap;

            for (const insurance of activeInsurances) {
                insRefNumbersMap.set(insurance.id, insurance);
                activeInsRefs.push(insurance.id);
                insurance.ins_category = insCategoryMap.get(
                    insMasterMap.get(insurance.ins_id).ins_type
                );
                insurance.company = insMasterMap.get(insurance.ins_id).company;
                insurance.high_level_category = insMasterMap.get(insurance.ins_id).high_level_category;
            }

            const insuredApplicants = await InsuredApplicantsRd.find({
                ins_ref_number: activeInsRefs,
                record_status: 'active'
            });

            for (let applicant of insuredApplicants) {
                const insuranceData = insRefNumbersMap.get(applicant.ins_ref_number);
                if (!insuranceData.insuredApplicants) insuranceData.insuredApplicants = [];

                if (applicant.pre_quote_data) applicant = {
                    ...applicant,
                    ...applicant.pre_quote_data
                }

                insuranceData.insuredApplicants.push(applicant);

                insRefNumbersMap.set(applicant.ins_ref_number, insuranceData);
            }

            // res.send({
            //     status: "ok",
            //     message: "Data fetched successfully",
            //     data: activeInsurances
            // });

            //check if first loan is dsibursed or not
            const loanSancRed = await LoanSanctionRd.findOne({
                loan_id: loanId
            }).select(["loan_bank_mapping"]);

            // find if any disbursement approved or not
            const disbursementCount = await LoanDisbursementRd.count({
                loan_bank_mapping_id: loanSancRed.loan_bank_mapping,
                disbursement_status: "Disbursed"
            });

            let showInitiateProposalCta,
                proposalStatus,
                showDownLoadCta;

            if (disbursementCount) {
                const onlineInsAppRefs = [];
                const auxMap = new Map();
                for (const activeInsurance of activeInsurances) {
                    if (activeInsurance.ins_mode === "online") {
                        if (applicants = activeInsurance?.insuredApplicants) {
                            for (const applicant of applicants) {
                                onlineInsAppRefs.push(applicant?.id);
                                auxMap.set(applicant?.id, applicant);
                            }
                        }
                    }
                }

                const proposalMap = new Map();
                const insuranceProposals = await InsuranceProposalRd.find({
                    ins_app_ref: onlineInsAppRefs
                });

                for (const proposal of insuranceProposals) {
                    proposalMap.set(proposal?.ins_app_ref, proposal);
                }

                for (const [key, val] of auxMap) {
                    const curProposal = proposalMap.get(key);
                    if (!curProposal?.status && !curProposal?.status_message) {
                        val.show_initiate_proposal_cta = true;
                        val.proposal_status = "Proposal hasn't been initiated for this insurance. Kindly initiate!";
                    } else {
                        if (curProposal?.proposal_ref_num) {
                            val.proposal_status = `Proposal-ref-num: ${curProposal?.proposal_ref_num} | Status: ${curProposal?.status}`;
                            val.show_download_cta = true;
                        } else {
                            val.show_initiate_proposal_cta = true;
                            val.proposal_status = "Proposal hasn't been initiated for this insurance. Kindly initiate!";
                        }
                    }
                }

                //console.log(insuranceProposalRec)
            }

            res.send({
                status: statuses.ok,
                statusCode: statusCodes.sucessStatus,
                message: resMessages.dataFetched,
                data: activeInsurances
            });
        } catch (err) {
            console.log(err)
            genericErrorHandler(res, err);
        }

    },

    insureApplicant: async function (req, res) {
        try {
            const {loan_id: loanId, data} = req.allParams();

            if (!loanId) throw [
                400,
                "badReqStatus",
                "missingLoanId"
            ];

            if (!data) throw [
                400,
                "badReqStatus",
                "missingData"
            ];

            if (!Array.isArray(data)) throw [
                400,
                "badReqStatus",
                "dataMustBeArray"
            ];


            // if (!loanId || !data) return res.send({
            //     status: "nok",
            //     message: "pass the required paramteres"
            // });


            // const directorData = await DirectorRd.findOne({
            //     id: did
            // }).select(["dfirstname", "dlastname", "middle_name", "isApplicant"]);

            const recordsToBeCreated = [];
            const insRefNumbersToBeInactivated = [];
            const recordsToBeUpdated = [];
            const activeInsRefNumbers = [];

            const insuranceData = await InsuranceRd.find({
                loan_id: loanId,
                record_status: 'active'
            }).select("id");

            for (const elm of insuranceData) activeInsRefNumbers.push(elm.id);

            const insuredApplicants = await InsuredApplicantsRd.find({
                record_status: "active",
                ins_ref_number: activeInsRefNumbers
            });

            //const existingCharges = new Map();

            const inputInsuredSet = new Set();
            const existingInsuredSet = new Set();
            //const inputInsAppMap = new Map();

            data.forEach(elm => {
                inputInsuredSet.add(`${elm.ins_ref_number}:${elm.did}`);
            })

            // const recordsToBeInactivated = [],
            //     recordsToBeCreated = []

            for (const applicant of insuredApplicants) {
                // existingCharges.set(`${applicant.applicant_did}:${applicant.ins_ref_number}`, {
                //     insCharge: applicant.ins_charge,
                //     gstCharge: applicant.gst_charge
                // });

                existingInsuredSet.add(`${applicant.ins_ref_number}:${applicant.applicant_did}`);

                if (!inputInsuredSet.has(`${applicant.ins_ref_number}:${applicant.applicant_did}`)) {
                    insRefNumbersToBeInactivated.push(applicant.id);
                }

                //existingInsuredSet.add(`${applicant.applicant_did}:${applicant.ins_ref_number}`)
            }

            data.forEach(elm => {
                const preQuoteData = {
                    applicant_occupation: elm.applicant_occupation
                }

                if (!existingInsuredSet.has(`${elm.ins_ref_number}:${elm.did}`)) {
                    recordsToBeCreated.push({
                        ins_ref_number: elm.ins_ref_number,
                        applicant_did: elm.did,
                        applicant_type: elm.is_applicant ? "applicant" : "co-applicant",
                        // ins_charge: existingCharges.get(`${elm.did}:${elm.ins_ref_number}`)?.insCharge,
                        // gst_charge: existingCharges.get(`${elm.did}:${elm.ins_ref_number}`)?.gstCharge,
                        sum_assured: elm.sum_assured,
                        policy_term: elm.policy_term,
                        pre_quote_data: preQuoteData
                    })
                } else {
                    if (elm.sum_assured || elm.policy_term || elm.applicant_occupation) {
                        recordsToBeUpdated.push({
                            applicant_did: elm.did,
                            ins_ref_number: elm.ins_ref_number,
                            sum_assured: elm.sum_assured,
                            policy_term: elm.policy_term,
                            pre_quote_data: preQuoteData
                        })
                    }
                }
            })

            // data.forEach(elm => {
            //     if (!existingInsuredSet.has())
            // })

            //return res.send({insRefNumbersToBeInactivated, recordsToBeCreated})

            await InsuredApplicants
                .update({id: insRefNumbersToBeInactivated})
                .set({
                    record_status: 'inactive'
                });

            // data.forEach(elm => {
            //     recordsToBeCreated.push({
            //         ins_ref_number: elm.ins_ref_number,
            //         applicant_did: elm.did,
            //         applicant_type: elm.is_applicant ? "applicant" : "co-applicant",
            //         ins_charge: existingCharges.get(`${elm.did}:${elm.ins_ref_number}`)?.insCharge,
            //         gst_charge: existingCharges.get(`${elm.did}:${elm.ins_ref_number}`)?.gstCharge,
            //         sum_assured: elm.sum_assured,
            //         policy_term: elm.policy_term
            //     })
            // })


            await InsuredApplicants.createEach(recordsToBeCreated);

            for (let record of recordsToBeUpdated) {
                await InsuredApplicants.updateOne({
                    applicant_did: record.applicant_did,
                    ins_ref_number: record.ins_ref_number,
                    record_status: "active"
                }).set({
                    sum_assured: record.sum_assured,
                    policy_term: record.policy_term,
                    pre_quote_data: record.pre_quote_data
                })
            }
            // } catch (err) {
            //     console.log(recordsToBeCreated);
            //     console.log(err)
            // }

            const insuredApplicantsChanged = isInsuredApplicantsChanged(insuredApplicants, data);
            if (insuredApplicantsChanged) await inactivateInsDeviation(loanId);

            res.send({
                status: statuses.ok,
                statusCode: statusCodes.sucessStatus,
                message: resMessages.applicantsInsured,
            });
        } catch (err) {
            genericErrorHandler(res, err);
        }
    },

    fetchNomineeSection: async function (req, res) {
        const loanId = req.param('loan_id');

        const insData = await InsuranceRd.find({
            loan_id: loanId,
            record_status: 'active',
            ins_mode: 'online'
        }).select(["ins_id", "ins_name"]);

        const insRefNums = [];

        for (const elm of insData) {
            insRefNums.push(elm.id);
        }

        const insuredApplicants = await InsuredApplicantsRd.find({
            ins_ref_number: insRefNums,
            record_status: "active"
        }).select([
            "ins_ref_number",
            "applicant_did",
            "applicant_type"
        ]);

        // const insuredNominees = await InsuredNomineesRd.find({
        //     ins_ref_number: insRefNums,
        //     record_status: "active"
        // })

        // const auxMap = new Map();
        // const nomineesMap = new Map();

        // for (elm of insuredNominees) {
        //     if (!nomineesMap.get(elm.ins_ref_number)) nomineesMap.set(elm.ins_ref_number, [elm]);
        //     else nomineesMap.get(elm.ins_ref_number).push(elm);
        // }

        // console.log(nomineesMap);

        // for (elm of insuredApplicants) {
        //     if (!auxMap.get(elm.ins_ref_number)) {
        //         auxMap.set(elm.ins_ref_number, {insuredApplicant: new Set(), insuredCoApplicants: new Set()});
        //         if (elm.applicant_type === "applicant") {
        //             auxMap.get(elm.ins_ref_number).insuredApplicant.add(elm.applicant_did);
        //         } else {
        //             auxMap.get(elm.ins_ref_number).insuredCoApplicants.add(elm.applicant_did);
        //         }
        //     } else {
        //         if (elm.applicant_type === "applicant") {
        //             auxMap.get(elm.ins_ref_number).insuredApplicant.add(elm.applicant_did);
        //         } else {
        //             auxMap.get(elm.ins_ref_number).insuredCoApplicants.add(elm.applicant_did);
        //         }
        //     }
        // }

        // console.log(insMasterMap);

        // for (elm of insData) {
        //     elm.insuredApplicant = Array.from(auxMap.get(elm.id).insuredApplicant);
        //     elm.insuredCoApplicants = Array.from(auxMap.get(elm.id).insuredCoApplicants);
        //     elm.nominees = nomineesMap.get(elm.id);
        //     elm.ins_category = insMasterMap.get(elm.ins_id).ins_type;
        // }

        return res.send({status: "ok", data: insuredApplicants})
    },

    addNominee: async function (req, res) {
        const data = req.param('data');
        const recordsToBeCreated = [];
        const insRefNumbers = [];

        for (const elm of data) {
            insRefNumbers.push(elm.ins_ref_number)
            for (const nominee of elm.nominees) {
                recordsToBeCreated.push({
                    ins_ref_number: elm.ins_ref_number,
                    nominee_did: nominee.nominee_did,
                    nominee: nominee.nominee,
                    nominee_type: nominee.nominee_type,
                    nominee_relation: nominee.nominee_relation,
                    nominee_dob: nominee.nominee_dob,
                    nominee_contribution: nominee.nominee_contribution,
                    apointee_name: nominee.apointee_name,
                    apointee_relation: nominee.apointee_relation
                });
            }
        }

        // implement 100% logic
        await InsuredNominees.update({
            ins_ref_number: insRefNumbers
        }).set({"record_status": "inactive"});

        await InsuredNominees.createEach(recordsToBeCreated);

        res.send({
            status: "ok",
            message: "nominees added successfully"
        });
    },

    calculatePremium: async function (req, res) {
        try {
            const loanId = req.param('loan_id');
            const fetchVendorQuote = req.param('fetch_vendor_quote');

            if (!loanId) throw [
                400,
                "badReqStatus",
                "missingLoanId"
            ];

            const insRefNumbers = [], auxMap = new Map();

            const insuranceData = await InsuranceRd.find({
                loan_id: loanId,
                record_status: 'active'
            });

            if (!sails.config.insurance.insMasterMap) await sails.helpers.setInsMasterMap();
            let insMasterMap = sails.config.insurance.insMasterMap;

            for (const elm of insuranceData) {
                insRefNumbers.push(elm.id);
                auxMap.set(elm.id, {
                    ins_id: elm.ins_id,
                    ins_mode: elm.ins_mode,
                    ins_name: elm.ins_name,
                    ins_category: insMasterMap.get(elm.ins_id).ins_type
                });
            }

            const insuredData = await InsuredApplicantsRd.find({ins_ref_number: insRefNumbers, record_status: 'active'});

            const applicant = {}, coApplicants = {};

            for (const elm of insuredData) {
                if (elm.applicant_type === "co-applicant") {
                    if (!coApplicants[elm.applicant_did]) coApplicants[elm.applicant_did] = [elm];
                    else if (coApplicants[elm.applicant_did]) coApplicants[elm.applicant_did].push(elm);
                } else if (elm.applicant_type === "applicant") {
                    if (!applicant[elm.applicant_did]) applicant[elm.applicant_did] = [elm];
                    else if (applicant[elm.applicant_did]) applicant[elm.applicant_did].push(elm);
                }
            }

            for (const key in applicant) {
                for (const elm of applicant[key]) {
                    elm.tooltip = {
                        policy_term: elm.policy_term,
                        sum_assured: elm.sum_assured
                    }
                    elm.vendor_available = insMasterMap.get(auxMap.get(elm.ins_ref_number).ins_id).vendor_available;
                    elm.vendor_integrated = insMasterMap.get(auxMap.get(elm.ins_ref_number).ins_id).vendor_integrated;
                    elm.insurance_id = auxMap.get(elm.ins_ref_number).ins_id;
                    elm.ins_mode = auxMap.get(elm.ins_ref_number).ins_mode;
                    elm.ins_name = auxMap.get(elm.ins_ref_number).ins_name;
                    elm.ins_category = auxMap.get(elm.ins_ref_number).ins_category;
                    elm.ins_category = elm.ins_category.toLowerCase();
                    elm.ins_category = elm.ins_category.replace(/ /g, "_");
                    if (fetchVendorQuote && elm.vendor_available && elm.vendor_integrated && elm.ins_mode === "online") {
                        if (elm.insurance_id === 1006) {
                            const {insCharge, gstCharge, error} = await hdfcLifeInsCharges(key, loanId, elm.sum_assured, elm.policy_term);
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error?.[0]?.errorMessage
                            ];

                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }
                        else if (elm.insurance_id === 1007) {
                            const {insCharge, gstCharge, error} = await pnbMetLifeCharges(key, loanId, elm.sum_assured, elm.policy_term);
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error
                            ];
                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }
                        else if (elm.insurance_id === 1005) {
                            const {insCharge, gstCharge, error} = await sails.helpers.iciciPrudentialQoute(key, loanId, elm.sum_assured, elm.policy_term)
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error
                            ];
                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }
                        else if (elm.insurance_id === 1010) {
                            const {insCharge, gstCharge, error} = await sails.helpers.tataGemiQoute(key, loanId, elm.sum_assured, elm.policy_term, elm.id, elm.pre_quote_data);
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error
                            ];
                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }

                    }
                }
            }

            for (const key in coApplicants) {
                for (const elm of coApplicants[key]) {
                    elm.tooltip = {
                        policy_term: elm.policy_term,
                        sum_assured: elm.sum_assured
                    }
                    elm.vendor_available = insMasterMap.get(auxMap.get(elm.ins_ref_number).ins_id).vendor_available;
                    elm.vendor_integrated = insMasterMap.get(auxMap.get(elm.ins_ref_number).ins_id).vendor_integrated;
                    elm.insurance_id = auxMap.get(elm.ins_ref_number).ins_id;
                    elm.ins_mode = auxMap.get(elm.ins_ref_number).ins_mode;
                    elm.ins_name = auxMap.get(elm.ins_ref_number).ins_name;
                    elm.ins_category = auxMap.get(elm.ins_ref_number).ins_category;
                    elm.ins_category = elm.ins_category.toLowerCase();
                    elm.ins_category = elm.ins_category.replace(/ /g, "_");
                    if (fetchVendorQuote && elm.vendor_available && elm.vendor_integrated && elm.ins_mode === "online") {
                        if (elm.insurance_id === 1006) {
                            const {insCharge, gstCharge, error} = await hdfcLifeInsCharges(key, loanId, elm.sum_assured, elm.policy_term);
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error?.[0]?.errorMessage
                            ];
                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }
                        else if (elm.insurance_id === 1007) {
                            const {insCharge, gstCharge, error} = await pnbMetLifeCharges(key, loanId, elm.sum_assured, elm.policy_term);
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error
                            ];
                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }
                        else if (elm.insurance_id === 1005) {
                            const {insCharge, gstCharge, error} = await sails.helpers.iciciPrudentialQoute(key, loanId, elm.sum_assured, elm.policy_term)
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error
                            ];
                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }
                        else if (elm.insurance_id === 1010) {
                            const {insCharge, gstCharge, error} = await sails.helpers.tataGemiQoute(key, loanId, elm.sum_assured, elm.policy_term, elm.id, elm.pre_quote_data);
                            if (error) throw [
                                502,
                                "badGatewayStatus",
                                "gatewayErrMsg",
                                error
                            ];
                            elm.ins_charge = insCharge;
                            elm.gst_charge = gstCharge;
                            elm.tooltip.quote_date = new Date();
                        }

                    }
                }
            }

            res.send({
                status: statuses.ok,
                statusCode: statusCodes.sucessStatus,
                message: resMessages.applicantsInsured,
                data: {applicant, coApplicants}
            });
        } catch (err) {
            genericErrorHandler(res, err);
        }

    },

    submitCharges: async function (req, res) {
        const data = req.param('data');
        const loanId = req.param('loan_id');

        const insData = await InsuranceRd.find({
            loan_id: loanId,
            record_status: "active"
        }).select(["id", "ins_id"]);

        const insIdInsRef = new Map();
        const insRefIds = [];

        for (const elm of insData) {
            insIdInsRef.set(elm.id, elm.ins_id);
            insRefIds.push(elm.id);
        }
        console.log(insIdInsRef);

        const chargeMap = new Map();

        if (!sails.config.insurance.insMasterMap) await sails.helpers.setInsMasterMap();
        let insMasterMap = sails.config.insurance.insMasterMap;

        const existingApplicantCharges = await InsuredApplicantsRd.find({
            ins_ref_number: insRefIds,
            record_status: 'active'
        })

        for (const elm of data) {
            if (elm.ref_id) {
                await InsuredApplicants.updateOne({
                    id: elm.ref_id
                }).set({
                    ins_charge: elm.ins_charge,
                    gst_charge: elm.gst_charge
                });
                if (!chargeMap.get(elm.ins_ref_number)) {
                    chargeMap.set(elm.ins_ref_number, {
                        ins_charge: elm.ins_charge,
                        gst_charge: elm.gst_charge
                    })
                } else {
                    chargeMap.set(elm.ins_ref_number, {
                        ins_charge: Number((chargeMap.get(elm.ins_ref_number).ins_charge + elm.ins_charge).toFixed(2)),
                        gst_charge: Number((chargeMap.get(elm.ins_ref_number).gst_charge + elm.gst_charge).toFixed(2)),
                    })
                }
            }
        }

        const loanBankMappingData = {
            loan_id: loanId,
            ...defaultInsData
        }

        for (const [key, val] of chargeMap) {
            console.log(key, val);
            await Insurance.updateOne({id: key}).set({
                ins_charge: val.ins_charge,
                gst_charge: val.gst_charge
            });

            loanBankMappingData[comapnyNameMapping.get(insIdInsRef.get(key)).comp] = insMasterMap.get(insIdInsRef.get(key)).ins_name;
            loanBankMappingData[comapnyNameMapping.get(insIdInsRef.get(key)).fee] = Math.round((Number(val.ins_charge) + Number(val.gst_charge)));
            await LoanBankMapping.updateOne({loan_id: loanId}).set({...loanBankMappingData});
            await LoanSanction.updateOne({loan_id: loanId}).set({...loanBankMappingData});
        }

        //console.log(chargeMap);
        console.log(insMasterMap);
        console.log(loanBankMappingData);

        const chargesChanged = isChargesChanged(existingApplicantCharges, data);
        if (chargesChanged) await inactivateInsDeviation(loanId)

        res.send({
            status: "ok",
            message: "charges submitted successfully",
            loanBankMappingData
        })
    },

    penetrationDetails: async function (req, res) {
        const loanId = req.param('loan_id');

        const insuranceData = await InsuranceRd.find({
            loan_id: loanId,
            record_status: "active"
        });

        const insRefMapping = new Map();

        const insRefNums = [];
        const insIds = [];

        for (const elm of insuranceData) {
            insRefMapping.set(elm.id, elm.ins_id);
            insRefNums.push(elm.id);
            insIds.push(elm.ins_id);
        }

        const insuredApplicants = await InsuredApplicantsRd.find({
            ins_ref_number: insRefNums,
            record_status: "active"
        })

        const sanctionData = await LoanSanctionRd.findOne({
            loan_id: loanId
        }).select(["san_amount", "amount_um"]);

        let loanAmount = getAmount(sanctionData?.san_amount, sanctionData?.amount_um);

        const coApplicantsMap = new Map();
        const applicantsMap = new Map();
        const insuranceWithCoApps = new Set();

        let applicantPen, coApplicantPen;

        let applicants = {}, coApplicants = {};

        if (!sails.config.insurance.insMasterMap) await sails.helpers.setInsMasterMap();
        let insMasterMap = sails.config.insurance.insMasterMap;

        for (const applicant of insuredApplicants) {
            if (applicant.applicant_type === "applicant") {
                if (!applicants[applicant.applicant_did]) applicants[applicant.applicant_did] = [applicant];
                else applicants[applicant.applicant_did].push(applicant);
            } else {
                if (!coApplicants[applicant.applicant_did]) coApplicants[applicant.applicant_did] = [applicant];
                else coApplicants[applicant.applicant_did].push(applicant);
                insuranceWithCoApps.add(applicant.ins_ref_number);
            }
        }

        const applicantsPenetration = {}, coApplicantsPenetration = {};
        let finalPenetrationPercentage = 0;

        for (const did in applicants) {
            const {lifeInsPenetration, genInsPenetration, totalPenetration} = calculatePenetration(applicants[did], insRefMapping, loanAmount);
            applicantsPenetration[did] = {
                lifeInsPenetration, genInsPenetration, totalPenetration
            }
            finalPenetrationPercentage += Number(totalPenetration);
        }

        for (const did in coApplicants) {
            const {lifeInsPenetration, genInsPenetration, totalPenetration} = calculatePenetration(coApplicants[did], insRefMapping, loanAmount);
            coApplicantsPenetration[did] = {
                lifeInsPenetration, genInsPenetration, totalPenetration
            }
            finalPenetrationPercentage += Number(totalPenetration);
        }

        finalPenetrationPercentage = finalPenetrationPercentage.toFixed(2);

        let deviationRequired = (finalPenetrationPercentage >= 4.5 && finalPenetrationPercentage <= 5) ? false : true;
        let coApplicantRequired = false, coAppsNeededFor;


        if (finalPenetrationPercentage < 4.5) {
            // get all all insured coApplicants
            console.log(insuredApplicants);
            console.log(insMasterMap);
            console.log(insuranceWithCoApps);
            console.log(insRefMapping);
            coAppsNeededFor = [];
            insRefMapping.forEach((val, key) => {
                if (!insuranceWithCoApps.has(key)) {
                    console.log(val, key);
                    coAppsNeededFor.push((insMasterMap.get(val).ins_type))
                }
            });
            if (coAppsNeededFor.length) coApplicantRequired = true;
        }

        let allInsurancesSelected = await isAllInsurancesSelected(insuranceData, insIds);
        if (!allInsurancesSelected) deviationRequired = true;

        return res.send({
            status: "ok",
            data: {
                applicantsPenetration,
                coApplicantsPenetration,
                finalPenetrationPercentage,
                deviationRequired: false,
                coApplicantRequired,
                coAppsNeededFor,
                allInsurancesSelected
            }
        })
    },

    submitPenetration: async function (req, res) {
        const loanId = req.param('loan_id');
        const deviationRaised = req.param('deviation_raised');
        const lmapData = await LoanBankMappingRd.findOne({
            loan_id: loanId,
        }).select("id");

        const url = `${sails.config.insurance.hostname}/sanction_letter_regenerate`;

        const headers = {
            "Authorization": req.headers.authorization
        },
            method = "POST",
            body = {
                loan_id: loanId,
                loan_bank_mapping_id: lmapData.id
            };
        const apiRes = await sails.helpers.axiosApiCall(url, body, headers, method);
        console.log("sanction-letter-regen apires:", apiRes);

        const deviationStatus = deviationRaised ? 'initiated' : 'not-required';

        await InsuranceDeviation.update({
            loan_id: loanId
        }).set({
            record_status: "inactive"
        });

        await InsuranceDeviation.create({
            loan_id: loanId,
            status: deviationStatus
        })

        return res.send({
            status: "ok",
            message: "penetration details submitted successfully!"
        })
    },

    penetrationStatus: async function (req, res) {
        const loanId = req.param('loan_id');

        let deviationData = await InsuranceDeviationRd.findOne({
            loan_id: loanId,
            record_status: "active"
        }).select(["status"]);

        let insuranceCount = await InsuranceRd.count({
            loan_id: loanId,
            record_status: "active"
        });

        let status = deviationData?.status;
        let penetrationSubmitted = (status == "not-required" || status == "initiated");
        let insuranceSectionUsed = insuranceCount ? true : false;

        return res.send({
            status: "ok",
            message: "status fetched",
            penetrationSubmitted,
            insuranceSectionUsed
        })
    },

    getInsConfig: async function (req, res) {
        const productId = req.param('product_id');
        const config = await LoanProductsRd.findOne({
            id: productId
        }).select("insurance_data");

        res.send({
            "status": "ok",
            data: JSON.parse(config.insurance_data)
        })
    },

    proposal: async function (req, res) {

        const appRefId = req.param('app_ref_id');

        const data = await sails.helpers.initiateProposal(appRefId, req.headers.authorization);

        res.send(data);

        // const loanId = req.param('loan_id');
        // const insuranceData = await InsuranceRd.find({
        //     loan_id: loanId,
        //     record_status: "active",
        //     ins_id: [1006, 1007]
        // }).select(["id", "ins_id"]);

        // const insRefNums = insuranceData.map(ins => ins.id)

        // const insuredApplicants = await InsuredApplicantsRd.find({
        //     ins_ref_number: insRefNums,
        //     record_status: "active"
        // })

        // return res.send({insuredApplicants, insRefNums, insuranceData})
    },

    proposalStatus: async function (req, res) {
        const appRefId = req.param('app_ref_id');

        const data = await sails.helpers.trackProposal(appRefId);

        res.send({data});
    },

    proposalCoi: async function (req, res) {
        const appRefId = req.param('app_ref_id');

        const data = await sails.helpers.getProposalCoi(appRefId);

        res.send({
            status: "ok",
            message: "coi link fetched!",
            coi_link: data
        });
    },

    reset: async function (req, res) {

        try {
            const loanId = req.param('loan_id');
            if (!loanId) {
                throw new Error(sails.config.msgConstants.parameterMissing);
            }
            const result = await sails.helpers.insReset(loanId);
            return res.send({
                status: 'ok',
                message: result
            });
        } catch (error) {
            return res.send({
                status: 'nok',
                message: error.message
            });
        }

    }

};



async function isAllInsurancesPassed(insDetails) {

    const insNames = insDetails.map(curIns => curIns.ins_name);

    const insMasterData = await InsuranceMasterRd.find({
        ins_name: insNames
    }).select(["ins_category", "ins_id", "ins_name"]);

    const insIdMapping = {};
    const insCategorySet = new Set();

    for (const data of insMasterData) {
        insIdMapping[data.ins_name] = data.ins_id;
        insCategorySet.add(data.ins_category);
    }

    let allInsurancesPassed = false;

    for (const insurance of requiredInsurances) {
        allInsurancesPassed = true;
        if (!insCategorySet.has(insurance)) {
            allInsurancesPassed = false;
            break;
        }
    }

    return {
        allInsurancesPassed: true, // making it true always as it's not mandatory to pass all insurances
        insIdMapping
    };
}

async function toggelInsMode(modesToBeToggled) {
    for (const curElm of modesToBeToggled) {
        await Insurance
            .updateOne({
                id: curElm?.ins_ref_number
            })
            .set({ins_mode: curElm.ins_mode})
    }
}

async function createInsRecords(recordsToBeCreated, insIdMapping, loanId) {
    const newRecords = recordsToBeCreated.map(elm => {
        return {
            loan_id: loanId,
            ins_id: insIdMapping[elm.ins_name],
            ins_name: elm.ins_name,
            ins_mode: elm.ins_mode
        }
    });

    await Insurance.createEach(newRecords);
}

function calculatePenetration(insurances, insRefMapping, loanAmount) {
    let lifeIns = 0, genIns = 0;
    for (const ins of insurances) {
        if (insRefMapping.get(ins.ins_ref_number) >= 1015 &&
            insRefMapping.get(ins.ins_ref_number) <= 1018) {
            genIns += 0;
        } else if (insRefMapping.get(ins.ins_ref_number) === 1006 ||
            insRefMapping.get(ins.ins_ref_number) === 1007 ||
            insRefMapping.get(ins.ins_ref_number) === 1005) {
            lifeIns += ins.ins_charge;
        } else genIns += ins.ins_charge;
    }
    const lifeInsPenetration = ((lifeIns / loanAmount) * 100).toFixed(2);
    const genInsPenetration = ((genIns / loanAmount) * 100).toFixed(2);
    const totalPenetration = (Number(lifeInsPenetration) + Number(genInsPenetration)).toFixed(2);
    return {lifeInsPenetration, genInsPenetration, totalPenetration}
}

async function isAllInsurancesSelected(insuranceData, insIds) {
    const totInsChoosen = insuranceData.length;

    let insMasterMap = sails.config.insurance.insMasterMap;

    console.log(insMasterMap);

    const masterData = await InsuranceMasterRd.find({
        ins_id: insIds
    }).select("company");

    const distinctCompanies = new Set(masterData.map((data) => data.company));

    let requiredInsCount = 0;

    for (const company of distinctCompanies) {
        const curCount = await InsuranceMasterRd.count({company: company});
        requiredInsCount += curCount;
    }

    return (totInsChoosen == requiredInsCount) ? true : false;
}

async function inactivateInsDeviation(loanId) {
    const activeDeviationRecords = await InsuranceDeviationRd.count({
        loan_id: loanId,
        record_status: "active",
        status: 'not-required'
    });

    if (activeDeviationRecords) await InsuranceDeviation.update({
        loan_id: loanId,
        record_status: "active",
        status: 'not-required'
    }).set({
        record_status: 'inactive'
    })
}

function isCompanySelectionChanged(existingCompanies, newCompanies) {
    let companySelectionChanged = false;

    const existingSet = new Set();
    const newSet = new Set();

    for (const company of existingCompanies) existingSet.add(`${company?.ins_name}:${company?.ins_mode}`);
    for (const company of newCompanies) newSet.add(`${company?.ins_name}:${company?.ins_mode}`);

    for (const item of existingSet) {
        if (!newSet.has(item)) {
            companySelectionChanged = true;
            break;
        }
    }

    for (const item of newSet) {
        if (!existingSet.has(item)) {
            companySelectionChanged = true;
            break;
        }
    }

    return companySelectionChanged;
}

function isInsuredApplicantsChanged(existingApplicants, newApplicants) {
    let applicantSelectionChanged = false;

    const existingSet = new Set();
    const newSet = new Set();

    for (const applicant of existingApplicants) existingSet.add(`${applicant.applicant_did}:${applicant.ins_ref_number}:${applicant.sum_assured || ""}:${applicant.policy_term || ""}`);

    for (const applicant of newApplicants) newSet.add(`${applicant.did}:${applicant.ins_ref_number}:${applicant.sum_assured || ""}:${applicant.policy_term || ""}`);

    for (const item of existingSet) {
        if (!newSet.has(item)) {
            applicantSelectionChanged = true;
            break;
        }
    }

    for (const item of newSet) {
        if (!existingSet.has(item)) {
            applicantSelectionChanged = true;
            break;
        }
    }

    return applicantSelectionChanged;

}

function isChargesChanged(existingCharges, newCharges) {
    let chargesChanged = false;

    const existingMap = new Map();
    const newMap = new Map();

    for (const item of existingCharges) existingMap.set(
        `${item.id}:${item.ins_ref_number}`,
        {
            ins_charge: item.ins_charge,
            gst_charge: item.gst_charge
        }
    )

    for (const item of newCharges) newMap.set(
        `${item.ref_id}:${item.ins_ref_number}`,
        {
            ins_charge: item.ins_charge,
            gst_charge: item.gst_charge
        }
    );

    for (const [key, val] of existingMap) {
        if (!newMap.has(key)) {
            chargesChanged = true;
            break;
        } else {
            if ((newMap.get(key)?.ins_charge != existingMap.get(key).ins_charge) ||
                newMap.get(key)?.gst_charge != existingMap.get(key)?.gst_charge) {
                chargesChanged = true;
                break;
            }
        }


    }


    return chargesChanged;
}
