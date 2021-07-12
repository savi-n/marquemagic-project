import { createContext, useReducer } from "react";

const actionTypes = {
  SET_LOAN_DATA: "SET_LOAN_DATA",
  SET_LOAN_DOCUMENT: "SET_LOAN_DOCUMENT",
  REMOVE_LOAN_DOCUMENT: "REMOVE_LOAN_DOCUMENT",
  SET_DOCUMENT_TYPE: "SET_DOCUMENT_TYPE",
};

const INITIAL_STATE = {};

const useActions = (dispatch) => {
  const setLoanData = (formData, page) => {
    dispatch({
      type: actionTypes.SET_LOAN_DATA,
      formData,
      page,
    });
  };

  const setLoanDocuments = (files) => {
    dispatch({
      type: actionTypes.SET_LOAN_DOCUMENT,
      files,
    });
  };

  const removeLoanDocument = (fileId) => {
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

  return {
    setLoanData,
    setLoanDocuments,
    removeLoanDocument,
    setLoanDocumentType,
  };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOAN_DATA: {
      return {
        ...state,
        [action.page]: action.formData,
      };
    }

    case actionTypes.SET_LOAN_DOCUMENT: {
      return {
        ...state,
        documents: [...(state.documents || []), ...action.files],
      };
    }

    case actionTypes.SET_DOCUMENT_TYPE: {
      const userDocs = (state.documents || []).map((doc) =>
        doc.id === action.fileId ? { ...doc, type: action.fileType } : doc
      );

      return {
        ...state,
        documents: userDocs,
      };
    }

    case actionTypes.REMOVE_LOAN_DOCUMENT: {
      const filteredDocs = (state.documents || []).filter(
        (doc) => doc.id !== action.fileId
      );
      return {
        ...state,
        documents: filteredDocs,
      };
    }

    default: {
      return { ...state };
    }
  }
}

const LoanFormContext = createContext();

const LoanFormProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <LoanFormContext.Provider value={{ state, actions }}>
      {children}
    </LoanFormContext.Provider>
  );
};

export { LoanFormContext, LoanFormProvider };
