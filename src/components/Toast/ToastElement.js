import styled from "styled-components";

const TOAST_TYPE_SYMBOLS = {
  success: ["&check;", "#01914a"],
  warning: ["&#33;", "#ff8405"],
  error: ["&#10006;", "#ff0000"],
  info: ["i", "blue"],
  default: ["", "grey"],
};

const ToastElement = styled.div`
  padding: 10px;
  background: white;
  border-radius: 5px;
  box-shadow: 0px 2px 5px 1px rgb(0 0 0 / 20%);
  border: 1px solid rgb(0 0 0 / 20%);
  margin: 10px 0;
  max-width: 300px;
  display: flex;
  align-items: center;
  transition: 0.2s;
`;

const ToastIcon = styled.span`
  padding: 10px;
  margin: 0 10px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  display: flex;
  background: ${({ type }) => TOAST_TYPE_SYMBOLS[type][1]};
  overflow: hidden;
  color: white;
  font-size: 15px;
  font-weight: 500;
`;

const ToastMessage = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

export default function Toast({ message, type }) {
  return (
    <ToastElement>
      <ToastIcon
        type={type}
        dangerouslySetInnerHTML={{
          __html: TOAST_TYPE_SYMBOLS[type || "default"][0],
        }}
      />
      <ToastMessage>{message}</ToastMessage>
    </ToastElement>
  );
}
