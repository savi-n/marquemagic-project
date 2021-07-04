import { useContext, useState } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { UserContext } from "../../../reducer/userReducer";
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

AddressDetailsPage.propTypes = {
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  fieldConfig: object,
};

export default function AddressDetailsPage({
  id,
  onFlowChange,
  map,
  fieldConfig,
}) {
  const {
    actions: { setCompleted, activateSubFlow },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeAddressData },
  } = useContext(FormContext);

  const {
    state: { userBankDetails },
  } = useContext(UserContext);

  console.log(userBankDetails);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const [saved, setSaved] = useState(false);
  const [match, setMatch] = useState(false);

  const onSave = (formData) => {
    let formatedData = [
      formatData("permanent", formData, fieldConfig.address_details.data),
    ];

    !match &&
      formatedData.push(
        formatData("present", formData, fieldConfig.address_details.data)
      );

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
    onFlowChange(map.main);
  };

  //   const subFlowActivate = () => {
  //     activateSubFlow(id);
  //     onFlowChange(map.sub);
  //   };

  return (
    <Div>
      <AddressDetails
        register={register}
        formState={formState}
        match={match}
        setMatch={setMatch}
        jsonData={map.fields[id].data}
        preData={{}}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
