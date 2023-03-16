import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

/*
bankDetailsFinId,
	fin_type = Bank Account
	fin_id pass this id in api for update
emiDetailsFinId
	fin_type = Outstanding Loans
	fin_id pass this id in api for update
*/

const initialState = {
	borrowerUserId: '',
	loanRefId: '',
	loanId: '',
	businessId: '',
	businessUserId: '',
	loanProductId: '',
	createdByUserId: '',
	loanAssetsId: '',
	assetsAdditionalId: '',
	refId1: '',
	refId2: '',
	bankDetailsFinId: '',
	emiDetailsFinId: '',
	businessAddressIdAid1: '',
	businessAddressIdAid2: '',
	sections: {},
	documents: [],
	cacheDocuments: [],
	allDocumentTypes: [],
	api: {},
	commentsForOfficeUse: '',
	geoLocation: {},
	prompted: false,
};

export const applicantSlice = createSlice({
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
				loanAssetsId,
				assetsAdditionalId,
				refId1,
				refId2,
				bankDetailsFinId,
				emiDetailsFinId,
				businessAddressIdAid1,
				businessAddressIdAid2,
				borrowerUserId,
			} = action.payload;
			if (loanRefId) state.loanRefId = loanRefId;
			if (loanId) state.loanId = loanId;
			if (businessId) state.businessId = businessId;
			if (businessUserId) state.businessUserId = businessUserId;
			if (loanProductId) state.loanProductId = loanProductId;
			if (createdByUserId) state.createdByUserId = createdByUserId;
			if (loanAssetsId) state.loanAssetsId = loanAssetsId;
			if (assetsAdditionalId) state.assetsAdditionalId = assetsAdditionalId;
			if (refId1) state.refId1 = refId1;
			if (refId2) state.refId2 = refId2;
			if (bankDetailsFinId) state.bankDetailsFinId = bankDetailsFinId;
			if (emiDetailsFinId) state.emiDetailsFinId = emiDetailsFinId;
			if (businessAddressIdAid1)
				state.businessAddressIdAid1 = businessAddressIdAid1;
			if (businessAddressIdAid2)
				state.businessAddressIdAid2 = businessAddressIdAid2;
			if (borrowerUserId) state.borrowerUserId = borrowerUserId;
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
						`${doc?.id}` === `${newFile?.id}` ||
						`${doc?.document_key}` === `${newFile?.doc_name}`
					)
						return doc;
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
	},
});

export const {
	reInitializeApplicationSlice,

	setLoanIds,
	updateApplicationSection,

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

	setCommentsForOfficeUse,
	setIsPrompted,
	addCacheAPIReqRes,
	setGeoLocation,
	clearCacheDraftModeSectionsData,
} = applicantSlice.actions;

export default applicantSlice.reducer;
