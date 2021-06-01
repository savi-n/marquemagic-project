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

export default function LoanDetails({
  pageName,
  jsonData,
  register,
  formState,
}) {
  return (
    <>
      <H>
        Help us with your <span>{pageName || "Address Details"}</span>
      </H>
      <FormWrap>
        <Colom>
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
