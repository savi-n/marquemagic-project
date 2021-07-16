import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { UserContext } from "../../../reducer/userReducer";
import { useToasts } from "../../../components/Toast/ToastProvider";
import useCaseCreation from "../../../components/CaseCreation";
import Loading from "../../../components/Loading";
import Modal from "../../../components/Modal";

const Div = styled.div`
  flex: 1;
  padding: 50px;
  background: #ffffff;
`;

const ButtonWrap = styled.div`
  display: flex;
  gap: 20px;
  align-items: start;
`;

const DivWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Question = styled.div`
  font-weight: 500;
  color: blue;
`;

const UserAddButton = styled.div`
  margin-left: auto;
`;

const formatData = (type, data, fields) => {
  const formatedData = {};
  for (const f of fields) {
    formatedData[f.name] = data[`${type}_${f.name}`];
  }
  return { addressType: type, ...formatedData };
};

AddressDetailsPage.propTypes = {
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  fieldConfig: object,
};

export default function AddressDetailsPage({
  id,
  onFlowChange,
  map,
  productId,
  fieldConfig,
}) {
  const {
    actions: { setCompleted, activateSubFlow },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeAddressData },
  } = useContext(FormContext);

  const {
    state: { userBankDetails },
  } = useContext(UserContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const { processing, caseCreationUser } = useCaseCreation(
    "User",
    productId,
    "User"
  );

  const [saved, setSaved] = useState(false);
  const [match, setMatch] = useState(false);

  const saveData = (formData) => {
    let formatedData = [formatData("permanent", formData, map.fields[id].data)];

    !match &&
      formatedData.push(formatData("present", formData, map.fields[id].data));

    setUsertypeAddressData(formatedData);
    setSaved(true);
  };

  const onSave = (formData) => {
    saveData(formData);
    addToast({
      message: "Saved Succesfully",
      type: "success",
    });
  };

  const [proceed, setProceed] = useState(false);

  useEffect(() => {
    async function request() {
      const res = await caseCreationUser();
      if (res) {
        setCompleted(id);
        onFlowChange(map.main);
      }
      setProceed(false);
    }

    if (proceed) {
      request();
    }
  }, [proceed]);

  const onProceed = (formData) => {
    saveData(formData);
    setProceed(true);
  };

  const subFlowActivate = async () => {
    const res = await caseCreationUser();
    if (res) {
      activateSubFlow(id);
      onFlowChange(map.sub);
    }
  };

  const subHiddenActivate = async () => {
    const res = await caseCreationUser();
    if (res) {
      activateSubFlow(id);
      onFlowChange(map.hidden);
    }
  };

  return (
    <Div>
      <AddressDetails
        register={register}
        formState={formState}
        match={match}
        setMatch={setMatch}
        jsonData={map.fields[id].data}
        disablePermenanet={true}
        preData={{
          address1: userBankDetails?.address1 || "",
          address2: userBankDetails?.address2 || "",
          address3: userBankDetails?.address3 || "",
          address4: userBankDetails?.address4 || "",
          city: userBankDetails?.city || "",
          state: userBankDetails?.state || "",
          pinCode: userBankDetails?.pin || "",
        }}
      />
      <ButtonWrap>
        <Button
          fill
          name="Proceed"
          onClick={handleSubmit(onProceed)}
          disabled={processing}
        />
        <Button
          name="Save"
          onClick={handleSubmit(onSave)}
          disabled={processing}
        />
        {map.sub && (
          <UserAddButton>
            <DivWrap>
              <Question>Co-Applicants?</Question>
              <Button
                width="auto"
                fill
                name="Add"
                disabled={!saved}
                onClick={subFlowActivate}
              />
            </DivWrap>
            <DivWrap>
              <Question>Guarantor?</Question>
              <Button
                width="auto"
                fill
                name="Add"
                disabled={!saved}
                onClick={subHiddenActivate}
              />
            </DivWrap>
          </UserAddButton>
        )}
      </ButtonWrap>
      {processing && (
        <Modal show={true} onClose={() => {}} width="50%">
          <Loading />
        </Modal>
      )}
    </Div>
  );
}
