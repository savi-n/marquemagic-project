import { UserProvider } from "../reducer/userReducer";
import { FormProvider } from "../reducer/formReducer";
import { FlowProvider } from "../reducer/flowReducer";
import { CaseProvider } from "../reducer/caseReducer";
import { BussinesProvider } from "../reducer/bussinessReducer";

export default function CustomerStoreProvider({ children }) {
  return (
    <UserProvider>
      <BussinesProvider>
        <FlowProvider>
          <FormProvider>
            <CaseProvider>{children}</CaseProvider>
          </FormProvider>
        </FlowProvider>
      </BussinesProvider>
    </UserProvider>
  );
}
