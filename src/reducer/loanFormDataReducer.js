import { createContext, useReducer } from "react";

const actionTypes = {
  SET_LOAN_DATA: "SET_LOAN_DATA",
  SET_LOAN_DOCUMENT: "SET_LOAN_DOCUMENT",
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

  return {
    setLoanData,
    setLoanDocuments,
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
