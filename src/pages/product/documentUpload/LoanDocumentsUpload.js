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
	USER_ROLES
} from '../../../_config/app.config';
import { DOCUMENTS_TYPE } from '../../../_config/key.config';
import useFetch from '../../../hooks/useFetch';
import { useToasts } from '../../../components/Toast/ToastProvider';
import { BussinesContext } from '../../../reducer/bussinessReducer';
import { FlowContext } from '../../../reducer/flowReducer';
import { AppContext } from '../../../reducer/appReducer';
import { FormContext } from '../../../reducer/formReducer';
import BankStatementModal from '../../../components/BankStatementModal';

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

const textForCheckbox = {
	grantCibilAcces: 'I here by give consent to pull my CIBIL records',
	declaration: 'I here do declare that what is stated above is true to the best of my knowledge and  belief'
};

function fileStructure(documents, type) {
	return documents
		.filter(file => file.mainType === type)
		.map(file => ({
			// value, filename, fd, password
			fd: file.document_key, //fd from loan document repsone
			size: file.size, //size from loan document repsone
			// type: "",
			filename: file.upload_doc_name, //fd from loan document repsone
			// status: "",
			// field: "",
			value: file.typeId, // doctype_id
			password: file?.password
		}));
}

function caseCreationDataFormat(data, companyData, productDetails) {
	const idType = productDetails.loanType.includes('Housing') ? 'salaried' : 'business';
	const formatedData = {
		Business_details: {
			business_name: data?.['business-details'].BusinessName,
			business_type: data?.['business-details'].BusinessType,
			business_email: data?.['business-details'].EmailId,
			// business_industry_type: 20,
			contact: '',
			businesspancardnumber: companyData.PancardNumber,
			// crime_check: "Yes",
			gstin: data?.['business-details'].GSTVerification,
			businessstartdate: data?.['business-details'].BusinessVintage,
			corporateid: companyData.CIN
		},
		// businessaddress: {
		//   city: "County Durham",
		//   line1: "1 High Burnigill Cottages",
		//   locality: "Croxdale",
		//   pincode: "DH6 5JJ",
		//   state: "England",
		// },

		director_details:
			localStorage.getItem('product') === 'demo'
				? {
						director_0: {},
						director_1: {}
				  }
				: companyData.DirectorDetails,
		loan_details: {
			// loan_type_id: 1,
			// case_priority: null,
			// loan_product_id: "10",
			// loan_request_type: "1",
			// origin: "New_UI",
			loan_product_id: data.productId[idType],
			white_label_id: companyData.encryptedWhitelabel,
			branchId: companyData.branchId,
			loan_amount: data['business-loan-details'].LoanAmount,
			applied_tenure: Number(data['business-loan-details'].tenure || ''),
			application_ref: data['business-loan-details'].Applicationid || '',
			annual_turn_over: data?.['business-details'].AnnualTurnover,
			annual_op_expense: data?.['business-details'].PAT
			// loan_type_id: 1,
			// case_priority: null,
			// origin: "New_UI",
		},
		documents: {
			KYC: fileStructure(data?.documents || [], 'KYC'),
			others: fileStructure(data?.documents || [], 'Others'),
			financials: fileStructure(data?.documents || [], 'financials')
		}
	};

	if (localStorage.getItem('product') != 'demo') {
		formatedData['branchId'] = companyData.branchId;
	}

	return formatedData;
}

function subsidiaryDataFormat(caseId, data) {
	if (!data['subsidiary-details']?.SubsidiaryName && !data['subsidiary-details']?.BankName) {
		return false;
	}
	const formatedData = {
		case_id: caseId,
		account_number: data['subsidiary-details']?.AccountNumber,
		subsidiary_name: data['subsidiary-details']?.SubsidiaryName,
		bank_name: data['subsidiary-details']?.BankName,
		relative: data['subsidiary-details']?.Relation
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
		bank_name: data['bank-details']?.BankName,
		account_holder_name: data['bank-details']?.AccountHolderName,
		account_type: data['bank-details']?.AccountType,
		start_date: data['bank-details']?.StartDate,
		end_date: data['bank-details']?.EndDate
		// limit_type: data['bank-details'],
		// sanction_limit: data['bank-details'],
		// drawing_limit: data['bank-details'],
		// IFSC: "",
	};

	return formatedData;
}

function shareHolderDataFormat(businessId, data) {
	if (
		!data['shareholder-details']?.ShareholderPercentage &&
		!data['shareholder-details']?.ShareholderName &&
		!data['shareholder-details']?.CompanyAddress
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
		pincode: data['shareholder-details']?.Pincode
	};

	return { shareholderData: [formatedData] };
}

function refereneceDataFormat(loanId, data) {
	const loanReferenceData = [];
	if (
		!data['reference-details']?.Name0 &&
		!data['reference-details']?.ReferenceEmail0 &&
		!data['reference-details']?.Contactnumber0 &&
		data['reference-details']?.Pincode0
	) {
		loanReferenceData.push({
			ref_name: data['reference-details']?.Name0,
			ref_email: data['reference-details']?.ReferenceEmail0,
			ref_contact: data['reference-details'].Contactnumber0,
			ref_state: 'null',
			ref_city: 'null',
			ref_pincode: data['reference-details']?.Pincode0,
			ref_locality: 'null',
			reference_truecaller_info: ''
		});
	}

	if (
		!data['reference-details']?.Name1 &&
		!data['reference-details']?.ReferenceEmail1 &&
		!data['reference-details']?.Contactnumber1 &&
		data['reference-details']?.Pincode1
	) {
		loanReferenceData.push({
			ref_name: data['reference-details']?.Name1,
			ref_email: data['reference-details']?.ReferenceEmail1,
			ref_contact: data['reference-details'].Contactnumber1,
			ref_state: 'null',
			ref_city: 'null',
			ref_pincode: data['reference-details']?.Pincode1,
			ref_locality: 'null',
			reference_truecaller_info: ''
		});
	}

	const formatedData = {
		loanId: loanId,
		loanReferenceData: loanReferenceData
	};

	return formatedData;
}
export default function DocumentUpload({ productDetails, userType, id, onFlowChange, map, productId }) {
	const {
		state,
		actions: { setLoanDocuments, removeLoanDocument, setLoanDocumentType }
	} = useContext(LoanFormContext);

	const [cibilCheckbox, setCibilCheckbox] = useState(false);
	const [declareCheck, setDeclareCheck] = useState(false);

	const [otherBankStatementModal, setOtherBankStatementModal] = useState(false);
	const [cibilCheckModal, setCibilCheckModal] = useState(false);

	const idType = productDetails.loanType.includes('Housing') ? 'salaried' : 'business';

	const {
		state: { companyDetail }
	} = useContext(BussinesContext);

	const {
		actions: { setCompleted }
	} = useContext(FlowContext);

	const {
		actions: {
			setUsertypeDocuments,
			removeUserTypeDocument,
			setUserTypeDocumentType,
			setUsertypeCibilData,
			setUsertypeStatementData
		}
	} = useContext(FormContext);

	const { newRequest } = useFetch();
	const { addToast } = useToasts();

	const [caseCreationProgress, setCaseCreationProgress] = useState(false);
	const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
	const onOtherStatementModalToggle = () => {
		setOtherBankStatementModal(!otherBankStatementModal);
	};

	// const [documentChecklist, setDocumentChecklist] = useState([]);

	const onCibilModalClose = (success, data) => {
		if (!success) {
			setCibilCheckbox(false);
		}

		if (success) {
			setUsertypeCibilData(
				{
					cibilScore: data.cibilScore,
					requestId: data.requestId
				},
				USER_ROLES[userType || 'User']
			);
		}
		addToast({
			message: data.message,
			type: success ? 'success' : 'error'
		});

		setCibilCheckModal(false);
	};

	const { response } = useFetch({
		url: DOCTYPES_FETCH,
		options: {
			method: 'POST',
			data: {
				business_type: state?.['business-details']?.BusinessType,
				loan_product: productId[idType]
			}
		},
		headers: {
			Authorization: `Bearer ${companyDetail?.token}`
		}
	});

	useEffect(() => {
		if (response) {
			let optionArray = [];
			DOCUMENTS_TYPE.forEach(docType => {
				optionArray = [
					...optionArray,
					...response?.[docType[1]]?.map(dT => ({
						value: dT.name,
						name: dT.name,
						main: docType[0]
					}))
				];
			});
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
		setLoanDocumentType(fileId, type);
	};

	const buttonDisabledStatus = () => {
		return caseCreationProgress;
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
							loan_id: loanId
						}))
					}
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
		console.log(companyDetail);
		try {
			const caseReq = await newRequest(
				BUSSINESS_LOAN_CASE_CREATION,
				{
					method: 'POST',
					data: caseCreationDataFormat(
						{
							...state,
							productId
						},
						companyDetail,
						productDetails
					)
				},
				{ authorization: `Bearer ${companyDetail.token}` }
			);
			const caseRes = caseReq.data;
			if (caseRes.statusCode === NC_STATUS_CODE.NC200 || caseRes.status === NC_STATUS_CODE.OK) {
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
					data: subsidiaryDataFormat(caseId, state)
				},
				{ authorization: `Bearer ${companyDetail.token}` }
			);
			const caseRes = caseReq.data;
			if (caseRes.statusCode === NC_STATUS_CODE.NC200 || caseRes.status === NC_STATUS_CODE.OK) {
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
					data: formData
				},
				{ authorization: `Bearer ${companyDetail.token}` }
			);
			const caseRes = caseReq.data;
			if (caseRes.statusCode === NC_STATUS_CODE.NC200 || caseRes.status === NC_STATUS_CODE.OK) {
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
					data: formData
				},
				{ authorization: `Bearer ${companyDetail.token}` }
			);
			const caseRes = caseReq.data;
			if (caseRes.statusCode === NC_STATUS_CODE.NC200 || caseRes.status === NC_STATUS_CODE.OK) {
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
					data: formData
				},
				{ authorization: `Bearer ${companyDetail.token}` }
			);
			const caseRes = caseReq.data;
			if (caseRes.statusCode === NC_STATUS_CODE.NC200 || caseRes.status === NC_STATUS_CODE.OK) {
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
			console.log(caseCreateRes, data);
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
				type: 'error'
			});
		}
	};

	const onSubmit = async () => {
		if (buttonDisabledStatus()) {
			return;
		}

		setCaseCreationProgress(true);
		console.log(!userType);

		if (!userType) {
			const loanReq = await caseCreationSteps(state);

			if (!loanReq && !loanReq?.loanId) {
				setCaseCreationProgress(false);
				return;
			}

			setCompleted(id);
			onFlowChange(map.main);
		}
	};

	const documentChecklist = state?.documents?.map(docs => docs.typeName) || [];

	return (
		<>
			<Colom1>
				<H>
					{userType ?? 'Help Us with'} <span>Document Upload</span>
				</H>
				<UploadWrapper>
					<FileUpload
						onDrop={handleFileUpload}
						onRemoveFile={handleFileRemove}
						docTypeOptions={documentTypeOptions}
						documentTypeChangeCallback={handleDocumentTypeChange}
						accept=''
						upload={{
							url: DOCS_UPLOAD_URL({ userId: companyDetail?.userId || '' }),
							header: {
								Authorization: `Bearer ${companyDetail?.token || ''}`
							}
						}}
					/>
				</UploadWrapper>
				<Button name='Get Other Bank Statements' onClick={onOtherStatementModalToggle} />

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
							background: 'blue'
						}}
						disabled={buttonDisabledStatus()}
						onClick={onSubmit}
					/>
				</SubmitWrapper>
				{otherBankStatementModal && (
					<BankStatementModal showModal={otherBankStatementModal} onClose={onOtherStatementModalToggle} />
				)}
			</Colom1>
			<Colom2>
				<Doc>Documents Required</Doc>
				<div>
					{DOCUMENTS_TYPE.map(docType =>
						response?.[docType[1]].length ? (
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
			</Colom2>
		</>
	);
}
