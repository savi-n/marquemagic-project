import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	loanRefId: '',
	loanId: '',
	businessId: '',
	businessUserId: '',
	loanProductId: '',
	documents: [],
	sections: {},
};

export const applicantSlice = createSlice({
	name: 'application',
	initialState,
	reducers: {
		setLoanIds: (state, action) => {
			const {
				loanRefId,
				loanId,
				businessId,
				businessUserId,
				loanProductId,
			} = action.payload;
			state.loanRefId = loanRefId;
			state.loanId = loanId;
			state.businessId = businessId;
			state.setBusinessId = businessUserId;
			state.loanProductId = loanProductId;
		},
		setloanRefId: (state, action) => {
			state.loanRefId = action.payload;
		},
		setLoanId: (state, action) => {
			state.loanId = action.payload;
		},
		setBusinessId: (state, action) => {
			state.businessId = action.payload;
		},
	},
});

export const {
	setLoanIds,
	setloanRefId,
	setLoanId,
	setBusinessId,
} = applicantSlice.actions;

export default applicantSlice.reducer;
