import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import EMIDetails from "../../../shared/components/EMIDetails/EMIDetails";
import LoanDetails from "../../../shared/components/LoanDetails/LoanDetails";

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

export default function LoanDetailsPage({
  onComplete,
  nextFlow,
  id,
  pageName,
}) {
  const { register, formState } = useForm();
  const history = useHistory();

  const onProceed = () => {
    onComplete(id);
    history.push(nextFlow);
  };

  return (
    <Div>
      <LoanDetails
        pageName={pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.loan_details.data}
      />
      <EMIDetails
        register={register}
        formState={formState}
        jsonData={jsonData.emi_details.data}
      />
      <ButtonWrap>
        <Button fill="blue" name="Proceed" onClick={onProceed} />
        <Button name="Save" />
      </ButtonWrap>
    </Div>
  );
}
