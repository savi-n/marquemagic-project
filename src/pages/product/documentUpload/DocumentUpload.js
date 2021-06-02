import { useState, useRef, useContext } from "react";
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
  NC_STATUS_CODE,
} from "../../../_config/app.config";
import BankStatementModal from "../../../components/BankStatementModal";
import useFetch from "../../../hooks/useFetch";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { StoreContext } from "../../../utils/StoreProvider";

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

const FileLabel = styled.label`
  height: 200px;
  width: 100%;
  background: grey;
  display: block;
  cursor: pointer;
`;

const UploadWrapper = styled.div`
  padding: 30px 0;
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

export default function DocumentUpload({ userType, productId, id }) {
  const {
    state: { whiteLabelId },
  } = useContext(StoreContext);

  const {
    state: { userId, userToken },
  } = useContext(UserContext);

  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const { state } = useContext(FormContext);
  const history = useHistory();

  const { newRequest } = useFetch();

  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  const uploadedFiles = useRef([]);

  const [showModal, setShowModal] = useState(false);

  const handleFileUpload = async (files) => {
    Promise.all(
      files.map((file) => {
        const formData = new FormData();
        formData.append("document", file);

        return newRequest(
          DOCS_UPLOAD_URL({ userId }),
          {
            method: "POST",
            data: formData,
          },
          {
            Authorization: `Bearer ${userToken}`,
          }
        )
          .then((res) => {
            if (res.data.status === "ok") {
              const file = res.data.files[0];
              const uploadfile = {
                doc_type_id: "1",
                upload_doc_name: file.filename,
                document_key: file.fd,
                size: file.size,
              };
              uploadedFiles.current = [...uploadedFiles.current, uploadfile];
            }
            return res.data.files[0];
          })
          .catch((err) => err);
      })
    ).then((files) => console.log(files));
  };

  const updateDocumentList = async (loanId) => {
    const submitReq = await newRequest(
      BORROWER_UPLOAD_URL,
      {
        method: "POST",
        data: {
          upload_document: uploadedFiles.current.map((d) => ({
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

  const createCase = async (data) => {
    try {
      const caseReq = await newRequest(
        CREATE_CASE,
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
        const docsReq = await updateDocumentList(caseRes.loanId);
        const docsRes = docsReq.data;
        if (docsRes.status === NC_STATUS_CODE.OK) {
          return caseRes;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async () => {
    if (!(checkbox1 && checkbox2)) {
      return;
    }

    if (!userType) {
      const loanReq = await createCase({
        white_label_id: whiteLabelId,
        product_id: productId,
        ...state,
      });

      // if (loanReq.loanId) {
      //   await createCase({
      //     loan_ref_id: loanReq.loan_ref_id,
      //     ...state.coaplicant,
      //   });
      // }

      setCompleted(id);
      history.push(flowMap[id].main);
    }
  };

  const onButtonClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <Colom1>
        <H>
          {userType ?? "Help Us with"} <span>Document Upload</span>
        </H>
        <UploadWrapper>
          <FileUpload onDrop={handleFileUpload} accept="" />
        </UploadWrapper>

        <ButtonWrapper>
          <Button name="Get CUB Statement" onClick={onButtonClick} />
          <Button name="Get Other Bank Statements" onClick={onButtonClick} />
          <Button name="Get ITR documents" onClick={onButtonClick} />
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
          <Button
            name="Submit"
            fill="blue"
            style={{
              width: "200px",
              background: "blue",
            }}
            disabled={!(checkbox1 && checkbox2)}
            onClick={onSubmit}
          />
          {userType && (
            <Button
              name="Save"
              style={{
                width: "200px",
              }}
              disabled={!(checkbox1 && checkbox2)}
            />
          )}
        </SubmitWrapper>
      </Colom1>
      <Colom2>
        <Doc>Documents Required</Doc>
        <div>
          {documentsRequired.map((docs) => (
            <DocsCheckboxWrapper key={uuidv4()}>
              <CheckBox name={docs} checked={true} disabled round bg="green" />
            </DocsCheckboxWrapper>
          ))}
        </div>
      </Colom2>
      {showModal && (
        <BankStatementModal
          showModal={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

DocumentUpload.defaultProps = {
  userType: null,
};

DocumentUpload.propTypes = {
  userType: oneOf(["", "Gurantor", "Co-applicant"]),
};
