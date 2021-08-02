import { useState, useEffect } from "react";
import CryptoJS from "crypto-js";

import useFetch from "../../hooks/useFetch";
import FileUpload from "../../shared/components/FileUpload/FileUpload";
import { DOCS_UPLOAD_URL_LOAN } from "../../_config/app.config";
import Button from "../shared/components/Button";
import CheckBox from "../../shared/components/Checkbox/CheckBox";
import {
  NC_STATUS_CODE,
  WHITELABEL_ENCRYPTION_API,
  SECRET,
} from "../../_config/app.config";
import {
  DOWNLOAD_CASE_DOCUMENTS,
  VIEW_CASE_DOCUMENTS_LIST,
} from "../../_config/branch.config";

const cooap = (data, type) => {
  return data?.directors.find(
    (e) => e?.type_name.toLowerCase() === type.toLowerCase() && e.id
  );
};

export default function DocumentUploadSection({
  userToken,
  item,
  loanData,
  option,
  handleFileUpload,
  handleDocumentTypeChange,
  changeHandler,
  removeHandler,
  docs,
  setDocs,
  docsUploaded,
  App,
  viewDocument,
  docType,
  checkDocType,
  coApp,
  setError,
  setMessage,
  borrowerDocUpload,
  file,
}) {
  const appplicantId = loanData?.business_id?.userid;

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

  const applicantDocs = documentList?.filter(
    (docs) => docs.uploadedBy === appplicantId
  );

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
    <>
      <section className="flex flex-col gap-y-5 w-8/12">
        <p className="text-blue-600 font-medium text-xl">
          Applicant Documents Uploaded
        </p>
        <FileUpload
          accept=""
          upload={{
            url: DOCS_UPLOAD_URL_LOAN({
              userId: appplicantId,
            }),
            header: {
              Authorization: `Bearer ${userToken}`,
            },
          }}
          docTypeOptions={option}
          onDrop={handleFileUpload}
          documentTypeChangeCallback={handleDocumentTypeChange}
          // branch={true}
          changeHandler={changeHandler}
          onRemoveFile={(e) => removeHandler(e)}
          docsPush={true}
          docs={docs}
          loan_id={loanData?.id}
          directorId={loanData?.directors?.[0].id}
          setDocs={setDocs}
        />
        <section className="flex gap-x-4 flex-col flex-wrap gap-y-4">
          {applicantDocs?.length > 0 && (
            <>
              <section>
                <span>KYC Docs</span>
                {applicantDocs?.map(
                  (j, idx) =>
                    j.document_type === "KYC Documents" && (
                      <section className="py-2 flex justify-evenly items-center w-full">
                        <section className="w-full">
                          <Button
                            type="blue-light"
                            onClick={() =>
                              viewDocument(
                                loanData?.id,
                                j.uploadedBy,
                                j.document_fd_key
                              )
                            }
                          >
                            {j.document_name}
                          </Button>
                        </section>
                      </section>
                    )
                )}
              </section>
              <section>
                <span>Financial Docs</span>
                {applicantDocs?.map(
                  (j, idx) =>
                    j.document_type === "Financial Documents" && (
                      <section className="py-2 flex justify-evenly items-center w-full">
                        <section className="w-full">
                          <Button
                            type="blue-light"
                            onClick={() =>
                              viewDocument(
                                loanData?.id,
                                j.uploadedBy,
                                j.document_fd_key
                              )
                            }
                          >
                            {j.document_name}
                          </Button>
                        </section>
                      </section>
                    )
                )}
              </section>
              <section>
                <span>Other Docs</span>
                {applicantDocs?.map(
                  (j, idx) =>
                    j.document_type === "Other Documents" && (
                      <section className="py-2 flex justify-evenly items-center w-full">
                        <section className="w-full">
                          <Button
                            type="blue-light"
                            onClick={() =>
                              viewDocument(
                                loanData?.id,
                                j.uploadedBy,
                                j.document_fd_key
                              )
                            }
                          >
                            {j.document_name}
                          </Button>
                        </section>
                      </section>
                    )
                )}
              </section>
            </>
          )}
        </section>
      </section>
      {docType && (
        <section className="fixed overflow-scroll z-10 right-0 w-1/4 bg-gray-200 p-4 h-full top-24 py-16">
          {Object.keys(docType).map((el) => (
            <section className="py-6">
              <p className="font-semibold">{el}</p>
              {docType[el].map((doc) => (
                <section>
                  <CheckBox
                    name={doc.name}
                    round
                    disabled
                    bg="green"
                    checked={checkDocType.includes(doc.name)}
                  />
                </section>
              ))}
            </section>
          ))}
        </section>
      )}
      {cooap(loanData, "Co-Applicant")?.id && (
        <section className="flex flex-col space-y-5 w-8/12">
          <p className="text-blue-600 font-medium text-xl">
            Co-Applicant Documents Uploaded
          </p>
          <FileUpload
            accept=""
            upload={{
              url: DOCS_UPLOAD_URL_LOAN({
                userId: cooap(loanData, "Co-Applicant")?.id,
              }),
              header: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }}
            docTypeOptions={option}
            onDrop={handleFileUpload}
            documentTypeChangeCallback={handleDocumentTypeChange}
            changeHandler={changeHandler}
            onRemoveFile={(e) => removeHandler(e)}
            docsPush={true}
            docs={docs}
            loan_id={loanData?.id}
            directorId={cooap(loanData, "Co-Applicant")?.id}
            setDocs={setDocs}
          />
          <section className="flex flex-col gap-x-4 flex-wrap gap-y-4">
            {docsUploaded.length > 0 && (
              <>
                <section>
                  <span>KYC Docs</span>
                  {docsUploaded
                    .filter((docs) => coApp.includes(docs.directorId))
                    .map(
                      (j, idx) =>
                        j.document_type === "KYC Documents" && (
                          <section className="py-2 flex justify-evenly items-center w-full">
                            <section className="w-full">
                              <Button
                                type="blue-light"
                                onClick={() =>
                                  viewDocument(
                                    loanData?.id,
                                    j.uploadedBy,
                                    j.document_fd_key
                                  )
                                }
                              >
                                {j.document_name}
                              </Button>
                            </section>
                          </section>
                        )
                    )}
                </section>
                <section>
                  <span>Financial Docs</span>
                  {docsUploaded
                    .filter((docs) => coApp.includes(docs.directorId))
                    .map(
                      (j, idx) =>
                        j.document_type === "Financial Documents" && (
                          <section className="py-2 flex justify-evenly items-center w-full">
                            <section className="w-full">
                              <Button
                                type="blue-light"
                                onClick={() =>
                                  viewDocument(
                                    loanData?.id,
                                    j.uploadedBy,
                                    j.document_fd_key
                                  )
                                }
                              >
                                {j.document_name}
                              </Button>
                            </section>
                          </section>
                        )
                    )}
                </section>
                <section>
                  <span>Other Docs</span>
                  {docsUploaded
                    .filter((docs) => coApp.includes(docs.directorId))
                    .map(
                      (j, idx) =>
                        j.document_type === "Other Documents" && (
                          <section className="py-2 flex justify-evenly items-center w-full">
                            <section className="w-full">
                              <Button
                                type="blue-light"
                                onClick={() =>
                                  viewDocument(
                                    loanData?.id,
                                    j.uploadedBy,
                                    j.document_fd_key
                                  )
                                }
                              >
                                {j.document_name}
                              </Button>
                            </section>
                          </section>
                        )
                    )}
                </section>
              </>
            )}
          </section>
        </section>
      )}
      <Button
        onClick={() => {
          borrowerDocUpload(file).then((res) => {
            if (res === "Error in uploading") {
              setError(true);
              setTimeout(() => {
                setError(false);
              }, 4000);
            } else {
              setMessage(true);
              setTimeout(() => {
                setMessage(false);
              }, 4000);
              setDocs([]);
            }
          });
        }}
        disabled={docs.length === 0 ? true : false}
        type="blue"
        rounded="rfull"
        size="small"
      >
        Submit
      </Button>
    </>
  );
}
