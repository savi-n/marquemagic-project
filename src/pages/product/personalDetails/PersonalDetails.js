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

export default function PersonalDetailsPage({ id, pageName }) {
  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeApplicantData },
  } = useContext(FormContext);

  const {
    state: { userBankDetails },
  } = useContext(UserContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const history = useHistory();

  const onSave = (data) => {
    setUsertypeApplicantData({ ...data, isApplicant: "1" });
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    history.push(flowMap[id].main);
  };

  console.log(userBankDetails);

  return (
    <Div>
      <PersonalDetails
        pageName={pageName}
        register={register}
        formState={formState}
        preData={{
          firstName: userBankDetails.firstName,
          lastName: userBankDetails.lastName,
          dob: userBankDetails.dob,
          email: userBankDetails.email,
          mobileNo: userBankDetails.mobileNum,
          panNumber: userBankDetails.pan,
        }}
        jsonData={jsonData.personal_details.data}
      />
      <SalaryDetails
        pageName={pageName}
        jsonData={jsonData.salary_details.data}
        register={register}
        formState={formState}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
