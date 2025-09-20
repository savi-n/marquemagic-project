/**
 * CompanyController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    updateData: async function (req, res) {
        let cin = req.param('cin');
        if (!cin) return res.badRequest({
            status: "nok",
            message: "cin is mandatory. kindly pass it in the payload."
        });

        let status = 'nok',
            data,
            message = "couldn't find any data"

        try {
            let apiRes = await sails.helpers.sailstrigger(
                `${sails.config.companySearchApi}?cin=${cin}`,
                "",
                "",
                "GET"
            );

            apiRes = JSON.parse(apiRes);

            let record = apiRes.data;
            record = JSON.parse(record);

            if (record?.data?.company_master_data?.company_name) {
                data = {
                    CORPORATE_IDENTIFICATION_NUMBER: record?.data?.company_master_data?.cin,
                    COMPANY_NAME: record?.data?.company_master_data?.company_name
                }
                status = "ok";
                message = "data found";

                // search if comapny exists or not
                const recCount = await CompanyMasterDataRd.count({
                    CORPORATE_IDENTIFICATION_NUMBER: record?.data?.company_master_data?.cin,
                });

                if (!recCount) {
                    await CompanyMasterData.create({
                        CORPORATE_IDENTIFICATION_NUMBER: record?.data?.company_master_data?.cin,
                        DATE_OF_REGISTRATION: record?.data?.company_master_data?.date_of_incorporation,
                        COMPANY_NAME: record?.data?.company_master_data?.company_name,
                        COMPANY_STATUS: record?.data?.company_master_data?.['company_status(for_efiling)'],
                        COMPANY_CLASS: record?.data?.company_master_data?.class_of_company,
                        COMPANY_CATEGORY: record?.data?.company_master_data?.company_category,
                        AUTHORIZED_CAPITAL: record?.data?.company_master_data?.['authorised_capital(rs)'],
                        PAIDUP_CAPITAL: record?.data?.company_master_data?.['paid_up_capital(rs)'],
                        //REGISTERED_STATE: record.registered_state,
                        //REGISTRAR_OF_COMPANIES: record.registrar_of_companies,
                        //PRINCIPAL_BUSINESS_ACTIVITY: record.principal_business_activity,
                        REGISTERED_OFFICE_ADDRESS: record?.data?.company_master_data?.registered_address,
                        SUB_CATEGORY: record?.data?.company_master_data?.company_subcategory,
                        LAST_UPDATED: await sails.helpers.dateTime()
                    });
                }
            } else {
                return res.badRequest({
                    status: "nok",
                    message: "NO data found for this CIN OR MCA server down!"
                })
            }
        } catch (err) {
            message = err.message;
            console.log(err.message);
        }

        res.send({
            status,
            data,
            message
        });

    }

};
