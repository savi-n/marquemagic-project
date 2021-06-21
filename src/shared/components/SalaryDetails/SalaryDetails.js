import styled from "styled-components";
import { func, object, oneOfType, string, array } from "prop-types";

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: blue;
  }
`;

const FieldWrap = styled.div`
  width: 45%;
  margin: 10px 0;
`;

const FormWrap = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 10%;
  margin: 20px 0;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;

export default function SalaryDetails({
  jsonData,
  register,
  userType,
  formState,
}) {
  return (
    <>
      <H>
        {userType || "Help us with"} <span>Salary Details</span>
      </H>
      <FormWrap>
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
      </FormWrap>
    </>
  );
}

SalaryDetails.propTypes = {
  preData: object,
  register: func.isRequired,
  jsonData: oneOfType([array, object]),
  userType: string,
  formState: object,
};
