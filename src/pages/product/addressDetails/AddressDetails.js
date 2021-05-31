import styled from "styled-components";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";

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

export default function AddressDetailsPage(props) {
  const { register, formState } = useForm();
  return (
    <Div>
      <AddressDetails
        pageName={props.pageName}
        register={register}
        formState={formState}
        jsonData={jsonData.address_details.data}
      />
      <ButtonWrap>
        <Button fill="blue" name="Proceed" />
        <Button name="Save" />
      </ButtonWrap>
    </Div>
  );
}
