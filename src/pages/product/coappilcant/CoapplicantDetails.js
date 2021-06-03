import { useContext } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";
import PersonalDetails from "../../../shared/components/PersonalDetails/PersonalDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { USER_ROLES } from "../../../_config/app.config";

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

const Div = styled.div`
  flex: 1;
  padding: 50px;
  background: #ffffff;
`;

const formatAddressData = (type, data, fields) => {
  const formatedData = {};
  for (const f of fields) {
    formatedData[f.name] = data[`${type}_${f.name}`];
  }
  return { addressType: type, ...formatedData };
};

const formatPersonalData = (data, fields) => {
  const formatedData = {};
  for (const f of fields) {
    formatedData[f.name] = data[f.name];
  }

  return { ...formatedData, isApplicant: "0" };
};

export default function CoapplicantDetails({ userType, id, pageName }) {
  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeApplicantData, setUsertypeAddressData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const history = useHistory();

  const onSave = (formData) => {
    const formatedAddress = [
      formatAddressData("permanent", formData, jsonData.address_details.data),
      formatAddressData("present", formData, jsonData.address_details.data),
    ];
    const formatApplicantData = formatPersonalData(
      formData,
      jsonData.personal_details.data
    );
    setUsertypeApplicantData(formatApplicantData, USER_ROLES[userType]);
    setUsertypeAddressData(formatedAddress, USER_ROLES[userType]);
  };

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    history.push(flowMap[id].main);
  };

  return (
    <Div>
      <PersonalDetails
        userType={userType}
        pageName={pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.personal_details.data}
      />
      <AddressDetails
        userType={userType}
        pageName={pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.address_details.data}
      />
      <ButtonWrap>
        <Button fill="blue" name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
