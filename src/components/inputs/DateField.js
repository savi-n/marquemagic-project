import styled from "styled-components";

const Input = styled.input`
  height: 50px;
  padding: 10px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  :focus + label {
    display: none;
  }
`;

const Div = styled.div`
  position: relative;
`;

const Label = styled.label`
  position: absolute;
  top: 1%;
  bottom: 2%;
  left: 1%;
  right: 10%;
  z-index: 9;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: lightgray;
  background: white;
  ${({ value }) => value && `display:none`}
`;

export default function DateField(props) {
  return (
    <Div>
      <Input id={props.name} type={props.type} {...props} />
      <Label value={props.value} htmlFor={props.name}>
        {props.placeholder} (dd-mm-yyyy)
      </Label>
    </Div>
  );
}
