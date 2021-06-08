import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import useFetch from "../../../hooks/useFetch";

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
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 35px;
  font-size: 13px;
  transition: 0.2s;

  &::after {
    content: "";
    bottom: 0;
    left: 0;
    position: absolute;
    width: ${({ progress }) => `${progress}%`};
    height: 2px;
    background: ${({ theme }) => theme.buttonColor2 || "blue"};
  }
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

  const onProgress = (event, file) => {
    if (!uploadingProgressFiles.current.length) {
      return;
    }

    const uploadFiles = uploadingProgressFiles.current
      .map((uFile) => {
        if (uFile.name === file.name) {
          return {
            name: uFile.name,
            progress: ((event.loaded / event.total) * 100).toFixed(1),
          };
        }

        return uFile;
      })
      .filter((uFile) => uFile.progress !== 100);

    uploadingProgressFiles.current = uploadFiles;
    setUploadingFiles(uploadFiles);
  };

  const handleUpload = async (files) => {
    setUploading(true);

    uploadingProgressFiles.current = files.map((f) => ({
      name: f.name,
      progress: 0,
    }));

    setUploadingFiles(uploadingProgressFiles.current);

    return await Promise.all(
      files.map((file) => {
        const formData = new FormData();
        formData.append("document", file);

        return newRequest(
          upload.url,
          {
            method: "POST",
            data: formData,
            onUploadProgress: (event) => onProgress(event, file),
          },
          upload.header ?? {}
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
              return uploadfile;
            }
            return res.data.files[0];
          })
          .catch((err) => {
            console.log(err);
            return { ...file, status: "error", error: err };
          });
      })
    ).then((files) => {
      setUploading(false);
      setUploadingFiles([]);
      return files;
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
          <File progress={file.progress} tooltip={file.name}>
            {file.name}
          </File>
        ))}
      </FileListWrap>
    </>
  );
}

FileUpload.defaultProps = {
  onDrop: () => {},
};
