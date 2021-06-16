import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import useFetch from "../../../hooks/useFetch";
import generateUID from "../../../utils/uid";
import { NC_STATUS_CODE } from "../../../_config/app.config";

const USER_CANCELED = "user cancelled";

const Dropzone = styled.div`
  width: 100%;
  min-height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: ${({ bg }) => bg ?? "rgba(0,0,0,0.1)"};
  border-radius: 20px;
  overflow: hidden;

  ${({ dragging }) =>
    dragging &&
    `border: dashed grey 4px;
        background-color: rgba(255,255,255,.8);
        z-index: 9999;`}

  ${({ uploading }) =>
    uploading &&
    `
      pointer-events: none;
    `}
	
  &::after {
    ${({ uploading }) =>
      uploading &&
      `
        content:'Uploading...';
      `}
    inset: 0 0 0 0;
    border-radius: 20px;
    position: absolute;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8em;
    font-weight: 500;
    color: white;
    z-index: 999;
    pointer-events: none;
  }
`;

const Caption = styled.p`
  font-size: 15px;
  font-weight: 400;
`;

const AcceptFilesTypes = styled.span`
  font-size: 12px;
  color: red;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadButton = styled.input`
  display: none;
`;

const Label = styled.label`
  padding: 10px 15px;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  background: ${({ theme, bg }) => bg ?? theme.buttonColor2};
  border-radius: 5px;
`;

const Droping = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255);
  font-size: 20px;
  z-index: 9999;
`;

const FileListWrap = styled.div`
  display: flex;
  align-items: center;
  /* gap: calc(10% / 3); */
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 10px;
`;

const File = styled.div`
  flex-basis: 30%;
  position: relative;
  overflow: hidden;
  padding: 5px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  height: 35px;
  font-size: 13px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: 0.2s;

  &::after {
    content: "";
    bottom: 0;
    left: 0;
    position: absolute;
    width: ${({ progress }) => `${progress}%`};
    height: 2px;
    background: ${({ theme, status }) => {
      if (["error", "cancelled"].includes(status)) return "#ff0000";
      return theme.buttonColor2 || "blue";
    }};
  }
`;

const FileName = styled.span`
  width: 80%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const CancelBtn = styled.span`
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
`;

export default function FileUpload({
  onDrop,
  accept = "",
  caption,
  bg,
  disabled = false,
  upload = null,
}) {
  const ref = useRef(uuidv4());

  const id = uuidv4();

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const selectedFiles = useRef([]);
  const uploadingProgressFiles = useRef([]);
  const { newRequest } = useFetch();

  let refCounter = 0;

  const onCancel = (file, status) => {
    const uploadFiles = uploadingProgressFiles.current.map((uFile) => {
      if (uFile.id === file.id) {
        return {
          ...uFile,
          status,
        };
      }

      return uFile;
    });
    uploadingProgressFiles.current = uploadFiles;
    setUploadingFiles(uploadFiles);
  };

  const onProgress = (event, file) => {
    if (!uploadingProgressFiles.current.length) {
      return;
    }

    const uploadFiles = uploadingProgressFiles.current.map((uFile) => {
      if (uFile.id === file.id) {
        const percentageCompleted = (
          (event.loaded / event.total) *
          100
        ).toFixed();

        return {
          ...uFile,
          progress: percentageCompleted,
          status:
            Number(percentageCompleted) === 100 ? "completed" : "progress",
        };
      }

      return uFile;
    });
    uploadingProgressFiles.current = uploadFiles;
    setUploadingFiles(uploadFiles);
  };

  const handleUpload = async (files) => {
    let filesToUpload = [];
    for (let i = 0; i < files.length; i++) {
      const source = axios.CancelToken.source();

      const id = generateUID();

      filesToUpload.push({
        id,
        name: files[i].name,
        file: files[i],
        progress: 0,
        status: "progress",
        cancelToken: source,
      });
    }

    uploadingProgressFiles.current = [
      ...uploadingProgressFiles.current,
      ...filesToUpload,
    ];

    setUploading(true);
    setUploadingFiles(uploadingProgressFiles.current);

    return await Promise.all(
      filesToUpload.map((file) => {
        const formData = new FormData();
        formData.append("document", file.file);

        return newRequest(
          upload.url,
          {
            method: "POST",
            data: formData,
            onUploadProgress: (event) => onProgress(event, file),
            cancelToken: file.cancelToken.token,
          },
          upload.header ?? {}
        )
          .then((res) => {
            if (res.data.status === NC_STATUS_CODE.OK) {
              const file = res.data.files[0];
              const uploadfile = {
                doc_type_id: "1",
                upload_doc_name: file.filename,
                document_key: file.fd,
                size: file.size,
              };
              return uploadfile;
            }
            // return res.data.files[0];
            return { ...file, status: "error" };
          })
          .catch((err) => {
            console.log(err);
            if (err.message === USER_CANCELED) {
              onCancel(file, "cancelled");
            } else {
              onCancel(file, "error");
            }
            return { ...file, status: "error", error: err };
          });
      })
    ).then((files) => {
      setUploading(false);
      return files.filter((file) => file.status !== "error");
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    ++refCounter;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    --refCounter;

    if (!refCounter) setDragging(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);

    let files = [...event.dataTransfer.files];
    if (accept) {
      files = files.filter((file) => accept.includes(file.type.split("/")[1]));
    }

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      if (upload) {
        files = await handleUpload(files);
      }
      onDrop(files);

      files = [...selectedFiles.current, ...files];
      selectedFiles.current = files;

      event.dataTransfer.clearData();
      refCounter = 0;
    }
  };

  const onChange = async (event) => {
    let files = [...event.target.files];
    if (upload) {
      files = await handleUpload(files);
    }
    onDrop(files);

    selectedFiles.current = [...selectedFiles.current, ...event.target.files];
  };

  useEffect(() => {
    let div = ref.current;

    div.addEventListener("dragenter", handleDragIn);
    div.addEventListener("dragleave", handleDragOut);
    div.addEventListener("dragover", handleDrag);
    div.addEventListener("drop", handleDrop);
    div.addEventListener("dragend", handleDrag);

    return () => {
      div.removeEventListener("dragenter", handleDragIn);
      div.removeEventListener("dragleave", handleDragOut);
      div.removeEventListener("dragover", handleDrag);
      div.removeEventListener("drop", handleDrop);
      div.removeEventListener("dragend", handleDrag);
    };
  }, []);

  return (
    <>
      <Dropzone
        ref={ref}
        dragging={dragging}
        bg={bg}
        disabled={disabled}
        uploading={uploading}
      >
        {dragging && <Droping>Drop here :)</Droping>}
        <FontAwesomeIcon icon={faUpload} size="1x" />
        <Caption>
          {caption || `Drag and drop or`}{" "}
          {accept && <AcceptFilesTypes>{accept}</AcceptFilesTypes>}
        </Caption>
        <UploadButton
          type="file"
          id={id}
          onChange={onChange}
          multiple
          accept={accept}
          disabled={disabled}
        />
        <Label htmlFor={id}>Select from your Computer</Label>
      </Dropzone>

      <FileListWrap>
        {uploadingFiles.map((file) => (
          <File
            key={file.id}
            progress={file.progress}
            status={file.status}
            tooltip={file.name}
          >
            <FileName>{file.name}</FileName>
            {file.status === "progress" && (
              <CancelBtn onClick={() => file.cancelToken.cancel(USER_CANCELED)}>
                &#10006;
              </CancelBtn>
            )}
          </File>
        ))}
      </FileListWrap>
    </>
  );
}

FileUpload.defaultProps = {
  onDrop: () => {},
};
