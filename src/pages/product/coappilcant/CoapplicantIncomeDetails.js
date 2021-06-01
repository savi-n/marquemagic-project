import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import EMIDetails from "../../../shared/components/EMIDetails/EMIDetails";
import SalaryDetails from "../../../shared/components/SalaryDetails/SalaryDetails";

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

export default function CoapplicantIncomeDetails({
  onComplete,
  userType,
  nextFlow,
  id,
  pageName,
  onSubflowActivate,
}) {
  const { register, formState } = useForm();
  const history = useHistory();

  const onProceed = () => {
    onComplete(id);
    history.push(nextFlow);
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
        <Button fill="blue" name="Proceed" />
        <Button name="Save" />
      </ButtonWrap>
    </Div>
  );
}
