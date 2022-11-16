import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	caseRefId: 'XXXXXXXX',
	loanId: '',
	businessId: '',
	documents: [],
	sections: {},
};

export const applicantSlice = createSlice({
	name: 'application',
	initialState,
	reducers: {
		addDocument: (state, action) => {
			const { file } = action.payload;
			state.documents.push(file);
		},
		updateDocuments: (state, action) => {
			const { files } = action.payload;
			state.documents = [...state.documents, ...files];
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
	addDocument,
	updateDocuments,
	removeAllDocuments,
	updateApplicationSection,
} = applicantSlice.actions;

export default applicantSlice.reducer;
