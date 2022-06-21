import { createContext, useReducer } from 'react';
import _, { kebabCase } from 'lodash';

import { setStore, getStore } from '../utils/localStore';

const DOCUMENT_REDUCER = 'documentReducer';

const storeData = getStore()[DOCUMENT_REDUCER] || {};

const actionTypes = {
	SET_LOAN_DATA: 'SET_LOAN_DATA',
	SET_LOAN_DOCUMENT: 'SET_LOAN_DOCUMENT',
	REMOVE_LOAN_DOCUMENT: 'REMOVE_LOAN_DOCUMENT',
	SET_DOCUMENT_TYPE: 'SET_DOCUMENT_TYPE',
	REMOVE_ALL_DOCUMENTS: 'REMOVE_ALL_DOCUMENTS',
	SET_KYC_EXTRACT_DOCDETAILS_PAN: 'SET_KYC_EXTRACT_DOCDETAILS_PAN',
	SET_KYC_EXTRACT_DOCDETAILS_OTHER: 'SET_KYC_EXTRACT_DOCDETAILS_OTHER:',
	REMOVE_ALL_ADDRESS_PROOF_DOCUMENTS: 'REMOVE_ALL_ADDRESS_PROOF_DOCUMENTS',
};

const INITIAL_STATE = {};

const useActions = dispatch => {
	const setLoanData = (formData, page) => {
		dispatch({
			type: actionTypes.SET_LOAN_DATA,
			formData,
			page,
		});
	};

	const setLoanDocuments = files => {
		dispatch({
			type: actionTypes.SET_LOAN_DOCUMENT,
			files,
		});
	};

	const removeLoanDocument = fileId => {
		dispatch({
			type: actionTypes.REMOVE_LOAN_DOCUMENT,
			fileId,
		});
	};

	const setLoanDocumentType = (fileId, fileType) => {
		dispatch({
			type: actionTypes.SET_DOCUMENT_TYPE,
			fileId,
			fileType,
		});
	};

	const removeAllLoanDocuments = () => {
		dispatch({
			type: actionTypes.REMOVE_ALL_DOCUMENTS,
		});
	};

	const removeAllAddressProofLoanDocuments = () => {
		dispatch({
			type: actionTypes.REMOVE_ALL_ADDRESS_PROOF_DOCUMENTS,
		});
	};

	const setPanDocDetails = docDetails => {
		dispatch({
			type: actionTypes.SET_KYC_EXTRACT_DOCDETAILS_PAN,
			docDetails,
		});
	};

	const setOtherDocDetails = docDetails => {
		dispatch({
			type: actionTypes.SET_KYC_EXTRACT_DOCDETAILS_OTHER,
			docDetails,
		});
	};

	return {
		setLoanData,
		setLoanDocuments,
		removeLoanDocument,
		setLoanDocumentType,
		removeAllLoanDocuments,
		removeAllAddressProofLoanDocuments,
		setPanDocDetails,
		setOtherDocDetails,
	};
};

function reducer(state, action) {
	let updatedState = state;
	switch (action.type) {
		case actionTypes.SET_LOAN_DATA: {
			updatedState = {
				..._.cloneDeep(state),
				[action.page]: action.formData,
			};
			break;
		}

		case actionTypes.SET_LOAN_DOCUMENT: {
			updatedState = {
				..._.cloneDeep(state),
				documents: [...(state.documents || []), ...action.files],
			};
			break;
		}

		case actionTypes.SET_DOCUMENT_TYPE: {
			const userDocs = (state.documents || []).map(doc =>
				doc.id === action.fileId
					? {
							..._.cloneDeep(doc),
							typeId: action?.fileType?.value,
							typeName: action?.fileType?.name,
							mainType: action?.fileType?.main,
							password: action?.fileType?.password,
					  }
					: doc
			);
			// console.log('action-SET_DOCUMENT_TYPE-', userDocs);
			updatedState = {
				..._.cloneDeep(state),
				documents: userDocs,
			};
			break;
		}

		case actionTypes.REMOVE_LOAN_DOCUMENT: {
			console.log('loanFormDataReducer-REMOVE_LOAN_DOCUMENT-before-', {
				stateDocs: state.documents,
			});
			const filteredDocs = (state.documents || []).filter(
				doc => doc.id !== action.fileId
			);
			updatedState = {
				..._.cloneDeep(state),
				documents: filteredDocs,
			};
			console.log('loanFormDataReducer-REMOVE_LOAN_DOCUMENT-after-', {
				filteredDocs,
				updatedState,
			});
			break;
		}

		case actionTypes.REMOVE_ALL_DOCUMENTS: {
			updatedState = {
				..._.cloneDeep(state),
				documents: [],
			};
			break;
		}

		case actionTypes.REMOVE_ALL_ADDRESS_PROOF_DOCUMENTS: {
			const newDocuments = _.cloneDeep(state?.documents || []);
			updatedState = {
				..._.cloneDeep(state),
				documents: newDocuments.filter(d => d.req_type === 'pan'),
			};
			break;
		}

		case actionTypes.SET_KYC_EXTRACT_DOCDETAILS_PAN: {
			updatedState = {
				..._.cloneDeep(state),
				panDocDetails: [...action.docDetails],
			};
			break;
		}

		case actionTypes.SET_KYC_EXTRACT_DOCDETAILS_OTHER: {
			updatedState = {
				..._.cloneDeep(state),
				otherDocDetails: [...action.docDetails],
			};
			break;
		}

		default: {
			updatedState = { ..._.cloneDeep(state) };
			break;
		}
	}

	setStore(updatedState, DOCUMENT_REDUCER);

	return updatedState;
}

const LoanFormContext = createContext();

const LoanFormProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, {
		...INITIAL_STATE,
		...storeData,
	});
	const actions = useActions(dispatch);

	return (
		<LoanFormContext.Provider value={{ state, actions }}>
			{children}
		</LoanFormContext.Provider>
	);
};

export { LoanFormContext, LoanFormProvider };
