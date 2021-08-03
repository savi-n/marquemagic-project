import { useState } from "react";

import FileUpload from "../../shared/components/FileUpload/FileUpload";
import Button from "../shared/components/Button";
import {
  DOCS_UPLOAD_URL_LOAN,
  BORROWER_UPLOAD_URL,
  NC_STATUS_CODE,
} from "../../_config/app.config";
import { borrowerDocUpload } from "../utils/requests";
import useFetch from "../../hooks/useFetch";

export default function CardFileUpload({
  item,
  option,
  getCLicker,
  docs,
  userToken,
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { newRequest } = useFetch();

  const handleDocumentTypeChange = async (fileId, type) => {
    const fileType = files.map((fi) => {
      if (fi.id === fileId) {
        return {
          ...fi,

          ...(type?.name && { name: type.name, type: type.name }),
          ...(type?.value ? { doc_type_id: type.value } : {}),
          ...(type?.password && { password: type.password }),
        };
      }
      return fi;
    });
    setFiles(fileType);
  };

  const handleFileRemove = async (fileId) => {
    const fileType = files.filter((fi) => fi.id !== fileId);
    setFiles(fileType);
  };

  const onFileUpload = (uploadedFiles) => {
    setFiles([...files, ...uploadedFiles]);
  };

  const updateDocumentList = async (loanId, directorId, user) => {
    if (!files.length) {
      return true;
    }

    try {
      setLoading(true);
      const uploadDocsReq = await newRequest(
        BORROWER_UPLOAD_URL,
        {
          method: "POST",
          data: {
            upload_document: files?.map(({ id, ...d }) => ({
              ...d,
              loan_id: item?.id,
              directorId: item?.createdUserId,
            })),
            directorId: item?.createdUserId,
          },
        },
        {
          Authorization: `Bearer ${userToken}`,
        }
      );

      const uploadDocsRes = uploadDocsReq.data;
      setLoading(false);

      if (uploadDocsRes.status === NC_STATUS_CODE.OK) {
        getCLicker(null);
        setFiles([]);
        return uploadDocsRes;
      }
      throw new Error(uploadDocsRes.message);
    } catch (err) {
      setLoading(false);
      console.log("STEP: 2 => UPLOAD DOCUMENT CASE IS", err.message);
    }
  };

  return (
    <section className="rounded-md flex flex-col gap-y-4 justify-end z-20 bg-white pl-10 w-full">
      <section className="h-auto overflow-hidden">
        <FileUpload
          accept=""
          onDrop={onFileUpload}
          upload={{
            url: DOCS_UPLOAD_URL_LOAN({
              userId: item?.createdUserId,
            }),
            header: {
              Authorization: `Bearer ${userToken}`,
            },
          }}
          docTypeOptions={option.map((fileoption) => ({
            main: fileoption.doc_type,
            name: fileoption.name,
            value: fileoption.doc_type_id,
          }))}
          documentTypeChangeCallback={handleDocumentTypeChange}
          onRemoveFile={handleFileRemove}
          docs={docs}
        />
      </section>
      <section className="w-full gap-x-4 flex justify-end">
        <Button
          disabled={files.length === 0 || loading}
          type="blue"
          size="small"
          rounded="rfull"
          onClick={updateDocumentList}
        >
          {loading ? "Please wait..." : "Submit"}
        </Button>
        <Button
          type="blue-light"
          size="small"
          rounded="rfull"
          onClick={() => getCLicker(null)}
        >
          Cancel
        </Button>
      </section>
    </section>
  );
}
