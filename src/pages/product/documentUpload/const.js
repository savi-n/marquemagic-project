import { HOSTNAME } from '_config/app.config';

export const CATEGORY_KYC = 'kyc';
export const CATEGORY_FINANCIAL = 'financial';
export const CATEGORY_OTHER = 'other';
export const CATEGORY_LENDER = 'lender';
export const CATEGORY_EVAL = 'eval';

export const fileStructure = (documents, type) => {
	return documents
		.filter(file => file.category === type)
		.map(file => {
			const newFile = {
				...file,
				// value, filename, fd, password
				fd: file.document_key, //fd from loan document repsone
				size: file.size, //size from loan document repsone
				doc_type_id: file.id,
				// type: "",
				filename: file.upload_doc_name, //fd from loan document repsone
				// status: "",
				// field: "",
				value: file.id || file.typeId, // doctype_id
				password: file?.password,
			};
			if (file?.director_id) {
				newFile.director_id = file?.director_id;
			}
			return newFile;
		});
};

export const getAmountUm = a => {
	if (a < 100000) {
		return 'Lakhs';
	}
	if (a >= 99999 && a <= 9999999) {
		return 'Lakhs';
	} else if (a <= 999999999 && a >= 1000000) {
		return 'Crores';
	}
};

export const getAmount = a => {
	if (a < 100000) {
		return a / 100000;
	}
	if (a >= 99999 && a <= 9999999) {
		return a / 100000;
	} else if (a <= 999999999 && a >= 1000000) {
		return a / 10000000;
	}
};

export const caseCreationDataFormat = (
	data,
	uploaddedDoc,
	companyData,
	productDetails,
	productId,
	editLoan
) => {
	try {
		// console.log('-----------temp1-------------');
		const userToken = sessionStorage.getItem(HOSTNAME);
		const formReducer = JSON.parse(userToken)?.formReducer;
		const loan = formReducer?.user?.loanData;
		const form = formReducer?.user?.applicantData;
		const guarantorData = formReducer?.Guarantor;
		const applicantData = formReducer?.user?.applicantData;
		const loanData = formReducer?.user?.loanData;
		let authentication_otp_res = null;
		// console.log('-----------temp2-------------');
		try {
			authentication_otp_res = JSON.parse(
				sessionStorage.getItem('authentication_otp_res')
			);
		} catch (e) {
			authentication_otp_res = null;
		}
		const collateralData = [];
		if (data['collateral-details'] || formReducer?.user['collateral-details'])
			collateralData.push(
				data['collateral-details'] || formReducer?.user['collateral-details']
			);
		if (data['land-additional-details'])
			collateralData.push(data['land-additional-details']);
		if (data['fishery-additional-details'])
			collateralData.push(data['fishery-additional-details']);
		//console.log(
		//'LoanDoccumentUpload-caseCreationDataFormat-collatralData ',
		//	collatralData
		//);

		const idType =
			productDetails.loan_request_type === 1 ? 'business' : 'salaried';

		// console.log('case-creation-data-format-', {
		// 	data,
		// 	companyData,
		// 	productDetails,
		// 	productId,
		// 	applicantData,
		// 	loanData,
		// 	idType,
		// 	guarantorData,
		// });
		// console.log('-----------temp3-------------');

		const businessDetails = () => {
			try {
				let corporateDetails = sessionStorage.getItem('corporateDetails');
				if (corporateDetails) corporateDetails = JSON.parse(corporateDetails);
				if (!companyData) {
					companyData =
						sessionStorage.getItem('companyData') &&
						JSON.parse(sessionStorage.getItem('companyData'));
				}
				const formstate = sessionStorage.getItem('formstate')
					? JSON.parse(sessionStorage.getItem('formstate'))
					: {};

				//console.log('corportae Details', corporateDetails);
				const newBusinessDetails = {
					first_name: applicantData?.firstName || '',
					last_name: applicantData?.lastName || '',
					dob: applicantData?.dob || '',
					business_name:
						applicantData?.firstName ||
						sessionStorage.getItem('BusinessName') ||
						companyData?.BusinessName,
					business_type:
						applicantData?.incomeType ||
						data['business-details']?.BusinessType ||
						formReducer?.user['business-details']?.BusinessType,
					// applicantData?.incomeType === 'salaried'
					// 	? 7
					// 	: applicantData?.incomeType === 'selfemployed'
					// 	? 18
					// 	: data['business-details']?.BusinessType
					// 	? data['business-details']?.BusinessType
					// 	: 1,

					business_email:
						applicantData?.email ||
						companyData?.email ||
						companyData?.Email ||
						formReducer?.user['business-details']?.Email ||
						'', // business_industry_type: 20,
					contact: applicantData?.mobileNo || companyData?.mobileNo || '',

					businesspancardnumber:
						applicantData?.panNumber || companyData?.panNumber || '',
					// // crime_check: "Yes",
					gstin:
						data['business-details']?.GSTVerification ||
						formReducer?.user['business-details']?.GSTVerification ||
						'',
					businessstartdate:
						data['business-details']?.BusinessVintage ||
						formReducer?.user['business-details']?.BusinessVintage ||
						'',
					// corporateid: companyData.CIN
					marital_status: form?.maritalStatus,
					residence_status: form?.residenceStatus,
					country_residence: form?.countryResidence,
					business_name_last:
						applicantData?.lasName || companyData?.lastName || '',
					aadhaar:
						formstate?.values?.aadhaarUnMasked ||
						applicantData?.aadhaar ||
						companyData?.aadhaar ||
						'',
					equifaxscore: form?.equifaxscore || applicantData?.equifaxscore || '',
				};
				if (corporateDetails && corporateDetails.id) {
					newBusinessDetails.corporateId = corporateDetails.id;
				}
				if (editLoan && editLoan?.business_id && editLoan?.business_id?.id) {
					newBusinessDetails.businessid = editLoan?.business_id?.id;
					newBusinessDetails.business_id = editLoan?.business_id?.id;
				}
				if (sessionStorage.getItem('business_id')) {
					newBusinessDetails.business_id =
						sessionStorage.getItem('business_id') || '';
					newBusinessDetails.businessid =
						sessionStorage.getItem('business_id') || '';
				}
				if (sessionStorage.getItem('aadhaar_otp_res')) {
					try {
						newBusinessDetails.aadhaar_otp_res =
							JSON.parse(sessionStorage.getItem('aadhaar_otp_res'))?.data ||
							null;
					} catch (err) {
						return err;
					}
				}
				const reqTypes = ['DL', 'voter', 'passport'];
				const selectedDoc = data.documents.filter(d =>
					reqTypes.includes(d.req_type)
				);
				selectedDoc.map(doc => {
					if (doc.dl_no) newBusinessDetails.dl = doc.dl_no;
					if (doc.vid) newBusinessDetails.voter = doc.vid;
					if (doc.passport_no) newBusinessDetails.passport = doc.passport_no;
					return null;
				});
				return newBusinessDetails;
			} catch (error) {
				console.error('businessDetails-', error);
				return {};
			}
		};
		// console.log('-----------temp4-------------');

		if (!companyData) {
			companyData =
				sessionStorage.getItem('companyData') &&
				JSON.parse(sessionStorage.getItem('companyData'));
		}

		const addressArrayMulti =
			(applicantData &&
				applicantData?.address &&
				applicantData?.address.length > 0 &&
				applicantData?.address.map(ele => {
					return {
						line1: ele.address1,
						line2: ele.address2,
						locality: ele?.address3 || ele?.city,
						city: ele.city,
						state: ele.state,
						pincode: ele.pinCode,
						addressType: ele.addressType,
						aid: ele.aid,
					};
				})) ||
			[];
		// console.log('-----------temp5-------------');
		let addressArrayUni = addressArrayMulti.filter(ele => ele.pincode); //only pincode addressfiltering

		addressArrayUni =
			addressArrayUni.length === 1
				? addressArrayUni.map(ele => {
						return { ...ele, addressType: 'present', aid: 1 };
				  })
				: addressArrayUni;
		// console.log('-----------temp6-------------');
		const { loanAmount, tenure, ...restLoanData } = loanData;
		const business_income_type_id =
			applicantData?.incomeType || companyData?.BusinessType;
		let annual_incnome = 0;
		if (applicantData?.annualIncome && applicantData?.annualIncome !== '0') {
			annual_incnome = applicantData?.annualIncome;
		}

		let gross_income = 0;
		if (applicantData?.grossIncome && applicantData?.grossIncome !== '0')
			gross_income = applicantData?.grossIncome;
		// console.log('-----------temp7-------------');
		const formatedData = {
			Business_details: businessDetails() || null,
			businessaddress: addressArrayUni.length > 0 ? addressArrayUni : [],
			// busniess && busniess.Address
			// 	? {
			// 			city: busniess && busniess.Address.city,
			// 			line1:
			// 				busniess &&
			// 				`${busniess.Address.flno} ${busniess.Address.lg} ${
			// 					busniess.Address.bnm
			// 				} ${busniess.Address.bno} ${busniess.Address.dst} `,
			// 			locality: busniess && busniess.Address.loc,
			// 			pincode: busniess && busniess.Address.pncd,
			// 			state: busniess && busniess.Address.st,
			// 	  }
			// 	: {}
			director_details: {},

			loan_details: {
				collateral: collateralData,
				// loan_type_id: 1,
				// case_priority: null,
				// loan_product_id: "10",
				// loan_request_type: "1",
				origin: 'nconboarding',
				...restLoanData,

				loan_product_id:
					productId[business_income_type_id] ||
					productId[(form?.incomeType)] ||
					productId[idType],
				white_label_id: sessionStorage.getItem('encryptWhiteLabel'),
				branchId:
					loan?.branchId ||
					formReducer?.user?.['vehicle-loan-details']?.branchId ||
					loanData?.branchId ||
					data['business-loan-details']?.branchId ||
					'',
				loan_amount: getAmount(
					loanData?.loanAmount ||
						loan?.loanAmount ||
						data['business-loan-details']?.LoanAmount ||
						data['vehicle-loan-details']?.loanAmount ||
						formReducer?.user?.['vehicle-loan-details']?.loanAmount ||
						formReducer?.user['business-loan-details']?.LoanAmount ||
						0
				), //loan.loanAmount,
				loan_amount_um: getAmountUm(
					+loanData?.loanAmount ||
						+loan?.loanAmount ||
						+data['business-loan-details']?.LoanAmount ||
						+data['vehicle-loan-details']?.loanAmount ||
						+formReducer?.user?.['vehicle-loan-details']?.loanAmount ||
						+formReducer?.user['business-loan-details']?.LoanAmount
				),
				applied_tenure:
					loan?.tenure ||
					data['business-loan-details']?.tenure ||
					data['vehicle-loan-details']?.tenure ||
					formReducer?.user?.['vehicle-loan-details']?.tenure ||
					formReducer?.user['business-loan-details']?.tenure ||
					0,

				annual_turn_over: getAmount(
					annual_incnome ||
						gross_income ||
						data?.['business-details']?.AnnualTurnover ||
						formReducer?.user['business-details']?.AnnualTurnover ||
						''
				),
				revenue_um: getAmountUm(
					annual_incnome ||
						gross_income ||
						data?.['business-details']?.AnnualTurnover ||
						formReducer?.user['business-details']?.AnnualTurnover ||
						''
				),

				annual_op_expense: getAmount(
					applicantData?.netMonthlyIncome ||
						data?.['business-details']?.PAT ||
						formReducer?.user['business-details']?.PAT ||
						''
				),
				op_expense_um: getAmountUm(
					applicantData?.netMonthlyIncome ||
						data?.['business-details']?.PAT ||
						formReducer?.user['business-details']?.PAT ||
						''
				),
				// annual_revenue: applicantData?.grossIncome || 0,
				//loan.loanAmount?.tenure
				// application_ref: data['business-loan-details'].Applicationid || '',
				// annual_turn_over: data?.['business-details'].AnnualTurnover,
				// annual_op_expense: data?.['business-details'].PAT
				// loan_type_id: 1,
				// case_priority: null,
				// origin: "New_UI",
			},
			documents: {
				KYC: fileStructure(uploaddedDoc || [], CATEGORY_KYC),
				financials: fileStructure(uploaddedDoc || [], CATEGORY_FINANCIAL),
				others: fileStructure(uploaddedDoc || [], CATEGORY_OTHER),
			},
			branchId: companyData?.branchId,
		};
		// console.log('-----------temp8-------------');
		if (editLoan && editLoan?.id) {
			formatedData.loan_details.loanId = editLoan?.id;
			formatedData.Collaterals = {
				property_type: editLoan?.loan_asset_type,
				assets_value: editLoan?.assets_value,
				assets_value_um: editLoan?.assets_value_um,
			};
			formatedData.financials = {
				annual_op_expense: editLoan?.annual_op_expense,
				op_expense_um: editLoan?.op_expense_um,
				gross_revenue: editLoan?.annual_revenue,
				gross_revenue_um: editLoan?.revenue_um,
			};
		}
		// console.log('-----------temp9-------------');
		if (guarantorData?.applicantData) {
			formatedData.director_details.director_0 = {
				dfirstname: guarantorData?.applicantData?.firstName || '',
				dlastname: guarantorData?.applicantData?.lastName || '',
				dpancard: guarantorData?.applicantData?.panNumber || '',
				ddob: guarantorData?.applicantData?.dob || '', // '12-06-1994'
				daadhaar: guarantorData?.applicantData?.aadhaar || '',
				demail: guarantorData?.applicantData?.email || '',
				dcontact: guarantorData?.applicantData?.mobileNo || '',
				crime_check: null,
				address1: guarantorData?.applicantData?.address[0]?.address1 || '',
				address2: guarantorData?.applicantData?.address[0]?.address2 || '',
				address3: guarantorData?.applicantData?.address[0]?.address3 || '', // api key missing
				city: guarantorData?.applicantData?.address[0]?.city || '',
				state: guarantorData?.applicantData?.address[0]?.state || '',
				pincode: guarantorData?.applicantData?.address[0]?.pinCode || '',
				residenceStatusGuarantor:
					guarantorData?.applicantData?.residenceStatusGuarantor || '',
				maritalStatusGuarantor:
					guarantorData?.applicantData?.maritalStatusGuarantor || '',
				countryResidenceGuarantor:
					guarantorData?.applicantData?.countryResidenceGuarantor || '',
				incomeType: guarantorData?.applicantData?.incomeType || '',
				ddin_no: null,
				type_name: 'Guarantor',
				residence_status:
					guarantorData?.applicantData?.residenceStatusGuarantor || '',
				marital_status:
					guarantorData?.applicantData?.maritalStatusGuarantor || '',
				country_residence:
					guarantorData?.applicantData?.countryResidenceGuarantor || '',
				income_type: guarantorData?.applicantData?.incomeType || '',
				//values["Applicant", "Co-applicant", "Director", "Partner", "Guarantor", "Trustee", "Member", "Proprietor"],
			};
		}
		// console.log('-----------temp10-------------');
		if (editLoan && editLoan?.id && guarantorData?.applicantData) {
			const editGuarantor =
				editLoan?.director_details?.filter(
					d => d.type_name === 'Guarantor'
				)?.[0] || {};
			formatedData.director_details.director_0.id = editGuarantor?.id || null;
		}
		// console.log('-----------temp11-------------');
		if (authentication_otp_res) {
			formatedData.auth_details = authentication_otp_res;
		}
		// console.log('-----------temp13-------------');
		return formatedData;
	} catch (error) {
		console.error('caseCreationDataFormat-', error);
		return {};
	}
};

export const subsidiaryDataFormat = (caseId, data, editLoan) => {
	const userToken = sessionStorage.getItem(HOSTNAME);
	const formReducer = JSON.parse(userToken)?.formReducer;
	if (
		!(
			data['subsidiary-details']?.SubsidiaryName &&
			data['subsidiary-details']?.BankName
		) &&
		!(
			formReducer?.user['subsidiary-details']?.SubsidiaryName &&
			formReducer?.user['subsidiary-details']?.BankName
		)
	) {
		return false;
	}
	let bank =
		data['subsidiary-details']?.BankName ||
		formReducer?.user['subsidiary-details']?.BankName;
	const formatedData = {
		case_id: caseId,
		account_number:
			data['subsidiary-details']?.AccountNumber ||
			formReducer?.user['subsidiary-details']?.AccountNumber,
		subsidiary_name:
			data['subsidiary-details']?.SubsidiaryName ||
			formReducer?.user['subsidiary-details']?.SubsidiaryName,
		bank_name: typeof bank === 'object' ? Number(bank?.value) : bank,
		relative:
			data['subsidiary-details']?.RelationSubsidiary ||
			formReducer?.user['subsidiary-details']?.RelationSubsidiary,
	};
	if (editLoan) {
		formatedData.id = editLoan?.subsidiary_details?.[0]?.id;
		formatedData.business_id = editLoan?.business_id?.id;
		formatedData.loan_id = editLoan?.id;
	}
	return formatedData;
};

export const bankDetailsDataFormat = (caseId, data, editLoan) => {
	const userToken = sessionStorage.getItem(HOSTNAME);
	const formReducer = JSON.parse(userToken)?.formReducer;
	let bank =
		data['bank-details']?.BankName ||
		formReducer?.user['bank-details']?.BankName ||
		'';
	const formatedData = {
		case_id: caseId,
		emiDetails: data['emi-details'] || formReducer?.user['emi-details'] || '',
		account_number:
			data['bank-details']?.AccountNumber ||
			formReducer?.user['bank-details']?.AccountNumber ||
			'',
		// subsidiary_name: data['bank-details'].,
		ifsccode:
			data['bank-details']?.ifsccode ||
			formReducer?.user['bank-details']?.ifsccode ||
			'',
		bank_name:
			typeof bank === 'object' ? Number(bank?.value) : bank?.BankName || '',
		account_holder_name:
			data['bank-details']?.AccountHolderName ||
			formReducer?.user['bank-details']?.AccountHolderName ||
			'',
		account_type:
			data['bank-details']?.AccountType ||
			formReducer?.user['bank-details']?.AccountType ||
			'',
		start_date:
			data['bank-details']?.StartDate ||
			formReducer?.user['bank-details']?.StartDate ||
			'',
		end_date:
			data['bank-details']?.EndDate ||
			formReducer?.user['bank-details']?.EndDate ||
			'',
	};
	if (editLoan && editLoan?.loan_ref_id) {
		formatedData.fin_id = editLoan?.bank_details?.[0]?.id;
		formatedData.business_id = editLoan?.business_id?.id;
		formatedData.loan_id = editLoan?.id;
	}
	return formatedData;
};

export const shareHolderDataFormat = (businessId, data, editLoan) => {
	const userToken = sessionStorage.getItem(HOSTNAME);
	const formReducer = JSON.parse(userToken)?.formReducer;
	if (
		!(
			data['shareholder-details']?.ShareholderPercentage &&
			data['shareholder-details']?.ShareholderName
		) &&
		!(
			formReducer?.user['shareholder-details']?.ShareholderPercentage &&
			formReducer?.user['shareholder-details']?.ShareholderName
		)
	) {
		return false;
	}
	const formatedData = {
		// case_id: caseId,
		percentage:
			data['shareholder-details']?.ShareholderPercentage ||
			formReducer?.user['shareholder-details']?.ShareholderPercentage,
		businessID: businessId,
		name:
			data['shareholder-details']?.ShareholderName ||
			formReducer?.user['shareholder-details']?.ShareholderName,
		relationship:
			data['shareholder-details']?.RelationShareholder ||
			formReducer?.user['shareholder-details']?.RelationShareholder,
		address:
			data['shareholder-details']?.CompanyAddress ||
			formReducer?.user['shareholder-details']?.CompanyAddress,
		pincode:
			data['shareholder-details']?.Pincode ||
			formReducer?.user['shareholder-details']?.Pincode,
	};

	if (editLoan && editLoan?.loan_ref_id) {
		formatedData.id = editLoan?.shareholder_details?.[0]?.id;
		formatedData.business_id = editLoan?.business_id?.id;
		formatedData.loan_id = editLoan?.id;
	}
	return { shareholderData: [formatedData] };
};

export const refereneceDataFormat = (loanId, data, editLoan) => {
	const userToken = sessionStorage.getItem(HOSTNAME);
	const formReducer = JSON.parse(userToken)?.formReducer;
	const loanReferenceData = [];
	const refData1 = {
		ref_name:
			data?.['reference-details']?.Name0 ||
			formReducer?.user?.['reference-details']?.Name0 ||
			'',
		ref_email:
			data?.['reference-details']?.ReferenceEmail0 ||
			formReducer?.user?.['reference-details']?.ReferenceEmail0 ||
			'',
		ref_contact:
			data?.['reference-details']?.ContactNumber0 ||
			formReducer?.user?.['reference-details']?.ContactNumber0 ||
			'',
		ref_state: 'null',
		ref_city: 'null',
		ref_pincode:
			data?.['reference-details']?.Pincode0 ||
			formReducer?.user?.['reference-details']?.Pincode0 ||
			'',
		ref_type:
			data?.['reference-details']?.ref_type0 ||
			formReducer?.user?.['reference-details']?.ref_type0 ||
			'',
		ref_locality: 'null',
		reference_truecaller_info: '',
	};

	if (refData1.ref_name && refData1.ref_contact) {
		if (editLoan && editLoan?.loan_ref_id) {
			refData1.id = editLoan?.reference_details?.[0]?.id;
		}
		loanReferenceData.push(refData1);
	}

	const refData2 = {
		ref_name:
			data?.['reference-details']?.Name1 ||
			formReducer?.user?.['reference-details']?.Name1 ||
			'',
		ref_email:
			data?.['reference-details']?.ReferenceEmail1 ||
			formReducer?.user?.['reference-details']?.ReferenceEmail1 ||
			'',
		ref_contact:
			data?.['reference-details']?.ContactNumber1 ||
			formReducer?.user?.['reference-details']?.ContactNumber1 ||
			'',
		ref_state: 'null',
		ref_city: 'null',
		ref_pincode:
			data?.['reference-details']?.Pincode1 ||
			formReducer?.user?.['reference-details']?.Pincode1 ||
			'',
		ref_type:
			data?.['reference-details']?.ref_type1 ||
			formReducer?.user?.['reference-details']?.ref_type1 ||
			'',
		ref_locality: 'null',
		reference_truecaller_info: '',
	};

	if (refData2.ref_name && refData2.ref_contact) {
		if (editLoan && editLoan?.loan_ref_id) {
			refData2.id = editLoan?.reference_details?.[1]?.id;
		}
		loanReferenceData.push(refData2);
	}
	const formatedData = {
		loanId: loanId,
		loanReferenceData: loanReferenceData,
	};

	if (editLoan && editLoan?.loan_ref_id) {
		formatedData.case_id = editLoan?.loan_ref_id;
		formatedData.business_id = editLoan?.business_id?.id;
		formatedData.loan_id = editLoan?.id;
	}
	return formatedData;
};
