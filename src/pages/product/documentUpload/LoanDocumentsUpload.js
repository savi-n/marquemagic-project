import { useState, useContext } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";

import { LoanFormContext } from "../../../reducer/loanFormDataReducer";
import Button from "../../../components/Button";
import CheckBox from "../../../shared/components/Checkbox/CheckBox";
import FileUpload from "../../../shared/components/FileUpload/FileUpload";
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
} from "../../../_config/app.config";
import { DOCUMENTS_REQUIRED } from "../../../_config/key.config";
import useFetch from "../../../hooks/useFetch";
import { useToasts } from "../../../components/Toast/ToastProvider";
import { BussinesContext } from "../../../reducer/bussinessReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { AppContext } from "../../../reducer/appReducer";

const Colom1 = styled.div`
  flex: 1;
  padding: 50px;
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

const Doc = styled.h2`
  font-size: 1.2em;
  font-weight: 500;
`;

// const textForCheckbox = {
//   grantCibilAcces: "I here by give consent to pull my CIBIL records",
//   declaration:
//     "I here do declare that what is stated above is true to the best of my knowledge and  belief",
// };

function caseCreationDataFormat(data, companyData) {
  const formatedData = {
    Business_details: {
      business_name: data?.["business-details"].BusinessName,
      business_type: data?.["business-details"].BusinessType,
      business_email: data?.["business-details"].EmailId,
      // business_industry_type: 20,
      contact: "",
      businesspancardnumber: "",
      crime_check: "Yes",
    },
    businessaddress: {
      city: "County Durham",
      line1: "1 High Burnigill Cottages",
      locality: "Croxdale",
      pincode: "DH6 5JJ",
      state: "England",
    },
    director_details: {
      director_0: {
        dfirstname0: "dir",
        dlastname0: "1",
        dpancard0: "",
        crime_check0: null,
        dcontact0: null,
        daddress10: "gjhsgduhfgdu",
        daddress20: "jhgdjfdj",
        dcity0: "mnbsd",
        dstate0: "jkbdsf",
        dpincode0: "571440",
      },
    },
    loan_details: {
      loan_product_id: data.productId,
      white_label_id: companyData.encryptedWhitelabel,
      branchId: companyData.branchId,
      // loan_type_id: 1,
      // case_priority: null,
      // origin: "New_UI",
    },
    branchId: companyData.branchId,
    documents: {
      KYC: {
        fd: "",
        size: "",
        type: "",
        filename: "",
        status: "",
        field: "",
        value: "",
      },
      others: {
        fd: "",
        size: "",
        type: "",
        filename: "",
        status: "",
        field: "",
        value: "",
      },
      financials: {
        fd: "",
        size: "",
        type: "",
        filename: "",
        status: "",
        field: "",
        value: "",
      },
    },
  };

  return formatedData;
}

function subsidiaryDataFormat(caseId, data) {
  const formatedData = {
    case_id: caseId,
    account_number: data["subsidiary-details"].AccountNumber,
    subsidiary_name: data["subsidiary-details"].SubsidiaryName,
    bank_name: data["subsidiary-details"].BankName,
    relative: data["subsidiary-details"].Relation,
  };

  return formatedData;
}

function bankDetailsDataFormat(caseId, data) {
  const formatedData = {
    case_id: caseId,
    account_number: data["bank-details"].AccountNumber,
    // subsidiary_name: data['bank-details'].,
    bank_name: data["bank-details"].BankName,
    account_holder_name: data["bank-details"].AccountHolderName,
    start_date: data["bank-details"].StartDate,
    end_date: data["bank-details"].EndDate,
    // limit_type: data['bank-details'],
    // sanction_limit: data['bank-details'],
    // drawing_limit: data['bank-details'],
    // IFSC: "",
  };

  return formatedData;
}

function shareHolderDataFormat(caseId, data) {
  const formatedData = {
    // case_id: caseId,
    percentage: data["shareholder-details"].ShareholderPercentage,
    // businessID: data["shareholder-details"].BankName,
    name: data["shareholder-details"].ShareholderName,
    relationship: data["shareholder-details"].Relation,
    address: data["shareholder-details"].CompanyAddress,
    pincode: data["shareholder-details"].Pincode,
  };

  return { shareholderData: [formatedData] };
}

function refereneceDataFormat(loanId, data) {
  const formatedData = {
    loanId: loanId,
    loanReferenceData: {
      ref_name: data["reference-details"].Name,
      ref_email: data["reference-details"].ReferenceEmail,
      ref_contact: data["reference-details"]["Contact number"],
      // ref_state :  data["reference-details"],
      // ref_city :  data["reference-details"],
      ref_pincode: data["reference-details"].Pincode,
      // ref_locality :  data["reference-details"],
      // reference_truecaller_info : data["reference-details"],
    },
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
    actions: { setLoanDocuments },
  } = useContext(LoanFormContext);

  const {
    state: { companyDetail },
  } = useContext(BussinesContext);

  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const { newRequest } = useFetch();
  const { addToast } = useToasts();

  const [caseCreationProgress, setCaseCreationProgress] = useState(false);

  const [documentChecklist, setDocumentChecklist] = useState([]);

  const handleDocumentChecklist = (doc) => {
    return (value) => {
      if (value) setDocumentChecklist([...documentChecklist, doc]);
      else setDocumentChecklist(documentChecklist.filter((d) => d !== doc));
    };
  };

  const handleFileUpload = async (files) => {
    setLoanDocuments(files);
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
          method: "POST",
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
      console.log("STEP: 2 => UPLOAD DOCUMENT REFERENCE ERROR", err.message);
      throw new Error(err.message);
    }
  };

  // step: 1 if applicant submit request createCase
  const createCaseReq = async () => {
    try {
      const caseReq = await newRequest(
        BUSSINESS_LOAN_CASE_CREATION,
        {
          method: "POST",
          data: caseCreationDataFormat(
            {
              ...state,
              productId,
            },
            companyDetail
          ),
        },
        { authorization: `Bearer ${companyDetail.token}` }
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
      console.log("STEP: 1 => CASE CREATION ERROR", er.message);
      throw new Error(er.message);
    }
  };

  // step: 2 if subsidary details submit request
  const addSubsidiaryReq = async (caseId) => {
    try {
      const caseReq = await newRequest(
        ADD_SUBSIDIARY_DETAILS,
        {
          method: "POST",
          data: subsidiaryDataFormat(caseId, state),
        },
        { authorization: `Bearer ${companyDetail.token}` }
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
      console.log("STEP: 2 => CASE CREATION ERRROR", er.message);
      throw new Error(er.message);
    }
  };

  // step: 3 if subsidary details submit request
  const addBankDetailsReq = async (caseId) => {
    try {
      const caseReq = await newRequest(
        ADD_BANK_DETAILS,
        {
          method: "POST",
          data: bankDetailsDataFormat(caseId, state),
        },
        { authorization: `Bearer ${companyDetail.token}` }
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
      console.log("STEP:3 => ADD BANK DETAILS ERRROR", er.message);
      throw new Error(er.message);
    }
  };

  // step: 4 if subsidary details submit request
  const addShareHolderDetailsReq = async (caseId) => {
    try {
      const caseReq = await newRequest(
        ADD_SHAREHOLDER_DETAILS,
        {
          method: "POST",
          data: shareHolderDataFormat(caseId, state),
        },
        { authorization: `Bearer ${companyDetail.token}` }
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
      console.log("STEP:3 => ADD BANK DETAILS ERRROR", er.message);
      throw new Error(er.message);
    }
  };

  // step: 5 if subsidary details submit request
  const addReferenceDetailsReq = async (loanId) => {
    try {
      const caseReq = await newRequest(
        ADD_SHAREHOLDER_DETAILS,
        {
          method: "POST",
          data: refereneceDataFormat(loanId, state),
        },
        { authorization: `Bearer ${companyDetail.token}` }
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
      console.log("STEP:3 => ADD BANK DETAILS ERRROR", er.message);
      throw new Error(er.message);
    }
  };

  const caseCreationSteps = async (data) => {
    try {
      // step 1: create case
      const caseCreateRes = await createCaseReq();
      const caseId = caseCreateRes.loan_details.loan_ref_id;
      const loanId = caseCreateRes.loan_details.id;

      await addSubsidiaryReq(caseId);
      await addBankDetailsReq(caseId);
      await addShareHolderDetailsReq(caseId);
      await addReferenceDetailsReq(loanId);

      // step 2: upload documents reference [loanId from createcase]
      // await updateDocumentList(caseCreateRes.loanId, USER_ROLES.User);

      return caseCreateRes;
    } catch (er) {
      console.log("APPLICANT CASE CREATE STEP ERROR-----> ", er.message);
      addToast({
        message: er.message,
        type: "error",
      });
    }
  };

  const onSubmit = async () => {
    if (buttonDisabledStatus()) {
      return;
    }

    setCaseCreationProgress(true);

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

  return (
    <>
      <Colom1>
        <H>
          {userType ?? "Help Us with"} <span>Document Upload</span>
        </H>
        <UploadWrapper>
          <FileUpload
            onDrop={handleFileUpload}
            accept=""
            upload={{
              url: DOCS_UPLOAD_URL({ userId: companyDetail?.userId || "" }),
              header: {
                Authorization: `Bearer ${companyDetail.token}`,
              },
            }}
          />
        </UploadWrapper>

        {/* 
        <CheckboxWrapper>
          <CheckBox
            name={textForCheckbox.grantCibilAcces}
            checked={cibilCheckbox}
            // disabled={cibilCheckbox}
            onChange={() => {
              setCibilCheckbox(!cibilCheckbox);
              // setCibilCheckModal(true);
            }}
            bg="blue"
          />
          <CheckBox
            name={textForCheckbox.declaration}
            checked={declareCheck}
            onChange={() => setDeclareCheck(!declareCheck)}
            bg="blue"
          />
        </CheckboxWrapper> */}
        <SubmitWrapper>
          <Button
            name="Submit"
            fill
            style={{
              width: "200px",
              background: "blue",
            }}
            disabled={buttonDisabledStatus()}
            onClick={onSubmit}
          />
        </SubmitWrapper>
      </Colom1>
      <Colom2>
        <Doc>Documents Required</Doc>
        <div>
          {productDetails[DOCUMENTS_REQUIRED]?.map((docs) => (
            <DocsCheckboxWrapper key={uuidv4()}>
              <CheckBox
                name={docs}
                checked={documentChecklist.includes(docs)}
                onChange={handleDocumentChecklist(docs)}
                round
                bg="green"
              />
            </DocsCheckboxWrapper>
          ))}
        </div>
      </Colom2>
    </>
  );
}
