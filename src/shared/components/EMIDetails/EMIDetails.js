import styled from "styled-components";

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: blue;
  }
`;

const FieldWrap = styled.div`
  width: 50%;
  margin: 10px 0;
`;

const FormWrap = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10%;
  margin: 20px 0;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;

export default function EMIDetails({
  pageName,
  jsonData,
  register,
  formState,
}) {
  return (
    <>
      <H>
        EMI details of exsisting loans availed by CUB or other banks, if any..
      </H>
      <FormWrap>
        {jsonData &&
          jsonData.map(
            (field) =>
              field.visibility && (
                <FieldWrap key={field.name}>
                  {register(field)}
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
      </FormWrap>
    </>
  );
}
