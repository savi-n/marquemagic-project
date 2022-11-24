import { createSlice } from '@reduxjs/toolkit';
import * as CONST_SECTIONS from 'components/Sections/const';
import _ from 'lodash';

const initializeApplicantCoApplicant = {
	directorId: '', // applicant directorId
	employmentId: '',
	incomeDataId: '',
	selectedPresentAddressProofId: '',
	selectedPresentDocumentTypes: [],
	selectedParmanentAddressProofId: '',
	selectedParmanentDocumentTypes: [],
	isSameAsAboveAddressChecked: false,
	cin: '',
	panExtractionRes: {},
	presentAddressProofExtractionRes: {},
	documents: [],
	documentTypeList: [],
};

const initialState = {
	profileImageRes: {},
	companyRocData: {},
	applicant: _.cloneDeep(initializeApplicantCoApplicant),
	selectedApplicantCoApplicantId: CONST_SECTIONS.APPLICANT,
	isApplicant: true,
	coApplicants: {},
	generateAadhaarOtpResponse: {},
	verifyOtpResponse: {},
};

export const applicantCoApplicantsSlice = createSlice({
	name: 'applicantCoApplicants',
	initialState,
	reducers: {
		onChangeSelectedApplicantField: (state, action) => {
			const { name, value } = action.payload;
			if (state.isApplicant) {
				state.applicant[name] = value;
			} else {
				state.coApplicants[state.selectedApplicantCoApplicantId][name] = value;
			}
		},
		updateApplicantCoApplicantSection: (state, action) => {
			const { sectionId, sectionValues } = action.payload;
			if (state.isApplicant) {
				state.applicant[sectionId] = sectionValues;
			} else {
				const { directorId } = action.payload;
				const newSectionData = _.cloneDeep(state.coApplicants);
				if (!newSectionData[directorId]) newSectionData[directorId] = {};
				state.coApplicants[directorId][sectionId] = sectionValues;
			}
		},
		updateApplicantSection: (state, action) => {
			const {
				sectionId,
				sectionValues,
				directorId,
				employmentId,
				incomeDataId,
			} = action.payload;
			state.applicant[sectionId] = sectionValues;
			if (directorId) state.applicant.directorId = directorId;
			if (employmentId) state.applicant.employmentId = employmentId;
			if (incomeDataId) state.applicant.incomeDataId = incomeDataId;
		},
		updateCoApplicantSection: (state, action) => {
			const {
				directorId,
				sectionId,
				sectionValues,
				employmentId,
				incomeDataId,
			} = action.payload;
			const newCoApplicants = _.cloneDeep(state.coApplicants);
			const newCoApplicantValues = newCoApplicants[directorId]
				? _.cloneDeep(newCoApplicants[directorId])
				: _.cloneDeep(initializeApplicantCoApplicant);
			newCoApplicantValues[sectionId] = sectionValues;
			if (directorId) newCoApplicantValues.directorId = directorId;
			if (employmentId) newCoApplicantValues.employmentId = employmentId;
			if (incomeDataId) newCoApplicantValues.incomeDataId = incomeDataId;
			console.log('updateCoApplicantSection-', {
				newCoApplicantValues,
				sectionId,
				action,
			});
			state.coApplicants[directorId] = newCoApplicantValues;
			state.selectedApplicantCoApplicantId = directorId;
		},
		updateApplicationSection: (state, action) => {
			const { id, values } = action.payload;
			state.sections[id] = values;
		},
		setSelectedApplicantCoApplicantId: (state, action) => {
			state.selectedApplicantCoApplicantId = action.payload;
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
				].selectedParmanentDocumentTypes =
					CONST_SECTIONS.ADDRESS_PROOF_DOC_TYPE_LIST[action.payload];
			}
		},
		setProfileImageRes: (state, action) => {
			state.profileImageRes = action.payload;
		},
		setCompanyRocData: (state, action) => {
			state.companyRocData = action.payload;
		},
		setPanExtractionRes: (state, action) => {
			if (state.isApplicant) {
				state.applicant.panExtractionRes = action.payload;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].panExtractionRes = action.payload;
			}
		},
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
			const oldDocuments = state.isApplicant
				? state.applicant.documents
				: state.coApplicants[state.selectedApplicantCoApplicantId].documents;

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
			const oldDocuments = state.isApplicant
				? state.applicant.documents
				: state.coApplicants[state.selectedApplicantCoApplicantId].documents;

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
			const oldDocuments = state.isApplicant
				? state.applicant.documents
				: state.coApplicants[state.selectedApplicantCoApplicantId].documents;
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
			console.log('updateSelectedDocumentTypeId-', { action });
			const { fileId, docType } = action.payload;
			const oldDocuments = state.isApplicant
				? state.applicant.documents || []
				: state.coApplicants[state.selectedApplicantCoApplicantId].documents ||
				  [];
			const newDocuments = oldDocuments.map(doc =>
				doc.id === fileId
					? {
							..._.cloneDeep(doc),
							..._.cloneDeep(docType || {}),
							typeId: docType?.value,
							typeName: docType?.name,
							password: docType?.password,
					  }
					: doc
			);
			console.log('updateSelectedDocumentTypeId-', {
				oldDocuments,
				newDocuments,
			});
			if (state.isApplicant) {
				state.applicant.documents = newDocuments;
			} else {
				state.coApplicants[
					state.selectedApplicantCoApplicantId
				].documents = newDocuments;
			}
			console.log('updateSelectedDocumentTypeId-', { oldDocuments });
		},
		setGenerateAadhaarOtpResponse: (state, action) => {
			state.generateAadhaarOtpResponse = action.payload;
		},
		setVerifyOtpResponse: (state, action) => {
			state.verifyOtpResponse = action.payload;
		},
		// -- DOCUMENT RELATED ACTIONS
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
	setIsSameAsAboveAddressChecked,
	setPresentAddressProofExtractionRes,
	setCompanyRocData,
	setGenerateAadhaarOtpResponse,
	setVerifyOtpResponse,

	addLoanDocument,
	addLoanDocuments,
	removeLoanDocument,
	removeAllLoanDocuments,
	updateApplicationSection,
	updateSelectedDocumentTypeId,
	removeAllAddressProofDocs,
} = applicantCoApplicantsSlice.actions;

export default applicantCoApplicantsSlice.reducer;
