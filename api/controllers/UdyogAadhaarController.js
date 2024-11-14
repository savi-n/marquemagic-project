/**
 * UdyogAadhaarController
 *
 * @apiDescription :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    udyogAadhaarGetCaptcha: async (req, res) => {
        let uamNo = req.param('uamNo');
        if (!uamNo)
            return res.ok(sails.config.errRes.missingFields);



        const randomTwoUnique = Math.floor(Math.random() * (+ 9999 - + 1000)) + + 1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);

        await sails.helpers.clientRequestRecord('create', uniqueRandomId, req.client_id, 'initiate', "KYC", "UDYOG");

        const client = await sails.helpers.grpcConnection();
        const newNote = {
            uamNo
        };

        client.udyogAadhaarGetCaptcha(newNote, async (error, note) => {
            if (!error) {
                if (note.Status === 'unsuccess') {
                    await ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: "failed" });
                }
                note.Info = JSON.parse(note.Info);
                note.Info['requestId'] = uniqueRandomId;
                let statusCode = note.Info.Status_Code || 'NC200';
                return res.status(statusCode.slice(2)).send(note);
            } else {
                await ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: "failed" });
                return res.status(500).send({
                    Status: 'unsuccess',
                    Info: {
                        Status_Code: 'NC500',
                        Message: 'Something went wrong'
                    }
                });
            }
        });
    },

    udyogAadhaarSubmitCaptcha: async (req, res) => {
        let uamNo = req.param('uamNo'),
            captcha = req.param('captcha'),
            requestId = req.param("requestId");
        if (!uamNo || !captcha || !requestId)
            return res.ok(sails.config.errRes.missingFields);

        const client = await sails.helpers.grpcConnection();
        const newNote = {
            uamNo,
            captcha
        };

        client.udyogAadhaarSubmitCaptcha(newNote, async (error, note) => {
            if (!error) {
                try {
                    if (note.Status === 'success') {
                        await ClientRequest.update({ request_id: requestId }).set({ req_status: "completed" });
                        await RequestDocument.create({
                            request_id: requestId,
                            client_id: req.client_data.id,
                            request_type: 'KYC',
                            response: JSON.stringify(note)
                        });
                    } else {
                        await ClientRequest.update({ request_id: requestId }).set({ req_status: "failed" });
                    }
                    note.Info = JSON.parse(note.Info);
                    let statusCode = note.Info.Status_Code || 'NC200';
                    return res.status(statusCode.slice(2)).send(note);
                } catch (err) {
                    return res.status(500).send({
                        Status: 'unsuccess',
                        Info: {
                            Status_Code: 'NC500',
                            Message: 'Something went wrong'
                        }
                    });
                }
            } else {
                try {
                    await ClientRequest.update({ request_id: requestId }).set({ req_status: "failed" });
                } catch (err) { }
                return res.status(500).send({
                    Status: 'unsuccess',
                    Info: {
                        Status_Code: 'NC500',
                        Message: 'Something went wrong'
                    }
                });
            }
        });
    }
};
