import styled from "styled-components";

import AppLayout from "./components/AppLayout";
import { StoreProvider } from "./utils/StoreProvider";
import { UserProvider } from "./reducer/userReducer";
import { FormProvider } from "./reducer/formReducer";
import { FlowProvider } from "./reducer/flowReducer";

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
          <FlowProvider>
            <FormProvider>
              <AppLayout />
            </FormProvider>
          </FlowProvider>
        </UserProvider>
      </StoreProvider>
    </AppWrapper>
  );
}
