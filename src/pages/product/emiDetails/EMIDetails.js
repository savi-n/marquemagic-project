import { useContext, useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import EMIDetails from "../../../shared/components/EMIDetails/EMIDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { UserContext } from "../../../reducer/userReducer";
import { formatEmiData } from "../../../utils/formatData";
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

const RoundButton = styled.button`
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 17px;
  /* font-weight: 700; */
  background: ${({ theme }) => theme.buttonColor2};
  margin-right: 10px;
`;

const Wrapper = styled.div`
  display: flex;
  margin: 20px 0;
  align-items: center;
`;

export default function EMIDetailsPage({ id, pageName }) {
  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeEmiData },
  } = useContext(FormContext);

  const {
    state: { userDetails },
  } = useContext(UserContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const history = useHistory();

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    history.push(flowMap[id].main);
  };

  const onSave = (data) => {
    const emiData = formatEmiData(data, jsonData.emi_details.data);

    setUsertypeEmiData(emiData);

    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  const [additionalField, setAdditionalField] = useState([]);

  const onAdd = () => {
    const newField = {
      ...jsonData.emi_details.data[0],
      name: `addDed_${additionalField.length + 1}`,
      placeholder: "Additional Deductions/repayment",
    };
    setAdditionalField([...additionalField, newField]);
  };

  return (
    <Div>
      <EMIDetails
        register={register}
        formState={formState}
        jsonData={[...jsonData.emi_details.data, ...additionalField]}
      />

      <Wrapper>
        <RoundButton onClick={onAdd}>+</RoundButton> click to add additional
        deductions/repayment obligations
      </Wrapper>
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
