import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_END_POINT } from '_config/app.config';
import axios from 'axios';
import _ from 'lodash';

import {
	getDirectorFullName,
	getShortString,
	isDirectorApplicant,
} from 'utils/formatData';

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
	selectedDirector: {},
	selectedDirectorId: '',
	selectedDirectorIsApplicant: false,
	selectedDirectorIsEntity: false,
	addNewDirectorKey: '',
	directorSectionsIds: [
		'basic_details',
		'address_details',
		'employment_details',
	],
};

export const getDirectors = createAsyncThunk(
	'getDirectors',
	async (businessId, { rejectWithValue }) => {
		try {
			const directorsRes = await axios.get(
				`${API_END_POINT}/director_details?business_id=${businessId}`
			);
			return directorsRes?.data?.data || [];
		} catch (error) {
			return rejectWithValue(error.message);
		}
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
			state.fetchingDirectors = false;
			state.fetchingDirectorsSuccess = true;
			const newDirectors = {};
			let selectedDefaultDirector = {};
			const sortedDirectors = payload?.sort(
				(a, b) => a?.type_name - b?.type_name
			);
			sortedDirectors?.map((director, directorIndex) => {
				const fullName = getDirectorFullName(director);
				const newDirectorObject = {
					..._.cloneDeep(initialDirectorsObject),
					...director,
					label: `${director.type_name}`,
					fullName: getDirectorFullName(director),
					shortName: getShortString(fullName, 10),
				};
				newDirectors[director.id] = newDirectorObject;
				if (directorIndex === 0) {
					selectedDefaultDirector = newDirectorObject;
				}
				return null;
			});
			state.directors = newDirectors;
			if (!state.selectedDirectorId) {
				state.selectedDirectorId = `${selectedDefaultDirector.id}`;
				state.selectedDirector = selectedDefaultDirector;
				state.selectedDirectorIsApplicant = isDirectorApplicant(
					selectedDefaultDirector
				);
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
		setSelectedDirector: (state, { payload }) => {
			// action.payload === directorid
			const newDirectorId = `${payload}`;
			const newSelectedDirector = state.directors[newDirectorId];
			state.selectedDirectorId = newDirectorId;
			state.selectedDirector = newSelectedDirector;
			state.selectedDirectorIsApplicant = isDirectorApplicant(
				newSelectedDirector
			);
			// state.isEntity = isEntity(newSelectedDirector);
		},
		setSelectedDirectorId: (state, { payload }) => {
			// action.payload === directorid
			state.selectedDirectorId = payload;
		},
		setSections: (state, { payload }) => {
			if (
				!state.directors[state.selectedDirectorId].sections.includes(payload) &&
				payload
			) {
				if (state.directors[state.selectedDirectorId].sections.length === 2) {
					state.directors[
						state.selectedDirectorId
					].isMandatorySectionsCompleted = true;
				}
				state.directors[state.selectedDirectorId].sections.push(payload);
			}
		},

		// SET GEOLOCATION FOR PROFILE PICTURE
		setProfileGeoLocation: (state, { payload }) => {
			const { address, lat, long, timestamp } = payload;
			let geoLocation = { address, lat, long, timestamp };
			state.directors[
				state.selectedDirectorId
			].profileGeoLocation = geoLocation;
		},

		// SET SELFIE DOC GEOLOCATION
		setDocumentSelfieGeoLocation: (state, { payload }) => {
			const { address, lat, long, timestamp } = payload;
			let geoLocation = { address, lat, long, timestamp };
			state.directors[
				state.selectedDirectorId
			].documentSelfieGeolocation = geoLocation;
		},

		// REMOVE GEOLOCATION DETAILS ON DELETE OF SELFIE DOC
		removeDocumentSelfieGeoLocation: (state, { payload }) => {
			state.directors[state.selectedDirectorId].documentSelfieGeolocation = {};
		},

		// MAINTAINS ARRAY TO STORE REDUX-KEY-NAME OF FIELDS FOR WHICH GEOLOCATION IS MANDATORY
		setGeotaggingMandatoryFields: (state, { payload }) => {
			const { directorId } = payload;
			if (
				!state.directors[directorId].geotaggingMandatory.includes(payload.field)
			) {
				state.directors[directorId].geotaggingMandatory.push(payload.field);
			}
		},
	},
});

export const {
	reInitializeDirectorsSlice,
	setAddNewDirectorKey,
	setDirector,
	setSelectedDirector,
	setSelectedDirectorId,
	setSections,

	setProfileGeoLocation,
	setDocumentSelfieGeoLocation,
	removeDocumentSelfieGeoLocation,
	setGeotaggingMandatoryFields,
} = directorsSlice.actions;

export default directorsSlice.reducer;
