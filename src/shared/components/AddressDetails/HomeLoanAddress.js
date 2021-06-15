// import { useState } from "react";
import styled from "styled-components";

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
  /* align-items: center; */
  flex-wrap: wrap;
  gap: 10%;
  margin: 20px 0;
`;

const Colom = styled.div`
  display: flex;
  flex-basis: ${({ size }) => (size ? size : "45%")};
  align-items: center;
  flex-wrap: wrap;
`;

const Caption = styled.h3`
  width: 100%;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;

export default function HomeLoanAddressDetails({
  pageName,
  userType,
  jsonData,
  register,
  formState,
  size,
}) {
  return (
    <>
      <H>Address of the Property(with locality)</H>
      <FormWrap>
        <Colom size={size}>
          {jsonData &&
            jsonData.map(
              (field) =>
                field.visibility && (
                  <FieldWrap key={field.name}>
                    {register({
                      ...field,
                      name: field.name,
                      value: formState?.values?.[field.name],
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
