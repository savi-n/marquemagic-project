import styled from "styled-components";

import AppLayout from "./components/AppLayout";
import { AppProvider } from "./reducer/appReducer";
import { ToastProvider } from "./components/Toast/ToastProvider";

const AppWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function App() {
  return (
    <AppWrapper>
      <AppProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AppProvider>
    </AppWrapper>
  );
}
