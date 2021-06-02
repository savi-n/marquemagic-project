import { useContext } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import EMIDetails from "../../../shared/components/EMIDetails/EMIDetails";
import LoanDetails from "../../../shared/components/LoanDetails/LoanDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";

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

export default function LoanDetailsPage({ id, pageName }) {
  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setLoanData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const history = useHistory();

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    history.push(flowMap[id].main);
  };

  const onSave = (data) => {
    setLoanData({ ...data, summary: "summary" });
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
        <Button fill="blue" name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
