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

const Colom1 = styled.div`
	flex: 1;
	padding: 50px;
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

const Details = styled.div`
	max-height: ${props => (props.open ? '100%' : '0')};
	overflow: hidden;
	padding: ${props => (props.open ? '10px 0' : '0')};
	transition: all 0.3s ease-out;
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
	margin-left: auto;
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

const url = window.location.hostname;

let userToken = localStorage.getItem(url);

let loan = JSON.parse(userToken)?.formReducer?.user?.loanData;

let form = JSON.parse(userToken)?.formReducer?.user?.applicantData;
let busniess = JSON.parse(localStorage.getItem('busniess'));

const getAmountUm = a => {
	if (a > 99999) {
		return 'Lakhs';
	} else {
		return '';
	}
};

const getAmount = a => {
	if (a >= 99999) {
		return a / 100000;
	} else {
		return a;
	}
};

function caseCreationDataFormat(data, companyData, productDetails, productId) {
	let applicantData = JSON.parse(localStorage.getItem(url))?.formReducer?.user
		.applicantData;
	let loanData = JSON.parse(localStorage.getItem(url))?.formReducer?.user
		.loanData;
	const idType =
		productDetails.loanType.includes('Business') ||
		productDetails.loanType.includes('LAP') ||
		productDetails.loanType.includes('Working')
			? 'business'
			: 'salaried';

	// console.log('case-creation-data-format-', {
	// 	data,
	// 	companyData,
	// 	productDetails,
	// 	productId,
	// 	applicantData,
	// 	loanData,
	// 	idType,
	// });

	const businessDetails = () => {
		if (!companyData) {
			companyData =
				localStorage.getItem('companyData') &&
				JSON.parse(localStorage.getItem('companyData'));
		}
		return {
			business_name:
				applicantData?.firstName ||
				localStorage.getItem('BusinessName') ||
				companyData?.BusinessName,
			//form?.incomeType === 'salaried' ? 7 : 1
			business_type:
				applicantData?.incomeType === 'salaried'
					? 7
					: data['business-details']?.BusinessType
					? data['business-details']?.BusinessType
					: 1,
			business_email:
				form?.email || companyData?.formEmail || companyData?.Email || '',
			// business_industry_type: 20,
			contact:
				form?.mobileNo ||
				companyData?.formMobile ||
				companyData?.mobileNo ||
				'',
			businesspancardnumber: form?.panNumber || companyData?.panNumber,
			// // crime_check: "Yes",
			gstin: data['business-details']?.GSTVerification || '',
			// businessstartdate: data['business-details'].BusinessVintage,
			// corporateid: companyData.CIN
		};
	};
	if (!companyData) {
		companyData =
			localStorage.getItem('companyData') &&
			JSON.parse(localStorage.getItem('companyData'));
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
		director_details: [],
		loan_details: {
			// loan_type_id: 1,
			// case_priority: null,
			// loan_product_id: "10",
			// loan_request_type: "1",
			// origin: "New_UI",
			loan_product_id: productId[(form?.incomeType)] || productId[idType],
			white_label_id: localStorage.getItem('encryptWhiteLabel'),
			branchId: loan.branchId,
			loan_amount: getAmount(
				loanData?.loanAmount ||
					loan?.loanAmount ||
					data['business-loan-details']?.LoanAmount ||
					data['vehicle-loan-details']?.loanAmount ||
					0
			), //loan.loanAmount,
			loan_amount_um: getAmountUm(
				+loanData?.loanAmount ||
					+loan?.loanAmount ||
					+data['business-loan-details']?.LoanAmount ||
					+data['vehicle-loan-details']?.loanAmount
			),
			applied_tenure:
				loan?.tenure ||
				data['business-loan-details']?.tenure ||
				data['vehicle-loan-details']?.tenure ||
				0,
			annual_turn_over: getAmount(
				applicantData?.grossIncome ||
					data?.['business-details']?.AnnualTurnover ||
					''
			),
			revenue_um: getAmountUm(
				applicantData?.grossIncome ||
					data?.['business-details']?.AnnualTurnover ||
					''
			),

			annual_op_expense: getAmount(
				applicantData?.netMonthlyIncome || data?.['business-details']?.PAT || ''
			),
			op_expense_um: getAmountUm(
				applicantData?.netMonthlyIncome || data?.['business-details']?.PAT || ''
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
			KYC: fileStructure(data?.documents || [], 'KYC'),
			others: fileStructure(data?.documents || [], 'Others'),
			financials: fileStructure(data?.documents || [], 'Financial'),
		},
		branchId: companyData?.branchId,
	};

	// if (localStorage.getItem('product') != 'demo') {
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

	const getWhiteLabel = async () => {
		const encryptWhiteLabelReq = await newRequest(
			WHITELABEL_ENCRYPTION_API,
			{
				method: 'GET',
			},
			{
				Authorization: `Bearer ${JSON.parse(userToken) &&
					JSON.parse(userToken).userReducer &&
					JSON.parse(userToken).userReducer?.userToken}`,
			}
		);

		const encryptWhiteLabelRes = encryptWhiteLabelReq.data;

		localStorage.setItem(
			'encryptWhiteLabel',
			encryptWhiteLabelRes.encrypted_whitelabel[0]
		);
	};
	useEffect(() => {
		getWhiteLabel();
	}, []);

	const [cibilCheckbox, setCibilCheckbox] = useState(false);
	const [message, setMessage] = useState('');
	const [declareCheck, setDeclareCheck] = useState(false);

	const [otherBankStatementModal, setOtherBankStatementModal] = useState(false);
	const [cibilCheckModal, setCibilCheckModal] = useState(false);

	useEffect(() => {
		if (busniess && busniess.Address) {
			const getAddressDetails = async () => {
				const response = await newRequest(
					PINCODE_ADRRESS_FETCH({ pinCode: busniess.Address?.pncd || '' }),
					{}
				);
				const data = response.data;

				busniess = {
					...busniess,
					Address: {
						...busniess.Address,
						st: data?.state?.[0],
						city: data?.district?.[0],
					},
				};
			};
		}
	});

	const idType =
		productDetails.loanType.includes('Business') ||
		productDetails.loanType.includes('LAP') ||
		productDetails.loanType.includes('Working')
			? 'business'
			: 'salaried';

	const {
		state: { companyDetail },
	} = useContext(BussinesContext);

	const {
		actions: { setCompleted },
	} = useContext(FlowContext);

	const {
		actions: { setLoanRef },
	} = useContext(CaseContext);

	const {
		actions: {
			setUsertypeDocuments,
			removeUserTypeDocument,
			setUserTypeDocumentType,
			setUsertypeCibilData,
			setUsertypeStatementData,
		},
	} = useContext(FormContext);

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
	// const [documentChecklist, setDocumentChecklist] = useState([]);

	const onCibilModalClose = (success, data) => {
		if (!success) {
			setCibilCheckbox(false);
		}

		if (success) {
			setUsertypeCibilData(
				{
					cibilScore: data.cibilScore,
					requestId: data.requestId,
				},
				USER_ROLES[userType || 'User']
			);
		}
		addToast({
			message: data.message,
			type: success ? 'success' : 'error',
		});

		setCibilCheckModal(false);
	};
	let applicantData = JSON.parse(localStorage.getItem(url))?.formReducer?.user
		.applicantData;
	const companyData =
		localStorage.getItem('companyData') &&
		JSON.parse(localStorage.getItem('companyData'));
	const { response } = useFetch({
		url: DOCTYPES_FETCH,
		options: {
			method: 'POST',
			data: {
				business_type:
					applicantData?.incomeType === 'salaried'
						? 7
						: state['business-details']?.BusinessType ||
						  companyData?.BusinessType
						? state['business-details']?.BusinessType ||
						  companyData?.BusinessType
						: 1,
				loan_product: productId[(form?.incomeType)] || productId[idType],
			},
		},
		headers: {
			Authorization: `Bearer ${JSON.parse(userToken) &&
				JSON.parse(userToken).userReducer &&
				JSON.parse(userToken).userReducer?.userToken}`,
		},
	});

	useEffect(() => {
		if (response) {
			const getAddressDetails = async () => {
				const response = await newRequest(
					PINCODE_ADRRESS_FETCH({ pinCode: busniess.Address?.pncd || '' }),
					{}
				);
				const data = response.data;

				busniess = {
					...busniess,
					Address: {
						...busniess.Address,
						st: data?.state?.[0],
						city: data?.district?.[0],
					},
				};
			};

			if (busniess && busniess.Address) {
				getAddressDetails();
			}

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
			optionArray.map(ele => {
				if (ele.main === 'KYC') {
					kycDocDropdown.push(ele);
				}
				if (ele.main === 'Financial') {
					financialDocDropdown.push(ele);
				}
				if (ele.main === 'Others') {
					otherDocDropdown.push(ele);
				}
			});
			setKycDocOptions(kycDocDropdown);
			setFinancialDocOptions(financialDocDropdown);
			setOtherDocOptions(otherDocDropdown);

			setDocumentTypeOptions(optionArray);
		}
	}, [response]);

	// const handleDocumentChecklist = (doc) => {
	//   return (value) => {
	//     if (value) setDocumentChecklist([...documentChecklist, doc]);
	//     else setDocumentChecklist(documentChecklist.filter((d) => d !== doc));
	//   };
	// };

	const handleFileUpload = async files => {
		setLoanDocuments(files);
	};

	const handleFileRemove = async fileId => {
		removeLoanDocument(fileId);
	};

	const handleDocumentTypeChange = async (fileId, type) => {
		// console.log('handleDocumentTypeChange-', { fileId, type });
		setLoanDocumentType(fileId, type);
	};

	const buttonDisabledStatus = () => {
		return !(cibilCheckbox && declareCheck);
	};

	// step 2: upload docs reference
	const updateDocumentList = async (loanId, user) => {
		try {
			const uploadDocsReq = await newRequest(
				BORROWER_UPLOAD_URL,
				{
					method: 'POST',
					data: {
						upload_document: state[user]?.uploadedDocs?.map(({ id, ...d }) => ({
							...d,
							loan_id: loanId,
						})),
					},
				},
				{
					//   Authorization: `Bearer ${userToken}`,
				}
			);

			const uploadDocsRes = uploadDocsReq.data;
			if (uploadDocsRes.status === NC_STATUS_CODE.OK) {
				return uploadDocsRes;
			}
			throw new Error(uploadDocsRes.message);
		} catch (err) {
			console.log('STEP: 2 => UPLOAD DOCUMENT REFERENCE ERROR', err.message);
			throw new Error(err.message);
		}
	};

	// step: 1 if applicant submit request createCase
	const createCaseReq = async () => {
		try {
			const caseReq = await newRequest(
				BUSSINESS_LOAN_CASE_CREATION,
				{
					method: 'POST',
					data: caseCreationDataFormat(
						{
							...state,
							productId,
						},
						companyDetail,
						productDetails,
						productId
					),
				},
				{
					authorization: `Bearer ${
						JSON.parse(userToken).userReducer?.userToken
					}`,
				}
			);
			const caseRes = caseReq.data;
			if (
				caseRes.statusCode === NC_STATUS_CODE.NC200 ||
				caseRes.status === NC_STATUS_CODE.OK
			) {
				setMessage(caseReq.data.data.loan_details.loan_ref_id);
				setLoanRef(caseReq.data.data.loan_details.loan_ref_id);
				return caseRes.data;
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
					authorization: `Bearer ${companyDetail.token ||
						JSON.parse(userToken).userReducer?.userToken}`,
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
					authorization: `Bearer ${companyDetail.token ||
						JSON.parse(userToken).userReducer?.userToken}`,
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
					authorization: `Bearer ${companyDetail.token ||
						JSON.parse(userToken).userReducer?.userToken}`,
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
					authorization: `Bearer ${companyDetail.token ||
						JSON.parse(userToken).userReducer.userToken}`,
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
			// step 1: create case
			const caseCreateRes = await createCaseReq();
			const caseId = caseCreateRes.loan_details.loan_ref_id;
			const loanId = caseCreateRes.loan_details.id;
			const businessId = caseCreateRes.loan_details.business_id;

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
		// console.log('state-documents-', state?.documents);
		state?.documents?.map(ele => {
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
		} else {
			if (!userType) {
				const loanReq = await caseCreationSteps(state);

				if (!loanReq && !loanReq?.loanId) {
					setCaseCreationProgress(false);
					return;
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

	const documentChecklist = state?.documents?.map(docs => docs.typeName) || [];

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
				{KycDocOptions.length > 0 && (
					<>
						{' '}
						<Section onClick={() => openCloseCollaps('KYC')}>
							<H1>KYC </H1>
							<div
								style={{
									marginLeft: 10,
									alignItems: 'center',
									minWidth: '500px',
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
								}}
								alt='arrow'
							/>
						</Section>
						<Details open={!openKycdoc}>
							<Hr />
						</Details>
						<Details open={openKycdoc}>
							<UploadWrapper>
								<FileUpload
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
												JSON.parse(userToken).userReducer?.userToken ||
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
									minWidth: '500px',
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
								}}
								alt='arrow'
							/>
						</Section>
						<Details open={!openFinancialdoc}>
							<Hr />
						</Details>
						<Details open={openFinancialdoc}>
							<UploadWrapper>
								<FileUpload
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
												JSON.parse(userToken).userReducer?.userToken ||
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
									minWidth: '500px',
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
								}}
								alt='arrow'
							/>
						</Section>
						<Details open={openOtherdoc}>
							<UploadWrapper>
								<FileUpload
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
												JSON.parse(userToken).userReducer?.userToken ||
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
						name={textForCheckbox.grantCibilAcces}
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
						disabled={buttonDisabledStatus()}
						onClick={onSubmit}
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
