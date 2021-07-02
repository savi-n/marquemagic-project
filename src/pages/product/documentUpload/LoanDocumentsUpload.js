import { useState, useContext } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { func, object, oneOfType, string, oneOf } from "prop-types";

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
  USER_ROLES,
} from "../../../_config/app.config";
import { DOCUMENTS_REQUIRED } from "../../../_config/key.config";
// import BankStatementModal from "../../../components/BankStatementModal";
// import GetCUBStatementModal from "../../../components/GetCUBStatementModal";
// import GetCIBILScoreModal from "../../../components/GetCIBILScoreModal";
import useFetch from "../../../hooks/useFetch";
import { useToasts } from "../../../components/Toast/ToastProvider";
import { BussinesContext } from "../../../reducer/bussinessReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { AppContext } from "../../../reducer/appReducer";
// import { CaseContext } from "../../../reducer/caseReducer";
// import Loading from "../../../components/Loading";
// import Modal from "../../../components/Modal";

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
      business_type: "",
      business_email: data?.["business-details"].EmailId,
      contact: "",
    },
    loan_details: {
      loan_product_id: data.productId,
      white_label_id: companyData.encryptedWhitelabel,
    },
    document: {
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
    return;
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
        // Authorization: `Bearer ${userToken}`,
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
      const caseCreateRes = await createCaseReq();

      // step 2: upload documents reference [loanId from createcase]
      // await updateDocumentList(caseCreateRes.loanId, USER_ROLES.User);

      // step 3: upload cub statement to sailspld
      // await updateRefernceToSails(caseCreateRes.loanId, userToken, [
      //   ...(otherCUBStatementUserTypeDetails?.requestId
      //     ? [otherCUBStatementUserTypeDetails?.requestId]
      //     : []),
      //   ...(otherUserTypeCibilDetails?.requestId
      //     ? otherUserTypeCibilDetails?.requestId
      //     : []),
      // ]);

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

  //   const onOtherStatementModalToggle = () => {
  //     setOtherBankStatementModal(!otherBankStatementModal);
  //   };

  //   const onSave = () => {
  //     if (buttonDisabledStatus()) {
  //       return;
  //     }

  //     // setOtherUserDetails(otherCUBStatementUserTypeDetails, USER_ROLES[userType]);
  //     setUsertypeStatementData(
  //       otherCUBStatementUserTypeDetails,
  //       USER_ROLES[userType]
  //     );

  //     setCompleted(id);
  //     setCompleted(map.mainPageId);
  //     onFlowChange(map.main);
  //   };

  //   const onSubmitGuarantor = async () => {
  //     if (buttonDisabledStatus()) {
  //       return;
  //     }

  //     setCaseCreationProgress(true);
  //     const GuarantorReq = await caseCreationReqOtherUser(
  //       caseDetails,
  //       "Guarantor",
  //       [
  //         ...(state.guarantor.cibilData.requestId
  //           ? state.guarantor?.cibilData?.requestId
  //           : []),
  //         ...(otherCUBStatementUserTypeDetails?.requestId
  //           ? [otherCUBStatementUserTypeDetails?.requestId]
  //           : []),
  //       ]
  //     );
  //     if (!GuarantorReq) {
  //       setCaseCreationProgress(false);
  //       return;
  //     }

  //     setCompleted(id);
  //     setCompleted(map.mainPageId);
  //     onFlowChange(map.main);
  //   };

  //   const onCibilModalClose = (success, data) => {
  //     if (!success) {
  //       setCibilCheckbox(false);
  //     }

  //     if (success) {
  //       if (userType) {
  //         setUsertypeCibilData(
  //           {
  //             cibilScore: data.cibilScore,
  //             requestId: data.requestId,
  //           },
  //           USER_ROLES[userType]
  //         );
  //       } else {
  //         setOtherUserTypeCibilDetails({
  //           cibilScore: data.cibilScore,
  //           requestId: data.requestId,
  //         });
  //       }
  //     }
  //     addToast({
  //       message: data.message,
  //       type: success ? "success" : "error",
  //     });

  //     setCibilCheckModal(false);
  //   };

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

        {/* <ButtonWrapper>
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
          {/* {userType === "Co-applicant" && (
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
          )} */}
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

      {/* {otherBankStatementModal && (
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
      )} */}
    </>
  );
}
