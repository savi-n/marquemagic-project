import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { API_END_POINT } from '_config/app.config';
import axios from 'axios';
import _ from 'lodash';
import {
	// BASIC_DETAILS_SECTION_ID,
	DOCUMENT_UPLOAD_SECTION_ID,
} from 'components/Sections/const';

import {
	getDirectorFullName,
	getShortString,
	checkInitialDirectorsUpdated,
	getSelectedDirectorIndex,
} from 'utils/formatData';

export const DIRECTOR_TYPES = {
	applicant: 'Applicant',
	coApplicant: 'Co-applicant',
	director: 'Director',
	partner: 'Partner',
	guarantor: 'Guarantor',
	trustee: 'Trustee',
	member: 'Member',
	proprietor: 'Proprietor',
};
const BUSINESS_TYPES = {
	1: 'Proprietor', // 1: Sole Proprietorship
	2: 'Partner', // 2: Partnership
	3: 'Partner', // 3: LLP
	4: 'Director', // 4: Private Limited
	5: 'Director', // 5: Public Limited
	6: 'Member', // 6: Others
	9: 'Trustee', // 9: Trust
	10: 'Member', // 10: Society
	11: 'Member', // 11: Associations
};

const initialDirectorsObject = {
	// if length of sections is 3 then it's validated
	sections: [
		// 'basic_details',
		// 'address_details',
		// 'employment_details',
	],
	isMandatorySectionsCompleted: false,
	profileGeoLocation: {},
	documentSelfieGeolocation: {},
	onSiteSelfieGeoLocation: {},
	geotaggingMandatory: [],
};

const initialState = {
	directors: {},
	fetchingDirectors: false,
	fetchingDirectorsSuccess: false,
	fetchingDirectorsErrorMessage: false,
	selectedDirectorId: '',
	applicantDirectorId: '',
	isEntity: false,
	selectedDirectorIsEntity: false,
	addNewDirectorKey: '',
	selectedDirectorOptions: [],
	smeType: null,
};

export const getDirectors = createAsyncThunk(
	'getDirectors',
	async (data, { rejectWithValue }) => {
		const {
			loanRefId,
			isSelectedProductTypeBusiness,
			selectedSectionId,
		} = data;
		const res = {
			existingDirectors: [],
			isSelectedProductTypeBusiness,
			selectedSectionId,
			completedDirectorSections: {},
		};
		try {
			const directorsRes = await axios.get(
				`${API_END_POINT}/director_details?loan_ref_id=${loanRefId}`
			);
			// return directorsRes?.data?.data || [];
			const existingDirectors = directorsRes?.data?.data?.directors || [];

			const completedDirectorSections =
				JSON.parse(directorsRes?.data?.data?.trackData?.[0]?.onboarding_track)
					?.director_details || {};

			existingDirectors?.map(director => {
				director.directorId = director?.id;
				director.sections = completedDirectorSections?.[+director?.id];
				return null;
			});
			res.existingDirectors = existingDirectors;
		} catch (error) {
			// return [];
			// return rejectWithValue(error.message);
		}
		return res;
	}
);

export const directorsSlice = createSlice({
	name: 'directors',
	initialState,
	extraReducers: {
		[getDirectors.pending]: state => {
			state.fetchingDirectors = true;
		},
		[getDirectors.fulfilled]: (state, { payload }) => {
			const {
				existingDirectors,
				isSelectedProductTypeBusiness,
				selectedSectionId,
			} = payload;
			const prevState = current(state);
			state.fetchingDirectors = false;
			state.fetchingDirectorsSuccess = true;
			const newDirectors = {};
			let applicantDirector = {};
			let lastDirector = {};
			let firstDirector = {};
			const directorOptions = [];
			const newSelectedDirectorOptions = [];
			const sortedDirectors = existingDirectors?.sort(
				(a, b) => a?.type_name - b?.type_name
			);
			let newIsEntity = true;
			sortedDirectors?.map((director, directorIndex) => {
				const fullName = getDirectorFullName(director);
				const directorId = `${director?.id || ''}`;
				// const newSections = [
				// 	...(prevState?.directors?.[directorId]?.sections || []),
				// ];
				// if (!newSections.includes(BASIC_DETAILS_SECTION_ID)) {
				// 	newSections.push(BASIC_DETAILS_SECTION_ID);
				// }

				// const newSections = updatedDirectors?.[+directorId]?.sections || [];
				let newDirectorObject = {
					..._.cloneDeep(initialDirectorsObject),
					...director,
					// label: `${director?.type_name}`,
					label: `${
						director?.type_name === DIRECTOR_TYPES.coApplicant
							? director?.type_name
							: BUSINESS_TYPES[state.smeType] || director?.type_name
					}`,
					fullName,
					shortName: getShortString(fullName, 10),
					// sections: newSections,
					directorId,
					onSiteSelfieGeoLocation:
						prevState?.directors?.[directorId]?.onSiteSelfieGeoLocation || {},
				};
				directorOptions.push({
					// name: `${director.type_name}|${fullName}`,
					name: `${
						director?.type_name === DIRECTOR_TYPES.coApplicant
							? director?.type_name
							: BUSINESS_TYPES[state.smeType] || director?.type_name
					}|${fullName}`,
					value: directorId,
				});
				// console.log(prevState,"prev state");
				newDirectors[directorId] = newDirectorObject;
				// state[directorId].onSiteSelfieGeoLocation= prevState.directors[directorId]?.onSiteSelfieGeoLocation;
				if (directorIndex === sortedDirectors?.length - 1) {
					lastDirector = newDirectorObject;
				}
				if (directorIndex === 0) {
					firstDirector = newDirectorObject;
				}

				if (newDirectorObject?.type_name === DIRECTOR_TYPES.applicant) {
					newIsEntity = false;
					applicantDirector = newDirectorObject;
				}
				return null;
			});
			directorOptions.forEach(director => {
				const directorFullName = director?.name?.split('|');
				const directorIndex = getSelectedDirectorIndex({
					directors: newDirectors,
					selectedDirector: newDirectors[director.value],
				});
				let newName = directorFullName[0];
				if (directorIndex) {
					newName += ' ' + directorIndex;
				}
				newName += ' - ' + directorFullName[1];
				newSelectedDirectorOptions.push({
					...director,
					name: newName,
				});
			});
			// console.log("PrevState",!prevState.selectedDirectorId);
			// console.log(prevState);
			if (prevState.selectedDirectorId) {
				const prevDirector = newDirectors[state.selectedDirectorId];
				state.selectedDirectorId = `${prevDirector?.directorId || ''}`;
			} else if (prevState.addNewDirectorKey) {
				state.selectedDirectorId = '';
				// DON'T Update any state;
			} else if (!prevState.selectedDirectorId) {
				if (
					isSelectedProductTypeBusiness &&
					checkInitialDirectorsUpdated(newDirectors)
				) {
					state.selectedDirectorId = `${firstDirector?.directorId || ''}`;
				} else {
					state.selectedDirectorId = `${lastDirector.directorId || ''}`;
				}
			}

			state.isEntity = newIsEntity;
			// state.selectedDirectorId= prevState?.directors?.selectedDirectorId;
			state.directors = newDirectors;
			state.selectedDirectorOptions = newSelectedDirectorOptions;
			state.applicantDirectorId =
				`${applicantDirector?.directorId || ''}` || '';

			if (newSelectedDirectorOptions.length === 0) {
				if (isSelectedProductTypeBusiness) {
					state.addNewDirectorKey = DIRECTOR_TYPES.director;
				} else {
					state.addNewDirectorKey = DIRECTOR_TYPES.applicant;
				}
			} else {
				// multiple driector exist
				if (
					isSelectedProductTypeBusiness &&
					selectedSectionId === DOCUMENT_UPLOAD_SECTION_ID
				) {
					state.addNewDirectorKey = '';
					state.selectedDirectorId = '';
				}
			}
		},
		[getDirectors.rejected]: (state, { payload }) => {
			state.fetchingDirectors = false;
			state.fetchingDirectorsSuccess = false;
			state.fetchingDirectorsErrorMessage = payload;
		},
	},

	reducers: {
		reInitializeDirectorsSlice: () => _.cloneDeep(initialState),
		setSmeType: (state, { payload }) => {
			console.log('set sme called, but why?', { payload });
			state.smeType = payload;
		},
		setDirector: (state, { payload }) => {
			if (state.directors[payload.id]) {
				state.directors[payload.id] = payload;
			}
		},
		setAddNewDirectorKey: (state, { payload }) => {
			state.addNewDirectorKey = payload;
		},
		setSelectedDirectorId: (state, { payload }) => {
			// action.payload === directorid
			state.selectedDirectorId = payload || '';
		},
		setCompletedDirectorSection: (state, { payload }) => {
			try {
				const currentState = current(state);
				const { selectedDirectorId } = currentState;
				const newDirectors = _.cloneDeep(currentState.directors);
				if (
					!newDirectors?.[selectedDirectorId]?.sections?.includes(payload) &&
					payload
				) {
					newDirectors?.[selectedDirectorId]?.sections?.push(payload);
					if (newDirectors?.[selectedDirectorId]?.sections?.length === 3) {
						newDirectors[
							selectedDirectorId
						].isMandatorySectionsCompleted = true;
					}
				}
				state.directors = newDirectors;
			} catch (e) {
				console.error('error-setCompletedDirectorSection-', e);
			}
		},
		setNewCompletedDirectorSections: (state, { payload }) => {
			// payload --> accepts object with directorId's as keys and array of completed sections as values for all the directors eg: {999888: [basic_details, address_details]}
			const currentState = current(state);
			const { directors } = currentState;
			const newDirectors = _.cloneDeep(directors);

			Object.keys(payload).map(dir => {
				if (newDirectors?.hasOwnProperty(dir)) {
					newDirectors[dir].sections = payload?.[dir];
				}
				return null;
			});
			state.directors = newDirectors;
		},

		// SET GEOLOCATION FOR PROFILE PICTURE
		setProfileGeoLocation: (state, { payload }) => {
			const { address, lat, long, timestamp } = payload;
			let geoLocation = { address, lat, long, timestamp };
			if (state?.directors[state?.selectedDirectorId]?.profileGeoLocation) {
				state.directors[
					state.selectedDirectorId
				].profileGeoLocation = geoLocation;
			}
		},

		// SET SELFIE DOC GEOLOCATION
		setDocumentSelfieGeoLocation: (state, { payload }) => {
			const { address, lat, long, timestamp } = payload;
			let geoLocation = { address, lat, long, timestamp };
			if (
				state?.directors[state?.selectedDirectorId]?.documentSelfieGeolocation
			) {
				state.directors[
					state.selectedDirectorId
				].documentSelfieGeolocation = geoLocation;
			}
		},

		setOnSiteSelfieGeoLocation: (state, { payload }) => {
			const { address, lat, long, timestamp, directorId, err, hint } = payload;
			if (!!state?.directors?.[directorId]) {
				state.directors[directorId].onSiteSelfieGeoLocation = {
					address,
					lat,
					long,
					timestamp,
					err,
					hint,
				};
			}
		},

		removeOnSiteSelfieGeoLocation: (state, { payload }) => {
			if (
				state?.directors[state?.selectedDirectorId]?.onSiteSelfieGeoLocation
			) {
				state.directors[state.selectedDirectorId].onSiteSelfieGeoLocation = {};
			}
		},
		// REMOVE GEOLOCATION DETAILS ON DELETE OF SELFIE DOC
		removeDocumentSelfieGeoLocation: (state, { payload }) => {
			if (
				state?.directors[state?.selectedDirectorId]?.documentSelfieGeolocation
			) {
				state.directors[
					state.selectedDirectorId
				].documentSelfieGeolocation = {};
			}
		},

		// MAINTAINS ARRAY TO STORE REDUX-KEY-NAME OF FIELDS FOR WHICH GEOLOCATION IS MANDATORY
		setGeotaggingMandatoryFields: (state, { payload }) => {
			if (
				!state.directors[
					(state?.selectedDirectorId)
				]?.geotaggingMandatory?.includes(payload?.field)
			) {
				state?.directors[state?.selectedDirectorId]?.geotaggingMandatory?.push(
					payload?.field
				);
			}
		},
	},
});

export const {
	reInitializeDirectorsSlice,
	setAddNewDirectorKey,
	setDirector,
	setSmeType,
	setSelectedDirectorId,
	removeOnSiteSelfieGeoLocation,
	setCompletedDirectorSection,
	setNewCompletedDirectorSections,
	setOnSiteSelfieGeoLocation,
	setProfileGeoLocation,
	setDocumentSelfieGeoLocation,
	removeDocumentSelfieGeoLocation,
	setGeotaggingMandatoryFields,
} = directorsSlice.actions;

export default directorsSlice.reducer;
