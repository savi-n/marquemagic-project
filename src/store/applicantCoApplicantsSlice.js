import { createSlice } from '@reduxjs/toolkit';
import * as CONST_SECTIONS from 'components/Sections/const';
import _ from 'lodash';

const initializeApplicantCoApplicant = {
	directorId: '', // applicant directorId
	employmentId: '',
	incomeDataId: '',
	businessAddressIdAid1: '',
	businessAddressIdAid2: '',
	selectedPresentAddressProofId: '',
	selectedPresentDocumentTypes: [],
	selectedParmanentAddressProofId: '',
	selectedParmanentDocumentTypes: [],
	isSameAsAboveAddressChecked: false,
	cin: '',
	presentAddressProofExtractionRes: {},
	documents: [],
	documentTypes: [],
	cacheDocuments: [],
	api: {},
	profileGeoLocation: {},
	documentSelfieGeolocation: {},
	geotaggingMandatory: [],
};

const initialState = {
	profileImageRes: {},
	companyRocData: {},
	applicant: _.cloneDeep(initializeApplicantCoApplicant),
	selectedApplicantCoApplicantId: CONST_SECTIONS.APPLICANT,
	isApplicant: true,
	coApplicants: {},
	selectedApplicant: {},
	generateAadhaarOtpResponse: {},
	// verifyOtpResponse: {},
};

export const applicantCoApplicantsSlice = createSlice({
	name: 'applicantCoApplicants',
	initialState,
	reducers: {
		reInitializeApplicantCoApplicantSlice: () => _.cloneDeep(initialState),
		updateApplicantSection: (state, action) => {
			const {
				sectionId,
				sectionValues,
				directorId,
				employmentId,
				incomeDataId,
				businessAddressIdAid1,
				businessAddressIdAid2,
				profileGeoLocation,
				geotaggingMandatory,
			} = action.payload;
			state.applicant[sectionId] = sectionValues;
			if (directorId) state.applicant.directorId = directorId;
			if (employmentId) state.applicant.employmentId = employmentId;
			if (incomeDataId) state.applicant.incomeDataId = incomeDataId;
			if (businessAddressIdAid1)
				state.applicant.businessAddressIdAid1 = businessAddressIdAid1;
			if (businessAddressIdAid2)
				state.applicant.businessAddressIdAid2 = businessAddressIdAid2;
			if (profileGeoLocation)
				state.applicant.profileGeoLocation = profileGeoLocation;
			if (geotaggingMandatory)
				state.applicant.geotaggingMandatory = geotaggingMandatory;
		},
		updateCoApplicantSection: (state, action) => {
			const {
				directorId,
				sectionId,
				sectionValues,
				employmentId,
				incomeDataId,
				businessAddressIdAid1,
				businessAddressIdAid2,
				profileGeoLocation,
				geotaggingMandatory,
			} = action.payload;
			const newCoApplicants = _.cloneDeep(state.coApplicants);
			if (Object.keys(newCoApplicants?.[directorId] || {}).length <= 0) {
				newCoApplicants[directorId] = _.cloneDeep(
					initializeApplicantCoApplicant
				);
			}
			const newCoApplicantValues = newCoApplicants[directorId]
				? _.cloneDeep(newCoApplicants[directorId])
				: _.cloneDeep(initializeApplicantCoApplicant);
			newCoApplicantValues[sectionId] = sectionValues;

			if (directorId) newCoApplicantValues.directorId = directorId;
			if (employmentId) newCoApplicantValues.employmentId = employmentId;
			if (profileGeoLocation)
				newCoApplicantValues.profileGeoLocation = profileGeoLocation;
			if (geotaggingMandatory)
				newCoApplicantValues.geotaggingMandatory = geotaggingMandatory;
			if (incomeDataId) newCoApplicantValues.incomeDataId = incomeDataId;
			if (businessAddressIdAid1)
				newCoApplicantValues.businessAddressIdAid1 = businessAddressIdAid1;
			if (businessAddressIdAid2)
				newCoApplicantValues.businessAddressIdAid2 = businessAddressIdAid2;
			state.coApplicants[directorId] = newCoApplicantValues;
			if (
				state.selectedApplicantCoApplicantId === CONST_SECTIONS.CO_APPLICANT
			) {
				state.selectedApplicantCoApplicantId = directorId;
			}
		},
		setSelectedApplicantCoApplicantId: (state, action) => {
			if (action.payload) {
				state.selectedApplicantCoApplicantId = action.payload;
			}
			state.isApplicant = action.payload === CONST_SECTIONS.APPLICANT;
		},
		setSelectedParmanentAddressProofId: (state, action) => {
			if (state.isApplicant) {
				state.applicant.selectedParmanentAddressProofId = action.payload;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].selectedParmanentAddressProofId = action.payload;
			}
		},
		setSelectedPresentAddressProofId: (state, action) => {
			if (state.isApplicant) {
				state.applicant.selectedPresentAddressProofId = action.payload;
				state.applicant.selectedPresentDocumentTypes =
					CONST_SECTIONS.ADDRESS_PROOF_DOC_TYPE_LIST[action.payload];
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].selectedPresentAddressProofId = action.payload;
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].selectedPresentDocumentTypes =
					CONST_SECTIONS.ADDRESS_PROOF_DOC_TYPE_LIST[action.payload];
			}
		},
		setProfileImageRes: (state, action) => {
			state.profileImageRes = action.payload;
		},
		setCompanyRocData: (state, action) => {
			state.companyRocData = action.payload;
		},
		// setPanExtractionRes: (state, action) => {
		// 	if (state.isApplicant) {
		// 		state.applicant.panExtractionRes = action.payload;
		// 	} else {
		// 		state.coApplicants[
		// 			state.selectedApplicantCoApplicantId
		// 		].panExtractionRes = action.payload;
		// 	}
		// },
		setPresentAddressProofExtractionRes: (state, action) => {
			if (state.isApplicant) {
				state.applicant.presentAddressProofExtractionRes = action.payload;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].presentAddressProofExtractionRes = action.payload;
			}
		},
		setIsSameAsAboveAddressChecked: (state, action) => {
			if (state.isApplicant) {
				state.applicant.isSameAsAboveAddressChecked = action.payload;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].isSameAsAboveAddressChecked = action.payload;
			}
		},

		// DOCUMENT RELATED ACTIONS
		addLoanDocument: (state, action) => {
			// const { file } = action.payload;
			// pass only single file object
			if (state.isApplicant) {
				state.applicant.documents.push(action.payload);
			} else {
				state.coApplicants[state.selectedApplicantCoApplicantId].documents.push(
					action.payload
				);
			}
		},
		addLoanDocuments: (state, action) => {
			// const { files } = action.payload;
			// you can pass array of files
			const oldDocuments = _.cloneDeep(
				state.isApplicant
					? state.applicant.documents
					: state.coApplicants[state.selectedApplicantCoApplicantId].documents
			);

			if (state.isApplicant) {
				state.applicant.documents = [...oldDocuments, ...action.payload];
			} else {
				state.coApplicants[state.selectedApplicantCoApplicantId].documents = [
					...oldDocuments,
					...action.payload,
				];
			}
		},
		removeLoanDocument: (state, action) => {
			const oldDocuments = _.cloneDeep(
				state.isApplicant
					? state.applicant.documents
					: state.coApplicants[state.selectedApplicantCoApplicantId].documents
			);

			if (state.isApplicant) {
				state.applicant.documents = oldDocuments.filter(
					d => d.id !== action.payload
				);
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].documents = oldDocuments.filter(d => d.id !== action.payload);
			}
		},
		removeAllLoanDocuments: state => {
			if (state.isApplicant) {
				state.applicant.documents = [];
			} else {
				state.coApplicants[state.selectedApplicantCoApplicantId].documents = [];
			}
		},
		removeAllAddressProofDocs: state => {
			const oldDocuments = _.cloneDeep(
				state.isApplicant
					? state.applicant.documents
					: state.coApplicants[state.selectedApplicantCoApplicantId].documents
			);
			if (state.isApplicant) {
				state.applicant.documents = oldDocuments.filter(
					d => !CONST_SECTIONS.ADDRESS_PROOF_KEYS.includes(d.req_type)
				);
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].documents = oldDocuments.filter(
					d => !CONST_SECTIONS.ADDRESS_PROOF_KEYS.includes(d.req_type)
				);
			}
		},
		updateSelectedDocumentTypeId: (state, action) => {
			const { fileId, docType } = action.payload;
			const oldDocuments = _.cloneDeep(
				state.isApplicant
					? state.applicant.documents
					: state.coApplicants[state.selectedApplicantCoApplicantId].documents
			);

			const newDocuments = oldDocuments.map(doc =>
				doc.id === fileId
					? {
							...doc,
							...(docType || {}),
							typeId: docType?.value,
							typeName: docType?.name,
							password: docType?.password,
					  }
					: doc
			);

			if (state.isApplicant) {
				state.applicant.documents = newDocuments;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].documents = newDocuments;
			}
		},
		// -- DOCUMENT RELATED ACTIONS

		// CACHE DOCUMENT RELATED ACTIONS
		addCacheDocument: (state, action) => {
			// pass only single file object
			const { file, directorId } = action.payload;
			const selectedDirectorId =
				directorId || state.selectedApplicantCoApplicantId;
			const newDocuments = _.cloneDeep(
				state.isApplicant
					? state?.applicant?.cacheDocuments || []
					: state?.coApplicants?.[selectedDirectorId]?.cacheDocuments || []
			);
			newDocuments.push(file);
			if (state.isApplicant) {
				state.applicant.cacheDocuments = newDocuments;
			} else {
				if (state?.coApplicants?.[selectedDirectorId]) {
					state.coApplicants[selectedDirectorId].cacheDocuments = newDocuments;
				} else {
					const newCoApplicants = _.cloneDeep(state.coApplicants);
					newCoApplicants[selectedDirectorId] = _.cloneDeep(
						initializeApplicantCoApplicant
					);
					newCoApplicants[selectedDirectorId].cacheDocuments = newDocuments;
					state.coApplicants = newCoApplicants;
				}
			}
		},
		addCacheDocuments: (state, action) => {
			const { files, directorId } = action.payload;
			const selectedDirectorId =
				directorId || state.selectedApplicantCoApplicantId;
			const oldDocuments = _.cloneDeep(
				state.isApplicant
					? state.applicant.cacheDocuments
					: state.coApplicants[selectedDirectorId].cacheDocuments
			);
			const newDocuments = [...oldDocuments, ...files];
			if (state.isApplicant) {
				state.applicant.cacheDocuments = newDocuments;
			} else {
				state.coApplicants[selectedDirectorId].cacheDocuments = newDocuments;
			}
		},
		removeCacheDocument: (state, action) => {
			const { fieldName, directorId } = action.payload;
			const selectedDirectorId =
				directorId || state.selectedApplicantCoApplicantId;
			const oldDocuments = _.cloneDeep(
				state.isApplicant
					? state.applicant.cacheDocuments
					: state.coApplicants[selectedDirectorId].cacheDocuments
			);
			const newDocuments = oldDocuments.filter(
				doc => doc?.field?.name !== fieldName
			);
			if (state.isApplicant) {
				state.applicant.cacheDocuments = newDocuments;
			} else {
				state.coApplicants[selectedDirectorId].cacheDocuments = newDocuments;
			}
		},
		// -- CACHE DOCUMENT RELATED ACTIONS

		// DOCUMENT TYPE
		addApplicantDocumentTypes: (state, action) => {
			state.applicant.documentTypes = action.payload;
		},
		addCoApplicantDocumentTypes: (state, action) => {
			const { documentTypes, directorId } = action.payload;
			state.coApplicants[directorId].documentTypes = documentTypes;
		},
		// -- DOCUMENT TYPE

		// API REQ RES RELATED ACTIONS
		setGenerateAadhaarOtp: (state, action) => {
			const selectedDirectorId = state.selectedApplicantCoApplicantId;
			if (state.isApplicant) {
				state.applicant.api.generateOTP.req = action.payload.req;
				state.applicant.api.generateOTP.res = action.payload.res;
			} else {
				state.coApplicants[selectedDirectorId].api.generateOTP.req =
					action.payload.req;
				state.coApplicants[selectedDirectorId].api.generateOTP.req =
					action.payload.req;
			}
		},
		setVerifyOtpResponse: (state, action) => {
			const selectedDirectorId = state.selectedApplicantCoApplicantId;
			if (state.isApplicant) {
				state.applicant.api = {
					verifyOtp: {
						req: action.payload.req,
						res: action.payload.res,
					},
				};
			} else {
				state.coApplicants[selectedDirectorId].api = {
					verifyOtp: {
						req: action.payload.req,
						res: action.payload.res,
					},
				};
			}
		},
		// -- API REQ RES RELATED ACTIONS

		// EDIT LOAN
		setEditLoanApplicantsData: (state, action) => {
			const { editLoanData } = action.payload;
			const applicant =
				editLoanData?.director_details?.filter(d => d?.isApplicant)?.[0] || {};
			const coApplicants =
				editLoanData?.director_details?.filter(
					d =>
						d?.type_name?.toLowerCase() ===
						CONST_SECTIONS.DIRECTOR_TYPE_CO_APPLICANT
				) || [];
			const newApplicantData = {
				..._.cloneDeep(initializeApplicantCoApplicant),
				directorId: applicant?.id,
				employmentId: applicant?.employment_data?.[0]?.id,
				...applicant,
			};
			state.applicant = newApplicantData;
			const newCoApplicants = {};
			coApplicants.map(coApplicant => {
				const newCoApplicantData = {
					..._.cloneDeep(initializeApplicantCoApplicant),
					directorId: coApplicant?.id,
					employmentId: coApplicant?.employment_data?.[0]?.id,
					...coApplicant,
				};
				newCoApplicants[coApplicant.id] = newCoApplicantData;
				return null;
			});
			state.coApplicants = newCoApplicants;
		},
		// -- EDIT LOAN

		// SET GEOLOCATION FOR PROFILE PICTURE
		setProfileGeoLocation: (state, action) => {
			const { address, lat, long, timestamp } = action.payload;
			let geoLocation = { address, lat, long, timestamp };
			if (state.isApplicant) {
				state.applicant.profileGeoLocation = geoLocation;
			} else {
				// state.coApplicants[
				// 	state.selectedApplicantCoApplicantId
				// ].profileGeoLocation = geoLocation;
			}
		},

		// SET SELFIE DOC GEOLOCATION
		setDocumentSelfieGeoLocation: (state, action) => {
			const { address, lat, long, timestamp } = action.payload;
			let geoLocation = { address, lat, long, timestamp };
			// const selectedDirectorId = state.selectedApplicantCoApplicantId;
			if (state.isApplicant) {
				state.applicant.documentSelfieGeolocation = geoLocation;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].documentSelfieGeolocation = geoLocation;
			}
		},

		// REMOVE GEOLOCATION DETAILS ON DELETE OF SELFIE DOC
		removeDocumentSelfieGeoLocation: (state, action) => {
			if (state.isApplicant) {
				state.applicant.documentSelfieGeolocation = {};
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].documentSelfieGeolocation = {};
			}
		},

		// MAINTAINS ARRAY TO STORE REDUX-KEY-NAME OF FIELDS FOR WHICH GEOLOCATION IS MANDATORY
		setGeotaggingMandatoryFields: (state, action) => {
			const { directorId } = action.payload;

			if (Number(state.applicant.directorId) === Number(directorId)) {
				if (
					!state.applicant.geotaggingMandatory.includes(action.payload.field)
				) {
					state.applicant.geotaggingMandatory.push(action.payload.field);
				}
			} else {
				if (
					!state.coApplicants[directorId].geotaggingMandatory.includes(
						action.payload.field
					)
				) {
					state.coApplicants[directorId].geotaggingMandatory.push(
						action.payload.field
					);
				}
			}
		},
	},
});
export const {
	reInitializeApplicantCoApplicantSlice,
	updateApplicantSection,
	updateCoApplicantSection,
	setSelectedApplicantCoApplicantId,
	setSelectedParmanentAddressProofId,
	setSelectedPresentAddressProofId,
	// setPanExtractionRes,
	setProfileImageRes,
	setIsSameAsAboveAddressChecked,
	setPresentAddressProofExtractionRes,
	setCompanyRocData,

	addLoanDocument,
	addLoanDocuments,
	removeLoanDocument,
	removeAllLoanDocuments,
	updateSelectedDocumentTypeId,
	removeAllAddressProofDocs,

	addCacheDocument,
	addCacheDocuments,
	removeCacheDocument,

	setGenerateAadhaarOtp,
	setVerifyOtpResponse,

	addApplicantDocumentTypes,
	addCoApplicantDocumentTypes,
	setProfileGeoLocation,
	setDocumentSelfieGeoLocation,
	removeDocumentSelfieGeoLocation,
	setEditLoanApplicantsData,
	setGeotaggingMandatoryFields,
} = applicantCoApplicantsSlice.actions;

export default applicantCoApplicantsSlice.reducer;
