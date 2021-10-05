import { createSlice } from "@reduxjs/toolkit";

const branchFlowSlice = createSlice({
  name: "branch",
  initialState: {
    activ: "Applicant",
    viewLoan: false,
  },
  reducers: {
    setProductIdAction(state, action) {
      const id = action.payload;
      state.productID = id;
    },
    setProductAction(state, action) {
      const prod = action.payload;
      state.product = prod;
    },
    setItemAction(state, action) {
      const item = action.payload;
      state.item = item;
    },
    setViewLoanAction(state, action) {
      const item = action.payload;
      state.viewLoan = item;
    },
    setResetLoanAction(state) {
      state.viewLoan = false;
      state.item = "";
      state.product = "";
      state.productID = "";
      state.id = "";
    },
    setIdAction(state, action) {
      const id = action.payload;
      state.id = id;
    },
    setActivAction(state, action) {
      const activ = action.payload;
      state.activ = activ;
    },

    setAssignmentLogAction(state, action) {
      const assignmentLog = action.payload;
      state.assignmentLog = assignmentLog;
    },
  },
});
export const branchAction = branchFlowSlice.actions;
export default branchFlowSlice;
