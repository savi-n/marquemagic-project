import styled from "styled-components";
import CryptoJS from "crypto-js";

import useFetch from "../../hooks/useFetch";
import { DOWNLOAD_CASE_DOCUMENTS } from "../../_config/branch.config";
import { NC_STATUS_CODE, SECRET } from "../../_config/app.config";

import Button from "../../components/Button";

const Wrapper = styled.div`
  /* border: 1px solid;
  border-radius: 10px;
  overflow: hidden; */
`;

const Title = styled.div`
  padding: 10px 20px;
  background: #e5e5e5;
`;

const DocumentListWrapper = styled.div`
  /* padding: 20px; */
`;

const DocumentDetailsRow = styled.div`
  display: flex;
  border: 1px solid grey;
  padding: 10px 20px;
  align-items: center;
`;

const DocumentName = styled.div`
  flex: 1;
`;

const DocumentType = styled.div`
  flex: 1;
`;

const DocumentAction = styled.div`
  /* flex: 1; */
`;

const Select = styled.select`
  /* height: 50px; */
  padding: 10px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
`;

const Message = styled.div`
  padding: 20px;
  text-align: center;
`;

const CloseBtn = styled.span`
  background: #f16a6a;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  /* align-self: center; */
  margin-left: 10px;
`;

function DocumentList({
  document,
  userToken,
  loanId,
  options,
  onDoctypeChange,
  onDeletDocument,
}) {
  const { newRequest } = useFetch();

  const onDownload = async (doc) => {
    const documentViewReq = await newRequest(
      DOWNLOAD_CASE_DOCUMENTS,
      {
        method: "POST",
        data: {
          filename: doc.fdKey,
          userid: doc.userId,
          loan_id: loanId,
        },
      },
      { Authorization: `Bearer ${userToken}` }
    );

    const documentViewRes = documentViewReq?.data;

    if (documentViewRes.status === NC_STATUS_CODE.OK) {
      let rawData = CryptoJS.enc.Base64.parse(documentViewRes.signedurl);
      let key = CryptoJS.enc.Latin1.parse(SECRET);
      let iv = CryptoJS.enc.Latin1.parse(SECRET);
      let plaintextData = CryptoJS.AES.decrypt({ ciphertext: rawData }, key, {
        iv: iv,
      });
      let plaintext = plaintextData.toString(CryptoJS.enc.Latin1);
      window.open(plaintext);
    }
  };

  return (
    <DocumentDetailsRow>
      <DocumentName>
        <Button onClick={() => onDownload(document)}>
          <div>{document.docName}</div>
        </Button>
      </DocumentName>

      <DocumentType>
        <Select
          value={document.docType}
          onChange={(e) => onDoctypeChange(document, e.target.value)}
        >
          <option value="" disabled>
            Select Document Type
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </Select>
      </DocumentType>
      <DocumentAction>
        <CloseBtn onClick={() => onDeletDocument(document)}>&#10006;</CloseBtn>
      </DocumentAction>
    </DocumentDetailsRow>
  );
}

export default function DocumentView({
  title,
  loanId,
  documents = [],
  userToken,
  options,
  onDoctypeChange = () => {},
  onDeletDocument = () => {},
}) {
  return (
    <Wrapper>
      <Title>{title}</Title>
      <DocumentListWrapper>
        {documents.map((doc) => (
          <DocumentList
            key={doc.id}
            document={doc}
            loanId={loanId}
            userToken={userToken}
            options={options}
            onDoctypeChange={onDoctypeChange}
            onDeletDocument={onDeletDocument}
          />
        ))}

        {!documents.length && <Message>Documents Not Found</Message>}
      </DocumentListWrapper>
    </Wrapper>
  );
}
