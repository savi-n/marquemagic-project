import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { API_END_POINT } from '_config/app.config';
import axios from 'axios';
import _ from 'lodash';
import {
	BASIC_DETAILS_SECTION_ID,
	DOCUMENT_UPLOAD_SECTION_ID,
} from 'components/Sections/const';

import { getDirectorFullName, getShortString } from 'utils/formatData';

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
		};
		try {
			const directorsRes = await axios.get(
				`${API_END_POINT}/director_details?loan_ref_id=${loanRefId}`
			);
			// return directorsRes?.data?.data || [];
			res.existingDirectors = directorsRes?.data?.data || [];
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
			const newSelectedDirectorOptions = [];
			const sortedDirectors = existingDirectors?.sort(
				(a, b) => a?.type_name - b?.type_name
			);
			let newIsEntity = true;
			sortedDirectors?.map((director, directorIndex) => {
				const fullName = getDirectorFullName(director);
				const directorId = `${director?.id || ''}`;
				const newSections = [
					...(prevState?.directors?.[directorId]?.sections || []),
				];
				if (!newSections.includes(BASIC_DETAILS_SECTION_ID)) {
					newSections.push(BASIC_DETAILS_SECTION_ID);
				}
				const newDirectorObject = {
					..._.cloneDeep(initialDirectorsObject),
					...director,
					label: `${director.type_name}`,
					fullName,
					shortName: getShortString(fullName, 10),
					sections: newSections,
					directorId,
				};
				newSelectedDirectorOptions.push({
					name: fullName,
					value: directorId,
				});
				newDirectors[directorId] = newDirectorObject;
				if (directorIndex === sortedDirectors.length - 1) {
					lastDirector = newDirectorObject;
				}

				if (newDirectorObject.type_name === DIRECTOR_TYPES.applicant) {
					newIsEntity = false;
					applicantDirector = newDirectorObject;
				}
				return null;
			});
			// console.log("PrevState",!prevState.selectedDirectorId);
			if (prevState.selectedDirectorId) {
				// console.log(newDirectors);
				const prevDirector = newDirectors[state.selectedDirectorId];
				// console.log(prevDirector);
				state.selectedDirectorId = `${prevDirector?.directorId || ''}`;
			} else if (prevState.addNewDirectorKey) {
				state.selectedDirectorId = '';
				// DON'T Update any state;
			} else if (!prevState.selectedDirectorId) {
				state.selectedDirectorId = `${lastDirector.directorId || ''}`;
			}
			state.isEntity = newIsEntity;
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
					!newDirectors[selectedDirectorId].sections.includes(payload) &&
					payload
				) {
					newDirectors[selectedDirectorId].sections.push(payload);
					if (newDirectors[selectedDirectorId].sections.length === 3) {
						newDirectors[
							selectedDirectorId
						].isMandatorySectionsCompleted = true;
					}
				}
				state.directors = newDirectors;
			} catch (e) {
				console.log('error-setCompletedDirectorSection-', e);
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
	setSelectedDirectorId,
	setCompletedDirectorSection,
	setNewCompletedDirectorSections,

	setProfileGeoLocation,
	setDocumentSelfieGeoLocation,
	removeDocumentSelfieGeoLocation,
	setGeotaggingMandatoryFields,
} = directorsSlice.actions;

export default directorsSlice.reducer;
