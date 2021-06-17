import Modal from "./Modal";
import FileUpload from "../shared/components/FileUpload/FileUpload";

export default function UploadAgreementModal({ onClose }) {
  return (
    <Modal show={true} onClose={onClose} width="50%">
      <FileUpload />
    </Modal>
  );
}
