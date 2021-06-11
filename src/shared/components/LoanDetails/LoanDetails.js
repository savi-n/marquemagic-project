import { useContext } from "react";
import styled from "styled-components";

import { UserContext } from "../../../reducer/userReducer";
import useFetch from "../../../hooks/useFetch";
import {
  NC_STATUS_CODE,
  SEARCH_BANK_BRANCH_LIST,
} from "../../../_config/app.config";

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: blue;
  }
`;

const FieldWrap = styled.div`
  width: 100%;
  margin: 10px 0;
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
  flex-basis: 45%;
  align-items: center;
  flex-wrap: wrap;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;

export default function LoanDetails({
  pageName,
  jsonData,
  register,
  formState,
  userType,
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
                  <FieldWrap key={field.name}>
                    {register({
                      ...field,
                      value: formState?.values?.[field.name],
                      ...(field.type === "search"
                        ? {
                            searchable: true,
                            fetchOptionsFunc: getBranchOptions,
                          }
                        : {}),
                    })}
                    {(formState?.submit?.isSubmited ||
                      formState?.touched?.[field.name]) &&
                      formState?.error?.[field.name] && (
                        <ErrorMessage>
                          {formState?.error?.[field.name]}
                        </ErrorMessage>
                      )}
                  </FieldWrap>
                )
            )}
        </Colom>
      </FormWrap>
    </>
  );
}
