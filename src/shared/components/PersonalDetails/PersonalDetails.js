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
  flex-flow: wrap column;
  max-height: 350px;
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
                <FieldWrap key={field.name}>{register(field)}</FieldWrap>
              )
          )}
      </FormWrap>
    </>
  );
}
