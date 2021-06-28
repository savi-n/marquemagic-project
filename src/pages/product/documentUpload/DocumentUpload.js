import { useState, useContext } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { func, object, oneOfType, string, oneOf } from "prop-types";

import { UserContext } from "../../../reducer/userReducer";
import Button from "../../../components/Button";
import CheckBox from "../../../shared/components/Checkbox/CheckBox";
import FileUpload from "../../../shared/components/FileUpload/FileUpload";
import {
  DOCS_UPLOAD_URL,
  BORROWER_UPLOAD_URL,
  UPLOAD_CUB_STATEMENT,
  CREATE_CASE,
  CREATE_CASE_OTHER_USER,
  UPDATE_LOAN_ASSETS,
  NC_STATUS_CODE,
  USER_ROLES,
} from "../../../_config/app.config";
import { DOCUMENTS_REQUIRED } from "../../../_config/key.config";
import BankStatementModal from "../../../components/BankStatementModal";
import GetCUBStatementModal from "../../../components/GetCUBStatementModal";
import GetCIBILScoreModal from "../../../components/GetCIBILScoreModal";
import useFetch from "../../../hooks/useFetch";
import { useToasts } from "../../../components/Toast/ToastProvider";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { AppContext } from "../../../reducer/appReducer";
import { CaseContext } from "../../../reducer/caseReducer";
import Loading from "../../../components/Loading";
import Modal from "../../../components/Modal";

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
    color: ${({ theme }) => theme.main_theme_color};
  }
`;

const Doc = styled.h2`
  font-size: 1.2em;
  font-weight: 500;
`;

const textForCheckbox = {
  grantCibilAcces: "I here by give consent to pull my CIBIL records",
  declaration:
    "I here do declare that what is stated above is true to the best of my knowledge and  belief",
};

DocumentUpload.propTypes = {
  onFlowChange: func.isRequired,
  productDetails: object,
  map: oneOfType([string, object]),
  id: string,
  userType: oneOf(["Co-Applicant", "Gurantor", "", undefined]),
  productId: string.isRequired,
};

export default function DocumentUpload({
  productDetails,
  userType,
  id,
  onFlowChange,
  map,
  productId,
}) {
  const {
    state: { whiteLabelId, clientToken },
  } = useContext(AppContext);

  const {
    state: { userDetails, userToken },
  } = useContext(UserContext);

  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    state,
    actions: {
      setUsertypeDocuments,
      setUsertypeCibilData,
      setUsertypeStatementData,
    },
  } = useContext(FormContext);

  const {
    state: { caseDetails },
    actions: { setCase },
  } = useContext(CaseContext);

  const { newRequest } = useFetch();
  const { addToast } = useToasts();

  const [cibilCheckbox, setCibilCheckbox] = useState(false);
  const [declareCheck, setDeclareCheck] = useState(false);

  const [otherBankStatementModal, setOtherBankStatementModal] = useState(false);
  const [caseCreationProgress, setCaseCreationProgress] = useState(false);

  const [toggleCUBStatementModal, setToggleCUBStatementModal] = useState(false);
  const [bankCUBStatementFetchDone, setBankCUBStatementFetchDone] = useState(
    false
  );

  const [
    otherCUBStatementUserTypeDetails,
    setOtherCUBStatementUserTypeDetails,
  ] = useState(null);

  const [otherUserTypeCibilDetails, setOtherUserTypeCibilDetails] = useState(
    null
  );

  const [documentChecklist, setDocumentChecklist] = useState([]);

  const [cibilCheckModal, setCibilCheckModal] = useState(false);

  const handleDocumentChecklist = (doc) => {
    return (value) => {
      if (value) setDocumentChecklist([...documentChecklist, doc]);
      else setDocumentChecklist(documentChecklist.filter((d) => d !== doc));
    };
  };

  const onToggleCUBStatementModal = () => {
    if (bankCUBStatementFetchDone) return;
    setToggleCUBStatementModal(!toggleCUBStatementModal);
  };

  const onCUBStatementModalClose = (success) => {
    setToggleCUBStatementModal(false);
    if (typeof success === "boolean") setBankCUBStatementFetchDone(true);
  };

  const handleFileUpload = async (files) => {
    setUsertypeDocuments(files, USER_ROLES[userType || "User"]);
  };

  const buttonDisabledStatus = () => {
    return (
      !(!!userType || bankCUBStatementFetchDone) ||
      !(cibilCheckbox && declareCheck) ||
      caseCreationProgress ||
      // !(
      //   documentChecklist.length === productDetails[DOCUMENTS_REQUIRED].length
      // ) ||
      !state[USER_ROLES[userType || "User"]]?.uploadedDocs?.length
    );
  };

  // step 4: loan asset upload
  const loanAssetsUpload = async (loanId, data) => {
    const submitReq = await newRequest(
      UPDATE_LOAN_ASSETS,
      {
        method: "POST",
        data: {
          loanId: loanId,
          propertyType: "leased",
          loan_asset_type_id: 2,
          ownedType: "paid_off",
          address1: "test address1",
          address2: "test address2",
          flat_no: "112",
          locality: "ramnagar",
          city: "banglore",
          pincode: "570000",
          landmark: "SI ATM",
          autoMobileType: "qw",
          brandName: "d",
          modelName: "fd",
          vehicalValue: "122",
          dealershipName: "sd",
          manufacturingYear: "123",
          Value: "test@123",
          ints: "",
          cpath: "",
          surveyNo: "",
          cAssetId: "",
          noOfAssets: 5,
        },
      },
      {
        Authorization: `Bearer ${userToken}`,
      }
    );
    return submitReq;
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
          Authorization: `Bearer ${userToken}`,
        }
      );

      const uploadDocsRes = uploadDocsReq.data;
      if (uploadDocsRes.status === NC_STATUS_CODE.OK) {
        return uploadDocsRes;
      }
      throw new Error(uploadDocsRes.message);
    } catch (err) {
      console.log("STEP: 2 => UPLOAD DOCUMENT REFERENCE ERRRO", err.message);
      throw new Error(err.message);
    }
  };

  // step: 3 upload cub statements to sails
  const updateRefernceToSails = async (loanId, token, requestId) => {
    try {
      const statementUploadReq = await newRequest(
        UPLOAD_CUB_STATEMENT,
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
          Authorization: `${clientToken}`,
        }
      );

      const statementUploadRes = statementUploadReq.data;

      if (statementUploadRes.statusCode === NC_STATUS_CODE.NC200) {
        return statementUploadRes;
      }

      throw new Error(statementUploadRes.message);
    } catch (err) {
      console.log(
        "STEP: 3 => CUB STATEMENT UPLOAD TO SAILS ERRROR",
        err.message
      );
      throw new Error(err.message);
    }
  };

  // step: 1 if applicant submit request createCase
  const createCaseReq = async (data, url) => {
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
      if (
        caseRes.statusCode === NC_STATUS_CODE.NC200 ||
        caseRes.status === NC_STATUS_CODE.OK
      ) {
        return caseRes;
      }

      throw new Error(caseRes.message);
    } catch (er) {
      console.log("STEP: 1 => CASE CREATION ERRROR", er.message);
      throw new Error(er.message);
    }
  };

  const caseCreationSteps = async (data) => {
    try {
      // step 1: create case
      const caseCreateRes = await createCaseReq(data, CREATE_CASE);

      // step 2: upload documents reference [loanId from createcase]
      await updateDocumentList(caseCreateRes.loanId, USER_ROLES.User);

      // step 3: upload cub statement to sailspld
      await updateRefernceToSails(caseCreateRes.loanId, userToken, [
        otherCUBStatementUserTypeDetails.requestId,
        otherUserTypeCibilDetails.requestId,
      ]);

      // // step 4: loan assets request
      // await loanAssetsUpload(
      //   caseCreateRes.loanId,
      //   userToken
      //   // otherUserTypeDetails.requestId
      // );

      return caseCreateRes;
    } catch (er) {
      console.log("APPLICANT CASE CREATE STEP ERROR-----> ", er.message);
      addToast({
        message: er.message,
        type: "error",
      });
    }
  };

  const caseCreationReqOtherUser = async (loan, role, requestId) => {
    if (!loan) return false;
    try {
      await createCaseReq(
        {
          loan_ref_id: loan.loan_ref_id,
          applicantData: state[USER_ROLES[role]].applicantData,
          ...state[USER_ROLES[role]].loanData,
          cibilScore: userType
            ? state[USER_ROLES[role]].cibilData.cibilScore
            : otherUserTypeCibilDetails.cibilScore,
        },
        CREATE_CASE_OTHER_USER
      );

      await updateDocumentList(loan.loanId, USER_ROLES[role]);
      await updateRefernceToSails(loan.loanId, userToken, requestId);
      return true;
    } catch (err) {
      console.log("COAPPLICANT CASE CREATION STEPS ERRRO ==> ", err.message);
      addToast({
        message: err.message,
        type: "error",
      });
      return false;
    }
  };

  const onSubmit = async () => {
    if (buttonDisabledStatus()) {
      return;
    }

    setCaseCreationProgress(true);

    if (!userType) {
      const loanReq = await caseCreationSteps({
        white_label_id: whiteLabelId,
        product_id: productId,
        applicantData: state.user.applicantData,
        loanData: { ...state.user.loanData, productId },
        ...state.user.bankData,
        cibilScore: otherUserTypeCibilDetails.cibilScore,
      });

      if (!loanReq && !loanReq?.loanId) {
        setCaseCreationProgress(false);
        return;
      }

      if (state.coapplicant) {
        const coAppilcantCaseReq = await caseCreationReqOtherUser(
          loanReq,
          "Co-applicant",
          [
            state.coapplicant.cibilData.requestId,
            state.coapplicant.cubStatement.requestId,
            ...(state.coapplicant.cubStatement?.requestId
              ? [state.coapplicant.cubStatement?.requestId]
              : []),
          ]
        );
        if (!coAppilcantCaseReq) {
          setCaseCreationProgress(false);
          return;
        }
      }

      setCase(loanReq);
      setCompleted(id);
      onFlowChange(map.main);
    }
  };

  const onOtherStatementModalToggle = () => {
    setOtherBankStatementModal(!otherBankStatementModal);
  };

  const onSave = () => {
    if (buttonDisabledStatus()) {
      return;
    }

    // setOtherUserDetails(otherCUBStatementUserTypeDetails, USER_ROLES[userType]);
    setUsertypeStatementData(
      otherCUBStatementUserTypeDetails,
      USER_ROLES[userType]
    );

    setCompleted(id);
    setCompleted(map.mainPageId);
    onFlowChange(map.main);
  };

  const onSubmitGuarantor = async () => {
    if (buttonDisabledStatus()) {
      return;
    }

    setCaseCreationProgress(true);
    const GuarantorReq = await caseCreationReqOtherUser(
      caseDetails,
      "Guarantor",
      [
        state.guarantor.cibilData.requestId,
        ...(otherCUBStatementUserTypeDetails?.requestId
          ? [otherCUBStatementUserTypeDetails?.requestId]
          : []),
      ]
    );
    if (!GuarantorReq) {
      setCaseCreationProgress(false);
      return;
    }

    setCompleted(id);
    setCompleted(map.mainPageId);
    onFlowChange(map.main);
  };

  const onCibilModalClose = (success, data) => {
    if (!success) {
      setCibilCheckbox(false);
    }

    if (success) {
      if (userType) {
        setUsertypeCibilData(
          {
            cibilScore: data.cibilScore,
            requestId: data.requestId,
          },
          USER_ROLES[userType]
        );
      } else {
        setOtherUserTypeCibilDetails({
          cibilScore: data.cibilScore,
          requestId: data.requestId,
        });
      }
    }
    addToast({
      message: data.message,
      type: success ? "success" : "error",
    });

    setCibilCheckModal(false);
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
            onClick={onToggleCUBStatementModal}
            disabled={bankCUBStatementFetchDone}
          />
          <Button
            name="Get Other Bank Statements"
            onClick={onOtherStatementModalToggle}
          />
          <Button name="Get ITR documents" disabled />
        </ButtonWrapper>
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

      {otherBankStatementModal && (
        <BankStatementModal
          showModal={otherBankStatementModal}
          onClose={onOtherStatementModalToggle}
        />
      )}
      {toggleCUBStatementModal && (
        <GetCUBStatementModal
          showModal={toggleCUBStatementModal}
          onClose={onCUBStatementModalClose}
          setOtherUserTypeDetails={setOtherCUBStatementUserTypeDetails}
          userType={userType}
        />
      )}

      {cibilCheckbox && cibilCheckModal && (
        <GetCIBILScoreModal
          userData={{
            ...state[USER_ROLES[userType || "User"]]?.applicantData,
            ...state[USER_ROLES[userType || "User"]]?.loanData,
          }}
          onClose={onCibilModalClose}
        />
      )}

      {caseCreationProgress && (
        <Modal show={true} onClose={() => {}} width="50%">
          <Loading />
        </Modal>
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
