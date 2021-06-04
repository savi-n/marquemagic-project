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
  return (
    <>
      <H>
        {userType || "Help us with your"}{" "}
        <span>{pageName || "Address Details"}</span>
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
