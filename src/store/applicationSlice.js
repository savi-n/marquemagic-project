import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

const initialState = {
	borrowerUserId: '',
	loanRefId: '',
	loanId: '',
	businessId: '',
	businessType: '',
	businessUserId: '',
	loanProductId: '',
	createdByUserId: '',
	sections: [],
	documents: [],
	cacheDocuments: [],
	allDocumentTypes: [],
	api: {},
	commentsForOfficeUse: '',
	geoLocation: {},
	prompted: false,
};

export const applicationSlice = createSlice({
	name: 'application',
	initialState,
	reducers: {
		reInitializeApplicationSlice: () => _.cloneDeep(initialState),
		setLoanIds: (state, action) => {
			const {
				loanRefId,
				loanId,
				businessId,
				businessUserId,
				loanProductId,
				createdByUserId,
				borrowerUserId,
			} = action.payload;
			if (loanRefId) state.loanRefId = loanRefId;
			if (loanId) state.loanId = loanId;
			if (businessId) state.businessId = businessId;
			if (businessUserId) state.businessUserId = businessUserId;
			if (loanProductId) state.loanProductId = loanProductId;
			if (createdByUserId) state.createdByUserId = createdByUserId;
			if (borrowerUserId) state.borrowerUserId = borrowerUserId;
		},
		setCompletedApplicationSection: (state, { payload }) => {
			// payload === sectionId
			if (!state.sections.includes(payload)) {
				state.sections.push(payload);
			}
		},

		setNewCompletedSections: (state, { payload }) => {
			state.sections = payload;
		},

		// CACHE DOCUMENT RELATED ACTIONS
		addCacheDocument: (state, action) => {
			// pass only single file object
			const { file } = action.payload;
			state.cacheDocuments.push(file);
		},
		addOrUpdateCacheDocument: (state, action) => {
			// pass only single file object
			const { file } = action.payload;
			const newDocuments = _.cloneDeep(state.cacheDocuments);
			const isExistIndex = newDocuments?.findIndex(
				doc =>
					`${doc?.directorId}` === `${file?.directorId}` &&
					`${doc?.doc_type_id}` === `${file?.doc_type_id}`
			);
			if (isExistIndex >= 0) {
				newDocuments[isExistIndex] = file;
			} else {
				newDocuments.push(file);
			}

			state.cacheDocuments = newDocuments;
		},
		addOrUpdateCacheDocuments: (state, action) => {
			const { files } = action.payload;
			const newDocuments = _.cloneDeep(state.cacheDocuments);
			files?.map?.(newFile => {
				// doc =>
				// 	`${doc?.directorId}` === `${newFile?.directorId}` &&
				// 	`${doc?.doc_type_id}` === `${newFile?.doc_type_id}`
				const isExistIndex = newDocuments?.findIndex(
					doc =>
						`${doc?.directorId}` === `${newFile?.directorId}` &&
						(`${doc?.id}` === `${newFile?.document_id}` ||
							`${doc?.id}` === `${newFile?.id}`)
				);
				if (isExistIndex >= 0) {
					newDocuments[isExistIndex] = newFile;
				} else {
					newDocuments.push(newFile);
				}
				return null;
			});
			state.cacheDocuments = newDocuments;
		},
		addOrUpdateCacheDocumentsDocUploadPage: (state, action) => {
			const { files } = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);

			files?.map?.(newFile => {
				const isExistIndex = oldDocuments?.findIndex(doc => {
					if (
						// `${doc?.id}` === `${newFile?.id}` ||
						`${doc?.document_key}` === `${newFile?.document_key}`
					) {
						return true;
					}
					return false;
				});
				if (isExistIndex >= 0) {
					oldDocuments[isExistIndex] = newFile;
				} else {
					oldDocuments.push(newFile);
				}
				return newFile;
			});
			state.cacheDocuments = oldDocuments;
		},

		addCacheDocuments: (state, action) => {
			const { files } = action.payload;
			const newDocuments = _.cloneDeep(state.cacheDocuments);
			files.map(file => {
				newDocuments.push(file);
				return null;
			});
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
		clearAllCacheDocuments: (state, action) => {
			state.cacheDocuments = [];
		},
		// -- CACHE DOCUMENT RELATED ACTIONS

		// API
		addCacheAPIReqRes: (state, action) => {
			const { reqId, res, path } = action.payload;
			if (state.api[path]) {
				state.api[path][reqId] = res;
			} else {
				state.api[path] = {
					[reqId]: res,
				};
			}
		},
		// -- API

		addAllDocumentTypes: (state, action) => {
			state.allDocumentTypes = action.payload;
		},

		setCommentsForOfficeUse: (state, action) => {
			state.commentsForOfficeUse = action.payload;
		},

		clearCacheDraftModeSectionsData: (state, action) => {
			state.sections = {};
		},

		// SET APPLICATION GEOLOCATION
		setGeoLocation: (state, action) => {
			state.geoLocation = action.payload;
		},

		// SET PROMPT (ONCE PER APPLICATION SESSION) TO MOTIVATE USER TO
		// COMPLETE ONSITE VERIFICATION
		setIsPrompted: (state, action) => {
			state.prompted = action.payload;
		},
		setBusinessType: (state, action) => {
			state.businessType = action.payload;
		},
	},
});

export const {
	reInitializeApplicationSlice,

	setLoanIds,
	setCompletedApplicationSection,
	setNewCompletedSections,

	addCacheDocument,
	addOrUpdateCacheDocument,
	addOrUpdateCacheDocuments,
	addOrUpdateCacheDocumentsDocUploadPage,
	addCacheDocuments,
	removeCacheDocument,
	updateCacheDocumentTypeId,
	updateCacheDocumentPassword,
	updateCacheDocumentProgress,
	updateCacheDocumentsFdKey,
	clearAllCacheDocuments,

	addAllDocumentTypes,
	setBusinessType,

	setCommentsForOfficeUse,
	setIsPrompted,
	addCacheAPIReqRes,
	setGeoLocation,
	clearCacheDraftModeSectionsData,
} = applicationSlice.actions;

export default applicationSlice.reducer;
