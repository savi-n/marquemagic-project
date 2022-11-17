import { createSlice } from '@reduxjs/toolkit';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import _ from 'lodash';

const initialState = {
	applicantId: '', // applicant directorId
	applicant: {},
	coApplicants: {},
	selectedApplicantCoApplicantId: CONST_APP_CO_APP_HEADER.APPLICANT,
};

export const applicantCoApplicantsSlice = createSlice({
	name: 'applicantCoApplicants',
	initialState,
	reducers: {
		updateApplicant: (state, action) => {
			const { id, values } = action.payload;
			const newApplicant = state.applicant;
			state.applicant = { ...newApplicant, ...values };
			if (id) state.applicantId = id;
		},
		updateApplicantCoApplicantSection: (state, action) => {
			const { id, values } = action.payload;
			if (
				state.selectedApplicantCoApplicantId ===
				CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				state.applicant[id] = values;
			} else {
				const { directorId } = action.payload;
				const newSectionData = _.cloneDeep(state.coApplicants);
				if (!newSectionData[directorId]) newSectionData[directorId] = {};
				state.coApplicants[directorId][id] = values;
			}
		},
		updateApplicantSection: (state, action) => {
			const { id, values } = action.payload;
			state.applicant[id] = values;
		},
		updateCoApplicantSection: (state, action) => {
			const { directorId, id, values } = action.payload;
			const newSectionData = state.coApplicants;
			if (!newSectionData[directorId]) newSectionData[directorId] = {};
			state.coApplicants[directorId][id] = values;
		},
		setSelectedApplicantCoApplicantId: (state, action) => {
			state.selectedApplicantCoApplicantId = action.payload;
		},
	},
});

export const {
	updateApplicant,
	updateApplicantSection,
	updateCoApplicantSection,
	setSelectedApplicantCoApplicantId,
	updateApplicantCoApplicantSection,
} = applicantCoApplicantsSlice.actions;

export default applicantCoApplicantsSlice.reducer;
