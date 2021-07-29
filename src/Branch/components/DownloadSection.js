import { useEffect, useState } from "react";

import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import CryptoJS from "crypto-js";

import Button from "../../components/Button";
import useFetch from "../../hooks/useFetch";
import {
  DOWNLOAD_CASE_DOCUMENTS,
  VIEW_CASE_DOCUMENTS_LIST,
  // VIEW_CASE_DOCUMENTS_LIST_UIUX,
} from "../../_config/branch.config";

import {
  NC_STATUS_CODE,
  WHITELABEL_ENCRYPTION_API,
  SECRET,
} from "../../_config/app.config";

const SectionWrap = styled.section`
  margin-top: 20px;
  /* position: absolute;
  left: 0;
  top: 95%;
  right: 0;
  background: white;
  box-shadow: rgb(152 175 199) 0px 20px 19px 0px;
  z-index: 9999;
  backdrop-filter: blur(20px); */
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const Message = styled.div`
  font-size: 15px;
  color: darkgray;
  text-align: center;
`;

const Content = styled.div`
  margin-bottom: 20px;
`;

const LoaderCircle = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(15px);
  padding: 20px;

  &:before {
    content: "";
    border: 5px solid #e2e1e1;
    border-bottom-color: #4750cf;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: rotating 2s linear infinite;
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const File = styled.div`
  padding: 5px 10px;
  background: #eaeaea;
  display: flex;
  align-items: center;
  margin: 10px 0;
  border-radius: 5px;
  font-size: 13px;
`;

const Div = styled.div`
  max-height: 200px;
  overflow: auto;
`;

const Col = styled.div`
  width: ${({ width }) => width || "auto"};
  padding: 5px 0;
  flex: 1;
  padding-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Btn = styled.button``;

const DocTypeNC = "Namastecredit Documents";

export default function DownloadSection({
  getCLicker,
  item,
  userId,
  userToken,
}) {
  const [loading, setLoading] = useState(true);

  const [documentList, setDocumentList] = useState(null);

  const [encryptedWhiteLabelId, setEncryptedWhiteLabelId] = useState(null);

  const { newRequest } = useFetch();

  const FetchDocumentLists = async () => {
    try {
      const encryptWhiteLabelReq = await newRequest(
        WHITELABEL_ENCRYPTION_API,
        {
          method: "GET",
        },
        { Authorization: `Bearer ${userToken}` }
      );

      const encryptedWLId =
        encryptWhiteLabelReq?.data?.encrypted_whitelabel?.[0] || null;

      setEncryptedWhiteLabelId(encryptedWLId);

      if (encryptedWLId) {
        // const documentListReq = await newRequest(
        //   VIEW_CASE_DOCUMENTS_LIST_UIUX({
        //     loanId: item?.loan_id,
        //   }),
        //   {
        //     method: "GET",
        //   },
        //   { Authorization: `Bearer ${userToken}` }
        // );

        const documentListReq = await newRequest(
          VIEW_CASE_DOCUMENTS_LIST({
            caseId: item?.loan_ref_id,
            whiteLabel: encryptedWLId,
          }),
          {
            method: "GET",
          },
          { Authorization: `Bearer ${userToken}` }
        );

        const documentsListRes = documentListReq?.data;

        if (documentsListRes.status === NC_STATUS_CODE.OK) {
          setDocumentList(documentsListRes.data);
        }
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    FetchDocumentLists();
  }, []);

  const onDownload = async (doc) => {
    const documentViewReq = await newRequest(
      DOWNLOAD_CASE_DOCUMENTS,
      {
        method: "POST",
        data: {
          filename: doc.document_fd_key,
          userid: doc.uploadedBy,
          loan_id: item?.loan_id,
        },
      },
      { Authorization: `Bearer ${userToken}` }
    );

    const documentViewRes = documentViewReq?.data;

    if (documentViewRes.status === NC_STATUS_CODE.OK) {
      var rawData = CryptoJS.enc.Base64.parse(documentViewRes.signedurl);
      var key = CryptoJS.enc.Latin1.parse(SECRET);
      var iv = CryptoJS.enc.Latin1.parse(SECRET);
      var plaintextData = CryptoJS.AES.decrypt({ ciphertext: rawData }, key, {
        iv: iv,
      });
      var plaintext = plaintextData.toString(CryptoJS.enc.Latin1);
      window.open(plaintext);
    }
  };

  const documentsToShow = documentList?.filter(
    (doc) => doc.document_type.toLowerCase() === DocTypeNC.toLowerCase()
  );

  return (
    <SectionWrap>
      <Content>
        {loading && <LoaderCircle />}
        {!loading && documentList && (
          <Div>
            {documentsToShow.map((doc) => (
              <File key={doc.document_fd_key}>
                <Col title={doc.document_name} width={"45%"}>
                  {doc.document_name}
                </Col>
                <Col width={"45%"} title={doc.document_type_name}>
                  {doc.document_type_name}
                </Col>
                <div>
                  <Btn onClick={(e) => onDownload(doc)}>
                    <FontAwesomeIcon icon={faDownload} />
                  </Btn>
                </div>
              </File>
            ))}
          </Div>
        )}
        {!loading && !documentList && documentsToShow.length && (
          <Message>No Documents Found</Message>
        )}
      </Content>
      <ButtonWrapper>
        <Button
          roundCorner
          name="Cancel"
          width="50px"
          onClick={() => getCLicker(null)}
        />
      </ButtonWrapper>
    </SectionWrap>
  );
}
