import styled from "styled-components";

const Select = styled.select`
  height: 50px;
  padding: 10px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
`;

const Div = styled.div`
  position: relative;
`;

const Label = styled.label`
  position: absolute;
  z-index: 9;
  display: flex;
  align-items: center;
  background: white;
  overflow: hidden;
  top: -10%;
  left: 2%;
  font-size: 10px;
  color: black;
  height: 20%;
  padding: 0 5px;
  width: inherit;

  ${({ disabled }) =>
    disabled &&
    `
    background: #fafafa;
  `}
`;

const Asteris = styled.span`
  color: red;
`;

export default function SelectField(props) {
  return (
    <Div>
      <Select {...props}>
        <option disabled value="">
          {props.placeholder}
        </option>
        {props.options?.map(({ value, name }) => (
          <option key={value} value={value.toString().trim()}>
            {name}
          </option>
        ))}
      </Select>
      <Label value={props.value} htmlFor={props.name} disabled={props.disabled}>
        <span>{props.placeholder}</span>
        {props.rules?.required && !props.disabled && <Asteris>*</Asteris>}
      </Label>
    </Div>
  );
}
