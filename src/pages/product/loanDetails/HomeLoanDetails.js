import { useContext, useState } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import HomeLoanAddressDetails from "../../../shared/components/AddressDetails/HomeLoanAddress";
import HomeLoanDetailsTable from "../../../shared/components/LoanDetails/HomeLoanDetailsTable";
import UploadAgreementModal from "../../../components/UploadAgreementModal";
import LoanDetails from "../../../shared/components/LoanDetails/LoanDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
// import { UserContext } from "../../../reducer/userReducer";
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

HomeLoanDetailsPage.propTypes = {
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  fieldConfig: object,
};

export default function HomeLoanDetailsPage({
  id,
  map,
  onFlowChange,
  fieldConfig,
}) {
  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: {
      setUsertypeLoanData,
      // setUsertypeEmiData,
      setUsertypeBankData,
      setUsertypeAgreementData,
    },
  } = useContext(FormContext);

  // const {
  //   state: { userDetails },
  // } = useContext(UserContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const [uploadAgreementModal, setUploadAgreementModal] = useState(false);
  const [uploadAgreementName, setUploadAgreementName] = useState(null);
  const [uploadAgreementDocs, setUploadAgreementDocs] = useState({});

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    onFlowChange(map.main);
  };

  const onSave = (data) => {
    // const emiData = formatEmiData(data, map.fields["emi-details"].data);
    const loanData = formatLoanData(data, map.fields[id].data);

    // setUsertypeEmiData(emiData);
    setUsertypeBankData({
      // bankId: userDetails.lender_id,
      branchId: data.branchId,
    });
    setUsertypeLoanData({ ...loanData, summary: "summary" });
    setUsertypeAgreementData(uploadAgreementDocs[uploadAgreementName]);
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  const onUploadAgreement = (name) => {
    setUploadAgreementName(name);
    setUploadAgreementModal(true);
  };

  const onDone = (files, name) => {
    setUploadAgreementDocs((p) => ({
      ...p,
      [name]: files,
    }));
    setUploadAgreementModal(false);
  };

  return (
    <Div>
      <FormWrapper>
        <FlexColom base="60%">
          <LoanDetails
            register={register}
            formState={formState}
            jsonData={map.fields[id].data}
            size="60%"
            buttonAction={onUploadAgreement}
            uploadedDocs={uploadAgreementDocs}
            label={map.fields[id].label}
          />
        </FlexColom>
        <FlexColom base="40%">
          <HomeLoanAddressDetails
            jsonData={map.fields["address-details"].data}
            register={register}
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

      {uploadAgreementModal && (
        <UploadAgreementModal
          onClose={() => setUploadAgreementModal(false)}
          onDone={onDone}
          name={uploadAgreementName}
        />
      )}
    </Div>
  );
}
