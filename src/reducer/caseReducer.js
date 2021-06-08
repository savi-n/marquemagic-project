import { createContext, useReducer } from "react";

const actionTypes = {
  SET_CASE_DETAILS: "SET_CASE_DETAILS",
};

const INITIAL_STATE = {
  caseDetails: null,
};

const useActions = (dispatch) => {
  const setCase = (caseDetails) => {
    dispatch({ type: actionTypes.SET_CASE_DETAILS, caseDetails });
  };

  return { setCase };
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_CASE_DETAILS: {
      return {
        ...state,
        caseDetails: action.caseDetails,
      };
    }

    default: {
      return { ...state };
    }
  }
}

const CaseContext = createContext();

const CaseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
  });
  const actions = useActions(dispatch);

  return (
    <CaseContext.Provider value={{ state, actions }}>
      {children}
    </CaseContext.Provider>
  );
};

export { CaseContext, CaseProvider };
