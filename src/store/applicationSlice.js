import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import { APPLICATION_SUBMITTED_SECTION_ID } from 'components/Sections/const';

const initialState = {
	borrowerUserId: '',
	loanRefId: '',
	loanId: '',
	businessId: '',
	businessType: '',
	businessUserId: '',
	loanProductId: '',
	createdByUserId: '',
	businessMobile: '',
	sections: [],
	documents: [],
	cacheDocuments: [],
	allDocumentTypes: [],
	api: {},
	commentsForOfficeUse: '',
	geoLocation: {},
	prompted: false,
	businessName: '',
	dedupePrefilledValues: null,
	// isSelfieImagePresent: false,
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
			state.sections = payload.filter(
				id => id !== APPLICATION_SUBMITTED_SECTION_ID
			);
		},

		// CACHE DOCUMENT RELATED ACTIONS
		addCacheDocument: (state, action) => {
			// pass only single file object
			const { file } = action.payload;
			state.cacheDocuments.push(file);
		},

		addSelfieCacheDocument: (state, { payload }) => {
			const selfieFile = payload;
			const allCacheFiles = _.cloneDeep(state.cacheDocuments);
			const isSelfieAlreadyExists = allCacheFiles?.findIndex(
				selfieDoc =>
					selfieDoc?.directorId === selfieFile?.directorId &&
					selfieDoc?.doc_type.id === selfieFile?.doc_type?.id
			);
			if (isSelfieAlreadyExists >= 0) {
				return;
			} else {
				state.cacheDocuments.push(selfieFile);
			}
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
			const file = action.payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);
			const newDocuments = oldDocuments.filter(doc => {
				if (fileId && doc?.id === fileId) return false;
				// for imd doc deletion,
				if (file?.document_id && file?.document_id === doc?.document_id) {
					return false;
				}
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

		removeProfilePicCacheDocument: (state, { payload }) => {
			const file = payload;
			const oldDocuments = _.cloneDeep(state.cacheDocuments);

			const newDocumentsWithouProfilePic = oldDocuments?.filter(doc => {
				if (
					doc?.doctype === file?.doctype &&
					doc?.doc_name === file?.filename &&
					doc?.doc_id === file?.doc_id
				) {
					return false;
				}
				return true;
			});
			state.cacheDocuments = newDocumentsWithouProfilePic;
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
		setIsPrompted: (state, { payload }) => {
			state.prompted = payload;
		},
		setBusinessType: (state, { payload }) => {
			state.businessType = payload;
		},
		setBusinessMobile: (state, { payload }) => {
			state.businessMobile = payload;
		},
		setBusinessName: (state, { payload }) => {
			state.businessName = payload;
		},
		resetCacheDocuments: state => {
			state.cacheDocuments = [];
		},
		resetOnsiteSelfiImages: (state, { payload }) => {
			const uniqueSelfieDocType = [...new Set(payload)];
			const oldCacheDocs = _.cloneDeep(state.cacheDocuments);
			const newFilteredCacheDocuments = oldCacheDocs?.filter(doc => {
				const docTypeId = doc?.doc_type_id || doc?.doc_type?.id;
				return !uniqueSelfieDocType?.includes(docTypeId);
			});
			state.cacheDocuments = newFilteredCacheDocuments;
		},
		setDedupePrefilledValues: (state, { payload }) => {
			// console.log(payload)
			state.dedupePrefilledValues = payload;
		},
	},
});
export const {
	reInitializeApplicationSlice,

	setLoanIds,
	setCompletedApplicationSection,
	setNewCompletedSections,

	addCacheDocument,
	addSelfieCacheDocument,
	addOrUpdateCacheDocument,
	addOrUpdateCacheDocuments,
	addOrUpdateCacheDocumentsDocUploadPage,
	addCacheDocuments,
	removeCacheDocument,
	// setIsSelifeImagePresent,
	// removeSelfieCacheDocument,
	updateCacheDocumentTypeId,
	updateCacheDocumentPassword,
	updateCacheDocumentProgress,
	updateCacheDocumentsFdKey,
	clearAllCacheDocuments,

	addAllDocumentTypes,
	setBusinessType,
	setBusinessMobile,
	setBusinessName,
	setCommentsForOfficeUse,
	setIsPrompted,
	addCacheAPIReqRes,
	setGeoLocation,
	setDedupePrefilledValues,
	clearCacheDraftModeSectionsData,
	resetCacheDocuments,
	resetOnsiteSelfiImages,
	removeProfilePicCacheDocument,
} = applicationSlice.actions;

export default applicationSlice.reducer;
