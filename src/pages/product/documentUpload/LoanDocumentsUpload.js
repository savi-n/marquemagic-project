// active page
import { useState, useContext, useEffect, Fragment } from 'react';
import styled from 'styled-components';

import { LoanFormContext } from '../../../reducer/loanFormDataReducer';
import Button from '../../../components/Button';
import CheckBox from '../../../shared/components/Checkbox/CheckBox';
import FileUpload from '../../../shared/components/FileUpload/FileUpload';
import {
	DOCS_UPLOAD_URL,
	BORROWER_UPLOAD_URL,
	BUSSINESS_LOAN_CASE_CREATION,
	UPDATE_LOAN_ASSETS,
	NC_STATUS_CODE,
	ADD_SUBSIDIARY_DETAILS,
	ADD_BANK_DETAILS,
	ADD_SHAREHOLDER_DETAILS,
	ADD_REFENCE_DETAILS,
	DOCTYPES_FETCH,
	USER_ROLES,
	PINCODE_ADRRESS_FETCH,
	WHITELABEL_ENCRYPTION_API,
	CIN_UPDATE,
	BUSSINESS_LOAN_CASE_CREATION_EDIT,
	UPLOAD_CACHE_DOCS,
} from '../../../_config/app.config';
import { DOCUMENTS_TYPE } from '../../../_config/key.config';
import useFetch from '../../../hooks/useFetch';
import { useToasts } from '../../../components/Toast/ToastProvider';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { AppContext } from '../../../reducer/appReducer';
import { FormContext } from '../../../reducer/formReducer';
import BankStatementModal from '../../../components/BankStatementModal';
import { CaseContext } from '../../../reducer/caseReducer';
import { UserContext } from '../../../reducer/userReducer';
import downArray from '../../../assets/icons/down_arrow_grey_icon.png';
import Loading from '../../../components/Loading';

const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
	@media (max-width: 700px) {
		padding: 50px 0px;
		max-width: 100%;
	}
`;

const DocTypeHead = styled.div`
	font-weight: 600;
	margin: 10px 0;
`;

const Colom2 = styled.div`
	width: 30%;
	background: rgba(0, 0, 0, 0.1);
	padding: 50px 30px;
`;

const UploadWrapper = styled.div`
	margin: 30px 0;
	position: relative;
	max-width: 100%;
	max-height: ${props => (props.open ? '100%' : '0%')};
	display: ${props => (props.open ? 'block' : 'none')};
`;

const Details = styled.div`
	max-height: ${props => (props.open ? '100%' : '0%')};
	padding: ${props => (props.open ? '10px 0' : '0')};
	transition: all 0.3s ease-out;
	@media (max-width: 700px) {
		max-width: 51%;
		padding: 0px;
	}
`;

// const ButtonWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   flex-wrap: wrap;
//   gap: 10px;
//   margin: 10px 0;
// `;

// const CheckboxWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   flex-direction: column;
//   margin: 20px 0;
//   gap: 10px;
// `;

const SubmitWrapper = styled.div`
	display: flex;
	align-items: center;
	margin: 10px 0;
	gap: 10px;
`;

const DocsCheckboxWrapper = styled.div`
	margin: 20px 0;
`;

const H = styled.h1`
	font-size: 1.5em;
	font-weight: 500;
	margin-bottom: 20px;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const H1 = styled.h1`
	font-size: 1em;
	font-weight: 600;
	margin-right: 20px;
	span {
		color: ${({ theme }) => theme.main_theme_color};
	}
`;

const CheckboxWrapper = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: column;
	margin: 20px 0;
	gap: 10px;
`;

const Doc = styled.h2`
	font-size: 1.2em;
	font-weight: 500;
`;

const Section = styled.div`
	display: flex;
	align-items: center;
	cursor: row-resize;
`;

const CollapseIcon = styled.img`
	height: 18px;
	width: 18px;
	margin-right: 20px;
	object-fit: contain;

	cursor: pointer;
`;

const Hr = styled.hr`
	padding: 0px;
`;
const StyledButton = styled.button`
	/* height: 25px; */
	margin: 5px;
	color: ${({ theme, fill }) => (fill ? 'white' : '#0068FF')};
	border: 2px solid
		${({ theme, fill }) =>
			fill && (typeof fill === 'string' ? fill : '#0068FF')};
	border-radius: 40px;
	padding: 0 20px;
	background: ${({ theme, fill }) =>
		fill && (typeof fill === 'string' ? fill : '#0068FF')};
	display: flex;
	align-items: center;
	min-width: ${({ width }) => (width ? width : '200px')};
	justify-content: space-between;
	font-size: 1rem;
	font-weight: 500;
	text-align: center;
	transition: 0.2s;
	display: flex;
	justify-content: center;
	@media (max-width: 700px) {
		width: 7rem;
		padding: 0 10px;
	}
`;

const LoaderWrapper = styled.div`
	height: 200px;
	display: flex;
	justify-content: center;
	text-align: center;
`;

const textForCheckbox = {
	grantCibilAcces: 'I here by give consent to pull my CIBIL records',
	declaration:
		'I here do declare that what is stated above is true to the best of my knowledge and  belief',
};

function fileStructure(documents, type) {
	return documents
		.filter(file => file.mainType === type)
		.map(file => ({
			// value, filename, fd, password
			fd: file.document_key, //fd from loan document repsone
			size: file.size, //size from loan document repsone
			doc_type_id: file.doc_type_id,
			// type: "",
			filename: file.upload_doc_name, //fd from loan document repsone
			// status: "",
			// field: "",
			value: file.doc_type_id || file.typeId, // doctype_id
			password: file?.password,
		}));
}

let url = window.location.hostname;
let userToken = sessionStorage.getItem(url);
// console.log('loan-doc-upload-userToken-', {
// 	userToken,
// 	userTokenParsed: JSON.parse(userToken),
// });
let loan = JSON.parse(userToken)?.formReducer?.user?.loanData;
let form = JSON.parse(userToken)?.formReducer?.user?.applicantData;
let busniess = JSON.parse(sessionStorage.getItem('busniess'));
let editLoan = sessionStorage.getItem('editLoan')
	? JSON.parse(sessionStorage.getItem('editLoan'))
	: {};

// const getAmountUm = a => {
// 	if (a > 99999) {
// 		return 'Lakhs';
// 	} else {
// 		return '';
// 	}
// };
const getAmountUm = a => {
	if (a >= 99999 && a <= 9999999) {
		return 'Lakhs';
	} else if (a <= 999999999 && a >= 1000000) {
		return 'Crores';
	}
};

// const getAmount = a => {
// 	if (a >= 99999) {
// 		return a / 100000;
// 	} else {
// 		return a;
// 	}
// };

const getAmount = a => {
	if (a >= 99999 && a <= 9999999) {
		return a / 100000;
	} else if (a <= 999999999 && a >= 1000000) {
		return a / 10000000;
	}
};
function caseCreationDataFormat(
	data,
	uploaddedDoc,
	companyData,
	productDetails,
	productId
) {
	// console.log('state --', data);
	// console.log('companydetails --', companyData);
	// console.log('proddetails --', productDetails);
	// console.log('prodid --', productId);
	loan = JSON.parse(userToken)?.formReducer?.user?.loanData;
	form = JSON.parse(userToken)?.formReducer?.user?.applicantData;

	url = window.location.hostname;
	userToken = sessionStorage.getItem(url);
	let formReducer = JSON.parse(sessionStorage.getItem(url))?.formReducer;
	let guarantorData = formReducer?.Guarantor;
	let applicantData = formReducer?.user?.applicantData;
	let loanData = formReducer?.user?.loanData;

	editLoan = sessionStorage.getItem('editLoan')
		? JSON.parse(sessionStorage.getItem('editLoan'))
		: {};
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
		productDetails.loanType.loan_request_type === 1 ? 'business' : 'salaried';

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

	const businessDetails = () => {
		let corporateDetails = sessionStorage.getItem('corporateDetails');
		if (corporateDetails) corporateDetails = JSON.parse(corporateDetails);
		if (!companyData) {
			companyData =
				sessionStorage.getItem('companyData') &&
				JSON.parse(sessionStorage.getItem('companyData'));
		}

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
				'',
			// business_industry_type: 20,
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
			maritalStatus: form?.maritalStatus,
			residenceStatus: form?.residenceStatus,
			business_name_last: applicantData?.lasName || companyData?.lastName || '',
			aadhaar: applicantData?.aadhaar || companyData?.aadhaar || '',
			equifaxscore: form?.equifaxscore || applicantData?.equifaxscore || '',
		};
		if (corporateDetails && corporateDetails.id) {
			newBusinessDetails.corporateId = corporateDetails.id;
		}
		if (editLoan && editLoan?.business_id && editLoan?.business_id?.id) {
			newBusinessDetails.businessid = editLoan?.business_id?.id;
		}
		return newBusinessDetails;
	};
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

	let addressArrayUni = addressArrayMulti.filter(ele => ele.pincode); //only pincode addressfiltering
	addressArrayUni =
		addressArrayUni.length === 1
			? addressArrayUni.map(ele => {
					return { ...ele, addressType: 'present', aid: 1 };
			  })
			: addressArrayUni;

	const { loanAmount, tenure, ...restLoanData } = loanData;
	const business_income_type_id =
		applicantData?.incomeType || companyData?.BusinessType;

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
			// origin: "New_UI",
			...restLoanData,
			loan_product_id:
				productId[business_income_type_id] ||
				productId[(form?.incomeType)] ||
				productId[idType],
			white_label_id: sessionStorage.getItem('encryptWhiteLabel'),
			branchId: loan.branchId,
			loan_amount: getAmount(
				loanData?.loanAmount ||
					loan?.loanAmount ||
					data['business-loan-details']?.LoanAmount ||
					data['vehicle-loan-details']?.loanAmount ||
					formReducer?.user['business-loan-details']?.LoanAmount ||
					0
			), //loan.loanAmount,
			loan_amount_um: getAmountUm(
				+loanData?.loanAmount ||
					+loan?.loanAmount ||
					+data['business-loan-details']?.LoanAmount ||
					+data['vehicle-loan-details']?.loanAmount ||
					+formReducer?.user['business-loan-details']?.LoanAmount
			),
			applied_tenure:
				loan?.tenure ||
				data['business-loan-details']?.tenure ||
				data['vehicle-loan-details']?.tenure ||
				formReducer?.user['business-loan-details']?.tenure ||
				0,
			annual_turn_over: getAmount(
				applicantData?.annualIncome ||
					applicantData?.grossIncome ||
					data?.['business-details']?.AnnualTurnover ||
					formReducer?.user['business-details']?.AnnualTurnover ||
					''
			),
			revenue_um: getAmountUm(
				applicantData?.annualIncome ||
					applicantData?.grossIncome ||
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
			KYC: fileStructure(uploaddedDoc || [], 'KYC'),
			others: fileStructure(uploaddedDoc || [], 'Others'),
			financials: fileStructure(uploaddedDoc || [], 'Financial'),
		},
		branchId: companyData?.branchId,
	};
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
			ddin_no: null,
			type_name: 'Guarantor',
			//values["Applicant", "Co-applicant", "Director", "Partner", "Guarantor", "Trustee", "Member", "Proprietor"],
		};
	}
	if (editLoan && editLoan?.id) {
		formatedData.director_details.director_0.id =
			editLoan?.director_details[0]?.id || null;
	}
	// if (sessionStorage.getItem('product') != 'demo') {
	// 	formatedData['branchId'] = companyData.branchId;
	// }

	return formatedData;
}

function subsidiaryDataFormat(caseId, data) {
	if (
		!(
			data['subsidiary-details']?.SubsidiaryName &&
			data['subsidiary-details']?.BankName
		)
	) {
		return false;
	}
	const formatedData = {
		case_id: caseId,
		account_number: data['subsidiary-details']?.AccountNumber,
		subsidiary_name: data['subsidiary-details']?.SubsidiaryName,
		bank_name:
			typeof data['subsidiary-details']?.BankName === 'object'
				? Number(data['subsidiary-details']?.BankName?.value)
				: data['subsidiary-details']?.BankName,
		relative: data['subsidiary-details']?.Relation,
	};

	return formatedData;
}

function bankDetailsDataFormat(caseId, data) {
	if (data['vehicle-loan-details']) {
		if (!data['emi-details']) {
			return false;
		}
		const formatedData = {
			emiDetails: data['emi-details'],
			case_id: caseId,
			// bank_name: data[`vehicle-loan-details`].branchId,
		};
		return formatedData;
	}
	if (
		!data['bank-details']?.AccountNumber &&
		!data['bank-details']?.BankName &&
		!data['bank-details']?.AccountHolderName
	) {
		return false;
	}

	const formatedData = {
		case_id: caseId,
		emiDetails: data['emi-details'],
		account_number: data['bank-details']?.AccountNumber,
		// subsidiary_name: data['bank-details'].,
		bank_name:
			typeof data['bank-details']?.BankName === 'object'
				? Number(data['bank-details']?.BankName?.value)
				: data['bank-details']?.BankName,
		account_holder_name: data['bank-details']?.AccountHolderName,
		account_type: data['bank-details']?.AccountType,
		start_date: data['bank-details']?.StartDate,
		end_date: data['bank-details']?.EndDate,
		// limit_type: data['bank-details'],
		// sanction_limit: data['bank-details'],
		// drawing_limit: data['bank-details'],
		// IFSC: "",
	};

	return formatedData;
}

function shareHolderDataFormat(businessId, data) {
	if (
		!(
			data['shareholder-details']?.ShareholderPercentage &&
			data['shareholder-details']?.ShareholderName
		)
	) {
		return false;
	}
	const formatedData = {
		// case_id: caseId,
		percentage: data['shareholder-details']?.ShareholderPercentage,
		businessID: businessId,
		name: data['shareholder-details']?.ShareholderName,
		relationship: data['shareholder-details']?.Relation,
		address: data['shareholder-details']?.CompanyAddress,
		pincode: data['shareholder-details']?.Pincode,
	};

	return { shareholderData: [formatedData] };
}

function refereneceDataFormat(loanId, data) {
	const loanReferenceData = [];
	if (
		data['reference-details']?.Name0 &&
		data['reference-details']?.ReferenceEmail0 &&
		data['reference-details']?.ContactNumber0 &&
		data['reference-details']?.Pincode0
	) {
		loanReferenceData.push({
			ref_name: data['reference-details']?.Name0,
			ref_email: data['reference-details']?.ReferenceEmail0,
			ref_contact: data['reference-details'].ContactNumber0,
			ref_state: 'null',
			ref_city: 'null',
			ref_pincode: data['reference-details']?.Pincode0,
			ref_locality: 'null',
			reference_truecaller_info: '',
		});
	}

	if (
		data['reference-details']?.Name1 &&
		data['reference-details']?.ReferenceEmail1 &&
		data['reference-details']?.ContactNumber1 &&
		data['reference-details']?.Pincode1
	) {
		loanReferenceData.push({
			ref_name: data['reference-details']?.Name1,
			ref_email: data['reference-details']?.ReferenceEmail1,
			ref_contact: data['reference-details'].ContactNumber1,
			ref_state: 'null',
			ref_city: 'null',
			ref_pincode: data['reference-details']?.Pincode1,
			ref_locality: 'null',
			reference_truecaller_info: '',
		});
	}

	const formatedData = {
		loanId: loanId,
		loanReferenceData: loanReferenceData,
	};

	return formatedData;
}

export default function DocumentUpload({
	productDetails,
	userType,
	id,
	onFlowChange,
	map,
	productId,
}) {
	const {
		state,
		actions: { setLoanDocuments, removeLoanDocument, setLoanDocumentType },
	} = useContext(LoanFormContext);

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const {
		state: { flowMap },
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setLoanRef },
	} = useContext(CaseContext);
	const {
		state: { clientToken },
	} = useContext(AppContext);

	const [cibilCheckbox, setCibilCheckbox] = useState(false);
	const [message, setMessage] = useState('');
	const [declareCheck, setDeclareCheck] = useState(false);

	const [otherBankStatementModal, setOtherBankStatementModal] = useState(false);
	const [cibilCheckModal, setCibilCheckModal] = useState(false);
	const idType =
		productDetails.loanType.loan_request_type === 1 ? 'business' : 'salaried';

	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const [caseCreationProgress, setCaseCreationProgress] = useState(false);
	const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
	const onOtherStatementModalToggle = () => {
		setOtherBankStatementModal(!otherBankStatementModal);
	};
	const [openKycdoc, setOpenKycDoc] = useState(true);
	const [openFinancialdoc, setOpenFinancialDoc] = useState(false);
	const [openOtherdoc, setOpenOtherDoc] = useState(false);

	const [KycDocOptions, setKycDocOptions] = useState([]);
	const [FinancialDocOptions, setFinancialDocOptions] = useState([]);
	const [OtherDocOptions, setOtherDocOptions] = useState([]);
	const [prefilledKycDocs, setPrefilledKycDocs] = useState([]);
	const [prefilledFinancialDocs, setPrefilledFinancialDocs] = useState([]);
	const [prefilledOtherDocs, setPrefilledOtherDocs] = useState([]);
	// const [documentChecklist, setDocumentChecklist] = useState([]);
	const [startingKYCDoc, setStartingKYCDoc] = useState([]);
	const [startingFinDoc, setStartingFinDoc] = useState([]);
	const [startingOtherDoc, setStartingOtherDoc] = useState([]);
	const [startingUnTaggedKYCDocs, setStartingUnTaggedKYCDocs] = useState([]);
	const [startingUnTaggedFinDocs, setStartingUnTaggedFinDocs] = useState([]);
	const [startingUnTaggedOtherDocs, setStartingUnTaggedOtherDocs] = useState(
		[]
	);
	const [loading, setLoading] = useState(false);

	let applicantData = JSON.parse(sessionStorage.getItem(url))?.formReducer?.user
		.applicantData;
	const companyData =
		sessionStorage.getItem('companyData') &&
		JSON.parse(sessionStorage.getItem('companyData'));
	const API_TOKEN = sessionStorage.getItem('userToken');
	let corporateDetails = sessionStorage.getItem('corporateDetails');
	if (corporateDetails) corporateDetails = JSON.parse(corporateDetails);

	const business_income_type_id =
		applicantData?.incomeType ||
		state['business-details']?.BusinessType ||
		companyData?.BusinessType;

	// console.log('LoanDocumentsUpload-allstates-', {
	// 	state,
	// 	business_income_type_id,
	// 	productId,
	// 	form,
	// 	loan_product:
	// 		productId[business_income_type_id] ||
	// 		productId[(form?.incomeType)] ||
	// 		productId[idType],
	// });

	const { response } = useFetch({
		url: DOCTYPES_FETCH,
		options: {
			method: 'POST',
			data: {
				business_type: business_income_type_id,
				loan_product:
					productId[business_income_type_id] ||
					productId[(form?.incomeType)] ||
					productId[idType],
			},
		},
		headers: {
			Authorization: `Bearer ${API_TOKEN}`,
			// Authorization: `Bearer ${JSON.parse(userToken) &&
			// 	JSON.parse(userToken).userReducer &&
			// 	JSON.parse(userToken).userReducer?.userToken}`,
		},
	});

	const getWhiteLabel = async () => {
		const encryptWhiteLabelReq = await newRequest(
			WHITELABEL_ENCRYPTION_API,
			{
				method: 'GET',
			},
			{
				Authorization: `Bearer ${API_TOKEN}`,
				// Authorization: `Bearer ${JSON.parse(userToken) &&
				// 	JSON.parse(userToken).userReducer &&
				// 	JSON.parse(userToken).userReducer?.userToken}`,
			}
		);

		const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

		sessionStorage.setItem(
			'encryptWhiteLabel',
			encryptWhiteLabelRes.encrypted_whitelabel[0]
		);
	};

	useEffect(() => {
		const startingDocs = state.documents;
		// console.log('loan-doc-upload-useEffect-', {
		// 	startingDocs,
		// 	flowMap,
		// 	business_income_type_id,
		// });
		const flowDocTypeMappingList = {};

		const JSON_PAN_SECTION = flowMap?.['pan-verification']?.fields || [];
		for (const key in JSON_PAN_SECTION) {
			JSON_PAN_SECTION[key]?.data?.map(d => {
				if (d.req_type && d.doc_type[`${business_income_type_id}`]) {
					flowDocTypeMappingList[`${d.req_type}`] =
						d.doc_type[`${business_income_type_id}`];
				}
				return null;
			});
		}
		const newKycDocs = [];
		const newFinDocs = [];
		const newOtherDocs = [];
		const newKycUnTagDocs = [];
		const newFinUnTagDocs = [];
		const newOtherUnTagDocs = [];
		if (startingDocs.length > 0) {
			/* map typeId here for req_type: pan/aadhar/voter/DL property doc */
			startingDocs.map((doc, docIndex) => {
				const newDoc = {
					...doc,
					name: doc.upload_doc_name,
					progress: '100',
					status: 'completed',
					file: null,
					typeId: doc.typeId || flowDocTypeMappingList[`${doc.req_type}`] || '',
				};
				if (newDoc.typeId) startingDocs[docIndex].typeId = newDoc.typeId;
				// console.log('startingDoc-', { doc, newDoc });
				if (newDoc.mainType == 'KYC') newKycDocs.push(newDoc);
				else if (newDoc.mainType == 'Financial') newFinDocs.push(newDoc);
				else if (newDoc.mainType == 'Others') newOtherDocs.push(newDoc);
				else {
					if (newDoc.sectionType === 'kyc') newKycUnTagDocs.push(newDoc);
					else if (newDoc.sectionType === 'financial')
						newFinUnTagDocs.push(newDoc);
					else if (newDoc.sectionType === 'others')
						newOtherUnTagDocs.push(newDoc);
				}
			});
		}
		// console.log('loan-doc-upload-useEffect-', {
		// 	flowDocTypeMappingList,
		// 	newKycDocs,
		// 	newFinDocs,
		// 	newOtherDocs,
		// 	newKycUnTagDocs,
		// 	newFinUnTagDocs,
		// 	newOtherUnTagDocs,
		// });
		setStartingKYCDoc(newKycDocs);
		setStartingFinDoc(newFinDocs);
		setStartingOtherDoc(newOtherDocs);
		setStartingUnTaggedKYCDocs(newKycUnTagDocs);
		setStartingUnTaggedFinDocs(newFinUnTagDocs);
		setStartingUnTaggedOtherDocs(newOtherUnTagDocs);
		getWhiteLabel();
	}, []);

	useEffect(() => {
		setLoading(true);
		if (response) {
			// disabled looks unsed code
			// const getAddressDetails = async () => {
			// 	const response = await newRequest(
			// 		PINCODE_ADRRESS_FETCH({ pinCode: busniess.Address?.pncd || '' }),
			// 		{}
			// 	);
			// 	const data = response.data;

			// 	busniess = {
			// 		...busniess,
			// 		Address: {
			// 			...busniess.Address,
			// 			st: data?.state?.[0],
			// 			city: data?.district?.[0],
			// 		},
			// 	};
			// };

			// if (busniess && busniess.Address) {
			// 	getAddressDetails();
			// }

			let optionArray = [];
			DOCUMENTS_TYPE.forEach(docType => {
				optionArray = [
					...optionArray,
					...response?.[docType[1]]?.map(dT => ({
						value: dT.doc_type_id,
						name: dT.name,
						main: docType[0],
					})),
				];
			});
			const kycDocDropdown = [];
			const financialDocDropdown = [];
			const otherDocDropdown = [];
			const kycDocIds = [];
			const finDocIds = [];
			const othDocIds = [];
			optionArray.map(ele => {
				if (ele.main === 'KYC') {
					kycDocDropdown.push(ele);
					kycDocIds.push(ele.value);
				}
				if (ele.main === 'Financial') {
					financialDocDropdown.push(ele);
					finDocIds.push(ele.value);
				}
				if (ele.main === 'Others') {
					otherDocDropdown.push(ele);
					othDocIds.push(ele.value);
				}
			});
			setKycDocOptions(kycDocDropdown);
			setFinancialDocOptions(financialDocDropdown);
			setOtherDocOptions(otherDocDropdown);
			setDocumentTypeOptions(optionArray);

			// console.log('loanducmentupload-response-', { kycDocDropdown, editLoan });
			if (
				editLoan &&
				editLoan?.loan_document &&
				editLoan?.loan_document?.length > 0
			) {
				const newKyc = [];
				const newFin = [];
				const newOtr = [];
				editLoan.loan_document.map(doc => {
					const newDoc = {
						...doc,
						name: doc.original_doc_name,
						progress: '100',
						status: 'completed',
						file: null,
					};
					if (kycDocIds.includes(newDoc.doctype)) newKyc.push(newDoc);
					else if (finDocIds.includes(newDoc.doctype)) newFin.push(newDoc);
					else newOtr.push(newDoc);
					return null;
				});

				setPrefilledKycDocs(newKyc);
				setPrefilledFinancialDocs(newFin);
				setPrefilledOtherDocs(newOtr);
			}
			setLoading(false);
		}
	}, [response]);

	// disabled looks un-used code

	// const onCibilModalClose = (success, data) => {
	// 	if (!success) {
	// 		setCibilCheckbox(false);
	// 	}

	// 	if (success) {
	// 		setUsertypeCibilData(
	// 			{
	// 				cibilScore: data.cibilScore,
	// 				requestId: data.requestId,
	// 			},
	// 			USER_ROLES[userType || 'User']
	// 		);
	// 	}
	// 	addToast({
	// 		message: data.message,
	// 		type: success ? 'success' : 'error',
	// 	});

	// 	setCibilCheckModal(false);
	// };

	// useEffect(() => {
	// 	if (busniess && busniess.Address) {
	// 		const getAddressDetails = async () => {
	// 			const response = await newRequest(
	// 				PINCODE_ADRRESS_FETCH({ pinCode: busniess.Address?.pncd || '' }),
	// 				{}
	// 			);
	// 			const data = response.data;

	// 			busniess = {
	// 				...busniess,
	// 				Address: {
	// 					...busniess.Address,
	// 					st: data?.state?.[0],
	// 					city: data?.district?.[0],
	// 				},
	// 			};
	// 		};
	// 	}
	// }, []);

	// const handleDocumentChecklist = (doc) => {
	//   return (value) => {
	//     if (value) setDocumentChecklist([...documentChecklist, doc]);
	//     else setDocumentChecklist(documentChecklist.filter((d) => d !== doc));
	//   };
	// };

	// step 2: upload docs reference
	// const updateDocumentList = async (loanId, user) => {
	// 	try {
	// 		const uploadDocsReq = await newRequest(
	// 			BORROWER_UPLOAD_URL,
	// 			{
	// 				method: 'POST',
	// 				data: {
	// 					upload_document: state[user]?.uploadedDocs?.map(({ id, ...d }) => ({
	// 						...d,
	// 						loan_id: loanId,
	// 					})),
	// 				},
	// 			},
	// 			{
	// 				//   Authorization: `Bearer ${userToken}`,
	// 			}
	// 		);

	// 		const uploadDocsRes = uploadDocsReq.data;
	// 		if (uploadDocsRes.status === NC_STATUS_CODE.OK) {
	// 			return uploadDocsRes;
	// 		}
	// 		throw new Error(uploadDocsRes.message);
	// 	} catch (err) {
	// 		console.log('STEP: 2 => UPLOAD DOCUMENT REFERENCE ERROR', err.message);
	// 		throw new Error(err.message);
	// 	}
	// };

	const handleFileUpload = async files => {
		setLoanDocuments(files);
	};

	const handleFileRemove = async fileId => {
		removeLoanDocument(fileId);
	};

	const handleDocumentTypeChange = async (fileId, type) => {
		setLoanDocumentType(fileId, type);
	};

	const buttonDisabledStatus = () => {
		return !(cibilCheckbox && declareCheck);
	};

	// step: 1 if applicant submit request createCase
	const createCaseReq = async () => {
		try {
			// in case of edit
			// Business_details - businessid
			// loan_details - loanId
			// director_details - id
			let uploaddedDoc = state.documents.filter(doc => {
				if (!doc.requestId) return doc;
			});
			const reqBody = caseCreationDataFormat(
				{
					...state,
					productId,
				},
				uploaddedDoc,
				companyDetail,
				productDetails,
				productId
			);

			if (sessionStorage.getItem('userDetails')) {
				try {
					reqBody.user_id =
						JSON.parse(sessionStorage.getItem('userDetails'))?.id || null;
				} catch (err) {
					return err;
				}
			}
			// console.log('req body ', reqBody);
			// return;
			const caseReq = await newRequest(
				editLoan && editLoan?.loan_ref_id
					? BUSSINESS_LOAN_CASE_CREATION_EDIT
					: BUSSINESS_LOAN_CASE_CREATION,
				{
					method: 'POST',
					data: reqBody,
				},
				{
					Authorization: `Bearer ${
						JSON.parse(userToken)?.userReducer?.userToken
					}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				const resLoanRefId =
					editLoan?.loan_ref_id || caseReq.data.data.loan_details.loan_ref_id;
				setMessage(resLoanRefId);
				setLoanRef(resLoanRefId);
				const compData =
					sessionStorage.getItem('companyData') &&
					JSON.parse(sessionStorage.getItem('companyData'));

				if (compData && compData.CIN) {
					const reqBody = {
						loan_ref_id: resLoanRefId,
						cin_number: compData.CIN,
					};
					await newRequest(
						CIN_UPDATE,
						{
							method: 'POST',
							data: reqBody,
						},
						{
							Authorization: `Bearer ${
								JSON.parse(userToken)?.userReducer?.userToken
							}`,
						}
					);
				}

				//**** uploadCacheDocuments
				// console.log('LoanDocumentsUpload-UPLOAD_CACHE_DOCS-state', state);
				const uploadCacheDocsArr = [];
				state.documents.map(doc => {
					// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
					if (!doc.typeId) return null;
					if (doc.requestId) {
						const ele = { request_id: doc.requestId, doc_type_id: doc.typeId };
						uploadCacheDocsArr.push(ele);
					}
					return null;
				});
				const uploadCacheDocBody = {
					loan_id: caseRes.data.loan_details.id,
					request_ids_obj: uploadCacheDocsArr,
					user_id: +caseRes.data.loan_details.createdUserId,
				};
				await newRequest(
					UPLOAD_CACHE_DOCS,
					{
						method: 'POST',
						data: uploadCacheDocBody,
					},
					{
						Authorization: clientToken,
					}
				);

				// ends here

				let newCaseRes = caseRes.data;
				if (editLoan && editLoan?.loan_ref_id) {
					newCaseRes = {
						...caseRes.data,
						...editLoan,
						loanId: editLoan?.id,
					};
				}
				return newCaseRes;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.log('STEP: 1 => CASE CREATION ERROR', er.message);
			throw new Error(er.message);
		}
	};

	// step: 2 if subsidary details submit request
	const addSubsidiaryReq = async caseId => {
		const postData = subsidiaryDataFormat(caseId, state);
		if (!postData) {
			return true;
		}
		try {
			const caseReq = await newRequest(
				ADD_SUBSIDIARY_DETAILS,
				{
					method: 'POST',
					data: subsidiaryDataFormat(caseId, state),
				},
				{
					Authorization: `Bearer ${(companyDetail && companyDetail.token) ||
						JSON.parse(userToken)?.userReducer?.userToken}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes.data;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.log('STEP: 2 => CASE CREATION ERRROR', er.message);
			throw new Error(er.message);
		}
	};

	// step: 3 if subsidary details submit request
	const addBankDetailsReq = async caseId => {
		const formData = bankDetailsDataFormat(caseId, state);
		if (!formData) {
			return true;
		}

		try {
			const caseReq = await newRequest(
				ADD_BANK_DETAILS,
				{
					method: 'POST',
					data: formData,
				},
				{
					Authorization: `Bearer ${(companyDetail && companyDetail.token) ||
						JSON.parse(userToken)?.userReducer?.userToken}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes.data;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.log('STEP:3 => ADD BANK DETAILS ERRROR', er.message);
			throw new Error(er.message);
		}
	};

	// step: 4 if subsidary details submit request
	const addShareHolderDetailsReq = async businessId => {
		const formData = shareHolderDataFormat(businessId, state);
		if (!formData) {
			return true;
		}
		try {
			const caseReq = await newRequest(
				ADD_SHAREHOLDER_DETAILS,
				{
					method: 'POST',
					data: formData,
				},
				{
					Authorization: `Bearer ${(companyDetail && companyDetail.token) ||
						JSON.parse(userToken)?.userReducer?.userToken}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes.data;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.log('STEP:3 => ADD BANK DETAILS ERRROR', er.message);
			throw new Error(er.message);
		}
	};

	// step: 5 if subsidary details submit request
	const addReferenceDetailsReq = async loanId => {
		const formData = refereneceDataFormat(loanId, state);
		if (formData.loanReferenceData.length === 0) {
			return true;
		}
		try {
			const caseReq = await newRequest(
				ADD_REFENCE_DETAILS,
				{
					method: 'POST',
					data: formData,
				},
				{
					Authorization: `Bearer ${(companyDetail && companyDetail.token) ||
						JSON.parse(userToken)?.userReducer.userToken}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				return caseRes.data;
			}

			throw new Error(caseRes.message);
		} catch (er) {
			console.log('STEP:3 => ADD BANK DETAILS ERRROR', er.message);
			throw new Error(er.message);
		}
	};

	const caseCreationSteps = async data => {
		try {
			editLoan = sessionStorage.getItem('editLoan')
				? JSON.parse(sessionStorage.getItem('editLoan'))
				: {};
			// step 1: create case
			const caseCreateRes = await createCaseReq();
			const caseId =
				editLoan?.loan_ref_id || caseCreateRes.loan_details.loan_ref_id;
			const loanId = editLoan?.id || caseCreateRes.loan_details.id;
			const businessId =
				editLoan?.business_id?.id || caseCreateRes.loan_details.business_id;

			await addSubsidiaryReq(caseId);
			await addBankDetailsReq(caseId);
			await addShareHolderDetailsReq(businessId);
			await addReferenceDetailsReq(loanId);

			// step 2: upload documents reference [loanId from createcase]
			// await updateDocumentList(caseCreateRes.loanId, USER_ROLES.User);

			return caseCreateRes;
		} catch (er) {
			console.log('APPLICANT CASE CREATE STEP ERROR-----> ', er.message);
			addToast({
				message: er.message,
				type: 'error',
			});
		}
	};

	const onSubmit = async () => {
		if (buttonDisabledStatus()) {
			return;
		}

		setCaseCreationProgress(true);
		let docError = false;
		state?.documents?.map(ele => {
			// removing strick check for pre uploaded document taging ex: pan/adhar/dl...
			if (ele.req_type) return null;
			if (!ele.typeId) {
				docError = true;
				return false;
			}
		});
		if (docError) {
			addToast({
				message: 'Please select the document type',
				type: 'error',
			});
			setCaseCreationProgress(false);
		} else {
			if (!userType) {
				const loanReq = await caseCreationSteps(state);

				if (!loanReq && !loanReq?.loanId) {
					setCaseCreationProgress(false);
					return;
				}

				if (editLoan && editLoan?.loan_ref_id) {
					setTimeout(() => {
						addToast({
							message: 'Your application has been updated',
							type: 'success',
						});
					}, 1000);
				}
				setCompleted(id);
				onFlowChange(!map ? 'application-submitted' : map.main);
			}
		}
	};

	const openCloseCollaps = name => {
		if (name === 'KYC') {
			setOpenKycDoc(!openKycdoc);
		}
		if (name === 'Financial') {
			setOpenFinancialDoc(!openFinancialdoc);
		}
		if (name === 'Others') {
			setOpenOtherDoc(!openOtherdoc);
		}
	};

	let kyccount = 0;
	let financialCount = 0;
	let otherCount = 0;

	// const documentChecklist = state?.documents?.map(docs => docs.typeName) || [];

	state?.documents?.map(docs => {
		if (docs.mainType === 'KYC') kyccount++;
		if (docs.mainType === 'Financial') financialCount++;
		if (docs.mainType === 'Others') otherCount++;
	});

	return (
		<>
			<Colom1>
				<H>
					{userType ?? 'Help Us with'} <span>Document Upload</span>
				</H>
				{loading && (
					<LoaderWrapper>
						<Loading />
					</LoaderWrapper>
				)}
				{KycDocOptions.length > 0 && (
					<>
						{' '}
						<Section onClick={() => openCloseCollaps('KYC')}>
							<H1>KYC </H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									display: 'flex',
								}}>
								Document Submitted :
								<StyledButton width={'auto'} fill>
									{kyccount} of {KycDocOptions.length}
								</StyledButton>
							</div>
							<CollapseIcon
								src={downArray}
								style={{
									transform: openKycdoc ? `rotate(180deg)` : `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</Section>
						<Details open={!openKycdoc}>
							<Hr />
						</Details>
						<Details open={openKycdoc}>
							<UploadWrapper open={openKycdoc}>
								<FileUpload
									prefilledDocs={prefilledKycDocs}
									startingTaggedDocs={startingKYCDoc}
									startingUnTaggedDocs={startingUnTaggedKYCDocs}
									sectionType='kyc'
									section={'document-upload'}
									onDrop={handleFileUpload}
									onRemoveFile={handleFileRemove}
									docTypeOptions={KycDocOptions}
									documentTypeChangeCallback={handleDocumentTypeChange}
									accept=''
									upload={{
										url: DOCS_UPLOAD_URL({
											userId:
												companyDetail?.userId ||
												JSON.parse(userToken)?.userReducer?.userId ||
												'',
										}),
										header: {
											Authorization: `Bearer ${companyDetail?.token ||
												JSON.parse(userToken)?.userReducer?.userToken ||
												''}`,
										},
									}}
								/>
							</UploadWrapper>
						</Details>
					</>
				)}
				{FinancialDocOptions.length > 0 && (
					<>
						<Section onClick={() => openCloseCollaps('Financial')}>
							<H1>Financial </H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}>
								Document Submitted :
								<StyledButton width={'auto'} fill>
									{financialCount} of {FinancialDocOptions.length}
								</StyledButton>
							</div>
							<CollapseIcon
								src={downArray}
								style={{
									transform: openFinancialdoc ? `rotate(180deg)` : `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</Section>
						<Details open={!openFinancialdoc}>
							<Hr />
						</Details>
						<Details open={openFinancialdoc}>
							<UploadWrapper open={openFinancialdoc}>
								<FileUpload
									prefilledDocs={prefilledFinancialDocs}
									startingTaggedDocs={startingFinDoc}
									startingUnTaggedDocs={startingUnTaggedFinDocs}
									sectionType='financial'
									section={'document-upload'}
									onDrop={handleFileUpload}
									onRemoveFile={handleFileRemove}
									docTypeOptions={FinancialDocOptions}
									documentTypeChangeCallback={handleDocumentTypeChange}
									accept=''
									upload={{
										url: DOCS_UPLOAD_URL({
											userId:
												companyDetail?.userId ||
												JSON.parse(userToken)?.userReducer?.userId ||
												'',
										}),
										header: {
											Authorization: `Bearer ${companyDetail?.token ||
												JSON.parse(userToken)?.userReducer?.userToken ||
												''}`,
										},
									}}
								/>
							</UploadWrapper>
						</Details>
					</>
				)}
				{OtherDocOptions.length > 0 && (
					<>
						<Section onClick={() => openCloseCollaps('Others')}>
							<H1>Others </H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									/* minWidth: '500px', */
									display: 'flex',
								}}>
								Document Submitted :
								<StyledButton width={'auto'} fill>
									{otherCount} of {OtherDocOptions.length}
								</StyledButton>
							</div>
							<CollapseIcon
								src={downArray}
								style={{
									transform: openOtherdoc ? `rotate(180deg)` : `none`,
									marginLeft: 'auto',
								}}
								alt='arrow'
							/>
						</Section>
						<Details open={openOtherdoc}>
							<UploadWrapper open={openOtherdoc}>
								<FileUpload
									prefilledDocs={prefilledOtherDocs}
									startingTaggedDocs={startingOtherDoc}
									startingUnTaggedDocs={startingUnTaggedOtherDocs}
									sectionType='others'
									section={'document-upload'}
									onDrop={handleFileUpload}
									onRemoveFile={handleFileRemove}
									docTypeOptions={OtherDocOptions}
									documentTypeChangeCallback={handleDocumentTypeChange}
									accept=''
									upload={{
										url: DOCS_UPLOAD_URL({
											userId:
												companyDetail?.userId ||
												JSON.parse(userToken)?.userReducer?.userId ||
												'',
										}),
										header: {
											Authorization: `Bearer ${companyDetail?.token ||
												JSON.parse(userToken)?.userReducer?.userToken ||
												''}`,
										},
									}}
								/>
							</UploadWrapper>
						</Details>
					</>
				)}
				<div style={{ padding: 10 }} />
				{/* <UploadWrapper>
					<FileUpload
						section={'document-upload'}
						onDrop={handleFileUpload}
						onRemoveFile={handleFileRemove}
						docTypeOptions={documentTypeOptions}
						documentTypeChangeCallback={handleDocumentTypeChange}
						accept=''
						upload={{
							url: DOCS_UPLOAD_URL({
								userId:
									companyDetail?.userId ||
									JSON.parse(userToken)?.userReducer?.userId ||
									'',
							}),
							header: {
								Authorization: `Bearer ${companyDetail?.token ||
									JSON.parse(userToken).userReducer?.userToken ||
									''}`,
							},
						}}
					/>
				</UploadWrapper> */}
				<Button
					name='Get Other Bank Statements'
					onClick={onOtherStatementModalToggle}
				/>
				<CheckboxWrapper>
					<CheckBox
						name={
							corporateDetails && corporateDetails.id
								? textForCheckbox.grantCibilAcces.replace('CIBIL', 'Bureau')
								: textForCheckbox.grantCibilAcces
						}
						checked={cibilCheckbox}
						disabled={cibilCheckbox}
						onChange={() => {
							setCibilCheckbox(!cibilCheckbox);
							setCibilCheckModal(true);
						}}
						bg='blue'
					/>
					<CheckBox
						name={textForCheckbox.declaration}
						checked={declareCheck}
						onChange={() => setDeclareCheck(!declareCheck)}
						bg='blue'
					/>
				</CheckboxWrapper>
				<SubmitWrapper>
					<Button
						name='Submit'
						fill
						style={{
							width: '200px',
							background: 'blue',
						}}
						isLoader={caseCreationProgress}
						disabled={buttonDisabledStatus()}
						onClick={!caseCreationProgress && onSubmit}
						// onClick={onSubmit}
					/>
				</SubmitWrapper>
				{otherBankStatementModal && (
					<BankStatementModal
						showModal={otherBankStatementModal}
						onClose={onOtherStatementModalToggle}
					/>
				)}
			</Colom1>
			{/* <Colom2>
				<Doc>Documents Required</Doc>
				<div>
					{DOCUMENTS_TYPE.map(docType =>
						response?.[docType[1]]?.length ? (
							<Fragment key={docType[0]}>
								<DocTypeHead>{docType[0]}</DocTypeHead>
								{response?.[docType[1]]?.map(doc => (
									<DocsCheckboxWrapper key={doc.doc_type_id}>
										<CheckBox
											name={doc.name}
											checked={documentChecklist.includes(doc.name)}
											// onChange={handleDocumentChecklist(docs)}
											round
											disabled
											bg='green'
										/>
									</DocsCheckboxWrapper>
								))}
							</Fragment>
						) : null
					)}
				</div>
			</Colom2> */}
		</>
	);
}
