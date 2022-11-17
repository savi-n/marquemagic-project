import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	loanRefId: '',
	loanId: '',
	businessId: '',
	documents: [],
	sections: {},
};

export const applicantSlice = createSlice({
	name: 'application',
	initialState,
	reducers: {
		setLoanIds: (state, action) => {
			const { loanRefId, loanId, businessId } = action.payload;
			state.loanRefId = loanRefId;
			state.loanId = loanId;
			state.businessId = businessId;
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
		addDocument: (state, action) => {
			// const { file } = action.payload;
			// pass only single file object
			state.documents.push(action.payload);
		},
		updateDocuments: (state, action) => {
			// const { files } = action.payload;
			// you can pass array of files
			state.documents = [...state.documents, ...action.payload];
		},
		removeAllDocuments: state => {
			state.documents = [];
		},
		updateApplicationSection: (state, action) => {
			const { id, values } = action.payload;
			state.sections[id] = values;
		},
	},
});

export const {
	setLoanIds,
	setloanRefId,
	setLoanId,
	setBusinessId,
	addDocument,
	updateDocuments,
	removeAllDocuments,
	updateApplicationSection,
} = applicantSlice.actions;

export default applicantSlice.reducer;
