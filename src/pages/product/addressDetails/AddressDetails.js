import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";

const Div = styled.div`
  flex: 1;
  padding: 50px;
  background: #ffffff;
`;

const ButtonWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const DivWrap = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Question = styled.div`
  font-weight: 500;
  color: blue;
`;

export default function AddressDetailsPage({
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
    <Div>
      <AddressDetails
        pageName={pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.address_details.data}
      />
      <ButtonWrap>
        <Button fill="blue" name="Proceed" />
        <Button name="Save" />
        <DivWrap>
          <Question>Co-Applicants?</Question>
          <Button
            width="auto"
            fill="blue"
            name="Add"
            onClick={() => onSubflowActivate(id)}
          />
          <Button width="auto" name="No" onClick={onProceed} />
        </DivWrap>
      </ButtonWrap>
    </Div>
  );
}
