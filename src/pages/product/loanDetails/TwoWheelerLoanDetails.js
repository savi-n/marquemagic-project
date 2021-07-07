import { useContext } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import EMIDetails from "../../../shared/components/EMIDetails/EMIDetails";
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

TwoWheelerLoanDetailsPage.propTypes = {
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  productDetails: object,
};

export default function TwoWheelerLoanDetailsPage({
  id,
  onFlowChange,
  map,
  productDetails,
}) {
  const {
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

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    onFlowChange(map.main);
  };

  const onSave = (data) => {
    const emiData = formatEmiData(data, map.fields["emi-details"].data);
    const loanData = formatLoanData(data, map.fields["loan-details"].data);

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
      <LoanDetails
        register={register}
        formState={formState}
        jsonData={map.fields["loan-details"].data}
        label={map.fields["loan-details"].label}
        loanType={productDetails.loanType}
        size="40%"
      />
      <EMIDetails
        register={register}
        formState={formState}
        jsonData={map.fields["emi-details"].data}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
    </Div>
  );
}
