import { useContext } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import PersonalDetails from "../../../shared/components/PersonalDetails/PersonalDetails";
import SalaryDetails from "../../../shared/components/SalaryDetails/SalaryDetails";
import Button from "../../../components/Button";
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

export default function PersonalDetailsPage({ nextFlow, id, pageName }) {
  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setApplicantData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const history = useHistory();

  const onSave = (data) => {
    setApplicantData({ ...data, isApplicant: "1" });
  };

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    history.push(nextFlow);
  };

  return (
    <Div>
      <PersonalDetails
        pageName={pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.personal_details.data}
      />
      <SalaryDetails
        pageName={pageName}
        jsonData={jsonData.salary_details.data}
        register={register}
        formState={formState}
      />
      <ButtonWrap>
        <Button fill="blue" name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
