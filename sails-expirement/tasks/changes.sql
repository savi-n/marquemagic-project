ALTER TABLE `users` ADD COLUMN `work_type` VARCHAR(45) NULL DEFAULT NULL AFTER `otp`;

CREATE TABLE `work_type` (
  `id` int(11) NOT NULL,
  `name` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `work_type`
--

INSERT INTO `work_type` (`id`, `name`) VALUES
(1, 'Accounting'),
(2, 'Auditing'),
(3, 'GST Filing'),
(4, 'IT Returns for'),
(5, 'Real Estate Brokering'),
(6, 'Loan Sales Agency');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `work_type`
--
ALTER TABLE `work_type`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `work_type`
--
ALTER TABLE `work_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7

--
-- ADDED TWO COLUMN IN USER TABLE
--
ALTER TABLE `users`
ADD COLUMN `profile_completion` INT(11) NULL DEFAULT NULL AFTER `work_type`,
ADD COLUMN `pic` VARCHAR(100) NULL DEFAULT NULL AFTER `profile_completion`;

--
-- CHANGES THE DATATYPE OF loan_sanction->loan_bank_map_id
--
ALTER TABLE `loan_sanction`
CHANGE COLUMN `loan_bank_map_id` `loan_bank_map_id` BIGINT(11) NOT NULL ;
--
-- set default 0 profile completeres
--
ALTER TABLE `users`
CHANGE COLUMN `profile_completion` `profile_completion` INT(11) NOT NULL DEFAULT 0;

--
-- CHANGES THE DATATYPE of pic column in user table
--
ALTER TABLE `users`
CHANGE COLUMN `pic` `pic` LONGTEXT NULL DEFAULT NULL ;

ALTER TABLE `white_label_solution` ADD `color_theme_react` JSON NULL DEFAULT NULL AFTER `payment_extract_email`;
--
-- ADDED NEW COLUMN IN USERBANK TABLE
--
ALTER TABLE `user_bank`
ADD COLUMN `document_url` TEXT NULL DEFAULT NULL AFTER `is_ca_account`;

ALTER TABLE `loan_products` ADD `create_json` LONGTEXT NULL AFTER `business_type_id`;
ALTER TABLE `loan_products` ADD `edit_json` LONGTEXT NULL AFTER `business_type_id`;
ALTER TABLE `loan_products` ADD `view_json` LONGTEXT NULL AFTER `business_type_id`;

ALTER TABLE `loanrequest` ADD `document_upload` ENUM('Done','Pending') NULL DEFAULT NULL AFTER `application_ref`;

CREATE
    ALGORITHM = UNDEFINED
    DEFINER = `root`@`localhost`
    SQL SECURITY DEFINER
VIEW `view_loan` AS
    SELECT
        `l`.`loanId` AS `loanId`,
        `l`.`loan_ref_id` AS `loan_ref_id`,
        `l`.`loan_amount` AS `loan_amount`,
        `b`.`gstin` AS `gstin`,
        `l`.`loan_amount_um` AS `loan_amount_um`,
        `l`.`applied_tenure` AS `applied_tenure`,
        `l`.`loan_request_type` AS `loan_request_type`,
        `l`.`assets_value` AS `assets_value`,
        `l`.`assets_value_um` AS `assets_value_um`,
        `l`.`annual_revenue` AS `annual_revenue`,
        `l`.`revenue_um` AS `revenue_um`,
        `l`.`annual_op_expense` AS `annual_op_expense`,
        `l`.`op_expense_um` AS `op_expense_um`,
        `l`.`cur_monthly_emi` AS `cur_monthly_emi`,
        `l`.`loan_asset_type_id` AS `loan_asset_type_id`,
        `l`.`loan_usage_type_id` AS `loan_usage_type_id`,
        `l`.`loan_type_id` AS `loan_type_id`,
        `l`.`loan_rating_id` AS `loan_rating_id`,
        `l`.`loan_status_id` AS `loan_status_id`,
        `l`.`loan_sub_status_id` AS `loan_sub_status_id`,
        `l`.`assigned_uw` AS `assigned_uw`,
        `l`.`assigned_date` AS `assigned_date`,
        `l`.`loan_summary` AS `loan_summary`,
        `l`.`modified_on` AS `modified_on`,
        `l`.`RequestDate` AS `RequestDate`,
        `l`.`loan_product_id` AS `loan_product_id`,
        `l`.`white_label_id` AS `white_label_id`,
        MIN(`lbm`.`loan_bank_mapping_id`) AS `loan_bank_mapping_id`,
        `lbm`.`loan_id` AS `loan_id`,
        MIN(`lbm`.`business_id`) AS `business_id`,
        MIN(`lbm`.`bank_id`) AS `bank_id`,
        MIN(`lbm`.`bank_emp_id`) AS `bank_emp_id`,
        MIN(`lbm`.`loan_bank_status`) AS `loan_bank_status`,
        MIN(`lbm`.`loan_borrower_status`) AS `loan_borrower_status`,
        MIN(`lbm`.`offer_amnt`) AS `offer_amnt`,
        MIN(`lbm`.`offer_amnt_um`) AS `offer_amnt_um`,
        MIN(`lbm`.`interest_rate`) AS `interest_rate`,
        MIN(`lbm`.`term`) AS `term`,
        MIN(`lbm`.`emi`) AS `emi`,
        MIN(`lbm`.`processing_fee`) AS `processing_fee`,
        MIN(`lbm`.`expected_time_to_disburse`) AS `expected_time_to_disburse`,
        MIN(`lbm`.`offer_validity`) AS `offer_validity`,
        MIN(`lbm`.`remarks`) AS `remarks`,
        MIN(`lbm`.`bank_assign_date`) AS `bank_assign_date`,
        MIN(`lbm`.`lender_offer_date`) AS `lender_offer_date`,
        MIN(`lbm`.`borrower_acceptence_date`) AS `borrower_acceptence_date`,
        MIN(`lbm`.`meeting_flag`) AS `meeting_flag`,
        MIN(`lbm`.`upload_doc`) AS `upload_doc`,
        MIN(`lbm`.`ints`) AS `ints`,
        MIN(`lbm`.`upts`) AS `upts`,
        MIN(`lbm`.`lender_status_id`) AS `lender_status_id`,
        `b`.`businessid` AS `businessid`,
        `b`.`businessname` AS `businessname`,
        `b`.`userid` AS `userid`,
        `b`.`first_name` AS `first_name`,
        `b`.`last_name` AS `last_name`,
        `b`.`business_email` AS `business_email`,
        `b`.`contactno` AS `contactno`,
        `b`.`businesstype` AS `businesstype`,
        `b`.`businessindustry` AS `businessindustry`,
        `b`.`businessstartdate` AS `businessstartdate`,
        `b`.`businesspancardnumber` AS `businesspancardnumber`,
        `b`.`corporateid` AS `corporateid`,
        `b`.`percentage_business_supplier` AS `percentage_business_supplier`,
        `b`.`percentage_business` AS `percentage_business`,
        `b`.`empcount` AS `empcount`,
        `b`.`noofdirectors` AS `noofdirectors`,
        `b`.`about_business` AS `about_business`,
        `b`.`status` AS `status`,
        `u`.`email` AS `us_email`,
        `u`.`usertype` AS `us_usertype`,
        `u`.`assigned_sales_user` AS `us_assigned_sales_user`,
        `u`.`parent_id` AS `us_parent_id`,
        `u`.`lender_id` AS `us_lender_id`,
        MIN(`bnk`.`bankid`) AS `bankid`,
        MIN(`bnk`.`bankname`) AS `bankname`,
        MIN(`bnk`.`isLender`) AS `isLender`,
        MIN(`bnk`.`type`) AS `type`,
        MIN(`bnk`.`category`) AS `category`,
        `l`.`loan_orginitaor` AS `loan_orginator`,
        `l`.`sales_id` AS `sales_id`,
        MIN(`lbm`.`upts`) AS `lbmupts`,
        `l`.`doc_collector` AS `doc_collector`,
        `l`.`unsecured_type` AS `unsecured_type`,
        `l`.`application_ref` AS `application_ref`,
        `b`.`encrypted_data` AS `b_encrypted_data`,
        `l`.`document_upload` AS `DocUploadStatus`
    FROM
        ((((`loanrequest` `l`
        JOIN `loan_bank_mapping` `lbm`)
        JOIN `business` `b`)
        JOIN `users` `u`)
        JOIN `bank_master` `bnk`)
    WHERE
        ((`l`.`loanId` = `lbm`.`loan_id`)
            AND (`l`.`business_id` = `b`.`businessid`)
            AND (`u`.`userid` = `b`.`userid`)
            AND (`lbm`.`bank_id` = `bnk`.`bankid`))
    GROUP BY loanId
    ORDER BY `lbm`.`upts` DESC , `l`.`loanId` DESC , `l`.`modified_on` DESC

    ALTER TABLE `nc_status_manage` ADD `caption` TEXT NULL DEFAULT NULL AFTER `exclude_user_ncdoc`;

    ALTER TABLE `route_track` CHANGE `mode` `mode` INT(11) NOT NULL DEFAULT '0' COMMENT '0-web 1- Mob 2-SailsJS';

  -- route track insert query
  INSERT INTO `route_track` (`route_name`, `mode`) VALUES ('login', '2'),
  ('check', '2'),
  ('loanbankmappingdetails','2'),
  ('loanAcceptReject','2'),
  ('lenderdoc-upload', '2'),
  ('loandisbursement/update','2'),
  ('Loanrequest','2'),
  ('loansanction/update','2'),
  ('loansanction','2'),
  ('loanproducts','2'),
  ('borrowerdoc-upload','2'),
  ('loan/createloan','2'),
  ('documentDelete','2'),
  ('loanDocEdit','2'),
  ('loanproducttype','2'),
  ('resetPassword', '2'),
  ('loanDocumentUpload', '2'),
  ('viewDocument','2'),
  ('userbank','2'),
  ('userbank/update','2'),
  ('profile','2'),
  ('userprofile/upload','2'),
  ('userprofile/update', '2'),
  ('whiteLabelPermission','2'),
  ('invoice/paymentInitiate','2'),
  ('addSanction','2'),
  ('viewloanlisting','2'),
  ('dashboard/loanlist','2'),
  ('dashboard' , '2'),
  ('pincode','2'),
  ('invoice/initiate-list','2'),
  ('invoice/pending-list' , '2'),
  ('invoice/paid-list','2'),
  ('invoice/list','2'),
  ('loan/invoiced','2'),
  ('invoice','2'),
  ('invoice/status','2'),
  ('lender/doctype','2'),
  ('loan/documentTypes','2'),
  ('loan/edit', '2'),
  ('user', '2'),
  ('WhiteLabelSolution?id','2'),
  ('loanDocCreate', '2'),
  ( 'add_Disbursement', '2'),
  ('meetingSchedule', '2'),
  ('acceptMeeting' '2')



-----------------------------------------
---ADDED COLUMN pancard_url in Business TABLE
ALTER TABLE `business`
ADD COLUMN `pancard_url` LONGTEXT NULL DEFAULT NULL AFTER `encrypted_data`;

---ADDED COLUMN logo_url in BankMaster Table
ALTER TABLE `bank_master` ADD `logo_url` LONGTEXT NULL DEFAULT NULL AFTER `white_label_id`;

--CHANGE User_refernce_pwd in user table to default NULL
ALTER TABLE `users` CHANGE `user_reference_pwd` `user_reference_pwd` VARCHAR(200) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

INSERT INTO `route_track` (`id_route`, `route_name`, `mode`) VALUES (NULL, 'lenderStatus', '2');

---ADDEED COLUMN loan_origin in loanrequest table
ALTER TABLE `loanrequest` ADD `loan_origin` VARCHAR(255) NULL DEFAULT NULL AFTER `document_upload`;
ALTER TABLE `namastecredit`.`loanrequest`
CHANGE COLUMN `loan_origin` `loan_origin` VARCHAR(255) NULL DEFAULT 'namaste_portal' ;

-- CREATE loan_process TABLE
Create table 'loan_process' ('id' bigint(20) NOT NULL auto_increment,'user_id' bigint(20),'loan_id' bigint(20),'bid' bigint(20),
'number_of_loan_reject' int(11),'number_of_EMI_bounce_6mon' int(11),'number_of_unsercured_loan' int(11),
'permission_to_check_GST' enum('1','0')DEFAULT '0','permission_to_check_CIBIL' enum('1','0')DEFAULT '0',
'createdby' bigint(20),'createdOn' datetime,'modifiedby' bigint(20),'modifiedOn' datetime,PRIMARY KEY(id));

-- ALTER names for loan_process table
ALTER TABLE `loan_process` CHANGE `number_of_loan_reject` `loanReject_count` INT(11) NULL DEFAULT NULL;
ALTER TABLE `loan_process` CHANGE `number_of_unsercured_loan` `unsecuredLoan_count` INT(11) NULL DEFAULT NULL;
ALTER TABLE `loan_process` CHANGE `number_of_EMI_bounce_6mon` `emiBounce_count` INT(11) NULL DEFAULT NULL;
ALTER TABLE `loan_process` CHANGE `permission_to_check_GST` `GST_check` ENUM('1','0') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT '0';
ALTER TABLE `loan_process` CHANGE `permission_to_check_CIBIL` `CIBIL_check` ENUM('1','0') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT '0';
ALTER TABLE `loan_process` CHANGE `modifiedOn` `modified_on` DATETIME NULL DEFAULT NULL;
ALTER TABLE `loan_process` CHANGE `createdOn` `created_on` DATETIME NULL DEFAULT NULL;
ALTER TABLE `loan_process` CHANGE `createdby` `createdUserId` BIGINT(20) NULL DEFAULT NULL;
ALTER TABLE `loan_process` CHANGE `modifiedby` `modifiedUserId` BIGINT(20) NULL DEFAULT NULL;

-- ADDED COLUMN type in BankRemarks Table
ALTER TABLE `bank_remarks` ADD `type` ENUM('Bank','ITR') NOT NULL DEFAULT 'Bank' AFTER `remark_type`;

-- ADDED COLUMN ITR_name and filling_date in business Table
ALTER TABLE `business` ADD `ITR_name` VARCHAR(255) NULL AFTER `pancard_url`, ADD `filling_date` DATETIME NULL AFTER `ITR_name`;

--create itr_details TABLE
CREATE TABLE `itr_details` ( `id` INT NOT NULL AUTO_INCREMENT , `doc_id` INT NOT NULL , `uw_remarks_id` INT NOT NULL , `created_By` INT NOT NULL , `created_On` DATETIME NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

---create channel_rating TABLE  26-12-2019
CREATE TABLE `channel_rating` ( `id` INT NOT NULL AUTO_INCREMENT , `channel_id` INT NOT NULL , `channel_rating` VARCHAR(255) NOT NULL ,
`application_count` INT NOT NULL DEFAULT '0' , `application_points` FLOAT NOT NULL DEFAULT '0' , `lender_assign_count` INT NOT NULL DEFAULT '0' ,
`lender_assign_points` FLOAT NOT NULL DEFAULT '0' , `disbursed_count` INT NOT NULL DEFAULT '0' , `disbursed_points` FLOAT NOT NULL DEFAULT '0' ,
`application_amount` FLOAT NULL , `application_disbursed_amount` FLOAT NULL , `rating_type` INT NOT NULL , `total_llc_confirmed` INT NOT NULL ,
`created_On` DATETIME NOT NULL , `updated_On` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , PRIMARY KEY (`id`)) ENGINE = InnoDB;

--create channel_rating_reference TABLE
CREATE TABLE `channel_rating_reference` ( `id` INT NOT NULL AUTO_INCREMENT , `min_value` INT NOT NULL , `max_value` INT NOT NULL , `rating_type` VARCHAR(255) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

---create channel_rating_points TABLE
CREATE TABLE `channel_rating_points` ( `id` INT NOT NULL AUTO_INCREMENT , `channel_status` VARCHAR(255) NOT NULL , `points_value` LONGTEXT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

---ADDED COLUMN channel_status in activitys Table
ALTER TABLE `activitys` ADD `channel_status` ENUM('0','1') NOT NULL DEFAULT '0' COMMENT '0: incomplete, 1:complete' AFTER `status`;

----ADDED COLUMN cibil_remarks in director table
ALTER TABLE `director` ADD `cibil_remarks` VARCHAR(255) NULL DEFAULT NULL AFTER `encrypted_data`;

----Rename to the itr_details table 16-01-2020
RENAME TABLE `itr_details` TO `itr_remarks`;

----create business_entity_financial table
CREATE TABLE `business_entity_financial` ( `id` INT NOT NULL AUTO_INCREMENT , `entity_id` INT NOT NULL , `entity_type` ENUM("Business", "Director") NULL , `annual_pat` FLOAT NULL , `annual_turnover` FLOAT NULL , `financial_year` DATE NOT NULL , `filling_date` DATE NOT NULL , `original_revised` ENUM("original","revised") NOT NULL DEFAULT 'original' ,`created_On` DATETIME NOT NULL DEFAULT `CURRENT_TIMESTAMP`, PRIMARY KEY (`id`)) ENGINE = InnoDB;

----ADDED COLUMN lender_assign_amountin channel_rating TABLE  29-01-2020
ALTER TABLE `channel_rating` ADD `lender_assign_amount` FLOAT NULL AFTER `application_amount`;

------ADDED COLUMN disbursed_volume_points in channel_rating TABLE  03-02-2020
ALTER TABLE `channel_rating` ADD `disbursed_volume_points` FLOAT NOT NULL DEFAULT '0' AFTER `application_disbursed_amount`;

------ADDED COLUMN encryption_flag in white_label_solution TABLE  04-03-2020
ALTER TABLE `white_label_solution` ADD `encryption_flag` ENUM('yes','no') NULL DEFAULT 'no' AFTER `new_ui_usertype`;

--------ADDED COLUMN
ALTER TABLE `business_mapping` ADD `updated_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_time`;

----------------ADDED COLUMN
ALTER TABLE `namastecredit`.`leads`
ADD COLUMN `panNo` VARCHAR(10) NULL DEFAULT NULL AFTER `userid`,
ADD COLUMN `equifax_json` LONGTEXT NULL DEFAULT NULL AFTER `panNo`;

------------ADDED COLUMN
ALTER TABLE `namastecredit`.`leads`
ADD COLUMN `onboarding_count` INT(10) NOT NULL DEFAULT 0 AFTER `equifax_json`;
ADD COLUMN `equifax_score` INT(10) NOT NULL DEFAULT 0 AFTER `onboarding_count`;
ADD COLUMN `branch_id` INT(10) NOT NULL DEFAULT 0 AFTER `equifax_score`;

--------------ADDED COLUMN TO LENDER DOCUMENT TABLE --------------------
ALTER TABLE `namastecredit`.`lender_document`
ADD COLUMN `uploaded_by` INT NOT NULL DEFAULT 0 AFTER `upload_method_type`;


--------------ADDED COLUMN TO ELIGIBLITY ANALYTICS TABLE -----------------
ALTER TABLE `namastecredit`.`eligiblity_analytics`
ADD COLUMN `type` ENUM('User', 'Leads') NOT NULL DEFAULT 'User' AFTER `dscr`;
