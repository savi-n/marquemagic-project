import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { oneOf } from "prop-types";

import { UserContext } from "../../../reducer/userReducer";
import Button from "../../../components/Button";
import CheckBox from "../../../shared/components/Checkbox/CheckBox";
import FileUpload from "../../../shared/components/FileUpload/FileUpload";
import {
  DOCS_UPLOAD_URL,
  BORROWER_UPLOAD_URL,
  CREATE_CASE,
  CREATE_CASE_OTHER_USER,
  NC_STATUS_CODE,
  USER_ROLES,
} from "../../../_config/app.config";
import BankStatementModal from "../../../components/BankStatementModal";
import GetCUBStatementModal from "../../../components/GetCUBStatementModal";
import useFetch from "../../../hooks/useFetch";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { AppContext } from "../../../reducer/appReducer";
import { CaseContext } from "../../../reducer/caseReducer";

const Colom1 = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.themeColor1};
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

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 20px 0;
  gap: 10px;
`;

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
    color: blue;
  }
`;

const Doc = styled.h2`
  font-size: 1.2em;
  font-weight: 500;
`;

const text = {
  grantCibilAcces: "I here by give consent to pull my CIBIL records",
  declaration:
    "I here do declare that what is stated above is true to the best of my knowledge and  belief",
};

const documentsRequired = [
  "Latest Three months salary slip",
  "Latest Six months bank account statement(in which the salary gets credited)",
  "Last 2 years ITR(in pdf)",
  "Quotation letter",
  "SB account statment for the latest six months(other banks)",
  "Form 16 from the Employee of the borrower",
  "Any other relevent doxuments",
];

export default function DocumentUpload({
  userType,
  productId,
  id,
  url,
  mainPageId,
}) {
  const {
    state: { whiteLabelId },
  } = useContext(AppContext);

  const {
    state: { userDetails, userToken, coapplicant },
    actions: { setOtherUserDetails },
  } = useContext(UserContext);

  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    state,
    actions: { setUsertypeDocuments },
  } = useContext(FormContext);

  const {
    state: { caseDetails },
    actions: { setCase },
  } = useContext(CaseContext);

  const history = useHistory();

  const { newRequest } = useFetch();

  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [posting, setPosting] = useState(false);

  const [toggleStatementModal, setToggleStatementModal] = useState(false);
  const [bankStatementFetchDone, setBankStatementFetchDone] = useState(false);

  const [otherUserTypeDetails, setOtherUserTypeDetails] = useState(null);

  const [documentChecklist, setDocumentChecklist] = useState([]);

  const handleDocumentChecklist = (doc) => {
    return (value) => {
      if (value) setDocumentChecklist([...documentChecklist, doc]);
      else setDocumentChecklist(documentChecklist.filter((d) => d !== doc));
    };
  };

  const onToggleStatementModal = () => {
    if (bankStatementFetchDone) return;
    setToggleStatementModal(!toggleStatementModal);
  };

  const onStatementModalClose = (success) => {
    setToggleStatementModal(false);
    if (success) setBankStatementFetchDone(true);
  };

  const handleFileUpload = async (files) => {
    setUsertypeDocuments(files, USER_ROLES[userType || "User"]);
  };

  const buttonDisabledStatus = () => {
    return (
      !bankStatementFetchDone ||
      !(checkbox1 && checkbox2) ||
      posting ||
      !(documentChecklist.length === documentsRequired.length) ||
      !state[USER_ROLES[userType || "User"]]?.docs.length
    );
  };

  const updateDocumentList = async (loanId, user) => {
    const submitReq = await newRequest(
      BORROWER_UPLOAD_URL,
      {
        method: "POST",
        data: {
          upload_document: state[user]?.docs?.map((d) => ({
            ...d,
            loan_id: loanId,
          })),
        },
      },
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    return submitReq;
  };

  const updateCubStatement = async (loanId, token, requestId) => {
    const submitReq = await newRequest(
      BORROWER_UPLOAD_URL,
      {
        method: "POST",
        data: {
          access_token: token,
          request_id: requestId,
          loan_id: loanId,
          doc_type_id: 6,
        },
      },
      {
        authorization: userToken,
      }
    );

    return submitReq;
  };

  const createCase = async (data, user, url) => {
    try {
      const caseReq = await newRequest(
        url,
        {
          method: "POST",
          data,
        },
        {
          Authorization: `Bearer ${userToken}`,
        }
      );
      const caseRes = caseReq.data;
      if (caseRes.statusCode === NC_STATUS_CODE.NC200) {
        const docsReq = await updateDocumentList(caseRes.loanId, user);
        const statementReq = await updateCubStatement(
          caseRes.loanId,
          userToken,
          otherUserTypeDetails.requestId
        );
        const docsRes = docsReq.data;
        const statementRes = statementReq.data;
        if (docsRes.status === NC_STATUS_CODE.OK) {
          return caseRes;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const caseCreationReqOtherUser = async (loan, role, requestId) => {
    if (!loan) return;

    const request = await newRequest(
      CREATE_CASE_OTHER_USER,
      {
        method: "POST",
        data: {
          loan_ref_id: loan.loan_ref_id,
          applicantData: state[USER_ROLES[role]].applicantData,
          ...state[USER_ROLES[role]].loanData,
        },
      },
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    const response = request.data;
    if (response.status === NC_STATUS_CODE.OK) {
      const docsReq = await updateDocumentList(loan.loanId, USER_ROLES[role]);
      const statementReq = await updateCubStatement(
        loan.loanId,
        userToken,
        requestId
      );
      const docsRes = docsReq.data;
      if (docsRes.status !== NC_STATUS_CODE.OK) {
        return;
      }
      return true;
    } else {
      return;
    }
  };

  const onSubmit = async () => {
    if (!(checkbox1 && checkbox2)) {
      return;
    }

    setPosting(true);

    if (!userType) {
      const loanReq = await createCase(
        {
          white_label_id: whiteLabelId,
          product_id: productId,
          applicantData: state.user.applicantData,
          loanData: { ...state.user.loanData, productId },
          ...state.user.bankData,
        },
        USER_ROLES.User,
        CREATE_CASE
      );

      if (!loanReq && !loanReq?.loanId) {
        setPosting(false);
        return;
      }

      if (state.coapplicant) {
        const coAppilcantReq = await caseCreationReqOtherUser(
          loanReq,
          "Co-applicant",
          coapplicant.requestId
        );
        if (!coAppilcantReq) {
          setPosting(false);
          return;
        }
      }

      setCase(loanReq);
      setCompleted(id);
      history.push(flowMap[id].main);
    }
  };

  const onToggle = () => {
    setShowModal(!showModal);
  };

  const onSave = () => {
    if (!(checkbox1 && checkbox2)) {
      return;
    }

    setOtherUserDetails(otherUserTypeDetails, USER_ROLES[userType]);

    setCompleted(id);
    setCompleted(mainPageId);
    history.push(url + "/" + flowMap[id].main);
  };

  const onSubmitGuarantor = async () => {
    if (!(checkbox1 && checkbox2)) {
      return;
    }
    setPosting(true);
    const GuarantorReq = await caseCreationReqOtherUser(
      caseDetails,
      "Guarantor",
      otherUserTypeDetails.request_id
    );
    if (!GuarantorReq) {
      setPosting(false);
      return;
    }

    setCompleted(id);
    setCompleted(mainPageId);
    history.push(url + "/" + flowMap[id].main);
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
              url: DOCS_UPLOAD_URL({ userId: userDetails.id }),
              header: {
                Authorization: `Bearer ${userToken}`,
              },
            }}
          />
        </UploadWrapper>

        <ButtonWrapper>
          <Button
            name="Get CUB Statement"
            onClick={onToggleStatementModal}
            disabled={bankStatementFetchDone}
          />
          <Button name="Get Other Bank Statements" onClick={onToggle} />
          <Button name="Get ITR documents" disabled />
        </ButtonWrapper>
        <CheckboxWrapper>
          <CheckBox
            name={text.grantCibilAcces}
            checked={checkbox1}
            onChange={() => setCheckbox1(!checkbox1)}
            bg="blue"
          />
          <CheckBox
            name={text.declaration}
            checked={checkbox2}
            onChange={() => setCheckbox2(!checkbox2)}
            bg="blue"
          />
        </CheckboxWrapper>
        <SubmitWrapper>
          {!userType && (
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
          )}
          {userType === "Co-applicant" && (
            <Button
              name="Save"
              style={{
                width: "200px",
              }}
              onClick={onSave}
              disabled={buttonDisabledStatus()}
            />
          )}
          {userType === "Guarantor" && (
            <Button
              name="Submit"
              style={{
                width: "200px",
              }}
              onClick={onSubmitGuarantor}
              disabled={buttonDisabledStatus()}
            />
          )}
        </SubmitWrapper>
      </Colom1>
      <Colom2>
        <Doc>Documents Required</Doc>
        <div>
          {documentsRequired.map((docs) => (
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
      {showModal && (
        <BankStatementModal showModal={showModal} onClose={onToggle} />
      )}

      {toggleStatementModal && (
        <GetCUBStatementModal
          showModal={toggleStatementModal}
          onClose={onStatementModalClose}
          setOtherUserTypeDetails={setOtherUserTypeDetails}
          userType={userType}
        />
      )}
    </>
  );
}

DocumentUpload.defaultProps = {
  userType: null,
};

DocumentUpload.propTypes = {
  userType: oneOf(["", "Guarantor", "Co-applicant"]),
};
