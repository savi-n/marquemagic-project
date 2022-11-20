import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

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
		addLoanDocument: (state, action) => {
			// const { file } = action.payload;
			// pass only single file object
			state.documents.push(action.payload);
		},
		addLoanDocuments: (state, action) => {
			// const { files } = action.payload;
			// you can pass array of files
			state.documents = [...state.documents, ...action.payload];
		},
		removeLoanDocument: (state, action) => {
			state.documents = state.documents.filter(d => d.id === action.payload);
		},
		removeAllLoanDocuments: state => {
			state.documents = [];
		},
		removeAllAddressProofDocs: state => {
			state.documents = state.documents.filter(d => d.req_type === 'pan');
		},
		updateApplicationSection: (state, action) => {
			const { id, values } = action.payload;
			state.sections[id] = values;
		},
		updateSelectedDocumentTypeId: (state, action) => {
			state.documents = (state.documents || []).map(doc =>
				doc.id === action.payload.fileId
					? {
							..._.cloneDeep(doc),
							..._.cloneDeep(action.payload?.fileType || {}),
							typeId: action.payload?.fileType?.value,
							typeName: action.payload?.fileType?.name,
							mainType: action.payload?.fileType?.main,
							password: action.payload?.fileType?.password,
					  }
					: doc
			);
		},
	},
});

export const {
	setLoanIds,
	setloanRefId,
	setLoanId,
	setBusinessId,
	addLoanDocument,
	addLoanDocuments,
	removeLoanDocument,
	removeAllLoanDocuments,
	updateApplicationSection,
	updateSelectedDocumentTypeId,
	removeAllAddressProofDocs,
} = applicantSlice.actions;

export default applicantSlice.reducer;
