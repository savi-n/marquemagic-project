import { useContext } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import jsonData from "../../../shared/constants/data.json";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import HomeLoanAddressDetails from "../../../shared/components/AddressDetails/HomeLoanAddress";
import HomeLoanDetailsTable from "../../../shared/components/LoanDetails/HomeLoanDetailsTable";
import LoanDetails from "../../../shared/components/LoanDetails/LoanDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { UserContext } from "../../../reducer/userReducer";
import { formatEmiData, formatLoanData } from "../../../utils/formatData";
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

const FormWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const FlexColom = styled.div`
  flex-basis: ${({ base }) => (base ? base : "100%")};
`;

export default function HomeLoanDetailsPage({ id, pageName }) {
  const {
    state: { flowMap },
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeLoanData, setUsertypeEmiData, setUsertypeBankData },
  } = useContext(FormContext);

  const {
    state: { userDetails },
  } = useContext(UserContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const history = useHistory();

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    history.push(flowMap[id].main);
  };

  const onSave = (data) => {
    const emiData = formatEmiData(data, jsonData.emi_details.data);
    const loanData = formatLoanData(data, jsonData.loan_details.data);

    setUsertypeEmiData(emiData);
    setUsertypeBankData({
      bankId: userDetails.lender_id,
      branchId: data.branchId,
    });
    setUsertypeLoanData({ ...loanData, summary: "summary" });
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  return (
    <Div>
      <FormWrapper>
        <FlexColom base="60%">
          <LoanDetails
            pageName={pageName}
            register={register}
            formState={formState}
            jsonData={jsonData.home_loan_details.data}
            size="60%"
          />
        </FlexColom>
        <FlexColom base="40%">
          <HomeLoanAddressDetails
            jsonData={jsonData.address_details.data}
            register={register}
            pageName={pageName}
            formState={formState}
            size="100%"
          />
        </FlexColom>
      </FormWrapper>

      <HomeLoanDetailsTable />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
