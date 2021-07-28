import { useState, useContext, useEffect, Fragment } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string, oneOf } from "prop-types";

import { UserContext } from "../../../reducer/userReducer";
import Button from "../../../components/Button";
import CheckBox from "../../../shared/components/Checkbox/CheckBox";
import FileUpload from "../../../shared/components/FileUpload/FileUpload";
import {
  DOCS_UPLOAD_URL,
  USER_ROLES,
  DOCTYPES_FETCH,
  PINCODE_ADRRESS_FETCH,
} from "../../../_config/app.config";
import { DOCUMENTS_TYPE } from "../../../_config/key.config";
import BankStatementModal from "../../../components/BankStatementModal";
import GetCUBStatementModal from "../../../components/GetCUBStatementModal";
import GetCIBILScoreModal from "../../../components/GetCIBILScoreModal";
import useFetch from "../../../hooks/useFetch";
import { useToasts } from "../../../components/Toast/ToastProvider";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
// import { AppContext } from "../../../reducer/appReducer";
// import { CaseContext } from "../../../reducer/caseReducer";
import Loading from "../../../components/Loading";
import Modal from "../../../components/Modal";
import useCaseCreation from "../../../components/CaseCreation";

const DocTypeHead = styled.div`
  font-weight: 600;
  margin: 10px 0;
`;

const Colom1 = styled.div`
  flex: 1;
  padding: 50px;
`;

const DivWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: space-between;
  margin-left: auto;
  /* margin-bottom: 10px; */
`;

const Question = styled.div`
  font-weight: 500;
  color: blue;
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
  margin: 10px 0;
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
  productId: object.isRequired,
};

export default function DocumentUpload({
  productDetails,
  userType,
  id,
  onFlowChange,
  map,
  productId,
}) {
  // const {
  //   state: { whiteLabelId, clientToken },
  // } = useContext(AppContext);

  const {
    state: { userId, userToken, userBankDetails },
  } = useContext(UserContext);

  const {
    actions: { setCompleted, activateSubFlow },
  } = useContext(FlowContext);

  const {
    state,
    actions: {
      setUsertypeDocuments,
      removeUserTypeDocument,
      setUserTypeDocumentType,
      setUsertypeCibilData,
      setUsertypeStatementData,
    },
  } = useContext(FormContext);

  const { processing, caseCreationUserType } = useCaseCreation(
    "Co-applicant",
    productId[
      (state[USER_ROLES[userType || "User"]]?.applicantData?.incomeType)
    ] || "",
    "Co-applicant"
  );

  // const {
  //   state: { caseDetails },
  //   actions: { setCase },
  // } = useContext(CaseContext);

  const { response, newRequest } = useFetch({
    url: DOCTYPES_FETCH,
    options: {
      method: "POST",
      data: {
        business_type:
          state[USER_ROLES[userType || "User"]]?.applicantData?.incomeType ===
          "salaried"
            ? 7
            : 1,
        loan_product:
          productId[
            (state[USER_ROLES[userType || "User"]]?.applicantData?.incomeType)
          ],
      },
    },
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  useEffect(() => {
    if (response && !response?.status) {
      let optionArray = [];
      DOCUMENTS_TYPE.forEach((docType) => {
        optionArray = [
          ...optionArray,
          ...response?.[docType[1]]?.map((dT) => ({
            value: dT.doc_type_id,
            name: dT.name,
            main: docType[0],
          })),
        ];
      });
      setDocumentTypeOptions(optionArray);
    }
  }, [response]);

  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);

  const { addToast } = useToasts();

  const [cibilCheckbox, setCibilCheckbox] = useState(false);
  const [declareCheck, setDeclareCheck] = useState(false);

  const [otherBankStatementModal, setOtherBankStatementModal] = useState(false);

  const [toggleCUBStatementModal, setToggleCUBStatementModal] = useState(false);
  const [bankCUBStatementFetchDone, setBankCUBStatementFetchDone] = useState(
    false
  );

  const [
    otherCUBStatementUserTypeDetails,
    setOtherCUBStatementUserTypeDetails,
  ] = useState(null);

  const [cibilCheckModal, setCibilCheckModal] = useState(false);

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

  const handleFileRemove = async (file) => {
    removeUserTypeDocument(file, USER_ROLES[userType || "User"]);
  };

  const handleDocumentTypeChange = async (fileId, type) => {
    // setDocumentChecklist([...documentChecklist, type]);
    setUserTypeDocumentType(fileId, type, USER_ROLES[userType || "User"]);
  };

  const buttonDisabledStatus = () => {
    return !declareCheck || processing;
    // return (
    //   caseCreationProgress ||
    //   !(!!userType || bankCUBStatementFetchDone) ||
    //   !(cibilCheckbox && declareCheck) ||
    //   caseCreationProgress ||
    //   !(
    //     documentChecklist.length === productDetails[DOCUMENTS_REQUIRED].length
    //   ) ||
    //   !state[USER_ROLES[userType || "User"]]?.uploadedDocs?.length
    // );
  };

  const [proceed, setProceed] = useState(null);
  useEffect(() => {
    async function request() {
      const res = await caseCreationUserType();
      if (res) {
        setCompleted(id);
        onFlowChange(proceed?.flow);
      }
      setProceed(null);
    }

    if (proceed) {
      request();
    }
  }, [proceed]);

  const onSubmitCopplicant = (flow) => {
    return () => {
      setUsertypeStatementData(
        otherCUBStatementUserTypeDetails,
        USER_ROLES[userType]
      );
      setProceed({ flow });
    };
  };

  const onSubmit = async () => {
    if (buttonDisabledStatus()) {
      return;
    }

    setUsertypeStatementData(
      otherCUBStatementUserTypeDetails,
      USER_ROLES[userType]
    );
    setCompleted(id);
    onFlowChange(map.main);
  };

  const onOtherStatementModalToggle = () => {
    setOtherBankStatementModal(!otherBankStatementModal);
  };

  const [saved, setSaved] = useState(false);

  const onSave = () => {
    if (buttonDisabledStatus()) {
      return;
    }

    // setOtherUserDetails(otherCUBStatementUserTypeDetails, USER_ROLES[userType]);
    setUsertypeStatementData(
      otherCUBStatementUserTypeDetails,
      USER_ROLES[userType || "User"]
    );
    setSaved(true);
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });

    // setCompleted(id);
    // setCompleted(map.mainPageId);
    // onFlowChange(map.main);
  };

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
        USER_ROLES[userType || "User"]
      );
    }
    addToast({
      message: data.message,
      type: success ? "success" : "error",
    });

    setCibilCheckModal(false);
  };

  const documentChecklist =
    state[USER_ROLES[userType || "User"]]?.uploadedDocs?.map(
      (docs) => docs.typeName
    ) || [];

  const subFlowActivate = async () => {
    const res = await caseCreationUserType();
    if (res) {
      activateSubFlow(id);
      onFlowChange(map.hidden);
    }
  };

  const [userAddress, setUserAddress] = useState();

  useEffect(() => {
    if (!userType) {
      getAddressDetails();
    }
  }, [userType]);

  const getAddressDetails = async () => {
    const response = await newRequest(
      PINCODE_ADRRESS_FETCH({ pinCode: userBankDetails?.pin || "" }),
      {}
    );
    const data = response.data;

    setUserAddress({
      address1: userBankDetails?.address1 || "",
      address2: userBankDetails?.address2 || "",
      address3: userBankDetails?.address3 || "",
      address4: userBankDetails?.address4 || "",
      city: data?.district?.[0] || "",
      state: data?.state?.[0] || "",
      pinCode: userBankDetails?.pin || "",
    });
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
            onRemoveFile={handleFileRemove}
            docTypeOptions={documentTypeOptions}
            documentTypeChangeCallback={handleDocumentTypeChange}
            upload={{
              url: DOCS_UPLOAD_URL({ userId: userId || "" }),
              header: {
                Authorization: `Bearer ${userToken ?? ""}`,
              },
            }}
          />
        </UploadWrapper>

        <ButtonWrapper>
          {map.actions["cub-statement"]?.show && (
            <Button
              name="Get CUB Statement"
              onClick={onToggleCUBStatementModal}
              disabled={bankCUBStatementFetchDone}
            />
          )}

          {map.actions["other-bank-statement"]?.show && (
            <Button
              name="Get Other Bank Statements"
              onClick={onOtherStatementModalToggle}
            />
          )}
          {map.actions["itr-fetch"]?.show && (
            <Button name="Get ITR documents" disabled />
          )}
        </ButtonWrapper>
        <CheckboxWrapper>
          {map.actions["cibil-fetch"]?.show && (
            <CheckBox
              name={textForCheckbox.grantCibilAcces}
              checked={cibilCheckbox}
              disabled={cibilCheckbox}
              onChange={() => {
                setCibilCheckbox(!cibilCheckbox);
                setCibilCheckModal(true);
              }}
              bg="blue"
            />
          )}
          {map.actions["agreement"]?.show && (
            <CheckBox
              name={textForCheckbox.declaration}
              checked={declareCheck}
              onChange={() => setDeclareCheck(!declareCheck)}
              bg="blue"
            />
          )}
        </CheckboxWrapper>
        <SubmitWrapper>
          {!userType && (
            <>
              <Button
                name="Proceed"
                fill
                style={{
                  width: "200px",
                  background: "blue",
                }}
                disabled={buttonDisabledStatus()}
                onClick={onSubmit}
              />
              {/* <Button
                name="Save"
                style={{
                  width: "200px",
                }}
                onClick={onSave}
                disabled={buttonDisabledStatus()}
              /> */}
            </>
          )}
          {userType === "Co-applicant" && (
            <>
              <Button
                name="Proceed"
                fill
                style={{
                  width: "200px",
                  background: "blue",
                }}
                disabled={buttonDisabledStatus()}
                onClick={onSubmitCopplicant(map.sub)}
              />
              {/* <Button
                name="Save"
                style={{
                  width: "200px",
                }}
                onClick={onSave}
                disabled={buttonDisabledStatus()}
              /> */}
            </>
          )}
          {/* {userType === "Guarantor" && (
            <>
              <Button
                name="Submit"
                style={{
                  width: "200px",
                }}
                onClick={onSubmitGuarantor}
                disabled={buttonDisabledStatus()}
              />
              <Button
                name="Save"
                style={{
                  width: "200px",
                }}
                onClick={onSave}
                disabled={buttonDisabledStatus()}
              />
            </>
          )} */}

          {userType === "Co-applicant" && map.hidden && (
            <DivWrap>
              <Question>Gurantor?</Question>
              <Button
                width="auto"
                fill
                name="Add"
                disabled={buttonDisabledStatus()}
                onClick={onSubmitCopplicant(map.hidden)}
              />
            </DivWrap>
          )}
        </SubmitWrapper>
      </Colom1>
      <Colom2>
        <Doc>Documents Required</Doc>
        <div>
          {DOCUMENTS_TYPE.map((docType) =>
            response?.[docType[1]]?.length ? (
              <Fragment key={docType[0]}>
                <DocTypeHead>{docType[0]}</DocTypeHead>
                {response?.[docType[1]]?.map((doc) => (
                  <DocsCheckboxWrapper key={doc.doc_type_id}>
                    <CheckBox
                      name={doc.name}
                      checked={documentChecklist.includes(doc.name)}
                      // onChange={handleDocumentChecklist(docs)}
                      round
                      disabled
                      bg="green"
                    />
                  </DocsCheckboxWrapper>
                ))}
              </Fragment>
            ) : null
          )}
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
            ...{
              ...state[USER_ROLES[userType || "User"]]?.applicantData,
              ...(!userType && {
                address: [userAddress],
              }),
            },
            ...state[USER_ROLES[userType || "User"]]?.loanData,
          }}
          onClose={onCibilModalClose}
        />
      )}

      {processing && (
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
