import { useContext } from "react";
import styled from "styled-components";
import { func, object, oneOf, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import EMIDetails from "../../../shared/components/EMIDetails/EMIDetails";
import SalaryDetails from "../../../shared/components/SalaryDetails/SalaryDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { USER_ROLES } from "../../../_config/app.config";
import { useToasts } from "../../../components/Toast/ToastProvider";

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

const formatEmiData = (formData, fields) => {
  return fields
    .map((f) => ({
      type: f.name,
      amount: formData[f.name],
      bank: formData[`${f.name}_bank_name`]?.name,
    }))
    .filter((f) => f.bank);
};

function formatSalaryData(data, fields) {
  let formatedData = {};
  fields.forEach((f) => {
    formatedData[f.name] = data[f.name] || "0";
  });
  return formatedData;
}

CoapplicantIncomeDetails.propTypes = {
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  userType: oneOf(["Co-Applicant", "Gurantor"]),
};

export default function CoapplicantIncomeDetails({
  userType,
  id,
  onFlowChange,
  map,
}) {
  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    state,
    actions: { setUsertypeSalaryData, setUsertypeEmiData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const onSave = (formData) => {
    const emiData = formatEmiData(formData, map.fields["emi-details"].data);
    const salaryData = formatSalaryData(
      formData,
      map.fields["salary-details"].data
    );

    setUsertypeEmiData(emiData, USER_ROLES[userType]);
    setUsertypeSalaryData(salaryData, USER_ROLES[userType]);
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

  return (
    <Div>
      <SalaryDetails
        userType={userType}
        register={register}
        formState={formState}
        jsonData={map.fields["salary-details"].data}
        incomeType={state[userType]?.applicantData?.incomeType || null}
        size="40%"
      />
      <EMIDetails
        register={register}
        formState={formState}
        jsonData={map.fields["emi-details"].data}
        label={map.fields["emi-details"].label}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        {/* <Button name="Save" onClick={handleSubmit(onSave)} /> */}
      </ButtonWrap>
    </Div>
  );
}
