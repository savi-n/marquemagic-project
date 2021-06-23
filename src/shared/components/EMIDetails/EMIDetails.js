import styled from "styled-components";
import { array, func, object, oneOfType } from "prop-types";

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
  display: flex;
  /* gap: 10%; */
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

const Currency = styled.div`
  width: 10%;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: 0 5px;
`;

const Field = styled.div`
  width: 40%;
`;

EMIDetails.propTypes = {
  register: func.isRequired,
  jsonData: oneOfType([array, object]),
  formState: object,
};

export default function EMIDetails({ jsonData, register, formState }) {
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
                  <Field>
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
                  </Field>
                  <Currency>{field.inrupees ? "(In  ₹ )" : ""}</Currency>
                  <Field>
                    {register({
                      type: "select",
                      name: field.subFieldName,
                      placeholder: "Select Bank",
                      value: formState?.values?.[field.subFieldName],
                    })}
                  </Field>
                  {/* rules: { required: !!formState?.values?.[field.name] }, */}
                  {/* {(formState?.submit?.isSubmited ||
                    formState?.touched?.[`${field.name}_bank`]) &&
                    formState?.error?.[`${field.name}_bank`] && (
                      <ErrorMessage>
                        {formState?.error?.[`${field.name}_bank`]}
                      </ErrorMessage>
                    )} */}
                </FieldWrap>
              )
          )}
      </FormWrap>
    </>
  );
}
