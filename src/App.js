import styled from "styled-components";

import AppLayout from "./components/AppLayout";
import { StoreProvider } from "./utils/StoreProvider";
import { UserProvider } from "./reducer/userReducer";

const AppWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function App() {
  return (
    <AppWrapper>
      <StoreProvider>
        <UserProvider>
          <AppLayout />
        </UserProvider>
      </StoreProvider>
    </AppWrapper>
  );
}
