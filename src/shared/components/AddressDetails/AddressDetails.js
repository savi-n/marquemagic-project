import styled from "styled-components";

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

const Caption = styled.h3`
  width: 100%;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
`;

export default function AddressDetails({
  pageName,
  userType,
  jsonData,
  register,
  formState,
}) {
  return (
    <>
      <H>
        {userType || "Help us with your"}{" "}
        <span>{pageName || "Address Details"}</span>
      </H>
      <FormWrap>
        <Colom>
          <Caption>Permanent Address</Caption>
          {jsonData &&
            jsonData.map(
              (field) =>
                field.visibility && (
                  <FieldWrap>
                    {register({
                      placeholder: field.label,
                      name: field.label,
                      type: field.type,
                    })}
                  </FieldWrap>
                )
            )}
        </Colom>
        <Colom>
          <Caption>
            Present Address <CheckBox name="Same as Permanent Address" />
          </Caption>
          {jsonData &&
            jsonData.map(
              (field) =>
                field.visibility && (
                  <FieldWrap>
                    {register({
                      placeholder: field.label,
                      name: field.label,
                      type: field.type,
                    })}
                  </FieldWrap>
                )
            )}
        </Colom>
      </FormWrap>
    </>
  );
}
