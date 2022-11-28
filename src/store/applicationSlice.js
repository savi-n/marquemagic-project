import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	loanRefId: '',
	loanId: '',
	businessId: '',
	businessUserId: '',
	loanProductId: '',
	loanAssetsId: '',
	assetsAdditionalId: '',
	documents: [],
	sections: {},
	preUploadedDocuments: [],
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
				createdByUserId,
			} = action.payload;
			if (loanRefId) state.loanRefId = loanRefId;
			if (loanId) state.loanId = loanId;
			if (businessId) state.businessId = businessId;
			if (businessUserId) state.setBusinessId = businessUserId;
			if (loanProductId) state.loanProductId = loanProductId;
			if (createdByUserId) state.createdByUserId = createdByUserId;
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
		updateApplicationSection: (state, action) => {
			const {
				sectionId,
				sectionValues,
				loanAssetsId,
				assetsAdditionalId,
			} = action.payload;
			state.sections[sectionId] = sectionValues;
			if (loanAssetsId) state.loanAssetsId = loanAssetsId;
			if (assetsAdditionalId) state.assetsAdditionalId = assetsAdditionalId;
		},
	},
});

export const {
	setLoanIds,
	setloanRefId,
	setLoanId,
	setBusinessId,
	updateApplicationSection,
} = applicantSlice.actions;

export default applicantSlice.reducer;
