import styled from "styled-components";

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
  align-items: center;
  flex-wrap: wrap;
  gap: 10%;
  margin: 20px 0;
`;

export default function PersonalDetails({
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
        <span>{pageName || "Personal Details"}</span>
      </H>
      <FormWrap>
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
      </FormWrap>
    </>
  );
}
