import styled from "styled-components";
import { func, object, oneOfType, string, array } from "prop-types";

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: ${({ theme }) => theme.main_theme_color};
  }
`;

const FieldWrap = styled.div`
  width: ${({ size }) => (size ? size : "45%")};
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
  size,
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
              field.visibility &&
              (formState?.values?.incomeType === field.forType ||
              !formState?.values?.incomeType ? (
                <FieldWrap key={field.name} size={size}>
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
              ) : null)
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
  size: string,
};
