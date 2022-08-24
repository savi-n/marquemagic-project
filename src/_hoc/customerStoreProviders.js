import { UserProvider } from '../reducer/userReducer';
import { FormProvider } from '../reducer/formReducer';
import { FlowProvider } from '../reducer/flowReducer';
import { CaseProvider } from '../reducer/caseReducer';
import { BussinesProvider } from '../reducer/bussinessReducer';

import { LoanFormProvider } from '../reducer/loanFormDataReducer';

export default function CustomerStoreProvider({ children }) {
	return (
		<UserProvider>
			<BussinesProvider>
				<FlowProvider>
					<FormProvider>
						<LoanFormProvider>
							<CaseProvider>{children}</CaseProvider>
						</LoanFormProvider>
					</FormProvider>
				</FlowProvider>
			</BussinesProvider>
		</UserProvider>
	);
}
