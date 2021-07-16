import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { func, object, oneOf, oneOfType, string } from "prop-types";

import useForm from "../../../hooks/useForm";
import Button from "../../../components/Button";
import AddressDetails from "../../../shared/components/AddressDetails/AddressDetails";
import PersonalDetails from "../../../shared/components/PersonalDetails/PersonalDetails";
import { FormContext } from "../../../reducer/formReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import { USER_ROLES } from "../../../_config/app.config";
import { useToasts } from "../../../components/Toast/ToastProvider";
import useCaseCreation from "../../../components/CaseCreation";
import Loading from "../../../components/Loading";
import Modal from "../../../components/Modal";

const ButtonWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const DivWrap = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Question = styled.div`
  font-weight: 500;
  color: blue;
`;

const Div = styled.div`
  flex: 1;
  padding: 50px;
  background: #ffffff;
`;

const formatAddressData = (type, data, fields) => {
  const formatedData = {};
  for (const f of fields) {
    formatedData[f.name] = data[`${type}_${f.name}`];
  }
  return { addressType: type, ...formatedData };
};

const formatPersonalData = (data, fields) => {
  const formatedData = {};
  for (const f of fields) {
    formatedData[f.name] = data[f.name];
  }

  return { ...formatedData, isApplicant: "0" };
};

CoapplicantDetails.propTypes = {
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
  userType: oneOf(["Co-Applicant", "Gurantor"]),
  fieldConfig: object,
};

export default function CoapplicantDetails({
  userType,
  id,
  onFlowChange,
  map,
  fieldConfig,
  productId,
}) {
  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const {
    actions: { setUsertypeApplicantData, setUsertypeAddressData },
  } = useContext(FormContext);

  const { handleSubmit, register, formState } = useForm();
  const { addToast } = useToasts();

  const [match, setMatch] = useState(false);
  const { processing, caseCreationUserType } = useCaseCreation(
    "Co-applicant",
    productId,
    "Co-applicant"
  );

  const saveData = (formData) => {
    let formatedAddress = [
      formatAddressData(
        "permanent",
        formData,
        fieldConfig.address_details.data
      ),
    ];

    !match &&
      formatedAddress.push(
        formatAddressData("present", formData, fieldConfig.address_details.data)
      );

    const formatApplicantData = {
      ...formatPersonalData(formData, fieldConfig.personal_details.data),
      typeName: userType,
    };
    setUsertypeApplicantData(formatApplicantData, USER_ROLES[userType]);
    setUsertypeAddressData(formatedAddress, USER_ROLES[userType]);
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
      const res = await caseCreationUserType();
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

  const onProceed = async (data) => {
    saveData(data);

    if (userType === "Gurantor") {
      setProceed(true);
    }
  };

  return (
    <Div>
      <PersonalDetails
        userType={userType}
        register={register}
        formState={formState}
        jsonData={map.fields["personal-details"].data}
      />
      <AddressDetails
        userType={userType}
        register={register}
        formState={formState}
        match={match}
        setMatch={setMatch}
        jsonData={map.fields["address-details"].data}
      />
      <ButtonWrap>
        <Button fill name="Proceed" onClick={handleSubmit(onProceed)} />
        <Button name="Save" onClick={handleSubmit(onSave)} />
      </ButtonWrap>
      {processing && (
        <Modal show={true} onClose={() => {}} width="50%">
          <Loading />
        </Modal>
      )}
    </Div>
  );
}
