import styled from "styled-components";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import PersonalDetails from "../../../shared/components/PersonalDetails/PersonalDetails";
import SalaryDetails from "../../../shared/components/SalaryDetails/SalaryDetails";
import Button from "../../../components/Button";

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

export default function PersonalDetailsPage(props) {
  const { register, formState } = useForm();
  return (
    <Div>
      <PersonalDetails
        pageName={props.pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.personal_details.data}
      />
      <SalaryDetails
        pageName={props.pageName}
        jsonData={jsonData.salary_details.data}
        register={register}
        formState={formState}
      />
      <ButtonWrap>
        <Button fill="blue" name="Proceed" />
        <Button name="Save" />
      </ButtonWrap>
    </Div>
  );
}
