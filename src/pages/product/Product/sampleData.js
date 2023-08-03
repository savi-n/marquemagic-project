const data = {
	status: 'ok',
	data: {
		name: 'Medium Report',
		description: '',
		url: 'https://testbank-nc.s3.ap-southeast-1.amazonaws.com/config/LAP-1.png',
		id: 40,
		product_id: {
			'3': 174,
			'4': 174,
			'5': 174,
		},
		product_details: {
			head: 'NC offers LAP Loan in a <span>speedy manner</span>',
			loanType: 'LAP Loan',
			productDetailsImage:
				'https://cubuat.s3.ap-south-1.amazonaws.com/CUB-Images/220-SM859421.jpg',
			applicationSubmittedImage:
				'https://cubuat.s3.ap-south-1.amazonaws.com/CUB-Images/220-SM859421.jpg',
			terms_and_conditions_url:
				'https://testbank-nc.s3.ap-southeast-1.amazonaws.com/condition/Amended_tc_without-Signature.pdf',
			kyc_verification: true,
			otp_authentication: false,
			is_coapplicant_mandatory: false,
			li: [
				'NC offers LAP loans to individuals(Self Employed)',
				'Eligibility : 10 months net take home pay (maximum)/50% of the annual turnover declared in the lastest ITR ',
				'Loan amount : maximum of Rs. 1.5 Lakhs',
				'Margin : 10%',
				'Repayment tenor : 36 to 60 Months',
				'<a href=link>Click here</a> for Interest rate and required documents',
				'<a href=link>Click here</a> for Schemes',
				'<a href=link>Click here</a> for Processing Charges',
				'<a href=link>EMI Calculator</a>',
			],
			sections: [
				{
					id: 'business_details',
					name: 'Entity Details',
					sub_sections: [
						{
							id: 'business_details',
							name: 'Help us with Entity Details',
							fields: [
								{
									name: 'pan_upload',
									label: 'Upload your PAN Card',
									type: 'file',
									db_key: 'loan_document',
									req_type: 'pan',
									visibility: true,
									value: 'pan',
									process_type: 'extraction',
									min: 1,
									max: 1,
									rules: {
										required: true,
										supported_formats: ['*'],
									},
									doc_type: {
										'1': 4,
										'2': 4,
										'3': 4,
										'4': 4,
										'5': 4,
										'6': 4,
										'8': 4,
										'9': 4,
										'10': 4,
										'11': 4,
									},
								},
								{
									name: 'pan_number',
									placeholder: 'PAN of the Entity',
									db_key: 'businesspancardnumber',
									rules: {
										required: true,
										length: 10,
									},
									mask: {
										character_limit: 10,
										alpha_numeric_only: true,
									},
									type: 'text',
									disabled: true,
									visibility: true,
									sub_fields: [
										{
											name: 'Fetch',
											db_key: 'fetch',
											visibility: true,
											placeholder: 'Fetch',
											type: 'button',
											rules: {},
											isbuttonfilled: false,
										},
									],
								},
								{
									name: 'business_name',
									placeholder: 'Entity Name',
									db_key: 'businessname',
									rules: {
										required: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'business_type',
									placeholder: 'Segment / Sector Type',
									db_key: 'businesstype',
									rules: {
										required: true,
									},
									type: 'select',
									visibility: true,
									options: [
										{
											value: 4,
											name: 'Private Limited',
										},
										{
											value: 5,
											name: 'Public Limited',
										},
										{
											value: 3,
											name: 'LLP',
										},
										{
											value: 9,
											name: 'Trust',
										},
										{
											value: 10,
											name: 'Society',
										},
										{
											value: 1,
											name: 'Sole Proprietorship',
										},
										{
											value: 2,
											name: 'Partnership',
										},
										{
											value: 11,
											name: 'Associations',
										},
										{
											value: 6,
											name: 'Others',
										},
									],
								},
								{
									name: 'business_vintage',
									placeholder: 'Date of Incorporation',
									db_key: 'businessstartdate',
									rules: {
										required: true,
									},
									type: 'date',
									visibility: true,
								},
								{
									name: 'gstin',
									placeholder: 'GSTIN',
									db_key: 'gstin',
									rules: {},
									mask: {
										alpha_numeric_only: true,
										length: 15,
									},
									type: 'text',
									visibility: true,
									default_value: '',
								},
								{
									name: 'pat',
									placeholder: 'PAT e.g.,100000',
									db_key: 'annual_op_expense',
									rules: {
										required: true,
									},
									mask: {
										number_only: true,
										character_limit: 12,
									},
									type: 'number',
									visibility: false,
									inrupees: true,
								},
								{
									name: 'annual_turnover',
									placeholder: 'Annual Turnover e.g.,100000',
									type: 'text',
									db_key: 'annual_revenue',
									rules: {
										required: true,
									},
									mask: {
										number_only: true,
										character_limit: 12,
									},
									visibility: false,
									inrupees: true,
								},
								{
									name: 'business_mobile_no',
									placeholder: 'Telephone Number',
									db_key: 'contact',
									rules: {
										required: true,
										length: 10,
									},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'email',
									placeholder: 'Email ID',
									rules: {
										empty_or_email: true,
									},
									db_key: 'business_email',
									type: 'text',
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
									},
									visibility: true,
								},
								{
									name: 'udyam_number',
									placeholder: 'Udyam Number',
									db_key: 'udyam_number',
									rules: {},
									mask: {
										alpha_numeric_only: true,
									},
									type: 'text',
									disabled: true,
									visibility: false,
									default_value: '',
								},
							],
						},
						{
							id: 'contact_person_details',
							name: 'Help us with Contact Person Details',
							fields: [
								{
									name: 'first_name',
									placeholder: 'Entity Contact Person',
									db_key: 'name',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
									sub_fields: [
										{
											name: 'title',
											is_co_applicant: false,
											placeholder: 'Title',
											is_prefix: true,
											db_key: 'title',
											type: 'select',
											rules: {
												required: true,
											},
											options: [
												{
													value: 'Miss',
													name: 'Miss',
												},
												{
													value: 'Mrs',
													name: 'Mrs',
												},
												{
													value: 'Ms',
													name: 'Ms',
												},
												{
													value: 'Mr',
													name: 'Mr',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
									],
								},
								{
									name: 'last_name',
									placeholder: 'Contact Person Last Name',
									db_key: 'last_name',
									rules: {},
									mask: {
										alpha_char_only: true,
									},
									pre_data_disable: false,
									type: 'text',
									protected: false,
									visibility: false,
									default_value: '',
								},
								{
									name: 'contact_email',
									placeholder: 'Entity email',
									rules: {
										empty_or_email: true,
									},
									db_key: 'email',
									type: 'text',
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
									},
									visibility: true,
								},
								{
									name: 'mobile_no',
									placeholder:
										'Contact Person Valid Mobile Number to Recieve OTP',
									db_key: 'contactno',
									rules: {
										required: true,
										length: 10,
									},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: false,
								},
							],
						},
					],
				},
				{
					name: 'Business Address Details',
					id: 'business_address_details',
					sub_sections: [
						{
							id: 'business_address_details',
							name: 'Help us with your Entity Address Details',
							fields: [
								{
									name: 'select_gstin',
									placeholder: 'Select GSTIN',
									rules: {},
									db_key: 'gstin',
									mask: {},
									type: 'select',
									options: [],
									visibility: true,
								},
								{
									name: 'address1',
									placeholder: 'Address Line 1',
									rules: {
										required: true,
									},
									db_key: 'line1',
									type: 'text',
									visibility: true,
								},
								{
									name: 'address2',
									placeholder: 'Address Line 2',
									type: 'text',
									db_key: 'line2',
									visibility: true,
								},
								{
									name: 'address3',
									placeholder: 'Address Line 3',
									db_key: 'locality',
									type: 'text',
									visibility: true,
								},
								{
									name: 'pin_code',
									placeholder: 'Pin Code',
									rules: {
										required: true,
										length: 6,
									},
									db_key: 'pincode',
									mask: {
										number_only: true,
										character_limit: 6,
									},
									make_api_call: 6,
									type: 'pincode',
									value_for_fields: [['city', 'district'], ['state', 'state']],
									visibility: true,
								},
								{
									name: 'city',
									placeholder: 'City',
									db_key: 'city',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'state',
									placeholder: 'State',
									db_key: 'state',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
							],
						},
					],
				},
				{
					id: 'basic_details',
					is_applicant: true,
					name: 'Basic Details',
					sub_sections: [
						{
							id: 'basic_details',
							name: 'Help us with Basic Details',
							fields: [
								{
									name: 'existing_customer',
									placeholder: 'Existing Customer',
									db_key: 'existing_customer',
									rules: {
										required: false,
									},
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Yes',
											name: 'Yes',
										},
										{
											value: 'No',
											name: 'No',
										},
									],
								},
								{
									name: 'profile_upload',
									label: 'Upload your Profile',
									type: 'file',
									db_key: 'customer_picture',
									is_delete_not_allowed: false,
									visibility: true,
									doc_type: {
										'0': 315,
										'1': 315,
										'7': 315,
									},
									min: 1,
									max: 1,
									geo_tagging: true,
									rules: {
										supported_formats: ['*'],
									},
								},
								{
									name: 'customer_id',
									placeholder: 'Customer ID',
									is_co_applicant: false,
									db_key: 'customer_id',
									pre_data_disable: false,
									for_type: ['Yes'],
									for_type_name: 'existing_customer',
									rules: {},
									is_masked: false,
									user_types_allowed: "['Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 10,
										alpha_numeric_only: true,
									},
									type: 'text',
									protected: false,
									visibility: true,
									sub_field_disabled: [
										{
											name: 'fetch',
											is_co_applicant: false,
											placeholder: 'Fetch',
											type: 'button',
											rules: {},
											isbuttonfilled: false,
										},
										{
											name: 'fetch',
											is_applicant: false,
											placeholder: 'Fetch',
											is_prefix: false,
											type: 'button',
											rules: {},
											isbuttonfilled: false,
										},
									],
								},
								{
									name: 'customer_id',
									placeholder: 'Customer ID',
									is_applicant: false,
									db_key: 'customer_id',
									pre_data_disable: false,
									for_type: ['Yes'],
									for_type_name: 'existing_customer',
									rules: {},
									is_masked: false,
									user_types_allowed: "['Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 10,
										alpha_numeric_only: true,
									},
									type: 'text',
									protected: false,
									visibility: true,
								},
								{
									name: 'pan_upload',
									label: 'Upload your PAN Card',
									is_co_applicant: false,
									type: 'file',
									db_key: 'loan_document',
									req_type: 'pan',
									visibility: true,
									value: 'pan',
									process_type: 'extraction',
									min: 1,
									max: 1,
									rules: {
										required: false,
										supported_formats: ['*'],
									},
									doc_type: {
										'1': 8,
										'7': 31,
									},
								},
								{
									name: 'pan_number',
									placeholder: 'PAN Number',
									fetch_data: true,
									is_co_applicant: false,
									db_key: 'businesspancardnumber',
									pre_data_disable: false,
									rules: {
										required: true,
										length: 10,
										pan_number: true,
									},
									is_masked: true,
									user_types_allowed: "['Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 10,
										alpha_numeric_only: true,
									},
									type: 'text',
									protected: true,
									visibility: true,
								},
								{
									name: 'pan_upload',
									is_applicant: false,
									label: 'Upload your PAN Card',
									type: 'file',
									db_key: 'loan_document',
									req_type: 'pan',
									visibility: true,
									value: 'pan',
									process_type: 'extraction',
									min: 1,
									max: 1,
									rules: {
										supported_formats: ['*'],
									},
									doc_type: {
										'0': 31,
										'1': 8,
										'7': 31,
									},
								},
								{
									name: 'pan_number',
									placeholder: 'PAN Number',
									is_applicant: false,
									db_key: 'dpancard',
									pre_data_disable: false,
									rules: {
										length: 10,
										pan_number: true,
										required: false,
									},
									is_masked: true,
									user_types_allowed: "['Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 10,
										alpha_numeric_only: true,
									},
									protected: false,
									type: 'text',
									visibility: true,
								},
								{
									name: 'ckyc_no',
									placeholder: 'CKYC NO.',
									is_co_applicant: false,
									db_key: 'ckyc_no',
									pre_data_disable: false,
									rules: {
										length: 14,
									},
									is_masked: false,
									user_types_allowed: "['Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 14,
										number_only: true,
									},
									type: 'number',
									protected: false,
									visibility: true,
								},
								{
									name: 'ckyc_no',
									placeholder: 'CKYC NO.',
									is_applicant: false,
									db_key: 'ckyc_no',
									pre_data_disable: false,
									rules: {
										length: 14,
									},
									is_masked: false,
									user_types_allowed: "['Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 14,
										number_only: true,
									},
									type: 'number',
									protected: false,
									visibility: true,
								},
								{
									name: 'income_type',
									is_co_applicant: false,
									placeholder: 'Income/Customer Type',
									db_key: 'businesstype',
									rules: {
										required: true,
									},
									type: 'select',
									visibility: true,
									options: [
										{
											value: '7',
											name: 'Salaried',
										},
										{
											value: '1',
											name: 'Business',
										},
									],
									value: '7',
								},
								{
									name: 'income_type',
									is_applicant: false,
									placeholder: 'Income/Customer Type',
									db_key: 'businesstype',
									rules: {
										required: true,
									},
									type: 'select',
									visibility: true,
									options: [
										{
											value: '7',
											name: 'Salaried',
										},
										{
											value: '1',
											name: 'Business',
										},
										{
											value: '0',
											name: 'No Income',
										},
									],
								},
								{
									name: 'first_name',
									placeholder: 'First Name',
									db_key: 'first_name',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
									sub_fields: [
										{
											name: 'title',
											is_co_applicant: false,
											placeholder: 'Title',
											is_prefix: true,
											db_key: 'title',
											type: 'select',
											rules: {
												required: true,
											},
											options: [
												{
													value: 'Miss',
													name: 'Miss',
												},
												{
													value: 'Mrs',
													name: 'Mrs',
												},
												{
													value: 'Ms',
													name: 'Ms',
												},
												{
													value: 'Mr',
													name: 'Mr',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
										{
											name: 'title',
											is_applicant: false,
											placeholder: 'Fetch',
											is_prefix: true,
											type: 'select',
											rules: {},
											db_key: 'title',
											options: [
												{
													value: 'Miss',
													name: 'Miss',
												},
												{
													value: 'Mrs',
													name: 'Mrs',
												},
												{
													value: 'Ms',
													name: 'Ms',
												},
												{
													value: 'Mr',
													name: 'Mr',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
									],
								},
								{
									name: 'middle_name',
									placeholder: 'Middle Name',
									db_key: 'middle_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'last_name',
									placeholder: 'Last Name',
									db_key: 'last_name',
									rules: {},
									mask: {
										alpha_char_only: true,
									},
									pre_data_disable: false,
									type: 'text',
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'dob',
									placeholder: 'Date of Birth (dd-mm-yyyy)',
									db_key: 'ddob',
									rules: {
										required: false,
										past_dates: true,
									},
									type: 'date',
									pre_data_disable: false,
									protected: false,
									visibility: true,
								},
								{
									name: 'gender',
									placeholder: 'Gender',
									type: 'select',
									rules: {
										required: false,
									},
									db_key: 'gender',
									visibility: true,
									options: [
										{
											value: 'Male',
											name: 'Male',
										},
										{
											value: 'Female',
											name: 'Female',
										},
										{
											value: 'Third Gender',
											name: 'Third Gender',
										},
									],
								},
								{
									name: 'religion',
									placeholder: 'Religion',
									type: 'select',
									rules: {
										required: false,
									},
									db_key: 'religion',
									visibility: true,
									options: [
										{
											value: 'Christian',
											name: 'Christian',
										},
										{
											value: 'Hindu',
											name: 'Hindu',
										},
										{
											value: 'Muslim',
											name: 'Muslim',
										},
										{
											value: 'Sikh',
											name: 'Sikh',
										},
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'religion_others',
									placeholder: 'Religion (if others)',
									db_key: 'religion_others',
									rules: {},
									for_type: ['Others'],
									for_type_name: 'religion',
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
								},
								{
									name: 'category',
									placeholder: 'Category',
									type: 'select',
									rules: {
										required: false,
									},
									db_key: 'category',
									visibility: true,
									options: [
										{
											value: 'General',
											name: 'General',
										},
										{
											value: 'OBC',
											name: 'OBC',
										},
										{
											value: 'SC',
											name: 'SC',
										},
										{
											value: 'ST',
											name: 'ST',
										},
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'category_others',
									placeholder: 'Category (if others)',
									db_key: 'category_others',
									rules: {},
									for_type: ['Others'],
									for_type_name: 'category',
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
								},
								{
									name: 'qualification',
									placeholder: 'Qualification',
									db_key: 'edu_director',
									rules: {},
									type: 'select',
									options: [
										{
											value: 'Doctoral',
											name: 'Doctoral',
										},
										{
											value: 'Professional',
											name: 'Professional',
										},
										{
											value: 'PG',
											name: 'PG',
										},
										{
											value: 'Graduate',
											name: 'Graduate',
										},
										{
											value: 'Undergraduate',
											name: 'Undergraduate',
										},
										{
											value: 'High School or Lesser',
											name: 'High School or Lesser',
										},
									],
									pre_data_disable: false,
									protected: false,
									visibility: true,
								},
								{
									name: 'email',
									placeholder: 'Email ID',
									rules: {
										empty_or_email: true,
									},
									db_key: 'business_email',
									type: 'text',
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
									},
									visibility: true,
								},
								{
									name: 'mobile_no',
									is_co_applicant: false,
									placeholder: 'Enter a Valid Mobile Number to Recieve OTP',
									db_key: 'contactno',
									rules: {
										required: true,
										length: 10,
									},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'mobile_no',
									is_applicant: false,
									placeholder: 'Enter a Valid Mobile Number',
									db_key: 'contactno',
									rules: {
										required: true,
										length: 10,
									},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'country_residence',
									placeholder: 'Country of Residence',
									db_key: 'country_residence',
									type: 'select',
									visibility: true,
									options: [
										{
											name: 'India',
											value: 'India',
										},
										{
											name: 'Other',
											value: 'Other',
										},
									],
								},
								{
									name: 'residence_status',
									placeholder: 'Residence Status',
									db_key: 'residence_status',
									type: 'select',
									visibility: true,
									options: [
										{
											name: 'Resident',
											value: 'Resident',
										},
										{
											name: 'Non-Resident',
											value: 'Non-Resident',
										},
										{
											name: 'PIO',
											value: 'PIO',
										},
									],
								},
								{
									name: 'passport_no',
									is_applicant: false,
									placeholder: 'Passport No',
									db_key: 'passport_no',
									for_type: ['PIO', 'Non-Resident'],
									for_type_name: 'residence_status',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'passport_no',
									is_co_applicant: false,
									placeholder: 'Passport No',
									db_key: 'passport_no',
									for_type: ['PIO', 'Non-Resident'],
									for_type_name: 'residence_status',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'passport_expiry_date',
									placeholder: 'Passport Expiry Date',
									db_key: 'passport_expiry_date',
									type: 'date',
									past_dates: false,
									mask: {},
									visibility: true,
									option: [],
								},
								{
									name: 'visa_type',
									placeholder: 'Visa Type',
									db_key: 'visa_type',
									type: 'text',
									for_type: ['PIO', 'Non-Resident'],
									for_type_name: 'residence_status',
									mask: {},
									visibility: true,
									option: [],
								},
								{
									name: 'visa_validity',
									placeholder: 'Visa Validity',
									db_key: 'visa_validity',
									type: 'text',
									for_type: ['PIO', 'Non-Resident'],
									for_type_name: 'residence_status',
									mask: {},
									visibility: true,
									option: [],
								},
								{
									name: 'upi_id',
									placeholder: 'UPI ID',
									db_key: 'upi_id',
									type: 'text',
									rules: {
										required: true,
									},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										alpha_numberic_only: true,
										character_limit: 30,
									},
									visibility: false,
								},
							],
						},
						{
							id: 'family_details',
							name: 'Help us with Family Details',
							fields: [
								{
									name: 'marital_status',
									placeholder: 'Marital Status',
									db_key: 'marital_status',
									rules: {},
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Married',
											name: 'Married',
										},
										{
											value: 'Single',
											name: 'Single',
										},
										{
											value: 'Divorced',
											name: 'Divorced',
										},
									],
								},
								{
									name: 'spouse_name',
									placeholder: 'Spouse First Name',
									db_key: 'spouse_name',
									for_type: ['Married'],
									for_type_name: 'marital_status',
									rules: {},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
									sub_fields: [
										{
											name: 'spouse_title',
											is_co_applicant: false,
											placeholder: 'Title',
											for_type: ['Married'],
											for_type_name: 'marital_status',
											is_prefix: true,
											db_key: 'spouse_title',
											type: 'select',
											rules: {
												required: true,
											},
											options: [
												{
													value: 'Miss',
													name: 'Miss',
												},
												{
													value: 'Mrs',
													name: 'Mrs',
												},
												{
													value: 'Ms',
													name: 'Ms',
												},
												{
													value: 'Mr',
													name: 'Mr',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
										{
											name: 'spouse_title',
											is_applicant: false,
											placeholder: 'Fetch',
											for_type: ['Married'],
											for_type_name: 'marital_status',
											is_prefix: true,
											type: 'select',
											rules: {},
											db_key: 'spouse_title',
											options: [
												{
													value: 'Miss',
													name: 'Miss',
												},
												{
													value: 'Mrs',
													name: 'Mrs',
												},
												{
													value: 'Ms',
													name: 'Ms',
												},
												{
													value: 'Mr',
													name: 'Mr',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
									],
								},
								{
									name: 'spouse_middle_name',
									placeholder: 'Spouse Middle Name',
									for_type: ['Married'],
									for_type_name: 'marital_status',
									db_key: 'spouse_middle_name',
									rules: {},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'spouse_last_name',
									placeholder: 'Spouse Last Name',
									for_type: ['Married'],
									for_type_name: 'marital_status',
									db_key: 'spouse_last_name',
									rules: {},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'father_name',
									placeholder: "Father's Name",
									db_key: 'father_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
									sub_fields: [
										{
											name: 'father_title',
											is_co_applicant: false,
											placeholder: 'Title',
											is_prefix: true,
											db_key: 'father_title',
											type: 'select',
											rules: {
												required: false,
											},
											options: [
												{
													value: 'Mr',
													name: 'Mr',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
										{
											name: 'father_title',
											is_applicant: false,
											placeholder: 'Fetch',
											is_prefix: true,
											type: 'select',
											rules: {},
											db_key: 'father_title',
											options: [
												{
													value: 'Mr',
													name: 'Mr',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
									],
								},
								{
									name: 'father_middle_name',
									placeholder: "Father's Middle Name",
									db_key: 'father_middle_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'father_last_name',
									placeholder: "Father's Last Name",
									db_key: 'father_last_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'mother_name',
									placeholder: "Mother's Name",
									db_key: 'mother_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
									sub_fields: [
										{
											name: 'mother_title',
											is_co_applicant: false,
											placeholder: 'Title',
											is_prefix: true,
											db_key: 'mother_title',
											type: 'select',
											rules: {
												required: false,
											},
											options: [
												{
													value: 'Miss',
													name: 'Miss',
												},
												{
													value: 'Mrs',
													name: 'Mrs',
												},
												{
													value: 'Ms',
													name: 'Ms',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
										{
											name: 'mother_title',
											is_applicant: false,
											placeholder: 'Fetch',
											is_prefix: true,
											type: 'select',
											rules: {},
											db_key: 'mother_title',
											options: [
												{
													value: 'Miss',
													name: 'Miss',
												},
												{
													value: 'Mrs',
													name: 'Mrs',
												},
												{
													value: 'Ms',
													name: 'Ms',
												},
												{
													value: 'Mx',
													name: 'Mx',
												},
											],
										},
									],
								},
								{
									name: 'mother_middle_name',
									placeholder: "Mother's Middle Name",
									db_key: 'mother_middle_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'mother_last_name',
									placeholder: "Mother's Last Name",
									db_key: 'mother_last_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'no_of_dependents',
									placeholder: 'No. of Dependents',
									db_key: 'no_of_dependents',
									rules: {
										required: false,
									},
									mask: {
										number_only: true,
									},
									type: 'number',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'no_of_working_members',
									placeholder: 'No. of Working Members',
									db_key: 'no_of_working_members',
									rules: {
										required: false,
									},
									mask: {
										number_only: true,
									},
									type: 'number',
									pre_data_disable: false,
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'relationship_with_applicant',
									is_applicant: false,
									placeholder: 'Relationship with Applicant',
									db_key: 'applicant_relationship',
									rules: {
										required: false,
									},
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Spouse',
											name: 'Spouse',
										},
										{
											value: 'Father',
											name: 'Father',
										},
										{
											value: 'Mother',
											name: 'Mother',
										},
										{
											value: 'Son',
											name: 'Son',
										},
										{
											value: 'Daughter',
											name: 'Daughter',
										},
										{
											value: 'Brother',
											name: 'Brother',
										},
										{
											value: 'Sister',
											name: 'Sister',
										},
										{
											value: 'Business Partner',
											name: 'Business Partner',
										},
									],
								},
							],
						},
					],
				},
				{
					id: 'loan_address_details',
					name: 'Address Details',
					is_applicant: true,
					hide_section_usertype: ['Technical', 'RCU', 'Document'],
					sub_sections: [
						{
							id: 'permanent_address_proof_upload',
							name: 'Help us with Address details',
							aid: '2',
							prefix: 'permanent_',
							fields: [
								{
									name: 'permanent_address_proof_type',
									db_key: 'address_proof_type',
									type: 'address_proof_radio',
									visibility: true,
									options: [
										{
											name: 'permanent_aadhaar',
											db_key: 'loan_document',
											label: 'Aadhaar',
											type: 'file',
											req_type: 'aadhar',
											value: 'permanent_aadhar',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'permanent_voter_id',
											db_key: 'loan_document',
											label: ' Voter ID',
											type: 'file',
											req_type: 'voter',
											value: 'permanent_voter',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'permanent_dl',
											db_key: 'loan_document',
											label: 'DL',
											type: 'file',
											req_type: 'DL',
											value: 'permanent_DL',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'permanent_passport',
											db_key: 'loan_document',
											label: 'Passport',
											type: 'file',
											req_type: 'passport',
											value: 'permanent_passport',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'permanent_others',
											db_key: 'loan_document',
											label: 'Others',
											type: 'file',
											value: 'permanent_others',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
									],
									rules: {
										required: true,
									},
								},
								{
									name: 'permanent_id_upload',
									db_key: 'loan_document',
									label: 'Upload your ID Proof',
									type: 'file',
									visibility: true,
									min: 1,
									max: 1,
									rules: {
										required: true,
										supported_formats: ['*'],
									},
								},
								{
									name: 'permanent_aadhaar',
									db_key: 'daadhaar',
									placeholder: 'Aadhaar Number',
									type: 'text',
									rules: {
										required: true,
									},
									protected: false,
									pattern: 'x',
									mask: {
										alpha_numeric_only: true,
										character_limit: 12,
									},
									visibility: true,
									sub_fields: [
										{
											name: 'verifywithotp',
											db_key: 'verifywithotp',
											is_co_applicant: false,
											placeholder: 'Verify with OTP',
											type: 'button',
											rules: {
												required: true,
											},
											visibility: true,
											isbuttonfilled: false,
										},
										{
											name: 'verifywithotp',
											is_applicant: false,
											db_key: 'verifywithotp',
											placeholder: 'Verify with OTP',
											type: 'button',
											visibility: true,
											rules: {},
											isbuttonfilled: false,
										},
									],
								},
								{
									name: 'permanent_address_proof_id_voter',
									placeholder: 'Voter ID',
									db_key: 'dvoterid',
									for_type_name: 'permanent_address_proof_type',
									for_type: ['permanent_voter'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'permanent_address_proof_id_dl',
									placeholder: 'DL Number',
									db_key: 'ddlNumber',
									for_type_name: 'permanent_address_proof_type',
									for_type: ['permanent_DL'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'permanent_address_proof_id_passport',
									placeholder: 'Passport Number',
									db_key: 'dpassport',
									for_type_name: 'permanent_address_proof_type',
									for_type: ['permanent_passport'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'permanent_address_proof_id_others',
									placeholder: 'Document Name',
									db_key: 'ddocname',
									for_type_name: 'permanent_address_proof_type',
									for_type: ['permanent_others'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'permanent_address_proof_id',
									placeholder: 'Address Proof ID',
									db_key: 'permanent_address_proof_id',
									for_type_name: 'permanent_address_proof_type',
									for_type: ['permanent_others'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'permanent_address_proof_issued_on',
									placeholder: 'Issued On',
									db_key: 'issued_on',
									for_type_name: 'permanent_address_proof_type',
									for_type: [
										'permanent_others',
										'permanent_passport',
										'permanent_DL',
									],
									rules: {
										past_dates: true,
									},
									mask: {},
									type: 'date',
									is_month_picker: false,
									visibility: true,
								},
								{
									name: 'permanent_address_proof_valid_till',
									placeholder: 'Valid Till',
									db_key: 'valid_till',
									for_type_name: 'permanent_address_proof_type',
									for_type: [
										'permanent_others',
										'permanent_passport',
										'permanent_DL',
									],
									rules: {
										past_dates: true,
									},
									mask: {},
									type: 'date',
									is_month_picker: false,
									visibility: true,
								},
							],
						},
						{
							id: 'permanent_address_details',
							name: '',
							aid: '2',
							prefix: 'permanent_',
							fields: [
								{
									name: 'permanent_address_type',
									placeholder: 'Address Type',
									db_key: 'permanent_address_type',
									type: 'select',
									options: [
										{
											name: 'Residential/Business',
											value: 'Residential/Business',
										},
										{
											name: 'Residential',
											value: 'Residential',
										},
										{
											name: 'Business',
											value: 'Business',
										},
										{
											name: 'Registered Office',
											value: 'Registered Office',
										},
										{
											name: 'Unspecified',
											value: 'Unspecified',
										},
									],
									mask: {},
									visibility: true,
								},
								{
									name: 'permanent_address1',
									placeholder: 'Address Line 1',
									db_key: 'line1',
									rules: {
										required: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'permanent_address2',
									placeholder: 'Address Line 2',
									db_key: 'line2',
									type: 'text',
									visibility: true,
								},
								{
									name: 'permanent_address3',
									placeholder: 'Landmark',
									db_key: 'locality',
									rules: {
										required: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'permanent_pin_code',
									placeholder: 'Pin Code',
									db_key: 'pincode',
									rules: {
										required: false,
										length: 6,
									},
									mask: {
										number_only: true,
										character_limit: 6,
									},
									make_api_call: 6,
									type: 'pincode',
									value_for_fields: [['city', 'district'], ['state', 'state']],
									visibility: true,
								},
								{
									name: 'permanent_city',
									placeholder: 'City',
									db_key: 'city',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'permanent_state',
									placeholder: 'State',
									db_key: 'state',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'permanent_property_type',
									placeholder: 'Property Type',
									db_key: 'residential_type',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'select',
									options: [
										{
											name: 'Owned',
											value: 'Owned',
										},
										{
											name: 'Family',
											value: 'Family',
										},
										{
											name: 'Renter',
											value: 'Renter',
										},
										{
											name: 'Employer',
											value: 'Employer',
										},
										{
											name: 'Others',
											value: 'Others',
										},
									],
									visibility: true,
								},
								{
									name: 'permanent_property_tenure',
									placeholder: 'Tenure in Current property',
									db_key: 'residential_stability',
									rules: {
										required: false,
										past_dates: true,
									},
									mask: {},
									type: 'month',
									is_month_picker: true,
									visibility: true,
								},
							],
						},
						{
							id: 'present_address_proof_upload',
							name: '',
							aid: '1',
							prefix: 'present_',
							fields: [
								{
									name: 'present_address_proof_type',
									db_key: 'address_proof_type',
									type: 'address_proof_radio',
									visibility: true,
									options: [
										{
											name: 'present_aadhaar',
											db_key: 'loan_document',
											label: 'Aadhaar',
											type: 'file',
											req_type: 'aadhar',
											value: 'present_aadhar',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'present_voter_id',
											db_key: 'loan_document',
											label: ' Voter ID',
											type: 'file',
											req_type: 'voter',
											value: 'present_voter',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'present_dl',
											db_key: 'loan_document',
											label: 'DL',
											type: 'file',
											req_type: 'DL',
											value: 'present_DL',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'present_passport',
											db_key: 'loan_document',
											label: 'Passport',
											type: 'file',
											req_type: 'passport',
											value: 'present_passport',
											process_type: 'extraction',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
										{
											name: 'present_others',
											db_key: 'loan_document',
											label: 'Others',
											type: 'file',
											value: 'present_others',
											min: 1,
											max: 2,
											rules: {
												required: true,
												supported_formats: ['*'],
											},
											doc_type: {
												'0': 302,
												'1': 302,
												'7': 302,
											},
										},
									],
									rules: {
										required: true,
									},
								},
								{
									name: 'present_id_upload',
									db_key: 'loan_document',
									label: 'Upload your ID Proof',
									type: 'file',
									visibility: true,
									min: 1,
									max: 1,
									rules: {
										required: true,
										supported_formats: ['*'],
									},
								},
								{
									name: 'present_aadhaar',
									db_key: 'daadhaar',
									placeholder: 'Aadhaar Number',
									type: 'text',
									rules: {
										required: true,
									},
									protected: false,
									pattern: 'x',
									mask: {
										alpha_numeric_only: true,
										character_limit: 12,
									},
									visibility: true,
									sub_fields: [
										{
											name: 'verifywithotp',
											db_key: 'verifywithotp',
											visibility: true,
											placeholder: 'Verify with OTP',
											type: 'button',
											rules: {},
											isbuttonfilled: false,
										},
									],
								},
								{
									name: 'present_address_proof_id_voter',
									placeholder: 'Voter ID',
									db_key: 'dvoterid',
									for_type_name: 'present_address_proof_type',
									for_type: ['present_voter'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'present_address_proof_id_dl',
									placeholder: 'DL Number',
									db_key: 'ddlNumber',
									for_type_name: 'present_address_proof_type',
									for_type: ['present_DL'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'present_address_proof_id_passport',
									placeholder: 'Passport Number',
									db_key: 'dpassport',
									for_type_name: 'present_address_proof_type',
									for_type: ['present_passport'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'present_address_proof_id_others',
									placeholder: 'Document Name',
									db_key: 'ddocname',
									for_type_name: 'present_address_proof_type',
									for_type: ['present_others'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'present_address_proof_id_others',
									placeholder: 'Address Proof ID',
									db_key: 'address_proof_id',
									for_type_name: 'present_address_proof_type',
									for_type: ['present_others'],
									type: 'text',
									rules: {
										required: true,
									},
									visibility: true,
								},
								{
									name: 'present_address_proof_issued_on',
									placeholder: 'Issued On',
									db_key: 'issued_on',
									for_type_name: 'present_address_proof_type',
									for_type: [
										'present_others',
										'present_passport',
										'present_DL',
									],
									rules: {
										past_dates: true,
									},
									mask: {},
									type: 'date',
									is_month_picker: false,
									visibility: true,
								},
								{
									name: 'present_address_proof_valid_till',
									placeholder: 'Valid Till',
									db_key: 'valid_till',
									for_type_name: 'present_address_proof_type',
									for_type: [
										'present_others',
										'present_passport',
										'present_DL',
									],
									rules: {
										past_dates: false,
									},
									mask: {},
									type: 'date',
									is_month_picker: false,
									visibility: true,
								},
							],
						},
						{
							id: 'present_address_details',
							name: '',
							aid: '1',
							prefix: 'present_',
							fields: [
								{
									name: 'present_address_type',
									placeholder: 'Address Type',
									db_key: 'address_type',
									type: 'select',
									options: [
										{
											name: 'Residential/Business',
											value: 'Residential/Business',
										},
										{
											name: 'Residential',
											value: 'Residential',
										},
										{
											name: 'Business',
											value: 'Business',
										},
										{
											name: 'Registered Office',
											value: 'Registered Office',
										},
										{
											name: 'Unspecified',
											value: 'Unspecified',
										},
									],
									mask: {},
									visibility: true,
								},
								{
									name: 'present_address1',
									placeholder: 'Address Line 1',
									db_key: 'line1',
									rules: {
										required: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'present_address2',
									placeholder: 'Address Line 2',
									db_key: 'line2',
									type: 'text',
									visibility: true,
								},
								{
									name: 'present_address3',
									placeholder: 'Landmark',
									db_key: 'locality',
									type: 'text',
									visibility: true,
								},
								{
									name: 'present_pin_code',
									placeholder: 'Pin Code',
									db_key: 'pincode',
									rules: {
										required: false,
										length: 6,
									},
									mask: {
										number_only: true,
										character_limit: 6,
									},
									make_api_call: 6,
									type: 'pincode',
									value_for_fields: [['city', 'district'], ['state', 'state']],
									visibility: true,
								},
								{
									name: 'present_city',
									placeholder: 'City',
									db_key: 'city',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'present_state',
									placeholder: 'State',
									db_key: 'state',
									rules: {
										required: true,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'present_property_type',
									placeholder: 'Property Type',
									db_key: 'residential_type',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'select',
									options: [
										{
											name: 'Owned',
											value: 'Owned',
										},
										{
											name: 'Family',
											value: 'Family',
										},
										{
											name: 'Renter',
											value: 'Renter',
										},
										{
											name: 'Employer',
											value: 'Employer',
										},
										{
											name: 'Others',
											value: 'Others',
										},
									],
									visibility: true,
								},
								{
									name: 'present_property_tenure',
									placeholder: 'Tenure in Current property',
									db_key: 'residential_stability',
									rules: {
										required: false,
										past_dates: true,
									},
									mask: {},
									type: 'month',
									is_month_picker: true,
									visibility: true,
								},
							],
						},
					],
				},
				{
					id: 'employment_details',
					name: 'Employment Details',
					is_applicant: true,
					footer: {
						fields: [
							{
								type: 'button',
								name: 'Add Director',
								key: 'Director',
								business_income_type_id: [4, 5],
							},
							{
								type: 'button',
								name: 'Add Partner',
								key: 'Partner',
								business_income_type_id: [2, 3],
							},
							{
								type: 'button',
								name: 'Add Member',
								key: 'Member',
								business_income_type_id: [6, 10, 11],
							},
							{
								type: 'button',
								name: 'Add Proprietor',
								key: 'Proprietor',
								business_income_type_id: [1],
							},
							{
								type: 'button',
								name: 'Add Trustee',
								key: 'Trustee',
								business_income_type_id: [9],
							},
						],
					},
					sub_sections: [
						{
							id: 'employment_details',
							name: 'Help us with Current Employment Details',
							fields: [
								{
									name: 'employment_category',
									placeholder: 'Employment Category',
									db_key: 'employment_category',
									rules: {
										required: false,
									},
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Salaried',
											name: 'Salaried',
										},
										{
											value: 'Business',
											name: 'Business',
										},
										{
											value: 'Professional',
											name: 'Professional',
										},
										{
											value: 'Salaried + Self-Employed',
											name: 'Salaried + Self-Employed',
										},
										{
											value: 'Not Employed',
											name: 'Not Employed',
										},
										{
											value: 'Retired',
											name: 'Retired',
										},
										{
											value: 'Home Maker',
											name: 'Home Maker',
										},
										{
											value: 'Student',
											name: 'Student',
										},
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'organization_type_business',
									placeholder: 'Organization Type',
									db_key: 'organization_type',
									rules: {
										required: false,
									},
									for_type: ['Business'],
									for_type_name: 'employment_category',
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Public Limited',
											name: 'Public Limited',
										},
										{
											value: 'Private Limited',
											name: 'Private Limited',
										},
										{
											value: 'Proprietorship',
											name: 'Proprietorship',
										},
										{
											value: 'Partnership',
											name: 'Partnership',
										},
										{
											value: 'CA',
											name: 'CA',
										},
										{
											value: 'Doctor',
											name: 'Doctor',
										},
										{
											value: 'Academicians',
											name: 'Academicians',
										},
										{
											value: 'Bureaucrat',
											name: 'Bureaucrat',
										},
										{
											value: 'Car Dealer',
											name: 'Car Dealer',
										},
										{
											value: 'Financial Sector',
											name: 'Financial Sector',
										},
										{
											value: 'Judiciary',
											name: 'Judiciary',
										},
										{
											value: 'Media',
											name: 'Media',
										},
										{
											value: 'Pawn Broker',
											name: 'Pawn Broker',
										},
										{
											value: 'Real Estate',
											name: 'Real Estate',
										},
										{
											value: 'Scrap Dealers',
											name: 'Scrap Dealers',
										},
										{
											value: 'Stateman',
											name: 'Stateman',
										},
										{
											value: 'Stock Brockers',
											name: 'Stock Brockers',
										},
										{
											value: 'Virtual Currency',
											name: 'Virtual Currency',
										},
										{
											value: 'Dealers in Art and Antiques',
											name: 'Dealers in Art and Antiques',
										},
										{
											value: 'Dealers in Arms and Armaments',
											name: 'Dealers in Arms and Armaments',
										},
										{
											value: 'Entertainment Industry',
											name: 'Entertainment Industry',
										},
										{
											value: 'Professional Intermediaries',
											name: 'Professional Intermediaries',
										},
										{
											value: 'Dealers in Gems',
											name: 'Dealers in Gems',
										},
										{
											value: 'Jewels and Precious Stones',
											name: 'Jewels and Precious Stones',
										},
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'organization_type_salaried',
									placeholder: 'Organization Type',
									db_key: 'organization_type',
									rules: {
										required: false,
									},
									for_type: ['Salaried'],
									for_type_name: 'employment_category',
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Central/State Government',
											name: 'Central/State Government',
										},
										{
											value: 'Public Sector Unit',
											name: 'Public Sector Unit',
										},
										{
											value: 'Public Limited',
											name: 'Public Limited',
										},
										{
											value: 'Private Limited',
											name: 'Private Limited',
										},
										{
											value: 'Proprietorship',
											name: 'Proprietorship',
										},
										{
											value: 'Partnership',
											name: 'Partnership',
										},
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'organization_type_salaried_self_employed',
									placeholder: 'Organization Type',
									db_key: 'organization_type',
									rules: {
										required: false,
									},
									for_type: ['Salaried + Self-Employed'],
									for_type_name: 'employment_category',
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Central/State Government',
											name: 'Central/State Government',
										},
										{
											value: 'Public Sector Unit',
											name: 'Public Sector Unit',
										},
										{
											value: 'Public Limited',
											name: 'Public Limited',
										},
										{
											value: 'Private Limited',
											name: 'Private Limited',
										},
										{
											value: 'Proprietorship',
											name: 'Proprietorship',
										},
										{
											value: 'Partnership',
											name: 'Partnership',
										},
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'organization_type_professional',
									placeholder: 'Organization Type',
									db_key: 'organization_type',
									rules: {
										required: false,
									},
									for_type: ['Professional'],
									for_type_name: 'employment_category',
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Proprietorship',
											name: 'Proprietorship',
										},
										{
											value: 'Partnership',
											name: 'Partnership',
										},
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'organization_type_others',
									placeholder: 'Organization Type',
									db_key: 'organization_type',
									rules: {
										required: false,
									},
									for_type: ['Not Employed', 'Others'],
									for_type_name: 'employment_category',
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Others',
											name: 'Others',
										},
									],
								},
								{
									name: 'company_name',
									placeholder: 'Company/Business Name',
									db_key: 'company_name',
									rules: {
										required: false,
									},
									mask: {
										alpha_numeric_only: true,
									},
									pre_data_disable: false,
									type: 'text',
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'current_designation',
									placeholder: 'Current Designation',
									db_key: 'current_designation',
									rules: {},
									mask: {
										alpha_char_only: true,
									},
									pre_data_disable: false,
									type: 'text',
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'staff',
									placeholder: 'Staff',
									db_key: 'staff',
									rules: {},
									mask: {},
									pre_data_disable: false,
									type: 'select',
									options: [
										{
											name: 'Yes',
											value: 'Yes',
										},
										{
											name: 'No',
											value: 'No',
										},
									],
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'staff_pf',
									placeholder: 'Staff PF NO',
									db_key: 'staff_pf',
									rules: {},
									for_type: ['Yes'],
									for_type_name: 'staff',
									pre_data_disable: false,
									type: 'text',
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'staff_dir_related',
									placeholder: 'Related to Staff/Dir',
									db_key: 'staff_dir_related',
									rules: {},
									mask: {},
									pre_data_disable: false,
									type: 'select',
									options: [
										{
											name: 'Yes',
											value: 'Yes',
										},
										{
											name: 'No',
											value: 'No',
										},
									],
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'staff_dir_name',
									placeholder: 'Name of Staff/Dir',
									db_key: 'staff_dir_name',
									rules: {},
									for_type: ['Yes'],
									for_type_name: 'staff_dir_related',
									mask: {
										alpha_char_only: true,
									},
									pre_data_disable: false,
									type: 'text',
									protected: false,
									visibility: true,
									default_value: '',
								},
								{
									name: 'years_in_company',
									placeholder: 'Number of years in current company/business',
									db_key: 'year_in_company',
									rules: {},
									is_masked: false,
									mask: {
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'total_experience',
									placeholder: 'Total years of work experience',
									db_key: 'total_experience',
									rules: {},
									is_masked: false,
									user_types_allowed: '',
									mask: {
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'office_phone',
									placeholder: 'Office Phone Number',
									db_key: 'office_phone',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','CO','Sales']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
										number_only: true,
										character_limit: 10,
									},
									type: 'number',
									visibility: true,
								},
								{
									name: 'office_email',
									placeholder: 'Office Email ID',
									db_key: 'office_email',
									rules: {
										empty_or_email: true,
									},
									type: 'text',
									is_masked: true,
									user_types_allowed: "['Legal','CO','Sales']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 1,
												from_ending: 1,
											},
										},
									},
									visibility: true,
								},
								{
									name: 'employee_number',
									placeholder: 'Employee Number ',
									db_key: 'employee_number',
									rules: {},
									is_masked: false,
									user_types_allowed: '',
									mask: {
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'retirement_age',
									placeholder: 'Retirement Age ',
									db_key: 'retirement_age',
									rules: {},
									is_masked: false,
									user_types_allowed: '',
									mask: {
										number_only: true,
										character_limit: 10,
									},
									type: 'text',
									visibility: true,
								},
							],
						},
						{
							id: 'address_details',
							name: 'Help us with Employment Address Details',
							fields: [
								{
									name: 'address1',
									placeholder: 'Address Line 1',
									db_key: 'address1',
									rules: {
										required: false,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'address2',
									placeholder: 'Address Line 2',
									db_key: 'address2',
									type: 'text',
									visibility: true,
								},
								{
									name: 'landmark',
									placeholder: 'Landmark',
									db_key: 'landmark',
									type: 'text',
									visibility: true,
								},
								{
									name: 'pin_code',
									placeholder: 'Pin Code',
									db_key: 'pincode',
									rules: {
										required: false,
										length: 6,
									},
									mask: {
										number_only: true,
										character_limit: 6,
									},
									make_api_call: 6,
									type: 'pincode',
									value_for_fields: [['city', 'district'], ['state', 'state']],
									visibility: true,
								},
								{
									name: 'city',
									placeholder: 'City',
									db_key: 'city',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
								{
									name: 'state',
									placeholder: 'State',
									db_key: 'state',
									rules: {
										required: false,
									},
									mask: {
										alpha_char_only: true,
									},
									type: 'text',
									visibility: true,
								},
							],
						},
						{
							id: 'salary_details',
							name: 'Help us with Income Details',
							fields: [
								{
									name: 'gross_income',
									db_key: 'gross_income',
									for_type: [
										'Business',
										'Professional',
										'Others',
										'Salaried + Self-Employed',
									],
									for_type_name: 'employment_category',
									placeholder: 'Gross Income from Employment (Monthly)',
									type: 'text',
									rules: {
										required: false,
									},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 0,
												from_ending: 0,
											},
										},
										number_only: true,
										character_limit: 12,
									},
									visibility: true,
									inrupees: true,
								},
								{
									name: 'net_monthly_income',
									db_key: 'net_monthly_income',
									for_type: ['Salaried'],
									for_type_name: 'employment_category',
									placeholder: 'Net Income from Employment(Monthly)',
									type: 'text',
									rules: {
										required: false,
									},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 0,
												from_ending: 0,
											},
										},
										number_only: true,
										character_limit: 12,
									},
									visibility: true,
									inrupees: true,
								},
								{
									name: 'income_from_other_business',
									placeholder: 'Income from Other Business (Annual)',
									db_key: 'income_from_other_business',
									type: 'text',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 0,
												from_ending: 0,
											},
										},
										number_only: true,
										character_limit: 12,
									},
									visibility: true,
									inrupees: true,
								},
								{
									name: 'income_from_rent',
									placeholder: 'Income from Rent (Annual)',
									db_key: 'income_from_rent',
									type: 'text',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 0,
												from_ending: 0,
											},
										},
										number_only: true,
										character_limit: 12,
									},
									visibility: true,
									inrupees: true,
								},
								{
									name: 'income_from_agriculture',
									db_key: 'income_from_agriculture',
									placeholder: 'Income from Agriculture (Annual)',
									type: 'text',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 0,
												from_ending: 0,
											},
										},
										number_only: true,
										character_limit: 12,
									},
									visibility: true,
									inrupees: true,
								},
								{
									name: 'any_other_income',
									placeholder: 'Any Other Income (Annual)',
									db_key: 'any_other_income',
									type: 'text',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 0,
												from_ending: 0,
											},
										},
										number_only: true,
										character_limit: 12,
									},
									visibility: true,
									inrupees: true,
								},
								{
									name: 'deductions',
									placeholder: 'Deductions',
									db_key: 'deductions',
									type: 'text',
									rules: {},
									is_masked: true,
									user_types_allowed: "['Legal','Technical','RCU']",
									mask: {
										mask_values: {
											mask_pattern: '*',
											characters_not_to_be_masked: {
												from_starting: 0,
												from_ending: 0,
											},
										},
										number_only: true,
										character_limit: 12,
									},
									visibility: true,
									inrupees: true,
								},
								{
									name: 'income_loan_repayment',
									placeholder: 'Income Considered for Loan Repayment',
									db_key: 'income_loan_repayment',
									rules: {
										required: false,
									},
									type: 'select',
									visibility: true,
									options: [
										{
											value: 'Yes',
											name: 'Yes',
										},
										{
											value: 'No',
											name: 'No',
										},
									],
								},
							],
						},
					],
				},
				{
					name: 'Shareholder Details',
					id: 'shareholder_details',
					sub_sections: [
						{
							id: 'shareholder_details',
							name: 'Help us with Shareholder Details',
							is_dynamic: true,
							min: 1,
							max: 5,
							fields: [
								{
									name: 'shareholder_name',
									placeholder: 'Shareholder Name',
									rules: {
										required: true,
									},
									db_key: 'name',
									type: 'text',
									mask: {
										alpha_char_only: true,
									},
									visibility: true,
								},
								{
									name: 'shareholder_percentage',
									placeholder: 'Shareholder Percentage',
									rules: {
										minValue: '0',
										maxValue: '100',
										required: true,
									},
									db_key: 'percentage',
									type: 'number',
									mask: {
										NumberOnly: true,
										CharacterLimit: 3,
									},
									visibility: true,
								},
								{
									name: 'relation_shareholder',
									placeholder: 'Relation ',
									db_key: 'relationship',
									rules: {},
									options: [
										{
											name: 'Subsidiary Company',
											value: 'Subsidiary Company',
										},
										{
											name: ' Associated',
											value: ' Associated',
										},
										{
											name: ' Relative',
											value: ' Relative',
										},
										{
											name: ' Holding Company',
											value: ' Holding Company',
										},
										{
											name: ' Promoter/Proprietor',
											value: ' Promoter/Proprietor',
										},
										{
											name: ' Director/Partner',
											value: ' Director/Partner',
										},
										{
											name: ' Other Account',
											value: ' Other Account',
										},
										{
											name: ' Other Group Company',
											value: ' Other Group Company',
										},
									],
									type: 'select',
									visibility: true,
								},
								{
									name: 'company_address',
									placeholder: 'Company Address',
									rules: {},
									type: 'text',
									visibility: true,
									db_key: 'address',
								},
								{
									name: 'pincode',
									placeholder: 'Pincode',
									rules: {},
									mask: {
										NumberOnly: true,
										CharacterLimit: 6,
									},
									type: 'number',
									visibility: true,
									db_key: 'pincode',
								},
							],
						},
					],
				},
				{
					id: 'consent_details',
					name: 'Consent Details',
					sub_sections: [
						{
							id: 'consent_details',
							name: 'Help us with Consent Details',
							fields: [],
						},
						{
							id: 'cibil_equifax',
							name: 'CIBIL/Equifax',
							fields: [],
						},
						{
							id: 'gstr3b',
							name: 'GSTR3B',
							fields: [],
						},
						{
							id: 'itr',
							name: 'ITR',
							fields: [],
						},
						{
							id: 'roc',
							name: 'ROC',
							fields: [],
						},
						{
							id: 'esic',
							name: 'ESIC',
							fields: [],
						},
						{
							id: 'epfo',
							name: 'EPFO',
							fields: [],
						},
						{
							id: 'crime_check',
							name: 'Crime Check',
							fields: [],
						},
					],
				},
				{
					id: 'document_upload',
					name: 'Document Upload',
					sub_sections: [
						{
							id: 'comment_for_office_use',
							name: 'Comments For Office Use',
							fields: [
								{
									name: 'comment_for_office_use',
									placeholder: '',
									db_key: 'comment_for_office_use',
									rules: {},
									type: 'textarea',
									visibility: true,
								},
							],
						},
					],
				},
				{
					id: 'application_submitted',
					name: 'Order Submitted',
				},
			],
		},
		color_theme_react: {},
		edit_json: '{}',
		loan_request_type: 1,
		otp_configuration: {
			no_of_attempts: 3,
			time_limit_in_minutes: 60,
			otp_duration_in_seconds: 90,
		},
		parent_id: null,
	},
};
export default data;
