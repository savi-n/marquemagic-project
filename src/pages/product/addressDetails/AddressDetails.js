import { useContext, useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";
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

const formatData = (type, data, fields) => {
  const formatedData = {};
  for (const f of fields) {
    formatedData[f.name] = data[`${type}_${f.name}`];
  }
  // console.log(formatData);
  return { addressType: type, ...formatedData };
};

export default function AddressDetailsPage({ nextFlow, id, pageName }) {
  const {
    actions: { setCompleted, activateSubFlow },
  } = useContext(FlowContext);

  const {
    actions: { setAddressData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const history = useHistory();

  const [saved, setSaved] = useState(false);

  const onSave = (formData) => {
    const formatedData = [
      formatData("permanent", formData, jsonData.address_details.data),
      formatData("present", formData, jsonData.address_details.data),
    ];
    setAddressData(formatedData);
    setSaved(true);
  };

  const onProceed = (formData) => {
    onSave(formData);
    setCompleted(id);
    history.push(nextFlow);
  };

  const subFlowActivate = () => {
    activateSubFlow(id);
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
        <Button fill="blue" name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
        <DivWrap>
          <Question>Co-Applicants?</Question>
          <Button
            width="auto"
            fill="blue"
            name="Add"
            disabled={!saved}
            onClick={subFlowActivate}
          />
        </DivWrap>
      </ButtonWrap>
    </Div>
  );
}
