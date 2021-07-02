import { useState, useContext } from "react";
import { func, object, oneOfType, string } from "prop-types";
import styled from "styled-components";

import Button from "../../../components/Button";
import { ROC_DATA_FETCH, NC_STATUS_CODE } from "../../../_config/app.config";
import { AppContext } from "../../../reducer/appReducer";
import { BussinesContext } from "../../../reducer/bussinessReducer";
import { FlowContext } from "../../../reducer/flowReducer";
import useForm from "../../../hooks/useForm";
import useFetch from "../../../hooks/useFetch";
import { useToasts } from "../../../components/Toast/ToastProvider";

const Colom1 = styled.div`
  flex: 1;
  padding: 50px;
`;

const Colom2 = styled.div`
  width: 30%;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: ${({ theme }) => theme.main_theme_color};
  }
`;

const FieldWrapper = styled.div`
  padding: 20px 0;
  width: 50%;
`;

const H2 = styled.h2`
  width: 50%;
  text-align: center;
  font-weight: 500;
`;

export default function BussinessDetails({
  productDetails,
  map,
  onFlowChange,
  id,
}) {
  const {
    state: { bankToken },
  } = useContext(AppContext);

  const {
    actions: { setCompanyDetails },
  } = useContext(BussinesContext);

  const {
    actions: { setCompleted },
  } = useContext(FlowContext);

  const { newRequest } = useFetch();
  const { register, handleSubmit, formState } = useForm();

  const { addToast } = useToasts();

  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ companyName, cinNumber }) => {
    if (!companyName && !cinNumber) {
      return;
    }

    setLoading(true);

    try {
      if (cinNumber) {
        const cinNumberResponse = await newRequest(
          ROC_DATA_FETCH,
          {
            method: "POST",
            data: {
              cin_number: cinNumber,
            },
          },
          { authorization: bankToken }
        );

        const companyData = cinNumberResponse.data;

        if (companyData.status === NC_STATUS_CODE.OK) {
          setCompanyDetails(companyData.data);
          onProceed();
          return;
        }

        throw new Error(companyData?.result);
      }

      if (companyName) {
        console.log(companyName);
      }
    } catch (error) {
      console.error(error);
      addToast({
        message: error.message || "Something Went Wrong. Try Again!",
        type: "error",
      });
    }

    setLoading(false);
  };

  const onProceed = () => {
    setCompleted(id);
    onFlowChange(map.main);
  };

  return (
    productDetails && (
      <>
        <Colom1>
          {/* <H>
            Help us with your <span>Identity Verification</span>
          </H> */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldWrapper>
              {register({
                name: "companyName",
                placeholder: "Enter Company Name",
                value: formState?.values?.companyName,
              })}
            </FieldWrapper>
            <H2>or</H2>
            <FieldWrapper>
              {register({
                name: "cinNumber",
                placeholder: "Enter CIN Number",
                value: formState?.values?.cinNumber,
              })}
            </FieldWrapper>
            <Button
              type="submit"
              name={loading ? "Please wait..." : "SUBMIT"}
              fill
              disabled={
                !(
                  formState.values?.companyName || formState.values?.cinNumber
                ) ||
                (formState.values?.companyName &&
                  formState.values?.cinNumber) ||
                loading
              }
            />
          </form>
        </Colom1>
        <Colom2>
          <Img src={productDetails.productDetailsImage} alt="Loan Caption" />
        </Colom2>
      </>
    )
  );
}

BussinessDetails.propTypes = {
  productDetails: object,
  onFlowChange: func.isRequired,
  map: oneOfType([string, object]),
  id: string,
};
