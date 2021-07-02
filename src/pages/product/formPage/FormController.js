import { useContext } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import PersonalDetails from "../../../shared/components/PersonalDetails/PersonalDetails";
import Button from "../../../components/Button";
import { LoanFormContext } from "../../../reducer/loanFormDataReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { BussinesContext } from "../../../reducer/bussinessReducer";
import { useToasts } from "../../../components/Toast/ToastProvider";

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

export default function FormController({
  id,
  map,
  onFlowChange,
  productDetails,
}) {
  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setLoanData },
  } = useContext(LoanFormContext);

  const { state } = useContext(BussinesContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const onSave = (data) => {
    setLoanData({ ...data }, id);
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    onFlowChange(map.main);
  };

  return (
    <Div>
      <PersonalDetails
        register={register}
        formState={formState}
        pageName={map.name}
        preData={state.companyDetail}
        jsonData={map.fields[id].data}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}

FormController.propTypes = {
  productDetails: object,
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  fieldConfig: object,
};
