import { useContext, useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
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
  return { addressType: type, ...formatedData };
};

export default function AddressDetailsPage({ id, pageName }) {
  const {
    state: { flowMap },
    actions: { setCompleted, activateSubFlow },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeAddressData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const history = useHistory();

  const [saved, setSaved] = useState(false);
  const [match, setMatch] = useState(false);

  const onSave = (formData) => {
    const formatedData = [
      !match &&
        formatData("permanent", formData, jsonData.address_details.data),
      formatData("present", formData, jsonData.address_details.data),
    ];

    setUsertypeAddressData(formatedData);
    setSaved(true);
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  const onProceed = (formData) => {
    onSave(formData);
    setCompleted(id);
    history.push(flowMap[id].main);
  };

  const subFlowActivate = () => {
    activateSubFlow(id);
    history.push(flowMap[id].sub);
  };

  return (
    <Div>
      <AddressDetails
        pageName={pageName}
        register={register}
        formState={formState}
        match={match}
        setMatch={setMatch}
        jsonData={jsonData.address_details.data}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
        <DivWrap>
          <Question>Co-Applicants?</Question>
          <Button
            width="auto"
            fill
            name="Add"
            disabled={!saved}
            onClick={subFlowActivate}
          />
        </DivWrap>
      </ButtonWrap>
    </Div>
  );
}
