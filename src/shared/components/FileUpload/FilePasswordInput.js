import { useRef } from "react";
import styled from "styled-components";

const Input = styled.input`
  height: 40px;
  padding: 10px;
  /* width: 40%; */
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
`;

const Wrapper = styled.div`
  position: absolute;
  padding: 10px;
  bottom: 105%;
  /* width: 250px; */
  right: -100%;
  /* background: #fff8f8; */
  backdrop-filter: blur(10px);
  z-index: 998;
  margin-bottom: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
  &::after {
    content: "";
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #fff8f8;
    position: absolute;
    top: 100%;
    right: 10%;
    transform: translateX(-50%);
  }
`;

const Button = styled.button`
  --base-color: ${({ theme }) => (theme ? theme.main_theme_color : "black")};
  margin-left: 10px;
  border: 2px solid var(--base-color);
  padding: 8px;
  border-radius: 10px;
  font-weight: 800;
  color: var(--base-color);
`;

const CancelBtn = styled.span`
  background: #f16a6a;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  /* align-self: center; */
  margin-left: 10px;
`;

export default function FilePasswordInput({
  fileId,
  onClickCallback = () => {},
  onClose = () => {},
}) {
  const inputRef = useRef();

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClickCallback(fileId, inputRef.current.value);
  };

  return (
    <Wrapper>
      <Input type="password" ref={inputRef} placeholder="Password" />
      <Button onClick={onClick}>Submit</Button>
      <CancelBtn onClick={onClose}>&#10006;</CancelBtn>
    </Wrapper>
  );
}
