import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import DocumentUpload from "../documentUpload/DocumentUpload";

const ButtonWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Div = styled.div`
  flex: 1;
  padding: 50px;
  background: #ffffff;
`;

export default function CoapplicantDetails({
  onComplete,
  nextFlow,
  id,
  pageName,
  onSubflowActivate,
}) {
  const { register, formState } = useForm();
  const history = useHistory();

  const onProceed = () => {
    onComplete(id);
    history.push(nextFlow);
  };

  return (
    <>
      <DocumentUpload userType="Co-applicant" />
      {/* <ButtonWrap>
        <Button fill="blue" name="Proceed" />
        <Button name="Save" />
      </ButtonWrap> */}
    </>
  );
}
