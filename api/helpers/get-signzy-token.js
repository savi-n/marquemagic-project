module.exports = {


  friendlyName: 'Get signzy token',


  description: 'Get the signzy authorization token',


  inputs: {

  },


  exits: {

    success: {
      outputFriendlyName: 'Signzy token',
    },

  },


  fn: async function (inputs, exits) {
    const moment = require('moment');
    let token, ttl;

    const generateToken = async () => {
      let url = sails.config.signzy.loginUrl;
      let reqPayload = {
        username: sails.config.signzy.username,
        password: sails.config.signzy.password,
      };
      let resData = await sails.helpers.apiTrigger(
        url,
        JSON.stringify(reqPayload),
        { 'Content-Type': 'application/json' },
        'POST'
      );
      if (!(resData.status) || resData.status !== 'nok') {
        resData = JSON.parse(resData);
      } else {
        return res.send('some error occurred!');
      }
      ttl = resData.ttl, token = resData.id;
    };

    /* qurery the database */
    let details = await AuthToken.findOne({
      name: 'signzy',
      is_active: "active",
    });
    const now = await sails.helpers.dateTime();

    /* if row doesn't exist we go to else block and create a new record with a newly generated token */
    if (details && details.name) {
      let date = moment(details.vaild_till);
      const diff = moment(now, 'YYYY-MM-DD HH:mm:ss').diff(date, 'seconds');
      if (diff < 0) {
        token = details.token;
      } else {
        await generateToken();
        const valid_till = moment(now, 'YYYY-MM-DD HH:mm:ss').add(ttl, 'seconds').format('YYYY-MM-DD HH:mm:ss');
        await AuthToken.update({
          id: details.id,
        }).set({
          token,
          vaild_till: valid_till
        });
      }
    } else {
      await generateToken();
      const valid_till = moment(now, 'YYYY-MM-DD HH:mm:ss').add(ttl, 'seconds').format('YYYY-MM-DD HH:mm:ss');
      await AuthToken.create({
        name: 'signzy',
        is_active: 'active',
        token,
        vaild_till: valid_till
      });

    }
    
    return exits.success(token);

  }


};

