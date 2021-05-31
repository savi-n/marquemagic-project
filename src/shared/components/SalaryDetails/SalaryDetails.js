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
  justify-content: center;
  flex-direction: column;
  gap: 10%;
  margin: 20px 0;
`;

export default function SalaryDetails({ jsonData, register }) {
  return (
    <>
      <H>
        Help us with <span>Salary Details</span>
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
