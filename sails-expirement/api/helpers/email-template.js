

const userData = async(userid) => {
    const {email} = await UsersRd.findOne({id : userid}).select("email");
    return email;
} 
const dbDataFetch = async(loan_id, updateTableName) => {
    let data = {}, reference_id = "";
    const loanReqData = await LoanrequestRd.findOne({id : loan_id}).select(['loan_ref_id','loan_amount','business_id','loan_amount_um','createdUserId', 'assigned_uw', 'sales_id', 'application_ref', 'remarks', ]),
        businessData = await BusinessRd.findOne({id : loanReqData.business_id}).select(['businessname', 'userid']),
        loanBankMappingData = await LoanBankMappingRd.find({id : loan_id}).select(['bank_emp_id','offer_amnt','offer_amnt_um', 'term', 'interest_rate', 'emi', 'processing_fee', 'expected_time_to_disburse', 'offer_validity' ]) || [],
        usersData = await UsersRd.findOne({id : businessData.userid}).select(['email', 'user_reference_pwd', 'name']);
    if (updateTableName){
      if (updateTableName === "loanrequest") reference_id = loanReqData.id;
      if (updateTableName === "users") reference_id = usersData.id;
      if (updateTableName === "loan_bank_mapping") reference_id = loanBankMappingData.id;
      if (updateTableName === "business") reference_id = businessData.id;
    } 
        data = {...loanReqData, ...businessData, ...loanBankMappingData[0], ...usersData, loanId :loanReqData.id, loan_bank_mapping_id : loanBankMappingData[0] ? loanBankMappingData[0].id : "" , reference_id };
        return data;
}

  const fetchDataAndMapTemplate = async (input, loan_id, updateTableName) => {
    try {
      const dataFormat = JSON.parse(input.data_format),
      ccMaskingData = JSON.parse(input.cc_masking),
      toMaskingData = JSON.parse(input.to_masking);
      const fetchedData = await dbDataFetch(loan_id, updateTableName); 

      // Replace placeholders in template
      let renderedTemplate = input.template, cc, to, reference, reference_id;
      for (const [placeholder, dbField] of Object.entries(dataFormat)) {
        const value = fetchedData[dbField] || "";
        renderedTemplate = renderedTemplate.replace(new RegExp(placeholder, "g"), value);
      }
  
      // Replace placeholders in subject
      let renderedSubject = input.subject;
      for (const [placeholder, dbField] of Object.entries(dataFormat)) {
        const value = fetchedData[dbField] || "";
        renderedSubject = renderedSubject.replace(new RegExp(placeholder, "g"), value);
      }
      if (toMaskingData){
            let to_userid;
            if (Object.values(toMaskingData).includes("userid"))  to_userid = fetchedData.userid;
            if (Object.values(toMaskingData).includes("assigned_uw")) to_userid = fetchedData.assigned_uw;
            if (Object.values(toMaskingData).includes("bank_emp_id")) to_userid = fetchedData.bank_emp_id;
            if (Object.values(toMaskingData).includes("createdUserId")) to_userid = fetchedData.createdUserId;  
        to = await userData(to_userid);
      }
      if (ccMaskingData){
            let cc_userid;
            if (Object.values(ccMaskingData).includes("userid")) cc_userid = fetchedData.userid;
            if (Object.values(ccMaskingData).includes("assigned_uw")) cc_userid = fetchedData.assigned_uw;
            if (Object.values(ccMaskingData).includes("bank_emp_id")) cc_userid = fetchedData.bank_emp_id;
            if (Object.values(ccMaskingData).includes("createdUserId")) cc_userid = fetchedData.createdUserId;               
        cc = await userData(cc_userid);
      } 
     
      return {
        from : "savitha.n@marquemagic.com", // "hello@demomailtrap.com",
        subject: renderedSubject,
        email_template: renderedTemplate,
        to: to,
        cc: cc || "",
        bcc: input.bcc || "",
        reference_id : fetchedData.reference_id
      };
    } catch (err) {
      console.error("Error:", err);
      throw err;
    }
  }
  const updateDB = async (tableName, ref_id) => {
    if (tableName === "loanrequest") await Loanrequest.updateOne({id : ref_id}).set({notification : 1});
    if (tableName === "users") await Users.updateOne({id : ref_id}).set({notification_flag : "yes"});
    if (tableName === "loan_bank_mapping") await LoanBankMapping.updateOne({id : ref_id}).set({notification_status : "No"});
    if (tableName === "business") await Business.updateOne({id : ref_id}).set({notification_v: 0 })
  }
  

module.exports = {
    inputs : {
        status_name : {
            type : "string",
            required : true
        },
        white_label_id : {
            type : "number",
            required : true
        },
        loan_id : {
            type : "number",
            required : true
        }
    },
    exits: {
        success: {
          description: 'All done.',
        }
      },
      fn : async function(inputs, exits){
        const {status_name, white_label_id, loan_id} = inputs,
        notificationData = await NotificationTriggerRd.findOne({name : status_name}),
         mailTamplateData = await MailTemplateRd.find({name : status_name, white_label_id}).select(["subject", "template", "cc", "to" , "to_masking", "cc_masking", "bcc", "data_format" ]),
        tamplateData = await fetchDataAndMapTemplate(mailTamplateData[0], loan_id, notificationData.toupdate),
        sendMail = await sails.helpers.sendMail(tamplateData.from, tamplateData.to, tamplateData.subject, tamplateData.email_template, tamplateData.cc, tamplateData.bcc);
        await updateDB(notificationData.toupdate, tamplateData.reference_id);
        insertDataToDb = await EmailMaping.create({
            email_address : tamplateData.to,
            email_subject : tamplateData.subject,
            cc_list : tamplateData.cc,
            bcc_list : tamplateData.bcc,
            email_message : tamplateData.email_template,
            email_status : "1",
            email_send_time : await sails.helpers.dateTime(),
            reference : notificationData.toupdate,
            reference_id : tamplateData.reference_id
        });
        
        return exits.success({tamplateData, sendMail});
      }
    
}