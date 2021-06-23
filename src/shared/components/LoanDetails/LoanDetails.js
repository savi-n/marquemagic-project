import { Fragment, useContext } from "react";
import styled from "styled-components";
import { func, object, oneOfType, string, array } from "prop-types";

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
  width: 60%;
`;

const Currency = styled.div`
  width: 40px;
  font-size: 13px;
  text-align: center;
  font-weight: 500;
`;

const Or = styled.span`
  text-align: center;
  width: 60%;
`;

LoanDetails.propTypes = {
  userType: string,
  jsonData: oneOfType([array, object]),
  label: string.isRequired,
  register: func,
  formState: object,
  loanType: string,
  size: string,
  buttonAction: func,
  uploadedDocs: func,
};

export default function LoanDetails({
  jsonData,
  register,
  formState,
  userType,
  loanType,
  label,
  size,
  buttonAction = () => {},
  uploadedDocs = {},
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

  const onUploadAgreementAction = (name) => {
    buttonAction(name);
  };

  const fieldTemplate = (field) => {
    return (
      <>
        <FieldWrapper key={field.name}>
          <Field size={size}>
            {register({
              ...field,
              value: formState?.values?.[field.name],
              rules: {
                ...field.rules,
                ...(field.uploadButton && {
                  subAction: !uploadedDocs[field.name]?.length,
                }),
              },
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
          </Field>
          <Currency>{field.inrupees ? "(In  ₹ )" : ""}</Currency>

          {field.uploadButton && (
            <Button
              fill
              name={field.uploadButton}
              width="150px"
              onClick={() => onUploadAgreementAction(field.name)}
              disabled={field.disabled}
            />
          )}
        </FieldWrapper>
        {(formState?.submit?.isSubmited || formState?.touched?.[field.name]) &&
          formState?.error?.[field.name] && (
            <ErrorMessage>{formState?.error?.[field.name]}</ErrorMessage>
          )}
        {field.forType &&
          field.forType[(formState?.values?.[field.name])] &&
          field.forType[(formState?.values?.[field.name])].map((f) =>
            makeFields(f)
          )}
      </>
    );
  };

  const makeFields = (fields) => {
    if (Array.isArray(fields)) {
      let renderArray = [];

      const oneOfHasValue = fields.find((f) => {
        if (formState?.values?.[f.name]) {
          return {
            name: f.name,
            value: formState?.values?.[f.name],
          };
        }
        return false;
      });
      for (let i = 0; i < fields.length; i++) {
        if (i) renderArray.push(<Or key={`or_key_${i}`}>Or</Or>);
        renderArray.push(
          fieldTemplate({
            ...fields[i],
            rules: {
              ...fields[i].rules,
              required: !oneOfHasValue,
            },
            disabled: oneOfHasValue && fields[i].name !== oneOfHasValue?.name,
          })
        );
      }
      return renderArray;
    }

    return fieldTemplate(fields);
  };

  return (
    <>
      <H>
        {userType || "Help us with "} <span>{label}</span>
      </H>
      <FormWrap>
        <Colom>
          {jsonData &&
            jsonData.map(
              (field) =>
                field.visibility && (
                  <Fragment key={field.name}>{fieldTemplate(field)}</Fragment>
                )
            )}
        </Colom>
      </FormWrap>
    </>
  );
}
