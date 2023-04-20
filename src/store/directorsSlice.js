import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

const initialState = {
	directors: {},
	selectedDirector: {},
	selectedDirectorId: '',
	isApplicant: false,
	isEntity: false,
	profileGeoLocation: {},
	documentSelfieGeolocation: {},
	geotaggingMandatory: [],
};

const isApplicant = direcotr => {
	return direcotr?.type_name === 'Applicant';
	// item.type_name === 'Director' ||
	// item.type_name === 'Partner' ||
	// item.type_name === 'Member' ||
	// item.type_name === 'Proprietor'
};

export const directorsSlice = createSlice({
	name: 'directors',
	initialState,
	reducers: {
		reInitializeDirectorsSlice: () => _.cloneDeep(initialState),
		updateDirectors: (state, action) => {
			const newDirectors = {};
			action?.payload?.map(director => {
				newDirectors[director.id] = director;
				return null;
			});
			state.directors = newDirectors;
		},
		updateDirector: (state, action) => {
			state.directors[action.payload.id] = action.payload;
		},
		onSelectDirector: (state, action) => {
			// action.payload === directorid
			const newDirectorId = `${action.payload}`;
			const newSelectedDirector = state.directors[newDirectorId];
			state.selectedDirectorId = newDirectorId;
			state.selectedDirector = newSelectedDirector;
			state.isApplicant = isApplicant(newSelectedDirector);
			// state.isEntity = isEntity(newSelectedDirector);
		},

		// SET GEOLOCATION FOR PROFILE PICTURE
		setProfileGeoLocation: (state, action) => {
			const { address, lat, long, timestamp } = action.payload;
			let geoLocation = { address, lat, long, timestamp };
			state.directors[
				state.selectedDirectorId
			].profileGeoLocation = geoLocation;
		},

		// SET SELFIE DOC GEOLOCATION
		setDocumentSelfieGeoLocation: (state, action) => {
			const { address, lat, long, timestamp } = action.payload;
			let geoLocation = { address, lat, long, timestamp };
			state.directors[
				state.selectedDirectorId
			].documentSelfieGeolocation = geoLocation;
		},

		// REMOVE GEOLOCATION DETAILS ON DELETE OF SELFIE DOC
		removeDocumentSelfieGeoLocation: (state, action) => {
			state.directors[state.selectedDirectorId].documentSelfieGeolocation = {};
		},

		// MAINTAINS ARRAY TO STORE REDUX-KEY-NAME OF FIELDS FOR WHICH GEOLOCATION IS MANDATORY
		setGeotaggingMandatoryFields: (state, action) => {
			const { directorId } = action.payload;
			if (
				!state.directors[directorId].geotaggingMandatory.includes(
					action.payload.field
				)
			) {
				state.directors[directorId].geotaggingMandatory.push(
					action.payload.field
				);
			}
		},
	},
});
export const {
	reInitializeDirectorsSlice,
	updateDirectors,
	updateDirector,
	onSelectDirector,

	setProfileGeoLocation,
	setDocumentSelfieGeoLocation,
	removeDocumentSelfieGeoLocation,
	setGeotaggingMandatoryFields,
} = directorsSlice.actions;

export default directorsSlice.reducer;
