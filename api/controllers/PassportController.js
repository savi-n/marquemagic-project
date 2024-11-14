/**
 * PassportController
 *
 * @apiDescription :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    trackPassportStaus: async (req, res) => {
        const client = await sails.helpers.grpcConnection();
        const newNote = {
            fileNumber: req.param('fileNo'),
            dob: req.param('dob') // (dd/mm/yyyy)
        };

        const randomTwoUnique = Math.floor(Math.random() * (+ 9999 - + 1000)) + + 1000;
        const uniqTimeStamp = Math.round(new Date().getTime());
        const uniqueRandomId = Number("" + uniqTimeStamp + randomTwoUnique);

        await sails.helpers.clientRequestRecord('create', uniqueRandomId, req.client_id, 'initiate', "KYC", "PASSPORT");

        client.trackPassportStatus(newNote, async (error, note) => {
            if (!error) {
                if (note.message === 'success') {
                    await ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: "completed" });
                } else {
                    await ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: "failed" });
                }
                note.info = JSON.parse(note.info);
                let statusCode = note.statusCode.slice(2);
                return res.status(statusCode).send(note);
            } else {
                await ClientRequest.update({ request_id: uniqueRandomId }).set({ req_status: "failed" });
                return res.status(500).send({ statusCode: 'NC500', message: 'Error', info: 'Something went wrong' });
            }
        });
    }
};
