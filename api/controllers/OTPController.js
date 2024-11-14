/**
 * OTPController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    sendOTP: async function(req, res){

        try {
            const {mobile, os, device_id} = req.allParams();

            const data = {
                mobile, os, device_id
            };
                
            const url = "http://18.136.14.70/user/sendotp",
            body = JSON.stringify(data),
            headers = {"Content-Type": "application/json"},
            method = "POST"
        
            const otpResponse = await sails.helpers.apiTrigger(url, body, headers, method);
            console.log(otpResponse);
            return res.send({
                status: 200,
                message: otpResponse
            });
       
        } catch (error) {
            return res.send({
                status: 400,
                message: error
            });
        }

    },

    verifyOTP: async function(req, res){
        
        try {
            const {mobile, os, device_id, fcm_id, otp} = req.allParams();

            const data = {
                mobile, os, device_id, fcm_id, otp
            };
                
            const url = "http://18.136.14.70/user/verifyotp",
            body = JSON.stringify(data),
            headers = {"Content-Type": "application/json"},
            method = "POST"
        
            const otpResponse = await sails.helpers.apiTrigger(url, body, headers, method);
            console.log(otpResponse);
            return res.send({
                status: 200,
                message: otpResponse
            });
       
        } catch (error) {
            return res.send({
                status: 400,
                message: error
            });
        }



    }

};

