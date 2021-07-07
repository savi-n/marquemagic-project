import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import PersonalDetails from "../../../shared/components/PersonalDetails/PersonalDetails";
import Button from "../../../components/Button";
import ROCBusinessDetailsModal from "../../../components/ROCBusinessDetailsModal";
import { LoanFormContext } from "../../../reducer/loanFormDataReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { BussinesContext } from "../../../reducer/bussinessReducer";
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

export default function FormController({
  id,
  map,
  onFlowChange,
  productDetails,
}) {
  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setLoanData },
  } = useContext(LoanFormContext);

  const { state } = useContext(BussinesContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  useEffect(() => {
    return () => {
      console.log("unmount form");
    };
  }, []);

  const onSave = (data) => {
    setLoanData({ ...data }, id);
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  const onProceed = (data) => {
    onSave(data);
    setCompleted(id);
    onFlowChange(map.main);
  };

  // const [actions, setActions] = useState({});

  // const onClickActions = (action) => {
  //   const newActions = { ...actions, action };

  //   setActions(newActions);
  // };

  const [viewBusinessDetail, setViewBusinessDetail] = useState(false);

  return (
    <>
      <Div>
        <PersonalDetails
          register={register}
          formState={formState}
          pageName={map.name}
          preData={state.companyDetail}
          jsonData={map?.fields[id].data || []}
        />
        <ButtonWrap>
          {id === "business-details" && (
            <Button
              fill
              name="View Business Details"
              onClick={() => setViewBusinessDetail(true)}
            />
          )}
          <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
          <Button name="Save" onClick={handleSubmit(onSave)} />
        </ButtonWrap>
      </Div>

      {id === "business-details" && viewBusinessDetail && (
        <ROCBusinessDetailsModal
          onClose={() => {
            setViewBusinessDetail(false);
          }}
        />
      )}
    </>
  );
}

FormController.propTypes = {
  productDetails: object,
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  fieldConfig: object,
};
