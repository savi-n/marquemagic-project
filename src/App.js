import styled from "styled-components";

import AppLayout from "./components/AppLayout";
import { AppProvider } from "./reducer/appReducer";
import { UserProvider } from "./reducer/userReducer";
import { FormProvider } from "./reducer/formReducer";
import { FlowProvider } from "./reducer/flowReducer";
import { CaseProvider } from "./reducer/caseReducer";

const AppWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export default function App() {
  return (
    <AppWrapper>
      <AppProvider>
        <UserProvider>
          <FlowProvider>
            <FormProvider>
              <CaseProvider>
                <AppLayout />
              </CaseProvider>
            </FormProvider>
          </FlowProvider>
        </UserProvider>
      </AppProvider>
    </AppWrapper>
  );
}
