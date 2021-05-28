import { useState, useRef } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { oneOf } from "prop-types";
import Button from "../components/Button";
import CheckBox from "../shared/components/Checkbox/CheckBox";
import FileUpload from "../shared/components/FileUpload/FileUpload";
import { DOCS_UPLOAD_URL, BORROWER_UPLOAD_URL } from "../_config/app.config";
import BankStatementModal from "../components/BankStatementModal";
import useFetch from "../hooks/useFetch";

const Colom1 = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.themeColor1};
  padding: 50px;
`;

const Colom2 = styled.div`
  width: 40%;
  background: ${({ theme }) => theme.themeColor1};
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

export default function DocumentUpload({ userType }) {
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
          DOCS_UPLOAD_URL("userId"),
          {
            method: "POST",
            data: formData,
          },
          {
            Authorization: `Bearer ${"token"}`,
          }
        )
          .then((response) => response.json())
          .then((res) => {
            if (res.status === "ok") {
              const file = res.files[0];
              const uploadfile = {
                product_id: "",
                doc_type_id: [213, 225],
                upload_doc_name: file.filename,
                document_key: file.fd,
                size: file.size,
              };
              uploadedFiles.current.push(uploadfile);
            }
            return res.files[0];
          })
          .catch((err) => err);
      })
    ).then((files) => console.log(files));
  };

  const onSubmit = async () => {
    const submitReq = await newRequest(
      BORROWER_UPLOAD_URL,
      {
        method: "POST",
        data: uploadedFiles.current,
      },
      {
        Authorization: `Bearer ${"token"}`,
      }
    );
  };

  const onButtonClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <Colom1>
        <h2>
          {userType ?? "Help Us with"} <span>Document Upload</span>
        </h2>
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
            onChange={(state) => setCheckbox1(state)}
            bg="blue"
          />
          <CheckBox
            name={text.declaration}
            checked={checkbox2}
            onChange={(state) => setCheckbox2(state)}
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
          />
          <Button
            name="Save"
            style={{
              width: "200px",
            }}
          />
        </SubmitWrapper>
      </Colom1>
      <Colom2>
        <h3>Documents Required</h3>
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
