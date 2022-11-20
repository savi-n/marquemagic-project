import { createSlice } from '@reduxjs/toolkit';
import * as CONST_APP_CO_APP_HEADER from 'components/AppCoAppHeader/const';
import _ from 'lodash';

const initialState = {
	profileImageRes: {},
	companyRocData: {},
	panExtractionRes: {},
	applicant: {
		applicantId: '', // applicant directorId
		employmentId: '',
		incomeDataId: '',
		selectedParmanentAddressProofId: '',
		selectedPresentAddressProofId: '',
		cin: '',
	},
	coApplicants: {},
	selectedApplicantCoApplicantId: CONST_APP_CO_APP_HEADER.APPLICANT,
};

export const applicantCoApplicantsSlice = createSlice({
	name: 'applicantCoApplicants',
	initialState,
	reducers: {
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
			const {
				id,
				values,
				applicantId,
				employmentId,
				incomeDataId,
			} = action.payload;
			state.applicant[id] = values;
			if (applicantId) state.applicant.applicantId = applicantId;
			if (employmentId) state.applicant.employmentId = employmentId;
			if (incomeDataId) state.applicant.incomeDataId = incomeDataId;
		},
		updateCoApplicantSection: (state, action) => {
			const {
				directorId,
				id,
				values,
				employmentId,
				incomeDataId,
			} = action.payload;
			if (!state.coApplicants[directorId]) state.coApplicants[directorId] = {};
			state.coApplicants[directorId][id] = values;
			if (employmentId)
				state.coApplicants[directorId].employmentId = employmentId;
			if (incomeDataId)
				state.coApplicants[directorId].incomeDataId = incomeDataId;
		},
		setSelectedApplicantCoApplicantId: (state, action) => {
			state.selectedApplicantCoApplicantId = action.payload;
		},
		setSelectedParmanentAddressProofId: (state, action) => {
			if (
				state.selectedApplicantCoApplicantId ===
				CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				state.applicant.selectedParmanentAddressProofId = action.payload;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].selectedParmanentAddressProofId = action.payload;
			}
		},
		setSelectedPresentAddressProofId: (state, action) => {
			if (
				state.selectedApplicantCoApplicantId ===
				CONST_APP_CO_APP_HEADER.APPLICANT
			) {
				state.applicant.selectedPresentAddressProofId = action.payload;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].selectedPresentAddressProofId = action.payload;
			}
		},
		setProfileImageRes: (state, action) => {
			state.profileImageRes = action.payload;
		},
		setCompanyRocData: (state, action) => {
			state.companyRocData = action.payload;
		},
		setPanExtractionRes: (state, action) => {
			state.panExtractionRes = action.payload;
		},
	},
});

export const {
	updateApplicantSection,
	updateCoApplicantSection,
	setSelectedApplicantCoApplicantId,
	updateApplicantCoApplicantSection,
	setSelectedParmanentAddressProofId,
	setSelectedPresentAddressProofId,
	setProfileImageRes,
	setPanExtractionRes,
} = applicantCoApplicantsSlice.actions;

export default applicantCoApplicantsSlice.reducer;
