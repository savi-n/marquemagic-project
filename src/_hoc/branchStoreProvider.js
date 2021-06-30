import { BranchUserProvider } from "../reducer/branchUserReducer";

export default function BranchStoreProvider({ children }) {
  return <BranchUserProvider>{children}</BranchUserProvider>;
}
