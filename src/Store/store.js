import { configureStore } from "@reduxjs/toolkit";
import branchFlowSlice from "./branchSlice";

const store = configureStore({
  reducer: { branchFlow: branchFlowSlice.reducer },
});

export default store;
