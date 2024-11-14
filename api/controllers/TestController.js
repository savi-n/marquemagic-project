module.exports = {
    test: async function (req, res) {
        const data = await sails.helpers.generateFtrData(34635);
        return res.send(data);
    }

};

