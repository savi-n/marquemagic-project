const nodemailer = require('nodemailer');
module.exports = {
    friendlyName: "sent email notification",
    inputs : {
        from : {
            type : 'string',
            required : true
        },
        to : {
            type : 'string',
            required : true
        },
        subject : {
            type : 'string',
            required : true
        },
        email_template : {
            type : 'string',
            required : true
        },
        cc: {
          type: "string",
          required: false,
        },
        bcc: {
          type: "string",
          required: false,
        },
    },
	exits: {
		success: {
			description: "All done."
		}
	},
   
    fn : async function(inputs, exits){
        let {from, to, subject, email_template, cc, bcc } = inputs;
        cc = "savitha.n@marquemagic.com";
            try {
                // Configure the SMTP transporter
                const transporter = nodemailer.createTransport({
                  host: "sandbox.smtp.mailtrap.io", //"live.smtp.mailtrap.io", //'live.smtp.mailtrap.io',
                  port: 587,
                  secure: false, // true for 465, false for other ports
                  auth: {
                    user: "8f5cd6b949fe27", //"api", //"smtp@mailtrap.io",
                    pass: "21a341599beb2e", // "d83495e4ece14e8f55259940db298fcf" // "3a80b1d0638226818270a8799c45a3c9",
                  },
                });
            
                // Email options
                const mailOptions = {
                  from, // "hello@demomailtrap.com", // Sender's email
                  to, // "savitha.n@marquemagic.com",                         // Recipient's email
                  subject, // : "TEST Email",                    // Email subject
                  html: email_template// text : email_template,                       // Email body (plain text)
                };
                if (cc) mailOptions.cc = cc;
                if (bcc) mailOptions.bcc = bcc;
            
                // Send the email
                const info = await transporter.sendMail(mailOptions);
            
                exits.success({
                status : 200,
                  message: 'Email sent successfully',
                  info: info.messageId,
                });
              } catch (error) {
                console.error('Error sending email:', error);
                exits.success({status : 500, error: 'Failed to send email', details: error.message });
              }
        }
}