import styled from "styled-components";
import { array, func, object, oneOfType, string } from "prop-types";

const H = styled.h1`
  font-size: 1.5em;
  font-weight: 500;
  span {
    color: ${({ theme }) => theme.main_theme_color};
  }
`;

const FieldWrap = styled.div`
  width: 45%;
  margin: 10px 0;
`;

const FormWrap = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10%;
  margin: 20px 0;
  justify-content: space-between;
  /* flex-flow: wrap column; */
  /* max-height: 400px; */
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;

export default function PersonalDetails({
  preData = {},
  pageName,
  userType,
  jsonData,
  register,
  formState,
}) {
  const populateValue = (field) => {
    if (!userType && field.disabled) {
      return preData[field.name] || "";
    }

    if (formState?.values?.[field.name] !== undefined) {
      return formState?.values?.[field.name];
    }

    return preData[field.name] || "";
  };

  return (
    <>
      <H>
        {userType || "Help us with your"}{" "}
        <span>{pageName || "Personal Details"}</span>
      </H>
      <FormWrap>
        {jsonData &&
          jsonData.map(
            (field) =>
              field.visibility && (
                <FieldWrap key={field.name}>
                  {register({
                    ...field,
                    value: populateValue(field),
                    ...(userType ? { disabled: false } : {}),
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

PersonalDetails.propTypes = {
  preData: object,
  register: func.isRequired,
  jsonData: oneOfType([array, object]),
  userType: string,
  formState: object,
};
