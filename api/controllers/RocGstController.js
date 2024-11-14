/**
     *
     * @api {POST} /GST-ROC/Login Login
     * @apiName Login
     * @apiGroup Authentication
     *
     * @apiParam {String} client_id
     * @apiParam  {String} password
     * @apiExample {js} Login API Sample Request:
     *  {
     *    "client_id" : "client ID",
     *    "password":"password"
     *  }

    * @apiSuccessExample {json} Success response:
    * HTTPS 200 OK
    * {
         "status": "ok",
         "message": "logged in successfully",
         "statusCode": 200,
         "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiY2xpZW50X25hbWUiOiJ0ZXN0IiwiY2xpZW50X2xvZ28iOiIiNzE0MDQ4NzIyLCJzZWNyZX....CbrUBuVUPy4FJ0JrroS8VJoNqvuhoafX0jM"
    }
    * @apiErrorExample {json} Unauthorized Error response:
            Error 401: Unauthorized
            {
                "statusCode": "NC500",
                "message": "No Authorization header was found"
            }
    * @apiErrorExample {json} Invalid Error response:
            {
                "status": "nok",
                "message": ""Invalid Parameters or Invalid password"",
                "statusCode": 401
            }
*/
const moment = require("moment");
module.exports = {
    GSTROCLogin: async function (req, res) {
        const passedParams = req.allParams();
        let { password, client_id } = passedParams;

        if (!password || !client_id) {
            const mandatoryParams = await sails.config.mandatoryParams.RocGst.GSTROCLogin;
            const missingParams = await sails.helpers.getMissingParams(passedParams, mandatoryParams);
            return res.ok(sails.config.missingParamsResponse(missingParams));
        }
        let clientData = await Clients.findOne({
            select: ['client_name', 'client_logo', 'is_active', 'created_at', 'updated_at', 'client_id', 'secret_key', 'email', 'white_label_id'],
            where: { client_id, password, is_active: 'active' }
        });
        if (!clientData) {
            return res.ok(sails.config.errRes.invalidParameter);
        }
        let token = await sails.helpers.jwtToken('sign', clientData);
        sails.config.successRes.login.accessToken = token;
        return res.ok(sails.config.successRes.login);
    },
    gstDataFetch: async function (req, res) {
        let { gst, pan_number, state_code } = req.allParams();
        const datetime = await sails.helpers.dateTime();
        if ((!gst && pan_number) || (gst && !pan_number) || (gst && pan_number)) {

        } else {
            return res.ok(sails.config.errRes.missingFields);
        }
        let update_client = {};
        let gstPan = gst ? gst : pan_number;
        const randomTwoUnique = Math.floor(Math.random() * (+ 9999 - + 1000)) + + 1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number('' + uniqTimeStamp + randomTwoUnique);
        let last_3_month = new Date();
        last_3_month = moment(last_3_month).subtract(3, 'months').format('YYYY-MM-DD HH:mm:ss');
        const data = {
            request_id: uniqueRandomId,
            req_datetime: datetime, // generated_key: req.headers.authorization,
            client_id: req.client_id,
            req_status: 'initiate',
            is_active: 'active',
            req_type: 'GST',
            flag: '0',
            created_at: datetime,
            updated_at: datetime
        };
        const gstData = {
            client_id: req.client_id,
            created_at: datetime
        };
        let gstRocCreate,
            clientReqCreate, gstFetchData, gst_master_data, gst_master_details, updateGSTmasterData, insert_Gst_master_data;
        let whereCondition = {
            updated_date: { '>=': last_3_month }
        };
        if (pan_number) {
            whereCondition.gst_no = { contains: pan_number }
        } else {
            whereCondition.gst_no = gst
        }

        gst_records = await GstMaster.find(whereCondition).sort("updated_date DESC").limit(1);
        if (gst_records && gst_records[0] && gst_records[0].gst_output) {
            gstFetchData = await RequestDocument.find({
                CIN_GST_PAN_number: gstPan,
                or: [
                    {
                        request_type: "GST"
                    }, {
                        request_type: "PAN"
                    }
                ]
            }).sort("id DESC");

            // Try to get stored data from the database and if adadr field is there then get from database else call vendor api
            let storedData = {};
            try {
                storedData = JSON.parse(gstFetchData[0].response);
            } catch (err) { }


            if (storedData && storedData[0] && storedData[0].data.adadr) {
                let dataArray = [];
                gstFetchData.forEach(element => {
                    dataArray.push(element.request_id);
                });
                await ClientRequest.find({ client_id: req.client_id, request_id: dataArray }).then(async clientReqDataFetch => {
                    if (clientReqDataFetch.length == 0) {
                        clientReqCreate = await ClientRequest.create(data).fetch();
                        gstData.request_type = gstFetchData[0].request_type;
                        gstData.CIN_GST_PAN_number = gstPan;
                        gstData.request_id = clientReqCreate.request_id;
                        gstData.response = gstFetchData[0].response;
                        gstRocCreate = await RequestDocument.create(gstData).fetch();
                        update_client.req_status = 'completed';
                        await ClientRequest.update({ request_id: clientReqCreate.request_id }).set(update_client).fetch();
                    }
                });
            }
            return res.ok({ status: 'ok', statusCode: 200, data: storedData });
        }
        else {
            let url,
                method,
                header;
            clientReqCreate = await ClientRequest.create(data).fetch();
            let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
            if (!quickoLogin || quickoLogin.status == "nok")
                return res.badRequest(quickoLogin);

            if (!quickoLogin || !quickoLogin.access_token)
                return res.ok(quickoLogin);

            header = {
                "Authorization": quickoLogin.access_token,
                "x-api-key": sails.config.quicko.apiKey,
                "x-api-version": sails.config.quicko.apiVersion
            };
            let quickgstResponse;

            if (gst) {
                url = `${sails.config.quicko.api.gstPanApi.gstAPI}/${gst}`;
                method = 'GET';
                quickgstResponse = await sails.helpers.apiTrigger(url, '', header, method);
                quickgstResponse = JSON.parse(quickgstResponse);
                if (quickgstResponse && quickgstResponse.status != 'nok' && quickgstResponse.data) {
                    gstData.request_type = 'GST';
                    gstData.CIN_GST_PAN_number = gst;
                    gst_master_data = {
                        gst_no: quickgstResponse.data.gstin,
                        gstno_state: quickgstResponse.data.sts,
                        business_id: 0,
                        updated_date: await sails.helpers.dateTime(),
                        gst_output: JSON.stringify(quickgstResponse),
                        created_date: await sails.helpers.dateTime(),
                        gst_request_time: await sails.helpers.dateTime()
                    }
                    gst_master_details = await GstMaster.find({ gst_no: gst }).sort("id DESC").limit(1);
                }
                else {
                    return res.badRequest({
                        status: "nok",
                        data: quickgstResponse
                    })
                }
            }
            else if (pan_number) {
                if (!state_code) {
                    sails.config.errRes.missingFields.message = 'The required parameter is missing as state_code';
                    return res.badRequest(sails.config.errRes.missingFields);
                }
                url = `${sails.config.quicko.api.gstPanApi.PanAPI}/${pan_number}?state_code=${state_code}`;
                method = 'GET';
                quickgstResponse = await sails.helpers.apiTrigger(url, '', header, method);
                quickgstResponse = JSON.parse(quickgstResponse);
                if (quickgstResponse && quickgstResponse.data && quickgstResponse.data[0] && quickgstResponse.status != 'nok') {
                    let gstin = quickgstResponse.data[0].data ? quickgstResponse.data[0].data.gstin : "";
                    let gst_state = quickgstResponse.data[0].data.adadr[0] ? quickgstResponse.data[0].data.adadr[0].addr.stcd : "";
                    gstData.request_type = 'PAN';
                    gstData.CIN_GST_PAN_number = pan_number;
                    gst_master_data = {
                        gst_no: gstin,
                        gstno_state: gst_state,
                        business_id: 0,
                        updated_date: await sails.helpers.dateTime(),
                        gst_output: JSON.stringify(quickgstResponse),
                        created_date: await sails.helpers.dateTime(),
                        gst_request_time: await sails.helpers.dateTime(),
                    }
                    gst_master_details = await GstMaster.find({ gst_no: gstin }).sort("id DESC").limit(1);
                }
                else {
                    return res.badRequest({
                        status: "nok",
                        data: quickgstResponse
                    })
                }
            }
            if (gst_master_details && gst_master_details[0]) {
                updateGSTmasterData = await GstMaster.update({ id: gst_master_details[0].id }).set(gst_master_data).fetch();
            } else {
                if (gst_master_data) {
                    insert_Gst_master_data = await GstMaster.create(gst_master_data).fetch();
                }
            }

            if ((quickgstResponse && quickgstResponse.status == 'nok') || quickgstResponse.code != 200) {
                update_client.req_status = 'failed';
                await ClientRequest.update({ request_id: clientReqCreate.request_id }).set(update_client).fetch();
                return res.badRequest(quickgstResponse);
            }
            if (clientReqCreate) {
                update_client.req_status = 'completed';
                await ClientRequest.update({ request_id: clientReqCreate.request_id }).set(update_client).fetch();
                gstData.request_id = clientReqCreate.request_id;
                gstData.response = JSON.stringify(quickgstResponse.data);
                gstRocCreate = await RequestDocument.create(gstData).fetch();
                if (gstRocCreate) {
                    return res.ok({ status: 'ok', statusCode: 200, updateGSTmasterData, insert_Gst_master_data, data: quickgstResponse.data });
                }
            }
        }
    },

    getROCData: async function (req, res) {
        let cin = req.param('cin_number');
        if (!cin) {
            const mandatoryParams = await sails.config.mandatoryParams.RocGst.getROCData;
            const missingParams = await sails.helpers.getMissingParams(req.allParams(), mandatoryParams);
            return res.badRequest(sails.config.missingParamsResponse(missingParams));
        }

        let cinRocCreate, clientReqCreate;
        let update_client = {};

        const uniqueRandomId = await sails.helpers.getUniqueId();

        const datetime = await sails.helpers.istDateTime();
        let last_3_month = new Date();
        last_3_month = moment(last_3_month).subtract(3, 'months').format('YYYY-MM-DD HH:mm:ss');
        console.log(last_3_month);
        const data = {
            request_id: uniqueRandomId,
            req_datetime: datetime, // generated_key: req.headers.authorization,
            client_id: req.client_id,
            req_status: 'initiate',
            is_active: 'active',
            req_type: 'ROC',
            flag: '0',
            created_at: datetime,
            updated_at: datetime
        };
        const cinData = {
            client_id: req.client_id,
            created_at: datetime
        };
        let rocData = await CompanyMasterData.findOne({ cin: cin, LAST_UPDATED: { '>=': last_3_month } }).select(["cin", "OUTPUT_JSON"]);
        console.log(rocData);
        let gstParseData, dbRetrival = false;

        if (rocData && rocData.OUTPUT_JSON) {
            try {
                let gstFetchData = await RequestDocument.find({ CIN_GST_PAN_number: cin }).sort("id desc").limit(1);
                try {
                    gstParseData = JSON.parse(gstFetchData[0].response);
                } catch (err) {
                }
                let dataArray = [];
                gstFetchData.forEach(element => {
                    dataArray.push(element.request_id);
                });
                await ClientRequest.find({ client_id: req.client_id, request_id: dataArray }).then(async clientReqDataFetch => {
                    if (clientReqDataFetch.length == 0) {
                        clientReqCreate = await ClientRequest.create(data).fetch();
                        cinData.request_type = gstFetchData[0].request_type;
                        cinData.CIN_GST_PAN_number = cin;
                        cinData.request_id = clientReqCreate.request_id;
                        cinData.response = gstFetchData[0].response;
                        gstRocCreate = await RequestDocument.create(cinData).fetch();
                        update_client.req_status = 'completed';
                        await ClientRequest.update({ request_id: clientReqCreate.request_id }).set(update_client).fetch();
                    }
                });
                gstParseData = JSON.parse(gstFetchData[0].response);
                dbRetrival = true;
                return res.ok({ status: 'ok', statusCode: 200, data: gstParseData });

            } catch (err) {
            }
        }

        if (!dbRetrival) {
            console.log("+++++++++++++++++++++++++++++++++")
            let resObj = {};
            let directorArr = [];
            let url,
                method,
                header;

            clientReqCreate = await ClientRequest.create(data).fetch();
            // Login api call to get quicko access api key start
            let quickoLogin = await sails.helpers.getQuickoToken(sails.config.quicko.companyName);
            if (!quickoLogin || quickoLogin.status == "nok") {
                quickoLogin.message = 'Unable to fetch ROC data from source. Please try again.';
                return res.badRequest(quickoLogin);
            }

            if (!quickoLogin || !quickoLogin.access_token) {
                quickoLogin.message = 'Unable to fetch ROC data from source. Please try again.';
                return res.badRequest(quickoLogin);
            }

            header = {
                "Authorization": quickoLogin.access_token,
                "x-api-key": sails.config.quicko.apiKey,
                "x-api-version": sails.config.quicko.apiVersion
            };
            if (cin) { // Cin api call start
                let consent = 'Y';
                let reason = 'Loan Processing';
                url = `${sails.config.quicko.api.rocApi.rocCompanyApi}`; ///${cin}?consent=${consent}&reason=${reason}`;
                const body = JSON.stringify({
                    "@entity": "in.co.sandbox.kyc.mca.master_data.request",
                    "id": cin,
                    "consent": "y",
                    "reason": "for KYC"
                });
                method = 'POST';
                let quickCin = await sails.helpers.apiTrigger(url, body, header, method);
                if (quickCin.status != 'nok')
                    quickCin = JSON.parse(quickCin);


                // console.log(quickCin);
                // api call end
                if ((quickCin && quickCin.status == 'nok') || quickCin.code != 200) {
                    update_client.req_status = 'failed';
                    await ClientRequest.update({ request_id: clientReqCreate.request_id }).set(update_client);
                    quickCin.message = quickCin.message || 'Unable to fetch ROC data from source. Please try again.';
                    return res.badRequest({
                        status: "nok",
                        ...quickCin
                    });
                }
                jsonConvertedData = quickCin.data;
                if (Object.keys(jsonConvertedData).length == 0 && Object.values(jsonConvertedData).length == 0) {
                    return res.badRequest({ status: 'nok', message: quickCin.message || 'Entered CIN is not found. Please enter valid details.' })
                }
                resObj['company_master_data'] = jsonConvertedData.company_master_data;
                resObj['charges'] = jsonConvertedData.charges;
                let directorData = jsonConvertedData['directors/signatory_details'];
                cinData.request_type = 'ROC';
                cinData.CIN_GST_PAN_number = cin;
                if (directorData.length > 0) {
                    for (let i = 0; i < directorData.length; i++) {
                        //the current item of the array
                        let directorItem = directorData[i];

                        //if din/pan does not exists then the url will be different
                        let resultNan = Number(directorItem['din/pan'], 10);
                        //we set the url for the above case here
                        if (!isNaN(resultNan)) {
                            url = `${sails.config.quicko.api.rocApi.directorApi}/${directorItem['din/pan']}?consent=${consent}&reason=${reason}`;
                        }

                        //third party API to return us the data of the director of the company in string format
                        //we won't convert it to JSON because we will directly store this string format data directly in the database
                        let directorRes = await sails.helpers.apiTrigger(url, '', header, method);
                        if (directorRes.status != 'nok') directorRes = JSON.parse(directorRes);
                        directorItem.assosiate_company_details = directorRes.data;
                        directorArr.push(directorItem);
                    }
                    resObj['directors/signatory_details'] = directorArr;

                } else {
                    resObj['directors/signatory_details'] = jsonConvertedData['directors/signatory_details'];
                }
                try {
                    const outputData = {
                        cin: cin,
                        data: {
                            director: resObj['directors/signatory_details'],
                            llp: resObj['company_master_data'],
                            rocCharges: resObj['charges']
                        }
                    };
                    //   console.log("outputData", rocData && rocData.cin);
                    const rocDataFetch = await CompanyMasterData.findOne({ cin: cin });
                    if (rocDataFetch) {
                        console.log("🚀 ~ file: RocGstController.js:348 ~ rocData:", rocData);
                        await CompanyMasterData.updateOne({ cin: cin }).set({
                            OUTPUT_JSON: JSON.stringify(outputData),
                            LAST_UPDATED: await sails.helpers.dateTime()
                        });
                    } else {
                        console.log("************************************************************************8");
                        const insertData = {
                            cin: cin,
                            COMPANY_NAME: outputData.data.llp.company_name,
                            COMPANY_STATUS: outputData.data.llp['company_status(for_efiling)'],
                            COMPANY_CLASS: outputData.data.llp.class_of_company,
                            COMPANY_CATEGORY: outputData.data.llp.company_category,
                            AUTHORIZED_CAPITAL: outputData.data.llp['authorised_capital(rs)'],
                            PAIDUP_CAPITAL: outputData.data.llp['paid_up_capital(rs)'],
                            // DATE_OF_REGISTRATION: outputData.data.llp,
                            // REGISTERED_STATE: outputData.data.llp,
                            // REGISTRAR_OF_COMPANIES: outputData.data.llp,
                            // PRINCIPAL_BUSINESS_ACTIVITY: outputData.data.llp,
                            REGISTERED_OFFICE_ADDRESS: outputData.data.llp['registered_address'],
                            SUB_CATEGORY: outputData.data.llp['company_subcategory'],
                            ROC_CHARGES: (typeof outputData.data.rocCharges === "string") ? outputData.data.rocCharges : JSON.stringify(outputData.data.rocCharges),
                            EMAIL_ID: outputData.data.llp.email_id,
                            DATE_OF_LAST_AGM: outputData.data.llp.date_of_last_agm,
                            DATE_OF_LAST_BALANCE_SHEET: outputData.data.llp['date_of_balance_sheet'],
                            LAST_UPDATED: await sails.helpers.dateTime(), // signatory_datetime: outputData.data.llp,
                            OUTPUT_JSON: JSON.stringify(outputData)
                        };
                        console.log("🚀 ~ file: RocGstController.js:376 ~ insertData:", insertData)
                        let aa = await CompanyMasterData.create(insertData).fetch();
                        console.log("++++++++++++++++++++++++=====================================", aa);
                    }
                    if (clientReqCreate) {
                        console.log("===============================");
                        update_client.req_status = 'completed';
                        await ClientRequest.update({ request_id: clientReqCreate.request_id }).set(update_client).fetch();
                        cinData.response = JSON.stringify(resObj);
                        cinData.request_id = clientReqCreate.request_id;
                        cinRocCreate = await RequestDocument.create(cinData).fetch();
                        if (cinRocCreate) {
                            return res.ok({ status: 'ok', statusCode: 200, data: resObj });
                        }
                    }
                } catch (err) {
                    return res.ok({ error: err.message })
                }
            }
        }
    }
};

function toSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(toSnakeCase); // Recursively process array elements
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert camelCase to snake_case
            acc[snakeKey] = toSnakeCase(obj[key]); // Recursively process nested objects or arrays
            return acc;
        }, {});
    } else {
        return obj; // Return value as is if it's not an object or array
    }
}
