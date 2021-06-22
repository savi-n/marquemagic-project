import styled from "styled-components";
import { array, bool, func, object, oneOfType, string } from "prop-types";

import CheckBox from "../Checkbox/CheckBox";

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
  flex-wrap: wrap;
  gap: 10%;
  justify-content: space-between;
  margin: 20px 0;
`;

const Colom = styled.div`
  display: flex;
  flex-basis: 45%;
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

AddressDetails.propTypes = {
  userType: string,
  jsonData: oneOfType([array, object]),
  register: func,
  formState: object,
  match: bool,
  setMatch: func.isRequired,
};

export default function AddressDetails({
  userType,
  jsonData,
  register,
  formState,
  match,
  setMatch,
}) {
  return (
    <>
      <H>
        {userType || "Help us with your"} <span>Address Details</span>
      </H>
      <FormWrap>
        <Colom>
          <Caption>Permanent Address</Caption>
          {jsonData &&
            jsonData.map(
              (field) =>
                field.visibility && (
                  <FieldWrap key={`permanent_${field.name}`}>
                    {register({
                      ...field,
                      name: `permanent_${field.name}`,
                      value: formState?.values?.[`permanent_${field.name}`],
                    })}
                    {(formState?.submit?.isSubmited ||
                      formState?.touched?.[`permanent_${field.name}`]) &&
                      formState?.error?.[`permanent_${field.name}`] && (
                        <ErrorMessage>
                          {formState?.error?.[`permanent_${field.name}`]}
                        </ErrorMessage>
                      )}
                  </FieldWrap>
                )
            )}
        </Colom>
        <Colom>
          <Caption>
            Present Address{" "}
            <CheckBox
              checked={match}
              onChange={() => setMatch(!match)}
              bg="blue"
              name="Same as Permanent Address"
            />
          </Caption>
          {jsonData &&
            jsonData.map(
              (field) =>
                field.visibility && (
                  <FieldWrap key={`present_${field.name}`}>
                    {register({
                      ...field,
                      name: `present_${field.name}`,
                      value: match
                        ? formState?.values?.[`permanent_${field.name}`]
                        : formState?.values?.[`present_${field.name}`],
                    })}
                    {(formState?.submit?.isSubmited ||
                      formState?.touched?.[`present_${field.name}`]) &&
                      formState?.error?.[`present_${field.name}`] && (
                        <ErrorMessage>
                          {formState?.error?.[`present_${field.name}`]}
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
