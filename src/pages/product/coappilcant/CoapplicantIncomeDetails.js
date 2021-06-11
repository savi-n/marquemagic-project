import { useContext } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import EMIDetails from "../../../shared/components/EMIDetails/EMIDetails";
import SalaryDetails from "../../../shared/components/SalaryDetails/SalaryDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { USER_ROLES } from "../../../_config/app.config";
import { formatEmiData, formatLoanData } from "../../../utils/formatData";

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

export default function CoapplicantIncomeDetails({ userType, id, pageName }) {
  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeSalaryData, setUsertypeEmiData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const history = useHistory();

  const onSave = (formData) => {
    const emiData = formatEmiData(formData, jsonData.emi_details.data);
    const salaryData = formatLoanData(formData, jsonData.salary_details.data);

    setUsertypeEmiData(emiData, USER_ROLES[userType]);
    setUsertypeSalaryData(salaryData, USER_ROLES[userType]);
  };

  const onProceed = (formData) => {
    onSave(formData);
    setCompleted(id);
    history.push(flowMap[id].main);
  };

  return (
    <Div>
      <SalaryDetails
        userType={userType}
        pageName={pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.salary_details.data}
      />
      <EMIDetails
        pageName={pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.emi_details.data}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
