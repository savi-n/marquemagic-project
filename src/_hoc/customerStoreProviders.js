import { UserProvider } from "../reducer/userReducer";
import { FormProvider } from "../reducer/formReducer";
import { FlowProvider } from "../reducer/flowReducer";
import { CaseProvider } from "../reducer/caseReducer";

export default function CustomerStoreProvider({ children }) {
  return (
    <UserProvider>
      <FlowProvider>
        <FormProvider>
          <CaseProvider>{children}</CaseProvider>
        </FormProvider>
      </FlowProvider>
    </UserProvider>
  );
}
