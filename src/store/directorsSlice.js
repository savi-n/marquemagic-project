import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

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
	directors: _.cloneDeep(initialDirectorsObject),
	selectedDirector: {},
	selectedDirectorId: '',
	isApplicant: false,
	isEntity: false,
	profileGeoLocation: {},
	documentSelfieGeolocation: {},
	geotaggingMandatory: [],
	directorSectionsIds: [
		'basic_details',
		'address_details',
		'employment_details',
	],
};

const isApplicant = director => {
	return director?.type_name === 'Applicant';
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
		setDirectors: (state, action) => {
			const newDirectors = _.cloneDeep(initialDirectorsObject);
			let newSelectedDirector = _.cloneDeep(initialDirectorsObject);
			action?.payload?.map((director, directorIndex) => {
				if (directorIndex === 0) newSelectedDirector = director;
				const fullName = [];
				if (director.dfirstname) fullName.push(director.dfirstname);
				if (director.dlastname) fullName.push(director.dlastname);
				newDirectors[director.id] = {
					label: `${director.type_name}`,
					fullName: fullName.join(' '),
				};
				return null;
			});
			state.directors = newDirectors;
			state.selectedDirector = newSelectedDirector;
			state.selectedDirectorId = `${newSelectedDirector.id}`;
			state.isApplicant = isApplicant(newSelectedDirector);
		},
		setDirector: (state, action) => {
			if (state.directors[action.payload.id]) {
				state.directors[action.payload.id] = action.payload;
			}
		},
		setSelectedDirector: (state, action) => {
			// action.payload === directorid
			const newDirectorId = `${action.payload}`;
			const newSelectedDirector = state.directors[newDirectorId];
			state.selectedDirectorId = newDirectorId;
			state.selectedDirector = newSelectedDirector;
			state.isApplicant = isApplicant(newSelectedDirector);
			// state.isEntity = isEntity(newSelectedDirector);
		},
		setSelectedDirectorId: (state, action) => {
			// action.payload === directorid
			state.selectedDirectorId = action.payload;
		},
		setSections: (state, action) => {
			if (
				!state.directors[state.selectedDirectorId].sections.includes(
					action.payload
				) &&
				action.payload
			) {
				if (state.directors[state.selectedDirectorId].sections.length === 2) {
					state.directors[
						state.selectedDirectorId
					].isMandatorySectionsCompleted = true;
				}
				state.directors[state.selectedDirectorId].sections.push(action.payload);
			}
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
	setDirectors,
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
