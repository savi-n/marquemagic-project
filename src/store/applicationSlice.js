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
	documents: [],
	cacheDocuments: [],
	allDocumentTypes: [],
	api: {},
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
			const { doc_type_id, directorId, fileId } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = oldDocuments.filter(doc => {
				if (fileId && doc?.id === fileId) return false;
				if (
					doc?.doc_type_id === doc_type_id &&
					doc?.directorId === directorId
				) {
					return false;
				}
				return true;
			});
			state.cacheDocuments = newDocuments;
		},
		updateCacheDocumentTypeId: (state, action) => {
			// console.log('updateSelectedDocumentTypeId-', { action });
			const { fileId, docType } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = [];
			oldDocuments.map(doc => {
				if (doc.id === fileId) {
					return newDocuments.push({
						// ...(docType || {}), // add more field only if required
						...doc,
						doc_type_id: docType?.doc_type_id,
						isMandatory: !!docType?.isMandatory,
					});
				}
				return newDocuments.push(doc);
			});
			state.cacheDocuments = newDocuments;
		},
		updateCacheDocumentPassword: (state, action) => {
			// console.log('updateSelectedDocumentTypeId-', { action });
			const { fileId, password } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = [];
			oldDocuments.map(doc => {
				if (doc.id === fileId) {
					return newDocuments.push({
						...doc,
						password,
					});
				}
				return newDocuments.push(doc);
			});
			state.cacheDocuments = newDocuments;
		},
		updateCacheDocumentProgress: (state, action) => {
			// console.log('updateSelectedDocumentTypeId-', { action });
			const { fileId, progress } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = [];
			oldDocuments.map(doc => {
				if (doc.id === fileId) {
					return newDocuments.push({
						...doc,
						progress,
					});
				}
				return newDocuments.push(doc);
			});
			state.cacheDocuments = newDocuments;
		},
		updateCacheDocumentsFdKey: (state, action) => {
			const { files } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = [];
			oldDocuments.map(doc => {
				const filterFile =
					files?.filter(file => file?.id === doc?.id)?.[0] || {};
				newDocuments.push({
					...doc,
					...filterFile,
				});
				return null;
			});
			state.cacheDocuments = newDocuments;
		},
		// -- CACHE DOCUMENT RELATED ACTIONS

		// API
		addCacheAPIReqRes: (state, action) => {
			const { req, res, path } = action.payload;
			state.api[path] = { req, res };
		},
		// -- API

		addAllDocumentTypes: (state, action) => {
			state.allDocumentTypes = action.payload;
		},
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
	updateCacheDocumentTypeId,
	updateCacheDocumentPassword,
	updateCacheDocumentProgress,
	updateCacheDocumentsFdKey,

	addAllDocumentTypes,
} = applicantSlice.actions;

export default applicantSlice.reducer;
