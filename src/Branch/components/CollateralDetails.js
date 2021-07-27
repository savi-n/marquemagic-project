import styled from "styled-components";

import useFetch from "../../hooks/useFetch";
import useForm from "../../hooks/useForm";
import Button from "../../components/Button";
import {
  BRANCH_COLLATERAL_DETAILS,
  BRANCH_COLLATERAL_SELCTED,
} from "../../_config/branch.config";
import { useState } from "react/cjs/react.development";

const FieldWrapper = styled.div`
  padding: 20px 0;
  width: 100%;
`;

const WrapperContent = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.form`
  width: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const pageStates = {
  fetch: "fetch",
  available: "available",
};

export default function CollateralDetails({ loanId }) {
  const { newRequest } = useFetch();
  const { register, handleSubmit, formState } = useForm();

  const [fetching, setFetching] = useState(false);
  const [pageState, setPageState] = useState(pageStates.fetch);

  const [colateralDetails, setColateralDetails] = useState(null);

  const fetchCollateralDetails = async (url) => {
    const fetchCollateral = await newRequest(
      url,
      {
        method: "POST",
      },
      {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    );

    return fetchCollateral;
  };

  const onSubmitCollateral = async ({ collateralType }) => {
    setFetching(true);
    const colateralDataReq = await fetchCollateralDetails(
      BRANCH_COLLATERAL_SELCTED({
        custAccNo: colateralDetails?.account_number,
        collateral: collateralType,
      })
    );
    const colateralDataRes = colateralDataReq.data;
    console.log(colateralDataRes);

    setFetching(false);
  };

  const onSubmitAccount = async ({ custAccNo }) => {
    setFetching(true);
    const colateralDataReq = await fetchCollateralDetails(
      BRANCH_COLLATERAL_DETAILS({ loanID: loanId, custAccNo })
    );
    const colateralDataRes = colateralDataReq.data;

    setColateralDetails(colateralDataRes.data);
    setPageState(pageStates.available);
    setFetching(false);
  };

  return (
    <>
      {pageState === pageStates.fetch && (
        <WrapperContent>
          <Wrapper onSubmit={handleSubmit(onSubmitAccount)}>
            <FieldWrapper>
              {register({
                name: "custAccNo",
                placeholder: "Enter Customer / Account Number",
                value: formState?.values?.custAccNo,
              })}
            </FieldWrapper>

            <Button
              type="submit"
              name="Submit"
              fill
              disabled={!formState.values?.custAccNo || fetching}
            />
          </Wrapper>
        </WrapperContent>
      )}

      {pageState === pageStates.available && (
        <WrapperContent>
          <Wrapper onSubmit={handleSubmit(onSubmitCollateral)}>
            <FieldWrapper>
              {register({
                name: "collateralType",
                type: "select",
                placeholder: "Select Collateral",
                value: formState?.values?.collateralType,
                options: colateralDetails.collaterals.map((col) => ({
                  value: col.collateralNumber,
                  name: col.collateralNumber,
                })),
              })}
            </FieldWrapper>

            <Button
              type="submit"
              name="Submit"
              fill
              disabled={!formState?.values?.collateralType || fetching}
            />
          </Wrapper>
        </WrapperContent>
      )}
    </>
  );
}
