import { useContext } from "react";
import styled from "styled-components";

import { UserContext } from "../../../reducer/userReducer";
import useFetch from "../../../hooks/useFetch";
import Button from "../../../components/Button";
import {
  NC_STATUS_CODE,
  SEARCH_BANK_BRANCH_LIST,
  SEARCH_LOAN_ASSET,
} from "../../../_config/app.config";

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: blue;
  }
`;

const Field = styled.div`
  width: ${({ size }) => (size ? size : "45%")};
  margin: 10px 0;
`;

const FieldWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const FormWrap = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10%;
  margin: 20px 0;
`;

const Colom = styled.div`
  display: flex;
  /* flex-basis: ${({ size }) => (size ? size : "45%")}; */
  flex-direction: column;
  /* align-items: center; */
  width: 100%;
  flex-wrap: wrap;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;

const Currency = styled.div`
  width: 20px;
`;

export default function LoanDetails({
  pageName,
  jsonData,
  register,
  formState,
  userType,
  loanType,
  size,
}) {
  const {
    state: { userToken },
  } = useContext(UserContext);

  const { newRequest } = useFetch();

  const getBranchOptions = async () => {
    const opitionalDataReq = await newRequest(
      SEARCH_BANK_BRANCH_LIST({ bankId: 32 }),
      {},
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    const opitionalDataRes = opitionalDataReq.data;
    if (opitionalDataRes.statusCode === NC_STATUS_CODE.NC200) {
      return opitionalDataRes.branchList
        .map((branch) => ({
          name: branch.branch,
          value: String(branch.id),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const getBrandsOnSearch = async (data) => {
    const opitionalDataReq = await newRequest(
      SEARCH_LOAN_ASSET,
      { method: "POST", data: { ...data, type: loanType } },
      {
        Authorization: `Bearer ${userToken}`,
      }
    );

    const opitionalDataRes = opitionalDataReq.data;
    if (opitionalDataRes.message) {
      return opitionalDataRes.data;
    }
    return [];
  };

  const fieldTemplate = (field) => {
    return (
      <FieldWrapper>
        <Field key={field.name} size={size}>
          {register({
            ...field,
            value: formState?.values?.[field.name],
            ...(field.type === "search"
              ? {
                  searchable: true,
                  ...(field.fetchOnInit && {
                    fetchOptionsFunc: getBranchOptions,
                  }),
                  ...(field.fetchOnSearch && {
                    searchOptionCallback: getBrandsOnSearch,
                  }),
                }
              : {}),
          })}
          {(formState?.submit?.isSubmited ||
            formState?.touched?.[field.name]) &&
            formState?.error?.[field.name] && (
              <ErrorMessage>{formState?.error?.[field.name]}</ErrorMessage>
            )}
        </Field>
        <Currency />

        {field.uploadButton && (
          <Button fill name={field.uploadButton} width="150px" />
        )}
      </FieldWrapper>
    );
  };

  return (
    <>
      <H>
        {userType || "Help us with your"} <span>Loan Details</span>
      </H>
      <FormWrap>
        <Colom>
          {jsonData &&
            jsonData.map(
              (field) =>
                field.visibility && (
                  <>
                    {fieldTemplate(field)}
                    {field.forType &&
                      field.forType[(formState?.values?.[field.name])] &&
                      field.forType[(formState?.values?.[field.name])].map(
                        (f) => fieldTemplate(f)
                      )}
                  </>
                )
            )}
        </Colom>
      </FormWrap>
    </>
  );
}
