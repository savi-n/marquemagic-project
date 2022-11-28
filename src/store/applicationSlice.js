import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

const initialState = {
	loanRefId: '',
	loanId: '',
	businessId: '',
	businessUserId: '',
	loanProductId: '',
	loanAssetsId: '',
	assetsAdditionalId: '',
	refId1: '',
	refId2: '',
	sections: {},
	cacheDocuments: [],
	documents: [],
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
			if (businessUserId) state.businessUserId = businessUserId;
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
				refId1,
				refId2,
			} = action.payload;
			state.sections[sectionId] = sectionValues;
			if (loanAssetsId) state.loanAssetsId = loanAssetsId;
			if (assetsAdditionalId) state.assetsAdditionalId = assetsAdditionalId;
			if (refId1) state.refId1 = refId1;
			if (refId2) state.refId2 = refId2;
		},

		// CACHE DOCUMENT RELATED ACTIONS
		addCacheDocument: (state, action) => {
			// pass only single file object
			const { file } = action.payload;
			state.cacheDocuments.push(file);
		},
		addCacheDocuments: (state, action) => {
			const { files } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = [...oldDocuments, ...files];
			state.cacheDocuments = newDocuments;
		},
		removeCacheDocument: (state, action) => {
			const { fieldName } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = oldDocuments.filter(
				doc => doc?.field?.name !== fieldName
			);
			state.cacheDocuments = newDocuments;
		},
		// -- CACHE DOCUMENT RELATED ACTIONS
	},
});

export const {
	setLoanIds,
	setloanRefId,
	setLoanId,
	setBusinessId,
	updateApplicationSection,

	addCacheDocument,
	addCacheDocuments,
	removeCacheDocument,
} = applicantSlice.actions;

export default applicantSlice.reducer;
